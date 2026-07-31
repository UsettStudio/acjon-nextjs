"use client";

/**
 * Samtykkebanner for informasjonskapsler (GDPR / ekomloven §2-7b).
 *
 * Ingen sporing kjører før brukeren har tatt et aktivt valg. Meta-pikselen
 * lastes først når kategorien "markedsforing" er samtykket til – det er
 * kravet for å kunne kjøre Meta-annonser lovlig mot norske brukere.
 *
 * Pikselen aktiveres ved å sette NEXT_PUBLIC_META_PIXEL_ID i Netlify
 * (Site settings → Environment variables). Er den ikke satt, lastes ingenting.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "usett-consent-v1";
export const CONSENT_OPEN_EVENT = "usett:open-consent";

type Consent = {
    necessary: true;
    statistikk: boolean;
    markedsforing: boolean;
    timestamp: string;
};

declare global {
    interface Window {
        fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...a: unknown[]) => void; push?: unknown; loaded?: boolean; version?: string };
        _fbq?: unknown;
    }
}

function readConsent(): Consent | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Consent) : null;
    } catch {
        return null;
    }
}

/** Laster Meta-pikselen én gang, kun etter samtykke til markedsføring. */
function loadMetaPixel() {
    const id = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (!id) return;
    if (typeof window === "undefined" || window.fbq) return;

    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
        let n: any, t: any, s: any;
        n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e) as HTMLScriptElement;
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */

    window.fbq?.("init", id);
    window.fbq?.("track", "PageView");
}

