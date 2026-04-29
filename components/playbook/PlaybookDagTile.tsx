"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// PlaybookDagTile — toont één dag uit het 21-daagse playbook.
//
// Doel: de member 21 dagen bij de hand nemen — dus NIET alleen een
// afvinklijst, maar ook: wat leer je vandaag, waarom werkt dit, waar
// in ELEVA vind je het, en wat moet je doen.
//
// Layout:
//   [optionele dag-film bovenaan: slug = "playbook-dag-N"]
//   [header — altijd zichtbaar: dag/fase, titel, voortgang/balk]
//   [tabs — default 'Doen']
//      📚 Leren:  teaching (collapsed) → uitklapbaar volledig
//                 + "waarom werkt dit" als afsluiter
//      ✅ Doen:   checklist + "waar in ELEVA" + fase-doel
//
// Bij taken met filmSlug: uitklapbare film-embed eronder.
// Bij taken met actieRoute: opent nieuwe tab met ?van=playbook&dag=N
// zodat de destination-pagina een TerugNaarPlaybookBanner toont.
//
// Preview-mode: checkboxes werken visueel maar slaan niets op (founder).
// ============================================================

type Props = {
  dag: Dag;
  /** Welke taak-IDs zijn al afgevinkt door de user. */
  initialVoltooidIds: string[];
  /** Preview-modus: checkboxes werken visueel maar slaan niets op. */
  preview?: boolean;
  /** Optionele dag-film bovenaan tonen (default true). Gebruikt slug "playbook-dag-N". */
  toonDagFilm?: boolean;
};

type Tab = "leren" | "doen";

