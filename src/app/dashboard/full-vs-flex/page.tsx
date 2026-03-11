import PlanGate from "@/components/paywall/PlanGate";
import CalculadoraFullFlex from "./components/CalculadoraFullFlex";

export default function FullVsFlexPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Full vs Flex"
      description="Este simulador compara as duas operações para mostrar qual delas deixa mais lucro no bolso antes de você mover a logística."
      bullets={[
        "Compara lucro e margem automaticamente.",
        "Evita trocar operação no escuro.",
      ]}
    >
      <div className="page-wrap fvf-page">
        <section className="ui-card fvf-hero2">
          <div className="fvf-hero2-inner">
            <div className="fvf-hero2-left">
              <div className="fvf-hero2-badge">
                <span className="fvf-hero2-dot" aria-hidden />
                Simulador PRO (Full vs Flex)
              </div>
              <h1 className="fvf-hero2-title">Descubra se Full ou Flex deixa mais lucro no bolso</h1>
              <p className="fvf-hero2-sub">
                Compare os dois modelos em poucos cliques e veja qual faz mais sentido para sua operação antes de mudar logística.
              </p>
            </div>
            <aside className="fvf-hero2-right" aria-label="Como usar esta calculadora">
              <div className="fvf-feature">
                <div className="fvf-feature-title">📦 Full</div>
                <div className="fvf-feature-desc">Veja o impacto do custo do Full por unidade.</div>
              </div>
              <div className="fvf-feature">
                <div className="fvf-feature-title">🚚 Flex</div>
                <div className="fvf-feature-desc">Compare com o frete médio que você paga no Flex.</div>
              </div>
              <div className="fvf-feature">
                <div className="fvf-feature-title">🎯 Recomendação</div>
                <div className="fvf-feature-desc">Receba uma indicação simples do melhor caminho.</div>
              </div>
            </aside>
          </div>
        </section>
        <section className="fvf-body">
          <CalculadoraFullFlex />
        </section>
      </div>
    </PlanGate>
  );
}
