import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingChecklist } from "@/features/projects/components/onboarding-checklist";
import { onboardingSteps } from "@/features/projects/overview";
import { getProjectContext, getProjectOverview, getProjectStructure, listRecentStatusEvents } from "@/features/projects/queries";
import { LeadStatusBadge } from "@/features/leads/components/lead-status-badge";
import { listRecentLeads } from "@/features/leads/queries";
import { StatusDistribution, UnitStatusBadge } from "@/features/units/components/unit-status-badge";
import { can } from "@/lib/auth/permissions";
import { UNIT_STATUSES } from "@/features/units/fields";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]">): Promise<Metadata> {
  const { org, project } = await params;
  const context = await getProjectContext(org, project);
  return { title: context.project.name };
}

export default async function ProjectOverviewPage({ params }: PageProps<"/[org]/projects/[project]">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  const { project } = context;
  const canReadLeads = can(context.role, "leads.read");
  const [t, tMilestones, tSources, overview, structure, events, leads] = await Promise.all([
    getTranslations("projects.overview"),
    getTranslations("projects.milestones"),
    getTranslations("units.sources"),
    getProjectOverview(project.id),
    getProjectStructure(project.id),
    listRecentStatusEvents(project.id, 10),
    canReadLeads ? listRecentLeads(context.organization.id, project.id, 5) : Promise.resolve([]),
  ]);
  const projectCounts = overview.counts;
  const total = overview.totalUnits;
  const soldShare = total > 0 ? Math.round((projectCounts.sold / total) * 100) : 0;
  const base = `/${org}/projects/${slug}`;
  // Sjekklisten er for dem som setter opp prosjektet, og forsvinner når alt er gjort.
  const steps = onboardingSteps(overview, base);
  const showChecklist = can(context.role, "content.edit") && steps.some((step) => !step.done);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {showChecklist ? <OnboardingChecklist steps={steps} className="lg:col-span-3" /> : null}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            <h2>{t("units")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          {total === 0 ? (
            <div className="grid gap-3">
              <p className="text-muted-foreground">{t("noUnits")}</p>
              <div>
                <Button asChild>
                  <Link href={`${base}/units`}>{t("addUnits")}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div>
                  <dt className="text-sm text-muted-foreground">{t("total")}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{total}</dd>
                </div>
                {UNIT_STATUSES.map((status) => (
                  <div key={status}>
                    <dt>
                      <UnitStatusBadge status={status} />
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums">{projectCounts[status]}</dd>
                  </div>
                ))}
              </dl>
              <StatusDistribution counts={projectCounts} showLegend={false} />
              <p className="text-sm text-muted-foreground">{t("soldShare", { percent: soldShare })}</p>
              <dl>
                <dt className="text-sm text-muted-foreground">{t("soldValue")}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{formatCurrency(overview.soldValue)}</dd>
                {overview.soldWithoutPrice > 0 ? (
                  <dd className="text-sm text-muted-foreground">
                    {t("soldWithoutPrice", { count: overview.soldWithoutPrice })}
                  </dd>
                ) : null}
              </dl>
              <div>
                <Button asChild variant="outline">
                  <Link href={`${base}/units`}>{t("openUnits")}</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("location")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {project.address || project.city ? (
            <p className="flex items-start gap-2">
              <MapPinIcon aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
              <span>
                {project.address}
                {project.address ? <br /> : null}
                {[project.postalCode, project.city].filter(Boolean).join(" ")}
                {project.municipality && project.municipality !== project.city ? (
                  <span className="block text-muted-foreground">
                    {t("municipality", { name: project.municipality })}
                  </span>
                ) : null}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground">{t("noLocation")}</p>
          )}
          {project.lat !== null && project.lng !== null ? (
            <p className="text-muted-foreground tabular-nums">
              {t("coordinates", { lat: formatNumber(project.lat, "nb", 5), lng: formatNumber(project.lng, "nb", 5) })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid content-start gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("recentChanges")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noChanges")}</p>
            ) : (
              <ol className="grid gap-3">
                {events.map((event) => (
                  <li key={event.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-medium">{event.unitNumber}</span>
                    {event.fromStatus ? <UnitStatusBadge status={event.fromStatus} /> : null}
                    <span aria-hidden="true">→</span>
                    <span className="sr-only">{t("to")}</span>
                    <UnitStatusBadge status={event.toStatus} />
                    <span className="text-muted-foreground">
                      {t("changedBy", {
                        name: event.changedBy ?? t("system"),
                        time: formatDateTime(event.createdAt),
                        source: tSources(event.source as "admin"),
                      })}
                    </span>
                    {event.note ? <span className="basis-full text-muted-foreground">«{event.note}»</span> : null}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {canReadLeads ? (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("recentLeads")}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {leads.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noLeads")}</p>
              ) : (
                <ol className="grid gap-3">
                  {leads.map((lead) => (
                    <li key={lead.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <Link href={`/${org}/leads/${lead.id}`} className="font-medium hover:underline">
                        {lead.name}
                      </Link>
                      {lead.unitNumber ? <span className="text-muted-foreground">{t("leadUnit", { unit: lead.unitNumber })}</span> : null}
                      <span className="text-muted-foreground">{formatDateTime(lead.createdAt)}</span>
                      <LeadStatusBadge status={lead.status} />
                    </li>
                  ))}
                </ol>
              )}
              <div>
                <Button asChild variant="outline">
                  <Link href={`${base}/leads`}>{t("openLeads")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid content-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("progress")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noMilestones")}</p>
            ) : (
              <ol className="grid gap-2 text-sm">
                {project.milestones.map((milestone, index) => (
                  <li key={index} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {milestone.key === "custom" ? milestone.label : tMilestones(`keys.${milestone.key}`)}
                    </span>
                    <span className="text-right font-medium">
                      {[milestone.text, milestone.date ? formatDate(milestone.date) : null].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("contacts")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noContacts")}</p>
            ) : (
              <ul className="grid gap-4 text-sm">
                {project.contacts.map((contact, index) => (
                  <li key={index} className="grid gap-1">
                    <span className="font-medium">{contact.name}</span>
                    {contact.title ? <span className="text-muted-foreground">{contact.title}</span> : null}
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:underline">
                        <MailIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                        {contact.email}
                      </a>
                    ) : null}
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-1.5 hover:underline"
                      >
                        <PhoneIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                        {contact.phone}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("structure")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {structure.stages.length === 0 && structure.buildings.length === 0 ? (
              <p className="text-muted-foreground">{t("noStructure")}</p>
            ) : (
              <p>{t("structureSummary", { stages: structure.stages.length, buildings: structure.buildings.length })}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
