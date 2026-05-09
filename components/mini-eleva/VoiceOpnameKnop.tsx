"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ============================================================
// VoiceOpnameKnop, gedeelde component voor prospect/member/sponsor.
//
// MediaRecorder-API neemt audio op (webm/ogg afhankelijk van browser).
// Bij stop: blob naar /api/mini-eleva/voice-upload, krijgt audio_path
// + transcriptie terug, geeft die door aan de onUploaded-callback
// zodat de bovenliggende chat-UI er een bericht van kan maken.
//
// Werkt voor zowel ingelogde users (member/sponsor, geef invitationId)
// als voor niet-ingelogde prospects (geef token).
// ============================================================

const MAX_DUUR_MS = 180_000; // 3 minuten

type Props = {
  /** Voor member/sponsor */
  invitationId?: string;
  /** Voor prospect */
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
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef = useRef<number>(0);
  const tijdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      // cleanup
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {
          // negeer
        }
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        // Stream sluiten zodat het mic-icoon van de browser uitgaat
        stream.getTracks().forEach((t) => t.stop());
        const ruweMime = recorder.mimeType || "audio/webm";
        const ruweBlob = new Blob(chunksRef.current, { type: ruweMime });
        const duurMs = Date.now() - startRef.current;
        const duur = Math.round(duurMs / 1000);

        // FIX: MediaRecorder maakt webm-blobs zonder duration in de
        // EBML-header, browsers stoppen daardoor met afspelen na een
        // paar seconden. fix-webm-duration injecteert de echte duur
        // (in ms) in de header zodat afspelen volledig werkt. Voor
        // mp4 (Safari/iOS) is dit niet nodig, daar zit duration al in.
        let blob = ruweBlob;
        if (ruweMime.includes("webm")) {
          try {
            // fix-webm-duration is UMD, dynamic import geeft ofwel de
            // functie direct ofwel als .default. Cast via unknown
            // omdat de TS-types van het pakket niet stabiel zijn.
            type FixFn = (blob: Blob, durMs: number) => Promise<Blob>;
            const mod = await import("fix-webm-duration");
            const modAny = mod as unknown as Record<string, unknown>;
            const candidate =
              typeof modAny === "function"
                ? (modAny as unknown as FixFn)
                : (modAny.default as FixFn | undefined);
            if (typeof candidate === "function") {
              blob = await candidate(ruweBlob, duurMs);
            }
          } catch (err) {
            console.warn("[voice-opname] webm-duration fix mislukt:", err);
            // Val terug op de ruwe blob, transcriptie werkt wel,
            // alleen afspelen kan vroegtijdig stoppen
          }
        }

        await uploadAudio(blob, duur);
      };

      recorderRef.current = recorder;
      startRef.current = Date.now();
      recorder.start();
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

  function stopOpname() {
    if (!opnemen) return;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (tijdInterval.current) clearInterval(tijdInterval.current);
    if (autoStopTimeout.current) clearTimeout(autoStopTimeout.current);
    setOpnemen(false);
  }

  async function uploadAudio(blob: Blob, duur: number) {
    setBezig(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob);
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
      title="Spraakbericht opnemen (max 3 min)"
      className="bg-cm-surface-2 hover:bg-cm-surface text-cm-gold text-base px-3 py-2 rounded-lg disabled:opacity-50"
    >
      🎤
    </button>
  );
}
