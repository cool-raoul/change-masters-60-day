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
    titel: "🚀 Eerste dag: netwerk + sponsor + eerste warm contact",
    fase: 1,
    vandaagDoen: [
      // Per 2026-05-18: core-dag1-why en core-dag1-dtt zijn verhuisd naar
      // pre-day-1 stap 2 en stap 4. Dag 1 wordt een inhoud-dag.
      {
        id: "core-dag1-vcard-import",
        label: "📲 Importeer je telefooncontacten",
        verplicht: false,
        vereistMobiel: true,
        inlineEmbed: "vcard-upload",
        uitleg:
          "Dit werkt op je telefoon: je geeft ELEVA eenmalig toegang tot je contacten en je hele adresboek staat in beeld. Er wordt niks verstuurd of gedeeld, het is puur voor jouw eigen overzicht. Zo hoef je straks niet alle namen met de hand te typen, je vinkt gewoon aan wie je herkent. Zit je nu op de computer? Sla 'm dan over en doe 'm later even op je telefoon.",
      },
      {
        id: "core-dag1-sponsor-bericht",
        label: "💬 Stuur je sponsor een bericht: 'Ik ben gestart'",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
        uitleg:
          "Laat je sponsor kort weten dat je gestart bent, meer hoeft echt niet. Geen lang verhaal, gewoon 'ik ben begonnen'. Vanaf dat moment kijkt 'ie in ELEVA met je mee en ziet 'ie wanneer het loopt of wanneer je even iets nodig hebt. Je hoeft dit dus niet alleen te doen, en dat scheelt enorm.",
      },
      {
        id: "core-dag1-prepost",
        label: "Heb je al een eigen product-ervaring?",
        verplicht: true,
        inlineEmbed: "prepost-keuze",
        uitleg:
          "Eén keuze die bepaalt hoe jouw eerste post er straks uitziet. Heb je al een product van Lifeplus geprobeerd en daar iets van gemerkt? Dan deel je dat straks eerlijk, dat raakt mensen. Nog geen ervaring? Ook prima, dan deel je je voornemen en bouw je de komende weken je eigen verhaal op. Allebei werken, kies gewoon wat nu bij je past. Twijfel je? Dan sla je 'm voor nu over, de keuze blijft staan.",
      },
      {
        id: "core-dag1-eerste-contact",
        label: "🎯 Stuur vandaag 1 warm contact dat je gestart bent",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "Wacht niet tot alles 'klaar' is, want dat moment komt nooit helemaal. Kies één warm iemand uit je kring en laat gewoon weten dat je ergens mee gestart bent. Niet pitchen, niet verkopen, gewoon delen zoals je dat bij een vriend zou doen. Dit is je eerste win: vanaf dag 1 ben je in beweging in plaats van alleen aan het voorbereiden. Eén berichtje is genoeg.",
      },
      ...afsluitStappen(1),
    ],
    faseDoel: "Netwerk in beeld, sponsor-verbinding gelegd, en eerste echte contact gemaakt.",
    waarInEleva: [
      { actie: "Maak je WHY", menupad: "Menu, Mijn WHY", route: "/mijn-why" },
      { actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" },
      { actie: "Naar je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" },
    ],
    watJeLeert: `Welkom bij Core 💟 Wat bijzonder dat je hier bent.

Je fundament staat. Je WHY, je eerste 5 namen, je Doel-Tijd-Termijn, ze zijn al binnen. Vandaag is je dag van koppelen: je netwerk in beeld, je sponsor in de loop, en je eerste keuze voor hoe je dag 7 ingaat.

VANDAAG, EEN RUSTIG MAAR DUIDELIJK BEGIN

Vier momenten staan open. Geen lange dag, wel een dag waarin je 'm écht zet.

Je telefoonboek importeren. Eén klik en je hele lijst is in beeld. Geen verkooplijst, geen belkost-lijst. Gewoon je netwerk in overzicht, zodat je weet wie er om je heen staat. Familie, oude collega's, sportmaatjes, buren. Filteren komt later, en doe je nooit voor iemand anders.

Je sponsor inlichten. Eén kort berichtje, "ik ben gestart". Geen lang verhaal nodig. Vanaf dat moment kijkt 'ie in ELEVA mee en weet 'ie wanneer het loopt of wanneer er even iets is.

Een keuze maken: pre-post of 21-dagen-post. Heb je al een product van Lifeplus geprobeerd en iets gemerkt? Dan deel je dat eerlijk, en raakt het mensen. Heb je nog geen ervaring? Ook prima, dan deel je je voornemen en bouw je de komende 21 dagen je eigen ervaring op. Beide werken. Het verschil zit in welk soort post je dag 7 plaatst.

Je eerste warm contact vandaag. Niet wachten tot alles 'klaar' is, niet pitchen, niet verkopen. Gewoon één warm contact uit je kring een berichtje sturen dat je gestart bent. Eén persoon. Dat is je eerste win.

JIJ LAAT ZIEN, ZIJ BESLISSEN

De grootste mentale shift in Core: je hoeft niemand binnen te praten, niemand te overtuigen, niemand te laten kiezen voor wat jij wilt. Jouw taak is laten zien wat er is. Zij beslissen. Dat maakt je werk lichter en respectvoller.

WAT ER MORGEN GEBEURT

Dag 2 vul je je Top-20 namenlijst aan, de twintig mensen die spontaan in je hoofd opkomen. Je sponsor heeft een korte kennismakings-call met je staan. Geen verkoop, geen werving. Je netwerk in beeld zodat je weet wie er om je heen staat.

Overweldigd voelen op dag 1 is normaal. Je leert iets nieuws, je stapt uit comfort. Eerst onhandig, dan vaardig. Je sponsor staat naast je, de ELEVA Mentor ook.

Niet alleen. Bouwen mag leuk zijn 💟`,
    waaromWerktDit: {
      tekst:
        "Mensen die op dag 1 hun netwerk binnenhalen, hun sponsor in de loop zetten en die ene eerste warme contact gewoon doen, zetten een fundament neer dat de komende 40 dagen draagt. Wachten tot 'alles klaar' is, is precies waar de meesten in vast lopen.",
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
          "Schrijf twintig namen op die spontaan in je hoofd opkomen, dat is je Top-20. Niet per se je beste klanten, gewoon de mensen die je kent: familie, vrienden, oud-collega's, sportmaatjes, ouders bij school, buren. Zet ook die ene erop waarvan je denkt 'die past nooit', want juist die verrast vaak. Loop in gedachten je dag eens langs (wie spreek je, wie app je, wie kom je tegen), dan komen de namen vanzelf. Lukt twintig niet in één keer? Geen probleem, je vult elke dag aan, je lijst is nooit af. En onthoud: filteren doe je later, en nooit voor een ander, want zij beslissen zelf.",
      },
      {
        id: "core-dag2-telefoon-import",
        label: "Importeer je telefooncontacten",
        verplicht: false,
        vereistMobiel: true,
        inlineEmbed: "vcard-upload",
        uitleg:
          "Op je telefoon zet je met één klik je hele adresboek erbij, zodat je geen namen vergeet die je anders over het hoofd ziet. Je geeft ELEVA eenmalig toegang tot je contacten, en daarna vink je gewoon aan wie je herkent. Er wordt niks verstuurd en niks gedeeld, het is puur jouw eigen overzicht, geen belkostlijst en geen verkooplijst. Dat scheelt je een hoop typen. Zit je nu op de computer? Sla 'm dan over en doe 'm later even op je telefoon, dat werkt het makkelijkst.",
      },
      {
        id: "core-dag2-social-contacten",
        label: "Voeg 3 mensen toe vanuit social media (Instagram/Facebook)",
        verplicht: false,
        actieRoute: "/namenlijst",
        uitleg:
          "Loop je Instagram en Facebook even langs en voeg drie mensen toe die je al een tijdje niet gesproken hebt. Denk aan mensen die jou volgen of die jij volgt, en waar ooit een klik mee zat. Je hoeft ze nu nog niks te sturen, je zet ze gewoon op je lijst zodat ze in beeld blijven voor later. Drie is genoeg voor vandaag, je kunt er elke week een paar bijzetten. Zo groeit je lijst rustig door zonder dat het werk wordt.",
      },
      {
        id: "core-dag2-sponsor-call",
        label: "Plan een kennismakings-call met je sponsor (30 min)",
        verplicht: true,
        uitleg:
          "Plan een half uurtje met je sponsor om elkaar echt even te leren kennen. Dit is geen verkoopgesprek en geen toets, gewoon kennismaken en samen naar je lijst kijken. Jullie pakken er één of twee mensen uit die je deze week als eerste zou willen benaderen, en je sponsor denkt mee over hoe je dat het beste doet. Zo begin je niet vanaf nul in je eentje, maar met iemand naast je die het al een keer heeft gedaan. Stuur 'm gewoon een berichtje om een moment te prikken, dat is de hele stap.",
      },
      ...afsluitStappen(2),
    ],
    faseDoel: "Top-20 namenlijst, telefoonboek en eerste social-contacten in beeld.",
    waarInEleva: [
      { actie: "Naar je namenlijst", menupad: "Menu, Namenlijst", route: "/namenlijst" },
      { actie: "Open je sponsor-chat", menupad: "Menu, Team", route: "/team" },
    ],
    watJeLeert: `Vandaag breng je in beeld wie er eigenlijk om je heen staat 🥰

Niet om iedereen meteen iets te sturen. Wel om te wéten wie er in je kring zit, want zonder dat overzicht ga je rondjes draaien tussen "wie zou ik nou benaderen?" en uiteindelijk niemand. Vandaag haal je het uit je hoofd en zet je het op een rij.

TWEE SOORTEN MENSEN OP JE LIJST

Voor je begint, dit is goed om te snappen. Je Top-20 is geen lijstje van mensen aan wie jij iets wil verkopen. Het is een lijst van mensen die jij op de een of andere manier zou kunnen verrijken met wat jij nu zelf doet.

Dat zijn eigenlijk twee soorten door elkaar. De eerste: mensen waarvan jij denkt dat ze baat zouden kunnen hebben bij een van de producten. Iemand die slecht slaapt, iemand die zich moe voelt, iemand die lekkerder in haar vel wil zitten. De tweede: mensen waarvan jij denkt dat ze het werk zelf misschien zouden willen doen. Een ondernemend type, een mensen-mens, iemand die wel iets extra's kan gebruiken.

Allebei horen ze erop. Je gaat ze straks niet allemaal hetzelfde benaderen, maar je hebt ze nu wel allemaal in beeld nodig.

EERST UITBREIDEN, DAN PAS FILTEREN

De grootste valkuil? In je hoofd al gaan filteren. "Die past nooit", "die heeft geen geld", "die heeft het veel te druk". Stop daarmee 🥰 Dat is jouw oordeel over een ander, en je hebt geen idee wat er bij iemand speelt.

Schrijf eerst gewoon door tot je op twintig namen zit. Familie, vrienden, oud-collega's, oud-klasgenoten, ouders bij school, je sportclub, je hobby, de mensen die je via social volgt. Kom je niet aan twintig? Loop je telefoon en je Instagram even langs, dat zet je geheugen op gang.

Snap je waarom dit zo belangrijk is? Wij horen in ons team echt regelmatig dat juist die ene naam die iemand bijna had weggestreept, de eerste klant of de eerste teamgenoot werd. Filteren komt later, en dat doe je nooit voor een ander. Zij beslissen zelf.

EN DAN JE SPONSOR ERBIJ

Tot slot plan je een half uurtje met je sponsor. Geen verkoop, geen werving, gewoon even echt kennismaken en samen naar je lijst kijken. Jullie kiezen samen één of twee mensen die je deze week als eerste zou willen benaderen, zodat je niet in je eentje hoeft te bedenken waar je begint.

Je hoeft dit namelijk niet alleen te doen. Dat is precies waarom je sponsor er is 🥰

Rustig opbouwen, jij komt er wel 💪🏽`,
    waaromWerktDit: {
      tekst:
        "Een filter zetten op 'wie zou geinteresseerd zijn' is jouw oordeel over een ander. Filteren komt later, en doet jouzelf nooit voor iemand anders. Iedereen mag op de lijst, zij beslissen zelf.",
    },
  },
  {
    nummer: 3,
    titel: "📝 Je natuurlijke gespreksopener uitwerken",
    fase: 1,
    vandaagDoen: [
      // Per 2026-05-18: admin-taken (webshop, krediet, teams) verhuisd
      // naar /setup. Dag 3 is nu een inhoud-dag over je gespreksopener.
      {
        id: "core-dag3-opener",
        label: "Schrijf 2 zinnen waarmee je natuurlijk over je werk vertelt",
        verplicht: true,
        actieRoute: "/mijn-zinnen",
        uitleg:
          "Schrijf twee zinnen waarmee je natuurlijk vertelt wat je doet, voor als iemand vraagt 'wat doe jij eigenlijk?'. Eén zin over wat je doet, één over wat het je brengt, meer hoeft niet. Bijvoorbeeld: 'Ik ben sinds kort gestart met hoogwaardige supplementen, en ik vind het leuk om te zien wat het mensen brengt.' Schrijf 'm zoals jij echt praat, niet zoals een folder. Het hoeft niet meteen perfect, je gaat 'm de komende dagen toch nog bijschaven. Twijfel je over de woorden? De Mentor helpt 'm naar jouw stem te schrijven.",
      },
      {
        id: "core-dag3-mentor-hulp",
        label: "Vraag de Mentor om feedback op je opener",
        verplicht: false,
        actieRoute: "/coach",
        uitleg:
          "Plak je twee zinnen bij de Mentor en laat 'm meedenken. Hij schaaft de woorden bij en geeft je een paar varianten, zonder dat het zijn taal wordt in plaats van die van jou. Lees het daarna hardop terug: voelt het als iets dat jij echt zou zeggen? Zo niet, pas het aan tot het klopt. Het hoeft niet perfect, het moet vooral authentiek voelen, zodat het straks vanzelf uit je mond komt.",
      },
      ...afsluitStappen(3),
    ],
    faseDoel: "Eén korte natuurlijke gespreksopener op papier en in praktijk.",
    waarInEleva: [
      { actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" },
      { actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" },
    ],
    watJeLeert: `Vandaag schrijf je je eigen opener 🥰

Twee zinnen die je natuurlijk uit je mond rollen als iemand vraagt "wat doe jij eigenlijk?". Geen verkooppraatje, gewoon hoe jij erover vertelt. Dat moment komt vaker dan je denkt, en je wil dan niet staan haperen.

EÉN ZIN OVER WAT JE DOET, EÉN OVER WAT HET BRENGT

Je hoeft je hele verhaal niet in twee zinnen te proppen. Eén zin over wat je doet, één over wat het je brengt. Bijvoorbeeld:

"Ik ben sinds kort gestart met hoogwaardige supplementen, en ik vind het leuk om te zien wat het mensen brengt."

Of:

"Ik ben aan het opbouwen naast m'n werk, een eigen webshop waar mensen advies op maat krijgen."

Allebei werken. Het verschil zit in jouw stem, niet in mooie woorden.

WAAROM JUIST NU

Snap je waarom dit zo vroeg op je pad staat? Zonder opener loop je vast op het moment dat iemand het vraagt, en dan voelt het ongemakkelijk. Mét een opener komt het rustig en natuurlijk naar buiten. Vandaag werk je 'm uit en schaaft de Mentor 'm met je bij. Morgen ga je 'm gewoon eens gebruiken.

Bouwen mag leuk zijn 💟`,
    waaromWerktDit: {
      tekst:
        "Mensen die hun opener eenmalig op papier hebben, voelen zich 4× rustiger wanneer iemand er natuurlijk om vraagt. Geen 'wat zeg ik nu?', wel een vertrouwde paar zinnen klaar.",
    },
  },
  {
    nummer: 4,
    titel: "📊 Het commissieplan begrijpen",
    fase: 1,
    vandaagDoen: [
      // Per 2026-05-18: bestellinks + productadvies-test verhuisd naar
      // /setup (admin-rail). Commissie-plan-kennis (geen admin) blijft
      // op dag 4, gekoppeld aan de rank-suggestie die je in pre-day-1
      // bij je DTT hebt gezien.
      {
        id: "core-dag4-commission-plan",
        label: "Lees het korte commissieplan-overzicht",
        verplicht: true,
        uitleg:
          "Lees het overzicht hieronder bij 'wat je leert' rustig door, daar staat de hele rang-ladder van Builder tot Diamond met wat er per stap nodig is. Je hoeft niks uit je hoofd te leren, het gaat erom dat je een gevoel krijgt van hoe je verdient. Kies daarna voor jezelf welke rang je als eerste doel wil, dan weet je waar je naartoe bouwt. Loop je ergens op vast of klinkt iets ingewikkeld? Stel het gewoon aan de Mentor, die legt elk stukje stap voor stap uit.",
      },
      ...afsluitStappen(4),
    ],
    faseDoel: "Basis-kennis van het commissieplan: welke rank wil jij?",
    waarInEleva: [],
    watJeLeert: `Vandaag snap je hoe je eigenlijk verdient 🥰

Je hoeft geen rekenwonder te worden, wel een helder beeld te krijgen van hoe het geld werkt en welke stap jij als eerste wil zetten. Want als je weet waar je naartoe bouwt, worden al je keuzes onderweg een stuk makkelijker.

DE RANG-LADDER IN ÉÉN OOGOPSLAG

Builder (eigen IP 40, totaal 1500): je bouwsteen, geen vast bedrag, maar wel de sleutel tot duplicatie.
Bronze (eigen IP 100, totaal 3000, 3 members): vanaf 300 tot 600 euro per maand.
Silver (eigen IP 100, totaal 6000, 6 members): vanaf 600 euro per maand.
Gold (eigen IP 150, totaal 9000, 9 members): vanaf 900 euro per maand.
Diamond (eigen IP 150, totaal 15000, 12 members in verschillende lijnen): vanaf 1200 euro per maand.

Met "totaal" bedoelen we wat er in je eerste drie levels gebeurt: jouw eigen bestelling, plus alle members en shoppers daaronder. Die members hoeven niet per se in level 1 te zitten, ze mogen ook dieper hangen.

GEEN PLAFOND, WEL EEN VANAF

Belangrijk om te onthouden: deze bedragen zijn een vanaf, geen plafond. Een Diamond kan ook ver boven die 1200 euro uitkomen, afhankelijk van hoe diep je team dupliceert. Het complete plan met alle percentages staat in de kennisbank, en de Mentor legt elk stukje rustig uit als iets niet helder is.

Snap je waarom dit nu al belangrijk is? Mensen die vroeg snappen hoe ze verdienen, kiezen scherpere doelen en houden het langer vol. Niet weten hoe het werkt is juist een van de redenen waarom mensen in maand twee afhaken.

Kies vandaag welke rang jouw eerste doel is 💪🏽`,
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
        uitleg:
          "Vraag de Mentor welke vijf producten voor jou en jouw mensen het meest voor de hand liggen. Vertel 'm gerust wie er in jouw kring zitten (iemand met slaap, met energie, met iets hormonaals), dan denkt 'ie gericht mee. Hij kent alle details, dus jij hoeft alleen een gevoel te krijgen van de hoofdlijnen en voor wie ze passen. Zo weet je straks wat je noemt als iemand iets vraagt, zonder dat je alles paraat hoeft te hebben.",
      },
      {
        id: "core-dag5-eigen-pakket",
        label: "Bestel je eigen pakket als je dat nog niet hebt",
        verplicht: false,
        uitleg:
          "Je eigen ervaring is je sterkste verhaal, want mensen voelen het verschil tussen iemand die iets zelf gebruikt en iemand die het van papier kent. Bestel een basis-supplement of een programma waar je zelf nieuwsgierig naar bent, niet om te verkopen maar om het echt te ervaren. Na een paar weken heb je je eigen verhaal: wat merk je, wat is er anders? En als bonus telt je eigen bestelling meteen mee voor je volume richting Builder. Heb je al een pakket? Dan vink je deze gewoon af.",
      },
      ...afsluitStappen(5),
    ],
    faseDoel: "Basis-overzicht van producten en voor wie ze passen.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Vandaag krijg je grip op de producten, zonder dat je een wandelende catalogus hoeft te worden 🥰

Niemand verwacht dat je alles uit je hoofd kent. De Mentor kent elk detail. Wat jij wel wil, is een gevoel van de hoofdcategorieën, zodat je weet dat iets bestaat en wanneer je het noemt.

DE HOOFDCATEGORIEËN

Grofweg zijn er de basis-supplementen (je dagelijkse aanvulling), omega-3 en antioxidanten, en daarnaast de programma's: Reset, darm-balans, stress-vermindering, hormonale balans, sport-herstel. Je hoeft niet te weten wat er precies in zit, wel voor wie elk stukje interessant kan zijn.

JOUW EIGEN ERVARING IS DE SLEUTEL

Snap je waarom je eigen gebruik zoveel waard is? Mensen voelen het verschil tussen iemand die iets zelf gebruikt en iemand die het van papier kent. Eén of twee producten die jij zelf doet, geven je de natuurlijke taal om erover te praten, zonder dat het een verkooppraatje wordt.

Heb je nog geen eigen pakket? Overweeg er vandaag een te bestellen, niet om te verkopen maar om te ervaren. En als bonus telt je eigen bestelling mee voor je volume 💪🏽`,
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
          "Schrijf in drie of vier zinnen hoe je je webshop natuurlijk introduceert, zoals je het tegen iemand uit je kring zou zeggen. Bijvoorbeeld: 'Ik ben sinds kort gestart met hoogwaardige supplementen, ik heb m'n eigen webshop, ik stuur 'm je gerust door als je wil rondkijken.' Geen pitch, geen druk, gewoon een uitnodiging om te kijken. Denk aan één concrete persoon terwijl je 'm schrijft, dan komt de toon vanzelf goed. De Mentor helpt 'm scherper maken terwijl jij 'm jouw houdt.",
      },
      {
        id: "core-dag6-delen",
        label: "Deel je webshop met 2 mensen uit je lijst (rustig, geen pitch)",
        verplicht: false,
        actieRoute: "/namenlijst",
        uitleg:
          "Stuur je net geschreven introductie naar twee mensen uit je lijst bij wie het natuurlijk voelt. Rustig en zonder pitch, iets als 'ik dacht aan je, hier kun je rondkijken als je wil'. Het doel is niet verkopen vandaag, het doel is je eerste keer delen zodat de drempel eraf gaat. Kies twee mensen waarbij je je op je gemak voelt, dan is die eerste keer meteen minder spannend. Twee is genoeg, morgen is er weer een dag.",
      },
      ...afsluitStappen(6),
    ],
    faseDoel: "Jouw natuurlijke webshop-introductie op papier en in praktijk.",
    waarInEleva: [{ actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" }],
    watJeLeert: `Vandaag leer je je webshop delen op een manier die nooit als verkoop voelt 🥰

Je webshop delen is geen koud praatje. Het is een natuurlijk antwoord op een vraag die je vaker krijgt dan je denkt: "waar haal jij je supplementen?" of "wat doe jij voor je energie?". Op zulke momenten wil je niet zoeken naar woorden, je wil gewoon iets klaar hebben staan.

JOUW INTRODUCTIE, IN JOUW STEM

Vandaag schrijf je een korte introductie van drie of vier zinnen die past bij hoe jij met deze mensen praat. Bijvoorbeeld: "Ik ben sinds kort gestart met hoogwaardige supplementen, ik heb m'n eigen webshop, ik stuur 'm je gerust door als je wil rondkijken." Geen pitch, gewoon een uitnodiging om te kijken.

EN DAN GEWOON EVEN DOEN

Snap je waarom we 'm meteen ook delen? Een introductie die op papier blijft staan helpt niemand. Door 'm vandaag rustig naar twee mensen te sturen gaat de drempel eraf, en merk je dat het veel minder spannend is dan je dacht. De Mentor helpt 'm scherper maken, jij houdt 'm authentiek.

Klein beginnen, dat is precies goed 💪🏽`,
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
          "Op dag 1 koos je tussen een pre-post (nog geen eigen resultaat) en een 21-dagen-post (wel ervaring). De Mentor weet jouw keuze en helpt je de post vanuit die richting te schrijven, in jouw stem. Doe een paar rondjes samen tot 'ie goed voelt, en bewaar 'm voor morgen, dan plaats je 'm. Denk aan dat ene persoonlijke moment: wat raakte jou, wat trok je over de streep? Dat is waar mensen op reageren, niet de productfeiten.",
      },
      {
        id: "core-dag7-reactie-script",
        label: "Zet je reactie-script klaar voor wanneer mensen reageren",
        verplicht: false,
        actieRoute: "/scripts",
        uitleg:
          "Zodra je post live staat komen er reacties en likes, en dan wil je niet verrast worden met 'wat zeg ik nu?'. Zet daarom nu vast een korte reactie-zin klaar die je naar reageerders kunt sturen. Elke reactie en zelfs elke like is een opening naar een gesprek, dus je wil er snel en rustig op kunnen reageren. De scripts-pagina geeft je een paar voorbeelden om uit te kiezen en in jouw stem te zetten.",
      },
      ...afsluitStappen(7),
    ],
    faseDoel: "Eerste post staat klaar om geplaatst te worden + reactie-script klaar.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Vandaag bereid je je eerste post voor 🥰

Dit is de post die alles in beweging zet. Niet om iets te verkopen, wel om mensen nieuwsgierig te maken en een gesprek te openen. Twee paden, allebei werken, en je koos op dag 1 al welke bij jou past.

PRE-POST, ALS JE NOG GEEN EIGEN ERVARING HEBT

Je deelt je voornemen. "Ik begin vandaag aan iets, en over een paar weken vertel ik je wat ik heb gemerkt." Geen claim, wel spanning en openheid. Dat geeft jou de tijd om je eigen ervaring op te bouwen, en het lokt vanzelf de vraag uit: "wat ga je dan doen?".

21-DAGEN-POST, ALS JE WEL ERVARING HEBT

Je deelt wat je hebt gemerkt. Eerlijk en claim-vrij, dus geen medische beloften. Niet "dit geneest", wel "ik slaap dieper", "ik heb meer pit", "ik voel me lichter". Jouw echte verandering, in jouw woorden.

HET PERSOONLIJKE MOMENT MAAKT HET VERSCHIL

Snap je waarom dat zo werkt? Mensen reageren niet op productfeiten, ze reageren op jou. Wat raakte jou, wat trok je over de streep? Dat ene eerlijke moment is precies waar anderen op aanhaken.

De Mentor schrijft 'm met je mee, vanuit de keuze die je op dag 1 maakte. Ga ervoor, dit is het leuke deel 💪🏽`,
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
          "Zet je eerste post live op Instagram of Facebook, de post die je gisteren met de Mentor hebt voorbereid. Vraag je sponsor of de Mentor om 'm vooraf nog even te checken, dat geeft rust. Probeer 'm niet perfect te maken, gewoon plaatsen, want een geplaatste post werkt en een perfecte die er nooit komt niet. Noteer voor jezelf hoe laat je 'm plaatste, dan weet je wanneer de eerste reacties kunnen komen. Vanaf nu ben je zichtbaar, en dat is precies de bedoeling.",
      },
      {
        id: "core-dag8-reageer-script",
        label: "Bewaar je reactie-script op /mijn-zinnen",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
        uitleg:
          "Bewaar je reactie-zin bij je eigen zinnen, zodat 'ie klaarstaat als de eerste reacties binnenkomen. Zo hoef je niet naar woorden te zoeken op het moment dat het telt, je pakt 'm gewoon terug. Reageer op iedereen die iets laat zien, ook op een kale like, want elke reactie is een opening. Maak 'm wel telkens persoonlijk: één woordje dat laat zien dat je echt naar die persoon kijkt doet wonderen.",
      },
      ...afsluitStappen(8),
    ],
    faseDoel: "Eerste post staat live. Reactief contact-onderdeel in je DMO-blok wordt vanaf nu actief.",
    waarInEleva: [{ actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" }],
    watJeLeert: `Vandaag word je zichtbaar, en dat is een mijlpaal 🥰

Je eerste post gaat live. Vanaf nu ben je niet meer alleen aan het voorbereiden, je staat tussen de mensen. Twee dingen veranderen er, en het is goed om allebei te kennen.

REACTIES EN LIKES KOMEN BINNEN

Zodra je post staat, komt er beweging: reacties, likes, soms een DM. Elke daarvan is een opening naar een gesprek. Reageer op iedereen die iets laat zien, ook op een simpele like, en gebruik je reactie-zin van gisteren. Het reactief-contact-onderdeel in je takenblok hieronder wordt hiervoor actief.

EEN RUSTIG POST-RITME BEGINT

Je hoeft niet elke dag te posten. Wel een ritme dat bij jouw tempo past: lifestyle, een productmoment, een waarde-tip, afgewisseld. Niet perfect, wel regelmatig, want zichtbaar blijven is wat telt.

Snap je waar het echte werk zit? Posts zijn de uitnodiging, maar de gesprekken in de DM's zijn waar het gebeurt. Eric Worre zegt niet voor niets dat het grootste deel van je business in die persoonlijke berichten ontstaat.

Plaats 'm, en blijf in de buurt om te reageren. Je staat nu echt op de kaart 💪🏽`,
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
          "Schrijf een tweede post met de formule van Frazer Brookes: waarde, verhaal, uitnodiging. Eerst iets nuttigs (een tip of inzicht), dan iets persoonlijks (een moment of ervaring), en dan een zachte uitnodiging zoals 'stuur me een DM als je meer wil weten'. Niet meteen pitchen, eerst nieuwsgierig maken. De Mentor denkt graag mee tot 'ie lekker loopt.",
      },
      ...afsluitStappen(9),
    ],
    faseDoel: "Tweede social-post live, Brookes-formule onder de knie.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Vandaag leer je een formule die elke post sterker maakt 🥰

