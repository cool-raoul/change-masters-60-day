// ============================================================
// De Resetcode als klant-reis. TWEE losse programma's (feedback
// Raoul 10 juli): Darmen in Balans en de Holistic Reset. De
// klant kiest aan het begin wat hij of zij doet; combinaties
// (eerst darm, dan reset; of reset en daarna basisproducten)
// lopen via het vervolg-gesprek met de begeleider, niet via een
// vaste zes-stappen-lijn.
//
// Dit is de ENE bron voor wat de klant per fase ziet én voor
// wat de klant-Mentor mag weten.
//
// Bron: docs/resetcode/ (Boardslink-materiaal, verbatim) plus
// de acht door Raoul goedgekeurde protocol-adviezen
// (docs/resetcode/17). Alles claim-vrij: wat je doet en eet,
// nooit wat producten medisch doen. Medicijn-vragen horen NIET
// in deze omgeving: die intake is al vóór de bestelling geweest
// (Raoul 10 juli).
//
// Fase 4-correctie van Raoul verwerkt: koolhydraten naar trek
// binnen 80/20, NIET elke dag één testen. In fase 2 van de 3.0
// tellen we GEEN calorieën.
// ============================================================

export type ResetStation = {
  slug: string;
  nummer: number;
  naam: string;
  emoji: string;
  duur: string;
  kern: string;
  welkom: string;
  vandaagBelangrijk: string[];
  welLijst: string[];
  nietLijst: string[];
  tips: string[];
  veelgesteld: { vraag: string; antwoord: string }[];
  contactMoment: string | null;
  documenten: { titel: string; omschrijving: string }[];
  videoSlots: string[];
  /** In-app graphic die een document vervangt (eerste proef: de LOGI-piramide). */
  graphic?: "logi-piramide";
};

export type ResetProgramma = {
  slug: "darm" | "reset" | "producten";
  naam: string;
  emoji: string;
  /** Korte payoff op de keuze-kaart. */
  payoff: string;
  duur: string;
  /** Kleuren voor de klant-look (inline styles, dus hex). */
  kleur: { hoofd: string; zacht: string; diep: string };
  /** Wat er ná dit programma kan; voedt de vervolg-kaart en de Mentor. */
  vervolg: string;
  stations: ResetStation[];
};

// ---------- Darmen in Balans ----------

