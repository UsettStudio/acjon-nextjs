"use client";

import { useEffect } from "react";

/**
 * Prosjektsiden vises på organisasjonens språk. Rotoppsettet setter lang til
 * standardspråket, så her settes det riktige språket på <html> når siden er lastet.
 * Innholdet er i tillegg merket med lang på rotelementet til prosjektsiden.
 */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
