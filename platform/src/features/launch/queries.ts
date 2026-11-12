import "server-only";

import type { LaunchState } from "@/lib/billing/launch";
import { createClient } from "@/lib/supabase/server";

/** Om prosjektet er lansert, nivået som er betalt, og antall enheter nå. */
export async function getLaunchState(projectId: string): Promise<LaunchState> {
  const supabase = await createClient();
  const [project, units] = await Promise.all([
    supabase.from("projects").select("launched_at, launch_unit_limit").eq("id", projectId).single(),
    supabase.from("units").select("id", { count: "exact", head: true }).eq("project_id", projectId),
  ]);
  if (project.error) {
    throw project.error;
  }
  if (units.error) {
    throw units.error;
  }
  return {
    launchedAt: project.data.launched_at,
    unitLimit: project.data.launched_at ? project.data.launch_unit_limit : null,
    units: units.count ?? 0,
  };
}

export type LaunchRecord = {
  id: string;
  kind: "launch" | "upgrade" | "waiver";
  /** Antall enheter avgiften dekker. null: ingen grense. */
  unitLimit: number | null;
  /** Kroner uten mva. */
  amount: number;
  currency: string;
  /** Når den ble betalt eller frafalt. */
  at: string;
};

/**
 * Betalinger og frafall for prosjektet, nyeste først. RLS viser dem bare til
 * eier og administrator; andre får en tom liste.
 */
export async function listLaunches(projectId: string): Promise<LaunchRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_launches")
    .select("id, kind, status, unit_limit, amount, currency, paid_at, created_at")
    .eq("project_id", projectId)
    .in("status", ["paid", "waived"])
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return data.flatMap((row) =>
    row.kind === "launch" || row.kind === "upgrade" || row.kind === "waiver"
      ? [
          {
            id: row.id,
            kind: row.kind,
            unitLimit: row.unit_limit,
            amount: row.amount / 100,
            currency: row.currency.toUpperCase(),
            at: row.paid_at ?? row.created_at,
          },
        ]
      : [],
  );
}
