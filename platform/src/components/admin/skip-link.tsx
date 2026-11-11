"use client";

/**
 * «Hopp til innhold». Next.js beholder tidligere sider skjult i DOM-en, så det kan
 * finnes flere <main>. Lenken flytter fokus til den synlige.
 */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#innhold"
      onClick={(event) => {
        const target = Array.from(document.querySelectorAll<HTMLElement>("main")).find(
          (element) => element.getClientRects().length > 0,
        );
        if (target) {
          event.preventDefault();
          target.tabIndex = -1;
          target.focus();
          target.scrollIntoView();
        }
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
    >
      {label}
    </a>
  );
}
