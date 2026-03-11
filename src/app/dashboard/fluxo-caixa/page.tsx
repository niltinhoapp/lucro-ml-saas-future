import PlanGate from "@/components/paywall/PlanGate";
import FluxoCaixaPageClient from "@/components/secure/FluxoCaixaPageClient";

export default function FluxoCaixaHome() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Fluxo de caixa"
      description="O fluxo de caixa fica liberado no PRO para que o seller pare de depender de planilha manual e ganhe leitura rápida do período."
      bullets={[
        "Importa extrato e organiza entradas e saídas.",
        "Ajuda a proteger capital de giro.",
      ]}
    >
      <FluxoCaixaPageClient />
    </PlanGate>
  );
}
