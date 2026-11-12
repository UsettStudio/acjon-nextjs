import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as SyncModuleNamespace from "@/features/billing/sync";
import { ACTIVE_PHASES, PROJECT_LIMITS, isActivePhase, projectLimit } from "@/lib/billing/plans";

type SyncModule = typeof SyncModuleNamespace;

vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_enhetstest");
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_enhetstest");
vi.stubEnv("STRIPE_PRICE_START", "price_start");
vi.stubEnv("STRIPE_PRICE_GROWTH", "price_growth");
vi.stubEnv("STRIPE_PRICE_PRO", "price_pro");

const syncSubscription = vi.fn<(stripe: unknown, id: string) => Promise<string | null>>();
vi.mock("@/features/billing/sync", async (importOriginal) => {
  const original = await importOriginal<SyncModule>();
  return { ...original, syncSubscription: (stripe: unknown, id: string) => syncSubscription(stripe, id) };
});

const { planForPrice } = await import("@/features/billing/stripe");
const { subscriptionIdFromEvent } = await import("@/features/billing/sync");
const { POST } = await import("@/app/api/stripe/webhook/route");

const signer = new Stripe("sk_test_enhetstest");

function event(type: string, object: Record<string, unknown>): Stripe.Event {
  return { id: "evt_1", object: "event", type, data: { object } } as unknown as Stripe.Event;
}

function signedRequest(payload: unknown, secret = "whsec_enhetstest"): Request {
  const body = JSON.stringify(payload);
  const signature = signer.webhooks.generateTestHeaderString({ payload: body, secret });
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature, "content-type": "application/json" },
    body,
  });
}

describe("planer", () => {
  it("har de samme grensene som app.plan_project_limit()", () => {
    expect(PROJECT_LIMITS).toEqual({ trial: 3, start: 1, growth: 5, pro: 15, enterprise: null });
    expect(projectLimit("growth")).toBe(5);
    expect(projectLimit("ukjent")).toBe(1);
  });

  it("teller bare prosjekter i salg, kommende og utsolgte som aktive", () => {
    expect(ACTIVE_PHASES).toEqual(["coming_soon", "for_sale", "sold_out"]);
    expect(isActivePhase("for_sale")).toBe(true);
    expect(isActivePhase("draft")).toBe(false);
    expect(isActivePhase("completed")).toBe(false);
    expect(isActivePhase("archived")).toBe(false);
  });
});

describe("planForPrice", () => {
  it("finner planen fra prisene i miljøvariablene, og ellers fra metadata", () => {
    expect(planForPrice("price_start")).toBe("start");
    expect(planForPrice("price_pro")).toBe("pro");
    expect(planForPrice("price_annen", "enterprise")).toBe("enterprise");
    expect(planForPrice("price_annen", "growth")).toBe("growth");
    expect(planForPrice("price_annen", "trial")).toBeNull();
    expect(planForPrice("price_annen")).toBeNull();
  });
});

describe("subscriptionIdFromEvent", () => {
  it("finner abonnementet i Checkout, abonnements- og fakturahendelser", () => {
    expect(subscriptionIdFromEvent(event("checkout.session.completed", { mode: "subscription", subscription: "sub_1" }))).toBe("sub_1");
    expect(subscriptionIdFromEvent(event("checkout.session.completed", { mode: "payment", subscription: null }))).toBeNull();
    expect(subscriptionIdFromEvent(event("customer.subscription.deleted", { id: "sub_2" }))).toBe("sub_2");
    expect(
      subscriptionIdFromEvent(
        event("invoice.payment_failed", { parent: { subscription_details: { subscription: { id: "sub_3" } } } }),
      ),
    ).toBe("sub_3");
    expect(subscriptionIdFromEvent(event("invoice.paid", { parent: null }))).toBeNull();
    expect(subscriptionIdFromEvent(event("customer.created", { id: "cus_1" }))).toBeNull();
  });
});

describe("Stripe-webhooken", () => {
  beforeEach(() => {
    syncSubscription.mockReset();
  });

  it("avviser kall uten gyldig signatur", async () => {
    const unsigned = new Request("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" });
    expect((await POST(unsigned)).status).toBe(400);
    const wrongSecret = signedRequest(event("customer.subscription.updated", { id: "sub_1" }), "whsec_feil");
    expect((await POST(wrongSecret)).status).toBe(400);
    expect(syncSubscription).not.toHaveBeenCalled();
  });

  it("henter og lagrer abonnementet når hendelsen gjelder et abonnement", async () => {
    syncSubscription.mockResolvedValue("org-1");
    const response = await POST(signedRequest(event("customer.subscription.updated", { id: "sub_1" })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, organization: true });
    expect(syncSubscription).toHaveBeenCalledWith(expect.anything(), "sub_1");
  });

  it("svarer 200 på hendelser den ikke bruker, og 500 når lagringen feiler", async () => {
    expect((await POST(signedRequest(event("customer.created", { id: "cus_1" })))).status).toBe(200);
    expect(syncSubscription).not.toHaveBeenCalled();
    syncSubscription.mockRejectedValue(new Error("databasen er nede"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(signedRequest(event("customer.subscription.deleted", { id: "sub_9" })))).status).toBe(500);
  });
});
