# Downline-ondersteuning — Design

**Doel:** Members die hun eerste directe partner krijgen automatisch een nieuwe stap in /vandaag erbij krijgen ("🤝 Check je partners"), met geaggregeerde signalen + WhatsApp-knoppen zónder AI-tussenkomst. Plus een mijlpaal-viering bij de eerste partner ooit.

**Filosofische basis (Raoul, 2026-05-14):** voor PROSPECTS mag de Mentor schrijfhulp geven (claim-vrij, etc.). Voor PARTNERS in je team niet — AI-zinnen ondermijnen de authenticiteit van team-relaties. Sponsor-zijn is een menselijke rol. ELEVA toont waar aandacht nodig is, de member schrijft zelf wat hij stuurt.

**Status:** Brainstorm-akkoord 2026-05-14 (Raoul). Klaar voor implementatie-plan.

---

## 1. Achtergrond

Members in ELEVA bouwen in 60 dagen een eigen pijplijn. Sommige prospects worden uiteindelijk PARTNERS (zelf member in de Lifeplus-organisatie). Vanaf dat moment is de oorspronkelijke member zelf SPONSOR voor die nieuwe partner. Eric Worre's Skill #6 ("Helping Your New Distributor Get Started Right") is hier de relevante leerstof — de eerste 30 tot 90 dagen van een nieuwe partner zijn cruciaal voor retentie.

ELEVA heeft dit al:
- `profiles.sponsor_id` foreign key (zelf-referentieel naar `profiles.id`), gezet bij registratie via trigger op `auth.users → profiles` insert
- `/team` pagina met `TeamBoom`-component die downline-tree toont
- `last_seen_at` + `presence_zichtbaar` toggle voor presence-tracking
- `onboarding_voortgang` tabel per teamlid
- `CelebrationLayer` component die naar `eleva-celebrate`-events luistert
- Push-notificatie-infrastructuur (VAPID)

ELEVA mist dit nog:
- Dagelijkse focus op directe partners en hun status
- Automatische detectie + viering bij nieuwe partner
- Een sponsor-rol-shift moment in de dagelijkse flow
- Geaggregeerde signalen waaraan een sponsor kan zien waar aandacht nodig is

Deze spec dekt de toevoeging.

---

## 2. Architectuur

### Bestaande infrastructuur (hergebruiken)

```
profiles (sponsor_id) ←→ TeamBoom (downline-tree)
                       ←→ /team pagina
                       
last_seen_at (presence)     → signaal: hoe lang stil?
dag_voltooiingen-tabel      → signaal: hoeveel % taken voltooid?
profiles.run_startdatum     → signaal: op welke dag staat partner?
profiles.modus              → signaal: sprint/core/pro?
profiles.commitment_uren    → signaal: welk tempo?

CelebrationLayer event-bus  ← triggerbron voor mijlpaal-confetti
Push-notificatie-flow       ← triggerbron voor mijlpaal-push
```

### Nieuwe componenten

```
partner_mijlpalen-tabel        ← nieuwe DB-tabel voor mijlpaal-state
partner-overview-helper        ← server-fetch met geaggregeerde signalen
PartnerCheckEmbed              ← inline-embed in /vandaag
EerstePartnerVieringTegel      ← dashboard-tegel (eenmalig zichtbaar)
partner-overview RLS-policy    ← garandeert dat sponsor alleen eigen
                                 downline kan lezen
```

### Just-in-time activatie

Beslissing: niets nieuws zichtbaar voor member zonder partners. Detectie via server-fetch bij elk `/vandaag` en `/dashboard` laden (count van directe partners). Realtime-subscriptie is uit scope voor MVP.

---

## 3. Detectie & Activatie

### 3.1 Wat is een "directe partner"?

Elk profiel waar `sponsor_id = mijn user_id`. Geen filter op `onboarding_klaar` — ook partners die zich net hebben aangemeld maar nog niet door onboarding zijn, zijn relevant (de sponsor wil ze juist daar begeleiden).

### 3.2 Wat is de "tweede laag"?

