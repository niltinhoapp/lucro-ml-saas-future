import PlanGate from "@/components/paywall/PlanGate";
import KitsGeneratorClient from "@/components/market/KitsGeneratorClient";

export default function KitsPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Gerador de kits"
      description="O gerador de kits foi pensado para aumentar ticket médio sem travar estoque à toa."
      bullets={[
        "Sugere kit de entrada, campeão e premium.",
        "Mostra como montar combos com lógica de seller.",
      ]}
    >
      <KitsGeneratorClient />
    </PlanGate>
  );
}
