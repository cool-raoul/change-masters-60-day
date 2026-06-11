"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { gebruikSpraak } from "@/components/voice/gebruikSpraak";

type Taal = "nl" | "en" | "fr" | "de" | "es" | "pt";
type Stem = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

const TALEN: { code: Taal; label: string; vlag: string }[] = [
  { code: "nl", label: "Nederlands", vlag: "🇳🇱" },
  { code: "en", label: "English", vlag: "🇬🇧" },
  { code: "fr", label: "Français", vlag: "🇫🇷" },
  { code: "de", label: "Deutsch", vlag: "🇩🇪" },
  { code: "es", label: "Español", vlag: "🇪🇸" },
  { code: "pt", label: "Português", vlag: "🇵🇹" },
];

const STEMMEN: { code: Stem; label: string; karakter: string }[] = [
  { code: "nova", label: "Nova", karakter: "Warm, vrouwelijk, vriendelijk" },
  { code: "shimmer", label: "Shimmer", karakter: "Helder, vrouwelijk, kalm" },
  { code: "alloy", label: "Alloy", karakter: "Neutraal, evenwichtig" },
  { code: "fable", label: "Fable", karakter: "Mannelijk, verhalend" },
  { code: "echo", label: "Echo", karakter: "Mannelijk, rustig" },
  { code: "onyx", label: "Onyx", karakter: "Mannelijk, diep, gezaghebbend" },
];

