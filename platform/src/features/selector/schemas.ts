/**
 * Skjemaer for boligvelgeren. Brukes både i skjemaene i nettleseren og i
 * serverhandlingene, så reglene er de samme begge steder. Feilmeldingene er
 * nøkler under «validation».
 */

import { z } from "zod";

import { FILTER_KEYS } from "@/features/selector/model";

export const VIEW_KINDS = ["overview", "facade", "floor", "site_plan"] as const;
export type ViewKind = (typeof VIEW_KINDS)[number];

export const selectorNameSchema = z.string().trim().min(1, { error: "nameLength" }).max(200, { error: "nameLength" });

export const viewInputSchema = z.object({
  name: selectorNameSchema,
  kind: z.enum(VIEW_KINDS, { error: "optionInvalid" }),
  parentViewId: z.uuid({ error: "optionInvalid" }).nullable(),
  angleGroup: z
    .string()
    .trim()
    .max(100, { error: "textTooLong" })
    .transform((value) => value || null),
});

export type ViewInput = z.input<typeof viewInputSchema>;

export const selectorSettingsInputSchema = z.object({
  filters: z.array(z.enum(FILTER_KEYS)).max(FILTER_KEYS.length),
  list: z.enum(["side", "below", "hidden"]),
  hatch_sold: z.boolean(),
});
