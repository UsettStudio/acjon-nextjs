"use client";

import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  HandIcon,
  LoaderCircleIcon,
  MousePointer2Icon,
  PentagonIcon,
  PlusIcon,
  Redo2Icon,
  SquareIcon,
  Trash2Icon,
  TriangleAlertIcon,
  Undo2Icon,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSelectorPublishState,
  renameSelector,
  reorderViews,
  saveViewHotspots,
  setEntryView,
  type PublishState,
} from "@/features/selector/actions";
import {
  EditorCanvas,
  type CanvasHandle,
  type DrawTool,
  type EditorMode,
} from "@/features/selector/components/editor/editor-canvas";
import { LinkPanel } from "@/features/selector/components/editor/link-panel";
import { PublishBar } from "@/features/selector/components/editor/publish-bar";
import { StatusMenu, StatusPanel, type StatusMenuState } from "@/features/selector/components/editor/status-panel";
import { useAutosave, type SaveStatus } from "@/features/selector/components/editor/use-autosave";
import { useEditorHistories } from "@/features/selector/components/editor/use-editor-histories";
import { DeleteViewDialog, ReplaceImageFlow, ViewFormDialog } from "@/features/selector/components/editor/view-dialogs";
import { ViewTree } from "@/features/selector/components/editor/view-tree";
import { duplicatePoints, translateGroup } from "@/features/selector/geometry";
import type { EditorHotspot, HotspotTarget, SelectorSettings } from "@/features/selector/model";
import type { EditorUnit, EditorView, SelectorEditorData } from "@/features/selector/queries";
import { flattenViews } from "@/features/selector/views";
import type { UnitStatus } from "@/features/units/fields";
import { useUnitsRealtime } from "@/features/units/use-units-realtime";
import { cn } from "@/lib/utils";

const NO_HOTSPOTS: EditorHotspot[] = [];

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

function SaveIndicator({ status, error, onRetry }: { status: SaveStatus; error: string | null; onRetry: () => void }) {
  const t = useTranslations("selector.editor.save");
  const tErrors = useTranslations("errors");
  const tSelectorErrors = useTranslations("selector.errors");
  if (status === "error") {
    const message =
      error === "invalidTarget" ? tSelectorErrors("invalidTarget") : tErrors((error ?? "unknown") as "unknown");
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
        <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
        {t("failed", { reason: message })}
        <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onRetry}>
          {t("retry")}
        </Button>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite" data-save-status={status}>
      {status === "saving" ? (
        <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
      ) : status === "saved" ? (
        <CheckIcon className="size-3.5" aria-hidden="true" />
      ) : null}
      {t(status)}
    </span>
  );
}

