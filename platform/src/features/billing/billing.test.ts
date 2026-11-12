import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as SyncModuleNamespace from "@/features/billing/sync";
import type * as LaunchCheckoutNamespace from "@/features/launch/checkout";
import { PLAN_LIMITS, cheapestPlanWith, planAllows, planLimits } from "@/lib/billing/plans";

type SyncModule = typeof SyncModuleNamespace;
type LaunchCheckoutModule = typeof LaunchCheckoutNamespace;

vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_enhetstest");
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_enhetstest");
vi.stubEnv("STRIPE_PRICE_START", "price_start");
vi.stubEnv("STRIPE_PRICE_PRO", "price_pro");
vi.stubEnv("STRIPE_PRICE_PARTNER", "price_partner");

const syncSubscription = vi.fn<(stripe: unknown, id: string) => Promise<string | null>>();
vi.mock("@/features/billing/sync", async (importOriginal) => {
  const original = await importOriginal<SyncModule>();
  return { ...original, syncSubscription: (stripe: unknown, id: string) => syncSubscription(stripe, id) };
});

const recordLaunchPayment = vi.fn<(session: Stripe.Checkout.Session) => Promise<string | null>>();
vi.mock("@/features/launch/checkout", async (importOriginal) => {
  const original = await importOriginal<LaunchCheckoutModule>();
  return { ...original, recordLaunchPayment: (session: Stripe.Checkout.Session) => recordLaunchPayment(session) };
});

const { planForPrice } = await import("@/features/billing/stripe");
const { subscriptionIdFromEvent } = await import("@/features/billing/sync");
const { launchSessionFromEvent } = await import("@/features/launch/checkout");
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

describe("pakker", () => {
  it("har de samme grensene som app.plan_member_limit(), app.plan_domain_limit() og app.plan_allows()", () => {
    expect(PLAN_LIMITS).toEqual({
      trial: { members: 10, domainsPerSite: 10, features: ["api", "webhooks", "embed"] },
      start: { members: 3, domainsPerSite: 1, features: [] },
      pro: { members: 10, domainsPerSite: 10, features: ["api", "webhooks", "embed"] },
      partner: { members: null, domainsPerSite: 10, features: ["api", "webhooks", "embed"] },
      enterprise: { members: null, domainsPerSite: 10, features: ["api", "webhooks", "embed"] },
    });
  });

  it("gir en ukjent pakke de strengeste grensene, som databasen", () => {
    expect(planLimits("growth")).toEqual(PLAN_LIMITS.start);
    expect(planAllows("ukjent", "api")).toBe(false);
    expect(planAllows("pro", "embed")).toBe(true);
    expect(planAllows("start", "webhooks")).toBe(false);
  });

  it("finner den minste pakken med en funksjon", () => {
    expect(cheapestPlanWith("api")).toBe("pro");
    expect(cheapestPlanWith("embed")).toBe("pro");
  });
});

describe("planForPrice", () => {
  it("finner planen fra prisene i miljøvariablene, og ellers fra metadata", () => {
    expect(planForPrice("price_start")).toBe("start");
    expect(planForPrice("price_pro")).toBe("pro");
    expect(planForPrice("price_partner")).toBe("partner");
    expect(planForPrice("price_annen", "enterprise")).toBe("enterprise");
    expect(planForPrice("price_annen", "partner")).toBe("partner");
    expect(planForPrice("price_annen", "growth")).toBeNull();
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

describe("launchSessionFromEvent", () => {
  const session = { id: "cs_1", mode: "payment", metadata: { kind: "project_launch", launch_id: "l1" } };

  it("finner Checkout-økter for oppstartsavgiften, også når betalingen bekreftes senere", () => {
    expect(launchSessionFromEvent(event("checkout.session.completed", session))?.id).toBe("cs_1");
    expect(launchSessionFromEvent(event("checkout.session.async_payment_succeeded", session))?.id).toBe("cs_1");
  });

  it("hopper over abonnementer, andre betalinger og andre hendelser", () => {
    expect(launchSessionFromEvent(event("checkout.session.completed", { ...session, mode: "subscription" }))).toBeNull();
    expect(launchSessionFromEvent(event("checkout.session.completed", { ...session, metadata: {} }))).toBeNull();
    expect(launchSessionFromEvent(event("checkout.session.expired", session))).toBeNull();
  });
});

describe("Stripe-webhooken", () => {
  beforeEach(() => {
    syncSubscription.mockReset();
    recordLaunchPayment.mockReset();
  });

  it("registrerer en betalt oppstartsavgift", async () => {
    recordLaunchPayment.mockResolvedValue("prosjekt-1");
    const session = { id: "cs_1", mode: "payment", payment_status: "paid", metadata: { kind: "project_launch", launch_id: "l1" } };
    const response = await POST(signedRequest(event("checkout.session.completed", session)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, launched: true });
    expect(recordLaunchPayment).toHaveBeenCalledWith(expect.objectContaining({ id: "cs_1" }));
    expect(syncSubscription).not.toHaveBeenCalled();
  });

  it("svarer 500 når oppstartsavgiften ikke kan registreres, så Stripe prøver igjen", async () => {
    recordLaunchPayment.mockRejectedValue(new Error("beløpet stemmer ikke"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const session = { id: "cs_2", mode: "payment", payment_status: "paid", metadata: { kind: "project_launch", launch_id: "l2" } };
    expect((await POST(signedRequest(event("checkout.session.completed", session)))).status).toBe(500);
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
