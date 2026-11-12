"use client";

import { CheckIcon, LoaderCircleIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MediaAsset } from "@/features/media/assets";
import {
  expandPageToFull,
  savePageBlocks,
  saveSiteSettings,
  type RestoredPage,
  type SitePublishState,
} from "@/features/site-builder/actions";
import { fromMediaAsset } from "@/features/site-builder/assets";
import { blocksSchema, createBlock, duplicateBlock, type Block, type BlockType } from "@/features/site-builder/blocks";
import { AddBlockDialog, BlockForm, BlockList, blockErrors, blockSummary } from "@/features/site-builder/components/editor/block-list";
import { FieldContextProvider, type FieldContext } from "@/features/site-builder/components/editor/fields";
import { PagesPanel } from "@/features/site-builder/components/editor/pages-panel";
import { PreviewPane } from "@/features/site-builder/components/editor/preview-pane";
import { NavigationPanel, SettingsPanel, ThemePanel } from "@/features/site-builder/components/editor/site-panels";
import { SitePublishBar } from "@/features/site-builder/components/editor/site-publish-bar";
import { useDraftAutosave, type DraftSaveStatus } from "@/features/site-builder/components/editor/use-draft-autosave";
import type { PreviewUpdate } from "@/features/site-builder/components/preview-frame";
import type { EditorPage, SiteEditorData } from "@/features/site-builder/queries";
import {
  cookieSettingsSchema,
  footerSchema,
  navSchema,
  seoDefaultsSchema,
  type CookieSettings,
  type NavItem,
  type SeoDefaults,
  type SiteFooter,
} from "@/features/site-builder/site";
import { missingForFull } from "@/features/site-builder/templates";
import { themeSchema, type ThemeOverrides } from "@/features/site-builder/theme";

type SiteSettings = { nav: NavItem[]; footer: SiteFooter; theme: ThemeOverrides; seoDefaults: SeoDefaults; cookieSettings: CookieSettings };

type Tab = "content" | "pages" | "navigation" | "theme" | "settings";

const SITE_KEY = "site";
const pageKey = (pageId: string) => `page:${pageId}`;

function settingsValid(value: SiteSettings): boolean {
  return (
    navSchema.safeParse(value.nav).success &&
    footerSchema.safeParse(value.footer).success &&
    themeSchema.safeParse(value.theme).success &&
    seoDefaultsSchema.safeParse(value.seoDefaults).success &&
    cookieSettingsSchema.safeParse(value.cookieSettings).success
  );
}

function SaveIndicator({ status, error, onRetry }: { status: DraftSaveStatus; error: string | null; onRetry: () => void }) {
  const t = useTranslations("siteBuilder.editor.save");
  const tErrors = useTranslations("errors");
  const tSite = useTranslations("siteBuilder.errors");
  if (status === "error") {
    const reason = error === "selectorNotInProject" ? tSite("selectorNotInProject") : tErrors((error ?? "unknown") as "unknown");
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
        <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
        {t("failed", { reason })}
        <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onRetry}>
          {t("retry")}
        </Button>
      </span>
    );
  }
  if (status === "invalid") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300" role="status">
        <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
        {t("invalid")}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite" data-save-status={status}>
      {status === "saving" ? <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {status === "saved" ? <CheckIcon className="size-3.5" aria-hidden="true" /> : null}
      {t(status)}
    </span>
  );
}

/**
 * Editoren for prosjektsiden: blokker til venstre, forhåndsvisning til høyre.
 * Utkastet lagres automatisk. Den publiserte siden endres først ved publisering.
 */
