import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationSettingsForm } from "@/features/organizations/components/organization-settings-form";
import { StatusColorsForm } from "@/features/selector/components/status-colors-form";
import { DEFAULT_STATUS_COLORS, parseStatusColorOverrides } from "@/features/selector/model";
import { can } from "@/lib/auth/permissions";
import { getOrgContext } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.organization");
  return { title: t("title") };
}

export default async function OrganizationSettingsPage({ params }: PageProps<"/[org]/settings">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "organization.update")) {
    notFound();
  }
  const [t, tColors] = await Promise.all([getTranslations("settings.organization"), getTranslations("selector.colors")]);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, lead_retention_days, status_colors")
    .eq("id", context.organization.id)
    .single();
  if (error) {
    throw error;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("title")}</h2>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationSettingsForm
            organization={{ id: data.id, name: data.name, slug: data.slug, leadRetentionDays: data.lead_retention_days }}
            disabled={!context.writable}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{tColors("organizationTitle")}</h2>
          </CardTitle>
          <CardDescription>{tColors("organizationHelp")}</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusColorsForm
            scope="organization"
            organizationId={data.id}
            initial={parseStatusColorOverrides(data.status_colors)}
            inherited={DEFAULT_STATUS_COLORS}
            disabled={!context.writable}
          />
        </CardContent>
      </Card>
    </div>
  );
}