Profielen waar `sponsor_id IN (mijn directe partners)`. Maximaal 50 weergegeven in de uitklap (voor schalbaarheid in pilot-fase).

### 3.3 Detectie-frequentie

Server-side bij elke `/vandaag`-laad en `/dashboard`-laad. Geen polling, geen realtime in MVP. Acceptabele latency: een nieuwe partner verschijnt bij de volgende paginavernieuwing.

### 3.4 Eerste-partner-mijlpaal-detectie

Bij elk `/vandaag`-laad checken:
```sql
-- pseudo: heeft member een eerste-partner-mijlpaal al gevierd?
SELECT EXISTS(
  SELECT 1 FROM partner_mijlpalen
  WHERE user_id = <mijn id> AND type = 'eerste-partner'
) AS al_gevierd;

-- en: hebben we minstens 1 directe partner?
SELECT COUNT(*) FROM profiles WHERE sponsor_id = <mijn id>;
```

Als `al_gevierd = false` EN aantal directe partners ≥ 1: registreer mijlpaal-rij + trigger viering.

---

## 4. Nieuwe inline-embed in /vandaag

### 4.1 Trigger

Stap wordt toegevoegd aan ELKE dag (1 t/m 60) zodra `aantal_directe_partners >= 1`. Geen partner = geen stap. Eén of meer partners = stap altijd zichtbaar als laatste optionele stap, na sponsor-checkin/-call.

### 4.2 Stap-definitie

```typescript
{
  id: `dag${dagNummer}-partner-check`,
  label: `🤝 Check je nieuwe partner(s) vandaag`,
  uitleg: PARTNER_CHECK_UITLEG, // zie sectie 4.5
  verplicht: false,
  inlineEmbed: "partner-check",
}
```

`inlineEmbed: "partner-check"` is een nieuwe waarde op het `ControllableTaak.inlineEmbed`-union-type.

### 4.3 Component-render

`PartnerCheckEmbed` (client-component in `components/vandaag/inline-embeds/`). Haalt server-side voorbereide data via een nieuwe API-route `/api/team/partner-overview`.

Layout per directe partner:

```
┌─────────────────────────────────────────────────┐
│ [Foto] Anne Jansen · Bouwen-tempo               │
│        Dag 4 · 2u geleden ingelogd              │
│        60% taken deze week ✓                    │
│        ─────                                    │
│        💬 Stuur Anne een bericht  →             │
└─────────────────────────────────────────────────┘
```

Bij urgentie-signaal (laatste login >72u OF <30% verplichte taken deze week voltooid):

```
┌─────────────────────────────────────────────────┐
│ ⚠️ Anne Jansen — aandacht nodig                 │
│        Dag 4 · 95u geleden ingelogd             │
│        0% taken deze week                       │
│        ─────                                    │
│        💬 Stuur Anne een bericht  →             │
└─────────────────────────────────────────────────┘
```

### 4.4 WhatsApp-knop-gedrag

Opent `wa.me/<telefoonnummer>` ZONDER `?text=...`-parameter. Member start met een leeg WhatsApp-gesprek en schrijft zelf in eigen woorden. **GEEN voorgekauwd bericht. GEEN Mentor-suggestie-knop.**

Bij ontbrekend telefoonnummer in profiel: knop toont "📞 Telefoonnummer onbekend — vraag Anne via [andere kanaal]" en is niet klikbaar.

### 4.5 Uitleg-tekst bovenaan de stap

```
Sponsor-zijn is een MENSELIJKE rol. Geen scripts, geen AI-zinnen — gewoon
jij die contact houdt met de mensen die jij hebt aangemeld. ELEVA toont je
waar aandacht nodig is. Wat je stuurt, kies je zelf, in jouw eigen woorden.

Wil je dieper leren hoe je sponsor bent? In de Academy staat de Audio-
onderweg-training met Skill #6 — "Helping Your New Distributor Get
Started Right". Luister 'm in de auto of tijdens een wandeling, niet
hier in een AI-snelle-fix.
```

