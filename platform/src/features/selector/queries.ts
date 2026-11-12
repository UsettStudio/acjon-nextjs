import "server-only";

import { cache } from "react";

import { ASSET_COLUMNS, toMediaAsset, type MediaAsset } from "@/features/media/assets";
import {
  fromHotspotRow,
  parseSelectorSettings,
  parseStatusColorOverrides,
  resolveStatusColors,
  type EditorHotspot,
  type SelectorSettings,
  type StatusColorOverrides,
} from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";
import { createClient } from "@/lib/supabase/server";

export type SelectorSummary = {
  id: string;
  name: string;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
};

/** PostgREST svarer med [{ count }] for en innebygd telling. Typene beskriver det som ett objekt. */
function countOf(value: unknown): number {
  const item: unknown = Array.isArray(value) ? value[0] : value;
  return typeof item === "object" && item !== null && "count" in item && typeof item.count === "number" ? item.count : 0;
}

export async function listSelectors(projectId: string): Promise<SelectorSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("selectors")
    .select("id, name, published_at, created_at, views:selector_views!selector_views_selector_id_project_id_organization_id_fkey(count)")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) {
    throw error;
  }
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    publishedAt: row.published_at,
    viewCount: countOf(row.views),
    createdAt: row.created_at,
  }));
}

export type EditorView = {
  id: string;
  parentViewId: string | null;
  name: string;
  kind: "overview" | "facade" | "floor" | "site_plan";
  angleGroup: string | null;
  sortOrder: number;
  imageWidth: number | null;
  imageHeight: number | null;
  asset: MediaAsset | null;
};

export type EditorUnit = {
  id: string;
  unitNumber: string;
  status: UnitStatus;
  floor: number | null;
  rooms: number | null;
  braI: number | null;
  stageId: string | null;
  isHidden: boolean;
};

export type SelectorEditorData = {
  selector: {
    id: string;
    name: string;
    settings: SelectorSettings;
    entryViewId: string | null;
    publishedAt: string | null;
  };
  views: EditorView[];
  hotspots: Record<string, EditorHotspot[]>;
  units: EditorUnit[];
  stages: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  hasUnpublishedChanges: boolean;
  statusColors: Record<UnitStatus, string>;
};

export type DisplaySettings = {
  organizationColors: StatusColorOverrides;
  projectColors: StatusColorOverrides;
  statusColors: Record<UnitStatus, string>;
  showPriceOnSold: boolean;
};

/** Statusfarger (organisasjon og prosjekt) og om prisen vises på solgte enheter. */
export const getDisplaySettings = cache(async (organizationId: string, projectId: string): Promise<DisplaySettings> => {
  const supabase = await createClient();
  const [organization, project] = await Promise.all([
    supabase.from("organizations").select("status_colors").eq("id", organizationId).single(),
    supabase.from("projects").select("settings").eq("id", projectId).single(),
  ]);
  if (organization.error) {
    throw organization.error;
  }
  if (project.error) {
    throw project.error;
  }
  const settings = (project.data.settings ?? {}) as { status_colors?: unknown; show_price_on_sold?: unknown };
  return {
    organizationColors: parseStatusColorOverrides(organization.data.status_colors),
    projectColors: parseStatusColorOverrides(settings.status_colors),
    statusColors: resolveStatusColors(organization.data.status_colors, settings.status_colors),
    showPriceOnSold: settings.show_price_on_sold === true,
  };
});

const VIEW_COLUMNS = `id, parent_view_id, name, kind, angle_group, sort_order, image_width, image_height, asset:assets(${ASSET_COLUMNS})` as const;

export function toEditorView(row: {
  id: string;
  parent_view_id: string | null;
  name: string;
  kind: EditorView["kind"];
  angle_group: string | null;
  sort_order: number;
  image_width: number | null;
  image_height: number | null;
  asset: Parameters<typeof toMediaAsset>[0] | null;
}): EditorView {
  return {
    id: row.id,
    parentViewId: row.parent_view_id,
    name: row.name,
    kind: row.kind,
    angleGroup: row.angle_group,
    sortOrder: row.sort_order,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    asset: row.asset ? toMediaAsset(row.asset) : null,
  };
}

export { VIEW_COLUMNS };

/** Alt editoren trenger for én boligvelger. null hvis velgeren ikke finnes i prosjektet. */
export const getSelectorEditorData = cache(
  async (organizationId: string, projectId: string, selectorId: string): Promise<SelectorEditorData | null> => {
    const supabase = await createClient();
    const { data: selector, error } = await supabase
      .from("selectors")
      .select("id, name, settings, entry_view_id, published_at")
      .eq("project_id", projectId)
      .eq("id", selectorId)
      .maybeSingle();
    if (error) {
      if (error.code === "22P02") {
        return null;
      }
      throw error;
    }
    if (!selector) {
      return null;
    }

    const [views, units, stages, projects, state, display] = await Promise.all([
      supabase.from("selector_views").select(VIEW_COLUMNS).eq("selector_id", selectorId).order("sort_order").order("created_at"),
      supabase
        .from("units")
        .select("id, unit_number, status, floor, rooms, bra_i, stage_id, is_hidden, sort_order")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("unit_number")
        .limit(5000),
      supabase.from("stages").select("id, name").eq("project_id", projectId).order("sort_order"),
      supabase.from("projects").select("id, name").eq("organization_id", organizationId).neq("id", projectId).order("name"),
      supabase.rpc("get_selector_publish_state", { p_selector_id: selectorId }),
      getDisplaySettings(organizationId, projectId),
    ]);
    for (const result of [views, units, stages, projects, state]) {
      if (result.error) {
        throw result.error;
      }
    }

    const viewIds = (views.data ?? []).map((view) => view.id);
    const hotspots: Record<string, EditorHotspot[]> = Object.fromEntries(viewIds.map((id) => [id, []]));
    if (viewIds.length > 0) {
      const { data: rows, error: hotspotError } = await supabase
        .from("hotspots")
        .select("id, view_id, shape, points, target_type, target_unit_id, target_view_id, target_project_id, target_url, label")
        .in("view_id", viewIds)
        .order("sort_order")
        .order("created_at");
      if (hotspotError) {
        throw hotspotError;
      }
      for (const row of rows) {
        hotspots[row.view_id]?.push(
          fromHotspotRow({ ...row, points: row.points as [number, number][] }),
        );
      }
    }

    const publishState = state.data as { has_changes?: boolean } | null;
    return {
      selector: {
        id: selector.id,
        name: selector.name,
        settings: parseSelectorSettings(selector.settings),
        entryViewId: selector.entry_view_id,
        publishedAt: selector.published_at,
      },
      views: (views.data ?? []).map(toEditorView),
      hotspots,
      units: (units.data ?? []).map((unit) => ({
        id: unit.id,
        unitNumber: unit.unit_number,
        status: unit.status,
        floor: unit.floor,
        rooms: unit.rooms,
        braI: unit.bra_i,
        stageId: unit.stage_id,
        isHidden: unit.is_hidden,
      })),
      stages: stages.data ?? [],
      projects: projects.data ?? [],
      hasUnpublishedChanges: publishState?.has_changes === true,
      statusColors: display.statusColors,
    };
  },
);
