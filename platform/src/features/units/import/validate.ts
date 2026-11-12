/**
 * Validering av importrader. Brukes både i nettleseren (forhåndsvisning) og på
 * serveren (før databasen kalles), så reglene er de samme begge steder.
 */

import { z } from "zod";

import type { ImportField } from "@/features/units/import/columns";
import { unitField } from "@/features/units/schemas";
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

/** Navn på byggetrinn eller bygg. Tomt betyr «uten». */
const nameField = z.unknown().transform((raw, ctx): string | null => {
  if (raw === null || raw === undefined) {
    return null;
  }
  const text = String(raw).replace(/\s+/g, " ").trim();
  if (text.length > 200) {
    ctx.addIssue({ code: "custom", message: "textTooLong" });
    return z.NEVER;
  }
  return text === "" ? null : text;
});

/**
 * Zod-skjema for én importrad med de koblede kolonnene. Feltene tolkes med de
 * samme reglene som enhetsskjemaet (`unitField`), så «2 450 000 kr», «68,5» og
 * «Solgt» godtas, og feilmeldingene er de samme.
 */
export function importRowSchema(columns: readonly ImportField[]) {
  const fields: Record<string, z.ZodType> = {};
  for (const field of columns) {
    fields[field] = field === "stage" || field === "building" ? nameField : unitField(field);
  }
  const row = z.object(fields).superRefine((_values, ctx) => {
    // Enhetsnummeret brukes til å finne enheten som skal oppdateres, og må alltid være med.
    if (!columns.includes("unit_number")) {
      ctx.addIssue({ code: "custom", path: ["unit_number"], message: "required" });
    }
  });
  return { row, fields, columns };
}

export type ImportRowSchema = ReturnType<typeof importRowSchema>;

/**
 * Validerer én rad. Feiler raden, tolkes likevel feltene uten feil, så
 * forhåndsvisningen kan vise hva som står i raden.
 */
export function validateImportValues(
  input: Partial<Record<ImportField, unknown>>,
  schema: ImportRowSchema,
): { values: Partial<Record<ImportField, unknown>>; errors: ImportRowError[] } {
  const raw = Object.fromEntries(schema.columns.map((field) => [field, input[field] ?? null]));
  const result = schema.row.safeParse(raw);
  if (result.success) {
    return { values: result.data as Partial<Record<ImportField, unknown>>, errors: [] };
  }
  const errors: ImportRowError[] = [];
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    const field = schema.columns.find((column) => column === key) ?? (key === "unit_number" ? "unit_number" : "row");
    if (!errors.some((existing) => existing.field === field)) {
      errors.push({ field, message: issue.message as ValidationKey });
    }
  }
  const values: Partial<Record<ImportField, unknown>> = {};
  for (const field of schema.columns) {
    const parsed = errors.some((error) => error.field === field) ? null : schema.fields[field]?.safeParse(raw[field]);
    if (parsed?.success) {
      values[field] = parsed.data;
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
  const schema = importRowSchema(columns);
  const seen = new Map<string, number>();
  const rows: ImportRow[] = [];

  dataRows.forEach((cells, index) => {
    if (
      cells.every((cell) => cell === null || cell === undefined || (typeof cell === "string" && cell.trim() === ""))
    ) {
      return;
    }
    const input: Partial<Record<ImportField, unknown>> = {};
    mapping.forEach((field, column) => {
      if (field) {
        input[field] = cellToInput(cells[column]);
      }
    });
    const { values, errors } = validateImportValues(input, schema);
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
