// Bygger web-komponenten for innbygging (src/embed/boligvelger-embed.ts) til
// public/embed/v1.js. Filen er selvstendig, så TypeScript-kompilatoren holder:
// typene fjernes, eksportene (som bare brukes av testene) tas bort, og alt
// pakkes i en funksjon, så ingenting lekker ut i vertssidens globale navnerom.
// Kjøres automatisk før `dev` og `build`.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "src", "embed", "boligvelger-embed.ts"), "utf8");

const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, removeComments: true },
});
const body = outputText.replace(/^export /gm, "").replace(/^\/\/# sourceMappingURL=.*$/gm, "").trim();
if (/^\s*(import|export)\b/m.test(body)) {
  throw new Error("Web-komponenten kan ikke ha import eller export etter bygging.");
}

const target = join(root, "public", "embed");
mkdirSync(target, { recursive: true });
writeFileSync(join(target, "v1.js"), `/* Boligvelger: web-komponent for innbygging. */\n(function () {\n"use strict";\n${body}\n})();\n`);
console.info("Bygde web-komponenten til public/embed/v1.js");
