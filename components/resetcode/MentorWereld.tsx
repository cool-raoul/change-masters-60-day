"use client";

// ============================================================
// DE MENTOR-WERELD: de Resetcode-klantomgeving als één warm
// gesprek (gekozen richting D, Raoul 10 juli). Geen pagina's:
// de Mentor presenteert het programma en alle inhoud (regels,
// lijsten, video's, documenten, contactmomenten) verschijnt
// als kaartjes ín de chat. Praten via de grote microfoon staat
// centraal, typen kan ook.
//
// Preview-versie: stateless (niets wordt opgeslagen), met een
// klant/member-stem-schakelaar voor Raoul. Programma-keuze en
// fase-wissel gebeuren óók in het gesprek.
// ============================================================

import { useEffect, useRef, useState } from "react";
import {
  RESET_PROGRAMMAS,
  programmaVoor,
  stationVoor,
  type ResetProgramma,
  type ResetStation,
} from "@/lib/resetcode/programma";

type Kaart =
  | "regels"
  | "welniet"
  | "tips"
  | "video"
  | "documenten"
  | "contact"
  | "logi"
  | "vervolg"
  | "faq";

type ChatItem =
  | { van: "mentor"; soort: "tekst"; tekst: string }
  | { van: "mentor"; soort: "kaart"; kaart: Kaart; stationSlug: string }
  | { van: "mentor"; soort: "programma-keuze" }
  | { van: "ik"; soort: "tekst"; tekst: string };

type Chip = { label: string; actie: string };

type SpraakHerkenner = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms));

const LOGI_LAGEN = [
  { label: "ZELDEN", inhoud: "zoet, gebak, fastfood", breedte: "34%", kleur: "#C97B7B" },
  { label: "MET MATE", inhoud: "granen en volkoren", breedte: "56%", kleur: "#C9A15C" },
  { label: "REGELMATIG", inhoud: "vis, vlees, eieren, zuivel", breedte: "78%", kleur: "#7FA35E" },
  { label: "VAAK", inhoud: "groente en fruit", breedte: "100%", kleur: "#4E8F4B" },
];

