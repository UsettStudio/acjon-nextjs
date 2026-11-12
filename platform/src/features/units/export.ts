/**
 * Eksport av enheter til CSV. Formatet er laget for Excel på norsk og kan
 * importeres igjen uten endringer:
 *   * Semikolon som skilletegn og UTF-8 med BOM, så Excel viser æ, ø og å riktig.
 *   * Tall uten tusenskille og med desimalkomma («68,5»).
 *   * Overskrifter og verdier (status, type) på brukerens språk. Importen kjenner dem igjen.
 *   * Tekst som starter med =, +, - eller @ får ' foran, så Excel ikke tolker den som formel.
 */

import type { ImportField } from "@/features/units/import/columns";
import { calculateTotals } from "@/features/units/price";
import type { OwnershipType, UnitRow, UnitStatus, UnitType } from "@/features/units/fields";

export const EXPORT_COLUMNS = [
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
  "total",
  "ownership_type",
  "orientation",
  "parking",
  "storage",
  "description",
  "external_id",
  "is_hidden",
] as const satisfies readonly (ImportField | "total")[];

export type ExportColumn = (typeof EXPORT_COLUMNS)[number];

export type ExportLabels = {
  header: (column: ExportColumn) => string;
  status: (status: UnitStatus) => string;
  type: (type: UnitType) => string;
  ownership: (ownership: OwnershipType) => string;
  yes: string;
  no: string;
};

export type ExportUnit = Pick<
  UnitRow,
  | "unit_number"
  | "title"
  | "unit_type"
  | "status"
  | "stage_id"
  | "building_id"
  | "floor"
  | "rooms"
  | "bedrooms"
  | "bathrooms"
  | "bra_i"
  | "bra_e"
  | "bra_b"
  | "tba"
  | "plot_area"
  | "price"
  | "purchase_costs"
  | "shared_debt"
  | "monthly_fee"
  | "ownership_type"
  | "orientation"
  | "parking"
  | "storage"
  | "description"
  | "external_id"
  | "is_hidden"
>;

const DELIMITER = ";";

/** Tall med desimalkomma og uten tusenskille. */
export function csvNumber(value: number | null): string {
  return value === null ? "" : String(value).replace(".", ",");
}

/** Tekst som Excel ellers kunne tolket som formel, får ' foran. */
export function csvText(value: string | null): string {
  if (value === null) {
    return "";
  }
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function quote(value: string): string {
  return /[";\r\n]|^\s|\s$/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function toCsv(rows: string[][]): string {
  return `﻿${rows.map((row) => row.map(quote).join(DELIMITER)).join("\r\n")}\r\n`;
}

export function buildUnitsCsv(
  units: ExportUnit[],
  labels: ExportLabels,
  names: { stages: Map<string, string>; buildings: Map<string, string> },
): string {
  const header = EXPORT_COLUMNS.map((column) => labels.header(column));
  const rows = units.map((unit) =>
    EXPORT_COLUMNS.map((column): string => {
      switch (column) {
        case "unit_number":
        case "title":
        case "orientation":
        case "parking":
        case "storage":
        case "description":
        case "external_id":
          return csvText(unit[column]);
        case "unit_type":
          return labels.type(unit.unit_type);
        case "status":
          return labels.status(unit.status);
        case "ownership_type":
          return unit.ownership_type ? labels.ownership(unit.ownership_type) : "";
        case "stage":
          return csvText(unit.stage_id ? (names.stages.get(unit.stage_id) ?? null) : null);
        case "building":
          return csvText(unit.building_id ? (names.buildings.get(unit.building_id) ?? null) : null);
        case "is_hidden":
          return unit.is_hidden ? labels.yes : labels.no;
        case "total":
          return csvNumber(
            calculateTotals({ price: unit.price, purchaseCosts: unit.purchase_costs, sharedDebt: unit.shared_debt }).total,
          );
        default:
          return csvNumber(unit[column]);
      }
    }),
  );
  return toCsv([header, ...rows]);
}
