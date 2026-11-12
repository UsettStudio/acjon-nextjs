import { describe, expect, it, vi } from "vitest";

import { BlockedAddressError, isPrivateAddress } from "@/features/integrations/network";
import { apiKeySchema, webhookSchema } from "@/features/integrations/schemas";
import { buildDeliveryRequest, deliverWebhook, httpsTransport, signWebhook, type ClaimedDelivery } from "@/features/integrations/webhook-sender";
import { keyHashFrom, timestampParam } from "@/lib/api/keyed";

vi.mock("next/server", () => ({ after: vi.fn() }));

const delivery: ClaimedDelivery = {
  delivery_id: "8f2c1d3e-0000-4000-8000-000000000001",
  webhook_id: "8f2c1d3e-0000-4000-8000-000000000002",
  url: "https://hooks.example.no/boliger",
  secret: "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw",
  event: "unit.status_changed",
  payload: { id: "evt-1", type: "unit.status_changed", data: { unit_number: "A-302", to_status: "sold" } },
  attempt: 1,
};

describe("SSRF-vern", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.10",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::",
    "fe80::1",
    "fc00::1",
    "fd12:3456::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "64:ff9b::a9fe:a9fe",
    "2001:db8::1",
    "ikke-en-ip",
  ])("avviser %s", (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each(["93.184.216.34", "172.32.0.1", "8.8.8.8", "2606:4700:4700::1111", "::ffff:8.8.8.8"])("godtar offentlige %s", (address) => {
    expect(isPrivateAddress(address)).toBe(false);
  });

  it("sender aldri til en privat IP-adresse eller uten https", async () => {
    await expect(httpsTransport({ url: "https://169.254.169.254/latest/meta-data", headers: {}, body: "{}" })).rejects.toBeInstanceOf(
      BlockedAddressError,
    );
    await expect(httpsTransport({ url: "https://[::1]:8443/", headers: {}, body: "{}" })).rejects.toBeInstanceOf(BlockedAddressError);
    await expect(httpsTransport({ url: "http://hooks.example.no/", headers: {}, body: "{}" })).rejects.toThrow("https");
  });
});

describe("signatur (Standard Webhooks)", () => {
  it("gir samme signatur som eksempelet i spesifikasjonen", () => {
    expect(signWebhook("whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw", "msg_p5jXN8AQM9LWM0D4loKWxJek", 1614265330, '{"test": 2432232314}')).toBe(
      "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=",
    );
  });

  it("setter headerne og signerer innholdet slik det sendes", () => {
    const request = buildDeliveryRequest(delivery, new Date("2026-11-13T10:00:00Z"));
    expect(request.headers["webhook-id"]).toBe("msg_evt-1");
    expect(request.headers["webhook-timestamp"]).toBe("1794564000");
    expect(request.headers["content-type"]).toBe("application/json");
    expect(request.headers["webhook-signature"]).toBe(signWebhook(delivery.secret, "msg_evt-1", 1794564000, request.body));
    expect(JSON.parse(request.body)).toEqual(delivery.payload);
  });
});

describe("levering", () => {
  it("regner bare 2xx som levert", async () => {
    await expect(deliverWebhook(delivery, async () => ({ status: 204 }))).resolves.toEqual({ succeeded: true, status: 204, error: null });
    await expect(deliverWebhook(delivery, async () => ({ status: 301 }))).resolves.toMatchObject({ succeeded: false, status: 301 });
    await expect(deliverWebhook(delivery, async () => ({ status: 500 }))).resolves.toEqual({
      succeeded: false,
      status: 500,
      error: "Mottakeren svarte 500",
    });
  });

  it("gir en forståelig feil ved private adresser og nettverksfeil", async () => {
    const blocked = await deliverWebhook(delivery, async () => {
      throw new BlockedAddressError("10.0.0.1");
    });
    expect(blocked).toEqual({ succeeded: false, status: null, error: "Adressen peker til et privat nettverk og kan ikke brukes." });
    const down = await deliverWebhook(delivery, async () => {
      throw new Error("connect ECONNREFUSED");
    });
    expect(down).toEqual({ succeeded: false, status: null, error: "connect ECONNREFUSED" });
  });
});

describe("API med nøkkel", () => {
  const request = (headers: Record<string, string>) => new Request("http://localhost/api/v1/projects", { headers });

  it("leser nøkkelen fra Authorization eller X-Api-Key og sender bare hashen videre", () => {
    const key = `bpk_${"a".repeat(43)}`;
    const hash = keyHashFrom(request({ authorization: `Bearer ${key}` }));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(keyHashFrom(request({ "x-api-key": key }))).toBe(hash);
    expect(keyHashFrom(request({ authorization: "Bearer feil" }))).toBeNull();
    expect(keyHashFrom(request({}))).toBeNull();
  });

  it("tolker tidspunkter i spørringen", () => {
    expect(timestampParam(null)).toBeNull();
    expect(timestampParam("2026-11-13T10:00:00+01:00")).toBe("2026-11-13T09:00:00.000Z");
    expect(timestampParam("i går")).toBeUndefined();
  });
});

describe("skjemaene i admin", () => {
  it("krever https og minst én hendelse for webhooks", () => {
    const valid = { url: "https://hooks.example.no/x", description: "", events: ["lead.created"], projectIds: [], isActive: true };
    expect(webhookSchema.safeParse(valid).success).toBe(true);
    expect(webhookSchema.safeParse({ ...valid, url: "http://hooks.example.no/x" }).success).toBe(false);
    expect(webhookSchema.safeParse({ ...valid, url: "https://bruker:passord@hooks.example.no/x" }).success).toBe(false);
    expect(webhookSchema.safeParse({ ...valid, events: [] }).success).toBe(false);
    expect(webhookSchema.safeParse({ ...valid, events: ["unit.deleted"] }).success).toBe(false);
  });

  it("krever navn og minst én tilgang for API-nøkler", () => {
    expect(apiKeySchema.safeParse({ name: "Meglersystem", scopes: ["units:read"], expiresInDays: 90 }).success).toBe(true);
    expect(apiKeySchema.safeParse({ name: "", scopes: ["units:read"], expiresInDays: null }).success).toBe(false);
    expect(apiKeySchema.safeParse({ name: "X", scopes: [], expiresInDays: null }).success).toBe(false);
    expect(apiKeySchema.safeParse({ name: "X", scopes: ["admin"], expiresInDays: null }).success).toBe(false);
    expect(apiKeySchema.safeParse({ name: "X", scopes: ["units:read"], expiresInDays: 7 }).success).toBe(false);
  });
});
