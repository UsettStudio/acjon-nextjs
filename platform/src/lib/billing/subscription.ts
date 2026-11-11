export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/**
 * Om organisasjonen kan gjøre endringer. Speiler app.subscription_allows_writes()
 * i databasen. Ellers er organisasjonen i lesemodus.
 */
export function subscriptionAllowsWrites(
  status: SubscriptionStatus,
  trialEndsAt: string | null,
  now: Date = new Date(),
): boolean {
  switch (status) {
    case "active":
    case "past_due":
      return true;
    case "trialing":
      return trialEndsAt === null || new Date(trialEndsAt).getTime() > now.getTime();
    default:
      return false;
  }
}

/** Hele dager igjen av prøveperioden (0 når den er ute). */
export function trialDaysLeft(trialEndsAt: string | null, now: Date = new Date()): number | null {
  if (trialEndsAt === null) {
    return null;
  }
  const ms = new Date(trialEndsAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
