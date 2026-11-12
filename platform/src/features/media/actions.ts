"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { ASSET_COLUMNS, listAssets, toMediaAsset, type MediaAsset } from "@/features/media/assets";
import {
  isAssetMime,
  isImageMime,
  maxBytesFor,
  originalPath,
  variantPath,
  type AssetMime,
} from "@/features/media/model";
import { InvalidFileError, processImage, verifyContent } from "@/features/media/process";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { ActionError, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { createClient } from "@/lib/supabase/server";

type MediaError = "fileType" | "fileTooLarge" | "invalidFile" | "processingFailed";

const uuid = z.uuid();

function requireId(value: string | null | undefined): string {
  if (!value || !uuid.safeParse(value).success) {
    throw new ActionError("invalidInput");
  }
  return value;
}

const startSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  mime: z.string(),
  bytes: z.number().int().positive(),
  projectId: z.union([z.uuid(), z.null()]),
  folder: z.string().trim().max(200),
});

/**
 * Steg 1 av opplasting: lager raden i mediebiblioteket og svarer med stien
 * nettleseren skal laste opp til. Filen går rett til Storage, ikke via serveren,
 * så Vercels grense på 4,5 MB per forespørsel gjelder ikke.
 */
export async function startUpload(
  organizationId: string,
  input: z.input<typeof startSchema>,
): Promise<ActionResult<{ assetId: string; path: string }, MediaError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = startSchema.safeParse(input);
    if (!parsed.success) {
      return fail("invalidInput");
    }
    const { filename, mime, bytes, projectId, folder } = parsed.data;
    if (!isAssetMime(mime)) {
      return fail("fileType");
    }
    if (bytes > maxBytesFor(mime)) {
      return fail("fileTooLarge");
    }
    const assetId = crypto.randomUUID();
    const path = originalPath(organizationId, assetId, mime);
    const supabase = await createClient();
    const { error } = await supabase.from("assets").insert({
      id: assetId,
      organization_id: organizationId,
      project_id: projectId,
      storage_path: path,
      mime,
      bytes,
      filename,
      folder,
      processing_status: "pending",
    });
    if (error) {
      if (postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      throw error;
    }
    return ok({ assetId, path });
  });
}

/**
 * Steg 2: kontrollerer filen som ble lastet opp og lager WebP-varianter.
 * Er innholdet ikke det filtypen sier, slettes filen og raden.
 */
export async function finishUpload(
  organizationId: string,
  assetId: string,
): Promise<ActionResult<MediaAsset, MediaError>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const supabase = await createClient();
    const { data: asset, error } = await supabase
      .from("assets")
      .select("id, organization_id, storage_path, mime, bytes")
      .eq("id", requireId(assetId))
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!asset || !isAssetMime(asset.mime)) {
      return fail("notFound");
    }
    const mime: AssetMime = asset.mime;
    const storage = supabase.storage.from("media");

    const { data: blob, error: downloadError } = await storage.download(asset.storage_path);
    if (downloadError || !blob) {
      await supabase.from("assets").update({ processing_status: "failed" }).eq("id", assetId);
      return fail("processingFailed");
    }
    const data = Buffer.from(await blob.arrayBuffer());

    try {
      // Størrelsen ble kontrollert mot grensen for filtypen da raden ble laget. Filen
      // som faktisk ble lastet opp, må ha samme størrelse.
      if (data.byteLength !== asset.bytes) {
        throw new InvalidFileError("Filen har en annen størrelse enn oppgitt");
      }
      await verifyContent(data, mime);
    } catch (verifyError) {
      if (verifyError instanceof InvalidFileError) {
        await storage.remove([asset.storage_path]);
        await supabase.from("assets").delete().eq("id", assetId);
        return fail("invalidFile");
      }
      throw verifyError;
    }

    const update: {
      processing_status: "ready" | "failed";
      width?: number;
      height?: number;
      variants?: { width: number; height: number; path: string; bytes: number }[];
    } = { processing_status: "ready" };

    if (isImageMime(mime)) {
      try {
        const processed = await processImage(data, mime);
        const variants = [];
        for (const variant of processed.variants) {
          const path = variantPath(organizationId, assetId, variant.width);
          const { error: uploadError } = await storage.upload(path, variant.data, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: true,
          });
          if (uploadError) {
            throw uploadError;
          }
          variants.push({ width: variant.width, height: variant.height, path, bytes: variant.data.byteLength });
        }
        update.width = processed.width;
        update.height = processed.height;
        update.variants = variants;
      } catch (processError) {
        console.error(processError);
        await supabase.from("assets").update({ processing_status: "failed" }).eq("id", assetId);
        return fail("processingFailed");
      }
    }

    const { data: saved, error: updateError } = await supabase
      .from("assets")
      .update(update)
      .eq("id", assetId)
      .select(ASSET_COLUMNS)
      .single();
    if (updateError) {
      throw updateError;
    }
    return ok(toMediaAsset(saved));
  });
}

