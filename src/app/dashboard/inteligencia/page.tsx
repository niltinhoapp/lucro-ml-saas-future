import PlanGate from "@/components/paywall/PlanGate";
import MarketIntelligenceClient from "@/components/market/MarketIntelligenceClient";

export default function InteligenciaPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Inteligência de mercado"
      description="Esta área ajuda o seller a avaliar direção de compra, risco e oportunidade antes de tomar decisão."
      bullets={[
        "Lê cenários com mais contexto.",
        "Apoia decisões de compra e posicionamento.",
      ]}
    >
      <MarketIntelligenceClient />
    </PlanGate>
  );
}
