# Media-blokken Ronde A Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw het media-blokken-systeem zodat founders op 5 vaste posities per Sprint /vandaag-pagina (en straks Core /welkom-core/stap/N) video's, plaatjes en PDFs kunnen toevoegen. Members zien de rendered media in hun gewone view.

**Architectuur:** Nieuwe `pagina_blokken`-tabel met RLS + Supabase Storage bucket `pagina-media`. Server-side helper laadt blokken per pagina, geeft door aan client. Client rendert via `MediaBlokken`-component dat per type een sub-component aanroept (`VideoBlok`, `AfbeeldingBlok`, `PdfBlok`). In edit-modus tonen tussen-blok "+ media hier"-knoppen die een type-keuze-modal openen.

**Tech Stack:** Next.js App Router (server + client), Supabase (Postgres + Storage), TypeScript, bestaande Vimeo Player package, Lucide-React (icons), bestaande `EditableTekst` + `EditModeContext`.

> **Codebase-context:** Geen test-framework. Verificatie via TypeScript-check + manual smoke-test.

---

## File Structure

### Te creëren
- `lib/supabase/migrations/2026-05-10-pagina-blokken.sql` — DB-migratie + RLS
- `lib/cms/pagina-blokken.ts` — server-side helper + types
- `app/api/pagina-blokken/route.ts` — POST (toevoegen)
- `app/api/pagina-blokken/[id]/route.ts` — PATCH (bewerken/verplaatsen) + DELETE
- `app/api/pagina-blokken/upload/route.ts` — POST file-upload (afbeelding/pdf)
- `components/cms/blokken/VideoBlok.tsx` — Vimeo/YouTube embed
- `components/cms/blokken/AfbeeldingBlok.tsx` — `<img>` met alt + click-fullscreen
- `components/cms/blokken/PdfBlok.tsx` — download-card
- `components/cms/MediaBlokken.tsx` — rendert lijst van blokken op één positie
- `components/cms/MediaToevoegenKnop.tsx` — "+ media hier"-knop (founder-only)
- `components/cms/MediaToevoegenModal.tsx` — type-keuze + invoer-flow

### Te wijzigen
- `app/vandaag/page.tsx` — `haalPaginaBlokken` aanroepen, doorgeven aan flow
- `app/vandaag/vandaag-flow.tsx` — `<MediaBlokken positie="X" ... />` op 5 posities

### Niet aanraken
- Bestaande `FilmInBlok`-component blijft (legacy)
- `playbook_overrides` en `tekst_overrides` blijven ongewijzigd

---

## Task 1: SQL-migratie + Storage-bucket

**Files:**
- Create: `lib/supabase/migrations/2026-05-10-pagina-blokken.sql`

- [ ] **Step 1: Schrijf SQL-migratie**

```sql
-- ============================================================
-- pagina_blokken: founder-bewerkbare media-blokken op 5 vaste
-- posities per pagina (sprint-dag, core-stap).
--
-- Eén rij per blok. Volgorde-veld voor sortering binnen positie.
-- inhoud-jsonb verschilt per type:
--   video       { url, titel?, bron: 'vimeo' | 'youtube' }
--   afbeelding  { titel?, alt, breedte?, hoogte? }
--   pdf         { titel, beschrijving?, bestandsnaam }
-- storage_pad: alleen bij upload-types (afbeelding/pdf).
-- ============================================================

CREATE TABLE IF NOT EXISTS pagina_blokken (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagina_namespace text NOT NULL,
  pagina_id text NOT NULL,
  positie text NOT NULL,
  volgorde int NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('video', 'afbeelding', 'pdf')),
  inhoud jsonb NOT NULL,
  storage_pad text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pagina_blokken_lookup
  ON pagina_blokken (pagina_namespace, pagina_id, positie, volgorde);

-- Row Level Security
ALTER TABLE pagina_blokken ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lezen voor iedereen ingelogd"
  ON pagina_blokken FOR SELECT
  USING (true);

CREATE POLICY "schrijven door founders"
  ON pagina_blokken FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- updated_at automatisch bijwerken
CREATE OR REPLACE FUNCTION pagina_blokken_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pagina_blokken_updated_at_trigger
  BEFORE UPDATE ON pagina_blokken
  FOR EACH ROW
  EXECUTE FUNCTION pagina_blokken_updated_at();

-- Storage bucket aanmaken (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pagina-media', 'pagina-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: founders mogen uploaden, iedereen mag downloaden via signed URL
CREATE POLICY "lezen pagina-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pagina-media');

CREATE POLICY "uploaden pagina-media door founders"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pagina-media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

CREATE POLICY "verwijderen pagina-media door founders"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pagina-media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );
```

- [ ] **Step 2: Migratie draaien via setup A**

```bash
node --dns-result-order=ipv4first scripts/sql.mjs --yes -f lib/supabase/migrations/2026-05-10-pagina-blokken.sql
```

Verifieer:
```bash
node --dns-result-order=ipv4first scripts/sql.mjs "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pagina_blokken' ORDER BY ordinal_position"
```

Expected: 11 kolommen (id, pagina_namespace, pagina_id, positie, volgorde, type, inhoud, storage_pad, created_at, updated_at, updated_by).

- [ ] **Step 3: Bucket verifiëren**

```bash
node --dns-result-order=ipv4first scripts/sql.mjs "SELECT id, name, public FROM storage.buckets WHERE id = 'pagina-media'"
```

