import { z } from "zod";

/**
 * Sporingskoder for prosjektsiden (projects.analytics_ids). Samme mønstre som
 * app.valid_analytics_ids() i databasen. Kodene lastes på den publiserte siden
 * først etter samtykke.
 */
export const analyticsIdsSchema = z.object({
  ga4: z.string().trim().toUpperCase().regex(/^(G-[A-Z0-9]{4,20})?$/, { error: "ga4Invalid" }),
  gtm: z.string().trim().toUpperCase().regex(/^(GTM-[A-Z0-9]{4,12})?$/, { error: "gtmInvalid" }),
  meta_pixel: z.string().trim().regex(/^([0-9]{6,20})?$/, { error: "metaPixelInvalid" }),
});

export type AnalyticsIdsInput = z.input<typeof analyticsIdsSchema>;

/** Bare kodene som er fylt ut lagres. */
export function compactAnalyticsIds(values: z.output<typeof analyticsIdsSchema>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
}

export function analyticsIdsFormValues(value: unknown): AnalyticsIdsInput {
  const ids = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const text = (key: string) => (typeof ids[key] === "string" ? (ids[key] as string) : "");
  return { ga4: text("ga4"), gtm: text("gtm"), meta_pixel: text("meta_pixel") };
}
