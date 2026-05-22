// File: lib/playbook/core-dagen-v6.ts
//
// Core V6 ankerstappen. 21 zuivere leerstappen, admin-stappen zitten
// in SetupPopup (niet in deze lijst). Volgt de V6-spec uit OVERZICHT-CORE-V6.html.
// Gebruikt de bestaande Dag-type uit lib/playbook/types.ts zodat de bestaande
// vandaag-flow het kan renderen.
//
// PLACEHOLDER per ankerstap: watJeLeert + faseDoel + waaromWerktDit zijn skeletten
// die Gaby in een schrijfsessie invult (zoek op TODO-GABY). Taken (vandaagDoen)
// zijn al concreet zodat de mechanica bestaat, alleen labels en uitleg kunnen
// jullie aanscherpen.
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

const PLACEHOLDER_WAAROM = {
  tekst: "PLACEHOLDER. TODO-GABY: quote of principe van de stap, met bron erbij.",
  bron: "TODO-GABY",
};

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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 8,
    titel: "✨ Drie verhalen + eerste niche-zaadje",
    fase: 2,
    faseDoel: "Drie korte verhalen op papier en een eerste idee van je niche-zaadje + passies.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: drie verhalen op papier (persoonlijk / product / business), eerste idee van niche-zaadje + passies.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 9,
    titel: "💬 Eerste warme uitnodigingen + Mini-ELEVA introductie",
    fase: 2,
    faseDoel: "Drie warme uitnodigingen versturen en kennismaken met Mini-ELEVA als opvolg-pad.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: drie warme uitnodigingen, kennismaken met Mini-ELEVA als opvolg-pad.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 10,
    titel: "💪 3-weg-meesterclass, 5 stappen die werken",
    fase: 2,
    faseDoel: "De vijf stappen van een 3-weg-gesprek leren en scripts klaar hebben voor je eerstvolgende.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: vijf stappen 3-weg-gesprek + scripts klaar voor eerstvolgende.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 11,
    titel: "🤝 Je eerstvolgende 3-weg starten",
    fase: 2,
    faseDoel: "Een echte 3-weg starten met een warme prospect, samen met je sponsor.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: niet meer theorie, praktijk.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 12,
    titel: "📸 Stories-ritme + freebie-aankondiging",
    fase: 2,
    faseDoel: "Een dagelijks Stories-ritme oppakken en je gekozen freebie zichtbaar maken via Stories.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: dagelijks Stories-ritme + freebie zichtbaar via Stories.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 13,
    titel: "📦 Eerste Shoppers, supplementen-binnen",
    fase: 2,
    faseDoel: "Tweede pulsmoment in de klantomgeving, deels door de Mentor, deels door jou.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: tweede pulsmoment (klantomgeving), deels Mentor, deels menselijk contact.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 14,
    titel: "🛡️ Bezwaren-skills, 4-stappen + bibliotheek",
    fase: 2,
    faseDoel: "De 4-stappen-methode leren en oefenen met de bezwaren-bibliotheek.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: 4-stappen-methode + bezwaren-bibliotheek.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  // ---------- BUSINESS-RITME (15-21) ----------
  {
    nummer: 15,
    titel: "🌟 Resultaat-post + Tijdlijn-moment 3",
    fase: 3,
    faseDoel: "Tijdlijn-moment 3 inzetten en (scenario B) je eerste 21-dagen-resultaat-post plaatsen.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: Tijdlijn-moment 3 + nieuwe iteratie resultaat-post.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 16,
    titel: "👀 Builder-energie + ideale klant",
    fase: 3,
    faseDoel: "Onder je klanten herkennen wie zelf een gratis webshop zou willen.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: onder klanten herkennen wie zelf een webshop zou willen.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 17,
    titel: "👋 Klantcontact + opvolg-routine + hercontact",
    fase: 3,
    faseDoel: "Een routine bouwen voor follow-up en bestaande klanten benaderen voor hercontact.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: follow-up-routine + bestaande klanten benaderen voor hercontact.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 18,
    titel: "📊 5 typen prospects + funnel continu vullen",
    fase: 3,
    faseDoel: "Je top-20 categoriseren in 5 typen en afspreken dat je lijst nooit klaar is.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: top-20 categoriseren + lijst is nooit klaar.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 19,
    titel: "🎯 Closingsvraag",
    fase: 3,
    faseDoel: "De moedigste vraag van het vak stellen aan minstens één warme prospect.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: de moedigste vraag van het vak.",
    vandaagDoen: [
      {
        id: "core-v6-stap19-vraag",
        label: "Stel de closingsvraag aan minstens één warme prospect",
        verplicht: true,
      },
      ...afsluitStappenV6(19),
    ],
    waarInEleva: [],
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 20,
    titel: "🔄 Klantomgeving-review + duplicatie zien",
    fase: 3,
    faseDoel: "Bewuste blik op alle klantomgevingen, voelen dat duplicatie schaalbaar wordt.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: bewuste blik op alle klantomgevingen, voelen dat duplicatie schaalbaar wordt.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 21,
    titel: "🏆 Reflectie + talent-keuze + eerste 30-dagen-doel",
    fase: 3,
    faseDoel: "Reflecteren, creator-talent benoemen, en je eerste 30-dagen-doel inschieten.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: reflectie, creator-talent benoemen, eerste 30-dagen-doel inschieten.",
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
    waarInEleva: [{ actie: "Open de Mentor", route: "/coach" }],
    waaromWerktDit: PLACEHOLDER_WAAROM,
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
