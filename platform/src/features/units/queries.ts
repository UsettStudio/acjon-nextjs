import "server-only";

import { cache } from "react";

import type { StatusEvent } from "@/features/projects/queries";
import { customFieldKeys } from "@/features/units/custom-fields";
import type { UnitRow } from "@/features/units/fields";
import { createClient } from "@/lib/supabase/server";

/** Kolonnene enhetstabellen trenger. Beskrivelse, egne felt og filer hentes bare i enhetsskjemaet. */
export const UNIT_LIST_COLUMNS =
  "id, unit_number, title, unit_type, status, floor, rooms, bedrooms, bathrooms, bra_i, bra_e, bra_b, tba, plot_area, price, purchase_costs, shared_debt, monthly_fee, ownership_type, orientation, parking, storage, external_id, is_hidden, stage_id, building_id, sort_order, slug, updated_at" as const;

export type UnitListItem = Pick<
  UnitRow,
  | "id"
  | "unit_number"
  | "title"
  | "unit_type"
  | "status"
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
  | "external_id"
  | "is_hidden"
  | "stage_id"
  | "building_id"
  | "sort_order"
  | "slug"
  | "updated_at"
>;

export async function listUnits(projectId: string): Promise<UnitListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .select(UNIT_LIST_COLUMNS)
    .eq("project_id", projectId)
    .order("sort_order")
    .order("unit_number")
    .limit(5000);
  if (error) {
    throw error;
  }
  return data;
}

export const getUnit = cache(async (projectId: string, unitId: string): Promise<UnitRow | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("project_id", projectId)
    .eq("id", unitId)
    .maybeSingle();
  if (error) {
    // Ugyldig uuid i adressen gir 22P02. Det er det samme som at enheten ikke finnes.
    if (error.code === "22P02") {
      return null;
    }
    throw error;
  }
  return data;
});

export async function listUnitStatusEvents(unitId: string, limit = 100): Promise<StatusEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unit_status_events")
    .select("id, unit_id, unit_number, from_status, to_status, note, source, created_at, profile:profiles(full_name, email)")
    .eq("unit_id", unitId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw error;
  }
  return data.map((event) => ({
    id: event.id,
    unitId: event.unit_id,
    unitNumber: event.unit_number,
    fromStatus: event.from_status,
    toStatus: event.to_status,
    note: event.note,
    source: event.source,
    changedBy: event.profile?.full_name || event.profile?.email || null,
    createdAt: event.created_at,
  }));
}

/** Navnene på egne felt som brukes på enhetene i prosjektet, sortert. */
export async function listCustomFieldNames(projectId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("units").select("custom_fields").eq("project_id", projectId).neq("custom_fields", "{}").limit(5000);
  if (error) {
    throw error;
  }
  return customFieldKeys(data.map((row) => row.custom_fields));
}

/** Egne felt som vises på publiserte sider (projects.settings.public_custom_fields). */
export async function getPublicCustomFieldNames(projectId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("settings").eq("id", projectId).single();
  if (error) {
    throw error;
  }
  const settings = data.settings as { public_custom_fields?: unknown } | null;
  return Array.isArray(settings?.public_custom_fields) ? settings.public_custom_fields.filter((key): key is string => typeof key === "string") : [];
}
