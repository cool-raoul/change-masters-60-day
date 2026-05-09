"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ============================================================
// VoicePlayer, audio + optionele transcriptie voor spraakberichten.
//
// Gedrag (WhatsApp-stijl):
//   - Compact: audio-speler bovenaan, knopje 'Tekst' rechts ernaast
//   - Klik op 'Tekst' → transcriptie verschijnt onder de speler
//   - Voor eigen berichten (isEigen + berichtId): zichtbare 'aanpassen'-
//     knop alleen wanneer transcriptie open is. PATCH naar
//     /api/mini-eleva/bericht voor opslaan
//
// Reden voor compact-default: anders wordt elke chat met meerdere
// spraakberichten een flinke lap tekst en verlies je overzicht.
// ============================================================

type Props = {
  audioUrl: string;
  duurSeconden?: number | null;
  transcriptie?: string | null;
  /** Bericht-ID voor PATCH-call. Vereist voor edit-mogelijkheid. */
  berichtId?: string;
  /** Of de huidige gebruiker de afzender is. Bepaalt of edit-knop verschijnt. */
  isEigen?: boolean;
  /** Token voor prospect-auth, of invitationId voor member/sponsor-auth */
  token?: string;
  invitationId?: string;
  /** Callback na succesvolle update zodat parent kan refreshen */
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

  // FIX voor MediaRecorder-webm: streaming-opnames hebben geen duration
  // in de header, browser leest 'm dan als Infinity en stopt 't afspelen
  // bij wat 'ie eerst denkt dat 't einde is (vaak 4 sec).
  // Truc: zodra metadata is geladen, force seek naar het einde, daarna
  // terug naar 0. Browser scant zo de hele blob en weet de echte duur.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    let geseekt = false;

    function metadataGeladen() {
      if (!a) return;
      // Als browser geen geldige duration weet, force scan
      if (
        !geseekt &&
        (a.duration === Infinity ||
          isNaN(a.duration) ||
          a.duration === 0)
      ) {
        geseekt = true;
        try {
          a.currentTime = 1e101;
        } catch {
          // negeer, sommige browsers blokkeren absurde seeks
        }
      } else if (a.duration > 0 && isFinite(a.duration)) {
        setWerkelijkeDuur(a.duration);
      }
    }

    function tijdSeekFix() {
      if (!a) return;
      // Na de fake seek hebben we de echte duration
      if (a.duration > 0 && isFinite(a.duration)) {
        setWerkelijkeDuur(a.duration);
        a.currentTime = 0;
        a.removeEventListener("timeupdate", tijdSeekFix);
      }
    }

    a.addEventListener("loadedmetadata", metadataGeladen);
    a.addEventListener("durationchange", metadataGeladen);
    a.addEventListener("timeupdate", tijdSeekFix);

    return () => {
      a.removeEventListener("loadedmetadata", metadataGeladen);
      a.removeEventListener("durationchange", metadataGeladen);
      a.removeEventListener("timeupdate", tijdSeekFix);
    };
  }, [audioUrl]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (speelt) {
      a.pause();
    } else {
      a.play().catch(() => {
        // Autoplay-policy of dode URL, negeer
      });
    }
  }

  function formatTijd(s: number): string {
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

  // Gebruik werkelijke duur uit de audio-element (na seek-fix), valt
  // terug op de duur die we tijdens opname hebben gemeten
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
