# Onboarding-flow opschoning, fase 3b

**Datum:** 2026-05-19
**Status:** Spec, klaar voor review door Raoul
**Voorganger:** Modus-bewust foundation fase 3a (live op 2026-05-19, zie `2026-05-19-modus-bewust-foundation-design.md`)
**Vervolg:** Fase 3c (cross-modus skip versterking) komt apart na 3b.

---

## Korte uitleg

Fase 3a heeft de foundation modus-bewust gemaakt: Topbar, dashboard, statistieken, team en de dag-teller weten welke modus de gebruiker heeft. Maar de **onboarding-flow** zelf bevat nog vier bugs die met elkaar samenhangen:

1. Bij het kiezen van Sprint of Core wordt de startdatum direct gezet, vóór de gebruiker een tempo of DTT heeft ingevuld. Dat leidt tot een tussenstaat waarin de banner ten onrechte "Welkom terug" zegt bij iemand die hier nog nooit was.
2. Een gebruiker zonder modus (NULL) die op `/onboarding` belandt, krijgt automatisch Sprint via een code-fallback. Hij heeft nooit bewust gekozen.
3. Na het opslaan van een tempo blijft de "vul je tempo in"-banner nog even staan omdat de browser-sessie de nieuwe informatie nog niet kent.
4. De "Oppakken waar je was"-knop in de banner stuurt de gebruiker naar de tempo-pagina, ook als die tempo al bestaat.

Wortel van alle vier: **modus-keuze en startdatum-zet zitten op verschillende momenten**. Door ze atomair te maken (allebei pas opslaan bij stap 4) en met één session-refresh, vallen de tussenstaten weg.

---

## 1. Wat valt binnen scope

Bugs uit het code-review van 2026-05-19 die deze fase oplost:

- **K1** Banner "Welkom terug bij Sprint/Core" bij allereerste modus-keuze
- **K2** Nieuwe Sprint-gebruiker kiest impliciet Sprint zonder /welkom-keuze
- **K3** Banner blijft staan na tempo-opslag (JWT cache-lag)
- **B6** Oppakken-knop redirectet onnodig naar /onboarding stap 4

Bugs die in 3c komen: B1, B2, B3, B5, B7.
Opruim-items O1-O8 komen in afsluitende cleanup-ronde.
Sprint-content-rafels uit parkeerlijst-mei-2026 komen na 3c, vóór de Core-content-ronde.

---

## 2. Doelervaring per scenario

| Scenario | Gewenste flow |
|---|---|
| Nieuwe gebruiker meldt zich aan | /registreer → /welkom-keuze (kiezen) → /onboarding (4 stappen) → /vandaag |
| Bestaande gebruiker met modus=NULL belandt op /onboarding | Direct redirect naar /welkom-keuze (geen impliciete Sprint-keuze) |
| Iemand kiest Sprint op /welkom-keuze | Alleen `profiles.modus = "sprint"` wordt gezet. Geen startdatum nog. Redirect naar /onboarding. |
| Iemand vult op stap 4 z'n tempo of DTT in | Atomair: modus (als NULL) + startdatum + tempo/DTT + session-refresh. Redirect naar /vandaag. |
| Iemand komt na opslag tempo op /vandaag | Banner verschijnt NIET (sessie is verfrist, commitment_uren is bekend). |
| Iemand had eerder al een modus, klikt "Oppakken" in banner | Direct door naar /vandaag (geen omweg via /onboarding) |
| Iemand had eerder al een modus, klikt "Opnieuw beginnen" in banner | Naar /onboarding?stap=4 om tempo/DTT opnieuw in te vullen |
| Founder switcht via /instellingen/modus-test naar nieuwe modus | Alleen modus wordt gezet. Geen startdatum. Op /vandaag verschijnt banner "vul je tempo/DTT in". |

---

## 3. Architectuur

### 3.1 Modus-kies-knoppen worden "dom"

**Aanpassing 1:** `app/welkom-keuze/modus-kies-knoppen.tsx` — bij klik op Sprint/Core/Pro alleen `profiles.modus` updaten. Verwijder de huidige logica die `sprint_startdatum`/`core_startdatum` zet.

