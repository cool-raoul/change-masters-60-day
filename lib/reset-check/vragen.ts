// File: lib/reset-check/vragen.ts
//
// 13 score-vragen voor de Holistic Reset check.
// 11 standaard + 2 conditional (alleen voor vrouwen 35+).
// Tone: warm, herkenbaar, in jullie eigen stem (geen GPT-rijtjes).

import type { ScoreVraag, ProfielVraag, MedischPunt } from "./types";

export const VRAGEN: ScoreVraag[] = [
  {
    sleutel: "spijsvertering",
    thema: "spijsvertering",
    titel: "Hoe vaak heb je een opgeblazen of zwaar gevoel na het eten?",
    onder: "Niet na een uitgebreid feestmaal, maar op een doordeweekse dag.",
    antwoorden: [
      { waarde: 0, label: "Bijna nooit, mijn buik blijft lekker licht" },
      { waarde: 1, label: "Soms wel, vooral na een uitgebreide maaltijd" },
      { waarde: 2, label: "Regelmatig, ook na heel gewone maaltijden" },
      { waarde: 3, label: "Vaak, ik voel het bijna elke dag" },
    ],
  },
  {
    sleutel: "stoelgang",
    thema: "spijsvertering",
    titel: "Hoe regelmatig is je stoelgang?",
    onder: "",
    antwoorden: [
      { waarde: 0, label: "Helemaal goed, elke dag soepel" },
      { waarde: 1, label: "Meestal wel, soms moet ik 'm wat helpen" },
      { waarde: 2, label: "Heel wisselend, soms dagen niks en dan weer wel" },
      { waarde: 3, label: "Eerlijk, het kost moeite of ik gebruik regelmatig iets om op gang te komen" },
    ],
  },
  {
    sleutel: "darmcomfort",
    thema: "spijsvertering",
    titel: "Hoe vaak heb je darmongemak of last bij je maag?",
    onder: "Denk aan buikpijn, krampen, gas of een brandend gevoel.",
    antwoorden: [
      { waarde: 0, label: "Zelden, mijn darmen zijn lekker rustig" },
      { waarde: 1, label: "Soms, vooral na bepaalde dingen die ik eet" },
      { waarde: 2, label: "Regelmatig, ik herken er ook een patroon in" },
      { waarde: 3, label: "Vaak, het bepaalt hoe mijn dag verloopt" },
    ],
  },
  {
    sleutel: "gewichtsgevoel",
    thema: "gewicht",
    titel: "Hoe voel je je over je gewicht op dit moment?",
    onder: "Niet wat de weegschaal zegt, maar hoe jij je voelt.",
    antwoorden: [
      { waarde: 0, label: "Helemaal goed, ik voel me lekker in mijn kleding" },
      { waarde: 1, label: "Een paar kilootjes minder zou fijn zijn, alleen ik lig er niet wakker van" },
      { waarde: 2, label: "Niet zoals ik wil, kleding zit strakker dan vroeger" },
      { waarde: 3, label: "Echt niet fijn, ik wil hier graag in beweging komen" },
    ],
  },
  {
    sleutel: "eetpatroon",
    thema: "gewicht",
    titel: "Hoe regelmatig grijp je naar suiker, koek of snacks?",
    onder: "",
    antwoorden: [
      { waarde: 0, label: "Bijna nooit hoor, ik mis het ook niet" },
      { waarde: 1, label: "Een paar keer in de week, gezellig met iets erbij" },
      { waarde: 2, label: "Bijna elke dag wel iets, om eerlijk te zijn" },
      { waarde: 3, label: "Meerdere keren per dag, het is moeilijk om er onderuit te komen" },
    ],
  },
  {
    sleutel: "energie_dag",
    thema: "energie",
    titel: "Hoe is je energie tussen 14:00 en 16:00?",
    onder: "",
    antwoorden: [
      { waarde: 0, label: "Geen dip hoor, ik fluit gewoon door" },
      { waarde: 1, label: "Beetje dip, koffie of even bewegen en ik ben er weer" },
      { waarde: 2, label: "Stevige dip, ik moet er echt doorheen" },
      { waarde: 3, label: "Het is zwaar, soms moet ik echt even liggen" },
    ],
  },
  {
    sleutel: "energie_avond",
    thema: "energie",
    titel: "Hoe voel je je aan het eind van de dag?",
    onder: "",
    antwoorden: [
      { waarde: 0, label: "Genoeg energie over om nog iets leuks te doen" },
      { waarde: 1, label: "Moe maar tevreden, lekker afronden op de bank" },
      { waarde: 2, label: "Helemaal op, ik kan alleen nog op de bank ploffen" },
      { waarde: 3, label: "Uitgeput, het stapelt op door de week" },
    ],
  },
  {
    sleutel: "slaap",
    thema: "slaap",
    titel: "Hoe is je nachtrust de laatste tijd?",
    onder: "",
    antwoorden: [
      { waarde: 0, label: "Heerlijk, ik val zo in slaap en sta lekker uitgerust op" },
      { waarde: 1, label: "Meestal best goed, een enkele onrustige nacht zit erbij" },
      { waarde: 2, label: "Wisselend, vaak onrustig of veel te vroeg klaarwakker" },
      { waarde: 3, label: "Eerlijk, het lukt slecht. Lang wakker liggen of veel te vaak wakker worden" },
    ],
  },
  {
    sleutel: "voeding_bewust",
    thema: "voeding",
    titel: "Hoeveel van je dagelijkse voeding is onbewerkt?",
    onder: "Vers, zelf gemaakt, weinig uit pakjes.",
    antwoorden: [
      { waarde: 0, label: "Bijna alles, ik kook zelf met verse spullen" },
      { waarde: 1, label: "Meer dan de helft, ik probeer er bewust mee bezig te zijn" },
      { waarde: 2, label: "Een deel wel, het andere deel is gewoon gemakkelijk eten" },
      { waarde: 3, label: "Eerlijk gezegd vooral kant-en-klaar, snacks en wat snel gaat" },
    ],
  },
  {
    sleutel: "intentie",
    thema: "voeding",
    titel: "Hoe sterk is het gevoel: ik wil hier echt verandering in?",
    onder: "",
    antwoorden: [
      { waarde: 0, label: "Nog niet zo sterk, vooral nieuwsgierig op dit moment" },
      { waarde: 1, label: "Zou fijn zijn, alleen ik voel nog niet echt de urgentie" },
      { waarde: 2, label: "Sterk, ik weet gewoon dat er iets verandering vraagt" },
      { waarde: 3, label: "Heel sterk, ik ben er klaar voor 🥰" },
    ],
  },
  {
    sleutel: "stemming",
    thema: "hormonen",
    titel: "Hoe stabiel is je stemming en gemoedstoestand de laatste tijd?",
    onder: "Niet het incidentele dipje, wel hoe je je gemiddeld voelt.",
    antwoorden: [
      { waarde: 0, label: "Stabiel, ik voel me lekker in mijn vel" },
      { waarde: 1, label: "Wisselend, alleen overwegend in balans" },
      { waarde: 2, label: "Vaak op en neer, ik voel echt pieken en dalen" },
      { waarde: 3, label: "Het is onrustig, sterk wisselend door de dag heen" },
    ],
  },
  {
    sleutel: "opvliegers",
    thema: "hormonen",
    conditional: "vrouw_35plus",
    titel: "Heb je last van opvliegers, nachtelijk zweten of andere thermische schommelingen?",
    onder: "Wakker worden bezweet, plotseling warm worden 's avonds.",
    antwoorden: [
      { waarde: 0, label: "Nee hoor, daar heb ik gelukkig geen last van" },
      { waarde: 1, label: "Heel soms maar, gelukkig zelden" },
      { waarde: 2, label: "Best regelmatig, het stoort me echt wel" },
      { waarde: 3, label: "Heel vaak, het verstoort mijn slaap of hele dag" },
    ],
  },
  {
    sleutel: "hormoon_cyclus",
    thema: "hormonen",
    conditional: "vrouw_35plus",
    titel: "Hoe ervaar je je cyclus of de overgangsfase op dit moment?",
    onder: "Zonder oordeel, gewoon eerlijk hoe het nu voelt.",
    antwoorden: [
      { waarde: 0, label: "Stabiel, gelukkig geen last" },
      { waarde: 1, label: "Wisselend, soms voel ik het, soms niet" },
      { waarde: 2, label: "Vaak last, het beïnvloedt echt hoe ik me voel" },
      { waarde: 3, label: "Heel sterk, het zit me elke dag dwars" },
    ],
  },
];

