"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// NamenForm — inline-embed voor taken als 'voeg 20 namen toe'.
//
// Toont een uitklapbare lijst van naam+telefoon-velden met een
// duidelijke voortgangsbalk: "X / Y namen ingevuld". Bewaart in
// één keer naar prospects-tabel (geen reservoir-tussenstap — zelf
// typen = bewust toevoegen aan actieve namenlijst).
//
// Houdt de member in de dag-flow: geen wegnavigeren naar
// /namenlijst/nieuw waar telkens 1 naam tegelijk kan.
// ============================================================

type Rij = { naam: string; telefoon: string };

type Props = {
  doel: number; // bv. 20 voor 'voeg 20 namen toe'
  alVoltooid: boolean;
  opVoltooid: () => void;
  opOpnieuw?: () => void;
};

export function NamenForm({ doel, alVoltooid, opVoltooid, opOpnieuw }: Props) {
  // Start met `doel` lege rijen + 5 buffer (zodat 'ie ruimte heeft).
  const [rijen, setRijen] = useState<Rij[]>(
    Array.from({ length: doel + 5 }, () => ({ naam: "", telefoon: "" })),
  );
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(alVoltooid);

  const ingevuld = rijen.filter((r) => r.naam.trim().length > 0).length;
  const procent = Math.min(100, Math.round((ingevuld / doel) * 100));

  function update(idx: number, veld: keyof Rij, waarde: string) {
    setRijen((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [veld]: waarde } : r)),
    );
  }

  function voegRijToe() {
    setRijen((prev) => [...prev, { naam: "", telefoon: "" }]);
  }

  async function bewaar() {
    const teInsert = rijen.filter((r) => r.naam.trim().length > 0);
    if (teInsert.length === 0) {
      toast.error("Vul minimaal 1 naam in");
      return;
    }
    setBezig(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niet ingelogd");
        return;
      }

      // Dedup tegen bestaande prospects.
      const { data: bestaand } = await supabase
        .from("prospects")
        .select("volledige_naam, telefoon")
        .eq("user_id", user.id);
      const reedsAanwezig = new Set(
        ((bestaand as Array<{ volledige_naam: string; telefoon: string | null }>) || []).map(
          (p) => `${p.volledige_naam.toLowerCase()}|${p.telefoon ?? ""}`,
        ),
      );

      const nieuw = teInsert
        .filter(
          (r) =>
            !reedsAanwezig.has(
              `${r.naam.toLowerCase().trim()}|${r.telefoon.trim() ?? ""}`,
            ),
        )
        .map((r) => ({
          user_id: user.id,
          volledige_naam: r.naam.trim().slice(0, 200),
          telefoon: r.telefoon.trim().slice(0, 50) || null,
          pipeline_fase: "prospect" as const,
          actief: true,
          gearchiveerd: false,
        }));

      if (nieuw.length === 0) {
        toast.success("Deze namen stonden al op je lijst");
        setKlaar(true);
        opVoltooid();
        return;
      }

      const { error } = await supabase.from("prospects").insert(nieuw);
      if (error) {
        toast.error(`Opslaan mislukt: ${error.message}`);
        return;
      }

      toast.success(
        `🎉 ${nieuw.length} naam${nieuw.length === 1 ? "" : "en"} op je namenlijst gezet`,
      );
      setKlaar(true);
      opVoltooid();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "onbekende fout";
      toast.error(`Opslaan mislukt: ${msg}`);
    } finally {
      setBezig(false);
    }
  }

  if (klaar) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-3">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Namen op je namenlijst gezet
        </p>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          Top — je voorraadkast is een laag voller. Door naar de volgende stap.
        </p>
        {opOpnieuw && (
          <button
            type="button"
            onClick={() => {
              setKlaar(false);
              setRijen(
                Array.from({ length: doel + 5 }, () => ({
                  naam: "",
                  telefoon: "",
                })),
              );
              opOpnieuw();
            }}
            className="text-cm-gold text-xs hover:underline underline-offset-2 font-semibold"
          >
            ↻ Voeg meer namen toe
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-3">
      <div className="space-y-1.5">
        <h4 className="text-cm-gold font-semibold text-sm">
          ✋ Vul {doel} namen in
        </h4>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          Uit je hoofd, niet uit je telefoon — nieuwe namen die nog NIET op je
          lijst stonden. Familie-partners, oude collega's, sport-maatjes,
          ouders bij school of voetbal, buren, ondernemers in je netwerk. Niet
          filteren — alles erop.
        </p>
      </div>

      {/* Voortgangsbalk */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cm-white opacity-70">
            <strong className="text-cm-gold">{ingevuld}</strong> van {doel}{" "}
            namen ingevuld
          </span>
          {ingevuld >= doel && (
            <span className="text-emerald-400 font-semibold">
              🎯 Doel gehaald!
            </span>
          )}
        </div>
        <div className="h-1.5 bg-cm-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              ingevuld >= doel ? "bg-emerald-400" : "bg-cm-gold"
            }`}
            style={{ width: `${procent}%` }}
          />
        </div>
      </div>

      {/* Rij-input */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {rijen.map((r, i) => (
          <div key={i} className="flex gap-2">
            <span className="flex-shrink-0 w-7 text-right text-cm-white opacity-40 text-xs pt-2.5">
              {i + 1}.
            </span>
            <input
              type="text"
              value={r.naam}
              onChange={(e) => update(i, "naam", e.target.value)}
              placeholder="Naam"
              className="textarea-cm flex-1 text-sm py-2 px-3"
            />
            <input
              type="tel"
              value={r.telefoon}
              onChange={(e) => update(i, "telefoon", e.target.value)}
              placeholder="Tel (optioneel)"
              className="textarea-cm w-32 text-sm py-2 px-3"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={voegRijToe}
          className="text-cm-gold text-xs hover:underline underline-offset-2"
        >
          + Nog een rij erbij
        </button>
        <span className="flex-1" />
      </div>

      <button
        type="button"
        onClick={bewaar}
        disabled={bezig || ingevuld === 0}
        className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-30"
      >
        {bezig
          ? "Bewaren..."
          : ingevuld === 0
            ? "Vul eerst namen in"
            : ingevuld < doel
              ? `Bewaar ${ingevuld} (mag ook nog meer)`
              : `✓ Bewaar deze ${ingevuld} namen op mijn lijst`}
      </button>
    </div>
  );
}
