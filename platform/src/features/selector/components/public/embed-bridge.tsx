"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { LEAD_SUBMITTED_EVENT, type LeadSubmittedDetail } from "@/features/leads/events";

/**
 * Meldinger til web-komponenten <boligvelger-embed> når velgeren ligger i en
 * iframe på et annet nettsted. Samme navn som MESSAGE_TYPES i
 * src/embed/boligvelger-embed.ts (testet). Meldingene har ingen
 * personopplysninger, så de kan sendes til vertssiden uansett opprinnelse;
 * komponenten sjekker selv at de kommer fra plattformen.
 */
export const EMBED_MESSAGES = {
  ready: "boligvelger:ready",
  navigate: "boligvelger:navigate",
  lead: "boligvelger:lead",
} as const;

function post(message: Record<string, unknown>) {
  if (window.parent !== window) {
    window.parent.postMessage(message, "*");
  }
}

export function EmbedBridge() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    post({ type: EMBED_MESSAGES.ready });
    function onLead(event: Event) {
      const detail = (event as CustomEvent<LeadSubmittedDetail>).detail;
      post({ type: EMBED_MESSAGES.lead, unitId: detail?.unitId ?? null });
    }
    window.addEventListener(LEAD_SUBMITTED_EVENT, onLead);
    return () => window.removeEventListener(LEAD_SUBMITTED_EVENT, onLead);
  }, []);

  useEffect(() => {
    post({ type: EMBED_MESSAGES.navigate, path: query ? `${pathname}?${query}` : pathname });
  }, [pathname, query]);

  return null;
}
