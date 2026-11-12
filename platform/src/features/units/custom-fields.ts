/**
 * Egne felt på enheter (units.custom_fields): navn og verdi som tekst, for
 * opplysninger standardfeltene ikke dekker, for eksempel takhøyde eller peis.
 * Prosjektet velger hvilke felt som er offentlige (projects.settings.public_custom_fields).
 * Databasen sender bare de offentlige feltene til publiserte sider.
 */

import { z } from "zod";

export const MAX_CUSTOM_FIELDS = 30;

export type CustomFieldInput = { key: string; value: string };

const normalizedKey = (key: string) => key.trim().toLocaleLowerCase("nb");

/** Feltene i skjemaet som liste. Lagres som objekt; tomme verdier lagres ikke. */
export const customFieldsSchema = z
  .array(
    z.object({
      key: z.string().trim().min(1, { error: "required" }).max(60, { error: "textTooLong" }),
      value: z.string().trim().max(500, { error: "textTooLong" }),
    }),
  )
  .max(MAX_CUSTOM_FIELDS, { error: "textTooLong" })
  .superRefine((items, ctx) => {
    const seen = new Set<string>();
    for (const [index, item] of items.entries()) {
      const key = normalizedKey(item.key);
      if (key && seen.has(key)) {
        ctx.addIssue({ code: "custom", path: [index, "key"], message: "customFieldDuplicate" });
      }
      seen.add(key);
    }
  })
  .transform((items) => Object.fromEntries(items.filter((item) => item.value !== "").map((item) => [item.key, item.value])) as Record<string, string>);

/** Verdien som tekst. Tall og ja/nei fra import vises som de er; lister og objekter vises ikke. */
export function customFieldText(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "✓" : null;
  }
  return null;
}

/** Lagrede felt som rader i skjemaet. */
export function customFieldsToInput(value: unknown): CustomFieldInput[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [];
  }
  return Object.entries(value).flatMap(([key, item]) => {
    const text = customFieldText(item);
    return text === null ? [] : [{ key, value: text }];
  });
}

/** Feltnavnene som brukes på enhetene i et prosjekt, sortert. */
export function customFieldKeys(values: unknown[]): string[] {
  const keys = new Set<string>();
  for (const value of values) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      for (const key of Object.keys(value)) {
        keys.add(key);
      }
    }
  }
  return [...keys].sort((a, b) => a.localeCompare(b, "nb"));
}

/** Offentlige felt på en enhet, sortert på navn (jsonb bevarer ikke rekkefølgen på nøklene). */
export function publicCustomFields(value: unknown): { label: string; value: string }[] {
  return customFieldsToInput(value)
    .sort((a, b) => a.key.localeCompare(b.key, "nb"))
    .map((item) => ({ label: item.key, value: item.value }));
}
