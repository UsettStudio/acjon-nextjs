import "server-only";

import { getTranslations } from "next-intl/server";

import type { MemberRole } from "@/lib/auth/permissions";
import { emailLayout } from "@/lib/email/html";
import type { EmailMessage } from "@/lib/email/send";
import { formatDate } from "@/lib/format";
import { defaultLocale } from "@/i18n/config";

export async function invitationEmail(params: {
  to: string;
  organizationName: string;
  inviterName: string;
  role: MemberRole;
  url: string;
  expiresAt: string;
  productName: string;
}): Promise<EmailMessage> {
  const t = await getTranslations({ locale: defaultLocale, namespace: "email.invitation" });
  const tRoles = await getTranslations({ locale: defaultLocale, namespace: "roles" });
  const role = tRoles(params.role).toLowerCase();

  const subject = t("subject", { inviter: params.inviterName, organization: params.organizationName });
  const heading = t("heading", { organization: params.organizationName });
  const body = t("body", { inviter: params.inviterName, role, product: params.productName });
  const expires = t("expires", { date: formatDate(params.expiresAt, defaultLocale) });

  return {
    to: params.to,
    subject,
    html: emailLayout({
      heading,
      paragraphs: [body],
      cta: { label: t("cta"), url: params.url },
      footer: [expires, t("fallback"), params.url, t("ignore")],
    }),
    text: [heading, "", body, "", `${t("cta")}: ${params.url}`, "", expires, t("ignore")].join("\n"),
  };
}
