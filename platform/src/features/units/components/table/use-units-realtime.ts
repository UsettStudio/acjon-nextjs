"use client";

import { useEffect, useRef, useState } from "react";

import type { UnitListItem } from "@/features/units/queries";
import { getBrowserClient } from "@/lib/supabase/client";

type Handlers = {
  onUpsert: (unit: UnitListItem) => void;
  onDelete: (unitId: string) => void;
};

/**
 * Lytter på endringer i prosjektets enheter (Postgres Changes med RLS), så en
 * statusendring fra en kollega eller boligvelgeren vises uten å laste siden på nytt.
 */
export type RealtimeState = "connecting" | "live" | "offline";

export function useUnitsRealtime(projectId: string, handlers: Handlers): RealtimeState {
  const handlersRef = useRef(handlers);
  const [state, setState] = useState<RealtimeState>("connecting");
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const supabase = getBrowserClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function subscribe() {
      // Sanntid må få innloggingen før abonnementet starter. Ellers kobles det til
      // som anonym bruker, og RLS stopper alle hendelser.
      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }
      if (!data.session) {
        setState("offline");
        return;
      }
      await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) {
        return;
      }
      channel = supabase
        .channel(`admin-units:${projectId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "units", filter: `project_id=eq.${projectId}` },
          (payload) => handlersRef.current.onUpsert(payload.new as UnitListItem),
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "units", filter: `project_id=eq.${projectId}` },
          (payload) => handlersRef.current.onUpsert(payload.new as UnitListItem),
        )
        // Sletting kan ikke filtreres på prosjekt. Hendelsen har bare id-en, og ukjente id-er ignoreres.
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "units" }, (payload) => {
          const id = (payload.old as { id?: unknown }).id;
          if (typeof id === "string") {
            handlersRef.current.onDelete(id);
          }
        })
        .on("system", {}, (payload: { status?: string; extension?: string }) => {
          if (payload.extension === "postgres_changes" && payload.status === "error") {
            setState("offline");
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setState("live");
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setState("offline");
          }
        });
    }

    void subscribe();
    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [projectId]);

  return state;
}
