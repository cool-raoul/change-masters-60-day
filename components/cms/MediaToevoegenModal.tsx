"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// MediaToevoegenModal, type-keuze + type-specifieke invoer-flow.
//
// Stap 1: type-keuze (video / afbeelding / pdf).
// Stap 2: invoer per type:
//   - video: URL-veld + optioneel titel → POST /api/pagina-blokken
//   - afbeelding: file + alt + titel → upload + POST
//   - pdf: file + titel + beschrijving → upload + POST
// ============================================================

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
            aria-label="Sluit"
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
