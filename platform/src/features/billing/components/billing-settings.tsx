"use client";

import { CheckIcon, CircleAlertIcon, CircleCheckIcon, CreditCardIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { openBillingPortal, startCheckout } from "@/features/billing/actions";
import type { BillingOverview } from "@/features/billing/queries";
import { PROJECT_LIMITS, PURCHASABLE_PLANS, type PurchasablePlan } from "@/lib/billing/plans";
import { trialDaysLeft } from "@/lib/billing/subscription";
import { formatDate } from "@/lib/format";
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

function UsageMeter({ used, limit }: { used: number; limit: number | null }) {
  const t = useTranslations("billing");
  const share = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="grid gap-2">
      <p className="text-sm">
        {limit === null ? t("usageUnlimited", { used }) : t("usage", { used, limit })}
      </p>
      {limit !== null ? (
        <div
          role="progressbar"
          aria-label={t("usageLabel")}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)}
          className="h-2 w-full max-w-md overflow-hidden rounded-full bg-muted"
        >
          <div className={cn("h-full rounded-full", used >= limit ? "bg-amber-500" : "bg-primary")} style={{ width: `${share}%` }} />
        </div>
      ) : null}
      <p className="text-sm text-muted-foreground">{t("usageHelp")}</p>
    </div>
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
          <UsageMeter used={overview.activeProjects} limit={overview.limit} />
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
        <ul className="grid gap-4 md:grid-cols-3">
          {PURCHASABLE_PLANS.map((plan) => {
            const price = prices[plan];
            const current = overview.hasSubscription && overview.plan === plan;
            const limit = PROJECT_LIMITS[plan] ?? 0;
            return (
              <li key={plan}>
                <Card className={cn("h-full", current && "border-primary ring-1 ring-primary")} data-plan={plan}>
                  <CardHeader>
                    <CardTitle>
                      <h3>{tPlans(`${plan}.name`)}</h3>
                    </CardTitle>
                    <CardDescription>{tPlans(`${plan}.description`)}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <p className="text-2xl font-semibold tabular-nums">
                      {price ? (price.interval ? t(`perInterval.${price.interval}`, { amount: price.amount }) : price.amount) : t("priceInCheckout")}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                      <CheckIcon className="size-4 text-emerald-600" aria-hidden="true" />
                      {t("projectLimit", { count: limit })}
                    </p>
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
      </section>
    </div>
  );
}
