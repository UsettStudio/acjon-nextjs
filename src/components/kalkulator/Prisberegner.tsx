"use client";

/**
 * Prisberegner – lar kunden regne ut et prisnivå selv.
 *
 * Erstatter dronefilmen på forsiden. Tanken er at den som lurer på hva
 * et prosjekt koster skal få svaret med en gang, i stedet for å måtte
 * sende en e-post og vente.
 *
 * REGNEMÅTEN
 *   ((grunnpris × antall bygg) + (pris per illustrasjon × antall illustrasjoner))
 *   × kompleksitetsfaktor  +  tilleggstjenester
 *
 * Grunnprisen regnes per bygg fordi hvert bygg må modelleres og tekstureres
 * for seg – det er den jobben som ligger i «oppstart og teksturering» i
 * pakkene. Tilleggene ganges IKKE med kompleksitet: en plantegning koster
 * det samme uansett hvor komplisert fasaden er.
 *
 * Alle tall ligger i siteConfig.kalkulator. Ingenting er hardkodet her.
 *
 * Resultatet vises som et intervall, ikke én sum. Det er et bevisst valg:
 * et estimat som treffer på kroneøret skaper en forventning tilbudet må
 * innfri, mens et intervall gir rom for de avklaringene som alltid kommer.
 */

import { useMemo, useState } from "react";
import { kalkulator, siteConfig } from "@/data/siteConfig";
import { ArrowIconTwo } from "@/svg";

const kr = (n: number) => n.toLocaleString("nb-NO");

/** Runder til nærmeste trinn, så kunden slipper tall som 38 437. */
const rund = (n: number, trinn: number) => Math.round(n / trinn) * trinn;

type Teller = {
    verdi: number;
    settVerdi: (n: number) => void;
    min: number;
    maks: number;
    etikett: string;
};

/** Pluss/minus-teller. Samme mønster som referansen, men i Usetts stil. */
const Teller = ({ verdi, settVerdi, min, maks, etikett }: Teller) => (
    <div className="ub-kalk-teller" role="group" aria-label={etikett}>
        <button
            type="button"
            onClick={() => settVerdi(Math.max(min, verdi - 1))}
            disabled={verdi <= min}
            aria-label={`Færre – ${etikett}`}
        >
            −
        </button>
        <span aria-live="polite">{verdi}</span>
        <button
            type="button"
            onClick={() => settVerdi(Math.min(maks, verdi + 1))}
            disabled={verdi >= maks}
            aria-label={`Flere – ${etikett}`}
        >
            +
        </button>
    </div>
);