### 4.6 Tweede-laag-uitklap

Onder de directe partners een collapsible-toggle:

```
► Zie ook indirecte downline (3 mensen via Anne, Bert, Carla)
```

Bij uitklap: zelfde lay-out als directe-partner-kaarten, maar zonder WhatsApp-knop (indirecte downline = niet jouw directe verantwoordelijkheid om te appen, eerder iets om OP DE HOOGTE te zijn). Eventueel kleine tekst "via [naam directe partner]".

---

## 5. Privacy-laag

### 5.1 Wat sponsor wel mag zien

Per directe partner + 2e laag:
- `full_name`
- Profielfoto (avatar URL) indien beschikbaar
- `role` (lid / leider / founder)
- `modus` (sprint / core / pro)
- `commitment_uren` (2 / 4 / 6) als tempo-label
- Huidige dag-nummer in playbook (afgeleid uit `run_startdatum`)
- `last_seen_at` (alleen als `presence_zichtbaar = true` op het partner-profiel — dat is hun eigen toggle)
- Geaggregeerd: % verplichte taken voltooid in afgelopen 7 dagen

### 5.2 Wat sponsor NIET mag zien

- Inhoud van prospect-lijst (geen prospect-namen, geen pipeline-fases)
- Individuele taak-voltooiingen (alleen geaggregeerd % per week)
- Mentor-gesprekken (volledig privé)
- Notities op prospect-kaarten
- WHY-inhoud (alleen of WHY is ingevuld, niet wát de WHY is)
- E-mail (komt niet via partner-overview, blijft op auth.users)

### 5.3 Implementatie: PostgreSQL-functie + RLS

Nieuwe stored function:

```sql
CREATE OR REPLACE FUNCTION partner_overview_voor_sponsor(p_sponsor_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  role text,
  modus text,
  commitment_uren int,
  huidige_dag int,
  laatst_gezien_uren int,   -- NULL als presence_zichtbaar=false
  taken_voltooid_pct int,    -- 0-100, afgelopen 7 dagen
  is_directe_partner bool,   -- vs 2e laag
  via_partner_naam text      -- alleen voor 2e laag
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Directe partners
  SELECT
    p.id,
    p.full_name,
    p.role,
    p.modus,
    COALESCE((p.raw_user_meta_data->>'commitment_uren')::int, 4),
    bereken_huidige_dag(p.run_startdatum),
    CASE
      WHEN p.presence_zichtbaar THEN
        EXTRACT(EPOCH FROM (now() - p.last_seen_at))::int / 3600
      ELSE NULL
    END,
    bereken_taken_voltooid_pct(p.id, 7),
    true,
    NULL::text
  FROM profiles p
  WHERE p.sponsor_id = p_sponsor_id

  UNION ALL

  -- 2e laag
  SELECT
    p2.id,
    p2.full_name,
    p2.role,
    p2.modus,
    COALESCE((p2.raw_user_meta_data->>'commitment_uren')::int, 4),
    bereken_huidige_dag(p2.run_startdatum),
    CASE
      WHEN p2.presence_zichtbaar THEN
        EXTRACT(EPOCH FROM (now() - p2.last_seen_at))::int / 3600
      ELSE NULL
    END,
    bereken_taken_voltooid_pct(p2.id, 7),
    false,
    p1.full_name
  FROM profiles p2
  JOIN profiles p1 ON p2.sponsor_id = p1.id
  WHERE p1.sponsor_id = p_sponsor_id
  LIMIT 50;
END;
$$;
```

`SECURITY DEFINER` garandeert dat de functie als systeem-rol draait en alleen geaggregeerde velden returnt — sponsor kan niet via deze functie ongeoorloofde velden ophalen.

RLS-policy op `profiles` blijft restrictief; sponsor heeft geen direct read-access op partner-rijen. Alleen via deze functie.

Hulp-functies (mogelijk al bestaand):
- `bereken_huidige_dag(run_startdatum)`: kalender-modus berekening
- `bereken_taken_voltooid_pct(user_id, dagen_terug)`: telt verplichte voltooide taken / verplichte taken voor afgelopen N dagen