```typescript
async function kies(modus: Modus) {
  if (bezig) return;
  setBezig(modus);
  try {
    const supabase = createClient();
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

**Aanpassing 2:** `app/instellingen/modus-test/modus-switch-knoppen.tsx` — idem. Founder/tester die switcht via modus-test zet alleen `profiles.modus`. Op `/vandaag` verschijnt dan correct de banner als tempo/DTT nog ontbreekt voor die modus.

### 3.2 Atomaire opslag in Stap4ModusKeuze

**Aanpassing:** `components/onboarding/Stap4ModusKeuze.tsx` slaat in één DB-update op:
- `profiles.modus` (als nog NULL)
- `profiles.sprint_startdatum` (Sprint-tak) of `profiles.core_startdatum` (Core-tak), als nog NULL
- `profiles.core_dtt` (Core-tak) via bestaande `DTTOnboardingEmbed`
- `user_metadata.commitment_uren` (Sprint-tak) + afgeleide dagdoelen, via bestaande `auth.updateUser`
- Cross-modus markering via `/api/onboarding/markeer-voltooid` (`modus-keuze-tempo` of `modus-keuze-dtt`)

Direct na alle updates: `await supabase.auth.refreshSession()`. Daarna `router.push("/vandaag?via=onboarding")`.

**Sprint-tak (SprintTempoBlock):**

```typescript
async function opslaan() {
  if (!commitmentUren) return;
  setBezig(true);
  if (!isPreview) {
    const dd = berekenDagdoelen(commitmentUren);
    const today = new Date().toISOString().slice(0, 10);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Profile-update: modus + sprint_startdatum als nog leeg
      const { data: prof } = await supabase
        .from("profiles")
        .select("modus, sprint_startdatum")
        .eq("id", user.id)
        .maybeSingle();
      const profielUpdates: Record<string, unknown> = {};
      if (!(prof as { modus?: string | null } | null)?.modus) {
        profielUpdates.modus = "sprint";
      }
      if (!(prof as { sprint_startdatum?: string | null } | null)?.sprint_startdatum) {
        profielUpdates.sprint_startdatum = today;
      }
      if (Object.keys(profielUpdates).length > 0) {
        await supabase.from("profiles").update(profielUpdates).eq("id", user.id);
      }
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
      await supabase.auth.refreshSession();
    }
  }
  setBezig(false);
  router.push("/vandaag?via=onboarding");
  router.refresh();
}
```

**Core-tak (CoreBlock + DTTOnboardingEmbed):** in de `naDTT()` callback van CoreBlock dezelfde flow:
- Profile-update: modus = "core" (als NULL), core_startdatum = today (als NULL). `core_dtt` is al door DTTOnboardingEmbed gezet.
- `auth.updateUser({ onboarding_stap: 99 })`
- Cross-modus markering "modus-keuze-dtt"
- `await supabase.auth.refreshSession()`

### 3.3 /onboarding redirect bij modus=NULL

**Aanpassing:** `app/onboarding/page.tsx` in `laadGegevens()`:

```typescript
// Als modus nog NULL is, terug naar de keuze-pagina. Voorheen viel
// code terug op "sprint" als default, waardoor gebruikers impliciet
// Sprint kozen zonder /welkom-keuze te zien.
if (!profData.modus) {
  router.push("/welkom-keuze");
  return;
}

