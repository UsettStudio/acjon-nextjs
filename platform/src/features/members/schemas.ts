import { z } from "zod";

import { MEMBER_ROLES } from "@/lib/auth/permissions";
import { emailSchema } from "@/features/auth/schemas";

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(MEMBER_ROLES, { error: "role" }),
  projectIds: z.array(z.uuid()).max(500),
});
export type InviteMemberInput = z.input<typeof inviteMemberSchema>;

export const changeRoleSchema = z.object({
  membershipId: z.uuid(),
  role: z.enum(MEMBER_ROLES, { error: "role" }),
});

export const projectAccessSchema = z.object({
  userId: z.uuid(),
  projectIds: z.array(z.uuid()).max(500),
});
