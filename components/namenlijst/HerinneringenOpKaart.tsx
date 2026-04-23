"use client";

import { differenceInDays, format } from "date-fns";
import { nl, enUS, fr, es, de, pt, Locale } from "date-fns/locale";
import { Herinnering } from "@/lib/supabase/types";
import { HerinneringActies } from "@/components/herinneringen/HerinneringActies";
import { useTaal } from "@/lib/i18n/TaalContext";
import { useState } from "react";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

const TYPE_ICOON: Record<string, string> = {
  followup: "🔄",
  product_herbestelling: "📦",
  custom: "📌",
};

interface Props {
  herinneringen: Herinnering[];
}

// Toont openstaande herinneringen die bij deze prospect horen, direct op de
// prospect-detail-kaart. De data staat al in de DB; voorheen was hij alleen
// zichtbaar op /herinneringen (sidebar). Doel: context bij elkaar houden
// zodat een herinnering niet losgekoppeld lijkt van de persoon.
export function HerinneringenOpKaart({ herinneringen }: Props) {
  const { v, taal } = useTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;
  const [open, setOpen] = useState(true);

  if (!herinneringen || herinneringen.length === 0) return null;

  const vandaag = new Date().toISOString().split("T")[0];

  return (
    <div className="card space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider flex items-center gap-2">
          🔔 {v("herinneringen.titel") || "Herinneringen"}{" "}
          <span className="text-cm-gold">({herinneringen.length})</span>
        </h2>
        <span
          className={`text-cm-gold text-lg transition-transform ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="space-y-2">
          {herinneringen.map((her) => {
            const isVerlopen = her.vervaldatum < vandaag;
            const isVandaag = her.vervaldatum === vandaag;
            const dagenTeLaat = differenceInDays(new Date(), new Date(her.vervaldatum));
            const kleur = isVerlopen
              ? "border-l-red-500 bg-red-500/5"
              : isVandaag
                ? "border-l-cm-gold"
                : "border-l-blue-500";

            return (
              <div
                key={her.id}
                className={`border-l-4 ${kleur} bg-cm-surface-2 rounded-lg p-3 flex items-center justify-between gap-3`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">
                      {TYPE_ICOON[her.herinnering_type] || "📌"}
                    </span>
                    <p className="text-cm-white font-semibold text-sm">{her.titel}</p>
                    {isVerlopen && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                        {dagenTeLaat === 1 ? "1 dag te laat" : `${dagenTeLaat} dagen te laat`}
                      </span>
                    )}
                    {isVandaag && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-cm-gold/20 text-cm-gold px-1.5 py-0.5 rounded">
                        Vandaag
                      </span>
                    )}
                  </div>
                  {her.beschrijving && her.beschrijving !== her.titel && (
                    <p className="text-cm-white text-xs mt-1 ml-6 opacity-80">
                      {her.beschrijving}
                    </p>
                  )}
                  <p
                    className={`text-xs mt-1 ml-6 ${
                      isVerlopen ? "text-red-400" : "text-cm-white opacity-70"
                    }`}
                  >
                    {format(new Date(her.vervaldatum), "EEEE d MMMM yyyy", {
                      locale: datumLocale,
                    })}
                  </p>
                </div>
                <HerinneringActies herinneringId={her.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
