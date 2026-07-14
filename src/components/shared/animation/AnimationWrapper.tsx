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

  return <>{children}</>;
};

export default AnimationWrapper;