---

## 6. Eerste-partner-mijlpaal

### 6.1 Nieuwe tabel `partner_mijlpalen`

```sql
CREATE TABLE partner_mijlpalen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,        -- 'eerste-partner', 'tweede-partner', etc.
  partner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  gevierd_op timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE (user_id, type)
);

CREATE INDEX idx_partner_mijlpalen_user ON partner_mijlpalen(user_id);
```

UNIQUE constraint op `(user_id, type)` voorkomt dubbele "eerste-partner"-vieringen.

### 6.2 Trigger-flow

Bij `/vandaag` of `/dashboard` laden (server-side):

```typescript
// Pseudo:
const directePartners = await haalDirectePartners(userId);
if (directePartners.length >= 1) {
  const alGevierd = await heeftMijlpaal(userId, 'eerste-partner');
  if (!alGevierd) {
    await registreerMijlpaal(userId, 'eerste-partner', directePartners[0].id);
    await stuurPush(userId, 'eerste-partner-push', { partnerNaam: directePartners[0].full_name });
    // En: zet een flag in een client-readable veld zodat CelebrationLayer
    // de big-confetti triggert bij paginabezoek.
  }
}
```

### 6.3 Push-bericht-template

```
🎉 Je hebt je eerste partner!
Anne Jansen heeft zich net onder jou aangemeld. Open ELEVA om
te vieren.
```

Klik op push → opent `/dashboard?vier=eerste-partner` (querystring triggert CelebrationLayer + eenmalige tegel).

### 6.4 Dashboard-tegel `EerstePartnerVieringTegel`

Eenmalig zichtbaar (zolang `?vier=eerste-partner` in URL OR `partner_mijlpalen.gevierd_op > NOW() - INTERVAL '24 hours'`).

Layout:

```
🎉 Vier je eerste partner!

Anne Jansen heeft zich net onder jou aangemeld.
Dit is een groot moment. Drie dingen om vandaag te doen:

  ✓ Stuur Anne een hartelijk welkom-berichtje
    (in jouw eigen woorden)
    💬 Open WhatsApp →

  ✓ Bedank je eigen sponsor — die heeft jou hier gebracht
    💬 Open WhatsApp naar [sponsor naam] →

  ✓ Luister deze week Skill #6 uit de Audio-onderweg-training
    🎧 Open Academy →

  Sluiten (verdwijnt na vandaag automatisch)
```

WhatsApp-knoppen: leeg gesprek (geen pre-fill text), zelfde principe als sectie 4.4.

---

## 7. Data- en API-structuur

### 7.1 Nieuwe API-route

`/api/team/partner-overview` — GET

Authoriseert via Supabase session. Roept `partner_overview_voor_sponsor(user.id)` aan. Returnt JSON:

```typescript
type PartnerOverviewResponse = {
  directe: PartnerInfo[];
  tweedeLaag: PartnerInfo[];
  eerstePartnerOoit: boolean;  // voor mijlpaal-detectie client-side
};

type PartnerInfo = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  role: "lid" | "leider" | "founder";
  modus: "sprint" | "core" | "pro" | null;
  commitmentUren: 2 | 4 | 6 | null;
  huidigeDag: number;          // 1-60
  laatstGezienUren: number | null;  // null = presence niet gedeeld
  takenVoltooidPct: number;    // 0-100
  isUrgent: boolean;           // server-berekend: >72u stil OF <30% taken
  viaPartnerNaam: string | null;  // alleen voor 2e laag
};
```

### 7.2 Server-helper

`lib/team/partner-overview.ts`:

```typescript
export async function haalPartnerOverview(
  supabase: SupabaseClient,
  userId: string,
): Promise<PartnerOverviewResponse> {
  const { data, error } = await supabase.rpc('partner_overview_voor_sponsor', {
    p_sponsor_id: userId,
  });
  // ... transformatie naar PartnerOverviewResponse + isUrgent-berekening
}
```

### 7.3 Aanpassingen in dag-flow

