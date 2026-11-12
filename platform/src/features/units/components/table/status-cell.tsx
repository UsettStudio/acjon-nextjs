"use client";

import { ChevronDownIcon, HistoryIcon, MessageSquareTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnitsTable } from "@/features/units/components/table/context";
import { UnitStatusBadge } from "@/features/units/components/unit-status-badge";
import { UNIT_STATUSES } from "@/features/units/fields";
import type { UnitListItem } from "@/features/units/queries";

/** Status i tabellen. Ett klikk endrer status; «Med notat» åpner en dialog. */
export function StatusCell({ unit }: { unit: UnitListItem }) {
  const t = useTranslations("units.status");
  const { canSell, changeStatus, openStatusDialog, openHistory } = useUnitsTable();
  const [busy, setBusy] = useState(false);

  if (!canSell) {
    return (
      <div className="px-2 py-1.5">
        <UnitStatusBadge status={unit.status} />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={busy}
        aria-label={t("changeFor", { unit: unit.unit_number, status: t(`values.${unit.status}`) })}
        className="flex min-h-8 items-center gap-1 rounded-sm px-2 py-1 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
      >
        <UnitStatusBadge status={unit.status} />
        <ChevronDownIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {UNIT_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={status === unit.status}
            onSelect={async () => {
              setBusy(true);
              await changeStatus([unit], status, "");
              setBusy(false);
            }}
          >
            <UnitStatusBadge status={status} />
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => openStatusDialog([unit])}>
          <MessageSquareTextIcon aria-hidden="true" />
          {t("withNote")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openHistory(unit)}>
          <HistoryIcon aria-hidden="true" />
          {t("history")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
