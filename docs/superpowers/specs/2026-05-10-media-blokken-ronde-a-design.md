# Design: Media-blokken Ronde A (Video, Plaatje, PDF)

**Datum:** 2026-05-10
**Status:** Goedgekeurd voor implementatie
**Voor:** Sprint /vandaag + Core /welkom-core/stap/[N]. Andere pagina's later.

---

## 1. Doel

Founders willen op verschillende plekken in een dag-flow (of stap-detail) media kunnen toevoegen — niet alleen tekst. In edit-modus kun je tussen blokken een "+ media hier"-knop tikken en een video, plaatje of PDF invoegen die voor alle members verschijnt.

**Resultaat:**
- Founder voegt op een gekozen positie een Vimeo/YouTube-video in door een URL te plakken
- Founder uploadt een JPG/PNG of PDF en kiest een positie
- Members zien de toevoegingen in de gewone view (zonder edit-knoppen)
- Meerdere media per positie mogelijk, op volgorde gesorteerd
- Werkt naast het bestaande FilmInBlok-systeem (dat blijft bestaan voor de bestaande slugs)

---

## 2. Scope

### In-scope (Ronde A)

| Pad | Pagina | Posities |
|---|---|---|
| Sprint | `/vandaag` (vandaag-flow.tsx) | `boven-titel`, `boven-les`, `tussen-les-taken`, `bij-taak.<taakId>`, `op-klaar-stap` |
| Core | `/welkom-core/stap/[N]` (StapDetail.tsx) | zelfde 5 posities (per stap) |

### Media-types in Ronde A

| Type | Toelichting |
|---|---|
| **video** | Vimeo of YouTube URL — embed via iframe |
| **afbeelding** | JPG/PNG upload, max 5MB → Supabase Storage |
| **pdf** | PDF upload, max 10MB → Supabase Storage, weergegeven als download-tegel |

### Out-of-scope (latere rondes)

- Pro `/welkom-pro/stap/[N]` — zelfde patroon hergebruiken in Ronde A's vervolg
- Audio/Voice-memo's (Ronde B)
- Quote-blok (Ronde B)
- Link-tegel + Galerij (Ronde C)
- Eigen MP4-upload (alleen URL-embeds in Ronde A)
- Drag-drop sortering in UI (volgorde wel aanpasbaar via "verplaats omhoog/omlaag"-knoppen)

---

## 3. Architectuur

### 3.1 Database

Eén nieuwe tabel `pagina_blokken`:

```sql
CREATE TABLE pagina_blokken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagina_namespace text NOT NULL,        -- 'sprint-dag', 'core-stap'
  pagina_id text NOT NULL,               -- '1', '2', ... '60'
  positie text NOT NULL,                 -- 'boven-titel', 'boven-les', etc.
  volgorde int NOT NULL DEFAULT 0,       -- sortering binnen positie
  type text NOT NULL,                    -- 'video', 'afbeelding', 'pdf'
  inhoud jsonb NOT NULL,                 -- type-specifieke velden
  storage_pad text,                      -- alleen bij upload-types
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_pagina_blokken_lookup
  ON pagina_blokken (pagina_namespace, pagina_id, positie, volgorde);
```

**RLS:**
- `SELECT`: iedereen (anon + authenticated) — blokken zijn publiek leesbaar binnen ELEVA
- `INSERT/UPDATE/DELETE`: alleen `auth.jwt() ->> 'role' = 'founder'` (via profile-check in policy)

**Inhoud-jsonb per type:**

```typescript
// video
{ url: string, titel?: string, bron: 'vimeo' | 'youtube' }

// afbeelding
{ titel?: string, alt: string, breedte?: number, hoogte?: number }

// pdf
{ titel: string, beschrijving?: string, bestandsnaam: string }
```

**Storage_pad:** alleen bij upload-types (`afbeelding`, `pdf`). Vorm: `<namespace>/<id>/<uuid>.<ext>`.

### 3.2 Supabase Storage

Nieuwe bucket `pagina-media` (privé):
- Toegankelijk via signed URLs voor leden
- Founders mogen uploaden via service-role-route
- Path-conventie: `{namespace}/{id}/{uuid}.{extensie}`
- Max bestandsgrootte: 5MB voor afbeelding, 10MB voor PDF

### 3.3 Render-flow (members + founders)

