'use client';
import { useEffect, useRef, useState } from "react";

interface CounterProps {
  min: number;
  max: number;
  cls?: string;
}

export default function AnimatedCounterTwo({ min, max, cls = 'purecounter' }: CounterProps) {
  const [counted, setCounted] = useState<number>(min);
  const targetElement = useRef<HTMLElement>(null);
  const startedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = targetElement.current;

    const startCountup = () => {
      // Kjør bare ÉN gang. Tidligere startet den på nytt hver gang elementet
      // krysset viewporten, og det gamle intervallet ble aldri ryddet – på
      // mobil (der heroen var pinnet) ga det hakking og tall som hoppet.
      if (startedRef.current) return;
      startedRef.current = true;
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startCountup();
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.5 }
    );
    if (el) observer.observe(el);

    // Sikkerhetsnett: IntersectionObserver fyrer ikke alltid inne i
    // ScrollSmoother / på pinnede seksjoner, og tallet ble da stående på 0.
    // Samme fallback som AnimatedCounter bruker.
    const fallback = setTimeout(startCountup, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <i ref={targetElement} className={cls}>{counted}</i>;
}
