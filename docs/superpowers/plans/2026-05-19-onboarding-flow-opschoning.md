# Onboarding-flow opschoning, fase 3b Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vier onboarding-flow-bugs (K1, K2, K3, B6) oplossen door modus-keuze en startdatum-zet atomair te maken in Stap4ModusKeuze, sessie-cache te verfrissen na opslag van tempo/DTT, en de impliciete Sprint-fallback in /onboarding te vervangen door redirect naar /welkom-keuze.

**Architecture:** Modus-kies-knoppen worden "dom" (zetten alleen `profiles.modus`). De atomaire opslag verhuist naar `Stap4ModusKeuze` waar in één DB-update modus + startdatum + tempo/DTT samen worden geschreven, gevolgd door `supabase.auth.refreshSession()`. `/onboarding` redirectet bij `modus=NULL` naar `/welkom-keuze`. `TempoSectie` en `CoreTempoSectie` krijgen ook een sessie-refresh. `ModusSwitchBanner` redirectet niet meer naar stap 4 bij "Oppakken", alleen bij "Opnieuw beginnen".

**Tech Stack:** Next.js 15 App Router · TypeScript · Supabase (PostgreSQL + RLS) · `npm run build` als verificatie (geen test-framework). Pilot-context: main-branch, geen feature-branch. Smoke-test op live aan het eind.

**Spec:** [docs/superpowers/specs/2026-05-19-onboarding-flow-opschoning-design.md](../specs/2026-05-19-onboarding-flow-opschoning-design.md)

---

## File-overzicht

**Geen nieuwe bestanden.** Geen DB-migratie.

**Te wijzigen bestanden:**

| Bestand | Wijziging |
|---|---|
| `app/welkom-keuze/modus-kies-knoppen.tsx` | Verwijder startdatum-zet-logica (regels 47-67 van huidige code). Alleen `profiles.modus` updaten. |
| `app/instellingen/modus-test/modus-switch-knoppen.tsx` | Idem: alleen modus updaten, geen startdatum meer zetten. |
| `components/onboarding/Stap4ModusKeuze.tsx` | Atomaire opslag in beide takken (CoreBlock.naDTT + SprintTempoBlock.opslaan): profiles update (modus + startdatum als NULL) + bestaande auth.updateUser + sessie-refresh. |
| `app/onboarding/page.tsx` | In `laadGegevens()` bij `modus=NULL` redirect naar `/welkom-keuze` ipv stille fallback naar "sprint". |
| `components/instellingen/TempoSectie.tsx` | Sessie-refresh na `auth.updateUser`. |
| `components/instellingen/CoreTempoSectie.tsx` | Sessie-refresh na `fetch /api/dtt/update`. Voeg Supabase client-import toe. |
| `components/vandaag/ModusSwitchBanner.tsx` | `kies()` handler: alleen redirect bij "opnieuw", bij "oppakken" simpele `router.refresh()`. |

---

### Task 1: Modus-kies-knoppen "dom" maken

**Files:**
- Modify: `app/welkom-keuze/modus-kies-knoppen.tsx`

- [ ] **Step 1: Vervang de `kies()` functie**

Bestand: `app/welkom-keuze/modus-kies-knoppen.tsx`

Vervang de hele `async function kies(modus: Modus)` (regels 41-83 van de huidige code) door:

```typescript
  async function kies(modus: Modus) {
    if (bezig) return;
    setBezig(modus);
    try {
      const supabase = createClient();
      // Per 2026-05-19 (fase 3b): zetten van sprint_startdatum/core_startdatum
      // is verhuisd naar Stap4ModusKeuze, waar het atomair samen met
      // tempo/DTT-opslag gebeurt. Hier alleen de modus zelf.
      const { error } = await supabase
        .from("profiles")
        .update({ modus })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Route gekozen, één moment...");
      const redirectMap: Record<Modus, string> = {
        sprint: "/onboarding",
        core: "/onboarding",
        pro: "/welkom-pro",
      };
      router.push(redirectMap[modus]);
      router.refresh();
    } catch (err) {
      console.warn("Modus opslaan mislukt:", err);
      toast.error("Opslaan mislukte, probeer 't opnieuw");
      setBezig(null);
    }
  }
```

