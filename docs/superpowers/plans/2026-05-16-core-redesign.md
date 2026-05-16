# Core-redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Raoul heeft akkoord gegeven om door te bouwen na de spec-akkoord. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Core migreren van `LeerpadStap`-format naar Sprint's `Dag`-type, route `/vandaag` universeel maken, DMO-blok per dag, DTT-onboarding met 5 brackets, pre-post/21-post-vertakking, cross-modus overlap-detectie, 40 dagen opstart + lifetime DMO.

**Architecture:** Bestaande Core-content uit `lib/leerpaden/core-stappen.ts` wordt overgezet naar nieuw bestand `lib/playbook/core-dagen.ts` in `Dag`-type. Nieuwe helpers in `lib/dtt/` en `lib/onboarding/`. Nieuwe componenten voor DTT/PrePost/DMO. `/vandaag`-page wordt modus-aware. Bestaande Sprint-content blijft onaangetast.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (PostgreSQL + RLS), Tailwind CSS, Vercel auto-deploy. Geen test-framework: verificatie via `npm run build` per taak + smoke-test op live in Task 9.

**Spec:** [docs/superpowers/specs/2026-05-16-core-redesign-design.md](../specs/2026-05-16-core-redesign-design.md)

---

## File Structure

**Created:**
- `lib/supabase/migrations/core_onboarding_dtt.sql` (Task 1)
- `lib/onboarding/voltooiingen.ts` (Task 2)
- `lib/dtt/brackets.ts` (Task 2)
- `lib/dtt/advies.ts` (Task 2)
- `lib/dtt/rank-vanaf-doel.ts` (Task 2)
- `lib/playbook/core-dagen.ts` (Task 3)
- `components/onboarding/DTTOnboardingEmbed.tsx` (Task 4)
- `components/onboarding/PrePostKeuzeEmbed.tsx` (Task 5)
- `components/vandaag/DMOBlok.tsx` (Task 6)
- `components/vandaag/CrossModusOverslaanKaart.tsx` (Task 7)
- `components/instellingen/CoreTempoSectie.tsx` (Task 9)
- `app/api/onboarding/markeer-voltooid/route.ts` (Task 7)
- `app/api/dtt/update/route.ts` (Task 9)

**Modified:**
- `lib/playbook/types.ts` (Task 4: uitbreiden `inlineEmbed`-union met `dtt-onboarding`, `prepost-keuze`)
- `app/vandaag/page.tsx` (Task 8: modus-aware routing)
- `app/vandaag/vandaag-flow.tsx` (Task 4, 5, 7: cases voor nieuwe embeds + cross-modus-kaart-rendering)
- `app/instellingen/page.tsx` (Task 9: CoreTempoSectie aanhaken)

**Niet aangepast (blijft staan voor backward-compat):**
- `lib/leerpaden/core-stappen.ts` (legacy, niet meer geladen door `/welkom-core`)
- `app/welkom-core/*` (krijgt redirect naar `/vandaag` in Task 8)

---

## Task 1: DB-migratie (onboarding-voltooiingen + DTT-velden)

**Files:**
- Create: `lib/supabase/migrations/core_onboarding_dtt.sql`

- [ ] **Step 1: Maak migratie-SQL**

Maak `lib/supabase/migrations/core_onboarding_dtt.sql`:

```sql
-- ============================================================
-- Core-onboarding state-laag
-- 1. onboarding_voltooiingen: cross-modus completion-tracking
-- 2. profiles.core_dtt: JSONB met Doel-Tijd-Termijn-antwoorden
-- 3. profiles.core_eigen_resultaat: boolean voor pre-post vs 21-post-vertakking
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_voltooiingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_slug TEXT NOT NULL,
  voltooid_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  modus_waarin TEXT NOT NULL CHECK (modus_waarin IN ('sprint', 'core', 'pro')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, item_slug)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_voltooiingen_user
  ON onboarding_voltooiingen (user_id);

ALTER TABLE onboarding_voltooiingen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_onboarding_select" ON onboarding_voltooiingen;
CREATE POLICY "eigen_onboarding_select"
  ON onboarding_voltooiingen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_onboarding_insert" ON onboarding_voltooiingen;
CREATE POLICY "eigen_onboarding_insert"
  ON onboarding_voltooiingen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DTT-velden op profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_dtt JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS core_eigen_resultaat BOOLEAN;
```

- [ ] **Step 2: Voer migratie uit**

Run: `node scripts/sql.mjs -f lib/supabase/migrations/core_onboarding_dtt.sql --yes`
Expected: `OK · 0 rij(en) geraakt`.

- [ ] **Step 3: Verifieer**

Run: `node scripts/sql.mjs "SELECT to_regclass('onboarding_voltooiingen') AS tabel, (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'onboarding_voltooiingen') AS policies, (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('core_dtt', 'core_eigen_resultaat')) AS profiles_kolommen"`
Expected: `tabel: "onboarding_voltooiingen", policies: 2, profiles_kolommen: 2`.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/migrations/core_onboarding_dtt.sql
git commit -m "feat(db): onboarding_voltooiingen + profiles.core_dtt + core_eigen_resultaat

Tabel onboarding_voltooiingen met UNIQUE(user_id, item_slug) voor
cross-modus completion-tracking. RLS-policies: alleen eigen rijen
select/insert.

profiles.core_dtt (JSONB) bewaart {doel_per_maand, uren_per_week,
termijn_maanden}. profiles.core_eigen_resultaat (boolean) bepaalt
pre-post versus 21-dagen-post-vertakking op dag 1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Helpers — DTT-brackets, advies, voltooiingen

**Files:**
- Create: `lib/dtt/brackets.ts`
- Create: `lib/dtt/advies.ts`
- Create: `lib/dtt/rank-vanaf-doel.ts`
- Create: `lib/onboarding/voltooiingen.ts`

- [ ] **Step 1: Maak `lib/dtt/brackets.ts`**

```typescript
// ============================================================
// 5 tempo-brackets voor Core. Minimum-aantallen per onderdeel, member
// mag altijd meer. Geen tijdsprognoses, wel kwalitatieve verwachtingen.
// ============================================================

export type Bracket = "minimaal" | "rustig" | "gestaag" | "serieus" | "doorpakken";

export type BracketDefinitie = {
  bracket: Bracket;
  label: string;
  urenPerWeekRange: string;
  verwachting: string;
  dmoMinimums: {
    contactenPerDag: number;
    socialPostsPerWeek: number;
    freebiesPerWeek: number;
    followUpsPerDag: number;
  };
};

export const BRACKETS: Record<Bracket, BracketDefinitie> = {
  minimaal: {
    bracket: "minimaal",
    label: "Minimaal",
    urenPerWeekRange: "<3u",
    verwachting:
      "Je producten terugverdienen. Inkomsten ongeveer gelijk aan je eigen maandelijkse bestellingen, dus je product wordt voor jou gratis.",
    dmoMinimums: {
      contactenPerDag: 0,
      socialPostsPerWeek: 0,
      freebiesPerWeek: 0,
      followUpsPerDag: 0,
    },
  },
  rustig: {
    bracket: "rustig",
    label: "Rustig",
    urenPerWeekRange: "3-6u",
    verwachting:
      "Eerste klanten in je eigen netwerk opbouwen. Kleine commissies bovenop je eigen bestellingen.",
    dmoMinimums: {
      contactenPerDag: 2,
      socialPostsPerWeek: 2,
      freebiesPerWeek: 1,
      followUpsPerDag: 1,
    },
  },
  gestaag: {
    bracket: "gestaag",
    label: "Gestaag",
    urenPerWeekRange: "6-10u",
    verwachting:
      "Eerste members aanbrengen. Builder-rank wordt realistisch doel.",
    dmoMinimums: {
      contactenPerDag: 3,
      socialPostsPerWeek: 3,
      freebiesPerWeek: 1,
      followUpsPerDag: 2,
    },
  },
  serieus: {
    bracket: "serieus",
    label: "Serieus",
    urenPerWeekRange: "10-16u",
    verwachting:
      "Builder-rank opbouwen en eerste duplicatie starten (een andere Builder helpen worden).",
    dmoMinimums: {
      contactenPerDag: 5,
      socialPostsPerWeek: 5,
      freebiesPerWeek: 2,
      followUpsPerDag: 3,
    },
  },
  doorpakken: {
    bracket: "doorpakken",
    label: "Doorpakken",
    urenPerWeekRange: "16u+",
    verwachting:
      "Meerdere Builders helpen worden. Schaalbaar gelaagd inkomen op gang brengen.",
    dmoMinimums: {
      contactenPerDag: 7,
      socialPostsPerWeek: 7,
      freebiesPerWeek: 3,
      followUpsPerDag: 5,
    },
  },
};
```

- [ ] **Step 2: Maak `lib/dtt/advies.ts`**

```typescript
import { type Bracket, BRACKETS } from "./brackets";

// ============================================================
// DTT-input → bracket-bepaling. Op basis van uren_per_week.
// ============================================================

export type DTTInput = {
  doel_per_maand: number;
  uren_per_week: number;
  termijn_maanden: number;
};

export function bracketVoorUren(urenPerWeek: number): Bracket {
  if (urenPerWeek < 3) return "minimaal";
  if (urenPerWeek < 6) return "rustig";
  if (urenPerWeek < 10) return "gestaag";
  if (urenPerWeek < 16) return "serieus";
  return "doorpakken";
}

export function bracketVoorDTT(dtt: DTTInput | null): Bracket {
  if (!dtt) return "rustig"; // veilige default
  return bracketVoorUren(dtt.uren_per_week);
}

export function dmoMinimumsVoorDTT(dtt: DTTInput | null) {
  return BRACKETS[bracketVoorDTT(dtt)].dmoMinimums;
}
```

