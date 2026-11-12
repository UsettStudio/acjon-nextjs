"use client";

import { CircleAlertIcon, CircleCheckIcon, LoaderCircleIcon, PlusIcon, SendIcon, WebhookIcon } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createWebhook,
  deleteWebhook,
  retryWebhookDelivery,
  sendTestWebhook,
  updateWebhook,
  webhookSecret,
} from "@/features/integrations/actions";
import type { WebhookItem } from "@/features/integrations/queries";
import { WEBHOOK_EVENTS, type WebhookEvent } from "@/features/integrations/schemas";
import type { DeliveryResult } from "@/features/integrations/webhook-sender";
import { formatDateTime } from "@/lib/format";

type Draft = { url: string; description: string; events: WebhookEvent[]; projectIds: string[]; isActive: boolean };

const EMPTY: Draft = { url: "", description: "", events: [...WEBHOOK_EVENTS], projectIds: [], isActive: true };

function SecretField({ secret }: { secret: string }) {
  const t = useTranslations("integrations.webhooks");
  return (
    <div className="grid gap-2">
      <Label>{t("secret")}</Label>
      <div className="flex items-center gap-2">
        <Input readOnly value={secret} aria-label={t("secret")} className="font-mono text-xs" onFocus={(event) => event.target.select()} />
        <CopyButton value={secret} label={t("secret")} />
      </div>
      <p className="text-xs text-muted-foreground">{t("secretHelp")}</p>
    </div>
  );
}

