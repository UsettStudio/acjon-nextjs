import "server-only";

import * as Sentry from "@sentry/nextjs";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";

import { can, type Capability, type MemberRole } from "@/lib/auth/permissions";
import { getCurrentUser, getMemberships, type CurrentUser, type OrganizationSummary } from "@/lib/auth/dal";
import { subscriptionAllowsWrites } from "@/lib/billing/subscription";
import { fail, type ActionResult, type CommonActionError, type ValidationKey } from "@/lib/actions/result";

/** Feil som stopper en serverhandling og blir til en feilkode i svaret. */
export class ActionError extends Error {
  constructor(public readonly code: CommonActionError) {
    super(code);
  }
}

/**
 * Kjører en serverhandling. Forventede feil blir feilkoder; uventede feil
 * logges til Sentry og blir «unknown». redirect() og notFound() slippes gjennom.
 */
export async function runAction<TData, TError extends string = never>(
  fn: () => Promise<ActionResult<TData, TError>>,
): Promise<ActionResult<TData, TError>> {
  try {
    return await fn();
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ActionError) {
      return fail(error.code);
    }
    console.error(error);
    Sentry.captureException(error);
    return fail("unknown");
  }
}

/** Validerer input med Zod. Feilmeldingene i skjemaene er nøkler under «validation». */
export function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): { success: true; data: z.output<TSchema> } | { success: false; fieldErrors: Record<string, ValidationKey> } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const fieldErrors: Record<string, ValidationKey> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join(".") || "_form";
    fieldErrors[field] ??= issue.message as ValidationKey;
  }
  return { success: false, fieldErrors };
}

export async function requireActionUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ActionError("unauthenticated");
  }
  return user;
}

/**
 * Sjekker at innlogget bruker har rettigheten i organisasjonen og at
 * organisasjonen ikke er i lesemodus. RLS i databasen sjekker det samme.
 */
export async function requireOrgCapability(
  organizationId: string,
  capability: Capability,
  options: { allowReadOnly?: boolean } = {},
): Promise<{ user: CurrentUser; role: MemberRole; organization: OrganizationSummary }> {
  const user = await requireActionUser();
  const membership = (await getMemberships()).find((m) => m.organization.id === organizationId);
  if (!membership || !can(membership.role, capability)) {
    throw new ActionError("forbidden");
  }
  const { subscriptionStatus, trialEndsAt } = membership.organization;
  if (!options.allowReadOnly && !subscriptionAllowsWrites(subscriptionStatus, trialEndsAt)) {
    throw new ActionError("readOnly");
  }
  return { user, role: membership.role, organization: membership.organization };
}

/** Postgres-feilkoder fra Supabase som har en egen betydning i appen. */
export function postgresErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return undefined;
}
