"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ============================================================
// HerinneringVerplaatsKnop, snelle verplaats-functionaliteit voor
// herinneringen op klantenkaart, /herinneringen-overzicht, en
// dashboard-snippets.
//
// Werkt: 1 update op 'vervaldatum' in de herinneringen-tabel. Alle
// plekken die deze herinnering tonen (klantkaart, /herinneringen,
// dashboard, topbar-badge) krijgen direct de nieuwe datum binnen via
// supabase realtime channels. Zo geen duplicate-rij, herinnering
// verschuift gewoon mee. Lost het 'oude blijft staan'-probleem op.
//
// Presets en custom datum-input. Clamp op vandaag of later (geen
// herinneringen in het verleden plannen).
// ============================================================

type Preset = { label: string; dagen: number };

const PRESETS: Preset[] = [
  { label: "Morgen", dagen: 1 },
  { label: "Over 3 dagen", dagen: 3 },
  { label: "Volgende week", dagen: 7 },
  { label: "Over 2 weken", dagen: 14 },
  { label: "Over een maand", dagen: 30 },
];

export function HerinneringVerplaatsKnop({
  herinneringId,
  huidigeDatum,
}: {
  herinneringId: string;
  huidigeDatum: string;
}) {
  const [open, setOpen] = useState(false);
  const [eigenDatum, setEigenDatum] = useState("");
  const [laden, setLaden] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    function buitenKlik(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", buitenKlik);
    return () => document.removeEventListener("mousedown", buitenKlik);
  }, [open]);

  async function verplaats(datumIso: string) {
    if (datumIso === huidigeDatum) {
      toast.info("Datum is al hetzelfde");
      return;
    }
    setLaden(true);
    const { error } = await supabase
      .from("herinneringen")
      .update({ vervaldatum: datumIso })
      .eq("id", herinneringId);

    if (error) {
      toast.error("Verplaatsen mislukt: " + error.message);
    } else {
      const datum = new Date(datumIso);
      toast.success(
        `Verplaatst naar ${datum.toLocaleDateString("nl-NL", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}`,
      );
      setOpen(false);
      setEigenDatum("");
      // Herrender forceren zodat server-rendered pagina's (prospect-detail,
      // /herinneringen) direct de nieuwe datum tonen. Realtime-channels op
      // dashboard/topbar updaten via supabase-postgres-changes vanzelf.
      router.refresh();
    }
    setLaden(false);
  }

  function presetVerplaats(dagenVooruit: number) {
    const basis = new Date();
    basis.setHours(0, 0, 0, 0);
    basis.setDate(basis.getDate() + dagenVooruit);
    const iso = basis.toISOString().split("T")[0];
    verplaats(iso);
  }

  const vandaagIso = new Date().toISOString().split("T")[0];

  return (
    <div
      ref={wrapperRef}
      className="relative flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        disabled={laden}
        className="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all border-white/30 bg-white/5 hover:border-cm-gold hover:bg-cm-gold/10 text-cm-white/70 hover:text-cm-gold"
        title="Verplaats herinnering naar later"
        aria-label="Verplaats herinnering"
      >
        <span className="text-sm">📅</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-60 rounded-xl bg-cm-surface border border-cm-border shadow-2xl py-1 z-50">
          <div className="px-3 py-2 border-b border-cm-border text-[11px] text-cm-white/60 uppercase tracking-wider font-semibold">
            Verplaats naar
          </div>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => presetVerplaats(p.dagen)}
              disabled={laden}
              className="w-full text-left px-4 py-2 text-sm text-cm-white hover:bg-cm-surface-2 transition-colors flex items-center justify-between disabled:opacity-50"
            >
              <span>{p.label}</span>
              <span className="text-xs text-cm-white/40">→</span>
            </button>
          ))}
          <div className="border-t border-cm-border mt-1 pt-2 px-3 pb-3">
            <p className="text-[11px] text-cm-white/60 mb-1.5 uppercase tracking-wider font-semibold">
              Of eigen datum
            </p>
            <input
              type="date"
              value={eigenDatum}
              onChange={(e) => setEigenDatum(e.target.value)}
              min={vandaagIso}
              className="input-cm text-sm w-full [&::-webkit-calendar-picker-indicator]:invert"
            />
            {eigenDatum && eigenDatum !== huidigeDatum && (
              <button
                onClick={() => verplaats(eigenDatum)}
                disabled={laden}
                className="btn-gold text-xs w-full mt-2"
              >
                {laden ? "Bezig..." : "Verplaats hierheen"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
