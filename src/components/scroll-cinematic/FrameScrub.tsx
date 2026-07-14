"use client";

/**
 * FrameScrub — scroll-skrubbet canvas-bildesekvens (Usett).
 * En sticky 100vh-scene inne i en høy seksjon; scrollposisjonen
 * bestemmer hvilken frame som tegnes, så klippet "spilles" av scrollingen.
 */
import { useEffect, useRef } from "react";

export type ScrubLine = {
    kicker?: string;
    title: string;
    in: number;
    out: number;
};

export default function FrameScrub({
    frameDir,
    frameCount = 120,
    lines = [],
    scrollVh = 500,
    bg = "#010103",
}: {
    frameDir: string;
    frameCount?: number;
    lines?: ScrubLine[];
    scrollVh?: number;
    bg?: string;
}) {
    const sectionRef = useRef<HTMLElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
    const frameRef = useRef(-1);

    useEffect(() => {
        const canvas = canvasRef.current;
        const section = sectionRef.current;
        if (!canvas || !section) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const pad = (n: number) => String(n).padStart(4, "0");
        let firstDrawn = false;
        const images: HTMLImageElement[] = [];
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = `${frameDir}/frame_${pad(i + 1)}.jpg`;
            if (i === 0) {
                img.onload = () => {
                    if (!firstDrawn) {
                        firstDrawn = true;
                        draw(0);
                    }
                };
            }
            images[i] = img;
        }

        const draw = (index: number) => {
            const img = images[index];
            if (!img?.complete || !img.naturalWidth) return;
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
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            draw(Math.max(frameRef.current, 0));
        };

        let ticking = false;
        const render = () => {
            ticking = false;
            const rect = section.getBoundingClientRect();
            if (rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2) return;
            const scrollable = rect.height - window.innerHeight;
            const p = Math.min(Math.max(-rect.top / scrollable, 0), 1);

            const idx = Math.min(frameCount - 1, Math.floor(p * (frameCount - 1)));
            if (idx !== frameRef.current) {
                frameRef.current = idx;
                draw(idx);
            }

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
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(render);
            }
        };

        resize();
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", resize);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", resize);
        };
    }, [frameDir, frameCount, lines, bg]);

    return (
        <section ref={sectionRef} className="ub-scrub" style={{ height: `${scrollVh}vh`, background: bg }}>
            <div className="ub-scrub-stage">
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
