# Plan per fase

Hver fase avsluttes med grønne tester, typekontroll og lint, og en kort oppsummering av hva som er bygget, hva som gjenstår og hvilke valg som er tatt. Se også [arkitektur.md](arkitektur.md).

## Status

| Fase | Status |
|---|---|
| Datamodell og RLS | Godkjent |
| 0 Grunnmur | Ferdig, se oppsummeringen under fase 0 |
| 1 Prosjekter og enheter | Ferdig, se oppsummeringen under fase 1 |
| 2 Boligvelger | Ferdig, se oppsummeringen under fase 2 |
| 3 Prosjektside | Ferdig, se oppsummeringen under fase 3 |
| 4 Drift | Ferdig, se oppsummeringen under fase 4 |
| 5 Kvalitet | Ferdig, se oppsummeringen under fase 5 |
| 6 Pakker og oppstartsavgift | Ferdig, se oppsummeringen under fase 6 |
| 7 Oppfølging | Ferdig, se oppsummeringen under fase 7 |
| 8 Designstil Nordisk | Ferdig, se oppsummeringen under fase 8 |

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

### Oppsummering av fase 3

**Bygget:**

- **Prosjektside-editor** (`/{org}/projects/{prosjekt}/site`, fanen «Prosjektside»):
  - **Start fra mal:**
    - «Kommer for salg» (hero, kort tekst og interesseskjema) eller «Full prosjektside».
    - «Bygg ut til full prosjektside» legger til blokkene som mangler og lar resten være som de er.
    - Malteksten er på organisasjonens språk.
  - **Blokker:**
    - Legg til (alle 18 typer), dra i rekkefølge (også med tastatur), dupliser, skjul og vis, og slett med «Angre».
    - En skjult blokk beholder innholdet og vises gjennomsiktig i editoren.
  - **Skjema for alle 18 blokktyper:**
    - Beskrevet som data og validert med det samme Zod-skjemaet som lagringen.
    - Feil vises ved feltet, og utkastet lagres ikke før de er rettet.
    - Bilder og dokumenter velges fra mediebiblioteket, der nye filer også kan lastes opp.
    - Fremdrift, Kart og Kontaktpersoner bruker prosjektets data og kan overstyres i blokken.
  - **Forhåndsvisning i sanntid:**
    - Vises i en iframe, med valg mellom desktop, nettbrett og mobil.
    - Editoren sender utkastet med `postMessage` ved hver endring, så rammen ikke lastes på nytt.
    - Klikk på en blokk i forhåndsvisningen åpner skjemaet for blokken.
  - **Sider:**
    - Ny side, tittel og adresse.
    - SEO-tittel og -beskrivelse, og delingsbilde.
    - Rekkefølge, forside og sletting.
  - **Meny og bunntekst** redigeres ett sted. Menypunkter lenker til sider, blokker på forsiden eller adresser.
  - **Tema:**
    - Logo, fire farger med kontrastvarsel, skrift for overskrifter og brødtekst, og knappestil.
    - Arves fra merkevareprofilen og kan overstyres per prosjektside.
  - **Innstillinger:** underdomene, standardverdier for SEO, og sletting.
  - **Autolagring** 0,8 s etter siste endring, per side og for innstillingene. Varsel før siden lukkes med endringer som ikke er lagret.
  - **Publisering:**
    - Publiser, avpubliser og merket «Upubliserte endringer».
    - Delt forhåndsvisning uten innlogging: signert lenke som virker i sju dager.
    - Versjonshistorikk per side, med gjenoppretting til utkastet.
- **Merkevareprofil** (`/{org}/settings/brand`): logo, farger, skrift og knappestil for alle prosjektsider. Endringer går ut på publiserte sider med en gang.
- **Publisert prosjektside** på `{underdomene}.[PLATTFORMDOMENE]`:
  - **Adresse:** `proxy.ts` skriver vertsnavnet om til `/sites/{nøkkel}`. Egne domener slås opp på samme måte og kobles til Vercel i fase 4.
  - **Blokker:**
    - Alle 18 blokker.
    - Boligvelger-blokken bruker den publiserte velgeren fra fase 2, med filter, liste, kort og sanntid.
    - Tomme blokker vises ikke for besøkende. I editoren vises de med et hint.
  - **Enhetssiden** `/bolig/{slug}` ligger på prosjektsidens egen adresse.
  - **Språk:** følger organisasjonen (bokmål, engelsk eller svensk), også `lang` på siden.
  - **SEO:**
    - Tittel, beskrivelse og kanonisk adresse.
    - Open Graph med delingsbilde.
    - Strukturerte data: ApartmentComplex, FAQPage, og Apartment med Offer.
    - `sitemap.xml` og `robots.txt` per prosjektside.
  - **Mellomlager med cache-tagger:** tømmes ved publisering og statusendring, og ved endring av enheter, prosjekt, boligvelger og merkevare. Testen for akseptkriterium 5 viser at en ny sidevisning har ny status med en gang.
- **Interesseskjema** (blokken, enhetssiden og boligvelgeren):
  - **Felt:** navn, e-post, telefon, beskjed og valgfri enhet.
  - **Samtykke:** påkrevd til kontakt, valgfritt til lignende prosjekter. Lagres med tidspunkt og tekstversjon.
  - **Spam:**
    - Honeypot.
    - Turnstile når nøklene er satt.
    - Rate limit i databasen: 5 per 10 minutter per IP og 5 per time per e-post. IP-adressen lagres bare som hash.
  - **Lagring:** serveren legger inn leadet med `submit_lead` og service-nøkkelen. Nøkkelen brukes bare på serveren.
  - **E-post:**
    - Varsel til kontaktpersonene som får varsel om leads. Har prosjektet ingen, får eiere og administratorer varselet.
    - Kvittering til avsender.
    - Resend i drift. Mailpit lokalt og i CI, så testene kan lese e-posten.
- **Leads i admin:**
  - Hovedmenyen «Leads», prosjektfanen «Leads» og «Siste leads» på prosjektoversikten.
  - Liste med søk og filter på status, prosjekt og enhet. Filtrene ligger i adressen.
  - **Detaljvisning:**
    - Kontaktinformasjon og beskjed.
    - Enhet, kilde, kampanje (UTM) og om varsel er sendt.
    - Samtykketeksten slik avsenderen godtok den.
  - Status (ny, kontaktet, avsluttet) og internt notat.
  - CSV-eksport med de samme filtrene.
  - Sletting av én henvendelse, eller alle fra samme e-postadresse (eier og administrator).
