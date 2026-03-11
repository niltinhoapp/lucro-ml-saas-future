import Link from "next/link";

const sectors = [
  {
    title: "Diagnóstico de lucro",
    desc: "Entenda se o produto está deixando lucro real e veja onde sua margem está sendo reduzida.",
    questions: [
      "Como saber se esse produto está realmente no lucro?",
      "O que devo ajustar primeiro quando a margem cai?",
    ],
  },
  {
    title: "Lucro real e DRE",
    desc: "Aprenda a interpretar os números da operação sem complicação e descubra onde agir primeiro.",
    questions: [
      "Como ler o DRE de forma simples?",
      "Quais produtos devo revisar ou reprecificar primeiro?",
    ],
  },
  {
    title: "Catálogos de fornecedor",
    desc: "Veja como transformar PDF em análise prática para encontrar produtos com potencial de revenda.",
    questions: [
      "Como identificar os produtos mais promissores do catálogo?",
      "Como reduzir risco antes de comprar um lote maior?",
    ],
  },
  {
    title: "Full vs Flex e kits",
    desc: "Entenda quando cada logística faz mais sentido e como usar kits para aumentar ticket médio.",
    questions: [
      "Quando o Full pode compensar mais do que o Flex?",
      "Qual tipo de kit pode aumentar ticket sem travar estoque?",
    ],
  },
];

export default function AjudaPage() {
  return (
    <div className="page-wrap premium-help-page">
      <section className="premium-help-hero card card-premium">
        <div className="premium-help-copy">
          <span className="badge pro">Ajuda para seller</span>
          <h1>Entenda cada área do sistema e saiba qual próximo passo dar</h1>
          <p className="subtitle">
            Esta central foi criada para ajudar você a usar o Lucro ML com mais
            clareza. Aqui você entende o que cada módulo resolve, como usar e o
            que fazer depois da análise.
          </p>
        </div>

        <div className="premium-help-actions">
          <Link href="/checkout" className="btn btn-primary">
            Ver planos
          </Link>
          <Link href="/dashboard/suporte" className="btn btn-ghost">
            Falar com suporte
          </Link>
        </div>
      </section>

      <section className="premium-help-grid">
        {sectors.map((sector) => (
          <article key={sector.title} className="card card-premium premium-help-card">
            <span className="badge">Ajuda por módulo</span>
            <h2>{sector.title}</h2>
            <p className="muted">{sector.desc}</p>

            <div className="premium-help-list">
              {sector.questions.map((question) => (
                <div key={question} className="alert info">
                  {question}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}