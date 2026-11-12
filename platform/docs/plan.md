# Plan per fase

Hver fase avsluttes med grønne tester, typekontroll og lint, og en kort oppsummering av hva som er bygget, hva som gjenstår og hvilke valg som er tatt. Se også [arkitektur.md](arkitektur.md).

## Status

| Fase | Status |
|---|---|
| Datamodell og RLS | Godkjent |
| 0 Grunnmur | Ferdig, se oppsummeringen under fase 0 |
| 1 Prosjekter og enheter | Ferdig, se oppsummeringen under fase 1 |
| 2 Boligvelger | Ferdig, se oppsummeringen under fase 2 |
| 3 Prosjektside | Neste |
| 4–5 | Ikke påbegynt |

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
  | Playwright | 5 | Registrering → organisasjon → invitasjon → godkjenning → redaktør uten innstillinger → annen organisasjon ser ingenting; innlogging med feil og riktig passord; retur etter innlogging; innloggingslenke og glemt passord via e-post; ugyldig lenke |

- **Norske e-postmaler** for bekreftelse, innloggingslenke, nytt passord og ny e-postadresse, med `token_hash`-lenker som virker uansett nettleser.
- **CI:** `.github/workflows/platform.yml` kjører lint, typekontroll, enhetstester, `supabase test db`, `supabase db lint`, kontroll av at databasetypene er oppdatert, bygg og Playwright. Første kjøring på GitHub var grønn på drøyt fire minutter.

**Gjenstår (ikke del av fase 0):**

- **Kontoer og miljøer:** Supabase, Vercel, Resend og Sentry er ikke opprettet. Alt er bygget og testet lokalt. Oppsettet er beskrevet i README.
- **E-postmaler i Supabase-prosjektene:** de norske malene i `supabase/templates/` brukes lokalt og i testene. De må limes inn i staging og produksjon når prosjektene finnes.
- **Språk:** admin bruker standardspråket (bokmål). Valg av språk per bruker kommer sammen med publiserte sider i fase 3.

**Valg i fase 0:**

- **Cache Components er slått på fra start**, som i Next.js 16.4 sine standarder. Publiserte prosjektsider (fase 3) trenger mellomlagring med tagger. Admin-sider leser innlogging bak `Suspense`, slik dokumentasjonen krever.
- **Organisasjonen ligger i adressen** (`/{slug}/…`), så lenker kan deles og flere faner kan vise ulike organisasjoner. Ruter i admin har engelske navn. Teksten er norsk.
- **Admin bruker ett fast språk per installasjon.** Språket leses ikke fra cookies. Da kan oversatt tekst ligge i det forhåndsrenderte skallet.
- **Invitasjonslenken vises i appen etter sending.** Den virker bare for e-postadressen den ble sendt til, og bare med bekreftet adresse (kontrolleres i databasen).
- **Passord:** minst 10 tegn.
- **shadcn/ui-komponentene er skrevet inn for hånd**, i samme stil som shadcn sitt register. Registeret er ikke tilgjengelig fra byggemiljøet.
- **Unike id-er i skjemaer (`useId`).** Next.js 16 beholder tidligere sider skjult i DOM-en (React Activity). Faste id-er kunne derfor koble en etikett til et skjult felt på en annen side. «Hopp til innhold» flytter fokus til synlig `<main>` av samme grunn.

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

### Oppsummering av fase 1

**Bygget:**

- **Prosjekter:**
  - Prosjektliste med fase, adresse og fordeling av status.
  - Veiviser i fire steg: prosjekt, beliggenhet, fremdrift og kontakter, byggetrinn og bygg. Stegene etter det første er valgfrie.
  - Adressesøk mot Kartverket fra nettleseren, med piltaster og skjermleserstøtte. Valgt adresse fyller ut postnummer, poststed, kommune og plassering.
  - Kart (MapLibre med Kartverkets topografiske kart) med flyttbar nål. Koordinatene kan også skrives inn, for tastaturbrukere og nettlesere uten WebGL.
  - Oversikt med antall enheter per status, andel solgt, siste statusendringer, fremdrift og kontaktpersoner.
  - Innstillinger: generelt, beliggenhet, fremdrift, kontaktpersoner (kan hentes fra brukerne), byggetrinn med egen fase, bygg, rekkefølge og sletting med bekreftelse.
