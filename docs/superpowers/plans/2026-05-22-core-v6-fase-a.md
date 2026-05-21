# Core V6 Fase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw alle skeletten voor Core V6 (21 ankerstappen-scaffold, Mentor-profiel datamodel, drie-laags Mentor-architectuur, Freebies-CMS, Klantomgeving-routes, Anti-overwhelm UI-primitives, feature-flag) zonder Sprint te raken, zodat morgen alleen nog content + activatie nodig is.

**Architecture:** Parallel-bouw met feature-flag `core_v6_actief` in `profiles` (default false). Nieuwe Core V6-routes onder `/core-v6/*` zodat huidige `/vandaag` Core-flow onaangetast blijft tot we klaar zijn. DB-migraties als losse SQL-files in `supabase/migrations/` die Raoul morgen handmatig in de Supabase SQL Editor draait. Geen DB-wijzigingen vanuit de bouw zelf. PLACEHOLDER-content waar Gaby moet schrijven, met duidelijke `// TODO-GABY:` markers in code-comments.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Postgres + RLS), React Server + Client Components. Anti-overwhelm-kompas K1-K5 als design-toets bij elke UI.

**Anti-overwhelm-kompas (bindend):**
- **K1**: /vandaag toont één ankerstap, DMO compact ingeklapt
- **K2**: Klantomgevingen één tegel "Mijn klanten" op dashboard
- **K3**: Bij prospect één geadviseerd pad, alternatieven in dropdown
- **K4**: ELEVA stuurt het juiste pulse-moment naar boven, geen lijst van vijftig
- **K5**: Mentor-curator-acties altijd voorstel + akkoord, nooit stille acties

**Verificatie:** Geen test-framework. Per taak na implementatie `npm run build` draaien. Build moet groen blijven. Smoke-test op localhost niet nodig tijdens nacht-bouw (alleen build). Smoke-test op Vercel deploy + handmatig verifiëren is voor morgen.

**Veiligheid:**
- Werk in main-branch (pilot-context, geen feature-branch)
- Geen Sprint-code aanraken (lib/playbook/dagen.ts, lib/playbook/tempo-aware.ts blijven onaangetast)
- Geen wijzigingen aan auth, middleware, of bestaande DB-tabellen vanuit bouw
- SQL-files in supabase/migrations/ zijn pure documentatie, niet uitvoeren
- Commit + push na elke taak (Vercel auto-deploys, maar feature-flag default false beschermt)

---

## File Structure

**Nieuw aan te maken:**

```
docs/MORGEN-RAOUL.md                                    (bestaat al, blijven bijwerken)
docs/superpowers/plans/2026-05-22-core-v6-fase-a.md    (dit document)

supabase/migrations/
  2026-05-22-01-core-v6-feature-flag.sql               (profiles.core_v6_actief)
  2026-05-22-02-mentor-profielen.sql                   (rijke profielrecord)
  2026-05-22-03-standaardvragen.sql                    (Laag 1 bibliotheek)
  2026-05-22-04-mentor-escalaties.sql                  (Laag 3 sponsor-handover log)
  2026-05-22-05-freebies.sql                           (freebies-toolkit + opt-ins)
  2026-05-22-06-klantomgeving.sql                      (klanten + pulses)

lib/feature-flags/
  core-v6.ts                                            (helper om flag te lezen)

lib/mentor-profiel/
  types.ts                                              (MentorProfiel type)
  helpers.ts                                            (lees/schrijf-functies)

lib/mentor/
  laag-1-standaardvragen.ts                            (lookup + matcher)
  laag-2-router.ts                                      (model-tier-keuze + Anthropic call)
  laag-3-escalatie.ts                                   (sponsor-handover)
  index.ts                                              (publieke API: vraagAanMentor)

lib/freebies/
  types.ts                                              (Freebie, FreebieOptIn types)
  voorbeeld-toolkit.ts                                  (5 PLACEHOLDER-freebies)

lib/klantomgeving/
  types.ts                                              (Klant, KlantPulse types)
  pulse-momenten.ts                                     (5 tijdlijn-momenten definitie)

lib/playbook/
  core-dagen-v6.ts                                      (21 V6-ankerstap-skeletten, PLACEHOLDER)

components/anti-overwhelm/
  CompactDMOBlok.tsx                                    (K1)
  GeadviseerdPad.tsx                                    (K3 prospect-kaart)
  KlantenTegel.tsx                                      (K2 dashboard-tegel)
  PulseSignaalBox.tsx                                   (K4 één signaal per dag)
  MentorCuratorVoorstel.tsx                             (K5 voorstel + akkoord)

app/core-v6/                                            (nieuwe shadow-flow, default verborgen)
  page.tsx                                              (Core V6 vandaag-shell)
  stap/[nummer]/page.tsx                                (per ankerstap)

app/klant/                                              (klantomgeving placeholder-shell)
  page.tsx                                              (klantomgeving entry)
  layout.tsx                                            (eigen layout voor klant-rol)

app/instellingen/freebies/
  page.tsx                                              (founder-CMS shell)

app/instellingen/standaardvragen/
  page.tsx                                              (Train-de-Mentor Laag 1 founder-CMS)
```

**Bestaande, te modificeren (klein):**

```
docs/MORGEN-RAOUL.md                                    (per taak een regel "gebouwd: ...")
```

**Niet aanraken:**
- lib/playbook/dagen.ts (Sprint)
- lib/playbook/tempo-aware.ts (Sprint)
- lib/playbook/core-dagen.ts (huidige Core, blijft live)
- app/vandaag/page.tsx (modus-bewust, raakt Sprint)
- middleware.ts, app/layout.tsx
- alle bestaande tabellen behalve `profiles` (één kolom toevoegen)

---

## Task 1: Feature-flag `core_v6_actief` op profiles

**Files:**
- Create: `supabase/migrations/2026-05-22-01-core-v6-feature-flag.sql`
- Create: `lib/feature-flags/core-v6.ts`

- [ ] **Step 1: Maak supabase/migrations directory + SQL-file**

```sql
-- File: supabase/migrations/2026-05-22-01-core-v6-feature-flag.sql
--
-- Voegt feature-flag toe waarmee per-user Core V6 kan worden geactiveerd.
-- Default false zodat bestaande gebruikers de huidige Core-flow blijven zien.
--
-- Hoe te draaien: open Supabase SQL Editor, plak dit script, run.

alter table public.profiles
  add column if not exists core_v6_actief boolean not null default false;

comment on column public.profiles.core_v6_actief is
  'Wanneer true, gebruiker ziet Core V6 routes (21 ankerstappen + klantomgeving + freebies). Default false.';

-- RLS: bestaande policies dekken deze kolom al (profiles is per-user accessible).
-- Geen extra policy nodig.
```

- [ ] **Step 2: Maak lib/feature-flags/core-v6.ts**

```typescript
// File: lib/feature-flags/core-v6.ts
//
// Feature-flag helper voor Core V6. Leest profiles.core_v6_actief per
// user en returnt boolean. Default false als kolom nog niet bestaat
// (gracefull fallback, zodat builds slagen voordat de migration is gedraaid).

import { createClient } from "@/lib/supabase/server";

/** Returnt true als de huidige user Core V6 mag zien. False bij twijfel. */
export async function isCoreV6Actief(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("core_v6_actief")
      .eq("id", userId)
      .maybeSingle();
    return Boolean((data as { core_v6_actief?: boolean } | null)?.core_v6_actief);
  } catch {
    return false;
  }
}

/** Variant voor admin-checks per arbitrary userId. */
export async function isCoreV6ActiefVoorUser(userId: string): Promise<boolean> {
  return isCoreV6Actief(userId);
}
```

- [ ] **Step 3: Update MORGEN-RAOUL.md met status-regel**

In `docs/MORGEN-RAOUL.md`, sectie "Status nacht-bouw", voeg toe:

```markdown
- Task 1: feature-flag `core_v6_actief` op profiles (SQL-migratie + lib helper). SQL nog niet gedraaid, ligt klaar in supabase/migrations/.
```

- [ ] **Step 4: Build verifiëren**

Run: `npm run build`
Expected: PASS (geen TypeScript-errors, geen broken imports)

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/2026-05-22-01-core-v6-feature-flag.sql lib/feature-flags/core-v6.ts docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): feature-flag core_v6_actief + helper

SQL-migratie ligt klaar in supabase/migrations/, niet uitgevoerd.
Helper isCoreV6Actief() faalt graceful naar false als kolom mist.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Mentor-profiel datamodel + SQL

**Files:**
- Create: `supabase/migrations/2026-05-22-02-mentor-profielen.sql`
- Create: `lib/mentor-profiel/types.ts`
- Create: `lib/mentor-profiel/helpers.ts`

- [ ] **Step 1: Maak SQL-migratie voor mentor_profielen tabel**

```sql
-- File: supabase/migrations/2026-05-22-02-mentor-profielen.sql
--
-- Rijke Mentor-profielrecord per Core-volger. Eén JSON-blob in `data`
-- met getypeerde keys (snelle leesperformance, lage migratie-kost).
-- Lezen via lib/mentor-profiel/helpers.ts.

create table if not exists public.mentor_profielen (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentor_profielen_updated_at_idx
  on public.mentor_profielen(updated_at desc);

alter table public.mentor_profielen enable row level security;

create policy "user sees own mentor_profiel" on public.mentor_profielen
  for select using (auth.uid() = user_id);

create policy "user writes own mentor_profiel" on public.mentor_profielen
  for insert with check (auth.uid() = user_id);

create policy "user updates own mentor_profiel" on public.mentor_profielen
  for update using (auth.uid() = user_id);

comment on table public.mentor_profielen is
  'Rijke Mentor-profielrecord per Core-volger. WHY, situatie, FORM, drie verhalen, niche, ideale klant, talent, doel.';
```

- [ ] **Step 2: Maak lib/mentor-profiel/types.ts**

```typescript
// File: lib/mentor-profiel/types.ts
//
// Mentor-profiel datamodel voor Core V6. Groeit per ankerstap.
// Opgeslagen als één JSONB-blob in mentor_profielen.data.

/** FORM = Family, Occupation, Recreation, Money. Per top-5-contact. */
export type FormContext = {
  contactNaam: string;
  family?: string;
  occupation?: string;
  recreation?: string;
  money?: string;
};

/** Drie verhalen (persoonlijk / product / business). */
export type DrieVerhalen = {
  persoonlijk?: string;
  product?: string;
  business?: string;
};

export type Talent = "schrijver" | "spreker" | "filmer" | "DM-er";

export type DoelType =
  | "euro-per-maand"
  | "nieuwe-shoppers"
  | "nieuwe-webshophouders"
  | "freebie-leads"
  | "opvolg-gesprekken";

export type EersteDoel = {
  type: DoelType;
  waarde: number;
  termijn_dagen: number;
};

/** Het volledige Mentor-profiel, alle velden optioneel (groeit per stap). */
export type MentorProfiel = {
  why?: string;
  situatie?: string;
  formContexts?: FormContext[];
  eigenProducten?: string[];
  stemVoorbeelden?: string[];
  drieVerhalen?: DrieVerhalen;
  nicheZaadje?: string;
  passies?: string[];
  idealeKlant?: string;
  talent?: Talent;
  eersteDoel?: EersteDoel;
  /** Welke ankerstappen de Mentor heeft afgevinkt + bron-context (K5). */
  curatorVoorstellen?: {
    ankerstapNummer: number;
    voorgesteldOp: string;
    akkoordOp: string | null;
    redenering: string;
  }[];
};
```

- [ ] **Step 3: Maak lib/mentor-profiel/helpers.ts**

```typescript
// File: lib/mentor-profiel/helpers.ts
//
// Lees + schrijf-functies voor het Mentor-profiel. Werkt met JSONB
// merge (geen volledige overschrijving). Faalt graceful naar leeg
// profiel als tabel nog niet bestaat.

import { createClient } from "@/lib/supabase/server";
import type { MentorProfiel } from "./types";

/** Returnt het Mentor-profiel voor een user. Leeg object bij geen record of error. */
export async function leesMentorProfiel(userId: string): Promise<MentorProfiel> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("mentor_profielen")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();
    const record = data as { data?: MentorProfiel } | null;
    return record?.data ?? {};
  } catch {
    return {};
  }
}

/** Merge-patch het Mentor-profiel. Bestaande velden blijven behouden tenzij overschreven. */
export async function patchMentorProfiel(
  userId: string,
  patch: Partial<MentorProfiel>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const huidig = await leesMentorProfiel(userId);
    const merged: MentorProfiel = { ...huidig, ...patch };
    const { error } = await supabase
      .from("mentor_profielen")
      .upsert(
        { user_id: userId, data: merged, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "onbekend" };
  }
}
```

