import { expect, test, type Page } from "@playwright/test";

import { anonymousPage, buildSelector, setUpProject } from "./boligvelger";
import { createOrganization, emailTo, field, signUp, uniqueId } from "./helpers";
import { createAndPublishSite, port, publish, siteAddress } from "./site";
import { organizationId, serviceClient } from "./support/db";
import { E2E_SERVICES, setDnsRecord } from "./support/services";

/** Legger en Boligvelger-blokk på siden. Blokken får prosjektets første boligvelger. */
async function addSelectorBlock(page: Page) {
  await page.getByRole("button", { name: "Legg til blokk" }).click();
  await page.getByRole("dialog", { name: "Legg til blokk" }).getByRole("button", { name: /^Boligvelger/ }).click();
  await expect(page.getByRole("combobox", { name: "Boligvelger", exact: true })).not.toHaveText("Ingen boligvelger valgt");
}

/** Legger til et eget domene, setter DNS-postene og bekrefter det. */
async function addVerifiedDomain(page: Page, orgSlug: string, hostname: string) {
  await page.goto(`/${orgSlug}/settings/domains`);
  await page.getByRole("button", { name: "Legg til domene" }).click();
  const dialog = page.getByRole("dialog", { name: "Legg til domene" });
  await dialog.getByLabel("Domene", { exact: true }).fill(hostname);
  await dialog.getByRole("button", { name: "Legg til", exact: true }).click();
  await expect(page.getByText("Domenet er lagt til. Legg inn DNS-postene som vises under domenet.")).toBeVisible();

  const card = page.locator(`[data-domain="${hostname}"]`);
  await expect(card.getByText("Venter på DNS")).toBeVisible();
  const txtRow = card.getByRole("row").filter({ hasText: `_boligplattform.${hostname}` });
  const token = (await txtRow.locator("code").nth(1).textContent())?.trim() ?? "";
  expect(token).toMatch(/^[0-9a-f]{32}$/);
  await expect(card.getByRole("row").filter({ hasText: "CNAME" })).toContainText("cname.vercel-dns.com");

  await setDnsRecord(`_boligplattform.${hostname}`, "TXT", [token]);
  await setDnsRecord(hostname, "CNAME", ["cname.vercel-dns.com"]);
  await card.getByRole("button", { name: "Sjekk nå" }).click();
  await expect(card.getByText("Bekreftet", { exact: true })).toBeVisible();
  await expect(card.getByText("Primærdomene", { exact: true })).toBeVisible();
}

test("akseptkriterium 4: Boligvelger-blokk på prosjektsiden vises på eget domene, og velgeren kan bygges inn", async ({ page, browser }) => {
  test.setTimeout(300_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);
  const selectorId = await buildSelector(page, orgSlug);
  const subdomain = `ac4-${id}`;
  const hostname = `www.solsiden-${id}.${E2E_SERVICES.customDomainSuffix}`;

  // Prosjektside fra «Kommer for salg», med Boligvelger-blokken lagt til
  await createAndPublishSite(page, orgSlug, /^Kommer for salg/, subdomain);
  await addSelectorBlock(page);
  await publish(page);

  // Eget domene: DNS-veiledning, TXT-bekreftelse og primærdomene
  await addVerifiedDomain(page, orgSlug, hostname);

  // Den publiserte siden på eget domene viser boligvelgeren med markeringene
  const visitor = await anonymousPage(browser);
  await visitor.page.goto(`http://${hostname}:${port}/`);
  await expect(visitor.page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(visitor.page.locator("a[data-unit-number]")).toHaveCount(2);
  await expect(visitor.page.locator('tr[data-unit-number="A-302"]')).toBeVisible();
  await expect(visitor.page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`^https?://${hostname.replaceAll(".", "\\.")}/?$`));

  await visitor.context.close();

  // Underdomenet sender besøkende til primærdomenet (308), med sti og filter
  const redirect = await page.request.get(`http://127.0.0.1:${port}/bolig/a-302?status=ledig`, {
    headers: { host: new URL(siteAddress(subdomain)).host },
    maxRedirects: 0,
  });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe(`https://${hostname}/bolig/a-302?status=ledig`);

  // Innbygging: koden fra admin på et annet nettsted
  await page.goto(`/${orgSlug}/projects/solsiden/selectors/${selectorId}`);
  await page.getByRole("button", { name: "Flere valg" }).click();
  await page.getByRole("menuitem", { name: "Bygg inn på nettsted …" }).click();
  const embedDialog = page.getByRole("dialog", { name: "Bygg inn på nettsted" });
  await embedDialog.getByLabel("Vis filtre").uncheck();
  const code = (await embedDialog.locator("pre code").first().textContent()) ?? "";
  expect(code).toContain(`<boligvelger-embed selector="${selectorId}" filters="false"`);
  expect(code).toContain("<noscript><iframe");

  const host = await anonymousPage(browser);
  await host.page.setContent(`<!doctype html><html lang="nb"><body><h1>Utbyggerens nettside</h1>${code}</body></html>`);
  const frame = host.page.frameLocator("boligvelger-embed iframe");
  await expect(frame.locator("a[data-unit-number]")).toHaveCount(2);
  await expect(frame.getByRole("button", { name: /^Filtre/ })).toHaveCount(0);
  const navigated = host.page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        document.querySelector("boligvelger-embed")?.addEventListener("boligvelger:navigate", (event) => {
          const path = (event as CustomEvent<{ path: string }>).detail.path;
          if (path.startsWith("/bolig/")) {
            resolve(path);
          }
        });
      }),
  );
  // Enhetskortet i den innbygde velgeren, og videre til enhetssiden
  await frame.locator('tr[data-unit-number="A-302"]').getByRole("button").first().click();
  await frame.getByTestId("unit-card-link").click();
  expect(await navigated).toBe("/bolig/a-302");
  await expect(frame.getByRole("heading", { level: 1, name: /A-302/ })).toBeVisible();
  await host.context.close();

  // Offentlig lese-API med CORS: bare publiserte data
  const api = await page.request.get(`/api/public/v1/selectors/${selectorId}`);
  expect(api.status()).toBe(200);
  expect(api.headers()["access-control-allow-origin"]).toBe("*");
  const body = (await api.json()) as { units: { unit_number: string; status: string }[] };
  expect(body.units.map((unit) => unit.unit_number).sort()).toContain("A-302");
  expect(JSON.stringify(body)).not.toContain("internal_note");
  expect((await page.request.get("/api/public/v1/selectors/00000000-0000-4000-8000-000000000000")).status()).toBe(404);
});

