"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// TesterToolbar, kleine toolbar bovenaan dashboard / vandaag voor
// pilot-testers + founders.
//
// urlModus="startdatum" (default): klikken POST naar
//   /api/tester/spring-naar-dag, verzet run_startdatum (oud gedrag,
//   gebruikt op dashboard). Refresh-driven.
//
// urlModus="queryparam": klikken navigeert naar /vandaag?dag=N. Geen
//   server-call, geen verzet startdatum. Founder kan zo elke dag
//   bekijken zonder voortgang aan te raken (gebruikt op /vandaag).
// ============================================================

type Props = {
  huidigeDag: number;
  urlModus?: "startdatum" | "queryparam";
};

export function TesterToolbar({
  huidigeDag,
  urlModus = "startdatum",
}: Props) {
  const router = useRouter();
  const [bezig, setBezig] = useState(false);
  const [open, setOpen] = useState(false);
  const [dagInput, setDagInput] = useState(String(huidigeDag));

  async function springNaar(dag: number) {
    if (bezig) return;
    if (urlModus === "queryparam") {
      // Pure URL-navigatie, geen server-call. /vandaag/page.tsx leest
      // ?dag=N voor founders en toont die dag.
      router.push(`/vandaag?dag=${dag}`);
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/tester/spring-naar-dag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dagNummer: dag }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Springen mislukt");
        return;
      }

      // Wis de 'gesloten'-vlag voor de NIEUWE dag zodat AutoNaarVandaag
      // 'm opnieuw oppakt en de tester de flow van die dag opnieuw te zien
      // krijgt. Voor andere dagen laten we de vlag staan, anders krijg je
      // een loop tussen /dashboard en /vandaag bij dag 1 → 1.
      try {
        const datum = new Date().toISOString().split("T")[0];
        const k = `eleva-vandaag-flow-dag${dag}-${datum}`;
        window.localStorage.removeItem(k);
        // En verwijder ook de positie-state zodat we netjes bij de intro
        // van de nieuwe dag beginnen.
        const pk = `eleva-vandaag-flow-positie-dag${dag}-${datum}`;
        window.localStorage.removeItem(pk);
      } catch {
        // negeer
      }

      toast.success(`🧪 Nu op dag ${dag}`);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function springCustom() {
    const d = Number(dagInput);
    if (!Number.isFinite(d) || d < 1 || d > 60) {
      toast.error("Kies een dag tussen 1 en 60");
      return;
    }
    springNaar(d);
  }

  return (
    <div className="rounded-lg border border-purple-500/40 bg-purple-900/20 px-2 sm:px-4 py-1.5 sm:py-2.5">
      <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500 text-white font-bold whitespace-nowrap">
            🧪<span className="hidden sm:inline ml-1">Test-modus</span>
          </span>
          <span className="text-cm-white text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Je bent virtueel op </span>
            <strong className="text-purple-300">dag {huidigeDag}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-purple-300 hover:underline underline-offset-2 whitespace-nowrap"
        >
          {open ? "Inklappen" : (
            <>
              <span className="hidden sm:inline">Spring naar andere dag </span>
              <span className="sm:hidden">Spring </span>
              →
            </>
          )}
        </button>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-purple-500/30 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-purple-300 mr-1">
                Week 1-3
              </span>
              {[1, 5, 10, 15, 18, 21].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => springNaar(d)}
                  disabled={bezig || d === huidigeDag}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    d === huidigeDag
                      ? "border-purple-400 bg-purple-500 text-white font-semibold"
                      : "border-purple-500/40 text-purple-200 hover:bg-purple-500/20"
                  } disabled:opacity-50`}
                >
                  Dag {d}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-purple-300 mr-1">
                Weekritme
              </span>
              {[22, 30, 40, 50, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => springNaar(d)}
                  disabled={bezig || d === huidigeDag}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    d === huidigeDag
                      ? "border-purple-400 bg-purple-500 text-white font-semibold"
                      : "border-purple-500/40 text-purple-200 hover:bg-purple-500/20"
                  } disabled:opacity-50`}
                >
                  Dag {d}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={60}
              value={dagInput}
              onChange={(e) => setDagInput(e.target.value)}
              className="input-cm w-24 text-sm"
              placeholder="1-60"
            />
            <button
              type="button"
              onClick={springCustom}
              disabled={bezig}
              className="text-xs px-3 py-1.5 rounded-full bg-purple-500 hover:bg-purple-600 text-white font-semibold disabled:opacity-50"
            >
              Spring
            </button>
            <span className="text-xs text-purple-200 opacity-70">
              {urlModus === "queryparam"
                ? "(alleen view, je voortgang blijft staan)"
                : "(verzet je startdatum, testers + founders only)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
