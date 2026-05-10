# Inline Founder Edit-Modus, Fase 1A (Dag 1 Proof-of-Concept) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw de complete edit-modus-architectuur en wrap voldoende velden op Sprint Dag 1 zodat Raoul + Gaby de UX kunnen reviewen voor we naar de overige 59 dagen uitbreiden.

**Architectuur:** Server-side `/vandaag/page.tsx` leest `?dag=N` voor founders, laadt `tekst_overrides`-rijen voor namespaces `sprint-dag`, `sprint-ui`, `sprint-groet`, past per-dag-content-overrides toe op DAGEN-data (uitbreiding van bestaande `pasOverrideToe`), geeft UI-overrides als Record door aan client. Client-side `VandaagFlow` heeft een `EditModeProvider`-context met localStorage-persistentie, toont voor founders een `EditModeToggle` + uitgebreide `TesterToolbar` (URL-mode), en wrap-t alle bewerkbare tekst-elementen in de bestaande `EditableTekst`-component met juiste namespace+sleutel.

**Tech Stack:** Next.js 14 (App Router, server + client components), TypeScript, Supabase (Postgres), bestaande `tekst_overrides`-tabel, bestaande `EditableTekst`-component, React Context API, `localStorage`.

> **Codebase-context:** Geen jest/vitest/playwright-setup aanwezig. Verificatie gebeurt via TypeScript-compilatie (`npm run build`) en handmatige browser-checks na elke commit. De plan-stappen reflecteren dat realistisch.

---

## File Structure

### Te wijzigen
- `components/cms/EditableTekst.tsx` — voeg `editModusAan`-prop toe, koppel aan context als die er is.
- `components/tester/TesterToolbar.tsx` — accepteer optionele `urlModus`-prop voor query-param routing op /vandaag.
- `lib/playbook/overrides.ts` — voeg `pasTaakOverridesToe` + `haalTekstOverrides` toe (nieuwe namespace-style).
- `app/vandaag/page.tsx` — lees `?dag=N` voor founders, laad nieuwe overrides, geef door aan VandaagFlow.
- `app/vandaag/vandaag-flow.tsx` — accepteer nieuwe props (uiOverrides, groetOverrides), wrap-t toggle + Dag 1 velden in EditableTekst, hangt EditModeProvider erom.

### Te creëren
- `components/cms/EditModeContext.tsx` — React context + provider + `useEditModus()` hook met localStorage-sync.
- `components/cms/EditModeToggle.tsx` — kleine toggle-component die de context gebruikt.
- `lib/cms/tekst-overrides.ts` — helper om tekst_overrides-rijen te laden per namespace (gedeeld door /vandaag, /welkom-core later, etc.).

### Niet aanraken in deze fase
- Database-schema (`tekst_overrides`-tabel bestaat al, kolommen kloppen).
- `/api/tekst/override`-endpoint (werkt al, geen wijziging nodig).
- `lib/playbook/dagen.ts` (alleen lezen).
- Welke dagen 2 t/m 60 ook in `vandaag-flow.tsx` zichtbaar zijn — de gewrapte fields werken automatisch voor alle dagen omdat het sleutel-patroon `dag${N}` is.

---

## Task 1: EditMode-context + provider + hook

**Files:**
- Create: `components/cms/EditModeContext.tsx`

- [ ] **Step 1: Create EditModeContext.tsx**

```tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ============================================================
// EditModeContext, founder-edit-state per browser-sessie.
//
// Wordt aan-/uitgezet via <EditModeToggle/> en blijft AAN tussen
// dag-springen, refreshes, sessions (localStorage). Components die
// in edit-modus moeten reageren (EditableTekst, hover-styling, etc.)
// roepen useEditModus() aan.
//
// Default bij eerste bezoek voor founder: UIT. Eerst rustig kijken,
// dan pas pencils zien.
// ============================================================

type Ctx = {
  editModusAan: boolean;
  setEditModusAan: (aan: boolean) => void;
};

const EditModeCtx = createContext<Ctx>({
  editModusAan: false,
  setEditModusAan: () => {
    // no-op default — provider hoort er omheen te staan
  },
});

const STORAGE_KEY = "eleva-edit-modus-aan";

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editModusAan, setAanState] = useState(false);

  // Hydrate vanuit localStorage bij mount. We doen dit in useEffect zodat
  // SSR niet probeert localStorage te lezen (zou crashen).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === "true") setAanState(true);
    } catch {
      // negeer (private browsing, storage disabled)
    }
  }, []);

  function setEditModusAan(aan: boolean) {
    setAanState(aan);
    try {
      window.localStorage.setItem(STORAGE_KEY, aan ? "true" : "false");
    } catch {
      // negeer
    }
  }

  return (
    <EditModeCtx.Provider value={{ editModusAan, setEditModusAan }}>
      {children}
    </EditModeCtx.Provider>
  );
}

export function useEditModus(): Ctx {
  return useContext(EditModeCtx);
}
```

- [ ] **Step 2: TypeScript-check**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt zonder TypeScript-fouten in `components/cms/EditModeContext.tsx`. Andere fouten in de codebase mogen blijven staan; we kijken specifiek naar dit nieuwe bestand.

- [ ] **Step 3: Commit**

