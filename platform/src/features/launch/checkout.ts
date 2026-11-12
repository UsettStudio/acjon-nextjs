import "server-only";

import * as Sentry from "@sentry/nextjs";
import type Stripe from "stripe";

import { stripeClient } from "@/features/billing/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Merket på Checkout-økter for oppstartsavgiften (metadata «kind»). */
export const LAUNCH_SESSION_KIND = "project_launch";

/** Checkout-økten for en oppstartsavgift i en hendelse fra Stripe, ellers null. */
export function launchSessionFromEvent(event: Stripe.Event): Stripe.Checkout.Session | null {
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return null;
  }
  const session = event.data.object;
  return session.mode === "payment" && session.metadata?.kind === LAUNCH_SESSION_KIND ? session : null;
}

/**
 * Registrerer en betalt oppstartsavgift med complete_project_launch(). Kalles
 * både av webhooken og når kunden kommer tilbake fra Checkout, så prosjektet
 * er lansert med en gang. Funksjonen tåler å bli kalt flere ganger. Svarer med
 * prosjektet, eller null når betalingen ikke er fullført ennå (for eksempel en
 * betalingsmåte som bekreftes senere) eller ikke finnes.
 */
export async function recordLaunchPayment(session: Stripe.Checkout.Session): Promise<string | null> {
  const launchId = session.metadata?.launch_id;
  if (!launchId || session.payment_status !== "paid" || session.amount_subtotal === null) {
    return null;
  }
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const { data, error } = await createAdminClient().rpc("complete_project_launch", {
    p_launch_id: launchId,
    p_session_id: session.id,
    p_amount: session.amount_subtotal,
    ...(paymentIntent ? { p_payment_intent_id: paymentIntent } : {}),
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Når kunden kommer tilbake fra Checkout: henter økten fra Stripe og
 * registrerer betalingen hvis den hører til prosjektet. «pending» betyr at
 * betalingen ikke er bekreftet ennå; webhooken registrerer den da senere.
 */
export async function confirmLaunchReturn(sessionId: string, projectId: string): Promise<"paid" | "pending" | "invalid"> {
  const stripe = stripeClient();
  if (!stripe || !/^cs_[A-Za-z0-9_]{1,250}$/.test(sessionId)) {
    return "invalid";
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.kind !== LAUNCH_SESSION_KIND || session.metadata.project_id !== projectId) {
      return "invalid";
    }
    return (await recordLaunchPayment(session)) ? "paid" : "pending";
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    return "pending";
  }
}
