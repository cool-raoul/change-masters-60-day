"use client";

// ============================================================
// Chat met de Resetcode-Mentor in de klant-look (licht, warm).
// - Twee stemmen via de schakelaar: als klant (demo Marieke) en
//   als member die het programma zelf doet.
// - Praatfunctie: microfoon-knop via de spraakherkenning van de
//   browser (Nederlands); het herkende zinnetje wordt direct
//   verstuurd. Werkt in Chrome, Edge en Safari; in browsers
//   zonder ondersteuning verdwijnt de knop vanzelf.
// - Stateless preview: geschiedenis leeft alleen in dit scherm.
// ============================================================

import { useEffect, useRef, useState } from "react";

type Bericht = { rol: "gebruiker" | "mentor"; tekst: string };

type SpraakHerkenner = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export default function ResetMentorChat({
  programma,
  station,
  accent,
}: {
  programma: string;
  station: string;
  /** Hoofdkleur van het programma (hex) voor knoppen en accenten. */
  accent: string;
}) {
  const [rol, setRol] = useState<"klant" | "member">("klant");
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [luistert, setLuistert] = useState(false);
  const [kanPraten, setKanPraten] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const herkennerRef = useRef<SpraakHerkenner | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpraakHerkenner;
      webkitSpeechRecognition?: new () => SpraakHerkenner;
    };
    setKanPraten(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function wisselRol(nieuw: "klant" | "member") {
    if (nieuw === rol) return;
    setRol(nieuw);
    setBerichten([]);
  }

  function startLuisteren() {
    if (luistert) {
      herkennerRef.current?.stop();
      return;
    }
    const w = window as unknown as {
      SpeechRecognition?: new () => SpraakHerkenner;
      webkitSpeechRecognition?: new () => SpraakHerkenner;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const herkenner = new Ctor();
    herkennerRef.current = herkenner;
    herkenner.lang = "nl-NL";
    herkenner.continuous = false;
    herkenner.interimResults = false;
    herkenner.onresult = (e) => {
      const zin = e.results[0]?.[0]?.transcript?.trim();
      if (zin) verstuur(zin);
    };
    herkenner.onend = () => setLuistert(false);
    herkenner.onerror = () => setLuistert(false);
    setLuistert(true);
    herkenner.start();
  }

  async function verstuur(tekstOverride?: string) {
    const vraag = (tekstOverride ?? invoer).trim();
    if (!vraag || bezig) return;
    setInvoer("");
    setBezig(true);
    const historie = berichten.slice(-8);
    setBerichten((b) => [
      ...b,
      { rol: "gebruiker", tekst: vraag },
      { rol: "mentor", tekst: "" },
    ]);

    try {
      const res = await fetch("/api/resetcode-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vraag,
          programma,
          station,
          rol,
          geschiedenis: historie,
        }),
      });
      if (!res.ok || !res.body) {
        const fout = await res.text().catch(() => "onbekende fout");
        setBerichten((b) => {
          const kopie = [...b];
          kopie[kopie.length - 1] = {
            rol: "mentor",
            tekst: `Er ging iets mis: ${fout}`,
          };
          return kopie;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let tekst = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        tekst += decoder.decode(value, { stream: true });
        const nu = tekst;
        setBerichten((b) => {
          const kopie = [...b];
          kopie[kopie.length - 1] = { rol: "mentor", tekst: nu };
          return kopie;
        });
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
    } catch {
      setBerichten((b) => {
        const kopie = [...b];
        kopie[kopie.length - 1] = {
          rol: "mentor",
          tekst: "De verbinding viel weg, probeer het nog een keer.",
        };
        return kopie;
      });
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-stone-200/70 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2
          className="font-bold text-base flex items-center gap-2"
          style={{ color: accent }}
        >
          <span className="text-xl">💬</span> Vraag het je Mentor
        </h2>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => wisselRol("klant")}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              rol === "klant"
                ? "text-white font-semibold border-transparent"
                : "border-stone-300 text-stone-500 hover:text-stone-700"
            }`}
            style={rol === "klant" ? { backgroundColor: accent } : undefined}
          >
            Als klant (Marieke)
          </button>
          <button
            onClick={() => wisselRol("member")}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              rol === "member"
                ? "text-white font-semibold border-transparent"
                : "border-stone-300 text-stone-500 hover:text-stone-700"
            }`}
            style={rol === "member" ? { backgroundColor: accent } : undefined}
          >
            Als member (zelf bezig)
          </button>
        </div>
      </div>
      <p className="text-stone-500 text-xs mt-1.5">
        Typ je vraag, of druk op de microfoon en praat gewoon.
      </p>

      <div
        ref={scrollRef}
        className="mt-4 max-h-96 overflow-y-auto space-y-3 pr-1"
      >
        {berichten.length === 0 && (
          <p className="text-stone-400 text-sm italic">
            Probeer bijvoorbeeld: {""}
            {rol === "klant"
              ? '"Ik heb hoofdpijn sinds gisteren, wat kan ik doen?" of "Mag ik koffie?"'
              : '"Hoe leg ik straks het laden uit aan mijn eerste klant?" of "Mag ik koffie in fase 2?"'}
          </p>
        )}
        {berichten.map((b, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed rounded-2xl px-4 py-2.5 whitespace-pre-wrap ${
              b.rol === "gebruiker"
                ? "text-white ml-10"
                : "bg-stone-100 text-stone-700 mr-10"
            }`}
            style={
              b.rol === "gebruiker" ? { backgroundColor: accent } : undefined
            }
          >
            {b.tekst || (bezig && i === berichten.length - 1 ? "..." : "")}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 items-center">
        <input
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              verstuur();
            }
          }}
          placeholder={luistert ? "Ik luister..." : "Stel je vraag..."}
          className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
          style={{ caretColor: accent }}
          disabled={bezig}
        />
        {kanPraten && (
          <button
            onClick={startLuisteren}
            disabled={bezig}
            title={luistert ? "Stop met luisteren" : "Praat tegen de Mentor"}
            className={`h-10 w-10 flex-shrink-0 rounded-full text-lg transition-all ${
              luistert ? "animate-pulse text-white" : "bg-stone-100 hover:bg-stone-200"
            } disabled:opacity-40`}
            style={luistert ? { backgroundColor: accent } : undefined}
          >
            🎙️
          </button>
        )}
        <button
          onClick={() => verstuur()}
          disabled={bezig || !invoer.trim()}
          className="rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          {bezig ? "..." : "Stuur"}
        </button>
      </div>
    </div>
  );
}
