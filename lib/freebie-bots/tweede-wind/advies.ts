// File: lib/freebie-bots/tweede-wind/advies.ts
//
// Personalisatie-laag voor Tweede Wind. Bibliotheek van ankers +
// nutriënten + basis-tips voor energie/focus-thema. EFSA-veilig.
//
// TODO-GABY: lees alle teksten door en herformuleer waar nodig in
// Eleva-stem voordat we de bot zichtbaar maken voor leden.

import type { TweedeWindAntwoorden } from "../types";

export type Thema =
  | "energie-dip"
  | "concentratie"
  | "stress"
  | "slaap"
  | "ritme"
  | "voeding"
  | "beweging"
  | "herstel"
  | "hersenen"
  | "doel-helderheid";

function themaTagsUitAntwoorden(a: TweedeWindAntwoorden): Thema[] {
  const tags = new Set<Thema>();

  switch (a.energie) {
    case "ochtend-piek-middag-dip":
      tags.add("energie-dip");
      tags.add("voeding");
      break;
    case "doormodderen-tot-avond":
      tags.add("energie-dip");
      tags.add("herstel");
      break;
    case "wisselend-onvoorspelbaar":
      tags.add("ritme");
      tags.add("voeding");
      break;
    case "structureel-laag":
      tags.add("energie-dip");
      tags.add("slaap");
      tags.add("voeding");
      break;
  }

  for (const f of a.focusBrekers) {
    switch (f) {
      case "afleiding-schermen":
        tags.add("concentratie");
        tags.add("hersenen");
        break;
      case "te-veel-tegelijk":
        tags.add("concentratie");
        tags.add("stress");
        break;
      case "stress-zorgen":
        tags.add("stress");
        tags.add("slaap");
        break;
      case "slecht-slapen":
        tags.add("slaap");
        tags.add("herstel");
        break;
      case "geen-duidelijk-doel":
        tags.add("doel-helderheid");
        break;
      case "kort-van-geheugen":
        tags.add("hersenen");
        tags.add("slaap");
        break;
      case "moeilijk-beginnen":
        tags.add("doel-helderheid");
        tags.add("concentratie");
        break;
    }
  }

  if (a.slaap !== "diep-en-genoeg") {
    tags.add("slaap");
    tags.add("herstel");
  }

  if (
    a.eetRitme === "veel-snelle-suikers" ||
    a.eetRitme === "skip-ontbijt" ||
    a.eetRitme === "weinig-eiwit"
  ) {
    tags.add("voeding");
    tags.add("energie-dip");
  }

  if (a.beweging === "weinig-tot-niets" || a.beweging === "wisselend") {
    tags.add("beweging");
  }

  if (
    a.herstel === "scherm-tot-bedtijd" ||
    a.herstel === "altijd-aan" ||
    a.herstel === "geen-tijd-voor-rust"
  ) {
    tags.add("herstel");
    tags.add("stress");
  }

  return Array.from(tags);
}

// ============================================================
// ANKER-BIBLIOTHEEK (gedrags-handvatten met waarom-uitleg)
// ============================================================

export type Anker = {
  id: string;
  titel: string;
  actie: string;
  waarom: string;
  themas: Thema[];
  prioriteit: number;
  icoon: string;
  kleur: "rose" | "amber" | "emerald" | "sky" | "violet" | "stone";
};