export default function SpraakMentorClient() {
  const [taalIn, setTaalIn] = useState<Taal>("nl");
  const [taalUit, setTaalUit] = useState<Taal>("nl");
  const [stem, setStem] = useState<Stem>("nova");
  const [snelheid, setSnelheid] = useState(1);
  const [tekst, setTekst] = useState("");
  const [vertaling, setVertaling] = useState("");
  const [vertaalt, setVertaalt] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMaakt, setAudioMaakt] = useState(false);
  const [transcribeert, setTranscribeert] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [speelt, setSpeelt] = useState(false);

  const spraak = gebruikSpraak({
    taal: taalIn,
    maxSeconden: 180,
    onMaxBereikt: () => stopOpnameEnTranscribeer(),
  });

  async function stopOpnameEnTranscribeer() {
    setTranscribeert(true);
    const { tekst: nieuwTranscript, fout } = await spraak.stop();
    setTranscribeert(false);
    if (fout) {
      toast.error(fout);
      return;
    }
    if (nieuwTranscript) {
      setTekst((huidig) => (huidig ? huidig + " " + nieuwTranscript : nieuwTranscript));
      setVertaling("");
      setAudioUrl(null);
    }
  }

  async function startOpname() {
    if (spraak.actief) {
      await stopOpnameEnTranscribeer();
      return;
    }
    spraak.reset();
    spraak.start();
  }

  async function vertaal() {
    if (!tekst.trim()) {
      toast.info("Eerst tekst inspreken of typen");
      return;
    }
    if (taalIn === taalUit) {
      setVertaling(tekst);
      return;
    }
    setVertaalt(true);
    try {
      const res = await fetch("/api/tts/vertaal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst, doel: taalUit }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.fout || "Vertaling mislukt");
        return;
      }
      setVertaling(data.vertaling);
      setAudioUrl(null);
    } catch (e: any) {
      toast.error(e?.message || "Vertaling mislukt");
    } finally {
      setVertaalt(false);
    }
  }

  async function maakAudio() {
    const bron = vertaling.trim() || tekst.trim();
    if (!bron) {
      toast.info("Eerst tekst inspreken of typen");
      return;
    }
    setAudioMaakt(true);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst: bron, stem, snelheid }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.fout || "Audio maken mislukt");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (e: any) {
      toast.error(e?.message || "Audio maken mislukt");
    } finally {
      setAudioMaakt(false);
    }
  }

  function downloadAudio() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `eleva-mentor-${taalUit}-${stem}.mp3`;
    a.click();
  }

  const teken = useCallback(() => {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const buffer = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(buffer);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barCount = 48;
    const barWidth = w / barCount / 1.6;
    const step = Math.floor(buffer.length / barCount);
    for (let i = 0; i < barCount; i++) {
      const v = buffer[i * step] / 255;
      const barHeight = Math.max(4, v * h * 0.9);
      const x = i * (w / barCount) + (w / barCount - barWidth) / 2;
      const y = (h - barHeight) / 2;
      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, "#f5e9c4");
      grad.addColorStop(1, "#c9a961");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
    rafRef.current = requestAnimationFrame(teken);
  }, []);

  function startVisualisatie() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audioCtxRef.current) {
      try {
        const AudioCtx =
          (window.AudioContext as any) || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      } catch {
        return;
      }
    }
    const ctx = audioCtxRef.current!;
    if (!sourceRef.current) {
      try {
        sourceRef.current = ctx.createMediaElementSource(audio);
      } catch {
        // al gekoppeld bij eerdere render, prima
      }
    }
    if (!analyserRef.current) {
      const an = ctx.createAnalyser();
      an.fftSize = 128;
      sourceRef.current?.connect(an);
      an.connect(ctx.destination);
      analyserRef.current = an;
    }
    if (ctx.state === "suspended") ctx.resume();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    teken();
  }

  function stopVisualisatie() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  function reset() {
    spraak.reset();
    setTekst("");
    setVertaling("");
    setAudioUrl(null);
    setSpeelt(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <p className="text-xs tracking-widest uppercase text-cm-gold/80">
          Founder-proeftuin
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-cm-white">
          Spraak → ELEVA Mentor-stem
        </h1>
        <p className="text-cm-white/60 text-sm">
          Spreek iets in, kies een taal en stem, en hoor de ELEVA Mentor het
          uitspreken. De basis voor founder-films, instructies en meertalige
          content zonder studio.
        </p>
      </header>

      <section className="card bg-cm-surface-2 border-cm-border space-y-4">
        <h2 className="font-semibold text-cm-white text-sm tracking-wide uppercase">
          1 · Spreek in
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={startOpname}
            disabled={transcribeert}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all ${
              spraak.actief
                ? "bg-red-600 text-white animate-pulse"
                : "bg-cm-gold text-cm-black hover:scale-105"
            } ${transcribeert ? "opacity-60 cursor-wait" : ""}`}
          >
            <span className="text-xl">{spraak.actief ? "⏹" : "🎙️"}</span>
            {spraak.actief
              ? `Stop opname (${spraak.seconden}s)`
              : transcribeert
                ? "Bezig met transcriberen..."
                : "Start opname"}
          </button>
          <label className="text-cm-white/70 text-sm flex items-center gap-2">
            <span>Spreek-taal:</span>
            <select
              value={taalIn}
              onChange={(e) => setTaalIn(e.target.value as Taal)}
              className="select-cm text-sm py-1.5"
              disabled={spraak.actief}
            >
              {TALEN.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.vlag} {t.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <textarea
          value={tekst}
          onChange={(e) => {
            setTekst(e.target.value);
            setVertaling("");
            setAudioUrl(null);
          }}
          rows={4}
          placeholder="Je transcript verschijnt hier. Je kunt 'm ook gewoon typen of na opname bewerken."
          className="textarea-cm w-full text-sm"
        />
        <p className="text-xs text-cm-white/40">
          {tekst.length} / 4000 tekens
        </p>
      </section>

      <section className="card bg-cm-surface-2 border-cm-border space-y-4">
        <h2 className="font-semibold text-cm-white text-sm tracking-wide uppercase">
          2 · Doel-taal (optioneel)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-cm-white/70 text-sm flex items-center gap-2">
            <span>Vertaal naar:</span>
            <select
              value={taalUit}
              onChange={(e) => {
                setTaalUit(e.target.value as Taal);
                setVertaling("");
                setAudioUrl(null);
              }}
              className="select-cm text-sm py-1.5"
            >
              {TALEN.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.vlag} {t.label}
                </option>
              ))}
            </select>
          </label>
          {taalIn !== taalUit && (
            <button
              onClick={vertaal}
              disabled={vertaalt || !tekst.trim()}
              className="btn-secondary text-sm"
            >
              {vertaalt ? "Vertalen..." : "Vertaal nu"}
            </button>
          )}
        </div>
        {vertaling && (
          <div className="bg-cm-surface border border-cm-gold/30 rounded-lg p-3">
            <p className="text-cm-gold text-xs uppercase tracking-wider mb-1">
              Vertaling
            </p>
            <textarea
              value={vertaling}
              onChange={(e) => {
                setVertaling(e.target.value);
                setAudioUrl(null);
              }}
              rows={3}
              className="w-full bg-transparent text-cm-white text-sm focus:outline-none resize-y"
            />
          </div>
        )}
      </section>

      <section className="card bg-cm-surface-2 border-cm-border space-y-4">
        <h2 className="font-semibold text-cm-white text-sm tracking-wide uppercase">
          3 · Stem & tempo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {STEMMEN.map((s) => (
            <button
              key={s.code}
              onClick={() => {
                setStem(s.code);
                setAudioUrl(null);
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                stem === s.code
                  ? "border-cm-gold bg-cm-gold/10"
                  : "border-cm-border bg-cm-surface hover:border-cm-gold/40"
              }`}
            >
              <p className="font-semibold text-cm-white text-sm">{s.label}</p>
              <p className="text-cm-white/55 text-xs mt-0.5">{s.karakter}</p>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm text-cm-white/70">
          <span>Tempo:</span>
          <input
            type="range"
            min={0.7}
            max={1.3}
            step={0.05}
            value={snelheid}
            onChange={(e) => {
              setSnelheid(Number(e.target.value));
              setAudioUrl(null);
            }}
            className="flex-1 accent-cm-gold"
          />
          <span className="font-mono text-cm-gold w-12 text-right">
            {snelheid.toFixed(2)}×
          </span>
        </label>
      </section>

      <section className="card bg-gradient-to-br from-cm-surface-2 to-cm-surface border-cm-gold/30 space-y-5">
        <h2 className="font-semibold text-cm-white text-sm tracking-wide uppercase">
          4 · ELEVA Mentor spreekt
        </h2>

        <div className="flex flex-col items-center gap-5 py-4">
          <div
            className={`relative w-44 h-44 rounded-full flex items-center justify-center ${
              speelt ? "animate-pulse" : ""
            }`}
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #f5e9c4 0%, #c9a961 40%, #6b4f1a 90%)",
              boxShadow:
                "0 0 60px rgba(201,169,97,0.45), 0 0 30px rgba(245,233,196,0.3) inset",
            }}
          >
            <div
              className="absolute inset-2 rounded-full bg-black/85 flex items-center justify-center"
              style={{
                boxShadow: "inset 0 0 30px rgba(201,169,97,0.4)",
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-1">🤖</div>
                <p className="text-cm-gold text-[10px] tracking-widest uppercase font-bold">
                  ELEVA Mentor
                </p>
              </div>
            </div>
            {speelt && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 0 80px 20px rgba(201,169,97,0.5)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={600}
            height={80}
            className="w-full max-w-lg h-20"
          />

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={maakAudio}
              disabled={audioMaakt || (!tekst.trim() && !vertaling.trim())}
              className="btn-gold px-6"
            >
              {audioMaakt ? "Audio maken..." : audioUrl ? "Opnieuw maken" : "🎧 Maak audio"}
            </button>
            {audioUrl && (
              <button onClick={downloadAudio} className="btn-secondary">
                ⬇ Download mp3
              </button>
            )}
            <button onClick={reset} className="btn-secondary">
              Reset
            </button>
          </div>

          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              onPlay={() => {
                setSpeelt(true);
                startVisualisatie();
              }}
              onPause={() => {
                setSpeelt(false);
                stopVisualisatie();
              }}
              onEnded={() => {
                setSpeelt(false);
                stopVisualisatie();
              }}
              className="w-full max-w-lg"
            />
          )}
        </div>
      </section>

      <section className="bg-cm-surface border border-cm-gold/20 rounded-xl p-4 text-sm text-cm-white/70 space-y-2">
        <p className="text-cm-gold font-semibold">Waarom dit zo krachtig is:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Spreek snel iets in, krijg een gepolijste mentor-stem terug</li>
          <li>Eén tekst, zes talen, dezelfde stem of een ander karakter</li>
          <li>
            MP3 downloaden, gebruiken in onboarding, films, instructies of als
            audio-bericht
          </li>
          <li>
            Toekomst: vervangt direct de plek waar nu films staan (MediaBlokken).
            Geen studio nodig, geen montage, geen Vimeo-upload
          </li>
        </ul>
      </section>
    </div>
  );
}
