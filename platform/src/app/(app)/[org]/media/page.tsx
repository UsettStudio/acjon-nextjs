import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/admin/page-header";
import { listAssets } from "@/features/media/assets";
import { MediaLibrary } from "@/features/media/components/media-library";
import { can } from "@/lib/auth/permissions";
import { getOrgContext } from "@/lib/auth/dal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("media");
  return { title: t("title") };
}

export default async function MediaPage({ params }: PageProps<"/[org]/media">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "content.edit")) {
    notFound();
  }
  const [t, assets] = await Promise.all([getTranslations("media"), listAssets(context.organization.id)]);
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <MediaLibrary
        organizationId={context.organization.id}
        assets={assets}
        canEdit={context.writable}
        canDeleteAll={can(context.role, "organization.update")}
        currentUserId={context.user.id}
      />
    </>
  );
}
