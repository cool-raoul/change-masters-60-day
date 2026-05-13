"use client";

import { celebrate } from "@/lib/celebrate";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { UitnodigHelpKnoppen } from "@/components/vandaag/UitnodigHelpKnoppen";
import { SocialPlatformKnoppen } from "@/components/vandaag/SocialPlatformKnoppen";
import { HerinnerLaterKnop } from "@/components/playbook/HerinnerLaterKnop";
import { VCardUploader } from "@/components/vandaag/inline-embeds/VCardUploader";
import { SponsorMeldingKnop } from "@/components/vandaag/inline-embeds/SponsorMeldingKnop";
import { NamenForm } from "@/components/vandaag/inline-embeds/NamenForm";
import { pakDagdeelGroetMetNaam } from "@/lib/util/dagdeel-groet";
import type { Dag, ControllableTaak } from "@/lib/playbook/types";
import {
  EditModeProvider,
  useEditModus,
} from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { TesterToolbar } from "@/components/tester/TesterToolbar";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";

// localStorage-key zodat we bij terugkeer (van een actieRoute) op de
// juiste taak landen, niet weer in de intro-stap.
const flowPositieKey = (dagNummer: number) =>
  `eleva-vandaag-flow-positie-dag${dagNummer}-${new Date().toISOString().split("T")[0]}`;

