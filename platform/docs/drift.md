# Drift og personvern

Rutiner for å drifte plattformen. Oppsettet av kontoene står i [kontoer.md](kontoer.md), og arkitekturen i [arkitektur.md](arkitektur.md).

## Tjenester og regioner

All kundedata lagres i EU. Avtale om databehandling (DPA) inngås med alle underleverandørene før lansering.

| Tjeneste | Brukes til | Region | Personopplysninger |
|---|---|---|---|
| Supabase | Database, innlogging, filer og sanntid | Stockholm (`eu-north-1`) | Alt: brukere, leads, logger |
| Vercel | App og publiserte sider | Funksjoner i Stockholm (`arn1`), CDN globalt | Bare i forespørsler underveis |
| Resend | E-post (invitasjoner, leads, varsler) | EU | Mottaker og innhold i e-posten |
| Stripe | Abonnement (pakkene) og oppstartsavgift per prosjekt | Avtale med Stripe Payments Europe (Irland). Data kan behandles utenfor EU etter EUs standardavtaler | Kundens kontaktperson og betaling |
| Sentry | Feilsporing | EU | Ingen: brukerinfo, cookies, hoder og innhold sendes ikke |
| Cloudflare Turnstile | Robotvern på interesseskjemaet | Globalt | IP-adresse ved innsending |
| Kartverket | Adressesøk og kart | Norge | Ingen |

## Utrulling

1. Endringer går gjennom en pull request. CI kjører lint, typekontroll, enhetstester, pgTAP (RLS og isolasjon), statisk sjekk av databasefunksjoner, kontroll av genererte typer, bygging, ende-til-ende-tester (Playwright) og Lighthouse CI.
2. **Migrasjoner kjøres før koden rulles ut:** `npx supabase db push` mot produksjon. Migrasjonene skal virke med både gammel og ny kode. Kolonner som fjernes, tas i en senere utrulling.
3. Vercel bygger og ruller ut ved fletting til hovedgrenen. Nye miljøvariabler legges inn i Vercel før flettingen.
4. **Etter utrulling:**
   - `/api/health` svarer 200.
   - Logg inn i admin og åpne et prosjekt.
   - Åpne en publisert prosjektside.

**Tilbakerulling:**

- Koden: forrige utrulling i Vercel («Instant Rollback»).
- Migrasjoner rulles ikke tilbake automatisk. En ny migrasjon retter feilen.

## Overvåking

| Hva | Hvordan | Varsling |
|---|---|---|
| Oppetid | `GET /api/health` hvert minutt fra en ekstern tjeneste. Svarer 200 når appen, databasen, innloggingen og lagringen svarer, ellers 503. | Til vakt etter to feil på rad |
| Feil i appen | Sentry (server og nettleser) | Ny feiltype og økning i feil |
| Planlagte jobber | Vercel Cron-loggen og Sentry | Feil i en jobb |
| Database | Supabase: CPU, minne, tilkoblinger og trege spørringer | Over 80 % i 10 minutter |
| Ytelse | Lighthouse CI i hver kjøring av CI (LCP under 2,5 s på mobil) | CI feiler |

## Pakker og oppstartsavgift

- **Månedsprisene** for pakkene endres i Stripe. Nye priser får nye id-er: legg dem inn i `STRIPE_PRICE_START`, `STRIPE_PRICE_PRO` og `STRIPE_PRICE_PARTNER`, og i kundeportalen. Abonnementer på gamle priser fortsetter til kunden bytter.
- **Oppstartsavgiften** står i `src/lib/billing/launch.ts` og endres med en ny utrulling. Endringen gjelder nye lanseringer og utvidelser, ikke det som er betalt.
- **Lansering etter avtale** (prosjekter med mer enn 199 enheter, eller annen avtale). Kjør i SQL-editoren i Supabase, med id-en til prosjektet:

  ```sql
  -- Ingen grense for antall enheter:
  select public.waive_project_launch('{prosjekt-id}', null, 'Avtale 2026-11: Fjordbyen, 260 enheter');
  -- Eller en grense:
  select public.waive_project_launch('{prosjekt-id}', 300, 'Avtale 2026-11: Fjordbyen, inntil 300 enheter');
  ```

  Det står i revisjonsloggen med notatet. Avgiften etter avtalen faktureres i Stripe for seg (faktura uten abonnement).
