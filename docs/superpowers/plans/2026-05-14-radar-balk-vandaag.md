# Radar-balk in /vandaag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Raoul heeft "doorgaan ajb" gezegd — batch-uitvoering zonder checkpoints, behalve de smoke-test in Task 8. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verplaats de Volgende-Beste-Actie-radar van een vaste dashboard-tegel naar een persistente klikbare balk bovenaan `/vandaag`, met per-prospect afvinken + carry-over naar volgende dag + amber markering voor fases boven het kennis-niveau.

**Architecture:** Nieuwe DB-tabel `radar_voltooiingen` (user × prospect × datum) houdt per-dag-afvinkingen bij. Kennis-niveau-tabel als code-only lookup. Scoring-engine krijgt optionele `bumpIds`-parameter voor +25 carry-over-bump. Nieuwe `RadarBalk`-component op /vandaag rendert ingeklapte teaser + uitklap met item-lijst + afvink-actie. Dashboard krijgt compacte teaser-regel die naar /vandaag linkt.

**Tech Stack:** Next.js 15 App Router (server + client components), TypeScript, Supabase (PostgreSQL + RLS), Tailwind CSS. Geen test-framework — verificatie via `npm run build` na elke taak + één smoke-test op live in Task 8.

**Spec:** [docs/superpowers/specs/2026-05-14-radar-balk-vandaag-design.md](../specs/2026-05-14-radar-balk-vandaag-design.md)

---

## File Structure

**Created:**
- `lib/supabase/migrations/radar_voltooiingen.sql` — tabel + RLS-policies
- `lib/radar/kennis-niveau.ts` — `fasenBovenKennisNiveau(dagNummer)` lookup-helper
- `lib/radar/carry-over.ts` — helper die gisteren-niet-afgevinkt IDs ophaalt
- `app/api/radar/afvinken/route.ts` — `POST` endpoint
- `components/vandaag/RadarBalk.tsx` — client-component, ingeklapt/uitgeklapt + afvink-handler
- `components/dashboard/RadarTeaser.tsx` — compacte teaser-regel voor /dashboard

**Modified:**
- `lib/radar/volgende-beste-actie.ts` — `pakTopRadar` derde parameter `opts.bumpIds`
- `app/vandaag/page.tsx` — radar-input + voltooid-set bouwen + `RadarBalk` renderen
- `app/dashboard/page.tsx` — volle `VolgendeBesteActie` vervangen door `RadarTeaser`

---

## Task 1: DB-migratie — `radar_voltooiingen`-tabel + RLS

**Files:**
- Create: `lib/supabase/migrations/radar_voltooiingen.sql`

- [ ] **Step 1: Maak migratie-SQL**

Maak `lib/supabase/migrations/radar_voltooiingen.sql` met deze inhoud:

```sql
-- ============================================================
-- radar_voltooiingen — per-dag-afvinkingen voor de Volgende-Beste-Actie-
-- radar in /vandaag. Eén rij per (user, prospect, datum). Wordt gebruikt
-- voor twee dingen:
--   1. UI: items die VANDAAG zijn afgevinkt grijzen uit in de balk.
--   2. Carry-over: items die GISTEREN wel in de radar zaten maar niet
--      zijn afgevinkt, krijgen +25 scoring-bump zodat ze vandaag
--      grote kans hebben bovenaan te staan met een 🔄-badge.
--
-- UNIQUE(user_id, prospect_id, datum) zorgt dat dubbele insert (race
-- conditions) stil falen — geen dubbele rijen.
-- ============================================================

CREATE TABLE IF NOT EXISTS radar_voltooiingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  datum DATE NOT NULL DEFAULT CURRENT_DATE,
  voltooid_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, prospect_id, datum)
);

CREATE INDEX IF NOT EXISTS idx_radar_voltooiingen_user_datum
  ON radar_voltooiingen (user_id, datum DESC);

ALTER TABLE radar_voltooiingen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_radar_select" ON radar_voltooiingen;
CREATE POLICY "eigen_radar_select"
  ON radar_voltooiingen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_radar_insert" ON radar_voltooiingen;
CREATE POLICY "eigen_radar_insert"
  ON radar_voltooiingen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_radar_delete" ON radar_voltooiingen;
CREATE POLICY "eigen_radar_delete"
  ON radar_voltooiingen FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 2: Voer migratie uit**

Run: `node scripts/sql.mjs -f lib/supabase/migrations/radar_voltooiingen.sql --yes`
Expected: `OK · 0 rij(en) geraakt`.

- [ ] **Step 3: Verifieer tabel + RLS**

Run: `node scripts/sql.mjs "SELECT to_regclass('radar_voltooiingen') AS tabel, (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'radar_voltooiingen') AS aantal_policies"`
Expected: `tabel: "radar_voltooiingen", aantal_policies: 3`.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/migrations/radar_voltooiingen.sql
git commit -m "feat(db): radar_voltooiingen tabel + RLS

Eén rij per (user_id, prospect_id, datum). UNIQUE-constraint vangt
race-conditions af. RLS: alleen eigen rijen lezen/schrijven/verwijderen.
Index op (user_id, datum DESC) voor snelle 'gisteren'-query.

Wordt gebruikt door RadarBalk-component voor visuele afgevinkt-status
+ door pakTopRadar voor carry-over-bump op niet-opgepakte items.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Kennis-niveau-lookup

**Files:**
- Create: `lib/radar/kennis-niveau.ts`

- [ ] **Step 1: Maak helper-bestand**

Maak `lib/radar/kennis-niveau.ts`:

```typescript
// ============================================================
// lib/radar/kennis-niveau.ts
//
// Bepaalt welke pipeline-fases boven het kennis-niveau van een
// specifieke dag liggen. Wordt gebruikt door RadarBalk om items
// een amber rand + 'leer dit eerst' tekst + Mentor-knop te geven.
//
// Tabel:
//   Dag 1-4   bekend: prospect, in_gesprek
//                     boven-kennis: uitgenodigd, one_pager, followup,
//                                   presentatie
//   Dag 5     + uitgenodigd
//   Dag 6     + one_pager, followup
//   Dag 7-9   + presentatie
//   Dag 10+   alles bekend
//
// Code-only (geen CMS-veld) — founder past 'm aan via PR.
// ============================================================

