import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isPlatformAdmin } from "@/lib/auth/dal";
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at, subscription_status, memberships(count), projects(count)")
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
          <TableHead className="text-right">{t("members")}</TableHead>
          <TableHead className="text-right">{t("projects")}</TableHead>
          <TableHead>{t("created")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((organization) => (
          <TableRow key={organization.id}>
            <TableCell className="font-medium">{organization.name}</TableCell>
            <TableCell className="text-muted-foreground">{organization.slug}</TableCell>
            <TableCell>{tStatus(organization.subscription_status)}</TableCell>
            <TableCell className="text-right">{organization.memberships[0]?.count ?? 0}</TableCell>
            <TableCell className="text-right">{organization.projects[0]?.count ?? 0}</TableCell>
            <TableCell>{formatDate(organization.created_at)}</TableCell>
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
