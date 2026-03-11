import { extractLikelyPdfText } from "./pdf";
import { extractCatalogItemsWithAI } from "./ai-structure";
import { parseCatalogBlocks } from "./block-parser";
import { cleanLine, isSkuLine } from "./sanitize";

export type CatalogRow = {
  rawBlock?: string;
  sku?: string | null;
  productName: string;
  displayName?: string;
  supplierCost: number;
  avgMlPrice: number;
  estimatedFees: number;
  estimatedShipping: number;
  estimatedProfit: number;
  estimatedMargin: number;
  demandScore: number;
  competitionScore: number;
  opportunityScore: number;
  riskLevel: "baixo" | "moderado" | "alto";
  aiSummary: string;
  extractionConfidence?: "alta" | "media" | "baixa";
  commercialConfidence?: "alta" | "media" | "baixa";
  needsReview?: boolean;
  source?: "ai" | "local";
};

export type CatalogSummary = {
  totalRows: number;
  parsedRows: number;
  promisingCount: number;
  reviewCount: number;
  riskyCount: number;
  avgMargin: number;
  avgOpportunity: number;
  extractionQuality: "alta" | "media" | "baixa";
  extractedTextPreview: string;
  highlights: string[];
};

export type CatalogAnalysisResult = {
  fileName: string;
  mode: "structured" | "manual_review";
  summary: CatalogSummary;
  rows: CatalogRow[];
};

type BaseCatalogRow = {
  rawBlock?: string;
  sku: string | null;
  productName: string;
  displayName?: string;
  supplierCost: number;
  extractionConfidence?: "alta" | "media" | "baixa";
  commercialConfidence?: "alta" | "media" | "baixa";
  needsReview?: boolean;
  source?: "ai" | "local";
};

function looksLikeGarbage(text: string) {
  if (!text) return true;
  const sample = text.slice(0, 1500);

  return (
    sample.includes("%PDF-") ||
    /xref|endobj|stream|startxref|obj\b/i.test(sample)
  );
}

function safePreviewText(text: string) {
  if (!text || looksLikeGarbage(text)) {
    return "Não foi possível extrair texto legível deste PDF nesta etapa. Esse arquivo pode ser escaneado, baseado em imagem ou usar um layout fechado.";
  }

  return text.slice(0, 1800);
}

function sanitizeBaseRows(rows: BaseCatalogRow[]) {
  return rows.filter((row) => {
    if (row.sku && !isSkuLine(row.sku)) return false;
    if (!row.productName || cleanLine(row.productName).length < 4) return false;
    if (!Number.isFinite(row.supplierCost) || row.supplierCost <= 0) return false;
    return true;
  });
}

function estimateCommercialConfidence(
  supplierCost: number,
  avgMlPrice: number,
  estimatedMargin: number
): "alta" | "media" | "baixa" {
  if (supplierCost <= 0 || avgMlPrice <= 0) return "baixa";
  if (estimatedMargin < -25 || estimatedMargin > 80) return "baixa";
  if (estimatedMargin < 8 || estimatedMargin > 45) return "media";
  return "alta";
}

function buildCommercialSummary(
  margin: number,
  confidence: "alta" | "media" | "baixa"
) {
  if (confidence === "baixa") {
    return "Estimativa inconsistente. Revise custo, preço de mercado e taxas antes de decidir a compra.";
  }

  if (margin >= 22) {
    return "Boa margem estimada e potencial interessante para validação.";
  }

  if (margin < 10) {
    return "Margem apertada. Vale revisar preço, taxa e frete antes da compra.";
  }

  return "Oportunidade intermediária. Pode funcionar melhor com ajuste de preço.";
}

function estimateMarketplacePrice(supplierCost: number) {
  /**
   * Evita uma multiplicação única para todos os casos.
   * Produtos baratos costumam precisar markup maior para cobrir taxa/frete.
   * Produtos caros costumam operar com markup menor.
   */
  let multiplier = 1.9;

  if (supplierCost <= 5) multiplier = 3.4;
  else if (supplierCost <= 10) multiplier = 3.0;
  else if (supplierCost <= 20) multiplier = 2.55;
  else if (supplierCost <= 40) multiplier = 2.25;
  else if (supplierCost <= 80) multiplier = 2.0;
  else if (supplierCost <= 150) multiplier = 1.85;
  else if (supplierCost <= 300) multiplier = 1.75;
  else multiplier = 1.65;

  return Number((supplierCost * multiplier).toFixed(2));
}

