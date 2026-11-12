"use client";

/* eslint-disable @next/next/no-img-element -- Bildene er ferdige WebP-varianter fra Storage. Next sin bildeoptimalisering trengs ikke. */

import { CopyIcon, ExternalLinkIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MediaAsset } from "@/features/media/assets";
import { deleteAssets, updateAsset } from "@/features/media/actions";
import { AssetThumb, UploadProgress, UploadZone } from "@/features/media/components/upload-zone";
import { useUploader } from "@/features/media/components/use-uploader";
import { ASSET_TYPES } from "@/features/media/model";
import type { CommonActionError } from "@/lib/actions/result";
import { formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

type Kind = "all" | "image" | "document";

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${formatNumber(bytes / 1024 / 1024, "nb", 1)} MB`;
  }
  return `${formatNumber(Math.max(1, Math.round(bytes / 1024)))} kB`;
}

/** Organisasjonens mediebibliotek: opplasting, søk, alternativ tekst og sletting. */
export function MediaLibrary({
  organizationId,
  assets,
  canEdit,
  canDeleteAll,
  currentUserId,
}: {
  organizationId: string;
  assets: MediaAsset[];
  canEdit: boolean;
  canDeleteAll: boolean;
  currentUserId: string;
}) {
  const t = useTranslations("media");
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const uploader = useUploader({ organizationId, onUploaded: () => router.refresh() });

  const term = search.trim().toLocaleLowerCase("nb");
  const visible = assets.filter(
    (asset) =>
      (kind === "all" || (kind === "image" ? asset.isImage : !asset.isImage)) &&
      (term === "" ||
        (asset.filename ?? "").toLocaleLowerCase("nb").includes(term) ||
        (asset.altText ?? "").toLocaleLowerCase("nb").includes(term)),
  );

  return (
    <div className="grid gap-6">
      {canEdit ? (
        <div className="grid gap-3">
          <UploadZone accept={ASSET_TYPES.join(",")} onFiles={(files) => void uploader.upload(files)} />
          <UploadProgress items={uploader.items} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label={t("search")}
            placeholder={t("search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-64 pl-9"
          />
        </div>
        <div role="group" aria-label={t("filterLabel")} className="flex gap-1">
          {(["all", "image", "document"] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={kind === option ? "secondary" : "ghost"}
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
            >
              {t(`filter.${option}`)}
            </Button>
          ))}
        </div>
        <p className="ml-auto text-sm text-muted-foreground" aria-live="polite">
          {t("count", { count: visible.length })}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed px-6 py-12 text-center text-muted-foreground">
          {assets.length === 0 ? t("empty") : t("noMatches")}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                onClick={() => setSelected(asset)}
                className="group grid w-full gap-2 rounded-lg text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="block aspect-[4/3] overflow-hidden rounded-lg border bg-muted transition-shadow group-hover:shadow-md">
                  <AssetThumb asset={asset} />
                </span>
                <span className="grid text-sm">
                  <span className="truncate font-medium">{asset.filename ?? t("untitled")}</span>
                  <span className="text-xs text-muted-foreground">
                    {[asset.width && asset.height ? `${asset.width} × ${asset.height}` : null, formatBytes(asset.bytes)]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {asset.isImage && !asset.altText && asset.status === "ready" ? (
                    <span className="text-xs text-amber-700 dark:text-amber-400">{t("missingAlt")}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <AssetDetailsDialog
        organizationId={organizationId}
        asset={selected}
        canEdit={canEdit}
        canDelete={canEdit && (canDeleteAll || selected?.uploadedBy === currentUserId)}
        onClose={() => setSelected(null)}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}

function AssetDetailsDialog({
  organizationId,
  asset,
  canEdit,
  canDelete,
  onClose,
  onChanged,
}: {
  organizationId: string;
  asset: MediaAsset | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const t = useTranslations("media.details");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const id = useId();
  const [altText, setAltText] = useState("");
  const [filename, setFilename] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [previous, setPrevious] = useState(asset);
  if (previous !== asset) {
    setPrevious(asset);
    setAltText(asset?.altText ?? "");
    setFilename(asset?.filename ?? "");
    setConfirmDelete(false);
  }

  const largest = asset?.variants.length ? asset.variants[asset.variants.length - 1] : null;

  return (
    <Dialog open={asset !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-2xl">
        {asset ? (
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await updateAsset(organizationId, asset.id, { alt_text: altText, filename, folder: asset.folder });
                if (result.ok) {
                  toast.success(tCommon("saved"));
                  onChanged();
                  onClose();
                } else {
                  toast.error(tErrors(result.error as CommonActionError));
                }
              });
            }}
          >
            <DialogHeader>
              <DialogTitle className="break-all">{asset.filename ?? t("untitled")}</DialogTitle>
              <DialogDescription>
                {[
                  asset.width && asset.height ? `${asset.width} × ${asset.height} px` : null,
                  formatBytes(asset.bytes),
                  formatDateTime(asset.createdAt),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </DialogDescription>
            </DialogHeader>
            {asset.isImage && largest ? (
              <div className="overflow-hidden rounded-md border bg-muted">
                <img
                  src={asset.thumbnailUrl ?? asset.url}
                  srcSet={asset.variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ")}
                  sizes="(min-width: 640px) 640px, 100vw"
                  alt={asset.altText ?? ""}
                  className="max-h-80 w-full object-contain"
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor={`${id}-filename`}>{t("filename")}</Label>
              <Input id={`${id}-filename`} value={filename} disabled={!canEdit} onChange={(event) => setFilename(event.target.value)} />
            </div>
            {asset.isImage ? (
              <div className="grid gap-2">
                <Label htmlFor={`${id}-alt`}>{t("altText")}</Label>
                <Textarea
                  id={`${id}-alt`}
                  rows={2}
                  maxLength={500}
                  value={altText}
                  disabled={!canEdit}
                  onChange={(event) => setAltText(event.target.value)}
                  aria-describedby={`${id}-alt-help`}
                />
                <p id={`${id}-alt-help`} className="text-sm text-muted-foreground">
                  {t("altTextHelp")}
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={asset.url} target="_blank" rel="noreferrer">
                  <ExternalLinkIcon aria-hidden="true" />
                  {t("openOriginal")}
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(asset.url).then(() => toast.success(tCommon("copied")));
                }}
              >
                <CopyIcon aria-hidden="true" />
                {t("copyLink")}
              </Button>
            </div>
            <DialogFooter className={cn(canDelete && "sm:justify-between")}>
              {canDelete ? (
                confirmDelete ? (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await deleteAssets(organizationId, [asset.id]);
                        if (result.ok) {
                          toast.success(t("deleted"));
                          onChanged();
                          onClose();
                        } else {
                          toast.error(tErrors(result.error as CommonActionError));
                        }
                      })
                    }
                  >
                    <Trash2Icon aria-hidden="true" />
                    {t("confirmDelete")}
                  </Button>
                ) : (
                  <Button type="button" variant="outline" className="text-destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2Icon aria-hidden="true" />
                    {t("delete")}
                  </Button>
                )
              ) : (
                <span />
              )}
              {canEdit ? <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton> : null}
            </DialogFooter>
            {confirmDelete ? <p className="text-sm text-muted-foreground">{t("deleteHelp")}</p> : null}
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
