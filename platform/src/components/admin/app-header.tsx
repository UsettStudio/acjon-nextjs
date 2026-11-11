import { getTranslations } from "next-intl/server";

import { NavLink } from "@/components/admin/nav-link";
import { OrganizationSwitcher } from "@/components/admin/organization-switcher";
import { SkipLink } from "@/components/admin/skip-link";
import { UserMenu } from "@/components/admin/user-menu";
import { can, type MemberRole } from "@/lib/auth/permissions";
import { getMemberships, getProfile, isPlatformAdmin, requireUser } from "@/lib/auth/dal";
import { publicEnv } from "@/lib/env";

/** Toppmeny i admin. Med orgSlug vises menyen for organisasjonen. */
export async function AppHeader({ orgSlug, role }: { orgSlug?: string; role?: MemberRole }) {
  const user = await requireUser();
  const [t, tAuth, memberships, profile, platformAdmin] = await Promise.all([
    getTranslations("nav"),
    getTranslations("auth"),
    getMemberships(),
    getProfile(),
    isPlatformAdmin(),
  ]);
  const organizations = memberships.map((m) => ({ name: m.organization.name, slug: m.organization.slug }));
  const current = organizations.find((o) => o.slug === orgSlug) ?? null;
  const email = profile?.email ?? user.email ?? "";

  return (
    <header className="border-b bg-background">
      <SkipLink label={t("skipToContent")} />
      <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
        <OrganizationSwitcher
          current={current}
          organizations={organizations}
          labels={{ switch: t("switchOrganization"), create: t("newOrganization"), fallback: publicEnv().productName }}
        />
        <nav aria-label={t("mainMenu")} className="flex flex-wrap items-center gap-1">
          {current ? (
            <>
              <NavLink href={`/${current.slug}`} exact>
                {t("overview")}
              </NavLink>
              {can(role, "organization.update") ? (
                <NavLink href={`/${current.slug}/settings`}>{t("settings")}</NavLink>
              ) : null}
            </>
          ) : null}
          {platformAdmin ? <NavLink href="/platform">{t("platform")}</NavLink> : null}
        </nav>
        <div className="ml-auto">
          <UserMenu
            name={profile?.fullName || email}
            email={email}
            labels={{ menu: t("userMenu"), account: t("account"), signOut: tAuth("signOut") }}
          />
        </div>
      </div>
    </header>
  );
}

export function AppHeaderSkeleton() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center gap-4 px-4 py-2">
        <div className="h-8 w-40 animate-pulse rounded-md bg-accent" />
        <div className="ml-auto size-8 animate-pulse rounded-full bg-accent" />
      </div>
    </header>
  );
}
