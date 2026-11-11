import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgot");
  return { title: t("title") };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgot");
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
