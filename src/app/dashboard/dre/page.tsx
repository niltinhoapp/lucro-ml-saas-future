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
        title="Lucro real e DRE das vendas"
        description="No PRO, você libera a leitura financeira completa das suas vendas para entender quanto realmente sobra no caixa depois de taxas, frete, devoluções e custos operacionais."
        bullets={[
          "Veja receita, custos, taxas e logística em uma visão clara.",
          "Descubra onde sua margem está sendo perdida e o que ajustar.",
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