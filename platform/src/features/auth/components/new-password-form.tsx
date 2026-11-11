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
import { updatePassword } from "@/features/auth/actions";
import { newPasswordFormSchema, type NewPasswordInput } from "@/features/auth/schemas";

/** Brukes både etter lenke for glemt passord og under «Min profil». */
export function NewPasswordForm({
  redirectTo,
  submitLabel,
  successMessage,
}: {
  redirectTo?: string;
  submitLabel: string;
  successMessage: string;
}) {
  const t = useTranslations("auth.reset");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { formError, setFormError, apply } = useActionErrors(form);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await updatePassword(values, { redirectTo });
      if (!result) {
        return;
      }
      if (result.ok) {
        form.reset();
        toast.success(successMessage);
      } else {
        apply(result);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={formError} />
      <Field id="password" label={t("newPassword")} error={validation(errors.password?.message)}>
        {(field) => <Input {...field} type="password" autoComplete="new-password" {...form.register("password")} />}
      </Field>
      <Field id="confirmPassword" label={t("confirmPassword")} error={validation(errors.confirmPassword?.message)}>
        {(field) => (
          <Input {...field} type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
        )}
      </Field>
      <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
    </form>
  );
}
