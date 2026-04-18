"use client";

import { useEffect, useRef, useState } from "react";

type TaalCode = "nl" | "en" | "fr" | "es" | "de" | "pt";

// Lifeplus wordt door spraakherkenning vaak verkeerd gehoord
// ("life plus", "lijf plus", "live plus", "leaf plus", etc.).
// We normaliseren alle varianten naar de officiële schrijfwijze "Lifeplus"
// vóór de tekst ergens anders gebruikt wordt (API, chat, UI).
export function normaliseerLifeplus(tekst: string): string {
  if (!tekst) return tekst;
  const patroon = /\b(life|lijf|live|leaf|laif|lief)[\s\-]?(plus|plas)\b/gi;
  return tekst.replace(patroon, "Lifeplus");
}

type Opties = {
  taal?: TaalCode | string;
  maxSeconden?: number;
  onMaxBereikt?: () => void;
};

// Kies de beste audio-codec die de browser ondersteunt. Whisper accepteert
// webm/opus (Chrome/Firefox), mp4/aac (Safari) en ogg. We laten de browser
// kiezen en sturen mime mee naar de server zodat die een passende bestands-
// extensie kan zetten.
function kiesMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const kandidaten = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const m of kandidaten) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      // oudere Safari gooit op isTypeSupported — negeren
    }
  }
  return undefined; // laat de browser default kiezen
}

