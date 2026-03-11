import Link from "next/link";
import { createServerClient } from "@/supabase/server";
import { getEntitlements } from "@/supabase/entitlements";

const modules = [
  {
    title: "Diagnóstico de lucro",
    href: "/dashboard/diagnostico",
    plan: "PRO",
    desc: "Encontre rapidamente onde taxa, frete e devolução estão destruindo margem.",
  },
  {
    title: "DRE e histórico",
    href: "/dashboard/historico",
    plan: "PRO",
    desc: "Abra relatórios, veja ranking de produtos e leve sua leitura financeira para outro nível.",
  },
  {
    title: "Full vs Flex",
    href: "/dashboard/full-vs-flex",
    plan: "PRO",
    desc: "Compare logística e veja qual modelo deixa mais lucro no bolso.",
  },
  {
    title: "Gerador de kits",
    href: "/dashboard/kits",
    plan: "PRO",
    desc: "Aumente ticket médio com combinações pensadas para giro e valor percebido.",
  },
  {
    title: "Simulador de compra",
    href: "/dashboard/simulador",
    plan: "PRO",
    desc: "Evite comprar lote ruim e travar caixa sem necessidade.",
  },
  {
    title: "Catálogos de fornecedor",
    href: "/dashboard/catalogos",
    plan: "PLUS",
    desc: "Seu carro-chefe: transforme PDF de fornecedor em ranking de oportunidades.",
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
          <span className="badge pro">Lucro ML SaaS V3</span>
          <h1 className="exec-title">Interface premium para seller que quer enxergar valor antes de assinar</h1>
          <p className="exec-subtitle">
            Todos os módulos ficam visíveis no painel. O seller entende a função, enxerga o ganho operacional e sobe para PRO ou PLUS quando quiser usar de fato.
          </p>
          <div className="checkout-proof premium-home-proof">
            <span className="pill good">Plano atual: {currentPlan}</span>
            <span className="pill">PRO mensal R$ 29,90</span>
            <span className="pill">PLUS mensal R$ 79,90</span>
            <span className="pill">PLUS anual e vitalício</span>
          </div>
        </div>

        <div className="premium-home-actions">
          <Link href="/checkout" className="btn btn-primary">Desbloquear módulos</Link>
          <Link href="/dashboard/ajuda" className="btn btn-ghost">Ver ajuda AI</Link>
        </div>
      </section>

      <section className="premium-module-grid">
        {modules.map((item) => (
          <Link key={item.href} href={item.href} className="card card-premium premium-module-card">
            <div className="premium-module-top">
              <span className={`badge ${item.plan === "PLUS" ? "pro" : ""}`.trim()}>{item.plan}</span>
              <span className="pill">Explorar</span>
            </div>
            <h3>{item.title}</h3>
            <p className="muted">{item.desc}</p>
            <div className="premium-module-footer">
              <span className="small">Clique para abrir a prévia do módulo</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="market-grid-2 premium-home-bottom">
        <div className="card card-premium exec-section-card">
          <span className="badge">Ajuda embutida</span>
          <h2 style={{ marginTop: 14 }}>Cada setor agora pode explicar como usar e o que resolve</h2>
          <p className="muted" style={{ marginTop: 10 }}>
            A central de ajuda AI foi pensada para orientar o seller dentro da interface e reduzir atrito de onboarding.
          </p>
          <div className="pro-upgrade-actions" style={{ marginTop: 18 }}>
            <Link href="/dashboard/ajuda" className="btn btn-primary">Abrir ajuda AI</Link>
          </div>
        </div>

        <div className="card card-premium exec-section-card">
          <span className="badge pro">Oferta premium</span>
          <h2 style={{ marginTop: 14 }}>PLUS é o plano de maior valor percebido</h2>
          <p className="muted" style={{ marginTop: 10 }}>
            O scanner de catálogo continua sendo o diferencial principal do produto e agora ganha mais destaque visual e comercial.
          </p>
          <div className="pro-upgrade-actions" style={{ marginTop: 18 }}>
            <Link href="/checkout" className="btn btn-primary">Ver planos</Link>
            <Link href="/dashboard/suporte" className="btn btn-ghost">Falar com suporte</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
