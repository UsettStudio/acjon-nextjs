import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExtendTrialButton } from "@/features/platform/components/extend-trial-button";
import { isPlatformAdmin } from "@/lib/auth/dal";
import { isPlan } from "@/lib/billing/plans";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform");
  return { title: t("title") };
}

/** Plattformadmin leser alle organisasjoner via RLS (lesetilgang for support). */
async function OrganizationsTable() {
  if (!(await isPlatformAdmin())) {
    notFound();
  }
  const t = await getTranslations("platform");
  const tStatus = await getTranslations("subscriptionStatus");
  const tPlans = await getTranslations("billing.plans");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(
      "id, name, slug, created_at, plan, subscription_status, trial_ends_at, stripe_subscription_id, memberships(count), projects(count)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  if (data.length === 0) {
    return <p className="text-muted-foreground">{t("empty")}</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("slug")}</TableHead>
          <TableHead>{t("subscription")}</TableHead>
          <TableHead>{t("trialEnds")}</TableHead>
          <TableHead className="text-right">{t("members")}</TableHead>
          <TableHead className="text-right">{t("projects")}</TableHead>
          <TableHead>{t("created")}</TableHead>
          <TableHead>
            <span className="sr-only">{t("actions")}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((organization) => (
          <TableRow key={organization.id}>
            <TableCell className="font-medium">{organization.name}</TableCell>
            <TableCell className="text-muted-foreground">{organization.slug}</TableCell>
            <TableCell>
              {tPlans(`${isPlan(organization.plan) ? organization.plan : "start"}.name`)}
              {" · "}
              {tStatus(organization.subscription_status)}
            </TableCell>
            <TableCell>
              {organization.subscription_status === "trialing" && organization.trial_ends_at
                ? formatDate(organization.trial_ends_at)
                : "–"}
            </TableCell>
            <TableCell className="text-right">{organization.memberships[0]?.count ?? 0}</TableCell>
            <TableCell className="text-right">{organization.projects[0]?.count ?? 0}</TableCell>
            <TableCell>{formatDate(organization.created_at)}</TableCell>
            <TableCell className="text-right">
              {organization.stripe_subscription_id === null ||
              ["canceled", "incomplete_expired"].includes(organization.subscription_status) ? (
                <ExtendTrialButton organizationId={organization.id} organizationName={organization.name} />
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function PlatformPage() {
  const t = await getTranslations("platform");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <OrganizationsTable />
      </Suspense>
    </>
  );
}
