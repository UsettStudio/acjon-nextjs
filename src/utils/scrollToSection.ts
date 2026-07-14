import { getScrollSmoother } from "@/hooks/useScrollSmooth";

/**
 * Smooth-scroll til en seksjon på forsiden (one-page).
 * Fungerer både med GSAP ScrollSmoother (desktop) og nativ scroll (mobil).
 */
const HEADER_OFFSET = 90;

export function scrollToSection(hash: string) {
    if (!hash) return;
    const smoother = getScrollSmoother();

    // Toppen av siden ("Hjem")
    if (hash === "#top") {
        if (smoother) {
            smoother.paused(false);
            smoother.scrollTo(0, true);
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
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
        const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: y, behavior: "smooth" });
    }
}
