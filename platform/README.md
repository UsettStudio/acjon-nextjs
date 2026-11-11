# Boligplattform

Selvbetjent SaaS for boligutbyggere og eiendomsmeglere. Kunden setter selv opp prosjekter og enheter, en interaktiv boligvelger og en prosjektside, og endrer status som oppdateres overalt med en gang.

Produktnavn og plattformdomene er ikke bestemt ennå. «Boligplattform» er et arbeidsnavn og settes med miljøvariabler.

- [docs/arkitektur.md](docs/arkitektur.md) beskriver mappestruktur, datamodell, tilgangsmodell, offentlig API, publisering, sanntid og personvern.
- [docs/plan.md](docs/plan.md) inneholder plan og status per fase.

## Status

| Fase | Status |
|---|---|
| 0 Grunnmur | Ferdig |
| 1 Prosjekter og enheter | Neste |
| 2–5 | Ikke påbegynt |

Fase 0 omfatter:

- Next.js-appen.
- Databasen med RLS.
- Pålogging.
- Organisasjoner, invitasjoner og brukeradministrasjon.
- Plattformadmin.
- Tester og CI.

## Kom i gang lokalt

Krever Node.js 22 og Docker. Supabase CLI følger med som utviklingsavhengighet.

```bash
cd platform
npm install
npm run db:start              # starter Postgres, Auth, Storage og Realtime og kjører migrasjonene
cp .env.example .env.local    # fyll inn NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY fra `npx supabase status`
npm run dev                   # http://localhost:3000
```

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
| `npm run db:test` | Databasetester (pgTAP): RLS, isolasjon, roller, statuslogg og publisering |
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
   - Pek lenkene i e-postmalene til `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<type>&next=…`, slik at lenken virker uansett hvilken nettleser den åpnes i.
2. **Vercel.** Opprett et prosjekt med Root Directory `platform`. Funksjonene kjører i Stockholm (`arn1`, se `vercel.json`). Miljøvariablene står i `.env.example`.
3. **Resend.** Bekreft avsenderdomenet og sett `RESEND_API_KEY` og `EMAIL_FROM`.
4. **Sentry.** Opprett et prosjekt i EU-regionen og sett `NEXT_PUBLIC_SENTRY_DSN`, samt `SENTRY_ORG`, `SENTRY_PROJECT` og `SENTRY_AUTH_TOKEN` for kildekart. Personopplysninger, cookies, hoder og forespørselsinnhold sendes ikke.

## Innhold

| Mappe | Innhold |
|---|---|
| `src/app/` | Sider og ruter: `(auth)` for innlogging og invitasjon, `(app)/[org]` for admin per organisasjon, `(app)/(user)` for profil, ny organisasjon og plattformadmin |
| `src/features/` | Domenemoduler med Zod-skjema, serverhandlinger, spørringer og komponenter |
| `src/lib/` | Supabase-klienter, datatilgangslag (DAL), roller, tallformat, e-post og sikkerhet |
| `src/components/` | shadcn/ui og felles admin-komponenter |
| `messages/` | All tekst på bokmål, engelsk og svensk |
| `supabase/migrations/` | Datamodell, RLS, funksjoner, lagring, sanntid og jobber |
| `supabase/tests/` | pgTAP-tester (230 tester) |
| `e2e/` | Playwright-tester |
