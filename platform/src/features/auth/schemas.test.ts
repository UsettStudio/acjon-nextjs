import { describe, expect, it } from "vitest";

import { loginSchema, newPasswordFormSchema, signupSchema } from "@/features/auth/schemas";

describe("innloggingsskjema", () => {
  it("normaliserer e-post", () => {
    expect(loginSchema.parse({ email: "  Kari@Example.NO ", password: "x" }).email).toBe("kari@example.no");
  });

  it("krever passord på minst 10 tegn ved registrering", () => {
    const result = signupSchema.safeParse({ fullName: "Kari", email: "kari@example.no", password: "kort" });
    expect(result.error?.issues[0]?.message).toBe("passwordMin");
  });

  it("krever like passord", () => {
    const result = newPasswordFormSchema.safeParse({ password: "langt-passord", confirmPassword: "annet-passord" });
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
    expect(result.error?.issues[0]?.message).toBe("passwordMismatch");
  });
});
