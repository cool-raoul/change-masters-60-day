// File: lib/freebie-bots/energie-en-focus/content.ts
//
// Educatieve content-blokken voor de Energie & Focus bot. Vier
// thema-blokken (slaap, energie, focus, leefstijl) + algemene basis-
// tips + 'internet-zegt-veel'-perspectief.
//
// Alle content is claim-vrij. Voedings-claims zijn EFSA-toegestaan
// (Verordening EU 1924/2006). Adviezen zijn over GEDRAG en
// VOEDINGSPATROON, niet over genezen of behandelen.
//
// TODO-GABY: lees alle teksten door en herformuleer in Eleva-stem
// voordat de bot voor leden zichtbaar wordt. Niet alles hoeft per
// se in de definitieve versie te blijven.

import type { EFThema } from "./types";

export type ThemaBlok = {
  thema: EFThema;
  titel: string;
  emoji: string;
  /** Korte intro-zin, altijd zichtbaar als kop. */
  intro: string;
  /** Diepere uitleg, paragrafen onder elkaar. */
  paragrafen: string[];
  /** Concrete handvatten met biologische waarom-zin. */
  handvatten: { titel: string; actie: string; waarom: string }[];
  /** Voedingsstoffen die in dit thema vaak belangrijk worden, met
      EFSA-claims. */
  nutrienten: {
    naam: string;
    bron: string;
    efsaClaims: string[];
  }[];
};

