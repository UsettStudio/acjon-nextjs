"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { priceIdFor, stripeClient } from "@/features/billing/stripe";
import { PURCHASABLE_PLANS } from "@/lib/billing/plans";
import { fail, type ActionResult } from "@/lib/actions/result";
import { ActionError, requireOrgCapability, runAction } from "@/lib/actions/server";
import { appUrl } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type BillingError = "billingUnavailable" | "subscriptionExists" | "noCustomer";

const STRIPE_LOCALES = { nb: "nb", en: "en", sv: "sv" } as const;
/** Stripe krever at prøveperioden i Checkout varer minst 48 timer til. */
const MIN_TRIAL_MS = 49 * 60 * 60 * 1000;
const LIVE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid", "paused"]);

const checkoutSchema = z.object({ organizationId: z.uuid(), plan: z.enum(PURCHASABLE_PLANS) });

async function loadOrganization(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, locale, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id")
    .eq("id", organizationId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Starter Stripe Checkout for en plan. Organisasjonen får en Stripe-kunde
 * første gang. Gjenstår det mer enn to døgn av prøveperioden, starter
 * abonnementet med resten av prøveperioden, så kunden ikke betaler for dager
 * de allerede har gratis. Bare eieren kan velge abonnement, også i lesemodus.
 */
export async function startCheckout(input: { organizationId: string; plan: string }): Promise<ActionResult<never, BillingError>> {
  return runAction(async () => {
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      throw new ActionError("invalidInput");
    }
    const { organizationId, plan } = parsed.data;
    const { user } = await requireOrgCapability(organizationId, "organization.billing", { allowReadOnly: true });
    const stripe = stripeClient();
    const priceId = priceIdFor(plan);
    if (!stripe || !priceId) {
      return fail("billingUnavailable");
    }
    const organization = await loadOrganization(organizationId);
    if (organization.stripe_subscription_id && LIVE_STATUSES.has(organization.subscription_status)) {
      return fail("subscriptionExists");
    }

    let customer = organization.stripe_customer_id;
    if (!customer) {
      const created = await stripe.customers.create({
        name: organization.name,
        email: user.email ?? undefined,
        preferred_locales: [organization.locale],
        metadata: { organization_id: organization.id },
      });
      const { data, error } = await createAdminClient().rpc("link_stripe_customer", {
        p_organization_id: organization.id,
        p_customer_id: created.id,
      });
      if (error) {
        throw error;
      }
      customer = data;
    }

    const trialEnd =
      organization.subscription_status === "trialing" && organization.trial_ends_at
        ? new Date(organization.trial_ends_at).getTime()
        : 0;
    const billingUrl = `/${organization.slug}/settings/billing`;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: organization.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl(`${billingUrl}?checkout=success`),
      cancel_url: appUrl(`${billingUrl}?checkout=canceled`),
      locale: STRIPE_LOCALES[organization.locale as keyof typeof STRIPE_LOCALES] ?? "nb",
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
      ...(serverEnv().stripeAutomaticTax ? { automatic_tax: { enabled: true } } : {}),
      metadata: { organization_id: organization.id, plan },
      subscription_data: {
        metadata: { organization_id: organization.id, plan },
        ...(trialEnd - Date.now() > MIN_TRIAL_MS ? { trial_end: Math.floor(trialEnd / 1000) } : {}),
      },
    });
    if (!session.url) {
      throw new Error("Stripe svarte uten adresse til Checkout");
    }
    redirect(session.url);
  });
}

/** Stripe sin kundeportal: betalingsmåte, fakturaer, bytte av plan og oppsigelse. */
export async function openBillingPortal(input: { organizationId: string }): Promise<ActionResult<never, BillingError>> {
  return runAction(async () => {
    const organizationId = z.uuid().safeParse(input.organizationId);
    if (!organizationId.success) {
      throw new ActionError("invalidInput");
    }
    await requireOrgCapability(organizationId.data, "organization.billing", { allowReadOnly: true });
    const stripe = stripeClient();
    if (!stripe) {
      return fail("billingUnavailable");
    }
    const organization = await loadOrganization(organizationId.data);
    if (!organization.stripe_customer_id) {
      return fail("noCustomer");
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripe_customer_id,
      return_url: appUrl(`/${organization.slug}/settings/billing`),
      locale: STRIPE_LOCALES[organization.locale as keyof typeof STRIPE_LOCALES] ?? "nb",
    });
    redirect(session.url);
  });
}