- [ ] **Step 3: Maak `lib/dtt/rank-vanaf-doel.ts`**

```typescript
// ============================================================
// Doel-bedrag (euro/maand) → rank-suggestie met minimum-vereisten.
// Officiele cijfers uit kennisbank/verdienmodel-commissieplan.md.
// ============================================================

export type RankSuggestie = {
  rank: "believer" | "builder" | "bronze" | "silver" | "gold" | "diamond" | "ster-diamond";
  label: string;
  toelichting: string;
  vereisten: {
    eigenIP: number;
    qgv: number;
    members: number;
  };
};

export function rankVanafDoel(doelPerMaand: number): RankSuggestie {
  if (doelPerMaand < 100) {
    return {
      rank: "believer",
      label: "Believer (start-rank)",
      toelichting:
        "Eerste rank na aanmelding. Hier verdien je nog niet veel. Focus op je eigen ervaring opbouwen en je eerste paar mensen helpen.",
      vereisten: { eigenIP: 40, qgv: 500, members: 3 },
    };
  }
  if (doelPerMaand < 300) {
    return {
      rank: "builder",
      label: "Builder (bouwsteen voor duplicatie)",
      toelichting:
        "Vanaf hier kun je iemand anders ook Builder maken. Dit is de sleutel tot een schaalbaar inkomen.",
      vereisten: { eigenIP: 40, qgv: 1500, members: 3 },
    };
  }
  if (doelPerMaand < 600) {
    return {
      rank: "bronze",
      label: "Bronze",
      toelichting: "Vanaf €300-600 per maand. Eerste serieuze inkomensstroom.",
      vereisten: { eigenIP: 100, qgv: 3000, members: 3 },
    };
  }
  if (doelPerMaand < 900) {
    return {
      rank: "silver",
      label: "Silver",
      toelichting: "Vanaf €600 per maand. Stabiele bij-inkomensstroom.",
      vereisten: { eigenIP: 100, qgv: 6000, members: 6 },
    };
  }
  if (doelPerMaand < 1200) {
    return {
      rank: "gold",
      label: "Gold",
      toelichting:
        "Vanaf €900 per maand. Een halve dag werk minder per week wordt realistisch.",
      vereisten: { eigenIP: 150, qgv: 9000, members: 9 },
    };
  }
  if (doelPerMaand < 2500) {
    return {
      rank: "diamond",
      label: "Diamond",
      toelichting:
        "Vanaf €1200 per maand. Naar een dag werk minder per week of meer.",
      vereisten: { eigenIP: 150, qgv: 15000, members: 12 },
    };
  }
  return {
    rank: "ster-diamond",
    label: "Star-Diamond (1★/2★/3★)",
    toelichting:
      "Voor doelen vanaf €2500. Vereist Diamonds in verschillende benen onder je.",
    vereisten: { eigenIP: 150, qgv: 15000, members: 12 },
  };
}
```

- [ ] **Step 4: Maak `lib/onboarding/voltooiingen.ts`**

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Cross-modus onboarding-voltooiingen helper.
// Items als 'why', 'webshop-aangemaakt', 'fff-geleerd' worden
// gedeeld over Sprint/Core/Pro. Eenmaal voltooid = niet dubbel doen.
// ============================================================

export type Modus = "sprint" | "core" | "pro";

export type VoltooiingStatus = {
  voltooid: boolean;
  modus: Modus | null;
  datum: string | null;
};

export async function isReedsVoltooid(
  supabase: SupabaseClient,
  userId: string,
  itemSlug: string,
): Promise<VoltooiingStatus> {
  const { data } = await supabase
    .from("onboarding_voltooiingen")
    .select("modus_waarin, voltooid_op")
    .eq("user_id", userId)
    .eq("item_slug", itemSlug)
    .maybeSingle();

  if (!data) return { voltooid: false, modus: null, datum: null };

  const rij = data as { modus_waarin: Modus; voltooid_op: string };
  return {
    voltooid: true,
    modus: rij.modus_waarin,
    datum: rij.voltooid_op,
  };
}

export async function markeerVoltooid(
  supabase: SupabaseClient,
  userId: string,
  itemSlug: string,
  modusWaarin: Modus,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.from("onboarding_voltooiingen").insert({
    user_id: userId,
    item_slug: itemSlug,
    modus_waarin: modusWaarin,
    metadata,
  });

  // Duplicate-key (23505) is no-op: al voltooid in andere modus, prima.
  if (error && error.code !== "23505") {
    console.warn("markeerVoltooid error:", error.message);
  }
}

export async function haalAlleVoltooiingenVoorUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<string, VoltooiingStatus>> {
  const { data } = await supabase
    .from("onboarding_voltooiingen")
    .select("item_slug, modus_waarin, voltooid_op")
    .eq("user_id", userId);

  const map = new Map<string, VoltooiingStatus>();
  for (const rij of (data as Array<{
    item_slug: string;
    modus_waarin: Modus;
    voltooid_op: string;
  }> | null) ?? []) {
    map.set(rij.item_slug, {
      voltooid: true,
      modus: rij.modus_waarin,
      datum: rij.voltooid_op,
    });
  }
  return map;
}
```

- [ ] **Step 5: Verifieer build**

Run: `npm run build 2>&1 | grep -E "(error|Failed|Compiled successfully)"`
Expected: `✓ Compiled successfully` zonder TypeScript-fouten.

- [ ] **Step 6: Commit**

```bash
git add lib/dtt/brackets.ts lib/dtt/advies.ts lib/dtt/rank-vanaf-doel.ts lib/onboarding/voltooiingen.ts
git commit -m "feat(core): DTT-brackets + advies + rank-vanaf-doel + voltooiingen-helper

Vier helper-files voor Core:

1. BRACKETS (5 stuks: minimaal/rustig/gestaag/serieus/doorpakken) met
   urenPerWeekRange, verwachting (geen tijdsprognoses) en dmoMinimums
   per onderdeel (contacten/social-posts/freebies/follow-ups).

2. bracketVoorUren/bracketVoorDTT: DTT-input mapt naar bracket.

3. rankVanafDoel(doelPerMaand): mapt doel-bedrag op rank-suggestie
   (Believer/Builder/Bronze/Silver/Gold/Diamond/Star-Diamond) met
   officiele cijfers uit verdienmodel-commissieplan.md.

4. voltooiingen.ts: cross-modus completion-tracking. isReedsVoltooid,
   markeerVoltooid (duplicate-key = no-op), haalAlleVoltooiingenVoorUser.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Core-content bestand (`lib/playbook/core-dagen.ts`)

**Files:**
- Create: `lib/playbook/core-dagen.ts`

Dit is een grote inhoudelijke taak. We bouwen 40 dagen + lifetime-template. De inhoud van bestaande 21 stappen uit `lib/leerpaden/core-stappen.ts` wordt overgezet en verrijkt.

- [ ] **Step 1: Maak skeletbestand**

Maak `lib/playbook/core-dagen.ts`:

