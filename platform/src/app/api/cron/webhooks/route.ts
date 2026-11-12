import { processWebhookOutbox } from "@/features/integrations/webhook-sender";
import { rejectUnauthorizedCron } from "@/lib/cron";

/**
 * Planlagt utsending av webhooks (Vercel Cron hvert minutt): nye leveranser som
 * ikke ble sendt med en gang, og nye forsøk etter feil (1, 2, 4 … minutter,
 * høyst åtte forsøk).
 */
export async function GET(request: Request) {
  const rejected = rejectUnauthorizedCron(request);
  if (rejected) {
    return rejected;
  }
  let attempted = 0;
  let succeeded = 0;
  // Inntil fire runder à 25 leveranser, så en kø etter et avbrudd tømmes raskt.
  for (let round = 0; round < 4; round += 1) {
    const result = await processWebhookOutbox({ limit: 25 });
    attempted += result.attempted;
    succeeded += result.succeeded;
    if (result.attempted < 25) {
      break;
    }
  }
  return Response.json({ attempted, succeeded });
}
