"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DraftSaveStatus = "saved" | "pending" | "saving" | "invalid" | "error";

type SaveResult = { ok: true } | { ok: false; error: string };

const DELAY_MS = 800;

/**
 * Lagrer utkastet automatisk kort tid etter siste endring. Utkastet er delt i
 * deler (én per side, og én for menyen, bunnteksten, temaet og SEO). En del
 * regnes som endret når objektet er byttet ut, så endringer må lage nye objekter.
 *
 * Deler med ugyldige felt lagres ikke før feilene er rettet. Da vises status
 * «invalid», og nettleseren varsler før siden lukkes.
 */
export function useDraftAutosave(
  parts: Record<string, unknown>,
  save: (key: string, value: unknown) => Promise<SaveResult>,
  isValid: (key: string, value: unknown) => boolean,
) {
  const [saved, setSaved] = useState<Record<string, unknown>>(() => ({ ...parts }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(parts);
  const savedRef = useRef(saved);
  const running = useRef<Promise<boolean> | null>(null);
  const saveRef = useRef(save);
  const isValidRef = useRef(isValid);

  useEffect(() => {
    latest.current = parts;
    saveRef.current = save;
    isValidRef.current = isValid;
  });

  const dirtyKeys = Object.keys(parts).filter((key) => parts[key] !== saved[key]);
  const invalid = dirtyKeys.some((key) => !isValid(key, parts[key]));
  const savable = dirtyKeys.some((key) => isValid(key, parts[key]));
  const status: DraftSaveStatus = error ? "error" : saving ? "saving" : invalid ? "invalid" : dirtyKeys.length > 0 ? "pending" : "saved";

  const run = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    try {
      for (;;) {
        const pending = Object.entries(latest.current).filter(
          ([key, value]) => value !== savedRef.current[key] && isValidRef.current(key, value),
        );
        if (pending.length === 0) {
          return !Object.entries(latest.current).some(([key, value]) => value !== savedRef.current[key]);
        }
        for (const [key, value] of pending) {
          const result = await saveRef.current(key, value);
          if (!result.ok) {
            if (!(key in latest.current)) {
              // Delen er fjernet (for eksempel en slettet side). Ingenting å lagre.
              savedRef.current = { ...savedRef.current, [key]: value };
              continue;
            }
            setError(result.error);
            return false;
          }
          savedRef.current = { ...savedRef.current, [key]: value };
          setSaved(savedRef.current);
        }
      }
    } finally {
      setSaving(false);
    }
  }, []);

  /** Lagrer det som kan lagres. true når alt er lagret. Venter på en lagring som pågår. */
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

  /** Verdien er allerede lagret på serveren (ny side, gjenopprettet versjon). */
  const markSaved = useCallback((key: string, value: unknown) => {
    savedRef.current = { ...savedRef.current, [key]: value };
    setSaved(savedRef.current);
  }, []);

  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });

  useEffect(() => {
    if (!savable || saving || error) {
      return;
    }
    const timer = setTimeout(() => void flushRef.current(), DELAY_MS);
    return () => clearTimeout(timer);
  }, [savable, saving, error, parts]);

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

  // Lagre det som gjenstår når editoren lukkes inne i appen.
  useEffect(() => {
    return () => {
      void flushRef.current();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { status, error, flush, markSaved, clearError };
}