```bash
git add components/cms/EditModeContext.tsx
git commit -m "feat(cms): EditModeContext + EditModeProvider + useEditModus hook

Founder-edit-state per browser-sessie. Persisteert via localStorage
zodat de toggle aan blijft tussen dag-springen en refreshes. Default
UIT zodat de eerste view altijd de schone member-versie is.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: EditModeToggle-component

**Files:**
- Create: `components/cms/EditModeToggle.tsx`

- [ ] **Step 1: Create EditModeToggle.tsx**

```tsx
"use client";

import { useEditModus } from "./EditModeContext";

// ============================================================
// EditModeToggle, schakelaar voor founders om alle ✍️-pencil-knoppen
// op de pagina aan/uit te zetten. Renders alleen iets als
// `isFounder`-prop true is — anders return null zodat members 'm
// nooit zien.
// ============================================================

type Props = {
  isFounder: boolean;
};

export function EditModeToggle({ isFounder }: Props) {
  const { editModusAan, setEditModusAan } = useEditModus();

  if (!isFounder) return null;

  return (
    <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/5 px-4 py-2.5 flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold">
        ✍️ Founder
      </span>
      <span className="text-cm-white text-sm flex-1">
        Edit-modus is{" "}
        <strong className={editModusAan ? "text-cm-gold" : "text-cm-white/60"}>
          {editModusAan ? "AAN" : "UIT"}
        </strong>
      </span>
      <button
        type="button"
        onClick={() => setEditModusAan(!editModusAan)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          editModusAan ? "bg-cm-gold" : "bg-cm-surface-2"
        }`}
        aria-label="Edit-modus aan of uit"
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            editModusAan ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript-check**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt voor het nieuwe bestand.

- [ ] **Step 3: Commit**

```bash
git add components/cms/EditModeToggle.tsx
git commit -m "feat(cms): EditModeToggle component

Subtiele AAN/UIT-schakelaar voor founders. Alleen zichtbaar als
isFounder=true, anders renders null. Gebruikt EditModeContext.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: EditableTekst editModusAan-prop + context-fallback

**Files:**
- Modify: `components/cms/EditableTekst.tsx`

- [ ] **Step 1: Voeg editModusAan-prop toe aan Props-type**

In `components/cms/EditableTekst.tsx`, vervang het `Props`-type-blok:

```tsx
type Props = {
  namespace: string;
  sleutel: string;
  standaard: string;
  overrides: Record<string, string>;
  isFounder: boolean;
  /**
   * Als false: pencil-knop niet tonen, ook al is isFounder=true. Wordt
   * meestal via <EditModeProvider/> + useEditModus() gestuurd zodat één
   * toggle bovenaan de pagina alle pencils aan-/uitzet. Default true
   * voor backwards-compat met components die de toggle nog niet kennen
   * (zoals /onboarding, mentor-trainen-form).
   */
  editModusAan?: boolean;
  as?: AsTag;
  className?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
};
```

- [ ] **Step 2: Lees editModusAan in functie-parameters**

Vervang het `export function EditableTekst({ ... })`-block met:

```tsx
export function EditableTekst({
  namespace,
  sleutel,
  standaard,
  overrides,
  isFounder,
  editModusAan = true,
  as = "span",
  className = "",
  multiline = false,
  rows = 4,
  hint,
}: Props) {
```

- [ ] **Step 3: Pas conditie voor pencil-knop aan**

Onderaan de functie staat:

```tsx
{isFounder && (
  <button
    type="button"
    onClick={startBewerken}
    ...
```

Vervang met:

```tsx
{isFounder && editModusAan && (
  <button
    type="button"
    onClick={startBewerken}
    ...
```

- [ ] **Step 4: TypeScript-check**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt. Bestaande gebruikers van EditableTekst (in /onboarding etc.) blijven werken want `editModusAan` heeft default `true`.

- [ ] **Step 5: Commit**

```bash
git add components/cms/EditableTekst.tsx
git commit -m "feat(cms): editModusAan-prop op EditableTekst

Pencil-knop alleen zichtbaar als isFounder && editModusAan. Default
true zodat bestaande gebruikers in /onboarding en mentor-trainen-form
ongewijzigd blijven werken (geen toggle daar).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: tekst_overrides server-side loader

**Files:**
- Create: `lib/cms/tekst-overrides.ts`

- [ ] **Step 1: Create tekst-overrides.ts**

```ts
// ============================================================
// tekst_overrides loader, server-side helper.
//
// Generieke functie om alle override-rijen voor een set namespaces
// op te halen. Faalt stilletjes als de tabel niet bestaat of RLS
// blokkeert (zelfde patroon als haalOverrides in playbook/overrides.ts).
//
// Returns een nested map: namespace → sleutel → waarde, zodat de
// caller per namespace makkelijk een Record<sleutel,waarde> kan
// opbouwen voor EditableTekst's `overrides`-prop.
// ============================================================

type Rij = { namespace: string; sleutel: string; waarde: string };

type SupabaseAchtig = {
  from: (t: string) => {
    select: (cols: string) => {
      in: (
        col: string,
        values: string[],
      ) => Promise<{ data: Rij[] | null; error: unknown }>;
    };
  };
};

export type TekstOverrides = Map<string, Map<string, string>>;

/**
 * Haal alle override-rijen voor de gegeven namespaces op.
 * Levert lege buitenste map terug bij fouten of lege input.
 */
export async function haalTekstOverrides(
  supabase: SupabaseAchtig,
  namespaces: string[],
): Promise<TekstOverrides> {
  const result: TekstOverrides = new Map();
  if (namespaces.length === 0) return result;
  try {
    const { data, error } = await supabase
      .from("tekst_overrides")
      .select("namespace, sleutel, waarde")
      .in("namespace", namespaces);
    if (error) return result;
    for (const r of data ?? []) {
      let sub = result.get(r.namespace);
      if (!sub) {
        sub = new Map();
        result.set(r.namespace, sub);
      }
      sub.set(r.sleutel, r.waarde);
    }
  } catch {
    // network/typing/anders, fail silently
  }
  return result;
}

/**
 * Comfort-helper: pak één namespace eruit als plain Record voor
 * gebruik in EditableTekst's `overrides`-prop. Lege Record als de
 * namespace niet bestond.
 */
export function namespaceAlsRecord(
  overrides: TekstOverrides,
  namespace: string,
): Record<string, string> {
  const sub = overrides.get(namespace);
  if (!sub) return {};
  const obj: Record<string, string> = {};
  for (const [k, v] of sub.entries()) obj[k] = v;
  return obj;
}
```

- [ ] **Step 2: TypeScript-check**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add lib/cms/tekst-overrides.ts
git commit -m "feat(cms): generieke tekst_overrides loader

Haalt rijen op uit tekst_overrides voor gegeven namespaces, faalt
stilletjes bij DB-fouten. Helper namespaceAlsRecord() converteert
naar het plain Record-format dat EditableTekst verwacht.

Gedeelde infrastructuur die straks ook /welkom-core (Core) en
later /welkom-pro (Pro) gaan gebruiken.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Per-dag-data overrides via tekst_overrides

**Files:**
- Modify: `lib/playbook/overrides.ts`

- [ ] **Step 1: Voeg pasSprintDagOverridesToe toe**

Aan het eind van `lib/playbook/overrides.ts` (NA de bestaande `haalOverrides`-functie), append:

```ts
import type { Dag } from "@/lib/playbook/types";

/**
 * Pas Sprint-dag-overrides uit `tekst_overrides` (namespace
 * "sprint-dag") toe op een Dag-object. Overrided velden:
 *   - dag.titel
 *   - dag.watJeLeert
 *   - dag.faseDoel
 *   - dag.vandaagDoen[i].label
 *   - dag.vandaagDoen[i].uitleg
 *
 * Sleutels:
 *   `dag${N}.titel`
 *   `dag${N}.watJeLeert`
 *   `dag${N}.faseDoel`
 *   `dag${N}.taak.${taakId}.label`
 *   `dag${N}.taak.${taakId}.uitleg`
 *
 * Lege/missende sleutel = vallen terug op standaard. NIET hernoemen
 * van taak-ids: bestaande overrides zijn aan de taak-id gekoppeld.
 */
export function pasSprintDagOverridesToe(
  dag: Dag,
  sprintDagOverrides: Map<string, string> | undefined,
): Dag {
  if (!sprintDagOverrides || sprintDagOverrides.size === 0) return dag;
  const N = dag.nummer;
  const get = (suffix: string) => {
    const v = sprintDagOverrides.get(`dag${N}.${suffix}`);
    return v && v.trim() ? v.trim() : null;
  };

  return {
    ...dag,
    titel: get("titel") ?? dag.titel,
    watJeLeert: get("watJeLeert") ?? dag.watJeLeert,
    faseDoel: get("faseDoel") ?? dag.faseDoel,
    vandaagDoen: dag.vandaagDoen.map((taak) => ({
      ...taak,
      label: get(`taak.${taak.id}.label`) ?? taak.label,
      uitleg: get(`taak.${taak.id}.uitleg`) ?? taak.uitleg,
    })),
  };
}
```

- [ ] **Step 2: TypeScript-check**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt; bestaande `pasOverrideToe` (legacy playbook_overrides) blijft naast deze nieuwe functie staan.

- [ ] **Step 3: Commit**

```bash
git add lib/playbook/overrides.ts
git commit -m "feat(playbook): pasSprintDagOverridesToe voor tekst_overrides

Nieuwe override-functie die de tekst_overrides Map (namespace
sprint-dag) toepast op een Dag-object. Werkt naast de bestaande
pasOverrideToe (die de legacy playbook_overrides-tabel gebruikt) —
allebei blijven werken zodat bestaande edits niet breken.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: TesterToolbar URL-mode voor /vandaag

**Files:**
- Modify: `components/tester/TesterToolbar.tsx`

- [ ] **Step 1: Voeg urlModus-prop toe**

In `components/tester/TesterToolbar.tsx`, vervang de signatuur en de bovenkant van de functie:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// TesterToolbar, kleine toolbar bovenaan dashboard / vandaag voor
// pilot-testers + founders.
//
// urlModus="startdatum" (default): klikken POST naar
//   /api/tester/spring-naar-dag, verzet run_startdatum (oud gedrag,
//   gebruikt op dashboard). Refresh-driven.
//
// urlModus="queryparam": klikken navigeert naar /vandaag?dag=N. Geen
//   server-call, geen verzet startdatum. Founder kan zo elke dag
//   bekijken zonder voortgang aan te raken (gebruikt op /vandaag).
// ============================================================

type Props = {
  huidigeDag: number;
  urlModus?: "startdatum" | "queryparam";
};

export function TesterToolbar({
  huidigeDag,
  urlModus = "startdatum",
}: Props) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);
  const [open, setOpen] = useState(false);
  const [dagInput, setDagInput] = useState(String(huidigeDag));

  async function springNaar(dag: number) {
    if (bezig) return;
    if (urlModus === "queryparam") {
      // Pure URL-navigatie, geen server-call. /vandaag/page.tsx leest
      // ?dag=N voor founders en toont die dag.
      router.push(`/vandaag?dag=${dag}`);
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/tester/spring-naar-dag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dagNummer: dag }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Springen mislukt");
        return;
      }

      // Wis de 'gesloten'-vlag voor de NIEUWE dag zodat AutoNaarVandaag
      // 'm opnieuw oppakt en de tester de flow van die dag opnieuw te zien
      // krijgt. Voor andere dagen laten we de vlag staan, anders krijg je
      // een loop tussen /dashboard en /vandaag bij dag 1 → 1.
      try {
        const datum = new Date().toISOString().split("T")[0];
        const k = `eleva-vandaag-flow-dag${dag}-${datum}`;
        window.localStorage.removeItem(k);
        // En verwijder ook de positie-state zodat we netjes bij de intro
        // van de nieuwe dag beginnen.
        const pk = `eleva-vandaag-flow-positie-dag${dag}-${datum}`;
        window.localStorage.removeItem(pk);
      } catch {
        // negeer
      }

      toast.success(`🧪 Nu op dag ${dag}`);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }
