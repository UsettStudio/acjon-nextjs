import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PublicUnitPage } from "@/features/selector/components/public/unit-page";
import { SiteShell } from "@/features/site-builder/components/render/site-shell";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { siteFontVariables } from "@/features/site-builder/fonts";
import { PRERENDER_PLACEHOLDER } from "@/features/site-builder/site";
import { getPublishedRenderData, getPublishedSite, getPublishedUnit } from "@/features/site-builder/render-data";
import { jsonLd, unitMetadata, unitStructuredData } from "@/features/site-builder/seo";
import { isLocale } from "@/i18n/config";

type Params = PageProps<"/sites/[site]/bolig/[slug]">["params"];

async function loadUnit(params: Params) {
  const { site: key, slug } = await params;
  const site = await getPublishedSite(decodeURIComponent(key));
  if (!site) {
    return null;
  }
  const unit = await getPublishedUnit(site.project.id, decodeURIComponent(slug));
  if (!unit) {
    return null;
  }
  const data = await getPublishedRenderData(site, null);
  return { site, unit, data };
}

/** Se PRERENDER_PLACEHOLDER: siden blir statisk per prosjektside etter første besøk. */
export async function generateStaticParams(): Promise<Awaited<PageProps<"/sites/[site]/bolig/[slug]">["params"]>[]> {
  return [{ site: PRERENDER_PLACEHOLDER, slug: PRERENDER_PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]/bolig/[slug]">): Promise<Metadata> {
  const loaded = await loadUnit(params);
  if (!loaded) {
    return { robots: { index: false } };
  }
  const locale = isLocale(loaded.data.organization.locale) ? loaded.data.organization.locale : "nb";
  const tStatus = await getTranslations({ locale, namespace: "unitStatus" });
  return unitMetadata(loaded.data, loaded.unit, tStatus(loaded.unit.status));
}

async function UnitContent({ params }: { params: Params }) {
  const loaded = await loadUnit(params);
  if (!loaded) {
    notFound();
  }
  const { data, unit } = loaded;
  const locale = isLocale(data.organization.locale) ? data.organization.locale : "nb";
  const t = await getTranslations({ locale, namespace: "site.unit" });
  return (
    <SiteIntlProvider locale={locale}>
      <SiteShell data={data} fontClassName={siteFontVariables}>
        <PublicUnitPage
          projectId={data.project.id}
          unit={unit}
          back={{ href: "/", label: t("back", { project: data.project.name }) }}
          interest={{ pageId: null, source: "unit_page" }}
        />
      </SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(unitStructuredData(data, unit)) }} />
    </SiteIntlProvider>
  );
}

/**
 * Enhetssiden på prosjektsiden: /bolig/{slug}. Status oppdateres i sanntid.
 * Siden lages som en ferdig statisk side per prosjektside og mellomlagres. Første
 * besøk venter på den, senere besøk får den rett fra mellomlageret, med alt innhold
 * i HTML-en. Mellomlageret tømmes ved publisering og statusendring (cache-tagger).
 */
export const ensureStatic = "navigation";

export default function SiteUnitPage({ params }: PageProps<"/sites/[site]/bolig/[slug]">) {
  return <UnitContent params={params} />;
}
