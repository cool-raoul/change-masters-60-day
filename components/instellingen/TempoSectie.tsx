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
// TempoSectie, instellingen-blok om je tempo (commitment_uren) te
// switchen na onboarding.
//
// DRIE LAGEN VAN UITKLAP (op verzoek van Raoul, voorkomt overweldiging
// in /instellingen waar al veel andere kaarten staan):
//   Laag 1: alleen "Mijn tempo: X" header zichtbaar, met chevron.
//   Laag 2: klik op header => 3 tempo-blokken zichtbaar (samenvatting
//           + dagdoelen-getallen), geen detail-uitleg.
//   Laag 3: klik op een blok => die ene blok klapt z'n volle uitleg
//           uit (Past bij..., wat doe je op zo'n dag, knop "Kies dit
//           tempo").
//
// Bestaande users zonder commitment_uren: sectie start automatisch
// open op laag 2 met een amber waarschuwing, zodat het niet over het
// hoofd gezien wordt.
// ============================================================

type Props = {
  huidigUren: CommitmentUren | null;
};

export function TempoSectie({ huidigUren }: Props) {
  const router = useRouter();
  const supabase = createClient();

  // Sectie open of dicht? Default: open als de user nog geen tempo
  // heeft (anders zien ze de waarschuwing niet), anders dicht.
  const [sectieOpen, setSectieOpen] = useState(huidigUren === null);
  // Welk individueel blok is uitgeklapt? null = geen.
  const [uitgevouwen, setUitgevouwen] = useState<CommitmentUren | null>(null);
  // Welke tempo aan het bewaren is, zodat we alleen die ene knop
  // disabled kunnen tonen (niet alle drie).
  const [bezigVoor, setBezigVoor] = useState<CommitmentUren | null>(null);

  async function kies(uren: CommitmentUren) {
    if (uren === huidigUren) {
      toast.info("Dit is al je huidige tempo");
      return;
    }
    setBezigVoor(uren);
    try {
      const dd = berekenDagdoelen(uren);
      const { error } = await supabase.auth.updateUser({
        data: {
          commitment_uren: uren,
          dagdoel_contacten: dd.contacten,
          dagdoel_uitnodigingen: dd.uitnodigingen,
          dagdoel_followups: dd.followups,
        },
      });
      if (error) {
        toast.error(`Opslaan mislukt: ${error.message}`);
        return;
      }
      // Sessie verfrissen zodat de volgende page-render meteen de
      // nieuwe commitment_uren leest (lost K3 op).
      await supabase.auth.refreshSession();
      toast.success(
        `✓ Tempo ingesteld op ${tempoNaam(uren)} (± ${uren} uur per dag)`,
      );
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "onbekende fout";
      toast.error(`Opslaan mislukt: ${msg}`);
    } finally {
      setBezigVoor(null);
    }
  }

  // ------------------------------------------------------------
  // LAAG 1: alleen header, dichtgeklapt
  // ------------------------------------------------------------
  const huidigEmoji =
    huidigUren === 2
      ? "🌱"
      : huidigUren === 4
        ? "🔥"
        : huidigUren === 6
          ? "⚡"
          : "🎯";
  const huidigLabel = huidigUren
    ? `${tempoNaam(huidigUren)} (± ${huidigUren} uur per dag)`
    : "Nog niet gekozen";

  return (
    <div className="card">
      {/* Klikbare header, klapt sectie open/dicht */}
      <button
        type="button"
        onClick={() => setSectieOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider flex items-center gap-2">
            <span className="text-base">{huidigEmoji}</span>
            Mijn tempo
          </h2>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              huidigUren
                ? "bg-cm-gold/15 text-cm-gold border border-cm-gold/40"
                : "bg-amber-900/40 border border-amber-500/40 text-amber-300"
            }`}
          >
            {huidigLabel}
          </span>
        </div>
        <span className="text-cm-white/60 text-lg">
          {sectieOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* ------------------------------------------------------------
          LAAG 2: 3 blokken zichtbaar, met dagdoelen-samenvatting,
          GEEN volledige uitleg per blok (die komt pas in laag 3 als
          je op een blok klikt).
          ------------------------------------------------------------ */}
      {sectieOpen && (
        <div className="space-y-3 pt-4">
          {/* Waarschuwing voor bestaande users zonder tempo */}
          {huidigUren === null && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-900/15 px-3 py-2.5">
              <p className="text-amber-300 text-xs leading-relaxed">
                <strong>Je hebt nog geen tempo gekozen.</strong> Klap een
                tempo open om de uitleg te zien en daarna te kiezen.
              </p>
            </div>
          )}

          {([2, 4, 6] as const).map((uren) => {
            const dd = berekenDagdoelen(uren);
            const isHuidigTempo = uren === huidigUren;
            const isUitgeklapt = uitgevouwen === uren;
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
            const bewarenBezig = bezigVoor === uren;

            return (
              <div
                key={uren}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  isHuidigTempo
                    ? "border-cm-gold bg-cm-gold/[0.06]"
                    : "border-cm-border bg-cm-surface"
                }`}
              >
                {/* Blok-header: klik om individuele uitklap te togglen.
                    GEEN keuze-actie, alleen visibility-toggle. Dat
                    voorkomt dat je per ongeluk wisselt van tempo terwijl
                    je alleen wilt lezen. */}
                <button
                  type="button"
                  onClick={() =>
                    setUitgevouwen((u) => (u === uren ? null : uren))
                  }
                  className="w-full text-left p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-cm-white/50 mb-0.5">
                        ± {uren} uur per dag
                      </p>
                      <h3 className="text-base font-display font-bold text-cm-white flex items-center gap-2">
                        <span className="text-lg">{m.emoji}</span>
                        {tempoNaam(uren)}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isHuidigTempo && (
                        <span className="text-[10px] bg-cm-gold text-cm-on-gold font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          ✓ Huidig
                        </span>
                      )}
                      <span className="text-cm-white/50 text-sm">
                        {isUitgeklapt ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Compact mini-overzicht, altijd zichtbaar in laag 2 */}
                  <div className="text-[11px] text-cm-white/70 leading-relaxed">
                    📲 {dd.contacten} namen + 💬 {dd.contacten} berichten · 📨 {dd.uitnodigingen} uitnodigen · 🔄 follow-ups variabel · 📱 1-3 stories
                  </div>
                </button>

                {/* ------------------------------------------------------------
                    LAAG 3: detail-uitklap voor dit individuele blok.
                    Bevat 'Past bij', alle bouwblokken-omschrijvingen, en
                    de actie-knop om DIT tempo te kiezen.
                    ------------------------------------------------------------ */}
                {isUitgeklapt && (
                  <div className="px-3 pb-3 pt-1 border-t border-cm-border space-y-3 animate-fade-in">
                    <p className="text-xs text-cm-white/85 leading-relaxed pt-2">
                      {m.pastBij}
                    </p>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-cm-white/50 mb-1.5">
                        Wat doe je op zo'n dag?
                      </p>
                      <ul className="space-y-1.5">
                        {blokken.map((b) => (
                          <li
                            key={b.naam}
                            className="text-xs text-cm-white/80 flex gap-2 leading-relaxed"
                          >
                            <span className="flex-shrink-0 mt-0.5">
                              {b.emoji}
                            </span>
                            <span>
                              <strong className="text-cm-white">
                                {b.naam}
                              </strong>
                              <span className="text-cm-white/60">
                                {". "}
                                {b.beschrijving}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Kies-knop alleen als dit NIET het huidige tempo is */}
                    {!isHuidigTempo && (
                      <button
                        type="button"
                        onClick={() => kies(uren)}
                        disabled={bewarenBezig}
                        className="btn-gold w-full py-2.5 text-xs font-semibold disabled:opacity-40"
                      >
                        {bewarenBezig
                          ? "Bewaren..."
                          : `✓ Kies ${tempoNaam(uren)} als mijn tempo`}
                      </button>
                    )}
                    {isHuidigTempo && (
                      <p className="text-[11px] text-cm-gold text-center italic">
                        Dit is je huidige tempo
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-[11px] text-cm-white/55 italic leading-relaxed pt-1">
            💡 Switchen kan altijd. Liever even terugschakelen van Doorbreken
            naar Bouwen dan opbranden en stoppen. Andersom kan ook als je
            merkt dat je meer ruimte krijgt.
          </p>
        </div>
      )}
    </div>
  );
}