```
Server-side (page.tsx):
  1. Haal blokken op voor (namespace, id, alle posities)
  2. Voor types met storage: genereer signed URLs
  3. Geef blokken-per-positie door aan client component

Client-side (vandaag-flow.tsx):
  Op elke positie: <MediaBlokken positie="boven-les" blokken={...} />
  → MediaBlokken rendert lijst, per blok het juiste sub-component
  → In edit-modus: + media hier-knop tussen blokken zichtbaar
```

### 3.4 Edit-flow (founder)

```
1. Founder zet edit-modus AAN (bestaande EditModeContext)
2. Op elke positie verschijnt een "+ media hier"-knop
3. Klik opent <MediaToevoegenModal>:
   ┌─ Wat wil je toevoegen? ──────────┐
   │  [🎥 Video]  [🖼 Plaatje]  [📄 PDF] │
   └──────────────────────────────────┘
4. Type-keuze → specifieke invoer:
   - Video: URL plakken + optioneel titel
   - Afbeelding: file kiezen + alt-text
   - PDF: file kiezen + titel + optioneel beschrijving
5. Bewaar → POST /api/pagina-blokken → blok verschijnt
6. Per bestaand blok: ✏️ bewerk-knop, 🗑 verwijder-knop, ↑↓ verplaats-knoppen
```

---

## 4. Posities (slots)

Per pagina-type vaste lijst:

### Sprint /vandaag

| Sleutel | Plek in pagina | Wanneer zichtbaar |
|---|---|---|
| `boven-titel` | Helemaal bovenaan, boven groet | Intro-stap |
| `boven-les` | Net boven "📖 Les van vandaag" header | Intro-stap |
| `tussen-les-taken` | Tussen les-blok en taken-overzicht | Intro-stap |
| `bij-taak.<taakId>` | Boven taak-uitleg | Taak-stap (alleen voor matchende taak) |
| `op-klaar-stap` | Onderaan klaar-scherm | Klaar-stap |

### Core /welkom-core/stap/[N]

Zelfde 5 posities, met `bij-taak.<taakId>` per taak van de stap.

> Waarom geen position bij `boven-titel-mobiel-warning` etc.: te fijn-mazig. Vijf plekken dekt 95% van wat je wilt; meer voegt rommel toe.

---

## 5. Components

### Nieuw

- `app/api/pagina-blokken/route.ts` — POST (toevoegen), GET (admin-list), DELETE
- `app/api/pagina-blokken/[id]/route.ts` — PATCH (bewerken/verplaatsen), DELETE
- `app/api/pagina-blokken/upload/route.ts` — POST voor file-upload, returns `{ storage_pad, signed_url }`
- `lib/cms/pagina-blokken.ts` — server-side helper `haalPaginaBlokken(supabase, namespace, id)` returns Map<positie, Blok[]>
- `components/cms/MediaBlokken.tsx` — render lijst van blokken op één positie
- `components/cms/blokken/VideoBlok.tsx` — Vimeo/YouTube embed (hergebruik @vimeo/player)
- `components/cms/blokken/AfbeeldingBlok.tsx` — `<img>` met alt-text en click-to-fullscreen
- `components/cms/blokken/PdfBlok.tsx` — download-card met file-icon + titel + grootte
- `components/cms/MediaToevoegenKnop.tsx` — kleine "+ media hier"-knop, founder + edit-modus
- `components/cms/MediaToevoegenModal.tsx` — type-keuze + invoer-flow + opslag

### Te wijzigen

- `app/vandaag/page.tsx` — `haalPaginaBlokken` aanroepen voor "sprint-dag" / `${dag.nummer}`, doorgeven aan flow
- `app/vandaag/vandaag-flow.tsx` — `<MediaBlokken positie="X" blokken={...} />` op de 5 posities
- `app/welkom-core/stap/[nummer]/page.tsx` — idem voor "core-stap" / `${stap.nummer}`
- `components/leerpaden/StapDetail.tsx` — idem MediaBlokken-renders

### Niet aanraken

- Bestaande `FilmInBlok`-component blijft als is (legacy, gebonden aan vaste film-slugs in /instellingen/films). Beide systemen werken naast elkaar.

---

## 6. Storage + Beveiliging

### Bucket `pagina-media`

