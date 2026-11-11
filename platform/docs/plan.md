# Plan per fase

Hver fase avsluttes med grønne tester, typekontroll og lint, og en kort oppsummering av hva som er bygget, hva som gjenstår og hvilke valg som er tatt. Se også [arkitektur.md](arkitektur.md).

## Status

| Fase | Status |
|---|---|
| Datamodell og RLS | Godkjent |
| 0 Grunnmur | Ferdig, se oppsummeringen under fase 0 |
| 1 Prosjekter og enheter | Neste |
| 2–5 | Ikke påbegynt |

## Leveranse 1: datamodell og RLS (godkjent)

- **Mappestruktur:** se arkitektur.md, avsnitt 2.
- **Syv SQL-migrasjoner:** datamodell, tilgangsfunksjoner, RLS for alle 25 tabeller, domenelogikk, offentlig lese-API, fillagring, sanntid og nattlig vedlikehold.
- **Seks pgTAP-testfiler med 219 tester:**
  - Skjemaregler, blant annet at alle fremmednøkler er indeksert og at anon bare kan kjøre de offentlige funksjonene.
  - Isolasjonstesten fra akseptkriterium 6, som går gjennom alle tabeller automatisk.
  - Rollematrisen og lesemodus.
  - Statuslogg, sanntid og dataintegritet.
  - Publisering og det offentlige API-et.
- **Kjørt mot ekte Supabase lokalt** (CLI 3.1, Postgres 17):
  - `supabase db reset` og `supabase test db` er grønne, og `supabase db lint` gir ingen feil.
  - Isolasjonstesten er sjekket ved å ødelegge RLS-regler med vilje. Testen ble rød.
  - En statusendring nådde en anonym sanntidsklient på 35 ms.

## Fase 0: Grunnmur

- **Next.js 16 i `platform/`:**
  - TypeScript strict, ESLint, Tailwind CSS 4, shadcn/ui og next-intl med `nb` (standard), `en` og `sv`.
  - Sentry med EU-region.
  - `platform/` legges i `exclude` i rotmappens tsconfig og eslint-oppsett, så nettsidens bygg ikke påvirkes.
- **CI i GitHub Actions:** lint, typekontroll, Vitest, `supabase test db` og Playwright.
- **Miljøer:**
  - Lokalt: Supabase CLI.
  - Staging og produksjon: to Supabase-prosjekter i Stockholm, og Vercel preview/prod med funksjoner i `arn1`.
  - Genererte databasetyper og `.env.example`.
- **Pålogging og organisasjon:**
  - Supabase Auth med e-post og passord, og magisk lenke.
  - Registrering fører til opprettelse av organisasjon.
  - Organisasjonsvelger.
  - Invitasjon på e-post (Resend) med rolle og prosjekttilgang, og brukeradministrasjon.
  - Pålogging logges.
- **Rollekontroll i TypeScript** som speiler SQL-rollene, i grensesnitt og serverhandlinger.
- **Minimal plattformadmin:** liste over organisasjoner.
- **Ferdig når:** en ny bruker kan registrere seg, opprette organisasjon og invitere en kollega, og kollegaen ser bare egen organisasjon. Isolasjonstesten kjører i CI.

### Oppsummering av fase 0

**Bygget:**

- **Next.js 16.4 i `platform/`:**
  - TypeScript strict med `noUncheckedIndexedAccess`.
  - Cache Components og Partial Prefetching.
  - Tailwind CSS 4 og shadcn/ui-komponenter.
  - next-intl med all tekst i `messages/` på bokmål, engelsk og svensk.
  - Sentry med EU-region og uten personopplysninger.
  - Sikkerhetshoder. Admin kan ikke vises i iframe.
- **Pålogging:**
  - Registrering, innlogging med passord og med magisk lenke.
  - Glemt passord og nytt passord.
  - Bekreftelseslenker via `/auth/confirm`, som støtter både `token_hash` og PKCE-kode.
  - Utlogging.
  - Pålogging logges i revisjonsloggen.
- **`proxy.ts`:**
  - Fornyer sesjonen og sender uinnloggede til innlogging med retur til siden de kom fra.
  - Husker sist brukte organisasjon.
  - Hindrer åpne omdirigeringer.
