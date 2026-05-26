// File: app/bot/hormonen-en-overgang/[token]/flow.tsx
//
// Client-flow voor Hormonen & Overgang score-bot. Rose/pink thema.

"use client";

import { useMemo, useState } from "react";
import {
  HO_VRAGEN,
  berekenUitkomst,
  THEMA_BLOKKEN,
  INTERNET_PERSPECTIEF,
  BASIS_LEEFSTIJL_TIPS,
  type HOAntwoorden,
  type HOAntwoord,
  type HOUitkomst,
} from "@/lib/freebie-bots/hormonen-en-overgang";
import type { HerkomstContext } from "@/lib/freebie-bots/herkomst";
import { herkomstLabel } from "@/lib/freebie-bots/herkomst";

type Stap = "intro" | "intekenen" | "vragen" | "uitkomst" | "klaar";

type IntekenGegevens = {
  voornaam: string;
  achternaam: string;
  email: string;
  instagram: string;
  facebook: string;
};

export function HormonenEnOvergangFlow({
  token,
  memberId,
  memberVoornaam,
  bestellinks,
  herkomst,
}: {
  token: string;
  memberId: string;
  memberVoornaam: string;
  bestellinks: Record<string, string>;
  herkomst: HerkomstContext;
}) {
  void memberId;
  const [stap, setStap] = useState<Stap>("intro");
  const [inteken, setInteken] = useState<IntekenGegevens | null>(null);
  const [antwoorden, setAntwoorden] = useState<Partial<HOAntwoorden>>({});

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10 space-y-6">
      <Header memberVoornaam={memberVoornaam} stap={stap} />

      <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-white shadow-lg p-6 sm:p-8">
        {stap === "intro" && (
          <Intro
            memberVoornaam={memberVoornaam}
            onStart={() => setStap("intekenen")}
          />
        )}
        {stap === "intekenen" && (
          <Intekenen
            token={token}
            memberVoornaam={memberVoornaam}
            herkomst={herkomst}
            onTerug={() => setStap("intro")}
            onKlaar={(g) => {
              setInteken(g);
              setStap("vragen");
            }}
          />
        )}
        {stap === "vragen" && (
          <Vragen
            antwoorden={antwoorden}
            onUpdate={(sleutel, waarde) =>
              setAntwoorden((a) => ({ ...a, [sleutel]: waarde }))
            }
            onKlaar={() => setStap("uitkomst")}
          />
        )}
        {stap === "uitkomst" && inteken && (
          <Uitkomst
            token={token}
            antwoorden={antwoorden as HOAntwoorden}
            inteken={inteken}
            memberVoornaam={memberVoornaam}
            bestellinks={bestellinks}
            herkomst={herkomst}
            onKlaar={() => setStap("klaar")}
          />
        )}
        {stap === "klaar" && <Klaar memberVoornaam={memberVoornaam} />}
      </div>
    </div>
  );
}

// ============================================================
// Header
// ============================================================

