import Link from "next/link";

const flows = [
  "Dúvida rápida sobre uso de um módulo.",
  "Solicitação comercial de plano anual ou vitalício.",
  "Caso específico que exige revisão humana.",
  "Problema operacional que a IA não conseguiu resolver.",
];

export default function SuportePage() {
  return (
    <div className="page-wrap premium-support-page">
      <section className="premium-support-hero card card-premium">
        <div>
          <span className="badge pro">Suporte humanizado</span>
          <h1>Quando a automação não resolver, o atendimento humano entra em ação</h1>
          <p className="subtitle">
            A IA orienta o seller no uso do sistema. Já situações comerciais, exceções e decisões específicas podem seguir por atendimento humano.
          </p>
        </div>
        <div className="premium-support-actions">
          <a className="btn btn-primary" href="mailto:csinput@gmail.com?subject=Suporte%20Lucro%20ML%20SaaS">Abrir atendimento</a>
          <Link className="btn btn-ghost" href="/checkout">Ver planos</Link>
        </div>
      </section>

      <section className="premium-support-grid">
        <article className="card card-premium premium-support-card">
          <span className="badge">Fluxo recomendado</span>
          <h2>Primeiro a IA, depois o humano</h2>
          <div className="premium-support-list">
            {flows.map((flow) => (
              <div key={flow} className="alert info">{flow}</div>
            ))}
          </div>
        </article>

        <article className="card card-premium premium-support-card">
          <span className="badge pro">Plano vitalício</span>
          <h2>Oferta de alto valor com atendimento dedicado</h2>
          <p className="muted">
            O vitalício pode ser tratado como oferta premium, com aprovação manual, onboarding prioritário e regras claras de uso para proteger margem e custo de operação.
          </p>
          <div className="checkout-proof" style={{ marginTop: 16 }}>
            <span className="pill good">Onboarding prioritário</span>
            <span className="pill">PLUS completo</span>
            <span className="pill">Condição especial</span>
          </div>
        </article>
      </section>
    </div>
  );
}