const DARM_STATIONS: ResetStation[] = [
  {
    slug: "start",
    nummer: 1,
    naam: "Jouw start",
    emoji: "🌱",
    duur: "tot je pakket binnen is",
    kern: "Alles klaarzetten zodat je rustig en goed kunt beginnen.",
    welkom:
      "Welkom! Wat fijn dat je begint met Darmen in Balans. Je hoeft niks te kunnen of te weten, alles staat hier stap voor stap klaar. Deze eerste dagen gebruik je om je voor te bereiden, dan wordt de rest zoveel makkelijker.",
    vandaagBelangrijk: [
      "Bewaar deze pagina, hier kun je altijd naar terug.",
      "Laat je begeleider even weten wanneer je bestelling binnen is en wanneer je wilt beginnen.",
      "Maak foto's van jezelf: voorkant, zijkant, achterkant en je gezicht. Rustige achtergrond, van hoofd tot voeten. Je maakt ze voor jezelf, straks ben je blij dat je ze hebt.",
      "Meet en noteer: gewicht, taille, heup en borst.",
      "Schrijf voor jezelf op waarom je dit doet en wat je graag anders wilt. Dat lijstje wordt later goud waard.",
    ],
    welLijst: [],
    nietLijst: [],
    tips: [
      "Haal alvast in huis: Keltisch zeezout, Herbamare kruidenzout, sojasaus zonder suiker (Kikkoman met rode of blauwe dop) en eventueel erythritol uit de natuurwinkel.",
      "Word lid van de support-groep op Facebook. Duizenden mensen doen dit programma, je staat er niet alleen voor. De zoekbalk in de groep is je vriend.",
      "Plan alvast een contactmoment met je begeleider rond het einde van je 16 dagen.",
    ],
    veelgesteld: [
      {
        vraag: "Moet ik die foto's echt maken?",
        antwoord:
          "Niemand vindt het leuk, bijna iedereen heeft spijt als ze het niet deden. Je ziet jezelf elke dag, dus veranderingen vallen je zelf het minst op. De foto's laat je aan niemand zien, ze zijn voor jou.",
      },
      {
        vraag: "Wanneer begin ik?",
        antwoord:
          "Zodra je pakket binnen is en je boodschappen in huis zijn. Kies een startdag die jou rust geeft en geef 'm even door aan je begeleider.",
      },
    ],
    contactMoment:
      "Laat je begeleider weten wanneer je pakket binnen is en welke dag je start.",
    documenten: [
      {
        titel: "Darmen in Balans programmaboekje + innameschema",
        omschrijving: "Het rode en blauwe schema, met uitleg per product.",
      },
      {
        titel: "Benodigdheden en boodschappenlijstje",
        omschrijving: "Alles wat je in huis wilt hebben voor je begint.",
      },
    ],
    videoSlots: ["Welkom bij Darmen in Balans (introductie)"],
  },
  {
    slug: "zestien-dagen",
    nummer: 2,
    naam: "De 16 dagen",
    emoji: "🔄",
    duur: "16 dagen (daarna maak je je producten rustig op)",
    kern: "Zestien dagen puur eten volgens jouw schema, met alles op één plek.",
    welkom:
      "Daar ga je! De komende 16 dagen volg je het schema uit je programmaboekje en eet je van de voedingslijst. Het is echt goed te doen: je mag veel, je hebt geen honger en er is een heel receptenboekje om uit te kiezen. Gooi er gerust je eigen sausje overheen, als de ingrediënten maar van de lijst komen.",
    vandaagBelangrijk: [
      "Volg het innameschema uit je boekje: het rode schema bij het basispakket (5 producten), het blauwe schema bij het plus-pakket (8 producten). Daar staat per moment van de dag precies wat je neemt.",
      "Eet van de voedingslijst. Geen hoeveelheden-regels, wel: check bij verpakte producten altijd de ingrediëntenlijst (niet de voedingswaarde) op suikers en E-nummers.",
      "Kijk rond dag 10 de dag 10-video, dat is vaak een kantelpunt.",
      "Na dag 16 maak je je producten rustig op: deel de inhoud van elk potje door 30, dan weet je je dagdosering.",
    ],
    welLijst: [
      "Alle groenten behalve nachtschade, ook zuurkool en gefermenteerde groenten",
      "Fruit, zaden en pitten",
      "Boekweit, kokosmeel en amandelmeel (boekweit is een zaadje, geen graan)",
      "Gezonde vetten, van avocado tot olijfolie",
      "Vis, vlees (onbewerkt), eieren, kruiden en specerijen",
      "Plantaardige zuivel zoals kokosyoghurt en amandelyoghurt",
      "Ongebrande noten",
      "Erythritol als je zoetbehoefte hebt",
    ],
    nietLijst: [
      "Brood, pasta en andere snelle koolhydraten, gluten",
      "Suikers en E-nummers (check het etiket)",
      "Bewerkt vlees, bakwaren, tussendoortjes, junkfood",
      "Zuivel (plantaardig mag wel)",
      "Geraffineerde oliën en kunstmatige zoetstoffen",
      "Nachtschade: paprika, aubergine, tomaat",
      "Peulvruchten zoals erwten en linzen",
    ],
    tips: [
      "Neem dagelijks een paar mespuntjes Keltisch zeezout, gewoon los of onder je tong.",
      "Doe minimaal twee keer per week een voetenbadje met een paar eetlepels Keltisch zeezout in warm water.",
      "Plan genoeg rust in, je lichaam is aan het werk en dat mag je voelen.",
      "Boekweit-producten zijn je vriend: pannenkoekjes van boekweitmeel, 100% boekweitpasta, boekweitcrackers.",
      "Ging er per ongeluk iets verkeerds in? Geen paniek en niks mislukt: draad oppakken en gewoon door.",
    ],
    veelgesteld: [
      {
        vraag: "Ik merk hoofdpijn of een andere stoelgang, is dat normaal?",
        antwoord:
          "Dat kan in de eerste dagen gebeuren en is bij iedereen anders, veel mensen merken niks. In je programmamateriaal staat wat dan helpt: extra water drinken, extra Keltisch zeezout en eventueel je MSM verhogen volgens het boekje. Houdt het aan of vertrouw je het niet, bespreek het dan even met je begeleider.",
      },
      {
        vraag: "Wat eet ik als tussendoortje?",
        antwoord:
          "Ongebrande noten, fruit, groente of iets uit het receptenboekje. Kijk ook in de Facebook-groep, daar delen mensen dagelijks ideeën. Typ in de zoekbalk bijvoorbeeld 'tussendoortje' of 'recept'.",
      },
      {
        vraag: "Wat doe ik na de 16 dagen?",
        antwoord:
          "Je maakt eerst je producten op (per potje: inhoud delen door 30 is je dagdosering). En je plant een momentje met je begeleider om samen te kijken wat bij jou past als vervolg: de Holistic Reset of de basisproducten. Dat gesprek is echt de moeite waard.",
      },
    ],
    contactMoment:
      "Rond het einde van de 16 dagen: plan een momentje met je begeleider over jouw vervolgstap.",
    documenten: [
      {
        titel: "Darmen in Balans programmaboekje + innameschema",
        omschrijving: "Het rode en blauwe schema, met uitleg per product.",
      },
      {
        titel: "Voedingslijst",
        omschrijving: "Wat je wel en even niet eet, uitgebreid per categorie.",
      },
      {
        titel: "Receptenboekje",
        omschrijving: "Heerlijke recepten om te variëren.",
      },
    ],
    videoSlots: [
      "Opstart-video Darmen in Balans (deel 1)",
      "Tips & tricks bij het darmprogramma",
      "Dag 10-video (kijk deze rond dag 10)",
    ],
  },
];

// ---------- Holistic Reset ----------

