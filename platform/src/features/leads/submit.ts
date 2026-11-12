"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { z } from "zod";

import { scheduleWebhookDelivery } from "@/features/integrations/webhook-sender";
import { leadSubmissionSchema, type LeadSubmission } from "@/features/leads/schemas";
import { verifyTurnstile } from "@/features/leads/turnstile";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { parseInput, postgresErrorCode } from "@/lib/actions/server";
import { leadNotificationEmail, leadReceiptEmail, type LeadEmailData } from "@/lib/email/templates/lead";
import { sendEmail } from "@/lib/email/send";
import { appUrl } from "@/lib/env";
import { sha256Hex } from "@/lib/security/tokens";
import { createAdminClient } from "@/lib/supabase/admin";

type LeadError = "rateLimited" | "closed" | "captcha";

const submitResultSchema = z.object({
  lead_id: z.string(),
  organization_name: z.string(),
  organization_slug: z.string(),
  locale: z.string(),
  project_name: z.string(),
  unit_number: z.string().nullable(),
  recipients: z.array(z.string()),
});

/** Avsenderens IP-adresse, bare som hash. Selve adressen lagres aldri. */
async function ipHash(): Promise<{ ip: string | null; hash: string | null }> {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip")?.trim() || null;
  return { ip, hash: ip ? sha256Hex(`lead:${ip}`) : null };
}

/**
 * Tar imot interesseskjemaet fra en publisert side. Rekkefølge:
 * honeypot → Turnstile → databasen (prosjekt, enhet og rate limit) → e-post.
 * Leadet lagres selv om e-posten ikke kan sendes; det vises i admin uansett.
 */
export async function submitLead(input: LeadSubmission): Promise<ActionResult<{ received: true }, LeadError>> {
  try {
    const parsed = parseInput(leadSubmissionSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const lead = parsed.data;
    // En robot har fylt ut det skjulte feltet. Svar som om alt gikk bra, men lagre ingenting.
    if (lead.website) {
      return ok({ received: true });
    }
    const { ip, hash } = await ipHash();
    if (!(await verifyTurnstile(lead.turnstileToken, ip))) {
      return fail("captcha");
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("submit_lead", {
      p_lead: {
        project_id: lead.projectId,
        unit_id: lead.unitId,
        page_id: lead.pageId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        consent_contact: lead.consentContact,
        consent_similar_projects: lead.consentSimilar,
        consent_text_version: lead.consentVersion,
        source: lead.source,
        utm: lead.utm,
      },
      p_ip_hash: hash ?? undefined,
    });
    if (error) {
      switch (postgresErrorCode(error)) {
        case "P0429":
          return fail("rateLimited");
        case "P0002":
          return fail("closed");
        case "23503":
        case "23514":
        case "22023":
          return fail("invalidInput");
        default:
          throw error;
      }
    }
    const result = submitResultSchema.parse(data);
    scheduleWebhookDelivery();

    const emailData: LeadEmailData = {
      locale: result.locale,
      organizationName: result.organization_name,
      projectName: result.project_name,
      unitNumber: result.unit_number,
      name: lead.name,
      email: lead.email.toLowerCase(),
      phone: lead.phone || null,
      message: lead.message || null,
      consentSimilar: lead.consentSimilar,
    };
    const adminLink = appUrl(`/${result.organization_slug}/leads/${result.lead_id}`);
    let delivered = false;
    for (const recipient of result.recipients) {
      try {
        const sent = await sendEmail(await leadNotificationEmail(recipient, emailData, adminLink));
        delivered ||= sent.delivered;
      } catch (error) {
        console.error(error);
        Sentry.captureException(error);
      }
    }
    try {
      await sendEmail(await leadReceiptEmail(emailData.email, emailData));
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
    }
    if (delivered) {
      await admin.from("leads").update({ notified_at: new Date().toISOString() }).eq("id", result.lead_id);
    }
    return ok({ received: true });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    return fail("unknown");
  }
}
