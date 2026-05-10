# Design: Inline Founder Edit-Modus op Dagelijkse Flow

**Datum:** 2026-05-10
**Status:** Goedgekeurd na brainstorm — klaar voor implementatieplan
**Voor:** Sprint /vandaag (60 dagen) + Core /welkom-core/stap/N (21 stappen). Pro volgt later.

---

## 1. Doel

Founders (Raoul, Gaby) willen elke tekst die op `/vandaag` (Sprint) en `/welkom-core/stap/N` (Core) verschijnt **rechtstreeks daar kunnen bewerken**, zonder eerst naar een aparte CMS-pagina te navigeren. Members blijven dezelfde guided flow zien als nu — voor hen verandert er niets.

**Resultaat:**
- Founder loopt door als een member, ziet exact wat de member ziet
- Klikt linksboven op "✍️ Edit-modus AAN", en alle tekst-velden tonen ✍️-pencil-knoppen ernaast
- Wijzigt een zin, slaat op, is **direct live** voor alle members
- Springt naar elke andere dag (of stap) via paarse founder-toolbar zonder eigen voortgang aan te raken

---

## 2. Scope

### In-scope (deze design + implementatie)

| Pad | Pagina | Aantal items | Aantal editable velden |
|---|---|---|---|
| Sprint | `/vandaag` (= `vandaag-flow.tsx`) | 60 dagen | ~5 per dag content-velden + 28 gedeelde UI-strings |
| Core | `/welkom-core/stap/[nummer]` (= `StapDetail.tsx`) | 21 stappen | ~6 per stap content-velden + 8 gedeelde UI-strings |

### Out-of-scope (later)

- Pro `/welkom-pro/stap/[nummer]` — zelfde patroon hergebruiken in volgende rondje
- Mini-ELEVA prospect-chat / 3-weg-chat — andere context, niet deze spec
- Editable films of media-embeds (films staan al via `/instellingen/films`)
- Real-time collaboration (twee founders die tegelijk dezelfde tekst aanpassen) — last-write-wins is acceptabel

---

## 3. Architectuur

### 3.1 Data-flow

```
┌─ SERVER (Next.js Server Component) ──────────────────────────┐
│                                                              │
│  /vandaag/page.tsx (of /welkom-core/stap/[N]/page.tsx)       │
│                                                              │
│  1. Lees ?dag=N (founder) of bereken huidige dag (member)    │
│  2. Lees profile.role (is founder?)                          │
│  3. Query tekst_overrides voor:                              │
│       - per-dag/stap namespace (filtered op dag-N/stap-N)    │
│       - gedeelde UI namespace (alles)                        │
│       - groet-namespace (Sprint only, alleen relevante dag)  │
│  4. Pas overrides toe op DAGEN-data → dagDataMetOverrides    │
│  5. Bouw uiOverridesMap = Record<sleutel, waarde>            │
│  6. Geef door aan client component:                          │
│       - dagData (al overridden)                              │
│       - uiOverrides                                          │
│       - groetOverrides (Sprint only)                         │
│       - isFounder                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─ CLIENT (Next.js Client Component) ──────────────────────────┐
│                                                              │
│  vandaag-flow.tsx  /  StapDetail.tsx                         │
│                                                              │
│  - useState/localStorage: editModusAan                       │
│  - Render exact zoals nu, maar elk tekst-veld is             │
│    gewrapt in <EditableTekst>:                               │
│                                                              │
│       <EditableTekst                                         │
│         namespace="sprint-dag"                               │
│         sleutel={`dag${N}.titel`}                            │
│         standaard={dag.titel}                                │
│         overrides={{}} ← leeg, server heeft al overridden    │
│         isFounder={isFounder}                                │
│         editModusAan={editModusAan}                          │
│         as="h2"                                              │
│         className="..."                                       │
│       />                                                     │
│                                                              │
│  - Voor gedeelde UI-strings: idem maar met                   │
│    namespace="sprint-ui" + uiOverrides als overrides-prop    │
│                                                              │
│  - <EditModeToggle> bovenaan (alleen als isFounder)          │
│  - <FounderToolbar> bovenaan met dag/stap-spring             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Aanpassingen aan bestaande EditableTekst-component

```typescript
// components/cms/EditableTekst.tsx — bestaande props blijven, +1 erbij:

