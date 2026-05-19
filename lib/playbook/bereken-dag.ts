import { differenceInDays } from "date-fns";
import { DAGEN } from "@/lib/playbook/dagen";
import { CORE_DAGEN } from "@/lib/playbook/core-dagen";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// bereken-dag.ts, één bron voor "welke dag is de member nu op?"
//
// Twee modi qua bereken-logica, plus modus-bewust qua DAGEN-array:
//
//   MEMBER (default): VOORTGANG-GEBASEERD.
//     De huidige dag = de eerste dag (1-21) waarvan NIET alle
//     verplichte taken voltooid zijn. Iemand die dag 16 doet en dan
//     4 dagen niets, opent ELEVA opnieuw en staat alsnog op dag 17,
//     niet op dag 20.
//
//   TESTER / FOUNDER: KALENDER-GEBASEERD.
//     huidige dag = differenceInDays(vandaag, startdatum) + 1
//     Zo blijft de tester-toolbar (die startdatum verzet) werken.
//
// Modus-bewust: per 2026-05-19 leest deze helper de juiste DAGEN-
// array op basis van modus (Sprint = DAGEN, Core = CORE_DAGEN).
// Pro heeft geen dag-flow, retourneert 0.
// ============================================================

export type DagVoltooiingRij = {
  dag_nummer: number;
  taak_id: string;
};

/**
 * Berekent welke dag de member op staat.
 *
 * @param voltooiingen Alle dag_voltooiingen-rijen voor deze user.
 * @param startdatum Modus-specifieke startdatum (ISO) of legacy
 *   run_startdatum als fallback. Null = vandaag.
 * @param opties.isTester Tester of founder, → kalender-modus.
 * @param opties.modus sprint (default), core of pro. Pro = retourneert 0.
 */
export function berekenHuidigeDag(
  voltooiingen: DagVoltooiingRij[],
  startdatum: string | null,
  opties: { isTester?: boolean; modus?: Modus } = {},
): number {
  const modus: Modus = opties.modus ?? "sprint";

  // Pro: geen dag-flow.
  if (modus === "pro") return 0;

  // ========== TESTERS/FOUNDERS: kalender-modus ==========
  if (opties.isTester) {
    return berekenKalenderdag(startdatum);
  }

  // ========== MEMBERS: voortgang-modus ==========
  const dagenArray = modus === "core" ? CORE_DAGEN : DAGEN;

  // Bouw set van voltooide taken per dag.
  const voltooidPerDag = new Map<number, Set<string>>();
  for (const v of voltooiingen) {
    if (!voltooidPerDag.has(v.dag_nummer)) {
      voltooidPerDag.set(v.dag_nummer, new Set());
    }
    voltooidPerDag.get(v.dag_nummer)!.add(v.taak_id);
  }

  // Loop dag 1-21 in de juiste array, vind eerste waar verplichte
  // taken niet allemaal voltooid zijn.
  for (let dagNr = 1; dagNr <= 21; dagNr++) {
    const dagData = dagenArray.find((d) => d.nummer === dagNr);
    if (!dagData) continue;
    const verplichteTaken = dagData.vandaagDoen.filter((t) => t.verplicht);
    if (verplichteTaken.length === 0) continue;
    const voltooid = voltooidPerDag.get(dagNr) ?? new Set<string>();
    const alleVerplichteVoltooid = verplichteTaken.every((t) =>
      voltooid.has(t.id),
    );
    if (!alleVerplichteVoltooid) {
      return dagNr;
    }
  }

  // Alle 21 dagen voltooid: door naar weekritme (Sprint) of
  // verankering/lifetime (Core). Daar gebruiken we kalenderdag.
  return Math.max(22, berekenKalenderdag(startdatum));
}

/**
 * Klassieke kalender-berekening: hoeveel dagen sinds startdatum?
 * Wordt gebruikt door testers/founders en voor dag 22+.
 *
 * Voor Core mag dit getal boven 60 uitkomen (lifetime). Voor Sprint
 * cappen we op 60 in de caller. Voor Pro is deze helper irrelevant.
 */
export function berekenKalenderdag(startdatum: string | null): number {
  const start = startdatum ? new Date(startdatum) : new Date();
  const dag = differenceInDays(new Date(), start) + 1;
  return Math.max(1, dag);
}
