import type { Dag, ControllableTaak } from "./types";

// ============================================================
// CORE-dagen, 21 skill-opstart + 19 verankering + lifetime-template
//
// Inhoud overgezet van lib/leerpaden/core-stappen.ts en verrijkt
// met first-win contact vanaf dag 1, pre-post vertakking,
// DMO-blok-aansluiting, drie vaste afsluit-stappen, en cross-modus
// skip-mogelijkheden.
//
// Layout-volgorde:
//   - Dag 1-21: skill-opstart (oude 21 stappen, herordend en
//     verrijkt). Fase 1.
//   - Dag 22-40: verankering. Geen nieuwe content, wel DMO-blok.
//     Genereerd via genereerVerankeringsDag(). Fase 2.
//   - Dag 41+: lifetime DMO. Genereerd via genereerLifetimeDag().
//     Fase 3.
//
// Elke Core-dag eindigt met drie vaste afsluit-stappen (zoals Sprint):
// sponsor-checkin, momentum-radar, partner-check.
// ============================================================

function afsluitStappen(dagNummer: number): ControllableTaak[] {
  return [
    {
      id: `core-dag${dagNummer}-sponsor-checkin`,
      label: "💬 Sluit af met een korte sponsor-checkin",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
      uitleg: `30 sec berichtje naar je sponsor hoe dag ${dagNummer} ging.`,
    },
    {
      id: `core-dag${dagNummer}-momentum-radar`,
      label: "🎯 Open momentum-acties van vandaag",
      verplicht: false,
      inlineEmbed: "momentum-radar",
      uitleg:
        "Check openstaande acties van vandaag. Verbergt zich als alles is opgepakt.",
    },
    {
      id: `core-dag${dagNummer}-partner-check`,
      label: "🤝 Check je nieuwe partner(s) vandaag",
      verplicht: false,
      inlineEmbed: "partner-check",
      uitleg: "Voor wie al team heeft. Verbergt zich onzichtbaar bij geen partners.",
    },
  ];
}

