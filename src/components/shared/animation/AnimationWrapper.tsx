"use client";
import { fadeAnimation, splitTitleAnim } from "@/hooks/useGsapAnimation";
import { animationConfig } from "@/config/animationConfig";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

const AnimationWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Delay animation until DOM fully rendered + hydrated
    const runAnimations = () => {
      // Global animations
      fadeAnimation();
      splitTitleAnim();

      //Route-based animations
      Object.entries(animationConfig).forEach(([route, animations]) => {
        if (pathname === route || pathname.startsWith(`${route}/`)) {
          animations.forEach((fn) => fn());
        }
      });

      //Refresh ScrollTrigger
      ScrollTrigger.refresh();
    };

    // Run after next tick
    const id = requestAnimationFrame(runAnimations);

    return () => {
      cancelAnimationFrame(id);
      //kill all scroll triggers before rerun
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [pathname]);

  /* ------------------------------------------------------------------
   * MOBIL-SIKKERHETSNETT
   *
   * Reveal-animasjonene starter fra opacity 0 (fadeAnimation bruker
   * gsap.from, splitTitleAnim animerer .char fra 0). Fyrer ikke
   * ScrollTrigger – noe som skjer på telefon når målingene glipper –
   * blir innholdet stående usynlig, og seksjonen ser ut som et tomt
   * farget felt. Det var nettopp feilen på «Om oss» og i footeren.
   *
   * Her følger vi med: når et reveal-element har vært synlig i
   * viewporten i GRACE ms og FORTSATT er usynlig, tvinges det frem med
   * klassen .ub-force-visible (definert i globals.scss). Animasjonen
   * får altså kjøre normalt – nettet slår bare inn når den svikter.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    // Lengre enn den tregeste reveal-en (delay .6 + duration .75 ≈ 1,35 s).
    const GRACE = 2200;
    const SELECTOR =
      ".tp_fade_anim, .tp-anim-img, .tp-split-title, .tp-char-animation";

    const timers = new Map<Element, number>();

    const stillHidden = (el: Element) => {
      const cs = window.getComputedStyle(el);
      if (cs.visibility === "hidden") return true;
      if (parseFloat(cs.opacity) < 0.05) return true;
      // Split-titler: overskriften er synlig, men tegnene inni er ikke.
      const char = el.querySelector(".char");
      if (char && parseFloat(window.getComputedStyle(char).opacity) < 0.05) {
        return true;
      }
      return false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (!entry.isIntersecting) {
            const pending = timers.get(el);
            if (pending !== undefined) {
              clearTimeout(pending);
              timers.delete(el);
            }
            return;
          }
          if (timers.has(el)) return;
          timers.set(
            el,
            window.setTimeout(() => {
              timers.delete(el);
              if (stillHidden(el)) el.classList.add("ub-force-visible");
              observer.unobserve(el);
            }, GRACE)
          );
        });
      },
      { root: null, threshold: 0.01 }
    );

    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.classList.contains("ub-force-visible")) return;
        observer.observe(el);
      });
    };

    scan();
    // SplitText lager .char-elementene litt etter at siden er klar, og noen
    // seksjoner rendres sent – derfor et par ekstra skann.
    const rescan1 = window.setTimeout(scan, 1200);
    const rescan2 = window.setTimeout(scan, 3500);

    return () => {
      clearTimeout(rescan1);
      clearTimeout(rescan2);
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      observer.disconnect();
    };
  }, [pathname]);

  return <>{children}</>;
};

export default AnimationWrapper;