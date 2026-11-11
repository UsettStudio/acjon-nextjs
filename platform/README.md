# Boligplattform

Selvbetjent SaaS for boligutbyggere og eiendomsmeglere. Kunden setter selv opp prosjekter og enheter, en interaktiv boligvelger og en prosjektside, og endrer status som oppdateres overalt med en gang.

Produktnavn og plattformdomene er ikke bestemt ennå. «Boligplattform» er et arbeidsnavn.

- [docs/arkitektur.md](docs/arkitektur.md) beskriver mappestruktur, datamodell, tilgangsmodell, offentlig API, publisering, sanntid og personvern.
- [docs/plan.md](docs/plan.md) inneholder plan per fase, valg til godkjenning og åpne spørsmål.

## Status

Levert til godkjenning:

- SQL-migrasjoner med RLS-regler.
- pgTAP-tester.
- Arkitektur og faseplan.

Appen bygges fra fase 0 når planen er godkjent.

## Kjør databasen lokalt

Krever Docker og [Supabase CLI](https://supabase.com/docs/guides/local-development) 3.x (testet med 3.1).

```bash
cd platform
supabase start         # starter Postgres, Auth, Storage og Realtime og kjører migrasjonene
supabase test db       # kjører pgTAP-testene i supabase/tests (219 tester)
supabase db lint       # statisk sjekk av alle funksjoner
supabase db reset      # bygger databasen på nytt fra migrasjonene
```

## Innhold

| Mappe | Innhold |
|---|---|
| `supabase/migrations/` | Datamodell, tilgangsfunksjoner, RLS, domenelogikk, offentlig lese-API, lagring, sanntid og jobber |
| `supabase/tests/` | Skjemaregler, isolasjon mellom organisasjoner, roller, statuslogg, publisering og offentlig API |
| `docs/` | Arkitektur og plan |
