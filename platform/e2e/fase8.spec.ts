import { readdirSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { signIn } from "./helpers";
import { expectNoWcagViolations } from "./support/axe";
import { createDemo } from "./support/demo";

/**
 * Fase 8: designstilen Nordisk er standard for prosjektsider, og stilen kan
 * byttes til Klassisk i Tema-fanen. Farger og skrift som ikke er satt, følger
 * stilen.
 */
test("prosjektsiden bruker stilen Nordisk, og stilen kan byttes til Klassisk", async ({ page, browser }) => {
  test.setTimeout(180_000);
  const demo = createDemo();

  // Den publiserte siden i Nordisk: menyen ligger over bildet til siden rulles
  const visitorContext = await browser.newContext({ locale: "nb-NO", timezoneId: "Europe/Oslo" });
  const visitor = await visitorContext.newPage();
  await visitor.goto(`${demo.siteUrl}/`);
  const root = visitor.locator(".site-root");
  await expect(root).toHaveAttribute("data-site-style", "nordic");
  const header = visitor.getByRole("banner");
  await expect(header).toHaveAttribute("data-overlay", "transparent");
  await expect(header.getByRole("link", { name: "Meld interesse" })).toBeVisible();
  await expect(visitor.getByRole("heading", { level: 1, name: "Fjordparken" })).toBeVisible();
  await expect(visitor.getByText(/^\d+ av 24 boliger er solgt$/)).toBeVisible();
  await expectNoWcagViolations(visitor, "forsiden i Nordisk");
  await visitor.mouse.wheel(0, 900);
  await expect(header).toHaveAttribute("data-overlay", "solid");

  // Nærområdet står som en liste ved kartet
  const map = visitor.getByRole("region", { name: "Nærområdet" });
  await expect(map.getByRole("listitem")).toHaveCount(6);
  await expect(map.getByRole("listitem").first()).toContainText("Strandtorget");
  // Arbeidsfilen til kartet lastes fra prosjektsidens eget vertsnavn. Hentes i nettleseren,
  // som slår opp *.localhost selv.
  const worker = readdirSync("public/vendor").find((name) => name.startsWith("maplibre-gl-worker-"));
  const workerResponse = await visitor.evaluate(async (path) => {
    const response = await fetch(path);
    return { status: response.status, type: response.headers.get("content-type") ?? "" };
  }, `/vendor/${worker}`);
  expect(workerResponse.status).toBe(200);
  expect(workerResponse.type).toMatch(/javascript/);

  // Editoren: bytt til Klassisk. Forhåndsvisningen endres med en gang, og farger
  // som ikke er satt, kommer fra den nye stilen.
  await signIn(page, demo.email, demo.password);
  await expect(page).toHaveURL(new RegExp(`/${demo.orgSlug}`));
  await page.goto(`/${demo.orgSlug}/projects/${demo.projectSlug}/site`);
  await page.getByRole("tab", { name: "Tema" }).click();
  const style = page.getByRole("combobox", { name: "Designstil" });
  await expect(style).toHaveText("Som standard (Nordisk)");
  await expect(page.getByText("Fra merkevareprofilen", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Standard i stilen Nordisk", { exact: true })).toHaveCount(3);
  await style.click();
  await page.getByRole("option", { name: "Klassisk" }).click();
  await expect(style).toHaveText("Klassisk");
  await expect(page.getByText("Standard i stilen Klassisk", { exact: true })).toHaveCount(3);
  const preview = page.frameLocator('iframe[title="Forhåndsvisning av siden"]');
  await expect(preview.locator(".site-root")).toHaveAttribute("data-site-style", "classic");
  await expectNoWcagViolations(page, "Tema-fanen");

  await expect(page.getByText("Utkastet er lagret")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /^Publiser/ }).click();
  await expect(page.getByText("Prosjektsiden er publisert.")).toBeVisible();

  // Den publiserte siden i Klassisk: vanlig meny over innholdet
  await visitor.goto(`${demo.siteUrl}/`);
  await expect(root).toHaveAttribute("data-site-style", "classic");
  await expect(header).not.toHaveAttribute("data-overlay", /.+/);
  await expect(visitor.getByRole("heading", { level: 1, name: "Fjordparken" })).toBeVisible();
  await expectNoWcagViolations(visitor, "forsiden i Klassisk");
  await visitorContext.close();
});
