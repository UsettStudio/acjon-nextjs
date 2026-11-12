/**
 * Web-komponenten <boligvelger-embed>: en publisert boligvelger på et annet
 * nettsted. Bygges til public/embed/v1.js (scripts/build-embed.mjs), uten
 * avhengigheter, og må derfor være selvstendig.
 *
 *   <script src="https://app.[PLATTFORMDOMENE]/embed/v1.js" async></script>
 *   <boligvelger-embed selector="{id}">
 *     <noscript><iframe src="…/embed/selector/{id}" …></iframe></noscript>
 *   </boligvelger-embed>
 *
 * Komponenten viser velgeren i en iframe i sin egen shadow DOM, med høyde
 * etter skjermen, lat lasting og hendelser vertssiden kan lytte på:
 *   boligvelger:ready     velgeren er lastet
 *   boligvelger:navigate  { path } ny visning, nytt filter eller en enhetsside
 *   boligvelger:lead      { unitId } et interesseskjema er sendt
 *
 * Iframen er reserven: uten skript (eller på sider som fjerner skript) virker
 * den samme iframen alene. En iframe som står inne i elementet, fjernes når
 * komponenten starter, så velgeren ikke lastes to ganger.
 *
 * Attributter: selector (påkrevd), view (startvisning), filters="false",
 * list="true|false", height (CSS-høyde, standard 85vh), title, sync-url
 * (husk enhetsside og filter i adressen til vertssiden: #boligvelger=…).
 */

export const TAG_NAME = "boligvelger-embed";
export const MESSAGE_TYPES = {
  ready: "boligvelger:ready",
  navigate: "boligvelger:navigate",
  lead: "boligvelger:lead",
} as const;
export const HASH_KEY = "boligvelger";

const SELECTOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Adresser inne i velgeren som kan deles: en enhetsside og/eller filter og visning. */
const SUB_PATH = /^(\/bolig\/[a-z0-9-]{1,80})?(\?[^#\s]{0,500})?$/;
const SAFE_HEIGHT = /^\d{2,4}(px|vh|svh|dvh|rem|em|%)$/;

export type EmbedOptions = {
  selectorId: string;
  view: string | null;
  filters: boolean | null;
  list: boolean | null;
  /** Del av adressen inne i velgeren, for eksempel «/bolig/a-302?status=ledig». */
  subPath: string | null;
};

function flag(value: string | null): boolean | null {
  if (value === null) {
    return null;
  }
  return value !== "false" && value !== "0" && value !== "nei";
}

/** Adressen iframen skal vise. Ugyldige verdier ignoreres. */
export function frameUrl(origin: string, options: EmbedOptions): string | null {
  if (!SELECTOR_ID.test(options.selectorId)) {
    return null;
  }
  const subPath = options.subPath && SUB_PATH.test(options.subPath) ? options.subPath : "";
  const [path = "", query = ""] = subPath.split("?");
  const url = new URL(`/embed/selector/${options.selectorId.toLowerCase()}${path}`, origin);
  for (const [key, value] of new URLSearchParams(query)) {
    url.searchParams.append(key, value);
  }
  if (options.view && SELECTOR_ID.test(options.view)) {
    url.searchParams.set("start", options.view.toLowerCase());
  }
  if (options.filters === false) {
    url.searchParams.set("filtre", "nei");
  }
  if (options.list !== null) {
    url.searchParams.set("liste", options.list ? "ja" : "nei");
  }
  return url.toString();
}

/** Delen av adressen i velgeren som legges i #boligvelger=… på vertssiden. */
export function subPathFromFrame(path: string): string | null {
  const match = /^\/embed\/selector\/[0-9a-f-]{36}(\/bolig\/[a-z0-9-]{1,80})?$/.exec(path.split("?")[0] ?? "");
  if (!match) {
    return null;
  }
  const query = path.includes("?") ? path.slice(path.indexOf("?")) : "";
  const subPath = `${match[1] ?? ""}${query === "?" ? "" : query}`;
  return SUB_PATH.test(subPath) ? subPath : null;
}

export function readHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const value = params.get(HASH_KEY);
  return value && SUB_PATH.test(value) ? value : null;
}

export function writeHash(hash: string, subPath: string | null): string {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (subPath) {
    params.set(HASH_KEY, subPath);
  } else {
    params.delete(HASH_KEY);
  }
  const value = params.toString();
  return value ? `#${value}` : "";
}

/** Opprinnelsen til skriptet, så iframen hentes fra samme plattform som skriptet. */
function scriptOrigin(): string {
  const script = typeof document !== "undefined" ? (document.currentScript as HTMLScriptElement | null) : null;
  try {
    return new URL(script?.src ?? window.location.href).origin;
  } catch {
    return window.location.origin;
  }
}

const DEFAULT_ORIGIN = typeof window !== "undefined" ? scriptOrigin() : "";

if (typeof window !== "undefined" && typeof customElements !== "undefined" && !customElements.get(TAG_NAME)) {
  class BoligvelgerEmbed extends HTMLElement {
    static observedAttributes = ["selector", "view", "filters", "list", "height", "title"];

    private frame: HTMLIFrameElement | null = null;
    private readonly onMessage = (event: MessageEvent) => this.handleMessage(event);

    private get origin(): string {
      const override = this.getAttribute("origin");
      if (override) {
        try {
          const url = new URL(override);
          if (url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1") {
            return url.origin;
          }
        } catch {
          // Ugyldig verdi: bruk opprinnelsen til skriptet.
        }
      }
      return DEFAULT_ORIGIN;
    }

    private options(): EmbedOptions {
      return {
        selectorId: this.getAttribute("selector") ?? "",
        view: this.getAttribute("view"),
        filters: flag(this.getAttribute("filters")),
        list: flag(this.getAttribute("list")),
        subPath: this.hasAttribute("sync-url") ? readHash(window.location.hash) : null,
      };
    }

    connectedCallback() {
      // Reserven (iframe i elementet) trengs ikke når komponenten virker.
      for (const fallback of Array.from(this.querySelectorAll("iframe"))) {
        fallback.remove();
      }
      const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
      if (!this.frame) {
        const style = document.createElement("style");
        style.textContent =
          ":host{display:block}iframe{display:block;width:100%;min-height:520px;border:0;color-scheme:normal}p{font:inherit;margin:0}";
        this.frame = document.createElement("iframe");
        this.frame.setAttribute("loading", "lazy");
        this.frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        root.append(style, this.frame);
      }
      window.addEventListener("message", this.onMessage);
      this.render();
    }

    disconnectedCallback() {
      window.removeEventListener("message", this.onMessage);
    }

    attributeChangedCallback(name: string) {
      if (this.frame && name !== "title" && name !== "height") {
        this.render();
      } else if (this.frame) {
        this.applyFrameAttributes();
      }
    }

    private applyFrameAttributes() {
      if (!this.frame) {
        return;
      }
      this.frame.title = this.getAttribute("title") || "Boligvelger";
      const height = this.getAttribute("height");
      this.frame.style.height = height && SAFE_HEIGHT.test(height) ? height : "85vh";
    }

    private render() {
      if (!this.frame) {
        return;
      }
      this.applyFrameAttributes();
      const src = frameUrl(this.origin, this.options());
      if (!src) {
        console.error(`<${TAG_NAME}>: attributtet «selector» må være id-en til en publisert boligvelger.`);
        return;
      }
      if (this.frame.src !== src) {
        this.frame.src = src;
      }
    }

    private handleMessage(event: MessageEvent) {
      if (!this.frame || event.source !== this.frame.contentWindow || event.origin !== this.origin) {
        return;
      }
      const data = event.data as { type?: unknown; path?: unknown; unitId?: unknown } | null;
      if (!data || typeof data.type !== "string") {
        return;
      }
      switch (data.type) {
        case MESSAGE_TYPES.ready:
          this.dispatchEvent(new CustomEvent(MESSAGE_TYPES.ready, { bubbles: true, composed: true }));
          break;
        case MESSAGE_TYPES.navigate: {
          const subPath = typeof data.path === "string" ? subPathFromFrame(data.path) : null;
          if (this.hasAttribute("sync-url")) {
            const hash = writeHash(window.location.hash, subPath);
            if (hash !== window.location.hash) {
              window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}${hash}`);
            }
          }
          this.dispatchEvent(new CustomEvent(MESSAGE_TYPES.navigate, { bubbles: true, composed: true, detail: { path: subPath ?? "" } }));
          break;
        }
        case MESSAGE_TYPES.lead:
          this.dispatchEvent(
            new CustomEvent(MESSAGE_TYPES.lead, {
              bubbles: true,
              composed: true,
              detail: { unitId: typeof data.unitId === "string" ? data.unitId : null },
            }),
          );
          break;
      }
    }
  }

  customElements.define(TAG_NAME, BoligvelgerEmbed);
}
