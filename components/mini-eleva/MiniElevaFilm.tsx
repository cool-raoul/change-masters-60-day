"use client";

import { useEffect, useRef } from "react";

// ============================================================
// MiniElevaFilm — video-blok binnen de prospect-omgeving (/m/[token]).
//
// Net als de stuur-video's (prospect-film) gebeurt de "afgekeken"-detectie
// AUTOMATISCH op kijk-percentage via de YouTube IFrame API, niet via een
// knop. Zodra de prospect ~90% heeft gekeken (of de video eindigt) melden
// we dat token-gebaseerd aan /api/mini-eleva/film-afgekeken. Dat event
// notificeert de member én vuurt de warm-trigger (prospect → Opvolgen +
// herinnering). Herbruikbaar voor elke YouTube-video in mini-ELEVA.
//
// Pilot: alleen YouTube krijgt auto-tracking (Raoul embedt alles via
// YouTube). Andere providers spelen gewoon af zonder auto-trigger.
// ============================================================

declare global {
  interface Window {
    YT?: {
      Player: new (
        idOrElement: string | HTMLElement,
        opts: {
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { target: YTPlayer; data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
};

const POLL_MS = 5_000;
// Net als de stuur-video's: bij ~90% behandelen we 'm als afgekeken.
const AFGEKEKEN_DREMPEL_PCT = 90;

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com\/embed\//.test(url);
}

function metJsApi(url: string): string {
  if (url.includes("enablejsapi=1")) return url;
  const sep = url.includes("?") ? "&" : "?";
  const origin =
    typeof window !== "undefined" ? `&origin=${window.location.origin}` : "";
  return `${url}${sep}enablejsapi=1${origin}`;
}

export function MiniElevaFilm({
  token,
  embedUrl,
  titel,
  beschrijving,
  kopje = "🎬 Een goed begin: deze korte film",
}: {
  token: string;
  embedUrl: string;
  titel: string;
  beschrijving?: string | null;
  kopje?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const afgekekenVerstuurdRef = useRef(false);

  useEffect(() => {
    if (!isYouTubeUrl(embedUrl)) return;
    let cancelled = false;

    async function meldAfgekeken() {
      if (afgekekenVerstuurdRef.current) return;
      afgekekenVerstuurdRef.current = true;
      try {
        await fetch("/api/mini-eleva/film-afgekeken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, filmTitel: titel }),
          keepalive: true,
        });
      } catch {
        // Stil falen: tracking mag de prospect nooit storen.
      }
    }

    function stopPolling() {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    function startPolling() {
      if (pollIntervalRef.current) return;
      pollIntervalRef.current = setInterval(() => {
        const player = playerRef.current;
        if (!player) return;
        try {
          const cur = player.getCurrentTime();
          const dur = player.getDuration();
          if (!dur) return;
          const pct = Math.round((cur / dur) * 100);
          if (pct >= AFGEKEKEN_DREMPEL_PCT) {
            stopPolling();
            void meldAfgekeken();
          }
        } catch {
          // negeer
        }
      }, POLL_MS);
    }

    function init() {
      if (cancelled || !iframeRef.current || !window.YT) return;
      try {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event) => {
              if (!window.YT) return;
              const PS = window.YT.PlayerState;
              if (event.data === PS.PLAYING) {
                startPolling();
              } else if (
                event.data === PS.PAUSED ||
                event.data === PS.BUFFERING
              ) {
                stopPolling();
              } else if (event.data === PS.ENDED) {
                stopPolling();
                void meldAfgekeken();
              }
            },
          },
        });
      } catch {
        // iframe blijft gewoon werken zonder tracking
      }
    }

    if (window.YT && window.YT.Player) {
      init();
    } else {
      const bestaand = document.querySelector(
        'script[src*="youtube.com/iframe_api"]',
      );
      if (!bestaand) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      const vorige = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try {
          vorige?.();
        } catch {}
        init();
      };
    }

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [embedUrl, token, titel]);

  const finalEmbedUrl = isYouTubeUrl(embedUrl) ? metJsApi(embedUrl) : embedUrl;

  return (
    <div className="card space-y-3">
      <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
        {kopje}
      </h2>
      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-cm-border">
        <iframe
          ref={iframeRef}
          src={finalEmbedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={titel}
        />
      </div>
      {beschrijving && (
        <p className="text-cm-white/60 text-xs leading-relaxed">{beschrijving}</p>
      )}
    </div>
  );
}