- **Betaling som ikke er registrert.** Webhooken og returen fra Checkout registrerer betalingen. Står et prosjekt som ikke lansert etter betalt Checkout, se etter feil i Sentry (`stripe_event`) og send hendelsen på nytt fra Stripe (Developers → Events → Resend). Beløpet uten mva. må være det samme som da betalingen ble gjort klar, ellers avvises den.

## Planlagte jobber

| Jobb | Når | Hva den gjør | Hvis den feiler |
|---|---|---|---|
| `/api/cron/webhooks` (Vercel) | Hvert minutt | Sender webhooks som venter, med nye forsøk | Leveransene venter og sendes ved neste kjøring. Etter 3 døgn blir de stående som «Feilet». |
| `/api/cron/domains` (Vercel) | Hvert femte minutt | Sjekker DNS for egne domener | Domenet står som «Venter» til neste sjekk |
| `/api/cron/billing` (Vercel) | 07:17 UTC | Varsler om prøveperioden og lesemodus | Varselet sendes ved neste kjøring. Det sendes aldri to ganger. |
| `daglig-vedlikehold` (pg_cron) | 02:17 UTC | Sletter leads som er eldre enn lagringstiden, gamle webhook-leveranser og tellere for rate limit | Kjør `select app.run_daily_maintenance();` som `postgres` |

Vercel-jobbene krever `Authorization: Bearer {CRON_SECRET}`.

## Sikkerhetskopi og gjenoppretting

- **Database:** Supabase Pro har daglig sikkerhetskopi. Point-in-time recovery (PITR) slås på før lansering, med minst 7 dager.
- **Filer i Storage** er ikke med i databasekopien. En ukentlig jobb kopierer bucketen `media` til en lagringskonto i EU med versjonering (for eksempel med `rclone`).
- **Gjenoppretting øves hvert kvartal:**
  1. Gjenopprett databasen til et eget Supabase-prosjekt.
  2. Pek en forhåndsvisning i Vercel mot det.
  3. Sjekk innlogging, et prosjekt og en publisert side.
- **Forslag til mål** (avtales før lansering):
  - Tap av data: høyst 5 minutter med PITR (RPO).
  - Tid til systemet er oppe igjen: 4 timer (RTO).

## Nøkler og hemmeligheter

Hemmeligheter ligger bare i Vercel (og i `.env.local` lokalt) og skrives aldri i logger. Bytt dem med en gang ved mistanke om lekkasje, og ellers årlig.

| Hemmelighet | Slik byttes den | Følger av byttet |
|---|---|---|
| `SUPABASE_SECRET_KEY` | Lag ny nøkkel i Supabase, oppdater Vercel, rull ut, slett den gamle | Delte forhåndsvisningslenker slutter å virke, fordi de er signert med en nøkkel avledet av denne |
| `STRIPE_SECRET_KEY` | Rull nøkkelen i Stripe, oppdater Vercel | Ingen |
| `STRIPE_WEBHOOK_SECRET` | Rull hemmeligheten for endepunktet i Stripe, oppdater Vercel | Stripe sender på nytt hendelser som feilet underveis |
| `RESEND_API_KEY` | Ny nøkkel i Resend, oppdater Vercel, slett den gamle | Ingen |
| `TURNSTILE_SECRET_KEY` | Roter i Cloudflare | Ingen |
| `VERCEL_API_TOKEN` | Nytt token med tilgang bare til prosjektet | Ingen |
| `CRON_SECRET` | Ny tilfeldig verdi i Vercel | Ingen |
| `SENTRY_AUTH_TOKEN` | Nytt token i Sentry (bare for kildekart ved bygging) | Ingen |