- **Lovet fra fase 2:**
  - «Meld interesse» i enhetskortet og på enhetssiden, med skjemaet forhåndsutfylt med enheten.
  - Enhetssiden på prosjektsidens egen adresse.
  - **Egne felt på enheter:**
    - Fanen «Egne felt» i enhetsskjemaet.
    - Valg av offentlige felt i prosjektinnstillingene.
    - Visning på enhetssiden.
  - Lenker fra boligvelgeren til andre prosjekter med publisert prosjektside.
  - Organisasjonens språk på publiserte sider.
- **Database (migrasjon `20261112230000_fase3_prosjektside_og_leads`):**
  - `create_site`, `set_home_page`, `reorder_pages`, `restore_page_version` og `get_site_publish_state`.
  - `set_public_custom_fields`.
  - `submit_lead`, som bare service-rollen kan kjøre.
  - `get_public_unit` sender også organisasjonens navn og språk.
- **Tester:**

  | Type | Antall | Nytt i fase 3 |
  |---|---|---|
  | pgTAP | 359 | 52 nye: prosjektside fra mal med sider, forside, meny og rekkefølge; reserverte og opptatte adresser; roller og andre organisasjoner; publiseringsstatus; gjenoppretting av versjoner med revisjonslogg; offentlige egne felt; og `submit_lead` (bare service-rollen, samtykke, prosjekter som ikke er publisert, skjulte enheter, enheter og sider utenfor prosjektet, rate limit og mottakere) |
  | Vitest | 203 | 42 nye: blokker og maler, utbygging til full side, lenker, adresser, tema og kontrast, rik tekst, video, signerte tokener, vertsnavn, skjemaene for blokkene (også at alle tekster finnes), leadsfiltre og CSV, samtykketekster og egne felt |
  | Playwright | 12 | 2 nye: akseptkriterium 5 og akseptkriterium 1 til publisering. Se under. |

  - **Akseptkriterium 5:**
    - En besøkende filtrerer på 3 rom og ledig, åpner A-302 og sender interesseskjemaet. Uten samtykke sendes ingenting.
    - Leadet vises i admin med riktig enhet og samtykke.
    - Kontaktpersonen får e-post, og avsenderen får kvittering.
    - Testen dekker også status og notat, filter og CSV, egne felt på enhetssiden, og at en statusendring vises med en gang på en ny sidevisning.
  - **Akseptkriterium 1 til publisering:**
    - En ny bruker registrerer seg, oppretter prosjekt og importerer 24 enheter fra CSV.
    - Brukeren laster opp fasadebildet, markerer alle 24 vinduene, kobler dem til hver sin enhet og publiserer velgeren.
    - Brukeren velger malen «Full prosjektside», endrer tittelen og ser endringen i forhåndsvisningen.
    - Den delte forhåndsvisningen virker uten innlogging.
    - Den publiserte siden på underdomenet viser alle 24 enhetene i boligvelgeren, med SEO, sitemap, robots og versjonshistorikk.

**Gjenstår (ikke del av fase 3):**

- **Egne domener, Stripe, innbyggingsskriptet, samtykkebanner og sporing** kommer i fase 4, som planlagt.
- **Webhook for `lead.created`:** hendelsen legges allerede i utboksen. Utsendingen kommer med integrasjonene i fase 4.
- **Egne felt i import og eksport (CSV):** egne felt redigeres i enhetsskjemaet. Ukjente kolonner i importen blir ikke egne felt ennå.
- **Språk per bruker i admin** er ikke gjort, selv om fase 0 sa at det skulle komme her.
  - Spesifikasjonen krever bokmål som standard og tekst klar for engelsk og svensk. Det er oppfylt.
  - Publiserte sider følger organisasjonens språk.
  - Språk per bruker krever at admin-skallet rendres per bruker. Jeg foreslår å vurdere det i fase 5.
- **Angre og gjør om i blokkeditoren** er ikke bygget, fordi spesifikasjonen ikke krever det for prosjektsiden. Sletting av en blokk kan angres, og publiserte versjoner kan gjenopprettes.

**Valg i fase 3:**

- **Én modell for blokker:** en blokk er `{id, type, hidden, props}`.
  - Zod-skjemaene har standardverdier, så eldre blokker tåler nye felt.
  - Ugyldige blokker hoppes over ved visning. Én feil stopper derfor aldri hele siden.
- **Samme komponenter overalt:** de samme komponentene viser den publiserte siden, den delte forhåndsvisningen og forhåndsvisningen i editoren. Det som vises i editoren, er det som publiseres.
- **Forhåndsvisningen i editoren er en iframe** på samme opprinnelse.
  - Iframen gir riktige brytepunkter for mobil og nettbrett.
  - Bare `/site-preview/` kan vises i en iframe, og bare fra admin (`frame-ancestors 'self'`).
- **Forhåndsvisningslenken:**
  - Lenken er signert med HMAC-SHA256. Nøkkelen avledes fra service-nøkkelen med HKDF, så det trengs ingen ny hemmelighet.
  - Lenken virker i sju dager og viser alltid det nyeste utkastet.
  - Siden har `noindex`, og skjemaer kan ikke sendes fra den.
- **Tekst i blokkene er enkel markdown** (overskrifter, lister, fet, kursiv og lenker). Det rendres aldri HTML, og lenker kontrolleres.
  - Innbygging krever https og vises i en avgrenset iframe (sandbox).
  - Video lastes først når besøkende klikker (YouTube uten informasjonskapsler, Vimeo med `dnt`).
- **Mellomlager:**
  - Publiserte data mellomlagres i 5 minutter og tømmes med tagger når noe endres. Statusendringer går dessuten ut i sanntid som i fase 2.
  - Sletting av en side og endring av underdomene gjelder publiserte sider med en gang.
- **Leads:**
  - Leads legges bare inn av serveren etter honeypot, Turnstile og rate limit.
  - Samtykketekstene ligger i koden med versjon. Endres teksten, må versjonen endres, og gamle tekster beholdes. Detaljvisningen viser teksten slik avsenderen godtok den.
- **Redaktører ser ikke leads.** Det følger rollemodellen fra fase 0: meglere, administratorer og eiere ser leads.

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

