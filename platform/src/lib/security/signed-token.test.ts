import { describe, expect, it } from "vitest";

import { deriveKey, signToken, verifyToken } from "@/lib/security/signed-token";

const key = deriveKey("hemmelig-nokkel", "prosjektside-forhandsvisning");

describe("signerte tokener", () => {
  it("godtar et gyldig token og gir tilbake dataene", () => {
    const token = signToken({ site: "abc" }, key, new Date("2026-11-20T00:00:00Z"));
    expect(verifyToken(token, key, new Date("2026-11-19T00:00:00Z"))).toMatchObject({ site: "abc" });
  });

  it("avviser utløpte, endrede og feilsignerte tokener", () => {
    const token = signToken({ site: "abc" }, key, new Date("2026-11-20T00:00:00Z"));
    expect(verifyToken(token, key, new Date("2026-11-21T00:00:00Z"))).toBeNull();
    const [payload, signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ site: "annen", exp: 4102444800 })).toString("base64url");
    expect(verifyToken(`${forged}.${signature}`, key, new Date("2026-11-19T00:00:00Z"))).toBeNull();
    expect(verifyToken(`${payload}.feil`, key, new Date("2026-11-19T00:00:00Z"))).toBeNull();
    expect(verifyToken("tull", key)).toBeNull();
  });

  it("et token for ett formål gjelder ikke for et annet", () => {
    const token = signToken({ site: "abc" }, key, new Date("2099-01-01T00:00:00Z"));
    expect(verifyToken(token, deriveKey("hemmelig-nokkel", "annet-formal"))).toBeNull();
    expect(verifyToken(token, deriveKey("annen-hemmelighet", "prosjektside-forhandsvisning"))).toBeNull();
  });
});
