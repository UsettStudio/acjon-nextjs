"use client";

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createBuilding,
  createStage,
  deleteStructureItem,
  moveStructureItem,
  updateBuilding,
  updateStage,
} from "@/features/projects/actions";
import type { Building, Stage } from "@/features/projects/queries";
import { PROJECT_PHASES, type ProjectPhase } from "@/features/projects/schemas";
import type { ActionResult } from "@/lib/actions/result";
import type { CommonActionError } from "@/lib/actions/result";

const NO_STAGE = "none";

/** Navn som lagres når feltet forlates eller Enter trykkes. */
function NameInput({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onCommit: (name: string) => void;
}) {
  const [text, setText] = useState(value);
  const [previous, setPrevious] = useState(value);
  if (previous !== value) {
    setPrevious(value);
    setText(value);
  }
  const commit = () => {
    const trimmed = text.trim();
    if (trimmed === "") {
      setText(value);
    } else if (trimmed !== value) {
      onCommit(trimmed);
    }
  };
  return (
    <Input
      aria-label={label}
      value={text}
      disabled={disabled}
      className="min-w-40 flex-1"
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        } else if (event.key === "Escape") {
          setText(value);
        }
      }}
    />
  );
}

type Removal = { table: "stages" | "buildings"; id: string; name: string } | null;

