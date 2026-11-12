"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteLead, deleteLeadsByEmail, updateLead } from "@/features/leads/actions";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/schemas";
import { cn } from "@/lib/utils";

/** Status og internt notat for en henvendelse, og sletting. */
export function LeadDetailForm({
  organizationId,
  orgSlug,
  leadId,
  email,
  sameEmailCount,
  initialStatus,
  initialNote,
  canEdit,
  canDelete,
}: {
  organizationId: string;
  orgSlug: string;
  leadId: string;
  email: string;
  sameEmailCount: number;
  initialStatus: LeadStatus;
  initialNote: string | null;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const t = useTranslations("leads.detail");
  const tStatuses = useTranslations("leads.statuses");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const id = useId();
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [note, setNote] = useState(initialNote ?? "");
  const [saved, setSaved] = useState({ status: initialStatus, note: initialNote ?? "" });
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"one" | "all" | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = status !== saved.status || note.trim() !== saved.note.trim();

  function save() {
    startTransition(async () => {
      const result = await updateLead(organizationId, leadId, { status, internalNote: note });
      if (result.ok) {
        setSaved({ status, note });
        setError(null);
        toast.success(t("saved"));
        router.refresh();
      } else if (result.fieldErrors?.internalNote) {
        setError(result.fieldErrors.internalNote);
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  function remove(kind: "one" | "all") {
    startTransition(async () => {
      if (kind === "one") {
        const result = await deleteLead(organizationId, leadId);
        if (!result.ok) {
          toast.error(tErrors(result.error as "unknown"));
          return;
        }
        toast.success(t("deleted"));
      } else {
        const result = await deleteLeadsByEmail(organizationId, email);
        if (!result.ok) {
          toast.error(tErrors(result.error as "unknown"));
          return;
        }
        toast.success(t("deletedAll", { count: result.data.deleted }));
      }
      setConfirm(null);
      router.push(`/${orgSlug}/leads`);
    });
  }

  return (
    <div className="grid gap-6">
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <fieldset className="grid gap-2" disabled={!canEdit}>
          <legend className="mb-1 text-sm font-medium">{t("status")}</legend>
          <div className="flex flex-wrap gap-2">
            {LEAD_STATUSES.map((option) => (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
                  status === option && "border-primary bg-primary/5 font-medium",
                )}
              >
                <input type="radio" name={`${id}-status`} value={option} checked={status === option} onChange={() => setStatus(option)} className="size-4" />
                {tStatuses(option)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-note`}>{t("note")}</Label>
          <Textarea
            id={`${id}-note`}
            rows={5}
            maxLength={5000}
            value={note}
            disabled={!canEdit}
            aria-invalid={Boolean(error)}
            aria-describedby={`${id}-note-help`}
            onChange={(event) => setNote(event.target.value)}
          />
          <p id={`${id}-note-help`} className="text-sm text-muted-foreground">
            {t("noteHelp")}
          </p>
          {error ? <p className="text-sm text-destructive">{tValidation(error as "required")}</p> : null}
        </div>
        {canEdit ? (
          <Button type="submit" className="justify-self-start" disabled={pending || !dirty}>
            {pending ? tCommon("saving") : tCommon("save")}
          </Button>
        ) : null}
      </form>

      {canDelete ? (
        <section className="grid gap-3 rounded-md border border-destructive/40 p-4" aria-labelledby={`${id}-delete`}>
          <h2 id={`${id}-delete`} className="font-semibold text-destructive">
            {t("deleteTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("deleteDescription")}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="destructive" onClick={() => setConfirm("one")}>
              <Trash2Icon aria-hidden="true" />
              {t("delete")}
            </Button>
            {sameEmailCount > 0 ? (
              <Button type="button" variant="outline" className="text-destructive" onClick={() => setConfirm("all")}>
                {t("deleteAll", { count: sameEmailCount + 1, email })}
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      <AlertDialog open={confirm !== null} onOpenChange={(open) => (open ? undefined : setConfirm(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm === "all" ? t("deleteAllTitle", { email }) : t("deleteOneTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "all" ? t("deleteAllDescription", { count: sameEmailCount + 1 }) : t("deleteOneDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                if (confirm) {
                  remove(confirm);
                }
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
