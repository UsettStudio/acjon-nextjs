import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PublicSelector } from "@/features/selector/components/public/public-selector";
import { SelectorSkeleton } from "@/features/selector/components/public/selector-skeleton";
import { embedOptionsFromQuery } from "@/features/selector/embed-code";
import { getPublishedSelector } from "@/features/selector/public-queries";

type Props = PageProps<"/embed/selector/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [data, t] = await Promise.all([getPublishedSelector(id), getTranslations("publicSelector")]);
  return data ? { title: t("pageTitle", { project: data.project.name }) } : {};
}

async function PublishedSelector({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await getPublishedSelector(id);
  if (!data) {
    notFound();
  }
  return <PublicSelector data={data} options={{ interest: true, ...embedOptionsFromQuery(query) }} />;
}

/**
 * Publisert boligvelger, også når den er bygd inn på andre nettsteder
 * (web-komponenten eller iframe). Data hentes ved hver visning, så status
 * alltid er fersk; sanntid tar endringene etterpå.
 */
export default function PublishedSelectorPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<SelectorSkeleton />}>
      <PublishedSelector params={params} searchParams={searchParams} />
    </Suspense>
  );
}