export const CORE_DAGEN: Dag[] = [
  {
    nummer: 1,
    titel: "🚀 24u-fundament: WHY, DTT, eerste contact",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag1-why",
        label: "Maak je WHY (overgeslagen als al gedaan in Sprint/Pro)",
        verplicht: true,
        actieRoute: "/mijn-why",
        uitleg:
          "De ELEVA Mentor stelt vragen en helpt je formuleren waarom jij hieraan begint. Sterke WHY = brandstof voor de mindere dagen.",
      },
      {
        id: "core-dag1-dtt",
        label: "Vul je Doel-Tijd-Termijn in",
        verplicht: true,
        inlineEmbed: "dtt-onboarding",
        uitleg:
          "Drie vragen: hoeveel inkomen per maand wil je, hoeveel tijd per week kan je investeren, in hoeveel maanden moet het er staan? Op basis hiervan krijg je advies over dagelijkse aantallen.",
      },
      {
        id: "core-dag1-prepost",
        label: "Heb je al een eigen product-ervaring?",
        verplicht: true,
        inlineEmbed: "prepost-keuze",
        uitleg:
          "Bepaalt of je dag 7-11 begint met pre-post (geen ervaring, je deelt je voornemen) of 21-dagen-post (wel ervaring, je deelt resultaat).",
      },
      {
        id: "core-dag1-eerste-contact",
        label: "🎯 Stuur vandaag 1 warm contact dat je gestart bent",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "Niet pitchen, gewoon delen. Eén persoon uit je warme kring. Dit is je eerste win: vanaf dag 1 ben je al in actie, niet alleen aan het voorbereiden.",
      },
      ...afsluitStappen(1),
    ],
    faseDoel: "Fundament gelegd: WHY, DTT, sponsor-verbinding en eerste echte contact.",
    waarInEleva: [
      { actie: "Maak je WHY", menupad: "Menu, Mijn WHY", route: "/mijn-why" },
      { actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" },
      { actie: "Naar je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" },
    ],
    watJeLeert: `Welkom bij Core 💟 Wat bijzonder dat je hier bent.

Je hebt iets bewust gekozen, en die keuze betaalt zichzelf de komende dagen terug. Geen sprint, geen rush. Dit is jouw weg, in jouw tempo. Vandaag leg je het fundament.

JE EERSTE DAG, HEEL RUSTIG

Vandaag staan er vier sleutel-momenten open. Geen lange dag, geen drukke dag. Wel een dag waarin je 'm écht zet. Hieronder zie je wat we vandaag samen vorm geven, en daarna volgt elke dag een nieuw stukje van het puzzelstuk.

**Je WHY**, je waarom. De reden waarom je begint is je brandstof op de momenten waarop het tegenzit. Voor de een is dat vrijheid en ademruimte, voor de ander is het mensen helpen die op zoek zijn naar meer energie, en sommigen voelen gewoon: er zit meer in mij. Wat jouw ingang ook is, je WHY houdt je in koers, en het is je haakje in gesprekken met anderen. Mensen haken niet aan op een product of bedrijf, wel op een persoonlijk verhaal. De ELEVA Mentor stelt vragen en helpt 'm formuleren, of je 'm nu helder voor ogen hebt of nog tastend.

**Je Doel-Tijd-Termijn**, drie korte vragen. Hoeveel inkomen wil je over een jaar? Hoeveel tijd kan je realistisch investeren? In hoeveel maanden moet het er staan om de moeite waard te zijn? Op basis hiervan krijg je je dagelijkse aantallen op maat. Geen vast schema, wel een richtlijn die past bij jouw leven. En je ziet direct welke rank in het commissieplan je nastreeft, van Builder tot Diamond.

**Een persoonlijk verhaal of een gemerkt verschil**, vandaag kies je hoe je begint. Heb je al een product van Lifeplus geprobeerd en iets gemerkt? Top, dan deel je dat eerlijk en raakt het mensen. Heb je nog geen ervaring? Ook prima, dan deel je je voornemen en bouw je je eigen 21-dagen-ervaring de komende weken op. Beide werken. Het verschil zit alleen in welk soort post je dag 7 plaatst.

**Je eerste contact vandaag**, hier zit de kracht. Niet wachten tot alles 'klaar' is. Niet pitchen, niet verkopen. Gewoon één warm contact uit je kring een berichtje sturen dat je gestart bent. Eén persoon. Dat is je eerste win.

JOUW TEMPO IS JOUW KEUZE, EN HIJ MAG SCHUIVEN

Met minder dan 3 uur per week verdien je je eigen producten terug. Dat is een eerlijke situatie, alleen geen netwerk om inkomen mee op te bouwen. Vanaf 3 tot 6 uur (Rustig) bouw je rustig klanten op. Vanaf 6 uur (Gestaag) wordt Builder een werkbaar doel. Vanaf 10 uur (Serieus) ga je voor Builder en eerste duplicatie. Vanaf 16 uur (Doorpakken) ga je voor meerdere Builders.

Je tempo is geen contract. Veel mensen beginnen rustig, merken resultaat, en schroeven op naar 6 of 10 uur als hun werk vrucht gaat dragen. Aanpassen kan altijd via /instellingen, jouw aantallen schuiven dan vanzelf mee.

WAT HET COMMISSIEPLAN VOOR JE BETEKENT

Op dag 4 krijg je de complete rank-uitleg, maar je mag het nu vast weten. Builder is de eerste bouwsteen, daar gaat het echt dupliceren. Vanaf Bronze zit je tussen 300 en 600 euro per maand, Silver vanaf 600, Gold vanaf 900, Diamond vanaf 1200. Dit zijn vanaf-bedragen, geen plafond. Een Diamond met diep doorlopende duplicatie verdient soms vier of vijf keer dat minimum. Het hangt af van hoe je bouwt, met klanten of met members.

JE SPONSOR IS JE RUGDEKKING

Niet je baas. Iemand die meekijkt, je vragen beantwoordt, en bijspringt als het even stroef gaat. Eén berichtje vandaag, een korte "ik ben gestart", opent de relatie. Vanaf dat moment ziet 'ie in ELEVA wat er gebeurt en weet 'ie wanneer het loopt of wanneer er even iets is.

JIJ LAAT ZIEN, ZIJ BESLISSEN

De grootste mentale shift in Core: je hoeft niemand binnen te praten, niemand te overtuigen, niemand te laten kiezen voor wat jij wilt. Jouw taak is laten zien wat er is. Zij beslissen wat ze ermee doen. Dat maakt je werk lichter dan veel mensen denken, en respectvoller. Niemand voelt zich gemanipuleerd, jij voelt je geen verkoper, en de mensen die wel kiezen doen dat omdat het écht bij ze past.

WAT ER MORGEN GEBEURT

Dag 2 bouw je je Top-20 namenlijst op, de twintig mensen die spontaan in je hoofd opkomen. Daarna importeer je je telefoonboek voor breedte, en voeg je een paar social-contacten toe. Een korte kennismakings-call met je sponsor erbij. Geen verkoop, geen werving. Wel je netwerk in beeld zodat je weet wie er om je heen staat.

Overweldigd voelen op dag 1 is normaal. Je leert iets nieuws, je stapt uit comfort. Eerst onhandig, dan vaardig. Je sponsor staat naast je, de ELEVA Mentor ook.

Niet alleen. Bouwen mag leuk zijn 💟`,
    waaromWerktDit: {
      tekst:
        "Mensen die op dag 1 hun WHY plaatsen, hun tempo eerlijk inschatten, en die ene eerste warme contact gewoon DOEN, zetten een fundament neer dat de komende 40 dagen draagt. Wachten tot 'alles klaar' is, is precies waar de meesten in vast lopen.",
    },
  },
  {
    nummer: 2,
    titel: "👥 Top-20 namenlijst + telefoon-import",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag2-top20",
        label: "Schrijf 20 namen op: jouw warme kring (Top-20 namenlijst)",
        verplicht: true,
        inlineEmbed: "namen-form",
        inlineEmbedDoel: 20,
        uitleg:
          "Familie, vrienden, kennissen, collega's, ouders bij school, sportclub, hobby's. Geen filter. Ook degenen waarvan je denkt 'die past nooit'. Vaak verrassen ze je.",
      },
      {
        id: "core-dag2-telefoon-import",
        label: "Importeer je telefooncontacten",
        verplicht: false,
        vereistMobiel: true,
        inlineEmbed: "vcard-upload",
        uitleg:
          "Eén klik, je hele telefoonboek staat erin. Net als bij Sprint: dit is je netwerk-overzicht, geen verkoop-lijst.",
      },
      {
        id: "core-dag2-social-contacten",
        label: "Voeg 3 mensen toe vanuit social media (Instagram/Facebook)",
        verplicht: false,
        actieRoute: "/namenlijst",
        uitleg:
          "Mensen die jou volgen of die jij volgt en met wie je een tijd niet hebt gesproken. Zelfde patroon als Sprint dag 3.",
      },
      {
        id: "core-dag2-sponsor-call",
        label: "Plan een kennismakings-call met je sponsor (30 min)",
        verplicht: true,
        uitleg:
          "In deze call leer je je sponsor kennen, kijk je samen naar je lijst en bespreek je 1 of 2 mensen die je deze week wilt benaderen.",
      },
      ...afsluitStappen(2),
    ],
    faseDoel: "Top-20 namenlijst, telefoonboek en eerste social-contacten in beeld.",
    waarInEleva: [
      { actie: "Naar je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" },
      { actie: "Open je sponsor-chat", menupad: "Menu, Team", route: "/team" },
    ],
    watJeLeert: `Voordat je je webshop op grote schaal kunt delen, wil je weten WIE er om je heen staat. Dit is geen verkoop-lijst, dit is een netwerk-overzicht. Familie, vrienden, oud-collega's, sportmaatjes, mensen die je via social volgt.

In Core noemen we de eerste 20 namen die je spontaan opschrijft jouw 'Top-20 namenlijst'. Dat zijn niet je beste klanten, dat zijn de mensen die als eerste in je hoofd opkomen. Daarna importeer je je hele telefoon en voeg je social-contacten toe.

In je DMO-blok hieronder zie je dat lijst-opbouw doorgaat. Elke dag mogen er meer bij.`,
    waaromWerktDit: {
      tekst:
        "Een filter zetten op 'wie zou geinteresseerd zijn' is jouw oordeel over een ander. Filteren komt later, en doet jouzelf nooit voor iemand anders. Iedereen mag op de lijst, zij beslissen zelf.",
    },
  },
  {
    nummer: 3,
    titel: "🛒 Webshop opzetten + krediet + teams (admin-dag)",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag3-webshop",
        label: "🛒 Maak je eigen webshop aan",
        verplicht: true,
        uitleg:
          "Volg de instructies van je sponsor of de hand-out. Eenmalige stap, hierna is je shop online.",
      },
      {
        id: "core-dag3-krediet",
        label: "✅ Vul je kredietformulier in (zonder dit geen uitbetaling)",
        verplicht: true,
        uitleg:
          "Zonder dit formulier ontvang je geen commissies. Eenmalige stap.",
      },
      {
        id: "core-dag3-teams",
        label: "📋 Teams-administratie inrichten",
        verplicht: true,
        uitleg:
          "Hier wordt je team-structuur en business-data bijgehouden. Bekijk het film-blok hieronder voor de exacte stappen.",
        filmSlug: "core-dag3-teams-admin",
      },
      ...afsluitStappen(3),
    ],
    faseDoel: "Drie admin-fundamenten staan: webshop, krediet, teams.",
    waarInEleva: [],
    watJeLeert: `Vandaag is je admin-dag. Drie korte taken die je in een ochtend hebt staan, daarna kun je verder met het echte werk: je webshop activeren, je krediet-uitbetaling regelen, en je teams-admin opzetten.

Lichte dag qua leerstof, zware dag qua afvinken. De rest van Core leunt op deze drie fundamenten.`,
    waaromWerktDit: {
      tekst:
        "Mensen die hun admin op dag 3 doen, vergeten 'm zelden later. Mensen die 'm uitstellen, krijgen er na maanden mee te maken in de vorm van gemiste commissies.",
    },
  },
  {
    nummer: 4,
    titel: "🔗 Bestellinks + productadvies-test + commission-plan",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag4-bestellinks",
        label: "🔗 Koppel je webshop-links aan ELEVA",
        verplicht: true,
        actieRoute: "/instellingen/bestellinks",
        uitleg:
          "Plak per pakket je eigen verkooplink. Eenmalig werk, daarna gebruikt ELEVA ze automatisch in productadvies-flows.",
      },
      {
        id: "core-dag4-test",
        label: "Doe zelf de productadvies-test (3 min)",
        verplicht: true,
        actieRoute: "/test-pakket-bouwer",
        uitleg:
          "Door 'm zelf te doen weet je hoe je prospects de test ervaren en welk advies eruit kan komen.",
      },
      {
        id: "core-dag4-commission-plan",
        label: "Lees het korte commission-plan-overzicht",
        verplicht: true,
        uitleg:
          "Onder 'Wat je leert' staat de rank-ladder Builder/Bronze/Silver/Gold/Diamond met minimum-vereisten. Je weet daarna wat je moet doen om jouw doel uit dag 1 te halen.",
      },
      ...afsluitStappen(4),
    ],
    faseDoel: "Bestellinks gekoppeld, productadvies-test verkend, commission-plan in beeld.",
    waarInEleva: [
      { actie: "Beheer bestellinks", menupad: "Instellingen, Bestellinks", route: "/instellingen/bestellinks" },
      { actie: "Doe de productadvies-test", menupad: "Menu, Test", route: "/test-pakket-bouwer" },
    ],
    watJeLeert: `Vandaag drie dingen: bestellinks koppelen, productadvies-test verkennen, en basis-kennis van het commission-plan.

COMMISSION-PLAN IN 1 OOGOPSLAG:

Builder (eigen IP 40, totaal 1500): bouwsteen, geen vast bedrag, sleutel tot duplicatie.
Bronze (eigen IP 100, totaal 3000, 3 members): vanaf 300 tot 600 euro per maand.
Silver (eigen IP 100, totaal 6000, 6 members): vanaf 600 euro per maand.
Gold (eigen IP 150, totaal 9000, 9 members): vanaf 900 euro per maand.
Diamond (eigen IP 150, totaal 15000, 12 members in verschillende lijnen): vanaf 1200 euro per maand.

Totaal = wat er in je eerste 3 levels gebeurt (jouw bestelling + alle members + alle shoppers). Members hoeven niet per se in level 1 te zitten, ze kunnen ook dieper zitten.

Belangrijk: deze bedragen zijn MINIMUM-VANAF, geen plafond. Een Diamond kan ook 4000 euro of meer verdienen afhankelijk van duplicatie-diepte.

Het complete plan met percentages per niveau staat in de kennisbank.`,
    waaromWerktDit: {
      tekst:
        "Mensen die het commission-plan op dag 4 snappen, kiezen scherpere doelen en houden langer vol. Onwetendheid over hoe je verdient is een van de top-3-redenen waarom mensen afhaken in maand 2.",
    },
  },
  {
    nummer: 5,
    titel: "📦 Productkennis: welke producten verkoop jij",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag5-mentor",
        label: "Vraag de Mentor: welke 5 producten verkoop ik het meest?",
        verplicht: false,
        actieRoute: "/coach",
        uitleg: "De Mentor geeft je een korte productenkennis-onderwerping op maat.",
      },
      {
        id: "core-dag5-eigen-pakket",
        label: "Bestel je eigen pakket als je dat nog niet hebt",
        verplicht: false,
        uitleg:
          "Eigen ervaring is je beste verkooppraatje. Begin met een basis-supplement of een programma waar je in geinteresseerd bent.",
      },
      ...afsluitStappen(5),
    ],
    faseDoel: "Basis-overzicht van producten en voor wie ze passen.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Je hoeft niet alles uit je hoofd te kennen, maar wel een gevoel van de hoofdcategorieen. Basis-supplementen (dagelijkse aanvulling), omega-3, antioxidanten, en de programma's (Reset, darm-balans, stress-vermindering, hormonale balans, sport-herstel).

