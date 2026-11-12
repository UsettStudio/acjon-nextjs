"use client";

import { EllipsisIcon, HistoryIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnitsTable } from "@/features/units/components/table/context";
import type { UnitListItem } from "@/features/units/queries";

export function RowActions({ unit }: { unit: UnitListItem }) {
  const t = useTranslations("units.table");
  const { orgSlug, projectSlug, canEditContent, openHistory, requestDelete } = useUnitsTable();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" aria-label={t("actionsFor", { unit: unit.unit_number })}>
          <EllipsisIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/${orgSlug}/projects/${projectSlug}/units/${unit.id}`}>
            <PencilIcon aria-hidden="true" />
            {t("open")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openHistory(unit)}>
          <HistoryIcon aria-hidden="true" />
          {t("history")}
        </DropdownMenuItem>
        {canEditContent ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => requestDelete([unit])}>
              <Trash2Icon aria-hidden="true" />
              {t("delete")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
