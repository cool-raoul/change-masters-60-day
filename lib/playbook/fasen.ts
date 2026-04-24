// ============================================================
// PLAYBOOK — de 3 fasen van de 60-dagenrun
// Elke fase heeft een eigen focus + controllable-lat + doel.
// De controllables zijn wat de member zelf 100% in de hand heeft.
// Het doel is het resultaat waar we naartoe WERKEN, maar dat we
// niet kunnen forceren (afhankelijk van anderen — prospects, timing).
// ============================================================

import { Fase } from "./types";

export const FASEN: Fase[] = [
  {
    nummer: 1,
    titel: "Fundament",
    dagen: [1, 7],
    samenvatting:
      "Je eerste week is geen race — het is het neerzetten van je fundament. WHY vast, namenlijst gevuld, sponsor-ritueel staat, eerste uitnodigingen gaan de deur uit. Dit is de week waarin je leert hoe ELEVA voor jou werkt.",
    controllableLat: [
      "WHY ingevuld in ELEVA (dag 1-2)",
      "vCard-import: 100+ contacten in je namenlijst (dag 1)",
      "Minimaal 20 namen handmatig opgeschreven, ook mensen buiten je telefoon (dag 2)",
      "5 uitnodigingen per dag vanaf dag 4",
      "3 follow-ups per dag vanaf dag 4",
      "3 namen per dag uit je socials (IG/FB/LinkedIn) vanaf dag 3",
    ],
    doel: "Deze week 2 one-pager-momenten in de agenda — bekeken of gepland.",
    kernprincipe:
      "Je bouwt geen business op energie of motivatie — je bouwt 'm op systeem. Deze week installeer je het systeem.",
  },
  {
    nummer: 2,
    titel: "Momentum",
    dagen: [8, 14],
    samenvatting:
      "Nu draait je machine. Je hebt een lijst, je hebt je WHY, je weet waar alles in ELEVA staat. Nu is het aantallen-week: meer uitnodigingen, meer follow-ups, meer gesprekken. Fase 2 gaat over ritme houden als het niet meteen rendeert.",
    controllableLat: [
      "10 uitnodigingen per dag",
      "5 follow-ups per dag",
      "3 namen per dag toevoegen (uit socials/ontmoetingen)",
      "Minstens 1 3-weg-gesprek deze week met sponsor",
      "Elke dag activiteit in ELEVA — geen nul-dagen",
    ],
    doel: "3 tot 5 presentatie-momenten in de agenda deze week.",
    kernprincipe:
      "Afwijzing is geen oordeel — het is een getal. Elke nee brengt je dichter bij ja. Brookes-principe: het is een doorvoer-vak, niet een overtuig-vak.",
  },
  {
    nummer: 3,
    titel: "Ritme",
    dagen: [15, 21],
    samenvatting:
      "Je bent geen starter meer. Je kent de flow, je kent ELEVA, je hebt mensen in je pipeline. Deze week gaat over consistentie, doorzetten in follow-up, en de eerste beslissingen binnenhalen — zonder te drammen.",
    controllableLat: [
      "10 uitnodigingen per dag",
      "10 follow-ups per dag (shift naar follow-up-gewicht)",
      "3 namen per dag",
      "Minstens 2 3-weg-gesprekken deze week",
      "Pipeline-review 2x deze week (wie zit waar, wie wacht op wat?)",
    ],
    doel: "Minimaal 2 beslissingen binnen — member, shopper of not-yet. Alle drie zijn winst.",
    kernprincipe:
      "De run eindigt niet op dag 21 — dit is je startpunt. Dag 22 ga je dit ritme verduurzamen over 40 dagen.",
  },
];

export function getFase(dag: number): Fase {
  if (dag <= 7) return FASEN[0];
  if (dag <= 14) return FASEN[1];
  return FASEN[2];
}
