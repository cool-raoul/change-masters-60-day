# Modus-bewust foundation, fase 3a

**Datum:** 2026-05-19
**Status:** Spec, klaar voor review door Raoul
**Voorganger:** Onboarding-redesign fase 2 (live op 2026-05-18, zie `2026-05-18-onboarding-redesign-fase-2-design.md`)
**Vervolgsub-fases:** 3b (onboarding-flow opschoning) + 3c (cross-modus skip versterking), beide later.

---

## Korte uitleg

ELEVA is oorspronkelijk gebouwd voor Sprint (60-dagen-run). Daarna zijn Core (40 dagen opstart + lifetime DMO) en Pro (14-stappen leerpad) erbij gekomen. De redesign-laag van fase 2 maakt Sprint en Core consistent op het niveau van pre-day-1 en admin-rail. Onder die laag zitten echter componenten die nog Sprint-only aannames bevatten:

- De bovenste balk (Topbar) zegt voor iedereen "Dag X van 60".
- Het dashboard toont Sprint-content ook aan Core-leden.
- Statistieken en team-pagina rekenen alles als Sprint dag 1-60.
- De dag-spring-functie voor founders synct niet alle modus-velden.
- Pro-gebruikers raken vast in een rare onboarding-redirect.

Resultaat: een Core-lid ziet op meerdere plekken Sprint-tekst, een Pro-lid komt op pagina's waar 'ie niet hoort, en founders kunnen niet betrouwbaar testen door tussen modi te springen.

**Fase 3a doel:** de fundament-laag van ELEVA modus-bewust maken. Elke pagina kijkt eerst naar de modus van de gebruiker en toont vervolgens de juiste content en taal. Daarna kunnen 3b (banner-logica) en 3c (cross-modus skip) schoon worden afgewerkt.

---

## 1. Wat valt binnen scope

Bugs uit het code-review van 2026-05-19 die deze sub-fase oplost:

- **K4** Topbar zegt "Dag X van 60" voor Core en Pro
- **K5** Dag-spring API niet consistent over modi
- **K6** Dashboard CTA-tile is Sprint-only
- **K7** `berekenHuidigeDag` is Sprint-only (zoekt taken in Sprint DAGEN)
- **B4** Pro-flow heeft geen WHY-pad in middleware
- **B8** Statistieken + Team-pagina hardcoded "Dag X van 60"

Bugs die in 3b komen (banner-logica, modus-keuze-volgorde): K1, K2, K3, B6.
Bugs die in 3c komen (cross-modus skip): B1, B2, B3, B5, B7.
Opruim-items O1-O8 komen in de afsluitende cleanup-ronde.

---

## 2. Doelervaring per modus

| Locatie | Sprint-gebruiker | Core-gebruiker | Pro-gebruiker |
|---|---|---|---|
| Topbar-cirkel | Dag {N} van 60 | Dag {N} opstart (1-40) of Lifetime dag {N} (41+) | Stap {N} van 14 |
| Dashboard CTA-tile | Sprint-dag-titel + Sprint-acties | Core-dag-titel + Core-acties | Redirect naar /welkom-pro |
| /vandaag | Sprint-content | Core-content | Redirect naar /welkom-pro |
| /statistieken | Sprint-stats (60) | Core-stats (40 opstart + lifetime) | Redirect naar /welkom-pro |
| /team | Sprint-team-view | Core-team-view | Redirect naar /welkom-pro |
| Dag-spring (founder/tester) | Updates sprint_startdatum + run_startdatum | Updates core_startdatum + run_startdatum | n.v.t. |
| Middleware bij onboarding_klaar=false | Naar /mijn-why (zoals nu) | Naar /mijn-why (zoals nu) | Naar /welkom-pro (nieuw) |

---

## 3. Architectuur

### 3.1 Centrale dag-helpers in `lib/playbook/`

**Nieuw bestand:** `lib/playbook/dagen-voor-modus.ts`

```typescript
import { type Modus } from "@/lib/onboarding/voltooiingen";
import { DAGEN } from "./dagen";
import { CORE_DAGEN, genereerVerankeringsDag, genereerLifetimeDag } from "./core-dagen";
import type { Dag } from "./types";

/** Geeft het juiste dag-object voor (modus, dagNummer). */
export function dagVoorModusEnNummer(
  modus: Modus,
  dagNummer: number,
): Dag | null {
  if (modus === "core") {
    if (dagNummer <= 21) return CORE_DAGEN.find((d) => d.nummer === dagNummer) ?? null;
    if (dagNummer <= 40) return genereerVerankeringsDag(dagNummer);
    return genereerLifetimeDag(dagNummer);
  }
  if (modus === "sprint") return DAGEN.find((d) => d.nummer === dagNummer) ?? null;
  return null; // Pro heeft geen dag-concept in deze pilot
}

/** Maximum zinvol dag-nummer voor de modus. */
export function maxDagVoorModus(modus: Modus): number {
  if (modus === "core") return 999; // lifetime gaat door
  if (modus === "sprint") return 60;
  return 0; // Pro doet niet mee in dag-flow
}

/** Geeft de fase-label voor de Topbar. */
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
  if (modus === "pro" && proStap) return `Stap ${proStap} van 14`;
  return `Dag ${dagNummer}`;
}

/** Voortgangs-percentage voor de Topbar-cirkel (0-100). */
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
  if (modus === "pro" && proStap) return Math.round((proStap / 14) * 100);
  return 0;
}
```

