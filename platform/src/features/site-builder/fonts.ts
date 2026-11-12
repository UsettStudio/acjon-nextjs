import { DM_Sans, Jost, Lora, Playfair_Display } from "next/font/google";

/**
 * Skrifter prosjektsidene kan velge (i tillegg til Inter fra rotoppsettet).
 * next/font laster dem ned ved bygging og leverer dem selv, så besøkende aldri
 * sender forespørsler til Google. Jost er skriften i designstilen Nordisk, som
 * er standard, og forhåndslastes derfor. De andre hentes bare når siden bruker dem.
 */
const jost = Jost({ subsets: ["latin"], variable: "--font-site-jost", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-site-dm-sans", display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], variable: "--font-site-lora", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-site-playfair", display: "swap", preload: false });

/** Klassenavn som gjør skrift-variablene tilgjengelige under rotelementet til prosjektsiden. */
export const siteFontVariables = [jost.variable, dmSans.variable, lora.variable, playfair.variable].join(" ");
