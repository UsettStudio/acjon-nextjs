import { ExternalLinkIcon, LayersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectContext } from "@/features/projects/queries";
import { CreateSelectorButton, DeleteSelectorButton } from "@/features/selector/components/selector-list-actions";
import { selectorPublicPath } from "@/features/selector/paths";
import { listSelectors } from "@/features/selector/queries";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/selectors">): Promise<Metadata> {
  const { org, project } = await params;
  const [context, t] = await Promise.all([getProjectContext(org, project), getTranslations("selector.list")]);
  return { title: t("pageTitle", { name: context.project.name }) };
}

export default async function SelectorsPage({ params }: PageProps<"/[org]/projects/[project]/selectors">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  const [selectors, t, format] = await Promise.all([
    listSelectors(context.project.id),
    getTranslations("selector.list"),
    getFormatter(),
  ]);
  const basePath = `/${org}/projects/${slug}/selectors`;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
        </div>
        {context.canEditContent ? (
          <CreateSelectorButton
            organizationId={context.organization.id}
            projectId={context.project.id}
            basePath={basePath}
            defaultName={selectors.length === 0 ? context.project.name : t("defaultName", { number: selectors.length + 1 })}
          />
        ) : null}
      </div>

      {selectors.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center">
          <LayersIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="max-w-md text-sm text-muted-foreground">{context.canEditContent ? t("emptyEditable") : t("empty")}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {selectors.map((selector) => (
            <li key={selector.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    <h3>
                      <Link href={`${basePath}/${selector.id}`} className="hover:underline">
                        {selector.name}
                      </Link>
                    </h3>
                  </CardTitle>
                  <CardDescription>{t("views", { count: selector.viewCount })}</CardDescription>
                </CardHeader>
                <CardContent>
                  {selector.publishedAt ? (
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-800 dark:text-emerald-300">
                      {t("publishedAt", {
                        time: format.dateTime(new Date(selector.publishedAt), { dateStyle: "medium", timeStyle: "short" }),
                      })}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{t("notPublished")}</Badge>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`${basePath}/${selector.id}`}>{context.canEditContent ? t("edit") : t("openStatus")}</Link>
                  </Button>
                  {selector.publishedAt ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={selectorPublicPath(selector.id)} target="_blank" rel="noreferrer">
                        {t("openPublished")}
                        <ExternalLinkIcon aria-hidden="true" />
                      </a>
                    </Button>
                  ) : null}
                  {context.canEditContent ? (
                    <DeleteSelectorButton organizationId={context.organization.id} selectorId={selector.id} name={selector.name} />
                  ) : null}
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
