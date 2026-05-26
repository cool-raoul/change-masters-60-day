// File: lib/freebie-bots/hormonen-en-overgang/content.ts
//
// Educatieve content voor de Hormonen & Overgang bot. Claim-vrij,
// EFSA-veilige voedings-claims.
//
// TODO-GABY: lees alle teksten, herformuleer in Eleva-stem.

import type { HOThema } from "./types";

export type ThemaBlok = {
  thema: HOThema;
  titel: string;
  emoji: string;
  intro: string;
  paragrafen: string[];
  handvatten: { titel: string; actie: string; waarom: string }[];
  nutrienten: { naam: string; bron: string; efsaClaims: string[] }[];
};

export const THEMA_BLOKKEN: Record<HOThema, ThemaBlok> = {
  "hormoon-signalen": {
    thema: "hormoon-signalen",
    emoji: "🌸",
    titel: "Wat er biologisch gebeurt in deze fase",
    intro:
      "Opvliegers, droogheid, cyclus-veranderingen zijn signalen van een diepe biologische omslag. Niet 'iets dat er nu eenmaal bij hoort', maar een fysiologisch proces waar veel meer over bekend is dan vroeger.",
    paragrafen: [
      "Vanaf je veertigste begint je oestrogeen-productie langzaam af te nemen. Eerst onregelmatig (peri-overgang), daarna stabieler op een lager niveau (post-overgang). Oestrogeen reguleerde meer dan je cyclus alleen: het beïnvloedt je temperatuur-regulatie, je serotonine-aanmaak, je collagene weefsels, je botdichtheid, en je glucose-tolerantie. Als het afneemt, voelt je hele lichaam dat in meerdere systemen tegelijk.",
      "Opvliegers ontstaan niet door 'gebrek aan hormonen', maar door een gevoeliger geworden hypothalamus, het deel van je hersenen dat je temperatuur regelt. Bij lage oestrogeen-niveaus reageert dit gebied overgevoelig op kleine temperatuur-schommelingen, waardoor je lichaam 'denkt' dat het te warm is en wegkoel-mechanismen activeert. Dit verklaart waarom alcohol, cafeïne en stress opvliegers verergeren: ze versterken de hypothalamus-prikkelbaarheid.",
      "Droogheid ontstaat doordat slijmvliezen (vagina, mond, ogen) oestrogeen-afhankelijk zijn. De cellaag wordt dunner en de natuurlijke smeer-laag neemt af. Dit is niet onomkeerbaar en niet iets om mee te leren leven, er zijn meerdere ondersteunende strategieën zonder hormoon-therapie.",
    ],
    handvatten: [
      {
        titel: "Temperatuur-anker",
        actie:
          "Laagjes-kleding, ventilator in de slaapkamer, koel kussen of cooling-spray bij je bed.",
        waarom:
          "Geeft je lichaam manieren om je hypothalamus-prikkel direct te dempen. Werkt vaak beter dan 'er doorheen vechten'.",
      },
      {
        titel: "Alcohol minimaliseren",
        actie:
          "Maximaal één glas per dag, niet binnen drie uur voor bedtijd. Een paar avonden helemaal niet.",
        waarom:
          "Alcohol verergert opvliegers via vaatverwijding en raakt je slaap-herstel direct. Veel vrouwen merken binnen een week alcohol-vrij merkbaar minder opvliegers.",
      },
      {
        titel: "Suiker-pieken vermijden",
        actie:
          "Verlaag geraffineerde suikers en snelle koolhydraten, vooral in de tweede helft van de dag.",
        waarom:
          "Bloedsuiker-pieken triggeren cortisol en kunnen opvliegers uitlokken. Stabiele bloedsuiker betekent een rustiger hormoon-omgeving.",
      },
      {
        titel: "Phyto-oestrogeen-bronnen",
        actie:
          "Lijnzaad gemalen door yoghurt, peulvruchten, soja (tempé, edamame, tofu), klaver-thee.",
        waarom:
          "Plant-oestrogenen lijken op je eigen oestrogeen en kunnen binden aan dezelfde receptoren. Zwakker effect, maar veel vrouwen merken er rust van.",
      },
    ],
    nutrienten: [
      {
        naam: "Vitamine B6",
        bron: "vis, kip, banaan, volkoren",
        efsaClaims: [
          "draagt bij aan de regulatie van de hormonale activiteit",
          "draagt bij aan een normale psychologische functie",
        ],
      },
      {
        naam: "Magnesium",
        bron: "bladgroente, pitten, peulvruchten, pure chocolade",
        efsaClaims: [
          "draagt bij aan een normale werking van het zenuwstelsel",
          "draagt bij aan een normale psychologische functie",
        ],
      },
    ],
  },

  "slaap-herstel": {
    thema: "slaap-herstel",
    emoji: "🌙",
    titel: "Waarom slaap juist nu vaker verstoord raakt",
    intro:
      "Slaap is in deze fase vaak een van de eerste dingen die kantelt. Niet door wat je doet voor het slapen gaan, maar door wat er biologisch ondergronds verandert.",
    paragrafen: [
      "Oestrogeen helpt je serotonine-aanmaak ondersteunen, en serotonine is de bouwsteen voor melatonine: het hormoon dat je slaap-cyclus regelt. Als oestrogeen daalt, daalt indirect ook je natuurlijke melatonine-aanmaak. Dat verklaart waarom veel vrouwen die vroeger goed sliepen ineens moeite hebben met inslapen of doorslapen vanaf hun vijfenveertigste.",
      "Daarnaast wordt de diepe slaap (de eerste vier uur) minder diep. Dit is precies wanneer je hersenen opruimen en je lichaam herstelt. Een onrustige nachten-cyclus die je vroeger niet eens zou merken, voelt nu zwaar omdat je herstel-werk niet meer afgerond wordt.",
      "Nachtelijke opvliegers en zweten zijn de directste verstoorders: je wordt wakker omdat je temperatuur uit balans is, en daarna kost het tijd om opnieuw in slaap te komen. Voor veel vrouwen wordt 03:00 tot 05:00 een wakker-uur, omdat de slaap dan biologisch lichtst is en de hypothalamus het hardste reageert op temperatuur-prikkels.",
    ],
    handvatten: [
      {
        titel: "Koele slaapkamer",
        actie:
          "Onder de 18 graden, katoenen of bamboe lakens, geen warmte-vasthouden materiaal. Pyjama op slijmvliezen-koel-materiaal.",
        waarom:
          "Lagere temperatuur ondersteunt je natuurlijke slaap-fase-overgangen en voorkomt opvlieger-triggers.",
      },
      {
        titel: "Avond zonder scherm",
        actie:
          "Een half uur voor bedtijd geen telefoon, tablet of TV. Lees, schrijf of doe drie diepe ademhalingen.",
        waarom:
          "Blauw licht remt al-verminderde melatonine-aanmaak nog verder. Een half uur zonder is biologisch genoeg.",
      },
      {
        titel: "Alcohol stoppen drie uur voor bed",
        actie:
          "Geen alcohol meer drie uur voor bedtijd, of minder vaak überhaupt drinken.",
        waarom:
          "Alcohol helpt inslapen maar breekt de tweede slaaphelft (REM) systematisch af. Tegelijk een grote opvlieger-trigger.",
      },
      {
        titel: "Magnesium voor de nacht",
        actie:
          "Bladgroente, pitten of peulvruchten in de avond. Eventueel gerichte aanvulling overwegen.",
        waarom:
          "Magnesium is bouwsteen van de neurotransmitter GABA, die je zenuwstelsel kalmeert. Veel vrouwen melden rustigere nachten.",
      },
    ],
    nutrienten: [
      {
        naam: "Magnesium",
        bron: "bladgroente, pitten, peulvruchten",
        efsaClaims: [
          "draagt bij aan een normale werking van het zenuwstelsel",
          "draagt bij aan een normale psychologische functie",
        ],
      },
      {
        naam: "Vitamine B6",
        bron: "vis, kip, banaan, volkoren",
        efsaClaims: [
          "draagt bij aan een normale psychologische functie",
          "draagt bij aan vermindering van vermoeidheid",
        ],
      },
    ],
  },

  "stemming-cognitie": {
    thema: "stemming-cognitie",
    emoji: "🧠",
    titel: "Stemming en helder hoofd in een hormonale verschuiving",
    intro:
      "'Brain fog', een korter lontje, vlakker voelen: dit zijn geen karakter-veranderingen maar biologische bijwerkingen van een hormonale omslag. Het is tijdelijk, het heeft uitleg, en het is niet jouw schuld.",
    paragrafen: [
      "Oestrogeen ondersteunt de aanmaak en werking van neurotransmitters zoals serotonine (stemming), dopamine (motivatie en plezier) en acetylcholine (geheugen en focus). Als oestrogeen schommelt of daalt, schommelen al deze stoffen mee. Dat verklaart waarom dezelfde gebeurtenis je nu zwaarder kan raken dan een paar jaar geleden, of waarom je een woord niet kunt vinden dat je vroeger moeiteloos op de tong had.",
      "Brain fog wordt vaak versterkt door slecht slapen en hormonen-schommelingen die je glucose-tolerantie verstoren. Als je hersenen 's nachts hun opruim-werk niet kunnen doen én overdag glucose-pieken krijgen, zijn ze gewoon over-vraagd. De foggy-feeling is een symptoom, niet de oorzaak.",
      "Belangrijk: hormonale stemmings-verschuiving is fundamenteel anders dan depressie. Een tijdelijke verlaging van je grond-niveau door biochemie kan voelen als depressie, maar het is biologisch tijdelijk. Als gevoelens van leegte langer dan een paar weken aanhouden of je dagelijks functioneren beperken, is professionele hulp altijd een goed idee, parallel aan leefstijl-aanpak.",
    ],
    handvatten: [
      {
        titel: "Daglicht in het eerste uur",
        actie:
          "Tien minuten buiten binnen het eerste uur na opstaan, ook bij bewolkt weer.",
        waarom:
          "Daglicht ondersteunt serotonine-aanmaak en reset je cortisol-ritme, beide direct verbonden met stemming.",
      },
      {
        titel: "Eiwit bij elke maaltijd",
        actie:
          "Eieren, vis, kip, zuivel, peulvruchten of plantaardige eiwit-bronnen.",
        waarom:
          "Eiwit levert aminozuren (tryptofaan, tyrosine) die bouwstoffen zijn voor serotonine en dopamine. Stabielere bloedsuiker geeft stabielere stemming.",
      },
      {
        titel: "Verbinding actief opzoeken",
        actie:
          "Eén echt gesprek per week met iemand die deze fase kent of kende.",
        waarom:
          "Herkenning verlaagt schaamte en stress, en stress verergert hormonale symptomen. Sociaal contact is biologisch noodzaak, geen luxe.",
      },
      {
        titel: "Mind-body-praktijk",
        actie:
          "Drie keer per week twintig minuten yoga, tai-chi, wandelen in stilte of meditatie.",
        waarom:
          "Activeert het parasympathisch zenuwstelsel en verlaagt cortisol. Cumulatief effect op grond-niveau van stemming en concentratie.",
      },
    ],
    nutrienten: [
      {
        naam: "Omega-3 (DHA + EPA)",
        bron: "vette vis, lijnzaad, walnoot, algenolie",
        efsaClaims: [
          "DHA draagt bij aan een normale werking van de hersenen",
          "EPA en DHA dragen bij aan een normale werking van het hart",
        ],
      },
      {
        naam: "Vitamine B-complex (B6, B12, foliumzuur)",
        bron: "volkoren, eieren, vlees, peulvruchten",
        efsaClaims: [
          "B6 draagt bij aan een normale psychologische functie",
          "B12 en foliumzuur dragen bij aan vermindering van vermoeidheid",
        ],
      },
      {
        naam: "IJzer",
        bron: "rood vlees, peulvruchten, bladgroente",
        efsaClaims: [
          "draagt bij aan vermindering van vermoeidheid",
          "draagt bij aan normale cognitieve functies",
        ],
      },
    ],
  },

  "lichaam-leefstijl": {
    thema: "lichaam-leefstijl",
    emoji: "🌿",
    titel: "Botten, spieren en de keuzes die nu meer wegen dan vroeger",
    intro:
      "In deze fase reageert je lichaam anders op alles wat je doet of laat. Dezelfde glas wijn, dezelfde week zonder sporten, dezelfde stress-vol weekend heeft nu meer impact dan tien jaar geleden. Niet erg, wel weten.",
    paragrafen: [
      "Oestrogeen beschermde je botten levenslang door de afbraak te remmen. Vanaf de overgang valt die bescherming geleidelijk weg, waardoor botdichtheid versneld afneemt. Krachttraining en voldoende calcium plus vitamine D worden in deze fase letterlijk levensreddend: vrouwen die hierin investeren vanaf hun vijfenveertigste hebben tot tien jaar later significant lager risico op botbreuken.",
      "Spiermassa neemt vanaf je veertigste natuurlijk af (één tot twee procent per jaar), en dat versnelt in de overgang. Spier is metabool actief weefsel: meer spier betekent hoger rust-verbruik en stabielere bloedsuiker. Verlies van spier verklaart deels de gewichts-verschuiving en lager-voelende energie die veel vrouwen ervaren.",
      "Alcohol-verwerking verandert ook. Je lever, die in de overgang al meer werk heeft met hormoon-afbraak, verwerkt alcohol minder efficiënt. Hetzelfde glas heeft langer effect, kost meer slaap-kwaliteit, en triggert vaker opvliegers. Niet stoppen hoeft, wel minder vaak en minder veel maakt een biologisch zichtbaar verschil.",
    ],
    handvatten: [
      {
        titel: "Krachttraining twee keer per week",
        actie:
          "Tien tot twintig minuten met weerstand. Eigen lichaamsgewicht, weerstandsband, of gewichtjes thuis.",
        waarom:
          "Belangrijkste investering in lange-termijn botdichtheid en spier-behoud. Geen sportschool nodig.",
      },
      {
        titel: "Eiwit per maaltijd",
        actie:
          "Bij elke maaltijd een eiwit-bron (1.2-1.6g per kg lichaamsgewicht totaal per dag).",
        waarom:
          "Spier-bouw vraagt continu eiwit-toevoer. Vrouwen 45+ hebben aantoonbaar meer eiwit nodig dan jongere vrouwen voor dezelfde spier-behoud.",
      },
      {
        titel: "Twee alcohol-vrije dagen per week",
        actie:
          "Kies vaste dagen, of een hele week proberen voor een goed referentiepunt.",
        waarom:
          "Lever-rust ondersteunt hormoon-afbraak. Slaap herstelt zichtbaar, opvliegers nemen af.",
      },
      {
        titel: "Dagelijks beweging",
        actie:
          "Minimum tien minuten beweging per dag, plus twee keer per week stevig.",
        waarom:
          "Onder de tien minuten is het effect klein. Beweging stimuleert ook bot-aanmaak (wandelen, traplopen, dansen).",
      },
    ],
    nutrienten: [
      {
        naam: "Vitamine D",
        bron: "daglicht, vette vis, eieren",
        efsaClaims: [
          "draagt bij aan instandhouding van normale botten",
          "draagt bij aan een normale werking van het immuunsysteem",
          "draagt bij aan een normale spierfunctie",
        ],
      },
      {
        naam: "Vitamine K",
        bron: "bladgroente, broccoli, gefermenteerde producten",
        efsaClaims: [
          "draagt bij aan instandhouding van normale botten",
          "draagt bij aan een normale bloedstolling",
        ],
      },
      {
        naam: "Calcium",
        bron: "zuivel, sesamzaad, amandel, bladgroente",
        efsaClaims: [
          "is nodig voor de instandhouding van normale botten",
          "draagt bij aan een normale werking van spieren",
        ],
      },
    ],
  },
};

