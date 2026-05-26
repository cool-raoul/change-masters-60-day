// File: lib/freebie-bots/hormonen-en-overgang/vragen.ts

import type { HOAntwoord, HOThema, HOAntwoorden } from "./types";

export type HOVraag = {
  sleutel: keyof HOAntwoorden;
  thema: HOThema;
  titel: string;
  ondertitel?: string;
  antwoorden: { waarde: HOAntwoord; label: string }[];
};

export const HO_VRAGEN: HOVraag[] = [
  // ============================================================
  // HORMOON-SIGNALEN (3 vragen)
  // ============================================================
  {
    sleutel: "opvliegers",
    thema: "hormoon-signalen",
    titel: "Hoe vaak ervaar je opvliegers of nachtelijk zweten?",
    ondertitel:
      "Plotselinge warmte-golven overdag of intense nachtelijke transpiratie.",
    antwoorden: [
      { waarde: 0, label: "Niet of nauwelijks" },
      { waarde: 1, label: "Soms, een paar keer per week" },
      { waarde: 2, label: "Vaak, meerdere keren per dag of nacht" },
      { waarde: 3, label: "Bijna constant, het beperkt mijn dagelijks leven" },
    ],
  },
  {
    sleutel: "cyclus",
    thema: "hormoon-signalen",
    titel: "Hoe zit het met je cyclus de laatste maanden?",
    antwoorden: [
      { waarde: 0, label: "Regelmatig zoals altijd, of ben al ruim post-overgang" },
      { waarde: 1, label: "Iets onregelmatiger of intenser dan voorheen" },
      { waarde: 2, label: "Sterk wisselend, intens of moeilijk voorspelbaar" },
      { waarde: 3, label: "Erg verstoord, of overgang is heel duidelijk gaande" },
    ],
  },
  {
    sleutel: "droogheid",
    thema: "hormoon-signalen",
    titel: "Hoe ervaar je je huid, slijmvliezen en intimiteit?",
    ondertitel:
      "Droogte van huid, lippen, intieme delen, oogslijmvlies.",
    antwoorden: [
      { waarde: 0, label: "Normaal aanvoelend" },
      { waarde: 1, label: "Soms wat droger, niet storend" },
      { waarde: 2, label: "Merkbaar droger, beïnvloedt comfort" },
      { waarde: 3, label: "Storend droog, beïnvloedt mijn dagelijks leven" },
    ],
  },

  // ============================================================
  // SLAAP + HERSTEL (2 vragen)
  // ============================================================
  {
    sleutel: "inslapen",
    thema: "slaap-herstel",
    titel: "Hoe makkelijk val je 's avonds in slaap?",
    antwoorden: [
      { waarde: 0, label: "Binnen tien minuten" },
      { waarde: 1, label: "Meestal binnen een half uur" },
      { waarde: 2, label: "Vaak lastig, mijn hoofd blijft door-malen" },
      { waarde: 3, label: "Heel moeilijk, bijna elke nacht" },
    ],
  },
  {
    sleutel: "nachtwakker",
    thema: "slaap-herstel",
    titel: "Hoe vaak word je 's nachts wakker?",
    ondertitel:
      "Door warmte, malen, blaas, of zomaar.",
    antwoorden: [
      { waarde: 0, label: "Slaap meestal door of val direct terug" },
      { waarde: 1, label: "Soms wakker, lukt wel weer" },
      { waarde: 2, label: "Meerdere keren per nacht, doorslapen kost moeite" },
      { waarde: 3, label: "Bijna elke nacht lang wakker of vroeg op" },
    ],
  },

  // ============================================================
  // STEMMING + COGNITIE (2 vragen)
  // ============================================================
  {
    sleutel: "stemming",
    thema: "stemming-cognitie",
    titel: "Hoe voelt je stemming de laatste maanden?",
    ondertitel:
      "Niet 'gewoon een rotdag' maar een grond-niveau dat anders is.",
    antwoorden: [
      { waarde: 0, label: "Stabiel zoals altijd" },
      { waarde: 1, label: "Wat vaker prikkelbaar, korter lontje" },
      { waarde: 2, label: "Duidelijk vaker laag, somber of vlak" },
      { waarde: 3, label: "Sterk gedaald, ik herken mezelf op dit punt niet" },
    ],
  },
  {
    sleutel: "brainfog",
    thema: "stemming-cognitie",
    titel: "Hoe vaak heb je 'brain fog' (woord-vinden, geheugen, concentratie)?",
    antwoorden: [
      { waarde: 0, label: "Zelden, mijn hoofd werkt zoals altijd" },
      { waarde: 1, label: "Soms een woord kwijt, niet zorgwekkend" },
      { waarde: 2, label: "Vaak, ik moet me meer concentreren dan vroeger" },
      { waarde: 3, label: "Bijna dagelijks, het stoort me echt" },
    ],
  },

  // ============================================================
  // LICHAAM + LEEFSTIJL (3 vragen)
  // ============================================================
  {
    sleutel: "lichaam",
    thema: "lichaam-leefstijl",
    titel: "Wat voel je in je lichaam (gewicht, gewrichten, spierkracht)?",
    antwoorden: [
      { waarde: 0, label: "Voelt zoals altijd, ik herken me erin" },
      { waarde: 1, label: "Wat verandering, niet drastisch" },
      { waarde: 2, label: "Duidelijk anders: stijver, zwaarder, minder kracht" },
      { waarde: 3, label: "Sterk veranderd, mijn lichaam voelt vreemd" },
    ],
  },
  {
    sleutel: "alcohol",
    thema: "lichaam-leefstijl",
    titel: "Hoeveel alcohol drink je op een gemiddelde week?",
    ondertitel:
      "Alcohol verergert vaak opvliegers en verstoort slaap-kwaliteit.",
    antwoorden: [
      { waarde: 0, label: "Geen of een enkel glas per maand" },
      { waarde: 1, label: "Een tot drie glazen per week" },
      { waarde: 2, label: "Een glas of meer in het weekend" },
      { waarde: 3, label: "Bijna dagelijks een of meer glazen" },
    ],
  },
  {
    sleutel: "beweging",
    thema: "lichaam-leefstijl",
    titel: "Hoeveel beweeg je op een gemiddelde week?",
    ondertitel:
      "Wandelen, fietsen, krachttraining: alles telt.",
    antwoorden: [
      { waarde: 0, label: "Dagelijks iets, inclusief kracht of weerstand" },
      { waarde: 1, label: "Paar keer per week stevig bewegen" },
      { waarde: 2, label: "Wisselend, soms wel soms niet" },
      { waarde: 3, label: "Weinig tot niets" },
    ],
  },
];
