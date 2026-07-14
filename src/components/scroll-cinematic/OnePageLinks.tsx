"use client";

import { useEffect } from "react";
import { scrollToSection } from "@/utils/scrollToSection";

/**
 * One-page-lenker: fanger opp klikk på alle interne anker-lenker (#seksjon)
 * på forsiden og smooth-scroller dit via ScrollSmoother – i stedet for at
 * nettleseren gjør et hardt hopp (som ikke funker under ScrollSmoother).
 *
 * Brukes for CTA-er som «Ta kontakt», «Velg pakke», tjeneste- og prosjekt-
 * kort som alle peker til #kontakt-skjema. Offcanvas-menyen har sin egen
 * håndtering (MenuStyleTwo) og hoppes derfor over her.
 *
 * Kjøres i capture-fasen så vi rekker å ta over før Next <Link> sin egen
 * klikk-håndtering.
 */
export default function OnePageLinks() {
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const target = e.target as HTMLElement | null;
            const a = target?.closest?.("a");
            if (!a) return;
            // Offcanvas-menyen håndterer sine egne lenker.
            if (a.closest(".tp-offcanvas-2-area")) return;
            const href = a.getAttribute("href") || "";
            const hashIndex = href.indexOf("#");
            if (hashIndex === -1) return;
            const hash = href.substring(hashIndex);
            if (!hash || hash === "#") return; // tomme #-lenker (f.eks. footer) ignoreres
            if (!document.querySelector(hash)) return;
            e.preventDefault();
            scrollToSection(hash);
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);

    return null;
}