export function SiteEditor({
  organizationId,
  orgSlug,
  projectId,
  data,
  canEdit,
  canEditBrand,
}: {
  organizationId: string;
  orgSlug: string;
  projectId: string;
  data: SiteEditorData;
  canEdit: boolean;
  canEditBrand: boolean;
}) {
  const t = useTranslations("siteBuilder.editor");
  const tTypes = useTranslations("siteBuilder.blockTypes");
  const tErrors = useTranslations("errors");
  const siteId = data.site.id;
  const [pages, setPages] = useState<EditorPage[]>(data.pages);
  const [currentPageId, setCurrentPageId] = useState(() => (data.pages.find((page) => page.isHome) ?? data.pages[0])?.id ?? "");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("content");
  const [settings, setSettings] = useState<SiteSettings>({
    nav: data.site.nav,
    footer: data.site.footer,
    theme: data.site.theme,
    seoDefaults: data.site.seoDefaults,
    cookieSettings: data.site.cookieSettings,
  });
  const [assets, setAssets] = useState<Record<string, MediaAsset>>(data.assets);
  const [address, setAddress] = useState({ subdomain: data.site.subdomain, url: data.site.url });
  const [publish, setPublish] = useState<SitePublishState>({ publishedAt: data.site.publishedAt, hasUnpublishedChanges: data.hasUnpublishedChanges });
  const [addOpen, setAddOpen] = useState(false);
  const [expanding, startExpand] = useTransition();

  const currentPage = pages.find((page) => page.id === currentPageId) ?? pages.find((page) => page.isHome) ?? pages[0];
  const homePage = pages.find((page) => page.isHome) ?? pages[0];
  const blocks = useMemo(() => currentPage?.blocks ?? [], [currentPage]);
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;

  // ---------------------------------------------------------------------------
  // Autolagring
  // ---------------------------------------------------------------------------

  const parts = useMemo(() => {
    const result: Record<string, unknown> = { [SITE_KEY]: settings };
    for (const page of pages) {
      result[pageKey(page.id)] = page.blocks;
    }
    return result;
  }, [pages, settings]);

  const autosave = useDraftAutosave(
    parts,
    async (key, value) => {
      const result =
        key === SITE_KEY
          ? await saveSiteSettings(organizationId, siteId, value as SiteSettings)
          : await savePageBlocks(organizationId, key.slice("page:".length), value);
      if (result.ok) {
        setPublish(result.data);
        return { ok: true };
      }
      return { ok: false, error: result.error };
    },
    (key, value) => (key === SITE_KEY ? settingsValid(value as SiteSettings) : blocksSchema.safeParse(value).success),
  );
  const { markSaved, flush, clearError } = autosave;

  // ---------------------------------------------------------------------------
  // Blokker
  // ---------------------------------------------------------------------------

  const updateBlocks = useCallback(
    (pageId: string, update: (blocks: Block[]) => Block[]) => {
      if (!canEdit) {
        return;
      }
      clearError();
      setPages((previous) => previous.map((page) => (page.id === pageId ? { ...page, blocks: update(page.blocks) } : page)));
    },
    [canEdit, clearError],
  );

  const blockLabel = useCallback(
    (block: Block) => {
      const summary = blockSummary(block);
      const name = tTypes(`${block.type}.name`);
      return summary ? `${name}: ${summary}` : name;
    },
    [tTypes],
  );

  function addBlock(type: BlockType) {
    if (!currentPage) {
      return;
    }
    const block = createBlock(type, type === "selector" ? { selector_id: data.selectors[0]?.id ?? null } : {});
    updateBlocks(currentPage.id, (current) => {
      const index = current.findIndex((item) => item.id === selectedBlockId);
      return index === -1 ? [...current, block] : [...current.slice(0, index + 1), block, ...current.slice(index + 1)];
    });
    setSelectedBlockId(block.id);
  }

  function deleteBlock(blockId: string) {
    if (!currentPage) {
      return;
    }
    const pageId = currentPage.id;
    const index = currentPage.blocks.findIndex((block) => block.id === blockId);
    const block = currentPage.blocks[index];
    if (!block) {
      return;
    }
    updateBlocks(pageId, (current) => current.filter((item) => item.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    toast(t("blocks.deleted", { name: blockLabel(block) }), {
      action: {
        label: t("blocks.undo"),
        onClick: () =>
          updateBlocks(pageId, (current) =>
            current.some((item) => item.id === block.id) ? current : [...current.slice(0, index), block, ...current.slice(index)],
          ),
      },
    });
  }

  function duplicate(blockId: string) {
    if (!currentPage) {
      return;
    }
    const block = currentPage.blocks.find((item) => item.id === blockId);
    if (!block) {
      return;
    }
    const copy = duplicateBlock(block);
    updateBlocks(currentPage.id, (current) => {
      const index = current.findIndex((item) => item.id === blockId);
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
    setSelectedBlockId(copy.id);
  }

  function expand() {
    if (!currentPage) {
      return;
    }
    const pageId = currentPage.id;
    startExpand(async () => {
      const result = await expandPageToFull(organizationId, projectId, currentPage.blocks);
      if (result.ok) {
        const added = result.data.length - currentPage.blocks.length;
        updateBlocks(pageId, () => result.data);
        toast.success(t("expand.done", { count: added }));
      } else {
        toast.error(tErrors(result.error as "unknown"));
      }
    });
  }

  const invalidIds = useMemo(() => new Set(blocks.filter((block) => Object.keys(blockErrors(block)).length > 0).map((block) => block.id)), [blocks]);
  const missing = currentPage?.isHome ? missingForFull(blocks, data.selectors.length > 0) : [];

  // ---------------------------------------------------------------------------
  // Sider, filer og forhåndsvisning
  // ---------------------------------------------------------------------------

  function openPage(pageId: string) {
    setCurrentPageId(pageId);
    setSelectedBlockId(null);
    setTab("content");
  }

  function onPagesChange(next: EditorPage[]) {
    // Nye sider er allerede lagret (tomme) på serveren.
    for (const page of next) {
      if (!pages.some((item) => item.id === page.id)) {
        markSaved(pageKey(page.id), page.blocks);
      }
    }
    setPages(next);
    if (!next.some((page) => page.id === currentPageId)) {
      setCurrentPageId((next.find((page) => page.isHome) ?? next[0])?.id ?? "");
      setSelectedBlockId(null);
    }
  }

  function onRestored(restored: RestoredPage) {
    setAssets((previous) => ({ ...previous, ...Object.fromEntries(restored.assets.map((asset) => [asset.id, asset])) }));
    setPages((previous) =>
      previous.map((page) =>
        page.id === restored.pageId
          ? {
              ...page,
              title: restored.title,
              seoTitle: restored.seoTitle,
              seoDescription: restored.seoDescription,
              ogAssetId: restored.ogAssetId,
              blocks: restored.blocks,
            }
          : page,
      ),
    );
    markSaved(pageKey(restored.pageId), restored.blocks);
    setSelectedBlockId(null);
    setPublish((previous) => ({ ...previous, hasUnpublishedChanges: true }));
  }

  const addAssets = useCallback((added: MediaAsset[]) => {
    setAssets((previous) => {
      if (added.every((asset) => previous[asset.id] === asset)) {
        return previous;
      }
      return { ...previous, ...Object.fromEntries(added.map((asset) => [asset.id, asset])) };
    });
  }, []);

  const fieldContext = useMemo<FieldContext>(
    () => ({
      organizationId,
      projectId,
      assets,
      addAssets,
      pages: pages.map((page) => ({ id: page.id, title: page.title })),
      blockOptions: blocks.map((block) => ({ id: block.id, label: blockLabel(block) })),
      selectors: data.selectors,
      disabled: !canEdit,
    }),
    [organizationId, projectId, assets, addAssets, pages, blocks, blockLabel, data.selectors, canEdit],
  );

  const previewUpdate = useMemo<PreviewUpdate>(
    () => ({
      type: "site-preview:update",
      pageId: currentPage?.id ?? "",
      blocks,
      theme: settings.theme,
      nav: settings.nav,
      footer: settings.footer,
      seoDefaults: settings.seoDefaults,
      pages: pages.map((page) => ({ id: page.id, title: page.title, slug: page.slug, isHome: page.isHome })),
      assets: Object.fromEntries(Object.values(assets).map((asset) => [asset.id, fromMediaAsset(asset)])),
      logoAssetId: settings.theme.logo_asset_id ?? data.brandLogoAssetId,
      selectedBlockId,
    }),
    [currentPage, blocks, settings, pages, assets, data.brandLogoAssetId, selectedBlockId],
  );

  const onSelectFromPreview = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
    setTab("content");
  }, []);

  if (!currentPage || !homePage) {
    return null;
  }

  return (
    <FieldContextProvider value={fieldContext}>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={currentPage.id} onValueChange={openPage}>
              <SelectTrigger aria-label={t("pageSelect")} className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.isHome ? t("homePageOption", { title: page.title }) : page.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SaveIndicator status={autosave.status} error={autosave.error} onRetry={() => void flush()} />
          </div>
          <SitePublishBar
            organizationId={organizationId}
            siteId={siteId}
            siteUrl={address.url}
            publish={publish}
            canEdit={canEdit}
            currentPage={{ id: currentPage.id, title: currentPage.title }}
            flush={flush}
            onPublishState={setPublish}
            onRestored={onRestored}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[26rem_minmax(0,1fr)]">
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="min-w-0 gap-3 lg:max-h-[calc(100svh-14rem)] lg:min-h-[36rem]">
            <TabsList className="flex h-auto w-full flex-wrap justify-start">
              <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
              <TabsTrigger value="pages">{t("tabs.pages")}</TabsTrigger>
              <TabsTrigger value="navigation">{t("tabs.navigation")}</TabsTrigger>
              <TabsTrigger value="theme">{t("tabs.theme")}</TabsTrigger>
              <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
            </TabsList>
            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto rounded-md border p-4">
              <TabsContent value="content" className="grid grid-cols-[minmax(0,1fr)] gap-4">
                {selectedBlock ? (
                  <BlockForm
                    key={selectedBlock.id}
                    block={selectedBlock}
                    disabled={!canEdit}
                    onBack={() => setSelectedBlockId(null)}
                    onChange={(next) => updateBlocks(currentPage.id, (current) => current.map((block) => (block.id === next.id ? next : block)))}
                  />
                ) : (
                  <>
                    {canEdit && missing.length > 0 ? (
                      <div className="grid gap-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <SparklesIcon className="size-4 text-primary" aria-hidden="true" />
                          {t("expand.title")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("expand.description", { blocks: missing.map((type) => tTypes(`${type}.name`)).join(", ") })}
                        </p>
                        <Button type="button" size="sm" variant="outline" className="justify-self-start" disabled={expanding} onClick={expand}>
                          {expanding ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : null}
                          {t("expand.action")}
                        </Button>
                      </div>
                    ) : null}
                    <BlockList
                      blocks={blocks}
                      selectedId={selectedBlockId}
                      invalidIds={invalidIds}
                      disabled={!canEdit}
                      onSelect={setSelectedBlockId}
                      onReorder={(next) => updateBlocks(currentPage.id, () => next)}
                      onToggleHidden={(blockId) =>
                        updateBlocks(currentPage.id, (current) => current.map((block) => (block.id === blockId ? { ...block, hidden: !block.hidden } : block)))
                      }
                      onDuplicate={duplicate}
                      onDelete={deleteBlock}
                      onAdd={() => setAddOpen(true)}
                    />
                  </>
                )}
              </TabsContent>
              <TabsContent value="pages">
                <PagesPanel
                  organizationId={organizationId}
                  siteId={siteId}
                  pages={pages}
                  currentPageId={currentPage.id}
                  disabled={!canEdit}
                  onOpenPage={openPage}
                  onPagesChange={onPagesChange}
                />
              </TabsContent>
              <TabsContent value="navigation">
                <NavigationPanel
                  nav={settings.nav}
                  footer={settings.footer}
                  homePageId={homePage.id}
                  homeBlocks={homePage.blocks}
                  blockLabel={blockLabel}
                  context={fieldContext}
                  onNavChange={(nav) => {
                    clearError();
                    setSettings((previous) => ({ ...previous, nav }));
                  }}
                  onFooterChange={(footer) => {
                    clearError();
                    setSettings((previous) => ({ ...previous, footer }));
                  }}
                />
              </TabsContent>
              <TabsContent value="theme">
                <ThemePanel
                  theme={settings.theme}
                  brand={data.brand}
                  orgSlug={orgSlug}
                  canEditBrand={canEditBrand}
                  disabled={!canEdit}
                  onChange={(theme) => {
                    clearError();
                    setSettings((previous) => ({ ...previous, theme }));
                  }}
                />
              </TabsContent>
              <TabsContent value="settings">
                <SettingsPanel
                  organizationId={organizationId}
                  siteId={siteId}
                  subdomain={address.subdomain}
                  url={address.url}
                  seoDefaults={settings.seoDefaults}
                  cookieSettings={settings.cookieSettings}
                  disabled={!canEdit}
                  onSeoDefaultsChange={(seoDefaults) => {
                    clearError();
                    setSettings((previous) => ({ ...previous, seoDefaults }));
                  }}
                  onCookieSettingsChange={(cookieSettings) => {
                    clearError();
                    setSettings((previous) => ({ ...previous, cookieSettings }));
                  }}
                  onSubdomainChange={(subdomain, url) => setAddress({ subdomain, url })}
                />
              </TabsContent>
            </div>
          </Tabs>
          <PreviewPane siteId={siteId} update={previewUpdate} onSelectBlock={onSelectFromPreview} onNavigate={openPage} />
        </div>
      </div>
      <AddBlockDialog open={addOpen} onOpenChange={setAddOpen} onPick={addBlock} />
    </FieldContextProvider>
  );
}
