"use client";

/* eslint-disable @next/next/no-img-element -- Bildene er ferdige WebP-varianter fra Storage. Next sin bildeoptimalisering trengs ikke. */

import { CircleAlertIcon, CircleCheckIcon, FileTextIcon, LoaderCircleIcon, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";

import type { MediaAsset } from "@/features/media/assets";
import type { UploadItem } from "@/features/media/components/use-uploader";
import { cn } from "@/lib/utils";

/** Slipp filer her eller velg med knappen. Tastatur: feltet er en vanlig filknapp. */
export function UploadZone({
  onFiles,
  accept,
  disabled,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations("media.upload");
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label
        htmlFor={`${id}-input`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) {
            onFiles(Array.from(event.dataTransfer.files));
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors hover:bg-accent/50 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
          compact ? "px-4 py-5" : "px-6 py-10",
          dragging && "border-primary bg-accent",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <UploadIcon aria-hidden="true" className="size-6 text-muted-foreground" />
        <span className="font-medium">{t("choose")}</span>
        <span className="text-sm text-muted-foreground">{t("help")}</span>
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            onFiles(Array.from(event.target.files ?? []));
            if (inputRef.current) {
              inputRef.current.value = "";
            }
          }}
        />
      </label>
    </div>
  );
}

export function UploadProgress({ items }: { items: UploadItem[] }) {
  const t = useTranslations("media.upload");
  if (items.length === 0) {
    return null;
  }
  return (
    <ul className="grid gap-1 text-sm" aria-live="polite">
      {items.map((item) => (
        <li key={item.key} className="flex items-start gap-2">
          {item.status === "done" ? (
            <CircleCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : item.status === "error" ? (
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
          ) : (
            <LoaderCircleIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin" />
          )}
          <span className="min-w-0">
            <span className="break-all">{item.name}</span>
            <span className={cn("block", item.status === "error" ? "text-destructive" : "text-muted-foreground")}>
              {item.status === "error" ? item.error : t(`status.${item.status}`)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Miniatyr av en fil: bilde fra minste WebP-variant, ellers et ikon. */
export function AssetThumb({ asset, className }: { asset: MediaAsset; className?: string }) {
  const t = useTranslations("media");
  if (asset.isImage && asset.thumbnailUrl) {
    return (
      <img
        src={asset.thumbnailUrl}
        alt={asset.altText ?? ""}
        loading="lazy"
        decoding="async"
        width={asset.width ?? undefined}
        height={asset.height ?? undefined}
        className={cn("size-full object-cover", className)}
      />
    );
  }
  return (
    <div className={cn("flex size-full flex-col items-center justify-center gap-1 bg-muted p-2 text-muted-foreground", className)}>
      {asset.isImage ? (
        <LoaderCircleIcon aria-hidden="true" className={cn("size-6", asset.status === "pending" && "animate-spin")} />
      ) : (
        <FileTextIcon aria-hidden="true" className="size-6" />
      )}
      <span className="text-xs">{asset.isImage ? t(`status.${asset.status}`) : "PDF"}</span>
    </div>
  );
}
