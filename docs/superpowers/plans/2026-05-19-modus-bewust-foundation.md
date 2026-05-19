# Modus-bewust foundation, fase 3a Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elk pagina-component in ELEVA leert eerst kijken naar de modus van de gebruiker en toont vervolgens de juiste taal en content (Sprint vs Core vs Pro), zonder Sprint-only-aannames die voor Core/Pro fout uitkomen.

**Architecture:** Eén centrale helper-file (`lib/playbook/dagen-voor-modus.ts`) levert vier kleine functies (dag-object, max-dag, Topbar-label, voortgangs-percentage) per modus. `berekenHuidigeDag` krijgt een `modus`-parameter en gebruikt de juiste DAGEN-array. Topbar, dashboard, /vandaag, /statistieken, /team en de middleware lezen `profile.modus` en gedragen zich daarnaar. Pro-gebruikers worden netjes naar `/welkom-pro` geleid. Dag-spring API update voortaan alle drie startdatum-velden tegelijk zodat founders consistent kunnen testen.

**Tech Stack:** Next.js 15 App Router · TypeScript · Supabase (PostgreSQL + RLS) · `npm run build` als verificatie (geen test-framework). Pilot-context: main-branch, geen feature-branch. Smoke-test op live aan het einde.

**Spec:** [docs/superpowers/specs/2026-05-19-modus-bewust-foundation-design.md](../specs/2026-05-19-modus-bewust-foundation-design.md)

---

## File-overzicht

**Nieuwe bestanden:**

| Bestand | Verantwoordelijkheid |
|---|---|
| `lib/playbook/dagen-voor-modus.ts` | Vier helpers: `dagVoorModusEnNummer`, `maxDagVoorModus`, `topbarLabelVoorModus`, `voortgangPercentageVoorModus`. Eén bron voor "wat hoort bij welke modus". |

**Te wijzigen bestanden:**

| Bestand | Wijziging |
|---|---|
| `lib/playbook/bereken-dag.ts` | Voeg optionele `modus`-parameter toe, kies juiste DAGEN-array (Sprint/Core), retourneer 0 voor Pro. |
| `components/layout/Topbar.tsx` | Vervang harde "Dag X van 60"-strings + percentage-formule door helper-aanroepen. Voeg `modus`-prop en optionele `proStap`-prop toe. Verwijder dode `fase`-variabele. |
| `components/layout/AppShell.tsx` | Geef `modus` door aan `<Topbar>`. Voor Pro: leid `proStap` af van `run_startdatum`/`created_at`. |
| `app/dashboard/page.tsx` | CTA-tile gebruikt `dagVoorModusEnNummer(modus, dag)` ipv hardcoded `DAGEN.find()`. |
| `app/vandaag/page.tsx` | Direct na profiel-load: `if (modus === "pro") redirect("/welkom-pro");`. |
| `app/statistieken/page.tsx` | Pro-redirect bovenaan. Lees `sprint_startdatum`/`core_startdatum`. Labels via `topbarLabelVoorModus`. |
| `app/team/page.tsx` | Pro-redirect bovenaan. Idem labels via helper. |
| `app/api/tester/spring-naar-dag/route.ts` | Update altijd zowel `run_startdatum`, `sprint_startdatum` als `core_startdatum`. |
| `lib/supabase/middleware.ts` | Whitelist `/welkom-keuze`, `/welkom-pro`, `/welkom-core` (+ `/stap` sub-routes). Pro-redirect: bij `modus="pro"` + `onboarding_klaar=false` → `/welkom-pro` ipv `/mijn-why`. |

---

### Task 1: Centrale helper `dagen-voor-modus.ts`

**Files:**
- Create: `lib/playbook/dagen-voor-modus.ts`

- [ ] **Step 1: Schrijf de helper-file**

Bestand: `lib/playbook/dagen-voor-modus.ts`

```typescript
import type { Modus } from "@/lib/onboarding/voltooiingen";
import { DAGEN } from "./dagen";
import {
  CORE_DAGEN,
  genereerVerankeringsDag,
  genereerLifetimeDag,
} from "./core-dagen";
import type { Dag } from "./types";

// ============================================================
// dagen-voor-modus.ts, één bron voor modus-bewuste dag-info.
//
// Vier helpers:
//   - dagVoorModusEnNummer: geef het Dag-object voor (modus, nummer)
//   - maxDagVoorModus: maximaal zinvol dag-nummer
//   - topbarLabelVoorModus: tekst voor de Topbar-cirkel
//   - voortgangPercentageVoorModus: voor de voortgangsbalk (0-100)
//
// Pro heeft geen dag-flow in deze pilot, alleen een 14-stappen
// leerpad. Helpers retourneren null/0/passende string voor Pro.
// ============================================================

/** Geeft het juiste Dag-object voor (modus, dag-nummer). */
export function dagVoorModusEnNummer(
  modus: Modus,
  dagNummer: number,
): Dag | null {
  if (modus === "core") {
    if (dagNummer <= 21) {
      return CORE_DAGEN.find((d) => d.nummer === dagNummer) ?? null;
    }
    if (dagNummer <= 40) return genereerVerankeringsDag(dagNummer);
    return genereerLifetimeDag(dagNummer);
  }
  if (modus === "sprint") {
    return DAGEN.find((d) => d.nummer === dagNummer) ?? null;
  }
  return null; // Pro heeft geen dag-flow
}

/** Maximum zinvol dag-nummer voor de modus. */
export function maxDagVoorModus(modus: Modus): number {
  if (modus === "core") return 999; // lifetime gaat door
  if (modus === "sprint") return 60;
  return 0; // Pro doet niet mee in dag-flow
}

/** Tekst voor de Topbar-cirkel-tooltip / desktop-label. */
export function topbarLabelVoorModus(
  modus: Modus,
  dagNummer: number,
  proStap?: number,
): string {
  if (modus === "core") {
    if (dagNummer <= 40) return `Dag ${dagNummer} opstart`;
    return `Lifetime dag ${dagNummer}`;
  }
  if (modus === "sprint") return `Dag ${dagNummer} van 60`;
  if (modus === "pro") {
    const stap = proStap ?? 1;
    return `Stap ${stap} van 14`;
  }
  return `Dag ${dagNummer}`;
}

/** Voortgangs-percentage voor de Topbar-balk (0-100). */
export function voortgangPercentageVoorModus(
  modus: Modus,
  dagNummer: number,
  proStap?: number,
): number {
  if (modus === "core") {
    if (dagNummer <= 40) return Math.round((dagNummer / 40) * 100);
    return 100; // opstart voltooid, lifetime actief
  }
  if (modus === "sprint") return Math.round((dagNummer / 60) * 100);
  if (modus === "pro") {
    const stap = proStap ?? 1;
    return Math.round((stap / 14) * 100);
  }
  return 0;
}
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt, geen TS-errors. Helper-file wordt nog niet gebruikt, dus tree-shaking laat 'm weg uit de bundle, dat is OK.

- [ ] **Step 3: Commit**

```bash
git add lib/playbook/dagen-voor-modus.ts
git commit -m "feat(modus): centrale dagen-voor-modus helpers

