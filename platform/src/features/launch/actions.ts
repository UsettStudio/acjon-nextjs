"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { stripeClient } from "@/features/billing/stripe";
import { LAUNCH_SESSION_KIND } from "@/features/launch/checkout";
import { isLocale } from "@/i18n/config";
import { fail, type ActionResult } from "@/lib/actions/result";
import { ActionError, postgresErrorCode, requireOrgCapability, runAction } from "@/lib/actions/server";
import { LAUNCH_CURRENCY, launchOptionFor, launchQuote, toMinorUnits } from "@/lib/billing/launch";
import { appUrl } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type LaunchError = "billingUnavailable" | "choosePlanFirst" | "contactUs" | "tierUnavailable";

const STRIPE_LOCALES = { nb: "nb", en: "en", sv: "sv" } as const;
/** Oppstartsavgiften betales av organisasjoner med en pakke i Stripe som gjelder. */
const PAYING_STATUSES = new Set(["active", "trialing", "past_due"]);

const launchSchema = z.object({ projectId: z.uuid(), maxUnits: z.number().int().positive() });

/**
 * Starter Stripe Checkout for oppstartsavgiften: lansering av prosjektet, eller
 * utvidelse til et høyere nivå. Nivået (maxUnits) må være et av nivåene
 * launchQuote() tilbyr for prosjektet nå. Beløpet regnes ut her, på serveren.
 * Bare eieren betaler, og organisasjonen må ha valgt pakke først.
 */
export async function startLaunchCheckout(input: {
  projectId: string;
  maxUnits: number;
}): Promise<ActionResult<never, LaunchError>> {
  return runAction(async () => {
    const parsed = launchSchema.safeParse(input);
    if (!parsed.success) {
      throw new ActionError("invalidInput");
    }
    const { projectId, maxUnits } = parsed.data;
    const supabase = await createClient();
    const { data: project, error } = await supabase
      .from("projects")
      .select(
        "id, name, slug, organization_id, launched_at, launch_unit_limit, organization:organizations(slug, locale, plan, subscription_status, stripe_customer_id, stripe_subscription_id)",
      )
      .eq("id", projectId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!project?.organization) {
      throw new ActionError("notFound");
    }
    const { user } = await requireOrgCapability(project.organization_id, "organization.billing");
    const organization = project.organization;
    if (
      organization.plan === "trial" ||
      !organization.stripe_customer_id ||
      !organization.stripe_subscription_id ||
      !PAYING_STATUSES.has(organization.subscription_status)
    ) {
      return fail("choosePlanFirst");
    }
    const stripe = stripeClient();
    const product = serverEnv().stripeLaunchProduct;
    if (!stripe || !product) {
      return fail("billingUnavailable");
    }

    const { count, error: countError } = await supabase
      .from("units")
      .select("id", { count: "exact", head: true })
      .eq("project_id", project.id);
    if (countError) {
      throw countError;
    }
    const state = {
      launchedAt: project.launched_at,
      unitLimit: project.launched_at ? project.launch_unit_limit : null,
      units: count ?? 0,
    };
    const choice = launchOptionFor(state, maxUnits);
    if (!choice) {
      return fail(launchQuote(state).kind === "contact" ? "contactUs" : "tierUnavailable");
    }

    const admin = createAdminClient();
    const { data: launchId, error: launchError } = await admin.rpc("begin_project_launch", {
      p_project_id: project.id,
      p_kind: choice.kind,
      p_units: state.units,
      p_unit_limit: choice.option.tier.maxUnits,
      p_amount: toMinorUnits(choice.option.amount),
      p_currency: LAUNCH_CURRENCY,
      p_created_by: user.id,
    });
    if (launchError) {
      // Lansert eller utvidet i mellomtiden.
      if (postgresErrorCode(launchError) === "23505" || postgresErrorCode(launchError) === "22023") {
        return fail("tierUnavailable");
      }
      throw launchError;
    }

    const locale = isLocale(organization.locale) ? organization.locale : "nb";
    const t = await getTranslations({ locale, namespace: "launch.checkout" });
    const description = t(choice.kind === "launch" ? "launchDescription" : "upgradeDescription", {
      project: project.name,
      units: choice.option.tier.maxUnits,
    });
    const metadata = {
      kind: LAUNCH_SESSION_KIND,
      launch_id: launchId,
      organization_id: project.organization_id,
      project_id: project.id,
    };
    const launchPath = `/${organization.slug}/projects/${project.slug}/launch`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: organization.stripe_customer_id,
      client_reference_id: project.organization_id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: LAUNCH_CURRENCY,
            product,
            unit_amount: toMinorUnits(choice.option.amount),
            tax_behavior: "exclusive",
          },
        },
      ],
      success_url: appUrl(`${launchPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`),
      cancel_url: appUrl(`${launchPath}?checkout=canceled`),
      locale: STRIPE_LOCALES[locale],
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
      ...(serverEnv().stripeAutomaticTax ? { automatic_tax: { enabled: true } } : {}),
      invoice_creation: { enabled: true, invoice_data: { description, metadata } },
      payment_intent_data: { description, metadata },
      metadata,
    });
    if (!session.url) {
      throw new Error("Stripe svarte uten adresse til Checkout");
    }
    const { error: attachError } = await admin.rpc("attach_launch_checkout", {
      p_launch_id: launchId,
      p_session_id: session.id,
    });
    if (attachError) {
      throw attachError;
    }
    redirect(session.url);
  });
}
