import { readFileSync } from "node:fs";

import { devices, expect, test, type Browser } from "@playwright/test";

import { createOrganization, PASSWORD, signIn, signUp, uniqueId } from "./helpers";
import { expectNoWcagViolations } from "./support/axe";
import { organizationId, serviceClient, userClient } from "./support/db";
import { createDemo, type Demo } from "./support/demo";

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobil: { ...devices["iPhone 13"], defaultBrowserType: undefined },
} as const;

async function newPage(browser: Browser, kind: keyof typeof VIEWPORTS) {
  const context = await browser.newContext({ ...VIEWPORTS[kind], locale: "nb-NO", timezoneId: "Europe/Oslo" });
  return context.newPage();
}

test.describe("universell utforming på publiserte sider (demodata)", () => {
  let demo: Demo;
  let selectorId: string;

  test.beforeAll(async ({}, testInfo) => {
    testInfo.setTimeout(180_000);
    demo = createDemo();
    const supabase = serviceClient();
    const orgId = await organizationId(demo.orgSlug);
    // Med sporingskoder vises samtykkebanneret, så det kontrolleres også. Settes før
    // siden vises første gang, så mellomlageret ikke har en side uten banner.
    const { error } = await supabase
      .from("projects")
      .update({ analytics_ids: { ga4: "G-DEMO1234" } })
      .eq("organization_id", orgId)
      .eq("slug", demo.projectSlug);
    expect(error).toBeNull();
    const { data } = await supabase.from("selectors").select("id").eq("organization_id", orgId).single();
    selectorId = data?.id as string;
  });

  for (const kind of ["desktop", "mobil"] as const) {
    test(`ingen WCAG 2.1 AA-brudd på prosjektsiden, enhetssiden, personvernsidene og innbyggingen (${kind})`, async ({ browser }) => {
      test.setTimeout(120_000);
      const page = await newPage(browser, kind);
      for (const path of ["/", "/bolig/a-302", "/personvern", "/informasjonskapsler"]) {
        await page.goto(`${demo.siteUrl}${path}`);
        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByTestId("consent-banner")).toBeVisible();
        await expectNoWcagViolations(page, `${kind} ${path}`);
      }
      // Samtykke: banneret forsvinner og huskes
      await page.getByRole("button", { name: "Bare nødvendige" }).click();
      await expect(page.getByTestId("consent-banner")).toBeHidden();
      await expectNoWcagViolations(page, `${kind} etter samtykke`);

      await page.goto(`/embed/selector/${selectorId}`);
      await expect(page.getByRole("table", { name: /boliger/i })).toBeVisible();
      await expectNoWcagViolations(page, `${kind} innbygging`);
      await page.context().close();
    });
  }

  test("admin har ingen WCAG 2.1 AA-brudd på de viktigste sidene", async ({ browser }) => {
    test.setTimeout(120_000);
    const page = await newPage(browser, "desktop");
    await page.goto("/login");
    await expectNoWcagViolations(page, "innlogging");
    await signIn(page, demo.email, demo.password);
    await expect(page).toHaveURL(new RegExp(`/${demo.orgSlug}`));
    const org = `/${demo.orgSlug}`;
    const project = `${org}/projects/${demo.projectSlug}`;
    for (const path of [
      org,
      `${org}/projects`,
      project,
      `${project}/units`,
      `${project}/selectors`,
      `${project}/selectors/${selectorId}`,
      `${project}/site`,
      `${project}/launch`,
      `${project}/settings`,
      `${org}/leads`,
      `${org}/media`,
      `${org}/settings`,
      `${org}/settings/members`,
      `${org}/settings/billing`,
      `${org}/settings/api`,
    ]) {
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
      await page.waitForLoadState("networkidle");
      await expectNoWcagViolations(page, path);
    }
    await page.context().close();
  });

  test("boligvelgeren kan brukes med tastatur og skjermleser, og listen er et likeverdig alternativ", async ({ browser }) => {
    test.setTimeout(90_000);
    const page = await newPage(browser, "desktop");
    await page.goto(demo.siteUrl);
    await page.getByRole("button", { name: "Bare nødvendige" }).click();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByTestId("consent-banner")).toBeHidden();

    // Første tabulator gir lenken som hopper over menyen
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Hopp til innhold" })).toBeFocused();
    // Lenken flytter startpunktet for tabulatoren til hovedinnholdet, forbi menyen
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.getElementById("innhold")?.contains(document.activeElement))).toBe(true);

    // Hver bolig er en lenke med enhet, status og nøkkelinfo i navnet. Status er tekst, ikke bare farge.
    const shapes = page.getByRole("group", { name: "Boliger i Fasade" });
    await expect(shapes.getByRole("link")).toHaveCount(24);
    await expect(shapes.getByRole("link", { name: /^A-101, Solgt\./ })).toHaveCount(1);
    const a302 = shapes.getByRole("link", { name: /^A-302, Ledig\. 3 rom/ });

    // Fokus viser verktøytipset, Enter åpner enhetskortet, Escape lukker og gir fokus tilbake
    await a302.focus();
    await expect(page.getByRole("tooltip")).toContainText("A-302");
    await page.keyboard.press("Enter");
    const card = page.getByRole("dialog", { name: /^A-302/ });
    await expect(card).toBeVisible();
    await expect(card.getByRole("link", { name: "Se bolig" })).toBeVisible();
    expect(await card.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();
    await expect(a302).toBeFocused();

    // Listen har de samme boligene, med status som tekst og en lenke til hver
    const list = page.getByRole("region", { name: "Liste over boliger" });
    await expect(list.getByRole("row")).toHaveCount(25);
    await expect(list.getByRole("row", { name: /A-101/ })).toContainText("Solgt");

    // Filteret kan brukes med tastatur og gjelder både bildet og listen
    const available = page.getByRole("group", { name: "Status" }).getByRole("button", { name: "Ledig" });
    await available.focus();
    await page.keyboard.press("Space");
    await expect(available).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Viser 15 av 24 boliger")).toBeVisible();
    await expect(list.getByRole("row")).toHaveCount(16);

    // Fra listen åpnes det samme enhetskortet, og derfra boligsiden
    await list.getByRole("button", { name: "A-302", exact: true }).press("Enter");
    await page.getByRole("dialog", { name: /^A-302/ }).getByRole("link", { name: "Se bolig" }).press("Enter");
    await expect(page.getByRole("heading", { level: 1, name: /^A-302/ })).toBeVisible();

    // «Endre samtykke» åpner banneret med fokus på overskriften, og fokus går tilbake til knappen etter valget
    const change = page.getByRole("button", { name: "Endre samtykke" });
    await change.focus();
    await page.keyboard.press("Enter");
    const banner = page.getByTestId("consent-banner");
    await expect(banner.getByRole("heading", { name: "Informasjonskapsler" })).toBeFocused();
    await banner.getByRole("button", { name: "Lagre valgene" }).press("Enter");
    await expect(banner).toBeHidden();
    await expect(change).toBeFocused();
    await page.context().close();
  });
});