const RESET_STATIONS_INTERN: ResetStation[] = [
  {
    slug: "voorbereiding",
    nummer: 1,
    naam: "Jouw voorbereiding",
    emoji: "📸",
    duur: "tot je pakket binnen is",
    kern: "Startpunt vastleggen en alles in huis halen.",
    welkom:
      "Welkom bij de Holistic Reset: een fysieke, mentale en emotionele reset. Gefeliciteerd met je keuze om te starten, het is bijzonder dat je jezelf de komende tijd op de eerste plaats zet. Dit is geen dieet en geen snelle oplossing: je geeft je lichaam de kans om weer te gaan werken zoals het bedoeld is. Alles staat hier voor je klaar, je hoeft zelf niets uit te zoeken. Begin met je startpunt vastleggen (kost een half uurtje, en je hebt er de hele reis plezier van) en stel jezelf de twee vragen uit de video: wil ik een optimale gezondheid, en ben ik bereid mijn leefstijl te veranderen? Zeg je daar ja op, tegen jezelf, dan ben je er klaar voor.",
    vandaagBelangrijk: [
      "Maak foto's: voorkant, zijkant, achterkant en je gezicht. Rustige achtergrond, hele lichaam. Voor jezelf, niet voor anderen.",
      "Meet en noteer: gewicht, taille, heup en borst.",
      "Schrijf je startpunt op: wat wil je graag anders, en hoe voelt het nu? Hoe concreter, hoe leuker het teruglezen straks wordt.",
      "Zet de FatSecret-app op je telefoon, die gebruik je bij de laaddagen om je calorieën te tellen (alleen dan!).",
      "Bewaar deze pagina en laat je begeleider weten wanneer je pakket binnen is en wanneer je start.",
    ],
    welLijst: [],
    nietLijst: [],
    tips: [
      "Haal alvast in huis: Keltisch zeezout, Herbamare kruidenzout, sojasaus zonder suiker (Kikkoman met rode of blauwe dop) en eventueel erythritol uit de natuurwinkel.",
      "Word lid van de support-groep op Facebook: zo'n tienduizend mensen die dit ook doen of deden. De zoekbalk daar beantwoordt bijna elke vraag.",
      "Kijk de startvideo en het resetboekje rustig door, dan weet je precies wat er komt.",
    ],
    veelgesteld: [
      {
        vraag: "Moet ik die foto's echt maken?",
        antwoord:
          "Ja, doe het echt even. Je mind gaat je straks voor de gek houden ('ik zie geen verschil'), en de foto's laten zien wat er wél gebeurd is. Je deelt ze met niemand, ze zijn van jou.",
      },
      {
        vraag: "Hoe lang duurt het hele programma?",
        antwoord:
          "Twee laaddagen, dan 21 dagen (verlengbaar tot 40), dan 21 dagen stabiliseren en 21 dagen Logisch Leven. Daarna houd je je eigen ritme aan tot en met maand 6. Je doet het fase voor fase, hier zie je steeds alleen de fase waar je bent.",
      },
    ],
    contactMoment:
      "Laat je begeleider weten wanneer je pakket binnen is en welke dag je start.",
    documenten: [
      {
        titel: "Resetboekje (3.0)",
        omschrijving: "Je complete gids voor alle vier de fases.",
      },
      {
        titel: "Benodigdheden en boodschappenlijstje",
        omschrijving: "Alles wat je in huis wilt hebben.",
      },
      {
        titel: "Meet- en weegschema",
        omschrijving: "Om je metingen bij te houden.",
      },
    ],
    videoSlots: ["Startvideo: de twee belangrijke vragen"],
  },
  {
    slug: "laaddagen",
    nummer: 2,
    naam: "Fase 1 · De laaddagen",
    emoji: "😋",
    duur: "2 dagen",
    kern: "Twee dagen flink en vooral gezond-vet eten: 3500 tot 5000 kcal per dag.",
    welkom:
      "Je begint met twee laaddagen. Klinkt gek, is bewust: zo zet je de omschakeling van fase 2 goed in gang. Dit hoort er echt bij, dus doe het serieus én met een knipoog. Je mag los!",
    vandaagBelangrijk: [
      "Eet twee dagen lang minimaal 3500 tot 5000 kcal per dag.",
      "Laad vooral met gezonde vetten: macadamia's, cashews, avocado, banaan, kokosroom, gebakken ei met kaas.",
      "Houd suiker en snelle koolhydraten juist laag tijdens het laden.",
      "Tel je calorieën met de FatSecret-app, dan weet je zeker dat je genoeg zit.",
    ],
    welLijst: [
      "Gezonde vetten: noten, avocado, kokosproducten, eieren, kaas",
      "Alles uit het laadtips-document",
    ],
    nietLijst: ["Veel suiker en snelle koolhydraten (die helpen je nu niet)"],
    tips: [
      "Begin vroeg op de dag met eten, dan haal je je aantal aan het einde van de dag makkelijk.",
      "Druk dagje? Stop een zakje noten in je tas of jaszak, dan kun je overal blijven eten.",
      "Lees het laadtips-document even door, dan weet je precies wat je opties zijn.",
      "Plan je laaddagen zo dat fase 2 niet precies tijdens je menstruatie start; net erna beginnen geeft het rustigste begin.",
    ],
    veelgesteld: [
      {
        vraag: "Waarom moet ik eerst laden?",
        antwoord:
          "De laaddagen zijn het startschot van het programma: ze zetten de omschakeling in gang waar fase 2 op verder bouwt en vormen je ijkpunt. Hoe beter je laadt, hoe soepeler de rest van je reset loopt. Dat is de ervaring van heel veel deelnemers voor je.",
      },
      {
        vraag: "Ik krijg die hoeveelheid bijna niet op, wat nu?",
        antwoord:
          "Je bent niet de enige! Begin vroeg, kies caloriedichte dingen (noten zijn je beste vriend) en verdeel het over de hele dag. Met de FatSecret-app zie je precies waar je staat.",
      },
    ],
    contactMoment: "Laat je begeleider even weten dat je gestart bent met de reset.",
    documenten: [
      {
        titel: "Laadtips",
        omschrijving: "Gezonde laad-ideeën, inclusief top-10 vetten.",
      },
    ],
    videoSlots: ["Fase 1-video: de laaddagen"],
  },
  {
    slug: "omschakeling",
    nummer: 3,
    naam: "Fase 2 · De omschakeling",
    emoji: "🔥",
    duur: "21 dagen (mag verlengd tot maximaal 40)",
    kern: "Puur en onbewerkt eten van de fase 2-lijst, zonder koolhydraten, suikers en vetten.",
    welkom:
      "Dit is de kern van je reset. Eenentwintig dagen super clean eten van de fase 2-lijst uit je boekje. Het is even wennen en daarna verrassend goed te doen, zeker met de recepten en de support-groep erbij. En onthoud: het zijn maar drie weken op je hele leven.",
    vandaagBelangrijk: [
      "Eet alleen wat op de fase 2-lijst in je boekje staat. Groente en fruit van de lijst mag ongelimiteerd, ook als tussendoortje. Calorieën tellen doen we in deze fase niet: de lijst is de regel.",
      "Geen koolhydraten (pasta, rijst, aardappelen, brood), geen suikers (ook geen honing of kokosbloesem), geen vetten in je eten.",
      "Ook geen vette verzorging op je huid: kies vetvrije make-up, een shampoo-bar en zeep-bar. De MSM-lotion mag wel.",
      "Neem elke dag één Wasa-cracker of twee grisini's, zoals in je boekje staat.",
      "Drink minimaal anderhalve liter water per dag.",
    ],
    welLijst: [
      "Alles op de fase 2-lijst in je boekje (dat is de enige lijst die nu telt)",
      "Groente en fruit van de lijst, zoveel je wilt",
      "Vlees en vis van de lijst, vetvrij bereid",
    ],
    nietLijst: [
      "Koolhydraten: brood, pasta, rijst, aardappelen",
      "Alle suikers, ook honing en kokosbloesemsuiker",
      "Vetten en oliën, ook in verzorging op de huid",
      "Alcohol",
      "Alles wat niet op de fase 2-lijst staat",
    ],
    tips: [
      "Vetvrij bakken kan prima: fruit ui en knoflook in een laagje water of tomatensap, gebruik een goede antiaanbakpan of de oven. Let op, het gaat sneller dan normaal, dus blijf erbij.",
      "Salade van sla, komkommer en tomaat is vooral water. Voeg zwaardere groente toe zoals broccoli, spinazie of gekookte groente, dan is je maaltijd compleet.",
      "Staat de weegschaal stil of ga je zelfs iets omhoog? Dat is vaak vocht en hoort bij het ritme van je lichaam (het woosh-effect uit je materiaal). Gewoon doorgaan, niet schrikken.",
      "Pas als je vier dagen of langer helemaal stilstaat spreek je van een plateau. Dan kan een appeldag helpen: één dag alleen zes Granny Smith-appels naast je producten, precies zoals in je boekje. Eerder ingrijpen hoeft niet.",
      "Rond je menstruatie kan de weegschaal stilstaan of ietsje stijgen door vocht. Hoort erbij en trekt vanzelf weg.",
      "Meer trek in zoet? Yogi Classic-thee smaakt zoet zonder suiker, en een appeltje uit de pan met kaneel is een feestje.",
      "Merk je dat je moe bent? Geef eraan toe en ga lekker eerder naar bed. Rust helpt dit proces enorm.",
      "Even doorbijten bij een craving hoort erbij: het zijn gedachten die voorbij trekken. Praat tegen je mind, drie weken op een heel leven.",
    ],
    veelgesteld: [
      {
        vraag: "Ik heb hoofdpijn, wat kan ik doen?",
        antwoord:
          "Dat komt vooral in de eerste dagen voor en trekt meestal weg. In je programmamateriaal staat: drink extra water, neem extra Keltisch zeezout en je mag je MSM verhogen volgens het boekje. Blijft het aanhouden, bespreek het dan even met je begeleider.",
      },
      {
        vraag: "Ik heb gecheat, is alles nu verpest?",
        antwoord:
          "Nee, er is niks verpest, en je bent ook niet de eerste. De afspraak uit het programma: verleng deze fase met drie dagen en pak de draad gewoon weer op. En wees lief voor jezelf, dit hoort bij mensen.",
      },
      {
        vraag: "Mag ik echt geen dagcrème of olie op mijn huid?",
        antwoord:
          "In fase 2 kies je vetvrije verzorging, dat hoort bij deze fase. De MSM-lotion mag wel en ruikt heerlijk. Vetvrije make-up is online goed te vinden. Na fase 2 mag alles weer.",
      },
      {
        vraag: "Ik heb bijna geen honger, moet ik toch eten?",
        antwoord:
          "Ja, eet in ieder geval de minimale hoeveelheden uit je boekje. Je lichaam heeft die voeding nodig om goed te kunnen werken, ook als je weinig trek hebt.",
      },
      {
        vraag: "Mag ik koffie of thee?",
        antwoord:
          "Ja hoor, koffie en thee mogen gewoon, zonder suiker en zonder gewone melk. Water blijft je basis: minimaal anderhalve liter per dag.",
      },
      {
        vraag: "Ik word ziek of heb een bruiloft midden in fase 2, wat nu?",
        antwoord:
          "Dat kan gebeuren en daar is een nette route voor: bewust pauzeren, en daarna bewust weer opstarten en je fase iets verlengen. Half doorgaan werkt niet. Overleg even met je begeleider hoe jullie het voor jouw situatie aanpakken.",
      },
    ],
    contactMoment:
      "Plan vóór het einde van fase 2 een momentje met je begeleider om fase 3 samen door te nemen.",
    documenten: [
      {
        titel: "Fase 2-voedingslijst",
        omschrijving: "De enige lijst die deze weken telt.",
      },
      {
        titel: "Recepten fase 2",
        omschrijving: "Ook vegetarisch en vegan beschikbaar.",
      },
      {
        titel: "Meest gestelde vragen tijdens de reset",
        omschrijving: "Antwoorden op alles wat deelnemers vóór jou vroegen.",
      },
    ],
    videoSlots: ["Fase 2-video: de omschakeling"],
  },
  {
    slug: "stabilisatie",
    nummer: 4,
    naam: "Fase 3 · De stabilisatie",
    emoji: "⚖️",
    duur: "21 dagen",
    kern: "Vetten rustig terugbrengen en je nieuwe balans laten wennen.",
    welkom:
      "Fase 2 is gelukt, echt knap van je! In fase 3 mag er weer meer. Je voegt vetten stap voor stap toe en geeft je lichaam drie weken de tijd om te wennen aan waar je nu staat. Deze fase draait niet om verder omlaag, maar om stevig staan.",
    vandaagBelangrijk: [
      "Voeg vetten langzaam toe: één nieuw dingetje per dag. Dag één je eitje in boter, dag twee een stukje kaas door de salade, en zo verder.",
      "Alle groente en fruit mag weer, ook wortel, en alle soorten vlees en vis. Zuivel mag ook weer.",
      "Nog steeds geen suikers en geen snelle koolhydraten.",
      "Brood van haverzemelen mag, maximaal drie dagen per week en het liefst om de dag. Week de haverzemelen even, zoals in het document staat.",
      "Weeg jezelf elke ochtend. Je eindgewicht van fase 2 is je ankerpunt: daar mag je ongeveer een kilo omheen bewegen.",
      "Kom je meer dan een kilo boven je ankerpunt? Corrigeer dan binnen 48 uur met een correctie-dag: overdag alleen drinken, en 's avonds één grote biefstuk met een appel of een tomaat. Eet je geen vlees, vraag dan je begeleider naar de variant.",
    ],
    welLijst: [
      "Gezonde vetten, rustig opgebouwd: boter, olie, kaas, noten",
      "Alle groente en alle fruit",
      "Alle vlees en vis, eieren, zuivel",
      "Haverzemelen-brood (max drie dagen per week, geweekt)",
    ],
    nietLijst: [
      "Suikers, ook verstopte (blijf etiketten lezen)",
      "Snelle koolhydraten: brood, pasta, rijst, aardappelen",
    ],
    tips: [
      "Niet alles tegelijk toevoegen: rustig opbouwen is precies waar deze fase voor is.",
      "Mensen om je heen gaan misschien iets aan je merken. Vind je het leuk om daar iets over te vertellen? Loop dan even langs je begeleider, die helpt je hoe je dat handig doet.",
    ],
    veelgesteld: [
      {
        vraag: "Mag ik nu weer gewoon uit eten?",
        antwoord:
          "Dat kan steeds beter. Kies iets zonder suiker en snelle koolhydraten (denk aan vis of vlees met groente) en je zit goed. Twijfel je over een gerecht, vraag het gerust aan je begeleider of in de support-groep.",
      },
      {
        vraag: "Hoe zit het precies met haverzemelen?",
        antwoord:
          "Haverzemelen-brood mag in fase 3, maximaal drie dagen per week en bij voorkeur om de dag. Even weken voor je het gebruikt. In het haverzemelen-document staat de uitleg en staan recepten.",
      },
      {
        vraag: "Ik ben toch aangekomen deze week, wat nu?",
        antwoord:
          "Daar is deze fase juist voor: bijsturen terwijl je lichaam went. Zit je meer dan een kilo boven je ankerpunt (je eindgewicht van fase 2), doe dan binnen 48 uur een correctie-dag: overdag alleen drinken, 's avonds één grote biefstuk met een appel of een tomaat. Daarna pak je het gewone fase 3-ritme weer op. Lukt het corrigeren niet of eet je geen vlees, schakel dan even met je begeleider.",
      },
    ],
    contactMoment: null,
    documenten: [
      {
        titel: "Recepten fase 3",
        omschrijving: "Het grote receptenboek van de community.",
      },
      {
        titel: "Haverzemelen: uitleg en recepten",
        omschrijving: "Hoe je ze weekt en wat je ermee maakt.",
      },
    ],
    videoSlots: ["Fase 3-video: de stabilisatie"],
  },
  {
    slug: "logisch-leven",
    nummer: 5,
    naam: "Fase 4 · Logisch Leven",
    emoji: "🌳",
    duur: "21 dagen, en daarna je ritme tot en met maand 6",
    kern: "Koolhydraten terug naar trek, binnen de 80/20-regel, met je lichaam als kompas.",
    welkom:
      "De belangrijkste fase van allemaal, want dit is de fase die blijft. Je gaat ontdekken welke koolhydraten bij jou passen en je maakt van alles wat je geleerd hebt een leefstijl. Niet streng, wel bewust: tachtig procent logisch, twintig procent lekker leven.",
    vandaagBelangrijk: [
      "Voeg koolhydraten toe waar je trek in hebt, binnen de 80/20-regel. Geen trek in koolhydraten? Ook helemaal prima.",
      "Gebruik de weegschaal en je gevoel als feedback: merk je dat iets niet lekker valt of aantikt, doe het dan wat minder vaak of plan er een actieve dag omheen.",
      "Eet volgens de LOGI-piramide: vaak groente en fruit, regelmatig vis, vlees, eieren en zuivel, met mate granen, zelden zoet en fastfood.",
      "Beweeg elke dag een beetje meer: pak de trap, loop naar de winkel, twintig minuten wandelen doet al veel.",
    ],
    welLijst: [
      "Vaak: groente en fruit",
      "Regelmatig: vis, vlees, eieren, zuivel",
      "Met mate: granen en volkoren producten",
      "Zelden: zoet, gebak en fastfood (dat is je 20 procent)",
    ],
    nietLijst: [],
    tips: [
      "Uitglijden hoort bij mensen en bij deze fase. Niks aan de hand: volgende maaltijd gewoon weer logisch.",
      "Zakken door je hurken als je iets van de grond pakt, vaker de trap, een blokje om: kleine dingen die optellen.",
      "Plan bewust je ontspanning. Slaap en rust zijn net zo goed onderdeel van je leefstijl als eten.",
      "Loop aan het einde van deze fase je foto's en metingen van het begin nog eens na. Neem er even de tijd voor.",
    ],
    veelgesteld: [
      {
        vraag: "Moet ik elke dag een nieuw koolhydraat testen?",
        antwoord:
          "Nee. Je voegt toe waar je trek in hebt en houdt je aan de 80/20-regel. Heb je ergens geen behoefte aan, dan hoef je het ook niet te proberen. Je lichaam is je kompas, niet een schema.",
      },
      {
        vraag: "Kan ik de reset later nog een keer doen?",
        antwoord:
          "Zeker, veel mensen maken er een jaarlijks terugkeer-moment van, als eigen APK. Houd na een afgeronde reset wel minimaal zes weken je gewone, stabiele ritme aan voordat je opnieuw start, en plan een nieuwe ronde altijd even samen met je begeleider.",
      },
      {
        vraag: "Wat doe ik na deze 21 dagen?",
        antwoord:
          "Dan begint het mooiste deel: je nieuwe ritme vasthouden, tot en met maand 6 en daarna. Plan het vervolg-gesprek met je begeleider, dan kijken jullie samen wat bij jou past qua basis-onderhoud en wat een goed vervolg is.",
      },
      {
        vraag: "Iemand in mijn omgeving wil dit ook, wat nu?",
        antwoord:
          "Wat leuk! Verwijs diegene even naar je begeleider, die zorgt dat hij of zij dezelfde goede begeleiding en informatie krijgt als jij. En vraag je begeleider gerust wat de mogelijkheden voor jou zijn als je vaker mensen op weg helpt.",
      },
    ],
    contactMoment:
      "Aan het einde van fase 4: plan het vervolg-gesprek met je begeleider over jouw ritme na het programma.",
    documenten: [
      {
        titel: "Vijf leefstijl-tips",
        omschrijving: "De basis om vast te houden wat je hebt opgebouwd.",
      },
    ],
    videoSlots: ["Fase 4-video: Logisch Leven"],
    graphic: "logi-piramide",
  },
];

