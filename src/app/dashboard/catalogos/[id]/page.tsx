// src/app/dashboard/catalogos/[id]/page.tsx
import { notFound } from "next/navigation";
import { createServerClient } from "@/supabase/server";
import type {
  CatalogDbAnalysis,
  CatalogDbItem,
  CatalogDbSummary,
} from "@/lib/catalog/db";
import CatalogDetailClient from "./CatalogDetailClient";

export default async function CatalogoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: catalog } = await supabase
    .from("supplier_catalogs")
    .select(
      "id, title, file_name, status, source_type, items_count, parsed_at, created_at, updated_at"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<CatalogDbSummary>();

  if (!catalog) notFound();

  const { data: itemsData } = await supabase
    .from("supplier_catalog_items")
    .select(
      "id, raw_name, normalized_name, supplier_sku, brand, category, supplier_cost, min_qty, unit, notes, raw_data, created_at"
    )
    .eq("catalog_id", catalog.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const items = (itemsData ?? []) as CatalogDbItem[];
  const itemIds = items.map((item) => item.id);

  const { data: analysisData } = itemIds.length
    ? await supabase
        .from("catalog_item_analysis")
        .select(
          "id, item_id, ml_search_term, ml_price_avg, ml_price_min, ml_price_max, estimated_fees, estimated_shipping, estimated_margin, estimated_profit, demand_score, competition_score, opportunity_score, risk_level, analysis, ai_summary, created_at, updated_at"
        )
        .in("item_id", itemIds)
        .eq("user_id", user.id)
    : { data: [] as CatalogDbAnalysis[] };

  return (
    <CatalogDetailClient
      catalog={catalog}
      items={items}
      analysis={((analysisData ?? []) as CatalogDbAnalysis[]) ?? []}
    />
  );
}