import { expect, test } from "@playwright/test";

import { anonymousPage, setUpProject } from "./boligvelger";
import { uniqueId } from "./helpers";
import { createAndPublishSite, siteAddress } from "./site";
import { organizationId, serviceClient } from "./support/db";

/**
 * Fase 6: pakker og oppstartsavgift. Hele flyten med etterligningen av Stripe:
 * prosjektet kan ikke publiseres før det er lansert, lanseringen krever en
 * pakke, oppstartsavgiften betales i Checkout, og pakken Prosjektside har ikke
 * API, webhooks eller innbygging.
 */
test("pakker og lansering: publisering krever pakke og betalt oppstartsavgift", async ({ page, browser }) => {
  test.setTimeout(240_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);
  const subdomain = `lansering-${id}`;
  const launchPath = `/${orgSlug}/projects/solsiden/launch`;

  // Prøveperioden: prosjektsiden kan bygges, men ikke publiseres før prosjektet er lansert
  await createAndPublishSite(page, orgSlug, /^Kommer for salg/, subdomain);
  await expect(page.getByText("Utkastet er lagret")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /^Publiser/ }).click();
  await expect(page.getByText("Prosjektet må lanseres før det kan publiseres.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Gå til lansering" }).click();
  await expect(page).toHaveURL(new RegExp(`${launchPath}$`));

  // Lanseringen: nivåene som dekker de seks enhetene. Først må det velges en pakke.
  const status = page.getByTestId("launch-status");
  await expect(status).toContainText("Ikke lansert");
  await expect(status).toContainText("Prosjektet har 6 enheter.");
  await expect(page.getByRole("radio", { name: /Inntil 9 enheter/ })).toBeChecked();
  await expect(page.getByText("Velg en pakke før prosjektet lanseres.")).toBeVisible();
  await page.getByRole("link", { name: "Velg pakke" }).click();

  // Pakken Prosjektside i Checkout
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}/settings/billing$`));
  const start = page.locator('[data-plan="start"]');
  await expect(start).toContainText(/890\skr per måned/);
  await start.getByRole("button", { name: "Velg Prosjektside" }).click();
  await page.getByRole("button", { name: "Betal" }).click();
  await expect(page.getByText("Takk! Abonnementet er aktivt.")).toBeVisible();
  await expect(page.getByTestId("billing-plan")).toHaveText("Prosjektside");

  // Oppstartsavgiften i Checkout, for inntil 19 enheter
  await page.goto(launchPath);
  await page.getByRole("radio", { name: /Inntil 19 enheter/ }).check();
  await page.getByRole("button", { name: /^Betal 11\s900\skr og lanser$/ }).click();
  await expect(page.getByText("Beløp: 11900 kr")).toBeVisible();
  await page.getByRole("button", { name: "Betal" }).click();
  await expect(page).toHaveURL(/\/launch\?checkout=success&session_id=cs_e2e/);
  await expect(page.getByText("Takk! Oppstartsavgiften er betalt.")).toBeVisible();
  await expect(status).toContainText("Lansert");
  await expect(status).toContainText("Avgiften dekker inntil 19 enheter.");
  const history = page.getByRole("table", { name: "Betalinger" });
  await expect(history.getByRole("row", { name: /Lansering.*Inntil 19 enheter.*11\s900\skr/ })).toBeVisible();
  // Utvidelse koster bare forskjellen opp til et høyere nivå
  await expect(page.getByRole("radio", { name: /Inntil 39 enheter.*4\s000\skr/ })).toBeVisible();

  // Nå kan prosjektsiden publiseres
  await page.goto(`/${orgSlug}/projects/solsiden/site`);
  await expect(page.getByText("Utkastet er lagret")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /^Publiser/ }).click();
  await expect(page.getByText("Prosjektsiden er publisert.")).toBeVisible();
  const visitor = await anonymousPage(browser);
  await visitor.page.goto(siteAddress(subdomain));
  await expect(visitor.page.getByRole("heading", { level: 1 })).toBeVisible();
  await visitor.context.close();

  // Prosjektside har ikke API, webhooks eller innbygging, og ett eget domene per prosjektside
  await page.goto(`/${orgSlug}/settings/api`);
  await expect(page.getByTestId("plan-feature-notice")).toContainText("Pakken Prosjektside har ikke API, webhooks eller innbygging.");
  await expect(page.getByRole("button", { name: "Ny API-nøkkel" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Ny webhook" })).toBeDisabled();
  await page.goto(`/${orgSlug}/settings/domains`);
  await expect(page.getByText("Pakken har plass til ett eget domene per prosjektside.").first()).toBeVisible();

  // Det offentlige lese-API-et svarer at pakken ikke har det
  const { data: project, error } = await serviceClient()
    .from("projects")
    .select("id")
    .eq("organization_id", await organizationId(orgSlug))
    .eq("slug", "solsiden")
    .single();
  expect(error).toBeNull();
  const response = await page.request.get(`/api/public/v1/projects/${project?.id}/units`);
  expect(response.status()).toBe(403);
  expect((await response.json()).error.code).toBe("plan_required");
});