export const PROFIEL_VRAGEN: ProfielVraag[] = [
  {
    sleutel: "geslacht_leeftijd",
    titel: "Voor we beginnen, wat past het beste bij jou?",
    onder: "Dit helpt ons om de juiste vragen voor jou te tonen 🥰",
    antwoorden: [
      { waarde: "vrouw_35plus", label: "Vrouw, 35 jaar of ouder" },
      { waarde: "vrouw_jonger", label: "Vrouw, jonger dan 35" },
      { waarde: "man", label: "Man" },
      { waarde: "anders", label: "Zeg ik liever niet hoor" },
    ],
  },
  {
    sleutel: "afvalpogingen",
    titel: "Heb je eerder geprobeerd om af te vallen?",
    onder: "",
    antwoorden: [
      { waarde: "nooit", label: "Nee, voor mij gelukkig geen thema" },
      { waarde: "een-paar", label: "Een paar keer, met wisselend resultaat" },
      { waarde: "vaak", label: "Vaak, alleen het volhouden blijft moeilijk" },
      { waarde: "veel-strijd", label: "Heel vaak, het is een terugkerende strijd" },
    ],
  },
  {
    sleutel: "afvalwens",
    titel: "Hoeveel zou je het liefst willen afvallen?",
    onder: "Geen norm, alleen jouw eerlijke wens.",
    antwoorden: [
      { waarde: "aankomen", label: "Ik moet juist wat aankomen" },
      { waarde: "geen", label: "Niks, ik ben blij met mijn gewicht zoals het is" },
      { waarde: "0-5", label: "Een paar kilootjes, tussen de 0 en 5" },
      { waarde: "5-10", label: "5 tot 10 kilo zou heerlijk zijn" },
      { waarde: "10-20", label: "10 tot 20 kilo voelt voor mij goed" },
      { waarde: "20+", label: "20 kilo of meer, daar ben ik klaar voor" },
    ],
  },
  {
    sleutel: "investering",
    titel: "Ben je bereid te investeren in je gezondheid?",
    onder: "Eerlijk antwoord helpt, want het bepaalt hoe wij met jou aan de slag kunnen.",
    antwoorden: [
      { waarde: "nee", label: "Nee, op dit moment nog niet" },
      { waarde: "misschien", label: "Ja, misschien, het hangt er een beetje van af" },
      { waarde: "altijd", label: "Ja, dat doe ik sowieso al voor mezelf 🥰" },
    ],
  },
];