test("abonnement: lesemodus når prøveperioden er ute, varsel på e-post, betaling i Checkout og grense for aktive prosjekter", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const id = uniqueId();
  const email = `abonnement-${id}@example.test`;
  const orgSlug = `abonnement-${id}`;
  await signUp(page, "Ola Abonnement", email);
  await createOrganization(page, `Abonnement ${id}`);
  const orgId = await organizationId(orgSlug);
  const db = serviceClient();

  // Prøveperioden har plass til tre aktive prosjekter
  const { error: insertError } = await db.from("projects").insert(
    [1, 2, 3].map((number) => ({ organization_id: orgId, name: `Aktivt ${number}`, slug: `aktivt-${number}`, phase: "for_sale" })),
  );
  expect(insertError).toBeNull();
  await page.goto(`/${orgSlug}/projects/new`);
  await field(page, "Prosjektnavn").fill("Fjerde");
  await page.getByRole("combobox", { name: "Fase" }).click();
  await page.getByRole("option", { name: "I salg" }).click();
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("button", { name: "Opprett prosjekt" }).click();
  await expect(page.getByText("Planen har ikke plass til flere aktive prosjekter.", { exact: false })).toBeVisible();

  // Prøveperioden er ute: lesemodus, og eieren får varsel på e-post
  await db.from("organizations").update({ trial_ends_at: new Date(Date.now() - 3_600_000).toISOString() }).eq("id", orgId);
  expect((await page.request.get("/api/cron/billing")).status()).toBe(401);
  const cron = await page.request.get("/api/cron/billing", { headers: { authorization: `Bearer ${E2E_SERVICES.cronSecret}` } });
  expect(cron.status()).toBe(200);
  const notice = await emailTo(email);
  expect(notice.subject).toBe(`Abonnement ${id} er i lesemodus`);
  expect(notice.text).toContain("Publiserte prosjektsider og boligvelgere tas aldri ned automatisk.");

  await page.goto(`/${orgSlug}`);
  await expect(page.getByText("Prøveperioden er over, så organisasjonen er i lesemodus.", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "Velg abonnement" }).click();
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}/settings/billing$`));
  await expect(page.getByTestId("billing-status")).toHaveText("Prøveperiode");
  await expect(page.getByText("Organisasjonen er i lesemodus. Dere kan se alt", { exact: false })).toBeVisible();
  await expect(page.getByText("3 av 3 aktive prosjekter er i bruk.")).toBeVisible();
  const growth = page.locator('[data-plan="growth"]');
  await expect(growth).toContainText(/1\s490\skr per måned/);

  // Checkout i Stripe (etterlignet): betaling, webhook og tilbake til appen
  await growth.getByRole("button", { name: "Velg Vekst" }).click();
  await expect(page.getByRole("heading", { name: "Betaling (test)" })).toBeVisible();
  await page.getByRole("button", { name: "Betal" }).click();
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}/settings/billing\\?checkout=success$`));
  await expect(page.getByText("Takk! Abonnementet er aktivt.")).toBeVisible();
  await expect(page.getByTestId("billing-plan")).toHaveText("Vekst");
  await expect(page.getByTestId("billing-status")).toHaveText("Aktiv");
  await expect(page.getByText("3 av 5 aktive prosjekter er i bruk.")).toBeVisible();
  await expect(page.getByText("organisasjonen er i lesemodus", { exact: false })).toHaveCount(0);

  // Kundeportalen
  await page.getByRole("button", { name: "Administrer abonnement" }).click();
  await expect(page.getByRole("heading", { name: "Kundeportal (test)" })).toBeVisible();
  await page.getByRole("link", { name: "Tilbake" }).click();
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}/settings/billing$`));
});

test("samtykke: sporing lastes først etter samtykke, og personvernsidene lages fra innstillingene", async ({ page, browser }) => {
  test.setTimeout(180_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);
  const subdomain = `samtykke-${id}`;

  // Personvern i prosjektsiden og sporingskoder i prosjektinnstillingene
  await createAndPublishSite(page, orgSlug, /^Kommer for salg/, subdomain);
  await page.getByRole("tab", { name: "Innstillinger" }).click();
  await field(page, "Behandlingsansvarlig").fill("Solsiden Utvikling AS");
  await field(page, "Organisasjonsnummer").fill("912 345 678");
  await field(page, "E-post for personvern").fill("personvern@solsiden.example");
  await publish(page);

  await page.goto(`/${orgSlug}/projects/solsiden/settings`);
  await field(page, "Google Analytics 4").fill("g-e2etest01");
  await field(page, "Meta Pixel").fill("123456789012");
  const trackingForm = page.locator("form").filter({ has: field(page, "Google Analytics 4") });
  await trackingForm.getByRole("button", { name: "Lagre" }).click();
  await expect(page.getByText("Sporingskodene er lagret og gjelder den publiserte siden med en gang.")).toBeVisible();

  // Besøkende: ingenting lastes før samtykke
  const visitor = await anonymousPage(browser);
  const trackers: string[] = [];
  await visitor.page.route(/https:\/\/(www\.googletagmanager\.com|connect\.facebook\.net)\//, (route) => {
    trackers.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
  });
  await visitor.page.goto(siteAddress(subdomain));
  const banner = visitor.page.getByTestId("consent-banner");
  await expect(banner).toBeVisible();
  await expect(banner.getByRole("heading", { name: "Informasjonskapsler" })).toBeVisible();
  expect(trackers).toEqual([]);
  await banner.getByRole("button", { name: "Bare nødvendige" }).click();
  await expect(banner).toBeHidden();
  await visitor.page.reload();
  await expect(visitor.page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(visitor.page.getByTestId("consent-banner")).toHaveCount(0);
  expect(trackers).toEqual([]);

  // Endre samtykke: bare statistikk
  await visitor.page.getByRole("button", { name: "Endre samtykke" }).click();
  await expect(banner).toBeVisible();
  await banner.getByLabel(/^Statistikk/).check();
  await banner.getByRole("button", { name: "Lagre valgene" }).click();
  await expect(banner).toBeHidden();
  await expect.poll(() => trackers.some((url) => url.includes("gtag/js?id=G-E2ETEST01"))).toBe(true);
  expect(trackers.some((url) => url.includes("facebook"))).toBe(false);

  // Genererte sider for personvern og informasjonskapsler
  await visitor.page.getByRole("link", { name: "Personvern", exact: true }).click();
  await expect(visitor.page.getByRole("heading", { level: 1, name: "Personvern" })).toBeVisible();
  await expect(visitor.page.getByText("Solsiden Utvikling AS (org.nr. 912 345 678) er behandlingsansvarlig.")).toBeVisible();
  await expect(visitor.page.getByRole("link", { name: "personvern@solsiden.example" })).toBeVisible();
  await expect(visitor.page.getByText("bruker nettstedet Google Analytics, Meta Pixel", { exact: false })).toBeVisible();
  await visitor.page.goto(siteAddress(subdomain, "/informasjonskapsler"));
  await expect(visitor.page.getByRole("heading", { level: 1, name: "Informasjonskapsler" })).toBeVisible();
  await expect(visitor.page.getByRole("rowheader", { name: "_ga, _ga_…" })).toBeVisible();
  await expect(visitor.page.getByRole("rowheader", { name: "_fbp" })).toBeVisible();
  await visitor.context.close();
});

test("API med nøkkel og webhooks: nøkkel fra admin endrer status, og leveransene til webhooken logges", async ({ page }) => {
  test.setTimeout(180_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);

  // API-nøkkel vises én gang
  await page.goto(`/${orgSlug}/settings/api`);
  await page.getByRole("button", { name: "Ny API-nøkkel" }).click();
  const keyDialog = page.getByRole("dialog", { name: "Ny API-nøkkel" });
  await keyDialog.getByLabel("Navn", { exact: true }).fill("Meglersystem");
  await keyDialog.getByRole("checkbox", { name: /^units:write/ }).check();
  await keyDialog.getByRole("button", { name: "Lag nøkkel" }).click();
  const key = await page.getByLabel("API-nøkkelen", { exact: true }).inputValue();
  expect(key).toMatch(/^bpk_[A-Za-z0-9_-]{43}$/);
  await page.getByRole("button", { name: "Ferdig" }).click();
  const auth = { authorization: `Bearer ${key}` };

  expect((await page.request.get("/api/v1/projects")).status()).toBe(401);
  const projects = await page.request.get("/api/v1/projects", { headers: auth });
  expect(projects.status()).toBe(200);
  const projectList = (await projects.json()) as { data: { id: string; name: string; unit_counts: { total: number } }[] };
  expect(projectList.data).toHaveLength(1);
  expect(projectList.data[0]).toMatchObject({ name: "Solsiden", unit_counts: { total: 6 } });
  const projectId = projectList.data[0]?.id ?? "";
  expect((await page.request.get("/api/v1/leads", { headers: auth })).status()).toBe(403);

  // Webhook: private adresser avvises, en offentlig adresse lagres med hemmelighet
  await page.getByRole("button", { name: "Ny webhook" }).click();
  const hookDialog = page.getByRole("dialog", { name: "Ny webhook" });
  await hookDialog.getByLabel("Adresse", { exact: true }).fill("https://10.0.0.1/boliger");
  await hookDialog.getByRole("button", { name: "Lag webhook" }).click();
  await expect(hookDialog.getByText("Adressen peker til et privat nettverk. Bruk en offentlig adresse.")).toBeVisible();
  await hookDialog.getByLabel("Adresse", { exact: true }).fill("https://hooks.e2e.invalid/boliger");
  await hookDialog.getByRole("button", { name: "Lag webhook" }).click();
  await expect(page.getByRole("heading", { name: "Webhooken er laget" })).toBeVisible();
  await expect(page.getByLabel("Hemmelighet", { exact: true })).toHaveValue(/^whsec_/);
  await page.getByRole("button", { name: "Ferdig" }).click();

  const webhook = page.locator('[data-webhook="https://hooks.e2e.invalid/boliger"]');
  await webhook.getByRole("button", { name: "Send testhendelse" }).click();
  await expect(page.getByText("Testhendelsen ble ikke levert", { exact: false })).toBeVisible({ timeout: 20_000 });

  // Statusendring via API: logges med kilden «api» og legges i utboksen for webhooken
  const patched = await page.request.patch(`/api/v1/projects/${projectId}/units/A-101`, {
    headers: auth,
    data: { status: "sold", note: "Solgt via meglersystemet" },
  });
  expect(patched.status()).toBe(200);
  expect(((await patched.json()) as { data: { status: string } }).data.status).toBe("sold");
  const units = (await (await page.request.get(`/api/v1/projects/${projectId}/units`, { headers: auth })).json()) as {
    data: { unit_number: string; status: string }[];
  };
  expect(units.data.find((unit) => unit.unit_number === "A-101")?.status).toBe("sold");
  const invalid = await page.request.patch(`/api/v1/projects/${projectId}/units/A-101`, { headers: auth, data: { price: -1 } });
  expect(invalid.status()).toBe(400);

  await page.reload();
  await webhook.getByText(/^Siste \d+ leveranser$/).click();
  await expect(webhook.locator("code", { hasText: "unit.status_changed" })).toHaveCount(1);
  await expect(webhook.locator("code", { hasText: "webhook.test" })).toHaveCount(1);
  await expect(webhook.locator('[data-delivery-status="failed"]').filter({ hasText: "webhook.test" })).toContainText("ENOTFOUND");

  const cron = await page.request.get("/api/cron/webhooks", { headers: { authorization: `Bearer ${E2E_SERVICES.cronSecret}` } });
  expect(cron.status()).toBe(200);

  // Nøkkelen trekkes tilbake og slutter å virke
  await page.locator('[data-api-key="Meglersystem"]').getByRole("button", { name: "Trekk tilbake" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Trekk tilbake" }).click();
  await expect(page.getByText("«Meglersystem» er trukket tilbake.")).toBeVisible();
  expect((await page.request.get("/api/v1/projects", { headers: auth })).status()).toBe(401);
});
