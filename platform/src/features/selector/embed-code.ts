/**
 * Innbygging av en publisert boligvelger på andre nettsteder: koden kunden
 * limer inn (web-komponent eller iframe), og valgene som følger med i adressen
 * til iframen. Samme parametre som web-komponenten (src/embed/boligvelger-embed.ts).
 */

export type EmbedListOption = "default" | "show" | "hide";

export type EmbedSnippetOptions = {
  showFilters: boolean;
  list: EmbedListOption;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function embedFrameSrc(origin: string, selectorId: string, options: EmbedSnippetOptions): string {
  const url = new URL(`/embed/selector/${selectorId}`, origin);
  if (!options.showFilters) {
    url.searchParams.set("filtre", "nei");
  }
  if (options.list !== "default") {
    url.searchParams.set("liste", options.list === "show" ? "ja" : "nei");
  }
  return url.toString();
}

/** Iframe alene: for nettsteder som ikke tillater skript. */
export function iframeSnippet(origin: string, selectorId: string, options: EmbedSnippetOptions, title: string): string {
  return `<iframe src="${escapeAttribute(embedFrameSrc(origin, selectorId, options))}" title="${escapeAttribute(title)}" loading="lazy" style="display:block;width:100%;height:85vh;min-height:520px;border:0"></iframe>`;
}

/** Web-komponenten, med iframen som reserve når skript er slått av. */
export function webComponentSnippet(origin: string, selectorId: string, options: EmbedSnippetOptions, title: string): string {
  const attributes = [`selector="${escapeAttribute(selectorId)}"`];
  if (!options.showFilters) {
    attributes.push('filters="false"');
  }
  if (options.list !== "default") {
    attributes.push(`list="${options.list === "show" ? "true" : "false"}"`);
  }
  attributes.push(`title="${escapeAttribute(title)}"`);
  return [
    `<script src="${escapeAttribute(new URL("/embed/v1.js", origin).toString())}" async></script>`,
    `<boligvelger-embed ${attributes.join(" ")}>`,
    `  <noscript>${iframeSnippet(origin, selectorId, options, title)}</noscript>`,
    `</boligvelger-embed>`,
  ].join("\n");
}

/** Valgene i adressen til den publiserte velgeren (/embed/selector/{id}?filtre=nei&liste=ja&start={visning}). */
export function embedOptionsFromQuery(query: Record<string, string | string[] | undefined>): {
  showFilters?: boolean;
  showList?: boolean;
  entryViewId?: string;
} {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const options: { showFilters?: boolean; showList?: boolean; entryViewId?: string } = {};
  if (first(query.filtre) === "nei") {
    options.showFilters = false;
  }
  const list = first(query.liste);
  if (list === "ja" || list === "nei") {
    options.showList = list === "ja";
  }
  const start = first(query.start);
  if (start && UUID.test(start)) {
    options.entryViewId = start.toLowerCase();
  }
  return options;
}
