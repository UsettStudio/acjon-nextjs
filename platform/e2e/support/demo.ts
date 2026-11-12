import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";

export type Demo = {
  email: string;
  password: string;
  orgSlug: string;
  projectSlug: string;
  /** Adressen til den publiserte prosjektsiden, for eksempel http://fjordparken.localhost:3000 */
  siteUrl: string;
};

/**
 * Lager Demo Bolig AS med Fjordparken for en ny bruker, med det samme skriptet
 * som `npm run demo`. Hver test får sin egen organisasjon og prosjektside.
 */
export function createDemo(): Demo {
  const id = randomUUID().slice(0, 8);
  const email = `demo-${id}@example.test`;
  const password = `demo-${randomUUID()}`;
  const output = execFileSync("npx", ["tsx", "--conditions=react-server", "scripts/demo.ts", "--email", email], {
    env: { ...process.env, DEMO_PASSWORD: password },
    encoding: "utf8",
    timeout: 120_000,
  });
  const admin = /Admin: +(\S+)/.exec(output)?.[1];
  const siteUrl = /Prosjektside: +(\S+)/.exec(output)?.[1];
  const path = admin ? new URL(admin).pathname.split("/") : [];
  const orgSlug = path[1];
  const projectSlug = path[3];
  if (!siteUrl || !orgSlug || !projectSlug) {
    throw new Error(`Demoskriptet svarte ikke som ventet:\n${output}`);
  }
  return { email, password, orgSlug, projectSlug, siteUrl: siteUrl.replace(/\/$/, "") };
}
