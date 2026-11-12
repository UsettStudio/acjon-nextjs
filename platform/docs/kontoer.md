# Kontoer og oppsett

Sjekkliste for kontoene som trengs før excip kan settes i drift. Alt kan utvikles og testes lokalt uten dem (se README). Drift og rutiner står i [drift.md](drift.md).

**Hemmeligheter** (nøkler, tokens og passord) limes bare inn i Vercel (Settings → Environment Variables) og i `.env.local` lokalt. Aldri i chat, e-post, saker eller kode. Etter at de er lagt inn, holder det å si fra at de er på plass.

## Før du begynner

- **Domene.** Plattformdomenet er ikke bestemt. Det trengs i Supabase Auth, Vercel, Resend og Stripe. Under står det `[PLATTFORMDOMENE]`. Du kan opprette kontoene nå og legge inn domenet når det er valgt.
- **Alle tjenestene i EU.** Kundedata lagres i EU (se [drift.md](drift.md#tjenester-og-regioner)). Velg regionene under når kontoene opprettes. De kan ikke endres senere uten å flytte data.
- **Databehandleravtale (DPA)** inngås med alle underleverandørene før lansering.

## Sjekkliste

### 1. Supabase

- [ ] To prosjekter, **staging** og **produksjon**, i region **Stockholm (`eu-north-1`)**. Pro-plan for produksjon (daglig sikkerhetskopi og PITR).
- [ ] Kjør migrasjonene: `npx supabase link --project-ref …` og `npx supabase db push`.
- [ ] Auth:
  - Site URL: `https://app.[PLATTFORMDOMENE]`
  - Redirect-URL: `https://app.[PLATTFORMDOMENE]/**`
  - E-postbekreftelse på, minste passordlengde 10.
  - E-post via Resend SMTP (punkt 3).
  - E-postmalene fra `supabase/templates/`.
- [ ] Slå på point-in-time recovery (PITR) i produksjon, med minst 7 dager.

| Miljøvariabel | Hentes fra | Hemmelig |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API | Nei |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys (publishable) | Nei |
| `SUPABASE_SECRET_KEY` | Project Settings → API Keys (secret). Brukes bare på serveren. | **Ja** |

### 2. Vercel

- [ ] Prosjekt fra GitHub-repoet med **Root Directory `platform`**. Funksjonene kjører i Stockholm (`arn1`, fra `vercel.json`).
- [ ] Domener: `app.[PLATTFORMDOMENE]` og wildcard `*.[PLATTFORMDOMENE]`. Wildcard krever at domenet bruker Vercel sine navnetjenere.
- [ ] Vercel Pro: jobben som sender webhooks, kjører hvert minutt.
- [ ] API-token med tilgang bare til prosjektet (kundenes egne domener legges da til automatisk).

| Miljøvariabel | Verdi | Hemmelig |
|---|---|---|
| `NEXT_PUBLIC_PRODUCT_NAME` | `excip` | Nei |
| `NEXT_PUBLIC_PLATFORM_DOMAIN` | `[PLATTFORMDOMENE]` | Nei |
| `NEXT_PUBLIC_APP_URL` | `https://app.[PLATTFORMDOMENE]` | Nei |
| `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | Project Settings → General | Nei |
| `VERCEL_API_TOKEN` | Account Settings → Tokens | **Ja** |
| `CRON_SECRET` | En lang tilfeldig verdi | **Ja** |
| `DOMAIN_TXT_PREFIX` | Valgfri, standard `_excip`. Settes til det endelige navnet før første kunde legger til et eget domene. | Nei |

### 3. Resend

- [ ] Avsenderdomenet lagt til i region **EU (`eu-west-1`)** og bekreftet (DNS-poster hos domeneleverandøren).
- [ ] SMTP-oppsett til Supabase Auth (punkt 1).

| Miljøvariabel | Verdi | Hemmelig |
|---|---|---|
| `RESEND_API_KEY` | API Keys | **Ja** |
| `EMAIL_FROM` | For eksempel `excip <noreply@[PLATTFORMDOMENE]>` | Nei |

### 4. Stripe

- [ ] Konto for Norge, med **Stripe Payments Europe** som avtalepart.
- [ ] **Stripe Tax** med registrering for norsk mva. Skattekode for produktene: «Software as a service (SaaS) – business use» (`txcd_10103001`).
- [ ] Produktene og prisene under. Alle prisene i **NOK**, **uten mva.** («Include tax in price: No»), og månedlige uten bindingstid.

  | Produkt | Pris | Miljøvariabel |
  |---|---|---|
  | Prosjektside | 890 kr per måned | `STRIPE_PRICE_START` (id-en til prisen, `price_…`) |
  | Pro | 2 190 kr per måned | `STRIPE_PRICE_PRO` |
  | Partner | 3 990 kr per måned | `STRIPE_PRICE_PARTNER` |
  | Oppstart per prosjekt | Ingen pris i Stripe. Beløpet (6 900–49 900 kr) regnes ut i appen etter antall enheter. | `STRIPE_PRODUCT_LAUNCH` (id-en til produktet, `prod_…`) |

- [ ] **Kundeportalen** (Settings → Billing → Customer portal):
  - Kunden kan oppdatere betalingsmåte og se fakturaer.
  - Kunden kan bytte mellom de tre månedsprisene.
  - Oppsigelse gjelder ved slutten av perioden.
- [ ] **Webhook** til `https://app.[PLATTFORMDOMENE]/api/stripe/webhook` med hendelsene:
  - `checkout.session.completed` og `checkout.session.async_payment_succeeded`
  - `customer.subscription.created`, `.updated`, `.deleted`, `.paused`, `.resumed` og `.trial_will_end`
  - `invoice.paid`, `invoice.payment_failed` og `invoice.payment_action_required`
- [ ] Gjør alt først i testmodus (staging), og så i live-modus (produksjon). Id-ene er forskjellige i de to modusene.

| Miljøvariabel | Hentes fra | Hemmelig |
|---|---|---|
| `STRIPE_SECRET_KEY` | Developers → API keys (secret key, eller en restricted key) | **Ja** |
| `STRIPE_WEBHOOK_SECRET` | Webhooken over (`whsec_…`) | **Ja** |
| `STRIPE_PRICE_START`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PARTNER` | Prisene over | Nei |
| `STRIPE_PRODUCT_LAUNCH` | Produktet «Oppstart per prosjekt» | Nei |
| `STRIPE_AUTOMATIC_TAX` | `true` når Stripe Tax er satt opp | Nei |

### 5. Sentry

- [ ] Organisasjon i **EU-regionen** (`de.sentry.io`) og et prosjekt for Next.js.

| Miljøvariabel | Hentes fra | Hemmelig |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Project Settings → Client Keys | Nei |
| `SENTRY_ORG`, `SENTRY_PROJECT` | Navnene i Sentry | Nei |
| `SENTRY_AUTH_TOKEN` | Organization Settings → Auth Tokens (bare for kildekart ved bygging) | **Ja** |

### 6. Cloudflare Turnstile

- [ ] En widget for interesseskjemaet med vertsnavnet `[PLATTFORMDOMENE]`. Sjekk i Cloudflare om underdomenene og kundenes egne domener dekkes av widgeten. Gjør de ikke det, må de legges til, ellers stopper skjemaet på de domenene.

| Miljøvariabel | Hentes fra | Hemmelig |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key | Nei |
| `TURNSTILE_SECRET_KEY` | Secret key | **Ja** |

### 7. Annet

- [ ] `SUPPORT_EMAIL`: adressen kundene ser på Abonnement og Lansering for avtaler (for eksempel prosjekter med mer enn 199 enheter).
- [ ] Overvåking av oppetid mot `https://app.[PLATTFORMDOMENE]/api/health` (se [drift.md](drift.md#overvåking)).
- [ ] Ukentlig kopi av bucketen `media` til en lagringskonto i EU (se [drift.md](drift.md#sikkerhetskopi-og-gjenoppretting)).

## Etterpå

1. Rull ut til staging og gå gjennom flyten med Stripe i testmodus: ny organisasjon, velg pakke, lanser et prosjekt (testkort `4242 4242 4242 4242`) og publiser.
2. Sjekk at fakturaene i Stripe har riktig mva. og at webhooken svarer 200.
3. Rull ut til produksjon (se [drift.md](drift.md#utrulling)).
