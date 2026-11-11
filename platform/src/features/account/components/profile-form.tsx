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
import { updateProfile } from "@/features/account/actions";
import { profileSchema, type ProfileInput } from "@/features/account/schemas";

export function ProfileForm({ profile }: { profile: { fullName: string; phone: string; email: string } }) {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName, phone: profile.phone },
  });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await updateProfile(values);
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
      <Field id="email" label={t("email")}>
        {(field) => <Input {...field} value={profile.email} readOnly disabled />}
      </Field>
      <Field id="fullName" label={t("fullName")} error={validation(errors.fullName?.message)}>
        {(field) => <Input {...field} autoComplete="name" {...form.register("fullName")} />}
      </Field>
      <Field id="phone" label={t("phone")} error={validation(errors.phone?.message)}>
        {(field) => <Input {...field} type="tel" autoComplete="tel" {...form.register("phone")} />}
      </Field>
      <div>
        <SubmitButton pending={pending}>{tCommon("save")}</SubmitButton>
      </div>
    </form>
  );
}
