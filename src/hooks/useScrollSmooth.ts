"use client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

let smoother: ScrollSmoother | null = null;

export const getScrollSmoother = () => smoother;

export default function useScrollSmooth() {
  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const wrapper = document.getElementById("smooth-wrapper");
    const content = document.getElementById("smooth-content");
    if (!wrapper || !content) return;

    if (window.innerWidth >= 768) {
      smoother = ScrollSmoother.create({
        wrapper,
        content,
        smooth: 2,
        effects: true,
        smoothTouch: 0.3,
        normalizeScroll: true,
      });
    }

    return () => {
      smoother?.kill();
      smoother = null;
    };
  }, []);
}
