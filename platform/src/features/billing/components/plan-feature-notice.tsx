"use client";

import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Plan } from "@/lib/billing/plans";

/**
 * Sier fra at en funksjon ikke er med i pakken organisasjonen har, og hvor
 * pakken byttes. Eieren får en lenke til Abonnement; andre får beskjed om å
 * spørre eieren.
 */
export function PlanFeatureNotice({
  kind,
  plan,
  billingHref,
}: {
  kind: "integrations" | "embed";
  plan: Plan;
  /** Abonnementssiden når brukeren er eier, ellers null. */
  billingHref: string | null;
}) {
  const t = useTranslations("billing.notice");
  const tPlans = useTranslations("billing.plans");
  return (
    <Alert data-testid="plan-feature-notice">
      <CircleAlertIcon aria-hidden="true" />
      <AlertDescription className="text-foreground">
        <span>{t(kind, { plan: tPlans(`${plan}.name`) })}</span>{" "}
        {billingHref ? (
          <Link className="font-medium underline underline-offset-4" href={billingHref}>
            {t("upgrade")}
          </Link>
        ) : (
          <span>{t("askOwner")}</span>
        )}
      </AlertDescription>
    </Alert>
  );
}