Eén bron voor modus-bewuste dag-info (dag-object, max-dag,
Topbar-label, voortgangs-percentage). Wordt vanaf taak 2 gebruikt
in Topbar, dashboard, statistieken, team."
```

---

### Task 2: `berekenHuidigeDag` modus-bewust

**Files:**
- Modify: `lib/playbook/bereken-dag.ts`

- [ ] **Step 1: Voeg modus-parameter toe**

Bestand: `lib/playbook/bereken-dag.ts`

Vervang de hele inhoud van het bestand door:

```typescript
import { differenceInDays } from "date-fns";
import { DAGEN } from "@/lib/playbook/dagen";
import { CORE_DAGEN } from "@/lib/playbook/core-dagen";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// bereken-dag.ts, één bron voor "welke dag is de member nu op?"
//
// Twee modi qua bereken-logica, plus modus-bewust qua DAGEN-array:
//
//   MEMBER (default): VOORTGANG-GEBASEERD.
//     De huidige dag = de eerste dag (1-21) waarvan NIET alle
//     verplichte taken voltooid zijn. Iemand die dag 16 doet en dan
//     4 dagen niets, opent ELEVA opnieuw en staat alsnog op dag 17,
//     niet op dag 20.
//
//   TESTER / FOUNDER: KALENDER-GEBASEERD.
//     huidige dag = differenceInDays(vandaag, startdatum) + 1
//     Zo blijft de tester-toolbar (die startdatum verzet) werken.
//
// Modus-bewust: per 2026-05-19 leest deze helper de juiste DAGEN-
// array op basis van modus (Sprint = DAGEN, Core = CORE_DAGEN).
// Pro heeft geen dag-flow, retourneert 0.
// ============================================================

export type DagVoltooiingRij = {
  dag_nummer: number;
  taak_id: string;
};

/**
 * Berekent welke dag de member op staat.
 *
 * @param voltooiingen Alle dag_voltooiingen-rijen voor deze user.
 * @param startdatum Modus-specifieke startdatum (ISO) of legacy
 *   run_startdatum als fallback. Null = vandaag.
 * @param opties.isTester Tester of founder, → kalender-modus.
 * @param opties.modus sprint (default), core of pro. Pro = retourneert 0.
 */
export function berekenHuidigeDag(
  voltooiingen: DagVoltooiingRij[],
  startdatum: string | null,
  opties: { isTester?: boolean; modus?: Modus } = {},
): number {
  const modus: Modus = opties.modus ?? "sprint";

  // Pro: geen dag-flow.
  if (modus === "pro") return 0;

  // ========== TESTERS/FOUNDERS: kalender-modus ==========
  if (opties.isTester) {
    return berekenKalenderdag(startdatum);
  }

  // ========== MEMBERS: voortgang-modus ==========
  const dagenArray = modus === "core" ? CORE_DAGEN : DAGEN;

  // Bouw set van voltooide taken per dag.
  const voltooidPerDag = new Map<number, Set<string>>();
  for (const v of voltooiingen) {
    if (!voltooidPerDag.has(v.dag_nummer)) {
      voltooidPerDag.set(v.dag_nummer, new Set());
    }
    voltooidPerDag.get(v.dag_nummer)!.add(v.taak_id);
  }

  // Loop dag 1-21 in de juiste array, vind eerste waar verplichte
  // taken niet allemaal voltooid zijn.
  for (let dagNr = 1; dagNr <= 21; dagNr++) {
    const dagData = dagenArray.find((d) => d.nummer === dagNr);
    if (!dagData) continue;
    const verplichteTaken = dagData.vandaagDoen.filter((t) => t.verplicht);
    if (verplichteTaken.length === 0) continue;
    const voltooid = voltooidPerDag.get(dagNr) ?? new Set<string>();
    const alleVerplichteVoltooid = verplichteTaken.every((t) =>
      voltooid.has(t.id),
    );
    if (!alleVerplichteVoltooid) {
      return dagNr;
    }
  }

  // Alle 21 dagen voltooid: door naar weekritme (Sprint) of
  // verankering/lifetime (Core). Daar gebruiken we kalenderdag.
  return Math.max(22, berekenKalenderdag(startdatum));
}

/**
 * Klassieke kalender-berekening: hoeveel dagen sinds startdatum?
 * Wordt gebruikt door testers/founders en voor dag 22+.
 *
 * Voor Core mag dit getal boven 60 uitkomen (lifetime). Voor Sprint
 * cappen we op 60. Voor Pro is deze helper irrelevant.
 */
