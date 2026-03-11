"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(public)/auth/logout/actions";

type MenuItem = { label: string; href: string; plan?: "PRO" | "PLUS" | "FREE" };
type MenuGroup = { title: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    title: "Painel",
    items: [{ label: "Visão geral", href: "/dashboard", plan: "FREE" }],
  },
  {
    title: "Análise",
    items: [
      { label: "Diagnóstico de lucro", href: "/dashboard/diagnostico", plan: "PRO" },
      { label: "DRE", href: "/dashboard/historico", plan: "PRO" },
      { label: "Full vs Flex", href: "/dashboard/full-vs-flex", plan: "PRO" },
      { label: "Inteligência de mercado", href: "/dashboard/inteligencia", plan: "PRO" },
      { label: "Radar de oportunidades", href: "/dashboard/radar", plan: "PRO" },
    ],
  },
  {
    title: "Estoque",
    items: [
      { label: "Simulador de compra", href: "/dashboard/simulador", plan: "PRO" },
      { label: "Gerador de kits", href: "/dashboard/kits", plan: "PRO" },
      { label: "Catálogos de fornecedor", href: "/dashboard/catalogos", plan: "PLUS" },
    ],
  },
  {
    title: "Operação",
    items: [
      { label: "Fluxo de caixa", href: "/dashboard/fluxo-caixa", plan: "PRO" },
      { label: "Ajuda AI", href: "/dashboard/ajuda", plan: "FREE" },
      { label: "Suporte humanizado", href: "/dashboard/suporte", plan: "FREE" },
    ],
  },
  {
    title: "Conta",
    items: [
      { label: "Planos e upgrade", href: "/checkout", plan: "FREE" },
      { label: "Voltar para o site", href: "/", plan: "FREE" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href + "?");
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-layout premium-app-layout">
      <aside className="sidebar sidebar-pro premium-sidebar">
        <div className="sidebar-head premium-sidebar-head">
          <div className="premium-sidebar-logo-wrap">
            <h1 className="sidebar-logo premium-sidebar-logo">Lucro ML</h1>
            <span className="premium-sidebar-logo-glow" aria-hidden />
          </div>
          <div className="sidebar-badge-row">
            <span className="badge">Preview liberado</span>
            <span className="badge pro">PRO / PLUS</span>
          </div>
          <p className="sidebar-tagline">
            Navegue por todos os setores, entenda o valor de cada módulo e desbloqueie quando fizer sentido para a sua operação.
          </p>
        </div>

        <div className="sidebar-group">
          {menuGroups.map((group) => (
            <section key={group.title} className="sidebar-group">
              <div className="sidebar-group-label">{group.title}</div>
              <nav className="sidebar-nav">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const className = [
                    active ? "active" : "",
                    item.plan === "PLUS" ? "sidebar-link-plus" : "",
                    item.plan === "PRO" ? "sidebar-link-pro" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <Link key={item.href} href={item.href} className={className || undefined}>
                      <span>{item.label}</span>
                      {item.plan === "FREE" ? null : (
                        <span className={`badge ${item.plan === "PLUS" ? "pro" : ""}`.trim()}>{item.plan}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </section>
          ))}
        </div>

        <div className="sidebar-account-card premium-sidebar-card">
          <div className="sidebar-account-top">
            <strong>Sessão ativa</strong>
            <span className="badge ok">Segura</span>
          </div>
          <p className="sidebar-account-copy">
            Você pode explorar a estrutura inteira do sistema. Os módulos operacionais são liberados após a assinatura.
          </p>
          <form action={logoutAction} className="signout-form">
            <button type="submit" className="btn btn-danger btn-block">
              Encerrar sessão
            </button>
          </form>
        </div>

        <div className="sidebar-footer">Lucro ML • análise premium para seller Mercado Livre</div>
      </aside>

      <main className="main">
        <div className="page dashboard-page">{children}</div>
      </main>
    </div>
  );
}
