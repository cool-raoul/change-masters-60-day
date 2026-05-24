// File: app/bot/tweede-lente/[token]/blok-intekenen-vooraf.tsx
//
// Nieuwe stap tussen intro en vragen: voornaam + achternaam + e-mail
// + akkoord, vóór de vragen. Filter-effect: alleen vrouwen die serieus
// genoeg zijn om gegevens te delen, doen de vragen.
//
// Data wordt in client-state bewaard tot het eind van de flow. Eén
// API-call bij voltooiing met alle data tegelijk.

"use client";

import { useState } from "react";

export type IntekenGegevens = {
  voornaam: string;
  achternaam: string;
  email: string;
  toestemming: boolean;
};

export function BlokIntekenenVooraf({
  memberVoornaam,
  onKlaar,
  onTerug,
}: {
  memberVoornaam: string;
  onKlaar: (g: IntekenGegevens) => void;
  onTerug: () => void;
}) {
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [toestemming, setToestemming] = useState(false);

  const klaar =
    voornaam.trim().length > 1 &&
    achternaam.trim().length > 1 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
    toestemming;

  function verzend() {
    if (!klaar) return;
    onKlaar({
      voornaam: voornaam.trim(),
      achternaam: achternaam.trim(),
      email: email.trim(),
      toestemming,
    });
  }

  return (
    <div>
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider text-center">
        Voor je begint
      </div>
      <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 text-center">
        Wat is jouw naam en e-mail?
      </h2>
      <p className="mt-4 text-gray-700 leading-relaxed text-center">
        Hierna stellen we je zeven korte vragen, geven je een rustige
        spiegel die past bij jouw situatie, en concrete handvatten +
        voedingsstoffen die in jouw fase vaak belangrijk worden. Je
        ontvangt het ook in je mail zodat je het rustig kunt nalezen.
      </p>

      <div className="mt-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-gray-700">Voornaam</span>
            <input
              type="text"
              value={voornaam}
              onChange={(e) => setVoornaam(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="Voornaam"
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Achternaam</span>
            <input
              type="text"
              value={achternaam}
              onChange={(e) => setAchternaam(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="Achternaam"
            />
          </label>
        </div>
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
            Ik ga akkoord dat {memberVoornaam} mijn naam en e-mailadres
            mag gebruiken om mij de spiegel en vijf korte vervolg-mails
            te sturen. Ik kan op elk moment afmelden.
          </span>
        </label>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onTerug}
          className="text-sm text-gray-500"
        >
          ← Terug
        </button>
        <button
          type="button"
          onClick={verzend}
          disabled={!klaar}
          className="rounded-full bg-rose-600 px-6 py-3 text-white text-base font-medium disabled:opacity-40"
        >
          Akkoord, start de vragen
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Je gegevens worden alleen door {memberVoornaam} en haar team
        gebruikt. Geen advertenties, geen doorverkoop.
      </p>
    </div>
  );
}