De ELEVA Mentor kent alle details, jij hoeft alleen te weten dat het bestaat en wanneer je het noemt. Eigen ervaring met minstens een paar producten geeft je de natuurlijke taal om erover te praten.`,
    waaromWerktDit: {
      tekst:
        "Mensen ruiken het verschil tussen iemand die uit eigen ervaring praat en iemand die uit een script praat. Jouw ervaring is je beste authenticiteit.",
    },
  },
  {
    nummer: 6,
    titel: "🤝 Hoe deel je je webshop natuurlijk",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag6-natuurlijk",
        label: "Schrijf je 'natuurlijke webshop-introductie' op (3-4 zinnen)",
        verplicht: true,
        actieRoute: "/mijn-zinnen",
        uitleg:
          "Voorbeeld: 'Ik ben sinds kort gestart met hoogwaardige supplementen. Heb mijn eigen webshop, kan je rondsturen als je wilt zien wat er staat.' De Mentor kan helpen.",
      },
      {
        id: "core-dag6-delen",
        label: "Deel je webshop met 2 mensen uit je lijst (rustig, geen pitch)",
        verplicht: false,
        actieRoute: "/namenlijst",
      },
      ...afsluitStappen(6),
    ],
    faseDoel: "Jouw natuurlijke webshop-introductie op papier en in praktijk.",
    waarInEleva: [{ actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" }],
    watJeLeert: `Je webshop delen is geen koud verkooppraatje. Het is een natuurlijk antwoord op vragen als 'waar haal jij je supplementen?' of 'wat doe jij voor je energie?'.

