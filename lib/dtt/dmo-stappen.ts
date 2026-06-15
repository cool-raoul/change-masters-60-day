import type { ControllableTaak } from "@/lib/playbook/types";
import { BRACKETS, type Bracket } from "./brackets";

// ============================================================
// DMO-stappen-generator voor Core, het dagelijkse ritme.
//
// De DMO is het hart van Core: dag 1-21 leer je de skills, vanaf dag 22
// (verankering + lifetime) ís de DMO de hele dag. Het volgt de reis die
// een prospect aflegt: aanspreken -> opvolgen -> instroom via je freebie
// -> zichtbaar blijven -> overzicht houden.
//
// Belangrijk (Raoul-feedback 15 juni 2026):
//   - Een winkelmandje delen is GEEN dagelijkse actie. Dat doe je pas
//     bij de afsluiting, als iemand wil starten. Het hoort dus NIET in
//     dit dagelijkse ritme, maar bij het closing-moment.
//   - Aanspreken + opvolgen zijn de motor (Kern, niet overslaan).
//   - Alles in mensentaal, ook voor iemand die net begint.
//
// Aantallen schalen mee met het tempo (DTT-bracket) dat de member bij de
// start koos. Het laagste tempo (Minimaal) heeft geen dagelijkse druk,
// een paar acties per week. Hogere tempo's krijgen een dag-minimum, meer
// mag altijd.
//
// Ramp: het ritme bouwt vanaf dag 3 in (dag 1-2 zijn opstart: lijst maken
// + eerste uitnodigingen, dat zit al in de leerstappen). Freebie vanaf
// dag 6 (dan kies je je freebie), social vanaf dag 7 (na je eerste post).
//
// Aangeroepen in app/vandaag/page.tsx, NA het laden van de dag-content
// en VOOR doorgeven aan VandaagFlow. Ingevoegd TUSSEN de leerstappen en
// de afsluit-stappen.
// ============================================================

export type DMOContext = {
  bestellinksGekoppeld: boolean;
  eersteKlantenStapVoorbij: boolean;
};

