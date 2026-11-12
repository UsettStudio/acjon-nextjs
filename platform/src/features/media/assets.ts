import "server-only";

import { pickVariant, parseVariants, publicMediaUrl, type AssetVariant } from "@/features/media/model";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export const ASSET_COLUMNS =
  "id, project_id, storage_path, mime, width, height, bytes, alt_text, folder, filename, variants, processing_status, uploaded_by, created_at" as const;

type AssetRow = Pick<
  Database["public"]["Tables"]["assets"]["Row"],
  | "id"
  | "project_id"
  | "storage_path"
  | "mime"
  | "width"
  | "height"
  | "bytes"
  | "alt_text"
  | "folder"
  | "filename"
  | "variants"
  | "processing_status"
  | "uploaded_by"
  | "created_at"
>;

/** En fil i mediebiblioteket, med ferdige adresser for visning. */
export type MediaAsset = {
  id: string;
  projectId: string | null;
  mime: string;
  isImage: boolean;
  width: number | null;
  height: number | null;
  bytes: number;
  altText: string | null;
  folder: string;
  filename: string | null;
  status: "pending" | "ready" | "failed";
  uploadedBy: string | null;
  createdAt: string;
  /** Originalen. For PDF er det den som åpnes. */
  url: string;
  /** Minste variant (for rutenett og lister). Mangler for PDF og bilder som ikke er ferdige. */
  thumbnailUrl: string | null;
  variants: (AssetVariant & { url: string })[];
};

export function toMediaAsset(row: AssetRow): MediaAsset {
  const variants = parseVariants(row.variants);
  const thumbnail = pickVariant(variants, 400);
  return {
    id: row.id,
    projectId: row.project_id,
    mime: row.mime,
    isImage: row.mime.startsWith("image/"),
    width: row.width,
    height: row.height,
    bytes: row.bytes,
    altText: row.alt_text,
    folder: row.folder,
    filename: row.filename,
    status: row.processing_status === "pending" || row.processing_status === "failed" ? row.processing_status : "ready",
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    url: publicMediaUrl(row.storage_path),
    thumbnailUrl: thumbnail ? publicMediaUrl(thumbnail.path) : null,
    variants: variants.map((variant) => ({ ...variant, url: publicMediaUrl(variant.path) })),
  };
}

export async function listAssets(
  organizationId: string,
  filter: { kind?: "image" | "document" | "all"; search?: string; projectId?: string | null } = {},
): Promise<MediaAsset[]> {
  const supabase = await createClient();
  let query = supabase
    .from("assets")
    .select(ASSET_COLUMNS)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (filter.kind === "image") {
    query = query.like("mime", "image/%");
  } else if (filter.kind === "document") {
    query = query.eq("mime", "application/pdf");
  }
  if (filter.projectId) {
    query = query.eq("project_id", filter.projectId);
  }
  const search = filter.search?.trim();
  if (search) {
    query = query.or(`filename.ilike.%${search.replace(/[%_,()]/g, " ")}%,alt_text.ilike.%${search.replace(/[%_,()]/g, " ")}%`);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data.map(toMediaAsset);
}

/** Filene en enhet bruker, i samme rekkefølge som id-ene. */
export async function getAssetsByIds(organizationId: string, ids: string[]): Promise<MediaAsset[]> {
  if (ids.length === 0) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select(ASSET_COLUMNS)
    .eq("organization_id", organizationId)
    .in("id", ids);
  if (error) {
    throw error;
  }
  const byId = new Map(data.map((row) => [row.id, toMediaAsset(row)]));
  return ids.flatMap((id) => {
    const asset = byId.get(id);
    return asset ? [asset] : [];
  });
}
