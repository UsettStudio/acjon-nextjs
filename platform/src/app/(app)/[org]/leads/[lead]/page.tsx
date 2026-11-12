import type { Metadata } from "next";
import { ArrowLeftIcon, MailIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consentTexts } from "@/features/leads/consent";
import { LeadDetailForm } from "@/features/leads/components/lead-detail-form";
import { LeadStatusBadge } from "@/features/leads/components/lead-status-badge";
import { getLead, getOrganizationLocale } from "@/features/leads/queries";
import { getOrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";

export async function generateMetadata({ params }: PageProps<"/[org]/leads/[lead]">): Promise<Metadata> {
  const { org, lead: leadId } = await params;
  const context = await getOrgContext(org);
  const [lead, t] = await Promise.all([
    can(context.role, "leads.read") ? getLead(context.organization.id, leadId) : null,
    getTranslations("leads.detail"),
  ]);
  return { title: lead ? t("pageTitle", { name: lead.name }) : undefined };
}

/** Én henvendelse: kontaktinfo, beskjed, samtykke, kilde, status og internt notat. */
export default async function LeadPage({ params }: PageProps<"/[org]/leads/[lead]">) {
  const { org, lead: leadId } = await params;
  const context = await getOrgContext(org);
  if (!can(context.role, "leads.read")) {
    notFound();
  }
  const lead = await getLead(context.organization.id, leadId);
  if (!lead) {
    notFound();
  }
  const [t, tSources, format, locale] = await Promise.all([
    getTranslations("leads.detail"),
    getTranslations("leads.sources"),
    getFormatter(),
    getOrganizationLocale(context.organization.id),
  ]);
  const consent = consentTexts(locale, { organization: context.organization.name, project: lead.project?.name ?? "" }, lead.consentVersion);
  const dateTime = (iso: string) => format.dateTime(new Date(iso), { dateStyle: "long", timeStyle: "short" });
  const utm = Object.entries(lead.utm);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Link href={`/${org}/leads`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          {t("back")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <LeadStatusBadge status={lead.status} />
        </div>
        <p className="text-sm text-muted-foreground">{t("received", { time: dateTime(lead.createdAt) })}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("contactTitle")}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p className="flex items-center gap-2">
                <MailIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                <a href={`mailto:${lead.email}`} className="underline underline-offset-4">
                  {lead.email}
                </a>
              </p>
              {lead.phone ? (
                <p className="flex items-center gap-2">
                  <PhoneIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
                    {lead.phone}
                  </a>
                </p>
              ) : null}
              <div className="grid gap-1">
                <h3 className="font-medium">{t("message")}</h3>
                {lead.message ? <p className="whitespace-pre-wrap">{lead.message}</p> : <p className="text-muted-foreground">{t("noMessage")}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("handlingTitle")}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeadDetailForm
                organizationId={context.organization.id}
                orgSlug={org}
                leadId={lead.id}
                email={lead.email}
                sameEmailCount={lead.sameEmailCount}
                initialStatus={lead.status}
                initialNote={lead.internalNote}
                canEdit={context.writable}
                canDelete={context.writable && can(context.role, "leads.delete")}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("interestTitle")}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("project")}</dt>
                  <dd>
                    {lead.project ? (
                      <Link href={`/${org}/projects/${lead.project.slug}`} className="underline underline-offset-4">
                        {lead.project.name}
                      </Link>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("unit")}</dt>
                  <dd data-testid="lead-unit">
                    {lead.unit && lead.project ? (
                      <Link href={`/${org}/projects/${lead.project.slug}/units/${lead.unit.id}`} className="underline underline-offset-4">
                        {lead.unit.unitNumber}
                      </Link>
                    ) : (
                      (lead.unitNumber ?? t("noUnit"))
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("source")}</dt>
                  <dd>
                    {tSources(lead.source as "site")}
                    {lead.pageTitle ? ` · ${lead.pageTitle}` : ""}
                  </dd>
                </div>
                {utm.length > 0 ? (
                  <div>
                    <dt className="text-muted-foreground">{t("campaign")}</dt>
                    <dd>
                      <ul>
                        {utm.map(([key, value]) => (
                          <li key={key}>
                            <span className="text-muted-foreground">{key}:</span> {value}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">{t("notified")}</dt>
                  <dd>{lead.notifiedAt ? t("notifiedAt", { time: dateTime(lead.notifiedAt) }) : t("notNotified")}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("consentTitle")}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p>{t("consentGiven", { time: dateTime(lead.consentedAt), version: lead.consentVersion })}</p>
              <blockquote className="border-l-2 pl-3 text-muted-foreground">{consent.contact}</blockquote>
              <p>{lead.consentSimilar ? t("similarYes") : t("similarNo")}</p>
              {lead.consentSimilar ? <blockquote className="border-l-2 pl-3 text-muted-foreground">{consent.similar}</blockquote> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
