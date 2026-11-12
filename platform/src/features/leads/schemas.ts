import { z } from "zod";

import { CONSENT_VERSIONS } from "@/features/leads/consent";

export const LEAD_SOURCES = ["site", "selector", "unit_page", "embed"] as const;
export const LEAD_STATUSES = ["new", "contacted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Interesseskjemaet slik nettleseren sender det. Serveren validerer alt på nytt. */
export const leadSubmissionSchema = z.object({
  projectId: z.uuid({ error: "optionInvalid" }),
  pageId: z.uuid().nullable().catch(null),
  unitId: z
    .string()
    .trim()
    .refine((value) => value === "" || z.uuid().safeParse(value).success, { error: "optionInvalid" })
    .transform((value) => value || null),
  name: z.string().trim().min(1, { error: "required" }).max(200, { error: "nameLength" }),
  email: z
    .string()
    .trim()
    .min(1, { error: "required" })
    .max(320, { error: "email" })
    .refine((value) => z.email().safeParse(value).success, { error: "email" }),
  phone: z
    .string()
    .trim()
    .max(40, { error: "phone" })
    .refine((value) => value === "" || /^\+?[0-9 ()-]{5,}$/.test(value), { error: "phone" }),
  message: z.string().trim().max(5000, { error: "textTooLong" }),
  consentContact: z.literal(true, { error: "consentRequired" }),
  consentSimilar: z.boolean(),
  consentVersion: z.string().refine((value) => Object.hasOwn(CONSENT_VERSIONS, value), { error: "optionInvalid" }),
  source: z.enum(LEAD_SOURCES).catch("site"),
  utm: z
    .record(z.string(), z.string())
    .catch({})
    .transform((utm) =>
      Object.fromEntries(
        Object.entries(utm)
          .filter(([key]) => (UTM_KEYS as readonly string[]).includes(key))
          .map(([key, value]) => [key, value.slice(0, 200)]),
      ),
    ),
  /** Honeypot. Skjult for mennesker; fyller noen det ut, er det en robot. */
  website: z.string().max(500).catch(""),
  turnstileToken: z.string().max(4096).catch(""),
});

export type LeadSubmission = z.input<typeof leadSubmissionSchema>;

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES, { error: "optionInvalid" }),
  internalNote: z
    .string()
    .trim()
    .max(5000, { error: "textTooLong" })
    .transform((value) => value || null),
});