export const ANKER_BIBLIOTHEEK: Anker[] = [
  {
    id: "ochtend-zonder-scherm",
    titel: "Ochtend-anker",
    actie:
      "Eerste tien minuten na het wakker worden: geen telefoon, geen scherm. Eerst ademen, een glas water, een rustig moment.",
    waarom:
      "In die eerste minuten ontwaakt het cortisol-ritme, dat regelt je energie de hele dag. Een paar minuten zonder externe prikkels laat dat ritme natuurlijk omhoog komen. Schermen zetten je direct in reactie-modus en stelen scherpte voor de rest van de ochtend.",
    themas: ["ritme", "concentratie", "hersenen"],
    prioriteit: 9,
    icoon: "🌅",
    kleur: "amber",
  },
  {
    id: "daglicht-vroeg",
    titel: "Daglicht-anker",
    actie:
      "Binnen het eerste uur na opstaan tien minuten buitenlicht op je gezicht, ook bij bewolkt weer.",
    waarom:
      "Daglicht in de ochtend zet je biologische klok scherper, wat het slaap-waakritme stabieler maakt en je energie de hele dag ondersteunt. Bewolkt weer geeft nog steeds tien tot honderd keer meer licht dan binnen.",
    themas: ["slaap", "energie-dip", "ritme"],
    prioriteit: 9,
    icoon: "☀️",
    kleur: "amber",
  },
  {
    id: "focus-blokken",
    titel: "Focus-anker",
    actie:
      "Drie blokken van 45-60 minuten diepe focus per dag, telefoon op stil en buiten bereik. Tussen elk blok tien minuten echte pauze.",
    waarom:
      "Je brein kan onderbroken aandacht slecht herstellen, gemiddeld twintig minuten per onderbreking. Drie ononderbroken blokken zijn productiever dan een hele dag fragmenteren. Pauzes tussen blokken zijn niet luxe, het zijn de momenten waar je hersenen consolideren.",
    themas: ["concentratie", "hersenen"],
    prioriteit: 9,
    icoon: "🎯",
    kleur: "sky",
  },
  {
    id: "eiwit-ontbijt",
    titel: "Eiwit-ontbijt-anker",
    actie:
      "Bouw je ontbijt rond eiwit (ei, kwark, vis, peulvruchten, eiwit-rijke yoghurt) ipv enkel koolhydraten.",
    waarom:
      "Een ontbijt met eiwit houdt je glucose stabieler, voorkomt de middag-dip die volgt op een snelle-suiker-piek. Eiwit levert ook de bouwstoffen (aminozuren) voor neurotransmitters die scherpte regelen, zoals dopamine en acetylcholine.",
    themas: ["energie-dip", "voeding", "concentratie"],
    prioriteit: 9,
    icoon: "🥚",
    kleur: "emerald",
  },
  {
    id: "water-voor-koffie",
    titel: "Water-anker",
    actie:
      "Een glas water bij het wakker worden, vóór de eerste koffie. Tweede glas een uur later.",
    waarom:
      "Je wordt licht uitgedroogd wakker. Cafeïne op een drogend lichaam geeft een korte piek en een grotere dip. Eerst hydrateren zet je metabolisme aan en geeft je hersenen vloeistof om vlot te werken.",
    themas: ["energie-dip", "ritme"],
    prioriteit: 7,
    icoon: "💧",
    kleur: "sky",
  },
  {
    id: "wandeling-na-eten",
    titel: "Beweeg-anker",
    actie:
      "Een wandeling van tien minuten direct na de lunch, ook al is het rondje om het huis.",
    waarom:
      "Lopen na een maaltijd helpt je bloedsuiker gelijkmatig dalen in plaats van een piek-en-dal. Het scheelt de middag-dip vaak meteen. Daglicht plus beweging activeert ook je focus-systeem voor de tweede helft van de dag.",
    themas: ["energie-dip", "beweging", "concentratie"],
    prioriteit: 8,
    icoon: "🚶",
    kleur: "sky",
  },
  {
    id: "kracht-twee-keer",
    titel: "Kracht-anker",
    actie:
      "Twee keer per week iets met weerstand, tien tot twintig minuten. Eigen lichaamsgewicht, weerstandsband of gewichtjes.",
    waarom:
      "Krachttraining geeft je een grotere energie-buffer voor de hele week. Spieren zijn metabool actief, ze houden je glucose stabieler en regelen je hormoon-balans. Twee korte sessies zijn voldoende om effect te merken.",
    themas: ["beweging", "energie-dip"],
    prioriteit: 7,
    icoon: "💪",
    kleur: "sky",
  },
  {
    id: "avond-zonder-scherm",
    titel: "Avond-anker",
    actie:
      "Een half uur voor het slapen geen scherm meer. Drie diepe ademhalingen en de dag mag aflopen.",
    waarom:
      "Blauw licht remt de aanmaak van het slaap-signaal in je hoofd. Een half uur zonder scherm en bewust ademen geven je zenuwstelsel het signaal dat de dag voorbij is, waardoor je makkelijker in slaap valt en dieper slaapt.",
    themas: ["slaap", "herstel", "stress"],
    prioriteit: 9,
    icoon: "🌙",
    kleur: "violet",
  },
  {
    id: "cafeine-grens",
    titel: "Cafeïne-anker",
    actie:
      "Geen koffie of zwarte thee meer na 14:00 uur. Cafeïne blijft acht uur of langer in je systeem actief.",
    waarom:
      "Cafeïne in de namiddag verstoort de diepe slaap, ook als je makkelijk in slaap valt. Minder cafeïne in de tweede dag-helft geeft veel mensen direct merkbaar betere ochtenden.",
    themas: ["slaap", "energie-dip", "stress"],
    prioriteit: 8,
    icoon: "☕",
    kleur: "stone",
  },
  {
    id: "adem-twee-minuten",
    titel: "Adem-anker",
    actie:
      "Drie keer per dag, op een vast moment, twee minuten bewuste adem (vier seconden in, zes seconden uit).",
    waarom:
      "Verlengd uitademen activeert het parasympathisch zenuwstelsel, de rust-stand. Drie korte momenten per dag bouwen op tot merkbaar rustiger grond-niveau. Werkt ook acuut bij oplopende stress of focus-verlies.",
    themas: ["stress", "concentratie", "herstel"],
    prioriteit: 8,
    icoon: "🌬️",
    kleur: "sky",
  },
  {
    id: "notificaties-uit",
    titel: "Notificatie-anker",
    actie:
      "Push-notificaties van apps die niet urgent zijn: helemaal uit. Alleen telefoongesprekken doorlaten.",
    waarom:
      "Elke onderbroken focus kost gemiddeld twintig minuten om weer op te bouwen. Notificaties zijn de grootste focus-rovers van de moderne werkdag. Uitzetten geeft je hersenen rust ook als je niet aan het werk bent.",
    themas: ["concentratie", "stress", "hersenen"],
    prioriteit: 8,
    icoon: "🔕",
    kleur: "stone",
  },
  {
    id: "dag-afsluiter",
    titel: "Afsluit-anker",
    actie:
      "Vijf minuten op het einde van de werkdag: schrijf op wat klaar is en wat je morgen oppakt. Daarna kop dicht.",
    waarom:
      "Onafgemaakte taken blijven in je hoofd doorlopen ('Zeigarnik-effect'). Een korte afsluiter geeft je brein toestemming om los te laten, waardoor de avond rust kan worden en de slaap dieper.",
    themas: ["stress", "herstel", "doel-helderheid"],
    prioriteit: 7,
    icoon: "📝",
    kleur: "amber",
  },
];

