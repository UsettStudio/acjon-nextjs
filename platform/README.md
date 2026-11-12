# Boligplattform

Selvbetjent SaaS for boligutbyggere og eiendomsmeglere. Kunden setter selv opp prosjekter og enheter, en interaktiv boligvelger og en prosjektside, og endrer status som oppdateres overalt med en gang.

Produktnavn og plattformdomene er ikke bestemt ennå. «Boligplattform» er et arbeidsnavn og settes med miljøvariabler.

- [docs/arkitektur.md](docs/arkitektur.md) beskriver mappestruktur, datamodell, tilgangsmodell, offentlig API, publisering, sanntid og personvern.
- [docs/plan.md](docs/plan.md) inneholder plan og status per fase.

## Status

| Fase | Status |
|---|---|
| 0 Grunnmur | Ferdig |
| 1 Prosjekter og enheter | Ferdig |
| 2 Boligvelger | Ferdig |
| 3 Prosjektside | Neste |
| 4–5 | Ikke påbegynt |

Fase 0 omfatter Next.js-appen, databasen med RLS, pålogging, organisasjoner, invitasjoner, brukeradministrasjon, plattformadmin, tester og CI.

Fase 1 omfatter:

- Prosjektveiviser med adressesøk og kart fra Kartverket, fremdrift, kontaktpersoner, byggetrinn og bygg.
- Enhetstabell med redigering i cellene, filter, kolonnevelger, masseendring, statuslogg og sanntid.
- Enhetsskjema med faner.
- Mediebibliotek med bildevarianter.
- Import fra CSV og Excel, og eksport til CSV.

Fase 2 omfatter:

- Editor for boligvelgeren:
  - Tegn: polygon og rektangel, punkter, angre og gjør om, zoom og autolagring.
  - Koble: enheter, visninger, prosjekter og lenker.
  - Status: statusendring med notat og flervalg.
- Visningstre med vinkler, bytte av bilde, publisering og forhåndsvisning.
- Publisert boligvelger (`/embed/selector/{id}`):
  - Verktøytips og enhetskort.
  - Filtre i adressen og sorterbar liste.
  - Favoritter og sammenligning.
  - Mobilvisning med bunnark og knipezoom.
  - Status i sanntid.
- Enhetsside (`/embed/selector/{id}/bolig/{slug}`).
- Statusfarger per organisasjon og prosjekt.

## Kom i gang lokalt

Krever Node.js 22 og Docker. Supabase CLI følger med som utviklingsavhengighet.

```bash
cd platform
npm install
npm run db:start              # starter Postgres, Auth, Storage og Realtime og kjører migrasjonene
cp .env.example .env.local    # fyll inn NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY fra `npx supabase status`
npm run dev                   # http://localhost:3000
```

`npm run dev` og `npm run build` kopierer først web-workeren til kartet (MapLibre) fra `node_modules` til `public/vendor/` (`scripts/copy-vendor.mjs`).

Adressesøket og kartet bruker Kartverkets åpne tjenester (`ws.geonorge.no` og `cache.kartverket.no`) direkte fra nettleseren. De krever ingen nøkkel.

Uten `RESEND_API_KEY` sendes ikke invitasjoner på e-post. Invitasjonslenken vises da i appen, så den kan deles direkte. E-post fra Supabase Auth (innloggingslenke, glemt passord) havner i Mailpit på http://127.0.0.1:54324. Lokalt kreves ikke bekreftelse av e-postadressen.

En plattformadmin legges inn med SQL:

```sql
insert into public.platform_admins (user_id) select id from auth.users where email = 'navn@firma.no';
```

## Kommandoer

| Kommando | Hva den gjør |
|---|---|
| `npm run dev` | Utviklingsserver |
| `npm run build`, `npm start` | Produksjonsbygg og server |
| `npm run check` | Lint, typekontroll og enhetstester |
| `npm run lint` | ESLint uten advarsler |
| `npm run typecheck` | Genererer rutetyper og kjører `tsc` |
| `npm test` | Enhetstester (Vitest) |
| `npm run test:e2e` | Ende-til-ende-tester (Playwright). Krever `npm run build` og lokal Supabase. |
| `npm run db:start` | Starter lokal Supabase |
| `npm run db:reset` | Bygger databasen på nytt fra migrasjonene |
| `npm run db:test` | Databasetester (pgTAP): RLS, isolasjon, roller, statuslogg, publisering, import og boligvelger |
| `npm run db:lint` | Statisk sjekk av alle databasefunksjoner |
| `npm run db:types` | Genererer TypeScript-typer fra databasen |

CI (`.github/workflows/platform.yml`) kjører alt dette ved endringer i `platform/`.

## Miljøer og oppsett av kontoer

Kontoene er ikke opprettet ennå. Slik skal de settes opp:

1. **Supabase.** Opprett to prosjekter, staging og produksjon, i region Stockholm (`eu-north-1`). Kjør migrasjonene med `npx supabase link` og `npx supabase db push`. Under Auth:
   - Sett Site URL til `https://app.[PLATTFORMDOMENE]`.
   - Legg `https://app.[PLATTFORMDOMENE]/**` til som redirect-URL.
   - Slå på e-postbekreftelse og sett minste passordlengde til 10.
   - Send e-post via Resend SMTP.
   - Lim inn de norske e-postmalene fra `supabase/templates/`. Lenkene går til `/auth/confirm` med `token_hash`, slik at de virker uansett hvilken nettleser de åpnes i. Lokalt brukes malene automatisk (`config.toml`).
2. **Vercel.** Opprett et prosjekt med Root Directory `platform`. Funksjonene kjører i Stockholm (`arn1`, se `vercel.json`). Miljøvariablene står i `.env.example`.
3. **Resend.** Bekreft avsenderdomenet og sett `RESEND_API_KEY` og `EMAIL_FROM`.
4. **Sentry.** Opprett et prosjekt i EU-regionen og sett `NEXT_PUBLIC_SENTRY_DSN`, samt `SENTRY_ORG`, `SENTRY_PROJECT` og `SENTRY_AUTH_TOKEN` for kildekart. Personopplysninger, cookies, hoder og forespørselsinnhold sendes ikke.

## Innhold

| Mappe | Innhold |
|---|---|
| `src/app/` | Sider og ruter: `(auth)` for innlogging og invitasjon, `(app)/[org]` for admin per organisasjon, `(app)/(user)` for profil, ny organisasjon og plattformadmin, `embed/` for publisert boligvelger og enhetsside |
| `src/features/` | Domenemoduler med Zod-skjema, serverhandlinger, spørringer og komponenter |
| `src/lib/` | Supabase-klienter, datatilgangslag (DAL), roller, tallformat, e-post og sikkerhet |
| `src/components/` | shadcn/ui og felles admin-komponenter |
| `messages/` | All tekst på bokmål, engelsk og svensk |
| `supabase/migrations/` | Datamodell, RLS, funksjoner, lagring, sanntid og jobber |
| `supabase/tests/` | pgTAP-tester (307 tester) |
| `supabase/templates/` | Norske e-postmaler for Supabase Auth |
| `e2e/` | Playwright-tester, med en Excel-fil for importtesten i `e2e/fixtures/`. Fasadebildet til boligvelgertestene lages med sharp. |
| `scripts/` | Kopierer filer fra `node_modules` som nettleseren må hente direkte |
