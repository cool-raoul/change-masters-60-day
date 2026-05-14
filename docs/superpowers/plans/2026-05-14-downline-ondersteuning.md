# Downline-ondersteuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Raoul has explicitly chosen "voer alles door" — no checkpoints between tasks, except the final smoke-test in Task 9. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Members krijgen automatisch een "🤝 Check je partners"-stap in /vandaag zodra hun eerste directe partner zich aanmeldt (via `profiles.sponsor_id`-koppeling). Plus een mijlpaal-viering bij eerste partner. Geen AI-tussenkomst in team-flow — sponsor schrijft zelf, ELEVA toont alleen signalen.

**Architecture:** Server-fetch helper + PostgreSQL `SECURITY DEFINER`-functie voor geaggregeerde signalen (privacy-laag), nieuwe inline-embed `partner-check` in dag-flow (tempo-aware + weekritme + statische fallback), `partner_mijlpalen`-tabel voor mijlpaal-state, push-trigger + dashboard-tegel voor eerste-partner-viering.

**Tech Stack:** Next.js 15 App Router (server + client components), TypeScript, Supabase (PostgreSQL + RLS + RPC), web-push (VAPID), Tailwind CSS. Geen test-framework — verificatie via `npm run build` na elke taak + één smoke-test op live in Task 9.

**Spec:** [docs/superpowers/specs/2026-05-14-downline-ondersteuning-design.md](../specs/2026-05-14-downline-ondersteuning-design.md)

---

## File Structure

**Created:**
- `lib/supabase/migrations/partner_mijlpalen.sql` — DB-migratie (tabel + 2 functies + RPC)
- `lib/team/partner-overview.ts` — server-helper die de RPC aanroept en transformeert
- `components/vandaag/inline-embeds/PartnerCheckEmbed.tsx` — inline-embed component
- `components/dashboard/EerstePartnerVieringTegel.tsx` — eenmalige viering-tegel
- `app/api/team/partner-overview/route.ts` — REST-endpoint die de helper aanroept

**Modified:**
- `lib/playbook/types.ts` — `inlineEmbed`-union uitbreiden met `"partner-check"`
- `lib/playbook/tempo-aware.ts` — `PARTNER_CHECK_UITLEG`-constant + partner-check-stap toevoegen aan elke `bouwDag*VandaagDoen` en `standaardABCDEstappen`
- `lib/playbook/weekritme.ts` — partner-check-stap toevoegen aan `genereerWeekritmeDag`
- `lib/playbook/dagen.ts` — partner-check-stap toevoegen aan elke statische dag (fallback voor founders zonder tempo)
- `app/vandaag/vandaag-flow.tsx` — render `PartnerCheckEmbed` op `inlineEmbed === "partner-check"`
- `app/vandaag/page.tsx` — eerste-partner-mijlpaal-detectie + push-trigger server-side
- `app/dashboard/page.tsx` — `EerstePartnerVieringTegel` renderen bij querystring of recent mijlpaal

---

## Task 1: DB-migratie — `partner_mijlpalen` + helper-functies + RPC

**Files:**
- Create: `lib/supabase/migrations/partner_mijlpalen.sql`

- [ ] **Step 1: Maak de migratie-SQL aan**

Maak een nieuw bestand `lib/supabase/migrations/partner_mijlpalen.sql` met deze volledige inhoud:

```sql
-- ============================================================
-- Partner-mijlpalen — viering-state per member
--
-- Eén rij per gevierde mijlpaal. UNIQUE op (user_id, type) zorgt
-- ervoor dat een eerste-partner-viering exact één keer plaatsvindt.
--
-- Bij verwijdering van de partner blijft de mijlpaal staan
-- (ON DELETE SET NULL op partner_id) — de viering ging immers
-- echt gebeuren.
-- ============================================================

CREATE TABLE IF NOT EXISTS partner_mijlpalen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  gevierd_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_partner_mijlpalen_user
  ON partner_mijlpalen (user_id);

ALTER TABLE partner_mijlpalen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_mijlpalen_select" ON partner_mijlpalen;
CREATE POLICY "eigen_mijlpalen_select"
  ON partner_mijlpalen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_mijlpalen_insert" ON partner_mijlpalen;
CREATE POLICY "eigen_mijlpalen_insert"
  ON partner_mijlpalen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Helper-functie: % verplichte taken voltooid in N afgelopen dagen
--
-- Returns 0-100. Telt UNIEKE (dag_nummer, taak_id) voltooiingen
-- in afgelopen N dagen voor user_id, gedeeld door totaal aantal
-- verplichte taken in dezelfde periode. Voor MVP gebruiken we
-- het aantal voltooiingen direct als proxy zonder per-dag-totaal
-- te kennen — dit is een ruwe-maar-bruikbare metric.
-- ============================================================

CREATE OR REPLACE FUNCTION bereken_taken_voltooid_pct(
  p_user_id UUID,
  p_dagen_terug INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_voltooid INT;
  v_dagen INT;
  v_verwacht_per_dag INT := 6;
BEGIN
  SELECT COUNT(*) INTO v_voltooid
  FROM dag_voltooiingen
  WHERE user_id = p_user_id
    AND voltooid_op > (now() - (p_dagen_terug || ' days')::INTERVAL);

  v_dagen := GREATEST(p_dagen_terug, 1);

  RETURN LEAST(
    100,
    GREATEST(
      0,
      ROUND((v_voltooid::NUMERIC / (v_dagen * v_verwacht_per_dag)::NUMERIC) * 100)::INT
    )
  );
END;
$$;

-- ============================================================
-- Helper-functie: bereken huidige dag uit run_startdatum
-- Kalender-modus: dagen sinds startdatum + 1, gecapped op 1-60.
-- ============================================================

CREATE OR REPLACE FUNCTION bereken_huidige_dag_voor_partner(
  p_run_startdatum DATE
)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_run_startdatum IS NULL THEN
    RETURN 1;
  END IF;

  RETURN LEAST(60, GREATEST(1, (CURRENT_DATE - p_run_startdatum)::INT + 1));
END;
$$;

-- ============================================================
-- Hoofd-RPC: partner_overview_voor_sponsor
--
-- Returnt directe partners + 2e laag voor een sponsor.
-- SECURITY DEFINER zodat sponsor alleen geaggregeerde velden
-- ziet (geen prospect-namen, geen Mentor-gesprekken).
-- ============================================================

CREATE OR REPLACE FUNCTION partner_overview_voor_sponsor(
  p_sponsor_id UUID
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  role TEXT,
  modus TEXT,
  huidige_dag INT,
  laatst_gezien_uren INT,
  taken_voltooid_pct INT,
  is_directe_partner BOOLEAN,
  via_partner_naam TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Toegangscheck: sponsor moet zichzelf opvragen
  IF auth.uid() IS DISTINCT FROM p_sponsor_id THEN
    RAISE EXCEPTION 'Geen toegang tot andermans partner-overview';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.role::TEXT,
    p.modus::TEXT,
    bereken_huidige_dag_voor_partner(p.run_startdatum::DATE),
    CASE
      WHEN COALESCE(p.presence_zichtbaar, false) = true AND p.last_seen_at IS NOT NULL
      THEN GREATEST(0, EXTRACT(EPOCH FROM (now() - p.last_seen_at))::INT / 3600)
      ELSE NULL
    END,
    bereken_taken_voltooid_pct(p.id, 7),
    true,
    NULL::TEXT
  FROM profiles p
  WHERE p.sponsor_id = p_sponsor_id

  UNION ALL

  SELECT
    p2.id,
    p2.full_name,
    p2.role::TEXT,
    p2.modus::TEXT,
    bereken_huidige_dag_voor_partner(p2.run_startdatum::DATE),
    CASE
      WHEN COALESCE(p2.presence_zichtbaar, false) = true AND p2.last_seen_at IS NOT NULL
      THEN GREATEST(0, EXTRACT(EPOCH FROM (now() - p2.last_seen_at))::INT / 3600)
      ELSE NULL
    END,
    bereken_taken_voltooid_pct(p2.id, 7),
    false,
    p1.full_name
  FROM profiles p2
  JOIN profiles p1 ON p2.sponsor_id = p1.id
  WHERE p1.sponsor_id = p_sponsor_id
    AND p2.id != p_sponsor_id
  LIMIT 50;
END;
$$;
```

