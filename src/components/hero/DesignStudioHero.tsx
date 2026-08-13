"use client";

/**
 * DesignStudioHero – scroll-styrt 3D-hero for Usett.
 *
 * Bygget roterer når man scroller: en canvas-bildesekvens (orbit-klippet)
 * skrubbes av scrollposisjonen, akkurat som på /byggeprosessen.
 *
 * Forsiden kjører inne i GSAP ScrollSmoother (transform-basert scroll),
 * som IKKE er kompatibel med position:sticky. Derfor pinnes hero-seksjonen
 * med GSAP ScrollTrigger (pin + scrub), som er fullt kompatibel med
 * ScrollSmoother. Frame-indeksen styres direkte av trigger-progressen.
 */
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AnimatedCounterTwo from "../shared/Counter/AnimatedCounterTwo";
import { ButtonArrowIcon } from "@/svg";
import NextImage from "next/image";
import Link from "next/link";

const FRAME_DIR = "/assets/scroll/orbit";
const FRAME_COUNT = 120;
const BG = "#010103";

const counterData = [
    {
        id: 1,
        duration: 1,
        end: 10,
        symbol: "+",
        label: "Års erfaring",
    },
    {
        id: 2,
        duration: 2,
        end: 120,
        symbol: "+",
        label: "Leverte prosjekter",
    },
    {
        id: 3,
        duration: 2,
        end: 48,
        symbol: "t",
        label: "Rask levering",
    },
];

