"use client";

/**
 * HouseBuildFilm – «fra strek til ferdig hus».
 *
 * Scroll-skrubbet canvas-bildesekvens (public/hero/frames + frames-mobile),
 * bygget etter NØYAKTIG samme oppskrift som DesignStudioHero – den eneste
 * scroll-mekanikken på denne siden som er verifisert på ekte telefon.
 *
 *  • DESKTOP (>=768px): ScrollSmoother er aktiv, og smootherens transform
 *    ødelegger `position: sticky`. Derfor pinnes seksjonen med GSAP
 *    ScrollTrigger (pin + scrub), som er fullt kompatibel med smootheren.
 *
 *  • MOBIL (<768px): ScrollSmoother opprettes IKKE (se useScrollSmooth.ts).
 *    Da faller en ScrollTrigger-pin tilbake på `position: fixed`, og når
 *    adresselinja kollapser endrer innerHeight seg => pin-lengden re-måles
 *    midt i scrollingen => alt under hopper. Derfor: ingen GSAP i det hele
 *    tatt på mobil. CSS gjør pinningen med ekte `position: sticky` (trygt
 *    nettopp fordi smootheren ikke er aktiv), og frame-indeksen regnes ut
 *    fra sporets faktiske posisjon ved HVER scroll-event – da leses
 *    innerHeight og rect på nytt hver gang.
 *
 * Se `.uh-film*` i globals.scss. CSS og komponent hører sammen.
 */
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/** Alle bildene finnes i begge mapper, frame_0001 … frame_0144. */
const TOTAL = 144;
const DIR_DESKTOP = "/hero/frames";          // 1600x900
const DIR_MOBILE = "/hero/frames-mobile";    // 800x450
/** Hvert 2. bilde på desktop (73 stk, ~12 MB), hvert 3. på mobil (49 stk, ~2,6 MB). */
const STEP_DESKTOP = 2;
const STEP_MOBILE = 3;
/** Bakgrunn = samme som resten av forsiden, så «contain»-kantene på mobil forsvinner. */
const BG = "#F5F7F5";
/** Hvor lenge seksjonen står i ro på desktop, målt i skjermhøyder. */
const SCROLL_FACTOR = 2.6;

const pad = (n: number) => String(n).padStart(4, "0");

