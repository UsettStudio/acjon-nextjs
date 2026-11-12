/**
 * Mediebiblioteket: filtyper, størrelser og stier i Storage.
 *
 *   {organization_id}/{asset_id}/original.{ext}   originalen, slik den ble lastet opp
 *   {organization_id}/{asset_id}/w{bredde}.webp   WebP-varianter laget med sharp
 *
 * Bucketen er offentlig for lesing, så bildene kan leveres fra CDN på publiserte sider.
 */

import { publicEnv } from "@/lib/env";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const DOCUMENT_TYPES = ["application/pdf"] as const;
export const ASSET_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES] as const;
export type AssetMime = (typeof ASSET_TYPES)[number];

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;

/** Bredder for WebP-variantene. */
export const VARIANT_WIDTHS = [800, 1600, 2400] as const;

export const EXTENSIONS: Record<AssetMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export function isAssetMime(value: unknown): value is AssetMime {
  return typeof value === "string" && (ASSET_TYPES as readonly string[]).includes(value);
}

export function isImageMime(value: string): boolean {
  return (IMAGE_TYPES as readonly string[]).includes(value);
}

export function maxBytesFor(mime: AssetMime): number {
  return isImageMime(mime) ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
}

/** Filtypen kan mangle i nettleseren (f.eks. noen Windows-oppsett). Da brukes filendelsen. */
export function mimeFromFile(file: { name: string; type: string }): AssetMime | null {
  if (isAssetMime(file.type)) {
    return file.type;
  }
  const extension = file.name.toLowerCase().split(".").pop();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    default:
      return null;
  }
}

export function originalPath(organizationId: string, assetId: string, mime: AssetMime): string {
  return `${organizationId}/${assetId}/original.${EXTENSIONS[mime]}`;
}

export function variantPath(organizationId: string, assetId: string, width: number): string {
  return `${organizationId}/${assetId}/w${width}.webp`;
}

/**
 * Bredder som skal lages for et bilde: de faste breddene som er mindre enn
 * originalen, pluss originalbredden (høyst 2400). Bilder forstørres aldri.
 */
export function variantWidthsFor(originalWidth: number): number[] {
  const largest = Math.min(originalWidth, VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1] ?? originalWidth);
  const widths = VARIANT_WIDTHS.filter((width) => width < largest);
  return [...widths, largest];
}

export type AssetVariant = { width: number; height: number; path: string; bytes: number };

/** Offentlig adresse til en fil i bucketen «media». */
export function publicMediaUrl(path: string): string {
  return `${publicEnv().supabaseUrl}/storage/v1/object/public/media/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Minste variant som er minst så bred som ønsket, ellers den største. */
export function pickVariant(variants: AssetVariant[], minWidth: number): AssetVariant | null {
  const sorted = [...variants].sort((a, b) => a.width - b.width);
  return sorted.find((variant) => variant.width >= minWidth) ?? sorted[sorted.length - 1] ?? null;
}

export function parseVariants(value: unknown): AssetVariant[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      typeof item.path === "string" &&
      typeof item.width === "number" &&
      typeof item.height === "number"
    ) {
      return [{ path: item.path, width: item.width, height: item.height, bytes: typeof item.bytes === "number" ? item.bytes : 0 }];
    }
    return [];
  });
}
