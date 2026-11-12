// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { EMBED_MESSAGES } from "@/features/selector/components/public/embed-bridge";
import { embedFrameSrc, embedOptionsFromQuery, iframeSnippet, webComponentSnippet } from "@/features/selector/embed-code";

const { MESSAGE_TYPES, TAG_NAME, frameUrl, readHash, subPathFromFrame, writeHash } = await import("@/embed/boligvelger-embed");

const SELECTOR = "2b0f8c1e-6a4d-4f7a-9a51-3c2d1e0f9a88";
const VIEW = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const ORIGIN = window.location.origin;

afterEach(() => {
  document.body.innerHTML = "";
  window.history.replaceState(null, "", "/");
});

describe("frameUrl", () => {
  it("lager adressen til den publiserte velgeren med valgene", () => {
    expect(frameUrl("https://app.example.no", { selectorId: SELECTOR, view: VIEW, filters: false, list: true, subPath: null })).toBe(
      `https://app.example.no/embed/selector/${SELECTOR}?start=${VIEW}&filtre=nei&liste=ja`,
    );
  });

  it("tar med en enhetsside og filter fra adressen til vertssiden", () => {
    expect(
      frameUrl("https://app.example.no", { selectorId: SELECTOR, view: null, filters: null, list: null, subPath: "/bolig/a-302?status=ledig" }),
    ).toBe(`https://app.example.no/embed/selector/${SELECTOR}/bolig/a-302?status=ledig`);
  });

  it("avviser ugyldig id og ignorerer stier som ikke hører til velgeren", () => {
    expect(frameUrl("https://app.example.no", { selectorId: "../admin", view: null, filters: null, list: null, subPath: null })).toBeNull();
    expect(
      frameUrl("https://app.example.no", { selectorId: SELECTOR, view: "x", filters: null, list: null, subPath: "/../../admin" }),
    ).toBe(`https://app.example.no/embed/selector/${SELECTOR}`);
  });
});

describe("adressen på vertssiden", () => {
  it("leser og skriver #boligvelger=… uten å røre andre verdier", () => {
    expect(subPathFromFrame(`/embed/selector/${SELECTOR}/bolig/a-302`)).toBe("/bolig/a-302");
    expect(subPathFromFrame(`/embed/selector/${SELECTOR}?status=ledig`)).toBe("?status=ledig");
    expect(subPathFromFrame(`/embed/selector/${SELECTOR}`)).toBe("");
    expect(subPathFromFrame("/annet")).toBeNull();
    expect(writeHash("#seksjon=2", "/bolig/a-302")).toBe("#seksjon=2&boligvelger=%2Fbolig%2Fa-302");
    expect(readHash("#seksjon=2&boligvelger=%2Fbolig%2Fa-302")).toBe("/bolig/a-302");
    expect(readHash("#boligvelger=javascript:alert(1)")).toBeNull();
    expect(writeHash("#boligvelger=%2Fbolig%2Fa-302", null)).toBe("");
  });
});