De startdatum-fetch + conditional-zet-logica is helemaal weg.

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt. Modus-kies-knoppen schrijft alleen `profiles.modus`.

- [ ] **Step 3: Commit**

```bash
git add app/welkom-keuze/modus-kies-knoppen.tsx
git commit -m "refactor(welkom-keuze): modus-kies-knoppen alleen modus zetten

Startdatum-zet-logica verhuisd naar Stap4ModusKeuze (Task 3), waar
het atomair samen met tempo/DTT wordt opgeslagen. Voorkomt de
tussenstaat waarin sprint_startdatum/core_startdatum al gezet is
maar tempo/DTT nog ontbreekt (oorzaak van K1 banner-bug)."
```

---

### Task 2: Modus-switch-knoppen "dom" maken

**Files:**
- Modify: `app/instellingen/modus-test/modus-switch-knoppen.tsx`

- [ ] **Step 1: Vervang de `switchNaar()` functie**

Bestand: `app/instellingen/modus-test/modus-switch-knoppen.tsx`

Vervang de hele `async function switchNaar()` (de versie die nu de startdatum zet) door:

```typescript
  async function switchNaar(
    nieuweModus: ModusKeuze,
    redirectPad: string,
    label: string,
  ) {
    if (bezig) return;
    setBezig(label);
    try {
      const supabase = createClient();
      // Per 2026-05-19 (fase 3b): startdatum wordt niet meer hier gezet.
      // Stap4ModusKeuze doet dat atomair samen met tempo/DTT-opslag.
      // Founder die naar /vandaag gaat zonder tempo/DTT ziet correct
      // de "vul in"-banner.
      const { error } = await supabase
        .from("profiles")
        .update({ modus: nieuweModus })
        .eq("id", userId);
      if (error) throw error;
      toast.success(`Modus aangepast naar: ${label}`);
      router.push(redirectPad);
      router.refresh();
    } catch (err) {
      console.warn("Modus switchen mislukt:", err);
      toast.error("Switchen mislukt, probeer 't opnieuw");
      setBezig(null);
    }
  }
```

De huidige startdatum-fetch + conditional-zet is helemaal weg.

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add app/instellingen/modus-test/modus-switch-knoppen.tsx
git commit -m "refactor(modus-test): switch-knoppen alleen modus zetten

