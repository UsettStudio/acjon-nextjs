import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@/lib/env.server";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = { delivered: boolean };

/**
 * Sender e-post med Resend. Uten RESEND_API_KEY (lokal utvikling og tester)
 * skrives e-posten til serverloggen og regnes som ikke levert.
 */
export async function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  const env = serverEnv();
  if (!env.resendApiKey) {
    console.info(`[e-post ikke sendt: RESEND_API_KEY mangler] Til: ${message.to} | Emne: ${message.subject}`);
    return { delivered: false };
  }
  const resend = new Resend(env.resendApiKey);
  const { error } = await resend.emails.send({
    from: env.emailFrom,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
  if (error) {
    throw new Error(`Resend: ${error.message}`);
  }
  return { delivered: true };
}