describe("<boligvelger-embed>", () => {
  function mount(attributes: Record<string, string>, inner = "") {
    const element = document.createElement(TAG_NAME);
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    element.innerHTML = inner;
    document.body.append(element);
    const frame = element.shadowRoot?.querySelector("iframe");
    if (!frame) {
      throw new Error("Fant ikke iframen");
    }
    return { element, frame };
  }

  it("viser velgeren i en iframe og fjerner reserven", () => {
    const { element, frame } = mount(
      { selector: SELECTOR, filters: "false", title: "Boligvelger for Fjordparken" },
      `<iframe src="${ORIGIN}/embed/selector/${SELECTOR}"></iframe>`,
    );
    expect(element.querySelector("iframe")).toBeNull();
    expect(frame.src).toBe(`${ORIGIN}/embed/selector/${SELECTOR}?filtre=nei`);
    expect(frame.title).toBe("Boligvelger for Fjordparken");
    expect(frame.getAttribute("loading")).toBe("lazy");
    expect(frame.style.height).toBe("85vh");
  });

  it("bruker høyden fra attributtet bare når den er gyldig", () => {
    expect(mount({ selector: SELECTOR, height: "720px" }).frame.style.height).toBe("720px");
    expect(mount({ selector: SELECTOR, height: "1px;background:red" }).frame.style.height).toBe("85vh");
  });

  it("sender hendelser videre bare fra sin egen iframe", () => {
    const { element, frame } = mount({ selector: SELECTOR, "sync-url": "" });
    const navigate = vi.fn();
    element.addEventListener(MESSAGE_TYPES.navigate, (event) => navigate((event as CustomEvent).detail));

    window.dispatchEvent(
      new MessageEvent("message", { data: { type: MESSAGE_TYPES.navigate, path: `/embed/selector/${SELECTOR}/bolig/a-302` }, origin: "https://ondsinnet.example", source: frame.contentWindow }),
    );
    window.dispatchEvent(new MessageEvent("message", { data: { type: MESSAGE_TYPES.navigate, path: "/x" }, origin: ORIGIN, source: window }));
    expect(navigate).not.toHaveBeenCalled();

    window.dispatchEvent(
      new MessageEvent("message", { data: { type: MESSAGE_TYPES.navigate, path: `/embed/selector/${SELECTOR}/bolig/a-302` }, origin: ORIGIN, source: frame.contentWindow }),
    );
    expect(navigate).toHaveBeenCalledWith({ path: "/bolig/a-302" });
    expect(window.location.hash).toBe("#boligvelger=%2Fbolig%2Fa-302");

    const lead = vi.fn();
    element.addEventListener(MESSAGE_TYPES.lead, (event) => lead((event as CustomEvent).detail));
    window.dispatchEvent(new MessageEvent("message", { data: { type: MESSAGE_TYPES.lead, unitId: "u1" }, origin: ORIGIN, source: frame.contentWindow }));
    expect(lead).toHaveBeenCalledWith({ unitId: "u1" });
  });

  it("starter på enhetssiden fra adressen når sync-url er satt", () => {
    window.history.replaceState(null, "", "/side#boligvelger=%2Fbolig%2Fa-302");
    expect(mount({ selector: SELECTOR, "sync-url": "" }).frame.src).toBe(`${ORIGIN}/embed/selector/${SELECTOR}/bolig/a-302`);
  });

  it("bruker de samme meldingsnavnene som broen i velgeren", () => {
    expect(EMBED_MESSAGES).toEqual(MESSAGE_TYPES);
  });
});

describe("innbyggingskoden i admin", () => {
  it("lager web-komponent med iframe som reserve", () => {
    const code = webComponentSnippet("https://app.example.no", SELECTOR, { showFilters: false, list: "hide" }, 'Velger "Fjordparken"');
    expect(code).toContain('<script src="https://app.example.no/embed/v1.js" async></script>');
    expect(code).toContain(`<boligvelger-embed selector="${SELECTOR}" filters="false" list="false" title="Velger &quot;Fjordparken&quot;">`);
    expect(code).toContain(`<noscript><iframe src="https://app.example.no/embed/selector/${SELECTOR}?filtre=nei&amp;liste=nei"`);
  });

  it("lager iframe alene for nettsteder uten skript", () => {
    const code = iframeSnippet("https://app.example.no", SELECTOR, { showFilters: true, list: "show" }, "Boligvelger");
    expect(code).toMatch(/^<iframe src="https:\/\/app\.example\.no\/embed\/selector\/[^"]+\?liste=ja" title="Boligvelger" loading="lazy"/);
    expect(embedFrameSrc("https://app.example.no", SELECTOR, { showFilters: true, list: "default" })).toBe(
      `https://app.example.no/embed/selector/${SELECTOR}`,
    );
  });

  it("leser valgene fra adressen til velgeren", () => {
    expect(embedOptionsFromQuery({ filtre: "nei", liste: "ja", start: VIEW.toUpperCase() })).toEqual({
      showFilters: false,
      showList: true,
      entryViewId: VIEW,
    });
    expect(embedOptionsFromQuery({ filtre: "ja", liste: "kanskje", start: "abc" })).toEqual({});
  });
});
