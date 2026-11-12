import { expect, test, type Page } from "@playwright/test";

import { anonymousPage, buildSelector, facadeImage, IMAGE_HEIGHT, IMAGE_WIDTH, pointIn, setUpProject } from "./boligvelger";
import { createOrganization, emailTo, field, signUp, uniqueId } from "./helpers";
import { createAndPublishSite, publish, siteAddress } from "./site";
import { waiveLaunchForPage } from "./support/launch";

/** Legger til en kontaktperson som får varsel om leads. */
async function addLeadContact(page: Page, orgSlug: string, email: string) {
  await page.goto(`/${orgSlug}/projects/solsiden/settings`);
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Legg til kontaktperson" }) });
  await form.getByRole("button", { name: "Legg til kontaktperson" }).click();
  await form.getByLabel("Navn", { exact: true }).fill("Mia Megler");
  await form.getByLabel("E-post", { exact: true }).fill(email);
  await expect(form.getByLabel("Får varsel om nye leads")).toBeChecked();
  await form.getByRole("button", { name: "Lagre" }).click();
  await expect(page.getByText("Endringene er lagret.")).toBeVisible();
}

test("akseptkriterium 5: besøkende filtrerer, åpner en enhet og sender interesseskjema; leadet vises i admin og kontaktpersonen får e-post", async ({
  page,
  browser,
}) => {
  test.setTimeout(240_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);
  const agentEmail = `megler-${id}@example.test`;
  const buyerEmail = `kari-${id}@example.test`;
  await addLeadContact(page, orgSlug, agentEmail);
  const selectorId = await buildSelector(page, orgSlug);

  // Egne felt: takhøyde på A-302, gjort offentlig i prosjektinnstillingene
  await page.goto(`/${orgSlug}/projects/solsiden/units`);
  await page.getByRole("link", { name: "A-302", exact: true }).click();
  await page.getByRole("tab", { name: "Egne felt" }).click();
  await page.getByRole("button", { name: "Legg til felt" }).click();
  await field(page, "Navn").fill("Takhøyde");
  await field(page, "Verdi").fill("2,7 m");
  await page.getByRole("button", { name: "Lagre", exact: true }).click();
  await expect(page.getByText("Endringene er lagret.")).toBeVisible();
  await page.goto(`/${orgSlug}/projects/solsiden/settings`);
  const publicFields = page.locator("form").filter({ has: page.getByLabel("Takhøyde") });
  await publicFields.getByLabel("Takhøyde").check();
  await publicFields.getByRole("button", { name: "Lagre" }).click();
  await expect(page.getByText("Endringene er lagret.")).toBeVisible();

  const subdomain = `solsiden-${id}`;
  await createAndPublishSite(page, orgSlug, /^Full prosjektside/, subdomain);
  await publish(page);

  // Besøkende uten innlogging på underdomenet
  const visitor = await anonymousPage(browser);
  await visitor.page.goto(siteAddress(subdomain));
  await expect(visitor.page.getByRole("heading", { level: 1, name: "Solsiden" })).toBeVisible();
  await expect(visitor.page.locator("html")).toHaveAttribute("lang", "nb");

  // Filtrer på 3 rom og ledig i boligvelgeren
  await visitor.page.getByRole("button", { name: "3 rom", exact: true }).click();
  await visitor.page.getByRole("button", { name: "Ledig", exact: true }).click();
  await expect(visitor.page.getByText("Viser 2 av 6 boliger")).toBeVisible();
  const row = visitor.page.locator('tr[data-unit-number="A-302"]');
  await expect(row).toBeVisible();
  await expect(visitor.page.locator('tr[data-unit-number="A-303"]')).toHaveCount(0);

  // Åpne enheten og meld interesse fra enhetssiden
  await row.click();
  await visitor.page.getByRole("link", { name: "Se bolig" }).click();
  await expect(visitor.page).toHaveURL(siteAddress(subdomain, "/bolig/a-302"));
  await expect(visitor.page.getByRole("heading", { name: "A-302", level: 1 })).toBeVisible();
  const facts = visitor.page.locator("section", { has: visitor.page.getByRole("heading", { name: "Nøkkelinformasjon" }) });
  await expect(facts.getByText("Takhøyde")).toBeVisible();
  await expect(facts.getByText("2,7 m")).toBeVisible();
  const form = visitor.page.locator("#interesse form");
  await form.getByLabel("Navn").fill("Kari Kjøper");
  await form.getByLabel("E-post").fill(buyerEmail);
  await form.getByLabel("Telefon").fill("+47 912 34 567");
  await form.getByLabel("Beskjed (valgfritt)").fill("Er balkongen mot sør?");
  // Uten samtykke sendes ingenting
  await form.getByRole("button", { name: "Send" }).click();
  await expect(form.getByText("Du må samtykke for at vi skal kunne kontakte deg.")).toBeVisible();
  await form.getByRole("checkbox", { name: /^Jeg samtykker til at/ }).check();
  await form.getByRole("button", { name: "Send" }).click();
  await expect(visitor.page.getByText("Takk for interessen!")).toBeVisible();

  // Leadet vises i admin med riktig enhet
  await page.goto(`/${orgSlug}/leads`);
  const leadRow = page.getByRole("row").filter({ hasText: "Kari Kjøper" });
  await expect(leadRow).toContainText("A-302");
  await expect(leadRow).toContainText("Solsiden");
  await expect(leadRow).toContainText("Ny");
  await leadRow.getByRole("link", { name: "Kari Kjøper" }).click();
  await expect(page.getByTestId("lead-unit")).toHaveText("A-302");
  await expect(page.getByText("Er balkongen mot sør?")).toBeVisible();
  await expect(page.getByText(/Samtykke til kontakt gitt .+ med tekstversjon samtykke-2026-11-12/)).toBeVisible();
  await expect(page.getByText(/E-post sendt til kontaktpersonene/)).toBeVisible();

  // Kontaktpersonen får e-post, og avsenderen får kvittering
  const notification = await emailTo(agentEmail);
  expect(notification.subject).toBe("Ny interessent for A-302 i Solsiden");
  expect(notification.text).toContain("Kari Kjøper");
  expect(notification.text).toContain("+47 912 34 567");
  const receipt = await emailTo(buyerEmail);
  expect(receipt.subject).toBe("Vi har mottatt henvendelsen din om Solsiden");

  // Oppfølging: status og internt notat
  await page.getByRole("radio", { name: "Kontaktet" }).check();
  await page.getByLabel("Internt notat").fill("Ringt opp, sender prospekt.");
  await page.getByRole("button", { name: "Lagre" }).click();
  await expect(page.getByText("Henvendelsen er oppdatert.")).toBeVisible();

  // Filter og eksport
  await page.goto(`/${orgSlug}/leads?status=contacted`);
  await expect(page.getByRole("row").filter({ hasText: "Kari Kjøper" })).toBeVisible();
  await page.goto(`/${orgSlug}/leads?status=closed`);
  await expect(page.getByText("Ingen leads passer filtrene")).toBeVisible();
  const csv = await page.request.get(`/${orgSlug}/leads/export?status=contacted`);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const body = await csv.text();
  expect(body).toContain("Kari Kjøper");
  expect(body).toContain("A-302");
  expect(body).toContain("Ringt opp, sender prospekt.");

  // Prosjektoversikten viser siste leads
  await page.goto(`/${orgSlug}/projects/solsiden`);
  await expect(page.getByRole("heading", { name: "Siste leads" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kari Kjøper" })).toBeVisible();

  // Statusendring tømmer mellomlageret: en ny sidevisning viser ny status med en gang (HTML fra serveren)
  const before = await (await visitor.page.goto(siteAddress(subdomain)))?.text();
  expect(unitRow(before, "A-101")).toContain("Ledig");
  await page.goto(`/${orgSlug}/projects/solsiden/selectors/${selectorId}`);
  await page.getByRole("radio", { name: "Status" }).click();
  await page.getByTestId("editor-canvas").getByRole("button", { name: "A-101, Ledig" }).click();
  await page.getByRole("radio", { name: "Solgt" }).click();
  await page.getByRole("button", { name: "Lagre status" }).click();
  await expect(page.getByText("A-101 er satt til Solgt.")).toBeVisible();
  const changedAt = Date.now();
  const after = await (await visitor.page.goto(siteAddress(subdomain)))?.text();
  expect(unitRow(after, "A-101")).toContain("Solgt");
  const unitPage = await (await visitor.page.goto(siteAddress(subdomain, "/bolig/a-101")))?.text();
  expect(unitPage).toMatch(/data-testid="unit-status"[^>]*>(<[^>]+>)*Solgt/);
  expect(Date.now() - changedAt).toBeLessThan(5_000);
  await visitor.context.close();
});

/** Raden for en enhet i HTML-en fra serveren. */
function unitRow(html: string | undefined, unitNumber: string): string {
  return new RegExp(`<tr[^>]*data-unit-number="${unitNumber}"[\\s\\S]*?</tr>`).exec(html ?? "")?.[0] ?? "";
}

/** 24 leiligheter i fire etasjer med seks per etasje, som vinduene i fasadebildet. */
function twentyFourUnitsCsv(): string {
  const rows = ["Nr;Etasje;Rom;BRA-i;Pris;Status"];
  for (let floor = 1; floor <= 4; floor++) {
    for (let number = 1; number <= 6; number++) {
      const index = (floor - 1) * 6 + number;
      rows.push([`A-${floor}0${number}`, String(floor), String(2 + (number % 3)), `${50 + number * 4}`, (3_000_000 + index * 95_000).toLocaleString("nb-NO"), "Ledig"].join(";"));
    }
  }
  return `${rows.join("\n")}\n`;
}

/** Vinduet i rad (0 = øverst) og kolonne i fasadebildet, med litt luft innenfor kantene. */
function windowRect(row: number, column: number) {
  const x = 380 + column * 280;
  const y = 260 + row * 270;
  return {
    from: [(x + 12) / IMAGE_WIDTH, (y + 12) / IMAGE_HEIGHT] as const,
    to: [(x + 168) / IMAGE_WIDTH, (y + 148) / IMAGE_HEIGHT] as const,
  };
}

test("akseptkriterium 1 til publisering: ny bruker importerer 24 enheter, markerer og kobler alle, velger mal og publiserer på underdomene", async ({
  page,
  browser,
}) => {
  test.setTimeout(420_000);
  const id = uniqueId();
  await signUp(page, "Per Prosjekt", `ac1-${id}@example.test`);
  await createOrganization(page, `Utbygger ${id}`);
  const orgSlug = `utbygger-${id}`;
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}$`));

  // Nytt prosjekt fra menyen
  await page.getByRole("link", { name: "Prosjekter", exact: true }).click();
  await page.getByRole("link", { name: "Nytt prosjekt" }).first().click();
  await field(page, "Prosjektnavn").fill("Fjordparken");
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("button", { name: "Opprett prosjekt" }).click();
  await expect(page).toHaveURL(new RegExp(`/projects/fjordparken/units$`));

  // Prosjektets oversikt viser fremdriften i oppstarten som sjekkliste
  await page.getByRole("navigation", { name: "Prosjektmeny" }).getByRole("link", { name: "Oversikt" }).click();
  const checklist = page.locator("[data-slot=card]").filter({ has: page.getByRole("heading", { name: "Kom i gang" }) });
  await expect(checklist.getByText("2 av 7 steg er fullført.")).toBeVisible();
  await expect(checklist.getByRole("link", { name: "Legg inn enheter" })).toBeVisible();
  await page.getByRole("link", { name: "Enheter", exact: true }).click();

  // 24 enheter fra CSV
  await page.getByRole("button", { name: "Importer", exact: true }).first().click();
  const importDialog = page.getByRole("dialog", { name: "Importer enheter" });
  await importDialog.locator('input[type="file"]').setInputFiles({ name: "enheter.csv", mimeType: "text/csv", buffer: Buffer.from(twentyFourUnitsCsv(), "utf8") });
  await importDialog.getByRole("button", { name: "Forhåndsvis" }).click();
  await importDialog.getByRole("button", { name: "Importer 24 rader" }).click();
  await expect(importDialog.getByText("24 nye enheter")).toBeVisible();
  await importDialog.getByRole("button", { name: "Lukk" }).first().click();

  // Boligvelger med fasadebilde
  await page.getByRole("link", { name: "Boligvelger", exact: true }).click();
  await page.getByRole("button", { name: "Ny boligvelger" }).click();
  await page.getByRole("button", { name: "Opprett og åpne" }).click();
  await expect(page).toHaveURL(/\/selectors\/[0-9a-f-]{36}$/);
  await page.getByRole("button", { name: "Legg til første visning" }).click();
  const viewDialog = page.getByRole("dialog", { name: "Ny visning" });
  await viewDialog.getByRole("button", { name: "Velg bilde" }).click();
  const picker = page.getByRole("dialog", { name: "Velg bilde" });
  await picker.locator('input[type="file"]').setInputFiles({ name: "fasade.png", mimeType: "image/png", buffer: await facadeImage() });
  await expect(picker.getByRole("button", { name: "fasade.png" })).toHaveAttribute("aria-pressed", "true", { timeout: 30_000 });
  await picker.getByRole("button", { name: "Legg til 1 fil" }).click();
  await viewDialog.getByRole("button", { name: "Legg til visning" }).click();
  const canvas = page.getByTestId("editor-canvas");
  const image = canvas.locator("img");
  await expect(image).toBeVisible();

  // Marker alle 24 vinduene
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 6; column++) {
      await page.getByRole("button", { name: "Rektangel (R)" }).click();
      const rect = windowRect(row, column);
      const from = await pointIn(image, rect.from);
      const to = await pointIn(image, rect.to);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2);
      await page.mouse.move(to.x, to.y);
      await page.mouse.up();
    }
  }
  await expect(page.getByText(/^24 markeringer i visningen/)).toBeVisible();

  // Koble hver markering til enheten i samme etasje og kolonne
  await page.getByRole("radio", { name: "Koble" }).click();
  await expect(page.getByText("0 av 24 enheter markert")).toBeVisible();
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 6; column++) {
      const marker = row * 6 + column + 1;
      await canvas.getByRole("button", { name: `Markering ${marker}, ikke koblet` }).click();
      await page.getByRole("button", { name: new RegExp(`^A-${4 - row}0${column + 1}`) }).click();
    }
  }
  await expect(page.getByText("24 av 24 enheter markert")).toBeVisible();
  await expect(page.getByText("Alle endringer er lagret")).toBeVisible({ timeout: 15_000 });
  // Lanseringen med oppstartsavgift testes i fase6.spec.ts. Her lanseres prosjektet uten avgift.
  await waiveLaunchForPage(page);
  await page.getByRole("button", { name: "Publiser", exact: true }).click();
  await expect(page.getByText("Boligvelgeren er publisert.")).toBeVisible();

  // Prosjektside fra mal, med endring i forhåndsvisningen
  await page.getByRole("link", { name: "Prosjektside", exact: true }).click();
  const subdomain = `fjordparken-${id}`;
  await page.getByRole("radio", { name: /^Full prosjektside/ }).check();
  await field(page, "Adresse").fill(subdomain);
  await page.getByRole("button", { name: "Lag prosjektside" }).click();
  await expect(page.getByRole("list", { name: "Blokker på siden" })).toBeVisible();
  const preview = page.frameLocator('iframe[title="Forhåndsvisning av siden"]');
  await expect(preview.getByRole("heading", { level: 1, name: "Fjordparken" })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /^Hero/ }).click();
  await field(page, "Tittel").fill("Fjordparken ved sjøen");
  await expect(preview.getByRole("heading", { level: 1, name: "Fjordparken ved sjøen" })).toBeVisible();
  await expect(page.getByText("Utkastet er lagret")).toBeVisible({ timeout: 10_000 });

  // Delt forhåndsvisning uten innlogging før publisering
  await page.getByRole("button", { name: "Flere valg", exact: true }).click();
  await page.getByRole("menuitem", { name: "Del forhåndsvisning" }).click();
  const shareLink = page.getByLabel("Lenke til forhåndsvisningen");
  await expect(shareLink).toHaveValue(/\/preview\//);
  const previewUrl = await shareLink.inputValue();
  await page.keyboard.press("Escape");
  const reviewer = await anonymousPage(browser);
  await reviewer.page.goto(previewUrl);
  await expect(reviewer.page.getByText(/Forhåndsvisning av utkastet/)).toBeVisible();
  await expect(reviewer.page.getByRole("heading", { level: 1, name: "Fjordparken ved sjøen" })).toBeVisible();
  await reviewer.context.close();

  await publish(page);

  // Den publiserte siden på underdomenet viser boligvelgeren med alle 24 enhetene
  const visitor = await anonymousPage(browser);
  await visitor.page.goto(siteAddress(subdomain));
  await expect(visitor.page.getByRole("heading", { level: 1, name: "Fjordparken ved sjøen" })).toBeVisible();
  await expect(visitor.page.locator("a[data-unit-number]")).toHaveCount(24);
  await expect(visitor.page.getByText("Viser 24 av 24 boliger")).toBeVisible();

  // SEO: kanonisk adresse, Open Graph, strukturerte data, sitemap og robots
  await expect(visitor.page.locator('link[rel="canonical"]')).toHaveAttribute("href", siteAddress(subdomain));
  await expect(visitor.page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Fjordparken/);
  await expect(visitor.page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
  // Hentes gjennom nettleseren, som slår opp *.localhost selv (Node gjør det ikke).
  const sitemap = await (await visitor.page.goto(siteAddress(subdomain, "/sitemap.xml")))?.text();
  expect(sitemap).toContain(siteAddress(subdomain, "/bolig/a-101"));
  const robots = await (await visitor.page.goto(siteAddress(subdomain, "/robots.txt")))?.text();
  expect(robots).toContain(`Sitemap: ${siteAddress(subdomain, "/sitemap.xml")}`);

  // Alle stegene i oppstarten er gjort: sjekklisten er borte, og oversikten viser verdi solgt
  await page.getByRole("navigation", { name: "Prosjektmeny" }).getByRole("link", { name: "Oversikt" }).click();
  await expect(page.getByText("Verdi solgt")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kom i gang" })).toHaveCount(0);
  await page.getByRole("link", { name: "Prosjektside", exact: true }).click();

  // Versjonshistorikken har den publiserte versjonen
  await page.getByRole("button", { name: "Flere valg", exact: true }).click();
  await page.getByRole("menuitem", { name: "Versjonshistorikk for siden" }).click();
  await expect(page.getByText("Versjon 1")).toBeVisible();
  await expect(page.getByText("Publisert nå")).toBeVisible();
  await visitor.context.close();
});
