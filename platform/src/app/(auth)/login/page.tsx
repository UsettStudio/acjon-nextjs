import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/components/login-form";
import { safeNextPath } from "@/lib/navigation/safe-redirect";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

async function LoginFormFromSearchParams({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? safeNextPath(params.next) : undefined;
  return <LoginForm next={next} linkError={params.error === "link"} />;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const t = await getTranslations("auth.login");
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <LoginFormFromSearchParams searchParams={searchParams} />
      </Suspense>
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          {t("signupLink")}
        </Link>
      </p>
    </div>
  );
}
