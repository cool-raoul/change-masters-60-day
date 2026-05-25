// File: lib/freebie-bots/tweede-wind/vragen.ts
//
// De 7 multi-choice vragen van de Tweede Wind bot (werknaam, thema:
// energie + focus). Statisch in code. Geen vrije tekst input.
//
// TODO-GABY: alle labels onder zijn PLACEHOLDERS. Loop ze door en
// herformuleer in Eleva-stem voordat we de bot voor leden zichtbaar
// maken.

import type {
  TweedeWindEnergie,
  TweedeWindFocusBreker,
  TweedeWindSlaap,
  TweedeWindEetRitme,
  TweedeWindBeweging,
  TweedeWindHerstel,
  TweedeWindDoel,
} from "../types";

export type VraagKeuze<T extends string> = {
  waarde: T;
  label: string;
  korteCode: string;
};

export const VRAAG_ENERGIE: VraagKeuze<TweedeWindEnergie>[] = [
  {
    waarde: "stabiel-goed",
    label: "Stabiel en goed, ik kom de dag prima door",
    korteCode: "stabiel",
  },
  {
    waarde: "ochtend-piek-middag-dip",
    label: "Goed in de ochtend, dip in de middag",
    korteCode: "middag-dip",
  },
  {
    waarde: "doormodderen-tot-avond",
    label: "Ik mod door de dag heen, pas 's avonds zak ik echt",
    korteCode: "doormodderen",
  },
  {
    waarde: "wisselend-onvoorspelbaar",
    label: "Wisselend, ik weet nooit hoe een dag gaat lopen",
    korteCode: "wisselend",
  },
  {
    waarde: "structureel-laag",
    label: "Structureel laag, mijn batterij raakt nooit echt vol",
    korteCode: "laag",
  },
];

export const VRAAG_FOCUS_BREKERS: VraagKeuze<TweedeWindFocusBreker>[] = [
  {
    waarde: "afleiding-schermen",
    label: "Afleiding van schermen en notificaties",
    korteCode: "schermen",
  },
  {
    waarde: "te-veel-tegelijk",
    label: "Te veel dingen tegelijk willen doen",
    korteCode: "multitask",
  },
  {
    waarde: "stress-zorgen",
    label: "Stress en zorgen die in mijn hoofd blijven hangen",
    korteCode: "stress",
  },
  {
    waarde: "slecht-slapen",
    label: "Te weinig of slecht slapen",
    korteCode: "slaap",
  },
  {
    waarde: "geen-duidelijk-doel",
    label: "Geen duidelijk doel of richting",
    korteCode: "doel",
  },
  {
    waarde: "kort-van-geheugen",
    label: "Vergeten waar ik mee bezig was",
    korteCode: "geheugen",
  },
  {
    waarde: "moeilijk-beginnen",
    label: "Moeilijk in actie komen, uitstellen",
    korteCode: "beginnen",
  },
];

export const VRAAG_SLAAP: VraagKeuze<TweedeWindSlaap>[] = [
  {
    waarde: "diep-en-genoeg",
    label: "Diep en lang genoeg, ik word fris wakker",
    korteCode: "goed",
  },
  {
    waarde: "moeite-met-inslapen",
    label: "Moeite met inslapen, mijn hoofd staat aan",
    korteCode: "inslapen",
  },
  {
    waarde: "vroeg-wakker",
    label: "Vroeg wakker en moeilijk weer in slaap",
    korteCode: "vroeg-wakker",
  },
  {
    waarde: "onrustig-doorslapen",
    label: "Onrustig, vaak wakker, oppervlakkig",
    korteCode: "onrustig",
  },
  {
    waarde: "te-weinig-tijd",
    label: "Ik plan eigenlijk gewoon te weinig slaap-tijd in",
    korteCode: "te-weinig",
  },
];

export const VRAAG_EET_RITME: VraagKeuze<TweedeWindEetRitme>[] = [
  {
    waarde: "regelmatig-volwaardig",
    label: "Regelmatig, met eiwit en groente per maaltijd",
    korteCode: "volwaardig",
  },
  {
    waarde: "veel-snelle-suikers",
    label: "Veel snelle suikers, koek, koffie",
    korteCode: "suikers",
  },
  {
    waarde: "weinig-eiwit",
    label: "Weinig eiwit, vooral koolhydraat-gericht",
    korteCode: "weinig-eiwit",
  },
  {
    waarde: "skip-ontbijt",
    label: "Ontbijt sla ik over, eet pas later op de dag",
    korteCode: "skip-ontbijt",
  },
  {
    waarde: "wisselend",
    label: "Wisselend, het ene moment goed, het andere slecht",
    korteCode: "wisselend",
  },
];

export const VRAAG_BEWEGING: VraagKeuze<TweedeWindBeweging>[] = [
  {
    waarde: "dagelijks-iets",
    label: "Dagelijks iets actiefs, ook al is het kort",
    korteCode: "dagelijks",
  },
  {
    waarde: "een-paar-keer-per-week",
    label: "Een paar keer per week stevig bewegen",
    korteCode: "paar-keer",
  },
  {
    waarde: "wisselend",
    label: "Wisselend, soms wel een week, dan twee weken niet",
    korteCode: "wisselend",
  },
  {
    waarde: "weinig-tot-niets",
    label: "Weinig tot niets, het komt er niet van",
    korteCode: "weinig",
  },
];

export const VRAAG_HERSTEL: VraagKeuze<TweedeWindHerstel>[] = [
  {
    waarde: "echt-uitschakelen",
    label: "Ja, ik kan echt uitschakelen en herstellen",
    korteCode: "uit",
  },
  {
    waarde: "scherm-tot-bedtijd",
    label: "Ik blijf scrollen of werken tot in bed",
    korteCode: "scherm",
  },
  {
    waarde: "altijd-aan",
    label: "Mijn hoofd staat altijd aan, ook in 'rust'",
    korteCode: "altijd-aan",
  },
  {
    waarde: "geen-tijd-voor-rust",
    label: "Ik plan geen tijd voor rust in",
    korteCode: "geen-tijd",
  },
];

export const VRAAG_DOEL: VraagKeuze<TweedeWindDoel>[] = [
  {
    waarde: "meer-energie-de-hele-dag",
    label: "Meer energie, de hele dag door",
    korteCode: "energie",
  },
  {
    waarde: "scherper-kunnen-werken",
    label: "Scherper kunnen werken, beter kunnen focussen",
    korteCode: "focus",
  },
  {
    waarde: "minder-stress",
    label: "Minder stress, een rustiger hoofd",
    korteCode: "rust",
  },
  {
    waarde: "beter-slapen",
    label: "Beter en dieper slapen",
    korteCode: "slaap",
  },
  {
    waarde: "weet-niet-precies",
    label: "Ik weet het nog niet precies, ik kijk wat eruit komt",
    korteCode: "open",
  },
];
