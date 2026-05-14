# Radar-balk in /vandaag — design

**Datum:** 2026-05-14
**Status:** ontwerp goedgekeurd door Raoul, klaar voor implementatie-plan
**Spec-versie:** v1

## 1. Achtergrond

ELEVA heeft een slimme **"Volgende beste actie"-radar** (`lib/radar/volgende-beste-actie.ts`, `components/radar/VolgendeBesteActie.tsx`). Die radar:

- Pakt top-5 prospects waar vandaag het meeste momentum zit
- Scoort op pipeline-fase + recente signalen (film afgekeken, productadvies-test ingevuld, openstaande herinnering) + stilte-tijd
- Toont per prospect naam, reden(en), klik-door naar prospect-kaart of Mentor
- Verbergt zich automatisch als er niks urgents is

**Het probleem:** de radar leeft alleen op `/dashboard` als losse tegel. Een member die in `/vandaag` z'n daily playbook doorloopt moet apart terug naar dashboard om die 5 prospects te zien. Dat breekt de focus en zorgt dat de radar onderbenut blijft.

**Wat we niet doen:** de radar IN de stap-volgorde dwingen (als A/B/C/D/E-stap). Reden: een radar-prospect zit soms in een pipeline-fase boven het kennis-niveau van die dag — bijv. dag 4-member krijgt prospect in `followup`-fase, terwijl Feel-Felt-Found pas op dag 5 wordt geleerd. Tegelijk: de radar is BREDER dan follow-ups (`uitgenodigd` / `one_pager` / `presentatie` / `shopper` zitten er ook in). Een vaste plek in de stap-volgorde klopt inhoudelijk niet.

## 2. Architectuur — De Radar-balk

De radar wordt een **persistent, klikbare balk** bovenaan `/vandaag`, los van de stap-volgorde. Member kiest zelf wanneer 'ie de balk opent.

### 2.1 Plek in de pagina

```
┌────────────────────────────────────────────────┐
│ [TesterToolbar / dag-wissel] (founder-only)     │
│ [Founder-toggle bar] (founder-only)             │
│ [🎯 RADAR-BALK]   ← nieuw                       │
│ [Stap 1: namen toevoegen]                       │
│ [Stap 2: eerste berichten]                      │
│ [...]                                           │
└────────────────────────────────────────────────┘
```

Niet sticky — staat gewoon bovenaan de content. Sticky voelt visueel zwaar en concurreert met de stap-flow.

### 2.2 Visueel gedrag

**Ingeklapt (default, één regel):**
```
🎯 3 actie-prospects voor je vandaag  →
```
Subtiele gouden pulsatie-glow zolang er minstens 1 niet-opgepakt item is. Verdwijnt als alle items afgevinkt zijn — balk wordt grijs/rustig:
```
✓ Vandaag alle 3 acties opgepakt
```

**Uitgeklapt:** lijst met radar-items. Per item:

- Avatar (initialen-cirkel via `AvatarFoto`)
- Naam + pipeline-fase-label (bv. "follow-up" of "presentatie")
- Een of twee redenen (`item.redenen`): `"Film afgekeken 2d geleden · 12 dagen stil"`
- Knoppen: **💬 WhatsApp** (als telefoon bekend) en **→ Prospect-kaart**
- **Afvink-knop per item: ✓ Vandaag opgepakt**
- Bij fase-boven-kennis-niveau (zie §3): amber rand + "Voor deze fase leer je in dag X de techniek. Voor nu: open de Mentor →"
- Afgevinkte items blijven zichtbaar in de uitklap met grijze ✓-status (geeft eigen voortgang weer)

### 2.3 Sluiten / heropenen

Klik op de balk = toggle. State (open/dicht) niet persistent in DB — gewoon lokale React-state.

## 3. Kennis-grens-markering

Algoritme bepaalt voor elk radar-item of de pipeline-fase boven het kennis-niveau van de huidige dag zit.

**Kennis-niveau-tabel:**

