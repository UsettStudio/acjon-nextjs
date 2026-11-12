"use client";

import { KeyRoundIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { CopyButton } from "@/components/admin/copy-button";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createApiKey, revokeApiKey } from "@/features/integrations/actions";
import type { ApiKeyItem } from "@/features/integrations/queries";
import { API_KEY_EXPIRY_DAYS, API_KEY_SCOPES, type ApiKeyScope } from "@/features/integrations/schemas";
import { formatDate, formatDateTime } from "@/lib/format";

function CreateApiKeyDialog({ organizationId, disabled }: { organizationId: string; disabled: boolean }) {
  const t = useTranslations("integrations.keys");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const tErrors = useTranslations("errors");
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<ApiKeyScope[]>(["projects:read", "units:read"]);
  const [expiry, setExpiry] = useState<string>("never");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset(next: boolean) {
    setOpen(next);
    if (!next) {
      setName("");
      setScopes(["projects:read", "units:read"]);
      setExpiry("never");
      setError(null);
      setCreated(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <PlusIcon aria-hidden="true" />
          {t("create")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tCommon("close")}>
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("createdTitle")}</DialogTitle>
              <DialogDescription>{t("createdHelp")}</DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Input readOnly value={created} aria-label={t("keyLabel")} className="font-mono text-xs" onFocus={(event) => event.target.select()} />
              <CopyButton value={created} label={t("keyLabel")} />
            </div>
            <DialogFooter>
              <Button onClick={() => reset(false)}>{t("done")}</Button>
            </DialogFooter>
          </>
        ) : (
          <form
            className="grid gap-5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              startTransition(async () => {
                const result = await createApiKey({
                  organizationId,
                  name,
                  scopes,
                  expiresInDays: expiry === "never" ? null : (Number(expiry) as 30 | 90 | 365),
                });
                if (result.ok) {
                  setCreated(result.data.key);
                } else if (result.fieldErrors) {
                  setError(tValidation(Object.values(result.fieldErrors)[0] ?? "required"));
                } else {
                  setError(tErrors(result.error));
                }
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>{t("createTitle")}</DialogTitle>
              <DialogDescription>{t("createHelp")}</DialogDescription>
            </DialogHeader>
            <FormAlert message={error} />
            <div className="grid gap-2">
              <Label htmlFor={`${id}-name`}>{t("name")}</Label>
              <Input id={`${id}-name`} value={name} maxLength={200} placeholder={t("namePlaceholder")} onChange={(event) => setName(event.target.value)} />
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">{t("scopes")}</legend>
              {API_KEY_SCOPES.map((scope) => (
                <label key={scope} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4"
                    checked={scopes.includes(scope)}
                    onChange={(event) =>
                      setScopes((current) => (event.target.checked ? [...current, scope] : current.filter((item) => item !== scope)))
                    }
                  />
                  <span>
                    <code className="text-xs">{scope}</code> – {t(`scopeHelp.${scope.replace(":", "_") as "units_read"}`)}
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="grid gap-2">
              <Label htmlFor={`${id}-expiry`}>{t("expiry")}</Label>
              <select id={`${id}-expiry`} className="h-9 rounded-md border bg-background px-3 text-sm" value={expiry} onChange={(event) => setExpiry(event.target.value)}>
                <option value="never">{t("never")}</option>
                {API_KEY_EXPIRY_DAYS.map((days) => (
                  <option key={days} value={String(days)}>
                    {t("days", { days })}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => reset(false)}>
                {tCommon("cancel")}
              </Button>
              <SubmitButton pending={pending}>{t("createSubmit")}</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeysSection({
  organizationId,
  keys,
  readOnly,
}: {
  organizationId: string;
  keys: ApiKeyItem[];
  readOnly: boolean;
}) {
  const t = useTranslations("integrations.keys");
  const tErrors = useTranslations("errors");
  const [revoking, setRevoking] = useState<ApiKeyItem | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section aria-labelledby="api-keys-heading" className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid max-w-3xl gap-1">
          <h2 id="api-keys-heading" className="text-lg font-semibold">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <CreateApiKeyDialog organizationId={organizationId} disabled={readOnly} />
      </div>
      {keys.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("key")}</TableHead>
                <TableHead>{t("scopes")}</TableHead>
                <TableHead>{t("lastUsed")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>
                  <span className="sr-only">{t("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => {
                const state = key.state;
                return (
                  <TableRow key={key.id} data-api-key={key.name}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <KeyRoundIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        {key.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{key.prefix}…</TableCell>
                    <TableCell className="text-xs">{key.scopes.join(", ")}</TableCell>
                    <TableCell className="text-sm">{key.lastUsedAt ? formatDateTime(key.lastUsedAt) : t("neverUsed")}</TableCell>
                    <TableCell>
                      <Badge variant={state === "active" ? "secondary" : "outline"}>
                        {state === "active" && key.expiresAt ? t("activeUntil", { date: formatDate(key.expiresAt) }) : t(`states.${state}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {state === "active" ? (
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={readOnly || pending} onClick={() => setRevoking(key)}>
                          {t("revoke")}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <AlertDialog open={revoking !== null} onOpenChange={(open) => !open && setRevoking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revokeTitle", { name: revoking?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("revokeBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                const key = revoking;
                if (!key) {
                  return;
                }
                startTransition(async () => {
                  const result = await revokeApiKey({ organizationId, keyId: key.id });
                  setRevoking(null);
                  if (result.ok) {
                    toast.success(t("revoked", { name: key.name }));
                  } else {
                    toast.error(tErrors(result.error));
                  }
                });
              }}
            >
              {t("revoke")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
