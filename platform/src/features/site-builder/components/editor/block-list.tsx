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
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarDaysIcon,
  CircleHelpIcon,
  CodeIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  GripVerticalIcon,
  HashIcon,
  ImagesIcon,
  LayoutPanelLeftIcon,
  ListChecksIcon,
  MailIcon,
  MapIcon,
  MoreHorizontalIcon,
  MousePointerClickIcon,
  NewspaperIcon,
  PanelTopIcon,
  PlusIcon,
  Table2Icon,
  Trash2Icon,
  TriangleAlertIcon,
  TypeIcon,
  UsersIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BLOCK_TYPES, blockPropsSchemas, type Block, type BlockType } from "@/features/site-builder/blocks";
import { BLOCK_FIELDS, issuesByPath } from "@/features/site-builder/components/editor/field-specs";
import { FieldList } from "@/features/site-builder/components/editor/fields";
import { cn } from "@/lib/utils";

export const BLOCK_ICONS: Record<BlockType, LucideIcon> = {
  hero: PanelTopIcon,
  text: TypeIcon,
  text_image: LayoutPanelLeftIcon,
  gallery: ImagesIcon,
  key_figures: HashIcon,
  progress: ListChecksIcon,
  selector: Building2Icon,
  unit_list: Table2Icon,
  map: MapIcon,
  viewings: CalendarDaysIcon,
  contacts: UsersIcon,
  lead_form: MailIcon,
  documents: FileTextIcon,
  video: VideoIcon,
  faq: CircleHelpIcon,
  news: NewspaperIcon,
  button: MousePointerClickIcon,
  embed: CodeIcon,
};

/** Feilene i en blokk som { "items.2.start": "timeInvalid" }. Tomt objekt når blokken er gyldig. */
export function blockErrors(block: Block): Record<string, string> {
  const parsed = blockPropsSchemas[block.type].safeParse(block.props);
  return parsed.success ? {} : issuesByPath(parsed.error.issues);
}