Idem als Task 1 voor welkom-keuze: startdatum-zet weg, gebeurt
atomair in Stap4ModusKeuze. Voorkomt 'welkom terug'-banner bij
founders die nog geen tempo/DTT hebben in de nieuwe modus."
```

---

### Task 3: Stap4ModusKeuze atomair Sprint-tak

**Files:**
- Modify: `components/onboarding/Stap4ModusKeuze.tsx` (SprintTempoBlock)

- [ ] **Step 1: Vervang de `opslaan()` functie in SprintTempoBlock**

Bestand: `components/onboarding/Stap4ModusKeuze.tsx`

Zoek `async function opslaan()` binnen `function SprintTempoBlock` (rond regel 153 van de huidige code). Vervang door:

```typescript
  async function opslaan() {
    if (!commitmentUren) return;
    setBezig(true);
    if (!isPreview) {
      const dd = berekenDagdoelen(commitmentUren);
      const today = new Date().toISOString().slice(0, 10);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Atomaire profile-update: modus + sprint_startdatum, alleen als
        // ze nog NULL zijn. Lost K1 op (startdatum komt nu pas wanneer
        // tempo daadwerkelijk is gekozen).
        const { data: prof } = await supabase
          .from("profiles")
          .select("modus, sprint_startdatum")
          .eq("id", user.id)
          .maybeSingle();
        const profielUpdates: Record<string, unknown> = {};
        if (!(prof as { modus?: string | null } | null)?.modus) {
          profielUpdates.modus = "sprint";
        }
        if (
          !(prof as { sprint_startdatum?: string | null } | null)
            ?.sprint_startdatum
        ) {
          profielUpdates.sprint_startdatum = today;
        }
        if (Object.keys(profielUpdates).length > 0) {
          await supabase
            .from("profiles")
            .update(profielUpdates)
            .eq("id", user.id);
        }

        // Tempo + dagdoelen in user_metadata.
        await supabase.auth.updateUser({
          data: {
            onboarding_stap: 99,
            commitment_uren: commitmentUren,
            dagdoel_contacten: dd.contacten,
            dagdoel_uitnodigingen: dd.uitnodigingen,
            dagdoel_followups: dd.followups,
          },
        });

        // Cross-modus markering.
        await fetch("/api/onboarding/markeer-voltooid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: "modus-keuze-tempo", modus: "sprint" }),
        }).catch(() => {});

        // Sessie-refresh: voorkomt K3 (banner blijft staan na opslag
        // doordat de JWT user_metadata-cache de nieuwe commitment_uren
        // nog niet kende).
        await supabase.auth.refreshSession();
      }
    }
    setBezig(false);
    router.push("/vandaag?via=onboarding");
    router.refresh();
  }
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add components/onboarding/Stap4ModusKeuze.tsx
git commit -m "feat(stap4-sprint): atomaire opslag + sessie-refresh

Sprint-tak van Stap4ModusKeuze schrijft nu modus + sprint_startdatum
+ commitment_uren + cross-modus markering in één flow, gevolgd door
supabase.auth.refreshSession(). Lost K1 (welkom-terug-banner bij
eerste keuze) en K3 (banner blijft na opslag) op."
```

---

### Task 4: Stap4ModusKeuze atomair Core-tak

**Files:**
- Modify: `components/onboarding/Stap4ModusKeuze.tsx` (CoreBlock)

- [ ] **Step 1: Vervang de `naDTT()` functie in CoreBlock**

Bestand: `components/onboarding/Stap4ModusKeuze.tsx`

Zoek `async function naDTT()` binnen `function CoreBlock` (rond regel 75 van de huidige code). Vervang door:

```typescript
  async function naDTT() {
    setVoltooid(true);
    if (!isPreview) {
      const today = new Date().toISOString().slice(0, 10);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Atomaire profile-update: modus + core_startdatum, alleen als
        // ze nog NULL zijn. core_dtt is hierboven al door
        // DTTOnboardingEmbed in de profile gezet.
        const { data: prof } = await supabase
          .from("profiles")
          .select("modus, core_startdatum")
          .eq("id", user.id)
          .maybeSingle();
        const profielUpdates: Record<string, unknown> = {};
        if (!(prof as { modus?: string | null } | null)?.modus) {
          profielUpdates.modus = "core";
        }
        if (
          !(prof as { core_startdatum?: string | null } | null)
            ?.core_startdatum
        ) {
          profielUpdates.core_startdatum = today;
        }
        if (Object.keys(profielUpdates).length > 0) {
          await supabase
            .from("profiles")
            .update(profielUpdates)
            .eq("id", user.id);
        }

        await supabase.auth.updateUser({ data: { onboarding_stap: 99 } });

        await fetch("/api/onboarding/markeer-voltooid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: "modus-keuze-dtt", modus: "core" }),
        }).catch(() => {});

        // Sessie-refresh: voorkomt K3.
        await supabase.auth.refreshSession();
      }
    }
  }
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add components/onboarding/Stap4ModusKeuze.tsx
git commit -m "feat(stap4-core): atomaire opslag + sessie-refresh