export function PlaybookDagTile({
  dag,
  initialVoltooidIds,
  preview = false,
  toonDagFilm = true,
}: Props) {
  const [voltooidIds, setVoltooidIds] = useState<Set<string>>(
    new Set(initialVoltooidIds),
  );
  const [bezigIds, setBezigIds] = useState<Set<string>>(new Set());
  const [openFilms, setOpenFilms] = useState<Set<string>>(new Set());
  const [actieveTab, setActieveTab] = useState<Tab>("doen");
  const [teachingUitgeklapt, setTeachingUitgeklapt] = useState(false);

  const totaal = dag.vandaagDoen.length;
  const aantalVoltooid = dag.vandaagDoen.filter((t) => voltooidIds.has(t.id))
    .length;
  const procentVoltooid =
    totaal === 0 ? 0 : Math.round((aantalVoltooid / totaal) * 100);

  // Pakt de eerste ~280 tekens van de teaching voor de collapsed-preview.
  // Geen woord afhakken: zoek dichtstbijzijnde spatie.
  const teachingPreview = (() => {
    const tekst = dag.watJeLeert.trim();
    if (tekst.length <= 280) return tekst;
    const knip = tekst.slice(0, 280);
    const laatsteSpatie = knip.lastIndexOf(" ");
    return (laatsteSpatie > 200 ? knip.slice(0, laatsteSpatie) : knip) + "…";
  })();
  const teachingHeeftMeer = dag.watJeLeert.trim().length > 280;

  async function toggleAfvink(taakId: string, nieuwVoltooid: boolean) {
    if (preview) {
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

  /**
   * Bouwt een actieRoute met query-params zodat de destination-pagina
   * een TerugNaarPlaybookBanner kan tonen. Externe URL's (http/https)
   * worden onaangeroerd gelaten.
   */
  function bouwActieHref(route: string): string {
    if (/^https?:\/\//i.test(route)) return route;
    const sep = route.includes("?") ? "&" : "?";
    return `${route}${sep}van=playbook&dag=${dag.nummer}`;
  }
  function isExtern(route: string): boolean {
    return /^https?:\/\//i.test(route);
  }

  return (
    <div className="space-y-4">
      {/* Optionele dag-film bovenaan — alleen zichtbaar als founder
          'm in /instellingen/films onder slug `playbook-dag-N` heeft
          ingevuld. Anders rendert het component niets. */}
      {toonDagFilm && (
        <FilmInBlok slug={`playbook-dag-${dag.nummer}`} verbergZonderFilm />
      )}

      <div className="card space-y-4">
        {/* Header — altijd zichtbaar, ongeacht actieve tab */}
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
            <p className="text-cm-white text-xs opacity-50">
              {procentVoltooid}%
            </p>
          </div>
        </div>

        <div className="h-1.5 bg-cm-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-cm-gold rounded-full transition-all"
            style={{ width: `${procentVoltooid}%` }}
          />
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Dag-secties"
          className="flex gap-1 border-b border-cm-border"
        >
          <button
            role="tab"
            aria-selected={actieveTab === "doen"}
            onClick={() => setActieveTab("doen")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              actieveTab === "doen"
                ? "border-cm-gold text-cm-gold"
                : "border-transparent text-cm-white opacity-60 hover:opacity-100"
            }`}
          >
            ✅ Doen
          </button>
          <button
            role="tab"
            aria-selected={actieveTab === "leren"}
            onClick={() => setActieveTab("leren")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              actieveTab === "leren"
                ? "border-cm-gold text-cm-gold"
                : "border-transparent text-cm-white opacity-60 hover:opacity-100"
            }`}
          >
            📚 Leren
          </button>
        </div>

        {/* DOEN-tab */}
        {actieveTab === "doen" && (
          <div className="space-y-4">
            {/* Checklist */}
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
                        } ${
                          isBezig ? "opacity-50 cursor-wait" : "cursor-pointer"
                        }`}
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
                        <div className="flex flex-wrap gap-3 mt-2">
                          {taak.actieRoute && (
                            <a
                              href={bouwActieHref(taak.actieRoute)}
                              target={
                                isExtern(taak.actieRoute) ? "_blank" : undefined
                              }
                              rel={
                                isExtern(taak.actieRoute)
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="text-xs text-cm-gold underline-offset-2 hover:underline"
                            >
                              {isExtern(taak.actieRoute)
                                ? "Open in Lifeplus ↗"
                                : "Ga naar deze plek →"}
                            </a>
                          )}
                          {taak.filmSlug && (
                            <button
                              type="button"
                              onClick={() => toggleFilm(taak.id)}
                              className="text-xs text-cm-gold underline-offset-2 hover:underline"
                            >
                              {filmOpen
                                ? "▴ Film verbergen"
                                : "📹 Bekijk film"}
                            </button>
                          )}
                        </div>
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

            {/* Waar in ELEVA — direct klikbaar naar de juiste plek */}
            {dag.waarInEleva.length > 0 && (
              <div className="rounded-lg bg-cm-surface-2 border border-cm-border p-3 space-y-2">
                <h3 className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                  📍 Waar in ELEVA
                </h3>
                <ul className="space-y-2">
                  {dag.waarInEleva.map((p, i) => (
                    <li key={i} className="text-cm-white text-xs space-y-1">
                      <div className="flex items-start gap-2 flex-wrap">
                        <strong className="font-medium">{p.actie}</strong>
                        {p.route && (
                          <a
                            href={
                              /^https?:\/\//i.test(p.route)
                                ? p.route
                                : `${p.route}${p.route.includes("?") ? "&" : "?"}van=playbook&dag=${dag.nummer}`
                            }
                            target={
                              /^https?:\/\//i.test(p.route)
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              /^https?:\/\//i.test(p.route)
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="text-cm-gold underline-offset-2 hover:underline"
                          >
                            Ga →
                          </a>
                        )}
                      </div>
                      {p.menupad && (
                        <p className="opacity-60 leading-relaxed">
                          {p.menupad}
                        </p>
                      )}
                      {p.spraak && (
                        <p className="opacity-60 italic leading-relaxed">
                          🎙️ "{p.spraak}"
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fase-doel */}
            <div className="border-t border-cm-border pt-3 text-xs text-cm-white opacity-70">
              <p>
                <strong className="text-cm-gold">🎯 Fase-doel:</strong>{" "}
                {dag.faseDoel}
              </p>
            </div>
          </div>
        )}

        {/* LEREN-tab */}
        {actieveTab === "leren" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-2">
                📚 Wat je vandaag leert
              </h3>
              <div className="text-cm-white text-sm leading-relaxed whitespace-pre-line">
                {teachingUitgeklapt || !teachingHeeftMeer
                  ? dag.watJeLeert
                  : teachingPreview}
              </div>
              {teachingHeeftMeer && (
                <button
                  type="button"
                  onClick={() => setTeachingUitgeklapt((v) => !v)}
                  className="mt-2 text-xs text-cm-gold underline-offset-2 hover:underline"
                >
                  {teachingUitgeklapt
                    ? "▴ Minder tonen"
                    : "Lees verder ↓"}
                </button>
              )}
            </div>

            <div className="border-t border-cm-border pt-3 text-xs text-cm-white opacity-80">
              <p className="italic leading-relaxed">
                <strong className="text-cm-gold not-italic">
                  🌱 Waarom dit werkt:
                </strong>{" "}
                {dag.waaromWerktDit.tekst}
                {dag.waaromWerktDit.bron && (
                  <span className="opacity-70">
                    {" "}
                    — {dag.waaromWerktDit.bron}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