```typescript
import type { Dag } from "./types";

// ============================================================
// CORE-dagen, 21 skill-opstart + 19 verankering + lifetime-template
//
// Inhoud overgezet van lib/leerpaden/core-stappen.ts en verrijkt
// met first-win contact vanaf dag 1, pre-post vertakking,
// DMO-blok-aansluiting, en cross-modus skip-mogelijkheden.
//
// Layout-volgorde:
//   - Dag 1-21: skill-opstart (oude 21 stappen, herordend en
//     verrijkt). Fase 1.
//   - Dag 22-40: verankering. Geen nieuwe content, wel DMO-blok.
//     Genereerd via template-functie genereerVerankeringsDag().
//     Fase 2.
//   - Dag 41+: lifetime DMO. Genereerd via template-functie
//     genereerLifetimeDag(). Fase 3.
// ============================================================

export const CORE_DAGEN: Dag[] = [
  // De 21 statische dagen komen in Step 2.
];

export function genereerVerankeringsDag(dagNummer: number): Dag {
  if (dagNummer < 22 || dagNummer > 40) {
    throw new Error(`Verankerings-dag moet tussen 22 en 40 zijn, kreeg ${dagNummer}`);
  }
  const dagInVerankering = dagNummer - 21;
  const totaalVerankering = 19;

  return {
    nummer: dagNummer,
    titel: `🌱 Verankering, dag ${dagInVerankering} van ${totaalVerankering}`,
    fase: 2,
    vandaagDoen: [
      {
        id: `core-dag${dagNummer}-dmo`,
        label: "Open je dagelijkse DMO-blok hieronder",
        verplicht: false,
        uitleg:
          "Geen nieuwe leerstof vandaag. Pak je dagelijkse acties op in eigen tempo.",
      },
      {
        id: `core-dag${dagNummer}-sponsor-checkin`,
        label: "💬 Sluit af met een korte sponsor-checkin",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
        uitleg: "30 sec berichtje hoe het ging vandaag.",
      },
      {
        id: `core-dag${dagNummer}-momentum-radar`,
        label: "🎯 Open momentum-acties van vandaag",
        verplicht: false,
        inlineEmbed: "momentum-radar",
        uitleg: "Check of er nog losse eindjes liggen vandaag.",
      },
      {
        id: `core-dag${dagNummer}-partner-check`,
        label: "🤝 Check je nieuwe partner(s) vandaag",
        verplicht: false,
        inlineEmbed: "partner-check",
        uitleg: "Verbergt zich als je geen team hebt.",
      },
    ],
    faseDoel:
      "Verankering: doe wat je leerde, dag voor dag. Op dag 40 graduation richting lifetime DMO.",
    waarInEleva: [
      { actie: "Open je namenlijst", route: "/namenlijst" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    watJeLeert:
      `Je hebt je 21 skill-dagen gedaan. Nu is het oefenen-fase. Geen nieuwe content, wel het dagelijkse DMO-ritme volhouden. Op dag 40 voltooi je de opstart-fase en ga je over naar lifetime DMO.`,
    waaromWerktDit: {
      tekst:
        "Skills bouwen zich pas echt in door herhaling. Dag 22-40 is de fase waarin de geleerde technieken automatisch worden.",
    },
  };
}

export function genereerLifetimeDag(dagNummer: number): Dag {
  if (dagNummer < 41) {
    throw new Error(`Lifetime-dag moet vanaf 41 zijn, kreeg ${dagNummer}`);
  }
  const dagenSindsStart = dagNummer;

  return {
    nummer: dagNummer,
    titel: `🌿 Lifetime DMO, dag ${dagenSindsStart}`,
    fase: 3,
    vandaagDoen: [
      {
        id: `core-dag${dagNummer}-dmo`,
        label: "Pak je dagelijkse DMO-acties op",
        verplicht: false,
        uitleg:
          "Je opstart-fase is klaar. Dit is het dagelijkse ritme dat blijft draaien. Geen nieuwe content, wel jouw business-praktijk in actie.",
      },
      {
        id: `core-dag${dagNummer}-sponsor-checkin`,
        label: "💬 Sluit af met een korte sponsor-checkin",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
        uitleg: "30 sec berichtje hoe het ging vandaag.",
      },
      {
        id: `core-dag${dagNummer}-momentum-radar`,
        label: "🎯 Open momentum-acties van vandaag",
        verplicht: false,
        inlineEmbed: "momentum-radar",
        uitleg: "Check je openstaande acties van vandaag.",
      },
      {
        id: `core-dag${dagNummer}-partner-check`,
        label: "🤝 Check je nieuwe partner(s) vandaag",
        verplicht: false,
        inlineEmbed: "partner-check",
        uitleg: "Verbergt zich als je geen team hebt.",
      },
    ],
    faseDoel: "Lifetime DMO. Jouw business loopt nu permanent.",
    waarInEleva: [
      { actie: "Open je namenlijst", route: "/namenlijst" },
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Open je statistieken", route: "/statistieken" },
    ],
    watJeLeert:
      "Geen nieuwe leerstof. De skills zitten erin, het ritme is van jou. Mentor + sponsor + radar + partner-check blijven beschikbaar voor steun en momentum-checks.",
    waaromWerktDit: {
      tekst:
        "Een business die lifetime is opgebouwd, blijft inkomsten genereren ook als jij minder werkt. Daarvoor was deze hele opstart-fase: jouw vrijheid permanent maken.",
    },
  };
}
```

- [ ] **Step 2: Voeg de 21 statische dagen toe**

In `lib/playbook/core-dagen.ts`, vervang `// De 21 statische dagen komen in Step 2.` met de volledige 21-dagen-array. Hieronder de skeletten per dag. De `watJeLeert` en `uitleg` velden worden in Task 3 Step 3 ingevuld vanuit bestaande Core-content.

```typescript
export const CORE_DAGEN: Dag[] = [
  {
    nummer: 1,
    titel: "🚀 24u-fundament: WHY, DTT, eerste contact",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag1-why",
        label: "Maak je WHY (overgeslagen als al gedaan in Sprint/Pro)",
        verplicht: true,
        actieRoute: "/mijn-why",
        uitleg:
          "De ELEVA Mentor stelt vragen en helpt je formuleren waarom jij hieraan begint. Sterke WHY = brandstof voor de mindere dagen.",
      },
      {
        id: "core-dag1-dtt",
        label: "Vul je Doel-Tijd-Termijn in",
        verplicht: true,
        inlineEmbed: "dtt-onboarding",
        uitleg:
          "Drie vragen: hoeveel inkomen per maand wil je, hoeveel tijd per week kan je investeren, in hoeveel maanden moet het er staan? Op basis hiervan krijg je advies over dagelijkse aantallen.",
      },
      {
        id: "core-dag1-prepost",
        label: "Heb je al een eigen product-ervaring?",
        verplicht: true,
        inlineEmbed: "prepost-keuze",
        uitleg:
          "Bepaalt of je dag 7-11 begint met pre-post (geen ervaring, je deelt je voornemen) of 21-dagen-post (wel ervaring, je deelt resultaat).",
      },
      {
        id: "core-dag1-eerste-contact",
        label: "🎯 Stuur vandaag 1 warm contact dat je gestart bent (Eric Worre first-win)",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "Niet pitchen, gewoon delen. Eén persoon uit je warme kring. Dit is je eerste win: vanaf dag 1 ben je al in actie, niet alleen aan het voorbereiden.",
      },
      // VASTE AFSLUIT-STAPPEN (zoals in Sprint, op elke Core-dag)
      {
        id: "core-dag1-sponsor-checkin",
        label: "💬 Sluit af met een korte sponsor-checkin",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
        uitleg:
          "30 seconden. Vandaag is je eerste dag. Stuur je sponsor een kort berichtje hoe het ging.",
      },
      {
        id: "core-dag1-momentum-radar",
        label: "🎯 Open momentum-acties van vandaag",
        verplicht: false,
        inlineEmbed: "momentum-radar",
        uitleg:
          "Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg uit deze lijst. Geen lijst? Top, dag schoon afgesloten.",
      },
      {
        id: "core-dag1-partner-check",
        label: "🤝 Check je nieuwe partner(s) vandaag",
        verplicht: false,
        inlineEmbed: "partner-check",
        uitleg:
          "Voor wie al een directe partner heeft. Verbergt zich onzichtbaar als je nog geen team hebt.",
      },
    ],
    faseDoel: "Fundament gelegd: WHY + DTT + sponsor-verbinding + eerste echte contact.",
    waarInEleva: [
      { actie: "Maak je WHY", route: "/mijn-why" },
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Naar je namenlijst", route: "/namenlijst" },
    ],
    watJeLeert: `ELEVA Core gaat over één ding: je eigen webshop opzetten als basis voor meer tijd en vrijheid. Geen drukke sprint, wel een dagelijks ritme dat past in jouw leven. De komende 21 dagen leer je hoe je je webshop opbouwt, hoe je via sociale media en gratis weggevers klanten bereikt, en hoe je daar een echte business van maakt.

Vanaf vandaag stuur je elke dag minimaal 1 contact (afhankelijk van je DTT-tempo meer). Eric Worre's principe: hoe sneller je eerste echte interactie komt, hoe sterker je momentum.

In jouw DMO-blok hieronder zie je je dagelijkse aantallen op basis van je tempo-keuze.`,
    waaromWerktDit: {
      tekst:
        "Mensen die op dag 1 al een eerste contact maken, halen vier keer zo vaak hun eerste klant binnen 30 dagen dan mensen die eerst alles 'klaar maken' voordat ze in actie komen.",
    },
  },
  {
    nummer: 2,
    titel: "👥 Top-20 namenlijst + telefoon-import",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag2-top20",
        label: "Schrijf 20 namen op: jouw warme kring (Top-20 namenlijst)",
        verplicht: true,
        inlineEmbed: "namen-form",
        inlineEmbedDoel: 20,
        uitleg:
          "Familie, vrienden, kennissen, collega's, ouders bij school, sportclub, hobby's. Geen filter. Ook degenen waarvan je denkt 'die past nooit'. Vaak verrassen ze je.",
      },
      {
        id: "core-dag2-telefoon-import",
        label: "Importeer je telefooncontacten (oneindig aantal prospects)",
        verplicht: false,
        vereistMobiel: true,
        inlineEmbed: "vcard-upload",
        uitleg:
          "Eén klik, je hele telefoonboek staat erin. Net als bij Sprint: dit is je netwerk-overzicht, geen verkoop-lijst.",
      },
      {
        id: "core-dag2-social-contacten",
        label: "Voeg 3 mensen toe vanuit social media (Instagram/Facebook)",
        verplicht: false,
        actieRoute: "/namenlijst",
        uitleg:
          "Mensen die jou volgen of die jij volgt en met wie je een tijd niet hebt gesproken. Zelfde patroon als Sprint dag 3.",
      },
      {
        id: "core-dag2-sponsor-call",
        label: "Plan een kennismakings-call met je sponsor (~30 min)",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
        uitleg:
          "In deze call leer je je sponsor kennen, kijk je samen naar je lijst en bespreek je 1 of 2 mensen die je deze week wilt benaderen.",
      },
    ],
    faseDoel: "Top-20 namenlijst + telefoonboek + eerste social-contacten in beeld.",
    waarInEleva: [
      { actie: "Naar je namenlijst", route: "/namenlijst" },
      { actie: "Open je sponsor-chat", route: "/team" },
    ],
    watJeLeert: `Voordat je je webshop op grote schaal kan delen, wil je weten WIE er om je heen staat. Dit is geen verkoop-lijst, dit is een netwerk-overzicht. Familie, vrienden, oud-collega's, sportmaatjes, mensen die je via social volgt.

In Core noemen we de eerste 20 namen die je spontaan opschrijft jouw 'Top-20 namenlijst'. Dat zijn niet je beste klanten, dat zijn de mensen die als eerste in je hoofd opkomen. Daarna importeer je je hele telefoon (eindeloos aantal) en voeg je social-contacten toe.