export function StructureManager({
  organizationId,
  projectId,
  stages,
  buildings,
  disabled,
}: {
  organizationId: string;
  projectId: string;
  stages: Stage[];
  buildings: Building[];
  disabled: boolean;
}) {
  const t = useTranslations("projects.structure");
  const tPhases = useTranslations("projects.phases");
  const tErrors = useTranslations("errors");
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [newStage, setNewStage] = useState("");
  const [newBuilding, setNewBuilding] = useState("");
  const [removal, setRemoval] = useState<Removal>(null);

  function run(action: () => Promise<ActionResult>, success?: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (success) {
          toast.success(success);
        }
      } else {
        toast.error(tErrors(result.error as CommonActionError));
      }
    });
  }

  const stageName = (stageId: string | null) => stages.find((stage) => stage.id === stageId)?.name;
  const busy = disabled || pending;

  return (
    <div className="grid gap-8">
      <section className="grid gap-3" aria-labelledby={`${id}-stages`}>
        <h3 id={`${id}-stages`} className="font-medium">
          {t("stages")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("stagesManageHelp")}</p>
        {stages.length === 0 ? <p className="text-sm text-muted-foreground">{t("noStages")}</p> : null}
        <ol className="grid gap-2">
          {stages.map((stage, index) => (
            <li key={stage.id} className="flex flex-wrap items-center gap-2 rounded-md border p-2">
              <NameInput
                label={t("stageNameFor", { name: stage.name })}
                value={stage.name}
                disabled={busy}
                onCommit={(name) => run(() => updateStage(organizationId, stage.id, { name, phase: stage.phase }), t("saved"))}
              />
              <Select
                value={stage.phase}
                disabled={busy}
                onValueChange={(phase) =>
                  run(() => updateStage(organizationId, stage.id, { name: stage.name, phase: phase as ProjectPhase }), t("saved"))
                }
              >
                <SelectTrigger size="sm" aria-label={t("stagePhaseFor", { name: stage.name })} className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_PHASES.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {tPhases(phase)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy || index === 0}
                  aria-label={t("moveUp", { name: stage.name })}
                  onClick={() => run(() => moveStructureItem(organizationId, "stages", stage.id, "up"))}
                >
                  <ArrowUpIcon aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy || index === stages.length - 1}
                  aria-label={t("moveDown", { name: stage.name })}
                  onClick={() => run(() => moveStructureItem(organizationId, "stages", stage.id, "down"))}
                >
                  <ArrowDownIcon aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  aria-label={t("removeStage", { name: stage.name })}
                  onClick={() => setRemoval({ table: "stages", id: stage.id, name: stage.name })}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const name = newStage.trim();
            if (!name) {
              return;
            }
            run(async () => {
              const result = await createStage(organizationId, projectId, { name, phase: "draft" });
              if (result.ok) {
                setNewStage("");
              }
              return result;
            }, t("added"));
          }}
        >
          <div className="grid flex-1 gap-2">
            <Label htmlFor={`${id}-new-stage`}>{t("newStage")}</Label>
            <Input
              id={`${id}-new-stage`}
              value={newStage}
              disabled={busy}
              placeholder={t("stageFallback", { number: stages.length + 1 })}
              onChange={(event) => setNewStage(event.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" disabled={busy || newStage.trim() === ""}>
            <PlusIcon aria-hidden="true" />
            {t("addStage")}
          </Button>
        </form>
      </section>

      <section className="grid gap-3" aria-labelledby={`${id}-buildings`}>
        <h3 id={`${id}-buildings`} className="font-medium">
          {t("buildings")}
        </h3>
        {buildings.length === 0 ? <p className="text-sm text-muted-foreground">{t("noBuildings")}</p> : null}
        <ol className="grid gap-2">
          {buildings.map((building, index) => (
            <li key={building.id} className="flex flex-wrap items-center gap-2 rounded-md border p-2">
              <NameInput
                label={t("buildingNameFor", { name: building.name })}
                value={building.name}
                disabled={busy}
                onCommit={(name) =>
                  run(() => updateBuilding(organizationId, building.id, { name, stage_id: building.stageId ?? "" }), t("saved"))
                }
              />
              <Select
                value={building.stageId ?? NO_STAGE}
                disabled={busy}
                onValueChange={(stageId) =>
                  run(
                    () =>
                      updateBuilding(organizationId, building.id, {
                        name: building.name,
                        stage_id: stageId === NO_STAGE ? "" : stageId,
                      }),
                    t("saved"),
                  )
                }
              >
                <SelectTrigger size="sm" aria-label={t("buildingStageFor", { name: building.name })} className="w-44">
                  <SelectValue>{stageName(building.stageId) ?? t("noStage")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_STAGE}>{t("noStage")}</SelectItem>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy || index === 0}
                  aria-label={t("moveUp", { name: building.name })}
                  onClick={() => run(() => moveStructureItem(organizationId, "buildings", building.id, "up"))}
                >
                  <ArrowUpIcon aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy || index === buildings.length - 1}
                  aria-label={t("moveDown", { name: building.name })}
                  onClick={() => run(() => moveStructureItem(organizationId, "buildings", building.id, "down"))}
                >
                  <ArrowDownIcon aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  aria-label={t("removeBuilding", { name: building.name })}
                  onClick={() => setRemoval({ table: "buildings", id: building.id, name: building.name })}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const name = newBuilding.trim();
            if (!name) {
              return;
            }
            run(async () => {
              const result = await createBuilding(organizationId, projectId, { name, stage_id: "" });
              if (result.ok) {
                setNewBuilding("");
              }
              return result;
            }, t("added"));
          }}
        >
          <div className="grid flex-1 gap-2">
            <Label htmlFor={`${id}-new-building`}>{t("newBuilding")}</Label>
            <Input
              id={`${id}-new-building`}
              value={newBuilding}
              disabled={busy}
              onChange={(event) => setNewBuilding(event.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" disabled={busy || newBuilding.trim() === ""}>
            <PlusIcon aria-hidden="true" />
            {t("addBuilding")}
          </Button>
        </form>
      </section>

      <AlertDialog open={removal !== null} onOpenChange={(open) => !open && setRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle", { name: removal?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {removal?.table === "stages" ? t("removeStageBody") : t("removeBuildingBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                if (!removal) {
                  return;
                }
                const target = removal;
                run(async () => {
                  const result = await deleteStructureItem(organizationId, target.table, target.id);
                  setRemoval(null);
                  return result;
                }, t("removed"));
              }}
            >
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
