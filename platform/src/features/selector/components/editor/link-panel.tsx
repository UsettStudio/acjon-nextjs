"use client";

import { AlertTriangleIcon, CheckIcon, LinkIcon, SearchIcon, UnlinkIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UNIT_DRAG_TYPE } from "@/features/selector/components/editor/editor-canvas";
import type { EditorHotspot, HotspotTarget } from "@/features/selector/model";
import type { EditorUnit, EditorView } from "@/features/selector/queries";
import { compareUnitNumbers, type UnitStatus } from "@/features/units/fields";
import { cn } from "@/lib/utils";

type TargetType = HotspotTarget["type"];

type UnitGroup = { key: string; stage: string | null; floors: { floor: number | null; units: EditorUnit[] }[] };

function groupUnits(units: EditorUnit[], stages: { id: string; name: string }[]): UnitGroup[] {
  const stageOrder = new Map(stages.map((stage, index) => [stage.id, index]));
  const byStage = new Map<string, EditorUnit[]>();
  for (const unit of units) {
    const key = unit.stageId && stageOrder.has(unit.stageId) ? unit.stageId : "";
    byStage.set(key, [...(byStage.get(key) ?? []), unit]);
  }
  return [...byStage.entries()]
    .sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : (stageOrder.get(a) ?? 0) - (stageOrder.get(b) ?? 0)))
    .map(([key, stageUnits]) => {
      const floors = new Map<number | null, EditorUnit[]>();
      for (const unit of stageUnits) {
        floors.set(unit.floor, [...(floors.get(unit.floor) ?? []), unit]);
      }
      return {
        key: key || "none",
        stage: stages.find((stage) => stage.id === key)?.name ?? null,
        floors: [...floors.entries()]
          .sort(([a], [b]) => (a === null ? 1 : b === null ? -1 : a - b))
          .map(([floor, floorUnits]) => ({
            floor,
            units: [...floorUnits].sort((a, b) => compareUnitNumbers(a.unitNumber, b.unitNumber)),
          })),
      };
    });
}

