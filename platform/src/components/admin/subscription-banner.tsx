import { CircleAlertIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import type { OrgContext } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { trialDaysLeft } from "@/lib/billing/subscription";
import { cn } from "@/lib/utils";

/**
 * Melding om abonnementet øverst i admin:
 *   - lesemodus (prøveperioden er ute eller abonnementet er avsluttet),
 *   - betaling som har feilet,
 *   - prøveperioden slutter om sju dager eller mindre.
 * Eieren får en lenke til Abonnement. Databasen avviser uansett endringer i lesemodus.
 */
export async function SubscriptionBanner({ context, now = new Date() }: { context: OrgContext; now?: Date }) {
  const t = await getTranslations("billing.banner");
  const { organization } = context;
  const owner = can(context.role, "organization.billing");
  const billingHref = `/${organization.slug}/settings/billing`;

  let message: string | null = null;
  let tone: "warning" | "danger" = "warning";
  let cta: string | null = null;
  if (!context.writable) {
    tone = "danger";
    message = organization.subscriptionStatus === "trialing" ? t("trialEnded") : t("ended");
    cta = owner ? t("choosePlan") : null;
  } else if (organization.subscriptionStatus === "past_due") {
    tone = "danger";
    message = t("pastDue");
    cta = owner ? t("updatePayment") : null;
  } else if (organization.subscriptionStatus === "trialing" && !organization.hasSubscription) {
    const days = trialDaysLeft(organization.trialEndsAt, now);
    if (days !== null && days <= 7) {
      message = t("trialEnding", { days });
      cta = owner ? t("choosePlan") : null;
    }
  }
  if (!message) {
    return null;
  }

  const Icon = tone === "danger" ? CircleAlertIcon : InfoIcon;
  return (
    <div role="status" className={cn("border-b", tone === "danger" ? "bg-destructive/10" : "bg-warning/15")}>
      <p className="mx-auto flex max-w-[96rem] flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2 text-sm">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span>
          {message} {owner ? null : t("contactOwner")}
        </span>
        {cta ? (
          <Link href={billingHref} className="font-medium underline underline-offset-4">
            {cta}
          </Link>
        ) : null}
      </p>
    </div>
  );
}
