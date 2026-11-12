"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "local-storage-state";

// Brukes når nettleseren ikke tillater localStorage (f.eks. enkelte private vinduer).
const memory = new Map<string, string>();

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}

/**
 * Tilstand som huskes i nettleseren (f.eks. hvilke kolonner som vises).
 * Serveren og første gjengivelse bruker standardverdien, så siden hydreres uten avvik.
 */
export function useLocalStorageState<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T | null,
): [T, (value: T | ((previous: T) => T)) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  let value = fallback;
  if (raw !== null) {
    try {
      value = parse(JSON.parse(raw)) ?? fallback;
    } catch {
      value = fallback;
    }
  }

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      let current = fallback;
      const stored = read(key);
      if (stored !== null) {
        try {
          current = parse(JSON.parse(stored)) ?? fallback;
        } catch {
          current = fallback;
        }
      }
      const resolved = typeof next === "function" ? (next as (previous: T) => T)(current) : next;
      write(key, JSON.stringify(resolved));
      window.dispatchEvent(new Event(EVENT));
    },
    [key, fallback, parse],
  );

  return [value, setValue];
}
