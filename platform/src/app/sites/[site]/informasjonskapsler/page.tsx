import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { CookiesPageContent } from "@/features/site-builder/components/render/privacy-pages";
import { SiteShell } from "@/features/site-builder/components/render/site-shell";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { SiteSkeleton } from "@/features/site-builder/components/site-skeleton";
import { siteFontVariables } from "@/features/site-builder/fonts";
import { getPublishedRenderData, getPublishedSite } from "@/features/site-builder/render-data";
import { isLocale } from "@/i18n/config";
import { publicEnv } from "@/lib/env";

type Params = PageProps<"/sites/[site]/informasjonskapsler">["params"];

async function load(params: Params) {
  const { site: key } = await params;
  const site = await getPublishedSite(decodeURIComponent(key));
  return site ? getPublishedRenderData(site, null) : null;
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]/informasjonskapsler">): Promise<Metadata> {
  const data = await load(params);
  if (!data) {
    return { robots: { index: false } };
  }
  const locale = isLocale(data.organization.locale) ? data.organization.locale : "nb";
  const t = await getTranslations({ locale, namespace: "site.cookies" });
  return { title: `${t("title")} – ${data.project.name}`, robots: { index: false, follow: true } };
}

async function Content({ params }: { params: Params }) {
  const data = await load(params);
  if (!data) {
    notFound();
  }
  return (
    <SiteIntlProvider locale={data.organization.locale}>
      <SiteShell data={data} fontClassName={siteFontVariables}>
        <CookiesPageContent data={data} turnstile={Boolean(publicEnv().turnstileSiteKey)} />
      </SiteShell>
    </SiteIntlProvider>
  );
}

/** Oversikt over informasjonskapsler og lagring i nettleseren på prosjektsiden. */
export default function CookiesPage({ params }: PageProps<"/sites/[site]/informasjonskapsler">) {
  return (
    <Suspense fallback={<SiteSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}
