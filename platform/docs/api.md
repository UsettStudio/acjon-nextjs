# API, innbygging og webhooks

Plattformen har fire måter å koble andre systemer til på:

| Hva | For hvem | Tilgang |
|---|---|---|
| [Offentlig lese-API](#offentlig-lese-api) | Nettsteder og apper som viser publiserte data | Åpent, CORS for alle |
| [Innbygging](#innbygging) | Utbyggerens eller meglerens eget nettsted | Åpent, bare publiserte velgere |
| [API med nøkkel](#api-med-nøkkel) | Meglersystemer, CRM og andre servere | API-nøkkel fra Innstillinger → API |
| [Webhooks](#webhooks) | Systemer som skal varsles om endringer | Settes opp under Innstillinger → API |

Alle fire er med i pakkene Pro og Partner (og i prøveperioden), ikke i Prosjektside. Se [arkitektur.md](arkitektur.md), avsnitt 13.

Adressene under bruker `https://app.[PLATTFORMDOMENE]`. Alle svar er JSON. Beløp er hele kroner. Areal er m² med én desimal.

## Offentlig lese-API

Gir bare publiserte data, og aldri interne felt: notater, logger, leads, ekstern id, kilde og egne felt som ikke er gjort offentlige. Svarene kan mellomlagres i inntil fem sekunder, så en statusendring er ute innen fem sekunder.

| Metode og adresse | Svar |
|---|---|
| `GET /api/public/v1/selectors/{id}` | Publisert boligvelger: visninger, markeringer, enheter med status og statusfarger |
| `GET /api/public/v1/projects/{id}/units` | Synlige enheter i et prosjekt med publisert prosjektside eller boligvelger |
| `GET /api/public/v1/projects/{id}/units/{slug}` | Én enhet med plantegninger, bilder, dokumenter og offentlige egne felt |

Feil har formen `{ "error": { "code": "not_found", "message": "…" } }`, med status 400 eller 404. Er prosjektet i pakken Prosjektside, er svaret 403 med `plan_required`.

Solgte enheter har `price_hidden: true` og ingen pris når prosjektet skjuler prisen på solgte enheter.

## Innbygging

Koden hentes i boligvelgeren under **Flere valg → Bygg inn på nettsted …**. I pakken Prosjektside vises en lenke til den publiserte velgeren i stedet for velgeren når den er bygd inn på et annet nettsted.

```html
<script src="https://app.[PLATTFORMDOMENE]/embed/v1.js" async></script>
<boligvelger-embed selector="{id}" title="Boligvelger for Fjordparken">
  <noscript><iframe src="https://app.[PLATTFORMDOMENE]/embed/selector/{id}" …></iframe></noscript>
</boligvelger-embed>
```

Web-komponenten viser velgeren i en iframe i sin egen shadow DOM, med høyde etter skjermen (85vh) og lat lasting. Alt i den publiserte velgeren virker: filtre, liste, enhetskort, enhetssider, interesseskjema og sanntid.

| Attributt | Betydning |
|---|---|
| `selector` | Id-en til den publiserte velgeren (påkrevd) |
| `view` | Startvisning (id) |
| `filters="false"` | Skjul filtrene |
| `list="true"` / `list="false"` | Vis eller skjul enhetslisten (standard: som i velgeren) |
| `height` | Høyde, for eksempel `720px` eller `80vh` |
| `title` | Tittel for skjermlesere |
| `sync-url` | Husk enhetsside og filter i adressen til vertssiden (`#boligvelger=/bolig/a-302`) |

Hendelser på elementet (bobler opp og krysser shadow DOM):

| Hendelse | `detail` |
|---|---|
| `boligvelger:ready` | – |
| `boligvelger:navigate` | `{ path }`, for eksempel `"/bolig/a-302"` eller `"?status=ledig&rom=3"` |
| `boligvelger:lead` | `{ unitId }` når et interesseskjema er sendt |

**Iframe som reserve.** Nettsteder som ikke tillater skript, bruker iframen alene (fanen «Iframe» i dialogen). Med skript fjerner komponenten iframen som står i elementet, så velgeren ikke lastes to ganger.

## API med nøkkel

Nøkkelen lages under **Innstillinger → API**. Den vises bare én gang. Databasen lagrer bare en SHA-256-hash.

```bash
curl -H "Authorization: Bearer bpk_…" https://app.[PLATTFORMDOMENE]/api/v1/projects
```

API-et er for server-til-server og har ingen CORS. Grensen er 600 kall i minuttet per nøkkel.

| Tilgang | Gir |
|---|---|
| `projects:read` | Prosjektene i organisasjonen |
| `units:read` | Alle enheter, også skjulte, med ekstern id, kilde og alle egne felt |
| `units:write` | Endre status og pris på enheter |
| `leads:read` | Leads med kontaktinformasjon og samtykke (uten internt notat) |

### Endepunkter

**`GET /api/v1/projects`** (`projects:read`): prosjektene med `unit_counts` (`total`, `upcoming`, `available`, `reserved`, `sold`).

**`GET /api/v1/projects/{id}/units`** (`units:read`): alle enheter i prosjektet. Med `?updated_since=2026-11-13T10:00:00Z` kommer bare enheter som er endret etter tidspunktet.

**`PATCH /api/v1/projects/{id}/units/{enhet}`** (`units:write`): enheten oppgis med id eller enhetsnummer.

```bash
curl -X PATCH -H "Authorization: Bearer bpk_…" -H "Content-Type: application/json" \
  -d '{"status": "sold", "note": "Solgt via meglersystemet", "price": 4250000}' \
  https://app.[PLATTFORMDOMENE]/api/v1/projects/{id}/units/A-302
```

- Feltene som kan endres, er `status` (`upcoming`, `available`, `reserved`, `sold`), `note` (følger statusendringen i loggen), `price`, `purchase_costs`, `shared_debt` og `monthly_fee`. Andre felt avvises.
- Statusendringen logges med kilden `api` og API-nøkkelen som aktør. Den går ut i sanntid og som webhook, og publiserte sider viser den med en gang.
- Svaret er enheten slik den er lagret.

**`GET /api/v1/leads`** (`leads:read`): leads, eldste først.

- `project_id` filtrerer på prosjekt.
- `since` gir bare leads som er nyere enn tidspunktet. Sett `since` til `created_at` for det siste leadet du har fått, så får du bare nye.
- `limit` er 1–500 (standard 100).

### Svar og feil

Vellykkede svar har formen `{ "data": … }`. Feil har formen `{ "error": { "code", "message" } }`:

| Status | `code` | Når |
|---|---|---|
| 400 | `invalid_request`, `invalid_json` | Ugyldig id, parameter eller felt |
| 401 | `unauthorized` | Nøkkelen mangler, er ugyldig, utløpt eller trukket tilbake |
| 403 | `forbidden` | Nøkkelen mangler tilgangen |
| 403 | `read_only` | Organisasjonen er i lesemodus (abonnementet er utløpt). Lesing virker fortsatt. |
| 403 | `plan_required` | Pakken til organisasjonen har ikke API-et (Prosjektside). Nøklene virker igjen etter bytte til Pro eller Partner. |
| 404 | `not_found` | Prosjektet eller enheten finnes ikke i organisasjonen |
| 429 | `rate_limited` | Over 600 kall i minuttet |

## Webhooks

Webhooks settes opp under **Innstillinger → API** med en https-adresse, hendelser og eventuelt bestemte prosjekter.

| Hendelse | Når |
|---|---|
| `unit.status_changed` | En enhet får ny status, uansett hvor endringen gjøres: tabellen, skjemaet, Status-modus, import eller API |
| `lead.created` | Noen sender et interesseskjema |
| `webhook.test` | «Send testhendelse» i admin |

Innholdet sendes med `POST` som JSON:

```json
{
  "id": "6f1c…",
  "type": "unit.status_changed",
  "created_at": "2026-11-13T10:00:00.123+00:00",
  "data": {
    "unit_id": "…", "unit_number": "A-302", "external_id": "FINN-123", "project_id": "…",
    "from_status": "available", "to_status": "sold", "source": "selector", "changed_at": "…"
  }
}
```

`lead.created` har `lead_id`, `project_id`, `unit_id`, `unit_number`, `unit_external_id`, `page_id`, `name`, `email`, `phone`, `message`, samtykkene med tekstversjon og tidspunkt, `source`, `utm` og `created_at`.

### Signatur

Signaturen følger [Standard Webhooks](https://www.standardwebhooks.com). Bibliotekene derfra kan brukes direkte med hemmeligheten (`whsec_…`).

| Header | Innhold |
|---|---|
| `webhook-id` | Id-en til hendelsen. Den er den samme ved nye forsøk, så den kan brukes til å se bort fra duplikater. |
| `webhook-timestamp` | Tidspunktet for sendingen i sekunder |
| `webhook-signature` | `v1,{base64(HMAC-SHA256(nøkkel, "{webhook-id}.{webhook-timestamp}.{innhold}"))}` |

Nøkkelen er hemmeligheten uten `whsec_`, base64-dekodet. Kontroll i Node.js:

```js
import { createHmac, timingSafeEqual } from "node:crypto";

function verify(secret, headers, body) {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signed = `${headers["webhook-id"]}.${headers["webhook-timestamp"]}.${body}`;
  const expected = Buffer.from(createHmac("sha256", key).update(signed).digest("base64"));
  const fresh = Math.abs(Date.now() / 1000 - Number(headers["webhook-timestamp"])) < 300;
  return fresh && headers["webhook-signature"].split(" ").some((part) => {
    const given = Buffer.from(part.replace(/^v1,/, ""));
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
```

### Levering og nye forsøk

- **Vellykket levering:** mottakeren må svare med 2xx innen ti sekunder. Omdirigeringer følges ikke.
- **Nye forsøk:** en levering som feiler, prøves igjen etter 1, 2, 4, 8, 16, 32 og 64 minutter, høyst åtte forsøk og omtrent to timer i alt. Deretter står den som «Feilet» i loggen og kan sendes på nytt med «Prøv igjen».
- **Når hendelsene sendes:** de legges i en utboks i samme transaksjon som endringen, så ingen hendelse går tapt. Hendelser fra admin, API og interesseskjema sendes rett etter endringen. En planlagt jobb hvert minutt sender resten.
- **Vern mot SSRF:** webhooks sendes bare til offentlige adresser. Adresser i private nett, lokale adresser og metadata-tjenester avvises, også når et vertsnavn peker dit via DNS.
- **Webhook som er slått av:** leveranser venter til den slås på igjen, i inntil tre døgn.