Core-tak (naDTT) schrijft nu modus + core_startdatum naast de
DTT-opslag die DTTOnboardingEmbed doet, plus sessie-refresh. Lost
K1 op voor Core-flow."
```

---

### Task 5: /onboarding redirect bij modus=NULL

**Files:**
- Modify: `app/onboarding/page.tsx`

- [ ] **Step 1: Vervang de modus-bepaling in `laadGegevens()`**

Bestand: `app/onboarding/page.tsx`

Zoek in `laadGegevens()` (rond regel 108) de regels:

```typescript
      const m = profData.modus === "core" ? "core" : "sprint";
      setModus(m);
      setDttAlIngevuld(!!profData.core_dtt);
```

Vervang door:

```typescript
      // Per 2026-05-19 (fase 3b): geen impliciete Sprint-fallback meer.
      // Gebruikers zonder modus moeten eerst expliciet kiezen via
      // /welkom-keuze. Anders glipt iemand impliciet de Sprint-flow in
      // (K2).
      if (!profData.modus) {
        router.push("/welkom-keuze");
        return;
      }
      const m = profData.modus === "core" ? "core" : "sprint";
      setModus(m);
      setDttAlIngevuld(!!profData.core_dtt);
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/page.tsx
git commit -m "fix(onboarding): redirect bij modus=NULL naar /welkom-keuze

Voorheen viel de modus-state stilletjes terug op 'sprint' als
profile.modus = NULL was, waardoor gebruikers impliciet in Sprint
belandden zonder ooit /welkom-keuze te zien. Lost K2 op."
```

---

### Task 6: TempoSectie sessie-refresh

**Files:**
- Modify: `components/instellingen/TempoSectie.tsx`

- [ ] **Step 1: Voeg `refreshSession()` toe na `auth.updateUser`**

Bestand: `components/instellingen/TempoSectie.tsx`

Zoek in `async function kies()` (rond regel 49) het blok:

```typescript
      const { error } = await supabase.auth.updateUser({
        data: {
          commitment_uren: uren,
          dagdoel_contacten: dd.contacten,
          dagdoel_uitnodigingen: dd.uitnodigingen,
          dagdoel_followups: dd.followups,
        },
      });
      if (error) {
        toast.error(`Opslaan mislukt: ${error.message}`);
        return;
      }
      toast.success(
        `✓ Tempo ingesteld op ${tempoNaam(uren)} (± ${uren} uur per dag)`,
      );
      router.refresh();
```

Vervang door:

```typescript
      const { error } = await supabase.auth.updateUser({
        data: {
          commitment_uren: uren,
          dagdoel_contacten: dd.contacten,
          dagdoel_uitnodigingen: dd.uitnodigingen,
          dagdoel_followups: dd.followups,
        },
      });
      if (error) {
        toast.error(`Opslaan mislukt: ${error.message}`);
        return;
      }
      // Sessie verfrissen zodat de volgende page-render meteen de
      // nieuwe commitment_uren leest (lost K3 op).
      await supabase.auth.refreshSession();
      toast.success(
        `✓ Tempo ingesteld op ${tempoNaam(uren)} (± ${uren} uur per dag)`,
      );
      router.refresh();
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add components/instellingen/TempoSectie.tsx
git commit -m "fix(tempo-sectie): sessie-refresh na opslag

Lost K3 op voor de Instellingen-route: wie z'n tempo wijzigt via
/instellingen en daarna naar /vandaag navigeert, ziet meteen de
nieuwe staat in de banner-check."
```

---

### Task 7: CoreTempoSectie sessie-refresh

**Files:**
- Modify: `components/instellingen/CoreTempoSectie.tsx`

- [ ] **Step 1: Voeg Supabase client-import + `refreshSession()` toe**

Bestand: `components/instellingen/CoreTempoSectie.tsx`

Voeg bovenaan de imports toe (na de bestaande imports):

```typescript
import { createClient } from "@/lib/supabase/client";
```

Zoek de functie `async function opslaan()` (rond regel 36). Vervang door:

```typescript
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
      // Sessie verfrissen voor consistente banner-check op /vandaag (K3).
      // core_dtt zit in profiles, niet in JWT, maar refreshSession()
      // forceert ook een server-component-rerender van pages die het
      // profile opnieuw uitlezen.
      const supabase = createClient();
      await supabase.auth.refreshSession();
      toast.success("Tempo bijgewerkt");
      router.refresh();
    } else {
      toast.error("Opslaan mislukt");
    }
    setBezig(false);
  }
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add components/instellingen/CoreTempoSectie.tsx
git commit -m "fix(core-tempo-sectie): sessie-refresh na DTT-update

