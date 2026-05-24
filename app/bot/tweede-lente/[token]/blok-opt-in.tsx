// File: app/bot/tweede-lente/[token]/blok-opt-in.tsx
//
// Blok 4, opt-in voor 5-mail-reeks + product-richting + persoonlijk
// contact + disclaimer. Volledig statisch wat tekst betreft.
// Knop "Verstuur" roept /api/freebie-bot/opt-in aan.
//
// TODO-GABY: definitieve tekst voor mailreeks-opt-in en product-blok
// aanleveren. Onder staan claim-vrije concept-zinnen.

"use client";

import { useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";

// Webshop-product-links. Voor pilot statisch. Later via member's
// bestellinks-koppeling per pakket.
// TODO-GABY: definitieve webshop-URL's vragen aan Raoul.
const PRODUCT_LINKS = {
  menaplus: "https://lifeplus.com/menaplus",
  womensgold: "https://lifeplus.com/womens-gold",
  vitaminsdk: "https://lifeplus.com/vitamins-dk",
};

export function BlokOptIn({
  token,
  antwoorden,
  spiegel,
  memberVoornaam,
  onKlaar,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  spiegel: SpiegelOutput;
  memberVoornaam: string;
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

      {/* 4a, Mailreeks-opt-in */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Wil je vijf avonden een korte mail?
        </h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          Geschreven door vrouwen uit ons team die deze fase hebben gelopen.
          Niet om iets te beloven, wel om je opties te tonen. Vijf avonden,
          één mail per dag, daarna stilte tenzij jij zelf reageert.
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
              Ik ga akkoord dat mijn naam en e-mailadres worden gebruikt om
              mij vijf mails te sturen en ben akkoord met opname in een
              persoonlijke klantomgeving van ons team. Ik kan op elk moment
              afmelden.
            </span>
          </label>
        </div>
      </section>

      {/* 4b, Product-richting */}
      <section className="mt-8 rounded-2xl bg-rose-50 px-5 py-5">
        <h3 className="text-base font-semibold text-gray-900">
          Veel vrouwen in jouw fase kiezen voor één van deze drie
        </h3>
        <p className="mt-2 text-sm text-gray-700">
          Laagdrempelig startpunt, zelf in onze webshop te bestellen, zonder
          gesprek of programma vooraf.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              href={PRODUCT_LINKS.menaplus}
              target="_blank"
              rel="noreferrer"
              className="text-rose-700 underline"
            >
              MenaPlus
            </a>
            <span className="text-gray-600">,vaak gekozen door vrouwen in volle of post-overgang</span>
          </li>
          <li>
            <a
              href={PRODUCT_LINKS.womensgold}
              target="_blank"
              rel="noreferrer"
              className="text-rose-700 underline"
            >
              Women&apos;s Gold
            </a>
            <span className="text-gray-600">,vrouwen-specifiek dagelijks basis-supplement</span>
          </li>
          <li>
            <a
              href={PRODUCT_LINKS.vitaminsdk}
              target="_blank"
              rel="noreferrer"
              className="text-rose-700 underline"
            >
              Vitamins D &amp; K
            </a>
            <span className="text-gray-600">,breed gekozen ondersteuning</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          Geen advies, wel een richting. Voor specifieke vragen of een
          persoonlijke kennismaking kun je hieronder iemand uit ons team
          erbij vragen.
        </p>
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
            Ik wil dat een vrouw uit het team binnen een paar dagen contact
            opneemt voor een vrijblijvend gesprekje van een kwartier. Geen
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
        {bezig ? "Even versturen..." : "Schrijf mij in"}
      </button>

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
