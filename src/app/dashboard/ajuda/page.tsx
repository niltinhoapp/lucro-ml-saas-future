import Link from "next/link";

const sectors = [
  {
    title: "Diagnóstico de lucro",
    desc: "Mostra onde taxa, frete e devolução estão comendo sua margem.",
    questions: [
      "Como saber se o produto está no lucro real?",
      "O que corrigir primeiro quando a margem cai?",
    ],
  },
  {
    title: "DRE e histórico",
    desc: "Organiza leitura financeira, ranking de produtos e histórico das análises.",
    questions: [
      "Como interpretar o DRE sem complicação?",
      "Quais itens eu devo reprecificar primeiro?",
    ],
  },
  {
    title: "Catálogos PLUS",
    desc: "Transforma PDF de fornecedor em lista priorizada para compra.",
    questions: [
      "Como escolher os itens mais promissores do catálogo?",
      "Como reduzir risco antes de comprar lote alto?",
    ],
  },
  {
    title: "Full vs Flex e kits",
    desc: "Ajuda a comparar logística e aumentar ticket médio com combinações úteis.",
    questions: [
      "Quando o Full compensa mais que o Flex?",
      "Qual tipo de kit aumenta ticket sem travar estoque?",
    ],
  },
];

export default function AjudaPage() {
  return (
    <div className="page-wrap premium-help-page">
      <section className="premium-help-hero card card-premium">
        <div className="premium-help-copy">
          <span className="badge pro">Ajuda AI por setor</span>
          <h1>Entenda cada módulo antes de usar e descubra o que ele resolve</h1>
          <p className="subtitle">
            Esta central foi pensada para o seller navegar no sistema com clareza. A IA explica o uso, o objetivo da seção e o próximo passo ideal.
          </p>
        </div>
        <div className="premium-help-actions">
          <Link href="/checkout" className="btn btn-primary">Ver planos</Link>
          <Link href="/dashboard/suporte" className="btn btn-ghost">Suporte humanizado</Link>
        </div>
      </section>

      <section className="premium-help-grid">
        {sectors.map((sector) => (
          <article key={sector.title} className="card card-premium premium-help-card">
            <span className="badge">Setor</span>
            <h2>{sector.title}</h2>
            <p className="muted">{sector.desc}</p>
            <div className="premium-help-list">
              {sector.questions.map((question) => (
                <div key={question} className="alert info">{question}</div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
