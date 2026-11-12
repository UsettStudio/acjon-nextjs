"use client";

import { useEffect, useMemo, useState } from "react";

import type { SiteAsset } from "@/features/site-builder/assets";
import type { Block } from "@/features/site-builder/blocks";
import { SitePageBlocks } from "@/features/site-builder/components/render/site-page";
import { SiteShell } from "@/features/site-builder/components/render/site-shell";
import { draftRenderData, type DraftSite } from "@/features/site-builder/draft";
import type { NavItem, SeoDefaults, SiteFooter, SitePageSummary } from "@/features/site-builder/site";
import { resolveTheme } from "@/features/site-builder/theme";

/** Meldinger mellom editoren og forhåndsvisningen (samme opprinnelse). */
export type PreviewUpdate = {
  type: "site-preview:update";
  pageId: string;
  blocks: Block[];
  theme: unknown;
  nav: NavItem[];
  footer: SiteFooter;
  seoDefaults: SeoDefaults;
  pages: SitePageSummary[];
  assets: Record<string, SiteAsset>;
  logoAssetId: string | null;
  selectedBlockId: string | null;
};

export type PreviewEvent =
  | { type: "site-preview:ready" }
  | { type: "site-preview:select"; blockId: string }
  | { type: "site-preview:navigate"; pageId: string };

function post(event: PreviewEvent) {
  window.parent.postMessage(event, window.location.origin);
}

/**
 * Forhåndsvisningen i editoren. Vises i en iframe, så mobilvisningen får riktige
 * brytepunkter. Editoren sender utkastet ved hver endring; klikk på en blokk
 * velger den i editoren, og lenker til andre sider bytter side der.
 */
export function SitePreviewFrame({ draft, fontClassName }: { draft: DraftSite; fontClassName: string }) {
  const home = draft.draftPages.find((page) => page.isHome) ?? draft.draftPages[0];
  const [update, setUpdate] = useState<PreviewUpdate | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) {
        return;
      }
      const message = event.data as PreviewUpdate | undefined;
      if (message?.type === "site-preview:update") {
        setUpdate(message);
      }
    }
    window.addEventListener("message", onMessage);
    post({ type: "site-preview:ready" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const selected = update?.selectedBlockId ?? null;
  useEffect(() => {
    if (!selected) {
      return;
    }
    document.querySelector(`[data-block-id="${CSS.escape(selected)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selected]);

  const data = useMemo(() => {
    const pageId = update?.pageId ?? home?.id ?? null;
    const base = draftRenderData(draft, pageId, "editor", "");
    if (!update) {
      return base;
    }
    const assets = { ...draft.assets, ...update.assets };
    return {
      ...base,
      theme: resolveTheme(draft.brand, update.theme),
      nav: update.nav,
      footer: update.footer,
      seoDefaults: update.seoDefaults,
      pages: update.pages,
      assets,
      logo: update.logoAssetId ? (assets[update.logoAssetId] ?? null) : null,
      page: base.page ? { ...base.page, blocks: update.blocks } : null,
    };
  }, [draft, home, update]);

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest("a");
    if (anchor) {
      // Ingen navigering i forhåndsvisningen. Lenker til andre sider bytter side i editoren.
      event.preventDefault();
      const href = anchor.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const path = href.split("#")[0] ?? "";
      const page = data.pages.find((item) => (item.isHome ? path === "/" || path === "" : path === `/${item.slug}`));
      if (page) {
        post({ type: "site-preview:navigate", pageId: page.id });
      }
      return;
    }
    if (target?.closest("input, textarea, select, button, label, summary")) {
      return;
    }
    const block = target?.closest("[data-block-id]");
    const blockId = block?.getAttribute("data-block-id");
    if (blockId) {
      post({ type: "site-preview:select", blockId });
    }
  }

  return (
    <div onClickCapture={onClickCapture} className="[&_[data-block-id]]:cursor-pointer">
      <style>{selected ? `[data-block-id="${selected.replace(/"/g, "")}"] { outline: 3px solid #2563eb; outline-offset: -3px; }` : ""}</style>
      <SiteShell data={data} fontClassName={fontClassName}>
        <SitePageBlocks data={data} blocks={data.page?.blocks ?? []} />
      </SiteShell>
    </div>
  );
}
