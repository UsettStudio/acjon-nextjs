import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { SitePageBlocks } from "@/features/site-builder/components/render/site-page";
import { SiteShell } from "@/features/site-builder/components/render/site-shell";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { SiteSkeleton } from "@/features/site-builder/components/site-skeleton";
import { draftRenderData } from "@/features/site-builder/draft";
import { siteFontVariables } from "@/features/site-builder/fonts";
import { readPreviewToken } from "@/features/site-builder/preview-token";
import { loadDraftSite } from "@/features/site-builder/render-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { connection } from "next/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("siteBuilder.preview");
  return { title: t("pageTitle"), robots: { index: false, follow: false } };
}

async function PreviewContent({ params }: { params: PageProps<"/preview/[token]/[[...slug]]">["params"] }) {
  await connection();
  const { token, slug } = await params;
  // Lenken er signert med en hemmelig nøkkel og har utløpsdato. Først da leses utkastet med service-rollen.
  const preview = readPreviewToken(decodeURIComponent(token));
  if (!preview || (slug && slug.length > 1)) {
    notFound();
  }
  const draft = await loadDraftSite(createAdminClient(), preview.siteId);
  if (!draft) {
    notFound();
  }
  const page = slug?.[0] ? draft.draftPages.find((item) => item.slug === slug[0]) : draft.draftPages.find((item) => item.isHome);
  if (!page) {
    notFound();
  }
  const basePath = `/preview/${encodeURIComponent(decodeURIComponent(token))}`;
  const data = draftRenderData(draft, page.id, "preview", basePath);
  const [t, format] = await Promise.all([getTranslations("siteBuilder.preview"), getFormatter()]);
  return (
    <>
      <p className="sticky top-0 z-50 bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
        {t("banner", { expires: format.dateTime(preview.expiresAt, { dateStyle: "medium", timeStyle: "short" }) })}
      </p>
      <SiteIntlProvider locale={data.organization.locale}>
        <SiteShell data={data} fontClassName={siteFontVariables}>
          <SitePageBlocks data={data} blocks={data.page?.blocks ?? []} />
        </SiteShell>
      </SiteIntlProvider>
    </>
  );
}

/** Delt forhåndsvisning av utkastet. Virker uten innlogging så lenge lenken er gyldig. */
export default function SharedPreviewPage({ params }: PageProps<"/preview/[token]/[[...slug]]">) {
  return (
    <Suspense fallback={<SiteSkeleton />}>
      <PreviewContent params={params} />
    </Suspense>
  );
}
