"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HandshakeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { launchProjectByAgreement } from "@/features/platform/actions";

const formSchema = z.object({
  unitLimit: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), "wholeNumber")
    .refine((value) => value === "" || (Number(value) >= 1 && Number(value) <= 100_000), "numberInvalid"),
  note: z.string().trim().min(1, "required").max(500, "textTooLong"),
});
type FormValues = z.infer<typeof formSchema>;

/**
 * Lansering etter avtale (plattformadmin). Uten grense dekker lanseringen alle
 * enhetene. En grense kan bare økes, og et prosjekt uten grense beholder det.
 */
export function LaunchByAgreementDialog({
  projectId,
  projectName,
  launched,
  currentLimit,
}: {
  projectId: string;
  projectName: string;
  launched: boolean;
  currentLimit: number | null;
}) {
  const t = useTranslations("platform.organization");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const defaults: FormValues = { unitLimit: "", note: "" };
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: defaults });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(defaults);
      setFormError(null);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await launchProjectByAgreement({
        projectId,
        unitLimit: values.unitLimit === "" ? null : Number(values.unitLimit),
        note: values.note,
      });
      if (result.ok) {
        toast.success(t("launchDone", { project: projectName }));
        onOpenChange(false);
      } else {
        apply(result);
      }
    });
  });

  const label = launched ? t("extendAction") : t("launchAction");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={launched ? t("extendActionFor", { project: projectName }) : t("launchActionFor", { project: projectName })}
        >
          <HandshakeIcon aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tCommon("close")}>
        <form onSubmit={onSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle", { project: projectName })}</DialogTitle>
            <DialogDescription>{t("dialogDescription")}</DialogDescription>
          </DialogHeader>
          <FormAlert message={formError} />
          <Field
            name="launch-unit-limit"
            label={t("unitLimit")}
            description={currentLimit === null ? t("unitLimitHelp") : t("unitLimitHelpCurrent", { count: currentLimit })}
            error={validation(errors.unitLimit?.message)}
          >
            {(control) => <Input {...control} inputMode="numeric" autoComplete="off" {...form.register("unitLimit")} />}
          </Field>
          <Field name="launch-note" label={t("note")} description={t("noteHelp")} error={validation(errors.note?.message)}>
            {(control) => <Textarea {...control} rows={3} {...form.register("note")} />}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
