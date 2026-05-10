"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  Blok,
  VideoInhoud,
  AfbeeldingInhoud,
  PdfInhoud,
  AudioInhoud,
  QuoteInhoud,
} from "@/lib/cms/pagina-blokken";
import { useEditModus } from "./EditModeContext";
import { VideoBlok } from "./blokken/VideoBlok";
import { AfbeeldingBlok } from "./blokken/AfbeeldingBlok";
import { PdfBlok } from "./blokken/PdfBlok";
import { AudioBlok } from "./blokken/AudioBlok";
import { QuoteBlok } from "./blokken/QuoteBlok";
import { MediaToevoegenKnop } from "./MediaToevoegenKnop";

// ============================================================
// MediaBlokken, rendert alle media-blokken voor één positie.
//
// In edit-modus tonen we een '+ media hier'-knop onderaan zodat
// founder een nieuwe blok kan toevoegen. Per blok ook bewerk- en
// verwijder-knoppen + verplaats-omhoog/-omlaag.
//
// Member-view (edit-modus uit, of niet-founder): geen knoppen,
// alleen de gerendere blokken zelf.
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
          {/* Render het blok zelf (per type) */}
          {blok.type === "video" && (
            <VideoBlok inhoud={blok.inhoud as VideoInhoud} />
          )}
          {blok.type === "afbeelding" && blok.bestand_url && (
            <AfbeeldingBlok
              inhoud={blok.inhoud as AfbeeldingInhoud}
              bestandUrl={blok.bestand_url}
            />
          )}
          {blok.type === "pdf" && blok.bestand_url && (
            <PdfBlok
              inhoud={blok.inhoud as PdfInhoud}
              bestandUrl={blok.bestand_url}
            />
          )}
          {blok.type === "audio" && (
            <AudioBlok
              inhoud={blok.inhoud as AudioInhoud}
              blokId={blok.id}
            />
          )}
          {blok.type === "quote" && (
            <QuoteBlok inhoud={blok.inhoud as QuoteInhoud} />
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

      {/* + media hier (alleen voor founder in edit-modus) */}
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
