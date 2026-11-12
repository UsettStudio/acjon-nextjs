import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { NavLink } from "@/components/admin/nav-link";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";

async function SettingsTabs({ params }: { params: LayoutProps<"/[org]/settings">["params"] }) {
  const { org } = await params;
  const [t, context] = await Promise.all([getTranslations("settings.tabs"), getOrgContext(org)]);
  return (
    <nav aria-label={t("label")} className="mb-8 flex flex-wrap gap-1 border-b pb-2">
      <NavLink href={`/${org}/settings`} exact>
        {t("organization")}
      </NavLink>
      <NavLink href={`/${org}/settings/members`}>{t("members")}</NavLink>
      <NavLink href={`/${org}/settings/brand`}>{t("brand")}</NavLink>
      {can(context.role, "domains.manage") ? <NavLink href={`/${org}/settings/domains`}>{t("domains")}</NavLink> : null}
      {can(context.role, "organization.billing") ? (
        <NavLink href={`/${org}/settings/billing`}>{t("billing")}</NavLink>
      ) : null}
      {can(context.role, "integrations.manage") ? <NavLink href={`/${org}/settings/api`}>{t("api")}</NavLink> : null}
    </nav>
  );
}

export default async function SettingsLayout({ children, params }: LayoutProps<"/[org]/settings">) {
  const t = await getTranslations("settings");
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <Suspense fallback={<Skeleton className="mb-8 h-10 w-64" />}>
        <SettingsTabs params={params} />
      </Suspense>
      {children}
    </>
  );
}