function ToolButton({
  active,
  label,
  shortcut,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className={cn("size-8", active && "ring-1 ring-foreground/20")}
      aria-label={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function SelectorEditor({
  organizationId,
  orgSlug,
  projectId,
  projectSlug,
  data,
  canEdit,
  canSell,
}: {
  organizationId: string;
  orgSlug: string;
  projectId: string;
  projectSlug: string;
  data: SelectorEditorData;
  canEdit: boolean;
  canSell: boolean;
}) {
  const t = useTranslations("selector.editor");
  const tErrors = useTranslations("errors");
  const selectorId = data.selector.id;

  const [views, setViews] = useState(data.views);
  const [entryViewId, setEntryViewId] = useState(data.selector.entryViewId);
  const [activeViewId, setActiveViewId] = useState<string | null>(
    () => data.selector.entryViewId ?? flattenViews(data.views)[0]?.view.id ?? null,
  );
  const [mode, setMode] = useState<EditorMode>(canEdit ? "draw" : "status");
  const [tool, setTool] = useState<DrawTool>("select");
  const [selection, setSelection] = useState<string[]>([]);
  const [units, setUnits] = useState(data.units);
  const [name, setName] = useState(data.selector.name);
  const [nameDraft, setNameDraft] = useState(data.selector.name);
  const [settings, setSettings] = useState<SelectorSettings>(data.selector.settings);
  const [publish, setPublish] = useState<PublishState>({
    publishedAt: data.selector.publishedAt,
    hasUnpublishedChanges: data.hasUnpublishedChanges,
  });
  const [statusMenu, setStatusMenu] = useState<StatusMenuState | null>(null);
  const [viewDialog, setViewDialog] = useState<{ view: EditorView | null } | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<EditorView | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EditorView | null>(null);
  const canvasRef = useRef<CanvasHandle>(null);

  const { histories, commit, undo, redo, addView, removeView, forgetUnit } = useEditorHistories(data.hotspots);

  const save = useCallback(
    async (viewId: string, hotspots: EditorHotspot[]) => {
      const result = await saveViewHotspots(organizationId, selectorId, viewId, hotspots);
      if (result.ok) {
        setPublish(result.data);
        return { ok: true as const };
      }
      return { ok: false as const, error: result.error };
    },
    [organizationId, selectorId],
  );
  const autosave = useAutosave(histories, save);

  const activeView = views.find((view) => view.id === activeViewId) ?? null;
  const activeHistory = activeViewId ? histories[activeViewId] : undefined;
  const hotspots = activeHistory?.present ?? NO_HOTSPOTS;
  const validSelection = useMemo(() => selection.filter((id) => hotspots.some((h) => h.id === id)), [selection, hotspots]);

  const unitsById = useMemo(() => new Map(units.map((unit) => [unit.id, unit])), [units]);
  const viewsById = useMemo(() => new Map(views.map((view) => [view.id, view])), [views]);
  const projectsById = useMemo(() => new Map(data.projects.map((project) => [project.id, project.name])), [data.projects]);
  const linkedUnitIds = useMemo(() => {
    const ids = new Set<string>();
    for (const history of Object.values(histories)) {
      for (const hotspot of history.present) {
        if (hotspot.target?.type === "unit") {
          ids.add(hotspot.target.unitId);
        }
      }
    }
    return ids;
  }, [histories]);
  const duplicateUnitIds = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const hotspot of hotspots) {
      if (hotspot.target?.type === "unit") {
        if (seen.has(hotspot.target.unitId)) {
          duplicates.add(hotspot.target.unitId);
        }
        seen.add(hotspot.target.unitId);
      }
    }
    return duplicates;
  }, [hotspots]);
  const hotspotCounts = useMemo(
    () => Object.fromEntries(Object.entries(histories).map(([viewId, history]) => [viewId, history.present.length])),
    [histories],
  );

  const realtime = useUnitsRealtime(projectId, {
    onUpsert: (row) => {
      const unit: EditorUnit = {
        id: row.id,
        unitNumber: row.unit_number,
        status: row.status,
        floor: row.floor,
        rooms: row.rooms,
        braI: row.bra_i,
        stageId: row.stage_id,
        isHidden: row.is_hidden,
      };
      setUnits((current) =>
        current.some((item) => item.id === unit.id) ? current.map((item) => (item.id === unit.id ? unit : item)) : [...current, unit],
      );
    },
    onDelete: (unitId) => {
      setUnits((current) => current.filter((unit) => unit.id !== unitId));
      forgetUnit(unitId);
    },
  });

  const refreshPublishState = useCallback(async () => {
    const result = await getSelectorPublishState(organizationId, selectorId);
    if (result.ok) {
      setPublish(result.data);
    }
  }, [organizationId, selectorId]);

  /** Ny tilstand for markeringene i visningen som er åpen (ett steg i angre-historikken). */
  const change = useCallback(
    (next: EditorHotspot[], select?: string[]) => {
      if (!activeViewId || !canEdit) {
        return;
      }
      commit(activeViewId, next);
      autosave.clearError();
      if (select) {
        setSelection(select);
      }
    },
    [activeViewId, autosave, canEdit, commit],
  );

  function setTarget(hotspotId: string, target: HotspotTarget | null) {
    change(hotspots.map((h) => (h.id === hotspotId ? { ...h, target } : h)));
  }

  function setLabel(hotspotId: string, label: string | null) {
    change(hotspots.map((h) => (h.id === hotspotId ? { ...h, label } : h)));
  }

  function openStatusMenu(ids: string[], at: { x: number; y: number }) {
    if (!canSell) {
      return;
    }
    const unitIds = [
      ...new Set(
        hotspots.flatMap((h) => (ids.includes(h.id) && h.target?.type === "unit" && unitsById.has(h.target.unitId) ? [h.target.unitId] : [])),
      ),
    ];
    setStatusMenu({ unitIds, shapeCount: ids.length, at });
  }

  function onStatusChanged(unitIds: string[], status: UnitStatus) {
    setUnits((current) => current.map((unit) => (unitIds.includes(unit.id) ? { ...unit, status } : unit)));
  }

  function selectView(viewId: string) {
    setActiveViewId(viewId);
    setSelection([]);
    setStatusMenu(null);
  }

  function switchMode(next: EditorMode) {
    setMode(next);
    setStatusMenu(null);
    if (next !== "draw") {
      setTool("select");
    }
  }

  function deleteSelected() {
    if (validSelection.length > 0) {
      change(
        hotspots.filter((h) => !validSelection.includes(h.id)),
        [],
      );
    }
  }

  function duplicateSelected() {
    if (!activeView?.imageWidth || !activeView.imageHeight || validSelection.length === 0) {
      return;
    }
    const width = activeView.imageWidth;
    const height = activeView.imageHeight;
    const copies = hotspots
      .filter((h) => validSelection.includes(h.id))
      .map((h) => ({ ...h, id: crypto.randomUUID(), points: duplicatePoints(h.points, width, height), target: null, label: null }));
    change([...hotspots, ...copies], copies.map((copy) => copy.id));
  }

  function nudgeSelected(key: string, large: boolean) {
    if (!activeView?.imageWidth || !activeView.imageHeight || validSelection.length === 0) {
      return;
    }
    const step = large ? 10 : 1;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step / activeView.imageWidth, 0],
      ArrowRight: [step / activeView.imageWidth, 0],
      ArrowUp: [0, -step / activeView.imageHeight],
      ArrowDown: [0, step / activeView.imageHeight],
    };
    const move = delta[key];
    if (!move) {
      return;
    }
    const moving = hotspots.filter((h) => validSelection.includes(h.id));
    const moved = translateGroup(
      moving.map((h) => h.points),
      move[0],
      move[1],
    );
    const byId = new Map(moving.map((h, index) => [h.id, moved[index] ?? h.points]));
    change(hotspots.map((h) => (byId.has(h.id) ? { ...h, points: byId.get(h.id) ?? h.points } : h)));
  }

  // Hurtigtaster. Lytteren ligger på vinduet, men gjør ingenting mens man skriver i et felt eller en dialog er åpen.
  const onKey = useRef<(event: KeyboardEvent) => void>(() => undefined);
  useEffect(() => {
    onKey.current = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTypingTarget(event.target)) {
        return;
      }
      // Taster i en dialog eller meny gjelder den, ikke lerretet. Åpne dialoger fanger fokus,
      // så målet for tastetrykket ligger da inne i dialogen.
      if (event.target instanceof Element && event.target.closest('[role="dialog"], [role="alertdialog"], [role="menu"]')) {
        return;
      }
      if (canvasRef.current?.handleKey(event)) {
        event.preventDefault();
        return;
      }
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && key === "z" && activeViewId) {
        event.preventDefault();
        if (event.shiftKey) {
          redo(activeViewId);
        } else {
          undo(activeViewId);
        }
        return;
      }
      if (mod && key === "y" && activeViewId) {
        event.preventDefault();
        redo(activeViewId);
        return;
      }
      if (mod && key === "a") {
        event.preventDefault();
        setSelection(hotspots.map((h) => h.id));
        return;
      }
      if (key === "escape") {
        setSelection([]);
        return;
      }
      if (!canEdit || mode !== "draw") {
        return;
      }
      if (mod && key === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (key === "delete" || key === "backspace") {
        event.preventDefault();
        deleteSelected();
        return;
      }
      if (event.key.startsWith("Arrow")) {
        if (validSelection.length > 0) {
          event.preventDefault();
          nudgeSelected(event.key, event.shiftKey);
        }
        return;
      }
      if (!mod && !event.altKey) {
        const tools: Record<string, DrawTool> = { v: "select", p: "polygon", r: "rect", h: "pan" };
        const next = tools[key];
        if (next) {
          setTool(next);
        }
      }
    };
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  async function saveName() {
    const value = nameDraft.trim();
    if (!value || value === name) {
      setNameDraft(name);
      return;
    }
    const result = await renameSelector(organizationId, selectorId, value);
    if (result.ok) {
      setName(result.data.name);
      setNameDraft(result.data.name);
      void refreshPublishState();
    } else {
      setNameDraft(name);
      toast.error(tErrors(result.error === "invalidInput" ? "invalidInput" : (result.error as "unknown")));
    }
  }

  function onReorder(next: EditorView[]) {
    const previous = views;
    setViews(next);
    void reorderViews(
      organizationId,
      selectorId,
      next.map((view) => view.id),
    ).then((result) => {
      if (result.ok) {
        void refreshPublishState();
      } else {
        setViews(previous);
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  function onSetEntry(view: EditorView) {
    void setEntryView(organizationId, selectorId, view.id).then((result) => {
      if (result.ok) {
        setEntryViewId(view.id);
        toast.success(t("entrySet", { name: view.name }));
        void refreshPublishState();
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  function onViewSaved(view: EditorView, created: boolean) {
    if (created) {
      setViews((current) => [...current, view]);
      addView(view.id);
      selectView(view.id);
      toast.success(t("viewCreated", { name: view.name }));
    } else {
      setViews((current) => current.map((item) => (item.id === view.id ? view : item)));
      toast.success(t("viewSaved", { name: view.name }));
    }
    void refreshPublishState();
  }

  function onViewDeleted(viewId: string) {
    const remaining = views
      .filter((view) => view.id !== viewId)
      .map((view) => (view.parentViewId === viewId ? { ...view, parentViewId: null } : view));
    setViews(remaining);
    removeView(viewId);
    if (entryViewId === viewId) {
      setEntryViewId(null);
    }
    if (activeViewId === viewId) {
      setActiveViewId(flattenViews(remaining)[0]?.view.id ?? null);
      setSelection([]);
    }
    void refreshPublishState();
  }

  const linkedSelectionCount = hotspots.filter(
    (h) => validSelection.includes(h.id) && h.target?.type === "unit" && unitsById.has(h.target.unitId),
  ).length;
  const canUndo = (activeHistory?.past.length ?? 0) > 0;
  const canRedo = (activeHistory?.future.length ?? 0) > 0;
  const modes: { value: EditorMode; label: string; enabled: boolean }[] = [
    { value: "draw", label: t("modes.draw"), enabled: canEdit },
    { value: "link", label: t("modes.link"), enabled: canEdit },
    { value: "status", label: t("modes.status"), enabled: true },
  ];

  return (
    <div className="grid gap-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${orgSlug}/projects/${projectSlug}/selectors`}>
              <ArrowLeftIcon aria-hidden="true" />
              {t("back")}
            </Link>
          </Button>
          {canEdit ? (
            <Input
              aria-label={t("name")}
              value={nameDraft}
              maxLength={200}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={() => void saveName()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                  setNameDraft(name);
                }
              }}
              className="h-8 w-56 font-semibold"
            />
          ) : (
            <h2 className="font-semibold">{name}</h2>
          )}
          <SaveIndicator status={autosave.status} error={autosave.error} onRetry={() => void autosave.flush()} />
        </div>
        <PublishBar
          organizationId={organizationId}
          selectorId={selectorId}
          publish={publish}
          settings={settings}
          canEdit={canEdit}
          flush={autosave.flush}
          onPublishState={setPublish}
          onSettings={(next) => {
            setSettings(next);
            void refreshPublishState();
          }}
        />
      </header>

      <div className="grid gap-3 lg:h-[calc(100svh-19rem)] lg:min-h-[32rem] lg:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <aside className="rounded-lg border p-3 lg:overflow-y-auto">
          <ViewTree
            views={views}
            activeViewId={activeViewId}
            entryViewId={entryViewId}
            hotspotCounts={hotspotCounts}
            canEdit={canEdit}
            onSelect={selectView}
            onReorder={onReorder}
            onCreate={() => setViewDialog({ view: null })}
            onEdit={(view) => setViewDialog({ view })}
            onReplaceImage={setReplaceTarget}
            onSetEntry={onSetEntry}
            onDelete={setDeleteTarget}
          />
        </aside>

        <section aria-label={t("canvasLabel")} className="flex min-h-[60svh] flex-col overflow-hidden rounded-lg border lg:min-h-0">
          <div className="flex flex-wrap items-center gap-2 border-b p-2">
            <div role="radiogroup" aria-label={t("modes.label")} className="flex gap-1 rounded-md bg-muted p-1">
              {modes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={mode === option.value}
                  disabled={!option.enabled}
                  title={option.enabled ? undefined : t("modes.needsEditor")}
                  onClick={() => switchMode(option.value)}
                  className={cn(
                    "rounded px-3 py-1 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
                    mode === option.value && "bg-background text-foreground shadow-sm",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {mode === "draw" && canEdit ? (
              <div className="flex items-center gap-0.5" role="toolbar" aria-label={t("tools.label")}>
                <ToolButton active={tool === "select"} label={t("tools.select")} shortcut="V" onClick={() => setTool("select")}>
                  <MousePointer2Icon aria-hidden="true" />
                </ToolButton>
                <ToolButton active={tool === "polygon"} label={t("tools.polygon")} shortcut="P" onClick={() => setTool("polygon")}>
                  <PentagonIcon aria-hidden="true" />
                </ToolButton>
                <ToolButton active={tool === "rect"} label={t("tools.rect")} shortcut="R" onClick={() => setTool("rect")}>
                  <SquareIcon aria-hidden="true" />
                </ToolButton>
                <ToolButton active={tool === "pan"} label={t("tools.pan")} shortcut="H" onClick={() => setTool("pan")}>
                  <HandIcon aria-hidden="true" />
                </ToolButton>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                <ToolButton label={t("tools.duplicate")} shortcut="Ctrl+D" disabled={validSelection.length === 0} onClick={duplicateSelected}>
                  <CopyIcon aria-hidden="true" />
                </ToolButton>
                <ToolButton label={t("tools.delete")} shortcut="Delete" disabled={validSelection.length === 0} onClick={deleteSelected}>
                  <Trash2Icon aria-hidden="true" />
                </ToolButton>
              </div>
            ) : null}
            {canEdit ? (
              <div className="ml-auto flex items-center gap-0.5">
                <ToolButton label={t("tools.undo")} shortcut="Ctrl+Z" disabled={!canUndo} onClick={() => activeViewId && undo(activeViewId)}>
                  <Undo2Icon aria-hidden="true" />
                </ToolButton>
                <ToolButton
                  label={t("tools.redo")}
                  shortcut="Ctrl+Shift+Z"
                  disabled={!canRedo}
                  onClick={() => activeViewId && redo(activeViewId)}
                >
                  <Redo2Icon aria-hidden="true" />
                </ToolButton>
              </div>
            ) : null}
          </div>
          <div className="relative min-h-0 flex-1">
            {activeView ? (
              <EditorCanvas
                key={activeView.id}
                ref={canvasRef}
                view={activeView}
                hotspots={hotspots}
                mode={mode}
                tool={tool}
                canDraw={canEdit}
                selection={validSelection}
                onSelectionChange={setSelection}
                onChange={change}
                onActivate={openStatusMenu}
                onDropUnit={(hotspotId, unitId) => {
                  setTarget(hotspotId, { type: "unit", unitId });
                  setSelection([hotspotId]);
                }}
                unitsById={unitsById}
                viewsById={viewsById}
                projectsById={projectsById}
                statusColors={data.statusColors}
                hatchSold={settings.hatch_sold}
                duplicateUnitIds={duplicateUnitIds}
              />
            ) : (
              <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="max-w-sm text-sm text-muted-foreground">{canEdit ? t("emptyEditable") : t("empty")}</p>
                {canEdit ? (
                  <Button type="button" onClick={() => setViewDialog({ view: null })}>
                    <PlusIcon aria-hidden="true" />
                    {t("addFirstView")}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-lg border p-3 lg:overflow-y-auto" aria-label={t("panelLabel")}>
          {mode === "draw" ? (
            <div className="grid content-start gap-4 text-sm">
              <p className="text-muted-foreground">{t(`drawHelp.${tool}`)}</p>
              <p>{t("shapeCount", { count: hotspots.length, selected: validSelection.length })}</p>
              <section aria-labelledby="shortcuts-title" className="grid gap-2">
                <h3 id="shortcuts-title" className="font-semibold">
                  {t("shortcuts.title")}
                </h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                  {(["polygon", "close", "cancel", "addPoint", "removePoint", "move", "nudge", "duplicate", "delete", "undo", "zoom", "pan"] as const).map((key) => (
                    <div key={key} className="contents">
                      <dt className="font-mono text-muted-foreground">{t(`shortcuts.keys.${key}`)}</dt>
                      <dd>{t(`shortcuts.actions.${key}`)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          ) : mode === "link" && activeViewId ? (
            <LinkPanel
              units={units}
              stages={data.stages}
              views={views}
              activeViewId={activeViewId}
              projects={data.projects}
              hotspots={hotspots}
              linkedUnitIds={linkedUnitIds}
              duplicateUnitIds={duplicateUnitIds}
              selection={validSelection}
              statusColors={data.statusColors}
              canEdit={canEdit}
              onTarget={setTarget}
              onLabel={setLabel}
              onSelect={setSelection}
            />
          ) : mode === "status" ? (
            <StatusPanel
              units={units}
              statusColors={data.statusColors}
              selectionCount={validSelection.length}
              linkedSelectionCount={linkedSelectionCount}
              realtime={realtime}
              canSell={canSell}
              onOpenMenu={(at) => openStatusMenu(validSelection, at)}
            />
          ) : null}
        </aside>
      </div>

      <StatusMenu
        organizationId={organizationId}
        menu={statusMenu}
        unitsById={unitsById}
        statusColors={data.statusColors}
        onClose={() => setStatusMenu(null)}
        onChanged={onStatusChanged}
      />
      <ViewFormDialog
        open={viewDialog !== null}
        onOpenChange={(open) => (open ? undefined : setViewDialog(null))}
        organizationId={organizationId}
        projectId={projectId}
        selectorId={selectorId}
        views={views}
        view={viewDialog?.view ?? null}
        defaultParentId={viewDialog?.view ? null : (activeViewId ?? null)}
        onSaved={onViewSaved}
      />
      <ReplaceImageFlow
        organizationId={organizationId}
        projectId={projectId}
        view={replaceTarget}
        shapeCount={replaceTarget ? (hotspotCounts[replaceTarget.id] ?? 0) : 0}
        onClose={() => setReplaceTarget(null)}
        onReplaced={(view) => {
          setViews((current) => current.map((item) => (item.id === view.id ? view : item)));
          void refreshPublishState();
        }}
      />
      <DeleteViewDialog
        organizationId={organizationId}
        view={deleteTarget}
        hasChildren={deleteTarget ? views.some((view) => view.parentViewId === deleteTarget.id) : false}
        onClose={() => setDeleteTarget(null)}
        onDeleted={onViewDeleted}
      />
    </div>
  );
}
