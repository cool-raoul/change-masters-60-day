// File: app/bot/tweede-lente/[token]/blok-opt-in.tsx
//
// Blok 4. Drie sub-blokken:
//   4a. Product-richting via member's eigen bestellinks (hormoonbalans
//       essential, plus, complete). Geen advies, wel een richting.
//   4b. Optioneel persoonlijk contact-aanbod (vinkje) + telefoon-veld
//       dat verplicht wordt als de checkbox aanstaat.
//   4c. Prominent disclaimer.
//
// Naam + e-mail + akkoord zijn al opgegeven in stap 'intekenen-vooraf'
// (zit in `inteken` prop).

"use client";

import { useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";
import type { IntekenGegevens } from "./blok-intekenen-vooraf";

type PakketNiveau = {
  key: "hormoonbalans-essential" | "hormoonbalans-plus" | "hormoonbalans-complete";
  label: string;
  korteLabel: string;
  beschrijving: string;
  ipPunten: string;
  prijs: string;
  badge: string; // brons / zilver / goud emoji
  gradient: string; // tailwind background gradient classes
  borderKleur: string;
};

const PAKKET_NIVEAUS: PakketNiveau[] = [
  {
    key: "hormoonbalans-essential",
    label: "Essential",
    korteLabel: "Instap",
    beschrijving:
      "Mena Plus en Evening Primrose Oil als gerichte hormoon-instap. Twee producten, één thema.",
    ipPunten: "57 IP",
    prijs: "€96,75",
    badge: "🥉",
    gradient: "from-amber-50 to-orange-50",
    borderKleur: "border-amber-300",
  },
  {
    key: "hormoonbalans-plus",
    label: "Plus",
    korteLabel: "Met dagelijkse basis",
    beschrijving:
      "Daily BioBasics als fundament, plus Mena Plus, EPO en Vitamins D & K. Vier producten samen.",
    ipPunten: "113 IP",
    prijs: "€181,75",
    badge: "🥈",
    gradient: "from-slate-50 to-gray-100",
    borderKleur: "border-slate-300",
  },
  {
    key: "hormoonbalans-complete",
    label: "Complete",
    korteLabel: "Volledig pakket",
    beschrijving:
      "Maintain & Protect 100 Gold Light als premium fundament, plus Mena Plus, EPO en Vitamins D & K.",
    ipPunten: "191 IP",
    prijs: "€289,00",
    badge: "🥇",
    gradient: "from-yellow-50 to-amber-100",
    borderKleur: "border-yellow-400",
  },
];

export function BlokOptIn({
  token,
  antwoorden,
  spiegel,
  inteken,
  memberVoornaam,
  bestellinks,
  onKlaar,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  spiegel: SpiegelOutput;
  inteken: IntekenGegevens;
  memberVoornaam: string;
  bestellinks: Record<string, string>;
  onKlaar: () => void;
}) {
  const [contactGewenst, setContactGewenst] = useState(false);
  const [telefoon, setTelefoon] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // Als contact-vinkje aan staat: telefoon verplicht (min 8 cijfers).
  const telefoonOk = !contactGewenst || telefoon.trim().replace(/\D/g, "").length >= 8;

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
        spiegel.opening,
        spiegel.patroon,
        spiegel.driAanpassingen.map((a, i) => `${i + 1}. ${a}`).join("\n"),
        spiegel.afsluiting,
      ].join("\n\n");

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

  const geenEnkeleLink = Object.keys(bestellinks).length === 0;

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl shadow-sm">
          🎁
        </div>
        <div className="text-rose-500 text-xs font-semibold uppercase tracking-widest">
          Pakket-richting
        </div>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Drie laagdrempelige startpunten
        </h2>
      </div>

      {/* 4a, Product-richting met member's eigen bestellinks */}
      <section className="mt-6">
        <p className="text-sm text-gray-700 leading-relaxed text-center">
          De handvatten en voedingsstoffen uit jouw spiegel zitten als
          basis ook in deze drie pakketten van {memberVoornaam}. Kies wat
          bij jou past, zelf te bestellen.
        </p>

        {geenEnkeleLink && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <strong>Let op:</strong> {memberVoornaam} heeft nog geen
                persoonlijke bestellinks voor deze drie pakketten
                ingesteld. Stuur haar gerust een berichtje, dan stuurt zij
                je persoonlijke links direct.
              </div>
            </div>
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {PAKKET_NIVEAUS.map((p) => {
            const url = bestellinks[p.key];
            const isComplete = p.key === "hormoonbalans-complete";
            return (
              <li
                key={p.key}
                className={`relative rounded-2xl bg-gradient-to-br ${p.gradient} border-2 ${p.borderKleur} p-5 shadow-sm transition-all hover:shadow-md ${
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
                      <span className="text-xs text-gray-600">
                        {p.korteLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 leading-snug">
                      {p.beschrijving}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                      <span className="font-bold text-gray-900">{p.prijs}</span>
                      <span>·</span>
                      <span>{p.ipPunten}</span>
                    </div>
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
      </section>

      {/* 4b, Persoonlijk contact-aanbod */}
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
              Ja, ik wil dat {memberVoornaam} contact opneemt.
            </strong>
            {" "}Vrijblijvend gesprekje van een kwartier, geen
            verkoopgesprek. Iemand die meedenkt over mijn fase.
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
            <span className="mt-1 block text-xs text-gray-500">
              🔒 Alleen {memberVoornaam} ziet dit nummer, niet openbaar.
            </span>
          </label>
        )}
      </section>

      {/* Submit */}
      {fout && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {fout}
        </div>
      )}
      <button
        type="button"
        onClick={verstuur}
        disabled={bezig || !telefoonOk}
        className="mt-6 group w-full rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-4 text-white text-base font-semibold shadow-lg hover:shadow-xl hover:from-rose-700 hover:to-pink-700 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none"
      >
        {bezig ? (
          "Even versturen..."
        ) : (
          <>
            ✨ Verstuur mijn spiegel
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        Je krijgt vanavond een mail met je spiegel en de handvatten.
        Daarna vijf korte vervolg-mails over vijf dagen.
      </p>

      {/* 4c, Disclaimer */}
      <footer className="mt-8 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-3">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          <strong>Disclaimer:</strong> Dit is geen medisch advies. Voor
          specifieke klachten, een persoonlijke aanpak of vragen over je
          gezondheid, raadpleeg altijd je huisarts of gynaecoloog. Onze
          bot deelt herkenning en richtingen, geen behandeling. Lifeplus
          producten zijn voedingssupplementen, geen geneesmiddelen.
        </p>
      </footer>

      <p className="mt-3 text-xs text-gray-400 text-center">
        🌷 Klaargezet door {memberVoornaam} en haar team.
      </p>
    </div>
  );
}
