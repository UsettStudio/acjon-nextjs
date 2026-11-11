"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ProjectOption } from "@/features/members/queries";

/** Avkrysningsliste for hvilke prosjekter en redaktør eller megler får tilgang til. */
export function ProjectChecklist({
  projects,
  selected,
  onChange,
}: {
  projects: ProjectOption[];
  selected: string[];
  onChange: (projectIds: string[]) => void;
}) {
  const t = useTranslations("members");
  const baseId = useId();

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noProjects")}</p>;
  }

  return (
    <ul className="grid max-h-60 gap-2 overflow-y-auto rounded-md border p-3">
      {projects.map((project) => {
        const id = `${baseId}-${project.id}`;
        const checked = selected.includes(project.id);
        return (
          <li key={project.id} className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(value) =>
                onChange(value === true ? [...selected, project.id] : selected.filter((item) => item !== project.id))
              }
            />
            <Label htmlFor={id} className="font-normal">
              {project.name}
            </Label>
          </li>
        );
      })}
    </ul>
  );
}
