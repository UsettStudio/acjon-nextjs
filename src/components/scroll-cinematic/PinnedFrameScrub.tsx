"use client";

/**
 * PinnedFrameScrub – scroll-skrubbet canvas-bildesekvens som PINNES med
 * GSAP ScrollTrigger (ikke position:sticky). Brukes på forsiden, som kjører
 * inne i ScrollSmoother der sticky ikke fungerer. Samme teknikk som hero.
 *
 * Viser overlay-linjer (kicker + tittel) som toner inn/ut basert på progress.
 */
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export type ScrubLine = {
    kicker?: string;
    title: string;
    in: number;
    out: number;
};

export default function PinnedFrameScrub({
    frameDir,
    frameCount = 120,
    lines = [],
    scrollFactor = 4,
    bg = "#010103",
}: {
    frameDir: string;
    frameCount?: number;
    lines?: ScrubLine[];
    scrollFactor?: number;
    bg?: string;
}) {
    const rootRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
    const frameRef = useRef(-1);

    useGSAP(
        () => {
            const root = rootRef.current;
            const canvas = canvasRef.current;
            if (!root || !canvas) return;
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) return;

            gsap.registerPlugin(ScrollTrigger);

            const pad = (n: number) => String(n).padStart(4, "0");
            const images: HTMLImageElement[] = [];
            let loaded = 0;

            const draw = (index: number) => {
                const img = images[index];
                if (!img || !img.complete || !img.naturalWidth) return;
                const cw = canvas.clientWidth;
                const ch = canvas.clientHeight;
                const ir = img.naturalWidth / img.naturalHeight;
                const cr = cw / ch;
                let dw, dh, dx, dy;
                if (ir > cr) {
                    dh = ch; dw = ch * ir; dx = (cw - dw) / 2; dy = 0;
                } else {
                    dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2;
                }
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, cw, ch);
                ctx.drawImage(img, dx, dy, dw, dh);
            };

            const resize = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.max(1, canvas.clientWidth * dpr);
                canvas.height = Math.max(1, canvas.clientHeight * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                draw(Math.max(frameRef.current, 0));
            };

            const fadeLines = (p: number) => {
                lineRefs.current.forEach((el, i) => {
                    if (!el || !lines[i]) return;
                    const { in: a, out: b } = lines[i];
                    const mid = (a + b) / 2;
                    const half = Math.max((b - a) / 2, 0.001);
                    let o = 1 - Math.abs(p - mid) / half;
                    o = Math.max(0, Math.min(1, o * 1.6));
                    el.style.opacity = o.toFixed(3);
                    el.style.transform = `translateY(${(1 - o) * 28}px)`;
                });
            };

            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = `${frameDir}/frame_${pad(i + 1)}.jpg`;
                img.onload = () => {
                    loaded++;
                    if (i === 0) {
                        frameRef.current = 0;
                        draw(0);
                    }
                    // MERK: ingen ScrollTrigger.refresh() her. Canvas har fast
                    // CSS-størrelse, så det at bildene lastes endrer IKKE layout.
                    // En refresh her fyrte ofte flere sekunder ut – etter at man
                    // allerede hadde scrollet ned til seksjonen – og målte pinnen
                    // på nytt midt i scrollen. Det var årsaken til at videoen
                    // "stoppet på feil sted" (og blottla den hvite bakgrunnen
                    // under). Vi refresher kun tidlig, se lenger ned.
                };
                images[i] = img;
            }

            resize();
            fadeLines(0);

            // Samme direkte oppsett som hero-pinnen (som funker stabilt):
            const st = ScrollTrigger.create({
                trigger: root,
                start: "top top",
                end: () => "+=" + window.innerHeight * scrollFactor,
                pin: true,
                pinSpacing: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                refreshPriority: 1, // måles etter hero-pinnen (prioritet 2)
                onUpdate: (self) => {
                    const p = self.progress;
                    const idx = Math.min(frameCount - 1, Math.round(p * (frameCount - 1)));
                    if (idx !== frameRef.current) {
                        frameRef.current = idx;
                        draw(idx);
                    }
                    fadeLines(p);
                },
            });

            // Refresh-strategi (viktig!): mål pinnen på nytt ETTER at layouten
            // OVER seksjonen har satt seg. Web-fonten byttes inn litt etter
            // sideinnlasting og KRYMPER overskriftene over byggeprosessen
            // (~300 px). Måles pinnens start før fontbyttet, blir den for stor,
            // og videoen pinnes for seint -> hvit glipe under ("stopper på feil
            // sted"). document.fonts.ready fyrer ETTER fontbyttet, så da blir
            // målingen riktig. Vi refresher bevisst IKKE når bildene er lastet
            // (canvas har fast CSS-størrelse) – det var den sene refreshen som
            // hoppet midt i scrollen.
            //
            // Hvert kall hopper over refresh dersom man akkurat da er inne i
            // pinnen (ville flyttet scrollen), men blokkerer IKKE senere kall –
            // så fonts.ready/fallback får korrigert målingen. Alle disse fyrer
            // uansett tidlig, lenge før man rekker å scrolle hit.
            const safeRefresh = () => {
                if (st.isActive) return;
                ScrollTrigger.refresh();
            };
            window.addEventListener("resize", resize);
            window.addEventListener("load", safeRefresh);
            if (typeof document !== "undefined" && document.fonts) {
                document.fonts.ready.then(safeRefresh).catch(() => {});
            }
            const t1 = setTimeout(safeRefresh, 400);
            const t2 = setTimeout(safeRefresh, 1400);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                window.removeEventListener("resize", resize);
                window.removeEventListener("load", safeRefresh);
                st.kill();
            };
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="ub-pin-scrub" style={{ background: bg }}>
            <div className="ub-pin-stage">
                <canvas ref={canvasRef} className="ub-scrub-canvas" />
                <div className="ub-scrub-vignette" />
                {lines.map((l, i) => (
                    <div
                        key={i}
                        ref={(el) => { lineRefs.current[i] = el; }}
                        className="ub-scrub-line"
                    >
                        {l.kicker && <span className="ub-scrub-kicker">{l.kicker}</span>}
                        <h2 className="ub-scrub-title">{l.title}</h2>
                    </div>
                ))}
            </div>
        </section>
    );
}
