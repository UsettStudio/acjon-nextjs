import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationStats } from "@/features/members/queries";
import { can } from "@/lib/auth/permissions";
import { getOrgContext, getProfile } from "@/lib/auth/dal";
import { trialDaysLeft } from "@/lib/billing/subscription";
import { formatDate } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage({ params }: PageProps<"/[org]">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  const [t, tRoles, tStatus, profile, stats] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("roles"),
    getTranslations("subscriptionStatus"),
    getProfile(),
    getOrganizationStats(context.organization.id),
  ]);
  const { organization } = context;
  const daysLeft = organization.subscriptionStatus === "trialing" ? trialDaysLeft(organization.trialEndsAt) : null;
  const name = profile?.fullName || profile?.email || "";

  return (
    <>
      <PageHeader title={t("welcome", { name })} description={t("yourRole", { role: tRoles(context.role) })} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("subscription")}</h2>
            </CardTitle>
            <CardDescription>
              <Badge variant={context.writable ? "secondary" : "destructive"}>
                {tStatus(organization.subscriptionStatus)}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            {daysLeft !== null && organization.trialEndsAt ? (
              daysLeft > 0 ? (
                <>
                  <p className="text-2xl font-semibold">{t("trialDaysLeft", { days: daysLeft })}</p>
                  <p className="text-muted-foreground">
                    {t("trialEndsOn", { date: formatDate(organization.trialEndsAt) })}
                  </p>
                </>
              ) : (
                <p>{t("trialEnded")}</p>
              )
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("members")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <p className="text-2xl font-semibold">{t("memberCount", { count: stats.members })}</p>
            {can(context.role, "members.manage") ? (
              <p className="text-muted-foreground">{t("pendingInvites", { count: stats.pendingInvitations })}</p>
            ) : null}
          </CardContent>
          {can(context.role, "members.manage") ? (
            <CardFooter>
              <Button asChild variant="outline" size="sm">
                <Link href={`/${organization.slug}/settings/members`}>{t("manageMembers")}</Link>
              </Button>
            </CardFooter>
          ) : null}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("projects")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{t("projectCount", { count: stats.projects })}</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link href={`/${organization.slug}/projects`}>{t("openProjects")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
