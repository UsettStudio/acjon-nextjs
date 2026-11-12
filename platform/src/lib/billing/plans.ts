/**
 * Pakkene. Speiler app.plan_member_limit(), app.plan_domain_limit() og
 * app.plan_allows() i databasen (migrasjon 0015), som håndhever grensene.
 * Månedsprisene settes i Stripe; appen kobler pakkene til Stripe-prisene med
 * STRIPE_PRICE_START, STRIPE_PRICE_PRO og STRIPE_PRICE_PARTNER.
 * Oppstartsavgiften per prosjekt står i launch.ts.
 */

export const PLANS = ["trial", "start", "pro", "partner", "enterprise"] as const;
export type Plan = (typeof PLANS)[number];

/** Pakkene kunden kan velge selv i Checkout. Enterprise avtales særskilt. */
export const PURCHASABLE_PLANS = ["start", "pro", "partner"] as const;
export type PurchasablePlan = (typeof PURCHASABLE_PLANS)[number];

/**
 * Funksjoner som ikke er med i alle pakker: api (API-nøkler og det offentlige
 * lese-API-et), webhooks og embed (boligvelgeren bygd inn på andre nettsteder).
 */
export const PLAN_FEATURES = ["api", "webhooks", "embed"] as const;
export type PlanFeature = (typeof PLAN_FEATURES)[number];

export type PlanLimits = {
  /** Brukere (medlemmer og ventende invitasjoner). null betyr ingen grense. */
  members: number | null;
  /** Egne domener per prosjektside. */
  domainsPerSite: number;
  features: readonly PlanFeature[];
};

/**
 * Prøveperioden har det samme som Pro, så alt kan prøves. Partner har i
 * tillegg oppsett, opplæring og prioritert support, som leveres utenfor appen.
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  trial: { members: 10, domainsPerSite: 10, features: PLAN_FEATURES },
  start: { members: 3, domainsPerSite: 1, features: [] },
  pro: { members: 10, domainsPerSite: 10, features: PLAN_FEATURES },
  partner: { members: null, domainsPerSite: 10, features: PLAN_FEATURES },
  enterprise: { members: null, domainsPerSite: 10, features: PLAN_FEATURES },
};

export function isPlan(value: unknown): value is Plan {
  return typeof value === "string" && (PLANS as readonly string[]).includes(value);
}

export function isPurchasablePlan(value: unknown): value is PurchasablePlan {
  return typeof value === "string" && (PURCHASABLE_PLANS as readonly string[]).includes(value);
}

/** Grensene for en pakke. En ukjent pakke får de strengeste, som i databasen. */
export function planLimits(plan: string): PlanLimits {
  return isPlan(plan) ? PLAN_LIMITS[plan] : PLAN_LIMITS.start;
}

export function planAllows(plan: string, feature: PlanFeature): boolean {
  return planLimits(plan).features.includes(feature);
}

/** Den minste pakken kunden kan kjøpe som har funksjonen («Krever Pro»). */
export function cheapestPlanWith(feature: PlanFeature): PurchasablePlan {
  return PURCHASABLE_PLANS.find((plan) => planAllows(plan, feature)) ?? "partner";
}
