"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";

import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert } from "@/components/forms/form-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteProject } from "@/features/projects/actions";
import type { CommonActionError } from "@/lib/actions/result";

/** Sletting krever at prosjektnavnet skrives inn. Alt i prosjektet slettes; filer blir liggende i mediebiblioteket. */
export function DeleteProject({
  organizationId,
  projectId,
  projectName,
}: {
  organizationId: string;
  projectId: string;
  projectName: string;
}) {
  const t = useTranslations("projects.delete");
  const tErrors = useTranslations("errors");
  const id = useId();
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await deleteProject(organizationId, projectId, confirm);
          if (result && !result.ok) {
            setError(result.error === "nameMismatch" ? t("nameMismatch") : tErrors(result.error as CommonActionError));
          }
        });
      }}
    >
      <p className="text-sm text-muted-foreground">{t("body")}</p>
      <FormAlert message={error} />
      <div className="grid gap-2">
        <Label htmlFor={`${id}-confirm`}>{t("confirmLabel", { name: projectName })}</Label>
        <Input id={`${id}-confirm`} value={confirm} autoComplete="off" onChange={(event) => setConfirm(event.target.value)} />
      </div>
      <div>
        <SubmitButton variant="destructive" pending={pending} disabled={confirm.trim() !== projectName.trim()}>
          {t("submit")}
        </SubmitButton>
      </div>
    </form>
  );
}
