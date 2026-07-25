'use client';
import { useEffect, useRef, useState } from "react";

interface CounterProps {
  min: number;
  max: number;
  cls?: string;
}

export default function AnimatedCounter({ min, max, cls = 'purecounter' }: CounterProps) {
  const [counted, setCounted] = useState<number>(min);
  const targetElement = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = targetElement.current;

    const startCountup = () => {
      if (startedRef.current) return; // kjør bare én gang
      startedRef.current = true;
      setCounted(min);
      const step = Math.max(1, Math.ceil(max / 20));
      intervalRef.current = setInterval(() => {
        setCounted((pre) => {
          const next = pre + step;
          if (next >= max) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return max;
          }
          return next;
        });
      }, 70);
    };

    // Start når elementet kommer til syne
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startCountup();
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
    );
    if (el) observer.observe(el);

    // Sikkerhetsnett: i enkelte produksjonsbygg (inne i ScrollSmoother) har
    // IntersectionObserver noen ganger ikke fyrt, og tallet ble stående på 0.
    // Denne fallbacken sørger for at telleren uansett når riktig verdi.
    const fallback = setTimeout(startCountup, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span ref={targetElement} className={cls}>{counted}</span>;
}
