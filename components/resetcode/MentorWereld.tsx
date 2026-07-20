"use client";

// ============================================================
// DE MENTOR-WERELD: de Resetcode-klantomgeving als één warm
// gesprek (richting D). Feedback-ronde 10 juli verwerkt:
// - WhatsApp-gevoel: geen scrollbalk, groter leesbaar font,
//   typ-indicator, berichten druppelen rustig binnen.
// - Geen knopjes-balk: alles loopt via het gesprek zelf; de
//   Mentor vertelt wat je kunt vragen en verstaat "tips",
//   "documenten", "wat mag ik eten", "verder" enzovoort.
// - Foto's: etiket-check vanuit de supermarkt via de camera.
// - Geheugen: het hele gesprek + je plek worden op dit toestel
//   onthouden (preview); na de database-ronde reist dat mee met
//   de klant-link over apparaten heen.
// ============================================================

import { useEffect, useRef, useState } from "react";
import {
  RESET_PROGRAMMAS,
  programmaVoor,
  stationVoor,
  type ResetProgramma,
  type ResetStation,
} from "@/lib/resetcode/programma";
import { waLinkNaar } from "@/lib/util/wa-nummer";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { SUIKER_NAMEN, WC_TIPS } from "@/lib/resetcode/producten";
import {
  touchpointTekst,
  type TouchpointSleutel,
} from "@/lib/resetcode/touchpoints";

type Kaart =
  | "regels"
  | "welniet"
  | "tips"
  | "video"
  | "videotips"
  | "videodag10"
  | "documenten"
  | "contact"
  | "logi"
  | "vervolg"
  | "faq"
  | "suikers"
  | "wctips";

// "Verder met [X]"-knop: brengt de informatie geleidelijk (feedback Raoul
// 18 juli), en toont vóóraf wat het volgende blok is.
type VerderActie =
  | { type: "chunk"; index: number; stationSlug: string }
  | { type: "station"; slug: string };

type Checkin = {
  datum: string;
  stemming: string | null;
  gewicht: number | null;
  notitie?: string | null;
};

type ChatItem =
  | { van: "mentor"; soort: "tekst"; tekst: string; sid?: number }
  | { van: "mentor"; soort: "kaart"; kaart: Kaart; stationSlug: string }
  | { van: "mentor"; soort: "programma-keuze" }
  | { van: "mentor"; soort: "verder-knop"; bid: number; label: string; actie: VerderActie }
  | { van: "mentor"; soort: "checkin-vraag"; bid: number }
  | { van: "mentor"; soort: "start-keuze"; bid: number }
  | { van: "mentor"; soort: "pakket-keuze"; bid: number }
  | { van: "mentor"; soort: "voortgang" }
  | { van: "mentor"; soort: "push-opt-in"; bid: number }
  | { van: "ik"; soort: "tekst"; tekst: string }
  | { van: "ik"; soort: "foto"; dataUrl: string };

// Welke business-touchpoint (indien van toepassing) bij een stap-start hoort.
const TOUCHPOINT_BIJ_STATION: Partial<Record<string, TouchpointSleutel>> = {
  stabilisatie: "reset-complimenten",
  "logisch-leven": "reset-afronding",
  ritme: "basis-week3",
  groeien: "basis-groeien",
};

const OPSLAG_SLEUTEL = "resetcode-preview-gesprek-v1";
const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms));

const LOGI_LAGEN = [
  { label: "ZELDEN", inhoud: "zoet, gebak, fastfood", breedte: "34%", kleur: "#C97B7B" },
  { label: "MET MATE", inhoud: "granen en volkoren", breedte: "56%", kleur: "#C9A15C" },
  { label: "REGELMATIG", inhoud: "vis, vlees, eieren, zuivel", breedte: "78%", kleur: "#7FA35E" },
  { label: "VAAK", inhoud: "groente en fruit", breedte: "100%", kleur: "#4E8F4B" },
];

const STEMMINGEN = [
  { id: "top", emoji: "😃", label: "Top" },
  { id: "gaatwel", emoji: "🙂", label: "Gaat wel" },
  { id: "zwaar", emoji: "💛", label: "Zwaar" },
];

// Hoeveel dagen een fase duurt (voor de dag-balk op het Groeipad).
const FASE_DAGEN: Record<string, number> = {
  "zestien-dagen": 16,
  laaddagen: 2,
  omschakeling: 21,
  stabilisatie: 21,
  "logisch-leven": 21,
};

// Dagelijkse check-in in de chat, journal-stijl (kompas-principe):
// tik-keuzes voor gevoel, energie, slaap en buik + optioneel gewicht
// en de kleine winst van de dag. Een halve minuut werk, en het traint
// om te kijken naar wat wél werkt.
export type CheckinInvoer = {
  stemming: string;
  energie: string;
  slaap: string;
  buik: string;
  gewicht: string;
  winst: string;
};

const CHECKIN_RIJEN: {
  veld: "energie" | "slaap" | "buik";
  vraag: string;
  opties: { id: string; emoji: string; label: string }[];
}[] = [
  {
    veld: "energie",
    vraag: "Energie",
    opties: [
      { id: "weinig", emoji: "🔋", label: "Weinig" },
      { id: "oke", emoji: "🙂", label: "Oké" },
      { id: "veel", emoji: "⚡", label: "Veel" },
    ],
  },
  {
    veld: "slaap",
    vraag: "Geslapen",
    opties: [
      { id: "slecht", emoji: "🥱", label: "Slecht" },
      { id: "oke", emoji: "🙂", label: "Oké" },
      { id: "goed", emoji: "😴", label: "Goed" },
    ],
  },
  {
    veld: "buik",
    vraag: "Je buik",
    opties: [
      { id: "onrustig", emoji: "🌀", label: "Onrustig" },
      { id: "oke", emoji: "🙂", label: "Oké" },
      { id: "rustig", emoji: "🧘", label: "Rustig" },
    ],
  },
];

