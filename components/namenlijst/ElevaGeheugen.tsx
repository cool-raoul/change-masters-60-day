"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VCardUploader } from "@/components/vandaag/inline-embeds/VCardUploader";
import {
  haalNietGeactiveerd,
  activeerContacten,
  type ReservoirRow,
} from "@/lib/contacten-reservoir";

// ============================================================
// ElevaGeheugen — uitklap-blok bovenaan /namenlijst.
//
// Toont 2 dingen in 1 component:
//   1. NIEUWE CONTACTEN TOEVOEGEN aan je geheugen (VCardUploader,
//      hergebruikt — kan via vCard, native picker, of zelf typen).
//   2. ACTIVEREN: een lijst van contacten die in je geheugen zitten
//      maar nog NIET op je actieve namenlijst staan. Vink aan welke
//      je vandaag activeert.
//
// Member uploadt z'n adresboek 1×, kiest dagelijks een batch om actief
// te maken, blijft de rest veilig in het geheugen voor later.
// ============================================================

export function ElevaGeheugen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reservoir, setReservoir] = useState<ReservoirRow[]>([]);
  const [laden, setLaden] = useState(true);
  const [bezig, setBezig] = useState(false);
  const [zoek, setZoek] = useState("");
  const [geselecteerd, setGeselecteerd] = useState<Set<string>>(new Set());

  async function herlaad() {
    setLaden(true);
    try {
      const rows = await haalNietGeactiveerd();
      setReservoir(rows);
    } catch (e) {
      console.error(e);
    } finally {
      setLaden(false);
    }
  }

  useEffect(() => {
    void herlaad();
  }, []);

  const zichtbaar = reservoir.filter((row) => {
    if (!zoek.trim()) return true;
    const q = zoek.toLowerCase();
    return (
      row.volledige_naam.toLowerCase().includes(q) ||
      (row.telefoon ?? "").includes(q)
    );
  });

  function selecteerEersteN(n: number) {
    const s = new Set<string>();
    for (let i = 0; i < Math.min(n, reservoir.length); i++) {
      s.add(reservoir[i].id);
    }
    setGeselecteerd(s);
  }

  function selecteerAlleZichtbaar() {
    const s = new Set(geselecteerd);
    for (const r of zichtbaar) s.add(r.id);
    setGeselecteerd(s);
  }

  function toggle(id: string) {
    setGeselecteerd((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function activeerSelectie() {
    const ids = Array.from(geselecteerd);
    if (ids.length === 0) {
      toast.error("Vink eerst de namen aan die je wilt activeren");
      return;
    }
    setBezig(true);
    try {
      const result = await activeerContacten(ids);
      const totaal = result.geactiveerd + result.alActief;
      if (totaal === 0) {
        toast.error("Activeren mislukt — probeer opnieuw");
        return;
      }
      toast.success(
        `🎉 ${result.geactiveerd} naar je namenlijst${result.alActief > 0 ? ` (${result.alActief} stonden er al)` : ""}`,
      );
      setGeselecteerd(new Set());
      setZoek("");
      // Herlaad reservoir én ververs de pagina (zodat de pipeline/lijst
      // ook de nieuwe prospects toont).
      await herlaad();
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Activeren mislukt — probeer opnieuw");
    } finally {
      setBezig(false);
    }
  }

  // Subtiele variant als geheugen leeg is — dan hoeft de hele sectie
  // niet open te knallen op /namenlijst, alleen een 'voeg toe'-knop.
  const heeftReservoir = reservoir.length > 0;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-xl border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-3 group"
    >
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none">
        <div className="flex-1 min-w-0">
          <p className="text-cm-gold font-semibold text-sm flex items-center gap-2 flex-wrap">
            📚 Mijn ELEVA-geheugen
            {heeftReservoir && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cm-gold/20 text-cm-gold uppercase tracking-wider">
                {reservoir.length} klaar voor activatie
              </span>
            )}
          </p>
          <p className="text-cm-white opacity-70 text-xs mt-0.5 leading-relaxed">
            {heeftReservoir
              ? "Je voorraadkast is gevuld. Kies wie je vandaag actief op je namenlijst zet."
              : "Voeg je telefoon-contacten toe om straks dagelijks een batch te kunnen activeren."}
          </p>
        </div>
        <span className="text-cm-gold text-xs transition-transform group-open:rotate-180 flex-shrink-0">
          ▼
        </span>
      </summary>

      {open && (
        <div className="mt-4 pt-4 border-t border-cm-border space-y-5">
          {/* DEEL 1: ACTIVEER UIT GEHEUGEN */}
          {laden ? (
            <p className="text-cm-white opacity-50 text-xs italic">
              Geheugen laden…
            </p>
          ) : heeftReservoir ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-cm-gold font-semibold text-sm">
                  ✓ Activeer uit je geheugen
                </p>
                <p className="text-cm-white opacity-70 text-xs leading-relaxed">
                  {reservoir.length} contact
                  {reservoir.length === 1 ? "" : "en"} klaar om te activeren.
                  Vink aan wie je vandaag op je actieve namenlijst wilt zetten —
                  de rest blijft beschikbaar voor later.
                </p>
              </div>

              <input
                type="search"
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                placeholder="🔍 Zoek op naam of nummer..."
                className="textarea-cm w-full text-sm py-2 px-3"
              />

              <div className="flex flex-wrap gap-1.5">
                {reservoir.length >= 50 && (
                  <button
                    type="button"
                    onClick={() => selecteerEersteN(50)}
                    className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white hover:border-cm-gold-dim"
                  >
                    Eerste 50
                  </button>
                )}
                {reservoir.length >= 100 && (
                  <button
                    type="button"
                    onClick={() => selecteerEersteN(100)}
                    className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white hover:border-cm-gold-dim"
                  >
                    Eerste 100
                  </button>
                )}
                <button
                  type="button"
                  onClick={selecteerAlleZichtbaar}
                  className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white hover:border-cm-gold-dim"
                >
                  {zoek
                    ? `Vink alles aan (${zichtbaar.length})`
                    : `Vink alles aan`}
                </button>
                {geselecteerd.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setGeselecteerd(new Set())}
                    className="px-2.5 py-1 rounded-md border border-cm-border text-xs text-cm-white opacity-60 hover:opacity-100"
                  >
                    Niks
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto rounded border border-cm-border bg-cm-bg/40">
                {zichtbaar.length === 0 ? (
                  <p className="text-cm-white opacity-50 text-xs italic px-3 py-4 text-center">
                    Geen treffers voor "{zoek}"
                  </p>
                ) : (
                  <ul className="divide-y divide-cm-border">
                    {zichtbaar.map((row) => (
                      <li key={row.id}>
                        <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-cm-gold/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={geselecteerd.has(row.id)}
                            onChange={() => toggle(row.id)}
                            className="flex-shrink-0 accent-cm-gold w-4 h-4"
                          />
                          <span className="flex-1 text-sm text-cm-white truncate">
                            {row.volledige_naam}
                          </span>
                          {row.telefoon && (
                            <span className="text-cm-white opacity-50 text-[10px] whitespace-nowrap">
                              {row.telefoon}
                            </span>
                          )}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={activeerSelectie}
                disabled={bezig || geselecteerd.size === 0}
                className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-30"
              >
                {bezig
                  ? "Activeren..."
                  : geselecteerd.size === 0
                    ? "Vink eerst namen aan"
                    : `✓ Activeer ${geselecteerd.size} naar mijn namenlijst`}
              </button>
            </div>
          ) : (
            <p className="text-cm-white opacity-60 text-xs italic">
              Je geheugen is nog leeg. Voeg hieronder je telefoon-contacten toe.
            </p>
          )}

          {/* DEEL 2: NIEUWE CONTACTEN TOEVOEGEN AAN GEHEUGEN */}
          <details className="rounded-lg border border-cm-border bg-cm-bg/30 px-3 py-2 group/sub">
            <summary className="flex items-center justify-between gap-2 cursor-pointer list-none">
              <p className="text-cm-white text-sm font-semibold">
                ➕ Voeg meer contacten toe aan je geheugen
              </p>
              <span className="text-cm-gold text-xs transition-transform group-open/sub:rotate-180">
                ▼
              </span>
            </summary>
            <div className="mt-3 pt-3 border-t border-cm-border">
              <VCardUploader
                opVoltooid={() => {
                  // Na succesvolle import: herlaad reservoir + ververs page
                  void herlaad();
                  router.refresh();
                }}
              />
            </div>
          </details>
        </div>
      )}
    </details>
  );
}
