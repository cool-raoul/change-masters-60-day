// File: lib/reset-check/score.ts
//
// Score-berekening + heat-score (intern voor jullie sorteer-prio in admin).

import type {
  Antwoorden,
  HeatCategorie,
  HeatResultaat,
  ThemaScore,
  Thema,
  UitkomstCategorie,
  CombinatieInzicht,
} from "./types";
import { VRAGEN, geldigeVragen, THEMA_LABELS } from "./vragen";

const INTENTIE_NAAR_TIEN: Record<number, number> = { 0: 2, 1: 4.5, 2: 7, 3: 9.5 };

export function berekenHeat(a: Antwoorden): HeatResultaat {
  const intentieWaarde = a.scores.intentie ?? 0;
  const intentieToTen = INTENTIE_NAAR_TIEN[intentieWaarde] ?? 5;

  const geldig = geldigeVragen(a.profiel.geslacht_leeftijd);
  const klachten = geldig
    .filter((v) => v.sleutel !== "intentie")
    .reduce((sum, v) => sum + (a.scores[v.sleutel] ?? 0), 0);
  const klachtenMax = (geldig.length - 1) * 3 || 1;
  const klachtenToTen = (klachten / klachtenMax) * 10;

  const investering = a.profiel.investering;
  const investBoost = investering === "altijd" ? 2 : investering === "nee" ? -3 : 0;
  const heeftNeeFilter = investering === "nee";

  const telBoost = a.telefoon && a.telefoon.length >= 8 ? 1 : 0;

  const afvalWens = a.profiel.afvalwens;
  const afvalBoost = ["5-10", "10-20", "20+"].includes(afvalWens ?? "") ? 0.5 : 0;

  let heat = intentieToTen * 0.5 + klachtenToTen * 0.2 + investBoost + telBoost + afvalBoost;
  heat = Math.max(0, Math.min(10, heat));
  if (heeftNeeFilter) heat = Math.min(heat, 4);

  const score = Math.round(heat * 10) / 10;
  const categorie: HeatCategorie = score >= 8 ? "heet" : score >= 6 ? "lauw" : score >= 4 ? "koel" : "koud";
  const label =
    categorie === "heet"
      ? "🔥 HEET, direct bellen"
      : categorie === "lauw"
        ? "🌤 LAUW, binnen week bellen"
        : categorie === "koel"
          ? "💧 KOEL, sequence-focus"
          : "❄️ KOUD, low-touch sequence";

  return { score, categorie, label };
}

export function berekenThemaScores(a: Antwoorden): ThemaScore[] {
  const geldig = geldigeVragen(a.profiel.geslacht_leeftijd);
  const byThema: Record<string, { totaal: number; max: number }> = {};

  for (const v of geldig) {
    if (a.scores[v.sleutel] === undefined) continue;
    if (!byThema[v.thema]) byThema[v.thema] = { totaal: 0, max: 0 };
    byThema[v.thema].totaal += a.scores[v.sleutel];
    byThema[v.thema].max += 3;
  }

  return Object.entries(byThema).map(([thema, { totaal, max }]) => {
    const pct = (totaal / max) * 100;
    return {
      thema: thema as Thema,
      totaal,
      max,
      pct,
      niveau: pct < 33 ? "laag" : pct < 67 ? "midden" : "hoog",
    };
  });
}

export function bepaalUitkomstCategorie(a: Antwoorden): UitkomstCategorie {
  return a.medisch.includes("zwanger") ? "warm" : "groen";
}