Expected: rij met `public=false`.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/migrations/2026-05-10-pagina-blokken.sql
git commit -m "feat(db): pagina_blokken-tabel + pagina-media bucket

Tabel voor founder-bewerkbare media-blokken op 5 vaste posities per
pagina. RLS: SELECT voor iedereen, INSERT/UPDATE/DELETE alleen voor
founders. Bucket pagina-media (privé) voor afbeelding + PDF uploads.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Server-side helper + types

**Files:**
- Create: `lib/cms/pagina-blokken.ts`

- [ ] **Step 1: Helper schrijven**

```typescript
// ============================================================
// pagina-blokken server-helpers
//
// Haalt blokken op per pagina (namespace + id) en groepeert ze
// per positie. Genereert signed URLs voor upload-types.
// Faalt stilletjes als tabel ontbreekt → lege Map.
// ============================================================

export type BlokType = "video" | "afbeelding" | "pdf";

export type VideoInhoud = {
  url: string;
  titel?: string;
  bron: "vimeo" | "youtube";
};

export type AfbeeldingInhoud = {
  titel?: string;
  alt: string;
  breedte?: number;
  hoogte?: number;
};

export type PdfInhoud = {
  titel: string;
  beschrijving?: string;
  bestandsnaam: string;
};

export type Blok = {
  id: string;
  pagina_namespace: string;
  pagina_id: string;
  positie: string;
  volgorde: number;
  type: BlokType;
  inhoud: VideoInhoud | AfbeeldingInhoud | PdfInhoud;
  storage_pad: string | null;
  /** Server-gegenereerd: signed URL voor afbeelding/pdf */
  bestand_url?: string;
};

type SupabaseAchtig = {
  from: (t: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          order: (
            col: string,
            opts: { ascending: boolean },
          ) => Promise<{ data: Blok[] | null; error: unknown }>;
        };
      };
    };
  };
  storage: {
    from: (bucket: string) => {
      createSignedUrl: (
        path: string,
        seconds: number,
      ) => Promise<{ data: { signedUrl: string } | null; error: unknown }>;
    };
  };
};

export type BlokkenPerPositie = Map<string, Blok[]>;

/**
 * Haal alle blokken voor een pagina op, gegroepeerd per positie.
 * Genereert signed URLs voor afbeelding/pdf-types.
 */
export async function haalPaginaBlokken(
  supabase: SupabaseAchtig,
  paginaNamespace: string,
  paginaId: string,
): Promise<BlokkenPerPositie> {
  const result: BlokkenPerPositie = new Map();
  try {
    const { data, error } = await supabase
      .from("pagina_blokken")
      .select(
        "id, pagina_namespace, pagina_id, positie, volgorde, type, inhoud, storage_pad",
      )
      .eq("pagina_namespace", paginaNamespace)
      .eq("pagina_id", paginaId)
      .order("volgorde", { ascending: true });
    if (error || !data) return result;

    // Signed URLs voor upload-types
    for (const blok of data) {
      if (blok.storage_pad && blok.type !== "video") {
        try {
          const { data: signed } = await supabase.storage
            .from("pagina-media")
            .createSignedUrl(blok.storage_pad, 60 * 60);
          if (signed?.signedUrl) blok.bestand_url = signed.signedUrl;
        } catch {
          // Negeer; render-component toont placeholder bij ontbrekende url
        }
      }

      let lijst = result.get(blok.positie);
      if (!lijst) {
        lijst = [];
        result.set(blok.positie, lijst);
      }
      lijst.push(blok);
    }
  } catch {
    // tabel ontbreekt of network-fout, lege map terug
  }
  return result;
}

/**
 * Comfort-helper: pak één positie eruit als plain Array. Lege array
 * als de positie niet bestond.
 */
export function blokkenOpPositie(
  blokken: BlokkenPerPositie,
  positie: string,
): Blok[] {
  return blokken.get(positie) ?? [];
}

/**
 * Vimeo-ID extractor uit verschillende URL-formaten.
 * Returns null als geen Vimeo-URL.
 */
export function vimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * YouTube-ID extractor uit verschillende URL-formaten.
 * Returns null als geen YouTube-URL.
 */
export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/,
  );
  return match ? match[1] : null;
}
```

- [ ] **Step 2: TypeScript-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "lib/cms/pagina-blokken" | head -5`
Expected: lege output.

- [ ] **Step 3: Commit**

```bash
git add lib/cms/pagina-blokken.ts
git commit -m "feat(cms): pagina-blokken server-helper + types

haalPaginaBlokken laadt alle blokken voor een pagina, groepeert per
positie en genereert signed URLs voor afbeelding/pdf. vimeoId +
youtubeId helpers voor URL-parsing in render-component.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Render-componenten (VideoBlok, AfbeeldingBlok, PdfBlok)

**Files:**
- Create: `components/cms/blokken/VideoBlok.tsx`
- Create: `components/cms/blokken/AfbeeldingBlok.tsx`
- Create: `components/cms/blokken/PdfBlok.tsx`

- [ ] **Step 1: VideoBlok**

