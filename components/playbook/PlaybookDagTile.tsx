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
  /**
   * Map van inlineActie.slug → opgeslagen waarde. Wordt op de server
   * uit `eigen_zinnen` opgehaald zodat de member bij heropenen z'n
   * eerder geschreven zin terugziet.
   */
  initialZinnen?: Record<string, string>;
  /**
   * Als true: toon ✏️-knoppen naast de teaching-velden zodat de
   * founder ter plaatse de tekst kan aanpassen. Server bepaalt dit op
   * basis van profile.role === 'founder'.
   */
  isFounder?: boolean;
};

type BewerktVeld = "titel" | "watJeLeert" | "faseDoel" | "waarom" | null;

type Tab = "leren" | "doen";

export function PlaybookDagTile({
  dag,
  initialVoltooidIds,
  preview = false,
  toonDagFilm = true,
  initialZinnen = {},
  isFounder = false,
}: Props) {
  const [voltooidIds, setVoltooidIds] = useState<Set<string>>(
    new Set(initialVoltooidIds),
  );
  const [bezigIds, setBezigIds] = useState<Set<string>>(new Set());
  const [openFilms, setOpenFilms] = useState<Set<string>>(new Set());
  const [openInlines, setOpenInlines] = useState<Set<string>>(new Set());
  const [inlineWaardes, setInlineWaardes] =
    useState<Record<string, string>>(initialZinnen);
  const [opgeslagenSlugs, setOpgeslagenSlugs] = useState<Set<string>>(
    new Set(Object.keys(initialZinnen).filter((k) => initialZinnen[k])),
  );
  const [bezigInlineSlugs, setBezigInlineSlugs] = useState<Set<string>>(
    new Set(),
  );
  const [actieveTab, setActieveTab] = useState<Tab>("doen");
  const [teachingUitgeklapt, setTeachingUitgeklapt] = useState(false);

  // Founder-edit state — de tile houdt lokaal de actuele tekst bij zodat
  // direct na opslaan de aanpassing in beeld is zonder te wachten op een
  // page-refresh.
  const [actueleTekst, setActueleTekst] = useState({
    titel: dag.titel,
    watJeLeert: dag.watJeLeert,
    faseDoel: dag.faseDoel,
    waaromTekst: dag.waaromWerktDit?.tekst ?? "",
    waaromBron: dag.waaromWerktDit?.bron ?? "",
  });
  const [bewerktVeld, setBewerktVeld] = useState<BewerktVeld>(null);
  const [bewerkBuffer, setBewerkBuffer] = useState("");
  const [bewerkBronBuffer, setBewerkBronBuffer] = useState("");
  const [bewerkBezig, setBewerkBezig] = useState(false);

  const totaal = dag.vandaagDoen.length;
  const aantalVoltooid = dag.vandaagDoen.filter((t) => voltooidIds.has(t.id))
    .length;
  const procentVoltooid =
    totaal === 0 ? 0 : Math.round((aantalVoltooid / totaal) * 100);

  // Pakt de eerste ~280 tekens van de teaching voor de collapsed-preview.
  // Geen woord afhakken: zoek dichtstbijzijnde spatie.
  const teachingPreview = (() => {
    const tekst = actueleTekst.watJeLeert.trim();
    if (tekst.length <= 280) return tekst;
    const knip = tekst.slice(0, 280);
    const laatsteSpatie = knip.lastIndexOf(" ");
    return (laatsteSpatie > 200 ? knip.slice(0, laatsteSpatie) : knip) + "…";
  })();
  const teachingHeeftMeer = actueleTekst.watJeLeert.trim().length > 280;

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

  function toggleInline(taakId: string) {
    setOpenInlines((prev) => {
      const nieuw = new Set(prev);
      if (nieuw.has(taakId)) nieuw.delete(taakId);
      else nieuw.add(taakId);
      return nieuw;
    });
  }

  async function bewaarInline(taak: { id: string; inlineActie?: { slug: string; label: string } }) {
    const inline = taak.inlineActie;
    if (!inline) return;
    const waarde = (inlineWaardes[inline.slug] || "").trim();
    if (!waarde) {
      toast.error("Schrijf eerst iets om te bewaren");
      return;
    }
    if (preview) {
      // Preview: lokaal markeren als opgeslagen + automatisch afvinken
      setOpgeslagenSlugs((p) => new Set(p).add(inline.slug));
      setVoltooidIds((p) => new Set(p).add(taak.id));
      toast.success("Bewaard (preview — niet opgeslagen)");
      return;
    }
    setBezigInlineSlugs((p) => new Set(p).add(inline.slug));
    try {
      const res = await fetch("/api/playbook/zin-bewaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: inline.slug,
          label: inline.label,
          waarde,
          bronDag: dag.nummer,
          bronTaak: taak.id,
          autoVink: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      setOpgeslagenSlugs((p) => new Set(p).add(inline.slug));
      setVoltooidIds((p) => new Set(p).add(taak.id));
      toast.success("Bewaard — terug te vinden op /mijn-zinnen");
    } catch (e) {
      toast.error("Verbindingsfout");
    } finally {
      setBezigInlineSlugs((p) => {
        const n = new Set(p);
        n.delete(inline.slug);
        return n;
      });
    }
  }

  // ============================================================
  // FOUNDER-EDIT — inline tekst bewerken op de tile zelf.
  // Geen aparte editor-pagina nodig.
  // ============================================================

  function startBewerken(veld: BewerktVeld) {
    if (!veld) return;
    setBewerktVeld(veld);
    if (veld === "titel") setBewerkBuffer(actueleTekst.titel);
    else if (veld === "watJeLeert") {
      setBewerkBuffer(actueleTekst.watJeLeert);
      setTeachingUitgeklapt(true); // Volledige tekst tijdens bewerken
    } else if (veld === "faseDoel") setBewerkBuffer(actueleTekst.faseDoel);
    else if (veld === "waarom") {
      setBewerkBuffer(actueleTekst.waaromTekst);
      setBewerkBronBuffer(actueleTekst.waaromBron);
    }
  }

  function annuleerBewerken() {
    setBewerktVeld(null);
    setBewerkBuffer("");
    setBewerkBronBuffer("");
  }

  async function bewaarBewerken() {
    if (!bewerktVeld) return;
    setBewerkBezig(true);
    try {
      // Body opbouwen: alleen het ene veld dat we updaten
      const body: Record<string, unknown> = { dagNummer: dag.nummer };
      const nieuweWaardes = { ...actueleTekst };
      if (bewerktVeld === "titel") {
        body.titel = bewerkBuffer;
        nieuweWaardes.titel = bewerkBuffer.trim() || dag.titel;
      } else if (bewerktVeld === "watJeLeert") {
        body.watJeLeert = bewerkBuffer;
        nieuweWaardes.watJeLeert = bewerkBuffer.trim() || dag.watJeLeert;
      } else if (bewerktVeld === "faseDoel") {
        body.faseDoel = bewerkBuffer;
        nieuweWaardes.faseDoel = bewerkBuffer.trim() || dag.faseDoel;
      } else if (bewerktVeld === "waarom") {
        body.waaromWerktDitTekst = bewerkBuffer;
        body.waaromWerktDitBron = bewerkBronBuffer;
        nieuweWaardes.waaromTekst =
          bewerkBuffer.trim() || (dag.waaromWerktDit?.tekst ?? "");
        nieuweWaardes.waaromBron =
          bewerkBronBuffer.trim() || (dag.waaromWerktDit?.bron ?? "");
      }

      const res = await fetch("/api/playbook/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      // Lokale state updaten zodat UI direct aanpassingen toont
      setActueleTekst(nieuweWaardes);
      setBewerktVeld(null);
      setBewerkBuffer("");
      setBewerkBronBuffer("");
      toast.success("✍️ Bewaard — direct zichtbaar voor alle members");
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBewerkBezig(false);
    }
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

  /**
   * Bouwt een href voor een waarInEleva-item, en plakt eventueel een
   * prefill-template op de URL ({slug} → opgeslagen waarde uit
   * inlineWaardes, of "[hier je zin]" als nog niet ingevuld).
   *
   * Voor /coach-routes met prefill voegen we ook `submit=1` toe zodat de
   * mentor de vraag direct als user-bericht verstuurt — de member landt
   * dan op het juiste chat-scherm met zijn vraag al als gouden bubbel
   * en de mentor begint meteen te antwoorden. Géén extra klik nodig.
   *
   * Als de prefill nog placeholders bevat ([hier je zin]) submitten we
   * NIET automatisch — de member moet dan eerst zelf invullen.
   */
  function bouwElevaPadHref(p: {
    route?: string;
    prefillTemplate?: string;
  }): string | null {
    if (!p.route) return null;
    if (isExtern(p.route)) return p.route;
    const sep = p.route.includes("?") ? "&" : "?";
    let qs = `van=playbook&dag=${dag.nummer}`;
    if (p.prefillTemplate) {
      let bevatPlaceholder = false;
      const ingevuld = p.prefillTemplate.replace(
        /\{([a-z0-9-]+)\}/gi,
        (_m, slug) => {
          const w = (inlineWaardes[slug] || "").trim();
          if (!w) bevatPlaceholder = true;
          return w || "[hier je zin]";
        },
      );
      qs += `&prefill=${encodeURIComponent(ingevuld)}`;
      if (p.route.startsWith("/coach") && !bevatPlaceholder) {
        qs += `&submit=1`;
      }
    }
    return `${p.route}${sep}${qs}`;
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
          <div className="flex-1 min-w-0">
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Dag {dag.nummer} · Fase {dag.fase}
            </p>
            {bewerktVeld === "titel" ? (
              <FounderEdit
                value={bewerkBuffer}
                onChange={setBewerkBuffer}
                onBewaar={bewaarBewerken}
                onAnnuleer={annuleerBewerken}
                bezig={bewerkBezig}
                rows={1}
              />
            ) : (
              <h2 className="text-cm-white font-display font-bold text-lg mt-0.5 inline-flex items-baseline gap-2 flex-wrap">
                {actueleTekst.titel}
                {isFounder && bewerktVeld === null && (
                  <FounderEditKnop
                    onClick={() => startBewerken("titel")}
                  />
                )}
              </h2>
            )}
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
          {/* NIET-actieve tab pulseert subtiel om aan te geven 'hier zit
              ook content'. User-feedback: anders vergeten members om de
              andere tab te lezen / af te vinken. */}
          <button
            role="tab"
            aria-selected={actieveTab === "doen"}
            onClick={() => setActieveTab("doen")}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              actieveTab === "doen"
                ? "border-cm-gold text-cm-gold"
                : "border-transparent text-cm-white opacity-60 hover:opacity-100 animate-pulse"
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
                : "border-transparent text-cm-white opacity-60 hover:opacity-100 animate-pulse"
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
                          {taak.inlineActie && (
                            <button
                              type="button"
                              onClick={() => toggleInline(taak.id)}
                              className="text-xs text-cm-gold underline-offset-2 hover:underline"
                            >
                              {openInlines.has(taak.id)
                                ? "▴ Inklappen"
                                : opgeslagenSlugs.has(taak.inlineActie.slug)
                                ? "✏️ Bewerken"
                                : "✏️ Schrijf hier direct"}
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
                        {taak.inlineActie && openInlines.has(taak.id) && (
                          <div className="mt-3 rounded-lg border border-cm-gold/30 bg-cm-black/40 p-3 space-y-2">
                            {taak.inlineActie.instructie && (
                              <p className="text-xs text-cm-white opacity-80 leading-relaxed">
                                {taak.inlineActie.instructie}
                              </p>
                            )}
                            <textarea
                              value={
                                inlineWaardes[taak.inlineActie.slug] ?? ""
                              }
                              onChange={(e) => {
                                const slug = taak.inlineActie!.slug;
                                const v = e.target.value;
                                setInlineWaardes((prev) => ({
                                  ...prev,
                                  [slug]: v,
                                }));
                              }}
                              maxLength={
                                taak.inlineActie.maxTekens ?? 500
                              }
                              placeholder={taak.inlineActie.placeholder}
                              className="textarea-cm w-full text-sm"
                              rows={3}
                            />
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-xs text-cm-white opacity-50">
                                {(inlineWaardes[taak.inlineActie.slug] || "")
                                  .length}{" "}
                                / {taak.inlineActie.maxTekens ?? 500}
                              </p>
                              <button
                                type="button"
                                onClick={() => bewaarInline(taak)}
                                disabled={bezigInlineSlugs.has(
                                  taak.inlineActie.slug,
                                )}
                                className="btn-gold text-xs disabled:opacity-50"
                              >
                                {bezigInlineSlugs.has(taak.inlineActie.slug)
                                  ? "Bewaren..."
                                  : opgeslagenSlugs.has(
                                        taak.inlineActie.slug,
                                      )
                                    ? "Wijzigingen bewaren"
                                    : "Bewaar"}
                              </button>
                            </div>
                            {taak.inlineActie.voorbeeld && (
                              <p className="text-xs text-cm-white opacity-60 italic leading-relaxed border-t border-cm-border pt-2">
                                <strong className="not-italic text-cm-gold">
                                  Voorbeeld:
                                </strong>{" "}
                                {taak.inlineActie.voorbeeld}
                              </p>
                            )}
                            {opgeslagenSlugs.has(taak.inlineActie.slug) && (
                              <p className="text-xs text-emerald-400">
                                ✓ Opgeslagen — terug te vinden op{" "}
                                <a
                                  href="/mijn-zinnen"
                                  className="underline-offset-2 hover:underline"
                                >
                                  /mijn-zinnen
                                </a>
                              </p>
                            )}
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
                  {dag.waarInEleva.map((p, i) => {
                    const href = bouwElevaPadHref(p);
                    const extern = !!p.route && isExtern(p.route);
                    return (
                    <li key={i} className="text-cm-white text-xs space-y-1">
                      <div className="flex items-start gap-2 flex-wrap">
                        <strong className="font-medium">{p.actie}</strong>
                        {href && (
                          <a
                            href={href}
                            target={extern ? "_blank" : undefined}
                            rel={extern ? "noopener noreferrer" : undefined}
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
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Fase-doel */}
            <div className="border-t border-cm-border pt-3 text-xs text-cm-white opacity-80">
              {bewerktVeld === "faseDoel" ? (
                <div>
                  <p className="text-cm-gold font-semibold mb-1">
                    🎯 Fase-doel
                  </p>
                  <FounderEdit
                    value={bewerkBuffer}
                    onChange={setBewerkBuffer}
                    onBewaar={bewaarBewerken}
                    onAnnuleer={annuleerBewerken}
                    bezig={bewerkBezig}
                    rows={3}
                  />
                </div>
              ) : (
                <p className="inline-flex items-baseline gap-2 flex-wrap">
                  <strong className="text-cm-gold">🎯 Fase-doel:</strong>{" "}
                  <span>{actueleTekst.faseDoel}</span>
                  {isFounder && bewerktVeld === null && (
                    <FounderEditKnop
                      onClick={() => startBewerken("faseDoel")}
                    />
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* LEREN-tab */}
        {actieveTab === "leren" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <h3 className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                  📚 Wat je vandaag leert
                </h3>
                {isFounder &&
                  bewerktVeld === null &&
                  bewerktVeld !== "watJeLeert" && (
                    <FounderEditKnop
                      onClick={() => startBewerken("watJeLeert")}
                    />
                  )}
              </div>
              {bewerktVeld === "watJeLeert" ? (
                <FounderEdit
                  value={bewerkBuffer}
                  onChange={setBewerkBuffer}
                  onBewaar={bewaarBewerken}
                  onAnnuleer={annuleerBewerken}
                  bezig={bewerkBezig}
                  rows={20}
                />
              ) : (
                <>
                  <div className="text-cm-white text-sm leading-relaxed whitespace-pre-line">
                    {teachingUitgeklapt || !teachingHeeftMeer
                      ? actueleTekst.watJeLeert
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
                </>
              )}
            </div>

            <div className="border-t border-cm-border pt-3 text-xs text-cm-white opacity-80">
              {bewerktVeld === "waarom" ? (
                <div className="rounded-lg border-2 border-cm-gold/60 bg-cm-gold/[0.04] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold">
                      ✍️ Founder-modus
                    </span>
                    <span className="text-xs text-cm-white opacity-70">
                      Wijziging is direct zichtbaar voor{" "}
                      <strong>alle members</strong>
                    </span>
                  </div>
                  <p className="text-cm-gold font-semibold text-sm">
                    🌱 Waarom dit werkt
                  </p>
                  <textarea
                    value={bewerkBuffer}
                    onChange={(e) => setBewerkBuffer(e.target.value)}
                    className="textarea-cm w-full text-sm leading-relaxed"
                    rows={3}
                    placeholder="Quote / inzicht"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={bewerkBronBuffer}
                    onChange={(e) => setBewerkBronBuffer(e.target.value)}
                    className="input-cm w-full text-sm"
                    placeholder="Bron (bv. Eric Worre, Go Pro) — optioneel"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={bewaarBewerken}
                      disabled={bewerkBezig}
                      className="btn-gold text-xs disabled:opacity-50"
                    >
                      {bewerkBezig
                        ? "Bewaren..."
                        : "Bewaar voor alle members"}
                    </button>
                    <button
                      type="button"
                      onClick={annuleerBewerken}
                      disabled={bewerkBezig}
                      className="text-xs text-cm-white opacity-70 hover:opacity-100"
                    >
                      Annuleer
                    </button>
                  </div>
                </div>
              ) : (
                <p className="italic leading-relaxed inline-flex items-baseline gap-2 flex-wrap">
                  <strong className="text-cm-gold not-italic">
                    🌱 Waarom dit werkt:
                  </strong>{" "}
                  <span>
                    {actueleTekst.waaromTekst}
                    {actueleTekst.waaromBron && (
                      <span className="opacity-70">
                        {" "}
                        — {actueleTekst.waaromBron}
                      </span>
                    )}
                  </span>
                  {isFounder && bewerktVeld === null && (
                    <FounderEditKnop
                      onClick={() => startBewerken("waarom")}
                    />
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Sub-componenten voor founder-inline-edit. Klein gehouden zodat de
// hoofdcomponent niet 800 regels lang wordt.
// ============================================================

function FounderEditKnop({ onClick }: { onClick: () => void }) {
  // Duidelijk gouden pill met ✍️-label zodat de founder altijd ziet:
  // "dit gaat voor IEDEREEN, niet alleen voor mij". Onderscheidt zich
  // van persoonlijke 'Schrijf hier direct'-knoppen.
  return (
    <button
      type="button"
      onClick={onClick}
      title="Founder-bewerken — wijzigingen gaan LIVE voor alle members"
      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-cm-gold/60 text-cm-gold bg-cm-gold/5 hover:bg-cm-gold/15 hover:border-cm-gold transition-colors font-semibold whitespace-nowrap"
    >
      ✍️ Bewerk voor iedereen
    </button>
  );
}

function FounderEdit({
  value,
  onChange,
  onBewaar,
  onAnnuleer,
  bezig,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  onBewaar: () => void;
  onAnnuleer: () => void;
  bezig: boolean;
  rows?: number;
}) {
  // Bewerk-veld krijgt een duidelijke gouden rand + 'FOUNDER-MODUS'-tag
  // zodat het visueel anders is dan persoonlijke invulvelden ('Mijn
  // zinnen' etc.). De Bewaar-knop heet expliciet 'Bewaar voor alle
  // members' om geen twijfel te laten over de scope.
  return (
    <div className="rounded-lg border-2 border-cm-gold/60 bg-cm-gold/[0.04] p-3 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold">
          ✍️ Founder-modus
        </span>
        <span className="text-xs text-cm-white opacity-70">
          Wijziging is direct zichtbaar voor <strong>alle members</strong>
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="textarea-cm w-full text-sm leading-relaxed"
        rows={rows}
        autoFocus
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onBewaar}
          disabled={bezig}
          className="btn-gold text-xs disabled:opacity-50"
        >
          {bezig ? "Bewaren..." : "Bewaar voor alle members"}
        </button>
        <button
          type="button"
          onClick={onAnnuleer}
          disabled={bezig}
          className="text-xs text-cm-white opacity-70 hover:opacity-100"
        >
          Annuleer
        </button>
      </div>
    </div>
  );
}
