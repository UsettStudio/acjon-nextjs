/**
 * Angre og gjør om. Hver endring lagres som en ny tilstand. Når grensen er
 * nådd, glemmes de eldste stegene. Spesifikasjonen krever minst 50 steg.
 */

export const HISTORY_LIMIT = 100;

export type History<T> = { past: T[]; present: T; future: T[] };

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/** Ny tilstand. Det som var angret, kan ikke gjøres om etterpå. */
export function pushHistory<T>(history: History<T>, next: T, limit = HISTORY_LIMIT): History<T> {
  if (Object.is(next, history.present)) {
    return history;
  }
  const past = [...history.past, history.present];
  return { past: past.length > limit ? past.slice(past.length - limit) : past, present: next, future: [] };
}

export function undoHistory<T>(history: History<T>): History<T> {
  const previous = history.past[history.past.length - 1];
  if (previous === undefined) {
    return history;
  }
  return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
}

export function redoHistory<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future;
  if (next === undefined) {
    return history;
  }
  return { past: [...history.past, history.present], present: next, future: rest };
}

/** Erstatter nåværende tilstand uten nytt steg (for eksempel underveis mens en form dras). */
export function replacePresent<T>(history: History<T>, present: T): History<T> {
  return { ...history, present };
}
