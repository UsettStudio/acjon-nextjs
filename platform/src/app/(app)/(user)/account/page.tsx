import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForm } from "@/features/account/components/profile-form";
import { NewPasswordForm } from "@/features/auth/components/new-password-form";
import { getProfile, requireUser } from "@/lib/auth/dal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

async function ProfileSection() {
  const user = await requireUser("/account");
  const profile = await getProfile();
  return (
    <ProfileForm
      profile={{
        fullName: profile?.fullName ?? "",
        phone: profile?.phone ?? "",
        email: profile?.email ?? user.email ?? "",
      }}
    />
  );
}

export default async function AccountPage() {
  const t = await getTranslations("account");
  const tReset = await getTranslations("auth.reset");
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-6">
        <Card>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full max-w-xl" />}>
              <ProfileSection />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("passwordTitle")}</h2>
            </CardTitle>
            <CardDescription>{t("passwordDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="max-w-xl">
            <NewPasswordForm submitLabel={tReset("submit")} successMessage={t("passwordSaved")} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
