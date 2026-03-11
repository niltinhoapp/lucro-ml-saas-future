// src/app/dashboard/catalogos/[id]/CatalogDetailClient.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  CatalogDbAnalysis,
  CatalogDbItem,
  CatalogDbSummary,
} from "@/lib/catalog/db";

type Props = {
  catalog: CatalogDbSummary;
  items: CatalogDbItem[];
  analysis: CatalogDbAnalysis[];
};

type Row = {
  item: CatalogDbItem;
  analysis?: CatalogDbAnalysis;
};

type GroupedRow = {
  groupName: string;
  category: string;
  count: number;
  items: Row[];
  avgCost: number;
  minCost: number;
  maxCost: number;
  avgMlPrice: number;
  avgMargin: number;
  bestScore: number;
  bestRisk: string | null;
  bestSummary: string;
  reviewCount: number;
  representativeSku: string | null;
};

function brl(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function riskLabel(value: string | null) {
  if (value === "low") return "baixo";
  if (value === "medium") return "moderado";
  if (value === "high") return "alto";
  return "—";
}

function riskClass(value: string | null) {
  if (value === "low") return "good";
  if (value === "medium") return "warn";
  if (value === "high") return "danger";
  return "";
}

function itemDisplayName(item: CatalogDbItem) {
  return item.normalized_name?.trim() || item.raw_name?.trim() || "Item sem nome";
}

function normalizeGroupName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferCategory(name: string) {
  const n = normalizeGroupName(name);

  if (n.includes("ventilador")) return "Ventilação";
  if (n.includes("lanterna")) return "Iluminação";
  if (n.includes("luminaria")) return "Iluminação";
  if (n.includes("holofote")) return "Iluminação";
  if (n.includes("painel solar")) return "Energia solar";
  if (n.includes("sistema de luz solar")) return "Energia solar";
  if (n.includes("cadeado")) return "Segurança";
  if (n.includes("bicicleta")) return "Ciclismo";
  if (n.includes("cantil")) return "Camping";
  if (n.includes("relogio")) return "Relógios";
  if (n.includes("maquina profissional")) return "Beleza";
  if (n.includes("aparador")) return "Beleza";
  if (n.includes("estufa de unha")) return "Beleza";
  if (n.includes("filtro de linha")) return "Energia";
  if (n.includes("regua extensora")) return "Energia";
  if (n.includes("cabo de energia")) return "Energia";
  if (n.includes("maquina de fumaca")) return "Eventos";
  if (n.includes("par led")) return "Eventos";
  if (n.includes("projetor")) return "Eventos";

  return "Geral";
}

function itemRawData(item: CatalogDbItem) {
  return (item.raw_data ?? {}) as Record<string, unknown>;
}

function analysisJson(entry: CatalogDbAnalysis | undefined) {
  return (entry?.analysis ?? {}) as Record<string, unknown>;
}

function asBool(value: unknown) {
  return value === true;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isReviewItem(item: CatalogDbItem, analysis?: CatalogDbAnalysis) {
  const raw = itemRawData(item);
  const meta = analysisJson(analysis);

  const itemNeedsReview = asBool(raw.needsReview);
  const analysisNeedsReview = asBool(meta.needsReview);
  const commercialConfidence = asText(meta.commercialConfidence);
  const extractionConfidence = asText(raw.extractionConfidence);

  return (
    itemNeedsReview ||
    analysisNeedsReview ||
    commercialConfidence === "baixa" ||
    extractionConfidence === "baixa"
  );
}

function confidenceLabel(item: CatalogDbItem, analysis?: CatalogDbAnalysis) {
  const raw = itemRawData(item);
  const meta = analysisJson(analysis);

  const extraction = asText(raw.extractionConfidence);
  const commercial = asText(meta.commercialConfidence);

  if (commercial === "alta" && extraction === "alta") return "alta";
  if (commercial === "baixa" || extraction === "baixa") return "baixa";
  return "média";
}

function confidenceClass(value: string) {
  if (value === "alta") return "good";
  if (value === "média") return "warn";
  if (value === "baixa") return "danger";
  return "";
}

function sourceLabel(item: CatalogDbItem, analysis?: CatalogDbAnalysis) {
  const raw = itemRawData(item);
  const meta = analysisJson(analysis);
  const source = asText(meta.source) || asText(raw.source);

  if (source === "ai") return "IA";
  if (source === "local") return "parser local";
  return "não informado";
}

function buildMlSearchUrl(term: string) {
  const q = encodeURIComponent(term.trim());
  return `https://lista.mercadolivre.com.br/${q}`;
}

function groupRows(rows: Row[]): GroupedRow[] {
  const map = new Map<string, Row[]>();

  for (const row of rows) {
    const display = itemDisplayName(row.item);
    const key = normalizeGroupName(display);

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }

  const groups: GroupedRow[] = Array.from(map.entries()).map(([, items]) => {
    const firstName = itemDisplayName(items[0].item);
    const category = inferCategory(firstName);

    const costs = items.map((r) => Number(r.item.supplier_cost ?? 0));
    const mlPrices = items.map((r) => Number(r.analysis?.ml_price_avg ?? 0));
    const margins = items.map((r) => Number(r.analysis?.estimated_margin ?? 0));
    const scores = items.map((r) => Number(r.analysis?.opportunity_score ?? 0));

    const best = [...items].sort(
      (a, b) =>
        Number(b.analysis?.opportunity_score ?? 0) -
        Number(a.analysis?.opportunity_score ?? 0)
    )[0];

    return {
      groupName: firstName,
      category,
      count: items.length,
      items,
      avgCost: costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0,
      minCost: costs.length ? Math.min(...costs) : 0,
      maxCost: costs.length ? Math.max(...costs) : 0,
      avgMlPrice: mlPrices.length
        ? mlPrices.reduce((a, b) => a + b, 0) / mlPrices.length
        : 0,
      avgMargin: margins.length
        ? margins.reduce((a, b) => a + b, 0) / margins.length
        : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      bestRisk: best?.analysis?.risk_level ?? null,
      bestSummary:
        best?.analysis?.ai_summary ??
        best?.item.notes ??
        "Sem resumo disponível.",
      reviewCount: items.filter(({ item, analysis }) => isReviewItem(item, analysis)).length,
      representativeSku: best?.item.supplier_sku ?? null,
    };
  });

  return groups.sort((a, b) => b.bestScore - a.bestScore);
}

export default function CatalogDetailClient({ catalog, items, analysis }: Props) {
  const analysisMap = useMemo(
    () => new Map(analysis.map((entry) => [entry.item_id, entry])),
    [analysis]
  );

  const rows = useMemo<Row[]>(
    () =>
      items.map((item) => ({
        item,
        analysis: analysisMap.get(item.id),
      })),
    [items, analysisMap]
  );

  const grouped = useMemo(() => groupRows(rows), [rows]);
  const reviewRows = useMemo(
    () => rows.filter(({ item, analysis }) => isReviewItem(item, analysis)),
    [rows]
  );

  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [riskFilter, setRiskFilter] = useState("todos");
  const [onlyPromising, setOnlyPromising] = useState(false);
  const [onlyTrusted, setOnlyTrusted] = useState(false);
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(grouped.map((g) => g.category))).sort()],
    [grouped]
  );

  const filteredGroups = useMemo(() => {
    return grouped.filter((group) => {
      if (categoryFilter !== "Todas" && group.category !== categoryFilter) return false;
      if (riskFilter !== "todos" && group.bestRisk !== riskFilter) return false;
      if (onlyPromising && group.bestRisk !== "low") return false;
      if (onlyTrusted && group.reviewCount > 0) return false;
      if (
        query.trim() &&
        !group.groupName.toLowerCase().includes(query.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [grouped, categoryFilter, riskFilter, onlyPromising, onlyTrusted, query]);

  const promising = analysis.filter((entry) => entry.risk_level === "low").length;
  const avgScore =
    analysis.length > 0
      ? analysis.reduce((acc, entry) => acc + Number(entry.opportunity_score ?? 0), 0) /
        analysis.length
      : 0;

  const avgMargin =
    analysis.length > 0
      ? analysis.reduce((acc, entry) => acc + Number(entry.estimated_margin ?? 0), 0) /
        analysis.length
      : 0;

  const categoryCount = new Set(grouped.map((g) => g.category)).size;
  const bestTrusted = filteredGroups.find((g) => g.reviewCount === 0);

  return (
    <div className="market-page page-wrap">
      <section className="seller-hero seller-hero-overview exec-hero">
        <div className="exec-hero-top">
          <div className="exec-hero-copy">
            <span className="badge pro">Detalhe do catálogo</span>
            <h1 className="exec-title">{catalog.title}</h1>
            <p className="exec-subtitle">
              Aqui você revisa o catálogo de forma agrupada, encontra variações do mesmo
              produto e separa o que parece confiável do que ainda pede revisão.
            </p>
          </div>

          <div className="catalog-detail-actions">
            <Link href="/dashboard/catalogos" className="btn btn-secondary">
              Voltar
            </Link>
            <Link href="/dashboard/simulador" className="btn btn-primary">
              Simular compra
            </Link>
          </div>
        </div>
      </section>

      <section className="catalog-stats-grid">
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Status</div>
          <div className="market-kpi-value">{catalog.status}</div>
        </div>
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Itens extraídos</div>
          <div className="market-kpi-value">{catalog.items_count}</div>
        </div>
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Grupos</div>
          <div className="market-kpi-value">{grouped.length}</div>
        </div>
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Categorias</div>
          <div className="market-kpi-value">{categoryCount}</div>
        </div>
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Promissores</div>
          <div className="market-kpi-value">{promising}</div>
        </div>
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Em revisão</div>
          <div className="market-kpi-value">{reviewRows.length}</div>
        </div>
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Score médio</div>
          <div className="market-kpi-value">{avgScore.toFixed(0)}</div>
        </div>
        <div className="card catalog-stat-card">
          <div className="market-kpi-label">Margem média</div>
          <div className="market-kpi-value">{avgMargin.toFixed(1)}%</div>
        </div>
      </section>

      <section className="card card-premium">
        <div className="card-head">
          <div>
            <h2>Resumo do arquivo</h2>
            <p className="subtitle">
              Tipo: <strong>{catalog.source_type}</strong> • criado em{" "}
              <strong>{new Date(catalog.created_at).toLocaleString("pt-BR")}</strong>
            </p>
          </div>
        </div>

        <div className="catalog-history-meta">
          <span className="pill">Arquivo: {catalog.file_name ?? "—"}</span>
          <span className="pill">
            Última atualização: {new Date(catalog.updated_at).toLocaleString("pt-BR")}
          </span>
          <span className="pill">
            Parse:{" "}
            {catalog.parsed_at
              ? new Date(catalog.parsed_at).toLocaleString("pt-BR")
              : "—"}
          </span>
        </div>

        {bestTrusted ? (
          <div className="alert success" style={{ marginTop: 16 }}>
            Melhor oportunidade filtrada: <strong>{bestTrusted.groupName}</strong> com score{" "}
            <strong>{bestTrusted.bestScore}</strong> e margem média de{" "}
            <strong>{bestTrusted.avgMargin.toFixed(1)}%</strong>.
          </div>
        ) : (
          <div className="alert warn" style={{ marginTop: 16 }}>
            Com o filtro atual, ainda não há grupo suficientemente confiável para destaque.
          </div>
        )}
      </section>

      <section className="card card-premium">
        <div className="card-head">
          <div>
            <h2>Filtros da análise</h2>
            <p className="subtitle">
              Refine por categoria, risco e confiança para enxergar só o que interessa.
            </p>
          </div>
        </div>

        <div className="catalog-filters">
          <div className="catalog-filter-field">
            <label>Buscar produto</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: ventilador, lanterna, painel solar..."
              className="catalog-filter-input"
            />
          </div>

          <div className="catalog-filter-field">
            <label>Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="catalog-filter-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="catalog-filter-field">
            <label>Risco</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="catalog-filter-select"
            >
              <option value="todos">Todos</option>
              <option value="low">Baixo</option>
              <option value="medium">Moderado</option>
              <option value="high">Alto</option>
            </select>
          </div>

          <label className="catalog-check">
            <input
              type="checkbox"
              checked={onlyPromising}
              onChange={(e) => setOnlyPromising(e.target.checked)}
            />
            <span>Só promissores</span>
          </label>

          <label className="catalog-check">
            <input
              type="checkbox"
              checked={onlyTrusted}
              onChange={(e) => setOnlyTrusted(e.target.checked)}
            />
            <span>Só confiáveis</span>
          </label>
        </div>
      </section>

      <section className="card card-premium">
        <div className="card-head">
          <div>
            <h2>Oportunidades agrupadas</h2>
            <p className="subtitle">
              Produtos iguais ou muito parecidos ficam agrupados para reduzir ruído e facilitar
              a decisão.
            </p>
          </div>
        </div>

        {!filteredGroups.length ? (
          <div className="alert warn">Nenhum grupo encontrado com os filtros atuais.</div>
        ) : (
          <div className="catalog-table-wrap">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Variações</th>
                  <th>Custo</th>
                  <th>Preço médio ML</th>
                  <th>Margem média</th>
                  <th>Melhor score</th>
                  <th>Risco</th>
                  <th>ML</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => (
                  <tr key={`${group.category}-${group.groupName}`}>
                    <td>
                      <div className="catalog-product-name">{group.groupName}</div>
                      <div className="catalog-product-meta">
                        SKU base: {group.representativeSku ?? "—"} • revisão:{" "}
                        {group.reviewCount}/{group.count}
                      </div>
                      <div className="catalog-row-summary">{group.bestSummary}</div>
                    </td>
                    <td>{group.category}</td>
                    <td>
                      <strong>{group.count}</strong>
                    </td>
                    <td>
                      {group.minCost === group.maxCost
                        ? brl(group.avgCost)
                        : `${brl(group.minCost)} → ${brl(group.maxCost)}`}
                    </td>
                    <td>{brl(group.avgMlPrice)}</td>
                    <td>{group.avgMargin.toFixed(1)}%</td>
                    <td>
                      <strong>{group.bestScore}</strong>
                    </td>
                    <td>
                      <span className={`badge ${riskClass(group.bestRisk)}`}>
                        {riskLabel(group.bestRisk)}
                      </span>
        <td className="catalog-ml-cell">
  <a
    href={buildMlSearchUrl(group.groupName)}
    target="_blank"
    rel="noreferrer"
    className="catalog-ml-button"
  >
    Analisar no ML
  </a>
</td>       </td>
</tr>                                    
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card card-premium">
        <div className="card-head">
          <div>
            <h2>Itens em revisão</h2>
            <p className="subtitle">
              Itens com confiança menor, nome ambíguo ou estrutura que ainda pede revisão.
            </p>
          </div>
        </div>

        {!reviewRows.length ? (
          <div className="alert success">Nenhum item ficou marcado para revisão.</div>
        ) : (
          <div className="catalog-table-wrap">
            <table className="catalog-table">
              <thead>
                <tr>
                  <th>Produto detectado</th>
                  <th>SKU</th>
                  <th>Custo</th>
                  <th>Confiança</th>
                  <th>Fonte</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {reviewRows.map(({ item, analysis }) => {
                  const confidence = confidenceLabel(item, analysis);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="catalog-product-name">{itemDisplayName(item)}</div>
                        <div className="catalog-product-meta">
                          {item.category ?? inferCategory(itemDisplayName(item))}
                        </div>
                      </td>
                      <td>{item.supplier_sku ?? "—"}</td>
                      <td>{brl(item.supplier_cost)}</td>
                      <td>
                        <span className={`badge ${confidenceClass(confidence)}`}>
                          {confidence}
                        </span>
                      </td>
                      <td>{sourceLabel(item, analysis)}</td>
                      <td className="catalog-row-summary">
                        {analysis?.ai_summary ??
                          item.notes ??
                          "Item marcado para revisão por baixa confiança ou nome ambíguo."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}