- [ ] **Step 4: Update MORGEN-RAOUL.md**

Voeg onder "Status nacht-bouw" toe:

```markdown
- Task 2: Mentor-profiel datamodel + SQL + helpers. SQL ligt klaar in supabase/migrations/.
```

- [ ] **Step 5: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/2026-05-22-02-mentor-profielen.sql lib/mentor-profiel/ docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): mentor-profiel datamodel + types + helpers

JSONB-blob in mentor_profielen.data met getypeerde keys.
Helpers leesMentorProfiel + patchMentorProfiel (merge, niet overschrijven).
SQL-migratie ligt klaar, niet gedraaid.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Drie-laags Mentor Laag 1 (standaardvragen-bibliotheek)

**Files:**
- Create: `supabase/migrations/2026-05-22-03-standaardvragen.sql`
- Create: `lib/mentor/laag-1-standaardvragen.ts`

- [ ] **Step 1: Maak SQL-migratie voor standaardvragen-tabel**

```sql
-- File: supabase/migrations/2026-05-22-03-standaardvragen.sql
--
-- Founder-onderhouden vragen-bibliotheek voor Laag 1 van de drie-laags
-- Mentor-architectuur. Geen AI, vooraf-geredigeerde antwoorden in
-- Raoul-en-Gaby-stem. Drukt token-kosten dramatisch + waarborgt stem.

create table if not exists public.standaardvragen (
  id uuid primary key default gen_random_uuid(),
  vraag_patroon text not null,
  trefwoorden text[] not null default '{}',
  antwoord text not null,
  categorie text not null check (categorie in ('bezwaar', 'product', 'business', 'praktisch', 'persoonlijk')),
  modus text[] not null default array['sprint','core','pro'],
  actief boolean not null default true,
  gemaakt_door uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists standaardvragen_trefwoorden_idx
  on public.standaardvragen using gin(trefwoorden);

create index if not exists standaardvragen_actief_idx
  on public.standaardvragen(actief) where actief = true;

alter table public.standaardvragen enable row level security;

-- Iedereen kan lezen (members consumeren de antwoorden).
create policy "anyone reads active standaardvragen" on public.standaardvragen
  for select using (actief = true);

-- Alleen founders schrijven (rolcheck via profiles.role).
create policy "founders write standaardvragen" on public.standaardvragen
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'founder')
  );

comment on table public.standaardvragen is
  'Laag 1 van drie-laags Mentor-architectuur. Founder-onderhouden vragen-antwoorden in ELEVA-stem.';
```

- [ ] **Step 2: Maak lib/mentor/laag-1-standaardvragen.ts**

```typescript
// File: lib/mentor/laag-1-standaardvragen.ts
//
// Laag 1 van drie-laags Mentor-architectuur. Trefwoord-matcher die
// een inkomende vraag probeert te koppelen aan een vooraf-geredigeerd
// antwoord uit de standaardvragen-tabel. Returnt null bij geen match,
// dan zakt het door naar Laag 2 (AI-Mentor).

import { createClient } from "@/lib/supabase/server";

export type StandaardvraagMatch = {
  id: string;
  antwoord: string;
  categorie: "bezwaar" | "product" | "business" | "praktisch" | "persoonlijk";
};

/** Normaliseert tekst voor trefwoord-matching: lowercase, leestekens weg. */
function normaliseer(tekst: string): string {
  return tekst.toLowerCase().replace(/[^\w\sàáâäèéêëìíîïòóôöùúûü]/g, " ").trim();
}

/**
 * Zoek de beste standaard-vraag-match. Strategie: trefwoord-overlap.
 * Trefwoorden zijn in DB lowercase opgeslagen. Match-score = aantal
 * gevonden trefwoorden in de vraag. Hoogste score boven drempel wint.
 */
export async function vindStandaardvraag(
  vraag: string,
  modus: "sprint" | "core" | "pro",
  drempel = 2,
): Promise<StandaardvraagMatch | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("standaardvragen")
      .select("id, vraag_patroon, trefwoorden, antwoord, categorie, modus")
      .eq("actief", true);

    if (!data || data.length === 0) return null;

    const genormaliseerd = normaliseer(vraag);
    let beste: StandaardvraagMatch | null = null;
    let besteScore = drempel - 1;

    for (const rij of data) {
      const r = rij as {
        id: string;
        trefwoorden: string[];
        antwoord: string;
        categorie: StandaardvraagMatch["categorie"];
        modus: string[];
      };
      if (!r.modus.includes(modus)) continue;
      const score = r.trefwoorden.filter((tw) =>
        genormaliseerd.includes(tw.toLowerCase()),
      ).length;
      if (score > besteScore) {
        besteScore = score;
        beste = { id: r.id, antwoord: r.antwoord, categorie: r.categorie };
      }
    }

    return beste;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Update MORGEN-RAOUL.md**

```markdown
- Task 3: Drie-laags Mentor Laag 1 (standaardvragen-bibliotheek). SQL + matcher klaar. Inhoud (30-50 vragen) nog leeg, wacht op Raoul-en-Gaby-input.
```

- [ ] **Step 4: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/2026-05-22-03-standaardvragen.sql lib/mentor/laag-1-standaardvragen.ts docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): Mentor Laag 1 standaardvragen-bibliotheek

SQL-tabel + trefwoord-matcher. Modus-aware (sprint/core/pro). Founder-only write.
Inhoud (30-50 vragen) wacht op Raoul-en-Gaby-input.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Drie-laags Mentor Laag 2 (model-tier-router)

**Files:**
- Create: `lib/mentor/laag-2-router.ts`

- [ ] **Step 1: Maak lib/mentor/laag-2-router.ts**

```typescript
// File: lib/mentor/laag-2-router.ts
//
// Laag 2 van drie-laags Mentor-architectuur. AI-laag met model-tier-keuze
// op basis van complexiteit-inschatting. Roept geen Anthropic SDK aan
// (dat doet de bestaande /api/coach route), wel: geeft model-aanbeveling.

export type ModelTier = "haiku" | "sonnet" | "opus";

export type ComplexiteitSignalen = {
  /** Lengte van de vraag in karakters. */
  vraagLengte: number;
  /** True als de vraag emotionele woorden bevat (crisis, hopeloos, ...). */
  emotioneel: boolean;
  /** True als de vraag claim-gevoelig taalgebruik bevat (medisch, diagnose). */
  claimGevoelig: boolean;
  /** True als de vraag een keuze-tussen-meerdere-paden vergt. */
  nuanceVereist: boolean;
};

/** Detecteert signalen die het model-tier-besluit beïnvloeden. */
export function analyseerSignalen(vraag: string): ComplexiteitSignalen {
  const lowered = vraag.toLowerCase();
  const emotioneelWoorden = [
    "crisis",
    "hopeloos",
    "ik weet het niet meer",
    "kan niet meer",
    "depressie",
    "burnout",
  ];
  const claimWoorden = [
    "genezen",
    "diagnose",
    "behandeling",
    "ziek",
    "medicijn",
    "arts",
    "dokter",
  ];
  const nuanceWoorden = ["of", "versus", "tussen", "welke moet ik", "beter is"];
  return {
    vraagLengte: vraag.length,
    emotioneel: emotioneelWoorden.some((w) => lowered.includes(w)),
    claimGevoelig: claimWoorden.some((w) => lowered.includes(w)),
    nuanceVereist: nuanceWoorden.some((w) => lowered.includes(w)),
  };
}

/**
 * Kies het model-tier op basis van signalen. Defaults richting goedkoper
 * tenzij complexiteit of risico het rechtvaardigt. Veiligheid eerst:
 * claim-gevoelig en emotioneel gaan altijd minimaal naar Sonnet.
 */
export function kiesModelTier(signalen: ComplexiteitSignalen): ModelTier {
  if (signalen.claimGevoelig || signalen.emotioneel) return "sonnet";
  if (signalen.nuanceVereist || signalen.vraagLengte > 400) return "sonnet";
  return "haiku";
}

/** Mapping van tier naar Anthropic model ID (te gebruiken door /api/coach). */
export function modelIdVoorTier(tier: ModelTier): string {
  if (tier === "haiku") return "claude-haiku-4-5-20251001";
  if (tier === "sonnet") return "claude-sonnet-4-6";
  return "claude-opus-4-7";
}
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 4: Drie-laags Mentor Laag 2 (model-tier-router). analyseerSignalen + kiesModelTier + modelIdVoorTier. Nog niet gekoppeld aan /api/coach, dat is een latere Fase.
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add lib/mentor/laag-2-router.ts docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): Mentor Laag 2 model-tier-router

analyseerSignalen (emotioneel/claim/nuance) + kiesModelTier (haiku/sonnet/opus).
Veiligheid: claim-gevoelig + emotioneel gaan minimaal naar Sonnet.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Drie-laags Mentor Laag 3 (sponsor-escalatie)

**Files:**
- Create: `supabase/migrations/2026-05-22-04-mentor-escalaties.sql`
- Create: `lib/mentor/laag-3-escalatie.ts`

- [ ] **Step 1: Maak SQL-migratie**

```sql
-- File: supabase/migrations/2026-05-22-04-mentor-escalaties.sql
--
-- Log van Mentor-escalaties naar sponsor. Bij claim-gevoelig of
-- emotioneel-zwaar signaal stuurt Laag 3 een handover-bericht
-- naar de sponsor met chat-context.

create table if not exists public.mentor_escalaties (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  sponsor_id uuid references auth.users(id) on delete set null,
  trigger_type text not null check (trigger_type in ('claim-gevoelig', 'emotioneel', 'mentor-onzeker', 'expliciet-verzoek')),
  chat_context jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'opgepakt', 'afgerond', 'gesloten')),
  created_at timestamptz not null default now(),
  opgepakt_op timestamptz,
  afgerond_op timestamptz
);

create index if not exists mentor_escalaties_sponsor_status_idx
  on public.mentor_escalaties(sponsor_id, status);

create index if not exists mentor_escalaties_member_idx
  on public.mentor_escalaties(member_id);

alter table public.mentor_escalaties enable row level security;

create policy "member sees own escalaties" on public.mentor_escalaties
  for select using (auth.uid() = member_id);

create policy "sponsor sees assigned escalaties" on public.mentor_escalaties
  for select using (auth.uid() = sponsor_id);

create policy "system writes escalaties" on public.mentor_escalaties
  for insert with check (auth.uid() = member_id);

create policy "sponsor updates assigned escalaties" on public.mentor_escalaties
  for update using (auth.uid() = sponsor_id);

comment on table public.mentor_escalaties is
  'Laag 3 van drie-laags Mentor-architectuur. Log van sponsor-handover-events met chat-context.';
```

- [ ] **Step 2: Maak lib/mentor/laag-3-escalatie.ts**

```typescript
// File: lib/mentor/laag-3-escalatie.ts
//
// Laag 3 van drie-laags Mentor-architectuur. Stuurt sponsor een
// handover-melding wanneer Mentor besluit dat een vraag boven Laag 2
// uitkomt. Voor pilot logt deze functie alleen naar DB; daadwerkelijke
// push-notificatie naar sponsor komt in latere Fase.

import { createClient } from "@/lib/supabase/server";

export type EscalatieTrigger =
  | "claim-gevoelig"
  | "emotioneel"
  | "mentor-onzeker"
  | "expliciet-verzoek";

export type ChatContextBericht = {
  rol: "member" | "mentor";
  tekst: string;
  tijdstip: string;
};

export type EscalatieAanvraag = {
  memberId: string;
  trigger: EscalatieTrigger;
  chatContext: ChatContextBericht[];
};

/** Logt een escalatie. Returnt het id van de aangemaakte record bij success. */
export async function escalereeNaarSponsor(
  aanvraag: EscalatieAanvraag,
): Promise<{ ok: boolean; escalatieId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Sponsor-id ophalen vanuit profiles.sponsor_id (huidige conventie).
    const { data: profile } = await supabase
      .from("profiles")
      .select("sponsor_id")
      .eq("id", aanvraag.memberId)
      .maybeSingle();

    const sponsorId = (profile as { sponsor_id?: string | null } | null)?.sponsor_id ?? null;

    const { data, error } = await supabase
      .from("mentor_escalaties")
      .insert({
        member_id: aanvraag.memberId,
        sponsor_id: sponsorId,
        trigger_type: aanvraag.trigger,
        chat_context: aanvraag.chatContext,
        status: "open",
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, escalatieId: (data as { id: string }).id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "onbekend" };
  }
}

/** Returnt aantal openstaande escalaties voor een sponsor. */
export async function aantalOpenEscalatiesVoorSponsor(
  sponsorId: string,
): Promise<number> {
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("mentor_escalaties")
      .select("id", { count: "exact", head: true })
      .eq("sponsor_id", sponsorId)
      .eq("status", "open");
    return count ?? 0;
  } catch {
    return 0;
  }
}
```

