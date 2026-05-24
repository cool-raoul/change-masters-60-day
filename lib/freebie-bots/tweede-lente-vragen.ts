// File: lib/freebie-bots/tweede-lente-vragen.ts
//
// De 7 multi-choice vragen van de Tweede Lente bot. Statisch in code
// voor pilot. Later kan dit naar DB als per-team-vrouw personalisatie
// gewenst is. Geen vrije tekst input, alleen radio + checkbox.

import type {
  TweedeLenteFase,
  TweedeLenteWatValtOp,
  TweedeLenteEetRitme,
  TweedeLenteBeweging,
  TweedeLenteRust,
  TweedeLenteDeel,
  TweedeLenteZoek,
} from "./types";

export type VraagKeuze<T extends string> = {
  waarde: T;
  label: string;
  korteCode: string; // voor in spiegel-paragraaf gebruik
};

export const VRAAG_FASE: VraagKeuze<TweedeLenteFase>[] = [
  {
    waarde: "pre-overgang",
    label:
      "Pre-overgang (ik merk subtiele veranderingen, maar mijn cyclus loopt nog)",
    korteCode: "pre",
  },
  {
    waarde: "peri-overgang",
    label:
      "Peri-overgang (mijn cyclus is onregelmatig, of er gebeurt duidelijk iets)",
    korteCode: "peri",
  },
  {
    waarde: "volle-overgang",
    label:
      "Volle overgang (ik zit er midden in, hormonen zijn duidelijk anders)",
    korteCode: "volle",
  },
  {
    waarde: "post-overgang",
    label:
      "Post-overgang (mijn cyclus is een tijd weg, ik zoek het nieuwe ritme)",
    korteCode: "post",
  },
  {
    waarde: "weet-niet",
    label: "Ik weet het niet precies (gewoon nieuwsgierig)",
    korteCode: "onbekend",
  },
];

export const VRAAG_WAT_VALT_OP: VraagKeuze<TweedeLenteWatValtOp>[] = [
  {
    waarde: "energie-patroon",
    label: "Energie-patroon (moe op andere momenten dan vroeger)",
    korteCode: "energie",
  },
  {
    waarde: "slaapritme",
    label: "Slaapritme (anders inslapen, doorslapen of vroeg wakker)",
    korteCode: "slaap",
  },
  {
    waarde: "stemming",
    label: "Stemming (vlakker, korter lontje, of meer reflectie)",
    korteCode: "stemming",
  },
  {
    waarde: "warmte-golven",
    label: "Warmte-golven (opvliegers, nachtelijke warmte)",
    korteCode: "warmte",
  },
  {
    waarde: "cyclus-veranderingen",
    label: "Cyclus-veranderingen (intensiteit, lengte, frequentie)",
    korteCode: "cyclus",
  },
  {
    waarde: "lichaamsbeleving",
    label: "Lichaamsbeleving (gewicht-verschuiving, gewrichten, huid)",
    korteCode: "lichaam",
  },
  {
    waarde: "mentaal-helder-zijn",
    label:
      "Mentaal helder-zijn (concentratie, woord-vinden, vermoeidheid in hoofd)",
    korteCode: "mentaal",
  },
];

export const VRAAG_EET_RITME: VraagKeuze<TweedeLenteEetRitme>[] = [
  { waarde: "regelmatig-bewust", label: "Regelmatig en bewust", korteCode: "regelmatig" },
  {
    waarde: "onregelmatig-gevarieerd",
    label: "Onregelmatig, maar wel gevarieerd",
    korteCode: "gevarieerd",
  },
  {
    waarde: "vaak-snel-tussendoor",
    label: "Vaak iets snels tussendoor",
    korteCode: "snel",
  },
  { waarde: "wisselt-per-dag", label: "Ik wisselt het sterk per dag", korteCode: "wissel" },
];

export const VRAAG_BEWEGING: VraagKeuze<TweedeLenteBeweging>[] = [
  {
    waarde: "stevig",
    label: "Stevig: meer dan 3 keer per week iets fysieks",
    korteCode: "stevig",
  },
  {
    waarde: "licht",
    label: "Licht: 1-2 keer per week iets, plus dagelijks wat lopen",
    korteCode: "licht",
  },
  {
    waarde: "wisselend",
    label: "Wisselend: soms wel, soms helemaal niet",
    korteCode: "wisselend",
  },
  { waarde: "weinig", label: "Weinig op dit moment", korteCode: "weinig" },
];

export const VRAAG_RUST: VraagKeuze<TweedeLenteRust>[] = [
  {
    waarde: "goed-zonder-schuldgevoel",
    label: "Goed, ik kan zonder schuldgevoel niets doen",
    korteCode: "ontspannen",
  },
  { waarde: "wisselend", label: "Wisselend, hangt van de dag af", korteCode: "wisselend" },
  { waarde: "hoofd-staat-aan", label: "Lastig, mijn hoofd staat vaak aan", korteCode: "druk" },
  { waarde: "draai-door", label: "Bijna niet, ik draai door", korteCode: "vol" },
];

export const VRAAG_DEEL: VraagKeuze<TweedeLenteDeel>[] = [
  { waarde: "partner", label: "Mijn partner", korteCode: "partner" },
  {
    waarde: "vriendin-of-vrouw",
    label: "Een vriendin of vrouw uit mijn omgeving",
    korteCode: "vriendin",
  },
  {
    waarde: "huisarts-of-professional",
    label: "Mijn huisarts of een professional",
    korteCode: "professional",
  },
  {
    waarde: "met-niemand-echt",
    label: "Eigenlijk met niemand echt",
    korteCode: "niemand",
  },
];

export const VRAAG_ZOEK: VraagKeuze<TweedeLenteZoek>[] = [
  {
    waarde: "iets-om-mee-te-beginnen",
    label: "Iets om mee te beginnen (kleine stap)",
    korteCode: "beginnen",
  },
  {
    waarde: "begrip-niet-de-enige",
    label: "Begrip dat ik niet de enige ben",
    korteCode: "begrip",
  },
  {
    waarde: "rustige-spiegel",
    label: "Een rustige spiegel op waar ik nu sta",
    korteCode: "spiegel",
  },
  {
    waarde: "concrete-kennis",
    label: "Concrete kennis over wat in deze tijd werkt",
    korteCode: "kennis",
  },
];
