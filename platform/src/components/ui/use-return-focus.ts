"use client";

import { useRef } from "react";

type AutoFocusHandlers = {
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
};

/**
 * Radix-dialoger gir fokus tilbake til DialogTrigger når de lukkes. En dialog som
 * åpnes fra kode, for eksempel enhetskortet fra en markering i boligvelgeren, har
 * ingen trigger, og da havnet fokus på body (WCAG 2.4.3). Denne husker elementet
 * som hadde fokus da dialogen åpnet, og gir det fokus igjen når dialogen lukkes,
 * så lenge elementet fortsatt finnes. Ellers gjør Radix som før.
 */
export function useReturnFocus({ onOpenAutoFocus, onCloseAutoFocus }: AutoFocusHandlers) {
  const previous = useRef<HTMLElement | SVGElement | null>(null);
  return {
    onOpenAutoFocus(event: Event) {
      const active = document.activeElement;
      previous.current = (active instanceof HTMLElement || active instanceof SVGElement) && active !== document.body ? active : null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus(event: Event) {
      onCloseAutoFocus?.(event);
      const target = previous.current;
      previous.current = null;
      if (!event.defaultPrevented && target?.isConnected) {
        event.preventDefault();
        target.focus({ preventScroll: true });
      }
    },
  };
}
