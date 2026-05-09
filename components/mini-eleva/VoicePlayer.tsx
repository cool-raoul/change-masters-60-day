"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ============================================================
// VoicePlayer, audio + optionele transcriptie voor spraakberichten.
//
// AudioContext-aanpak (geen <audio>-element):
//   MediaRecorder maakt webm-blobs zonder duration in de EBML-header.
//   <audio>-elementen stoppen daardoor met afspelen na ~4 sec.
//   Web Audio API decodeert de HELE blob naar PCM, dan weten we de
//   echte duration en kunnen we 't fragment volledig afspelen via
//   een AudioBufferSourceNode. Werkt voor alle browsers.
//
// Transcriptie: standaard verborgen, knop 'Tekst' opent 'm. Voor
// eigen berichten verschijnt een 'aanpassen'-knop.
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
  // Audio-state
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTijdRef = useRef<number>(0); // wall-clock bij play-start
  const offsetRef = useRef<number>(0); // huidige positie in audio (seconden)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [laden, setLaden] = useState(true);
  const [laadFout, setLaadFout] = useState(false);
  const [speelt, setSpeelt] = useState(false);
  const [huidigeTijd, setHuidigeTijd] = useState(0);
  const [werkelijkeDuur, setWerkelijkeDuur] = useState<number>(
    duurSeconden ?? 0,
  );

  // Transcriptie-state
  const [tekstZichtbaar, setTekstZichtbaar] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [concept, setConcept] = useState(transcriptie ?? "");
  const [bezig, setBezig] = useState(false);
  const [lokaleTranscriptie, setLokaleTranscriptie] = useState(
    transcriptie ?? "",
  );

  // Cleanup bij unmount
  useEffect(() => {
    return () => {
      stopTick();
      try {
        sourceRef.current?.stop();
      } catch {
        // negeer
      }
      try {
        audioContextRef.current?.close();
      } catch {
        // negeer
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTick() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  async function laadAudio(): Promise<AudioBuffer | null> {
    if (bufferRef.current) return bufferRef.current;
    try {
      // AudioContext lazy-init: pas bij eerste play (i.v.m. iOS gesture-vereiste)
      if (!audioContextRef.current) {
        type CtxCtor = typeof AudioContext;
        const Ctor =
          (window as unknown as { AudioContext?: CtxCtor }).AudioContext ??
          (window as unknown as { webkitAudioContext?: CtxCtor })
            .webkitAudioContext;
        if (!Ctor) throw new Error("Geen AudioContext beschikbaar");
        audioContextRef.current = new Ctor();
      }
      const ctx = audioContextRef.current;
      const res = await fetch(audioUrl);
      const buf = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(buf.slice(0));
      bufferRef.current = decoded;
      setWerkelijkeDuur(decoded.duration);
      setLaden(false);
      return decoded;
    } catch (e) {
      console.error("[voiceplayer] decode-fout:", e);
      setLaadFout(true);
      setLaden(false);
      return null;
    }
  }

  async function speelAf() {
    const ctx = audioContextRef.current;
    const buffer = bufferRef.current ?? (await laadAudio());
    if (!buffer || !audioContextRef.current) return;

    // Resume context (Chrome/iOS auto-suspend bij eerste interactie)
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    const ctxNu = audioContextRef.current;

    // Maak nieuwe source vanuit buffer
    const source = ctxNu.createBufferSource();
    source.buffer = buffer;
    source.connect(ctxNu.destination);
    source.onended = () => {
      // Natuurlijk einde of stop()-aanroep
      const eindReached = offsetRef.current >= buffer.duration - 0.05;
      sourceRef.current = null;
      setSpeelt(false);
      stopTick();
      if (eindReached) {
        offsetRef.current = 0;
        setHuidigeTijd(0);
      }
    };

    // Start vanaf de huidige offset
    const offset = Math.max(0, Math.min(offsetRef.current, buffer.duration));
    source.start(0, offset);
    sourceRef.current = source;
    startTijdRef.current = ctxNu.currentTime - offset;

    // Tick voor UI-update (10x per seconde)
    setSpeelt(true);
    stopTick();
    tickRef.current = setInterval(() => {
      const elapsed =
        (audioContextRef.current?.currentTime ?? 0) - startTijdRef.current;
      offsetRef.current = elapsed;
      setHuidigeTijd(elapsed);
      if (elapsed >= buffer.duration) {
        // Klaar
        offsetRef.current = 0;
        setHuidigeTijd(0);
        setSpeelt(false);
        stopTick();
        try {
          source.stop();
        } catch {
          // negeer (mogelijk al gestopt)
        }
      }
    }, 100);

    void ctx;
  }

  function pauzeer() {
    if (!sourceRef.current || !audioContextRef.current) return;
    // Onthoud waar we zijn, stop de bron
    const elapsed =
      audioContextRef.current.currentTime - startTijdRef.current;
    offsetRef.current = Math.max(0, elapsed);
    try {
      sourceRef.current.stop();
    } catch {
      // negeer
    }
    sourceRef.current = null;
    setSpeelt(false);
    stopTick();
  }

  function togglePlay() {
    if (speelt) {
      pauzeer();
    } else {
      void speelAf();
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
      {/* Compacte rij: speler + tijd + Tekst-knop */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          disabled={laadFout}
          className="bg-cm-gold/20 hover:bg-cm-gold/30 text-cm-gold rounded-full w-9 h-9 flex items-center justify-center text-sm shrink-0 disabled:opacity-50"
          title={laadFout ? "Audio kan niet geladen worden" : undefined}
        >
          {laadFout ? "✕" : speelt ? "⏸" : laden ? "..." : "▶"}
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
