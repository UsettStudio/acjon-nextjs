import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateOrganizationForm } from "@/features/organizations/components/create-organization-form";
import { publicEnv } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return { title: t("title") };
}

export default async function OnboardingPage() {
  const t = await getTranslations("onboarding");
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm appUrl={publicEnv().appUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
