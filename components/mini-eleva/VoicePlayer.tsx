"use client";

import { useRef, useState } from "react";

// ============================================================
// VoicePlayer, simpele audio-player voor spraakberichten in mini-
// ELEVA. Toont play/pause-knop + tijd + optionele transcriptie.
//
// audio_url is een signed URL van Supabase Storage die door de
// berichten-API wordt gegenereerd (1 uur geldig).
// ============================================================

type Props = {
  audioUrl: string;
  duurSeconden?: number | null;
  transcriptie?: string | null;
};

export function VoicePlayer({
  audioUrl,
  duurSeconden,
  transcriptie,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speelt, setSpeelt] = useState(false);
  const [huidigeTijd, setHuidigeTijd] = useState(0);
  const [transcriptZichtbaar, setTranscriptZichtbaar] = useState(false);

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

  const totaleDuur = duurSeconden ?? 0;

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
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className="bg-cm-gold/20 hover:bg-cm-gold/30 text-cm-gold rounded-full w-9 h-9 flex items-center justify-center text-sm"
        >
          {speelt ? "⏸" : "▶"}
        </button>
        <div className="flex-1 text-xs text-cm-white/70 font-mono">
          {formatTijd(huidigeTijd)}
          {totaleDuur ? ` / ${formatTijd(totaleDuur)}` : ""}
        </div>
        {transcriptie && (
          <button
            type="button"
            onClick={() => setTranscriptZichtbaar((v) => !v)}
            className="text-cm-white/40 hover:text-cm-white/70 text-[10px] uppercase tracking-wider"
          >
            {transcriptZichtbaar ? "Verberg" : "Tekst"}
          </button>
        )}
      </div>
      {transcriptZichtbaar && transcriptie && (
        <div className="text-xs text-cm-white/70 italic leading-snug bg-cm-surface rounded p-2">
          {transcriptie}
        </div>
      )}
    </div>
  );
}
