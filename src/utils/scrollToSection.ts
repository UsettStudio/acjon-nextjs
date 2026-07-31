import { getScrollSmoother } from "@/hooks/useScrollSmooth";

/**
 * Smooth-scroll til en seksjon på forsiden (one-page).
 * Fungerer både med GSAP ScrollSmoother (desktop) og nativ scroll (mobil).
 */
const HEADER_OFFSET = 90;

/* --------------------------------------------------------------------------
 * MOBIL-SCROLL – hvorfor vi ikke bruker window.scrollTo({behavior:"smooth"})
 *
 * Malen setter `html { scroll-behavior: smooth }` i CSS. Kombinert med et
 * JS-kall med behavior:"smooth" over lange avstander (kontaktskjemaet ligger
 * ~13 700 px ned på mobil) fullfører nettleseren rett og slett aldri
 * scrollingen – målt på usett.no i 396px-viewport: scrollY sto på 0 selv 3
 * sekunder etter kallet. Med `scroll-behavior: auto` landet nøyaktig samme
 * kall på riktig piksel. Det er derfor «Ta kontakt» ikke gjorde noe på
 * telefon: desktop går via ScrollSmoother og traff aldri denne grenen.
 *
 * Løsningen er en egen rAF-animasjon med CSS-smooth midlertidig avslått.
 * Den har fast varighet uansett avstand, måler målet på nytt hver frame
 * (så lazy-lastet innhold som endrer layout underveis ikke ødelegger), og
 * avbrytes hvis brukeren selv tar tak i siden.
 * ------------------------------------------------------------------------ */

let rafId = 0;
let cancelCurrent: (() => void) | null = null;

/** Hardt hopp med CSS-smooth midlertidig av – lander alltid. */
function hardScrollTo(y: number) {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, y);
    html.style.scrollBehavior = prev;
}

function animateNativeScroll(getTargetY: () => number, duration = 650) {
    if (typeof window === "undefined") return;

    // Avbryt en eventuell pågående animasjon først.
    cancelCurrent?.();

    // Respekter «reduser bevegelse» – da hopper vi rett dit.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        hardScrollTo(getTargetY());
        return;
    }

    const html = document.documentElement;
    const previousBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const startY = window.scrollY;
    const startTime = performance.now();
    // easeOutCubic
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    let finished = false;
    let safetyId = 0;

    const finish = (snap: boolean) => {
        if (finished) return;
        finished = true;
        cancelAnimationFrame(rafId);
        clearTimeout(safetyId);
        window.removeEventListener("touchstart", onUserInput);
        window.removeEventListener("wheel", onUserInput);
        html.style.scrollBehavior = previousBehavior;
        cancelCurrent = null;
        if (!snap) return;
        // Siste korreksjon: bilder/lazy innhold kan ha flyttet målet mens vi
        // animerte. Hopp de siste pikslene hvis vi bommet.
        window.setTimeout(() => {
            const y = getTargetY();
            if (Math.abs(y - window.scrollY) > 4) hardScrollTo(y);
        }, 260);
    };

    // Bruker tar over => vi slipper taket med én gang.
    function onUserInput() {
        finish(false);
    }
    window.addEventListener("touchstart", onUserInput, { passive: true });
    window.addEventListener("wheel", onUserInput, { passive: true });

    cancelCurrent = () => finish(false);

    const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / duration);
        const targetY = getTargetY();
        window.scrollTo(0, startY + (targetY - startY) * ease(t));
        if (t < 1) {
            rafId = requestAnimationFrame(step);
        } else {
            finish(true);
        }
    };

    rafId = requestAnimationFrame(step);

    // SIKKERHETSNETT: requestAnimationFrame kan bli strupet (bakgrunnsfane,
    // strømsparing, enkelte innebygde nettlesere) slik at animasjonen aldri
    // kjører. Da hopper vi rett til målet i stedet for å bli stående.
    safetyId = window.setTimeout(() => {
        if (finished) return;
        const y = getTargetY();
        if (Math.abs(y - window.scrollY) > 8) {
            finish(false);
            hardScrollTo(y);
        }
    }, duration + 450);
}

function maxScrollY() {
    return Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
    );
}

export function scrollToSection(hash: string) {
    if (!hash) return;
    const smoother = getScrollSmoother();

    // Toppen av siden ("Hjem")
    if (hash === "#top") {
        if (smoother) {
            smoother.paused(false);
            smoother.scrollTo(0, true);
        } else {
            animateNativeScroll(() => 0);
        }
        return;
    }

    const el = document.querySelector(hash) as HTMLElement | null;
    if (!el) return;

    if (smoother) {
        smoother.paused(false);
        const y = Math.max(0, smoother.offset(el, "top top") - HEADER_OFFSET);
        smoother.scrollTo(y, true);
    } else {
        animateNativeScroll(() => {
            const y =
                el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            return Math.min(maxScrollY(), Math.max(0, y));
        });
    }
}
