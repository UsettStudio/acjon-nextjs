"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  buildingSchema,
  contactsSchema,
  createProjectSchema,
  locationSchema,
  milestonesSchema,
  stageSchema,
  updateProjectDetailsSchema,
  type ContactInput,
  type CreateProjectInput,
  type LocationInput,
  type MilestoneInput,
} from "@/features/projects/schemas";
import { siteTags } from "@/features/site-builder/render-data";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, parseInput, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import type { Database } from "@/lib/supabase/database.types";
import { createClient, type ServerSupabaseClient } from "@/lib/supabase/server";

const uuid = z.uuid();

function requireId(value: string): string {
  if (!uuid.safeParse(value).success) {
    throw new ActionError("invalidInput");
  }
  return value;
}

/** Feil fra databasen som betyr at brukeren mangler tilgang eller at noe er borte. */
function mapWriteError(error: unknown): never {
  switch (postgresErrorCode(error)) {
    case "42501":
      throw new ActionError("forbidden");
    case "PGRST116":
      throw new ActionError("notFound");
    default:
      throw error;
  }
}

export async function createProject(
  organizationId: string,
  input: CreateProjectInput,
): Promise<ActionResult<{ slug: string }>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "projects.create");
    const parsed = parseInput(createProjectSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const { details, location, milestones, contacts, structure } = parsed.data;
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_project", {
      p_organization_id: organizationId,
      p_project: { ...details, ...location, milestones, contacts },
      p_stages: structure.stages.map((stage) => ({
        name: stage.name,
        buildings: stage.buildings.map((building) => building.name),
      })),
      p_buildings: structure.buildings.map((building) => building.name),
    });
    if (error) {
      mapWriteError(error);
    }
    const result = z.object({ slug: z.string() }).parse(data);
    return ok({ slug: result.slug });
  });
}

async function updateProjectRow(
  supabase: ServerSupabaseClient,
  organizationId: string,
  projectId: string,
  values: Database["public"]["Tables"]["projects"]["Update"],
): Promise<{ slug: string }> {
  const { data, error } = await supabase
    .from("projects")
    .update(values)
    .eq("id", projectId)
    .eq("organization_id", organizationId)
    .select("slug")
    .single();
  if (error) {
    mapWriteError(error);
  }
  // Navn, adresse, fremdrift og kontakter leses direkte på publiserte prosjektsider.
  updateTag(siteTags.project(projectId));
  return data;
}

export async function updateProjectDetails(
  organizationId: string,
  projectId: string,
  input: z.input<typeof updateProjectDetailsSchema>,
): Promise<ActionResult> {
  return runAction(async () => {
    const { organization } = await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(updateProjectDetailsSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data: current } = await supabase.from("projects").select("slug").eq("id", requireId(projectId)).maybeSingle();
    try {
      await updateProjectRow(supabase, organizationId, projectId, parsed.data);
    } catch (error) {
      if (postgresErrorCode(error) === "23505") {
        return fail("invalidInput", { slug: "slugTaken" });
      }
      throw error;
    }
    if (current && current.slug !== parsed.data.slug) {
      redirect(`/${organization.slug}/projects/${parsed.data.slug}/settings`);
    }
    refresh();
    return ok();
  });
}

export async function updateProjectLocation(
  organizationId: string,
  projectId: string,
  input: LocationInput,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(locationSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    await updateProjectRow(await createClient(), organizationId, requireId(projectId), parsed.data);
    refresh();
    return ok();
  });
}

export async function updateProjectMilestones(
  organizationId: string,
  projectId: string,
  input: MilestoneInput[],
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(milestonesSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    await updateProjectRow(await createClient(), organizationId, requireId(projectId), { milestones: parsed.data });
    refresh();
    return ok();
  });
}

export async function updateProjectContacts(
  organizationId: string,
  projectId: string,
  input: ContactInput[],
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(contactsSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    await updateProjectRow(await createClient(), organizationId, requireId(projectId), { contacts: parsed.data });
    refresh();
    return ok();
  });
}

