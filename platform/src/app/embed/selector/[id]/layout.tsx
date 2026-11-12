import { Suspense } from "react";

import { EmbedBridge } from "@/features/selector/components/public/embed-bridge";
import { EmbedGate } from "@/features/selector/components/public/embed-gate";
import { SiteIntlProvider } from "@/features/site-builder/components/site-intl";
import { defaultLocale } from "@/i18n/config";

/**
 * Publisert boligvelger og enhetssider. Broen gir beskjed til web-komponenten
 * når velgeren er bygd inn. Sperren viser en lenke i stedet for velgeren når
 * den er bygd inn på et annet nettsted og pakken ikke har innbygging.
 */
export default function EmbeddedSelectorLayout({ children }: LayoutProps<"/embed/selector/[id]">) {
  // Bare tekstene den publiserte velgeren bruker, som på prosjektsidene.
  return (
    <SiteIntlProvider locale={defaultLocale}>
      <EmbedGate>{children}</EmbedGate>
      <Suspense fallback={null}>
        <EmbedBridge />
      </Suspense>
    </SiteIntlProvider>
  );
}
