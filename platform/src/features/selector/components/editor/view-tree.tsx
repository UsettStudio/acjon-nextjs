"use client";

/* eslint-disable @next/next/no-img-element -- Miniatyrene er ferdige WebP-varianter fra Storage. */

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, ImageIcon, MoreHorizontalIcon, PlusIcon, StarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EditorView } from "@/features/selector/queries";
import { flattenViews, moveView, type FlatView } from "@/features/selector/views";
import { cn } from "@/lib/utils";

function TreeItem({
  item,
  active,
  isEntry,
  hotspotCount,
  canEdit,
  onSelect,
  onEdit,
  onReplaceImage,
  onSetEntry,
  onDelete,
}: {
  item: FlatView<EditorView>;
  active: boolean;
  isEntry: boolean;
  hotspotCount: number;
  canEdit: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onReplaceImage: () => void;
  onSetEntry: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("selector.views");
  const { view, depth } = item;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: view.id, disabled: !canEdit });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10")}
    >
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md py-1 pr-1 hover:bg-accent",
          active && "bg-accent ring-1 ring-primary/40",
          isDragging && "shadow-lg",
        )}
        style={{ paddingLeft: 4 + depth * 14 }}
      >
        {canEdit ? (
          <button
            type="button"
            className="cursor-grab rounded-sm p-0.5 text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
            aria-label={t("move", { name: view.name })}
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSelect}
          aria-current={active ? "true" : undefined}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex h-8 w-11 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
            {view.asset?.thumbnailUrl ? (
              <img src={view.asset.thumbnailUrl} alt="" className="size-full object-cover" loading="lazy" />
            ) : (
              <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1 truncate text-sm font-medium">
              {view.name}
              {isEntry ? <StarIcon className="size-3 shrink-0 fill-amber-400 text-amber-500" aria-label={t("entry")} /> : null}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {t(`kinds.${view.kind}`)}
              {view.angleGroup ? ` · ${t("angleShort", { group: view.angleGroup })}` : ""} · {t("shapes", { count: hotspotCount })}
            </span>
          </span>
        </button>
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" aria-label={t("actions", { name: view.name })}>
                <MoreHorizontalIcon aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>{t("edit")}</DropdownMenuItem>
              <DropdownMenuItem onSelect={onReplaceImage}>{t("replaceImage")}</DropdownMenuItem>
              <DropdownMenuItem onSelect={onSetEntry} disabled={isEntry}>
                {t("setEntry")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Visningene som et tre. Rekkefølgen blant søsken endres med dra og slipp,
 * også med tastatur. En visning flyttes til en annen forelder i innstillingene.
 */
export function ViewTree({
  views,
  activeViewId,
  entryViewId,
  hotspotCounts,
  canEdit,
  onSelect,
  onReorder,
  onCreate,
  onEdit,
  onReplaceImage,
  onSetEntry,
  onDelete,
}: {
  views: EditorView[];
  activeViewId: string | null;
  entryViewId: string | null;
  hotspotCounts: Record<string, number>;
  canEdit: boolean;
  onSelect: (viewId: string) => void;
  onReorder: (views: EditorView[]) => void;
  onCreate: () => void;
  onEdit: (view: EditorView) => void;
  onReplaceImage: (view: EditorView) => void;
  onSetEntry: (view: EditorView) => void;
  onDelete: (view: EditorView) => void;
}) {
  const t = useTranslations("selector.views");
  const flat = flattenViews(views);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const nameOf = (id: string | number) => views.find((view) => view.id === id)?.name ?? "";
  // Den publiserte velgeren starter i valgt startvisning, ellers i første visning øverst.
  const effectiveEntry = entryViewId ?? flat[0]?.view.id ?? null;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const moved = moveView(views, String(active.id), String(over.id));
    if (moved) {
      onReorder(moved);
    }
  }

  return (
    <nav aria-label={t("title")} className="grid content-start gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t("title")}</h2>
        {canEdit ? (
          <Button type="button" variant="outline" size="sm" onClick={onCreate}>
            <PlusIcon aria-hidden="true" />
            {t("add")}
          </Button>
        ) : null}
      </div>
      {flat.length === 0 ? (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            screenReaderInstructions: { draggable: t("dragInstructions") },
            announcements: {
              onDragStart: ({ active }) => t("picked", { name: nameOf(active.id) }),
              onDragOver: ({ active, over }) => (over ? t("over", { name: nameOf(active.id), target: nameOf(over.id) }) : undefined),
              onDragEnd: ({ active, over }) =>
                over ? t("dropped", { name: nameOf(active.id), target: nameOf(over.id) }) : t("cancelled"),
              onDragCancel: () => t("cancelled"),
            },
          }}
        >
          <SortableContext items={flat.map((item) => item.view.id)} strategy={verticalListSortingStrategy}>
            <ul className="grid gap-0.5">
              {flat.map((item) => (
                <TreeItem
                  key={item.view.id}
                  item={item}
                  active={item.view.id === activeViewId}
                  isEntry={item.view.id === effectiveEntry}
                  hotspotCount={hotspotCounts[item.view.id] ?? 0}
                  canEdit={canEdit}
                  onSelect={() => onSelect(item.view.id)}
                  onEdit={() => onEdit(item.view)}
                  onReplaceImage={() => onReplaceImage(item.view)}
                  onSetEntry={() => onSetEntry(item.view)}
                  onDelete={() => onDelete(item.view)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      {canEdit && flat.length > 1 ? <p className="text-xs text-muted-foreground">{t("reorderHint")}</p> : null}
    </nav>
  );
}
