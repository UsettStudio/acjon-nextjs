import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewPasswordForm } from "@/features/auth/components/new-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.reset");
  return { title: t("title") };
}

/** Lenken for glemt passord logger brukeren inn og sender hit. proxy.ts krever innlogging. */
export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.reset");
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <NewPasswordForm redirectTo="/" submitLabel={t("submit")} successMessage={t("success")} />
    </div>
  );
}