`lib/playbook/tempo-aware.ts` + `lib/playbook/weekritme.ts`:

In ELKE bestaande `bouwDag*VandaagDoen`-functie wordt een NIEUWE optionele stap toegevoegd ná de sponsor-checkin/-call:

```typescript
{
  id: `dag${dagNummer}-partner-check`,
  label: "🤝 Check je nieuwe partner(s) vandaag",
  uitleg: PARTNER_CHECK_UITLEG,
  verplicht: false,
  inlineEmbed: "partner-check",
}
```

`PARTNER_CHECK_UITLEG` als nieuwe constant in tempo-aware.ts (gedeelde tekst, zoals `STORIES_UITLEG` en `FOLLOWUP_UITLEG_NA_DAG6`).

De stap wordt door `PartnerCheckEmbed` client-side ZELF onzichtbaar als de fetch geen partners returnt — zo voorkomen we dat we server-side moeten checken vóór array-bouw. Server-side kunnen we wel een feature-flag overwegen (later).

### 7.4 Type-uitbreidingen

`lib/playbook/types.ts`:

```typescript
inlineEmbed?:
  | "vcard-upload"
  | "sponsor-melding"
  | "namen-form"
  | "funnel-analyse"
  | "partner-check";   // <- nieuw
```

---

## 8. Bestand-overzicht (created + modified)

### Created

- `lib/team/partner-overview.ts` — server-fetch-helper
- `components/vandaag/inline-embeds/PartnerCheckEmbed.tsx` — inline-embed
- `components/dashboard/EerstePartnerVieringTegel.tsx` — viering-tegel
- `app/api/team/partner-overview/route.ts` — REST-endpoint
- `lib/supabase/migrations/partner_mijlpalen.sql` — DB-migratie

### Modified

- `lib/playbook/types.ts` — `inlineEmbed`-union uitbreiden met `"partner-check"`
- `lib/playbook/tempo-aware.ts` — `PARTNER_CHECK_UITLEG`-constant + extra stap in elke `bouwDag*VandaagDoen`
- `lib/playbook/weekritme.ts` — extra stap in `genereerWeekritmeDag`
- `app/vandaag/vandaag-flow.tsx` — render `PartnerCheckEmbed` op `inlineEmbed === "partner-check"`
- `app/dashboard/page.tsx` — render `EerstePartnerVieringTegel` als querystring `?vier=eerste-partner` aanwezig OF mijlpaal recent gevierd
- `lib/playbook/dagen.ts` — fallback-vandaagDoen (alleen wanneer geen tempo gekozen): zelfde partner-check-stap toevoegen

### Geen wijziging

- `profiles`-tabel — `sponsor_id` bestaat al, geen kolom-toevoegingen nodig
- `last_seen_at` / `presence_zichtbaar` — bestaande infrastructuur hergebruiken
- `dag_voltooiingen` — bestaande tabel, alleen `bereken_taken_voltooid_pct` is nieuwe DB-functie

---

## 9. Error handling & edge cases

### 9.1 Geen partners

`PartnerCheckEmbed` rendert `null` (helemaal niets) als de fetch een lege array returnt. De parent-tile in `/vandaag` toont dan de stap als "klaar" (geen content om af te vinken). Of: client-side automatisch overslaan zodat de member niet eens een lege stap ziet.

Beslissing: client-side stap-onzichtbaar maken als geen partners. Member ziet geen ruis.

### 9.2 Partner zonder telefoonnummer

WhatsApp-knop wordt vervangen door grijze niet-klikbare info-tekst "📞 Anne heeft geen telefoonnummer ingesteld". Sponsor kan via Mentor of email contacteren — maar deze inline-embed geeft daar geen knop voor (consistent met "geen AI-tussenkomst"-principe).

### 9.3 Partner met `presence_zichtbaar = false`

`laatstGezienUren = null`. UI toont "Laatste activiteit niet gedeeld" in plaats van "X uur geleden". Geen urgentie-check op deze velden — sponsor weet niet of partner stil is, dus geen ⚠️-flag.

