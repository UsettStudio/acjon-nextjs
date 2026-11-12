import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { createOrganization, field, signOut, signUp, uniqueId } from "./helpers";

/** Kartverket nås ikke fra testmiljøet. Adressesøket og kartflisene får faste svar. */
async function mockKartverket(page: Page) {
  await page.route("https://ws.geonorge.no/adresser/v1/sok**", (route) =>
    route.fulfill({
      json: {
        metadata: { totaltAntallTreff: 1 },
        adresser: [
          {
            adressetekst: "Fjordveien 1",
            adressekode: 12345,
            nummer: 1,
            bokstav: "",
            kommunenummer: "0301",
            kommunenavn: "OSLO",
            postnummer: "0150",
            poststed: "OSLO",
            representasjonspunkt: { epsg: "EPSG:4258", lat: 59.9075, lon: 10.7398 },
          },
        ],
      },
    }),
  );
  // 1 × 1 piksel PNG
  const tile = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64",
  );
  await page.route("https://cache.kartverket.no/**", (route) => route.fulfill({ body: tile, contentType: "image/png" }));
}

/** 24 leiligheter i fire etasjer, seks per etasje, fordelt på to bygg. Semikolon og norsk tallformat, som fra Excel. */
function unitsCsv(priceOfFirst = 3_200_000): string {
  const rows = ["Leilighet nr.;Etasje;Rom;Soverom;BRA-i (m²);Pris;Omkostninger;Felleskost./mnd.;Status;Byggetrinn;Bygg"];
  for (let floor = 1; floor <= 4; floor++) {
    for (let number = 1; number <= 6; number++) {
      const index = (floor - 1) * 6 + number;
      const price = index === 1 ? priceOfFirst : 3_200_000 + index * 85_000;
      const status = index % 7 === 0 ? "Solgt" : index % 5 === 0 ? "Reservert" : "Ledig";
      rows.push(
        [
          `A-${floor}0${number}`,
          `${floor}. etg`,
          String(2 + (number % 3)),
          String(1 + (number % 3)),
          `${54 + number},5`,
          price.toLocaleString("nb-NO"),
          String(Math.round(price * 0.025)),
          "3 450",
          status,
          "Trinn 1",
          number <= 3 ? "Bygg A" : "Bygg B",
        ].join(";"),
      );
    }
  }
  return `${rows.join("\r\n")}\r\n`;
}

