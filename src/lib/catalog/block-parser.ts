import {
  extractPrice,
  isPriceLine,
  isSkuLine,
  isSpecLine,
  looksLikeProductTitle,
  sanitizeCatalogLines,
  cleanLine,
  isQtyBreakLine,
  isCategoryLine,
  isBadProductTitle,
  isCommercialTitle,
  isPromoLine,
} from "./sanitize";

export type ParsedBlockItem = {
  rawBlock: string;
  productName: string;
  displayName: string;
  sku: string | null;
  supplierCost: number;
  specs: string[];
  extractionConfidence: "alta" | "media" | "baixa";
  needsReview: boolean;
};

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function normalizeName(name: string) {
  return cleanLine(name)
    .replace(/\s{2,}/g, " ")
    .replace(/\b(port[áa]til)\b/gi, "Portátil")
    .trim();
}

function findNearestTitleBeforeSku(lines: string[], skuIndex: number) {
  const start = Math.max(0, skuIndex - 12);

  for (let i = skuIndex - 1; i >= start; i--) {
    const line = lines[i];
    if (isCommercialTitle(line)) {
      return normalizeName(line);
    }
  }

  for (let i = skuIndex - 1; i >= start; i--) {
    const line = lines[i];
    if (looksLikeProductTitle(line) && !isBadProductTitle(line)) {
      return normalizeName(line);
    }
  }

  return "";
}

function extractBestProductName(lines: string[], sku: string | null) {
  const skuIndex = sku ? lines.findIndex((line) => line === sku) : -1;

  if (skuIndex >= 0) {
    const nearest = findNearestTitleBeforeSku(lines, skuIndex);
    if (nearest) return nearest;
  }

  const commercial = lines.find(isCommercialTitle);
  if (commercial) {
    return normalizeName(commercial);
  }

  const candidates = lines.filter(
    (line) => looksLikeProductTitle(line) && !isBadProductTitle(line)
  );

  if (!candidates.length) {
    return "";
  }

  return normalizeName(candidates[0]);
}

function detectConfidence(args: {
  hasSku: boolean;
  hasPrice: boolean;
  hasName: boolean;
  specCount: number;
}) {
  const { hasSku, hasPrice, hasName, specCount } = args;

  if (hasSku && hasPrice && hasName && specCount >= 1) return "alta";
  if (hasPrice && hasName) return "media";
  return "baixa";
}

function buildBlock(lines: string[]): ParsedBlockItem | null {
  if (!lines.length) return null;

  const cleaned = lines.filter((line) => {
    const l = cleanLine(line);
    if (!l) return false;
    if (isQtyBreakLine(l)) return false;
    if (isCategoryLine(l)) return false;
    if (isPromoLine(l)) return false;
    if (/^un\.?\s*\d+\s*pcs\/cx:?$/i.test(l)) return false;
    if (/^unid\.?\.?cx:?/i.test(l)) return false;
    return true;
  });

  if (!cleaned.length) return null;

  const rawBlock = cleaned.join("\n");

  const skuLine = cleaned.find(isSkuLine) ?? null;
  const priceLine = cleaned.find(isPriceLine) ?? null;
  const supplierCost = priceLine ? extractPrice(priceLine) : null;
  const specs = unique(cleaned.filter(isSpecLine));
  const productName = extractBestProductName(cleaned, skuLine);
  const displayName = productName;

  if (!supplierCost || supplierCost <= 0) return null;
  if (!productName || isBadProductTitle(productName)) return null;

  const extractionConfidence = detectConfidence({
    hasSku: !!skuLine,
    hasPrice: !!priceLine,
    hasName: !!productName,
    specCount: specs.length,
  });

  const needsReview =
    extractionConfidence !== "alta" ||
    !skuLine ||
    !productName ||
    isBadProductTitle(productName) ||
    !isCommercialTitle(productName);

  return {
    rawBlock,
    productName,
    displayName,
    sku: skuLine,
    supplierCost,
    specs,
    extractionConfidence,
    needsReview,
  };
}

function shouldStartNewBlock(current: string[], nextLine: string) {
  if (!current.length) return false;

  const currentHasPrice = current.some(isPriceLine);
  const currentHasSku = current.some(isSkuLine);
  const nextIsSku = isSkuLine(nextLine);
  const nextIsTitle = looksLikeProductTitle(nextLine);
  const nextIsQty = isQtyBreakLine(nextLine);

  if (nextIsQty && currentHasPrice) return true;
  if (currentHasPrice && nextIsSku) return true;
  if (currentHasPrice && nextIsTitle) return true;
  if (currentHasSku && nextIsSku) return true;

  return false;
}

function dedupeItems(items: ParsedBlockItem[]) {
  const map = new Map<string, ParsedBlockItem>();

  for (const item of items) {
    const key = [
      (item.sku || "").toLowerCase(),
      item.supplierCost.toFixed(2),
      item.displayName.toLowerCase(),
    ].join("::");

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

export function parseCatalogBlocks(text: string): ParsedBlockItem[] {
  const lines = sanitizeCatalogLines(text);
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (!current.length) {
      if (isPriceLine(line) || isQtyBreakLine(line) || isCategoryLine(line)) {
        continue;
      }
      current.push(line);
      continue;
    }

    if (shouldStartNewBlock(current, line)) {
      blocks.push(current);
      current = [];

      if (!isPriceLine(line) && !isQtyBreakLine(line) && !isCategoryLine(line)) {
        current.push(line);
      }
      continue;
    }

    current.push(line);

    if (current.length >= 18 && current.some(isPriceLine)) {
      blocks.push(current);
      current = [];
    }
  }

  if (current.length) {
    blocks.push(current);
  }

  const items = blocks
    .map(buildBlock)
    .filter(Boolean) as ParsedBlockItem[];

  return dedupeItems(items);
}