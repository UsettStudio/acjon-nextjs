"use client";

import { createContext, useContext } from "react";

import type { Building, Stage } from "@/features/projects/queries";
import type { UnitStatus } from "@/features/units/fields";
import type { UnitListItem } from "@/features/units/queries";
import type { EditableField } from "@/features/units/schemas";

export type UnitsTableActions = {
  organizationId: string;
  orgSlug: string;
  projectSlug: string;
  canEditContent: boolean;
  canSell: boolean;
  stages: Stage[];
  buildings: Building[];
  /** Lagrer ett felt. Svarer med feilmelding (oversatt) eller null. */
  saveField: (unit: UnitListItem, field: EditableField, raw: unknown) => Promise<string | null>;
  changeStatus: (units: UnitListItem[], status: UnitStatus, note: string) => Promise<boolean>;
  openStatusDialog: (units: UnitListItem[]) => void;
  openHistory: (unit: UnitListItem) => void;
  requestDelete: (units: UnitListItem[]) => void;
};

export const UnitsTableContext = createContext<UnitsTableActions | null>(null);

export function useUnitsTable(): UnitsTableActions {
  const context = useContext(UnitsTableContext);
  if (!context) {
    throw new Error("useUnitsTable må brukes inne i UnitsTable");
  }
  return context;
}