Kundenes API-nøkler og webhook-hemmeligheter byttes av kunden under Innstillinger → API.

## Hendelser

1. **Vurder alvoret:** nede, delvis nede, eller feil som rammer få.
2. **Begrens skaden:**
   - Rull tilbake koden.
   - Slå av en jobb.
   - Bytt en hemmelighet som kan ha lekket.
3. **Si fra** til berørte kunder på e-post, og på statussiden om dere har en.
4. **Brudd på personopplysningssikkerheten:**
   - Plattformen er databehandler for kundenes leads. Si fra til kunden (behandlingsansvarlig) uten ugrunnet opphold, slik at kunden kan melde fra til Datatilsynet innen 72 timer.
   - For egne opplysninger, for eksempel brukerkontoer, melder plattformen selv fra til Datatilsynet innen 72 timer.
5. **Skriv en kort rapport** etterpå: hva skjedde, hvorfor, og hva som endres. Revisjonsloggen viser hvem som gjorde hva i admin.

## Personvern i drift

**Innsyn og sletting:**

- Eier og administrator gjør det selv på henvendelsen i admin (Leads → henvendelsen → «Innsyn og sletting»). Det virker også i lesemodus.
- Innsynet er en JSON-fil med alt som er lagret om personen, også samtykketeksten og hvilke systemer kopier er sendt til.
- Slettingen fjerner henvendelsene, kopiene i webhook-loggen og telleren for rate limit.
- Begge deler logges uten personopplysninger.

**Lagringstid:**

- Hver organisasjon setter hvor lenge leads lagres. Den daglige jobben sletter eldre leads.
- Leveranser i webhook-loggen slettes etter 30 dager.

**Kunde som sier opp:**

- Organisasjonen går i lesemodus når abonnementet er slutt.
- Publiserte sider tas aldri ned automatisk.
- Data slettes etter avtalen. Organisasjoner kan ikke slettes i appen. Plattformen gjør det med service-rollen:
  1. Hent filene: `select storage_path, variants from assets where organization_id = '{id}'`, og slett dem i bucketen `media`.
  2. Slett organisasjonen: `delete from organizations where id = '{id}'`. Alt annet slettes med den, også revisjonsloggen.
- `scripts/demo.ts` med `--replace` gjør det samme for demo-organisasjonen.

**Ukjente adresser:**

- Publiserte sider mellomlagres som statiske sider, også 404-svar for underdomener som ikke finnes, i høyst én time.
- Publisering og nye domener tømmer mellomlageret for adressen.

## Demodata

- `npm run demo` lager Demo Bolig AS med Fjordparken:
  - 24 leiligheter på fire etasjer
  - fasade i SVG med markeringer
  - publisert boligvelger og prosjektside
  - statusendringer og tre leads
- Første gang trengs `DEMO_PASSWORD` for brukeren `demo@example.com`. Med `--email` får en bruker som finnes, organisasjonen. `--replace` lager den på nytt.
- Skriptet trenger `SUPABASE_SECRET_KEY` for å logge inn som brukeren, slette en gammel demo og lansere prosjektet uten oppstartsavgift. Alt annet gjøres som brukeren, gjennom RLS.
- Skriptet skriver aldri ut nøkler eller passord.

## Ytelse

`npm run lighthouse` (appen må kjøre) lager en demo og måler forsiden, en enhetsside og personvernsiden med Lighthouse sin mobilprofil.

**Krav:**

- LCP under 2,5 s
- CLS under 0,1
- bilder i riktig størrelse, WebP og lat lasting utenfor skjermen

**Måling:**

- Strupingen gjøres i nettleseren (DevTools: treg 4G og fire ganger tregere CPU).
- Lighthouse sin standardmetode (simulering) og PageSpeed Insights regner med alle skript som er bedt om før første tegning, også de som lastes asynkront. Da gir de omtrent dobbelt så høy LCP for disse sidene.
- Det som teller for Core Web Vitals, er målingene fra ekte besøkende (CrUX).