### Oppsummering av fase 4

**Bygget:**

- **Egne domener** (Innstillinger → Domener, eier og administrator):
  - Domenet legges til på en prosjektside. Plattformens egne adresser og ugyldige toppdomener avvises.
  - **DNS-veiledning:** TXT-post for eierskap, og CNAME (underdomene) eller A (rotdomene) for trafikken. Hver post har kopiknapp og status. Har domenet vært i bruk hos en annen Vercel-konto, vises også posten Vercel krever.
  - **Automatisk bekreftelse:**
    - Oppslag med DNS over HTTPS, og Vercel sin vurdering når kontoen er koblet til.
    - «Sjekk nå», og en planlagt sjekk hvert femte minutt det første døgnet og deretter hver time.
    - Siden lastes inn på nytt mens noe venter.
  - **Sertifikat:** domenet legges til i Vercel-prosjektet med Domains API, og Vercel lager sertifikatet.
  - **Primærdomene:**
    - Første bekreftede domene blir primærdomene, og det kan byttes.
    - Kanonisk adresse, sitemap og Open Graph bruker det.
    - Underdomenet og andre domener sender besøkende dit (308) med sti og filter.
  - **Fjerning:** domenet tas bort fra Vercel bare når ingen andre prosjektsider har samme vertsnavn.
- **Abonnement med Stripe** (Innstillinger → Abonnement, bare eier):
  - **Prøveperiode:** 30 dager uten kort, med plass til tre aktive prosjekter.
  - **Planene Start, Vekst og Proff** har plass til 1, 5 og 15 aktive prosjekter. Prisene hentes fra Stripe.
  - **Checkout:** velges en plan under prøveperioden, starter abonnementet med resten av prøveperioden.
  - **Kundeportal:** betalingsmåte, fakturaer, bytte av plan og oppsigelse.
  - **Webhook:** henter alltid abonnementet på nytt fra Stripe, så hendelser i feil rekkefølge ikke kan sette en gammel tilstand.
  - **Grensen for aktive prosjekter** håndheves i databasen. Feilmeldingen i veiviseren og innstillingene forklarer hva man kan gjøre.
  - **Bannere i admin:** prøveperioden slutter om sju dager eller mindre, betalingen feilet, eller lesemodus. Eieren får lenke til Abonnement, andre får beskjed om å kontakte eieren.
  - **Varsel på e-post** til eierne sju dager og ett døgn før prøveperioden er ute, og når organisasjonen går i lesemodus. E-posten sier at publiserte sider aldri tas ned.
  - **Plattformadmin** kan forlenge prøveperioden med 14 dager. Det logges.
- **Innbygging:**
  - **Web-komponenten** `<boligvelger-embed>` (`/embed/v1.js`) viser den publiserte velgeren med alt fra fase 2: filtre, liste, enhetskort, enhetssider, interesseskjema og sanntid.
  - **Attributter:** startvisning, filtre, liste, høyde og tittel.
  - **Hendelser** til vertssiden: `ready`, `navigate` og `lead`. Med `sync-url` huskes enhetsside og filter i adressen.
  - **Iframe som reserve** for nettsteder uten skript. Uten skript vises iframen i `<noscript>` alene.
  - **Kode i admin:** «Bygg inn på nettsted …» i boligvelgeren, med fanene Web-komponent, Iframe og API.
- **Offentlig lese-API med CORS** (`/api/public/v1`): publisert boligvelger, enheter og én enhet. Bare publiserte data, og mellomlager i høyst fem sekunder.
- **Samtykke og sporing:**
  - **Sporingskoder** (Google Analytics 4, Tag Manager og Meta Pixel) i prosjektinnstillingene. De kontrolleres strengt i appen og i databasen.
  - **Samtykkebanner** med «Godta alle», «Bare nødvendige» (like enkel å velge) og «Velg selv», og «Endre samtykke» i bunnteksten.
  - **Ingenting lastes før samtykke.** Google Consent Mode får de samme valgene. Trekkes samtykket tilbake, slettes informasjonskapslene, og siden lastes på nytt.
  - **Genererte sider** `/personvern` og `/informasjonskapsler`, laget fra:
    - behandlingsansvarlig, organisasjonsnummer og e-post (nytt under Innstillinger i prosjektsiden),
    - lagringstiden for leads,
    - sporingskodene som er i bruk.
  - **Konvertering:** sendte interesseskjema måles som konvertering for besøkende som har samtykket.
- **Integrasjoner** (Innstillinger → API, eier og administrator):
  - **API-nøkler:** navn, tilganger (`projects:read`, `units:read`, `units:write`, `leads:read`) og utløp. Nøkkelen vises bare én gang, og kan trekkes tilbake.
  - **API med nøkkel** (`/api/v1`):
    - prosjekter, enheter (også skjulte, med ekstern id og endringer siden et tidspunkt), og leads (nye siden et tidspunkt),
    - endring av status med notat og pris på én enhet.
    - Rate limit og lesemodus gjelder.
  - **Webhooks:**
    - Hendelser og prosjekter velges. Private adresser avvises.
    - Hemmeligheten kan vises og fornyes.
    - Testhendelse, logg over de siste leveransene og «Prøv igjen».
  - **Utsending:**
    - Signatur etter Standard Webhooks.
    - Sendes rett etter endringen, og fra en planlagt jobb hvert minutt.
    - Nye forsøk i omtrent to timer.
    - Vern mot SSRF også ved DNS-oppslag. Omdirigeringer følges ikke.
  - **Hendelsene** har nå enhetens eksterne id og kilden til endringen.
- **Planlagte jobber** (Vercel Cron, med `CRON_SECRET`): webhooks hvert minutt, domener hvert femte minutt, og varsler om prøveperioden daglig.
- **Rettet fra fase 3:** import av enheter tømmer nå mellomlageret for publiserte prosjektsider.
- **Rettet fra fase 1:** i enhetstabellen lagret Enter en celle to ganger, og fokus gikk tapt etterpå. Alle cellene ble dessuten montert på nytt etter hver lagring, så en åpen statusmeny kunne lukkes. Det gjorde en ende-til-ende-test ustabil.
- **Database** (migrasjon `20261113090000_fase4_drift`):
  - **Planer og grense** for aktive prosjekter.
  - **Stripe (bare service-rollen):** `link_stripe_customer`, `apply_stripe_subscription`, `due_billing_notices` og `mark_billing_notice`.
  - **Støtte og domener:** `extend_trial` for plattformadmin, `record_domain_check` og `domains_due_for_check` (bare service-rollen), og `set_primary_domain`.
  - **API med nøkkel:** `api_projects`, `api_units`, `api_update_unit` og `api_leads`.
  - **Webhooks:** testhendelse, «Prøv igjen», henting av én leveranse og kontroll av sporingskoder.
  - **Revisjonsloggen** viser API-nøkkelen som aktør.
