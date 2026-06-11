"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { gebruikSpraak } from "@/components/voice/gebruikSpraak";

type Taal = "nl" | "en" | "fr" | "de" | "es" | "pt";
type Stem = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
type Avatar = "vrouw" | "man";

const TALEN: { code: Taal; label: string; vlag: string }[] = [
  { code: "nl", label: "Nederlands", vlag: "🇳🇱" },
  { code: "en", label: "English", vlag: "🇬🇧" },
  { code: "fr", label: "Français", vlag: "🇫🇷" },
  { code: "de", label: "Deutsch", vlag: "🇩🇪" },
  { code: "es", label: "Español", vlag: "🇪🇸" },
  { code: "pt", label: "Português", vlag: "🇵🇹" },
];

const STEMMEN: {
  code: Stem;
  label: string;
  karakter: string;
  geslacht: Avatar;
}[] = [
  { code: "nova", label: "Nova", karakter: "Warm, vrouwelijk, vriendelijk", geslacht: "vrouw" },
  { code: "shimmer", label: "Shimmer", karakter: "Helder, vrouwelijk, kalm", geslacht: "vrouw" },
  { code: "alloy", label: "Alloy", karakter: "Neutraal, evenwichtig", geslacht: "vrouw" },
  { code: "fable", label: "Fable", karakter: "Mannelijk, verhalend", geslacht: "man" },
  { code: "echo", label: "Echo", karakter: "Mannelijk, rustig", geslacht: "man" },
  { code: "onyx", label: "Onyx", karakter: "Mannelijk, diep, gezaghebbend", geslacht: "man" },
];

// Avatars wonen in onze eigen Supabase Storage zodat D-ID ze accepteert
// (D-ID eist URLs die eindigen op .jpg/.jpeg/.png, Unsplash heeft query-
// strings dus voldoet niet). Vervangbaar later door eigen merk-foto's of
// AI-gegenereerde ELEVA-avatars.
const AVATARS: Record<Avatar, { foto: string; alt: string }> = {
  vrouw: {
    foto: "https://qwwhsoewajefainleajo.supabase.co/storage/v1/object/public/talking-temp/avatars/vrouw.jpg",
    alt: "ELEVA Mentor, vrouwelijke avatar",
  },
  man: {
    foto: "https://qwwhsoewajefainleajo.supabase.co/storage/v1/object/public/talking-temp/avatars/man.jpg",
    alt: "ELEVA Mentor, mannelijke avatar",
  },
};

