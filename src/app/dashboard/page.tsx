import Link from "next/link";
import { createServerClient } from "@/supabase/server";
import { getEntitlements } from "@/supabase/entitlements";

const quickActions = [
  {
    title: "Enviar catálogo",
    href: "/dashboard/catalogos",
    plan: "PLUS",
    desc: "Descubra produtos com potencial a partir de catálogos de fornecedores.",
  },
  {
    title: "Ver lucro real",
    href: "/dashboard/diagnostico",
    plan: "PRO",
    desc: "Entenda onde taxas, frete e devoluções estão reduzindo sua margem.",
  },
  {
    title: "Simular compra",
    href: "/dashboard/simulador",
    plan: "PRO",
    desc: "Veja se um lote pode deixar lucro ou travar seu caixa antes da compra.",
  },
];

const workSections = [
  {
    title: "Lucro e operação",
    items: [
      {
        label: "Diagnóstico de lucro",
        href: "/dashboard/diagnostico",
        desc: "Veja onde sua margem está vazando e quais pontos merecem correção.",
      },
      {
        label: "Lucro real e DRE",
        href: "/dashboard/historico",
        desc: "Entenda quanto realmente sobra nas vendas depois de custos e taxas.",
      },
      {
        label: "Fluxo de caixa",
        href: "/dashboard/fluxo-caixa",
        desc: "Acompanhe a operação financeira e tenha mais clareza sobre entradas e saídas.",
      },
      {
        label: "Full vs Flex",
        href: "/dashboard/full-vs-flex",
        desc: "Compare logística e veja qual modelo tende a deixar mais lucro.",
      },
    ],
  },
  {
    title: "Produtos e oportunidades",
    items: [
      {
        label: "Catálogos de fornecedor",
        href: "/dashboard/catalogos",
        desc: "Envie PDF e identifique produtos com potencial de revenda.",
      },
      {
        label: "Radar de oportunidades",
        href: "/dashboard/radar",
        desc: "Encontre nichos e produtos que merecem sua atenção.",
      },
      {
        label: "Inteligência de mercado",
        href: "/dashboard/inteligencia",
        desc: "Analise demanda, concorrência e contexto antes de comprar ou testar.",
      },
      {
        label: "Gerador de kits",
        href: "/dashboard/kits",
        desc: "Crie combinações para aumentar ticket médio e valor percebido.",
      },
    ],
  },
  {
    title: "Compra e estoque",
    items: [
      {
        label: "Simulador de compra",
        href: "/dashboard/simulador",
        desc: "Simule lote, margem, giro e retorno antes de investir.",
      },
    ],
  },
];

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlan = "PREVIEW";
  if (user) {
    const ent = await getEntitlements(supabase, user.id);
    currentPlan = ent.plan === "free" ? "PREVIEW" : ent.plan.toUpperCase();
  }

  return (
    <div className="market-page page-wrap premium-dashboard-home">
      <section className="premium-home-hero card card-premium">
        <div className="premium-home-copy">
          <span className="badge pro">Central de decisão</span>

          <h1 className="exec-title">
            Sua área de trabalho para vender com mais clareza no Mercado Livre
          </h1>

          <p className="exec-subtitle">
            Escolha o que você quer resolver agora: encontrar oportunidades,
            entender seu lucro real ou simular uma compra antes de investir.
          </p>

          <div className="checkout-proof premium-home-proof">
            <span className="pill good">Plano atual: {currentPlan}</span>
            <span className="pill">PRO mensal R$ 29,90</span>
            <span className="pill">PLUS mensal R$ 79,90</span>
            <span className="pill">PLUS anual e vitalício</span>
          </div>
        </div>

        <div className="premium-home-actions">
          <Link href="/dashboard/catalogos" className="btn btn-primary">
            Enviar catálogo
          </Link>

          <Link href="/dashboard/ajuda" className="btn btn-ghost">
            Abrir ajuda
          </Link>
        </div>
      </section>

      <section className="premium-module-grid">
        {quickActions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card card-premium premium-module-card"
          >
            <div className="premium-module-top">
              <span className={`badge ${item.plan === "PLUS" ? "pro" : ""}`.trim()}>
                {item.plan}
              </span>
              <span className="pill">Ação rápida</span>
            </div>

            <h3>{item.title}</h3>
            <p className="muted">{item.desc}</p>

            <div className="premium-module-footer">
              <span className="small">Abrir agora</span>
            </div>
          </Link>
        ))}
      </section>

      {workSections.map((section) => (
        <section key={section.title} className="card card-premium" style={{ marginTop: 24 }}>
          <div className="card-head">
            <div>
              <h2>{section.title}</h2>
              <p className="subtitle">
                Ferramentas organizadas para facilitar sua rotina e sua tomada de decisão.
              </p>
            </div>
          </div>

          <div className="premium-module-grid">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card card-premium premium-module-card"
              >
                <h3>{item.label}</h3>
                <p className="muted">{item.desc}</p>

                <div className="premium-module-footer">
                  <span className="small">Abrir módulo</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="market-grid-2 premium-home-bottom">
        <div className="card card-premium exec-section-card">
          <span className="badge">Ajuda para seller</span>

          <h2 style={{ marginTop: 14 }}>
            Ficou com dúvida em alguma etapa?
          </h2>

          <p className="muted" style={{ marginTop: 10 }}>
            A ajuda foi criada para orientar o seller sem complicar a interface.
            Use quando precisar concluir um processo com mais segurança.
          </p>

          <div className="pro-upgrade-actions" style={{ marginTop: 18 }}>
            <Link href="/dashboard/ajuda" className="btn btn-primary">
              Abrir ajuda
            </Link>
          </div>
        </div>

        <div className="card card-premium exec-section-card">
          <span className="badge pro">Destaque PLUS</span>

          <h2 style={{ marginTop: 14 }}>
            O diferencial do Lucro ML está nos catálogos
          </h2>

          <p className="muted" style={{ marginTop: 10 }}>
            O módulo de catálogos ajuda você a transformar PDFs de fornecedores
            em produtos organizados para análise, acelerando a busca por oportunidades.
          </p>

          <div className="pro-upgrade-actions" style={{ marginTop: 18 }}>
            <Link href="/checkout" className="btn btn-primary">
              Ver planos
            </Link>

            <Link href="/dashboard/suporte" className="btn btn-ghost">
              Falar com suporte
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}