- **Tester:**

  | Type | Antall | Nytt i fase 4 |
  |---|---|---|
  | pgTAP | 467 | 108 nye: plangrenser, Stripe-synk (rekkefølge, ubetalte og gamle abonnementer, lesemodus), varsler, forlenget prøveperiode, domenesjekk (bekreftelse, varsel, opptatt vertsnavn, primærdomene, grense), sporingskoder, API med nøkkel (ugyldig, trukket tilbake og utløpt nøkkel, tilganger, isolasjon mellom organisasjoner, validering, lesemodus, rate limit, revisjonslogg) og webhooks (testhendelser, nye forsøk, avslåtte webhooks og vedlikehold) |
  | Vitest | 287 | 84 nye: vertsnavn, DNS-oppslag, vurdering av domener, Vercel-klienten, videresending til primærdomenet, planer, Stripe-hendelser og webhook med ekte signaturkontroll, web-komponenten (jsdom) og innbyggingskoden, samtykke og sporingskoder, SSRF-vern, signatur mot eksempelet i Standard Webhooks, levering og API-nøkler |
  | Playwright | 16 | 4 nye, se under |

  - **Akseptkriterium 4:**
    - En Boligvelger-blokk legges på prosjektsiden og publiseres.
    - Eget domene legges til og bekreftes med DNS.
    - Den publiserte siden på eget domene viser velgeren med markeringene og riktig kanonisk adresse.
    - Underdomenet sender videre til primærdomenet.
    - Testen dekker også innbyggingskoden på en annen side, hendelsen fra web-komponenten og det offentlige API-et.
  - **Abonnement:**
    - Plangrensen stopper et fjerde aktivt prosjekt i prøveperioden.
    - Når prøveperioden er ute, gir det lesemodus, banner og e-post.
    - Betaling i Checkout (etterlignet) via webhook gjør organisasjonen aktiv. Kundeportalen virker.
  - **Samtykke:**
    - Ingen sporing lastes før samtykke, og «Bare nødvendige» huskes.
    - «Endre samtykke» til statistikk laster bare Google Analytics.
    - Personvernsidene viser behandlingsansvarlig og verktøyene som brukes.
  - **API og webhooks:**
    - API-nøkkelen lages i admin, leser prosjekter og endrer status. Leads avvises uten tilgang.
    - En privat webhookadresse avvises.
    - Testhendelsen og statusendringen står i leveranseloggen.
    - En nøkkel som er trukket tilbake, virker ikke.
  - **Etterligning av Stripe og DNS over HTTPS** (`e2e/support/fake-services.mjs`): Playwright starter den, så hele flyten testes uten kontoer.

**Gjenstår (ikke del av fase 4):**

- **Ikke testet mot ekte tjenester:**
  - Stripe og Vercel Domains API er bygget etter dokumentasjonen og testet mot etterligninger og med enhetstester, men ikke mot ekte kontoer, fordi kontoene ikke finnes ennå.
  - Når kontoene er opprettet, bør det kjøres en prøve i Stripe sin testmodus og med et ekte domene.
- **Planer og priser er standardvalg.** Åpent spørsmål 3 er ikke besvart:
  - Grensene (1, 5 og 15 aktive prosjekter, og 3 i prøveperioden) og plannavnene er mitt forslag.
  - Prisene settes i Stripe.
  - Enterprise avtales særskilt og settes av plattformadmin i databasen.
- **Sertifikatstatus vises ikke i admin.** Vercel lager sertifikatet når DNS peker riktig, men admin viser bare at domenet er bekreftet.
- **Eierskifte for domener:** et bekreftet domene beholdes til det fjernes. Bytter domenet eier, må plattformadmin fjerne det fra den gamle prosjektsiden.
- **Webhooks som feiler over tid** slås ikke av automatisk. Admin viser antall feil på rad.
- **Fra fase 3, fortsatt utsatt:** egne felt i CSV-import og -eksport, språk per bruker i admin, og angre og gjør om i blokkeditoren.
- **Ikke lagt til noen fase ennå:** spesifikasjonens sjekkliste for oppstart på prosjektoversikten og «verdi solgt» i prosjektoversikten. Jeg foreslår å ta dem i fase 5.

**Valg i fase 4:**

- **Bekreftelse av egne domener:**
  - **Egen TXT-post for eierskap,** i tillegg til Vercel. Alle kundene deler ett Vercel-prosjekt, så Vercel alene kan ikke avgjøre hvilken kunde som eier et domene.
  - **DNS over HTTPS** gir ferske svar og kan etterlignes i testene. Uten Vercel-konto (lokalt og i CI) sjekkes domenene bare med DNS.
- **Videresending til primærdomenet** skjer i proxyen med en kort hukommelse per serverinstans (ett minutt). Dermed blir det en ekte 308 og ikke en omdirigering i nettleseren.
- **Stripe:**
  - Abonnementet hentes alltid på nytt fra Stripe i webhooken, i stedet for å stole på innholdet i hendelsen. Stripe-API-versjonen er låst.
  - Prøveperioden styres av appen (uten kort) til en plan velges. Deretter tar Stripe over prøveperioden.
- **Aktive prosjekter** telles etter fase, som foreslått i åpent spørsmål 3. Publiserte sider tas aldri ned, heller ikke når grensen er nådd eller abonnementet er utløpt.
- **Web-komponenten bruker en iframe inne i shadow DOM.** Da virker alt i den publiserte velgeren på samme måte overalt: tastatur, skjermleser, sanntid og interesseskjema. En egen versjon av velgeren for vertssiden ville gitt dobbelt vedlikehold.
  - Høyden er fast etter skjermen (85vh). En ramme som vokser med innholdet, ville skjøvet enhetskortet og andre dialoger ut av synsfeltet på vertssiden.
  - Iframen er reserven for nettsteder uten skript.