const Prisberegner = () => {
    const [bygg, settBygg] = useState(kalkulator.standard.bygg);
    const [illustrasjoner, settIllustrasjoner] = useState(
        kalkulator.standard.illustrasjoner
    );
    const [kompleksitet, settKompleksitet] = useState(
        kalkulator.standard.kompleksitet
    );
    /** id → antall. 0 eller manglende = ikke valgt. */
    const [tillegg, settTillegg] = useState<Record<string, number>>({});

    const valgtNivå =
        kalkulator.kompleksitet.find((k) => k.id === kompleksitet) ??
        kalkulator.kompleksitet[0];

    const resultat = useMemo(() => {
        const grunn =
            kalkulator.grunnprisPerBygg * bygg +
            kalkulator.prisPerIllustrasjon * illustrasjoner;
        const visualisering = grunn * valgtNivå.faktor;

        const tilleggSum = kalkulator.tillegg.reduce((sum, t) => {
            const antall = tillegg[t.id] ?? 0;
            return sum + t.pris * antall;
        }, 0);

        const total = visualisering + tilleggSum;
        const { ned, opp } = kalkulator.intervall;
        const trinn = kalkulator.avrunding;

        return {
            fra: rund(total * (1 - ned), trinn),
            til: rund(total * (1 + opp), trinn),
            harIllustrasjoner: illustrasjoner > 0,
            tilleggSum,
        };
    }, [bygg, illustrasjoner, valgtNivå, tillegg]);

    /** Lesbar oppsummering kunden kan ta med seg inn i henvendelsen. */
    const oppsummering = useMemo(() => {
        const deler = [
            `${bygg} ${bygg === 1 ? "bygg" : "bygg"}`,
            `${illustrasjoner} illustrasjoner`,
            valgtNivå.navn.toLowerCase(),
        ];
        const valgteTillegg = kalkulator.tillegg
            .filter((t) => (tillegg[t.id] ?? 0) > 0)
            .map((t) =>
                t.harAntall ? `${t.navn} ×${tillegg[t.id]}` : t.navn
            );
        return [...deler, ...valgteTillegg].join(", ");
    }, [bygg, illustrasjoner, valgtNivå, tillegg]);

    const settAntall = (id: string, n: number) =>
        settTillegg((f) => ({ ...f, [id]: n }));

    return (
        <section id="prisberegner" className="ub-kalk-area">
            <div className="container container-1480">
                <div className="ub-kalk-kort">
                    <div className="ub-kalk-hode">
                        <span className="ub-kalk-kicker">Prisberegner</span>
                        <h2 className="ub-kalk-tittel">Hva koster prosjektet ditt?</h2>
                        <p className="ub-kalk-ingress">
                            Sett inn omfanget, så får du et realistisk prisnivå med en
                            gang. Helt uforpliktende – du trenger ikke oppgi noe om deg
                            selv for å se prisen.
                        </p>
                    </div>

                    {/* ---------- Antall bygg ---------- */}
                    <div className="ub-kalk-felt">
                        <label className="ub-kalk-sporsmal">
                            Hvor mange <em>bygg</em> gjelder prosjektet?
                        </label>
                        <p className="ub-kalk-hjelp">
                            Med bygg mener vi separate bygninger – ikke antall bilder.
                        </p>
                        <Teller
                            verdi={bygg}
                            settVerdi={settBygg}
                            min={1}
                            maks={kalkulator.maksBygg}
                            etikett="antall bygg"
                        />
                    </div>

                    {/* ---------- Kompleksitet ---------- */}
                    <div className="ub-kalk-felt">
                        <label className="ub-kalk-sporsmal">
                            Hvilken bygning ligner mest på <em>ditt prosjekt</em>?
                        </label>
                        <div className="ub-kalk-nivaer" role="radiogroup" aria-label="Kompleksitet">
                            {kalkulator.kompleksitet.map((k, i) => (
                                <button
                                    type="button"
                                    key={k.id}
                                    role="radio"
                                    aria-checked={kompleksitet === k.id}
                                    onClick={() => settKompleksitet(k.id)}
                                    className={`ub-kalk-nivaa ub-kalk-nivaa-${i + 1}${
                                        kompleksitet === k.id ? " er-valgt" : ""
                                    }`}
                                >
                                    <strong>{k.navn}</strong>
                                    <span>{k.beskrivelse}</span>
                                </button>
                            ))}
                        </div>
                        <p className="ub-kalk-hjelp">
                            Vi ser på størrelse, fasade, etasjer og detaljnivå – ikke
                            antall boliger.
                        </p>
                    </div>

                    {/* ---------- Antall illustrasjoner ---------- */}
                    <div className="ub-kalk-felt">
                        <label className="ub-kalk-sporsmal">
                            Hvor mange <em>illustrasjoner</em> trenger du?
                        </label>
                        <p className="ub-kalk-hjelp">
                            Både interiør og eksteriør. Til sammenligning inneholder
                            pakken Basis tre, og Komplett sju.
                        </p>
                        <Teller
                            verdi={illustrasjoner}
                            settVerdi={settIllustrasjoner}
                            min={0}
                            maks={kalkulator.maksIllustrasjoner}
                            etikett="antall illustrasjoner"
                        />
                    </div>

                    {/* ---------- Tillegg ---------- */}
                    <div className="ub-kalk-felt">
                        <label className="ub-kalk-sporsmal">Tilleggstjenester</label>
                        <div className="ub-kalk-tillegg">
                            {kalkulator.tillegg.map((t) => {
                                const antall = tillegg[t.id] ?? 0;
                                const på = antall > 0;
                                return (
                                    <div
                                        key={t.id}
                                        className={`ub-kalk-tillegg-rad${på ? " er-valgt" : ""}`}
                                    >
                                        <label className="ub-kalk-tillegg-navn">
                                            <input
                                                type="checkbox"
                                                checked={på}
                                                onChange={(e) =>
                                                    settAntall(t.id, e.target.checked ? 1 : 0)
                                                }
                                            />
                                            <span>{t.navn}</span>
                                        </label>

                                        <div className="ub-kalk-tillegg-hoyre">
                                            {t.harAntall && på && (
                                                <Teller
                                                    verdi={antall}
                                                    settVerdi={(n) => settAntall(t.id, n)}
                                                    min={1}
                                                    maks={t.maks ?? 10}
                                                    etikett={t.navn}
                                                />
                                            )}
                                            <span className="ub-kalk-tillegg-pris">
                                                {kr(t.pris)} kr
                                                {t.enhet && <i> {t.enhet}</i>}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ---------- Resultat ---------- */}
                    <div className="ub-kalk-resultat">
                        <span className="ub-kalk-resultat-merke">Typisk prisnivå</span>
                        {resultat.harIllustrasjoner || resultat.tilleggSum > 0 ? (
                            <>
                                <p className="ub-kalk-sum">
                                    {kr(resultat.fra)}–{kr(resultat.til)} kr
                                </p>
                                <p className="ub-kalk-mva">eks. mva.</p>
                            </>
                        ) : (
                            <p className="ub-kalk-tom">
                                Velg antall illustrasjoner for å se et prisnivå.
                            </p>
                        )}
                        <p className="ub-kalk-forbehold">
                            Dette er en indikasjon basert på omfanget du har valgt, ikke
                            et tilbud. Endelig pris avhenger av tegningsgrunnlag,
                            materialvalg og hvor mye som må bygges fra bunnen.
                        </p>

                        <div className="ub-kalk-knapper">
                            <a href="#kontakt-skjema" className="tp-btn-green tp-btn-anim ub-kalk-btn">
                                <span className="tp-btn-text">Få et konkret tilbud</span>
                                <span>
                                    <ArrowIconTwo width="11" height="12" />
                                </span>
                            </a>
                            <a
                                className="ub-kalk-lenke"
                                href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
                                    "Prisforespørsel fra prisberegneren"
                                )}&body=${encodeURIComponent(
                                    `Hei!\n\nJeg har brukt prisberegneren på usett.no og fikk ${kr(
                                        resultat.fra
                                    )}–${kr(resultat.til)} kr eks. mva.\n\nOmfang: ${oppsummering}.\n\n`
                                )}`}
                            >
                                Send omfanget på e-post
                            </a>
                        </div>

                        <p className="ub-kalk-oppsummering">
                            <span>Ditt valg:</span> {oppsummering}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Prisberegner;