const DesignStudioHero = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
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
                ctx.fillStyle = BG;
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

            // ============================================================
            // MOBIL (<768px): egen scrub UTEN GSAP-pin.
            //
            // ScrollSmoother opprettes ikke under 768px (se useScrollSmooth.ts).
            // En ScrollTrigger-pin uten smoother bruker position:fixed, og på
            // telefon kollapser adresselinjen når man scroller => innerHeight
            // endres => pin-lengden («+= innerHeight * 2.6») blir re-målt midt i
            // scrollingen, og ALT under heroen forskyves (tomme felt lenger nede).
            //
            // Løsningen: la CSS gjøre pinningen med `position: sticky` på
            // .ds-hero-scrub inne i #top (se globals.scss, @media max-width:767px).
            // Sticky er trygt her nettopp fordi ScrollSmoother IKKE er aktiv –
            // det er transformen fra smootheren som ellers ødelegger sticky.
            //
            // Frame-indeksen regnes ut fra #top sin faktiske posisjon ved HVER
            // scroll-event. Da leses innerHeight og rect på nytt hver gang, og
            // adresselinja kan kollapse så mye den vil uten at noe glipper.
            // ============================================================
            const isDesktop = window.matchMedia("(min-width: 768px)").matches;

            if (!isDesktop) {
                // Hver 3. frame => 40 bilder (~4,7 MB) i stedet for 120 (~14 MB).
                // 40 steg er rikelig for at rotasjonen skal se jevn ut.
                const MOBILE_STEP = 3;
                const mobileFrames: number[] = [];
                for (let i = 0; i < FRAME_COUNT; i += MOBILE_STEP) mobileFrames.push(i);
                if (mobileFrames[mobileFrames.length - 1] !== FRAME_COUNT - 1) {
                    mobileFrames.push(FRAME_COUNT - 1);
                }

                mobileFrames.forEach((n, k) => {
                    const img = new Image();
                    img.src = `${FRAME_DIR}/frame_${pad(n + 1)}.jpg`;
                    img.onload = () => {
                        // Tegn så snart bildet vi faktisk står på er nede, så
                        // heroen aldri blir stående svart mens resten lastes.
                        // (k === 0 er første bilde – det trengs med én gang.)
                        if (frameRef.current < 0) frameRef.current = n;
                        if (frameRef.current === n || k === 0) draw(frameRef.current);
                    };
                    images[n] = img;
                });

                // Sporet som heroen «henger fast» i = #top.
                const track =
                    (root.closest("#top") as HTMLElement | null) ?? root.parentElement;

                let ticking = false;

                const update = () => {
                    ticking = false;
                    if (!track) return;
                    const span = track.offsetHeight - window.innerHeight;
                    if (span <= 0) return;
                    const progress = Math.min(
                        1,
                        Math.max(0, -track.getBoundingClientRect().top / span)
                    );
                    const wanted = Math.round(progress * (FRAME_COUNT - 1));
                    // Nærmeste frame vi faktisk har lastet på mobil.
                    let best = mobileFrames[0];
                    for (const n of mobileFrames) {
                        if (Math.abs(n - wanted) < Math.abs(best - wanted)) best = n;
                    }
                    if (best !== frameRef.current) {
                        frameRef.current = best;
                        draw(best);
                    }
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

                resize();
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

            for (let i = 0; i < FRAME_COUNT; i++) {
                const img = new Image();
                img.src = `${FRAME_DIR}/frame_${pad(i + 1)}.jpg`;
                img.onload = () => {
                    loaded++;
                    if (i === 0) {
                        frameRef.current = 0;
                        draw(0);
                    }
                    // MERK: ingen ScrollTrigger.refresh() her. Bildene endrer ikke
                    // layout (canvas har fast CSS-størrelse). En sen refresh når
                    // alle bildene er lastet re-målte alle pins – også bygg-pinnen
                    // lenger nede – midt i at man scrollet, noe som fikk den til å
                    // hoppe / "stoppe på feil sted".
                };
                images[i] = img;
            }

            resize();

            const st = ScrollTrigger.create({
                trigger: root,
                start: "top top",
                end: () => "+=" + window.innerHeight * 2.6,
                pin: true,
                pinSpacing: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                refreshPriority: 2, // øverste pin – måles først ved refresh
                onUpdate: (self) => {
                    const idx = Math.min(
                        FRAME_COUNT - 1,
                        Math.round(self.progress * (FRAME_COUNT - 1))
                    );
                    if (idx !== frameRef.current) {
                        frameRef.current = idx;
                        draw(idx);
                    }
                },
            });

            // Refresh etter at fonter/layout har satt seg. ScrollTrigger.refresh()
            // re-måler ALLE pins (også bygg-pinnen lenger nede), så det er her
            // fontbyttet – som krymper innholdet over bygg-seksjonen – fanges
            // opp. Hopper over refresh dersom man akkurat da er inne i en pin,
            // men blokkerer ikke senere kall. Ingen refresh på bilde-lasting.
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
        <div
            ref={rootRef}
            className="ds-hero-ptb ds-hero-bg ds-hero-scrub include-bg fix"
            style={{ backgroundImage: `url(/assets/img/design-studio/hero/hero-bg.png)` }}
        >
            {/* 3D-bygget som roterer når man scroller (orbit-bildesekvens) */}
            <canvas ref={canvasRef} className="ds-hero-scrub-canvas" />
            <div className="ds-hero-bg-overlay"></div>
            <div className="ds-hero-scroll-hint" aria-hidden="true">
                <span></span>
            </div>
            <div className="container container-1510">
                <div className="ds-hero-top pb-145">
                    <div className="row align-items-start">
                        <div className="col-lg-6">
                            <div className="ds-hero-heading-wrap">
                                {/* SEO: dette MÅ være sidens h1. Forsiden hadde
                                    ingen h1 i det hele tatt frem til 13.08.26.
                                    `.ds-hero-title` er en ren klasseselektor i
                                    CSS-en, så utseendet er uendret. */}
                                <h1 className="ds-hero-title tp_fade_anim" data-delay=".3">
                                    Fotorealistisk 3D-visualisering som gir <br />
                                    ideene dine liv – presisjon, <br />
                                    kvalitet og detaljer.
                                </h1>
                                <div className="ds-hero-btn tp_fade_anim" data-delay=".4">
                                    <Link className="tp-btn-green btn-h-60 tp-btn-anim" href="#kontakt-skjema">
                                        <div className="tp-btn-text">ta kontakt </div>{""}
                                        <span>
                                            <ButtonArrowIcon />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="ds-hero-counter-wrapper d-flex justify-content-between justify-content-lg-end tp_fade_anim" data-delay=".3">
                                {counterData.map(({ id, end, symbol, label }) => (
                                    <div key={id} className="ds-hero-counter-item">
                                        <h4 className="ds-hero-counter-title">
                                            <AnimatedCounterTwo min={0} max={end} />{" "}
                                            {symbol}
                                        </h4>
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ds-hero-bottom">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="ds-hero-text-wrap tp_fade_anim" data-delay=".6">
                                <NextImage
                                    className="ds-hero-logo"
                                    src="/assets/img/logo/logo-white-v2.png"
                                    alt="Usett 3D Studio – 3D-visualisering i Østfold"
                                    width={620}
                                    height={425}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignStudioHero;