function estimateShipping(avgMlPrice: number, supplierCost: number) {
  if (avgMlPrice < 29) return 8;
  if (avgMlPrice < 79) return 12;
  if (avgMlPrice < 149) return 16;
  if (supplierCost > 300) return 24;
  return 18;
}

function calculateDemandScore(estimatedMargin: number, supplierCost: number) {
  let base = 65;

  if (supplierCost > 300) base -= 8;
  if (supplierCost < 20) base += 6;
  if (estimatedMargin >= 20) base += 10;
  if (estimatedMargin < 8) base -= 12;

  return Math.max(20, Math.min(95, Math.round(base)));
}

function calculateCompetitionScore(supplierCost: number, estimatedMargin: number) {
  let base = 62;

  if (supplierCost < 20) base += 18;
  if (supplierCost >= 20 && supplierCost <= 120) base += 8;
  if (estimatedMargin >= 22) base -= 10;
  if (estimatedMargin < 8) base += 10;

  return Math.max(20, Math.min(95, Math.round(base)));
}

function dedupeFinalRows(rows: CatalogRow[]) {
  const map = new Map<string, CatalogRow>();

  for (const row of rows) {
    const key = [
      (row.sku || "").toLowerCase(),
      (row.displayName || row.productName).toLowerCase(),
      row.supplierCost.toFixed(2),
    ].join("::");

    const existing = map.get(key);

    if (!existing) {
      map.set(key, row);
      continue;
    }

    const existingScore =
      (existing.extractionConfidence === "alta" ? 3 : existing.extractionConfidence === "media" ? 2 : 1) +
      (existing.commercialConfidence === "alta" ? 3 : existing.commercialConfidence === "media" ? 2 : 1) +
      (existing.needsReview ? 0 : 2);

    const currentScore =
      (row.extractionConfidence === "alta" ? 3 : row.extractionConfidence === "media" ? 2 : 1) +
      (row.commercialConfidence === "alta" ? 3 : row.commercialConfidence === "media" ? 2 : 1) +
      (row.needsReview ? 0 : 2);

    if (currentScore > existingScore) {
      map.set(key, row);
    }
  }

  return Array.from(map.values());
}

function enrichRow(row: BaseCatalogRow): CatalogRow {
  const supplierCost = Number(row.supplierCost || 0);

  const avgMlPrice = estimateMarketplacePrice(supplierCost);
  const estimatedFees = Number((avgMlPrice * 0.16).toFixed(2));
  const estimatedShipping = Number(
    estimateShipping(avgMlPrice, supplierCost).toFixed(2)
  );
  const estimatedProfit = Number(
    (avgMlPrice - supplierCost - estimatedFees - estimatedShipping).toFixed(2)
  );
  const estimatedMargin =
    avgMlPrice > 0 ? (estimatedProfit / avgMlPrice) * 100 : 0;

  const demandScore = calculateDemandScore(estimatedMargin, supplierCost);
  const competitionScore = calculateCompetitionScore(supplierCost, estimatedMargin);
  const opportunityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        estimatedMargin * 1.45 +
          demandScore * 0.42 -
          competitionScore * 0.24
      )
    )
  );

  let riskLevel: "baixo" | "moderado" | "alto" = "moderado";
  if (estimatedMargin >= 22) riskLevel = "baixo";
  else if (estimatedMargin < 8) riskLevel = "alto";

  const commercialConfidence = estimateCommercialConfidence(
    supplierCost,
    avgMlPrice,
    estimatedMargin
  );

  const aiSummary = buildCommercialSummary(
    Number(estimatedMargin.toFixed(1)),
    commercialConfidence
  );

  const needsReview =
    row.needsReview ||
    commercialConfidence === "baixa" ||
    !row.sku ||
    !row.productName;

  return {
    rawBlock: row.rawBlock,
    sku: row.sku,
    productName: row.productName,
    displayName: row.displayName || row.productName,
    supplierCost: Number(supplierCost.toFixed(2)),
    avgMlPrice: Number(avgMlPrice.toFixed(2)),
    estimatedFees,
    estimatedShipping,
    estimatedProfit,
    estimatedMargin: Number(estimatedMargin.toFixed(1)),
    demandScore,
    competitionScore,
    opportunityScore,
    riskLevel,
    aiSummary,
    extractionConfidence: row.extractionConfidence || "media",
    commercialConfidence,
    needsReview,
    source: row.source || "local",
  };
}