function CheckinVraag({
  bezig,
  onKies,
}: {
  bezig: boolean;
  onKies: (invoer: CheckinInvoer) => void;
}) {
  const [gewicht, setGewicht] = useState("");
  const [winst, setWinst] = useState("");
  const [stemming, setStemming] = useState("");
  const [keuzes, setKeuzes] = useState<Record<string, string>>({});
  const kiesRij =
    "flex-1 flex flex-col items-center gap-0.5 rounded-xl border py-2 disabled:opacity-40 transition-colors";
  return (
    <div className="rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3">
      <p className="text-[13px] font-bold text-emerald-300 mb-2">
        📔 Even je check-in
      </p>
      <p className="text-[11px] text-white/50 mb-1">Hoe voel je je vandaag?</p>
      <div className="flex gap-2 mb-2.5">
        {STEMMINGEN.map((s) => (
          <button
            key={s.id}
            onClick={() => setStemming(s.id)}
            disabled={bezig}
            className={`${kiesRij} ${stemming === s.id ? "bg-emerald-500/25 border-emerald-400/60" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <span className="text-xl">{s.emoji}</span>
            <span className="text-[11px] text-white/80">{s.label}</span>
          </button>
        ))}
      </div>
      {CHECKIN_RIJEN.map((rij) => (
        <div key={rij.veld} className="mb-2.5">
          <p className="text-[11px] text-white/50 mb-1">{rij.vraag}</p>
          <div className="flex gap-2">
            {rij.opties.map((o) => (
              <button
                key={o.id}
                onClick={() => setKeuzes((k) => ({ ...k, [rij.veld]: o.id }))}
                disabled={bezig}
                className={`${kiesRij} ${keuzes[rij.veld] === o.id ? "bg-emerald-500/25 border-emerald-400/60" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
              >
                <span className="text-base">{o.emoji}</span>
                <span className="text-[10px] text-white/75">{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mb-2.5">
        <input
          value={gewicht}
          onChange={(e) => setGewicht(e.target.value.replace(/[^0-9,.]/g, ""))}
          inputMode="decimal"
          placeholder="gewicht"
          className="w-24 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none"
          disabled={bezig}
        />
        <span className="text-white/50 text-[12px]">kg (optioneel)</span>
      </div>
      <input
        value={winst}
        onChange={(e) => setWinst(e.target.value.slice(0, 200))}
        placeholder="kleine winst van vandaag (optioneel) ✨"
        className="w-full rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none mb-2.5"
        disabled={bezig}
      />
      <button
        onClick={() =>
          onKies({
            stemming,
            energie: keuzes.energie ?? "",
            slaap: keuzes.slaap ?? "",
            buik: keuzes.buik ?? "",
            gewicht,
            winst,
          })
        }
        disabled={bezig || !stemming}
        className="w-full rounded-full bg-emerald-600 py-2.5 text-[14px] font-bold text-white disabled:opacity-40"
      >
        Check-in klaar ✓
      </button>
    </div>
  );
}

// Startmoment-kaartje: vandaag, morgen of een zelfgekozen dag. De
// gekozen dag wordt dag 1; alle dag-momenten tellen daarvandaan.
function StartKeuze({
  onKies,
}: {
  onKies: (datumISO: string, label: string, alGestart: boolean) => void;
}) {
  const [eigenDatum, setEigenDatum] = useState("");
  const [alGestart, setAlGestart] = useState(false);
  const naarISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  const vandaag = new Date();
  const morgen = new Date(vandaag.getTime() + 86_400_000);
  const gisteren = new Date(vandaag.getTime() - 86_400_000);
  const datumLabel = (iso: string) =>
    `op ${new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })}`;

  if (alGestart) {
    return (
      <div className="rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3">
        <p className="text-[13px] font-bold text-emerald-300 mb-2">
          💪 Wanneer ben je gestart?
        </p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={eigenDatum}
            max={naarISO(gisteren)}
            onChange={(e) => setEigenDatum(e.target.value)}
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white focus:outline-none [color-scheme:dark]"
          />
          <button
            onClick={() =>
              eigenDatum && onKies(eigenDatum, datumLabel(eigenDatum), true)
            }
            disabled={!eigenDatum}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-40"
          >
            Kies
          </button>
        </div>
        <button
          onClick={() => setAlGestart(false)}
          className="mt-2 text-[12px] text-white/50 underline underline-offset-2"
        >
          ← terug
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3">
      <p className="text-[13px] font-bold text-emerald-300 mb-2">
        🚀 Jouw startmoment
      </p>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => onKies(naarISO(vandaag), "vandaag", false)}
          className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-[14px] font-bold text-white"
        >
          Vandaag
        </button>
        <button
          onClick={() => onKies(naarISO(morgen), "morgen", false)}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 py-2.5 text-[14px] font-semibold text-white hover:bg-white/10"
        >
          Morgen
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="date"
          value={eigenDatum}
          min={naarISO(vandaag)}
          onChange={(e) => setEigenDatum(e.target.value)}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-[13px] text-white focus:outline-none [color-scheme:dark]"
        />
        <button
          onClick={() =>
            eigenDatum && onKies(eigenDatum, datumLabel(eigenDatum), false)
          }
          disabled={!eigenDatum}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[13px] font-semibold text-emerald-300 disabled:opacity-40"
        >
          Kies
        </button>
      </div>
      <button
        onClick={() => {
          setEigenDatum("");
          setAlGestart(true);
        }}
        className="text-[12px] text-white/60 underline underline-offset-2"
      >
        💪 Ik ben al gestart
      </button>
    </div>
  );
}

// Voortgangs-kaart: gewichtslijntje + gevoels-reeks van begin tot nu.
function VoortgangKaart({ reeks }: { reeks: Checkin[] }) {
  const metGewicht = reeks.filter((r) => r.gewicht != null) as (Checkin & {
    gewicht: number;
  })[];
  const stemmingen = reeks.filter((r) => r.stemming);
  const kader = "rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3";

  let lijn = null;
  if (metGewicht.length >= 2) {
    const waarden = metGewicht.map((r) => r.gewicht);
    const min = Math.min(...waarden);
    const max = Math.max(...waarden);
    const bereik = max - min || 1;
    const punten = metGewicht.map((r, idx) => {
      const x = (idx / (metGewicht.length - 1)) * 100;
      const y = 100 - ((r.gewicht - min) / bereik) * 100;
      return `${x},${y}`;
    });
    const eerste = waarden[0];
    const laatste = waarden[waarden.length - 1];
    const delta = Math.round((laatste - eerste) * 10) / 10;
    lijn = (
      <div className="mt-1">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-[12px] text-white/70">Gewicht</span>
          <span
            className={`text-[12px] font-semibold ${delta <= 0 ? "text-emerald-300" : "text-amber-300"}`}
          >
            {delta <= 0 ? "" : "+"}
            {delta} kg sinds start
          </span>
        </div>
        <svg viewBox="0 0 100 40" className="w-full h-16" preserveAspectRatio="none">
          <polyline
            points={punten.join(" ")}
            fill="none"
            stroke="#34D399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            transform="scale(1,0.4)"
          />
        </svg>
        <div className="flex justify-between text-[10px] text-white/40">
          <span>{eerste} kg</span>
          <span>nu {laatste} kg</span>
        </div>
      </div>
    );
  }

  return (
    <div className={kader}>
      <p className="text-[13px] font-bold text-emerald-300 mb-1.5">
        📈 Jouw voortgang
      </p>
      {lijn}
      {stemmingen.length > 0 && (
        <div className="mt-3">
          <p className="text-[12px] text-white/70 mb-1">
            Hoe je je voelde ({stemmingen.length}{" "}
            {stemmingen.length === 1 ? "dag" : "dagen"})
          </p>
          <div className="flex flex-wrap gap-1">
            {stemmingen.slice(-30).map((r, idx) => (
              <span key={idx} title={r.datum} className="text-lg leading-none">
                {STEMMINGEN.find((s) => s.id === r.stemming)?.emoji ?? "·"}
              </span>
            ))}
          </div>
        </div>
      )}
      {metGewicht.length < 2 && stemmingen.length === 0 && (
        <p className="text-[13px] text-white/70">
          Nog niks om te tonen. Doe je dagelijkse check-in, dan groeit dit
          mee.
        </p>
      )}
    </div>
  );
}

export default function MentorWereld({
  begeleiderNaam,
  token,
  klantVoornaam,
  programmaSlugVast,
  stationSlugStart,
  beginItems,
  memberTelefoon,
  mediaBlokken,
  isFounder,
  touchpointsAlVerteld,
  isBouwer,
  dueTouchpoint,
  kcalStart,
  dueDag10,
  dueEinde,
  dueWeekTerugblik,
  checkinVandaagGedaan,
  checkinReeks,
  dagNummer,
  startGekozen,
  startOverDagen,
  pakket,
}: {
  begeleiderNaam: string;
  /** Klant-modus: token van de klant-link; het gesprek wordt dan op de server bewaard. */
  token?: string;
  klantVoornaam?: string;
  programmaSlugVast?: string;
  stationSlugStart?: string | null;
  beginItems?: ChatItem[];
  memberTelefoon?: string | null;
  /** Gevulde media per sleutel `${programma}/${station}-video` en `-docs`. */
  mediaBlokken?: Record<string, Blok[]>;
  /** Founder in de preview: mag media-plekken vullen (edit-modus). */
  isFounder?: boolean;
  /** Business-verhalen die deze klant al kreeg (over programma's heen). */
  touchpointsAlVerteld?: string[];
  /** Bouwt zelf al mee: dan geen webshop-verhalen, puur programma-coach. */
  isBouwer?: boolean;
  /** Tijd-gebonden touchpoint dat nú aan de beurt is (bijv. kern-verhaal rond dag 7). */
  dueTouchpoint?: TouchpointSleutel | null;
  /** Dagtotaal van de calorieteller (laaddagen), server-side berekend. */
  kcalStart?: number;
  /** Dag-nummer als de dag 10-video nú aan de beurt is (darm, vanaf dag 10). */
  dueDag10?: number | null;
  /** De dagen van de laatste fase zitten er écht op: nú het einde-moment spelen. */
  dueEinde?: boolean;
  /** Week-nummer als de week-terugblik nú aan de beurt is (elke 7 dagen). */
  dueWeekTerugblik?: number | null;
  /** Heeft de klant vandaag al ingecheckt? Zo niet: dagelijkse check-in tonen. */
  checkinVandaagGedaan?: boolean;
  /** Reeks check-ins (oud → nieuw) voor de voortgangs-kaart en streak. */
  checkinReeks?: Checkin[];
  /** Dag-nummer binnen de huidige fase (voor de begroeting en het Groeipad). */
  dagNummer?: number | null;
  /** Heeft de klant al een startmoment gekozen (of is dat hier niet nodig)? */
  startGekozen?: boolean;
  /** Startdatum in de toekomst: over zoveel dagen begint dag 1. */
  startOverDagen?: number;
  /** Darmen in Balans: gekozen pakket (basis of plus), of null. */
  pakket?: "basis" | "plus" | null;
}) {
  const isKlant = Boolean(token);
  const verteldRef = useRef<Set<string>>(new Set(touchpointsAlVerteld ?? []));
  // Geleidelijke info-flow: het chunk-plan van de huidige stap + een teller
  // voor unieke "verder"-knop-ids.
  const chunkPlanRef = useRef<
    { sleutel: string; knopLabel: string; speel: () => Promise<void> }[]
  >([]);
  const bidTeller = useRef(0);
  // Check-in / dagboek: reeks in het geheugen zodat de voortgangs-kaart
  // meteen klopt na een nieuwe check-in.
  const checkinReeksRef = useRef<Checkin[]>(checkinReeks ?? []);
  const checkinGedaanRef = useRef(Boolean(checkinVandaagGedaan));
  // Waar terwijl de Mentor woord-voor-woord schrijft: dan even geen
  // localStorage-opslag per woord (na het schrijven één keer).
  const schrijftRef = useRef(false);
  // Startmoment: de klant kiest zelf wanneer dag 1 is (vandaag/morgen/
  // datum/al gestart). De vraag komt VROEG (feedback Raoul 19 juli): al
  // na de voorbereidings-info, niet pas na alle fase-informatie.
  const startGekozenRef = useRef(Boolean(startGekozen ?? false));
  const START_VRAAG_STATION: Record<string, string> = {
    darm: "start",
    reset: "voorbereiding",
  };
  const EERSTE_DUUR_STATION: Record<string, string> = {
    darm: "zestien-dagen",
    reset: "laaddagen",
  };
  // Darmen in Balans: basis (rode schema, 5 producten) of plus (blauwe
  // schema, 8 producten). Bepaalt hoe specifiek de Mentor antwoordt.
  const pakketRef = useRef<"basis" | "plus" | null>(pakket ?? null);
  const [checkinBezig, setCheckinBezig] = useState(false);

  function markeerTouchpoint(sleutel: TouchpointSleutel) {
    if (!token) return;
    fetch("/api/resetcode/touchpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sleutel }),
    }).catch(() => {});
  }

  // Speelt een business-touchpoint, precies één keer per klant (ook over
  // meerdere programma's heen) en nooit voor bouwers of members.
  async function speelTouchpoint(sleutel: TouchpointSleutel) {
    if (isBouwer || rol === "member") return;
    if (verteldRef.current.has(sleutel)) return;
    const kernAl = verteldRef.current.has("kern-verhaal");
    const teksten = touchpointTekst(sleutel, begeleiderNaam, kernAl);
    verteldRef.current.add(sleutel);
    // basis-groeien zonder kern-verhaal vertelt het kern-verhaal zelf.
    const dektKern =
      sleutel === "kern-verhaal" || (sleutel === "basis-groeien" && !kernAl);
    if (dektKern) verteldRef.current.add("kern-verhaal");
    for (const tekst of teksten) {
      await mentorZegt(tekst, 1400);
      await wacht(600);
    }
    markeerTouchpoint(sleutel);
    if (dektKern && sleutel !== "kern-verhaal") markeerTouchpoint("kern-verhaal");
  }
  const [rol, setRol] = useState<"klant" | "member">("klant");
  const [programma, setProgramma] = useState<ResetProgramma | null>(null);
  const [station, setStation] = useState<ResetStation | null>(null);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [mentorTypt, setMentorTypt] = useState(false);
  const [opneemt, setOpneemt] = useState(false);
  const [verwerkt, setVerwerkt] = useState(false);
  // Calorieteller (alleen actief op de laaddagen).
  const [kcalTotaal, setKcalTotaal] = useState<number>(kcalStart ?? 0);
  const [kanPraten, setKanPraten] = useState(false);
  const [toonReis, setToonReis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const gestart = useRef(false);

  useEffect(() => {
    setKanPraten(
      typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined",
    );
  }, []);

  // Scroll alleen wanneer er een NIEUW bericht bijkomt (of de typ-
  // indicator verschijnt), niet bij elk binnenstromend stukje tekst.
  // Zo blijf je bij een lang antwoord gewoon BOVENAAN het antwoord
  // lezen terwijl de rest eronder aangroeit (feedback Raoul).
  const vorigeAantal = useRef(0);
  useEffect(() => {
    if (items.length !== vorigeAantal.current || mentorTypt) {
      vorigeAantal.current = items.length;
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [items, mentorTypt]);

  // Klant-modus: gescripte items (welkom, kaartjes, echo's) naar de
  // server zodat het geheugen over apparaten meereist. Fire-and-forget.
  function logNaarServer(
    nieuwe: {
      van: "klant" | "mentor";
      soort: "tekst" | "kaart" | "foto";
      kaart?: string;
      stationSlug?: string | null;
      tekst?: string;
    }[],
  ) {
    if (!token) return;
    fetch("/api/resetcode/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, items: nieuwe }),
    }).catch(() => {});
  }

  // Geheugen: gesprek + plek bewaren op dit toestel (foto-data niet,
  // die is te groot voor localStorage; er blijft een tekst-spoor).
  // In klant-modus niet nodig: daar is de server het geheugen.
  useEffect(() => {
    if (!gestart.current || isKlant || schrijftRef.current) return;
    try {
      const opTeSlaan = {
        rol,
        programmaSlug: programma?.slug ?? null,
        stationSlug: station?.slug ?? null,
        // Check-in-reeks apart bewaren (typed data, niet uit de chat-tekst
        // te herleiden), zodat de dagelijkse check-in ook in de preview
        // op een nieuwe dag terugkomt en de voortgangs-kaart klopt.
        checkins: checkinReeksRef.current,
        // Knoppen en interactieve kaartjes zijn vluchtige UI, die bewaren we niet.
        items: items
          .filter(
            (i) =>
              i.soort !== "verder-knop" &&
              i.soort !== "checkin-vraag" &&
              i.soort !== "start-keuze" &&
              i.soort !== "pakket-keuze" &&
              i.soort !== "push-opt-in" &&
              i.soort !== "voortgang",
          )
          .map((i) =>
            i.van === "ik" && i.soort === "foto"
              ? { van: "ik" as const, soort: "tekst" as const, tekst: "📷 (foto gestuurd)" }
              : i,
          ),
      };
      localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(opTeSlaan));
    } catch {
      // opslag vol of geblokkeerd: geen ramp in de preview
    }
  }, [items, programma, station, rol]);

  // Start: gesprek herstellen als dat er is, anders vers beginnen.
  useEffect(() => {
    if (gestart.current) return;
    gestart.current = true;

    // Klant-modus: alles komt van de server (via de pagina-props).
    if (isKlant && programmaSlugVast) {
      const prog = programmaVoor(programmaSlugVast);
      if (!prog) return;
      setProgramma(prog);
      const st = stationSlugStart
        ? stationVoor(prog.slug, stationSlugStart)
        : null;
      if (st && beginItems && beginItems.length > 0) {
        setStation(st);
        const i = prog.stations.findIndex((s) => s.slug === st.slug);
        const volgend =
          i >= 0 && i < prog.stations.length - 1 ? prog.stations[i + 1] : null;
        const teltAf = (startOverDagen ?? 0) > 0;
        setItems([
          ...beginItems,
          {
            van: "mentor",
            soort: "tekst",
            tekst: teltAf
              ? `Welkom terug! 👋 Nog ${startOverDagen === 1 ? "één dag" : `${startOverDagen} dagen`} en dan begint jouw dag 1 🚀 Gebruik de tijd om je documenten rustig door te lezen, en vraag me gerust van alles.`
              : `Welkom terug! 👋 We waren bij ${st.emoji} ${st.naam}${dagNummer ? ` (dag ${dagNummer})` : ""}. Waar wil je verder mee? Stel je vraag, stuur een foto van een etiket${volgend ? "" : ", of vraag me van alles"}.`,
          },
          ...(volgend
            ? [
                {
                  van: "mentor" as const,
                  soort: "verder-knop" as const,
                  bid: ++bidTeller.current,
                  label: `${volgend.emoji} ${volgend.naam}`,
                  actie: { type: "station" as const, slug: volgend.slug },
                },
              ]
            : []),
        ]);
        // Volgorde bij terugkomen: eerst pakket (darm, indien onbekend),
        // dan startmoment (indien nog niet gekozen), dan de check-in.
        const moetStartKiezen =
          !startGekozenRef.current &&
          (START_VRAAG_STATION[prog.slug] === st.slug ||
            EERSTE_DUUR_STATION[prog.slug] === st.slug);
        const moetPakketKiezen = prog.slug === "darm" && !pakketRef.current;
        // Dagelijkse check-in bovenaan (nieuwe dag, nog niet ingecheckt).
        // Niet op het einde-moment (dan is het feest, geen formulier) en
        // niet vóór de zelfgekozen startdatum.
        if (moetPakketKiezen) {
          (async () => {
            await wacht(1400);
            await toonPakketKeuze(
              moetStartKiezen
                ? async () => {
                    await toonStartKeuze(
                      FASE_DAGEN[EERSTE_DUUR_STATION[prog.slug] ?? ""],
                    );
                  }
                : null,
            );
            knoppenNaarOnder();
          })();
        } else if (moetStartKiezen) {
          (async () => {
            await wacht(1400);
            await toonStartKeuze(FASE_DAGEN[EERSTE_DUUR_STATION[prog.slug] ?? ""]);
            knoppenNaarOnder();
          })();
        } else if (!checkinGedaanRef.current && !dueEinde && !teltAf) {
          (async () => {
            await wacht(1400);
            await toonCheckin(true);
          })();
        }
        // Tijd-gebonden momenten, rustig ná het welkom-terug. Het
        // programma-einde gaat vóór alles (en dan slaan we dag 10 en
        // kern-verhaal over, die zijn dan niet meer relevant).
        if (dueEinde) {
          (async () => {
            await wacht(2500);
            await mentorZegt(
              `${klantVoornaam ?? "Hé"}... je hebt het gedaan. Álle dagen. 🎉 Ik ben oprecht trots op je, en ${begeleiderNaam} ook. Neem even een moment om dat te voelen: dit heb jíj gedaan.`,
              1300,
            );
            await wacht(1200);
            if (prog.slug === "darm") await speelTouchpoint("darm-einde");
            await mentorKaart("vervolg", st.slug, 900);
            markeerTouchpoint("programma-einde" as TouchpointSleutel);
            knoppenNaarOnder();
          })();
        } else if (dueDag10 || dueTouchpoint || dueWeekTerugblik) {
          (async () => {
            await wacht(2500);
            if (dueDag10) {
              await mentorZegt(
                `Trouwens: je zit vandaag op dag ${dueDag10} van je 16 dagen! 🎉 Dit is het moment voor je dag 10-video, die is belangrijk. Kijk 'm even rustig 👇`,
                1100,
              );
              await mentorKaart("videodag10", st.slug, 800);
              markeerTouchpoint("dag10-video" as TouchpointSleutel);
              if (dueTouchpoint || dueWeekTerugblik) await wacht(1500);
            }
            if (dueTouchpoint) await speelTouchpoint(dueTouchpoint);
            if (dueWeekTerugblik) {
              if (dueTouchpoint) await wacht(1500);
              await speelWeekTerugblik(dueWeekTerugblik);
            }
            knoppenNaarOnder();
          })();
        }
      } else {
        // Allereerste bezoek: warm welkom + eerste stap.
        (async () => {
          await mentorZegt(
            `Hé ${klantVoornaam ?? ""}, welkom! 🌿 Ik ben je Mentor. Ik ken jouw hele programma van begin tot eind en ik ben er dag en nacht, samen met ${begeleiderNaam}. Praat gewoon tegen me of typ, wat jij fijn vindt. En handig: zet deze pagina op je beginscherm (delen ▸ zet op beginscherm), dan sta ik altijd tussen je apps. Ik onthoud alles wat we bespreken. 💚`,
            1200,
          );
          await wacht(700);
          const vervolg = async () => {
            await introStation(prog, prog.stations[0]);
            fetch("/api/resetcode/stap", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, station: prog.stations[0].slug }),
            }).catch(() => {});
            // Dag 1: vraag of ik elke ochtend een seintje mag geven.
            await wacht(900);
            await mentorZegt(
              "Nog één ding, en dan laat ik je los 😊 Zal ik je elke ochtend een klein seintje geven voor je dagelijkse check-in? Dan hoef jij niks te onthouden en houd ik je voortgang perfect bij.",
              1000,
            );
            await toonPushOptIn();
          };
          // Darmen in Balans: eerst even weten welk pakket (basis/plus).
          if (prog.slug === "darm" && !pakketRef.current) {
            await toonPakketKeuze(vervolg);
          } else {
            await vervolg();
          }
        })();
      }
      return;
    }

    try {
      const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
      if (ruw) {
        const data = JSON.parse(ruw) as {
          rol?: "klant" | "member";
          programmaSlug?: string | null;
          stationSlug?: string | null;
          items?: ChatItem[];
          checkins?: Checkin[];
        };
        const prog = data.programmaSlug ? programmaVoor(data.programmaSlug) : null;
        const st =
          prog && data.stationSlug
            ? stationVoor(prog.slug, data.stationSlug)
            : null;
        if (prog && st && Array.isArray(data.items) && data.items.length > 0) {
          if (data.rol) setRol(data.rol);
          setProgramma(prog);
          setStation(st);
          if (Array.isArray(data.checkins)) checkinReeksRef.current = data.checkins;
          const i = prog.stations.findIndex((s) => s.slug === st.slug);
          const volgend =
            i >= 0 && i < prog.stations.length - 1 ? prog.stations[i + 1] : null;
          setItems([
            ...data.items,
            {
              van: "mentor",
              soort: "tekst",
              tekst: `Welkom terug! 👋 We waren bij ${st.emoji} ${st.naam}. Waar wil je verder mee? Stel je vraag, stuur een foto van een etiket${volgend ? "" : ", of vraag me van alles"}.`,
            },
            ...(volgend
              ? [
                  {
                    van: "mentor" as const,
                    soort: "verder-knop" as const,
                    bid: ++bidTeller.current,
                    label: `${volgend.emoji} ${volgend.naam}`,
                    actie: { type: "station" as const, slug: volgend.slug },
                  },
                ]
              : []),
          ]);
          // Ook in de preview telt een echte nieuwe dag: is er nog geen
          // check-in van vandaag, dan komt de dagelijkse vraag gewoon
          // terug (feedback Raoul 20 juli: gebeurde niet, testbank-gat
          // want /resetcode-preview heeft geen server-datum).
          const vandaagNu = new Intl.DateTimeFormat("sv-SE", {
            timeZone: "Europe/Amsterdam",
          }).format(new Date());
          const alVandaag = checkinReeksRef.current.some((c) => c.datum === vandaagNu);
          checkinGedaanRef.current = alVandaag;
          if (!alVandaag) {
            (async () => {
              await wacht(1400);
              await toonCheckin(true);
              knoppenNaarOnder();
            })();
          }
          return;
        }
      }
    } catch {
      // kapotte opslag: gewoon vers starten
    }
    versBeginnen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function versBeginnen() {
    setProgramma(null);
    setStation(null);
    setItems([]);
    setMentorTypt(true);
    await wacht(900);
    setMentorTypt(false);
    setItems([
      {
        van: "mentor",
        soort: "tekst",
        tekst: "Hé, welkom! 🌿 Ik ben je Mentor. Ik ken jouw hele programma van begin tot eind en ik ben er dag en nacht. Praat gewoon tegen me of typ, wat jij fijn vindt.",
      },
    ]);
    await wacht(1400);
    setMentorTypt(true);
    await wacht(1100);
    setMentorTypt(false);
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "tekst",
        tekst: "Eerst even dit: welk programma ga jij doen?",
      },
      { van: "mentor", soort: "programma-keuze" },
    ]);
  }

  // De Mentor "schrijft" zijn tekst woord voor woord (feedback Raoul:
  // je leest mee terwijl hij schrijft, in plaats van bloktekst-plof).
  // Korte adempauze na elke zin, zodat het leest als echt schrijven.
  async function mentorZegt(tekst: string, denkMs = 900) {
    setMentorTypt(true);
    await wacht(denkMs);
    setMentorTypt(false);
    const sid = ++bidTeller.current;
    setItems((b) => [...b, { van: "mentor", soort: "tekst", tekst: "", sid }]);
    const woorden = tekst.split(" ");
    schrijftRef.current = true;
    let zin = "";
    for (const woord of woorden) {
      zin = zin ? `${zin} ${woord}` : woord;
      const nu = zin;
      setItems((b) =>
        b.map((x) =>
          x.van === "mentor" && x.soort === "tekst" && x.sid === sid
            ? { ...x, tekst: nu }
            : x,
        ),
      );
      await wacht(/[.!?…]["')]?$/.test(woord) ? 260 : 55);
    }
    schrijftRef.current = false;
    setItems((b) => [...b]); // één keer bewaren, nu het af is
    logNaarServer([{ van: "mentor", soort: "tekst", tekst }]);
  }

  async function mentorKaart(kaart: Kaart, stationSlug: string, denkMs = 700) {
    setMentorTypt(true);
    await wacht(denkMs);
    setMentorTypt(false);
    setItems((b) => [...b, { van: "mentor", soort: "kaart", kaart, stationSlug }]);
    logNaarServer([{ van: "mentor", soort: "kaart", kaart, stationSlug }]);
  }

  // ---------- Startmoment ----------

  // De klant kiest zelf wanneer dag 1 is (feedback Raoul 19 juli):
  // fijn voor klant, Mentor én begeleider. Alle dag-momenten
  // (check-in, dag 10, einde) tellen vanaf deze datum.
  async function toonStartKeuze(duur?: number) {
    await mentorZegt(
      `Dan nu het belangrijkste: wanneer ga jij van start? 🚀 Kies hieronder jouw startmoment, dan weet ${begeleiderNaam} het ook meteen en tel ik ${duur ? `je ${duur} dagen` : "je dagen"} precies vanaf jouw dag 1. Kleine tip: de meeste mensen starten vandaag of morgen. Je zit er nu helemaal in, en Lifeplus geeft 30 dagen niet-goed-geld-terug-garantie vanaf je bestelling; als je snel start, valt je hele ervaring daar mooi binnen.`,
      1000,
    );
    const bid = ++bidTeller.current;
    setItems((b) => [...b, { van: "mentor", soort: "start-keuze", bid }]);
  }

  async function kiesStart(datumISO: string, label: string, alGestart = false) {
    setItems((b) => b.filter((x) => x.soort !== "start-keuze"));
    startGekozenRef.current = true;
    const echo = alGestart
      ? `Ik ben al gestart, ${label}! 💪`
      : `Ik start ${label}! 🚀`;
    setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echo }]);
    logNaarServer([{ van: "klant", soort: "tekst", tekst: echo }]);
    if (token) {
      fetch("/api/resetcode/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, datum: datumISO }),
      }).catch(() => {});
    }
    if (alGestart) {
      const vandaagISO = `${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1,
      ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
      const dag =
        Math.round(
          (Date.parse(vandaagISO) - Date.parse(datumISO)) / 86_400_000,
        ) + 1;
      await mentorZegt(
        `Kanjer, dan ben je al lekker bezig! 💚 Dan zit je nu op dag ${dag}. Ik heb het aan ${begeleiderNaam} doorgegeven en tel vanaf nu gewoon met je mee vanaf jouw echte startdag. Vanaf nu zie ik je elke dag bij je check-in, en alles wat op jouw dagen hoort zet ik automatisch voor je klaar.`,
        1100,
      );
    } else if (label === "vandaag") {
      await mentorZegt(
        `Yes! Vandaag is jouw dag 1 💚 Ik heb het aan ${begeleiderNaam} doorgegeven. Vanaf nu zie ik je elke dag bij je check-in en houd ik je voortgang bij. Zet 'm op vandaag, je gaat dit goed doen!`,
        1000,
      );
    } else {
      await mentorZegt(
        `Genoteerd: ${label} is jouw dag 1 💚 Ik heb het aan ${begeleiderNaam} doorgegeven. Gebruik de tijd tot je start om je documenten rustig door te lezen en alles in huis te halen. Vanaf je startdag zie ik je elke dag bij je check-in!`,
        1000,
      );
      // Verre start: warm aanmoedigen om eerder te beginnen (garantie
      // loopt vanaf de bestelling; motivatie is nu het grootst).
      const dagenTotStart = Math.round(
        (Date.parse(datumISO) - Date.parse(new Date().toISOString().slice(0, 10))) /
          86_400_000,
      );
      if (dagenTotStart > 3) {
        await wacht(900);
        await mentorZegt(
          `Mag ik nog één ding eerlijk zeggen? Als het lukt om eerder te beginnen, zou ik dat doen. Je zit er nú helemaal in, en de 30 dagen niet-goed-geld-terug-garantie van Lifeplus loopt vanaf je bestelling; hoe eerder je start, hoe mooier je ervaring daarbinnen valt. Wil je toch een andere dag kiezen, typ dan gewoon "ik start eerder" en ik pas het aan. En anders: ${label} is helemaal prima, dan zie ik je dan! 💚`,
          1100,
        );
      }
    }

    // Rond de start: het samen-doen-verhaal + de support-groep
    // (eenmalig; slaat bouwers automatisch over via speelTouchpoint).
    if (!alGestart) {
      await wacht(900);
      await speelTouchpoint("samen-starten");
    }

    // Kwam de vraag vroeg (na de voorbereiding)? Dan stroomt het
    // programma nu vanzelf door naar de eerste echte fase, zonder
    // extra "Verder met"-knop (feedback Raoul).
    if (
      programma &&
      station &&
      START_VRAAG_STATION[programma.slug] === station.slug
    ) {
      const i = programma.stations.findIndex((s) => s.slug === station.slug);
      const volgend = programma.stations[i + 1];
      if (volgend) {
        await wacht(900);
        if (token) {
          fetch("/api/resetcode/stap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, station: volgend.slug }),
          }).catch(() => {});
        }
        await introStation(programma, volgend);
      }
    }

    // Wie vandaag start of al bezig is: meteen de eerste check-in.
    if ((alGestart || label === "vandaag") && !checkinGedaanRef.current) {
      await wacht(700);
      await toonCheckin(true);
    }
  }

  // ---------- Pakket-keuze (Darmen in Balans: basis of plus) ----------

  // Vervolg-actie die na de pakket-keuze verder moet lopen (bijv. de
  // eerste fase-intro), zodat de flow netjes wacht op het antwoord.
  const naPakketRef = useRef<(() => Promise<void>) | null>(null);

  async function toonPakketKeuze(vervolg: (() => Promise<void>) | null) {
    naPakketRef.current = vervolg;
    await mentorZegt(
      "Eerst even praktisch: welk pakket heb jij besteld? Dan kloppen al mijn antwoorden precies met jouw schema.",
      900,
    );
    const bid = ++bidTeller.current;
    setItems((b) => [...b, { van: "mentor", soort: "pakket-keuze", bid }]);
  }

  async function kiesPakket(keuze: "basis" | "plus") {
    setItems((b) => b.filter((x) => x.soort !== "pakket-keuze"));
    pakketRef.current = keuze;
    const echo =
      keuze === "plus"
        ? "Ik heb het plus-pakket (8 producten) 🔵"
        : "Ik heb het basispakket (5 producten) 🔴";
    setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echo }]);
    logNaarServer([{ van: "klant", soort: "tekst", tekst: echo }]);
    if (token) {
      fetch("/api/resetcode/pakket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pakket: keuze }),
      }).catch(() => {});
    }
    await mentorZegt(
      keuze === "plus"
        ? "Top, het plus-pakket dus: het blauwe schema met 8 producten. Alles wat ik je vertel en uitreken klopt daar vanaf nu precies mee. 💙"
        : "Top, het basispakket dus: het rode schema met 5 producten. Alles wat ik je vertel en uitreken klopt daar vanaf nu precies mee. ❤️",
      900,
    );
    const vervolg = naPakketRef.current;
    naPakketRef.current = null;
    if (vervolg) {
      await wacht(600);
      await vervolg();
    }
  }

  // ---------- Week-terugblik (kompas-principe) ----------

  // Elke 7 dagen een mini-overzicht: bewijs voor jezelf. Voortgangs-
  // kaart + de eigen winsten terug, kijken naar wat wél werkt.
  async function speelWeekTerugblik(week: number) {
    const reeks = checkinReeksRef.current;
    await mentorZegt(
      `Trouwens: je bent alweer ${week === 1 ? "een hele week" : `${week} weken`} onderweg! 🎉 Tijd voor je week-overzichtje, gewoon als bewijs voor jezelf.`,
      1100,
    );
    setItems((b) => [...b, { van: "mentor", soort: "voortgang" }]);
    await wacht(1000);
    const metGewicht = reeks.filter((r) => r.gewicht != null);
    const delta =
      metGewicht.length >= 2
        ? Math.round(
            ((metGewicht[metGewicht.length - 1].gewicht as number) -
              (metGewicht[0].gewicht as number)) *
              10,
          ) / 10
        : null;
    const winsten = reeks
      .filter((r) => r.notitie)
      .slice(-3)
      .map((r) => `"${r.notitie}"`);
    const delen: string[] = [];
    if (delta != null && delta < 0)
      delen.push(`je staat ${Math.abs(delta)} kilo lichter dan bij je start`);
    if (winsten.length)
      delen.push(`en dit schreef je zelf op: ${winsten.join(", ")}`);
    await mentorZegt(
      delen.length
        ? `Kijk daar eens rustig naar: ${delen.join(", ")}. Dat is allemaal van jou. Niet omdat je meer doet, maar omdat je bewuster bezig bent. Op naar de volgende week! 💚`
        : `Elke dag dat je incheckt bouw je aan je eigen verhaal, ook op de dagen dat het zwaar voelt. Op naar de volgende week! 💚`,
      1100,
    );
    markeerTouchpoint(`week-terugblik-${week}` as TouchpointSleutel);
  }

  // ---------- Dagelijkse check-in (dagboek) ----------

  // Toont de check-in als er vandaag nog niet is ingecheckt. De reden om
  // elke dag te openen: de Mentor houdt gevoel + gewicht bij (feedback
  // Raoul 18 juli).
  async function toonCheckin(metGroet: boolean) {
    if (checkinGedaanRef.current) return;
    if (metGroet) {
      await mentorZegt(
        `Even je dagelijkse check-in${dagNummer ? ` (dag ${dagNummer})` : ""}: hoe voel je je vandaag? 💚 Vul gerust ook je gewicht in, dan houd ik je voortgang voor je bij.`,
        900,
      );
    }
    const bid = ++bidTeller.current;
    setItems((b) => [...b, { van: "mentor", soort: "checkin-vraag", bid }]);
  }

  async function verstuurCheckin(invoer: CheckinInvoer) {
    if (checkinBezig) return;
    setCheckinBezig(true);
    setItems((b) => b.filter((x) => x.soort !== "checkin-vraag"));
    const { stemming, energie, slaap, buik, winst } = invoer;
    const gewicht = invoer.gewicht
      ? Number(invoer.gewicht.replace(",", "."))
      : undefined;
    const woord =
      stemming === "top" ? "top 😃" : stemming === "gaatwel" ? "gaat wel 🙂" : "zwaar 💛";
    const extraDelen = [
      energie ? `energie ${energie}` : "",
      slaap ? `slaap ${slaap}` : "",
      buik ? `buik ${buik}` : "",
    ].filter(Boolean);
    setItems((b) => [
      ...b,
      {
        van: "ik",
        soort: "tekst",
        tekst: `Vandaag: ${woord}${extraDelen.length ? ` (${extraDelen.join(", ")})` : ""}${gewicht ? `, ${gewicht} kg` : ""}${winst ? `. Winst: ${winst}` : ""}`,
      },
    ]);
    checkinGedaanRef.current = true;
    const vandaag = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Amsterdam",
    }).format(new Date());
    try {
      if (token) {
        const res = await fetch("/api/resetcode/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            stemming,
            gewicht,
            energie: energie || undefined,
            slaap: slaap || undefined,
            buik: buik || undefined,
            notitie: winst || undefined,
          }),
        });
        const data = await res.json().catch(() => null);
        if (data?.ok) {
          if (Array.isArray(data.reeks)) checkinReeksRef.current = data.reeks;
          await mentorZegt(data.antwoord ?? "Genoteerd 💚", 800);
        }
      } else {
        // Preview: lokaal bijhouden, zonder server.
        checkinReeksRef.current = [
          ...checkinReeksRef.current.filter((c) => c.datum !== vandaag),
          { datum: vandaag, stemming, gewicht: gewicht ?? null, notitie: winst || null },
        ];
        await mentorZegt(
          `Genoteerd dat het vandaag ${woord.replace(/[^\wà-ü ]/gi, "").trim()} gaat.${gewicht ? " Gewicht opgeslagen." : ""}${winst ? ` En mooi wat je opschreef: zo train je jezelf om te zien wat wél werkt. 💚` : ""} Ik houd alles voor je bij, vraag me gerust "mijn voortgang".`,
          800,
        );
      }
      // Zware dag? Dan een eigen eerdere winst terughalen: bewijs voor
      // jezelf, precies waar het dagboek voor is (kompas-principe).
      if (stemming === "zwaar") {
        const eerdere = checkinReeksRef.current.filter(
          (c) => c.notitie && c.datum !== vandaag,
        );
        const laatste = eerdere[eerdere.length - 1];
        if (laatste?.notitie) {
          const dagWoord = new Date(`${laatste.datum}T12:00:00`).toLocaleDateString(
            "nl-NL",
            { weekday: "long", day: "numeric", month: "long" },
          );
          await wacht(700);
          await mentorZegt(
            `En mag ik je even ergens aan herinneren? Op ${dagWoord} schreef je zelf op: ${JSON.stringify(laatste.notitie)}. Dat was jij ook. Zware dagen horen erbij, je lichaam is gewoon aan het werk. Vertel me gerust wat je merkt, ik denk met je mee. 💚`,
            1100,
          );
        }
      }
    } catch {
      await mentorZegt("Genoteerd 💚", 500);
    } finally {
      setCheckinBezig(false);
      knoppenNaarOnder();
    }
  }

  // ---------- Push-opt-in (dag 1) ----------

  function abonneerbaar(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      Notification.permission !== "denied"
    );
  }

  async function toonPushOptIn() {
    if (!token || !abonneerbaar()) return;
    try {
      if (Notification.permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        if (await reg.pushManager.getSubscription()) return; // al aan
      }
      if (localStorage.getItem(`resetcode-push-${token.slice(0, 10)}`)) return;
    } catch {
      /* negeer */
    }
    const bid = ++bidTeller.current;
    setItems((b) => [...b, { van: "mentor", soort: "push-opt-in", bid }]);
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  async function zetPushAan(bid: number) {
    setItems((b) => b.filter((x) => !(x.soort === "push-opt-in" && x.bid === bid)));
    try {
      localStorage.setItem(`resetcode-push-${token!.slice(0, 10)}`, "1");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        await mentorZegt(
          "Geen probleem, dan houd ik het hier voor je bij. Je kunt het later altijd nog aanzetten.",
          600,
        );
        return;
      }
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) reg = await navigator.serviceWorker.register("/service-worker.js");
      const ready = await navigator.serviceWorker.ready;
      let sub = await ready.pushManager.getSubscription();
      if (!sub) {
        sub = await ready.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        });
      }
      const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await fetch("/api/resetcode/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, subscription: j }),
      });
      await mentorZegt(
        "Top, ik geef je elke ochtend een klein seintje voor je check-in en laat je weten als er iets belangrijks klaarstaat 🔔",
        700,
      );
    } catch {
      await mentorZegt(
        "Dat lukte net even niet, geen zorgen, ik houd alles gewoon hier voor je bij.",
        600,
      );
    }
  }

  function weigerPush(bid: number) {
    setItems((b) => b.filter((x) => !(x.soort === "push-opt-in" && x.bid === bid)));
    try {
      if (token) localStorage.setItem(`resetcode-push-${token.slice(0, 10)}`, "1");
    } catch {}
  }

  // Fase-intro, bewust RUSTIG (feedback Raoul 12 juli: geen spervuur van
  // berichtjes): één welkom-bericht, de regels, en de documenten worden
  // VOORGESCHOTELD in plaats van dat iemand erom moet vragen. Alles wat
  // meer is (tips, video, suikerlijst) komt op het juiste moment of op
  // verzoek.
  // Bouwt het geleidelijke info-plan van een stap: elk blok komt pas na een
  // "Verder met ..."-knop, zodat de klant weet wat er komt en niet alles in
  // één keer over zich heen krijgt (feedback Raoul 18 juli).
  function bouwChunks(prog: ResetProgramma, st: ResetStation) {
    const chunks: { sleutel: string; knopLabel: string; speel: () => Promise<void> }[] = [];

    if (st.vandaagBelangrijk.length) {
      chunks.push({
        sleutel: "regels",
        knopLabel: "de belangrijkste punten van nu",
        speel: async () => {
          await mentorKaart("regels", st.slug, 900);
        },
      });
    }

    // Losse tips & tricks-video (16 dagen): eigen blok, direct aan het begin.
    if ((mediaBlokken?.[`${prog.slug}/${st.slug}-video-tips`]?.length ?? 0) > 0) {
      chunks.push({
        sleutel: "videotips",
        knopLabel: "de tips & tricks-video",
        speel: async () => {
          await mentorZegt(
            "Deze is goud: de tips & tricks van mensen die dit programma al honderden keren begeleid hebben. Acht minuutjes, kijk 'm even rustig 👇",
            900,
          );
          await mentorKaart("videotips", st.slug, 700);
        },
      });
    }

    if (st.slug === "laaddagen") {
      chunks.push({
        sleutel: "kcal",
        knopLabel: "hoe ik je calorieën tel",
        speel: async () => {
          await mentorZegt(
            "Op je laaddagen is het simpel: eten! 😋 Zeg of stuur me gewoon alles wat je eet (een foto van je bord of de verpakking mag ook), dan tel ik je calorieën automatisch mee. Bovenin zie je je teller richting de 3500+ lopen. Foutje gemaakt? Zeg gewoon \"haal die laatste weg\". Kom je in je documenten nog de FatSecret-app tegen: die zou je kunnen gebruiken, maar dit is makkelijker, ik reken alles voor je uit.",
            1100,
          );
        },
      });
    }

    // De 16 dagen: laten zien wat je allemaal aan de Mentor hebt
    // (feedback Raoul 19 juli: hij was te bescheiden over zichzelf).
    if (st.slug === "zestien-dagen") {
      chunks.push({
        sleutel: "kan",
        knopLabel: "wat je allemaal aan mij hebt",
        speel: async () => {
          await mentorZegt(
            "Even zodat je weet wat je de komende 16 dagen allemaal aan me hebt 💪\n\n📷 Twijfel je bij een product, thuis of in de winkel? Stuur een foto van de ingrediëntenlijst en ik zeg je direct of het in jouw programma past.\n🍽️ Zeg wat je in huis hebt en ik maak er een recept, dagschema of weekmenu van dat precies binnen je lijst valt.\n🍬 Suiker heeft ruim 150 schuilnamen op etiketten; ik herken ze allemaal.\n💊 Alles over je producten, je schema en je doseringen weet ik uit je eigen boekje.\n📔 En elke dag doe ik een korte check-in met je, zodat je je voortgang echt ziet groeien.\n\nPraat gewoon tegen me of typ, wat jij fijn vindt. Ik ben er dag en nacht.",
            1200,
          );
        },
      });
    }

    const heeftDocs =
      st.documenten.length > 0 ||
      (mediaBlokken?.[`${prog.slug}/${st.slug}-docs`]?.length ?? 0) > 0;
    if (heeftDocs) {
      const isStart = st.slug === "start" || st.slug === "voorbereiding";
      chunks.push({
        sleutel: "docs",
        knopLabel: "je documenten voor deze fase",
        speel: async () => {
          await mentorZegt(
            isStart
              ? `Hier zijn je documenten, alvast voor je klaargezet. 📖 Neem ze even goed door, dan weet je precies wat de bedoeling is en wat er allemaal aankomt.${prog.slug === "reset" ? " Print je boekje en het meet- en weegschema gerust uit, dat werkt het fijnst." : " Je boekje even uitprinten werkt het fijnst."} En het mooie: ik ken al deze documenten van binnen en van buiten, dus alles wat je erin leest kun je me ook gewoon vragen. Ik maak trouwens ook een recept of een dag- of weekschema dat precies in jouw fase past; zeg maar wat je in huis hebt.`
              : `Dit hoort bij deze fase, alvast klaargezet. 📖 Lees het even rustig door zodat je weet wat er komt. En ik ken alles wat erin staat, dus vraag me gerust van alles, of laat me een recept of dagschema voor je maken.`,
            1100,
          );
          await mentorKaart("documenten", st.slug, 700);
        },
      });
    }

    if (["zestien-dagen", "omschakeling"].includes(st.slug)) {
      chunks.push({
        sleutel: "suikers",
        knopLabel: "een handige suiker-tip",
        speel: async () => {
          await mentorZegt(
            `Eentje die bijna niemand weet: op etiketten heet suiker zelden gewoon "suiker". Er zijn wel 150 schuilnamen. Scroll maar eens door dit spiekbriefje, en twijfel je in de winkel: stuur me een foto van de ingrediëntenlijst, dan kijk ik mee 📷`,
            1100,
          );
          await mentorKaart("suikers", st.slug, 800);
        },
      });
    }

    const tp = TOUCHPOINT_BIJ_STATION[st.slug];
    if (tp && !isBouwer && rol !== "member" && !verteldRef.current.has(tp)) {
      chunks.push({
        sleutel: "touchpoint",
        knopLabel: "nog iets leuks om te weten",
        speel: async () => {
          await speelTouchpoint(tp);
        },
      });
    }

    return chunks;
  }

  // Houd openstaande "Verder met"-knoppen altijd ONDERAAN het gesprek:
  // na een tussendoortje (check-in, vraag aan de Mentor, kcal-melding)
  // zakt de knop mee, anders raakt hij begraven en weet niemand meer wat
  // de volgende stap is (bug 18 juli).
  function knoppenNaarOnder() {
    setItems((b) => {
      const knoppen = b.filter((x) => x.soort === "verder-knop");
      if (knoppen.length === 0) return b;
      if (b[b.length - 1]?.soort === "verder-knop") return b;
      return [...b.filter((x) => x.soort !== "verder-knop"), ...knoppen];
    });
  }

  // Toon een "Verder met [het volgende blok]"-knop.
  function toonVerderKnop(index: number, stationSlug: string) {
    const chunk = chunkPlanRef.current[index];
    if (!chunk) return;
    const bid = ++bidTeller.current;
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "verder-knop",
        bid,
        label: chunk.knopLabel,
        actie: { type: "chunk", index, stationSlug },
      },
    ]);
  }

  // Afsluiten van een stap: rustige slottekst + knop naar de volgende stap.
  async function sluitStationAf(prog: ResetProgramma, st: ResetStation) {
    const i = prog.stations.findIndex((s) => s.slug === st.slug);
    const isLaatste = i >= prog.stations.length - 1;
    const duur = FASE_DAGEN[st.slug];

    // Info-klaar is NIET fase-klaar (bug 18 juli): wie op dag 1 alles
    // doorklikt krijgt hier een logisch rustpunt, niet het einde-verhaal.
    // Het echte einde (webshop-moment + vervolg) is tijd-gebonden en komt
    // via dueEinde zodra de dagen er echt op zitten.
    // De start-vraag komt vroeg (na de voorbereidings-info); op de eerste
    // duur-fase blijft hij als vangnet voor wie er langs klikte.
    const vraagStart =
      (START_VRAAG_STATION[prog.slug] === st.slug ||
        EERSTE_DUUR_STATION[prog.slug] === st.slug) &&
      !startGekozenRef.current;
    const duurVoorVraag = FASE_DAGEN[EERSTE_DUUR_STATION[prog.slug] ?? ""];

    if (isLaatste) {
      await mentorZegt(
        duur
          ? `Dat was alle informatie voor deze fase 💚 Vraag me tussendoor van alles, ik ken al je documenten van binnen en van buiten en maak zo een recept of dagschema voor je.`
          : `Dat was alles voor deze stap 💚 Vraag me gerust van alles, ik ken al je documenten van binnen en van buiten en maak zo een recept of dagschema voor je.`,
        1100,
      );
      if (vraagStart) await toonStartKeuze(duurVoorVraag);
      else if (duur) {
        await mentorZegt(
          `Neem er rustig je ${duur} dagen voor, ik zie je elke dag bij je check-in. En als je dagen erop zitten, vertel ik je alles over je vervolg.`,
          900,
        );
      }
      return;
    }

    // Na de start-vraag géén "Verder met"-knop: het vervolg stroomt
    // vanzelf door zodra het startmoment gekozen is (feedback Raoul).
    if (vraagStart) {
      await mentorZegt(
        "Dat was je voorbereidings-informatie 💚 Vraag me gerust van alles, ik ken al je documenten van binnen en van buiten.",
        1000,
      );
      await toonStartKeuze(duurVoorVraag);
      return;
    }

    await mentorZegt(
      duur
        ? `Dat was de informatie voor deze fase 💚 Neem er rustig je ${duur === 2 ? "twee laaddagen" : `${duur} dagen`} voor, ik zie je elke dag bij je check-in. Klaar met alle dagen? Tik dan hieronder op de volgende stap.`
        : "Dat was alles voor deze stap 💚 Vraag me gerust van alles, ik ken al je documenten van binnen en van buiten en maak zo een recept of dagschema voor je.",
      1000,
    );
    const volgend = prog.stations[i + 1];
    const bid = ++bidTeller.current;
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "verder-knop",
        bid,
        label: `${volgend.emoji} ${volgend.naam}`,
        actie: { type: "station", slug: volgend.slug },
      },
    ]);
  }

  // Klant tikt op een "Verder met"-knop: knop weghalen, blok afspelen, en
  // daarna de knop voor het volgende blok tonen (of de stap afsluiten).
  async function klikVerder(item: Extract<ChatItem, { soort: "verder-knop" }>) {
    if (bezig) return;
    setItems((b) =>
      b.filter((x) => !(x.soort === "verder-knop" && x.bid === item.bid)),
    );
    if (item.actie.type === "station") {
      await naarStation(item.actie.slug, true);
      return;
    }
    const { index, stationSlug } = item.actie;
    if (station?.slug !== stationSlug) return;
    const chunk = chunkPlanRef.current[index];
    if (!chunk) return;
    setItems((b) => [
      ...b,
      { van: "ik", soort: "tekst", tekst: `Verder met ${chunk.knopLabel}` },
    ]);
    logNaarServer([
      { van: "klant", soort: "tekst", tekst: `Verder met ${chunk.knopLabel}` },
    ]);
    await chunk.speel();
    if (index + 1 < chunkPlanRef.current.length) {
      toonVerderKnop(index + 1, stationSlug);
    } else if (programma && station) {
      await sluitStationAf(programma, station);
    }
  }

  async function introStation(prog: ResetProgramma, st: ResetStation) {
    setStation(st);
    await mentorZegt(`${st.emoji} ${st.naam} · ${st.duur}\n\n${st.welkom}`, 1100);
    // Video meteen bij het welkom (Boardslink-stijl), met de belofte dat de
    // rest daarna stap voor stap komt.
    const heeftVideo =
      st.videoSlots.length > 0 ||
      (mediaBlokken?.[`${prog.slug}/${st.slug}-video`]?.length ?? 0) > 0;
    if (heeftVideo) {
      await wacht(600);
      await mentorZegt(
        "Kijk deze video even rustig. 👇 Daarna laat ik je stap voor stap zien wat er komt.",
        900,
      );
      await mentorKaart("video", st.slug, 700);
    }
    // De rest van de stap komt geleidelijk, via "Verder met ..."-knoppen.
    chunkPlanRef.current = bouwChunks(prog, st);
    if (chunkPlanRef.current.length > 0) {
      await wacht(500);
      toonVerderKnop(0, st.slug);
    } else {
      await sluitStationAf(prog, st);
    }
  }

  async function kiesProgramma(slug: string) {
    const prog = programmaVoor(slug);
    if (!prog) return;
    setProgramma(prog);
    setItems((b) => [
      ...b,
      { van: "ik", soort: "tekst", tekst: `Ik doe ${prog.naam} ${prog.emoji}` },
    ]);
    await mentorZegt(
      `Wat goed! Ik loop elke stap met je mee, samen met ${begeleiderNaam}. We beginnen bij het begin:`,
      1000,
    );
    await wacht(500);
    // Darmen in Balans: eerst even weten welk pakket (basis/plus).
    if (prog.slug === "darm" && !pakketRef.current) {
      await toonPakketKeuze(async () => {
        await introStation(prog, prog.stations[0]);
      });
    } else {
      await introStation(prog, prog.stations[0]);
    }
    // Bewust GEEN check-in op het allereerste moment (te vroeg, feedback
    // Raoul): die hoort bij terugkomen op een nieuwe dag. In de preview
    // zit hij in het Groeipad-menu als tijdmachine-knop.
  }

  async function naarStation(slug: string, viaMenu = false) {
    if (!programma) return;
    const nieuw = stationVoor(programma.slug, slug);
    if (!nieuw || nieuw.slug === station?.slug) return;
    const echo = viaMenu ? `Ik wil naar ${nieuw.naam}` : "Verder!";
    setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echo }]);
    logNaarServer([{ van: "klant", soort: "tekst", tekst: echo }]);
    if (token) {
      fetch("/api/resetcode/stap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, station: nieuw.slug }),
      }).catch(() => {});
    }
    await introStation(programma, nieuw);
  }

  // Zachte intent-herkenning: houdt kaart-verzoeken en "verder" in de
  // flow van het gesprek, al het andere gaat naar de echte Mentor.
  async function lokaleIntent(vraag: string): Promise<boolean> {
    if (!programma || !station) return false;
    const t = vraag.toLowerCase();
    const zeg = () => {
      setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: vraag }]);
      logNaarServer([{ van: "klant", soort: "tekst", tekst: vraag }]);
    };

    // Startmoment aanpassen: toont het keuzekaartje opnieuw (de belofte
    // "typ 'ik start eerder'" moet echt werken).
    if (
      /^\s*(ik (wil |ga )?(toch )?(eerder|vandaag|later) (starten|beginnen)|ik start (toch )?(eerder|vandaag|later)|start(dag|datum|moment)? (aanpassen|veranderen|wijzigen)|andere start(dag|datum)?)\s*[!.]?\s*$/.test(
        t,
      )
    ) {
      zeg();
      startGekozenRef.current = false;
      await mentorZegt(
        "Helemaal goed, kies maar: wanneer wordt jouw dag 1? 🚀",
        800,
      );
      const bid = ++bidTeller.current;
      setItems((b) => [...b, { van: "mentor", soort: "start-keuze", bid }]);
      return true;
    }

    // "Verder" alleen als het echt een los commando is: het woord kan ook
    // gewoon in een vraag zitten ("hoe gaat het verder na fase 2?") en dan
    // mag de klant NIET zomaar een stap doorschuiven.
    if (
      /^\s*(verder|volgende( stap| fase)?|door naar de volgende( stap| fase)?|ik ben klaar met deze( stap| fase)?)\s*[!.]?\s*$/.test(
        t,
      )
    ) {
      const i = programma.stations.findIndex((s) => s.slug === station.slug);
      if (i < programma.stations.length - 1) {
        zeg();
        const volgend = programma.stations[i + 1];
        if (token) {
          fetch("/api/resetcode/stap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, station: volgend.slug }),
          }).catch(() => {});
        }
        await introStation(programma, volgend);
      } else {
        // Expliciete klaar-route: de klant zégt zelf dat de dagen erop
        // zitten. Dan mag het einde-moment nu spelen (eenmalig).
        zeg();
        await mentorZegt("Je bent bij de laatste stap van je programma! 🎉", 800);
        if (programma.slug === "darm") {
          await speelTouchpoint("darm-einde");
        }
        await mentorKaart("vervolg", station.slug);
        markeerTouchpoint("programma-einde" as TouchpointSleutel);
      }
      return true;
    }
    // Alleen als los commando ("tips"), niet als onderdeel van een echte
    // vraag ("heb je tips tegen hoofdpijn?" hoort naar de Mentor zelf).
    if (/^\s*(je |jouw |de )?tips\s*\??\s*$/.test(t)) {
      zeg();
      await mentorZegt("Zeker! Dit is wat mensen vóór jou het meest hielp:", 800);
      await mentorKaart("tips", station.slug);
      return true;
    }
    if (/\bdocument|boekje(s)?\b/.test(t) && t.length < 50) {
      zeg();
      await mentorZegt("Dit hoort allemaal bij deze fase:", 700);
      await mentorKaart("documenten", station.slug);
      return true;
    }
    if (/\bvideo|filmpje\b/.test(t) && t.length < 40 && station.videoSlots.length) {
      zeg();
      await mentorKaart("video", station.slug, 800);
      return true;
    }
    // Specifieke product-vragen ("staat kwark op de lijst?") horen naar de
    // Mentor; alleen de brede lijst-vraag krijgt de kaart.
    if (
      /^(wat mag ik( wel| allemaal)? eten\??|wel en niet\??|(de |eet|voedings)?lijst\??)\s*$/.test(t) &&
      (station.welLijst.length || station.nietLijst.length)
    ) {
      zeg();
      await mentorZegt("Kijk, zo simpel is het eigenlijk:", 800);
      await mentorKaart("welniet", station.slug);
      if (station.graphic === "logi-piramide") await mentorKaart("logi", station.slug, 600);
      return true;
    }
    if (/(vaak gevraagd|veelgestelde|faq)/.test(t)) {
      zeg();
      await mentorKaart("faq", station.slug, 800);
      return true;
    }
    // Contact met de begeleider: de kaart met de appje-knop neerleggen
    // (de Mentor kan zelf niets doorgeven). Bewust smal gehouden: "mag er
    // kaas erbij?" is een eet-vraag, geen contact-verzoek.
    const wilBegeleider =
      t.includes(begeleiderNaam.toLowerCase()) &&
      /\b(app|bel|spreek|bereik|erbij|contact|bericht)/.test(t);
    if (
      wilBegeleider ||
      /^\s*(contact|appje)\s*\??\s*$/.test(t) ||
      /(contact opnemen|erbij halen|haal .* erbij|begeleider (erbij|spreken|appen))/.test(t)
    ) {
      zeg();
      await mentorZegt(
        `Stuur ${begeleiderNaam} gewoon zelf even een appje, dat werkt het snelst en het is meteen persoonlijk. Hier is de knop:`,
        800,
      );
      await mentorKaart("contact", station.slug);
      return true;
    }
    if (/piramide|80\/20|kompas/.test(t) && station.graphic === "logi-piramide") {
      zeg();
      await mentorKaart("logi", station.slug, 800);
      return true;
    }
    if (/suikerlijst|suikernamen|suiker.*(lijst|namen|spiek)/.test(t)) {
      zeg();
      await mentorZegt("Goeie! Hier is het complete spiekbriefje uit jullie materiaal:", 700);
      await mentorKaart("suikers", station.slug);
      return true;
    }
    if (/\bwc\b|stoelgang|obstipatie|verstopping|poepen/.test(t) && t.length < 80) {
      zeg();
      await mentorKaart("wctips", station.slug, 900);
      return true;
    }
    // Voortgang / dagboek terugzien. "Overzicht" hoort hier ook bij: dat
    // moet de ECHTE kaart tonen, niet iets dat de vrije Mentor uit het
    // gesprek terugvertelt (feedback Raoul 20 juli).
    if (
      /(mijn |m'n )?(voortgang|overzicht|dagboek|resultaten tot nu|hoe ver|mijn reis|mijn grafiek)/.test(t) &&
      t.length < 45
    ) {
      zeg();
      if (checkinReeksRef.current.length === 0) {
        await mentorZegt(
          "Je bent net begonnen, dus er is nog niet veel om te laten zien. Doe je dagelijkse check-in, dan bouw ik vanaf nu je voortgang voor je op 💚",
          800,
        );
        await toonCheckin(false);
      } else {
        await mentorZegt("Kijk eens, dit heb je tot nu toe opgebouwd:", 700);
        setItems((b) => [...b, { van: "mentor", soort: "voortgang" }]);
      }
      return true;
    }
    // Check-in op verzoek. Ruim herkend (niet alleen het kale commando,
    // ook "wil je mijn check-in doen?" / "kan ik inchecken?"), want een
    // losse zin mag niet naar de vrije Mentor lekken en daar een
    // geïmproviseerd "overzicht" opleveren (feedback Raoul 20 juli).
    if (
      (/\b(check-?in|inchecken)\b/.test(t) && t.length < 60) ||
      /^\s*hoe voel ik me( vandaag)?\s*\??\s*$/.test(t)
    ) {
      zeg();
      checkinGedaanRef.current = false;
      await toonCheckin(true);
      return true;
    }
    return false;
  }

  // Spraak: opnemen met MediaRecorder en uitschrijven via Whisper
  // (/api/voice-transcribe). Betrouwbaarder dan de ingebouwde
  // browser-spraakherkenning, die op iPhones wispelturig is.
  async function startStopOpname() {
    if (opneemt) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType =
        ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find(
          (m) => MediaRecorder.isTypeSupported(m),
        ) ?? "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setOpneemt(false);
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size < 1500) return; // te kort, per ongeluk getikt
        setVerwerkt(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob);
          fd.append("taal", "nl");
          if (token) fd.append("resetToken", token);
          const res = await fetch("/api/voice-transcribe", {
            method: "POST",
            body: fd,
          });
          const data = (await res.json().catch(() => null)) as
            | { tekst?: string; fout?: string }
            | null;
          const tekst = data?.tekst?.trim();
          if (res.ok && tekst) {
            await verstuur(tekst);
          } else {
            await mentorZegt(
              "Ik kon je even niet goed verstaan. Probeer het nog een keer, of typ je vraag gewoon.",
              300,
            );
          }
        } catch {
          await mentorZegt(
            "Het opnemen lukte net niet, probeer het nog een keer of typ je vraag.",
            300,
          );
        } finally {
          setVerwerkt(false);
        }
      };
      recorder.start();
      setOpneemt(true);
    } catch {
      await mentorZegt(
        "Ik mag je microfoon nog niet gebruiken. Geef de browser even toestemming (bij de site-instellingen) en probeer het opnieuw.",
        300,
      );
    }
  }

  async function kiesFoto(bestand: File) {
    if (!programma || !station || bezig) return;
    if (bestand.size > 4_000_000) {
      await mentorZegt(
        "Die foto is net iets te groot voor mij. Probeer het nog eens zonder maximale kwaliteit, dan kijk ik meteen mee!",
        400,
      );
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const lezer = new FileReader();
      lezer.onload = () => resolve(String(lezer.result));
      lezer.onerror = reject;
      lezer.readAsDataURL(bestand);
    });
    setItems((b) => [...b, { van: "ik", soort: "foto", dataUrl }]);
    if (await probeerKcal("", dataUrl)) return;
    await roepMentor("", dataUrl);
  }

  // Laaddagen-calorieteller: eet-meldingen (tekst of foto) worden eerst
  // door de teller beoordeeld; geen eet-melding → gewone Mentor.
  async function probeerKcal(vraag: string, foto: string | null): Promise<boolean> {
    if (station?.slug !== "laaddagen") return false;
    setBezig(true);
    setMentorTypt(true);
    try {
      const res = await fetch("/api/resetcode/kcal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token ?? undefined,
          vraag,
          foto: foto ?? undefined,
          huidigTotaal: kcalTotaal,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        eten?: boolean;
        actie?: string;
        dagTotaal?: number | null;
        geschat?: number;
        antwoord?: string;
      } | null;
      if (res.ok && data?.eten && data.antwoord) {
        setItems((b) => [
          ...b,
          { van: "mentor", soort: "tekst", tekst: data.antwoord! },
        ]);
        setKcalTotaal((huidig) =>
          typeof data.dagTotaal === "number"
            ? data.dagTotaal
            : data.actie === "verwijder_laatste"
              ? huidig
              : huidig + (data.geschat ?? 0),
        );
        return true;
      }
    } catch {
      /* valt terug op de gewone Mentor */
    } finally {
      setMentorTypt(false);
      setBezig(false);
      knoppenNaarOnder();
    }
    return false;
  }

  async function verstuur(tekstOverride?: string) {
    const vraag = (tekstOverride ?? invoer).trim();
    if (!vraag || bezig || !programma || !station) return;
    setInvoer("");
    if (await lokaleIntent(vraag)) return;
    setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: vraag }]);
    if (await probeerKcal(vraag, null)) return;
    await roepMentor(vraag, null);
  }

  async function roepMentor(vraag: string, foto: string | null) {
    if (!programma || !station) return;
    setBezig(true);
    const historie = items
      .filter((i): i is Extract<ChatItem, { soort: "tekst" }> => i.soort === "tekst")
      .slice(-8)
      .map((i) => ({
        rol: i.van === "ik" ? ("gebruiker" as const) : ("mentor" as const),
        tekst: i.tekst,
      }));
    setItems((b) => [...b, { van: "mentor", soort: "tekst", tekst: "" }]);

    try {
      const res = await fetch("/api/resetcode-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vraag,
          foto: foto ?? undefined,
          token: token ?? undefined,
          voornaam: klantVoornaam ?? undefined,
          programma: programma.slug,
          station: station.slug,
          rol: isKlant ? "klant" : rol,
          geschiedenis: historie,
          pakket: pakketRef.current ?? undefined,
        }),
      });
      if (!res.ok || !res.body) {
        const fout = await res.text().catch(() => "onbekende fout");
        zetLaatsteMentorTekst(`Er ging iets mis: ${fout}`);
        return;
      }
      // De tekst komt sneller binnen dan een mens leest: toon 'm in
      // hetzelfde rustige woord-voor-woord-tempo als de vaste teksten,
      // terwijl de rest op de achtergrond binnenstroomt.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let ontvangen = "";
      let stroomKlaar = false;
      const toner = (async () => {
        let getoond = 0;
        for (;;) {
          if (getoond < ontvangen.length) {
            let grens = ontvangen.indexOf(" ", getoond + 1);
            if (grens === -1) {
              if (!stroomKlaar) {
                await wacht(40);
                continue;
              }
              grens = ontvangen.length;
            }
            getoond = grens;
            zetLaatsteMentorTekst(ontvangen.slice(0, getoond));
            await wacht(55);
          } else if (stroomKlaar) {
            zetLaatsteMentorTekst(ontvangen);
            break;
          } else {
            await wacht(40);
          }
        }
      })();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        ontvangen += decoder.decode(value, { stream: true });
      }
      stroomKlaar = true;
      await toner;
    } catch {
      zetLaatsteMentorTekst("De verbinding viel even weg, probeer het nog een keer.");
    } finally {
      setBezig(false);
      knoppenNaarOnder();
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
      <p className="text-[13px] font-bold text-emerald-300 mb-1.5">
        {emoji} {titel}
      </p>
    );
    const kader =
      "rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3";

    switch (item.kaart) {
      case "regels":
        return (
          <div className={kader}>
            {kop("✅", "De regels van nu")}
            <ul className="space-y-2">
              {st.vandaagBelangrijk.map((r, i) => (
                <li key={i} className="text-[14px] text-white/85 leading-relaxed flex gap-2">
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
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Mag lekker</p>
                {st.welLijst.map((w, i) => (
                  <p key={i} className="text-[12px] text-white/80 leading-relaxed">• {w}</p>
                ))}
              </div>
              <div>
                <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1">Even niet</p>
                {st.nietLijst.map((n, i) => (
                  <p key={i} className="text-[12px] text-white/70 leading-relaxed">• {n}</p>
                ))}
              </div>
            </div>
          </div>
        );
      case "tips":
        return (
          <div className={kader}>
            {kop("💡", "Tips van mensen die je voorgingen")}
            <ul className="space-y-2">
              {st.tips.map((t, i) => (
                <li key={i} className="text-[14px] text-white/85 leading-relaxed flex gap-2">
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
            <div className="space-y-3">
              {st.veelgesteld.map((v, i) => (
                <div key={i}>
                  <p className="text-[14px] font-semibold text-white/95">{v.vraag}</p>
                  <p className="text-[13px] text-white/70 leading-relaxed mt-0.5">{v.antwoord}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "video": {
        const blokken =
          mediaBlokken?.[`${programma.slug}/${st.slug}-video`] ?? [];
        return (
          <div className={kader}>
            {kop("🎬", "Video bij deze fase")}
            {(blokken.length > 0 || isFounder) && (
              <div className="mt-1.5">
                <MediaBlokken
                  paginaNamespace="resetcode-klant"
                  paginaId={programma.slug}
                  positie={`${st.slug}-video`}
                  blokken={blokken}
                  isFounder={Boolean(isFounder)}
                />
              </div>
            )}
            {blokken.length === 0 &&
              st.videoSlots.map((v, i) => (
                <div key={i} className="mt-1.5 rounded-xl bg-black/40 border border-dashed border-emerald-500/30 px-3 py-7 text-center">
                  <p className="text-[13px] text-white/70">▶️ {v}</p>
                  <p className="text-[10px] text-emerald-400/60 mt-1">
                    {isFounder
                      ? "vul deze plek via de edit-modus (potlood)"
                      : "deze video komt er binnenkort aan"}
                  </p>
                </div>
              ))}
          </div>
        );
      }
      case "videotips": {
        // Losse tips & tricks-video (eigen blok, feedback Raoul 18 juli).
        const blokken =
          mediaBlokken?.[`${programma.slug}/${st.slug}-video-tips`] ?? [];
        if (!blokken.length && !isFounder) return null;
        return (
          <div className={kader}>
            {kop("🎬", "Tips & tricks")}
            <div className="mt-1.5">
              <MediaBlokken
                paginaNamespace="resetcode-klant"
                paginaId={programma.slug}
                positie={`${st.slug}-video-tips`}
                blokken={blokken}
                isFounder={Boolean(isFounder)}
              />
            </div>
          </div>
        );
      }
      case "videodag10": {
        // De dag 10-video: komt pas op dag 10 in beeld (tijd-gebonden).
        const blokken =
          mediaBlokken?.[`${programma.slug}/${st.slug}-video-dag10`] ?? [];
        if (!blokken.length && !isFounder) return null;
        return (
          <div className={kader}>
            {kop("🎬", "Jouw dag 10-video")}
            <div className="mt-1.5">
              <MediaBlokken
                paginaNamespace="resetcode-klant"
                paginaId={programma.slug}
                positie={`${st.slug}-video-dag10`}
                blokken={blokken}
                isFounder={Boolean(isFounder)}
              />
            </div>
          </div>
        );
      }
      case "documenten": {
        const blokken =
          mediaBlokken?.[`${programma.slug}/${st.slug}-docs`] ?? [];
        return (
          <div className={kader}>
            {kop("📂", "Bij deze fase")}
            {(blokken.length > 0 || isFounder) && (
              <div className="mt-1.5">
                <MediaBlokken
                  paginaNamespace="resetcode-klant"
                  paginaId={programma.slug}
                  positie={`${st.slug}-docs`}
                  blokken={blokken}
                  isFounder={Boolean(isFounder)}
                />
              </div>
            )}
            {blokken.length === 0 && (
              <div className="space-y-1.5 mt-1.5">
                {st.documenten.map((d, i) => (
                  <div key={i} className="rounded-xl bg-black/30 border border-dashed border-emerald-500/25 px-3 py-2">
                    <p className="text-[13px] font-semibold text-white/90">{d.titel}</p>
                    <p className="text-[11px] text-white/55">{d.omschrijving}</p>
                    <p className="text-[10px] text-emerald-400/60 mt-0.5">
                      {isFounder
                        ? "vul deze plek via de edit-modus (potlood)"
                        : "komt er binnenkort aan"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      case "contact":
        return (
          <div className={kader}>
            {kop("🤝", `Samen met ${begeleiderNaam}`)}
            <p className="text-[14px] text-white/85 leading-relaxed">
              {st.contactMoment ??
                `Even iets delen of sparren? ${begeleiderNaam} is er voor je.`}
            </p>
            {isKlant && memberTelefoon ? (
              <a
                href={waLinkNaar(
                  memberTelefoon,
                  `Hoi ${begeleiderNaam}! Ik zit bij ${st.emoji} ${st.naam} in mijn programma. `,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
                style={{ backgroundColor: "#25D366" }}
              >
                📱 App {begeleiderNaam}
              </a>
            ) : (
              <button
                className="mt-2.5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white opacity-60 cursor-not-allowed"
                style={{ backgroundColor: "#25D366" }}
                title="Opent WhatsApp naar de begeleider (werkt op de echte klant-link)"
              >
                📱 App {begeleiderNaam}{" "}
                <span className="text-[10px] font-normal">(op de klant-link)</span>
              </button>
            )}
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
                  <p className="text-[10px] font-extrabold tracking-wider text-white/95">{laag.label}</p>
                  <p className="text-[11px] text-white/90">{laag.inhoud}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/50 text-center mt-1.5">hoe lager, hoe vaker op je bord</p>
          </div>
        );
      case "vervolg":
        return (
          <div className={kader}>
            {kop("🎉", "En daarna?")}
            <p className="text-[14px] text-white/85 leading-relaxed">{programma.vervolg}</p>
          </div>
        );
      case "suikers":
        return (
          <div className={kader}>
            {kop("🍬", "Suiker-spiekbriefje")}
            <p className="text-[12px] text-white/70 leading-relaxed mb-2">
              Suiker heet zelden gewoon &quot;suiker&quot;. Zie je één van
              deze namen in de ingrediëntenlijst, dan is het suiker. Twijfel
              je? Stuur me een foto van het etiket.
            </p>
            <div className="max-h-56 overflow-y-auto chatscroll rounded-xl bg-black/30 px-3 py-2">
              <p className="text-[11px] text-white/70 leading-relaxed">
                {SUIKER_NAMEN.join(" · ")}
              </p>
            </div>
          </div>
        );
      case "wctips":
        return (
          <div className={kader}>
            {kop("💩", "Moeilijk naar de wc?")}
            <p className="text-[12px] text-white/70 leading-relaxed mb-1.5">
              Komt vaker voor tijdens het programma en hoort erbij. Dit
              helpt, rechtstreeks uit het programma-materiaal:
            </p>
            <ul className="space-y-1.5">
              {WC_TIPS.map((tip, i) => (
                <li key={i} className="text-[13px] text-white/85 leading-relaxed flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        );
    }
  }

  // ---------- render ----------

  return (
    <div className="relative flex h-full flex-col" style={{ backgroundColor: "#0F1B17" }}>
      <style>{`
        @keyframes pols { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
        @keyframes verschijn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes stip { 0%,60%,100% { transform: translateY(0); opacity:.4 } 30% { transform: translateY(-4px); opacity:1 } }
        .pols { animation: pols 2.2s ease-in-out infinite }
        .verschijn { animation: verschijn .35s ease-out both }
        .chatscroll { scrollbar-width: none; -ms-overflow-style: none }
        .chatscroll::-webkit-scrollbar { display: none }
        .typstip { display:inline-block; width:7px; height:7px; border-radius:9999px; background:#6EE7B7; margin-right:4px; animation: stip 1.2s infinite }
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
          <p className="text-white font-bold text-[15px] leading-tight">Je Mentor</p>
          <p className="text-emerald-400/80 text-[11px]">
            {mentorTypt || bezig ? "is aan het typen..." : "altijd wakker · kent jouw hele reis"}
          </p>
        </div>
        {programma && station && (
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            {station.slug === "laaddagen" && (
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{
                  backgroundColor: kcalTotaal >= 3500 ? "#065F46" : "#7C2D12",
                  color: kcalTotaal >= 3500 ? "#6EE7B7" : "#FDBA74",
                }}
                title="Jouw laaddag-teller: meld gewoon wat je eet"
              >
                🔥 ±{kcalTotaal} / 3500+
              </span>
            )}
            <button
              onClick={() => setToonReis((t) => !t)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/85 hover:bg-white/15"
              title="Bekijk jouw pad"
            >
              🗺️ {station.nummer}/{programma.stations.length}
            </button>
          </div>
        )}
      </header>

      {/* Groeipad: het hele pad van A tot Z, met waar je nu bent, wat je al
          hebt gehad (terug te lezen) en wat er nog komt (met slotje). */}
      {toonReis && programma && station && (
        <div className="absolute inset-0 z-30 overflow-y-auto chatscroll" style={{ backgroundColor: "#0A1512" }}>
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ backgroundColor: "#0A1512" }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">
                {programma.emoji} {programma.naam}
              </p>
              <p className="text-white font-serif-warm text-xl">Jouw pad</p>
            </div>
            <button
              onClick={() => setToonReis(false)}
              className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/85"
            >
              Sluiten
            </button>
          </div>

          <div className="px-5 py-5">
            {/* Dag-teller van de huidige fase */}
            {dagNummer && FASE_DAGEN[station.slug] && (
              <div className="mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 text-center">
                <p className="text-emerald-200 text-[14px] font-semibold">
                  Dag {Math.min(dagNummer, FASE_DAGEN[station.slug])} van{" "}
                  {FASE_DAGEN[station.slug]} · {station.naam}
                </p>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: `${Math.min(100, (dagNummer / FASE_DAGEN[station.slug]) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* De stations, met een verbindingslijn ertussen */}
            <div className="relative pl-8">
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10" />
              {programma.stations.map((s) => {
                const gedaan = s.nummer < station.nummer;
                const nu = s.slug === station.slug;
                const komt = s.nummer > station.nummer;
                return (
                  <button
                    key={s.slug}
                    onClick={() => {
                      if (komt) return; // vooruit kijken mag, niet openen
                      setToonReis(false);
                      naarStation(s.slug, true);
                    }}
                    disabled={komt}
                    className="relative flex items-center gap-3 w-full text-left mb-3 last:mb-0"
                  >
                    <span
                      className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${
                        nu ? "pols" : ""
                      }`}
                      style={{
                        backgroundColor: nu
                          ? "#059669"
                          : gedaan
                            ? "#0A3D2C"
                            : "#141f1b",
                        border: nu
                          ? "2px solid #6EE7B7"
                          : gedaan
                            ? "2px solid #34D39955"
                            : "2px dashed #ffffff22",
                      }}
                    >
                      {gedaan ? "✓" : komt ? "🔒" : s.emoji}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-[14px] font-semibold ${nu ? "text-white" : gedaan ? "text-white/80" : "text-white/40"}`}
                      >
                        {s.naam}
                      </p>
                      <p className="text-[11px] text-white/40">
                        {nu
                          ? "je bent hier"
                          : gedaan
                            ? "afgerond · tik om terug te lezen"
                            : "komt eraan"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Vergezicht: wat er ná dit programma kan (bergtoppen). */}
            {RESET_PROGRAMMAS.filter((p) => p.slug !== programma.slug).length >
              0 && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[12px] text-white/50 mb-2">
                  ⛰️ En daarna kan er nog meer
                </p>
                <div className="space-y-2">
                  {RESET_PROGRAMMAS.filter((p) => p.slug !== programma.slug).map(
                    (p) => (
                      <div
                        key={p.slug}
                        className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-3 py-2.5"
                      >
                        <span className="text-xl opacity-60">{p.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white/70">
                            {p.naam}
                          </p>
                          <p className="text-[11px] text-white/40 truncate">
                            {p.duur} · samen te kiezen met {begeleiderNaam}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Voortgang + preview-extra's */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setToonReis(false);
                  setItems((b) => [...b, { van: "mentor", soort: "voortgang" }]);
                }}
                className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-[12px] font-semibold text-emerald-300"
              >
                📈 Mijn voortgang
              </button>
              {!isKlant && (
                <>
                  {["zestien-dagen", "omschakeling"].includes(station.slug) && (
                    <button
                      onClick={() => {
                        setToonReis(false);
                        verteldRef.current.delete("kern-verhaal");
                        speelTouchpoint("kern-verhaal");
                      }}
                      className="rounded-full px-4 py-2 text-[12px] font-semibold bg-sky-500/20 text-sky-300"
                    >
                      ⏩ dag 5-7 moment
                    </button>
                  )}
                  {station.slug === "zestien-dagen" && (
                    <button
                      onClick={async () => {
                        setToonReis(false);
                        await mentorZegt(
                          "Trouwens: je zit vandaag op dag 10 van je 16 dagen! 🎉 Dit is het moment voor je dag 10-video, die is belangrijk. Kijk 'm even rustig 👇",
                          900,
                        );
                        await mentorKaart("videodag10", station.slug, 700);
                      }}
                      className="rounded-full px-4 py-2 text-[12px] font-semibold bg-sky-500/20 text-sky-300"
                    >
                      ⏩ dag 10-moment
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      setToonReis(false);
                      // Tester-knop simuleert een nieuwe dag: altijd tonen,
                      // ook als er vandaag al ingecheckt is.
                      checkinGedaanRef.current = false;
                      await wacht(400);
                      await toonCheckin(true);
                    }}
                    className="rounded-full px-4 py-2 text-[12px] font-semibold bg-sky-500/20 text-sky-300"
                  >
                    ⏩ ochtend check-in
                  </button>
                  <button
                    onClick={async () => {
                      setToonReis(false);
                      verteldRef.current.delete("week-terugblik-1");
                      await speelWeekTerugblik(1);
                    }}
                    className="rounded-full px-4 py-2 text-[12px] font-semibold bg-sky-500/20 text-sky-300"
                  >
                    ⏩ week-overzicht
                  </button>
                  {programma.stations[programma.stations.length - 1]?.slug ===
                    station.slug && (
                    <button
                      onClick={async () => {
                        setToonReis(false);
                        await mentorZegt(
                          "...je hebt het gedaan. Álle dagen. 🎉 Ik ben oprecht trots op je. Neem even een moment om dat te voelen: dit heb jíj gedaan.",
                          900,
                        );
                        await wacht(800);
                        if (programma.slug === "darm") {
                          verteldRef.current.delete("darm-einde");
                          await speelTouchpoint("darm-einde");
                        }
                        await mentorKaart("vervolg", station.slug, 700);
                      }}
                      className="rounded-full px-4 py-2 text-[12px] font-semibold bg-sky-500/20 text-sky-300"
                    >
                      ⏩ einde-moment
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setToonReis(false);
                      try {
                        localStorage.removeItem(OPSLAG_SLEUTEL);
                      } catch {}
                      checkinReeksRef.current = [];
                      checkinGedaanRef.current = false;
                      pakketRef.current = null;
                      startGekozenRef.current = false;
                      gestart.current = true;
                      versBeginnen();
                    }}
                    className="rounded-full px-4 py-2 text-[12px] font-semibold bg-rose-500/20 text-rose-300"
                  >
                    ↺ opnieuw beginnen
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gesprek */}
      <div ref={scrollRef} className="chatscroll flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {items.map((item, i) => {
          if (item.van === "ik" && item.soort === "foto") {
            return (
              <div key={i} className="verschijn max-w-[70%] ml-auto rounded-2xl rounded-tr-sm overflow-hidden border border-emerald-600/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.dataUrl} alt="etiket-foto" className="w-full" />
              </div>
            );
          }
          if (item.van === "ik") {
            return (
              <div key={i} className="verschijn max-w-[80%] ml-auto rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-2.5">
                <p className="text-[15px] text-white leading-relaxed">{item.tekst}</p>
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
                    <p className="text-[15px] font-bold text-white">
                      {prog.emoji} {prog.naam}
                      <span className="text-emerald-400/80 font-semibold text-[11px] ml-2">{prog.duur}</span>
                    </p>
                    <p className="text-[13px] text-white/65 leading-relaxed mt-0.5">{prog.payoff}</p>
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
          if (item.soort === "verder-knop") {
            return (
              <button
                key={i}
                onClick={() => klikVerder(item)}
                disabled={bezig}
                className="verschijn w-fit max-w-[92%] flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-5 py-3 text-left hover:bg-emerald-500/20 disabled:opacity-40 transition-colors"
              >
                <span className="text-emerald-300 text-[14px] font-semibold">
                  Verder met: {item.label}
                </span>
                <span className="text-emerald-400 text-lg">→</span>
              </button>
            );
          }
          if (item.soort === "checkin-vraag") {
            return (
              <div key={i} className="verschijn max-w-[92%]">
                <CheckinVraag
                  bezig={checkinBezig}
                  onKies={(invoer) => verstuurCheckin(invoer)}
                />
              </div>
            );
          }
          if (item.soort === "start-keuze") {
            return (
              <div key={i} className="verschijn max-w-[92%]">
                <StartKeuze
                  onKies={(datum, label, alGestart) =>
                    kiesStart(datum, label, alGestart)
                  }
                />
              </div>
            );
          }
          if (item.soort === "pakket-keuze") {
            return (
              <div key={i} className="verschijn max-w-[92%] space-y-2">
                <button
                  onClick={() => kiesPakket("basis")}
                  className="w-full text-left rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3 hover:border-emerald-400/50 transition-colors"
                >
                  <p className="text-[15px] font-bold text-white">🔴 Darmen in Balans</p>
                  <p className="text-[12px] text-white/60">
                    Het basispakket: 5 producten, het rode schema
                  </p>
                </button>
                <button
                  onClick={() => kiesPakket("plus")}
                  className="w-full text-left rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3 hover:border-emerald-400/50 transition-colors"
                >
                  <p className="text-[15px] font-bold text-white">🔵 Darmen in Balans Plus</p>
                  <p className="text-[12px] text-white/60">
                    Het plus-pakket: 8 producten, het blauwe schema
                  </p>
                </button>
              </div>
            );
          }
          if (item.soort === "voortgang") {
            return (
              <div key={i} className="verschijn max-w-[92%]">
                <VoortgangKaart reeks={checkinReeksRef.current} />
              </div>
            );
          }
          if (item.soort === "push-opt-in") {
            return (
              <div
                key={i}
                className="verschijn max-w-[92%] flex flex-wrap gap-2"
              >
                <button
                  onClick={() => zetPushAan(item.bid)}
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-[14px] font-bold text-white"
                >
                  🔔 Ja, graag een seintje
                </button>
                <button
                  onClick={() => weigerPush(item.bid)}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-[14px] font-semibold text-white/70"
                >
                  Nu even niet
                </button>
              </div>
            );
          }
          return (
            <div key={i} className="verschijn max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-2.5">
              <p className="text-[15px] text-white/90 leading-relaxed whitespace-pre-wrap">
                {item.tekst || (bezig && i === items.length - 1 ? "..." : "")}
              </p>
            </div>
          );
        })}

        {/* Typ-indicator */}
        {mentorTypt && (
          <div className="verschijn max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 w-fit">
            <span className="typstip" style={{ animationDelay: "0s" }} />
            <span className="typstip" style={{ animationDelay: ".15s" }} />
            <span className="typstip" style={{ animationDelay: ".3s", marginRight: 0 }} />
          </div>
        )}
      </div>

      {/* Invoer */}
      <div className="px-3 pb-4 pt-2.5 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            ref={fotoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) kiesFoto(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fotoRef.current?.click()}
            disabled={bezig || !programma}
            title="Stuur een foto van een etiket"
            className="h-11 w-11 flex-shrink-0 rounded-full bg-white/10 text-xl hover:bg-white/15 disabled:opacity-40"
          >
            📷
          </button>
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
                : opneemt
                  ? "Ik neem op... tik de knop om te stoppen 🎧"
                  : verwerkt
                    ? "Even luisteren wat je zei..."
                    : "Typ of praat..."
            }
            disabled={bezig || !programma}
            className="min-w-0 flex-1 rounded-full bg-white/10 border border-white/15 px-4 py-3 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60"
          />
          {invoer.trim() ? (
            <button
              onClick={() => verstuur()}
              disabled={bezig || !programma}
              className="h-12 w-12 flex-shrink-0 rounded-full bg-emerald-600 text-xl font-bold text-white disabled:opacity-30"
            >
              ➤
            </button>
          ) : (
            kanPraten && (
              <button
                onClick={startStopOpname}
                disabled={bezig || verwerkt || !programma}
                title={opneemt ? "Stop de opname" : "Praat tegen je Mentor"}
                className={`h-12 w-12 flex-shrink-0 rounded-full text-2xl shadow-xl transition-all disabled:opacity-40 ${opneemt || verwerkt ? "pols" : ""}`}
                style={{
                  background: opneemt
                    ? "radial-gradient(circle,#F87171 0%,#B91C1C 100%)"
                    : "radial-gradient(circle,#34D399 0%,#047857 100%)",
                }}
              >
                {opneemt ? "⏹" : verwerkt ? "⏳" : "🎙️"}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