const m = profData.modus === "core" ? "core" : "sprint";
setModus(m);
```

De default "sprint"-fallback verdwijnt. Alleen gebruikers met expliciete `modus=sprint` of `modus=core` gaan door.

### 3.4 Session-refresh ook in TempoSectie en CoreTempoSectie

**Aanpassing 1:** `components/instellingen/TempoSectie.tsx` — direct na `auth.updateUser` toevoegen:

```typescript
await supabase.auth.refreshSession();
```

**Aanpassing 2:** `components/instellingen/CoreTempoSectie.tsx` — na de DTT-update naar profiles:

```typescript
await supabase.auth.refreshSession();
```

Reden: een gebruiker die in `/instellingen` z'n tempo of DTT aanpast en daarna naar `/vandaag` navigeert, ziet anders de oude staat (banner blijft hangen).

### 3.5 Banner "Oppakken"-knop strakker

**Aanpassing:** `components/vandaag/ModusSwitchBanner.tsx` — in de `kies` handler onderscheid maken:

```typescript
async function kies(keuze: "opnieuw" | "oppakken") {
  await fetch("/api/modus/her-activatie-keuze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modus, keuze }),
  });
  if (keuze === "opnieuw") {
    // Tempo/DTT moet opnieuw worden ingevuld want startdatum is gereset.
    router.push("/onboarding?stap=4");
  } else {
    // Oppakken: alles staat al, gewoon refreshen zodat de banner verdwijnt.
    router.refresh();
  }
}
```

Belangrijke nuance: door de fix in 3.1 + 3.2 verschijnt de banner alleen nog als de modus eerder actief was MAAR het tempo/DTT om een of andere reden ontbreekt. In de praktijk gebeurt dat alleen na "Reset naar nieuwe gebruiker" + opnieuw kiezen. Bij "Oppakken" is de aanname: tempo/DTT bestaat al ergens (was eerder ingevuld). Dus simpele refresh is genoeg.

Voor "Opnieuw beginnen": startdatum wordt door de API gereset naar today, dus daar hoort wel een nieuwe tempo/DTT-keuze bij.

---

## 4. Wat NIET in 3b

| Bug | Komt in |
|---|---|
| B1 app-geinstalleerd + push-aan worden nooit gemarkeerd | 3c |
| B2 dag3-teams-admin + dag4-bestellinks missen cross-modus skip | 3c |
| B3 ITEM_SLUGS niet geïmporteerd | 3c |
| B5 taakNaarCrossModusSlug dubbel | 3c |
| B7 NamenForm markeert "5 namen" bij <5 | 3c |
| O1-O8 opruim-items | Afsluitende cleanup |

Plus: Sprint-content-rafels uit `parkeerlijst-mei-2026` (em-dashes, ChatGPT-isms, structurele Sprint-issues) komen na 3c en vóór de Core-content-ronde. Niet in 3b.

---

## 5. Bestanden die wijzigen

| Bestand | Wijziging |
|---|---|
| `app/welkom-keuze/modus-kies-knoppen.tsx` | Verwijder startdatum-zet, alleen modus updaten |
| `app/instellingen/modus-test/modus-switch-knoppen.tsx` | Idem, alleen modus updaten |
| `components/onboarding/Stap4ModusKeuze.tsx` | Atomaire opslag in Sprint- én Core-tak + session-refresh |
| `app/onboarding/page.tsx` | Bij modus=NULL redirect naar /welkom-keuze |
| `components/instellingen/TempoSectie.tsx` | Session-refresh na opslag |
| `components/instellingen/CoreTempoSectie.tsx` | Session-refresh na opslag |
| `components/vandaag/ModusSwitchBanner.tsx` | Oppakken-knop: alleen router.refresh, geen redirect |

Zeven bestanden. Geen DB-migratie. Geen nieuwe componenten.

---

## 6. Verificatie

Geen test-framework. Per taak `npm run build` voor TypeScript-check. Smoke-test op live aan het einde via Raoul's testaccount + founder-account:

- **Testaccount (nieuwe gebruiker)**: kies Sprint → /onboarding → loop pre-day-1 door → vul tempo in → /vandaag (geen banner).
- **Testaccount**: switch via /instellingen/modus-test naar Core → /vandaag toont banner "vul DTT in" (geen "welkom terug").
- **Testaccount**: vul DTT in → /vandaag (banner weg, geen cache-lag).
- **Founder**: switch tussen Sprint en Core via modus-test → banner verschijnt correct bij de modus die tempo/DTT mist.
- **Founder**: klik "Oppakken" → direct op /vandaag, geen omweg.

---

## 7. Risico's

- **Bestaande pilot-leden** hebben al `sprint_startdatum` + `commitment_uren` gezet. Voor hen verandert visueel niets. De fix raakt alleen nieuwe gebruikers en founders die switchen.
- **Race-condition bij snel klikken**: gebruiker klikt 2x op "Sla tempo op" voordat de eerste klaar is. Risico laag want de bestaande disabled-state op de knop blijft staan. Geen extra mitigatie nodig.
- **session.refreshSession() bij netwerk-fout**: faalt stil. Volgende request gebruikt nog oude JWT. Niet ideaal maar acceptabel voor pilot.

---

## 8. Volgende stap

Spec laten reviewen door Raoul. Daarna `superpowers:writing-plans` om implementatie-plan te maken (geschat 6-8 taken: modus-kies-knoppen schoonmaken, modus-switch-knoppen schoonmaken, Stap4ModusKeuze atomair maken, /onboarding redirect bij NULL, TempoSectie refresh, CoreTempoSectie refresh, ModusSwitchBanner oppakken-flow, smoke-test).
