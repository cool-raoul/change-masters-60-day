// File: lib/reset-check/uitkomst-model.ts
//
// DE ENE BRON voor de prospect-uitkomst van de Reset-check. Zowel het
// scherm (app/bot/reset-check/[token]/flow.tsx, StapUitkomst) als de
// directe uitkomst-mail (lib/reset-check/uitkomst-mail.ts) bouwen hun
// weergave uit ditzelfde model. Pas je hier (of in content.ts) een tekst
// aan, dan verandert het scherm én de mail automatisch mee. Geen tweede
// plek meer waar teksten kunnen gaan afwijken.
//
// Alleen de WEERGAVE verschilt per kanaal (Tailwind op het scherm,
// mail-veilige inline-HTML in de mail). Alle TEKST en de LOGICA (welke
// banner, welke top-2 thema's, welke nu/heen-zinnen) zit hier.
//
// Bevat GEEN member-intel (heat-score, profiel-dump, medische punten).
// Dat is bewust: dit model voedt prospect-facing weergaven.
//
// Stem: Raoul. Claim-vrij, geen tijds- of gezondheidsbeloftes.

import type { Antwoorden, Thema, ThemaNiveau } from "./types";
import {
  berekenThemaScores,
  bepaalUitkomstCategorie,
  combinatieInzicht,
} from "./score";
import { THEMA_LABELS } from "./vragen";
import {
  THEMA_BLOKKEN,
  TIPS_PER_THEMA,
  NU_PER_THEMA,
  HEEN_PER_THEMA,
  AFVAL_WENS_TEKST,
  BRUG_TEKST,
} from "./content";

// ============================================================
// Vaste teksten (één bron voor scherm én mail)
// ============================================================
export const UITKOMST_INTRO_SUB =
  "Hieronder lees je jouw uitkomst per thema, plus inzichten en concrete tips uit onze praktijk.";
export const SITUATIE_KOP = "Voor jouw situatie specifiek";

export const KENNISGAP_KOP = "Het verschil dat we voor je zien";
export const KENNISGAP_SUB = "Tussen waar je nu staat, en waar je heen wilt 🥰";

export const NU_LABEL = "Waar je nu staat";
export const NU_KOP = "Wat je elke dag voelt";
export const HEEN_LABEL = "Waar je heen wilt";
export const HEEN_KOP = "Hoe het ook kan voelen";
export const HEEN_INTRO =
  "Heel veel mensen die het traject doen, vertellen ons over een soort lichtere versie van zichzelf die ze niet hadden zien aankomen. Een paar van de dingen die ze beschrijven:";
export const HEEN_DISCLAIMER =
  "Niet morgen, niet over een week. Wel gaandeweg, tijdens en na het traject. Voor sommigen krachtiger in de eerste weken, voor anderen pas later. Voor iedereen anders.";
export const BRUG_LABEL = "En wat ertussen zit";
export const BRUG_KOP = "Daar hebben wij wat voor";

export const THEMA_SECTIE_KOP = "Jouw uitkomst per thema";
export const PRAKTIJK_LABEL = "Uit onze praktijk:";

export const COMBI_LABEL = "Wat valt op aan jouw antwoorden";

export const TIPS_SECTIE_KOP = "4 dingen die jij vandaag kunt starten";
export const TIPS_SECTIE_INTRO =
  "Gericht op jouw top-2 thema's. Geen generieke tips, dingen die we in de praktijk zien werken.";

export const MEDISCH_DISCLAIMER =
  "Deze check is geen medisch advies en geen diagnose. Resultaten van de Reset verschillen per persoon en hangen af van levensstijl en uitgangssituatie. Bij twijfel altijd in overleg met je arts.";

