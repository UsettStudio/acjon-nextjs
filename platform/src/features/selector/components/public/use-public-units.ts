"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { isPriceHidden, parsePublicUnits, type PublicUnit } from "@/features/selector/model";
import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";
import { getPublicBrowserClient } from "@/lib/supabase/public-browser";

export type LiveState = "connecting" | "live" | "offline" | "disabled";

const statusEventSchema = z.object({
  unit_id: z.string(),
  status: z.enum(UNIT_STATUSES),
});

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
    const supabase = getPublicBrowserClient();
    const channel = supabase
      .channel(`project:${projectId}:units`)
      .on("broadcast", { event: "unit_status" }, (message: { payload?: unknown }) => {
        const parsed = statusEventSchema.safeParse(message.payload);
        if (parsed.success) {
          handlersRef.current.onStatus(parsed.data.unit_id, parsed.data.status);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setState("live");
          handlersRef.current.onSubscribed?.();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setState("offline");
        }
      });
    return () => {
      void supabase.removeChannel(channel);
    };
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
      const { data, error } = await getPublicBrowserClient().rpc("get_public_units", { p_project_id: projectId });
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
