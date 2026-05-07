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
// Twee-stappen-flow voor product-herbestelling-herinneringen:
//   STAP 1, Kies-modus: presets + eigen datum.
//   STAP 2, Bevestig-modus: toont preview met datum + lijstje van
//     opvolgende herinneringen die mee zouden schuiven (oude -> nieuwe
//     datum). Gebruiker kiest:
//       - 'Ja, alle mee verplaatsen'     -> deze + opvolgende
//       - 'Alleen deze ene'              -> enkel deze update
//       - 'Annuleer'                     -> terug naar kies-modus
//
// Voor andere types (followup, custom): geen bevestig-modus, direct
// verplaatsen want er is geen reeks om mee te schuiven.
// ============================================================

type Preset = { label: string; dagen: number };

const PRESETS: Preset[] = [
  { label: "Morgen", dagen: 1 },
  { label: "Over 3 dagen", dagen: 3 },
  { label: "Volgende week", dagen: 7 },
  { label: "Over 2 weken", dagen: 14 },
  { label: "Over een maand", dagen: 30 },
];

type OpvolgendeRij = {
  id: string;
  titel: string;
  oudeDatum: string;
  nieuweDatum: string;
};

function formatDatumLang(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatDatumKort(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}

export function HerinneringVerplaatsKnop({
  herinneringId,
  huidigeDatum,
  prospectId = null,
  herinneringType = "custom",
}: {
  herinneringId: string;
  huidigeDatum: string;
  /** Optioneel, alleen nodig voor smart-shift bij product-herbestelling. */
  prospectId?: string | null;
  /** Optioneel, default 'custom'. Als 'product_herbestelling', dan
   *  toont een bevestig-modus met preview van opvolgende herinneringen
   *  die mee zouden schuiven, plus keuze 'alle mee' of 'alleen deze'. */
  herinneringType?: string;
}) {
  const [open, setOpen] = useState(false);
  const [eigenDatum, setEigenDatum] = useState("");
  const [laden, setLaden] = useState(false);
  // Bevestig-modus state. Als bevestigDatum gezet is, toont het popup
  // de preview-stap ipv de kies-stap.
  const [bevestigDatum, setBevestigDatum] = useState<string | null>(null);
  const [opvolgendeData, setOpvolgendeData] = useState<OpvolgendeRij[]>([]);
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
        setBevestigDatum(null);
        setOpvolgendeData([]);
      }
    }
    document.addEventListener("mousedown", buitenKlik);
    return () => document.removeEventListener("mousedown", buitenKlik);
  }, [open]);

  function resetAll() {
    setOpen(false);
    setEigenDatum("");
    setBevestigDatum(null);
    setOpvolgendeData([]);
  }

  /**
   * Eerste stap. Bij product_herbestelling: query opvolgende en open
   * bevestig-modus. Bij andere types: direct verplaatsen.
   */
  async function voorbereidVerplaats(datumIso: string) {
    if (datumIso === huidigeDatum) {
      toast.info("Datum is al hetzelfde");
      return;
    }

    // Andere types: directe verplaatsing zonder preview-stap.
    if (herinneringType !== "product_herbestelling" || !prospectId) {
      await voerVerplaatsUit(datumIso, []);
      return;
    }

    // Product-herbestelling: pak opvolgende en bouw preview.
    setLaden(true);
    const oude = new Date(huidigeDatum);
    const nieuwe = new Date(datumIso);
    const deltaDagen = Math.round(
      (nieuwe.getTime() - oude.getTime()) / (1000 * 60 * 60 * 24),
    );

    const { data: opvolgende } = await supabase
      .from("herinneringen")
      .select("id, titel, vervaldatum")
      .eq("prospect_id", prospectId)
      .eq("herinnering_type", "product_herbestelling")
      .eq("voltooid", false)
      .gt("vervaldatum", huidigeDatum)
      .neq("id", herinneringId);

    const rijen: OpvolgendeRij[] = ((opvolgende as Array<{
      id: string;
      titel: string;
      vervaldatum: string;
    }>) ?? []).map((h) => {
      const verschoven = new Date(h.vervaldatum);
      verschoven.setDate(verschoven.getDate() + deltaDagen);
      return {
        id: h.id,
        titel: h.titel,
        oudeDatum: h.vervaldatum,
        nieuweDatum: verschoven.toISOString().split("T")[0],
      };
    });

    setBevestigDatum(datumIso);
    setOpvolgendeData(rijen);
    setLaden(false);
  }

  /**
   * Voert de daadwerkelijke DB-update uit. Update deze herinnering en
   * (optioneel) een lijst van opvolgende herinneringen.
   */
  async function voerVerplaatsUit(
    datumIso: string,
    opvolgende: OpvolgendeRij[],
  ) {
    setLaden(true);

    const { error } = await supabase
      .from("herinneringen")
      .update({ vervaldatum: datumIso })
      .eq("id", herinneringId);

    if (error) {
      toast.error("Verplaatsen mislukt: " + error.message);
      setLaden(false);
      return;
    }

    let aantalMee = 0;
    for (const opv of opvolgende) {
      const { error: opvErr } = await supabase
        .from("herinneringen")
        .update({ vervaldatum: opv.nieuweDatum })
        .eq("id", opv.id);
      if (!opvErr) aantalMee += 1;
    }

    const dateLabel = formatDatumLang(datumIso);
    if (aantalMee > 0) {
      toast.success(
        `Verplaatst naar ${dateLabel}, ${aantalMee} opvolgende mee verschoven`,
      );
    } else {
      toast.success(`Verplaatst naar ${dateLabel}`);
    }

    resetAll();
    router.refresh();
    setLaden(false);
  }

  function presetVerplaats(dagenVooruit: number) {
    const basis = new Date();
    basis.setHours(0, 0, 0, 0);
    basis.setDate(basis.getDate() + dagenVooruit);
    const iso = basis.toISOString().split("T")[0];
    voorbereidVerplaats(iso);
  }

  const vandaagIso = new Date().toISOString().split("T")[0];
  const inBevestigModus = bevestigDatum !== null;
  const heeftOpvolgende = opvolgendeData.length > 0;

  return (
    <div
      ref={wrapperRef}
      className="relative flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            resetAll();
          } else {
            setOpen(true);
          }
        }}
        disabled={laden}
        className="w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all border-white/30 bg-white/5 hover:border-cm-gold hover:bg-cm-gold/10 text-cm-white/70 hover:text-cm-gold"
        title="Verplaats herinnering naar later"
        aria-label="Verplaats herinnering"
      >
        <span className="text-sm">📅</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 rounded-xl bg-cm-surface border border-cm-border shadow-2xl z-50 overflow-hidden">
          {!inBevestigModus ? (
            // ============================================================
            // KIES-MODUS: presets + eigen datum
            // ============================================================
            <div className="py-1">
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
                    onClick={() => voorbereidVerplaats(eigenDatum)}
                    disabled={laden}
                    className="btn-gold text-xs w-full mt-2"
                  >
                    {laden ? "Bezig..." : "Verplaats hierheen"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            // ============================================================
            // BEVESTIG-MODUS: preview + Ja / Alleen deze / Annuleer
            // ============================================================
            <div className="p-3">
              <div className="text-[11px] text-cm-white/60 uppercase tracking-wider font-semibold mb-2">
                Bevestig verplaatsen
              </div>
              <p className="text-sm text-cm-white mb-3 leading-relaxed">
                Deze herinnering verplaatsen naar
                <br />
                <span className="text-cm-gold font-medium">
                  {formatDatumLang(bevestigDatum!)}
                </span>
                ?
              </p>

              {heeftOpvolgende && (
                <div className="bg-cm-surface-2/60 border border-cm-border rounded-lg p-2.5 mb-3">
                  <p className="text-[11px] text-cm-white/60 uppercase tracking-wider font-semibold mb-2">
                    {opvolgendeData.length} opvolgende
                    {opvolgendeData.length === 1
                      ? " herinnering"
                      : " herinneringen"}{" "}
                    schuiven mee
                  </p>
                  <ul className="space-y-1.5">
                    {opvolgendeData.map((h) => {
                      // Titel kort: "Herbestelling check #1 — naam" → "check #1"
                      const kortTitel =
                        h.titel
                          .replace(/Herbestelling /i, "")
                          .split(" — ")[0] || h.titel;
                      return (
                        <li
                          key={h.id}
                          className="text-xs text-cm-white/85 flex items-center justify-between gap-2"
                        >
                          <span className="text-cm-white/60 capitalize">
                            {kortTitel}:
                          </span>
                          <span className="whitespace-nowrap">
                            <span className="text-cm-white/60">
                              {formatDatumKort(h.oudeDatum)}
                            </span>
                            {" → "}
                            <span className="text-cm-gold">
                              {formatDatumKort(h.nieuweDatum)}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {heeftOpvolgende ? (
                  <>
                    <button
                      onClick={() =>
                        voerVerplaatsUit(bevestigDatum!, opvolgendeData)
                      }
                      disabled={laden}
                      className="btn-gold text-xs w-full py-2"
                    >
                      {laden
                        ? "Bezig..."
                        : `Ja, alle ${opvolgendeData.length + 1} mee verplaatsen`}
                    </button>
                    <button
                      onClick={() => voerVerplaatsUit(bevestigDatum!, [])}
                      disabled={laden}
                      className="text-xs text-cm-white/85 hover:text-cm-white py-1.5 transition-colors border border-cm-border rounded-lg"
                    >
                      Alleen deze ene
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => voerVerplaatsUit(bevestigDatum!, [])}
                    disabled={laden}
                    className="btn-gold text-xs w-full py-2"
                  >
                    {laden ? "Bezig..." : "Ja, verplaatsen"}
                  </button>
                )}
                <button
                  onClick={() => {
                    setBevestigDatum(null);
                    setOpvolgendeData([]);
                  }}
                  disabled={laden}
                  className="text-xs text-cm-white/60 hover:text-cm-white/90 py-1.5 transition-colors"
                >
                  Annuleer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
