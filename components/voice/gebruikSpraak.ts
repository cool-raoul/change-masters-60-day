"use client";

import { useEffect, useRef, useState } from "react";

type TaalCode = "nl" | "en" | "fr" | "es" | "de" | "pt";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setOndersteund(!!SR);
  }, []);

  function start() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setOndersteund(false);
      return false;
    }

    try {
      const rec = new SR();
      rec.lang = LOCALE_MAP[taal] || "nl-NL";
      rec.continuous = true;
      rec.interimResults = true;

      finalRef.current = "";
      setTranscript("");
      setInterim("");
      setSeconden(0);

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
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setToegang(false);
          actiefRef.current = false;
          setActief(false);
        }
      };

      rec.onend = () => {
        if (actiefRef.current) {
          try { rec.start(); } catch {}
        }
      };

      actiefRef.current = true;
      rec.start();
      recRef.current = rec;
      setActief(true);

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
    if (recRef.current) {
      try {
        recRef.current.onend = null;
        recRef.current.stop();
      } catch {}
      recRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const eind = (finalRef.current + " " + interim).trim();
    return eind;
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
      if (recRef.current) {
        try { recRef.current.onend = null; recRef.current.stop(); } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function huidigeTekst(): string {
    return (finalRef.current + " " + interim).trim();
  }

  return {
    actief, transcript, interim, seconden, ondersteund, toegang,
    start, stop, reset, huidigeTekst,
    setTranscript: (t: string) => { finalRef.current = t; setTranscript(t); },
  };
}
