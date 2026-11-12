# excip

Selvbetjent SaaS for boligutbyggere og eiendomsmeglere. Kunden setter selv opp prosjekter og enheter, en interaktiv boligvelger og en prosjektside, og endrer status som oppdateres overalt med en gang.

«excip» er et arbeidsnavn, og plattformdomenet er ikke bestemt ennå. Begge settes med miljøvariabler.

- [docs/arkitektur.md](docs/arkitektur.md) beskriver mappestruktur, datamodell, tilgangsmodell, offentlig API, publisering, sanntid og personvern.
- [docs/plan.md](docs/plan.md) inneholder plan og status per fase.
- [docs/api.md](docs/api.md) beskriver API-et, innbyggingen og webhooks.
- [docs/drift.md](docs/drift.md) beskriver drift og personvern: underleverandører, utrulling, overvåking, sikkerhetskopi, nøkler, hendelser, innsyn og sletting.
- [docs/kontoer.md](docs/kontoer.md) er sjekklisten for kontoene: Supabase, Vercel, Resend, Stripe, Sentry og Turnstile, med regioner og miljøvariabler.

## Status

| Fase | Status |
|---|---|
| 0 Grunnmur | Ferdig |
| 1 Prosjekter og enheter | Ferdig |
| 2 Boligvelger | Ferdig |
| 3 Prosjektside | Ferdig |
| 4 Drift | Ferdig |
| 5 Kvalitet | Ferdig |
| 6 Pakker og oppstartsavgift | Ferdig |

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

Fase 3 omfatter:

- Prosjektside-editor med forhåndsvisning i sanntid:
  - Alle 18 blokktyper og malene «Kommer for salg» og «Full prosjektside». En side kan bygges ut uten å begynne på nytt.
  - Flere sider, meny og bunntekst, og tema fra merkevareprofilen.
  - Publisering, delt forhåndsvisningslenke og versjonshistorikk.
- Publisert prosjektside på underdomene (`{underdomene}.[PLATTFORMDOMENE]`):
  - Enhetssiden `/bolig/{slug}`.
  - SEO, sitemap og robots.
  - Mellomlager som tømmes ved publisering og statusendring.
- Interesseskjema med samtykke, spamvern og e-post til kontaktpersonen og avsenderen.
- Leads i admin: liste, filter, detalj, status, CSV-eksport og sletting.
- Merkevareprofil og egne felt på enheter.

Fase 4 omfatter:

- **Egne domener** (Innstillinger → Domener):
  - DNS-veiledning med TXT-post for eierskap og CNAME eller A for trafikken.
  - Automatisk bekreftelse og primærdomene. Vercel lager sertifikatet.
  - Underdomenet og andre domener sender besøkende til primærdomenet.
- **Abonnement med Stripe** (Innstillinger → Abonnement):
  - 30 dagers prøveperiode uten kort. Planene etter antall aktive prosjekter er erstattet av pakker i fase 6.
  - Checkout, kundeportal og webhook.
  - Lesemodus med bannere og varsel på e-post. Publiserte sider tas aldri ned.
- **Innbygging:** web-komponenten `<boligvelger-embed>` med iframe som reserve, og et offentlig lese-API med CORS.
- **Samtykke og sporing:**
  - Samtykkebanner, og genererte sider for personvern og informasjonskapsler.
  - Google Analytics 4, Tag Manager og Meta Pixel lastes først etter samtykke.
- **Integrasjoner** (Innstillinger → API):
  - API-nøkler og API med nøkkel for prosjekter, enheter, statusendring og leads.
  - Webhooks med signatur etter Standard Webhooks, nye forsøk og logg over leveranser.

Fase 5 omfatter:

