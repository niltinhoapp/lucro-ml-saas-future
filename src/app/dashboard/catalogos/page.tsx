import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/supabase/server";
import { getEntitlements } from "@/supabase/entitlements";
import CatalogoAnalyzerClient from "@/components/catalogos/CatalogoAnalyzerClient";
import PlanGate from "@/components/paywall/PlanGate";
import type { CatalogDbSummary } from "@/lib/catalog/db";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

export default async function CatalogosPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard/catalogos");
  }

  const ent = await getEntitlements(supabase, user.id);

  const { data: recentCatalogs, error } = await supabase
    .from("supplier_catalogs")
    .select(
      "id, title, file_name, status, source_type, items_count, parsed_at, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(`Erro ao carregar catálogos: ${error.message}`);
  }

  const catalogs = (recentCatalogs ?? []) as CatalogDbSummary[];
  const analyzedCount = catalogs.filter((item) => item.status === "analyzed").length;
  const totalItems = catalogs.reduce((acc, item) => acc + (item.items_count ?? 0), 0);

  return (
    <PlanGate
      requiredPlan="plus"
      title="Análise de catálogos de fornecedor"
      description="Envie catálogos de fornecedores e descubra quais produtos têm maior potencial de revenda no Mercado Livre."
      bullets={[
        "Transforme PDF em produtos organizados para análise.",
        "Ganhe velocidade para identificar oportunidades de compra.",
      ]}
    >
      <div className="market-page page-wrap">
        <section className="seller-hero seller-hero-overview exec-hero">
          <div className="exec-hero-top">
            <div className="exec-hero-copy">
              <span className="badge pro">Catálogos • PLUS</span>
              <h1 className="exec-title">
                Transforme catálogos de fornecedores em oportunidades de lucro
              </h1>
              <p className="exec-subtitle">
                Envie o catálogo do fornecedor e veja quais produtos merecem sua
                atenção antes de investir em estoque. O objetivo é encontrar com
                mais rapidez o que pode vender bem e deixar margem no Mercado Livre.
              </p>
            </div>
          </div>
        </section>

        <section className="catalog-stats-grid">
          <div className="card catalog-stat-card">
            <div className="market-kpi-label">Plano atual</div>
            <div className="market-kpi-value">{(ent?.plan ?? "free").toUpperCase()}</div>
          </div>
          <div className="card catalog-stat-card">
            <div className="market-kpi-label">Catálogos enviados</div>
            <div className="market-kpi-value">{catalogs.length}</div>
          </div>
          <div className="card catalog-stat-card">
            <div className="market-kpi-label">Catálogos analisados</div>
            <div className="market-kpi-value">{analyzedCount}</div>
          </div>
          <div className="card catalog-stat-card">
            <div className="market-kpi-label">Produtos identificados</div>
            <div className="market-kpi-value">{totalItems}</div>
          </div>
        </section>

        <CatalogoAnalyzerClient />

        <section className="card card-premium">
          <div className="card-head">
            <div>
              <h2>Histórico de análises</h2>
              <p className="subtitle">
                Revise catálogos já enviados, acompanhe leituras anteriores e
                retome análises sem precisar reenviar o arquivo.
              </p>
            </div>
          </div>

          {!catalogs.length ? (
            <div className="alert info">
              Nenhum catálogo enviado ainda. Envie seu primeiro PDF para começar
              a identificar produtos com potencial de lucro no Mercado Livre.
            </div>
          ) : (
            <div className="catalog-history-grid">
              {catalogs.map((catalog) => (
                <Link
                  key={catalog.id}
                  href={`/dashboard/catalogos/${catalog.id}`}
                  className="card catalog-history-card"
                >
                  <div className="catalog-history-top">
                    <span className="badge pro">{catalog.source_type.toUpperCase()}</span>
                    <span className="small">{formatDate(catalog.created_at)}</span>
                  </div>

                  <h3>{catalog.title}</h3>

                  <p className="subtitle">{catalog.file_name ?? "Arquivo sem nome"}</p>

                  <div className="catalog-history-meta">
                    <span className="pill">Status: {catalog.status}</span>
                    <span className="pill">Produtos: {catalog.items_count ?? 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PlanGate>
  );
}