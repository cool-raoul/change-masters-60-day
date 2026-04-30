"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { HerinnerLaterKnop } from "@/components/playbook/HerinnerLaterKnop";
import { VCardUploader } from "@/components/vandaag/inline-embeds/VCardUploader";
import { SponsorMeldingKnop } from "@/components/vandaag/inline-embeds/SponsorMeldingKnop";
import type { Dag, ControllableTaak } from "@/lib/playbook/types";

// localStorage-key zodat we bij terugkeer (van een actieRoute) op de
// juiste taak landen, niet weer in de intro-stap.
const flowPositieKey = (dagNummer: number) =>
  `eleva-vandaag-flow-positie-dag${dagNummer}-${new Date().toISOString().split("T")[0]}`;

function isMobielApparaat(): boolean {
  if (typeof navigator === "undefined") return false;
  // Pragmatische check — voor de "doe dit op je telefoon"-waarschuwing
  // is een UA-sniff goed genoeg (geen security-kritisch beslismoment).
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

// ============================================================
// VandaagFlow — guided full-screen flow voor één playbook-dag.
//
// Net als de onboarding: stap voor stap, één taak per scherm, met
// duidelijke "Klaar"- en "Sla over"-knoppen. Aan het einde een
// viering en directe link terug naar het dashboard.
//
// Layout: minimal, geen sidebar, geen AppShell — pure focus.
// Bovenaan een terug-knop + dag-progress.
// ============================================================

type Props = {
  dag: Dag;
  voltooidIds: string[];
  initialZinnen: Record<string, string>;
  voornaam: string;
};

const DAG_GROETEN: Record<number, string> = {
  1: "🚀 Daar ga je! Je eerste dag",
  7: "🎉 Week 1 zit erop — top dat je doorzet!",
  8: "💪 Fase 2! Tijd om door te pakken",
  14: "🏁 Halverwege — je hoort bij de 20% die doorzet",
  15: "⏱️ Fase 3 begint nu",
  21: "🏆 Laatste dag van fase 3 — klaar voor de echte run",
};

export function VandaagFlow({
  dag,
  voltooidIds: initialVoltooid,
  initialZinnen,
  voornaam,
}: Props) {
  const router = useRouter();
  const [voltooidIds, setVoltooidIds] = useState<Set<string>>(
    new Set(initialVoltooid),
  );
  const [bezigIds, setBezigIds] = useState<Set<string>>(new Set());
  const [stap, setStap] = useState<"intro" | "taak" | "klaar">("intro");
  const [taakIndex, setTaakIndex] = useState(0);
  const [inlineWaardes, setInlineWaardes] =
    useState<Record<string, string>>(initialZinnen);
  const [bezigInline, setBezigInline] = useState(false);
  const [isMobiel, setIsMobiel] = useState<boolean>(true); // pessimistisch: behandel als mobiel tot we zekerheid hebben

  // Bij mount: detecteer mobiel/desktop + herstel positie als de member
  // net terugkomt van een actieRoute (bv. /namenlijst → /vandaag).
  useEffect(() => {
    setIsMobiel(isMobielApparaat());
    try {
      const opgeslagen = window.localStorage.getItem(flowPositieKey(dag.nummer));
      if (opgeslagen) {
        const { stap: opgeslagenStap, taakIndex: opgeslagenIndex } = JSON.parse(
          opgeslagen,
        ) as { stap: "intro" | "taak" | "klaar"; taakIndex: number };
        if (opgeslagenStap === "taak" && opgeslagenIndex >= 0 && opgeslagenIndex < taken.length) {
          setStap("taak");
          setTaakIndex(opgeslagenIndex);
        }
      }
    } catch {
      // negeer
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bewaar positie elke keer dat 'ie verandert — zodat terugkomst de
  // juiste taak-stap herstelt.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        flowPositieKey(dag.nummer),
        JSON.stringify({ stap, taakIndex }),
      );
    } catch {
      // negeer
    }
  }, [stap, taakIndex, dag.nummer]);

  const taken = dag.vandaagDoen;
  const totaal = taken.length;
  const huidigeTaak: ControllableTaak | undefined = taken[taakIndex];
  const aantalVoltooid = taken.filter((t) => voltooidIds.has(t.id)).length;
  const procent = totaal === 0 ? 0 : Math.round((aantalVoltooid / totaal) * 100);

  const groet =
    DAG_GROETEN[dag.nummer] ||
    `☀️ Goedemorgen${voornaam ? ` ${voornaam}` : ""}!`;

  async function vinkAf(taakId: string, nieuwVoltooid: boolean) {
    if (bezigIds.has(taakId)) return;
    setBezigIds((p) => new Set(p).add(taakId));
    setVoltooidIds((p) => {
      const n = new Set(p);
      if (nieuwVoltooid) n.add(taakId);
      else n.delete(taakId);
      return n;
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
        // Roll back
        setVoltooidIds((p) => {
          const n = new Set(p);
          if (nieuwVoltooid) n.delete(taakId);
          else n.add(taakId);
          return n;
        });
        toast.error("Opslaan mislukt");
      }
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezigIds((p) => {
        const n = new Set(p);
        n.delete(taakId);
        return n;
      });
    }
  }

  async function bewaarInline(taak: ControllableTaak) {
    const inline = taak.inlineActie;
    if (!inline) return;
    const waarde = (inlineWaardes[inline.slug] || "").trim();
    if (!waarde) {
      toast.error("Schrijf eerst iets om te bewaren");
      return;
    }
    setBezigInline(true);
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
      setVoltooidIds((p) => new Set(p).add(taak.id));
      toast.success("Bewaard — terug te vinden op /mijn-zinnen");
      // Door naar volgende stap
      gaNaarVolgende();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezigInline(false);
    }
  }

  function gaNaarVolgende() {
    if (taakIndex < totaal - 1) {
      setTaakIndex((i) => i + 1);
    } else {
      setStap("klaar");
    }
  }

  function gaNaarVorige() {
    if (taakIndex > 0) {
      setTaakIndex((i) => i - 1);
    } else {
      setStap("intro");
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-cm-bg overflow-y-auto">
      {/* Top-bar: voortgang + sluit-knop */}
      <header className="sticky top-0 z-30 border-b border-cm-border bg-cm-bg/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
          >
            ← Dashboard
          </Link>
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1 h-1.5 bg-cm-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-cm-gold rounded-full transition-all"
                style={{ width: `${procent}%` }}
              />
            </div>
            <span className="text-cm-white text-xs whitespace-nowrap">
              {aantalVoltooid}/{totaal}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* INTRO-stap */}
        {stap === "intro" && (
          <div className="space-y-6">
            <div className="text-center space-y-2 pt-4">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                Dag {dag.nummer} · Fase {dag.fase}
              </p>
              <h1 className="text-3xl font-display font-bold text-cm-white leading-tight">
                {groet}
              </h1>
              <p className="text-cm-white opacity-80 text-base mt-3 leading-relaxed">
                Vandaag staat in het teken van:
              </p>
              <h2 className="text-cm-gold font-display font-semibold text-xl">
                {dag.titel}
              </h2>
            </div>

            {/* 1. EERST DE LES — volledig, geen afkapping. */}
            <div className="card border-l-4 border-cm-gold/60 space-y-2">
              <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
                📖 Les van vandaag
              </h3>
              <p className="text-cm-white text-sm leading-relaxed whitespace-pre-line">
                {dag.watJeLeert}
              </p>
            </div>

            {/* 2. DAARNA HET FILMPJE — alleen zichtbaar als de founder via
                /instellingen/films onder slug 'playbook-dag-N' een film
                heeft gezet. Anders rendert FilmInBlok niets. */}
            <FilmInBlok
              slug={`playbook-dag-${dag.nummer}`}
              verbergZonderFilm
            />

            {/* 3. DAN GA JE DOEN — kort overzicht van de stappen. */}
            <div className="card space-y-2">
              <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
                ✅ Nu ga je doen ({totaal} stap{totaal === 1 ? "" : "pen"})
              </h3>
              <ul className="space-y-1.5 text-sm text-cm-white">
                {taken.map((t, i) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <span className="text-cm-gold flex-shrink-0">{i + 1}.</span>
                    <span
                      className={
                        voltooidIds.has(t.id)
                          ? "line-through opacity-50"
                          : ""
                      }
                    >
                      {t.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setStap("taak")}
              className="btn-gold w-full py-4 text-base font-bold"
            >
              {aantalVoltooid > 0
                ? "Door naar je volgende stap →"
                : "Begin met stap 1 →"}
            </button>

            {/* Snooze: herinner me later vandaag */}
            <div className="flex justify-center pt-1">
              <HerinnerLaterKnop
                dagNummer={dag.nummer}
                variant="tekstlink"
                label="Even niet nu — herinner me later vandaag"
              />
            </div>
          </div>
        )}

        {/* TAAK-stap */}
        {stap === "taak" && huidigeTaak && (
          <div className="space-y-6">
            <div>
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                Stap {taakIndex + 1} van {totaal}
              </p>
              <h2 className="text-2xl font-display font-bold text-cm-white mt-1 leading-tight">
                {huidigeTaak.label}
              </h2>
              {huidigeTaak.uitleg && (
                <p className="text-cm-white opacity-80 text-sm mt-3 leading-relaxed">
                  {huidigeTaak.uitleg}
                </p>
              )}
            </div>

            {/* Optionele film */}
            {huidigeTaak.filmSlug && (
              <FilmInBlok
                slug={huidigeTaak.filmSlug}
                fallbackTitel="📹 Bekijk de video"
                fallbackTekst="Film volgt — wordt door de hoofdbeheerder toegevoegd."
              />
            )}

            {/* Mobiel-waarschuwing: deze taak vraagt om je telefoon.
                Toon alleen als de taak GEEN inline-embed heeft (als wel:
                de embed laat zelf z'n .vcf-uploader zien, ook op desktop). */}
            {huidigeTaak.vereistMobiel &&
              !isMobiel &&
              !huidigeTaak.inlineEmbed && (
                <div className="rounded-lg border-2 border-amber-500/60 bg-amber-900/20 px-4 py-3 space-y-2">
                  <p className="text-amber-200 text-sm font-semibold flex items-center gap-2">
                    📱 Doe deze stap op je telefoon
                  </p>
                  <p className="text-cm-white opacity-90 text-xs leading-relaxed">
                    Open ELEVA op je telefoon — je hebt 'm nodig om je
                    contacten te exporteren. Je dag-flow loopt daar gewoon door.
                  </p>
                </div>
              )}

            {/* INLINE EMBED — voer de actie HIER uit, geen wegnavigeren. */}
            {huidigeTaak.inlineEmbed === "vcard-upload" && (
              <VCardUploader
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                opVoltooid={() => {
                  vinkAf(huidigeTaak.id, true);
                }}
              />
            )}
            {huidigeTaak.inlineEmbed === "sponsor-melding" && (
              <SponsorMeldingKnop
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                opVoltooid={() => {
                  vinkAf(huidigeTaak.id, true);
                }}
              />
            )}

            {/* Optionele actie-route — alleen als er geen inline-embed is
                en het geen mobiel-only taak op desktop is. */}
            {huidigeTaak.actieRoute &&
              !huidigeTaak.inlineEmbed &&
              !(huidigeTaak.vereistMobiel && !isMobiel) && (
                <a
                  href={
                    /^https?:\/\//i.test(huidigeTaak.actieRoute)
                      ? huidigeTaak.actieRoute
                      : `${huidigeTaak.actieRoute}${huidigeTaak.actieRoute.includes("?") ? "&" : "?"}van=vandaag&dag=${dag.nummer}`
                  }
                  target={
                    /^https?:\/\//i.test(huidigeTaak.actieRoute)
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    /^https?:\/\//i.test(huidigeTaak.actieRoute)
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="btn-secondary w-full py-3 text-center text-sm font-semibold inline-block"
                >
                  {/^https?:\/\//i.test(huidigeTaak.actieRoute)
                    ? "Open in nieuwe tab ↗"
                    : "Open deze plek →"}
                </a>
              )}

            {/* Inline-actie (schrijf je zin direct) */}
            {huidigeTaak.inlineActie && (
              <div className="card border-l-4 border-cm-gold/60 space-y-3">
                <h3 className="text-cm-gold font-semibold text-sm flex items-center gap-2">
                  ✏️ Schrijf hier direct je {huidigeTaak.inlineActie.label.toLowerCase()}
                </h3>
                {huidigeTaak.inlineActie.instructie && (
                  <p className="text-cm-white opacity-80 text-xs leading-relaxed">
                    {huidigeTaak.inlineActie.instructie}
                  </p>
                )}
                <textarea
                  value={inlineWaardes[huidigeTaak.inlineActie.slug] ?? ""}
                  onChange={(e) => {
                    const slug = huidigeTaak.inlineActie!.slug;
                    setInlineWaardes((p) => ({ ...p, [slug]: e.target.value }));
                  }}
                  maxLength={huidigeTaak.inlineActie.maxTekens ?? 500}
                  placeholder={huidigeTaak.inlineActie.placeholder}
                  className="textarea-cm w-full text-sm leading-relaxed"
                  rows={4}
                />
                {huidigeTaak.inlineActie.voorbeeld && (
                  <p className="text-cm-white opacity-60 text-xs italic leading-relaxed border-t border-cm-border pt-2">
                    <strong className="not-italic text-cm-gold">
                      Voorbeeld:
                    </strong>{" "}
                    {huidigeTaak.inlineActie.voorbeeld}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => bewaarInline(huidigeTaak)}
                  disabled={bezigInline}
                  className="btn-gold text-sm disabled:opacity-50"
                >
                  {bezigInline ? "Bewaren..." : "Bewaar — door naar volgende"}
                </button>
              </div>
            )}

            {/* Hoofd-actie-knoppen */}
            <div className="space-y-3 pt-2">
              {!voltooidIds.has(huidigeTaak.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    vinkAf(huidigeTaak.id, true);
                    setTimeout(() => gaNaarVolgende(), 250);
                  }}
                  disabled={bezigIds.has(huidigeTaak.id)}
                  className="btn-gold w-full py-4 text-base font-bold disabled:opacity-50"
                >
                  ✓ Klaar — door naar
                  {taakIndex < totaal - 1 ? " volgende stap" : " afronding"} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={gaNaarVolgende}
                  className="btn-gold w-full py-4 text-base font-bold"
                >
                  Door naar
                  {taakIndex < totaal - 1 ? " volgende stap" : " afronding"} →
                </button>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={gaNaarVorige}
                  className="text-cm-white opacity-60 hover:opacity-100 text-sm"
                >
                  ← Vorige
                </button>
                <span className="flex-1" />
                {!voltooidIds.has(huidigeTaak.id) && (
                  <button
                    type="button"
                    onClick={gaNaarVolgende}
                    className="text-cm-white opacity-60 hover:opacity-100 text-sm"
                  >
                    Sla over →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AFRONDING */}
        {stap === "klaar" && (
          <div className="space-y-6 pt-8 text-center">
            <div className="text-7xl">{aantalVoltooid === totaal ? "🎉" : "💪"}</div>
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-cm-white leading-tight">
                {aantalVoltooid === totaal
                  ? `Top, je hebt het! 🚀`
                  : `Goed bezig${voornaam ? `, ${voornaam}` : ""}!`}
              </h1>
              <p className="text-cm-white opacity-80 text-base leading-relaxed">
                {aantalVoltooid === totaal
                  ? `Alle stappen van dag ${dag.nummer} zijn klaar. Morgen verder met dag ${dag.nummer + 1} — je krijgt een vriendelijke push.`
                  : `Je hebt ${aantalVoltooid} van de ${totaal} stappen gedaan. Wat niet lukte staat klaar voor morgen — kom gerust later vandaag terug.`}
              </p>
            </div>

            {/* Snel overzicht status */}
            <div className="card text-left space-y-2">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                Je voortgang vandaag
              </p>
              <ul className="space-y-1.5 text-sm">
                {taken.map((t, i) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <span
                      className={
                        voltooidIds.has(t.id)
                          ? "text-emerald-400 flex-shrink-0"
                          : "text-cm-white opacity-40 flex-shrink-0"
                      }
                    >
                      {voltooidIds.has(t.id) ? "✓" : `${i + 1}.`}
                    </span>
                    <span
                      className={
                        voltooidIds.has(t.id)
                          ? "text-cm-white opacity-60"
                          : "text-cm-white"
                      }
                    >
                      {t.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="btn-gold w-full py-4 text-base font-bold inline-block"
              onClick={() => {
                // Markeer dat de flow gesloten is — niet meer auto-open
                // bij volgende dashboard-bezoek. En wis de positie zodat
                // een volgende keer netjes bij intro begint.
                try {
                  const k = `eleva-vandaag-flow-dag${dag.nummer}-${new Date().toISOString().split("T")[0]}`;
                  window.localStorage.setItem(k, "gesloten");
                  window.localStorage.removeItem(flowPositieKey(dag.nummer));
                } catch {
                  // ignore
                }
              }}
            >
              Naar dashboard →
            </Link>

            {/* Niet alles afgerond? Snooze de open stappen naar later vandaag. */}
            {aantalVoltooid < totaal && (
              <div className="flex justify-center pt-1">
                <HerinnerLaterKnop
                  dagNummer={dag.nummer}
                  variant="tekstlink"
                  label="Herinner me later vandaag aan de rest"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                router.refresh();
                setStap("intro");
                setTaakIndex(0);
              }}
              className="text-cm-white opacity-50 hover:opacity-80 text-xs"
            >
              ← Terug naar het begin van vandaag
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
