"use client";

/**
 * PinnedVideoScrub – scroll-skrubbet <video> som PINNES med GSAP ScrollTrigger.
 *
 * Samme pin-/låse-teknikk som PinnedFrameScrub (som er nøye justert for at
 * seksjonen skal låse seg riktig uten hvit glipe), men i stedet for en
 * bildesekvens spiller vi ÉN mp4 og skrubber den med `currentTime`.
 *
 * Videoen er kodet ALL-INTRA (hver frame er et keyframe), slik at seeking til
 * en vilkårlig currentTime er umiddelbar => jevn skrubbing uten hakking.
 *
 * Ingen tekst-overlay (byggetrinn er fjernet).
 */
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

export default function PinnedVideoScrub({
    src,
    scrollFactor = 4.5,
    bg = "#010103",
}: {
    src: string;
    scrollFactor?: number;
    bg?: string;
}) {
    const rootRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useGSAP(
        () => {
            const root = rootRef.current;
            const video = videoRef.current;
            if (!root || !video) return;

            gsap.registerPlugin(ScrollTrigger);

            let duration = 0;
            const onMeta = () => {
                duration = video.duration || 0;
                // Tegn første frame med en gang (så seksjonen ikke er svart før man scroller)
                try { video.currentTime = 0.001; } catch { /* noop */ }
            };
            video.addEventListener("loadedmetadata", onMeta);
            if (video.readyState >= 1) onMeta();

            // Skrubbing: sett currentTime fra scroll-progress. All-intra => rask seek.
            // Vi hopper over nye seeks mens én pågår, og tar igjen siste mål i "seeked".
            let target = 0;
            const applySeek = () => {
                if (!duration) return;
                const clamped = Math.max(0, Math.min(duration - 0.001, target));
                if (!video.seeking && Math.abs(video.currentTime - clamped) > 0.001) {
                    video.currentTime = clamped;
                }
            };
            const onSeeked = () => applySeek();
            video.addEventListener("seeked", onSeeked);

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
                    target = self.progress * duration;
                    applySeek();
                },
            });

            // Samme refresh-strategi som PinnedFrameScrub: mål pinnen på nytt ETTER at
            // layouten over seksjonen har satt seg (fontbytte m.m.), men aldri mens man
            // står inne i pinnen (ville hoppet i scrollen). Video-elementet har fast
            // CSS-størrelse (100vh), så selve videoen forårsaker ingen reflow.
            const safeRefresh = () => {
                if (st.isActive) return;
                ScrollTrigger.refresh();
            };
            window.addEventListener("resize", safeRefresh);
            window.addEventListener("load", safeRefresh);
            if (typeof document !== "undefined" && document.fonts) {
                document.fonts.ready.then(safeRefresh).catch(() => {});
            }
            const t1 = setTimeout(safeRefresh, 400);
            const t2 = setTimeout(safeRefresh, 1400);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                window.removeEventListener("resize", safeRefresh);
                window.removeEventListener("load", safeRefresh);
                video.removeEventListener("loadedmetadata", onMeta);
                video.removeEventListener("seeked", onSeeked);
                st.kill();
            };
        },
        { scope: rootRef }
    );

    return (
        <section ref={rootRef} className="ub-pin-scrub" style={{ background: bg }}>
            <div className="ub-pin-stage">
                <video
                    ref={videoRef}
                    className="ub-scrub-video"
                    src={src}
                    muted
                    playsInline
                    preload="auto"
                />
                <div className="ub-scrub-vignette" />
            </div>
        </section>
    );
}
