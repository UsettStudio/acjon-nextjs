import { useTranslations } from "next-intl";

import { UNIT_STATUSES, type UnitStatus } from "@/features/units/fields";
import { cn } from "@/lib/utils";

/** Fargene i admin. Teksten står alltid ved siden av, så status aldri bare vises med farge. */
export const STATUS_STYLES: Record<UnitStatus, { badge: string; dot: string; bar: string }> = {
  upcoming: {
    badge: "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
    dot: "bg-slate-400",
    bar: "bg-slate-300 dark:bg-slate-600",
  },
  available: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  reserved: {
    badge: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
  },
  sold: {
    badge: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
};

export function UnitStatusBadge({ status, className }: { status: UnitStatus; className?: string }) {
  const t = useTranslations("unitStatus");
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status].badge,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", STATUS_STYLES[status].dot)} />
      {t(status)}
    </span>
  );
}

/** Stolpe som viser fordelingen av status. Tallene står også som tekst for skjermlesere. */
export function StatusDistribution({
  counts,
  className,
  showLegend = true,
}: {
  counts: Record<UnitStatus, number>;
  className?: string;
  showLegend?: boolean;
}) {
  const t = useTranslations("unitStatus");
  const total = UNIT_STATUSES.reduce((sum, status) => sum + counts[status], 0);
  if (total === 0) {
    return null;
  }
  return (
    <div className={cn("grid gap-2", className)}>
      <div aria-hidden="true" className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {UNIT_STATUSES.map((status) =>
          counts[status] > 0 ? (
            <span key={status} className={STATUS_STYLES[status].bar} style={{ width: `${(counts[status] / total) * 100}%` }} />
          ) : null,
        )}
      </div>
      <ul className={cn("flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", !showLegend && "sr-only")}>
        {UNIT_STATUSES.map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-2 rounded-full", STATUS_STYLES[status].dot)} />
            {t(status)}: <span className="font-medium text-foreground tabular-nums">{counts[status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
