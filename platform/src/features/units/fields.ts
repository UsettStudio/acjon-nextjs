/**
 * Feltene på en enhet: typer, grenser og tolking av verdier. Samme regler brukes
 * i enhetsskjemaet, redigering i tabellen, import og på serveren, og grensene
 * er de samme som CHECK-reglene i databasen (tabellen units).
 */

import type { ValidationKey } from "@/lib/actions/result";
import { normalizeLabel, parseBoolean, parseFloor, parseNorwegianNumber } from "@/lib/format/parse";
import type { Database } from "@/lib/supabase/database.types";

export type UnitRow = Database["public"]["Tables"]["units"]["Row"];
export type UnitStatus = Database["public"]["Enums"]["unit_status"];
export type UnitType = Database["public"]["Enums"]["unit_type"];
export type OwnershipType = Database["public"]["Enums"]["ownership_type"];

export const UNIT_STATUSES = ["upcoming", "available", "reserved", "sold"] as const satisfies readonly UnitStatus[];
export const UNIT_TYPES = [
  "apartment",
  "townhouse",
  "detached",
  "semi_detached",
  "cabin",
  "plot",
  "commercial",
] as const satisfies readonly UnitType[];
export const OWNERSHIP_TYPES = ["selveier", "andel", "aksje"] as const satisfies readonly OwnershipType[];

export function isUnitStatus(value: unknown): value is UnitStatus {
  return typeof value === "string" && (UNIT_STATUSES as readonly string[]).includes(value);
}

type TextSpec = { kind: "text"; max: number; required?: boolean; multiline?: boolean };
type NumberSpec = {
  kind: "number";
  format: "integer" | "floor" | "currency" | "area";
  min: number;
  max: number;
};
type EnumSpec<T extends string> = { kind: "enum"; values: readonly T[]; synonyms: Record<string, T> };
type BooleanSpec = { kind: "boolean" };

/** Ord som brukes om statusene i regneark (bokmål, engelsk og svensk). Sammenlignes normalisert. */
const STATUS_SYNONYMS: Record<string, UnitStatus> = {
  kommende: "upcoming",
  kommer: "upcoming",
  "kommer for salg": "upcoming",
  "ikke i salg": "upcoming",
  "ikke lansert": "upcoming",
  "coming soon": "upcoming",
  kommande: "upcoming",
  ledig: "available",
  "til salgs": "available",
  tilgjengelig: "available",
  "for sale": "available",
  ledigt: "available",
  "till salu": "available",
  reservert: "reserved",
  opsjon: "reserved",
  "holdt av": "reserved",
  reserverad: "reserved",
  bokad: "reserved",
  solgt: "sold",
  utsolgt: "sold",
  sald: "sold",
};

const TYPE_SYNONYMS: Record<string, UnitType> = {
  leilighet: "apartment",
  lgh: "apartment",
  flat: "apartment",
  lagenhet: "apartment",
  rekkehus: "townhouse",
  kjedehus: "townhouse",
  radhus: "townhouse",
  enebolig: "detached",
  villa: "detached",
  "fristaende hus": "detached",
  tomannsbolig: "semi_detached",
  vertikaldelt: "semi_detached",
  "vertikaldelt tomannsbolig": "semi_detached",
  parhus: "semi_detached",
  "semi detached": "semi_detached",
  hytte: "cabin",
  fritidsbolig: "cabin",
  fritidshus: "cabin",
  stuga: "cabin",
  tomt: "plot",
  naering: "commercial",
  naeringslokale: "commercial",
  lokale: "commercial",
  kontor: "commercial",
  butikk: "commercial",
  lokal: "commercial",
};

const OWNERSHIP_SYNONYMS: Record<string, OwnershipType> = {
  selveiet: "selveier",
  freehold: "selveier",
  aganderatt: "selveier",
  borettslag: "andel",
  andelsleilighet: "andel",
  cooperative: "andel",
  bostadsratt: "andel",
  aksjeleilighet: "aksje",
  share: "aksje",
};

export const UNIT_FIELD_SPECS = {
  unit_number: { kind: "text", max: 40, required: true },
  title: { kind: "text", max: 200 },
  unit_type: { kind: "enum", values: UNIT_TYPES, synonyms: TYPE_SYNONYMS },
  status: { kind: "enum", values: UNIT_STATUSES, synonyms: STATUS_SYNONYMS },
  floor: { kind: "number", format: "floor", min: -10, max: 200 },
  rooms: { kind: "number", format: "integer", min: 0, max: 100 },
  bedrooms: { kind: "number", format: "integer", min: 0, max: 100 },
  bathrooms: { kind: "number", format: "integer", min: 0, max: 50 },
  bra_i: { kind: "number", format: "area", min: 0, max: 9_999_999 },
  bra_e: { kind: "number", format: "area", min: 0, max: 9_999_999 },
  bra_b: { kind: "number", format: "area", min: 0, max: 9_999_999 },
  tba: { kind: "number", format: "area", min: 0, max: 9_999_999 },
  plot_area: { kind: "number", format: "area", min: 0, max: 999_999_999 },
  price: { kind: "number", format: "currency", min: 0, max: 100_000_000_000 },
  purchase_costs: { kind: "number", format: "currency", min: 0, max: 100_000_000_000 },
  shared_debt: { kind: "number", format: "currency", min: 0, max: 100_000_000_000 },
  monthly_fee: { kind: "number", format: "currency", min: 0, max: 2_000_000_000 },
  ownership_type: { kind: "enum", values: OWNERSHIP_TYPES, synonyms: OWNERSHIP_SYNONYMS },
  orientation: { kind: "text", max: 100 },
  parking: { kind: "text", max: 500 },
  storage: { kind: "text", max: 500 },
  description: { kind: "text", max: 20_000, multiline: true },
  external_id: { kind: "text", max: 200 },
  is_hidden: { kind: "boolean" },
} as const satisfies Record<string, TextSpec | NumberSpec | EnumSpec<string> | BooleanSpec>;

