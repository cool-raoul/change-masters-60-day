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
import { innameVoorDag, formatInname } from "@/lib/resetcode/inname-schema";
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
  | { type: "station"; slug: string }
  | { type: "programma"; slug: string }
  | { type: "verlengen" }
  // Alvast lezen over een volgende fase, zonder er echt naartoe te gaan.
  | { type: "inkijk"; slug: string }
  // Opmaak-dagen (darm): dagelijks contact houden of rustig aan doen.
  | { type: "opmaak-dagelijks" }
  | { type: "opmaak-rustig" };

type Checkin = {
  datum: string;
  stemming: string | null;
  gewicht: number | null;
  notitie?: string | null;
  taille?: number | null;
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
// reset-complimenten zit hier bewust NIET meer bij: die komt via het
// dag-systeem (fase 3, dag 5+), zodat hij nooit vlak op het dag 22-
// aanbevelen-moment stapelt (feedback Raoul 22 juli).
const TOUCHPOINT_BIJ_STATION: Partial<Record<string, TouchpointSleutel>> = {
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

// Mijlpalen op het Groeipad (feedback Raoul 23 juli: het pad had geen
// beleving). Alleen momenten die ÉCHT in de reis gebeuren, per fase.
const FASE_MIJLPALEN: Record<string, { dag: number; label: string }[]> = {
  "darm/zestien-dagen": [
    { dag: 1, label: "Start: je eerste check-in en je dagschema" },
    { dag: 7, label: "Week 1 vol · je week-overzicht" },
    { dag: 10, label: "De belangrijke dag 10-video" },
    { dag: 14, label: "Vooruitblik: samen je vervolg plannen" },
    { dag: 16, label: "Laatste dag + je opmaak-uitleg" },
    { dag: 17, label: "🎉 Feest: jouw resultaten op een rij" },
  ],
  "reset/laaddagen": [
    { dag: 1, label: "Eten maar! Je teller loopt vanzelf mee" },
    { dag: 2, label: "Laatste laaddag, morgen begint fase 2" },
  ],
  "reset/omschakeling": [
    { dag: 1, label: "Start: je eerste check-in" },
    { dag: 7, label: "Week 1 vol · je week-overzicht" },
    { dag: 14, label: "Week 2 vol · je week-overzicht" },
    { dag: 20, label: "Vooruitkijken: jouw fase 3-keuze" },
    { dag: 21, label: "21 dagen vol: door of verlengen (tot 40)" },
  ],
  "reset/stabilisatie": [
    { dag: 1, label: "Start: vetten rustig terugbrengen" },
    { dag: 7, label: "Week 1 vol · je week-overzicht" },
    { dag: 14, label: "Week 2 vol · je week-overzicht" },
    { dag: 20, label: "Vooruitkijken: fase 4 komt eraan" },
    { dag: 21, label: "21 dagen vol: samen jullie plan kiezen" },
  ],
  "reset/logisch-leven": [
    { dag: 1, label: "Start: jouw 80/20-leefstijl" },
    { dag: 7, label: "Week 1 vol · je week-overzicht" },
    { dag: 14, label: "Week 2 vol · je week-overzicht" },
    { dag: 21, label: "🎉 Het grote einde-feest" },
  ],
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
  taille: string;
  heup: string;
  borst: string;
};

const CHECKIN_RIJEN: {
  veld: "energie" | "slaap" | "buik";
  vraag: string;
  opties: { id: string; emoji: string; label: string }[];
}[] = [
  {
    veld: "energie",
    vraag: "Je energie tot nu toe",
    opties: [
      { id: "weinig", emoji: "🔋", label: "Weinig" },
      { id: "oke", emoji: "🙂", label: "Oké" },
      { id: "veel", emoji: "⚡", label: "Veel" },
    ],
  },
  {
    veld: "slaap",
    vraag: "Vannacht geslapen",
    opties: [
      { id: "slecht", emoji: "🥱", label: "Slecht" },
      { id: "oke", emoji: "🙂", label: "Oké" },
      { id: "goed", emoji: "😴", label: "Goed" },
    ],
  },
  {
    veld: "buik",
    vraag: "Je buik op dit moment",
    opties: [
      { id: "onrustig", emoji: "🌀", label: "Onrustig" },
      { id: "oke", emoji: "🙂", label: "Oké" },
      { id: "rustig", emoji: "🧘", label: "Rustig" },
    ],
  },
];

function CheckinVraag({
  bezig,
  meetDag = false,
  onKies,
}: {
  bezig: boolean;
  /** Wekelijks meetmoment (dag 7, 14, ...): vraag ook de centimeters. */
  meetDag?: boolean;
  onKies: (invoer: CheckinInvoer) => void;
}) {
  const [gewicht, setGewicht] = useState("");
  const [winst, setWinst] = useState("");
  const [stemming, setStemming] = useState("");
  const [maten, setMaten] = useState({ taille: "", heup: "", borst: "" });
  const [keuzes, setKeuzes] = useState<Record<string, string>>({});
  const kiesRij =
    "flex-1 flex flex-col items-center gap-0.5 rounded-xl border py-2 disabled:opacity-40 transition-colors";
  return (
    <div className="rounded-2xl bg-[#0A251C] border border-emerald-500/25 px-4 py-3">
      <p className="text-[13px] font-bold text-emerald-300 mb-2">
        📔 Even je check-in
      </p>
      <p className="text-[13px] font-semibold text-white/90 mb-1">Hoe is het nu met je?</p>
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
          <p className="text-[13px] font-semibold text-white/90 mb-1">{rij.vraag}</p>
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
      {meetDag && (
        <div className="mb-2.5">
          <p className="text-[11px] text-emerald-300/90 mb-1 font-semibold">
            📏 Meet-moment! Pak het meetlint erbij (cm, optioneel)
          </p>
          <div className="flex gap-2">
            {(
              [
                ["taille", "taille"],
                ["heup", "heup"],
                ["borst", "borst"],
              ] as const
            ).map(([veld, label]) => (
              <input
                key={veld}
                value={maten[veld]}
                onChange={(e) =>
                  setMaten((m) => ({
                    ...m,
                    [veld]: e.target.value.replace(/[^0-9,.]/g, ""),
                  }))
                }
                inputMode="decimal"
                placeholder={label}
                className="w-0 flex-1 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none"
                disabled={bezig}
              />
            ))}
          </div>
        </div>
      )}
      <p className="text-[13px] font-semibold text-white/90 mb-0.5">
        ✨ Kleine winst van vandaag
      </p>
      <p className="text-[11px] text-white/55 mb-1 leading-snug">
        Iets wat vandaag nét beter ging of goed voelde: fitter wakker, geen
        gesnaai, een compliment gekregen, iets lekkers gemaakt van je lijst.
        Door het op te schrijven zie je straks zwart op wit wat er allemaal
        wél lukt.
      </p>
      <input
        value={winst}
        onChange={(e) => setWinst(e.target.value.slice(0, 200))}
        placeholder="jouw kleine winst (optioneel)"
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
            taille: maten.taille,
            heup: maten.heup,
            borst: maten.borst,
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
        <p className="text-[13px] font-bold text-emerald-300 mb-1">
          💪 Wanneer ben je gestart?
        </p>
        <p className="text-[12px] text-white/60 mb-1">
          📅 Tik hieronder en kies de dag op de kalender:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={eigenDatum}
            max={naarISO(gisteren)}
            onChange={(e) => setEigenDatum(e.target.value)}
            aria-label="Kies je startdag op de kalender"
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
      <p className="text-[12px] text-white/60 mb-1">
        📅 Of tik hieronder en kies zelf een dag op de kalender:
      </p>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="date"
          value={eigenDatum}
          min={naarISO(vandaag)}
          onChange={(e) => setEigenDatum(e.target.value)}
          aria-label="Kies een startdag op de kalender"
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
  dueKennis,
  checkinVandaagGedaan,
  checkinReeks,
  dagNummer,
  startGekozen,
  startOverDagen,
  pakket,
  vrijgegeven,
  dueFaseKeuze,
  innamesVandaag,
  testModus,
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
  /** Team-antwoorden op eerdere vragen van déze klant, nog niet teruggekoppeld. */
  dueKennis?: { id: string; vraag: string; antwoord: string | null }[];
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
  /** Vervolg-programma's die de begeleider heeft vrijgegeven (doorgroei). */
  vrijgegeven?: string[];
  /** Reset-fase-regie: keuze-moment als een fase-duur erop zit. */
  dueFaseKeuze?: { fase: string; dag: number; max?: boolean } | null;
  /** Vandaag al afgevinkte inname-momenten (darm-innameschema). */
  innamesVandaag?: string[];
  /** Test-reis-link van een founder: toont de dag-spring-balk. */
  testModus?: boolean;
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
  // Effectieve dag binnen de huidige fase. Start op de server-dag, maar
  // wordt 1 zodra de klant in DIT bezoek van fase wisselt (de prop blijft
  // anders op de oude fase-dag staan, waardoor iemand op "dag 41" direct
  // door fase 3 én 4 kon klikken).
  const faseDagRef = useRef<number | null>(dagNummer ?? null);
  const checkinGedaanRef = useRef(Boolean(checkinVandaagGedaan));
  // Waar terwijl de Mentor woord-voor-woord schrijft: dan even geen
  // localStorage-opslag per woord (na het schrijven één keer).
  const schrijftRef = useRef(false);
  // Push-uitnodiging komt pas ná het eerste info-blok van dag 1
  // (feedback Raoul 20 juli: niet middenin de intro).
  const pushNaEersteBlokRef = useRef(false);
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
    // Ook client-side onthouden, zodat een keuze (zoals "blijf in fase 2")
    // direct in dit bezoek meetelt en niet pas na een refresh.
    verteldRef.current.add(sleutel);
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
    const teksten = touchpointTekst(
      sleutel,
      begeleiderNaam,
      kernAl,
      programma?.slug,
    );
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
  // Innameschema-afvinken (darm): vinkjes van vandaag + paneel open/dicht.
  // Puur voor de klant zelf, digitale versie van het geprinte formulier.
  const [innamesGedaan, setInnamesGedaan] = useState<Set<string>>(
    () => new Set(innamesVandaag ?? []),
  );
  const [toonSchemaPaneel, setToonSchemaPaneel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const invoerRef = useRef<HTMLTextAreaElement>(null);
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

  // Invoerveld groeit mee met de inhoud (ook bij ingesproken tekst, die
  // komt programmatisch binnen), tot ~5 regels; daarna intern scrollen.
  useEffect(() => {
    const el = invoerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [invoer]);

  // Scroll alleen wanneer er een NIEUW bericht bijkomt (of de typ-
  // indicator verschijnt), niet bij elk binnenstromend stukje tekst.
  // Zo blijf je bij een lang antwoord gewoon BOVENAAN het antwoord
  // lezen terwijl de rest eronder aangroeit (feedback Raoul).
  const vorigeAantal = useRef(0);
  useEffect(() => {
    if (items.length !== vorigeAantal.current || mentorTypt) {
      const eersteVulling = vorigeAantal.current === 0 && items.length > 0;
      const laatsteVanMij = items[items.length - 1]?.van === "ik";
      vorigeAantal.current = items.length;
      const el = scrollRef.current;
      if (!el) return;
      // Bij binnenkomst DIRECT onderaan staan (geen tour langs de hele
      // historie, feedback Raoul 24 juli); de tweede sprong vangt kaarten
      // en video's op die net iets later hun hoogte krijgen.
      if (eersteVulling) {
        el.scrollTo({ top: el.scrollHeight });
        setTimeout(() => el.scrollTo({ top: el.scrollHeight }), 350);
        return;
      }
      // Daarna: alleen automatisch meescrollen als de lezer al (bijna)
      // onderaan zit, of net zelf iets stuurde. Wie omhoog aan het
      // teruglezen is, wordt niet naar beneden getrokken (23 juli).
      const bijOnderkant =
        el.scrollHeight - el.scrollTop - el.clientHeight < 260;
      if (bijOnderkant || laatsteVanMij) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
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
        // Geen dubbele fase-knoppen (feedback Raoul 22 juli): loopt er een
        // fase-keuzemoment, dan zijn de keuze-knoppen de enige navigatie.
        // En wie "ik blijf in fase 2" koos, krijgt de fase 3-knop niet
        // dagelijks terug; typen ("verder") blijft altijd werken.
        const verlengdGekozen =
          prog.slug === "reset" &&
          st.slug === "omschakeling" &&
          verteldRef.current.has("fase2-verlengd");
        const toonVolgendKnop =
          Boolean(volgend) && !dueFaseKeuze && !verlengdGekozen;
        // Opmaak-dagen (darm) met "houd het rustig" gekozen: geen
        // dagelijkse check-in meer; de Mentor blijft wel bereikbaar.
        const opmaakRustig =
          prog.slug === "darm" &&
          st.slug === "zestien-dagen" &&
          (dagNummer ?? 0) > 16 &&
          verteldRef.current.has("darm-opmaak-rustig");
        setItems([
          ...beginItems,
          {
            van: "mentor",
            soort: "tekst",
            tekst: teltAf
              ? `Welkom terug! 👋 Nog ${startOverDagen === 1 ? "één dag" : `${startOverDagen} dagen`} en dan begint jouw dag 1 🚀 Gebruik de tijd om je documenten rustig door te lezen en je boodschappen te doen. En vraag me gerust van alles: ik kijk ook mee met etiket-foto's of een product past, en ik maak alvast een recept of dagschema voor je.`
              : prog.slug === "darm" &&
                  st.slug === "zestien-dagen" &&
                  (dagNummer ?? 0) > 16
                ? `Welkom terug! 👋 Je 16 dagen zitten erop en je bent nu je producten rustig aan het opmaken (opmaak-dag ${(dagNummer ?? 17) - 16}). Waar wil je mee verder? Stel je vraag, stuur een foto van een etiket, of laat me een recept of dagschema voor je maken.`
                : `Welkom terug! 👋 We waren bij ${st.emoji} ${st.naam}${dagNummer ? ` (dag ${dagNummer})` : ""}. Waar wil je verder mee? Stel je vraag, stuur een foto van een etiket (dan kijk ik met je mee of een product bij jouw programma past), of laat me een recept of dagschema voor je maken.`,
          },
          ...(volgend && toonVolgendKnop
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
        // Is er vandaag een speciaal moment (dag 10, kern-verhaal,
        // week-terugblik)? Dan komt de check-in pas DAARNA (feedback
        // Raoul 20 juli: eerst de video, dan vanzelf de check-in),
        // anders raakt de check-in-kaart begraven boven de video.
        const heeftDueMoment = Boolean(
          dueDag10 ||
            dueTouchpoint ||
            dueWeekTerugblik ||
            dueFaseKeuze ||
            (dueKennis && dueKennis.length > 0),
        );
        // ÉÉN opeenvolgende flow bij terugkomen (voorheen twee parallelle
        // timers die door elkaar konden schrijven): eerst pakket/start-
        // vraag, dan het einde-moment óf de speciale dag-momenten, dan
        // de check-in.
        (async () => {
          await wacht(1400);
          // Dagelijks innameschema (darm, dag 1-16): toont vanzelf zodra
          // de schema-data gevuld is; tot die tijd stil.
          if (
            prog.slug === "darm" &&
            st.slug === "zestien-dagen" &&
            !teltAf &&
            dagNummer != null &&
            dagNummer >= 1 &&
            dagNummer <= 16
          ) {
            const schemaVandaag = innameVoorDag(pakketRef.current, dagNummer);
            if (schemaVandaag) {
              await mentorZegt(
                `📋 Jouw innames voor dag ${dagNummer}:\n\n${formatInname(schemaVandaag)}\n\nAfvinken kan de hele dag door via het 📋-knopje hierboven, dan weet je altijd waar je staat.`,
                900,
              );
              await wacht(600);
            }
          }
          if (moetPakketKiezen) {
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
          } else if (moetStartKiezen) {
            await toonStartKeuze(FASE_DAGEN[EERSTE_DUUR_STATION[prog.slug] ?? ""]);
            knoppenNaarOnder();
          } else if (
            !checkinGedaanRef.current &&
            !dueEinde &&
            !teltAf &&
            !heeftDueMoment &&
            !opmaakRustig
          ) {
            await toonCheckin(true);
          }
          // Tijd-gebonden momenten, rustig ná het bovenstaande. Het
          // programma-einde gaat vóór alles (dag 10 en kern-verhaal zijn
          // dan niet meer relevant).
          if (dueEinde) {
            await wacht(1200);
            await speelEindeMoment(prog, st);
            markeerTouchpoint(("programma-einde-" + prog.slug) as TouchpointSleutel);
            knoppenNaarOnder();
          } else if (heeftDueMoment) {
            await wacht(1200);
            // MAXIMAAL ÉÉN groot moment per dag (feedback Raoul 22 juli:
            // geen "en, en, en" op één dag). Prioriteit: team-antwoord >
            // dag 10 > kern-verhaal > week-overzicht > fase-keuze. Wat
            // vandaag niet aan de beurt komt, schuift vanzelf naar de
            // volgende dag (het blijft "due" tot het gespeeld is).
            if (dueKennis && dueKennis.length > 0) {
              for (const k of dueKennis) {
                await mentorZegt(
                  `Trouwens! Je vroeg me laatst: "${k.vraag}". Ik heb het voor je nagevraagd bij het team, en dit is het antwoord: ${k.antwoord} 💚`,
                  1200,
                );
                await wacht(800);
              }
              fetch("/api/resetcode/kennis-gezien", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token,
                  ids: dueKennis.map((k) => k.id),
                }),
              }).catch(() => {});
            } else if (dueDag10) {
              await mentorZegt(
                `Trouwens: je zit vandaag op dag ${dueDag10} van je 16 dagen! 🎉 Dit is het moment voor je dag 10-video, die is belangrijk. Kijk 'm even rustig 👇`,
                1100,
              );
              await mentorKaart("videodag10", st.slug, 800);
              markeerTouchpoint("dag10-video" as TouchpointSleutel);
              await wacht(1200);
              await mentorZegt(
                "Neem er echt even de tijd voor, voor veel mensen is dit een kantelpunt. Ben je klaar met kijken? Vertel me gerust wat je eruit meeneemt, of stel je vragen erover. En verder gaat vandaag gewoon door zoals je gewend bent: je check-in, je vragen, je recepten. Ik ben er. 💚",
                1000,
              );
            } else if (dueTouchpoint) {
              await speelTouchpoint(dueTouchpoint);
            } else if (dueWeekTerugblik) {
              await speelWeekTerugblik(dueWeekTerugblik);
            } else if (dueFaseKeuze) {
              // Reset-fase-regie: dag 20 kondigt de keuze aan (met een
              // alvast-lezen-knop voor wie de info vooruit wil), daarna
              // een rustige herinnering voor wie nog niet koos; wie
              // "blijf in fase 2" koos, hoort er niets meer over tot
              // het 40-dagen-maximum.
              const inkijkKnop = (slug: string, label: string) => {
                setItems((b) => [
                  ...b,
                  {
                    van: "mentor",
                    soort: "verder-knop",
                    bid: ++bidTeller.current,
                    label,
                    actie: { type: "inkijk", slug },
                  },
                ]);
              };
              if (dueFaseKeuze.fase === "darm-vooruitblik") {
                // Dag 14-16: vervolg-momentje plannen, zoals het
                // contactmoment al belooft, maar nu actief aangeboden.
                const rest = Math.max(0, 16 - dueFaseKeuze.dag);
                await mentorZegt(
                  `${rest === 0 ? "Vandaag is de laatste van je 16 dagen" : rest === 1 ? "Nog één dag" : `Nog ${rest} dagen`} en dan zitten je 16 dagen erop, wat goed van je! 🎉 Plan alvast een momentje met ${begeleiderNaam} om samen naar jouw vervolg te kijken (dat gesprek is echt de moeite waard), als jullie dat nog niet gedaan hebben. En daarna maak je je producten rustig op; ik help je daar dan gewoon doorheen. 💚`,
                  1200,
                );
                markeerTouchpoint("darm-vooruitblik");
              } else if (dueFaseKeuze.fase === "darm-opmaak") {
                // Eenmalige uitleg van de opmaak-periode na dag 16, met
                // de gesprekspartner-keuze (feedback Raoul 22 juli: de
                // focus ligt nu op het vervolg, niet op lange begeleiding).
                await mentorZegt(
                  dueFaseKeuze.dag <= 16
                    ? `${dueFaseKeuze.dag === 16 ? "Vandaag is de laatste van je 16 dagen, wat een prestatie!" : "Je 16 dagen zitten er bijna op!"} 🎉 Daarna begint je opmaak-tijd: je maakt je producten rustig op. De vuistregel: deel de inhoud van elke pot door 30, dan weet je je dagdosering en gaat elke pot ongeveer een maand mee.`
                    : `Je zit nu in je opmaak-dagen: je 16 dagen zitten erop en je maakt je producten rustig op. De vuistregel: deel de inhoud van elke pot door 30, dan weet je je dagdosering en gaat elke pot ongeveer een maand mee.`,
                  1200,
                );
                await wacht(800);
                // De genoteerde opmaak-hoeveelheden per product (Cogelin
                // wijkt af van de deel-door-30-regel), pakket-bewust.
                const opmaakBasis = [
                  "Cogelin: halve tot 1 scoop per dag",
                  "Aloë Vera Caps: 2 per dag (±6 dagen mee)",
                  "MSM Plus: 2x4 (ochtend en avond), of 8 in één keer 's ochtends (±10 dagen)",
                  "Biotic Blast: 2 per dag (±14 dagen)",
                  "Parabalance: 2x3 (ochtend en avond)",
                ];
                const opmaakPlus = [
                  "PH Plus: 3x3 per dag (±14 dagen)",
                  "Be Recharged: 1 portie van 2 scoops per dag (±14 dagen)",
                  "Digestive Formula: hier geldt gewoon de deel-door-30-regel",
                ];
                const opmaakLijst =
                  pakketRef.current === "plus"
                    ? [...opmaakBasis, ...opmaakPlus]
                    : opmaakBasis;
                await mentorZegt(
                  `Voor jouw producten hebben we het al voor je op een rij gezet:\n\n${opmaakLijst.map((p) => `• ${p}`).join("\n")}\n\nEn qua eten hoef je niks in één keer om te gooien: houd de voedingslijst als kompas en verbreed rustig. 💚`,
                  1100,
                );
                await wacht(900);
                await mentorZegt(
                  `Waar het nu vooral om draait: samen met ${begeleiderNaam} jouw vervolg kiezen, zodat je ritme gewoon doorloopt als je potten leeg raken. En dan even praktisch, tussen ons: wil je dat ik er in deze opmaak-dagen elke dag voor je blijf, met je check-in en een dagelijkse tip? Of houd je het liever rustig en pak je het vervolg gewoon met ${begeleiderNaam} op? Kies maar. 👇`,
                  1100,
                );
                const bidD = ++bidTeller.current;
                const bidR = ++bidTeller.current;
                setItems((b) => [
                  ...b,
                  {
                    van: "mentor",
                    soort: "verder-knop",
                    bid: bidD,
                    label: "💬 Ja, blijf er dagelijks voor me",
                    actie: { type: "opmaak-dagelijks" },
                  },
                  {
                    van: "mentor",
                    soort: "verder-knop",
                    bid: bidR,
                    label: "🌿 Ik houd het rustig",
                    actie: { type: "opmaak-rustig" },
                  },
                ]);
                markeerTouchpoint("darm-opmaak-uitleg");
              } else if (dueFaseKeuze.fase === "omschakeling") {
                await mentorZegt(
                  dueFaseKeuze.max
                    ? `Belangrijk moment: je zit op dag ${dueFaseKeuze.dag} van fase 2, en 40 dagen is echt het maximum. Het is tijd om door te gaan naar fase 3, de stabilisatie. Overleg vandaag nog even met ${begeleiderNaam} als je dat nog niet hebt gedaan, en druk daarna op de knop hieronder. 👇`
                    : dueFaseKeuze.dag <= 20
                      ? `Even vooruitkijken naar iets moois: morgen zitten je 21 dagen van fase 2 erop! 🎉 Dan is er een keuze, en die maak je het liefst samen met ${begeleiderNaam}: nog even doorgaan met fase 2 (dat mag, tot maximaal 40 dagen totaal), of door naar fase 3, de stabilisatie. Wil je alvast lezen wat fase 3 inhoudt? Dat kan met de leesknop, dan verandert er nog niks. Morgen staat ook de knop naar fase 3 voor je klaar. 👇`
                      : `Je 21 dagen van fase 2 zitten erop! 🎉 Kies wanneer jij er klaar voor bent, het liefst samen met ${begeleiderNaam}: doorgaan met fase 2 (tot maximaal 40 dagen) of door naar fase 3. 👇`,
                  1200,
                );
                if (!dueFaseKeuze.max) {
                  inkijkKnop("stabilisatie", "📖 Alvast lezen: wat is fase 3?");
                }
                // De echte fase 3-knop pas vanaf dag 21: fase 2 duurt
                // minimaal 21 dagen, dus op dag 20 valt er nog niks te
                // klikken (alleen te kiezen en te lezen).
                if (dueFaseKeuze.max || dueFaseKeuze.dag >= 21) {
                  toonStationKnop("stabilisatie", "🧘 Door naar fase 3 (stabilisatie)");
                }
                if (!dueFaseKeuze.max) {
                  const bidV = ++bidTeller.current;
                  setItems((b) => [
                    ...b,
                    {
                      van: "mentor",
                      soort: "verder-knop",
                      bid: bidV,
                      label: "🔄 Ik blijf nog even in fase 2",
                      actie: { type: "verlengen" },
                    },
                  ]);
                }
              } else if (dueFaseKeuze.fase === "stabilisatie") {
                if (dueFaseKeuze.dag <= 20) {
                  // Dag 20: vooruitkijken. De echte overstap kan pas na
                  // de volle 21 dagen; alvast lezen kan wel.
                  await mentorZegt(
                    `Even vooruitkijken: morgen zitten je 21 dagen van fase 3 erop! 🎉 Dan kies je, het liefst samen met ${begeleiderNaam}, wat jullie plan is: door naar fase 4 (logisch leven) of nog een ronde fase 2 en 3. Wil je alvast lezen wat fase 4 inhoudt? Dat kan hieronder, dan verandert er nog niks. Morgen staan de keuze-knoppen voor je klaar. 👇`,
                    1200,
                  );
                  inkijkKnop("logisch-leven", "📖 Alvast lezen: wat is fase 4?");
                } else {
                  await mentorZegt(
                    `Je 21 dagen van fase 3 zitten erop, netjes volgehouden! 🎉 Bespreek met ${begeleiderNaam} wat jullie plan is als jullie dat nog niet gedaan hebben: nog een ronde fase 2 en 3, of door naar fase 4, logisch leven. Beide knoppen staan voor je klaar. 👇`,
                    1200,
                  );
                  toonStationKnop("logisch-leven", "🌿 Door naar fase 4 (logisch leven)");
                  toonStationKnop("omschakeling", "🔄 Nog een ronde fase 2");
                }
              }
            }
            // En dan pas de check-in van vandaag, netjes onderaan, zodat
            // de belofte "je check-in gaat gewoon door" ook klopt.
            if (!checkinGedaanRef.current && !teltAf && !opmaakRustig) {
              await wacht(1200);
              await mentorZegt(
                "O ja, en je check-in van vandaag staat hier alvast voor je klaar 👇",
                800,
              );
              await toonCheckin(false);
            }
            knoppenNaarOnder();
          }
        })();
      } else {
        // Allereerste bezoek: warm welkom + eerste stap.
        (async () => {
          await mentorZegt(
            `Hé ${klantVoornaam ?? ""}, welkom! 🌿 Ik ben je Mentor. Ik ken jouw hele programma van begin tot eind en ik ben er dag en nacht, samen met ${begeleiderNaam}. Praat gewoon tegen me of typ, wat jij fijn vindt. En handig: zet deze pagina op je beginscherm (delen ▸ zet op beginscherm), dan sta ik altijd tussen je apps. Ik onthoud alles wat we bespreken. 💚`,
            1200,
          );
          await wacht(700);
          const vervolg = async () => {
            // De push-uitnodiging komt pas na het eerste info-blok
            // (volgorde-feedback Raoul), via klikVerder.
            pushNaEersteBlokRef.current = true;
            await introStation(prog, prog.stations[0]);
            fetch("/api/resetcode/stap", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, station: prog.stations[0].slug }),
            }).catch(() => {});
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
          // Oude sessie-groeten niet mee terugspelen: anders stapelen de
          // "Welkom terug!"-berichten op (bug-screenshot Raoul 20 juli).
          const historie = data.items.filter(
            (it) =>
              !(
                it.van === "mentor" &&
                it.soort === "tekst" &&
                it.tekst.startsWith("Welkom terug!")
              ),
          );
          setItems([
            ...historie,
            {
              van: "mentor",
              soort: "tekst",
              tekst: `Welkom terug! 👋 We waren bij ${st.emoji} ${st.naam}. Waar wil je verder mee? Stel je vraag, stuur een foto van een etiket (dan kijk ik met je mee of een product bij jouw programma past), of laat me een recept of dagschema voor je maken.`,
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
      `Dan nu het belangrijkste: wanneer ga jij van start? 🚀 Kies hieronder jouw startmoment, dan weet ${begeleiderNaam} het ook meteen en tel ik ${duur ? `je ${duur} dagen` : "je dagen"} precies vanaf jouw dag 1. Kleine tip: de meeste mensen starten vandaag of morgen. Je zit er nu helemaal in, en lang vooruitschuiven maakt starten vaak alleen maar lastiger. Wat uit ervaring het fijnst werkt: gebruik de dagen dat je bestelling onderweg is voor je voorbereiding, en start zodra je producten binnen zijn.`,
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
      await postMetHerkansing("/api/resetcode/start", { token, datum: datumISO });
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
          `Mag ik nog één ding eerlijk zeggen? Als het lukt om eerder te beginnen, zou ik dat doen. Je zit er nú helemaal in, en lang vooruitschuiven maakt starten vaak alleen maar lastiger. Wat uit ervaring het fijnst werkt: voorbereiden terwijl je bestelling onderweg is, en starten zodra je producten binnen zijn. Wil je toch een andere dag kiezen, typ dan gewoon "ik start eerder" en ik pas het aan. En anders: ${label} is helemaal prima, dan zie ik je dan! 💚`,
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

  // Belangrijke keuzes (pakket, startmoment) met herkansing opslaan: een
  // enkele stille netwerk-fout mag niet betekenen dat de vraag bij het
  // volgende bezoek opnieuw komt (gebeurde Raoul, 23 juli).
  async function postMetHerkansing(url: string, body: Record<string, unknown>) {
    const doe = () =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    try {
      const r = await doe();
      if (r.ok) return;
    } catch {
      /* herkansing hieronder */
    }
    await wacht(1200);
    try {
      await doe();
    } catch {
      /* volgende bezoek stelt de vraag gewoon opnieuw */
    }
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
      await postMetHerkansing("/api/resetcode/pakket", { token, pakket: keuze });
    }
    await mentorZegt(
      keuze === "plus"
        ? "Top, het plus-pakket dus: het blauwe schema met 8 producten. Alles in deze chat wordt daar vanaf nu op afgestemd. 💙"
        : "Top, het basispakket dus: het rode schema met 5 producten. Alles in deze chat wordt daar vanaf nu op afgestemd. ❤️",
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
    const metTaille = reeks.filter((r) => r.taille != null);
    const tailleDelta =
      metTaille.length >= 2
        ? Math.round(
            ((metTaille[metTaille.length - 1].taille as number) -
              (metTaille[0].taille as number)) *
              10,
          ) / 10
        : null;
    const delen: string[] = [];
    if (delta != null && delta < 0)
      delen.push(`je staat ${Math.abs(delta)} kilo lichter dan bij je start`);
    if (tailleDelta != null && tailleDelta < 0)
      delen.push(`je taille is ${Math.abs(tailleDelta)} centimeter smaller`);
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

  // ---------- Tip van de dag + wat de Mentor vandaag kan ----------

  // Na de check-in (feedback Raoul 20 juli): één roterende tip uit het
  // fase-materiaal + concreet wat de Mentor vandaag kan doen, per fase
  // verschillend (darm is anders dan de reset).
  const DAG_KAN: Record<string, string> = {
    start:
      "je boodschappenlijst doorlopen, meedenken over je voorbereiding, of alvast een etiket-foto checken",
    "zestien-dagen":
      "een etiket-foto checken of een product past, een recept of dagschema maken binnen jouw lijst, of meedenken bij een lastig moment",
    voorbereiding:
      "je boodschappenlijst doorlopen, meedenken over je voorbereiding, of alvast een etiket-foto checken",
    laaddagen:
      "je calorieën meetellen (zeg gewoon wat je eet, of stuur een foto van je bord) en ideeën geven om aan je 3500+ te komen",
    omschakeling:
      "een vetvrij recept binnen je fase 2-lijst maken, meedenken voor onderweg of op je werk, of een etiket-foto checken",
    stabilisatie:
      "je uitleggen hoe je nieuwe dingen rustig test, recepten voor deze fase maken, of een etiket-foto checken",
    "logisch-leven":
      "een weekmenu volgens de 80/20-piramide maken, of meedenken hoe je dit blijvend volhoudt",
  };

  // Gecureerde dag-tips per fase: alléén proactieve tips uit het eigen
  // materiaal (feedback Raoul 20 juli: situationele zinnen zoals "ging
  // er iets verkeerd in?" horen niet in de dag-tip-rotatie; die blijven
  // gewoon in de tips-kaart voor als het moment daar is).
  const DAG_TIPS: Record<string, string[]> = {
    "zestien-dagen": [
      "Neem vandaag een paar mespuntjes Keltisch zeezout. Hoe maakt niet uit: onder of op je tong, extra door je eten, of opgelost in een glas water.",
      "Plan vandaag of morgen een voetenbadje: een paar eetlepels Keltisch zeezout in warm water.",
      "Boekweit is je vriend: boekweitcrackers, 100% boekweitpasta of pannenkoekjes van boekweitmeel.",
      "Drink vandaag lekker veel water, je lichaam is hard aan het werk.",
      "Pak het receptenboekje er eens bij en kies alvast iets nieuws voor morgen.",
      "Check bij verpakte producten de ingrediëntenlijst (niet de voedingswaarde). Twijfel je? Stuur mij een foto.",
      "Plan vandaag bewust een rustmomentje in, ook als je je goed voelt.",
      "Kijk eens in de Facebook-groep en typ 'tussendoortje' in de zoekbalk, daar zit goud tussen.",
    ],
    laaddagen: [
      "Eet vandaag écht genoeg: je laaddagen zijn de fundering van je hele reset.",
      "Zeg me gewoon alles wat je eet (foto mag ook), dan houd ik je teller bij richting de 3500+.",
    ],
    omschakeling: [
      "Drink vandaag je 2 liter water, verspreid over de dag.",
      "Houd de 3-uur-regel aan tussen je eetmomenten.",
      "Bereid je maaltijden vetvrij en van je fase 2-lijst; twijfel je ergens over, vraag het me gewoon.",
      "Fruit vandaag: maximaal 2 stuks, kies iets van je lijst dat je echt lekker vindt.",
      "Ben je vandaag onderweg of aan het werk? Bereid thuis iets voor van je lijst en neem het mee.",
      "Zin om te variëren? Zeg wat je in huis hebt, dan maak ik er een fase 2-recept van.",
    ],
    stabilisatie: [
      "Test nieuwe dingen één voor één, dan weet je precies wat bij jou past.",
      "Weeg jezelf elke dag rond hetzelfde moment, dan is je lijn eerlijk.",
      "Wil je iets nieuws proberen vandaag? Vraag me eerst even of het in deze fase past.",
    ],
    "logisch-leven": [
      "Denk vandaag in de 80/20-verhouding van de piramide: vaak groente en fruit, zelden zoet.",
      "Plan je week vooruit; als je wilt maak ik een weekmenu voor je.",
      "Kies vandaag bewust één gewoonte uit je reset die je wilt vasthouden.",
      "Eerlijk moment: de oude gewoontes kloppen op een dag vanzelf weer aan, juist als het goed gaat. Wat je hebt opgebouwd blijft alleen staan zolang je het onderhoudt.",
      "Denk vandaag even terug aan de vraag waarmee je begon: ben je bereid je leefstijl aan te passen? Veel mensen houden daarom ook na het programma hun dagelijkse basis gewoon aan.",
    ],
  };

  // Opmaak-dagen (darm, na dag 16): eigen tips in plaats van kuur-tips.
  const OPMAAK_TIPS = [
    "Deel-door-30-check: inhoud van de pot gedeeld door 30 is je dagdosering, dan gaat elke pot ongeveer een maand mee.",
    "Houd de voedingslijst als kompas en verbreed rustig, stap voor stap. Je hoeft niks in één keer om te gooien.",
    "Al een momentje met je begeleider gepland over jouw vervolg? Dat gesprek is echt de moeite waard.",
    "Merk je dat iets nieuws niet lekker valt? Doe het gewoon wat rustiger aan, je kent je lichaam nu beter dan ooit.",
  ];

  async function toonDagTip() {
    if (!station) return;
    const inOpmaak =
      programma?.slug === "darm" &&
      station.slug === "zestien-dagen" &&
      (dagNummer ?? 0) > 16;
    const tips = inOpmaak ? OPMAAK_TIPS : DAG_TIPS[station.slug] ?? [];
    const draai = (dagNummer ?? new Date().getDate()) - 1;
    const tip = tips.length
      ? tips[((draai % tips.length) + tips.length) % tips.length]
      : null;
    const kan =
      DAG_KAN[station.slug] ??
      "al je vragen over je producten en je dagelijkse routine beantwoorden";
    await mentorZegt(
      `${tip ? `💡 Tip voor vandaag: ${tip}\n\n` : ""}En dit kan ik vandaag voor je doen: ${kan}. Zeg het maar! 💚`,
      1000,
    );
  }

  // ---------- Het einde-moment ----------

  // Na de laatste fase-dag: écht feest, een eind-overzicht van alles wat
  // er is opgebouwd, en de bewustwording dat dit een STARTPUNT is
  // (feedback Raoul 21 juli: geen bot-trots maar trots-op-jezelf, wel
  // totalen laten zien, en het 6-tot-9-maanden-verhaal, juist ook als
  // iemand nog weinig ziet of voelt).
  async function speelEindeMoment(prog: ResetProgramma, st: ResetStation) {
    const duur = FASE_DAGEN[st.slug] ?? 16;
    await mentorZegt(
      prog.slug === "reset"
        ? `${klantVoornaam ? `${klantVoornaam}... JE` : "JE"} HEBT HET GEDAAN! 🎉🎊 De HELE Holistic Reset: van je laaddagen, door fase 2 en de stabilisatie, tot en met logisch leven. Neem even een moment om dat te laten landen: dit heb jíj gedaan, fase na fase, keuze na keuze. Daar mag je ontzettend trots op jezelf zijn. 🥳`
        : `${klantVoornaam ? `${klantVoornaam}... JE` : "JE"} HEBT HET GEDAAN! 🎉🎊 Álle ${duur} dagen, helemaal uitgelopen. Neem even een moment om dat te laten landen: dit heb jíj gedaan, dag na dag, keuze na keuze. Daar mag je ontzettend trots op jezelf zijn. 🥳`,
      1300,
    );
    // Eind-overzicht uit het eigen dagboek.
    const reeks = checkinReeksRef.current;
    if (reeks.length > 0) {
      await wacht(900);
      await mentorZegt(
        "En kijk eens wat je onderweg allemaal hebt opgebouwd 👇",
        900,
      );
      setItems((b) => [...b, { van: "mentor", soort: "voortgang" }]);
      await wacht(1000);
      const metGewicht = reeks.filter((r) => r.gewicht != null);
      const gDelta =
        metGewicht.length >= 2
          ? Math.round(
              ((metGewicht[metGewicht.length - 1].gewicht as number) -
                (metGewicht[0].gewicht as number)) *
                10,
            ) / 10
          : null;
      const metTaille = reeks.filter((r) => r.taille != null);
      const tDelta =
        metTaille.length >= 2
          ? Math.round(
              ((metTaille[metTaille.length - 1].taille as number) -
                (metTaille[0].taille as number)) *
                10,
            ) / 10
          : null;
      const winsten = reeks
        .filter((r) => r.notitie)
        .slice(-4)
        .map((r) => `"${r.notitie}"`);
      const delen: string[] = [
        `${reeks.length} check-in${reeks.length === 1 ? "" : "s"} trouw ingevuld`,
      ];
      if (gDelta != null && gDelta < 0)
        delen.push(`${Math.abs(gDelta)} kilo lichter`);
      if (tDelta != null && tDelta < 0)
        delen.push(`${Math.abs(tDelta)} centimeter van je taille`);
      await mentorZegt(
        winsten.length
          ? `Op een rij: ${delen.join(", ")}. En dit schreef je zélf onderweg op: ${winsten.join(", ")}. Dat is geen toeval, dat ben jij.`
          : `Op een rij: ${delen.join(", ")}. Stuk voor stuk dagen waarop je voor jezelf koos.`,
        1100,
      );
    }
    // Startpunt-bewustwording, juist ook zonder zichtbaar resultaat.
    await wacht(900);
    await mentorZegt(
      `En dan iets belangrijks, zeker als je nog niet al het verschil ziet of voelt waar je op hoopte: ${prog.slug === "reset" ? "deze reis was" : `deze ${duur} dagen waren`} nooit een quick fix. Zie dit als het stártpunt van jouw gezondheidsreis. Het programma-materiaal is daar eerlijk over: je lichaam heeft 6 tot 9 maanden nodig om tekorten echt aan te vullen. Wat jij nu hebt neergezet is het fundament waar alles op verder bouwt. 🌱`,
      1200,
    );
    // Eerlijke bewustwording (Raoul 22 juli): de valkuil "ik weet nu hoe
    // het moet, dus het gaat vanzelf" benoemen, terug naar de start-vraag.
    // Alleen bij de reset: het darm-einde moet compact blijven (dag 17
    // stapelde te veel).
    if (prog.slug === "reset") {
      await wacht(800);
      await mentorZegt(
        `En mag ik heel eerlijk zijn? De grootste valkuil komt nú pas: denken "ik weet hoe het werkt, vanaf hier red ik het wel op de oude manier". Zo ging het vroeger ook, en je weet waar dat eindigde. Weet je nog, de vraag waarmee je begon: ben je bereid je leefstijl aan te passen om echt verschil te maken? Dít is het moment waarop dat antwoord telt. Hou je nieuwe ritme vast, en veel mensen kiezen ervoor ook hun dagelijkse basis gewoon aan te houden; bespreek met ${begeleiderNaam} wat bij jou past. De verleidingen blijven op de loer, maar jij weet nu wat werkt. 💚`,
        1300,
      );
    }
    await wacht(800);
    await mentorZegt(
      `Daarom kies je nu, samen met ${begeleiderNaam}, jouw vervolgstap om dit vast te houden en verder uit te bouwen. Dit zijn de routes, en met de groene knop plan je meteen jullie momentje. 👇`,
      1100,
    );
    await mentorKaart("vervolg", st.slug, 800);
    await wacht(500);
    await mentorKaart("contact", st.slug, 600);
    // Het eigen-ervaring/webshop-verhaal (darm-einde) speelt NIET meer op
    // deze dag: dag 17 stapelde te veel (feedback Raoul 22 juli). Het
    // komt via het dag-systeem op een rustige opmaak-dag terug.
    // Doorgroei: heeft de begeleider het vervolg al vrijgegeven, dan
    // staat de start-knop hier meteen klaar (zelfde omgeving, zelfde
    // geheugen).
    const volgend = volgendVrijgegeven(prog.slug);
    if (volgend) {
      await wacht(1000);
      await mentorZegt(
        `En goed nieuws: ${begeleiderNaam} heeft ${volgend.emoji} ${volgend.naam} al voor je klaargezet. Zodra jullie samen besluiten dat dit jouw route is, druk je gewoon op de knop en gaan we hier verder, met alles wat ik al van je weet. 👇`,
        1000,
      );
      toonProgrammaStartKnop(volgend.slug);
    }
  }

  // ---------- Doorgroei (zelfde omgeving, volgend programma) ----------

  function volgendVrijgegeven(huidigSlug: string) {
    const vrij = vrijgegeven ?? [];
    return (
      RESET_PROGRAMMAS.find(
        (p) => p.slug !== huidigSlug && vrij.includes(p.slug),
      ) ?? null
    );
  }

  function toonStationKnop(slug: string, label: string) {
    const bid = ++bidTeller.current;
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "verder-knop",
        bid,
        label,
        actie: { type: "station", slug },
      },
    ]);
  }

  function toonProgrammaStartKnop(slug: string) {
    const prog = programmaVoor(slug);
    if (!prog) return;
    const bid = ++bidTeller.current;
    setItems((b) => [
      ...b,
      {
        van: "mentor",
        soort: "verder-knop",
        bid,
        label: `🌟 Start ${prog.emoji} ${prog.naam}`,
        actie: { type: "programma", slug },
      },
    ]);
  }

  async function startNieuwProgramma(slug: string) {
    const prog = programmaVoor(slug);
    if (!prog) return;
    setItems((b) =>
      b.filter(
        (x) => !(x.soort === "verder-knop" && x.actie.type === "programma"),
      ),
    );
    const echo = `Ik ga door naar ${prog.naam}! 🌟`;
    setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echo }]);
    logNaarServer([{ van: "klant", soort: "tekst", tekst: echo }]);
    if (token) {
      const res = await fetch("/api/resetcode/programma-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, programma: slug }),
      }).catch(() => null);
      if (!res || !res.ok) {
        await mentorZegt(
          `Hmm, het vervolg staat nog niet open. Vraag ${begeleiderNaam} even om het vrij te geven, dan gaan we daarna meteen van start.`,
          900,
        );
        return;
      }
    }
    startGekozenRef.current = false;
    setProgramma(prog);
    await mentorZegt(
      `Daar gaan we: ${prog.emoji} ${prog.naam}! 🎉 Zelfde plek, zelfde geheugen: alles wat we samen hebben opgebouwd neem ik gewoon mee. Ik loop ook dit hele programma stap voor stap met je door.`,
      1100,
    );
    await wacht(600);
    await introStation(prog, prog.stations[0]);
  }

  // ---------- Dagelijkse check-in (dagboek) ----------

  // Toont de check-in als er vandaag nog niet is ingecheckt. De reden om
  // elke dag te openen: de Mentor houdt gevoel + gewicht bij (feedback
  // Raoul 18 juli).
  async function toonCheckin(metGroet: boolean) {
    if (checkinGedaanRef.current) return;
    if (metGroet) {
      // Dagdeel-bewuste groet: de check-in kan op elk moment (de vragen
      // zijn moment-neutraal), maar de begroeting mag wel meebewegen.
      const uur = new Date().getHours();
      const groet =
        uur < 12 ? "Goedemorgen! ☀️" : uur < 18 ? "Hoi! 👋" : "Goedenavond! 🌙";
      await mentorZegt(
        `${groet} Even je dagelijkse check-in${dagNummer ? ` (dag ${dagNummer})` : ""}, je bent er in een halve minuut doorheen. 💚 Vul gerust ook je gewicht in (het eerlijkst is elke dag rond hetzelfde moment wegen), dan houd ik je voortgang voor je bij.`,
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
            taille: invoer.taille ? Number(invoer.taille.replace(",", ".")) : undefined,
            heup: invoer.heup ? Number(invoer.heup.replace(",", ".")) : undefined,
            borst: invoer.borst ? Number(invoer.borst.replace(",", ".")) : undefined,
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
      // Op zo'n dag géén vrolijke dag-tip erachteraan; het gesprek is
      // dan belangrijker. Anders: tip van de dag + wat ik vandaag kan.
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
      } else {
        await wacht(700);
        await toonDagTip();
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

  // Mag de push-uitnodiging getoond worden op dit apparaat? Check dit
  // VÓÓR de aankondigings-tekst, anders belooft de Mentor een knop die
  // nooit komt (bijv. incognito: meldingen door de browser geblokkeerd).
  async function magPushVragen(): Promise<boolean> {
    if (!token || !abonneerbaar()) return false;
    try {
      if (Notification.permission === "granted") {
        // getRegistration, NIET .ready: .ready wacht eeuwig als er (nog)
        // geen service worker op deze pagina is, en dan bevroor de hele
        // vervolg-flow na het eerste info-blok (bug Raoul 23 juli: de
        // chat stopte na "de regels van nu" zodra meldingen al eerder
        // waren toegestaan).
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && (await reg.pushManager.getSubscription())) return false; // al aan
      }
      if (localStorage.getItem(`resetcode-push-${token.slice(0, 10)}`)) return false;
    } catch {
      /* negeer */
    }
    return true;
  }

  function toonPushOptIn() {
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
      if (perm === "denied") {
        // De browser blokkeert meldingen (bijv. incognito-venster, of
        // eerder voor deze site uitgezet). Eerlijk zeggen wat er
        // gebeurde, anders lijkt de klik genegeerd.
        await mentorZegt(
          "Ah, je browser blokkeert meldingen voor deze pagina op dit moment (dat gebeurt bijvoorbeeld in een incognito-venster, of als ze eerder zijn uitgezet). Geen zorgen: ik houd alles gewoon hier voor je bij. Wil je de seintjes later toch? Zet meldingen voor deze site aan via het slotje bij de adresbalk, en zeg het me dan even. 💚",
          700,
        );
        return;
      }
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
        const abonneer = () =>
          ready.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            ),
          });
        try {
          sub = await abonneer();
        } catch {
          // Eén herkansing: op sommige telefoons faalt de allereerste
          // aanmelding bij de push-dienst net na het toestemmings-moment.
          await wacht(800);
          sub = await abonneer();
        }
      }
      const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const opslag = await fetch("/api/resetcode/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, subscription: j }),
      });
      if (!opslag.ok) {
        throw new Error(`opslag mislukt (${opslag.status})`);
      }
      await mentorZegt(
        "Top, ik geef je elke ochtend een klein seintje voor je check-in en laat je weten als er iets belangrijks klaarstaat 🔔",
        700,
      );
    } catch (e) {
      // In testmodus de technische reden erbij, zodat we precies zien
      // waar het stukloopt op welk toestel (feedback Raoul 23 juli).
      const reden = e instanceof Error ? e.message : String(e);
      await mentorZegt(
        `Dat lukte net even niet, geen zorgen, ik houd alles gewoon hier voor je bij.${testModus ? ` (technisch: ${reden.slice(0, 140)})` : ""}`,
        600,
      );
    }
    // De "Verder met"-knop hoort ONDER de bevestiging te blijven staan
    // (feedback Raoul 24 juli), anders lijkt de flow terug te springen.
    knoppenNaarOnder();
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
        knopLabel: "wat je allemaal aan mij als Mentor hebt",
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
              ? `Hier zijn je documenten, alvast voor je klaargezet. 📖 Neem ze even goed door, dan weet je precies wat de bedoeling is en wat er allemaal aankomt.${prog.slug === "reset" ? " Print je boekje en het meet- en weegschema gerust uit, dat werkt het fijnst." : " Je boekje even uitprinten werkt het fijnst."} En het mooie: ik ken al deze documenten van binnen en van buiten, dus alles wat je erin leest kun je me ook gewoon vragen. Ik maak trouwens ook een recept of een dag- of weekschema dat precies in ${prog.slug === "reset" ? "jouw fase" : "het programma"} past; zeg maar wat je in huis hebt.`
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
          ? `Dat was alle informatie voor deze fase 💚 Vraag me tussendoor van alles: ik ken al je documenten van binnen en van buiten, ik kijk mee met foto's van etiketten of een product past, en ik maak zo een recept of dagschema voor je.`
          : `Dat was alles voor deze stap 💚 Vraag me gerust van alles: ik ken al je documenten van binnen en van buiten, ik kijk mee met foto's van etiketten of een product past, en ik maak zo een recept of dagschema voor je.`,
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
        "Dat was je voorbereidings-informatie 💚 Vraag me gerust van alles: ik ken al je documenten van binnen en van buiten, ik kijk mee met foto's van etiketten of een product past, en ik maak zo een recept of dagschema voor je.",
        1000,
      );
      await toonStartKeuze(duurVoorVraag);
      return;
    }

    // Lange fases (21+ dagen): géén door-knop zolang de fase-dagen er
    // niet op zitten (feedback Raoul 22 juli: wie net voor fase 3 koos,
    // moet niet meteen een fase 4-knop zien, en al helemaal niet eentje
    // die bij het klikken geblokkeerd blijkt). De info eindigt dan rustig
    // met wat de Mentor in deze fase kan doen.
    const dagenVol = !duur || duur < 21 || (faseDagRef.current ?? 0) >= duur;
    await mentorZegt(
      duur
        ? dagenVol
          ? `Dat was de informatie voor deze fase 💚 Neem er rustig je ${duur === 2 ? "twee laaddagen" : `${duur} dagen`} voor, ik zie je elke dag bij je check-in. Klaar met alle dagen? Tik dan hieronder op de volgende stap.`
          : `Dat was de informatie voor deze fase 💚 Neem er rustig je ${duur} dagen voor, ik zie je elke dag bij je check-in. En tussendoor ben ik er voor alles: vragen over je producten of je lijst, meekijken met een etiket-foto, of een recept of dagschema op maat. Zodra jouw dagen erop zitten, bespreken we samen de volgende stap.`
        : "Dat was alles voor deze stap 💚 Vraag me gerust van alles: ik ken al je documenten van binnen en van buiten, ik kijk mee met foto's van etiketten of een product past, en ik maak zo een recept of dagschema voor je.",
      1000,
    );
    if (!dagenVol) return;
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
    if (item.actie.type === "verlengen") {
      // "Ik blijf in fase 2": klant bepaalt zelf het moment (tot max 40
      // dagen); we vragen er niet dagelijks opnieuw naar.
      setItems((b) => b.filter((x) => x.soort !== "verder-knop"));
      const echoV = "Ik ga nog even door met fase 2 🔄";
      setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echoV }]);
      logNaarServer([{ van: "klant", soort: "tekst", tekst: echoV }]);
      markeerTouchpoint("fase2-verlengd" as TouchpointSleutel);
      await mentorZegt(
        `Helemaal goed, jij bepaalt wanneer fase 2 klaar is (verlengen mag tot maximaal 40 dagen, en overleg gerust met ${begeleiderNaam}). Ik vraag er niet elke dag naar. Zodra je zover bent zeg je letterlijk "ik wil door naar fase 3", en wil je eerst weten wat fase 3 inhoudt, vraag dan om "uitleg over fase 3". Ik zie je morgen gewoon weer bij je check-in. 💚`,
        1000,
      );
      return;
    }
    if (item.actie.type === "inkijk") {
      const doel = programma ? stationVoor(programma.slug, item.actie.slug) : null;
      if (!doel) return;
      const echoI = `Ik wil alvast lezen over ${doel.naam}`;
      setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echoI }]);
      logNaarServer([{ van: "klant", soort: "tekst", tekst: echoI }]);
      await speelInkijk(item.actie.slug);
      return;
    }
    if (item.actie.type === "opmaak-dagelijks" || item.actie.type === "opmaak-rustig") {
      const rustig = item.actie.type === "opmaak-rustig";
      // Beide keuze-knoppen weghalen; er is gekozen.
      setItems((b) =>
        b.filter(
          (x) =>
            !(
              x.soort === "verder-knop" &&
              (x.actie.type === "opmaak-dagelijks" || x.actie.type === "opmaak-rustig")
            ),
        ),
      );
      const echoO = rustig ? "Ik houd het rustig 🌿" : "Ja, blijf er dagelijks voor me 💬";
      setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echoO }]);
      logNaarServer([{ van: "klant", soort: "tekst", tekst: echoO }]);
      if (rustig) {
        markeerTouchpoint("darm-opmaak-rustig");
        await mentorZegt(
          `Helemaal goed! Dan laat ik de dagelijkse check-in los en geef ik je rust. Ik blijf hier dag en nacht bereikbaar voor elke vraag, en voor jouw vervolg zit je bij ${begeleiderNaam} helemaal goed. 💚`,
          1000,
        );
      } else {
        await mentorZegt(
          "Doen we! Dan zie ik je gewoon elke dag bij je check-in, met een tip waar je wat aan hebt. En alles vragen mag natuurlijk altijd. 💚",
          1000,
        );
      }
      return;
    }
    if (item.actie.type === "programma") {
      await startNieuwProgramma(item.actie.slug);
      return;
    }
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
    // Push-uitnodiging op de juiste plek (feedback Raoul 20 juli): pas
    // NA het eerste info-blok van dag 1, niet middenin de intro.
    if (pushNaEersteBlokRef.current) {
      pushNaEersteBlokRef.current = false;
      if (await magPushVragen()) {
        await wacht(900);
        await mentorZegt(
          "Nog even dit: ik geef je elke ochtend een klein seintje voor je dagelijkse check-in, dan hoef jij niks te onthouden en houd ik je voortgang perfect bij. Tik op de knop hieronder en je seintjes staan aan. 🔔",
          1000,
        );
        toonPushOptIn();
      }
    }
    if (index + 1 < chunkPlanRef.current.length) {
      toonVerderKnop(index + 1, stationSlug);
    } else if (programma && station) {
      await sluitStationAf(programma, station);
    }
  }

  // Kop van een fase: naam + duur, maar zonder dubbelop ("De 16 dagen ·
  // 16 dagen" voelde overbodig, feedback Raoul 24 juli).
  function faseKop(st: ResetStation): string {
    const naamZegtDuur = st.naam.toLowerCase().includes("dag");
    return naamZegtDuur ? `${st.emoji} ${st.naam}` : `${st.emoji} ${st.naam} · ${st.duur}`;
  }

  async function introStation(prog: ResetProgramma, st: ResetStation) {
    setStation(st);
    await mentorZegt(`${faseKop(st)}\n\n${st.welkom}`, 1100);
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

  // Reset-fase-regie (feedback Raoul 21+22 juli): fase 2 duurt minimaal
  // 21 dagen en fase 3 ALTIJD exact 21 dagen; eerder door kan niet, hoe
  // graag iemand ook wil. Alvast lezen kan altijd, echt overstappen niet.
  function magNaarVolgendeFase(doelSlug: string): { ok: boolean; reden?: string } {
    const dag = faseDagRef.current ?? 0;
    if (
      programma?.slug === "reset" &&
      station?.slug === "omschakeling" &&
      doelSlug === "stabilisatie" &&
      dag < 21
    ) {
      return {
        ok: false,
        reden: `Ik snap dat je door wilt, maar fase 2 duurt minimaal 21 dagen; die tijd heeft je lichaam echt nodig voor de omschakeling. Je zit nu op dag ${dag || "?"}, dus nog ${Math.max(1, 21 - dag)} ${21 - dag === 1 ? "dag" : "dagen"} en dan mag je door naar fase 3. Wil je alvast weten wat er dan komt? Vraag me gerust om uitleg over fase 3. En gaat het ergens niet lekker en wil je dáárom door? Zeg het me, dan kijken we samen, en met ${begeleiderNaam}, wat je kunt doen om deze fase zo goed mogelijk af te ronden. 💪`,
      };
    }
    if (
      programma?.slug === "reset" &&
      station?.slug === "stabilisatie" &&
      doelSlug === "logisch-leven" &&
      dag < 21
    ) {
      return {
        ok: false,
        reden: `Ik snap dat je door wilt, maar fase 3 duurt echt de volle 21 dagen; zo werkt de stabilisatie nou eenmaal, korter kan niet. Je zit nu op dag ${dag || "?"}, dus nog ${Math.max(1, 21 - dag)} ${21 - dag === 1 ? "dag" : "dagen"} en dan mag je door naar fase 4. Wil je alvast weten wat er dan komt? Vraag me gerust om uitleg over fase 4. En gaat het ergens niet lekker en wil je dáárom door? Zeg het me, dan kijken we samen, en met ${begeleiderNaam}, wat je kunt doen om deze fase zo goed mogelijk af te ronden. 💪`,
      };
    }
    return { ok: true };
  }

  // Alvast lezen over een (volgende) fase: wél de informatie, géén
  // stap-wissel en géén server-update (feedback Raoul 22 juli).
  async function speelInkijk(slug: string) {
    const doel = programma ? stationVoor(programma.slug, slug) : null;
    if (!doel) return;
    await mentorZegt(
      `Goed idee, dan weet je wat er komt! 📖 Dit is ${doel.emoji} ${doel.naam} (${doel.duur}):\n\n${doel.welkom}`,
      1100,
    );
    if (doel.vandaagBelangrijk.length > 0) {
      await wacht(800);
      await mentorZegt(
        `De belangrijkste punten van die fase alvast op een rij:\n\n${doel.vandaagBelangrijk.map((p) => `• ${p}`).join("\n")}`,
        1000,
      );
    }
    await wacht(700);
    await mentorZegt(
      `Zo kun je alvast wennen aan wat er komt. Voor nu zit je gewoon nog in ${station ? `${station.emoji} ${station.naam}` : "je huidige fase"}; zodra jouw dagen erop zitten zetten we samen de echte stap. 💚`,
      900,
    );
  }

  async function naarStation(slug: string, viaMenu = false, metEcho = true) {
    if (!programma) return;
    const nieuw = stationVoor(programma.slug, slug);
    if (!nieuw || nieuw.slug === station?.slug) return;
    const check = magNaarVolgendeFase(slug);
    if (!check.ok) {
      await mentorZegt(check.reden ?? "", 900);
      return;
    }
    if (metEcho) {
      const echo = viaMenu ? `Ik wil naar ${nieuw.naam}` : "Verder!";
      setItems((b) => [...b, { van: "ik", soort: "tekst", tekst: echo }]);
      logNaarServer([{ van: "klant", soort: "tekst", tekst: echo }]);
    }
    // Teruggaan naar een fase die al eens gedaan is (bijv. nog een ronde
    // fase 2)? Dan géén volledige intro met video/documenten/alle stappen
    // (feedback Raoul 22 juli: "die kennen ze nog"), maar een korte
    // opfrisser. Vragen kan altijd.
    const oudeIndex = programma.stations.findIndex((s) => s.slug === station?.slug);
    const nieuweIndex = programma.stations.findIndex((s) => s.slug === nieuw.slug);
    const isTerug = oudeIndex >= 0 && nieuweIndex >= 0 && nieuweIndex < oudeIndex;
    if (token) {
      fetch("/api/resetcode/stap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, station: nieuw.slug }),
      }).catch(() => {});
    }
    faseDagRef.current = 1;
    if (isTerug) {
      setStation(nieuw);
      await mentorZegt(
        `Welkom terug in ${nieuw.emoji} ${nieuw.naam}! 🔄 Jij kent deze fase al, dus ik ga je niet opnieuw door alle uitleg heen slepen. Even de kern als opfrisser:\n\n${nieuw.vandaagBelangrijk
          .slice(0, 4)
          .map((p) => `• ${p}`)
          .join("\n")}`,
        1200,
      );
      await wacht(800);
      await mentorZegt(
        "Al je documenten en de volledige uitleg blijven gewoon bij me: vraag me wat je maar wilt, of laat me een recept of dagschema maken. Zet 'm op, ik zie je bij je check-in! 💪",
        900,
      );
      return;
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

    // "Wat neem ik vandaag?": het dagelijkse innameschema (darm). Toont
    // de dag zodra de schema-data gevuld is; tot die tijd warm verwijzen
    // naar het schema in het boekje (nooit doseringen gokken).
    if (
      programma.slug === "darm" &&
      /\b(wat (moet|mag|neem) ik (vandaag|nu|deze dag)|inname[s]?( van| voor)? vandaag|schema( van| voor)? vandaag|welke producten (neem|moet) ik vandaag)\b/.test(
        t,
      )
    ) {
      zeg();
      const dagS = dagNummer ?? 0;
      const s =
        dagS >= 1 && dagS <= 16 ? innameVoorDag(pakketRef.current, dagS) : null;
      if (s) {
        await mentorZegt(
          `📋 Jouw innames voor dag ${dagS}:\n\n${formatInname(s)}`,
          900,
        );
      } else {
        await mentorZegt(
          "Je precieze aantallen per dag staan in het innameschema in je programmaboekje: het rode schema bij het basispakket, het blauwe bij het plus-pakket. De aantallen lopen per dag op, dus kijk even bij jouw dag. Twijfel je ergens over? Stuur gerust een foto van je schema, dan kijk ik met je mee. 💚",
          900,
        );
      }
      return true;
    }

    // Expliciete fase-intenties (feedback Raoul 22 juli: "verder" alleen
    // is te vaag). "Ik wil door naar fase 3" wisselt echt (met de
    // 21-dagen-rem als vangnet), "uitleg over fase 3" speelt de inkijk.
    const stationVoorFase = (nr: string) =>
      programma.stations.find((s) => s.naam.startsWith(`Fase ${nr}`)) ?? null;
    const infoMatch = t.match(
      /\b(?:meer\s+)?(?:info(?:rmatie)?|uitleg|lezen|weten)\s+(?:over|van|wat)?\s*(?:is\s+)?fase\s*([1-5])\b/,
    );
    if (infoMatch) {
      const doel = stationVoorFase(infoMatch[1]);
      if (doel) {
        zeg();
        await speelInkijk(doel.slug);
        return true;
      }
    }
    const gaMatch = t.match(
      /^\s*(?:ik\s+(?:wil|ga)(?:\s+graag)?(?:\s+door|\s+verder)?|door|verder)\s+naar\s+fase\s*([1-5])\s*[!.]?\s*$/,
    );
    if (gaMatch) {
      const doel = stationVoorFase(gaMatch[1]);
      if (doel) {
        zeg();
        if (doel.slug === station.slug) {
          await mentorZegt(
            `Goed nieuws: daar zit je al! 😄 Je bent gewoon lekker bezig in ${doel.emoji} ${doel.naam}.`,
            800,
          );
          return true;
        }
        await naarStation(doel.slug, false, false);
        return true;
      }
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
        await naarStation(programma.stations[i + 1].slug, false, false);
      } else {
        // Expliciete klaar-route: de klant zégt zelf dat de dagen erop
        // zitten. Maar het einde-feest speelt pas als de dagen er ÉCHT
        // op zitten (feedback Raoul 22 juli: "verder" op dag 3 gaf het
        // complete einde-verhaal).
        zeg();
        const duurLaatste = FASE_DAGEN[station.slug];
        const dagNu = faseDagRef.current ?? 0;
        if (duurLaatste && dagNu > 0 && dagNu <= duurLaatste) {
          // Darm kent geen "volgende fase" om naartoe te willen; leg dat
          // gewoon warm uit (feedback Raoul 23 juli). De reset (fase 4)
          // houdt de fase-rem.
          await mentorZegt(
            programma.slug === "darm"
              ? `Goed nieuws: er valt hier niks door te klikken 😄 Je 16 dagen lopen gewoon vanzelf door, dag voor dag, en jij zit nu op dag ${dagNu}. Ik loop elke dag met je mee: je check-in, je vragen, je recepten. Gaat het ergens niet lekker, of twijfel je ergens over? Zeg het me gewoon, dan kijken we samen, en met ${begeleiderNaam}, hoe we het fijn maken. 💪`
              : `Ik snap dat je vooruit wilt, maar deze fase duurt ${duurLaatste} dagen en jij zit nu op dag ${dagNu}. Nog ${Math.max(1, duurLaatste - dagNu + 1)} ${duurLaatste - dagNu + 1 === 1 ? "dag" : "dagen"}, en dan vieren we het hier samen, beloofd. 🎉 En gaat het ergens niet lekker en wil je dáárom stoppen? Zeg het me, dan kijken we samen, en met ${begeleiderNaam}, wat je kunt doen om het goed af te ronden. 💪`,
            1000,
          );
          return true;
        }
        await speelEindeMoment(programma, station);
        markeerTouchpoint(("programma-einde-" + programma.slug) as TouchpointSleutel);
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
      await wacht(1000);
      await mentorZegt(
        "Kijk 'm rustig terug. En als er iets uit de video is waar je meer over wilt weten: vraag het me gewoon. 💚",
        800,
      );
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
        // Echte conclusies bij de kaart (feedback Raoul 23 juli: alleen
        // een kaartje voelde te summier): totalen + eigen winsten terug.
        const reeks = checkinReeksRef.current;
        const metGewicht = reeks.filter((r) => r.gewicht != null);
        const gDelta =
          metGewicht.length >= 2
            ? Math.round(
                ((metGewicht[metGewicht.length - 1].gewicht as number) -
                  (metGewicht[0].gewicht as number)) *
                  10,
              ) / 10
            : null;
        const metTailleV = reeks.filter((r) => r.taille != null);
        const tDeltaV =
          metTailleV.length >= 2
            ? Math.round(
                ((metTailleV[metTailleV.length - 1].taille as number) -
                  (metTailleV[0].taille as number)) *
                  10,
              ) / 10
            : null;
        const winstenV = reeks
          .filter((r) => r.notitie)
          .slice(-3)
          .map((r) => `"${r.notitie}"`);
        const delenV: string[] = [
          `${reeks.length} check-in${reeks.length === 1 ? "" : "s"} gedaan${dagNummer ? ` in ${dagNummer} ${dagNummer === 1 ? "dag" : "dagen"}` : ""}`,
        ];
        if (gDelta != null && gDelta < 0) delenV.push(`${Math.abs(gDelta)} kilo eraf`);
        if (gDelta != null && gDelta > 0) delenV.push(`${Math.abs(gDelta)} kilo erbij (schommelingen zijn normaal, vaak vocht)`);
        if (tDeltaV != null && tDeltaV < 0) delenV.push(`${Math.abs(tDeltaV)} centimeter van je taille`);
        await wacht(600);
        await mentorZegt(
          winstenV.length
            ? `Op een rij: ${delenV.join(", ")}. En dit schreef je zélf onderweg op: ${winstenV.join(", ")}. Hou dat vast, dat is geen toeval. 💚`
            : `Op een rij: ${delenV.join(", ")}. En vergeet niet: ook de dagen dat je gewoon doorging tellen mee. 💚`,
          1000,
        );
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
      // Belooft de Mentor "de groene knop"? Dan moet die er ook echt
      // staan (feedback Raoul 20 juli: knop werd genoemd maar
      // verscheen niet). De contact-kaart is die groene knop.
      if (/groene knop/i.test(ontvangen) && station) {
        await mentorKaart("contact", station.slug, 600);
      }
    } catch {
      zetLaatsteMentorTekst("De verbinding viel even weg, probeer het nog een keer.");
    } finally {
      setBezig(false);
      knoppenNaarOnder();
    }
  }

  function zetLaatsteMentorTekst(tekst: string) {
    // De weet-niet-marker is een intern signaal (server stuurt de vraag
    // door naar het team); de klant ziet hem nooit.
    const schoon = tekst.replaceAll("[[TEAMVRAAG]]", "").trimEnd();
    setItems((b) => {
      const kopie = [...b];
      const laatste = kopie[kopie.length - 1];
      if (laatste && laatste.van === "mentor" && laatste.soort === "tekst") {
        kopie[kopie.length - 1] = { van: "mentor", soort: "tekst", tekst: schoon };
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
              <div className="mt-1.5 -mx-2">
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
            <div className="mt-1.5 -mx-2">
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
            <div className="mt-1.5 -mx-2">
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
        // Heeft deze fase zelf geen documenten? Val dan terug op de
        // start-documenten: daar staat alles bij elkaar (feedback Raoul
        // 23 juli: geen losse documenten-stapjes per fase).
        let docStation = st;
        let blokken = mediaBlokken?.[`${programma.slug}/${st.slug}-docs`] ?? [];
        if (blokken.length === 0 && st.documenten.length === 0) {
          docStation = programma.stations[0] ?? st;
          blokken =
            mediaBlokken?.[`${programma.slug}/${docStation.slug}-docs`] ?? [];
        }
        const stDocs = docStation;
        return (
          <div className={kader}>
            {kop("📂", stDocs.slug === st.slug ? "Bij deze fase" : "Jouw documenten")}
            {(blokken.length > 0 || isFounder) && (
              <div className="mt-1.5">
                <MediaBlokken
                  paginaNamespace="resetcode-klant"
                  paginaId={programma.slug}
                  positie={`${stDocs.slug}-docs`}
                  blokken={blokken}
                  isFounder={Boolean(isFounder)}
                />
              </div>
            )}
            {blokken.length === 0 && (
              <div className="space-y-1.5 mt-1.5">
                {stDocs.documenten.map((d, i) => (
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
      case "contact": {
        // Voorgevuld bericht: kloppend per moment, zonder emoji's (die
        // raken corrupt in WhatsApp-prefills, bug-melding Raoul 21 juli).
        const isLaatsteStation =
          programma.stations[programma.stations.length - 1]?.slug === st.slug;
        const prefill = isLaatsteStation
          ? `Hoi ${begeleiderNaam}! Mijn dagen zitten erop en ik zou graag samen met jou kijken naar mijn vervolgstap. Wanneer komt het jou uit voor een belletje of een appje?`
          : `Hoi ${begeleiderNaam}! Ik ben bezig met ${st.naam.toLowerCase()} van mijn programma en ik wil je graag even iets vragen.`;
        return (
          <div className={kader}>
            {kop("🤝", `Samen met ${begeleiderNaam}`)}
            <p className="text-[14px] text-white/85 leading-relaxed">
              {st.contactMoment ??
                `Even iets delen of sparren? ${begeleiderNaam} is er voor je.`}
            </p>
            {isKlant && memberTelefoon ? (
              <a
                href={waLinkNaar(memberTelefoon, prefill)}
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
      }
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
            <div className="max-h-56 overflow-y-auto rounded-xl bg-black/30 px-3 py-2">
              <p className="text-[11px] text-white/70 leading-relaxed">
                {SUIKER_NAMEN.join(" · ")}
              </p>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1.5">
              ↕️ Scroll door het lijstje, er staan er ruim 150 in. Later nog
              eens nodig? Typ gewoon &quot;suikerlijst&quot; en ik zet 'm
              weer voor je klaar.
            </p>
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

  // Innameschema-pill + paneel (darm, dag 1-16): altijd bereikbaar
  // bovenin, zodat afvinken nooit terugscrollen kost.
  const dagSchemaVandaag =
    programma?.slug === "darm" &&
    station?.slug === "zestien-dagen" &&
    dagNummer != null &&
    dagNummer >= 1 &&
    dagNummer <= 16
      ? innameVoorDag(pakketRef.current ?? pakket, dagNummer)
      : null;
  const MOMENT_VOLGORDE: { sleutel: "nuchter" | "ochtend" | "lunch" | "avond" | "slapen"; label: string }[] = [
    { sleutel: "nuchter", label: "🌅 Nuchter" },
    { sleutel: "ochtend", label: "☀️ Ochtend" },
    { sleutel: "lunch", label: "🥗 Lunch" },
    { sleutel: "avond", label: "🌙 Avond" },
    { sleutel: "slapen", label: "😴 Voor het slapen" },
  ];
  const schemaMomenten = dagSchemaVandaag
    ? MOMENT_VOLGORDE.filter((m) => (dagSchemaVandaag[m.sleutel]?.length ?? 0) > 0)
    : [];
  const vinkInname = (moment: string) => {
    const wordtGedaan = !innamesGedaan.has(moment);
    setInnamesGedaan((oud) => {
      const nieuw = new Set(oud);
      if (wordtGedaan) nieuw.add(moment);
      else nieuw.delete(moment);
      return nieuw;
    });
    if (token) {
      fetch("/api/resetcode/inname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, moment, gedaan: wordtGedaan }),
      }).catch(() => {});
    }
  };

  // Testmodus: dag-springen. Eén klik = één dag beleven zoals de klant
  // die beleeft; de pagina herlaadt zodat de server de dag-momenten
  // opnieuw berekent, precies als bij een echt nieuw bezoek.
  const testSpring = async (actie: "vooruit" | "terug" | "reset") => {
    if (!token) return;
    if (
      actie === "reset" &&
      !window.confirm("De hele testreis terug naar dag 1? Alle gesprekken en vinkjes van deze testlink worden gewist.")
    )
      return;
    try {
      await fetch("/api/resetcode/test-spring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, actie }),
      });
    } catch {
      // herladen toont vanzelf de actuele stand
    }
    try {
      localStorage.removeItem(OPSLAG_SLEUTEL);
      // Bij een volledige reset ook de "push al gevraagd"-markering weg,
      // zodat het seintjes-moment opnieuw te testen is.
      if (actie === "reset" && token) {
        localStorage.removeItem(`resetcode-push-${token.slice(0, 10)}`);
      }
    } catch {}
    window.location.reload();
  };

  return (
    <div className="relative flex h-full flex-col" style={{ backgroundColor: "#0F1B17" }}>
      {testModus && (
        <div
          className="flex items-center justify-between gap-2 px-4 py-2 text-[12px]"
          style={{ backgroundColor: "#3B2667", color: "#DDD6FE" }}
        >
          <span className="font-bold">
            🧪 Testmodus · {station ? `${station.emoji} ${station.naam}` : ""} · dag {dagNummer ?? "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <button
              onClick={() => testSpring("terug")}
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
              title="Eén dag terug"
            >
              ◀ dag terug
            </button>
            <button
              onClick={() => testSpring("vooruit")}
              className="rounded-full px-2.5 py-1 font-bold"
              style={{ backgroundColor: "#7C3AED", color: "#fff" }}
              title="Beleef de volgende dag"
            >
              volgende dag ▶
            </button>
            <button
              onClick={() => testSpring("reset")}
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
              title="Hele reis opnieuw vanaf dag 1"
            >
              ⏮
            </button>
          </span>
        </div>
      )}
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
            {schemaMomenten.length > 0 && (
              <button
                onClick={() => setToonSchemaPaneel((t) => !t)}
                className="rounded-full px-3 py-1.5 text-[12px] font-bold"
                style={{
                  backgroundColor:
                    innamesGedaan.size >= schemaMomenten.length ? "#065F46" : "rgba(255,255,255,0.1)",
                  color:
                    innamesGedaan.size >= schemaMomenten.length ? "#6EE7B7" : "rgba(255,255,255,0.85)",
                }}
                title="Jouw innames van vandaag: bekijken en afvinken"
              >
                📋 {Math.min(innamesGedaan.size, schemaMomenten.length)}/{schemaMomenten.length}
              </button>
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

      {/* Innameschema-paneel: afvinken zonder terug te scrollen. */}
      {toonSchemaPaneel && dagSchemaVandaag && (
        <div
          className="absolute right-3 top-16 z-40 w-[330px] max-w-[92vw] rounded-2xl border border-emerald-500/25 p-3 shadow-2xl verschijn"
          style={{ backgroundColor: "#0A1512" }}
        >
          <div className="flex items-center justify-between pb-2">
            <p className="text-[13px] font-bold text-white">
              📋 Jouw innames · dag {dagNummer}
            </p>
            <button
              onClick={() => setToonSchemaPaneel(false)}
              className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80"
            >
              Sluiten
            </button>
          </div>
          <div className="space-y-1.5">
            {schemaMomenten.map((m) => {
              const gedaan = innamesGedaan.has(m.sleutel);
              return (
                <button
                  key={m.sleutel}
                  onClick={() => vinkInname(m.sleutel)}
                  className="w-full rounded-xl border px-3 py-2 text-left transition-colors"
                  style={{
                    borderColor: gedaan ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.12)",
                    backgroundColor: gedaan ? "rgba(6,95,70,0.35)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  <span className="flex items-start gap-2">
                    <span
                      className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{
                        backgroundColor: gedaan ? "#059669" : "rgba(255,255,255,0.12)",
                        color: gedaan ? "#ECFDF5" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {gedaan ? "✓" : ""}
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-[12px] font-semibold"
                        style={{ color: gedaan ? "#6EE7B7" : "rgba(255,255,255,0.9)" }}
                      >
                        {m.label}
                      </span>
                      <span className="block text-[11px] leading-snug text-white/55">
                        {(dagSchemaVandaag[m.sleutel] ?? []).join(" + ")}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="pt-2 text-[10px] text-white/40">
            Alleen voor jou, als geheugensteuntje. Morgen begint de teller gewoon opnieuw.
          </p>
        </div>
      )}

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
                const mijlpalen =
                  FASE_MIJLPALEN[`${programma.slug}/${s.slug}`] ?? [];
                return (
                  <div key={s.slug} className="mb-3 last:mb-0">
                    <button
                      onClick={() => {
                        if (komt) return; // vooruit kijken mag, niet openen
                        setToonReis(false);
                        naarStation(s.slug, true);
                      }}
                      disabled={komt}
                      className="relative flex items-center gap-3 w-full text-left"
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
                    {/* Mijlpalen langs de lijn: geeft het pad beleving.
                        Afgeronde fases blijven compact (alleen de fase-rij). */}
                    {!gedaan && mijlpalen.length > 0 && (
                      <div className="mt-2 mb-1 space-y-2">
                        {mijlpalen.map((m) => {
                          const dagNu = nu ? (dagNummer ?? 0) : 0;
                          const bereikt = nu && dagNu > m.dag;
                          const vandaagHier = nu && dagNu === m.dag;
                          return (
                            <div
                              key={m.dag}
                              className="relative flex items-center gap-2.5"
                            >
                              <span
                                className={`relative z-10 ml-[9px] h-3 w-3 flex-shrink-0 rounded-full ${vandaagHier ? "pols" : ""}`}
                                style={{
                                  backgroundColor: vandaagHier
                                    ? "#6EE7B7"
                                    : bereikt
                                      ? "#34D399"
                                      : "#1e2b26",
                                  border: vandaagHier
                                    ? "2px solid #ECFDF5"
                                    : bereikt
                                      ? "2px solid #34D399"
                                      : "2px solid #ffffff22",
                                }}
                              />
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold flex-shrink-0 ${
                                  vandaagHier
                                    ? "bg-emerald-500/25 text-emerald-200"
                                    : bereikt
                                      ? "bg-white/10 text-white/60"
                                      : "bg-white/5 text-white/35"
                                }`}
                              >
                                dag {m.dag}
                              </span>
                              <span
                                className={`text-[12px] leading-snug ${
                                  vandaagHier
                                    ? "text-white font-semibold"
                                    : bereikt
                                      ? "text-white/65"
                                      : "text-white/40"
                                }`}
                              >
                                {m.label}
                                {vandaagHier ? " · vandaag" : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-white/70">
                            {p.naam}
                            {(vrijgegeven ?? []).includes(p.slug) && (
                              <span className="ml-2 text-[10px] font-bold text-emerald-300">
                                🔓 vrijgegeven
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-white/40 truncate">
                            {(vrijgegeven ?? []).includes(p.slug)
                              ? `${p.duur} · klaar om te starten`
                              : `${p.duur} · 🔒 samen te kiezen met ${begeleiderNaam}`}
                          </p>
                        </div>
                        {(vrijgegeven ?? []).includes(p.slug) && (
                          <button
                            onClick={async () => {
                              setToonReis(false);
                              await startNieuwProgramma(p.slug);
                            }}
                            className="flex-shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white"
                          >
                            🌟 Start
                          </button>
                        )}
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
                        await wacht(1200);
                        await mentorZegt(
                          "Neem er echt even de tijd voor, voor veel mensen is dit een kantelpunt. Ben je klaar met kijken? Vertel me gerust wat je eruit meeneemt, of stel je vragen erover. En verder gaat vandaag gewoon door zoals je gewend bent: je check-in, je vragen, je recepten. Ik ben er. 💚",
                          1000,
                        );
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
                        verteldRef.current.delete("darm-einde");
                        await speelEindeMoment(programma, station);
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
            // Video-kaarten krijgen de volle breedte: op een telefoon
            // moet de video gewoon lekker kijkbaar zijn in de chat
            // (feedback Raoul 23 juli: kijkvak te klein).
            const volleBreedte = item.kaart.startsWith("video");
            return (
              <div key={i} className={`verschijn ${volleBreedte ? "w-full" : "max-w-[92%]"}`}>
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
                  meetDag={
                    dagNummer != null &&
                    (dagNummer === 1 || dagNummer % 7 === 0)
                  }
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
            // Bewust ÉÉN knop (feedback Raoul 20 juli): de klik is de
            // toestemming; de browser vraagt daarna zelf nog de
            // officiële systeem-toestemming.
            return (
              <div key={i} className="verschijn max-w-[92%]">
                <button
                  onClick={() => zetPushAan(item.bid)}
                  className="rounded-full bg-emerald-600 px-5 py-2.5 text-[14px] font-bold text-white"
                >
                  🔔 Zet mijn dagelijkse check-in-seintje aan
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
        <div className="flex items-end gap-2">
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
          {/* Meegroeiend invoerveld (feedback Raoul): ingesproken tekst
              moet in één oogopslag te checken zijn, dus het vak vouwt
              uit tot max ~5 regels en scrollt daarna intern. */}
          <textarea
            ref={invoerRef}
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            rows={1}
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
            className="min-w-0 flex-1 resize-none rounded-3xl bg-white/10 border border-white/15 px-4 py-3 text-[15px] leading-snug text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/60 chatscroll"
            style={{ maxHeight: 132 }}
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
