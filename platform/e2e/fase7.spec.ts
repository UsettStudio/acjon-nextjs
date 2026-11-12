import { expect, test } from "@playwright/test";

import { setUpProject } from "./boligvelger";
import { field, uniqueId } from "./helpers";
import { createAndPublishSite } from "./site";
import { expectNoWcagViolations, waitForAnimations } from "./support/axe";
import { serviceClient } from "./support/db";

/**
 * Fase 7: plattformadmin lanserer et prosjekt etter avtale, Brukere viser
 * plassene i pakken, og blokkeditoren kan angre og gjøre om.
 */
test("plattformadmin lanserer etter avtale, og blokkeditoren kan angre og gjøre om", async ({ page }) => {
  test.setTimeout(180_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);
  const email = `status-${id}@example.test`;

  // Brukere: plassene i pakken
  await page.goto(`/${orgSlug}/settings/members`);
  await expect(page.getByTestId("member-seats")).toHaveText(
    "1 av 10 plasser i pakken Prøveperiode er i bruk (brukere og ventende invitasjoner).",
  );
  await expectNoWcagViolations(page, "Brukere");

  // Prosjektlisten viser at prosjektet ikke er lansert
  await page.goto(`/${orgSlug}/projects`);
  await expect(page.getByRole("link", { name: /Solsiden/ })).toContainText("Ikke lansert");

  // Blokkeditoren: legg til en blokk, angre med knappen og gjør om med tastaturet
  await createAndPublishSite(page, orgSlug, /^Kommer for salg/, `angre-${id}`);
  const blocks = page.getByRole("list", { name: "Blokker på siden" }).getByRole("listitem");
  const before = await blocks.count();
  await expect(page.getByRole("button", { name: "Angre", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Legg til blokk" }).click();
  await page.getByRole("dialog", { name: "Legg til blokk" }).getByRole("button", { name: /^Knapp/ }).click();
  await expect(page.getByRole("heading", { name: "Knapp", exact: true })).toBeVisible();

  // Skriving i et felt angres som ett steg, også med fokus i feltet
  const label = field(page, "Tekst på knappen");
  const original = await label.inputValue();
  await label.fill(`${original} nå`);
  await expect(label).toHaveValue(`${original} nå`);
  await label.press("ControlOrMeta+z");
  await expect(label).toHaveValue(original);
  await label.press("ControlOrMeta+Shift+z");
  await expect(label).toHaveValue(`${original} nå`);

  await page.getByRole("button", { name: "Alle blokker" }).click();
  await expect(blocks).toHaveCount(before + 1);
  await page.getByRole("button", { name: "Angre", exact: true }).click();
  await page.getByRole("button", { name: "Angre", exact: true }).click();
  await expect(blocks).toHaveCount(before);
  await expect(page.getByRole("button", { name: "Gjør om", exact: true })).toBeEnabled();
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(blocks).toHaveCount(before + 1);
  await expect(page.getByRole("button", { name: "Gjør om", exact: true })).toBeDisabled();
  await expect(page.getByText("Utkastet er lagret")).toBeVisible({ timeout: 10_000 });

  // Plattformadmin: lansering etter avtale
  const db = serviceClient();
  const { data: user, error: userError } = await db.from("profiles").select("id").eq("email", email).single();
  expect(userError).toBeNull();
  const { error: adminError } = await db.from("platform_admins").insert({ user_id: user?.id });
  expect(adminError).toBeNull();

  await page.goto("/platform");
  await expectNoWcagViolations(page, "Plattformadmin");
  await page.getByRole("link", { name: `Velger ${id}` }).click();
  await expect(page).toHaveURL(new RegExp(`/platform/${orgSlug}$`));
  const row = page.getByRole("row", { name: /Solsiden/ });
  await expect(row).toContainText("Ikke lansert");
  await expectNoWcagViolations(page, "Plattformadmin, organisasjon");
  await row.getByRole("button", { name: "Lanser etter avtale: Solsiden" }).click();
  const dialog = page.getByRole("dialog", { name: "Lansering av Solsiden etter avtale" });
  await waitForAnimations(dialog);
  await expectNoWcagViolations(page, "Lansering etter avtale");
  await dialog.getByRole("button", { name: "Lanser", exact: true }).click();
  await expect(dialog.getByText("Fyll ut feltet.")).toBeVisible();
  await dialog.getByLabel("Avtalen").fill("Avtale E2E: 300 enheter, faktura sendt");
  await dialog.getByLabel("Grense for antall enheter").fill("300");
  await dialog.getByRole("button", { name: "Lanser", exact: true }).click();
  await expect(page.getByText("Solsiden er lansert etter avtale.")).toBeVisible();
  await expect(row).toContainText(/Lansert .*, inntil 300 enheter/);

  // Kunden ser lanseringen på prosjektet
  await page.goto(`/${orgSlug}/projects/solsiden/launch`);
  await expect(page.getByTestId("launch-status")).toContainText("Avgiften dekker inntil 300 enheter.");
  await expect(page.getByRole("table", { name: "Betalinger" }).getByRole("row", { name: /Etter avtale.*Inntil 300 enheter/ })).toBeVisible();
  await page.goto(`/${orgSlug}/projects`);
  await expect(page.getByRole("link", { name: /Solsiden/ })).not.toContainText("Ikke lansert");
});
