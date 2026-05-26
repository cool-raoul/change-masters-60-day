// File: lib/freebie-bots/hormonen-en-overgang/score.ts

import type {
  HOAntwoorden,
  HOCategorie,
  HOSubScore,
  HOThema,
  HOUitkomst,
} from "./types";

const THEMA_DEFS: {
  thema: HOThema;
  label: string;
  emoji: string;
  vragen: (keyof HOAntwoorden)[];
}[] = [
  {
    thema: "hormoon-signalen",
    label: "Hormoon-signalen",
    emoji: "🌸",
    vragen: ["opvliegers", "cyclus", "droogheid"],
  },
  {
    thema: "slaap-herstel",
    label: "Slaap & herstel",
    emoji: "🌙",
    vragen: ["inslapen", "nachtwakker"],
  },
  {
    thema: "stemming-cognitie",
    label: "Stemming & helder hoofd",
    emoji: "🧠",
    vragen: ["stemming", "brainfog"],
  },
  {
    thema: "lichaam-leefstijl",
    label: "Lichaam & leefstijl",
    emoji: "🌿",
    vragen: ["lichaam", "alcohol", "beweging"],
  },
];

const CATEGORIE_GRENZEN: {
  tot: number;
  categorie: HOCategorie;
  label: string;
  toon: string;
}[] = [
  {
    tot: 10,
    categorie: "rustig",
    label: "Rustig",
    toon:
      "Je hormonen lijken redelijk in balans, of je bevindt je nog buiten een sterk overgangsritme. Een paar fine-tuning-puntjes kunnen je nog soepeler door deze tijd helpen.",
  },
  {
    tot: 20,
    categorie: "let-op",
    label: "Let op",
    toon:
      "Er zijn duidelijke signalen die om aandacht vragen. Veel vrouwen met deze score voelen dat hun lichaam in een herijking zit. De blokken hieronder vertellen waar je waarschijnlijk de meeste rust kunt vinden.",
  },
  {
    tot: 30,
    categorie: "rode-vlag",
    label: "Rode vlag",
    toon:
      "Je systeem is duidelijk in een intense fase. Veel vrouwen herkennen deze cluster van signalen pas als zorg-niveau ontstaat. Goed dat je nu kijkt. De blokken hieronder vertellen wat in jouw situatie de meeste verandering kan brengen.",
  },
];

export function berekenUitkomst(a: HOAntwoorden): HOUitkomst {
  const subScores: HOSubScore[] = THEMA_DEFS.map((def) => {
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

  const grens =
    CATEGORIE_GRENZEN.find((g) => totaal <= g.tot) ?? CATEGORIE_GRENZEN[2];

  const topThemas = [...subScores]
    .sort((a, b) => b.punten / b.max - a.punten / a.max)
    .filter((s) => s.punten / s.max >= 0.4)
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
