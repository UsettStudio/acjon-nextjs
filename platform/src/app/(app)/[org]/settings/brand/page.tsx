import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssetsByIds } from "@/features/media/assets";
import { BrandForm } from "@/features/site-builder/components/brand-form";
import { parseTheme } from "@/features/site-builder/theme";
import { getOrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.brand");
  return { title: t("title") };
}

export default async function BrandSettingsPage({ params }: PageProps<"/[org]/settings/brand">) {
  const { org } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "organization.update")) {
    notFound();
  }
  const t = await getTranslations("settings.brand");
  const supabase = await createClient();
  const { data, error } = await supabase.from("organizations").select("brand, logo_asset_id").eq("id", context.organization.id).single();
  if (error) {
    throw error;
  }
  const assets = await getAssetsByIds(context.organization.id, data.logo_asset_id ? [data.logo_asset_id] : []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t("title")}</h2>
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <BrandForm
          organizationId={context.organization.id}
          brand={parseTheme(data.brand)}
          logoAssetId={data.logo_asset_id}
          assets={Object.fromEntries(assets.map((asset) => [asset.id, asset]))}
        />
      </CardContent>
    </Card>
  );
}
