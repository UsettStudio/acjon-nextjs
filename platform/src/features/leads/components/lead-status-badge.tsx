import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/features/leads/schemas";
import { cn } from "@/lib/utils";

const STYLES: Record<LeadStatus, string> = {
  new: "border-blue-600/30 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
  contacted: "border-amber-600/30 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  closed: "border-transparent bg-muted text-muted-foreground",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const t = useTranslations("leads.statuses");
  return (
    <Badge variant="outline" className={cn(STYLES[status])}>
      {t(status)}
    </Badge>
  );
}