// ============================================================
// NUTRIËNTEN-BIBLIOTHEEK (EFSA-toegestane health-claims)
// ============================================================

export type Nutrient = {
  id: string;
  naam: string;
  bron: string;
  efsaClaims: string[];
  themas: Thema[];
  prioriteit: number;
  icoon: string;
  kleur: "amber" | "emerald" | "sky" | "violet" | "rose" | "stone";
};

export const NUTRIENT_BIBLIOTHEEK: Nutrient[] = [
  {
    id: "magnesium",
    naam: "Magnesium",
    bron: "bladgroente, pitten, peulvruchten, pure chocolade",
    efsaClaims: [
      "draagt bij aan vermindering van vermoeidheid",
      "draagt bij aan een normale werking van het zenuwstelsel",
      "draagt bij aan een normaal energieleverend metabolisme",
      "draagt bij aan een normale psychologische functie",
    ],
    themas: ["energie-dip", "stress", "slaap", "concentratie"],
    prioriteit: 9,
    icoon: "🌿",
    kleur: "emerald",
  },
  {
    id: "b-complex",
    naam: "Vitamine B-complex (B2, B3, B5, B12, foliumzuur)",
    bron: "volkoren, eieren, vlees, zuivel, peulvruchten",
    efsaClaims: [
      "B12 en foliumzuur dragen bij aan vermindering van vermoeidheid",
      "B2 draagt bij aan een normaal energieleverend metabolisme",
      "B5 draagt bij aan normale mentale prestaties",
      "B6 draagt bij aan een normale psychologische functie",
    ],
    themas: ["energie-dip", "concentratie", "hersenen"],
    prioriteit: 9,
    icoon: "⚡",
    kleur: "amber",
  },
  {
    id: "omega-3",
    naam: "Omega-3 (DHA + EPA)",
    bron: "vette vis (zalm, makreel, haring), lijnzaad, walnoot, algenolie",
    efsaClaims: [
      "DHA draagt bij aan een normale werking van de hersenen",
      "EPA en DHA dragen bij aan een normale werking van het hart",
    ],
    themas: ["hersenen", "concentratie", "stress"],
    prioriteit: 9,
    icoon: "🐟",
    kleur: "sky",
  },
  {
    id: "ijzer",
    naam: "IJzer",
    bron: "rood vlees, peulvruchten, bladgroente, pitten",
    efsaClaims: [
      "draagt bij aan vermindering van vermoeidheid",
      "draagt bij aan een normaal zuurstoftransport in het lichaam",
      "draagt bij aan normale cognitieve functies",
    ],
    themas: ["energie-dip", "concentratie", "hersenen"],
    prioriteit: 8,
    icoon: "🩸",
    kleur: "rose",
  },
  {
    id: "vitamine-d",
    naam: "Vitamine D",
    bron: "daglicht, vette vis, eieren",
    efsaClaims: [
      "draagt bij aan een normale werking van het immuunsysteem",
      "draagt bij aan een normale spierfunctie",
      "draagt bij aan instandhouding van normale botten",
    ],
    themas: ["energie-dip", "herstel"],
    prioriteit: 7,
    icoon: "☀️",
    kleur: "amber",
  },
  {
    id: "vitamine-c",
    naam: "Vitamine C",
    bron: "rauwkost, citrus, paprika, kiwi, bessen",
    efsaClaims: [
      "draagt bij aan vermindering van vermoeidheid",
      "draagt bij aan een normale werking van het zenuwstelsel",
      "draagt bij aan een normale psychologische functie",
    ],
    themas: ["energie-dip", "stress"],
    prioriteit: 7,
    icoon: "🍊",
    kleur: "amber",
  },
  {
    id: "zink",
    naam: "Zink",
    bron: "vlees, schaaldieren, peulvruchten, pitten",
    efsaClaims: [
      "draagt bij aan normale cognitieve functies",
      "draagt bij aan een normale werking van het immuunsysteem",
    ],
    themas: ["concentratie", "hersenen"],
    prioriteit: 6,
    icoon: "✨",
    kleur: "violet",
  },
  {
    id: "coq10",
    naam: "Co-Enzym Q10",
    bron: "rood vlees, vette vis, noten, plantaardige oliën",
    efsaClaims: [
      "Co-Q10 is een lichaamseigen stof, een EU-erkende health-claim ontbreekt; veel mensen kiezen voor aanvulling vanaf de 40e omdat de natuurlijke aanmaak vanaf die leeftijd afneemt",
    ],
    themas: ["energie-dip", "herstel"],
    prioriteit: 6,
    icoon: "🔋",
    kleur: "amber",
  },
];