Idem als TempoSectie: na opslag wordt de sessie verfrist zodat
de volgende /vandaag-render de banner correct verbergt."
```

---

### Task 8: ModusSwitchBanner oppakken-flow

**Files:**
- Modify: `components/vandaag/ModusSwitchBanner.tsx`

- [ ] **Step 1: Vervang de `kies()` handler**

Bestand: `components/vandaag/ModusSwitchBanner.tsx`

Zoek `async function kies(keuze: "opnieuw" | "oppakken")`. Vervang door:

```typescript
  async function kies(keuze: "opnieuw" | "oppakken") {
    await fetch("/api/modus/her-activatie-keuze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modus, keuze }),
    });
    if (keuze === "opnieuw") {
      // Startdatum is gereset door de API. Tempo/DTT moet opnieuw,
      // dus naar /onboarding stap 4.
      router.push("/onboarding?stap=4");
      router.refresh();
      return;
    }
    // Oppakken: alles staat al klaar, simpele refresh zodat de
    // banner verdwijnt. Lost B6 op (geen onnodige redirect meer).
    router.refresh();
  }
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build slaagt.

- [ ] **Step 3: Commit**

```bash
git add components/vandaag/ModusSwitchBanner.tsx
git commit -m "fix(modus-switch-banner): oppakken-knop geen omweg meer

Voorheen redirectete zowel 'opnieuw' als 'oppakken' naar
/onboarding stap 4. Voor 'oppakken' is dat onnodig: alles bestaat
al, alleen refresh nodig om banner-staat te updaten. Voor 'opnieuw'
blijft de redirect naar stap 4 want startdatum is door API gereset
en tempo/DTT moet opnieuw. Lost B6 op."
```

---

### Task 9: Smoke-test op live + rapport

**Files:**
- Modify: `C:\Users\raoul\.claude\projects\c--Users-raoul-OneDrive-Bureaublad-CLAUDE-60-day-run-change-masters\memory\MEMORY.md`
- Create: `C:\Users\raoul\.claude\projects\c--Users-raoul-OneDrive-Bureaublad-CLAUDE-60-day-run-change-masters\memory\onboarding-flow-opschoning.md`

- [ ] **Step 1: Push naar main, wacht op Vercel-deploy**

```bash
git push
```

Wacht ~60 seconden tot Vercel-deploy live is.

- [ ] **Step 2: Smoke-test K1 (welkom-terug bij eerste keuze)**

Op een vers testaccount (modus=NULL):

1. Login op testaccount, ga naar `/welkom-keuze`.
2. Klik **Core** → redirect naar `/onboarding`.
3. Stap 1 (welkom), stap 2 (WHY), stap 3 (5 namen) doorlopen of skippen.
4. Stap 4 (DTT-form) verschijnt, **vul DTT in**.
5. Redirect naar `/vandaag`.

Verwacht resultaat: **GEEN "Welkom terug bij Core"-banner**. Dag-teller toont Core dag 1.

- [ ] **Step 3: Smoke-test K2 (impliciete Sprint-keuze)**

Op een tweede vers testaccount (modus=NULL):

1. Login op testaccount.
2. Type direct in URL-balk: `/onboarding` (sla `/welkom-keuze` over).
3. Pagina redirectet naar `/welkom-keuze`.

