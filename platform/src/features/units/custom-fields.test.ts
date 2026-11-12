import { describe, expect, it } from "vitest";

import { customFieldKeys, customFieldsSchema, customFieldsToInput, customFieldText, publicCustomFields } from "@/features/units/custom-fields";

describe("egne felt", () => {
  it("lagrer navn og verdi som objekt, uten tomme verdier", () => {
    const parsed = customFieldsSchema.safeParse([
      { key: " Takhøyde ", value: " 2,7 m " },
      { key: "Peis", value: "" },
    ]);
    expect(parsed.success && parsed.data).toEqual({ Takhøyde: "2,7 m" });
  });

  it("avviser samme navn to ganger, uansett store og små bokstaver", () => {
    const parsed = customFieldsSchema.safeParse([
      { key: "Peis", value: "Ja" },
      { key: "peis", value: "Nei" },
    ]);
    expect(parsed.success).toBe(false);
    expect(parsed.success ? null : parsed.error.issues[0]).toMatchObject({ path: [1, "key"], message: "customFieldDuplicate" });
  });

  it("viser tekst, tall og ja, men ikke lister og objekter", () => {
    expect(customFieldText(" Sør ")).toBe("Sør");
    expect(customFieldText(2.7)).toBe("2.7");
    expect(customFieldText(true)).toBe("✓");
    expect(customFieldText(false)).toBeNull();
    expect(customFieldText(["a"])).toBeNull();
    expect(customFieldsToInput({ Takhøyde: "2,7 m", Liste: [1], Antall: 3 })).toEqual([
      { key: "Takhøyde", value: "2,7 m" },
      { key: "Antall", value: "3" },
    ]);
  });

  it("samler feltnavn fra alle enhetene og sorterer offentlige felt", () => {
    expect(customFieldKeys([{ Peis: "Ja" }, { Takhøyde: "2,7 m", Peis: "Nei" }, null, []])).toEqual(["Peis", "Takhøyde"]);
    expect(publicCustomFields({ Takhøyde: "2,7 m", Balkong: "Sør" }).map((field) => field.label)).toEqual(["Balkong", "Takhøyde"]);
  });
});
