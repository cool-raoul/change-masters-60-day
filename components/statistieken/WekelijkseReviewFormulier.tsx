"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// WekelijkseReviewFormulier, drie reflectie-vragen + sponsor-deel-keuze.
//
// Voor dag 7, 14, 21 en (later) elke zondag in het weekritme.
// Drie vragen:
//   1. Wat ging goed deze week?
//   2. Wat liep niet soepel?
//   3. Waar focus ik volgende week op?
//
// Aan het eind: expliciete keuze of sponsor de review mag zien.
// Niet automatisch, want sponsor-share moet een bewuste keuze zijn.
// ============================================================

type Props = {
  /** Standaard week-nummer dat voorgeselecteerd is. */
  weekNummer: number;
};

export function WekelijkseReviewFormulier({ weekNummer }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [gingGoed, setGingGoed] = useState("");
  const [nietSoepel, setNietSoepel] = useState("");
  const [focus, setFocus] = useState("");
  const [delenMetSponsor, setDelenMetSponsor] = useState(false);

  async function bewaar() {
    if (!gingGoed.trim() && !nietSoepel.trim() && !focus.trim()) {
      toast.error("Vul minimaal één antwoord in");
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/review/wekelijks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNummer,
          gingGoed,
          nietSoepel,
          focusVolgendeWeek: focus,
          gedeeldMetSponsor: delenMetSponsor,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      toast.success(
        delenMetSponsor
          ? "Review bewaard en gedeeld met je sponsor"
          : "Review bewaard",
      );
      setGingGoed("");
      setNietSoepel("");
      setFocus("");
      setDelenMetSponsor(false);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  if (!open) {
    return (
      <div className="card border-l-4 border-cm-gold/60 space-y-3">
        <div>
          <h3 className="text-cm-gold font-semibold text-base flex items-center gap-2">
            📝 Wekelijkse review
          </h3>
          <p className="text-cm-white/80 text-sm mt-1 leading-relaxed">
            Drie korte vragen om terug te kijken op week {weekNummer}. Je kiest
            zelf of je 'm met je sponsor wilt delen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-gold text-sm"
        >
          Vul de review in →
        </button>
      </div>
    );
  }

  return (
    <div className="card border-l-4 border-cm-gold/60 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-cm-gold font-semibold text-base">
            📝 Wekelijkse review, week {weekNummer}
          </h3>
          <p className="text-cm-white/60 text-xs mt-1">
            Eerlijk antwoorden levert je de meeste groei.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={bezig}
          className="text-cm-white/60 hover:text-cm-white text-xs"
        >
          Sluit
        </button>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-cm-white text-sm font-medium">
            1. Wat ging goed deze week?
          </span>
          <textarea
            value={gingGoed}
            onChange={(e) => setGingGoed(e.target.value)}
            placeholder="Klein of groot, alles telt..."
            rows={3}
            className="input-cm w-full mt-1.5 text-sm"
            disabled={bezig}
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-cm-white text-sm font-medium">
            2. Wat liep niet soepel?
          </span>
          <textarea
            value={nietSoepel}
            onChange={(e) => setNietSoepel(e.target.value)}
            placeholder="Geen oordeel, gewoon eerlijk..."
            rows={3}
            className="input-cm w-full mt-1.5 text-sm"
            disabled={bezig}
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-cm-white text-sm font-medium">
            3. Waar focus ik volgende week op?
          </span>
          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Eén ding waar je in groeit..."
            rows={3}
            className="input-cm w-full mt-1.5 text-sm"
            disabled={bezig}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 p-3 rounded-lg border border-cm-border bg-cm-surface-2 cursor-pointer hover:bg-cm-surface transition-colors">
        <input
          type="checkbox"
          checked={delenMetSponsor}
          onChange={(e) => setDelenMetSponsor(e.target.checked)}
          disabled={bezig}
          className="mt-1 cursor-pointer"
        />
        <div>
          <p className="text-cm-white text-sm font-medium">
            Deel deze review met mijn sponsor
          </p>
          <p className="text-cm-white/60 text-xs mt-0.5 leading-relaxed">
            Sponsor ziet je antwoorden en kan je gerichter ondersteunen waar
            het niet soepel liep. Niet automatisch, alleen als jij dit aanvinkt.
          </p>
        </div>
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={bewaar}
          disabled={bezig}
          className="btn-gold flex-1 text-sm"
        >
          {bezig ? "Bewaren..." : "Bewaar review"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={bezig}
          className="btn-secondary text-sm"
        >
          Annuleer
        </button>
      </div>
    </div>
  );
}
