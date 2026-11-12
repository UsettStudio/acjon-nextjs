"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { createSelector, deleteSelector } from "@/features/selector/actions";
import { selectorNameSchema } from "@/features/selector/schemas";

const createSchema = z.object({ name: selectorNameSchema });

/** Ny boligvelger. Editoren åpnes med en gang, der første visning legges til. */
export function CreateSelectorButton({
  organizationId,
  projectId,
  basePath,
  defaultName,
}: {
  organizationId: string;
  projectId: string;
  basePath: string;
  defaultName: string;
}) {
  const t = useTranslations("selector.list");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<z.input<typeof createSchema>, unknown, z.output<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: defaultName },
  });
  const { formError, setFormError, apply } = useActionErrors(form);

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createSelector(organizationId, projectId, values);
      if (result.ok) {
        // Lukk dialogen først. Next.js beholder forrige side skjult, og en åpen dialog der ville blitt liggende.
        setOpen(false);
        router.push(`${basePath}/${result.data.id}`);
      } else {
        apply(result);
      }
    });
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          form.reset({ name: defaultName });
          setFormError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <PlusIcon aria-hidden="true" />
          {t("create")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormAlert message={formError} />
          <Field name="selector-name" label={t("name")} error={validation(form.formState.errors.name?.message)}>
            {(field) => <Input {...field} autoFocus {...form.register("name")} />}
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <SubmitButton pending={pending}>{t("createSubmit")}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteSelectorButton({ organizationId, selectorId, name }: { organizationId: string; selectorId: string; name: string }) {
  const t = useTranslations("selector.list");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2Icon aria-hidden="true" />
          {t("delete")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle", { name })}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await deleteSelector(organizationId, selectorId);
                if (result.ok) {
                  toast.success(t("deleted", { name }));
                  setOpen(false);
                } else {
                  toast.error(tErrors(result.error as "unknown"));
                }
              });
            }}
          >
            {t("deleteConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