/** Valgt markering: hva den lenker til, og etiketten. */
function TargetEditor({
  hotspot,
  views,
  activeViewId,
  projects,
  unitsById,
  canEdit,
  onTarget,
  onLabel,
}: {
  hotspot: EditorHotspot;
  views: EditorView[];
  activeViewId: string;
  projects: { id: string; name: string }[];
  unitsById: ReadonlyMap<string, EditorUnit>;
  canEdit: boolean;
  onTarget: (target: HotspotTarget | null) => void;
  onLabel: (label: string | null) => void;
}) {
  const t = useTranslations("selector.link");
  const id = useId();
  const [type, setType] = useState<TargetType>(hotspot.target?.type ?? "unit");
  const [url, setUrl] = useState(hotspot.target?.type === "url" ? hotspot.target.url : "https://");
  const [urlError, setUrlError] = useState(false);
  const [label, setLabel] = useState(hotspot.label ?? "");
  const target = hotspot.target;
  const linkedUnit = target?.type === "unit" ? unitsById.get(target.unitId) : undefined;
  const otherViews = views.filter((view) => view.id !== activeViewId);

  function saveUrl() {
    const value = url.trim();
    if (!/^https?:\/\/[^\s]+\.[^\s]+/.test(value) || value.length > 2048) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    onTarget({ type: "url", url: value });
  }

  function saveLabel() {
    const value = label.trim().slice(0, 200);
    if ((hotspot.label ?? "") !== value) {
      onLabel(value || null);
    }
  }

  const types: { value: TargetType; label: string }[] = [
    { value: "unit", label: t("types.unit") },
    { value: "view", label: t("types.view") },
    { value: "project", label: t("types.project") },
    { value: "url", label: t("types.url") },
  ];

  return (
    <section className="grid gap-3 rounded-md border bg-background p-3" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="text-sm font-semibold">
        {t("selectedTitle")}
      </h3>
      <div role="radiogroup" aria-label={t("typeLabel")} className="grid grid-cols-4 gap-1 rounded-md bg-muted p-1">
        {types.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={type === option.value}
            disabled={!canEdit}
            onClick={() => setType(option.value)}
            className={cn(
              "rounded px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              type === option.value && "bg-background text-foreground shadow-sm",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {type === "unit" ? (
        <p className="text-sm" aria-live="polite">
          {linkedUnit ? t("linkedTo", { unit: linkedUnit.unitNumber }) : t("pickUnit")}
        </p>
      ) : null}

      {type === "view" ? (
        otherViews.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noOtherViews")}</p>
        ) : (
          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-view`}>{t("viewLabel")}</Label>
            <Select
              value={target?.type === "view" ? target.viewId : ""}
              onValueChange={(viewId) => onTarget({ type: "view", viewId })}
              disabled={!canEdit}
            >
              <SelectTrigger id={`${id}-view`} className="w-full">
                <SelectValue placeholder={t("viewPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {otherViews.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      ) : null}

      {type === "project" ? (
        projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noProjects")}</p>
        ) : (
          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-project`}>{t("projectLabel")}</Label>
            <Select
              value={target?.type === "project" ? target.projectId : ""}
              onValueChange={(projectId) => onTarget({ type: "project", projectId })}
              disabled={!canEdit}
            >
              <SelectTrigger id={`${id}-project`} className="w-full">
                <SelectValue placeholder={t("projectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("projectHelp")}</p>
          </div>
        )
      ) : null}

      {type === "url" ? (
        <form
          className="grid gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            saveUrl();
          }}
        >
          <Label htmlFor={`${id}-url`}>{t("urlLabel")}</Label>
          <div className="flex gap-2">
            <Input
              id={`${id}-url`}
              type="url"
              inputMode="url"
              value={url}
              disabled={!canEdit}
              onChange={(event) => setUrl(event.target.value)}
              aria-invalid={urlError}
              aria-describedby={urlError ? `${id}-url-error` : undefined}
            />
            <Button type="submit" variant="outline" disabled={!canEdit}>
              {t("saveUrl")}
            </Button>
          </div>
          {urlError ? (
            <p id={`${id}-url-error`} className="text-xs text-destructive">
              {t("urlInvalid")}
            </p>
          ) : null}
        </form>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-label`}>{t("labelLabel")}</Label>
        <Input
          id={`${id}-label`}
          value={label}
          maxLength={200}
          disabled={!canEdit}
          placeholder={t("labelPlaceholder")}
          onChange={(event) => setLabel(event.target.value)}
          onBlur={saveLabel}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveLabel();
            }
          }}
        />
      </div>

      {target ? (
        <Button type="button" variant="outline" size="sm" className="justify-self-start" disabled={!canEdit} onClick={() => onTarget(null)}>
          <UnlinkIcon aria-hidden="true" />
          {t("unlink")}
        </Button>
      ) : null}
    </section>
  );
}

export function LinkPanel({
  units,
  stages,
  views,
  activeViewId,
  projects,
  hotspots,
  linkedUnitIds,
  duplicateUnitIds,
  selection,
  statusColors,
  canEdit,
  onTarget,
  onLabel,
  onSelect,
}: {
  units: EditorUnit[];
  stages: { id: string; name: string }[];
  views: EditorView[];
  activeViewId: string;
  projects: { id: string; name: string }[];
  /** Markeringene i visningen som er åpen. */
  hotspots: EditorHotspot[];
  /** Enheter som er markert i minst én visning i velgeren. */
  linkedUnitIds: ReadonlySet<string>;
  duplicateUnitIds: ReadonlySet<string>;
  selection: readonly string[];
  statusColors: Record<UnitStatus, string>;
  canEdit: boolean;
  onTarget: (hotspotId: string, target: HotspotTarget | null) => void;
  onLabel: (hotspotId: string, label: string | null) => void;
  onSelect: (hotspotIds: string[]) => void;
}) {
  const t = useTranslations("selector.link");
  const tStatus = useTranslations("unitStatus");
  const format = useFormatter();
  const id = useId();
  const [search, setSearch] = useState("");
  const [onlyUnmarked, setOnlyUnmarked] = useState(false);
  const unitsById = useMemo(() => new Map(units.map((unit) => [unit.id, unit])), [units]);
  const visibleUnits = units.filter((unit) => !unit.isHidden);
  const markedCount = visibleUnits.filter((unit) => linkedUnitIds.has(unit.id)).length;
  const selectedHotspot = selection.length === 1 ? hotspots.find((h) => h.id === selection[0]) : undefined;
  const unlinkedCount = hotspots.filter((h) => !h.target).length;
  const hereByUnit = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const hotspot of hotspots) {
      if (hotspot.target?.type === "unit") {
        map.set(hotspot.target.unitId, [...(map.get(hotspot.target.unitId) ?? []), hotspot.id]);
      }
    }
    return map;
  }, [hotspots]);

  const query = search.trim().toLowerCase();
  const filtered = units.filter(
    (unit) =>
      (!query || unit.unitNumber.toLowerCase().includes(query)) && (!onlyUnmarked || (!linkedUnitIds.has(unit.id) && !unit.isHidden)),
  );
  const groups = groupUnits(filtered, stages);
  const duplicates = [...duplicateUnitIds].map((unitId) => unitsById.get(unitId)?.unitNumber).filter(Boolean);

  function onUnitClick(unit: EditorUnit) {
    if (selectedHotspot && canEdit) {
      onTarget(selectedHotspot.id, { type: "unit", unitId: unit.id });
      return;
    }
    const linked = hereByUnit.get(unit.id);
    if (linked) {
      onSelect(linked);
    }
  }

  return (
    <div className="grid content-start gap-4">
      <div className="grid gap-1">
        <p className="text-sm font-semibold" aria-live="polite">
          {t("counter", { marked: markedCount, total: visibleUnits.length })}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${visibleUnits.length ? (markedCount / visibleUnits.length) * 100 : 0}%` }}
          />
        </div>
        {unlinkedCount > 0 ? <p className="text-xs text-amber-700 dark:text-amber-400">{t("unlinkedShapes", { count: unlinkedCount })}</p> : null}
      </div>

      {duplicates.length > 0 ? (
        <Alert variant="destructive">
          <AlertTriangleIcon aria-hidden="true" />
          <AlertDescription>{t("duplicates", { units: duplicates.join(", ") })}</AlertDescription>
        </Alert>
      ) : null}

      {selectedHotspot ? (
        <TargetEditor
          key={selectedHotspot.id}
          hotspot={selectedHotspot}
          views={views}
          activeViewId={activeViewId}
          projects={projects}
          unitsById={unitsById}
          canEdit={canEdit}
          onTarget={(target) => onTarget(selectedHotspot.id, target)}
          onLabel={(label) => onLabel(selectedHotspot.id, label)}
        />
      ) : (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{t("hint")}</p>
      )}

      <div className="grid gap-2">
        <Label htmlFor={`${id}-search`} className="sr-only">
          {t("search")}
        </Label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${id}-search`}
            type="search"
            placeholder={t("search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyUnmarked} onChange={(event) => setOnlyUnmarked(event.target.checked)} className="size-4" />
          {t("onlyUnmarked")}
        </label>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noUnits")}</p>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <section key={group.key} aria-label={group.stage ?? t("noStage")} className="grid gap-2">
              {stages.length > 0 ? <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.stage ?? t("noStage")}</h3> : null}
              {group.floors.map((floor) => (
                <div key={floor.floor ?? "none"} className="grid gap-1">
                  <h4 className="text-xs text-muted-foreground">{floor.floor === null ? t("noFloor") : t("floor", { floor: floor.floor })}</h4>
                  <ul className="grid gap-0.5">
                    {floor.units.map((unit) => {
                      const linkedHere = hereByUnit.has(unit.id);
                      const linkedToSelected =
                        selectedHotspot?.target?.type === "unit" && selectedHotspot.target.unitId === unit.id;
                      const marked = linkedUnitIds.has(unit.id);
                      return (
                        <li key={unit.id}>
                          <button
                            type="button"
                            draggable={canEdit}
                            onDragStart={(event) => {
                              event.dataTransfer.setData(UNIT_DRAG_TYPE, unit.id);
                              event.dataTransfer.setData("text/plain", unit.unitNumber);
                              event.dataTransfer.effectAllowed = "link";
                            }}
                            onClick={() => onUnitClick(unit)}
                            aria-pressed={linkedToSelected}
                            data-unit-number={unit.unitNumber}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                              linkedToSelected && "bg-accent ring-1 ring-primary",
                              canEdit && "cursor-grab active:cursor-grabbing",
                            )}
                          >
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: statusColors[unit.status] }}
                              aria-hidden="true"
                            />
                            <span className="font-medium">{unit.unitNumber}</span>
                            <span className="sr-only">{tStatus(unit.status)}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {[unit.rooms !== null ? t("rooms", { rooms: unit.rooms }) : null, unit.braI !== null ? `${format.number(unit.braI, { maximumFractionDigits: 1 })} m²` : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                            <span className="ml-auto flex shrink-0 items-center gap-1 text-xs">
                              {unit.isHidden ? <span className="text-muted-foreground">{t("hidden")}</span> : null}
                              {linkedHere ? (
                                <>
                                  <LinkIcon className="size-3.5 text-primary" aria-hidden="true" />
                                  <span className="sr-only">{t("linkedHere")}</span>
                                </>
                              ) : null}
                              {marked ? (
                                linkedHere ? null : <CheckIcon className="size-3.5 text-muted-foreground" aria-label={t("markedElsewhere")} />
                              ) : !unit.isHidden ? (
                                <span className="rounded border border-amber-500/60 px-1 text-amber-700 dark:text-amber-400">{t("unmarked")}</span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
