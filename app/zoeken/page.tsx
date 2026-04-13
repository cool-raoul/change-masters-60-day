"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { PIPELINE_FASEN } from "@/lib/supabase/types";

interface ZoekResultaat {
  type: "prospect" | "coach";
  id: string;
  titel: string;
  subtitel?: string;
  fase?: string;
  datum?: string;
  href: string;
}

export default function ZoekenPagina() {
  const [zoekterm, setZoekterm] = useState("");
  const [resultaten, setResultaten] = useState<ZoekResultaat[]>([]);
  const [laden, setLaden] = useState(false);
  const [gezocht, setGezocht] = useState(false);
  const supabase = createClient();

  async function zoek(term: string) {
    setZoekterm(term);
    if (term.trim().length < 2) {
      setResultaten([]);
      setGezocht(false);
      return;
    }

    setLaden(true);
    setGezocht(true);

    const zoekTekst = `%${term.trim()}%`;

    const [{ data: prospects }, { data: gesprekken }] = await Promise.all([
      supabase
        .from("prospects")
        .select("id, volledige_naam, pipeline_fase, telefoon, email, notities")
        .or(`volledige_naam.ilike.${zoekTekst},notities.ilike.${zoekTekst},telefoon.ilike.${zoekTekst},email.ilike.${zoekTekst}`)
        .eq("gearchiveerd", false)
        .limit(10),
      supabase
        .from("ai_gesprekken")
        .select("id, titel, updated_at")
        .ilike("titel", zoekTekst)
        .limit(5),
    ]);

    const gevonden: ZoekResultaat[] = [];

    (prospects || []).forEach((p) => {
      const faseInfo = PIPELINE_FASEN.find((f) => f.fase === p.pipeline_fase);
      gevonden.push({
        type: "prospect",
        id: p.id,
        titel: p.volledige_naam,
        subtitel: p.email || p.telefoon || p.notities?.substring(0, 60) || "",
        fase: faseInfo?.label,
        href: `/namenlijst/${p.id}`,
      });
    });

    (gesprekken || []).forEach((g) => {
      gevonden.push({
        type: "coach",
        id: g.id,
        titel: g.titel || "Coach gesprek",
        datum: g.updated_at,
        href: `/coach/${g.id}`,
      });
    });

    setResultaten(gevonden);
    setLaden(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Zoeken
        </h1>
        <p className="text-cm-white mt-1 opacity-70">
          Zoek contacten, gesprekken en notities
        </p>
      </div>

      {/* Zoekbalk */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cm-gold text-lg">
          🔍
        </span>
        <input
          type="text"
          value={zoekterm}
          onChange={(e) => zoek(e.target.value)}
          placeholder="Naam, notitie, telefoonnummer, e-mail..."
          className="input-cm w-full pl-12 py-3 text-base"
          autoFocus
        />
        {zoekterm && (
          <button
            onClick={() => { setZoekterm(""); setResultaten([]); setGezocht(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cm-white opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resultaten */}
      {laden && (
        <div className="text-center py-8 text-cm-white opacity-60">
          Zoeken...
        </div>
      )}

      {gezocht && !laden && resultaten.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-cm-white font-semibold">Niets gevonden</p>
          <p className="text-cm-white text-sm mt-1 opacity-60">
            Probeer een andere zoekterm
          </p>
        </div>
      )}

      {resultaten.length > 0 && (
        <div className="space-y-2">
          {/* Prospects */}
          {resultaten.filter((r) => r.type === "prospect").length > 0 && (
            <div>
              <p className="text-xs text-cm-white opacity-50 uppercase tracking-wider mb-2 px-1">
                Contacten
              </p>
              <div className="space-y-2">
                {resultaten
                  .filter((r) => r.type === "prospect")
                  .map((r) => (
                    <Link
                      key={r.id}
                      href={r.href}
                      className="card flex items-center justify-between hover:border-cm-gold-dim transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">👤</span>
                        <div>
                          <p className="text-cm-white font-semibold text-sm group-hover:text-cm-gold transition-colors">
                            {r.titel}
                          </p>
                          {r.subtitel && (
                            <p className="text-cm-white text-xs opacity-60 mt-0.5 line-clamp-1">
                              {r.subtitel}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.fase && (
                          <span className="text-cm-gold text-xs bg-gold-subtle px-2 py-0.5 rounded-full">
                            {r.fase}
                          </span>
                        )}
                        <span className="text-cm-gold text-sm">→</span>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Coach gesprekken */}
          {resultaten.filter((r) => r.type === "coach").length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-cm-white opacity-50 uppercase tracking-wider mb-2 px-1">
                Coach gesprekken
              </p>
              <div className="space-y-2">
                {resultaten
                  .filter((r) => r.type === "coach")
                  .map((r) => (
                    <Link
                      key={r.id}
                      href={r.href}
                      className="card flex items-center justify-between hover:border-cm-gold-dim transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🤖</span>
                        <div>
                          <p className="text-cm-white font-semibold text-sm group-hover:text-cm-gold transition-colors">
                            {r.titel}
                          </p>
                          {r.datum && (
                            <p className="text-cm-white text-xs opacity-60 mt-0.5">
                              {format(new Date(r.datum), "d MMM yyyy", { locale: nl })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-cm-gold text-sm">→</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!gezocht && (
        <div className="card text-center py-12 border-dashed">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-cm-white">Type een naam of zoekterm</p>
          <p className="text-cm-white text-sm mt-1 opacity-60">
            Zoekt in contacten, notities, telefoonnummers en coach gesprekken
          </p>
        </div>
      )}
    </div>
  );
}
