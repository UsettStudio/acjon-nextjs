"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

import { selectorPublicPath } from "@/features/selector/paths";
import { loadPublicBrowserClient } from "@/lib/supabase/public-browser";

const SELECTOR_PATH = /^\/embed\/selector\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

function subscribe(): () => void {
  return () => {};
}

/** Siden vises i en iframe på et annet nettsted (ikke i admin eller på prosjektsiden). */
function framedByOtherSite(): boolean {
  if (window.self === window.top) {
    return false;
  }
  try {
    return window.top?.location.origin !== window.location.origin;
  } catch {
    // Forelderen er på en annen opprinnelse, så adressen kan ikke leses.
    return true;
  }
}

/**
 * Innbygging på andre nettsteder er med i Pro og Partner (og prøveperioden).
 * Når velgeren vises i en iframe på et annet nettsted, spør komponenten
 * databasen (integration_allowed) om pakken har innbygging. Har den ikke det,
 * vises en lenke til den publiserte velgeren i stedet. Velgeren vises som før
 * på sin egen adresse og på prosjektsiden.
 */
export function EmbedGate({ children }: { children: ReactNode }) {
  const t = useTranslations("publicSelector.embedGate");
  const framed = useSyncExternalStore(subscribe, framedByOtherSite, () => false);
  // Velgeren som ikke kan vises her. Id-en leses fra adressen først når siden
  // er bygd inn, så sidene kan forhåndsgenereres som før.
  const [blockedSelector, setBlockedSelector] = useState<string | null>(null);

  useEffect(() => {
    const selectorId = framed ? SELECTOR_PATH.exec(window.location.pathname)?.[1] : undefined;
    if (!selectorId) {
      return;
    }
    let cancelled = false;
    void loadPublicBrowserClient()
      .then((supabase) => supabase.rpc("integration_allowed", { p_feature: "embed", p_selector_id: selectorId }))
      .then(({ data, error }) => {
        if (!cancelled && !error && data === false) {
          setBlockedSelector(selectorId);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [framed]);

  if (blockedSelector) {
    return (
      <main className="grid min-h-[50vh] place-items-center p-6 text-center">
        <div className="grid max-w-md gap-3">
          <p>{t("unavailable")}</p>
          <p>
            <a
              className="font-medium underline underline-offset-4"
              href={selectorPublicPath(blockedSelector)}
              target="_blank"
              rel="noopener"
            >
              {t("open")}
            </a>
          </p>
        </div>
      </main>
    );
  }
  return children;
}
