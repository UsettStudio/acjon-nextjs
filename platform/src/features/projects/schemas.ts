import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";

export type ProjectPhase = Database["public"]["Enums"]["project_phase"];

export const PROJECT_PHASES = [
  "draft",
  "coming_soon",
  "for_sale",
  "sold_out",
  "completed",
  "archived",
] as const satisfies readonly ProjectPhase[];

export const MILESTONE_KEYS = ["planning", "sales_start", "construction_start", "move_in", "custom"] as const;
export type MilestoneKey = (typeof MILESTONE_KEYS)[number];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: "textTooLong" })
    .transform((value) => value || null);

export const projectNameSchema = z.string().trim().min(1, { error: "required" }).max(200, { error: "nameLength" });

/** Fremdrift: «Innflytting – Høsten 2027». Tekst eller dato (eller begge). */
export const milestoneSchema = z
  .object({
    key: z.enum(MILESTONE_KEYS, { error: "optionInvalid" }),
    label: optionalText(100),
    text: optionalText(100),
    date: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), { error: "dateInvalid" })
      .transform((value) => value || null),
  })
  .superRefine((milestone, ctx) => {
    if (milestone.key === "custom" && !milestone.label) {
      ctx.addIssue({ code: "custom", path: ["label"], message: "required" });
    }
  });

export type MilestoneInput = z.input<typeof milestoneSchema>;
export type Milestone = z.output<typeof milestoneSchema>;

/** Milepæler uten tekst og dato tas ikke med. */
export const milestonesSchema = z
  .array(milestoneSchema)
  .max(20)
  .transform((items) => items.filter((item) => item.text || item.date));

export const contactSchema = z.object({
  name: z.string().trim().min(1, { error: "required" }).max(200, { error: "nameLength" }),
  title: optionalText(200),
  email: z
    .string()
    .trim()
    .max(320, { error: "email" })
    .refine((value) => value === "" || z.email().safeParse(value).success, { error: "email" })
    .transform((value) => value.toLowerCase() || null),
  phone: z
    .string()
    .trim()
    .max(30, { error: "phone" })
    .refine((value) => value === "" || /^\+?[0-9 ()-]{5,}$/.test(value), { error: "phone" })
    .transform((value) => value || null),
  user_id: z
    .string()
    .trim()
    .refine((value) => value === "" || z.uuid().safeParse(value).success)
    .transform((value) => value || null),
  receives_leads: z.boolean(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type Contact = z.output<typeof contactSchema>;

export const contactsSchema = z.array(contactSchema).max(20);

const coordinate = (min: number, max: number) =>
  z
    .union([z.number(), z.null()])
    .refine((value) => value === null || (Number.isFinite(value) && value >= min && value <= max), {
      error: "coordinateInvalid",
    });

export const locationSchema = z
  .object({
    address: optionalText(300),
    postal_code: z
      .string()
      .trim()
      .refine((value) => value === "" || /^\d{4}$/.test(value), { error: "postalCode" })
      .transform((value) => value || null),
    city: optionalText(100),
    municipality: optionalText(100),
    lat: coordinate(-90, 90),
    lng: coordinate(-180, 180),
  })
  .superRefine((location, ctx) => {
    if ((location.lat === null) !== (location.lng === null)) {
      ctx.addIssue({ code: "custom", path: ["lat"], message: "coordinateInvalid" });
    }
  });

export type LocationInput = z.input<typeof locationSchema>;

export const projectDetailsSchema = z.object({
  name: projectNameSchema,
  phase: z.enum(PROJECT_PHASES, { error: "optionInvalid" }),
  description: optionalText(20_000),
});

const structureName = z.string().trim().min(1, { error: "required" }).max(200, { error: "nameLength" });

/** Byggetrinn og bygg i veiviseren. Bygg kan høre til et byggetrinn eller stå alene. */
export const structureSchema = z.object({
  stages: z
    .array(z.object({ name: structureName, buildings: z.array(z.object({ name: structureName })).max(100) }))
    .max(50),
  buildings: z.array(z.object({ name: structureName })).max(100),
});

export type StructureInput = z.input<typeof structureSchema>;

export const createProjectSchema = z.object({
  details: projectDetailsSchema,
  location: locationSchema,
  milestones: milestonesSchema,
  contacts: contactsSchema,
  structure: structureSchema,
});

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type CreateProjectOutput = z.output<typeof createProjectSchema>;

/** Prosjektets adresse i admin: små bokstaver, tall og bindestrek. */
export const projectSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "projectSlugFormat" })
  .max(80, { error: "projectSlugFormat" });

export const updateProjectDetailsSchema = projectDetailsSchema.extend({ slug: projectSlugSchema });

export const stageSchema = z.object({
  name: structureName,
  phase: z.enum(PROJECT_PHASES, { error: "optionInvalid" }),
});

export const buildingSchema = z.object({
  name: structureName,
  stage_id: z
    .string()
    .trim()
    .refine((value) => value === "" || z.uuid().safeParse(value).success)
    .transform((value) => value || null),
});

export const DEFAULT_MILESTONES: MilestoneInput[] = [
  { key: "sales_start", label: "", text: "", date: "" },
  { key: "construction_start", label: "", text: "", date: "" },
  { key: "move_in", label: "", text: "", date: "" },
];
