"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { StatusEvent } from "@/features/projects/queries";
import { siteTags } from "@/features/site-builder/render-data";
import {
  createUnitSchema,
  isSalesField,
  parseUnitPatch,
  priceAdjustmentSchema,
  statusChangeSchema,
  unitFormSchema,
  type UnitFormInput,
} from "@/features/units/schemas";
import { listUnitStatusEvents, UNIT_LIST_COLUMNS, type UnitListItem } from "@/features/units/queries";
import { fail, ok, type ActionResult, type ValidationKey } from "@/lib/actions/result";
import { ActionError, parseInput, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

type UnitError = "unitNumberTaken" | "slugTaken" | "partial";

const uuid = z.uuid();
const uuidList = z.array(z.uuid()).min(1).max(5000);

function requireId(value: string): string {
  if (!uuid.safeParse(value).success) {
    throw new ActionError("invalidInput");
  }
  return value;
}

/** Feil fra databasen ved lagring av enheter. */
function unitWriteError(error: unknown): ActionResult<never, UnitError> {
  const code = postgresErrorCode(error);
  const message = typeof error === "object" && error !== null && "message" in error ? String(error.message) : "";
  if (code === "23505") {
    return message.includes("slug") ? fail("slugTaken") : fail("unitNumberTaken", { unit_number: "unitNumberTaken" });
  }
  if (code === "42501") {
    return fail("forbidden");
  }
  if (code === "PGRST116") {
    return fail("notFound");
  }
  if (code === "23503") {
    return fail("invalidInput");
  }
  throw error;
}

/**
 * Statusendringer og andre endringer på enheter skal vises på publiserte
 * prosjektsider med en gang. Tømmer mellomlageret for enhetene i prosjektene.
 */
async function purgePublishedUnits(supabase: Awaited<ReturnType<typeof createClient>>, unitIds: string[]) {
  if (unitIds.length === 0) {
    return;
  }
  const { data } = await supabase.from("units").select("project_id").in("id", unitIds.slice(0, 1000));
  for (const projectId of new Set((data ?? []).map((row) => row.project_id))) {
    updateTag(siteTags.units(projectId));
  }
}

/** Endrer ett eller flere felt på én enhet (redigering i tabellen). Svarer med enheten slik den er lagret. */
export async function updateUnitFields(
  organizationId: string,
  unitId: string,
  input: Record<string, unknown>,
): Promise<ActionResult<UnitListItem, UnitError>> {
  return runAction(async () => {
    const { role } = await requireOrgCapability(requireId(organizationId), "units.sales");
    const parsed = parseUnitPatch(input);
    if (!parsed.ok) {
      return fail("invalidInput", parsed.fieldErrors as Record<string, ValidationKey>);
    }
    if (!can(role, "content.edit") && Object.keys(parsed.patch).some((key) => !isSalesField(key))) {
      return fail("forbidden");
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("units")
      .update(parsed.patch)
      .eq("id", requireId(unitId))
      .eq("organization_id", organizationId)
      .select(UNIT_LIST_COLUMNS)
      .single();
    if (error) {
      return unitWriteError(error);
    }
    await purgePublishedUnits(supabase, [data.id]);
    return ok(data);
  });
}

/** Samme endring på mange enheter (masseendring). */
export async function updateUnitsBulk(
  organizationId: string,
  unitIds: string[],
  input: Record<string, unknown>,
): Promise<ActionResult<UnitListItem[], UnitError>> {
  return runAction(async () => {
    const { role } = await requireOrgCapability(requireId(organizationId), "units.sales");
    const ids = uuidList.safeParse(unitIds);
    const parsed = parseUnitPatch(input);
    if (!ids.success || !parsed.ok) {
      return fail("invalidInput", parsed.ok ? undefined : (parsed.fieldErrors as Record<string, ValidationKey>));
    }
    if ("unit_number" in parsed.patch) {
      return fail("invalidInput");
    }
    if (!can(role, "content.edit") && Object.keys(parsed.patch).some((key) => !isSalesField(key))) {
      return fail("forbidden");
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("units")
      .update(parsed.patch)
      .in("id", ids.data)
      .eq("organization_id", organizationId)
      .select(UNIT_LIST_COLUMNS);
    if (error) {
      return unitWriteError(error);
    }
    await purgePublishedUnits(supabase, ids.data);
    if (data.length < new Set(ids.data).size) {
      return fail("partial");
    }
    return ok(data);
  });
}

/** Endrer status med valgfritt notat. Logges i statusloggen med kilde og bruker. */
export async function changeUnitStatus(input: {
  organizationId: string;
  unitIds: string[];
  status: string;
  note: string;
  source: "table" | "form" | "selector";
}): Promise<ActionResult<{ changed: number }>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(input.organizationId), "units.sales");
    const parsed = parseInput(statusChangeSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("set_unit_status", {
      p_unit_ids: parsed.data.unitIds,
      p_status: parsed.data.status,
      p_note: parsed.data.note ?? undefined,
      p_source: parsed.data.source,
    });
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      throw error;
    }
    await purgePublishedUnits(supabase, parsed.data.unitIds);
    if (parsed.data.source === "form") {
      refresh();
    }
    return ok({ changed: data });
  });
}

