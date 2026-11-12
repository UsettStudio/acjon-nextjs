"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

/** Lanseringssiden for prosjektet i adressen (/{org}/projects/{prosjekt}/…), eller null. */
export function launchHrefFromPath(pathname: string): string | null {
  const [, org, section, project] = pathname.split("/");
  return org && section === "projects" && project ? `/${org}/projects/${project}/launch` : null;
}

/**
 * Viser at prosjektet må lanseres før det publiseres (feilkoden
 * «launchRequired»), med en snarvei til lanseringen.
 */
export function useLaunchRequiredToast(): () => void {
  const tErrors = useTranslations("errors");
  const t = useTranslations("launch");
  const pathname = usePathname();
  const router = useRouter();
  return useCallback(() => {
    const href = launchHrefFromPath(pathname);
    toast.error(tErrors("launchRequired"), href ? { action: { label: t("goToLaunch"), onClick: () => router.push(href) } } : undefined);
  }, [pathname, router, t, tErrors]);
}
