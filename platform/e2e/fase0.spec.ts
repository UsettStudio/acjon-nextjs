import { expect, test } from "@playwright/test";

import { createOrganization, PASSWORD, signIn, signOut, signUp, uniqueId } from "./helpers";

test("ny bruker oppretter organisasjon og inviterer en kollega, som bare ser egen organisasjon", async ({ page }) => {
  const id = uniqueId();
  const organizationName = `E2E Bolig ${id}`;
  const organizationSlug = `e2e-bolig-${id}`;
  const editorEmail = `redaktor-${id}@example.test`;

  // Eier registrerer seg og oppretter organisasjon med prøveperiode
  await signUp(page, "Eva Eier", `eier-${id}@example.test`);
  await createOrganization(page, organizationName);
  await expect(page).toHaveURL(new RegExp(`/${organizationSlug}$`));
  await expect(page.getByRole("heading", { name: "Velkommen, Eva Eier" })).toBeVisible();
  await expect(page.getByText("Din rolle: Eier")).toBeVisible();
  await expect(page.getByText("Prøveperiode", { exact: true })).toBeVisible();

  // Eier inviterer en redaktør
  await page.getByRole("link", { name: "Innstillinger" }).click();
  await page.getByRole("link", { name: "Brukere", exact: true }).click();
  await page.getByRole("button", { name: "Inviter bruker" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("E-post").fill(editorEmail);
  await dialog.getByRole("button", { name: "Send invitasjon" }).click();
  await expect(dialog.getByRole("heading", { name: "Invitasjonen er sendt" })).toBeVisible();
  const invitationLink = await dialog.getByLabel("Invitasjonslenke").inputValue();
  expect(invitationLink).toMatch(/\/invite\/[A-Za-z0-9_-]{43}$/);
  await dialog.getByRole("button", { name: "Ferdig" }).click();
  await expect(page.getByText(editorEmail)).toBeVisible();
  await signOut(page);

  // Kollegaen åpner lenken, oppretter konto med e-postadressen fra invitasjonen og godtar
  await page.goto(invitationLink);
  await expect(page.getByRole("heading", { name: `Du er invitert til ${organizationName}` })).toBeVisible();
  await page.getByRole("link", { name: "Opprett konto" }).click();
  await expect(page.getByLabel("E-post")).toHaveValue(editorEmail);
  await page.getByLabel("Navn").fill("Rune Redaktør");
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Opprett konto" }).click();
  await page.getByRole("button", { name: "Godta invitasjonen" }).click();
  await expect(page).toHaveURL(new RegExp(`/${organizationSlug}$`));
  await expect(page.getByText("Din rolle: Redaktør")).toBeVisible();

  // Redaktøren har ikke tilgang til innstillinger
  await expect(page.getByRole("link", { name: "Innstillinger" })).toHaveCount(0);
  await page.goto(`/${organizationSlug}/settings/members`);
  await expect(page.getByRole("heading", { name: "Fant ikke siden" })).toBeVisible();
  await signOut(page);

  // En bruker i en annen organisasjon ser ingenting fra den første
  await signUp(page, "Ola Annen", `annen-${id}@example.test`);
  await createOrganization(page, `Annen Bolig ${id}`);
  await expect(page).toHaveURL(new RegExp(`/annen-bolig-${id}$`));
  await page.goto(`/${organizationSlug}`);
  await expect(page.getByRole("heading", { name: "Fant ikke siden" })).toBeVisible();
  await page.goto(`/${organizationSlug}/settings/members`);
  await expect(page.getByRole("heading", { name: "Fant ikke siden" })).toBeVisible();
});

test("innlogging: feil passord gir feilmelding, riktig passord sender brukeren videre", async ({ page }) => {
  const id = uniqueId();
  const email = `innlogging-${id}@example.test`;
  await signUp(page, "Ida Innlogging", email);
  await createOrganization(page, `Innlogging ${id}`);
  await signOut(page);

  await signIn(page, email, "feil-passord-123");
  await expect(page.getByText("Feil e-post eller passord.")).toBeVisible();

  await signIn(page, email);
  await expect(page).toHaveURL(new RegExp(`/innlogging-${id}$`));
});

test("uinnloggede brukere sendes til innlogging og tilbake etterpå", async ({ page }) => {
  const id = uniqueId();
  const email = `retur-${id}@example.test`;
  await signUp(page, "Rita Retur", email);
  await createOrganization(page, `Retur ${id}`);
  await signOut(page);

  await page.goto(`/retur-${id}/settings`);
  await expect(page).toHaveURL(new RegExp(`/login\\?next=%2Fretur-${id}%2Fsettings$`));
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Logg inn", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/retur-${id}/settings$`));
  await expect(page.getByRole("heading", { name: "Organisasjon", level: 2 })).toBeVisible();
});
