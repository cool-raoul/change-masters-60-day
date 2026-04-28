"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// OpenIntakeForm — eerste stap voor open testlinks (Scenario 2).
//
// Wanneer een member zijn open testlink deelt op social media of een
// event en iemand klikt erop, dan komt die persoon hier. We vragen
// minimaal: naam + telefoon óf email. Daarna maakt de server een
// nieuwe prospect + nieuwe productadvies-test rij, en redirect naar
// die persoonlijke testlink.
// ============================================================

export function OpenIntakeForm({
  templateToken,
  memberNaam,
}: {
  templateToken: string;
  memberNaam: string;
}) {
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const heeftMinimaal = naam.trim().length >= 2 && (telefoon.trim() || email.trim());

  async function start() {
    if (!heeftMinimaal) return;
    setBezig(true);
    setFout(null);
    try {
      const res = await fetch("/api/productadvies-test/open-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateToken,
          naam: naam.trim(),
          telefoon: telefoon.trim() || null,
          email: email.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFout(data.error ?? "Er ging iets mis");
        setBezig(false);
        return;
      }
      router.push(`/test/${data.token}`);
    } catch (e) {
      setFout("Verbindingsfout. Probeer het zo opnieuw.");
      setBezig(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <div className="text-xs uppercase tracking-wider text-emerald-600 font-medium mb-2">
        Welkom
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Wat zijn je gegevens?
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {memberNaam} heeft deze vragenlijst voor je klaargezet. Vul kort je
        naam in en telefoon of email — dan kan {memberNaam} je het advies
        persoonlijk doorspreken.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Naam *
          </label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Voor- en achternaam"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefoonnummer
          </label>
          <input
            type="tel"
            value={telefoon}
            onChange={(e) => setTelefoon(e.target.value)}
            placeholder="+31 6 ..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="naam@voorbeeld.nl"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-gray-500">
          Telefoonnummer óf email is voldoende — we gebruiken één van beide
          om je het advies later te kunnen toesturen.
        </p>

        {fout && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            {fout}
          </div>
        )}

        <button
          onClick={start}
          disabled={!heeftMinimaal || bezig}
          className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-40"
        >
          {bezig ? "Bezig..." : "Start de vragenlijst"}
        </button>
      </div>
    </div>
  );
}
