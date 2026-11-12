import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteMemberDialog } from "@/features/members/components/invite-member-dialog";
import { MembersTable } from "@/features/members/components/members-table";
import { PendingInvitations } from "@/features/members/components/pending-invitations";
import { listMembers, listPendingInvitations, listProjects } from "@/features/members/queries";
import { assignableRoles, can } from "@/lib/auth/permissions";
import { getOrgContext } from "@/lib/auth/dal";
import { planLimits } from "@/lib/billing/plans";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("members");
  return { title: t("title") };
}

export default async function MembersPage({ params }: PageProps<"/[org]/settings/members">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "members.manage")) {
    notFound();
  }
  const organizationId = context.organization.id;
  const [t, tPlans, members, invitations, projects] = await Promise.all([
    getTranslations("members"),
    getTranslations("billing.plans"),
    listMembers(organizationId),
    listPendingInvitations(organizationId),
    listProjects(organizationId),
  ]);
  const roles = assignableRoles(context.role);
  const readOnly = !context.writable;

  // Plassene i pakken: medlemmer og ventende invitasjoner til nye personer, som i app.limit_members().
  const memberEmails = new Set(members.flatMap((member) => (member.email ? [member.email.toLowerCase()] : [])));
  const pendingSeats = invitations.filter((invitation) => !invitation.expired && !memberEmails.has(invitation.email.toLowerCase())).length;
  const used = members.length + pendingSeats;
  const limit = planLimits(context.organization.plan).members;
  const full = limit !== null && used >= limit;
  const planName = tPlans(`${context.organization.plan}.name`);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <CardTitle>
              <h2>{t("title")}</h2>
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
            <p className="text-sm" data-testid="member-seats">
              {limit === null ? t("seatsUnlimited", { used, plan: planName }) : t("seats", { used, limit, plan: planName })}{" "}
              {full ? (
                can(context.role, "organization.billing") ? (
                  <Link className="font-medium underline underline-offset-4" href={`/${org}/settings/billing`}>
                    {t("seatsUpgrade")}
                  </Link>
                ) : (
                  t("seatsAskOwner")
                )
              ) : null}
            </p>
          </div>
          <InviteMemberDialog organizationId={organizationId} roles={roles} projects={projects} disabled={readOnly || full} />
        </CardHeader>
        <CardContent>
          <MembersTable
            organizationId={organizationId}
            currentUserId={context.user.id}
            actorRole={context.role}
            assignable={roles}
            members={members}
            projects={projects}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("invitations")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PendingInvitations organizationId={organizationId} invitations={invitations} readOnly={readOnly} />
        </CardContent>
      </Card>
    </div>
  );
}