const updateSchema = z.object({
  alt_text: z
    .string()
    .trim()
    .max(500, { error: "textTooLong" })
    .transform((value) => value || null),
  folder: z.string().trim().max(200, { error: "textTooLong" }),
  filename: z.string().trim().min(1, { error: "required" }).max(255, { error: "textTooLong" }),
});

export async function updateAsset(
  organizationId: string,
  assetId: string,
  input: z.input<typeof updateSchema>,
): Promise<ActionResult<MediaAsset>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .update(parsed.data)
      .eq("id", requireId(assetId))
      .eq("organization_id", organizationId)
      .select(ASSET_COLUMNS)
      .single();
    if (error) {
      if (postgresErrorCode(error) === "PGRST116" || postgresErrorCode(error) === "42501") {
        return fail("forbidden");
      }
      throw error;
    }
    return ok(toMediaAsset(data));
  });
}

/**
 * Sletter filer fra biblioteket. Raden slettes først (RLS avgjør om brukeren
 * kan), deretter originalen og variantene i Storage. Enheter som brukte filen,
 * mister den automatisk (trigger i databasen).
 */
export async function deleteAssets(organizationId: string, assetIds: string[]): Promise<ActionResult<{ deleted: number }>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit");
    const ids = z.array(z.uuid()).min(1).max(500).safeParse(assetIds);
    if (!ids.success) {
      return fail("invalidInput");
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .delete()
      .in("id", ids.data)
      .eq("organization_id", organizationId)
      .select("storage_path, variants");
    if (error) {
      throw error;
    }
    if (data.length < ids.data.length) {
      // Noen rader var ikke brukerens egne opplastinger. De som kunne slettes, er slettet.
      if (data.length === 0) {
        return fail("forbidden");
      }
    }
    const paths = data.flatMap((row) => [
      row.storage_path,
      ...(Array.isArray(row.variants)
        ? row.variants.flatMap((variant) =>
            typeof variant === "object" && variant !== null && "path" in variant && typeof variant.path === "string"
              ? [variant.path]
              : [],
          )
        : []),
    ]);
    if (paths.length > 0) {
      const { error: removeError } = await supabase.storage.from("media").remove(paths);
      if (removeError) {
        console.error("Filene er fjernet fra biblioteket, men ikke fra lagringen", removeError);
      }
    }
    refresh();
    return ok({ deleted: data.length });
  });
}

/** Henter filer fra biblioteket til filvelgeren. */
export async function listAssetsAction(
  organizationId: string,
  filter: { kind: "image" | "document" | "all"; search: string },
): Promise<ActionResult<MediaAsset[]>> {
  return runAction(async () => {
    await requireOrgCapability(requireId(organizationId), "content.edit", { allowReadOnly: true });
    return ok(await listAssets(organizationId, filter));
  });
}
