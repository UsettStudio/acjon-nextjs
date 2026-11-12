"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import {
  FILTER_KEYS,
  saveHotspotsSchema,
  statusColorsSchema,
  toHotspotRow,
  type EditorHotspot,
  type SelectorSettings,
} from "@/features/selector/model";
import { toEditorView, VIEW_COLUMNS, type EditorView } from "@/features/selector/queries";
import { siteTags } from "@/features/site-builder/render-data";
import {
  selectorNameSchema as nameSchema,
  selectorSettingsInputSchema as settingsInputSchema,
  viewInputSchema,
  type ViewInput,
} from "@/features/selector/schemas";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, parseInput, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { createClient, type ServerSupabaseClient } from "@/lib/supabase/server";

/**
 * needsView: velgeren har ingen visninger og kan ikke publiseres.
 * invalidTarget: koblingen peker på noe som ikke finnes (lenger).
 * viewCycle: en visning kan ikke ligge under seg selv.
 * imageNotReady: bildet er ikke ferdig behandlet eller er ikke et bilde.
 */
type SelectorError = "needsView" | "invalidTarget" | "viewCycle" | "imageNotReady";

export type PublishState = { publishedAt: string | null; hasUnpublishedChanges: boolean };

const uuid = z.uuid();

function requireId(value: unknown): string {
  const parsed = uuid.safeParse(value);
  if (!parsed.success) {
    throw new ActionError("invalidInput");
  }
  return parsed.data;
}

function writeError(error: unknown): ActionResult<never, SelectorError> {
  switch (postgresErrorCode(error)) {
    case "42501":
      return fail("forbidden");
    case "PGRST116":
      return fail("notFound");
    case "23503":
      return fail("invalidTarget");
    case "22023":
    case "23514":
    case "23505":
    case "22P02":
      return fail("invalidInput");
    default:
      throw error;
  }
}

async function readPublishState(supabase: ServerSupabaseClient, selectorId: string): Promise<PublishState> {
  const { data, error } = await supabase.rpc("get_selector_publish_state", { p_selector_id: selectorId });
  if (error) {
    throw error;
  }
  const state = z
    .object({ published_at: z.string().nullable(), has_changes: z.boolean() })
    .parse(data);
  return { publishedAt: state.published_at, hasUnpublishedChanges: state.has_changes };
}

async function loadView(supabase: ServerSupabaseClient, viewId: string): Promise<EditorView> {
  const { data, error } = await supabase.from("selector_views").select(VIEW_COLUMNS).eq("id", viewId).single();
  if (error) {
    throw error;
  }
  return toEditorView(data);
}

/** Bildet til en visning: et ferdig behandlet bilde i organisasjonen, med kjent størrelse. */
async function loadImage(supabase: ServerSupabaseClient, organizationId: string, assetId: string) {
  const { data, error } = await supabase
    .from("assets")
    .select("id, mime, width, height, processing_status")
    .eq("organization_id", organizationId)
    .eq("id", assetId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data || !data.mime.startsWith("image/") || data.processing_status !== "ready" || !data.width || !data.height) {
    return null;
  }
  return { id: data.id, width: data.width, height: data.height };
}

// -----------------------------------------------------------------------------
// Boligvelgere
// -----------------------------------------------------------------------------

export async function createSelector(
  organizationId: string,
  projectId: string,
  input: { name: string },
): Promise<ActionResult<{ id: string }, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(z.object({ name: nameSchema }), input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const id = crypto.randomUUID();
    const settings: SelectorSettings = { filters: [...FILTER_KEYS], list: "side", hatch_sold: true };
    const { error } = await supabase.from("selectors").insert({
      id,
      organization_id: organizationId,
      project_id: requireId(projectId),
      name: parsed.data.name,
      settings,
    });
    if (error) {
      return writeError(error);
    }
    return ok({ id });
  });
}

export async function renameSelector(
  organizationId: string,
  selectorId: string,
  name: string,
): Promise<ActionResult<{ name: string }, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(nameSchema, name);
    if (!parsed.success) {
      return fail("invalidInput", { name: parsed.fieldErrors._form ?? "nameLength" });
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("selectors")
      .update({ name: parsed.data })
      .eq("id", requireId(selectorId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      return writeError(error);
    }
    return ok({ name: parsed.data });
  });
}

