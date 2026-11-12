import * as Sentry from "@sentry/nextjs";
import { revalidateTag } from "next/cache";

import { checkAndRecordDomain } from "@/features/domains/check";
import { siteTags } from "@/features/site-builder/render-data";
import { rejectUnauthorizedCron } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Planlagt sjekk av egne domener (Vercel Cron hvert femte minutt). Domener som
 * venter på DNS, sjekkes ofte det første døgnet og deretter hver time i 30
 * dager. Bekreftede domener sjekkes daglig, og feil vises som varsel i admin.
 */
export async function GET(request: Request) {
  const rejected = rejectUnauthorizedCron(request);
  if (rejected) {
    return rejected;
  }
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("domains_due_for_check", { p_limit: 25 });
  if (error) {
    throw error;
  }
  let verified = 0;
  let failed = 0;
  for (const domain of data) {
    try {
      const result = await checkAndRecordDomain(admin, {
        id: domain.domain_id,
        siteId: domain.site_id,
        hostname: domain.hostname,
        verificationToken: domain.verification_token,
        verified: domain.verified,
      });
      if (result.becameVerified) {
        verified += 1;
        revalidateTag(siteTags.key(domain.hostname), { expire: 0 });
        revalidateTag(siteTags.site(domain.site_id), { expire: 0 });
      }
    } catch (checkError) {
      failed += 1;
      console.error(checkError);
      Sentry.captureException(checkError);
    }
  }
  return Response.json({ checked: data.length, verified, failed });
}
