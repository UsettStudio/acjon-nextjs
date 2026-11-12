import { expect, type Browser, type Locator, type Page } from "@playwright/test";
import sharp from "sharp";

import { createOrganization, field, signUp } from "./helpers";

export const IMAGE_WIDTH = 2400;
export const IMAGE_HEIGHT = 1500;

/** Markeringene som tegnes i testen, som andeler av bildet. */
export const A302 = [
  [0.3, 0.2],
  [0.5, 0.2],
  [0.5, 0.45],
  [0.3, 0.45],
] as const;
export const A101 = { from: [0.55, 0.55], to: [0.75, 0.8] } as const;

/** Fasadebilde 2400 × 1500 med vinduer, laget med sharp. */
export async function facadeImage(): Promise<Buffer> {
  const windows: string[] = [];
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 6; column++) {
      windows.push(`<rect x="${380 + column * 280}" y="${260 + row * 270}" width="180" height="160" fill="#7f9db3" />`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
    <rect width="100%" height="100%" fill="#dfe8ee" />
    <rect x="300" y="180" width="1800" height="1200" fill="#f3ede3" stroke="#4b4b4b" stroke-width="10" />
    ${windows.join("")}
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Seks leiligheter, alle ledige. A-302 og A-101 får markeringer. */
const UNITS_CSV =
  "Nr;Etasje;Rom;BRA-i;Pris;Status\nA-101;1;2;54,5;3 200 000;Ledig\nA-102;1;3;68;3 950 000;Ledig\nA-103;1;4;82;4 600 000;Ledig\nA-301;3;2;55;3 400 000;Ledig\nA-302;3;3;71;4 250 000;Ledig\nA-303;3;4;84;4 900 000;Reservert\n";

/** Klikk et sted i bildet, oppgitt som andel av bildets bredde og høyde. */
export async function pointIn(image: Locator, [fx, fy]: readonly [number, number]) {
  const box = await image.boundingBox();
  if (!box) {
    throw new Error("Bildet vises ikke");
  }
  return { x: box.x + fx * box.width, y: box.y + fy * box.height };
}

export async function setUpProject(page: Page, id: string) {
  await signUp(page, "Stine Status", `status-${id}@example.test`);
  await createOrganization(page, `Velger ${id}`);
  const orgSlug = `velger-${id}`;
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}$`));
  await page.goto(`/${orgSlug}/projects/new`);
  await field(page, "Prosjektnavn").fill("Solsiden");
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("button", { name: "Opprett prosjekt" }).click();
  await expect(page).toHaveURL(new RegExp(`/projects/solsiden/units$`));
  await page.getByRole("button", { name: "Importer", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Importer enheter" });
  await dialog.locator('input[type="file"]').setInputFiles({ name: "enheter.csv", mimeType: "text/csv", buffer: Buffer.from(UNITS_CSV, "utf8") });
  await dialog.getByRole("button", { name: "Forhåndsvis" }).click();
  await dialog.getByRole("button", { name: "Importer 6 rader" }).click();
  await expect(dialog.getByText("6 nye enheter")).toBeVisible();
  await dialog.getByRole("button", { name: "Lukk" }).first().click();
  return orgSlug;
}

/** Lager boligvelger med fasadebilde, tegner og kobler to markeringer og publiserer. Svarer med velgerens id. */
export async function buildSelector(page: Page, orgSlug: string): Promise<string> {
  await page.goto(`/${orgSlug}/projects/solsiden/selectors`);
  await page.getByRole("button", { name: "Ny boligvelger" }).click();
  await page.getByRole("button", { name: "Opprett og åpne" }).click();
  await expect(page).toHaveURL(/\/selectors\/[0-9a-f-]{36}$/);
  const selectorId = page.url().split("/").pop() ?? "";

  // Første visning: fasadebildet lastes opp i mediebiblioteket fra skjemaet
  await page.getByRole("button", { name: "Legg til første visning" }).click();
  const viewDialog = page.getByRole("dialog", { name: "Ny visning" });
  await viewDialog.getByRole("button", { name: "Velg bilde" }).click();
  const picker = page.getByRole("dialog", { name: "Velg bilde" });
  await picker.locator('input[type="file"]').setInputFiles({ name: "fasade-sor.png", mimeType: "image/png", buffer: await facadeImage() });
  // Ferdig behandlet (WebP-varianter laget) og valgt i biblioteket
  await expect(picker.getByRole("button", { name: "fasade-sor.png" })).toHaveAttribute("aria-pressed", "true", { timeout: 30_000 });
  await picker.getByRole("button", { name: "Legg til 1 fil" }).click();
  await expect(picker).toBeHidden();
  await expect(field(page, "Navn")).toHaveValue("fasade-sor");
  await field(page, "Navn").fill("Fasade sør");
  await viewDialog.getByRole("button", { name: "Legg til visning" }).click();
  await expect(page.getByText("Visningen «Fasade sør» er lagt til.")).toBeVisible();

  const canvas = page.getByTestId("editor-canvas");
  const image = canvas.locator("img");
  await expect(image).toBeVisible();

  // Tegn: polygon rundt A-302 (lukkes ved klikk på første punkt) og rektangel rundt A-101
  await page.getByRole("button", { name: "Polygon (P)" }).click();
  for (const point of A302) {
    const { x, y } = await pointIn(image, point);
    await page.mouse.click(x, y);
  }
  const first = await pointIn(image, A302[0]);
  await page.mouse.click(first.x, first.y);
  await expect(page.getByText("1 markering i visningen, 1 valgt")).toBeVisible();

  await page.getByRole("button", { name: "Rektangel (R)" }).click();
  const from = await pointIn(image, A101.from);
  const to = await pointIn(image, A101.to);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2);
  await page.mouse.move(to.x, to.y);
  await page.mouse.up();
  await expect(page.getByText("2 markeringer i visningen, 1 valgt")).toBeVisible();

  // Angre og gjør om
  await page.keyboard.press("Control+z");
  await expect(page.getByText("1 markering i visningen")).toBeVisible();
  await page.keyboard.press("Control+Shift+z");
  await expect(page.getByText(/^2 markeringer i visningen/)).toBeVisible();
  await expect(page.getByText("Alle endringer er lagret")).toBeVisible({ timeout: 10_000 });

  // Koble: klikk markering, velg enhet i listen
  await page.getByRole("radio", { name: "Koble" }).click();
  await expect(page.getByText("0 av 6 enheter markert")).toBeVisible();
  await canvas.getByRole("button", { name: "Markering 1, ikke koblet" }).click();
  await page.getByRole("button", { name: /^A-302/ }).click();
  await expect(page.getByText("Koblet til A-302.", { exact: false })).toBeVisible();
  await canvas.getByRole("button", { name: "Markering 2, ikke koblet" }).click();
  await page.getByRole("button", { name: /^A-101/ }).click();
  await expect(page.getByText("2 av 6 enheter markert")).toBeVisible();
  await expect(page.getByText("Alle endringer er lagret")).toBeVisible({ timeout: 10_000 });

  // Publiser
  await expect(page.getByText("Ikke publisert")).toBeVisible();
  await page.getByRole("button", { name: "Publiser", exact: true }).click();
  await expect(page.getByText("Boligvelgeren er publisert.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Publisert" })).toBeDisabled();
  return selectorId;
}

export async function anonymousPage(browser: Browser, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ locale: "nb-NO", timezoneId: "Europe/Oslo", viewport });
  return { context, page: await context.newPage() };
}