- [ ] **Step 2: Voer de migratie uit op de Supabase-DB**

Run: `node scripts/sql.mjs lib/supabase/migrations/partner_mijlpalen.sql`
Expected: "Migratie uitgevoerd" of vergelijkbare success-melding zonder errors.

- [ ] **Step 3: Verifieer dat tabel en functies bestaan**

Run: `node scripts/sql.mjs --query "SELECT to_regclass('partner_mijlpalen') AS tabel, to_regprocedure('partner_overview_voor_sponsor(uuid)') AS rpc;"`
Expected: `tabel: "partner_mijlpalen", rpc: "partner_overview_voor_sponsor(uuid)"` (geen nulls).

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/migrations/partner_mijlpalen.sql
git commit -m "feat(db): partner_mijlpalen tabel + RPC partner_overview_voor_sponsor

Drie nieuwe SQL-objecten:
1. Tabel partner_mijlpalen met UNIQUE(user_id, type) zodat eerste-
   partner-viering exact één keer plaatsvindt.
2. Helper-functie bereken_taken_voltooid_pct(user_id, dagen_terug)
   geeft 0-100% terug.
3. Helper-functie bereken_huidige_dag_voor_partner(run_startdatum)
   kalender-modus berekening.
4. Hoofd-RPC partner_overview_voor_sponsor met SECURITY DEFINER:
   sponsor ziet directe + 2e laag met alleen geaggregeerde signalen.
   Toegangscheck: auth.uid() moet matchen.

Geen wijziging aan profiles-tabel; sponsor_id, last_seen_at en
presence_zichtbaar bestaan al.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Server-helper + API-route

**Files:**
- Create: `lib/team/partner-overview.ts`
- Create: `app/api/team/partner-overview/route.ts`

- [ ] **Step 1: Maak server-helper**

Maak `lib/team/partner-overview.ts`:

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// lib/team/partner-overview.ts
//
// Server-helper die de partner_overview_voor_sponsor-RPC aanroept
// en het resultaat transformeert naar een Client-vriendelijke shape.
// SECURITY DEFINER zit in de RPC zelf, dus deze helper hoeft geen
// extra autorisatie te doen — gewoon de auth-aware client doorgeven.
//
// Berekent ook is_urgent: >72u stil OF <30% taken voltooid afgelopen
// 7 dagen. Dat is een client-veld (visualisatie), niet iets dat we
// per-fetch herhalen op de DB.
// ============================================================

export type PartnerInfo = {
  userId: string;
  fullName: string;
  role: "lid" | "leider" | "founder" | string;
  modus: "sprint" | "core" | "pro" | null | string;
  huidigeDag: number;
  laatstGezienUren: number | null;
  takenVoltooidPct: number;
  isUrgent: boolean;
  isDirectePartner: boolean;
  viaPartnerNaam: string | null;
};

export type PartnerOverview = {
  directe: PartnerInfo[];
  tweedeLaag: PartnerInfo[];
};

type RpcRij = {
  user_id: string;
  full_name: string;
  role: string;
  modus: string | null;
  huidige_dag: number;
  laatst_gezien_uren: number | null;
  taken_voltooid_pct: number;
  is_directe_partner: boolean;
  via_partner_naam: string | null;
};

function isUrgent(rij: RpcRij): boolean {
  const tooStil = rij.laatst_gezien_uren !== null && rij.laatst_gezien_uren > 72;
  const tooWeinigTaken = rij.taken_voltooid_pct < 30;
  return tooStil || tooWeinigTaken;
}

export async function haalPartnerOverview(
  supabase: SupabaseClient,
  sponsorUserId: string,
): Promise<PartnerOverview> {
  const { data, error } = await supabase.rpc("partner_overview_voor_sponsor", {
    p_sponsor_id: sponsorUserId,
  });

  if (error) {
    console.error("haalPartnerOverview RPC error:", error);
    return { directe: [], tweedeLaag: [] };
  }

  const rijen = (data as RpcRij[] | null) ?? [];

  const directe: PartnerInfo[] = [];
  const tweedeLaag: PartnerInfo[] = [];

  for (const rij of rijen) {
    const info: PartnerInfo = {
      userId: rij.user_id,
      fullName: rij.full_name,
      role: rij.role,
      modus: rij.modus,
      huidigeDag: rij.huidige_dag,
      laatstGezienUren: rij.laatst_gezien_uren,
      takenVoltooidPct: rij.taken_voltooid_pct,
      isUrgent: isUrgent(rij),
      isDirectePartner: rij.is_directe_partner,
      viaPartnerNaam: rij.via_partner_naam,
    };
    if (rij.is_directe_partner) {
      directe.push(info);
    } else {
      tweedeLaag.push(info);
    }
  }

  return { directe, tweedeLaag };
}
```

- [ ] **Step 2: Maak API-route**

Maak `app/api/team/partner-overview/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { haalPartnerOverview } from "@/lib/team/partner-overview";