export async function updateSelectorSettings(
  organizationId: string,
  selectorId: string,
  settings: SelectorSettings,
): Promise<ActionResult<SelectorSettings, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(settingsInputSchema, settings);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const value: SelectorSettings = { ...parsed.data, filters: [...new Set(parsed.data.filters)] };
    const { error } = await supabase
      .from("selectors")
      .update({ settings: value })
      .eq("id", requireId(selectorId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      return writeError(error);
    }
    return ok(value);
  });
}

export async function deleteSelector(
  organizationId: string,
  selectorId: string,
): Promise<ActionResult<undefined, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error, count } = await supabase
      .from("selectors")
      .delete({ count: "exact" })
      .eq("id", requireId(selectorId))
      .eq("organization_id", organizationId);
    if (error) {
      return writeError(error);
    }
    if (count === 0) {
      return fail("notFound");
    }
    refresh();
    return ok();
  });
}

export async function getSelectorPublishState(
  organizationId: string,
  selectorId: string,
): Promise<ActionResult<PublishState>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "units.sales", { allowReadOnly: true });
    const supabase = await createClient();
    return ok(await readPublishState(supabase, requireId(selectorId)));
  });
}

/** Publiserer former og koblinger. Status trenger ikke publisering. */
export async function publishSelector(
  organizationId: string,
  selectorId: string,
): Promise<ActionResult<PublishState, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error } = await supabase.rpc("publish_selector", { p_selector_id: requireId(selectorId) });
    if (error) {
      if (postgresErrorCode(error) === "23514") {
        return fail("needsView");
      }
      return writeError(error);
    }
    updateTag(siteTags.selector(selectorId));
    return ok(await readPublishState(supabase, selectorId));
  });
}

export async function unpublishSelector(
  organizationId: string,
  selectorId: string,
): Promise<ActionResult<PublishState, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error } = await supabase.rpc("unpublish_selector", { p_selector_id: requireId(selectorId) });
    if (error) {
      return writeError(error);
    }
    updateTag(siteTags.selector(selectorId));
    return ok(await readPublishState(supabase, selectorId));
  });
}

// -----------------------------------------------------------------------------
// Visninger
// -----------------------------------------------------------------------------

export async function createView(
  organizationId: string,
  selectorId: string,
  input: ViewInput & { assetId: string },
): Promise<ActionResult<EditorView, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(viewInputSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data: selector, error: selectorError } = await supabase
      .from("selectors")
      .select("id, project_id")
      .eq("id", requireId(selectorId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (selectorError) {
      return writeError(selectorError);
    }
    if (!selector) {
      return fail("notFound");
    }
    const image = await loadImage(supabase, organizationId, requireId(input.assetId));
    if (!image) {
      return fail("imageNotReady");
    }
    const { data: last } = await supabase
      .from("selector_views")
      .select("sort_order")
      .eq("selector_id", selector.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const id = crypto.randomUUID();
    const { error } = await supabase.from("selector_views").insert({
      id,
      organization_id: organizationId,
      project_id: selector.project_id,
      selector_id: selector.id,
      parent_view_id: parsed.data.parentViewId,
      name: parsed.data.name,
      kind: parsed.data.kind,
      angle_group: parsed.data.angleGroup,
      asset_id: image.id,
      image_width: image.width,
      image_height: image.height,
      sort_order: (last?.sort_order ?? 0) + 1,
    });
    if (error) {
      return writeError(error);
    }
    return ok(await loadView(supabase, id));
  });
}

export async function updateView(
  organizationId: string,
  viewId: string,
  input: ViewInput,
): Promise<ActionResult<EditorView, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(viewInputSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("selector_views")
      .update({
        name: parsed.data.name,
        kind: parsed.data.kind,
        parent_view_id: parsed.data.parentViewId,
        angle_group: parsed.data.angleGroup,
      })
      .eq("id", requireId(viewId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      if (postgresErrorCode(error) === "23514") {
        return fail("viewCycle");
      }
      return writeError(error);
    }
    return ok(await loadView(supabase, viewId));
  });
}

