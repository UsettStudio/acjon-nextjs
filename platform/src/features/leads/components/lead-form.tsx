"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { consentTexts, CURRENT_CONSENT_VERSION } from "@/features/leads/consent";
import { announceLeadSubmitted } from "@/features/leads/events";
import { submitLead } from "@/features/leads/submit";
import { publicEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

type LeadSource = "site" | "selector" | "unit_page" | "embed";

export type LeadFormUnit = { id: string; label: string };

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

/** Feltene i nettleseren. Serveren validerer det samme på nytt. */
const formSchema = z.object({
  name: z.string().trim().min(1, { error: "required" }).max(200, { error: "nameLength" }),
  email: z
    .string()
    .trim()
    .min(1, { error: "required" })
    .refine((value) => z.email().safeParse(value).success, { error: "email" }),
  phone: z
    .string()
    .trim()
    .max(40, { error: "phone" })
    .refine((value) => value === "" || /^\+?[0-9 ()-]{5,}$/.test(value), { error: "phone" }),
  unitId: z.string(),
  message: z.string().trim().max(5000, { error: "textTooLong" }),
  consentContact: z.boolean().refine((value) => value, { error: "consentRequired" }),
  consentSimilar: z.boolean(),
  website: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

/** Cloudflare Turnstile. Vises bare når nøkkelen er satt; lastes først når skjemaet vises. */
function Turnstile({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  });
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    let cancelled = false;
    const render = () => {
      if (!cancelled && window.turnstile && element.childElementCount === 0) {
        window.turnstile.render(element, {
          sitekey: siteKey,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
        });
      }
    };
    if (window.turnstile) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
    };
  }, [siteKey]);
  return <div ref={ref} />;
}

