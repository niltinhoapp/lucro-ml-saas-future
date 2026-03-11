import PlanGate from "@/components/paywall/PlanGate";
import RadarOportunidades from "@/components/market/RadarOportunidades";

export default function RadarPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Radar de produtos com potencial de venda"
      description="O radar ajuda você a encontrar oportunidades que merecem atenção, identificar tendências úteis e direcionar sua análise para produtos com maior chance de resultado no Mercado Livre."
      bullets={[
        "Descubra oportunidades para analisar com mais rapidez.",
        "Priorize produtos e nichos com maior potencial comercial.",
      ]}
    >
      <RadarOportunidades />
    </PlanGate>
  );
}