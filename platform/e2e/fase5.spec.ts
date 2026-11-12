import { AxeBuilder } from "@axe-core/playwright";
import { devices, expect, test, type Browser, type Page } from "@playwright/test";

import { signIn } from "./helpers";
import { organizationId, serviceClient } from "./support/db";
import { createDemo, type Demo } from "./support/demo";

/** WCAG 2.1 nivå A og AA, som spesifikasjonen krever for publiserte sider. */
const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoWcagViolations(page: Page, name: string) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();
  const violations = result.violations.map(
    (violation) => `${violation.id} (${violation.impact}): ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
  expect(violations, `WCAG 2.1 AA-brudd på ${name}`).toEqual([]);
}

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
      `${project}/settings`,
      `${org}/leads`,
      `${org}/media`,
      `${org}/settings`,
      `${org}/settings/members`,
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