- **Organisasjoner:**
  - Oppretting med 30 dagers prøveperiode.
  - Adresse `/{organisasjon}/…` som lages fra firmanavnet.
  - Organisasjonsvelger og innstillinger (navn, adresse, lagringstid for leads).
  - Oversiktsside med abonnement, brukere og prosjekter.
  - Lesemodus-banner.
- **Brukere:**
  - Invitasjon på e-post med rolle og prosjekttilgang. Lenken vises også i appen og kan deles direkte.
  - Sende på nytt (gammel lenke slutter å virke) og trekke tilbake.
  - Invitasjonsside for nye og eksisterende brukere.
  - Endre rolle, fjerne medlem, forlate organisasjonen.
  - Prosjekttilgang for redaktører og meglere.
- **Rollekontroll i TypeScript** (`src/lib/auth/permissions.ts`), lik databasen. Hver serverhandling sjekker rolle og lesemodus før kallet. RLS er siste sperre.
- **Plattformadmin:** liste over alle organisasjoner med abonnement, brukere og prosjekter.
- **Databasetillegg (migrasjon 0008):**
  - Reserverte organisasjonsadresser.
  - Invitasjonsoppslag uten innlogging.
  - Koblinger fra medlemskap og invitasjoner til profiler.
  - Prosjekttilgang som én transaksjon.
- **Tester:**

  | Type | Antall | Dekker |
  |---|---|---|
  | pgTAP | 230 | Skjema, RLS og isolasjon per tabell, roller, statuslogg, publisering, fase 0-funksjonene |
  | Vitest | 72 | Rollematrisen og reserverte adresser mot SQL-filene, norsk tallformat, lesemodus, trygge omdirigeringer, tokener, e-post-escaping, skjemaer, lik nøkkelmengde i alle språkfilene |
  | Playwright | 3 | Registrering → organisasjon → invitasjon → godkjenning → redaktør uten innstillinger → annen organisasjon ser ingenting; innlogging med feil og riktig passord; retur etter innlogging |

- **CI:** `.github/workflows/platform.yml` kjører lint, typekontroll, enhetstester, `supabase test db`, `supabase db lint`, kontroll av at databasetypene er oppdatert, bygg og Playwright.

**Gjenstår (ikke del av fase 0):**

- **Kontoer og miljøer:** Supabase, Vercel, Resend og Sentry er ikke opprettet. Alt er bygget og testet lokalt. Oppsettet er beskrevet i README.
- **E-postmaler for Supabase Auth:** malene på norsk med `token_hash`-lenker legges inn når Supabase-prosjektene finnes.
- **CI:** arbeidsflyten er skrevet, men har ikke kjørt på GitHub ennå. Den kjører ved neste push hvis Actions er slått på for repoet. Alle stegene er kjørt lokalt.
- **Språk:** admin bruker standardspråket (bokmål). Valg av språk per bruker kommer sammen med publiserte sider i fase 3.

**Valg i fase 0:**

- **Cache Components er slått på fra start**, som i Next.js 16.4 sine standarder. Publiserte prosjektsider (fase 3) trenger mellomlagring med tagger. Admin-sider leser innlogging bak `Suspense`, slik dokumentasjonen krever.
- **Organisasjonen ligger i adressen** (`/{slug}/…`), så lenker kan deles og flere faner kan vise ulike organisasjoner. Ruter i admin har engelske navn. Teksten er norsk.
- **Admin bruker ett fast språk per installasjon.** Språket leses ikke fra cookies. Da kan oversatt tekst ligge i det forhåndsrenderte skallet.
- **Invitasjonslenken vises i appen etter sending.** Den virker bare for e-postadressen den ble sendt til, og bare med bekreftet adresse (kontrolleres i databasen).
- **Passord:** minst 10 tegn.
- **shadcn/ui-komponentene er skrevet inn for hånd**, i samme stil som shadcn sitt register. Registeret er ikke tilgjengelig fra byggemiljøet.

## Fase 1: Prosjekter og enheter

- **Prosjektveiviser:**
  - Adressesøk mot Kartverket (gratis, uten nøkkel) og MapLibre-kart med flyttbar nål.
  - Fase, fremdrift og kontaktpersoner.
  - Byggetrinn og bygg.
