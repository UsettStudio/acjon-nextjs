"use client";

import { CircleAlertIcon, CircleCheckIcon, LoaderCircleIcon, RocketIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { startLaunchCheckout } from "@/features/launch/actions";
import type { LaunchRecord } from "@/features/launch/queries";
import { LAUNCH_MAX_SELF_SERVE_UNITS, launchQuote, type LaunchOption, type LaunchState } from "@/lib/billing/launch";
import { formatCurrency, formatDate, type FormatLocale } from "@/lib/format";

type LaunchErrorCode = "billingUnavailable" | "choosePlanFirst" | "contactUs" | "tierUnavailable";
const LAUNCH_ERRORS = new Set<string>(["billingUnavailable", "choosePlanFirst", "contactUs", "tierUnavailable"]);

function TierChoice({
  options,
  value,
  onChange,
  legend,
  help,
  disabled,
}: {
  options: LaunchOption[];
  value: number;
  onChange: (maxUnits: number) => void;
  legend: string;
  help: string;
  disabled: boolean;
}) {
  const t = useTranslations("launch");
  const locale = useLocale() as FormatLocale;
  const helpId = useId();
  return (
    <fieldset className="grid gap-3" aria-describedby={helpId} disabled={disabled}>
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <p id={helpId} className="text-sm text-muted-foreground">
        {help}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.tier.maxUnits}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 text-sm has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary has-[:disabled]:cursor-not-allowed has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="launch-tier"
                value={option.tier.maxUnits}
                checked={value === option.tier.maxUnits}
                onChange={() => onChange(option.tier.maxUnits)}
                className="size-4 accent-primary"
              />
              <span>
                <span className="block font-medium">{t("tierOption", { units: option.tier.maxUnits })}</span>
                <span className="block text-muted-foreground">
                  {t("tierRange", { min: option.tier.minUnits, max: option.tier.maxUnits })}
                </span>
              </span>
            </span>
            <span className="font-semibold tabular-nums">{formatCurrency(option.amount, locale)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function LaunchPanel({
  projectId,
  state,
  history,
  canPay,
  hasPlan,
  writable,
  stripeConfigured,
  billingHref,
  supportEmail,
  checkout,
  confirmation,
}: {
  projectId: string;
  state: LaunchState;
  history: LaunchRecord[];
  /** Eieren, når organisasjonen ikke er i lesemodus. */
  canPay: boolean;
  /** Organisasjonen har valgt en pakke i Stripe (ikke bare prøveperioden). */
  hasPlan: boolean;
  writable: boolean;
  stripeConfigured: boolean;
  billingHref: string | null;
  supportEmail: string | null;
  checkout: "success" | "canceled" | null;
  confirmation: "paid" | "pending" | "invalid" | null;
}) {
  const t = useTranslations("launch");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as FormatLocale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const quote = launchQuote(state);
  const options = quote.kind === "launch" || quote.kind === "upgrade" ? quote.options : [];
  const [selected, setSelected] = useState<number | null>(options[0]?.tier.maxUnits ?? null);
  const choice = options.find((option) => option.tier.maxUnits === selected) ?? options[0] ?? null;

  // Betalingen bekreftes vanligvis med en gang. Ellers kommer webhooken litt senere.
  const waiting = checkout === "success" && confirmation !== "paid";
  useEffect(() => {
    if (!waiting) {
      return;
    }
    const timer = setInterval(() => router.refresh(), 3000);
    const stop = setTimeout(() => clearInterval(timer), 60_000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [waiting, router]);

  function pay() {
    if (!choice) {
      return;
    }
    startTransition(async () => {
      const result = await startLaunchCheckout({ projectId, maxUnits: choice.tier.maxUnits });
      if (!result.ok) {
        toast.error(
          LAUNCH_ERRORS.has(result.error)
            ? t(`errors.${result.error as LaunchErrorCode}`)
            : tErrors(result.error as "unknown"),
        );
      }
    });
  }

  const launched = state.launchedAt !== null;
  const blockedReason = !writable
    ? null
    : !canPay
      ? t("ownerOnly")
      : !hasPlan
        ? t("choosePlanFirst")
        : !stripeConfigured
          ? t("notConfigured")
          : null;

  return (
    <div className="grid gap-6">
      {checkout === "success" ? (
        <Alert>
          <CircleCheckIcon aria-hidden="true" />
          <AlertDescription className="text-foreground">
            {confirmation === "paid" ? t("checkoutDone") : t("checkoutPending")}
          </AlertDescription>
        </Alert>
      ) : checkout === "canceled" ? (
        <Alert>
          <CircleAlertIcon aria-hidden="true" />
          <AlertDescription className="text-foreground">{t("checkoutCanceled")}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("title")}</h2>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2" data-testid="launch-status">
            <Badge variant={launched ? "secondary" : "outline"}>{launched ? t("launched") : t("notLaunched")}</Badge>
            <span className="text-sm">
              {launched && state.launchedAt ? `${t("launchedOn", { date: formatDate(state.launchedAt, locale) })} ` : null}
              {t("units", { count: state.units })}{" "}
              {launched ? (state.unitLimit === null ? t("unlimited") : t("covers", { limit: state.unitLimit })) : null}
            </span>
          </div>

          {quote.kind === "launch" ? (
            <TierChoice
              options={quote.options}
              value={choice?.tier.maxUnits ?? 0}
              onChange={setSelected}
              legend={t("chooseTier")}
              help={t("chooseTierHelp")}
              disabled={pending || blockedReason !== null || !writable}
            />
          ) : quote.kind === "upgrade" ? (
            quote.options.length > 0 ? (
              <TierChoice
                options={quote.options}
                value={choice?.tier.maxUnits ?? 0}
                onChange={setSelected}
                legend={t("upgradeTitle")}
                help={t("upgradeHelp")}
                disabled={pending || blockedReason !== null || !writable}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("topTier")}</p>
            )
          ) : quote.kind === "contact" ? (
            <p className="text-sm">
              {t("contact", { units: LAUNCH_MAX_SELF_SERVE_UNITS })}{" "}
              {supportEmail ? (
                <a className="underline underline-offset-4" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
              ) : null}
            </p>
          ) : null}

          {blockedReason && choice ? (
            <Alert>
              <CircleAlertIcon aria-hidden="true" />
              <AlertDescription className="text-foreground">{blockedReason}</AlertDescription>
            </Alert>
          ) : null}
          <p className="text-sm text-muted-foreground">{t("vatNote")}</p>
        </CardContent>
        {choice ? (
          <CardFooter className="flex flex-wrap gap-3">
            {canPay && !hasPlan && billingHref ? (
              <Button asChild>
                <Link href={billingHref}>{t("choosePlan")}</Link>
              </Button>
            ) : (
              <Button type="button" onClick={pay} disabled={pending || blockedReason !== null || !writable}>
                {pending ? <LoaderCircleIcon className="animate-spin" aria-hidden="true" /> : <RocketIcon aria-hidden="true" />}
                {quote.kind === "upgrade"
                  ? t("payUpgrade", { amount: formatCurrency(choice.amount, locale) })
                  : t("pay", { amount: formatCurrency(choice.amount, locale) })}
              </Button>
            )}
          </CardFooter>
        ) : null}
      </Card>

      {canPay || history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("historyTitle")}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("historyEmpty")}</p>
            ) : (
              <Table>
                <TableCaption className="sr-only">{t("historyTitle")}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("history.date")}</TableHead>
                    <TableHead>{t("history.kind")}</TableHead>
                    <TableHead>{t("history.level")}</TableHead>
                    <TableHead className="text-right">{t("history.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.at, locale)}</TableCell>
                      <TableCell>{t(`kinds.${record.kind}`)}</TableCell>
                      <TableCell>
                        {record.unitLimit === null ? t("levelUnlimited") : t("tierOption", { units: record.unitLimit })}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(record.amount, locale)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