// De zes "lichtere versie"-belevingen. emoji + vetgedrukt deel + rest.
export type HeenBelevenis = { emoji: string; sterk: string; rest: string };
export const HEEN_BELEVINGEN: HeenBelevenis[] = [
  {
    emoji: "🌅",
    sterk: "Wakker worden met zin in de dag",
    rest: ", niet eerst een uur opwarmen op de koffie",
  },
  {
    emoji: "👕",
    sterk: "Kleren die over je heen glijden",
    rest: " in plaats van eraan vast te zitten",
  },
  {
    emoji: "⚡",
    sterk: "Halverwege de middag nog energie",
    rest: " over, ook zonder dat tweede bakkie",
  },
  {
    emoji: "🏃",
    sterk: "Plotseling zin in bewegen of sporten",
    rest: ", niet meer omdat het moet, gewoon omdat je dat wilt",
  },
  {
    emoji: "🌙",
    sterk: "'s Avonds nog tijd en zin",
    rest: " om iets leuks te doen, niet alleen overleven op de bank",
  },
  {
    emoji: "🧠",
    sterk: "Een rustig hoofd",
    rest: ", helderder denken, en het gevoel: ja, dit klopt 🥰",
  },
];

// Banner-varianten
export type BannerKleur = "groen" | "warm";
export type UitkomstBanner = {
  emoji: string;
  titel: string;
  tekst: string;
  kleur: BannerKleur;
};

const BANNER_STANDAARD: UitkomstBanner = {
  emoji: "🌱",
  titel: "De Reset kan goed bij jou passen",
  tekst:
    "Op basis van wat je hebt gedeeld, stemmen we in ons gesprek de Reset persoonlijk op jou af. Je hoort gelijk wat de investering voor jou zou worden, zonder dat je hoeft te beslissen of je iets gaat doen. Helemaal vrijblijvend dus, jij beslist rustig zelf 🥰",
  kleur: "groen",
};

const BANNER_WARM: UitkomstBanner = {
  emoji: "🌷",
  titel: "Wat een mooie fase",
  tekst:
    "Zwanger of borstvoeding gevend, wat een mooie fase 🥰 We kijken samen wat past bij jou en je kindje, en wat een goed moment zou zijn om straks de Reset op te pakken. In ons gesprek stemmen we het persoonlijk op je af en hoor je gelijk wat de investering voor jou zou worden. Helemaal vrijblijvend natuurlijk, jij beslist.",
  kleur: "warm",
};

const BANNER_MEDISCH_TEKST =
  "Wat fijn dat je die gezondheidspunten met ons hebt gedeeld, daar hebben we wat aan 🥰 Veel mensen met zo'n punt doen de Reset uiteindelijk wel, mits we het samen goed afstemmen en, waar nodig, met je arts mee laten kijken. In ons gesprek stemmen we het persoonlijk op jou af en hoor je gelijk wat de investering zou zijn. Helemaal vrijblijvend uiteraard.";

// ============================================================
// Het model
// ============================================================
export type UitkomstThema = {
  thema: Thema;
  label: string;
  totaal: number;
  max: number;
  pct: number;
  niveau: ThemaNiveau;
  titel: string;
  tekst: string;
  praktijk: string;
};

export type UitkomstModel = {
  banner: UitkomstBanner;
  introSub: string;
  situatieKop: string;
  kennisGap: {
    kop: string;
    sub: string;
    nuLabel: string;
    nuKop: string;
    nuTekst: string;
    heenLabel: string;
    heenKop: string;
    heenTekst: string;
    heenIntro: string;
    heenBelevingen: HeenBelevenis[];
    heenDisclaimer: string;
    brugLabel: string;
    brugKop: string;
    /** Bevat bewust \n\n; renderers vertalen dat naar een witregel. */
    brugTekst: string;
  };
  themaSectieKop: string;
  praktijkLabel: string;
  themas: UitkomstThema[];
  combiLabel: string;
  combi: { titel: string; tekst: string } | null;
  tipsSectieKop: string;
  tipsSectieIntro: string;
  tips: { titel: string; uitleg: string }[];
  disclaimer: string;
};

/**
 * Bouw het complete prospect-uitkomst-model uit de antwoorden. Exact de
 * logica die het scherm (StapUitkomst) gebruikt, nu op één plek zodat
 * scherm en mail nooit uit elkaar lopen.
 */
