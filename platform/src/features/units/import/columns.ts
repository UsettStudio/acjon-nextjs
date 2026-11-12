/**
 * Kolonnene som kan importeres, og hvilke overskrifter i regnearket som kobles
 * til dem automatisk. Overskriftene sammenlignes normalisert (små bokstaver,
 * uten tegnsetting, æ/ø/å som ae/o/a), og enheter som «kr», «m²» og «mnd» ignoreres.
 */

import type { UnitFieldKey } from "@/features/units/fields";
import { normalizeLabel } from "@/lib/format/parse";

export const IMPORT_FIELDS = [
  "unit_number",
  "title",
  "unit_type",
  "status",
  "stage",
  "building",
  "floor",
  "rooms",
  "bedrooms",
  "bathrooms",
  "bra_i",
  "bra_e",
  "bra_b",
  "tba",
  "plot_area",
  "price",
  "purchase_costs",
  "shared_debt",
  "monthly_fee",
  "ownership_type",
  "orientation",
  "parking",
  "storage",
  "description",
  "external_id",
  "is_hidden",
] as const satisfies readonly (UnitFieldKey | "stage" | "building")[];

export type ImportField = (typeof IMPORT_FIELDS)[number];

export function isImportField(value: unknown): value is ImportField {
  return typeof value === "string" && (IMPORT_FIELDS as readonly string[]).includes(value);
}

/** Overskrifter per felt, allerede normalisert. Norsk, engelsk og svensk. */
const SYNONYMS: Record<ImportField, string[]> = {
  unit_number: [
    "unit number",
    "nr",
    "nummer",
    "enhetsnummer",
    "enhetsnr",
    "enhet",
    "enhet nr",
    "leilighet",
    "leilighetsnummer",
    "leilighet nr",
    "lgh",
    "lgh nr",
    "boenhet",
    "boligenhet",
    "bolignummer",
    "bolignr",
    "bolig nr",
    "leilighetsnr",
    "boenhetsnr",
    "lghnr",
    "bolig",
    "unit",
    "unit no",
    "lagenhet",
    "lagenhetsnummer",
    "lagenhetsnr",
    "bostad",
    "bostadsnummer",
  ],
  title: ["tittel", "title", "navn", "name", "titel", "namn"],
  unit_type: ["type", "boligtype", "enhetstype", "unit type", "typ", "bostadstyp"],
  status: ["status", "salgsstatus", "sales status", "tilgjengelighet", "forsaljningsstatus"],
  stage: ["byggetrinn", "trinn", "etappe", "stage", "etapp", "byggetappe"],
  building: ["bygg", "bygning", "hus", "blokk", "building", "byggnad", "hus nr"],
  floor: ["etasje", "etg", "plan", "floor", "vaning", "etasjenummer"],
  rooms: ["rom", "antall rom", "rooms", "rum", "antal rum", "ant rom"],
  bedrooms: ["soverom", "antall soverom", "sov", "bedrooms", "sovrum", "antal sovrum", "ant soverom"],
  bathrooms: ["bad", "baderom", "antall bad", "bathrooms", "badrum", "antal badrum"],
  bra_i: [
    "bra i",
    "brai",
    "bra",
    "bruksareal",
    "internt bruksareal",
    "p rom",
    "prom",
    "primaerrom",
    "boareal",
    "boa",
    "areal",
    "storrelse",
    "size",
    "area",
    "usable area",
    "boyta",
  ],
  bra_e: ["bra e", "brae", "eksternt bruksareal"],
  bra_b: ["bra b", "brab", "innglasset balkong"],
  tba: ["tba", "balkong", "terrasse", "balkong terrasse", "uteareal", "balkongareal", "terrasseareal", "balcony", "terrace", "balkong og terrasse"],
  plot_area: ["tomteareal", "tomt", "tomtestorrelse", "plot", "plot area", "tomtarea", "tomtstorlek"],
  price: ["pris", "prisantydning", "salgspris", "price", "asking price", "pris inkl", "pris eks omk", "utgangspris"],
  purchase_costs: ["omkostninger", "omk", "kjopsomkostninger", "dokumentavgift", "purchase costs", "closing costs", "kostnader ved kjop"],
  shared_debt: ["fellesgjeld", "andel fellesgjeld", "andel av fellesgjeld", "shared debt", "andel skuld", "andelens skuld"],
  monthly_fee: [
    "felleskostnader",
    "felleskost",
    "fellesutgifter",
    "husleie",
    "monthly fee",
    "common costs",
    "avgift",
    "manadsavgift",
    "felleskostnader per",
  ],
  ownership_type: ["eierform", "eieform", "ownership", "ownership type", "upplatelseform"],
  orientation: ["solforhold", "retning", "orientering", "himmelretning", "orientation", "vaderstreck", "lage"],
  parking: ["parkering", "p plass", "garasje", "parking", "garage"],
  storage: ["bod", "sportsbod", "boder", "storage", "forrad"],
  description: ["beskrivelse", "description", "beskrivning", "omtale"],
  external_id: ["ekstern id", "external id", "id", "finn kode", "finnkode", "megler id", "externt id"],
  is_hidden: ["skjult", "skjul", "hidden", "dold", "skjules"],
};

/** Ord som beskriver enhet eller tidsrom og ikke selve feltet: «Pris (kr)», «BRA-i (m²)», «Felleskost./mnd.». */
const NOISE = new Set(["kr", "nok", "m", "m2", "kvm", "mnd", "per", "pr", "maned", "maaned", "month", "manad", "sek", "inkl", "ca"]);

const LOOKUP = new Map<string, ImportField>();
for (const field of IMPORT_FIELDS) {
  for (const synonym of SYNONYMS[field]) {
    if (!LOOKUP.has(synonym)) {
      LOOKUP.set(synonym, field);
    }
  }
}

export function matchHeader(header: string): ImportField | null {
  const normalized = normalizeLabel(header);
  if (normalized === "") {
    return null;
  }
  const direct = LOOKUP.get(normalized);
  if (direct) {
    return direct;
  }
  const stripped = normalized
    .split(" ")
    .filter((word) => !NOISE.has(word))
    .join(" ");
  return LOOKUP.get(stripped) ?? null;
}

/** Foreslår kobling for hver overskrift. Hvert felt brukes bare én gang; første treff vinner. */
export function suggestMapping(headers: string[]): (ImportField | null)[] {
  const used = new Set<ImportField>();
  return headers.map((header) => {
    const field = matchHeader(header);
    if (!field || used.has(field)) {
      return null;
    }
    used.add(field);
    return field;
  });
}
