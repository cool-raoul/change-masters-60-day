// File: app/bot/tweede-lente/[token]/tweede-lente-flow.tsx
//
// Client-flow voor de Tweede Lente bot. Vijf stappen:
//   intro       Warme uitnodiging in team-stem
//   intekenen   E-mail + naam VOORAF (filter, geen verplicht advies)
//   vragen      7 multi-choice vragen
//   spiegel     AI-spiegel + 4 ankers + voedingsstoffen-blok
//   opt-in      Product-pakketten + contact-aanbod + submit
//   klaar       Bevestiging
//
// Opt-in vooraf werkt als drempel: alleen vrouwen die serieus genoeg
// zijn om hun gegevens te delen, doorlopen de bot. Eén API-call aan
// het eind met alle data tegelijk.

"use client";

import { useState } from "react";
import type {
  TweedeLenteAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";
import { BlokIntro } from "./blok-intro";
import {
  BlokIntekenenVooraf,
  type IntekenGegevens,
} from "./blok-intekenen-vooraf";
import { BlokVragen } from "./blok-vragen";
import { BlokSpiegel } from "./blok-spiegel";
import { BlokOptIn } from "./blok-opt-in";

type FlowBlok =
  | "intro"
  | "intekenen"
  | "vragen"
  | "spiegel"
  | "opt-in"
  | "klaar";

export function TweedeLenteFlow({
  token,
  memberId,
  memberVoornaam,
  bestellinks,
}: {
  token: string;
  memberId: string;
  memberVoornaam: string;
  bestellinks: Record<string, string>;
}) {
  const [blok, setBlok] = useState<FlowBlok>("intro");
  const [inteken, setInteken] = useState<IntekenGegevens | null>(null);
  const [antwoorden, setAntwoorden] = useState<TweedeLenteAntwoorden | null>(
    null,
  );
  const [spiegel, setSpiegel] = useState<SpiegelOutput | null>(null);

  // memberId bewust niet getoond aan prospect. Wel beschikbaar voor
  // opt-in-call. We geven memberVoornaam wel mee in passende plekken.
  void memberId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {blok === "intro" && (
        <BlokIntro
          memberVoornaam={memberVoornaam}
          onStart={() => setBlok("intekenen")}
        />
      )}
      {blok === "intekenen" && (
        <BlokIntekenenVooraf
          memberVoornaam={memberVoornaam}
          onTerug={() => setBlok("intro")}
          onKlaar={(g) => {
            setInteken(g);
            setBlok("vragen");
          }}
        />
      )}
      {blok === "vragen" && (
        <BlokVragen
          memberVoornaam={memberVoornaam}
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
          memberVoornaam={memberVoornaam}
          onVolgende={(s) => {
            setSpiegel(s);
            setBlok("opt-in");
          }}
        />
      )}
      {blok === "opt-in" && antwoorden && spiegel && inteken && (
        <BlokOptIn
          token={token}
          antwoorden={antwoorden}
          spiegel={spiegel}
          inteken={inteken}
          memberVoornaam={memberVoornaam}
          bestellinks={bestellinks}
          onKlaar={() => setBlok("klaar")}
        />
      )}
      {blok === "klaar" && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Je inschrijving is binnen
          </h2>
          <p className="mt-3 text-gray-700">
            {memberVoornaam} stuurt je vanavond een mail met je spiegel en
            de vier ankers, plus extra context per voedingsstof. Kijk er
            rustig naar wanneer het je uitkomt. Geen druk.
          </p>
          <p className="mt-3 text-gray-700">
            Heb je een vraag? Stuur {memberVoornaam} gerust een berichtje,
            ze heeft je hier persoonlijk uitgenodigd.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            Met dank dat je deze ruimte hebt gepakt.
          </p>
        </div>
      )}
    </div>
  );
}
