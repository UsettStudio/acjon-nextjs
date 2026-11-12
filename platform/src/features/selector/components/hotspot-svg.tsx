/**
 * Felles tegning av markeringer for editoren og den publiserte velgeren.
 * SVG-en har viewBox lik bildets størrelse i piksler. Kantlinjer har
 * vector-effect="non-scaling-stroke", så de er 2 px uansett zoom.
 */

import { rectCorners, toSvgPoints, type Point } from "@/features/selector/geometry";
import { publicMediaUrl } from "@/features/media/model";

export function shapePoints(shape: "polygon" | "rect", points: readonly Point[]): readonly Point[] {
  return shape === "rect" ? rectCorners(points) : points;
}

export function svgPoints(shape: "polygon" | "rect", points: readonly Point[], width: number, height: number): string {
  return toSvgPoints(shapePoints(shape, points), width, height);
}

/**
 * Skravur for solgte enheter. `spacing` er avstanden mellom strekene i
 * bildepiksler. Regn den ut fra visningsstørrelsen, så strekene blir like tette på alle skjermer.
 */
export function HatchPattern({ id, spacing }: { id: string; spacing: number }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={spacing} height={spacing} patternTransform="rotate(45)">
      <line x1={0} y1={0} x2={0} y2={spacing} stroke="#ffffff" strokeOpacity={0.75} strokeWidth={spacing / 3} />
    </pattern>
  );
}

type ImageVariant = { width: number; url?: string; path?: string };

/** srcSet fra WebP-variantene, så mobil laster et lite bilde og store skjermer et skarpt. */
export function imageSources(asset: { url?: string; path?: string; variants: readonly ImageVariant[] }): {
  src: string;
  srcSet: string | undefined;
} {
  const urlOf = (item: { url?: string; path?: string }) => item.url ?? (item.path ? publicMediaUrl(item.path) : "");
  const variants = [...asset.variants].filter((variant) => urlOf(variant)).sort((a, b) => a.width - b.width);
  const largest = variants[variants.length - 1];
  return {
    src: largest ? urlOf(largest) : urlOf(asset),
    srcSet: variants.length > 0 ? variants.map((variant) => `${urlOf(variant)} ${variant.width}w`).join(", ") : undefined,
  };
}
