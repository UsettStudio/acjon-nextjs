import * as Sentry from "@sentry/nextjs";

import { rejectUnauthorizedCron } from "@/lib/cron";
import { appUrl } from "@/lib/env";
import { billingNoticeEmail, type BillingNoticeKind } from "@/lib/email/templates/billing";
import { sendEmail } from "@/lib/email/send";
import { createAdminClient } from "@/lib/supabase/admin";

const KINDS = new Set<BillingNoticeKind>(["trial_7d", "trial_1d", "read_only"]);

/**
 * Daglig jobb: e-post til eierne sju dager og ett døgn før prøveperioden er
 * ute, og når organisasjonen går over i lesemodus. Hvert varsel sendes én gang
 * (organizations.billing_notices). Et varsel regnes som sendt først når minst
 * én e-post er levert, så det prøves igjen neste dag ved feil.
 */
export async function GET(request: Request) {
  const rejected = rejectUnauthorizedCron(request);
  if (rejected) {
    return rejected;
  }
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("due_billing_notices");
  if (error) {
    throw error;
  }
  let sent = 0;
  for (const notice of data) {
    if (!KINDS.has(notice.kind as BillingNoticeKind) || notice.recipients.length === 0) {
      continue;
    }
    let delivered = false;
    for (const to of notice.recipients) {
      try {
        const message = await billingNoticeEmail({
          to,
          kind: notice.kind as BillingNoticeKind,
          locale: notice.locale,
          organizationName: notice.organization_name,
          trialEndsAt: notice.trial_ends_at,
          billingUrl: appUrl(`/${notice.organization_slug}/settings/billing`),
        });
        delivered = (await sendEmail(message)).delivered || delivered;
      } catch (sendError) {
        console.error(sendError);
        Sentry.captureException(sendError);
      }
    }
    if (delivered) {
      const { error: markError } = await admin.rpc("mark_billing_notice", {
        p_organization_id: notice.organization_id,
        p_kind: notice.kind,
      });
      if (markError) {
        throw markError;
      }
      sent += 1;
    }
  }
  return Response.json({ due: data.length, sent });
}