- **Enhetstabell** (TanStack Table 9):
  - Redigering i cellen med norsk tallformat. Enter eller F2 åpner, Escape avbryter.
  - Sortering (A-2 før A-10), søk og filter på status, byggetrinn og bygg.
  - Kolonnevelger som huskes per prosjekt.
  - Flervalg, også med Shift. Masseendring av status med notat, pris (fast pris eller prosent med avrunding og forhåndsvisning), byggetrinn, bygg og synlighet, og sletting.
  - Statuslogg per enhet. Status endres med ett klikk eller med notat.
  - Sanntid: endringer fra kolleger vises uten ny lasting, med synlig indikator.
  - Meglere kan bare endre status og pris.
- **Enhetsskjema** med fanene Nøkkelinfo, Pris, Areal, Plantegninger og bilder, Dokumenter og Beskrivelse. Totalpris regnes ut mens du skriver. Faner med feil markeres. Statusloggen vises ved siden av.
- **Mediebibliotek:**
  - Opplasting rett fra nettleseren til Storage, med brukerens egne rettigheter.
  - Serveren kontrollerer at innholdet er det filtypen sier, og lager WebP-varianter på 800, 1600 og 2400 px med sharp. Bildet roteres etter EXIF, og GPS-posisjon og annen metadata kommer ikke med i variantene.
  - Alternativ tekst, søk, filter og sletting.
  - Filvelger med opplasting, og rekkefølge med dra og slipp (også med tastatur).
- **Import og eksport:**
  - CSV (semikolon eller komma, UTF-8 eller Windows-1252) og Excel (XLSX). Overskriften finnes også under en tittelrad.
  - Kolonnene kobles automatisk etter vanlige overskrifter på norsk, engelsk og svensk, og kan endres.
  - Hver rad valideres med et Zod-skjema bygget fra de koblede kolonnene, med samme regler som enhetsskjemaet. Forhåndsvisningen viser feil per rad, og rader med feil kan hoppes over. Serveren validerer på nytt med det samme skjemaet.
  - Eksisterende enheter oppdateres på enhetsnummer. Byggetrinn og bygg opprettes etter navn.
  - Alt lagres, eller ingenting. Statusendringer logges med kilde «import».
  - Eksport til CSV som Excel åpner riktig, og som kan importeres igjen uten endringer.
- **Database (migrasjon 0009):**
  - `create_project`, `import_units`, `adjust_unit_prices` og `unit_status_counts`.
  - Filstier er låst til filens egen mappe.
  - Enhetens adresse følger enhetsnummeret når den er laget automatisk.
  - Den som lastet opp en fil, kan slette den fra Storage.
  - Statusloggen er koblet til profilen, så navnet vises.
- **Tester:**

  | Type | Antall | Nytt i fase 1 |
  |---|---|---|
  | pgTAP | 274 | 44 nye: opprettelse av prosjekt, import (roller, lesemodus, isolasjon, radnummer ved feil, alt eller ingenting), prisjustering, telling per status, filstier |
  | Vitest | 123 | 51 nye: norske tall, prisberegning, felt og statusnavn, kolonnekobling, Zod-validering per importrad, CSV og Excel-data, eksport og import tur-retur, Kartverket, bildevarianter |
  | Playwright | 8 | 3 nye: veiviser med adressesøk, import av 24 enheter fra CSV og 24 fra Excel, redigering i cellen, status i sanntid i en annen fane, statuslogg, ny import som oppdaterer, eksport; enhetsskjema med plantegning fra mediebiblioteket; megler som bare kan endre status og pris |

