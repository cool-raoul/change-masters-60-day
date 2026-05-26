// File: lib/freebie-bots/energie-en-focus/score.ts
//
// Berekent uit de antwoorden de sub-scores per thema + totaal + categorie.

import type {
  EFAntwoorden,
  EFCategorie,
  EFSubScore,
  EFThema,
  EFUitkomst,
} from "./types";

const THEMA_DEFS: {
  thema: EFThema;
  label: string;
  emoji: string;
  vragen: (keyof EFAntwoorden)[];
}[] = [
  {
    thema: "slaap",
    label: "Slaap",
    emoji: "🌙",
    vragen: ["inslapen", "nachtwakker", "ochtendfris"],
  },
  {
    thema: "energie",
    label: "Energie",
    emoji: "⚡",
    vragen: ["middagdip", "uitgeput", "ontbijt"],
  },
  {
    thema: "focus",
    label: "Focus",
    emoji: "🎯",
    vragen: ["concentratie", "hoofdaan"],
  },
  {
    thema: "leefstijl",
    label: "Leefstijl",
    emoji: "🏃",
    vragen: ["beweging", "alcohol"],
  },
];

const CATEGORIE_GRENZEN: { tot: number; categorie: EFCategorie; label: string; toon: string }[] = [
  {
    tot: 10,
    categorie: "rustig",
    label: "Rustig",
    toon:
      "Het draait redelijk goed. Een paar fine-tuning-puntjes kunnen je nog scherper maken. Lees de blokken hieronder, je hoeft er niet alles direct mee.",
  },
  {
    tot: 20,
    categorie: "let-op",
    label: "Let op",
    toon:
      "Er zijn een paar signalen die om aandacht vragen. Veel mensen met deze score voelen dat hun lichaam meer ondersteuning vraagt. De blokken hieronder vertellen waar je waarschijnlijk de meeste winst kunt halen.",
  },
  {
    tot: 30,
    categorie: "rode-vlag",
    label: "Rode vlag",
    toon:
      "Je systeem is duidelijk belast. Dit zijn de signalen waar veel mensen pas naar luisteren als het echt te ver gaat. Goed dat je nu kijkt. De blokken hieronder vertellen je wat in dit punt de meeste rust kan geven.",
  },
];

export function berekenUitkomst(a: EFAntwoorden): EFUitkomst {
  const subScores: EFSubScore[] = THEMA_DEFS.map((def) => {
    const punten = def.vragen.reduce((acc, v) => acc + (a[v] ?? 0), 0);
    const max = def.vragen.length * 3;
    return {
      thema: def.thema,
      label: def.label,
      emoji: def.emoji,
      punten,
      max,
    };
  });

  const totaal = subScores.reduce((acc, s) => acc + s.punten, 0);
  const max = subScores.reduce((acc, s) => acc + s.max, 0);
  const pct = max > 0 ? Math.round((totaal / max) * 100) : 0;

  const grens = CATEGORIE_GRENZEN.find((g) => totaal <= g.tot) ?? CATEGORIE_GRENZEN[2];

  // Top-thema's gesorteerd op verhouding punten/max (de meest belaste)
  const topThemas = [...subScores]
    .sort((a, b) => b.punten / b.max - a.punten / a.max)
    .filter((s) => s.punten / s.max >= 0.4) // alleen thema's >= 40% belast
    .map((s) => s.thema);

  return {
    totaal,
    max,
    pct,
    categorie: grens.categorie,
    categorieLabel: grens.label,
    categorieToon: grens.toon,
    subScores,
    topThemas,
  };
}
