"use client";

import { ImageOffIcon, MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";

import { Button } from "@/components/ui/button";
import {
  boundsIntersect,
  boundsOf,
  centroid,
  clientToFraction,
  fitViewport,
  insertPoint,
  nearestEdge,
  normalizeRect,
  pixelDistance,
  removePoint,
  resizeRect,
  translateGroup,
  zoomAt,
  type Point,
  type Viewport,
} from "@/features/selector/geometry";
import type { EditorHotspot } from "@/features/selector/model";
import { FILL_OPACITY } from "@/features/selector/model";
import type { EditorUnit, EditorView } from "@/features/selector/queries";
import { HatchPattern, imageSources, shapePoints, svgPoints } from "@/features/selector/components/hotspot-svg";
import type { UnitStatus } from "@/features/units/fields";
import { cn } from "@/lib/utils";

export type EditorMode = "draw" | "link" | "status";
export type DrawTool = "select" | "polygon" | "rect" | "pan";

export type CanvasHandle = {
  /** Taster som gjelder lerretet: tegning som pågår, zoom og tilpassing. Svarer true hvis tasten ble brukt. */
  handleKey: (event: KeyboardEvent) => boolean;
  fit: () => void;
};

export const UNIT_DRAG_TYPE = "application/x-boligvelger-unit";

type Drag =
  | { kind: "move"; ids: string[]; start: Point; current: Point; clickedId: string }
  | { kind: "vertex"; id: string; index: number; current: Point; inserted: boolean; moved: boolean }
  | { kind: "corner"; id: string; corner: number; current: Point }
  | { kind: "rect"; start: Point; current: Point }
  | { kind: "frame"; start: Point; current: Point; additive: boolean; base: string[] }
  | { kind: "click"; id: string; additive: boolean; clientX: number; clientY: number }
  | { kind: "pan"; startX: number; startY: number; origin: Viewport };

const GRAY = "#8A8F98";
const UNLINKED = "#B45309";
/** Tydelig farge for markeringer under tegning og kobling, uavhengig av status. */
const EDIT = "#2563EB";

/** Punktene til markeringene mens noe dras. Brukes både til visning underveis og til lagring når musa slippes. */
function applyDrag(hotspots: EditorHotspot[], drag: Drag | null): EditorHotspot[] {
  if (!drag) {
    return hotspots;
  }
  switch (drag.kind) {
    case "move": {
      const moving = hotspots.filter((h) => drag.ids.includes(h.id));
      const moved = translateGroup(
        moving.map((h) => h.points),
        drag.current[0] - drag.start[0],
        drag.current[1] - drag.start[1],
      );
      const byId = new Map(moving.map((h, i) => [h.id, moved[i] ?? h.points]));
      return hotspots.map((h) => (byId.has(h.id) ? { ...h, points: byId.get(h.id) ?? h.points } : h));
    }
    case "vertex":
      return hotspots.map((h) => {
        if (h.id !== drag.id) {
          return h;
        }
        const base = drag.inserted ? insertPoint(h.points, drag.index, drag.current) : h.points;
        return { ...h, points: base.map((p, i) => (i === drag.index ? drag.current : p)) };
      });
    case "corner":
      return hotspots.map((h) => (h.id === drag.id ? { ...h, points: resizeRect(h.points, drag.corner, drag.current) } : h));
    default:
      return hotspots;
  }
}

export function EditorCanvas({
  ref,
  view,
  hotspots,
  mode,
  tool,
  canDraw,
  selection,
  onSelectionChange,
  onChange,
  onActivate,
  onDropUnit,
  unitsById,
  viewsById,
  projectsById,
  statusColors,
  hatchSold,
  duplicateUnitIds,
}: {
  ref?: Ref<CanvasHandle>;
  view: EditorView;
  hotspots: EditorHotspot[];
  mode: EditorMode;
  tool: DrawTool;
  canDraw: boolean;
  selection: readonly string[];
  onSelectionChange: (ids: string[]) => void;
  onChange: (next: EditorHotspot[], select?: string[]) => void;
  onActivate: (ids: string[], at: { x: number; y: number }) => void;
  onDropUnit: (hotspotId: string, unitId: string) => void;
  unitsById: ReadonlyMap<string, EditorUnit>;
  viewsById: ReadonlyMap<string, EditorView>;
  projectsById: ReadonlyMap<string, string>;
  statusColors: Record<UnitStatus, string>;
  hatchSold: boolean;
  duplicateUnitIds: ReadonlySet<string>;
}) {
  const t = useTranslations("selector.canvas");
  const tStatus = useTranslations("unitStatus");
  const hatchId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = view.imageWidth ?? 0;
  const height = view.imageHeight ?? 0;
  const hasImage = Boolean(view.asset && width > 0 && height > 0);

  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  const autoFitRef = useRef(true);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [draft, setDraft] = useState<Point[] | null>(null);
  const [hover, setHover] = useState<Point | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  // Dobbeltklikk på et punkt fjerner det. Lerretet fanger pekeren, så dblclick-hendelsen
  // treffer ikke punktet. Derfor telles klikkene her.
  const lastHandleDown = useRef<{ key: string; time: number } | null>(null);
  const pinch = useRef<{ distance: number; midX: number; midY: number } | null>(null);

  const updateViewport = useCallback((next: Viewport | ((current: Viewport) => Viewport), manual = true) => {
    const value = typeof next === "function" ? next(viewportRef.current) : next;
    viewportRef.current = value;
    if (manual) {
      autoFitRef.current = false;
    }
    setViewport(value);
  }, []);

  const updateDrag = useCallback((next: Drag | null) => {
    dragRef.current = next;
    setDrag(next);
  }, []);

  const fit = useCallback(() => {
    const container = containerRef.current;
    if (!container || !hasImage) {
      return;
    }
    autoFitRef.current = true;
    updateViewport(fitViewport(container.clientWidth, container.clientHeight, width, height), false);
  }, [hasImage, height, updateViewport, width]);

  // Tilpass bildet ved start og når bildet byttes. Lerretet lages på nytt for hver visning (key).
  useLayoutEffect(() => {
    autoFitRef.current = true;
    fit();
  }, [fit]);

  // Polygon som er påbegynt, forkastes når verktøy eller modus byttes.
  const toolKey = `${mode}:${tool}:${canDraw}`;
  const [previousToolKey, setPreviousToolKey] = useState(toolKey);
  if (previousToolKey !== toolKey) {
    setPreviousToolKey(toolKey);
    setDraft(null);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (autoFitRef.current) {
        fit();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [fit]);

  // Hjulzoom rundt musepekeren. Lytteren må være aktiv (passive: false) for å kunne stoppe sidescrolling.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const box = container!.getBoundingClientRect();
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const factor = Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0015));
      updateViewport((current) => zoomAt(current, factor, event.clientX - box.left, event.clientY - box.top));
    }
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [updateViewport]);

  // Mellomrom holdt nede: panorer med musa, som i de fleste tegneprogrammer.
  useEffect(() => {
    function isTyping(target: EventTarget | null) {
      return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === "Space" && !isTyping(event.target) && !event.repeat) {
        setSpaceDown(true);
      }
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.code === "Space") {
        setSpaceDown(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const scale = viewport.scale;
  const display = useMemo(() => applyDrag(hotspots, drag), [hotspots, drag]);
  const selected = useMemo(() => new Set(selection), [selection]);

  const toFraction = useCallback((clientX: number, clientY: number): Point => {
    const box = svgRef.current?.getBoundingClientRect();
    return box ? clientToFraction(clientX, clientY, box) : [0, 0];
  }, []);

  const closeDraft = useCallback(
    (points: Point[]) => {
      if (points.length < 3) {
        return;
      }
      const hotspot: EditorHotspot = { id: crypto.randomUUID(), shape: "polygon", points, target: null, label: null };
      onChange([...hotspots, hotspot], [hotspot.id]);
      setDraft(null);
    },
    [hotspots, onChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      fit,
      handleKey(event) {
        if (draft) {
          if (event.key === "Escape") {
            setDraft(null);
            return true;
          }
          if (event.key === "Enter") {
            closeDraft(draft);
            return true;
          }
          if (event.key === "Backspace" || event.key === "Delete") {
            setDraft(draft.length > 1 ? draft.slice(0, -1) : null);
            return true;
          }
        }
        if (dragRef.current && event.key === "Escape") {
          updateDrag(null);
          return true;
        }
        if (!event.metaKey && !event.ctrlKey && !event.altKey) {
          const container = containerRef.current;
          const middle = container ? { x: container.clientWidth / 2, y: container.clientHeight / 2 } : { x: 0, y: 0 };
          if (event.key === "+" || event.key === "=") {
            updateViewport((current) => zoomAt(current, 1.25, middle.x, middle.y));
            return true;
          }
          if (event.key === "-") {
            updateViewport((current) => zoomAt(current, 0.8, middle.x, middle.y));
            return true;
          }
          if (event.key === "0") {
            fit();
            return true;
          }
        }
        return false;
      },
    }),
    [closeDraft, draft, fit, updateDrag, updateViewport],
  );

  function hotspotAt(target: EventTarget | null): string | null {
    const element = target instanceof Element ? target.closest("[data-hotspot-id]") : null;
    return element?.getAttribute("data-hotspot-id") ?? null;
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!hasImage) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    container.setPointerCapture(event.pointerId);

    // To fingre: knipezoom og panorering. Det som ble startet med første finger, avbrytes.
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (a && b) {
        const box = container.getBoundingClientRect();
        pinch.current = {
          distance: Math.hypot(a.x - b.x, a.y - b.y),
          midX: (a.x + b.x) / 2 - box.left,
          midY: (a.y + b.y) / 2 - box.top,
        };
        updateDrag(null);
      }
      return;
    }

    const element = event.target instanceof Element ? event.target : null;
    const handle = element?.closest("[data-handle]");
    const edge = element?.closest("[data-edge-of]");
    const hotspotId = hotspotAt(event.target);
    const additive = event.shiftKey;
    const p = toFraction(event.clientX, event.clientY);
    const panRequested =
      event.button === 1 || spaceDown || tool === "pan" || (event.pointerType === "touch" && !hotspotId && !handle && !edge && tool === "select");

    if (event.button === 1) {
      // Hindrer autoscroll i nettleseren når midtknappen brukes til å panorere.
      event.preventDefault();
    }
    if (panRequested) {
      updateDrag({ kind: "pan", startX: event.clientX, startY: event.clientY, origin: viewportRef.current });
      return;
    }
    if (event.button !== 0) {
      return;
    }

    if (mode === "draw" && canDraw && tool === "polygon") {
      const points = draft ?? [];
      const first = points[0];
      if (first && points.length >= 3 && pixelDistance(first, p, width, height) <= 10 / scale) {
        closeDraft(points);
        return;
      }
      const last = points[points.length - 1];
      // Dobbeltklikk gir to klikk på samme sted. Det andre punktet tas ikke med.
      if (last && pixelDistance(last, p, width, height) <= 3 / scale) {
        return;
      }
      setDraft([...points, p]);
      return;
    }
    if (mode === "draw" && canDraw && tool === "rect") {
      updateDrag({ kind: "rect", start: p, current: p });
      return;
    }

    if (handle && mode === "draw" && canDraw) {
      const id = handle.getAttribute("data-handle") ?? "";
      const index = Number(handle.getAttribute("data-index"));
      const hotspot = hotspots.find((h) => h.id === id);
      if (!hotspot) {
        return;
      }
      if (hotspot.shape === "rect") {
        updateDrag({ kind: "corner", id, corner: index, current: p });
        return;
      }
      const key = `${id}:${index}`;
      const doubleClick = lastHandleDown.current?.key === key && event.timeStamp - lastHandleDown.current.time < 400;
      lastHandleDown.current = { key, time: event.timeStamp };
      if (event.altKey || doubleClick) {
        const next = removePoint(hotspot.points, index);
        if (next) {
          onChange(hotspots.map((h) => (h.id === id ? { ...h, points: next } : h)));
        }
        lastHandleDown.current = null;
        return;
      }
      updateDrag({ kind: "vertex", id, index, current: hotspot.points[index] ?? p, inserted: false, moved: false });
      return;
    }

    if (edge && mode === "draw" && canDraw) {
      const id = edge.getAttribute("data-edge-of") ?? "";
      const hotspot = hotspots.find((h) => h.id === id);
      const hit = hotspot ? nearestEdge(hotspot.points, p, 14 / scale, width, height) : null;
      if (hotspot && hit) {
        updateDrag({ kind: "vertex", id, index: hit.insertAt, current: hit.point, inserted: true, moved: false });
        return;
      }
    }

    if (hotspotId) {
      if (mode === "draw" && canDraw && !additive) {
        const ids = selected.has(hotspotId) ? [...selection] : [hotspotId];
        if (!selected.has(hotspotId)) {
          onSelectionChange(ids);
        }
        updateDrag({ kind: "move", ids, start: p, current: p, clickedId: hotspotId });
        return;
      }
      updateDrag({ kind: "click", id: hotspotId, additive, clientX: event.clientX, clientY: event.clientY });
      return;
    }

    updateDrag({ kind: "frame", start: p, current: p, additive, base: additive ? [...selection] : [] });
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    const container = containerRef.current;
    if (pinch.current && pointers.current.size === 2 && container) {
      const [a, b] = [...pointers.current.values()];
      if (a && b) {
        const box = container.getBoundingClientRect();
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const midX = (a.x + b.x) / 2 - box.left;
        const midY = (a.y + b.y) / 2 - box.top;
        const previous = pinch.current;
        updateViewport((current) => {
          const zoomed = zoomAt(current, distance / Math.max(1, previous.distance), midX, midY);
          return { ...zoomed, x: zoomed.x + midX - previous.midX, y: zoomed.y + midY - previous.midY };
        });
        pinch.current = { distance, midX, midY };
      }
      return;
    }

    const current = dragRef.current;
    if (!current) {
      if (draft) {
        setHover(toFraction(event.clientX, event.clientY));
      }
      return;
    }
    switch (current.kind) {
      case "pan":
        updateViewport({
          ...current.origin,
          x: current.origin.x + event.clientX - current.startX,
          y: current.origin.y + event.clientY - current.startY,
        });
        return;
      case "click":
        return;
      case "vertex":
        updateDrag({ ...current, current: toFraction(event.clientX, event.clientY), moved: true });
        return;
      default:
        updateDrag({ ...current, current: toFraction(event.clientX, event.clientY) });
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) {
      pinch.current = null;
    }
    const current = dragRef.current;
    updateDrag(null);
    if (!current) {
      return;
    }
    const minimum = 4 / scale;
    switch (current.kind) {
      case "move": {
        const moved = pixelDistance(current.start, current.current, width, height) > 1 / scale;
        if (moved) {
          onChange(applyDrag(hotspots, current));
        } else if (selection.length > 1) {
          onSelectionChange([current.clickedId]);
        }
        return;
      }
      case "vertex":
        if (current.moved || current.inserted) {
          onChange(applyDrag(hotspots, current));
        }
        return;
      case "corner":
        onChange(applyDrag(hotspots, current));
        return;
      case "rect": {
        const [a, b] = normalizeRect(current.start, current.current);
        if ((b[0] - a[0]) * width >= minimum && (b[1] - a[1]) * height >= minimum) {
          const hotspot: EditorHotspot = { id: crypto.randomUUID(), shape: "rect", points: [a, b], target: null, label: null };
          onChange([...hotspots, hotspot], [hotspot.id]);
        }
        return;
      }
      case "frame": {
        const [a, b] = normalizeRect(current.start, current.current);
        const tiny = (b[0] - a[0]) * width < minimum && (b[1] - a[1]) * height < minimum;
        if (tiny) {
          if (!current.additive) {
            onSelectionChange([]);
          }
          return;
        }
        const frame = { minX: a[0], minY: a[1], maxX: b[0], maxY: b[1] };
        const hits = hotspots.filter((h) => boundsIntersect(boundsOf(shapePoints(h.shape, h.points)), frame)).map((h) => h.id);
        onSelectionChange([...new Set([...current.base, ...hits])]);
        return;
      }
      case "click": {
        if (current.additive) {
          onSelectionChange(selected.has(current.id) ? selection.filter((id) => id !== current.id) : [...selection, current.id]);
          return;
        }
        onSelectionChange([current.id]);
        if (mode === "status") {
          onActivate([current.id], { x: current.clientX, y: current.clientY });
        }
        return;
      }
      default:
        return;
    }
  }

  function onDoubleClick() {
    if (mode === "draw" && canDraw && draft) {
      closeDraft(draft);
    }
  }

  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (mode !== "link" || !canDraw || !event.dataTransfer.types.includes(UNIT_DRAG_TYPE)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "link";
    const id = hotspotAt(document.elementFromPoint(event.clientX, event.clientY));
    setDropTarget(id);
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    const unitId = event.dataTransfer.getData(UNIT_DRAG_TYPE);
    const id = hotspotAt(document.elementFromPoint(event.clientX, event.clientY));
    setDropTarget(null);
    if (unitId && id) {
      event.preventDefault();
      onDropUnit(id, unitId);
    }
  }

  function targetLabel(hotspot: EditorHotspot): string | null {
    const target = hotspot.target;
    if (!target) {
      return null;
    }
    switch (target.type) {
      case "unit":
        return unitsById.get(target.unitId)?.unitNumber ?? null;
      case "view":
        return viewsById.get(target.viewId)?.name ?? null;
      case "project":
        return projectsById.get(target.projectId) ?? null;
      case "url":
        return hotspot.label ?? t("link");
    }
  }

  function appearance(hotspot: EditorHotspot) {
    const unit = hotspot.target?.type === "unit" ? unitsById.get(hotspot.target.unitId) : undefined;
    if (mode === "status") {
      if (unit) {
        return { fill: statusColors[unit.status], fillOpacity: FILL_OPACITY, stroke: statusColors[unit.status], dashed: false, hatch: hatchSold && unit.status === "sold" };
      }
      return { fill: GRAY, fillOpacity: hotspot.target ? 0.2 : 0.08, stroke: GRAY, dashed: true, hatch: false };
    }
    if (mode === "link") {
      if (!hotspot.target) {
        return { fill: UNLINKED, fillOpacity: 0.12, stroke: UNLINKED, dashed: true, hatch: false };
      }
      if (unit && duplicateUnitIds.has(unit.id)) {
        return { fill: "#D64545", fillOpacity: 0.25, stroke: "#D64545", dashed: true, hatch: false };
      }
      return { fill: EDIT, fillOpacity: 0.25, stroke: EDIT, dashed: false, hatch: false };
    }
    return { fill: EDIT, fillOpacity: 0.2, stroke: EDIT, dashed: false, hatch: false };
  }

  function accessibleName(hotspot: EditorHotspot, index: number): string {
    const label = targetLabel(hotspot);
    const unit = hotspot.target?.type === "unit" ? unitsById.get(hotspot.target.unitId) : undefined;
    if (unit) {
      return `${unit.unitNumber}, ${tStatus(unit.status)}`;
    }
    return label ?? t("unlinkedShape", { number: index + 1 });
  }

  function onShapeKeyDown(event: React.KeyboardEvent<SVGElement>, hotspot: EditorHotspot) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.shiftKey) {
      onSelectionChange(selected.has(hotspot.id) ? selection.filter((id) => id !== hotspot.id) : [...selection, hotspot.id]);
      return;
    }
    onSelectionChange([hotspot.id]);
    if (mode === "status") {
      const box = (event.currentTarget as Element).getBoundingClientRect();
      onActivate([hotspot.id], { x: box.left + box.width / 2, y: box.top + box.height / 2 });
    }
  }

  const sources = view.asset ? imageSources(view.asset) : null;
  const handleRadius = 5 / scale;
  const fontSize = 12 / scale;
  const frame = drag && (drag.kind === "frame" || drag.kind === "rect") ? normalizeRect(drag.start, drag.current) : null;
  const panning = drag?.kind === "pan";
  const cursor = panning
    ? "cursor-grabbing"
    : spaceDown || tool === "pan"
      ? "cursor-grab"
      : mode === "draw" && canDraw && (tool === "polygon" || tool === "rect")
        ? "cursor-crosshair"
        : "cursor-default";
  const shapeCursor = mode === "draw" && canDraw && tool === "select" ? "cursor-move" : "cursor-pointer";

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-80 w-full touch-none overflow-hidden bg-muted/60 select-none", cursor)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => setHover(null)}
      onDoubleClick={onDoubleClick}
      onDragOver={onDragOver}
      onDragLeave={() => setDropTarget(null)}
      onDrop={onDrop}
      data-testid="editor-canvas"
    >
      {!hasImage ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
          <ImageOffIcon className="size-8" aria-hidden="true" />
          <p>{t("missingImage")}</p>
        </div>
      ) : (
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width, height, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${scale})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- bildet skaleres med CSS-transform og trenger originalstørrelsen */}
          <img
            src={sources?.src}
            srcSet={sources?.srcSet}
            sizes={`${Math.round(Math.min(2400, width))}px`}
            width={width}
            height={height}
            alt=""
            draggable={false}
            className="pointer-events-none block max-w-none"
          />
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            className="absolute inset-0 overflow-visible"
            role="group"
            aria-label={t("shapesLabel", { view: view.name })}
          >
            <defs>
              <HatchPattern id={hatchId} spacing={10 / scale} />
            </defs>
            {display.map((hotspot, index) => {
              const look = appearance(hotspot);
              const isSelected = selected.has(hotspot.id);
              const points = svgPoints(hotspot.shape, hotspot.points, width, height);
              const interactive = mode !== "draw" || tool === "select" || !canDraw;
              return (
                <g key={hotspot.id}>
                  <polygon
                    data-hotspot-id={hotspot.id}
                    points={points}
                    tabIndex={interactive ? 0 : -1}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={accessibleName(hotspot, index)}
                    onKeyDown={(event) => onShapeKeyDown(event, hotspot)}
                    className={cn("outline-none focus-visible:opacity-80", interactive ? shapeCursor : "pointer-events-none")}
                    style={{
                      fill: look.fill,
                      fillOpacity: dropTarget === hotspot.id ? 0.55 : look.fillOpacity,
                      stroke: isSelected ? "var(--foreground)" : look.stroke,
                      strokeWidth: isSelected ? 3 : 2,
                      strokeDasharray: look.dashed && !isSelected ? "6 4" : undefined,
                      strokeLinejoin: "round",
                    }}
                    vectorEffect="non-scaling-stroke"
                  />
                  {look.hatch ? <polygon points={points} fill={`url(#${hatchId})`} pointerEvents="none" /> : null}
                </g>
              );
            })}

            {/* Etiketter over alle formene, så de ikke dekkes av en annen markering. */}
            {mode !== "draw"
              ? display.map((hotspot) => {
                  const label = targetLabel(hotspot);
                  if (!label) {
                    return null;
                  }
                  const [cx, cy] = centroid(shapePoints(hotspot.shape, hotspot.points));
                  return (
                    <text
                      key={`label-${hotspot.id}`}
                      x={cx * width}
                      y={cy * height}
                      fontSize={fontSize}
                      textAnchor="middle"
                      dominantBaseline="central"
                      pointerEvents="none"
                      className="fill-foreground font-medium"
                      style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 3 / scale }}
                    >
                      {label}
                    </text>
                  );
                })
              : null}

            {/* Håndtak for punktene i valgte former (bare i Tegn). */}
            {mode === "draw" && canDraw
              ? display
                  .filter((hotspot) => selected.has(hotspot.id))
                  .map((hotspot) => {
                    const corners = shapePoints(hotspot.shape, hotspot.points);
                    return (
                      <g key={`handles-${hotspot.id}`}>
                        {hotspot.shape === "polygon" && selection.length === 1 ? (
                          <polygon
                            data-edge-of={hotspot.id}
                            points={svgPoints(hotspot.shape, hotspot.points, width, height)}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={14}
                            vectorEffect="non-scaling-stroke"
                            pointerEvents="stroke"
                            className="cursor-copy"
                          >
                            <title>{t("addPointHint")}</title>
                          </polygon>
                        ) : null}
                        {corners.map(([x, y], index) => (
                          <circle
                            key={index}
                            data-handle={hotspot.id}
                            data-index={index}
                            cx={x * width}
                            cy={y * height}
                            r={handleRadius}
                            className={hotspot.shape === "rect" ? "cursor-nwse-resize" : "cursor-grab"}
                            style={{ fill: "#ffffff", stroke: EDIT, strokeWidth: 2 }}
                            vectorEffect="non-scaling-stroke"
                          />
                        ))}
                      </g>
                    );
                  })
              : null}

            {/* Polygon som tegnes. */}
            {draft && draft.length > 0 ? (
              <g pointerEvents="none">
                <polyline
                  points={[...draft, ...(hover ? [hover] : [])].map(([x, y]) => `${x * width},${y * height}`).join(" ")}
                  fill="none"
                  style={{ stroke: EDIT, strokeWidth: 2, strokeDasharray: "6 4" }}
                  vectorEffect="non-scaling-stroke"
                />
                {draft.map(([x, y], index) => (
                  <circle
                    key={index}
                    cx={x * width}
                    cy={y * height}
                    r={index === 0 ? handleRadius * 1.4 : handleRadius}
                    style={{ fill: index === 0 ? EDIT : "#ffffff", stroke: EDIT, strokeWidth: 1.5 }}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
            ) : null}

            {frame ? (
              <rect
                x={frame[0][0] * width}
                y={frame[0][1] * height}
                width={(frame[1][0] - frame[0][0]) * width}
                height={(frame[1][1] - frame[0][1]) * height}
                pointerEvents="none"
                style={{
                  fill: drag?.kind === "rect" ? EDIT : "var(--foreground)",
                  fillOpacity: drag?.kind === "rect" ? 0.2 : 0.06,
                  stroke: drag?.kind === "rect" ? EDIT : "var(--foreground)",
                  strokeWidth: 1.5,
                  strokeDasharray: drag?.kind === "rect" ? undefined : "4 3",
                }}
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
        </div>
      )}

      {draft ? (
        <p className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-md bg-background/95 px-3 py-1.5 text-xs shadow-sm">
          {draft.length < 3 ? t("polygonHintStart") : t("polygonHintClose")}
        </p>
      ) : null}

      {hasImage ? (
        <div
          className="absolute right-3 bottom-3 flex items-center gap-1 rounded-md border bg-background/95 p-1 shadow-sm"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t("zoomOut")}
            onClick={() => {
              const container = containerRef.current;
              updateViewport((current) => zoomAt(current, 0.8, (container?.clientWidth ?? 0) / 2, (container?.clientHeight ?? 0) / 2));
            }}
          >
            <MinusIcon aria-hidden="true" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums" aria-live="polite">
            {Math.round(scale * 100)} %
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t("zoomIn")}
            onClick={() => {
              const container = containerRef.current;
              updateViewport((current) => zoomAt(current, 1.25, (container?.clientWidth ?? 0) / 2, (container?.clientHeight ?? 0) / 2));
            }}
          >
            <PlusIcon aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("fit")} onClick={fit}>
            <MaximizeIcon aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
