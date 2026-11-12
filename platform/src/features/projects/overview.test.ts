import { describe, expect, it } from "vitest";

import { onboardingSteps, parseProjectOverview, type ProjectOverview } from "@/features/projects/overview";

const SELECTOR = "11111111-1111-4111-8111-111111111111";
const SITE = "22222222-2222-4222-8222-222222222222";

function overview(patch: Partial<ProjectOverview> = {}): ProjectOverview {
  return {
    counts: { upcoming: 0, available: 0, reserved: 0, sold: 0 },
    totalUnits: 0,
    soldValue: 0,
    soldWithoutPrice: 0,
    viewsWithImage: 0,
    markedUnits: 0,
    selector: null,
    site: null,
    ...patch,
  };
}

describe("parseProjectOverview", () => {
  it("leser antall og verdi per status", () => {
    const result = parseProjectOverview({
      statuses: [
        { status: "available", units: 14, value: 61_400_000, unpriced: 0 },
        { status: "reserved", units: 2, value: 8_900_000, unpriced: 0 },
        { status: "sold", units: 8, value: 35_250_000, unpriced: 1 },
      ],
      views_with_image: 1,
      marked_units: 24,
      selector: { id: SELECTOR, published: true },
      site: { id: SITE, published: false },
    });
    expect(result.counts).toEqual({ upcoming: 0, available: 14, reserved: 2, sold: 8 });
    expect(result.totalUnits).toBe(24);
    expect(result.soldValue).toBe(35_250_000);
    expect(result.soldWithoutPrice).toBe(1);
    expect(result.markedUnits).toBe(24);
    expect(result.selector).toEqual({ id: SELECTOR, published: true });
    expect(result.site).toEqual({ id: SITE, published: false });
  });

  it("gir null i verdi når ingen enheter er solgt", () => {
    const result = parseProjectOverview({ statuses: [], views_with_image: 0, marked_units: 0, selector: null, site: null });
    expect(result.totalUnits).toBe(0);
    expect(result.soldValue).toBe(0);
    expect(result.soldWithoutPrice).toBe(0);
  });

  it("avviser ukjent status", () => {
    expect(() =>
      parseProjectOverview({
        statuses: [{ status: "gone", units: 1, value: 0, unpriced: 1 }],
        views_with_image: 0,
        marked_units: 0,
        selector: null,
        site: null,
      }),
    ).toThrow();
  });
});

describe("onboardingSteps", () => {
  const base = "/demo/projects/fjordparken";
  const done = (steps: ReturnType<typeof onboardingSteps>) => steps.filter((step) => step.done).map((step) => step.key);

  it("har organisasjon og prosjekt ferdig fra start, og peker til enhetene", () => {
    const steps = onboardingSteps(overview(), base);
    expect(steps.map((step) => step.key)).toEqual(["organization", "project", "units", "selector", "template", "publish"]);
    expect(done(steps)).toEqual(["organization", "project"]);
    expect(steps.find((step) => !step.done)?.href).toBe(`${base}/units`);
  });

  it("krever både bilde og markerte enheter for boligvelgeren", () => {
    const imageOnly = onboardingSteps(
      overview({ totalUnits: 24, viewsWithImage: 1, selector: { id: SELECTOR, published: false } }),
      base,
    );
    const selectorStep = imageOnly.find((step) => step.key === "selector");
    expect(selectorStep?.done).toBe(false);
    expect(selectorStep?.href).toBe(`${base}/selectors/${SELECTOR}`);
    expect(selectorStep?.note).toEqual({ kind: "marked", marked: 0, total: 24 });

    const marked = onboardingSteps(
      overview({ totalUnits: 24, viewsWithImage: 1, markedUnits: 18, selector: { id: SELECTOR, published: false } }),
      base,
    );
    expect(marked.find((step) => step.key === "selector")?.done).toBe(true);
  });

  it("peker til listen over boligvelgere når prosjektet ikke har en", () => {
    const steps = onboardingSteps(overview({ totalUnits: 3 }), base);
    expect(steps.find((step) => step.key === "selector")?.href).toBe(`${base}/selectors`);
    expect(steps.find((step) => step.key === "units")?.note).toEqual({ kind: "units", count: 3 });
  });

  it("er ikke publisert før boligvelgeren også er publisert", () => {
    const steps = onboardingSteps(
      overview({
        totalUnits: 24,
        viewsWithImage: 1,
        markedUnits: 24,
        selector: { id: SELECTOR, published: false },
        site: { id: SITE, published: true },
      }),
      base,
    );
    const publish = steps.find((step) => step.key === "publish");
    expect(publish?.done).toBe(false);
    expect(publish?.note).toEqual({ kind: "selectorUnpublished" });
    expect(publish?.href).toBe(`${base}/selectors/${SELECTOR}`);
  });

  it("er ferdig når prosjektsiden og boligvelgeren er publisert", () => {
    const steps = onboardingSteps(
      overview({
        totalUnits: 24,
        viewsWithImage: 1,
        markedUnits: 24,
        selector: { id: SELECTOR, published: true },
        site: { id: SITE, published: true },
      }),
      base,
    );
    expect(steps.every((step) => step.done)).toBe(true);
  });

  it("godtar en publisert prosjektside uten boligvelger", () => {
    const steps = onboardingSteps(overview({ totalUnits: 2, site: { id: SITE, published: true } }), base);
    expect(steps.find((step) => step.key === "publish")?.done).toBe(true);
    expect(steps.find((step) => step.key === "template")?.done).toBe(true);
  });
});