export function berekenKalenderdag(startdatum: string | null): number {
  const start = startdatum ? new Date(startdatum) : new Date();
  const dag = differenceInDays(new Date(), start) + 1;
  return Math.max(1, dag);
}
```

Belangrijke wijziging: `berekenKalenderdag` cappt niet meer hardcoded op 60. Sprint-callers moeten zelf cappen (was niet eerder nodig want bereken-dag werd alleen voor Sprint gebruikt). Core mag boven 60 doorrollen (lifetime).

- [ ] **Step 2: Sprint-cap toevoegen in callers**

Run om bestaande callers te vinden:

```bash
grep -rn "berekenKalenderdag\|berekenHuidigeDag" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v "bereken-dag.ts"
```

Voor elke caller die specifiek voor Sprint rekent (geen modus meegeeft): de bestaande call blijft werken want default = sprint. Voor pro-callers expliciet `modus: "pro"` meegeven zodat ze 0 terugkrijgen.

Geen edits in deze step, alleen de check. Stappen 3+ doen de echte aanpassingen in volgende tasks.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build slaagt. Bestaande callers (zonder `modus`-parameter) gedragen zich identiek aan voorheen (default = sprint).

- [ ] **Step 4: Commit**

```bash
git add lib/playbook/bereken-dag.ts
git commit -m "feat(modus): berekenHuidigeDag modus-bewust

Voegt optionele modus-parameter toe (sprint default, core, pro).
Sprint = DAGEN-array (zoals voorheen). Core = CORE_DAGEN. Pro = 0.

berekenKalenderdag cappt niet meer op 60, callers cappen zelf
(Sprint = 60, Core = doorrollen voor lifetime)."
```

---

### Task 3: Topbar modus-bewust

**Files:**
- Modify: `components/layout/Topbar.tsx`

- [ ] **Step 1: Voeg modus + proStap props toe en gebruik helpers**

Bestand: `components/layout/Topbar.tsx`

Vervang de huidige `export function Topbar` signature en de cirkel-/balk-renderer. Het hele bestand wordt grotendeels gelijk, alleen de regels 11-145 wijzigen.

Vervang regel 11-43 (functie-signature t/m `const { v } = useTaal();`) door:

```typescript
import { topbarLabelVoorModus, voortgangPercentageVoorModus } from "@/lib/playbook/dagen-voor-modus";
import type { Modus } from "@/lib/onboarding/voltooiingen";