- **Prosjektoversikt:** verdi solgt, og en sjekkliste for oppstarten (enheter, bilde og markeringer, mal og publisering) til alt er gjort.
- **Demodata:** `npm run demo` lager Demo Bolig AS med Fjordparken. Prosjektet har 24 leiligheter, en fasade med markeringer, publisert boligvelger og prosjektside, og leads.
- **Universell utforming:**
  - axe (WCAG 2.1 AA) i ende-til-ende-testene på publiserte sider og i admin.
  - Tastaturtest av boligvelgeren.
- **Ytelse:**
  - Publiserte sider er statiske og mellomlagres.
  - Lighthouse CI krever LCP under 2,5 s på mobil.
- **Akseptkriteriene:** alle seks er ende-til-ende-tester.
- **Personvern og drift:**
  - Innsyn og sletting for én person.
  - Helsesjekk på `/api/health`.
  - Driftsrutiner i [docs/drift.md](docs/drift.md).

Fase 6 omfatter:

- **Pakker** (Innstillinger → Abonnement), kroner per måned uten mva. og uten bindingstid:
  - Prosjektside (890): prosjektside, boligvelger, leads og sporing. 3 brukere og ett eget domene per prosjektside.
  - Pro (2 190): i tillegg API, webhooks og innbygging på egen nettside. 10 brukere og 10 domener per prosjektside.
  - Partner (3 990): i tillegg ubegrenset antall brukere, oppsett, opplæring og prioritert support.
- **Oppstartsavgift per prosjekt** (prosjektmenyen → Lansering): betales én gang før prosjektet publiseres, etter antall enheter (6 900–49 900 kr, over 199 enheter etter avtale). Utvidelse til et høyere nivå koster forskjellen.
- **Navnet excip** og sjekklisten for kontoene i [docs/kontoer.md](docs/kontoer.md).

## Kom i gang lokalt

Krever Node.js 22 og Docker. Supabase CLI følger med som utviklingsavhengighet.

```bash
cd platform
npm install
npm run db:start              # starter Postgres, Auth, Storage og Realtime og kjører migrasjonene
cp .env.example .env.local    # fyll inn PUBLISHABLE_KEY og SECRET_KEY fra `npx supabase status`
npm run dev                   # http://localhost:3000
```

`npm run dev` og `npm run build` gjør først to ting:

- De kopierer web-workeren til kartet (MapLibre) fra `node_modules` til `public/vendor/` (`scripts/copy-vendor.mjs`).
- De bygger web-komponenten for innbygging fra `src/embed/` til `public/embed/v1.js` (`scripts/build-embed.mjs`).

Adressesøket og kartet bruker Kartverkets åpne tjenester (`ws.geonorge.no` og `cache.kartverket.no`) direkte fra nettleseren. De krever ingen nøkkel.

Uten `RESEND_API_KEY` sendes ikke invitasjoner på e-post. Invitasjonslenken vises da i appen, så den kan deles direkte. E-post fra Supabase Auth (innloggingslenke, glemt passord) havner i Mailpit på http://127.0.0.1:54324. Lokalt kreves ikke bekreftelse av e-postadressen.

`SUPABASE_SECRET_KEY` (service-nøkkelen) brukes bare på serveren. Den trengs for interesseskjemaet og for signerte forhåndsvisningslenker. Lokalt settes `MAILPIT_URL=http://127.0.0.1:54324`, så varsler om leads og kvitteringer havner i Mailpit når `RESEND_API_KEY` mangler. Turnstile slås på med `NEXT_PUBLIC_TURNSTILE_SITE_KEY` og `TURNSTILE_SECRET_KEY`. Uten dem beskyttes skjemaet av honeypot og rate limit.

Publiserte prosjektsider åpnes lokalt på `http://{underdomene}.localhost:3000` når `NEXT_PUBLIC_PLATFORM_DOMAIN=localhost:3000`. Chrome og Firefox sender `*.localhost` til maskinen selv.

Uten Stripe-nøkler vises pakkene, men de kan ikke velges, og prosjekter kan ikke lanseres med betaling (bare med `waive_project_launch()`, se [docs/drift.md](docs/drift.md)). Uten Vercel-token sjekkes egne domener bare med DNS over HTTPS. Ende-til-ende-testene starter en etterligning av Stripe og DNS (`e2e/support/fake-services.mjs`), så hele flyten testes uten kontoer.