export function gebruikSpraak({ taal = "nl", maxSeconden, onMaxBereikt }: Opties = {}) {
  const [actief, setActief] = useState(false);
  // Bij Whisper hebben we tijdens opname geen live transcript. transcript
  // wordt gevuld na server-ronde, en interim blijft leeg. We houden de
  // velden in de API om VoiceFab minimaal aan te passen.
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [seconden, setSeconden] = useState(0);
  const [ondersteund, setOndersteund] = useState(true);
  const [toegang, setToegang] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);
  const noSleepRef = useRef<any>(null);
  const actiefRef = useRef(false);

  // Promise die resolvet met de audio-Blob zodra MediaRecorder klaar is met
  // flushen. stop() wacht hierop zodat we het volledige bestand hebben.
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null);

  async function claimWakeLock() {
    const nav: any = navigator;
    if (nav?.wakeLock?.request) {
      try {
        wakeLockRef.current = await nav.wakeLock.request("screen");
        wakeLockRef.current?.addEventListener?.("release", () => {
          wakeLockRef.current = null;
        });
        return;
      } catch {
        // fallback hieronder
      }
    }
    try {
      if (!noSleepRef.current) {
        const NoSleepMod = await import("nosleep.js");
        const NoSleep = (NoSleepMod as any).default || NoSleepMod;
        noSleepRef.current = new NoSleep();
      }
      await noSleepRef.current.enable();
    } catch {
      // geen wake lock — opname werkt sowieso door
    }
  }

  async function releaseWakeLock() {
    try {
      await wakeLockRef.current?.release?.();
    } catch {}
    wakeLockRef.current = null;
    try {
      noSleepRef.current?.disable?.();
    } catch {}
  }

  // Re-claim wake lock als tab zichtbaar wordt en opname nog loopt
  useEffect(() => {
    if (typeof document === "undefined") return;
    function onVisible() {
      if (document.visibilityState === "visible" && actiefRef.current && !wakeLockRef.current) {
        claimWakeLock();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const heeftRecorder = typeof window.MediaRecorder !== "undefined";
    const heeftMedia = !!navigator?.mediaDevices?.getUserMedia;
    setOndersteund(heeftRecorder && heeftMedia);
  }, []);

  async function start(): Promise<boolean> {
    if (actiefRef.current) return false;

    if (typeof window === "undefined" ||
        typeof window.MediaRecorder === "undefined" ||
        !navigator?.mediaDevices?.getUserMedia) {
      setOndersteund(false);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mime = kiesMimeType();
      mimeRef.current = mime;
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blobMime = mimeRef.current || "audio/webm";
        const blob = chunksRef.current.length > 0
          ? new Blob(chunksRef.current, { type: blobMime })
          : null;
        const resolver = stopResolverRef.current;
        stopResolverRef.current = null;
        resolver?.(blob);
        // stream na stop opruimen — anders blijft mic-indicator aan
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.onerror = () => {
        setToegang(false);
        actiefRef.current = false;
        setActief(false);
      };

      // 1s timeslice: periodiek data flushen, geeft stabielere afsluiting
      recorder.start(1000);

      actiefRef.current = true;
      setActief(true);
      setTranscript("");
      setInterim("");
      setSeconden(0);
      claimWakeLock();

      if (maxSeconden) {
        timerRef.current = setInterval(() => {
          setSeconden((s) => {
            if (s + 1 >= maxSeconden) {
              // Timer direct stoppen zodat onMaxBereikt niet herhaaldelijk
              // vuurt (onMaxBereikt roept async stop() aan; tussen nu en de
              // echte stop zou de interval anders blijven tikken).
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              onMaxBereikt?.();
              return maxSeconden;
            }
            return s + 1;
          });
        }, 1000);
      }
      return true;
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        setToegang(false);
      } else {
        setOndersteund(false);
      }
      actiefRef.current = false;
      setActief(false);
      return false;
    }
  }

  // stop() is nu async: MediaRecorder moet data flushen + server moet
  // transcriberen. Resolvet met { tekst, fout } zodat VoiceFab echte server-
  // fouten kan tonen i.p.v. stille "Geen tekst opgevangen".
  async function stop(): Promise<{ tekst: string; fout: string | null }> {
    if (!actiefRef.current && !mediaRecorderRef.current) {
      return { tekst: "", fout: null };
    }
    actiefRef.current = false;
    setActief(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    releaseWakeLock();

    const recorder = mediaRecorderRef.current;
    const blobMime = mimeRef.current || "audio/webm";

    // Op iOS Safari vuurt onstop soms niet of heel laat. We race de onstop-
    // promise tegen een timeout en bouwen anders de blob uit de chunks die
    // we al via timeslice hebben ontvangen.
    const blobPromise = new Promise<Blob | null>((resolve) => {
      stopResolverRef.current = resolve;
    });

    try {
      // Forceer laatste chunk flush voor stop — helpt op Safari om data
      // niet te verliezen in het laatste partial frame.
      (recorder as any)?.requestData?.();
    } catch {
      // niet alle browsers ondersteunen requestData — stop() werkt alsnog
    }

    try {
      recorder?.stop();
    } catch {
      stopResolverRef.current = null;
    }

    const timeout = new Promise<Blob | null>((resolve) => {
      setTimeout(() => {
        // Fallback: bouw blob rechtstreeks uit de chunks die we al hebben.
        // Dit redt iOS Safari-sessies waar onstop niet vuurt.
        if (chunksRef.current.length > 0) {
          resolve(new Blob(chunksRef.current, { type: blobMime }));
        } else {
          resolve(null);
        }
      }, 4000);
    });

    const blob = await Promise.race([blobPromise, timeout]).catch(() => null);
    // Na de race moet de MediaRecorder sowieso opgeruimd worden
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    streamRef.current = null;
    mediaRecorderRef.current = null;
    stopResolverRef.current = null;

    if (!blob) {
      return { tekst: "", fout: "Geen audio opgenomen — check microfoon-toegang." };
    }
    if (blob.size < 1000) {
      return { tekst: "", fout: "Opname te kort of stil (check microfoon-volume)." };
    }

    // POST naar transcriptie-endpoint
    try {
      const form = new FormData();
      let ext = "webm";
      if (blob.type.includes("mp4") || blob.type.includes("m4a")) ext = "mp4";
      else if (blob.type.includes("ogg")) ext = "ogg";
      form.append("audio", blob, `opname.${ext}`);
      form.append("taal", String(taal));
      const res = await fetch("/api/voice-transcribe", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        let serverFout = `Server gaf ${res.status}`;
        try {
          const body = await res.json();
          if (body?.fout) serverFout = String(body.fout);
        } catch {
          // geen JSON — laat de status-tekst staan
        }
        console.warn("voice-transcribe faalde:", serverFout);
        return { tekst: "", fout: serverFout };
      }
      const data = await res.json();
      const tekst = typeof data?.tekst === "string" ? data.tekst : "";
      const genormaliseerd = normaliseerLifeplus(tekst);
      setTranscript(genormaliseerd);
      if (!genormaliseerd.trim()) {
        return { tekst: "", fout: "Whisper hoorde geen herkenbare spraak." };
      }
      return { tekst: genormaliseerd, fout: null };
    } catch (err: any) {
      console.warn("voice-transcribe error:", err);
      return { tekst: "", fout: err?.message || "Netwerkfout bij transcriberen." };
    }
  }

  function reset() {
    actiefRef.current = false;
    setActief(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    chunksRef.current = [];
    stopResolverRef.current = null;
    setTranscript("");
    setInterim("");
    setSeconden(0);
    setToegang(true);
    releaseWakeLock();
  }

  useEffect(() => {
    return () => {
      actiefRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        mediaRecorderRef.current?.stop();
      } catch {}
      streamRef.current?.getTracks().forEach((t) => t.stop());
      releaseWakeLock();
    };
  }, []);

  // In Whisper-flow is huidigeTekst tijdens opname altijd leeg (geen live
  // transcriptie). Pas ná stop() beschikbaar. VoiceFab gebruikt dit alleen
  // om de "Stop & bewerk"-knop te disablen bij lege opname; we kijken daarom
  // naar de opnameduur i.p.v. tekst.
  function huidigeTekst(): string {
    return transcript;
  }

  return {
    actief,
    transcript,
    interim,
    seconden,
    ondersteund,
    toegang,
    start,
    stop,
    reset,
    huidigeTekst,
    setTranscript: (t: string) => {
      setTranscript(t);
    },
  };
}
