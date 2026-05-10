"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ============================================================
// VoicePlayer, audio + optionele transcriptie voor spraakberichten.
//
// Speelt af via Web Audio API (decodeAudioData + AudioBufferSourceNode)
// in plaats van het standaard <audio>-element. Reden:
//
//   We hebben geverifieerd via scripts/check-wav.mjs dat WAV-files
//   echt de volle duur audio bevatten (RMS-energie meetbaar tot het
//   einde). Toch kapt <audio src=signedUrl> playback af bij ~5 sec
//   op ZOWEL iOS Safari als Chrome desktop. Een eerdere blob:-URL
//   workaround hielp niet betrouwbaar — vermoedelijk fetch-CORS-edge-
//   cases of <audio>-element bugs voor grote WAV-buffers.
//
//   Web Audio API decoder leest de hele ArrayBuffer in één keer en
//   geeft een AudioBuffer terug die in geheugen staat. AudioBuffer-
//   SourceNode speelt 'm af zonder enige range-protocol of HTML-
//   media-element. Werkt overal hetzelfde. Zelfde technologie die
//   we ook al gebruiken voor opname (WavRecorder).
//
// Tradeoffs:
//   - ~1 sec extra laad-tijd voor 2MB-bestand (download + decode)
//   - Pause/resume: Web Audio source-nodes zijn one-shot, dus we
//     stoppen + heronstarten met offset. Tijd-update via rAF-loop.
//   - Geen native scrubber-UI, maar dat hadden we toch al niet.
//
// Transcriptie-blok onderaan blijft ongewijzigd.
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
  // Player-state
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [laden, setLaden] = useState(true);
  const [laadFout, setLaadFout] = useState(false);
  const [speelt, setSpeelt] = useState(false);
  const [huidigeTijd, setHuidigeTijd] = useState(0);
  const [werkelijkeDuur, setWerkelijkeDuur] = useState<number>(
    duurSeconden ?? 0,
  );

  // Web Audio refs
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startCtxTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Transcriptie/edit-state
  const [tekstZichtbaar, setTekstZichtbaar] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [concept, setConcept] = useState(transcriptie ?? "");
  const [bezig, setBezig] = useState(false);
  const [lokaleTranscriptie, setLokaleTranscriptie] = useState(
    transcriptie ?? "",
  );

  // Download + decode op mount/url-change
  useEffect(() => {
    let levend = true;
    setLaden(true);
    setLaadFout(false);
    setAudioBuffer(null);
    setHuidigeTijd(0);
    setSpeelt(false);
    offsetRef.current = 0;

    void (async () => {
      try {
        const res = await fetch(audioUrl);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const arrayBuffer = await res.arrayBuffer();
        if (!levend) return;

        // AudioContext lazily aanmaken — sommige browsers willen 'm pas
        // na user-gesture, maar decodeAudioData werkt ook in een suspended
        // context.
        type CtxCtor = typeof AudioContext;
        const Ctor =
          (window as unknown as { AudioContext?: CtxCtor }).AudioContext ??
          (window as unknown as { webkitAudioContext?: CtxCtor })
            .webkitAudioContext;
        if (!Ctor) throw new Error("Geen AudioContext beschikbaar");
        if (!ctxRef.current) ctxRef.current = new Ctor();
        const ctx = ctxRef.current;

        // decodeAudioData accepteert zowel Promise- als callback-stijl;
        // moderne browsers retourneren een Promise.
        const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        if (!levend) return;
        setAudioBuffer(buffer);
        setWerkelijkeDuur(buffer.duration);
        setLaden(false);
      } catch (e) {
        console.warn("[voiceplayer] laden faalde:", e);
        if (!levend) return;
        setLaadFout(true);
        setLaden(false);
      }
    })();

    return () => {
      levend = false;
      // Stop alles bij unmount of audioUrl-change
      stopRafLoop();
      stopBron();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  function stopRafLoop() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function stopBron() {
    const src = sourceRef.current;
    if (src) {
      try {
        src.onended = null;
        src.stop();
        src.disconnect();
      } catch {
        // negeer als al gestopt
      }
      sourceRef.current = null;
    }
  }

  function startTijdUpdates() {
    stopRafLoop();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const tick = () => {
      if (!sourceRef.current) return;
      const verstreken = ctx.currentTime - startCtxTimeRef.current;
      const tijd = offsetRef.current + verstreken;
      setHuidigeTijd(tijd);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  async function speelAf() {
    const buffer = audioBuffer;
    const ctx = ctxRef.current;
    if (!buffer || !ctx) return;

    // Resume context als-ie suspended is (autoplay-policy)
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // negeer
      }
    }

    // Eventuele oude bron opruimen voor we nieuwe maken
    stopBron();

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    // Bereken vanaf welke offset we starten
    let offset = offsetRef.current;
    if (offset >= buffer.duration - 0.05) offset = 0; // restart aan einde
    offsetRef.current = offset;
    startCtxTimeRef.current = ctx.currentTime;

    src.onended = () => {
      // Alleen als we niet zelf hebben gestopt
      if (sourceRef.current !== src) return;
      sourceRef.current = null;
      setSpeelt(false);
      stopRafLoop();
      // Reset naar begin zodat volgende play opnieuw start
      offsetRef.current = 0;
      setHuidigeTijd(buffer.duration);
    };

    sourceRef.current = src;
    src.start(0, offset);
    setSpeelt(true);
    startTijdUpdates();
  }

  function pauzeer() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const verstreken = ctx.currentTime - startCtxTimeRef.current;
    offsetRef.current = offsetRef.current + verstreken;
    stopBron();
    stopRafLoop();
    setSpeelt(false);
  }

  function togglePlay() {
    if (!audioBuffer) return;
    if (speelt) pauzeer();
    else void speelAf();
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
      {/* Compacte rij: speler + tijd + Tekst-knop */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          disabled={laden || laadFout || !audioBuffer}
          title={
            laden
              ? "Audio laden..."
              : laadFout
                ? "Audio kon niet geladen worden"
                : speelt
                  ? "Pauzeer"
                  : "Speel af"
          }
          className="bg-cm-gold/20 hover:bg-cm-gold/30 text-cm-gold rounded-full w-9 h-9 flex items-center justify-center text-sm shrink-0 disabled:opacity-50"
        >
          {laden ? (
            <span className="animate-pulse text-xs">⏳</span>
          ) : laadFout ? (
            "⚠"
          ) : speelt ? (
            "⏸"
          ) : (
            "▶"
          )}
        </button>
        <div className="flex-1 text-xs text-cm-white/70 font-mono">
          {formatTijd(huidigeTijd)}
          {totaleDuur ? ` / ${formatTijd(totaleDuur)}` : ""}
          {laadFout && (
            <span className="ml-2 text-red-400/80">audio niet geladen</span>
          )}
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