- **Enhetstabell (TanStack Table):**
  - Redigering i cellene, sortering, filtrering og kolonnevelger.
  - Flervalg med masseendring av status, pris og byggetrinn.
  - Statuslogg per enhet.
- **Enhetsskjema** med fanene Nøkkelinfo, Pris, Areal, Plantegninger og bilder, Dokumenter og Beskrivelse.
- **Mediebibliotek:** opplasting direkte til Storage og WebP-varianter med sharp.
- **Import og eksport:**
  - Import fra CSV og XLSX med kolonnekobling, forhåndsvisning og validering per rad (Zod).
  - Eksisterende enheter oppdateres på `unit_number`.
  - Eksport til CSV.
- **Tester:**
  - Enhetstester for prisberegning, importvalidering og norsk tallformat.
  - E2E: opprett prosjekt og importer 24 enheter.

## Fase 2: Boligvelger

- **Editor, Tegn-modus:**
  - Polygon og rektangel, flytting, punkter og nye punkter på kanter.
  - Delete, Ctrl/Cmd+D og piltaster.
  - Angre og gjør om (minst 50 steg).
  - Zoom og panorering, og «tilpass til vinduet».
  - Autolagring med synlig status.
- **Editor, Koble-modus:**
  - Søkbart sidepanel gruppert på byggetrinn og etasje, med teller av typen «18 av 24».
  - Dra og slipp enhet på form.
  - Lenker til visning, prosjekt eller URL.
  - Advarsel om dobbel kobling.
- **Editor, Status-modus:** meny med notat, og flervalg med Shift og dra-ramme.
- **Visninger og publisering:**
  - Visningstre med dra og slipp, og vinkelgrupper.
  - Bytte av bilde med varsel ved endret sideforhold.
  - Forhåndsvisning på desktop og mobil.
  - Publisering.
- **Publisert velger:**
  - Verktøytips, enhetskort og filter i URL.
  - Liste med synkron utheving, favoritter og sammenligning av tre enheter.
  - Brødsmuler og vinkelbytte.
  - Mobil: liste først, klyp-zoom og bunnark.
  - Tastatur og skjermleser.
  - Sanntid.
- **Enhetsside** `/bolig/{slug}` med prisoppstilling.
- **Tester:**
  - Enhetstester for koordinatomregning og filterlogikk.
  - E2E: akseptkriterium 2 og 3 (360, 768 og 1920 px).

## Fase 3: Prosjektside

- **Blokkeditor med forhåndsvisning i sanntid:**
  - Alle 18 blokktyper.
  - Malene «Kommer for salg» og «Full prosjektside», på samme datamodell, så en side kan bygges ut uten å starte på nytt.
  - Flere sider, og meny og bunntekst redigert ett sted.
  - Tema fra merkevareprofilen.
- **Publisering:**
  - Utkast og publisering.
  - Delbar forhåndsvisningslenke med signatur og utløp.
  - Versjonshistorikk med gjenoppretting.
- **SEO og ytelse:**
  - Tittel, beskrivelse og delingsbilde.
  - Sitemap, robots og kanonisk adresse.
  - Open Graph og strukturerte data.
  - Servergjengivelse med cache-tagger som tømmes ved publisering og statusendring.
- **Interesseskjema:**
  - Honeypot, rate limit og Turnstile.
  - Samtykke med tekstversjon.
  - E-post til kontaktpersoner og kvittering til avsender.
- **Leads i admin:** liste, filter, detalj, status, CSV-eksport og sletting.
- **E2E:** akseptkriterium 5, og akseptkriterium 1 frem til publisering på underdomene.

## Fase 4: Drift

- **Domener:**
  - Wildcard-underdomener.
  - Egne domener via Vercel Domains API, med DNS-veiledning, TXT-bekreftelse og automatisk sertifikat.
- **Stripe Billing:**
  - 30 dagers prøveperiode uten kort, og planer etter antall aktive prosjekter.
  - Checkout og kundeportal.
  - Webhook som oppdaterer abonnementet.
  - Lesemodus i grensesnittet (databasen håndhever den allerede).
  - Varsel før noe tas ned. Publiserte sider tas aldri ned automatisk.
