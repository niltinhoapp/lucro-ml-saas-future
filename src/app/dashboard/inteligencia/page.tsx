import PlanGate from "@/components/paywall/PlanGate";
import MarketIntelligenceClient from "@/components/market/MarketIntelligenceClient";

export default function InteligenciaPage() {
  return (
    <PlanGate
      requiredPlan="pro"
      title="Inteligência de mercado para sellers"
      description="Analise cenários de mercado, entenda demanda e concorrência e tenha mais clareza antes de decidir quais produtos vale a pena comprar ou testar."
      bullets={[
        "Avalie risco, demanda e potencial de venda.",
        "Tome decisões de compra com mais contexto de mercado.",
      ]}
    >
      <MarketIntelligenceClient />
    </PlanGate>
  );
}