/**
 * Geometri for markeringer. Alle punkter lagres som andeler (0–1) av bildets
 * bredde og høyde, så de ligger riktig uansett hvor stort bildet vises.
 * Beregninger der avstand betyr noe (treff på kanter, flytting med piltaster),
 * gjøres i bildepiksler, fordi bildet sjelden er kvadratisk.
 */

export type Point = readonly [number, number];
export type Box = { left: number; top: number; width: number; height: number };
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

const PRECISION = 1e6;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Avrunder til seks desimaler, så lagrede markeringer blir korte og stabile. */
export function roundPoint([x, y]: Point): Point {
  return [Math.round(x * PRECISION) / PRECISION, Math.round(y * PRECISION) / PRECISION];
}

/**
 * Skjermkoordinater (for eksempel fra en musehendelse) til andel av bildet.
 * `box` er bildets plassering på skjermen (getBoundingClientRect), etter zoom og panorering.
 */
export function clientToFraction(clientX: number, clientY: number, box: Box): Point {
  if (box.width <= 0 || box.height <= 0) {
    return [0, 0];
  }
  return roundPoint([clamp01((clientX - box.left) / box.width), clamp01((clientY - box.top) / box.height)]);
}

/** Andeler til piksler i bildet, for SVG med viewBox lik bildets størrelse. */
export function toPixels(points: readonly Point[], width: number, height: number): [number, number][] {
  return points.map(([x, y]) => [x * width, y * height]);
}

export function toSvgPoints(points: readonly Point[], width: number, height: number): string {
  return toPixels(points, width, height)
    .map(([x, y]) => `${Number(x.toFixed(2))},${Number(y.toFixed(2))}`)
    .join(" ");
}

/** Rektangel fra to hjørner i vilkårlig rekkefølge: øverst til venstre og nederst til høyre. */
export function normalizeRect(a: Point, b: Point): [Point, Point] {
  return [
    roundPoint([Math.min(a[0], b[0]), Math.min(a[1], b[1])]),
    roundPoint([Math.max(a[0], b[0]), Math.max(a[1], b[1])]),
  ];
}

/** De fire hjørnene i et rektangel, med klokken fra øverst til venstre. */
export function rectCorners([a, b]: readonly [Point, Point] | readonly Point[]): Point[] {
  const [x1, y1] = a ?? [0, 0];
  const [x2, y2] = b ?? [0, 0];
  return [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
}

export function boundsOf(points: readonly Point[]): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

/**
 * Flytter alle punktene like mye. Flyttingen begrenses slik at formen blir
 * liggende helt innenfor bildet, uten å endre fasong.
 */
export function translatePoints(points: readonly Point[], dx: number, dy: number): Point[] {
  const bounds = boundsOf(points);
  const safeDx = Math.min(Math.max(dx, -bounds.minX), 1 - bounds.maxX);
  const safeDy = Math.min(Math.max(dy, -bounds.minY), 1 - bounds.maxY);
  return points.map(([x, y]) => roundPoint([x + safeDx, y + safeDy]));
}

/**
 * Flytter flere former like mye. Flyttingen begrenses av formene samlet, så
 * de beholder plasseringen i forhold til hverandre og alle blir liggende i bildet.
 */
export function translateGroup(shapes: readonly (readonly Point[])[], dx: number, dy: number): Point[][] {
  const all = shapes.flat();
  if (all.length === 0) {
    return [];
  }
  const bounds = boundsOf(all);
  const safeDx = Math.min(Math.max(dx, -bounds.minX), 1 - bounds.maxX);
  const safeDy = Math.min(Math.max(dy, -bounds.minY), 1 - bounds.maxY);
  return shapes.map((points) => points.map(([x, y]) => roundPoint([x + safeDx, y + safeDy])));
}

/**
 * Endrer størrelse på et rektangel ved å dra ett av de fire hjørnene
 * (indeks som i rectCorners). Motsatt hjørne ligger i ro.
 */
export function resizeRect(rect: readonly Point[], corner: number, to: Point): [Point, Point] {
  const corners = rectCorners(rect);
  const opposite = corners[(corner + 2) % 4] ?? corners[0] ?? [0, 0];
  return normalizeRect(opposite, [clamp01(to[0]), clamp01(to[1])]);
}

/** Flytting med piltaster: ett bildepiksel, eller ti med Shift. */
export function nudge(points: readonly Point[], key: string, large: boolean, width: number, height: number): Point[] | null {
  const step = large ? 10 : 1;
  const delta: Record<string, [number, number]> = {
    ArrowLeft: [-step / width, 0],
    ArrowRight: [step / width, 0],
    ArrowUp: [0, -step / height],
    ArrowDown: [0, step / height],
  };
  const move = delta[key];
  return move ? translatePoints(points, move[0], move[1]) : null;
}

/** Kopi som er flyttet litt ned og til høyre, så den ikke ligger oppå originalen. */
export function duplicatePoints(points: readonly Point[], width: number, height: number, offsetPx = 12): Point[] {
  return translatePoints(points, offsetPx / width, offsetPx / height);
}

/** Avstand i piksler mellom to punkter oppgitt som andeler. */
export function pixelDistance(a: Point, b: Point, width: number, height: number): number {
  return Math.hypot((a[0] - b[0]) * width, (a[1] - b[1]) * height);
}

/** Nærmeste punkt på linjestykket a–b, regnet i piksler. */
export function projectOnSegment(
  p: Point,
  a: Point,
  b: Point,
  width: number,
  height: number,
): { point: Point; distance: number } {
  const ax = a[0] * width;
  const ay = a[1] * height;
  const bx = b[0] * width;
  const by = b[1] * height;
  const px = p[0] * width;
  const py = p[1] * height;
  const lengthSquared = (bx - ax) ** 2 + (by - ay) ** 2;
  const t = lengthSquared === 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / lengthSquared));
  const x = ax + t * (bx - ax);
  const y = ay + t * (by - ay);
  return { point: roundPoint([x / width, y / height]), distance: Math.hypot(px - x, py - y) };
}

