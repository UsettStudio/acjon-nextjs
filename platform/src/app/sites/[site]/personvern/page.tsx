import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PrivacyPageContent } from "@/features/site-builder/components/render/privacy-pages";
import { SiteShell } from "@/features/site-builder/components/render/site-shell";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { SiteSkeleton } from "@/features/site-builder/components/site-skeleton";
import { siteFontVariables } from "@/features/site-builder/fonts";
import { getPublishedRenderData, getPublishedSite } from "@/features/site-builder/render-data";
import { isLocale } from "@/i18n/config";

type Params = PageProps<"/sites/[site]/personvern">["params"];

async function load(params: Params) {
  const { site: key } = await params;
  const site = await getPublishedSite(decodeURIComponent(key));
  return site ? getPublishedRenderData(site, null) : null;
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]/personvern">): Promise<Metadata> {
  const data = await load(params);
  if (!data) {
    return { robots: { index: false } };
  }
  const locale = isLocale(data.organization.locale) ? data.organization.locale : "nb";
  const t = await getTranslations({ locale, namespace: "site.privacy" });
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
        <PrivacyPageContent data={data} />
      </SiteShell>
    </SiteIntlProvider>
  );
}

/** Personvernerklæringen for prosjektsiden, laget fra innstillingene. */
export default function PrivacyPage({ params }: PageProps<"/sites/[site]/personvern">) {
  return (
    <Suspense fallback={<SiteSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}
