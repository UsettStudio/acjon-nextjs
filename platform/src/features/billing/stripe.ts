import "server-only";

import Stripe from "stripe";

import { PURCHASABLE_PLANS, isPurchasablePlan, type Plan, type PurchasablePlan } from "@/lib/billing/plans";
import { serverEnv } from "@/lib/env.server";

/**
 * Stripe-klienten, eller null når STRIPE_SECRET_KEY ikke er satt. API-versjonen
 * er låst, så endringer hos Stripe ikke endrer formen på svarene uten at vi
 * oppgraderer.
 */
let client: Stripe | null | undefined;

export function stripeClient(): Stripe | null {
  if (client !== undefined) {
    return client;
  }
  const env = serverEnv();
  if (!env.stripeSecretKey) {
    client = null;
    return client;
  }
  const base = env.stripeApiBase ? new URL(env.stripeApiBase) : null;
  client = new Stripe(env.stripeSecretKey, {
    apiVersion: "2026-10-28.endive",
    maxNetworkRetries: 2,
    timeout: 20_000,
    ...(base
      ? {
          host: base.hostname,
          port: Number(base.port || (base.protocol === "http:" ? 80 : 443)),
          protocol: base.protocol === "http:" ? ("http" as const) : ("https" as const),
        }
      : {}),
  });
  return client;
}

export function priceIdFor(plan: PurchasablePlan): string | undefined {
  return serverEnv().stripePrices[plan];
}

/**
 * Pakken til en Stripe-pris. Prisene i miljøvariablene gjelder først. Andre
 * priser kan merkes med metadata «plan» i Stripe (for eksempel enterprise).
 */
export function planForPrice(priceId: string, metadataPlan?: string | null): Exclude<Plan, "trial"> | null {
  const prices = serverEnv().stripePrices;
  for (const plan of PURCHASABLE_PLANS) {
    if (prices[plan] === priceId) {
      return plan;
    }
  }
  if (metadataPlan === "enterprise" || isPurchasablePlan(metadataPlan)) {
    return metadataPlan;
  }
  return null;
}

export function customerId(customer: string | { id: string }): string {
  return typeof customer === "string" ? customer : customer.id;
}
