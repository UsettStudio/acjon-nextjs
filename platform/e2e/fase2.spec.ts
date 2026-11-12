import { expect, test } from "@playwright/test";

import { A101, anonymousPage, buildSelector, IMAGE_HEIGHT, IMAGE_WIDTH, setUpProject } from "./boligvelger";
import { uniqueId } from "./helpers";

test("akseptkriterium 2: status fra Status-modus vises i publisert velger, liste og enhetsside innen fem sekunder", async ({ page, browser }) => {
  test.setTimeout(180_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);
  const selectorId = await buildSelector(page, orgSlug);

  // Kjøper uten innlogging: publisert velger og enhetssiden for A-302
  const buyer = await anonymousPage(browser);
  await buyer.page.goto(`/embed/selector/${selectorId}`);
  const shape = buyer.page.locator('a[data-unit-number="A-302"]');
  const row = buyer.page.locator('tr[data-unit-number="A-302"]');
  await expect(shape).toHaveAttribute("data-status", "available");
  await expect(row).toContainText("Ledig");
  await expect(row).toContainText("4 250 000 kr");
  await expect(buyer.page.getByTestId("selector-live")).toHaveAttribute("data-live", "live", { timeout: 15_000 });

  const unitPage = await buyer.context.newPage();
  await unitPage.goto(`/embed/selector/${selectorId}/bolig/a-302`);
  await expect(unitPage.getByRole("heading", { name: "A-302", level: 1 })).toBeVisible();
  await expect(unitPage.getByTestId("unit-status")).toHaveText("Ledig");
  await expect(unitPage.getByTestId("unit-price")).toHaveText("4 250 000 kr");
  await expect(unitPage.locator("article")).toHaveAttribute("data-live", "live", { timeout: 15_000 });

  // Verktøytips med status
  await shape.hover();
  await expect(buyer.page.getByTestId("selector-tooltip")).toContainText("A-302");
  await expect(buyer.page.getByTestId("selector-tooltip")).toContainText("Ledig");

  // Kunden setter A-302 til Solgt i Status-modus
  await page.getByRole("radio", { name: "Status" }).click();
  await expect(page.getByText("Oppdateres i sanntid")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("editor-canvas").getByRole("button", { name: "A-302, Ledig" }).click();
  await page.getByRole("radio", { name: "Solgt" }).click();
  await page.getByLabel("Notat (valgfritt)").fill("Kontrakt signert");
  await page.getByRole("button", { name: "Lagre status" }).click();
  await expect(page.getByText("A-302 er satt til Solgt.")).toBeVisible();
  const changedAt = Date.now();

  // Uten ny publisering: velgeren, enhetslisten og enhetssiden viser Solgt innen fem sekunder
  await expect(shape).toHaveAttribute("data-status", "sold", { timeout: 5_000 });
  await expect(row).toContainText("Solgt", { timeout: 5_000 });
  await expect(unitPage.getByTestId("unit-status")).toHaveText("Solgt", { timeout: 5_000 });
  expect(Date.now() - changedAt).toBeLessThan(5_000);
  // Prisen skjules på solgte enheter (standardinnstillingen for prosjektet)
  await expect(row).not.toContainText("4 250 000 kr");
  await expect(unitPage.getByTestId("unit-price")).toHaveText("Solgt");
  await expect(page.getByRole("button", { name: "Publisert" })).toBeDisabled();

  // Endringen står i loggen med bruker og tidspunkt
  await page.goto(`/${orgSlug}/projects/solsiden/units`);
  const adminRow = page.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "A-302" }) });
  await expect(adminRow).toContainText("Solgt");
  await adminRow.getByRole("button", { name: "Handlinger for A-302" }).click();
  await page.getByRole("menuitem", { name: "Statuslogg" }).click();
  const history = page.getByRole("dialog", { name: "Statuslogg for A-302" });
  await expect(history.getByText(/Stine Status, .+ \(boligvelgeren\)/)).toBeVisible();
  await expect(history.getByText("Kontrakt signert")).toBeVisible();
  await buyer.context.close();
});

