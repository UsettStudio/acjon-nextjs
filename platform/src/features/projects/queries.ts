import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

import { parseProjectOverview, type ProjectOverview } from "@/features/projects/overview";
import { MILESTONE_KEYS, type Contact, type Milestone, type ProjectPhase } from "@/features/projects/schemas";
import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";
import { can, isMemberRole } from "@/lib/auth/permissions";
import { getOrgContext, type OrgContext } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export type StatusCounts = Record<UnitStatus, number>;

export function emptyStatusCounts(): StatusCounts {
  return { upcoming: 0, available: 0, reserved: 0, sold: 0 };
}

export type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  phase: ProjectPhase;
  address: string | null;
  city: string | null;
  counts: StatusCounts;
  totalUnits: number;
  /** Oppstartsavgiften er betalt eller frafalt, så prosjektet kan publiseres. */
  launched: boolean;
  updatedAt: string;
};

export async function listProjects(organizationId: string): Promise<ProjectSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug, phase, address, city, launched_at, updated_at")
    .eq("organization_id", organizationId)
    .order("name");
  if (error) {
    throw error;
  }
  const counts = await getStatusCounts(data.map((project) => project.id));
  return data.map((project) => {
    const projectCounts = counts.get(project.id) ?? emptyStatusCounts();
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      phase: project.phase,
      address: project.address,
      city: project.city,
      counts: projectCounts,
      totalUnits: UNIT_STATUSES.reduce((sum, status) => sum + projectCounts[status], 0),
      launched: project.launched_at !== null,
      updatedAt: project.updated_at,
    };
  });
}

export async function getStatusCounts(projectIds: string[]): Promise<Map<string, StatusCounts>> {
  const result = new Map<string, StatusCounts>();
  if (projectIds.length === 0) {
    return result;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("unit_status_counts", { p_project_ids: projectIds });
  if (error) {
    throw error;
  }
  for (const row of data) {
    const counts = result.get(row.project_id) ?? emptyStatusCounts();
    counts[row.status] = row.units;
    result.set(row.project_id, counts);
  }
  return result;
}

/** Antall og verdi per status, og fremdriften i oppstarten (sjekklisten på prosjektets oversikt). */
export async function getProjectOverview(projectId: string): Promise<ProjectOverview> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("project_overview", { p_project_id: projectId });
  if (error) {
    throw error;
  }
  return parseProjectOverview(data);
}

// Lagret JSON leses med tilgivende skjemaer: ugyldige oppføringer hoppes over i stedet for å stoppe siden.
const storedMilestone = z.object({
  key: z.enum(MILESTONE_KEYS).catch("custom"),
  label: z.string().nullish().transform((value) => value ?? null),
  text: z.string().nullish().transform((value) => value ?? null),
  date: z.string().nullish().transform((value) => value ?? null),
});

const storedContact = z.object({
  name: z.string(),
  title: z.string().nullish().transform((value) => value ?? null),
  email: z.string().nullish().transform((value) => value ?? null),
  phone: z.string().nullish().transform((value) => value ?? null),
  user_id: z.string().nullish().transform((value) => value ?? null),
  receives_leads: z.boolean().catch(false),
});

function parseList<T>(schema: z.ZodType<T>, value: unknown): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export type ProjectDetail = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  phase: ProjectPhase;
  description: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  municipality: string | null;
  lat: number | null;
  lng: number | null;
  milestones: Milestone[];
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
};

export const getProjectBySlug = cache(async (organizationId: string, slug: string): Promise<ProjectDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, organization_id, name, slug, phase, description, address, postal_code, city, municipality, lat, lng, milestones, contacts, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    organizationId: data.organization_id,
    name: data.name,
    slug: data.slug,
    phase: data.phase,
    description: data.description,
    address: data.address,
    postalCode: data.postal_code,
    city: data.city,
    municipality: data.municipality,
    lat: data.lat,
    lng: data.lng,
    milestones: parseList(storedMilestone, data.milestones),
    contacts: parseList(storedContact, data.contacts),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
});

export type ProjectContext = OrgContext & {
  project: ProjectDetail;
  /** Kan endre prosjektet, byggetrinn, bygg og alle enhetsfelt. */
  canEditContent: boolean;
  /** Kan endre status og pris (også meglere). */
  canSell: boolean;
  canDelete: boolean;
};

/**
 * Prosjektet i adressen /{org}/projects/{slug}. Gir 404 hvis brukeren ikke har
 * tilgang: RLS viser redaktører og meglere bare prosjektene de er tildelt.
 */
export const getProjectContext = cache(async (orgSlug: string, projectSlug: string): Promise<ProjectContext> => {
  const context = await getOrgContext(orgSlug);
  const project = await getProjectBySlug(context.organization.id, projectSlug);
  if (!project) {
    notFound();
  }
  return {
    ...context,
    project,
    canEditContent: context.writable && can(context.role, "content.edit"),
    canSell: context.writable && can(context.role, "units.sales"),
    canDelete: context.writable && can(context.role, "projects.delete"),
  };
});

export type Stage = { id: string; name: string; phase: ProjectPhase; sortOrder: number };
export type Building = { id: string; name: string; stageId: string | null; sortOrder: number };

export const getProjectStructure = cache(
  async (projectId: string): Promise<{ stages: Stage[]; buildings: Building[] }> => {
    const supabase = await createClient();
    const [stages, buildings] = await Promise.all([
      supabase.from("stages").select("id, name, phase, sort_order").eq("project_id", projectId).order("sort_order").order("created_at"),
      supabase
        .from("buildings")
        .select("id, name, stage_id, sort_order")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("created_at"),
    ]);
    if (stages.error) {
      throw stages.error;
    }
    if (buildings.error) {
      throw buildings.error;
    }
    return {
      stages: stages.data.map((s) => ({ id: s.id, name: s.name, phase: s.phase, sortOrder: s.sort_order })),
      buildings: buildings.data.map((b) => ({ id: b.id, name: b.name, stageId: b.stage_id, sortOrder: b.sort_order })),
    };
  },
);

export type StatusEvent = {
  id: string;
  unitId: string | null;
  unitNumber: string;
  fromStatus: UnitStatus | null;
  toStatus: UnitStatus;
  note: string | null;
  source: string;
  changedBy: string | null;
  createdAt: string;
};

export async function listRecentStatusEvents(projectId: string, limit = 10): Promise<StatusEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unit_status_events")
    .select("id, unit_id, unit_number, from_status, to_status, note, source, created_at, profile:profiles(full_name, email)")
    .eq("project_id", projectId)
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

export type MemberOption = { userId: string; name: string; email: string | null; phone: string | null };

/** Medlemmer som kan legges til som kontaktperson. */
export async function listMemberOptions(organizationId: string): Promise<MemberOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, role, profile:profiles(full_name, email, phone)")
    .eq("organization_id", organizationId)
    .order("created_at");
  if (error) {
    throw error;
  }
  return data
    .filter((row) => isMemberRole(row.role))
    .map((row) => ({
      userId: row.user_id,
      name: row.profile?.full_name || row.profile?.email || "",
      email: row.profile?.email ?? null,
      phone: row.profile?.phone ?? null,
    }))
    .filter((member) => member.name !== "");
}

/** Sporingskodene til prosjektsiden (projects.analytics_ids), slik de er lagret. */
export async function getAnalyticsIds(projectId: string): Promise<unknown> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("analytics_ids").eq("id", projectId).single();
  if (error) {
    throw error;
  }
  return data.analytics_ids;
}
