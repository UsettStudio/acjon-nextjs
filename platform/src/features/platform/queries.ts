import "server-only";

import type { ProjectPhase } from "@/features/projects/schemas";
import { isPlan, type Plan } from "@/lib/billing/plans";
import type { SubscriptionStatus } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";

export type PlatformProject = {
  id: string;
  name: string;
  phase: ProjectPhase;
  units: number;
  launchedAt: string | null;
  /** Antall enheter oppstartsavgiften dekker. null: ingen grense, eller ikke lansert. */
  unitLimit: number | null;
};

export type PlatformOrganization = {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  createdAt: string;
  members: number;
  projects: PlatformProject[];
};

/**
 * En organisasjon med prosjektene og lanseringen deres, for plattformadmin.
 * RLS gir plattformadmin lesetilgang til organisasjoner, prosjekter og enheter.
 */
export async function getPlatformOrganization(slug: string): Promise<PlatformOrganization | null> {
  const supabase = await createClient();
  const { data: organization, error } = await supabase
    .from("organizations")
    .select("id, name, slug, plan, subscription_status, trial_ends_at, created_at, memberships(count)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    throw error;
  }
  if (!organization) {
    return null;
  }
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, phase, launched_at, launch_unit_limit")
    .eq("organization_id", organization.id)
    .order("name");
  if (projectsError) {
    throw projectsError;
  }
  const units = new Map<string, number>();
  if (projects.length > 0) {
    const { data: counts, error: countsError } = await supabase.rpc("unit_status_counts", {
      p_project_ids: projects.map((project) => project.id),
    });
    if (countsError) {
      throw countsError;
    }
    for (const row of counts) {
      units.set(row.project_id, (units.get(row.project_id) ?? 0) + row.units);
    }
  }
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    plan: isPlan(organization.plan) ? organization.plan : "start",
    status: organization.subscription_status,
    trialEndsAt: organization.trial_ends_at,
    createdAt: organization.created_at,
    members: organization.memberships[0]?.count ?? 0,
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      phase: project.phase,
      units: units.get(project.id) ?? 0,
      launchedAt: project.launched_at,
      unitLimit: project.launched_at ? project.launch_unit_limit : null,
    })),
  };
}