test("akseptkriterium 3: markeringene ligger riktig over bildet på 360, 768 og 1920 px bredde", async ({ page, browser }) => {
  test.setTimeout(180_000);
  const id = uniqueId();
  const orgSlug = await setUpProject(page, id);
  const selectorId = await buildSelector(page, orgSlug);

  for (const width of [360, 768, 1920]) {
    const buyer = await anonymousPage(browser, { width, height: 900 });
    await buyer.page.goto(`/embed/selector/${selectorId}`);
    if (width < 1024) {
      // Mobil og nettbrett: listen vises først, bildet i egen fane
      await expect(buyer.page.getByRole("tab", { name: "Liste" })).toHaveAttribute("aria-selected", "true");
      await buyer.page.getByRole("tab", { name: "Bilde" }).click();
    }
    const image = buyer.page.getByTestId("selector-image");
    await expect(image).toBeVisible();
    const imageBox = await image.boundingBox();
    expect(imageBox).not.toBeNull();
    if (!imageBox) {
      continue;
    }
    // Bildet beholder formatet
    expect(Math.abs(imageBox.width / imageBox.height - IMAGE_WIDTH / IMAGE_HEIGHT)).toBeLessThan(0.01);

    const expectBox = async (unit: string, left: number, top: number, right: number, bottom: number) => {
      const box = await buyer.page.locator(`a[data-unit-number="${unit}"] polygon`).first().boundingBox();
      expect(box, `${unit} ved ${width} px`).not.toBeNull();
      if (!box) {
        return;
      }
      const tolerance = 1.5;
      expect(Math.abs(box.x - (imageBox.x + left * imageBox.width)), `${unit} venstre ved ${width} px`).toBeLessThan(tolerance);
      expect(Math.abs(box.y - (imageBox.y + top * imageBox.height)), `${unit} topp ved ${width} px`).toBeLessThan(tolerance);
      expect(Math.abs(box.x + box.width - (imageBox.x + right * imageBox.width)), `${unit} høyre ved ${width} px`).toBeLessThan(tolerance);
      expect(Math.abs(box.y + box.height - (imageBox.y + bottom * imageBox.height)), `${unit} bunn ved ${width} px`).toBeLessThan(tolerance);
    };
    await expectBox("A-302", 0.3, 0.2, 0.5, 0.45);
    await expectBox("A-101", A101.from[0], A101.from[1], A101.to[0], A101.to[1]);

    if (width === 360) {
      // Bunnark på mobil
      await buyer.page.locator('a[data-unit-number="A-302"]').click();
      const card = buyer.page.getByTestId("unit-card");
      await expect(card).toBeVisible();
      await expect(card.getByRole("heading", { name: "A-302" })).toBeVisible();
      // Arket ligger nederst i vinduet (når animasjonen er ferdig)
      await expect
        .poll(async () => {
          const cardBox = await card.boundingBox();
          return cardBox ? Math.round(cardBox.y + cardBox.height) : 0;
        })
        .toBe(900);
      await buyer.page.keyboard.press("Escape");
    }

    if (width === 1920) {
      // Filtre ligger i adressen og overlever ny innlasting
      await buyer.page.getByRole("button", { name: "Reservert" }).click();
      await expect(buyer.page).toHaveURL(/status=reservert/);
      await expect(buyer.page.getByTestId("selector-count")).toHaveText("Viser 1 av 6 boliger");
      await buyer.page.reload();
      await expect(buyer.page.getByTestId("selector-count")).toHaveText("Viser 1 av 6 boliger");
      await expect(buyer.page.getByRole("button", { name: "Reservert" })).toHaveAttribute("aria-pressed", "true");

      // Liste og bilde markerer samme bolig ved peker over
      await buyer.page.getByRole("button", { name: "Nullstill filtre" }).click();
      await buyer.page.locator('tr[data-unit-number="A-101"]').hover();
      await expect(buyer.page.locator('a[data-unit-number="A-101"] polygon').first()).toHaveCSS("stroke-width", "3px");

      // Sortering på pris, synkende
      await buyer.page.getByRole("button", { name: "Pris" }).click();
      await buyer.page.getByRole("button", { name: "Pris" }).click();
      await expect(buyer.page.locator("tbody tr").first()).toHaveAttribute("data-unit-number", "A-303");
    }
    await buyer.context.close();
  }
});
