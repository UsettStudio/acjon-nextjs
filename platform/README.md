# Boligplattform

Selvbetjent SaaS for boligutbyggere og eiendomsmeglere. Kunden setter selv opp prosjekter og enheter, en interaktiv boligvelger og en prosjektside, og endrer status som oppdateres overalt med en gang.

Produktnavn og plattformdomene er ikke bestemt ennå. «Boligplattform» er et arbeidsnavn og settes med miljøvariabler.

- [docs/arkitektur.md](docs/arkitektur.md) beskriver mappestruktur, datamodell, tilgangsmodell, offentlig API, publisering, sanntid og personvern.
- [docs/plan.md](docs/plan.md) inneholder plan og status per fase.
- [docs/api.md](docs/api.md) beskriver API-et, innbyggingen og webhooks.

## Status

| Fase | Status |
|---|---|
| 0 Grunnmur | Ferdig |
| 1 Prosjekter og enheter | Ferdig |
| 2 Boligvelger | Ferdig |
| 3 Prosjektside | Ferdig |
| 4 Drift | Ferdig |
| 5 Kvalitet | Neste |

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
  - 30 dagers prøveperiode uten kort, og planer etter antall aktive prosjekter.
  - Checkout, kundeportal og webhook.
  - Lesemodus med bannere og varsel på e-post. Publiserte sider tas aldri ned.
- **Innbygging:** web-komponenten `<boligvelger-embed>` med iframe som reserve, og et offentlig lese-API med CORS.
- **Samtykke og sporing:**
  - Samtykkebanner, og genererte sider for personvern og informasjonskapsler.
  - Google Analytics 4, Tag Manager og Meta Pixel lastes først etter samtykke.
- **Integrasjoner** (Innstillinger → API):
  - API-nøkler og API med nøkkel for prosjekter, enheter, statusendring og leads.
  - Webhooks med signatur etter Standard Webhooks, nye forsøk og logg over leveranser.

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

Uten Stripe-nøkler vises planene, men de kan ikke velges. Uten Vercel-token sjekkes egne domener bare med DNS over HTTPS. Ende-til-ende-testene starter en etterligning av Stripe og DNS (`e2e/support/fake-services.mjs`), så hele flyten testes uten kontoer.

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
   - Legg til `app.[PLATTFORMDOMENE]` og wildcard-domenet `*.[PLATTFORMDOMENE]`. Wildcard krever at domenet bruker Vercel sine navnetjenere.
   - Lag et API-token med tilgang til prosjektet, og sett `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID` og eventuelt `VERCEL_TEAM_ID`. Da legges kundenes egne domener til i prosjektet automatisk.
   - Sett `CRON_SECRET`. De planlagte jobbene i `vercel.json` sender webhooks hvert minutt, sjekker domener hvert femte minutt og sender varsler om prøveperioden daglig. Jobben hvert minutt krever Vercel Pro.
3. **Resend.** Bekreft avsenderdomenet og sett `RESEND_API_KEY` og `EMAIL_FROM`.
4. **Stripe.**
   - Lag ett produkt med tre månedspriser (Start, Vekst og Proff), og sett `STRIPE_PRICE_START`, `STRIPE_PRICE_GROWTH` og `STRIPE_PRICE_PRO`.
   - Sett `STRIPE_SECRET_KEY`.
   - Lag en webhook til `https://app.[PLATTFORMDOMENE]/api/stripe/webhook` med hendelsene `checkout.session.completed`, `customer.subscription.*` og `invoice.paid`, `invoice.payment_failed` og `invoice.payment_action_required`. Sett `STRIPE_WEBHOOK_SECRET`.
   - Sett opp kundeportalen med de tre prisene, så kunden kan bytte plan og si opp der.
   - Med Stripe Tax: sett `STRIPE_AUTOMATIC_TAX=true`, så mva. legges til i Checkout.
5. **Sentry.** Opprett et prosjekt i EU-regionen og sett `NEXT_PUBLIC_SENTRY_DSN`, samt `SENTRY_ORG`, `SENTRY_PROJECT` og `SENTRY_AUTH_TOKEN` for kildekart. Personopplysninger, cookies, hoder og forespørselsinnhold sendes ikke.

## Innhold

| Mappe | Innhold |
|---|---|
| `src/app/` | Sider og ruter: `(auth)` for innlogging og invitasjon, `(app)/[org]` for admin per organisasjon, `(app)/(user)` for profil, ny organisasjon og plattformadmin, `sites/` for publiserte prosjektsider (skrevet om fra underdomenet eller eget domene), `preview/` for delt forhåndsvisning, `site-preview/` for forhåndsvisningen i editoren, `embed/` for publisert boligvelger og enhetsside, `api/` for API-et, Stripe-webhooken og planlagte jobber |
| `src/features/` | Domenemoduler med Zod-skjema, serverhandlinger, spørringer og komponenter |
| `src/lib/` | Supabase-klienter, datatilgangslag (DAL), roller, tallformat, e-post og sikkerhet |
| `src/components/` | shadcn/ui og felles admin-komponenter |
| `messages/` | All tekst på bokmål, engelsk og svensk |
| `supabase/migrations/` | Datamodell, RLS, funksjoner, lagring, sanntid og jobber |
| `supabase/tests/` | pgTAP-tester (467 tester) |
| `supabase/templates/` | Norske e-postmaler for Supabase Auth |
| `src/embed/` | Web-komponenten for innbygging, bygget til `public/embed/v1.js` |
| `e2e/` | Playwright-tester, med en Excel-fil for importtesten i `e2e/fixtures/`. Fasadebildet til boligvelgertestene lages med sharp. `e2e/support/` har etterligningen av Stripe og DNS. |
| `scripts/` | Kopierer filer fra `node_modules` som nettleseren må hente direkte, og bygger web-komponenten |