Verwacht resultaat: gebruiker **kan niet meer impliciet in Sprint belanden** via deeplink.

- [ ] **Step 4: Smoke-test K3 (banner blijft na opslag)**

Op founder-account in Sprint:

1. Ga naar `/instellingen`.
2. Open TempoSectie, kies een ander tempo dan huidig.
3. Klik opslaan, wacht op toast.
4. Direct daarna naar `/vandaag` navigeren.

Verwacht resultaat: **GEEN "vul tempo in"-banner** (was er nog niet, maar test bevestigt dat sessie-refresh werkt en de check correct uitvalt).

- [ ] **Step 5: Smoke-test B6 (oppakken-knop)**

Op founder-account:

1. Via `/instellingen/modus-test` switch naar Sprint (terwijl je eerder in Sprint zat).
2. Op `/vandaag` verschijnt banner "Welkom terug bij Sprint" (omdat sprint_startdatum bestaat en commitment_uren ook).

Wacht, met fase 3b verandert die test: na 3b is sprint_startdatum NIET meer gezet door modus-switch-knoppen. Dus banner zou niet moeten verschijnen voor een founder die via modus-test switcht NA fase 3b is gedeployed.

Aangepaste test voor B6:

1. Reset testaccount via `/instellingen/modus-test` → "Reset naar nieuwe gebruiker" (modus=NULL).
2. Ga naar `/welkom-keuze` → kies Sprint → /onboarding → vul tempo in.
3. Switch via modus-test naar Core → /vandaag (banner verschijnt "vul DTT in", correct).
4. Switch terug naar Sprint via modus-test → /vandaag (Sprint dag 1, GEEN banner want sprint_startdatum + commitment_uren bestaan al).
5. Reset, kies Sprint opnieuw, vul tempo in, ga via modus-test naar Core, vul DTT in via Stap4. Ga terug naar Sprint via modus-test → /vandaag (geen banner). Switch naar Core → /vandaag (geen banner).

Verwacht: in al deze gevallen verdwijnt banner correct of verschijnt 'ie alleen waar 'ie hoort.

- [ ] **Step 6: Memory-pointer schrijven**

Bestand: `C:\Users\raoul\.claude\projects\c--Users-raoul-OneDrive-Bureaublad-CLAUDE-60-day-run-change-masters\memory\onboarding-flow-opschoning.md`

```markdown
---
name: onboarding-flow-opschoning
description: Fase 3b live 2026-05-19. Modus-keuze + startdatum atomair, sessie-refresh na tempo/DTT-opslag, /onboarding redirect bij modus=NULL. K1+K2+K3+B6 opgelost.
metadata:
  type: project
---

Live op 2026-05-19 (na fase 3a dezelfde dag).

**Wortel-fix**: modus-keuze en startdatum zaten op verschillende momenten. Modus-kies-knoppen (op /welkom-keuze en /instellingen/modus-test) zetten voortaan alleen `profiles.modus`. De startdatum wordt atomair in Stap4ModusKeuze gezet, tegelijk met tempo (Sprint) of DTT (Core).

**Vier bugs opgelost**:
- K1: Banner "Welkom terug" bij allereerste modus-keuze (door atomaire opslag).
- K2: Nieuwe gebruiker impliciet in Sprint (door redirect bij modus=NULL).
- K3: Banner blijft na opslag (door `supabase.auth.refreshSession()`).
- B6: Oppakken-knop onnodige redirect (door simpele `router.refresh()`).

**Bestanden gewijzigd**:
- `app/welkom-keuze/modus-kies-knoppen.tsx` (alleen modus zetten)
- `app/instellingen/modus-test/modus-switch-knoppen.tsx` (alleen modus zetten)
- `components/onboarding/Stap4ModusKeuze.tsx` (atomaire opslag + refresh)
- `app/onboarding/page.tsx` (redirect bij modus=NULL)
- `components/instellingen/TempoSectie.tsx` (refresh na opslag)
- `components/instellingen/CoreTempoSectie.tsx` (refresh na opslag)
- `components/vandaag/ModusSwitchBanner.tsx` (oppakken-flow strakker)

Geen DB-migratie. Geen nieuwe componenten.

Volgende: fase 3c (cross-modus skip versterking: B1, B2, B3, B5, B7).

Gerelateerd: [[onboarding-redesign-fase-2]] · [[modus-bewust-foundation]] · [[eleva-feature-status]]
```

