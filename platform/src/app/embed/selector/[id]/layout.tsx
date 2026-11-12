import { Suspense } from "react";

import { EmbedBridge } from "@/features/selector/components/public/embed-bridge";

/** Publisert boligvelger og enhetssider. Broen gir beskjed til web-komponenten når velgeren er bygd inn. */
export default function EmbeddedSelectorLayout({ children }: LayoutProps<"/embed/selector/[id]">) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <EmbedBridge />
      </Suspense>
    </>
  );
}
