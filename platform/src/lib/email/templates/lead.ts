import "server-only";

import { getTranslations } from "next-intl/server";

import { isLocale, type Locale } from "@/i18n/config";
import { emailLayout } from "@/lib/email/html";
import type { EmailMessage } from "@/lib/email/send";

export type LeadEmailData = {
  locale: string;
  organizationName: string;
  projectName: string;
  unitNumber: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  consentSimilar: boolean;
};

function localeOf(value: string): Locale {
  return isLocale(value) ? value : "nb";
}

/** Varsel til kontaktpersonen: hvem som har meldt interesse, og lenke til leadet i admin. */
export async function leadNotificationEmail(to: string, data: LeadEmailData, adminUrl: string): Promise<EmailMessage> {
  const t = await getTranslations({ locale: localeOf(data.locale), namespace: "email.lead" });
  const subject = data.unitNumber
    ? t("notifySubjectUnit", { project: data.projectName, unit: data.unitNumber })
    : t("notifySubject", { project: data.projectName });
  const lines = [
    t("notifyName", { name: data.name }),
    t("notifyEmail", { email: data.email }),
    ...(data.phone ? [t("notifyPhone", { phone: data.phone })] : []),
    ...(data.unitNumber ? [t("notifyUnit", { unit: data.unitNumber })] : []),
    ...(data.message ? [t("notifyMessage", { message: data.message })] : []),
    data.consentSimilar ? t("notifyConsentSimilar") : t("notifyConsentContactOnly"),
  ];
  return {
    to,
    subject,
    html: emailLayout({
      heading: t("notifyHeading", { project: data.projectName }),
      paragraphs: lines,
      cta: { label: t("notifyCta"), url: adminUrl },
      footer: [t("notifyFooter", { organization: data.organizationName })],
    }),
    text: [t("notifyHeading", { project: data.projectName }), "", ...lines, "", `${t("notifyCta")}: ${adminUrl}`].join("\n"),
  };
}

/** Kvittering til den som sendte skjemaet. */
export async function leadReceiptEmail(to: string, data: LeadEmailData): Promise<EmailMessage> {
  const t = await getTranslations({ locale: localeOf(data.locale), namespace: "email.lead" });
  const body = data.unitNumber
    ? t("receiptBodyUnit", { project: data.projectName, unit: data.unitNumber, organization: data.organizationName })
    : t("receiptBody", { project: data.projectName, organization: data.organizationName });
  const lines = [body, t("receiptPrivacy", { organization: data.organizationName })];
  return {
    to,
    subject: t("receiptSubject", { project: data.projectName }),
    html: emailLayout({ heading: t("receiptHeading", { name: data.name }), paragraphs: lines, footer: [t("receiptFooter")] }),
    text: [t("receiptHeading", { name: data.name }), "", ...lines].join("\n"),
  };
}