/** Alle tabeller med organization_id. Hver av dem skal være tom sett fra en annen organisasjon. */
const TENANT_TABLES = [
  "organizations",
  "memberships",
  "invitations",
  "projects",
  "project_members",
  "stages",
  "buildings",
  "units",
  "unit_status_events",
  "assets",
  "selectors",
  "selector_views",
  "hotspots",
  "sites",
  "pages",
  "page_versions",
  "domains",
  "leads",
  "audit_log",
  "api_keys",
  "webhooks",
  "webhook_deliveries",
  "rate_limit_buckets",
] as const;

test("akseptkriterium 6: en bruker i én organisasjon får ingen rader og ingen skrivetilgang mot en annen organisasjon", async ({ page }) => {
  test.setTimeout(180_000);
  // Organisasjon B med prosjekt, 24 enheter, boligvelger, prosjektside og leads (demodata)
  const other = createDemo();
  const service = serviceClient();
  const otherOrgId = await organizationId(other.orgSlug);
  const project = await service.from("projects").select("id").eq("organization_id", otherOrgId).single();
  const unitsBefore = await service.from("units").select("id, status, price").eq("organization_id", otherOrgId).order("id");
  const leadsBefore = await service.from("leads").select("id").eq("organization_id", otherOrgId);
  expect(unitsBefore.data).toHaveLength(24);
  expect(leadsBefore.data?.length).toBeGreaterThan(0);
  const projectId = project.data?.id as string;
  const unitId = unitsBefore.data?.[0]?.id as string;

  // Bruker A med sin egen organisasjon
  const id = uniqueId();
  const email = `ac6-${id}@example.test`;
  await signUp(page, "Anna Annen", email);
  await createOrganization(page, `Annen ${id}`);

  // I admin finnes ikke organisasjon B
  for (const path of [`/${other.orgSlug}`, `/${other.orgSlug}/projects/${other.projectSlug}/units`, `/${other.orgSlug}/leads`, `/${other.orgSlug}/settings/members`]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Fant ikke siden" }), path).toBeVisible();
  }

  // Direkte mot API-et med brukerens innlogging: ingen rader i noen tabell
  const client = await userClient(email, PASSWORD);
  // Kontroll: brukeren ser sin egen organisasjon med den samme klienten
  const own = await client.from("organizations").select("name");
  expect(own.data).toEqual([{ name: `Annen ${id}` }]);
  for (const table of TENANT_TABLES) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .eq(table === "organizations" ? "id" : "organization_id", otherOrgId);
    // Enten ingen rader (RLS), eller ingen tilgang til tabellen i det hele tatt
    expect(error ? error.code : data, table).toEqual(error ? "42501" : []);
  }

  // Ingen skrivetilgang: endringer treffer ingen rader, og nye rader avvises
  const updated = await client.from("units").update({ price: 1, status: "sold" }).eq("organization_id", otherOrgId).select("id");
  expect(updated.data ?? []).toEqual([]);
  const inserted = await client.from("units").insert({ organization_id: otherOrgId, project_id: projectId, unit_number: "INNTRENGER" });
  expect(inserted.error?.code).toBe("42501");
  const deleted = await client.from("leads").delete().eq("organization_id", otherOrgId).select("id");
  expect(deleted.data ?? []).toEqual([]);
  const invited = await client.from("memberships").insert({ organization_id: otherOrgId, user_id: (await client.auth.getUser()).data.user?.id, role: "owner" });
  expect(invited.error).not.toBeNull();

  // Databasefunksjonene: statusendring og publisering avvises, oversikten er tom
  const status = await client.rpc("set_unit_status", { p_unit_ids: [unitId], p_status: "sold", p_note: "inntrenger", p_source: "table" });
  expect(status.error !== null || status.data === 0).toBe(true);
  const overview = await client.rpc("project_overview", { p_project_id: projectId });
  expect(overview.data).toMatchObject({ statuses: [], marked_units: 0, selector: null, site: null });

  // Lagring: ingen filer i organisasjon B kan listes eller lastes opp
  const listed = await client.storage.from("media").list(otherOrgId);
  expect(listed.data ?? []).toEqual([]);
  const uploaded = await client.storage.from("media").upload(`${otherOrgId}/inntrenger.png`, Buffer.from("ikke et bilde"), { contentType: "image/png" });
  expect(uploaded.error).not.toBeNull();

  // Ingenting er endret i organisasjon B
  const unitsAfter = await service.from("units").select("id, status, price").eq("organization_id", otherOrgId).order("id");
  const leadsAfter = await service.from("leads").select("id").eq("organization_id", otherOrgId);
  expect(unitsAfter.data).toEqual(unitsBefore.data);
  expect(leadsAfter.data?.length).toBe(leadsBefore.data?.length);
  const memberships = await service.from("memberships").select("user_id").eq("organization_id", otherOrgId);
  expect(memberships.data).toHaveLength(1);
});

