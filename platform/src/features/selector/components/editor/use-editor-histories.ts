"use client";

import { useCallback, useState } from "react";

import type { EditorHotspot } from "@/features/selector/model";
import { createHistory, pushHistory, redoHistory, undoHistory, type History } from "@/lib/history";

export type ViewHistories = Record<string, History<EditorHotspot[]>>;

function mapHistory<T>(history: History<T>, fn: (value: T) => T): History<T> {
  return { past: history.past.map(fn), present: fn(history.present), future: history.future.map(fn) };
}

/**
 * Markeringene i hver visning, med egen angre-historikk per visning.
 * Angre gjelder visningen som er åpen, så et steg aldri endrer en visning man ikke ser.
 */
export function useEditorHistories(initial: Record<string, EditorHotspot[]>) {
  const [histories, setHistories] = useState<ViewHistories>(() =>
    Object.fromEntries(Object.entries(initial).map(([viewId, hotspots]) => [viewId, createHistory(hotspots)])),
  );

  const commit = useCallback((viewId: string, next: EditorHotspot[]) => {
    setHistories((current) => ({ ...current, [viewId]: pushHistory(current[viewId] ?? createHistory([]), next) }));
  }, []);

  const undo = useCallback((viewId: string) => {
    setHistories((current) => (current[viewId] ? { ...current, [viewId]: undoHistory(current[viewId]) } : current));
  }, []);

  const redo = useCallback((viewId: string) => {
    setHistories((current) => (current[viewId] ? { ...current, [viewId]: redoHistory(current[viewId]) } : current));
  }, []);

  const addView = useCallback((viewId: string) => {
    setHistories((current) => (current[viewId] ? current : { ...current, [viewId]: createHistory([]) }));
  }, []);

  /**
   * En visning er slettet. Markeringene i den er borte, og koblinger til den
   * fjernes i alle steg i historikken, så angre aldri gjenoppretter en død kobling.
   */
  const removeView = useCallback((viewId: string) => {
    setHistories((current) => {
      const next: ViewHistories = {};
      for (const [id, history] of Object.entries(current)) {
        if (id === viewId) {
          continue;
        }
        next[id] = mapHistory(history, (hotspots) =>
          hotspots.some((h) => h.target?.type === "view" && h.target.viewId === viewId)
            ? hotspots.map((h) => (h.target?.type === "view" && h.target.viewId === viewId ? { ...h, target: null } : h))
            : hotspots,
        );
      }
      return next;
    });
  }, []);

  /** En enhet er slettet. Koblinger til den fjernes overalt (databasen har allerede slettet markeringene). */
  const forgetUnit = useCallback((unitId: string) => {
    setHistories((current) => {
      let changed = false;
      const next: ViewHistories = {};
      for (const [id, history] of Object.entries(current)) {
        next[id] = mapHistory(history, (hotspots) => {
          if (!hotspots.some((h) => h.target?.type === "unit" && h.target.unitId === unitId)) {
            return hotspots;
          }
          changed = true;
          return hotspots.map((h) => (h.target?.type === "unit" && h.target.unitId === unitId ? { ...h, target: null } : h));
        });
      }
      return changed ? next : current;
    });
  }, []);

  return { histories, commit, undo, redo, addView, removeView, forgetUnit };
}
