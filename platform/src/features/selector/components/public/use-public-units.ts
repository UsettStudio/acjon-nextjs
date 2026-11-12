"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { isPriceHidden, parsePublicUnits, type PublicUnit } from "@/features/selector/model";
import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";
import { loadPublicBrowserClient } from "@/lib/supabase/public-browser";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type LiveState = "connecting" | "live" | "offline" | "disabled";

const statusEventSchema = z.object({
  unit_id: z.string(),
  status: z.enum(UNIT_STATUSES),
});

type StatusListener = {
  onStatus: (unitId: string, status: UnitStatus) => void;
  onSubscribed?: () => void;
  onState: (state: LiveState) => void;
};

type ChannelEntry = {
  /** Kanalen kobles opp når Supabase-biblioteket er lastet. */
  channel: Promise<RealtimeChannel>;
  listeners: Set<StatusListener>;
  state: LiveState;
};

/**
 * Én kanal per prosjekt, delt av alle som lytter på siden (for eksempel en
 * Boligvelger- og en Enhetsliste-blokk). Supabase gir samme kanal for samme
 * emne, så hver komponent kan ikke abonnere for seg.
 */
const channels = new Map<string, ChannelEntry>();

function subscribeUnitStatus(projectId: string, listener: StatusListener): () => void {
  let entry = channels.get(projectId);
  if (!entry) {
    const created: ChannelEntry = {
      channel: loadPublicBrowserClient().then((supabase) => openChannel(supabase.channel(`project:${projectId}:units`), created)),
      listeners: new Set(),
      state: "connecting",
    };
    channels.set(projectId, created);
    entry = created;
  }
  const current = entry;
  current.listeners.add(listener);
  // En som kommer til etter tilkoblingen, får tilstanden og én oppfriskning med en gang.
  queueMicrotask(() => {
    if (!current.listeners.has(listener)) {
      return;
    }
    listener.onState(current.state);
    if (current.state === "live") {
      listener.onSubscribed?.();
    }
  });
  return () => {
    current.listeners.delete(listener);
    if (current.listeners.size === 0) {
      channels.delete(projectId);
      void Promise.all([loadPublicBrowserClient(), current.channel]).then(([supabase, channel]) => supabase.removeChannel(channel));
    }
  };
}

/** Lytter etter statusendringer i kanalen og gir beskjed til alle som lytter på prosjektet. */
function openChannel(channel: RealtimeChannel, created: ChannelEntry): RealtimeChannel {
  return channel
    .on("broadcast", { event: "unit_status" }, (message: { payload?: unknown }) => {
      const parsed = statusEventSchema.safeParse(message.payload);
      if (parsed.success) {
        for (const item of created.listeners) {
          item.onStatus(parsed.data.unit_id, parsed.data.status);
        }
      }
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        created.state = "live";
        for (const item of created.listeners) {
          item.onState("live");
          item.onSubscribed?.();
        }
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        created.state = "offline";
        for (const item of created.listeners) {
          item.onState("offline");
        }
      }
    });
}

/**
 * Lytter på den offentlige kanalen «project:{id}:units». Databasen sender
 * bare enhets-id og ny status når en enhet i et offentlig prosjekt endrer
 * status. Etter tilkobling (også ny tilkobling) hentes enhetene én gang, så
 * endringer mellom sidevisning og tilkobling ikke går tapt.
 */
export function usePublicUnitStatus(
  projectId: string,
  enabled: boolean,
  handlers: { onStatus: (unitId: string, status: UnitStatus) => void; onSubscribed?: () => void },
): LiveState {
  const handlersRef = useRef(handlers);
  const [state, setState] = useState<LiveState>(enabled ? "connecting" : "disabled");
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    return subscribeUnitStatus(projectId, {
      onStatus: (unitId, status) => handlersRef.current.onStatus(unitId, status),
      onSubscribed: () => handlersRef.current.onSubscribed?.(),
      onState: setState,
    });
  }, [projectId, enabled]);

  return enabled ? state : "disabled";
}

/**
 * Enhetene i velgeren med status i sanntid. Status byttes med en gang. Når en
 * solgt enhet med skjult pris blir ledig igjen, mangler prisen i nettleseren,
 * så da hentes enhetene på nytt.
 */
export function useLiveUnits(
  initial: PublicUnit[],
  projectId: string,
  showPriceOnSold: boolean,
  enabled: boolean,
): { units: PublicUnit[]; live: LiveState } {
  const [units, setUnits] = useState(initial);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Telles opp for hver statusendring. Kommer en endring mens listen hentes, kan svaret
  // være eldre enn endringen. Da brukes ikke svaret, og listen hentes på nytt.
  const eventCount = useRef(0);

  const reload = useCallback(() => {
    if (refetchTimer.current) {
      clearTimeout(refetchTimer.current);
    }
    refetchTimer.current = setTimeout(async function fetchUnits() {
      const before = eventCount.current;
      const supabase = await loadPublicBrowserClient();
      const { data, error } = await supabase.rpc("get_public_units", { p_project_id: projectId });
      if (error) {
        return;
      }
      if (eventCount.current !== before) {
        refetchTimer.current = setTimeout(fetchUnits, 300);
        return;
      }
      const fresh = parsePublicUnits(data);
      if (fresh) {
        setUnits(fresh);
      }
    }, 300);
  }, [projectId]);

  useEffect(
    () => () => {
      if (refetchTimer.current) {
        clearTimeout(refetchTimer.current);
      }
    },
    [],
  );

  const unitsRef = useRef(units);
  useEffect(() => {
    unitsRef.current = units;
  });

  const live = usePublicUnitStatus(projectId, enabled, {
    onStatus: (unitId, status) => {
      eventCount.current += 1;
      const hidden = isPriceHidden(status, showPriceOnSold);
      const known = unitsRef.current.find((unit) => unit.id === unitId);
      // Ukjent enhet (ny eller tidligere skjult), eller pris som må hentes: last listen på nytt.
      if (!known || (known.price_hidden && !hidden)) {
        reload();
      }
      setUnits((current) =>
        current.map((unit) => {
          if (unit.id !== unitId) {
            return unit;
          }
          return hidden
            ? { ...unit, status, price_hidden: true, price: null, purchase_costs: null, shared_debt: null }
            : { ...unit, status, price_hidden: false };
        }),
      );
    },
    onSubscribed: reload,
  });

  return { units, live };
}
