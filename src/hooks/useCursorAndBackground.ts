"use client";
import cursorAnimation from "@/utils/cursorAnimation";
import { useEffect } from "react";

type CursorConfig = {
  bgColor?: "white" | "black" | "custom" | string;
  customClass?: string;
};

export const useCursorAndBackground = (config: CursorConfig = {}) => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Add base cursor class
    document.body.classList.add("tp-magic-cursor");

    // Store original background
    const originalBg = document.body.style.backgroundColor;

    // Apply background
    if (config.bgColor === "white") {
      document.body.classList.add("cursor-white-bg");
    } else if (config.bgColor === "black") {
      document.body.classList.add("cursor-black-bg");
    } else if (config.bgColor) {
      document.body.style.backgroundColor = config.bgColor;
    }

    // Apply custom class if provided
    if (config.customClass) {
      document.body.classList.add(config.customClass);
    }

    // Add cursor elements only if not present
    if (!document.querySelector("#magic-cursor")) {
      const cursorHtml = `
        <div id="magic-cursor" class="tp-cursor"></div>
        <div class="tp-cursor-effect"></div>
      `;
      document.body.insertAdjacentHTML("beforeend", cursorHtml);
    }

    // Run animation
    const cursorEl = document.querySelector("#magic-cursor");
    if (cursorEl) {
      requestAnimationFrame(cursorAnimation);
    }

    // Cleanup
    return () => {
      document.body.classList.remove("tp-magic-cursor");
      if (config.customClass) document.body.classList.remove(config.customClass);
      document.body.classList.remove("cursor-white-bg", "cursor-black-bg");

      // Restore original background
      document.body.style.backgroundColor = originalBg;

      // Remove cursor elements
      document.querySelectorAll(".tp-cursor, .tp-cursor-effect").forEach((el) => el.remove());
    };
  }, [config.bgColor, config.customClass]);
};
