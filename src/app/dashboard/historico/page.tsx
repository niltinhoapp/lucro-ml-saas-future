import PlanGate from "@/components/paywall/PlanGate";
import HistoricoPageClient from "@/components/secure/HistoricoPageClient";

export default function HistoricoPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Histórico e DRE"
      description="O histórico fica bloqueado até a assinatura porque ele concentra a rotina financeira e operacional do seller."
      bullets={[
        "Reabre relatórios anteriores.",
        "Centraliza comparação e decisão de margem.",
      ]}
    >
      <HistoricoPageClient />
    </PlanGate>
  );
}