export function LeadForm({
  projectId,
  pageId,
  units,
  defaultUnitId,
  showUnitSelect,
  buttonLabel,
  source,
  organizationName,
  projectName,
  locale,
  disabled = false,
  variant = "default",
}: {
  projectId: string;
  pageId: string | null;
  units: LeadFormUnit[];
  defaultUnitId: string | null;
  showUnitSelect: boolean;
  buttonLabel: string;
  source: LeadSource;
  organizationName: string;
  projectName: string;
  locale: string;
  /** I forhåndsvisningen kan skjemaet ikke sendes. */
  disabled?: boolean;
  /**
   * inverted: skjemaet står på hovedfargen (interesseskjemaet i designstilen
   * Nordisk). Knappen blir hvit, og feil og hjelpetekst får full kontrast.
   */
  variant?: "default" | "inverted";
}) {
  const t = useTranslations("site.lead");
  const tValidation = useTranslations("validation");
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const successRef = useRef<HTMLDivElement>(null);
  const siteKey = publicEnv().turnstileSiteKey;
  const consent = consentTexts(locale, { organization: organizationName, project: projectName });
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      unitId: defaultUnitId ?? "",
      message: "",
      consentContact: false,
      consentSimilar: false,
      website: "",
    },
  });
  const { errors } = form.formState;
  const message = (key: string | undefined) => (key ? tValidation(key as "required") : undefined);

  useEffect(() => {
    if (sent) {
      successRef.current?.focus();
    }
  }, [sent]);

  const onSubmit = form.handleSubmit((values) => {
    if (disabled) {
      return;
    }
    setError(null);
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(UTM_KEYS.flatMap((key) => (params.get(key) ? [[key, params.get(key) ?? ""]] : [])));
    startTransition(async () => {
      const result = await submitLead({
        projectId,
        pageId,
        unitId: values.unitId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        consentContact: values.consentContact as true,
        consentSimilar: values.consentSimilar,
        consentVersion: CURRENT_CONSENT_VERSION,
        source,
        utm,
        website: values.website,
        turnstileToken: token,
      });
      if (result.ok) {
        setSent(true);
        announceLeadSubmitted({ projectId, unitId: values.unitId || null, source });
        return;
      }
      if (result.fieldErrors) {
        for (const [field, key] of Object.entries(result.fieldErrors)) {
          if (field in values) {
            form.setError(field as keyof FormValues, { type: "server", message: key });
          }
        }
      }
      setError(
        result.error === "rateLimited" || result.error === "closed" || result.error === "captcha" || result.error === "invalidInput"
          ? t(`errors.${result.error}`)
          : t("errors.unknown"),
      );
    });
  });

  const inverted = variant === "inverted";

  if (sent) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className={cn("flex gap-3 rounded-[var(--site-radius)] border-2 p-6 outline-none", inverted ? "border-current" : "border-[var(--site-primary)]")}
      >
        <CheckCircle2Icon className={cn("mt-0.5 size-6 shrink-0", inverted ? "text-current" : "text-[var(--site-primary)]")} aria-hidden="true" />
        <div>
          <p className="site-heading text-xl font-semibold">{t("successTitle")}</p>
          <p className="mt-1">{t("successBody", { organization: organizationName })}</p>
        </div>
      </div>
    );
  }

  const inputClass = cn(
    "w-full rounded-[var(--site-radius)] border border-current/25 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none aria-invalid:border-red-600",
    inverted
      ? "border-transparent focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--site-primary)] aria-invalid:border-2"
      : "focus-visible:border-[var(--site-primary)] focus-visible:ring-2 focus-visible:ring-[var(--site-primary)]/40",
  );
  const checkboxClass = cn("mt-1 size-5 shrink-0", inverted ? "accent-white" : "accent-[var(--site-primary)]");
  const field = (name: keyof FormValues) => ({
    id: `${id}-${name}`,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });
  const errorText = (name: keyof FormValues) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className={cn("mt-1 text-sm", inverted ? "font-medium underline decoration-2 underline-offset-4" : "text-red-700")}>
        {message(errors[name]?.message)}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4" aria-describedby={disabled ? `${id}-disabled` : undefined}>
      {error ? (
        <p role="alert" className="rounded-[var(--site-radius)] border border-red-300 bg-red-50 px-4 py-3 text-red-900">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="mb-1 block font-medium">
            {t("name")} <span aria-hidden="true">*</span>
          </label>
          <input {...field("name")} autoComplete="name" required className={inputClass} {...form.register("name")} />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="mb-1 block font-medium">
            {t("email")} <span aria-hidden="true">*</span>
          </label>
          <input {...field("email")} type="email" autoComplete="email" required className={inputClass} {...form.register("email")} />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="mb-1 block font-medium">
            {t("phone")}
          </label>
          <input {...field("phone")} type="tel" autoComplete="tel" className={inputClass} {...form.register("phone")} />
          {errorText("phone")}
        </div>
        {showUnitSelect && units.length > 0 ? (
          <div>
            <label htmlFor={`${id}-unitId`} className="mb-1 block font-medium">
              {t("unit")}
            </label>
            <select {...field("unitId")} className={inputClass} {...form.register("unitId")}>
              <option value="">{t("noUnit")}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="mb-1 block font-medium">
          {t("message")}
        </label>
        <textarea {...field("message")} rows={4} className={inputClass} {...form.register("message")} />
        {errorText("message")}
      </div>
      {/* Honeypot: skjult for mennesker og skjermlesere. */}
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>{t("honeypot")}</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" {...form.register("website")} />
      </div>
      <fieldset className="grid gap-3">
        <legend className="sr-only">{t("consentLegend")}</legend>
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className={checkboxClass}
              aria-invalid={Boolean(errors.consentContact)}
              aria-describedby={errors.consentContact ? `${id}-consentContact-error` : undefined}
              {...form.register("consentContact")}
            />
            <span>
              {consent.contact} <span aria-hidden="true">*</span>
            </span>
          </label>
          {errorText("consentContact")}
        </div>
        <label className="flex items-start gap-3">
          <input type="checkbox" className={checkboxClass} {...form.register("consentSimilar")} />
          <span>{consent.similar}</span>
        </label>
      </fieldset>
      {siteKey && !disabled ? <Turnstile siteKey={siteKey} onToken={setToken} /> : null}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || disabled}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-[var(--site-radius)] px-6 py-3 font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
            "nordic:px-8 nordic:py-4 nordic:text-xs nordic:font-medium nordic:tracking-[0.2em] nordic:uppercase",
            inverted
              ? "bg-[var(--site-primary-foreground)] text-[var(--site-primary)] focus-visible:outline-[var(--site-primary-foreground)]"
              : "bg-[var(--site-primary)] text-[var(--site-primary-foreground)] focus-visible:outline-[var(--site-primary)]",
          )}
        >
          {pending ? <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" /> : null}
          {buttonLabel || t("submit")}
        </button>
        <p className={cn("text-sm", !inverted && "opacity-80")}>{t("required")}</p>
      </div>
      {disabled ? (
        <p id={`${id}-disabled`} className={cn("text-sm", !inverted && "opacity-80")}>
          {t("previewDisabled")}
        </p>
      ) : null}
    </form>
  );
}
