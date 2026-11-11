import type messages from "../../../messages/nb.json";

export type ValidationKey = keyof (typeof messages)["validation"];
export type CommonActionError = keyof (typeof messages)["errors"];

/**
 * Svar fra en serverhandling. Feilkoder oversettes i grensesnittet:
 * felles koder under «errors», feltfeil under «validation».
 */
export type ActionResult<TData = undefined, TError extends string = never> =
  | { ok: true; data: TData }
  | { ok: false; error: CommonActionError | TError; fieldErrors?: Record<string, ValidationKey> };

export function ok(): { ok: true; data: undefined };
export function ok<TData>(data: TData): { ok: true; data: TData };
export function ok<TData>(data?: TData) {
  return { ok: true as const, data };
}

export function fail<TError extends string>(
  error: TError,
  fieldErrors?: Record<string, ValidationKey>,
): { ok: false; error: TError; fieldErrors?: Record<string, ValidationKey> } {
  return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error };
}