Vandaag schrijf je een korte introductie (3-4 zinnen) die past bij hoe jij met deze mensen praat. Niet perfect, wel jouw stem. De Mentor helpt 'm scherper te maken, jij houdt 'm authentiek.`,
    waaromWerktDit: {
      tekst:
        "Mensen die hun introductie eenmalig opschrijven, voelen zich daarna 4x rustiger als het gesprek er natuurlijk om vraagt. Geen 'wat zeg ik nu?', wel een vertrouwde paar zinnen klaar.",
    },
  },
  {
    nummer: 7,
    titel: "✍️ Eerste post voorbereiden (pre-post of 21-dagen-post)",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag7-mentor",
        label: "Vraag de Mentor om je eerste post te helpen schrijven",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "Op dag 1 heb je gekozen tussen pre-post (geen eigen resultaat) en 21-dagen-post (wel ervaring). De Mentor weet jouw keuze en helpt je vanuit die track.",
      },
      {
        id: "core-dag7-reactie-script",
        label: "Zet je reactie-script klaar voor wanneer mensen reageren",
        verplicht: false,
        actieRoute: "/scripts",
        uitleg:
          "Als je post live is, komen er reacties. Een korte reactie-zin klaarzetten voorkomt dat je 'verrast' wordt en niet weet wat te zeggen.",
      },
      ...afsluitStappen(7),
    ],
    faseDoel: "Eerste post staat klaar om geplaatst te worden + reactie-script klaar.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Vandaag bereid je je eerste post voor. Twee paden, beide werken:

PRE-POST (als je nog geen eigen product-ervaring hebt): je deelt je VOORNEMEN. 'Ik begin aan iets, in 21 dagen vertel ik je wat ik heb gemerkt.' Geeft je 21 dagen om resultaat op te bouwen.

21-DAGEN-POST (als je wel ervaring hebt): je deelt wat je hebt gemerkt. Eerlijk, claim-vrij, geen medische beloften. Wel: hoe je je voelt, wat anders is, wat je opvalt.

Beide types post werken het beste met een PERSOONLIJK MOMENT. Wat raakte jou? Wat trok je over de streep? Dat is wat anderen aanspreekt, niet de product-feiten.`,
    waaromWerktDit: {
      tekst:
        "Mensen reageren niet op product-claims, ze reageren op andere mensen. Een eerlijke pre-post of 21-dagen-post opent gesprekken die de rest van je 21 dagen voortborduren op.",
    },
  },
  {
    nummer: 8,
    titel: "📤 Eerste post live + reactief contact starten",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag8-post-live",
        label: "Plaats je eerste post op Instagram of Facebook",
        verplicht: true,
        uitleg:
          "Vraag je sponsor of Mentor om 'm te checken vooraf. Niet perfect proberen, gewoon plaatsen.",
      },
      {
        id: "core-dag8-reageer-script",
        label: "Bewaar je reactie-script op /mijn-zinnen",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
      },
      ...afsluitStappen(8),
    ],
    faseDoel: "Eerste post staat live. Reactief contact-onderdeel in je DMO-blok wordt vanaf nu actief.",
    waarInEleva: [{ actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" }],
    watJeLeert: `Vanaf vandaag ben je zichtbaar op socials. Twee dingen veranderen:

1. Reacties + likes komen binnen. Het 'reactief social-contact'-onderdeel in je DMO-blok hieronder wordt actief. Reageer op iedereen die iets laat zien, voer DM-gesprekken, deel informatie waar gevraagd.

2. Social-post-ritme begint. Niet elke dag posten verplicht, wel het ritme van jouw bracket. Lifestyle, product-momenten, waarde-tips wisselen elkaar af.

Eric Worre zegt: 90% van je business gebeurt in DM's. Posts zijn de uitnodiging, gesprekken zijn waar het echte werk gebeurt.`,
    waaromWerktDit: {
      tekst:
        "Mensen die hun eerste post plaatsen en daarna actief reageren op alle interacties, openen meer warme leads in week 2 dan mensen die alleen blijven posten zonder DM-werk.",
    },
  },
  {
    nummer: 9,
    titel: "📱 Brookes 3-stappen-formule voor social posts",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag9-post",
        label: "Schrijf een tweede post volgens Brookes-formule",
        verplicht: false,
        uitleg:
          "Waarde (een tip of inzicht) + Verhaal (iets persoonlijks) + Uitnodiging ('DM me als je meer wilt weten'). Mentor helpt graag.",
      },
      ...afsluitStappen(9),
    ],
    faseDoel: "Tweede social-post live, Brookes-formule onder de knie.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Frazer Brookes leerde ons: een goede post bestaat uit drie delen. WAARDE (een tip, een inzicht, een les), VERHAAL (iets persoonlijks of een resultaat), en een ZACHTE UITNODIGING ('DM me als je meer wilt weten').