Bewerk `MEMORY.md`, voeg pointer toe:

```markdown
- [Onboarding-flow opschoning](onboarding-flow-opschoning.md) — fase 3b live 2026-05-19. K1+K2+K3+B6 opgelost via atomaire opslag + sessie-refresh + modus=NULL redirect.
```

- [ ] **Step 7: Finale commit**

```bash
git add -A
git commit -m "docs(memory): fase 3b onboarding-flow opschoning live

Smoke-test bevestigt K1+K2+K3+B6 opgelost:
- Geen 'welkom terug'-banner bij eerste modus-keuze
- Nieuwe gebruiker kan niet meer impliciet Sprint kiezen
- Tempo/DTT-opslag triggert sessie-refresh, banner verdwijnt direct
- Oppakken-knop blijft op /vandaag, geen omweg meer

Memory bijgewerkt voor cross-sessie context."
git push
```

- [ ] **Step 8: Rapporteer aan Raoul**

Schrijf in het chatvenster:

```
Fase 3b onboarding-flow opschoning staat live.

✅ K1: 'Welkom terug'-banner verschijnt niet meer bij eerste keuze
✅ K2: nieuwe gebruiker wordt niet meer impliciet Sprint
✅ K3: tempo/DTT-opslag laat de banner direct verdwijnen
✅ B6: oppakken-knop blijft op /vandaag, geen onnodige omweg

Foundation (3a) + flow (3b) zijn nu af. Volgende: 3c (cross-modus
skip versterking, B1-B5-B7), dan Sprint-puntjes uit parkeerlijst,
dan Core-content samen.
```

---

## Self-review

**1. Spec coverage:**

- §3.1 Modus-kies-knoppen "dom" → Task 1 (welkom-keuze) + Task 2 (modus-test) ✓
- §3.2 Atomaire opslag in Stap4ModusKeuze → Task 3 (Sprint) + Task 4 (Core) ✓
- §3.3 /onboarding redirect bij modus=NULL → Task 5 ✓
- §3.4 Sessie-refresh in TempoSectie en CoreTempoSectie → Task 6 + Task 7 ✓
- §3.5 Banner oppakken-flow strakker → Task 8 ✓
- §6 Smoke-test → Task 9 ✓

Alle 4 bugs (K1, K2, K3, B6) gedekt. Geen gaten.

**2. Placeholder scan:** Geen TBD/TODO/"implement later". Wel: Task 9 step 5 bevat een herhaalde "Aangepaste test voor B6" omdat de oorspronkelijke testopzet na fase 3b verandert. Dat is een terechte uitleg, geen placeholder.

**3. Type consistency:**
- `Modus` type uit `lib/onboarding/voltooiingen` consistent gebruikt ✓
- `profielUpdates: Record<string, unknown>` consistent in Task 3 en Task 4 ✓
- `await supabase.auth.refreshSession()` consistent in Task 3, 4, 6, 7 ✓
- `router.push("/onboarding?stap=4")` voor "opnieuw" en `router.refresh()` voor "oppakken" consistent in Task 8 ✓

Plan is intern consistent. Geen edits nodig.

---

## Volgende stap

Plan compleet en opgeslagen op `docs/superpowers/plans/2026-05-19-onboarding-flow-opschoning.md`.

Raoul heeft akkoord voor batch-uitvoering. Direct door naar **superpowers:executing-plans** met `npm run build` na elke taak en smoke-test in Task 9.
