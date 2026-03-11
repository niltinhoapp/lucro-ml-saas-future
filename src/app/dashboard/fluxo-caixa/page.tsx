import PlanGate from "@/components/paywall/PlanGate";
import FluxoCaixaPageClient from "@/components/secure/FluxoCaixaPageClient";

export default function FluxoCaixaHome() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Fluxo de caixa da operação"
      description="No PRO, você acompanha entradas e saídas com mais clareza, reduz a dependência de planilhas manuais e protege melhor o capital de giro da sua operação."
      bullets={[
        "Importe extratos e organize entradas e saídas com mais rapidez.",
        "Tenha mais controle sobre o caixa e evite decisões no escuro.",
      ]}
    >
      <FluxoCaixaPageClient />
    </PlanGate>
  );
}