| Dag | Bekende fases | Boven-kennis fases |
|---|---|---|
| 1-4 | `prospect`, `in_gesprek` | `uitgenodigd`, `one_pager`, `followup`, `presentatie` |
| 5 | + `uitgenodigd` | `one_pager`, `followup`, `presentatie` |
| 6 | + `one_pager`, `followup` | `presentatie` |
| 7-9 | + `presentatie` | — |
| 10+ | alles | — |

Bovenstaande tabel staat in code, niet in DB (founder past 'm aan via code-edit, geen CMS-veld nodig).

**UI bij boven-kennis:**

- Amber rand om het radar-item
- Korte zin onder de redenen: *"Voor deze fase leer je in dag {X} de techniek."*
- Extra knop: **Open Mentor →** (auto-prefilled met "Help me met X (fase {fase}, dag {huidigeDag}).")

Géén suppression — member ZIET het item, krijgt context dat hij 'm nog niet zelfstandig kan, krijgt de Mentor-knop als hulplijn. Trigger om te leren, geen blokkade.

## 4. Per-prospect afvinken + carry-over

### 4.1 Afvinken-actie

Knop **✓ Vandaag opgepakt** per radar-item slaat op in nieuwe tabel `radar_voltooiingen`:

```sql
CREATE TABLE radar_voltooiingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  datum DATE NOT NULL DEFAULT CURRENT_DATE,
  voltooid_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, prospect_id, datum)
);
```

RLS: alleen eigen rijen lezen / schrijven.

### 4.2 Carry-over volgende dag

Bij het aanroepen van `pakTopRadar(items, 5)` wordt nu meegegeven welke prospects GISTEREN wel in de radar zaten maar NIET zijn afgevinkt. Die krijgen een **scoring-bump van +25 punten** zodat ze grote kans hebben om vandaag bovenaan te staan.

UI: zo'n item krijgt een 🔄-badge naast de naam: *"nog van gisteren"*. Dat trekt aandacht.

### 4.3 "Vandaag al afgevinkt" filter

Items die VANDAAG al zijn afgevinkt (rij in `radar_voltooiingen` met `datum = CURRENT_DATE`) tellen niet mee in de teller op de balk-koptekst — maar staan WEL in de uitklap met grijze ✓-status. Member ziet eigen voortgang.

## 5. Data + API

### 5.1 Server-side fetch in /vandaag

In `app/vandaag/page.tsx` voegen we toe:

- Query `radar_voltooiingen` voor `user_id = current` en `datum IN (CURRENT_DATE, CURRENT_DATE - 1)`. Eén round-trip.
- Set vandaag-afgevinkt-IDs (filter mee in render)
- Set gisteren-niet-afgevinkt-IDs (geef door als bump-input aan `pakTopRadar`)

### 5.2 API-endpoint voor afvinken

Nieuwe route `POST /api/radar/afvinken` met body `{ prospectId: string }`. Server schrijft rij in `radar_voltooiingen` met `datum = CURRENT_DATE`. Bij conflict (al afgevinkt vandaag): no-op.

Client-side, na afvink-klik: optimistic update + POST. Bij fout: rollback + toast.

### 5.3 Scoring-aanpassing

`pakTopRadar(items, 5, opts?)` krijgt optionele 3e parameter:
```typescript
opts?: {
  bumpIds?: Set<string>; // prospect-IDs die gisteren niet afgevinkt waren
}
```

Bij scoring: als `prospect.id ∈ bumpIds` → score += 25.

## 6. Dashboard-veranderingen

De huidige `VolgendeBesteActie`-tegel op dashboard verdwijnt. Vervangen door compacte teaser:

```
🎯 Je hebt 3 nog niet opgepakte acties van vandaag  →
```

Klik = link naar `/vandaag` (waar de volle balk zit). Verbergt zich als er 0 open items zijn.

## 7. Bestand-overzicht

**Nieuwe bestanden:**
- `lib/supabase/migrations/radar_voltooiingen.sql`
- `lib/radar/carry-over.ts` (helper voor gisteren-niet-afgevinkt logica)
- `lib/radar/kennis-niveau.ts` (lookup-tabel + helper `fasenBovenKennisNiveau(dagNummer)`)
- `app/api/radar/afvinken/route.ts`
- `components/vandaag/RadarBalk.tsx` (sticky-banner-component op /vandaag)
- `components/dashboard/RadarTeaser.tsx` (compacte vervanger op dashboard)

**Aangepast:**
- `lib/radar/volgende-beste-actie.ts` (3e param `opts.bumpIds` toevoegen)
- `app/vandaag/page.tsx` (radar-data + afgevinkt-set ophalen + balk renderen)
- `app/dashboard/page.tsx` (volle tegel vervangen door RadarTeaser)

**Verwijderd:**
- Gebruik van `VolgendeBesteActie` op dashboard (de component zelf blijft staan, voor evt. hergebruik elders)

## 8. Out-of-scope (parkeerlijst)

- **Geen voortgang-tracker per radar-item over tijd** (bv. "deze prospect is 3 dagen niet opgepakt"). Eerst basis bouwen, daarna evt. uitbreiden.
- **Geen sponsor-tip-integratie in radar-items.** Sponsors zien NIET welke prospects op je radar staan — privacy-laag.
- **Geen radar voor Core / Pro-modus**. Eerst Sprint-pilot.
- **Geen per-radar-item commentaar / notities.** Houd 'm strak.
- **Geen radar in /dashboard?vier=eerste-partner viering**. Andere context.

## 9. Error handling

- **`radar_voltooiingen` insert faalt:** toast "Afvinken mislukt, probeer opnieuw". Optimistic update rollbackt.
- **`pakTopRadar` geeft lege lijst:** balk verdwijnt helemaal (return null).
- **Radar-fetch faalt op dashboard:** RadarTeaser verbergt zich (return null), geen foutmelding.
- **Prospect verwijderd na afvinken:** `ON DELETE CASCADE` op `prospect_id` ruimt rij stil op.

## 10. Testing & verificatie

Geen test-framework. Verificatie via:

1. `npm run build` na elke taak (lint + TypeScript)
2. Smoke-test op live productie:
   - Dag 1-member opent /vandaag → ziet balk (mits radar-items aanwezig) of niet (mits leeg)
   - Klik op balk → uitklappen werkt
   - Afvink een item → telt visueel weg, item grijst uit
   - Refresh pagina → afgevinkt-status blijft (DB-roundtrip werkt)
   - Volgende dag (kalender of via founder-toggle dag-wissel): niet-afgevinkt items van gisteren staan bovenaan met 🔄-badge
   - Boven-kennis-fase: amber rand + Mentor-knop verschijnt
   - Dashboard: teaser-regel toont aantal open items, klik leidt naar /vandaag

## 11. Implementatie-volgorde

1. **DB-migratie**: `radar_voltooiingen`-tabel + RLS-policies.
2. **Helpers**: `lib/radar/kennis-niveau.ts` + `lib/radar/carry-over.ts`.
3. **Scoring-engine**: `pakTopRadar` uitbreiden met `bumpIds`-opt.
4. **API-route**: `POST /api/radar/afvinken`.
5. **`RadarBalk`-component**: ingeklapt + uitgeklapt + afvink-handler.
6. **`/vandaag` aanhaking**: data ophalen + balk renderen.
7. **Dashboard-vervanging**: `RadarTeaser`-component + volle tegel vervangen.
8. **Build + push + smoke-test**.

Geen aparte test-taak — verificatie verwerkt in taak 8.

---

## Beslissingen die zijn gemaakt tijdens brainstorm

- **Plek**: bovenaan /vandaag als ingeklapte balk (geen sticky), niet als stap in volgorde — Raoul, 2026-05-14
- **Afvinken**: per-prospect (niet één-knop-hele-stap) — Raoul
- **Carry-over**: niet-afgevinkte items rollen door naar morgen met +25 score-bump + 🔄-badge — Raoul
- **Kennis-grens**: toon altijd alle items, maar markeer met amber + Mentor-knop wanneer boven-kennis — Raoul
- **Pulsatie**: continu zolang er minstens 1 open item is (niet alleen bij hoge score) — voorgesteld, akkoord Raoul
- **Afgevinkte items**: blijven zichtbaar in uitklap met grijze ✓ — voorgesteld, akkoord Raoul
- **Dashboard**: volle tegel vervangen door compacte teaser-regel — Raoul

Geen open punten meer voor implementatie.
