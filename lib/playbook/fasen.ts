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
      "De eerste week is geen race — we leggen samen het fundament. Je WHY in ELEVA, je namenlijst gevuld, je sponsor-ritueel op gang, en de eerste uitnodigingen gaan al de deur uit. Het is de week waarin je leert hoe ELEVA jouw beste werkmaat wordt.\n\nEén ding mag direct duidelijk zijn: dit is een aantallen-verhaal. Met een lijstje van tien of twintig namen ga je het niet redden — daarom groeit je lijst elke dag, gewoon stapsgewijs. En jouw rol? Niet verkopen, niet overtuigen. Jij laat alleen zien. Zíj beslissen. Een flink stuk lichter dan veel mensen denken.\n\nJe staat er ook niet alleen voor. Veel doe je samen met je sponsor; wat niet met je sponsor kan, helpt de ELEVA Mentor je mee. En dat het overweldigend voelt deze week? Helemaal goed. Je leert iets nieuws, je stapt uit je comfortzone, dat hoort. Eerst onhandig, dan vaardig — voor iedereen hetzelfde. Niet vechten, gewoon doorgaan, dag voor dag.",
    controllableLat: [
      "WHY ingevuld in ELEVA (dag 1)",
      "vCard-import: 100+ contacten in je namenlijst (dag 1)",
      "Minimaal 20 namen handmatig opgeschreven, ook mensen buiten je telefoon (dag 2)",
      "Eerste 3 invites op dag 2 (samen met sponsor) — daarna 5 invites per dag (dag 3-7)",
      "3 follow-ups per dag vanaf dag 4",
      "3 namen per dag uit je socials (IG/FB/LinkedIn) vanaf dag 3",
      "3-weg-principe begrepen op dag 2 — eerste 3-weg uiterlijk dag 4 (optioneel)",
      "Inhaaldag-regel: dag overgeslagen? geen ramp — volgende dag aantallen +50% en doorgaan.",
    ],
    doel: "Deze week 2 one-pager-momenten in de agenda — bekeken of gepland.",
    kernprincipe:
      "Een mooi bedrijf bouw je niet op pieken van energie of motivatie — die komen en gaan. Je bouwt 'm op een ritme dat klopt en op genoeg mensen om dat ritme heen. Deze week zetten we beide neer.",
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
