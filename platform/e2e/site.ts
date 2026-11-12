import { expect, type Page } from "@playwright/test";

import { field } from "./helpers";
import { waiveLaunchForPage } from "./support/launch";

export const port = Number(process.env.E2E_PORT ?? 3000);

/** Adressen til en publisert prosjektside. *.localhost peker til maskinen selv i Chromium. */
export function siteAddress(subdomain: string, path = "/") {
  return `http://${subdomain}.localhost:${port}${path}`;
}

/** Lager prosjektside fra malen. Siden er et utkast til den publiseres med publish(). */
export async function createAndPublishSite(page: Page, orgSlug: string, template: RegExp, subdomain: string) {
  await page.goto(`/${orgSlug}/projects/solsiden/site`);
  await page.getByRole("radio", { name: template }).check();
  await field(page, "Adresse").fill(subdomain);
  await page.getByRole("button", { name: "Lag prosjektside" }).click();
  await expect(page.getByText("Prosjektsiden er laget som utkast.")).toBeVisible();
  await expect(page.getByRole("list", { name: "Blokker på siden" })).toBeVisible();
}

/** Publiserer prosjektsiden. Prosjektet lanseres først uten avgift (oppsett, se support/launch.ts). */
export async function publish(page: Page) {
  await waiveLaunchForPage(page);
  await expect(page.getByText("Utkastet er lagret")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: /^Publiser/ }).click();
  await expect(page.getByText("Prosjektsiden er publisert.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publisert", exact: true })).toBeDisabled();
}