function WebhookDialog({
  organizationId,
  projects,
  webhook,
  open,
  onOpenChange,
}: {
  organizationId: string;
  projects: { id: string; name: string }[];
  webhook: WebhookItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("integrations.webhooks");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const tErrors = useTranslations("errors");
  const id = useId();
  const initial: Draft = webhook
    ? { url: webhook.url, description: webhook.description ?? "", events: webhook.events, projectIds: webhook.projectIds, isActive: webhook.isActive }
    : EMPTY;
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setDraft(initial);
      setError(null);
      setCreatedSecret(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-lg">
        {createdSecret ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("createdTitle")}</DialogTitle>
              <DialogDescription>{t("createdHelp")}</DialogDescription>
            </DialogHeader>
            <SecretField secret={createdSecret} />
            <DialogFooter>
              <Button onClick={() => close(false)}>{t("done")}</Button>
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
                const result = webhook
                  ? await updateWebhook({ organizationId, webhookId: webhook.id, ...draft })
                  : await createWebhook({ organizationId, ...draft });
                if (result.ok) {
                  if (result.data && "secret" in result.data) {
                    setCreatedSecret(result.data.secret);
                  } else {
                    toast.success(t("saved"));
                    close(false);
                  }
                } else if (result.fieldErrors) {
                  setError(tValidation(Object.values(result.fieldErrors)[0] ?? "required"));
                } else {
                  setError(tErrors(result.error === "privateUrl" ? "invalidInput" : result.error));
                }
              });
            }}
          >
            <DialogHeader>
              <DialogTitle>{webhook ? t("editTitle") : t("createTitle")}</DialogTitle>
              <DialogDescription>{t("createHelp")}</DialogDescription>
            </DialogHeader>
            <FormAlert message={error} />
            <div className="grid gap-2">
              <Label htmlFor={`${id}-url`}>{t("url")}</Label>
              <Input
                id={`${id}-url`}
                type="url"
                inputMode="url"
                placeholder="https://"
                value={draft.url}
                onChange={(event) => setDraft({ ...draft, url: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${id}-description`}>{t("descriptionLabel")}</Label>
              <Textarea
                id={`${id}-description`}
                rows={2}
                maxLength={500}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </div>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">{t("events")}</legend>
              {WEBHOOK_EVENTS.map((event) => (
                <label key={event} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4"
                    checked={draft.events.includes(event)}
                    onChange={(change) =>
                      setDraft({
                        ...draft,
                        events: change.target.checked ? [...draft.events, event] : draft.events.filter((item) => item !== event),
                      })
                    }
                  />
                  <span>
                    <code className="text-xs">{event}</code> – {t(`eventHelp.${event === "lead.created" ? "lead_created" : "unit_status_changed"}`)}
                  </span>
                </label>
              ))}
            </fieldset>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">{t("projects")}</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={draft.projectIds.length === 0}
                  onChange={(change) => setDraft({ ...draft, projectIds: change.target.checked ? [] : projects.slice(0, 1).map((project) => project.id) })}
                />
                {t("allProjects")}
              </label>
              {draft.projectIds.length > 0
                ? projects.map((project) => (
                    <label key={project.id} className="flex items-center gap-2 pl-6 text-sm">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={draft.projectIds.includes(project.id)}
                        onChange={(change) =>
                          setDraft({
                            ...draft,
                            projectIds: change.target.checked
                              ? [...draft.projectIds, project.id]
                              : draft.projectIds.filter((item) => item !== project.id),
                          })
                        }
                      />
                      {project.name}
                    </label>
                  ))
                : null}
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4" checked={draft.isActive} onChange={(change) => setDraft({ ...draft, isActive: change.target.checked })} />
              {t("active")}
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                {tCommon("cancel")}
              </Button>
              <SubmitButton pending={pending}>{webhook ? tCommon("save") : t("createSubmit")}</SubmitButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function resultToast(t: (key: "testOk" | "testFailed", values: { status: string; error: string }) => string, result: DeliveryResult) {
  if (result.succeeded) {
    toast.success(t("testOk", { status: String(result.status ?? ""), error: "" }));
  } else {
    toast.error(t("testFailed", { status: String(result.status ?? "–"), error: result.error ?? "" }));
  }
}

function WebhookCard({
  organizationId,
  webhook,
  projects,
  readOnly,
}: {
  organizationId: string;
  webhook: WebhookItem;
  projects: { id: string; name: string }[];
  readOnly: boolean;
}) {
  const t = useTranslations("integrations.webhooks");
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const projectNames = webhook.projectIds.map((id) => projects.find((project) => project.id === id)?.name).filter(Boolean);

  function run<T>(key: string, task: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>, done: (data: T) => void) {
    setBusy(key);
    startTransition(async () => {
      const result = await task();
      setBusy(null);
      if (result.ok) {
        done(result.data);
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  return (
    <li className="grid gap-3 rounded-lg border p-4" data-webhook={webhook.url}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <WebhookIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="font-mono text-sm break-all">{webhook.url}</h3>
        <Badge variant={webhook.isActive ? "secondary" : "outline"}>{webhook.isActive ? t("isActive") : t("inactive")}</Badge>
        {webhook.failureCount > 0 ? <Badge variant="destructive">{t("failures", { count: webhook.failureCount })}</Badge> : null}
      </div>
      {webhook.description ? <p className="text-sm text-muted-foreground">{webhook.description}</p> : null}
      <p className="text-sm">
        {webhook.events.join(", ")} · {projectNames.length > 0 ? projectNames.join(", ") : t("allProjects")}
      </p>
      <p className="text-xs text-muted-foreground">
        {webhook.lastSuccessAt ? t("lastSuccess", { time: formatDateTime(webhook.lastSuccessAt) }) : t("noSuccess")}
        {webhook.lastFailureAt ? ` · ${t("lastFailure", { time: formatDateTime(webhook.lastFailureAt) })}` : ""}
      </p>
      {secret ? <SecretField secret={secret} /> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={readOnly || pending}
          onClick={() => run("test", () => sendTestWebhook({ organizationId, webhookId: webhook.id }), (result) => resultToast(t, result))}
        >
          {busy === "test" ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : <SendIcon aria-hidden="true" />}
          {t("sendTest")}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={readOnly || pending} onClick={() => setEditing(true)}>
          {t("edit")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => run("secret", () => webhookSecret({ organizationId, webhookId: webhook.id, rotate: false }), (data) => setSecret(data.secret))}
        >
          {t("showSecret")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={readOnly || pending}
          onClick={() =>
            run("rotate", () => webhookSecret({ organizationId, webhookId: webhook.id, rotate: true }), (data) => {
              setSecret(data.secret);
              toast.success(t("rotated"));
            })
          }
        >
          {t("rotateSecret")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={readOnly || pending}
          onClick={() => setConfirmDelete(true)}
        >
          {t("delete")}
        </Button>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground">{t("deliveries", { count: webhook.deliveries.length })}</summary>
        {webhook.deliveries.length === 0 ? (
          <p className="mt-2 text-muted-foreground">{t("noDeliveries")}</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {webhook.deliveries.map((delivery) => (
              <li key={delivery.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2" data-delivery-status={delivery.status}>
                {delivery.status === "succeeded" ? (
                  <CircleCheckIcon className="size-4 text-emerald-600" aria-hidden="true" />
                ) : (
                  <CircleAlertIcon className={delivery.status === "failed" ? "size-4 text-destructive" : "size-4 text-amber-600"} aria-hidden="true" />
                )}
                <code className="text-xs">{delivery.event}</code>
                <span className="text-xs text-muted-foreground">{formatDateTime(delivery.createdAt)}</span>
                <span className="text-xs">{t(`deliveryStatus.${delivery.status}`)}</span>
                <span className="text-xs text-muted-foreground">{t("attempts", { count: delivery.attempts })}</span>
                {delivery.responseStatus ? <span className="text-xs">HTTP {delivery.responseStatus}</span> : null}
                {delivery.error ? <span className="basis-full text-xs text-muted-foreground">{delivery.error}</span> : null}
                {delivery.status === "failed" ? (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    disabled={readOnly || pending}
                    onClick={() => run(delivery.id, () => retryWebhookDelivery({ organizationId, deliveryId: delivery.id }), (result) => resultToast(t, result))}
                  >
                    {t("retry")}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </details>

      <WebhookDialog
        key={editing ? "open" : "closed"}
        organizationId={organizationId}
        projects={projects}
        webhook={webhook}
        open={editing}
        onOpenChange={setEditing}
      />
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteBody", { url: webhook.url })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                setConfirmDelete(false);
                run("delete", () => deleteWebhook({ organizationId, webhookId: webhook.id }), () => toast.success(t("deleted")));
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

export function WebhooksSection({
  organizationId,
  webhooks,
  projects,
  readOnly,
  canCreate,
}: {
  organizationId: string;
  webhooks: WebhookItem[];
  projects: { id: string; name: string }[];
  readOnly: boolean;
  /** Pakken har webhooks. Webhooks som finnes, kan endres og slettes uansett. */
  canCreate: boolean;
}) {
  const t = useTranslations("integrations.webhooks");
  const [creating, setCreating] = useState(false);
  return (
    <section aria-labelledby="webhooks-heading" className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid max-w-3xl gap-1">
          <h2 id="webhooks-heading" className="text-lg font-semibold">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button disabled={readOnly || !canCreate} onClick={() => setCreating(true)}>
          <PlusIcon aria-hidden="true" />
          {t("create")}
        </Button>
      </div>
      {webhooks.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-3">
          {webhooks.map((webhook) => (
            <WebhookCard key={webhook.id} organizationId={organizationId} webhook={webhook} projects={projects} readOnly={readOnly} />
          ))}
        </ul>
      )}
      <WebhookDialog
        key={creating ? "open" : "closed"}
        organizationId={organizationId}
        projects={projects}
        webhook={null}
        open={creating}
        onOpenChange={setCreating}
      />
    </section>
  );
}
