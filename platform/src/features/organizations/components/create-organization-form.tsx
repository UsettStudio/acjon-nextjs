"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition, type ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createOrganization } from "@/features/organizations/actions";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/features/organizations/schemas";
import { slugify } from "@/features/organizations/slug";

export function CreateOrganizationForm({ appUrl }: { appUrl: string }) {
  const t = useTranslations("onboarding");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  // Adressen følger firmanavnet til brukeren endrer den selv.
  const [slugEdited, setSlugEdited] = useState(false);

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "", slug: "" },
  });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;
  const slug = useWatch({ control: form.control, name: "slug" });

  const nameField = form.register("name", {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (!slugEdited) {
        form.setValue("slug", slugify(event.target.value), { shouldValidate: form.formState.isSubmitted });
      }
    },
  });
  const slugField = form.register("slug", {
    onChange: () => {
      setSlugEdited(true);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createOrganization(values);
      if (result && !result.ok) {
        apply(result);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={formError} />
      <Field id="name" label={t("name")} error={validation(errors.name?.message)}>
        {(field) => <Input {...field} placeholder={t("namePlaceholder")} autoComplete="organization" {...nameField} />}
      </Field>
      <Field
        id="slug"
        label={t("slug")}
        description={t("slugHelp", { url: `${appUrl.replace(/\/$/, "")}/${slug || "…"}` })}
        error={validation(errors.slug?.message)}
      >
        {(field) => <Input {...field} autoCapitalize="none" spellCheck={false} {...slugField} />}
      </Field>
      <p className="text-sm text-muted-foreground">{t("trial")}</p>
      <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
    </form>
  );
}