Niet direct pitchen. Eerst nieuwsgierigheid wekken. Een post die alle drie elementen heeft, leest natuurlijker dan een post die alleen waarde of alleen verhaal of alleen verkoop is.

Oefen vandaag de formule. Niet 'm in 1 dag perfectioneren, wel het patroon leren herkennen.`,
    waaromWerktDit: {
      tekst:
        "Mensen scrollen voorbij waarde-only-posts (te leeraars) en verkoop-only-posts (te marketeers). Brookes' mix combineert helpen en menselijk zijn, dat geeft natuurlijke conversie.",
    },
  },
  {
    nummer: 10,
    titel: "✨ Jouw 3 verhalen: persoonlijk, product, business",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag10-persoonlijk",
        label: "Schrijf je persoonlijke verhaal (60 sec gesproken)",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
      },
      {
        id: "core-dag10-product",
        label: "Schrijf je product-verhaal (60 sec)",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
      },
      {
        id: "core-dag10-business",
        label: "Schrijf je business-verhaal (60 sec)",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
      },
      ...afsluitStappen(10),
    ],
    faseDoel: "Drie korte verhalen op papier, klaar voor social en gesprekken.",
    waarInEleva: [{ actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" }],
    watJeLeert: `Een goed verhaal verkoopt beter dan elke pitch. Vandaag schrijf je drie korte verhalen, 60 tot 90 seconden gesproken-tijd elk:

PERSOONLIJK VERHAAL: wie was je, wat veranderde, wie ben je nu? Niet alle details, wel het hart.

PRODUCT-VERHAAL: welke producten doen wat voor jou? Claim-vrij: niet 'dit geneest', wel 'dit bracht me'. Wat voel je, wat is er anders?

BUSINESS-VERHAAL: waarom doe je dit, en niet iets anders? Wat trok jou over de streep om een webshop op te zetten in plaats van iets traditioneels te kiezen?

Deze drie verhalen zijn jouw kapitaal voor de komende maanden. Je gebruikt ze in posts, in gesprekken, in stories, in DM-antwoorden.`,
    waaromWerktDit: {
      tekst:
        "Mensen onthouden verhalen, geen feiten. Drie verhalen op papier is alles wat je nodig hebt voor 80% van je content de komende maanden.",
    },
  },
  {
    nummer: 11,
    titel: "🎁 Freebies inzetten als intekenplek",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag11-kies",
        label: "Kies de freebie die past bij jouw doelgroep",
        verplicht: true,
        uitleg: "Vraag je sponsor of de Mentor welke freebie het beste past.",
      },
      {
        id: "core-dag11-deel",
        label: "Deel je freebie-link in je posts (intekenplek)",
        verplicht: false,
        uitleg:
          "Een freebie meelopen op een post werkt beter dan een losse 'gratis weggever'-post. Plak 'm op een natuurlijke plek in jouw social-ritme.",
      },
      ...afsluitStappen(11),
    ],
    faseDoel: "Een freebie gekoppeld aan je social-content. Eerste leads via socials.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Een freebie is een gratis weggever (een mini-test, korte film, recept-kaart, of zelftest) die jouw prospect helpt en tegelijk hun gegevens in jouw ELEVA-pipeline zet.

In Core gebruiken we freebies als INTEKENPLEK op je social-posts: een post die waarde geeft + een freebie-link voor wie meer wil. Geen Manychat-omweg, mensen komen direct in je ELEVA-systeem.

Hoe vaak een freebie? Afhankelijk van je tempo-bracket: bij Rustig 1x per week meeliftend op een post, bij Doorpakken 2-3x per week.`,
    waaromWerktDit: {
      tekst:
        "Een freebie-link op een goede post haalt 5 tot 10x zoveel leads als een losse 'gratis weggever'-post. Het waarde-moment bouwt vertrouwen, de freebie zet 'm om in lead.",
    },
  },
  {
    nummer: 12,
    titel: "💬 Eerste klanten via warme markt",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag12-bericht1",
        label: "Stuur bericht 1 aan iemand uit je warme markt",
        verplicht: true,
        actieRoute: "/scripts",
      },
      {
        id: "core-dag12-bericht2",
        label: "Stuur bericht 2",
        verplicht: true,
      },
      {
        id: "core-dag12-bericht3",
        label: "Stuur bericht 3",
        verplicht: true,
      },
      ...afsluitStappen(12),
    ],
    faseDoel: "Drie warme-markt-uitnodigingen verstuurd. Follow-up-onderdeel in DMO actief.",
    waarInEleva: [{ actie: "Naar scripts", menupad: "Menu, Scripts", route: "/scripts" }],
    watJeLeert: `Je warme markt is de plek waar je echt iets kunt doen. Niet pushy uitnodigen voor 'business', wel rustig delen wat je doet en aanbieden om iets te laten zien als ze geinteresseerd zijn.