export default function MentorWereld({
  begeleiderNaam,
}: {
  begeleiderNaam: string;
}) {
  const [rol, setRol] = useState<"klant" | "member">("klant");
  const [programma, setProgramma] = useState<ResetProgramma | null>(null);
  const [station, setStation] = useState<ResetStation | null>(null);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [luistert, setLuistert] = useState(false);
  const [kanPraten, setKanPraten] = useState(false);
  const [toonReis, setToonReis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const herkennerRef = useRef<SpraakHerkenner | null>(null);
  const gestart = useRef(false);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpraakHerkenner;
      webkitSpeechRecognition?: new () => SpraakHerkenner;
    };
    setKanPraten(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [items, chips, bezig]);

  // Openings-flow: welkom + programma-keuze in het gesprek.
  useEffect(() => {
    if (gestart.current) return;
    gestart.current = true;
    (async () => {
      setItems([
        {
          van: "mentor",
          soort: "tekst",
          tekst: "Hé, welkom! 🌿 Ik ben je Mentor. Ik ken jouw hele programma van begin tot eind en ik ben er altijd, dag en nacht. Praat gewoon tegen me of typ, wat jij fijn vindt.",
        },
      ]);
      await wacht(700);
      setItems((b) => [
        ...b,
        {
          van: "mentor",
          soort: "tekst",
          tekst: "Eerst even dit: welk programma ga jij doen? Jij en je begeleider hebben er samen eentje uitgekozen.",
        },
        { van: "mentor", soort: "programma-keuze" },
      ]);
    })();
  }, []);

  async function introStation(prog: ResetProgramma, st: ResetStation, opening?: string) {
    setChips([]);
    setStation(st);
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "tekst",
        tekst: opening ?? `${st.emoji} ${st.naam} · ${st.duur}`,
      },
    ]);
    await wacht(500);
    setItems((b) => [
      ...b,
      { van: "mentor", soort: "tekst", tekst: st.welkom },
    ]);
    await wacht(600);
    if (st.vandaagBelangrijk.length) {
      setItems((b) => [
        ...b,
        { van: "mentor", soort: "kaart", kaart: "regels", stationSlug: st.slug },
      ]);
      await wacht(450);
    }
    if (st.welLijst.length || st.nietLijst.length) {
      setItems((b) => [
        ...b,
        { van: "mentor", soort: "kaart", kaart: "welniet", stationSlug: st.slug },
      ]);
      await wacht(450);
    }
    if (st.graphic === "logi-piramide") {
      setItems((b) => [
        ...b,
        { van: "mentor", soort: "kaart", kaart: "logi", stationSlug: st.slug },
      ]);
      await wacht(450);
    }
    if (st.videoSlots.length) {
      setItems((b) => [
        ...b,
        { van: "mentor", soort: "kaart", kaart: "video", stationSlug: st.slug },
      ]);
      await wacht(450);
    }
    if (st.contactMoment) {
      setItems((b) => [
        ...b,
        { van: "mentor", soort: "kaart", kaart: "contact", stationSlug: st.slug },
      ]);
    }
    // Chips: verder ontdekken + vrije vraag-voorbeelden
    const nieuweChips: Chip[] = [];
    if (st.tips.length) nieuweChips.push({ label: "💡 Tips", actie: "tips" });
    if (st.documenten.length)
      nieuweChips.push({ label: "📂 Documenten", actie: "documenten" });
    if (st.veelgesteld.length)
      nieuweChips.push({ label: "❓ Vaak gevraagd", actie: "faq" });
    const i = prog.stations.findIndex((s) => s.slug === st.slug);
    if (i < prog.stations.length - 1)
      nieuweChips.push({
        label: `➡️ ${prog.stations[i + 1].naam}`,
        actie: `station:${prog.stations[i + 1].slug}`,
      });
    else nieuweChips.push({ label: "🎉 En daarna?", actie: "vervolg" });
    setChips(nieuweChips);
  }

  async function kiesProgramma(slug: string) {
    const prog = programmaVoor(slug);
    if (!prog) return;
    setProgramma(prog);
    setItems((b) => [
      ...b,
      { van: "ik", soort: "tekst", tekst: `Ik doe ${prog.naam} ${prog.emoji}` },
    ]);
    await wacht(500);
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "tekst",
        tekst: `Wat goed! ${prog.naam} dus: ${prog.payoff.toLowerCase()} Ik loop elke stap met je mee, samen met ${begeleiderNaam}. We beginnen bij het begin:`,
      },
    ]);
    await wacht(600);
    await introStation(prog, prog.stations[0]);
  }

  async function chipActie(actie: string) {
    if (!programma || !station) return;
    if (actie.startsWith("station:")) {
      const nieuw = stationVoor(programma.slug, actie.slice(8));
      if (!nieuw) return;
      setChips([]);
      setItems((b) => [
        ...b,
        { van: "ik", soort: "tekst", tekst: `Door naar ${nieuw.naam}!` },
      ]);
      await wacht(450);
      await introStation(
        programma,
        nieuw,
        `Yes, op naar de volgende stap! ${nieuw.emoji}`,
      );
      return;
    }
    if (actie === "tips" || actie === "documenten" || actie === "faq" || actie === "vervolg") {
      setChips((c) => c.filter((ch) => ch.actie !== actie));
      const kaart: Kaart = actie === "vervolg" ? "vervolg" : (actie as Kaart);
      setItems((b) => [
        ...b,
        { van: "mentor", soort: "kaart", kaart, stationSlug: station.slug },
      ]);
    }
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
    if (!vraag || bezig || !programma || !station) return;
    setInvoer("");
    setBezig(true);
    const historie = items
      .filter((i): i is Extract<ChatItem, { soort: "tekst" }> => i.soort === "tekst")
      .slice(-8)
      .map((i) => ({
        rol: i.van === "ik" ? ("gebruiker" as const) : ("mentor" as const),
        tekst: i.tekst,
      }));
    setItems((b) => [
      ...b,
      { van: "ik", soort: "tekst", tekst: vraag },
      { van: "mentor", soort: "tekst", tekst: "" },
    ]);

    try {
      const res = await fetch("/api/resetcode-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vraag,
          programma: programma.slug,
          station: station.slug,
          rol,
          geschiedenis: historie,
        }),
      });
      if (!res.ok || !res.body) {
        const fout = await res.text().catch(() => "onbekende fout");
        zetLaatsteMentorTekst(`Er ging iets mis: ${fout}`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let tekst = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        tekst += decoder.decode(value, { stream: true });
        zetLaatsteMentorTekst(tekst);
      }
    } catch {
      zetLaatsteMentorTekst("De verbinding viel even weg, probeer het nog een keer.");
    } finally {
      setBezig(false);
    }
  }

  function zetLaatsteMentorTekst(tekst: string) {
    setItems((b) => {
      const kopie = [...b];
      const laatste = kopie[kopie.length - 1];
      if (laatste && laatste.van === "mentor" && laatste.soort === "tekst") {
        kopie[kopie.length - 1] = { van: "mentor", soort: "tekst", tekst };
      }
      return kopie;
    });
  }

  // ---------- kaart-renderers ----------

  function Kaartje({ item }: { item: Extract<ChatItem, { soort: "kaart" }> }) {
    if (!programma) return null;
    const st = stationVoor(programma.slug, item.stationSlug);
    if (!st) return null;
    const kop = (emoji: string, titel: string) => (
      <p className="text-[12px] font-bold text-emerald-300 mb-1.5">
        {emoji} {titel}
      </p>
    );
    const kader =
      "mt-2 rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3";

    switch (item.kaart) {
      case "regels":
        return (
          <div className={kader}>
            {kop("✅", "De regels van nu")}
            <ul className="space-y-1.5">
              {st.vandaagBelangrijk.map((r, i) => (
                <li key={i} className="text-[12px] text-white/85 leading-relaxed flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">·</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        );
      case "welniet":
        return (
          <div className={kader}>
            {kop("🥦", "Wel en even niet")}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Mag lekker</p>
                {st.welLijst.map((w, i) => (
                  <p key={i} className="text-[11px] text-white/80 leading-relaxed">• {w}</p>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1">Even niet</p>
                {st.nietLijst.map((n, i) => (
                  <p key={i} className="text-[11px] text-white/70 leading-relaxed">• {n}</p>
                ))}
              </div>
            </div>
          </div>
        );
      case "tips":
        return (
          <div className={kader}>
            {kop("💡", "Tips van mensen die je voorgingen")}
            <ul className="space-y-1.5">
              {st.tips.map((t, i) => (
                <li key={i} className="text-[12px] text-white/85 leading-relaxed flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">·</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        );
      case "faq":
        return (
          <div className={kader}>
            {kop("❓", "Vaak gevraagd in deze fase")}
            <div className="space-y-2.5">
              {st.veelgesteld.map((v, i) => (
                <div key={i}>
                  <p className="text-[12px] font-semibold text-white/95">{v.vraag}</p>
                  <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">{v.antwoord}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "video":
        return (
          <div className={kader}>
            {kop("🎬", "Video bij deze fase")}
            {st.videoSlots.map((v, i) => (
              <div key={i} className="mt-1.5 rounded-xl bg-black/40 border border-dashed border-emerald-500/30 px-3 py-6 text-center">
                <p className="text-[12px] text-white/70">▶️ {v}</p>
                <p className="text-[9px] text-emerald-400/60 mt-1">plek staat klaar voor jouw video</p>
              </div>
            ))}
          </div>
        );
      case "documenten":
        return (
          <div className={kader}>
            {kop("📂", "Bij deze fase")}
            <div className="space-y-1.5">
              {st.documenten.map((d, i) => (
                <div key={i} className="rounded-xl bg-black/30 border border-dashed border-emerald-500/25 px-3 py-2">
                  <p className="text-[12px] font-semibold text-white/90">{d.titel}</p>
                  <p className="text-[10px] text-white/55">{d.omschrijving}</p>
                  <p className="text-[9px] text-emerald-400/60 mt-0.5">wordt een mooie in-chat kaart of graphic</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "contact":
        return (
          <div className={kader}>
            {kop("🤝", `Samen met ${begeleiderNaam}`)}
            <p className="text-[12px] text-white/85 leading-relaxed">{st.contactMoment}</p>
            <button
              className="mt-2.5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold text-white opacity-60 cursor-not-allowed"
              style={{ backgroundColor: "#25D366" }}
              title="Werkt straks: opent WhatsApp naar de begeleider"
            >
              📱 App {begeleiderNaam} <span className="text-[9px] font-normal">(straks)</span>
            </button>
          </div>
        );
      case "logi":
        return (
          <div className={kader}>
            {kop("🔺", "Jouw 80/20-kompas")}
            <div className="flex flex-col items-center gap-1 mt-1">
              {LOGI_LAGEN.map((laag) => (
                <div
                  key={laag.label}
                  className="rounded-lg py-1.5 px-2 text-center"
                  style={{ width: laag.breedte, backgroundColor: laag.kleur }}
                >
                  <p className="text-[9px] font-extrabold tracking-wider text-white/95">{laag.label}</p>
                  <p className="text-[10px] text-white/90">{laag.inhoud}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/50 text-center mt-1.5">hoe lager, hoe vaker op je bord</p>
          </div>
        );
      case "vervolg":
        return (
          <div className={kader}>
            {kop("🎉", "En daarna?")}
            <p className="text-[12px] text-white/85 leading-relaxed">{programma.vervolg}</p>
          </div>
        );
    }
  }

  // ---------- render ----------

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#0F1B17" }}>
      <style>{`
        @keyframes pols { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
        @keyframes verschijn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        .pols { animation: pols 2.2s ease-in-out infinite }
        .verschijn { animation: verschijn .35s ease-out both }
      `}</style>

      {/* Kop */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
        <div
          className="h-11 w-11 rounded-full flex items-center justify-center text-xl pols flex-shrink-0"
          style={{ background: "radial-gradient(circle,#34D399 0%,#059669 100%)" }}
        >
          🌿
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">Je Mentor</p>
          <p className="text-emerald-400/80 text-[10px]">
            altijd wakker · kent jouw hele reis
          </p>
        </div>
        {programma && station && (
          <button
            onClick={() => setToonReis((t) => !t)}
            className="ml-auto rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/85 hover:bg-white/15"
          >
            {station.emoji} Stap {station.nummer}/{programma.stations.length} ▾
          </button>
        )}
      </header>

      {/* Reis-overlay */}
      {toonReis && programma && (
        <div className="border-b border-white/10 bg-[#0A1512] px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {programma.stations.map((s) => (
              <button
                key={s.slug}
                onClick={() => {
                  setToonReis(false);
                  chipActie(`station:${s.slug}`);
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  s.slug === station?.slug
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                {s.emoji} {s.naam}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gesprek */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {items.map((item, i) => {
          if (item.van === "ik") {
            return (
              <div key={i} className="verschijn max-w-[80%] ml-auto rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-2.5">
                <p className="text-[13px] text-white leading-relaxed">{item.tekst}</p>
              </div>
            );
          }
          if (item.soort === "programma-keuze") {
            return (
              <div key={i} className="verschijn max-w-[92%] space-y-2">
                {RESET_PROGRAMMAS.map((prog) => (
                  <button
                    key={prog.slug}
                    onClick={() => !programma && kiesProgramma(prog.slug)}
                    disabled={Boolean(programma)}
                    className="w-full text-left rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3 hover:border-emerald-400/50 transition-colors disabled:opacity-50"
                  >
                    <p className="text-[13px] font-bold text-white">
                      {prog.emoji} {prog.naam}
                      <span className="text-emerald-400/80 font-semibold text-[10px] ml-2">{prog.duur}</span>
                    </p>
                    <p className="text-[11px] text-white/65 leading-relaxed mt-0.5">{prog.payoff}</p>
                  </button>
                ))}
              </div>
            );
          }
          if (item.soort === "kaart") {
            return (
              <div key={i} className="verschijn max-w-[92%]">
                <Kaartje item={item} />
              </div>
            );
          }
          return (
            <div key={i} className="verschijn max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-2.5">
              <p className="text-[13px] text-white/90 leading-relaxed whitespace-pre-wrap">
                {item.tekst || (bezig && i === items.length - 1 ? "..." : "")}
              </p>
            </div>
          );
        })}

        {/* Chips */}
        {chips.length > 0 && !bezig && (
          <div className="flex flex-wrap gap-1.5 pt-1 verschijn">
            {chips.map((chip) => (
              <button
                key={chip.actie}
                onClick={() => chipActie(chip.actie)}
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invoer */}
      <div className="px-4 pb-5 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          <input
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                verstuur();
              }
            }}
            placeholder={
              !programma
                ? "Kies eerst je programma hierboven..."
                : luistert
                  ? "Ik luister... 🎧"
                  : "Typ, of druk op de microfoon en praat"
            }
            disabled={bezig || !programma}
            className="flex-1 rounded-full bg-white/10 border border-white/15 px-4 py-3 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60"
          />
          {kanPraten && (
            <button
              onClick={startLuisteren}
              disabled={bezig || !programma}
              title={luistert ? "Stop met luisteren" : "Praat tegen je Mentor"}
              className={`h-14 w-14 flex-shrink-0 rounded-full text-2xl shadow-xl transition-all disabled:opacity-40 ${luistert ? "pols" : ""}`}
              style={{
                background: luistert
                  ? "radial-gradient(circle,#F87171 0%,#B91C1C 100%)"
                  : "radial-gradient(circle,#34D399 0%,#047857 100%)",
              }}
            >
              🎙️
            </button>
          )}
          <button
            onClick={() => verstuur()}
            disabled={bezig || !invoer.trim() || !programma}
            className="rounded-full bg-emerald-600 px-4 py-3 text-[13px] font-bold text-white disabled:opacity-30"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
