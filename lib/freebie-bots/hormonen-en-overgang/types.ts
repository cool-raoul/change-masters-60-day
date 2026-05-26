// File: lib/freebie-bots/hormonen-en-overgang/types.ts
//
// Score-gebaseerde freebie-bot voor hormonen en overgang. Tien vragen,
// vier sub-thema's, totaal-score 0-30 (max 3 per vraag).

export type HOAntwoord = 0 | 1 | 2 | 3;

export type HOThema =
  | "hormoon-signalen"
  | "slaap-herstel"
  | "stemming-cognitie"
  | "lichaam-leefstijl";

export type HOAntwoorden = {
  // Hormoon-signalen (3 vragen, max 9)
  opvliegers: HOAntwoord;
  cyclus: HOAntwoord;
  droogheid: HOAntwoord;
  // Slaap + herstel (2 vragen, max 6)
  inslapen: HOAntwoord;
  nachtwakker: HOAntwoord;
  // Stemming + cognitie (2 vragen, max 6)
  stemming: HOAntwoord;
  brainfog: HOAntwoord;
  // Lichaam + leefstijl (3 vragen, max 9)
  lichaam: HOAntwoord;
  alcohol: HOAntwoord;
  beweging: HOAntwoord;
};

export type HOSubScore = {
  thema: HOThema;
  label: string;
  emoji: string;
  punten: number;
  max: number;
};

export type HOCategorie = "rustig" | "let-op" | "rode-vlag";

export type HOUitkomst = {
  totaal: number;
  max: number;
  pct: number;
  categorie: HOCategorie;
  categorieLabel: string;
  categorieToon: string;
  subScores: HOSubScore[];
  topThemas: HOThema[];
};