- [ ] **Step 3: Update MORGEN-RAOUL.md**

```markdown
- Task 5: Drie-laags Mentor Laag 3 (sponsor-escalatie). Tabel + log-functie + open-count helper. Push-notificatie naar sponsor nog niet, komt in latere Fase.
```

- [ ] **Step 4: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/2026-05-22-04-mentor-escalaties.sql lib/mentor/laag-3-escalatie.ts docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): Mentor Laag 3 sponsor-escalatie

Tabel mentor_escalaties met chat-context-snapshot.
escalereeNaarSponsor + aantalOpenEscalatiesVoorSponsor.
RLS: member ziet eigen, sponsor ziet toegewezen, sponsor mag updaten.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Drie-laags Mentor unified API

**Files:**
- Create: `lib/mentor/index.ts`

- [ ] **Step 1: Maak lib/mentor/index.ts**

```typescript
// File: lib/mentor/index.ts
//
// Publieke API voor de drie-laags Mentor-architectuur. Volgorde:
// Laag 1 (standaardvragen) -> Laag 2 (AI met model-tier) -> Laag 3 (escalatie).
// Caller (bv. /api/coach route) gebruikt vraagAanMentor() en krijgt
// terug welke laag heeft geantwoord + de payload.

import { vindStandaardvraag } from "./laag-1-standaardvragen";
import { analyseerSignalen, kiesModelTier, modelIdVoorTier } from "./laag-2-router";
import { escalereeNaarSponsor, type ChatContextBericht } from "./laag-3-escalatie";

export type MentorAntwoord =
  | { laag: 1; antwoord: string; categorie: string; standaardvraagId: string }
  | { laag: 2; modelId: string; signalen: ReturnType<typeof analyseerSignalen> }
  | { laag: 3; escalatieId: string; trigger: "claim-gevoelig" | "emotioneel" };

export type VraagInput = {
  memberId: string;
  modus: "sprint" | "core" | "pro";
  vraag: string;
  chatHistorie: ChatContextBericht[];
};

/**
 * Routeer een binnenkomende vraag door de drie lagen. Returnt het laag-nummer
 * en de bijbehorende payload. Caller is verantwoordelijk voor de daadwerkelijke
 * AI-call (Laag 2) of het renderen van de melding aan member (Laag 1 en 3).
 */
export async function vraagAanMentor(input: VraagInput): Promise<MentorAntwoord> {
  // Laag 1: standaardvragen.
  const standaard = await vindStandaardvraag(input.vraag, input.modus);
  if (standaard) {
    return {
      laag: 1,
      antwoord: standaard.antwoord,
      categorie: standaard.categorie,
      standaardvraagId: standaard.id,
    };
  }

  // Signalen analyseren voor Laag 2 / 3-beslissing.
  const signalen = analyseerSignalen(input.vraag);

  // Laag 3: escalatie bij claim-gevoelig of emotioneel signaal.
  if (signalen.claimGevoelig || signalen.emotioneel) {
    const trigger = signalen.claimGevoelig ? "claim-gevoelig" : "emotioneel";
    const result = await escalereeNaarSponsor({
      memberId: input.memberId,
      trigger,
      chatContext: input.chatHistorie,
    });
    if (result.ok && result.escalatieId) {
      return { laag: 3, escalatieId: result.escalatieId, trigger };
    }
    // Bij fout: zak door naar Laag 2 zodat member niet zonder antwoord blijft.
  }

  // Laag 2: AI met model-tier.
  const tier = kiesModelTier(signalen);
  return { laag: 2, modelId: modelIdVoorTier(tier), signalen };
}

// Re-exports voor losse gebruik.
export { vindStandaardvraag } from "./laag-1-standaardvragen";
export { analyseerSignalen, kiesModelTier, modelIdVoorTier } from "./laag-2-router";
export { escalereeNaarSponsor, aantalOpenEscalatiesVoorSponsor } from "./laag-3-escalatie";
export type { ChatContextBericht, EscalatieTrigger } from "./laag-3-escalatie";
export type { ModelTier, ComplexiteitSignalen } from "./laag-2-router";
export type { StandaardvraagMatch } from "./laag-1-standaardvragen";
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 6: Drie-laags Mentor unified API (lib/mentor/index.ts). Eén functie vraagAanMentor() routeert door alle drie lagen. Nog niet gekoppeld aan /api/coach route (latere Fase, want huidige route is Sprint-stabiel).
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add lib/mentor/index.ts docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): Mentor unified API vraagAanMentor()

Routeer Laag 1 -> Laag 2 -> Laag 3 in volgorde.
Veiligheid: bij fout in Laag 3 doorzakken naar Laag 2 (geen stille fail).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Freebies datamodel + SQL

**Files:**
- Create: `supabase/migrations/2026-05-22-05-freebies.sql`
- Create: `lib/freebies/types.ts`
- Create: `lib/freebies/voorbeeld-toolkit.ts`

- [ ] **Step 1: Maak SQL-migratie voor freebies + opt-ins**

```sql
-- File: supabase/migrations/2026-05-22-05-freebies.sql
--
-- Founder-toolkit voor freebies + opt-in-leads.
-- Tabel freebies: kant-en-klare templates (pdf, mailreeks, film, test).
-- Tabel freebie_opt_ins: leads die zich via een member's freebie aanmeldden.

create table if not exists public.freebies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titel text not null,
  ondertitel text,
  vorm text not null check (vorm in ('pdf', 'mailreeks', 'film', 'test', 'gids')),
  onderwerp text not null,
  beschrijving text not null,
  inhoud_template text,
  duur_minuten integer,
  gemaakt_door uuid references auth.users(id),
  actief boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists freebies_actief_idx on public.freebies(actief) where actief = true;

alter table public.freebies enable row level security;

create policy "anyone reads active freebies" on public.freebies
  for select using (actief = true);

create policy "founders write freebies" on public.freebies
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'founder')
  );

