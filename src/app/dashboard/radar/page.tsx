import PlanGate from "@/components/paywall/PlanGate";
import RadarOportunidades from "@/components/market/RadarOportunidades";

export default function RadarPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Radar de oportunidades"
      description="O radar destaca movimentos e ideias para o seller focar energia onde existe chance real de lucro."
      bullets={[
        "Aponta tendências úteis para o negócio.",
        "Ajuda a priorizar novas análises.",
      ]}
    >
      <RadarOportunidades />
    </PlanGate>
  );
}
