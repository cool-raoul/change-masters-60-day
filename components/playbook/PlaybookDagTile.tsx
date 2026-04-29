"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// PlaybookDagTile — toont één dag uit het 21-daagse playbook met
// afvink-checkboxes per taak. Bij afvinken: API-call naar
// /api/playbook/vink-af die opslaat + sponsor-push verstuurt.
//
// Membership is niet 'verplicht' geblokkeerd — alle taken mogen
// overgeslagen worden. Onvoltooide admin-stappen verschijnen later
// in het dashboard als reminder.
//
// Bij taken met filmSlug: uitklapbare film-embed eronder via FilmInBlok.
// ============================================================

export function PlaybookDagTile({
  dag,
  initialVoltooidIds,
  preview = false,
}: {
  dag: Dag;
  /** Welke taak-IDs zijn al afgevinkt door de user. */
  initialVoltooidIds: string[];
  /** Preview-modus: checkboxes werken visueel maar slaan niets op. */
  preview?: boolean;
}) {
  const [voltooidIds, setVoltooidIds] = useState<Set<string>>(
    new Set(initialVoltooidIds),
  );
  const [bezigIds, setBezigIds] = useState<Set<string>>(new Set());
  const [openFilms, setOpenFilms] = useState<Set<string>>(new Set());

  const totaal = dag.vandaagDoen.length;
  const aantalVoltooid = dag.vandaagDoen.filter((t) => voltooidIds.has(t.id))
    .length;
  const procentVoltooid =
    totaal === 0 ? 0 : Math.round((aantalVoltooid / totaal) * 100);

  async function toggleAfvink(taakId: string, nieuwVoltooid: boolean) {
    if (preview) {
      // Alleen visueel toggelen — niets opslaan
      setVoltooidIds((prev) => {
        const nieuw = new Set(prev);
        if (nieuwVoltooid) nieuw.add(taakId);
        else nieuw.delete(taakId);
        return nieuw;
      });
      return;
    }
    if (bezigIds.has(taakId)) return;
    setBezigIds((prev) => new Set(prev).add(taakId));

    // Optimistische update — toggle direct in UI
    setVoltooidIds((prev) => {
      const nieuw = new Set(prev);
      if (nieuwVoltooid) nieuw.add(taakId);
      else nieuw.delete(taakId);
      return nieuw;
    });

    try {
      const res = await fetch("/api/playbook/vink-af", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dagNummer: dag.nummer,
          taakId,
          vink: nieuwVoltooid,
        }),
      });
      if (!res.ok) {
        // Roll back bij fout
        setVoltooidIds((prev) => {
          const nieuw = new Set(prev);
          if (nieuwVoltooid) nieuw.delete(taakId);
          else nieuw.add(taakId);
          return nieuw;
        });
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Opslaan mislukt");
      }
    } catch (e) {
      // Roll back bij netwerk-fout
      setVoltooidIds((prev) => {
        const nieuw = new Set(prev);
        if (nieuwVoltooid) nieuw.delete(taakId);
        else nieuw.add(taakId);
        return nieuw;
      });
      toast.error("Verbindingsfout");
    } finally {
      setBezigIds((prev) => {
        const nieuw = new Set(prev);
        nieuw.delete(taakId);
        return nieuw;
      });
    }
  }

  function toggleFilm(taakId: string) {
    setOpenFilms((prev) => {
      const nieuw = new Set(prev);
      if (nieuw.has(taakId)) nieuw.delete(taakId);
      else nieuw.add(taakId);
      return nieuw;
    });
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Dag {dag.nummer} · Fase {dag.fase}
          </p>
          <h2 className="text-cm-white font-display font-bold text-lg mt-0.5">
            {dag.titel}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-cm-gold text-sm font-semibold">
            {aantalVoltooid} / {totaal}
          </span>
          <p className="text-cm-white text-xs opacity-50">{procentVoltooid}%</p>
        </div>
      </div>

      {/* Voortgangsbalk */}
      <div className="h-1.5 bg-cm-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-cm-gold rounded-full transition-all"
          style={{ width: `${procentVoltooid}%` }}
        />
      </div>

      {/* Taken */}
      <div className="space-y-2">
        {dag.vandaagDoen.map((taak) => {
          const isVoltooid = voltooidIds.has(taak.id);
          const isBezig = bezigIds.has(taak.id);
          const filmOpen = openFilms.has(taak.id);
          return (
            <div
              key={taak.id}
              className={`rounded-lg border transition-colors ${
                isVoltooid
                  ? "bg-emerald-900/15 border-emerald-600/30"
                  : "bg-cm-surface-2 border-cm-border"
              }`}
            >
              <div className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  onClick={() => toggleAfvink(taak.id, !isVoltooid)}
                  disabled={isBezig}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 transition-colors ${
                    isVoltooid
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-cm-border hover:border-cm-gold"
                  } ${isBezig ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                  aria-label={isVoltooid ? "Onvinken" : "Afvinken"}
                >
                  {isVoltooid && (
                    <svg
                      className="w-full h-full text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${
                      isVoltooid
                        ? "text-cm-white opacity-50 line-through"
                        : "text-cm-white"
                    }`}
                  >
                    {taak.label}
                  </p>
                  {taak.uitleg && (
                    <p className="text-cm-white text-xs opacity-60 mt-1 leading-relaxed">
                      {taak.uitleg}
                    </p>
                  )}
                  {/* Toon-knoppen voor route en/of film */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {taak.actieRoute && (
                      <Link
                        href={taak.actieRoute}
                        className="text-xs text-cm-gold underline-offset-2 hover:underline"
                      >
                        Open →
                      </Link>
                    )}
                    {taak.filmSlug && (
                      <button
                        type="button"
                        onClick={() => toggleFilm(taak.id)}
                        className="text-xs text-cm-gold underline-offset-2 hover:underline"
                      >
                        {filmOpen ? "▴ Film verbergen" : "📹 Bekijk film"}
                      </button>
                    )}
                  </div>
                  {/* Film-embed (uitklapbaar) */}
                  {taak.filmSlug && filmOpen && (
                    <div className="mt-3">
                      <FilmInBlok
                        slug={taak.filmSlug}
                        fallbackTitel="📹 Bekijk de video"
                        fallbackTekst="Film volgt — wordt door de hoofdbeheerder toegevoegd."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fase-doel + waarom */}
      <div className="border-t border-cm-border pt-3 space-y-2 text-xs text-cm-white opacity-70">
        <p>
          <strong className="text-cm-gold">🎯 Fase-doel:</strong> {dag.faseDoel}
        </p>
        <p className="italic">
          <strong className="text-cm-gold not-italic">🌱 Waarom dit werkt:</strong>{" "}
          {dag.waaromWerktDit.tekst}
          {dag.waaromWerktDit.bron && (
            <span className="opacity-70"> — {dag.waaromWerktDit.bron}</span>
          )}
        </p>
      </div>
    </div>
  );
}
