// File: lib/freebie-bots/energie-en-focus/types.ts
//
// Score-gebaseerde freebie-bot voor energie en focus.
// Tien vragen, vier sub-thema's, totaal-score 0-30 (max 3 per vraag).

export type EFAntwoord = 0 | 1 | 2 | 3;

export type EFThema = "slaap" | "energie" | "focus" | "leefstijl";

export type EFAntwoorden = {
  // Slaap (3 vragen, max 9)
  inslapen: EFAntwoord;
  nachtwakker: EFAntwoord;
  ochtendfris: EFAntwoord;
  // Energie (3 vragen, max 9)
  middagdip: EFAntwoord;
  uitgeput: EFAntwoord;
  ontbijt: EFAntwoord;
  // Focus (2 vragen, max 6)
  concentratie: EFAntwoord;
  hoofdaan: EFAntwoord;
  // Leefstijl (2 vragen, max 6)
  beweging: EFAntwoord;
  alcohol: EFAntwoord;
};

export type EFSubScore = {
  thema: EFThema;
  label: string;
  emoji: string;
  punten: number;
  max: number;
};

export type EFCategorie = "rustig" | "let-op" | "rode-vlag";

export type EFUitkomst = {
  totaal: number;
  max: number;
  pct: number;
  categorie: EFCategorie;
  categorieLabel: string;
  categorieToon: string;
  subScores: EFSubScore[];
  /** Welke sub-thema's hebben de hoogste belasting (gerangschikt). */
  topThemas: EFThema[];
};