/**
 * Kanten i polygonet som er nærmest punktet, innenfor `tolerance` piksler.
 * Svarer med indeksen et nytt punkt skal settes inn på, og punktet på kanten.
 */
export function nearestEdge(
  points: readonly Point[],
  p: Point,
  tolerance: number,
  width: number,
  height: number,
): { insertAt: number; point: Point } | null {
  let best: { insertAt: number; point: Point; distance: number } | null = null;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) {
      continue;
    }
    const projection = projectOnSegment(p, a, b, width, height);
    if (projection.distance <= tolerance && (!best || projection.distance < best.distance)) {
      best = { insertAt: i + 1, point: projection.point, distance: projection.distance };
    }
  }
  return best ? { insertAt: best.insertAt, point: best.point } : null;
}

export function insertPoint(points: readonly Point[], index: number, point: Point): Point[] {
  return [...points.slice(0, index), roundPoint(point), ...points.slice(index)];
}

/** Fjerner et punkt. Et polygon må ha minst tre punkter, så da svarer den null. */
export function removePoint(points: readonly Point[], index: number): Point[] | null {
  if (points.length <= 3 || index < 0 || index >= points.length) {
    return null;
  }
  return points.filter((_, i) => i !== index);
}

/** Areal i kvadratpiksler (skolisseformelen). */
export function polygonArea(points: readonly Point[], width: number, height: number): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (a && b) {
      sum += a[0] * width * (b[1] * height) - b[0] * width * (a[1] * height);
    }
  }
  return Math.abs(sum) / 2;
}

/** Tyngdepunktet til et polygon, brukt til etiketter og verktøytips. */
export function centroid(points: readonly Point[]): Point {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) {
      continue;
    }
    const cross = a[0] * b[1] - b[0] * a[1];
    area += cross;
    cx += (a[0] + b[0]) * cross;
    cy += (a[1] + b[1]) * cross;
  }
  if (Math.abs(area) < 1e-12) {
    const sum = points.reduce<[number, number]>((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return [sum[0] / Math.max(1, points.length), sum[1] / Math.max(1, points.length)];
  }
  return [cx / (3 * area), cy / (3 * area)];
}

/** Om punktet ligger inne i polygonet (strålemetoden). */
export function pointInPolygon([x, y]: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (!a || !b) {
      continue;
    }
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}

export type Viewport = { scale: number; x: number; y: number };

export const MIN_SCALE = 0.05;
export const MAX_SCALE = 8;

/** Skalering og plassering som viser hele bildet midt i rammen, med luft rundt. */
export function fitViewport(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  padding = 24,
): Viewport {
  const availableWidth = Math.max(1, containerWidth - padding * 2);
  const availableHeight = Math.max(1, containerHeight - padding * 2);
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.min(availableWidth / imageWidth, availableHeight / imageHeight)));
  return {
    scale,
    x: (containerWidth - imageWidth * scale) / 2,
    y: (containerHeight - imageHeight * scale) / 2,
  };
}

/** Zoom rundt et punkt i rammen (musepekeren eller midt mellom to fingre), så punktet blir liggende i ro. */
export function zoomAt(viewport: Viewport, factor: number, originX: number, originY: number): Viewport {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, viewport.scale * factor));
  const ratio = scale / viewport.scale;
  return {
    scale,
    x: originX - (originX - viewport.x) * ratio,
    y: originY - (originY - viewport.y) * ratio,
  };
}