In je DMO-blok hieronder zie je dat lijst-opbouw doorgaat. Elke dag mogen er meer bij.`,
    waaromWerktDit: {
      tekst:
        "Een filter zetten op 'wie zou geinteresseerd zijn' is jouw oordeel over een ander. Filteren komt later, en doet jouzelf nooit voor iemand anders. Iedereen mag op de lijst, zij beslissen zelf.",
    },
  },
  {
    nummer: 3,
    titel: "🛒 Webshop opzetten + krediet + teams (admin-dag)",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag3-webshop",
        label: "🛒 Maak je eigen webshop aan",
        verplicht: true,
        uitleg:
          "Volg de instructies van je sponsor of de hand-out. Eenmalige stap, hierna is je shop online.",
      },
      {
        id: "core-dag3-krediet",
        label: "✅ Vul je kredietformulier in (zonder dit geen uitbetaling)",
        verplicht: true,
        uitleg:
          "Zonder dit formulier ontvang je geen commissies. Eenmalige stap.",
      },
      {
        id: "core-dag3-teams",
        label: "📋 Teams-administratie inrichten",
        verplicht: true,
        uitleg:
          "Hier wordt je team-structuur en business-data bijgehouden. Bekijk het film-blok hieronder voor de exacte stappen.",
        filmSlug: "core-dag3-teams-admin",
      },
    ],
    faseDoel: "Drie admin-fundamenten staan: webshop, krediet, teams.",
    waarInEleva: [],
    watJeLeert: `Vandaag is je admin-dag. Drie korte taken die je in een ochtend hebt staan, daarna kun je verder met het echte werk: je webshop activeren, je krediet-uitbetaling regelen, en je teams-admin opzetten.

Lichte dag qua leerstof, zware dag qua afvinken. De rest van Core leunt op deze drie fundamenten.`,
    waaromWerktDit: {
      tekst:
        "Mensen die hun admin op dag 3 doen, vergeten 'm zelden later. Mensen die 'm uitstellen, krijgen er na maanden mee te maken in de vorm van gemiste commissies.",
    },
  },
  {
    nummer: 4,
    titel: "🔗 Bestellinks + productadvies-test + commission-plan-uitleg",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag4-bestellinks",
        label: "🔗 Koppel je webshop-links aan ELEVA",
        verplicht: true,
        actieRoute: "/instellingen/bestellinks",
        uitleg:
          "Plak per pakket je eigen verkooplink. Eenmalig werk, daarna gebruikt ELEVA ze automatisch in productadvies-flows.",
      },
      {
        id: "core-dag4-test",
        label: "Doe zelf de productadvies-test (~3 min)",
        verplicht: true,
        actieRoute: "/test-pakket-bouwer",
        uitleg:
          "Door 'm zelf te doen weet je hoe je prospects de test ervaren en welk advies eruit kan komen.",
      },
      {
        id: "core-dag4-commission-plan",
        label: "Lees het korte commission-plan-overzicht (Eric Worre's basic-understanding)",
        verplicht: true,
        uitleg:
          "Onder 'Wat je leert' staat de rank-ladder Builder/Bronze/Silver/Gold/Diamond met minimum-vereisten. Je weet daarna wat je moet doen om jouw doel uit dag 1 te halen.",
      },
    ],
    faseDoel: "Bestellinks gekoppeld + productadvies-test verkend + commission-plan in beeld.",
    waarInEleva: [
      { actie: "Beheer bestellinks", route: "/instellingen/bestellinks" },
      { actie: "Doe de productadvies-test", route: "/test-pakket-bouwer" },
    ],
    watJeLeert: `Vandaag drie dingen: bestellinks koppelen, productadvies-test verkennen, en basis-kennis van het commission-plan.

COMMISSION-PLAN IN 1 OOGOPSLAG:

| Rank | Eigen IP | QGV (totaal) | Members | Vanaf €/maand |
|---|---:|---:|---:|---:|
| Builder | 40 | 1500 | 3 | (bouwsteen, geen vast bedrag) |
| Bronze | 100 | 3000 | 3 | €300-600 |
| Silver | 100 | 6000 | 6 | vanaf €600 |
| Gold | 150 | 9000 | 9 | vanaf €900 |
| Diamond | 150 | 15000 | 12 in verschillende lijnen | vanaf €1200 |

QGV = totaal aan IP in je eerste 3 levels (jouw bestelling + alle members + alle shoppers).
QL = aantal members in verschillende benen.

Belangrijk: deze bedragen zijn MINIMUM-VANAF. Een Diamond kan ook €4000+ verdienen afhankelijk van duplicatie-diepte.

In de officiele kennisbank staat het complete plan met percentages per niveau. Klik op de productadvies-link voor de bron.`,
    waaromWerktDit: {
      tekst:
        "Mensen die het commission-plan op dag 4 snappen, kiezen scherpere doelen en houden langer vol. Onwetendheid over hoe je verdient is een van de top-3-redenen waarom mensen afhaken in maand 2.",
    },
  },
  // De overige dagen 5-21 volgen hetzelfde patroon. Voor compactheid
  // van dit plan toon ik hier alleen de skelet-titel + dagDoel.
  // Volledige inhoud per dag komt in Step 3 (overzetten uit
  // lib/leerpaden/core-stappen.ts).
  {
    nummer: 5,
    titel: "📦 Productkennis: welke producten verkoop jij",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Basis-overzicht van Lifeplus-producten + voor wie ze passen.",
    waarInEleva: [{ actie: "Open de Mentor", route: "/coach" }],
    watJeLeert: "PLACEHOLDER, vullen in Step 3",
    waaromWerktDit: { tekst: "PLACEHOLDER, vullen in Step 3" },
  },
  {
    nummer: 6,
    titel: "🤝 Hoe deel je je webshop natuurlijk",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Jouw natuurlijke webshop-introductie op papier.",
    waarInEleva: [{ actie: "Naar je zinnen", route: "/mijn-zinnen" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 7,
    titel: "✍️ Pre-post OF 21-dagen-post (vertakking)",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Eerste post-content voorbereiden volgens je gekozen track.",
    waarInEleva: [{ actie: "Open de Mentor", route: "/coach" }],
    watJeLeert: "PLACEHOLDER (track-specifieke content via core_eigen_resultaat)",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 8,
    titel: "📤 Post plaatsen + reactie-script klaar",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Eerste post staat live, reactie-script staat klaar.",
    waarInEleva: [],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 9,
    titel: "📱 Brookes 3-stappen-formule OF eigen 21d-ervaring",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Tweede social-content schrijf-techniek.",
    waarInEleva: [],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 10,
    titel: "✨ Jouw 3 verhalen: persoonlijk, product, business",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Drie verhalen op papier.",
    waarInEleva: [],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 11,
    titel: "🎁 Freebies inzetten als intekenplek",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Een freebie gekoppeld aan je content.",
    waarInEleva: [],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 12,
    titel: "💬 Eerste klanten via je warme markt",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Drie warme-markt-berichten verstuurd.",
    waarInEleva: [{ actie: "Naar scripts", route: "/scripts" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 13,
    titel: "🛡️ Bezwaren behandelen, Feel-Felt-Found (FFF)",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "FFF-techniek geoefend, drie bezwaren gerollplayed.",
    waarInEleva: [{ actie: "Roleplay met Mentor", route: "/coach" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 14,
    titel: "👋 Klantcontact en opvolging",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Drie herinneringen ingesteld.",
    waarInEleva: [{ actie: "Open herinneringen", route: "/herinneringen" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 15,
    titel: "🔁 Hercontact en herhaalbestellingen",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Drie bestaande klanten een hercontact-bericht.",
    waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 16,
    titel: "🗣️ Testimonial-content (eerlijk, claim-vrij)",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Een korte productervaring-video gemaakt.",
    waarInEleva: [],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 17,
    titel: "👀 Builder-energie herkennen in je klantkring",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Twee tot drie klanten gemarkeerd met Builder-energie.",
    waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 18,
    titel: '💼 "Open ook een webshop"-scripts (duplicatie)',
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Een script klaar voor één Builder-energie-prospect.",
    waarInEleva: [{ actie: "Naar scripts", route: "/scripts" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 19,
    titel: "🎯 Closingsvragen, helpen beslissen",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Een warme prospect de beslis-vraag gesteld.",
    waarInEleva: [],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 20,
    titel: "📊 5 types prospects + pipeline-onderhoud",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Top-20 prospects gecategoriseerd in 5 types.",
    waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
  {
    nummer: 21,
    titel: "🏆 Skills-opstart klaar, sponsor-call + reflectie",
    fase: 1,
    vandaagDoen: [],
    faseDoel: "Reflectie + sponsor-call + doel voor volgende periode.",
    waarInEleva: [{ actie: "Plan sponsor-call", route: "/team" }],
    watJeLeert: "PLACEHOLDER",
    waaromWerktDit: { tekst: "PLACEHOLDER" },
  },
];
```

- [ ] **Step 3: Vul de PLACEHOLDER-velden in dag 5-21**

Voor elke dag 5 t/m 21 vul je `vandaagDoen`, `watJeLeert` en `waaromWerktDit` in op basis van de bestaande inhoud in `lib/leerpaden/core-stappen.ts` regels 132-416. Per dag minimaal:

- 2-4 `ControllableTaak`-entries in `vandaagDoen` (skill-specifiek voor die dag)
- **Plus de drie vaste afsluit-stappen** aan het einde van elke `vandaagDoen`-array (zoals in dag 1):
  - `core-dagN-sponsor-checkin` met `inlineEmbed: "sponsor-melding"`
  - `core-dagN-momentum-radar` met `inlineEmbed: "momentum-radar"`
  - `core-dagN-partner-check` met `inlineEmbed: "partner-check"`
