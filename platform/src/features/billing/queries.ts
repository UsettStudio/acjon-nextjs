import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { priceIdFor, stripeClient } from "@/features/billing/stripe";
import {
  ACTIVE_PHASES,
  PURCHASABLE_PLANS,
  isPlan,
  projectLimit,
  type Plan,
  type PurchasablePlan,
} from "@/lib/billing/plans";
import { subscriptionAllowsWrites, type SubscriptionStatus } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";

export type BillingOverview = {
  plan: Plan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
  /** Et abonnement i Stripe som fortsatt gjelder (ikke avsluttet). */
  hasSubscription: boolean;
  activeProjects: number;
  limit: number | null;
  writable: boolean;
};

const LIVE_STATUSES = new Set<SubscriptionStatus>(["active", "trialing", "past_due", "unpaid", "paused"]);

export async function getBillingOverview(organizationId: string): Promise<BillingOverview> {
  const supabase = await createClient();
  const [organization, projects] = await Promise.all([
    supabase
      .from("organizations")
      .select(
        "plan, subscription_status, trial_ends_at, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id",
      )
      .eq("id", organizationId)
      .single(),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("phase", [...ACTIVE_PHASES]),
  ]);
  if (organization.error) {
    throw organization.error;
  }
  if (projects.error) {
    throw projects.error;
  }
  const row = organization.data;
  const plan = isPlan(row.plan) ? row.plan : "start";
  return {
    plan,
    status: row.subscription_status,
    trialEndsAt: row.trial_ends_at,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    hasCustomer: row.stripe_customer_id !== null,
    hasSubscription: row.stripe_subscription_id !== null && LIVE_STATUSES.has(row.subscription_status),
    activeProjects: projects.count ?? 0,
    limit: projectLimit(plan),
    writable: subscriptionAllowsWrites(row.subscription_status, row.trial_ends_at),
  };
}

const INTERVALS = ["day", "week", "month", "year"] as const;

export type PlanPrice = { amount: number; currency: string; interval: (typeof INTERVALS)[number] | null };

/**
 * Prisene på planene, hentet fra Stripe og mellomlagret i en time. En plan
 * uten pris (ikke satt opp, eller Stripe svarer ikke) har null.
 */
export async function getPlanPrices(): Promise<Record<PurchasablePlan, PlanPrice | null>> {
  "use cache";
  cacheLife("hours");
  cacheTag("stripe-prices");
  const stripe = stripeClient();
  const entries = await Promise.all(
    PURCHASABLE_PLANS.map(async (plan): Promise<[PurchasablePlan, PlanPrice | null]> => {
      const priceId = priceIdFor(plan);
      if (!stripe || !priceId) {
        return [plan, null];
      }
      try {
        const price = await stripe.prices.retrieve(priceId);
        if (price.unit_amount === null) {
          return [plan, null];
        }
        const interval = INTERVALS.find((value) => value === price.recurring?.interval) ?? null;
        return [plan, { amount: price.unit_amount / 100, currency: price.currency.toUpperCase(), interval }];
      } catch (error) {
        console.error(error);
        return [plan, null];
      }
    }),
  );
  return Object.fromEntries(entries) as Record<PurchasablePlan, PlanPrice | null>;
}
