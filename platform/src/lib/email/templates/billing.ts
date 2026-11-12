import "server-only";

import { getTranslations } from "next-intl/server";

import { isLocale } from "@/i18n/config";
import { trialDaysLeft } from "@/lib/billing/subscription";
import { emailLayout } from "@/lib/email/html";
import type { EmailMessage } from "@/lib/email/send";
import { formatDate } from "@/lib/format";

export type BillingNoticeKind = "trial_7d" | "trial_1d" | "read_only";

/**
 * Varsel til eierne før prøveperioden er ute, og når organisasjonen går over
 * i lesemodus. Publiserte sider tas aldri ned, og det står i varselet.
 */
export async function billingNoticeEmail(params: {
  to: string;
  kind: BillingNoticeKind;
  locale: string;
  organizationName: string;
  trialEndsAt: string | null;
  billingUrl: string;
}): Promise<EmailMessage> {
  const locale = isLocale(params.locale) ? params.locale : "nb";
  const t = await getTranslations({ locale, namespace: "email.billing" });
  const values = {
    organization: params.organizationName,
    date: params.trialEndsAt ? formatDate(params.trialEndsAt, locale) : "",
    days: trialDaysLeft(params.trialEndsAt) ?? 0,
  };
  const subject = t(`${params.kind}.subject`, values);
  const heading = t(`${params.kind}.heading`, values);
  const paragraphs = [t(`${params.kind}.body`, values), t("pagesStayUp")];
  return {
    to: params.to,
    subject,
    html: emailLayout({
      heading,
      paragraphs,
      cta: { label: t("cta"), url: params.billingUrl },
      footer: [t("why", { organization: params.organizationName })],
    }),
    text: [heading, "", ...paragraphs, "", `${t("cta")}: ${params.billingUrl}`, "", t("why", { organization: params.organizationName })].join("\n"),
  };
}
