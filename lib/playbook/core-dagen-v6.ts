// File: lib/playbook/core-dagen-v6.ts
//
// Core V6 ankerstappen. 21 zuivere leerstappen, admin-stappen zitten
// in SetupPopup (niet in deze lijst). Volgt de V6-spec uit OVERZICHT-CORE-V6.html.
// Gebruikt de bestaande Dag-type uit lib/playbook/types.ts zodat de bestaande
// vandaag-flow het kan renderen.
//
// Teksten per ankerstap (watJeLeert + faseDoel + waaromWerktDit) zijn in
// 2026-05-22 vooraf-geschreven door Claude in Raoul-en-Gaby-stem op basis
// van kennisbank, scripts-data en V6-document. Raoul reviewt en past aan
// waar nodig via founder-edit-modus op /core-v6/stap/[nummer].
//
// Type-mapping naar bestaand Dag-type:
//   - Dag.nummer = ankerstap-nummer (1-21)
//   - Dag.fase = 1 (Fundament 1-5), 2 (In beweging 6-14), 3 (Business-ritme 15-21)
//   - Dag.faseDoel = korte zin "doel van deze ankerstap"
//   - Dag.watJeLeert = lange uitleg (PLACEHOLDER)
//   - Dag.waaromWerktDit = quote/principe (PLACEHOLDER)

import type { Dag, ControllableTaak, ElevaPad } from "./types";

function afsluitStappenV6(stapNummer: number): ControllableTaak[] {
  return [
    {
      id: `core-v6-stap${stapNummer}-sponsor-checkin`,
      label: "💬 Sluit af met een korte sponsor-checkin",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
      uitleg: `30 sec berichtje naar je sponsor hoe deze ankerstap ging.`,
    },
    {
      id: `core-v6-stap${stapNummer}-momentum-radar`,
      label: "🎯 Open momentum-acties van vandaag",
      verplicht: false,
      inlineEmbed: "momentum-radar",
      uitleg: "Check openstaande acties van vandaag.",
    },
    {
      id: `core-v6-stap${stapNummer}-partner-check`,
      label: "🤝 Check je nieuwe partner(s) vandaag",
      verplicht: false,
      inlineEmbed: "partner-check",
      uitleg: "Voor wie al team heeft. Verbergt zich onzichtbaar bij geen partners.",
    },
  ];
}

// Media per stap loopt via MediaBlokken-component, met namespace
// `core-v6-stap` en paginaId = stap-nummer. Zelfde patroon als Sprint
// (`sprint-dag`). Founder kan op /core-v6 of /core-v6/stap/[nummer] direct
// vanuit edit-modus een video droppen. Geen Films-CMS-slug nodig.

