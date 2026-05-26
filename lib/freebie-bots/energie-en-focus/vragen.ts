// File: lib/freebie-bots/energie-en-focus/vragen.ts
//
// Tien score-vragen voor Energie & Focus. Per vraag: vier antwoorden
// met 0, 1, 2 of 3 punten. Hoe hoger het getal, hoe groter het signaal.

import type { EFAntwoord, EFThema } from "./types";

export type EFVraag = {
  sleutel: keyof import("./types").EFAntwoorden;
  thema: EFThema;
  titel: string;
  ondertitel?: string;
  antwoorden: { waarde: EFAntwoord; label: string }[];
};

export const EF_VRAGEN: EFVraag[] = [
  // ============================================================
  // SLAAP (3 vragen)
  // ============================================================
  {
    sleutel: "inslapen",
    thema: "slaap",
    titel: "Hoe makkelijk val je in slaap?",
    ondertitel:
      "Vanaf het moment dat je in bed ligt tot je echt slaapt.",
    antwoorden: [
      { waarde: 0, label: "Binnen tien minuten, bijna altijd" },
      { waarde: 1, label: "Meestal binnen een half uur" },
      { waarde: 2, label: "Vaak duurt het langer, ik lig te malen" },
      { waarde: 3, label: "Bijna elke nacht lastig, ik kom maar niet weg" },
    ],
  },
  {
    sleutel: "nachtwakker",
    thema: "slaap",
    titel: "Hoe vaak word je 's nachts wakker?",
    ondertitel:
      "En als je wakker wordt: kun je makkelijk weer slapen?",
    antwoorden: [
      { waarde: 0, label: "Slaap meestal door of val direct terug in slaap" },
      { waarde: 1, label: "Soms wakker, duurt even maar lukt wel" },
      { waarde: 2, label: "Meerdere keren per nacht, slapen kost moeite" },
      { waarde: 3, label: "Vaak een uur of meer wakker, of vroeg op met malend hoofd" },
    ],
  },
  {
    sleutel: "ochtendfris",
    thema: "slaap",
    titel: "Hoe voel je je 's ochtends bij het wakker worden?",
    antwoorden: [
      { waarde: 0, label: "Uitgerust, ik kom met energie de dag in" },
      { waarde: 1, label: "Het gaat, even op gang komen" },
      { waarde: 2, label: "Vermoeid, ik heb koffie nodig om wakker te worden" },
      { waarde: 3, label: "Uitgeput, alsof ik niet geslapen heb" },
    ],
  },

  // ============================================================
  // ENERGIE (3 vragen)
  // ============================================================
  {
    sleutel: "middagdip",
    thema: "energie",
    titel: "Hoe sterk is je middag-dip tussen 14:00 en 16:00?",
    antwoorden: [
      { waarde: 0, label: "Geen dip, ik blijf in mijn ritme" },
      { waarde: 1, label: "Lichte dip, koffie of een wandeling helpt" },
      { waarde: 2, label: "Duidelijke dip, ik moet er doorheen vechten" },
      { waarde: 3, label: "Zware dip, soms moet ik echt liggen" },
    ],
  },
  {
    sleutel: "uitgeput",
    thema: "energie",
    titel: "Hoe vaak voel je je aan het eind van de dag echt uitgeput?",
    ondertitel:
      "Niet 'lekker moe' maar leeg, met geen reserve meer.",
    antwoorden: [
      { waarde: 0, label: "Zelden, ik heb 's avonds nog energie over" },
      { waarde: 1, label: "Een paar keer per week" },
      { waarde: 2, label: "Bijna elke dag" },
      { waarde: 3, label: "Elke dag, en de uitputting stapelt op" },
    ],
  },
  {
    sleutel: "ontbijt",
    thema: "energie",
    titel: "Hoe ziet je ontbijt er meestal uit?",
    ondertitel:
      "Geen oordeel, gewoon eerlijk: wat eet je 's ochtends?",
    antwoorden: [
      { waarde: 0, label: "Volwaardig met eiwit (ei, yoghurt, kwark, vis)" },
      { waarde: 1, label: "Volkoren boterham of muesli met fruit" },
      { waarde: 2, label: "Wit brood, koek, of snel iets met suiker" },
      { waarde: 3, label: "Ik sla het over of alleen koffie tot lunch" },
    ],
  },

  // ============================================================
  // FOCUS (2 vragen)
  // ============================================================
  {
    sleutel: "concentratie",
    thema: "focus",
    titel: "Hoe lang kun je je achter elkaar concentreren?",
    ondertitel:
      "Zonder telefoon te pakken of iets anders te willen doen.",
    antwoorden: [
      { waarde: 0, label: "Een uur of langer, geen probleem" },
      { waarde: 1, label: "Half uur tot uur, met af en toe een onderbreking" },
      { waarde: 2, label: "Maximaal twintig minuten, dan dwaal ik af" },
      { waarde: 3, label: "Soms maar een paar minuten, mijn hoofd springt rond" },
    ],
  },
  {
    sleutel: "hoofdaan",
    thema: "focus",
    titel: "Hoe vaak staat je hoofd 'aan' terwijl je probeert te rusten?",
    antwoorden: [
      { waarde: 0, label: "Zelden, ik kan goed uitschakelen" },
      { waarde: 1, label: "Soms, vooral op stressvolle dagen" },
      { waarde: 2, label: "Vaak, ook in mijn vrije tijd" },
      { waarde: 3, label: "Altijd, mijn hoofd lijkt nooit echt te stoppen" },
    ],
  },

  // ============================================================
  // LEEFSTIJL (2 vragen)
  // ============================================================
  {
    sleutel: "beweging",
    thema: "leefstijl",
    titel: "Hoeveel beweeg je op een gemiddelde week?",
    ondertitel:
      "Wandelen, fietsen, sporten, alles telt.",
    antwoorden: [
      { waarde: 0, label: "Dagelijks iets actiefs, ook al is het kort" },
      { waarde: 1, label: "Een paar keer per week stevig bewegen" },
      { waarde: 2, label: "Wisselend, soms wel, soms niets" },
      { waarde: 3, label: "Weinig tot niets, het komt er niet van" },
    ],
  },
  {
    sleutel: "alcohol",
    thema: "leefstijl",
    titel: "Hoeveel alcohol drink je op een gemiddelde week?",
    ondertitel:
      "Eerlijk antwoorden helpt het beeld kloppend te maken.",
    antwoorden: [
      { waarde: 0, label: "Geen of een enkel glas per maand" },
      { waarde: 1, label: "Een tot drie glazen per week" },
      { waarde: 2, label: "Een glas of meer per dag in het weekend" },
      { waarde: 3, label: "Bijna dagelijks een of meer glazen" },
    ],
  },
];
