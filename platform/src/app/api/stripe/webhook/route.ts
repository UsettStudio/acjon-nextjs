import * as Sentry from "@sentry/nextjs";
import type Stripe from "stripe";

import { stripeClient } from "@/features/billing/stripe";
import { subscriptionIdFromEvent, syncSubscription } from "@/features/billing/sync";
import { launchSessionFromEvent, recordLaunchPayment } from "@/features/launch/checkout";
import { serverEnv } from "@/lib/env.server";

/**
 * Stripe-webhooken. Signaturen kontrolleres med STRIPE_WEBHOOK_SECRET før noe
 * leses.
 *
 *   * Betalt oppstartsavgift (Checkout i betalingsmodus) registreres på
 *     prosjektet, som da er lansert.
 *   * Alle hendelser om et abonnement fører til at abonnementet hentes på nytt
 *     fra Stripe og lagres på organisasjonen.
 *
 * Svarer 500 ved feil, så Stripe prøver igjen.
 */
export async function POST(request: Request) {
  const stripe = stripeClient();
  const secret = serverEnv().stripeWebhookSecret;
  if (!stripe || !secret) {
    return Response.json({ error: "Stripe er ikke satt opp" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Mangler signatur" }, { status: 400 });
  }
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return Response.json({ error: "Ugyldig signatur" }, { status: 400 });
  }

  const launchSession = launchSessionFromEvent(event);
  if (launchSession) {
    try {
      const projectId = await recordLaunchPayment(launchSession);
      return Response.json({ received: true, launched: projectId !== null });
    } catch (error) {
      console.error(error);
      Sentry.captureException(error, { tags: { stripe_event: event.type } });
      return Response.json({ error: "Kunne ikke registrere oppstartsavgiften" }, { status: 500 });
    }
  }

  const subscriptionId = subscriptionIdFromEvent(event);
  if (!subscriptionId) {
    return Response.json({ received: true });
  }
  try {
    const organizationId = await syncSubscription(stripe, subscriptionId);
    return Response.json({ received: true, organization: organizationId !== null });
  } catch (error) {
    console.error(error);
    Sentry.captureException(error, { tags: { stripe_event: event.type } });
    return Response.json({ error: "Kunne ikke lagre abonnementet" }, { status: 500 });
  }
}
