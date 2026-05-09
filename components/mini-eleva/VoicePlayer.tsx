"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

// ============================================================
// VoicePlayer, audio + optionele transcriptie voor spraakberichten.
//
// Spraakberichten worden nu als WAV opgenomen (zie WavRecorder), wat
// duration in de RIFF-header heeft. Standaard <audio>-element kan
// daardoor weer correct afspelen tot het einde, zonder seek-trucs of
// AudioContext-aanpak.
//
// Transcriptie staat standaard verborgen, knop 'Tekst' toont 'm.
// Eigen berichten kunnen ge-edit worden via de 'aanpassen'-knop.
// ============================================================

type Props = {
  audioUrl: string;
  duurSeconden?: number | null;
  transcriptie?: string | null;
  berichtId?: string;
  isEigen?: boolean;
  token?: string;
  invitationId?: string;
  onTranscriptieGeupdate?: (nieuwe: string) => void;
};

export function VoicePlayer({
  audioUrl,
  duurSeconden,
  transcriptie,
  berichtId,
  isEigen,
  token,
  invitationId,
  onTranscriptieGeupdate,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speelt, setSpeelt] = useState(false);
  const [huidigeTijd, setHuidigeTijd] = useState(0);
  const [werkelijkeDuur, setWerkelijkeDuur] = useState<number>(
    duurSeconden ?? 0,
  );
  const [tekstZichtbaar, setTekstZichtbaar] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [concept, setConcept] = useState(transcriptie ?? "");
  const [bezig, setBezig] = useState(false);
  const [lokaleTranscriptie, setLokaleTranscriptie] = useState(
    transcriptie ?? "",
  );

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (speelt) {
      a.pause();
    } else {
      a.play().catch((e) => {
        // Autoplay-policy of broken file
        console.warn("[voiceplayer] play-fout:", e);
      });
    }
  }

  function formatTijd(s: number): string {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  }

  async function slaOp() {
    if (!berichtId || bezig) return;
    const nieuwe = concept.trim();
    if (nieuwe === lokaleTranscriptie) {
      setBewerken(false);
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/bericht", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          berichtId,
          transcriptie: nieuwe,
          token,
          invitationId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      setLokaleTranscriptie(nieuwe);
      onTranscriptieGeupdate?.(nieuwe);
      setBewerken(false);
      toast.success("Tekst aangepast");
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function annuleer() {
    setConcept(lokaleTranscriptie);
    setBewerken(false);
  }

  const totaleDuur = werkelijkeDuur || (duurSeconden ?? 0);
  const kanBewerken = isEigen && berichtId;
  const heeftTranscriptie = !!lokaleTranscriptie;

  return (
    <div className="space-y-2">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setSpeelt(true)}
        onPause={() => setSpeelt(false)}
        onEnded={() => setSpeelt(false)}
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          if (isFinite(d) && d > 0) setWerkelijkeDuur(d);
        }}
        onTimeUpdate={(e) =>
          setHuidigeTijd((e.target as HTMLAudioElement).currentTime)
        }
      />

      {/* Compacte rij: speler + tijd + Tekst-knop */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className="bg-cm-gold/20 hover:bg-cm-gold/30 text-cm-gold rounded-full w-9 h-9 flex items-center justify-center text-sm shrink-0"
        >
          {speelt ? "⏸" : "▶"}
        </button>
        <div className="flex-1 text-xs text-cm-white/70 font-mono">
          {formatTijd(huidigeTijd)}
          {totaleDuur ? ` / ${formatTijd(totaleDuur)}` : ""}
        </div>
        {heeftTranscriptie && (
          <button
            type="button"
            onClick={() => setTekstZichtbaar((v) => !v)}
            className="text-cm-white/50 hover:text-cm-white text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-cm-surface/40 hover:bg-cm-surface"
          >
            {tekstZichtbaar ? "Verberg tekst" : "Tekst"}
          </button>
        )}
      </div>

      {/* Transcriptie, alleen tonen na klik */}
      {tekstZichtbaar && heeftTranscriptie && (
        <div>
          {bewerken ? (
            <div className="space-y-2">
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                disabled={bezig}
                rows={3}
                maxLength={4000}
                className="w-full bg-cm-surface border border-cm-gold/40 rounded p-2 text-xs text-cm-white resize-y focus:outline-none focus:border-cm-gold disabled:opacity-50"
                placeholder="Pas de transcriptie aan..."
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={slaOp}
                  disabled={bezig}
                  className="bg-cm-gold/20 hover:bg-cm-gold/30 text-cm-gold text-[11px] px-2 py-1 rounded disabled:opacity-50"
                >
                  {bezig ? "Bezig..." : "Opslaan"}
                </button>
                <button
                  type="button"
                  onClick={annuleer}
                  disabled={bezig}
                  className="text-cm-white/60 hover:text-cm-white text-[11px] px-2 py-1"
                >
                  Annuleer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-cm-white/80 leading-snug bg-cm-surface/60 rounded p-2 relative">
              <p className="whitespace-pre-wrap">{lokaleTranscriptie}</p>
              {kanBewerken && (
                <button
                  type="button"
                  onClick={() => setBewerken(true)}
                  title="Pas tekst aan als de transcriptie niet klopt"
                  className="mt-1 text-cm-white/40 hover:text-cm-gold text-[10px] uppercase tracking-wider"
                >
                  ✎ aanpassen
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