export function Topbar({
  gebruikersnaam,
  fotoUrl,
  huidigeDag,
  modus,
  proStap,
}: {
  gebruikersnaam: string;
  /** Profielfoto-URL uit profiles.foto_url, null als geen foto geüpload. */
  fotoUrl: string | null;
  /** Server-side berekende huidige dag (modus-bewust, via dezelfde
   *  helper als dashboard en /vandaag). Topbar overschrijft alleen
   *  wanneer de URL ?dag=N parameter heeft op /playbook. */
  huidigeDag: number;
  /** Modus van de gebruiker. Bepaalt label-tekst en voortgangs-formule. */
  modus: Modus;
  /** Voor Pro: huidige stap (1-14) in PRO_LEERPAD. Voor Sprint/Core
   *  niet gebruikt. */
  proStap?: number;
}) {
  const [aantalHerinneringen, setAantalHerinneringen] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [profielMenuOpen, setProfielMenuOpen] = useState(false);
  const profielMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Founder-preview: ?dag=N op /playbook overschrijft de berekende dag.
  // Sprint cappt op 60, Core mag doorrollen (lifetime).
  const dagFromUrl =
    pathname === "/playbook" ? Number(searchParams.get("dag")) : NaN;
  const maxDag = modus === "sprint" ? 60 : 999;
  const dag =
    Number.isFinite(dagFromUrl) && dagFromUrl >= 1 && dagFromUrl <= maxDag
      ? dagFromUrl
      : huidigeDag;
  // Cirkel-getal: voor Pro tonen we proStap, voor Sprint/Core dag-nummer.
  const cirkelGetal = modus === "pro" ? (proStap ?? 1) : dag;
  const label = topbarLabelVoorModus(modus, dag, proStap);
  const percentage = voortgangPercentageVoorModus(modus, dag, proStap);
  const { v } = useTaal();
```

Verwijder de dode `const fase = dag <= 20 ? 1 : dag <= 40 ? 2 : 3;` regel.

Vervang regel 125-145 (de cirkel + voortgangsbalk JSX) door:

```tsx
      <div className="flex items-center gap-4 ml-10 lg:ml-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cm-gold/15 border border-cm-gold/50 flex items-center justify-center">
            <span className="text-cm-gold text-xs font-bold">{cirkelGetal}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-cm-white text-sm font-medium">{label}</p>
          </div>
        </div>

        {/* Voortgangsbalk, modus-bewust percentage */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-32 h-1 bg-cm-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-cm-white/60 text-xs">{percentage}%</span>
        </div>
      </div>
```

De rest van het bestand (de useEffects, de logUit, de rest van de JSX vanaf "Rechts: herinneringen + gebruiker") blijft ongewijzigd.

Let op: de import `useTaal` wordt niet meer gebruikt voor `v("dashboard.dag")`/`v("dashboard.van_60")` maar wel elders, dus laat de import staan.

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build faalt — `<Topbar>` callers (in AppShell) missen nu de verplichte `modus`-prop. Task 4 vult dat aan. Voor nu accepteren we build-fout, fix in volgende task.

Sla deze step over als de build groen blijft (Task 4 voegt direct daarna `modus`-prop toe in AppShell).

- [ ] **Step 3: Commit**

```bash
git add components/layout/Topbar.tsx
git commit -m "feat(topbar): modus-bewust label + percentage via helpers

Topbar leest nu modus + optionele proStap als props. Cirkel-getal,
label-tekst en voortgangs-percentage komen uit dagen-voor-modus
helpers. Dode fase-variabele weg.

Sprint: Dag X van 60. Core: Dag X opstart (1-40) of Lifetime dag X
(41+). Pro: Stap X van 14.

Build is rood tot Task 4 modus-prop doorgeeft vanuit AppShell."
```

---

### Task 4: AppShell geeft modus door

**Files:**
- Modify: `components/layout/AppShell.tsx`

- [ ] **Step 1: Bereken proStap voor Pro en geef modus + proStap door**

Bestand: `components/layout/AppShell.tsx`

Voeg bovenaan de imports toe (na de bestaande imports):

```typescript
import { differenceInDays } from "date-fns";
import { PRO_LEERPAD } from "@/lib/leerpaden/pro-stappen";
```

Vervang de `<Topbar ... />` JSX-regel (zoek in het bestand). De huidige call is:

```typescript
          <Topbar
            gebruikersnaam={profile?.full_name || user.email || "Teamlid"}
            fotoUrl={(profile as { foto_url?: string | null } | null)?.foto_url ?? null}
            huidigeDag={huidigeDag}
          />
```

Voeg vlak boven de `return`-statement (rond regel 105) de proStap-berekening toe:

```typescript
  // Pro-stap berekenen op basis van kalenderdagen sinds run_startdatum
  // (of created_at als fallback). Pro heeft geen dag-flow, alleen een
  // 14-stappen leerpad. Capt op 14.
  const proStapBerekend = (() => {
    if (huidigeModus !== "pro") return undefined;
    const startBron =
      profielData.run_startdatum ?? profielData.created_at ?? null;
    const start = startBron ? new Date(startBron) : new Date();
    const dagen = differenceInDays(new Date(), start) + 1;
    return Math.max(1, Math.min(PRO_LEERPAD.totaal, dagen));
  })();
```

Vervang de `<Topbar ... />` door:

```typescript
          <Topbar
            gebruikersnaam={profile?.full_name || user.email || "Teamlid"}
            fotoUrl={(profile as { foto_url?: string | null } | null)?.foto_url ?? null}
            huidigeDag={huidigeDag}
            modus={huidigeModus}
            proStap={proStapBerekend}
          />
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt. Topbar krijgt modus + proStap, Sprint-leden zien "Dag X van 60" zoals voorheen, Core-leden zien "Dag X opstart" of "Lifetime dag X", Pro-leden zien "Stap X van 14".

- [ ] **Step 3: Commit**

```bash
git add components/layout/AppShell.tsx
git commit -m "feat(appshell): geef modus + proStap door aan Topbar

proStap berekend op basis van kalenderdagen sinds run_startdatum
(of created_at fallback), capt op PRO_LEERPAD.totaal (14).
Sprint/Core krijgen undefined proStap (niet gebruikt)."
```

---

### Task 5: Dashboard CTA-tile modus-bewust

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Vervang DAGEN.find/genereerWeekritmeDag-blok door helper-call**

Bestand: `app/dashboard/page.tsx`

Eerst importeer de helper bovenin (zoek de import-sectie):

```typescript
import { dagVoorModusEnNummer } from "@/lib/playbook/dagen-voor-modus";
```

Zoek de regels rond 398-421 (het `let huidigeDagData;` blok met de `if (dag <= 21)` / `else if (dag <= 60)` branche). Vervang dit hele blok door:

```typescript
  // Modus-bewuste CTA-tile data via centrale helper. Voor Sprint
  // gebruikt 'ie DAGEN, voor Core CORE_DAGEN + generator voor
  // verankering/lifetime. Voor Pro retourneert helper null, en
  // dashboard heeft 'm sowieso al via Pro-redirect afgehandeld.
  let huidigeDagData = dagVoorModusEnNummer(huidigeModus, dag);
  if (huidigeDagData && huidigeModus === "sprint") {
    // Sprint behoudt tempo-aware + founder-overrides.
    huidigeDagData = pasTempoToeOpDag(huidigeDagData, commitmentUrenDashboard);
    const overrideMap = await haalOverrides(supabase as any, [dag]);
    huidigeDagData = pasOverrideToe(
      huidigeDagData,
      overrideMap.get(dag) ?? null,
    );
  }
```

Belangrijk: de huidige Sprint-flow houdt tempo-aware + founder-overrides. Voor Core wordt nog geen tempo-aware toegepast (CORE_DAGEN heeft eigen DMO-bracket-logica). Dat is OK voor 3a, fijnafstelling kan in 3c.

- [ ] **Step 2: Verwijder ongebruikte imports**

In dezelfde file, de ongebruikte `genereerWeekritmeDag`-import kan blijven want elders gebruikt. Check `DAGEN`-import: als nergens meer gebruikt na deze wijziging, verwijderen.

Run om te checken:

```bash
grep -n "DAGEN\|genereerWeekritmeDag" app/dashboard/page.tsx
```

Verwacht: `DAGEN` mogelijk nog elders nodig (bv. mijlpaal-detectie). Laat staan tenzij build klaagt.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build slaagt. Dashboard-CTA-tile voor Sprint-member toont Sprint-content (zoals voorheen). Voor Core-member toont 'ie Core-content (titel + acties uit CORE_DAGEN).

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(dashboard): CTA-tile via dagVoorModusEnNummer

Sprint behoudt tempo-aware + founder-overrides. Core krijgt nu eigen
content uit CORE_DAGEN (inclusief verankering dag 22-40 en lifetime
41+). Geen Sprint-content meer voor Core-members op /dashboard."
```

---

### Task 6: /vandaag Pro-redirect

**Files:**
- Modify: `app/vandaag/page.tsx`

- [ ] **Step 1: Voeg Pro-redirect toe direct na profiel-load**

Bestand: `app/vandaag/page.tsx`

Zoek de regels waar `modus` wordt afgeleid (rond regel 195-200). Direct na het bepalen van `modusVoorDagTeller` (of vlak ervoor, na het laden van profile), voeg toe:

```typescript
  // Per 2026-05-19: Pro heeft geen /vandaag-flow in deze pilot. Stuur
  // Pro-gebruikers naar hun eigen leerpad-overzicht.
  if ((profile as any)?.modus === "pro") {
    redirect("/welkom-pro");
  }
```

Plaats deze regel direct na de `const { data: profile } = await supabase...maybeSingle();` of na de bestaande modus-afgeleide-bepaling, vóórdat verdere modus-afhankelijke berekeningen plaatsvinden.

Concreet: zoek de regel waar `const modusVoorDagTeller: Modus = ...` staat (de ternary die "sprint"/"core"/"pro" oplevert). Direct vóór die regel of meteen erna een veiligheids-redirect:

```typescript
  if (modusVoorDagTeller === "pro") redirect("/welkom-pro");
```

Plaats vlak na de definitie van `modusVoorDagTeller`.

- [ ] **Step 2: Verwijder de oude "valt terug op sprint-content"-fallback voor Pro**

Zoek de regels die zeggen dat Pro op Sprint-content terugvalt (commentaar rond "pro = nog niet gemigreerd"). Sinds Pro nu redirectet hoeft dit commentaar niet meer waar te zijn. Verwijder of pas aan tot:

```typescript
// Pro wordt boven dit punt al naar /welkom-pro geredirectet, dus
// alleen Sprint en Core komen hier door.
```

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build slaagt. Pro-gebruikers die op /vandaag belanden worden direct naar /welkom-pro gestuurd. Geen Sprint-content meer voor Pro.

- [ ] **Step 4: Commit**

```bash
git add app/vandaag/page.tsx
git commit -m "fix(vandaag): Pro-redirect direct na profiel-load

Pro heeft geen /vandaag-flow in deze pilot. Voorheen viel Pro terug
op Sprint-content (regel 244 commentaar). Nu netjes redirecten naar
/welkom-pro, waar Pro z'n 14-stappen leerpad heeft."
```

---

### Task 7: /statistieken modus-bewust

**Files:**
- Modify: `app/statistieken/page.tsx`

- [ ] **Step 1: Pro-redirect + modus-specifieke startdatum + helper-label**

Bestand: `app/statistieken/page.tsx`

Vervang de regels 9-79 (de hele page-functie) door:

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";
import { StatsOverzicht } from "@/components/statistieken/StatsOverzicht";
import { WekelijkseReviewFormulier } from "@/components/statistieken/WekelijkseReviewFormulier";
import { MentorStatsAnalyseKnop } from "@/components/statistieken/MentorStatsAnalyseKnop";
import { startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { topbarLabelVoorModus } from "@/lib/playbook/dagen-voor-modus";
import { berekenKalenderdag } from "@/lib/playbook/bereken-dag";
import type { Modus } from "@/lib/onboarding/voltooiingen";

export default async function StatistiekenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();

  const [{ data: profile }, { data: alleStats }, { data: prospects }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "modus, run_startdatum, sprint_startdatum, core_startdatum, created_at",
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("dagelijkse_stats")
        .select("*")
        .eq("user_id", user.id)
        .order("stat_datum", { ascending: true }),
      supabase
        .from("prospects")
        .select("pipeline_fase")
        .eq("user_id", user.id)
        .eq("gearchiveerd", false),
    ]);

  // Pro heeft eigen leerpad zonder dag-gebaseerde stats in deze pilot.
  const profielModus = ((profile as { modus?: string | null } | null)?.modus ??
    "sprint") as Modus;
  if (profielModus === "pro") redirect("/welkom-pro");

  // Modus-specifieke startdatum als anker. Voor Sprint capt op 60,
  // voor Core mag boven 40 (lifetime).
  const profielDatums = {
    sprint_startdatum:
      (profile as { sprint_startdatum?: string | null } | null)
        ?.sprint_startdatum ?? null,
    core_startdatum:
      (profile as { core_startdatum?: string | null } | null)
        ?.core_startdatum ?? null,
    run_startdatum:
      (profile as { run_startdatum?: string | null } | null)?.run_startdatum ??
      null,
    created_at:
      (profile as { created_at?: string | null } | null)?.created_at ?? null,
  };
  const startdatumDate = startdatumVoorModus(profielDatums, profielModus);
  const startdatumIso = startdatumDate
    ? startdatumDate.toISOString().slice(0, 10)
    : null;
  const ruweDag = berekenKalenderdag(startdatumIso);
  const dag =
    profielModus === "sprint" ? Math.max(1, Math.min(60, ruweDag)) : ruweDag;

  // Pipeline counts
  const pipelineCounts: Record<string, number> = {};
  (prospects || []).forEach((p: { pipeline_fase: string }) => {
    pipelineCounts[p.pipeline_fase] =
      (pipelineCounts[p.pipeline_fase] || 0) + 1;
  });

  const dagLabel = topbarLabelVoorModus(profielModus, dag);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4"
      >
        {v("algemeen.terug", taal)}
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("stats.titel", taal)}
        </h1>
        <p className="text-cm-white mt-1 opacity-70">
          {v("stats.subtitel", taal)}, {dagLabel}
        </p>
      </div>

      <MentorStatsAnalyseKnop />

      <WekelijkseReviewFormulier weekNummer={Math.max(1, Math.ceil(dag / 7))} />

      <StatsOverzicht
        alleStats={alleStats || []}
        pipelineCounts={pipelineCounts}
        dag={dag}
      />
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt. Sprint-member ziet "Dag 5 van 60", Core-member ziet "Dag 5 opstart" of "Lifetime dag 50".

- [ ] **Step 3: Commit**

```bash
git add app/statistieken/page.tsx
git commit -m "feat(statistieken): modus-bewust label + Pro-redirect

Sprint behoudt 'Dag X van 60' (legacy gedrag via cap 1-60). Core
gebruikt opstart-label of lifetime-label. Pro: redirect naar
/welkom-pro want Pro heeft geen dag-gebaseerde stats."
```

---

### Task 8: /team modus-bewust

**Files:**
- Modify: `app/team/page.tsx`

- [ ] **Step 1: Pro-redirect + helper-label**

Bestand: `app/team/page.tsx`

Voeg deze imports toe bovenaan:

```typescript
import { redirect } from "next/navigation";
import { startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { topbarLabelVoorModus } from "@/lib/playbook/dagen-voor-modus";
import { berekenKalenderdag } from "@/lib/playbook/bereken-dag";
import type { Modus } from "@/lib/onboarding/voltooiingen";
```

Vervang de regel 147-150 (profile select + ruwe dag-berekening) door:

```typescript
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "modus, run_startdatum, sprint_startdatum, core_startdatum, created_at, role",
    )
    .eq("id", user.id)
    .maybeSingle();
  const isLeider = (profile as { role?: string } | null)?.role === "leider";

  // Pro heeft eigen leerpad-overzicht, niet team-pagina (in deze pilot).
  const profielModus = ((profile as { modus?: string | null } | null)?.modus ??
    "sprint") as Modus;
  if (profielModus === "pro") redirect("/welkom-pro");

  // Modus-specifieke startdatum + dag-berekening + label.
  const profielDatums = {
    sprint_startdatum:
      (profile as { sprint_startdatum?: string | null } | null)
        ?.sprint_startdatum ?? null,
    core_startdatum:
      (profile as { core_startdatum?: string | null } | null)
        ?.core_startdatum ?? null,
    run_startdatum:
      (profile as { run_startdatum?: string | null } | null)?.run_startdatum ??
      null,
    created_at:
      (profile as { created_at?: string | null } | null)?.created_at ?? null,
  };
  const startdatumDate = startdatumVoorModus(profielDatums, profielModus);
  const startdatumIso = startdatumDate
    ? startdatumDate.toISOString().slice(0, 10)
    : null;
  const ruweDag = berekenKalenderdag(startdatumIso);
  const dag =
    profielModus === "sprint" ? Math.max(1, Math.min(60, ruweDag)) : ruweDag;
  const dagLabel = topbarLabelVoorModus(profielModus, dag);
```

Vervang regel 185 (`{v("team.dag", taal)} {dag} {v("dashboard.van_60", taal)}`) door:

```typescript
            {dagLabel}
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt. Team-pagina toont modus-bewust label.

- [ ] **Step 3: Commit**

```bash
git add app/team/page.tsx
git commit -m "feat(team): modus-bewust label + Pro-redirect

Sprint: 'Dag X van 60'. Core: opstart-label of lifetime-label.
Pro: redirect naar /welkom-pro."
```

---

### Task 9: Dag-spring API alle drie startdatums

**Files:**
- Modify: `app/api/tester/spring-naar-dag/route.ts`

- [ ] **Step 1: Update altijd alle drie startdatum-velden**

Bestand: `app/api/tester/spring-naar-dag/route.ts`

Zoek de regels waar de `updates`-object wordt opgebouwd (rond regel 60-68 na onze eerdere fix). Vervang door:

```typescript
    // Update alle drie startdatum-velden tegelijk. Reden: founder die
    // in Sprint test op dag 30 en daarna naar Core switcht, moet ook
    // in Core op dag 30 zitten. Voor gewone gebruikers irrelevant
    // (die springen niet). Voor founder/tester is dit precies wat
    // ze willen voor consistente test-ervaring.
    const updates: Record<string, string> = {
      run_startdatum: isoDatum,
      sprint_startdatum: isoDatum,
      core_startdatum: isoDatum,
    };

    const { error: updErr } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add app/api/tester/spring-naar-dag/route.ts
git commit -m "fix(spring-api): update altijd alle drie startdatum-velden

Voor founder/tester die heen en weer switcht tussen Sprint en Core
betekent dit dat de virtuele dag consistent blijft tussen modi.
Voor gewone gebruikers irrelevant (die springen niet).

Lost K5 op uit code-review 2026-05-19."
```

---

### Task 10: Middleware whitelist + Pro-redirect

**Files:**
- Modify: `lib/supabase/middleware.ts`

- [ ] **Step 1: Whitelist welkom-routes + Pro-pad**

Bestand: `lib/supabase/middleware.ts`

Vervang het `isProtectedRoute` blok + de redirect-logica (regels 69-95) door:

```typescript
  // Welkom-routes mogen los van /mijn-why/onboarding bezocht worden.
  // Anders krijgen Pro-leden en nieuwe gebruikers redirect-loops.
  const welkomRoutes = [
    "/welkom-keuze",
    "/welkom-pro",
    "/welkom-core",
    "/welkom",
  ];
  const isWelkomRoute = welkomRoutes.some((r) => pathname.startsWith(r));

  const isProtectedRoute =
    user &&
    !isPublicRoute &&
    !isWelkomRoute &&
    pathname !== "/mijn-why" &&
    pathname !== "/onboarding" &&
    !pathname.startsWith("/api/");

  if (isProtectedRoute) {
    // Controleer of onboarding klaar is + welke modus
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_klaar, modus")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();

    if (profile && !profile.onboarding_klaar) {
      // Pro-leden hebben geen WHY-pad in deze pilot. Stuur ze naar
      // hun eigen welkom-pagina. Andere modi (sprint, core, null)
      // gaan via /mijn-why.
      if (profile.modus === "pro") {
        url.pathname = "/welkom-pro";
      } else {
        url.pathname = "/mijn-why";
      }
      return NextResponse.redirect(url);
    }

    // Onboarding klaar maar stappen nog niet afgerond → naar /onboarding
    if (profile?.onboarding_klaar) {
      const onboardingStap = user.user_metadata?.onboarding_stap;
      if (
        onboardingStap !== undefined &&
        onboardingStap !== null &&
        Number(onboardingStap) < 99
      ) {
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/middleware.ts
git commit -m "fix(middleware): welkom-routes whitelist + Pro naar /welkom-pro

Welkom-routes (/welkom-keuze, /welkom-pro, /welkom-core, /welkom) mogen
los van /mijn-why en /onboarding bezocht worden. Anders kreeg Pro een
redirect-loop naar /mijn-why dat 'ie niet heeft.

Pro-leden met onboarding_klaar=false gaan voortaan naar /welkom-pro
ipv /mijn-why. Pro doet in deze pilot geen WHY-gesprek.

Lost B4 op uit code-review 2026-05-19."
```

---

### Task 11: Smoke-test op live + memory update

**Files:**
- Modify: `C:\Users\raoul\.claude\projects\c--Users-raoul-OneDrive-Bureaublad-CLAUDE-60-day-run-change-masters\memory\MEMORY.md`
- Create: `C:\Users\raoul\.claude\projects\c--Users-raoul-OneDrive-Bureaublad-CLAUDE-60-day-run-change-masters\memory\modus-bewust-foundation.md`

- [ ] **Step 1: Push naar main, wacht op Vercel-deploy**

```bash
git push
```

Wacht ~60 seconden tot deploy live is.

- [ ] **Step 2: Smoke-test Sprint-founder**

Op het echte founder-account (Raoul, modus=sprint):

1. Hard refresh `/dashboard`. Topbar-cirkel toont dag-nummer, label "Dag X van 60". Voortgangsbalk percentage = (dag/60)\*100.
2. Klik op de "Vandaag is dag X"-CTA-tile. /vandaag opent met Sprint-content.
3. Bezoek `/statistieken`. Header zegt "..., Dag X van 60".
4. Bezoek `/team`. Header zegt "Dag X van 60".

Verwacht resultaat: alles werkt als voorheen voor Sprint. Geen regressie.

- [ ] **Step 3: Smoke-test Core-switch**

Via `/instellingen/modus-test` switch naar Core:

1. Topbar label wordt "Dag X opstart" (1-40) of "Lifetime dag X" (41+).
2. Voortgangsbalk gebruikt /40 of toont 100% bij lifetime.
3. /vandaag opent met Core-content (geen Sprint-content).
4. /dashboard CTA-tile toont Core-dag-titel + Core-acties.
5. /statistieken toont "..., Dag X opstart" of "..., Lifetime dag X".
6. /team toont idem.

Verwacht resultaat: overal Core-tekst, geen Sprint-bleed.

- [ ] **Step 4: Smoke-test Pro-switch**

Via `/instellingen/modus-test` switch naar Pro:

1. Topbar label wordt "Stap 1 van 14" (of hoger als run_startdatum oud is).
2. Voortgangsbalk gebruikt /14.
3. Bezoek `/vandaag` rechtstreeks (URL typen). Redirectet naar `/welkom-pro`.
4. Bezoek `/statistieken`. Redirectet naar `/welkom-pro`.
5. Bezoek `/team`. Redirectet naar `/welkom-pro`.

Verwacht resultaat: Pro-flow is afgesneden van Sprint/Core-pagina's. Pro-leerpad blijft beschikbaar.

- [ ] **Step 5: Smoke-test dag-spring consistency**

Vanuit FounderTopStrip (paarse balk bovenaan):

1. Spring naar dag 30 in Sprint. Topbar-cirkel: 30. Label: "Dag 30 van 60".
2. Switch via /instellingen/modus-test naar Core. Topbar-cirkel: 30. Label: "Dag 30 opstart".
3. Springeerlijk: ook in Core moet dag 30 zichtbaar zijn (omdat spring-API alle drie startdatums updatete).

Verwacht resultaat: dag-nummer blijft synchroon tussen modi na een spring.

- [ ] **Step 6: Reset naar Sprint en switch terug**

Via `/instellingen/modus-test`:

1. Switch terug naar Sprint.
2. Topbar moet teruggaan naar "Dag X van 60" met juiste dag-nummer.
3. /dashboard CTA-tile = Sprint-content.

Verwacht resultaat: geen restjes van Core-config in de Sprint-render.

- [ ] **Step 7: Memory-pointer schrijven**

Bestand: `C:\Users\raoul\.claude\projects\c--Users-raoul-OneDrive-Bureaublad-CLAUDE-60-day-run-change-masters\memory\modus-bewust-foundation.md`

```markdown
---
name: modus-bewust-foundation
description: Fase 3a redesign live op 2026-05-19. Topbar/dashboard/statistieken/team/berekenHuidigeDag modus-bewust. Pro redirectet netjes naar /welkom-pro. Dag-spring update alle drie startdatums.
metadata:
  type: project
---

Live op 2026-05-19. Drie pijlers:

**A. Centrale dag-helper** `lib/playbook/dagen-voor-modus.ts`:
- `dagVoorModusEnNummer(modus, n)` → Dag-object uit juiste array (DAGEN of CORE_DAGEN).
- `maxDagVoorModus(modus)` → 60 / 999 / 0.
- `topbarLabelVoorModus(modus, dag, proStap?)` → tekst-string.
- `voortgangPercentageVoorModus(modus, dag, proStap?)` → 0-100.

**B. Pagina's gebruiken helper consistent**:
- AppShell geeft `modus` + `proStap` door aan Topbar.
- Topbar leest label + percentage uit helper.
- Dashboard CTA-tile via `dagVoorModusEnNummer`.
- /statistieken, /team via `topbarLabelVoorModus`.
- /vandaag, /statistieken, /team redirecten Pro naar /welkom-pro.

**C. Foundation-fixes**:
- `berekenHuidigeDag` heeft modus-parameter, gebruikt juiste DAGEN-array.
- Dag-spring API update voortaan `run_startdatum + sprint_startdatum + core_startdatum` tegelijk.
- Middleware whitelist `/welkom-keuze`, `/welkom-pro`, `/welkom-core`, `/welkom` (+ /stap).
- Pro met `onboarding_klaar=false` redirectet naar `/welkom-pro` ipv `/mijn-why`.

**Wat NIET in 3a (komt in 3b en 3c)**:
- Banner "Welkom terug" bij eerste keuze (K1, 3b).
- Impliciete Sprint-keuze bij modus=null (K2, 3b).
- Banner cache-lag (K3, 3b).
- app-geinstalleerd/push-aan markering (B1, 3c).
- ITEM_SLUGS imports (B3, 3c).
- taakNaarCrossModusSlug centraliseren (B5, 3c).

Pro-content blijft strikt buiten 3a. Wordt later vanaf scratch opgebouwd.

Gerelateerd: [[onboarding-redesign-fase-2]] · [[eleva-feature-status]] · [[raoul-stem-anker]]
```

Bewerk `MEMORY.md`, voeg pointer toe na de bestaande lijst:

```markdown
- [Modus-bewust foundation](modus-bewust-foundation.md) — fase 3a redesign live 2026-05-19, Topbar/dashboard/stats/team modus-bewust, Pro redirectet schoon.
```

- [ ] **Step 8: Finale commit**

```bash
git add -A
git commit -m "docs(memory): fase 3a modus-bewust foundation live + smoke-test

5 scenario's op live succesvol:
- Sprint-founder ongewijzigd
- Core-switch: Topbar, /vandaag, /dashboard, /stats, /team allemaal Core
- Pro-switch: Topbar 'Stap X van 14', /vandaag+/stats+/team redirecten
- Dag-spring consistency tussen Sprint en Core
- Switch terug naar Sprint zonder restjes

Memory bijgewerkt voor cross-sessie context."
git push
```

- [ ] **Step 9: Rapporteer aan Raoul**

```
Fase 3a modus-bewust foundation staat live.

✅ Centrale helper (dagen-voor-modus.ts) levert label + percentage + dag-object per modus
✅ berekenHuidigeDag modus-bewust
✅ Topbar toont juiste tekst per modus (Sprint: Dag X van 60, Core: opstart/lifetime, Pro: Stap X van 14)
✅ AppShell geeft modus + proStap door
✅ Dashboard CTA-tile gebruikt juiste DAGEN-array
✅ /vandaag, /statistieken, /team Pro-redirect
✅ Dag-spring updates alle drie startdatums (consistent over modi)
✅ Middleware whitelist welkom-routes + Pro-pad

Smoke-test 5 scenario's geslaagd.

Volgende ronde: fase 3b (onboarding-flow + banner-logica) als jij klaar bent.
```

---

## Self-review

**1. Spec coverage:**

- §3.1 Centrale helper → Task 1 ✓
- §3.2 berekenHuidigeDag modus-bewust → Task 2 ✓
- §3.3 Topbar modus-bewust → Task 3 + Task 4 ✓
- §3.4 Dashboard CTA-tile modus-bewust → Task 5 ✓
- §3.5 Pro-redirect /vandaag, /statistieken, /team → Task 6 + Task 7 + Task 8 ✓
- §3.6 Dag-spring API alle drie startdatums → Task 9 ✓
- §3.7 Middleware whitelist + Pro-pad → Task 10 ✓
- §7 Smoke-test op live → Task 11 ✓

Alle 6 bugs (K4, K5, K6, K7, B4, B8) zijn in concrete taken belegd. Geen gaten.

**2. Placeholder scan:** Geen TBD/TODO/"implement later". Wel: Task 6 zegt "zoek de regel waar...". Dat is een instructie, geen placeholder, want de regel die ik bedoel is uniek vindbaar (`modusVoorDagTeller`). Acceptabel.

**3. Type consistency:**
- `Modus` import uit `lib/onboarding/voltooiingen` overal consistent ✓
- `dagVoorModusEnNummer(modus, n): Dag | null` signature consistent gebruikt in Task 1, 5 ✓
- `topbarLabelVoorModus(modus, dag, proStap?): string` consistent in Task 1, 3, 7, 8 ✓
- `voortgangPercentageVoorModus(modus, dag, proStap?): number` consistent in Task 1, 3 ✓
- `berekenHuidigeDag(voltooiingen, startdatum, { isTester, modus })` consistent (callers in AppShell + dashboard waren al modus-bewust gemaakt in eerdere ronde, behouden) ✓
- `startdatumVoorModus(profielDatums, modus): Date | null` consistent gebruikt in Task 7, 8 (komt uit bestaande `lib/playbook/dag-teller.ts`) ✓

Plan is intern consistent. Geen edits nodig.

---

## Volgende stap

Plan compleet en opgeslagen op `docs/superpowers/plans/2026-05-19-modus-bewust-foundation.md`.

Raoul heeft akkoord gegeven om door te bouwen via batch-uitvoering, dus we starten direct met **superpowers:executing-plans** (inline-execution met `npm run build` na elke taak en smoke-test op live aan het eind).

Geen content-schrijfwerk in 3a, dus geen stem-checkpoints nodig. Pure code-refactoring.
