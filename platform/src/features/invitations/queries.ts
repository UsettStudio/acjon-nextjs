import "server-only";

import { cache } from "react";
import { z } from "zod";

import { MEMBER_ROLES } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

const invitationPreviewSchema = z.object({
  organization_name: z.string(),
  organization_slug: z.string(),
  email: z.string(),
  role: z.enum(MEMBER_ROLES),
  expires_at: z.string(),
  status: z.enum(["pending", "accepted", "revoked", "expired"]),
});

export type InvitationPreview = {
  organizationName: string;
  organizationSlug: string;
  email: string;
  role: (typeof MEMBER_ROLES)[number];
  expiresAt: string;
  status: "pending" | "accepted" | "revoked" | "expired";
};

/** Slår opp en invitasjon fra tokenet i lenken. Fungerer også uten innlogging. */
export const getInvitationPreview = cache(async (token: string): Promise<InvitationPreview | null> => {
  if (token.length === 0 || token.length > 200) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invitation", { p_token: token });
  if (error) {
    throw error;
  }
  const parsed = invitationPreviewSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }
  return {
    organizationName: parsed.data.organization_name,
    organizationSlug: parsed.data.organization_slug,
    email: parsed.data.email,
    role: parsed.data.role,
    expiresAt: parsed.data.expires_at,
    status: parsed.data.status,
  };
});
