import { describe, expect, it } from "vitest";

import { createOrganizationSchema, updateOrganizationSchema } from "@/features/organizations/schemas";

describe("organisasjonsskjema", () => {
  it("gir valideringsnøkler som feilmeldinger", () => {
    const result = createOrganizationSchema.safeParse({ name: "", slug: "Ugyldig Adresse" });
    expect(result.success).toBe(false);
    const messages = Object.fromEntries((result.error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]));
    expect(messages).toEqual({ name: "required", slug: "slugFormat" });
  });

  it("avviser reserverte adresser", () => {
    const result = createOrganizationSchema.safeParse({ name: "Innlogging AS", slug: "login" });
    expect(result.error?.issues[0]?.message).toBe("slugReserved");
  });

  it("gjør tom lagringstid om til null og tall til tall", () => {
    expect(updateOrganizationSchema.parse({ name: "A", slug: "a", leadRetentionDays: "" }).leadRetentionDays).toBeNull();
    expect(updateOrganizationSchema.parse({ name: "A", slug: "a", leadRetentionDays: "365" }).leadRetentionDays).toBe(365);
  });

  it("krever lagringstid mellom 30 og 3650 dager", () => {
    for (const value of ["29", "3651", "abc", "-30"]) {
      const result = updateOrganizationSchema.safeParse({ name: "A", slug: "a", leadRetentionDays: value });
      expect(result.error?.issues[0]?.message).toBe("retentionRange");
    }
  });
});