**Gjenstår (ikke del av fase 1):**

- **Egne felt på enheter** (`custom_fields`): finnes i datamodellen, men har ikke skjema ennå. Kommer med enhetssiden i fase 2.
- **Bilde av kontaktpersoner:** kommer med prosjektsiden i fase 3.
- **Miniatyr av PDF:** sharp kan ikke lese PDF, så dokumenter vises med ikon.
- **Content-Security-Policy (fase 5)** må tillate `ws.geonorge.no` og `cache.kartverket.no`, Supabase (også `wss:` for sanntid) og web-workeren til MapLibre.
- **Svært store prosjekter:** tabellen viser alle enheter uten virtualisering. Det holder for noen hundre enheter. Importen tar inntil 2000 rader.

**Valg i fase 1:**

- **Adresser i admin:** prosjekter har slug (`/{org}/projects/{slug}`), enheter har id. Hjelpeteksten sier at gamle lenker slutter å virke hvis slugen endres.
- **Bredere admin:** innholdet er inntil 1536 px bredt, fordi enhetstabellen har mange kolonner.
- **Status:** endres alltid via `set_unit_status`, så den logges med kilde og notat. Andre felt lagres direkte. RLS og triggeren i databasen hindrer meglere i å endre noe annet enn pris og status.
- **Import:** én databasefunksjon som lagrer alt eller ingenting og oppgir radnummer ved feil. En tom celle tømmer feltet, unntatt for status, type og «skjult», der tom betyr «behold».
- **Prisendring i prosent:** rundes av til valgt beløp (standard nærmeste 1 000 kr). Enheter uten pris endres ikke.
- **Opplasting i to steg med brukerens rettigheter.** Filstørrelsen kontrolleres mot det som ble oppgitt, og innholdet mot filtypen. Serveren trenger ikke service-nøkkelen.
- **Kartverket brukes fra nettleseren.** Uten svar fylles adressen inn for hånd. Kan kartet ikke vises, kommer en melding i stedet.
- **MapLibre lastes først når kartet vises.** Web-workeren kopieres til `public/vendor/` før `dev` og `build`.
- **Sanntid i admin:** nettleseren gir sanntidsklienten innloggingen før den abonnerer. Ellers kobler den seg på som anonym, og RLS stopper alle hendelser.
- **Supabase på serveren kaller `connection()` først.** Supabase sjekker tokenets utløp med `Date.now()`, og med Cache Components skal det skje per forespørsel, ikke under forhåndsrendering.

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

### Oppsummering av fase 2

**Bygget:**

