"use client";

import { ArrowDownIcon, ArrowUpIcon, HomeIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, Settings2Icon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { slugify } from "@/features/organizations/slug";
import { createPage, deletePage, reorderPages, setHomePage, updatePageSettings } from "@/features/site-builder/actions";
import type { FieldSpec } from "@/features/site-builder/components/editor/field-specs";
import { FieldList } from "@/features/site-builder/components/editor/fields";
import type { EditorPage } from "@/features/site-builder/queries";

const PAGE_FIELDS: FieldSpec[] = [
  { kind: "text", key: "title", label: "pageTitle", max: 200 },
  { kind: "text", key: "slug", label: "pageSlug", help: "pageSlug", max: 80 },
  { kind: "text", key: "seoTitle", label: "seoTitle", help: "seoTitle", max: 200 },
  { kind: "textarea", key: "seoDescription", label: "seoDescription", help: "seoDescription", max: 500, rows: 3 },
  { kind: "image", key: "ogAssetId", label: "shareImage", help: "shareImage" },
];

const NEW_PAGE_FIELDS = PAGE_FIELDS.slice(0, 2);

type PageForm = { title: string; slug: string; seoTitle: string; seoDescription: string; ogAssetId: string | null };

function toForm(page: EditorPage | null): PageForm {
  return {
    title: page?.title ?? "",
    slug: page?.slug ?? "",
    seoTitle: page?.seoTitle ?? "",
    seoDescription: page?.seoDescription ?? "",
    ogAssetId: page?.ogAssetId ?? null,
  };
}

/** Ny side, eller innstillinger og SEO for en side. */
function PageDialog({
  open,
  onOpenChange,
  organizationId,
  siteId,
  page,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  siteId: string;
  /** null: ny side. */
  page: EditorPage | null;
  onSaved: (page: EditorPage) => void;
}) {
  const t = useTranslations("siteBuilder.editor.pages");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tSite = useTranslations("siteBuilder.errors");
  const [form, setForm] = useState<PageForm>(() => toForm(page));
  const [slugTouched, setSlugTouched] = useState(page !== null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const input = { ...form, seoTitle: form.seoTitle, seoDescription: form.seoDescription };
      const result = page ? await updatePageSettings(organizationId, page.id, input) : await createPage(organizationId, siteId, input);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        if (!result.fieldErrors) {
          toast.error(result.error === "pageSlugTaken" ? tSite("pageSlugTaken") : tErrors(result.error as "unknown"));
        }
        return;
      }
      const id = page ? page.id : (result.data as { id: string }).id;
      onSaved({
        id,
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        isHome: page?.isHome ?? false,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
        ogAssetId: form.ogAssetId,
        blocks: page?.blocks ?? [],
        publishedAt: page?.publishedAt ?? null,
      });
      toast.success(page ? t("saved") : t("created"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")} className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{page ? t("settingsTitle", { title: page.title }) : t("newTitle")}</DialogTitle>
          <DialogDescription>{page ? t("settingsDescription") : t("newDescription")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <FieldList
            specs={page ? PAGE_FIELDS : NEW_PAGE_FIELDS}
            values={form}
            errors={errors}
            onChange={(values) => {
              const next = values as PageForm;
              if (next.slug !== form.slug) {
                setSlugTouched(true);
              }
              // Adressen følger tittelen til den endres for hånd.
              setForm(!slugTouched && next.title !== form.title ? { ...next, slug: slugify(next.title, 80) } : next);
            }}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? tCommon("saving") : page ? tCommon("save") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Sidene på prosjektsiden: rekkefølge (også i menyen), forside, innstillinger og sletting. */
export function PagesPanel({
  organizationId,
  siteId,
  pages,
  currentPageId,
  disabled,
  onOpenPage,
  onPagesChange,
}: {
  organizationId: string;
  siteId: string;
  pages: EditorPage[];
  currentPageId: string;
  disabled: boolean;
  onOpenPage: (pageId: string) => void;
  onPagesChange: (pages: EditorPage[]) => void;
}) {
  const t = useTranslations("siteBuilder.editor.pages");
  const tErrors = useTranslations("errors");
  const tSite = useTranslations("siteBuilder.errors");
  const [dialog, setDialog] = useState<{ page: EditorPage | null; key: number } | null>(null);
  const [toDelete, setToDelete] = useState<EditorPage | null>(null);
  const [pending, startTransition] = useTransition();

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= pages.length) {
      return;
    }
    const next = [...pages];
    const [page] = next.splice(index, 1);
    next.splice(target, 0, page as EditorPage);
    const previous = pages;
    onPagesChange(next);
    startTransition(async () => {
      const result = await reorderPages(organizationId, siteId, next.map((item) => item.id));
      if (!result.ok) {
        onPagesChange(previous);
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  function makeHome(page: EditorPage) {
    startTransition(async () => {
      const result = await setHomePage(organizationId, page.id);
      if (result.ok) {
        onPagesChange(pages.map((item) => ({ ...item, isHome: item.id === page.id })));
        toast.success(t("homeSet", { title: page.title }));
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  function remove(page: EditorPage) {
    startTransition(async () => {
      const result = await deletePage(organizationId, page.id);
      if (result.ok) {
        onPagesChange(pages.filter((item) => item.id !== page.id));
        toast.success(t("deleted", { title: page.title }));
        setToDelete(null);
      } else {
        toast.error(result.error === "homePage" ? tSite("homePage") : tErrors(result.error as "unknown"));
      }
    });
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{t("intro")}</p>
      <ol className="grid gap-1.5" aria-label={t("listLabel")}>
        {pages.map((page, index) => (
          <li key={page.id} className="flex items-center gap-1 rounded-md border bg-background py-1 pr-1 pl-3" aria-current={page.id === currentPageId ? "page" : undefined}>
            <button
              type="button"
              className="min-w-0 flex-1 rounded-sm py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={() => onOpenPage(page.id)}
            >
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{page.title}</span>
                {page.isHome ? (
                  <Badge variant="secondary" className="gap-1">
                    <HomeIcon className="size-3" aria-hidden="true" />
                    {t("home")}
                  </Badge>
                ) : null}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{page.isHome ? "/" : `/${page.slug}`}</span>
            </button>
            {!disabled ? (
              <>
                <Button type="button" variant="ghost" size="icon" className="size-8" disabled={index === 0 || pending} aria-label={t("moveUp", { title: page.title })} onClick={() => move(index, -1)}>
                  <ArrowUpIcon aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={index === pages.length - 1 || pending}
                  aria-label={t("moveDown", { title: page.title })}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDownIcon aria-hidden="true" />
                </Button>
              </>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("actions", { title: page.title })}>
                  <MoreHorizontalIcon aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onOpenPage(page.id)}>
                  <PencilIcon aria-hidden="true" />
                  {t("edit")}
                </DropdownMenuItem>
                {!disabled ? (
                  <>
                    <DropdownMenuItem onSelect={() => setDialog({ page, key: Date.now() })}>
                      <Settings2Icon aria-hidden="true" />
                      {t("settings")}
                    </DropdownMenuItem>
                    {!page.isHome ? (
                      <DropdownMenuItem onSelect={() => makeHome(page)}>
                        <HomeIcon aria-hidden="true" />
                        {t("makeHome")}
                      </DropdownMenuItem>
                    ) : null}
                    {!page.isHome ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setToDelete(page)}>
                          <Trash2Icon aria-hidden="true" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ol>
      {!disabled ? (
        <Button type="button" variant="outline" disabled={pages.length >= 50} onClick={() => setDialog({ page: null, key: Date.now() })}>
          <PlusIcon aria-hidden="true" />
          {t("add")}
        </Button>
      ) : null}

      {dialog ? (
        <PageDialog
          key={dialog.key}
          open
          onOpenChange={(open) => {
            if (!open) {
              setDialog(null);
            }
          }}
          organizationId={organizationId}
          siteId={siteId}
          page={dialog.page}
          onSaved={(saved) => {
            const exists = pages.some((item) => item.id === saved.id);
            onPagesChange(exists ? pages.map((item) => (item.id === saved.id ? { ...item, ...saved, blocks: item.blocks } : item)) : [...pages, saved]);
            if (!exists) {
              onOpenPage(saved.id);
            }
          }}
        />
      ) : null}

      <AlertDialog open={toDelete !== null} onOpenChange={(open) => (open ? undefined : setToDelete(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle", { title: toDelete?.title ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                if (toDelete) {
                  remove(toDelete);
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
