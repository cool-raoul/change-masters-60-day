# Onboarding-redesign fase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gedeelde pre-day-1 voor Sprint+Core, admin-rail los van dag-flow met pop-up, per-modus dag-teller met her-activatie-keuze, cross-modus skip op alle eenmalige items, en founder-bewerkbaarheid van alle nieuwe content.

**Architecture:** Drie lagen bovenop bestaande infrastructuur. Laag A breidt `/onboarding` uit van Sprint-only naar Sprint+Core (4 stappen, stap 4 modus-bewust). Laag B is een nieuwe pagina `/setup` met 5 admin-items + niet-blokkerende pop-up op `/vandaag`. Laag C breidt de bestaande `onboarding_voltooiingen` tabel uit met nieuwe `item_slug`-sleutels + voegt twee modus-specifieke startdatum-kolommen toe op `profiles` voor per-modus dag-tellers.

**Tech Stack:** Next.js 15 App Router · TypeScript · Supabase (PostgreSQL + RLS) · bestaande `EditableTekst`/`EditModeToggle` voor founder-bewerkbaarheid · bestaande `lib/onboarding/voltooiingen.ts` helpers · bestaande `lib/dtt/*` helpers voor DTT-bracket-mapping · `npm run build` als verificatie (geen test-framework).

**Pilot-context:** main-branch, geen feature-branch, smoke-test op live via Raoul's testaccount aan het eind.

**Spec:** [docs/superpowers/specs/2026-05-18-onboarding-redesign-fase-2-design.md](../specs/2026-05-18-onboarding-redesign-fase-2-design.md)

---

## File-overzicht

**Nieuwe bestanden:**

| Bestand | Verantwoordelijkheid |
|---|---|
| `lib/supabase/migrations/sprint_core_startdatum.sql` | Twee DATE-kolommen `sprint_startdatum` + `core_startdatum` op `profiles`, backfill van `run_startdatum` voor bestaande Sprint-leden. |
| `lib/onboarding/sleutels.ts` | Centrale typed `ITEM_SLUGS` constants (12 sleutels) zodat namespaces nergens als losse strings rondzwerven. |
| `lib/playbook/dag-teller.ts` | `dagVoorModus(profile, modus)` helper die het juiste startdatum-veld leest en het dag-nummer berekent. |
| `lib/setup/admin-items.ts` | `ADMIN_ITEMS` array met de 5 admin-items (slug, label, uitleg, optionele actie-route). Eén bron van waarheid. |
| `components/onboarding/Stap4ModusKeuze.tsx` | Modus-bewuste pre-day-1-stap die tempo-cards (Sprint) of `DTTOnboardingEmbed` (Core) rendert + modus-eigen uitleg-blok daarboven. |
| `components/onboarding/AlGedaanLabel.tsx` | Klein groen label "Al gedaan tijdens [Sprint/Core] op [datum]" met "Bekijk opnieuw"-link. Voor stap 1-3 die cross-modus al voltooid zijn. |
| `components/setup/AdminChecklist.tsx` | Lijst-component die `ADMIN_ITEMS` rendert met status uit `onboarding_voltooiingen`. Per item: titel, uitleg, vink-knop, eventueel actie-route. |
| `components/setup/SetupPopup.tsx` | Niet-blokkerende dialog op `/vandaag` zolang admin-rail open is. Toont aantal openstaande items, 3-dagen-advies, twee knoppen (open / later). LocalStorage voor 1×/dag. |
| `components/vandaag/ModusSwitchBanner.tsx` | Banner die verschijnt direct na een modus-switch zolang de modus-specifieke keuze (tempo of DTT) nog niet ingevuld is voor de nieuwe modus. |
| `app/setup/page.tsx` | Admin-rail pagina (server-component, leest voltooiingen + rendert `AdminChecklist`). |
| `app/setup/layout.tsx` | Standaard `AppShell` zoals andere ingelogde pagina's. |
| `app/api/setup/markeer/route.ts` | POST endpoint om een admin-item af te vinken (schrijft naar `onboarding_voltooiingen`). |
| `app/api/modus/her-activatie-keuze/route.ts` | POST `{modus, keuze: "opnieuw" \| "oppakken"}` voor het her-activatie-banner. Reset of behoudt het modus-specifieke startdatum-veld. |

**Te wijzigen bestanden:**

| Bestand | Wijziging |
|---|---|
| `app/onboarding/page.tsx` | Modus uit `profiles.modus` lezen, stap 3 vervangen door "Eerste 5 namen", stap 4 vervangen door `<Stap4ModusKeuze>`. Cross-modus skip-detectie voor stap 1-3 via `AlGedaanLabel`. |
| `app/welkom-core/page.tsx` | Redirect wijzigen van `→ /vandaag` naar `→ /onboarding`. |
| `app/vandaag/page.tsx` | Dag-teller gebruikt nieuwe `dagVoorModus()` ipv `run_startdatum` direct, integratie `<SetupPopup>` en `<ModusSwitchBanner>`. |
| `lib/playbook/dagen.ts` | Sprint dag 1: `dag1-5-namen` verwijderen. Sprint dag 2: `dag2-webshop` + `dag2-krediet` verwijderen. `dag1-vcard` en `dag1-sponsor` blijven maar krijgen via /vandaag-page een skip-check. |
| `lib/playbook/core-dagen.ts` | Core dag 1: `core-dag1-why` + `core-dag1-dtt` verwijderen, `core-dag1-vcard-import` + `core-dag1-sponsor-bericht` toevoegen, `watJeLeert` herschrijven in Be-The-Change stem. Core dag 3: 3 admin-taken verwijderen. Core dag 4: 2 admin-taken verwijderen, commission-plan-content blijft. |
| `lib/playbook/types.ts` | Geen wijziging nodig (Modus al gedefinieerd in `lib/onboarding/voltooiingen.ts`). |

---

### Task 1: Database-migratie voor per-modus startdatum

**Files:**
- Create: `lib/supabase/migrations/sprint_core_startdatum.sql`

- [ ] **Step 1: Schrijf de migration**

Bestand: `lib/supabase/migrations/sprint_core_startdatum.sql`

```sql
-- ============================================================
-- Per-modus startdatum voor dag-teller na modus-switch.
--
-- Voor de redesign van 2026-05-18: iemand die switcht van Core
-- naar Sprint (of andersom) krijgt z'n eigen dag-teller per modus.
-- Bij switch terug naar een eerder gebruikte modus krijgt 'ie een
-- keuze (oppakken vs opnieuw) waarbij dit datum-veld als anker dient.
--
-- run_startdatum (legacy) blijft staan voor backwards-compat.
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sprint_startdatum DATE NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_startdatum DATE NULL;

-- Backfill: bestaande Sprint-leden krijgen hun huidige run_startdatum
-- gekopieerd naar sprint_startdatum, zodat hun dag-teller doorrolt.
UPDATE profiles
SET sprint_startdatum = run_startdatum
WHERE modus = 'sprint' AND sprint_startdatum IS NULL AND run_startdatum IS NOT NULL;

-- Backfill: bestaande Core-leden (er zijn er nu nog niet veel) krijgen
-- hun huidige run_startdatum gekopieerd naar core_startdatum.
UPDATE profiles
SET core_startdatum = run_startdatum
WHERE modus = 'core' AND core_startdatum IS NULL AND run_startdatum IS NOT NULL;

COMMENT ON COLUMN profiles.sprint_startdatum IS 'Sprint-modus startdatum, NULL als modus nooit actief is geweest. Gezet bij eerste activatie of bij keuze "opnieuw beginnen" na her-activatie.';
COMMENT ON COLUMN profiles.core_startdatum IS 'Core-modus startdatum, NULL als modus nooit actief is geweest. Idem als sprint_startdatum maar voor Core.';
```

- [ ] **Step 2: Voer migration uit op live DB**

Run: `node scripts/sql.mjs "$(cat lib/supabase/migrations/sprint_core_startdatum.sql)"`

Expected: `OK · N rij(en) geraakt` (waarbij N = aantal bestaande Sprint+Core profielen waarvan run_startdatum is gebackfilled).

- [ ] **Step 3: Verifieer kolommen bestaan**

Run: `node scripts/sql.mjs "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('sprint_startdatum','core_startdatum','run_startdatum') ORDER BY column_name;"`

