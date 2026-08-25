/**
 * Gjenbrukbar JSON-LD-komponent.
 *
 * Serveren rendrer <script type="application/ld+json"> direkte i HTML-en.
 * Det er avgjørende: crawlerne til ChatGPT, Claude og Perplexity kjører ikke
 * JavaScript, så strukturerte data som settes inn av klientkode blir aldri sett.
 *
 * `<` escapes til < slik at en streng i dataene ikke kan bryte ut av
 * script-taggen.
 */
const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
    />
);

export default JsonLd;
