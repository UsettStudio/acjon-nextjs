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
  await field(page, "E-post").fill(email);
  await field(page, "Passord").fill(password);
  await page.getByRole("button", { name: "Logg inn", exact: true }).click();
}

/**
 * Synlig felt med etiketten. Next.js beholder tidligere sider skjult i DOM-en
 * (React Activity), så samme etikett kan finnes på en skjult side.
 */
export function field(page: Page, label: string) {
  return page.getByLabel(label, { exact: true }).filter({ visible: true });
}

const MAILPIT_URL = process.env.E2E_MAILPIT_URL ?? "http://127.0.0.1:54324";

/** Henter emne og første lenke fra siste e-post til adressen i Mailpit (lokal Supabase). */
export async function latestEmail(address: string): Promise<{ subject: string; link: string }> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const search = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}&limit=1`);
    const { messages } = (await search.json()) as { messages?: { ID: string; Subject: string }[] };
    const message = messages?.[0];
    if (message) {
      const detail = (await (await fetch(`${MAILPIT_URL}/api/v1/message/${message.ID}`)).json()) as { HTML?: string };
      const href = /href="([^"]+)"/.exec(detail.HTML ?? "")?.[1];
      if (href) {
        return { subject: message.Subject, link: href.replaceAll("&amp;", "&") };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Fant ingen e-post til ${address}`);
}

export async function deleteEmails(address: string) {
  await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`, { method: "DELETE" });
}
