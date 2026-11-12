"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { CopyButton } from "@/components/admin/copy-button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanFeatureNotice } from "@/features/billing/components/plan-feature-notice";
import { iframeSnippet, webComponentSnippet, type EmbedListOption } from "@/features/selector/embed-code";
import type { Plan } from "@/lib/billing/plans";

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="relative">
      <pre className="max-h-64 overflow-auto rounded-md border bg-muted p-3 pr-12 text-xs whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton value={code} label={label} />
      </div>
    </div>
  );
}

/**
 * Kode for å bygge velgeren inn på et annet nettsted: web-komponenten
 * (anbefalt) eller en iframe for nettsteder som ikke tillater skript.
 */
export function EmbedDialog({
  open,
  onOpenChange,
  selectorId,
  projectName,
  embed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectorId: string;
  projectName: string;
  /** Om pakken har innbygging og det offentlige lese-API-et (Pro og Partner). */
  embed: { allowed: boolean; plan: Plan; billingHref: string | null };
}) {
  const t = useTranslations("selector.embed");
  const tCommon = useTranslations("common");
  const id = useId();
  const [showFilters, setShowFilters] = useState(true);
  const [list, setList] = useState<EmbedListOption>("default");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const title = t("frameTitle", { project: projectName });
  const options = { showFilters, list };
  const apiUrl = origin ? new URL(`/api/public/v1/selectors/${selectorId}`, origin).toString() : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {embed.allowed ? null : <PlanFeatureNotice kind="embed" plan={embed.plan} billingHref={embed.billingHref} />}
        <div className="grid gap-5" hidden={!embed.allowed}>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Label className="flex items-center gap-2 font-normal">
              <input type="checkbox" className="size-4" checked={showFilters} onChange={(event) => setShowFilters(event.target.checked)} />
              {t("showFilters")}
            </Label>
            <div className="flex items-center gap-2">
              <Label htmlFor={`${id}-list`} className="font-normal">
                {t("list")}
              </Label>
              <select
                id={`${id}-list`}
                className="h-8 rounded-md border bg-background px-2 text-sm"
                value={list}
                onChange={(event) => setList(event.target.value as EmbedListOption)}
              >
                <option value="default">{t("listDefault")}</option>
                <option value="show">{t("listShow")}</option>
                <option value="hide">{t("listHide")}</option>
              </select>
            </div>
          </div>
          {origin ? (
            <Tabs defaultValue="component">
              <TabsList>
                <TabsTrigger value="component">{t("componentTab")}</TabsTrigger>
                <TabsTrigger value="iframe">{t("iframeTab")}</TabsTrigger>
                <TabsTrigger value="api">{t("apiTab")}</TabsTrigger>
              </TabsList>
              <TabsContent value="component" className="grid gap-2">
                <p className="text-sm text-muted-foreground">{t("componentHelp")}</p>
                <CodeBlock code={webComponentSnippet(origin, selectorId, options, title)} label={t("componentTab")} />
                <p className="text-xs text-muted-foreground">{t("eventsHelp")}</p>
              </TabsContent>
              <TabsContent value="iframe" className="grid gap-2">
                <p className="text-sm text-muted-foreground">{t("iframeHelp")}</p>
                <CodeBlock code={iframeSnippet(origin, selectorId, options, title)} label={t("iframeTab")} />
              </TabsContent>
              <TabsContent value="api" className="grid gap-2">
                <p className="text-sm text-muted-foreground">{t("apiHelp")}</p>
                <CodeBlock code={`GET ${apiUrl}`} label={t("apiTab")} />
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