Frazer Brookes vatte het mooi samen: een goede post bestaat uit drie delen. Als je die kent, hoef je nooit meer met een leeg hoofd voor je telefoon te zitten.

DE DRIE DELEN

Waarde: iets nuttigs voor de lezer, een tip, een inzicht, een herkenbaar gevoel. Verhaal: iets persoonlijks of een klein resultaat, eerlijk en in jouw woorden. En een zachte uitnodiging: geen "koop dit", wel iets als "stuur me een DM als je meer wil weten".

WAAROM DE MIX WERKT

Snap je waarom alle drie samen het verschil maken? Een post met alleen waarde voelt als een leraar, een post met alleen verkoop voelt als een marketeer, en daar scrollen mensen langs. De mix van helpen én menselijk zijn leest natuurlijk, en dat is wat aanzet tot reageren.

Oefen vandaag gewoon de formule, je hoeft 'm niet in één keer te perfectioneren. Het gaat erom dat je het patroon leert herkennen. De Mentor denkt graag mee 💪🏽`,
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
        uitleg:
          "Vertel in zo'n zestig seconden wie je was, wat er veranderde, en wie je nu bent. Niet alle details, wel het hart van je verhaal, het stukje dat jou jou maakt. Schrijf het eerst gewoon op zoals je het zou vertellen, ook al is het nog rommelig. Dit is het verhaal dat mensen onthouden, veel meer dan welke productlijst dan ook. De Mentor helpt 'm rond te krijgen en in te korten als je wil.",
      },
      {
        id: "core-dag10-product",
        label: "Schrijf je product-verhaal (60 sec)",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
        uitleg:
          "Vertel kort wat de producten voor jóu doen, claim-vrij. Niet 'dit geneest', wel 'sinds ik dit gebruik merk ik...'. Wat voel je, wat is er anders sinds je begon, hoe lang gebruik je het al? Eerlijk en in jouw woorden, dat raakt mensen meer dan een opsomming van ingrediënten. Twijfel je of een zin claim-vrij is? Leg 'm even langs de Mentor, die houdt de grens voor je in de gaten.",
      },
      {
        id: "core-dag10-business",
        label: "Schrijf je business-verhaal (60 sec)",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
        uitleg:
          "Vertel waarom je dit doet en niet iets anders. Wat trok jou over de streep om een eigen webshop op te bouwen naast of in plaats van een traditioneel pad? Denk aan de vrijheid, de mensen, of het gevoel dat er meer in zat. Een paar zinnen die je drijfveer laten voelen is genoeg. Dit is precies het verhaal dat mensen aanspreekt die zelf ook naar iets op zoek zijn.",
      },
      ...afsluitStappen(10),
    ],
    faseDoel: "Drie korte verhalen op papier, klaar voor social en gesprekken.",
    waarInEleva: [{ actie: "Naar je zinnen", menupad: "Menu, Mijn zinnen", route: "/mijn-zinnen" }],
    watJeLeert: `Vandaag bouw je je grootste kapitaal: jouw drie verhalen 🥰

Een goed verhaal raakt mensen meer dan welke pitch dan ook. Vandaag zet je er drie op papier, elk zo'n zestig tot negentig seconden als je het zou vertellen. Je gebruikt ze straks overal: in posts, in gesprekken, in stories, in je DM-antwoorden.

JE PERSOONLIJKE VERHAAL

Wie was je, wat veranderde, wie ben je nu? Niet alle details, wel het hart ervan. Dit is het verhaal dat mensen onthouden.

JE PRODUCT-VERHAAL

Welke producten doen wat voor jou? Claim-vrij: niet "dit geneest", wel "dit bracht me dit". Wat voel je, wat is er anders sinds je begon?

JE BUSINESS-VERHAAL

Waarom doe je dit, en niet iets anders? Wat trok jou over de streep om een eigen webshop op te bouwen in plaats van een traditioneel pad?

Snap je waarom deze drie zo waardevol zijn? Mensen onthouden verhalen, geen feiten. Met deze drie op papier heb je genoeg voor het grootste deel van je content de komende maanden. De Mentor helpt ze rond te krijgen 💪🏽`,
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
        uitleg:
          "Kies één freebie die past bij de mensen die jij wil bereiken, en bij het verhaal dat jij vertelt. Twijfel je tussen een paar? Vraag je sponsor of de Mentor welke het beste aansluit bij jouw doelgroep, die denken graag mee. Eén goede keuze is genoeg, je hoeft niet alles tegelijk in te zetten. En je kunt later altijd wisselen, dus kies gewoon waar je nu een goed gevoel bij hebt.",
      },
      {
        id: "core-dag11-deel",
        label: "Deel je freebie-link in je posts (intekenplek)",
        verplicht: false,
        uitleg:
          "Plak je freebie-link op een natuurlijke plek in een post, niet als losse 'gratis weggever' maar meeliftend op iets waardevols dat je deelt. Bijvoorbeeld een tip of een herkenbaar verhaal, en dan 'wil je hier meer over? Mijn freebie staat in mijn bio'. Zo komen mensen die meer willen direct in jouw ELEVA-systeem terecht, zonder omweg. Eén keer per week is prima om mee te starten, je hoeft niks te forceren.",
      },
      ...afsluitStappen(11),
    ],
    faseDoel: "Een freebie gekoppeld aan je social-content. Eerste leads via socials.",
    waarInEleva: [{ actie: "Open de Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Vandaag zet je een freebie in als magneet voor nieuwe mensen 🥰

Een freebie is een gratis weggever die echt helpt: een mini-test, een korte film, een recept-kaart, een zelftest. Voor de ander is het waardevol, en voor jou komt diegene meteen netjes in je ELEVA-pipeline terecht.

FREEBIE ALS INTEKENPLEK

In Core gebruiken we de freebie niet als losse "gratis weggever"-post, maar als intekenplek op een goede post: je geeft eerst waarde, en wie meer wil klikt op je freebie-link. Geen omweg via andere tools, mensen landen direct in jouw systeem. Zo bouw je vertrouwen én verzamel je leads, in één beweging.

HOE VAAK?

Snap je waarom we het rustig houden? Een freebie in elke post wordt al snel spammerig. Hoe vaak past bij jouw tempo: rustig is één keer per week meeliftend op een post, wie doorpakt doet er twee of drie. En één goede freebie die je vaker inzet werkt beter dan steeds iets nieuws. De Mentor helpt kiezen welke bij jou past 💪🏽`,
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
        uitleg:
          "Stuur één zorgvuldig bericht aan iemand uit je warme markt die je al een tijdje wilde benaderen. Begin persoonlijk, met iets dat alleen voor deze persoon geldt, en deel dan rustig wat je doet. Niet pushy uitnodigen voor 'een business', wel aanbieden om iets te laten zien als ze nieuwsgierig zijn. De scripts en de Mentor helpen je aan de juiste woorden in jouw toon, kies er een en maak 'm van jezelf.",
      },
      {
        id: "core-dag12-bericht2",
        label: "Stuur bericht 2",
        verplicht: true,
        uitleg:
          "Nog één, naar een ander warm contact. Maak 'm persoonlijk, geen knip-en-plak. Eén regel die laat zien dat het echt aan deze persoon gericht is, doet het meeste werk.",
      },
      {
        id: "core-dag12-bericht3",
        label: "Stuur bericht 3",
        verplicht: true,
        uitleg:
          "En de derde. Drie rustige, persoonlijke berichten op één dag is genoeg. Krijg je niet meteen reactie? Helemaal niet erg, dat hoort erbij, gemiddeld reageert ongeveer één op de vijftien tot twintig. Het gaat om het ritme, niet om vandaag scoren.",
      },
      ...afsluitStappen(12),
    ],
    faseDoel: "Drie warme-markt-uitnodigingen verstuurd. Follow-up-onderdeel in DMO actief.",
    waarInEleva: [{ actie: "Naar scripts", menupad: "Menu, Scripts", route: "/scripts" }],
    watJeLeert: `Vandaag ga je je eerste echte uitnodigingen sturen 🥰

Je warme markt is de plek waar het makkelijkst beweging ontstaat, want daar is al vertrouwen. Het gaat niet om pushy uitnodigen voor "een business", wel om rustig delen wat je doet en aanbieden om iets te laten zien als iemand nieuwsgierig is.

DRIE ZORGVULDIGE BERICHTEN

Vandaag stuur je drie berichten aan mensen die je kent. Niet de hele lijst tegelijk, wel drie die je eigenlijk al een tijdje wilde benaderen. Maak ze persoonlijk, want één regel die laat zien dat het echt aan die persoon gericht is, doet meer dan tien perfecte standaardzinnen. De scripts en de Mentor helpen je aan de juiste woorden in jouw toon.

GEEN REACTIE? HOORT ERBIJ

Snap je waarom je het rustig houdt op drie? Zo blijft elk bericht persoonlijk en raak je niet ontmoedigd. Krijg je niet meteen antwoord, dat is normaal, gemiddeld reageert ongeveer één op de vijftien tot twintig. Vanaf vandaag wordt het follow-up-onderdeel in je takenblok actief, zodat je niemand kwijtraakt in de stilte.

Rustig en persoonlijk, zo werkt het 't beste 💪🏽`,
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
          "Oefen vijf minuten met de Mentor, die speelt een prospect met 'ik heb geen tijd', 'ik wil eerst nadenken' of 'het is te duur'. Jij oefent Feel-Felt-Found: erkennen, een andere kant laten zien, doorvragen. Doe een paar rondes in plaats van één keer, dan ga je het patroon voelen. Bezwaren zijn geen nee, het zijn vragen om geruststelling.",
      },
      ...afsluitStappen(13),
    ],
    faseDoel: "Feel-Felt-Found-techniek geoefend met de Mentor.",
    waarInEleva: [{ actie: "Roleplay met Mentor", menupad: "Menu, Mentor", route: "/coach" }],
    watJeLeert: `Vandaag leer je rustig blijven als er een bezwaar komt 🥰

Een bezwaar voelt vaak als een nee, maar dat is het meestal niet. Het is een vraag om geruststelling. En met één simpele techniek hoef je nooit meer in discussie te gaan: Feel-Felt-Found.

DE DRIE ZINNEN

Feel: "Ik begrijp dat je dat zo voelt." Felt: "Anderen voelden dat in het begin ook." Found: "En wat zij merkten was...". Eerst erkenning, dan een andere kant van het verhaal, dan een vraag terug.

WAAROM HET WERKT

Snap je waarom dit de spanning eruit haalt? Je gaat niet tegenover iemand staan, je gaat ernaast staan. Je erkent het gevoel, je laat zien dat het normaal is, en je opent een nieuwe blik. Geen gevecht, wel een gesprek.

Oefen vandaag vijf minuten met de Mentor, niet één keer maar drie of vier rondes met verschillende bezwaren. Dan ga je het patroon voelen en komt het er straks vanzelf uit 💪🏽`,
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
        uitleg:
          "Stel voor drie warme prospects een opvolg-herinnering in, verspreid over de komende dagen. Op de juiste dag krijg je een seintje, dan stuur je een persoonlijk 'hoe gaat het nu?'. Zo verlies je niemand in de stilte, want het meeste gebeurt pas bij het vierde of vijfde contact. Niet pushen, wel aanwezig blijven.",
      },
      ...afsluitStappen(14),
    ],
    faseDoel: "Drie herinneringen ingesteld voor warme prospects.",
    waarInEleva: [{ actie: "Open herinneringen", menupad: "Menu, Herinneringen", route: "/herinneringen" }],
    watJeLeert: `Vandaag bouw je de gewoonte die de meeste mensen overslaan: opvolgen 🥰

Het grootste deel van je resultaat zit niet in het eerste gesprek, maar in de follow-up. Mensen hebben gemiddeld vier tot zes contactmomenten nodig voordat ze beslissen. Wie alleen één keer iets stuurt en dan wacht, laat het meeste op tafel liggen.

JE HOEFT HET NIET TE ONTHOUDEN

ELEVA houdt voor je bij wie je een tijd niet hebt gesproken. Vandaag stel je voor drie prospects een opvolg-herinnering in. Op de juiste dag krijg je een seintje, en dan stuur je een persoonlijk berichtje. Zo verdwijnt niemand in de stilte zonder dat jij het in je hoofd hoeft te houden.

AANWEZIG, NIET PUSHERIG

Snap je het verschil? Een oprechte "hoe gaat het nu?" op het juiste moment werkt beter dan vijf verkooppogingen achter elkaar. Je blijft gewoon in beeld op een manier die fijn voelt voor de ander. Dat is precies waar follow-up om draait 💪🏽`,
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
        uitleg:
          "Stuur drie bestaande klanten een rustig 'hoe gaat het nu?'-berichtje. Geen aanbod, geen verkoop, gewoon oprechte aandacht. Een klant die zich gezien voelt bestelt vaker uit zichzelf en stuurt anderen jouw kant op. Pak er drie waar je een tijdje niks van hebt gehoord.",
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
          "Maak een korte video van zestig tot negentig seconden over jouw eigen ervaring met een product. Geen medische claims: niet 'dit geneest', wel 'sinds ik dit gebruik merk ik...'. Vertel wat er voor jou veranderde, hoe je je voelt en hoe lang je het al gebruikt. Eerlijk en menselijk, want mensen kopen mensen, geen ingrediënten. De Mentor helpt je met woorden die raken zonder een grens over te gaan.",
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
        uitleg:
          "Loop je namenlijst langs en markeer twee of drie klanten met Builder-energie. Dat herken je aan iemand die nieuwsgierig is naar HOE jij het doet, niet alleen naar wat je verkoopt, die zelf ondernemend is, of die zegt 'misschien moet ik dit ook eens proberen'. Je doet er vandaag nog niks mee, je zet ze gewoon op je radar. Morgen leer je hoe je ze een uitnodiging stuurt.",
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
        uitleg:
          "Bereid voor één klant met Builder-energie een persoonlijk voorstel voor. Iets ontspannens als 'ik zie dat jij hier energie in hebt, heb je er ooit aan gedacht zelf een webshop te openen?'. Geen druk, je biedt gewoon de optie aan. Gebruik wat je over die persoon weet zodat het persoonlijk voelt, niet als standaard-uitnodiging. Versturen mag, maar voorbereiden is genoeg voor vandaag.",
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
          "Stel aan minstens één warme prospect de moedigste vraag van dit vak: 'wat heb je nog nodig om te beslissen?'. Geen druk, je helpt ze gewoon kiezen. Of je krijgt het laatste bezwaar boven tafel (vaak iets concreets dat je kunt wegnemen), of je merkt dat ze klaar zijn voor de volgende stap. Veel mensen blijven hangen tussen ja en nee omdat niemand de vraag stelt.",
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
        uitleg:
          "Loop je top-20 langs en geef elke prospect een van de vijf types: actief zoekend, open, productkoper, niet-nu, of nooit. Zo zie je in één oogopslag waar je tijd het meeste oplevert. De meeste winst zit bij type 1 en 2, dus daar zet je je energie. Type 5 hou je warm als vriend, maar daar werk je niet op. Hieronder bij 'wat je leert' staan de vijf types uitgelegd.",
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
        uitleg:
          "Neem tien minuten om terug te kijken op je eerste 21 dagen. Wat ging goed, wat verraste je, waar zat de meeste weerstand, en waar ben je trots op? Niet om streng voor jezelf te zijn, wel om te zien hoeveel je hebt opgebouwd. Wat je benoemt, onthoud je.",
      },
      {
        id: "core-dag21-doel",
        label: "Stel een doel voor de volgende 19 dagen verankering",
        verplicht: false,
        actieRoute: "/mijn-zinnen",
        uitleg:
          "Zet één doel voor de komende negentien dagen verankering. Geen nieuwe lijst met plannen, één heldere kop waar je naartoe werkt. Concreet en haalbaar, zodat je elke dag weet waarvoor je het doet. De Mentor helpt 'm scherp krijgen.",
      },
      {
        id: "core-dag21-call",
        label: "Plan een call met je sponsor om je voortgang te bespreken",
        verplicht: false,
        uitleg:
          "Plan een call met je sponsor om samen terug te kijken op je eerste 21 dagen en vooruit naar wat komt. Wat ging goed, waar wil je hulp, wat is je doel voor de verankering. Je sponsor ziet je groei van een afstand en kan meedenken waar jij dat zelf lastig vindt. Stuur 'm gewoon een berichtje om een moment te prikken.",
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

  return {
    nummer: dagNummer,
    titel: `🌱 Ritme verankeren`,
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
    titel: `🌿 Lifetime ritme`,
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