/** Kort beskrivelse av innholdet, så blokker av samme type kan skilles i listen. */
export function blockSummary(block: Block): string {
  const props = block.props as Record<string, unknown>;
  for (const key of ["heading", "title", "label"]) {
    const value = props[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return "";
}

function SortableBlock({
  block,
  selected,
  invalid,
  disabled,
  onSelect,
  onToggleHidden,
  onDuplicate,
  onDelete,
}: {
  block: Block;
  selected: boolean;
  invalid: boolean;
  disabled: boolean;
  onSelect: () => void;
  onToggleHidden: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("siteBuilder.editor.blocks");
  const tTypes = useTranslations("siteBuilder.blockTypes");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id, disabled });
  const Icon = BLOCK_ICONS[block.type];
  const typeName = tTypes(`${block.type}.name`);
  const summary = blockSummary(block);
  const name = summary ? `${typeName}: ${summary}` : typeName;
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-dragging={isDragging}
      data-block-row={block.id}
      className={cn(
        "flex items-center gap-1 rounded-md border bg-background py-1 pr-1 pl-1 data-[dragging=true]:z-10 data-[dragging=true]:shadow-lg",
        selected && "border-primary ring-2 ring-primary/30",
      )}
    >
      {!disabled ? (
        <button
          type="button"
          className="cursor-grab rounded-sm p-1.5 text-muted-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
          aria-label={t("move", { name })}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon aria-hidden="true" className="size-4" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-sm px-1.5 py-1.5 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
          block.hidden && "text-muted-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{typeName}</span>
          {summary ? <span className="block truncate text-xs text-muted-foreground">{summary}</span> : null}
        </span>
        {block.hidden ? <span className="text-xs">{t("hiddenBadge")}</span> : null}
        {invalid ? <TriangleAlertIcon className="size-4 shrink-0 text-destructive" role="img" aria-label={t("hasErrors")} /> : null}
      </button>
      {!disabled ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-pressed={block.hidden}
            aria-label={block.hidden ? t("show", { name }) : t("hide", { name })}
            onClick={onToggleHidden}
          >
            {block.hidden ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("actions", { name })}>
                <MoreHorizontalIcon aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onDuplicate}>
                <CopyIcon aria-hidden="true" />
                {t("duplicate")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
                <Trash2Icon aria-hidden="true" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
    </li>
  );
}

/**
 * Blokkene på siden i rekkefølge. Rekkefølgen endres med dra og slipp, også med
 * tastatur: mellomrom løfter, piltaster flytter og mellomrom slipper.
 */
export function BlockList({
  blocks,
  selectedId,
  invalidIds,
  disabled,
  onSelect,
  onReorder,
  onToggleHidden,
  onDuplicate,
  onDelete,
  onAdd,
}: {
  blocks: Block[];
  selectedId: string | null;
  invalidIds: Set<string>;
  disabled: boolean;
  onSelect: (id: string) => void;
  onReorder: (blocks: Block[]) => void;
  onToggleHidden: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const t = useTranslations("siteBuilder.editor.blocks");
  const tTypes = useTranslations("siteBuilder.blockTypes");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const nameOf = (id: string | number) => {
    const block = blocks.find((item) => item.id === id);
    return block ? tTypes(`${block.type}.name`) : "";
  };
  const positionOf = (id: string | number) => blocks.findIndex((item) => item.id === id) + 1;

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const from = blocks.findIndex((block) => block.id === active.id);
    const to = blocks.findIndex((block) => block.id === over.id);
    onReorder(arrayMove(blocks, from, to));
  }

  return (
    <div className="grid gap-3">
      {blocks.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            screenReaderInstructions: { draggable: t("instructions") },
            announcements: {
              onDragStart: ({ active }) => t("picked", { name: nameOf(active.id), position: positionOf(active.id) }),
              onDragOver: ({ active, over }) => (over ? t("over", { name: nameOf(active.id), position: positionOf(over.id) }) : undefined),
              onDragEnd: ({ active, over }) => (over ? t("dropped", { name: nameOf(active.id), position: positionOf(over.id) }) : t("cancelled")),
              onDragCancel: () => t("cancelled"),
            },
          }}
        >
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <ol className="grid gap-1.5" aria-label={t("listLabel")}>
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  selected={block.id === selectedId}
                  invalid={invalidIds.has(block.id)}
                  disabled={disabled}
                  onSelect={() => onSelect(block.id)}
                  onToggleHidden={() => onToggleHidden(block.id)}
                  onDuplicate={() => onDuplicate(block.id)}
                  onDelete={() => onDelete(block.id)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
      {!disabled ? (
        <Button type="button" variant="outline" onClick={onAdd}>
          <PlusIcon aria-hidden="true" />
          {t("add")}
        </Button>
      ) : null}
    </div>
  );
}

/** Velg blokktype. Blokken legges inn etter den valgte blokken, eller sist. */
export function AddBlockDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (type: BlockType) => void;
}) {
  const t = useTranslations("siteBuilder.editor.blocks");
  const tTypes = useTranslations("siteBuilder.blockTypes");
  const tCommon = useTranslations("common");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")} className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("addTitle")}</DialogTitle>
          <DialogDescription>{t("addDescription")}</DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_TYPES.map((type) => {
            const Icon = BLOCK_ICONS[type];
            return (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(type);
                    onOpenChange(false);
                  }}
                  className="flex h-full w-full items-start gap-3 rounded-md border p-3 text-left outline-none hover:border-primary hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-medium">{tTypes(`${type}.name`)}</span>
                    <span className="block text-xs text-muted-foreground">{tTypes(`${type}.description`)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/** Skjemaet for én blokk. Feilene vises ved feltene og hindrer lagring til de er rettet. */
export function BlockForm({
  block,
  disabled,
  onChange,
  onBack,
}: {
  block: Block;
  disabled: boolean;
  onChange: (block: Block) => void;
  onBack: () => void;
}) {
  const t = useTranslations("siteBuilder.editor.blocks");
  const tTypes = useTranslations("siteBuilder.blockTypes");
  const errors = blockErrors(block);
  const Icon = BLOCK_ICONS[block.type];
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-5" aria-labelledby={`block-form-${block.id}`}>
      <div className="grid gap-3">
        <Button type="button" variant="ghost" size="sm" className="-ml-2 justify-self-start" onClick={onBack}>
          <ArrowLeftIcon aria-hidden="true" />
          {t("back")}
        </Button>
        <div className="flex items-start gap-3">
          <Icon className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 id={`block-form-${block.id}`} className="font-semibold">
              {tTypes(`${block.type}.name`)}
            </h3>
            <p className="text-sm text-muted-foreground">{tTypes(`${block.type}.description`)}</p>
          </div>
        </div>
        {block.hidden ? (
          <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
            <EyeOffIcon className="size-4 shrink-0" aria-hidden="true" />
            {t("hiddenNotice")}
          </p>
        ) : null}
        {Object.keys(errors).length > 0 ? (
          <p role="alert" className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
            {t("fixErrors")}
          </p>
        ) : null}
      </div>
      <FieldList
        specs={BLOCK_FIELDS[block.type]}
        values={block.props as Record<string, unknown>}
        errors={errors}
        onChange={(props) => {
          if (!disabled) {
            onChange({ ...block, props } as Block);
          }
        }}
      />
    </section>
  );
}
