"use server";

import * as Sentry from "@sentry/nextjs";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { fail, ok, type ActionResult } from "@/lib/actions/result";
import {
  postgresErrorCode,
  parseInput,
  requireActionUser,
  requireOrgCapability,
  runAction,
} from "@/lib/actions/server";
import { assignableRoles, isProjectScopedRole, type MemberRole } from "@/lib/auth/permissions";
import { getProfile, type OrganizationSummary } from "@/lib/auth/dal";
import { invitationEmail } from "@/lib/email/templates/invitation";
import { sendEmail } from "@/lib/email/send";
import { appUrl, publicEnv } from "@/lib/env";
import { generateToken, sha256Hex } from "@/lib/security/tokens";
import { createClient } from "@/lib/supabase/server";
import {
  changeRoleSchema,
  inviteMemberSchema,
  projectAccessSchema,
  type InviteMemberInput,
} from "@/features/members/schemas";

const INVITATION_DAYS = 7;

type InvitationLink = { email: string; link: string; delivered: boolean };

function invitationExpiry(): string {
  return new Date(Date.now() + INVITATION_DAYS * 86_400_000).toISOString();
}

/** Sender invitasjonen på e-post. En feil i utsendingen stopper ikke invitasjonen; lenken vises i stedet. */
async function deliverInvitation(params: {
  organization: OrganizationSummary;
  email: string;
  role: MemberRole;
  token: string;
  expiresAt: string;
}): Promise<InvitationLink> {
  const link = appUrl(`/invite/${params.token}`);
  try {
    const profile = await getProfile();
    const message = await invitationEmail({
      to: params.email,
      organizationName: params.organization.name,
      inviterName: profile?.fullName || profile?.email || params.organization.name,
      role: params.role,
      url: link,
      expiresAt: params.expiresAt,
      productName: publicEnv().productName,
    });
    const { delivered } = await sendEmail(message);
    return { email: params.email, link, delivered };
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    return { email: params.email, link, delivered: false };
  }
}

export async function inviteMember(
  organizationId: string,
  input: InviteMemberInput,
): Promise<ActionResult<InvitationLink, "alreadyMember" | "alreadyInvited">> {
  return runAction(async () => {
    const { role: actorRole, organization } = await requireOrgCapability(organizationId, "members.manage");
    const parsed = parseInput(inviteMemberSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const { email, role } = parsed.data;
    if (!assignableRoles(actorRole).includes(role)) {
      return fail("forbidden");
    }
    const projectIds = isProjectScopedRole(role) ? parsed.data.projectIds : [];

    const supabase = await createClient();
    const { data: existing, error: existingError } = await supabase
      .from("memberships")
      .select("id, profile:profiles!inner(email)")
      .eq("organization_id", organizationId)
      .eq("profile.email", email)
      .limit(1);
    if (existingError) {
      throw existingError;
    }
    if (existing.length > 0) {
      return fail("alreadyMember");
    }

    const token = generateToken();
    const expiresAt = invitationExpiry();
    const { error } = await supabase.from("invitations").insert({
      organization_id: organizationId,
      email,
      role,
      project_ids: projectIds,
      token_hash: sha256Hex(token),
      expires_at: expiresAt,
    });
    if (error) {
      switch (postgresErrorCode(error)) {
        case "23505":
          return fail("alreadyInvited");
        case "23503":
          return fail("invalidInput", { projectIds: "required" });
        case "42501":
          return fail("forbidden");
        // Pakken har ikke plass til flere brukere (app.limit_members).
        case "P0413":
          return fail("planLimit");
        default:
          throw error;
      }
    }

    const result = await deliverInvitation({ organization, email, role, token, expiresAt });
    refresh();
    return ok(result);
  });
}

/** Lager ny lenke (det gamle tokenet slutter å virke) og sender invitasjonen på nytt. */
export async function resendInvitation(
  organizationId: string,
  invitationId: string,
): Promise<ActionResult<InvitationLink>> {
  return runAction(async () => {
    const { organization } = await requireOrgCapability(organizationId, "members.manage");
    const supabase = await createClient();
    const token = generateToken();
    const expiresAt = invitationExpiry();
    const { data, error } = await supabase
      .from("invitations")
      .update({ token_hash: sha256Hex(token), expires_at: expiresAt })
      .eq("id", invitationId)
      .eq("organization_id", organizationId)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .select("email, role");
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      // En utløpt invitasjon tar en plass igjen, og pakken er full.
      if (postgresErrorCode(error) === "P0413") {
        return fail("planLimit");
      }
      throw error;
    }
    const invitation = data[0];
    if (!invitation) {
      return fail("notFound");
    }
    const result = await deliverInvitation({
      organization,
      email: invitation.email,
      role: invitation.role,
      token,
      expiresAt,
    });
    refresh();
    return ok(result);
  });
}

export async function revokeInvitation(organizationId: string, invitationId: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(organizationId, "members.manage");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invitations")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", invitationId)
      .eq("organization_id", organizationId)
      .is("accepted_at", null)
      .select("id");
    if (error) {
      throw error;
    }
    if (data.length === 0) {
      return fail("notFound");
    }
    refresh();
    return ok();
  });
}

export async function changeMemberRole(
  organizationId: string,
  membershipId: string,
  role: MemberRole,
): Promise<ActionResult<undefined, "lastOwner">> {
  return runAction(async () => {
    const { role: actorRole } = await requireOrgCapability(organizationId, "members.manage");
    const parsed = parseInput(changeRoleSchema, { membershipId, role });
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    if (!assignableRoles(actorRole).includes(parsed.data.role)) {
      return fail("forbidden");
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("memberships")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.membershipId)
      .eq("organization_id", organizationId)
      .select("id");
    if (error) {
      switch (postgresErrorCode(error)) {
        case "23514":
          return fail("lastOwner");
        case "42501":
          return fail("forbidden");
        default:
          throw error;
      }
    }
    if (data.length === 0) {
      return fail("forbidden");
    }
    refresh();
    return ok();
  });
}

export async function removeMember(
  organizationId: string,
  membershipId: string,
): Promise<ActionResult<undefined, "lastOwner">> {
  return runAction(async () => {
    await requireOrgCapability(organizationId, "members.manage");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("memberships")
      .delete()
      .eq("id", membershipId)
      .eq("organization_id", organizationId)
      .select("id");
    if (error) {
      if (postgresErrorCode(error) === "23514") {
        return fail("lastOwner");
      }
      throw error;
    }
    if (data.length === 0) {
      return fail("forbidden");
    }
    refresh();
    return ok();
  });
}

/** Innlogget bruker forlater organisasjonen. Lov også i lesemodus. */
export async function leaveOrganization(organizationId: string): Promise<ActionResult<undefined, "lastOwner">> {
  return runAction(async () => {
    const user = await requireActionUser();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("memberships")
      .delete()
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .select("id");
    if (error) {
      if (postgresErrorCode(error) === "23514") {
        return fail("lastOwner");
      }
      throw error;
    }
    if (data.length === 0) {
      return fail("notFound");
    }
    redirect("/");
  });
}

export async function setProjectAccess(
  organizationId: string,
  userId: string,
  projectIds: string[],
): Promise<ActionResult> {
  return runAction(async () => {
    await requireOrgCapability(organizationId, "members.manage");
    const parsed = parseInput(projectAccessSchema, { userId, projectIds });
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_project_access", {
      p_organization_id: organizationId,
      p_user_id: parsed.data.userId,
      p_project_ids: parsed.data.projectIds,
    });
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      throw error;
    }
    refresh();
    return ok();
  });
}
