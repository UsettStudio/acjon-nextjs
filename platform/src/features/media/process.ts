import "server-only";

import sharp from "sharp";

import { isImageMime, variantWidthsFor, type AssetMime } from "@/features/media/model";

export type ProcessedImage = {
  width: number;
  height: number;
  variants: { width: number; height: number; data: Buffer }[];
};

const FORMAT_FOR_MIME: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

export class InvalidFileError extends Error {}

/** Sjekker at innholdet faktisk er den filtypen som ble oppgitt. */
export async function verifyContent(data: Buffer, mime: AssetMime): Promise<void> {
  if (mime === "application/pdf") {
    if (data.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new InvalidFileError("Filen er ikke en PDF");
    }
    return;
  }
  const metadata = await sharp(data, { failOn: "error" })
    .metadata()
    .catch(() => {
      throw new InvalidFileError("Bildet kan ikke leses");
    });
  if (metadata.format !== FORMAT_FOR_MIME[mime]) {
    throw new InvalidFileError(`Bildet er ${metadata.format}, ikke ${mime}`);
  }
}

/**
 * Lager WebP-varianter (800, 1600 og 2400 piksler brede, aldri større enn
 * originalen). Bildet roteres etter EXIF, og metadata som GPS-posisjon tas
 * ikke med i variantene. Originalens mål lagres fra bildet etter rotasjon.
 */
export async function processImage(data: Buffer, mime: AssetMime): Promise<ProcessedImage> {
  if (!isImageMime(mime)) {
    throw new InvalidFileError("Bare bilder får varianter");
  }
  const metadata = await sharp(data, { failOn: "error" }).metadata();
  // EXIF-retning 5–8 betyr at bildet er rotert 90 grader: bredde og høyde bytter plass.
  const rotated = (metadata.orientation ?? 1) >= 5;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) {
    throw new InvalidFileError("Bildet mangler mål");
  }

  const variants = [];
  for (const target of variantWidthsFor(width)) {
    const { data: output, info } = await sharp(data, { failOn: "error" })
      .rotate()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    variants.push({ width: info.width, height: info.height, data: output });
  }
  return { width, height, variants };
}
