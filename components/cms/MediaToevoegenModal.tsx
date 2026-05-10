"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WavRecorder } from "@/lib/voice/wav-recorder";

// ============================================================
// MediaToevoegenModal, type-keuze + type-specifieke invoer-flow.
//
// Stap 1: type-keuze (video / afbeelding / pdf / audio / quote).
// Stap 2: invoer per type:
//   - video: URL-veld + optioneel titel → POST /api/pagina-blokken
//   - afbeelding: file + alt + titel → upload + POST
//   - pdf: file + titel + beschrijving → upload + POST
//   - audio: in-app opname (WavRecorder) + optioneel titel → upload + POST
//   - quote: tekst + optioneel bron → POST (geen upload)
// ============================================================

type Props = {
  paginaNamespace: string;
  paginaId: string;
  positie: string;
  onSluit: () => void;
};

type Stap = "type-keuze" | "video" | "afbeelding" | "pdf" | "audio" | "quote";

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

  // Audio-velden
  const [audioTitel, setAudioTitel] = useState("");
  const [audioOpnemen, setAudioOpnemen] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuur, setAudioDuur] = useState(0);
  const [audioTijd, setAudioTijd] = useState(0);
  const recorderRef = useRef<WavRecorder | null>(null);
  const audioTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioStartRef = useRef<number>(0);

  // Quote-velden
  const [quoteTekst, setQuoteTekst] = useState("");
  const [quoteBron, setQuoteBron] = useState("");

  // Cleanup audio-resources bij modal-sluit
  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.annuleer();
      } catch {
        // negeer
      }
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, []);

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

  async function startAudioOpname() {
    if (audioOpnemen || audioBlob) return;
    try {
      const recorder = new WavRecorder();
      await recorder.start();
      recorderRef.current = recorder;
      audioStartRef.current = Date.now();
      setAudioOpnemen(true);
      setAudioTijd(0);
      audioTimerRef.current = setInterval(() => {
        setAudioTijd(Math.round((Date.now() - audioStartRef.current) / 1000));
      }, 250);
    } catch {
      toast.error("Microfoon-toegang geweigerd of niet beschikbaar");
    }
  }

  async function stopAudioOpname() {
    if (!audioOpnemen) return;
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    setAudioOpnemen(false);
    const recorder = recorderRef.current;
    if (!recorder) return;
    try {
      const { blob, duurSeconden } = await recorder.stop();
      recorderRef.current = null;
      if (blob.size === 0) {
        toast.error("Geen audio opgenomen, probeer opnieuw");
        return;
      }
      setAudioBlob(blob);
      setAudioDuur(duurSeconden);
    } catch {
      toast.error("Opname-fout, probeer opnieuw");
    }
  }

  function annuleerAudio() {
    setAudioBlob(null);
    setAudioTijd(0);
    setAudioDuur(0);
  }

  async function bewaarAudio() {
    if (!audioBlob) {
      toast.error("Neem eerst iets op");
      return;
    }
    setBezig(true);
    try {
      // Upload als 'opname.wav' — server-route accepteert WAV
      const fd = new FormData();
      const file = new File([audioBlob], "opname.wav", { type: "audio/wav" });
      fd.append("bestand", file);
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
          type: "audio",
          inhoud: {
            titel: audioTitel.trim() || undefined,
            duur_seconden: audioDuur,
          },
          storage_pad: upData.storage_pad,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Toevoegen mislukt");
        return;
      }
      toast.success("Audio toegevoegd");
      onSluit();
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function bewaarQuote() {
    const tekst = quoteTekst.trim();
    if (!tekst) {
      toast.error("Quote-tekst is verplicht");
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
          type: "quote",
          inhoud: {
            tekst,
            bron: quoteBron.trim() || undefined,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Toevoegen mislukt");
        return;
      }
      toast.success("Quote toegevoegd");
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
                  : stap === "pdf"
                    ? "PDF toevoegen"
                    : stap === "audio"
                      ? "Voice-bericht opnemen"
                      : "Quote toevoegen"}
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
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setStap("video")}
              className="p-3 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-2xl mb-1">🎥</div>
              <div className="text-xs text-cm-white">Video</div>
              <div className="text-[10px] text-cm-white/60">Vimeo / YouTube</div>
            </button>
            <button
              type="button"
              onClick={() => setStap("afbeelding")}
              className="p-3 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-2xl mb-1">🖼</div>
              <div className="text-xs text-cm-white">Plaatje</div>
              <div className="text-[10px] text-cm-white/60">JPG/PNG ≤5MB</div>
            </button>
            <button
              type="button"
              onClick={() => setStap("pdf")}
              className="p-3 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-2xl mb-1">📄</div>
              <div className="text-xs text-cm-white">PDF</div>
              <div className="text-[10px] text-cm-white/60">≤10MB</div>
            </button>
            <button
              type="button"
              onClick={() => setStap("audio")}
              className="p-3 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-2xl mb-1">🎙</div>
              <div className="text-xs text-cm-white">Audio</div>
              <div className="text-[10px] text-cm-white/60">Inspreken</div>
            </button>
            <button
              type="button"
              onClick={() => setStap("quote")}
              className="p-3 rounded-lg border border-cm-border hover:border-cm-gold hover:bg-cm-gold/5 text-center"
            >
              <div className="text-2xl mb-1">💬</div>
              <div className="text-xs text-cm-white">Quote</div>
              <div className="text-[10px] text-cm-white/60">Citaat + bron</div>
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

        {stap === "audio" && (
          <div className="space-y-3">
            <p className="text-cm-white/70 text-xs italic">
              Spreek je voice-bericht direct in. Members kunnen 'm afspelen op
              de pagina.
            </p>

            {/* Opname-controls + status */}
            {!audioBlob && (
              <div className="bg-cm-surface-2/40 border border-cm-border rounded-lg p-4 flex items-center justify-center gap-3">
                {!audioOpnemen ? (
                  <button
                    type="button"
                    onClick={startAudioOpname}
                    className="btn-gold text-sm flex items-center gap-2"
                  >
                    🎙 Start opname
                  </button>
                ) : (
                  <>
                    <span className="text-red-400 animate-pulse text-2xl">⏺</span>
                    <span className="font-mono text-cm-white text-sm">
                      {audioTijd}s
                    </span>
                    <button
                      type="button"
                      onClick={stopAudioOpname}
                      className="bg-red-500/30 border border-red-500/40 text-red-200 hover:bg-red-500/40 text-sm px-3 py-1.5 rounded-lg"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
            )}

            {audioBlob && (
              <div className="bg-cm-surface-2/40 border border-cm-gold/30 rounded-lg p-3 flex items-center justify-between gap-2">
                <span className="text-cm-white text-sm">
                  ✓ Opname klaar ({audioDuur}s)
                </span>
                <button
                  type="button"
                  onClick={annuleerAudio}
                  className="text-cm-white/60 hover:text-cm-white text-xs"
                >
                  Opnieuw
                </button>
              </div>
            )}

            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Titel (optioneel)
              </label>
              <input
                type="text"
                value={audioTitel}
                onChange={(e) => setAudioTitel(e.target.value)}
                placeholder="Bijv. 'Hoi, even snel uitleggen'"
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
                onClick={bewaarAudio}
                disabled={bezig || !audioBlob}
                className="btn-gold text-sm disabled:opacity-50"
              >
                {bezig ? "Uploaden..." : "Toevoegen"}
              </button>
            </div>
          </div>
        )}

        {stap === "quote" && (
          <div className="space-y-3">
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Citaat-tekst (verplicht)
              </label>
              <textarea
                value={quoteTekst}
                onChange={(e) => setQuoteTekst(e.target.value)}
                placeholder="Bijv. 'Hoe je naar mensen kijkt voor de zin verandert hun antwoord.'"
                className="textarea-cm w-full text-sm leading-relaxed"
                rows={4}
                autoFocus
              />
            </div>
            <div>
              <label className="text-cm-white/70 text-xs block mb-1">
                Bron (optioneel)
              </label>
              <input
                type="text"
                value={quoteBron}
                onChange={(e) => setQuoteBron(e.target.value)}
                placeholder="Bijv. 'Eric Worre' of 'Les Brown'"
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
                onClick={bewaarQuote}
                disabled={bezig}
                className="btn-gold text-sm disabled:opacity-50"
              >
                {bezig ? "Bezig..." : "Toevoegen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
