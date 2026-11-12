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

/** Avsender som «Navn <adresse>» delt opp, slik Mailpit vil ha den. */
function parseSender(from: string): { Name: string; Email: string } {
  const match = /^(.*)<([^>]+)>\s*$/.exec(from);
  return match ? { Name: (match[1] ?? "").trim().replace(/^"|"$/g, ""), Email: (match[2] ?? "").trim() } : { Name: "", Email: from.trim() };
}

/**
 * Sender e-post med Resend. Uten RESEND_API_KEY (lokal utvikling og tester)
 * sendes e-posten til Mailpit i lokal Supabase når MAILPIT_URL er satt, ellers
 * skrives den til serverloggen og regnes som ikke levert.
 */
export async function sendEmail(message: EmailMessage): Promise<SendEmailResult> {
  const env = serverEnv();
  if (!env.resendApiKey) {
    if (env.mailpitUrl) {
      const response = await fetch(new URL("/api/v1/send", env.mailpitUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          From: parseSender(env.emailFrom),
          To: [{ Email: message.to }],
          Subject: message.subject,
          HTML: message.html,
          Text: message.text,
        }),
      });
      if (!response.ok) {
        throw new Error(`Mailpit: ${response.status}`);
      }
      return { delivered: true };
    }
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
