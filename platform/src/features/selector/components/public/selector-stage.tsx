"use client";

import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { HatchPattern, imageSources, shapePoints, svgPoints } from "@/features/selector/components/hotspot-svg";
import { useUnitFormat } from "@/features/selector/components/public/use-unit-format";
import { centroid, zoomAt, type Viewport } from "@/features/selector/geometry";
import { FILL_OPACITY, STROKE_WIDTH, type PublicHotspot, type PublicUnit, type PublicView } from "@/features/selector/model";
import type { UnitStatus } from "@/features/units/fields";
import { cn } from "@/lib/utils";

const NEUTRAL = "#ffffff";
const MAX_ZOOM = 4;

export type HotspotAction =
  | { type: "unit"; unit: PublicUnit }
  | { type: "view"; viewId: string }
  | { type: "external"; href: string; newTab: boolean };

type Tooltip = { hotspotId: string; x: number; y: number };

/** Holder bildet innenfor rammen når det er zoomet inn. */
function clampViewport(viewport: Viewport, width: number, height: number): Viewport {
  const scale = Math.min(MAX_ZOOM, Math.max(1, viewport.scale));
  return {
    scale,
    x: Math.min(0, Math.max(width - width * scale, viewport.x)),
    y: Math.min(0, Math.max(height - height * scale, viewport.y)),
  };
}