export const THEMA_BLOKKEN: Record<EFThema, ThemaBlok> = {
  slaap: {
    thema: "slaap",
    emoji: "🌙",
    titel: "Slaap, je goedkoopste cognitieve booster",
    intro:
      "Diepe slaap is wanneer je hersenen opruimen, herstellen en geheugen consolideren. Eén uur minder kost je gemiddeld 30 procent productiviteit de volgende dag.",
    paragrafen: [
      "Tijdens diepe slaap (de eerste vier uur) ruimen je hersenen letterlijk afvalstoffen op via het glymfatisch systeem. Dat lukt alleen als je echt onder die diepe lagen komt. Veel mensen denken dat ze 'genoeg' slapen omdat ze acht uur in bed liggen, maar onrustige of oppervlakkige slaap doet dit werk niet. Vandaar dat je uitgeput wakker kunt worden ondanks lang in bed liggen.",
      "Tussen 03:00 en 05:00 is de slaap normaal het lichtste (REM-fase). Wakker worden in die periode is biologisch logisch, maar als je hoofd dan direct aanspringt is dat bijna altijd een stress-signaal, niet een slaap-probleem. Het is een teken dat je cortisol-piek te vroeg in de nacht is gekomen.",
      "Alcohol is misleidend: het helpt je inslapen maar verstoort de tweede slaaphelft systematisch. Een glas wijn een uur voor bedtijd voelt ontspannend, maar je REM-fase wordt gemiddeld 25 procent korter. Veel mensen koppelen hun slaap-problemen niet aan hun alcohol-patroon omdat de connectie pas in de uren daarna komt.",
    ],
    handvatten: [
      {
        titel: "Donker, koel, koud",
        actie:
          "Slaapkamer onder de 18 graden, volledig donker (verduisteringsgordijnen of slaap-masker), telefoon op vliegtuig-stand of buiten de slaapkamer.",
        waarom:
          "Lichte temperatuur-daling triggert melatonine. Klein blauw lichtje van een lader kan al genoeg zijn om je hormoon-aanmaak te onderbreken.",
      },
      {
        titel: "Cafeïne-grens om 14:00",
        actie:
          "Geen koffie, zwarte thee, energy-drinks of cafeïne-houdende cola na twee uur 's middags.",
        waarom:
          "Cafeïne heeft een halfwaardetijd van zes tot acht uur. Een kop om 16:00 is om 22:00 nog steeds voor de helft actief in je systeem. Je voelt het niet, maar je diepe slaap-fase wel.",
      },
      {
        titel: "Alcohol-grens om 19:00",
        actie:
          "Geen alcohol meer drie uur voor bedtijd, of beter: een paar avonden per week helemaal niet.",
        waarom:
          "Je slaap-kwaliteit herstelt zichtbaar binnen een week alcohol-pauze. Veel mensen merken voor het eerst dat ze echt uitgerust wakker kunnen worden.",
      },
      {
        titel: "Avond-anker zonder scherm",
        actie:
          "Een half uur voor bedtijd geen schermen. Lees iets, schrijf wat op, of doe drie diepe ademhalingen.",
        waarom:
          "Blauw licht en sociale prikkels remmen de melatonine-aanmaak. Een half uur zonder is voor je systeem genoeg om de overgang te maken.",
      },
    ],
    nutrienten: [
      {
        naam: "Magnesium",
        bron: "bladgroente, pitten, peulvruchten, pure chocolade",
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
          "draagt bij aan de regulatie van de hormonale activiteit",
        ],
      },
    ],
  },

  energie: {
    thema: "energie",
    emoji: "⚡",
    titel: "Energie, het verhaal van je mitochondriën en je bloedsuiker",
    intro:
      "Energie is niet één ding. Het is een delicaat samenspel tussen je mitochondriën (de energie-fabriekjes in je cellen), je bloedsuiker-balans en je stress-hormonen.",
    paragrafen: [
      "Een middag-dip begint vaak bij het ontbijt. Een snel-suiker-ontbijt (witte boterham met jam, croissant, suiker-rijke yoghurt, granola) geeft een glucose-piek rond 09:00 en een dal rond 11:00 dat zich de hele dag herhaalt. Eiwit bij het ontbijt (ei, kwark, vis, peulvruchten) houdt je glucose stabieler en geeft de aminozuren die je hersenen nodig hebben voor focus-neurotransmitters zoals dopamine en acetylcholine.",
      "Je mitochondriën verouderen vanaf je 30e en dat versnelt vanaf je 45e. Niet onomkeerbaar, wel merkbaar: hetzelfde leven kost meer energie dan vijftien jaar geleden. Wat je mitochondriën nodig hebben: B-vitaminen (vooral B2, B3, B5), magnesium, ijzer, Co-Q10, omega-3. Veel mensen hebben hier subtiele tekorten die opgeteld een groot verschil maken.",
      "Een wandeling van tien minuten na de lunch helpt je bloedsuiker geleidelijk dalen in plaats van met een piek. Dat alleen scheelt veel mensen al de hele middag-dip. Daglicht + beweging activeert ook je focus-systeem voor de tweede helft van de dag.",
    ],
    handvatten: [
      {
        titel: "Eiwit-ontbijt-anker",
        actie:
          "Bouw je ontbijt rond eiwit (ei, kwark, vis, peulvruchten, eiwit-yoghurt) ipv koolhydraat-piek.",
        waarom:
          "Eiwit houdt je glucose stabiel en levert aminozuren voor neurotransmitters. Veel mensen merken binnen een week stabielere middag-energie.",
      },
      {
        titel: "Wandeling na de lunch",
        actie:
          "Tien minuten lopen direct na de lunch, ook al is het een rondje om het huis.",
        waarom:
          "Bewegende spieren absorberen glucose, je bloedsuiker-piek wordt afgevlakt. Werkt bewezen beter dan koffie tegen de middag-dip.",
      },
      {
        titel: "Daglicht in het eerste uur",
        actie:
          "Binnen het eerste uur na opstaan tien minuten buitenlicht op je gezicht.",
        waarom:
          "Daglicht reset je cortisol-ritme zodat je echte energie 's ochtends piekt en 's avonds natuurlijk daalt. Bewolkt weer geeft nog steeds genoeg licht.",
      },
      {
        titel: "Twee keer kracht per week",
        actie:
          "Twee korte sessies (tien tot twintig minuten) met weerstand, eigen lichaamsgewicht is genoeg.",
        waarom:
          "Spieren zijn metabool actief weefsel. Meer spier = meer rust-verbruik = stabielere energie de hele dag.",
      },
    ],
    nutrienten: [
      {
        naam: "Vitamine B-complex (B2, B3, B5, B12, foliumzuur)",
        bron: "volkoren, eieren, vlees, zuivel, peulvruchten",
        efsaClaims: [
          "B12 en foliumzuur dragen bij aan vermindering van vermoeidheid",
          "B2 draagt bij aan een normaal energieleverend metabolisme",
        ],
      },
      {
        naam: "IJzer",
        bron: "rood vlees, peulvruchten, bladgroente, pitten",
        efsaClaims: [
          "draagt bij aan vermindering van vermoeidheid",
          "draagt bij aan een normaal zuurstoftransport in het lichaam",
        ],
      },
      {
        naam: "Co-Enzym Q10",
        bron: "rood vlees, vette vis, noten, plantaardige oliën",
        efsaClaims: [
          "Lichaamseigen stof die in mitochondriën energie helpt produceren. De natuurlijke aanmaak neemt vanaf de 40e af.",
        ],
      },
    ],
  },

  focus: {
    thema: "focus",
    emoji: "🎯",
    titel: "Focus, geen vaste eigenschap maar een trainbare spier",
    intro:
      "Focus is niet iets dat je hebt of niet hebt. Het is een vaardigheid die afhankelijk is van slaap, voeding, omgeving en gewoonten. Bijna iedereen kan beter focussen dan ze denken, ze hebben gewoon de verkeerde voorwaarden gecreëerd.",
    paragrafen: [
      "Elke onderbroken focus kost gemiddeld twintig minuten om weer op te bouwen. Je hersenen schakelen niet, ze switchen, en dat switchen is kostbaar. Notificaties zijn de grootste focus-rovers van de moderne werkdag. Push-meldingen onthouden zelfs als je 'm niet beantwoordt; je hoofd is al bezig met de vraag wat erin zou kunnen staan.",
      "Constante kleine dopamine-hits (telefoon checken, social media, suiker, snelle wins) stompen je dopamine-systeem geleidelijk af. Je hebt meer prikkel nodig voor hetzelfde effect, en taken die geen direct beloning geven (zoals diep denken) voelen steeds zwaarder. Dit heet 'dopamine-desensibilisatie'.",
      "De 'altijd-aan'-modus is een betrekkelijk recente uitvinding. Onze hersenen zijn niet gemaakt voor twaalf uur kantoor-werk plus avond-scrolling. Echt herstel vraagt dat je hersenen tussen taken DOEL-loos mogen zijn (wandelen zonder podcast, douchen zonder telefoon, even niets doen). Daar gebeurt de creativiteit en het opruim-werk.",
    ],
    handvatten: [
      {
        titel: "Drie focus-blokken per dag",
        actie:
          "Drie blokken van 45-60 minuten diepe focus, telefoon op vliegtuig en buiten bereik. Tussen elk blok tien minuten echte pauze.",
        waarom:
          "Je brein presteert in golven. Drie ononderbroken blokken zijn productiever dan een hele dag fragmenteren met onderbrekingen.",
      },
      {
        titel: "Notificaties uit",
        actie:
          "Alle push-notificaties van apps die niet acuut urgent zijn: helemaal uit. Alleen telefoongesprekken doorlaten.",
        waarom:
          "Notificaties stelen aandacht ook als je er niet op reageert. Je hersenen blijven onbewust bezig met de vraag.",
      },
      {
        titel: "Doelloze pauzes",
        actie:
          "Een paar keer per dag tien minuten niets actiefs doen. Geen telefoon, geen podcast, geen scherm. Wandelen, douchen, kijken naar buiten.",
        waarom:
          "Hier consolideren je hersenen en komen vaak je beste ideeën. Constante input voorkomt dit verwerken.",
      },
      {
        titel: "Eén ding tegelijk",
        actie:
          "Geen multitasking. Eén tab open, één taak, twintig minuten.",
        waarom:
          "Multitasking bestaat biologisch niet, het is snel-switchen. Elke switch kost glucose en focus-reserve.",
      },
    ],
    nutrienten: [
      {
        naam: "Omega-3 (DHA + EPA)",
        bron: "vette vis (zalm, makreel, haring), lijnzaad, walnoot, algenolie",
        efsaClaims: [
          "DHA draagt bij aan een normale werking van de hersenen",
          "EPA en DHA dragen bij aan een normale werking van het hart",
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
      {
        naam: "Zink",
        bron: "vlees, schaaldieren, peulvruchten, pitten",
        efsaClaims: ["draagt bij aan normale cognitieve functies"],
      },
    ],
  },

  leefstijl: {
    thema: "leefstijl",
    emoji: "🏃",
    titel: "Leefstijl, de basis onder alle andere thema's",
    intro:
      "Beweging en alcohol zijn de twee meest onderschatte hefbomen onder energie en focus. Niet als losse adviezen, maar als fundament waar al je andere inspanningen op rusten.",
    paragrafen: [
      "Beweging is geen extra investering, het is een retourpremie. Tien minuten lopen per dag verlaagt je risico op cognitieve achteruitgang merkbaar. Krachttraining twee keer per week is wetenschappelijk de meest onderbouwde investering in je lange-termijn-energie. Spieren zijn ook metabool actief weefsel: meer spier betekent een hoger rust-verbruik en stabielere bloedsuiker.",
      "Alcohol is biologisch een lichte vergif. Je lever moet het eerst onschadelijk maken voordat het iets anders kan doen. Twee glazen wijn betekent dat je lever de hele nacht bezig is met afbraak in plaats van met herstel-werk. Veel mensen die experimenteren met een paar alcohol-vrije weken merken voor het eerst hoe diep slapen kan voelen.",
      "Verbinding is biologisch noodzaak, geen luxe. Mensen die regelmatig oprecht contact hebben (familie, vrienden, collega's) hebben lagere stress-hormoonen en betere immuun-functie. Eén echt gesprek per week heeft meer effect op je herstel dan een dag in een spa.",
    ],
    handvatten: [
      {
        titel: "Tien minuten bewegen per dag",
        actie:
          "Wandelen, fietsen, of iets dat je leuk vindt. Minimum is tien minuten, niet 'als ik tijd heb'.",
        waarom:
          "Onder de tien minuten is het neurologische effect klein. Vanaf tien minuten beginnen je hersenen endorfines aan te maken die uren doorwerken.",
      },
      {
        titel: "Twee alcohol-vrije dagen per week",
        actie:
          "Kies twee vaste dagen waarop je geen alcohol drinkt. Voor de eerste keer probeer een hele week, dat geeft een goed referentiepunt.",
        waarom:
          "Je lever en slaap krijgen rust om het herstel-werk te doen. Veel mensen merken een ander grond-niveau van energie.",
      },
      {
        titel: "Krachttraining twee keer per week",
        actie:
          "Tien tot twintig minuten met weerstand. Eigen lichaamsgewicht, weerstandsband of gewichtjes. Geen sportschool nodig.",
        waarom:
          "Spiermassa is je grootste metabool-actieve weefsel. Behoud betekent stabielere energie en bloedsuiker.",
      },
      {
        titel: "Eén echt gesprek per week",
        actie:
          "Bel of zie iemand die je echt kent. Geen oppervlakkig of professioneel contact, gewoon menselijk.",
        waarom:
          "Verbinding verlaagt je grond-stress en versterkt je immuunsysteem. Tien minuten telefoon is genoeg.",
      },
    ],
    nutrienten: [
      {
        naam: "Vitamine D",
        bron: "daglicht, vette vis, eieren",
        efsaClaims: [
          "draagt bij aan een normale werking van het immuunsysteem",
          "draagt bij aan een normale spierfunctie",
          "draagt bij aan instandhouding van normale botten",
        ],
      },
      {
        naam: "Vitamine C",
        bron: "rauwkost, citrus, paprika, kiwi, bessen",
        efsaClaims: [
          "draagt bij aan vermindering van vermoeidheid",
          "draagt bij aan een normale werking van het zenuwstelsel",
        ],
      },
    ],
  },
};

// ============================================================
// INTERNET-PERSPECTIEF (altijd zichtbaar bovenaan)
// ============================================================

export const INTERNET_PERSPECTIEF = {
  titel: "Voordat we beginnen, een kleine waarschuwing",
  paragrafen: [
    "Je hebt waarschijnlijk al van alles gezocht. Internet staat vol artikelen, ChatGPT geeft je een lange lijst met tips, en social media is vol coaches met snelle oplossingen. Het probleem is meestal niet dat er te weinig informatie is, het is dat er veel te veel is en het meeste daarvan slaat een belangrijke laag over: hoe alles bij JOU samenhangt.",
    "Je slaap is verbonden met je voeding, je voeding met je hormonen, je hormonen met je stress, je stress met je slaap. Eén tip los uit die ketting werkt zelden lang, omdat het probleem ergens anders in de ketting kan zitten dan waar het symptoom verschijnt.",
    "Wat we hier proberen is dat geheel zichtbaar maken voor jouw specifieke situatie. Niet door dezelfde generieke tips te herhalen, maar door op basis van jouw antwoorden te laten zien waar in JOUW ketting de meeste druk zit. En dan vertellen we het verhaal achter die druk, niet alleen de oplossing.",
  ],
};

// ============================================================
// BASIS-LEEFSTIJL-TIPS (altijd zichtbaar, kort)
// ============================================================

export const BASIS_LEEFSTIJL_TIPS = [
  {
    icoon: "🍷",
    titel: "Alcohol: niet binnen drie uur voor bedtijd",
    uitleg: "Verstoort de REM-fase merkbaar, ook één glas.",
  },
  {
    icoon: "☕",
    titel: "Cafeïne: niet meer na 14:00",
    uitleg: "Halfwaardetijd 6-8 uur, je voelt het niet maar je diepe slaap wel.",
  },
  {
    icoon: "🥚",
    titel: "Eiwit bij elke maaltijd",
    uitleg: "Stabiele bloedsuiker en bouwstoffen voor neurotransmitters.",
  },
  {
    icoon: "☀️",
    titel: "Daglicht in het eerste uur",
    uitleg: "Reset je biologische klok, ook bij bewolkt weer.",
  },
  {
    icoon: "🌬️",
    titel: "Drie keer per dag bewust ademen",
    uitleg: "Vier in, zes uit. Twee minuten is genoeg om je zenuwstelsel om te zetten.",
  },
  {
    icoon: "🚶",
    titel: "Minimum tien minuten bewegen",
    uitleg: "Onder de tien minuten is het neurologisch effect klein.",
  },
  {
    icoon: "💞",
    titel: "Eén echt gesprek per week",
    uitleg: "Verbinding verlaagt je stress-grondniveau meer dan een dag spa.",
  },
];