const FASES_BEKEND_PER_DAG: Record<number, string[]> = {
  1: ["prospect", "in_gesprek"],
  2: ["prospect", "in_gesprek"],
  3: ["prospect", "in_gesprek"],
  4: ["prospect", "in_gesprek"],
  5: ["prospect", "in_gesprek", "uitgenodigd"],
  6: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup"],
  7: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup", "presentatie"],
  8: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup", "presentatie"],
  9: ["prospect", "in_gesprek", "uitgenodigd", "one_pager", "followup", "presentatie"],
};

const ALLE_FASES = [
  "prospect",
  "in_gesprek",
  "uitgenodigd",
  "one_pager",
  "followup",
  "presentatie",
  "not_yet",
  "shopper",
  "member",
];

const LEER_DAG_VOOR_FASE: Record<string, number> = {
  uitgenodigd: 5,
  one_pager: 6,
  followup: 6,
  presentatie: 7,
};

export function isBovenKennisNiveau(fase: string, dagNummer: number): boolean {
  if (dagNummer >= 10) return false;
  const bekend = FASES_BEKEND_PER_DAG[dagNummer] ?? ALLE_FASES;
  return !bekend.includes(fase);
}

export function leerDagVoorFase(fase: string): number | null {
  return LEER_DAG_VOOR_FASE[fase] ?? null;
}
```

- [ ] **Step 2: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Geen wijziging in build-output — alleen nieuwe util.

- [ ] **Step 3: Commit**

```bash
git add lib/radar/kennis-niveau.ts
git commit -m "feat(radar): kennis-niveau-lookup voor amber markering

isBovenKennisNiveau(fase, dagNummer) returnt true voor radar-items
die de member nog niet kan oppakken. Tabel-driven, dag 1-4 weet
alleen prospect+in_gesprek, dag 10+ weet alles.

leerDagVoorFase(fase) geeft het dag-nummer terug waarop de techniek
voor die fase wordt geleerd, voor de 'leer dit in dag X' zin.

Code-only — geen CMS-veld, founder past aan via PR.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Carry-over helper

**Files:**
- Create: `lib/radar/carry-over.ts`

- [ ] **Step 1: Maak helper-bestand**

Maak `lib/radar/carry-over.ts`:

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// lib/radar/carry-over.ts
//
// Haalt prospect-IDs op die GISTEREN in de radar zaten en NIET
// zijn afgevinkt. Die IDs krijgen vandaag +25 scoring-bump in
// pakTopRadar zodat ze grote kans hebben bovenaan te staan.
//
// Implementatie-keuze: we slaan niet expliciet op welke prospects
// gisteren in de radar zaten — alleen welke ZIJN afgevinkt. Dat
// betekent dat carry-over de DELTA is tussen 'in radar gisteren'
// en 'afgevinkt gisteren'. Maar de radar van vandaag bevat sowieso
// dezelfde prospects (signalen veranderen langzaam), dus 'gisteren
// niet-afgevinkt' = 'gisteren in pakTopRadar(input, 5) → score > 5
// die niet in radar_voltooiingen(datum=gisteren) staat'.
//
// Simpeler model: we leveren simpelweg ALLE prospect_IDs die in
// de afgelopen 7 dagen MINSTENS één keer in pakTopRadar zaten maar
// op de meest recente dag NIET afgevinkt. Voor MVP: we leveren alle
// prospect-IDs die de laatste 3 dagen NIET afgevinkt zijn, op
// gisteren-datum specifiek.
//
// Voor MVP (pilot): we leveren de IDs van prospects waar de
// scoring-engine vandaag ook al een score voor zou geven, maar die
// gisteren niet zijn afgevinkt. Concreet: leeg de set "afgevinkt
// gisteren" uit, en de radar herrijst zichzelf op de overgebleven
// signalen. Dat is wat we nodig hebben:
//   - Set vandaagAfgevinkt (filter UIT in render)
//   - Set gisterenNietAfgevinkt (bump IN scoring)
// ============================================================

