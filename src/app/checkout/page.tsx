import CheckoutPageClient from "./CheckoutPageClient";

type SearchParamsLike = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: SearchParamsLike;
}) {
  const sp = (await searchParams) ?? {};
  const raw = sp.mp_status;
  const mpStatus = typeof raw === "string" ? raw : undefined;

  return <CheckoutPageClient mpStatus={mpStatus} />;
}