Vandaag stuur je drie zorgvuldige berichten aan mensen die je kent. Niet aan iedereen tegelijk, wel 3 die je echt al een tijdje wilde benaderen. Mentor + scripts helpen je met de juiste woorden.

Vanaf vandaag is het follow-up-onderdeel in je DMO-blok actief: prospects die hebben gereageerd of bekeken volg je systematisch op met herinneringen.`,
    waaromWerktDit: {
      tekst:
        "Drie kwalitatieve berichten naar warme contacten geven meestal 1 of 2 reacties. Geen reactie? Geen drama, dat hoort. De gemiddelde response-ratio is 1 op 15 tot 20 contacten.",
    },
  },
  {
    nummer: 13,
    titel: "🛡️ Bezwaren behandelen, Feel-Felt-Found",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag13-roleplay",
        label: "Doe 5 minuten roleplay met de Mentor over de 3 grootste bezwaren",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "De Mentor speelt een prospect met 'ik heb geen tijd', 'ik wil eerst nadenken', of 'het is te duur'. Jij oefent Feel-Felt-Found.",
      },
      ...afsluitStappen(13),
    ],
    faseDoel: "Feel-Felt-Found-techniek geoefend met de Mentor.",
    waarInEleva: [{ actie: "Roleplay met Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Feel-Felt-Found in drie zinnen:

FEEL: "Ik begrijp dat je dat voelt."
FELT: "Anderen voelden dat in het begin ook."
FOUND: "Wat zij merkten was..."

Deze techniek werkt omdat je niet in discussie gaat. Je geeft erkenning, dan toon je een andere kant van het verhaal, dan vraag je door. Bezwaren zijn geen afwijzingen, het zijn vragen om geruststelling.

Oefen vandaag 5 minuten met de Mentor. Niet 1x, wel 3-4 rondes met verschillende bezwaren. Dan voel je het patroon.`,
    waaromWerktDit: {
      tekst:
        "Mensen die FFF beheersen, raken nooit meer in een argumenten-strijd met prospects. Je antwoorden voelen kalm en menselijk, niet defensief, en dat haalt de spanning eruit.",
    },
  },
  {
    nummer: 14,
    titel: "👋 Klantcontact en opvolging",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag14-herinnering",
        label: "Plan voor 3 prospects een opvolg-herinnering in",
        verplicht: true,
        actieRoute: "/herinneringen",
      },
      ...afsluitStappen(14),
    ],
    faseDoel: "Drie herinneringen ingesteld voor warme prospects.",
    waarInEleva: [{ actie: "Open herinneringen", menupad: "Menu, Herinneringen", route: "/herinneringen" }],
    watJeLeert: `80% van de business zit in de follow-up, niet in het eerste gesprek. Mensen hebben gemiddeld 4 tot 6 contactmomenten nodig voordat ze beslissen.

ELEVA's herinneringen-systeem houdt voor je bij wie je een tijd niet hebt gesproken. Vandaag stel je voor 3 prospects een opvolg-herinnering in. Op de juiste dag krijg je een melding, dan stuur je een persoonlijk bericht.

Niet pushen, wel aanwezig blijven. Een 'hoe gaat het nu?' op de juiste dag werkt vaak beter dan 5 verkoop-pogingen achter elkaar.`,
    waaromWerktDit: {
      tekst:
        "Mensen die herinneringen instellen verliezen geen prospects in de stilte. Mensen die 't niet doen, vergeten 80% van hun warmere contacten binnen 3 weken.",
    },
  },
  {
    nummer: 15,
    titel: "🔁 Hercontact en herhaalbestellingen",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag15-check",
        label: "Stuur 3 bestaande klanten een persoonlijk hercontact-bericht",
        verplicht: false,
        actieRoute: "/namenlijst",
      },
      ...afsluitStappen(15),
    ],
    faseDoel: "Drie hercontact-berichten naar bestaande klanten verstuurd.",
    waarInEleva: [{ actie: "Naar je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" }],
    watJeLeert: `Een tevreden klant die geen herhaalbestelling doet is geld dat op tafel ligt. Niet door te pushen, wel door op het juiste moment een persoonlijk berichtje te sturen: 'Hé, hoe gaat het nu?'.

ELEVA's namenlijst houdt voor je bij wie je een tijdje niet hebt gesproken. Vandaag pak je drie bestaande klanten en stuur je een rustig hercontact-bericht. Geen aanbod, wel oprechte aandacht.`,
    waaromWerktDit: {
      tekst:
        "Hercontact zonder verkoop-doel bouwt loyaliteit. Klanten die zich gezien voelen, bestellen vaker uit zichzelf en sturen anderen jouw kant op.",
    },
  },
  {
    nummer: 16,
    titel: "🗣️ Testimonial-content (eerlijk, claim-vrij)",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag16-testimonial",
        label: "Maak een korte video (60-90 sec) over jouw productervaring",
        verplicht: false,
        uitleg:
          "Geen medische claims. Wel: wat deed het voor jou, wat veranderde, hoe lang gebruik je het al? Eerlijk en menselijk.",
      },
      ...afsluitStappen(16),
    ],
    faseDoel: "Eerste testimonial-video staat klaar voor social.",
    waarInEleva: [],
    watJeLeert: `Niets verkoopt zoals een echt verhaal. Vandaag deel je jouw eigen ervaring met een product dat jij gebruikt.

WAT NIET: 'Dit product geneest X', 'Dit zorgt voor Y'. Medische of ziekte-claims zijn wettelijk verboden bij voedingssupplementen.

WAT WEL: 'Sinds ik dit gebruik voel ik...', 'Ik merk dat...', 'Wat ik anders ervaar is...'. Jouw subjectieve ervaring delen mag altijd, claims over wat het product DOET niet.

De Mentor en de Academy-training 'Spreken zoals het raakt' helpen je met formuleringen die raken zonder grenzen over te steken.`,
    waaromWerktDit: {
      tekst:
        "Een eerlijke testimonial-video opent 10x meer DM-gesprekken dan een product-foto met productspecs. Mensen kopen mensen, niet ingredienten.",
    },
  },
  {
    nummer: 17,
    titel: "👀 Builder-energie herkennen in je klantkring",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag17-lijst",
        label: "Markeer in je namenlijst 2 tot 3 klanten met Builder-energie",
        verplicht: false,
        actieRoute: "/namenlijst",
      },
      ...afsluitStappen(17),
    ],
    faseDoel: "Twee tot drie klanten gemarkeerd als potentiele Builders.",
    waarInEleva: [{ actie: "Naar je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" }],
    watJeLeert: `Niet elke klant wil zelf ondernemen, maar onder hen zitten ondernemende types die het wel zouden willen. Vandaag leer je signalen herkennen:

- Iemand die geinteresseerd is in HOE jij het doet, niet alleen WAT je verkoopt
- Iemand die zelf ook ondernemer-energie heeft (eigen praktijk, ZZP, vrije ziel)
- Iemand die zegt 'misschien moet ik dit ook eens proberen'
- Iemand die andere mensen om zich heen heeft die ze willen helpen

Markeer 2 of 3 van zulke klanten in je namenlijst. Morgen leer je hoe je ze een uitnodiging stuurt om zelf een webshop te openen.`,
    waaromWerktDit: {
      tekst:
        "Builder herkennen op tijd voorkomt dat je voor altijd alleen klanten heelt. Een Builder onder je verdrievoudigt je inkomsten zonder dat je meer hoeft te werken.",
    },
  },
  {
    nummer: 18,
    titel: '💼 "Open ook een webshop"-scripts (duplicatie)',
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag18-bericht",
        label: "Bereid een script voor voor één klant met Builder-energie",
        verplicht: false,
        actieRoute: "/scripts",
      },
      ...afsluitStappen(18),
    ],
    faseDoel: "Een script klaar voor jouw eerste duplicatie-gesprek.",
    waarInEleva: [{ actie: "Naar scripts", menupad: "Menu, Scripts", route: "/scripts" }],
    watJeLeert: `Duplicatie is hoe je business groeit zonder dat jij meer uren werkt. Vandaag leer je hoe je een ontspannen voorstel doet aan iemand uit je klantkring:

'Hé, ik zie dat jij hier energie in hebt, heb je er ooit aan gedacht zelf een webshop te openen?'

Geen druk. Gewoon de optie aanbieden. Sommigen zeggen ja, sommigen zeggen niet-nu, sommigen zeggen nooit. Allemaal prima.

Bereid vandaag een script voor 1 specifieke klant. Wat weet je van hen? Hoe past het bij wat zij willen? Dat maakt je voorstel persoonlijk in plaats van generiek.`,
    waaromWerktDit: {
      tekst:
        "Een persoonlijk voorstel aan iemand met Builder-energie heeft een 10x hogere kans dan een algemene 'wil je ook?'-massaboodschap. Het persoonlijke is wat verschil maakt.",
    },
  },
  {
    nummer: 19,
    titel: "🎯 Closingsvragen, helpen beslissen",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag19-vraag",
        label: "Stel de closingsvraag aan minstens één warme prospect",
        verplicht: false,
        uitleg:
          "'Wat heb je nog nodig om te beslissen?' Of: 'Wat is voor jou het belangrijkste punt om helder te krijgen?' Beide werken.",
      },
      ...afsluitStappen(19),
    ],
    faseDoel: "Een warme prospect een echte beslissings-vraag gesteld.",
    waarInEleva: [],
    watJeLeert: `Sommige prospects zijn al weken in je pipeline en hebben nog niets besloten. De moedigste vraag in dit vak is 'wat heb je nog nodig om te beslissen?'.

Deze vraag lost vrijwel altijd één van twee dingen op:
- Je krijgt het laatste bezwaar boven tafel (vaak iets concreets dat je kunt wegnemen)
- De prospect is rijp voor de volgende stap, en de vraag geeft hen toestemming om te kiezen

Geen pushen, wel helpen kiezen. Veel mensen blijven hangen tussen ja en nee omdat niemand vraagt: wat houdt je tegen?`,
    waaromWerktDit: {
      tekst:
        "Een closingsvraag in een warm gesprek lost meer beslissingen los dan 10 extra follow-ups. Mensen hebben soms iemand nodig die VRAAGT, niet die blijft delen.",
    },
  },
  {
    nummer: 20,
    titel: "📊 5 types prospects + pipeline-onderhoud",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag20-categoriseer",
        label: "Categoriseer je top-20 prospects in de 5 types",
        verplicht: false,
        actieRoute: "/namenlijst",
      },
      ...afsluitStappen(20),
    ],
    faseDoel: "Top-20 prospects gecategoriseerd. Energie-budget voor volgende week gepland.",
    waarInEleva: [{ actie: "Naar je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" }],
    watJeLeert: `Vijf types prospects (Eric Worre's classificatie):

1. ACTIEF ZOEKEND: zoeken nu naar iets nieuws. Direct presentatie of 3-weg, vandaag liefst. Hun moment is NU.
2. OPEN: niet actief zoekend, wel nieuwsgierig als jij iets brengt. Rapport bouwen, 3 tot 5 contactmomenten.
3. PRODUCTKOPER: geen business-interesse, wel openstaan voor product. Pivot naar shopper-flow.
4. NIET-NU: interesse aanwezig, leven zit in iets anders. Erkennen, herinnering +3 maanden, warm houden.
5. NOOIT: principiele nee. Erkennen, loslaten als business-prospect, hou warmte als vriend.

Energie-budget volgende week: 70% naar type 1+2, 20% naar type 3, 10% naar type 4. Type 5 = warmte, geen werk-tijd.

Grootste fout: type 5 behandelen als type 2 ('ze gaat ooit ja zeggen'). Tweede fout: type 1 behandelen als type 4 ('ze heeft het druk, ik wacht'). Reageer snel op type 1.`,
    waaromWerktDit: {
      tekst:
        "Mensen die hun prospects categoriseren, halen 3 keer zoveel resultaat met dezelfde lijst. Niet door meer te doen, wel door op de juiste mensen tijd te zetten.",
    },
  },
  {
    nummer: 21,
    titel: "🏆 Skills-opstart klaar, reflectie + sponsor-call",
    fase: 1,
    vandaagDoen: [
      {
        id: "core-dag21-reflectie",
        label: "Vul de eindreflectie in (10 min)",
        verplicht: false,
        actieRoute: "/statistieken",
      },
      {
        id: "core-dag21-doel",
        label: "Stel een doel voor de volgende 19 dagen verankering",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
      },
      {
        id: "core-dag21-call",
        label: "Plan een call met je sponsor om je voortgang te bespreken",
        verplicht: false,
      },
      ...afsluitStappen(21),
    ],
    faseDoel: "Reflectie, doel voor verankering, sponsor-call gepland.",
    waarInEleva: [
      { actie: "Open statistieken", menupad: "Menu, Statistieken", route: "/statistieken" },
      { actie: "Plan sponsor-call", menupad: "Menu, Team", route: "/team" },
    ],
    watJeLeert: `Je hebt nu het fundament. Een werkende webshop, een eigen ritme van content delen, een lijst klanten in opbouw, en de skills om mensen door je flow te leiden.

Dit is geen einde. Dit is je startpunt. De komende 19 dagen ga je VERANKEREN wat je hebt geleerd. Geen nieuwe content, wel het dagelijkse ritme volhouden. Op dag 40 ga je over naar lifetime DMO, en dan blijft het permanent draaien.

Reflecteer eerlijk:
- Wat werkte goed deze 21 dagen?
- Wat liep niet soepel, en waarom?
- Wat ga je de komende 19 dagen anders doen?

Sponsor-call inplannen om dit samen door te lopen. Sponsor kan jouw blinde vlekken zien die jij niet ziet.`,
    waaromWerktDit: {
      tekst:
        "Reflectie op een vast moment maakt het verschil tussen leren-door-doen en herhalen-van-fouten. Sponsors die mee-reflecteren versnellen jouw groei aanzienlijk.",
    },
  },
];