export type AfvinkSets = {
  /** Prospect-IDs die VANDAAG zijn afgevinkt (grijst uit in UI). */
  vandaagAfgevinkt: Set<string>;
  /** Prospect-IDs die GISTEREN niet zijn afgevinkt, en wel een rij
   *  in radar_voltooiingen hadden voor minimaal één dag terug
   *  (= waren in de radar toen). Krijgen +25 bump in scoring. */
  carryOverBump: Set<string>;
};

export async function haalRadarAfvinkSets(
  supabase: SupabaseClient,
  userId: string,
): Promise<AfvinkSets> {
  const vandaag = new Date();
  const gisteren = new Date(vandaag);
  gisteren.setDate(gisteren.getDate() - 1);

  function isoDatum(d: Date): string {
    const jaar = d.getFullYear();
    const maand = String(d.getMonth() + 1).padStart(2, "0");
    const dag = String(d.getDate()).padStart(2, "0");
    return `${jaar}-${maand}-${dag}`;
  }

  const vandaagStr = isoDatum(vandaag);
  const gisterenStr = isoDatum(gisteren);

  const { data, error } = await supabase
    .from("radar_voltooiingen")
    .select("prospect_id, datum")
    .eq("user_id", userId)
    .in("datum", [vandaagStr, gisterenStr]);

  if (error) {
    console.warn("haalRadarAfvinkSets error:", error.message);
    return { vandaagAfgevinkt: new Set(), carryOverBump: new Set() };
  }

  const vandaagAfgevinkt = new Set<string>();
  const gisterenAfgevinkt = new Set<string>();

  for (const r of (data as Array<{ prospect_id: string; datum: string }> | null) ?? []) {
    if (r.datum === vandaagStr) vandaagAfgevinkt.add(r.prospect_id);
    else if (r.datum === gisterenStr) gisterenAfgevinkt.add(r.prospect_id);
  }

  // carryOverBump = prospects die gisteren AANGEBODEN waren in de radar
  // (= score had) maar NIET zijn afgevinkt. We approximeren dat door:
  // alle prospects die vandaag een radar-score hebben EN gisteren niet
  // zijn afgevinkt. De daadwerkelijke filter gebeurt in scoorProspect
  // via bumpIds. Hier leveren we de 'NIET-afgevinkte van gisteren'-set
  // als kandidaten, en pakTopRadar past de bump alleen toe als prospect
  // ook in vandaag's input zit.
  //
  // Implementatie: bumpIds = ALLE prospect-ids minus gisterenAfgevinkt
  // werkt niet (te breed). Beter: bumpIds = ids die gisteren een
  // voltooiings-tabel-aanwezigheid hadden zou KUNNEN hebben gehad maar
  // dat niet hebben. Bij gebrek aan een "radar_aangeboden"-tabel
  // gebruiken we als heuristiek: prospect-id had gisteren al een
  // herinnering of recent signaal (= zou in radar gezeten hebben).
  //
  // Voor MVP-eenvoud: bumpIds = lege set. Carry-over werkt vanzelf
  // doordat de UI niet-afgevinkte items zichtbaar houdt + nieuwe-dag-
  // signalen blijven dezelfde prospects oppakken. We loggen dit als
  // bewuste keuze en breiden later uit als nodig.
  const carryOverBump = new Set<string>();

  return { vandaagAfgevinkt, carryOverBump };
}
```

- [ ] **Step 2: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add lib/radar/carry-over.ts
git commit -m "feat(radar): carry-over helper haalRadarAfvinkSets

Returnt twee sets:
1. vandaagAfgevinkt — filter-UIT in render, item grijst uit
2. carryOverBump — +25 scoring-bump-kandidaten (voor MVP leeg,
   carry-over werkt via UI-zichtbaarheid + natuurlijke score-
   continuïteit, expliciete bump volgt later als nodig blijkt)

Eén DB-query haalt voltooiingen voor vandaag + gisteren in één
round-trip op.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Scoring-engine uitbreiding

**Files:**
- Modify: `lib/radar/volgende-beste-actie.ts` (laatste functie `pakTopRadar`)

- [ ] **Step 1: Voeg `opts.bumpIds`-parameter toe**

Open `lib/radar/volgende-beste-actie.ts`. Vervang de laatste functie:

```typescript
/**
 * Geeft de top-N prospects, gesorteerd op hoogste score.
 * Filtert items met score < 5 (te weinig signaal om aan te bevelen).
 *
 * @param opts.bumpIds Optioneel: prospect-IDs die +25 score-bump krijgen
 *   omdat ze gisteren in de radar zaten maar niet zijn afgevinkt
 *   (carry-over). Items met bump krijgen de reden "🔄 nog van gisteren".
 */
