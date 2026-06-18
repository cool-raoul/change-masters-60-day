# Ronde 4 — Brede pre-pilot gezondheids-audit

4 agenten: onafgemaakt werk, dode verwijzingen, onboarding-flow, top-risico's.

**Geruststellend grootbeeld:** de fundering is gezond. Admin/tester-routes
dwingen rol-checks af, cron-routes hebben CRON_SECRET, de Stripe-webhook
verifieert de signatuur, RLS is team-scoped op de privacy-tabellen, en er zijn
nette empty-states/fallbacks overal. Geen kapotte member-routes, geen API-stubs.

**Maar er zijn twee echte pilot-blokkers die de eerdere rondes niet zagen.**

---

## 🔴 BLOKKER 1 — Core-members blijven eeuwig op dag 1 (door mij geverifieerd)

**Wat:** de dag-voortgang voor een echte Core-member leest de verplichte
taak-id's uit de **oude** `CORE_DAGEN`-array (`core-dag1-vcard-import`,
`core-dag1-sponsor-bericht`, …). Maar /vandaag toont en bewaart sinds 31 mei de
**V9**-stappen met andere id's (`core-v9-stap1-builder-uitleg`,
`core-v9-stap1-sponsor`, …). De id-sets overlappen **nergens**.

**Gevolg:** een member voltooit `core-v9-stap1-*`, maar `berekenHuidigeDag`
zoekt naar voltooide `core-dag1-*` → die zijn er nooit → de functie geeft
altijd dag 1 terug. De member komt **nooit verder dan dag 1**. Founders/testers
merken het niet, want die draaien in kalender-modus (`isTester||isFounder`).
`is_tester` staat default `false` en wordt nergens op true gezet → **elke nieuwe
pilot-recruit raakt dit gegarandeerd.**

**Geverifieerd:**
- `bereken-dag.ts:56` → `const dagenArray = modus === "core" ? CORE_DAGEN : DAGEN;`
- `app/vandaag/page.tsx:349` → rendert `CORE_V9_STAPPEN.find(...)` (V9-id's worden voltooid)
- day-1 id's: `core-dag1-*` (oud) vs `core-v9-stap1-*` (V9) → geen overlap.

**Exacte fix (5 min + testen):**
1. `lib/playbook/bereken-dag.ts:56` — voor Core de **V9**-array gebruiken:
   importeer `CORE_V9_STAPPEN` en zet
   `const dagenArray = modus === "core" ? CORE_V9_STAPPEN : DAGEN;`
   (de loop is alleen dag 1-21; ná 21 gebruikt 'ie al kalenderdag, dus
   CORE_DAGEN is daar niet nodig.)
2. `lib/playbook/dagen-voor-modus.ts:30` — voor consistentie de dashboard/topbar
   óók uit `CORE_V9_STAPPEN` laten lezen voor Core dag ≤21 (anders toont het
   dashboard nog de oude dag-content).
3. **Verifiëren met een ECHT non-tester account:** dag 1 afronden, en checken
   dat je doorklikt naar dag 2. Dit is waarom ik 'm niet zelf deploy.

---

## 🔴 BLOKKER 2 — Registratie kan doodlopen bij e-mailbevestiging

**Wat:** `app/registreer/page.tsx` doet na `signUp()` onvoorwaardelijk
`router.push('/onboarding')` met de aanname "geen e-mailbevestiging nodig".
Staat in Supabase **"Confirm email" AAN**, dan is er geen sessie → de middleware
stuurt terug naar /login → de member zit klem (het "check je mail"-scherm in
diezelfde file wordt nooit getoond). Hangt 100% af van een Supabase-dashboard-
instelling die niet in de repo staat.

**Fix:**
1. **Verifiëren** dat "Confirm email" UIT staat in Supabase → Auth (en vastleggen
   in de deploy-docs). Dan klopt de directe redirect.
2. Als bevestiging WEL aan moet: `data.session` uit `signUp` lezen en bij geen
   sessie het bestaande "check je mail"-scherm tonen i.p.v. te pushen.
3. **Eén keer end-to-end testen** met een vers e-mailadres vóór 1 juli.

> Klein meegenomen: de `handle_new_user`-trigger schrijft **telefoon niet weg**
> terwijl de UI 'm verplicht maakt → het ingevulde nummer verdwijnt stil.
> Telefoon toevoegen aan de trigger.

---

## 🟠 Niet-blokkerend, wel belangrijk voor 1 juli
- **Uitkomst-mail + push hangen aan de mail-queue-insert** (al ronde 1, punt B).
  Tweede agent bevestigt: op een drukke launch-dag kan een transient insert-fout
  zowel de mail als de push stil laten wegvallen. Ontkoppelen (samen).
- **Stripe-webhook niet idempotent + leunt op één webhook + 3 env-vars.**
  Ontbreekt `STRIPE_WEBHOOK_SECRET` in productie, dan krijgt een betalende
  gebruiker geen premium terwijl de betaling slaagt. → in Stripe-dashboard de
  webhook + secret verifiëren en één test-betaling end-to-end doen.
- **Migraties verifiëren in productie.** Veel pagina's hebben "tabel bestaat nog
  niet"-fallbacks. Eén keer checken dat alle migraties in `supabase/migrations/`
  én `lib/supabase/migrations/` in de productie-DB staan (vooral
  `wekelijkse_reviews`, `prospect_film_views`, `freebies`, `freebie_mail_queue`,
  mini-eleva `soort`-kolom). Dit raakt ook of de freebie-uitkomst-mail werkt.
- **Schema-drift.** `schema.sql:12` kent role alleen `('leider','lid')`, maar de
  code gebruikt overal `founder` → het live schema is handmatig in de console
  geëvolueerd. Geen acute bug, wel een hersteldoolhof als er ooit iets terug moet.
  Aanrader: één verse `pg_dump --schema-only` (incl. policies) als bron-van-
  waarheid committen, en de role-CHECK bijwerken met `founder`.
- **DB-uniciteit funnel** (al ronde 1, punt A): 3 kleine unieke indexen tegen
  race-dubbeling.

## 🟡 Klein / bevestigingen
- **Vals positief uit ronde 2:** `/academy/social-media#module-8` IS geldig
  (module 8 = "Stories die werken"). Die scan-flag mag eruit.
- **Dag-11 "dashboard" → "statistieken"** (tekst-mismatch, al in ronde 2).
- Dode legacy: `core-dagen-v6.ts` + `/core-v6` zijn onbereikbaar (flag nergens
  true). Ná de pilot opruimen, niet nu.
- Stale comments (`/m/[token]` "Fase 6a placeholders", `/wat-nu` dode
  `/core-v9`-tak, `/auth/callback`-entry in middleware). Cosmetisch.
- 5 freebie-templates zijn TODO-GABY placeholders, maar **niet** member-
  bereikbaar (alleen founder-overzicht). Showcase zegt wel "meerdere freebies
  staan klaar" — of invullen, of de pitch temperen.
- Geen rate-limiting op publieke bot-routes (bewust geaccepteerd voor de pilot).
