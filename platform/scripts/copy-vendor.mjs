// Kopierer filer fra node_modules som nettleseren må hente direkte, til public/vendor/.
// MapLibre 6 starter en web worker fra en egen fil. Filnavnet har versjonsnummeret,
// så filen kan mellomlagres for alltid. Kjøres automatisk før `dev` og `build`.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const maplibre = join(root, "node_modules", "maplibre-gl");
const { version } = JSON.parse(readFileSync(join(maplibre, "package.json"), "utf8"));
const target = join(root, "public", "vendor");

mkdirSync(target, { recursive: true });
copyFileSync(join(maplibre, "dist", "maplibre-gl-worker.mjs"), join(target, `maplibre-gl-worker-${version}.mjs`));
console.info(`Kopierte MapLibre-worker ${version} til public/vendor/`);
