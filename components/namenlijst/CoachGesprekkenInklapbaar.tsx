"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { useTaal } from "@/lib/i18n/TaalContext";
import { Locale } from "date-fns";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

interface Gesprek {
  id: string;
  titel: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  gesprekken: Gesprek[];
  prospectId: string;
  prospectNaam: string;
}

export function CoachGesprekkenInklapbaar({ gesprekken, prospectId, prospectNaam }: Props) {
  const [open, setOpen] = useState(false);
  const { v, taal } = useTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;

  const voornaam = prospectNaam.split(" ")[0];

  return (
    <div className="card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            🤖 ELEVA Mentor over {voornaam}
          </h2>
          {gesprekken.length > 0 && (
            <p className="text-xs text-cm-white opacity-40 mt-0.5">
              {gesprekken.length} gesprek{gesprekken.length !== 1 ? "ken" : ""}
            </p>
          )}
        </div>
        <span className={`text-cm-gold text-lg transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/coach?prospect=${prospectId}`}
              className="text-cm-gold text-xs hover:text-cm-gold-light"
            >
              + Nieuw gesprek over {voornaam}
            </Link>
          </div>

          {gesprekken.length === 0 ? (
            <p className="text-cm-white text-sm opacity-60">
              Nog geen mentor gesprekken over {voornaam}. Start er een via de knop hierboven.
            </p>
          ) : (
            <div className="space-y-2">
              {gesprekken.map((gesprek) => (
                <Link
                  key={gesprek.id}
                  href={`/coach/${gesprek.id}`}
                  className="flex items-center justify-between bg-cm-surface-2 rounded-lg p-3 hover:border hover:border-cm-gold-dim transition-colors group"
                >
                  <div>
                    <p className="text-cm-white text-sm font-medium group-hover:text-cm-gold transition-colors">
                      {gesprek.titel || `Gesprek over ${voornaam}`}
                    </p>
                    <p className="text-cm-white text-xs opacity-60 mt-0.5">
                      {format(new Date(gesprek.updated_at), "d MMM yyyy, HH:mm", { locale: datumLocale })}
                    </p>
                  </div>
                  <span className="text-cm-gold text-sm">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
