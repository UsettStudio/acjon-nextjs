"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import type { MediaAsset } from "@/features/media/assets";
import { finishUpload, startUpload } from "@/features/media/actions";
import { maxBytesFor, mimeFromFile } from "@/features/media/model";
import type { CommonActionError } from "@/lib/actions/result";
import { getBrowserClient } from "@/lib/supabase/client";

export type UploadItem = {
  key: string;
  name: string;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
};

/**
 * Laster opp filer rett fra nettleseren til Storage (med innlogget brukers
 * rettigheter), og ber deretter serveren kontrollere filen og lage WebP-varianter.
 */
export function useUploader({
  organizationId,
  projectId = null,
  folder = "",
  onUploaded,
}: {
  organizationId: string;
  projectId?: string | null;
  folder?: string;
  onUploaded?: (asset: MediaAsset) => void;
}) {
  const t = useTranslations("media.upload");
  const tErrors = useTranslations("errors");
  const [items, setItems] = useState<UploadItem[]>([]);

  const update = (key: string, patch: Partial<UploadItem>) =>
    setItems((previous) => previous.map((item) => (item.key === key ? { ...item, ...patch } : item)));

  const uploadOne = useCallback(
    async (file: File, key: string) => {
      const mime = mimeFromFile(file);
      if (!mime) {
        update(key, { status: "error", error: t("errors.fileType") });
        return;
      }
      if (file.size > maxBytesFor(mime)) {
        update(key, { status: "error", error: t("errors.fileTooLarge", { max: Math.round(maxBytesFor(mime) / 1024 / 1024) }) });
        return;
      }
      const started = await startUpload(organizationId, { filename: file.name, mime, bytes: file.size, projectId, folder });
      if (!started.ok) {
        const known = ["fileType", "fileTooLarge", "invalidFile", "processingFailed"];
        update(key, {
          status: "error",
          error: known.includes(started.error)
            ? t(`errors.${started.error as "fileType"}`, { max: Math.round(maxBytesFor(mime) / 1024 / 1024) })
            : tErrors(started.error as CommonActionError),
        });
        return;
      }
      const { error } = await getBrowserClient()
        .storage.from("media")
        .upload(started.data.path, file, { contentType: mime, cacheControl: "31536000", upsert: false });
      if (error) {
        update(key, { status: "error", error: t("errors.uploadFailed") });
        return;
      }
      update(key, { status: "processing" });
      const finished = await finishUpload(organizationId, started.data.assetId);
      if (!finished.ok) {
        const known = ["fileType", "fileTooLarge", "invalidFile", "processingFailed"];
        update(key, {
          status: "error",
          error: known.includes(finished.error)
            ? t(`errors.${finished.error as "invalidFile"}`, { max: 0 })
            : tErrors(finished.error as CommonActionError),
        });
        return;
      }
      update(key, { status: "done" });
      onUploaded?.(finished.data);
    },
    [organizationId, projectId, folder, onUploaded, t, tErrors],
  );

  const upload = useCallback(
    async (files: File[]) => {
      const queue = files.map((file) => ({ file, key: `${file.name}-${file.size}-${crypto.randomUUID()}` }));
      setItems((previous) => [
        ...previous.filter((item) => item.status !== "done"),
        ...queue.map(({ file, key }) => ({ key, name: file.name, status: "uploading" as const })),
      ]);
      // To om gangen: raskt nok, uten å fylle opp nettleserens forbindelser.
      const workers = Array.from({ length: Math.min(2, queue.length) }, async () => {
        for (let next = queue.shift(); next; next = queue.shift()) {
          try {
            await uploadOne(next.file, next.key);
          } catch {
            update(next.key, { status: "error", error: t("errors.uploadFailed") });
          }
        }
      });
      await Promise.all(workers);
    },
    [uploadOne, t],
  );

  const clear = useCallback(() => setItems([]), []);

  return { items, upload, clear, busy: items.some((item) => item.status === "uploading" || item.status === "processing") };
}