- **Editor** (`/{org}/projects/{prosjekt}/selectors/{id}`), med modusene Tegn, Koble og Status. Meglere får bare Status.
  - **Tegn:**
    - Polygon: klikk punkter. Formen lukkes ved klikk på første punkt, dobbeltklikk eller Enter. Escape avbryter, og Backspace fjerner siste punkt.
    - Rektangel: dra.
    - Flytting av én eller flere former. Punkter dras, og klikk på en kant gir nytt punkt. Dobbeltklikk eller Alt-klikk fjerner et punkt.
    - Delete, Ctrl/Cmd+D, Ctrl/Cmd+A og piltaster (1 px, med Shift 10 px).
    - Angre og gjør om, 100 steg per visning.
    - Zoom med hjul og knip. Panorering med mellomrom, midtknapp, håndverktøy eller to fingre. Knapp for «tilpass til vinduet».
    - Autolagring 0,7 s etter siste endring. Status vises øverst: «Alle endringer er lagret», «Lagrer …», eller feil med «Prøv igjen». Varsel før siden lukkes med endringer som ikke er lagret.
  - **Koble:**
    - Søkbart panel gruppert på byggetrinn og etasje.
    - Teller («2 av 6 enheter markert»). Umarkerte enheter er flagget, og listen kan vise bare dem.
    - Kobling ved å klikke form og så enhet, eller ved å dra enheten til formen.
    - Mål: enhet, visning, prosjekt eller lenke, med valgfri etikett.
    - Varsel og rød stiplet kant når samme enhet er koblet to ganger i én visning.
  - **Status:**
    - Statusfarger, med skravur på solgte.
    - Klikk åpner en meny med de fire statusene og et valgfritt notat.
    - Flervalg med Shift-klikk eller dra-ramme.
    - Sanntidsindikator og tegnforklaring med antall per status.
    - Endringene logges med kilde «boligvelgeren».
  - **Visningstre:**
    - Dra og slipp blant søsken, også med tastatur.
    - Vinkelgrupper og startvisning.
    - Innstillinger: navn, type, forelder og vinkelgruppe.
    - Bytte av bilde, med varsel når sideforholdet er et annet.
    - Sletting.
  - **Publisering:**
    - Merket «Upubliserte endringer».
    - Forhåndsvisning av utkastet på desktop og mobil (iframe).
    - Kopier lenke og avpubliser.
    - Innstillinger for filtre, liste og skravur.
- **Publisert velger** (`/embed/selector/{id}`):
  - **Bilde og markeringer:**
    - Bildet har et SVG-lag og hentes som WebP i riktig størrelse (srcset).
    - Markeringene er lenker, så de virker med mus, berøring og tastatur (Tab og Enter) og har tekst for skjermlesere.
  - **Verktøytips** viser enhet, rom, BRA-i, pris og status. Markeringer som lenker til en visning, viser antall ledige boliger.
  - **Enhetskort:**
    - Plantegning, nøkkelinfo og totalpris.
    - Knappene «Se bolig», favoritt, sammenlign og «Vis i bildet».
    - Vises som bunnark på mobil.
  - **Filtre og liste:**
    - Filtre på status, rom, pris, areal og etasje, og på favoritter. Filteret ligger i adressen og kan deles.
    - Sorterbar liste: Enhet, Etasje, Rom, BRA-i, Pris og Status. Peker over listen markerer formen, og omvendt.
    - Favoritter lagres i nettleseren (localStorage). Inntil tre boliger kan sammenlignes.
  - **Navigasjon:**
    - Brødsmuler, tilbakeknapp og bytte mellom vinkler.
    - Nettleserens tilbakeknapp går til forrige visning.
  - **Mobil:** listen kommer først, og bildet ligger i egen fane med knipezoom, dobbelttrykk og zoomknapper.
  - **Solgte boliger** viser «Solgt». Prisen skjules når prosjektet er satt opp slik, også når status endres i sanntid.
  - **Sanntid** kommer via den offentlige kanalen, med én oppfriskning etter tilkobling.
- **Enhetsside** (`/embed/selector/{id}/bolig/{slug}`):
  - Galleri, plantegninger og nøkkelinfo.
  - Prisoppstilling: pris, omkostninger, totalpris, fellesgjeld og felleskostnader.
  - Beskrivelse, dokumenter og megler.
  - Status i sanntid.
- **Statusfarger:**
  - Per organisasjon (organisasjonsinnstillinger) og per prosjekt (prosjektinnstillinger).
  - Tomme felt arver.
  - Valget «Vis pris på solgte enheter» ligger i prosjektinnstillingene.
- **Database (migrasjon 0010):**
  - `save_view_hotspots` lagrer hele visningen i én transaksjon.
  - `reorder_selector_views`, `get_selector_publish_state` og `get_published_selector_project`.
  - `set_project_display_settings` endrer bare sine to nøkler i `projects.settings`.