// ---------- Dagelijkse basis (gewoon producten gebruiken) ----------
// Derde spoor (Raoul 10 juli): klanten die geen kuur doen maar de
// producten dagelijks gebruiken. Tijdlijn volgt de pulse-momenten
// (dag 0/5/14/28/56) inclusief de groei-lijn van productgebruiker
// naar webshophouder.

const PRODUCTEN_STATIONS: ResetStation[] = [
  {
    slug: "start",
    nummer: 1,
    naam: "Jouw start",
    emoji: "📦",
    duur: "de eerste dagen",
    kern: "Rustig beginnen en je producten leren kennen.",
    welkom:
      "Welkom! Jij gaat aan de slag met je dagelijkse producten. Geen fases, geen regels-lijstjes: gewoon een goed ritme opbouwen. Ik ken elk product en help je met alles eromheen.",
    vandaagBelangrijk: [
      "Bewaar deze pagina en laat je begeleider even weten wanneer je pakket binnen is.",
      "Begin rustig: bouw de eerste dagen op naar de dosering op de verpakking, dan kan je lichaam wennen.",
      "Koppel je producten aan een vast moment, bijvoorbeeld bij je ontbijt. Vaste momenten maken het makkelijk om vol te houden.",
      "Geef het de tijd: de basis is bedoeld als dagelijkse routine voor minimaal 6 tot 12 maanden, zoals in het materiaal staat.",
    ],
    welLijst: [],
    nietLijst: [],
    tips: [
      "Valt een product zwaar (bijvoorbeeld de Daily BioBasics)? Verlaag de dosering even en bouw rustig weer op.",
      "De Daily BioBasics kun je heerlijk maken: koud water, even goed schudden, of verwerk 'm in een smoothie. Er is een heel shake-receptenboekje.",
      "Drink er lekker een groot glas water bij, dat maakt het compleet.",
    ],
    veelgesteld: [
      {
        vraag: "Hoe lang doe ik met een pot?",
        antwoord:
          "Vuistregel uit het materiaal: deel de inhoud van de pot door 30, dan weet je je dagdosering en gaat elke pot ongeveer een maand mee.",
      },
      {
        vraag: "Moet ik alles tegelijk innemen?",
        antwoord:
          "Dat hoeft niet. Verdeel het gerust over de dag, bijvoorbeeld ochtend en avond. Kies wat jij vol kunt houden, dat is belangrijker dan het perfecte moment.",
      },
    ],
    contactMoment:
      "Laat je begeleider weten wanneer je pakket binnen is en hoe de eerste dagen voelen.",
    documenten: [
      {
        titel: "Uitleg per product",
        omschrijving: "Wat elk product is en hoe je het gebruikt.",
      },
      {
        titel: "Shake- en smoothie-recepten",
        omschrijving: "Om je Daily BioBasics lekker te maken.",
      },
    ],
    videoSlots: [],
  },
  {
    slug: "eerste-weken",
    nummer: 2,
    naam: "De eerste weken",
    emoji: "🌱",
    duur: "week 1 en 2",
    kern: "Je ritme wordt gewoonte.",
    welkom:
      "Je bent begonnen, mooi! De eerste weken draaien om één ding: je ritme vasthouden. Wat je merkt verschilt per persoon en per moment, dus vergelijk jezelf vooral niet met anderen.",
    vandaagBelangrijk: [
      "Houd je vaste momenten aan, ook op drukke dagen. Halve routine is beter dan geen routine.",
      "Merk je iets op (goed of onwennig)? Schrijf het even op, dat is goud voor je gesprek met je begeleider.",
    ],
    welLijst: [],
    nietLijst: [],
    tips: [
      "Zet je producten op een plek waar je ze ziet, naast de waterkoker doet wonderen.",
      "Neem je producten mee in een klein doosje als je weg bent, dan sla je geen dag over.",
    ],
    veelgesteld: [
      {
        vraag: "Ik vergeet het steeds, heb je een trucje?",
        antwoord:
          "Plak je routine aan iets wat je al doet: eerst koffie zetten, dan producten. En zet ze in het zicht. Na een week of drie hoef je er niet meer over na te denken.",
      },
      {
        vraag: "Ik merk nog niks, klopt dat wel?",
        antwoord:
          "Dat kan helemaal, ieder lichaam heeft z'n eigen tempo en het materiaal rekent met maanden, niet met dagen. Houd je ritme vast en bespreek het gerust even met je begeleider bij jullie contactmoment.",
      },
    ],
    contactMoment:
      "Rond twee weken: deel je eerste ervaringen even met je begeleider.",
    documenten: [],
    videoSlots: [],
  },
  {
    slug: "ritme",
    nummer: 3,
    naam: "Jouw ritme",
    emoji: "⏰",
    duur: "week 3 tot 8",
    kern: "Terugkijken, vieren en delen.",
    welkom:
      "Drie weken vol, dat is een echte mijlpaal! Dit is een mooi moment om even terug te kijken: hoe voelde je je toen je begon, en hoe is dat nu?",
    vandaagBelangrijk: [
      "Kijk je aantekeningen of foto's van het begin nog eens terug. Kleine verschillen tellen ook.",
      "Ken je iemand die ook wel wat aan deze producten zou kunnen hebben? Zeg het even tegen je begeleider, die helpt diegene op dezelfde goede manier op weg als jij.",
    ],
    welLijst: [],
    nietLijst: [],
    tips: [
      "Veel mensen plannen één keer per jaar een opfris-moment, bijvoorbeeld met het darmprogramma als eigen APK. Iets om te onthouden voor later.",
      "Deel je ervaring gerust in je eigen woorden. Jouw verhaal kan voor iemand anders het zetje zijn.",
    ],
    veelgesteld: [
      {
        vraag: "Kan ik nog iets toevoegen aan mijn routine?",
        antwoord:
          "Dat kan zeker, van een darmprogramma tot gerichte aanvullingen. Wat past hangt af van jouw doelen; neem het mee in het gesprek met je begeleider, dan kijk ik daarna weer met je mee.",
      },
    ],
    contactMoment:
      "Rond drie weken: plan een momentje met je begeleider om terug te blikken en vooruit te kijken.",
    documenten: [],
    videoSlots: [],
  },
  {
    slug: "groeien",
    nummer: 4,
    naam: "Groeien",
    emoji: "🚀",
    duur: "vanaf maand 2",
    kern: "Je routine staat; nu kan er meer, als jij dat wilt.",
    welkom:
      "Je routine staat als een huis. Vanaf hier is alles optioneel en alles mogelijk: gewoon lekker doorgaan, of er iets meer van maken. Allebei helemaal goed.",
    vandaagBelangrijk: [
      "Check even of je maandelijkse bestelling goed staat, dan hoef je er niet meer over na te denken. Je begeleider helpt je daar zo mee.",
      "Vind je het leuk om anderen te vertellen wat jij gebruikt? Er bestaat een gratis eigen webshop: geen inkoop, geen verkoop, geen risico. Zo kun je je eigen producten terugverdienen, gewoon door je verhaal te delen.",
    ],
    welLijst: [],
    nietLijst: [],
    tips: [
      "Van productgebruiker naar webshophouder is een klein stapje: je deelt wat je toch al gebruikt. Vraag je begeleider hoe dat werkt, het is echt laagdrempelig.",
      "Geen zin in dat alles? Ook prima. Jouw routine is het belangrijkste, de rest is bonus.",
    ],
    veelgesteld: [
      {
        vraag: "Hoe werkt die gratis webshop precies?",
        antwoord:
          "Het bedrijf werkt met aanbevelingsmarketing: producten gaan niet via winkels maar van mens tot mens. Daarom kun jij een eigen gratis webshop krijgen; de logistiek en de financiën worden allemaal geregeld, jij deelt alleen je ervaring. Zo verdien je je eigen producten terug of bouw je er iets naast op. Je begeleider laat je precies zien hoe je start.",
      },
      {
        vraag: "Moet ik daar dan van alles voor kunnen?",
        antwoord:
          "Nee. Je begint gewoon met je eigen verhaal delen met mensen die je het gunt. Alles daaromheen (uitleg, materialen, begeleiding) staat al klaar, precies zoals jij nu begeleid wordt.",
      },
    ],
    contactMoment:
      "Rond twee maanden: bespreek met je begeleider je blijvende routine, en of de webshop iets voor jou is.",
    documenten: [
      {
        titel: "Zo werkt jouw gratis webshop",
        omschrijving: "De stap van gebruiker naar webshophouder, simpel uitgelegd.",
      },
    ],
    videoSlots: [],
  },
];

