"use client";

import { useCallback, useMemo } from "react";

import { useLocalStorageState } from "@/lib/hooks/use-local-storage-state";

const NONE: string[] = [];

function parseIds(value: unknown): string[] | null {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 500) : null;
}

/** Favoritter per prosjekt, lagret i nettleseren (localStorage). Ingen data sendes til serveren. */
export function useFavorites(projectId: string) {
  const [ids, setIds] = useLocalStorageState(`boligvelger:favoritter:${projectId}`, NONE, parseIds);
  const favorites = useMemo(() => new Set(ids), [ids]);
  const toggle = useCallback(
    (unitId: string) =>
      setIds((current) => (current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId])),
    [setIds],
  );
  return { favorites, toggle };
}