- **Tester:**

  | Type | Antall | Nytt i fase 2 |
  |---|---|---|
  | pgTAP | 307 | 33 nye: lagring av markeringer (beholdt id, sletting, ugyldige former og lenker, markering fra en annen visning, mål i et annet prosjekt eller en annen velger), roller og lesemodus, rekkefølge, publiseringsstatus, oppslag uten innlogging, statusfarger og pris på solgte |
  | Vitest | 161 | 38 nye: koordinater og skalering (360, 768 og 1920 px), former, punkter og flytting, zoom, angre med minst 50 steg, filter i adressen, filterlogikk, visningstreet, statusfarger og tolking av publiserte data |
  | Playwright | 10 | 2 nye: akseptkriterium 2 (Status-modus til publisert velger, liste og enhetsside innen fem sekunder, uten ny publisering, med bruker og tidspunkt i loggen) og akseptkriterium 3 (markeringene ligger riktig på 360, 768 og 1920 px). Begge bygger velgeren i editoren: opplasting, polygon, rektangel, angre, kobling og publisering. |

**Gjenstår (ikke del av fase 2):**

- **«Meld interesse»** i enhetskortet og på enhetssiden kommer med interesseskjemaet og leads i fase 3. Knappen vises ikke før den virker.
- **Enhetssiden på prosjektsidens egen adresse** (`/bolig/{slug}` på underdomene eller eget domene) kommer med prosjektsiden i fase 3. Den bruker de samme komponentene. I fase 2 ligger enhetssiden under velgeren.
- **Innbyggingsskriptet** (web-komponent) og listen over domener som kan bygge inn, kommer i fase 4. `/embed/` kan allerede vises i en iframe.
- **Lenker til andre prosjekter** virker først når prosjektet har en publisert prosjektside (fase 3).
- **Egne felt på enheter** (`custom_fields`) flyttes til fase 3, sammen med Enhetsliste-blokken og enhetssiden på prosjektsiden. I fase 1 var de lovet til fase 2. Databasen sender allerede bare felt som er gjort offentlige.
- **Språk på offentlige sider** er bokmål. Organisasjonens språk tas i bruk med prosjektsiden i fase 3.
- **Mellomlager for publiserte sider:** data leses ferskt ved hver visning. Kort mellomlager med tagger vurderes i fase 5 (ytelse).

**Valg i fase 2:**

- **Autolagring sender hele visningen**, og databasen lagrer den i én transaksjon. Id-ene lages i nettleseren. Angre og gjør om kan derfor aldri gi en halvlagret visning, og rekkefølgen på lagringene spiller ingen rolle.
- **Angre gjelder visningen som er åpen.** Et steg endrer aldri en visning du ikke ser.
- **Koordinater lagres som andeler (0–1) med seks desimaler:**
  - SVG-laget har viewBox i bildepiksler og `vector-effect: non-scaling-stroke`, så kantlinjen er 2 px på alle skjermer.
  - Rammen har samme sideforhold som bildet, så markeringene treffer på alle bredder.
- **En kopi får ingen kobling**, så samme enhet ikke kobles to ganger ved et uhell.
- **Publiserte sider bruker en anonym klient med bare den publiserbare nøkkelen** og leser data ved hver visning. Sanntid tar endringene etterpå. Rett etter tilkobling hentes enhetene én gang, så en endring mellom sidevisning og tilkobling ikke går tapt.
- **Pris i sanntid:** blir en enhet solgt og prisen skal skjules, fjernes prisen også i nettleseren med en gang. Blir enheten ledig igjen, hentes prisen fra databasen.
- **Velger og enhetsside ligger under `/embed/selector/{id}` i fase 2**, så de kan vises i en iframe og testes nå.
- **Mobil:** listen vises først, fordi små markeringer er vanskelige å treffe med fingeren. Bildet ligger i egen fane, og kortet er et bunnark.
- **Startvisning:** den valgte visningen, ellers første visning øverst i treet.
- **Hurtigtaster** virker ikke mens man skriver i et felt eller er i en dialog eller meny.

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