/** Bytter bildet. Markeringene beholdes, siden de er andeler av bildets bredde og høyde. */
export async function replaceViewImage(
  organizationId: string,
  viewId: string,
  assetId: string,
): Promise<ActionResult<EditorView, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const image = await loadImage(supabase, organizationId, requireId(assetId));
    if (!image) {
      return fail("imageNotReady");
    }
    const { error } = await supabase
      .from("selector_views")
      .update({ asset_id: image.id, image_width: image.width, image_height: image.height })
      .eq("id", requireId(viewId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      return writeError(error);
    }
    return ok(await loadView(supabase, viewId));
  });
}

export async function deleteView(organizationId: string, viewId: string): Promise<ActionResult<undefined, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error, count } = await supabase
      .from("selector_views")
      .delete({ count: "exact" })
      .eq("id", requireId(viewId))
      .eq("organization_id", organizationId);
    if (error) {
      return writeError(error);
    }
    if (count === 0) {
      return fail("notFound");
    }
    return ok();
  });
}

/** Ny rekkefølge for alle visningene i velgeren (rekkefølgen i treet, ovenfra og ned). */
export async function reorderViews(
  organizationId: string,
  selectorId: string,
  viewIds: string[],
): Promise<ActionResult<undefined, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const ids = z.array(z.uuid()).min(1).max(500).safeParse(viewIds);
    if (!ids.success) {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("reorder_selector_views", {
      p_selector_id: requireId(selectorId),
      p_view_ids: ids.data,
    });
    if (error) {
      return writeError(error);
    }
    return ok();
  });
}

export async function setEntryView(
  organizationId: string,
  selectorId: string,
  viewId: string | null,
): Promise<ActionResult<undefined, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { error } = await supabase
      .from("selectors")
      .update({ entry_view_id: viewId === null ? null : requireId(viewId) })
      .eq("id", requireId(selectorId))
      .eq("organization_id", organizationId)
      .select("id")
      .single();
    if (error) {
      return writeError(error);
    }
    return ok();
  });
}

// -----------------------------------------------------------------------------
// Markeringer
// -----------------------------------------------------------------------------

/**
 * Lagrer alle markeringene i en visning (autolagring). Databasen erstatter dem
 * i én transaksjon og svarer med publiseringsstatusen etterpå.
 */
export async function saveViewHotspots(
  organizationId: string,
  selectorId: string,
  viewId: string,
  hotspots: EditorHotspot[],
): Promise<ActionResult<PublishState, SelectorError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const rows = parseInput(saveHotspotsSchema, hotspots.map(toHotspotRow));
    if (!rows.success) {
      return fail("invalidInput", rows.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("save_view_hotspots", {
      p_view_id: requireId(viewId),
      p_hotspots: rows.data,
    });
    if (error) {
      return writeError(error);
    }
    return ok(await readPublishState(supabase, requireId(selectorId)));
  });
}

// -----------------------------------------------------------------------------
// Statusfarger og pris på solgte enheter
// -----------------------------------------------------------------------------

const displaySettingsSchema = z.object({
  statusColors: statusColorsSchema,
  showPriceOnSold: z.boolean(),
});

export async function updateProjectDisplaySettings(
  organizationId: string,
  projectId: string,
  input: z.input<typeof displaySettingsSchema>,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = parseInput(displaySettingsSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_project_display_settings", {
      p_project_id: requireId(projectId),
      p_status_colors: parsed.data.statusColors,
      p_show_price_on_sold: parsed.data.showPriceOnSold,
    });
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      if (postgresErrorCode(error) === "22023") {
        return fail("invalidInput");
      }
      throw error;
    }
    refresh();
    return ok();
  });
}

export async function updateOrganizationStatusColors(
  organizationId: string,
  input: z.input<typeof statusColorsSchema>,
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "organization.update");
    const parsed = parseInput(statusColorsSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ status_colors: parsed.data })
      .eq("id", organizationId)
      .select("id")
      .single();
    if (error) {
      if (postgresErrorCode(error) === "42501" || postgresErrorCode(error) === "PGRST116") {
        return fail("forbidden");
      }
      throw error;
    }
    refresh();
    return ok();
  });
}