export function combinatieInzicht(themaScores: ThemaScore[]): CombinatieInzicht | null {
  const hoogThemas = new Set(themaScores.filter((t) => t.pct >= 67).map((t) => t.thema));

  if (hoogThemas.has("spijsvertering") && hoogThemas.has("energie")) {
    return {
      titel: "Het spijsvertering-energie patroon",
      tekst: "Hoge signalen op zowel je darmen als je energie. Dat is geen toeval. <em>Verteren kost veel energie</em>. Mensen die deze combinatie hebben, voelen vaak dat een halfuur na de maaltijd hun energie wegzakt. Aanpak: lichtere maaltijden, meer eet-pauzes, en aandacht voor darmflora. Mensen die het traject doen met deze combinatie, vertellen vaak dat hun energie zich herstelt zodra hun darmen rustiger worden.",
    };
  }
  if (hoogThemas.has("gewicht") && hoogThemas.has("voeding")) {
    return {
      titel: "Het bewustzijn-actie patroon",
      tekst: "Je weet dat het anders moet (hoge intentie) en je grijpt structureel naar wat 'niet helpt' (lage voeding-bewustzijn). <em>Dit is niet jouw fout. Dit is hoe ons brein werkt onder druk</em>. Het patroon doorbreken vraagt niet meer wilskracht, het vraagt een ander systeem. Mensen die hier zitten en het traject doen, vertellen vaak dat de eerste week zwaar is (cravings) en daarna verrassend stil wordt. Het brein went snel aan een ander ritme als het maar lang genoeg duurt.",
    };
  }
  if (hoogThemas.has("slaap") && hoogThemas.has("energie")) {
    return {
      titel: "De slaap-energie vicieuze cirkel",
      tekst: "Slecht slapen geeft lage dag-energie. Lage energie zorgt voor stress, koffie en suiker, wat je slaap weer verstoort. <em>Een klassieke vicieuze cirkel</em>. De cirkel doorbreken begint bijna altijd bij de avond: laatste maaltijd vroeger, scherm-uit, en een ritme dat je lichaam herkent. Mensen die het traject doen, vertellen vaak dat hun avond rustiger gaat voelen door de combinatie van voeding en ritme.",
    };
  }
  if (hoogThemas.has("spijsvertering") && hoogThemas.has("gewicht")) {
    return {
      titel: "Het darm-gewicht verband",
      tekst: "Je darmflora en je gewicht hangen veel meer samen dan vaak gedacht wordt. <em>Een verstoorde darmflora maakt het lichaam moeilijker om voedingsstoffen optimaal te verwerken</em>. Mensen ervaren vaak: ik eet niet veel maar val niet af. Veel mensen met deze combinatie vertellen dat het traject hen verschil bracht door beide tegelijk te benaderen: darm-rust en voeding-structuur. Niet door minder, wel door anders.",
    };
  }
  if (hoogThemas.has("hormonen") && hoogThemas.has("gewicht")) {
    return {
      titel: "Het hormoon-gewicht verband",
      tekst: "Hoge signalen op zowel hormonen als gewicht is een patroon dat veel vrouwen herkennen, vooral vanaf 40+. <em>Hormonale schommelingen beïnvloeden hoe je lichaam met voeding omgaat</em>. Wat eerst werkte om op gewicht te blijven, werkt opeens niet meer. Mensen vertellen vaak dat ze pas in onze gesprekken voor het eerst begrepen waarom hun lichaam zich anders gedraagt dan vroeger.",
    };
  }
  const hoogList = Array.from(hoogThemas);
  if (hoogList.length >= 3) {
    const labels = hoogList.map((t) => THEMA_LABELS[t]?.toLowerCase()).join(", ");
    return {
      titel: "Meerdere signalen tegelijk",
      tekst: `Je geeft op meerdere thema's hoge signalen: ${labels}. <em>Dat is geen reden tot zorg, wel reden tot serieus kijken</em>. Het lichaam werkt als één systeem: darmen, energie, slaap, gewicht en hormonen beïnvloeden elkaar continu. Bij meerdere signalen tegelijk is een geïntegreerde aanpak vaak praktischer dan losse 'tips voor één ding'. Dat is hoe het traject is opgebouwd.`,
    };
  }
  const laagThemas = themaScores.filter((t) => t.pct < 33).length;
  if (hoogThemas.size === 0 && laagThemas >= 3) {
    return {
      titel: "Je staat er goed op",
      tekst: "Op de meeste thema's geef je een rustig signaal. <em>Mooi fundament</em>. Een Reset voor jou is geen herstel-traject, eerder een verfijning. Mensen die hier zo zitten, gebruiken de Reset vaak als periodieke check-in voor hun systeem, of om een specifiek ding (vaak voeding-bewustzijn) verder te verdiepen.",
    };
  }
  return null;
}
