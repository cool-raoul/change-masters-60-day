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
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">
          ✉️
        </div>
        <div className="mt-3 text-rose-500 text-xs font-semibold uppercase tracking-widest">
          Voor je begint
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Wat is jouw naam en e-mail?
        </h2>
        <p className="mt-4 text-gray-700 leading-relaxed">
          Zo kan {memberVoornaam} je na de bot ook in je mail nog rustig
          de spiegel + vervolg sturen.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-rose-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
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
        <label className="flex items-start gap-3 text-sm text-gray-700 rounded-xl bg-rose-50/60 p-3 border border-rose-100">
          <input
            type="checkbox"
            checked={toestemming}
            onChange={(e) => setToestemming(e.target.checked)}
            className="mt-1 h-4 w-4 accent-rose-600"
          />
          <span>
            Ik ga akkoord dat {memberVoornaam} mijn naam en e-mailadres
            mag gebruiken om mij de spiegel en vijf korte vervolg-mails
            te sturen. Ik kan op elk moment afmelden.
          </span>
        </label>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onTerug}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Terug
        </button>
        <button
          type="button"
          onClick={verzend}
          disabled={!klaar}
          className="rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-3 text-white text-base font-semibold shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none transition"
        >
          Akkoord, start de vragen →
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-500 text-center">
        🔒 Je gegevens worden alleen door {memberVoornaam} en haar team
        gebruikt. Geen advertenties, geen doorverkoop.
      </p>
    </div>
  );
}