// ============================================================
// Verankerings-fase template (dag 22-40)
// Geen nieuwe content, wel DMO-blok + drie afsluit-stappen.
// ============================================================

export function genereerVerankeringsDag(dagNummer: number): Dag {
  if (dagNummer < 22 || dagNummer > 40) {
    throw new Error(`Verankerings-dag moet tussen 22 en 40 zijn, kreeg ${dagNummer}`);
  }
  const dagInVerankering = dagNummer - 21;
  const totaalVerankering = 19;

  return {
    nummer: dagNummer,
    titel: `🌱 Verankering, dag ${dagInVerankering} van ${totaalVerankering}`,
    fase: 2,
    vandaagDoen: [
      {
        id: `core-dag${dagNummer}-dmo`,
        label: "Pak je dagelijkse acties op via het DMO-blok hieronder",
        verplicht: false,
        uitleg:
          "Geen nieuwe leerstof vandaag. De skills zitten erin, het ritme is wat 't werk doet. Open je DMO-blok en pak op wat past bij je tempo.",
      },
      ...afsluitStappen(dagNummer),
    ],
    faseDoel:
      "Verankering: doe wat je leerde, dag voor dag. Op dag 40 graduation richting lifetime DMO.",
    waarInEleva: [
      { actie: "Open je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" },
      { actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" },
    ],
    watJeLeert: `Je hebt je 21 skill-dagen gedaan. Nu is het oefenen-fase. Geen nieuwe content, wel het dagelijkse DMO-ritme volhouden. Op dag 40 voltooi je de opstart-fase en ga je over naar lifetime DMO.

Je sponsor + Mentor + radar + partner-check blijven beschikbaar voor steun en momentum-checks. Gebruik ze als je vastloopt.`,
    waaromWerktDit: {
      tekst:
        "Skills bouwen zich pas echt in door herhaling. Dag 22 tot 40 is de fase waarin de geleerde technieken automatisch worden.",
    },
  };
}

// ============================================================
// Lifetime-fase template (dag 41+)
// Oneindig dagelijks ritme, geen einde.
// ============================================================

export function genereerLifetimeDag(dagNummer: number): Dag {
  if (dagNummer < 41) {
    throw new Error(`Lifetime-dag moet vanaf 41 zijn, kreeg ${dagNummer}`);
  }

  return {
    nummer: dagNummer,
    titel: `🌿 Lifetime DMO, dag ${dagNummer}`,
    fase: 3,
    vandaagDoen: [
      {
        id: `core-dag${dagNummer}-dmo`,
        label: "Pak je dagelijkse DMO-acties op",
        verplicht: false,
        uitleg:
          "Je opstart-fase is klaar. Dit is het dagelijkse ritme dat blijft draaien. Geen nieuwe content, wel jouw business-praktijk in actie.",
      },
      ...afsluitStappen(dagNummer),
    ],
    faseDoel: "Lifetime DMO. Jouw business loopt nu permanent.",
    waarInEleva: [
      { actie: "Open je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" },
      { actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" },
      { actie: "Open je statistieken", menupad: "Menu, Statistieken", route: "/statistieken" },
    ],
    watJeLeert:
      "Geen nieuwe leerstof. De skills zitten erin, het ritme is van jou. Mentor + sponsor + radar + partner-check blijven beschikbaar voor steun en momentum-checks.",
    waaromWerktDit: {
      tekst:
        "Een business die lifetime is opgebouwd, blijft inkomsten genereren ook als jij minder werkt. Daarvoor was deze hele opstart-fase: jouw vrijheid permanent maken.",
    },
  };
}
