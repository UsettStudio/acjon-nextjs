import { faqs } from "@/data/siteConfig";

/**
 * Synlig FAQ-seksjon. Gir ekte, søkbart innhold som matcher FAQPage-schemaet
 * – både Google og AI-motorer (GEO) leser og siterer denne teksten.
 * Bruker native <details>/<summary> (tilgjengelig, ingen JS nødvendig).
 */
const FaqSection = () => {
    return (
        <section id="faq" className="ub-faq-area">
            <div className="container container-1480">
                <div className="ub-faq-head">
                    <span className="ub-faq-kicker">Ofte stilte spørsmål</span>
                    <h2 className="ub-faq-title">3D-visualisering i Østfold – kort forklart</h2>
                </div>
                <div className="ub-faq-list">
                    {faqs.map((f, i) => (
                        <details key={i} className="ub-faq-item" {...(i === 0 ? { open: true } : {})}>
                            <summary className="ub-faq-q">{f.q}</summary>
                            <div className="ub-faq-a">
                                <p>{f.a}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
