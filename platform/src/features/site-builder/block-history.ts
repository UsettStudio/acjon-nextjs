import type { Block } from "@/features/site-builder/blocks";
import { HISTORY_LIMIT } from "@/lib/history";

/**
 * Angre og gjør om i blokkeditoren, med egen historikk per side. Funksjonene
 * er rene, så de kan brukes i React sine oppdateringsfunksjoner.
 *
 * Endringer i samme gruppe innen ett sekund blir ett steg. Gruppen er blokken
 * som redigeres i skjemaet, så skriving i et felt angres som en helhet og ikke
 * ett tegn om gangen. Endringer uten gruppe (legge til, flytte, skjule, slette
 * og gjenopprette) er alltid egne steg.
 */

export const COALESCE_MS = 1000;

export type PageHistory = {
  past: Block[][];
  future: Block[][];
  /** Gruppen til siste steg, og når det ble tatt. */
  group: string | null;
  groupAt: number;
};

export type BlockHistories = Record<string, PageHistory>;

const EMPTY: PageHistory = { past: [], future: [], group: null, groupAt: 0 };

/** Blokkene på siden endres. `before` er blokkene før endringen. */
export function recordBlocks(
  histories: BlockHistories,
  pageId: string,
  before: Block[],
  group: string | null,
  now: number,
): BlockHistories {
  const history = histories[pageId] ?? EMPTY;
  const sameGroup = group !== null && history.group === group && now - history.groupAt < COALESCE_MS;
  const past = sameGroup ? history.past : [...history.past, before].slice(-HISTORY_LIMIT);
  return { ...histories, [pageId]: { past, future: [], group, groupAt: now } };
}

/** Forrige tilstand for siden, eller null når det ikke er noe å angre. */
export function undoBlocks(
  histories: BlockHistories,
  pageId: string,
  current: Block[],
): { histories: BlockHistories; blocks: Block[] } | null {
  const history = histories[pageId];
  const previous = history?.past[history.past.length - 1];
  if (!history || previous === undefined) {
    return null;
  }
  return {
    histories: { ...histories, [pageId]: { past: history.past.slice(0, -1), future: [current, ...history.future], group: null, groupAt: 0 } },
    blocks: previous,
  };
}

/** Neste tilstand for siden (det som ble angret), eller null. */
export function redoBlocks(
  histories: BlockHistories,
  pageId: string,
  current: Block[],
): { histories: BlockHistories; blocks: Block[] } | null {
  const history = histories[pageId];
  const next = history?.future[0];
  if (!history || next === undefined) {
    return null;
  }
  return {
    histories: {
      ...histories,
      [pageId]: { past: [...history.past, current].slice(-HISTORY_LIMIT), future: history.future.slice(1), group: null, groupAt: 0 },
    },
    blocks: next,
  };
}

export function canUndo(histories: BlockHistories, pageId: string): boolean {
  return (histories[pageId]?.past.length ?? 0) > 0;
}

export function canRedo(histories: BlockHistories, pageId: string): boolean {
  return (histories[pageId]?.future.length ?? 0) > 0;
}

/** Historikken for sider som ikke finnes lenger, glemmes. */
export function keepPages(histories: BlockHistories, pageIds: ReadonlySet<string>): BlockHistories {
  const entries = Object.entries(histories).filter(([pageId]) => pageIds.has(pageId));
  return entries.length === Object.keys(histories).length ? histories : Object.fromEntries(entries);
}
