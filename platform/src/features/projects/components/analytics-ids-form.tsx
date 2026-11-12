"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateAnalyticsIds } from "@/features/projects/actions";
import { analyticsIdsSchema, type AnalyticsIdsInput } from "@/features/projects/analytics";

/** Sporingskoder for prosjektsiden: Google Analytics 4, Google Tag Manager og Meta Pixel. */
export function AnalyticsIdsForm({
  organizationId,
  projectId,
  initial,
  disabled,
}: {
  organizationId: string;
  projectId: string;
  initial: AnalyticsIdsInput;
  disabled: boolean;
}) {
  const t = useTranslations("projects.settings.tracking");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const form = useForm<AnalyticsIdsInput>({ resolver: zodResolver(analyticsIdsSchema), defaultValues: initial });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await updateAnalyticsIds(organizationId, projectId, values);
      if (result.ok) {
        toast.success(t("saved"));
        form.reset(values);
      } else {
        apply(result);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormAlert message={formError} />
      <fieldset className="grid gap-4 sm:grid-cols-3" disabled={disabled}>
        <Field name="ga4" label={t("ga4")} description={t("ga4Help")} error={validation(errors.ga4?.message)}>
          {(control) => <Input {...control} autoComplete="off" spellCheck={false} placeholder="G-XXXXXXXXXX" {...form.register("ga4")} />}
        </Field>
        <Field name="gtm" label={t("gtm")} description={t("gtmHelp")} error={validation(errors.gtm?.message)}>
          {(control) => <Input {...control} autoComplete="off" spellCheck={false} placeholder="GTM-XXXXXXX" {...form.register("gtm")} />}
        </Field>
        <Field name="meta-pixel" label={t("metaPixel")} description={t("metaPixelHelp")} error={validation(errors.meta_pixel?.message)}>
          {(control) => (
            <Input {...control} autoComplete="off" spellCheck={false} inputMode="numeric" placeholder="123456789012345" {...form.register("meta_pixel")} />
          )}
        </Field>
      </fieldset>
      <p className="text-sm text-muted-foreground">{t("consentNote")}</p>
      {disabled ? null : (
        <div>
          <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton>
        </div>
      )}
    </form>
  );
}
