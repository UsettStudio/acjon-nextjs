"use client";

import { LayoutTemplateIcon, LoaderCircleIcon, RocketIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSite } from "@/features/site-builder/actions";
import { COMING_SOON_BLOCKS, FULL_BLOCKS, TEMPLATE_KINDS, type TemplateKind } from "@/features/site-builder/templates";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

/** Første steg: velg mal og adresse. Siden opprettes som utkast. */
export function CreateSite({
  organizationId,
  projectId,
  defaultSubdomain,
  canEdit,
}: {
  organizationId: string;
  projectId: string;
  defaultSubdomain: string;
  canEdit: boolean;
}) {
  const t = useTranslations("siteBuilder.create");
  const tTypes = useTranslations("siteBuilder.blockTypes");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const id = useId();
  const [template, setTemplate] = useState<TemplateKind>("coming_soon");
  const [subdomain, setSubdomain] = useState(defaultSubdomain);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const platformDomain = publicEnv().platformDomain;

  if (!canEdit) {
    return (
      <div className="rounded-md border border-dashed px-6 py-12 text-center">
        <h2 className="text-lg font-semibold">{t("emptyTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("emptyReadOnly")}</p>
      </div>
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await createSite(organizationId, projectId, { template, subdomain });
      if (result.ok) {
        toast.success(t("created"));
        router.refresh();
        return;
      }
      if (result.fieldErrors?.subdomain) {
        setError(result.fieldErrors.subdomain);
        return;
      }
      toast.error(tErrors(result.error as "unknown"));
    });
  }

  return (
    <form
      className="mx-auto grid max-w-3xl gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <fieldset className="grid gap-3">
        <legend className="mb-2 font-medium">{t("template")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATE_KINDS.map((kind) => {
            const blocks = kind === "coming_soon" ? COMING_SOON_BLOCKS : FULL_BLOCKS;
            const Icon = kind === "coming_soon" ? RocketIcon : LayoutTemplateIcon;
            return (
              <label
                key={kind}
                className={cn(
                  "grid cursor-pointer gap-2 rounded-lg border p-4 outline-none has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
                  template === kind && "border-primary ring-2 ring-primary/30",
                )}
              >
                <span className="flex items-center gap-2">
                  <input type="radio" name={`${id}-template`} value={kind} checked={template === kind} onChange={() => setTemplate(kind)} className="size-4" />
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  <span className="font-medium">{t(`templates.${kind}.name`)}</span>
                </span>
                <span className="text-sm text-muted-foreground">{t(`templates.${kind}.description`)}</span>
                <span className="text-xs text-muted-foreground">{blocks.map((type) => tTypes(`${type}.name`)).join(" · ")}</span>
              </label>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">{t("templateHelp")}</p>
      </fieldset>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-subdomain`}>{t("subdomain")}</Label>
        <div className="flex max-w-xl items-center rounded-md border focus-within:ring-[3px] focus-within:ring-ring/50">
          <Input
            id={`${id}-subdomain`}
            value={subdomain}
            maxLength={63}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-subdomain-help`}
            className="min-w-0 border-0 shadow-none focus-visible:ring-0"
            onChange={(event) => {
              setSubdomain(event.target.value.toLowerCase());
              setError(null);
            }}
          />
          <span className="shrink-0 pr-3 text-sm text-muted-foreground">.{platformDomain}</span>
        </div>
        <p id={`${id}-subdomain-help`} className="text-sm text-muted-foreground">
          {t("subdomainHelp")}
        </p>
        {error ? <p className="text-sm text-destructive">{tValidation(error as "required")}</p> : null}
      </div>
      <Button type="submit" className="justify-self-start" disabled={pending}>
        {pending ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : null}
        {t("submit")}
      </Button>
    </form>
  );
}
