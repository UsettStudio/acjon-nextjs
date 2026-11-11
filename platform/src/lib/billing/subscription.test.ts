import { describe, expect, it } from "vitest";

import { subscriptionAllowsWrites, trialDaysLeft } from "@/lib/billing/subscription";

const now = new Date("2026-11-12T12:00:00Z");

describe("subscriptionAllowsWrites (speiler app.subscription_allows_writes)", () => {
  it("tillater endringer med aktivt abonnement og mens betalingen prøves på nytt", () => {
    expect(subscriptionAllowsWrites("active", null, now)).toBe(true);
    expect(subscriptionAllowsWrites("past_due", null, now)).toBe(true);
  });

  it("tillater endringer i prøveperioden, men ikke etter at den er ute", () => {
    expect(subscriptionAllowsWrites("trialing", "2026-11-20T00:00:00Z", now)).toBe(true);
    expect(subscriptionAllowsWrites("trialing", "2026-11-12T11:59:59Z", now)).toBe(false);
  });

  it.each(["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"] as const)(
    "%s gir lesemodus",
    (status) => {
      expect(subscriptionAllowsWrites(status, null, now)).toBe(false);
    },
  );
});

describe("trialDaysLeft", () => {
  it("runder opp til hele dager og stopper på 0", () => {
    expect(trialDaysLeft("2026-11-13T12:00:00Z", now)).toBe(1);
    expect(trialDaysLeft("2026-11-13T12:00:01Z", now)).toBe(2);
    expect(trialDaysLeft("2026-11-01T00:00:00Z", now)).toBe(0);
    expect(trialDaysLeft(null, now)).toBeNull();
  });
});
