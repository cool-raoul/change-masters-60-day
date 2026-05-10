"use client";

import { useRef, useState } from "react";
import type { AudioInhoud } from "@/lib/cms/pagina-blokken";

// ============================================================
// AudioBlok, afspeelbare voice-memo of MP3.
//
// Speelt af via onze eigen proxy-route /api/pagina-blokken/stream/[id]
// (zelfde patroon als de mini-eleva voice-fix). Direct signed-URL
// werkt op iOS Safari onbetrouwbaar (range-request bug → ~5 sec
// cutoff). Proxy-route serveert met juiste Accept-Ranges + Content-
// Length headers, en speelt overal hetzelfde af.
// ============================================================

type Props = {
  inhoud: AudioInhoud;
  /** Streamen via onze eigen route; signed-URL kan range-bug geven */
  blokId: string;
};

export function AudioBlok({ inhoud, blokId }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speelt, setSpeelt] = useState(false);
  const [huidigeTijd, setHuidigeTijd] = useState(0);
  const [duur, setDuur] = useState<number>(inhoud.duur_seconden ?? 0);

  const streamUrl = `/api/pagina-blokken/stream/${blokId}`;

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (speelt) a.pause();
    else a.play().catch(() => {});
  }

  function formatTijd(s: number): string {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  }

  return (
    <div className="rounded-xl border border-cm-border bg-cm-surface-2/40 p-3 flex items-center gap-3">
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="auto"
        onPlay={() => setSpeelt(true)}
        onPause={() => setSpeelt(false)}
        onEnded={() => setSpeelt(false)}
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLAudioElement).duration;
          if (isFinite(d) && d > 0) setDuur(d);
        }}
        onTimeUpdate={(e) =>
          setHuidigeTijd((e.target as HTMLAudioElement).currentTime)
        }
      />
      <button
        type="button"
        onClick={togglePlay}
        className="bg-cm-gold/20 hover:bg-cm-gold/30 text-cm-gold rounded-full w-10 h-10 flex items-center justify-center text-base shrink-0"
        title={speelt ? "Pauzeer" : "Speel af"}
      >
        {speelt ? "⏸" : "▶"}
      </button>
      <div className="flex-1 min-w-0">
        {inhoud.titel && (
          <p className="text-cm-white text-sm font-medium truncate">
            {inhoud.titel}
          </p>
        )}
        <p className="text-cm-white/60 text-xs font-mono">
          {formatTijd(huidigeTijd)} {duur ? `/ ${formatTijd(duur)}` : ""}
        </p>
      </div>
    </div>
  );
}