test("personvern: innsyn i og sletting av alt om én person fra leadet i admin", async ({ page }) => {
  test.setTimeout(150_000);
  const demo = createDemo();
  await signIn(page, demo.email, demo.password);
  await expect(page).toHaveURL(new RegExp(`/${demo.orgSlug}`));
  await page.goto(`/${demo.orgSlug}/leads`);
  await page.getByRole("link", { name: "Ola Nordmann" }).click();
  await expect(page.getByRole("heading", { name: "Innsyn og sletting" })).toBeVisible();

  // Innsyn: en fil med alt som er lagret om personen, også samtykketeksten
  const downloading = page.waitForEvent("download");
  await page.getByRole("link", { name: "Last ned alt om ola.nordmann@example.com" }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^innsyn-\d{4}-\d{2}-\d{2}\.json$/);
  const file = JSON.parse(readFileSync(await download.path(), "utf8"));
  expect(file).toMatchObject({ format: "innsyn-1", controller: "Demo Bolig AS", person: { email: "ola.nordmann@example.com" } });
  expect(file.leads).toHaveLength(1);
  expect(file.leads[0]).toMatchObject({ name: "Ola Nordmann", unit: "A-302", project: "Fjordparken", consent: { contact: true } });
  expect(file.leads[0].consent.texts.contact).toContain("Demo Bolig AS");

  // Innsynet er logget uten hvem det gjaldt
  const orgId = await organizationId(demo.orgSlug);
  const { data: audit } = await serviceClient().from("audit_log").select("data").eq("organization_id", orgId).eq("action", "privacy.person_exported");
  expect(audit).toEqual([{ data: { leads: 1 } }]);

  // Sletting: henvendelsen er borte fra admin og fra databasen
  await page.getByRole("button", { name: "Slett henvendelsen" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Slett henvendelsen" }).click();
  await expect(page).toHaveURL(new RegExp(`/${demo.orgSlug}/leads$`));
  await expect(page.getByRole("link", { name: "Ola Nordmann" })).toHaveCount(0);
  const { data: left } = await serviceClient().from("leads").select("id").eq("organization_id", orgId).ilike("email", "ola.nordmann@example.com");
  expect(left).toEqual([]);
});

test("helsesjekken svarer for appen, databasen, innloggingen og lagringen", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(await response.json()).toEqual({ ok: true, checks: { database: true, auth: true, storage: true } });
});