### 3.2 `berekenHuidigeDag` modus-bewust

**Aanpassing:** `lib/playbook/bereken-dag.ts` krijgt extra `modus`-parameter en gebruikt die om de juiste DAGEN-array te selecteren.

```typescript
export function berekenHuidigeDag(
  voltooiingen: Array<{ dag_nummer: number; taak_id: string }>,
  runStartdatum: string | null,
  options: { isTester?: boolean; modus?: Modus } = {},
): number {
  const { isTester = false, modus = "sprint" } = options;
  if (modus === "pro") return 0; // Pro heeft geen dag-flow
  if (isTester) return berekenKalenderdag(runStartdatum);

  // Voortgang-modus: eerste niet-voltooide dag in de juiste DAGEN-array.
  const dagenArray = modus === "core" ? CORE_DAGEN : DAGEN;
  // ... bestaande logica met dagenArray ipv hardcoded DAGEN
}
```

Alle callers (`AppShell`, `dashboard`, `vandaag`) geven hun `modus` mee.

### 3.3 Modus-bewuste Topbar

**Aanpassing:** `components/layout/Topbar.tsx` accepteert nieuwe props:

```typescript
type TopbarProps = {
  gebruikersnaam: string;
  fotoUrl: string | null;
  modus: Modus;
  huidigeDag: number;
  proStap?: number; // alleen voor modus=pro
};
```

Cirkel-tekst gebruikt `topbarLabelVoorModus(modus, huidigeDag, proStap)`.
Voortgang-balk gebruikt `voortgangPercentageVoorModus(...)`.
Dead code `const fase = dag <= 20 ? 1 : ...` wordt verwijderd.

**Aanpassing:** `components/layout/AppShell.tsx` leest `profile.modus` en geeft 'm door aan `<Topbar>`. Voor Pro wordt `proStap` afgeleid uit de `PRO_LEERPAD`-positie obv `run_startdatum`.

### 3.4 Dashboard CTA-tile modus-bewust

**Aanpassing:** `app/dashboard/page.tsx` vervangt de directe `DAGEN.find()` of `genereerWeekritmeDag()`-calls door `dagVoorModusEnNummer(modus, dag)`. De CTA-tile titel en acties komen daarmee uit de juiste array.

Voor `modus=pro`: dashboard rendert geen dag-CTA, redirect naar `/welkom-pro` (zoals het al doet, blijft).

### 3.5 /vandaag, /statistieken, /team Pro-redirect

**Aanpassing:** elke pagina krijgt direct na het lezen van `profile.modus` een check:

```typescript
if (profile.modus === "pro") redirect("/welkom-pro");
```

Voor Core op `/statistieken` en `/team`: gebruik `dagVoorModusEnNummer(modus="core", ...)` voor titels en tellers. Labels gaan via `topbarLabelVoorModus("core", ...)`.

### 3.6 Dag-spring API: alle drie startdatums updaten

**Aanpassing:** `app/api/tester/spring-naar-dag/route.ts`:

```typescript
const updates: Record<string, string> = {
  run_startdatum: isoDatum,         // legacy
  sprint_startdatum: isoDatum,       // altijd mee
  core_startdatum: isoDatum,         // altijd mee
};
```

Waarom alle drie tegelijk: een founder die in Sprint zit en naar dag 30 springt, moet bij switch naar Core óók op dag 30 staan (en niet ineens op een ander dag-nummer). Voor een gewone gebruiker is dit irrelevant want die springt niet. Voor founder/tester is dit precies wat ze willen.

### 3.7 Middleware Pro-pad

**Aanpassing:** `lib/supabase/middleware.ts` krijgt twee wijzigingen:

1. Whitelist (geen /mijn-why-redirect):
   - `/welkom-keuze`
   - `/welkom-pro` + `/welkom-pro/stap`
   - `/welkom-core` + `/welkom-core/stap`

2. Bij `onboarding_klaar=false` EN `modus=pro` redirectet middleware naar `/welkom-pro` ipv `/mijn-why`. Pro-leden doen in deze pilot geen WHY-gesprek.

```typescript
if (profile && !profile.onboarding_klaar) {
  if (profile.modus === "pro") {
    url.pathname = "/welkom-pro";
  } else {
    url.pathname = "/mijn-why";
  }
  return NextResponse.redirect(url);
}
```

---

## 4. Wat niet in 3a (per sub-fase later)

