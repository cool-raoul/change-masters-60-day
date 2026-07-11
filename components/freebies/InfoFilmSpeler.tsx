"use client";

import { useEffect, useRef } from "react";
import { normaliseerNaarEmbed, embedMetOpties } from "@/lib/films/embed";

// Watch-aware informatiefilm-speler voor de freebie. Detecteert wanneer de
// prospect de film ~90% / tot het einde heeft bekeken en vuurt dan EENMALIG de
// "film-bekeken"-trigger (prospect → Opvolgen + herinnering + push naar lid).
//
// Drie bronnen, elk met eigen detectie:
//   - youtube → YouTube IFrame API (polling tijdens playback + ENDED)
//   - vimeo   → @vimeo/player (timeupdate + ended)
//   - upload  → eigen <video> (onTimeUpdate + onEnded)

const DREMPEL = 0.9;

type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: { events?: { onStateChange?: (e: { data: number }) => void } },
  ) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number };
};

function ytNs(): YTNamespace | undefined {
  return (window as unknown as { YT?: YTNamespace }).YT;
}
function isYouTube(url: string) {
  return /youtube\.com\/embed\//.test(url);
}
function isVimeo(url: string) {
  return /player\.vimeo\.com\/video\//.test(url);
}
function metJsApi(url: string) {
  if (url.includes("enablejsapi=1")) return url;
  const sep = url.includes("?") ? "&" : "?";
  const origin =
    typeof window !== "undefined" ? `&origin=${window.location.origin}` : "";
  return `${url}${sep}enablejsapi=1${origin}`;
}

export function InfoFilmSpeler({
  soort,
  url,
  token,
  leadEmail,
}: {
  soort?: string | null;
  url?: string | null;
  token: string;
  leadEmail: string;
}) {
  const gevuurdRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Kijk-voortgang: verste punt + duur, periodiek naar de server zodat
  // het member op de kaart ziet hoeveel minuten er gekeken is.
  const maxSecRef = useRef(0);
  const durRef = useRef(0);
  const laatsteMeldRef = useRef(0);

  function stuur(afgekeken: boolean) {
    try {
      void fetch("/api/freebie-bot/film-bekeken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          token,
          leadEmail,
          seconden: Math.round(maxSecRef.current),
          duur: Math.round(durRef.current),
          afgekeken,
        }),
      });
    } catch {
      /* tracking mag de gebruiker niet storen */
    }
  }

  function noteerVoortgang(sec: number, dur: number) {
    if (!leadEmail) return;
    if (sec > maxSecRef.current) maxSecRef.current = sec;
    if (dur > 0) durRef.current = dur;
    // Voortgang-ping hooguit elke 15 seconden (tot 'afgekeken' vuurde).
    const nu = Date.now();
    if (!gevuurdRef.current && nu - laatsteMeldRef.current > 15000 && maxSecRef.current > 3) {
      laatsteMeldRef.current = nu;
      stuur(false);
    }
  }

  function vuurAf() {
    if (gevuurdRef.current) return;
    if (!leadEmail) return;
    gevuurdRef.current = true;
    stuur(true);
  }

  // Laatste stand meesturen als de prospect wegklikt of het tabblad sluit.
  useEffect(() => {
    function bijVertrek() {
      if (!gevuurdRef.current && leadEmail && maxSecRef.current > 3) stuur(false);
    }
    window.addEventListener("pagehide", bijVertrek);
    return () => {
      window.removeEventListener("pagehide", bijVertrek);
      bijVertrek();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadEmail]);

  const basis = url && soort !== "upload" ? normaliseerNaarEmbed(url) : null;
  const embed = basis ? embedMetOpties(basis) : undefined;
  const finalEmbed = embed && isYouTube(embed) ? metJsApi(embed) : embed;

  // YouTube IFrame API
  useEffect(() => {
    if (!finalEmbed || !isYouTube(finalEmbed)) return;
    let cancelled = false;

    function stopPolling() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    function startPolling() {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
          const dur = p.getDuration();
          const sec = p.getCurrentTime();
          noteerVoortgang(sec, dur || 0);
          if (dur && sec / dur >= DREMPEL) vuurAf();
        } catch {
          /* negeer */
        }
      }, 4000);
    }
    function init() {
      const YT = ytNs();
      if (cancelled || !iframeRef.current || !YT) return;
      try {
        playerRef.current = new YT.Player(iframeRef.current, {
          events: {
            onStateChange: (e) => {
              const ns = ytNs();
              if (!ns) return;
              if (e.data === ns.PlayerState.PLAYING) startPolling();
              else if (e.data === ns.PlayerState.ENDED) {
                stopPolling();
                vuurAf();
              } else stopPolling();
            },
          },
        });
      } catch {
        /* iframe blijft werken zonder tracking */
      }
    }

    if (ytNs()?.Player) {
      init();
    } else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      const w = window as unknown as { onYouTubeIframeAPIReady?: () => void };
      const vorige = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalEmbed]);

  // Vimeo Player SDK
  useEffect(() => {
    if (!finalEmbed || !isVimeo(finalEmbed) || !iframeRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@vimeo/player");
        if (cancelled || !iframeRef.current) return;
        const Player = (mod as { default?: unknown }).default ?? mod;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const player: any = new (Player as any)(iframeRef.current);
        let dur = 0;
        try {
          dur = await player.getDuration();
        } catch {
          dur = 0;
        }
        player.on("timeupdate", (d: { seconds?: number }) => {
          const sec = d?.seconds ?? 0;
          noteerVoortgang(sec, dur);
          if (dur && sec / dur >= DREMPEL) vuurAf();
        });
        player.on("ended", () => vuurAf());
      } catch {
        /* fallback: gewone iframe zonder tracking */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalEmbed]);

  if (!url || !soort) return null;

  if (soort === "upload") {
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#ead8a0] bg-black shadow-md">
        <video
          ref={videoRef}
          src={url}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full"
          onTimeUpdate={() => {
            const v = videoRef.current;
            if (!v) return;
            noteerVoortgang(v.currentTime, v.duration || 0);
            if (v.duration && v.currentTime / v.duration >= DREMPEL) vuurAf();
          }}
          onEnded={vuurAf}
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#ead8a0] bg-black shadow-md">
      <iframe
        ref={iframeRef}
        src={finalEmbed}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Informatiefilm"
      />
    </div>
  );
}
