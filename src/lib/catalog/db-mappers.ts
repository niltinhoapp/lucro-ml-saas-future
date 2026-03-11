import type { CatalogRow } from "./analyze";

export function mapRowToCatalogDbItem(row: CatalogRow) {
  return {
    raw_name: row.productName,
    normalized_name: row.displayName || row.productName,
    supplier_sku: row.sku || null,
    brand: null,
    category: null,
    supplier_cost: row.supplierCost,
    min_qty: null,
    unit: null,
    notes: row.needsReview
      ? "Item marcado para revisão automática."
      : null,
    raw_data: {
      rawBlock: row.rawBlock || null,
      extractionConfidence: row.extractionConfidence || null,
      commercialConfidence: row.commercialConfidence || null,
      needsReview: !!row.needsReview,
      source: row.source || "local",
    },
  };
}

export function mapRowToCatalogDbAnalysis(itemId: string, row: CatalogRow) {
  return {
    item_id: itemId,
    ml_search_term: row.displayName || row.productName,
    ml_price_avg: row.avgMlPrice,
    ml_price_min: Number((row.avgMlPrice * 0.9).toFixed(2)),
    ml_price_max: Number((row.avgMlPrice * 1.1).toFixed(2)),
    estimated_fees: row.estimatedFees,
    estimated_shipping: row.estimatedShipping,
    estimated_margin: row.estimatedMargin,
    estimated_profit: row.estimatedProfit,
    demand_score: row.demandScore,
    competition_score: row.competitionScore,
    opportunity_score: row.opportunityScore,
    risk_level: row.riskLevel,
    analysis: {
      extractionConfidence: row.extractionConfidence || null,
      commercialConfidence: row.commercialConfidence || null,
      needsReview: !!row.needsReview,
      source: row.source || "local",
    },
    ai_summary: row.aiSummary,
  };
}