| Bug | Beschrijving | Komt in |
|---|---|---|
| K1 | Banner "Welkom terug" bij eerste keuze | 3b |
| K2 | Nieuwe Sprint-user kiest impliciet Sprint | 3b |
| K3 | Banner verschijnt na tempo opslaan (JWT cache) | 3b |
| B6 | Oppakken-knop redirect onnodig naar stap 4 | 3b |
| B1 | `app-geinstalleerd` + `push-aan` worden nooit geschreven | 3c |
| B2 | `dag3-teams-admin` + `dag4-bestellinks` missen cross-modus skip | 3c |
| B3 | `ITEM_SLUGS` constants niet geïmporteerd | 3c |
| B5 | `taakNaarCrossModusSlug` dubbel gedefinieerd | 3c |
| B7 | NamenForm markeert "5 namen" bij <5 | 3c |
| O1-O8 | Opruim-items | Afsluitende cleanup-ronde |

Pro-content (eigen dagen, eigen statistieken, cross-modus) is **buiten scope van fase 3 in totaal**. Wordt vanaf scratch later opgebouwd.

---

## 5. Bestanden die wijzigen

| Bestand | Wijziging |
|---|---|
| `lib/playbook/dagen-voor-modus.ts` | **Nieuw**: vier helpers (dagVoorModusEnNummer, maxDagVoorModus, topbarLabelVoorModus, voortgangPercentageVoorModus) |
| `lib/playbook/bereken-dag.ts` | `modus`-parameter toevoegen, juiste DAGEN-array selecteren |
| `components/layout/Topbar.tsx` | Props uitbreiden + label-logica via helpers, dead code weghalen |
| `components/layout/AppShell.tsx` | `modus` doorgeven aan Topbar, `proStap` berekenen indien Pro |
| `app/dashboard/page.tsx` | CTA-tile data via `dagVoorModusEnNummer(modus, dag)` |
| `app/vandaag/page.tsx` | Pro-redirect bovenaan |
| `app/statistieken/page.tsx` | Modus-bewust + Pro-redirect + label via helper |
| `app/team/page.tsx` | Modus-bewust + Pro-redirect + label via helper |
| `app/api/tester/spring-naar-dag/route.ts` | Update alle drie startdatum-velden |
| `lib/supabase/middleware.ts` | Whitelist + Pro-naar-/welkom-pro-redirect |

Geen DB-migratie nodig. Geen schema-wijzigingen. Alleen code-aanpassingen.

---

## 6. Founder-bewerkbaarheid

Geen nieuwe edit-modus-content in deze fase. Topbar-tekst gebruikt helpers met hardcoded strings (`"Dag N opstart"`, `"Lifetime dag N"`, etc.). Als Raoul later die labels wil bewerken, voegen we `EditableTekst` toe in een latere fase.

Reden: deze labels zijn structureel (modus-identificatie), niet inhoudelijk (kennis-overdracht). Onwaarschijnlijk dat ze veranderen.

---

## 7. Verificatie

Geen test-framework. Per taak `npm run build` voor TypeScript-check. Aan het einde een smoke-test op live met:

- **Sprint-founder-account**: Topbar zegt "Dag X van 60", dashboard CTA Sprint, /vandaag werkt.
- **Modus-test switch naar Core**: Topbar wordt "Dag X opstart" (1-40) of "Lifetime dag X" (41+), dashboard CTA Core, /vandaag werkt.
- **Modus-test switch naar Pro**: Topbar wordt "Stap X van 14", /vandaag + /statistieken + /team redirectten naar /welkom-pro.
- **Dag-spring** vanuit founder-balk naar dag 30 in Sprint, dan switch naar Core: ook op dag 30 in Core (alle startdatums geüpdatet).

---

## 8. Risico's

- **Bestaande pilot-leden** (Raoul, Gaby, Juan, Sandy, Jaimie) zijn allemaal in modus=sprint. Voor hen verandert er visueel niets (Topbar blijft "Dag X van 60", dashboard CTA blijft Sprint). 3a is voorbereiding op een schone Core/Pro-ervaring, niet een ingreep op de huidige Sprint-flow.
- **Pro-redirects** kunnen voor een handvol situaties anders uitkomen dan voorheen. We hebben momenteel geen actieve Pro-leden in de pilot, dus risico laag. Founder kan via /instellingen/modus-test snel naar Pro switchen om te testen.
- **Dag-spring update alle drie startdatums** betekent dat een founder die Sprint-test op dag 30 doet, daarna in Core OOK op dag 30 zit (en niet op de natuurlijke Core-startdatum). Voor founders is dat acceptabel en zelfs gewenst (consistent testen). Voor echte gebruikers irrelevant want die springen nooit.

---

## 9. Volgende stap

Spec laten reviewen door Raoul. Daarna `superpowers:writing-plans` om implementatie-plan te maken (geschat 8-10 taken: nieuwe helpers, Topbar, dashboard, vandaag, statistieken, team, dag-spring API, middleware, build-verificaties, smoke-test).