- **Innbygging:** web-komponent med iframe som reserve, og offentlig lese-API med CORS.
- **Samtykke og sporing:**
  - Samtykkebanner, og genererte sider for personvern og informasjonskapsler.
  - GA4, Tag Manager og Meta Pixel lastes først etter samtykke.
- **Integrasjoner:**
  - Utsending av webhooks med HMAC-signatur og nye forsøk.
  - API-nøkler i admin.
- **E2E:** akseptkriterium 4 på eget domene.

## Fase 5: Kvalitet

- **Universell utforming:** WCAG 2.1 AA, med axe i Playwright og manuell test med tastatur og skjermleser.
- **Ytelse:** LCP under 2,5 s på mobil (Lighthouse CI), bilder i riktig størrelse og lat lasting.
- **Akseptkriterier:** alle seks som ende-til-ende-tester.
- **Demodata:**
  - Demo Bolig AS med prosjektet Fjordparken: 24 leiligheter på fire etasjer.
  - SVG-fasade med ferdige markeringer.
  - Publisert prosjektside.
- **Drift og personvern:** GDPR-eksport per person og driftsrutiner.

## Valg som er godkjent

1. **Plassering:** plattformen ligger i `platform/` i dette repoet. Nettsiden røres ikke.
2. **Tenant-konsistens:** sammensatte fremmednøkler og uforanderlige nøkkelkolonner, i tillegg til RLS.
3. **Offentlige data:** bare via databasefunksjoner. anon har ingen tabelltilgang.
4. **Publisering:** boligvelgerens former og prosjektsiden publiseres som øyeblikksbilder. Status og enhetsdata er alltid live.
5. **Sanntid:** kjøpere får en offentlig broadcast-kanal med bare enhets-id og status. Admin bruker Postgres Changes med RLS.
6. **Lesemodus** håndheves i databasen, ikke bare i grensesnittet.
7. **Plattformadmin** har lesetilgang, men ser ikke leads. Endringer skjer via serverhandlinger som logges.
8. **Megler** kan endre status og alle prisfelt: pris, omkostninger, fellesgjeld og felleskostnader.
9. **Leads** legges inn av serveren først etter Turnstile, honeypot og rate limit.
10. **Opplasting:** JPG, PNG, WebP og PDF. Ikke SVG, på grunn av skriptrisiko.
11. **Tilleggsbiblioteker:**

    | Bibliotek | Bruk |
    |---|---|
    | `@supabase/ssr` | Supabase-klient for server og nettleser |
    | `next-intl` | Oversettelser |
    | TanStack Table | Regnearktabellen |
    | dnd-kit | Dra og slipp |
    | MapLibre GL og Kartverket | Kart og adressesøk |
    | papaparse og read-excel-file | Import |
    | sharp | Bildevarianter |
    | React Email | E-postmaler |

12. **Regioner:**

    | Tjeneste | Region |
    |---|---|
    | Supabase | Stockholm (`eu-north-1`) |
    | Vercel-funksjoner | Stockholm (`arn1`) |
    | Sentry og Resend | EU |

## Åpne spørsmål

Spørsmålene under er ikke besvart ennå. Standardvalgene i parentes brukes inntil videre.

1. **Navn og domene:** hva er `[PRODUKTNAVN]` og `[PLATTFORMDOMENE]`? Domenet trengs til underdomener (fase 4) og e-postavsender. (Arbeidsnavnet «Boligplattform», satt med miljøvariabler.)
2. **Repo:** er det greit at plattformen ligger i `platform/` i dette repoet, eller ønsker dere et eget repo? (`platform/` i dette repoet.)
3. **Abonnement:** hvilke planer skal finnes (antall aktive prosjekter og pris per måned)? Hva teller som aktivt prosjekt? Trengs i fase 4. (Aktive prosjekter er de i fasene «Kommer for salg», «I salg» og «Utsolgt».)
4. **Kontoer:** hvem oppretter Supabase, Vercel, Stripe, Resend, Cloudflare Turnstile og Sentry, og når? (Alt utvikles og testes lokalt til kontoene finnes.)
