import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiKeysSection } from "@/features/integrations/components/api-keys";
import { ApiReference } from "@/features/integrations/components/api-reference";
import { WebhooksSection } from "@/features/integrations/components/webhooks";
import { getIntegrationsData } from "@/features/integrations/queries";
import { getOrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { publicEnv } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("integrations");
  return { title: t("title") };
}

/** Innstillinger → API: API-nøkler, webhooks og en kort oversikt over API-et (eier og administrator). */
export default async function ApiSettingsPage({ params }: PageProps<"/[org]/settings/api">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "integrations.manage")) {
    notFound();
  }
  const [t, data] = await Promise.all([getTranslations("integrations"), getIntegrationsData(context.organization.id)]);
  const readOnly = !context.writable;
  return (
    <div className="grid gap-10">
      <ApiKeysSection organizationId={context.organization.id} keys={data.apiKeys} readOnly={readOnly} />
      <WebhooksSection organizationId={context.organization.id} webhooks={data.webhooks} projects={data.projects} readOnly={readOnly} />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("reference.title")}</h2>
          </CardTitle>
          <CardDescription>{t("reference.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiReference baseUrl={new URL("/api", publicEnv().appUrl).toString()} />
        </CardContent>
      </Card>
    </div>
  );
}
