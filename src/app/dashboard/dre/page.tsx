import { redirect } from "next/navigation";
import { createServerClient } from "@/supabase/server";
import { getEntitlements } from "@/supabase/entitlements";
import DrePageClient from "./DrePageClient";
import PlanGate from "@/components/paywall/PlanGate";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/dashboard/historico");
  }

  const ent = await getEntitlements(supabase, user.id);

  if (ent.plan === "free" || ent.plan === "free_blocked") {
    return (
      <PlanGate
        requiredPlan="pro"
        title="DRE e leitura financeira"
        description="O DRE é liberado no PRO, porque ele faz parte da rotina operacional do seller para leitura de lucro, risco e histórico."
        bullets={[
          "Resume receita, custo, taxas e logística.",
          "Mostra o que fazer depois da análise.",
        ]}
      >
        <div />
      </PlanGate>
    );
  }

  if (!id || id === "undefined") {
    redirect("/dashboard/historico");
  }

  return <DrePageClient id={id} />;
}
