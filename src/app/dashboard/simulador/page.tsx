import PlanGate from "@/components/paywall/PlanGate";
import SimuladorEstoqueClient from "@/components/market/SimuladorEstoqueClient";

export default function SimuladorPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Simulador de compra"
      description="Antes de fechar lote, o seller vê quanto capital vai travar, qual retorno esperar e em quanto tempo esse estoque gira."
      bullets={[
        "Evita compra ruim.",
        "Mostra ROI estimado e tempo de giro.",
      ]}
    >
      <SimuladorEstoqueClient />
    </PlanGate>
  );
}