export type UnitFieldKey = keyof typeof UNIT_FIELD_SPECS;
export const UNIT_FIELD_KEYS = Object.keys(UNIT_FIELD_SPECS) as UnitFieldKey[];

/**
 * Verdien et felt kan ha etter tolking. null betyr tomt. For status, type og
 * «skjult» betyr tomt «behold» (eller standardverdi for nye enheter).
 */
export type UnitFieldValues = {
  [K in UnitFieldKey]: (typeof UNIT_FIELD_SPECS)[K] extends EnumSpec<infer T>
    ? T | null
    : (typeof UNIT_FIELD_SPECS)[K] extends NumberSpec
      ? number | null
      : (typeof UNIT_FIELD_SPECS)[K] extends BooleanSpec
        ? boolean | null
        : string | null;
};

export type Coerced<T> = { ok: true; value: T } | { ok: false; error: ValidationKey };

/** Felt som er tall, og hvilket format de vises i. */
export function numberFormatOf(key: UnitFieldKey): NumberSpec["format"] | null {
  const spec: TextSpec | NumberSpec | EnumSpec<string> | BooleanSpec = UNIT_FIELD_SPECS[key];
  return spec.kind === "number" ? spec.format : null;
}

function coerceEnum<T extends string>(spec: EnumSpec<T>, raw: unknown): Coerced<T | null> {
  if (raw === null || raw === undefined) {
    return { ok: true, value: null };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "optionInvalid" };
  }
  const text = raw.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  if ((spec.values as readonly string[]).includes(text)) {
    return { ok: true, value: text as T };
  }
  const normalized = normalizeLabel(text);
  const direct = spec.values.find((value) => normalizeLabel(value) === normalized);
  const match = direct ?? spec.synonyms[normalized];
  return match ? { ok: true, value: match } : { ok: false, error: "optionInvalid" };
}

function coerceNumber(spec: NumberSpec, raw: unknown): Coerced<number | null> {
  const parsed = spec.format === "floor" ? parseFloor(raw) : parseNorwegianNumber(raw);
  if (!parsed.ok) {
    return { ok: false, error: spec.format === "floor" ? "floorInvalid" : "numberInvalid" };
  }
  let value = parsed.value;
  if (value === null) {
    return { ok: true, value: null };
  }
  if (spec.format === "area") {
    value = Math.round(value * 10) / 10;
  } else if (spec.format === "currency") {
    value = Math.round(value);
  } else if (!Number.isInteger(value)) {
    return { ok: false, error: "wholeNumber" };
  }
  if (value < 0 && spec.min >= 0) {
    return { ok: false, error: "numberNotNegative" };
  }
  if (value < spec.min || value > spec.max) {
    return { ok: false, error: spec.format === "floor" ? "floorRange" : "numberTooLarge" };
  }
  return { ok: true, value };
}

function coerceText(spec: TextSpec, raw: unknown): Coerced<string | null> {
  if (raw === null || raw === undefined) {
    return spec.required ? { ok: false, error: "required" } : { ok: true, value: null };
  }
  if (typeof raw !== "string" && typeof raw !== "number") {
    return { ok: false, error: "required" };
  }
  const text = spec.multiline ? String(raw).replace(/\r\n?/g, "\n").trim() : String(raw).replace(/\s+/g, " ").trim();
  if (text === "") {
    return spec.required ? { ok: false, error: "required" } : { ok: true, value: null };
  }
  if (text.length > spec.max) {
    return { ok: false, error: "textTooLong" };
  }
  return { ok: true, value: text };
}

/**
 * Tolker og validerer én verdi. Tar imot tekst fra skjema og CSV, tall fra
 * Excel og verdier som allerede har riktig type.
 */
export function coerceUnitField<K extends UnitFieldKey>(key: K, raw: unknown): Coerced<UnitFieldValues[K]> {
  const spec: TextSpec | NumberSpec | EnumSpec<string> | BooleanSpec = UNIT_FIELD_SPECS[key];
  switch (spec.kind) {
    case "text":
      return coerceText(spec, raw) as Coerced<UnitFieldValues[K]>;
    case "number":
      return coerceNumber(spec, raw) as Coerced<UnitFieldValues[K]>;
    case "enum":
      return coerceEnum(spec, raw) as Coerced<UnitFieldValues[K]>;
    case "boolean": {
      const parsed = parseBoolean(raw);
      return (parsed.ok ? { ok: true, value: parsed.value } : { ok: false, error: "optionInvalid" }) as Coerced<
        UnitFieldValues[K]
      >;
    }
  }
}

/** Sorterer enhetsnummer slik folk forventer: A-2 før A-10, og uten forskjell på store og små bokstaver. */
const unitNumberCollator = new Intl.Collator("nb", { numeric: true, sensitivity: "base" });

export function compareUnitNumbers(a: string, b: string): number {
  return unitNumberCollator.compare(a, b);
}