export default function HouseBuildFilm() {
    const trackRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef(-1);

    useGSAP(
        () => {
            const track = trackRef.current;
            const stage = stageRef.current;
            const canvas = canvasRef.current;
            if (!track || !stage || !canvas) return;
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) return;

            const isDesktop = window.matchMedia("(min-width: 768px)").matches;
            const dir = isDesktop ? DIR_DESKTOP : DIR_MOBILE;
            const step = isDesktop ? STEP_DESKTOP : STEP_MOBILE;

            // Hvilke kildebilder vi faktisk laster ned.
            const loadedIdx: number[] = [];
            for (let i = 0; i < TOTAL; i += step) loadedIdx.push(i);
            if (loadedIdx[loadedIdx.length - 1] !== TOTAL - 1) loadedIdx.push(TOTAL - 1);

            const images: HTMLImageElement[] = [];

            // ---------------------------------------------------------------
            // Tegning
            // ---------------------------------------------------------------
            // Desktop-viewporten er omtrent 16:9 som bildene, så «cover» gir
            // full bredde uten synlig beskjæring. På en høy telefonskjerm ville
            // cover kuttet bort mesteparten av huset – der brukes «contain», og
            // de smale feltene over/under får sidens egen bakgrunnsfarge.
            const useCover = isDesktop;

            const paint = (img: HTMLImageElement) => {
                const cw = canvas.clientWidth;
                const ch = canvas.clientHeight;
                if (!cw || !ch) return;
                const ir = img.naturalWidth / img.naturalHeight;
                const cr = cw / ch;
                let dw: number, dh: number;
                if (useCover ? ir > cr : ir <= cr) {
                    dh = ch;
                    dw = ch * ir;
                } else {
                    dw = cw;
                    dh = cw / ir;
                }
                ctx.fillStyle = BG;
                ctx.fillRect(0, 0, cw, ch);
                ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
            };

            /**
             * Tegn ønsket bilde – eller det nærmeste som faktisk er lastet ned.
             * Uten dette kunne seksjonen bli stående tom mens bildene lastes,
             * fordi bare ett bestemt bilde ville ha truffet.
             */
            const drawNearestLoaded = (wanted: number) => {
                let best = -1;
                let bestDist = Infinity;
                for (const n of loadedIdx) {
                    const img = images[n];
                    if (!img || !img.complete || !img.naturalWidth) continue;
                    const d = Math.abs(n - wanted);
                    if (d < bestDist) {
                        bestDist = d;
                        best = n;
                    }
                }
                if (best < 0) return;
                paint(images[best]);
            };

            const resize = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                canvas.width = Math.max(1, canvas.clientWidth * dpr);
                canvas.height = Math.max(1, canvas.clientHeight * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                drawNearestLoaded(Math.max(frameRef.current, 0));
            };

            /** Sett tilstand ut fra en progresjon 0..1. */
            const setProgress = (p: number) => {
                const wanted = Math.round(
                    Math.min(1, Math.max(0, p)) * (TOTAL - 1)
                );
                if (wanted === frameRef.current) return;
                frameRef.current = wanted;
                drawNearestLoaded(wanted);
            };

            // ---------------------------------------------------------------
            // Nedlasting
            // ---------------------------------------------------------------
            loadedIdx.forEach((n) => {
                const img = new Image();
                img.src = `${dir}/frame_${pad(n + 1)}.jpg`;
                img.onload = () => {
                    // Tegn på nytt hver gang et bilde lander, så vi aldri blir
                    // stående med tom flate mens sekvensen laster.
                    drawNearestLoaded(Math.max(frameRef.current, 0));
                };
                images[n] = img;
            });

            resize();

            // ===============================================================
            // MOBIL – CSS sticky + egen scroll-lytter
            // ===============================================================
            if (!isDesktop) {
                let ticking = false;

                const update = () => {
                    ticking = false;
                    // Sporet er 300svh og stagen 100svh, så dette spennet er
                    // KONSTANT. Bevisst ikke window.innerHeight: den endrer seg
                    // når adresselinja kollapser, og da ville progresjonen
                    // hoppet midt i scrollingen.
                    const span = track.offsetHeight - stage.offsetHeight;
                    if (span <= 0) return;
                    setProgress(-track.getBoundingClientRect().top / span);
                };

                const onScroll = () => {
                    if (ticking) return;
                    ticking = true;
                    requestAnimationFrame(update);
                };

                const onResize = () => {
                    resize();
                    update();
                };

                update();
                window.addEventListener("scroll", onScroll, { passive: true });
                window.addEventListener("resize", onResize);
                window.addEventListener("orientationchange", onResize);

                return () => {
                    window.removeEventListener("scroll", onScroll);
                    window.removeEventListener("resize", onResize);
                    window.removeEventListener("orientationchange", onResize);
                };
            }

            // ===============================================================
            // DESKTOP – GSAP-pin
            // ===============================================================
            gsap.registerPlugin(ScrollTrigger);

            const st = ScrollTrigger.create({
                trigger: stage,
                start: "top top",
                end: () => "+=" + window.innerHeight * SCROLL_FACTOR,
                pin: true,
                pinSpacing: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                refreshPriority: 1, // etter hero-pinnen (prioritet 2)
                onUpdate: (self) => setProgress(self.progress),
            });

            // Mål pinnen på nytt etter at fonter/layout over seksjonen har satt
            // seg – ellers kan starten bli feil og etterlate en glipe. Hopper
            // over hvis man akkurat da står inne i pinnen (ville flyttet
            // scrollen), men blokkerer ikke senere kall.
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
        { scope: trackRef }
    );

    return (
        <div id="byggefilm" ref={trackRef} className="uh-film-track">
            <div ref={stageRef} className="uh-film">
                <canvas ref={canvasRef} className="uh-film-canvas" />
            </div>
        </div>
    );
}
