import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BillingSettings, type PlanPriceLabel } from "@/features/billing/components/billing-settings";
import { getBillingOverview, getPlanPrices } from "@/features/billing/queries";
import { stripeClient } from "@/features/billing/stripe";
import { getOrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import type { PurchasablePlan } from "@/lib/billing/plans";
import { serverEnv } from "@/lib/env.server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("billing");
  return { title: t("title") };
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Innstillinger → Abonnement. Bare eieren styrer abonnementet. */
export default async function BillingPage({ params, searchParams }: PageProps<"/[org]/settings/billing">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "organization.billing")) {
    notFound();
  }
  const [overview, prices, query] = await Promise.all([
    getBillingOverview(context.organization.id),
    getPlanPrices(),
    searchParams,
  ]);
  const labels = Object.fromEntries(
    Object.entries(prices).map(([plan, price]) => [
      plan,
      price ? { amount: formatPrice(price.amount, price.currency), interval: price.interval } : null,
    ]),
  ) as Record<PurchasablePlan, PlanPriceLabel>;
  const checkout = query.checkout === "success" || query.checkout === "canceled" ? query.checkout : null;

  return (
    <BillingSettings
      organizationId={context.organization.id}
      overview={overview}
      prices={labels}
      stripeConfigured={stripeClient() !== null}
      checkout={checkout}
      supportEmail={serverEnv().supportEmail ?? null}
    />
  );
}
