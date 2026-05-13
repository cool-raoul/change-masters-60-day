"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  type CommitmentUren,
  berekenDagdoelen,
  bouwblokkenVoorTempo,
  tempoNaam,
} from "@/lib/dagdoelen";

// ============================================================
// TempoSectie, blok in /instellingen waar de member zijn tempo
// (commitment_uren) kan switchen na onboarding.
//
// Hoort hetzelfde te voelen als de tempo-keuze in onboarding-stap-4,
// maar compacter, want hier zit 'm tussen andere instellingen-blokken.
//
// Voor bestaande users die hun account vóór de tempo-feature
// hadden, is huidigUren null en zien ze een vriendelijke melding
// bovenaan: "kies een tempo om alles op maat te krijgen". Dat is
// belangrijk voor de pilot-team-leden die al ooit door de oude
// onboarding zijn gegaan.
// ============================================================

type Props = {
  huidigUren: CommitmentUren | null;
};

export function TempoSectie({ huidigUren }: Props) {
  const [gekozenUren, setGekozenUren] = useState<CommitmentUren | null>(
    huidigUren,
  );
  const [bezig, setBezig] = useState(false);
  const [uitgevouwen, setUitgevouwen] = useState<CommitmentUren | null>(
    huidigUren,
  );
  const router = useRouter();

  const isGewijzigd = gekozenUren !== huidigUren;
  const supabase = createClient();

  async function bewaar() {
    if (!gekozenUren) {
      toast.error("Kies eerst een tempo");
      return;
    }
    setBezig(true);
    try {
      // Schrijf zowel de bron-of-truth (commitment_uren) als de
      // afgeleide cache-velden (dagdoel_contacten/_uitnodigingen/
      // _followups) zodat code die direct user_metadata leest blijft
      // werken.
      const dd = berekenDagdoelen(gekozenUren);
      const { error } = await supabase.auth.updateUser({
        data: {
          commitment_uren: gekozenUren,
          dagdoel_contacten: dd.contacten,
          dagdoel_uitnodigingen: dd.uitnodigingen,
          dagdoel_followups: dd.followups,
        },
      });
      if (error) {
        toast.error(`Opslaan mislukt: ${error.message}`);
        return;
      }
      toast.success(
        `✓ Tempo ingesteld op ${tempoNaam(gekozenUren)} (± ${gekozenUren} uur per dag)`,
      );
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "onbekende fout";
      toast.error(`Opslaan mislukt: ${msg}`);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider flex items-center gap-2">
          🎯 Mijn tempo
        </h2>
        <p className="text-cm-white text-sm opacity-70 mt-1 leading-relaxed">
          Hoeveel tijd investeer je gemiddeld per dag in je 60-dagenrun?
          Je dagdoelen passen zich daar automatisch op aan. Liever rustig
          en volhouden dan groot beginnen en stoppen.
        </p>
      </div>

      {/* Eerste-keer-keuze melding voor bestaande users */}
      {huidigUren === null && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-900/15 px-3 py-2.5">
          <p className="text-amber-300 text-xs leading-relaxed">
            <strong>Je hebt nog geen tempo gekozen.</strong> Kies hieronder een
            tempo om je dagdoelen en dagindeling op maat te krijgen.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {([2, 4, 6] as const).map((uren) => {
          const dd = berekenDagdoelen(uren);
          const isGekozen = gekozenUren === uren;
          const isUitgevouwen = uitgevouwen === uren;
          const meta: Record<
            CommitmentUren,
            { emoji: string; pastBij: string }
          > = {
            2: {
              emoji: "🌱",
              pastBij:
                "Drukke baan, gezin, of je bouwt dit naast alles wat je al hebt. Liever rustig en consistent dan groot beginnen en stoppen.",
            },
            4: {
              emoji: "🔥",
              pastBij:
                "Je hebt ruimte gemaakt. Je gezin weet dat dit jouw 60 dagen worden. Serieus zonder jezelf op te branden.",
            },
            6: {
              emoji: "⚡",
              pastBij:
                "Geen ander werk, of je hebt deze 60 dagen echt vrijgemaakt. Alles eruit halen, als hoofdactiviteit.",
            },
          };
          const m = meta[uren];
          const blokken = bouwblokkenVoorTempo(uren);
          return (
            <div
              key={uren}
              className={`rounded-xl border-2 transition-all overflow-hidden ${
                isGekozen
                  ? "border-cm-gold bg-cm-gold/[0.08]"
                  : "border-cm-border bg-cm-surface"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setGekozenUren(uren);
                  setUitgevouwen(uren);
                }}
                className="w-full text-left p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-cm-white/50 mb-1">
                      ± {uren} uur per dag
                    </p>
                    <h3 className="text-lg font-display font-bold text-cm-white flex items-center gap-2">
                      <span className="text-xl">{m.emoji}</span>
                      {tempoNaam(uren)}
                    </h3>
                  </div>
                  {isGekozen && (
                    <span className="text-[10px] bg-cm-gold text-cm-on-gold font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      ✓
                    </span>
                  )}
                </div>

                <p className="text-xs text-cm-white/80 leading-relaxed">
                  {m.pastBij}
                </p>

                <div className="bg-cm-surface-2 rounded-lg p-2.5 space-y-0.5 text-xs text-cm-white">
                  <p className="text-[10px] uppercase tracking-wider text-cm-white/50 mb-1">
                    Elke dag
                  </p>
                  <p>💬 {dd.contacten} contacten leggen of vervolgen</p>
                  <p>📨 {dd.uitnodigingen} mensen uitnodigen voor een presentatie</p>
                  <p>🔄 {dd.followups} mensen opvolgen via 3-weg of Mini-ELEVA</p>
                  <p>📱 1 tot 3 momenten uit je dag delen (geen verkoop)</p>
                </div>
              </button>

              {/* Detail-uitklap, alleen open voor de gekozen kaart */}
              {isUitgevouwen && (
                <div className="px-4 pb-4 pt-1 border-t border-cm-border space-y-2">
                  <p className="text-xs uppercase tracking-wider text-cm-white/50 pt-2">
                    Wat doe je op zo'n dag?
                  </p>
                  <ul className="space-y-2">
                    {blokken.map((b) => (
                      <li
                        key={b.naam}
                        className="text-xs text-cm-white/80 flex gap-2 leading-relaxed"
                      >
                        <span className="flex-shrink-0 mt-0.5">{b.emoji}</span>
                        <span>
                          <strong className="text-cm-white">{b.naam}</strong>
                          <span className="text-cm-white/60">
                            {". "}
                            {b.beschrijving}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bewaar-knop, alleen actief als er iets veranderd is */}
      <button
        type="button"
        onClick={bewaar}
        disabled={bezig || !isGewijzigd || !gekozenUren}
        className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {bezig
          ? "Bewaren..."
          : !gekozenUren
            ? "Kies eerst een tempo"
            : !isGewijzigd
              ? "Dit is je huidige tempo"
              : `✓ Bewaar ${tempoNaam(gekozenUren)} als mijn tempo`}
      </button>

      <p className="text-[11px] text-cm-white/55 italic leading-relaxed">
        💡 Switchen kan altijd. Liever even terugschakelen van Doorbreken naar
        Bouwen dan opbranden en stoppen. Andersom kan ook als je merkt dat je
        meer ruimte krijgt.
      </p>
    </div>
  );
}
