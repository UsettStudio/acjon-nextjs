// Lighthouse CI mot den publiserte demosiden (fase 5). Appen må kjøre på
// NEXT_PUBLIC_APP_URL (npm run build && npm run start).
//
// 1. Lager Demo Bolig AS med Fjordparken for en egen bruker, med `npm run demo`.
// 2. Besøker sidene én gang. Første besøk lager den statiske siden, og Lighthouse
//    skal måle siden slik besøkende vanligvis får den: fra mellomlageret.
// 3. Kjører `lhci autorun` med lighthouserc.yml (mobil, krav til LCP og bilder).
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import http from "node:http";

import { chromium } from "@playwright/test";

const PATHS = ["/", "/bolig/a-302", "/personvern"];

const output = execFileSync(
  "npx",
  ["tsx", "--conditions=react-server", "scripts/demo.ts", "--email", "lighthouse@example.com", "--replace"],
  { env: { ...process.env, DEMO_PASSWORD: process.env.DEMO_PASSWORD || `lighthouse-${randomUUID()}` }, encoding: "utf8" },
);
const site = /Prosjektside: +(\S+)/.exec(output)?.[1];
if (!site) {
  console.error(`Demoskriptet svarte ikke som ventet:\n${output}`);
  process.exit(1);
}
const urls = PATHS.map((path) => new URL(path, site).toString());

/** Henter siden via 127.0.0.1 med riktig vertsnavn, så *.localhost virker også i Node. */
function visit(url) {
  const target = new URL(url);
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: "127.0.0.1", port: target.port || 80, path: target.pathname, headers: { host: target.host } },
      (response) => {
        response.resume();
        response.on("end", () => resolve(response.statusCode));
      },
    );
    request.on("error", reject);
    request.end();
  });
}

for (const url of urls) {
  const status = await visit(url);
  if (status !== 200) {
    console.error(`${url} svarte ${status}`);
    process.exit(1);
  }
}

const result = spawnSync("npx", ["lhci", "autorun", "--config=lighthouserc.yml", ...urls.map((url) => `--collect.url=${url}`)], {
  stdio: "inherit",
  env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || chromium.executablePath() },
});

// Median for hver side, så tallene står i loggen også når alle krav er oppfylt.
const runs = new Map();
for (const file of readdirSync(".lighthouseci").filter((name) => name.startsWith("lhr-") && name.endsWith(".json"))) {
  const report = JSON.parse(readFileSync(`.lighthouseci/${file}`, "utf8"));
  const values = runs.get(report.finalDisplayedUrl) ?? [];
  values.push({
    lcp: report.audits["largest-contentful-paint"].numericValue,
    cls: report.audits["cumulative-layout-shift"].numericValue,
  });
  runs.set(report.finalDisplayedUrl, values);
}
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
for (const [url, values] of runs) {
  const lcp = median(values.map((value) => value.lcp));
  const cls = median(values.map((value) => value.cls));
  console.info(`${new URL(url).pathname}: LCP ${(lcp / 1000).toFixed(2)} s, CLS ${cls.toFixed(3)} (median av ${values.length})`);
}
process.exit(result.status ?? 1);