- Privé (niet publiek toegankelijk)
- Server-side signed URLs (1 uur geldig)
- Upload via service-role-key in `/api/pagina-blokken/upload`-route
- Auth-check: alleen founders mogen uploaden

### Database RLS

```sql
-- SELECT: iedereen
CREATE POLICY "lezen voor iedereen" ON pagina_blokken
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: alleen founders
CREATE POLICY "schrijven door founders" ON pagina_blokken
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );
```

### Bestand-cleanup

Bij DELETE van een blok-rij met `storage_pad`: ook bestand uit Storage verwijderen. Atomic via DELETE-route.

---

## 7. UX-design

### Edit-modus AAN — founder

```
┌─────────────────────────────────────────────────────┐
│  [+ media hier]                       (boven-titel) │
│                                                     │
│  Dag 5 · Fase 1                                     │
│  🚀 Daar ga je! ✍️                                  │
│                                                     │
│  [+ media hier]                         (boven-les) │
│                                                     │
│  📖 Les van vandaag ✍️                              │
│  Mensen kennen jou — niet... ✍️                     │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ [bestaand blok: Vimeo-video, sleepbaar]    │    │
│  │ titel + ▶ play  · ↑ ↓ ✏️ 🗑               │    │
│  └────────────────────────────────────────────┘    │
│  [+ media hier]                  (tussen-les-taken) │
│                                                     │
│  ✅ Nu ga je doen ✍️                                │
└─────────────────────────────────────────────────────┘
```

### Edit-modus UIT — member view

```
┌─────────────────────────────────────────────────────┐
│  Dag 5 · Fase 1                                     │
│  🚀 Daar ga je!                                     │
│                                                     │
│  📖 Les van vandaag                                 │
│  Mensen kennen jou — niet je product. Wat...        │
│                                                     │
│  [▶ Vimeo-video met titel + play-knop]              │
│                                                     │
│  ✅ Nu ga je doen (5 stappen)                       │
└─────────────────────────────────────────────────────┘
```

### Toevoegen-modal

```
┌─ Wat wil je hier toevoegen? ──────────────────┐
│                                                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ 🎥 Video │  │🖼 Plaatje│  │ 📄 PDF  │   │
│   │  Vimeo / │  │ JPG/PNG  │  │ ≤10MB   │   │
│   │ YouTube  │  │  ≤5MB    │  │         │   │
│   └──────────┘  └──────────┘  └──────────┘   │
│                                                │
│              [Annuleer]                        │
└────────────────────────────────────────────────┘

(klik op type → invoer-flow)

┌─ Video toevoegen ─────────────────────────────┐
│  URL (Vimeo of YouTube)                       │
│  [_________________________________________] │
│                                                │
│  Titel (optioneel)                            │
│  [_________________________________________] │
│                                                │
│       [Annuleer]    [Toevoegen]              │
└────────────────────────────────────────────────┘
```

---

## 8. Risico's + Mitigaties

| Risico | Kans | Impact | Mitigatie |
|---|---|---|---|
| Founder upload onbedoeld groot bestand → DB/storage vol | Middel | Middel | Hard-cap (5MB image, 10MB PDF) in upload-route |
| YouTube/Vimeo URL niet herkend (typo of nieuwe formaten) | Hoog | Laag | URL-parser met regex + foutmelding "Niet herkend, plak URL exact" |
| Verwijderd blok laat orphan-bestand achter in storage | Middel | Klein | Atomic DELETE in route — DB + storage in één transactie |
| Member ziet kapotte image (storage 404) | Laag | Klein | Bij 404: rode placeholder met "afbeelding niet beschikbaar" |
| Volgorde-conflict bij gelijk-tijdige edits | Laag | Klein | Last-write-wins op volgorde-veld; founder-team is klein |

---

## 9. Open beslispunten

Geen.

---

## 10. Niet-doelen

- Drag-drop sortering (kan later, nu ↑↓-knoppen)
- Inline preview voor PDF (open in nieuwe tab)
- Bulk-uploads (één per keer)
- Caching/CDN-laag (Supabase signed URLs zijn goed genoeg voor pilot)
- Versioning van media (oude versies bewaren)

---

## 11. Volgende stap

Implementatieplan opstellen via `superpowers:writing-plans` voor de eerste implementatie-iteratie. Plan beschrijft: SQL-migratie, storage-bucket-aanmaak, API-routes, components, integratie in vandaag-flow en StapDetail.
