import Link from "next/link";
import type { ReactNode } from "react";
import { createServerClient } from "@/supabase/server";
import { getEntitlements } from "@/supabase/entitlements";
import { PLAN_SPECS, type ProfilePlan } from "@/lib/plans";

type Props = {
  requiredPlan: ProfilePlan;
  title: string;
  description: string;
  bullets?: string[];
  children: ReactNode;
};

export default async function PlanGate({
  requiredPlan,
  title,
  description,
  bullets = [],
  children,
}: Props) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="feature-lock feature-lock-shell">
        <div className="feature-lock-top">
          <span className="badge">Preview</span>
          <span className="pill">Faça login para continuar</span>
        </div>
        <h1>{title}</h1>
        <p className="feature-lock-copy">{description}</p>
        <div className="feature-lock-actions">
          <Link href="/auth/login?next=/dashboard" className="btn btn-primary">Entrar</Link>
          <Link href="/checkout" className="btn btn-ghost">Ver planos</Link>
        </div>
      </section>
    );
  }

  const ent = await getEntitlements(supabase, user.id);
  const allowed = PLAN_SPECS[ent.plan].rank >= PLAN_SPECS[requiredPlan].rank;

  if (allowed) return <>{children}</>;

  return (
    <div className="feature-lock-shell">
      <section className="feature-lock">
        <div className="feature-lock-top">
          <span className="badge pro">Bloqueado</span>
          <span className="pill">Plano necessário: {PLAN_SPECS[requiredPlan].label}</span>
        </div>

        <h1>{title}</h1>
        <p className="feature-lock-copy">{description}</p>

        {!!bullets.length && (
          <div className="feature-lock-bullets">
            {bullets.map((bullet) => (
              <div key={bullet} className="feature-lock-bullet">{bullet}</div>
            ))}
          </div>
        )}

        <div className="feature-lock-actions">
          <Link href="/checkout" className="btn btn-primary">Desbloquear agora</Link>
          <Link href="/dashboard/ajuda" className="btn btn-ghost">Ajuda AI</Link>
          <Link href="/dashboard/suporte" className="btn btn-ghost">Suporte humanizado</Link>
        </div>
      </section>

      <section className="feature-preview-grid">
        <div className="card card-premium feature-preview-card">
          <span className="badge">O que você ganha</span>
          <h3>Fluxo pronto para seller</h3>
          <p className="muted">Você entra no módulo, entende o problema que ele resolve e sobe de nível só quando fizer sentido para sua operação.</p>
        </div>
        <div className="card card-premium feature-preview-card">
          <span className="badge pro">Upgrade inteligente</span>
          <h3>Ajuda AI + suporte humano</h3>
          <p className="muted">A IA explica cada setor. Quando precisar de algo fora da automação, o suporte humano assume o caso.</p>
        </div>
      </section>
    </div>
  );
}
