"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/features/auth/actions";
import { signupSchema, type SignupInput } from "@/features/auth/schemas";

export function SignupForm({ next, email }: { next?: string; email?: string }) {
  const t = useTranslations("auth");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: email ?? "", password: "", next },
  });
  const translateSpecific = useCallback(
    (code: string) => (code === "alreadyRegistered" ? t("signup.alreadyRegistered") : undefined),
    [t],
  );
  const { formError, setFormError, apply } = useActionErrors(form, translateSpecific);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await signUp(values);
      if (!result) {
        return;
      }
      if (result.ok) {
        setSentTo(result.data.email);
      } else {
        apply(result);
      }
    });
  });

  if (sentTo) {
    return (
      <div className="grid gap-2" role="status">
        <h2 className="text-lg font-semibold">{t("signup.checkEmailTitle")}</h2>
        <p className="text-muted-foreground">{t("signup.checkEmail", { email: sentTo })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={formError} />
      <Field id="fullName" label={t("fullName")} error={validation(errors.fullName?.message)}>
        {(field) => <Input {...field} autoComplete="name" {...form.register("fullName")} />}
      </Field>
      <Field id="email" label={t("email")} error={validation(errors.email?.message)}>
        {(field) => (
          <Input {...field} type="email" autoComplete="email" readOnly={Boolean(email)} {...form.register("email")} />
        )}
      </Field>
      <Field
        id="password"
        label={t("password")}
        description={t("signup.passwordHint")}
        error={validation(errors.password?.message)}
      >
        {(field) => <Input {...field} type="password" autoComplete="new-password" {...form.register("password")} />}
      </Field>
      <SubmitButton pending={pending} className="w-full">
        {t("signup.submit")}
      </SubmitButton>
    </form>
  );
}
