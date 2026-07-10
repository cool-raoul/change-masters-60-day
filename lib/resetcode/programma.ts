// ============================================================
// De Resetcode als klant-reis: zes stations, van voorbereiding
// tot Logisch Leven. Dit is de ENE bron voor wat de klant per
// fase ziet én voor wat de klant-Mentor mag weten.
//
// Bron: docs/resetcode/ (Boardslink-materiaal, verbatim
// veiliggesteld). Alles hier is praktische programma-instructie,
// claim-vrij geformuleerd: wat je doet, eet en kunt verwachten
// qua ritme. Nooit wat producten medisch doen.
//
// Let op (README docs/resetcode): films en documenten spreken
// elkaar op details tegen; bekende correctie van Raoul is in
// fase 4 verwerkt (koolhydraten naar trek binnen 80/20, NIET
// elke dag één testen). Twijfelgevallen aan Raoul voorleggen.
// ============================================================

export type ResetStation = {
  slug: string;
  nummer: number;
  naam: string;
  emoji: string;
  /** Hoe lang dit station duurt, in mensentaal. */
  duur: string;
  /** Eén zin: waar dit station over gaat. */
  kern: string;
  /** Warme intro bovenaan het klant-scherm. */
  welkom: string;
  /** De regels van nu, kort en concreet. */
  vandaagBelangrijk: string[];
  /** Wat mag lekker wel (leeg = geen eetlijst in dit station). */
  welLijst: string[];
  /** Wat laat je even staan. */
  nietLijst: string[];
  tips: string[];
  veelgesteld: { vraag: string; antwoord: string }[];
  /** Wanneer je even schakelt met je begeleider (null = geen vast moment). */
  contactMoment: string | null;
  /** Document-slots: Raoul hangt de echte bestanden er later in. */
  documenten: { titel: string; omschrijving: string }[];
  /** Video-slots: idem, plek staat klaar. */
  videoSlots: string[];
};

