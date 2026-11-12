"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { IMPORT_FIELDS, isImportField, type ImportField } from "@/features/units/import/columns";
import { MAX_IMPORT_ROWS, validateImportValues } from "@/features/units/import/validate";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { createClient } from "@/lib/supabase/server";

export type ImportSummary = {
  inserted: number;
  updated: number;
  unchanged: number;
  statusChanged: number;
  stagesCreated: number;
  buildingsCreated: number;
};

const payloadSchema = z.object({
  columns: z.array(z.string()).min(1).max(IMPORT_FIELDS.length),
  rows: z
    .array(z.object({ line: z.number().int().positive(), values: z.record(z.string(), z.unknown()) }))
    .min(1)
    .max(MAX_IMPORT_ROWS),
});

const summarySchema = z.object({
  inserted: z.number(),
  updated: z.number(),
  unchanged: z.number(),
  status_changed: z.number(),
  stages_created: z.number(),
  buildings_created: z.number(),
});

/** Regelen i databasen som stoppet en rad, oversatt til feltet den gjelder. */
const CONSTRAINT_FIELDS: Record<string, ImportField> = {
  units_project_id_slug_key: "unit_number",
  units_project_id_unit_number_key: "unit_number",
  units_external_id_key: "external_id",
};

/**
 * Importerer enheter. Radene valideres på nytt her med samme regler som i
 * forhåndsvisningen. Feiler én rad i databasen, lagres ingenting, og svaret
 * forteller hvilken rad i regnearket det gjelder.
 */
export async function importUnits(
  organizationId: string,
  projectId: string,
  payload: { columns: string[]; rows: { line: number; values: Record<string, unknown> }[] },
): Promise<ActionResult<ImportSummary, "rowFailed">> {
  return runAction(async () => {
    if (!z.uuid().safeParse(organizationId).success || !z.uuid().safeParse(projectId).success) {
      throw new ActionError("invalidInput");
    }
    await requireOrgCapability(organizationId, "content.edit");
    const parsed = payloadSchema.safeParse(payload);
    if (!parsed.success || !parsed.data.columns.every(isImportField) || !parsed.data.columns.includes("unit_number")) {
      return fail("invalidInput");
    }
    const columns = parsed.data.columns.filter(isImportField);

    const rows: Record<string, unknown>[] = [];
    for (const row of parsed.data.rows) {
      const { values, errors } = validateImportValues(row.values as Partial<Record<ImportField, unknown>>, columns);
      if (errors.length > 0) {
        return fail("invalidInput", { [`row.${row.line}`]: errors[0]?.message ?? "required" });
      }
      rows.push(values);
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("import_units", {
      p_project_id: projectId,
      p_rows: rows as never,
      p_columns: columns,
    });
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      const index = /import_row=(\d+)/.exec(error.details ?? "")?.[1];
      const line = index ? parsed.data.rows[Number(index) - 1]?.line : undefined;
      if (line !== undefined) {
        console.warn("Import stoppet på rad", line, error.code, error.message);
        const field = CONSTRAINT_FIELDS[error.hint ?? ""];
        return fail("rowFailed", {
          [`row.${line}`]: error.code === "23505" ? "unitNumberTaken" : "importRowInvalid",
          ...(field ? { [`field.${field}`]: "importRowInvalid" } : {}),
        });
      }
      throw error;
    }
    const summary = summarySchema.parse(data);
    refresh();
    return ok({
      inserted: summary.inserted,
      updated: summary.updated,
      unchanged: summary.unchanged,
      statusChanged: summary.status_changed,
      stagesCreated: summary.stages_created,
      buildingsCreated: summary.buildings_created,
    });
  });
}
