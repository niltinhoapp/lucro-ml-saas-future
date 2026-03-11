import Link from "next/link";
import { getBestsellers, getTrendItems } from "@/lib/market/mock";
import ProUpgradeButton from "@/components/pro/ProUpgradeButton";

export default function RadarOportunidades() {
  const trends = getTrendItems();
  const bestsellers = getBestsellers();

  return (
    <div className="market-page page-wrap">
      <section className="seller-hero seller-hero-radar exec-hero">
        <div className="exec-hero-top">
          <div className="exec-hero-copy">
            <span className="badge pro">Radar de oportunidades</span>

            <h1 className="exec-title">
              Encontre produtos e nichos que merecem sua atenção
            </h1>

            <p className="exec-subtitle">
              Use o radar para identificar tendências, observar categorias com
              potencial e descobrir onde ainda pode existir espaço para vender
              com mais inteligência no Mercado Livre.
            </p>

            <div className="exec-hero-proof">
              <span className="pill good">Tendências</span>
              <span className="pill">Mais vendidos</span>
              <span className="pill">Potencial de margem</span>
              <span className="pill">Ideias para entrada</span>
            </div>
          </div>

          <div className="seller-form-card exec-form-card radar-summary-card">
            <div className="radar-summary-kicker">Leitura rápida</div>

            <div className="radar-summary-title">
              Onde pode existir oportunidade agora
            </div>

            <div className="market-summary-list" style={{ marginTop: 14 }}>
              <div className="alert info">
                Nichos com crescimento e competição moderada podem abrir espaço
                para novos testes.
              </div>

              <div className="alert success">
                Produtos que permitem kits tendem a ajudar no aumento do ticket médio.
              </div>

              <div className="alert info">
                O melhor caminho nem sempre é entrar onde todos estão, mas onde
                ainda existe espaço para diferenciação.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="diagnostic-score-card card card-premium">
        <div className="card-head">
          <div className="min-w-0">
            <h2>Resumo do radar</h2>
            <p className="subtitle">
              Uma leitura rápida para entender onde vale olhar primeiro.
            </p>
          </div>

          <span className="badge ok">Radar seller</span>
        </div>

        <div className="exec-kpi-grid diagnostic-kpis">
          <div className="exec-kpi-card tone-good">
            <div className="market-kpi-label">Tendências monitoradas</div>
            <div className="exec-kpi-value">{trends.length}</div>
            <div className="exec-kpi-note">
              Ideias de nicho para acompanhar mais de perto.
            </div>
          </div>

          <div className="exec-kpi-card tone-info">
            <div className="market-kpi-label">Categorias em destaque</div>
            <div className="exec-kpi-value">{bestsellers.length}</div>
            <div className="exec-kpi-note">
              Grupos com maior movimento para observação.
            </div>
          </div>

          <div className="exec-kpi-card">
            <div className="market-kpi-label">Foco recomendado</div>
            <div className="exec-kpi-value">Kits</div>
            <div className="exec-kpi-note">
              Boa forma de buscar diferenciação e valor percebido.
            </div>
          </div>
        </div>
      </section>

      <section className="market-grid-2">
        <div className="card card-premium exec-section-card">
          <div className="card-head">
            <div className="min-w-0">
              <h2>Tendências para observar</h2>
              <p className="subtitle">
                Nichos e sinais que podem indicar oportunidade de entrada.
              </p>
            </div>

            <span className="badge ok">Monitoramento</span>
          </div>

          <div className="market-trend-list">
            {trends.map((item) => (
              <div key={item.term} className="market-trend-item radar-trend-item">
                <div className="min-w-0">
                  <div className="market-trend-title">{item.term}</div>
                  <div className="muted">
                    {item.category} • concorrência {item.competition}
                  </div>
                </div>

                <div className="market-trend-meta">
                  <span className="badge pro">{item.growth}</span>
                  <span className="pill">margem {item.marginPotential}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-premium exec-section-card">
          <div className="card-head">
            <div className="min-w-0">
              <h2>Categorias mais aquecidas</h2>
              <p className="subtitle">
                Produtos e grupos que podem servir como ponto de partida para análise.
              </p>
            </div>

            <span className="badge pro">Entrada</span>
          </div>

          <div className="market-bestseller-grid radar-bestseller-grid">
            {bestsellers.map((group) => (
              <div
                key={group.category}
                className="market-bestseller-card radar-bestseller-card"
              >
                <div className="market-bestseller-title">{group.category}</div>

                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <Link
                  href="/dashboard/kits"
                  className="btn btn-ghost"
                  style={{ marginTop: 14 }}
                >
                  Gerar kit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="market-grid-2">
        <div className="card card-premium exec-section-card">
          <div className="card-head">
            <div className="min-w-0">
              <h2>Como transformar o radar em ação</h2>
              <p className="subtitle">
                O radar fica mais útil quando vira análise prática.
              </p>
            </div>
          </div>

          <div className="market-summary-list">
            <div className="alert info">
              Priorize nichos com crescimento e concorrência administrável.
            </div>

            <div className="alert success">
              Procure produtos que permitam kits para fugir da guerra de preço.
            </div>

            <div className="alert info">
              Valide a oportunidade com simulador e diagnóstico antes de comprar estoque.
            </div>
          </div>
        </div>

        <ProUpgradeButton
          title="Assine o PRO para cruzar radar com kits e lucro real"
          subtitle="Descubra oportunidades, monte combinações e valide margem no mesmo fluxo de trabalho."
        />
      </section>
    </div>
  );
}