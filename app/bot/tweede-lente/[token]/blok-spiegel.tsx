// File: app/bot/tweede-lente/[token]/blok-spiegel.tsx
//
// Blok 3, AI-spiegel. Roept /api/freebie-bot/spiegel aan met token +
// antwoorden, toont opening + patroon + driAanpassingen + afsluiting,
// en biedt de "Ga verder" knop richting opt-in.
//
// Loading-state: schaduw-skelet van 3-4 grijze lijntjes terwijl
// OpenAI bezig is. Fout-state: vriendelijke melding met retry-knop.

"use client";

import { useEffect, useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";

export function BlokSpiegel({
  token,
  antwoorden,
  memberVoornaam,
  onVolgende,
}: {
  token: string;
  antwoorden: TweedeLenteAntwoorden;
  memberVoornaam: string;
  onVolgende: (s: SpiegelOutput) => void;
}) {
  const [spiegel, setSpiegel] = useState<SpiegelOutput | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    let actief = true;
    setFout(null);
    setSpiegel(null);
    fetch("/api/freebie-bot/spiegel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, antwoorden }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!actief) return;
        if (!r.ok) {
          setFout(data.error ?? "Spiegel-generatie mislukt");
          return;
        }
        setSpiegel(data as SpiegelOutput);
      })
      .catch((e) => {
        if (!actief) return;
        setFout(String(e));
      });
    return () => {
      actief = false;
    };
  }, [token, antwoorden]);

  if (fout) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Het lukte even niet om je spiegel op te halen
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Wil je het opnieuw proberen? Soms is de verbinding traag.
        </p>
        <button
          type="button"
          onClick={() => {
            setFout(null);
            setSpiegel(null);
            // forceer re-effect door state-reset
            window.location.reload();
          }}
          className="mt-4 rounded-full bg-rose-600 px-6 py-2 text-white text-sm font-medium"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!spiegel) {
    return (
      <div>
        <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
          Een moment, je spiegel komt eraan
        </div>
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 bg-rose-100 rounded w-3/4" />
          <div className="h-4 bg-rose-100 rounded w-5/6" />
          <div className="h-4 bg-rose-100 rounded w-2/3" />
          <div className="mt-4 h-4 bg-rose-100 rounded w-4/5" />
          <div className="h-4 bg-rose-100 rounded w-3/5" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Jouw spiegel, klaargezet door {memberVoornaam}
      </div>

      <p className="mt-4 text-lg text-gray-800 leading-relaxed">
        {spiegel.opening}
      </p>

      <p className="mt-4 text-gray-700 leading-relaxed">
        {spiegel.patroon}
      </p>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-900">
          Drie kleine aanpassingen die veel vrouwen in jouw fase kiezen
        </h3>
        <ul className="mt-3 space-y-2">
          {spiegel.driAanpassingen.map((aanpassing, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl bg-rose-50 px-4 py-3"
            >
              <span className="text-rose-500 font-semibold">{i + 1}</span>
              <span className="text-gray-800">{aanpassing}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Vier ankers MET uitleg-waarom. Elk anker krijgt twee paragrafen:
          de actie + waarom het werkt. Geen claims, wel context, zodat de
          vrouw begrijpt waarom de aanpassing helpend kan zijn. */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-gray-900">
          Vier ankers die je vandaag al kunt pakken
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Klein, concreet, zonder belofte. Probeer er één deze week.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <div>
              <strong className="text-gray-900">Ochtend-anker.</strong>{" "}
              <span className="text-gray-700">
                Eerste kwartier na het wakker worden: geen scherm, één
                glas water, kort de dag in jezelf doorlopen.
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Waarom: in de eerste minuten ontwaakt het cortisol-ritme,
              dat regelt je energie de hele dag. Een paar minuten rust
              zonder scherm laat dat ritme natuurlijk omhoog komen,
              zonder dat externe prikkels het uit balans halen. Een glas
              water op een lege maag activeert je spijsvertering en helpt
              tegen de lichte uitdroging van de nacht.
            </div>
          </li>
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <div>
              <strong className="text-gray-900">Eet-anker.</strong>{" "}
              <span className="text-gray-700">
                Drie maaltijden met een vast venster van twaalf uur (van
                ontbijt tot avondeten).
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Waarom: in een vast venster van twaalf uur krijgt je
              spijsvertering ook rust. De andere twaalf uur heeft je
              lichaam tijd voor herstel en regulatie van je
              hormoonsignalen, in plaats van constant te verteren. Veel
              vrouwen voelen dat hun energie en slaap meeschuiven met
              dit ritme.
            </div>
          </li>
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <div>
              <strong className="text-gray-900">Beweeg-anker.</strong>{" "}
              <span className="text-gray-700">
                Twee kortere wandelingen per dag van ongeveer tien
                minuten, één in de ochtend en één na het avondeten.
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Waarom: lopen in de ochtend, vooral met daglicht op je
              gezicht, zet je biologische klok scherper. Lopen na het
              avondeten helpt je bloedsuiker geleidelijk dalen in plaats
              van met een piek. Geen prestatie, wel ritme.
            </div>
          </li>
          <li className="rounded-xl border border-rose-100 bg-white px-4 py-3">
            <div>
              <strong className="text-gray-900">Avond-anker.</strong>{" "}
              <span className="text-gray-700">
                Een vast moment, een half uur voor het slapen, zonder
                scherm. Drie diepe ademhalingen en de dag mag aflopen.
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Waarom: blauw licht van schermen remt de aanmaak van het
              slaap-signaal in je hoofd. Een half uur zonder scherm en
              een paar diepe ademhalingen geven je zenuwstelsel het
              signaal dat de dag voorbij is, zodat je makkelijker in
              slaap valt en dieper slaapt.
            </div>
          </li>
        </ul>
      </div>

      {/* EFSA-toegestane voedingsstoffen-blok. Bruggetje naar de Lifeplus-
          pakketten in de opt-in-stap. Elke zin is een geautoriseerde EFSA-
          health-claim (Verordening EU 1924/2006), letterlijk toegestaan in
          marketing wanneer het product de minimale hoeveelheid bevat. */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-gray-900">
          Voedingsstoffen die in deze fase vaak belangrijk worden
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Krijg je ze al via je dagelijkse voeding? Mooi. Anders kan
          gerichte aanvulling rust geven. Onder elk staat de
          wetenschappelijk-bevestigde rol die de stof in je lichaam
          speelt.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-gray-900">Magnesium</strong>
              <span className="text-xs text-gray-500">bladgroente, pitten, peulvruchten</span>
            </div>
            <ul className="mt-1 text-gray-700 text-xs leading-relaxed list-disc list-inside space-y-0.5">
              <li>draagt bij aan vermindering van vermoeidheid</li>
              <li>draagt bij aan een normale werking van het zenuwstelsel</li>
              <li>draagt bij aan een normale spierfunctie</li>
              <li>draagt bij aan een normale psychologische functie</li>
            </ul>
          </li>
          <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-gray-900">Vitamine B6</strong>
              <span className="text-xs text-gray-500">vis, kip, banaan, volkoren</span>
            </div>
            <ul className="mt-1 text-gray-700 text-xs leading-relaxed list-disc list-inside space-y-0.5">
              <li>draagt bij aan de regulatie van de hormonale activiteit</li>
              <li>draagt bij aan een normale psychologische functie</li>
              <li>draagt bij aan vermindering van vermoeidheid</li>
            </ul>
          </li>
          <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-gray-900">Vitamine D</strong>
              <span className="text-xs text-gray-500">daglicht, vette vis, eieren</span>
            </div>
            <ul className="mt-1 text-gray-700 text-xs leading-relaxed list-disc list-inside space-y-0.5">
              <li>draagt bij aan de instandhouding van normale botten</li>
              <li>draagt bij aan een normale werking van het immuunsysteem</li>
              <li>draagt bij aan een normale spierfunctie</li>
            </ul>
          </li>
          <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-gray-900">Vitamine K</strong>
              <span className="text-xs text-gray-500">bladgroente, broccoli, gefermenteerd</span>
            </div>
            <ul className="mt-1 text-gray-700 text-xs leading-relaxed list-disc list-inside space-y-0.5">
              <li>draagt bij aan de instandhouding van normale botten</li>
              <li>draagt bij aan een normale bloedstolling</li>
            </ul>
          </li>
          <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-gray-900">Omega-3 (DHA)</strong>
              <span className="text-xs text-gray-500">vette vis, lijnzaad, walnoot</span>
            </div>
            <ul className="mt-1 text-gray-700 text-xs leading-relaxed list-disc list-inside space-y-0.5">
              <li>draagt bij aan een normale werking van de hersenen</li>
              <li>draagt bij aan instandhouding van een normaal gezichtsvermogen</li>
            </ul>
          </li>
          <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-gray-900">Calcium</strong>
              <span className="text-xs text-gray-500">zuivel, sesamzaad, amandel</span>
            </div>
            <ul className="mt-1 text-gray-700 text-xs leading-relaxed list-disc list-inside space-y-0.5">
              <li>is nodig voor de instandhouding van normale botten</li>
              <li>draagt bij aan een normale werking van spieren</li>
            </ul>
          </li>
        </ul>
        <p className="mt-4 text-xs text-gray-500 italic">
          Bron: deze formuleringen zijn EFSA-goedgekeurde health-claims
          (Verordening EU 1924/2006). Bij gerichte aanvulling kies een
          product dat de wettelijk minimale hoeveelheid per stof bevat.
        </p>
      </div>

      <p className="mt-8 text-gray-700 leading-relaxed">
        {spiegel.afsluiting}
      </p>

      <button
        type="button"
        onClick={() => onVolgende(spiegel)}
        className="mt-8 w-full rounded-full bg-rose-600 px-6 py-3 text-white text-base font-medium"
      >
        Ga verder naar de pakket-richting →
      </button>
    </div>
  );
}
