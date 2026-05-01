import { differenceInDays } from "date-fns";
import { DAGEN } from "@/lib/playbook/dagen";

// ============================================================
// bereken-dag.ts, één bron voor "welke dag is de member nu op?"
//
// Twee modi, afhankelijk van rol:
//
//   MEMBER (default): VOORTGANG-GEBASEERD.
//     De huidige dag = de eerste dag (1-21) waarvan NIET alle
//     verplichte taken voltooid zijn. Iemand die dag 16 doet en dan
//     4 dagen niets, opent ELEVA opnieuw en staat alsnog op dag 17,
//     niet op dag 20. Dit past bij '60 dagen progress', niet '60 dagen
//     kalender'. Niemand slaat content over door drukke periodes.
//
//   TESTER / FOUNDER: KALENDER-GEBASEERD.
//     `huidige dag = differenceInDays(vandaag, run_startdatum) + 1`.
//     Dit zorgt dat de tester-toolbar (die run_startdatum verzet)
//     blijft werken. Anders zou springen geen effect hebben.
//
// Buiten dag 1-21 (= dag 22+ = weekritme): kalender-gebaseerd, want
// daar bepaalt de wandklok het ritme, niet de voltooide content.
// ============================================================

export type DagVoltooiingRij = {
  dag_nummer: number;
  taak_id: string;
};

/**
 * Berekent welke dag de member op staat.
 *
 * @param voltooiingen Alle dag_voltooiingen-rijen voor deze user.
 * @param runStartdatum profile.run_startdatum (ISO-datum) of null.
 * @param opties.isTester Tester of founder, → kalender-modus.
 */
export function berekenHuidigeDag(
  voltooiingen: DagVoltooiingRij[],
  runStartdatum: string | null,
  opties: { isTester?: boolean } = {},
): number {
  // ========== TESTERS/FOUNDERS: kalender-modus ==========
  if (opties.isTester) {
    return berekenKalenderdag(runStartdatum);
  }

  // ========== MEMBERS: voortgang-modus ==========
  // Bouw set van voltooide taken per dag
  const voltooidPerDag = new Map<number, Set<string>>();
  for (const v of voltooiingen) {
    if (!voltooidPerDag.has(v.dag_nummer)) {
      voltooidPerDag.set(v.dag_nummer, new Set());
    }
    voltooidPerDag.get(v.dag_nummer)!.add(v.taak_id);
  }

  // Loop dag 1-21, vind eerste waar VERPLICHTE taken niet allemaal
  // voltooid zijn. Daar staat de member.
  for (let dagNr = 1; dagNr <= 21; dagNr++) {
    const dagData = DAGEN.find((d) => d.nummer === dagNr);
    if (!dagData) continue;
    const verplichteTaken = dagData.vandaagDoen.filter((t) => t.verplicht);
    if (verplichteTaken.length === 0) continue; // dag zonder verplichte taken, doorlopen
    const voltooid = voltooidPerDag.get(dagNr) ?? new Set<string>();
    const alleVerplichteVoltooid = verplichteTaken.every((t) =>
      voltooid.has(t.id),
    );
    if (!alleVerplichteVoltooid) {
      return dagNr;
    }
  }

  // Alle 21 dagen voltooid: door naar weekritme (dag 22-60).
  // Daar gebruiken we kalenderdag, want dat is een wekelijks ritme,
  // niet meer per-dag-content.
  return Math.max(22, berekenKalenderdag(runStartdatum));
}

/**
 * Klassieke kalender-berekening: hoeveel dagen sinds run_startdatum?
 * Wordt gebruikt door testers/founders en voor dag 22+ weekritme.
 */
export function berekenKalenderdag(runStartdatum: string | null): number {
  const start = runStartdatum ? new Date(runStartdatum) : new Date();
  const dag = differenceInDays(new Date(), start) + 1;
  return Math.max(1, Math.min(60, dag));
}
