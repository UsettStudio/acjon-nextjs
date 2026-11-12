"use client";

import { CheckIcon, ExternalLinkIcon, EyeIcon, MonitorIcon, MoreHorizontalIcon, SmartphoneIcon, UploadCloudIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { publishSelector, unpublishSelector, updateSelectorSettings, type PublishState } from "@/features/selector/actions";
import { useLaunchRequiredToast } from "@/features/launch/use-launch-toast";
import { EmbedDialog } from "@/features/selector/components/editor/embed-dialog";
import { FILTER_KEYS, type SelectorSettings } from "@/features/selector/model";
import { selectorPreviewPath, selectorPublicPath } from "@/features/selector/paths";
import type { Plan } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

function PreviewDialog({ open, onOpenChange, selectorId }: { open: boolean; onOpenChange: (open: boolean) => void; selectorId: string }) {
  const t = useTranslations("selector.preview");
  const tCommon = useTranslations("common");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")} className="flex h-[92svh] max-w-[calc(100%-1rem)] flex-col gap-3 sm:max-w-[min(96rem,calc(100%-2rem))]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div role="radiogroup" aria-label={t("device")} className="flex gap-1 self-start rounded-md bg-muted p-1">
          {(["desktop", "mobile"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={device === option}
              onClick={() => setDevice(option)}
              className={cn(
                "flex items-center gap-1.5 rounded px-3 py-1 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                device === option && "bg-background text-foreground shadow-sm",
              )}
            >
              {option === "desktop" ? <MonitorIcon className="size-4" aria-hidden="true" /> : <SmartphoneIcon className="size-4" aria-hidden="true" />}
              {t(option)}
            </button>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 justify-center overflow-auto rounded-md border bg-muted/50 p-2">
          {open ? (
            <iframe
              key={device}
              title={t("frameTitle")}
              src={selectorPreviewPath(selectorId)}
              className={cn("h-full rounded border bg-background", device === "mobile" ? "w-[390px] shrink-0" : "w-full")}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
  organizationId,
  selectorId,
  settings,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  selectorId: string;
  settings: SelectorSettings;
  onSaved: (settings: SelectorSettings) => void;
}) {
  const t = useTranslations("selector.settings");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [draft, setDraft] = useState(settings);
  const [pending, startTransition] = useTransition();

  function toggleFilter(key: (typeof FILTER_KEYS)[number], on: boolean) {
    setDraft((current) => ({
      ...current,
      filters: on ? FILTER_KEYS.filter((item) => item === key || current.filters.includes(item)) : current.filters.filter((item) => item !== key),
    }));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDraft(settings);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const result = await updateSelectorSettings(organizationId, selectorId, draft);
              if (result.ok) {
                onSaved(result.data);
                toast.success(tCommon("saved"));
                onOpenChange(false);
              } else {
                toast.error(tErrors(result.error as "unknown"));
              }
            });
          }}
        >
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">{t("filters")}</legend>
            {FILTER_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={draft.filters.includes(key)}
                  onChange={(event) => toggleFilter(key, event.target.checked)}
                />
                {t(`filterNames.${key}`)}
              </label>
            ))}
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">{t("list")}</legend>
            {(["side", "below", "hidden"] as const).map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="list"
                  className="size-4"
                  checked={draft.list === option}
                  onChange={() => setDraft((current) => ({ ...current, list: option }))}
                />
                {t(`listOptions.${option}`)}
              </label>
            ))}
          </fieldset>
          <div className="grid gap-1">
            <Label className="flex items-center gap-2 font-normal">
              <input
                type="checkbox"
                className="size-4"
                checked={draft.hatch_sold}
                onChange={(event) => setDraft((current) => ({ ...current, hatch_sold: event.target.checked }))}
              />
              {t("hatchSold")}
            </Label>
            <p className="pl-6 text-xs text-muted-foreground">{t("hatchSoldHelp")}</p>
          </div>
          <p className="text-xs text-muted-foreground">{t("colorsHelp")}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PublishBar({
  organizationId,
  selectorId,
  publish,
  settings,
  canEdit,
  flush,
  onPublishState,
  onSettings,
  projectName,
  embed,
}: {
  organizationId: string;
  selectorId: string;
  projectName: string;
  /** Innbygging i pakken (se EmbedDialog). */
  embed: { allowed: boolean; plan: Plan; billingHref: string | null };
  publish: PublishState;
  settings: SelectorSettings;
  canEdit: boolean;
  /** Lagrer det som ikke er lagret. false hvis lagringen feilet. */
  flush: () => Promise<boolean>;
  onPublishState: (state: PublishState) => void;
  onSettings: (settings: SelectorSettings) => void;
}) {
  const t = useTranslations("selector.publish");
  const tErrors = useTranslations("errors");
  const tSelectorErrors = useTranslations("selector.errors");
  const format = useFormatter();
  const [pending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const launchRequired = useLaunchRequiredToast();
  const published = publish.publishedAt !== null;

  function errorText(code: string) {
    return code === "needsView" || code === "invalidTarget" || code === "viewCycle" || code === "imageNotReady"
      ? tSelectorErrors(code)
      : tErrors(code as "unknown");
  }

  function doPublish() {
    startTransition(async () => {
      if (!(await flush())) {
        toast.error(t("saveFirst"));
        return;
      }
      const result = await publishSelector(organizationId, selectorId);
      if (result.ok) {
        onPublishState(result.data);
        toast.success(t("published"));
      } else if (result.error === "launchRequired") {
        launchRequired();
      } else {
        toast.error(errorText(result.error));
      }
    });
  }

  function doUnpublish() {
    startTransition(async () => {
      const result = await unpublishSelector(organizationId, selectorId);
      if (result.ok) {
        onPublishState(result.data);
        toast.success(t("unpublished"));
        setConfirmUnpublish(false);
      } else {
        toast.error(errorText(result.error));
      }
    });
  }

  async function copyLink() {
    const url = new URL(selectorPublicPath(selectorId), window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("linkCopied"));
    } catch {
      toast.message(url);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {published ? (
          publish.hasUnpublishedChanges ? (
            <Badge variant="outline" className="border-amber-500/60 text-amber-800 dark:text-amber-300">
              {t("unpublishedChanges")}
            </Badge>
          ) : (
            t("publishedAt", { time: format.dateTime(new Date(publish.publishedAt ?? ""), { dateStyle: "medium", timeStyle: "short" }) })
          )
        ) : (
          <Badge variant="secondary">{t("notPublished")}</Badge>
        )}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          void flush().then(() => setPreviewOpen(true));
        }}
      >
        <EyeIcon aria-hidden="true" />
        {t("preview")}
      </Button>
      {canEdit ? (
        <Button type="button" size="sm" onClick={doPublish} disabled={pending || (published && !publish.hasUnpublishedChanges)}>
          {published && !publish.hasUnpublishedChanges ? <CheckIcon aria-hidden="true" /> : <UploadCloudIcon aria-hidden="true" />}
          {published ? (publish.hasUnpublishedChanges ? t("publishChanges") : t("isPublished")) : t("publish")}
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("more")}>
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit ? <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>{t("settings")}</DropdownMenuItem> : null}
          <DropdownMenuItem disabled={!published} onSelect={() => void copyLink()}>
            {t("copyLink")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!published} onSelect={() => setEmbedOpen(true)}>
            {t("embed")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!published} asChild={published}>
            {published ? (
              <a href={selectorPublicPath(selectorId)} target="_blank" rel="noreferrer">
                {t("open")}
                <ExternalLinkIcon className="ml-auto size-3.5" aria-hidden="true" />
              </a>
            ) : (
              t("open")
            )}
          </DropdownMenuItem>
          {canEdit && published ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setConfirmUnpublish(true)}>
                {t("unpublish")}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} selectorId={selectorId} />
      <EmbedDialog open={embedOpen} onOpenChange={setEmbedOpen} selectorId={selectorId} projectName={projectName} embed={embed} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        organizationId={organizationId}
        selectorId={selectorId}
        settings={settings}
        onSaved={onSettings}
      />
      <AlertDialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("unpublishTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("unpublishDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                doUnpublish();
              }}
            >
              {t("unpublish")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
