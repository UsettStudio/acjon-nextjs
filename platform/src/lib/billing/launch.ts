/**
 * Oppstartsavgiften per prosjekt. Den betales én gang, før prosjektet
 * publiseres første gang, og følger antall enheter. Beløpene er i kroner uten
 * mva. og gjelder alle pakkene.
 *
 * Avgiften dekker et nivå (for eksempel inntil 39 enheter). Databasen stopper
 * nye enheter utover nivået (app.limit_launched_units). Da betales
 * differansen opp til et høyere nivå. Prosjekter med flere enheter enn det
 * høyeste nivået avtales særskilt og lanseres av oss med
 * public.waive_project_launch().
 */

export type LaunchTier = {
  minUnits: number;
  maxUnits: number;
  /** Kroner uten mva. */
  amount: number;
};

export const LAUNCH_TIERS: readonly LaunchTier[] = [
  { minUnits: 1, maxUnits: 9, amount: 6_900 },
  { minUnits: 10, maxUnits: 19, amount: 11_900 },
  { minUnits: 20, maxUnits: 39, amount: 15_900 },
  { minUnits: 40, maxUnits: 69, amount: 21_900 },
  { minUnits: 70, maxUnits: 99, amount: 26_900 },
  { minUnits: 100, maxUnits: 149, amount: 35_900 },
  { minUnits: 150, maxUnits: 199, amount: 49_900 },
];

export const LAUNCH_CURRENCY = "nok";

/** Høyeste antall enheter som kan lanseres uten avtale. */
export const LAUNCH_MAX_SELF_SERVE_UNITS = LAUNCH_TIERS[LAUNCH_TIERS.length - 1]!.maxUnits;

/**
 * Nivået for et antall enheter. Et prosjekt uten enheter regnes som det
 * minste nivået. null betyr flere enheter enn det høyeste nivået (avtale).
 */
export function launchTierFor(units: number): LaunchTier | null {
  const count = Math.max(1, Math.floor(units));
  return LAUNCH_TIERS.find((tier) => count <= tier.maxUnits) ?? null;
}

/** Nivået som har maxUnits som øvre grense, eller null. */
export function launchTierByMax(maxUnits: number): LaunchTier | null {
  return LAUNCH_TIERS.find((tier) => tier.maxUnits === maxUnits) ?? null;
}

export type LaunchState = {
  /** Når prosjektet ble lansert, eller null. */
  launchedAt: string | null;
  /** Antall enheter avgiften dekker. null: ingen grense (avtale), eller ikke lansert. */
  unitLimit: number | null;
  /** Enheter i prosjektet nå. */
  units: number;
};

export type LaunchOption = {
  tier: LaunchTier;
  /** Kroner uten mva. som skal betales nå. */
  amount: number;
};

export type LaunchQuote =
  /** Ikke lansert: velg et nivå som dekker enhetene. Det første valget er det minste. */
  | { kind: "launch"; options: LaunchOption[] }
  /** Lansert: utvid til et høyere nivå og betal differansen. Tom liste: høyeste nivå er nådd. */
  | { kind: "upgrade"; current: LaunchTier | null; options: LaunchOption[] }
  /** Lansert uten grense (avtale). */
  | { kind: "unlimited" }
  /** Flere enheter enn det høyeste nivået: avtales særskilt. */
  | { kind: "contact" };

/**
 * Hva prosjektet kan betale nå. Nivåene under det prosjektet trenger, vises
 * ikke. En utvidelse koster forskjellen mellom nivået det går til, og nivået
 * som er betalt. Har prosjektet en grense fra en avtale som ikke er et av
 * nivåene, regnes det betalte som nivået grensen ligger i.
 */
export function launchQuote(state: LaunchState): LaunchQuote {
  if (state.launchedAt === null) {
    const needed = launchTierFor(state.units);
    if (!needed) {
      return { kind: "contact" };
    }
    return {
      kind: "launch",
      options: LAUNCH_TIERS.filter((tier) => tier.maxUnits >= needed.maxUnits).map((tier) => ({ tier, amount: tier.amount })),
    };
  }
  if (state.unitLimit === null) {
    return { kind: "unlimited" };
  }
  const current = launchTierFor(state.unitLimit);
  const paid = current?.amount ?? 0;
  const neededUnits = Math.max(state.units, state.unitLimit + 1);
  return {
    kind: "upgrade",
    current,
    options: LAUNCH_TIERS.filter((tier) => tier.maxUnits >= neededUnits && tier.amount > paid).map((tier) => ({
      tier,
      amount: tier.amount - paid,
    })),
  };
}

/** Valget for et bestemt nivå (maxUnits), eller null når nivået ikke kan velges nå. */
export function launchOptionFor(state: LaunchState, maxUnits: number): { kind: "launch" | "upgrade"; option: LaunchOption } | null {
  const quote = launchQuote(state);
  if (quote.kind !== "launch" && quote.kind !== "upgrade") {
    return null;
  }
  const option = quote.options.find((candidate) => candidate.tier.maxUnits === maxUnits);
  return option ? { kind: quote.kind, option } : null;
}

/** Kroner til øre for Stripe. */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}