### 9.4 Eerste-partner-mijlpaal al gevierd maar partner is verwijderd

`partner_mijlpalen.partner_id` heeft `ON DELETE SET NULL`, dus mijlpaal blijft staan ook als de oorspronkelijke partner is verwijderd. De viering is gevierd, geen herhaling.

### 9.5 Founder testing met `?dag=N`

Founders die via TesterToolbar `?dag=N` opvragen, krijgen de partner-stap ook te zien als ze partners hebben. Geen speciale founder-bypass nodig.

---

## 10. Out-of-scope (parkeerlijst)

Bewust niet in deze ronde:

- **Realtime detectie** via Supabase Realtime subscription. MVP gebruikt fetch bij paginabezoek.
- **Opt-in privacy-toggle per partner.** Default: geaggregeerd. Eventuele granulariteit later.
- **3e+ laag downline-overview.** Alleen directe + 2e laag in dit ontwerp.
- **Teamleider-dashboard** met meerdere downline-bomen tegelijk. Leiders krijgen voor nu dezelfde inline-embed als members.
- **Push-notificatie wanneer partner een mijlpaal heeft** (zoals "partner heeft week 1 voltooid"). Toekomstige feature.
- **Geautomatiseerde reminders** wanneer sponsor zelf te lang stil is naar zijn partners. Eerst kijken of de daginline-embed voldoende is.
- **2e-partner / 5e-partner / 10e-partner mijlpalen.** Voor nu alleen "eerste-partner". Latere uitbreidingen via dezelfde `partner_mijlpalen`-tabel mogelijk.
- **Geen AI-tussenkomst in de team-flow.** Geen Mentor-knoppen, geen voorgekauwde berichten. Bewuste principe-keuze.

---

## 11. Testing & verificatie

Geen test-framework in codebase. Verificatie via:

1. **`npm run build`** — TypeScript-check, route-generatie
2. **DB-migratie test** — `partner_mijlpalen`-tabel + `partner_overview_voor_sponsor`-functie aanmaken op test-DB
3. **Smoke-test op live:**
   - Maak op productie een test-account aan dat `sponsor_id = raoul.id` heeft
   - Open Raoul's `/vandaag` — verifieer dat "🤝 Check je partners"-stap verschijnt
   - Klik op de stap — verifieer dat test-account in overzicht staat met signalen
   - Klik WhatsApp-knop — verifieer dat `wa.me`-link opent ZONDER `?text=...`
   - Open `/dashboard?vier=eerste-partner` — verifieer dat speciale tegel verschijnt
   - Probeer Raoul's account `/vandaag` zonder partners (verwijder test-account `sponsor_id`-koppeling) — verifieer dat stap niet meer zichtbaar is

---

## 12. Volgorde van implementatie

1. **DB-migratie** — `partner_mijlpalen`-tabel + `partner_overview_voor_sponsor` + `bereken_taken_voltooid_pct` PostgreSQL-functies
2. **API-route** — `app/api/team/partner-overview/route.ts` + server-helper `lib/team/partner-overview.ts`
3. **Type-uitbreiding** — `lib/playbook/types.ts` `inlineEmbed`-union met `"partner-check"`
4. **`PartnerCheckEmbed`-component** + `PARTNER_CHECK_UITLEG`-constant
5. **Inline-embed-aanhaking** in `app/vandaag/vandaag-flow.tsx`
6. **Stappen toevoegen** in `lib/playbook/tempo-aware.ts` + `lib/playbook/weekritme.ts` + `lib/playbook/dagen.ts` (fallback)
7. **Eerste-partner-viering**: server-side mijlpaal-detectie in `app/vandaag/page.tsx` (en `/dashboard`) + push-trigger + `EerstePartnerVieringTegel`
8. **Build + commit + push**
9. **Smoke-test op live** met test-account

---

*Bron: brainstorm-sessie 2026-05-14, Raoul + Claude. Principe-basis: geen AI-tussenkomst in team-flow voor authenticiteit-behoud.*
