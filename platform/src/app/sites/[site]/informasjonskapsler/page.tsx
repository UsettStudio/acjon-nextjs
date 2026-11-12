import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CookiesPageContent } from "@/features/site-builder/components/render/privacy-pages";
import { SiteShell } from "@/features/site-builder/components/render/site-shell";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { siteFontVariables } from "@/features/site-builder/fonts";
import { PRERENDER_PLACEHOLDER } from "@/features/site-builder/site";
import { getPublishedRenderData, getPublishedSite } from "@/features/site-builder/render-data";
import { isLocale } from "@/i18n/config";
import { publicEnv } from "@/lib/env";

type Params = PageProps<"/sites/[site]/informasjonskapsler">["params"];

async function load(params: Params) {
  const { site: key } = await params;
  const site = await getPublishedSite(decodeURIComponent(key));
  return site ? getPublishedRenderData(site, null) : null;
}

/** Se PRERENDER_PLACEHOLDER: siden blir statisk per prosjektside etter første besøk. */
export async function generateStaticParams(): Promise<Awaited<PageProps<"/sites/[site]/informasjonskapsler">["params"]>[]> {
  return [{ site: PRERENDER_PLACEHOLDER }];
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

/**
 * Oversikt over informasjonskapsler og lagring i nettleseren på prosjektsiden.
 * Siden lages som en ferdig statisk side per prosjektside og mellomlagres. Første
 * besøk venter på den, senere besøk får den rett fra mellomlageret, med alt innhold
 * i HTML-en. Mellomlageret tømmes ved publisering og statusendring (cache-tagger).
 */
export const ensureStatic = "navigation";

export default function CookiesPage({ params }: PageProps<"/sites/[site]/informasjonskapsler">) {
  return <Content params={params} />;
}
