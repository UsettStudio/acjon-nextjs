/**
 * Melder inn alle sider fra sitemap.xml til IndexNow.
 *
 * Kjør etter hver deploy:   npm run indexnow
 *
 * Hva det gjør: IndexNow er en felles inngang der Bing, Yandex og flere andre
 * får beskjed med én gang en side er ny eller endret, i stedet for å vente på
 * at crawleren kommer innom av seg selv. Bing er indeksen ChatGPT Search
 * siterer fra, så dette er den raskeste veien fra deploy til AI-synlighet.
 *
 * Google støtter ikke IndexNow. Der må sitemapet sendes inn i Search Console,
 * og forsiden bes indeksert manuelt via URL-inspeksjon.
 *
 * Nøkkelen ligger i to eksemplarer, og begge må stemme:
 *   - src/data/siteConfig.ts (indexNowKey)
 *   - public/<nøkkel>.txt    (filen Bing henter for å bekrefte eierskap)
 */

const KEY = "48ef2941363a8a08758b205ce2b28c2f";
const HOST = "usett.no";
const SITEMAP = `https://${HOST}/sitemap.xml`;

const hentUrler = async () => {
    const res = await fetch(SITEMAP);
    if (!res.ok) throw new Error(`Fikk ${res.status} fra ${SITEMAP}`);
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
};

const main = async () => {
    const urlList = await hentUrler();
    if (!urlList.length) throw new Error("Fant ingen URL-er i sitemapet.");

    console.log(`Melder inn ${urlList.length} URL-er til IndexNow:`);
    for (const u of urlList) console.log("  " + u);

    const res = await fetch("https://api.indexnow.org/IndexNow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
            host: HOST,
            key: KEY,
            keyLocation: `https://${HOST}/${KEY}.txt`,
            urlList,
        }),
    });

    // 200 og 202 betyr begge «mottatt». 403 betyr som regel at nøkkelfilen
    // ikke ligger ute ennå – sjekk at https://usett.no/<nøkkel>.txt svarer.
    if (res.status === 200 || res.status === 202) {
        console.log(`\nOK (${res.status}). Sidene er meldt inn.`);
    } else {
        console.error(`\nFeil: ${res.status} ${res.statusText}`);
        console.error(await res.text());
        process.exitCode = 1;
    }
};

main().catch((err) => {
    console.error("Feilet:", err.message);
    process.exitCode = 1;
});