- **Samtykke:**
  - Banneret vises bare når prosjektet har sporingskoder. Uten sporing trengs ikke samtykke.
  - Valget lagres i nettleseren (localStorage) i tolv måneder, med versjon.
- **Personvern:**
  - Behandlingsansvarlig ligger i prosjektsidens innstillinger (`cookie_settings`) og publiseres med siden.
  - Sporingskodene ligger på prosjektet (`analytics_ids`), som i spesifikasjonen, og gjelder med en gang.
- **API med nøkkel går gjennom databasefunksjoner** som finner organisasjonen fra nøkkelen. Serveren bruker service-nøkkelen, men et kall kan likevel aldri nå en annen organisasjon. API-et har ingen CORS, så nøkler ikke havner i nettlesere.
- **Webhooks følger Standard Webhooks,** så mottakere kan bruke ferdige bibliotek for å kontrollere signaturen.
- **Stripe-biblioteket** (`stripe`) er lagt til som avhengighet. Det hører til Stripe Billing i spesifikasjonen.

## Fase 5: Kvalitet

- **Universell utforming:** WCAG 2.1 AA, med axe i Playwright og manuell test med tastatur og skjermleser.
- **Ytelse:** LCP under 2,5 s på mobil (Lighthouse CI), bilder i riktig størrelse og lat lasting.
- **Akseptkriterier:** alle seks som ende-til-ende-tester.
- **Demodata:**
  - Demo Bolig AS med prosjektet Fjordparken: 24 leiligheter på fire etasjer.
  - SVG-fasade med ferdige markeringer.
  - Publisert prosjektside.
- **Drift og personvern:** GDPR-eksport per person og driftsrutiner.
- **Forslag til resten fra tidligere faser:** sjekklisten for oppstart og «verdi solgt» ble godkjent og tatt med. Egne felt i CSV-import og -eksport og språk per bruker i admin ble ikke valgt, og er fortsatt utsatt.

### Oppsummering av fase 5

**Bygget:**

- **Prosjektoversikt (modul 5):**
  - «Verdi solgt»: summen av prisen på solgte enheter, med beskjed hvis noen solgte enheter mangler pris.
  - Sjekkliste for oppstarten: organisasjon, prosjekt, enheter, bilde og markeringer («18 av 24 enheter markert»), mal og publisering, med lenke til neste steg. Den vises til alt er gjort.
  - Tallene kommer fra `project_overview`, som følger RLS.
- **Demodata** (`npm run demo`): Demo Bolig AS med Fjordparken.
  - 24 leiligheter på fire etasjer.
  - Fasade i SVG med én markering per leilighet.
  - Publisert boligvelger og prosjektside fra malen «Full prosjektside», med visninger og ofte stilte spørsmål.
  - To statusendringer og tre leads.
  - Skriptet logger inn som brukeren og bruker de samme databasefunksjonene som appen.
- **Universell utforming:**
  - axe (WCAG 2.1 A og AA) i ende-til-ende-testene på alle publiserte sidetyper, på desktop og mobil og med samtykkebanneret, og på de viktigste sidene i admin. Ingen brudd.
  - Tastaturtest av boligvelgeren, se under.
- **Ytelse:**
  - Publiserte sider er ferdige statiske sider per prosjektside og mellomlagres. Cache-taggene tømmes som før ved publisering og statusendring.
  - HTML-en til demoens forside gikk fra 438 KB til 184 KB.
  - Lighthouse CI (`npm run lighthouse`) i hver kjøring av CI, på mobil: median LCP 1,7–1,8 s, og krav til CLS, bildestørrelser og lat lasting.
- **Alle seks akseptkriteriene som ende-til-ende-tester:**
  - 1 i `fase3.spec.ts`, nå med sjekklisten.
  - 2 og 3 i `fase2.spec.ts`.
  - 4 i `fase4.spec.ts`.
  - 5 i `fase3.spec.ts`.
  - 6 i `fase5.spec.ts`: en innlogget bruker i organisasjon A prøver alle tabeller, skriving, databasefunksjoner og lagring i organisasjon B gjennom API-et. Ingen rader, ingen endringer.
- **Personvern:**
  - Innsyn for én person som JSON-fil: henvendelser med internt notat, samtykket med den eksakte teksten, og hvilke systemer kopier er sendt til. Uthentingen logges uten hvem det gjaldt.
  - Sletting for én person tar nå også kopiene i webhook-loggen og telleren for rate limit.
  - Begge deler virker i lesemodus.
- **Drift:**
  - Helsesjekk på `/api/health` for overvåking av oppetid.
  - [drift.md](drift.md): underleverandører og regioner, utrulling, overvåking, planlagte jobber, sikkerhetskopi, nøkkelrotasjon, hendelser og brudd på personopplysningssikkerheten, og personvern i drift.
- **Rettet fra tidligere faser:**
  - **Sletting av prosjekt med enheter** (fase 1) stoppet på revisjonsloggen. AFTER-triggere i en kaskade kjører etter den ytre setningen, så kontrollen av triggerdybden fanget dem ikke. Nå kan også hele organisasjoner slettes.
  - **Fokus etter dialoger** som åpnes fra kode, for eksempel enhetskortet (fase 2), gikk til body. Nå går det tilbake dit det var.
  - **Teksten i hero** hadde for lav kontrast over lyse bilder (fase 3).
  - **Tabellen på `/informasjonskapsler`** kunne ikke rulles med tastatur på mobil (fase 4).
  - **Knappene for organisasjon og brukermeny** hadde et navn uten den synlige teksten, og lenkene i kartets kildehenvisning ble bare skilt fra teksten med farge.
  - **Skriften for overskrifter** fra temaet ble ikke brukt på prosjektsidene (fase 3).
  - **Sletting av leads (GDPR)** var stoppet i appen i lesemodus, selv om databasen tillot den.
  - **All tekst i admin** fulgte med hver publiserte side.