// ============================================================
// GET /api/team/partner-overview
//
// Returnt directe partners + 2e laag voor de ingelogde gebruiker.
// Server-helper roept SECURITY DEFINER-RPC aan; de RPC zelf doet
// de toegangscheck op auth.uid() = sponsorUserId.
// ============================================================

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const overview = await haalPartnerOverview(supabase, user.id);
    return NextResponse.json(overview);
  } catch (err) {
    console.error("partner-overview route exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully` zonder TypeScript-fouten. De route verschijnt in de build-output als `ƒ /api/team/partner-overview`.

- [ ] **Step 4: Commit**

```bash
git add lib/team/partner-overview.ts "app/api/team/partner-overview/route.ts"
git commit -m "feat(team): partner-overview server-helper + API-route

haalPartnerOverview roept de partner_overview_voor_sponsor-RPC aan
en transformeert het resultaat naar { directe, tweedeLaag } met
PartnerInfo-objecten. Berekent client-zijde 'isUrgent' op basis van
>72u stil OF <30% taken laatste 7 dagen.

GET /api/team/partner-overview is de simpele REST-wrapper voor
PartnerCheckEmbed (komt in Task 4).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Type-uitbreiding `inlineEmbed`

**Files:**
- Modify: `lib/playbook/types.ts` (regel met `inlineEmbed`-union)

- [ ] **Step 1: Voeg `"partner-check"` toe aan de inlineEmbed-union**

Open `lib/playbook/types.ts`. Zoek de `inlineEmbed?:`-union (eerder uitgebreid met `"funnel-analyse"`). Vervang het hele veld:

```typescript
  /**
   * Toegestane waardes mappen 1-op-1 op componenten in
   * `components/vandaag/inline-embeds/`:
   *   - 'vcard-upload'    → VCardUploader (.vcf bulk-import + reservoir)
   *   - 'sponsor-melding' → SponsorMeldingKnop (wa.me bericht naar sponsor)
   *   - 'namen-form'      → NamenForm (snelle handmatige naam-invoer met
   *                         doel-aantal, bv. '20 namen toevoegen')
   *   - 'funnel-analyse'  → MentorFunnelAnalyseKnop (auto-prefilled
   *                         Mentor-analyse op basis van pipeline-cijfers,
   *                         dag 7/14/21 + later op week-overzichten)
   *   - 'partner-check'   → PartnerCheckEmbed (directe + 2e laag downline
   *                         met geaggregeerde signalen + lege WhatsApp-
   *                         knop, geen AI-tussenkomst)
   */
  inlineEmbed?:
    | "vcard-upload"
    | "sponsor-melding"
    | "namen-form"
    | "funnel-analyse"
    | "partner-check";
```

- [ ] **Step 2: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Geen wijziging in build-output — alleen type-uitbreiding.

- [ ] **Step 3: Commit**

```bash
git add lib/playbook/types.ts
git commit -m "feat(types): partner-check inlineEmbed-waarde toevoegen

Vijfde waarde in ControllableTaak.inlineEmbed-union, voor de
PartnerCheckEmbed-component die in Task 4 komt.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `PartnerCheckEmbed`-component + `PARTNER_CHECK_UITLEG`

**Files:**
- Create: `components/vandaag/inline-embeds/PartnerCheckEmbed.tsx`
- Modify: `lib/playbook/tempo-aware.ts` (export PARTNER_CHECK_UITLEG)

- [ ] **Step 1: Maak component-bestand**

Maak `components/vandaag/inline-embeds/PartnerCheckEmbed.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PartnerInfo, PartnerOverview } from "@/lib/team/partner-overview";

// ============================================================
// PartnerCheckEmbed, inline-embed in /vandaag voor sponsor-rol.
//
// Toont directe partners + 2e laag uitklap. Per directe partner:
// naam, tempo, dag, laatste login, % taken deze week. WhatsApp-knop
// opent een LEEG gesprek (geen ?text=...) — sponsor schrijft zelf.
//
// Filosofische basis (Raoul, 2026-05-14): geen AI-tussenkomst in
// team-flow. ELEVA toont waar aandacht nodig is, mens schrijft zelf.
//
// Component rendert NULL als geen directe partners gevonden, zodat
// members zonder downline geen lege stap zien.
// ============================================================

type Props = {
  opVoltooid: () => void;
  alVoltooid: boolean;
};

type TelefoonMap = Record<string, string | null>;

function urgencyKleur(p: PartnerInfo): string {
  if (p.isUrgent) return "border-amber-500/50 bg-amber-900/15";
  return "border-cm-border bg-cm-bg/40";
}

function stil(uren: number | null): string {
  if (uren === null) return "Activiteit niet gedeeld";
  if (uren < 1) return "Nog geen uur geleden ingelogd";
  if (uren < 24) return `${uren}u geleden ingelogd`;
  const dagen = Math.floor(uren / 24);
  return `${dagen} ${dagen === 1 ? "dag" : "dagen"} stil`;
}

function whatsAppLink(telefoon: string | null): string | null {
  if (!telefoon) return null;
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("00")) nummer = nummer.substring(2);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}`;
}

export function PartnerCheckEmbed({ opVoltooid, alVoltooid }: Props) {
  const [overview, setOverview] = useState<PartnerOverview | null>(null);
  const [telefoons, setTelefoons] = useState<TelefoonMap>({});
  const [laden, setLaden] = useState(true);
  const [tweedeLaagOpen, setTweedeLaagOpen] = useState(false);
  const [bevestigd, setBevestigd] = useState(alVoltooid);

  useEffect(() => {
    let actief = true;
    (async () => {
      try {
        const res = await fetch("/api/team/partner-overview");
        if (!actief) return;
        if (!res.ok) {
          setLaden(false);
          return;
        }
        const data = (await res.json()) as PartnerOverview;
        if (!actief) return;
        setOverview(data);

        // Haal telefoonnummers op voor WhatsApp-knoppen.
        // Sponsor mag alleen voor zijn directe partners het telefoonnr
        // zien (RLS op profiles staat dat toe via sponsor_id-koppeling).
        // Voor de 2e laag NIET nodig (geen WhatsApp-knop daar).
        const directeIds = data.directe.map((p) => p.userId);
        if (directeIds.length > 0) {
          const supabase = createClient();
          const { data: telRows } = await supabase
            .from("profiles")
            .select("id, telefoon")
            .in("id", directeIds);
          if (!actief) return;
          const map: TelefoonMap = {};
          for (const r of (telRows as Array<{ id: string; telefoon: string | null }> | null) ?? []) {
            map[r.id] = r.telefoon;
          }
          setTelefoons(map);
        }
      } catch {
        // negeer, render lege staat
      } finally {
        if (actief) setLaden(false);
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  // Geen partners: rendert helemaal niets. Member ziet geen lege stap.
  if (!laden && (!overview || overview.directe.length === 0)) {
    return null;
  }

  if (bevestigd) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-2">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Partner-check vandaag gedaan
        </p>
        <p className="text-cm-white opacity-80 text-xs">
          Top, je hebt je partners vandaag bewust aandacht gegeven.
        </p>
      </div>
    );
  }

  if (laden) {
    return (
      <div className="rounded-lg border-2 border-cm-border bg-cm-surface px-4 py-4">
        <p className="text-cm-white opacity-60 text-sm">Partners ophalen…</p>
      </div>
    );
  }

  const directe = overview?.directe ?? [];
  const tweedeLaag = overview?.tweedeLaag ?? [];

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-3">
      <div className="space-y-1">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          🤝 Jouw partners
        </p>
        <p className="text-cm-white/85 text-xs leading-relaxed">
          Sponsor-zijn is een MENSELIJKE rol. Geen scripts, geen AI-zinnen. ELEVA
          toont je waar aandacht nodig is. Wat je stuurt, kies je zelf, in jouw
          eigen woorden.
        </p>
      </div>

      {/* Directe partners */}
      <div className="space-y-2">
        {directe.map((p) => {
          const waLink = whatsAppLink(telefoons[p.userId] ?? null);
          return (
            <div
              key={p.userId}
              className={`rounded-md border px-3 py-2.5 space-y-1.5 ${urgencyKleur(p)}`}
            >
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="text-cm-white font-semibold text-sm">
                  {p.isUrgent && <span className="mr-1">⚠️</span>}
                  {p.fullName}
                  {p.modus && (
                    <span className="text-cm-white/50 text-[11px] font-normal ml-2">
                      · {p.modus === "sprint" ? "Sprint" : p.modus === "core" ? "Core" : "Pro"}
                    </span>
                  )}
                </p>
                <span className="text-cm-white/55 text-[11px] tabular-nums">
                  Dag {p.huidigeDag}
                </span>
              </div>
              <p className="text-cm-white/70 text-xs">
                {stil(p.laatstGezienUren)} · {p.takenVoltooidPct}% taken deze week
              </p>
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-block py-1.5 px-3 text-xs font-semibold"
                >
                  💬 Stuur {p.fullName.split(" ")[0]} een bericht
                </a>
              ) : (
                <p className="text-cm-white/40 text-[11px] italic">
                  📞 Telefoonnummer niet bekend
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 2e laag uitklap */}
      {tweedeLaag.length > 0 && (
        <div className="pt-2 border-t border-cm-gold/20">
          <button
            type="button"
            onClick={() => setTweedeLaagOpen((v) => !v)}
            className="text-cm-gold/80 hover:text-cm-gold text-xs font-semibold"
          >
            {tweedeLaagOpen ? "▼" : "▶"} Indirecte downline ({tweedeLaag.length})
          </button>
          {tweedeLaagOpen && (
            <div className="space-y-1.5 mt-2">
              {tweedeLaag.map((p) => (
                <div
                  key={p.userId}
                  className="rounded-md border border-cm-border bg-cm-bg/30 px-3 py-2"
                >
                  <p className="text-cm-white/85 text-xs">
                    {p.isUrgent && <span className="mr-1">⚠️</span>}
                    {p.fullName}{" "}
                    <span className="text-cm-white/45">
                      via {p.viaPartnerNaam ?? "—"} · dag {p.huidigeDag}
                    </span>
                  </p>
                  <p className="text-cm-white/50 text-[11px]">
                    {stil(p.laatstGezienUren)} · {p.takenVoltooidPct}% taken
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Afvink-knop */}
      <button
        type="button"
        onClick={() => {
          setBevestigd(true);
          opVoltooid();
        }}
        className="btn-gold w-full py-2.5 text-sm font-semibold"
      >
        ✓ Partner-check gedaan
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Voeg PARTNER_CHECK_UITLEG constant toe in tempo-aware.ts**

Open `lib/playbook/tempo-aware.ts`. Bovenaan na de import-regels, vóór de `STORIES_UITLEG`-constant, voeg toe:

```typescript
// ============================================================
// Tekst voor de "🤝 Check je partners"-stap die verschijnt zodra
// een member directe downline heeft. De component PartnerCheckEmbed
// rendert zichzelf onzichtbaar als geen partners gevonden — dus de
// stap is altijd veilig toe te voegen aan elke dag.
//
// Geen AI-tussenkomst (Raoul, 2026-05-14): tekst zegt expliciet
// dat sponsor zelf schrijft in eigen woorden.
// ============================================================

export const PARTNER_CHECK_UITLEG = `Sponsor-zijn is een MENSELIJKE rol. Geen scripts, geen AI-zinnen — gewoon jij die contact houdt met de mensen die jij hebt aangemeld. ELEVA toont je waar aandacht nodig is. Wat je stuurt, kies je zelf, in jouw eigen woorden.

Hieronder zie je je directe partners (en optioneel de 2e laag via uitklap-knop). Per partner: hun dag, hun laatste login, en hoeveel % van hun verplichte taken ze deze week hebben afgevinkt. Een ⚠️-icoon verschijnt bij urgentie (>72u stil OF <30% taken).

WhatsApp-knop opent een LEEG gesprek. Schrijf zelf wat past — een hartelijk "hoe gaat het?", een specifieke vraag over waar ze stuk lopen, of gewoon een complimentje voor doorzettings-vermogen.

Wil je dieper leren hoe je sponsor bent? In de Academy staat de Audio-onderweg-training met Skill #6 — "Helping Your New Distributor Get Started Right". Luister 'm in de auto of tijdens een wandeling, niet hier in een snelle-fix.`;
```

- [ ] **Step 3: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Geen functionele wijzigingen op routes — alleen de constant + component zijn aangemaakt maar nog niet gebruikt.

- [ ] **Step 4: Commit**

```bash
git add components/vandaag/inline-embeds/PartnerCheckEmbed.tsx lib/playbook/tempo-aware.ts
git commit -m "feat(team): PartnerCheckEmbed component + uitleg-constant

Inline-embed-component die de partner-overview ophaalt en rendert.
Per directe partner: naam + tempo + dag + activity + % taken, plus
WhatsApp-knop die een LEEG gesprek opent (geen ?text=). 2e laag als
collapsible uitklap zonder WhatsApp-knoppen (alleen info).

Component rendert NULL bij 0 directe partners — members zonder
downline zien geen lege stap.

PARTNER_CHECK_UITLEG geëxporteerd uit tempo-aware.ts zodat
weekritme.ts en dagen.ts hem kunnen importeren.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Aanhaking in vandaag-flow.tsx

**Files:**
- Modify: `app/vandaag/vandaag-flow.tsx` (imports + inline-embed-switch)

- [ ] **Step 1: Voeg PartnerCheckEmbed-import toe**

Open `app/vandaag/vandaag-flow.tsx`. Zoek de regel met `import { MentorFunnelAnalyseKnop } from ...`. Voeg DIRECT DAARNA toe:

```typescript
import { PartnerCheckEmbed } from "@/components/vandaag/inline-embeds/PartnerCheckEmbed";
```

- [ ] **Step 2: Voeg de `partner-check`-case toe aan de inline-embed-switch**

In dezelfde file, zoek het blok met `huidigeTaak.inlineEmbed === "funnel-analyse"`. Voeg DIRECT NA dat blok toe (vóór `vereistMobiel`-check, na de funnel-analyse-block):

```tsx
            {huidigeTaak.inlineEmbed === "partner-check" && (
              <PartnerCheckEmbed
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                opVoltooid={() => {
                  vinkAf(huidigeTaak.id, true);
                }}
              />
            )}
```

- [ ] **Step 3: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Nog steeds geen zichtbaar effect — de stap moet nog aan de dag-flow worden toegevoegd in Task 6.

- [ ] **Step 4: Commit**

```bash
git add app/vandaag/vandaag-flow.tsx
git commit -m "feat(vandaag): render PartnerCheckEmbed op inlineEmbed=partner-check

Vijfde inline-embed-case in vandaag-flow. Volgt zelfde patroon als
sponsor-melding/funnel-analyse: alVoltooid + opVoltooid props,
afvinken via parent vinkAf.

Stap zelf wordt aan dag-array toegevoegd in Task 6 (tempo-aware +
weekritme + fallback).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Partner-check-stap toevoegen aan alle dag-builders

**Files:**
- Modify: `lib/playbook/tempo-aware.ts` (in `standaardABCDEstappen` + elke `bouwDag*VandaagDoen` voor dag 3/4/5/6/7)
- Modify: `lib/playbook/weekritme.ts` (in `genereerWeekritmeDag`)
- Modify: `lib/playbook/dagen.ts` (statische `vandaagDoen` van dag 1-21 als fallback)

- [ ] **Step 1: Definieer een helper-functie `partnerCheckStap`**

In `lib/playbook/tempo-aware.ts`, na de `PARTNER_CHECK_UITLEG`-constant maar vóór `bouwDag3VandaagDoen`, voeg toe:

```typescript
/**
 * Helper die de standaard partner-check-stap genereert voor een
 * specifieke dag. PartnerCheckEmbed rendert zichzelf onzichtbaar
 * als de member geen directe partners heeft, dus we kunnen deze
 * stap veilig aan elke dag toevoegen zonder onderzoek of een
 * member wel of niet sponsor is.
 */
export function partnerCheckStap(dagNummer: number): ControllableTaak {
  return {
    id: `dag${dagNummer}-partner-check`,
    label: "🤝 Check je nieuwe partner(s) vandaag",
    uitleg: PARTNER_CHECK_UITLEG,
    verplicht: false,
    inlineEmbed: "partner-check",
  };
}
```

- [ ] **Step 2: Voeg de stap toe aan `bouwDag3VandaagDoen`, `bouwDag4VandaagDoen`, ..., `bouwDag7VandaagDoen` na de sponsor-stap**

In `lib/playbook/tempo-aware.ts`, zoek bouwDag3VandaagDoen (rond regel 60). Aan het EINDE van de returned array (NA de `dag3-sponsor-checkin`-stap, vóór de afsluitende `];`) voeg toe:

```typescript
    partnerCheckStap(3),
```

Herhaal hetzelfde voor:
- `bouwDag4VandaagDoen` → `partnerCheckStap(4)` na de sponsor-checkin
- `bouwDag5VandaagDoen` → `partnerCheckStap(5)`
- `bouwDag6VandaagDoen` → `partnerCheckStap(6)`
- `bouwDag7VandaagDoen` → `partnerCheckStap(7)`

Vanwege de DRY-helper `standaardABCDEstappen` (die door bouwDag8+ gebruikt wordt) hoeven we daar niet ELKE bouwer aan te passen — `standaardABCDEstappen` retourneert geen sponsor-stap zelf. De sponsor-stap zit in elke `bouwDag*VandaagDoen`-functie afzonderlijk. We pakken de bouwers 8 t/m 21 ook één voor één.

- [ ] **Step 3: Voeg partner-check toe aan bouwDag8 t/m bouwDag21**

In `lib/playbook/tempo-aware.ts`, voor ELKE `bouwDag*VandaagDoen` van 8 t/m 21:
- Zoek de sponsor-stap (laatste optionele stap met `inlineEmbed: "sponsor-melding"` of `inlineEmbed: "sponsor-checkin"`)
- Voeg DIRECT DAARNA toe: `partnerCheckStap(N)` waar N het dag-nummer is

Tip: zoek met grep naar `id: "dag\d+-sponsor` om alle sponsor-stappen te vinden, dan na elke entry een nieuwe regel voor partnerCheckStap.

- [ ] **Step 4: Voeg partner-check toe aan `genereerWeekritmeDag`**

Open `lib/playbook/weekritme.ts`. Zoek het einde van `genereerWeekritmeDag`-functie waar de array stappen wordt opgebouwd. NA de sponsor-checkin/-call-push, vóór de `return { nummer, titel, ... }`-statement, voeg toe:

```typescript
  // Partner-check als laatste stap. Component rendert onzichtbaar
  // wanneer member geen partners heeft, dus altijd veilig toe te voegen.
  stappen.push({
    id: `dag${dagNummer}-partner-check`,
    label: "🤝 Check je nieuwe partner(s) vandaag",
    uitleg: PARTNER_CHECK_UITLEG,
    verplicht: false,
    inlineEmbed: "partner-check",
  });
```

En bovenaan `weekritme.ts` (bij de bestaande imports vanaf `./tempo-aware`) voeg `PARTNER_CHECK_UITLEG` toe:

```typescript
import {
  FOLLOWUP_UITLEG_NA_DAG6,
  PARTNER_CHECK_UITLEG,
  STORIES_UITLEG,
  standaardABCDEstappen,
} from "./tempo-aware";
```

- [ ] **Step 5: Voeg partner-check toe aan statische dagen 1-21 in `lib/playbook/dagen.ts` (fallback)**

Open `lib/playbook/dagen.ts`. Voor dag 1 t/m dag 21, voeg aan het EINDE van elke `vandaagDoen`-array (NA de bestaande laatste stap) een partner-check-stap toe. Hier doen we het iets anders omdat dagen.ts vaste objecten heeft (geen functies), en geen toegang tot `PARTNER_CHECK_UITLEG`:

Bovenaan `dagen.ts` (bij imports), voeg toe:

```typescript
import { PARTNER_CHECK_UITLEG } from "@/lib/playbook/tempo-aware";
```

Voor ELKE dag (1 t/m 21), voeg aan het EINDE van `vandaagDoen` array deze entry toe:

```typescript
      {
        id: `dag${N}-partner-check`,
        label: "🤝 Check je nieuwe partner(s) vandaag",
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: "partner-check",
      },
```

Waar `N` het dag-nummer is. Dat is 21 invoegingen — bewaar consistent een blank-regel ervoor zodat het bestand leesbaar blijft.

Tip voor uitvoering: gebruik een Node-script om dit programmatisch toe te voegen:

```bash
node -e "
const fs = require('fs');
let content = fs.readFileSync('lib/playbook/dagen.ts', 'utf8');
// Voeg partner-check toe vóór elke ']' die het einde van een vandaagDoen-array markeert
// (zoek het patroon waarna meteen 'faseDoel:' komt)
const pattern = /(\n    \],\n    faseDoel:)/g;
let nr = 0;
content = content.replace(pattern, (match, p1) => {
  nr++;
  return \`,\n      {\n        id: 'dag\${nr}-partner-check',\n        label: '🤝 Check je nieuwe partner(s) vandaag',\n        uitleg: PARTNER_CHECK_UITLEG,\n        verplicht: false,\n        inlineEmbed: 'partner-check',\n      },\` + p1;
});
fs.writeFileSync('lib/playbook/dagen.ts', content);
console.log('Partner-check toegevoegd aan', nr, 'dagen.');
"
```

- [ ] **Step 6: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Geen TypeScript-fouten. Op `/vandaag` zou nu (voor een member met partners) de "🤝 Check je nieuwe partner(s)"-stap zichtbaar zijn als laatste optionele stap.

- [ ] **Step 7: Commit**

```bash
git add lib/playbook/tempo-aware.ts lib/playbook/weekritme.ts lib/playbook/dagen.ts
git commit -m "feat(playbook): partner-check stap toegevoegd aan dag 1-60

partnerCheckStap(dagNummer) helper in tempo-aware.ts. Stap toegevoegd
als LAATSTE optionele stap (na sponsor-checkin/-call) in:
- bouwDag3 t/m bouwDag21VandaagDoen (tempo-aware)
- genereerWeekritmeDag (dag 22-60 weekritme)
- statische DAGEN[]-array (dag 1-21 fallback voor founders zonder tempo)

PartnerCheckEmbed rendert NULL bij 0 partners, dus geen ruis voor
members zonder downline.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Eerste-partner-mijlpaal-detectie + push

**Files:**
- Modify: `app/vandaag/page.tsx` (server-side mijlpaal-detectie)
- Create-or-Modify: `lib/team/mijlpaal-detector.ts`

- [ ] **Step 1: Maak mijlpaal-detector-helper**

Maak `lib/team/mijlpaal-detector.ts`:

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sendPush";

// ============================================================
// lib/team/mijlpaal-detector.ts
//
// Bij elk /vandaag- en /dashboard-bezoek (server-side) checken of
// member zijn eerste partner heeft gekregen. Als ja én nog niet
// gevierd: registreer mijlpaal-rij + stuur push.
//
// Mijlpaal blijft uniek per (user_id, 'eerste-partner') via UNIQUE
// constraint op partner_mijlpalen-tabel.
// ============================================================

export type MijlpaalStatus = {
  /** True bij het exacte bezoek waarin de mijlpaal werd geregistreerd. */
  zojuistGevierd: boolean;
  /** Naam van eerste partner — alleen gevuld als zojuistGevierd=true. */
  eerstePartnerNaam: string | null;
};

export async function detecteerEnVierEerstePartner(
  supabase: SupabaseClient,
  userId: string,
): Promise<MijlpaalStatus> {
  // 1. Heeft member al eerste-partner-mijlpaal?
  const { data: bestaand } = await supabase
    .from("partner_mijlpalen")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "eerste-partner")
    .maybeSingle();

  if (bestaand) {
    return { zojuistGevierd: false, eerstePartnerNaam: null };
  }

  // 2. Heeft member minstens 1 directe partner?
  const { data: partners } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("sponsor_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!partners || partners.length === 0) {
    return { zojuistGevierd: false, eerstePartnerNaam: null };
  }

  const eerstePartner = partners[0] as { id: string; full_name: string };

  // 3. Registreer mijlpaal. UNIQUE constraint vangt race conditions af.
  const { error } = await supabase.from("partner_mijlpalen").insert({
    user_id: userId,
    type: "eerste-partner",
    partner_id: eerstePartner.id,
  });

  if (error) {
    // Race condition (duplicate key) of andere fout — geen viering, geen push.
    console.warn("partner_mijlpalen insert error:", error.message);
    return { zojuistGevierd: false, eerstePartnerNaam: null };
  }

  // 4. Stuur push-notificatie (best-effort, niet fataal).
  try {
    await sendPushToUser(userId, {
      title: "🎉 Je hebt je eerste partner!",
      body: `${eerstePartner.full_name} heeft zich net onder jou aangemeld. Open ELEVA om te vieren.`,
      url: "/dashboard?vier=eerste-partner",
      tag: "eerste-partner",
    });
  } catch {
    // negeer push-fouten
  }

  return { zojuistGevierd: true, eerstePartnerNaam: eerstePartner.full_name };
}
```

- [ ] **Step 2: Roep de detector aan in app/vandaag/page.tsx**

Open `app/vandaag/page.tsx`. Bij de imports voeg toe:

```typescript
import { detecteerEnVierEerstePartner } from "@/lib/team/mijlpaal-detector";
```

Zoek in de function-body de plek NA `const { data: alleVoltooiingen } = ...` (rond regel 66-69) en voeg DIRECT DAARNA toe:

```typescript
  // Eerste-partner-mijlpaal-detectie: registreer mijlpaal + stuur push
  // wanneer member voor het eerst een directe partner heeft. Race-safe
  // via UNIQUE-constraint op partner_mijlpalen.
  await detecteerEnVierEerstePartner(supabase, user.id);
```

- [ ] **Step 3: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. De detector wordt nu bij elk /vandaag-bezoek aangeroepen.

- [ ] **Step 4: Commit**

```bash
git add lib/team/mijlpaal-detector.ts app/vandaag/page.tsx
git commit -m "feat(team): eerste-partner-mijlpaal-detectie + push

detecteerEnVierEerstePartner checkt bij /vandaag-bezoek of member
een eerste partner heeft (via sponsor_id-koppeling) én of die
mijlpaal nog niet is gevierd. Bij beide: registreer partner_mijlpalen-
rij + push 'Je hebt je eerste partner!'.

Race condition wordt afgevangen door UNIQUE constraint op
(user_id, type) — een dubbele insert faalt stil, geen dubbele
viering of dubbele push.

Push gaat naar /dashboard?vier=eerste-partner — querystring triggert
EerstePartnerVieringTegel die in Task 8 wordt toegevoegd.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: `EerstePartnerVieringTegel` op dashboard

**Files:**
- Create: `components/dashboard/EerstePartnerVieringTegel.tsx`
- Modify: `app/dashboard/page.tsx` (import + render)

- [ ] **Step 1: Maak de viering-tegel-component**

Maak `components/dashboard/EerstePartnerVieringTegel.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// EerstePartnerVieringTegel, eenmalige speciale tegel op /dashboard.
//
// Verschijnt zodra ?vier=eerste-partner in de URL staat OF wanneer
// de mijlpaal in de afgelopen 24 uur werd geregistreerd. Triggert
// confetti via window.dispatchEvent("eleva-celebrate") zodat de
// bestaande CelebrationLayer 'm oppakt.
//
// Drie concrete acties zonder AI-tussenkomst:
//   1. Open WhatsApp naar eerste partner (LEEG bericht)
//   2. Open WhatsApp naar eigen sponsor (LEEG bericht)
//   3. Open Audio-onderweg-Academy Skill #6
// ============================================================

type Props = {
  eerstePartner: { fullName: string; telefoon: string | null } | null;
  eigenSponsor: { fullName: string; telefoon: string | null } | null;
  triggerConfetti: boolean;
};

function whatsAppLink(telefoon: string | null): string | null {
  if (!telefoon) return null;
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("00")) nummer = nummer.substring(2);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}`;
}

export function EerstePartnerVieringTegel({
  eerstePartner,
  eigenSponsor,
  triggerConfetti,
}: Props) {
  const [verborgen, setVerborgen] = useState(false);

  useEffect(() => {
    if (triggerConfetti) {
      try {
        window.dispatchEvent(
          new CustomEvent("eleva-celebrate", {
            detail: { variant: "big", thema: "eerste-partner" },
          }),
        );
      } catch {
        // negeer
      }
    }
  }, [triggerConfetti]);

  if (verborgen || !eerstePartner) return null;

  const partnerWa = whatsAppLink(eerstePartner.telefoon);
  const sponsorWa = whatsAppLink(eigenSponsor?.telefoon ?? null);
  const voornaamPartner = eerstePartner.fullName.split(" ")[0];
  const voornaamSponsor = eigenSponsor?.fullName.split(" ")[0] ?? "je sponsor";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cm-gold/20 via-cm-gold/10 to-cm-surface border-2 border-cm-gold/50 px-5 py-5 space-y-4">
      <div className="space-y-1">
        <p className="text-cm-gold text-xs font-bold uppercase tracking-wider">
          🎉 Mijlpaal
        </p>
        <h2 className="text-2xl font-display font-bold text-cm-white">
          Je hebt je eerste partner!
        </h2>
        <p className="text-cm-white/85 text-sm leading-relaxed">
          <strong className="text-cm-gold">{eerstePartner.fullName}</strong>{" "}
          heeft zich net onder jou aangemeld. Dit is een groot moment. Drie
          dingen om vandaag te doen — geen scripts, gewoon jij in jouw woorden.
        </p>
      </div>

      <div className="space-y-2.5">
        {/* Actie 1: bericht naar partner */}
        <div className="rounded-md bg-cm-bg/50 border border-cm-border px-3 py-2.5">
          <p className="text-cm-white text-sm font-semibold mb-1">
            1. Stuur {voornaamPartner} een hartelijk welkom-berichtje
          </p>
          <p className="text-cm-white/60 text-xs mb-2">In jouw eigen woorden</p>
          {partnerWa ? (
            <a
              href={partnerWa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-block py-1.5 px-3 text-xs font-semibold"
            >
              💬 Open WhatsApp →
            </a>
          ) : (
            <p className="text-cm-white/40 text-[11px] italic">
              📞 Telefoonnummer onbekend — neem zelf contact op
            </p>
          )}
        </div>

        {/* Actie 2: bedank eigen sponsor */}
        <div className="rounded-md bg-cm-bg/50 border border-cm-border px-3 py-2.5">
          <p className="text-cm-white text-sm font-semibold mb-1">
            2. Bedank {voornaamSponsor} — die heeft jou hier gebracht
          </p>
          <p className="text-cm-white/60 text-xs mb-2">
            Een korte, eerlijke dank-zin
          </p>
          {sponsorWa ? (
            <a
              href={sponsorWa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-block py-1.5 px-3 text-xs font-semibold"
            >
              💬 Open WhatsApp naar {voornaamSponsor} →
            </a>
          ) : (
            <p className="text-cm-white/40 text-[11px] italic">
              📞 Geen telefoonnummer van sponsor bekend
            </p>
          )}
        </div>

        {/* Actie 3: Audio-onderweg Skill #6 */}
        <div className="rounded-md bg-cm-bg/50 border border-cm-border px-3 py-2.5">
          <p className="text-cm-white text-sm font-semibold mb-1">
            3. Luister deze week Skill #6 uit de Audio-onderweg-training
          </p>
          <p className="text-cm-white/60 text-xs mb-2">
            Eric Worre's "Helping Your New Distributor Get Started Right"
          </p>
          <Link
            href="/academy/audio-onderweg"
            className="btn-secondary inline-block py-1.5 px-3 text-xs font-semibold"
          >
            🎧 Open Academy →
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setVerborgen(true)}
        className="text-cm-white/50 hover:text-cm-white text-xs underline-offset-2 hover:underline"
      >
        Tegel verbergen (verdwijnt automatisch na 24 uur)
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Render de tegel op dashboard**

Open `app/dashboard/page.tsx`. Bij de imports voeg toe:

```typescript
import { EerstePartnerVieringTegel } from "@/components/dashboard/EerstePartnerVieringTegel";
```

In de function-signature van `DashboardPagina` (rond regel 75), verander de `searchParams`-prop zodat 'm `vier`-key kan accepteren:

```typescript
export default async function DashboardPagina({
  searchParams,
}: {
  searchParams?: Promise<{ vier?: string }>;
}) {
  const sp = (await searchParams) ?? {};
```

Bovenaan de function-body, NA de profile-fetch, voeg toe (vlak vóór de `huidigeDagData`-blok):

```typescript
  // Eerste-partner-viering: triggert via ?vier=eerste-partner OF
  // wanneer de mijlpaal in afgelopen 24u is geregistreerd.
  let eerstePartnerViering: {
    eerstePartner: { fullName: string; telefoon: string | null } | null;
    eigenSponsor: { fullName: string; telefoon: string | null } | null;
    triggerConfetti: boolean;
  } | null = null;

  const { data: recenteMijlpaal } = await supabase
    .from("partner_mijlpalen")
    .select("partner_id, gevierd_op")
    .eq("user_id", user.id)
    .eq("type", "eerste-partner")
    .gte("gevierd_op", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();

  if (recenteMijlpaal || sp.vier === "eerste-partner") {
    // Haal eerste-partner-naam + telefoon op
    let eerstePartner = null;
    if (recenteMijlpaal) {
      const { data: pData } = await supabase
        .from("profiles")
        .select("full_name, telefoon")
        .eq("id", (recenteMijlpaal as { partner_id: string }).partner_id)
        .maybeSingle();
      if (pData) {
        eerstePartner = {
          fullName: (pData as { full_name: string }).full_name,
          telefoon: (pData as { telefoon: string | null }).telefoon ?? null,
        };
      }
    }

    // Haal eigen sponsor op
    let eigenSponsor = null;
    const profSponsor = profile as { sponsor_id?: string | null } | null;
    if (profSponsor?.sponsor_id) {
      const { data: sData } = await supabase
        .from("profiles")
        .select("full_name, telefoon")
        .eq("id", profSponsor.sponsor_id)
        .maybeSingle();
      if (sData) {
        eigenSponsor = {
          fullName: (sData as { full_name: string }).full_name,
          telefoon: (sData as { telefoon: string | null }).telefoon ?? null,
        };
      }
    }

    eerstePartnerViering = {
      eerstePartner,
      eigenSponsor,
      triggerConfetti: sp.vier === "eerste-partner",
    };
  }
```

Tenslotte, in de JSX (return-statement van DashboardPagina), render de tegel BOVENAAN — direct na de `<TijdslijnStrip />` (of vóór de eerste tile, op een opvallende plek). Zoek de plek waar `<MijlpaalDetector />` of een vergelijkbare top-component staat en voeg DAARNA toe:

```tsx
      {eerstePartnerViering && (
        <EerstePartnerVieringTegel
          eerstePartner={eerstePartnerViering.eerstePartner}
          eigenSponsor={eerstePartnerViering.eigenSponsor}
          triggerConfetti={eerstePartnerViering.triggerConfetti}
        />
      )}
```

Best practice: plaats 'm zo hoog mogelijk in de DOM-tree, idealiter direct onder de pagina-titel, zodat 'ie als eerste in zicht is.

- [ ] **Step 3: Verifieer build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Geen TypeScript-fouten. De tegel verschijnt op dashboard zodra `?vier=eerste-partner` in de URL OF een mijlpaal in afgelopen 24u is geregistreerd.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/EerstePartnerVieringTegel.tsx app/dashboard/page.tsx
git commit -m "feat(dashboard): EerstePartnerVieringTegel op dashboard

Eenmalige speciale tegel die verschijnt bij ?vier=eerste-partner OF
wanneer partner_mijlpalen-rij voor 'eerste-partner' in afgelopen 24u
is aangemaakt. Triggert CelebrationLayer-confetti via eleva-celebrate-
event.

Drie concrete acties, allemaal zonder AI-tussenkomst:
1. WhatsApp-knop naar eerste partner (leeg gesprek)
2. WhatsApp-knop naar eigen sponsor (leeg gesprek)
3. Link naar Audio-onderweg-Academy

Bij ontbrekend telefoonnummer: grijze info-tekst ipv knop.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Build + push + smoke-test op live

**Files:** geen wijzigingen — alleen verificatie

- [ ] **Step 1: Run finale build**

Run: `npm run build`
Expected: `✓ Compiled successfully`. Alle routes intact, geen TypeScript-fouten.

- [ ] **Step 2: Push alle commits naar origin/main**

Run: `git push origin main`
Expected: Push succesvol, Vercel auto-deploy start.

Wacht ~2 minuten voor de Vercel-deploy. Vervolg met smoke-tests op productie.

- [ ] **Step 3: Smoke-test — partner-overzicht zonder partners**

1. Login als Raoul op productie
2. Ga naar `/vandaag` (huidige dag, geen `?dag=`-override)
3. **Verifieer:** GEEN "🤝 Check je nieuwe partner(s)"-stap te zien (Raoul heeft mogelijk al partners — check het scenario alleen als account zonder partners beschikbaar is)

Als alternatief: probeer met een test-account dat zeker geen `sponsor_id`-koppeling-ontvangers heeft.

- [ ] **Step 4: Smoke-test — partner-overzicht met partners**

1. Maak op productie een test-account aan dat `sponsor_id = raoul.id` heeft (via SQL of via uitnodigingslink)
2. Login als Raoul, ga naar `/vandaag`
3. **Verifieer:** "🤝 Check je nieuwe partner(s) vandaag"-stap is zichtbaar als laatste optionele stap
4. Klik door naar die stap
5. **Verifieer:** test-account staat in de overview met naam, dag, laatste-login, % taken
6. Klik op WhatsApp-knop (als telefoonnummer ingesteld) — **verifieer:** wa.me opent ZONDER `?text=`-parameter (leeg gesprek)
7. Klik "✓ Partner-check gedaan" — **verifieer:** afvink-success-state

- [ ] **Step 5: Smoke-test — eerste-partner-viering**

1. Verwijder alle rijen in `partner_mijlpalen` voor Raoul's user_id (via SQL: `DELETE FROM partner_mijlpalen WHERE user_id = '<raoul-id>';`)
2. Open `/vandaag` als Raoul (server-side detectie triggert dan opnieuw)
3. **Verifieer:** push-notificatie ontvangen op apparaat met "🎉 Je hebt je eerste partner!"
4. Open `/dashboard?vier=eerste-partner`
5. **Verifieer:** Big-confetti animatie + viering-tegel met 3 actie-blokken (WhatsApp partner, WhatsApp sponsor, Academy-link)
6. Klik WhatsApp-knop in viering-tegel — **verifieer:** leeg gesprek opent

- [ ] **Step 6: Smoke-test — 2e laag uitklap**

Als beschikbaar (vereist test-account met OOK een eigen partner):

1. Maak test-account-B aan met `sponsor_id = test-account-A.id` (= 2e laag onder Raoul)
2. Login als Raoul, open de partner-check-stap
3. **Verifieer:** "▶ Indirecte downline (1)"-uitklap-knop zichtbaar onder de directe partners
4. Klik uit te klappen
5. **Verifieer:** test-account-B verschijnt met "via test-account-A"-tekst en ZONDER WhatsApp-knop

- [ ] **Step 7: Smoke-test — privacy-laag**

1. Login als test-account-A (jouw directe partner)
2. Bekijk via een aparte SQL-query: `SELECT * FROM partner_overview_voor_sponsor('<andere-user-id>');` waar `<andere-user-id>` NIET test-account-A is
3. **Verifieer:** Query faalt met "Geen toegang tot andermans partner-overview" (RLS-functie security-check)

- [ ] **Step 8: Eindcontrole — geen fouten in productie-logs**

Open Vercel-deployment-logs. **Verifieer:**
- Geen recente errors in `/api/team/partner-overview`
- Geen errors in `/vandaag` of `/dashboard` page renders

Als alle smoke-tests slagen: implementatie compleet. Raoul kan productie testen.

---

## Self-review (post-write check)

### Spec coverage

- ✅ Spec §3 (Detectie & Activatie) → Task 1 (RPC) + Task 7 (detector)
- ✅ Spec §4 (Inline-embed) → Task 4 (component) + Task 5 (vandaag-flow) + Task 6 (dag-arrays)
- ✅ Spec §5 (Privacy-laag) → Task 1 (SECURITY DEFINER + auth.uid()-check)
- ✅ Spec §6 (Eerste-partner-mijlpaal) → Task 7 (mijlpaal-tabel insert + push) + Task 8 (viering-tegel)
- ✅ Spec §7 (Data + API) → Task 2 (server-helper + REST-route)
- ✅ Spec §9 (Error handling) → Task 4 (PartnerCheckEmbed rendert null bij 0 partners; lege telefoonnummer-handling; presence_zichtbaar=false → null tonen)
- ✅ Spec §11 (Testing & verificatie) → Task 9 (smoke-test-checklist)
- ✅ Spec §12 (Volgorde) → Plan-volgorde matched

### Placeholder scan

Geen "TBD", geen "implement later", geen "similar to Task N" zonder code, geen "add appropriate error handling" zonder hoe.

### Type consistency

- `PartnerInfo`-shape (Task 2) wordt in Task 4 (PartnerCheckEmbed) gebruikt — properties matchen
- `PartnerOverview` met `{ directe, tweedeLaag }` consistent in API-route + helper + component
- `partnerCheckStap(dagNummer)`-helper teruggegeven type past op `ControllableTaak` (de bestaande type uit `lib/playbook/types.ts`)
- `MijlpaalStatus`-type alleen intern in detector — geen externe gebruikers, geen consistency-issue

---

## Notes voor de uitvoerende engineer

- **Geen test-framework**, dus `npm run build` per taak + smoke-test in Task 9 zijn de primaire verificatie.
- **Pilot main-branch**: deze werkzaamheden gebeuren rechtstreeks op `main` (Raoul, 2026-05-13).
- **Vercel auto-deploy**: na `git push origin main` start automatisch een deploy. Smoke-tests pas na deploy-bevestiging.
- **DB-migratie**: gebruik `node scripts/sql.mjs` (Setup A) om SQL-bestanden tegen productie-DB uit te voeren. Als die helper niet bestaat: voer SQL handmatig uit via Supabase Studio.
- **Volgorde**: Tasks zijn opzettelijk gerangschikt met afhankelijkheden van boven naar beneden. Task 1 levert DB-objecten, Task 2 gebruikt die. Task 3 type-uitbreiding, Task 4 gebruikt die. Etc. Houd de volgorde aan.
- **"Voer alles door"**: Raoul heeft geen checkpoints gevraagd tussen taken. Voer alle 9 taken achter elkaar uit, alleen het smoke-test-gedeelte (Task 9 Steps 3-8) vraagt user-interactie op live.
- **Bij blocker**: stop en vraag. Bv. als `node scripts/sql.mjs` niet bestaat, vraag Raoul of hij de SQL handmatig wil uitvoeren via Supabase Studio.
