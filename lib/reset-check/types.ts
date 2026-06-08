// File: lib/reset-check/types.ts
//
// Holistic Reset persoonlijke check. 11-13 score-vragen (afhankelijk
// van conditional voor vrouwen 35+), 4 profiel-vragen, een medische
// lijst-check, en een rijke uitkomst met persoonlijke kennis-gap.

export type ScoreWaarde = 0 | 1 | 2 | 3;

export type Thema =
  | "spijsvertering"
  | "gewicht"
  | "energie"
  | "slaap"
  | "voeding"
  | "hormonen";

export type Conditional = "vrouw_35plus";

export type ScoreVraag = {
  sleutel: string;
  thema: Thema;
  titel: string;
  onder: string;
  conditional?: Conditional;
  antwoorden: { waarde: ScoreWaarde; label: string }[];
};

export type ProfielVraag = {
  sleutel: string;
  titel: string;
  onder: string;
  antwoorden: { waarde: string; label: string }[];
};

export type MedischPunt = {
  sleutel: string;
  label: string;
  isZwanger?: boolean;
};

export type ThemaNiveau = "laag" | "midden" | "hoog";

export type ThemaBlok = {
  titel: string;
  tekst: string;
  praktijk: string;
};

export type ThemaBlokken = Record<Thema, Record<ThemaNiveau, ThemaBlok>>;

export type Tip = {
  titel: string;
  uitleg: string;
};

export type CombinatieInzicht = {
  titel: string;
  tekst: string;
};

export type GeslachtLeeftijd =
  | "vrouw_35plus"
  | "vrouw_jonger"
  | "man"
  | "anders";

export type Antwoorden = {
  voornaam: string;
  achternaam: string;
  email: string;
  instagram: string;
  facebook: string;
  telefoon: string;
  scores: Record<string, ScoreWaarde>;
  profiel: {
    geslacht_leeftijd?: GeslachtLeeftijd;
    afvalpogingen?: string;
    afvalwens?: string;
    investering?: string;
  };
  medisch: string[];
  medischVrij: string;
};

export type HeatCategorie = "heet" | "lauw" | "koel" | "koud";

export type HeatResultaat = {
  score: number;
  categorie: HeatCategorie;
  label: string;
};

export type ThemaScore = {
  thema: Thema;
  totaal: number;
  max: number;
  pct: number;
  niveau: ThemaNiveau;
};

export type UitkomstCategorie = "groen" | "warm";
