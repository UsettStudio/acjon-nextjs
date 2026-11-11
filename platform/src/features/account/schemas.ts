import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, { error: "required" }).max(200, { error: "nameLength" }),
  phone: z
    .string()
    .trim()
    .max(40, { error: "phone" })
    .refine((value) => value === "" || /^[+0-9 ()-]{5,40}$/.test(value), { error: "phone" }),
});
export type ProfileInput = z.input<typeof profileSchema>;
