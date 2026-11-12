"use client";

import { CheckIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
import type { MediaAsset } from "@/features/media/assets";
import { listAssetsAction } from "@/features/media/actions";
import { AssetThumb, UploadProgress, UploadZone } from "@/features/media/components/upload-zone";
import { useUploader } from "@/features/media/components/use-uploader";
import { DOCUMENT_TYPES, IMAGE_TYPES } from "@/features/media/model";
import { cn } from "@/lib/utils";

/**
 * Velg filer fra mediebiblioteket, eller last opp nye. Filer som allerede er
 * valgt, vises som valgt og kan ikke legges til to ganger.
 */
export function AssetPicker({
  open,
  onOpenChange,
  organizationId,
  projectId,
  kind,
  title,
  alreadySelected,
  max,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  projectId: string | null;
  kind: "image" | "document";
  title: string;
  alreadySelected: string[];
  max: number;
  onPick: (assets: MediaAsset[]) => void;
}) {
  const t = useTranslations("media.picker");
  const tCommon = useTranslations("common");
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const uploader = useUploader({
    organizationId,
    projectId,
    onUploaded: (asset) => {
      setAssets((previous) => [asset, ...(previous ?? [])]);
      setPicked((previous) => (previous.includes(asset.id) ? previous : [...previous, asset.id]));
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    void listAssetsAction(organizationId, { kind, search: "" }).then((result) => {
      if (!cancelled) {
        setAssets(result.ok ? result.data : []);
        setFailed(!result.ok);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, organizationId, kind]);

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setPicked([]);
      setSearch("");
      uploader.clear();
    }
  }

  const room = Math.max(0, max - alreadySelected.length);
  const term = search.trim().toLocaleLowerCase("nb");
  const visible = (assets ?? []).filter(
    (asset) =>
      term === "" ||
      (asset.filename ?? "").toLocaleLowerCase("nb").includes(term) ||
      (asset.altText ?? "").toLocaleLowerCase("nb").includes(term),
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent closeLabel={tCommon("close")} className="max-h-[90svh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t("description", { room })}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <UploadZone
            compact
            accept={(kind === "image" ? IMAGE_TYPES : DOCUMENT_TYPES).join(",")}
            disabled={uploader.busy}
            onFiles={(files) => void uploader.upload(files)}
          />
          <UploadProgress items={uploader.items} />
        </div>
        <div className="relative">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label={t("search")}
            placeholder={t("search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        {assets === null ? (
          <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
        ) : failed ? (
          <p className="text-sm text-destructive">{t("failed")}</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={t("listLabel")}>
            {visible.map((asset) => {
              const already = alreadySelected.includes(asset.id);
              const isPicked = picked.includes(asset.id);
              const disabled = already || asset.status !== "ready" || (!isPicked && picked.length >= room);
              return (
                <li key={asset.id}>
                  <button
                    type="button"
                    aria-pressed={isPicked || already}
                    disabled={disabled}
                    onClick={() =>
                      setPicked((previous) =>
                        previous.includes(asset.id) ? previous.filter((id) => id !== asset.id) : [...previous, asset.id],
                      )
                    }
                    className={cn(
                      "relative grid w-full gap-1 rounded-lg p-1 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                      (isPicked || already) && "ring-2 ring-primary",
                    )}
                  >
                    <span className="block aspect-[4/3] overflow-hidden rounded-md border bg-muted">
                      <AssetThumb asset={asset} />
                    </span>
                    <span className="truncate text-xs">{asset.filename}</span>
                    {isPicked || already ? (
                      <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon aria-hidden="true" className="size-4" />
                      </span>
                    ) : null}
                    {already ? <span className="sr-only">{t("alreadyAdded")}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            disabled={picked.length === 0}
            onClick={() => {
              const byId = new Map((assets ?? []).map((asset) => [asset.id, asset]));
              onPick(picked.flatMap((id) => (byId.get(id) ? [byId.get(id) as MediaAsset] : [])));
              close(false);
            }}
          >
            {t("add", { count: picked.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
