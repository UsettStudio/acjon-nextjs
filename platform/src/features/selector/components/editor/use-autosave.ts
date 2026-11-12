"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { EditorHotspot } from "@/features/selector/model";
import type { ViewHistories } from "@/features/selector/components/editor/use-editor-histories";

export type SaveStatus = "saved" | "pending" | "saving" | "error";

type SaveResult = { ok: true } | { ok: false; error: string };

const DELAY_MS = 700;

/** En ny visning uten markeringer trenger ikke lagres før noe er tegnet i den. */
function isDirty(history: ViewHistories[string], saved: EditorHotspot[] | undefined): boolean {
  if (saved === undefined) {
    return history.present.length > 0 || history.past.length > 0;
  }
  return history.present !== saved;
}

/**
 * Lagrer markeringene automatisk kort tid etter siste endring. Hver lagring
 * sender hele visningen, så rekkefølgen på lagringene spiller ingen rolle for
 * resultatet. Mislykkes en lagring, vises feilen, og neste endring prøver igjen.
 */
export function useAutosave(
  histories: ViewHistories,
  save: (viewId: string, hotspots: EditorHotspot[]) => Promise<SaveResult>,
) {
  const [saved, setSaved] = useState<Record<string, EditorHotspot[]>>(() =>
    Object.fromEntries(Object.entries(histories).map(([viewId, history]) => [viewId, history.present])),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(histories);
  const savedRef = useRef(saved);
  const running = useRef<Promise<boolean> | null>(null);
  const saveRef = useRef(save);

  useEffect(() => {
    latest.current = histories;
    saveRef.current = save;
  });

  const dirty = Object.entries(histories).some(([viewId, history]) => isDirty(history, saved[viewId]));
  const status: SaveStatus = error ? "error" : saving ? "saving" : dirty ? "pending" : "saved";

  const run = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    try {
      for (;;) {
        const pending = Object.entries(latest.current).filter(([viewId, history]) => isDirty(history, savedRef.current[viewId]));
        if (pending.length === 0) {
          return true;
        }
        for (const [viewId, history] of pending) {
          const snapshot = history.present;
          const result = await saveRef.current(viewId, snapshot);
          if (!result.ok) {
            if (!(viewId in latest.current)) {
              // Visningen ble slettet mens den ventet på lagring. Da er det ingenting å lagre.
              savedRef.current = { ...savedRef.current, [viewId]: snapshot };
              continue;
            }
            setError(result.error);
            return false;
          }
          savedRef.current = { ...savedRef.current, [viewId]: snapshot };
          setSaved(savedRef.current);
        }
      }
    } finally {
      setSaving(false);
    }
  }, []);

  /** Lagrer det som ikke er lagret ennå. Venter på en lagring som allerede pågår. */
  const flush = useCallback(async (): Promise<boolean> => {
    while (running.current) {
      await running.current;
    }
    setError(null);
    const promise = run();
    running.current = promise;
    try {
      return await promise;
    } finally {
      running.current = null;
    }
  }, [run]);

  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });

  useEffect(() => {
    if (!dirty || saving || error) {
      return;
    }
    const timer = setTimeout(() => void flushRef.current(), DELAY_MS);
    return () => clearTimeout(timer);
  }, [dirty, saving, error, histories]);

  // Varsle før siden lukkes med endringer som ikke er lagret.
  useEffect(() => {
    if (status === "saved") {
      return;
    }
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [status]);

  // Lagre det som gjenstår når editoren lukkes inne i appen (lenker, tilbakeknapp).
  useEffect(() => {
    return () => {
      void flushRef.current();
    };
  }, []);

  /** Ny endring etter en feil: prøv igjen med en gang. */
  const clearError = useCallback(() => setError(null), []);

  return { status, error, flush, clearError };
}