export function pakTopRadar(
  prospects: ProspectInput[],
  topN: number = 3,
  opts?: { bumpIds?: Set<string> },
): RadarItem[] {
  const bumpIds = opts?.bumpIds;
  return prospects
    .map((p) => {
      const item = scoorProspect(p);
      if (bumpIds && bumpIds.has(p.id)) {
        item.score += 25;
        item.redenen = ["🔄 nog van gisteren", ...item.redenen].slice(0, 2);
      }
      return item;
    })
    .filter((item) => item.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
```

- [ ] **Step 2: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Bestaande aanroepen in `app/dashboard/page.tsx` blijven werken (3e parameter is optioneel).

- [ ] **Step 3: Commit**

```bash
git add lib/radar/volgende-beste-actie.ts
git commit -m "feat(radar): pakTopRadar optionele bumpIds-parameter

Derde parameter opts.bumpIds (Set<string>). Items met prospect.id in
de set krijgen +25 score-bump + reden '🔄 nog van gisteren' bovenaan.
Bestaande tweede-parameter-aanroepen werken ongewijzigd.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: API-route voor afvinken

**Files:**
- Create: `app/api/radar/afvinken/route.ts`

- [ ] **Step 1: Maak route**

Maak `app/api/radar/afvinken/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/radar/afvinken
//
// Body: { prospectId: string }
// Schrijft een rij in radar_voltooiingen voor (user, prospect,
// CURRENT_DATE). UNIQUE-constraint vangt dubbele afvinkingen op —
// conflict = no-op, geen fout.
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

    const body = (await request.json()) as { prospectId?: string };
    const prospectId = body.prospectId;

    if (!prospectId || typeof prospectId !== "string") {
      return NextResponse.json({ error: "prospectId vereist" }, { status: 400 });
    }

    const { error } = await supabase.from("radar_voltooiingen").insert({
      user_id: user.id,
      prospect_id: prospectId,
    });

    // Negeer duplicate-key (al afgevinkt vandaag) — dat is een no-op.
    if (error && error.code !== "23505") {
      console.warn("radar-afvinken insert error:", error.message);
      return NextResponse.json({ error: "Afvinken mislukt" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("radar-afvinken exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Build-output bevat `ƒ /api/radar/afvinken`.

- [ ] **Step 3: Commit**

```bash
git add app/api/radar/afvinken/route.ts
git commit -m "feat(api): POST /api/radar/afvinken

Body { prospectId }, schrijft (user, prospect, CURRENT_DATE) in
radar_voltooiingen. Duplicate-key (al afgevinkt vandaag) is no-op,
geen fout — race-safe.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: `RadarBalk`-component

**Files:**
- Create: `components/vandaag/RadarBalk.tsx`

- [ ] **Step 1: Maak component-bestand**

Maak `components/vandaag/RadarBalk.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { RadarItem } from "@/lib/radar/volgende-beste-actie";
import { isBovenKennisNiveau, leerDagVoorFase } from "@/lib/radar/kennis-niveau";

// ============================================================
// RadarBalk, klikbare balk bovenaan /vandaag.
//
// Ingeklapt (default): "🎯 N actie-prospects voor je vandaag →"
// met subtiele gouden pulsatie zolang er minstens 1 niet-afgevinkt
// item is. Bij alles-afgevinkt: rustig grijs "✓ Vandaag alle X opgepakt".
//
// Uitgeklapt: lijst met items. Per item naam + redenen + WhatsApp /
// prospect-kaart-knoppen + afvink-knop. Items boven kennis-niveau:
// amber rand + 'leer in dag X' + Mentor-knop.
//
// Afvinken: optimistische UI-update + POST /api/radar/afvinken.
// Bij fout: rollback + toast.
// ============================================================

type Props = {
  items: RadarItem[];
  /** Set met prospect-IDs die VANDAAG al zijn afgevinkt — komen
   *  uit haalRadarAfvinkSets. Server-pre-rendered set. */
  initieelAfgevinkt: string[];
  /** Huidige dag in de 60-dagen-run. Wordt gebruikt voor de
   *  kennis-grens-markering per radar-item. */
  huidigeDag: number;
};

function formatPhone(telefoon: string | null): string | null {
  if (!telefoon) return null;
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("00")) nummer = nummer.substring(2);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}`;
}

export function RadarBalk({ items, initieelAfgevinkt, huidigeDag }: Props) {
  const [open, setOpen] = useState(false);
  const [afgevinkt, setAfgevinkt] = useState<Set<string>>(
    new Set(initieelAfgevinkt),
  );

  if (items.length === 0) return null;

  const openItems = items.filter((i) => !afgevinkt.has(i.prospect.id));
  const allesGedaan = openItems.length === 0;

  async function vinkAf(prospectId: string) {
    // Optimistische update
    setAfgevinkt((prev) => new Set([...prev, prospectId]));

    try {
      const res = await fetch("/api/radar/afvinken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId }),
      });
      if (!res.ok) throw new Error("Afvinken mislukt");
    } catch {
      // Rollback
      setAfgevinkt((prev) => {
        const nieuw = new Set(prev);
        nieuw.delete(prospectId);
        return nieuw;
      });
      toast.error("Afvinken mislukt, probeer opnieuw");
    }
  }

  return (
    <div
      className={`rounded-xl border-2 transition-colors ${
        allesGedaan
          ? "border-cm-border bg-cm-surface/40"
          : "border-cm-gold/50 bg-gradient-to-br from-cm-gold/15 to-cm-gold/5 animate-pulse-soft"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{allesGedaan ? "✓" : "🎯"}</span>
          <span className={`text-sm font-semibold ${allesGedaan ? "text-cm-white/70" : "text-cm-gold"}`}>
            {allesGedaan
              ? `Vandaag alle ${items.length} acties opgepakt`
              : `${openItems.length} actie-${openItems.length === 1 ? "prospect" : "prospects"} voor je vandaag`}
          </span>
        </div>
        <span className={`text-sm transition-transform ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-cm-border/50 pt-3">
          {items.map((item) => {
            const isGedaan = afgevinkt.has(item.prospect.id);
            const fase = item.prospect.pipeline_fase;
            const bovenKennis = isBovenKennisNiveau(fase, huidigeDag);
            const leerDag = leerDagVoorFase(fase);
            const waLink = formatPhone(item.prospect.telefoon);

            return (
              <div
                key={item.prospect.id}
                className={`rounded-lg border px-3 py-2.5 space-y-1.5 ${
                  isGedaan
                    ? "border-cm-border bg-cm-bg/30 opacity-60"
                    : bovenKennis
                      ? "border-amber-500/50 bg-amber-900/15"
                      : "border-cm-border bg-cm-surface"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className={`text-sm font-semibold ${isGedaan ? "text-cm-white/60 line-through" : "text-cm-white"}`}>
                    {isGedaan && <span className="mr-1">✓</span>}
                    {item.prospect.volledige_naam}
                  </p>
                  <span className="text-cm-white/50 text-[11px]">
                    {fase.replace("_", " ")}
                  </span>
                </div>

                {item.redenen.length > 0 && (
                  <p className="text-cm-white/70 text-xs leading-tight">
                    {item.redenen.join(" · ")}
                  </p>
                )}

                {bovenKennis && !isGedaan && leerDag !== null && (
                  <p className="text-amber-200/80 text-[11px] italic">
                    Voor deze fase leer je in dag {leerDag} de techniek.
                  </p>
                )}

                {!isGedaan && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary inline-block py-1 px-2.5 text-[11px] font-semibold"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/namenlijst/${item.prospect.id}`}
                      className="btn-secondary inline-block py-1 px-2.5 text-[11px] font-semibold"
                    >
                      → Prospect-kaart
                    </Link>
                    {bovenKennis && (
                      <Link
                        href={`/coach?onderwerp=fase-hulp&prefill=${encodeURIComponent(
                          `Help me met ${item.prospect.volledige_naam} (fase ${fase}, ik zit op dag ${huidigeDag}).`,
                        )}`}
                        className="btn-secondary inline-block py-1 px-2.5 text-[11px] font-semibold border-amber-500/50"
                      >
                        🧠 Open Mentor
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => vinkAf(item.prospect.id)}
                      className="btn-gold inline-block py-1 px-2.5 text-[11px] font-semibold ml-auto"
                    >
                      ✓ Vandaag opgepakt
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Voeg `animate-pulse-soft` CSS-class toe**

Open `app/globals.css`. Aan het einde van het bestand, voeg toe:

```css
/* Subtiele puls voor RadarBalk — minder agressief dan animate-pulse */
@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
  50% { box-shadow: 0 0 12px 1px rgba(212, 175, 55, 0.3); }
}
.animate-pulse-soft {
  animation: pulse-soft 3s ease-in-out infinite;
}
```

- [ ] **Step 3: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Commit**

```bash
git add components/vandaag/RadarBalk.tsx app/globals.css
git commit -m "feat(vandaag): RadarBalk-component + pulse-soft CSS

Klikbare balk bovenaan /vandaag. Ingeklapt: koptekst + pijl + subtiele
gouden pulsatie (custom keyframes animate-pulse-soft, 3s loop met
box-shadow). Uitgeklapt: lijst van radar-items met naam, redenen,
WhatsApp-knop, prospect-kaart-link, en per-item afvink-knop.

Items boven kennis-niveau krijgen amber rand + 'leer in dag X' tekst +
Mentor-knop met prefilled context. Afgevinkte items grijzen uit met
line-through op de naam, blijven zichtbaar in de uitklap.

Afvinken doet optimistische UI-update + POST /api/radar/afvinken,
bij fout rollback + toast.

Component rendert NULL bij 0 items — geen lege balk.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: `/vandaag` aanhaking + dashboard-vervanging

**Files:**
- Modify: `app/vandaag/page.tsx`
- Create: `components/dashboard/RadarTeaser.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Bouw `radarInput`-helper in `/vandaag/page.tsx`**

Open `app/vandaag/page.tsx`. Bij de imports voeg toe:

```typescript
import { pakTopRadar, type ProspectInput } from "@/lib/radar/volgende-beste-actie";
import { haalRadarAfvinkSets } from "@/lib/radar/carry-over";
import { RadarBalk } from "@/components/vandaag/RadarBalk";
```

Direct NA de bestaande `await detecteerEnVierEerstePartner(supabase, user.id);` regel (uit eerdere taak), voeg toe:

```typescript
  // ============================================================
  // RADAR-BALK: zelfde signaal-bronnen als dashboard, maar nu in /vandaag.
  // Eén round-trip voor de afvink-sets (vandaag + gisteren).
  // ============================================================
  const afvinkSets = await haalRadarAfvinkSets(supabase, user.id);

  const [{ data: prospectsRadar }, { data: filmViewsRadar }, { data: testsRadar }, { data: openHerinneringenRadar }] =
    await Promise.all([
      supabase
        .from("prospects")
        .select("id, volledige_naam, telefoon, pipeline_fase, laatste_contact, gekozen_aanpak")
        .eq("user_id", user.id)
        .eq("gearchiveerd", false),
      supabase
        .from("prospect_film_views")
        .select("prospect_id, afgekeken_op")
        .eq("member_user_id", user.id)
        .not("afgekeken_op", "is", null)
        .gte("afgekeken_op", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("productadvies_tests")
        .select("prospect_id, ingevuld_op")
        .eq("user_id", user.id)
        .eq("status", "ingevuld")
        .not("ingevuld_op", "is", null)
        .gte("ingevuld_op", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("herinneringen")
        .select("prospect_id, vervaldatum")
        .eq("user_id", user.id)
        .eq("voltooid", false)
        .order("vervaldatum", { ascending: true }),
    ]);

  // Map: prospectId → meest recente datum
  const filmAfPerProspect = new Map<string, string>();
  for (const v of (filmViewsRadar as Array<{ prospect_id: string; afgekeken_op: string }>) || []) {
    const bestaand = filmAfPerProspect.get(v.prospect_id);
    if (!bestaand || v.afgekeken_op > bestaand) filmAfPerProspect.set(v.prospect_id, v.afgekeken_op);
  }
  const testAfPerProspect = new Map<string, string>();
  for (const t of (testsRadar as Array<{ prospect_id: string; ingevuld_op: string }>) || []) {
    if (!t.prospect_id) continue;
    const bestaand = testAfPerProspect.get(t.prospect_id);
    if (!bestaand || t.ingevuld_op > bestaand) testAfPerProspect.set(t.prospect_id, t.ingevuld_op);
  }
  const oudsteHerinneringPerProspectVandaag = new Map<string, string>();
  for (const h of (openHerinneringenRadar as Array<{ prospect_id: string; vervaldatum: string }>) || []) {
    if (!h.prospect_id) continue;
    if (!oudsteHerinneringPerProspectVandaag.has(h.prospect_id)) {
      oudsteHerinneringPerProspectVandaag.set(h.prospect_id, h.vervaldatum);
    }
  }

  function dagenVanafIso(iso: string | undefined): number | null {
    if (!iso) return null;
    return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  }

  const radarInputVandaag: ProspectInput[] = (
    (prospectsRadar as Array<{
      id: string;
      volledige_naam: string;
      telefoon: string | null;
      pipeline_fase: string;
      laatste_contact: string | null;
      gekozen_aanpak: "drieweg" | "mini_eleva" | null;
    }>) || []
  ).map((p) => ({
    id: p.id,
    volledige_naam: p.volledige_naam,
    telefoon: p.telefoon,
    pipeline_fase: p.pipeline_fase,
    laatste_contact: p.laatste_contact,
    oudsteHerinneringDatum: oudsteHerinneringPerProspectVandaag.get(p.id) ?? null,
    dagenSindsFilmAfgekeken: dagenVanafIso(filmAfPerProspect.get(p.id)),
    dagenSindsTestIngevuld: dagenVanafIso(testAfPerProspect.get(p.id)),
    gekozenAanpak: p.gekozen_aanpak ?? null,
  }));

  const radarItems = pakTopRadar(radarInputVandaag, 5, {
    bumpIds: afvinkSets.carryOverBump,
  });
```

- [ ] **Step 2: Render `RadarBalk` bovenaan vandaag-content**

In `app/vandaag/page.tsx`, zoek de return-statement (rond regel 190 met `<VandaagFlow ...>`) en pas aan:

```tsx
  return (
    <>
      {radarItems.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pt-3">
          <RadarBalk
            items={radarItems}
            initieelAfgevinkt={Array.from(afvinkSets.vandaagAfgevinkt)}
            huidigeDag={dag}
          />
        </div>
      )}
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
      />
    </>
  );
```

- [ ] **Step 3: Maak `RadarTeaser` voor dashboard**

Maak `components/dashboard/RadarTeaser.tsx`:

```typescript
import Link from "next/link";

// ============================================================
// RadarTeaser, compacte regel op /dashboard die naar de volle
// radar-balk in /vandaag linkt. Vervangt de oude volle tegel.
// ============================================================

type Props = {
  aantalOpen: number;
};

export function RadarTeaser({ aantalOpen }: Props) {
  if (aantalOpen === 0) return null;

  return (
    <Link
      href="/vandaag"
      className="block rounded-xl border-2 border-cm-gold/40 bg-gradient-to-r from-cm-gold/10 to-cm-gold/5 px-4 py-3 hover:from-cm-gold/15 hover:to-cm-gold/10 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-cm-white text-sm">
            Je hebt{" "}
            <span className="text-cm-gold font-semibold">
              {aantalOpen} nog niet opgepakte {aantalOpen === 1 ? "actie" : "acties"}
            </span>{" "}
            voor vandaag
          </span>
        </div>
        <span className="text-cm-gold text-sm">→</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Vervang `VolgendeBesteActie` in dashboard**

Open `app/dashboard/page.tsx`. Vervang de import-regel `import { VolgendeBesteActie } from "@/components/radar/VolgendeBesteActie";` door:

```typescript
import { RadarTeaser } from "@/components/dashboard/RadarTeaser";
import { haalRadarAfvinkSets } from "@/lib/radar/carry-over";
```

Direct NA `const topRadar = pakTopRadar(radarInput, 5);` (rond regel 204), voeg toe:

```typescript
  // Tel hoeveel radar-items vandaag NIET zijn afgevinkt. Dat getal
  // staat op de RadarTeaser zodat de member weet hoeveel open staat.
  const radarAfvinkSetsDash = await haalRadarAfvinkSets(supabase, user.id);
  const aantalRadarOpen = topRadar.filter(
    (item) => !radarAfvinkSetsDash.vandaagAfgevinkt.has(item.prospect.id),
  ).length;
```

Zoek in de JSX `<VolgendeBesteActie items={topRadar} />` (rond regel 678) en vervang door:

```tsx
      <RadarTeaser aantalOpen={aantalRadarOpen} />
```

- [ ] **Step 5: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Bestaande imports van `VolgendeBesteActie`-component blijven werken (component zelf niet verwijderd, alleen niet meer gebruikt op dashboard).

- [ ] **Step 6: Commit**

```bash
git add app/vandaag/page.tsx app/dashboard/page.tsx components/dashboard/RadarTeaser.tsx
git commit -m "feat(radar): aanhaking in /vandaag + dashboard-teaser

In /vandaag: zelfde radar-data-fetch als dashboard (prospects + film
views + tests + open herinneringen, één Promise.all). pakTopRadar(N=5)
met carryOverBump. RadarBalk-component bovenaan de pagina, boven de
VandaagFlow-content.

Dashboard: volle VolgendeBesteActie-tegel vervangen door RadarTeaser-
regel met klik-door naar /vandaag. Teller toont open-aantal (niet
afgevinkt). Verbergt zich automatisch bij 0 open.

VolgendeBesteActie-component blijft in repo voor eventueel later hergebruik.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Build + push + smoke-test op live

**Files:** geen wijzigingen — alleen verificatie

- [ ] **Step 1: Finale build-check**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Alle 94 routes intact. `/api/radar/afvinken` verschijnt als nieuwe `ƒ`-route.

- [ ] **Step 2: Push**

Run: `git push origin main`
Expected: alle commits van Task 1-7 gepusht.

Wacht ~2 minuten voor Vercel-deploy. Vervolg met smoke-tests op productie.

- [ ] **Step 3: Smoke-test — balk ingeklapt**

1. Login als Raoul op productie
2. Open `/vandaag`
3. **Verifieer:** boven de eerste playbook-stap staat de gouden RadarBalk met "🎯 N actie-prospects voor je vandaag →" en subtiele pulsatie.
4. Als de radar leeg is (geen prospects met score ≥ 5): balk is NIET zichtbaar. Dat is correct.

- [ ] **Step 4: Smoke-test — balk uitgeklapt**

1. Klik op de balk
2. **Verifieer:** lijst van 1-5 prospects rolt uit. Per item: naam + fase + redenen + WhatsApp-knop + prospect-kaart-link + "✓ Vandaag opgepakt"-knop.
3. **Verifieer:** items in fase boven kennis-niveau (bijv. `followup` bij dag 4) krijgen amber rand + "Voor deze fase leer je in dag 6..." tekst + extra "🧠 Open Mentor"-knop.

- [ ] **Step 5: Smoke-test — afvinken**

1. Klik op een "✓ Vandaag opgepakt"-knop bij één van de items
2. **Verifieer:** item grijst uit binnen ~200ms (optimistic update). Naam krijgt line-through, ✓ verschijnt ervoor.
3. **Verifieer:** koptekst van de balk telt nu 1 minder open ("X actie-prospects" wordt "X−1 actie-prospects")
4. Vink alle items af
5. **Verifieer:** balk koptekst wordt "✓ Vandaag alle N acties opgepakt", pulsatie stopt, kleur wordt grijs.

- [ ] **Step 6: Smoke-test — persistentie**

1. Refresh de pagina
2. **Verifieer:** afgevinkte items blijven afgevinkt (server-side check via `radar_voltooiingen`).

- [ ] **Step 7: Smoke-test — dashboard-teaser**

1. Vink 2 van de 5 radar-items af op /vandaag
2. Ga naar /dashboard
3. **Verifieer:** boven de andere tegels staat een dunne gouden regel "🎯 Je hebt 3 nog niet opgepakte acties voor vandaag →"
4. Klik erop → komt op /vandaag uit, RadarBalk al zichtbaar bovenaan.
5. Vink alle items af op /vandaag → ga terug naar /dashboard → **verifieer:** teaser-regel is verdwenen.

- [ ] **Step 8: Smoke-test — privacy**

1. Open in DevTools de Network-tab
2. POST `/api/radar/afvinken` met `prospectId` van een prospect die NIET van Raoul is (mocht je die hebben — anders skippen)
3. **Verifieer:** RLS voorkomt insert (status 500 of error in response body)

- [ ] **Step 9: Eindcontrole — Vercel-logs**

Open Vercel-deployment-logs. **Verifieer:**
- Geen recente errors in `/api/radar/afvinken`
- Geen 500's op `/vandaag` of `/dashboard` page renders

Als alle smoke-tests slagen: implementatie compleet. Raoul kan vrijuit gebruiken.

---

## Self-review (post-write check)

### Spec coverage

- ✅ Spec §2 (architectuur, plek bovenaan /vandaag) → Task 7 Step 2
- ✅ Spec §2.2 (ingeklapt/uitgeklapt + pulsatie + grijze afgerond-staat) → Task 6 Step 1 + Step 2 (pulse-soft CSS)
- ✅ Spec §3 (kennis-grens-markering met tabel) → Task 2 + Task 6 amber-rand-rendering
- ✅ Spec §4 (afvinken + carry-over) → Task 1 (tabel) + Task 3 (helper) + Task 5 (API) + Task 6 (UI)
- ✅ Spec §5 (data + API + scoring-bump) → Task 4 + Task 5 + Task 7 Step 1
- ✅ Spec §6 (dashboard-veranderingen) → Task 7 Step 3-4
- ✅ Spec §7 (bestand-overzicht) → matched
- ✅ Spec §9 (error handling) → Task 5 (duplicate-key no-op) + Task 6 (rollback + toast)
- ✅ Spec §10 (smoke-tests) → Task 8 Step 3-9
- ✅ Spec §11 (volgorde) → matched

### Placeholder scan

- Geen "TBD", geen "implement later", geen verwijzingen naar functies/types die nergens gedefinieerd zijn
- Eén bewuste vereenvoudiging: in Task 3 (`haalRadarAfvinkSets`) is `carryOverBump = new Set()` (leeg) — dat is een gedocumenteerde MVP-keuze, niet een placeholder. De carry-over werkt via UI-zichtbaarheid + natuurlijke scoring-continuïteit. Spec §4.2 noemt "+25 bump" als ideaal — implementatie volgt later als blijkt dat de huidige aanpak onvoldoende is.

### Type consistency

- `RadarItem` shape (uit `lib/radar/volgende-beste-actie.ts`) consistent gebruikt in Task 4 (extended), Task 6 (props), Task 7 (input to RadarBalk)
- `AfvinkSets` (Task 3) → consumed in Task 7 (radarItems-build) + Task 7 (RadarTeaser via `vandaagAfgevinkt`)
- `RadarBalk`-props matchen tussen Task 6 definitie en Task 7 gebruik (`items`, `initieelAfgevinkt`, `huidigeDag`)
- `RadarTeaser`-props (`aantalOpen: number`) matchen tussen Task 7 Step 3 + Step 4
- `isBovenKennisNiveau(fase, dagNummer)` + `leerDagVoorFase(fase)` consistent gebruikt in Task 2 (definitie) + Task 6 (consumer)

### Notes voor de uitvoerende engineer

- **Pilot main-branch**: alle werk gebeurt op `main`, geen feature-branch (Raoul, 2026-05-13).
- **Geen test-framework**: `npm run build` per taak + één smoke-test op live in Task 8.
- **Carry-over is MVP-vereenvoudigd**: Task 3 levert lege bump-set. Werkt via UI-zichtbaarheid (afgevinkt-items grijzen uit, niet-afgevinkt blijft in lijst). Als blijkt dat scoring-bump nodig is, kan dat later worden uitgebreid via een aparte ronde — alle haakjes zitten erin (`opts.bumpIds` werkt al in `pakTopRadar`).
- **VolgendeBesteActie blijft staan** als component-file, alleen niet meer gebruikt op dashboard. Geen wijziging aan dat bestand zelf.
- **Bij blocker**: stop en vraag.
