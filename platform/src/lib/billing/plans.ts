/**
 * Planer etter antall aktive prosjekter. Speiler app.plan_project_limit() og
 * app.is_active_phase() i databasen (migrasjon 0012), som håndhever grensen.
 * Prisene settes i Stripe; appen kobler planene til Stripe-prisene med
 * STRIPE_PRICE_START, STRIPE_PRICE_GROWTH og STRIPE_PRICE_PRO.
 */

export const PLANS = ["trial", "start", "growth", "pro", "enterprise"] as const;
export type Plan = (typeof PLANS)[number];

/** Planene kunden kan velge selv i Checkout. Enterprise avtales særskilt. */
export const PURCHASABLE_PLANS = ["start", "growth", "pro"] as const;
export type PurchasablePlan = (typeof PURCHASABLE_PLANS)[number];

/** Høyeste antall aktive prosjekter samtidig. null betyr ingen grense. */
export const PROJECT_LIMITS: Record<Plan, number | null> = {
  trial: 3,
  start: 1,
  growth: 5,
  pro: 15,
  enterprise: null,
};

/** Kommer for salg, I salg og Utsolgt. Utkast, Ferdigstilt og Arkivert teller ikke. */
export const ACTIVE_PHASES = ["coming_soon", "for_sale", "sold_out"] as const;

export function isPlan(value: unknown): value is Plan {
  return typeof value === "string" && (PLANS as readonly string[]).includes(value);
}

export function isPurchasablePlan(value: unknown): value is PurchasablePlan {
  return typeof value === "string" && (PURCHASABLE_PLANS as readonly string[]).includes(value);
}

export function projectLimit(plan: string): number | null {
  return isPlan(plan) ? PROJECT_LIMITS[plan] : PROJECT_LIMITS.start;
}

export function isActivePhase(phase: string): boolean {
  return (ACTIVE_PHASES as readonly string[]).includes(phase);
}
