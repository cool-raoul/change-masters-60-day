# Spec: mini-ELEVA aanvragen vanuit de mail (prospect-initiated)

Datum: 2026-06-18
Status: WACHT OP GOEDKEURING RAOUL

## Doel

Een prospect die een freebie invulde (bv. Reset-check) krijgt de mail-serie.
In die mails staat een knop naar "je eigen omgeving" (mini-ELEVA). Tot nu toe
werd die omgeving automatisch aangemaakt bij het invullen (verwijderd, want
ongewenst). Nieuwe gedraging: de omgeving wordt pas aangemaakt op het moment
dat de PROSPECT zelf op de knop in de mail klikt. De member stuurt niks, maar
krijgt wel een melding (push + in-app) zodra het gebeurt, en ziet het op de
prospect-kaart.

## Wat al bestaat (hergebruiken, niet bouwen)

- `lib/mini-eleva/auto-invitation.ts` `zorgVoorMiniElevaInvitation(admin, {prospectId, memberUserId})`
  maakt (of hergebruikt) een actieve `prospect_invitations`-rij, token `p-` + 38 hex, 14 dagen.
- `app/m/[token]/page.tsx` logt bij eerste bezoek activiteit (`mini_eleva_activiteit`)
  en vuurt de "eerste-bezoek"-melding via `notifeerVoorUitnodiging` → dat doet
  IN-APP (`mini_eleva_notificaties`) EN push (`sendPushToUser`) naar de member.
- `components/namenlijst/MiniElevaNotificatieBanner.tsx` toont de in-app bel op /namenlijst.
- `components/namenlijst/MiniElevaActieveSessies.tsx` toont het "Mini-ELEVA-momentum"-blok
  op de prospect-kaart (activiteit, laatst actief, verloopt over X dagen).

Conclusie: zodra de uitnodiging bestaat en de prospect 'm opent, krijgt de member
AL de melding (push + in-app) en toont de kaart het momentum. Dat hoeven we niet
te bouwen.

## Wat nieuw is (klein, geen DB-migratie)

### 1. Publiek aanvraag-endpoint
`GET /api/mini-eleva/aanvraag?optin=<opt_in_id>&dag=<n>`

- Zoek `freebie_opt_ins` op id → `member_id`, `lead_email`, `lead_naam`.
- Zoek de prospect (`prospects` waar `user_id = member_id` en `email ilike lead_email`).
- `zorgVoorMiniElevaInvitation(admin, {prospectId, memberUserId: member_id})` → token.
- 302-redirect naar `/m/<token>?bron=mail-aanvraag` (of `mail-d<n>`).
- De `/m/[token]`-pagina doet de rest (activiteit loggen + eerste-bezoek-melding push+in-app).
- Veilig falen: opt-in/prospect niet gevonden, of aanmaken mislukt → redirect naar een
  nette neutrale pagina (geen 500, geen PII in de response).
- Idempotent: bestaande actieve uitnodiging wordt hergebruikt (geen dubbele).

### 2. Cron / mail-knop altijd tonen
`app/api/cron/freebie-mails/route.ts` + `lib/reset-check/mails.ts` (`miniElevaBlok`):

- Nu: knop verschijnt alleen als er al een actieve uitnodiging is (anders block weg).
- Nieuw: is er nog GEEN actieve uitnodiging, dan wijst de knop naar het aanvraag-endpoint
  (`/api/mini-eleva/aanvraag?optin=<opt_in_id>&dag=<n>`). Is die er wel, dan direct naar
  `/m/<token>` (huidig gedrag). Block is dus altijd aanwezig.
- `bron`-stempel netjes samenvoegen (`?` vs `&`) zodat tracking blijft werken.

## Member-melding (zoals gevraagd)

- Push: ja, via bestaande `sendPushToUser` in de eerste-bezoek-flow.
- In-app: ja, via `mini_eleva_notificaties` + de bel-banner op /namenlijst.
- Titel/tekst: bestaande "eerste-bezoek"-melding ("… heeft je omgeving geopend").
  Eventueel tekst aanscherpen naar "via de mail" (klein, optioneel).

## Privacy / AVG

Sluit aan op AVG-keuze A (member ziet WANNEER + geaggregeerd, niet WAT er gevraagd
wordt). Geen chat-inhoud in meldingen. Opt-in-haal-erbij: de prospect trekt zichzelf
naar binnen.

## Beveiliging

- Endpoint is publiek maar vereist een geldig `opt_in_id` (UUID, ~122 bits, onraadbaar).
- Schrijft alleen een uitnodiging voor een BESTAANDE opt-in + prospect. Idempotent.
- Geen gevoelige data in de response (alleen een redirect).

## Niet in scope (parkeren)

- Aparte kolom `aangevraagd_door` op `prospect_invitations` (member vs prospect).
  Niet nodig: de activiteit-detail "geopend via mail-aanvraag" legt het al vast.
- Dezelfde aanvraag-knop voor energie-en-focus / hormonen-en-overgang (die bots hebben
  nog geen mail-serie / prospect-renderer).