export function SelectorStage({
  view,
  unitsById,
  statusColors,
  hatchSold,
  matchingUnitIds,
  highlightedUnitId,
  hrefFor,
  viewSummary,
  onHoverUnit,
  onAction,
  maxHeight = "78svh",
  lazyImage = false,
}: {
  view: PublicView;
  unitsById: ReadonlyMap<string, PublicUnit>;
  statusColors: Record<UnitStatus, string>;
  hatchSold: boolean;
  /** Enheter som treffer filteret. null = ingen filter. */
  matchingUnitIds: ReadonlySet<string> | null;
  highlightedUnitId: string | null;
  /** Adressen markeringen lenker til, eller null hvis den ikke skal vises (for eksempel skjult enhet). */
  hrefFor: (hotspot: PublicHotspot) => { href: string; external: boolean } | null;
  /** Antall ledige enheter i en visning (til verktøytips på markeringer som lenker dit). */
  viewSummary: (viewId: string) => { name: string; available: number } | null;
  onHoverUnit: (unitId: string | null) => void;
  onAction: (action: HotspotAction) => void;
  maxHeight?: string;
  /** Last bildet først når det nærmer seg skjermen (velgeren står lenger ned på en prosjektside). */
  lazyImage?: boolean;
}) {
  const t = useTranslations("publicSelector.stage");
  const tStatus = useTranslations("unitStatus");
  const formatUnit = useUnitFormat();
  const hatchId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = view.image_width ?? view.asset?.width ?? 0;
  const height = view.image_height ?? view.asset?.height ?? 0;
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ kind: "pinch"; distance: number; midX: number; midY: number } | { kind: "pan"; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const updateViewport = useCallback((next: Viewport | ((current: Viewport) => Viewport)) => {
    const frame = frameRef.current;
    const value = typeof next === "function" ? next(viewportRef.current) : next;
    const clamped = frame ? clampViewport(value, frame.clientWidth, frame.clientHeight) : value;
    viewportRef.current = clamped;
    setViewport(clamped);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setFrameWidth(frame.clientWidth);
      updateViewport((current) => current);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [updateViewport]);

  // Knipezoom på styreflate (Ctrl + hjul). Vanlig scrolling i siden beholdes.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    function onWheel(event: WheelEvent) {
      if (!event.ctrlKey) {
        return;
      }
      event.preventDefault();
      const box = frame!.getBoundingClientRect();
      updateViewport((current) => zoomAt(current, Math.exp(-event.deltaY * 0.01), event.clientX - box.left, event.clientY - box.top));
    }
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [updateViewport]);

  if (!view.asset || width <= 0 || height <= 0) {
    return <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">{t("noImage")}</div>;
  }

  const sources = imageSources(view.asset);
  const zoomed = viewport.scale > 1.001;
  // Bildet vises i frameWidth piksler. Skravuren skal ha omtrent 8 px mellom strekene på skjermen.
  const displayScale = frameWidth > 0 ? (frameWidth * viewport.scale) / width : 1;

  function pointFor(hotspot: PublicHotspot, event?: { clientX: number; clientY: number }) {
    const frame = frameRef.current?.getBoundingClientRect();
    if (!frame) {
      return { x: 0, y: 0 };
    }
    if (event) {
      return { x: event.clientX - frame.left, y: event.clientY - frame.top };
    }
    const box = svgRef.current?.getBoundingClientRect();
    const [cx, cy] = centroid(shapePoints(hotspot.shape, hotspot.points));
    return box ? { x: box.left - frame.left + cx * box.width, y: box.top - frame.top + cy * box.height } : { x: 0, y: 0 };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (a && b) {
        const box = frame.getBoundingClientRect();
        gesture.current = {
          kind: "pinch",
          distance: Math.hypot(a.x - b.x, a.y - b.y),
          midX: (a.x + b.x) / 2 - box.left,
          midY: (a.y + b.y) / 2 - box.top,
        };
        frame.setPointerCapture(event.pointerId);
      }
      return;
    }
    if (zoomed) {
      gesture.current = { kind: "pan", x: event.clientX, y: event.clientY, moved: false };
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }
    const previousPoint = pointers.current.get(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const frame = frameRef.current;
    const current = gesture.current;
    if (!frame || !current) {
      return;
    }
    if (current.kind === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) {
        return;
      }
      const box = frame.getBoundingClientRect();
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2 - box.left;
      const midY = (a.y + b.y) / 2 - box.top;
      updateViewport((value) => {
        const next = zoomAt(value, distance / Math.max(1, current.distance), midX, midY);
        return { ...next, x: next.x + midX - current.midX, y: next.y + midY - current.midY };
      });
      gesture.current = { kind: "pinch", distance, midX, midY };
      suppressClick.current = true;
      return;
    }
    if (current.kind === "pan" && previousPoint) {
      const dx = event.clientX - previousPoint.x;
      const dy = event.clientY - previousPoint.y;
      if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) {
        return;
      }
      if (!current.moved) {
        frame.setPointerCapture(event.pointerId);
      }
      gesture.current = { ...current, moved: true };
      suppressClick.current = true;
      updateViewport((value) => ({ ...value, x: value.x + dx, y: value.y + dy }));
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      gesture.current = null;
      // Klikket som avslutter en panorering eller knipezoom skal ikke åpne en bolig.
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    } else if (pointers.current.size === 1 && gesture.current?.kind === "pinch") {
      const [remaining] = [...pointers.current.values()];
      gesture.current = remaining ? { kind: "pan", x: remaining.x, y: remaining.y, moved: true } : null;
    }
  }

  function zoomButton(factor: number) {
    const frame = frameRef.current;
    updateViewport((current) => zoomAt(current, factor, (frame?.clientWidth ?? 0) / 2, (frame?.clientHeight ?? 0) / 2));
  }

  const tooltipHotspot = tooltip ? view.hotspots.find((h) => h.id === tooltip.hotspotId) : undefined;

  return (
    <div className="grid gap-2">
      <div
        ref={frameRef}
        className={cn("relative mx-auto w-full overflow-hidden rounded-lg bg-muted select-none", zoomed ? "touch-none" : "touch-pan-y")}
        style={{ width: `min(100%, calc(${maxHeight} * ${width / height}))`, aspectRatio: `${width} / ${height}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(event) => {
          const box = frameRef.current?.getBoundingClientRect();
          if (!box) {
            return;
          }
          updateViewport((current) =>
            current.scale > 1.001 ? { scale: 1, x: 0, y: 0 } : zoomAt(current, 2, event.clientX - box.left, event.clientY - box.top),
          );
        }}
        data-testid="selector-stage"
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ferdige WebP-varianter fra Storage med srcSet */}
          <img
            src={sources.src}
            srcSet={sources.srcSet}
            sizes={`min(100vw, calc(${maxHeight} * ${(width / height).toFixed(4)}))`}
            alt={view.asset.alt ?? view.name}
            draggable={false}
            loading={lazyImage ? "lazy" : undefined}
            className="absolute inset-0 size-full"
            data-testid="selector-image"
          />
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="absolute inset-0 size-full"
            role="group"
            aria-label={t("shapesLabel", { view: view.name })}
          >
            <defs>
              <HatchPattern id={hatchId} spacing={8 / displayScale} />
            </defs>
            {view.hotspots.map((hotspot) => {
              const link = hrefFor(hotspot);
              if (!link) {
                return null;
              }
              const unit = hotspot.target_type === "unit" && hotspot.target_unit_id ? unitsById.get(hotspot.target_unit_id) : undefined;
              const color = unit ? statusColors[unit.status] : NEUTRAL;
              const dimmed = matchingUnitIds !== null && unit !== undefined && !matchingUnitIds.has(unit.id);
              const active = (unit && unit.id === highlightedUnitId) || tooltip?.hotspotId === hotspot.id;
              const points = svgPoints(hotspot.shape, hotspot.points, width, height);
              const label = unit
                ? t("unitLabel", {
                    unit: unit.unit_number,
                    status: tStatus(unit.status),
                    details: [unit.rooms !== null ? t("rooms", { rooms: unit.rooms }) : null, unit.bra_i !== null ? formatUnit.area(unit.bra_i) : null, formatUnit.price(unit)]
                      .filter(Boolean)
                      .join(", "),
                  })
                : (hotspot.label ?? (hotspot.target_type === "view" && hotspot.target_view_id ? viewSummary(hotspot.target_view_id)?.name : null) ?? t("link"));

              const show = (event?: { clientX: number; clientY: number }) => {
                setTooltip({ hotspotId: hotspot.id, ...pointFor(hotspot, event) });
                onHoverUnit(unit?.id ?? null);
              };
              const hide = () => {
                setTooltip((current) => (current?.hotspotId === hotspot.id ? null : current));
                onHoverUnit(null);
              };

              return (
                <a
                  key={hotspot.id}
                  href={link.href}
                  target={link.external ? (hotspot.target_type === "url" ? "_blank" : "_top") : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  data-unit-number={unit?.unit_number}
                  data-status={unit?.status}
                  className="cursor-pointer outline-none [&:focus-visible>polygon:first-child]:stroke-[4px]"
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") {
                      show(event);
                    }
                  }}
                  onPointerMove={(event) => {
                    if (event.pointerType === "mouse") {
                      show(event);
                    }
                  }}
                  onPointerLeave={hide}
                  onFocus={() => show()}
                  onBlur={hide}
                  onClick={(event) => {
                    if (suppressClick.current) {
                      event.preventDefault();
                      return;
                    }
                    if (unit) {
                      event.preventDefault();
                      onAction({ type: "unit", unit });
                    } else if (hotspot.target_type === "view" && hotspot.target_view_id) {
                      event.preventDefault();
                      onAction({ type: "view", viewId: hotspot.target_view_id });
                    }
                  }}
                >
                  <polygon
                    points={points}
                    style={{
                      fill: color,
                      fillOpacity: dimmed ? 0.08 : unit ? (active ? Math.min(0.75, FILL_OPACITY + 0.2) : FILL_OPACITY) : active ? 0.4 : 0.2,
                      stroke: color,
                      strokeOpacity: dimmed ? 0.35 : 1,
                      strokeWidth: active ? STROKE_WIDTH + 1 : STROKE_WIDTH,
                      strokeLinejoin: "round",
                    }}
                    vectorEffect="non-scaling-stroke"
                  />
                  {unit && hatchSold && unit.status === "sold" && !dimmed ? (
                    <polygon points={points} fill={`url(#${hatchId})`} pointerEvents="none" />
                  ) : null}
                </a>
              );
            })}
          </svg>
        </div>

        {tooltip && tooltipHotspot ? (
          <StageTooltip
            hotspot={tooltipHotspot}
            unitsById={unitsById}
            statusColors={statusColors}
            viewSummary={viewSummary}
            x={tooltip.x}
            y={tooltip.y}
            frameWidth={frameWidth}
          />
        ) : null}

        <div
          className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-background/90 p-0.5 shadow-sm"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("zoomOut")} disabled={!zoomed} onClick={() => zoomButton(0.75)}>
            <MinusIcon aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("zoomIn")} disabled={viewport.scale >= MAX_ZOOM} onClick={() => zoomButton(1.5)}>
            <PlusIcon aria-hidden="true" />
          </Button>
          {zoomed ? (
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("zoomReset")} onClick={() => updateViewport({ scale: 1, x: 0, y: 0 })}>
              <RotateCcwIcon aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StageTooltip({
  hotspot,
  unitsById,
  statusColors,
  viewSummary,
  x,
  y,
  frameWidth,
}: {
  hotspot: PublicHotspot;
  unitsById: ReadonlyMap<string, PublicUnit>;
  statusColors: Record<UnitStatus, string>;
  viewSummary: (viewId: string) => { name: string; available: number } | null;
  x: number;
  y: number;
  frameWidth: number;
}) {
  const t = useTranslations("publicSelector.stage");
  const tStatus = useTranslations("unitStatus");
  const formatUnit = useUnitFormat();
  const unit = hotspot.target_type === "unit" && hotspot.target_unit_id ? unitsById.get(hotspot.target_unit_id) : undefined;
  const summary = hotspot.target_type === "view" && hotspot.target_view_id ? viewSummary(hotspot.target_view_id) : null;
  // Verktøytipset legges på den siden av pekeren som har mest plass.
  const alignRight = x > frameWidth / 2;

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 w-max max-w-64 rounded-md border bg-background/95 px-3 py-2 text-sm shadow-lg"
      style={{ left: x, top: y, transform: `translate(${alignRight ? "calc(-100% - 12px)" : "12px"}, -50%)` }}
      data-testid="selector-tooltip"
    >
      {unit ? (
        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">{unit.unit_number}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: statusColors[unit.status] }} aria-hidden="true" />
              {tStatus(unit.status)}
            </span>
          </div>
          <p className="text-muted-foreground">
            {[unit.rooms !== null ? t("rooms", { rooms: unit.rooms }) : null, unit.bra_i !== null ? t("braI", { area: formatUnit.area(unit.bra_i) }) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="font-medium">{formatUnit.price(unit)}</p>
        </div>
      ) : summary ? (
        <div className="grid gap-0.5">
          <span className="font-semibold">{hotspot.label ?? summary.name}</span>
          <span className="text-muted-foreground">{t("available", { count: summary.available })}</span>
        </div>
      ) : (
        <span className="font-semibold">{hotspot.label ?? t("link")}</span>
      )}
    </div>
  );
}
