/**
 * Lager plakatbildet heroen viser mens bildesekvensen lastes ned.
 *
 *   node scripts/lag-hero-poster.mjs
 *
 * HVORFOR
 * Heroen tegner orbit-sekvensen på en canvas. Canvasen kan ikke tegne noe
 * før JavaScript har kjørt OG første bilde er lastet ned – i praksis et
 * halvt til to sekunder etter at siden er synlig. Fram til da så man bare
 * svart, fordi bakgrunnen bak canvasen (hero-bg.webp) også er nesten svart.
 *
 * Løsningen er at bakgrunnen ER første bilde i sekvensen. Da står bygget der
 * fra første maling, og når canvasen er klar tones den inn over nøyaktig det
 * samme motivet – overgangen er usynlig.
 *
 * Plakaten lages i to størrelser, én per skjerm, slik at telefonen ikke
 * laster ned et bilde som er dobbelt så bredt som skjermen.
 *
 * KJØR PÅ NYTT hvis orbit-klippet byttes ut.
 */
import { mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";

const KILDE = "public/assets/scroll/orbit/frame_0001.jpg";
const MÅL = "public/assets/img/design-studio/hero";

if (!existsSync(KILDE)) {
    console.error(`Fant ikke ${KILDE}. Kjør fra prosjektroten.`);
    process.exit(1);
}

await mkdir(MÅL, { recursive: true });

const varianter = [
    { fil: "hero-poster.webp", bredde: 1600, kvalitet: 74 },
    { fil: "hero-poster-mobile.webp", bredde: 800, kvalitet: 70 },
];

for (const v of varianter) {
    const ut = `${MÅL}/${v.fil}`;
    await sharp(KILDE).resize({ width: v.bredde }).webp({ quality: v.kvalitet }).toFile(ut);
    console.log(`${ut}  ${Math.round((await stat(ut)).size / 1024)} KB`);
}
