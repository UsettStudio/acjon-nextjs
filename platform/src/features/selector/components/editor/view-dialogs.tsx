"use client";

/* eslint-disable @next/next/no-img-element -- Forhåndsvisningen er en ferdig WebP-variant fra Storage. */

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MediaAsset } from "@/features/media/assets";
import { AssetPicker } from "@/features/media/components/asset-picker";
import { createView, deleteView, replaceViewImage, updateView } from "@/features/selector/actions";
import type { EditorView } from "@/features/selector/queries";
import { VIEW_KINDS, viewInputSchema } from "@/features/selector/schemas";
import { descendantIds, flattenViews } from "@/features/selector/views";

const NO_PARENT = "__none__";

type ViewFormValues = z.input<typeof viewInputSchema>;

/** Om to bilder har ulikt format (bredde/høyde), med litt slingringsmonn for avrunding. */
export function aspectDiffers(a: { width: number; height: number }, b: { width: number; height: number }): boolean {
  return Math.abs(a.width / a.height - b.width / b.height) / (a.width / a.height) > 0.02;
}

function useSelectorErrorText() {
  const t = useTranslations("selector.errors");
  return (code: string) =>
    code === "needsView" || code === "invalidTarget" || code === "viewCycle" || code === "imageNotReady" ? t(code) : undefined;
}

