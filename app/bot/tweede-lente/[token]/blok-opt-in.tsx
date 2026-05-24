// File: app/bot/tweede-lente/[token]/blok-opt-in.tsx
//
// Blok 4. Drie sub-blokken in volgorde:
//   4a. Product-richting via member's eigen bestellinks (hormoonbalans
//       essential, plus, complete). Geen advies, wel een richting.
//   4b. Optionele mailreeks-opt-in als extraatje. Niet de hoofd-deliverable,
//       het waarde-stuk zit in de spiegel + 4 ankers in blok 3.
//   4c. Optioneel persoonlijk contact-aanbod.
//   4d. Prominent disclaimer.
//
// Bestellinks-prop bevat per pakket-key de member's eigen webshop-URL.
// Als een pakket geen URL heeft: fallback "vraag {memberVoornaam} voor
// een bestellink" zonder kapotte link te tonen.
//
// TODO-GABY: definitieve openings-tekst voor mailreeks-opt-in.

"use client";

import { useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";

type PakketNiveau = {
  key: "hormoonbalans-essential" | "hormoonbalans-plus" | "hormoonbalans-complete";
  label: string;
  beschrijving: string;
  ipPunten: string;
};

const PAKKET_NIVEAUS: PakketNiveau[] = [
  {
    key: "hormoonbalans-essential",
    label: "Essential, instap-niveau",
    beschrijving:
      "Mena Plus en Evening Primrose Oil als gerichte hormoon-instap. Twee producten, één thema.",
    ipPunten: "57 IP",
  },
  {
    key: "hormoonbalans-plus",
    label: "Plus, met dagelijkse basis",
    beschrijving:
      "Daily BioBasics als fundament, plus Mena Plus, EPO en Vitamins D & K. Vier producten samen.",
    ipPunten: "113 IP",
  },
  {
    key: "hormoonbalans-complete",
    label: "Complete, volledig pakket",
    beschrijving:
      "Maintain & Protect 100 Gold Light als premium fundament, plus Mena Plus, EPO en Vitamins D & K.",
    ipPunten: "191 IP",
  },
];

export function BlokOptIn({
  token,
  antwoorden,
  spiegel,
  memberVoornaam,
  bestellinks,
  onKlaar,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  spiegel: SpiegelOutput;
  memberVoornaam: string;
  bestellinks: Record<string, string>;
  onKlaar: () => void;
}) {
  const [voornaam, setVoornaam] = useState("");
  const [email, setEmail] = useState("");
  const [toestemming, setToestemming] = useState(false);
  const [contactGewenst, setContactGewenst] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const klaarOmTeVerzenden =
    voornaam.trim().length > 1 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
    toestemming;

  async function verstuur() {
    if (!klaarOmTeVerzenden) return;
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
          leadNaam: voornaam.trim(),
          leadEmail: email.trim(),
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

  return (
    <div>
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Eén ademhaling verder
      </div>

      {/* 4a, Product-richting met member's eigen bestellinks */}
      <section className="mt-4 rounded-2xl bg-rose-50 px-5 py-5">
        <h2 className="text-xl font-semibold text-gray-900">
          Drie niveaus die {memberVoornaam} en haar team vaker zien werken
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Laagdrempelig startpunt voor vrouwen in jouw fase. Drie niveaus,
          van eenvoudig instap tot volledig pakket. Zelf in de webshop te
          bestellen, geen gesprek of programma vooraf nodig.
        </p>

        <ul className="mt-5 space-y-3">
          {PAKKET_NIVEAUS.map((p) => {
            const url = bestellinks[p.key];
            return (
              <li
                key={p.key}
                className="rounded-xl bg-white border border-rose-100 p-4"
              >
                <div className="font-semibold text-gray-900">{p.label}</div>
                <div className="mt-1 text-sm text-gray-700">{p.beschrijving}</div>
                <div className="mt-1 text-xs text-gray-500">{p.ipPunten}</div>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block rounded-full bg-rose-600 px-4 py-1.5 text-white text-xs font-medium hover:bg-rose-700"
                  >
                    Open bestelpagina van {memberVoornaam} →
                  </a>
                ) : (
                  <div className="mt-3 text-xs italic text-gray-500">
                    {memberVoornaam} heeft hier nog geen persoonlijke
                    bestellink ingesteld. Stuur haar een berichtje, dan
                    krijg je hem direct.
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs text-gray-500">
          Geen advies, wel een richting. Voor specifieke vragen of een
          persoonlijke kennismaking kun je hieronder een berichtje van
          {" "}{memberVoornaam} vragen.
        </p>
      </section>

      {/* 4b, Optionele mailreeks (extraatje, geen filter) */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Wil je dat {memberVoornaam} je vijf avonden een korte mail stuurt?
        </h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Helemaal optioneel. Vijf korte mails, één per dag, geschreven
          door vrouwen uit ons team die deze fase hebben gelopen. Niet om
          iets te beloven, wel om je opties te tonen. Daarna stilte tenzij
          jij zelf reageert.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Voornaam</span>
            <input
              type="text"
              value={voornaam}
              onChange={(e) => setVoornaam(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="Je voornaam"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">E-mailadres</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="naam@voorbeeld.nl"
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={toestemming}
              onChange={(e) => setToestemming(e.target.checked)}
              className="mt-1"
            />
            <span>
              Ik ga akkoord dat mijn naam en e-mailadres worden gebruikt
              om mij vijf mails te sturen en dat {memberVoornaam} kan zien
              dat ik haar bot heb gedaan. Ik kan op elk moment afmelden.
            </span>
          </label>
        </div>
      </section>

      {/* 4c, Persoonlijk contact-aanbod */}
      <section className="mt-6">
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={contactGewenst}
            onChange={(e) => setContactGewenst(e.target.checked)}
            className="mt-1"
          />
          <span>
            Ik wil dat {memberVoornaam} binnen een paar dagen contact opneemt
            voor een vrijblijvend gesprekje van een kwartier. Geen
            verkoopgesprek, wel iemand die meedenkt over mijn fase.
          </span>
        </label>
      </section>

      {/* Submit */}
      {fout && (
        <p className="mt-4 text-sm text-red-600">{fout}</p>
      )}
      <button
        type="button"
        onClick={verstuur}
        disabled={!klaarOmTeVerzenden || bezig}
        className="mt-6 w-full rounded-full bg-rose-600 px-6 py-3 text-white text-base font-medium disabled:opacity-40"
      >
        {bezig ? "Even versturen..." : "Schrijf mij in voor de mails"}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        Niet intekenen kan ook, je hebt de spiegel en de vier ankers al
        gehad.
      </p>

      {/* 4d, Disclaimer */}
      <footer className="mt-8 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          Dit is geen medisch advies. Voor specifieke klachten, een
          persoonlijke aanpak of vragen over je gezondheid, raadpleeg
          altijd je huisarts of gynaecoloog. Onze bot deelt herkenning en
          richtingen, geen behandeling. Lifeplus producten zijn
          voedingssupplementen, geen geneesmiddelen.
        </p>
      </footer>

      <p className="mt-3 text-xs text-gray-400 text-center">
        Klaargezet door {memberVoornaam} en haar team.
      </p>
    </div>
  );
}
