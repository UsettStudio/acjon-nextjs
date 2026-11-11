import "server-only";

import { isMemberRole, type MemberRole } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export type MemberRow = {
  membershipId: string;
  userId: string;
  role: MemberRole;
  fullName: string | null;
  email: string | null;
  projectIds: string[];
  joinedAt: string;
};

export type InvitationRow = {
  id: string;
  email: string;
  role: MemberRole;
  projectIds: string[];
  expiresAt: string;
  createdAt: string;
  inviterName: string | null;
  expired: boolean;
};

export type ProjectOption = { id: string; name: string };

export async function listMembers(organizationId: string): Promise<MemberRow[]> {
  const supabase = await createClient();
  const [memberships, access] = await Promise.all([
    supabase
      .from("memberships")
      .select("id, user_id, role, created_at, profile:profiles(full_name, email)")
      .eq("organization_id", organizationId)
      .order("created_at"),
    supabase.from("project_members").select("user_id, project_id").eq("organization_id", organizationId),
  ]);
  if (memberships.error) {
    throw memberships.error;
  }
  if (access.error) {
    throw access.error;
  }
  const projectsByUser = new Map<string, string[]>();
  for (const row of access.data) {
    projectsByUser.set(row.user_id, [...(projectsByUser.get(row.user_id) ?? []), row.project_id]);
  }
  return memberships.data.flatMap((row) =>
    isMemberRole(row.role)
      ? [
          {
            membershipId: row.id,
            userId: row.user_id,
            role: row.role,
            fullName: row.profile?.full_name ?? null,
            email: row.profile?.email ?? null,
            projectIds: projectsByUser.get(row.user_id) ?? [],
            joinedAt: row.created_at,
          },
        ]
      : [],
  );
}

/** Ventende invitasjoner (også utløpte, så de kan sendes på nytt). Bare eier og admin ser dem (RLS). */
export async function listPendingInvitations(organizationId: string): Promise<InvitationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, role, project_ids, expires_at, created_at, inviter:profiles!invitations_invited_by_profile_fkey(full_name, email)")
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  const now = Date.now();
  return data.flatMap((row) =>
    isMemberRole(row.role)
      ? [
          {
            id: row.id,
            email: row.email,
            role: row.role,
            projectIds: row.project_ids,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
            inviterName: row.inviter?.full_name ?? row.inviter?.email ?? null,
            expired: new Date(row.expires_at).getTime() <= now,
          },
        ]
      : [],
  );
}

export async function listProjects(organizationId: string): Promise<ProjectOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name");
  if (error) {
    throw error;
  }
  return data;
}

export async function getOrganizationStats(organizationId: string) {
  const supabase = await createClient();
  const [members, invitations, projects] = await Promise.all([
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
    supabase
      .from("invitations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString()),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
  ]);
  for (const result of [members, invitations, projects]) {
    if (result.error) {
      throw result.error;
    }
  }
  return {
    members: members.count ?? 0,
    pendingInvitations: invitations.count ?? 0,
    projects: projects.count ?? 0,
  };
}
