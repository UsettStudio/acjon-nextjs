"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import projectData from "@/data/projectData";
import Image from "next/image";
import Link from "next/link";

// Alle Usett-prosjektbildene (robust: filtrerer på bildesti i stedet for
// skjøre array-indekser). Sikrer at ALLE 9 vises.
const usettProjects = projectData.filter(
    (p) => typeof p.image === "string" && p.image.includes("/design-studio/portfolio/usett-")
);

const DesignStudioPortfolio = () => {
    // Aktivt bilde i lightbox (null = lukket)
    const [active, setActive] = useState<{ src: string; alt: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const close = useCallback(() => setActive(null), []);

    // createPortal krever at vi er i nettleseren (unngå SSR-feil)
    useEffect(() => { setMounted(true); }, []);

    // Lukk med Escape når lightbox er åpen
    useEffect(() => {
        if (!active) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [active, close]);

    return (
        <div className="ds-portfolio-area">
            <div className="container-fluid gx-0">
                <div className="row gx-0">
                    {usettProjects.map((item, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div className="ds-portfolio-item">
                                <div className="ds-portfolio-item-thumb">
                                    {/* Klikk på bildet forstørrer det (lightbox) */}
                                    <button
                                        type="button"
                                        className="tp-clip-anim ds-portfolio-zoom"
                                        onClick={() => setActive({ src: item.image, alt: item.title })}
                                        aria-label={`Forstørr bilde: ${item.title}`}
                                    >
                                        <Image
                                            width={635}
                                            height={712}
                                            className="tp-anim-img "
                                            src={item.image}
                                            alt={item.title}
                                            loading="eager"
                                        />
                                    </button>
                                </div>
                                <div className="ds-portfolio-item-content tp_fade_anim" data-delay=".6">
                                    <div className="ds-portfolio-item-content-hide">
                                        <span>
                                            {item.year} · {item.category}
                                        </span>
                                        <h3 className="ds-portfolio-item-title">
                                            <Link className="tp-line-black" href="#kontakt-skjema">
                                                {item.title}
                                            </Link>
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox – rendres på <body> via portal så den ikke påvirkes av
                ScrollSmoother sin transform (position:fixed ville ellers bli feil). */}
            {mounted && active && createPortal(
                <div
                    className="ds-lightbox"
                    onClick={close}
                    role="dialog"
                    aria-modal="true"
                    aria-label={active.alt}
                >
                    <button
                        type="button"
                        className="ds-lightbox-close"
                        onClick={close}
                        aria-label="Lukk"
                    >
                        &times;
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="ds-lightbox-img"
                        src={active.src}
                        alt={active.alt}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>,
                document.body
            )}
        </div>
    );
};

export default DesignStudioPortfolio;
