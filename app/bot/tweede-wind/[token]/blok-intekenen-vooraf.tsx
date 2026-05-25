// File: app/bot/tweede-wind/[token]/blok-intekenen-vooraf.tsx
//
// Naam + e-mail + akkoord, vóór de vragen. Identiek aan Tweede Lente
// op kleur na (sky/blauw ipv rose).

"use client";

import { useState } from "react";

export type IntekenGegevens = {
  voornaam: string;
  achternaam: string;
  email: string;
  toestemming: boolean;
};

export function BlokIntekenenVooraf({
  token,
  memberVoornaam,
  onKlaar,
  onTerug,
}: {
  token: string;
  memberVoornaam: string;
  onKlaar: (g: IntekenGegevens) => void;
  onTerug: () => void;
}) {
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [toestemming, setToestemming] = useState(false);
  const [bezig, setBezig] = useState(false);

  const klaar =
    voornaam.trim().length > 1 &&
    achternaam.trim().length > 1 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
    toestemming;

  async function verzend() {
    if (!klaar) return;
    setBezig(true);
    try {
      const r = await fetch("/api/freebie-bot/intekening-vooraf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          leadVoornaam: voornaam.trim(),
          leadAchternaam: achternaam.trim(),
          leadEmail: email.trim(),
          toestemming,
        }),
      });
      const data = await r.json();
      if (!r.ok) console.warn("Intekening-vooraf fout:", data.error);
      onKlaar({
        voornaam: voornaam.trim(),
        achternaam: achternaam.trim(),
        email: email.trim(),
        toestemming,
      });
    } catch (e) {
      console.warn("Intekening-vooraf netwerkfout:", e);
      onKlaar({
        voornaam: voornaam.trim(),
        achternaam: achternaam.trim(),
        email: email.trim(),
        toestemming,
      });
    } finally {
      setBezig(false);
    }
  }

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-2xl">
          ✉️
        </div>
        <div className="mt-3 text-sky-600 text-xs font-semibold uppercase tracking-widest">
          Voor je begint
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
          Wat is jouw naam en e-mail?
        </h2>
        <p className="mt-4 text-gray-700 leading-relaxed">
          Zo kan {memberVoornaam} je na de vragenlijst ook in je mail nog
          rustig het overzicht plus het vervolg sturen.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-sky-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Voornaam</span>
            <input
              type="text"
              value={voornaam}
              onChange={(e) => setVoornaam(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
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
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
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
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
            placeholder="naam@voorbeeld.nl"
          />
        </label>
        <label className="flex items-start gap-3 text-sm text-gray-700 rounded-xl bg-sky-50/60 p-3 border border-sky-100">
          <input
            type="checkbox"
            checked={toestemming}
            onChange={(e) => setToestemming(e.target.checked)}
            className="mt-1 h-4 w-4 accent-sky-600"
          />
          <span>
            Ik ga akkoord dat {memberVoornaam} mijn naam en e-mailadres
            mag gebruiken om mij het persoonlijk overzicht en vijf korte
            vervolg-mails te sturen. Ik kan op elk moment afmelden.
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
          className="rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3 text-white text-base font-semibold shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none transition"
        >
          {bezig ? "Even bewaren..." : "Akkoord, start de vragen →"}
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-500 text-center">
        🔒 Je gegevens worden alleen door {memberVoornaam} en het team
        gebruikt. Geen advertenties, geen doorverkoop.
      </p>
    </div>
  );
}
