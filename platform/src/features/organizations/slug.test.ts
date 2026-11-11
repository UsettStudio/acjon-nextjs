import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { isValidOrgSlug, RESERVED_ORG_SLUGS, slugify } from "@/features/organizations/slug";

describe("slugify", () => {
  it.each([
    ["Fjordbygg AS", "fjordbygg-as"],
    ["Bjørnstad Bolig Øst", "bjornstad-bolig-ost"],
    ["Ærlig & Åpen Eiendom", "aerlig-apen-eiendom"],
    ["  --A-302--  ", "a-302"],
    ["Café Søndre", "cafe-sondre"],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("kutter til høyst 63 tegn uten bindestrek til slutt", () => {
    const slug = slugify(`${"a".repeat(62)} b`);
    expect(slug.length).toBeLessThanOrEqual(63);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("gyldige adresser", () => {
  it("godtar små bokstaver, tall og enkle bindestreker", () => {
    expect(isValidOrgSlug("fjordbygg-as")).toBe(true);
    expect(isValidOrgSlug("Fjordbygg")).toBe(false);
    expect(isValidOrgSlug("fjord--bygg")).toBe(false);
    expect(isValidOrgSlug("-fjord")).toBe(false);
    expect(isValidOrgSlug("settings")).toBe(false);
  });

  it("har samme reserverte ord som app.is_reserved_org_slug() i databasen", () => {
    const sql = readFileSync(
      path.resolve(__dirname, "../../../supabase/migrations/20261112090000_fase0_invitasjoner_og_profiler.sql"),
      "utf8",
    );
    const match = /create function app\.is_reserved_org_slug[\s\S]*?array\[([\s\S]*?)\]/.exec(sql);
    const fromSql = (match?.[1] ?? "").split(",").map((word) => word.trim().replaceAll("'", "")).filter(Boolean);
    expect([...RESERVED_ORG_SLUGS].sort()).toEqual(fromSql.sort());
  });

  it("dekker alle faste adresser i appen", () => {
    for (const route of ["login", "signup", "forgot-password", "reset-password", "auth", "invite", "onboarding", "account", "platform"]) {
      expect(RESERVED_ORG_SLUGS.has(route)).toBe(true);
    }
  });
});