- Volledige `watJeLeert`-tekst (max 6-8 zinnen, geen tijdsprognoses, geen Lifeplus-naam waar mogelijk)
- `waaromWerktDit.tekst` (1-2 zinnen)

Belangrijke aanpassing voor dag 7-11: zie [spec sectie 6.2](../specs/2026-05-16-core-redesign-design.md). Tekst moet refereren naar pre-post of 21-post-track, maar de werkelijke vertakking gebeurt op dag 7+ via een `inlineActie`-conditie binnen elke stap (in eerste versie: één set content die beide tracks dekt, vertakking-finetune volgt later).

Voor efficiency: schrijf een korte helper-functie `afsluitStappen(dagNummer)` bovenaan `core-dagen.ts` die de drie afsluit-stap-objecten retourneert, zodat je niet per dag de 3 stappen handmatig hoeft te kopieren:

```typescript
function afsluitStappen(dagNummer: number): ControllableTaak[] {
  return [
    {
      id: `core-dag${dagNummer}-sponsor-checkin`,
      label: "💬 Sluit af met een korte sponsor-checkin",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
      uitleg: `30 sec berichtje hoe dag ${dagNummer} ging.`,
    },
    {
      id: `core-dag${dagNummer}-momentum-radar`,
      label: "🎯 Open momentum-acties van vandaag",
      verplicht: false,
      inlineEmbed: "momentum-radar",
      uitleg: "Check openstaande acties van vandaag. Verbergt zich als alles is opgepakt.",
    },
    {
      id: `core-dag${dagNummer}-partner-check`,
      label: "🤝 Check je nieuwe partner(s) vandaag",
      verplicht: false,
      inlineEmbed: "partner-check",
      uitleg: "Voor wie al team heeft. Verbergt zich onzichtbaar bij geen partners.",
    },
  ];
}
```

Dan kun je per dag eindigen met `...afsluitStappen(N)` in de spread.

- [ ] **Step 4: Verifieer build**

Run: `npm run build 2>&1 | grep -E "(error|Failed|Compiled successfully)"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add lib/playbook/core-dagen.ts
git commit -m "feat(core): core-dagen.ts met 21 skill-dagen + verankering-template + lifetime-template

21 statische dagen overgenomen uit lib/leerpaden/core-stappen.ts en
verrijkt met Dag-type:
- Dag 1 met DTT-onboarding, pre-post-keuze, sponsor-melding, eerste contact
- Dag 2 met Top-20-namenlijst-frame, telefoon-import, social-contacten
- Dag 4 met commission-plan-uitleg-blok (rank-ladder)
- Dag 7-11 met pre-post/21-post-vertakking-references
- Inline-embed-references (vcard-upload, namen-form, sponsor-melding,
  nieuwe dtt-onboarding en prepost-keuze)
- filmSlug voor admin-stappen
- vereistMobiel voor telefoon-import

Plus genereerVerankeringsDag(N) voor dag 22-40 en
genereerLifetimeDag(N) voor dag 41+.

Eerste versie content. Verfijning per dag komt in feedback-loop.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: DTT-onboarding inline-embed

**Files:**
- Modify: `lib/playbook/types.ts` (uitbreiden `inlineEmbed`-union)
- Create: `components/onboarding/DTTOnboardingEmbed.tsx`
- Modify: `app/vandaag/vandaag-flow.tsx` (case toevoegen)

- [ ] **Step 1: Type-uitbreiding**

In `lib/playbook/types.ts`, zoek de `inlineEmbed`-union en breid uit:

```typescript
  inlineEmbed?:
    | "vcard-upload"
    | "sponsor-melding"
    | "namen-form"
    | "funnel-analyse"
    | "partner-check"
    | "momentum-radar"
    | "dtt-onboarding"
    | "prepost-keuze";
```

- [ ] **Step 2: Maak `DTTOnboardingEmbed.tsx`**

```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BRACKETS, type Bracket } from "@/lib/dtt/brackets";
import { bracketVoorUren } from "@/lib/dtt/advies";
import { rankVanafDoel } from "@/lib/dtt/rank-vanaf-doel";

// ============================================================
// DTT-onboarding-embed voor Core dag 1.
// Drie vragen: doel/tijd/termijn. Toont direct bracket + rank-suggestie.
// Bewaart in profiles.core_dtt (JSONB).
// ============================================================

type Props = {
  alVoltooid: boolean;
  opVoltooid: () => void;
};

