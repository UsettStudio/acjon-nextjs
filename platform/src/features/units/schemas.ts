import { z } from "zod";

import {
  coerceUnitField,
  isUnitStatus,
  UNIT_FIELD_KEYS,
  UNIT_STATUSES,
  type UnitFieldKey,
  type UnitFieldValues,
  type UnitType,
} from "@/features/units/fields";
import { parseNorwegianNumber } from "@/lib/format/parse";

/** Zod-felt som tolker verdien med samme regler som tabellen og importen. */
export function unitField<K extends UnitFieldKey>(key: K) {
  return z.unknown().transform((raw, ctx): UnitFieldValues[K] => {
    const result = coerceUnitField(key, raw);
    if (!result.ok) {
      ctx.addIssue({ code: "custom", message: result.error });
      return z.NEVER;
    }
    return result.value;
  });
}

const optionalId = z
  .union([z.uuid(), z.literal(""), z.null()])
  .transform((value) => (value === "" ? null : value));

/** Felt meglere kan endre: status og pris. Samme liste som triggeren i databasen. */
export const SALES_FIELDS = ["price", "purchase_costs", "shared_debt", "monthly_fee"] as const satisfies readonly UnitFieldKey[];
export type SalesField = (typeof SALES_FIELDS)[number];

export function isSalesField(key: string): key is SalesField {
  return (SALES_FIELDS as readonly string[]).includes(key);
}

/** Felt som kan endres i tabellen og i masseendring. Status endres med set_unit_status. */
export const EDITABLE_FIELDS = [...UNIT_FIELD_KEYS.filter((key) => key !== "status"), "stage_id", "building_id"] as const;
export type EditableField = Exclude<UnitFieldKey, "status"> | "stage_id" | "building_id";

export function isEditableField(key: string): key is EditableField {
  return (EDITABLE_FIELDS as readonly string[]).includes(key);
}

/** Påkrevde felt (nummer, type og «skjult») kan endres, men ikke tømmes. */
export type UnitPatch = Partial<Omit<UnitFieldValues, "status" | "unit_number" | "unit_type" | "is_hidden">> & {
  unit_number?: string;
  unit_type?: UnitType;
  is_hidden?: boolean;
  stage_id?: string | null;
  building_id?: string | null;
};

/** Validerer en endring av ett eller flere felt. Ukjente felt avvises. */
export function parseUnitPatch(
  input: Record<string, unknown>,
): { ok: true; patch: UnitPatch } | { ok: false; fieldErrors: Record<string, string> } {
  const patch: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  for (const [key, raw] of Object.entries(input)) {
    if (!isEditableField(key)) {
      fieldErrors[key] = "optionInvalid";
      continue;
    }
    if (key === "stage_id" || key === "building_id") {
      const parsed = optionalId.safeParse(raw);
      if (parsed.success) {
        patch[key] = parsed.data;
      } else {
        fieldErrors[key] = "optionInvalid";
      }
      continue;
    }
    const result = coerceUnitField(key, raw);
    if (!result.ok) {
      fieldErrors[key] = result.error;
      continue;
    }
    // Påkrevde felt kan ikke tømmes.
    if (result.value === null && (key === "unit_type" || key === "is_hidden" || key === "unit_number")) {
      fieldErrors[key] = "required";
      continue;
    }
    patch[key] = result.value;
  }
  if (Object.keys(patch).length === 0 && Object.keys(fieldErrors).length === 0) {
    fieldErrors._form = "required";
  }
  return Object.keys(fieldErrors).length > 0 ? { ok: false, fieldErrors } : { ok: true, patch: patch as UnitPatch };
}

const assetIds = (max: number) => z.array(z.uuid()).max(max);

/** Enhetsskjemaet. Status settes bare når enheten opprettes; senere endres den med notat via statusknappen. */
export const unitFormSchema = z.object({
  unit_number: unitField("unit_number"),
  title: unitField("title"),
  unit_type: unitField("unit_type"),
  floor: unitField("floor"),
  rooms: unitField("rooms"),
  bedrooms: unitField("bedrooms"),
  bathrooms: unitField("bathrooms"),
  bra_i: unitField("bra_i"),
  bra_e: unitField("bra_e"),
  bra_b: unitField("bra_b"),
  tba: unitField("tba"),
  plot_area: unitField("plot_area"),
  price: unitField("price"),
  purchase_costs: unitField("purchase_costs"),
  shared_debt: unitField("shared_debt"),
  monthly_fee: unitField("monthly_fee"),
  ownership_type: unitField("ownership_type"),
  orientation: unitField("orientation"),
  parking: unitField("parking"),
  storage: unitField("storage"),
  description: unitField("description"),
  external_id: unitField("external_id"),
  is_hidden: z.boolean(),
  stage_id: optionalId,
  building_id: optionalId,
  floor_plan_asset_ids: assetIds(20),
  gallery_asset_ids: assetIds(100),
  document_asset_ids: assetIds(50),
});

export const createUnitSchema = unitFormSchema.extend({
  status: z.enum(UNIT_STATUSES, { error: "optionInvalid" }),
});

export type UnitFormInput = z.input<typeof createUnitSchema>;
export type UnitFormOutput = z.output<typeof createUnitSchema>;

export const statusChangeSchema = z.object({
  unitIds: z.array(z.uuid()).min(1).max(5000),
  status: z.custom<(typeof UNIT_STATUSES)[number]>(isUnitStatus, { error: "optionInvalid" }),
  note: z
    .string()
    .trim()
    .max(1000, { error: "textTooLong" })
    .transform((value) => value || null),
  source: z.enum(["table", "form", "selector"]),
});

export const priceAdjustmentSchema = z.object({
  unitIds: z.array(z.uuid()).min(1).max(5000),
  percent: z
    .unknown()
    .transform((raw, ctx) => {
      const result = parseNorwegianNumber(raw);
      if (!result.ok || result.value === null) {
        ctx.addIssue({ code: "custom", message: "numberInvalid" });
        return z.NEVER;
      }
      return result.value;
    })
    .pipe(z.number().min(-90, { error: "percentRange" }).max(1000, { error: "percentRange" }).refine((value) => value !== 0, { error: "percentRange" })),
  roundTo: z.union([z.literal(1), z.literal(10), z.literal(100), z.literal(1000), z.literal(10000)]),
});