export default function SpraakMentorClient() {
  const [taalIn, setTaalIn] = useState<Taal>("nl");
  const [taalUit, setTaalUit] = useState<Taal>("nl");
  const [stem, setStem] = useState<Stem>("nova");
  const [avatar, setAvatar] = useState<Avatar>("vrouw");
  const [avatarHandmatig, setAvatarHandmatig] = useState(false);
  const [snelheid, setSnelheid] = useState(1);

  // Auto-pair avatar met stem, tenzij gebruiker zelf wisselt.
  useEffect(() => {
    if (avatarHandmatig) return;
    const stemRij = STEMMEN.find((s) => s.code === stem);
    if (stemRij && stemRij.geslacht !== avatar) {
      setAvatar(stemRij.geslacht);
    }
  }, [stem, avatar, avatarHandmatig]);
  const [tekst, setTekst] = useState("");
  const [vertaling, setVertaling] = useState("");
  const [vertaalt, setVertaalt] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMaakt, setAudioMaakt] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMaakt, setVideoMaakt] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string>("");
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

  async function maakVideo() {
    const bron = vertaling.trim() || tekst.trim();
    if (!bron) {
      toast.info("Eerst tekst inspreken of typen");
      return;
    }
    setVideoMaakt(true);
    setVideoUrl(null);
    setVideoStatus("Audio renderen...");

    async function leesAlsJsonOfTekst(res: Response) {
      const ruwe = await res.text();
      try {
        return { json: JSON.parse(ruwe) as any, ruwe };
      } catch {
        return { json: null as any, ruwe };
      }
    }

    try {
      // 1. Submit: server maakt TTS + upload + D-ID submit, returnt talkId
      const submitRes = await fetch("/api/talking-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tekst: bron, stem, snelheid, avatar }),
      });
      const { json: submitData, ruwe: submitRuwe } =
        await leesAlsJsonOfTekst(submitRes);
      if (!submitRes.ok || !submitData?.talkId) {
        toast.error(
          submitData?.fout ||
            `Submit mislukt (HTTP ${submitRes.status}): ${submitRuwe.slice(0, 200)}`,
          { duration: 12000 },
        );
        setVideoStatus("");
        setVideoMaakt(false);
        return;
      }
      const talkId = submitData.talkId;
      setVideoStatus("Avatar animeren...");

      // 2. Poll status elke 2s, max 60 pogingen (2 min) — D-ID is meestal
      // binnen 30s klaar, dit is een ruime marge.
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(
          `/api/talking-video?id=${encodeURIComponent(talkId)}`,
        );
        const { json: pollData, ruwe: pollRuwe } =
          await leesAlsJsonOfTekst(pollRes);
        if (!pollRes.ok) {
          toast.error(
            pollData?.fout ||
              `Polling mislukt (HTTP ${pollRes.status}): ${pollRuwe.slice(0, 200)}`,
            { duration: 12000 },
          );
          setVideoStatus("");
          setVideoMaakt(false);
          return;
        }
        if (pollData?.status === "done" && pollData.videoUrl) {
          setVideoUrl(pollData.videoUrl);
          setVideoStatus("");
          setVideoMaakt(false);
          toast.success("Pratende video klaar 🎬");
          return;
        }
        if (pollData?.status === "error" || pollData?.status === "rejected") {
          toast.error(
            `D-ID rendering mislukt: ${pollData.fout || "onbekend"}`,
            { duration: 12000 },
          );
          setVideoStatus("");
          setVideoMaakt(false);
          return;
        }
        if (i === 5) setVideoStatus("Laatste hand...");
        if (i === 15) setVideoStatus("Bijna klaar...");
      }
      toast.error("Video duurde te lang (2 min). Probeer opnieuw of kortere tekst.");
      setVideoStatus("");
      setVideoMaakt(false);
    } catch (e: any) {
      toast.error(e?.message || "Video maken mislukt");
      setVideoStatus("");
      setVideoMaakt(false);
    }
  }

  async function downloadVideo() {
    if (!videoUrl) return;
    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eleva-mentor-${taalUit}-${stem}.mp4`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      // CORS fallback: open in nieuw tabblad
      window.open(videoUrl, "_blank");
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
    setVideoUrl(null);
    setVideoStatus("");
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
          {/* Avatar-keuze, wisselt automatisch mee met stem-geslacht
              tenzij founder hier zelf klikt. */}
          <div className="flex gap-2">
            {(["vrouw", "man"] as Avatar[]).map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAvatar(a);
                  setAvatarHandmatig(true);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                  avatar === a
                    ? "border-cm-gold bg-cm-gold/15 text-cm-gold"
                    : "border-cm-border text-cm-white/60 hover:border-cm-gold/40"
                }`}
              >
                {a === "vrouw" ? "♀ Vrouwelijk" : "♂ Mannelijk"}
              </button>
            ))}
          </div>

          <div
            className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden ${
              speelt ? "scale-[1.02]" : ""
            } transition-transform duration-300`}
            style={{
              boxShadow: speelt
                ? "0 0 80px rgba(201,169,97,0.7), 0 0 40px rgba(245,233,196,0.45), 0 0 0 4px rgba(201,169,97,0.55) inset"
                : "0 0 40px rgba(201,169,97,0.35), 0 0 0 3px rgba(201,169,97,0.4) inset",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AVATARS[avatar].foto}
              alt={AVATARS[avatar].alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 110%, rgba(201,169,97,0.35) 0%, transparent 60%)",
              }}
            />
            {speelt && (
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  boxShadow: "0 0 100px 25px rgba(201,169,97,0.55)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur px-2.5 py-0.5 rounded-full">
              <p className="text-cm-gold text-[9px] tracking-widest uppercase font-bold">
                ELEVA Mentor
              </p>
            </div>
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
              disabled={audioMaakt || videoMaakt || (!tekst.trim() && !vertaling.trim())}
              className="btn-gold px-6"
            >
              {audioMaakt ? "Audio maken..." : audioUrl ? "Audio opnieuw" : "🎧 Maak audio"}
            </button>
            <button
              onClick={maakVideo}
              disabled={videoMaakt || audioMaakt || (!tekst.trim() && !vertaling.trim())}
              className="px-6 py-2 rounded-lg font-semibold text-sm bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              title="Maakt een pratende avatar-video via D-ID. Duurt 15-45 seconden."
            >
              {videoMaakt ? "🎬 Bezig..." : videoUrl ? "Video opnieuw" : "🎬 Pratende video"}
            </button>
            {audioUrl && (
              <button onClick={downloadAudio} className="btn-secondary">
                ⬇ Audio mp3
              </button>
            )}
            {videoUrl && (
              <button onClick={downloadVideo} className="btn-secondary">
                ⬇ Video mp4
              </button>
            )}
            <button onClick={reset} className="btn-secondary">
              Reset
            </button>
          </div>

          {videoMaakt && (
            <div className="bg-cm-surface border border-purple-500/40 rounded-xl px-4 py-3 max-w-lg w-full">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-cm-white text-sm font-semibold">
                    {videoStatus || "Video wordt gemaakt..."}
                  </p>
                  <p className="text-cm-white/60 text-xs">
                    D-ID synchroniseert mond en gezicht met je audio, dit duurt 15-45 seconden.
                  </p>
                </div>
              </div>
            </div>
          )}

          {videoUrl && (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full max-w-lg rounded-xl border border-cm-gold/30"
              onPlay={() => setSpeelt(true)}
              onPause={() => setSpeelt(false)}
              onEnded={() => setSpeelt(false)}
            />
          )}

          {audioUrl && !videoUrl && (
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
