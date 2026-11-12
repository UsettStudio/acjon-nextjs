/**
 * Filer slik prosjektsiden bruker dem: med ferdige adresser til originalen og
 * WebP-variantene. Lages fra offentlige filer (stier i Storage) eller fra
 * mediebiblioteket i admin (adresser).
 */

import { publicMediaUrl } from "@/features/media/model";
import type { MediaAsset } from "@/features/media/assets";
import type { PublicAsset } from "@/features/selector/model";

export type SiteAsset = {
  id: string;
  url: string;
  mime: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  filename: string | null;
  variants: { width: number; url: string }[];
};

export function fromPublicAsset(asset: PublicAsset): SiteAsset {
  return {
    id: asset.id,
    url: publicMediaUrl(asset.path),
    mime: asset.mime,
    width: asset.width,
    height: asset.height,
    alt: asset.alt,
    filename: asset.filename,
    variants: asset.variants.map((variant) => ({ width: variant.width, url: publicMediaUrl(variant.path) })),
  };
}

export function fromMediaAsset(asset: MediaAsset): SiteAsset {
  return {
    id: asset.id,
    url: asset.url,
    mime: asset.mime,
    width: asset.width,
    height: asset.height,
    alt: asset.altText,
    filename: asset.filename,
    variants: asset.variants.map((variant) => ({ width: variant.width, url: variant.url })),
  };
}

/** src og srcSet for et bilde. Største variant som src, så eldre nettlesere får et skarpt bilde. */
export function siteImage(asset: SiteAsset): { src: string; srcSet: string | undefined } {
  const variants = [...asset.variants].sort((a, b) => a.width - b.width);
  const largest = variants[variants.length - 1];
  return {
    src: largest?.url ?? asset.url,
    srcSet: variants.length > 0 ? variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ") : undefined,
  };
}

/** Plassholder-bilde for delingsbilder (Open Graph): variant nær 1600 px. */
export function shareImageUrl(asset: SiteAsset): string {
  const sorted = [...asset.variants].sort((a, b) => Math.abs(a.width - 1600) - Math.abs(b.width - 1600));
  return sorted[0]?.url ?? asset.url;
}