type Props = {
  namespace: string;
  sleutel: string;
  standaard: string;
  overrides: Record<string, string>;
  isFounder: boolean;
  editModusAan?: boolean;        // ← NIEUW (default true voor backwards-compat)
  as?: AsTag;
  className?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
};

// Pencil-knop alleen tonen als: isFounder && editModusAan
```

### 3.3 Storage — namespaces in `tekst_overrides`-tabel

| Namespace | Voor | Sleutel-patroon | Voorbeelden |
|---|---|---|---|
| `sprint-dag` | Per-dag content | `dag{N}.{veld}` of `dag{N}.taak.{taakId}.{subveld}` | `dag5.titel`, `dag5.watJeLeert`, `dag5.taak.upload-vcard.label`, `dag5.taak.edif.inlineActie.placeholder` |
| `sprint-ui` | Gedeelde UI-strings (alle 60 dagen) | flat sleutels | `intro.les-header`, `taak.button.skip`, `klaar.titel.alles-af` |
| `sprint-groet` | Speciale dag-groeten | `dag{N}` | `dag1`, `dag7`, `dag14` |
| `core-stap` | Per-stap content | `stap{N}.{veld}` of `stap{N}.taak.{taakId}.{subveld}` | `stap3.titel`, `stap3.taak.uitnodig-test.label` |
| `core-ui` | Gedeelde Core-UI | flat sleutels | `header.les`, `mentor-strip.tekst` |

**Bestaande namespaces blijven werken** zoals ze nu zijn (we breken niets — `playbook` of wat er nu in staat blijft naast deze nieuwe).

### 3.4 Bestaande infrastructuur die we hergebruiken

- `tekst_overrides`-tabel (al bestaand)
- `/api/tekst/override`-endpoint (al bestaand, POST + reset)
- `EditableTekst`-component (al bestaand, krijgt 1 nieuwe prop)
- `TesterToolbar`-component (al bestaand, breiden uit met dag-URL-navigatie)
- `haalOverrides` / `pasOverrideToe` helpers in `lib/playbook/overrides.ts` (al bestaand voor Sprint, evt. uitbreiden)

### 3.5 Nieuwe code

- `EditModeToggle.tsx` — kleine toggle-component bovenaan, alleen voor founder, met localStorage-persistentie
- Helper-functies om DAGEN-data en stap-data te overriden met sleutel-paden (uitbreiding van `pasOverrideToe`)
- Geen nieuwe DB-tabellen, geen nieuwe API-endpoints

---

## 4. Veld-catalogus

### 4.1 Sprint /vandaag — per-dag content (`sprint-dag`)

| Sleutel-patroon | Type | Bron in code | Voorkomt |
|---|---|---|---|
| `dag{N}.titel` | string (kort) | `dag.titel` | 60× |
| `dag{N}.watJeLeert` | string (multiline) | `dag.watJeLeert` | 60× |
| `dag{N}.faseDoel` | string (multiline) | `dag.faseDoel` | 60× |
| `dag{N}.taak.{taakId}.label` | string (kort) | `taak.label` | ~5/dag = 300× |
| `dag{N}.taak.{taakId}.uitleg` | string (multiline) | `taak.uitleg` | optioneel |
| `dag{N}.taak.{taakId}.inlineActie.label` | string | `taak.inlineActie.label` | optioneel |
| `dag{N}.taak.{taakId}.inlineActie.instructie` | string (multiline) | `taak.inlineActie.instructie` | optioneel |
| `dag{N}.taak.{taakId}.inlineActie.placeholder` | string | `taak.inlineActie.placeholder` | optioneel |
| `dag{N}.taak.{taakId}.inlineActie.voorbeeld` | string (multiline) | `taak.inlineActie.voorbeeld` | optioneel |

> **Niet bewerkbaar:** taak-IDs, taak-volgorde, `verplicht`-vlag, `actieRoute`, `inlineEmbed`-keuze. Dat is structuur, niet content. Founder die die wil veranderen: code-edit + commit.

### 4.2 Sprint /vandaag — speciale dag-groeten (`sprint-groet`)

| Sleutel | Voorbeeld waarde |
|---|---|
| `dag1` | "🚀 Daar ga je! Je eerste dag" |
| `dag7` | "🎉 Week 1 zit erop, top dat je doorzet!" |
| `dag8` | "💪 Week 2! Tijd om door te pakken" |
| `dag14` | "🏁 Halverwege, je hoort bij de 20% die doorzet" |
| `dag15` | "⏱️ Week 3 begint nu" |
| `dag21` | "🏆 Laatste dag van week 3, klaar voor de echte run" |
| ... | (uitbreidbaar — voeg sleutel toe in DAG_GROETEN-map) |

### 4.3 Sprint /vandaag — gedeelde UI-strings (`sprint-ui`)

Volledige lijst (~28 strings):

**Intro-stap:**
- `intro.in-het-teken-van` → "Vandaag staat in het teken van:"
- `intro.les-header` → "📖 Les van vandaag"
- `intro.taken-header` → "✅ Nu ga je doen"
- `intro.button.start` → "Begin met stap 1 →"
- `intro.button.volgende` → "Door naar je volgende stap →"
- `intro.snooze-link` → "Even niet nu, herinner me later vandaag"

**Taak-stap:**
- `taak.stap-van` → "Stap {N} van {totaal}" (let op: dynamische placeholders blijven; alleen tekst eromheen aanpasbaar)
- `taak.mobiel.titel` → "📱 Doe deze stap op je telefoon"
- `taak.mobiel.uitleg` → "Open ELEVA op je telefoon, je hebt 'm nodig om je contacten te exporteren..."
- `taak.button.open-route` → "Open deze plek →"
- `taak.button.open-extern` → "Open in nieuwe tab ↗"
- `taak.button.klaar-volgende` → "✓ Klaar, door naar volgende stap →"
- `taak.button.klaar-afronding` → "✓ Klaar, door naar afronding →"
- `taak.button.vorige` → "← Vorige"
- `taak.button.skip` → "Sla over →"
- `taak.button.skip-embed` → "Doe later, ga verder →"
- `taak.inline-actie.header` → "✏️ Schrijf hier direct je {label}"
- `taak.inline-actie.voorbeeld-label` → "Voorbeeld:"
- `taak.inline-actie.button.bewaar` → "Bewaar, door naar volgende"
- `taak.inline-actie.button.bezig` → "Bewaren..."

**Klaar-stap:**
- `klaar.titel.alles-af` → "Top, je hebt het! 🚀"
- `klaar.titel.deels` → "Goed bezig{voornaam}!"
- `klaar.tekst.alles-af` → "Alle stappen van dag {N} zijn klaar. Morgen verder met dag {N+1}, je krijgt een vriendelijke push."
- `klaar.tekst.deels` → "Je hebt {X} van de {Y} stappen gedaan. Wat niet lukte staat klaar voor morgen, kom gerust later vandaag terug."
- `klaar.voortgang-label` → "Je voortgang vandaag"
- `klaar.button.dashboard` → "Naar dashboard →"
- `klaar.button.herinner-rest` → "Herinner me later vandaag aan de rest"
- `klaar.button.opnieuw` → "← Terug naar het begin van vandaag"

### 4.4 Core /welkom-core/stap/N — per-stap content (`core-stap`)

| Sleutel-patroon | Type | Bron in code | Voorkomt |
|---|---|---|---|
| `stap{N}.titel` | string (kort) | `stap.titel` | 21× |
| `stap{N}.doel` | string (1-2 zin) | `stap.doel` | 21× |
| `stap{N}.watJeLeert` | string (multiline) | `stap.watJeLeert` | 21× |
| `stap{N}.taak.{taakId}.label` | string | `taak.label` | ~100× |
| `stap{N}.taak.{taakId}.uitleg` | string (multiline) | `taak.uitleg` | optioneel |
| `stap{N}.waarInEleva.{idx}.actie` | string | `waarInEleva[idx].actie` | optioneel |

### 4.5 Core /welkom-core/stap/N — gedeelde UI-strings (`core-ui`)

Volledige lijst (~8 strings):

- `header.les` → "📖 Wat je vandaag leert"
- `header.taken` → "✅ Wat je vandaag doet"
- `header.waar-in-eleva` → "📍 Waar vind je dit in ELEVA"
- `header.terug` → "← Terug naar overzicht"
- `taak.verplicht-badge` → "Verplicht"
- `taak.open-link` → "Open →"
- `mentor-strip.tekst` → "Niet zeker hoe? De Mentor legt het uit in mensentaal."
- `mentor-strip.button` → "Vraag"
- `nav.overzicht` → "Overzicht"

> **Niet bewerkbaar:** stap-nummers, stap-IDs, taak-volgorde, link-routes (`href`-targets). Idem als bij Sprint: structuur is code.

---

## 5. UX-design

### 5.1 Edit-modus toggle

**Plaatsing:** binnen de paarse founder-toolbar bovenaan de pagina (alleen voor founders zichtbaar).

**Werking:**
- Toggle "✍️ Edit-modus" met AAN/UIT-state
- Bij AAN: alle bewerkbare tekst-velden tonen `✍️ Bewerk`-knop ernaast (huidige `EditableTekst`-styling)
- Bij UIT: gewone view, geen pencils — exact zoals member 'm ziet
- State wordt bewaard in `localStorage` onder key `eleva-edit-modus-aan` (boolean)
- State persisteert dus over dag-springen, page-reloads, sessions
- Default bij eerste bezoek voor founder: UIT (eerst kijken, dan editen — minder ruis)

**Hover-styling bij AAN:** subtiele goud-ring rond bewerkbare blokken zodat 't direct duidelijk is wat klikbaar is.

### 5.2 Dag/stap-navigatie (founder-only)

**Hergebruik van bestaande `TesterToolbar`-patroon.**

**Voor Sprint:**
- Toolbar bovenaan met snelle-spring-knoppen (Dag 1, 5, 10, 20)
- Pijl-pickers (↑/↓) om door alle 60 dagen heen te scrollen
- Werkt via `?dag=N` URL-parameter — verandert NIET je `run_startdatum` (geen impact op echte voortgang)
- Member ziet deze toolbar nooit (server-side filter op `profile.role === 'founder'`)

**Voor Core:**
- Idem, maar met snelle-knoppen op stap 1, 7, 14, 21
- Werkt via path-based `/welkom-core/stap/{N}` (al bestaande URL-structuur, geen query-param nodig)

**Implementatie:**
- TesterToolbar krijgt props `modus: 'sprint' | 'core'` en `huidigDag: number` / `huidigStap: number`
- Sprint: page-level `useSearchParams` voor `?dag=N`
- Core: gebruikt bestaande `[nummer]` route-segment, klik → `router.push('/welkom-core/stap/${N}')`
- Klik op spring-knop schrijft de bestaande URL-conventie netjes door

### 5.3 Mockup (tekst-versie)

```
┌────────────────────────────────────────────────────────────────┐
│  [☰]   ELEVA · Project Meer Tijd en Vrijheid              [R] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────── 🟣 Founder-toolbar (alleen jij ziet 'm) ──────────┐  │
│  │                                                          │  │
│  │  Je bekijkt nu  → Dag 5 van 60                          │  │
│  │  Spring naar:   [1] [5•] [10] [20]   _5_ ↑↓             │  │
│  │                                                          │  │
│  │  ✍️ Edit-modus    ◯───●  AAN                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Ochtend, Raoul ✍️                                             │
│  Vandaag staat in het teken van: ✍️                            │
│  Eerste namen-blok afmaken ✍️                                  │
│                                                                │
│  📖 Les van vandaag ✍️                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Mensen kennen jou — niet je product. Wat je doet als    │  │
│  │ eerste, is namen verzamelen van iedereen waar je in de  │  │
│  │ afgelopen jaren contact mee hebt gehad...    ✍️          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ✅ Nu ga je doen (5 stappen) ✍️                               │
│  1. Upload je vCard ✍️                                         │
│  2. Voeg 20 namen handmatig toe ✍️                             │
│  ...                                                           │
└────────────────────────────────────────────────────────────────┘
```

In edit-modus = AAN: de ✍️-knoppen zijn zichtbaar. In edit-modus = UIT: identiek beeld, maar zonder ✍️-knoppen.

---

## 6. Rollout — Drie fases

### Fase 1A: Sprint **proof-of-concept op één dag**

**Doel:** volledige architectuur + edit-experience uitrollen op één dag (Dag 1 als proefkonijn). Raoul + Gaby kunnen dat ene dag-scherm reviewen en zeggen "ja zo goed" of "verander X" vóór we de hele 60 dagen wrappen.

**Werk:**
1. `EditableTekst`-component uitbreiden met `editModusAan`-prop
2. `EditModeToggle`-component nieuw bouwen (toggle + localStorage)
3. `TesterToolbar` uitbreiden met `?dag=N` URL-routing voor /vandaag
4. Server-side `/vandaag/page.tsx`: overrides laden voor `sprint-dag` (filtered op N), `sprint-ui` (alle), `sprint-groet` (filtered)
5. Helper `pasOverrideToe` uitbreiden om diepere paden in DAGEN-data te overriden (taak.label, taak.inlineActie.X, etc.)
6. **Alleen Dag 1 wrappen** in `vandaag-flow.tsx` (~5 tekst-locaties + alle gedeelde UI-strings die ook op andere dagen werken)
7. Live deployen, Raoul + Gaby reviewen, feedback verzamelen

**Succescriterium:** Raoul opent Dag 1, zet edit-modus AAN, wijzigt de titel + watJeLeert + één taak-label, slaat op, refresh → wijzigingen zichtbaar. Tweede check: Raoul + Gaby vinden de UX prettig om mee door te lopen.

**Inschatting:** 3-4 uur focuswerk

### Fase 1B: Sprint volledig uitrollen (alle 60 dagen)

**Doel:** als Fase 1A goedgekeurd, doorzetten naar alle resterende 59 dagen.

**Werk:**
1. Per dag de specifieke velden wrappen in `<EditableTekst>` (mechanisch werk, patroon staat al)
2. Test: doorlopen door verschillende dagen heen

**Inschatting:** 2-3 uur (mechanisch wrap-werk)

### Fase 2: Core architectuur + content-wrap

**Doel:** Hetzelfde patroon toepassen op Core /welkom-core/stap/N.

**Werk:**
1. Server-side `/welkom-core/stap/[nummer]/page.tsx`: overrides laden voor `core-stap` (filtered op N), `core-ui` (alle)
2. `StapDetail.tsx`: alle ~10 tekst-locaties per stap wrappen in `<EditableTekst>`
3. `TesterToolbar` ondersteunt `?stap=N` URL-routing voor /welkom-core
4. Test: idem als Fase 1 maar voor stappen 1-21

**Succescriterium:** Idem als Fase 1 maar voor Core.

**Inschatting:** 1-2 uur (architectuur staat al, alleen toepassen + wrappen)

### Buiten-scope: Pro

Pro `/welkom-pro/stap/[nummer]` werkt op exact dezelfde `StapDetail`-component als Core. Toepassen zal triviaal zijn zodra Fase 2 staat. Doen we in apart rondje na pilot-feedback.

---

## 7. Risico's + Mitigaties

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Override-conflict (twee founders editen tegelijk) | Laag | Laag | Last-write-wins, geen lock-systeem. Founder-team is klein (Raoul + Gaby). |
| Override-tekst breekt layout (te lang, breekt mobile) | Middel | Klein | Live preview in EditableTekst — founder ziet direct hoe 't eruitziet voor 't opslaan. |
| Code-deploy overschrijft override | Laag | Geen | Overrides staan in DB, niet in code. Code-defaults blijven fallback. |
| Verkeerde namespace/sleutel typo in code | Middel | Laag | TypeScript helpt niet bij string-keys. Mitigeren via per-namespace constants-file. |
| Founder vergeet edit-modus uit te zetten en denkt dat-ie member-view ziet | Laag | Klein | Toggle is duidelijk gemarkeerd "AAN". Bij UIT = geen pencils zichtbaar. |
| Per-taak-key gebaseerd op `taak.id` — ID-rename breekt bestaande overrides | Middel | Middel | Document: nooit taak-IDs hernoemen na deploy. Deze regel staat al in `types.ts` comments. |

---

## 8. Open beslispunten

Geen.

---

## 9. Niet-doelen

- Multi-language editor (we werken nu Nederlands-only via `lib/i18n/vertalingen.ts`, dat blijft uit deze scope)
- Audit-log van wie-wijzigde-wat-wanneer (later, niet nu kritiek)
- Versioning / rollback (later)
- Founder die alleen zichzelf laat zien — preview-modus voor één gebruiker (later)
- Editable links / hrefs (alleen tekst, geen routing)
- Editable structuur (taak-volgorde, dag-volgorde, etc.)

---

## 10. Volgende stap

Implementatieplan opstellen via `superpowers:writing-plans`. Plan beschrijft per Fase de exacte code-changes per bestand, in geval van Fase 1 inclusief de complete lijst van ~50 EditableTekst-wraps.
