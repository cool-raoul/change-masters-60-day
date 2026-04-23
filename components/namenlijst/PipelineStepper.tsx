"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PipelineFase, PIPELINE_FASEN } from "@/lib/supabase/types";

// Inline pipeline-stepper voor een prospect-rij.
// Toont de 5 progressie-fasen als dots (prospect → followup) en drie
// eindstations (member/shopper/not_yet) als uitkomst-badge.
// Klik op de stepper opent een dropdown om de fase direct te wijzigen —
// geen detailkaart openen nodig.

interface Props {
  prospectId: string;
  huidigeFase: PipelineFase;
  // Compact = kleinere dots, voor in de lijst-rij.
  grootte?: "compact" | "normaal";
}

// Progressie-fasen (in volgorde). Eindstations worden apart getoond.
const PROGRESSIE_FASEN: PipelineFase[] = [
  "prospect",
  "uitgenodigd",
  "one_pager",
  "presentatie",
  "followup",
];
const EINDSTATIONS: PipelineFase[] = ["member", "shopper", "not_yet"];

function faseInfo(fase: PipelineFase) {
  return PIPELINE_FASEN.find((f) => f.fase === fase);
}

export function PipelineStepper({
  prospectId,
  huidigeFase,
  grootte = "compact",
}: Props) {
  const [open, setOpen] = useState(false);
  const [fase, setFase] = useState<PipelineFase>(huidigeFase);
  const [bezig, setBezig] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Sluit dropdown als je buiten klikt.
  useEffect(() => {
    function buitenKlik(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", buitenKlik);
    return () => document.removeEventListener("mousedown", buitenKlik);
  }, [open]);

  const isEindstation = EINDSTATIONS.includes(fase);
  const huidigeIndex = PROGRESSIE_FASEN.indexOf(fase);
  const info = faseInfo(fase);

  // Korte letters voor de uitkomst-dots (zodat je M/S/N ziet staan en
  // weet of iemand Member, Shopper of Not Yet is zonder het label te lezen).
  const UITKOMST_LETTER: Record<string, string> = {
    member: "M",
    shopper: "S",
    not_yet: "N",
  };

  async function wijzigFase(nieuwe: PipelineFase) {
    if (nieuwe === fase) {
      setOpen(false);
      return;
    }
    setBezig(true);
    const oud = fase;
    setFase(nieuwe); // optimistic
    setOpen(false);

    const { error } = await supabase
      .from("prospects")
      .update({ pipeline_fase: nieuwe })
      .eq("id", prospectId);

    if (error) {
      setFase(oud); // rollback
      toast.error("Fase wijzigen mislukt: " + error.message);
    } else {
      const nieuweInfo = faseInfo(nieuwe);
      toast.success(`Fase → ${nieuweInfo?.label ?? nieuwe}`);
      router.refresh();
    }
    setBezig(false);
  }

  // Progressie-dot = klein liggend balkje; uitkomst-dot = rond met letter,
  // zodat de twee groepen visueel te onderscheiden zijn (niet zomaar 8 dots
  // op een rij).
  const progressieDotKlasse =
    grootte === "compact" ? "w-4 h-1.5 rounded-full" : "w-6 h-2 rounded-full";
  const uitkomstDotKlasse =
    grootte === "compact"
      ? "w-4 h-4 rounded-full text-[9px] font-bold"
      : "w-5 h-5 rounded-full text-[10px] font-bold";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((o) => !o);
        }}
        disabled={bezig}
        className="flex items-center gap-2 group"
        title="Klik om fase te wijzigen"
      >
        {/* 5 progressie-dots */}
        <div className="flex items-center gap-1">
          {PROGRESSIE_FASEN.map((f, i) => {
            // Als eindstation: alle 5 dots gedimd (progressie is gelopen).
            // Als progressie: dots t/m huidigeIndex fel, rest grijs.
            const voltooid =
              isEindstation || (huidigeIndex >= 0 && i <= huidigeIndex);
            const huidigeDot = !isEindstation && i === huidigeIndex;
            const stapInfo = faseInfo(f);
            return (
              <span
                key={f}
                className={`${progressieDotKlasse} transition-all ${
                  huidigeDot ? "ring-2 ring-offset-1 ring-offset-cm-surface" : ""
                }`}
                style={{
                  background: voltooid
                    ? stapInfo?.tekstkleur ?? "#C9A84C"
                    : "#3A3A3A",
                  opacity: voltooid ? (isEindstation ? 0.4 : 1) : 0.5,
                  ...(huidigeDot
                    ? { boxShadow: `0 0 0 1px ${stapInfo?.tekstkleur}` }
                    : {}),
                }}
                title={stapInfo?.label}
              />
            );
          })}
        </div>

        {/* Verticale scheiding tussen progressie en uitkomst */}
        <span className="w-px h-3 bg-cm-border mx-0.5" />

        {/* 3 uitkomst-dots (M = Member, S = Shopper, N = Not Yet).
            De actieve uitkomst is gevuld met fase-kleur; de andere twee
            zijn een dunne ring — zo zie je direct WELKE uitkomst geldt. */}
        <div className="flex items-center gap-1">
          {EINDSTATIONS.map((f) => {
            const stapInfo = faseInfo(f);
            const actief = f === fase;
            return (
              <span
                key={f}
                className={`${uitkomstDotKlasse} inline-flex items-center justify-center transition-all`}
                style={
                  actief
                    ? {
                        background: stapInfo?.tekstkleur ?? "#C9A84C",
                        color: stapInfo?.kleur ?? "#000",
                        boxShadow: `0 0 0 2px ${stapInfo?.tekstkleur}`,
                      }
                    : {
                        background: "transparent",
                        color: stapInfo?.tekstkleur ?? "#666",
                        border: `1px solid ${stapInfo?.tekstkleur}`,
                        opacity: 0.35,
                      }
                }
                title={stapInfo?.label}
              >
                {UITKOMST_LETTER[f]}
              </span>
            );
          })}
        </div>

        {/* Tekst-label van huidige fase — blijft voor duidelijkheid */}
        {info && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full group-hover:ring-1 group-hover:ring-cm-gold/30 transition-all"
            style={{
              color: info.tekstkleur,
              background: info.kleur,
            }}
          >
            {info.label}
          </span>
        )}
      </button>

      {/* Dropdown met alle fasen */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-30 bg-cm-surface border border-cm-border rounded-lg shadow-xl py-1 min-w-[180px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-cm-white opacity-50">
            Progressie
          </div>
          {PROGRESSIE_FASEN.map((f) => {
            const i = faseInfo(f);
            const actief = f === fase;
            return (
              <button
                key={f}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  wijzigFase(f);
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-cm-surface-2 transition-colors flex items-center gap-2 ${
                  actief ? "bg-cm-surface-2" : ""
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: i?.tekstkleur ?? "#fff" }}
                />
                <span style={{ color: i?.tekstkleur }}>{i?.label}</span>
                {actief && (
                  <span className="ml-auto text-cm-gold text-xs">✓</span>
                )}
              </button>
            );
          })}
          <div className="border-t border-cm-border my-1" />
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-cm-white opacity-50">
            Uitkomst
          </div>
          {EINDSTATIONS.map((f) => {
            const i = faseInfo(f);
            const actief = f === fase;
            return (
              <button
                key={f}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  wijzigFase(f);
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-cm-surface-2 transition-colors flex items-center gap-2 ${
                  actief ? "bg-cm-surface-2" : ""
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: i?.tekstkleur ?? "#fff" }}
                />
                <span style={{ color: i?.tekstkleur }}>{i?.label}</span>
                {actief && (
                  <span className="ml-auto text-cm-gold text-xs">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