export function genereerDMOStappen(
  dagNummer: number,
  bracket: Bracket,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx: DMOContext,
): ControllableTaak[] {
  const def = BRACKETS[bracket];
  const m = def.dmoMinimums;
  const stappen: ControllableTaak[] = [];
  const prefix = `core-dag${dagNummer}-dmo`;

  // Het ritme start vanaf dag 3. Dag 1-2 zijn opstart (lijst + eerste
  // uitnodigingen) en zitten al in de leerstappen.
  if (dagNummer < 3) return stappen;

  // 1. AANSPREKEN, de motor. Kern bij een dag-minimum, anders een zachte
  //    week-versie voor het laagste tempo (geen dagelijkse druk).
  if (m.contactenPerDag > 0) {
    const n = m.contactenPerDag;
    stappen.push({
      id: `${prefix}-aanspreken`,
      label: `💬 Spreek vandaag ${n} ${n === 1 ? "nieuw persoon" : "nieuwe mensen"} aan`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitleg: `Stuur ${n} ${n === 1 ? "persoon" : "mensen"} een eerste, persoonlijk berichtje om een gesprek te openen. Geen pitch, gewoon oprecht contact, bijvoorbeeld iemand die je een tijd niet sprak. Dit is de motor van je dag: zonder nieuwe gesprekken komt er niks op gang. Open je namenlijst, kies wie past, en stuur. Voor jouw tempo (${def.label}, ${def.urenPerWeekRange}/week) is ${n} per dag het minimum, meer mag altijd.`,
    });
  } else {
    stappen.push({
      id: `${prefix}-aanspreken`,
      label: "💬 Spreek deze week een paar mensen aan",
      verplicht: false,
      actieRoute: "/namenlijst",
      uitleg:
        "Met jouw rustige tempo is dagelijks geen verplichting. Een paar gesprekjes per week houden je netwerk warm. Open je namenlijst, kies iemand die je een tijd niet sprak, en stuur een persoonlijk berichtje.",
    });
  }

  // 2. OPVOLGEN, de tweede motor. Vanaf dag 3, want dan heb je al mensen
  //    aangesproken die nog niet beslisten.
  if (m.followUpsPerDag > 0) {
    const n = m.followUpsPerDag;
    stappen.push({
      id: `${prefix}-opvolgen`,
      label: `🔄 Volg vandaag ${n} ${n === 1 ? "iemand" : "mensen"} op`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitleg: `Volg ${n} ${n === 1 ? "persoon" : "mensen"} op die je iets hebt gestuurd maar die nog niet hebben gereageerd of beslist. Een vriendelijk vervolg-berichtje, geen druk. De meeste mensen zeggen pas ja na het tweede of derde contact, dus hier zit echt de winst. Open je namenlijst en kijk wie nog op een reactie wacht. Voor jouw tempo (${def.label}) is ${n} per dag het minimum.`,
    });
  } else {
    stappen.push({
      id: `${prefix}-opvolgen`,
      label: "🔄 Volg deze week iemand op die nog niet besliste",
      verplicht: false,
      actieRoute: "/namenlijst",
      uitleg:
        "Iemand die je iets stuurde maar nog niet reageerde, krijgt een vriendelijk vervolg-berichtje. De meeste mensen zeggen pas ja na een tweede of derde contact. Een paar opvolgingen per week is genoeg voor jouw tempo.",
    });
  }

  // 3. INSTROOM via je freebie / product-test. Nieuwe geïnteresseerden
  //    vinden zonder te verkopen. Vanaf dag 6 (dan kies je je freebie).
  if (dagNummer >= 6) {
    stappen.push({
      id: `${prefix}-freebie`,
      label: "🎁 Deel je gratis test of freebie",
      verplicht: false,
      actieRoute: "/instellingen/freebies",
      uitleg:
        "Deel je gratis productadvies-test of een freebie-link, op je socials of in een gesprek. Wie 'm invult komt automatisch in je namenlijst, met hun antwoorden erbij. Zo vind je nieuwe geïnteresseerden zonder dat je iets hoeft te verkopen. Dit is je instroom-kraan, hou 'm open.",
    });
  }

  // 4. REAGEREN OP SOCIAL, vanaf dag 7 (na je eerste brede post).
  if (dagNummer >= 7) {
    stappen.push({
      id: `${prefix}-reageer-social`,
      label: "💎 Reageer op alle nieuwe likes en reacties",
      verplicht: false,
      uitleg:
        "Open Instagram of Facebook en reageer op iedereen die op je post heeft gereageerd of geliket. Een eerlijke reactie van twee, drie zinnen, en vraag door als ze iets aanstippen. Zo ontstaan vanzelf gesprekken in je DM. Tien minuten, hoogste rendement op je social-tijd.",
    });
  }

  // 5. POSTEN OP SOCIAL, aantal per week op tempo. Vanaf dag 7.
  if (dagNummer >= 7 && m.socialPostsPerWeek > 0) {
    const n = m.socialPostsPerWeek;
    stappen.push({
      id: `${prefix}-post`,
      label: "📱 Plaats een post (lifestyle, waarde, of jouw ervaring)",
      verplicht: false,
      uitleg: `Plaats iets op je socials: een stukje uit je dag (lifestyle), een tip of inzicht (waarde), of jouw eigen ervaring (claim-vrij). Voor jouw tempo (${def.label}) is ${n} ${n === 1 ? "post" : "posts"} per week het minimum. Vandaag niet, dan een andere dag deze week. Zo blijf je zichtbaar.`,
    });
  }

  // 6. PIJPLIJN BIJWERKEN, overzicht houden.
  stappen.push({
    id: `${prefix}-pijplijn`,
    label: "🎯 Werk je pijplijn bij",
    verplicht: false,
    actieRoute: "/namenlijst",
    uitleg:
      "Zet per persoon waar je staat: wie heb je gesproken, wie heeft iets besteld, wie wacht op een vervolg. Kan met de spraak-knop ('gesprek gestart met X') of door de fase op de prospect-kaart bij te werken. Een actuele pijplijn laat je in één oogopslag zien waar je aandacht heen moet.",
  });

  return stappen;
}
