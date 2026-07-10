"use client";

// ============================================================
// Chat met de Resetcode-Mentor in de founder-preview.
// Twee stemmen te proeven via de schakelaar: als klant (demo-
// naam Marieke, verwijst naar jou als begeleider) en als member
// die het programma zelf doet. Stateless: geschiedenis leeft
// alleen in dit scherm, er wordt niets opgeslagen.
// ============================================================

import { useRef, useState } from "react";

type Bericht = { rol: "gebruiker" | "mentor"; tekst: string };

export default function ResetMentorChat({ station }: { station: string }) {
  const [rol, setRol] = useState<"klant" | "member">("klant");
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function wisselRol(nieuw: "klant" | "member") {
    if (nieuw === rol) return;
    setRol(nieuw);
    setBerichten([]); // andere stem = vers gesprek
  }

  async function verstuur() {
    const vraag = invoer.trim();
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
        body: JSON.stringify({ vraag, station, rol, geschiedenis: historie }),
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
    <div className="card">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
          💬 Vraag het de Mentor
        </h2>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => wisselRol("klant")}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              rol === "klant"
                ? "bg-cm-gold text-cm-bg border-cm-gold font-semibold"
                : "border-cm-border text-cm-white/60 hover:text-cm-white"
            }`}
          >
            Als klant (Marieke)
          </button>
          <button
            onClick={() => wisselRol("member")}
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              rol === "member"
                ? "bg-cm-gold text-cm-bg border-cm-gold font-semibold"
                : "border-cm-border text-cm-white/60 hover:text-cm-white"
            }`}
          >
            Als member (zelf bezig)
          </button>
        </div>
      </div>
      <p className="text-cm-muted text-xs mt-1.5">
        {rol === "klant"
          ? "Zo klinkt de Mentor voor een klant: warme gids, en jij blijft als begeleider zichtbaar."
          : "Zo klinkt de Mentor voor een teamlid dat de reset zelf doet."}
      </p>

      <div
        ref={scrollRef}
        className="mt-4 max-h-96 overflow-y-auto space-y-3 pr-1"
      >
        {berichten.length === 0 && (
          <p className="text-cm-muted text-sm italic">
            Probeer bijvoorbeeld: {""}
            {rol === "klant"
              ? '"Ik heb hoofdpijn sinds gisteren, wat kan ik doen?" of "Mag ik tomaat?"'
              : '"Hoe leg ik straks het laden uit aan mijn eerste klant?" of "Mag ik koffie in fase 2?"'}
          </p>
        )}
        {berichten.map((b, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed rounded-lg px-3 py-2 whitespace-pre-wrap ${
              b.rol === "gebruiker"
                ? "bg-cm-gold/15 text-cm-white ml-8"
                : "bg-white/5 text-cm-white/90 mr-8"
            }`}
          >
            {b.tekst || (bezig && i === berichten.length - 1 ? "..." : "")}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              verstuur();
            }
          }}
          placeholder="Stel je vraag aan de Mentor..."
          className="flex-1 rounded-lg border border-cm-border bg-transparent px-3 py-2 text-sm text-cm-white placeholder:text-cm-muted focus:outline-none focus:border-cm-gold/60"
          disabled={bezig}
        />
        <button
          onClick={verstuur}
          disabled={bezig || !invoer.trim()}
          className="rounded-lg bg-cm-gold text-cm-bg px-4 py-2 text-sm font-bold disabled:opacity-40"
        >
          {bezig ? "..." : "Stuur"}
        </button>
      </div>
    </div>
  );
}
