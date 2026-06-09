"use client";

// File: app/bot/reset-check/[token]/flow.tsx
//
// Token-flow voor de Holistic Reset check. Submit gaat naar de
// bestaande /api/freebie-bot/intekening-vooraf en /api/freebie-bot/opt-in,
// zodat de inzending in freebie_opt_ins + namenlijst van de member komt
// en de bestaande pijplijn-architectuur werkt.

import { useState, type ReactNode } from "react";
import { EditableTekst } from "@/components/cms/EditableTekst";
import { useEditModus } from "@/components/cms/EditModeContext";
import type { HerkomstContext } from "@/lib/freebie-bots/herkomst";
import { herkomstLabel } from "@/lib/freebie-bots/herkomst";
import {
  VRAGEN,
  PROFIEL_VRAGEN,
  MEDISCHE_PUNTEN,
  THEMA_LABELS,
  geldigeVragen,
  THEMA_BLOKKEN,
  TIPS_PER_THEMA,
  NU_PER_THEMA,
  HEEN_PER_THEMA,
  AFVAL_WENS_TEKST,
  BRUG_TEKST,
  berekenThemaScores,
  bepaalUitkomstCategorie,
  combinatieInzicht,
  berekenHeat,
  type Antwoorden,
  type ScoreWaarde,
  type Thema,
} from "@/lib/reset-check";

type Stap = 1 | 2 | 3 | 4 | 5 | "bedank";

type Props = {
  token: string;
  memberId: string;
  memberVoornaam: string;
  herkomst: HerkomstContext;
  teaserFilm: ReactNode;
  verdiepingFilm: ReactNode;
  testimonialBlok: ReactNode;
  tekstOverrides: Record<string, string>;
  isFounder: boolean;
};

const NS = "reset-check";

// Helper: bewerkbare tekst voor founders, vaste tekst voor members.
// Leest editModusAan uit context zodat de ✍️-knop pas verschijnt
// als de toggle rechtsboven is aangezet.
function T({
  sleutel,
  standaard,
  overrides,
  isFounder,
  as = "span",
  className,
  multiline,
}: {
  sleutel: string;
  standaard: string;
  overrides: Record<string, string>;
  isFounder: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span" | "li";
  className?: string;
  multiline?: boolean;
}) {
  const { editModusAan } = useEditModus();
  return (
    <EditableTekst
      namespace={NS}
      sleutel={sleutel}
      standaard={standaard}
      overrides={overrides}
      isFounder={isFounder}
      editModusAan={editModusAan}
      as={as}
      className={className}
      multiline={multiline}
    />
  );
}

const LEGE_ANTWOORDEN: Antwoorden = {
  voornaam: "",
  achternaam: "",
  email: "",
  instagram: "",
  facebook: "",
  telefoon: "",
  scores: {},
  profiel: {},
  medisch: [],
  medischVrij: "",
};