// ============================================================
// BASIS-TIPS (algemeen relevant voor energie/focus)
// ============================================================

export type BasisTip = {
  id: string;
  titel: string;
  uitleg: string;
};

export const BASIS_TIPS: BasisTip[] = [
  {
    id: "moderne-voeding-tekorten",
    titel: "Onze huidige voeding heeft vaak tekorten",
    uitleg:
      "Groente en fruit van vandaag bevatten gemiddeld minder vitaminen en mineralen dan vijftig jaar geleden. Intensieve landbouw, lange transport-routes en vroegtijdig oogsten zijn de oorzaken. Veel mensen merken dat een gerichte aanvulling het verschil maakt, vooral van stoffen die je hersenen en energie-metabolisme intensief gebruiken.",
  },
  {
    id: "focus-is-spier",
    titel: "Focus is een spier, geen toestand",
    uitleg:
      "Focus is niet iets dat je hebt of niet hebt. Het is een vaardigheid die je kunt trainen, en die afhankelijk is van slaap, voeding, beweging, omgeving en gewoonte. Veel mensen denken dat ze 'gewoon niet kunnen concentreren', terwijl het meestal komt door één of twee structurele factoren die met kleine aanpassingen veranderen.",
  },
  {
    id: "stress-stapelt",
    titel: "Stress stapelt onzichtbaar op",
    uitleg:
      "Veel mensen merken pas dat hun emmer vol is als die overloopt. Stress die je niet 'voelt' kan toch je slaap, focus en humeur ondermijnen. Een paar bewuste rust-momenten per dag zijn geen luxe, ze zijn de manier waarop je systeem leegt voordat het overloopt.",
  },
  {
    id: "slaap-investering",
    titel: "Slaap is je goedkoopste cognitieve booster",
    uitleg:
      "Diepe slaap is wanneer je hersenen opruimen en herstellen. Eén uur minder slaap kost je de volgende dag gemiddeld 30 procent van je productiviteit. Wie in slaap-hygiëne investeert, krijgt morgen direct rendement, en op de lange termijn een veel scherper brein.",
  },
  {
    id: "vier-pijlers",
    titel: "Vier pijlers, niet een wonder-pil",
    uitleg:
      "Energie en focus rusten op vier pijlers: slaap, voeding, beweging en rust. Eén pijler verbeteren geeft een klein effect. Twee pijlers samen geven een veel groter effect dan de som. Niemand kan alle vier tegelijk veranderen. Kies één per maand, bouw uit.",
  },
];