/** Core V6: 21 ankerstappen. Volgnummer = stap-nummer in de UI. */
export const CORE_V6_STAPPEN: Dag[] = [
  // ---------- FUNDAMENT (1-5) ----------
  {
    nummer: 1,
    titel: "🚀 Welkom bij Core, WHY + sponsor + jouw scenario",
    fase: 1,
    faseDoel: "Helder krijgen waarom jij dit doet, je sponsor in de loop, en kiezen welk scenario op jou past.",
    watJeLeert: `Welkom bij Core 💟 Wat bijzonder dat je hier bent.

Dit is anders dan een sprint. Geen 60-dagen-druk, geen "vandaag moet alles". Je werkt op jouw tempo, ankerstap voor ankerstap. Tussendoor loopt een dagelijks ritme mee (de DMO) zodat je richting houdt, maar je ankerstap pak je op wanneer JIJ eraan toe bent.

VANDAAG, EEN RUSTIG BEGIN

Vier dingen zetten we vandaag neer. Geen lange dag, wel een dag waarin het fundament er staat.

**Je WHY samen met de Mentor.** Waarom doe je dit? Niet een mooi verhaal, het echte verhaal. De Mentor stelt vragen, jij praat, en aan het einde staat er één zin die jou over een paar maanden er nog steeds doorheen trekt op een lastige dag.

**Je situatie delen met de Mentor.** In drie tot vijf zinnen: hoe staat je leven nu, hoeveel tijd heb je per dag, wat zoek je hier? De Mentor onthoudt dit en past z'n suggesties straks aan op jouw werkelijkheid, niet op een ideaal.

**Je sponsor inlichten.** Eén kort berichtje, "ik ben gestart". Geen lang verhaal nodig. Vanaf dat moment kijkt 'ie in ELEVA mee en weet 'ie wanneer het loopt of wanneer er even iets is.

**Je scenario kiezen.** Heb je al een product van Lifeplus geprobeerd en iets gemerkt? Dan zit je in scenario A. Heb je nog geen ervaring? Dan zit je in scenario B en bouw je de komende weken je eigen ervaring op. Beide werken. Het verschil zit in wat je straks deelt: jouw resultaat (A) of jouw voornemen (B).

JIJ LAAT ZIEN, ZIJ BESLISSEN

De grootste mentale shift in Core: je hoeft niemand binnen te praten, niemand te overtuigen, niemand te laten kiezen voor wat jij wilt. Jouw taak is laten zien wat er is. Zij beslissen. Dat maakt je werk lichter en respectvoller.

WAT ER STRAKS GEBEURT

Ankerstap 2 vul je je top-20 namenlijst aan en plan je een kennismakings-call met je sponsor. Geen verkoop, geen werving. Je netwerk in beeld zodat je weet wie er om je heen staat.

Overweldigd voelen op stap 1 is normaal. Je leert iets nieuws, je stapt uit comfort. Eerst onhandig, dan vaardig. Je sponsor staat naast je, de ELEVA Mentor ook.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap1-why",
        label: "Maak je WHY samen met de Mentor",
        verplicht: true,
        actieRoute: "/mijn-why",
        uitleg: "De Mentor slaat de WHY op als startpunt van jouw profiel.",
      },
      {
        id: "core-v6-stap1-situatie",
        label: "Vertel de Mentor in 3 tot 5 zinnen je situatie",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Werk, gezin, tijd per dag, wat je nu zoekt.",
      },
      {
        id: "core-v6-stap1-sponsor",
        label: "Stuur je sponsor een berichtje: 'ik ben gestart'",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: "core-v6-stap1-scenario",
        label: "Kies je scenario: A (al eigen resultaat) of B (begin samen)",
        verplicht: true,
      },
      ...afsluitStappenV6(1),
    ],
    waarInEleva: [
      { actie: "Maak je WHY", route: "/mijn-why" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Een sterke WHY houdt je staande op de momenten dat het niet vanzelf gaat. Zonder WHY zoek je iedereen z'n motivatie. Met WHY heb je je eigen kompas, en valt het werk lichter omdat je weet waarvoor.",
      bron: "Simon Sinek (Start With Why), eigen vertaling",
    },
  },
  {
    nummer: 2,
    titel: "👥 Top-20-namenlijst + sponsor-call",
    fase: 1,
    faseDoel: "Een werkende top-20-lijst opzetten en samen met je sponsor de eerste oefen-uitnodiging versturen.",
    watJeLeert: `Vandaag breng je je netwerk in beeld 💟

Niet om straks iedereen te bellen, niet om een verkooplijst aan te leggen. Wel om te weten WIE er om je heen staat. Want zonder dat overzicht ga je rondjes draaien tussen "wie zou ik nou benaderen?" en uiteindelijk niemand.

EERST UITBREIDEN, DAN PAS FILTEREN

Veel mensen beginnen klein omdat ze al gaan filteren in hun hoofd. "Die past nooit", "die heeft geen geld", "die heeft het te druk". Stop daarmee. Schrijf eerst tot je op twintig namen zit. Filteren komt later, en doe je nooit voor iemand anders.

Vier bronnen helpen je daarbij. Familie en directe vrienden. Oude collega's, oud-klasgenoten, oud-buren. Ouders bij school, sportclub, vereniging, hobby. En de mensen die je via social al een tijd volgt of die jou volgen. Spontaan opschrijven, niet redeneren.

**Twintig namen handmatig.** Pen erbij, of je telefoonboek scrollen. Schrijf alles op wat in je hoofd komt, ook degenen waarvan je nu al denkt "die past nooit". Vaak verrassen ze je, en deze stap is voor jouw overzicht, niet voor hen.

**Top-5 markeren.** Van de twintig pak je vijf mensen die spontaan opvallen. Niet "wie zou willen kopen". Wel "wie zou ik dit het liefst gunnen" of "wie heeft hier het meest aan". Dat zijn je top-5.

**FORM-vragen met de Mentor.** Voor je top-5 loop je met de Mentor de FORM-vragen door. Family, Occupation, Recreation, Money. Geen interview-checklist, gewoon "wat weet ik al over deze persoon op die vier vlakken". De Mentor onthoudt dit en kan je later helpen om die persoon RAAK te benaderen, niet generiek.

**Sponsor-call inplannen.** Ongeveer dertig minuten, kennismaking en samen kijken naar je lijst. Niet "wie gaan we bellen", wel "wie ken jij om mij heen, hoe denk jij over deze namen, en welke twee mensen zou jij eerst proberen".

WAAROM TWINTIG, NIET VIJF

Vijf namen is geen netwerk, dat is een verlanglijstje. Twintig dwingt je om buiten je comfort-vijf te kijken. Dat is precies de groep waar de meeste verrassingen zitten.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap2-namen",
        label: "Voeg minimaal 20 namen toe aan je lijst",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "Familie, vrienden, kennissen, collega's, ouders bij school, sportclub, hobby's. Geen filter, ook degenen waarvan je denkt 'die past nooit'.",
      },
      {
        id: "core-v6-stap2-form",
        label: "Loop met de Mentor de FORM-vragen door voor top-5",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap2-sponsor-call",
        label: "Plan kennismakings-call met sponsor (~30 min)",
        verplicht: true,
      },
      ...afsluitStappenV6(2),
    ],
    waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    waaromWerktDit: {
      tekst:
        "De grootste belemmering bij een nieuwe start is niet het werk, het is de illusie dat je weet wie wel en wie niet. Niemand weet dat. De top-20 dwingt je om mensen een eerlijke kans te geven, en in praktijk verrast de helft je.",
      bron: "Eric Worre, Go Pro",
    },
  },
  {
    nummer: 3,
    titel: "📦 Productkennis-basis, voor jezelf, niet om uit je hoofd te kennen",
    fase: 1,
    faseDoel: "Een gevoel hebben van de hoofdcategorieën en de Mentor weet welke producten jij gebruikt.",
    watJeLeert: `Vandaag zet je je productkennis-basis 💟

Belangrijk om vooraf te weten: je hoeft niet alles uit je hoofd te kennen. Niemand verwacht dat van je. De Mentor kent alle producten met alle details, jij hoeft alleen een gevoel te hebben van de hoofdcategorieën.

DRIE DINGEN VANDAAG

**Vragen aan de Mentor: welke producten verkoop ik het meest?** Dat zijn jouw vijf producten om eerst te kennen. Niet alle 80, niet de catalogus uit je hoofd. Vijf hoofdproducten waarvan je weet wat ze doen, voor wie ze passen, en wat een typisch gebruik is.

**Bestel je eigen pakket als je dat nog niet hebt.** Niet om te verkopen, om te ervaren. Mensen voelen het verschil tussen iemand die het zelf gebruikt en iemand die het van papier kent. Je eigen ervaring is wat straks geloofwaardig maakt.

**Vertel de Mentor welke producten jij persoonlijk gebruikt.** Dit lijkt klein, maar is goud. De Mentor onthoudt dit, en wanneer een prospect straks vraagt "wat gebruik jij zelf?", weet de Mentor het en kan 'ie meedenken over jouw resultaat-post, jouw verhaal, jouw zinnen.

WAAROM DIT WERKT

Mensen kopen geen producten. Mensen kopen veranderingen die ze in jou zien. Daarom hoef je geen wandelende encyclopedie te zijn. Wel iemand die kan zeggen "dit gebruik ik zelf, dit merkte ik, en dit gun ik jou ook".

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap3-vraag-mentor",
        label: "Vraag de Mentor: welke 5 producten verkoop ik het meest?",
        verplicht: false,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap3-eigen-pakket",
        label: "Bestel je eigen pakket als je dat nog niet hebt",
        verplicht: false,
      },
      {
        id: "core-v6-stap3-mentor-context",
        label: "Vertel de Mentor welke producten jij persoonlijk gebruikt",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(3),
    ],
    waarInEleva: [{ actie: "Open de Mentor", route: "/coach" }],
    waaromWerktDit: {
      tekst:
        "De Mentor doet het zware geheugenwerk, jij draagt je eigen ervaring. Die twee samen zijn sterker dan een Mentor met alle kennis en een member zonder verhaal.",
    },
  },
  {
    nummer: 4,
    titel: "🎯 De webshop-pivot, vier bouwstenen + jouw eigen zin",
    fase: 1,
    faseDoel: "Begrijpen waarom de webshop het frame is, de vier bouwstenen leren, en je eigen versie schrijven.",
    watJeLeert: `Vandaag het hart van Core 💟

Tot nu was alles voorbereiding. Vanaf nu ga je leren hoe je iemand uitnodigt zonder dat het pushy voelt. De truc zit in één pivot: de WEBSHOP staat centraal, niet het verkopen.

WAAROM DE WEBSHOP ALS FRAME

Mensen zijn allergisch voor "wil je iets bij mij kopen". Maar mensen zijn nieuwsgierig naar "een webshop waar je je producten gratis krijgt en eventueel inkomen mee opbouwt, zonder voorraad en zonder risico". Hetzelfde verhaal, een ander frame, en het ene werkt en het andere niet.

DE VIER BOUWSTENEN VAN EEN STERKE WEBSHOP-UITNODIGING

Elk bericht dat goed werkt, heeft deze vier ingredienten. Niet alle vier even prominent, wel allemaal aanwezig.

**1. Het haakje.** Een opener die persoonlijk is voor deze prospect. Hun naam, gedeelde geschiedenis, of een hint over iets wat hen bezighoudt. Geen koud "hoi, hoe gaat het", wel iets dat alleen voor hen klopt.

**2. De manier-gevonden-zin.** Vast onderdeel, vast werkend: "Ik heb een manier gevonden om online extra inkomsten op te bouwen zonder investeringen en zonder risico." Geen claim, geen belofte, wel een uitnodiging om te kijken.

**3. Hoe het werkt, kort.** Een of twee zinnen over de webshop. "Je krijgt een gratis eigen webshop, je zet je producten erop, en je kunt direct beginnen met delen." Geen lange uitleg, wel een beeld dat klopt.

**4. De permissie-vraag.** Concreet, niet open afsluiten. "Mag ik je kort laten zien hoe het werkt?" of "Sta je open om te kijken wat het is? Helemaal vrijblijvend, als het niets voor je is is dat ook prima."

VANDAAG GA JE

**De vier bouwstenen doorlopen met de Mentor.** Hij stelt je vragen, jij oefent met je eigen woorden per bouwsteen.

**De 14 webshop-scripts openen samen met de Mentor.** Niet woordelijk overnemen. Wel inspiratie pakken om je eigen versie te bouwen, met jouw stem.

**Schrijf je eigen webshop-uitnodigingszin.** Drie tot vier regels, in jouw woorden, voor jouw stijl. De Mentor leert hiermee jouw stijl, en kan je later helpen om varianten te maken voor specifieke prospects.

WAT JE NIET MOET DOEN

Niet kopieren van scripts. Niet "iemand die het bij iedereen gebruikt". Wel jouw versie, jouw stem, jouw bouw. Pas dan straalt geloofwaardigheid eruit.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap4-bouwstenen",
        label: "Loop met de Mentor de vier uitnodig-bouwstenen door",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap4-scripts",
        label: "Open de 14 webshop-scripts samen met de Mentor",
        verplicht: true,
        actieRoute: "/scripts",
      },
      {
        id: "core-v6-stap4-eigen-zin",
        label: "Schrijf je eigen webshop-uitnodigingszin (3 tot 4 regels)",
        verplicht: true,
        actieRoute: "/mijn-zinnen",
        uitnodigHelpKnoppen: true,
      },
      ...afsluitStappenV6(4),
    ],
    waarInEleva: [
      { actie: "Naar scripts", route: "/scripts" },
      { actie: "Bewaar je zinnen", route: "/mijn-zinnen" },
    ],
    waaromWerktDit: {
      tekst:
        "Een uitnodiging die werkt is geen verkooptruc, het is een eerlijke uitnodiging in jouw stem die ruimte laat voor een vrij ja en een vrij nee. De webshop-pivot maakt dat respectvol mogelijk.",
    },
  },
  {
    nummer: 5,
    titel: "💡 Verdienmodel-basis, snappen hoe je geld verdient",
    fase: 1,
    faseDoel: "Zelf snappen hoe je geld verdient, niet om uit te leggen, wel zodat je niet onzeker wordt.",
    watJeLeert: `Vandaag krijg je grip op het verdienmodel 💟

Niet om straks tegen prospects op te dreunen, daar zit niemand op te wachten. Wel zodat JIJ weet hoe het werkt, en niet bang wordt als iemand vraagt "ja maar hoe verdien je dan precies?". Eric Worre noemt dit basic understanding, en hij is daar streng in. Als je het zelf niet snapt, werk je in het wilde weg.

VANDAAG TWEE DINGEN

**De prospect-film over het verdienmodel kijken.** Ongeveer tien minuten. Dezelfde film die prospects straks zien als ze meer willen weten. Het is fijn als jij die hebt gezien, ook al ga je 'm zelf niet uitleggen.

**De 3-vragen-quiz met de Mentor doen.** Drie korte vragen waarmee de Mentor checkt of jij snapt hoe het in de basis werkt. Geen examen, geen druk. Als je 'm niet weet, herhaalt hij het rustig.

WAT JE STRAKS WEET

Hoe een commissie op een eerste bestelling werkt. Wat een Builder-rank is en waarom dat het bouwblok is van duplicatie. Wat een team-volume betekent en waarom dat groeit als jij anderen helpt Builder te worden.

Dat is de basis. Niet alles. Wel genoeg om met rust te kunnen zeggen "ja, dat snap ik" als iemand het vraagt. En om in praktijk te zien dat je begeleiding van mensen onder jou waardevoller wordt naarmate ze rangen gaan halen.

NIET MORGEN-LATER MAAR IETS LATER, GEEN HAAST

Je hoeft dit niet vandaag perfect te kennen. Het zakt in tijdens de komende stappen, vooral wanneer je je eerste echte gesprekken hebt. Voor nu is "ik snap globaal hoe het loopt" genoeg.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap5-film",
        label: "Bekijk de prospect-film over het verdienmodel",
        verplicht: true,
      },
      {
        id: "core-v6-stap5-quiz",
        label: "Doe de 3-vragen-quiz met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(5),
    ],
    waarInEleva: [{ actie: "Open de Mentor voor de quiz", route: "/coach" }],
    waaromWerktDit: {
      tekst:
        "Mensen die de basis snappen, durven gesprekken te voeren zonder bang te zijn dat ze iets niet kunnen uitleggen. Niet omdat ze alles weten, wel omdat ze weten waar de Mentor klaarstaat als het echt gevraagd wordt.",
      bron: "Eric Worre, Go Pro",
    },
  },
  // ---------- IN BEWEGING (6-14) ----------
  {
    nummer: 6,
    titel: "📅 Aanloop-stap, jouw eerste publieke moment",
    fase: 2,
    faseDoel: "De eerste social-aanwezigheid neerzetten, in jouw scenario, met de Mentor naast je.",
    watJeLeert: `Vanaf vandaag word je zichtbaar 💟

Tot nu was alles voorbereiding. Vandaag stap je voor het eerst publiek met je verhaal, op de manier die bij jouw scenario past. Twee paden, beide werken.

SCENARIO A, JIJ HEBT AL EEN EIGEN RESULTAAT

Je hebt al een product gebruikt en iets gemerkt. Dan deel je je 21-dagen-resultaat-post.

**Kies de 1 of 2 belangrijkste veranderingen die je voelt.** Niet alles in een post stoppen, dat verwatert. Wel een of twee ankers die voor jou echt voelen.

**Schrijf je 21-dagen-resultaat-post met de Mentor.** Hij stelt vragen, jij vult in. Daar komt een post uit die in jouw stem klopt en die claim-vrij is.

**Plaats de post op Facebook en Instagram.** Niet eerst nog vier keer herschrijven. Klaar is klaar, en de eerste keer mag ook onhandig.

SCENARIO B, JE BEGINT NU JE EIGEN PROGRAMMA

Je hebt nog geen eigen ervaring. Dan deel je een pre-post.

**Schrijf met de Mentor je pre-post (2 tot 3 regels).** Iets als "ik begin vandaag aan 21 dagen X, ben benieuwd wat ik ga merken". Eerlijk, geen belofte.

**Plaats de pre-post.** Idem als boven, klaar is klaar.

**Begin je eigen 21-dagen-programma.** De resultaat-post komt straks in stap 15, met je echte ervaring erbij.

WAT HET MENTOR-PROFIEL LEERT

Vanaf nu weet de Mentor hoe jij over jezelf schrijft op een publiek moment. Welke woorden je kiest, welke kant je opdraait, hoe lang je posts zijn. Dat is goud waard voor latere content-suggesties.

OVER REACTIES VAN MENSEN

Reacties komen of komen niet. Beide is OK. Wat wel telt: reageer binnen een uur op iedere reactie die je krijgt. Niet om de algoritme te masseren, wel omdat het hart van duplicatie zit in laten zien dat je echt contact zoekt, niet bot uitzendt.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap6-keuze-of-resultaat",
        label: "Kies de 1 of 2 belangrijkste veranderingen (A) of schrijf pre-post (B)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap6-plaatsen",
        label: "Plaats de post op Facebook + Instagram",
        verplicht: true,
      },
      ...afsluitStappenV6(6),
    ],
    waarInEleva: [{ actie: "Schrijf met de Mentor", route: "/coach" }],
    waaromWerktDit: {
      tekst:
        "De eerste post is altijd de zwaarste. Niet omdat 'ie ingewikkeld is, wel omdat 'ie publiek is. Wie 'm eenmaal heeft staan, is voorbij de psychologische drempel en bouwt daarna lichter door.",
    },
  },
  {
    nummer: 7,
    titel: "📱 Brookes 3-stappen + jouw eerste freebie",
    fase: 2,
    faseDoel: "Een post leren maken volgens Waarde + Verhaal + Zachte uitnodiging, met je eerste freebie als waarde-anker.",
    watJeLeert: `Vandaag leer je posten op een manier die werkt 💟

De fout die de meeste mensen maken op social: hard verkopen, of alleen lifestyle-foto's plaatsen zonder richting. Beide werkt niet. Wat wel werkt is de Brookes-formule. Drie ingredienten per post, in deze volgorde.

DE BROOKES-FORMULE

**1. Waarde.** Iets dat de lezer iets oplevert ook al doet 'ie verder niks. Een inzicht, een tip, een citaat dat raakt, een vraag die laat nadenken.

**2. Verhaal.** Iets uit jouw eigen leven of werk dat de waarde verankert. Niet abstract, wel persoonlijk. Hoe het bij jou ging, wat je hebt gemerkt.

**3. Zachte uitnodiging.** Niet "koop bij mij", wel "als je hier meer over wilt weten, mijn DM staat open" of "ik heb een gratis gids over dit onderwerp, link in bio". De freebie wordt hier de natuurlijke aansluiting.

WAAROM EEN FREEBIE NU IN BEELD KOMT

Een directe webshop-link is een grote ja. Een freebie downloaden is een kleine ja. Mensen die geinteresseerd zijn maar nog niet "klaar" voor de webshop, kun je via een freebie wel binnenhouden. Ze geven hun naam en mail, krijgen jouw waarde, en komen via Mini-ELEVA in een zachte opvolg-flow zonder dat jij elke week handmatig moet sturen.

VANDAAG GA JE

**De freebie-toolkit openen en 1 freebie kiezen die bij jouw verhaal past.** Vijf tot tien kant-en-klare freebies van Raoul en Gaby, claim-vrij geschreven, automatisch gepersonaliseerd met jouw webshop-link. Je hoeft 'm dus niet zelf te maken, je kiest welke past.

**Een post schrijven met de Brookes-formule, Mentor geeft feedback.** Korte iteratie, geen perfectie. Een goede eerste post is beter dan een nooit-geplaatste perfecte post.

**De post plaatsen, met je freebie-link erbij.** In de tekst of in je bio. Beide werkt, en straks zie je in je dashboard hoeveel opt-ins je via deze post krijgt.

EIGEN FREEBIE MAKEN KAN OOK

Voor wie wil: met de Mentor kun je later een eigen mini-pdf of mini-mailreeks samenstellen op basis van jouw niche-zaadje uit stap 8. Voor nu is een toolkit-freebie de snelle ja, en dat is precies wat je nodig hebt vandaag.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap7-freebie",
        label: "Open de freebie-toolkit en kies 1 freebie die bij je past",
        verplicht: true,
        actieRoute: "/instellingen/freebies",
        uitleg:
          "5 tot 10 kant-en-klare freebies van Raoul en Gaby, claim-vrij, automatisch gepersonaliseerd met jouw webshop-link.",
      },
      {
        id: "core-v6-stap7-post",
        label: "Schrijf één post (Brookes-formule), Mentor geeft feedback",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap7-plaatsen",
        label: "Plaats de post met freebie-link in tekst of bio",
        verplicht: true,
      },
      ...afsluitStappenV6(7),
    ],
    waarInEleva: [
      { actie: "Freebie-toolkit", route: "/instellingen/freebies" },
      { actie: "Schrijf met de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Een freebie is geen weggeefactie, het is een bruggetje. Mensen die nog niet klaar zijn voor de webshop, willen vaak wel een gids of een mini-test. Wie zo binnenkomt, blijft veel langer in beeld dan iemand die je een keer een bericht stuurde.",
    },
  },
  {
    nummer: 8,
    titel: "✨ Drie verhalen + eerste niche-zaadje",
    fase: 2,
    faseDoel: "Drie korte verhalen op papier en een eerste idee van wie jouw ideale klant is.",
    watJeLeert: `Vandaag zet je drie verhalen op papier 💟

Drie korte verhalen, elk over een ander aspect van wat jij brengt. Dit is geen schrijfopdracht, dit is voorbereiding voor straks. Want zodra je social gaat oppakken (stap 12 met Stories, en later de uitbreiding-module), put je uit deze drie.

DRIE VERHALEN, DRIE LIJNEN

**1. Persoonlijk verhaal.** Wie was je een paar jaar geleden, wat veranderde, en waar sta je nu? Niet de fantasieversie. Wel het echte verhaal met de momenten die jou hebben gevormd. Hoeft niet dramatisch, wel waarachtig.

**2. Product-verhaal (vanuit webshop-frame).** Hoe ben je in contact gekomen met Lifeplus, wat ervaarde je zelf, en waarom werd het meer dan alleen "ik gebruik wat producten"? De webshop is hier het anker, niet het product zelf.

**3. Business-verhaal.** Wat trekt jou in dit pad? Niet "ik wil rijk worden", wel "vrijheid om wat met mijn tijd te doen", "dichter bij m'n kinderen", "andere mensen helpen op een schaalbare manier". Wat is jouw waarom achter het werken?

VANDAAG GA JE

**Persoonlijk verhaal schrijven met de Mentor.** Hij stelt vragen, jij vult in. Tien tot vijftien minuten.

**Product-verhaal schrijven met de Mentor.** Idem, en de Mentor zorgt dat het claim-vrij blijft (geen "het genas mijn klachten", wel "ik merkte X").

**Business-verhaal schrijven met de Mentor.** Wat trekt jou hieraan, en wat zou je willen dat anderen hierin gaan voelen.

**Niche-zaadje + passies met de Mentor.** Vijf minuten praten over de vraag "wie was ik vroeger, wat veranderde, en welke onderwerpen raken mij persoonlijk?". De Mentor noteert dit als jouw niche-zaadje. Pas niet definitief, wel een eerste richting waar jij straks meer over wilt vertellen dan over willekeurige onderwerpen.

WAT DIT JOU OPLEVERT

Vanaf nu hoef je niet meer te bedenken "wat moet ik schrijven". Je hebt drie verhalen waaruit je kunt putten, en een niche-richting waar jouw passie zit. Dat is de helft van het content-werk dat anderen onder dwang moeten doen.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap8-persoonlijk",
        label: "Schrijf je persoonlijke verhaal",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap8-product",
        label: "Schrijf je product-verhaal (vanuit webshop-frame)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap8-business",
        label: "Schrijf je business-verhaal",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap8-niche",
        label: "Praat 5 min met de Mentor over je niche-zaadje + passies",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(8),
    ],
    waarInEleva: [{ actie: "Schrijf met de Mentor", route: "/coach" }],
    waaromWerktDit: {
      tekst:
        "Wie zijn eigen drie verhalen kent, hoeft niet bij elke post na te denken wat 'ie moet zeggen. De drie verhalen worden de bron, en jij hoeft alleen nog te kiezen welk verhaal vandaag passend is.",
    },
  },
  {
    nummer: 9,
    titel: "💬 Eerste warme uitnodigingen + Mini-ELEVA",
    fase: 2,
    faseDoel: "Drie warme uitnodigingen versturen en kennismaken met Mini-ELEVA als opvolg-pad.",
    watJeLeert: `Vandaag stuur je je eerste drie uitnodigingen 💟

Eindelijk in actie. Tot nu deed je voorbereidend werk: WHY, lijst, productkennis, webshop-pivot, jouw zin. Vandaag wordt het concreet: drie mensen uit je top-20 krijgen een bericht van je.

GEEN PERFECTIE, WEL VERZENDEN

De eerste drie zijn altijd het zwaarst. Je zit te twijfelen over de exacte zin, het exacte moment, de exacte persoon. Stop daarmee. Eerste keer mag onhandig zijn. Daar leer je van. Pas na drie of vier weet je hoe het voelt.

VANDAAG GA JE

**Bericht versturen naar 3 mensen uit je top-20, met jouw zin uit stap 4.** Niet kopieer-plakken. Wel jouw zin, telkens een beetje afgestemd op wie deze persoon is (de Mentor kent de FORM-context per top-5).

**Bij een ja kies je per prospect: 3-weg of Mini-ELEVA.** Dat doen we straks samen met de prospect-kaart. Wat doe je vandaag: even kennismaken met Mini-ELEVA, zodat je weet hoe het werkt.

**Zet je eerste prospect die ja zei in Mini-ELEVA.** Je ziet meteen hoe de klantomgeving eruitziet vanuit het perspectief van een prospect, en wat ELEVA voor jou overneemt qua pulse-momenten.

WAT MINI-ELEVA IS

Een lichte versie van ELEVA voor prospects. Geen volledig leerpad, wel een omgeving waar ze welkom worden, films krijgen die bij hun vraag passen, een Mentor hebben die zachte vragen stelt, en waar ze in hun eigen tempo kunnen kijken of het iets voor hen is. Jij wordt ontlast en de prospect voelt geen druk.

REACTIES

Wat je krijgt is wat je krijgt. Soms ja, soms nee, soms "misschien later". Allemaal goed. Reageer binnen een uur op elke reactie, ook op de nee'en. Vriendelijk en kort. Dat is dezelfde respect-grond als waarmee je opent.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap9-drie-namen",
        label: "Stuur bericht naar 3 mensen, gebruik je zin uit Stap 4",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitnodigHelpKnoppen: true,
      },
      {
        id: "core-v6-stap9-mini-eleva",
        label: "Zet je eerste prospect die ja zei in Mini-ELEVA",
        verplicht: true,
      },
      ...afsluitStappenV6(9),
    ],
    waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    waaromWerktDit: {
      tekst:
        "De eerste drie uitnodigingen zijn de duurste in tijd, omdat je nadenkt over alles. De volgende dertig kosten samen minder mentale ruimte dan die eerste drie. Daarom is verzenden vandaag belangrijker dan perfect formuleren.",
      bron: "Eric Worre, Go Pro",
    },
  },
  {
    nummer: 10,
    titel: "💪 3-weg-meesterclass, 5 stappen die werken",
    fase: 2,
    faseDoel: "De vijf stappen van een 3-weg-gesprek leren en scripts klaar hebben voor je eerstvolgende.",
    watJeLeert: `Vandaag leer je de krachtigste hefboom: het 3-weg-gesprek 💟

Een 3-weg is geen truc, het is de combinatie van autoriteit (je sponsor) + verbinding (jij) + sociaal bewijs (zichtbaarheid dat jullie samenwerken) in een kort gesprek. Voor warme prospects is het de snelste weg van interesse naar beslissing zonder dat het pushy voelt.

WAAROM HET WERKT

Jouw warme prospect kent JOU, maar weet niet alles van Lifeplus. Je sponsor weet alles van Lifeplus, maar kent jouw prospect niet. Samen in een gesprek geeft elk van jullie de helft. Voor de prospect voelt het als kennismaken met een expert via een vertrouwde introductie. Dat is iets heel anders dan een verkoper laten bellen.

DE VIJF STAPPEN

**1. Edification.** Jij introduceert je sponsor met respect en bevattelijk. "Ik wil je voorstellen aan iemand die al X jaar mensen helpt met Y, en degene die mij heeft geholpen met Z." Geen overdrijving, wel oprecht.

**2. Korte intro van de prospect.** Sponsor stelt zich kort voor, en vraagt prospect "wat trekt je het meest aan in wat Jan / Marieke je vertelde?" Open begin.

**3. Inhoud + ervaring + vragen.** Sponsor vertelt het kader, geeft eigen verhaal, en houdt ruimte voor vragen. Jij blijft erbij, knikt of vult aan, maar laat sponsor leiden.

**4. Vraag aan de prospect.** "Wat denk je nu? Klinkt dit als iets dat je verder wilt verkennen?" Concreet, niet open afsluiten met "denk er nog maar over".

**5. Vervolgafspraak of volgende stap.** Wat de uitkomst ook is, je sluit af met een concrete vervolgactie. Een tweede gesprek inplannen, samen iets bekijken, of een vriendelijke afsluiting bij een nee.

VANDAAG GA JE

**De meesterclass-film over 3-weg bekijken.** Ongeveer tien minuten.

**Met de Mentor de 5 stappen doorlopen voor één specifieke prospect.** Dus niet in theorie, wel concreet voor iemand die jij in gedachten hebt. De Mentor heeft de scripts per stap klaar.

**Je eigen edification-zin over je sponsor schrijven.** Dit is een herbruikbare zin die je voor elke 3-weg kunt gebruiken (of in varianten). Bewaar 'm in je zinnen-bibliotheek.

**Sponsor vragen of 'ie beschikbaar is voor jouw eerstvolgende 3-weg.** Geen specifieke datum nodig, wel "ben je deze week beschikbaar als ik er een prospect klaar voor heb?".

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap10-film",
        label: "Bekijk de meesterclass-film over 3-weg-gesprek",
        verplicht: true,
      },
      {
        id: "core-v6-stap10-mentor-walkthrough",
        label: "Loop met de Mentor de 5 stappen door voor één prospect",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap10-edification",
        label: "Schrijf je eigen edification-zin over je sponsor",
        verplicht: true,
        actieRoute: "/mijn-zinnen",
      },
      ...afsluitStappenV6(10),
    ],
    waarInEleva: [{ actie: "Bewaar je zinnen", route: "/mijn-zinnen" }],
    waaromWerktDit: {
      tekst:
        "Een 3-weg-gesprek is geen verkooptechniek, het is een eerlijke combinatie: jij brengt de verbinding, je sponsor brengt de kennis, en de prospect krijgt zonder druk een compleet beeld. Drie ingredienten waar geen van drieen los hetzelfde effect heeft.",
    },
  },
  {
    nummer: 11,
    titel: "🤝 Je eerstvolgende 3-weg starten",
    fase: 2,
    faseDoel: "Een echte 3-weg starten met een warme prospect, samen met je sponsor.",
    watJeLeert: `Vandaag stop je met theorie en begin je in de praktijk 💟

Een eerste 3-weg voelt onhandig. Dat is normaal. De vijfde voelt natuurlijk. Daar zit dezelfde leercurve in als bij alle vaardigheden waar je publiek moet zijn: eerst stuntelig, dan vaardig. Pas in de praktijk leer je het echt.

VANDAAG GA JE

**Eén warme prospect kiezen die nog geen 3-weg heeft gehad.** Liefst iemand uit je top-20 die al heeft gereageerd op je eerste uitnodiging, of zelfs nog niet, maar waarvan jij voelt "die zou hier echt iets aan kunnen hebben".

**Stap 1 van de 5 sturen: introductie naar sponsor, volgens script.** In /scripts vind je het exacte script-blok voor stap 1. Niet woordelijk overnemen, wel als sjabloon gebruiken en in jouw stem zetten.

**De vijf stappen samen met je sponsor doorlopen.** Datum en tijd plannen, en het doen. Het gesprek mag echt zijn, niet een rollenspel. De prospect weet niet beter dan dat 'ie jou en je sponsor spreekt.

**Na afloop kort reflecteren met de Mentor.** Wat ging goed, wat liep onhandig, wat zou je een volgende keer anders doen. De Mentor noteert dit zodat hij volgende 3-weg je sterker kan voorbereiden.

OVER UITKOMSTEN

Een 3-weg eindigt of in een ja, een nee, of een "ik wil er nog over nadenken". Allemaal goede uitkomsten. Wat geen goede uitkomst is: een 3-weg waarvan jij na afloop denkt "dat had ik niet moeten doen". Daarom doe je 'm samen met je sponsor: je hebt altijd iemand naast je die het kader bewaakt.

WAT HET MENTOR-PROFIEL LEERT

Bij elke 3-weg leert de Mentor meer over welk type prospect bij jou tot ja komt, welk type tot nee, en welke vragen telkens terugkomen. Dat scherpt je voorbereiding voor de volgende keer.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap11-kies",
        label: "Kies 1 warme prospect die nog geen 3-weg heeft gehad",
        verplicht: true,
      },
      {
        id: "core-v6-stap11-stap1",
        label: "Stuur stap 1 (introductie naar sponsor) volgens script",
        verplicht: true,
        actieRoute: "/scripts",
      },
      {
        id: "core-v6-stap11-reflectie",
        label: "Doe na afloop een korte reflectie met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(11),
    ],
    waarInEleva: [{ actie: "Naar scripts", route: "/scripts" }],
    waaromWerktDit: {
      tekst:
        "De eerste 3-weg telt voor tien voorbereidingsuren. Daarna wordt het lichter, omdat je weet hoe het verloopt. Wachten tot je 'klaar' bent voor de eerste, is de plek waar bijna iedereen vastloopt.",
    },
  },
  {
    nummer: 12,
    titel: "📸 Stories-ritme + freebie-aankondiging",
    fase: 2,
    faseDoel: "Een dagelijks Stories-ritme oppakken en je freebie zichtbaar maken via Stories.",
    watJeLeert: `Vandaag pak je een Stories-ritme op 💟

Niet om iedereen op Instagram te bereiken, niet om viral te gaan. Wel om dagelijks een klein moment zichtbaar te zijn zodat mensen die jou volgen je geleidelijk zien evolueren. Stories blijft een lichte versie naast je posts, en is precies daarom zo geschikt voor de freebie.

WAAROM STORIES, NIET REELS

Reels vraagt productie, montage, hooks, geluid. Reels komt later in de Uitbreiding-module wanneer je structureel content gaat bouwen. Stories is laagdrempelig, blijft 24 uur staan, en past in een dag die al vol is. Geen perfecte beelden nodig, wel jouw aanwezigheid.

VANDAAG GA JE

**Vandaag minimaal een Story plaatsen.** Wat dan ook. Een foto van iets dat je raakte, een citaat dat je leuk vond, een korte gedachte. Niet over Lifeplus per se. Wel jouw aanwezigheid.

**Een Story plaatsen die je freebie aankondigt.** "Heb ik net deze gids gemaakt over X, link in bio voor wie 'm wil ontvangen". De Mentor heeft een korte tekst in jouw stem klaarstaan als je niet weet hoe te beginnen.

**Een vast moment plannen voor je dagelijkse Story.** Ochtend, lunchpauze, avond. Maakt niet uit, wel vast. Vaste momenten verlagen drempel zodat je niet elke dag opnieuw moet bedenken "wanneer doe ik dit nu?".

**Binnen 1 uur reageren op DM's en stickers.** Stories nodigen mensen uit om in te tikken op je posts. Snelle reactie = mensen voelen zich gezien = vertrouwen groeit. Anti-bot.

WAT JE STRAKS ZIET IN JE DASHBOARD

Voor elke freebie-opt-in via je Stories of bio-link verschijnt straks een nieuwe lead in je dashboard met bron-tag (welke freebie, welke kanaal). De Mentor pakt 'm op in Mini-ELEVA-zachte-opvolg, en je krijgt seintjes wanneer een lead in beweging komt.

WAAR JE OP MOET LETTEN

Niet elke Story hoeft over Lifeplus te gaan. Sterker, dat zou het juist verzwakken. Zeven van de tien Stories gaan over jouw leven, je passies, alledaagse dingen. Drie gaan via je waarde, verhaal, freebie. Die balans maakt dat mensen jou blijven volgen.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap12-story",
        label: "Plaats vandaag minimaal één Story",
        verplicht: true,
      },
      {
        id: "core-v6-stap12-freebie-story",
        label: "Plaats een Story die je freebie aankondigt",
        verplicht: true,
        actieRoute: "/instellingen/freebies",
      },
      {
        id: "core-v6-stap12-plan",
        label: "Plan een vast moment voor je dagelijkse Story",
        verplicht: true,
      },
      ...afsluitStappenV6(12),
    ],
    waarInEleva: [{ actie: "Freebie-toolkit", route: "/instellingen/freebies" }],
    waaromWerktDit: {
      tekst:
        "Stories doen wat losse posts niet doen: ze maken je menselijk zichtbaar zonder dat je elke keer een mini-publicatie hoeft te maken. De ene Story is even goed als de andere, en samen geven ze het beeld dat jij er bent.",
    },
  },
  {
    nummer: 13,
    titel: "📦 Eerste Shoppers, supplementen-binnen",
    fase: 2,
    faseDoel: "Tweede pulsmoment uitvoeren: deels door de Mentor in de klantomgeving, deels door jou met menselijk contact.",
    watJeLeert: `Vandaag krijg je je eerste Shoppers in beeld 💟

De prospects die "ja" zeiden in stap 9, hebben straks hun supplementen ontvangen. Dat is het tweede pulsmoment in hun klantomgeving. De Mentor heeft de eerste open vraag al gesteld in hun klantomgeving ("zijn je supplementen binnen, heb je vragen?"), jij voegt menselijk contact toe waar het natuurlijk past.

VANDAAG GA JE

**Je eerste Shoppers controleren in hun klantomgeving.** In /klant zie je per klant de status en wat de Mentor al heeft gedaan. Geaggregeerd, niet inhoudelijk (AVG-veilig, jij ziet wat ze doen, niet wat ze precies aan de Mentor vragen).

**Elke Shopper een persoonlijk "spullen binnen?"-bericht sturen.** Eén of twee zinnen, vriendelijk en open. "Hé X, denk er aan dat ik er ben als je vragen hebt over hoe je begint, of als iets niet helemaal duidelijk is." De Mentor heeft 'm al gevraagd, jij voegt het menselijke laagje erbovenop.

**Ze uitnodigen voor de eerstvolgende product-info-avond of webinar (optioneel).** Niet voor iedereen passend, en niet verplicht. Wel een laagdrempelige manier om context te geven aan wie nieuwsgierig is.

WAAROM TWEE SPOREN

De Mentor doet het ritme dat anders zou wegglijden: timing-pulse op vaste momenten in de klantomgeving. Jij doet de menselijke aanwezigheid die geen algoritme kan vervangen. Samen zijn die twee meer dan de som van delen, en jij raakt geen klanten kwijt omdat het te druk werd.

WAT JE STRAKS GAAT VOELEN

Met drie of vier klanten is dit nog te overzien. Met twintig of vijftig zou je het niet aankunnen zonder ELEVA. Dat is precies waarom de klantomgeving bestaat: jij houdt het menselijke, ELEVA houdt het schaalbare.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap13-check",
        label: "Controleer eerste Shoppers in hun klantomgeving",
        verplicht: true,
        actieRoute: "/klant",
      },
      {
        id: "core-v6-stap13-persoonlijk",
        label: "Stuur elke Shopper een persoonlijk 'spullen binnen?'-bericht",
        verplicht: true,
      },
      {
        id: "core-v6-stap13-uitnodig",
        label: "Nodig ze uit voor de eerstvolgende product-info-avond",
        verplicht: false,
      },
      ...afsluitStappenV6(13),
    ],
    waarInEleva: [{ actie: "Mijn klanten", route: "/klant" }],
    waaromWerktDit: {
      tekst:
        "Klanten die in de eerste week na ontvangst een vraag stellen of zich gezien voelen, blijven gemiddeld vier keer langer klant dan klanten die in stilte beginnen. De Mentor signaleert, jij voegt aanwezigheid toe.",
    },
  },
  {
    nummer: 14,
    titel: "🛡️ Bezwaren-skills, 4-stappen + bibliotheek",
    fase: 2,
    faseDoel: "De 4-stappen-methode leren en oefenen met drie bezwaren uit de top-21.",
    watJeLeert: `Vandaag leer je rustig met bezwaren omgaan 💟

Bezwaren zijn geen tegenwerking. Ze zijn signalen dat iemand interesse heeft en even iets nodig heeft om verder te kunnen. Wie bezwaren ziet als afwijzing, raakt mensen kwijt die wel openstaan. Wie ze ziet als vragen, wint vertrouwen.

DE TOP-21 BEZWAREN (Eric Worre)

Worre heeft de meest voorkomende bezwaren in twee categorieen verdeeld:

**Externe bezwaren**: "ik heb geen tijd", "ik heb geen geld", "ik ken de mensen niet", "mijn partner staat er niet achter".

**Interne bezwaren**: "ik ben geen verkoper", "ik kan dit niet", "ik weet niet of het bij me past", "ik ben niet goed in netwerken".

Externe bezwaren hebben vaak interne wortels. "Ik heb geen tijd" betekent meestal "ik prioriteer dit niet, want ik weet niet of ik er goed in zou zijn". Daar achter komen vraagt een rustige methode.

DE 4-STAPPEN-METHODE

**1. Erkennen.** Niet meteen weerleggen. "Dat snap ik" of "die vraag krijg ik vaker". De ander voelt zich gezien.

**2. Doorvragen.** "Wat zou er nodig zijn voordat dit voor jou wel zou werken?" of "Wat speelt er specifiek voor jou hierin?". Open vraag die het echte achter het bezwaar opent.

**3. Feel-Felt-Found (FFF).** "Dat voel ik (Feel). Anderen voelden dat ook (Felt). En zij ontdekten dat (Found)." Geen rationele tegenargumentatie, wel gedeelde herkenning.

**4. Concrete vraag terug.** "Zal ik je laten zien hoe het bij hen werkte?" of "Wil je dat we er kort over praten?". Geen open afsluiting, wel een richting.

VANDAAG GA JE

**10 minuten roleplay met de Mentor doen, 3 bezwaren uit de top-21 kiezen.** Welke drie krijg jij nu het meest, of welke verwacht je het meest? De Mentor speelt prospect, jij oefent met de 4-stappen.

**De bezwaren-bibliotheek bekijken.** In /scripts vind je het volledige overzicht, met per bezwaar een voorbeeld-FFF. Niet woordelijk overnemen, wel als inspiratie.

**FFF op een bezwaar oefenen, een alternatieve benadering op een ander.** Niet alles werkt voor iedereen. Twee verschillende benaderingen oefenen geeft je flexibiliteit straks in gesprek.

WAT JE NIET MOET DOEN

Niet argumenteren tegen bezwaren. Niet bewijzen dat de prospect het mis heeft. Wel ruimte geven, en samen kijken naar wat er nodig is.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap14-roleplay",
        label: "Doe 10 min roleplay met de Mentor, 3 bezwaren uit top-21",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap14-bibliotheek",
        label: "Bekijk de bezwaren-bibliotheek",
        verplicht: false,
        actieRoute: "/scripts",
      },
      ...afsluitStappenV6(14),
    ],
    waarInEleva: [{ actie: "Naar scripts", route: "/scripts" }],
    waaromWerktDit: {
      tekst:
        "Wie bezwaren ziet als vragen in plaats van als afwijzing, vindt het werk lichter en wint vertrouwen waar anderen ruzie maken. FFF is een methode om dezelfde verhalen te delen zonder dat het belerend wordt.",
      bron: "Eric Worre, Go Pro (Feel-Felt-Found)",
    },
  },
  // ---------- BUSINESS-RITME (15-21) ----------
  {
    nummer: 15,
    titel: "🌟 Resultaat-post + Tijdlijn-moment 3",
    fase: 3,
    faseDoel: "Tijdlijn-moment 3 inzetten (klantomgeving), en je 21-dagen-resultaat-post plaatsen of itereren.",
    watJeLeert: `Vandaag activeer je Tijdlijn-moment 3 💟

Je eerste Shoppers zitten nu rond de tien tot achttien dagen. Dat is het moment waarop ze de eerste echte effecten van hun programma beginnen te merken. Voor jou is dit het zachte peilmoment: voelt deze klant zo positief dat 'ie ook openstaat voor de webshop-kant?

DE TIJDLIJN-MOMENT-3 ZIN

Een vaste zin die op dit moment werkt, en in jouw stem mag worden gezet:

"Heb je al leuke reacties in je omgeving op je veranderingen? Gun je anderen ook zo'n mooi resultaat? Want weet je nog wat ik in het begin zei? Dat je hiermee ook minimaal je producten kan terugverdienen of een online inkomen kan opbouwen door je gratis webshop. Sta je open om te kijken hoe dat voor jou kan werken?"

Geen verkoop, wel een uitnodiging om verder te kijken. De Mentor heeft 'm al ingeleid in de klantomgeving, jij voegt het menselijke aan toe.

VANDAAG GA JE

**Scenario A: nieuwe iteratie van je resultaat-post.** Tweede versie, andere invalshoek, of een aanvullend resultaat dat je hebt opgemerkt. Houd je verhaal vers en gevarieerd.

**Scenario B: je eerste 21-dagen-resultaat-post.** Je hebt nu zelf drie weken eigen ervaring. Tijd om die te delen. Schrijf met de Mentor je post, en plaats 'm op Facebook + Instagram.

**Tijdlijn-moment 3 toepassen op minimaal 1 enthousiaste Shopper.** De Mentor laat in je dashboard zien welke Shopper het meest enthousiaste signaal geeft. Daar pas je de zin op toe. Eventueel laat je de Mentor het inleiden in de klantomgeving en haak je zelf aan op het juiste moment.

WAAROM TIJDLIJN-MOMENTEN

Mensen kopen niet op een willekeurig moment. Ze kopen wanneer de timing klopt: na een eerste resultaat, in een fase van enthousiasme. Tijdlijn-momenten zijn de natuurlijke beslismomenten in een product-traject. Wie ze respecteert, vraagt op het juiste moment. Wie ze negeert, vraagt te vroeg of te laat.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap15-post",
        label: "Schrijf 21-dagen-resultaat-post (B) of nieuwe iteratie (A)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap15-tijdlijn3",
        label: "Pas Tijdlijn-moment 3 toe op minimaal 1 enthousiaste Shopper",
        verplicht: true,
      },
      ...afsluitStappenV6(15),
    ],
    waarInEleva: [{ actie: "Mijn klanten", route: "/klant" }],
    waaromWerktDit: {
      tekst:
        "Het moment dat een klant zelf trots zegt 'ik voel een verschil', is het moment om vrijblijvend te peilen of 'ie ook openstaat om zelf te bouwen. Niet voor of na, wel precies op dat moment werkt het.",
    },
  },
  {
    nummer: 16,
    titel: "👀 Builder-energie + ideale klant",
    fase: 3,
    faseDoel: "Onder je klanten herkennen wie zelf een gratis webshop zou willen, en je ideale-klant-profiel scherper maken.",
    watJeLeert: `Vandaag scherp je je ideale-klant-profiel 💟

Tot nu was iedereen welkom in je top-20 en je eerste contacten. Vanaf nu ga je leren herkennen WIE bij jou hoort en wie niet. Dat klinkt selectief, en dat is het ook. Maar het is geen filteren vooraf, het is leren van patronen die je nu begint te zien.

WAT IS BUILDER-ENERGIE

Builder-energie is wat je voelt bij iemand die zelf een eigen webshop zou kunnen runnen. Niet "wil meer geld", niet "is altijd gestrest". Wel:

- Ondernemend in de breedte (initiatief nemen, dingen oppakken)
- Mensen-mens (oprecht in contact met anderen)
- Doorzettingsvermogen (afmaken wat 'ie begint)
- Open voor groei (leerbaar, niet vastgeroest)

Niet iedere klant heeft Builder-energie. Dat is OK, die blijft een geweldige klant. Wel waardevol om degenen met Builder-energie te herkennen, zodat je ze straks vrijblijvend kunt vragen of een eigen webshop iets voor hen is.

VANDAAG GA JE

**Markeer 2 tot 3 klanten met Builder-energie in je namenlijst.** Ga niet overdenken. Vertrouw je gevoel, je kunt later altijd herclassificeren.

**Praat 5 minuten met de Mentor over: "voor wie kan ik het meest betekenen?".** Dit is je ideale-klant-profiel. Niet de markt-segmentatie, wel de mens-beschrijving. "Iemand die X voelt en Y zoekt." De Mentor noteert dit als jouw profielblok ideale-klant.

**Voor 1 klant een webshop-versie van de uitnodiging voorbereiden (optioneel).** Niet versturen, wel klaarzetten. Welke woorden zou jij gebruiken om deze specifieke klant uit te nodigen voor de webshop-kant? De Mentor helpt je.

WAAROM NU EN NIET EERDER

Twee redenen. Eén: je hebt nu eerste klanten gezien en hebt patronen om uit te putten. Twee: je weet nu welke type op jouw eerste uitnodigingen heeft gereageerd. Dat is veel meer data dan een vooraf-bedacht profiel.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap16-markeer",
        label: "Markeer 2 tot 3 klanten met builder-energie",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v6-stap16-mentor",
        label: "Praat 5 min met de Mentor: 'voor wie kan ik het meest betekenen?'",
        verplicht: true,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(16),
    ],
    waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    waaromWerktDit: {
      tekst:
        "Mensen vinden bij wie jij het meest waardevol bent, is geen filter dat je aan de buitenkant aanlegt. Het is een herkenning na de eerste twintig gesprekken: dit type werkte, dit type voelde anders. Pas dan kun je richting kiezen.",
    },
  },
  {
    nummer: 17,
    titel: "👋 Opvolg-routine + hercontact met bestaande klanten",
    fase: 3,
    faseDoel: "Een routine bouwen voor follow-up en drie bestaande klanten benaderen voor hercontact.",
    watJeLeert: `Vandaag bouw je een opvolg-routine 💟

Een van de grootste lekken in dit werk: prospects die je een keer hebt gesproken en daarna laat liggen. Niet omdat je ze niet wilde opvolgen, wel omdat het tussen alles in viel. Vandaag zet je een routine neer die voorkomt dat dit gebeurt.

VOOR PROSPECTS, DE OPVOLG-HERINNERING

Je opvolg-herinneringen zorgen ervoor dat geen prospect verdwijnt zonder dat jij bewust hebt besloten om los te laten.

**Voor 3 prospects een opvolg-herinnering inplannen.** Voor wie je in de afgelopen weken hebt gesproken maar nog geen ja of nee hebt gehad. Eén of twee weken vooruit, met een korte notitie wat je gaat zeggen.

VOOR BESTAANDE KLANTEN, HET HERCONTACT

Bestaande klanten zijn vaak de plek waar de meeste warmte ligt. Ze hebben al een ja gezegd, hebben al ervaring, en zijn vaak open voor "hoe gaat het sinds we het laatst spraken".

**3 bestaande klanten een persoonlijk hercontact-bericht sturen.** Niet over verkoop. Wel oprecht. "Hoe gaat het sinds je je producten gebruikt? Heb je nog vragen of wil je iets aanpassen?" Korte vraag, ruimte voor wat zij willen delen.

WAT DE MENTOR DOET

De Mentor signaleert in de klantomgeving wanneer een klant al een tijdje stil is, zonder activiteit. Jij ziet die seintjes vanaf je dashboard, en kunt natuurlijk vanaf daar reageren.

WAAROM NIET PUSHY

Hercontact uit oprechte interesse is geen verkoopstap. Het is hoe relaties werken. Niemand voelt zich vervelend wanneer iemand vriendelijk vraagt hoe het gaat zonder iets te willen. Wel als iemand pas weer in beeld komt op het moment dat er iets te koop is. Dat verschil maakt of mensen open of dicht reageren.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap17-opvolg",
        label: "Plan voor 3 prospects een opvolg-herinnering",
        verplicht: true,
      },
      {
        id: "core-v6-stap17-hercontact",
        label: "Stuur 3 bestaande klanten een persoonlijk hercontact-bericht",
        verplicht: true,
      },
      ...afsluitStappenV6(17),
    ],
    waarInEleva: [{ actie: "Mijn klanten", route: "/klant" }],
    waaromWerktDit: {
      tekst:
        "Een opvolg-routine is goedkoper dan een nieuwe prospect. Wie systematisch hercontact maakt, vindt vaak meer rendement bij bestaande mensen dan bij compleet nieuwe gesprekken. Het ritme is wat het laat werken, niet de inspanning per moment.",
    },
  },
  {
    nummer: 18,
    titel: "📊 5 typen prospects + funnel continu vullen",
    fase: 3,
    faseDoel: "Je top-20 categoriseren in 5 typen en met jezelf afspreken dat je lijst nooit klaar is.",
    watJeLeert: `Vandaag categoriseer je je prospects, en zet je een afspraak met jezelf 💟

Tot nu had je een ongesorteerde top-20. Vandaag breng je structuur. Vijf typen helpen je niet om mensen te beoordelen, wel om je gesprek te kalibreren op wat er bij wie nodig is.

DE 5 TYPEN PROSPECTS

**1. Direct geinteresseerd.** Wil meer weten, neemt initiatief, gaat door op informatie. Hier ga je sneller naar 3-weg of Mini-ELEVA.

**2. Open, maar voorzichtig.** Vond het leuk, maar wil niet overhaast. Hier geef je tijd, freebie als tussenstap, en pak je later op.

**3. Nieuwsgierig, niet direct beschikbaar.** Voelt interesse, maar zit in een ander seizoen van het leven. Hier blijf je in zachte aanwezigheid (Stories volgen, terugkomen na maanden).

**4. Vriendelijk, niet bezig.** Reageert prettig, niet bezig met dit. Hier blijf je vrienden, en het hoeft niet meer te zijn dan dat.

**5. Niet voor jou bedoeld.** Past niet bij wat jij brengt, of past niet bij jouw stijl. Hier respecteer je dat, en je gaat verder.

VANDAAG GA JE

**Je top-20 categoriseren in 5 typen.** Niet definitief, wel een eerste classificatie. De Mentor onthoudt dit en gebruikt het straks om je per type passende vervolgacties te suggereren.

**Een afspraak met jezelf maken: minimaal 5 nieuwe namen per week erbij.** De lijst is nooit klaar. Wie blijft toevoegen, blijft bouwen. Wie stopt met toevoegen, raakt langzaam in een lege funnel.

WAAROM "NOOIT KLAAR"

Een namenlijst is geen tank die op een gegeven moment vol is. Het is een rivier. Mensen stromen in, mensen stromen uit (naar klant, naar Builder, of buiten beeld). Wie steeds bovenstrooms blijft toevoegen, heeft altijd flow. Vijf per week is laag genoeg om vol te houden, hoog genoeg om verschil te maken.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap18-categoriseer",
        label: "Categoriseer je top-20 in 5 typen",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v6-stap18-afspraak",
        label: "Spreek met jezelf af: minimaal 5 nieuwe namen per week",
        verplicht: true,
      },
      ...afsluitStappenV6(18),
    ],
    waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    waaromWerktDit: {
      tekst:
        "Een namenlijst die niet groeit, droogt op. Een namenlijst die wel groeit, geeft jou keuze. Vijf nieuwe namen per week is geen ambitie, het is een gewoonte die zichzelf onderhoudt.",
    },
  },
  {
    nummer: 19,
    titel: "🎯 De closingsvraag",
    fase: 3,
    faseDoel: "De moedigste vraag van het vak stellen aan minstens een warme prospect.",
    watJeLeert: `Vandaag stel je de moedigste vraag van het vak 💟

In je gesprekken met prospects komt vaak het moment dat je voelt: er is interesse, er is informatie gegeven, en nu hangt het in de lucht. Veel mensen wachten dan af in plaats van te vragen. Dat is precies waar deals verdampen.

DE CLOSINGSVRAAG

"Wat heb je nog nodig om te beslissen?"

Eén zin. Helder. Niet pushy, wel concreet. Niet "wat denk je", niet "zou je willen". Wel "wat heb je nog nodig".

WAAROM HET WERKT

Drie redenen.

**1. Het respecteert het beslismoment.** Je gaat niet om de hete brij heen. Je geeft niet meer informatie. Je vraagt wat ER NOG NODIG IS, en daarmee respecteer je dat de prospect het beslismoment in handen heeft.

**2. Het krijgt eerlijke antwoorden.** Mensen geven vaak een eerlijker antwoord op deze vraag dan op "wil je kopen". Soms is het "ik wil het er met mijn partner over hebben" (specifieke vervolgactie). Soms is het "ik denk niet dat het iets voor mij is" (eerlijke nee, geen kostbare tijd verloren). Beide is goud.

**3. Het opent samenwerking.** Vaak komt er een antwoord waar JIJ iets mee kunt doen ("ik wil eerst snappen hoe de levering werkt"). Dan kun je samen die laatste vraag beantwoorden, niet doordrukken.

VANDAAG GA JE

**De closingsvraag stellen aan minstens 1 warme prospect.** Niet aan al je prospects in een dag. Wel aan een waarvan jij voelt "die is in fase, en wachten verandert er niks meer aan".

OVER MOEDIG VOELEN

Deze vraag voelt eng omdat 'ie ruimte geeft voor een nee. Daar zit precies de waarde. Een vraag waar geen nee mogelijk is, krijgt ook geen oprechte ja. Wie deze vraag eerlijk durft te stellen, vindt het werk lichter en respecteert zichzelf en de prospect.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap19-vraag",
        label: "Stel de closingsvraag aan minstens één warme prospect",
        verplicht: true,
      },
      ...afsluitStappenV6(19),
    ],
    waarInEleva: [],
    waaromWerktDit: {
      tekst:
        "De moedigste vraag stellen kost een seconde. Hem niet stellen kost weken aan onzekerheid, vermijding, en uiteindelijk een prospect die in stilte vertrokken is. Eén vraag, een respectvol gesprek, en helderheid voor allebei.",
    },
  },
  {
    nummer: 20,
    titel: "🔄 Klantomgeving-review + duplicatie zien",
    fase: 3,
    faseDoel: "Bewuste blik op alle klantomgevingen, voelen dat duplicatie schaalbaar wordt via ELEVA.",
    watJeLeert: `Vandaag krijg je een vol overzicht van wat je hebt opgebouwd 💟

Tot nu was elke ankerstap een actie. Vandaag is het reflectie en zicht. Open je klantomgeving-overzicht, kijk naar wie er in beeld is, en voel hoe duplicatie hier vorm krijgt.

VANDAAG GA JE

**De klantomgeving-overview in je dashboard openen.** /klant toont alle klantomgevingen die je hebt geopend. Niet inhoudelijk (AVG-Keuze-A), wel met status, signalen, en welke pulse-momenten zijn langsgekomen.

**Per klant bekijken: welke pulse-momenten zijn al geweest, wat is de stand.** Niet om actie te plannen, wel om patronen te zien. Welke klanten zijn enthousiast? Welke zijn stil? Welke voelen klaar voor een tweede gesprek?

**2 klanten markeren waar je gevoel zegt: hier kan een uitnodiging naar Core / webshop passen.** Niet versturen vandaag. Wel markeren. De Mentor noteert dit en jij komt er deze week op terug.

**5 minuten met de Mentor praten over wat je opvalt aan het patroon.** Niet over een specifieke klant, wel over de stroom. Welke type komt het meest binnen? Wie haakt af, wie blijft? Dit is jouw data, en de Mentor helpt om er betekenis aan te geven.

WAAROM DEZE STAP

In de oude flow moest jij vijf keer dezelfde zin in WhatsApp plakken op vijf verschillende momenten over weken verspreid. Voor drie klanten was dat te doen. Voor twintig niet. Daar struikelde duplicatie altijd: members raakten kwijt waar ze waren.

Vandaag voel je dat ELEVA dat overneemt. Jij ziet het overzicht, jij doet de menselijke aanwezigheid, en het ritme loopt vanzelf. Dit is wat schaalbaar maken er anders maakt dan wat de meeste mensen denken: niet meer doen, wel het juiste laten lopen.

WAT JE NA DEZE STAP VOELT

Je voelt of dit pad voor jou werkt op grote schaal. Heb je drie klanten, heb je vijf, heb je tien? Maakt niet uit, want het mechanisme is hetzelfde. Pas dan kun je je doelen voor de Uitbreiding-module realistisch inschieten in stap 21.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap20-overview",
        label: "Open de klantomgeving-overview in je dashboard",
        verplicht: true,
        actieRoute: "/klant",
      },
      {
        id: "core-v6-stap20-markeer",
        label: "Markeer 2 klanten waar een uitnodiging naar Core kan passen",
        verplicht: true,
      },
      {
        id: "core-v6-stap20-mentor",
        label: "Praat 5 minuten met de Mentor over wat je opvalt",
        verplicht: false,
        actieRoute: "/coach",
      },
      ...afsluitStappenV6(20),
    ],
    waarInEleva: [{ actie: "Mijn klanten", route: "/klant" }],
    waaromWerktDit: {
      tekst:
        "Duplicatie is geen verkooptechniek, het is een infrastructuur. Wie het overzicht kan houden zonder zelf elke pulse handmatig te sturen, kan duplicatie volhouden. Wie zelf het anker en de pulse-bron is, raakt uitgeput bij vijf klanten.",
    },
  },
  {
    nummer: 21,
    titel: "🏆 Reflectie + talent + eerste 30-dagen-doel",
    fase: 3,
    faseDoel: "Reflecteren op het pad tot nu, je creator-talent benoemen, en je eerste 30-dagen-doel inschieten.",
    watJeLeert: `Vandaag sluit je Core af en open je de volgende fase 💟

Eenentwintig ankerstappen verder, en je staat in een hele andere plek dan op stap 1. Vandaag reflecteer je rustig, benoem je je creator-talent, en zet je het eerste 30-dagen-doel waarmee de Uitbreiding-module straks samenwerkt.

VANDAAG GA JE

**De eindreflectie invullen (10 min).** Wat heb je geleerd, wat verraste je, waar zat je weerstand, en waar ben je trots op. Niet voor een diploma, wel voor jezelf. De Mentor noteert dit als jouw eind-Core-profiel.

**De talent-vraag met de Mentor beantwoorden.** "Ben jij het sterkst als schrijver, spreker, filmer, of in 1-op-1-gesprekken?" Vier opties, kies wat in jouw geval het meest natuurlijk voelt. De Mentor noteert dit als jouw creator-talent.

**Je eerste 30-dagen-doel instellen.** Concreet en meetbaar. Bijvoorbeeld: "500 euro extra verdienen", "3 nieuwe Shoppers", "1 nieuwe Webshophouder onder me", "30 freebie-leads". Niet vaag, wel realistisch. De Mentor combineert dit met alles wat hij over jou heeft geleerd en bouwt straks een persoonlijke 30-dagen-roadmap.

**Een call met je sponsor plannen om je voortgang te bespreken.** Ongeveer dertig minuten, ergens deze week. Bespreek je 30-dagen-doel, je sterkste contacten, en wat je nog nodig hebt voor de overgang naar de Uitbreiding-module.

**De schets van de Uitbreiding-module bekijken (optioneel).** Wanneer voelt je warme netwerk uitgemold raken, dan stap je in de Uitbreiding-module: social-media-motor, 30-dagen-doel-roadmap, freebies-flow op grotere schaal. Geen tijdsdruk, je start als jij voelt dat het tijd is.

WAT HET MENTOR-PROFIEL NU OVER JOU WEET

WHY. Situatie. Top-20 met FORM-context. Jouw producten en eigen ervaring. Jouw stem en de vier bouwstenen. Jouw publieke verhaal en eerste resultaten. Drie verhalen + niche-zaadje + passies. Welk type mensen op jou reageren. Ideale-klant-profiel. Creator-talent. Eerste 30-dagen-doel.

Genoeg om in de Uitbreiding-module gepersonaliseerde content en roadmap te maken die alleen voor jou klopt. Geen algemeen Reels-trucje, wel een plan dat voor jouw situatie werkt.

WAT ER STRAKS GEBEURT

Vanaf nu loop je in het dagelijkse ritme van de DMO, met af en toe een nieuwe ankerstap op jouw tempo (vooral als je voelt dat een nieuw onderwerp speelt, of na de Uitbreiding-module). Geen 21-dagen-druk. Wel een omgeving die met jou meegroeit.

Je bent in beweging. Dat was het hele punt 💟`,
    vandaagDoen: [
      {
        id: "core-v6-stap21-reflectie",
        label: "Vul de eindreflectie in (10 min)",
        verplicht: true,
      },
      {
        id: "core-v6-stap21-talent",
        label: "Beantwoord de talent-vraag met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap21-doel",
        label: "Stel je eerste 30-dagen-doel in",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v6-stap21-sponsor-call",
        label: "Plan een call met je sponsor om voortgang te bespreken",
        verplicht: true,
      },
      ...afsluitStappenV6(21),
    ],
    waarInEleva: [
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Mijn klanten", route: "/klant" },
    ],
    waaromWerktDit: {
      tekst:
        "Wie eenentwintig ankerstappen achter zich heeft, heeft niet alleen kennis. Heeft ook een Mentor-profiel dat hem persoonlijk kan begeleiden in de Uitbreiding-module. Dat is wat dit pad anders maakt dan een cursus die je volgt en daarna alleen verder moet.",
    },
  },
];

/** Returnt de Core V6-ankerstap op een nummer, of undefined. */
export function coreV6Stap(nummer: number): Dag | undefined {
  return CORE_V6_STAPPEN.find((s) => s.nummer === nummer);
}

/** Hulpvariabele om de teller niet altijd te hoeven hardcoderen. */
export const CORE_V6_AANTAL_STAPPEN = CORE_V6_STAPPEN.length;

// Type-helper om unused-import warnings te vermijden in tooling.
export type { ElevaPad };
