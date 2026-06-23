// Uitkomst-logica voor "Jouw gezonde start".
//
// De darm-vragen (hergebruikt uit lib/zelftest/darm-vragen.ts) bepalen de
// score → een ADVIES (geen vonnis): welk programma een fijne start is. De
// Reset is de grotere reis, en er is ALTIJD een route, juist daarom kijkt
// het teamlid persoonlijk mee. Claimvrij + DNA-stem.

import { berekenDarmUitslag } from "@/lib/zelftest/darm-vragen";

export type GezondeStartUitkomst = {
  bucket: "basis" | "plus";
  bucketLabel: string;
  // Banner bovenaan het scherm.
  kop: string;
  // Het warme advies-verhaal (claimvrij, geen mandaat).
  advies: string;
  // De brug naar het persoonlijke gesprek (boven de contact-knop).
  meekijken: string;
  totaal: number;
  max: number;
};

export function bouwGezondeStartUitkomst(
  darmAntwoorden: Record<string, number>,
  voornaam: string,
): GezondeStartUitkomst {
  const u = berekenDarmUitslag(darmAntwoorden);
  const naam = voornaam.trim() || "fijn dat je er bent";

  const kop =
    u.bucket === "plus"
      ? "Een stevige opfris is een mooie eerste stap voor je"
      : "Een zachte start past goed bij waar je nu staat";

  const programmaNaam =
    u.bucket === "plus" ? "Darmen in Balans +" : "Darmen in Balans";

  const advies =
    u.bucket === "plus"
      ? `Dankjewel, ${naam}. Aan je antwoorden zie ik dat je lichaam op meerdere ` +
        `vlakken om aandacht vraagt. Een wat uitgebreider programma, ${programmaNaam}, ` +
        `is dan een fijne manier om eerst rustig op te ruimen en je een sterke basis ` +
        `te geven. Wil je daarna verder, dan is de Reset de grotere reis.`
      : `Dankjewel, ${naam}. Je herkent een paar signalen, en dat is precies waar ` +
        `een zachte start fijn voor is. ${programmaNaam} (16 dagen) is een lichte ` +
        `opfrissing om mee te beginnen. Wil je een grotere stap maken, bijvoorbeeld ` +
        `rondom je gewicht, dan is de Reset de weg.`;

  const meekijken =
    "Dit is een eerste richting, geen verplichting. En het mooiste: er is altijd " +
    "een route die bij jou past, ook als deze twee programma's het net niet zijn. " +
    "Daarom kijk ik het liefst even persoonlijk met je mee, zodat je de keuze kunt " +
    "maken die voor jou het beste voelt.";

  return {
    bucket: u.bucket,
    bucketLabel: u.bucket_label,
    kop,
    advies,
    meekijken,
    totaal: u.totaal,
    max: u.max,
  };
}
