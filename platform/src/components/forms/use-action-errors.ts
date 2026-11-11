"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import type { CommonActionError, ValidationKey } from "@/lib/actions/result";

type FailedResult = { ok: false; error: string; fieldErrors?: Record<string, ValidationKey> };

/**
 * Felles håndtering av svar fra serverhandlinger i skjemaer: feltfeil settes på
 * feltene, andre feil vises som en melding over skjemaet. Egne feilkoder kan
 * oversettes med `translateSpecific`.
 */
export function useActionErrors<T extends FieldValues, TContext, TTransformed>(
  form: UseFormReturn<T, TContext, TTransformed>,
  translateSpecific?: (code: string) => string | undefined,
) {
  const tErrors = useTranslations("errors");
  const [formError, setFormError] = useState<string | null>(null);

  const apply = useCallback(
    (result: FailedResult) => {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as Path<T>, { type: "server", message });
        }
      }
      const specific = translateSpecific?.(result.error);
      if (specific) {
        setFormError(specific);
      } else if (result.error !== "invalidInput" || !result.fieldErrors) {
        setFormError(tErrors(result.error as CommonActionError));
      }
    },
    [form, tErrors, translateSpecific],
  );

  return { formError, setFormError, apply };
}

/** Oversetter en valideringsnøkkel fra Zod eller serveren. */
export function useValidationMessage() {
  const t = useTranslations("validation");
  return useCallback((key: string | undefined) => (key ? t(key as ValidationKey) : undefined), [t]);
}
