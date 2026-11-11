"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateOrganization } from "@/features/organizations/actions";
import { updateOrganizationSchema, type UpdateOrganizationInput } from "@/features/organizations/schemas";

export function OrganizationSettingsForm({
  organization,
  disabled,
}: {
  organization: { id: string; name: string; slug: string; leadRetentionDays: number | null };
  disabled: boolean;
}) {
  const t = useTranslations("settings.organization");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();

  const form = useForm<UpdateOrganizationInput, unknown, z.output<typeof updateOrganizationSchema>>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      leadRetentionDays: organization.leadRetentionDays?.toString() ?? "",
    },
  });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(() => {
    setFormError(null);
    // Send rå verdier: serveren validerer og transformerer med samme skjema.
    const raw = form.getValues();
    startTransition(async () => {
      const result = await updateOrganization(organization.id, organization.slug, raw);
      if (!result) {
        return;
      }
      if (result.ok) {
        toast.success(t("saved"));
      } else {
        apply(result);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-xl gap-5">
      <FormAlert message={formError} />
      <fieldset disabled={disabled} className="grid gap-5">
        <Field name="name" label={t("name")} error={validation(errors.name?.message)}>
          {(field) => <Input {...field} autoComplete="organization" {...form.register("name")} />}
        </Field>
        <Field name="slug" label={t("slug")} description={t("slugHelp")} error={validation(errors.slug?.message)}>
          {(field) => <Input {...field} autoCapitalize="none" spellCheck={false} {...form.register("slug")} />}
        </Field>
        <Field
          name="leadRetentionDays"
          label={t("leadRetention")}
          description={t("leadRetentionHelp")}
          error={validation(errors.leadRetentionDays?.message)}
        >
          {(field) => <Input {...field} inputMode="numeric" className="max-w-40" {...form.register("leadRetentionDays")} />}
        </Field>
        <div>
          <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}
