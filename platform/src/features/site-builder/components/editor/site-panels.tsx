"use client";

import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteSite, updateSubdomain } from "@/features/site-builder/actions";
import { newBlockId, type Block } from "@/features/site-builder/blocks";
import { issuesByPath, type FieldSpec } from "@/features/site-builder/components/editor/field-specs";
import { FieldContextProvider, FieldList, type FieldContext } from "@/features/site-builder/components/editor/fields";
import { ThemeFields } from "@/features/site-builder/components/editor/theme-fields";
import { footerSchema, navSchema, type NavItem, type SeoDefaults, type SiteFooter } from "@/features/site-builder/site";
import { resolveTheme, type ThemeOverrides } from "@/features/site-builder/theme";
import { publicEnv } from "@/lib/env";

/** Feil i en liste lagt under listens nøkkel, så FieldList finner dem. */
function prefixed(errors: Record<string, string>, prefix: string): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).map(([key, value]) => [key ? `${prefix}.${key}` : prefix, value]));
}

export function navErrors(nav: NavItem[]): Record<string, string> {
  const parsed = navSchema.safeParse(nav);
  return parsed.success ? {} : prefixed(issuesByPath(parsed.error.issues), "items");
}

export function footerErrors(footer: SiteFooter): Record<string, string> {
  const parsed = footerSchema.safeParse(footer);
  return parsed.success ? {} : issuesByPath(parsed.error.issues);
}

const FOOTER_FIELDS: FieldSpec[] = [
  { kind: "textarea", key: "text", label: "footerText", help: "footerText", max: 2000, rows: 4 },
  { kind: "boolean", key: "show_contacts", label: "footerContacts" },
  {
    kind: "list",
    key: "links",
    label: "footerLinks",
    max: 10,
    titleKeys: ["label", "url"],
    addLabel: "addFooterLink",
    newItem: () => ({ label: "", url: "" }),
    fields: [
      { kind: "text", key: "label", label: "linkLabel", max: 60 },
      { kind: "text", key: "url", label: "linkUrl", inputType: "url", max: 2048, placeholder: "linkUrl" },
    ],
  },
];

/** Menyen og bunnteksten gjelder alle sidene. Blokklenker i menyen peker til blokker på forsiden. */
export function NavigationPanel({
  nav,
  footer,
  homePageId,
  homeBlocks,
  blockLabel,
  onNavChange,
  onFooterChange,
  context,
}: {
  nav: NavItem[];
  footer: SiteFooter;
  homePageId: string;
  homeBlocks: Block[];
  blockLabel: (block: Block) => string;
  onNavChange: (nav: NavItem[]) => void;
  onFooterChange: (footer: SiteFooter) => void;
  context: FieldContext;
}) {
  const t = useTranslations("siteBuilder.editor.navigation");
  const navSpecs = useMemo<FieldSpec[]>(
    () => [
      {
        kind: "list",
        key: "items",
        label: "menuItems",
        help: "menu",
        max: 12,
        titleKeys: ["label"],
        addLabel: "addMenuItem",
        newItem: () => ({ id: newBlockId(), label: "", link: { type: "page", page_id: homePageId } }),
        fields: [
          { kind: "text", key: "label", label: "menuLabel", max: 60 },
          { kind: "link", key: "link", required: true },
        ],
      },
    ],
    [homePageId],
  );
  const homeContext = useMemo<FieldContext>(
    () => ({ ...context, blockOptions: homeBlocks.map((block) => ({ id: block.id, label: blockLabel(block) })) }),
    [context, homeBlocks, blockLabel],
  );
  return (
    <div className="grid gap-8">
      <section className="grid gap-3" aria-labelledby="site-menu-heading">
        <h3 id="site-menu-heading" className="font-semibold">
          {t("menuTitle")}
        </h3>
        <FieldContextProvider value={homeContext}>
          <FieldList specs={navSpecs} values={{ items: nav }} errors={navErrors(nav)} onChange={(values) => onNavChange(values.items as NavItem[])} />
        </FieldContextProvider>
      </section>
      <section className="grid gap-3" aria-labelledby="site-footer-heading">
        <h3 id="site-footer-heading" className="font-semibold">
          {t("footerTitle")}
        </h3>
        <FieldList
          specs={FOOTER_FIELDS}
          values={footer as unknown as Record<string, unknown>}
          errors={footerErrors(footer)}
          onChange={(values) => onFooterChange(values as unknown as SiteFooter)}
        />
      </section>
    </div>
  );
}

const LOGO_FIELDS: FieldSpec[] = [{ kind: "image", key: "logo_asset_id", label: "siteLogo", help: "siteLogo" }];