/** Ny visning, eller endring av navn, type, forelder og vinkelgruppe. */
export function ViewFormDialog({
  open,
  onOpenChange,
  organizationId,
  projectId,
  selectorId,
  views,
  view,
  defaultParentId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  projectId: string;
  selectorId: string;
  views: EditorView[];
  /** Visningen som endres. Mangler når en ny visning lages. */
  view: EditorView | null;
  defaultParentId: string | null;
  onSaved: (view: EditorView, created: boolean) => void;
}) {
  const t = useTranslations("selector.viewForm");
  const tCommon = useTranslations("common");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{view ? t("editTitle", { name: view.name }) : t("createTitle")}</DialogTitle>
          <DialogDescription>{view ? t("editDescription") : t("createDescription")}</DialogDescription>
        </DialogHeader>
        {open ? (
          <ViewForm
            organizationId={organizationId}
            projectId={projectId}
            selectorId={selectorId}
            views={views}
            view={view}
            defaultParentId={defaultParentId}
            onCancel={() => onOpenChange(false)}
            onSaved={(saved, created) => {
              onSaved(saved, created);
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ViewForm({
  organizationId,
  projectId,
  selectorId,
  views,
  view,
  defaultParentId,
  onCancel,
  onSaved,
}: {
  organizationId: string;
  projectId: string;
  selectorId: string;
  views: EditorView[];
  view: EditorView | null;
  defaultParentId: string | null;
  onCancel: () => void;
  onSaved: (view: EditorView, created: boolean) => void;
}) {
  const t = useTranslations("selector.viewForm");
  const tKinds = useTranslations("selector.views.kinds");
  const tCommon = useTranslations("common");
  const validation = useValidationMessage();
  const specificError = useSelectorErrorText();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [image, setImage] = useState<MediaAsset | null>(null);
  const [imageError, setImageError] = useState(false);
  const form = useForm<ViewFormValues, unknown, z.output<typeof viewInputSchema>>({
    resolver: zodResolver(viewInputSchema),
    defaultValues: {
      name: view?.name ?? "",
      kind: view?.kind ?? (views.length === 0 ? "overview" : "facade"),
      parentViewId: view ? view.parentViewId : defaultParentId,
      angleGroup: view?.angleGroup ?? "",
    },
  });
  const { formError, setFormError, apply } = useActionErrors(form, specificError);
  const { errors } = form.formState;

  // En visning kan ikke ligge under seg selv eller noe som ligger under den.
  const blocked = view ? new Set([view.id, ...descendantIds(views, view.id)]) : new Set<string>();
  const parentOptions = flattenViews(views).filter((item) => !blocked.has(item.view.id));
  const angleGroups = [...new Set(views.flatMap((item) => (item.angleGroup ? [item.angleGroup] : [])))];

  const onSubmit = form.handleSubmit(() => {
    setFormError(null);
    if (!view && !image) {
      setImageError(true);
      return;
    }
    const values = form.getValues();
    startTransition(async () => {
      const result = view
        ? await updateView(organizationId, view.id, values)
        : await createView(organizationId, selectorId, { ...values, assetId: image?.id ?? "" });
      if (result.ok) {
        onSaved(result.data, !view);
      } else {
        apply(result);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormAlert message={formError} />
      <Field name="view-name" label={t("name")} error={validation(errors.name?.message)}>
        {(field) => <Input {...field} autoFocus placeholder={t("namePlaceholder")} {...form.register("name")} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="view-kind" label={t("kind")} error={validation(errors.kind?.message)}>
          {(field) => (
            <Controller
              control={form.control}
              name="kind"
              render={({ field: control }) => (
                <Select value={control.value} onValueChange={control.onChange}>
                  <SelectTrigger {...field} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIEW_KINDS.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {tKinds(kind)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </Field>
        <Field name="view-parent" label={t("parent")} error={validation(errors.parentViewId?.message)}>
          {(field) => (
            <Controller
              control={form.control}
              name="parentViewId"
              render={({ field: control }) => (
                <Select value={control.value ?? NO_PARENT} onValueChange={(value) => control.onChange(value === NO_PARENT ? null : value)}>
                  <SelectTrigger {...field} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PARENT}>{t("noParent")}</SelectItem>
                    {parentOptions.map((item) => (
                      <SelectItem key={item.view.id} value={item.view.id}>
                        {`${"– ".repeat(item.depth)}${item.view.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
        </Field>
      </div>
      <Field name="view-angle" label={t("angleGroup")} description={t("angleGroupHelp")} error={validation(errors.angleGroup?.message)}>
        {(field) => (
          <>
            <Input {...field} list={`${id}-angles`} maxLength={100} {...form.register("angleGroup")} />
            <datalist id={`${id}-angles`}>
              {angleGroups.map((group) => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </>
        )}
      </Field>
      {!view ? (
        <div className="grid gap-2">
          <p className="text-sm font-medium" id={`${id}-image`}>
            {t("image")}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
              {image?.thumbnailUrl ? (
                <img src={image.thumbnailUrl} alt="" className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" aria-hidden="true" />
              )}
            </span>
            <Button type="button" variant="outline" aria-describedby={`${id}-image`} onClick={() => setPickerOpen(true)}>
              {image ? t("changeImage") : t("pickImage")}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{t("imageHelp")}</p>
          {imageError && !image ? <p className="text-sm text-destructive">{t("imageRequired")}</p> : null}
          <AssetPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            organizationId={organizationId}
            projectId={projectId}
            kind="image"
            title={t("pickImage")}
            alreadySelected={[]}
            max={1}
            onPick={(assets) => {
              const picked = assets[0] ?? null;
              if (picked && picked.status !== "ready") {
                toast.error(t("imageNotReady"));
                return;
              }
              setImage(picked);
              if (picked && !form.getValues("name")) {
                form.setValue("name", (picked.filename ?? "").replace(/\.[a-z0-9]+$/i, "").slice(0, 200));
              }
            }}
          />
        </div>
      ) : null}
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <SubmitButton pending={pending}>{view ? tCommon("save") : t("create")}</SubmitButton>
      </DialogFooter>
    </form>
  );
}

/** Bytt bilde. Advarer hvis det nye bildet har et annet format, fordi markeringene da kan havne feil. */
export function ReplaceImageFlow({
  organizationId,
  projectId,
  view,
  shapeCount,
  onClose,
  onReplaced,
}: {
  organizationId: string;
  projectId: string;
  view: EditorView | null;
  /** Antall markeringer i visningen. Uten markeringer er formatet likegyldig. */
  shapeCount: number;
  onClose: () => void;
  onReplaced: (view: EditorView) => void;
}) {
  const t = useTranslations("selector.replaceImage");
  const tCommon = useTranslations("common");
  const specificError = useSelectorErrorText();
  const tErrors = useTranslations("errors");
  const [candidate, setCandidate] = useState<MediaAsset | null>(null);
  const [pending, startTransition] = useTransition();

  function replace(asset: MediaAsset) {
    if (!view) {
      return;
    }
    startTransition(async () => {
      const result = await replaceViewImage(organizationId, view.id, asset.id);
      if (result.ok) {
        toast.success(t("done"));
        onReplaced(result.data);
        setCandidate(null);
        onClose();
      } else {
        toast.error(specificError(result.error) ?? tErrors(result.error as "unknown"));
      }
    });
  }

  function onPick(assets: MediaAsset[]) {
    const asset = assets[0];
    if (!asset || !view) {
      return;
    }
    if (asset.status !== "ready" || !asset.width || !asset.height) {
      toast.error(t("notReady"));
      return;
    }
    if (
      shapeCount > 0 &&
      view.imageWidth &&
      view.imageHeight &&
      aspectDiffers({ width: view.imageWidth, height: view.imageHeight }, { width: asset.width, height: asset.height })
    ) {
      setCandidate(asset);
      return;
    }
    replace(asset);
  }

  const ratio = (width: number | null, height: number | null) =>
    width && height ? `${width} × ${height}` : "–";

  return (
    <>
      <AssetPicker
        open={view !== null && candidate === null}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        organizationId={organizationId}
        projectId={projectId}
        kind="image"
        title={view ? t("title", { name: view.name }) : ""}
        alreadySelected={view?.asset ? [view.asset.id] : []}
        max={1}
        onPick={onPick}
      />
      <AlertDialog
        open={candidate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCandidate(null);
            onClose();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("aspectTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("aspectDescription", {
                before: ratio(view?.imageWidth ?? null, view?.imageHeight ?? null),
                after: ratio(candidate?.width ?? null, candidate?.height ?? null),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                if (candidate) {
                  replace(candidate);
                }
              }}
            >
              {t("aspectConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function DeleteViewDialog({
  organizationId,
  view,
  hasChildren,
  onClose,
  onDeleted,
}: {
  organizationId: string;
  view: EditorView | null;
  hasChildren: boolean;
  onClose: () => void;
  onDeleted: (viewId: string) => void;
}) {
  const t = useTranslations("selector.deleteView");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const specificError = useSelectorErrorText();
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog open={view !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title", { name: view?.name ?? "" })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description")} {hasChildren ? t("children") : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              if (!view) {
                return;
              }
              startTransition(async () => {
                const result = await deleteView(organizationId, view.id);
                if (result.ok) {
                  toast.success(t("done", { name: view.name }));
                  onDeleted(view.id);
                  onClose();
                } else {
                  toast.error(specificError(result.error) ?? tErrors(result.error as "unknown"));
                }
              });
            }}
          >
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
