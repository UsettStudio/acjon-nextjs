"use client";

/**
 * Håndterer #anker i URL-en når man kommer til forsiden fra en annen side
 * (f.eks. klikk på «Prosjekter» i menyen mens man er på en undersid).
 * Venter til layout/bilder har satt seg før den scroller.
 */
import { useEffect } from "react";
import { scrollToSection } from "@/utils/scrollToSection";

export default function HashScroll() {
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash || hash === "#") return;
        const t = setTimeout(() => scrollToSection(hash), 700);
        return () => clearTimeout(t);
    }, []);

    return null;
}
