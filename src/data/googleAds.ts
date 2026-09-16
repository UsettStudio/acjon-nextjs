/**
 * Google Ads-konverteringssporing for usett.no.
 *
 * Verdiene er hentet fra Google Ads-konto 228-973-9945:
 *   Mål → Konverteringer → «Kontaktskjema sendt - usett.no»
 *   Konverteringstype-ID 7768829421, opprettet 15.09.2026.
 *
 * ID-ene er ikke hemmeligheter – de ligger i klientkoden uansett – så de står
 * her i klartekst framfor i en miljøvariabel. Da virker sporingen rett etter
 * deploy, uten at noe må settes opp i Netlify først.
 *
 * Selve taggen lastes av components/consent/CookieBanner.tsx, og kun etter
 * samtykke til markedsføring. Se den filen for samtykkelogikken.
 */

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

export const GOOGLE_ADS_ID = "AW-18409882123";

/** send_to for konverteringshandlingen «Kontaktskjema sendt - usett.no». */
export const GOOGLE_ADS_KONTAKTSKJEMA = "AW-18409882123/YIfpCO3bu_gcEIuEwspE";

/**
 * Rapporterer en innsendt kontaktforespørsel til Google Ads.
 *
 * Kalles KUN når web3forms har bekreftet at meldingen faktisk gikk gjennom –
 * ikke på knappeklikk. Ellers telles også innsendinger som feiler.
 *
 * window.gtag finnes kun hvis brukeren har samtykket til markedsføring.
 * Uten samtykke er dette et stille no-op, og ingen sporing skjer.
 */
export function sporKontaktskjema() {
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "conversion", {
        send_to: GOOGLE_ADS_KONTAKTSKJEMA,
        value: 1.0,
        currency: "NOK",
    });
}
