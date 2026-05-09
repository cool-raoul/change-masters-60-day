"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WavRecorder } from "@/lib/voice/wav-recorder";

// ============================================================
// VoiceOpnameKnop, gedeelde component voor prospect/member/sponsor.
//
// Gebruikt WavRecorder (PCM via Web Audio API + handgemaakte WAV-
// encoder) i.p.v. MediaRecorder. Reden: MediaRecorder produceert
// webm-blobs zonder duration in de header, browsers stoppen daardoor
// met afspelen na ~4 sec. WAV heeft duration in de RIFF-header en
// werkt cross-browser zonder fixes.
//
// Limiet: WAV is groot. Onze 5MB-cap betekent ~60 sec. Daarom
// MAX_DUUR_MS verlaagd van 3 min naar 60 sec.
// ============================================================

const MAX_DUUR_MS = 60_000;

type Props = {
  invitationId?: string;
  token?: string;
  onUploaded: (data: {
    audio_path: string;
    transcriptie: string;
    duur_seconden: number;
  }) => void;
  disabled?: boolean;
};

export function VoiceOpnameKnop({
  invitationId,
  token,
  onUploaded,
  disabled,
}: Props) {
  const [opnemen, setOpnemen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [tijd, setTijd] = useState(0);
  const recorderRef = useRef<WavRecorder | null>(null);
  const startRef = useRef<number>(0);
  const tijdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.annuleer();
      } catch {
        // negeer
      }
      if (tijdInterval.current) clearInterval(tijdInterval.current);
      if (autoStopTimeout.current) clearTimeout(autoStopTimeout.current);
    };
  }, []);

  async function startOpname() {
    if (opnemen || bezig || disabled) return;
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      toast.error("Microfoon niet beschikbaar in deze browser");
      return;
    }

    try {
      const recorder = new WavRecorder();
      await recorder.start();
      recorderRef.current = recorder;
      startRef.current = Date.now();
      setOpnemen(true);
      setTijd(0);

      tijdInterval.current = setInterval(() => {
        setTijd(Math.round((Date.now() - startRef.current) / 1000));
      }, 250);

      // Auto-stop na max-duur
      autoStopTimeout.current = setTimeout(() => {
        stopOpname();
      }, MAX_DUUR_MS);
    } catch {
      toast.error(
        "Geen toestemming voor microfoon. Open je browser-instellingen om 't aan te zetten.",
      );
    }
  }

  async function stopOpname() {
    if (!opnemen) return;
    if (tijdInterval.current) clearInterval(tijdInterval.current);
    if (autoStopTimeout.current) clearTimeout(autoStopTimeout.current);
    setOpnemen(false);

    const recorder = recorderRef.current;
    if (!recorder) return;

    try {
      const { blob, duurSeconden } = await recorder.stop();
      recorderRef.current = null;
      if (blob.size === 0) {
        toast.error("Geen audio opgenomen, probeer opnieuw");
        return;
      }
      await uploadAudio(blob, duurSeconden);
    } catch (err) {
      console.error("[voice-opname] stop-fout:", err);
      toast.error("Opname-fout, probeer opnieuw");
    }
  }

  async function uploadAudio(blob: Blob, duur: number) {
    setBezig(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "opname.wav");
      formData.append("duurSeconden", String(duur));
      if (token) formData.append("token", token);
      if (invitationId) formData.append("invitationId", invitationId);

      const res = await fetch("/api/mini-eleva/voice-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Upload mislukt");
        return;
      }
      onUploaded({
        audio_path: data.audio_path,
        transcriptie: data.transcriptie ?? "",
        duur_seconden: data.duur_seconden ?? duur,
      });
    } catch {
      toast.error("Verbindingsfout bij upload");
    } finally {
      setBezig(false);
      setTijd(0);
    }
  }

  if (bezig) {
    return (
      <button
        type="button"
        disabled
        className="bg-cm-surface-2 text-cm-white/60 text-xs px-3 py-2 rounded-lg flex items-center gap-2"
      >
        <span className="animate-pulse">📤</span> Bezig...
      </button>
    );
  }

  if (opnemen) {
    return (
      <button
        type="button"
        onClick={stopOpname}
        className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-500/30"
      >
        <span className="animate-pulse text-red-400">⏺</span>
        <span className="font-mono">{tijd}s</span>
        <span>Stop</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startOpname}
      disabled={disabled}
      title="Spraakbericht opnemen (max 60 sec)"
      className="bg-cm-surface-2 hover:bg-cm-surface text-cm-gold text-base px-3 py-2 rounded-lg disabled:opacity-50"
    >
      🎤
    </button>
  );
}