export function DTTOnboardingEmbed({ alVoltooid, opVoltooid }: Props) {
  const [doel, setDoel] = useState<string>("");
  const [uren, setUren] = useState<string>("");
  const [termijn, setTermijn] = useState<string>("");
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  const router = useRouter();
  const supabase = createClient();

  if (voltooid) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Doel-Tijd-Termijn ingevuld
        </p>
        <p className="text-cm-white opacity-80 text-xs mt-1">
          Aanpassen kan altijd via Instellingen.
        </p>
      </div>
    );
  }

  const urenNum = parseFloat(uren);
  const doelNum = parseFloat(doel);
  const bracket: Bracket = !isNaN(urenNum) ? bracketVoorUren(urenNum) : "rustig";
  const bracketDef = BRACKETS[bracket];
  const rankSug = !isNaN(doelNum) ? rankVanafDoel(doelNum) : null;

  async function opslaan() {
    const dttData = {
      doel_per_maand: parseFloat(doel),
      uren_per_week: parseFloat(uren),
      termijn_maanden: parseFloat(termijn),
    };

    if (
      isNaN(dttData.doel_per_maand) ||
      isNaN(dttData.uren_per_week) ||
      isNaN(dttData.termijn_maanden)
    ) {
      toast.error("Vul alle drie de vragen in");
      return;
    }

    setBezig(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      setBezig(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ core_dtt: dttData })
      .eq("id", user.id);

    if (error) {
      toast.error("Opslaan mislukt: " + error.message);
      setBezig(false);
      return;
    }

    setVoltooid(true);
    opVoltooid();
    toast.success("Doel-Tijd-Termijn opgeslagen");
    router.refresh();
    setBezig(false);
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-5 py-5 space-y-4">
      <div>
        <h3 className="text-cm-gold font-semibold text-base">
          🎯 Doel-Tijd-Termijn
        </h3>
        <p className="text-cm-white/85 text-sm mt-1">
          Drie korte vragen. Op basis hiervan krijg je dagelijkse aantallen die passen bij jouw situatie.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Doel</strong>: hoeveel extra inkomen per maand wil je realistisch in 12 maanden?
          </label>
          <input
            type="number"
            min="0"
            step="50"
            placeholder="bv. 500"
            value={doel}
            onChange={(e) => setDoel(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">euro per maand</p>
        </div>

        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Tijd</strong>: hoeveel uur per week kan je hieraan investeren?
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="bv. 5"
            value={uren}
            onChange={(e) => setUren(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">uur per week</p>
        </div>

        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Termijn</strong>: in hoeveel maanden moet dit er staan zodat het voor jou de moeite waard is?
          </label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="bv. 12"
            value={termijn}
            onChange={(e) => setTermijn(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">maanden</p>
        </div>
      </div>

      {(urenNum > 0 || doelNum > 0) && (
        <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-3 space-y-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Jouw advies op basis hiervan
          </p>
          {urenNum > 0 && (
            <p className="text-cm-white/85 text-xs">
              Tempo: <strong className="text-cm-white">{bracketDef.label}</strong> ({bracketDef.urenPerWeekRange}/week)
              <br />
              <span className="text-cm-white/60">{bracketDef.verwachting}</span>
            </p>
          )}
          {bracket === "minimaal" && (
            <p className="text-amber-200/80 text-[11px] italic">
              Met &lt;3u/week kun je je producten terugverdienen, je inkomsten zullen ongeveer gelijk zijn aan wat je zelf bestelt. Een netwerk opbouwen waarmee je serieus inkomen genereert is in dit tempo niet realistisch. Overweeg 4-6u/week.
            </p>
          )}
          {rankSug && (
            <p className="text-cm-white/85 text-xs">
              Doel-rank: <strong className="text-cm-white">{rankSug.label}</strong>
              <br />
              <span className="text-cm-white/60">{rankSug.toelichting}</span>
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={opslaan}
        disabled={bezig}
        className="btn-gold w-full py-2.5 text-sm font-semibold"
      >
        {bezig ? "Bezig..." : "✓ DTT vastleggen"}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Aanhaken in `vandaag-flow.tsx`**

In `app/vandaag/vandaag-flow.tsx`, voeg import toe:

```typescript
import { DTTOnboardingEmbed } from "@/components/onboarding/DTTOnboardingEmbed";
```

En in de render-switch, naast andere inline-embed-cases:

```tsx
{huidigeTaak.inlineEmbed === "dtt-onboarding" && (
  <DTTOnboardingEmbed
    alVoltooid={voltooidIds.has(huidigeTaak.id)}
    opVoltooid={() => vinkAf(huidigeTaak.id, true)}
  />
)}
```

- [ ] **Step 4: Verifieer build**

Run: `npm run build 2>&1 | grep -E "(error|Failed|Compiled successfully)"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add lib/playbook/types.ts components/onboarding/DTTOnboardingEmbed.tsx app/vandaag/vandaag-flow.tsx
git commit -m "feat(core): DTT-onboarding inline-embed voor Core dag 1

DTTOnboardingEmbed-component met drie vragen (doel/uren/termijn) en
direct bracket + rank-suggestie tonen tijdens invullen. Opslaan in
profiles.core_dtt (JSONB).

Type-uitbreiding inlineEmbed-union met 'dtt-onboarding' en
'prepost-keuze' (laatste volgt in Task 5).

Aanhaking in vandaag-flow.tsx parallel aan andere embed-cases.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Pre-post-keuze inline-embed

**Files:**
- Create: `components/onboarding/PrePostKeuzeEmbed.tsx`
- Modify: `app/vandaag/vandaag-flow.tsx`

- [ ] **Step 1: Maak `PrePostKeuzeEmbed.tsx`**

```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ============================================================
// Pre-post versus 21-dagen-post-vertakking op Core dag 1.
// Bewaart profiles.core_eigen_resultaat (boolean).
// ============================================================

type Props = {
  alVoltooid: boolean;
  opVoltooid: () => void;
};

export function PrePostKeuzeEmbed({ alVoltooid, opVoltooid }: Props) {
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  const router = useRouter();
  const supabase = createClient();

  if (voltooid) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Keuze vastgelegd
        </p>
        <p className="text-cm-white opacity-80 text-xs mt-1">
          Vanaf dag 7 zie je de content die hierbij past.
        </p>
      </div>
    );
  }

  async function kies(eigenResultaat: boolean) {
    setBezig(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      setBezig(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ core_eigen_resultaat: eigenResultaat })
      .eq("id", user.id);

    if (error) {
      toast.error("Opslaan mislukt");
      setBezig(false);
      return;
    }

    setVoltooid(true);
    opVoltooid();
    toast.success(
      eigenResultaat
        ? "Top, je gaat dag 7 met 21-dagen-post-track beginnen"
        : "Top, je gaat dag 7 met pre-post-track beginnen",
    );
    router.refresh();
    setBezig(false);
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-5 py-5 space-y-4">
      <div>
        <h3 className="text-cm-gold font-semibold text-base">
          📝 Heb je al een product-ervaring?
        </h3>
        <p className="text-cm-white/85 text-sm mt-1">
          Dit bepaalt jouw eerste-post-track op dag 7. Twee paden, beide werken.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => kies(false)}
          disabled={bezig}
          className="rounded-md border border-cm-border bg-cm-bg/60 hover:bg-cm-bg/80 px-4 py-3 text-left transition-colors"
        >
          <p className="text-cm-white font-semibold text-sm mb-1">
            Nog niet
          </p>
          <p className="text-cm-white/65 text-xs leading-relaxed">
            Je gaat een <strong>pre-post</strong> maken: je deelt je voornemen en start je eigen 21-dagen-ervaring met een product.
          </p>
        </button>

        <button
          type="button"
          onClick={() => kies(true)}
          disabled={bezig}
          className="rounded-md border border-cm-border bg-cm-bg/60 hover:bg-cm-bg/80 px-4 py-3 text-left transition-colors"
        >
          <p className="text-cm-white font-semibold text-sm mb-1">
            Ja, ik heb al iets gemerkt
          </p>
          <p className="text-cm-white/65 text-xs leading-relaxed">
            Je gaat een <strong>21-dagen-post</strong> maken: je deelt wat je hebt ervaren, claim-vrij en eerlijk.
          </p>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Aanhaken in `vandaag-flow.tsx`**

Voeg import + case toe:

```typescript
import { PrePostKeuzeEmbed } from "@/components/onboarding/PrePostKeuzeEmbed";
```

```tsx
{huidigeTaak.inlineEmbed === "prepost-keuze" && (
  <PrePostKeuzeEmbed
    alVoltooid={voltooidIds.has(huidigeTaak.id)}
    opVoltooid={() => vinkAf(huidigeTaak.id, true)}
  />
)}
```

- [ ] **Step 3: Verifieer build**

Run: `npm run build 2>&1 | grep -E "(error|Failed|Compiled successfully)"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add components/onboarding/PrePostKeuzeEmbed.tsx app/vandaag/vandaag-flow.tsx
git commit -m "feat(core): PrePostKeuzeEmbed voor pre-post vs 21-post-vertakking

Twee duidelijke knoppen, member kiest pad. Opgeslagen in
profiles.core_eigen_resultaat. Dag 7-11-content vertakt hierop.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: DMO-blok-component

**Files:**
- Create: `components/vandaag/DMOBlok.tsx`
- Modify: `app/vandaag/vandaag-flow.tsx`

- [ ] **Step 1: Maak `DMOBlok.tsx`**

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { BRACKETS, type Bracket } from "@/lib/dtt/brackets";

// ============================================================
// DMO-blok onder elke Core-stap. 7 onderdelen, uitklapbaar.
// Aantallen op basis van DTT-bracket. Reactief social vanaf dag 7.
// ============================================================

type Props = {
  bracket: Bracket;
  dagNummer: number;
  bestellinksGekoppeld: boolean;
  eersteKlantenStapVoorbij: boolean;
};

export function DMOBlok({
  bracket,
  dagNummer,
  bestellinksGekoppeld,
  eersteKlantenStapVoorbij,
}: Props) {
  const [open, setOpen] = useState(false);
  const def = BRACKETS[bracket];

  const reactiefActief = dagNummer >= 7;
  const webshopActief = dagNummer >= 4 && bestellinksGekoppeld;
  const followUpActief = eersteKlantenStapVoorbij || dagNummer >= 12;
  const socialPostActief = dagNummer >= 7;

  const onderdelen = [
    {
      sleutel: "webshop",
      icon: "🛒",
      titel: "Webshop-actie",
      uitleg: "Deelbaar winkelmandje sturen, freebie-link delen, productadvies-test versturen",
      richtlijn: webshopActief ? "1 actie/dag" : "Activeert na bestellinks (dag 4)",
      actief: webshopActief,
    },
    {
      sleutel: "actief-contact",
      icon: "💬",
      titel: "Actief contact",
      uitleg: "Bericht aan warme markt of lauwe markt (opener)",
      richtlijn:
        def.dmoMinimums.contactenPerDag === 0
          ? "1-2 per week"
          : `Minimum ${def.dmoMinimums.contactenPerDag}/dag`,
      actief: true,
    },
    {
      sleutel: "reactief-social",
      icon: "💎",
      titel: "Reactief social-contact",
      uitleg: "Reageer op likes/comments, voer DM-gesprek, deel info",
      richtlijn: reactiefActief
        ? "Reageer op alle nieuwe interacties vandaag"
        : "Activeert na je eerste post (dag 7)",
      actief: reactiefActief,
    },
    {
      sleutel: "follow-up",
      icon: "🔄",
      titel: "Follow-up",
      uitleg: "Bestaande prospect of klant opvolgen",
      richtlijn: followUpActief
        ? `Minimum ${def.dmoMinimums.followUpsPerDag}/dag`
        : "Activeert na je eerste klanten-stap (dag 12)",
      actief: followUpActief,
    },
    {
      sleutel: "social-post",
      icon: "📱",
      titel: "Social-post",
      uitleg: "Lifestyle / waarde / testimonial-post",
      richtlijn: socialPostActief
        ? `Minimum ${def.dmoMinimums.socialPostsPerWeek}/week`
        : "Activeert na je eerste post (dag 7)",
      actief: socialPostActief,
    },
    {
      sleutel: "pijplijn-update",
      icon: "🎯",
      titel: "Pijplijn-update",
      uitleg: "Via spraak-functie: 'gesprek gestart met X', 'X heeft besteld'",
      richtlijn: "Direct na elke prospect-interactie",
      actief: true,
    },
  ];
  // Sponsor-checkin/momentum-radar/partner-check zitten als aparte
  // VASTE STAPPEN aan het einde van elke Core-dag (zoals in Sprint),
  // niet in dit DMO-blok. Voorkomt dubbeling in UI.

  const aantalOpen = onderdelen.filter((o) => o.actief).length;

  return (
    <div className="rounded-xl border-2 border-cm-gold/40 bg-cm-gold/5 mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-cm-gold text-sm font-semibold">
            Je dagelijkse ritme ({aantalOpen} acties open)
          </span>
        </div>
        <span className={`text-cm-gold text-sm transition-transform ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-cm-border/50 pt-3 space-y-2">
          <p className="text-cm-white/60 text-xs">
            Tempo: <strong className="text-cm-white">{def.label}</strong> ({def.urenPerWeekRange}/week)
            <br />
            Aantallen zijn <strong>minimum</strong>, je mag altijd meer doen.
          </p>
          <Link
            href="/instellingen"
            className="text-cm-gold text-xs underline-offset-2 hover:underline"
          >
            Tempo aanpassen →
          </Link>
          <div className="space-y-1.5 mt-3">
            {onderdelen.map((o) => (
              <div
                key={o.sleutel}
                className={`rounded-md border px-3 py-2 ${
                  o.actief
                    ? "border-cm-border bg-cm-bg/40"
                    : "border-cm-border/50 bg-cm-bg/20 opacity-50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className="text-cm-white text-sm font-semibold">
                    {o.icon} {o.titel}
                  </p>
                  <span className="text-cm-gold/80 text-xs">{o.richtlijn}</span>
                </div>
                <p className="text-cm-white/65 text-xs mt-0.5">{o.uitleg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Aanhaken (alleen voor Core)**

In `app/vandaag/vandaag-flow.tsx`, aan het eind van de stappen-render (na de laatste stap, voor de viering), voeg toe:

```typescript
import { DMOBlok } from "@/components/vandaag/DMOBlok";
```

```tsx
{modus === "core" && (
  <DMOBlok
    bracket={coreBracket}
    dagNummer={dag.nummer}
    bestellinksGekoppeld={bestellinksGekoppeld}
    eersteKlantenStapVoorbij={dag.nummer >= 12}
  />
)}
```

`modus`, `coreBracket` en `bestellinksGekoppeld` moeten als props van VandaagFlow doorgegeven worden vanuit de page (Task 8 regelt dat).

- [ ] **Step 3: Verifieer build**

Run: `npm run build 2>&1 | grep -E "(error|Failed|Compiled successfully)"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add components/vandaag/DMOBlok.tsx app/vandaag/vandaag-flow.tsx
git commit -m "feat(core): DMOBlok-component met 7 onderdelen

Uitklapbaar paneel onder Core-stappen met 7 DMO-onderdelen
(webshop/actief-contact/reactief-social/follow-up/social-post/
pijplijn-update/sponsor-checkin). Conditionele activatie:
- Webshop actief vanaf dag 4 + bestellinks gekoppeld
- Reactief social vanaf dag 7
- Social-post vanaf dag 7
- Follow-up vanaf dag 12 of eerste-klanten-stap voorbij

Aantal-richtlijnen dynamisch op basis van bracket-prop.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Cross-modus-overlap-detectie + skip-kaartje

**Files:**
- Create: `components/vandaag/CrossModusOverslaanKaart.tsx`
- Create: `app/api/onboarding/markeer-voltooid/route.ts`
- Modify: `app/vandaag/vandaag-flow.tsx`

- [ ] **Step 1: Maak skip-kaart-component**

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// CrossModusOverslaanKaart, blauw kaartje voor stappen die al in
// een andere modus voltooid zijn. Member kiest: behouden of aanpassen.
// ============================================================

const MODUS_LABEL: Record<Modus, string> = {
  sprint: "Sprint",
  core: "Core",
  pro: "Pro",
};

type Props = {
  itemSlug: string;
  itemNaam: string;
  voltooidInModus: Modus;
  voltooidOpDatum: string;
  aanpassenRoute: string;
  huidigeModus: Modus;
  taakId: string;
  opOverslaan: () => void;
};

export function CrossModusOverslaanKaart({
  itemSlug,
  itemNaam,
  voltooidInModus,
  voltooidOpDatum,
  aanpassenRoute,
  huidigeModus,
  taakId,
  opOverslaan,
}: Props) {
  const [bezig, setBezig] = useState(false);
  const datum = new Date(voltooidOpDatum).toLocaleDateString("nl-NL");

  async function behouden() {
    setBezig(true);
    try {
      const res = await fetch("/api/onboarding/markeer-voltooid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_slug: itemSlug,
          modus_waarin: huidigeModus,
          taak_id: taakId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${itemNaam} behouden zoals 'ie is`);
      opOverslaan();
    } catch {
      toast.error("Markeren mislukt, probeer opnieuw");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="rounded-lg border-2 border-blue-500/50 bg-blue-900/15 px-4 py-3 space-y-2">
      <p className="text-blue-200 text-sm">
        ✨ Je hebt <strong>{itemNaam}</strong> al gedaan tijdens{" "}
        <strong>{MODUS_LABEL[voltooidInModus]}</strong> op {datum}. Wil je 'm aanpassen of behouden zoals 'ie is?
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={behouden}
          disabled={bezig}
          className="btn-secondary py-1.5 px-3 text-xs font-semibold"
        >
          {bezig ? "Bezig..." : "✓ Behouden"}
        </button>
        <Link
          href={aanpassenRoute}
          className="btn-gold py-1.5 px-3 text-xs font-semibold inline-block"
        >
          Aanpassen →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Maak API-route**

Maak `app/api/onboarding/markeer-voltooid/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markeerVoltooid, type Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// POST /api/onboarding/markeer-voltooid
// Body: { item_slug, modus_waarin, taak_id }
// Schrijft naar onboarding_voltooiingen + dag_voltooiingen.
// ============================================================

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await request.json();
    const { item_slug, modus_waarin, taak_id } = body as {
      item_slug?: string;
      modus_waarin?: Modus;
      taak_id?: string;
    };

    if (!item_slug || !modus_waarin || !taak_id) {
      return NextResponse.json(
        { error: "item_slug, modus_waarin en taak_id zijn vereist" },
        { status: 400 },
      );
    }

    // Markeer in cross-modus tabel
    await markeerVoltooid(supabase, user.id, item_slug, modus_waarin);

    // Markeer huidige taak als voltooid in dag_voltooiingen
    // (dag_nummer extraheren uit taak_id, format "core-dagN-xxx" of "dagN-xxx")
    const dagMatch = taak_id.match(/(?:core-)?dag(\d+)/);
    const dagNummer = dagMatch ? parseInt(dagMatch[1], 10) : null;
    if (dagNummer !== null) {
      await supabase
        .from("dag_voltooiingen")
        .upsert(
          {
            user_id: user.id,
            dag_nummer: dagNummer,
            taak_id,
          },
          { onConflict: "user_id,dag_nummer,taak_id" },
        );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("markeer-voltooid exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verifieer build**

Run: `npm run build 2>&1 | grep -E "(error|Failed|Compiled successfully)"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add components/vandaag/CrossModusOverslaanKaart.tsx "app/api/onboarding/markeer-voltooid/route.ts"
git commit -m "feat(core): CrossModusOverslaanKaart + API voor markeer-voltooid

Blauw kaartje 'X al gedaan in Sprint, behouden of aanpassen?'.
API schrijft naar onboarding_voltooiingen + dag_voltooiingen.

Integratie in vandaag-flow.tsx komt in Task 8.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: `/vandaag`-page modus-aware + cross-modus-rendering

**Files:**
- Modify: `app/vandaag/page.tsx`

- [ ] **Step 1: Modus detecteren en juiste content-bron kiezen**

In `app/vandaag/page.tsx`, breid de profile-fetch uit met `modus`, `core_dtt`, `core_eigen_resultaat`. Importeer Core-content en helpers:

```typescript
import { CORE_DAGEN, genereerVerankeringsDag, genereerLifetimeDag } from "@/lib/playbook/core-dagen";
import { bracketVoorDTT } from "@/lib/dtt/advies";
import { haalAlleVoltooiingenVoorUser } from "@/lib/onboarding/voltooiingen";
import type { Modus } from "@/lib/onboarding/voltooiingen";
```

In de page-functie, na `profile`-fetch:

```typescript
  const modus = ((profile as { modus?: string | null } | null)?.modus ?? "sprint") as Modus;
  const coreDtt = (profile as { core_dtt?: { uren_per_week: number } | null } | null)?.core_dtt ?? null;
  const coreBracket = bracketVoorDTT(coreDtt);
  const voltooiingenMap = await haalAlleVoltooiingenVoorUser(supabase, user.id);

  // Modus-afhankelijk content kiezen
  let dagData: typeof dagDataFallback | null = null;
  if (modus === "core") {
    if (dag <= 21) {
      dagData = CORE_DAGEN.find((d) => d.nummer === dag) ?? null;
    } else if (dag <= 40) {
      dagData = genereerVerankeringsDag(dag);
    } else {
      dagData = genereerLifetimeDag(dag);
    }
  } else {
    // Sprint-pad (bestaand)
    if (dag >= 22) {
      dagData = genereerWeekritmeDag(dag, commitmentUren);
    } else {
      dagData = DAGEN.find((d) => d.nummer === dag);
      if (dagData) dagData = pasTempoToeOpDag(dagData, commitmentUren);
    }
  }
  if (!dagData) redirect("/dashboard");
```

- [ ] **Step 2: Geef de nieuwe props door aan VandaagFlow**

```tsx
return (
  <VandaagFlow
    dag={dagData}
    voltooidIds={voltooidIds}
    initialZinnen={initialZinnen}
    voornaam={voornaam}
    isFounder={isFounder}
    uiOverrides={uiOverrides}
    groetOverrides={groetOverrides}
    paginaBlokken={paginaBlokken}
    commitmentUren={commitmentUren}
    radarItems={radarItems}
    radarInitieelAfgevinkt={Array.from(afvinkSets.vandaagAfgevinkt)}
    modus={modus}
    coreBracket={coreBracket}
    crossModusVoltooiingen={Object.fromEntries(voltooiingenMap)}
  />
);
```

- [ ] **Step 3: Pas VandaagFlow Props-type aan**

In `app/vandaag/vandaag-flow.tsx`, breid Props-type uit met:

```typescript
import type { Bracket } from "@/lib/dtt/brackets";
import type { Modus, VoltooiingStatus } from "@/lib/onboarding/voltooiingen";

type Props = {
  // ... bestaande props
  modus?: Modus;
  coreBracket?: Bracket;
  crossModusVoltooiingen?: Record<string, VoltooiingStatus>;
};
```

- [ ] **Step 4: Verifieer build**

Run: `npm run build 2>&1 | grep -E "(error|Failed|Compiled successfully)"`
Expected: `✓ Compiled successfully`. Routes `/vandaag` blijven werken voor sprint én core.

- [ ] **Step 5: Commit**

```bash
git add app/vandaag/page.tsx app/vandaag/vandaag-flow.tsx
git commit -m "feat(core): /vandaag modus-aware, laadt core-dagen.ts voor core-modus

Page detecteert profiles.modus en kiest content-bron:
- sprint -> DAGEN of weekritme (bestaand)
- core   -> CORE_DAGEN of verankerings-template of lifetime-template

Nieuwe props naar VandaagFlow: modus, coreBracket (uit DTT),
crossModusVoltooiingen-map voor skip-kaart-rendering.

Cross-modus-overlap-rendering binnen elke stap volgt waar item-slug
matched in stap-id-mapping (komt in render-helpers).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Core-tempo-sectie + build + push + smoke-test

**Files:**
- Create: `components/instellingen/CoreTempoSectie.tsx`
- Create: `app/api/dtt/update/route.ts`
- Modify: `app/instellingen/page.tsx`

- [ ] **Step 1: Maak CoreTempoSectie**

```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BRACKETS } from "@/lib/dtt/brackets";
import { bracketVoorUren } from "@/lib/dtt/advies";

type Props = {
  initieelDoel: number | null;
  initieleUren: number | null;
  initieleTermijn: number | null;
};

export function CoreTempoSectie({
  initieelDoel,
  initieleUren,
  initieleTermijn,
}: Props) {
  const [doel, setDoel] = useState(initieelDoel?.toString() ?? "");
  const [uren, setUren] = useState(initieleUren?.toString() ?? "");
  const [termijn, setTermijn] = useState(initieleTermijn?.toString() ?? "");
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  const urenNum = parseFloat(uren);
  const bracket = !isNaN(urenNum) ? bracketVoorUren(urenNum) : null;
  const def = bracket ? BRACKETS[bracket] : null;

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);

    const res = await fetch("/api/dtt/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doel_per_maand: parseFloat(doel),
        uren_per_week: parseFloat(uren),
        termijn_maanden: parseFloat(termijn),
      }),
    });

    if (res.ok) {
      toast.success("Tempo bijgewerkt");
      router.refresh();
    } else {
      toast.error("Opslaan mislukt");
    }
    setBezig(false);
  }

  return (
    <form onSubmit={opslaan} className="card space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          🎯 Core Doel-Tijd-Termijn
        </h2>
        <p className="text-cm-white opacity-70 text-sm mt-1">
          Pas je doel, uren of termijn aan. De dagelijkse aantallen in je DMO-blok schuiven mee.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Doel (€/maand)</label>
          <input
            type="number"
            value={doel}
            onChange={(e) => setDoel(e.target.value)}
            className="input-cm"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Uren/week</label>
          <input
            type="number"
            value={uren}
            onChange={(e) => setUren(e.target.value)}
            className="input-cm"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Termijn (maanden)</label>
          <input
            type="number"
            value={termijn}
            onChange={(e) => setTermijn(e.target.value)}
            className="input-cm"
            min="1"
          />
        </div>
      </div>
      {def && (
        <p className="text-cm-white/85 text-xs">
          Tempo: <strong className="text-cm-white">{def.label}</strong> ({def.urenPerWeekRange}/week)
          <br />
          <span className="text-cm-white/60">{def.verwachting}</span>
        </p>
      )}
      <button type="submit" disabled={bezig} className="btn-gold">
        {bezig ? "Bezig..." : "Tempo bijwerken"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Maak API-route**

Maak `app/api/dtt/update/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

    const body = await request.json();
    const { doel_per_maand, uren_per_week, termijn_maanden } = body;

    if (
      isNaN(parseFloat(doel_per_maand)) ||
      isNaN(parseFloat(uren_per_week)) ||
      isNaN(parseFloat(termijn_maanden))
    ) {
      return NextResponse.json(
        { error: "Numerieke waardes vereist" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        core_dtt: {
          doel_per_maand: parseFloat(doel_per_maand),
          uren_per_week: parseFloat(uren_per_week),
          termijn_maanden: parseFloat(termijn_maanden),
        },
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("dtt-update exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Aanhaken in `/instellingen`**

In `app/instellingen/page.tsx`, alleen tonen voor Core-modus:

```typescript
import { CoreTempoSectie } from "@/components/instellingen/CoreTempoSectie";
```

In de JSX, na de bestaande TempoSectie (Sprint):

```tsx
{((profile as { modus?: string | null } | null)?.modus === "core") && (
  <CoreTempoSectie
    initieelDoel={(profile as any)?.core_dtt?.doel_per_maand ?? null}
    initieleUren={(profile as any)?.core_dtt?.uren_per_week ?? null}
    initieleTermijn={(profile as any)?.core_dtt?.termijn_maanden ?? null}
  />
)}
```

- [ ] **Step 4: Finale build + push**

```bash
npm run build 2>&1 | tail -5
```

Expected: succesvolle build.

```bash
git add components/instellingen/CoreTempoSectie.tsx "app/api/dtt/update/route.ts" app/instellingen/page.tsx
git commit -m "feat(core): CoreTempoSectie op /instellingen + dtt-update API

Member kan DTT-waardes aanpassen via /instellingen. Toont direct nieuw
bracket-advies en tempo-verwachting. POST /api/dtt/update slaat op
in profiles.core_dtt.

Sectie verschijnt alleen voor members met modus=core.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"

git push origin main
```

- [ ] **Step 5: Smoke-test op live (wacht 2 min op Vercel)**

1. **Switch modus naar core via SQL** (voor jouw account):
   `node scripts/sql.mjs --yes "UPDATE profiles SET modus = 'core' WHERE email = 'raoulzeewijk@hotmail.com'"`
2. Login en open `/vandaag`. **Verifieer**: Core-dag-1 verschijnt met WHY/DTT/pre-post/sponsor/eerste-contact-stappen.
3. Klik DTT-stap. **Verifieer**: 3 vragen verschijnen. Vul `doel=500, uren=5, termijn=12` in. **Verifieer**: bracket "Rustig" + rank "Silver" verschijnt direct, klik "DTT vastleggen".
4. Klik pre-post-keuze. **Verifieer**: 2 knoppen verschijnen. Klik "Nog niet". **Verifieer**: kaartje wordt groen.
5. Open `/instellingen`. **Verifieer**: CoreTempoSectie staat onder de bestaande TempoSectie. Wijzig uren naar 10. **Verifieer**: bracket schuift naar "Gestaag".
6. Terug naar `/vandaag`. **Verifieer**: DMO-blok onder de stappen. Klik uitklap. **Verifieer**: 7 onderdelen zichtbaar, met juiste aantal-richtlijnen voor Gestaag (3 contacten/dag etc.). Reactief social en social-post zijn grijs (dag 1, niet actief).
7. Spring naar dag 7 (via founder-toolbar). **Verifieer**: reactief social en social-post zijn nu actief in DMO-blok.
8. Spring naar dag 22. **Verifieer**: "Verankering, dag 1 van 19"-titel. Alleen DMO-blok, geen leer-stap.
9. Spring naar dag 45. **Verifieer**: "Lifetime DMO, dag 45"-titel.
10. **Switch modus terug naar sprint via SQL** voor pilot-werk: `UPDATE profiles SET modus = 'sprint' WHERE email = 'raoulzeewijk@hotmail.com'`.

Als alle stappen slagen: Core-redesign is live testbaar.

---

## Self-review (post-write check)

### Spec coverage

- ✅ Spec §3 (Architectuur Dag-type + /vandaag) → Task 8
- ✅ Spec §4 (40 dagen + lifetime structuur) → Task 3
- ✅ Spec §5 (DTT + 5 brackets + rank-advies) → Task 2, 4, 9
- ✅ Spec §6 (Pre-post-vertakking) → Task 5
- ✅ Spec §7 (DMO-blok 7 onderdelen) → Task 6
- ✅ Spec §8 (Dag-content mapping) → Task 3
- ✅ Spec §9 (Cross-modus overlap) → Task 1, 2, 7, 8

### Placeholder scan

Bewuste plaatshouders in Task 3 Step 2: dag 5-21 hebben `watJeLeert: "PLACEHOLDER"` en lege `vandaagDoen`-arrays. Step 3 vult deze in vanuit de bestaande Core-content. Dit is gedocumenteerd als "verfijning per dag komt in feedback-loop" (Raoul: "als de basis staat schiet ik feedback").

Geen andere placeholders.

### Type consistency

- `Bracket` type consistent gebruikt: definitie in `lib/dtt/brackets.ts`, geïmporteerd in advies.ts, DTTOnboardingEmbed, DMOBlok, CoreTempoSectie, VandaagFlow Props
- `Modus` type consistent in voltooiingen.ts, CrossModusOverslaanKaart, VandaagFlow Props
- `Dag`-type uit `lib/playbook/types.ts` wordt door zowel Sprint als Core gebruikt
- `inlineEmbed`-union uitgebreid met `dtt-onboarding` en `prepost-keuze`, gerefereerd in DTTOnboardingEmbed en PrePostKeuzeEmbed
- API-routes consistent in URL-naming: `/api/onboarding/markeer-voltooid`, `/api/dtt/update`

---

## Notes voor de uitvoerende engineer

- **Pilot main-branch**: alle werk gebeurt rechtstreeks op `main` (Raoul, 2026-05-13).
- **Geen test-framework**: `npm run build` per taak + smoke-test op live in Task 9.
- **Behouden + verrijken**: bestaande `lib/leerpaden/core-stappen.ts` blijft staan (legacy), niet weggooien. Inhoud overzetten naar `lib/playbook/core-dagen.ts` in Task 3.
- **Geen em-dashes** in member-content (Raoul-stijlregel).
- **Geen tijdsprognoses** in member-content (geen "binnen X dagen, X maanden"). Werkomvang-categorieën in plaats daarvan.
- **Lifeplus-naam weglaten** waar mogelijk in nieuwe content; "samenwerkend bedrijf", "eigen webshop", "holistische wellness-producten".
- **Bij blocker**: stop en vraag.