- **Tester:**

  | Type | Antall | Nytt i fase 5 |
  |---|---|---|
  | pgTAP | 494 | 27 nye: prosjektoversikten (verdi, markerte enheter, publisering, isolasjon), sletting av prosjekt og organisasjon, og innsyn og sletting for én person (også i lesemodus, uten personopplysninger i loggen) |
  | Vitest | 310 | 23 nye: prosjektoversikten og sjekklisten, demodata (24 leiligheter, markeringer uten overlapp, visninger) og innsynsfilen |
  | Playwright | 23 | 7 nye: axe på publiserte sider (desktop og mobil) og i admin, tastaturtest av boligvelgeren, akseptkriterium 6, innsyn og sletting, og helsesjekken |
  | Lighthouse CI | 3 sider | Forside, enhetsside og personvern på mobil, tre kjøringer hver |

**Gjenstår:**

- **Ikke testet med en ekte skjermleser** (NVDA eller VoiceOver) eller av personer som bruker hjelpemidler. Tastatur og ARIA er testet automatisk.
- **Lighthouse sin simulering** og PageSpeed Insights viser LCP på 3,9–4,4 s for demosiden. De regner med alle skript som er bedt om før første tegning. Med ekte struping er LCP 1,7–1,8 s. Vil dere også ha simuleringen under 2,5 s, må JavaScript på sidene ned fra om lag 380 KB (gzip). Det største er React, Zod og oversettelsene.
- **Kontoer og produksjon:** som før er ingenting testet mot ekte Stripe, Vercel, Resend, Sentry eller Supabase i skyen. Sikkerhetskopi av filer i Storage og overvåking av oppetid må settes opp når kontoene finnes (se drift.md).
- **Utsatt fra før:** egne felt i CSV-import og -eksport, språk per bruker i admin, og angre og gjør om i blokkeditoren.
- **Content-Security-Policy med nonce** er ikke lagt til. Sikkerhetshodene ellers er på plass. En nonce lages per forespørsel, og passer derfor ikke med de statiske publiserte sidene. For admin, som rendres per forespørsel, kan den legges til.

**Valg i fase 5:**

- **Statiske publiserte sider** med `ensureStatic = "navigation"` og en plassholder i `generateStaticParams`, i stedet for å strømme innholdet ved hvert besøk. Det gir raskere sider og billigere drift. Ferskheten styres av de samme cache-taggene som før. Første besøk på en ny prosjektside venter på at siden lages.
- **Filtre fra adressen** brukes etter at siden er lastet. Den statiske siden viser alle boligene, så innholdet står i HTML-en for søkemotorer og for besøkende uten JavaScript.
- **Lighthouse med struping i nettleseren** (DevTools) i stedet for Lighthouse sin simulering. Begrunnelsen står i `lighthouserc.yml` og drift.md.
- **Demodata med et skript** som logger inn som en vanlig bruker, ikke med SQL. Da gjelder RLS og de samme databasefunksjonene som i appen, og skriptet går ikke i stykker når datamodellen endres.
- **Innsyn inneholder internt notat.** Retten til innsyn gjelder alle opplysninger som er lagret om personen.
- **Nye utviklingsavhengigheter:** `tsx` (skriptet), `@axe-core/playwright` (universell utforming) og `@lhci/cli` (Lighthouse CI). Alle er bare for utvikling og test, og ingenting i stacken er byttet ut.

## Fase 6: Pakker og oppstartsavgift

Bestilt 12.11.: produktet heter **excip** inntil videre (navn og domene er ikke bestemt), og pakkene og prisene skal være de samme som hos propti.no, men noe lavere. Kontoene opprettes av eieren.

Propti hadde 12.11.: tre månedspakker (Prosjektside 990, Pro 2 490 og Partner 4 490 kr uten mva., 3–6 måneders binding) og en oppstartsavgift per prosjekt etter antall enheter (7 900–54 900 kr, over 199 enheter etter avtale). Modellen ble valgt med disse spørsmålene:

- **Prismodell:** som Propti, med pakker etter funksjoner og oppstartsavgift per prosjekt, i stedet for planer etter antall aktive prosjekter. Erstatter linjen om abonnement i spesifikasjonen.
- **Bindingstid:** ingen.

### Oppsummering av fase 6

**Bygget:**

- **Pakkene** (omtrent 10 % under Propti, kroner per måned uten mva.):

  | | Prosjektside | Pro | Partner |
  |---|---|---|---|
  | Pris | 890 | 2 190 | 3 990 |
  | Brukere | 3 | 10 | ingen grense |
  | Egne domener per prosjektside | 1 | 10 | 10 |
  | API, webhooks og innbygging | | ja | ja |
  | Oppsett, opplæring og prioritert support | | | ja |

  - Prøveperioden (30 dager uten kort) har det samme som Pro.
  - Grensene håndheves i databasen og vises i admin: invitasjoner, domener, API-nøkler, webhooks, det åpne lese-API-et og innbygging på andre nettsteder.
  - Det som finnes, beholdes etter bytte til en mindre pakke, men det kan ikke legges til mer.
  - Grensen for aktive prosjekter er fjernet.
- **Oppstartsavgift og lansering:**

  | Enheter | 1–9 | 10–19 | 20–39 | 40–69 | 70–99 | 100–149 | 150–199 | 200+ |
  |---|---|---|---|---|---|---|---|---|
  | Pris | 6 900 | 11 900 | 15 900 | 21 900 | 26 900 | 35 900 | 49 900 | avtale |

  - Et prosjekt kan ikke publiseres før det er lansert.
  - Ny side **Lansering** i prosjektmenyen: nivå, betaling i Stripe Checkout, betalinger og utvidelse.
  - Avgiften dekker et nivå. Flere enheter krever utvidelse, der forskjellen mellom nivåene betales.
  - Sjekklisten på prosjektoversikten har fått steget «Lanser prosjektet».
  - Publisering uten lansering gir beskjed med snarvei til Lansering.
  - Lansering etter avtale (mer enn 199 enheter, demo, support) med `waive_project_launch()`.
