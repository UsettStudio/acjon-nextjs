"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import type { MediaAsset } from "@/features/media/assets";
import { AssetPicker } from "@/features/media/components/asset-picker";
import { AssetThumb } from "@/features/media/components/upload-zone";

function SortableAsset({
  asset,
  index,
  disabled,
  onRemove,
}: {
  asset: MediaAsset;
  index: number;
  disabled: boolean;
  onRemove: () => void;
}) {
  const t = useTranslations("media.list");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: asset.id, disabled });
  const name = asset.filename ?? t("untitled");
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-md border bg-background p-2 data-[dragging=true]:z-10 data-[dragging=true]:shadow-lg"
      data-dragging={isDragging}
    >
      {!disabled ? (
        <button
          type="button"
          className="cursor-grab rounded-sm p-1 text-muted-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
          aria-label={t("move", { name, position: index + 1 })}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      ) : null}
      <span className="block size-14 shrink-0 overflow-hidden rounded border bg-muted">
        <AssetThumb asset={asset} />
      </span>
      <span className="min-w-0 flex-1 text-sm">
        <span className="block truncate font-medium">{name}</span>
        {asset.isImage && !asset.altText ? <span className="text-xs text-amber-700 dark:text-amber-400">{t("missingAlt")}</span> : null}
      </span>
      {!disabled ? (
        <Button type="button" variant="ghost" size="icon" aria-label={t("remove", { name })} onClick={onRemove}>
          <XIcon aria-hidden="true" />
        </Button>
      ) : null}
    </li>
  );
}

/**
 * Valgte filer i rekkefølge. Rekkefølgen endres med dra og slipp, også med
 * tastatur: mellomrom løfter, piltaster flytter og mellomrom slipper.
 */
export function AssetListField({
  label,
  description,
  organizationId,
  projectId,
  kind,
  value,
  onChange,
  max,
  disabled,
}: {
  label: string;
  description?: string;
  organizationId: string;
  projectId: string;
  kind: "image" | "document";
  value: MediaAsset[];
  onChange: (assets: MediaAsset[]) => void;
  max: number;
  disabled: boolean;
}) {
  const t = useTranslations("media.list");
  const id = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const nameOf = (assetId: string | number) => value.find((asset) => asset.id === assetId)?.filename ?? t("untitled");
  const positionOf = (assetId: string | number) => value.findIndex((asset) => asset.id === assetId) + 1;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const from = value.findIndex((asset) => asset.id === active.id);
    const to = value.findIndex((asset) => asset.id === over.id);
    onChange(arrayMove(value, from, to));
  }

  return (
    <section className="grid gap-3" aria-labelledby={`${id}-label`}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id={`${id}-label`} className="font-medium">
            {label}
          </h3>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {!disabled ? (
          <Button type="button" variant="outline" size="sm" disabled={value.length >= max} onClick={() => setPickerOpen(true)}>
            <PlusIcon aria-hidden="true" />
            {t("add")}
          </Button>
        ) : null}
      </div>
      {value.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            screenReaderInstructions: { draggable: t("instructions") },
            announcements: {
              onDragStart: ({ active }) => t("picked", { name: nameOf(active.id), position: positionOf(active.id) }),
              onDragOver: ({ active, over }) =>
                over ? t("over", { name: nameOf(active.id), position: positionOf(over.id) }) : undefined,
              onDragEnd: ({ active, over }) =>
                over ? t("dropped", { name: nameOf(active.id), position: positionOf(over.id) }) : t("cancelled"),
              onDragCancel: () => t("cancelled"),
            },
          }}
        >
          <SortableContext items={value.map((asset) => asset.id)} strategy={verticalListSortingStrategy}>
            <ol className="grid gap-2">
              {value.map((asset, index) => (
                <SortableAsset
                  key={asset.id}
                  asset={asset}
                  index={index}
                  disabled={disabled}
                  onRemove={() => onChange(value.filter((item) => item.id !== asset.id))}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
      <AssetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        organizationId={organizationId}
        projectId={projectId}
        kind={kind}
        title={t("pickerTitle", { field: label })}
        alreadySelected={value.map((asset) => asset.id)}
        max={max}
        onPick={(assets) => onChange([...value, ...assets].slice(0, max))}
      />
    </section>
  );
}
