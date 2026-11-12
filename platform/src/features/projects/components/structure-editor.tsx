"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { StructureInput } from "@/features/projects/schemas";

/**
 * Byggetrinn og bygg i veiviseren. Alt er valgfritt: et lite prosjekt kan ha
 * bare bygg, eller ingen av delene. Strukturen kan endres senere under innstillinger.
 */
export function StructureEditor({
  value,
  onChange,
  errorFor,
}: {
  value: StructureInput;
  onChange: (value: StructureInput) => void;
  errorFor: (path: string) => string | undefined;
}) {
  const t = useTranslations("projects.structure");
  const id = useId();

  const setStage = (index: number, stage: StructureInput["stages"][number]) =>
    onChange({ ...value, stages: value.stages.map((item, i) => (i === index ? stage : item)) });

  return (
    <div className="grid gap-6">
      <section className="grid gap-3" aria-labelledby={`${id}-stages`}>
        <h3 id={`${id}-stages`} className="font-medium">
          {t("stages")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("stagesHelp")}</p>
        <ol className="grid gap-4">
          {value.stages.map((stage, stageIndex) => (
            <li key={stageIndex} className="grid gap-3 rounded-md border p-4">
              <div className="flex items-end gap-2">
                <Field
                  name={`stage-${stageIndex}`}
                  label={t("stageName")}
                  error={errorFor(`stages.${stageIndex}.name`)}
                  className="flex-1"
                >
                  {(field) => (
                    <Input {...field} value={stage.name} onChange={(event) => setStage(stageIndex, { ...stage, name: event.target.value })} />
                  )}
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("removeStage", { name: stage.name || t("stageFallback", { number: stageIndex + 1 }) })}
                  onClick={() => onChange({ ...value, stages: value.stages.filter((_, i) => i !== stageIndex) })}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
              <div className="grid gap-2 border-l-2 pl-4">
                <p className="text-sm font-medium">{t("buildingsInStage")}</p>
                <ul className="grid gap-2">
                  {stage.buildings.map((building, buildingIndex) => (
                    <li key={buildingIndex} className="flex items-end gap-2">
                      <Field
                        name={`stage-${stageIndex}-building-${buildingIndex}`}
                        label={t("buildingName")}
                        error={errorFor(`stages.${stageIndex}.buildings.${buildingIndex}.name`)}
                        className="flex-1"
                      >
                        {(field) => (
                          <Input
                            {...field}
                            value={building.name}
                            onChange={(event) =>
                              setStage(stageIndex, {
                                ...stage,
                                buildings: stage.buildings.map((item, i) =>
                                  i === buildingIndex ? { name: event.target.value } : item,
                                ),
                              })
                            }
                          />
                        )}
                      </Field>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("removeBuilding", { name: building.name || t("buildingFallback") })}
                        onClick={() =>
                          setStage(stageIndex, { ...stage, buildings: stage.buildings.filter((_, i) => i !== buildingIndex) })
                        }
                      >
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setStage(stageIndex, {
                        ...stage,
                        buildings: [...stage.buildings, { name: t("buildingDefault", { letter: letter(stage.buildings.length) }) }],
                      })
                    }
                  >
                    <PlusIcon aria-hidden="true" />
                    {t("addBuildingToStage")}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={value.stages.length >= 50}
            onClick={() =>
              onChange({
                ...value,
                stages: [...value.stages, { name: t("stageFallback", { number: value.stages.length + 1 }), buildings: [] }],
              })
            }
          >
            <PlusIcon aria-hidden="true" />
            {t("addStage")}
          </Button>
        </div>
      </section>

      <section className="grid gap-3" aria-labelledby={`${id}-buildings`}>
        <h3 id={`${id}-buildings`} className="font-medium">
          {t("standaloneBuildings")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("standaloneHelp")}</p>
        <ul className="grid gap-2">
          {value.buildings.map((building, index) => (
            <li key={index} className="flex items-end gap-2">
              <Field
                name={`building-${index}`}
                label={t("buildingName")}
                error={errorFor(`buildings.${index}.name`)}
                className="flex-1"
              >
                {(field) => (
                  <Input
                    {...field}
                    value={building.name}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        buildings: value.buildings.map((item, i) => (i === index ? { name: event.target.value } : item)),
                      })
                    }
                  />
                )}
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("removeBuilding", { name: building.name || t("buildingFallback") })}
                onClick={() => onChange({ ...value, buildings: value.buildings.filter((_, i) => i !== index) })}
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={value.buildings.length >= 100}
            onClick={() =>
              onChange({
                ...value,
                buildings: [...value.buildings, { name: t("buildingDefault", { letter: letter(value.buildings.length) }) }],
              })
            }
          >
            <PlusIcon aria-hidden="true" />
            {t("addBuilding")}
          </Button>
        </div>
      </section>
    </div>
  );
}

/** A, B, C … Z, AA, AB … for forslag til navn på bygg. */
function letter(index: number): string {
  let result = "";
  let n = index;
  do {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}