async function importCsv(page: Page, csv: string) {
  await page.getByRole("button", { name: "Importer", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Importer enheter" });
  await dialog.locator('input[type="file"]').setInputFiles({ name: "enheter.csv", mimeType: "text/csv", buffer: Buffer.from(csv, "utf8") });
  await expect(dialog.getByText("enheter.csv: 24 rader.")).toBeVisible();
  await expect(dialog.getByRole("combobox", { name: "Importer Leilighet nr. som" })).toHaveText("Enhetsnummer");
  await expect(dialog.getByRole("combobox", { name: "Importer Felleskost./mnd. som" })).toHaveText("Felleskostnader per måned");
  await dialog.getByRole("button", { name: "Forhåndsvis" }).click();
  return dialog;
}

test("oppretter prosjekt med veiviseren, importerer 24 enheter og redigerer i tabellen", async ({ page, context }) => {
  test.setTimeout(120_000);
  const id = uniqueId();
  const orgSlug = `fase1-${id}`;
  await mockKartverket(page);

  await signUp(page, "Pia Prosjekt", `prosjekt-${id}@example.test`);
  await createOrganization(page, `Fase1 ${id}`);
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}$`));

  // Veiviser: prosjekt, beliggenhet fra Kartverket, fremdrift og kontakt, byggetrinn
  await page.getByRole("navigation", { name: "Hovedmeny" }).getByRole("link", { name: "Prosjekter" }).click();
  await page.getByRole("link", { name: "Nytt prosjekt" }).first().click();
  await field(page, "Prosjektnavn").fill("Fjordparken");
  await page.getByRole("combobox", { name: "Fase" }).click();
  await page.getByRole("option", { name: "I salg" }).click();
  await page.getByRole("button", { name: "Neste" }).click();

  await expect(page.getByRole("heading", { name: "Hvor ligger prosjektet?" })).toBeFocused();
  await page.getByRole("combobox", { name: "Søk etter adresse" }).fill("Fjordveien 1");
  await page.getByRole("option", { name: /Fjordveien 1/ }).click();
  await expect(field(page, "Gateadresse")).toHaveValue("Fjordveien 1");
  await expect(field(page, "Postnummer")).toHaveValue("0150");
  await expect(field(page, "Poststed")).toHaveValue("Oslo");
  await expect(field(page, "Breddegrad")).toHaveValue("59,9075");
  await page.getByRole("button", { name: "Neste" }).click();

  await field(page, "Tidspunkt").nth(2).fill("Høsten 2027");
  await page.getByRole("button", { name: "Legg til kontaktperson" }).click();
  await field(page, "Navn").fill("Kari Megler");
  await field(page, "E-post").fill("kari@example.test");
  await page.getByRole("button", { name: "Neste" }).click();

  await page.getByRole("button", { name: "Legg til byggetrinn" }).click();
  await expect(field(page, "Navn på byggetrinn")).toHaveValue("Trinn 1");
  await page.getByRole("button", { name: "Opprett prosjekt" }).click();

  await expect(page).toHaveURL(new RegExp(`/${orgSlug}/projects/fjordparken/units$`));
  await expect(page.getByRole("heading", { name: "Fjordparken", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ingen enheter ennå" })).toBeVisible();

  // Import av 24 enheter fra CSV
  let dialog = await importCsv(page, unitsCsv());
  await expect(dialog.getByText("24 nye enheter")).toBeVisible();
  await expect(dialog.getByText("Ingen feil")).toBeVisible();
  await dialog.getByRole("button", { name: "Importer 24 rader" }).click();
  await expect(dialog.getByText("Importen er ferdig.").first()).toBeVisible();
  await expect(dialog.getByText("24 nye enheter")).toBeVisible();
  await expect(dialog.getByText("Opprettet ingen byggetrinn og 2 bygg.")).toBeVisible();
  await dialog.getByRole("button", { name: "Lukk" }).first().click();
  await expect(page.getByText("Viser 24 av 24 enheter")).toBeVisible();

  const row = (unit: string) => page.getByRole("row").filter({ has: page.getByRole("rowheader", { name: unit }) });
  await expect(row("A-101")).toContainText("3 200 000 kr");
  await expect(row("A-101")).toContainText("Bygg A");

  // Redigering i cellen: ny pris med norsk tallformat
  await row("A-101").getByRole("button", { name: /3 200 000 kr/ }).click();
  const priceInput = page.getByRole("textbox", { name: "Pris for A-101" });
  await priceInput.fill("3 350 000");
  await priceInput.press("Enter");
  await expect(row("A-101")).toContainText("3 350 000 kr");

  // En annen fane med samme tabell får endringen i sanntid
  const other = await context.newPage();
  await other.goto(`/${orgSlug}/projects/fjordparken/units`);
  const otherRow = other.getByRole("row").filter({ has: other.getByRole("rowheader", { name: "A-102" }) });
  await expect(otherRow).toContainText("Ledig");
  await expect(other.getByText("Oppdateres i sanntid")).toBeVisible();

  // Statusendring fra tabellen, med logg
  await row("A-102").getByRole("button", { name: /Status for A-102: Ledig/ }).click();
  await page.getByRole("menuitem", { name: "Solgt" }).click();
  await expect(page.getByText("Status for A-102 er endret til «Solgt».")).toBeVisible();
  await expect(otherRow).toContainText("Solgt", { timeout: 5_000 });
  await other.close();

  await row("A-102").getByRole("button", { name: "Handlinger for A-102" }).click();
  await page.getByRole("menuitem", { name: "Statuslogg" }).click();
  const history = page.getByRole("dialog", { name: "Statuslogg for A-102" });
  await expect(history.getByText(/Pia Prosjekt, .* \(tabellen\)/)).toBeVisible();
  await page.keyboard.press("Escape");

  // Filter på status
  await page.getByRole("button", { name: /^Solgt/ }).click();
  await expect(page.getByText(/Viser \d av 24 enheter/)).toBeVisible();
  await page.getByRole("button", { name: "Nullstill filtre" }).first().click();

  // Ny import med samme enhetsnumre oppdaterer i stedet for å opprette
  dialog = await importCsv(page, unitsCsv(3_400_000));
  await expect(dialog.getByText("24 enheter oppdateres")).toBeVisible();
  await dialog.getByRole("button", { name: "Importer 24 rader" }).click();
  await expect(dialog.getByText("Ingen nye enheter")).toBeVisible();
  await expect(dialog.getByText("2 enheter oppdatert")).toBeVisible();
  await dialog.getByRole("button", { name: "Lukk" }).first().click();
  await expect(row("A-101")).toContainText("3 400 000 kr");
  await expect(page.getByText("Viser 24 av 24 enheter")).toBeVisible();

  // Excel: prisliste med tittelrad over overskriftene, tall lagret som tall
  await page.getByRole("button", { name: "Importer", exact: true }).first().click();
  dialog = page.getByRole("dialog", { name: "Importer enheter" });
  await dialog.locator('input[type="file"]').setInputFiles(path.join(__dirname, "fixtures", "enheter.xlsx"));
  await expect(dialog.getByText("enheter.xlsx: 24 rader.")).toBeVisible();
  await expect(dialog.getByRole("combobox", { name: "Importer Bolignr som" })).toHaveText("Enhetsnummer");
  await expect(dialog.getByRole("combobox", { name: "Importer Prisantydning som" })).toHaveText("Pris");
  await dialog.getByRole("button", { name: "Forhåndsvis" }).click();
  await expect(dialog.getByText("24 nye enheter")).toBeVisible();
  await expect(dialog.getByRole("cell", { name: "3 285 000 kr" })).toBeVisible();
  await dialog.getByRole("button", { name: "Importer 24 rader" }).click();
  await expect(dialog.getByText("24 nye enheter")).toBeVisible();
  await dialog.getByRole("button", { name: "Lukk" }).first().click();
  await expect(page.getByText("Viser 48 av 48 enheter")).toBeVisible();
  await expect(row("B-101")).toContainText("3 285 000 kr");

  // Eksport til CSV kan leses av importen
  const response = await page.request.get(`/${orgSlug}/projects/fjordparken/units/export`);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/csv");
  const csv = await response.text();
  expect(csv.startsWith("﻿Enhetsnummer;Tittel;Type;Status")).toBe(true);
  expect(csv.split("\r\n").filter(Boolean)).toHaveLength(49);
  expect(csv).toContain("A-101;;Leilighet;Ledig;Trinn 1;Bygg A;1;3;2;;55,5;");
});

test("enhetsskjema med plantegning fra mediebiblioteket", async ({ page }) => {
  test.setTimeout(90_000);
  const id = uniqueId();
  const orgSlug = `skjema-${id}`;
  await mockKartverket(page);
  await signUp(page, "Siri Skjema", `skjema-${id}@example.test`);
  await createOrganization(page, `Skjema ${id}`);
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}$`));

  await page.goto(`/${orgSlug}/projects/new`);
  await field(page, "Prosjektnavn").fill("Skjemaparken");
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("button", { name: "Opprett prosjekt" }).click();
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}/projects/skjemaparken/units$`));

  // Ny enhet med pris; totalpris regnes ut mens du skriver
  await page.getByRole("link", { name: "Ny enhet" }).first().click();
  await field(page, "Enhetsnummer").fill("H0201");
  await page.getByRole("tab", { name: "Pris" }).click();
  await page.getByRole("textbox", { name: "Pris", exact: true }).fill("4 250 000");
  await page.getByRole("textbox", { name: "Omkostninger" }).fill("106 250");
  await page.getByRole("textbox", { name: "Fellesgjeld" }).fill("500 000");
  await expect(page.getByText("4 356 250 kr")).toBeVisible();
  await expect(page.getByText("4 856 250 kr")).toBeVisible();
  await page.getByRole("button", { name: "Opprett enhet" }).click();
  await expect(page.getByRole("heading", { name: "Enhet H0201" })).toBeVisible();

  // Plantegning: last opp i filvelgeren, velg og lagre
  await page.getByRole("tab", { name: "Plantegninger og bilder" }).click();
  await page.getByRole("button", { name: "Legg til" }).first().click();
  const picker = page.getByRole("dialog", { name: "Legg til i «Plantegninger»" });
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==",
    "base64",
  );
  await picker.locator('input[type="file"]').setInputFiles({ name: "plantegning.png", mimeType: "image/png", buffer: png });
  await expect(picker.getByText("Ferdig")).toBeVisible({ timeout: 20_000 });
  await picker.getByRole("button", { name: "Legg til 1 fil" }).click();
  await expect(picker).toBeHidden();
  await expect(page.getByRole("tabpanel").getByText("plantegning.png")).toBeVisible();
  await page.getByRole("button", { name: "Lagre", exact: true }).click();
  await expect(page.getByText("Endringene er lagret.")).toBeVisible();

  await page.reload();
  await page.getByRole("tab", { name: "Plantegninger og bilder" }).click();
  await expect(page.getByRole("tabpanel").getByText("plantegning.png")).toBeVisible();

  // Filen ligger i mediebiblioteket med WebP-variant
  await page.getByRole("navigation", { name: "Hovedmeny" }).getByRole("link", { name: "Mediebibliotek" }).click();
  await expect(page.getByRole("heading", { name: "Mediebibliotek", level: 1 })).toBeVisible();
  const asset = page.getByRole("button", { name: /^plantegning\.png/ });
  await expect(asset).toBeVisible();
  const thumbnail = asset.locator("img");
  await expect(thumbnail).toHaveAttribute("src", /\/w2\.webp$/);
});

test("megler kan endre status og pris, men ikke resten av enheten", async ({ page }) => {
  test.setTimeout(90_000);
  const id = uniqueId();
  const orgSlug = `megler-${id}`;
  const agentEmail = `megler-${id}@example.test`;
  await mockKartverket(page);
  await signUp(page, "Ola Eier", `eier-${id}@example.test`);
  await createOrganization(page, `Megler ${id}`);
  await expect(page).toHaveURL(new RegExp(`/${orgSlug}$`));

  // Eier oppretter prosjekt med tre enheter
  await page.goto(`/${orgSlug}/projects/new`);
  await field(page, "Prosjektnavn").fill("Meglerhagen");
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("button", { name: "Opprett prosjekt" }).click();
  await expect(page).toHaveURL(new RegExp(`/projects/meglerhagen/units$`));
  await page.getByRole("button", { name: "Importer", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Importer enheter" });
  await dialog.locator('input[type="file"]').setInputFiles({
    name: "tre.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Nr;Etasje;Pris\nC-1;1;2 900 000\nC-2;1;3 100 000\nC-3;2;3 400 000\n", "utf8"),
  });
  await dialog.getByRole("button", { name: "Forhåndsvis" }).click();
  await dialog.getByRole("button", { name: "Importer 3 rader" }).click();
  await expect(dialog.getByText("3 nye enheter")).toBeVisible();
  await dialog.getByRole("button", { name: "Lukk" }).first().click();

  // Eier inviterer en megler med tilgang til prosjektet
  await page.goto(`/${orgSlug}/settings/members`);
  await page.getByRole("button", { name: "Inviter bruker" }).click();
  const invite = page.getByRole("dialog");
  await invite.getByLabel("E-post").fill(agentEmail);
  await invite.getByRole("combobox", { name: "Rolle" }).click();
  await page.getByRole("option", { name: "Megler" }).click();
  await invite.getByLabel("Meglerhagen").check();
  await invite.getByRole("button", { name: "Send invitasjon" }).click();
  const link = await invite.getByLabel("Invitasjonslenke").inputValue();
  await invite.getByRole("button", { name: "Ferdig" }).click();
  await signOut(page);

  await page.goto(link);
  await page.getByRole("link", { name: "Opprett konto" }).click();
  await field(page, "Navn").fill("Mia Megler");
  await field(page, "Passord").fill("riktig-hest-batteri-stift");
  await page.getByRole("button", { name: "Opprett konto" }).click();
  await page.getByRole("button", { name: "Godta invitasjonen" }).click();
  await expect(page.getByText("Din rolle: Megler")).toBeVisible();

  // Megleren ser prosjektet, men ikke import, ny enhet eller innstillinger
  await page.goto(`/${orgSlug}/projects/meglerhagen/units`);
  await expect(page.getByText("Viser 3 av 3 enheter")).toBeVisible();
  await expect(page.getByRole("button", { name: "Importer", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ny enhet" })).toHaveCount(0);
  // Verken organisasjonens eller prosjektets innstillinger vises for meglere
  await expect(page.getByRole("link", { name: "Innstillinger", exact: true })).toHaveCount(0);
  const row = page.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "C-1" }) });

  // Etasje kan ikke endres, pris kan
  await expect(row.getByRole("button", { name: /^1, endre$/ })).toHaveCount(0);
  await row.getByRole("button", { name: /2 900 000 kr/ }).click();
  const price = page.getByRole("textbox", { name: "Pris for C-1" });
  await price.fill("2 950 000");
  await price.press("Enter");
  await expect(row).toContainText("2 950 000 kr");

  // Status kan endres. Tabellen kan tegnes på nytt når prisendringen er lagret og
  // kommer tilbake i sanntid, og da lukkes en åpen meny. Prøv til menyen står åpen.
  await expect(async () => {
    await row.getByRole("button", { name: /Status for C-1: Ledig/ }).click();
    await expect(page.getByRole("menuitem", { name: "Reservert" })).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await page.getByRole("menuitem", { name: "Reservert" }).click();
  await expect(page.getByText("Status for C-1 er endret til «Reservert».")).toBeVisible();

  // I enhetsskjemaet er bare prisfeltene åpne
  await page.getByRole("link", { name: "C-1", exact: true }).click();
  await expect(page.getByText("Som megler kan du endre status og pris.")).toBeVisible();
  await expect(field(page, "Enhetsnummer")).toBeDisabled();
  await page.getByRole("tab", { name: "Pris" }).click();
  await expect(page.getByRole("textbox", { name: "Pris", exact: true })).toBeEnabled();

  // Innstillingene for prosjektet finnes ikke for megleren
  await page.goto(`/${orgSlug}/projects/meglerhagen/settings`);
  await expect(page.getByRole("heading", { name: "Fant ikke siden" })).toBeVisible();
});