function buildHighlights(rows: CatalogRow[], aiUnavailable = false): string[] {
  if (!rows.length) {
    return aiUnavailable
      ? [
          "A leitura inteligente do catálogo não pôde ser concluída nesta tentativa.",
          "Foi usada a análise local, mas nenhum item confiável foi estruturado.",
        ]
      : [
          "Nenhum item estruturado foi identificado automaticamente.",
          "Revise a qualidade do PDF ou tente outro arquivo.",
        ];
  }

  const ordered = [...rows].sort((a, b) => b.opportunityScore - a.opportunityScore);
  const top = ordered[0];
  const lowRisk = rows.filter((row) => row.riskLevel === "baixo").length;
  const highRisk = rows.filter((row) => row.riskLevel === "alto").length;
  const lowConfidence = rows.filter(
    (row) => row.commercialConfidence === "baixa" || row.needsReview
  ).length;
  const fromAi = rows.filter((row) => row.source === "ai").length;
  const fromLocal = rows.filter((row) => row.source === "local").length;

  const highlights = [
    `Itens lidos: ${rows.length}.`,
    `Itens com risco baixo: ${lowRisk}.`,
    `Itens com risco alto: ${highRisk}.`,
    `Itens que pedem revisão: ${lowConfidence}.`,
  ];

  if (fromAi > 0) {
    highlights.push(`Itens estruturados com apoio da IA: ${fromAi}.`);
  }

  if (fromLocal > 0) {
    highlights.push(`Itens estruturados pelo parser local: ${fromLocal}.`);
  }

   if (top && !top.needsReview) {
    highlights.push(
      `Melhor oportunidade inicial: ${top.displayName || top.productName} com score ${top.opportunityScore} e margem estimada de ${top.estimatedMargin.toFixed(1)}%.`
    );
  }

  if (aiUnavailable) {
    highlights.push("A IA de estruturação ficou indisponível e o sistema usou análise local.");
  }

  return highlights;
}

function mapAiRows(
  aiRows: Awaited<ReturnType<typeof extractCatalogItemsWithAI>>
): BaseCatalogRow[] {
  return aiRows.map((item) => ({
    rawBlock: item.productName,
    sku: item.sku,
    productName: item.productName,
    displayName: item.displayName || item.productName,
    supplierCost: item.supplierCost,
    extractionConfidence:
      item.extractionConfidence || (item.sku ? "alta" : "media"),
    needsReview: item.needsReview ?? !item.sku,
    source: "ai",
  }));
}

function shouldForceManualReview(rows: CatalogRow[]) {
  if (!rows.length) return true;

  const reviewRatio =
    rows.filter((row) => row.needsReview).length / rows.length;

  const lowCommercialConfidenceRatio =
    rows.filter((row) => row.commercialConfidence === "baixa").length / rows.length;

  const weakNamesRatio =
    rows.filter((row) =>
      /^(led:|tempo de uso:|voltagem:|pot[êe]ncia:|quantidade de leds:|capacidade|dimens[õo]es|acima de \d+ caixas)/i.test(
        (row.displayName || row.productName).trim().toLowerCase()
      )
    ).length / rows.length;

  const localOnly = rows.every((row) => row.source === "local");

  if (localOnly && rows.length > 100) return true;

  return (
    reviewRatio >= 0.35 ||
    lowCommercialConfidenceRatio >= 0.4 ||
    weakNamesRatio >= 0.15
  );
}