```

- [ ] **Step 2: Pas de subtekst onderaan aan zodat 't urlModus weerspiegelt**

Onderaan staat een tekst:

```tsx
<span className="text-xs text-purple-200 opacity-70">
  (verzet je startdatum, testers + founders only)
</span>
```

Vervang met:

```tsx
<span className="text-xs text-purple-200 opacity-70">
  {urlModus === "queryparam"
    ? "(alleen view, je voortgang blijft staan)"
    : "(verzet je startdatum, testers + founders only)"}
</span>
```

- [ ] **Step 3: TypeScript-check**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt. Dashboard-gebruik (zonder urlModus-prop) blijft werken (default = "startdatum").

- [ ] **Step 4: Commit**

```bash
git add components/tester/TesterToolbar.tsx
git commit -m "feat(tester): TesterToolbar urlModus-prop voor /vandaag

Twee modes: 'startdatum' (oud gedrag, dashboard) of 'queryparam' (nieuw,
voor /vandaag — navigeert naar ?dag=N zonder run_startdatum aan te
raken). Founder kan zo door alle dagen heen bladeren zonder z'n
eigen voortgang te beïnvloeden.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: /vandaag/page.tsx leest ?dag=N + laadt overrides

**Files:**
- Modify: `app/vandaag/page.tsx`

