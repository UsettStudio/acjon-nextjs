import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { SitePreviewFrame } from "@/features/site-builder/components/preview-frame";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { SiteSkeleton } from "@/features/site-builder/components/site-skeleton";
import { siteFontVariables } from "@/features/site-builder/fonts";
import { loadDraftSite } from "@/features/site-builder/render-data";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("siteBuilder.preview");
  return { title: t("pageTitle") };
}

async function FrameContent({ params }: { params: PageProps<"/site-preview/[siteId]">["params"] }) {
  const { siteId } = await params;
  // Utkastet leses med brukerens egne rettigheter (RLS). Uten tilgang finnes ikke siden.
  const draft = /^[0-9a-f-]{36}$/.test(siteId) ? await loadDraftSite(await createClient(), siteId) : null;
  if (!draft) {
    notFound();
  }
  return (
    <SiteIntlProvider locale={draft.organization.locale}>
      <SitePreviewFrame draft={draft} fontClassName={siteFontVariables} />
    </SiteIntlProvider>
  );
}

/** Forhåndsvisningen i editoren (iframe). Krever innlogging. */
export default function SitePreviewFramePage({ params }: PageProps<"/site-preview/[siteId]">) {
  return (
    <Suspense fallback={<SiteSkeleton />}>
      <FrameContent params={params} />
    </Suspense>
  );
}
