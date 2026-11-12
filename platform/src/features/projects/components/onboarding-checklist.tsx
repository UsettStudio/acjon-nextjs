import { CheckCircle2Icon, CircleIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OnboardingStep } from "@/features/projects/overview";
import { cn } from "@/lib/utils";

/** Fremdriften fra oppstartsveiviseren som sjekkliste, med lenke til neste steg. */
export async function OnboardingChecklist({ steps, className }: { steps: OnboardingStep[]; className?: string }) {
  const t = await getTranslations("projects.onboarding");
  const done = steps.filter((step) => step.done).length;
  const next = steps.find((step) => !step.done && step.href);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          <h2>{t("title")}</h2>
        </CardTitle>
        <CardDescription>{t("progress", { done, total: steps.length })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.key} className="flex items-start gap-3">
              {step.done ? (
                <CheckCircle2Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <CircleIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <div className="grid gap-0.5">
                <span className={cn("font-medium", step.done && "text-muted-foreground")}>
                  <span className="sr-only">{t("stepNumber", { number: index + 1 })} </span>
                  {step.href && !step.done ? (
                    <Link href={step.href} className="underline-offset-4 hover:underline">
                      {t(`steps.${step.key}`)}
                    </Link>
                  ) : (
                    t(`steps.${step.key}`)
                  )}
                  <span className="sr-only"> {step.done ? t("done") : t("todo")}</span>
                </span>
                {step.note ? (
                  <span className="text-sm text-muted-foreground">
                    {step.note.kind === "units"
                      ? t("notes.units", { count: step.note.count })
                      : step.note.kind === "marked"
                        ? t("notes.marked", { marked: step.note.marked, total: step.note.total })
                        : t("notes.selectorUnpublished")}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        {next?.href ? (
          <div>
            <Button asChild>
              <Link href={next.href}>
                {next.note?.kind === "selectorUnpublished" ? t("actions.publishSelector") : t(`actions.${next.key}`)}
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
