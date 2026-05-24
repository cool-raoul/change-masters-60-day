// File: app/bot/tweede-lente/[token]/tweede-lente-flow.tsx
//
// Client-flow voor de Tweede Lente bot. Houdt huidig blok bij in state,
// rendert het juiste blok-component. Geen extra UI-chroom.

"use client";

import { useState } from "react";
import type { TweedeLenteAntwoorden, SpiegelOutput } from "@/lib/freebie-bots/types";
import { BlokIntro } from "./blok-intro";
import { BlokVragen } from "./blok-vragen";
import { BlokSpiegel } from "./blok-spiegel";
import { BlokOptIn } from "./blok-opt-in";

type FlowBlok = "intro" | "vragen" | "spiegel" | "opt-in" | "klaar";

export function TweedeLenteFlow({
  token,
  memberId,
  memberVoornaam,
}: {
  token: string;
  memberId: string;
  memberVoornaam: string;
}) {
  const [blok, setBlok] = useState<FlowBlok>("intro");
  const [antwoorden, setAntwoorden] = useState<TweedeLenteAntwoorden | null>(null);
  const [spiegel, setSpiegel] = useState<SpiegelOutput | null>(null);

  // memberId bewust niet getoond aan prospect. Wel beschikbaar voor
  // opt-in-call. We geven memberVoornaam wel mee in passende plekken.
  void memberId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {blok === "intro" && (
        <BlokIntro onStart={() => setBlok("vragen")} />
      )}
      {blok === "vragen" && (
        <BlokVragen
          onKlaar={(a) => {
            setAntwoorden(a);
            setBlok("spiegel");
          }}
        />
      )}
      {blok === "spiegel" && antwoorden && (
        <BlokSpiegel
          token={token}
          antwoorden={antwoorden}
          onVolgende={(s) => {
            setSpiegel(s);
            setBlok("opt-in");
          }}
        />
      )}
      {blok === "opt-in" && antwoorden && spiegel && (
        <BlokOptIn
          token={token}
          antwoorden={antwoorden}
          spiegel={spiegel}
          memberVoornaam={memberVoornaam}
          onKlaar={() => setBlok("klaar")}
        />
      )}
      {blok === "klaar" && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Je inschrijving is binnen
          </h2>
          <p className="mt-3 text-gray-700">
            Je ontvangt de eerste mail vanavond. Kijk er even rustig naar
            wanneer het je uitkomt. Geen druk.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            Tweede Lente, met dank dat je deze ruimte hebt gepakt.
          </p>
        </div>
      )}
    </div>
  );
}
