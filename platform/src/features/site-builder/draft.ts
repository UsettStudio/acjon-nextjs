/**
 * Utkastet til en prosjektside, slik editoren og forhåndsvisningen bruker det.
 * Ren datamapping uten serverkode, så den kan brukes både på serveren og i nettleseren.
 */

import type { Block } from "@/features/site-builder/blocks";
import type { SitePageSummary, SiteRenderData, SiteRenderMode } from "@/features/site-builder/site";

export type DraftPage = SitePageSummary & {
  seoTitle: string | null;
  seoDescription: string | null;
  ogAssetId: string | null;
  blocks: Block[];
};

export type DraftSite = Omit<SiteRenderData, "page" | "mode" | "basePath"> & { draftPages: DraftPage[]; themeOverrides: unknown; brand: unknown };

/** Én side fra utkastet, klar til visning. */
export function draftRenderData(draft: DraftSite, pageId: string | null, mode: SiteRenderMode, basePath: string): SiteRenderData {
  const page = draft.draftPages.find((item) => item.id === pageId) ?? draft.draftPages.find((item) => item.isHome) ?? null;
  const { draftPages: _pages, themeOverrides: _theme, brand: _brand, ...rest } = draft;
  return {
    ...rest,
    mode,
    basePath,
    page: page
      ? {
          id: page.id,
          title: page.title,
          slug: page.slug,
          isHome: page.isHome,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          ogAssetId: page.ogAssetId,
          blocks: mode === "editor" ? page.blocks : page.blocks.filter((block) => !block.hidden),
        }
      : null,
  };
}
