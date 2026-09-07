/**
 * Høflig nedlasting av bildesekvenser.
 *
 * BAKGRUNNEN
 * Både heroen og byggefilmen består av en canvas-sekvens på 40–120 JPEG-er.
 * Tidligere ble hele sekvensen startet med `new Image()` i en løkke med én
 * gang komponenten ble montert. Nettleseren la da 40–120 forespørsler i kø
 * MED SAMME PRIORITET som alt annet på siden – logo, portefølje­bilder,
 * tjenestekortene. Målt på mobil ga det 9,4 MB og LCP på 16,7 sekunder, og
 * det var grunnen til at tjenestekortene lenger ned tok evigheter før de kom.
 *
 * HVA DENNE GJØR
 *  1. Laster de første bildene med én gang, så canvasen aldri står tom.
 *  2. Utsetter resten til siden er ferdig lastet og hovedtråden er ledig.
 *  3. Merker dem `fetchPriority = "low"`, slik at nettleseren selv setter dem
 *     bakerst i køen bak tekst, CSS og bilder som faktisk er synlige.
 *  4. Laster i småpuljer i stedet for alt på én gang.
 *
 * Sekvensene blir altså like komplette som før – de slutter bare å konkurrere
 * med det brukeren venter på.
 */

type Opts = {
    /** Bildene som skal lastes, i rekkefølge. */
    urls: string[];
    /**
     * Reservebilder, én per indeks i `urls`. Brukes hvis hovedbildet ikke
     * finnes (404) eller er ødelagt.
     *
     * Grunnen til at dette finnes: mobilsekvensen i heroen genereres av et
     * skript og er nye, usporede filer. Blir de ikke generert eller ikke
     * lagt til i git før deploy, svarer serveren 404 – og uten reserve ble
     * heroen stående helt tom på telefon. Nå faller den tilbake på original-
     * bildene i stedet: tyngre, men siden ser riktig ut.
     */
    fallbackUrls?: string[];
    /** Hvor mange som hentes umiddelbart. Standard 2. */
    eager?: number;
    /** Hvor mange som hentes per pulje etterpå. Standard 6. */
    batch?: number;
    /** Kalles hver gang et bilde er nede, med indeksen i `urls`. */
    onLoad?: (index: number, img: HTMLImageElement) => void;
    /** Ferdig lastede Image-objekter skrives inn her, på samme indeks. */
    target: HTMLImageElement[];
};

/** requestIdleCallback finnes ikke i Safari – fall tilbake på setTimeout. */
const nårLedig = (fn: () => void): number => {
    const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
        return w.requestIdleCallback(fn, { timeout: 2000 });
    }
    return window.setTimeout(fn, 200);
};

/**
 * Starter nedlastingen og returnerer en opprydningsfunksjon som stopper
 * videre puljer (viktig når komponenten demonteres midt i lastingen).
 */
export function lastRammer({
    urls,
    fallbackUrls,
    eager = 2,
    batch = 6,
    onLoad,
    target,
}: Opts): () => void {
    let avbrutt = false;

    /** Har vi allerede advart om at hovedsekvensen mangler? */
    let harAdvart = false;

    const hent = (i: number, lavPrioritet: boolean, brukReserve = false) => {
        if (avbrutt || (target[i] && !brukReserve)) return;
        const kilde = brukReserve ? fallbackUrls?.[i] : urls[i];
        if (!kilde) return;

        const img = new Image();
        // fetchPriority er ikke i alle TS-DOM-typene ennå.
        if (lavPrioritet) {
            (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "low";
            img.decoding = "async";
        }
        img.onload = () => {
            if (!avbrutt) onLoad?.(i, img);
        };
        img.onerror = () => {
            if (avbrutt || brukReserve || !fallbackUrls?.[i]) return;
            if (!harAdvart) {
                harAdvart = true;
                console.warn(
                    `[framePreloader] Fant ikke ${urls[i]} – faller tilbake på ` +
                    `originalbildene. Kjør «node scripts/lag-orbit-mobile.mjs» og ` +
                    `husk «git add public/assets/scroll/orbit-mobile».`
                );
            }
            hent(i, lavPrioritet, true);
        };
        img.src = kilde;
        target[i] = img;
    };

    // 1) De første bildene med en gang – ellers blinker canvasen tom.
    for (let i = 0; i < Math.min(eager, urls.length); i++) hent(i, false);

    // 2) Resten når siden er ferdig og hovedtråden har luft.
    let neste = eager;
    const kjørPulje = () => {
        if (avbrutt || neste >= urls.length) return;
        const slutt = Math.min(neste + batch, urls.length);
        for (let i = neste; i < slutt; i++) hent(i, true);
        neste = slutt;
        nårLedig(kjørPulje);
    };

    const start = () => nårLedig(kjørPulje);
    if (document.readyState === "complete") {
        start();
    } else {
        window.addEventListener("load", start, { once: true });
    }

    return () => {
        avbrutt = true;
        window.removeEventListener("load", start);
    };
}

/**
 * Kaller `cb` først når elementet nærmer seg viewporten.
 *
 * Brukes på seksjoner under skjermkanten, så telefonen slipper å laste ned
 * megabyte med bilder til noe brukeren kanskje aldri scroller til.
 * `margin` gir forsprang, slik at bildene er nede før seksjonen er framme.
 */
export function nårNær(
    el: Element,
    cb: () => void,
    margin = "150% 0px"
): () => void {
    if (typeof IntersectionObserver === "undefined") {
        cb();
        return () => {};
    }
    const obs = new IntersectionObserver(
        (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                obs.disconnect();
                cb();
            }
        },
        { root: null, rootMargin: margin, threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
}