export async function deleteProject(
  organizationId: string,
  projectId: string,
  confirmName: string,
): Promise<ActionResult<never, "nameMismatch">> {
  return runAction(async () => {
    const { organization } = await requireOrgCapability(requireId(organizationId), "projects.delete");
    const supabase = await createClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select("name")
      .eq("id", requireId(projectId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!project) {
      return fail("notFound");
    }
    if (project.name.trim() !== confirmName.trim()) {
      return fail("nameMismatch");
    }
    const { error: deleteError, count } = await supabase
      .from("projects")
      .delete({ count: "exact" })
      .eq("id", projectId)
      .eq("organization_id", organizationId);
    if (deleteError) {
      mapWriteError(deleteError);
    }
    if (count === 0) {
      return fail("forbidden");
    }
    redirect(`/${organization.slug}/projects`);
  });
}

// -----------------------------------------------------------------------------
// Byggetrinn og bygg
// -----------------------------------------------------------------------------

async function nextSortOrder(supabase: ServerSupabaseClient, table: "stages" | "buildings", projectId: string) {
  const { data, error } = await supabase
    .from(table)
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);
  if (error) {
    throw error;
  }
  return (data[0]?.sort_order ?? 0) + 1;
}

export async function createStage(
  organizationId: string,
  projectId: string,
  input: z.input<typeof stageSchema>,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(stageSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.from("stages").insert({
      organization_id: organizationId,
      project_id: requireId(projectId),
      name: parsed.data.name,
      phase: parsed.data.phase,
      sort_order: await nextSortOrder(supabase, "stages", projectId),
    });
    if (error) {
      mapWriteError(error);
    }
    refresh();
    return ok();
  });
}

export async function updateStage(
  organizationId: string,
  stageId: string,
  input: z.input<typeof stageSchema>,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(stageSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("stages")
      .update(parsed.data)
      .eq("id", requireId(stageId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      mapWriteError(error);
    }
    refresh();
    return ok();
  });
}

export async function deleteStructureItem(
  organizationId: string,
  table: "stages" | "buildings",
  id: string,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    if (table !== "stages" && table !== "buildings") {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { error, count } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .eq("id", requireId(id))
      .eq("organization_id", organizationId);
    if (error) {
      mapWriteError(error);
    }
    if (count === 0) {
      return fail("forbidden");
    }
    refresh();
    return ok();
  });
}

/** Flytter et byggetrinn eller bygg ett steg opp eller ned. Rekkefølgen skrives på nytt for hele listen. */
export async function moveStructureItem(
  organizationId: string,
  table: "stages" | "buildings",
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    if ((table !== "stages" && table !== "buildings") || (direction !== "up" && direction !== "down")) {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { data: item, error } = await supabase
      .from(table)
      .select("project_id")
      .eq("id", requireId(id))
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!item) {
      return fail("notFound");
    }
    const { data: siblings, error: listError } = await supabase
      .from(table)
      .select("id")
      .eq("project_id", item.project_id)
      .order("sort_order")
      .order("created_at");
    if (listError) {
      throw listError;
    }
    const ids = siblings.map((sibling) => sibling.id);
    const index = ids.indexOf(id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= ids.length) {
      return ok();
    }
    [ids[index], ids[target]] = [ids[target] as string, ids[index] as string];
    for (const [position, siblingId] of ids.entries()) {
      const { error: updateError } = await supabase
        .from(table)
        .update({ sort_order: position + 1 })
        .eq("id", siblingId)
        .eq("organization_id", organizationId);
      if (updateError) {
        mapWriteError(updateError);
      }
    }
    refresh();
    return ok();
  });
}

export async function createBuilding(
  organizationId: string,
  projectId: string,
  input: z.input<typeof buildingSchema>,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(buildingSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.from("buildings").insert({
      organization_id: organizationId,
      project_id: requireId(projectId),
      name: parsed.data.name,
      stage_id: parsed.data.stage_id,
      sort_order: await nextSortOrder(supabase, "buildings", projectId),
    });
    if (error) {
      mapWriteError(error);
    }
    refresh();
    return ok();
  });
}

export async function updateBuilding(
  organizationId: string,
  buildingId: string,
  input: z.input<typeof buildingSchema>,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(buildingSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("buildings")
      .update(parsed.data)
      .eq("id", requireId(buildingId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      mapWriteError(error);
    }
    refresh();
    return ok();
  });
}
