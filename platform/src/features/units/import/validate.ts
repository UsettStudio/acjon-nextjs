/**
 * Validering av importrader. Brukes både i nettleseren (forhåndsvisning) og på
 * serveren (før databasen kalles), så reglene er de samme begge steder.
 */

import { coerceUnitField, type UnitFieldKey } from "@/features/units/fields";
import type { ImportField } from "@/features/units/import/columns";
import type { ValidationKey } from "@/lib/actions/result";

export const MAX_IMPORT_ROWS = 2000;

export type Cell = string | number | boolean | Date | null | undefined;

export type ImportRowError = { field: ImportField | "row"; message: ValidationKey };

export type ImportRow = {
  /** Radnummer i regnearket, med overskriften som rad 1. */
  line: number;
  unitNumber: string | null;
  values: Partial<Record<ImportField, unknown>>;
  errors: ImportRowError[];
};

export type ImportValidation = {
  rows: ImportRow[];
  validRows: ImportRow[];
  errorCount: number;
};

function cellToInput(cell: Cell): unknown {
  if (cell instanceof Date) {
    return Number.isNaN(cell.getTime()) ? null : cell.toISOString().slice(0, 10);
  }
  if (typeof cell === "string") {
    // Beskyttelsen mot formler i eksporten (en ' foran) fjernes igjen ved import.
    return cell.startsWith("'") && /^'[=+\-@]/.test(cell) ? cell.slice(1) : cell;
  }
  return cell ?? null;
}

function coerceName(raw: unknown): { ok: true; value: string | null } | { ok: false; error: ValidationKey } {
  if (raw === null || raw === undefined) {
    return { ok: true, value: null };
  }
  const text = String(raw).replace(/\s+/g, " ").trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  return text.length > 200 ? { ok: false, error: "textTooLong" } : { ok: true, value: text };
}

/** Tolker én rad med verdier per felt. Feltene som ikke er koblet, tas ikke med. */
export function validateImportValues(
  input: Partial<Record<ImportField, unknown>>,
  columns: readonly ImportField[],
): { values: Partial<Record<ImportField, unknown>>; errors: ImportRowError[] } {
  const values: Partial<Record<ImportField, unknown>> = {};
  const errors: ImportRowError[] = [];
  for (const field of columns) {
    const raw = input[field];
    if (field === "stage" || field === "building") {
      const result = coerceName(raw);
      if (result.ok) {
        values[field] = result.value;
      } else {
        errors.push({ field, message: result.error });
      }
      continue;
    }
    const result = coerceUnitField(field as UnitFieldKey, raw);
    if (result.ok) {
      values[field] = result.value;
    } else {
      errors.push({ field, message: result.error });
    }
  }
  if (values.unit_number === null || values.unit_number === undefined) {
    if (!errors.some((error) => error.field === "unit_number")) {
      errors.push({ field: "unit_number", message: "required" });
    }
  }
  return { values, errors };
}

/**
 * Validerer alle rader i regnearket med valgt kolonnekobling. Tomme rader hoppes
 * over. Samme enhetsnummer to ganger gir feil på den andre raden.
 */
export function validateImport(dataRows: Cell[][], mapping: readonly (ImportField | null)[]): ImportValidation {
  const columns = mapping.filter((field): field is ImportField => field !== null);
  const seen = new Map<string, number>();
  const rows: ImportRow[] = [];

  dataRows.forEach((cells, index) => {
    if (cells.every((cell) => cell === null || cell === undefined || (typeof cell === "string" && cell.trim() === ""))) {
      return;
    }
    const input: Partial<Record<ImportField, unknown>> = {};
    mapping.forEach((field, column) => {
      if (field) {
        input[field] = cellToInput(cells[column]);
      }
    });
    const { values, errors } = validateImportValues(input, columns);
    const unitNumber = typeof values.unit_number === "string" ? values.unit_number : null;
    if (unitNumber) {
      const key = unitNumber.toLocaleLowerCase("nb");
      if (seen.has(key)) {
        errors.push({ field: "unit_number", message: "duplicateInFile" });
      } else {
        seen.set(key, index);
      }
    }
    rows.push({ line: index + 2, unitNumber, values, errors });
  });

  const validRows = rows.filter((row) => row.errors.length === 0);
  return { rows, validRows, errorCount: rows.length - validRows.length };
}