```tsx
"use client";

import type { VideoInhoud } from "@/lib/cms/pagina-blokken";
import { vimeoId, youtubeId } from "@/lib/cms/pagina-blokken";

type Props = {
  inhoud: VideoInhoud;
};

export function VideoBlok({ inhoud }: Props) {
  const vimId = vimeoId(inhoud.url);
  const ytId = youtubeId(inhoud.url);

  let embed: string | null = null;
  if (vimId) embed = `https://player.vimeo.com/video/${vimId}`;
  else if (ytId) embed = `https://www.youtube.com/embed/${ytId}`;

  if (!embed) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-900/20 p-4 text-red-200 text-sm">
        Video-URL niet herkend (alleen Vimeo en YouTube ondersteund). Vraag
        Raoul om de URL te checken.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden bg-cm-black border border-cm-border">
      {inhoud.titel && (
        <p className="px-3 py-2 text-cm-gold text-xs font-semibold uppercase tracking-wider">
          {inhoud.titel}
        </p>
      )}
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: AfbeeldingBlok**

```tsx
"use client";

import { useState } from "react";
import type { AfbeeldingInhoud } from "@/lib/cms/pagina-blokken";

type Props = {
  inhoud: AfbeeldingInhoud;
  bestandUrl: string;
};

export function AfbeeldingBlok({ inhoud, bestandUrl }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-cm-border bg-cm-surface">
        {inhoud.titel && (
          <p className="px-3 py-2 text-cm-gold text-xs font-semibold uppercase tracking-wider">
            {inhoud.titel}
          </p>
        )}
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="block w-full"
          title="Klik om groter te bekijken"
        >
          <img
            src={bestandUrl}
            alt={inhoud.alt}
            width={inhoud.breedte}
            height={inhoud.hoogte}
            className="w-full h-auto block"
            loading="lazy"
          />
        </button>
      </div>
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreen(false)}
        >
          <img
            src={bestandUrl}
            alt={inhoud.alt}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: PdfBlok**

```tsx
"use client";

import type { PdfInhoud } from "@/lib/cms/pagina-blokken";

type Props = {
  inhoud: PdfInhoud;
  bestandUrl: string;
};

