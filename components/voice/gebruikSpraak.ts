"use client";

import { useEffect, useRef, useState } from "react";

type TaalCode = "nl" | "en" | "fr" | "es" | "de" | "pt";

// Lifeplus wordt door spraakherkenning vaak verkeerd gehoord
// ("life plus", "lijf plus", "live plus", "leaf plus", etc.).
// We normaliseren alle varianten naar de officiële schrijfwijze "Lifeplus"
// vóór de tekst ergens anders gebruikt wordt (API, chat, UI).
export function normaliseerLifeplus(tekst: string): string {
  if (!tekst) return tekst;
  // Case-insensitive varianten met optionele spatie/koppelteken in het midden.
  // Varianten: life plus, life-plus, lifeplus, lijf plus, lijfplus, live plus,
  //            leaf plus, laif plus, lifeplas, lief plus.
  const patroon = /\b(life|lijf|live|leaf|laif|lief)[\s\-]?(plus|plas)\b/gi;
  return tekst.replace(patroon, "Lifeplus");
}

const LOCALE_MAP: Record<string, string> = {
  nl: "nl-NL",
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
};

type Opties = {
  taal?: TaalCode | string;
  maxSeconden?: number;
  onMaxBereikt?: () => void;
};

export function gebruikSpraak({ taal = "nl", maxSeconden, onMaxBereikt }: Opties = {}) {
  const [actief, setActief] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [seconden, setSeconden] = useState(0);
  const [ondersteund, setOndersteund] = useState(true);
  const [toegang, setToegang] = useState(true);

  const recRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const finalRef = useRef("");
  const actiefRef = useRef(false);
  const wakeLockRef = useRef<any>(null);
  const noSleepRef = useRef<any>(null);
  // iOS Safari stopt SpeechRecognition elke ~30-60s automatisch. We herstarten
  // met een verse instance. Teller voorkomt oneindige loops bij stukke hardware.
  const herstartTellerRef = useRef(0);
  const laatsteHerstartRef = useRef(0);
  const herstartTimerRef = useRef<any>(null);

  async function claimWakeLock() {
    const nav: any = navigator;
    // Primair: Wake Lock API (iOS 16.4+, Android Chrome 84+, moderne desktops)
    if (nav?.wakeLock?.request) {
      try {
        wakeLockRef.current = await nav.wakeLock.request("screen");
        wakeLockRef.current?.addEventListener?.("release", () => {
          wakeLockRef.current = null;
        });
        return;
      } catch {
        // valt door naar NoSleep fallback
      }
    }
    // Fallback: NoSleep.js silent-video truc (oude iOS / Android-browsers zonder Wake Lock)
    try {
      if (!noSleepRef.current) {
        const NoSleepMod = await import("nosleep.js");
        const NoSleep = (NoSleepMod as any).default || NoSleepMod;
        noSleepRef.current = new NoSleep();
      }
      await noSleepRef.current.enable();
    } catch {
      // Geen van beide werkt — zeldzaam, maar opname loopt sowieso door
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

  // Als scherm kort zwart gaat (tab-wissel) dropt het OS de wake lock —
  // opnieuw claimen zodra de pagina weer zichtbaar is en opname nog loopt.
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
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setOndersteund(!!SR);
  }, []);

  // Maakt een verse SpeechRecognition-instance met alle handlers gebonden.
  // Wordt zowel bij eerste start als bij elke iOS-auto-stop aangeroepen.
  function maakRecognition(): any {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.lang = LOCALE_MAP[taal] || "nl-NL";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const stukje = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalRef.current += stukje + " ";
        } else {
          interimText += stukje;
        }
      }
      setTranscript(finalRef.current);
      setInterim(interimText);
    };

    rec.onerror = (event: any) => {
      // Fatale fouten: stop helemaal
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setToegang(false);
        actiefRef.current = false;
        setActief(false);
        return;
      }
      // Herstelbare fouten (no-speech, aborted, network, audio-capture):
      // niet stoppen, onend pakt de restart op.
    };

    rec.onend = () => {
      if (!actiefRef.current) return;

      // Rate-limit: als er >8 herstarts binnen 10 sec zijn, stop definitief
      const nu = Date.now();
      if (nu - laatsteHerstartRef.current < 10000) {
        herstartTellerRef.current += 1;
      } else {
        herstartTellerRef.current = 1;
      }
      laatsteHerstartRef.current = nu;

      if (herstartTellerRef.current > 8) {
        console.warn("Spraak: te veel herstarts binnen 10s, stop.");
        actiefRef.current = false;
        setActief(false);
        return;
      }

      // iOS heeft ~100ms nodig om audio-context te resetten.
      // Een nieuwe instance is stabieler dan dezelfde opnieuw starten.
      herstartTimerRef.current = setTimeout(() => {
        if (!actiefRef.current) return;
        const nieuweRec = maakRecognition();
        if (!nieuweRec) {
          actiefRef.current = false;
          setActief(false);
          return;
        }
        try {
          nieuweRec.start();
          recRef.current = nieuweRec;
        } catch (err: any) {
          // "InvalidStateError" komt voor als iets nog vasthangt — probeer nog 1x
          setTimeout(() => {
            if (!actiefRef.current) return;
            try {
              const extraRec = maakRecognition();
              extraRec?.start();
              recRef.current = extraRec;
            } catch {
              actiefRef.current = false;
              setActief(false);
            }
          }, 300);
        }
      }, 150);
    };

    return rec;
  }

  function start() {
    const rec = maakRecognition();
    if (!rec) {
      setOndersteund(false);
      return false;
    }

    try {
      finalRef.current = "";
      setTranscript("");
      setInterim("");
      setSeconden(0);
      herstartTellerRef.current = 0;
      laatsteHerstartRef.current = 0;

      actiefRef.current = true;
      rec.start();
      recRef.current = rec;
      setActief(true);
      claimWakeLock();

      if (maxSeconden) {
        timerRef.current = setInterval(() => {
          setSeconden((s) => {
            if (s + 1 >= maxSeconden) {
              stop();
              onMaxBereikt?.();
              return maxSeconden;
            }
            return s + 1;
          });
        }, 1000);
      }
      return true;
    } catch {
      setActief(false);
      actiefRef.current = false;
      return false;
    }
  }

  function stop(): string {
    actiefRef.current = false;
    setActief(false);
    if (herstartTimerRef.current) {
      clearTimeout(herstartTimerRef.current);
      herstartTimerRef.current = null;
    }
    if (recRef.current) {
      try {
        recRef.current.onend = null;
        recRef.current.onerror = null;
        recRef.current.onresult = null;
        recRef.current.stop();
      } catch {}
      recRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    releaseWakeLock();
    const eind = (finalRef.current + " " + interim).trim();
    return normaliseerLifeplus(eind);
  }

  function reset() {
    stop();
    setTranscript("");
    setInterim("");
    setSeconden(0);
    finalRef.current = "";
    setToegang(true);
  }

  useEffect(() => {
    return () => {
      actiefRef.current = false;
      if (herstartTimerRef.current) clearTimeout(herstartTimerRef.current);
      if (recRef.current) {
        try {
          recRef.current.onend = null;
          recRef.current.onerror = null;
          recRef.current.onresult = null;
          recRef.current.stop();
        } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
      releaseWakeLock();
    };
  }, []);

  function huidigeTekst(): string {
    return normaliseerLifeplus((finalRef.current + " " + interim).trim());
  }

  return {
    actief, transcript, interim, seconden, ondersteund, toegang,
    start, stop, reset, huidigeTekst,
    setTranscript: (t: string) => { finalRef.current = t; setTranscript(t); },
  };
}