/** Endrer pris i prosent på mange enheter. Svarer med de oppdaterte enhetene. */
export async function adjustUnitPrices(input: {
  organizationId: string;
  unitIds: string[];
  percent: string;
  roundTo: number;
}): Promise<ActionResult<UnitListItem[]>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(input.organizationId), "units.sales");
    const parsed = parseInput(priceAdjustmentSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("adjust_unit_prices", {
      p_unit_ids: parsed.data.unitIds,
      p_percent: parsed.data.percent,
      p_round_to: parsed.data.roundTo,
    });
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      throw error;
    }
    const { data, error: selectError } = await supabase
      .from("units")
      .select(UNIT_LIST_COLUMNS)
      .in("id", parsed.data.unitIds);
    if (selectError) {
      throw selectError;
    }
    await purgePublishedUnits(supabase, parsed.data.unitIds);
    return ok(data);
  });
}

export async function deleteUnits(organizationId: string, unitIds: string[]): Promise<ActionResult<{ deleted: number }>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const ids = uuidList.safeParse(unitIds);
    if (!ids.success) {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { data: projects } = await supabase.from("units").select("project_id").in("id", ids.data);
    const { error, count } = await supabase
      .from("units")
      .delete({ count: "exact" })
      .in("id", ids.data)
      .eq("organization_id", organizationId);
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      throw error;
    }
    for (const projectId of new Set((projects ?? []).map((row) => row.project_id))) {
      updateTag(siteTags.units(projectId));
    }
    return ok({ deleted: count ?? 0 });
  });
}

export async function getUnitStatusHistory(organizationId: string, unitId: string): Promise<ActionResult<StatusEvent[]>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "units.sales", { allowReadOnly: true });
    return ok(await listUnitStatusEvents(requireId(unitId)));
  });
}

/** Lagrer enhetsskjemaet. Ny enhet: opprettes og åpnes. Eksisterende: lagres på stedet. */
export async function saveUnit(params: {
  organizationId: string;
  orgSlug: string;
  projectId: string;
  projectSlug: string;
  unitId: string | null;
  input: UnitFormInput;
}): Promise<ActionResult<{ id: string }, UnitError>> {
  return runAction(async () => {
    const { organizationId, projectId, unitId, input } = params;
    const { role } = await requireOrgCapability(requireId(organizationId), unitId ? "units.sales" : "content.edit");
    const supabase = await createClient();

    if (!unitId) {
      const parsed = parseInput(createUnitSchema, input);
      if (!parsed.success) {
        return fail("invalidInput", parsed.fieldErrors);
      }
      const { unit_type, is_hidden, unit_number, ...rest } = parsed.data;
      const { data, error } = await supabase
        .from("units")
        .insert({
          ...rest,
          unit_number: unit_number ?? "",
          // Tom adresse: databasen lager den fra enhetsnummeret.
          slug: "",
          unit_type: unit_type ?? "apartment",
          is_hidden,
          organization_id: organizationId,
          project_id: requireId(projectId),
          source: "manual",
        })
        .select("id")
        .single();
      if (error) {
        return unitWriteError(error);
      }
      redirect(`/${params.orgSlug}/projects/${params.projectSlug}/units/${data.id}`);
    }

    const parsed = parseInput(unitFormSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const { unit_type, unit_number, ...rest } = parsed.data;
    const values = { ...rest, unit_number: unit_number ?? "", unit_type: unit_type ?? "apartment" };
    // Meglere kan bare lagre prisfeltene. Resten av skjemaet er låst for dem.
    const update = can(role, "content.edit")
      ? values
      : {
          price: values.price,
          purchase_costs: values.purchase_costs,
          shared_debt: values.shared_debt,
          monthly_fee: values.monthly_fee,
        };
    const { error } = await supabase
      .from("units")
      .update(update)
      .eq("id", requireId(unitId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      return unitWriteError(error);
    }
    updateTag(siteTags.units(params.projectId));
    refresh();
    return ok({ id: unitId });
  });
}

/** Hvilke egne felt som vises på publiserte sider. Gjelder med en gang. */
export async function updatePublicCustomFields(organizationId: string, projectId: string, keys: string[]): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = z.array(z.string().trim().min(1).max(60)).max(30).safeParse(keys);
    if (!parsed.success) {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_public_custom_fields", { p_project_id: requireId(projectId), p_keys: [...new Set(parsed.data)] });
    if (error) {
      switch (postgresErrorCode(error)) {
        case "42501":
          return fail("forbidden");
        case "22023":
          return fail("invalidInput");
        default:
          throw error;
      }
    }
    updateTag(siteTags.units(projectId));
    updateTag(siteTags.project(projectId));
    refresh();
    return ok();
  });
}
