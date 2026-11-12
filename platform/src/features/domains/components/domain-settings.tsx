"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  GlobeIcon,
  LoaderCircleIcon,
  PlusIcon,
  RefreshCwIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CopyButton } from "@/components/admin/copy-button";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionErrors, useValidationMessage } from "@/components/forms/use-action-errors";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { addDomain, checkDomainNow, removeDomain, setPrimaryDomain } from "@/features/domains/actions";
import type { DomainItem, DomainSite } from "@/features/domains/queries";
import type { DomainRecord, DomainStatus } from "@/features/domains/records";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<DomainStatus, string> = {
  verified: "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  pending: "border-amber-600/30 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  misconfigured: "border-amber-600/30 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  error: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function DomainStatusBadge({ status }: { status: DomainStatus }) {
  const t = useTranslations("domains.statuses");
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status])}>
      {t(status)}
    </Badge>
  );
}

const addDomainSchema = z.object({
  siteId: z.string().min(1, "required"),
  hostname: z.string().trim().min(1, "required").max(300, "textTooLong"),
});
type AddDomainInput = z.infer<typeof addDomainSchema>;

function AddDomainDialog({
  organizationId,
  sites,
  disabled,
  domainLimit,
}: {
  organizationId: string;
  sites: DomainSite[];
  disabled: boolean;
  /** Egne domener per prosjektside i pakken. */
  domainLimit: number;
}) {
  const t = useTranslations("domains.add");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const defaults = { siteId: sites.length === 1 ? (sites[0]?.id ?? "") : "", hostname: "" };
  const form = useForm<AddDomainInput>({ resolver: zodResolver(addDomainSchema), defaultValues: defaults });
  const { formError, setFormError, apply } = useActionErrors(form, (code) =>
    code === "domainExists" ? t("exists") : code === "domainLimit" ? t("limit", { count: domainLimit }) : undefined,
  );
  const { errors } = form.formState;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(defaults);
      setFormError(null);
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await addDomain({ organizationId, siteId: values.siteId, hostname: values.hostname });
      if (result.ok) {
        toast.success(result.data.status === "verified" ? t("addedVerified") : t("added"));
        onOpenChange(false);
      } else {
        apply(result);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled || sites.length === 0}>
          <PlusIcon aria-hidden="true" />
          {t("open")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tCommon("close")}>
        <form onSubmit={onSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <FormAlert message={formError} />
          <Controller
            control={form.control}
            name="siteId"
            render={({ field }) => (
              <Field name="domain-site" label={t("site")} error={validation(errors.siteId?.message)}>
                {(control) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger {...control} className="w-full">
                      <SelectValue placeholder={t("sitePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.projectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            )}
          />
          <Field
            name="domain-hostname"
            label={t("hostname")}
            description={t("hostnameHelp")}
            error={validation(errors.hostname?.message)}
          >
            {(control) => (
              <Input
                {...control}
                autoComplete="off"
                spellCheck={false}
                inputMode="url"
                placeholder="www.fjordparken.no"
                {...form.register("hostname")}
              />
            )}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordStateIcon({ ok, checked }: { ok: boolean; checked: boolean }) {
  const t = useTranslations("domains.records");
  if (!checked) {
    return (
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <CircleDashedIcon className="size-4" aria-hidden="true" />
        {t("notChecked")}
      </span>
    );
  }
  return ok ? (
    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
      <CircleCheckIcon className="size-4" aria-hidden="true" />
      {t("found")}
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
      <CircleAlertIcon className="size-4" aria-hidden="true" />
      {t("missing")}
    </span>
  );
}

function DnsRecordsTable({ records, checked }: { records: DomainRecord[]; checked: boolean }) {
  const t = useTranslations("domains.records");
  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">{t("help")}</p>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("value")}</TableHead>
              <TableHead>{t("purpose")}</TableHead>
              <TableHead>{t("state")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={`${record.type}-${record.name}-${record.value}`}>
                <TableCell className="font-mono text-xs">{record.type}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <code className="text-xs break-all">{record.name}</code>
                    <CopyButton value={record.name} label={t("nameLabel", { type: record.type })} />
                  </span>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <code className="text-xs break-all">{record.value}</code>
                    <CopyButton value={record.value} label={t("valueLabel", { type: record.type })} />
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{t(`purposes.${record.purpose}`)}</TableCell>
                <TableCell className="text-sm">
                  <RecordStateIcon ok={record.ok} checked={checked} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DomainCard({
  organizationId,
  domain,
  readOnly,
}: {
  organizationId: string;
  domain: DomainItem;
  readOnly: boolean;
}) {
  const t = useTranslations("domains");
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"check" | "primary" | "remove" | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const verified = domain.status === "verified";

  function run(kind: "check" | "primary" | "remove", task: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    setAction(kind);
    startTransition(async () => {
      const result = await task();
      setAction(null);
      if (!result.ok) {
        toast.error(tErrors((result.error ?? "unknown") as "unknown"));
      } else if (success) {
        toast.success(success);
      }
    });
  }

  return (
    <li className="grid gap-4 rounded-lg border p-4" data-domain={domain.hostname}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <GlobeIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <h4 className="font-medium break-all">{domain.hostname}</h4>
        <DomainStatusBadge status={domain.status} />
        {domain.isPrimary ? (
          <Badge variant="secondary">
            <StarIcon aria-hidden="true" />
            {t("primary")}
          </Badge>
        ) : null}
        <span className="text-sm text-muted-foreground">
          {domain.lastCheckedAt ? t("lastChecked", { time: formatDateTime(domain.lastCheckedAt) }) : t("notChecked")}
        </span>
      </div>

      {domain.error ? (
        <Alert variant={verified ? "default" : "destructive"}>
          <CircleAlertIcon aria-hidden="true" />
          <AlertDescription className={verified ? "text-foreground" : undefined}>
            {verified ? t("warning", { message: t(`errors.${domain.error}`) }) : t(`errors.${domain.error}`)}
          </AlertDescription>
        </Alert>
      ) : null}

      {verified ? (
        <>
          <p className="text-sm text-muted-foreground">{domain.isPrimary ? t("verifiedPrimaryHelp") : t("verifiedHelp")}</p>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">{t("showRecords")}</summary>
            <div className="mt-3">
              <DnsRecordsTable records={domain.records} checked={domain.lastCheckedAt !== null} />
            </div>
          </details>
        </>
      ) : (
        <DnsRecordsTable records={domain.records} checked={domain.lastCheckedAt !== null} />
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={readOnly || pending}
          onClick={() => run("check", () => checkDomainNow({ organizationId, domainId: domain.id }))}
        >
          {action === "check" ? (
            <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCwIcon aria-hidden="true" />
          )}
          {t("check")}
        </Button>
        {verified && !domain.isPrimary ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={readOnly || pending}
            onClick={() =>
              run(
                "primary",
                () => setPrimaryDomain({ organizationId, siteId: domain.siteId, domainId: domain.id }),
                t("primarySet", { hostname: domain.hostname }),
              )
            }
          >
            <StarIcon aria-hidden="true" />
            {t("makePrimary")}
          </Button>
        ) : null}
        {domain.isPrimary ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={readOnly || pending}
            onClick={() =>
              run("primary", () => setPrimaryDomain({ organizationId, siteId: domain.siteId, domainId: null }), t("primaryCleared"))
            }
          >
            {t("clearPrimary")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={readOnly || pending}
          onClick={() => setConfirmRemove(true)}
        >
          <Trash2Icon aria-hidden="true" />
          {t("remove")}
        </Button>
      </div>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle", { hostname: domain.hostname })}</AlertDialogTitle>
            <AlertDialogDescription>{verified ? t("removeVerifiedBody") : t("removeBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                setConfirmRemove(false);
                run("remove", () => removeDomain({ organizationId, domainId: domain.id }), t("removed", { hostname: domain.hostname }));
              }}
            >
              {t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

/**
 * Innstillinger → Domener. Domener som venter på DNS, sjekkes av en planlagt
 * jobb; siden lastes inn på nytt hvert minutt så lenge noe venter.
 */
export function DomainSettings({
  organizationId,
  sites,
  platformDomain,
  vercelConnected,
  readOnly,
  domainLimit,
}: {
  organizationId: string;
  sites: DomainSite[];
  platformDomain: string;
  vercelConnected: boolean;
  readOnly: boolean;
  /** Egne domener per prosjektside i pakken (lib/billing/plans.ts). */
  domainLimit: number;
}) {
  const t = useTranslations("domains");
  const router = useRouter();
  const waiting = sites.some((site) => site.domains.some((domain) => domain.status !== "verified"));

  useEffect(() => {
    if (!waiting) {
      return;
    }
    const timer = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(timer);
  }, [waiting, router]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid max-w-3xl gap-1.5">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <p className="text-sm text-muted-foreground">{t("planLimit", { count: domainLimit })}</p>
        </div>
        <AddDomainDialog organizationId={organizationId} sites={sites} disabled={readOnly} domainLimit={domainLimit} />
      </div>

      {vercelConnected ? null : (
        <Alert>
          <CircleAlertIcon aria-hidden="true" />
          <AlertDescription className="text-foreground">{t("vercelMissing")}</AlertDescription>
        </Alert>
      )}

      {sites.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">{t("noSites")}</p>
      ) : (
        sites.map((site) => (
          <section key={site.id} aria-labelledby={`domener-${site.id}`} className="grid gap-3">
            <div className="grid gap-0.5">
              <h3 id={`domener-${site.id}`} className="font-medium">
                {site.projectName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("subdomain", { address: `${site.subdomain}.${platformDomain}` })}
                {site.published ? null : ` ${t("unpublished")}`}
              </p>
            </div>
            {site.domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noDomains")}</p>
            ) : (
              <ul className="grid gap-3">
                {site.domains.map((domain) => (
                  <DomainCard key={domain.id} organizationId={organizationId} domain={domain} readOnly={readOnly} />
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
