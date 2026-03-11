"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SubscriptionPlan } from "@/lib/plans";

type PlanItem = {
  key: string;
  badge: string;
  title: string;
  desc: string;
  price: string;
  sub: string;
  items: string[];
  featured?: boolean;
  plan?: SubscriptionPlan;
  actionLabel: string;
  actionHref?: string;
};

const plans: PlanItem[] = [
  {
    key: "pro_month",
    badge: "PRO",
    title: "Seller PRO",
    desc: "Libera os módulos operacionais do dia a dia, com foco em margem, estoque e rotina.",
    price: "R$ 29,90",
    sub: "/mês",
    items: [
      "Diagnóstico de lucro",
      "DRE e histórico",
      "Simulador de compra",
      "Full vs Flex, kits e radar",
    ],
    plan: "pro_month",
    actionLabel: "Assinar PRO",
  },
  {
    key: "plus_month",
    badge: "PLUS",
    title: "Seller PLUS",
    desc: "Plano mais forte do sistema, com o scanner de catálogo como carro-chefe.",
    price: "R$ 79,90",
    sub: "/mês",
    items: [
      "Tudo do PRO",
      "Análise de catálogo em PDF",
      "Ajuda AI premium por setor",
      "Apoio mais avançado para decisão de compra",
    ],
    featured: true,
    plan: "plus_month",
    actionLabel: "Assinar PLUS",
  },
  {
    key: "plus_year",
    badge: "PLUS ANUAL",
    title: "PLUS Anual",
    desc: "Para quem já entendeu o valor do produto e quer desconto no compromisso anual.",
    price: "R$ 679,90",
    sub: "/ano",
    items: [
      "PLUS completo por 12 meses",
      "Economia sobre o mensal",
      "Ideal para seller em operação contínua",
    ],
    plan: "plus_year",
    actionLabel: "Assinar anual",
  },
  {
    key: "plus_lifetime",
    badge: "VITALÍCIO",
    title: "PLUS Vitalício",
    desc: "Oferta premium tratada como condição especial, com alto valor percebido e atendimento dedicado.",
    price: "R$ 1.279,70",
    sub: "pagamento único",
    items: [
      "Acesso PLUS permanente",
      "Oferta de maior ticket",
      "Fluxo recomendado via atendimento humano",
    ],
    actionLabel: "Solicitar vitalício",
    actionHref: "/dashboard/suporte",
  },
];