function Header({
  memberVoornaam,
  stap,
}: {
  memberVoornaam: string;
  stap: Stap;
}) {
  const stapNummer: Record<Stap, number> = {
    intro: 1,
    intekenen: 2,
    vragen: 3,
    uitkomst: 4,
    klaar: 5,
  };
  const pct = (stapNummer[stap] / 5) * 100;

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-200 via-pink-100 to-amber-50 px-6 py-7 sm:px-8 sm:py-8 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 -right-6 text-7xl opacity-40 rotate-12"
      >
        🌸
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-3 text-3xl opacity-25"
      >
        🌷
      </div>
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-xl shadow-sm">
            🌸
          </div>
          <div>
            <div className="text-rose-700 text-xs font-semibold uppercase tracking-widest">
              Hormonen & Overgang
            </div>
            <div className="text-gray-700 text-sm">
              Klaargezet door <strong>{memberVoornaam}</strong> en het team
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="h-2 bg-white/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Intro
// ============================================================

function Intro({
  memberVoornaam,
  onStart,
}: {
  memberVoornaam: string;
  onStart: () => void;
}) {
  return (
    <div className="text-center">
      <div className="relative mx-auto mb-2 h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-200 via-pink-200 to-amber-100 blur-xl opacity-70" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-50 text-5xl shadow-md ring-4 ring-white/60">
          🌸
        </div>
      </div>

      <div className="mt-4 text-rose-600 text-sm font-semibold uppercase tracking-widest">
        Hormonen & Overgang
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Persoonlijke score met uitgebreid leefstijl-advies
      </p>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
        Hey, leuk dat je deze stap nam
      </h1>
      <p className="mt-5 text-lg text-gray-700 leading-relaxed">
        {memberVoornaam} heeft deze ruimte voor je klaargezet. Tien vragen,
        ongeveer vijf minuten van je tijd.
      </p>

      <div className="mt-6 rounded-2xl bg-sky-50/70 border border-sky-100 p-5 text-left">
        <div className="text-sky-700 text-xs font-semibold uppercase tracking-widest mb-2">
          {INTERNET_PERSPECTIEF.titel}
        </div>
        {INTERNET_PERSPECTIEF.paragrafen.map((p, i) => (
          <p
            key={i}
            className="text-sm text-gray-700 leading-relaxed mt-2 first:mt-0"
          >
            {p}
          </p>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-rose-700 font-medium shadow-sm border border-rose-100">
          ⏱ 5 minuten
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-rose-700 font-medium shadow-sm border border-rose-100">
          📊 Persoonlijke score
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-rose-700 font-medium shadow-sm border border-rose-100">
          📚 Diep leefstijl-advies
        </span>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-8 group rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-10 py-4 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-rose-700 hover:to-pink-700 transition-all"
      >
        Ja, ik start
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>

      <p className="mt-6 text-xs text-gray-500">
        Geen medisch advies. Wel echte uitleg over hoe je lichaam werkt in
        deze fase.
      </p>
    </div>
  );
}

// ============================================================
// Intekenen
// ============================================================

function Intekenen({
  token,
  memberVoornaam,
  herkomst,
  onKlaar,
  onTerug,
}: {
  token: string;
  memberVoornaam: string;
  herkomst: HerkomstContext;
  onKlaar: (g: IntekenGegevens) => void;
  onTerug: () => void;
}) {
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState(herkomst.instagram ?? "");
  const [facebook, setFacebook] = useState(herkomst.facebook ?? "");
  const [toestemming, setToestemming] = useState(false);
  const [bezig, setBezig] = useState(false);

  const klaar =
    voornaam.trim().length > 1 &&
    achternaam.trim().length > 1 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
    toestemming;

  const igSchoon = instagram.trim().replace(/^@/, "").trim() || null;
  const fbSchoon = facebook.trim() || null;

  async function verzend() {
    if (!klaar) return;
    setBezig(true);
    try {
      await fetch("/api/freebie-bot/intekening-vooraf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          leadVoornaam: voornaam.trim(),
          leadAchternaam: achternaam.trim(),
          leadEmail: email.trim(),
          toestemming,
          herkomstInstagram: igSchoon,
          herkomstFacebook: fbSchoon,
          herkomstBron: herkomst.bron,
        }),
      });
      onKlaar({
        voornaam: voornaam.trim(),
        achternaam: achternaam.trim(),
        email: email.trim(),
        instagram: igSchoon ?? "",
        facebook: fbSchoon ?? "",
      });
    } catch (e) {
      console.warn("Intekening-vooraf fout:", e);
      onKlaar({
        voornaam: voornaam.trim(),
        achternaam: achternaam.trim(),
        email: email.trim(),
        instagram: igSchoon ?? "",
        facebook: fbSchoon ?? "",
      });
    } finally {
      setBezig(false);
    }
  }

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">
          ✉️
        </div>
        <div className="mt-3 text-rose-600 text-xs font-semibold uppercase tracking-widest">
          Voor je begint
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Wat is jouw naam en e-mail?
        </h2>
        <p className="mt-4 text-gray-700 leading-relaxed">
          Zo kan {memberVoornaam} je na de vragenlijst ook in je mail nog
          rustig de score plus het leefstijl-advies sturen.
        </p>
        {herkomstLabel(herkomst) && (
          <p className="mt-3 inline-block rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs text-sky-700">
            🔗 {herkomstLabel(herkomst)}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Voornaam</span>
            <input
              type="text"
              value={voornaam}
              onChange={(e) => setVoornaam(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
              placeholder="Voornaam"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Achternaam</span>
            <input
              type="text"
              value={achternaam}
              onChange={(e) => setAchternaam(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
              placeholder="Achternaam"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">E-mailadres</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
            placeholder="naam@voorbeeld.nl"
          />
        </label>

        {/* Optionele social-velden */}
        <div className="rounded-xl bg-rose-50/40 border border-rose-100 p-3 space-y-3">
          <p className="text-xs text-gray-600 italic">
            Optioneel: laat hier je Instagram of Facebook achter zodat
            {" "}{memberVoornaam} je ook via DM kan bereiken.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                📸 Instagram-naam
              </span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
                placeholder="jouw_handle"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                👤 Facebook-naam
              </span>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
                placeholder="je naam op Facebook"
              />
            </label>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-700 rounded-xl bg-rose-50/60 p-3 border border-rose-100">
          <input
            type="checkbox"
            checked={toestemming}
            onChange={(e) => setToestemming(e.target.checked)}
            className="mt-1 h-4 w-4 accent-rose-600"
          />
          <span>
            Ik ga akkoord dat {memberVoornaam} mijn naam en e-mailadres
            mag gebruiken om mij de score en het leefstijl-advies te
            sturen. Ik kan op elk moment afmelden.
          </span>
        </label>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onTerug}
          disabled={bezig}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
        >
          ← Terug
        </button>
        <button
          type="button"
          onClick={verzend}
          disabled={!klaar || bezig}
          className="rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-white text-base font-semibold shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none transition"
        >
          {bezig ? "Even bewaren..." : "Akkoord, start de vragen →"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Vragen
// ============================================================

const THEMA_ICOON: Record<string, string> = {
  "hormoon-signalen": "🌸",
  "slaap-herstel": "🌙",
  "stemming-cognitie": "🧠",
  "lichaam-leefstijl": "🌿",
};

function Vragen({
  antwoorden,
  onUpdate,
  onKlaar,
}: {
  antwoorden: Partial<HOAntwoorden>;
  onUpdate: (sleutel: keyof HOAntwoorden, waarde: HOAntwoord) => void;
  onKlaar: () => void;
}) {
  const [index, setIndex] = useState(0);
  const huidige = HO_VRAGEN[index];
  const huidigeKlaar = antwoorden[huidige.sleutel] !== undefined;

  function volgende() {
    if (!huidigeKlaar) return;
    if (index === HO_VRAGEN.length - 1) {
      onKlaar();
      return;
    }
    setIndex((i) => i + 1);
  }

  function vorige() {
    if (index === 0) return;
    setIndex((i) => i - 1);
  }

  const pct = ((index + 1) / HO_VRAGEN.length) * 100;

  return (
    <div>
      <div>
        <div className="flex justify-between text-xs text-rose-700 font-medium mb-1.5">
          <span>
            Vraag {index + 1} van {HO_VRAGEN.length}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2 bg-rose-50 rounded-full overflow-hidden border border-rose-100">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-7">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl shadow-sm">
            {THEMA_ICOON[huidige.thema]}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
          {huidige.titel}
        </h2>
        {huidige.ondertitel && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            {huidige.ondertitel}
          </p>
        )}

        <div className="mt-5 space-y-2.5">
          {huidige.antwoorden.map((opt) => {
            const actief = antwoorden[huidige.sleutel] === opt.waarde;
            return (
              <button
                key={opt.waarde}
                type="button"
                onClick={() => onUpdate(huidige.sleutel, opt.waarde)}
                className={`group w-full text-left rounded-2xl px-4 py-3.5 border-2 transition-all flex items-center gap-3 ${
                  actief
                    ? "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-400 text-rose-900 shadow-md scale-[1.01]"
                    : "bg-white/80 border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50/40"
                }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                    actief
                      ? "border-rose-500 bg-rose-500"
                      : "border-gray-300 group-hover:border-rose-300"
                  }`}
                >
                  {actief && (
                    <span className="block h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="flex-1 text-sm leading-snug">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={vorige}
          disabled={index === 0}
          className="text-sm text-gray-500 disabled:opacity-30 hover:text-gray-700"
        >
          ← Vorige
        </button>
        <button
          type="button"
          onClick={volgende}
          disabled={!huidigeKlaar}
          className="rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none transition"
        >
          {index === HO_VRAGEN.length - 1 ? "Toon mijn score ✨" : "Volgende →"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Uitkomst
// ============================================================

function Uitkomst({
  token,
  antwoorden,
  inteken,
  memberVoornaam,
  bestellinks,
  herkomst,
  onKlaar,
}: {
  token: string;
  antwoorden: HOAntwoorden;
  inteken: IntekenGegevens;
  memberVoornaam: string;
  bestellinks: Record<string, string>;
  herkomst: HerkomstContext;
  onKlaar: () => void;
}) {
  const uitkomst: HOUitkomst = useMemo(
    () => berekenUitkomst(antwoorden),
    [antwoorden],
  );

  const [contactGewenst, setContactGewenst] = useState(false);
  const [telefoon, setTelefoon] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const telefoonOk =
    !contactGewenst || telefoon.trim().replace(/\D/g, "").length >= 8;

  const cardKleur =
    uitkomst.categorie === "rustig"
      ? "from-emerald-50 to-green-50 border-emerald-200"
      : uitkomst.categorie === "let-op"
        ? "from-amber-50 to-orange-50 border-amber-300"
        : "from-rose-50 to-red-50 border-rose-300";

  const meterKleur =
    uitkomst.categorie === "rustig"
      ? "from-emerald-500 to-green-500"
      : uitkomst.categorie === "let-op"
        ? "from-amber-500 to-orange-500"
        : "from-rose-500 to-red-500";

  const topThemaBlokken = uitkomst.topThemas.map((t) => THEMA_BLOKKEN[t]);
  const overigeThemaBlokken = (
    Object.keys(THEMA_BLOKKEN) as Array<keyof typeof THEMA_BLOKKEN>
  )
    .filter((t) => !uitkomst.topThemas.includes(t))
    .map((t) => THEMA_BLOKKEN[t]);

  async function verstuur() {
    if (!telefoonOk) {
      setFout(
        `Vul een telefoonnummer in zodat ${memberVoornaam} contact kan opnemen.`,
      );
      return;
    }
    setBezig(true);
    setFout(null);
    try {
      const spiegelTekst = [
        `Totaal-score: ${uitkomst.totaal}/${uitkomst.max} (${uitkomst.pct}%, ${uitkomst.categorieLabel})`,
        ...uitkomst.subScores.map((s) => `${s.label}: ${s.punten}/${s.max}`),
        "",
        `Top-thema's: ${uitkomst.topThemas.join(", ") || "geen"}`,
      ].join("\n");

      const r = await fetch("/api/freebie-bot/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          leadVoornaam: inteken.voornaam,
          leadAchternaam: inteken.achternaam,
          leadEmail: inteken.email,
          leadTelefoon: contactGewenst ? telefoon.trim() : null,
          antwoorden,
          spiegelTekst,
          contactGewenst,
          herkomstInstagram:
            inteken.instagram || herkomst.instagram || null,
          herkomstFacebook:
            inteken.facebook || herkomst.facebook || null,
          herkomstBron: herkomst.bron,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setFout(data.error ?? "Versturen mislukt");
        setBezig(false);
        return;
      }
      onKlaar();
    } catch (e) {
      setFout(String(e));
      setBezig(false);
    }
  }

  return (
    <div>
      <div className="text-center">
        <div className="text-rose-600 text-xs font-semibold uppercase tracking-widest">
          Jouw uitkomst
        </div>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          {inteken.voornaam}, jouw score
        </h2>
      </div>

      <div
        className={`mt-5 rounded-2xl bg-gradient-to-br ${cardKleur} border-2 p-6 shadow-sm text-center`}
      >
        <div className="text-5xl font-bold text-gray-900">
          {uitkomst.totaal}
          <span className="text-2xl text-gray-500"> / {uitkomst.max}</span>
        </div>
        <div className="mt-3 h-3 bg-white/70 rounded-full overflow-hidden max-w-sm mx-auto">
          <div
            className={`h-full bg-gradient-to-r ${meterKleur} transition-all`}
            style={{ width: `${uitkomst.pct}%` }}
          />
        </div>
        <div className="mt-4 text-lg font-bold text-gray-900">
          Categorie: {uitkomst.categorieLabel}
        </div>
        <p className="mt-3 text-sm text-gray-700 leading-relaxed max-w-md mx-auto">
          {uitkomst.categorieToon}
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
          Score per thema
        </div>
        <div className="space-y-2">
          {uitkomst.subScores.map((s) => {
            const subPct = (s.punten / s.max) * 100;
            return (
              <div key={s.thema}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-800">
                    {s.emoji} {s.label}
                  </span>
                  <span className="text-gray-600">
                    {s.punten} / {s.max}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      subPct < 35
                        ? "bg-emerald-500"
                        : subPct < 70
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${subPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {topThemaBlokken.length > 0 && (
        <div className="mt-8">
          <div className="text-center mb-5">
            <div className="text-rose-600 text-xs font-semibold uppercase tracking-widest">
              Waar voor jou de meeste rust zit
            </div>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              Diep ingaan op je belangrijkste thema{topThemaBlokken.length > 1 ? "'s" : ""}
            </h3>
          </div>
          {topThemaBlokken.map((blok) => (
            <ThemaBlokWeergave key={blok.thema} blok={blok} uitgebreid />
          ))}
        </div>
      )}

      {overigeThemaBlokken.length > 0 && (
        <div className="mt-8">
          <div className="text-center mb-5">
            <div className="text-rose-600 text-xs font-semibold uppercase tracking-widest">
              Ook interessant
            </div>
            <h3 className="mt-1 text-xl font-bold text-gray-900">
              De andere thema's, kort uitgelegd
            </h3>
          </div>
          <div className="space-y-3">
            {overigeThemaBlokken.map((blok) => (
              <details
                key={blok.thema}
                className="rounded-2xl border border-gray-200 bg-white/80 px-5 py-4"
              >
                <summary className="cursor-pointer flex items-center gap-2 font-semibold text-gray-900">
                  <span>{blok.emoji}</span>
                  <span>{blok.titel}</span>
                </summary>
                <div className="mt-3">
                  <ThemaBlokWeergave blok={blok} uitgebreid={false} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="text-center mb-5">
          <div className="text-rose-600 text-xs font-semibold uppercase tracking-widest">
            Basis-tips
          </div>
          <h3 className="mt-1 text-xl font-bold text-gray-900">
            Wat sowieso werkt in deze fase
          </h3>
        </div>
        <ul className="space-y-2">
          {BASIS_LEEFSTIJL_TIPS.map((tip, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 flex items-start gap-3"
            >
              <span className="text-2xl">{tip.icoon}</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">
                  {tip.titel}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{tip.uitleg}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <div className="text-center mb-5">
          <div className="text-rose-600 text-xs font-semibold uppercase tracking-widest">
            Extra ondersteuning
          </div>
          <h3 className="mt-1 text-xl font-bold text-gray-900">
            Wil je naast leefstijl ook gerichte voedings-aanvulling?
          </h3>
          <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
            Drie hormoonbalans-pakketten van Lifeplus. Laagdrempelig, zelf
            in de webshop te bestellen via de persoonlijke link van{" "}
            {memberVoornaam}.
          </p>
        </div>
        <PakketKaarten
          bestellinks={bestellinks}
          memberVoornaam={memberVoornaam}
        />
      </div>

      <section className="mt-8 rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-white to-rose-50/50 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-lg">
            💬
          </div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Wil je een gesprekje?
          </h3>
        </div>
        <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={contactGewenst}
            onChange={(e) => setContactGewenst(e.target.checked)}
            className="mt-1 h-4 w-4 accent-rose-600"
          />
          <span>
            <strong className="text-gray-900">
              Ja, {memberVoornaam} mag contact opnemen.
            </strong>
            {" "}Vrijblijvend gesprekje van een kwartier, geen
            verkoopgesprek. Iemand die meedenkt over jouw score.
          </span>
        </label>

        {contactGewenst && (
          <label className="mt-4 block">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              📞 Op welk nummer kan {memberVoornaam} je bereiken?
            </span>
            <input
              type="tel"
              value={telefoon}
              onChange={(e) => setTelefoon(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
              placeholder="06 12 34 56 78"
            />
          </label>
        )}
      </section>

      {fout && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {fout}
        </div>
      )}
      <button
        type="button"
        onClick={verstuur}
        disabled={bezig || !telefoonOk}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-4 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-rose-700 hover:to-pink-700 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
      >
        {bezig ? "Even versturen..." : "✨ Verstuur mijn uitkomst →"}
      </button>

      <footer className="mt-8 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-3">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          <strong>Disclaimer:</strong> Geen medisch advies. Voor specifieke
          klachten, een persoonlijke aanpak of vragen over je gezondheid,
          raadpleeg altijd je huisarts of gynaecoloog. We delen herkenning
          en richtingen, geen behandeling. Lifeplus producten zijn
          voedingssupplementen, geen geneesmiddelen.
        </p>
      </footer>
    </div>
  );
}

function ThemaBlokWeergave({
  blok,
  uitgebreid,
}: {
  blok: (typeof THEMA_BLOKKEN)[keyof typeof THEMA_BLOKKEN];
  uitgebreid: boolean;
}) {
  return (
    <div
      className={
        uitgebreid
          ? "mt-5 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm"
          : ""
      }
    >
      {uitgebreid && (
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-2xl">
            {blok.emoji}
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{blok.titel}</h4>
            <p className="mt-1 text-sm text-gray-600 italic">{blok.intro}</p>
          </div>
        </div>
      )}

      <div className={uitgebreid ? "" : "mt-2"}>
        {blok.paragrafen.map((p, i) => (
          <p
            key={i}
            className="text-sm text-gray-700 leading-relaxed mt-2 first:mt-0"
          >
            {p}
          </p>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
          Concrete handvatten
        </div>
        <ul className="space-y-2">
          {blok.handvatten.map((h, i) => (
            <li
              key={i}
              className="rounded-xl bg-rose-50/50 border border-rose-100 p-3"
            >
              <div className="font-semibold text-gray-900 text-sm">
                {h.titel}
              </div>
              <p className="mt-1 text-xs text-gray-700">{h.actie}</p>
              <p className="mt-1 text-xs text-gray-500 italic">
                <strong>Waarom:</strong> {h.waarom}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
          Voedingsstoffen die hier vaak belangrijk worden
        </div>
        <ul className="space-y-2">
          {blok.nutrienten.map((n, i) => (
            <li
              key={i}
              className="rounded-xl bg-emerald-50/40 border border-emerald-100 p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <strong className="text-sm text-gray-900">{n.naam}</strong>
                <span className="text-[11px] text-gray-500 italic">
                  {n.bron}
                </span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {n.efsaClaims.map((c, j) => (
                  <li
                    key={j}
                    className="text-xs text-gray-700 flex items-start gap-1.5"
                  >
                    <span className="text-emerald-600">✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PakketKaarten({
  bestellinks,
  memberVoornaam,
}: {
  bestellinks: Record<string, string>;
  memberVoornaam: string;
}) {
  const pakketten = [
    {
      key: "hormoonbalans-essential",
      label: "Essential",
      sub: "Instap",
      desc: "Mena Plus en Evening Primrose Oil als gerichte hormoon-instap.",
      badge: "🥉",
      gradient: "from-amber-50 to-orange-50",
      border: "border-amber-300",
    },
    {
      key: "hormoonbalans-plus",
      label: "Plus",
      sub: "Met dagelijkse basis",
      desc: "Daily BioBasics als fundament, plus Mena Plus, EPO en Vitamins D & K.",
      badge: "🥈",
      gradient: "from-slate-50 to-gray-100",
      border: "border-slate-300",
    },
    {
      key: "hormoonbalans-complete",
      label: "Complete",
      sub: "Volledig pakket",
      desc: "M&P 100 Gold Light premium fundament, plus Mena Plus, EPO en Vitamins D & K.",
      badge: "🥇",
      gradient: "from-yellow-50 to-amber-100",
      border: "border-yellow-400",
    },
  ];

  const geenLinks = Object.keys(bestellinks).length === 0;

  return (
    <div>
      {geenLinks && (
        <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          <strong>Let op:</strong> {memberVoornaam} heeft nog geen
          persoonlijke bestellinks ingesteld. Stuur even een berichtje,
          dan krijg je ze direct.
        </div>
      )}
      <ul className="space-y-3">
        {pakketten.map((p) => {
          const url = bestellinks[p.key];
          const isComplete = p.key === "hormoonbalans-complete";
          return (
            <li
              key={p.key}
              className={`relative rounded-2xl bg-gradient-to-br ${p.gradient} border-2 ${p.border} p-4 shadow-sm ${
                isComplete ? "ring-2 ring-yellow-200 ring-offset-2" : ""
              }`}
            >
              {isComplete && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  ⭐ Meest compleet
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-2xl shadow-sm">
                  {p.badge}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <strong className="text-lg font-bold text-gray-900">
                      {p.label}
                    </strong>
                    <span className="text-xs text-gray-600">{p.sub}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 leading-snug">
                    {p.desc}
                  </p>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2 text-white text-xs font-semibold shadow-md hover:shadow-lg transition"
                    >
                      Open bestelpagina van {memberVoornaam} →
                    </a>
                  ) : (
                    <div className="mt-3 inline-block rounded-full bg-white/80 border border-gray-300 px-3 py-1.5 text-xs italic text-gray-600">
                      Vraag {memberVoornaam} voor de bestellink
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Klaar({ memberVoornaam }: { memberVoornaam: string }) {
  return (
    <div className="text-center py-4">
      <div className="relative mx-auto mb-5 h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200 to-rose-200 blur-xl opacity-70 animate-pulse" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-rose-100 text-5xl shadow-md ring-4 ring-white/60">
          🌸
        </div>
      </div>

      <div className="text-rose-600 text-xs font-semibold uppercase tracking-widest">
        Helemaal klaar
      </div>
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
        Je uitkomst is binnen ✨
      </h2>
      <p className="mt-5 text-gray-700 leading-relaxed max-w-md mx-auto">
        {memberVoornaam} stuurt je vanavond een mail met je score en het
        leefstijl-advies. Kijk er rustig naar wanneer het je uitkomt.
      </p>
      <p className="mt-8 text-xs text-gray-400">
        🌸 Met dank dat je deze stap hebt gezet.
      </p>
    </div>
  );
}
