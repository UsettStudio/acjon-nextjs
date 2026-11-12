// Etterligning av eksterne tjenester for ende-til-ende-testene. Startes av
// Playwright (playwright.config.ts) på FAKE_SERVICES_PORT.
//
//   /dns-query        DNS over HTTPS (JSON-formatet til Cloudflare). Postene settes
//                     av testene med POST /_control/dns.
//   /v1/...           Den delen av Stripe sitt API appen bruker: kunder, Checkout,
//                     abonnementer, kundeportal og priser.
//   /checkout/{id}    En enkel betalingsside. «Betal» lager abonnementet, sender
//                     en signert webhook til appen slik Stripe gjør, og sender
//                     nettleseren tilbake til appen.
//
// Bare for tester. Ingen data lagres utenfor minnet.
import { createHmac, randomUUID } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.env.FAKE_SERVICES_PORT ?? 12111);
const appUrl = process.env.FAKE_APP_URL ?? "http://localhost:3000";
const webhookSecret = process.env.FAKE_STRIPE_WEBHOOK_SECRET ?? "";
const base = `http://127.0.0.1:${port}`;

const TYPE_CODES = { A: 1, CNAME: 5, TXT: 16, AAAA: 28 };
const dns = new Map();
const customers = new Map();
const sessions = new Map();
const subscriptions = new Map();
const PRICES = {
  price_e2e_start: { amount: 49000, plan: "start" },
  price_e2e_growth: { amount: 149000, plan: "growth" },
  price_e2e_pro: { amount: 390000, plan: "pro" },
};

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function html(response, body) {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(`<!doctype html><html lang="nb"><meta charset="utf-8"><title>Stripe (test)</title><body>${body}</body></html>`);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function priceObject(id) {
  const price = PRICES[id];
  return price
    ? { id, object: "price", unit_amount: price.amount, currency: "nok", recurring: { interval: "month" }, metadata: {} }
    : null;
}

function subscriptionObject(subscription) {
  return {
    id: subscription.id,
    object: "subscription",
    customer: subscription.customer,
    status: subscription.status,
    cancel_at_period_end: subscription.cancelAtPeriodEnd,
    trial_end: subscription.trialEnd,
    items: {
      object: "list",
      data: [
        {
          id: `si_${subscription.id}`,
          object: "subscription_item",
          price: priceObject(subscription.price),
          current_period_end: subscription.periodEnd,
        },
      ],
    },
  };
}

/** Sender en hendelse til appen med Stripe-signatur (t=…,v1=HMAC-SHA256 av «t.innhold»). */
async function sendWebhook(type, object) {
  const payload = JSON.stringify({ id: `evt_${randomUUID().replaceAll("-", "")}`, object: "event", type, created: Math.floor(Date.now() / 1000), data: { object } });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", webhookSecret).update(`${timestamp}.${payload}`).digest("hex");
  const response = await fetch(`${appUrl}/api/stripe/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": `t=${timestamp},v1=${signature}` },
    body: payload,
  });
  if (!response.ok) {
    throw new Error(`Appen svarte ${response.status} på ${type}`);
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", base);
  const path = url.pathname;
  try {
    if (path === "/health") {
      return json(response, 200, { ok: true });
    }

    // DNS over HTTPS
    if (path === "/dns-query") {
      const name = (url.searchParams.get("name") ?? "").toLowerCase().replace(/\.$/, "");
      const type = url.searchParams.get("type") ?? "A";
      const values = dns.get(`${type}:${name}`) ?? [];
      if (values.length === 0) {
        return json(response, 200, { Status: 3 });
      }
      return json(response, 200, {
        Status: 0,
        Answer: values.map((value) => ({ name: `${name}.`, type: TYPE_CODES[type], TTL: 60, data: type === "TXT" ? `"${value}"` : `${value}.` })),
      });
    }
    if (path === "/_control/dns" && request.method === "POST") {
      const { name, type, values } = JSON.parse(await readBody(request));
      dns.set(`${type}:${String(name).toLowerCase()}`, values);
      return json(response, 200, { ok: true });
    }

    // Stripe-API
    if (path.startsWith("/v1/")) {
      const form = request.method === "POST" ? new URLSearchParams(await readBody(request)) : new URLSearchParams();
      if (path === "/v1/customers" && request.method === "POST") {
        const id = `cus_e2e${randomUUID().replaceAll("-", "").slice(0, 16)}`;
        customers.set(id, { id, email: form.get("email") });
        return json(response, 200, { id, object: "customer", email: form.get("email"), name: form.get("name") });
      }
      if (path === "/v1/checkout/sessions" && request.method === "POST") {
        const id = `cs_e2e${randomUUID().replaceAll("-", "").slice(0, 16)}`;
        const trialEnd = form.get("subscription_data[trial_end]");
        sessions.set(id, {
          id,
          customer: form.get("customer"),
          price: form.get("line_items[0][price]"),
          successUrl: form.get("success_url"),
          cancelUrl: form.get("cancel_url"),
          clientReferenceId: form.get("client_reference_id"),
          trialEnd: trialEnd ? Number(trialEnd) : null,
        });
        return json(response, 200, { id, object: "checkout.session", mode: "subscription", url: `${base}/checkout/${id}` });
      }
      const subscriptionMatch = /^\/v1\/subscriptions\/([^/]+)$/.exec(path);
      if (subscriptionMatch && request.method === "GET") {
        const subscription = subscriptions.get(subscriptionMatch[1]);
        return subscription
          ? json(response, 200, subscriptionObject(subscription))
          : json(response, 404, { error: { type: "invalid_request_error", message: "No such subscription" } });
      }
      if (path === "/v1/billing_portal/sessions" && request.method === "POST") {
        const returnUrl = form.get("return_url") ?? appUrl;
        return json(response, 200, { id: `bps_${randomUUID()}`, object: "billing_portal.session", url: `${base}/portal?return=${encodeURIComponent(returnUrl)}` });
      }
      const priceMatch = /^\/v1\/prices\/([^/]+)$/.exec(path);
      if (priceMatch) {
        const price = priceObject(priceMatch[1]);
        return price ? json(response, 200, price) : json(response, 404, { error: { type: "invalid_request_error", message: "No such price" } });
      }
      return json(response, 404, { error: { type: "invalid_request_error", message: `Ukjent i etterligningen: ${request.method} ${path}` } });
    }

    // Betalingssiden
    const checkoutMatch = /^\/checkout\/([^/]+)(\/pay)?$/.exec(path);
    if (checkoutMatch) {
      const session = sessions.get(checkoutMatch[1]);
      if (!session) {
        return json(response, 404, { error: "Ukjent økt" });
      }
      if (!checkoutMatch[2]) {
        const plan = PRICES[session.price]?.plan ?? "ukjent";
        return html(
          response,
          `<h1>Betaling (test)</h1><p>Plan: ${plan}</p><form method="post" action="/checkout/${session.id}/pay"><button>Betal</button></form><a href="${session.cancelUrl}">Avbryt</a>`,
        );
      }
      const id = `sub_e2e${randomUUID().replaceAll("-", "").slice(0, 16)}`;
      const now = Math.floor(Date.now() / 1000);
      subscriptions.set(id, {
        id,
        customer: session.customer,
        price: session.price,
        status: session.trialEnd ? "trialing" : "active",
        trialEnd: session.trialEnd,
        cancelAtPeriodEnd: false,
        periodEnd: session.trialEnd ?? now + 30 * 86400,
      });
      await sendWebhook("checkout.session.completed", {
        id: session.id,
        object: "checkout.session",
        mode: "subscription",
        customer: session.customer,
        subscription: id,
        client_reference_id: session.clientReferenceId,
      });
      response.writeHead(303, { location: session.successUrl });
      return response.end();
    }
    if (path === "/portal") {
      return html(response, `<h1>Kundeportal (test)</h1><a href="${url.searchParams.get("return") ?? appUrl}">Tilbake</a>`);
    }
    return json(response, 404, { error: "Ukjent adresse" });
  } catch (error) {
    console.error(error);
    return json(response, 500, { error: String(error) });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.info(`Etterligning av Stripe og DNS på ${base}`);
});
