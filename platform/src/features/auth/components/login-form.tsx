"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { sendMagicLink, signIn } from "@/features/auth/actions";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

export function LoginForm({ next, linkError }: { next?: string; linkError: boolean }) {
  const t = useTranslations("auth");
  const validation = useValidationMessage();
  const [pending, startTransition] = useTransition();
  const [magicPending, startMagicTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", next },
  });
  const translateSpecific = useCallback(
    (code: string) =>
      code === "invalidCredentials"
        ? t("login.invalidCredentials")
        : code === "emailNotConfirmed"
          ? t("login.emailNotConfirmed")
          : undefined,
    [t],
  );
  const { formError, setFormError, apply } = useActionErrors(form, translateSpecific);
  const shownError = formError ?? (linkError ? t("linkInvalid") : null);
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await signIn(values);
      if (result && !result.ok) {
        apply(result);
      }
    });
  });

  async function onMagicLink() {
    setFormError(null);
    setNotice(null);
    if (!(await form.trigger("email"))) {
      return;
    }
    const email = form.getValues("email");
    startMagicTransition(async () => {
      const result = await sendMagicLink({ email, next });
      if (result.ok) {
        setNotice(t("login.magicLinkSent", { email: result.data.email }));
      } else {
        apply(result);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <FormAlert message={shownError} />
      <FormAlert message={notice} variant="success" />
      <Field id="email" label={t("email")} error={validation(errors.email?.message)}>
        {(field) => <Input {...field} type="email" autoComplete="email" {...form.register("email")} />}
      </Field>
      <Field id="password" label={t("password")} error={validation(errors.password?.message)}>
        {(field) => <Input {...field} type="password" autoComplete="current-password" {...form.register("password")} />}
      </Field>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
          {t("login.forgotPassword")}
        </Link>
      </div>
      <SubmitButton pending={pending} className="w-full">
        {t("login.submit")}
      </SubmitButton>
      <Button type="button" variant="outline" onClick={onMagicLink} disabled={magicPending} aria-busy={magicPending}>
        {t("login.magicLink")}
      </Button>
    </form>
  );
}
