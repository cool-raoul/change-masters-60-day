"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  haalNietGeactiveerd,
  activeerContacten,
  type ReservoirRow,
} from "@/lib/contacten-reservoir";

// ============================================================
// NamenForm, inline-embed voor taken als 'voeg 20 namen toe'.
//
// Drie routes naast elkaar, altijd zichtbaar zodra de form opent:
//   1. 📚 SELECTEER UIT JE TELEFOON-GEHEUGEN
//      Alleen als er rows in contacten_reservoir staan die nog niet
//      geactiveerd zijn. Snelste route: vink aan wie je herkent, klik
//      'activeer'. Snelheid + geen denkwerk.
//
//   2. 📲 IMPORTEER ALSNOG JE TELEFOON
//      Alleen als er nog GEEN reservoir-rows zijn. Verwijst naar
//      /namenlijst waar VCardUploader staat. Daarna kun je terug
//      naar dag 2 voor de activatie-stap.
//
//   3. ✋ ZELF TYPEN
//      Altijd zichtbaar als fallback. Handmatige naam + telefoon
//      velden, bewaart direct naar prospects-tabel.
//
// Voortgangsbalk telt geheugen-geactiveerde + handmatig-ingevulde
// samen, zodat de gebruiker het doel kan halen via beide routes.
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
  /** Verberg telefoon-import-routes en toon alleen het handmatige
   *  type-veld. Wordt op /onboarding stap 3 gebruikt waar we
   *  expliciet de spontane denkflow willen ("uit je hoofd"). De
   *  telefoon-import komt later in Sprint dag 1 of Core dag 2. */
  alleenHandmatig?: boolean;
};

// Helper: markeer 'eerste-5-namen' in cross-modus skip-tabel. Idempotent
// (23505 unique-violation wordt aan de server-kant geslikt). Faalt stil.
async function markeerEersteVijfNamenAlsCrossModusVoltooid() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("modus")
      .eq("id", user.id)
      .maybeSingle();
    const modus = (prof as { modus?: string | null } | null)?.modus ?? "sprint";
    await fetch("/api/onboarding/markeer-voltooid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "eerste-5-namen", modus }),
    });
  } catch {
    /* stil falen */
  }
}

