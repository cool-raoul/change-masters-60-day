"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================
// ProspectFilmClient, client-side render van de share-pagina.
//
// TRACKING:
//   - Bij iframe-onLoad: 'gestart' (idempotent op server)
//   - Bij YouTube PLAYING: polling elke 5s, percentage berekenen
//     uit getCurrentTime / getDuration. Sturen als monotoon stijgend.
//   - Bij percentage >= 90%: server triggert auto-afgekeken-flow.
//   - Bij CTA-klik: 'afgekeken' + bedankt-state.
//
// Voor pilot: alleen YouTube krijgt real-time tracking. Vimeo en
// andere providers blijven gestart/afgekeken-only (post-pilot uit te
// breiden via Vimeo Player API).
// ============================================================

type Props = {
  token: string;
  memberVoornaam: string;
  filmTitel: string;
  filmBeschrijving: string | null;
  embedUrl: string | null;
  voorbeeldIntro: string;
  callToAction: string;
  reedsAfgekeken: boolean;
  filmBeschikbaar: boolean;
};

const POLL_MS = 5_000;
const POST_DREMPEL_PCT = 5; // alleen posten als verschil > 5% met laatste post

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

function isYouTubeUrl(url: string | null): boolean {
  if (!url) return false;
  return /youtube\.com\/embed\//.test(url);
}

function metJsApi(url: string): string {
  // Voeg enablejsapi=1 + origin toe zodat YT.Player kan praten.
  if (url.includes("enablejsapi=1")) return url;
  const sep = url.includes("?") ? "&" : "?";
  const origin =
    typeof window !== "undefined" ? `&origin=${window.location.origin}` : "";
  return `${url}${sep}enablejsapi=1${origin}`;
}

export function ProspectFilmClient({
  token,
  memberVoornaam,
  filmTitel,
  filmBeschrijving,
  embedUrl,
  voorbeeldIntro,
  callToAction,
  reedsAfgekeken,
  filmBeschikbaar,
}: Props) {
  const [bedankt, setBedankt] = useState(reedsAfgekeken);
  const [bezig, setBezig] = useState(false);
  const startVerstuurdRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const laatstePostPctRef = useRef(0);

  async function markeer(
    actie: "gestart" | "afgekeken" | "percentage",
    extra?: { percentage?: number },
  ) {
    try {
      const body: { token: string; actie: string; percentage?: number } = {
        token,
        actie,
      };
      if (extra?.percentage !== undefined) body.percentage = extra.percentage;
      await fetch("/api/prospect-film/markeer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: actie !== "percentage",
      });
    } catch {
      // negeer, tracking mag de gebruiker niet storen
    }
  }

  function markeerGestart() {
    if (startVerstuurdRef.current) return;
    startVerstuurdRef.current = true;
    void markeer("gestart");
  }

  // YouTube IFrame API integratie
  useEffect(() => {
    if (!filmBeschikbaar || !embedUrl || !isYouTubeUrl(embedUrl)) return;

    let cancelled = false;

    function init() {
      if (cancelled || !iframeRef.current || !window.YT) return;
      try {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onReady: () => {
              markeerGestart();
            },
            onStateChange: (event) => {
              if (!window.YT) return;
              const PS = window.YT.PlayerState;
              if (event.data === PS.PLAYING) {
                markeerGestart();
                startPolling();
              } else if (
                event.data === PS.PAUSED ||
                event.data === PS.BUFFERING ||
                event.data === PS.ENDED
              ) {
                stopPolling();
                if (event.data === PS.ENDED) {
                  // Bij einde: post 100% (server triggert auto-afgekeken bij >=90%)
                  void markeer("percentage", { percentage: 100 });
                }
              }
            },
          },
        });
      } catch {
        // ignore, iframe blijft gewoon werken zonder tracking
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
          if (!dur || dur === 0) return;
          const pct = Math.round((cur / dur) * 100);
          if (pct - laatstePostPctRef.current >= POST_DREMPEL_PCT) {
            laatstePostPctRef.current = pct;
            void markeer("percentage", { percentage: pct });
          }
        } catch {
          // negeer
        }
      }, POLL_MS);
    }

    function stopPolling() {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    // Laad de YouTube IFrame API als die nog niet geladen is
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
      // Hook in op de globale ready-callback. Als er al een eerdere
      // handler stond (theoretisch), wikkel die in.
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
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [embedUrl, filmBeschikbaar]);

  async function markeerAfgekeken() {
    setBezig(true);
    try {
      await markeer("afgekeken");
      setBedankt(true);
    } catch {
      setBedankt(true);
    } finally {
      setBezig(false);
    }
  }

  const finalEmbedUrl =
    embedUrl && isYouTubeUrl(embedUrl) ? metJsApi(embedUrl) : embedUrl;

  return (
    <div className="min-h-screen bg-cm-bg text-cm-white px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          {memberVoornaam && (
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Een persoonlijke film van {memberVoornaam}
            </p>
          )}
          <h1 className="text-3xl font-display font-bold leading-tight">
            {filmTitel}
          </h1>
        </div>

        {/* Intro-tekst */}
        <p className="text-cm-white opacity-80 text-base leading-relaxed text-center">
          {voorbeeldIntro}
        </p>

        {/* Film-embed */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-cm-border">
          {filmBeschikbaar && finalEmbedUrl ? (
            <iframe
              ref={iframeRef}
              src={finalEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={filmTitel}
              onLoad={markeerGestart}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6">
              <p className="text-cm-white opacity-60 text-sm italic text-center">
                De film is op dit moment niet beschikbaar. Vraag{" "}
                {memberVoornaam || "de afzender"} of er een nieuwe link
                gestuurd kan worden.
              </p>
            </div>
          )}
        </div>

        {filmBeschrijving && (
          <p className="text-cm-white opacity-70 text-sm italic text-center">
            {filmBeschrijving}
          </p>
        )}

        {/* CTA: Ik heb 'm bekeken */}
        <div className="space-y-3 pt-2">
          {bedankt ? (
            <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-900/20 px-5 py-4 text-center space-y-1.5">
              <p className="text-emerald-300 font-semibold text-base">
                ✓ Bedankt dat je 'm gekeken hebt
              </p>
              <p className="text-cm-white opacity-80 text-sm">
                {memberVoornaam
                  ? `${memberVoornaam} ziet dat je 'm hebt bekeken en neemt binnenkort contact op om je vragen te beantwoorden.`
                  : "We laten je weten dat je 'm hebt bekeken, er wordt binnenkort contact opgenomen voor je vragen."}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={markeerAfgekeken}
              disabled={bezig || !filmBeschikbaar}
              className="btn-gold w-full py-4 text-base font-bold disabled:opacity-50"
            >
              {bezig ? "Bezig..." : `✓ ${callToAction}`}
            </button>
          )}
          <p className="text-cm-white opacity-50 text-xs text-center leading-relaxed">
            Je gegevens worden niet gedeeld of bewaard, alleen dat je de film
            hebt bekeken zodat {memberVoornaam || "de afzender"} weet dat 'ie
            kan opvolgen.
          </p>
        </div>
      </div>
    </div>
  );
}