export function PdfBlok({ inhoud, bestandUrl }: Props) {
  return (
    <a
      href={bestandUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={inhoud.bestandsnaam}
      className="flex items-center gap-3 p-4 rounded-xl border border-cm-border bg-cm-surface hover:border-cm-gold-dim transition-colors"
    >
      <span className="text-3xl flex-shrink-0">📄</span>
      <div className="flex-1 min-w-0">
        <p className="text-cm-white font-semibold text-sm truncate">
          {inhoud.titel}
        </p>
        {inhoud.beschrijving && (
          <p className="text-cm-white/60 text-xs mt-0.5 leading-snug">
            {inhoud.beschrijving}
          </p>
        )}
        <p className="text-cm-gold text-xs mt-1.5">Open / download →</p>
      </div>
    </a>
  );
}
```

- [ ] **Step 4: TypeScript-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "components/cms/blokken" | head -5`
Expected: lege output.

- [ ] **Step 5: Commit**

```bash
git add components/cms/blokken/
git commit -m "feat(cms): VideoBlok + AfbeeldingBlok + PdfBlok renderers

Pure render-components. VideoBlok parsed Vimeo/YouTube URL, embed
via iframe. AfbeeldingBlok toont img met click-to-fullscreen.
PdfBlok is download-card met file-icon + titel.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: MediaBlokken-renderer + edit-knoppen

**Files:**
- Create: `components/cms/MediaBlokken.tsx`

- [ ] **Step 1: MediaBlokken**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { useEditModus } from "./EditModeContext";
import { VideoBlok } from "./blokken/VideoBlok";
import { AfbeeldingBlok } from "./blokken/AfbeeldingBlok";
import { PdfBlok } from "./blokken/PdfBlok";
import { MediaToevoegenKnop } from "./MediaToevoegenKnop";

// ============================================================
// MediaBlokken, rendert alle media-blokken voor één positie.
// In edit-modus tonen we een '+ media hier'-knop onderaan zodat
// founder een nieuwe blok kan toevoegen. Per blok ook bewerk- en
// verwijder-knoppen + verplaats-omhoog/-omlaag.
// ============================================================

type Props = {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
  blokken: Blok[];
  isFounder: boolean;
};

export function MediaBlokken({
  paginaNamespace,
  paginaId,
  positie,
  blokken,
  isFounder,
}: Props) {
  const { editModusAan } = useEditModus();
  const router = useRouter();
  const [bezig, setBezig] = useState(false);

  const toonEdit = isFounder && editModusAan;

  async function verwijder(id: string) {
    if (!confirm("Dit blok verwijderen? Kan niet ongedaan gemaakt worden.")) {
      return;
    }
    setBezig(true);
    try {
      const res = await fetch(`/api/pagina-blokken/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Verwijderen mislukt");
        return;
      }
      toast.success("Verwijderd");
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function verplaats(id: string, richting: "omhoog" | "omlaag") {
    setBezig(true);
    try {
      const res = await fetch(`/api/pagina-blokken/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verplaats: richting }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Verplaatsen mislukt");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  if (blokken.length === 0 && !toonEdit) return null;

  return (
    <div className="space-y-3">
      {blokken.map((blok, i) => (
        <div key={blok.id} className="relative group">
          {/* Render het blok zelf */}
          {blok.type === "video" && (
            <VideoBlok inhoud={blok.inhoud as never} />
          )}
          {blok.type === "afbeelding" && blok.bestand_url && (
            <AfbeeldingBlok
              inhoud={blok.inhoud as never}
              bestandUrl={blok.bestand_url}
            />
          )}
          {blok.type === "pdf" && blok.bestand_url && (
            <PdfBlok
              inhoud={blok.inhoud as never}
              bestandUrl={blok.bestand_url}
            />
          )}

          {/* Founder-knoppen (alleen in edit-modus) */}
          {toonEdit && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-cm-surface/95 border border-cm-gold/40 rounded-full px-2 py-1 shadow-lg">
              <button
                type="button"
                onClick={() => verplaats(blok.id, "omhoog")}
                disabled={bezig || i === 0}
                title="Naar boven"
                className="text-cm-white/70 hover:text-cm-gold disabled:opacity-30 px-1"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => verplaats(blok.id, "omlaag")}
                disabled={bezig || i === blokken.length - 1}
                title="Naar onderen"
                className="text-cm-white/70 hover:text-cm-gold disabled:opacity-30 px-1"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => verwijder(blok.id)}
                disabled={bezig}
                title="Verwijderen"
                className="text-cm-white/70 hover:text-red-400 px-1"
              >
                🗑
              </button>
            </div>
          )}
        </div>
      ))}

      {/* + media hier */}
      {toonEdit && (
        <MediaToevoegenKnop
          paginaNamespace={paginaNamespace}
          paginaId={paginaId}
          positie={positie}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "MediaBlokken" | head -5`
Expected: errors over MediaToevoegenKnop niet bestaand — dat fixen we in Task 5. Andere errors = bug.

- [ ] **Step 3: Commit (nog niet pushen)**

```bash
git add components/cms/MediaBlokken.tsx
git commit -m "feat(cms): MediaBlokken renderer met edit-controls

Rendert lijst van blokken op een positie. In edit-modus toont
verplaats/verwijder-knoppen per blok + '+ media hier' onderaan.
Roept MediaToevoegenKnop aan (volgt in Task 5).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: MediaToevoegenKnop + Modal

**Files:**
- Create: `components/cms/MediaToevoegenKnop.tsx`
- Create: `components/cms/MediaToevoegenModal.tsx`

- [ ] **Step 1: MediaToevoegenKnop**

```tsx
"use client";

import { useState } from "react";
import { MediaToevoegenModal } from "./MediaToevoegenModal";

type Props = {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
};

export function MediaToevoegenKnop({
  paginaNamespace,
  paginaId,
  positie,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-lg border-2 border-dashed border-cm-gold/40 text-cm-gold/70 hover:border-cm-gold hover:text-cm-gold hover:bg-cm-gold/5 transition-colors text-sm flex items-center justify-center gap-2"
      >
        <span>+</span> media hier
      </button>
      {open && (
        <MediaToevoegenModal
          paginaNamespace={paginaNamespace}
          paginaId={paginaId}
          positie={positie}
          onSluit={() => setOpen(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: MediaToevoegenModal**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
  onSluit: () => void;
};

type Stap = "type-keuze" | "video" | "afbeelding" | "pdf";

export function MediaToevoegenModal({
  paginaNamespace,
  paginaId,
  positie,
  onSluit,
}: Props) {
  const router = useRouter();
  const [stap, setStap] = useState<Stap>("type-keuze");
  const [bezig, setBezig] = useState(false);

  // Video-velden
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitel, setVideoTitel] = useState("");

  // Afbeelding-velden
  const [afbBestand, setAfbBestand] = useState<File | null>(null);
  const [afbAlt, setAfbAlt] = useState("");
  const [afbTitel, setAfbTitel] = useState("");

  // PDF-velden
  const [pdfBestand, setPdfBestand] = useState<File | null>(null);
  const [pdfTitel, setPdfTitel] = useState("");
  const [pdfBeschrijving, setPdfBeschrijving] = useState("");

  async function bewaarVideo() {
    const url = videoUrl.trim();
    if (!url) {
      toast.error("Plak een Vimeo of YouTube URL");
      return;
    }
    const isVimeo = /vimeo\.com/.test(url);
    const isYoutube = /youtube\.com|youtu\.be/.test(url);
    if (!isVimeo && !isYoutube) {
      toast.error("Alleen Vimeo en YouTube URLs ondersteund");
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/pagina-blokken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagina_namespace: paginaNamespace,
          pagina_id: paginaId,
          positie,
          type: "video",
          inhoud: {
            url,
            titel: videoTitel.trim() || undefined,
            bron: isVimeo ? "vimeo" : "youtube",
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Toevoegen mislukt");
        return;
      }
      toast.success("Video toegevoegd");
      onSluit();
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function bewaarAfbeelding() {
    if (!afbBestand) {
      toast.error("Kies een afbeelding");
      return;
    }
    if (!afbAlt.trim()) {
      toast.error("Alt-tekst is verplicht (voor toegankelijkheid)");
      return;
    }
    if (afbBestand.size > 5 * 1024 * 1024) {
      toast.error("Bestand te groot (max 5MB)");
      return;
    }
    setBezig(true);
    try {
      // Stap 1: upload bestand
      const fd = new FormData();
      fd.append("bestand", afbBestand);
      fd.append("paginaNamespace", paginaNamespace);
      fd.append("paginaId", paginaId);
      const upRes = await fetch("/api/pagina-blokken/upload", {
        method: "POST",
        body: fd,
      });
      const upData = await upRes.json();
      if (!upRes.ok) {
        toast.error(upData.error || "Upload mislukt");
        return;
      }

      // Stap 2: blok aanmaken met storage_pad
      const res = await fetch("/api/pagina-blokken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagina_namespace: paginaNamespace,
          pagina_id: paginaId,
          positie,
          type: "afbeelding",
          inhoud: {
            alt: afbAlt.trim(),
            titel: afbTitel.trim() || undefined,
          },
          storage_pad: upData.storage_pad,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Toevoegen mislukt");
        return;
      }
      toast.success("Afbeelding toegevoegd");
      onSluit();
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function bewaarPdf() {
    if (!pdfBestand) {
      toast.error("Kies een PDF");
      return;
    }
    if (!pdfTitel.trim()) {
      toast.error("Titel is verplicht");
      return;
    }
    if (pdfBestand.size > 10 * 1024 * 1024) {
      toast.error("Bestand te groot (max 10MB)");
      return;
    }
    setBezig(true);
    try {
      const fd = new FormData();
      fd.append("bestand", pdfBestand);
      fd.append("paginaNamespace", paginaNamespace);
      fd.append("paginaId", paginaId);
      const upRes = await fetch("/api/pagina-blokken/upload", {
        method: "POST",
        body: fd,
      });
      const upData = await upRes.json();
      if (!upRes.ok) {
        toast.error(upData.error || "Upload mislukt");
        return;
      }
      const res = await fetch("/api/pagina-blokken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagina_namespace: paginaNamespace,
          pagina_id: paginaId,
          positie,
          type: "pdf",
          inhoud: {
            titel: pdfTitel.trim(),
            beschrijving: pdfBeschrijving.trim() || undefined,
            bestandsnaam: pdfBestand.name,
          },
          storage_pad: upData.storage_pad,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Toevoegen mislukt");
        return;
      }
      toast.success("PDF toegevoegd");
      onSluit();
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center p-4"
      onClick={onSluit}
    >
      <div
        className="bg-cm-surface border border-cm-border rounded-xl p-5 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-cm-gold font-semibold">
            {stap === "type-keuze"
              ? "Wat wil je hier toevoegen?"
              : stap === "video"
                ? "Video toevoegen"
                : stap === "afbeelding"
                  ? "Afbeelding toevoegen"
                  : "PDF toevoegen"}
          </h3>
          <button
            type="button"
            onClick={onSluit}
            className="text-cm-white/60 hover:text-cm-white text-xl"
          >
            ×
          </button>
        </div>

        {stap === "type-keuze" && (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStap("video")}
              className="p-4 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-3xl mb-1">🎥</div>
              <div className="text-xs text-cm-white">Video</div>
              <div className="text-[10px] text-cm-white/60">Vimeo / YouTube</div>
            </button>
            <button
              type="button"
              onClick={() => setStap("afbeelding")}
              className="p-4 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-3xl mb-1">🖼</div>
              <div className="text-xs text-cm-white">Plaatje</div>
              <div className="text-[10px] text-cm-white/60">JPG/PNG ≤5MB</div>
            </button>
            <button
              type="button"
              onClick={() => setStap("pdf")}
              className="p-4 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-3xl mb-1">📄</div>
              <div className="text-xs text-cm-white">PDF</div>
              <div className="text-[10px] text-cm-white/60">≤10MB</div>
            </button>
          </div>
        )}

        {stap === "video" && (
          <div className="space-y-3">
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                URL (Vimeo of YouTube)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://vimeo.com/123456789"
                className="input-cm w-full text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Titel (optioneel)
              </label>
              <input
                type="text"
                value={videoTitel}
                onChange={(e) => setVideoTitel(e.target.value)}
                className="input-cm w-full text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStap("type-keuze")}
                className="text-cm-white/60 hover:text-cm-white text-sm"
              >
                ← Terug
              </button>
              <span className="flex-1" />
              <button
                type="button"
                onClick={bewaarVideo}
                disabled={bezig}
                className="btn-gold text-sm disabled:opacity-50"
              >
                {bezig ? "Bezig..." : "Toevoegen"}
              </button>
            </div>
          </div>
        )}

        {stap === "afbeelding" && (
          <div className="space-y-3">
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Bestand (JPG of PNG, max 5MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => setAfbBestand(e.target.files?.[0] ?? null)}
                className="text-sm text-cm-white"
              />
            </div>
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Alt-tekst (verplicht — beschrijf voor blinden)
              </label>
              <input
                type="text"
                value={afbAlt}
                onChange={(e) => setAfbAlt(e.target.value)}
                className="input-cm w-full text-sm"
              />
            </div>
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Titel boven plaatje (optioneel)
              </label>
              <input
                type="text"
                value={afbTitel}
                onChange={(e) => setAfbTitel(e.target.value)}
                className="input-cm w-full text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStap("type-keuze")}
                className="text-cm-white/60 hover:text-cm-white text-sm"
              >
                ← Terug
              </button>
              <span className="flex-1" />
              <button
                type="button"
                onClick={bewaarAfbeelding}
                disabled={bezig}
                className="btn-gold text-sm disabled:opacity-50"
              >
                {bezig ? "Uploaden..." : "Toevoegen"}
              </button>
            </div>
          </div>
        )}

        {stap === "pdf" && (
          <div className="space-y-3">
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Bestand (PDF, max 10MB)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfBestand(e.target.files?.[0] ?? null)}
                className="text-sm text-cm-white"
              />
            </div>
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Titel (verplicht)
              </label>
              <input
                type="text"
                value={pdfTitel}
                onChange={(e) => setPdfTitel(e.target.value)}
                className="input-cm w-full text-sm"
              />
            </div>
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Beschrijving (optioneel)
              </label>
              <textarea
                value={pdfBeschrijving}
                onChange={(e) => setPdfBeschrijving(e.target.value)}
                className="textarea-cm w-full text-sm"
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStap("type-keuze")}
                className="text-cm-white/60 hover:text-cm-white text-sm"
              >
                ← Terug
              </button>
              <span className="flex-1" />
              <button
                type="button"
                onClick={bewaarPdf}
                disabled={bezig}
                className="btn-gold text-sm disabled:opacity-50"
              >
                {bezig ? "Uploaden..." : "Toevoegen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript-check**

Run: `npx tsc --noEmit 2>&1 | grep -E "MediaToevoegen" | head -5`
Expected: errors over `/api/pagina-blokken*`-routes niet bestaand. Die maken we in Task 6.

- [ ] **Step 4: Commit**

```bash
git add components/cms/MediaToevoegenKnop.tsx components/cms/MediaToevoegenModal.tsx
git commit -m "feat(cms): MediaToevoegenKnop + MediaToevoegenModal

'+ media hier'-knop opent modal met type-keuze (video/afbeelding/pdf)
en daarna type-specifieke invoer-flow. Klikt door naar /api/pagina-
blokken en /api/pagina-blokken/upload (volgen in Task 6).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: API-routes (POST + DELETE + PATCH + Upload)

**Files:**
- Create: `app/api/pagina-blokken/route.ts`
- Create: `app/api/pagina-blokken/[id]/route.ts`
- Create: `app/api/pagina-blokken/upload/route.ts`

- [ ] **Step 1: POST /api/pagina-blokken**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const {
      pagina_namespace,
      pagina_id,
      positie,
      type,
      inhoud,
      storage_pad,
    } = body;

    if (!pagina_namespace || !pagina_id || !positie || !type || !inhoud) {
      return NextResponse.json(
        { error: "Vereiste velden ontbreken" },
        { status: 400 },
      );
    }
    if (!["video", "afbeelding", "pdf"].includes(type)) {
      return NextResponse.json({ error: "Ongeldig type" }, { status: 400 });
    }

    // Bepaal volgende volgorde-waarde voor deze positie
    const { data: bestaande } = await supabase
      .from("pagina_blokken")
      .select("volgorde")
      .eq("pagina_namespace", pagina_namespace)
      .eq("pagina_id", pagina_id)
      .eq("positie", positie)
      .order("volgorde", { ascending: false })
      .limit(1);
    const nieuweVolgorde =
      bestaande && bestaande.length > 0
        ? (bestaande[0] as { volgorde: number }).volgorde + 1
        : 0;

    const { data, error } = await supabase
      .from("pagina_blokken")
      .insert({
        pagina_namespace,
        pagina_id,
        positie,
        volgorde: nieuweVolgorde,
        type,
        inhoud,
        storage_pad: storage_pad ?? null,
        updated_by: user.id,
      })
      .select("id")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: (data as { id: string }).id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

- [ ] **Step 2: PATCH + DELETE /api/pagina-blokken/[id]**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const verplaats = body.verplaats as "omhoog" | "omlaag" | undefined;

    if (verplaats) {
      // Haal huidig blok op
      const { data: huidig } = await supabase
        .from("pagina_blokken")
        .select("pagina_namespace, pagina_id, positie, volgorde")
        .eq("id", id)
        .maybeSingle();
      if (!huidig) {
        return NextResponse.json(
          { error: "Blok niet gevonden" },
          { status: 404 },
        );
      }
      const h = huidig as {
        pagina_namespace: string;
        pagina_id: string;
        positie: string;
        volgorde: number;
      };

      // Vind buur in dezelfde positie
      const { data: buur } = await supabase
        .from("pagina_blokken")
        .select("id, volgorde")
        .eq("pagina_namespace", h.pagina_namespace)
        .eq("pagina_id", h.pagina_id)
        .eq("positie", h.positie)
        .filter(
          "volgorde",
          verplaats === "omhoog" ? "lt" : "gt",
          h.volgorde,
        )
        .order("volgorde", {
          ascending: verplaats === "omhoog" ? false : true,
        })
        .limit(1);
      if (!buur || buur.length === 0) {
        return NextResponse.json(
          { error: "Geen buur om mee te wisselen" },
          { status: 400 },
        );
      }
      const b = buur[0] as { id: string; volgorde: number };

      // Wissel via tijdelijke unique waarde om unique-conflict op (positie, volgorde) te
      // voorkomen — al hebben we geen unique-index, defensief patroon.
      await supabase
        .from("pagina_blokken")
        .update({ volgorde: -1 })
        .eq("id", id);
      await supabase
        .from("pagina_blokken")
        .update({ volgorde: h.volgorde })
        .eq("id", b.id);
      await supabase
        .from("pagina_blokken")
        .update({ volgorde: b.volgorde })
        .eq("id", id);
      return NextResponse.json({ ok: true });
    }

    // Andere PATCH-acties (bewerk inhoud) - voor nu alleen verplaats
    return NextResponse.json(
      { error: "Onbekende actie" },
      { status: 400 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    // Haal storage_pad op om bestand op te ruimen
    const { data: blok } = await supabase
      .from("pagina_blokken")
      .select("storage_pad")
      .eq("id", id)
      .maybeSingle();
    const storagePad = (blok as { storage_pad: string | null } | null)
      ?.storage_pad;

    // Bestand uit storage verwijderen (admin-client want service-role nodig)
    if (storagePad) {
      try {
        const admin = createAdminClient();
        await admin.storage.from("pagina-media").remove([storagePad]);
      } catch {
        // Niet kritiek; rij wordt zo verwijderd
      }
    }

    const { error } = await supabase
      .from("pagina_blokken")
      .delete()
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

- [ ] **Step 3: POST /api/pagina-blokken/upload**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_AFBEELDING_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const fd = await req.formData();
    const bestand = fd.get("bestand");
    const paginaNamespace = fd.get("paginaNamespace") as string | null;
    const paginaId = fd.get("paginaId") as string | null;

    if (!(bestand instanceof Blob) || !paginaNamespace || !paginaId) {
      return NextResponse.json(
        { error: "Ongeldige form-data" },
        { status: 400 },
      );
    }

    const ext = (bestand as File).name?.split(".").pop()?.toLowerCase();
    if (
      !ext ||
      !["jpg", "jpeg", "png", "pdf"].includes(ext)
    ) {
      return NextResponse.json(
        { error: "Alleen JPG, PNG of PDF" },
        { status: 400 },
      );
    }

    const isPdf = ext === "pdf";
    const max = isPdf ? MAX_PDF_BYTES : MAX_AFBEELDING_BYTES;
    if (bestand.size > max) {
      return NextResponse.json(
        {
          error: `Bestand te groot (max ${
            isPdf ? "10MB" : "5MB"
          })`,
        },
        { status: 413 },
      );
    }

    const id = crypto.randomUUID();
    const path = `${paginaNamespace}/${paginaId}/${id}.${ext}`;
    const buffer = Buffer.from(await bestand.arrayBuffer());

    const admin = createAdminClient();
    const { error: upErr } = await admin.storage
      .from("pagina-media")
      .upload(path, buffer, {
        contentType: bestand.type,
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json(
        { error: "Upload mislukt: " + upErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, storage_pad: path });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

- [ ] **Step 4: TypeScript-check + commit**

Run: `npx tsc --noEmit 2>&1 | grep -E "app/api/pagina-blokken" | head -10`
Expected: lege output of alleen errors die we elders zelf nog moeten fixen.

```bash
git add app/api/pagina-blokken/
git commit -m "feat(api): pagina-blokken POST/PATCH/DELETE + upload-route

- POST /api/pagina-blokken: nieuwe blok aanmaken, volgorde auto
- PATCH /api/pagina-blokken/[id]: verplaats omhoog/omlaag
- DELETE /api/pagina-blokken/[id]: blok + storage-bestand wissen
- POST /api/pagina-blokken/upload: file-upload (afbeelding/pdf),
  max 5MB image / 10MB pdf, returns storage_pad

Founder-only via RLS + extra role-check in route. Storage-cleanup
op DELETE via admin-client.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Integratie in /vandaag

**Files:**
- Modify: `app/vandaag/page.tsx`
- Modify: `app/vandaag/vandaag-flow.tsx`

- [ ] **Step 1: page.tsx — laad blokken**

In `app/vandaag/page.tsx`, voeg na het laden van overrides toe:

```typescript
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";

// ... binnen VandaagPagina, na uiOverrides + groetOverrides:
const paginaBlokken = await haalPaginaBlokken(
  supabase as never,
  "sprint-dag",
  String(dag),
);
```

En geef door aan VandaagFlow:

```tsx
<VandaagFlow
  ...
  uiOverrides={uiOverrides}
  groetOverrides={groetOverrides}
  paginaBlokken={Object.fromEntries(paginaBlokken)}
/>
```

- [ ] **Step 2: vandaag-flow.tsx — Props uitbreiden**

```tsx
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MediaBlokken } from "@/components/cms/MediaBlokken";

type Props = {
  // ... bestaande props
  paginaBlokken?: Record<string, Blok[]>;
};
```

In VandaagFlowInner:
```tsx
function VandaagFlowInner({
  // ... bestaande
  paginaBlokken = {},
}: Props) {
  const blokkenOpPositie = (positie: string): Blok[] =>
    paginaBlokken[positie] ?? [];
```

- [ ] **Step 3: MediaBlokken renderen op 5 posities**

In de INTRO-stap, helemaal bovenaan (vóór dag-nummer-text):
```tsx
<MediaBlokken
  paginaNamespace="sprint-dag"
  paginaId={String(dag.nummer)}
  positie="boven-titel"
  blokken={blokkenOpPositie("boven-titel")}
  isFounder={isFounder}
/>
```

Tussen `dag.titel`-EditableTekst en FilmInBlok:
```tsx
<MediaBlokken
  paginaNamespace="sprint-dag"
  paginaId={String(dag.nummer)}
  positie="boven-les"
  blokken={blokkenOpPositie("boven-les")}
  isFounder={isFounder}
/>
```

Tussen les-blok en taken-overzicht-card:
```tsx
<MediaBlokken
  paginaNamespace="sprint-dag"
  paginaId={String(dag.nummer)}
  positie="tussen-les-taken"
  blokken={blokkenOpPositie("tussen-les-taken")}
  isFounder={isFounder}
/>
```

In de TAAK-stap, vóór `huidigeTaak.uitleg`-EditableBlok:
```tsx
<MediaBlokken
  paginaNamespace="sprint-dag"
  paginaId={String(dag.nummer)}
  positie={`bij-taak.${huidigeTaak.id}`}
  blokken={blokkenOpPositie(`bij-taak.${huidigeTaak.id}`)}
  isFounder={isFounder}
/>
```

In de KLAAR-stap, vóór "Naar dashboard →"-link:
```tsx
<MediaBlokken
  paginaNamespace="sprint-dag"
  paginaId={String(dag.nummer)}
  positie="op-klaar-stap"
  blokken={blokkenOpPositie("op-klaar-stap")}
  isFounder={isFounder}
/>
```

- [ ] **Step 4: Build verificatie**

Run: `npm run build 2>&1 | tail -20`
Expected: build slaagt.

- [ ] **Step 5: Commit + push**

```bash
git add app/vandaag/page.tsx app/vandaag/vandaag-flow.tsx
git commit -m "feat(vandaag): MediaBlokken op 5 posities

VandaagPagina laadt nu pagina_blokken voor sprint-dag/{N} en geeft
ze door als Record<positie, Blok[]> aan VandaagFlow. VandaagFlow
rendert MediaBlokken op:
  - boven-titel (top van intro)
  - boven-les (tussen titel-blok en FilmInBlok)
  - tussen-les-taken (tussen les-card en taken-overzicht-card)
  - bij-taak.<taakId> (in taak-stap, vóór taak-uitleg)
  - op-klaar-stap (in klaar-stap, vóór dashboard-link)

In edit-modus krijgt founder '+ media hier'-knop op elke positie en
verplaats/verwijder-knoppen op bestaande blokken.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push origin main
```

---

## Task 8: Smoke-test op live site

**Files:** geen wijzigingen, alleen testen.

Wacht ~2 min op Vercel deploy.

- [ ] **Step 1: Founder-test**

Login als `raoulzeewijk@hotmail.com`, ga naar `/vandaag?dag=1`.

1. Edit-modus AAN.
2. Onder de titel staat een dunne goudstippellijn met "+ media hier". Klik.
3. Modal opent met drie keuzes (Video / Plaatje / PDF).
4. Kies **Video**. Plak `https://vimeo.com/123456789` (of een echte Vimeo-URL die je hebt). Toevoegen.
5. Refresh. Video verschijnt op de positie.
6. Test verplaats-knoppen ↑↓ als 'r meerdere blokken zijn.
7. Test verwijder-knop 🗑.
8. Klik nogmaals "+ media hier", kies **Plaatje**, upload een JPG/PNG met alt-text. Refresh, plaatje verschijnt.
9. Klik nogmaals "+ media hier", kies **PDF**, upload een PDF. Refresh, download-card verschijnt.

- [ ] **Step 2: Member-test**

Login als test-account `livingwithlv@outlook.com`. Ga naar /vandaag.

1. Geen "+ media hier"-knoppen zichtbaar.
2. Toegevoegde media (van founder-test) verschijnen wel — gewone view.
3. Klik op afbeelding → fullscreen. Klik op PDF → opent in nieuwe tab.

- [ ] **Step 3: Markeer succes of issues**

Als alles werkt: Ronde A van media-blokken is geslaagd. Volgende: Core hetzelfde patroon (Fase 2 + media-blokken Core).

Als iets mislukt: noteer welke stap, terug naar de relevante taak.

---

## Self-Review

**1. Spec coverage:**
- ✓ DB-tabel + RLS → Task 1
- ✓ Storage-bucket → Task 1
- ✓ Server-helper → Task 2
- ✓ Render-componenten (Video, Afbeelding, PDF) → Task 3
- ✓ MediaBlokken renderer + edit-controls → Task 4
- ✓ MediaToevoegenKnop + Modal → Task 5
- ✓ API-routes (POST, PATCH, DELETE, upload) → Task 6
- ✓ Integratie /vandaag op 5 posities → Task 7
- ✓ Smoke-test → Task 8

**2. Placeholder scan:** geen TBD/TODO; complete code-blokken in elke step.

**3. Type consistency:**
- `Blok`-type in lib/cms/pagina-blokken.ts wordt gebruikt in MediaBlokken.tsx, page.tsx, vandaag-flow.tsx — match ✓
- `BlokType`, `VideoInhoud`, `AfbeeldingInhoud`, `PdfInhoud` exports — match ✓
- API-route body-properties match wat MediaToevoegenModal stuurt — `pagina_namespace`, `pagina_id`, `positie`, `type`, `inhoud`, `storage_pad` ✓
- `paginaBlokken={Object.fromEntries(paginaBlokken)}` converteert Map naar Record voor client-prop. Map kan niet over Server→Client serialisatie heen — bewust kiezen voor Record. Vraagt match in vandaag-flow.tsx Props (Record<string, Blok[]>).

**4. Geen "Similar to Task N":** elke task is volledig.

---

## Done = Klaar voor user-review

8 taken, ~7-8 commits, geschatte tijd 5-6 uur. Resultaat: founders kunnen op /vandaag video's, plaatjes en PDFs plaatsen op 5 posities; members zien ze in hun gewone view. Volgende rondes: Audio + Quote (Ronde B), Core uitrol + Pro.