export async function analyzeCatalogBuffer(
  fileName: string,
  buffer: Buffer
): Promise<CatalogAnalysisResult> {
  console.log("==================================================");
  console.log("[catalog] analyzeCatalogBuffer iniciado");
  console.log("[catalog] fileName:", fileName);
  console.log("[catalog] buffer.length:", buffer?.length ?? 0);

  const lowerName = fileName.toLowerCase();
  let text = "";
  let aiUnavailable = false;

  try {
    if (lowerName.endsWith(".pdf")) {
      console.log("[catalog] tipo detectado: PDF");
      text = await extractLikelyPdfText(buffer);
    } else {
      console.log("[catalog] tipo detectado: texto simples");
      text = buffer.toString("utf-8");
    }
  } catch (error) {
    console.error("[catalog] erro ao extrair texto:", error);
    text = "";
  }

  console.log("[catalog] tamanho do texto extraído:", text.length);
  console.log("[catalog] preview bruto do texto:");
  console.log(text.slice(0, 2000));
  console.log("[catalog] fim preview bruto");

  const totalRows = text.split(/\r?\n/).filter(Boolean).length;
  let parsedBaseRows: BaseCatalogRow[] = [];

  try {
    const aiRows = await extractCatalogItemsWithAI(text);
    parsedBaseRows = sanitizeBaseRows(mapAiRows(aiRows));
  } catch (error) {
    console.error("[catalog] erro na estruturação por IA:", error);
    aiUnavailable = true;
    parsedBaseRows = [];
  }

  if (!parsedBaseRows.length) {
    const localRows = parseCatalogBlocks(text).map((item) => ({
      rawBlock: item.rawBlock,
      sku: item.sku,
      productName: item.productName,
      displayName: item.displayName,
      supplierCost: item.supplierCost,
      extractionConfidence: item.extractionConfidence,
      needsReview: item.needsReview,
      source: "local" as const,
    }));

    parsedBaseRows = sanitizeBaseRows(localRows);
    console.log("[catalog] fallback local rows válidas:", parsedBaseRows.length);
  }

  console.log("[catalog] total de rows base:", parsedBaseRows.length);
  console.log("[catalog] preview rows base:", parsedBaseRows.slice(0, 20));

  const rows = dedupeFinalRows(parsedBaseRows.map(enrichRow));

  const promisingCount = rows.filter((r) => r.riskLevel === "baixo").length;
  const reviewCount = rows.filter((r) => r.needsReview).length;
  const riskyCount = rows.filter((r) => r.riskLevel === "alto").length;

  const avgMargin = rows.length
    ? Number(
        (
          rows.reduce((acc, row) => acc + row.estimatedMargin, 0) / rows.length
        ).toFixed(1)
      )
    : 0;

  const avgOpportunity = rows.length
    ? Number(
        (
          rows.reduce((acc, row) => acc + row.opportunityScore, 0) / rows.length
        ).toFixed(1)
      )
    : 0;

  const highExtraction = rows.filter((r) => r.extractionConfidence === "alta").length;
  const extractionQuality: "alta" | "media" | "baixa" =
    rows.length === 0
      ? "baixa"
      : highExtraction / rows.length >= 0.6
      ? "alta"
      : highExtraction / rows.length >= 0.3
      ? "media"
      : "baixa";

  const mode: "structured" | "manual_review" = shouldForceManualReview(rows)
    ? "manual_review"
    : "structured";

  const result: CatalogAnalysisResult = {
    fileName,
    mode,
    summary: {
      totalRows,
      parsedRows: rows.length,
      promisingCount,
      reviewCount,
      riskyCount,
      avgMargin,
      avgOpportunity,
      extractionQuality,
      extractedTextPreview: safePreviewText(text),
      highlights: buildHighlights(rows, aiUnavailable),
    },
    rows,
  };

  console.log("[catalog] resultado final summary:", result.summary);
  console.log("[catalog] mode final:", result.mode);
  console.log("[catalog] analyzeCatalogBuffer finalizado");

  return result;
}