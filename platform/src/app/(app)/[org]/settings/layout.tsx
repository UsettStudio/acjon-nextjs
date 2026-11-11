import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { NavLink } from "@/components/admin/nav-link";
import { Skeleton } from "@/components/ui/skeleton";

async function SettingsTabs({ params }: { params: LayoutProps<"/[org]/settings">["params"] }) {
  const { org } = await params;
  const t = await getTranslations("settings.tabs");
  return (
    <nav aria-label={t("organization")} className="mb-8 flex gap-1 border-b pb-2">
      <NavLink href={`/${org}/settings`} exact>
        {t("organization")}
      </NavLink>
      <NavLink href={`/${org}/settings/members`}>{t("members")}</NavLink>
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
