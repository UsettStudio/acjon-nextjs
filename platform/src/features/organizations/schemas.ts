import { z } from "zod";

import { ORG_SLUG_MAX_LENGTH, ORG_SLUG_PATTERN, RESERVED_ORG_SLUGS } from "@/features/organizations/slug";

export const organizationNameSchema = z
  .string()
  .trim()
  .min(1, { error: "required" })
  .max(200, { error: "nameLength" });

export const organizationSlugSchema = z
  .string()
  .trim()
  .min(1, { error: "required" })
  .max(ORG_SLUG_MAX_LENGTH, { error: "slugFormat" })
  .regex(ORG_SLUG_PATTERN, { error: "slugFormat" })
  .refine((value) => !RESERVED_ORG_SLUGS.has(value), { error: "slugReserved" });

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
});
export type CreateOrganizationInput = z.input<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
  // Tomt felt betyr at leads beholdes til de slettes manuelt.
  leadRetentionDays: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 30 && Number(value) <= 3650), {
      error: "retentionRange",
    })
    .transform((value) => (value === "" ? null : Number(value))),
});
export type UpdateOrganizationInput = z.input<typeof updateOrganizationSchema>;