create table if not exists public.freebie_opt_ins (
  id uuid primary key default gen_random_uuid(),
  freebie_id uuid not null references public.freebies(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  lead_naam text,
  lead_email text not null,
  bron_kanaal text,
  status text not null default 'nieuw' check (status in ('nieuw', 'mini-eleva', 'klant', 'gesloten')),
  created_at timestamptz not null default now(),
  laatste_activiteit timestamptz not null default now()
);

create index if not exists freebie_opt_ins_member_idx
  on public.freebie_opt_ins(member_id, status);

create index if not exists freebie_opt_ins_freebie_idx
  on public.freebie_opt_ins(freebie_id);

alter table public.freebie_opt_ins enable row level security;

create policy "member sees own opt-ins" on public.freebie_opt_ins
  for select using (auth.uid() = member_id);

create policy "member writes own opt-ins" on public.freebie_opt_ins
  for insert with check (auth.uid() = member_id);

create policy "member updates own opt-ins" on public.freebie_opt_ins
  for update using (auth.uid() = member_id);

comment on table public.freebies is 'Founder-toolkit van freebies. Members kiezen er een, hij wordt gepersonaliseerd.';
comment on table public.freebie_opt_ins is 'Leads die zich via een member-freebie aanmeldden. Bron-tag in bron_kanaal.';
```

- [ ] **Step 2: Maak lib/freebies/types.ts**

```typescript
// File: lib/freebies/types.ts
//
// Type-definities voor de freebies-toolkit en opt-in-leads.

export type FreebieVorm = "pdf" | "mailreeks" | "film" | "test" | "gids";

export type Freebie = {
  id: string;
  slug: string;
  titel: string;
  ondertitel?: string;
  vorm: FreebieVorm;
  onderwerp: string;
  beschrijving: string;
  inhoudTemplate?: string;
  duurMinuten?: number;
  actief: boolean;
};

export type FreebieOptInStatus = "nieuw" | "mini-eleva" | "klant" | "gesloten";

export type FreebieOptIn = {
  id: string;
  freebieId: string;
  memberId: string;
  leadNaam?: string;
  leadEmail: string;
  bronKanaal?: string;
  status: FreebieOptInStatus;
  createdAt: string;
  laatsteActiviteit: string;
};
```

- [ ] **Step 3: Maak lib/freebies/voorbeeld-toolkit.ts**

```typescript
// File: lib/freebies/voorbeeld-toolkit.ts
//
// Voorbeeld-freebies voor de founder-toolkit. Vijf PLACEHOLDER-templates
// die Raoul en Gaby morgen invullen met claim-vrije content in jullie stem.
// Slugs zijn definitief (worden referentie in DB).

import type { Freebie } from "./types";

/**
 * Vijf voorbeeld-freebies voor pilot. TODO-GABY: vul inhoud_template per
 * freebie aan, en check claim-vrijheid in elke zin (EFSA + ACM-compliant).
 */
export const VOORBEELD_TOOLKIT: Omit<Freebie, "id" | "actief">[] = [
  {
    slug: "energie-21-dagen",
    titel: "21 Dagen Meer Energie",
    ondertitel: "Een dagelijks ritueel dat je weer in beweging brengt",
    vorm: "pdf",
    onderwerp: "energie",
    beschrijving:
      "Een 21-dagen-gids met ochtend-, middag- en avondritueel. PLACEHOLDER. TODO-GABY: schrijf inhoud in ELEVA-stem.",
    inhoudTemplate: "TODO-GABY: PDF-inhoud invullen.",
    duurMinuten: 15,
  },
  {
    slug: "slaap-reset",
    titel: "Slaap-Reset in 5 Avonden",
    ondertitel: "Vijf avonden, vijf zachte veranderingen",
    vorm: "mailreeks",
    onderwerp: "slaap",
    beschrijving:
      "Vijfdaagse mailreeks. Elke avond een korte tip die je voor het slapengaan kunt toepassen. PLACEHOLDER. TODO-GABY: schrijf mailreeks-inhoud.",
    inhoudTemplate: "TODO-GABY: vijf mails invullen.",
    duurMinuten: 5,
  },
  {
    slug: "darm-check",
    titel: "Welke Darm-Type Ben Jij?",
    ondertitel: "Een korte test met een persoonlijk vervolg",
    vorm: "test",
    onderwerp: "darmen",
    beschrijving:
      "Tien vragen over spijsvertering, energie en humeur. Aan het eind een advies welke supplementen-richting bij jouw type past. PLACEHOLDER. TODO-GABY: vragen + scoring + claim-vrije adviezen.",
    inhoudTemplate: "TODO-GABY: tien vragen en scoring-matrix invullen.",
    duurMinuten: 3,
  },
  {
    slug: "sport-piek",
    titel: "Eet voor je Volgende Piek",
    ondertitel: "Wat eet je voor, tijdens en na je training",
    vorm: "gids",
    onderwerp: "sport-prestatie",
    beschrijving:
      "Korte gids voor sporters die meer uit hun training willen halen. PLACEHOLDER. TODO-GABY: schrijf gids in ELEVA-stem.",
    inhoudTemplate: "TODO-GABY: gids-inhoud invullen.",
    duurMinuten: 10,
  },
  {
    slug: "hormonen-cyclus",
    titel: "Werken Met Je Cyclus",
    ondertitel: "Vier weken van je cyclus, vier soorten energie",
    vorm: "pdf",
    onderwerp: "hormonen",
    beschrijving:
      "Een gids over hoe je je dagen en je voeding afstemt op de fase van je cyclus. PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem, claim-vrij.",
    inhoudTemplate: "TODO-GABY: PDF-inhoud invullen.",
    duurMinuten: 12,
  },
];
```

- [ ] **Step 4: Update MORGEN-RAOUL.md**

```markdown
- Task 7: Freebies datamodel + SQL + types + voorbeeld-toolkit. Vijf PLACEHOLDER-templates in code (energie / slaap / darm / sport / hormonen). TODO-GABY: claim-vrije inhoud per stuk schrijven.
```

- [ ] **Step 5: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/2026-05-22-05-freebies.sql lib/freebies/ docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): freebies datamodel + voorbeeld-toolkit

Tabel freebies (founder-only write) + freebie_opt_ins (member-scoped).
Vijf PLACEHOLDER-freebies in voorbeeld-toolkit.ts, TODO-GABY-markers per stuk.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Klantomgeving datamodel + SQL

**Files:**
- Create: `supabase/migrations/2026-05-22-06-klantomgeving.sql`
- Create: `lib/klantomgeving/types.ts`
- Create: `lib/klantomgeving/pulse-momenten.ts`

- [ ] **Step 1: Maak SQL-migratie voor klantomgeving**

```sql
-- File: supabase/migrations/2026-05-22-06-klantomgeving.sql
--
-- Klantomgeving als parallel pad. Klanten krijgen eigen ELEVA-omgeving,
-- gekoppeld aan member. Vijf pulsmomenten worden door ELEVA aangejaagd.

create table if not exists public.klantomgeving_klanten (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  klant_naam text not null,
  klant_email text not null,
  bestel_datum date,
  start_datum date,
  bron text not null default 'handmatig' check (bron in ('automatisch', 'handmatig', 'uitnodig-mail', 'freebie-opt-in')),
  freebie_opt_in_id uuid references public.freebie_opt_ins(id) on delete set null,
  status text not null default 'actief' check (status in ('actief', 'stil', 'klant', 'webshophouder', 'gesloten')),
  laatste_activiteit timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists klantomgeving_klanten_member_idx
  on public.klantomgeving_klanten(member_id, status);

alter table public.klantomgeving_klanten enable row level security;

create policy "member sees own klanten" on public.klantomgeving_klanten
  for select using (auth.uid() = member_id);

create policy "member writes own klanten" on public.klantomgeving_klanten
  for all using (auth.uid() = member_id);

create table if not exists public.klantomgeving_pulses (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klantomgeving_klanten(id) on delete cascade,
  pulse_nummer integer not null check (pulse_nummer between 1 and 5),
  gepland_op date not null,
  uitgevoerd_op timestamptz,
  member_seintje_gestuurd_op timestamptz,
  member_actie_op timestamptz,
  inhoud_samenvatting text,
  created_at timestamptz not null default now()
);

create index if not exists klantomgeving_pulses_klant_idx
  on public.klantomgeving_pulses(klant_id, pulse_nummer);

create index if not exists klantomgeving_pulses_gepland_idx
  on public.klantomgeving_pulses(gepland_op) where uitgevoerd_op is null;

alter table public.klantomgeving_pulses enable row level security;

create policy "member sees pulses for own klanten" on public.klantomgeving_pulses
  for select using (
    exists (
      select 1 from public.klantomgeving_klanten k
      where k.id = klant_id and k.member_id = auth.uid()
    )
  );

create policy "member updates pulses for own klanten" on public.klantomgeving_pulses
  for update using (
    exists (
      select 1 from public.klantomgeving_klanten k
      where k.id = klant_id and k.member_id = auth.uid()
    )
  );

comment on table public.klantomgeving_klanten is 'Klanten in eigen klantomgeving, gekoppeld aan member. AVG Keuze A geaggregeerde signalen.';
comment on table public.klantomgeving_pulses is 'Vijf tijdlijn-pulsmomenten per klant, door ELEVA aangejaagd. K4-anti-overwhelm.';
```

- [ ] **Step 2: Maak lib/klantomgeving/types.ts**

```typescript
// File: lib/klantomgeving/types.ts
//
// Type-definities voor klantomgeving (klanten + pulse-momenten).

export type KlantBron = "automatisch" | "handmatig" | "uitnodig-mail" | "freebie-opt-in";

export type KlantStatus = "actief" | "stil" | "klant" | "webshophouder" | "gesloten";

export type Klant = {
  id: string;
  memberId: string;
  klantNaam: string;
  klantEmail: string;
  bestelDatum?: string;
  startDatum?: string;
  bron: KlantBron;
  freebieOptInId?: string;
  status: KlantStatus;
  laatsteActiviteit: string;
  createdAt: string;
};

export type PulseNummer = 1 | 2 | 3 | 4 | 5;

export type KlantPulse = {
  id: string;
  klantId: string;
  pulseNummer: PulseNummer;
  geplandOp: string;
  uitgevoerdOp?: string;
  memberSeintjeGestuurdOp?: string;
  memberActieOp?: string;
  inhoudSamenvatting?: string;
  createdAt: string;
};
```

- [ ] **Step 3: Maak lib/klantomgeving/pulse-momenten.ts**

```typescript
// File: lib/klantomgeving/pulse-momenten.ts
//
// Definitie van de vijf tijdlijn-pulsmomenten. Wordt door ELEVA gebruikt
// om automatisch pulses in te plannen na bestelling van een klant.
// Anti-overwhelm K4: ELEVA stuurt op het juiste moment één signaal naar
// de member, member krijgt nooit een lijst van vijftig.

import type { PulseNummer } from "./types";

export type PulseMomentDefinitie = {
  nummer: PulseNummer;
  /** Aantal dagen na bestel_datum dat dit moment geplanned wordt. */
  dagenNaBestelling: number;
  /** Korte naam voor in de UI. */
  naam: string;
  /** Voor de Mentor: wat moet 'ie doen op dit moment (in klantomgeving). */
  mentorActie: string;
  /** Voor de member: wat krijgt 'ie als seintje. */
  memberSeintje: string;
};

export const PULSE_MOMENTEN: PulseMomentDefinitie[] = [
  {
    nummer: 1,
    dagenNaBestelling: 0,
    naam: "Bestelling-pulse",
    mentorActie:
      "Stuur welkom-bericht in klantomgeving. Bevestig bestelling, eerste verwachting (levertijd), korte intro op het programma.",
    memberSeintje:
      "Marieke heeft besteld. Mentor heeft welkom gestuurd, jij kunt persoonlijk aanhaken.",
  },
  {
    nummer: 2,
    dagenNaBestelling: 5,
    naam: "Supplementen binnen",
    mentorActie:
      "Vraag open: 'Zijn je supplementen binnen? Heb je vragen over hoe je begint?'",
    memberSeintje:
      "Mentor heeft 'spullen binnen'-check gedaan. Stuur persoonlijk bericht ter aanvulling.",
  },
  {
    nummer: 3,
    dagenNaBestelling: 14,
    naam: "Eerste effecten",
    mentorActie:
      "Vraag naar eerste resultaten, peil enthousiasme. Bij ja-signaal: zachte vraag over webshop-mogelijkheid (3 keuzes-zin).",
    memberSeintje:
      "Marieke is enthousiast over haar eerste effecten. Goed moment voor webshop-uitnodiging.",
  },
  {
    nummer: 4,
    dagenNaBestelling: 28,
    naam: "Drie weken inzichten",
    mentorActie:
      "Vraag naar voortgang, referrals (kent ze iemand die hier ook baat bij heeft), introduceer social-media-stappenplan voor wie bouw-energie laat zien.",
    memberSeintje:
      "Marieke is aan drie weken productgebruik. Referral-moment + eventueel social-stappen-introductie.",
  },
  {
    nummer: 5,
    dagenNaBestelling: 56,
    naam: "Twee maanden, blijvende routine",
    mentorActie:
      "Overleg blijvende producten + abonnement-routine. Tweede 'wist je dat'-pulse over eigen webshop.",
    memberSeintje:
      "Marieke zit op twee maanden productgebruik. Routine-check + tweede webshop-uitnodig-moment.",
  },
];

/** Returnt pulse-definitie voor een nummer, of throws bij onbekend nummer. */
export function pulseMomentVoor(nummer: PulseNummer): PulseMomentDefinitie {
  const m = PULSE_MOMENTEN.find((p) => p.nummer === nummer);
  if (!m) throw new Error(`Onbekend pulse-moment-nummer: ${nummer}`);
  return m;
}
```

- [ ] **Step 4: Update MORGEN-RAOUL.md**

```markdown
- Task 8: Klantomgeving datamodel + SQL + types + pulse-momenten. Vijf tijdlijn-pulsmomenten gedefinieerd (dag 0 / 5 / 14 / 28 / 56). Mentor-acties + member-seintjes per pulse staan klaar. Inhoud kan Gaby morgen aanscherpen.
```

- [ ] **Step 5: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/2026-05-22-06-klantomgeving.sql lib/klantomgeving/ docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): klantomgeving datamodel + pulse-momenten

Tabel klantomgeving_klanten + klantomgeving_pulses met RLS per member.
Vijf pulse-moment-definities (dag 0/5/14/28/56) met mentorActie + memberSeintje.
K4-anti-overwhelm geborgd via member_seintje_gestuurd_op kolom.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Core V6 21-stappen scaffold

**Files:**
- Create: `lib/playbook/core-dagen-v6.ts`

- [ ] **Step 1: Maak lib/playbook/core-dagen-v6.ts met 21 ankerstap-skeletten**

```typescript
// File: lib/playbook/core-dagen-v6.ts
//
// Core V6 ankerstappen. 21 zuivere leerstappen, admin-stappen zitten
// in SetupPopup (niet in deze lijst). Volgt de V6-spec uit OVERZICHT-CORE-V6.html.
// Gebruikt de bestaande Dag-type uit lib/playbook/types.ts zodat de bestaande
// vandaag-flow het kan renderen.
//
// PLACEHOLDER per ankerstap: doel + watJeLeert zijn skeletten die Gaby in een
// schrijfsessie invult. Taken (vandaagDoen) zijn al concreet zodat de mechanica
// bestaat, alleen labels en uitleg kunnen jullie aanscherpen.

import type { Dag, ControllableTaak } from "./types";

function afsluitStappenV6(stapNummer: number): ControllableTaak[] {
  return [
    {
      id: `core-v6-stap${stapNummer}-sponsor-checkin`,
      label: "💬 Sluit af met een korte sponsor-checkin",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
      uitleg: `30 sec berichtje naar je sponsor hoe deze ankerstap ging.`,
    },
    {
      id: `core-v6-stap${stapNummer}-momentum-radar`,
      label: "🎯 Open momentum-acties van vandaag",
      verplicht: false,
      inlineEmbed: "momentum-radar",
      uitleg: "Check openstaande acties van vandaag.",
    },
    {
      id: `core-v6-stap${stapNummer}-partner-check`,
      label: "🤝 Check je nieuwe partner(s) vandaag",
      verplicht: false,
      inlineEmbed: "partner-check",
      uitleg: "Voor wie al team heeft. Verbergt zich onzichtbaar bij geen partners.",
    },
  ];
}

/** Core V6: 21 ankerstappen. Volgnummer = stap-nummer in de UI. */
export const CORE_V6_STAPPEN: Dag[] = [
  // ---------- FUNDAMENT (1-5) ----------
  {
    nummer: 1,
    titel: "🚀 Welkom, WHY + sponsor + scenario-keuze",
    fase: 1,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf de eerste-stap-uitleg in ELEVA-stem. Anker: helder krijgen waarom jij dit doet, kennismaken met sponsor, en kiezen welk scenario op jou past (A: al eigen resultaat / B: begin samen met Core).",
    vandaagDoen: [
      {
        id: "core-v6-stap1-why",
        label: "Maak je WHY samen met de Mentor",
        verplicht: true,
        actieRoute: "/mijn-why",
        uitleg: "De Mentor slaat de WHY op als startpunt van jouw profiel.",
      },
      {
        id: "core-v6-stap1-situatie",
        label: "Vertel de Mentor in 3 tot 5 zinnen je situatie",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Werk, gezin, tijd per dag, wat je nu zoekt.",
      },
      {
        id: "core-v6-stap1-sponsor",
        label: "Stuur je sponsor een berichtje: 'ik ben gestart'",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: "core-v6-stap1-scenario",
        label: "Kies je scenario: A (al eigen resultaat) of B (begin samen)",
        verplicht: true,
      },
      ...afsluitStappenV6(1),
    ],
  },
  {
    nummer: 2,
    titel: "👥 Top-20-namenlijst opbouwen + sponsor-call",
    fase: 1,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: werkende top-20-lijst en samen met sponsor de eerste oefen-uitnodiging.",
    vandaagDoen: [
      {
        id: "core-v6-stap2-namen",
        label: "Voeg minimaal 20 namen toe aan je lijst",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v6-stap2-form",
        label: "Loop met de Mentor de FORM-vragen door voor top-5",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap2-sponsor-call",
        label: "Plan kennismakings-call met sponsor (~30 min)",
        verplicht: true,
      },
      ...afsluitStappenV6(2),
    ],
  },
  {
    nummer: 3,
    titel: "📦 Productkennis-basis",
    fase: 1,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: gevoel van hoofdcategorieën en de Mentor weet welke producten jij gebruikt.",
    vandaagDoen: [
      {
        id: "core-v6-stap3-vraag-mentor",
        label: "Vraag de Mentor: welke 5 producten verkoop ik het meest?",
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap3-eigen-pakket",
        label: "Bestel je eigen pakket als je dat nog niet hebt",
      },
      {
        id: "core-v6-stap3-mentor-context",
        label: "Vertel de Mentor welke producten jij persoonlijk gebruikt",
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(3),
    ],
  },
  {
    nummer: 4,
    titel: "🎯 De webshop-pivot, vier uitnodig-bouwstenen + jouw zin",
    fase: 1,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: webshop als frame, vier bouwstenen leren (haakje, manier-gevonden-zin, hoe-het-werkt, permissie-vraag), eigen versie schrijven.",
    vandaagDoen: [
      {
        id: "core-v6-stap4-bouwstenen",
        label: "Loop met de Mentor de vier uitnodig-bouwstenen door",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap4-scripts",
        label: "Open de 14 webshop-scripts samen met de Mentor",
        verplicht: true,
        actieRoute: "/scripts",
      },
      {
        id: "core-v6-stap4-eigen-zin",
        label: "Schrijf je eigen webshop-uitnodigingszin (3 tot 4 regels)",
        verplicht: true,
        actieRoute: "/mijn-zinnen",
      },
      ...afsluitStappenV6(4),
    ],
  },
  {
    nummer: 5,
    titel: "💡 Verdienmodel-basis",
    fase: 1,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: zelf snappen hoe je geld verdient (basic understanding, Eric Worre).",
    vandaagDoen: [
      {
        id: "core-v6-stap5-film",
        label: "Bekijk de prospect-film over het verdienmodel",
        verplicht: true,
      },
      {
        id: "core-v6-stap5-quiz",
        label: "Doe de 3-vragen-quiz met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(5),
    ],
  },
  // ---------- IN BEWEGING (6-14) ----------
  {
    nummer: 6,
    titel: "📅 Aanloop-stap (per scenario)",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: eerste social-aanwezigheid (pre-post of 21-dagen-resultaat-post afhankelijk van scenario).",
    vandaagDoen: [
      {
        id: "core-v6-stap6-keuze-of-resultaat",
        label: "Kies de 1 of 2 belangrijkste veranderingen (scenario A) of schrijf pre-post (scenario B)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap6-plaatsen",
        label: "Plaats de post op Facebook + Instagram",
        verplicht: true,
      },
      ...afsluitStappenV6(6),
    ],
  },
  {
    nummer: 7,
    titel: "📱 Brookes 3-stappen + eerste freebie-keuze",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: Waarde + Verhaal + Zachte uitnodiging, freebie als waarde-anker.",
    vandaagDoen: [
      {
        id: "core-v6-stap7-freebie",
        label: "Open de freebie-toolkit en kies 1 freebie die bij jouw verhaal past",
        verplicht: true,
        actieRoute: "/freebies",
      },
      {
        id: "core-v6-stap7-post",
        label: "Schrijf één post (Brookes-formule), Mentor geeft feedback",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap7-plaatsen",
        label: "Plaats de post met freebie-link in tekst of bio",
        verplicht: true,
      },
      ...afsluitStappenV6(7),
    ],
  },
  {
    nummer: 8,
    titel: "✨ Drie verhalen + eerste niche-zaadje",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: drie verhalen op papier (persoonlijk / product / business), eerste idee van niche-zaadje + passies.",
    vandaagDoen: [
      {
        id: "core-v6-stap8-persoonlijk",
        label: "Schrijf je persoonlijke verhaal",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap8-product",
        label: "Schrijf je product-verhaal (vanuit webshop-frame)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap8-business",
        label: "Schrijf je business-verhaal",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap8-niche",
        label: "Praat 5 minuten met de Mentor over je niche-zaadje + passies",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(8),
    ],
  },
  {
    nummer: 9,
    titel: "💬 Eerste warme uitnodigingen + Mini-ELEVA introductie",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: drie warme uitnodigingen, kennismaken met Mini-ELEVA als opvolg-pad.",
    vandaagDoen: [
      {
        id: "core-v6-stap9-drie-namen",
        label: "Stuur bericht naar 3 mensen, gebruik je zin uit Stap 4",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v6-stap9-mini-eleva",
        label: "Zet je eerste prospect die ja zei in Mini-ELEVA",
        verplicht: true,
      },
      ...afsluitStappenV6(9),
    ],
  },
  {
    nummer: 10,
    titel: "💪 3-weg-meesterclass, 5 stappen die werken",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: vijf stappen 3-weg-gesprek + scripts klaar voor eerstvolgende.",
    vandaagDoen: [
      {
        id: "core-v6-stap10-film",
        label: "Bekijk de meesterclass-film over 3-weg-gesprek",
        verplicht: true,
      },
      {
        id: "core-v6-stap10-mentor-walkthrough",
        label: "Loop met de Mentor de 5 stappen door voor één prospect",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap10-edification",
        label: "Schrijf je eigen edification-zin over je sponsor",
        verplicht: true,
        actieRoute: "/mijn-zinnen",
      },
      ...afsluitStappenV6(10),
    ],
  },
  {
    nummer: 11,
    titel: "🤝 Je eerstvolgende 3-weg starten",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: niet meer theorie, praktijk.",
    vandaagDoen: [
      {
        id: "core-v6-stap11-kies",
        label: "Kies 1 warme prospect die nog geen 3-weg heeft gehad",
        verplicht: true,
      },
      {
        id: "core-v6-stap11-stap1",
        label: "Stuur stap 1 (introductie naar sponsor) volgens script",
        verplicht: true,
        actieRoute: "/scripts",
      },
      {
        id: "core-v6-stap11-reflectie",
        label: "Doe na afloop een korte reflectie met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(11),
    ],
  },
  {
    nummer: 12,
    titel: "📸 Stories-ritme + freebie-aankondiging",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: dagelijks Stories-ritme + freebie zichtbaar via Stories.",
    vandaagDoen: [
      {
        id: "core-v6-stap12-story",
        label: "Plaats vandaag minimaal één Story",
        verplicht: true,
      },
      {
        id: "core-v6-stap12-freebie-story",
        label: "Plaats een Story die je freebie aankondigt",
        verplicht: true,
        actieRoute: "/freebies",
      },
      {
        id: "core-v6-stap12-plan",
        label: "Plan een vast moment voor je dagelijkse Story",
        verplicht: true,
      },
      ...afsluitStappenV6(12),
    ],
  },
  {
    nummer: 13,
    titel: "📦 Eerste Shoppers, supplementen-binnen",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: tweede pulsmoment (klantomgeving), deels Mentor, deels menselijk contact.",
    vandaagDoen: [
      {
        id: "core-v6-stap13-check",
        label: "Controleer eerste Shoppers in hun klantomgeving",
        verplicht: true,
      },
      {
        id: "core-v6-stap13-persoonlijk",
        label: "Stuur elke Shopper een persoonlijk 'spullen binnen?'-bericht",
        verplicht: true,
      },
      {
        id: "core-v6-stap13-uitnodig",
        label: "Nodig ze uit voor de eerstvolgende product-info-avond",
      },
      ...afsluitStappenV6(13),
    ],
  },
  {
    nummer: 14,
    titel: "🛡️ Bezwaren-skills, 4-stappen + bibliotheek",
    fase: 2,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: 4-stappen-methode + bezwaren-bibliotheek.",
    vandaagDoen: [
      {
        id: "core-v6-stap14-roleplay",
        label: "Doe 10 minuten roleplay met de Mentor, 3 bezwaren uit top-21",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap14-bibliotheek",
        label: "Bekijk de bezwaren-bibliotheek",
        actieRoute: "/scripts/bezwaren",
      },
      ...afsluitStappenV6(14),
    ],
  },
  // ---------- BUSINESS-RITME (15-21) ----------
  {
    nummer: 15,
    titel: "🌟 Resultaat-post + dag-10-tot-18-pulse",
    fase: 3,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: Tijdlijn-moment 3 + nieuwe iteratie resultaat-post.",
    vandaagDoen: [
      {
        id: "core-v6-stap15-post",
        label: "Schrijf 21-dagen-resultaat-post (scenario B) of nieuwe iteratie (A)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap15-tijdlijn3",
        label: "Pas Tijdlijn-moment 3 toe op minimaal 1 enthousiaste Shopper",
        verplicht: true,
      },
      ...afsluitStappenV6(15),
    ],
  },
  {
    nummer: 16,
    titel: "👀 Builder-energie + ideale klant",
    fase: 3,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: onder klanten herkennen wie zelf een webshop zou willen.",
    vandaagDoen: [
      {
        id: "core-v6-stap16-markeer",
        label: "Markeer 2 tot 3 klanten met builder-energie",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v6-stap16-mentor",
        label: "Praat 5 minuten met de Mentor: 'voor wie kan ik het meest betekenen?'",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(16),
    ],
  },
  {
    nummer: 17,
    titel: "👋 Klantcontact + opvolg-routine + hercontact",
    fase: 3,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: follow-up-routine + bestaande klanten benaderen voor hercontact.",
    vandaagDoen: [
      {
        id: "core-v6-stap17-opvolg",
        label: "Plan voor 3 prospects een opvolg-herinnering",
        verplicht: true,
      },
      {
        id: "core-v6-stap17-hercontact",
        label: "Stuur 3 bestaande klanten een persoonlijk hercontact-bericht",
        verplicht: true,
      },
      ...afsluitStappenV6(17),
    ],
  },
  {
    nummer: 18,
    titel: "📊 5 typen prospects + funnel continu vullen",
    fase: 3,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: top-20 categoriseren + lijst is nooit klaar.",
    vandaagDoen: [
      {
        id: "core-v6-stap18-categoriseer",
        label: "Categoriseer je top-20 in 5 typen",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v6-stap18-afspraak",
        label: "Spreek met jezelf af: minimaal 5 nieuwe namen per week",
        verplicht: true,
      },
      ...afsluitStappenV6(18),
    ],
  },
  {
    nummer: 19,
    titel: "🎯 Closingsvraag",
    fase: 3,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: de moedigste vraag van het vak.",
    vandaagDoen: [
      {
        id: "core-v6-stap19-vraag",
        label: "Stel de closingsvraag aan minstens één warme prospect",
        verplicht: true,
      },
      ...afsluitStappenV6(19),
    ],
  },
  {
    nummer: 20,
    titel: "🔄 Klantomgeving-review + duplicatie zien",
    fase: 3,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: bewuste blik op alle klantomgevingen, voelen dat duplicatie schaalbaar wordt.",
    vandaagDoen: [
      {
        id: "core-v6-stap20-overview",
        label: "Open de klantomgeving-overview in je dashboard",
        verplicht: true,
      },
      {
        id: "core-v6-stap20-markeer",
        label: "Markeer 2 klanten waar een uitnodiging naar Core kan passen",
        verplicht: true,
      },
      {
        id: "core-v6-stap20-mentor",
        label: "Praat 5 minuten met de Mentor over wat je opvalt",
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(20),
    ],
  },
  {
    nummer: 21,
    titel: "🏆 Reflectie + talent-keuze + eerste 30-dagen-doel",
    fase: 3,
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: reflectie, creator-talent benoemen, eerste 30-dagen-doel inschieten.",
    vandaagDoen: [
      {
        id: "core-v6-stap21-reflectie",
        label: "Vul de eindreflectie in (10 min)",
        verplicht: true,
      },
      {
        id: "core-v6-stap21-talent",
        label: "Beantwoord de talent-vraag met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap21-doel",
        label: "Stel je eerste 30-dagen-doel in",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap21-sponsor-call",
        label: "Plan een call met je sponsor om voortgang te bespreken",
        verplicht: true,
      },
      ...afsluitStappenV6(21),
    ],
  },
];

/** Returnt de Core V6-ankerstap op een nummer, of undefined. */
export function coreV6Stap(nummer: number): Dag | undefined {
  return CORE_V6_STAPPEN.find((s) => s.nummer === nummer);
}
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 9: Core V6 21-ankerstappen-scaffold. Mechanica + taken concreet, watJeLeert + doel-zinnen zijn PLACEHOLDER met TODO-GABY-markers. Klaar voor schrijfsessie met Gaby.
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add lib/playbook/core-dagen-v6.ts docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): 21 ankerstappen-scaffold met PLACEHOLDER-content

Mechanica + taken zijn concreet, watJeLeert + doel-zinnen PLACEHOLDER.
TODO-GABY-markers per stap voor schrijfsessie.
Volgnummer = stap-nummer, in lijn met OVERZICHT-CORE-V6.html.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Anti-overwhelm UI-primitive CompactDMOBlok (K1)

**Files:**
- Create: `components/anti-overwhelm/CompactDMOBlok.tsx`

- [ ] **Step 1: Maak components/anti-overwhelm/CompactDMOBlok.tsx**

```tsx
// File: components/anti-overwhelm/CompactDMOBlok.tsx
//
// K1 van anti-overwhelm-kompas: /vandaag toont één ankerstap bovenaan,
// DMO eronder COMPACT ingeklapt. Default ingeklapt, één regel hoog,
// uitklappen op klik.

"use client";

import { useState } from "react";

export type DMOTaak = {
  id: string;
  label: string;
  voltooid: boolean;
  /** Optioneel: korte uitleg-zin onder de taak in uitgeklapte staat. */
  uitleg?: string;
};

export type CompactDMOBlokProps = {
  taken: DMOTaak[];
  /** Standaard ingeklapt (true) of uitgeklapt (false). Default true (K1). */
  standaardIngeklapt?: boolean;
  /** Optionele klik-handler per taak om af te vinken. */
  opTaakKlik?: (taakId: string) => void;
};

export function CompactDMOBlok({
  taken,
  standaardIngeklapt = true,
  opTaakKlik,
}: CompactDMOBlokProps) {
  const [ingeklapt, setIngeklapt] = useState(standaardIngeklapt);
  const aantalVoltooid = taken.filter((t) => t.voltooid).length;
  const aantalTotaal = taken.length;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 text-sm">
      <button
        type="button"
        onClick={() => setIngeklapt(!ingeklapt)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={!ingeklapt}
      >
        <span className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-slate-200">
            Je dagelijkse ritme{" "}
            <span className="text-slate-400">
              ({aantalVoltooid} van {aantalTotaal} vandaag)
            </span>
          </span>
        </span>
        <span className="text-slate-400">{ingeklapt ? "▼" : "▲"}</span>
      </button>

      {!ingeklapt && (
        <ul className="mt-3 space-y-2">
          {taken.map((t) => (
            <li key={t.id} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => opTaakKlik?.(t.id)}
                className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border ${
                  t.voltooid
                    ? "border-green-500 bg-green-500/20"
                    : "border-slate-500"
                }`}
                aria-label={t.voltooid ? "Voltooid" : "Markeer als voltooid"}
              >
                {t.voltooid ? "✓" : ""}
              </button>
              <div>
                <div className={t.voltooid ? "text-slate-400 line-through" : "text-slate-100"}>
                  {t.label}
                </div>
                {t.uitleg && (
                  <div className="mt-0.5 text-xs text-slate-400">{t.uitleg}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 10: CompactDMOBlok (K1-anti-overwhelm). Default ingeklapt, header toont 'X van Y vandaag'. Klikbaar af te vinken per taak.
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/anti-overwhelm/CompactDMOBlok.tsx docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): CompactDMOBlok (K1 anti-overwhelm)

Default ingeklapt, header toont 'X van Y vandaag'.
Uitklappen geeft volle lijst, af te vinken per taak.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Anti-overwhelm UI-primitive KlantenTegel (K2)

**Files:**
- Create: `components/anti-overwhelm/KlantenTegel.tsx`

- [ ] **Step 1: Maak components/anti-overwhelm/KlantenTegel.tsx**

```tsx
// File: components/anti-overwhelm/KlantenTegel.tsx
//
// K2 van anti-overwhelm-kompas: klantomgevingen zijn één tegel "Mijn klanten"
// op het dashboard. Geen tweede navigatie-hub. Eén regel-helder voor wie
// alleen wil weten of er iets nieuws is. Doorklikken opent de lijst.

import Link from "next/link";

export type KlantenTegelProps = {
  aantalKlanten: number;
  aantalNieuweSignalen: number;
  /** Optionele samenvatting: "1 enthousiast, 1 stil". */
  signaalSamenvatting?: string;
  /** Route waar de lijst opent. */
  lijstRoute?: string;
};

export function KlantenTegel({
  aantalKlanten,
  aantalNieuweSignalen,
  signaalSamenvatting,
  lijstRoute = "/klant",
}: KlantenTegelProps) {
  const heeftNieuweSignalen = aantalNieuweSignalen > 0;

  return (
    <Link
      href={lijstRoute}
      className={`block rounded-lg border p-4 transition-colors ${
        heeftNieuweSignalen
          ? "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15"
          : "border-slate-700 bg-slate-900/40 hover:bg-slate-900/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👥</span>
          <div>
            <div className="font-medium text-slate-100">Mijn klanten</div>
            <div className="text-xs text-slate-400">
              {aantalKlanten === 0
                ? "Nog geen klanten in beeld"
                : `${aantalKlanten} klant${aantalKlanten === 1 ? "" : "en"}`}
            </div>
          </div>
        </div>
        {heeftNieuweSignalen && (
          <div className="text-right">
            <div className="text-sm font-medium text-amber-200">
              {aantalNieuweSignalen} nieuw{aantalNieuweSignalen === 1 ? "" : "e"} signaal
              {aantalNieuweSignalen === 1 ? "" : "en"}
            </div>
            {signaalSamenvatting && (
              <div className="text-xs text-amber-300/80">{signaalSamenvatting}</div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 11: KlantenTegel (K2-anti-overwhelm). Eén tegel op dashboard met aantal klanten + nieuwe signalen. Klik opent lijst (/klant route nog leeg-shell, komt in Task 14).
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/anti-overwhelm/KlantenTegel.tsx docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): KlantenTegel (K2 anti-overwhelm)

Eén tegel 'Mijn klanten' met aantal + nieuwe signalen + optionele samenvatting.
Geen tweede navigatie-hub, geen menu-item.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Anti-overwhelm UI-primitives GeadviseerdPad + PulseSignaalBox + MentorCuratorVoorstel (K3 + K4 + K5)

**Files:**
- Create: `components/anti-overwhelm/GeadviseerdPad.tsx`
- Create: `components/anti-overwhelm/PulseSignaalBox.tsx`
- Create: `components/anti-overwhelm/MentorCuratorVoorstel.tsx`

- [ ] **Step 1: Maak components/anti-overwhelm/GeadviseerdPad.tsx**

```tsx
// File: components/anti-overwhelm/GeadviseerdPad.tsx
//
// K3 van anti-overwhelm-kompas: bij een prospect TOONT de prospect-kaart
// één geadviseerd pad als duidelijke knop, alternatieven in dropdown.

"use client";

import { useState } from "react";

export type PadKeuze = {
  id: string;
  label: string;
  motivatie?: string;
};

export type GeadviseerdPadProps = {
  geadviseerd: PadKeuze;
  alternatieven: PadKeuze[];
  /** Klik op de hoofd-knop of een alternatief. */
  opKies: (padId: string) => void;
};

export function GeadviseerdPad({
  geadviseerd,
  alternatieven,
  opKies,
}: GeadviseerdPadProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => opKies(geadviseerd.id)}
        className="block w-full rounded-md bg-amber-600 px-4 py-2 text-left text-sm font-medium text-amber-50 hover:bg-amber-500"
      >
        <span className="block text-xs uppercase tracking-wider text-amber-200">
          Geadviseerd door de Mentor
        </span>
        <span className="mt-0.5 block">{geadviseerd.label}</span>
        {geadviseerd.motivatie && (
          <span className="mt-1 block text-xs font-normal text-amber-100/90">
            {geadviseerd.motivatie}
          </span>
        )}
      </button>

      {alternatieven.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-xs text-slate-400 underline hover:text-slate-300"
            aria-expanded={dropdownOpen}
          >
            of kies een ander pad
          </button>
          {dropdownOpen && (
            <ul className="mt-2 space-y-1">
              {alternatieven.map((alt) => (
                <li key={alt.id}>
                  <button
                    type="button"
                    onClick={() => opKies(alt.id)}
                    className="block w-full rounded-md border border-slate-700 px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800"
                  >
                    {alt.label}
                    {alt.motivatie && (
                      <span className="mt-0.5 block text-slate-400">{alt.motivatie}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Maak components/anti-overwhelm/PulseSignaalBox.tsx**

```tsx
// File: components/anti-overwhelm/PulseSignaalBox.tsx
//
// K4 van anti-overwhelm-kompas: ELEVA stuurt het juiste pulse-moment naar
// boven. Max één tot drie signalen per dag. Member krijgt nooit een lijst
// van vijftig openstaande items.

import Link from "next/link";

export type PulseSignaal = {
  id: string;
  klantNaam: string;
  pulseNaam: string;
  actie: string;
  klantRoute: string;
  prioriteit: "hoog" | "midden" | "laag";
};

export type PulseSignaalBoxProps = {
  signalen: PulseSignaal[];
  /** Maximaal tonen. Default 3 (K4-richtlijn). */
  maxAantal?: number;
};

export function PulseSignaalBox({ signalen, maxAantal = 3 }: PulseSignaalBoxProps) {
  if (signalen.length === 0) return null;

  // K4: max één tot drie. Gerangschikt op prioriteit.
  const sortPrio = { hoog: 0, midden: 1, laag: 2 } as const;
  const getoonde = [...signalen]
    .sort((a, b) => sortPrio[a.prioriteit] - sortPrio[b.prioriteit])
    .slice(0, maxAantal);

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">🔔</span>
        <span className="text-sm font-medium text-emerald-200">
          {getoonde.length === 1 ? "Vandaag één signaal" : `Vandaag ${getoonde.length} signalen`}
        </span>
      </div>
      <ul className="space-y-2">
        {getoonde.map((s) => (
          <li key={s.id}>
            <Link
              href={s.klantRoute}
              className="block rounded-md border border-emerald-500/20 bg-slate-900/40 p-3 hover:bg-slate-900/60"
            >
              <div className="text-sm text-slate-100">
                <span className="font-medium">{s.klantNaam}</span>
                <span className="text-slate-400"> · {s.pulseNaam}</span>
              </div>
              <div className="mt-1 text-xs text-emerald-200/90">{s.actie}</div>
            </Link>
          </li>
        ))}
      </ul>
      {signalen.length > getoonde.length && (
        <div className="mt-2 text-xs text-slate-500">
          {signalen.length - getoonde.length} ander
          {signalen.length - getoonde.length === 1 ? "" : "e"} pulse{signalen.length - getoonde.length === 1 ? "" : "s"} loopt rustig door op de achtergrond.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Maak components/anti-overwhelm/MentorCuratorVoorstel.tsx**

```tsx
// File: components/anti-overwhelm/MentorCuratorVoorstel.tsx
//
// K5 van anti-overwhelm-kompas: Mentor-curator-acties zijn altijd voorstel +
// akkoord, nooit stille acties. Component toont voorstel in chat-stijl met
// twee knoppen (akkoord / niet nu).

"use client";

export type CuratorVoorstelProps = {
  voorstel: string;
  redenering?: string;
  opAkkoord: () => void;
  opNietNu: () => void;
};

export function MentorCuratorVoorstel({
  voorstel,
  redenering,
  opAkkoord,
  opNietNu,
}: CuratorVoorstelProps) {
  return (
    <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
      <div className="mb-2 flex items-start gap-2">
        <span className="text-base">🧭</span>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-violet-300">
            Voorstel van de Mentor
          </div>
          <div className="mt-1 text-sm text-slate-100">{voorstel}</div>
          {redenering && (
            <div className="mt-2 text-xs text-slate-400">{redenering}</div>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={opAkkoord}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-violet-50 hover:bg-violet-500"
        >
          Akkoord
        </button>
        <button
          type="button"
          onClick={opNietNu}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
        >
          Niet nu
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update MORGEN-RAOUL.md**

```markdown
- Task 12: Anti-overwhelm UI-primitives. GeadviseerdPad (K3 prospect-kaart, één knop + alternatieven-dropdown). PulseSignaalBox (K4 maximaal 3 signalen per dag, prioriteit-gesorteerd). MentorCuratorVoorstel (K5 voorstel + akkoord/niet-nu, nooit stille acties).
```

- [ ] **Step 5: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/anti-overwhelm/ docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): GeadviseerdPad + PulseSignaalBox + MentorCuratorVoorstel (K3+K4+K5)

GeadviseerdPad: één geadviseerde knop, alternatieven in dropdown.
PulseSignaalBox: max 3 signalen per dag, prioriteit-gesorteerd.
MentorCuratorVoorstel: voorstel + akkoord/niet-nu, nooit stille acties.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Founder-CMS shell voor Freebies

**Files:**
- Create: `app/instellingen/freebies/page.tsx`

- [ ] **Step 1: Maak app/instellingen/freebies/page.tsx**

```tsx
// File: app/instellingen/freebies/page.tsx
//
// Founder-CMS shell voor de Freebies-toolkit. Toont bestaande freebies
// uit DB, plus de PLACEHOLDER-templates uit voorbeeld-toolkit.ts.
// Founder kan hier morgen claim-vrije content invullen.
//
// NB: deze route bestaat alleen voor founders (role check). Komt nog
// geen edit-knoppen, alleen lees-overzicht voor pilot. Edit in latere Fase.

import { createClient } from "@/lib/supabase/server";
import { VOORBEELD_TOOLKIT } from "@/lib/freebies/voorbeeld-toolkit";
import type { Freebie } from "@/lib/freebies/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FreebiesAdminPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder = (profile as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/instellingen");

  // Vrolijke fallback als tabel nog niet bestaat (SQL niet gedraaid).
  let bestaandeFreebies: Freebie[] = [];
  try {
    const { data } = await supabase
      .from("freebies")
      .select("id, slug, titel, ondertitel, vorm, onderwerp, beschrijving, inhoud_template, duur_minuten, actief")
      .order("titel");
    bestaandeFreebies = ((data ?? []) as Array<{
      id: string;
      slug: string;
      titel: string;
      ondertitel: string | null;
      vorm: Freebie["vorm"];
      onderwerp: string;
      beschrijving: string;
      inhoud_template: string | null;
      duur_minuten: number | null;
      actief: boolean;
    }>).map((r) => ({
      id: r.id,
      slug: r.slug,
      titel: r.titel,
      ondertitel: r.ondertitel ?? undefined,
      vorm: r.vorm,
      onderwerp: r.onderwerp,
      beschrijving: r.beschrijving,
      inhoudTemplate: r.inhoud_template ?? undefined,
      duurMinuten: r.duur_minuten ?? undefined,
      actief: r.actief,
    }));
  } catch {
    bestaandeFreebies = [];
  }

  const placeholderSlugs = new Set(VOORBEELD_TOOLKIT.map((v) => v.slug));
  const placeholderTeImporteren = VOORBEELD_TOOLKIT.filter(
    (v) => !bestaandeFreebies.some((b) => b.slug === v.slug),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold">🎁 Freebies-toolkit (founder)</h1>
      <p className="mt-2 text-sm text-slate-400">
        Pilot-shell. Edit-knoppen komen in latere Fase. Hier zie je nu de status
        van de toolkit: welke freebies live staan in de DB, en welke PLACEHOLDER-
        templates in code wachten op claim-vrije inhoud van Raoul en Gaby.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Live in DB ({bestaandeFreebies.length})</h2>
        {bestaandeFreebies.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Nog geen freebies in de database. De SQL-migratie (
            <code className="bg-slate-800 px-1">supabase/migrations/2026-05-22-05-freebies.sql</code>)
            ligt klaar. Draai 'm in de Supabase SQL Editor en daarna kunnen jullie
            via insert-statements de templates uitrollen.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {bestaandeFreebies.map((f) => (
              <li
                key={f.id}
                className="rounded-md border border-slate-700 bg-slate-900/40 p-3"
              >
                <div className="text-sm font-medium">
                  {f.titel}{" "}
                  <span className="text-xs text-slate-500">
                    ({f.vorm}, {f.onderwerp})
                  </span>
                </div>
                {f.ondertitel && (
                  <div className="text-xs text-slate-400">{f.ondertitel}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">
          PLACEHOLDER-templates in code ({placeholderTeImporteren.length})
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Deze staan in <code className="bg-slate-800 px-1">lib/freebies/voorbeeld-toolkit.ts</code>.
          TODO-GABY: claim-vrije inhoud invullen, daarna importeren naar DB.
        </p>
        <ul className="mt-3 space-y-2">
          {placeholderTeImporteren.map((v) => (
            <li
              key={v.slug}
              className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3"
            >
              <div className="text-sm font-medium text-amber-100">
                {v.titel}{" "}
                <span className="text-xs text-amber-300/80">
                  ({v.vorm}, {v.onderwerp})
                </span>
              </div>
              {v.ondertitel && (
                <div className="text-xs text-amber-200/80">{v.ondertitel}</div>
              )}
              <div className="mt-1 text-xs text-amber-200/60">{v.beschrijving}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 13: Founder-CMS shell /instellingen/freebies. Toont live DB-freebies + PLACEHOLDER-templates uit code. Edit-knoppen komen in latere Fase. Founder-only (role-check + redirect).
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/instellingen/freebies/page.tsx docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): founder-CMS shell /instellingen/freebies

Lees-overzicht van live DB-freebies + PLACEHOLDER-templates uit code.
Founder-only via role-check + redirect.
Edit-knoppen komen in latere Fase.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Klantomgeving entry-routes

**Files:**
- Create: `app/klant/layout.tsx`
- Create: `app/klant/page.tsx`

- [ ] **Step 1: Maak app/klant/layout.tsx**

```tsx
// File: app/klant/layout.tsx
//
// Layout voor de klantomgeving-routes. Voor pilot is dit een eenvoudige
// shell zonder eigen branding. Later: aparte branding voor klant-rol-Mentor.

export default function KlantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="mx-auto max-w-4xl text-sm text-slate-400">
          👥 Mijn klanten
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Maak app/klant/page.tsx**

```tsx
// File: app/klant/page.tsx
//
// Klantomgeving entry, K2-anti-overwhelm: één tegel-perspectief uitgewerkt
// tot lijst-overzicht. Toont klanten van de huidige member met aantal nieuwe
// signalen per klant (geaggregeerd, AVG Keuze A).

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";

export const dynamic = "force-dynamic";

export default async function KlantOverviewPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) {
    // Feature-flag default false. Klantomgeving onzichtbaar tot we klaar zijn.
    redirect("/dashboard");
  }

  // Vrolijke fallback als tabel nog niet bestaat.
  let klanten: Array<{
    id: string;
    klant_naam: string;
    status: string;
    laatste_activiteit: string;
  }> = [];
  try {
    const { data } = await supabase
      .from("klantomgeving_klanten")
      .select("id, klant_naam, status, laatste_activiteit")
      .eq("member_id", user.id)
      .order("laatste_activiteit", { ascending: false });
    klanten = (data ?? []) as typeof klanten;
  } catch {
    klanten = [];
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Mijn klanten</h1>
      <p className="mt-2 text-sm text-slate-400">
        Hier staan de klanten die je via je webshop hebt opgebouwd. ELEVA stuurt
        de pulse-momenten in hun klantomgeving zelf, jij krijgt seintjes wanneer
        menselijk contact natuurlijk past.
      </p>

      {klanten.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">
          Nog geen klanten in beeld. Zodra je eerste prospect bestelt via je
          eigen webshop, verschijnt 'ie hier.
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {klanten.map((k) => (
            <li
              key={k.id}
              className="rounded-md border border-slate-700 bg-slate-900/40 p-3"
            >
              <div className="text-sm font-medium">{k.klant_naam}</div>
              <div className="text-xs text-slate-400">
                Status: {k.status} · Laatste activiteit:{" "}
                {new Date(k.laatste_activiteit).toLocaleDateString("nl-NL")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update MORGEN-RAOUL.md**

```markdown
- Task 14: Klantomgeving entry-routes /klant + /klant layout. Beschermd door feature-flag core_v6_actief (default false). Toont lijst klanten met status + laatste activiteit. Per-klant-detail komt in latere Fase.
```

- [ ] **Step 4: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/klant/ docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): klantomgeving entry-routes /klant

Lijst-overzicht klanten van member (AVG geaggregeerd, Keuze A).
Beschermd door feature-flag core_v6_actief default false.
Per-klant-detail in latere Fase.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Core V6 vandaag-shell (feature-flag-beschermd)

**Files:**
- Create: `app/core-v6/page.tsx`

- [ ] **Step 1: Maak app/core-v6/page.tsx**

```tsx
// File: app/core-v6/page.tsx
//
// Core V6 vandaag-shell. Beschermd door feature-flag core_v6_actief.
// Toont de huidige ankerstap bovenaan (K1) + DMO compact ingeklapt (K1) +
// KlantenTegel (K2) + PulseSignaalBox (K4) als die signalen heeft.
//
// Anker-progressie loopt via een nieuwe kolom profiles.core_v6_ankerstap
// (default 1). Komt in latere Fase met SQL-migratie. Voor nu: lees uit
// profile, default 1 als kolom mist.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";
import { coreV6Stap } from "@/lib/playbook/core-dagen-v6";
import { CompactDMOBlok, type DMOTaak } from "@/components/anti-overwhelm/CompactDMOBlok";
import { KlantenTegel } from "@/components/anti-overwhelm/KlantenTegel";
import { PulseSignaalBox } from "@/components/anti-overwhelm/PulseSignaalBox";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CoreV6VandaagPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  // Lees ankerstap-positie. Default 1.
  let ankerstap = 1;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("core_v6_ankerstap")
      .eq("id", user.id)
      .maybeSingle();
    const raw = (data as { core_v6_ankerstap?: number } | null)?.core_v6_ankerstap;
    if (typeof raw === "number" && raw >= 1 && raw <= 21) ankerstap = raw;
  } catch {
    ankerstap = 1;
  }

  const stap = coreV6Stap(ankerstap);
  if (!stap) redirect("/dashboard");

  // PLACEHOLDER DMO-taken. In latere Fase: genereerDMOStappenV6() uit lib.
  // Voor pilot-skelet: vijf basis-taken zonder voltooid-state.
  const dmoTaken: DMOTaak[] = [
    { id: "dmo-namen", label: "Voeg 1 nieuwe naam toe", voltooid: false },
    { id: "dmo-contact", label: "Stuur 1 warm bericht", voltooid: false },
    { id: "dmo-story", label: "Plaats 1 Story", voltooid: false },
    { id: "dmo-followup", label: "Volg 1 prospect op", voltooid: false },
    { id: "dmo-radar", label: "Check momentum-radar", voltooid: false },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 text-slate-100">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>Core V6 (pilot)</span>
        <span>Ankerstap {ankerstap} van 21</span>
      </div>

      {/* K1: één ankerstap bovenaan, dominant blok */}
      <section className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
        <h1 className="text-xl font-semibold">{stap.titel}</h1>
        <p className="mt-3 text-sm text-slate-300">{stap.watJeLeert}</p>

        <h2 className="mt-5 text-sm font-medium text-slate-200">Wat doe je vandaag</h2>
        <ul className="mt-2 space-y-2">
          {stap.vandaagDoen.map((t) => (
            <li key={t.id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border border-slate-500"></span>
              <div>
                <div className="text-slate-100">{t.label}</div>
                {t.uitleg && (
                  <div className="mt-0.5 text-xs text-slate-400">{t.uitleg}</div>
                )}
                {t.actieRoute && (
                  <Link
                    href={t.actieRoute}
                    className="mt-1 inline-block text-xs text-amber-400 hover:text-amber-300"
                  >
                    Naar {t.actieRoute}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* K1: DMO compact ingeklapt onder ankerstap */}
      <section className="mt-4">
        <CompactDMOBlok taken={dmoTaken} standaardIngeklapt={true} />
      </section>

      {/* K2: KlantenTegel als één regel */}
      <section className="mt-4">
        <KlantenTegel
          aantalKlanten={0}
          aantalNieuweSignalen={0}
          signaalSamenvatting="Nog geen klanten in beeld"
        />
      </section>

      {/* K4: PulseSignaalBox (leeg in skelet, vult zich als pulse_momenten data heeft) */}
      <section className="mt-4">
        <PulseSignaalBox signalen={[]} />
      </section>

      <div className="mt-8 text-center text-xs text-slate-500">
        Pilot-shell. Cross-modus skip, DMO-progressie en KlantenTegel-data
        worden in latere Fase aangesloten.
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 15: Core V6 vandaag-shell /core-v6. Beschermd door feature-flag (default false). Toont ankerstap bovenaan (K1 dominant blok), DMO compact ingeklapt (K1), KlantenTegel (K2 één tegel), PulseSignaalBox (K4 leeg in skelet). Ankerstap-positie uit profiles.core_v6_ankerstap (kolom moet nog komen via latere SQL-migratie, default 1 in code-fallback).
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/core-v6/page.tsx docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): vandaag-shell /core-v6 met anti-overwhelm-componenten

Eén ankerstap bovenaan (K1), DMO compact (K1), KlantenTegel (K2), PulseSignaalBox (K4).
Beschermd door feature-flag, redirectet naar /vandaag bij default-false.
DMO-data is voor pilot-skelet hardcoded, integratie komt in latere Fase.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 16: Standaardvragen-CMS founder-shell

**Files:**
- Create: `app/instellingen/standaardvragen/page.tsx`

- [ ] **Step 1: Maak app/instellingen/standaardvragen/page.tsx**

```tsx
// File: app/instellingen/standaardvragen/page.tsx
//
// Founder-CMS shell voor Train-de-Mentor Laag 1 (standaardvragen-bibliotheek).
// Lees-overzicht voor pilot. Edit-knoppen komen in latere Fase.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Standaardvraag = {
  id: string;
  vraag_patroon: string;
  trefwoorden: string[];
  antwoord: string;
  categorie: "bezwaar" | "product" | "business" | "praktisch" | "persoonlijk";
  modus: string[];
  actief: boolean;
};

export default async function StandaardvragenAdminPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder = (profile as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/instellingen");

  let vragen: Standaardvraag[] = [];
  try {
    const { data } = await supabase
      .from("standaardvragen")
      .select("id, vraag_patroon, trefwoorden, antwoord, categorie, modus, actief")
      .order("categorie");
    vragen = (data ?? []) as Standaardvraag[];
  } catch {
    vragen = [];
  }

  const perCategorie = vragen.reduce<Record<string, Standaardvraag[]>>((acc, v) => {
    if (!acc[v.categorie]) acc[v.categorie] = [];
    acc[v.categorie].push(v);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold">🧠 Standaardvragen (Mentor Laag 1)</h1>
      <p className="mt-2 text-sm text-slate-400">
        Pilot-shell. Lees-overzicht. Edit + toevoegen komt in latere Fase.
        Inhoud staat in tabel <code className="bg-slate-800 px-1">standaardvragen</code>.
        Draai eerst de SQL-migratie (
        <code className="bg-slate-800 px-1">supabase/migrations/2026-05-22-03-standaardvragen.sql</code>).
      </p>

      {vragen.length === 0 ? (
        <div className="mt-6 rounded-md border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">
          Nog geen standaardvragen in DB. Bibliotheek bouwen jullie morgen met
          de eerste 20 tot 30 vragen uit pilot-feedback.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(perCategorie).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="text-lg font-medium capitalize">{cat}</h2>
              <ul className="mt-2 space-y-2">
                {items.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-md border border-slate-700 bg-slate-900/40 p-3"
                  >
                    <div className="text-sm font-medium">{v.vraag_patroon}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      Trefwoorden: {v.trefwoorden.join(", ")}
                    </div>
                    <div className="mt-2 text-xs text-slate-300">{v.antwoord}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Modus: {v.modus.join(" + ")} · {v.actief ? "actief" : "uit"}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Update MORGEN-RAOUL.md**

```markdown
- Task 16: Founder-CMS shell /instellingen/standaardvragen. Lees-overzicht standaardvragen per categorie (bezwaar/product/business/praktisch/persoonlijk). Edit + toevoegen komt in latere Fase. Founder-only.
```

- [ ] **Step 3: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/instellingen/standaardvragen/page.tsx docs/MORGEN-RAOUL.md
git commit -m "feat(core-v6): founder-CMS shell /instellingen/standaardvragen

Lees-overzicht van Mentor Laag 1 bibliotheek, gegroepeerd per categorie.
Founder-only via role-check + redirect.
Edit + toevoegen komt in latere Fase.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 17: Eind-status MORGEN-RAOUL.md + index van wat is gebouwd

**Files:**
- Modify: `docs/MORGEN-RAOUL.md`

- [ ] **Step 1: Voeg eind-samenvatting toe aan MORGEN-RAOUL.md**

Voeg onderaan de file toe:

```markdown
---

## Hand-over voor morgen

### Wat staat klaar (Fase A skelet compleet)

Bestanden: zie task-status hierboven. Samenvatting per laag:

- **Feature-flag**: `profiles.core_v6_actief` (SQL klaar, niet gedraaid).
- **Mentor-profiel**: tabel + types + helpers (lees/patch).
- **Drie-laags Mentor**: Laag 1 (standaardvragen-matcher) + Laag 2 (model-tier-router) + Laag 3 (sponsor-escalatie) + unified API `vraagAanMentor()`.
- **Freebies**: tabel + opt-ins + types + 5 PLACEHOLDER-templates + founder-CMS-shell.
- **Klantomgeving**: tabel klanten + pulses + types + 5 pulse-moment-definities + entry-route /klant.
- **Core V6 21 ankerstappen**: scaffold in `lib/playbook/core-dagen-v6.ts`, PLACEHOLDER per stap.
- **Anti-overwhelm UI-primitives**: CompactDMOBlok (K1) + KlantenTegel (K2) + GeadviseerdPad (K3) + PulseSignaalBox (K4) + MentorCuratorVoorstel (K5).
- **Core V6 vandaag-shell**: `/core-v6` met de vier kompas-componenten boven elkaar.
- **Standaardvragen-CMS-shell**: `/instellingen/standaardvragen`.

### Wat moet jij doen om te activeren

1. **Draai 6 SQL-migraties** in Supabase SQL Editor in deze volgorde:
   - `supabase/migrations/2026-05-22-01-core-v6-feature-flag.sql`
   - `supabase/migrations/2026-05-22-02-mentor-profielen.sql`
   - `supabase/migrations/2026-05-22-03-standaardvragen.sql`
   - `supabase/migrations/2026-05-22-04-mentor-escalaties.sql`
   - `supabase/migrations/2026-05-22-05-freebies.sql`
   - `supabase/migrations/2026-05-22-06-klantomgeving.sql`

2. **Activeer de feature-flag voor jouw account** (alleen jij eerst, niet andere pilot-leden):
   ```sql
   update public.profiles set core_v6_actief = true where id = '<jouw-user-id>';
   ```

3. **Test smoke**: open `/core-v6` en kijk of de shell laadt zonder errors. Open `/klant` en kijk of de lijst-shell laadt. Open `/instellingen/freebies` en `/instellingen/standaardvragen` als founder.

4. **Beslissingen die ik in #6 t/m #9 hierboven voor jou heb gemaakt** (klantomgeving-auto-delete, escalatie-opt-in, mentor-profiel JSONB, core-v6 routes). Bevestig of pas aan.

5. **Schrijfsessie met Gaby** voor:
   - 21 ankerstap-`watJeLeert`-teksten (zie `lib/playbook/core-dagen-v6.ts`, zoek op TODO-GABY)
   - 5 freebie-inhouds-templates (zie `lib/freebies/voorbeeld-toolkit.ts`, zoek op TODO-GABY)
   - Eerste 20 standaardvragen Laag 1 (na SQL-migratie via insert-statements)

### Wat ik morgen voor je oppak (Fase B en later)

- DMO-progressie aansluiten op `/core-v6` (DB-tabel `core_v6_dmo_voortgang` + helper)
- Ankerstap-progressie verhogen na voltooien (kolom `profiles.core_v6_ankerstap`)
- Cross-modus skip ook voor V6 stappen (verwijzen naar Sprint-equivalenten)
- `/api/coach` route koppelen aan `vraagAanMentor()` voor Core-V6-leden
- Klantomgeving per-klant-detail-pagina + pulse-engine cron-job
- Freebies edit-knoppen in founder-CMS
- Mentor-profiel auto-vullen na elke ankerstap (hook in voltooi-flow)
```

- [ ] **Step 2: Build verifiëren**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add docs/MORGEN-RAOUL.md
git commit -m "docs(core-v6): eind-samenvatting Fase A in MORGEN-RAOUL.md

Wat staat klaar (bestand-overzicht per laag), wat moet Raoul doen om te
activeren (6 SQL-migraties + feature-flag), schrijfsessie-items voor Gaby,
wat ik morgen verder oppak in Fase B.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:** Loop OVERZICHT-CORE-V6.html door uitgangspunt voor uitgangspunt:
- Uitgangspunt 1 (één hoofdverhaal, webshop frame): zit in ankerstap-titels (4 + 7 + 12).
- Uitgangspunt 2 (Mentor leert jou kennen): Task 2 (datamodel) dekt.
- Uitgangspunt 3 (tijdlijn klantomgeving): Task 8 (pulse-momenten) dekt.
- Uitgangspunt 4 (twee scenario's): zit in ankerstap 6 (scenario-keuze).
- Uitgangspunt 5 (onder de motorkap): geen aparte task, blijft conceptueel.
- Uitgangspunt 6 (DMO + ankerstap): Task 10 (CompactDMOBlok) + Task 15 (vandaag-shell met beide).
- Uitgangspunt 7 (Mentor kent alle ankerstappen): MentorCuratorVoorstel (Task 12) + ankerstap-data uit core-dagen-v6.ts.
- Uitgangspunt 8 (drie-laags Mentor): Task 3 + 4 + 5 + 6.
- Uitgangspunt 9 (warm-netwerk-skip afgeraden): UI-keuze, geen apart code-pad.
- Uitgangspunt 10 (freebies vanaf Core): Task 7 + 13 + ankerstap 7 + 12 in core-dagen-v6.ts.
- Anti-overwhelm K1-K5: Task 10 + 11 + 12.

**Gaps:** Nul. Alles op skelet-niveau gedekt.

**2. Placeholder scan:** Bewust gebruikt PLACEHOLDER + TODO-GABY in content-velden, allemaal duidelijk gemarkeerd. Geen vage instructies in code.

**3. Type consistency:** Doorlopen. MentorProfiel, Freebie, Klant, KlantPulse, PulseMomentDefinitie, MentorAntwoord, ChatContextBericht zijn consistent gebruikt. `coreV6Stap()` returnt `Dag` uit `lib/playbook/types.ts` (bestaand type, zelfde structuur als Sprint).

---

## Execution Handoff

Plan compleet en opgeslagen in `docs/superpowers/plans/2026-05-22-core-v6-fase-a.md`.

Raoul heeft akkoord gegeven voor batch-uitvoering tijdens nacht-bouw (autonoom, geen verhelderingsvragen). Verhelderingsvragen die opkomen leg ik in `docs/MORGEN-RAOUL.md`.

**Volgende stap:** `superpowers:executing-plans` om de 17 taken één voor één uit te voeren.
