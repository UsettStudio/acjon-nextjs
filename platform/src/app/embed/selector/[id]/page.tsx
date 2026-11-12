import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PublicSelector } from "@/features/selector/components/public/public-selector";
import { SelectorSkeleton } from "@/features/selector/components/public/selector-skeleton";
import { getPublishedSelector } from "@/features/selector/public-queries";

export async function generateMetadata({ params }: PageProps<"/embed/selector/[id]">): Promise<Metadata> {
  const { id } = await params;
  const [data, t] = await Promise.all([getPublishedSelector(id), getTranslations("publicSelector")]);
  return data ? { title: t("pageTitle", { project: data.project.name }) } : {};
}

async function PublishedSelector({ params }: { params: PageProps<"/embed/selector/[id]">["params"] }) {
  const { id } = await params;
  const data = await getPublishedSelector(id);
  if (!data) {
    notFound();
  }
  return <PublicSelector data={data} options={{ interest: true }} />;
}

/** Publisert boligvelger. Data hentes ved hver visning, så status alltid er fersk; sanntid tar endringene etterpå. */
export default function PublishedSelectorPage({ params }: PageProps<"/embed/selector/[id]">) {
  return (
    <Suspense fallback={<SelectorSkeleton />}>
      <PublishedSelector params={params} />
    </Suspense>
  );
}
