import "server-only";

import type Stripe from "stripe";

import { customerId, planForPrice } from "@/features/billing/stripe";
import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "@/lib/billing/subscription";
import { createAdminClient } from "@/lib/supabase/admin";

function isSubscriptionStatus(value: string): value is SubscriptionStatus {
  return (SUBSCRIPTION_STATUSES as readonly string[]).includes(value);
}

function isoFromUnix(seconds: number | null | undefined): string | undefined {
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : undefined;
}

/**
 * Henter abonnementet på nytt fra Stripe og lagrer det med
 * apply_stripe_subscription(). Webhook-hendelser kan komme i feil rekkefølge;
 * ved alltid å lagre tilstanden slik Stripe har den nå, med tidspunktet for
 * hentingen, blir siste henting stående. Svarer med organisasjonens id, eller
 * null når abonnementet ikke hører til noen organisasjon.
 */
export async function syncSubscription(stripe: Stripe, subscriptionId: string): Promise<string | null> {
  const syncedAt = new Date().toISOString();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!isSubscriptionStatus(subscription.status)) {
    throw new Error(`Ukjent abonnementsstatus fra Stripe: ${subscription.status}`);
  }
  const item = subscription.items.data[0];
  const plan = item ? planForPrice(item.price.id, item.price.metadata?.plan) : null;
  const { data, error } = await createAdminClient().rpc("apply_stripe_subscription", {
    p_customer_id: customerId(subscription.customer),
    p_subscription_id: subscription.id,
    p_status: subscription.status,
    p_plan: plan ?? undefined,
    p_trial_ends_at: isoFromUnix(subscription.trial_end),
    p_current_period_end: isoFromUnix(item?.current_period_end),
    p_cancel_at_period_end: subscription.cancel_at_period_end,
    p_synced_at: syncedAt,
  });
  if (error) {
    throw error;
  }
  return data;
}

/** Abonnementet en hendelse gjelder, når hendelsen handler om et abonnement. */
export function subscriptionIdFromEvent(event: Stripe.Event): string | null {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.mode !== "subscription" || !session.subscription) {
        return null;
      }
      return typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "customer.subscription.trial_will_end":
      return event.data.object.id;
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.payment_action_required": {
      const subscription = event.data.object.parent?.subscription_details?.subscription;
      if (!subscription) {
        return null;
      }
      return typeof subscription === "string" ? subscription : subscription.id;
    }
    default:
      return null;
  }
}
