import { z } from "zod";

import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";

/**
 * Prosjektoversikten (modul 5): antall og verdi per status, og fremdriften i
 * oppstarten. Dataene kommer fra databasefunksjonen project_overview.
 */
export type ProjectOverview = {
  counts: Record<UnitStatus, number>;
  totalUnits: number;
  /** Summen av prisen på solgte enheter. Omkostninger og fellesgjeld er ikke med. */
  soldValue: number;
  /** Solgte enheter uten pris. De er ikke med i soldValue. */
  soldWithoutPrice: number;
  viewsWithImage: number;
  /** Enheter som er koblet til minst én markering i en boligvelger. */
  markedUnits: number;
  selector: { id: string; published: boolean } | null;
  site: { id: string; published: boolean } | null;
};

const target = z.object({ id: z.uuid(), published: z.boolean() }).nullable();

const overviewSchema = z.object({
  statuses: z.array(
    z.object({
      status: z.enum(UNIT_STATUSES),
      units: z.number().int().nonnegative(),
      value: z.number().nonnegative(),
      unpriced: z.number().int().nonnegative(),
    }),
  ),
  views_with_image: z.number().int().nonnegative(),
  marked_units: z.number().int().nonnegative(),
  selector: target,
  site: target,
});

export function parseProjectOverview(data: unknown): ProjectOverview {
  const parsed = overviewSchema.parse(data);
  const counts = Object.fromEntries(UNIT_STATUSES.map((status) => [status, 0])) as Record<UnitStatus, number>;
  let soldValue = 0;
  let soldWithoutPrice = 0;
  for (const row of parsed.statuses) {
    counts[row.status] = row.units;
    if (row.status === "sold") {
      soldValue = row.value;
      soldWithoutPrice = row.unpriced;
    }
  }
  return {
    counts,
    totalUnits: UNIT_STATUSES.reduce((sum, status) => sum + counts[status], 0),
    soldValue,
    soldWithoutPrice,
    viewsWithImage: parsed.views_with_image,
    markedUnits: parsed.marked_units,
    selector: parsed.selector,
    site: parsed.site,
  };
}

export const ONBOARDING_STEPS = ["organization", "project", "units", "selector", "template", "publish"] as const;
export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number];

export type OnboardingStep = {
  key: OnboardingStepKey;
  done: boolean;
  /** Hvor brukeren gjør steget. Null for steg som alltid er gjort. */
  href: string | null;
  /** Tilleggsopplysning som vises under steget. */
  note:
    | { kind: "units"; count: number }
    | { kind: "marked"; marked: number; total: number }
    | { kind: "selectorUnpublished" }
    | null;
};

/**
 * Sjekklisten fra oppstartsveiviseren i spesifikasjonen: opprett organisasjon,
 * opprett prosjekt, legg inn eller importer enheter, last opp bilde og marker,
 * velg mal og publiser.
 *
 * Publiseringen er ferdig når prosjektsiden er publisert, og boligvelgeren også
 * er det hvis prosjektet har en. En upublisert boligvelger vises ikke på siden.
 */
export function onboardingSteps(overview: ProjectOverview, projectPath: string): OnboardingStep[] {
  const { selector, site } = overview;
  const selectorPath = selector ? `${projectPath}/selectors/${selector.id}` : `${projectPath}/selectors`;
  const sitePublished = site?.published === true;
  const selectorReady = selector === null || selector.published;
  return [
    { key: "organization", done: true, href: null, note: null },
    { key: "project", done: true, href: null, note: null },
    {
      key: "units",
      done: overview.totalUnits > 0,
      href: `${projectPath}/units`,
      note: overview.totalUnits > 0 ? { kind: "units", count: overview.totalUnits } : null,
    },
    {
      key: "selector",
      done: overview.viewsWithImage > 0 && overview.markedUnits > 0,
      href: selectorPath,
      note:
        overview.viewsWithImage > 0 && overview.totalUnits > 0
          ? { kind: "marked", marked: overview.markedUnits, total: overview.totalUnits }
          : null,
    },
    { key: "template", done: site !== null, href: `${projectPath}/site`, note: null },
    {
      key: "publish",
      done: sitePublished && selectorReady,
      href: sitePublished && !selectorReady ? selectorPath : `${projectPath}/site`,
      note: sitePublished && !selectorReady ? { kind: "selectorUnpublished" } : null,
    },
  ];
}
