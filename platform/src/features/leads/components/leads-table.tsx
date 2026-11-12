"use client";

import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeadStatusBadge } from "@/features/leads/components/lead-status-badge";
import type { LeadListItem } from "@/features/leads/queries";

/** Leads i en tabell. Navnet lenker til detaljvisningen. */
export function LeadsTable({ leads, orgSlug, showProject }: { leads: LeadListItem[]; orgSlug: string; showProject: boolean }) {
  const t = useTranslations("leads.table");
  const tSources = useTranslations("leads.sources");
  const format = useFormatter();
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("received")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("contact")}</TableHead>
            {showProject ? <TableHead>{t("project")}</TableHead> : null}
            <TableHead>{t("unit")}</TableHead>
            <TableHead>{t("source")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                {format.dateTime(new Date(lead.createdAt), { dateStyle: "short", timeStyle: "short" })}
              </TableCell>
              <TableCell>
                <Link href={`/${orgSlug}/leads/${lead.id}`} className="font-medium underline-offset-4 hover:underline">
                  {lead.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm">
                <span className="block">{lead.email}</span>
                {lead.phone ? <span className="block text-muted-foreground">{lead.phone}</span> : null}
              </TableCell>
              {showProject ? <TableCell>{lead.project?.name ?? ""}</TableCell> : null}
              <TableCell>{lead.unitNumber ?? <span className="text-muted-foreground">{t("noUnit")}</span>}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{tSources(lead.source as "site")}</TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
