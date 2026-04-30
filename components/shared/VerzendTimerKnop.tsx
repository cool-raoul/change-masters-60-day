"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// VerzendTimerKnop — plan een bericht in voor latere verzending.
//
// Gebruikt het bestaande 'herinneringen'-systeem als planner: er wordt
// een herinnering aangemaakt met de te versturen tekst als beschrijving
// + een titel-prefix '📤 Stuur naar [naam]'. Op de vervaldatum krijgt de
// member z'n gewone ochtendpush met deze herinnering erbij — open ELEVA,
// kopieer de tekst, plak in WhatsApp.
//
// Geen nieuwe cron, geen nieuwe tabel — alleen UI bovenop bestaande infra.
// ============================================================

type Props = {
  /** De tekst die de member later wil versturen. */
  bericht: string;
  /** Optionele koppeling aan een prospect (voor de prospect_id-relatie). */
  prospectId?: string;
  /** Optionele naam — gebruikt in de titel van de herinnering. */
  prospectNaam?: string;
  /** Optioneel: kleinere knop-stijl voor inbedding in andere flows. */
  compact?: boolean;
};

type SnelleOptie = {
  label: string;
  bereken: () => Date;
};

const SNELLE_OPTIES: SnelleOptie[] = [
  {
    label: "Morgen 09:00",
    bereken: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Over 2 dagen",
    bereken: () => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Over 3 dagen",
    bereken: () => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Over 1 week",
    bereken: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Over 2 weken",
    bereken: () => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

export function VerzendTimerKnop({
  bericht,
  prospectId,
  prospectNaam,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [berichtBuffer, setBerichtBuffer] = useState(bericht);
  const [customDatum, setCustomDatum] = useState("");
  const [bezig, setBezig] = useState(false);
  const supabase = createClient();

  function nlDatum(d: Date): string {
    return d.toLocaleDateString("nl-NL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  async function planIn(verzendOp: Date) {
    if (!berichtBuffer.trim()) {
      toast.error("Bericht is leeg");
      return;
    }
    setBezig(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niet ingelogd");
        return;
      }

      const titel = prospectNaam
        ? `📤 Stuur naar ${prospectNaam}`
        : `📤 Geplande verzending`;

      const { error } = await supabase.from("herinneringen").insert({
        user_id: user.id,
        prospect_id: prospectId ?? null,
        titel,
        beschrijving: berichtBuffer.trim(),
        vervaldatum: verzendOp.toISOString().split("T")[0],
        herinnering_type: "followup",
        voltooid: false,
      });
      if (error) {
        toast.error("Inplannen mislukt: " + error.message);
        return;
      }
      toast.success(`📤 Ingepland voor ${nlDatum(verzendOp)}`);
      setOpen(false);
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function planCustomDatum() {
    if (!customDatum) {
      toast.error("Kies eerst een datum");
      return;
    }
    const d = new Date(customDatum + "T09:00:00");
    if (Number.isNaN(d.getTime())) {
      toast.error("Ongeldige datum");
      return;
    }
    if (d.getTime() < Date.now()) {
      toast.error("Kies een datum in de toekomst");
      return;
    }
    planIn(d);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setBerichtBuffer(bericht);
          setOpen(true);
        }}
        className={
          compact
            ? "text-xs text-cm-gold underline-offset-2 hover:underline"
            : "flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cm-bg border border-cm-border text-cm-white hover:border-cm-gold-dim text-sm font-medium"
        }
      >
        ⏱️ Verzend later
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={() => !bezig && setOpen(false)}
    >
      <div
        className="bg-cm-bg-2 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl border border-cm-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-cm-white font-display font-bold text-lg">
            ⏱️ Verzend later
          </h3>
          <button
            onClick={() => !bezig && setOpen(false)}
            disabled={bezig}
            className="w-8 h-8 rounded-full bg-cm-surface-2 hover:bg-cm-surface-3 text-cm-white text-lg leading-none"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>

        <p className="text-cm-white opacity-70 text-sm">
          Je krijgt op de gekozen dag een herinnering met deze tekst —
          klaar om te kopiëren en versturen.
        </p>

        <div>
          <label className="block text-xs text-cm-white opacity-70 mb-1">
            Bericht (kun je nog aanpassen)
          </label>
          <textarea
            value={berichtBuffer}
            onChange={(e) => setBerichtBuffer(e.target.value)}
            className="textarea-cm w-full text-sm leading-relaxed"
            rows={5}
          />
        </div>

        <div>
          <p className="text-xs text-cm-white opacity-70 mb-2">
            Wanneer versturen?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SNELLE_OPTIES.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => planIn(opt.bereken())}
                disabled={bezig}
                className="text-sm px-3 py-2.5 rounded-lg border border-cm-border text-cm-white hover:border-cm-gold-dim hover:bg-cm-surface-2 disabled:opacity-50"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-cm-border pt-3 space-y-2">
          <p className="text-xs text-cm-white opacity-70">
            Of kies een andere datum:
          </p>
          <div className="flex gap-2">
            <input
              type="date"
              value={customDatum}
              onChange={(e) => setCustomDatum(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="input-cm flex-1 text-sm"
            />
            <button
              type="button"
              onClick={planCustomDatum}
              disabled={bezig || !customDatum}
              className="btn-gold text-sm disabled:opacity-50 whitespace-nowrap"
            >
              Plan in
            </button>
          </div>
        </div>

        <p className="text-xs text-cm-white opacity-50 italic">
          Op de gekozen dag krijg je de herinnering in je dagelijkse push +
          op /herinneringen — kopieer en stuur 'm dan in WhatsApp.
        </p>
      </div>
    </div>
  );
}