export function NamenForm({
  doel,
  alVoltooid,
  opVoltooid,
  opOpnieuw,
  alleenHandmatig = false,
}: Props) {
  // Start met `doel` lege rijen + 5 buffer (zodat 'ie ruimte heeft).
  const [rijen, setRijen] = useState<Rij[]>(
    Array.from({ length: doel + 5 }, () => ({ naam: "", telefoon: "" })),
  );
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(alVoltooid);

  // Reservoir-state: niet-geactiveerde rijen (= telefoon-geheugen
  // dat klaarstaat om gekozen te worden).
  const [reservoirRows, setReservoirRows] = useState<ReservoirRow[]>([]);
  const [reservoirLaden, setReservoirLaden] = useState(true);
  const [keuzeOpen, setKeuzeOpen] = useState(false);
  const [selectie, setSelectie] = useState<Set<string>>(new Set());
  const [geactiveerd, setGeactiveerd] = useState(0); // teller voor progress
  const [activerenBezig, setActiverenBezig] = useState(false);

  // Op mount het reservoir ophalen. Bepaalt of de "Selecteer uit
  // geheugen"-knop of de "Importeer alsnog"-knop wordt getoond.
  useEffect(() => {
    let geannuleerd = false;
    haalNietGeactiveerd()
      .then((rows) => {
        if (!geannuleerd) setReservoirRows(rows);
      })
      .catch(() => {
        // Geen reservoir-toegang of fout, val terug op alleen-handmatig.
      })
      .finally(() => {
        if (!geannuleerd) setReservoirLaden(false);
      });
    return () => {
      geannuleerd = true;
    };
  }, []);

  const handmatigIngevuld = rijen.filter((r) => r.naam.trim().length > 0).length;
  const ingevuld = handmatigIngevuld + geactiveerd;
  const procent = Math.min(100, Math.round((ingevuld / doel) * 100));

  function update(idx: number, veld: keyof Rij, waarde: string) {
    setRijen((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [veld]: waarde } : r)),
    );
  }

  function voegRijToe() {
    setRijen((prev) => [...prev, { naam: "", telefoon: "" }]);
  }

  function toggleSelectie(id: string) {
    setSelectie((prev) => {
      const nieuw = new Set(prev);
      if (nieuw.has(id)) nieuw.delete(id);
      else nieuw.add(id);
      return nieuw;
    });
  }

  function selecteerAlles() {
    setSelectie(new Set(reservoirRows.map((r) => r.id)));
  }

  function wisSelectie() {
    setSelectie(new Set());
  }

  async function activeerGeheugen() {
    if (selectie.size === 0) {
      toast.error("Vink eerst minstens 1 naam aan");
      return;
    }
    setActiverenBezig(true);
    try {
      const result = await activeerContacten(Array.from(selectie));
      if (result.geactiveerd === 0 && result.alActief > 0) {
        toast.success("Deze namen stonden al op je lijst");
      } else {
        toast.success(
          `🎉 ${result.geactiveerd} ${result.geactiveerd === 1 ? "naam" : "namen"} uit je geheugen op je lijst gezet`,
        );
      }
      // Update teller voor progress, verwijder geactiveerde rows uit
      // het zichtbare reservoir, sluit keuze-paneel.
      const nieuwTotaalGeactiveerd = geactiveerd + result.geactiveerd;
      setGeactiveerd(nieuwTotaalGeactiveerd);
      setReservoirRows((prev) => prev.filter((r) => !selectie.has(r.id)));
      setSelectie(new Set());
      setKeuzeOpen(false);

      // Als we het doel hebben gehaald PUUR via geheugen (geen handmatige
      // rijen), de taak automatisch afvinken zodat de member niet alsnog
      // op "Bewaar 0" hoeft te drukken.
      if (handmatigIngevuld === 0 && nieuwTotaalGeactiveerd >= doel) {
        setKlaar(true);
        markeerEersteVijfNamenAlsCrossModusVoltooid();
        opVoltooid();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "onbekende fout";
      toast.error(`Activeren mislukt: ${msg}`);
    } finally {
      setActiverenBezig(false);
    }
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
      markeerEersteVijfNamenAlsCrossModusVoltooid();
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
          Top, je voorraadkast is een laag voller. Door naar de volgende stap.
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
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-4">
      <div className="space-y-1.5">
        <h4 className="text-cm-gold font-semibold text-sm">
          📝 Voeg minimaal {doel} {doel === 1 ? "naam" : "namen"} toe aan je lijst
        </h4>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          Familie, oude collega's, sportmaatjes, ouders bij school of voetbal, buren, ondernemers in je netwerk. Niet filteren, alles erop. Filteren komt later, en doe je nooit voor iemand anders.
        </p>
      </div>

      {/* Voortgangsbalk, telt geheugen-geactiveerde + handmatig samen */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cm-white opacity-70">
            <strong className="text-cm-gold">{ingevuld}</strong> van {doel}{" "}
            namen
            {geactiveerd > 0 && (
              <span className="text-cm-white opacity-50">
                {" "}
                ({geactiveerd} uit geheugen, {handmatigIngevuld} zelf)
              </span>
            )}
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

      {/* ROUTE 1: Selecteer uit telefoon-geheugen (als reservoir gevuld is)
          Verbergen bij alleenHandmatig=true (pre-day-1 stap 3, daar willen we
          spontaan-uit-hoofd, telefoon-import komt later in dag 1/2). */}
      {!alleenHandmatig && !reservoirLaden && reservoirRows.length > 0 && (
        <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/10 p-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-cm-gold font-semibold text-sm flex items-center gap-2">
                📚 Snelste route: je telefoon-geheugen
              </p>
              <p className="text-cm-white opacity-80 text-xs leading-relaxed mt-1">
                Je hebt <strong className="text-cm-white">{reservoirRows.length}</strong> namen in je telefoon-geheugen staan. Vink aan wie je herkent, dat scheelt typen.
              </p>
            </div>
            {!keuzeOpen && (
              <button
                type="button"
                onClick={() => setKeuzeOpen(true)}
                className="btn-gold text-xs py-1.5 px-3 whitespace-nowrap"
              >
                Openen →
              </button>
            )}
          </div>

          {keuzeOpen && (
            <div className="space-y-2 pt-2">
              {/* Selectie-knoppen */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-cm-white opacity-70">
                  <strong className="text-cm-gold">{selectie.size}</strong>
                  {" "}aangevinkt
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={selecteerAlles}
                    className="text-cm-gold hover:underline underline-offset-2"
                  >
                    Alles
                  </button>
                  <button
                    type="button"
                    onClick={wisSelectie}
                    className="text-cm-white opacity-70 hover:opacity-100"
                  >
                    Wis
                  </button>
                </div>
              </div>

              {/* Scrollbare lijst met checkboxes */}
              <div className="max-h-64 overflow-y-auto space-y-0.5 bg-cm-surface-2 rounded p-2">
                {reservoirRows.map((row) => {
                  const aan = selectie.has(row.id);
                  return (
                    <label
                      key={row.id}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        aan ? "bg-cm-gold/15" : "hover:bg-cm-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={aan}
                        onChange={() => toggleSelectie(row.id)}
                        className="w-4 h-4 flex-shrink-0 accent-cm-gold"
                      />
                      <span className="text-sm text-cm-white flex-1 truncate">
                        {row.volledige_naam}
                      </span>
                      {row.telefoon && (
                        <span className="text-xs text-cm-white opacity-40">
                          {row.telefoon}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={activeerGeheugen}
                  disabled={activerenBezig || selectie.size === 0}
                  className="btn-gold text-xs py-2 px-4 flex-1 disabled:opacity-30"
                >
                  {activerenBezig
                    ? "Bezig..."
                    : selectie.size === 0
                      ? "Vink eerst namen aan"
                      : `✓ Zet ${selectie.size} op mijn lijst`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKeuzeOpen(false);
                    setSelectie(new Set());
                  }}
                  className="text-xs text-cm-white opacity-70 hover:opacity-100 px-2 py-2"
                >
                  Sluit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROUTE 2: Importeer alsnog (als reservoir leeg is). Verbergen
          bij alleenHandmatig=true. */}
      {!alleenHandmatig && !reservoirLaden && reservoirRows.length === 0 && geactiveerd === 0 && (
        <div className="rounded-lg border border-blue-500/40 bg-blue-900/15 p-3 space-y-2">
          <p className="text-blue-300 font-semibold text-sm flex items-center gap-2">
            📲 Sneller: importeer je telefoon
          </p>
          <p className="text-cm-white opacity-80 text-xs leading-relaxed">
            Je hebt nog geen telefoon-contacten geïmporteerd. Doe dat alsnog op je telefoon, dan kun je hier vanuit het geheugen kiezen in plaats van zelf typen.
          </p>
          <Link
            href="/namenlijst"
            className="inline-flex items-center gap-1 text-xs bg-blue-900/40 border border-blue-600/30 text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-900/60 transition-colors"
          >
            📲 Importeer mijn telefoon →
          </Link>
        </div>
      )}

      {/* Scheiding tussen 'sneller'-route en handmatig typen */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-cm-white/40">
        <div className="flex-1 h-px bg-cm-white/15" />
        <span>of typ ze zelf</span>
        <div className="flex-1 h-px bg-cm-white/15" />
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
        disabled={bezig || handmatigIngevuld === 0}
        className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-30"
      >
        {bezig
          ? "Bewaren..."
          : handmatigIngevuld === 0
            ? geactiveerd > 0 && ingevuld >= doel
              ? "✓ Doel gehaald via geheugen"
              : "Vink namen aan of typ ze hieronder"
            : `✓ Bewaar ${handmatigIngevuld} ${handmatigIngevuld === 1 ? "naam" : "namen"} op mijn lijst`}
      </button>
    </div>
  );
}
