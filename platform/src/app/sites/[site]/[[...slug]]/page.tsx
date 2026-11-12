import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SitePageBlocks } from "@/features/site-builder/components/render/site-page";
import { SiteShell } from "@/features/site-builder/components/render/site-shell";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { siteFontVariables } from "@/features/site-builder/fonts";
import { PRERENDER_PLACEHOLDER } from "@/features/site-builder/site";
import { getPublishedPage, getPublishedRenderData, getPublishedSite } from "@/features/site-builder/render-data";
import { jsonLd, pageMetadata, pageStructuredData } from "@/features/site-builder/seo";

type Params = PageProps<"/sites/[site]/[[...slug]]">["params"];

/** Siden fra adressen: forsiden uten slug, ellers én side på ett nivå. */
async function loadPage(params: Params) {
  const { site: key, slug } = await params;
  if (slug && slug.length > 1) {
    return null;
  }
  const site = await getPublishedSite(decodeURIComponent(key));
  if (!site) {
    return null;
  }
  const page = await getPublishedPage(site.id, slug?.[0] ?? null);
  if (!page) {
    return null;
  }
  return { site, data: await getPublishedRenderData(site, page) };
}

/** Se PRERENDER_PLACEHOLDER: siden blir statisk per prosjektside etter første besøk. */
export async function generateStaticParams(): Promise<Awaited<PageProps<"/sites/[site]/[[...slug]]">["params"]>[]> {
  return [{ site: PRERENDER_PLACEHOLDER, slug: [PRERENDER_PLACEHOLDER] }];
}

export async function generateMetadata({ params }: PageProps<"/sites/[site]/[[...slug]]">): Promise<Metadata> {
  const loaded = await loadPage(params);
  return loaded ? pageMetadata(loaded.data) : { robots: { index: false } };
}

async function SitePageContent({ params }: { params: Params }) {
  const loaded = await loadPage(params);
  if (!loaded) {
    notFound();
  }
  const { data } = loaded;
  return (
    <SiteIntlProvider locale={data.organization.locale}>
      <SiteShell data={data} fontClassName={siteFontVariables}>
        <SitePageBlocks data={data} blocks={data.page?.blocks ?? []} />
      </SiteShell>
      {pageStructuredData(data).map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(item) }} />
      ))}
    </SiteIntlProvider>
  );
}

/**
 * Publisert prosjektside. Siden lages som en ferdig statisk side per prosjektside og mellomlagres. Første
 * besøk venter på den, senere besøk får den rett fra mellomlageret, med alt innhold
 * i HTML-en. Mellomlageret tømmes ved publisering og statusendring (cache-tagger).
 */
export const ensureStatic = "navigation";

export default function PublishedSitePage({ params }: PageProps<"/sites/[site]/[[...slug]]">) {
  return <SitePageContent params={params} />;
}