- **Abonnementssiden** viser pakkene med innhold og pris fra Stripe, prislisten for oppstart og vilkårene.
- **Navnet excip** i appen, e-postavsenderen, TXT-posten for egne domener (`_excip`, kan endres med `DOMAIN_TXT_PREFIX`) og User-Agent for webhooks. Navnet settes med `NEXT_PUBLIC_PRODUCT_NAME`.
- **Sjekkliste for kontoene** i [kontoer.md](kontoer.md): regioner, produkter og priser i Stripe, kundeportal, webhook og alle miljøvariablene.
- **Tester:**

  | Type | Antall | Nytt i fase 6 |
  |---|---|---|
  | pgTAP | 553 | 65 nye i `012_fase6`: grenser per pakke, API og webhooks etter bytte av pakke, innbygging, lansering før publisering, betaling (feil økt, feil beløp, flere registreringer), utvidelse, frafall, tak på enheter og hvem som ser betalingene. De 13 testene for grensen for aktive prosjekter er erstattet. |
  | Vitest | 327 | 17 nye: nivåene og prisberegningen for oppstart, pakkene og webhooken for oppstartsavgiften |
  | Playwright | 24 | Ny: publisering stoppes, pakke og oppstartsavgift i Checkout, publisering, og sperrene i Prosjektside. Testen for abonnement bruker de nye pakkene. Lansering og abonnement er med i axe-testen. |

**Gjenstår:**

- **Ikke testet mot ekte Stripe.** Flyten er testet med etterligningen. Når kontoen finnes, bør hele flyten gås gjennom i testmodus (se kontoer.md).
- **Partner** sine tjenester (oppsett, opplæring og prioritert support) leveres utenfor appen. Proptis Pro og Partner har også tilvalg, BankID-signering, salgsprospekt, meldinger til kjøpere og 360°-visning. Ingen av delene finnes i excip.
- **Lansering etter avtale** gjøres med SQL (drift.md). Det finnes ingen knapp for det i plattformadmin. (Rettet i fase 7.)
- **Avgift ved flere enheter enn betalt** sperrer nye enheter til forskjellen er betalt. Skjulte enheter teller med. Bare enheter som slettes, frigjør plass.

**Valg i fase 6:**

- **Pakkene som Propti, med innhold excip har.** Prosjektside har prosjektside, boligvelger, leads og sporing. Pro har i tillegg integrasjonene (API, webhooks, innbygging) og flere brukere og domener. Partner har ingen grense for brukere, og tjenester fra oss.
- **Grensene per organisasjon**, ikke per prosjekt som hos Propti, fordi brukere og domener hører til organisasjonen i excip.
- **Prisene** er omtrent 10 % under Propti, rundet til priser som slutter på 90 eller 900.
- **Månedsprisene i Stripe, oppstartsavgiften i koden.** Avgiften regnes ut fra antall enheter og forskjellen mellom nivåer. Det krever ett produkt i Stripe og ingen priser. Beløpet kontrolleres når betalingen registreres.
- **Betalingen registreres to steder** (retur fra Checkout og webhook), så prosjektet er lansert med en gang kunden kommer tilbake.
- **Innbygging sperres bare på andre nettsteder.** Lenken til den publiserte velgeren og prosjektsiden virker i alle pakkene.
- **Interne navn er beholdt:** pakkenavnet i `package.json`, `project_id` i Supabase, prefikset `bpk_` på API-nøkler og web-komponenten `<boligvelger-embed>`. De vises ikke for kunder (nøkkelprefikset vises, men gamle nøkler ville sluttet å virke). De kan endres når navnet er bestemt.

## Fase 7: Oppfølging

Alt i spesifikasjonen er bygget. Fase 7 tar det som sto igjen og ikke trenger kontoene: support for lansering etter avtale, synlige grenser i pakkene, og angre og gjør om i blokkeditoren.

### Oppsummering av fase 7

**Bygget:**

- **Plattformadmin → organisasjon:** pakke, status, brukere og prosjektene med enheter og lansering. «Lanser etter avtale» lanserer et prosjekt uten oppstartsavgift, med eller uten grense for enheter, og krever et notat om avtalen. Et prosjekt med grense kan utvides. Databasefunksjonen `platform_launch_project()` sjekker at brukeren er plattformadmin, og revisjonsloggen viser plattformadmin som aktør. SQL-steget i drift.md trengs ikke lenger.
- **Brukere** viser plassene i pakken («4 av 10 plasser i pakken Pro er i bruk»), med samme telling som databasen. Når pakken er full, er invitasjon sperret, og eieren får lenke til Abonnement.
- **Prosjektlisten** merker prosjekter som ikke er lansert.
- **Angre og gjør om i blokkeditoren:** knapper ved lagringsstatusen og Ctrl/Cmd+Z og Ctrl/Cmd+Shift+Z (eller Ctrl+Y).
  - Egen historikk per side, inntil 100 steg.
  - Skriving i en blokk innen ett sekund er ett steg.
  - En gjenopprettet versjon kan også angres.
  - Snarveiene virker i blokkene, og ikke i feltene for meny, tema og innstillinger, der nettleseren angrer selv.
  - Historikken (`src/lib/history.ts`) deles med boligvelgeren.
- **Rettet:** knappene for prøveperioden i plattformadmin hadde et navn som ikke inneholdt den synlige teksten (WCAG 2.5.3).
- **Tester:**

  | Type | Antall | Nytt i fase 7 |
  |---|---|---|
  | pgTAP | 562 | 9 nye: bare plattformadmin kan lansere etter avtale, notatet er påkrevd, grensen og loggen |
  | Vitest | 332 | 5 nye: historikken i blokkeditoren (steg, sammenslåing av skriving, per side, grense) |
  | Playwright | 25 | Ny: plassene på Brukere, merket i prosjektlisten, angre og gjør om (knapper, tastatur og i et felt), lansering etter avtale i plattformadmin, og axe på de nye sidene |

**Gjenstår:**

- **Domenet** og **kontoene** (se åpne spørsmål og [kontoer.md](kontoer.md)). Flyten mot ekte Stripe testes når kontoene finnes.
- **Content-Security-Policy med nonce** er fortsatt ikke lagt til. Sidene i admin har et statisk skall fra Cache Components, og det kan ikke ha en nonce per forespørsel. Admin må da rendres helt dynamisk, og det gjør sidene tregere å åpne. Det bør veies når produksjonen er satt opp.
- **Utsatt fra før:** egne felt i CSV-import og -eksport, og språk per bruker i admin. Begge ble valgt bort i fase 5.
- **Proptis funksjoner i Pro og Partner** (tilvalg, BankID-signering, salgsprospekt, meldinger til kjøpere, 360°-visning) står under «Ikke med nå» i spesifikasjonen og er ikke bygget.

**Valg i fase 7:**

