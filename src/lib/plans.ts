export type ProfilePlan = "free" | "pro" | "plus" | "free_blocked";
export type SubscriptionPlan =
  | "pro_month"
  | "plus_month"
  | "plus_year"
  | "plus_lifetime";

export type PlanSpec = {
  id: ProfilePlan;
  label: string;
  rank: number;
  reportsLimit: number;
  canExport: boolean;
  canUploadSpreadsheet: boolean;
  canUseCatalogAnalysis: boolean;
  aiDailyLimit: number;
};

export const PLAN_SPECS: Record<ProfilePlan, PlanSpec> = {
  free: {
    id: "free",
    label: "Preview",
    rank: 0,
    reportsLimit: 0,
    canExport: false,
    canUploadSpreadsheet: false,
    canUseCatalogAnalysis: false,
    aiDailyLimit: 0,
  },
  free_blocked: {
    id: "free_blocked",
    label: "Assinatura pausada",
    rank: 0,
    reportsLimit: 0,
    canExport: false,
    canUploadSpreadsheet: false,
    canUseCatalogAnalysis: false,
    aiDailyLimit: 0,
  },
  pro: {
    id: "pro",
    label: "PRO",
    rank: 1,
    reportsLimit: 999999,
    canExport: true,
    canUploadSpreadsheet: true,
    canUseCatalogAnalysis: false,
    aiDailyLimit: 60,
  },
  plus: {
    id: "plus",
    label: "PLUS",
    rank: 2,
    reportsLimit: 999999,
    canExport: true,
    canUploadSpreadsheet: true,
    canUseCatalogAnalysis: true,
    aiDailyLimit: 250,
  },
};

export function normalizeProfilePlan(plan: string | null | undefined): ProfilePlan {
  const value = String(plan ?? "free").toLowerCase();
  if (value === "plus") return "plus";
  if (value === "pro") return "pro";
  if (value === "free_blocked") return "free_blocked";
  return "free";
}

export function isSubscriptionPlan(value: string): value is SubscriptionPlan {
  return ["pro_month", "plus_month", "plus_year", "plus_lifetime"].includes(value);
}

export function subscriptionPlanToProfilePlan(plan: SubscriptionPlan): ProfilePlan {
  return plan.startsWith("plus") ? "plus" : "pro";
}

export function priceFromSubscriptionPlan(plan: SubscriptionPlan) {
  switch (plan) {
    case "plus_month":
      return { amount: 79.9, freq: 1, label: "PLUS Mensal", billingType: "recurring" as const };
    case "plus_year":
      return { amount: 679.9, freq: 12, label: "PLUS Anual", billingType: "recurring" as const };
    case "plus_lifetime":
      return { amount: 1279.7, freq: 1, label: "PLUS Vitalício", billingType: "one_time" as const };
    case "pro_month":
    default:
      return { amount: 29.9, freq: 1, label: "PRO Mensal", billingType: "recurring" as const };
  }
}

export function canAccessPlan(current: string | null | undefined, required: ProfilePlan) {
  const normalized = normalizeProfilePlan(current);
  return PLAN_SPECS[normalized].rank >= PLAN_SPECS[required].rank;
}