function isMobielApparaat(): boolean {
  if (typeof navigator === "undefined") return false;
  // Pragmatische check, voor de "doe dit op je telefoon"-waarschuwing
  // is een UA-sniff goed genoeg (geen security-kritisch beslismoment).
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

// ============================================================
// VandaagFlow, guided full-screen flow voor één playbook-dag.
//
// Net als de onboarding: stap voor stap, één taak per scherm, met
// duidelijke "Klaar"- en "Sla over"-knoppen. Aan het einde een
// viering en directe link terug naar het dashboard.
//
// Layout: minimal, geen sidebar, geen AppShell, pure focus.
// Bovenaan een terug-knop + dag-progress.
// ============================================================

type Props = {
  dag: Dag;
  voltooidIds: string[];
  initialZinnen: Record<string, string>;
  voornaam: string;
  /** Toont de founder-bewerk-banner bovenaan de flow als true. */
  isFounder?: boolean;
  /** Per-namespace tekst-overrides geladen op de server. */
  uiOverrides?: Record<string, string>;
  groetOverrides?: Record<string, string>;
  /** Media-blokken per positie (boven-titel, boven-les, etc.). */
  paginaBlokken?: Record<string, Blok[]>;
};

const DAG_GROETEN: Record<number, string> = {
  1: "🚀 Daar ga je! Je eerste dag",
  7: "🎉 Week 1 zit erop, top dat je doorzet!",
  8: "💪 Week 2! Tijd om door te pakken",
  14: "🏁 Halverwege, je hoort bij de 20% die doorzet",
  15: "⏱️ Week 3 begint nu",
  21: "🏆 Laatste dag van week 3, klaar voor de echte run",
};

// Tijd-afhankelijke begroeting komt uit lib/util/dagdeel-groet.ts
// (zelfde logica voor server- en client-rendering).

export function VandaagFlow(props: Props) {
  // EditModeProvider om de hele flow zodat <EditableTekst editModusAan>
  // (via useEditModus()) reageert op de toggle bovenin.
  return (
    <EditModeProvider>
      <VandaagFlowInner {...props} />
    </EditModeProvider>
  );
}

function VandaagFlowInner({
  dag,
  voltooidIds: initialVoltooid,
  initialZinnen,
  voornaam,
  isFounder = false,
  uiOverrides = {},
  groetOverrides = {},
  paginaBlokken = {},
}: Props) {
  const { editModusAan } = useEditModus();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Welkomstbanner-flag: TRUE wanneer iemand net via de onboarding-
  // finale knop naar /vandaag is geredirect. Vanaf onboarding/page.tsx
  // wordt ?via=onboarding meegegeven. We tonen 'm alleen één keer (in
  // de INTRO-stap), zodra de gebruiker doorklikt naar 'taak' verdwijnt
  // 'ie vanzelf met de stap-wissel.
  const komtVanOnboarding =
    dag.nummer === 1 && searchParams?.get("via") === "onboarding";
  const blokkenOpPositie = (positie: string): Blok[] =>
    paginaBlokken[positie] ?? [];
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

  // Bewaar positie elke keer dat 'ie verandert, zodat terugkomst de
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
    DAG_GROETEN[dag.nummer] || pakDagdeelGroetMetNaam(voornaam);

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
      toast.success("Bewaard, terug te vinden op /mijn-zinnen");
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

  // Bij overgang naar 'klaar' EN alle taken voltooid: groot vuurwerk.
  // Geen mini-confetti meer bij deels-voltooid (op verzoek Raoul:
  // celebrations alleen op echte mijlpalen, niet op halve dagen).
  useEffect(() => {
    if (stap !== "klaar") return;
    if (aantalVoltooid === totaal) {
      celebrate("groot");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stap]);

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
        {/* Founder-toolbar: dag-spring + edit-modus toggle. Geen aparte
            /playbook?preview-link meer nodig — bewerken kan direct hier. */}
        {isFounder && (
          <div className="space-y-2">
            <TesterToolbar huidigeDag={dag.nummer} urlModus="queryparam" />
            <EditModeToggle isFounder={isFounder} />
          </div>
        )}

        {/* INTRO-stap */}
        {stap === "intro" && (
          <div className="space-y-6">
            {/* Welkomstbanner: alleen als iemand net via onboarding
                hier is geland (?via=onboarding op dag 1). Maakt de
                continuiteit expliciet: 'je setup zit erop, dit is het
                vervolg van dag 1', zodat het niet voelt als 'een
                nieuwe dag begint'. Verdwijnt zodra je naar 'taak'
                doorklikt. */}
            {komtVanOnboarding && (
              <div className="rounded-xl border-2 border-cm-gold bg-gradient-to-br from-cm-gold/15 to-cm-gold/5 px-5 py-4 space-y-2 shadow-gold-lg animate-fade-in">
                <p className="text-cm-gold font-semibold text-sm flex items-center gap-2">
                  🎉 Te gek, je setup zit erop!
                </p>
                <p className="text-cm-white text-sm leading-relaxed opacity-90">
                  Dit is het vervolg van dag 1. Geen nieuwe dag, gewoon hetzelfde uur waarin je nu zit. Hieronder de laatste twee taken om je fundament écht neer te zetten: je eerste namen toevoegen en een berichtje naar je sponsor.
                </p>
              </div>
            )}

            {/* Media-blok positie 1: bovenaan, vóór dag-titel */}
            <MediaBlokken
              paginaNamespace="sprint-dag"
              paginaId={String(dag.nummer)}
              positie="boven-titel"
              blokken={blokkenOpPositie("boven-titel")}
              isFounder={isFounder}
            />
            <div className="text-center space-y-2 pt-4">
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                Dag {dag.nummer} · Fase {dag.fase}
              </p>
              {DAG_GROETEN[dag.nummer] ? (
                <EditableTekst
                  namespace="sprint-groet"
                  sleutel={`dag${dag.nummer}`}
                  standaard={DAG_GROETEN[dag.nummer]}
                  overrides={groetOverrides}
                  isFounder={isFounder}
                  editModusAan={editModusAan}
                  as="h1"
                  className="font-serif-warm text-3xl text-cm-white leading-tight"
                  hint="Speciale groet alleen op deze dag-nummer"
                />
              ) : (
                <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
                  {groet}
                </h1>
              )}
              <EditableTekst
                namespace="sprint-ui"
                sleutel="intro.in-het-teken-van"
                standaard="Vandaag staat in het teken van:"
                overrides={uiOverrides}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="p"
                className="text-cm-white/80 text-base mt-3 leading-relaxed"
                hint="Tekst boven de dag-titel, geldt voor ALLE 60 dagen"
              />
              <EditableTekst
                namespace="sprint-dag"
                sleutel={`dag${dag.nummer}.titel`}
                standaard={dag.titel}
                overrides={{}}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="h2"
                className="font-serif-warm text-cm-gold text-xl"
                hint={`Titel alleen voor dag ${dag.nummer}`}
              />
            </div>

            {/* 1. EERST HET FILMPJE (boven de tekst), alleen als founder
                via /instellingen/films onder slug 'playbook-dag-N' een
                film heeft gezet. Anders rendert FilmInBlok niets, en
                begint de pagina direct met de Les. Volgorde-besluit
                Raoul: filmpje altijd boven uitgebreide tekst zodat de
                visuele uitleg eerst is. */}
            <FilmInBlok
              slug={`playbook-dag-${dag.nummer}`}
              verbergZonderFilm
            />

            {/* Media-blok positie 2: net boven de les-card */}
            <MediaBlokken
              paginaNamespace="sprint-dag"
              paginaId={String(dag.nummer)}
              positie="boven-les"
              blokken={blokkenOpPositie("boven-les")}
              isFounder={isFounder}
            />

            {/* 2. DAN DE LES, volledig, geen afkapping. */}
            <div className="card border-l-4 border-cm-gold/60 space-y-2">
              <EditableTekst
                namespace="sprint-ui"
                sleutel="intro.les-header"
                standaard="📖 Les van vandaag"
                overrides={uiOverrides}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="h3"
                className="text-cm-gold font-semibold text-sm uppercase tracking-wider"
                hint="Header boven de les, geldt voor ALLE 60 dagen"
              />
              <EditableBlok
                namespace="sprint-dag"
                sleutel={`dag${dag.nummer}.watJeLeert`}
                standaard={dag.watJeLeert}
                overrides={{}}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="div"
                className="text-cm-white text-sm leading-relaxed whitespace-pre-line"
                rows={10}
                hint={`Les voor dag ${dag.nummer}`}
              />
            </div>

            {/* Media-blok positie 3: tussen les en taken-overzicht */}
            <MediaBlokken
              paginaNamespace="sprint-dag"
              paginaId={String(dag.nummer)}
              positie="tussen-les-taken"
              blokken={blokkenOpPositie("tussen-les-taken")}
              isFounder={isFounder}
            />

            {/* 3. DAN GA JE DOEN, kort overzicht van de stappen. */}
            <div className="card space-y-2">
              <EditableTekst
                namespace="sprint-ui"
                sleutel="intro.taken-header"
                standaard={`✅ Nu ga je doen (${totaal} stap${totaal === 1 ? "" : "pen"})`}
                overrides={uiOverrides}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="h3"
                className="text-cm-gold font-semibold text-sm uppercase tracking-wider"
                hint="Header boven de takenlijst, gedeeld over alle dagen"
              />
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
                      {/* Taak-label is in de overzichtslijst alleen lezen.
                          De échte EditableTekst voor het label staat in de
                          TAAK-stap zodat één edit-flow voor zowel overview
                          als taak-detail dezelfde sleutel gebruikt. */}
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
                label="Even niet nu, herinner me later vandaag"
              />
            </div>
          </div>
        )}

        {/* TAAK-stap */}
        {stap === "taak" && huidigeTaak && (
          <div className="space-y-6">
            {/* Label staat bovenaan, dan filmpje (als aanwezig), dan
                uitleg. Volgorde-besluit Raoul: filmpje altijd boven de
                uitgebreide tekst zodat de visuele uitleg eerst is. */}
            <div>
              <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                Stap {taakIndex + 1} van {totaal}
              </p>
              <EditableTekst
                namespace="sprint-dag"
                sleutel={`dag${dag.nummer}.taak.${huidigeTaak.id}.label`}
                standaard={huidigeTaak.label}
                overrides={{}}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="h2"
                className="font-serif-warm text-2xl text-cm-white mt-1 leading-tight"
                hint={`Taak-label, dag ${dag.nummer}, taak ${huidigeTaak.id}`}
              />
            </div>

            {/* Optionele film, BOVEN de uitleg */}
            {huidigeTaak.filmSlug && (
              <FilmInBlok
                slug={huidigeTaak.filmSlug}
                fallbackTitel="📹 Bekijk de video"
                fallbackTekst="Film volgt, wordt door de hoofdbeheerder toegevoegd."
              />
            )}

            {/* Media-blok positie 4: bij specifieke taak */}
            <MediaBlokken
              paginaNamespace="sprint-dag"
              paginaId={String(dag.nummer)}
              positie={`bij-taak.${huidigeTaak.id}`}
              blokken={blokkenOpPositie(`bij-taak.${huidigeTaak.id}`)}
              isFounder={isFounder}
            />

            {/* Uitleg, ONDER het filmpje */}
            {huidigeTaak.uitleg && (
              <EditableBlok
                namespace="sprint-dag"
                sleutel={`dag${dag.nummer}.taak.${huidigeTaak.id}.uitleg`}
                standaard={huidigeTaak.uitleg}
                overrides={{}}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="div"
                className="text-cm-white opacity-80 text-sm leading-relaxed whitespace-pre-line"
                rows={6}
                hint={`Taak-uitleg, dag ${dag.nummer}, taak ${huidigeTaak.id}`}
              />
            )}

            {/* Hulp-knoppen voor uitnodig-taken: voorbeelden, sponsor,
                Mentor. Trigger op uitnodigHelpKnoppen=true OF automatisch
                als de taak-id of label naar uitnodigen verwijst. */}
            {(huidigeTaak.uitnodigHelpKnoppen ||
              /invite|uitnodig/i.test(huidigeTaak.id) ||
              /uitnodig/i.test(huidigeTaak.label)) && (
              <UitnodigHelpKnoppen />
            )}

            {/* Social-platform-knoppen voor taken die naar Facebook /
                Instagram / LinkedIn verwijzen. Trigger op id-detectie
                (social, chat, dm) of label-detectie. */}
            {(/social|-chat|-dm|losse.chat/i.test(huidigeTaak.id) ||
              /Instagram|Facebook|LinkedIn|socials/.test(
                huidigeTaak.label,
              ) ||
              /Instagram|Facebook|LinkedIn/.test(huidigeTaak.uitleg ?? "")) && (
              <SocialPlatformKnoppen />
            )}

            {/* Mobiel-waarschuwing: deze taak vraagt om je telefoon.
                Toon alleen als de taak GEEN inline-embed heeft (als wel:
                de embed laat zelf z'n .vcf-uploader zien, ook op desktop). */}
            {huidigeTaak.vereistMobiel &&
              !isMobiel &&
              !huidigeTaak.inlineEmbed && (
                <div className="rounded-lg border-2 border-amber-500/60 bg-amber-900/20 px-4 py-3 space-y-2">
                  <EditableTekst
                    namespace="sprint-ui"
                    sleutel="taak.mobiel.titel"
                    standaard="📱 Doe deze stap op je telefoon"
                    overrides={uiOverrides}
                    isFounder={isFounder}
                    editModusAan={editModusAan}
                    as="p"
                    className="text-amber-200 text-sm font-semibold flex items-center gap-2"
                    hint="Titel van mobiel-waarschuwing, gedeeld over alle dagen"
                  />
                  <EditableBlok
                    namespace="sprint-ui"
                    sleutel="taak.mobiel.uitleg"
                    standaard="Open ELEVA op je telefoon, je hebt 'm nodig om je contacten te exporteren. Je dag-flow loopt daar gewoon door."
                    overrides={uiOverrides}
                    isFounder={isFounder}
                    editModusAan={editModusAan}
                    as="div"
                    className="text-cm-white opacity-90 text-xs leading-relaxed"
                    rows={3}
                    hint="Uitleg-tekst van mobiel-waarschuwing"
                  />
                </div>
              )}

            {/* INLINE EMBED, voer de actie HIER uit, geen wegnavigeren. */}
            {huidigeTaak.inlineEmbed === "vcard-upload" && (
              <VCardUploader
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                opVoltooid={() => {
                  vinkAf(huidigeTaak.id, true);
                }}
                opOpnieuw={() => {
                  vinkAf(huidigeTaak.id, false);
                }}
              />
            )}
            {huidigeTaak.inlineEmbed === "sponsor-melding" && (
              <SponsorMeldingKnop
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                taakId={huidigeTaak.id}
                opVoltooid={() => {
                  vinkAf(huidigeTaak.id, true);
                }}
              />
            )}
            {huidigeTaak.inlineEmbed === "namen-form" && (
              <NamenForm
                doel={huidigeTaak.inlineEmbedDoel ?? 5}
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                opVoltooid={() => {
                  vinkAf(huidigeTaak.id, true);
                }}
                opOpnieuw={() => {
                  vinkAf(huidigeTaak.id, false);
                }}
              />
            )}

            {/* Optionele actie-route, alleen als er geen inline-embed is
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
                  <EditableBlok
                    namespace="sprint-dag"
                    sleutel={`dag${dag.nummer}.taak.${huidigeTaak.id}.inlineActie.instructie`}
                    standaard={huidigeTaak.inlineActie.instructie}
                    overrides={{}}
                    isFounder={isFounder}
                    editModusAan={editModusAan}
                    as="div"
                    className="text-cm-white opacity-80 text-xs leading-relaxed"
                    rows={3}
                    hint={`Briefing boven invoerveld, dag ${dag.nummer}, taak ${huidigeTaak.id}`}
                  />
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
                  <div className="border-t border-cm-border pt-2 space-y-1">
                    <EditableTekst
                      namespace="sprint-ui"
                      sleutel="taak.inline-actie.voorbeeld-label"
                      standaard="Voorbeeld:"
                      overrides={uiOverrides}
                      isFounder={isFounder}
                      editModusAan={editModusAan}
                      as="span"
                      className="not-italic text-cm-gold text-xs font-semibold"
                      hint="Label boven het voorbeeld, gedeeld over alle dagen"
                    />
                    <EditableBlok
                      namespace="sprint-dag"
                      sleutel={`dag${dag.nummer}.taak.${huidigeTaak.id}.inlineActie.voorbeeld`}
                      standaard={huidigeTaak.inlineActie.voorbeeld}
                      overrides={{}}
                      isFounder={isFounder}
                      editModusAan={editModusAan}
                      as="p"
                      className="text-cm-white opacity-60 text-xs italic leading-relaxed"
                      rows={3}
                      hint={`Voorbeeld-tekst, dag ${dag.nummer}, taak ${huidigeTaak.id}`}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => bewaarInline(huidigeTaak)}
                  disabled={bezigInline}
                  className="btn-gold text-sm disabled:opacity-50"
                >
                  {bezigInline ? "Bewaren..." : "Bewaar, door naar volgende"}
                </button>
              </div>
            )}

            {/* Hoofd-actie-knoppen.
                Voor taken met INLINE-EMBED: de embed-component vinkt
                zelf af (vCard-import succesvol, sponsor-bericht
                verstuurd, namen-form bewaard, etc.). De "✓ Klaar"-knop
                hier zou anders een lege actie afvinken, exact wat we
                niet willen. Dus we tonen alleen "Sla over" + Vorige
                voor embed-taken zolang ze nog niet voltooid zijn. */}
            <div className="space-y-3 pt-2">
              {voltooidIds.has(huidigeTaak.id) ? (
                <button
                  type="button"
                  onClick={gaNaarVolgende}
                  className="btn-gold w-full py-4 text-base font-bold"
                >
                  Door naar
                  {taakIndex < totaal - 1 ? " volgende stap" : " afronding"} →
                </button>
              ) : huidigeTaak.inlineEmbed ? (
                // Geen "✓ Klaar"-knop, embed bepaalt afvinken zelf.
                // Alleen subtiele "Sla over" hieronder.
                null
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    vinkAf(huidigeTaak.id, true);
                    setTimeout(() => gaNaarVolgende(), 250);
                  }}
                  disabled={bezigIds.has(huidigeTaak.id)}
                  className="btn-gold w-full py-4 text-base font-bold disabled:opacity-50"
                >
                  ✓ Klaar, door naar
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
                    {huidigeTaak.inlineEmbed
                      ? "Doe later, ga verder →"
                      : "Sla over →"}
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
              <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
                {aantalVoltooid === totaal
                  ? `Top, je hebt het! 🚀`
                  : `Goed bezig${voornaam ? `, ${voornaam}` : ""}!`}
              </h1>
              <p className="text-cm-white opacity-80 text-base leading-relaxed">
                {aantalVoltooid === totaal
                  ? `Alle stappen van dag ${dag.nummer} zijn klaar. Morgen verder met dag ${dag.nummer + 1}, je krijgt een vriendelijke push.`
                  : `Je hebt ${aantalVoltooid} van de ${totaal} stappen gedaan. Wat niet lukte staat klaar voor morgen, kom gerust later vandaag terug.`}
              </p>
            </div>

            {/* Snel overzicht status */}
            <div className="card text-left space-y-2">
              <EditableTekst
                namespace="sprint-ui"
                sleutel="klaar.voortgang-label"
                standaard="Je voortgang vandaag"
                overrides={uiOverrides}
                isFounder={isFounder}
                editModusAan={editModusAan}
                as="p"
                className="text-cm-gold text-xs font-semibold uppercase tracking-wider"
                hint="Label boven voortgang-overzicht in klaar-stap, alle dagen"
              />
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

            {/* Media-blok positie 5: op klaar-stap, vóór dashboard-knop */}
            <MediaBlokken
              paginaNamespace="sprint-dag"
              paginaId={String(dag.nummer)}
              positie="op-klaar-stap"
              blokken={blokkenOpPositie("op-klaar-stap")}
              isFounder={isFounder}
            />

            <Link
              href="/dashboard"
              className="btn-gold w-full py-4 text-base font-bold inline-block"
              onClick={() => {
                // Markeer dat de flow gesloten is, niet meer auto-open
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