- **Lansering etter avtale i plattformadmin** gjennom en egen databasefunksjon for plattformadmin, i stedet for service-nøkkelen. Det følger samme mønster som forlengelse av prøveperioden, og loggen viser hvem som gjorde det.
- **Én tilstand for sidene og historikken** i blokkeditoren, oppdatert med rene funksjoner. Da passer historikken alltid til sidene, også i Reacts strenge modus.
- **Ctrl/Cmd+Z i et felt i en blokk** angrer i editoren, ikke bare teksten i feltet. Feltene styres av editoren, så nettleserens egen angring virker dårlig der.

## Fase 8: Designstil Nordisk

Eieren ønsket prosjektsider i retning av konowsutsikt.no. Fase 8 lager en egen designstil i samme retning: lys, luftig og med store bilder. Design, tekst, bilder og kode er ikke hentet derfra.

### Oppsummering av fase 8

**Bygget:**

- **Designstil i temaet** (`theme.style`): «Nordisk», som er ny standard, og «Klassisk», som er stilen fra fase 3.
  - Stilen velges i Tema → Designstil, på merkevareprofilen eller per prosjektside.
  - Hver stil har egne standardfarger og skrift. Farger og skrift som er valgt, beholdes når stilen byttes.
  - Under hver farge står det om den kommer fra merkevareprofilen eller er standard i stilen.
- **Nordisk:**
  - Skriften Jost (selvhostet), salviegrønn hovedfarge (#5F6B58), sandfarget aksent og varm, lys bakgrunn.
  - Hero i full høyde med menyen over bildet og en adresselinje nederst. Menyen får bakgrunn når siden rulles.
  - Overtitler med store bokstaver, tynne overskrifter og firkantede knapper.
  - Egne varianter av fem blokker:
    - hero
    - tekst og bilde: bildet går ut til kanten og har ett stort avrundet hjørne
    - nøkkeltall: liste med ikoner
    - fremdrift: tidslinje med ikoner og «Nå»
    - galleri: første bilde i full bredde
  - Kart, interesseskjema og bunntekst ser annerledes ut i Nordisk:
    - kartet viser adressen stort og nærområdet med ikoner
    - interesseskjemaet står i et kort i hovedfargen
    - bunnteksten har prosjektnavn, adresse og kontaktpersoner i midten
  - De andre blokkene får skriften og luften fra stilen.
- **Blokkene** har fått feltet «Overtittel». Heroen kan vise salgsstatus («7 av 24 boliger er solgt», oppdatert i sanntid), og et menypunkt kan vises som knapp.
- **Malene** har overtitler og nye overskrifter, og hero i full høyde med salgsstatus. «Meld interesse» står som knapp i menyen.
- **Demoen** bruker Nordisk og har tre illustrasjoner i SVG (huset ved fjorden, en stue og fasaden i boligvelgeren) og seks steder i nærområdet.
- **Rettet:**
  - Tekst og bilde uten bilde viser bare teksten på den publiserte siden, ikke en tom flate.
  - Skillelinjene i spørsmål og svar og i nærområdet hadde standardfargen fra admin.
  - Den klassiske bunnteksten hadde gjennomsiktig tekst på hovedfargen. Med den grønne fargen kom kontrasten under 4,5:1. axe fant feilen.
  - Kartet på prosjektsidene kunne ikke tegnes: arbeidsfilen til MapLibre (`public/vendor/`) ble skrevet om til `/sites/...` på prosjektsidenes vertsnavn og ga 404. Feilen fantes fra fase 3. Den ble ikke oppdaget fordi kartflisene fra Kartverket ikke lastes i utviklingsmiljøet. E2E-testen for fase 8 sjekker nå at filen lastes fra prosjektsiden.
- **Tester:**

  | Type | Antall | Nytt i fase 8 |
  |---|---|---|
  | pgTAP | 562 | Ingen endringer i databasen |
  | Vitest | 340 | 8 nye: standardstilen, arv når stilen byttes, kontrast i standardfargene (også på dempede seksjoner), malene (overtitler, hero, menyknapp), illustrasjonene og stedene i demoen |
  | Playwright | 26 | Ny: Nordisk på den publiserte siden (meny over bildet, salgsstatus, nærområdet), bytte til Klassisk i editoren og publisering, og axe på begge stilene og på Tema-fanen. axe-testene fra fase 5 sjekker nå demoen i Nordisk på desktop og mobil |

**Gjenstår:**

- **Ekte bilder.** Illustrasjonene i demoen er plassholdere. Stilen er laget for store fotografier.
- **Kartet** vises ikke på skjermbildene fra utviklingsmiljøet, fordi Kartverket ikke kan nås derfra. I produksjon lastes kartet som før.
- **Domenet** og **kontoene**, som før (se åpne spørsmål).

**Valg i fase 8:**

- **Nordisk er standard** for alle sider uten valgt stil, også sider som finnes. Det finnes ingen kunder ennå, så det gjelder bare testdata. Klassisk kan velges på merkevareprofilen og gjelder da alle prosjektsidene.
- **Stilen styres med CSS:** `data-site-style` på rotelementet og Tailwind-varianten `nordic:`. Bare fem blokker har egne komponenter i Nordisk. Stilene deler data, felt og editor, så en side kan bytte stil uten at innholdet endres.
- **Luften i Nordisk er marg** på vanlige seksjoner, så to seksjoner etter hverandre får én luke. Seksjoner med farge har luften inne i fargen.
- **Hovedfargen brukes som tekst** bare når den har minst 4,5:1 mot bakgrunnen. Ellers brukes tekstfargen.
- **Fremdriften står på en lys flate** i Nordisk, ikke på hovedfargen, så den ikke flyter sammen med kartet rett under.

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

1. **Domene:** hva er `[PLATTFORMDOMENE]`? Det trengs til underdomener, e-postavsender og kontoene. (Lokalt `localhost:3000`, satt med miljøvariabler.) Navnet er besvart: arbeidsnavnet er excip.
2. **Repo:** er det greit at plattformen ligger i `platform/` i dette repoet, eller ønsker dere et eget repo? (`platform/` i dette repoet.)

Besvart:

- **Abonnement** (12.11.): pakkene og prisene følger Propti, omtrent 10 % lavere, med oppstartsavgift per prosjekt og uten bindingstid. Se fase 6.
- **Kontoer** (12.11.): eieren oppretter dem. Sjekklisten står i [kontoer.md](kontoer.md).
