import { expect, type Page } from "@playwright/test";

export const PASSWORD = "riktig-hest-batteri-stift";

/** Unik del av e-post og navn, så testene kan kjøres flere ganger mot samme database. */
export function uniqueId(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

export async function signUp(page: Page, name: string, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Navn").fill(name);
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Opprett konto" }).click();
}

export async function createOrganization(page: Page, name: string) {
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Firmanavn").fill(name);
  await page.getByRole("button", { name: "Opprett organisasjon" }).click();
  await expect(page.getByRole("heading", { name: /^Velkommen/ })).toBeVisible();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Brukermeny" }).click();
  await page.getByRole("menuitem", { name: "Logg ut" }).click();
  await expect(page).toHaveURL(/\/login/);
}

export async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(password);
  await page.getByRole("button", { name: "Logg inn", exact: true }).click();
}
