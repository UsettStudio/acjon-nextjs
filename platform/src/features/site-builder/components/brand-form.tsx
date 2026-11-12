"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { MediaAsset } from "@/features/media/assets";
import { updateBrand } from "@/features/site-builder/actions";
import type { FieldSpec } from "@/features/site-builder/components/editor/field-specs";
import { FieldContextProvider, FieldList, type FieldContext } from "@/features/site-builder/components/editor/fields";
import { ThemeFields } from "@/features/site-builder/components/editor/theme-fields";
import { themeSchema, type ThemeOverrides } from "@/features/site-builder/theme";

const LOGO_FIELDS: FieldSpec[] = [{ kind: "image", key: "logoAssetId", label: "brandLogo", help: "brandLogo" }];

/** Merkevareprofilen: logo, farger, skrift og knappestil for alle prosjektsidene i organisasjonen. */
export function BrandForm({
  organizationId,
  brand,
  logoAssetId,
  assets: initialAssets,
}: {
  organizationId: string;
  brand: ThemeOverrides;
  logoAssetId: string | null;
  assets: Record<string, MediaAsset>;
}) {
  const t = useTranslations("settings.brand");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const { logo_asset_id: _ignored, ...colors } = brand;
  const [theme, setTheme] = useState<ThemeOverrides>(colors);
  const [logo, setLogo] = useState<string | null>(logoAssetId);
  const [assets, setAssets] = useState(initialAssets);
  const [pending, startTransition] = useTransition();
  const valid = themeSchema.safeParse(theme).success;

  const addAssets = useCallback((added: MediaAsset[]) => {
    setAssets((previous) => ({ ...previous, ...Object.fromEntries(added.map((asset) => [asset.id, asset])) }));
  }, []);

  const context = useMemo<FieldContext>(
    () => ({ organizationId, projectId: null, assets, addAssets, pages: [], blockOptions: [], selectors: [], disabled: false }),
    [organizationId, assets, addAssets],
  );

  return (
    <FieldContextProvider value={context}>
      <form
        className="grid max-w-3xl gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await updateBrand(organizationId, { ...theme, logoAssetId: logo });
            if (result.ok) {
              toast.success(t("saved"));
            } else {
              toast.error(tErrors(result.error as "unknown"));
            }
          });
        }}
      >
        <FieldList
          specs={LOGO_FIELDS}
          values={{ logoAssetId: logo }}
          errors={{}}
          onChange={(values) => setLogo(typeof values.logoAssetId === "string" ? values.logoAssetId : null)}
        />
        <ThemeFields value={theme} parent={{}} onChange={setTheme} disabled={false} inheritLabel={t("default")} />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending || !valid}>
            {pending ? tCommon("saving") : tCommon("save")}
          </Button>
          <p className="text-sm text-muted-foreground">{t("saveHelp")}</p>
        </div>
      </form>
    </FieldContextProvider>
  );
}
