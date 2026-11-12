import "server-only";

import { cache } from "react";
import { notFound, redirect } from "next/navigation";

import { isMemberRole, type MemberRole } from "@/lib/auth/permissions";
import { subscriptionAllowsWrites, type SubscriptionStatus } from "@/lib/billing/subscription";
import { createClient } from "@/lib/supabase/server";

/**
 * Datatilgangslaget (DAL). All lesing av sesjon og tilgang går gjennom disse
 * funksjonene, som dedupliseres per forespørsel med React cache().
 */

export type CurrentUser = {
  id: string;
  email: string | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) {
    return null;
  }
  const { sub, email } = data.claims;
  if (typeof sub !== "string") {
    return null;
  }
  return { id: sub, email: typeof email === "string" ? email : null };
});

export async function requireUser(nextPath?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }
  return user;
}

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  /** Organisasjonen har et abonnement i Stripe (ikke bare prøveperioden). */
  hasSubscription: boolean;
};

export type Membership = {
  role: MemberRole;
  organization: OrganizationSummary;
};

export const getMemberships = cache(async (): Promise<Membership[]> => {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("role, organization:organizations(id, name, slug, subscription_status, trial_ends_at, stripe_subscription_id)")
    .eq("user_id", user.id)
    .order("created_at");
  if (error) {
    throw error;
  }
  return data.flatMap((row) => {
    if (!isMemberRole(row.role) || !row.organization) {
      return [];
    }
    return [
      {
        role: row.role,
        organization: {
          id: row.organization.id,
          name: row.organization.name,
          slug: row.organization.slug,
          subscriptionStatus: row.organization.subscription_status,
          trialEndsAt: row.organization.trial_ends_at,
          hasSubscription: row.organization.stripe_subscription_id !== null,
        },
      },
    ];
  });
});

export type OrgContext = {
  user: CurrentUser;
  role: MemberRole;
  organization: OrganizationSummary;
  /** false betyr lesemodus (utløpt abonnement). */
  writable: boolean;
};

/** Organisasjonen i adressen /{slug}/… Gir 404 hvis brukeren ikke er medlem. */
export const getOrgContext = cache(async (orgSlug: string): Promise<OrgContext> => {
  const user = await requireUser(`/${orgSlug}`);
  const membership = (await getMemberships()).find((m) => m.organization.slug === orgSlug);
  if (!membership) {
    notFound();
  }
  return {
    user,
    role: membership.role,
    organization: membership.organization,
    writable: subscriptionAllowsWrites(membership.organization.subscriptionStatus, membership.organization.trialEndsAt),
  };
});

export const isPlatformAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("platform_admins").select("id").eq("user_id", user.id).maybeSingle();
  return data !== null;
});

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
};

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, email, full_name, phone").eq("id", user.id).maybeSingle();
  return data ? { id: data.id, email: data.email, fullName: data.full_name, phone: data.phone } : null;
});