export function ResetCheckFlow({
  token,
  memberId: _memberId,
  memberVoornaam: _memberVoornaam,
  herkomst,
  teaserFilm,
  verdiepingFilm,
  testimonialBlok,
  tekstOverrides: ov,
  isFounder,
}: Props) {
  const [stap, setStap] = useState<Stap>(1);
  const [a, setA] = useState<Antwoorden>(LEGE_ANTWOORDEN);
  const [bezig, setBezig] = useState(false);

  function naar(s: Stap) {
    setStap(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const geldigVragen = geldigeVragen(a.profiel.geslacht_leeftijd);

  function kiesScore(sleutel: string, waarde: ScoreWaarde) {
    setA((prev) => ({ ...prev, scores: { ...prev.scores, [sleutel]: waarde } }));
  }

  function kiesProfiel(sleutel: string, waarde: string) {
    setA((prev) => {
      const nieuw = { ...prev, profiel: { ...prev.profiel, [sleutel]: waarde } };
      // Bij gender-wissel: irrelevante conditional scores opruimen
      if (sleutel === "geslacht_leeftijd" && waarde !== "vrouw_35plus") {
        const nieuweScores = { ...nieuw.scores };
        VRAGEN.filter((v) => v.conditional === "vrouw_35plus").forEach((v) => {
          delete nieuweScores[v.sleutel];
        });
        nieuw.scores = nieuweScores;
      }
      return nieuw;
    });
  }

  function toggleMedisch(sleutel: string) {
    setA((prev) => {
      let nieuw = [...prev.medisch];
      if (sleutel === "geen") {
        nieuw = nieuw.includes("geen") ? [] : ["geen"];
      } else {
        nieuw = nieuw.filter((s) => s !== "geen");
        if (nieuw.includes(sleutel)) nieuw = nieuw.filter((s) => s !== sleutel);
        else nieuw.push(sleutel);
      }
      return { ...prev, medisch: nieuw };
    });
  }

  const intekenenKlaar = a.voornaam.trim().length > 0 && a.email.includes("@");
  const vragenKlaar = geldigVragen.every((v) => a.scores[v.sleutel] !== undefined);
  const profielKlaar = PROFIEL_VRAGEN.every((v) => a.profiel[v.sleutel as keyof typeof a.profiel]);
  const medischKlaar = a.medisch.length > 0;

  // Intekening-vooraf: na stap 4 (intekenen) → vóór de uitkomst
  async function intekenenVooraf() {
    try {
      await fetch("/api/freebie-bot/intekening-vooraf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          leadVoornaam: a.voornaam.trim(),
          leadAchternaam: a.achternaam.trim() || a.voornaam.trim(),
          leadEmail: a.email.trim(),
          toestemming: true,
          herkomstInstagram: a.instagram.trim().replace(/^@/, "") || herkomst.instagram || null,
          herkomstFacebook: a.facebook.trim() || herkomst.facebook || null,
          herkomstBron: herkomst.bron,
        }),
      });
    } catch (e) {
      console.warn("intekening-vooraf fout", e);
    }
  }

  const [submitFout, setSubmitFout] = useState<string | null>(null);

  // Submit final: heat-info + thema-scores → spiegelTekst
  async function submit() {
    setBezig(true);
    setSubmitFout(null);
    console.info("[reset-check] submit starten, token:", token);
    try {
      const heat = berekenHeat(a);
      const themaScores = berekenThemaScores(a);
      const contactGewenst = a.telefoon.trim().length >= 8;

      const spiegelTekst = [
        `${heat.label} (heat-score ${heat.score}/10)`,
        `Profiel: ${a.profiel.geslacht_leeftijd ?? "?"} · afval-wens ${a.profiel.afvalwens ?? "?"} · investering ${a.profiel.investering ?? "?"} · afval-pogingen ${a.profiel.afvalpogingen ?? "?"}`,
        "",
        "Thema-scores:",
        ...themaScores.map((t) => `  ${THEMA_LABELS[t.thema]}: ${t.totaal}/${t.max} (${Math.round(t.pct)}%, ${t.niveau})`),
        "",
        a.medisch.length > 0
          ? `Medische punten: ${a.medisch.filter((m) => m !== "geen").join(", ") || "geen"}`
          : "Medisch: niets aangegeven",
        a.medischVrij ? `Toelichting: "${a.medischVrij}"` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const r = await fetch("/api/freebie-bot/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          leadVoornaam: a.voornaam.trim(),
          leadAchternaam: a.achternaam.trim() || a.voornaam.trim(),
          leadEmail: a.email.trim(),
          leadTelefoon: contactGewenst ? a.telefoon.trim() : null,
          antwoorden: a,
          spiegelTekst,
          contactGewenst,
          herkomstInstagram: a.instagram.trim().replace(/^@/, "") || herkomst.instagram || null,
          herkomstFacebook: a.facebook.trim() || herkomst.facebook || null,
          herkomstBron: herkomst.bron,
        }),
      });
      console.info("[reset-check] opt-in response status:", r.status);
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        console.error("[reset-check] opt-in FAILED", r.status, txt);
        setSubmitFout(
          `Er ging iets mis met versturen (status ${r.status}). Probeer opnieuw, of stuur ons een DM op Instagram als het blijft falen.`,
        );
        setBezig(false);
        return;
      }
      const data = await r.json().catch(() => ({}));
      console.info("[reset-check] opt-in success:", data);
    } catch (e) {
      console.error("[reset-check] submit exception:", e);
      setSubmitFout(
        `Verbinding gestoord (${String(e)}). Probeer opnieuw, of stuur ons een DM op Instagram als het blijft falen.`,
      );
      setBezig(false);
      return;
    }
    setBezig(false);
    naar("bedank");
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #f7f1e4 0%, #f4ebd0 30%, #ead8a0 70%, #f0e8d2 100%)",
        color: "#1a1a1a",
      }}
    >
      {/* Decoratieve achtergrond emojis */}
      <div aria-hidden className="pointer-events-none fixed top-12 -left-8 text-[180px] opacity-[0.04] rotate-12 select-none">
        🌿
      </div>
      <div aria-hidden className="pointer-events-none fixed top-1/3 -right-12 text-[180px] opacity-[0.04] -rotate-12 select-none">
        ✨
      </div>
      <div aria-hidden className="pointer-events-none fixed bottom-32 -left-6 text-[150px] opacity-[0.04] rotate-6 select-none">
        🌱
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <ProgressBar huidige={stap} />

        <div className="rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-white/40 p-6 sm:p-10 mt-6 border border-[#ead8a0]/60">
          {stap === 1 && <StapWelkom teaserFilm={teaserFilm} ov={ov} isFounder={isFounder} onStart={() => naar(2)} />}
          {stap === 2 && (
            <StapVragen
              a={a}
              geldigVragen={geldigVragen}
              kiesScore={kiesScore}
              kiesProfiel={kiesProfiel}
              klaar={vragenKlaar && profielKlaar}
              ov={ov}
              isFounder={isFounder}
              onTerug={() => naar(1)}
              onDoor={() => naar(3)}
            />
          )}
          {stap === 3 && (
            <StapMedisch
              a={a}
              toggleMedisch={toggleMedisch}
              setMedischVrij={(v) => setA((p) => ({ ...p, medischVrij: v }))}
              klaar={medischKlaar}
              ov={ov}
              isFounder={isFounder}
              onTerug={() => naar(2)}
              onDoor={() => naar(4)}
            />
          )}
          {stap === 4 && (
            <StapIntekenen
              a={a}
              setA={setA}
              testimonialBlok={testimonialBlok}
              klaar={intekenenKlaar}
              ov={ov}
              isFounder={isFounder}
              onTerug={() => naar(3)}
              onDoor={async () => {
                // Push naar pijplijn vlak vóór de uitkomst, zodat de
                // member ook leads in z'n namenlijst krijgt die uiteindelijk
                // niet door de hele uitkomst klikken.
                await intekenenVooraf();
                naar(5);
              }}
            />
          )}
          {stap === 5 && (
            <StapUitkomst
              a={a}
              setTelefoon={(t) => setA((p) => ({ ...p, telefoon: t }))}
              verdiepingFilm={verdiepingFilm}
              bezig={bezig}
              submitFout={submitFout}
              ov={ov}
              isFounder={isFounder}
              onTerug={() => naar(4)}
              onSubmit={submit}
            />
          )}
          {stap === "bedank" && <StapBedank a={a} ov={ov} isFounder={isFounder} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================
function ProgressBar({ huidige }: { huidige: Stap }) {
  const idx = huidige === "bedank" ? 5 : huidige;
  const labels = ["Welkom", "Vragen", "Check", "Gegevens", "Uitkomst"];
  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all"
            style={{
              background:
                i < idx ? "#0d0d0d" : i === idx ? "#c9a961" : "rgba(224, 216, 188, 0.6)",
              boxShadow: i === idx ? "0 0 12px rgba(201, 169, 97, 0.5)" : "none",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
        {labels.map((label, i) => (
          <span
            key={label}
            className="flex-1 text-center"
            style={{
              color: i + 1 === idx ? "#1a1a1a" : i + 1 < idx ? "#6b5524" : "#a0936e",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// STAP 1: WELKOM
// ============================================================
function StapWelkom({
  teaserFilm,
  ov,
  isFounder,
  onStart,
}: {
  teaserFilm: ReactNode;
  ov: Record<string, string>;
  isFounder: boolean;
  onStart: () => void;
}) {
  return (
    <section>
      <div className="text-center mb-6">
        <div className="relative mx-auto mb-3 h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c9a961] to-[#ead8a0] blur-xl opacity-70" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#faf5e6] to-[#f0e8d2] text-4xl shadow-md ring-4 ring-white/70">
            🌿
          </div>
        </div>
        <Tag>
          <T sleutel="welkom.tag" standaard="Holistic Reset" overrides={ov} isFounder={isFounder} />
        </Tag>
      </div>
      <T
        sleutel="welkom.titel"
        standaard="Klopt de Reset bij jou?"
        overrides={ov}
        isFounder={isFounder}
        as="h1"
        className="block text-3xl sm:text-4xl font-extrabold text-center mb-4"
      />
      <T
        sleutel="welkom.intro1"
        standaard="Wat fijn dat je hier bent 🥰 De Holistic Reset is een traject van 65 dagen rondom voeding, ritme en begeleiding. Voor veel mensen is dit het bewuste startpunt geweest van een nieuwe leefstijl, eentje die ze wél vol konden houden, ook na al die keren dat het eerder niet lukte."
        overrides={ov}
        isFounder={isFounder}
        as="p"
        multiline
        className="mb-3"
      />
      <T
        sleutel="welkom.intro2"
        standaard="In een paar minuutjes weet je of dit ook bij jou past, en wat voor jou een goede eerste stap zou zijn 👍🏽"
        overrides={ov}
        isFounder={isFounder}
        as="p"
        multiline
        className="mb-4"
      />

      <div className="my-5">{teaserFilm}</div>

      <div className="bg-[#faf5e6] border border-[#ead8a0] rounded-xl p-4 my-4">
        <T
          sleutel="welkom.lijstje.titel"
          standaard="Wat krijg je hier voor terug?"
          overrides={ov}
          isFounder={isFounder}
          as="h3"
          className="font-bold text-[#6b5524] mb-2"
        />
        <ul className="space-y-2 pl-1 text-sm">
          <li>📋 <T sleutel="welkom.lijstje.uitkomst" standaard="Direct na het invullen: jouw persoonlijke uitkomst, met inzichten en concrete tips die we vanuit onze praktijk kennen, afgestemd op wat jij zelf hebt gedeeld." overrides={ov} isFounder={isFounder} multiline /></li>
          <li>🔍 <T sleutel="welkom.lijstje.inzichten" standaard="Diepgaande inzichten over de Holistic Reset, hoe het traject eruit ziet, voor wie het werkt en wat mensen die het hebben gedaan ons vertellen over hun ervaring." overrides={ov} isFounder={isFounder} multiline /></li>
          <li>🎬 <T sleutel="welkom.lijstje.video" standaard="Een verdiepende video aan het einde, waarin we het hele verhaal nog rustig uitleggen." overrides={ov} isFounder={isFounder} multiline /></li>
          <li>💌 <T sleutel="welkom.lijstje.mail" standaard="Een korte mailserie met tips & tricks, die je zo kunt toepassen, ook als je verder niks met de Reset doet. Op elk moment afmelden uiteraard." overrides={ov} isFounder={isFounder} multiline /></li>
          <li>📱 <T sleutel="welkom.lijstje.gesprek" standaard="Helemaal vrijblijvend: een korte kennismaking, waarin we de Reset persoonlijk op jou afstemmen en je gelijk hoort wat de investering voor jou zou worden 🥰" overrides={ov} isFounder={isFounder} multiline /></li>
        </ul>
        <T
          sleutel="welkom.lijstje.duur"
          standaard="Je doorloopt nu wat korte vragen. Duurt 3 tot 5 minuten."
          overrides={ov}
          isFounder={isFounder}
          as="p"
          className="text-xs text-gray-600 mt-3"
        />
      </div>

      <div className="bg-[#f7f1e4] border-l-4 border-[#c9a961] p-3 my-4 rounded-r-lg text-sm">
        <strong>Wat doen we met je antwoorden? </strong>
        <T
          sleutel="welkom.privacy"
          standaard="We bewaren ze kort, zodat we ons gesprek met jou goed kunnen voorbereiden en je een persoonlijk advies kunnen geven. Daarna verwijderen we ze, uiterlijk na 30 dagen of zodra we elkaar gesproken hebben. Verder delen we niks met derden 🥰"
          overrides={ov}
          isFounder={isFounder}
          multiline
        />
      </div>

      <KnopHoofd onClick={onStart}>
        <T sleutel="welkom.knop" standaard="Start de check →" overrides={ov} isFounder={isFounder} />
      </KnopHoofd>
    </section>
  );
}

// ============================================================
// STAP 2: VRAGEN
// ============================================================
function StapVragen({
  a,
  geldigVragen,
  kiesScore,
  kiesProfiel,
  klaar,
  ov,
  isFounder,
  onTerug,
  onDoor,
}: {
  a: Antwoorden;
  geldigVragen: typeof VRAGEN;
  kiesScore: (s: string, w: ScoreWaarde) => void;
  kiesProfiel: (s: string, w: string) => void;
  klaar: boolean;
  ov: Record<string, string>;
  isFounder: boolean;
  onTerug: () => void;
  onDoor: () => void;
}) {
  const geslachtVraag = PROFIEL_VRAGEN.find((p) => p.sleutel === "geslacht_leeftijd")!;
  const profielRest = PROFIEL_VRAGEN.filter((p) => p.sleutel !== "geslacht_leeftijd");
  const totaalIngevuld =
    geldigVragen.filter((v) => a.scores[v.sleutel] !== undefined).length +
    Object.keys(a.profiel).length;
  const totaalVragen = geldigVragen.length + PROFIEL_VRAGEN.length;

  return (
    <section>
      <Tag>Persoonlijke check</Tag>
      <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-3">Hoe ervaar jij deze thema&apos;s nu?</h1>
      <p className="text-sm text-gray-600 mb-4">
        Kies wat het meest bij jou past. Eerlijk antwoorden helpt je het meest, ook bij de dingen waar je liever niet aan denkt 🥰
      </p>

      {/* GESLACHT-VRAAG bovenaan */}
      <ProfielKeuze
        v={geslachtVraag}
        gekozen={a.profiel.geslacht_leeftijd}
        onKies={(w) => kiesProfiel("geslacht_leeftijd", w)}
      />

      {/* SCORE-VRAGEN */}
      {geldigVragen.map((v, i) => (
        <div key={v.sleutel} className="my-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#c9a961] mb-1">
            Vraag {i + 1} van {geldigVragen.length}
          </div>
          <div className="text-lg font-bold mb-1">{v.titel}</div>
          {v.onder && <div className="text-sm italic text-gray-500 mb-3">{v.onder}</div>}
          <div className="flex flex-col gap-2">
            {v.antwoorden.map((aw) => (
              <button
                key={aw.waarde}
                onClick={() => kiesScore(v.sleutel, aw.waarde)}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  a.scores[v.sleutel] === aw.waarde
                    ? "border-[#0d0d0d] bg-[#faf5e6]"
                    : "border-[#e0d8bc] bg-white hover:border-[#c9a961] hover:bg-[#faf5e6]"
                }`}
              >
                {aw.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* PROFILE-VRAGEN ONDER */}
      <h2 className="text-lg font-bold mt-8 pt-6 border-t border-[#e0d8bc]">Een paar vragen over jou en je doelen</h2>
      <p className="text-sm text-gray-600 mb-4">Het laatste stukje, helpt ons om in ons gesprek meteen de juiste aanpak met je te bespreken.</p>
      {profielRest.map((v) => (
        <ProfielKeuze
          key={v.sleutel}
          v={v}
          gekozen={a.profiel[v.sleutel as keyof typeof a.profiel]}
          onKies={(w) => kiesProfiel(v.sleutel, w)}
        />
      ))}

      <KnopHoofd onClick={onDoor} disabled={!klaar}>
        {klaar ? "Door naar de gezondheidsvragen →" : `${totaalIngevuld} van ${totaalVragen} ingevuld`}
      </KnopHoofd>
      <KnopTerug onClick={onTerug}>← Terug</KnopTerug>
    </section>
  );
}

function ProfielKeuze({
  v,
  gekozen,
  onKies,
}: {
  v: (typeof PROFIEL_VRAGEN)[number];
  gekozen?: string;
  onKies: (w: string) => void;
}) {
  return (
    <div className="my-5">
      <div className="text-lg font-bold mb-1">{v.titel}</div>
      {v.onder && <div className="text-sm italic text-gray-500 mb-3">{v.onder}</div>}
      <div className="flex flex-col gap-2">
        {v.antwoorden.map((aw) => (
          <button
            key={aw.waarde}
            onClick={() => onKies(aw.waarde)}
            className={`text-left p-3 rounded-lg border-2 transition-all ${
              gekozen === aw.waarde
                ? "border-[#0d0d0d] bg-[#faf5e6]"
                : "border-[#e0d8bc] bg-white hover:border-[#c9a961] hover:bg-[#faf5e6]"
            }`}
          >
            {aw.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// STAP 3: MEDISCH
// ============================================================
function StapMedisch({
  a,
  toggleMedisch,
  setMedischVrij,
  klaar,
  ov,
  isFounder,
  onTerug,
  onDoor,
}: {
  a: Antwoorden;
  toggleMedisch: (s: string) => void;
  setMedischVrij: (v: string) => void;
  klaar: boolean;
  ov: Record<string, string>;
  isFounder: boolean;
  onTerug: () => void;
  onDoor: () => void;
}) {
  const heeftIets = a.medisch.filter((s) => s !== "geen").length > 0;
  return (
    <section>
      <Tag>Bijna klaar</Tag>
      <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-3">Een paar dingen die we graag van je weten</h1>

      <div className="bg-[#fce8e8] border-2 border-[#d97757] rounded-xl p-4 my-4">
        <h3 className="font-bold text-[#b34a1f] mb-2">Wij zijn geen arts</h3>
        <p className="text-sm">We stellen geen diagnose en behandelen geen aandoeningen. Deze paar vragen helpen ons om in ons gesprek de juiste aanpak met jou te bespreken, meer niet. Heb je klachten of sta je onder behandeling van een arts? Blijf je altijd onder die behandeling. We werken graag mét je arts mee, niet eromheen 🥰</p>
      </div>

      <div className="bg-white border border-[#e0d8bc] rounded-xl p-4 my-4">
        <h3 className="font-bold mb-2">Herken je een of meer van deze punten?</h3>
        <p className="text-sm text-gray-600 mb-3">Vink aan wat van toepassing is. Hoeft niet hoor, je kunt het ook bewaren voor het gesprek.</p>
        <div className="space-y-1">
          {MEDISCHE_PUNTEN.map((p) => (
            <label key={p.sleutel} className="flex items-start gap-2 p-2 rounded hover:bg-[#faf5e6] cursor-pointer">
              <input
                type="checkbox"
                checked={a.medisch.includes(p.sleutel)}
                onChange={() => toggleMedisch(p.sleutel)}
                className="mt-1 accent-[#c9a961]"
              />
              <span className="text-sm">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {heeftIets && (
        <div className="my-4">
          <label className="block font-bold text-sm mb-1">Wil je er iets bij vertellen? (Optioneel)</label>
          <textarea
            value={a.medischVrij}
            onChange={(e) => setMedischVrij(e.target.value)}
            placeholder="Bijvoorbeeld: ik gebruik medicatie voor mijn bloeddruk... of: ik ben in mijn vierde maand zwanger..."
            className="w-full p-3 border-2 border-[#e0d8bc] rounded-lg text-sm min-h-[80px] focus:border-[#c9a961] focus:outline-none"
          />
          <small className="text-xs text-gray-500">Je hoeft niet te zeggen welke medicatie precies, alleen waarvoor. Of, als je liever wilt, bewaar je het voor het gesprek.</small>
        </div>
      )}

      <KnopHoofd onClick={onDoor} disabled={!klaar}>
        Door naar mijn uitkomst →
      </KnopHoofd>
      <KnopTerug onClick={onTerug}>← Terug</KnopTerug>
    </section>
  );
}

// ============================================================
// STAP 4: INTEKENEN
// ============================================================
function StapIntekenen({
  a,
  setA,
  testimonialBlok,
  klaar,
  ov,
  isFounder,
  onTerug,
  onDoor,
}: {
  a: Antwoorden;
  setA: React.Dispatch<React.SetStateAction<Antwoorden>>;
  testimonialBlok: ReactNode;
  klaar: boolean;
  ov: Record<string, string>;
  isFounder: boolean;
  onTerug: () => void;
  onDoor: () => void;
}) {
  function up<K extends keyof Antwoorden>(k: K, v: Antwoorden[K]) {
    setA((p) => ({ ...p, [k]: v }));
  }
  return (
    <section>
      {/* TESTIMONIALS bovenaan, vlak voor ze hun gegevens invullen */}
      {testimonialBlok && (
        <div className="mb-6 pb-6 border-b border-[#e0d8bc]">
          <div className="text-center mb-4">
            <Tag>Verhalen van mensen</Tag>
            <h2 className="text-xl font-bold mt-2">Hoe is het voor anderen geweest?</h2>
            <p className="text-sm text-gray-600">Echte verhalen van mensen die het traject hebben gedaan.</p>
          </div>
          {testimonialBlok}
        </div>
      )}

      <Tag>Bijna bij je uitkomst</Tag>
      <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-3">Nog één stapje, dan zie je je uitkomst</h1>
      <p className="mb-4">
        Je bent er bijna 🥰 We hebben je persoonlijke uitkomst en de tips klaarstaan, helemaal afgestemd op wat jij hebt gedeeld. Vul je naam en e-mail in, dan zie je &apos;m direct én sturen we &apos;m naar je mail samen met onze gratis tips &amp; tricks mailserie.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Veld label="Voornaam *" type="text" value={a.voornaam} onChange={(v) => up("voornaam", v)} />
        <Veld label="Achternaam" type="text" value={a.achternaam} onChange={(v) => up("achternaam", v)} />
      </div>
      <Veld
        label="E-mailadres *"
        type="email"
        value={a.email}
        onChange={(v) => up("email", v)}
        hint="We sturen jouw persoonlijke uitkomst hierheen, plus de tips & tricks mailserie. Op elk moment afmelden."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Veld label="Instagram (optioneel)" type="text" value={a.instagram} onChange={(v) => up("instagram", v)} placeholder="@gebruikersnaam" />
        <Veld label="Facebook (optioneel)" type="text" value={a.facebook} onChange={(v) => up("facebook", v)} placeholder="je profielnaam" />
      </div>

      <KnopHoofd onClick={onDoor} disabled={!klaar}>
        Toon mijn persoonlijke uitkomst →
      </KnopHoofd>
      <KnopTerug onClick={onTerug}>← Terug</KnopTerug>
    </section>
  );
}

// ============================================================
// STAP 5: UITKOMST
// ============================================================
function StapUitkomst({
  a,
  setTelefoon,
  verdiepingFilm,
  bezig,
  submitFout,
  ov,
  isFounder,
  onTerug,
  onSubmit,
}: {
  a: Antwoorden;
  setTelefoon: (t: string) => void;
  verdiepingFilm: ReactNode;
  bezig: boolean;
  submitFout: string | null;
  ov: Record<string, string>;
  isFounder: boolean;
  onTerug: () => void;
  onSubmit: () => void;
}) {
  const themaScores = berekenThemaScores(a);
  const categorie = bepaalUitkomstCategorie(a);
  const heeftMedisch = a.medisch.some((s) => s !== "zwanger" && s !== "geen");
  const combi = combinatieInzicht(themaScores);
  const top2 = [...themaScores].sort((x, y) => y.pct - x.pct).slice(0, 2).map((t) => t.thema);

  let bannerEmoji = "🌱";
  let bannerTitel = "De Reset kan goed bij jou passen";
  let bannerTekst = `Op basis van wat je hebt gedeeld, stemmen we in ons gesprek de Reset persoonlijk op jou af. Je hoort gelijk wat de investering voor jou zou worden, zonder dat je hoeft te beslissen of je iets gaat doen. Helemaal vrijblijvend dus, jij beslist rustig zelf 🥰`;
  let bannerBg = "bg-[#e8f5ec] border-[#2d8f4f]";

  if (categorie === "warm") {
    bannerEmoji = "🌷";
    bannerTitel = "Wat een mooie fase";
    bannerTekst = `Zwanger of borstvoeding gevend, wat een mooie fase 🥰 We kijken samen wat past bij jou en je kindje, en wat een goed moment zou zijn om straks de Reset op te pakken. In ons gesprek stemmen we het persoonlijk op je af en hoor je gelijk wat de investering voor jou zou worden. Helemaal vrijblijvend natuurlijk, jij beslist.`;
    bannerBg = "bg-[#fce8e8] border-[#d97757]";
  } else if (heeftMedisch) {
    bannerTekst = `Wat fijn dat je die gezondheidspunten met ons hebt gedeeld, daar hebben we wat aan 🥰 Veel mensen met zo'n punt doen de Reset uiteindelijk wel, mits we het samen goed afstemmen en, waar nodig, met je arts mee laten kijken. In ons gesprek stemmen we het persoonlijk op jou af en hoor je gelijk wat de investering zou zijn. Helemaal vrijblijvend uiteraard.`;
  }

  // Kennis-gap
  const nuPunten = top2
    .filter((t) => (themaScores.find((s) => s.thema === t)?.pct ?? 0) >= 33)
    .map((t) => NU_PER_THEMA[t]);
  const heenPunten = top2
    .filter((t) => (themaScores.find((s) => s.thema === t)?.pct ?? 0) >= 33)
    .map((t) => HEEN_PER_THEMA[t]);
  const afvalTekst = a.profiel.afvalwens ? AFVAL_WENS_TEKST[a.profiel.afvalwens] : null;
  const intentieStaart =
    (a.scores.intentie ?? 0) >= 2
      ? "Plus dat gevoel van: ja, dit is wat ik wil 🥰"
      : "Een rustig gevoel ook, van hier zou het naartoe mogen.";

  const heenZinnen = [...heenPunten];
  if (afvalTekst) heenZinnen.push(afvalTekst);

  return (
    <section>
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{bannerEmoji}</div>
        <h1 className="text-2xl font-extrabold mb-1">{bannerTitel}</h1>
        <p className="text-sm text-gray-600">Hieronder lees je jouw uitkomst per thema, plus inzichten en concrete tips uit onze praktijk.</p>
      </div>

      <div className={`${bannerBg} border-2 rounded-xl p-4 my-5`}>
        <h3 className="font-bold mb-2">Voor jouw situatie specifiek</h3>
        <p className="text-sm">{bannerTekst}</p>
      </div>

      {/* KENNIS-GAP */}
      <div className="rounded-2xl p-5 my-5" style={{ background: "linear-gradient(135deg, #faf5e6 0%, #f0e8d2 100%)", border: "1px solid #ead8a0" }}>
        <h3 className="text-center font-extrabold text-lg">Het verschil dat we voor je zien</h3>
        <p className="text-center text-xs italic text-[#6b5524] mb-4">Tussen waar je nu staat, en waar je heen wilt 🥰</p>

        <div className="bg-white rounded-xl p-4 border-2 border-[#d97757] mb-3">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#b34a1f] mb-1">Waar je nu staat</div>
          <h4 className="font-bold">Wat je elke dag voelt</h4>
          <p className="text-sm">
            {nuPunten.length > 0
              ? `Je gaf aan dat je vooral last hebt van ${nuPunten.join(", en ")}. Dat is iets wat je elke dag voelt, in je werk, je gezin, je rust… het kost je vaak meer energie dan je zelf in de gaten hebt 🥰`
              : "Je antwoorden laten zien dat je nu best stabiel staat. Hier en daar nog wat kleine signalen die om aandacht vragen, niks ernstigs hoor, wel iets om bewust van te zijn."}
          </p>
        </div>

        <div className="text-center text-2xl text-[#c9a961]">↓</div>

        <div className="bg-white rounded-xl p-4 border-2 border-[#2d8f4f] my-3">
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#1f6b35] mb-1">Waar je heen wilt</div>
          <h4 className="font-bold mb-2">Hoe het ook kan voelen</h4>
          <p className="text-sm mb-3">
            {heenZinnen.length > 0
              ? `Stel je een dag voor, eentje met ${heenZinnen.join(", en ")}. ${intentieStaart}`
              : `Een dag waarin je lichaam meewerkt, in plaats van tegen je in. ${intentieStaart}`}
          </p>
          <p className="text-sm mb-2">Heel veel mensen die het traject doen, vertellen ons over een soort lichtere versie van zichzelf die ze niet hadden zien aankomen. Een paar van de dingen die ze beschrijven:</p>
          <ul className="text-sm space-y-1.5 list-none pl-0">
            <li>🌅 <strong>Wakker worden met zin in de dag</strong>, niet eerst een uur opwarmen op de koffie</li>
            <li>👕 <strong>Kleren die over je heen glijden</strong> in plaats van eraan vast te zitten</li>
            <li>⚡ <strong>Halverwege de middag nog energie</strong> over, ook zonder dat tweede bakkie</li>
            <li>🏃 <strong>Plotseling zin in bewegen of sporten</strong>, niet meer omdat het moet, gewoon omdat je dat wilt</li>
            <li>🌙 <strong>&apos;s Avonds nog tijd en zin</strong> om iets leuks te doen, niet alleen overleven op de bank</li>
            <li>🧠 <strong>Een rustig hoofd</strong>, helderder denken, en het gevoel: ja, dit klopt 🥰</li>
          </ul>
          <p className="text-xs italic text-gray-600 mt-3">Niet morgen, niet over een week. Wel gaandeweg, tijdens en na het traject. Voor sommigen krachtiger in de eerste weken, voor anderen pas later. Voor iedereen anders.</p>
        </div>

        <div className="text-center text-2xl text-[#c9a961]">↓</div>

        <div className="rounded-xl p-4 border-2 border-[#c9a961] my-3" style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)", color: "#f0e8d2" }}>
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#c9a961] mb-1">En wat ertussen zit</div>
          <h4 className="font-bold text-white">Daar hebben wij wat voor</h4>
          <p className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: BRUG_TEKST.replace(/\n\n/g, "<br/><br/>") }} />
        </div>
      </div>

      {/* THEMA-SCORES */}
      <h2 className="text-lg font-bold mt-6 mb-3">Jouw uitkomst per thema</h2>
      {themaScores.map((ts) => {
        const blok = THEMA_BLOKKEN[ts.thema][ts.niveau];
        const balkColor = ts.niveau === "laag" ? "#2d8f4f" : ts.niveau === "midden" ? "#c9a961" : "#d97757";
        return (
          <div key={ts.thema} className="bg-white rounded-xl p-4 my-3 border border-[#e0d8bc]">
            <div className="flex justify-between items-baseline mb-2">
              <div className="font-bold">{THEMA_LABELS[ts.thema]}</div>
              <div className="text-xs font-bold text-[#c9a961]">{ts.totaal} / {ts.max}</div>
            </div>
            <div className="h-2 bg-[#e0d8bc] rounded overflow-hidden mb-2">
              <div className="h-full rounded" style={{ width: `${ts.pct}%`, background: balkColor }} />
            </div>
            <p className="text-sm mb-2"><strong>{blok.titel}.</strong> {blok.tekst}</p>
            <div className="bg-[#f7f1e4] border-l-4 border-[#c9a961] p-2 rounded text-xs">
              <strong>Uit onze praktijk:</strong> {blok.praktijk}
            </div>
          </div>
        );
      })}

      {/* COMBI */}
      {combi && (
        <div className="rounded-xl p-5 my-4" style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)", color: "#f0e8d2" }}>
          <div className="text-[10px] uppercase tracking-widest font-bold text-[#c9a961] mb-1">Wat valt op aan jouw antwoorden</div>
          <h3 className="text-white text-lg font-bold mb-2">{combi.titel}</h3>
          <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: combi.tekst }} />
        </div>
      )}

      {/* TIPS */}
      <h2 className="text-lg font-bold mt-6 mb-3">4 dingen die jij vandaag kunt starten</h2>
      <p className="text-sm mb-3">Gericht op jouw top-2 thema&apos;s. Geen generieke tips, dingen die we in de praktijk zien werken.</p>
      <div className="bg-[#faf5e6] border border-[#ead8a0] rounded-xl p-4">
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          {top2.flatMap((t) => TIPS_PER_THEMA[t] ?? []).map((tip, i) => (
            <li key={i}><strong>{tip.titel}.</strong> {tip.uitleg}</li>
          ))}
        </ol>
      </div>

      <p className="text-xs italic text-center text-gray-500 my-5">
        Deze check is geen medisch advies en geen diagnose. Resultaten van de Reset verschillen per persoon en hangen af van levensstijl en uitgangssituatie. Bij twijfel altijd in overleg met je arts.
      </p>

      <hr className="my-6 border-[#e0d8bc]" />

      {/* VERDIEPENDE FILM, vóór de telefoon-CTA zodat mensen 'm zien en
          beslissen of ze contact willen op basis van wat ze hier horen. */}
      <div className="my-6">
        <div className="text-center mb-4">
          <Tag>De diepte in</Tag>
          <h2 className="text-xl font-bold mt-2">Wil je het hele verhaal horen?</h2>
          <p className="text-sm text-gray-600">In deze video leggen we precies uit hoe de Reset eruit ziet, de fasen, en wat mensen ervaren. Fijn als je &apos;m kijkt voor ons gesprek 🥰</p>
        </div>
        {verdiepingFilm}
      </div>

      <hr className="my-6 border-[#e0d8bc]" />

      <Tag>Volgende stap</Tag>
      <h2 className="text-xl font-bold mt-2 mb-2">Wil je hier met ons over praten?</h2>
      <p className="mb-4">We bellen of appen je voor een korte, vrijblijvende kennismaking. Geen pitch, geen druk 🥰 We luisteren naar wat jij wil, stemmen de Reset persoonlijk op je af, en je hoort gelijk wat de investering voor jou zou worden. Daarna beslis je rustig zelf wat je doet.</p>

      <Veld
        label="Telefoonnummer (voor WhatsApp of bel)"
        type="tel"
        value={a.telefoon}
        onChange={setTelefoon}
        placeholder="06 12345678"
        hint="Vul je nummer in als je een kennismaking wilt. Hoeft niet hoor, je krijgt sowieso de mail-serie met tips."
      />

      {submitFout && (
        <div className="my-4 rounded-xl border-2 border-red-400 bg-red-50 p-4 text-sm text-red-900">
          ⚠️ {submitFout}
        </div>
      )}

      <KnopHoofd onClick={onSubmit} disabled={bezig}>
        {bezig ? "Bezig met versturen..." : "Stuur mijn aanmelding →"}
      </KnopHoofd>
      <KnopTerug onClick={onTerug}>← Terug</KnopTerug>
    </section>
  );
}

// ============================================================
// BEDANK
// ============================================================
function StapBedank({ a, ov, isFounder }: { a: Antwoorden; ov: Record<string, string>; isFounder: boolean }) {
  const heeftTel = a.telefoon.trim().length >= 8;
  return (
    <section>
      <Tag>Gelukt</Tag>
      <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-3">Dank je wel!</h1>
      <p>
        Hoi {a.voornaam}, je uitkomst is verstuurd naar je mail 🥰{" "}
        {heeftTel
          ? "We bellen of appen je binnen een paar werkdagen voor een korte, vrijblijvende kennismaking."
          : "Bedenk je je later? Stuur ons een DM op Instagram of antwoord op één van onze mails, we appen of bellen je dan alsnog 👍🏽"}
      </p>

      <InfoCard titel="Wat krijg je nu?">
        <ul className="space-y-2 pl-1">
          <li><strong>Een mail met je persoonlijke uitkomst</strong> (komt binnen een paar minuten)</li>
          <li><strong>Een korte mailserie</strong> met praktische tips rondom de Reset (op elk moment afmelden)</li>
          {heeftTel && <li><strong>Een persoonlijke kennismaking</strong> via WhatsApp of bel, binnen een paar werkdagen</li>}
        </ul>
      </InfoCard>

      <p className="text-xs italic text-center text-gray-500 my-5">Heb je vragen? Stuur ons een DM op Instagram, we reageren persoonlijk.</p>
    </section>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full mb-2 shadow-sm"
      style={{
        background: "linear-gradient(135deg, #0d0d0d 0%, #2a2110 100%)",
        color: "#c9a961",
        border: "1px solid rgba(201, 169, 97, 0.3)",
      }}
    >
      {children}
    </span>
  );
}

function InfoCard({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="bg-[#faf5e6] border border-[#ead8a0] rounded-xl p-4 my-4">
      <h3 className="font-bold text-[#6b5524] mb-2">{titel}</h3>
      {children}
    </div>
  );
}

function Privacy() {
  return (
    <div className="bg-[#f7f1e4] border-l-4 border-[#c9a961] p-3 my-4 rounded-r-lg text-sm">
      <strong>Wat doen we met je antwoorden?</strong>{" "}
      We bewaren ze kort, zodat we ons gesprek met jou goed kunnen voorbereiden en je een persoonlijk advies kunnen geven. Daarna verwijderen we ze, uiterlijk na 30 dagen of zodra we elkaar gesproken hebben. Verder delen we niks met derden 🥰
    </div>
  );
}

function KnopHoofd({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="block py-3.5 px-8 rounded-full font-bold text-base mt-5 transition-all w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
      style={{
        background: "linear-gradient(135deg, #0d0d0d 0%, #2a2110 50%, #0d0d0d 100%)",
        color: "#c9a961",
        boxShadow: disabled ? "none" : "0 6px 20px rgba(13, 13, 13, 0.25), 0 0 0 1px rgba(201, 169, 97, 0.2)",
      }}
    >
      {children}
    </button>
  );
}

function KnopTerug({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-sm text-gray-500 hover:text-black mt-2 px-3 py-2">
      {children}
    </button>
  );
}

function Veld({
  label,
  type,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  type: "text" | "email" | "tel";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="my-3">
      <label className="block font-bold text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border-2 border-[#e0d8bc] rounded-lg text-base focus:border-[#c9a961] focus:outline-none"
      />
      {hint && <small className="text-xs text-gray-500 block mt-1">{hint}</small>}
    </div>
  );
}