export const INTERNET_PERSPECTIEF = {
  titel: "Voordat we beginnen, een kleine waarschuwing",
  paragrafen: [
    "Je hebt waarschijnlijk al van alles gelezen over de overgang. Internet staat vol artikelen, ChatGPT geeft je een lange lijst met tips, en social media is vol coaches met snelle oplossingen. Het probleem is niet dat er te weinig informatie is, het is dat er veel te veel is en het meeste daarvan slaat een belangrijke laag over: hoe alles bij JOU samenhangt.",
    "Opvliegers zijn verbonden met je slaap, slaap met je stemming, stemming met je hormoon-balans, hormonen met je voeding, voeding met je bloedsuiker, en bloedsuiker met je opvliegers. Het is een cyclus, geen lijst losse symptomen. Eén tip los daaruit werkt zelden lang, want het probleem kan ergens anders in de cyclus zitten dan waar het symptoom verschijnt.",
    "Wat we hier proberen is dat geheel zichtbaar maken voor jouw specifieke situatie. Niet door dezelfde generieke tips te herhalen, maar door op basis van jouw antwoorden te laten zien waar in JOUW cyclus de meeste druk zit. En dan vertellen we het verhaal achter die druk, niet alleen de oplossing.",
  ],
};

export const BASIS_LEEFSTIJL_TIPS = [
  {
    icoon: "🍷",
    titel: "Alcohol: minder en niet drie uur voor bed",
    uitleg:
      "Verergert opvliegers en breekt slaap-herstel. Zichtbaar effect na één week pauze.",
  },
  {
    icoon: "☕",
    titel: "Cafeïne: niet na 14:00",
    uitleg:
      "Versterkt hypothalamus-prikkelbaarheid. Veel vrouwen merken minder opvliegers.",
  },
  {
    icoon: "🥚",
    titel: "Eiwit bij elke maaltijd",
    uitleg:
      "Stabielere bloedsuiker, bouwstoffen voor neurotransmitters en spier-behoud.",
  },
  {
    icoon: "☀️",
    titel: "Daglicht in het eerste uur",
    uitleg: "Reset je biologische klok en ondersteunt serotonine-aanmaak.",
  },
  {
    icoon: "💪",
    titel: "Twee keer per week kracht",
    uitleg: "Belangrijkste investering voor botten en lange-termijn-energie.",
  },
  {
    icoon: "🌬️",
    titel: "Drie keer per dag bewust ademen",
    uitleg:
      "Vier in, zes uit. Activeert rust-stand, verlaagt opvlieger-trigger.",
  },
  {
    icoon: "💞",
    titel: "Eén echt gesprek per week",
    uitleg:
      "Verbinding verlaagt stress-grondniveau. Vrouwen die hun overgang delen herstellen significant beter.",
  },
];
