// File: app/bot/tweede-wind/[token]/tweede-wind-flow.tsx
//
// Client-flow voor Tweede Wind bot. Zelfde structuur als Tweede Lente:
// intro → intekenen → vragen → spiegel → opt-in → klaar.

"use client";

import { useState } from "react";
import type {
  TweedeWindAntwoorden,
  SpiegelOutput,
} from "@/lib/freebie-bots/types";
import { BotHeader } from "./bot-header";
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

const STAP_NUMMER: Record<FlowBlok, number> = {
  intro: 1,
  intekenen: 2,
  vragen: 3,
  spiegel: 4,
  "opt-in": 5,
  klaar: 6,
};

const TOTAAL_STAPPEN = 6;

export function TweedeWindFlow({
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
  const [antwoorden, setAntwoorden] = useState<TweedeWindAntwoorden | null>(
    null,
  );
  const [spiegel, setSpiegel] = useState<SpiegelOutput | null>(null);

  void memberId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10 space-y-6">
      <BotHeader
        memberVoornaam={memberVoornaam}
        stap={STAP_NUMMER[blok]}
        totaalStappen={TOTAAL_STAPPEN}
      />

      <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-white shadow-lg p-6 sm:p-8">
        {blok === "intro" && (
          <BlokIntro
            memberVoornaam={memberVoornaam}
            onStart={() => setBlok("intekenen")}
          />
        )}
        {blok === "intekenen" && (
          <BlokIntekenenVooraf
            token={token}
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
        {blok === "klaar" && <BlokKlaar memberVoornaam={memberVoornaam} />}
      </div>
    </div>
  );
}

function BlokKlaar({ memberVoornaam }: { memberVoornaam: string }) {
  return (
    <div className="text-center py-4">
      <div className="relative mx-auto mb-5 h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200 to-sky-200 blur-xl opacity-70 animate-pulse" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 text-5xl shadow-md ring-4 ring-white/60">
          ⚡
        </div>
      </div>

      <div className="text-sky-600 text-xs font-semibold uppercase tracking-widest">
        Helemaal klaar
      </div>
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
        Je inschrijving is binnen ✨
      </h2>
      <p className="mt-5 text-gray-700 leading-relaxed max-w-md mx-auto">
        {memberVoornaam} stuurt je vanavond een mail met je persoonlijk
        overzicht en de handvatten, plus extra context per voedingsstof.
        Kijk er rustig naar wanneer het je uitkomt.
      </p>

      <div className="mt-6 rounded-2xl bg-sky-50 border border-sky-100 px-5 py-4 text-left max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-xl">
            💌
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-gray-900">Tip:</strong> heb je een
            vraag? Stuur {memberVoornaam} gerust een berichtje.
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        ⚡ Met dank dat je deze ruimte hebt gepakt.
      </p>
    </div>
  );
}
