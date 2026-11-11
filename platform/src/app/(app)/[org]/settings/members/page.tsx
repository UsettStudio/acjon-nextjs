import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteMemberDialog } from "@/features/members/components/invite-member-dialog";
import { MembersTable } from "@/features/members/components/members-table";
import { PendingInvitations } from "@/features/members/components/pending-invitations";
import { listMembers, listPendingInvitations, listProjects } from "@/features/members/queries";
import { assignableRoles, can } from "@/lib/auth/permissions";
import { getOrgContext } from "@/lib/auth/dal";

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
  const [t, members, invitations, projects] = await Promise.all([
    getTranslations("members"),
    listMembers(organizationId),
    listPendingInvitations(organizationId),
    listProjects(organizationId),
  ]);
  const roles = assignableRoles(context.role);
  const readOnly = !context.writable;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <CardTitle>
              <h2>{t("title")}</h2>
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <InviteMemberDialog organizationId={organizationId} roles={roles} projects={projects} disabled={readOnly} />
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
