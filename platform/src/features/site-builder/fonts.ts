import { DM_Sans, Lora, Playfair_Display } from "next/font/google";

/**
 * Skrifter prosjektsidene kan velge (i tillegg til Inter fra rotoppsettet).
 * next/font laster dem ned ved bygging og leverer dem selv, så besøkende aldri
 * sender forespørsler til Google. De forhåndslastes ikke; nettleseren henter
 * bare skriften siden faktisk bruker.
 */
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-site-dm-sans", display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], variable: "--font-site-lora", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-site-playfair", display: "swap", preload: false });

/** Klassenavn som gjør skrift-variablene tilgjengelige under rotelementet til prosjektsiden. */
export const siteFontVariables = [dmSans.variable, lora.variable, playfair.variable].join(" ");
