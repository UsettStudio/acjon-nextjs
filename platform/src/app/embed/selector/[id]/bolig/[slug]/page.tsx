import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { PublicUnitPage } from "@/features/selector/components/public/unit-page";
import { getSelectorUnit } from "@/features/selector/public-queries";

export async function generateMetadata({ params }: PageProps<"/embed/selector/[id]/bolig/[slug]">): Promise<Metadata> {
  const { id, slug } = await params;
  const [result, t] = await Promise.all([getSelectorUnit(id, decodeURIComponent(slug)), getTranslations("publicSelector.unitPage")]);
  return result ? { title: t("pageTitle", { unit: result.unit.unit_number, project: result.unit.project.name }) } : {};
}

async function UnitDetails({ params }: { params: PageProps<"/embed/selector/[id]/bolig/[slug]">["params"] }) {
  const { id, slug } = await params;
  const result = await getSelectorUnit(id, decodeURIComponent(slug));
  if (!result) {
    notFound();
  }
  return <PublicUnitPage selectorId={id} projectId={result.projectId} unit={result.unit} />;
}

/** Enhetssiden i den publiserte velgeren. Viser bare publiserte data, aldri interne felt. */
export default function SelectorUnitPage({ params }: PageProps<"/embed/selector/[id]/bolig/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid w-full max-w-6xl gap-4 p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-72" />
          <Skeleton className="aspect-[3/2] w-full" />
        </div>
      }
    >
      <UnitDetails params={params} />
    </Suspense>
  );
}
