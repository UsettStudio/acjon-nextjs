import { z } from "zod";

/** Feilmeldingene er nøkler under «validation» i messages/*.json. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { error: "required" })
  .pipe(z.email({ error: "email" }));

export const newPasswordSchema = z
  .string()
  .min(10, { error: "passwordMin" })
  .max(72, { error: "passwordMax" });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "required" }),
  next: z.string().optional(),
});
export type LoginInput = z.input<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, { error: "required" }).max(200, { error: "nameLength" }),
  email: emailSchema,
  password: newPasswordSchema,
  next: z.string().optional(),
});
export type SignupInput = z.input<typeof signupSchema>;

export const magicLinkSchema = z.object({
  email: emailSchema,
  next: z.string().optional(),
});
export type MagicLinkInput = z.input<typeof magicLinkSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;

export const newPasswordFormSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, { error: "required" }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    error: "passwordMismatch",
  });
export type NewPasswordInput = z.input<typeof newPasswordFormSchema>;