- [ ] **Step 1: Vervang de imports + signatuur**

Bovenaan `app/vandaag/page.tsx`, vervang de imports + functie-signatuur:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DAGEN } from "@/lib/playbook/dagen";
import {
  haalOverrides,
  pasOverrideToe,
  pasSprintDagOverridesToe,
} from "@/lib/playbook/overrides";
import {
  haalTekstOverrides,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import { berekenHuidigeDag } from "@/lib/playbook/bereken-dag";
import { VandaagFlow } from "./vandaag-flow";

// ============================================================
// /vandaag, guided full-screen flow voor de huidige playbook-dag.
//
// Werkt als de onboarding: geen AppShell, geen sidebar, focus alleen
// op wat de member vandaag moet doen. Stap voor stap door alle taken
// + uitleg, met afvink-knoppen. Aan eind een viering en knop terug
// naar dashboard.
//
// Bedoeld om bij eerste bezoek per dag de overweldiging weg te halen:
// niet alle dashboard-tegels in beeld, maar één duidelijke flow.
//
// Founders kunnen ?dag=N gebruiken om naar elke dag te springen
// zonder hun eigen voortgang aan te raken (rechtstreeks aangeroepen
// vanuit TesterToolbar in queryparam-mode).
// ============================================================

export const dynamic = "force-dynamic";

export default async function VandaagPagina({
  searchParams,
}: {
  searchParams: Promise<{ dag?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
```

- [ ] **Step 2: Vervang de dag-berekening om ?dag=N voor founders te accepteren**

Verder naar beneden in dezelfde functie, vervang de hele block tussen `const isFounder = ...` en `if (dag < 1 || dag > 21)`:

```tsx
  const isFounder = (profile as any)?.role === "founder";
  const isTester = (profile as any)?.is_tester === true;

  // Founder mag via ?dag=N elke dag bekijken zonder z'n eigen voortgang
  // aan te raken. Member negeert de query-param (security).
  const dagParam =
    isFounder && sp.dag ? Number.parseInt(sp.dag, 10) : NaN;
  const dagOverride =
    Number.isFinite(dagParam) && dagParam >= 1 && dagParam <= 60
      ? dagParam
      : null;

  const dag =
    dagOverride ??
    berekenHuidigeDag(
      (alleVoltooiingen as Array<{ dag_nummer: number; taak_id: string }>) ||
        [],
      (profile as any)?.run_startdatum ?? null,
      { isTester: isTester || isFounder },
    );

  // Buiten dag 1-21 → terug naar dashboard (weekritme-modus)
  if (dag < 1 || dag > 21) {
    redirect("/dashboard");
  }
```

- [ ] **Step 3: Voeg het laden van tekst_overrides toe na pasOverrideToe**

Onder de regel `dagData = pasOverrideToe(dagData, overrideMap.get(dag) ?? null);`, voeg toe (vóór de "Voltooide taken voor deze dag"-block):

```tsx
  // Nieuwe namespace-style overrides laden (sprint-dag, sprint-ui,
  // sprint-groet) en per-dag-content toepassen op dagData. Dit werkt
  // NAAST de oude playbook_overrides-tabel — bestaande edits in die
  // tabel blijven werken.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tekstOverrides = await haalTekstOverrides(supabase as any, [
    "sprint-dag",
    "sprint-ui",
    "sprint-groet",
  ]);
  dagData = pasSprintDagOverridesToe(
    dagData,
    tekstOverrides.get("sprint-dag"),
  );
  const uiOverrides = namespaceAlsRecord(tekstOverrides, "sprint-ui");
  const groetOverrides = namespaceAlsRecord(
    tekstOverrides,
    "sprint-groet",
  );
```

- [ ] **Step 4: Geef de nieuwe overrides door aan VandaagFlow**

Onderaan de functie, vervang de return-statement:

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
    />
  );
}
```

- [ ] **Step 5: TypeScript-check**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt. Mogelijk klaagt 't dat `VandaagFlow` nog niet de nieuwe props accepteert — fix in Task 8.

> **NB:** Als de build hier faalt op `uiOverrides`/`groetOverrides` props die niet bestaan op `VandaagFlow`, ga gewoon door naar Task 8. De TypeScript-fout wordt daar opgelost; we hoeven niet apart te committen tussendoor als de fout alleen in deze koppeling zit.

- [ ] **Step 6: Commit**

```bash
git add app/vandaag/page.tsx
git commit -m "feat(vandaag): ?dag=N voor founders + tekst_overrides laden

Founders kunnen via ?dag=N naar elke dag (1-60) springen zonder
hun voortgang aan te raken. Members negeren de query-param.

Server laadt nu ook tekst_overrides voor namespaces sprint-dag /
sprint-ui / sprint-groet en past ze toe op de DAGEN-data + geeft
ze door aan VandaagFlow als props.

Bestaande playbook_overrides blijven naast de nieuwe staan.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: VandaagFlow accepteert overrides-props + EditModeProvider + TesterToolbar

**Files:**
- Modify: `app/vandaag/vandaag-flow.tsx`

- [ ] **Step 1: Update imports + Props-type**

In `app/vandaag/vandaag-flow.tsx`, vervang de imports en het Props-type:

```tsx
"use client";

import { celebrate } from "@/lib/celebrate";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { UitnodigHelpKnoppen } from "@/components/vandaag/UitnodigHelpKnoppen";
import { SocialPlatformKnoppen } from "@/components/vandaag/SocialPlatformKnoppen";
import { HerinnerLaterKnop } from "@/components/playbook/HerinnerLaterKnop";
import { VCardUploader } from "@/components/vandaag/inline-embeds/VCardUploader";
import { SponsorMeldingKnop } from "@/components/vandaag/inline-embeds/SponsorMeldingKnop";
import { NamenForm } from "@/components/vandaag/inline-embeds/NamenForm";
import { pakDagdeelGroetMetNaam } from "@/lib/util/dagdeel-groet";
import type { Dag, ControllableTaak } from "@/lib/playbook/types";
import { EditModeProvider, useEditModus } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { TesterToolbar } from "@/components/tester/TesterToolbar";

// ... bestaande comments en flowPositieKey, isMobielApparaat ongewijzigd
```

- [ ] **Step 2: Vervang het Props-type + signatuur van VandaagFlow**

Vervang het `Props`-type en het `export function VandaagFlow(...)`-blok:

```tsx
type Props = {
  dag: Dag;
  voltooidIds: string[];
  initialZinnen: Record<string, string>;
  voornaam: string;
  /** Toont de founder-bewerk-banner bovenaan de flow als true. */
  isFounder?: boolean;
  /** Per-namespace tekst-overrides geladen op de server. */
  uiOverrides?: Record<string, string>;
  groetOverrides?: Record<string, string>;
};

const DAG_GROETEN: Record<number, string> = {
  1: "🚀 Daar ga je! Je eerste dag",
  7: "🎉 Week 1 zit erop, top dat je doorzet!",
  8: "💪 Week 2! Tijd om door te pakken",
  14: "🏁 Halverwege, je hoort bij de 20% die doorzet",
  15: "⏱️ Week 3 begint nu",
  21: "🏆 Laatste dag van week 3, klaar voor de echte run",
};

// Tijd-afhankelijke begroeting komt uit lib/util/dagdeel-groet.ts
// (zelfde logica voor server- en client-rendering).

export function VandaagFlow(props: Props) {
  // EditModeProvider om de hele flow zodat <EditableTekst editModusAan>
  // (via useEditModus()) reageert op de toggle bovenin.
  return (
    <EditModeProvider>
      <VandaagFlowInner {...props} />
    </EditModeProvider>
  );
}

function VandaagFlowInner({
  dag,
  voltooidIds: initialVoltooid,
  initialZinnen,
  voornaam,
  isFounder = false,
  uiOverrides = {},
  groetOverrides = {},
}: Props) {
  const { editModusAan } = useEditModus();
  const router = useRouter();
  const [voltooidIds, setVoltooidIds] = useState<Set<string>>(
    new Set(initialVoltooid),
  );
```

> NB: De rest van de useState's (bezigIds, stap, taakIndex, inlineWaardes, etc.) blijven 1-op-1 zoals ze waren. We hernoemen alleen `VandaagFlow` naar `VandaagFlowInner` en wikkelen 'm met een wrapper.

- [ ] **Step 3: Vervang de bestaande "FOUNDER-banner" door EditModeToggle + TesterToolbar**

Zoek in `vandaag-flow.tsx` het blok dat begint met:

```tsx
{/* FOUNDER-banner: link naar de bewerk-modus van deze dag.
    Edits in de tile-view zijn direct live in /vandaag (zelfde
    DAGEN-data + overrides). */}
{isFounder && (
  <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/10 px-4 py-3 flex items-start gap-3 flex-wrap">
    ...
    <Link
      href={`/playbook?dag=${dag.nummer}&preview=true`}
      ...
    >
      ✍️ Bewerk dag {dag.nummer} →
    </Link>
  </div>
)}
```

Vervang dat hele blok met:

```tsx
{/* Founder-toolbar: dag-spring + edit-modus toggle. Geen aparte
    /playbook?preview-link meer nodig — bewerken kan direct hier. */}
{isFounder && (
  <div className="space-y-2">
    <TesterToolbar huidigeDag={dag.nummer} urlModus="queryparam" />
    <EditModeToggle isFounder={isFounder} />
  </div>
)}
```

- [ ] **Step 4: Wrap Dag 1's groet, titel, watJeLeert en taken in EditableTekst**

Zoek in `vandaag-flow.tsx` de INTRO-stap waar `dag.titel` en `dag.watJeLeert` worden gerenderd:

```tsx
{/* INTRO-stap */}
{stap === "intro" && (
  <div className="space-y-6">
    <div className="text-center space-y-2 pt-4">
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        Dag {dag.nummer} · Fase {dag.fase}
      </p>
      <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
        {groet}
      </h1>
      ...
      <h2 className="font-serif-warm text-cm-gold text-xl">
        {dag.titel}
      </h2>
    </div>
    ...
```

Het is een grote sectie; vervang van `{stap === "intro" && (` t/m de `<button ... Begin met stap 1 →</button>` met:

```tsx
{/* INTRO-stap */}
{stap === "intro" && (
  <div className="space-y-6">
    <div className="text-center space-y-2 pt-4">
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        Dag {dag.nummer} · Fase {dag.fase}
      </p>
      {DAG_GROETEN[dag.nummer] ? (
        <EditableTekst
          namespace="sprint-groet"
          sleutel={`dag${dag.nummer}`}
          standaard={DAG_GROETEN[dag.nummer]}
          overrides={groetOverrides}
          isFounder={isFounder}
          editModusAan={editModusAan}
          as="h1"
          className="font-serif-warm text-3xl text-cm-white leading-tight"
          hint="Speciale groet alleen op deze dag-nummer"
        />
      ) : (
        <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
          {groet}
        </h1>
      )}
      <EditableTekst
        namespace="sprint-ui"
        sleutel="intro.in-het-teken-van"
        standaard="Vandaag staat in het teken van:"
        overrides={uiOverrides}
        isFounder={isFounder}
        editModusAan={editModusAan}
        as="p"
        className="text-cm-white/80 text-base mt-3 leading-relaxed"
        hint="Tekst boven de dag-titel, geldt voor ALLE 60 dagen"
      />
      <EditableTekst
        namespace="sprint-dag"
        sleutel={`dag${dag.nummer}.titel`}
        standaard={dag.titel}
        overrides={{}}
        isFounder={isFounder}
        editModusAan={editModusAan}
        as="h2"
        className="font-serif-warm text-cm-gold text-xl"
        hint={`Titel alleen voor dag ${dag.nummer}`}
      />
    </div>

    {/* 1. EERST HET FILMPJE */}
    <FilmInBlok
      slug={`playbook-dag-${dag.nummer}`}
      verbergZonderFilm
    />

    {/* 2. DE LES, volledig */}
    <div className="card border-l-4 border-cm-gold/60 space-y-2">
      <EditableTekst
        namespace="sprint-ui"
        sleutel="intro.les-header"
        standaard="📖 Les van vandaag"
        overrides={uiOverrides}
        isFounder={isFounder}
        editModusAan={editModusAan}
        as="h3"
        className="text-cm-gold font-semibold text-sm uppercase tracking-wider"
        hint="Header boven de les, geldt voor ALLE 60 dagen"
      />
      <EditableBlok
        namespace="sprint-dag"
        sleutel={`dag${dag.nummer}.watJeLeert`}
        standaard={dag.watJeLeert}
        overrides={{}}
        isFounder={isFounder}
        editModusAan={editModusAan}
        as="div"
        className="text-cm-white text-sm leading-relaxed whitespace-pre-line"
        rows={10}
        hint={`Les voor dag ${dag.nummer}`}
      />
    </div>

    {/* 3. DAN GA JE DOEN */}
    <div className="card space-y-2">
      <EditableTekst
        namespace="sprint-ui"
        sleutel="intro.taken-header"
        standaard={`✅ Nu ga je doen (${totaal} stap${totaal === 1 ? "" : "pen"})`}
        overrides={uiOverrides}
        isFounder={isFounder}
        editModusAan={editModusAan}
        as="h3"
        className="text-cm-gold font-semibold text-sm uppercase tracking-wider"
        hint="Header boven de takenlijst, gedeeld over alle dagen"
      />
      <ul className="space-y-1.5 text-sm text-cm-white">
        {taken.map((t, i) => (
          <li key={t.id} className="flex items-start gap-2">
            <span className="text-cm-gold flex-shrink-0">{i + 1}.</span>
            <span
              className={
                voltooidIds.has(t.id) ? "line-through opacity-50" : ""
              }
            >
              {/* Taak-label is in de overzichtslijst alleen lezen.
                  De échte EditableTekst voor het label staat in de
                  TAAK-stap zodat één edit-flow voor zowel overview
                  als taak-detail dezelfde sleutel gebruikt. */}
              {t.label}
            </span>
          </li>
        ))}
      </ul>
    </div>

    <button
      type="button"
      onClick={() => setStap("taak")}
      className="btn-gold w-full py-4 text-base font-bold"
    >
      {aantalVoltooid > 0
        ? "Door naar je volgende stap →"
        : "Begin met stap 1 →"}
    </button>

    {/* Snooze: herinner me later vandaag */}
    <div className="flex justify-center pt-1">
      <HerinnerLaterKnop
        dagNummer={dag.nummer}
        variant="tekstlink"
        label="Even niet nu, herinner me later vandaag"
      />
    </div>
  </div>
)}
```

- [ ] **Step 5: Wrap huidigeTaak.label en huidigeTaak.uitleg in TAAK-stap**

Zoek in `vandaag-flow.tsx` de TAAK-stap:

```tsx
{/* TAAK-stap */}
{stap === "taak" && huidigeTaak && (
  <div className="space-y-6">
    {/* Label staat bovenaan ... */}
    <div>
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        Stap {taakIndex + 1} van {totaal}
      </p>
      <h2 className="font-serif-warm text-2xl text-cm-white mt-1 leading-tight">
        {huidigeTaak.label}
      </h2>
    </div>
    ...
    {huidigeTaak.uitleg && (
      <p className="text-cm-white opacity-80 text-sm leading-relaxed whitespace-pre-line">
        {huidigeTaak.uitleg}
      </p>
    )}
    ...
```

Vervang dat label-blok + uitleg-blok met:

```tsx
{/* TAAK-stap */}
{stap === "taak" && huidigeTaak && (
  <div className="space-y-6">
    <div>
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        Stap {taakIndex + 1} van {totaal}
      </p>
      <EditableTekst
        namespace="sprint-dag"
        sleutel={`dag${dag.nummer}.taak.${huidigeTaak.id}.label`}
        standaard={huidigeTaak.label}
        overrides={{}}
        isFounder={isFounder}
        editModusAan={editModusAan}
        as="h2"
        className="font-serif-warm text-2xl text-cm-white mt-1 leading-tight"
        hint={`Taak-label, dag ${dag.nummer}, taak ${huidigeTaak.id}`}
      />
    </div>

    {/* Optionele film, BOVEN de uitleg */}
    {huidigeTaak.filmSlug && (
      <FilmInBlok
        slug={huidigeTaak.filmSlug}
        fallbackTitel="📹 Bekijk de video"
        fallbackTekst="Film volgt, wordt door de hoofdbeheerder toegevoegd."
      />
    )}

    {/* Uitleg, ONDER het filmpje */}
    {huidigeTaak.uitleg && (
      <EditableBlok
        namespace="sprint-dag"
        sleutel={`dag${dag.nummer}.taak.${huidigeTaak.id}.uitleg`}
        standaard={huidigeTaak.uitleg}
        overrides={{}}
        isFounder={isFounder}
        editModusAan={editModusAan}
        as="div"
        className="text-cm-white opacity-80 text-sm leading-relaxed whitespace-pre-line"
        rows={6}
        hint={`Taak-uitleg, dag ${dag.nummer}, taak ${huidigeTaak.id}`}
      />
    )}
```

> Belangrijk: alle code dáárna in de TAAK-stap (UitnodigHelpKnoppen, mobile-warning, inline-embed, actieRoute, inline-actie, hoofd-actie-knoppen) blijven ongewijzigd. We wrappen alleen `huidigeTaak.label` en `huidigeTaak.uitleg` in deze fase.

- [ ] **Step 6: TypeScript-check**

Run: `npm run build 2>&1 | tail -30`
Expected: build slaagt. Eventuele bestaande TS-fouten elders in de codebase blijven, maar nieuwe imports in vandaag-flow.tsx mogen geen fouten opleveren.

- [ ] **Step 7: Commit**

```bash
git add app/vandaag/vandaag-flow.tsx
git commit -m "feat(vandaag): EditModeProvider + Toggle + EditableTekst-wraps Dag 1

VandaagFlow opgesplitst in wrapper + Inner. Wrapper biedt EditMode-
context aan; Inner gebruikt useEditModus() om pencils te tonen/
verbergen.

Founder ziet bovenaan:
  - TesterToolbar (urlModus=queryparam, geen run_startdatum-impact)
  - EditModeToggle (✍️ AAN/UIT)

Eerste tekst-velden gewrapt in EditableTekst:
  - DAG_GROETEN[N] → namespace sprint-groet
  - 'Vandaag staat in het teken van:' → namespace sprint-ui
  - dag.titel → namespace sprint-dag (per dag)
  - 'Les van vandaag'-header → namespace sprint-ui
  - dag.watJeLeert → namespace sprint-dag (per dag)
  - 'Nu ga je doen ({n} stappen)' → namespace sprint-ui
  - huidigeTaak.label → namespace sprint-dag (per dag, per taak)
  - huidigeTaak.uitleg → namespace sprint-dag (per dag, per taak)

Genoeg voor Raoul + Gaby om de UX op Dag 1 te reviewen voordat we
de overige UI-strings + andere dagen wrappen (Fase 1B).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Smoke-test + push

**Files:** geen wijzigingen, alleen testen + deployen.

- [ ] **Step 1: Volledige build draaien**

Run: `npm run build`
Expected: build slaagt zonder fouten in de bestanden uit Task 1-8.

> Als de build faalt: kijk naar de specifieke fout. Veel voorkomende oorzaken:
> - Ontbrekende import in `vandaag-flow.tsx` (EditableTekst, EditableBlok, EditModeProvider, useEditModus, EditModeToggle, TesterToolbar) → corrigeer en re-build.
> - `searchParams` als Promise versus object: Next.js 14 vereist `Promise<{ ... }>`. Als het al synchroon was: laat de cast staan.
> - `TesterToolbar` props mismatch met dashboard-gebruik: dashboard geeft alleen `huidigeDag`, dat blijft werken want `urlModus` heeft default.

- [ ] **Step 2: Push naar main (Vercel-deploy auto-trigger)**

```bash
git push origin main
```

Wacht ~2 min op Vercel-deploy. Check status via `gh run list --limit 3` of via de Vercel-dashboard.

- [ ] **Step 3: Manuele smoke-test door Raoul (in browser, op live site)**

Open `https://change-masters-60-day-q25o.vercel.app/vandaag` als ingelogde founder.

Verifieer (in volgorde):

1. Bovenaan zie je een paarse `TesterToolbar` met "Spring naar andere dag →"-knop.
2. Daaronder zie je de `EditModeToggle` met "Edit-modus is UIT".
3. Klik op de toggle → tekst verandert naar "AAN", knop wordt goud.
4. Naast `dag.titel`, `watJeLeert`, en de taken-labels verschijnen `✍️ Bewerk`-knoppen.
5. Klik op de toggle nogmaals → "UIT", pencils verdwijnen. View ziet eruit als wat een member ziet.
6. Refresh de pagina (F5). De toggle blijft op zijn laatst-gekozen stand staan (localStorage).
7. Klik op TesterToolbar's "Spring naar andere dag →" → kies "Dag 5". URL verandert naar `/vandaag?dag=5`. Inhoud is van Dag 5. Toggle blijft AAN.
8. Klik op `✍️ Bewerk` naast `dag.titel` (op dag 5 nu). Wijzig naar bijv. "TEST overschreven titel". Klik "Bewaar voor alle members". Refresh → titel is nog steeds gewijzigd.
9. Klik op `✍️ Bewerk` opnieuw → "Terug naar standaard". Refresh → originele titel terug.
10. Open de pagina als member-account (geen role=founder). Geen toolbar, geen toggle, geen pencils zichtbaar. Inhoud is identiek aan wat de founder ziet zonder edit-modus.

- [ ] **Step 4: Markeer succes of openstaande issues**

Als alle 10 punten ✓: Fase 1A geslaagd. Klaar voor Raoul + Gaby's review-rondje. Volgende plan: Fase 1B (alle resterende dagen + UI-strings).

Als één of meer punten ✗: noteer welke, ga terug naar de relevante taak. Veel voorkomende issues:
- Toggle reageert niet: check dat `EditModeProvider` de hele subtree omhult (Task 8 step 2).
- ✍️-knop verschijnt niet: check `editModusAan`-prop op EditableTekst (Task 3 step 3).
- Server-overrides werken niet: check namespace-spelling (`sprint-dag`, `sprint-ui`, `sprint-groet`, geen typos).
- ?dag=N negeert founder: check `isFounder && sp.dag` in Task 7 step 2.

---

## Self-Review Checklist (vóór execution-handoff)

**1. Spec coverage:**
- ✓ EditableTekst editModusAan-prop → Task 3
- ✓ EditModeToggle component → Task 2
- ✓ EditModeContext + localStorage → Task 1
- ✓ TesterToolbar urlModus → Task 6
- ✓ Server overrides laden → Tasks 4, 5, 7
- ✓ pasOverrideToe uitbreiding → Task 5
- ✓ /vandaag/page.tsx ?dag=N → Task 7
- ✓ Dag 1 wrappen in vandaag-flow → Task 8
- ✓ Smoke-test → Task 9

**2. Placeholder scan:** geen TBD, TODO, of "vul aan". Code-blokken zijn compleet.

**3. Type consistency:**
- `editModusAan` is consistent overal (Task 3 introductie, Task 8 gebruik).
- `urlModus` is consistent (Task 6 + Task 8 step 3).
- `haalTekstOverrides` returnt `TekstOverrides` = `Map<string, Map<string, string>>`, gebruikt in Task 7 via `tekstOverrides.get(...)`.
- `pasSprintDagOverridesToe` accepteert `Map<string, string> | undefined`, gevoed door `tekstOverrides.get("sprint-dag")` ✓.

**4. Implementatie-volgorde:** taken zijn opbouwend — context (Task 1) → toggle (Task 2) → editable (Task 3) → loader (Task 4) → overrides (Task 5) → toolbar (Task 6) → page (Task 7) → flow (Task 8) → test (Task 9). Elke taak commit-baar ✓.

---

## Done = Klaar voor user-review

Plan beschrijft 9 commits + 1 push. Geschatte tijd: 3-4 uur focuswerk. Resultaat: Sprint Dag 1 (en eigenlijk elke dag, want het wrappen werkt voor alle dag-nummers) is bewerkbaar via inline edit-modus voor founders. Members zien geen verandering.