// ============================================================
// ADVIES-SELECTIE
// ============================================================

export type AdviesPakket = {
  jouwSituatie: string;
  ankers: Anker[];
  nutrienten: Nutrient[];
  basisTips: BasisTip[];
  extraAandacht?: string;
};

function rangschikOpRelevantie<
  T extends { themas: Thema[]; prioriteit: number },
>(items: T[], themaTags: Thema[]): T[] {
  const themaSet = new Set(themaTags);
  const gerangschikt = items.map((item) => {
    const matchCount = item.themas.filter((t) => themaSet.has(t)).length;
    const score =
      matchCount > 0 ? matchCount * 10 + item.prioriteit : item.prioriteit / 10;
    return { item, score };
  });
  gerangschikt.sort((a, b) => b.score - a.score);
  return gerangschikt.map((g) => g.item);
}

function bouwJouwSituatie(a: TweedeWindAntwoorden): string {
  const energieLabel: Record<typeof a.energie, string> = {
    "stabiel-goed": "je energie is stabiel",
    "ochtend-piek-middag-dip":
      "je hebt een goede ochtend, een dip in de middag",
    "doormodderen-tot-avond":
      "je modderd door de dag heen, pas 's avonds zak je",
    "wisselend-onvoorspelbaar":
      "je energie wisselt onvoorspelbaar van dag tot dag",
    "structureel-laag": "je batterij wordt structureel nooit echt vol",
  };

  const focusLabels: Record<string, string> = {
    "afleiding-schermen": "afleiding van schermen",
    "te-veel-tegelijk": "te veel willen doen",
    "stress-zorgen": "stress en zorgen",
    "slecht-slapen": "slechte slaap",
    "geen-duidelijk-doel": "geen helder doel",
    "kort-van-geheugen": "korte geheugen-spanne",
    "moeilijk-beginnen": "moeite met beginnen",
  };

  const focusTekstArr = a.focusBrekers.map((f) => focusLabels[f]).filter(Boolean);
  let focusTekst = "";
  if (focusTekstArr.length === 1) focusTekst = focusTekstArr[0];
  else if (focusTekstArr.length === 2)
    focusTekst = `${focusTekstArr[0]} én ${focusTekstArr[1]}`;
  else if (focusTekstArr.length === 3)
    focusTekst = `${focusTekstArr[0]}, ${focusTekstArr[1]} én ${focusTekstArr[2]}`;

  const doelLabel: Record<typeof a.doel, string> = {
    "meer-energie-de-hele-dag": "Je zoekt meer energie de hele dag door",
    "scherper-kunnen-werken": "Je wilt scherper kunnen werken en focussen",
    "minder-stress": "Je wilt een rustiger hoofd, minder stress",
    "beter-slapen": "Je wilt beter en dieper slapen",
    "weet-niet-precies": "Je staat open voor wat eruit komt",
  };

  return `${energieLabel[a.energie]}. Wat focus betreft loop je vooral aan tegen ${focusTekst}. ${doelLabel[a.doel]}.`;
}

