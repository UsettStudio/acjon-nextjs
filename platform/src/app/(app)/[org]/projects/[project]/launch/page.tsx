import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { stripeClient } from "@/features/billing/stripe";
import { confirmLaunchReturn } from "@/features/launch/checkout";
import { LaunchPanel } from "@/features/launch/components/launch-panel";
import { getLaunchState, listLaunches } from "@/features/launch/queries";
import { getProjectContext } from "@/features/projects/queries";
import { can } from "@/lib/auth/permissions";
import { serverEnv } from "@/lib/env.server";

export async function generateMetadata({ params }: PageProps<"/[org]/projects/[project]/launch">): Promise<Metadata> {
  const { org, project } = await params;
  const [context, t] = await Promise.all([getProjectContext(org, project), getTranslations("launch")]);
  return { title: t("pageTitle", { name: context.project.name }) };
}

/**
 * Lansering: oppstartsavgiften for prosjektet. Eieren betaler; administrator
 * og redaktør ser om prosjektet er lansert. Når eieren kommer tilbake fra
 * Checkout, registreres betalingen her med en gang (webhooken gjør det samme).
 */
export default async function ProjectLaunchPage({ params, searchParams }: PageProps<"/[org]/projects/[project]/launch">) {
  const { org, project: slug } = await params;
  const context = await getProjectContext(org, slug);
  if (!can(context.role, "content.edit")) {
    notFound();
  }
  const query = await searchParams;
  const checkout = query.checkout === "success" || query.checkout === "canceled" ? query.checkout : null;
  const sessionId = typeof query.session_id === "string" ? query.session_id : null;
  const confirmation =
    checkout === "success" && sessionId ? await confirmLaunchReturn(sessionId, context.project.id) : null;
  const [state, history] = await Promise.all([getLaunchState(context.project.id), listLaunches(context.project.id)]);
  const isOwner = can(context.role, "organization.billing");

  return (
    <LaunchPanel
      projectId={context.project.id}
      state={state}
      history={history}
      canPay={isOwner && context.writable}
      hasPlan={context.organization.hasSubscription && context.organization.plan !== "trial"}
      writable={context.writable}
      stripeConfigured={stripeClient() !== null && Boolean(serverEnv().stripeLaunchProduct)}
      billingHref={isOwner ? `/${org}/settings/billing` : null}
      supportEmail={serverEnv().supportEmail ?? null}
      checkout={checkout}
      confirmation={confirmation}
    />
  );
}