export const RESET_STATIONS: ResetStation[] = [
  {
    slug: "start",
    nummer: 1,
    naam: "Jouw start",
    emoji: "🌱",
    duur: "tot je pakket binnen is",
    kern: "Alles klaarzetten zodat je rustig en goed kunt beginnen.",
    welkom:
      "Welkom! Wat fijn dat je begint aan de Resetcode. Je hoeft niks te kunnen of te weten, alles staat hier stap voor stap klaar. Deze eerste dagen gebruik je om je voor te bereiden, dan wordt de rest zoveel makkelijker.",
    vandaagBelangrijk: [
      "Bewaar deze pagina, hier kun je altijd naar terug.",
      "Laat je begeleider even weten wanneer je bestelling binnen is en wanneer je wilt beginnen.",
      "Maak foto's van jezelf: voorkant, zijkant, achterkant en je gezicht. Rustige achtergrond, van hoofd tot voeten. Je maakt ze voor jezelf, straks ben je blij dat je ze hebt.",
      "Meet en noteer: gewicht, taille, heup en borst.",
      "Schrijf voor jezelf op waarom je dit doet en wat je graag anders wilt. Dat lijstje wordt later goud waard.",
      "Gebruik je medicijnen (bijvoorbeeld voor je schildklier of diabetes, of de pil)? Overleg dan even met je huisarts voordat je start.",
    ],
    welLijst: [],
    nietLijst: [],
    tips: [
      "Haal alvast in huis: Keltisch zeezout, Herbamare kruidenzout, sojasaus zonder suiker (Kikkoman met rode of blauwe dop) en eventueel erythritol uit de natuurwinkel.",
      "Zet de FatSecret-app alvast op je telefoon, die ga je bij de laaddagen gebruiken.",
      "Word lid van de support-groep op Facebook. Duizenden mensen doen dit programma, je staat er niet alleen voor. De zoekbalk in de groep is je vriend.",
      "Plan alvast een contactmoment met je begeleider rond het einde van je eerste 16 dagen.",
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
        titel: "Benodigdheden en boodschappenlijstje",
        omschrijving: "Alles wat je in huis wilt hebben voor je begint.",
      },
      {
        titel: "Meet- en weegschema",
        omschrijving: "Om je metingen overzichtelijk bij te houden.",
      },
    ],
    videoSlots: ["Welkom bij de Resetcode (introductie)"],
  },
  {
    slug: "darm",
    nummer: 2,
    naam: "Darmen in Balans",
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
  {
    slug: "laaddagen",
    nummer: 3,
    naam: "Fase 1 · De laaddagen",
    emoji: "😋",
    duur: "2 dagen",
    kern: "Twee dagen flink en vooral gezond-vet eten: 3500 tot 5000 kcal per dag.",
    welkom:
      "Je begint de Holistic Reset met twee laaddagen. Klinkt gek, is bewust: zo zet je de omschakeling van fase 2 goed in gang. Dit hoort er echt bij, dus doe het serieus én met een knipoog. Je mag los!",
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
      {
        titel: "Resetboekje (3.0)",
        omschrijving: "Je complete gids voor alle vier de fases.",
      },
    ],
    videoSlots: ["Fase 1-video: de laaddagen"],
  },
  {
    slug: "vetverbranding",
    nummer: 4,
    naam: "Fase 2 · De omschakeling",
    emoji: "🔥",
    duur: "21 dagen (mag verlengd tot maximaal 40)",
    kern: "Puur en onbewerkt eten van de fase 2-lijst, zonder koolhydraten, suikers en vetten.",
    welkom:
      "Dit is de kern van je reset. Eenentwintig dagen super clean eten van de fase 2-lijst uit je boekje. Het is even wennen en daarna verrassend goed te doen, zeker met de recepten en de support-groep erbij. En onthoud: het zijn maar drie weken op je hele leven.",
    vandaagBelangrijk: [
      "Eet alleen wat op de fase 2-lijst in je boekje staat. Groente en fruit van de lijst mag ongelimiteerd, ook als tussendoortje.",
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
      "Meer trek in zoet (bijvoorbeeld rond je menstruatie)? Yogi Classic-thee smaakt zoet zonder suiker, en een appeltje uit de pan met kaneel is een feestje.",
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
    nummer: 5,
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
    nummer: 6,
    naam: "Fase 4 · Logisch Leven",
    emoji: "🌳",
    duur: "21 dagen, en daarna je ritme tot en met maand 6",
    kern: "Koolhydraten terug naar trek, binnen de 80/20-regel, met je lichaam als kompas.",
    welkom:
      "De belangrijkste fase van allemaal, want dit is de fase die blijft. Je gaat ontdekken welke koolhydraten bij jou passen en je maakt van alles wat je geleerd hebt een leefstijl. Niet streng, wel bewust: tachtig procent logisch, twintig procent lekker leven.",
    vandaagBelangrijk: [
      "Voeg koolhydraten toe waar je trek in hebt, binnen de 80/20-regel. Geen trek in koolhydraten? Ook helemaal prima.",
      "Gebruik de weegschaal en je gevoel als feedback: merk je dat iets niet lekker valt of aantikt, doe het dan wat minder vaak of plan er een actieve dag omheen.",
      "Eet volgens de LOGI-piramide uit je boekje: vaak groente en fruit, regelmatig vis, vlees, eieren en zuivel, met mate granen, zelden zoet en fastfood.",
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
        vraag: "Wat doe ik na deze 21 dagen?",
        antwoord:
          "Dan begint het mooiste deel: je nieuwe ritme vasthouden, tot en met maand 6 en daarna. Plan het vervolg-gesprek met je begeleider, dan kijken jullie samen wat bij jou past qua basis-onderhoud en wat een goed vervolg is. Veel mensen plannen ook een jaarlijks terugkeer-moment, als een soort eigen APK.",
      },
      {
        vraag: "Kan ik de reset later nog een keer doen?",
        antwoord:
          "Zeker, veel mensen maken er een jaarlijks terugkeer-moment van, als eigen APK. Houd na een afgeronde reset wel minimaal zes weken je gewone, stabiele ritme aan voordat je opnieuw start, en plan een nieuwe ronde altijd even samen met je begeleider.",
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
        titel: "LOGI-piramide",
        omschrijving: "Je 80/20-kompas voor elke dag.",
      },
      {
        titel: "Vijf leefstijl-tips",
        omschrijving: "De basis om vast te houden wat je hebt opgebouwd.",
      },
    ],
    videoSlots: ["Fase 4-video: Logisch Leven"],
  },
];

/** Station op slug, of null. */
export function stationVoor(slug: string): ResetStation | null {
  return RESET_STATIONS.find((s) => s.slug === slug) ?? null;
}

/** Vorige/volgende station voor navigatie. */
export function buurStations(slug: string): {
  vorige: ResetStation | null;
  volgende: ResetStation | null;
} {
  const i = RESET_STATIONS.findIndex((s) => s.slug === slug);
  if (i === -1) return { vorige: null, volgende: null };
  return {
    vorige: i > 0 ? RESET_STATIONS[i - 1] : null,
    volgende: i < RESET_STATIONS.length - 1 ? RESET_STATIONS[i + 1] : null,
  };
}