Expected: 3 rijen, alle 3 met `data_type = 'date'`.

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: build slaagt (deze stap raakt alleen DB, geen TypeScript, maar we draaien 'm zodat task-1-commit een schone basis is).

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/migrations/sprint_core_startdatum.sql
git commit -m "feat(db): sprint_startdatum + core_startdatum kolommen op profiles

Voor per-modus dag-teller bij modus-switch. Backfill bestaande
modus-leden vanuit run_startdatum, dat blijft als legacy-veld.

Onderdeel van onboarding-redesign fase 2 (zie docs/superpowers/specs/
2026-05-18-onboarding-redesign-fase-2-design.md)."
```

---

### Task 2: Helpers (sleutels, dag-teller, admin-items)

**Files:**
- Create: `lib/onboarding/sleutels.ts`
- Create: `lib/playbook/dag-teller.ts`
- Create: `lib/setup/admin-items.ts`

- [ ] **Step 1: Schrijf sleutels.ts**

Bestand: `lib/onboarding/sleutels.ts`

```typescript
// ============================================================
// Centrale typed sleutels voor onboarding_voltooiingen.item_slug.
// Een wijziging hier raakt alle modi tegelijk.
// ============================================================

export const ITEM_SLUGS = {
  // Pre-day-1 stap 1: welkom + app + push
  appGeinstalleerd: "app-geinstalleerd",
  pushAan: "push-aan",
  // Pre-day-1 stap 2: WHY
  why: "why",
  // Pre-day-1 stap 3: eerste 5 namen
  eersteVijfNamen: "eerste-5-namen",
  vcardImport: "vcard-import-gedaan",
  sponsorEersteBericht: "sponsor-eerste-bericht",
  // Pre-day-1 stap 4: modus-keuze (modus-specifiek)
  modusKeuzeTempo: "modus-keuze-tempo",
  modusKeuzeDtt: "modus-keuze-dtt",
  // Admin-rail
  webshopAangemaakt: "webshop-aangemaakt",
  kredietformulierIngevuld: "kredietformulier-ingevuld",
  teamsAdminIngericht: "teams-admin-ingericht",
  bestellinksGekoppeld: "bestellinks-gekoppeld",
  productadviesTestGedaan: "productadvies-test-gedaan",
} as const;

export type ItemSlug = typeof ITEM_SLUGS[keyof typeof ITEM_SLUGS];
```

- [ ] **Step 2: Schrijf dag-teller.ts**

Bestand: `lib/playbook/dag-teller.ts`

```typescript
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// Per-modus dag-teller. Leest het modus-specifieke startdatum-veld
// uit profiles en berekent het dag-nummer. Geen startdatum = dag 1.
// ============================================================

type ProfielDateVelden = {
  sprint_startdatum: string | null;
  core_startdatum: string | null;
  run_startdatum: string | null; // legacy, fallback
  created_at: string | null;
};

export function startdatumVoorModus(
  profiel: ProfielDateVelden,
  modus: Modus,
): Date | null {
  if (modus === "sprint") {
    return parseDatum(profiel.sprint_startdatum) ?? parseDatum(profiel.run_startdatum);
  }
  if (modus === "core") {
    return parseDatum(profiel.core_startdatum) ?? parseDatum(profiel.run_startdatum);
  }
  // Pro: geen aparte per-modus startdatum, fallback op run_startdatum/created_at
  return parseDatum(profiel.run_startdatum) ?? parseDatum(profiel.created_at);
}

export function dagVoorModus(profiel: ProfielDateVelden, modus: Modus): number {
  const start = startdatumVoorModus(profiel, modus);
  if (!start) return 1;
  const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function parseDatum(v: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
```

- [ ] **Step 3: Schrijf admin-items.ts**

Bestand: `lib/setup/admin-items.ts`

```typescript
import { ITEM_SLUGS, type ItemSlug } from "@/lib/onboarding/sleutels";

// ============================================================
// Vijf admin-items voor /setup. Eén bron van waarheid: deze lijst
// wordt gerenderd op /setup en gecontroleerd vanuit /vandaag voor
// de SetupPopup. Volgorde is de aanbevolen volgorde voor de member.
// ============================================================

export type AdminItem = {
  slug: ItemSlug;
  emoji: string;
  titel: string;
  uitleg: string;
  // Optionele route. Als gezet, knop "Open uitleg" linkt hierheen.
  // Veel admin-stappen zijn buiten ELEVA (Lifeplus-backoffice), dus
  // dan is route null en geeft de uitleg-tekst zelf de instructie.
  route: string | null;
};

export const ADMIN_ITEMS: AdminItem[] = [
  {
    slug: ITEM_SLUGS.webshopAangemaakt,
    emoji: "🛒",
    titel: "Webshop aanmaken",
    uitleg:
      "Maak je eigen Lifeplus-webshop aan via de officiële backoffice. Vraag je sponsor om de hand-out of korte instructiefilm. Eenmalige stap, hierna is je shop online en kun je hem delen.",
    route: null,
  },
  {
    slug: ITEM_SLUGS.kredietformulierIngevuld,
    emoji: "✅",
    titel: "Kredietformulier invullen",
    uitleg:
      "Zonder dit formulier kunnen je commissies niet worden uitbetaald. Vul 'm in via de Lifeplus-backoffice. Korte stap van een paar minuten.",
    route: null,
  },
  {
    slug: ITEM_SLUGS.teamsAdminIngericht,
    emoji: "📋",
    titel: "Teams-administratie inrichten",
    uitleg:
      "Hier wordt je team-structuur en business-data bijgehouden. Volg de korte instructie uit de team-onboarding van je sponsor.",
    route: null,
  },
  {
    slug: ITEM_SLUGS.bestellinksGekoppeld,
    emoji: "🔗",
    titel: "Bestellinks koppelen",
    uitleg:
      "Plak je eigen Lifeplus-bestellinks per pakket in ELEVA. Hierna gebruikt het systeem ze automatisch in productadvies-flows.",
    route: "/instellingen/bestellinks",
  },
  {
    slug: ITEM_SLUGS.productadviesTestGedaan,
    emoji: "🧪",
    titel: "Productadvies-test zelf doen",
    uitleg:
      "Doe de test één keer zelf, zo weet je wat een prospect ervaart en welk advies eruit kan komen. Drie minuten.",
    route: "/test-pakket-bouwer",
  },
];
```

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: build slaagt, geen TS-errors.

- [ ] **Step 5: Commit**

```bash
git add lib/onboarding/sleutels.ts lib/playbook/dag-teller.ts lib/setup/admin-items.ts
git commit -m "feat(onboarding): sleutels-constants + dag-teller-helper + admin-items-bron

Drie kleine helpers als fundament voor de onboarding-redesign:
- ITEM_SLUGS centraal getypeerd (12 sleutels)
- dagVoorModus(profile, modus) leest modus-specifieke startdatum
- ADMIN_ITEMS lijst (5 items) voor /setup en SetupPopup"
```

---

### Task 3: AlGedaanLabel + Stap4ModusKeuze componenten

**Files:**
- Create: `components/onboarding/AlGedaanLabel.tsx`
- Create: `components/onboarding/Stap4ModusKeuze.tsx`

- [ ] **Step 1: Schrijf AlGedaanLabel.tsx**

Bestand: `components/onboarding/AlGedaanLabel.tsx`

```tsx
"use client";

import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// Klein groen label dat verschijnt bij een pre-day-1-stap die al
// cross-modus is afgevinkt. Member kan 'm alsnog bekijken/aanpassen
// via de bekijkRoute, maar hoeft niets opnieuw.
// ============================================================

type Props = {
  modus: Modus;
  datum: string | null;
  bekijkRoute?: string;
};

function modusLabel(m: Modus): string {
  if (m === "sprint") return "Sprint";
  if (m === "core") return "Core";
  return "Pro";
}

function datumKort(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export function AlGedaanLabel({ modus, datum, bekijkRoute }: Props) {
  const datumTekst = datumKort(datum);
  return (
    <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Al gedaan tijdens {modusLabel(modus)}
          {datumTekst ? ` (${datumTekst})` : ""}
        </p>
        <p className="text-cm-white text-xs opacity-70 mt-0.5">
          Je hoeft 'm niet opnieuw te doen. Bekijken of bijschaven mag wel.
        </p>
      </div>
      {bekijkRoute && (
        <a
          href={bekijkRoute}
          className="text-xs bg-cm-surface border border-cm-border text-cm-white px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          Bekijk opnieuw
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Schrijf Stap4ModusKeuze.tsx**

Bestand: `components/onboarding/Stap4ModusKeuze.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DTTOnboardingEmbed } from "@/components/onboarding/DTTOnboardingEmbed";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import {
  type CommitmentUren,
  berekenDagdoelen,
  bouwblokkenVoorTempo,
  tempoNaam,
} from "@/lib/dagdoelen";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// Pre-day-1 stap 4: modus-bewuste keuze + uitleg.
//
// Sprint: uitleg "60-dagen-run in 3 blokken" + tempo-cards 2/4/6 uur
// Core:   uitleg "40-dagen-opstart + lifetime DMO" + DTT-form embed
//
// Beide schrijven bij voltooiing naar profiles (commitment_uren of
// core_dtt) en navigeren naar /vandaag.
// ============================================================

type Props = {
  modus: Modus;
  isPreview: boolean;
  isFounder: boolean;
  overrides: Record<string, string>;
  dttAlIngevuld: boolean;
};

export function Stap4ModusKeuze({
  modus,
  isPreview,
  isFounder,
  overrides,
  dttAlIngevuld,
}: Props) {
  if (modus === "core") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🎯</div>
          <EditableTekst
            namespace="onboarding"
            sleutel="stap4.core.titel"
            standaard="Jouw Doel-Tijd-Termijn"
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-2xl font-display font-bold text-cm-white mb-2"
          />
          <EditableBlok
            namespace="onboarding"
            sleutel="stap4.core.uitleg"
            standaard={
              "Drie korte vragen. Hoeveel inkomen wil je over een jaar, hoeveel tijd kan je realistisch investeren, en in hoeveel maanden moet het er staan om de moeite waard te zijn. Op basis hiervan krijg je je dagelijkse aantallen op maat en zie je welke rank je nastreeft. Geen vast schema, wel een richtlijn die past bij jouw leven."
            }
            overrides={overrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white text-sm opacity-80 leading-relaxed"
            rows={4}
          />
        </div>
        <DTTOnboardingEmbed
          alVoltooid={dttAlIngevuld}
          opVoltooid={() => {
            // Na opslaan navigeert DTTOnboardingEmbed zelf naar /vandaag
          }}
        />
        <EditableBlok
          namespace="onboarding"
          sleutel="stap4.core.aanpasbaar"
          standaard="Aanpassen kan altijd via Instellingen. Je begint rustig, schroef op zodra je merkt dat er ruimte is."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-xs opacity-60 italic text-center"
          rows={2}
        />
      </div>
    );
  }

  // Sprint
  return <SprintTempoBlock isPreview={isPreview} isFounder={isFounder} overrides={overrides} />;
}

function SprintTempoBlock({
  isPreview,
  isFounder,
  overrides,
}: {
  isPreview: boolean;
  isFounder: boolean;
  overrides: Record<string, string>;
}) {
  const [commitmentUren, setCommitmentUren] = useState<CommitmentUren | null>(null);
  const [bezig, setBezig] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function opslaan() {
    if (!commitmentUren) return;
    setBezig(true);
    if (!isPreview) {
      const dd = berekenDagdoelen(commitmentUren);
      await supabase.auth.updateUser({
        data: {
          onboarding_stap: 99,
          commitment_uren: commitmentUren,
          dagdoel_contacten: dd.contacten,
          dagdoel_uitnodigingen: dd.uitnodigingen,
          dagdoel_followups: dd.followups,
        },
      });
      await fetch("/api/onboarding/markeer-voltooid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "modus-keuze-tempo", modus: "sprint" }),
      }).catch(() => {});
    }
    setBezig(false);
    router.push("/vandaag?via=onboarding");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🎯</div>
        <EditableTekst
          namespace="onboarding"
          sleutel="stap4.sprint.titel"
          standaard="Kies jouw tempo voor 60 dagen"
          overrides={overrides}
          isFounder={isFounder}
          as="h2"
          className="text-2xl font-display font-bold text-cm-white mb-2"
        />
        <EditableBlok
          namespace="onboarding"
          sleutel="stap4.sprint.uitleg"
          standaard="Wees eerlijk met jezelf. Liever 2 uur volhouden dan 6 beloven en stoppen na tien dagen. Aanpassen kan altijd via Instellingen."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-80 leading-relaxed"
          rows={2}
        />
      </div>

      <div className="space-y-4">
        {([2, 4, 6] as const).map((uren) => {
          const dd = berekenDagdoelen(uren);
          const blokken = bouwblokkenVoorTempo(uren);
          const isGekozen = commitmentUren === uren;
          const emoji = uren === 2 ? "🌱" : uren === 4 ? "🔥" : "⚡";
          return (
            <button
              key={uren}
              type="button"
              onClick={() => setCommitmentUren(uren)}
              className={`w-full text-left rounded-xl border-2 transition-all p-5 ${
                isGekozen
                  ? "border-cm-gold bg-cm-gold/10"
                  : "border-cm-border bg-cm-surface hover:border-cm-gold/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cm-white/50">
                    ± {uren} uur per dag
                  </p>
                  <h3 className="text-xl font-display font-bold text-cm-white flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    {tempoNaam(uren)}
                  </h3>
                </div>
                {isGekozen && (
                  <span className="text-xs bg-cm-gold text-cm-on-gold font-bold px-3 py-1 rounded-full">
                    ✓ Gekozen
                  </span>
                )}
              </div>
              <EditableBlok
                namespace="onboarding"
                sleutel={`stap4.sprint.tempo${uren}.past_bij`}
                standaard={
                  uren === 2
                    ? "Je hebt een drukke baan, een gezin, of bouwt dit naast alles wat je al hebt. Liever rustig en consistent dan groot beginnen en stoppen."
                    : uren === 4
                      ? "Je hebt ruimte gemaakt. Je gezin weet dat dit jouw 60 dagen worden. Je wilt er serieus voor gaan zonder jezelf op te branden."
                      : "Je hebt geen ander werk, of je hebt deze 60 dagen echt vrijgemaakt. Je wilt er alles uithalen."
                }
                overrides={overrides}
                isFounder={isFounder}
                as="p"
                className="text-sm text-cm-white/85 leading-relaxed mb-3"
                rows={3}
              />
              <div className="bg-cm-surface-2 rounded-lg p-3 text-sm text-cm-white space-y-1">
                <span className="block">📲 {dd.contacten} nieuwe namen per dag</span>
                <span className="block">📨 {dd.uitnodigingen} uitnodigingen per dag</span>
              </div>
              {isGekozen && (
                <ul className="mt-3 space-y-1.5 text-xs text-cm-white/75">
                  {blokken.map((b) => (
                    <li key={b.naam} className="flex gap-2">
                      <span>{b.emoji}</span>
                      <span><strong>{b.naam}.</strong> {b.beschrijving}</span>
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={opslaan}
        disabled={bezig || !commitmentUren}
        className="btn-gold w-full py-4 text-lg font-bold disabled:opacity-40"
      >
        {bezig
          ? "Laden..."
          : commitmentUren
            ? "Te gek, door naar dag 1 →"
            : "Kies eerst je tempo hierboven"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build slaagt. Beide componenten correct.

- [ ] **Step 4: Commit**

```bash
git add components/onboarding/AlGedaanLabel.tsx components/onboarding/Stap4ModusKeuze.tsx
git commit -m "feat(onboarding): AlGedaanLabel + Stap4ModusKeuze componenten

AlGedaanLabel toont 'al gedaan tijdens [modus]' bij cross-modus
overgeslagen stappen. Stap4ModusKeuze rendert tempo-cards (Sprint)
of DTT-embed (Core) met EditableTekst-blokken voor founder."
```

---

### Task 4: Onboarding pagina uitbreiden naar Sprint + Core

**Files:**
- Modify: `app/onboarding/page.tsx`
- Modify: `app/welkom-core/page.tsx`

- [ ] **Step 1: Lees huidige `/onboarding/page.tsx`**

Run: `Read app/onboarding/page.tsx`. Bestaande structuur: 4 stappen, stap 1 = welkom+app, stap 2 = WHY, stap 3 = run-uitleg, stap 4 = tempo. We:
- Vervangen huidige stap 3 (run-uitleg) door **5 namen** met `inlineEmbed: "namen-form"`.
- Vervangen huidige stap 4 (tempo-cards rauw) door `<Stap4ModusKeuze>`.
- Modus laden uit `profiles.modus` bij mount.
- Voor stap 1-3: cross-modus skip checken via `/api/onboarding/markeer-voltooid` GET-variant (zie volgende step) en `<AlGedaanLabel>` tonen als al voltooid.

- [ ] **Step 2: Voeg GET-endpoint toe aan voltooiingen-API**

Bestand: `app/api/onboarding/markeer-voltooid/route.ts`

Voeg toe boven de bestaande `POST`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { haalAlleVoltooiingenVoorUser } from "@/lib/onboarding/voltooiingen";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ voltooiingen: {} }, { status: 401 });

  const map = await haalAlleVoltooiingenVoorUser(supabase, user.id);
  const obj: Record<string, { voltooid: boolean; modus: string | null; datum: string | null }> = {};
  map.forEach((v, k) => {
    obj[k] = v;
  });
  return NextResponse.json({ voltooiingen: obj });
}
```

(Check eerst of de file al een `import { NextResponse }` heeft, zo ja niet duplicate.)

- [ ] **Step 3: Update `app/onboarding/page.tsx` — modus laden + stap 3 wijzigen**

Pas in de `laadGegevens` functie aan (rond regel 84):

```typescript
async function laadGegevens() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { router.push("/login"); return; }
  setUserId(user.id);

  if (user?.user_metadata?.full_name) {
    setGebruikersnaam(user.user_metadata.full_name.split(" ")[0]);
  } else if (user?.email) {
    setGebruikersnaam(user.email.split("@")[0]);
  }

  // NIEUW: modus laden uit profiles
  const { data: prof } = await supabase
    .from("profiles")
    .select("modus, sponsor_id, core_dtt")
    .eq("id", user.id)
    .maybeSingle();
  const m = (prof as { modus?: string | null } | null)?.modus ?? "sprint";
  setModus(m === "core" ? "core" : "sprint");
  setDttAlIngevuld(!!(prof as { core_dtt?: unknown } | null)?.core_dtt);

  // Sponsor info, ongewijzigd
  const sponsorId = (prof as { sponsor_id?: string } | null)?.sponsor_id;
  if (sponsorId) {
    const { data: sponsor } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", sponsorId)
      .maybeSingle();
    if (sponsor) {
      const s = sponsor as { full_name: string };
      setSponsorNaam(s.full_name);
      setSponsorWaLink(`https://wa.me/?text=Hoi%20${encodeURIComponent(s.full_name)}%2C%20ik%20heb%20een%20vraag%20over%20de%20setup`);
    }
  }

  // NIEUW: cross-modus voltooiingen laden
  const r = await fetch("/api/onboarding/markeer-voltooid").then((r) => r.json()).catch(() => ({ voltooiingen: {} }));
  setVoltooiingen(r.voltooiingen || {});

  const huidigStap = Number(user?.user_metadata?.onboarding_stap || 1);
  if (huidigStap >= 99 && !preview && directeStap === null) {
    router.push("/vandaag");
    return;
  }
  setStap(directeStap ?? (preview ? 1 : huidigStap));

  setLaden(false);
}
```

En voeg state-declaraties bovenaan toe:

```typescript
const [modus, setModus] = useState<"sprint" | "core">("sprint");
const [dttAlIngevuld, setDttAlIngevuld] = useState(false);
const [voltooiingen, setVoltooiingen] = useState<Record<string, { voltooid: boolean; modus: string | null; datum: string | null }>>({});
```

- [ ] **Step 4: Update `app/onboarding/page.tsx` — stap 3 vervangen door 5 namen**

Vervang het hele `{stap === 3 && (...)}` blok (huidig: run-uitleg) door:

```tsx
{stap === 3 && (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-6xl mb-4">📲</div>
      <EditableTekst
        namespace="onboarding"
        sleutel="stap3.titel"
        standaard="Schrijf 5 namen op die spontaan in je hoofd opkomen"
        overrides={overrides}
        isFounder={isFounder}
        as="h2"
        className="text-2xl font-display font-bold text-cm-white mb-2"
      />
      <EditableBlok
        namespace="onboarding"
        sleutel="stap3.intro"
        standaard="Niet filteren, niet bedenken 'die past niet'. Iedereen mag erop, zij beslissen zelf. Dit zijn jouw eerste warme contacten."
        overrides={overrides}
        isFounder={isFounder}
        as="p"
        className="text-cm-white opacity-70 text-sm leading-relaxed"
        rows={3}
      />
    </div>

    {voltooiingen["eerste-5-namen"]?.voltooid ? (
      <AlGedaanLabel
        modus={(voltooiingen["eerste-5-namen"].modus ?? "sprint") as "sprint" | "core" | "pro"}
        datum={voltooiingen["eerste-5-namen"].datum}
        bekijkRoute="/namenlijst"
      />
    ) : (
      <p className="text-cm-white text-sm opacity-60 italic">
        De namen-invoer staat klaar op je namenlijst. Open 'm, vul minimaal 5 in, en kom dan terug.
      </p>
    )}

    <a
      href="/namenlijst"
      className="btn-gold w-full py-3 text-center block font-bold"
    >
      {voltooiingen["eerste-5-namen"]?.voltooid ? "Bekijk je namenlijst →" : "Open namenlijst en vul 5 namen in →"}
    </a>

    <button
      onClick={() => gaNaarStap(4)}
      disabled={bezig}
      className="w-full py-3 border border-cm-border text-cm-white rounded-lg"
    >
      Verder naar stap 4 →
    </button>
  </div>
)}
```

Voeg bij imports toe: `import { AlGedaanLabel } from "@/components/onboarding/AlGedaanLabel";`.

- [ ] **Step 5: Update `app/onboarding/page.tsx` — stap 4 vervangen door Stap4ModusKeuze**

Vervang het hele `{stap === 4 && (...)}` blok door:

```tsx
{stap === 4 && (
  <Stap4ModusKeuze
    modus={modus}
    isPreview={isPreview}
    isFounder={isFounder}
    overrides={overrides}
    dttAlIngevuld={dttAlIngevuld}
  />
)}
```

Voeg bij imports toe: `import { Stap4ModusKeuze } from "@/components/onboarding/Stap4ModusKeuze";`.

- [ ] **Step 6: Update `app/welkom-core/page.tsx`**

Vervang regel 33:

```typescript
if (modus === "core") redirect("/onboarding");
```

(In plaats van `redirect("/vandaag")`.)

- [ ] **Step 7: Voor stap 1 en stap 2 cross-modus skip-banner tonen**

In stap 1 (boven de "App geïnstalleerd" knop), voeg toe:

```tsx
{voltooiingen["app-geinstalleerd"]?.voltooid && (
  <AlGedaanLabel
    modus={(voltooiingen["app-geinstalleerd"].modus ?? "sprint") as "sprint" | "core" | "pro"}
    datum={voltooiingen["app-geinstalleerd"].datum}
  />
)}
```

In stap 2 (boven de "Start WHY-gesprek" CTA), voeg toe:

```tsx
{voltooiingen["why"]?.voltooid && (
  <AlGedaanLabel
    modus={(voltooiingen["why"].modus ?? "sprint") as "sprint" | "core" | "pro"}
    datum={voltooiingen["why"].datum}
    bekijkRoute="/mijn-why"
  />
)}
```

- [ ] **Step 8: Build**

Run: `npm run build`

Expected: build slaagt, geen TS-errors.

- [ ] **Step 9: Commit**

```bash
git add app/onboarding/page.tsx app/welkom-core/page.tsx app/api/onboarding/markeer-voltooid/route.ts
git commit -m "feat(onboarding): pre-day-1 gedeeld voor Sprint+Core

- /onboarding stap 3 vervangen door 'eerste 5 namen' (link naar namenlijst)
- /onboarding stap 4 vervangen door modus-bewust Stap4ModusKeuze
- /welkom-core redirect naar /onboarding ipv /vandaag
- AlGedaanLabel toegevoegd bij stap 1 (app) en stap 2 (WHY) voor cross-modus skip
- GET-endpoint op /api/onboarding/markeer-voltooid voor voltooiingen-map"
```

---

### Task 5: Admin-rail pagina + API

**Files:**
- Create: `app/setup/page.tsx`
- Create: `app/setup/layout.tsx`
- Create: `components/setup/AdminChecklist.tsx`
- Create: `app/api/setup/markeer/route.ts`

- [ ] **Step 1: Schrijf API route voor afvinken**

Bestand: `app/api/setup/markeer/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markeerVoltooid, type Modus } from "@/lib/onboarding/voltooiingen";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "niet ingelogd" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { slug } = body as { slug?: string };
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug ontbreekt" }, { status: 400 });
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("modus")
    .eq("id", user.id)
    .maybeSingle();
  const modus = ((prof as { modus?: string | null } | null)?.modus ?? "sprint") as Modus;

  await markeerVoltooid(supabase, user.id, slug, modus, { via: "setup" });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Schrijf AdminChecklist client-component**

Bestand: `components/setup/AdminChecklist.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

type Props = {
  beginVoltooiingen: Record<string, boolean>;
  isFounder: boolean;
  overrides: Record<string, string>;
};

export function AdminChecklist({ beginVoltooiingen, isFounder, overrides }: Props) {
  const [voltooid, setVoltooid] = useState<Record<string, boolean>>(beginVoltooiingen);
  const [bezig, setBezig] = useState<string | null>(null);
  const router = useRouter();

  async function afvinken(slug: string) {
    setBezig(slug);
    const r = await fetch("/api/setup/markeer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setBezig(null);
    if (!r.ok) {
      toast.error("Niet gelukt om af te vinken, probeer 'm zo nog eens.");
      return;
    }
    setVoltooid((v) => ({ ...v, [slug]: true }));
    toast.success("Afgevinkt");
    router.refresh();
  }

  const aantalOpen = ADMIN_ITEMS.filter((it) => !voltooid[it.slug]).length;

  return (
    <div className="space-y-4">
      <div className="card border-l-4 border-cm-gold">
        <EditableTekst
          namespace="setup-admin"
          sleutel="header.titel"
          standaard="Eenmalige admin-stappen"
          overrides={overrides}
          isFounder={isFounder}
          as="h1"
          className="text-2xl font-display font-bold text-cm-white mb-2"
        />
        <EditableBlok
          namespace="setup-admin"
          sleutel="header.uitleg"
          standaard="Vijf stappen die je één keer doet en daarna nooit meer. Advies: doe ze binnen drie dagen, ze zijn nodig voor de rest van je traject. Heb je 'm al in een andere modus afgevinkt? Dan staat hij hier vanzelf groen."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-80 leading-relaxed"
          rows={3}
        />
        {aantalOpen > 0 ? (
          <p className="text-cm-gold text-sm font-semibold mt-3">
            Nog {aantalOpen} stap{aantalOpen === 1 ? "" : "pen"} open
          </p>
        ) : (
          <p className="text-emerald-300 text-sm font-semibold mt-3">
            ✓ Alle admin-stappen afgevinkt
          </p>
        )}
      </div>

      {ADMIN_ITEMS.map((item) => {
        const isAf = !!voltooid[item.slug];
        return (
          <div
            key={item.slug}
            className={`card border-l-4 transition-colors ${
              isAf ? "border-emerald-500/60 opacity-60" : "border-cm-gold/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.emoji}</span>
                <EditableTekst
                  namespace="setup-admin"
                  sleutel={`${item.slug}.titel`}
                  standaard={item.titel}
                  overrides={overrides}
                  isFounder={isFounder}
                  as="h3"
                  className="text-lg font-semibold text-cm-white"
                />
              </div>
              {isAf && (
                <span className="text-xs bg-emerald-900/40 border border-emerald-600/40 text-emerald-300 px-2 py-1 rounded-full">
                  ✓ Gedaan
                </span>
              )}
            </div>
            <EditableBlok
              namespace="setup-admin"
              sleutel={`${item.slug}.uitleg`}
              standaard={item.uitleg}
              overrides={overrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white text-sm opacity-80 leading-relaxed mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              {item.route && (
                <a
                  href={item.route}
                  className="text-sm bg-cm-surface border border-cm-border text-cm-white px-3 py-2 rounded-lg"
                >
                  Open uitleg
                </a>
              )}
              {!isAf && (
                <button
                  onClick={() => afvinken(item.slug)}
                  disabled={bezig === item.slug}
                  className="btn-gold text-sm px-3 py-2 disabled:opacity-50"
                >
                  {bezig === item.slug ? "Bezig..." : "Markeer als gedaan"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Schrijf `/setup` layout en page**

Bestand: `app/setup/layout.tsx`

```tsx
import { AppShell } from "@/components/layout/AppShell";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

Bestand: `app/setup/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { haalAlleVoltooiingenVoorUser } from "@/lib/onboarding/voltooiingen";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { AdminChecklist } from "@/components/setup/AdminChecklist";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";

export const dynamic = "force-dynamic";

export default async function SetupPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder = (profile as { role?: string } | null)?.role === "founder";

  const voltooiMap = await haalAlleVoltooiingenVoorUser(supabase, user.id);
  const beginVoltooiingen: Record<string, boolean> = {};
  for (const item of ADMIN_ITEMS) {
    beginVoltooiingen[item.slug] = !!voltooiMap.get(item.slug)?.voltooid;
  }

  const overrides = await haalTekstOverrides(supabase, "setup-admin");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <AdminChecklist
        beginVoltooiingen={beginVoltooiingen}
        isFounder={isFounder}
        overrides={overrides}
      />
    </div>
  );
}
```

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: build slaagt, `/setup` verschijnt in route-overzicht.

- [ ] **Step 5: Commit**

```bash
git add app/setup app/api/setup components/setup
git commit -m "feat(setup): admin-rail pagina /setup + AdminChecklist + API

Vijf eenmalige admin-stappen (webshop, krediet, teams, bestellinks,
productadvies-test) op één pagina met afvink-functionaliteit. Schrijft
naar onboarding_voltooiingen tabel, cross-modus skip werkt automatisch.

EditableTekst-blokken voor founder-bewerkbaarheid op alle teksten
(namespace setup-admin)."
```

---

### Task 6: SetupPopup + integratie in /vandaag

**Files:**
- Create: `components/setup/SetupPopup.tsx`
- Modify: `app/vandaag/page.tsx`

- [ ] **Step 1: Schrijf SetupPopup**

Bestand: `components/setup/SetupPopup.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

type Props = {
  aantalOpen: number;
  isFounder: boolean;
  overrides: Record<string, string>;
};

export function SetupPopup({ aantalOpen, isFounder, overrides }: Props) {
  const [zichtbaar, setZichtbaar] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (aantalOpen === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const dismissed = localStorage.getItem("setup_popup_dismissed");
    if (dismissed === today) return;
    setZichtbaar(true);
  }, [aantalOpen]);

  function later() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("setup_popup_dismissed", today);
    setZichtbaar(false);
  }

  function openSetup() {
    setZichtbaar(false);
    router.push("/setup");
  }

  if (!zichtbaar || aantalOpen === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-cm-surface border-2 border-cm-gold rounded-xl p-6 max-w-md w-full space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">📋</div>
          <EditableTekst
            namespace="setup-popup"
            sleutel="titel"
            standaard={`Je hebt nog ${aantalOpen} admin-stap${aantalOpen === 1 ? "" : "pen"} openstaan`}
            overrides={overrides}
            isFounder={isFounder}
            as="h2"
            className="text-xl font-display font-bold text-cm-white"
          />
        </div>
        <EditableBlok
          namespace="setup-popup"
          sleutel="body"
          standaard="Doe ze binnen drie dagen, ze zijn nodig voor de rest van je traject. Webshop, kredietformulier, teams-admin, bestellinks en productadvies-test."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm leading-relaxed opacity-90 text-center"
          rows={3}
        />
        <div className="flex flex-col gap-2 pt-2">
          <button onClick={openSetup} className="btn-gold py-3 font-semibold">
            <EditableTekst
              namespace="setup-popup"
              sleutel="cta_open"
              standaard="Open admin-checklist"
              overrides={overrides}
              isFounder={isFounder}
              as="span"
            />
          </button>
          <button
            onClick={later}
            className="py-2 text-cm-white text-sm opacity-70 hover:opacity-100"
          >
            <EditableTekst
              namespace="setup-popup"
              sleutel="cta_later"
              standaard="Later vandaag"
              overrides={overrides}
              isFounder={isFounder}
              as="span"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Integreer SetupPopup in `/vandaag/page.tsx`**

Voeg in `app/vandaag/page.tsx` boven de bestaande return toe:

```typescript
// Admin-rail status berekenen voor SetupPopup
const adminSlugs = ADMIN_ITEMS.map((it) => it.slug);
const adminOpen = adminSlugs.filter(
  (slug) => !crossModusVoltooiingenMap.get(slug)?.voltooid,
).length;
const setupPopupOverrides = await haalTekstOverrides(supabase, "setup-popup");
```

Bij imports toevoegen:

```typescript
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";
import { SetupPopup } from "@/components/setup/SetupPopup";
```

Voeg in de JSX-return (direct binnen de root-div, vóór de bestaande content):

```tsx
{adminOpen > 0 && (
  <SetupPopup
    aantalOpen={adminOpen}
    isFounder={isFounder}
    overrides={setupPopupOverrides}
  />
)}
```

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 4: Commit**

```bash
git add components/setup/SetupPopup.tsx app/vandaag/page.tsx
git commit -m "feat(setup): SetupPopup op /vandaag bij open admin-rail

Niet-blokkerende dialog, 1x per dag (localStorage), verdwijnt als
alle 5 admin-items afgevinkt zijn. EditableTekst-blokken voor titel,
body en beide knoppen (namespace setup-popup)."
```

---

### Task 7: Modus-switch banner + her-activatie-API + per-modus dag-teller in /vandaag

**Files:**
- Create: `components/vandaag/ModusSwitchBanner.tsx`
- Create: `app/api/modus/her-activatie-keuze/route.ts`
- Modify: `app/vandaag/page.tsx`

- [ ] **Step 1: Schrijf her-activatie-API**

Bestand: `app/api/modus/her-activatie-keuze/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "niet ingelogd" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { modus, keuze } = body as {
    modus?: "sprint" | "core";
    keuze?: "opnieuw" | "oppakken";
  };

  if (modus !== "sprint" && modus !== "core") {
    return NextResponse.json({ error: "ongeldige modus" }, { status: 400 });
  }
  if (keuze !== "opnieuw" && keuze !== "oppakken") {
    return NextResponse.json({ error: "ongeldige keuze" }, { status: 400 });
  }

  const veld = modus === "sprint" ? "sprint_startdatum" : "core_startdatum";

  if (keuze === "opnieuw") {
    const today = new Date().toISOString().slice(0, 10);
    await supabase
      .from("profiles")
      .update({ [veld]: today })
      .eq("id", user.id);
  }
  // Bij "oppakken": niets aanpassen, de oude startdatum blijft staan.

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Schrijf ModusSwitchBanner**

Bestand: `components/vandaag/ModusSwitchBanner.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

type Props = {
  // Toon banner alleen als modus-specifieke keuze nog ontbreekt
  modus: "sprint" | "core";
  hadEerderDezeModus: boolean; // dan ook de oppakken/opnieuw keuze tonen
  isFounder: boolean;
  overrides: Record<string, string>;
};

export function ModusSwitchBanner({
  modus,
  hadEerderDezeModus,
  isFounder,
  overrides,
}: Props) {
  const router = useRouter();
  const sleutelPrefix = modus === "core" ? "naar-core" : "naar-sprint";

  async function kies(keuze: "opnieuw" | "oppakken") {
    await fetch("/api/modus/her-activatie-keuze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modus, keuze }),
    });
    router.refresh();
  }

  return (
    <div className="card border-2 border-cm-gold bg-cm-gold/10 my-3">
      <EditableTekst
        namespace="modus-switch"
        sleutel={`${sleutelPrefix}.titel`}
        standaard={
          modus === "core"
            ? "Je bent overgestapt naar Core"
            : "Je bent overgestapt naar Sprint"
        }
        overrides={overrides}
        isFounder={isFounder}
        as="h3"
        className="text-cm-gold font-semibold mb-1"
      />
      <EditableBlok
        namespace="modus-switch"
        sleutel={`${sleutelPrefix}.uitleg`}
        standaard={
          modus === "core"
            ? "Vul nog even je Doel-Tijd-Termijn in, dan kunnen we je dag 1 op maat maken."
            : "Vul nog even je tempo in (2, 4 of 6 uur per dag), dan kunnen we je dag 1 op maat maken."
        }
        overrides={overrides}
        isFounder={isFounder}
        as="p"
        className="text-cm-white text-sm opacity-90 mb-3"
        rows={2}
      />

      {hadEerderDezeModus && (
        <div className="space-y-2 mb-3">
          <p className="text-cm-white text-xs opacity-70">
            Je had deze modus eerder al actief. Wil je:
          </p>
          <div className="flex gap-2">
            <button onClick={() => kies("oppakken")} className="btn-gold text-sm px-3 py-2">
              Oppakken waar je was
            </button>
            <button
              onClick={() => kies("opnieuw")}
              className="text-sm px-3 py-2 border border-cm-border text-cm-white rounded-lg"
            >
              Opnieuw beginnen op dag 1
            </button>
          </div>
        </div>
      )}

      <a
        href={modus === "core" ? "/instellingen#core-dtt" : "/onboarding?stap=4"}
        className="btn-gold inline-block px-4 py-2 text-sm font-semibold"
      >
        <EditableTekst
          namespace="modus-switch"
          sleutel={`${sleutelPrefix}.cta`}
          standaard={modus === "core" ? "Vul DTT in" : "Kies je tempo"}
          overrides={overrides}
          isFounder={isFounder}
          as="span"
        />
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Integreer dag-teller en banner in `/vandaag/page.tsx`**

Boven aan `app/vandaag/page.tsx`, importeer:

```typescript
import { dagVoorModus } from "@/lib/playbook/dag-teller";
import { ModusSwitchBanner } from "@/components/vandaag/ModusSwitchBanner";
```

Vervang de bestaande dag-berekening (zoek naar waar `dag` wordt afgeleid uit `run_startdatum`):

```typescript
// Profiel inclusief modus-specifieke startdatums laden
const { data: profielMetDatum } = await supabase
  .from("profiles")
  .select("modus, run_startdatum, sprint_startdatum, core_startdatum, created_at, core_dtt, commitment_uren")
  .eq("id", user.id)
  .maybeSingle();
const profMD = profielMetDatum as {
  modus?: string | null;
  run_startdatum?: string | null;
  sprint_startdatum?: string | null;
  core_startdatum?: string | null;
  created_at?: string | null;
  core_dtt?: unknown;
  commitment_uren?: number;
} | null;

const huidigeModus: Modus = (profMD?.modus === "core" ? "core" : "sprint");
const dag = dagVoorModus(
  {
    sprint_startdatum: profMD?.sprint_startdatum ?? null,
    core_startdatum: profMD?.core_startdatum ?? null,
    run_startdatum: profMD?.run_startdatum ?? null,
    created_at: profMD?.created_at ?? null,
  },
  huidigeModus,
);
```

En voor het modus-switch banner, voeg toe:

```typescript
// Banner tonen als modus-keuze nog niet is gemaakt voor de huidige modus
const modusKeuzeMist =
  (huidigeModus === "core" && !profMD?.core_dtt) ||
  (huidigeModus === "sprint" && !profMD?.commitment_uren);
const startdatumVeld = huidigeModus === "core"
  ? profMD?.core_startdatum
  : profMD?.sprint_startdatum;
const hadEerderDezeModus = !!startdatumVeld;
const modusSwitchOverrides = await haalTekstOverrides(supabase, "modus-switch");
```

In de JSX-return, voeg toe boven de content (na de eventuele SetupPopup):

```tsx
{modusKeuzeMist && (
  <ModusSwitchBanner
    modus={huidigeModus}
    hadEerderDezeModus={hadEerderDezeModus}
    isFounder={isFounder}
    overrides={modusSwitchOverrides}
  />
)}
```

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: build slaagt, `/vandaag` blijft werken.

- [ ] **Step 5: Commit**

```bash
git add components/vandaag/ModusSwitchBanner.tsx app/api/modus/her-activatie-keuze/route.ts app/vandaag/page.tsx
git commit -m "feat(modus-switch): banner + her-activatie-keuze + per-modus dag-teller

- ModusSwitchBanner verschijnt op /vandaag als tempo/DTT mist voor huidige modus
- Bij her-activatie van eerder gebruikte modus: keuze oppakken vs opnieuw
- /api/modus/her-activatie-keuze schrijft sprint_startdatum of core_startdatum
- dagVoorModus() gebruikt nu modus-specifiek startdatum-veld

EditableTekst overal (namespace modus-switch)."
```

---

### Task 8: Sprint dag 1 + dag 2 inhoud opschonen

**Files:**
- Modify: `lib/playbook/dagen.ts`

- [ ] **Step 1: Verwijder `dag1-5-namen` uit Sprint dag 1**

In `lib/playbook/dagen.ts`, zoek het `vandaagDoen`-blok van `nummer: 1` (rond regel 21).

Verwijder het hele object `{ id: "dag1-5-namen", ... }` (de eerste taak met `inlineEmbed: "namen-form"`).

De volgorde wordt dan:
1. `dag1-vcard` (telefoonboek-import)
2. `dag1-sponsor` (sponsor-bericht)
3. `dag1-momentum-radar`
4. `dag1-partner-check`

- [ ] **Step 2: Pas `watJeLeert` van Sprint dag 1 aan**

Vervang `watJeLeert` (rond regel 89) door (in Be-The-Change stem, met kennisbank als anker):

```typescript
watJeLeert: `Te gek dat je hier bent! 🎉 Je fundament staat. Je WHY, je eerste 5 namen, je tempo, ze zijn al binnen. Vandaag pakken we de telefoonboek-import erbij en stuur je je sponsor een berichtje. Rustige dag, geen drukke dag.

JE NAMENLIJST GROEIT VANDAAG

Eén klik op de telefoonboek-import en je hele lijst is in beeld. Geen verkooplijst, geen belkost-lijst, gewoon je netwerk in overzicht. Mensen die in jouw wereld bestaan: familie, oude collega's, sportmaatjes, buren. Filteren komt later, en doe je nooit voor iemand anders.

EERLIJK OVER VOLUME

Met 20 namen ga je het niet redden. Niet omdat je faalt, maar omdat een gemiddelde prospect 4 tot 6 contactmomenten nodig heeft voor een echte beslissing. Met te weinig namen draai je vast. Daarom voegen we elke dag namen toe.

JE SPONSOR INLICHTEN

Een sponsor is geen baas, het is je rugdekking. Eén kort "ik ben gestart"-berichtje is genoeg. Vanaf nu kijkt 'ie in ELEVA mee en ziet wat er gebeurt. Vele momenten van steun in de komende weken, vanuit één bericht.

JIJ LAAT ZIEN, ZIJ BESLISSEN

Jouw taak is niet overtuigen, niet binnenpraten, niet iemand laten kiezen voor wat jij wilt. Jouw taak is laten zien wat het is. Zij beslissen wat ze ermee doen. Dat maakt je werk lichter en respectvoller.

VEELGEMAAKTE FOUTEN OP DAG 1

✗ Direct mensen DM-en omdat je 'wilt scoren'. Vandaag is fundament, niet acquisitie.
✗ Sponsor niet inlichten. Je rugdekking begint nu.
✗ Te lang piekeren over wie je 'eerst' moet aanspreken. Morgen breiden we je lijst uit.

Overweldigd voelen is normaal. Je leert iets nieuws, je stapt uit comfort. Eerst onhandig, dan vaardig. Niet alleen.

Bouwen mag leuk zijn 💟`,
```

- [ ] **Step 3: Verwijder `dag2-webshop` en `dag2-krediet` uit Sprint dag 2**

In `lib/playbook/dagen.ts`, zoek `nummer: 2` `vandaagDoen`-blok (rond regel 133).

Verwijder het hele object `{ id: "dag2-webshop", ... }` en `{ id: "dag2-krediet", ... }`. De andere taken (`dag2-20-namen`, `dag2-kennismaak`, `dag2-3-invites`, `dag2-3weg-uitleg`, momentum-radar, partner-check) blijven staan.

- [ ] **Step 4: Build**

Run: `npm run build`

Expected: build slaagt. Sprint-leden zien geen 5-namen en geen webshop/krediet meer op die dagen, maar wel de admin-rail in `/setup`.

- [ ] **Step 5: Commit**

```bash
git add lib/playbook/dagen.ts
git commit -m "refactor(sprint): dag 1 + dag 2 opschonen na onboarding-redesign

- dag1-5-namen verwijderd (verhuisd naar pre-day-1 stap 3)
- dag2-webshop + dag2-krediet verwijderd (verhuisd naar /setup)
- dag 1 watJeLeert herschreven in Be-The-Change stem (kennisbank-anker),
  reflecteert dat WHY/5-namen/tempo al gedaan zijn in pre-day-1"
```

---

### Task 9: Core dag 1 + dag 3 + dag 4 inhoud opschonen + Be-The-Change stem

**Files:**
- Modify: `lib/playbook/core-dagen.ts`

- [ ] **Step 1: Verwijder `core-dag1-why` en `core-dag1-dtt` uit Core dag 1**

In `lib/playbook/core-dagen.ts`, zoek het `vandaagDoen`-blok van `nummer: 1` (rond regel 55).

Verwijder de objecten `{ id: "core-dag1-why", ... }` en `{ id: "core-dag1-dtt", ... }`.

Voeg `core-dag1-vcard-import` en `core-dag1-sponsor-bericht` toe vóór `core-dag1-prepost`:

```typescript
{
  id: "core-dag1-vcard-import",
  label: "📲 Importeer je telefooncontacten",
  verplicht: false,
  vereistMobiel: true,
  inlineEmbed: "vcard-upload",
  uitleg:
    "Eén klik en je hele lijst is in beeld. Net als bij Sprint: dit is je netwerk-overzicht, geen verkooplijst.",
},
{
  id: "core-dag1-sponsor-bericht",
  label: "💬 Stuur je sponsor een bericht: 'Ik ben gestart'",
  verplicht: true,
  inlineEmbed: "sponsor-melding",
  uitleg:
    "Geen lang verhaal, gewoon laten weten dat je vertrokken bent. Vanaf nu kijkt je sponsor in ELEVA mee.",
},
```

De overgebleven taken op Core dag 1 worden: vcard-import, sponsor-bericht, prepost-keuze, eerste-contact, en de drie afsluit-stappen.

- [ ] **Step 2: Herschrijf `watJeLeert` van Core dag 1 in Be-The-Change stem**

Vervang de hele `watJeLeert` van Core dag 1 (regel 96-136 in huidige bestand) door:

```typescript
watJeLeert: `Welkom bij Core 💟 Wat bijzonder dat je hier bent.

Je fundament staat. Je WHY, je eerste 5 namen, je Doel-Tijd-Termijn, ze zijn al binnen. Vandaag is je dag van koppelen: je netwerk in beeld, je sponsor in de loop, en je eerste keuze voor hoe je dag 7 ingaat.

VANDAAG, EEN RUSTIG MAAR DUIDELIJK BEGIN

Vier momenten staan open. Geen lange dag, wel een dag waarin je 'm écht zet.

**Je telefoonboek importeren.** Eén klik en je hele lijst is in beeld. Geen verkooplijst, geen belkost-lijst. Gewoon je netwerk in overzicht, zodat je weet wie er om je heen staat. Familie, oude collega's, sportmaatjes, buren. Filteren komt later, en doe je nooit voor iemand anders.

**Je sponsor inlichten.** Eén kort berichtje, "ik ben gestart". Geen lang verhaal nodig. Vanaf dat moment kijkt 'ie in ELEVA mee en weet 'ie wanneer het loopt of wanneer er even iets is.

**Een keuze maken: pre-post of 21-dagen-post.** Heb je al een product van Lifeplus geprobeerd en iets gemerkt? Dan deel je dat eerlijk, en raakt het mensen. Heb je nog geen ervaring? Ook prima, dan deel je je voornemen en bouw je de komende 21 dagen je eigen ervaring op. Beide werken. Het verschil zit in welk soort post je dag 7 plaatst.

**Je eerste warm contact vandaag.** Niet wachten tot alles 'klaar' is, niet pitchen, niet verkopen. Gewoon één warm contact uit je kring een berichtje sturen dat je gestart bent. Eén persoon. Dat is je eerste win.

JIJ LAAT ZIEN, ZIJ BESLISSEN

De grootste mentale shift in Core: je hoeft niemand binnen te praten, niemand te overtuigen, niemand te laten kiezen voor wat jij wilt. Jouw taak is laten zien wat er is. Zij beslissen. Dat maakt je werk lichter en respectvoller.

WAT ER MORGEN GEBEURT

Dag 2 vul je je Top-20 namenlijst aan, de twintig mensen die spontaan in je hoofd opkomen. Je sponsor heeft een korte kennismakings-call met je staan. Geen verkoop, geen werving. Je netwerk in beeld zodat je weet wie er om je heen staat.

Overweldigd voelen op dag 1 is normaal. Je leert iets nieuws, je stapt uit comfort. Eerst onhandig, dan vaardig. Je sponsor staat naast je, de ELEVA Mentor ook.

Niet alleen. Bouwen mag leuk zijn 💟`,
```

- [ ] **Step 3: Verwijder admin-taken uit Core dag 3**

In `lib/playbook/core-dagen.ts`, zoek `nummer: 3` `vandaagDoen`-blok (rond regel 197).

Verwijder de drie objecten `{ id: "core-dag3-webshop", ... }`, `{ id: "core-dag3-krediet", ... }` en `{ id: "core-dag3-teams", ... }`.

Dag 3 wordt daarmee een vrijwel lege dag (alleen afsluit-stappen). Vervang de hele `nummer: 3`-Dag-definitie door een nieuwe content-dag over **content-voorbereiding**, zodat dag 3 niet leeg is:

```typescript
{
  nummer: 3,
  titel: "📝 Je natuurlijke gespreksopener uitwerken",
  fase: 1,
  vandaagDoen: [
    {
      id: "core-dag3-opener",
      label: "Schrijf 2 zinnen waarmee je natuurlijk over je werk vertelt",
      verplicht: true,
      actieRoute: "/mijn-zinnen",
      uitleg:
        "Voorbeeld: 'Ik ben sinds kort gestart met hoogwaardige supplementen. Ik vind het zelf leuk om te zien wat het mensen brengt.' De Mentor kan helpen om 'm naar jouw stem te schrijven.",
    },
    {
      id: "core-dag3-mentor-hulp",
      label: "Vraag de Mentor om feedback op je opener",
      verplicht: false,
      actieRoute: "/coach",
      uitleg:
        "Plak je twee zinnen, de Mentor schaaft 'm bij. Niet perfect, wel authentiek.",
    },
    ...afsluitStappen(3),
  ],
  faseDoel: "Eén korte natuurlijke gespreksopener op papier en in praktijk.",
  waarInEleva: [
    { actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" },
    { actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" },
  ],
  watJeLeert: `Vandaag schrijf je een korte opener: twee zinnen die je natuurlijk kunt gebruiken als iemand vraagt 'wat doe jij eigenlijk?'. Geen verkoop-praat, gewoon hoe jij erover praat.

Je hoeft niet het volledige verhaal in twee zinnen te proppen. Eén zin over wat je doet, één zin over wat het je brengt. Bijvoorbeeld:

"Ik ben sinds kort gestart met hoogwaardige supplementen. Vind het zelf leuk om te zien wat het mensen brengt."

Of:

"Ik ben aan het opbouwen, naast m'n werk. Eigen webshop, mensen krijgen advies op maat."

Beide werken. Het verschil zit in jouw stem. De ELEVA Mentor helpt 'm bijschaven, jij houdt 'm jouw.

Waarom dit voor dag 3 staat: zonder een opener loop je vast als iemand 't vraagt. Mét een opener komt het natuurlijk uit je mond. Vandaag werk je 'm uit, morgen ga je 'm in de praktijk testen.

Bouwen mag leuk zijn 💟`,
  waaromWerktDit: {
    tekst:
      "Mensen die hun opener eenmalig op papier hebben, voelen zich 4× rustiger wanneer iemand er natuurlijk om vraagt. Geen 'wat zeg ik nu?', wel een vertrouwde paar zinnen klaar.",
  },
},
```

- [ ] **Step 4: Verwijder admin-taken uit Core dag 4 (commission-plan-content blijft)**

In `lib/playbook/core-dagen.ts`, zoek `nummer: 4` `vandaagDoen` (rond regel 240).

Verwijder de objecten `{ id: "core-dag4-bestellinks", ... }` en `{ id: "core-dag4-test", ... }`. Houd `core-dag4-commission-plan` (dat is kennis, geen admin).

Dag 4 vandaagDoen wordt:
1. `core-dag4-commission-plan` (lezen)
2. drie afsluit-stappen

De volledige `watJeLeert` met de commission-plan-uitleg blijft ongewijzigd. Titel updaten van "🔗 Bestellinks + productadvies-test + commission-plan" naar:

```typescript
titel: "📊 Het commissieplan begrijpen",
```

faseDoel updaten naar:

```typescript
faseDoel: "Basis-kennis van het commissieplan: welke rank wil jij?",
```

- [ ] **Step 5: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 6: Commit**

```bash
git add lib/playbook/core-dagen.ts
git commit -m "refactor(core): dag 1 + dag 3 + dag 4 herstructureren

- core-dag1-why en core-dag1-dtt verwijderd (verhuisd naar pre-day-1)
- core-dag1-vcard-import + core-dag1-sponsor-bericht toegevoegd
- core-dag1 watJeLeert herschreven in Be-The-Change stem
- core-dag3 herbestemd van admin-dag naar opener-dag (content)
- core-dag4 admin-taken verwijderd (verhuisd naar /setup),
  commission-plan-kennis blijft als hoofdcontent

Alle teksten conform raoul-stem-anker memory: warm openen,
geen em-dashes, geen tijdsprognoses."
```

---

### Task 10: Cross-modus skip-laag op /vandaag voor vcard + sponsor-bericht

**Files:**
- Modify: `lib/playbook/dagen.ts` (Sprint dag 1)
- Modify: `lib/playbook/core-dagen.ts` (Core dag 1)
- Modify: `app/vandaag/page.tsx`

- [ ] **Step 1: Filter `dag1-vcard` en `dag1-sponsor` weg als cross-modus al voltooid in `/vandaag/page.tsx`**

In `app/vandaag/page.tsx`, na het laden van `crossModusVoltooiingenMap`, voeg toe (voor de dagData wordt opgebouwd):

```typescript
// Cross-modus skip: items die in een andere modus al zijn afgevinkt
// hoeven we niet meer in de huidige modus's dag-flow te tonen.
const skipBijVoltooid = (taakId: string, slug: string): boolean => {
  return crossModusVoltooiingenMap.has(slug);
};
```

Pas in beide modus-takken (Sprint en Core) aan, na het opbouwen van `dagData.vandaagDoen`:

```typescript
// Skip taken waarvan de cross-modus slug al voltooid is
const taakNaarSlug: Record<string, string> = {
  "dag1-vcard": "vcard-import-gedaan",
  "dag1-sponsor": "sponsor-eerste-bericht",
  "core-dag1-vcard-import": "vcard-import-gedaan",
  "core-dag1-sponsor-bericht": "sponsor-eerste-bericht",
};

dagData = {
  ...dagData,
  vandaagDoen: dagData.vandaagDoen.filter((t) => {
    const slug = taakNaarSlug[t.id];
    if (!slug) return true;
    return !crossModusVoltooiingenMap.has(slug);
  }),
};
```

- [ ] **Step 2: Zorg dat vcard-import en sponsor-bericht bij voltooiing naar de cross-modus tabel schrijven**

Check in de bestaande VcardUpload component en SponsorMelding component dat ze bij voltooiing de juiste `slug` naar `/api/onboarding/markeer-voltooid` POSTen.

Voor `components/onboarding/VcardUpload.tsx` (of equivalent), in de success-handler:

```typescript
await fetch("/api/onboarding/markeer-voltooid", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slug: "vcard-import-gedaan", modus: huidigeModus }),
}).catch(() => {});
```

Voor `components/onboarding/SponsorMeldingEmbed.tsx` (of equivalent), na het succesvolle versturen:

```typescript
await fetch("/api/onboarding/markeer-voltooid", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slug: "sponsor-eerste-bericht", modus: huidigeModus }),
}).catch(() => {});
```

Run eerst om de exacte bestandsnamen te vinden:

```bash
grep -rln "vcard-upload\|sponsor-melding" components/ | head -5
```

En pas in beide bestanden de POST naar de markeer-voltooid endpoint toe. Als er nog geen `modus` prop is in deze components, geef die mee vanuit `vandaag-flow.tsx` (de huidige modus).

- [ ] **Step 3: Idem voor de 5-namen-form (eerste-5-namen slug)**

In `components/onboarding/NamenForm.tsx` (of equivalent), bij voltooiing van 5+ namen:

```typescript
if (totaalNamen >= 5) {
  await fetch("/api/onboarding/markeer-voltooid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: "eerste-5-namen", modus: huidigeModus }),
  }).catch(() => {});
}
```

Run eerst om de exacte locatie te vinden:

```bash
grep -rln "namen-form\|NamenForm" components/ lib/ app/ | head -5
```

- [ ] **Step 4: WHY-voltooiing markeren**

In `app/mijn-why/page.tsx` of de WHY-finalisatie-route, voeg toe na succesvolle WHY-opslag:

```typescript
await fetch("/api/onboarding/markeer-voltooid", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ slug: "why", modus: huidigeModus }),
}).catch(() => {});
```

Run om de juiste locatie te vinden:

```bash
grep -rln "/mijn-why\|mijn_why\|why_voltooid" app/api/ lib/why/ 2>/dev/null | head -5
```

- [ ] **Step 5: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(cross-modus): skip-laag voor vcard/sponsor/why/eerste-5-namen

- /vandaag filtert taken weg waarvan de cross-modus slug al voltooid
  is in onboarding_voltooiingen
- VcardUpload, SponsorMelding, NamenForm en WHY-finalisatie markeren
  hun bijbehorende slug bij voltooiing
- Member die Sprint→Core (of omgekeerd) switcht ziet die taken niet
  meer in dag 1 van de nieuwe modus"
```

---

### Task 11: Smoke-test op live + finalisatie

**Files:**
- Modify: `MEMORY.md` (project-memory update)

- [ ] **Step 1: Push naar main en wacht op Vercel-deploy**

```bash
git push
```

Wacht ~60 seconden tot deploy live is.

- [ ] **Step 2: Smoke-test scenario 1, nieuwe Core-gebruiker (testaccount Raoul)**

Raoul opent een vers testaccount en kiest **Core** op `/welkom-keuze`.

Verwacht resultaat:
- Redirect naar `/onboarding` stap 1
- Stap 1: welkom + app-install + push (geen "Al gedaan"-label, want vers account)
- Stap 2: WHY-CTA (geen "Al gedaan"-label)
- Stap 3: "5 namen" prompt met link naar `/namenlijst` (geen "Al gedaan"-label)
- Stap 4: Core-uitleg + DTT-form (drie velden)
- Na DTT opslaan: redirect naar `/vandaag` op Core dag 1
- Core dag 1 toont: vcard-import, sponsor-bericht, prepost-keuze, eerste-contact + afsluit-stappen
- SetupPopup verschijnt (5 admin-stappen open)
- Geen ModusSwitchBanner (DTT al ingevuld)

- [ ] **Step 3: Smoke-test scenario 2, modus-switch Core → Sprint**

Vanuit hetzelfde testaccount, ga naar `/instellingen` of `/welkom-keuze` (afhankelijk van hoe modus-switch al werkt) en switch naar Sprint.

Verwacht resultaat op `/vandaag`:
- ModusSwitchBanner verschijnt: "Je bent overgestapt naar Sprint, vul nog even je tempo in"
- Geen oppakken/opnieuw-keuze (want Sprint was nog nooit eerder actief)
- Klik op "Kies je tempo" → terug naar `/onboarding?stap=4` met Sprint-tempo-cards
- Stap 1 en 2 tonen nu wel "Al gedaan tijdens Core" labels
- Stap 3 (5 namen) toont ook "Al gedaan tijdens Core" als die was gevuld
- Na tempo-keuze: redirect naar `/vandaag` op Sprint dag 1
- Sprint dag 1 toont: alleen dag1-momentum-radar en dag1-partner-check (vcard+sponsor zijn gefilterd, want al gedaan in Core)

- [ ] **Step 4: Smoke-test scenario 3, switch terug naar Core**

Switch nu terug van Sprint naar Core.

Verwacht resultaat:
- ModusSwitchBanner verschijnt: "Je bent overgestapt naar Core"
- DIT KEER met oppakken/opnieuw-keuze (want Core was eerder actief, `core_startdatum` bestaat)
- Klik "Oppakken waar je was" → `core_startdatum` blijft, dag-teller toont juiste dag (afhankelijk van hoeveel dagen tussen eerste Core-activatie en nu)
- Of klik "Opnieuw beginnen" → `core_startdatum` reset naar vandaag, dag-teller = 1

- [ ] **Step 5: Smoke-test scenario 4, /setup admin-rail**

Open `/setup` via menu of via SetupPopup.

Verwacht resultaat:
- 5 admin-items zichtbaar, allemaal nog open (groene "Gedaan"-tags afwezig)
- Klik op "Markeer als gedaan" bij webshop → wordt groen
- Refresh `/setup` → status blijft groen
- Open `/vandaag` opnieuw → SetupPopup toont nu "Nog 4 admin-stappen open"
- Klik "Markeer als gedaan" bij alle 5 → SetupPopup verschijnt niet meer (komt vanzelf terug bij volgende dag-roll, maar alle items voltooid = geen pop-up)

- [ ] **Step 6: Smoke-test scenario 5, founder-bewerkbaarheid**

Op het echte founder-account van Raoul (`raoulzeewijk@hotmail.com`), open:

- `/setup` → EditModeToggle rechtsboven → klik aan → header-titel klikbaar maken → wijzig "Eenmalige admin-stappen" naar "Jouw setup" → opslaan → refresh → tekst is gewijzigd
- `/onboarding?stap=4&modus=core` (via testaccount-impersonatie of via preview-modus) → DTT-uitleg klikbaar maken → wijzig
- `/vandaag` met SetupPopup zichtbaar → titel klikbaar → bewerken

Verwacht resultaat: alle wijzigingen direct live zonder deploy.

- [ ] **Step 7: Update MEMORY.md met de nieuwe feature-status**

In `C:\Users\raoul\.claude\projects\c--Users-raoul-OneDrive-Bureaublad-CLAUDE-60-day-run-change-masters\memory\MEMORY.md`, voeg toe:

```markdown
- [Onboarding-redesign fase 2](onboarding-redesign-fase-2.md) — pre-day-1 gedeeld Sprint+Core, admin-rail /setup, per-modus dag-teller, cross-modus skip live op 2026-05-18
```

En schrijf een korte memory-file `onboarding-redesign-fase-2.md`:

```markdown
---
name: onboarding-redesign-fase-2
description: Pre-day-1 gedeeld Sprint+Core (4 stappen), admin-rail /setup met pop-up, per-modus dag-teller met her-activatie-keuze, cross-modus skip op WHY/namen/vcard/sponsor/admin
metadata:
  type: project
---

Live op 2026-05-18. Drie lagen:

A. **Gedeelde pre-day-1** in `/onboarding`: 4 stappen (welkom+app, WHY, 5 namen, modus-keuze). Stap 4 modus-bewust (Sprint=tempo 2/4/6, Core=DTT). AlGedaanLabel bij cross-modus al voltooid.

B. **Admin-rail** `/setup`: 5 eenmalige items (webshop, krediet, teams, bestellinks, productadvies-test). SetupPopup op `/vandaag` 1×/dag zolang open.

C. **Cross-modus skip + per-modus dag-teller**: nieuwe kolommen `profiles.sprint_startdatum` + `profiles.core_startdatum`. ModusSwitchBanner met oppakken/opnieuw-keuze bij her-activatie. `dagVoorModus()` helper voor dag-nummer per modus.

**Founder bewerkt alles via** EditableTekst-blokken op de respectievelijke pagina's. Namespaces: `onboarding`, `setup-admin`, `setup-popup`, `modus-switch`.

Pro blijft op 14-stappen pad, doet niet mee in cross-modus skip.

Gerelateerd: [[eleva-feature-status]] · [[raoul-stem-anker]] · [[eleva-deploy-flow]]
```

- [ ] **Step 8: Finale commit**

```bash
git add -A
git commit -m "docs(memory): onboarding-redesign fase 2 live, memory bijgewerkt

Memory-pointer toegevoegd voor cross-sessie context. Smoke-tests
op live succesvol: nieuwe Core-flow, modus-switch beide kanten op,
admin-rail incl. pop-up, founder-bewerkbaarheid van alle teksten."
git push
```

- [ ] **Step 9: Rapporteer aan Raoul**

Schrijf de eind-rapportage in het chat-venster:

```
Onboarding-redesign fase 2 staat live.

✅ Gedeelde pre-day-1 (Sprint+Core, 4 stappen, modus-bewuste stap 4)
✅ Admin-rail /setup met 5 items en niet-blokkerende pop-up
✅ Per-modus dag-teller + her-activatie-keuze bij switch terug
✅ Cross-modus skip op WHY, 5 namen, vcard, sponsor, alle admin-items
✅ Founder-bewerkbaarheid op alle nieuwe teksten via EditModeToggle
✅ Smoke-test 5 scenario's succesvol op testaccount

Bestaande pilot-leden: pre-day-1 wordt niet opnieuw afgevuurd
(onboarding_stap = 99). Admin-rail-pop-up komt wel op, met items
afgevinkt voor wat al gedaan was in oude Sprint dag 2 (webshop+krediet).
Teams-admin en bestellinks staan open in /setup, vraag aan pilot-team
om deze één keer af te tikken via /setup.

Pro buiten scope deze ronde, blijft op eigen 14-stappen pad.
```

---

## Self-review

**1. Spec coverage check:**

- §3 Laag A pre-day-1 → Task 4 (onboarding page), Task 3 (Stap4ModusKeuze) ✓
- §3 Laag B admin-rail → Task 5 (page + checklist + API), Task 6 (popup) ✓
- §3 Laag C cross-modus skip-tabel → Task 2 (sleutels), Task 10 (toepassing) ✓
- §4 Dag 1 per modus → Task 8 (Sprint), Task 9 (Core), Task 10 (skip-filter) ✓
- §5 Routes/componenten/DB → Task 1 (DB), Task 4 (routes), Task 3+5+6+7 (componenten) ✓
- §6 Pop-up gedrag → Task 6 (SetupPopup met 1×/dag localStorage) ✓
- §7 Stijl-regels (Be-The-Change stem) → Task 8+9 (watJeLeert herschrijven) ✓
- §8 Wat niet in deze fase → expliciet vermeld in plan-context ✓
- §9 Modus-switchen + per-modus dag-teller → Task 1 (DB), Task 7 (banner + API + dag-teller) ✓
- §10 Founder-bewerkbaarheid → Task 3+5+6+7 (EditableTekst overal), Task 11 step 6 (smoke-test) ✓

**2. Placeholder scan:** Geen TBD/TODO/"implement later". Wel: Task 10 step 2/3/4 vraagt om eerst `grep`-en naar de exacte component-file. Dat is geen placeholder, dat is een instructie waar de engineer kennis van het project heeft om de juiste file te vinden. Acceptabel.

**3. Type consistency:**
- `Modus` import uit `lib/onboarding/voltooiingen` overal consistent ✓
- `ITEM_SLUGS` constants gebruikt in admin-items en route-mapping ✓
- `dagVoorModus()` signature consistent tussen task 2 en task 7 ✓
- `EditableTekst`/`EditableBlok` props consistent met bestaande gebruik ✓

Plan is intern consistent. Geen herstel-edits nodig.

---

## Volgende stap

Plan compleet en opgeslagen op `docs/superpowers/plans/2026-05-18-onboarding-redesign-fase-2.md`.

Raoul heeft akkoord gegeven om door te bouwen, dus we starten direct met **superpowers:executing-plans** (inline-execution met batch-uitvoering). Hij heeft expliciet aangegeven: pop-up bevestiging per taak hoeft niet, batch tot het einde is prima, tenzij ik bij Task 9 (volledige Core dag 1 watJeLeert herschrijven in Be-The-Change stem) een tussentijdse content-bevestiging wil. Daar mag ik kort sample tonen.