export const MEDISCHE_PUNTEN: MedischPunt[] = [
  { sleutel: "zwanger", label: "Zwangerschap of borstvoeding (nu of binnenkort)", isZwanger: true },
  { sleutel: "diabetes", label: "Diabetes (type 1 of type 2)" },
  { sleutel: "epilepsie", label: "Epilepsie" },
  { sleutel: "hart", label: "Hart- of vaatklachten" },
  { sleutel: "bloeddruk", label: "Te hoge of te lage bloeddruk" },
  { sleutel: "schildklier", label: "Schildklier-problemen" },
  { sleutel: "antidepressiva", label: "Gebruik van antidepressiva" },
  { sleutel: "eetstoornis", label: "Eetstoornis (nu of in het verleden)" },
  { sleutel: "andere", label: "Andere chronische aandoening of medicatie" },
  { sleutel: "geen", label: "Niets van het bovenstaande" },
];

export const THEMA_LABELS: Record<string, string> = {
  spijsvertering: "Spijsvertering en darmen",
  gewicht: "Gewicht en eet-patroon",
  energie: "Energie door de dag",
  slaap: "Nachtrust",
  voeding: "Voeding en intentie",
  hormonen: "Hormonen en gemoed",
};

export function geldigeVragen(geslachtLeeftijd?: string): ScoreVraag[] {
  return VRAGEN.filter(
    (v) => !v.conditional || (v.conditional === "vrouw_35plus" && geslachtLeeftijd === "vrouw_35plus"),
  );
}
