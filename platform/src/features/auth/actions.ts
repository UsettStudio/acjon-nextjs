"use server";

import { redirect } from "next/navigation";

import { appUrl } from "@/lib/env";
import { fail, ok, type ActionResult } from "@/lib/actions/result";
import { parseInput, runAction } from "@/lib/actions/server";
import { recordLogin } from "@/lib/auth/record-login";
import { safeNextPath } from "@/lib/navigation/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  magicLinkSchema,
  newPasswordFormSchema,
  signupSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type MagicLinkInput,
  type NewPasswordInput,
  type SignupInput,
} from "@/features/auth/schemas";

function confirmUrl(next: string): string {
  return appUrl(`/auth/confirm?next=${encodeURIComponent(next)}`);
}

export async function signIn(
  input: LoginInput,
): Promise<ActionResult<undefined, "invalidCredentials" | "emailNotConfirmed">> {
  return runAction(async () => {
    const parsed = parseInput(loginSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) {
      switch (error.code) {
        case "invalid_credentials":
          return fail("invalidCredentials");
        case "email_not_confirmed":
          return fail("emailNotConfirmed");
        case "over_request_rate_limit":
          return fail("rateLimited");
        default:
          throw error;
      }
    }
    await recordLogin(supabase);
    redirect(safeNextPath(parsed.data.next));
  });
}

export async function signUp(
  input: SignupInput,
): Promise<ActionResult<{ email: string }, "alreadyRegistered">> {
  return runAction(async () => {
    const parsed = parseInput(signupSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const next = safeNextPath(parsed.data.next);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: confirmUrl(next),
        data: { full_name: parsed.data.fullName },
      },
    });
    if (error) {
      switch (error.code) {
        case "user_already_exists":
        case "email_exists":
          return fail("alreadyRegistered");
        case "weak_password":
          return fail("invalidInput", { password: "passwordMin" });
        case "email_address_invalid":
          return fail("invalidInput", { email: "email" });
        case "over_request_rate_limit":
        case "over_email_send_rate_limit":
          return fail("rateLimited");
        default:
          throw error;
      }
    }
    // Uten krav om e-postbekreftelse (lokal utvikling) er brukeren logget inn med en gang.
    if (data.session) {
      await recordLogin(supabase);
      redirect(next);
    }
    return ok({ email: parsed.data.email });
  });
}

/** Sender innloggingslenke. Svarer likt uansett om kontoen finnes, så e-postadresser ikke kan kartlegges. */
export async function sendMagicLink(input: MagicLinkInput): Promise<ActionResult<{ email: string }>> {
  return runAction(async () => {
    const parsed = parseInput(magicLinkSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: confirmUrl(safeNextPath(parsed.data.next)), shouldCreateUser: false },
    });
    if (error && (error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit")) {
      return fail("rateLimited");
    }
    if (error && error.code !== "otp_disabled" && error.code !== "user_not_found") {
      throw error;
    }
    return ok({ email: parsed.data.email });
  });
}

/** Sender lenke for nytt passord. Svarer likt uansett om kontoen finnes. */
export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ActionResult<{ email: string }>> {
  return runAction(async () => {
    const parsed = parseInput(forgotPasswordSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: confirmUrl("/reset-password"),
    });
    if (error && (error.code === "over_request_rate_limit" || error.code === "over_email_send_rate_limit")) {
      return fail("rateLimited");
    }
    if (error && error.code !== "user_not_found") {
      throw error;
    }
    return ok({ email: parsed.data.email });
  });
}

/** Lagrer nytt passord for innlogget bruker (etter lenke for glemt passord, eller fra profilen). */
export async function updatePassword(
  input: NewPasswordInput,
  options: { redirectTo?: string } = {},
): Promise<ActionResult> {
  return runAction(async () => {
    const parsed = parseInput(newPasswordFormSchema, input);
    if (!parsed.success) {
      return fail("invalidInput", parsed.fieldErrors);
    }
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims) {
      return fail("unauthenticated");
    }
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      switch (error.code) {
        case "weak_password":
        case "same_password":
          return fail("invalidInput", { password: "passwordMin" });
        case "reauthentication_needed":
          return fail("unauthenticated");
        default:
          throw error;
      }
    }
    if (options.redirectTo) {
      redirect(safeNextPath(options.redirectTo));
    }
    return ok();
  });
}

/** Logger ut. Et skjult felt «next» sender brukeren tilbake dit etter ny innlogging. */
export async function signOut(formData?: FormData): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const next = formData?.get("next");
  redirect(typeof next === "string" && next ? `/login?next=${encodeURIComponent(safeNextPath(next))}` : "/login");
}