const CookieBanner = () => {
    const [open, setOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [statistikk, setStatistikk] = useState(false);
    const [markedsforing, setMarkedsforing] = useState(false);

    // Første render: vis banner hvis ingen valg er lagret, ellers respekter valget.
    useEffect(() => {
        const saved = readConsent();
        if (!saved) {
            setOpen(true);
            return;
        }
        setStatistikk(saved.statistikk);
        setMarkedsforing(saved.markedsforing);
        if (saved.markedsforing) loadMetaPixel();
    }, []);

    // Lar footeren (eller hvilken som helst knapp) åpne banneret på nytt.
    useEffect(() => {
        const reopen = () => {
            const saved = readConsent();
            setStatistikk(saved?.statistikk ?? false);
            setMarkedsforing(saved?.markedsforing ?? false);
            setShowDetails(true);
            setOpen(true);
        };
        window.addEventListener(CONSENT_OPEN_EVENT, reopen);
        return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
    }, []);

    const save = useCallback((valg: { statistikk: boolean; markedsforing: boolean }) => {
        const consent: Consent = {
            necessary: true,
            statistikk: valg.statistikk,
            markedsforing: valg.markedsforing,
            timestamp: new Date().toISOString(),
        };
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        } catch {
            /* privat modus e.l. – valget gjelder da kun for denne økten */
        }
        if (valg.markedsforing) loadMetaPixel();
        setOpen(false);
        setShowDetails(false);
    }, []);

    if (!open) return null;

    return (
        <div className="usett-consent" role="dialog" aria-modal="false" aria-label="Informasjonskapsler">
            <div className="usett-consent__inner">
                <div className="usett-consent__body">
                    <h2 className="usett-consent__title">Vi bruker informasjonskapsler</h2>
                    <p className="usett-consent__text">
                        Noen er nødvendige for at nettsiden skal fungere. Andre bruker vi til å måle
                        trafikk og til markedsføring på Facebook og Instagram. Du velger selv.{" "}
                        <Link href="/personvern" className="usett-consent__link">
                            Les personvernerklæringen
                        </Link>
                    </p>

                    {showDetails && (
                        <div className="usett-consent__options">
                            <label className="usett-consent__option usett-consent__option--locked">
                                <input type="checkbox" checked readOnly />
                                <span>
                                    <strong>Nødvendige</strong>
                                    <em>Kreves for at siden skal virke. Kan ikke slås av.</em>
                                </span>
                            </label>

                            <label className="usett-consent__option">
                                <input
                                    type="checkbox"
                                    checked={statistikk}
                                    onChange={(e) => setStatistikk(e.target.checked)}
                                />
                                <span>
                                    <strong>Statistikk</strong>
                                    <em>Hjelper oss å se hvilke sider som besøkes.</em>
                                </span>
                            </label>

                            <label className="usett-consent__option">
                                <input
                                    type="checkbox"
                                    checked={markedsforing}
                                    onChange={(e) => setMarkedsforing(e.target.checked)}
                                />
                                <span>
                                    <strong>Markedsføring</strong>
                                    <em>Meta-pikselen, som måler effekten av annonsene våre.</em>
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                <div className="usett-consent__actions">
                    {showDetails ? (
                        <button
                            type="button"
                            className="usett-consent__btn usett-consent__btn--ghost"
                            onClick={() => save({ statistikk, markedsforing })}
                        >
                            Lagre valg
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="usett-consent__btn usett-consent__btn--ghost"
                            onClick={() => setShowDetails(true)}
                        >
                            Innstillinger
                        </button>
                    )}
                    <button
                        type="button"
                        className="usett-consent__btn usett-consent__btn--ghost"
                        onClick={() => save({ statistikk: false, markedsforing: false })}
                    >
                        Kun nødvendige
                    </button>
                    <button
                        type="button"
                        className="usett-consent__btn usett-consent__btn--solid"
                        onClick={() => save({ statistikk: true, markedsforing: true })}
                    >
                        Godta alle
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .usett-consent {
                    position: fixed;
                    left: 16px;
                    right: 16px;
                    bottom: 16px;
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    pointer-events: none;
                }
                .usett-consent__inner {
                    pointer-events: auto;
                    width: 100%;
                    max-width: 880px;
                    background: #ffffff;
                    color: #1a1a1a;
                    border: 1px solid #e4e2dd;
                    border-radius: 14px;
                    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.16);
                    padding: 22px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    font-family: var(--font-poppins), system-ui, sans-serif;
                }
                .usett-consent__title {
                    font-size: 1.02rem;
                    font-weight: 600;
                    margin: 0 0 6px;
                    letter-spacing: -0.01em;
                }
                .usett-consent__text {
                    font-size: 0.9rem;
                    line-height: 1.6;
                    margin: 0;
                    color: #3d3d3d;
                }
                .usett-consent__link {
                    color: #1a1a1a;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                .usett-consent__options {
                    margin-top: 16px;
                    display: grid;
                    gap: 10px;
                }
                .usett-consent__option {
                    display: flex;
                    gap: 11px;
                    align-items: flex-start;
                    font-size: 0.85rem;
                    cursor: pointer;
                }
                .usett-consent__option--locked {
                    opacity: 0.65;
                    cursor: default;
                }
                .usett-consent__option input {
                    margin-top: 3px;
                    width: 16px;
                    height: 16px;
                    flex: none;
                    accent-color: #1a1a1a;
                }
                .usett-consent__option strong {
                    display: block;
                    font-weight: 600;
                }
                .usett-consent__option em {
                    display: block;
                    font-style: normal;
                    color: #6b6b6b;
                    font-size: 0.8rem;
                    margin-top: 1px;
                }
                .usett-consent__actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: flex-end;
                }
                .usett-consent__btn {
                    border-radius: 999px;
                    padding: 10px 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.15s ease, background 0.15s ease;
                    white-space: nowrap;
                }
                .usett-consent__btn--ghost {
                    background: transparent;
                    border: 1px solid #d5d2cc;
                    color: #1a1a1a;
                }
                .usett-consent__btn--ghost:hover {
                    background: #f3f1ed;
                }
                .usett-consent__btn--solid {
                    background: #1a1a1a;
                    border: 1px solid #1a1a1a;
                    color: #ffffff;
                }
                .usett-consent__btn--solid:hover {
                    opacity: 0.86;
                }
                @media (max-width: 575px) {
                    .usett-consent__actions {
                        justify-content: stretch;
                    }
                    .usett-consent__btn {
                        flex: 1 1 auto;
                    }
                }
            ` }} />
        </div>
    );
};

export default CookieBanner;