export default function CheckoutPageClient({
  mpStatus,
}: {
  mpStatus?: string;
}) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const mpMessage = useMemo(() => {
    if (mpStatus === "success") {
      return {
        type: "success" as const,
        text: "Pagamento iniciado. Aguarde a confirmação da assinatura.",
      };
    }

    if (mpStatus === "pending") {
      return {
        type: "info" as const,
        text: "Pagamento pendente de confirmação pelo Mercado Pago.",
      };
    }

    if (mpStatus === "failure") {
      return {
        type: "danger" as const,
        text: "O pagamento não foi concluído. Tente novamente.",
      };
    }

    return null;
  }, [mpStatus]);

  async function assinar(plan: SubscriptionPlan) {
    try {
      setErr(null);
      setLoadingPlan(plan);

      const res = await fetch("/api/mp/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/auth/login?next=/checkout";
          return;
        }

        setErr(json?.error ?? "Erro ao iniciar assinatura.");
        return;
      }

      if (!json?.init_point) {
        setErr("Mercado Pago não retornou o link de pagamento.");
        return;
      }

      window.location.href = json.init_point;
    } catch {
      setErr("Falha ao conectar com o checkout.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="page-wrap checkout-page premium-checkout-page">
      <section className="topbar checkout-hero checkout-hero-clean premium-checkout-hero">
        <div className="checkout-hero-text">
          <span className="badge pro">PLANOS SELLER</span>

          <h2 className="checkout-title">
            Todos os módulos ficam visíveis. O uso é liberado quando a assinatura entra.
          </h2>

          <p className="subtitle checkout-subtitle">
            O PREVIEW serve para navegar. O PRO libera operação. O PLUS libera o carro-chefe: análise de catálogo com leitura premium de PDF do fornecedor.
          </p>

          <div className="checkout-proof">
            <span className="pill good">Preview sem uso operacional</span>
            <span className="pill">PRO mensal R$ 29,90</span>
            <span className="pill">PLUS mensal R$ 79,90</span>
            <span className="pill">PLUS anual R$ 679,90</span>
            <span className="pill">PLUS vitalício R$ 1.279,70</span>
          </div>
        </div>

        <div className="checkout-hero-preview card card-premium">
          <div className="checkout-preview-head">
            <span className="badge ok">Carro-chefe</span>
            <span className="small">PLUS</span>
          </div>

          <div className="checkout-preview-kpis">
            <div className="checkout-preview-kpi">
              <span className="checkout-preview-label">Análise de catálogo</span>
              <strong className="checkout-preview-value">PDF → oportunidades</strong>
            </div>

            <div className="checkout-preview-kpi">
              <span className="checkout-preview-label">Ajuda AI</span>
              <strong className="checkout-preview-value good">Explica cada setor</strong>
            </div>
          </div>

          <div className="checkout-preview-note">
            O seller vê tudo na interface premium, entende valor e sobe de plano quando quiser usar de verdade.
          </div>
        </div>
      </section>

      <section className="checkout-grid" aria-label="Planos">
        {plans.map((item) => (
          <article key={item.key} className={`card checkout-plan ${item.featured ? "checkout-plan-pro" : ""}`}>
            <div className="checkout-plan-body">
              <div className="checkout-plan-head">
                <span className={`badge ${item.featured ? "pro" : ""}`.trim()}>{item.badge}</span>
                <h3 className="checkout-plan-title">{item.title}</h3>
                <p className="checkout-plan-desc">{item.desc}</p>
              </div>

              <div className="checkout-price">
                <span className="checkout-price-main">{item.price}</span>
                <span className="checkout-price-sub">{item.sub}</span>
              </div>

              <ul className={`checkout-list ${item.featured ? "checkout-list-strong" : ""}`}>
                {item.items.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="checkout-cta checkout-cta-stack">
              {item.plan ? (
                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  onClick={() => assinar(item.plan!)}
                  disabled={Boolean(loadingPlan)}
                >
                  {loadingPlan === item.plan ? "Abrindo checkout..." : item.actionLabel}
                </button>
              ) : (
                <Link href={item.actionHref ?? "/dashboard/suporte"} className="btn btn-primary btn-block">
                  {item.actionLabel}
                </Link>
              )}

              <Link href="/dashboard" className="btn btn-ghost btn-block">
                Ver painel
              </Link>
            </div>
          </article>
        ))}

        <article className="card checkout-plan">
          <div className="checkout-plan-body">
            <div className="checkout-plan-head">
              <span className="badge">PREVIEW</span>
              <h3 className="checkout-plan-title">Exploração grátis</h3>
              <p className="checkout-plan-desc">
                O seller navega por todos os módulos, mas o uso operacional fica bloqueado até a assinatura.
              </p>
            </div>

            <div className="checkout-price">
              <span className="checkout-price-main">R$ 0</span>
              <span className="checkout-price-sub">para explorar</span>
            </div>

            <ul className="checkout-list">
              <li>Ver estrutura completa do produto</li>
              <li>Entender o valor de cada seção</li>
              <li>Acessar ajuda AI e suporte</li>
            </ul>
          </div>

          <div className="checkout-cta checkout-cta-single">
            <Link href="/dashboard" className="btn btn-ghost btn-block">
              Continuar em preview
            </Link>
          </div>
        </article>
      </section>

      {err ? (
        <div className="alert danger checkout-note">{err}</div>
      ) : mpMessage ? (
        <div className={`alert ${mpMessage.type} checkout-note`}>{mpMessage.text}</div>
      ) : (
        <div className="alert info checkout-note">Assinaturas mensais e anuais seguem pelo checkout. O vitalício pode ser tratado via suporte premium.</div>
      )}

      <section className="card checkout-compare card-premium">
        <div className="checkout-compare-top">
          <h3 className="checkout-compare-title">Compare os níveis</h3>
          <p className="checkout-compare-subtitle">
            O produto foi reposicionado para navegação livre e uso liberado somente após assinatura.
          </p>
        </div>

        <div className="checkout-compare-table">
          <div className="checkout-compare-head">
            <div className="compare-col-feature">Recurso</div>
            <div className="compare-col-plan">Preview</div>
            <div className="compare-col-plan compare-col-plan-pro">Pro</div>
            <div className="compare-col-plan compare-col-plan-pro">Plus</div>
          </div>

          <div className="compare-row">
            <div className="compare-feature">
              <span className="compare-feature-title">Navegação pelos módulos</span>
              <span className="compare-feature-desc">Explorar estrutura e interface premium</span>
            </div>
            <div className="compare-cell compare-cell-pro">Sim</div>
            <div className="compare-cell compare-cell-pro">Sim</div>
            <div className="compare-cell compare-cell-pro">Sim</div>
          </div>

          <div className="compare-row">
            <div className="compare-feature">
              <span className="compare-feature-title">Uso operacional</span>
              <span className="compare-feature-desc">Rodar análise, relatórios e rotina</span>
            </div>
            <div className="compare-cell compare-cell-free">Bloqueado</div>
            <div className="compare-cell compare-cell-pro">Liberado</div>
            <div className="compare-cell compare-cell-pro">Liberado</div>
          </div>

          <div className="compare-row">
            <div className="compare-feature">
              <span className="compare-feature-title">Análise de catálogo</span>
              <span className="compare-feature-desc">Scanner do PDF do fornecedor</span>
            </div>
            <div className="compare-cell compare-cell-free">Prévia</div>
            <div className="compare-cell compare-cell-free">Bloqueado</div>
            <div className="compare-cell compare-cell-pro">Incluso</div>
          </div>

          <div className="compare-row">
            <div className="compare-feature">
              <span className="compare-feature-title">Modelos PLUS premium</span>
              <span className="compare-feature-desc">Mensal, anual e vitalício</span>
            </div>
            <div className="compare-cell compare-cell-free">—</div>
            <div className="compare-cell compare-cell-free">—</div>
            <div className="compare-cell compare-cell-pro">Incluso</div>
          </div>
        </div>
      </section>
    </div>
  );
}
