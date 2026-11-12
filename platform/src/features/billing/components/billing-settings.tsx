"use client";

import { CheckIcon, CircleAlertIcon, CircleCheckIcon, CreditCardIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { openBillingPortal, startCheckout } from "@/features/billing/actions";
import type { BillingOverview } from "@/features/billing/queries";
import { LAUNCH_MAX_SELF_SERVE_UNITS, LAUNCH_TIERS } from "@/lib/billing/launch";
import { PLAN_LIMITS, PURCHASABLE_PLANS, type PurchasablePlan } from "@/lib/billing/plans";
import { trialDaysLeft } from "@/lib/billing/subscription";
import { formatCurrency, formatDate, type FormatLocale } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PlanPriceLabel = { amount: string; interval: "day" | "week" | "month" | "year" | null } | null;

function useBillingErrors() {
  const t = useTranslations("billing.errors");
  const tErrors = useTranslations("errors");
  return (code: string) =>
    code === "billingUnavailable" || code === "subscriptionExists" || code === "noCustomer"
      ? t(code)
      : tErrors(code as "unknown");
}

type FeatureItem =
  | { key: "site" | "selector" | "leads" | "tracking" | "api" | "embed" | "membersUnlimited" | "onboarding" | "prioritySupport" }
  | { key: "domains" | "members"; count: number };

/**
 * Hva hver pakke har, i rekkefølgen kunden leser det. Grensene hentes fra
 * PLAN_LIMITS, så teksten alltid stemmer med det databasen håndhever.
 */
const PLAN_FEATURES: Record<PurchasablePlan, { inherits: PurchasablePlan | null; items: FeatureItem[] }> = {
  start: {
    inherits: null,
    items: [
      { key: "site" },
      { key: "selector" },
      { key: "leads" },
      { key: "tracking" },
      { key: "domains", count: PLAN_LIMITS.start.domainsPerSite },
      { key: "members", count: PLAN_LIMITS.start.members ?? 0 },
    ],
  },
  pro: {
    inherits: "start",
    items: [
      { key: "api" },
      { key: "embed" },
      { key: "domains", count: PLAN_LIMITS.pro.domainsPerSite },
      { key: "members", count: PLAN_LIMITS.pro.members ?? 0 },
    ],
  },
  partner: {
    inherits: "pro",
    items: [{ key: "membersUnlimited" }, { key: "onboarding" }, { key: "prioritySupport" }],
  },
};

function PlanFeatures({ plan }: { plan: PurchasablePlan }) {
  const t = useTranslations("billing.features");
  const tPlans = useTranslations("billing.plans");
  const { inherits, items } = PLAN_FEATURES[plan];
  return (
    <div className="grid gap-2">
      {inherits ? <p className="text-sm font-medium">{t("inherits", { plan: tPlans(`${inherits}.name`) })}</p> : null}
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-2 text-sm">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            {"count" in item ? t(item.key, { count: item.count }) : t(item.key)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Oppstartsavgiften per prosjekt, etter antall enheter (lib/billing/launch.ts). */
function LaunchPrices() {
  const t = useTranslations("billing.launch");
  const locale = useLocale() as FormatLocale;
  return (
    <section aria-labelledby="oppstart" className="grid gap-4">
      <div className="grid gap-1">
        <h2 id="oppstart" className="text-lg font-semibold">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="max-w-xl rounded-lg border">
        <Table>
          <TableCaption className="sr-only">{t("title")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t("units")}</TableHead>
              <TableHead className="text-right">{t("price")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LAUNCH_TIERS.map((tier) => (
              <TableRow key={tier.maxUnits}>
                <TableCell>{t("range", { min: tier.minUnits, max: tier.maxUnits })}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(tier.amount, locale)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>{t("over", { units: LAUNCH_MAX_SELF_SERVE_UNITS })}</TableCell>
              <TableCell className="text-right">{t("byAgreement")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function BillingSettings({
  organizationId,
  overview,
  prices,
  stripeConfigured,
  checkout,
  supportEmail,
}: {
  organizationId: string;
  overview: BillingOverview;
  prices: Record<PurchasablePlan, PlanPriceLabel>;
  stripeConfigured: boolean;
  checkout: "success" | "canceled" | null;
  supportEmail: string | null;
}) {
  const t = useTranslations("billing");
  const tPlans = useTranslations("billing.plans");
  const tStatus = useTranslations("subscriptionStatus");
  const errorMessage = useBillingErrors();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  // Etter Checkout kommer webhooken vanligvis i løpet av noen sekunder.
  useEffect(() => {
    if (checkout !== "success" || overview.hasSubscription) {
      return;
    }
    const timer = setInterval(() => router.refresh(), 3000);
    const stop = setTimeout(() => clearInterval(timer), 60_000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [checkout, overview.hasSubscription, router]);

  function run(key: string, task: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(key);
    startTransition(async () => {
      const result = await task();
      setBusy(null);
      if (!result.ok) {
        toast.error(errorMessage(result.error ?? "unknown"));
      }
    });
  }

  const daysLeft = trialDaysLeft(overview.trialEndsAt);
  let statusLine: string;
  if (overview.status === "trialing" && !overview.hasSubscription) {
    statusLine = overview.writable && overview.trialEndsAt
      ? t("trialUntil", { date: formatDate(overview.trialEndsAt), days: daysLeft ?? 0 })
      : t("trialEnded");
  } else if (overview.status === "trialing" && overview.trialEndsAt) {
    statusLine = t("trialThenPlan", { date: formatDate(overview.trialEndsAt), plan: tPlans(`${overview.plan}.name`) });
  } else if (overview.status === "active" && overview.cancelAtPeriodEnd && overview.currentPeriodEnd) {
    statusLine = t("endsAt", { date: formatDate(overview.currentPeriodEnd) });
  } else if (overview.status === "active" && overview.currentPeriodEnd) {
    statusLine = t("renewsAt", { date: formatDate(overview.currentPeriodEnd) });
  } else if (overview.status === "past_due") {
    statusLine = t("pastDue");
  } else {
    statusLine = t("ended");
  }

  return (
    <div className="grid gap-6">
      {checkout === "success" ? (
        <Alert>
          <CircleCheckIcon aria-hidden="true" />
          <AlertDescription className="text-foreground">
            {overview.hasSubscription ? t("checkoutDone") : t("checkoutPending")}
          </AlertDescription>
        </Alert>
      ) : checkout === "canceled" ? (
        <Alert>
          <CircleAlertIcon aria-hidden="true" />
          <AlertDescription className="text-foreground">{t("checkoutCanceled")}</AlertDescription>
        </Alert>
      ) : null}
      {stripeConfigured ? null : (
        <Alert>
          <CircleAlertIcon aria-hidden="true" />
          <AlertDescription className="text-foreground">{t("notConfigured")}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("title")}</h2>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">{t("plan")}</dt>
              <dd className="text-lg font-semibold" data-testid="billing-plan">
                {tPlans(`${overview.plan}.name`)}
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">{t("status")}</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <Badge variant={overview.writable ? "secondary" : "destructive"} data-testid="billing-status">
                  {tStatus(overview.status)}
                </Badge>
                <span className="text-sm">{statusLine}</span>
              </dd>
            </div>
          </dl>
          {overview.writable ? null : (
            <Alert variant="destructive">
              <CircleAlertIcon aria-hidden="true" />
              <AlertDescription>{t("readOnlyHelp")}</AlertDescription>
            </Alert>
          )}
          {overview.plan === "trial" ? <p className="text-sm text-muted-foreground">{t("trialHelp")}</p> : null}
        </CardContent>
        {overview.hasCustomer ? (
          <CardFooter>
            <Button
              type="button"
              variant="outline"
              disabled={!stripeConfigured || pending}
              onClick={() => run("portal", () => openBillingPortal({ organizationId }))}
            >
              {busy === "portal" ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : <CreditCardIcon aria-hidden="true" />}
              {t("portal")}
            </Button>
          </CardFooter>
        ) : null}
      </Card>

      <section aria-labelledby="planer" className="grid gap-4">
        <div className="grid gap-1">
          <h2 id="planer" className="text-lg font-semibold">
            {t("plansTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("plansHelp")}</p>
        </div>
        <ul className="grid gap-4 lg:grid-cols-3">
          {PURCHASABLE_PLANS.map((plan) => {
            const price = prices[plan];
            const current = overview.hasSubscription && overview.plan === plan;
            return (
              <li key={plan}>
                <Card className={cn("h-full", current && "border-primary ring-1 ring-primary")} data-plan={plan}>
                  <CardHeader>
                    <CardTitle>
                      <h3>{tPlans(`${plan}.name`)}</h3>
                    </CardTitle>
                    <CardDescription>{tPlans(`${plan}.description`)}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <p className="text-2xl font-semibold tabular-nums">
                      {price ? (price.interval ? t(`perInterval.${price.interval}`, { amount: price.amount }) : price.amount) : t("priceInCheckout")}
                    </p>
                    <PlanFeatures plan={plan} />
                  </CardContent>
                  <CardFooter>
                    {current ? (
                      <Badge variant="secondary">{t("currentPlan")}</Badge>
                    ) : overview.hasSubscription ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!stripeConfigured || pending}
                        onClick={() => run(plan, () => openBillingPortal({ organizationId }))}
                      >
                        {busy === plan ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : null}
                        {t("changeInPortal")}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled={!stripeConfigured || !price || pending}
                        onClick={() => run(plan, () => startCheckout({ organizationId, plan }))}
                      >
                        {busy === plan ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : null}
                        {t("choose", { plan: tPlans(`${plan}.name`) })}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-muted-foreground">{t("terms")}</p>
      </section>

      <LaunchPrices />

      <p className="text-sm text-muted-foreground">
        {supportEmail ? (
          <>
            {t("enterprise")}{" "}
            <a className="underline underline-offset-4" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
          </>
        ) : (
          t("enterpriseNoContact")
        )}
      </p>
    </div>
  );
}
