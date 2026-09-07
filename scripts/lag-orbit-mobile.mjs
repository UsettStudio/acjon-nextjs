/**
 * Lager mobilversjonen av orbit-sekvensen i heroen.
 *
 *   node scripts/lag-orbit-mobile.mjs
 *
 * HVORFOR
 * Heroen skrubber en bildesekvens på canvas. Originalene er 1600 px brede
 * JPEG-er på ~113 KB. En telefon har en canvas som er 400–450 px bred, så den
 * lastet ned drøyt fire ganger mer piksler enn den kunne vise – 4,5 MB bare
 * for heroen, midt i at resten av siden prøvde å laste.
 *
 * Dette skriptet skalerer ned til 800 px (nok til skjermer med 2x piksel-
 * tetthet) og lagrer som WebP. Resultat: ~26 KB per bilde, ~1,1 MB totalt.
 *
 * KJØR DETTE PÅ NYTT hvis orbit-klippet byttes ut. Mobilsettet må inneholde
 * nøyaktig de samme bildenumrene som DesignStudioHero ber om, altså hvert
 * tredje bilde pluss det siste (MOBILE_STEP = 3).
 *
 * Krever sharp, som allerede følger med Next.js.
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const KILDE = "public/assets/scroll/orbit";
const MÅL = "public/assets/scroll/orbit-mobile";
const BREDDE = 800;
const KVALITET = 72;
const STEG = 3; // må stemme med MOBILE_STEP i DesignStudioHero.tsx

const pad = (n) => String(n).padStart(4, "0");

if (!existsSync(KILDE)) {
    console.error(`Fant ikke ${KILDE}. Kjør fra prosjektroten.`);
    process.exit(1);
}

const antall = (await readdir(KILDE)).filter((f) => f.endsWith(".jpg")).length;
if (!antall) {
    console.error(`Ingen .jpg-filer i ${KILDE}.`);
    process.exit(1);
}

const indekser = [];
for (let i = 0; i < antall; i += STEG) indekser.push(i);
if (indekser[indekser.length - 1] !== antall - 1) indekser.push(antall - 1);

await mkdir(MÅL, { recursive: true });

let før = 0;
let etter = 0;

for (const n of indekser) {
    const navn = `frame_${pad(n + 1)}`;
    const inn = path.join(KILDE, `${navn}.jpg`);
    const ut = path.join(MÅL, `${navn}.webp`);
    før += (await stat(inn)).size;
    await sharp(inn).resize({ width: BREDDE }).webp({ quality: KVALITET }).toFile(ut);
    etter += (await stat(ut)).size;
}

const mb = (b) => (b / 1048576).toFixed(2);
console.log(`${indekser.length} bilder skrevet til ${MÅL}`);
console.log(`${mb(før)} MB  ->  ${mb(etter)} MB  (${Math.round(100 - (etter / før) * 100)}% mindre)`);
