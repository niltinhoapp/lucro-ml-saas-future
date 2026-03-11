import { NextResponse } from "next/server";

const moduleGuides: Record<string, { objective: string; solves: string[]; next: string[] }> = {
  diagnostico: {
    objective: "Mostrar onde a margem está vazando e quais ajustes priorizar primeiro.",
    solves: [
      "Identifica taxa, frete e devolução escondendo prejuízo.",
      "Ajuda a decidir se o item merece reprecificação ou pausa.",
    ],
    next: ["Revisar preço", "Revisar logística", "Comparar com DRE"],
  },
  dre: {
    objective: "Traduzir o desempenho financeiro do produto em leitura simples para o seller.",
    solves: [
      "Organiza receita, custo, taxa, logística e lucro.",
      "Mostra ranking dos produtos mais saudáveis e mais perigosos.",
    ],
    next: ["Abrir histórico", "Exportar PDF", "Ver insights"],
  },
  catalogo: {
    objective: "Transformar o PDF do fornecedor em oportunidades priorizadas para compra.",
    solves: [
      "Filtra itens mais promissores.",
      "Reduz horas de leitura manual de catálogo.",
    ],
    next: ["Enviar PDF", "Priorizar oportunidades", "Validar margem"],
  },
  kits: {
    objective: "Aumentar ticket médio com combinações que façam sentido para giro e percepção de valor.",
    solves: [
      "Sugere kit de entrada, campeão e premium.",
      "Evita montar combo que trave estoque sem necessidade.",
    ],
    next: ["Escolher produto base", "Gerar combinações", "Testar oferta"],
  },
  fullflex: {
    objective: "Comparar Full e Flex de forma prática antes de mudar operação.",
    solves: [
      "Mostra qual modelo deixa mais lucro.",
      "Evita trocar logística no escuro.",
    ],
    next: ["Inserir custos", "Comparar resultado", "Aplicar decisão"],
  },
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const moduleName = String(body?.module ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const question = String(body?.question ?? "").trim();

  const guide =
    moduleGuides[moduleName] ??
    {
      objective: "Explicar o setor do sistema e orientar o seller sobre o próximo passo.",
      solves: ["Traduz a função do módulo", "Mostra o que aquela área resolve"],
      next: ["Entender o objetivo", "Executar ação principal", "Pedir suporte se necessário"],
    };

  return NextResponse.json({
    ok: true,
    module: moduleName || "geral",
    question,
    answer: {
      summary: guide.objective,
      solves: guide.solves,
      recommendedNextSteps: guide.next,
      humanSupportHint:
        "Se a dúvida envolver pagamento, caso específico do negócio ou um problema fora da automação, direcione para o suporte humanizado.",
    },
  });
}
