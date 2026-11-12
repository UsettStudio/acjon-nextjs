import { describe, expect, it } from "vitest";

import {
  LAUNCH_MAX_SELF_SERVE_UNITS,
  LAUNCH_TIERS,
  launchOptionFor,
  launchQuote,
  launchTierByMax,
  launchTierFor,
  toMinorUnits,
} from "@/lib/billing/launch";

const notLaunched = (units: number) => ({ launchedAt: null, unitLimit: null, units });
const launched = (units: number, unitLimit: number | null) => ({ launchedAt: "2026-11-12T10:00:00.000Z", unitLimit, units });

describe("nivåene for oppstartsavgiften", () => {
  it("dekker 1 til 199 enheter uten hull eller overlapp, og blir dyrere for hvert nivå", () => {
    expect(LAUNCH_TIERS[0]?.minUnits).toBe(1);
    for (let index = 1; index < LAUNCH_TIERS.length; index += 1) {
      const previous = LAUNCH_TIERS[index - 1]!;
      const tier = LAUNCH_TIERS[index]!;
      expect(tier.minUnits).toBe(previous.maxUnits + 1);
      expect(tier.amount).toBeGreaterThan(previous.amount);
    }
    expect(LAUNCH_MAX_SELF_SERVE_UNITS).toBe(199);
  });

  it("har prisene i kroner uten mva.", () => {
    expect(LAUNCH_TIERS.map((tier) => [tier.minUnits, tier.maxUnits, tier.amount])).toEqual([
      [1, 9, 6_900],
      [10, 19, 11_900],
      [20, 39, 15_900],
      [40, 69, 21_900],
      [70, 99, 26_900],
      [100, 149, 35_900],
      [150, 199, 49_900],
    ]);
  });

  it("finner nivået for et antall enheter, og regner et prosjekt uten enheter som det minste", () => {
    expect(launchTierFor(0)?.maxUnits).toBe(9);
    expect(launchTierFor(9)?.maxUnits).toBe(9);
    expect(launchTierFor(10)?.maxUnits).toBe(19);
    expect(launchTierFor(48)?.maxUnits).toBe(69);
    expect(launchTierFor(199)?.maxUnits).toBe(199);
    expect(launchTierFor(200)).toBeNull();
    expect(launchTierByMax(39)?.amount).toBe(15_900);
    expect(launchTierByMax(40)).toBeNull();
  });

  it("gjør kroner om til øre for Stripe", () => {
    expect(toMinorUnits(21_900)).toBe(2_190_000);
  });
});

describe("launchQuote", () => {
  it("tilbyr nivået som dekker enhetene og de høyere nivåene før lansering", () => {
    const quote = launchQuote(notLaunched(24));
    expect(quote.kind).toBe("launch");
    if (quote.kind !== "launch") {
      return;
    }
    expect(quote.options[0]).toEqual({ tier: { minUnits: 20, maxUnits: 39, amount: 15_900 }, amount: 15_900 });
    expect(quote.options.map((option) => option.tier.maxUnits)).toEqual([39, 69, 99, 149, 199]);
  });

  it("henviser prosjekter med mer enn 199 enheter til avtale", () => {
    expect(launchQuote(notLaunched(240))).toEqual({ kind: "contact" });
  });

  it("tar bare forskjellen ved utvidelse, og bare for nivåer over det som er betalt", () => {
    const quote = launchQuote(launched(39, 39));
    expect(quote.kind).toBe("upgrade");
    if (quote.kind !== "upgrade") {
      return;
    }
    expect(quote.current?.maxUnits).toBe(39);
    expect(quote.options.map((option) => [option.tier.maxUnits, option.amount])).toEqual([
      [69, 6_000],
      [99, 11_000],
      [149, 20_000],
      [199, 34_000],
    ]);
  });

  it("har ingen utvidelse på det høyeste nivået", () => {
    const quote = launchQuote(launched(150, 199));
    expect(quote).toEqual({ kind: "upgrade", current: { minUnits: 150, maxUnits: 199, amount: 49_900 }, options: [] });
  });

  it("regner en grense fra en avtale som nivået den ligger i", () => {
    const quote = launchQuote(launched(50, 50));
    expect(quote.kind === "upgrade" ? quote.options.map((option) => [option.tier.maxUnits, option.amount]) : []).toEqual([
      [99, 5_000],
      [149, 14_000],
      [199, 28_000],
    ]);
  });

  it("har ingenting å betale for et prosjekt uten grense", () => {
    expect(launchQuote(launched(500, null))).toEqual({ kind: "unlimited" });
  });
});

describe("launchOptionFor", () => {
  it("godtar bare nivåer prosjektet kan velge nå", () => {
    expect(launchOptionFor(notLaunched(24), 39)).toEqual({ kind: "launch", option: { tier: launchTierByMax(39), amount: 15_900 } });
    expect(launchOptionFor(notLaunched(24), 19)).toBeNull();
    expect(launchOptionFor(notLaunched(24), 40)).toBeNull();
    expect(launchOptionFor(launched(39, 39), 69)).toEqual({ kind: "upgrade", option: { tier: launchTierByMax(69), amount: 6_000 } });
    expect(launchOptionFor(launched(39, 39), 39)).toBeNull();
    expect(launchOptionFor(launched(10, null), 199)).toBeNull();
  });
});