/** Tema for prosjektsiden. Det som ikke er satt, hentes fra merkevareprofilen. */
export function ThemePanel({
  theme,
  brand,
  orgSlug,
  canEditBrand,
  disabled,
  onChange,
}: {
  theme: ThemeOverrides;
  brand: ThemeOverrides;
  orgSlug: string;
  canEditBrand: boolean;
  disabled: boolean;
  onChange: (theme: ThemeOverrides) => void;
}) {
  const t = useTranslations("siteBuilder.editor.theme");
  const { logo_asset_id: logo, ...colors } = theme;
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        {t("intro")}{" "}
        {canEditBrand ? (
          <Link href={`/${orgSlug}/settings/brand`} className="font-medium text-foreground underline underline-offset-4">
            {t("editBrand")}
          </Link>
        ) : null}
      </p>
      <FieldList
        specs={LOGO_FIELDS}
        values={{ logo_asset_id: logo ?? null }}
        errors={{}}
        onChange={(values) => {
          const next: ThemeOverrides = { ...colors };
          if (typeof values.logo_asset_id === "string") {
            next.logo_asset_id = values.logo_asset_id;
          }
          onChange(next);
        }}
      />
      <ThemeFields
        value={colors}
        base={resolveTheme(brand, {})}
        disabled={disabled}
        inheritLabel={t("fromBrand")}
        onChange={(next) => onChange(logo ? { ...next, logo_asset_id: logo } : next)}
      />
    </div>
  );
}

const SEO_FIELDS: FieldSpec[] = [
  { kind: "textarea", key: "description", label: "siteDescription", help: "siteDescription", max: 300, rows: 3 },
  { kind: "image", key: "og_asset_id", label: "shareImage", help: "siteShareImage" },
];

/** Adresse, standardverdier for SEO og sletting av prosjektsiden. */
export function SettingsPanel({
  organizationId,
  siteId,
  subdomain,
  url,
  seoDefaults,
  disabled,
  onSeoDefaultsChange,
  onSubdomainChange,
}: {
  organizationId: string;
  siteId: string;
  subdomain: string;
  url: string;
  seoDefaults: SeoDefaults;
  disabled: boolean;
  onSeoDefaultsChange: (seoDefaults: SeoDefaults) => void;
  onSubdomainChange: (subdomain: string, url: string) => void;
}) {
  const t = useTranslations("siteBuilder.editor.settings");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const [value, setValue] = useState(subdomain);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const platformDomain = publicEnv().platformDomain;

  function saveSubdomain() {
    startTransition(async () => {
      const result = await updateSubdomain(organizationId, siteId, value);
      if (result.ok) {
        setError(null);
        setValue(result.data.subdomain);
        onSubdomainChange(result.data.subdomain, result.data.url);
        toast.success(t("addressSaved"));
      } else if (result.fieldErrors?.subdomain) {
        setError(result.fieldErrors.subdomain);
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteSite(organizationId, siteId);
      if (result.ok) {
        toast.success(t("deleted"));
        setConfirmDelete(false);
        router.refresh();
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-3" aria-labelledby="site-address-heading">
        <h3 id="site-address-heading" className="font-semibold">
          {t("addressTitle")}
        </h3>
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveSubdomain();
          }}
        >
          <Label htmlFor="site-subdomain">{t("subdomain")}</Label>
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-md border focus-within:ring-[3px] focus-within:ring-ring/50">
              <Input
                id="site-subdomain"
                value={value}
                maxLength={63}
                disabled={disabled}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(error)}
                aria-describedby="site-subdomain-help"
                className="min-w-0 border-0 shadow-none focus-visible:ring-0"
                onChange={(event) => setValue(event.target.value.toLowerCase())}
              />
              <span className="shrink-0 pr-3 text-sm text-muted-foreground">.{platformDomain}</span>
            </div>
            {!disabled ? (
              <Button type="submit" variant="outline" disabled={pending || value === subdomain}>
                {tCommon("save")}
              </Button>
            ) : null}
          </div>
          <p id="site-subdomain-help" className="text-sm text-muted-foreground">
            {t("subdomainHelp")}
          </p>
          {error ? <p className="text-sm text-destructive">{tValidation(error as "required")}</p> : null}
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 justify-self-start text-sm font-medium underline underline-offset-4">
            {url}
            <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
          </a>
        </form>
      </section>

      <section className="grid gap-3" aria-labelledby="site-seo-heading">
        <h3 id="site-seo-heading" className="font-semibold">
          {t("seoTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("seoIntro")}</p>
        <FieldList
          specs={SEO_FIELDS}
          values={seoDefaults as unknown as Record<string, unknown>}
          errors={{}}
          onChange={(values) => onSeoDefaultsChange(values as unknown as SeoDefaults)}
        />
      </section>

      {!disabled ? (
        <section className="grid gap-3 rounded-md border border-destructive/40 p-4" aria-labelledby="site-delete-heading">
          <h3 id="site-delete-heading" className="font-semibold text-destructive">
            {t("deleteTitle")}
          </h3>
          <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
          <Button type="button" variant="destructive" className="justify-self-start" onClick={() => setConfirmDelete(true)}>
            {t("delete")}
          </Button>
        </section>
      ) : null}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                remove();
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

