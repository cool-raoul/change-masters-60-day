"use client";

// File: app/core-v6/core-v6-flow.tsx
//
// Multi-step flow voor een Core V6-ankerstap. Nabouwsel van Sprint's
// vandaag-flow.tsx maar luchtiger + Core V6-namespace:
//   - "overzicht"-modus: les + takenlijst + 'Begin met substep 1'-knop
//   - "substep"-modus: één substep tegelijk, label + MediaBlokken + uitleg +
//     inline-embed (sponsor-melding / momentum-radar / partner-check) +
//     'Ik heb dit gedaan'-knop + vorige/volgende navigatie
//
// Substep-voortgang wordt opgeslagen in core_v6_substep_voltooiingen.
// Bij voltooien van alle verplichte substeps verschijnt 'Ankerstap klaar'-
// knop die naar /api/core-v6/voltooi-ankerstap POSTet.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { Dag } from "@/lib/playbook/types";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { useEditModus } from "@/components/cms/EditModeContext";
import { SponsorMeldingKnop } from "@/components/vandaag/inline-embeds/SponsorMeldingKnop";
import { PartnerCheckEmbed } from "@/components/vandaag/inline-embeds/PartnerCheckEmbed";

const FASE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Fundament",
  2: "In beweging",
  3: "Business-ritme",
  4: "Doorgaande fase",
};

type Props = {
  ankerstap: Dag;
  totaalAnkerstappen: number;
  isFounder: boolean;
  voornaam: string;
  /** Set van taak-ids die al voltooid zijn (uit core_v6_substep_voltooiingen). */
  initieelVoltooidIds: string[];
  /** Pre-gehaalde MediaBlokken per positie (zelfde patroon als Sprint). */
  blokkenPerPositie: Record<string, Blok[]>;
  /** Is het de huidige ankerstap van de user? Pas dan kunnen ze 'm voltooien. */
  isHuidigeAnkerstap: boolean;
};

