import { expect, test } from "@playwright/test";

import { createOrganization, deleteEmails, field, latestEmail, signOut, signUp, uniqueId } from "./helpers";

test("innlogging med lenke på e-post og nytt passord via «Glemt passordet?»", async ({ page }) => {
  const id = uniqueId();
  const email = `epost-${id}@example.test`;
  await signUp(page, "Erik Epost", email);
  await createOrganization(page, `Epost ${id}`);
  await signOut(page);

  // Innloggingslenke: norsk e-post med token_hash-lenke til /auth/confirm
  await field(page, "E-post").fill(email);
  await page.getByRole("button", { name: "Send meg en innloggingslenke i stedet" }).click();
  await expect(page.getByText(`Vi har sendt en innloggingslenke til ${email}`)).toBeVisible();
  const magicLink = await latestEmail(email);
  expect(magicLink.subject).toBe("Innloggingslenke");
  expect(magicLink.link).toContain("/auth/confirm?next=");
  expect(magicLink.link).toContain("token_hash=");
  await page.goto(magicLink.link);
  await expect(page).toHaveURL(new RegExp(`/epost-${id}$`));
  await signOut(page);

  // Glemt passord
  await deleteEmails(email);
  await page.goto("/forgot-password");
  await field(page, "E-post").fill(email);
  await page.getByRole("button", { name: "Send lenke" }).click();
  await expect(page.getByText(`Hvis det finnes en konto for ${email}`)).toBeVisible();
  const resetLink = await latestEmail(email);
  expect(resetLink.subject).toBe("Lag nytt passord");
  await page.goto(resetLink.link);
  await expect(page).toHaveURL(/\/reset-password$/);
  await field(page, "Nytt passord").fill("et-helt-nytt-passord");
  await field(page, "Gjenta passordet").fill("et-helt-nytt-passord");
  await page.getByRole("button", { name: "Lagre passord" }).click();
  await expect(page).toHaveURL(new RegExp(`/epost-${id}$`));
  await signOut(page);

  // Det nye passordet virker
  await field(page, "E-post").fill(email);
  await field(page, "Passord").fill("et-helt-nytt-passord");
  await page.getByRole("button", { name: "Logg inn", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/epost-${id}$`));
});

test("ugyldig eller brukt lenke gir tydelig melding", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=ugyldig&type=email&next=%2F");
  await expect(page).toHaveURL(/\/login\?error=link$/);
  await expect(page.getByText("Lenken er ugyldig eller utløpt. Be om en ny.")).toBeVisible();
});