// ---------- De twee programma's ----------

export const RESET_PROGRAMMAS: ResetProgramma[] = [
  {
    slug: "darm",
    naam: "Darmen in Balans",
    emoji: "🌿",
    payoff: "16 dagen puur eten en je basis opnieuw leggen. Overzichtelijk en goed te doen.",
    duur: "16 dagen",
    kleur: { hoofd: "#2F7A4D", zacht: "#EAF4EC", diep: "#1E5434" },
    vervolg:
      "Na de 16 dagen kies je samen met je begeleider jouw vervolg: doorpakken met de Holistic Reset, of verder met de basisproducten (het huis). En veel mensen komen jaarlijks even terug voor hun eigen APK.",
    stations: DARM_STATIONS,
  },
  {
    slug: "reset",
    naam: "Holistic Reset",
    emoji: "☀️",
    payoff:
      "De complete reis in vier fases: laden, omschakelen, stabiliseren en Logisch Leven.",
    duur: "±9 weken + je ritme tot maand 6",
    kleur: { hoofd: "#D97730", zacht: "#FBEFE2", diep: "#A6531B" },
    vervolg:
      "Na fase 4 kijk je samen met je begeleider naar jouw ritme voor de lange termijn: de basisproducten als onderhoud, en voor veel mensen een jaarlijkse terugkeer-ronde als eigen APK.",
    stations: RESET_STATIONS_INTERN,
  },
  {
    slug: "producten",
    naam: "Dagelijkse basis",
    emoji: "🏠",
    payoff:
      "Geen kuur, wel elke dag goed voor jezelf zorgen met je producten. Ik help je met ritme, gebruik en slimme vervolgstappen.",
    duur: "jouw eigen tempo",
    kleur: { hoofd: "#3E6FA8", zacht: "#E8F0F9", diep: "#27496D" },
    vervolg:
      "Vanuit je dagelijkse basis kun je alle kanten op: een jaarlijks darmprogramma als eigen APK, de Holistic Reset als verdieping, of je eigen gratis webshop om je producten terug te verdienen. Je begeleider denkt met je mee.",
    stations: PRODUCTEN_STATIONS,
  },
];

export function programmaVoor(slug: string): ResetProgramma | null {
  return RESET_PROGRAMMAS.find((p) => p.slug === slug) ?? null;
}

export function stationVoor(
  programmaSlug: string,
  stationSlug: string,
): ResetStation | null {
  const prog = programmaVoor(programmaSlug);
  return prog?.stations.find((s) => s.slug === stationSlug) ?? null;
}

export function buurStations(
  programmaSlug: string,
  stationSlug: string,
): { vorige: ResetStation | null; volgende: ResetStation | null } {
  const prog = programmaVoor(programmaSlug);
  if (!prog) return { vorige: null, volgende: null };
  const i = prog.stations.findIndex((s) => s.slug === stationSlug);
  if (i === -1) return { vorige: null, volgende: null };
  return {
    vorige: i > 0 ? prog.stations[i - 1] : null,
    volgende: i < prog.stations.length - 1 ? prog.stations[i + 1] : null,
  };
}