export function CoreV6Flow({
  ankerstap,
  totaalAnkerstappen,
  isFounder,
  voornaam,
  initieelVoltooidIds,
  blokkenPerPositie,
  isHuidigeAnkerstap,
}: Props) {
  const router = useRouter();
  const { editModusAan } = useEditModus();
  const [stap, setStap] = useState<"overzicht" | "substep">("overzicht");
  const [substepIndex, setSubstepIndex] = useState(0);
  const [voltooidIds, setVoltooidIds] = useState<Set<string>>(
    new Set(initieelVoltooidIds),
  );
  const [bezig, setBezig] = useState(false);

  const taken = ankerstap.vandaagDoen;
  const totaal = taken.length;
  const huidigeTaak = taken[substepIndex];
  const isLaatsteSubstep = substepIndex === totaal - 1;
  const fase = ankerstap.fase as 1 | 2 | 3;
  const faseLabel = FASE_LABELS[fase];

  function blokken(positie: string): Blok[] {
    return blokkenPerPositie[positie] ?? [];
  }

  // Aantal voltooide verplichte taken (voor de progress-indicator).
  const verplichteTaken = taken.filter((t) => t.verplicht);
  const aantalVerplichtVoltooid = verplichteTaken.filter((t) =>
    voltooidIds.has(t.id),
  ).length;
  const alleVerplichtKlaar =
    verplichteTaken.length > 0 &&
    aantalVerplichtVoltooid === verplichteTaken.length;

  async function vinkAf(taakId: string, voltooid: boolean) {
    // Optimistic update
    setVoltooidIds((vorig) => {
      const next = new Set(vorig);
      if (voltooid) next.add(taakId);
      else next.delete(taakId);
      return next;
    });
    try {
      const res = await fetch("/api/core-v6/vink-substep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ankerstap: ankerstap.nummer,
          taakId,
          voltooid,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Opslaan mislukt");
        // Rollback
        setVoltooidIds((vorig) => {
          const next = new Set(vorig);
          if (voltooid) next.delete(taakId);
          else next.add(taakId);
          return next;
        });
      }
    } catch {
      toast.error("Verbindingsfout");
      setVoltooidIds((vorig) => {
        const next = new Set(vorig);
        if (voltooid) next.delete(taakId);
        else next.add(taakId);
        return next;
      });
    }
  }

  async function voltooiAnkerstap() {
    setBezig(true);
    try {
      const form = new FormData();
      form.set("ankerstap", String(ankerstap.nummer));
      const res = await fetch("/api/core-v6/voltooi-ankerstap", {
        method: "POST",
        body: form,
      });
      if (res.ok || res.redirected) {
        toast.success("Ankerstap voltooid 💟");
        router.push("/core-v6");
        router.refresh();
      } else {
        toast.error("Voltooien mislukt");
      }
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  // -------- OVERZICHT --------
  if (stap === "overzicht") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-3 flex items-center justify-between text-xs text-cm-muted">
          <span className="text-cm-gold/70">Core V6 (pilot)</span>
          <span>
            Ankerstap {ankerstap.nummer} van {totaalAnkerstappen}
          </span>
        </div>

        {/* Media positie 1 */}
        <MediaBlokken
          paginaNamespace="core-v6-stap"
          paginaId={String(ankerstap.nummer)}
          positie="boven-titel"
          blokken={blokken("boven-titel")}
          isFounder={isFounder}
        />

        {/* Titel */}
        <header className="text-center space-y-2 pt-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Ankerstap {ankerstap.nummer} · {faseLabel}
          </p>
          {voornaam && (
            <h1 className="font-serif-warm text-2xl text-cm-white/90 leading-tight">
              Goed dat je er bent, {voornaam} 💟
            </h1>
          )}
          <EditableTekst
            namespace="core-v6-stap"
            sleutel={`stap${ankerstap.nummer}.titel`}
            standaard={ankerstap.titel}
            overrides={{}}
            isFounder={isFounder}
            editModusAan={editModusAan && isFounder}
            as="h2"
            className="font-serif-warm text-cm-gold text-xl"
            hint={`Titel voor ankerstap ${ankerstap.nummer}`}
          />
          <EditableTekst
            namespace="core-v6-stap"
            sleutel={`stap${ankerstap.nummer}.faseDoel`}
            standaard={ankerstap.faseDoel}
            overrides={{}}
            isFounder={isFounder}
            editModusAan={editModusAan && isFounder}
            as="p"
            className="text-cm-muted text-sm italic leading-relaxed max-w-xl mx-auto"
            hint={`Doel-zin voor ankerstap ${ankerstap.nummer}`}
          />
        </header>

        {/* Media positie 2 */}
        <div className="mt-4">
          <MediaBlokken
            paginaNamespace="core-v6-stap"
            paginaId={String(ankerstap.nummer)}
            positie="boven-les"
            blokken={blokken("boven-les")}
            isFounder={isFounder}
          />
        </div>

        {/* Les */}
        <section className="mt-4 card border-l-4 border-cm-gold/60 space-y-2">
          <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
            📖 Wat je leert
          </h3>
          <EditableBlok
            namespace="core-v6-stap"
            sleutel={`stap${ankerstap.nummer}.watJeLeert`}
            standaard={ankerstap.watJeLeert}
            overrides={{}}
            isFounder={isFounder}
            editModusAan={editModusAan && isFounder}
            as="div"
            className="text-cm-white text-sm leading-relaxed whitespace-pre-line"
            rows={14}
            hint={`Les voor ankerstap ${ankerstap.nummer}`}
          />
        </section>

        {/* Media positie 3 */}
        <div className="mt-4">
          <MediaBlokken
            paginaNamespace="core-v6-stap"
            paginaId={String(ankerstap.nummer)}
            positie="tussen-les-taken"
            blokken={blokken("tussen-les-taken")}
            isFounder={isFounder}
          />
        </div>

        {/* Takenlijst-overzicht */}
        <section className="mt-4 card space-y-2">
          <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
            ✅ Wat je in deze ankerstap doet ({totaal} substappen)
          </h3>
          <ul className="space-y-1.5 text-sm">
            {taken.map((t, i) => (
              <li key={t.id} className="flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0">{i + 1}.</span>
                <span
                  className={
                    voltooidIds.has(t.id) ? "line-through text-cm-muted" : "text-cm-white"
                  }
                >
                  {t.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Begin-knop */}
        <button
          type="button"
          onClick={() => setStap("substep")}
          className="btn-gold mt-6 w-full py-4 text-base font-bold"
        >
          {aantalVerplichtVoltooid > 0
            ? "Door naar je volgende substep →"
            : "Begin met substep 1 →"}
        </button>
      </main>
    );
  }

  // -------- SUBSTEP --------
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between text-xs text-cm-muted">
        <button
          type="button"
          onClick={() => setStap("overzicht")}
          className="text-cm-muted hover:text-cm-white underline"
        >
          ← Terug naar overzicht
        </button>
        <span>
          Substep {substepIndex + 1} van {totaal}
        </span>
      </div>

      {huidigeTaak && (
        <>
          {/* Substep-label */}
          <div>
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Ankerstap {ankerstap.nummer} · Substep {substepIndex + 1}
            </p>
            <EditableTekst
              namespace="core-v6-stap"
              sleutel={`stap${ankerstap.nummer}.taak.${huidigeTaak.id}.label`}
              standaard={huidigeTaak.label}
              overrides={{}}
              isFounder={isFounder}
              editModusAan={editModusAan && isFounder}
              as="h2"
              className="font-serif-warm text-2xl text-cm-white mt-1 leading-tight"
              hint={`Substep-label, ankerstap ${ankerstap.nummer}, taak ${huidigeTaak.id}`}
            />
          </div>

          {/* MediaBlokken bij deze specifieke substep (founder kan video/foto droppen) */}
          <div className="mt-4">
            <MediaBlokken
              paginaNamespace="core-v6-stap"
              paginaId={String(ankerstap.nummer)}
              positie={`bij-taak.${huidigeTaak.id}`}
              blokken={blokken(`bij-taak.${huidigeTaak.id}`)}
              isFounder={isFounder}
            />
          </div>

          {/* Uitleg */}
          {huidigeTaak.uitleg && (
            <EditableBlok
              namespace="core-v6-stap"
              sleutel={`stap${ankerstap.nummer}.taak.${huidigeTaak.id}.uitleg`}
              standaard={huidigeTaak.uitleg}
              overrides={{}}
              isFounder={isFounder}
              editModusAan={editModusAan && isFounder}
              as="div"
              className="mt-4 text-cm-white/85 text-sm leading-relaxed whitespace-pre-line"
              rows={5}
              hint={`Uitleg voor substep ${huidigeTaak.id}`}
            />
          )}

          {/* Inline embeds (Sprint-hergebruik) */}
          {huidigeTaak.inlineEmbed === "sponsor-melding" && (
            <div className="mt-4">
              <SponsorMeldingKnop
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                taakId={huidigeTaak.id}
                opVoltooid={() => vinkAf(huidigeTaak.id, true)}
              />
            </div>
          )}
          {huidigeTaak.inlineEmbed === "partner-check" && (
            <div className="mt-4">
              <PartnerCheckEmbed
                alVoltooid={voltooidIds.has(huidigeTaak.id)}
                opVoltooid={() => vinkAf(huidigeTaak.id, true)}
              />
            </div>
          )}
          {huidigeTaak.inlineEmbed === "momentum-radar" && (
            <div className="mt-4 card">
              <p className="text-cm-muted text-sm">
                <Link href="/vandaag" className="text-cm-gold underline">
                  Open je momentum-radar
                </Link>{" "}
                en check je openstaande acties van vandaag.
              </p>
            </div>
          )}

          {/* Actie-route knop (alleen als er geen inline-embed is) */}
          {huidigeTaak.actieRoute && !huidigeTaak.inlineEmbed && (
            <div className="mt-4">
              <Link
                href={huidigeTaak.actieRoute}
                className="btn-outline inline-block"
              >
                → Open {huidigeTaak.actieRoute}
              </Link>
            </div>
          )}

          {/* Klaar-knop voor deze substep */}
          <div className="mt-6 space-y-2">
            {voltooidIds.has(huidigeTaak.id) ? (
              <>
                <div className="text-cm-gold text-sm flex items-center gap-2">
                  ✓ Deze substep heb je gedaan
                </div>
                <button
                  type="button"
                  onClick={() => vinkAf(huidigeTaak.id, false)}
                  className="text-cm-muted text-xs underline hover:text-cm-white"
                >
                  Toch nog niet, vink uit
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => vinkAf(huidigeTaak.id, true)}
                className="btn-gold w-full py-3 text-base"
              >
                Ik heb dit gedaan ✓
              </button>
            )}
          </div>

          {/* Vorige/Volgende navigatie */}
          <nav className="mt-6 flex items-center justify-between gap-4">
            {substepIndex > 0 ? (
              <button
                type="button"
                onClick={() => setSubstepIndex(substepIndex - 1)}
                className="text-sm text-cm-muted hover:text-cm-white underline"
              >
                ← Vorige substep
              </button>
            ) : (
              <span />
            )}
            {!isLaatsteSubstep && (
              <button
                type="button"
                onClick={() => setSubstepIndex(substepIndex + 1)}
                className="text-sm text-cm-muted hover:text-cm-white underline ml-auto"
              >
                Volgende substep →
              </button>
            )}
          </nav>

          {/* Op laatste substep + alle verplichte klaar: ankerstap-voltooien-knop */}
          {isLaatsteSubstep && isHuidigeAnkerstap && (
            <div className="mt-8 border-t border-cm-border pt-6">
              {alleVerplichtKlaar ? (
                <button
                  type="button"
                  onClick={voltooiAnkerstap}
                  disabled={bezig}
                  className="btn-gold w-full py-4 text-base font-bold"
                >
                  {bezig ? "Bezig..." : "Deze ankerstap voltooid, door naar de volgende →"}
                </button>
              ) : (
                <div className="text-center text-sm text-cm-muted">
                  Nog {verplichteTaken.length - aantalVerplichtVoltooid}{" "}
                  verplichte substep
                  {verplichteTaken.length - aantalVerplichtVoltooid === 1 ? "" : "s"}{" "}
                  open. Geen druk, je kunt later terugkomen.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
