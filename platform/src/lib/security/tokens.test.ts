import { describe, expect, it } from "vitest";

import { generateToken, sha256Hex } from "@/lib/security/tokens";

describe("tokens", () => {
  it("lager 256-bit URL-sikre tokener som er ulike hver gang", () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateToken()).not.toBe(token);
  });

  it("hasher med SHA-256 som databasen (encode(sha256(...), 'hex'))", () => {
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(sha256Hex("æøå")).toHaveLength(64);
  });
});
