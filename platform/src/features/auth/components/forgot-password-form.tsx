"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/features/auth/actions";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { formError, setFormError, apply } = useActionErrors(form);

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      if (result.ok) {
        setNotice(t("forgot.sent", { email: result.data.email }));
      } else {
        apply(result);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={formError} />
      <FormAlert message={notice} variant="success" />
      <Field name="email" label={t("email")} error={validation(form.formState.errors.email?.message)}>
        {(field) => <Input {...field} type="email" autoComplete="email" {...form.register("email")} />}
      </Field>
      <SubmitButton pending={pending} className="w-full">
        {t("forgot.submit")}
      </SubmitButton>
    </form>
  );
}
