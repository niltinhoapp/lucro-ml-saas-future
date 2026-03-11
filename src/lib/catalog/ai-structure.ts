export type AIExtractedCatalogItem = {
  sku: string | null;
  productName: string;
  displayName?: string;
  supplierCost: number;
  extractionConfidence?: "alta" | "media" | "baixa";
  needsReview?: boolean;
};

type AIExtractedCatalogResponse = {
  items: AIExtractedCatalogItem[];
};

function cleanJsonText(raw: string) {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractTextFromResponsesApi(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data?.output)) {
    const parts: string[] = [];

    for (const block of data.output) {
      if (!Array.isArray(block?.content)) continue;

      for (const content of block.content) {
        if (typeof content?.text === "string" && content.text.trim()) {
          parts.push(content.text.trim());
        } else if (
          typeof content?.output_text === "string" &&
          content.output_text.trim()
        ) {
          parts.push(content.output_text.trim());
        }
      }
    }

    if (parts.length) return parts.join("\n").trim();
  }

  return "";
}

function cleanText(value: unknown) {
  return typeof value === "string"
    ? value.replace(/\s{2,}/g, " ").trim()
    : "";
}

function normalizeSku(value: unknown): string | null {
  const raw = cleanText(value);
  if (!raw) return null;

  const normalized = raw.toUpperCase();

  const looksLikeSku =
    /^[A-Z]{1,6}-[A-Z0-9]{1,16}(?:-[A-Z0-9]{1,16}){0,3}$/.test(normalized) ||
    /^[A-Z]{2,8}[0-9]{2,8}[A-Z0-9-]{0,10}$/.test(normalized);

  return looksLikeSku ? normalized : null;
}

function normalizeName(value: unknown, sku: string | null) {
  const raw = cleanText(value);

  if (!raw) {
    return sku ? `Produto sem nome claro (${sku})` : "";
  }

  const normalized = raw
    .replace(/\s{2,}/g, " ")
    .replace(/^[\-–—:;\s]+/, "")
    .replace(/[\-–—:;\s]+$/, "")
    .trim();

  return normalized || (sku ? `Produto sem nome claro (${sku})` : "");
}

function normalizePrice(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Number(value.toFixed(2)) : 0;
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/[R$\s]/gi, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(",", ".");

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) && parsed > 0
      ? Number(parsed.toFixed(2))
      : 0;
  }

  return 0;
}

function estimateExtractionConfidence(args: {
  sku: string | null;
  productName: string;
  supplierCost: number;
}) {
  const { sku, productName, supplierCost } = args;

  if (sku && productName && supplierCost > 0) return "alta";
  if (productName && supplierCost > 0) return "media";
  return "baixa";
}

function normalizeItem(item: any): AIExtractedCatalogItem | null {
  const rawProductName =
    typeof item?.productName === "string"
      ? item.productName
      : typeof item?.name === "string"
      ? item.name
      : "";

  const sku = normalizeSku(item?.sku);
  const productName = normalizeName(rawProductName, sku);
  const displayName =
    cleanText(item?.displayName) || normalizeName(rawProductName, sku);

  const supplierCost = normalizePrice(item?.supplierCost ?? item?.cost ?? 0);

  if (!productName) return null;
  if (!Number.isFinite(supplierCost) || supplierCost <= 0) return null;

  const extractionConfidence = estimateExtractionConfidence({
    sku,
    productName,
    supplierCost,
  });

  const needsReview =
    extractionConfidence === "baixa" ||
    productName.toLowerCase().includes("sem nome claro");

  return {
    sku,
    productName,
    displayName,
    supplierCost,
    extractionConfidence,
    needsReview,
  };
}

function dedupeItems(items: AIExtractedCatalogItem[]) {
  const deduped = new Map<string, AIExtractedCatalogItem>();

  for (const item of items) {
    const key = [
      (item.sku || "").toLowerCase(),
      item.productName.toLowerCase(),
      item.supplierCost.toFixed(2),
    ].join("::");

    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  }

  return Array.from(deduped.values());
}

function buildPrompt(extractedText: string) {
  return [
    "Você receberá o texto extraído de um catálogo de fornecedor.",
    "Sua tarefa é identificar produtos reais e devolver apenas JSON válido.",
    "",
    "Regras obrigatórias:",
    "- Retorne SOMENTE JSON válido, sem explicação, sem markdown, sem comentários.",
    '- Formato exato: {"items":[{"sku":string|null,"productName":string,"displayName":string,"supplierCost":number}]}',
    "- Identifique apenas produtos reais do catálogo.",
    "- Ignore índice, política de compra, cabeçalhos, rodapés, URLs, WhatsApp, telefone, páginas, bullets técnicos soltos e textos institucionais.",
    "- Associe SKU, nome e preço do mesmo produto mesmo que estejam em linhas diferentes.",
    "- Se houver mais de um preço próximo, escolha o preço unitário mais provável.",
    "- Não invente itens.",
    "- Se não tiver confiança mínima, ignore o item.",
    "- supplierCost deve ser número decimal.",
    "- productName deve ser o nome do item.",
    "- displayName deve ser um nome limpo para exibição ao usuário.",
    "- sku pode ser null se realmente não existir.",
    "",
    "Texto do catálogo:",
    extractedText.slice(0, 18000),
  ].join("\n");
}

export async function extractCatalogItemsWithAI(
  extractedText: string
): Promise<AIExtractedCatalogItem[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("[catalog/ai] OPENAI_API_KEY ausente; IA desativada");
    return [];
  }

  const text = typeof extractedText === "string" ? extractedText.trim() : "";
  if (!text) {
    console.log("[catalog/ai] texto extraído vazio; nada para estruturar");
    return [];
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const prompt = buildPrompt(text);

  console.log("[catalog/ai] chamando Responses API com modelo:", model);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Você extrai itens de catálogos de fornecedores e responde apenas JSON válido.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      max_output_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("[catalog/ai] erro API:", response.status, errText);
    throw new Error(`OPENAI_API_${response.status}`);
  }

  const data = await response.json();
  const rawText = extractTextFromResponsesApi(data);

  console.log("[catalog/ai] preview resposta:", rawText.slice(0, 1200));

  if (!rawText) {
    console.log("[catalog/ai] resposta vazia da API");
    return [];
  }

  try {
    const parsed = JSON.parse(cleanJsonText(rawText)) as AIExtractedCatalogResponse;
    const items = Array.isArray(parsed?.items) ? parsed.items : [];

    const normalized = items
      .map(normalizeItem)
      .filter(Boolean) as AIExtractedCatalogItem[];

    const result = dedupeItems(normalized);

    console.log("[catalog/ai] itens estruturados:", result.length);
    console.log("[catalog/ai] preview itens:", result.slice(0, 15));

    return result;
  } catch (error) {
    console.error("[catalog/ai] falha ao parsear JSON da IA:", error);
    return [];
  }
}