export function bouwUitkomstModel(a: Antwoorden): UitkomstModel {
  const themaScores = berekenThemaScores(a);
  const categorie = bepaalUitkomstCategorie(a);
  const heeftMedisch = a.medisch.some((s) => s !== "zwanger" && s !== "geen");
  const combi = combinatieInzicht(themaScores);
  const top2 = [...themaScores]
    .sort((x, y) => y.pct - x.pct)
    .slice(0, 2)
    .map((t) => t.thema);

  // Banner
  let banner: UitkomstBanner;
  if (categorie === "warm") {
    banner = BANNER_WARM;
  } else if (heeftMedisch) {
    banner = { ...BANNER_STANDAARD, tekst: BANNER_MEDISCH_TEKST };
  } else {
    banner = BANNER_STANDAARD;
  }

  // Kennis-gap
  const pctVan = (t: Thema) =>
    themaScores.find((s) => s.thema === t)?.pct ?? 0;
  const nuPunten = top2.filter((t) => pctVan(t) >= 33).map((t) => NU_PER_THEMA[t]);
  const heenPunten = top2
    .filter((t) => pctVan(t) >= 33)
    .map((t) => HEEN_PER_THEMA[t]);
  const afvalTekst = a.profiel.afvalwens
    ? AFVAL_WENS_TEKST[a.profiel.afvalwens]
    : null;
  const intentieStaart =
    (a.scores.intentie ?? 0) >= 2
      ? "Plus dat gevoel van: ja, dit is wat ik wil 🥰"
      : "Een rustig gevoel ook, van hier zou het naartoe mogen.";
  const heenZinnen = [...heenPunten];
  if (afvalTekst) heenZinnen.push(afvalTekst);

  const nuTekst =
    nuPunten.length > 0
      ? `Je gaf aan dat je vooral last hebt van ${nuPunten.join(", en ")}. Dat is iets wat je elke dag voelt, in je werk, je gezin, je rust… het kost je vaak meer energie dan je zelf in de gaten hebt 🥰`
      : "Je antwoorden laten zien dat je nu best stabiel staat. Hier en daar nog wat kleine signalen die om aandacht vragen, niks ernstigs hoor, wel iets om bewust van te zijn.";

  const heenTekst =
    heenZinnen.length > 0
      ? `Stel je een dag voor, eentje met ${heenZinnen.join(", en ")}. ${intentieStaart}`
      : `Een dag waarin je lichaam meewerkt, in plaats van tegen je in. ${intentieStaart}`;

  // Thema's
  const themas: UitkomstThema[] = themaScores.map((ts) => {
    const blok = THEMA_BLOKKEN[ts.thema][ts.niveau];
    return {
      thema: ts.thema,
      label: THEMA_LABELS[ts.thema] ?? ts.thema,
      totaal: ts.totaal,
      max: ts.max,
      pct: ts.pct,
      niveau: ts.niveau,
      titel: blok.titel,
      tekst: blok.tekst,
      praktijk: blok.praktijk,
    };
  });

  // Tips (top-2 thema's, 2 per thema = 4)
  const tips = top2.flatMap((t) => TIPS_PER_THEMA[t] ?? []);

  return {
    banner,
    introSub: UITKOMST_INTRO_SUB,
    situatieKop: SITUATIE_KOP,
    kennisGap: {
      kop: KENNISGAP_KOP,
      sub: KENNISGAP_SUB,
      nuLabel: NU_LABEL,
      nuKop: NU_KOP,
      nuTekst,
      heenLabel: HEEN_LABEL,
      heenKop: HEEN_KOP,
      heenTekst,
      heenIntro: HEEN_INTRO,
      heenBelevingen: HEEN_BELEVINGEN,
      heenDisclaimer: HEEN_DISCLAIMER,
      brugLabel: BRUG_LABEL,
      brugKop: BRUG_KOP,
      brugTekst: BRUG_TEKST,
    },
    themaSectieKop: THEMA_SECTIE_KOP,
    praktijkLabel: PRAKTIJK_LABEL,
    themas,
    combiLabel: COMBI_LABEL,
    combi,
    tipsSectieKop: TIPS_SECTIE_KOP,
    tipsSectieIntro: TIPS_SECTIE_INTRO,
    tips,
    disclaimer: MEDISCH_DISCLAIMER,
  };
}