function bouwExtraAandacht(a: TweedeWindAntwoorden): string | undefined {
  if (
    a.slaap !== "diep-en-genoeg" &&
    (a.herstel === "scherm-tot-bedtijd" || a.herstel === "altijd-aan")
  ) {
    return "We zien een combinatie van verstoorde slaap en moeite met echt uitschakelen. Die twee versterken elkaar: hoe minder je herstelt, hoe lastiger slapen wordt. Beginnen bij het avond-anker (een half uur zonder scherm) is voor veel mensen het meest helpend, meer dan voeding of supplement alleen.";
  }
  if (
    a.energie === "ochtend-piek-middag-dip" &&
    (a.eetRitme === "veel-snelle-suikers" || a.eetRitme === "skip-ontbijt")
  ) {
    return "De middag-dip die je beschrijft is vaak een direct gevolg van wat je in de ochtend eet. Een eiwit-rijk ontbijt en een wandeling na de lunch geven de meeste mensen al binnen een week merkbaar stabielere energie tot 17:00.";
  }
  if (
    a.focusBrekers.includes("afleiding-schermen") &&
    a.focusBrekers.includes("te-veel-tegelijk")
  ) {
    return "Schermen + multitasken zijn de twee grootste focus-rovers van de moderne werkdag. Notificaties uit en drie focus-blokken van een uur per dag is voor veel mensen de grootste hefboom.";
  }
  if (a.energie === "structureel-laag" && a.slaap !== "diep-en-genoeg") {
    return "Structureel lage energie hangt vaak samen met onvolwaardige slaap. Beginnen bij slaap is voor veel mensen het effectiefste pad terug naar een vollere batterij.";
  }
  return undefined;
}

export function selecteerAdvies(a: TweedeWindAntwoorden): AdviesPakket {
  const themaTags = themaTagsUitAntwoorden(a);

  const gerangschikteAnkers = rangschikOpRelevantie(
    ANKER_BIBLIOTHEEK,
    themaTags,
  );
  const gerangschikteNutrienten = rangschikOpRelevantie(
    NUTRIENT_BIBLIOTHEEK,
    themaTags,
  );

  const basisTips: BasisTip[] = [
    BASIS_TIPS.find((b) => b.id === "moderne-voeding-tekorten")!,
    BASIS_TIPS.find((b) => b.id === "vier-pijlers")!,
  ];
  if (a.focusBrekers.includes("stress-zorgen") || themaTags.includes("stress")) {
    basisTips.push(BASIS_TIPS.find((b) => b.id === "stress-stapelt")!);
  } else if (a.slaap !== "diep-en-genoeg") {
    basisTips.push(BASIS_TIPS.find((b) => b.id === "slaap-investering")!);
  } else {
    basisTips.push(BASIS_TIPS.find((b) => b.id === "focus-is-spier")!);
  }

  return {
    jouwSituatie: bouwJouwSituatie(a),
    ankers: gerangschikteAnkers.slice(0, 4),
    nutrienten: gerangschikteNutrienten.slice(0, 5),
    basisTips,
    extraAandacht: bouwExtraAandacht(a),
  };
}
