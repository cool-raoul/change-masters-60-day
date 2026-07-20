"use client";

// Kennis-lus founder-scherm: open vragen beantwoorden + zelf kennis
// toevoegen. Elk beantwoord item zit direct in het Mentor-brein en de
// klant die de vraag stelde krijgt automatisch een terugkom-bericht.

import { useEffect, useState } from "react";

type KennisItem = {
  id: string;
  programma: string;
  vraag: string;
  antwoord: string | null;
  status: "open" | "beantwoord";
  bron: "klant" | "founder" | "controle";
  created_at: string;
  beantwoord_op: string | null;
  gegeven_antwoord: string | null;
  controle_reden: string | null;
};

const PROGRAMMA_LABEL: Record<string, string> = {
  darm: "🌿 Darmen in Balans",
  reset: "🔄 Holistic Reset",
  producten: "🏠 Dagelijkse basis",
  algemeen: "🌍 Algemeen",
};

export default function KennisClient() {
  const [items, setItems] = useState<KennisItem[]>([]);
  const [laden, setLaden] = useState(true);
  const [bezig, setBezig] = useState<string | null>(null);
  const [antwoorden, setAntwoorden] = useState<Record<string, string>>({});
  // Zelf toevoegen
  const [nieuwVraag, setNieuwVraag] = useState("");
  const [nieuwAntwoord, setNieuwAntwoord] = useState("");
  const [nieuwProgramma, setNieuwProgramma] = useState("algemeen");

  async function laadItems() {
    try {
      const res = await fetch("/api/resetcode/kennis");
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } finally {
      setLaden(false);
    }
  }
  useEffect(() => {
    laadItems();
  }, []);

  async function actie(body: Record<string, unknown>, sleutel: string) {
    setBezig(sleutel);
    try {
      const res = await fetch("/api/resetcode/kennis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) await laadItems();
    } finally {
      setBezig(null);
    }
  }

  const open = items.filter((i) => i.status === "open");
  const beantwoord = items.filter((i) => i.status === "beantwoord");

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-white">🧠 Mentor-kennis</h1>
      <p className="text-sm text-white/60 mt-1 leading-relaxed">
        Vragen waar de Mentor het antwoord niet op wist. Beantwoord ze hier:
        de Mentor kent het antwoord daarna direct, en de klant die de vraag
        stelde krijgt bij het volgende bezoek vanzelf een terugkom-bericht.
      </p>

      {/* Claim-vrije richtlijn, altijd in beeld */}
      <div className="mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-3">
        <p className="text-[13px] font-bold text-amber-300">
          ✍️ Schrijf claim-vrij
        </p>
        <p className="text-[12px] text-amber-100/80 leading-relaxed mt-1">
          Nooit zeggen wat een product of programma medisch DOET (geen
          genezen, oplossen, verhelpen). Wel: wat het brengt, hoe het in het
          programma zit, en wat de eigen ervaring van mensen is. De Mentor
          herhaalt jouw antwoord letterlijk richting klanten.
        </p>
      </div>

      {/* Open vragen */}
      <h2 className="text-base font-bold text-white mt-7 mb-2">
        Open vragen{" "}
        <span className="text-emerald-400">({laden ? "…" : open.length})</span>
      </h2>
      {!laden && open.length === 0 && (
        <p className="text-sm text-white/50">
          Niks open. De Mentor redt zich prima op dit moment. 💚
        </p>
      )}
      <div className="space-y-4">
        {open.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3"
          >
            <p className="text-[11px] text-white/50 mb-1">
              {PROGRAMMA_LABEL[item.programma] ?? item.programma} ·{" "}
              {new Date(item.created_at).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
              })}
              {item.bron === "controle" && (
                <span className="ml-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  🔍 waakhond: check dit antwoord
                </span>
              )}
            </p>
            <p className="text-[15px] font-semibold text-white leading-snug">
              “{item.vraag}”
            </p>
            {item.bron === "controle" && item.gegeven_antwoord && (
              <div className="mt-2 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2">
                <p className="text-[11px] font-bold text-amber-300 mb-1">
                  De Mentor antwoordde:
                </p>
                <p className="text-[13px] text-amber-100/80 leading-relaxed whitespace-pre-wrap">
                  {item.gegeven_antwoord}
                </p>
                {item.controle_reden && (
                  <p className="text-[11px] text-amber-300/70 mt-1.5">
                    Waarom gemeld: {item.controle_reden}
                  </p>
                )}
              </div>
            )}
            <textarea
              value={antwoorden[item.id] ?? ""}
              onChange={(e) =>
                setAntwoorden((a) => ({ ...a, [item.id]: e.target.value }))
              }
              placeholder={
                item.bron === "controle"
                  ? "Het juiste antwoord (gaat ook automatisch naar deze klant)…"
                  : "Jouw antwoord (de Mentor leert dit direct)…"
              }
              rows={3}
              className="mt-2 w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-[14px] text-white placeholder:text-white/40 focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() =>
                  actie(
                    {
                      actie: "beantwoord",
                      id: item.id,
                      antwoord: antwoorden[item.id] ?? "",
                    },
                    item.id,
                  )
                }
                disabled={bezig === item.id || !(antwoorden[item.id] ?? "").trim()}
                className="rounded-full bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-40"
              >
                {item.bron === "controle" ? "Corrigeer & leer ✓" : "Beantwoord & leer ✓"}
              </button>
              <button
                onClick={() => actie({ actie: "afwijzen", id: item.id }, item.id)}
                disabled={bezig === item.id}
                className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[13px] text-white/60 disabled:opacity-40"
              >
                {item.bron === "controle" ? "Antwoord was goed" : "Afwijzen"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Zelf toevoegen */}
      <h2 className="text-base font-bold text-white mt-8 mb-2">
        Zelf kennis toevoegen
      </h2>
      <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 space-y-2">
        <select
          value={nieuwProgramma}
          onChange={(e) => setNieuwProgramma(e.target.value)}
          className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-[13px] text-white focus:outline-none [color-scheme:dark]"
        >
          {Object.entries(PROGRAMMA_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          value={nieuwVraag}
          onChange={(e) => setNieuwVraag(e.target.value)}
          placeholder="De vraag (zoals een klant hem zou stellen)"
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-[14px] text-white placeholder:text-white/40 focus:outline-none"
        />
        <textarea
          value={nieuwAntwoord}
          onChange={(e) => setNieuwAntwoord(e.target.value)}
          placeholder="Het antwoord zoals de Mentor het mag geven"
          rows={3}
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-[14px] text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          onClick={async () => {
            await actie(
              {
                actie: "nieuw",
                vraag: nieuwVraag,
                antwoord: nieuwAntwoord,
                programma: nieuwProgramma,
              },
              "nieuw",
            );
            setNieuwVraag("");
            setNieuwAntwoord("");
          }}
          disabled={bezig === "nieuw" || !nieuwVraag.trim() || !nieuwAntwoord.trim()}
          className="rounded-full bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-40"
        >
          Toevoegen aan het Mentor-brein ✓
        </button>
      </div>

      {/* Beantwoord */}
      <h2 className="text-base font-bold text-white mt-8 mb-2">
        In het Mentor-brein{" "}
        <span className="text-emerald-400">({beantwoord.length})</span>
      </h2>
      <div className="space-y-3">
        {beantwoord.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3"
          >
            <p className="text-[11px] text-white/50 mb-1">
              {PROGRAMMA_LABEL[item.programma] ?? item.programma} ·{" "}
              {item.bron === "founder" ? "zelf toegevoegd" : "uit een klantvraag"}
            </p>
            <p className="text-[14px] font-semibold text-white leading-snug">
              “{item.vraag}”
            </p>
            <p className="text-[13px] text-emerald-100/80 leading-relaxed mt-1">
              {item.antwoord}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
