"use client";

import { useMemo, useSyncExternalStore } from "react";

const CHANGE_EVENT = "boligvelger:adresse";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * Søkeparametrene i adressen (filtre og visning i boligvelgeren).
 *
 * useSearchParams fra Next.js gjør at alt opp til nærmeste Suspense-grense bare
 * rendres i nettleseren når siden lages statisk. Denne leser adressen med
 * useSyncExternalStore i stedet: på serveren og i den statiske siden er den tom, så
 * siden har alle boligene i HTML-en. Filtrene fra adressen brukes rett etter at
 * siden er lastet.
 */
export function useLocationSearch(): URLSearchParams {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  return useMemo(() => new URLSearchParams(search), [search]);
}

/** Endrer søkeparametrene i adressen uten å laste siden, og gir beskjed til useLocationSearch. */
export function setLocationSearch(params: URLSearchParams, mode: "push" | "replace") {
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (mode === "push") {
    window.history.pushState(null, "", url);
  } else {
    window.history.replaceState(null, "", url);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
