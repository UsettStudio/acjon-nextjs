import type { Page } from "@playwright/test";

import { serviceClient } from "./db";

/**
 * Lanserer prosjektet uten oppstartsavgift (frafall), som oppsett i tester som
 * ikke handler om lanseringen. Selve betalingen testes i fase6.spec.ts.
 */
export async function waiveLaunch(orgSlug: string, projectSlug: string): Promise<void> {
  const supabase = serviceClient();
  const { data: organization, error: orgError } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
  if (orgError) {
    throw orgError;
  }
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, launched_at")
    .eq("organization_id", organization.id)
    .eq("slug", projectSlug)
    .single();
  if (error) {
    throw error;
  }
  if (project.launched_at) {
    return;
  }
  const { error: waiveError } = await supabase.rpc("waive_project_launch", { p_project_id: project.id, p_note: "Ende-til-ende-test" });
  if (waiveError) {
    throw waiveError;
  }
}

/** Lanserer prosjektet siden står i (/{org}/projects/{prosjekt}/…). */
export async function waiveLaunchForPage(page: Page): Promise<void> {
  const [, orgSlug, section, projectSlug] = new URL(page.url()).pathname.split("/");
  if (!orgSlug || section !== "projects" || !projectSlug) {
    throw new Error(`Ikke en prosjektside i admin: ${page.url()}`);
  }
  await waiveLaunch(orgSlug, projectSlug);
}
