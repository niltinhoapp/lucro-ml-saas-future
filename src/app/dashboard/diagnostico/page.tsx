import PlanGate from "@/components/paywall/PlanGate";
import DiagnosticoLucroClient from "@/components/market/DiagnosticoLucroClient";

export default function DiagnosticoPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Diagnóstico de lucro"
      description="Este setor mostra onde sua margem está vazando e quais ajustes você deve priorizar primeiro. No preview o seller navega, mas a análise fica bloqueada até a assinatura."
      bullets={[
        "Mostra taxas e fretes corroendo lucro.",
        "Ajuda a decidir se reprecifica, pausa ou troca logística.",
      ]}
    >
      <DiagnosticoLucroClient />
    </PlanGate>
  );
}
