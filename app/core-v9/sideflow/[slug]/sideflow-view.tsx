"use client";

// File: app/core-v9/sideflow/[slug]/sideflow-view.tsx
//
// Client-component die de side-flow toont: intro-tekst + substeps met
// MediaBlokken + slot-tekst. Substeps zijn afvinkbaar, voortgang gaat
// naar /api/core-v9/vink-substep met ankerstap_nummer = 0 (sideflow-
// marker). Knop "Klaar met side-flow" sluit af en stuurt naar /core-v9.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Sideflow } from "@/lib/playbook/core-sideflows-v9";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import { useEditModus } from "@/components/cms/EditModeContext";

type Props = {
  sideflow: Sideflow;
  isFounder: boolean;
  voornaam: string;
  initieelVoltooidIds: string[];
  blokkenPerPositie: Record<string, Blok[]>;
};

export function CoreV9SideflowView({
  sideflow,
  isFounder,
  initieelVoltooidIds,
  blokkenPerPositie,
}: Props) {
  const router = useRouter();
  useEditModus(); // edit-modus context aan voor MediaBlokken
  const [voltooidIds, setVoltooidIds] = useState<Set<string>>(
    new Set(initieelVoltooidIds),
  );
  const [bezig, setBezig] = useState(false);

  const verplichteSubsteps = sideflow.substeps.filter((s) => s.verplicht);
  const aantalVoltooid = verplichteSubsteps.filter((s) =>
    voltooidIds.has(s.id),
  ).length;
  const alleVerplichtKlaar =
    aantalVoltooid === verplichteSubsteps.length;

  function blokken(positie: string): Blok[] {
    return blokkenPerPositie[positie] ?? [];
  }

  async function toggleSubstep(taakId: string, nu: boolean) {
    setBezig(true);
    try {
      const res = await fetch("/api/core-v9/vink-substep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ankerstap: 0, // sideflow-marker
          taakId,
          voltooid: !nu,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error(json.error ?? "Opslaan mislukt");
        setBezig(false);
        return;
      }
      setVoltooidIds((prev) => {
        const next = new Set(prev);
        if (nu) next.delete(taakId);
        else next.add(taakId);
        return next;
      });
    } catch {
      toast.error("Verbinding kwijt");
    }
    setBezig(false);
  }

  async function afronden() {
    toast.success("Side-flow afgerond, terug naar je dag");
    router.push("/vandaag");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-cm-white">
      {/* Header */}
      <div className="mb-2">
        <Link
          href="/vandaag"
          className="text-cm-muted text-sm hover:text-cm-white"
        >
          ← Terug naar vandaag
        </Link>
      </div>

      <h1 className="text-3xl font-display font-bold text-cm-white mb-1">
        {sideflow.titel}
      </h1>
      <p className="text-cm-muted text-base mb-2">{sideflow.ondertitel}</p>

      {/* Voortgang-bar */}
      <div className="mt-4 mb-6 flex items-center gap-3">
        <div className="flex-1 h-2 bg-cm-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-cm-gold transition-all"
            style={{
              width: `${(aantalVoltooid / Math.max(1, verplichteSubsteps.length)) * 100}%`,
            }}
          />
        </div>
        <span className="text-xs text-cm-muted">
          {aantalVoltooid} / {verplichteSubsteps.length} verplicht
        </span>
      </div>

      {/* Media: bovenaan */}
      <MediaBlokken
        paginaNamespace="core-v9-sideflow"
        paginaId={sideflow.slug}
        positie="boven-intro"
        blokken={blokken("boven-intro")}
        isFounder={isFounder}
      />

      {/* Intro-tekst */}
      <div className="prose prose-invert max-w-none">
        {sideflow.intro.split("\n\n").map((alinea, i) => (
          <p key={i} className="text-cm-white/85 leading-relaxed text-base">
            {alinea}
          </p>
        ))}
      </div>

      {/* Media: tussen intro en substeps */}
      <MediaBlokken
        paginaNamespace="core-v9-sideflow"
        paginaId={sideflow.slug}
        positie="onder-intro"
        blokken={blokken("onder-intro")}
        isFounder={isFounder}
      />

      {/* Substep-lijst */}
      <h2 className="mt-10 text-xl font-display font-bold text-cm-gold">
        Substeps in deze flow
      </h2>
      <div className="mt-4 space-y-3">
        {sideflow.substeps.map((substep, i) => {
          const isVoltooid = voltooidIds.has(substep.id);
          return (
            <div
              key={substep.id}
              className={`rounded-lg border p-4 transition-colors ${
                isVoltooid
                  ? "border-cm-gold/60 bg-cm-gold/5"
                  : "border-cm-border bg-cm-surface"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleSubstep(substep.id, isVoltooid)}
                  disabled={bezig}
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 text-xs font-bold transition-colors ${
                    isVoltooid
                      ? "border-cm-gold bg-cm-gold text-cm-bg"
                      : "border-cm-border text-cm-muted hover:border-cm-gold"
                  }`}
                  title={
                    isVoltooid
                      ? "Klik om ongedaan te maken"
                      : "Klik om af te vinken"
                  }
                >
                  {isVoltooid ? "✓" : i + 1}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-semibold text-sm ${
                        isVoltooid
                          ? "text-cm-gold line-through"
                          : "text-cm-white"
                      }`}
                    >
                      {substep.label}
                    </span>
                    {substep.verplicht ? (
                      <span className="text-[10px] uppercase tracking-wider text-cm-muted">
                        verplicht
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-cm-muted/60">
                        optioneel
                      </span>
                    )}
                  </div>
                  {substep.uitleg && (
                    <p className="text-xs text-cm-white/70 whitespace-pre-line leading-relaxed">
                      {substep.uitleg}
                    </p>
                  )}
                  {substep.actieRoute && (
                    <Link
                      href={substep.actieRoute}
                      className="mt-2 inline-block text-xs text-cm-gold hover:underline"
                    >
                      {substep.actieRouteLabel ?? "Open deze plek →"}
                    </Link>
                  )}
                  {substep.inlineEmbed === "sponsor-melding" && (
                    <Link
                      href="/team"
                      className="mt-2 inline-block text-xs text-cm-gold hover:underline"
                    >
                      💬 Stuur je sponsor een berichtje →
                    </Link>
                  )}

                  {/* MediaBlokken per substep, positie = substep-id */}
                  <MediaBlokken
                    paginaNamespace="core-v9-sideflow"
                    paginaId={sideflow.slug}
                    positie={substep.id}
                    blokken={blokken(substep.id)}
                    isFounder={isFounder}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slot-tekst */}
      <div className="mt-10 rounded-lg border border-cm-gold/40 bg-cm-gold/5 p-5">
        <p className="text-cm-white/85 whitespace-pre-line leading-relaxed">
          {sideflow.slotTekst}
        </p>
        {alleVerplichtKlaar && (
          <button
            onClick={afronden}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-cm-gold text-cm-bg px-5 py-2 text-sm font-semibold hover:opacity-90"
          >
            ✓ Side-flow afronden, naar dag 2
          </button>
        )}
        {!alleVerplichtKlaar && (
          <p className="mt-3 text-xs text-cm-muted italic">
            Vink eerst alle verplichte substeps af, dan komt hier de
            afrond-knop.
          </p>
        )}
      </div>
    </main>
  );
}
