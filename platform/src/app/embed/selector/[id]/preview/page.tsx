import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PublicSelector } from "@/features/selector/components/public/public-selector";
import { SelectorSkeleton } from "@/features/selector/components/public/selector-skeleton";
import { getSelectorPreview } from "@/features/selector/public-queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("publicSelector");
  return { title: t("previewTitle") };
}

async function SelectorPreview({ params }: { params: PageProps<"/embed/selector/[id]/preview">["params"] }) {
  const { id } = await params;
  // Bare innloggede med tilgang til prosjektet får utkastet. Andre får 404.
  const data = await getSelectorPreview(id);
  if (!data) {
    notFound();
  }
  return <PublicSelector data={data} preview />;
}

export default function SelectorPreviewPage({ params }: PageProps<"/embed/selector/[id]/preview">) {
  return (
    <Suspense fallback={<SelectorSkeleton />}>
      <SelectorPreview params={params} />
    </Suspense>
  );
}
