import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

/** WCAG 2.1 nivå A og AA, som spesifikasjonen krever for publiserte sider. */
const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

export async function expectNoWcagViolations(page: Page, name: string) {
  const result = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();
  const violations = result.violations.map(
    (violation) => `${violation.id} (${violation.impact}): ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`,
  );
  expect(violations, `WCAG 2.1 AA-brudd på ${name}`).toEqual([]);
}

/** Venter til animasjonene i elementet er ferdige, for eksempel en dialog som toner inn, så kontrasten måles riktig. */
export async function waitForAnimations(locator: Locator) {
  await locator.evaluate((element) => Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished)));
}
