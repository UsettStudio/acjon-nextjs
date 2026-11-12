"use client";

import { CheckIcon, CopyIcon, ExternalLinkIcon, HistoryIcon, LinkIcon, LoaderCircleIcon, MoreHorizontalIcon, UploadCloudIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLaunchRequiredToast } from "@/features/launch/use-launch-toast";
import {
  createPreviewLink,
  listPageVersions,
  publishSite,
  restorePageVersion,
  unpublishSite,
  type PageVersion,
  type RestoredPage,
  type SitePublishState,
} from "@/features/site-builder/actions";

function ShareDialog({ open, onOpenChange, organizationId, siteId }: { open: boolean; onOpenChange: (open: boolean) => void; organizationId: string; siteId: string }) {
  const t = useTranslations("siteBuilder.editor.share");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const format = useFormatter();
  const [link, setLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    void createPreviewLink(organizationId, siteId).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok) {
        setLink(result.data);
      } else {
        setFailed(true);
        toast.error(tErrors(result.error as "unknown"));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, organizationId, siteId, tErrors]);

  async function copy() {
    if (!link) {
      return;
    }
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success(t("copied"));
    } catch {
      toast.message(link.url);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setLink(null);
          setFailed(false);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {link ? (
          <div className="grid gap-2">
            <div className="flex gap-2">
              <Input readOnly value={link.url} aria-label={t("link")} onFocus={(event) => event.currentTarget.select()} />
              <Button type="button" onClick={() => void copy()}>
                <CopyIcon aria-hidden="true" />
                {tCommon("copy")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("expires", { time: format.dateTime(new Date(link.expiresAt), { dateStyle: "long", timeStyle: "short" }) })}
            </p>
          </div>
        ) : failed ? null : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
            {t("creating")}
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Publiserte versjoner av siden som redigeres. Gjenoppretting erstatter utkastet for siden. */
function VersionsDialog({
  open,
  onOpenChange,
  organizationId,
  pageId,
  pageTitle,
  flush,
  onRestored,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  pageId: string;
  pageTitle: string;
  flush: () => Promise<boolean>;
  onRestored: (page: RestoredPage) => void;
}) {
  const t = useTranslations("siteBuilder.editor.versions");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const format = useFormatter();
  const [versions, setVersions] = useState<PageVersion[] | null>(null);
  const [confirm, setConfirm] = useState<PageVersion | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    void listPageVersions(organizationId, pageId).then((result) => {
      if (cancelled) {
        return;
      }
      if (result.ok) {
        setVersions(result.data);
      } else {
        setVersions([]);
        toast.error(tErrors(result.error as "unknown"));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, organizationId, pageId, tErrors]);

  function restore(version: PageVersion) {
    startTransition(async () => {
      // Lagre først, så en endring som venter ikke overskriver den gjenopprettede versjonen etterpå.
      await flush();
      const result = await restorePageVersion(organizationId, version.id);
      if (result.ok) {
        onRestored(result.data);
        toast.success(t("restored", { version: version.version }));
        setConfirm(null);
        onOpenChange(false);
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setVersions(null);
          }
          onOpenChange(next);
        }}
      >
        <DialogContent closeLabel={tCommon("close")} className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("title", { title: pageTitle })}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          {versions === null ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
              {tCommon("loading")}
            </p>
          ) : versions.length === 0 ? (
            <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <ol className="grid gap-2">
              {versions.map((version, index) => (
                <li key={version.id} className="flex items-center gap-3 rounded-md border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {t("version", { version: version.version })}
                      {index === 0 ? (
                        <Badge variant="secondary" className="ml-2">
                          {t("current")}
                        </Badge>
                      ) : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format.dateTime(new Date(version.createdAt), { dateStyle: "medium", timeStyle: "short" })}
                      {version.createdBy ? ` · ${version.createdBy}` : ""}
                      {` · ${t("blocks", { count: version.blockCount })}`}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfirm(version)}>
                    {t("restore")}
                  </Button>
                </li>
              ))}
            </ol>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirm !== null} onOpenChange={(next) => (next ? undefined : setConfirm(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmTitle", { version: confirm?.version ?? 0 })}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                if (confirm) {
                  restore(confirm);
                }
              }}
            >
              {t("restore")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Status, publisering, delt forhåndsvisning og versjoner. */
export function SitePublishBar({
  organizationId,
  siteId,
  siteUrl,
  publish,
  canEdit,
  currentPage,
  flush,
  onPublishState,
  onRestored,
}: {
  organizationId: string;
  siteId: string;
  siteUrl: string;
  publish: SitePublishState;
  canEdit: boolean;
  currentPage: { id: string; title: string };
  /** Lagrer det som ikke er lagret. false hvis noe ikke kunne lagres. */
  flush: () => Promise<boolean>;
  onPublishState: (state: SitePublishState) => void;
  onRestored: (page: RestoredPage) => void;
}) {
  const t = useTranslations("siteBuilder.editor.publish");
  const tErrors = useTranslations("errors");
  const tSite = useTranslations("siteBuilder.errors");
  const format = useFormatter();
  const [pending, startTransition] = useTransition();
  const [shareOpen, setShareOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const launchRequired = useLaunchRequiredToast();
  const published = publish.publishedAt !== null;

  function doPublish() {
    startTransition(async () => {
      if (!(await flush())) {
        toast.error(t("saveFirst"));
        return;
      }
      const result = await publishSite(organizationId, siteId);
      if (result.ok) {
        onPublishState(result.data);
        toast.success(t("published"), {
          action: { label: t("open"), onClick: () => window.open(siteUrl, "_blank", "noopener") },
        });
      } else if (result.error === "launchRequired") {
        launchRequired();
      } else {
        toast.error(result.error === "needsHome" ? tSite("needsHome") : tErrors(result.error as "unknown"));
      }
    });
  }

  function doUnpublish() {
    startTransition(async () => {
      const result = await unpublishSite(organizationId, siteId);
      if (result.ok) {
        onPublishState(result.data);
        toast.success(t("unpublished"));
        setConfirmUnpublish(false);
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground" aria-live="polite" data-testid="site-publish-state">
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
      {canEdit ? (
        <Button type="button" size="sm" onClick={doPublish} disabled={pending || (published && !publish.hasUnpublishedChanges)}>
          {pending ? (
            <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
          ) : published && !publish.hasUnpublishedChanges ? (
            <CheckIcon aria-hidden="true" />
          ) : (
            <UploadCloudIcon aria-hidden="true" />
          )}
          {published ? (publish.hasUnpublishedChanges ? t("publishChanges") : t("isPublished")) : t("publish")}
        </Button>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" className="size-8" aria-label={t("more")}>
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!published} asChild={published}>
            {published ? (
              <a href={siteUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon aria-hidden="true" />
                {t("open")}
              </a>
            ) : (
              <>
                <ExternalLinkIcon aria-hidden="true" />
                {t("open")}
              </>
            )}
          </DropdownMenuItem>
          {canEdit ? (
            <>
              <DropdownMenuItem
                onSelect={() => {
                  void flush().then(() => setShareOpen(true));
                }}
              >
                <LinkIcon aria-hidden="true" />
                {t("share")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setVersionsOpen(true)}>
                <HistoryIcon aria-hidden="true" />
                {t("versions")}
              </DropdownMenuItem>
            </>
          ) : null}
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

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} organizationId={organizationId} siteId={siteId} />
      <VersionsDialog
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
        organizationId={organizationId}
        pageId={currentPage.id}
        pageTitle={currentPage.title}
        flush={flush}
        onRestored={onRestored}
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