Demodata (Demo Bolig AS med Fjordparken) legges inn med en egen bruker. Passordet velger du selv, og det skrives ikke ut:

```bash
DEMO_PASSWORD=velg-et-passord npm run demo   # logg inn som demo@example.com
npm run demo -- --email meg@firma.no          # eller gi en bruker som finnes, demoen
npm run demo -- --replace                     # lag demoen på nytt
```

Prosjektsiden til demoen ligger på `http://fjordparken.localhost:3000`.

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
| `npm run db:test` | Databasetester (pgTAP): RLS, isolasjon, roller, statuslogg, publisering, import, boligvelger, prosjektside og leads |
| `npm run db:lint` | Statisk sjekk av alle databasefunksjoner |
| `npm run db:types` | Genererer TypeScript-typer fra databasen |
| `npm run demo` | Legger inn demodata (Demo Bolig AS med Fjordparken) |
| `npm run lighthouse` | Lighthouse CI mot demosiden på mobil (appen må kjøre). Krav: LCP under 2,5 s, CLS, bildestørrelser og lat lasting. |

CI (`.github/workflows/platform.yml`) kjører alt dette ved endringer i `platform/`.

## Miljøer og oppsett av kontoer

Kontoene opprettes av eieren. Sjekklisten med regioner, produkter og priser i Stripe, og alle miljøvariablene, står i [docs/kontoer.md](docs/kontoer.md). Kort fortalt:

1. **Supabase:** staging og produksjon i Stockholm (`eu-north-1`), migrasjonene med `npx supabase db push`, og Auth med e-postmalene fra `supabase/templates/`.
2. **Vercel:** Root Directory `platform`, funksjonene i Stockholm (`arn1`), wildcard-domene og API-token for kundenes egne domener.
3. **Resend:** avsenderdomenet i EU.
4. **Stripe:** tre månedspriser (Prosjektside, Pro og Partner), produktet «Oppstart per prosjekt», kundeportalen og webhooken.
5. **Sentry** i EU-regionen, og **Cloudflare Turnstile** for interesseskjemaet.

## Innhold

| Mappe | Innhold |
|---|---|
| `src/app/` | Sider og ruter: `(auth)` for innlogging og invitasjon, `(app)/[org]` for admin per organisasjon, `(app)/(user)` for profil, ny organisasjon og plattformadmin, `sites/` for publiserte prosjektsider (skrevet om fra underdomenet eller eget domene), `preview/` for delt forhåndsvisning, `site-preview/` for forhåndsvisningen i editoren, `embed/` for publisert boligvelger og enhetsside, `api/` for API-et, Stripe-webhooken og planlagte jobber |
| `src/features/` | Domenemoduler med Zod-skjema, serverhandlinger, spørringer og komponenter |
| `src/lib/` | Supabase-klienter, datatilgangslag (DAL), roller, tallformat, e-post og sikkerhet |
| `src/components/` | shadcn/ui og felles admin-komponenter |
| `messages/` | All tekst på bokmål, engelsk og svensk |
| `supabase/migrations/` | Datamodell, RLS, funksjoner, lagring, sanntid og jobber |
| `supabase/tests/` | pgTAP-tester (553 tester) |
| `supabase/templates/` | Norske e-postmaler for Supabase Auth |
| `src/embed/` | Web-komponenten for innbygging, bygget til `public/embed/v1.js` |
| `e2e/` | Playwright-tester, med en Excel-fil for importtesten i `e2e/fixtures/`. Fasadebildet til boligvelgertestene lages med sharp. `e2e/support/` har etterligningen av Stripe og DNS. |
| `scripts/` | Kopierer filer fra `node_modules` som nettleseren må hente direkte, og bygger web-komponenten |
