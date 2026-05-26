// File: lib/playbook/core-dagen-v9.ts
//
// Core V9 ankerstappen. 21 zuivere leerstappen met Raoul-feedback verwerkt
// (26 mei 2026). Volgt OVERZICHT-CORE-V9.html. Gebruikt het bestaande
// Dag-type uit lib/playbook/types.ts.
//
// Wat is anders dan V6:
//   - WHY-substep weg uit stap 1 (zit al in onboarding)
//   - Pre-post / 21-dagen-post-keuze ONDERDEEL van stap 1, sidestep opent
//     na voltooien stap 1
//   - Stap 2 = top-20 + webshop-pivot samengevoegd, 3 uitnodigingen met
//     sponsor, productgebruikers + opportunity-mensen
//   - Stap 3 lichter: zelf filmpjes kijken + Mentor-info over eigen gebruik
//   - Stap 4: drie verhalen + edification-basics
//   - Stap 5: cluster bezwaren-basis + 3-weg-basis + Mini-ELEVA-basis
//   - Stap 6: + social-media-basistraining
//   - Stap 7: verdienmodel + Builder-status-pad als rode draad
//   - Stap 8-9: 3-weg-meesterclass + 3-weg starten (niet "eerste")
//   - Stap 10: FORM-verdieping
//   - Stap 11: 5 typen prospects + funnel
//   - Stap 12: Stories + Reels (verdieping van 6)
//   - Stap 13: niche-aanscherping met Mentor (tweede freebie verschoven)
//   - Stap 14: members/netwerkers herkennen + ideale klant (geen "builder energie")
//   - Stap 15-18: tweede 3-weg-iteratie, edification-verdieping, resultaat-post-iteratie
//   - Stap 19: pipeline-check via Mentor-auto-knop
//   - Stap 20: Builder-status-check + duplicatie-pad
//   - Stap 21: klantomgeving-review + reflectie + 30-dagen-doel
//
// Belangrijk: "Beelden" status (zoals Lifeplus-rang) is hier hernoemd naar
// "Builder" status om verwarring te voorkomen met het ELEVA-builder-jargon.
// Definitie: eerste 3 levels samen >= 1500 IP (inclusief eigen bestelling)
// + minimaal 3 members met bestelling vanaf 40 IP.

import type { Dag, ControllableTaak } from "./types";
import {
  momentumRadarStap,
  partnerCheckStap,
  namenToevoegenUitleg,
  uitnodigingenUitleg,
} from "./tempo-aware";

const V9_PREFIX = "core-v9-stap";

function afsluitStappenV9(stapNummer: number): ControllableTaak[] {
  return [
    {
      id: `${V9_PREFIX}${stapNummer}-sponsor-checkin`,
      label: "💬 Sluit af met een korte sponsor-checkin",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
      uitleg: `30 sec berichtje naar je sponsor hoe deze ankerstap ging.`,
    },
    momentumRadarStap(stapNummer, { idPrefix: V9_PREFIX }),
    partnerCheckStap(stapNummer, { idPrefix: V9_PREFIX }),
  ];
}

// De drie-soorten-mensen-DM-scripts staan in lib/playbook/core-sideflows-v9.ts
// (Pre-post gebruikt de gezellig-versie, 21-dagen-post de blij-versie).

/** Core V9: 21 ankerstappen. */
export const CORE_V9_STAPPEN: Dag[] = [
  // ---------- FUNDAMENT (1-5) ----------
  {
    nummer: 1,
    titel: "🚀 Welkom bij Core, Builder-doel + sponsor + jouw eerste post-keuze",
    fase: 1,
    faseDoel:
      "Bevestigen wat de onboarding heeft opgehaald, Builder-status als rode draad neerzetten, sponsor in de loop, en jouw eerste post-keuze maken (pre-post of 21-dagen-post). Na deze stap opent de sidestep voor jouw keuze.",
    watJeLeert: `Welkom bij Core 💟 Wat bijzonder dat je hier bent.

Dit is anders dan een sprint. Geen 60-dagen-druk, geen "vandaag moet alles". Je werkt op jouw tempo, ankerstap voor ankerstap. Tussendoor loopt een dagelijks ritme mee zodat je richting houdt, maar je ankerstap pak je op wanneer JIJ eraan toe bent.

WAT DE ONBOARDING AL HEEFT OPGEHAALD

Je hebt in de onboarding al een paar belangrijke dingen vastgelegd. Je WHY, je doel voor deze ronde, hoeveel tijd je per week kunt vrijmaken, en of je al eigen ervaring met de producten hebt (scenario A) of niet (scenario B). Dat hoeven we hier niet over te doen, de Mentor weet dit al en past zijn suggesties straks daarop aan.

JOUW EERSTE DOEL: BUILDER-STATUS

Er is één doel waar je in de eerste paar weken naartoe werkt. Niet omdat het mooi staat op een titel, wel omdat het de drempel is waarna alles dupliceerbaar wordt. Builder-status betekent: in jouw eerste drie levels samen is er voor minimaal 1500 IP besteld (jouw eigen bestelling telt mee), en in jouw team staan minimaal drie members met een bestelling vanaf 40 IP.

Klinkt als getallen, is in praktijk gewoon: jij bestelt zelf, je nodigt mensen uit, drie van hen worden member, en samen kom je op het volume. Dat is precies wat de komende 21 ankerstappen je laten doen.

Het mooie is: dezelfde stappen die jou naar Builder brengen, leren jij straks aan jouw eerste members door. Builder is geen eindpunt, het is het moment waarop duplicatie begint te werken.

DRIE DINGEN VANDAAG

**Bevestig je onboarding-input.** De Mentor laat zien wat 'ie heeft opgeslagen. WHY, doel, scenario. Klopt het nog? Pas aan waar je iets anders ziet. Dat is je vertrekpunt.

**Sponsor inlichten.** Eén kort berichtje, "ik ben gestart in Core". Geen lang verhaal nodig. Vanaf nu kijkt je sponsor mee in ELEVA en weet 'ie wanneer het loopt of wanneer er even iets is.

**Jouw eerste post-keuze.** Hier zit het belangrijkste keuzemoment van deze ankerstap. Wat past bij jou nu: een pre-post (je gaat beginnen, deelt je voornemen) of een 21-dagen-post (je hebt al een resultaat gemerkt en gaat dat delen)? Beide brengen mensen in beweging. Pre-post brengt vooral nieuwsgierige reageerders binnen, 21-dagen-post zet vaak direct iemand aan om mee te bestellen. Je kunt ook nu skippen en later doen, dan blijft de keuze als advies op je dashboard staan.

WAT ER STRAKS GEBEURT

Zodra je deze stap voltooit, opent automatisch de sidestep voor de post-keuze die je hebt gemaakt. Daar zit een volledig stappenplan in met filmpjes, voorbeelden, reactie-scripts en alles wat je nodig hebt om jouw post live te krijgen en de reacties op te volgen. Pas wanneer je die sidestep afrondt (of voor nu skipt), schuift Core door naar ankerstap 2.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap1-onboarding-bevestig",
        label: "Bevestig je onboarding-input met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "De Mentor laat zien wat 'ie heeft opgeslagen uit onboarding (WHY, doel, scenario). Klopt het nog? Pas aan waar je iets anders ziet.",
      },
      {
        id: "core-v9-stap1-builder-uitleg",
        label: "Bekijk de korte Builder-status-uitleg",
        verplicht: true,
        uitleg:
          "Wat is Builder, waarom is het je eerste doel, hoe kom je er. Eén kort filmpje van Raoul + Gaby (TODO: media toevoegen).",
      },
      {
        id: "core-v9-stap1-sponsor",
        label: "Stuur je sponsor een berichtje: 'ik ben gestart in Core'",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: "core-v9-stap1-post-keuze",
        label: "Maak je eerste post-keuze: pre-post, 21-dagen-post, of voor nu skippen",
        verplicht: true,
        inlineEmbed: "prepost-keuze",
        uitleg:
          "Geen ervaring? Pre-post. Wel ervaring? 21-dagen-post. Beide brengen mensen in beweging. Skip blijft als advies op je dashboard.",
      },
      ...afsluitStappenV9(1),
    ],
    waarInEleva: [
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Maak je sponsor-berichtje", route: "/team" },
    ],
    waaromWerktDit: {
      tekst:
        "Een helder eerste doel houdt je werk concreet. Zonder Builder-doel zoek je rondom motivatie, met Builder-doel weet je elke ankerstap waarom je 'm doet. En de stappen ernaartoe leer je over aan je team zodra je er bent, dat is het mooiste eraan.",
      bron: "Eric Worre (Go Pro) + Lifeplus-pad",
    },
  },
  {
    nummer: 2,
    titel: "👥 Top-20-namenlijst + webshop-pivot + 3 uitnodigingen mét sponsor",
    fase: 1,
    faseDoel:
      "Top-20-lijst opzetten met productgebruikers EN opportunity-mensen. Webshop-pivot leren als kader. Samen met je sponsor 3 oefen-uitnodigingen versturen, daarna alle 20 zo snel mogelijk.",
    watJeLeert: `Nu je eerste post live is (of voor nu geparkeerd staat) breng je je netwerk in beeld 💟

Niet om iedereen een uitnodiging te sturen. Wel om te weten WIE er om je heen staat, zodat je niet rondjes draait tussen "wie zou ik nou benaderen?" en uiteindelijk niemand.

PRODUCTGEBRUIKERS ÉN OPPORTUNITY-MENSEN

Belangrijk om hier vooraf neer te zetten: je top-20 is geen "wie wil ik een webshop verkopen"-lijst. Het is "wie zou ik op enige manier kunnen verrijken met wat ik nu zelf doe". Dat zijn dus twee soorten mensen door elkaar:

**Productgebruikers**, mensen waarvan jij denkt dat ze baat zouden hebben bij een van onze producten of programma's. Iemand met een slechte slaap, iemand die zich vermoeid voelt, iemand die iets met haar hormonen voelt schuiven, iemand die wil afvallen of gewoon lekkerder in haar vel wil zitten.

**Opportunity-mensen**, mensen waarvan jij denkt dat ze het werk zelf misschien zouden willen doen. Ondernemend type, mensen-mens, iemand die op zoek is naar iets erbij, iemand die je gewoon iets gunt.

Beide horen op je top-20. Je gaat ze straks niet allemaal hetzelfde benaderen, maar je hebt ze wel allemaal in beeld nodig.

EERST UITBREIDEN, DAN PAS FILTEREN

Veel mensen beginnen klein omdat ze al gaan filteren in hun hoofd. "Die past nooit", "die heeft geen geld", "die heeft het te druk". Stop daarmee. Schrijf eerst tot je op twintig namen zit. Filteren komt later, en doe je nooit voor iemand anders.

Vier bronnen helpen je daarbij. Familie en directe vrienden. Oude collega's, oud-klasgenoten, oud-buren. Ouders bij school, sportclub, vereniging, hobby. En de mensen die je via social al een tijd volgt of die jou volgen.

DE WEBSHOP-PIVOT, JOUW KADER VOOR DE UITNODIGINGEN

Mensen zijn allergisch voor "wil je iets bij mij kopen". Maar mensen zijn nieuwsgierig naar "een webshop waar je je producten gratis krijgt en eventueel inkomen mee opbouwt, zonder voorraad en zonder risico". Hetzelfde verhaal, een ander frame, en het ene werkt en het andere niet.

Vier bouwstenen vormen samen een goede webshop-uitnodiging:

**1. Het haakje.** Een opener die persoonlijk is voor deze prospect. Hun naam, gedeelde geschiedenis, of een hint over iets wat hen bezighoudt.

**2. De manier-gevonden-zin.** "Ik heb een manier gevonden om online extra inkomsten op te bouwen zonder investeringen en zonder risico." Geen claim, geen belofte, wel een uitnodiging om te kijken.

**3. Hoe het werkt, kort.** Een of twee zinnen over de webshop. Geen lange uitleg, wel een beeld dat klopt.

**4. De permissie-vraag.** Concreet, niet open afsluiten. "Mag ik je kort laten zien hoe het werkt? Helemaal vrijblijvend, als het niets voor je is is dat ook prima."

DRIE UITNODIGINGEN MÉT SPONSOR

Het doel van vandaag is niet één uitnodiging, en niet alle 20 ineens. Het is drie uitnodigingen versturen, samen met je sponsor. Plan een korte call van een halfuur, kies drie mensen uit je top-5, en stuur ze in jullie eigen stem. Je sponsor schuift bij, geeft tips, en jij merkt direct hoe het voelt.

Daarna de rest. Het doel is alle 20 zo snel mogelijk versturen, de overige 17 mag je alleen doen of weer met je sponsor erbij, wat voor jou werkt.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap2-namen",
        label: "Voeg minimaal 20 namen toe (productgebruikers + opportunity-mensen)",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg: namenToevoegenUitleg(20),
      },
      {
        id: "core-v9-stap2-top5",
        label: "Markeer je top-5 binnen de top-20",
        verplicht: true,
        uitleg:
          "Geen 'wie zou kopen', wel 'wie gun ik dit het meest'. Deze 5 zijn jouw kandidaten voor de oefen-uitnodigingen.",
      },
      {
        id: "core-v9-stap2-vcard",
        label: "Upload je telefoonboek als extra bron (optioneel)",
        verplicht: false,
        inlineEmbed: "vcard-upload",
        vereistMobiel: true,
      },
      {
        id: "core-v9-stap2-webshop-frame",
        label: "Loop met de Mentor de vier webshop-bouwstenen door",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "Haakje, manier-gevonden-zin, hoe het werkt, permissie-vraag. Mentor oefent met jouw stem.",
      },
      {
        id: "core-v9-stap2-eigen-zin",
        label: "Schrijf je eigen webshop-uitnodigingszin",
        verplicht: true,
        inlineActie: {
          type: "tekst",
          slug: "webshop-uitnodigingszin",
          label: "Mijn webshop-uitnodigingszin",
          instructie:
            "3 tot 4 regels, in jouw stem. Mentor leert hiermee jouw stijl en kan straks varianten maken voor specifieke prospects.",
          placeholder:
            "Bv. 'Hé [naam], ik heb een manier gevonden om...'",
          maxTekens: 500,
        },
      },
      {
        id: "core-v9-stap2-sponsor-call",
        label: "Plan een halfuur met je sponsor + verstuur samen 3 uitnodigingen",
        verplicht: true,
        uitnodigHelpKnoppen: true,
        uitleg: uitnodigingenUitleg(3, {
          extraIntro:
            "Drie uitnodigingen samen met je sponsor. Plan een halfuur, kies drie uit je top-5, en stuur ze in jullie stem. Sponsor schuift bij, geeft tips, en jij merkt direct hoe het voelt.",
        }),
      },
      {
        id: "core-v9-stap2-rest-verzenden",
        label: "Verstuur de overige 17 uitnodigingen zo snel mogelijk",
        verplicht: false,
        uitleg:
          "Mag alleen, mag opnieuw met sponsor erbij. Doel is dat alle 20 binnen een week zijn verstuurd.",
      },
      ...afsluitStappenV9(2),
    ],
    waarInEleva: [
      { actie: "Naar je namenlijst", route: "/namenlijst" },
      { actie: "Open je eigen zinnen", route: "/mijn-zinnen" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "De grootste belemmering bij een nieuwe start is niet het werk, het is de illusie dat je weet wie wel en wie niet. Niemand weet dat. De top-20 dwingt je om mensen een eerlijke kans te geven, en samen met je sponsor de eerste drie verzenden voelt dragelijker dan in je eentje.",
      bron: "Eric Worre, Go Pro",
    },
  },
  {
    nummer: 3,
    titel: "📦 Productkennis-licht, kijk zelf wat je doorstuurt",
    fase: 1,
    faseDoel:
      "Zelf de prospect-filmpjes bekijken die je naar prospects gaat sturen, en de Mentor weet welke producten of programma's jij persoonlijk hebt gedaan en gebruikt. Geen 'welke 5 verkoop ik het meest' meer.",
    watJeLeert: `Vandaag een lichte stap, maar belangrijk 💟

Niemand verwacht dat je alle producten uit je hoofd kent. De Mentor kent alles. Wat JIJ wel moet kunnen, is twee dingen.

JE WEET WAT JE DOORSTUURT

Elk filmpje dat je naar een prospect stuurt, heb je zelf bekeken. Klinkt vanzelfsprekend, maar in praktijk wordt dit vaak overgeslagen, en dan kan een prospect je iets vragen waar je geen antwoord op hebt omdat je niet weet wat er in dat filmpje zit.

Vandaag loop je de prospect-filmpjes door die het meest gedeeld worden. Niet allemaal in detail bekijken, wel een keer doorklikken zodat je weet wat de inhoud is, hoe lang het duurt, en in welke situaties je 'm zou versturen.

Dit zijn ook de filmpjes die in de pre-post-flow en de 21-dagen-post-flow worden voorgesteld om mee te sturen aan geïnteresseerden, dus je hebt ze straks regelmatig nodig.

JE PERSOONLIJKE GEBRUIK IN HET MENTOR-PROFIEL

Tweede ding: vertel de Mentor welke producten of programma's JIJ zelf doet en gebruikt. Niet "welke verkoop ik het meest", wel "welke gebruik ik persoonlijk".

Dat lijkt klein, maar is goud waard. Want zodra een prospect straks vraagt "wat gebruik jij zelf?", weet de Mentor het, en kan 'ie meedenken over jouw verhaal, jouw zinnen, jouw aanbevelingen op een manier die past bij wat je echt doet.

Heb je nog geen eigen pakket besteld? Doe dat dan ook nu. Niet om te verkopen, om te ervaren. Mensen voelen het verschil tussen iemand die het zelf gebruikt en iemand die het van papier kent.

WAAROM DIT WERKT

Mensen kopen geen producten. Mensen kopen veranderingen die ze in jou zien. Daarom hoef je geen wandelende encyclopedie te zijn. Wel iemand die kan zeggen "dit gebruik ik zelf, dit merkte ik, en dit gun ik jou ook".

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap3-eigen-filmpjes",
        label: "Bekijk zelf de prospect-filmpjes die je naar prospects gaat sturen",
        verplicht: true,
        uitleg:
          "De Mentor toont de meest-gedeelde filmpjes. Klik door, kijk de eerste 30 seconden, weet wat erin zit. Je gebruikt deze in pre-post-flow, 21-dagen-post-flow, en als opvolg-materiaal.",
      },
      {
        id: "core-v9-stap3-eigen-pakket",
        label: "Bestel je eigen pakket als je dat nog niet hebt",
        verplicht: false,
        uitleg:
          "Eigen ervaring = geloofwaardigheid. Niet om te verkopen, om te ervaren. Telt mee voor jouw eigen Builder-IP.",
      },
      {
        id: "core-v9-stap3-mentor-context",
        label: "Vertel de Mentor welke producten of programma's jij persoonlijk gebruikt",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "Voor jouw Mentor-profiel. Helpt straks bij verhaal, zinnen, en aanbevelingen die kloppen met wat je echt doet.",
      },
      ...afsluitStappenV9(3),
    ],
    waarInEleva: [{ actie: "Open de Mentor", route: "/coach" }],
    waaromWerktDit: {
      tekst:
        "De Mentor doet het zware geheugenwerk, jij draagt je eigen ervaring. Die twee samen zijn sterker dan een Mentor met alle kennis en een member zonder verhaal.",
    },
  },
  {
    nummer: 4,
    titel: "📝 Drie verhalen + jouw stem + edification-basics",
    fase: 1,
    faseDoel:
      "Drie verhalen schrijven (persoonlijk / product / business) in jouw stem, plus basis-begrip van edification (hoe noem je je sponsor in een gesprek). Verdieping van edification later in stap 17.",
    watJeLeert: `Vandaag bouw je jouw stem op drie manieren 💟

Tot nu had je één zin, je webshop-uitnodiging. Vandaag zet je daar drie verhalen omheen. Niet om uit je hoofd te leren, wel om uit te schrijven zodat jij precies weet wat jouw verhaal is wanneer iemand het vraagt.

DE DRIE VERHALEN

**Het persoonlijke verhaal.** Wie ben jij, waar komt jouw motivatie vandaan om hiermee bezig te zijn, wat zoek je voor jezelf? Niet je hele CV, een paar zinnen die kloppen. Dit is wat je vertelt als iemand vraagt "waarom doe jij dit?".

**Het product-verhaal.** Vanuit het webshop-frame: wat doet de webshop, welke producten erop staan kun jij iets over zeggen vanuit eigen ervaring, hoe is het om met deze producten te werken. Geen claim-claim-claim, wel een beeld dat klopt.

**Het business-verhaal.** Hoe werkt het, in een kort verhaal. Webshop, klanten, eventueel een team eronder, en hoe je er een inkomen mee opbouwt. Niet de Lifeplus-handleiding, wel een verhaal in jouw woorden.

De Mentor helpt je bij elk verhaal. Hij stelt vragen, jij praat, en hij schrijft mee terwijl jij hoort hoe jouw eigen woorden klinken. Drie iteraties per verhaal is genoeg.

EDIFICATION-BASICS

Edification betekent: je sponsor introduceren op een manier die hem of haar laat schitteren, zodat een prospect bij jullie eerste gesprek samen al respect voor je sponsor heeft.

De basis-versie is simpel. Eén of twee zinnen die noemen: wie is je sponsor, wat doet 'ie al een tijd, en hoe heeft 'ie jou geholpen. Voorbeeld: "Ik werk samen met Gaby, ze helpt al meer dan tien jaar mensen met dit, en heeft mij geholpen om hier te komen waar ik nu sta."

Dit is de eerste versie. In stap 17 verfijn je 'm op basis van wat in jouw 3-wegs werkt. Voor nu: schrijf één basis-versie en bewaar 'm.

WAT JE NIET MOET DOEN

Niet kopiëren van scripts. Niet "iemand die het bij iedereen gebruikt". Wel jouw versie, jouw stem, jouw bouw. Pas dan straalt geloofwaardigheid eruit.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap4-persoonlijk-verhaal",
        label: "Schrijf je persoonlijke verhaal met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap4-product-verhaal",
        label: "Schrijf je product-verhaal vanuit het webshop-frame",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap4-business-verhaal",
        label: "Schrijf je business-verhaal",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap4-edification",
        label: "Schrijf je edification-basis-zin",
        verplicht: true,
        inlineActie: {
          type: "tekst",
          slug: "edification-zin",
          label: "Mijn edification-zin",
          instructie:
            "Eén of twee zinnen die jouw sponsor introduceren. Wie is hij/zij, wat doet 'ie al een tijd, hoe heeft 'ie jou geholpen. Basis-versie, verfijning komt in stap 17.",
          placeholder:
            'Bv. "Ik werk samen met [naam sponsor], al meer dan X jaar helpt zij mensen met..."',
          maxTekens: 400,
        },
      },
      {
        id: "core-v9-stap4-niche",
        label: "Praat 5 min met de Mentor over je niche-zaadje + passies",
        verplicht: false,
        actieRoute: "/coach",
        uitleg:
          "Wat trekt jou aan? Slaap, energie, hormonen, lifestyle, ondernemen? De Mentor onthoudt dit voor later in stap 13 (niche-aanscherping).",
      },
      ...afsluitStappenV9(4),
    ],
    waarInEleva: [
      { actie: "Open je eigen zinnen", route: "/mijn-zinnen" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Mensen kopen geen woorden, mensen kopen geloofwaardigheid. Drie verhalen in jouw eigen stem maken jou herkenbaar, en jouw edification-zin laat je sponsor schitteren zonder dat je hem ophemelt.",
      bron: "Worre + Brookes",
    },
  },
  {
    nummer: 5,
    titel: "🛡️ Bezwaren-basis + 3-weg-basis + Mini-ELEVA-basis",
    fase: 1,
    faseDoel:
      "Drie basis-skills tegelijk: hoe ga je om met bezwaren, hoe werkt een 3-weg, en hoe werkt Mini-ELEVA. Niet diepgaand, wel genoeg om iets klaar te zetten zodra eerste prospect reageert.",
    watJeLeert: `Vandaag drie skills tegelijk, op basis-niveau 💟

Klinkt veel, is in praktijk samen ongeveer 40 minuten leerwerk. Reden om ze in één stap te bundelen: zodra een eerste reactie binnenkomt of een prospect interesse toont, moet je deze drie basis-skills paraat hebben. Anders sta je dan stil terwijl het moment warm is.

Verdieping per skill komt later: 3-weg-meesterclass in stap 8, FORM-verdieping in stap 10, edification-verdieping in stap 17.

BEZWAREN-BASIS

Niet elke aarzeling is een bezwaar, en niet elk bezwaar betekent "nee". Vaak betekent het: "ik heb een vraag, geef me ruimte". De 4-stappen-methode helpt je daarmee om te gaan.

**1. Erkennen.** "Ik snap wat je bedoelt." Niet meteen weerleggen. Eerst laten landen.

**2. Doorvragen.** "Wat speelt er nog meer voor jou?" Vaak komt het echte bezwaar pas na het oppervlakkige.

**3. Feel-Felt-Found.** "Ik begrijp hoe je je voelt, anderen voelden zich ook zo, en wat ze ontdekten was..."

**4. Concrete vervolgvraag.** "Zullen we even samen kijken naar [X]?" Of "Mag ik je iets sturen waar dit specifiek over gaat?"

De Mentor loopt drie typische bezwaren met je door in roleplay. "Geen tijd", "geen geld", "ik ken al iemand die dit doet". Vandaag oefen je, je hoeft het nog niet perfect te kunnen.

3-WEG-BASIS

Een 3-weg-gesprek is een gesprek tussen drie mensen: jij, je sponsor of upline, en je prospect. Jij introduceert je sponsor (dat is jouw edification-zin), je sponsor doet de inhoudelijke uitleg, prospect stelt vragen, en jij sluit af met een vervolgafspraak. Diepe duik volgt in stap 8.

Vijf stappen op hoog niveau:

**1. Edification.** Jij introduceert je sponsor in 1-2 zinnen.
**2. Intro.** Sponsor stelt zichzelf voor, vraagt 1-2 dingen over de prospect.
**3. Inhoud.** Sponsor vertelt het verhaal, prospect luistert + vraagt.
**4. Vraag aan prospect.** "Wat spreekt je het meest aan?" of vergelijkbaar.
**5. Vervolgafspraak.** Concreet, dag en tijd.

Dit is genoeg om te weten zodra een prospect interesse toont. Je kunt vandaag al een 3-weg inplannen als het nodig is.

MINI-ELEVA-BASIS

Mini-ELEVA is een omgeving die je voor een prospect kunt openen. Daar staat de Mentor klaar voor hen om vragen te beantwoorden, in jouw stem en met jouw verhalen als referentie. Het is een opvolg-pad voor mensen die nieuwsgierig zijn maar nog geen 3-weg willen, of na een 3-weg meer willen nazien.

Hoe je beslist tussen 3-weg en Mini-ELEVA:
- Prospect wil een persoonlijk gesprek? → 3-weg.
- Prospect wil eerst zelf nadenken, kijken, vragen stellen? → Mini-ELEVA.
- Twijfel? Begin met Mini-ELEVA, escaleer naar 3-weg als ze er klaar voor zijn.

WAT JE VANDAAG DOET

Drie kleine oefeningen, één per skill. Plus: vraag je sponsor of hij/zij deze week beschikbaar is voor een eerstvolgende 3-weg, zodat het kan zodra het nodig is.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap5-bezwaren-uitleg",
        label: "Mentor licht de 4-stappen-methode + Feel-Felt-Found toe",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap5-bezwaren-roleplay",
        label: "Doe 10 min roleplay met de Mentor: 3 bezwaren uit de top-21",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Geen tijd, geen geld, ken al iemand. Externe + interne mix.",
      },
      {
        id: "core-v9-stap5-3weg-uitleg",
        label: "Mentor licht het 3-weg-gesprek toe (5 stappen op hoog niveau)",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "Edification, intro, inhoud, vraag aan prospect, vervolgafspraak. Diepe duik in stap 8.",
      },
      {
        id: "core-v9-stap5-mini-eleva-uitleg",
        label: "Mentor licht Mini-ELEVA toe + beslis-boom (3-weg of Mini-ELEVA?)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap5-sponsor-3weg-beschikbaar",
        label: "Vraag je sponsor of 'ie deze week beschikbaar is voor jouw eerstvolgende 3-weg",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      ...afsluitStappenV9(5),
    ],
    waarInEleva: [
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Bezwaren-scripts", route: "/scripts?cat=bezwaar" },
    ],
    waaromWerktDit: {
      tekst:
        "Skills moet je in je gereedschapskist hebben voordat je ze nodig hebt. Een prospect die nu interesse toont gaat niet wachten tot jij volgende week de bezwaren-skills leert. Liever vandaag op basis-niveau dan straks niet klaar.",
      bron: "Sprint-volgorde-principe",
    },
  },

  // ---------- IN BEWEGING (6-14) ----------
  {
    nummer: 6,
    titel: "📱 Social-media-basistraining + Brookes 3-stappen + eerste freebie",
    fase: 2,
    faseDoel:
      "Eerst de social-media-basis leren (hook, carrousel, reel, story, hashtags), daarna één post maken volgens Waarde + Verhaal + Zachte uitnodiging, en je eerste freebie uit de toolkit kiezen + plaatsen.",
    watJeLeert: `Tijd om social media in te zetten 💟

Tot nu was je werk vooral 1-op-1 (uitnodigingen) of in de eerste post (pre-post of 21-dagen-post). Vanaf nu gebruik je social media als brede zichtbaarheid. Maar voordat we daar instappen, eerst de basis. Want zonder die basis is een reel maken voor de meeste mensen gewoon niet haalbaar.

SOCIAL-MEDIA-BASIS, GEEN OPTIE OM TE SKIPPEN

Vandaag bekijk je vijf korte filmpjes (in totaal ongeveer 15 minuten) over de elementen waar je vanaf nu mee werkt:

**Hook.** De eerste seconde van een Reel of Story. Waarom kijken mensen door of scrollen ze door. Een goede hook werkt in 1 zin.

**Carrousel.** Meerdere foto's/slides achter elkaar. Welke onderwerpen werken hier het beste voor, en hoe bouw je er één op die mensen blijft swipen.

**Reel.** Korte verticale video tot 90 seconden. Welke vormen werken (talking head, voice-over, transitions), hoe lang moet 'ie zijn, en wat zet je in het bijschrift.

**Story.** Vluchtig, 24 uur zichtbaar. Daag uit met stickers, polls, vragen. Hier krijg je vaak het meeste menselijke contact.

**Hashtags + bijschrift.** Hoe gebruik je hashtags zonder dat het spam wordt, en wat zet je in een bijschrift dat mensen het wél lezen.

Deze basis komt later terug in stap 12 (Stories + Reels verdieping). Voor nu: je hebt het gezien, je hebt een woordenschat, je kunt aan de slag.

DE BROOKES-FORMULE VOOR JE EERSTE BREDE POST

Iedereen voelt zich vrij om te delen wat 'ie maar wil op social, maar drie elementen werken zo'n beetje altijd:

**Waarde.** Iets nuttigs voor de lezer. Een inzicht, een tip, een herkenbare observatie. Niet over jezelf, niet over je product.

**Verhaal.** Een korte concrete situatie of ervaring. Eerlijk, niet geschminkt. Hier komt jouw stem in.

**Zachte uitnodiging.** Geen "koop dit", wel iets als "wil je hier meer over weten? Reageer met X" of "ik heb een freebie hierover, link in bio".

DE EERSTE FREEBIE

In je freebie-toolkit staan een paar bots / minisites die je gratis kunt delen. Vandaag kies je er één die past bij wat jij wil uitstralen, en je deelt 'm in je eerste brede post.

Welke past het beste? De Mentor helpt kiezen op basis van je verhalen uit stap 4. Heb je iets met energie + focus? Pak die. Iets met hormonen? Die. Iets met productadvies algemeen? Ook prima.

REAGEER BINNEN EEN UUR

Op iedere reactie (en zelfs op iedere like) reageer je binnen een uur. Gebruik het 3-soorten-mensen-DM-script dat je in de pre-post / 21-dagen-post-sidestep al hebt klaargezet. Hetzelfde script werkt op alle posts.

24-48u-FOLLOW-UP-REGEL

Eén principe om vroeg in te bouwen: prospect die contact heeft gehad, opvolg je binnen 24-48 uur. Niet later. De warmte zakt snel weg. Dit gaat verder ritme worden in stap 15.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap6-basistraining",
        label: "Bekijk de 5 social-media-basis-filmpjes (~15 min totaal)",
        verplicht: true,
        uitleg:
          "Hook, carrousel, reel, story, hashtags. Eenmalig leren, daarna heb je de basis. (TODO: media toevoegen op /core-v9/stap/6)",
      },
      {
        id: "core-v9-stap6-freebie-kiezen",
        label: "Open de freebie-toolkit en kies 1 freebie die past bij je verhaal",
        verplicht: true,
        actieRoute: "/instellingen/freebies",
        uitleg:
          "Gepersonaliseerd met jouw webshop-link. Mentor helpt kiezen op basis van je verhalen uit stap 4.",
      },
      {
        id: "core-v9-stap6-post-brookes",
        label: "Schrijf één post met de Brookes-formule (Waarde + Verhaal + Zachte uitnodiging)",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "Mentor geeft feedback voor je plaatst. Doe drie iteraties max, dan plaatsen.",
      },
      {
        id: "core-v9-stap6-post-plaatsen",
        label: "Plaats de post + freebie-link in tekst of bio",
        verplicht: true,
      },
      {
        id: "core-v9-stap6-follow-up-regel",
        label: "Leer de 24-48u-follow-up-regel (Mentor licht 'm kort toe)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap6-reageer-routine",
        label: "Reageer binnen 1 uur op iedere reactie (en like)",
        verplicht: true,
        uitleg:
          "Gebruik het 3-soorten-mensen-DM-script uit de post-sidestep. Werkt hier ook.",
      },
      ...afsluitStappenV9(6),
    ],
    waarInEleva: [
      { actie: "Freebie-toolkit", route: "/instellingen/freebies" },
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Stories-die-werken module", route: "/academy/social-media#module-8" },
    ],
    waaromWerktDit: {
      tekst:
        "Reels en carrousels lijken eenvoudig op het oog, maar zonder een paar basis-principes laat je heel veel waarde liggen. Eén keer 15 minuten leren is genoeg om de rest van Core mee uit de voeten te kunnen.",
      bron: "Brookes 3-stappen + Academy social-media-module",
    },
  },
  {
    nummer: 7,
    titel: "💡 Verdienmodel + jouw Builder-pad zichtbaar",
    fase: 2,
    faseDoel:
      "Begrijpen hoe je verdient + waar Builder-status zit + wat dat voor jou betekent. Vlak voor de 3-weg-meesterclass, want prospects gaan vragen stellen.",
    watJeLeert: `Vandaag het verdienmodel + jouw pad naar Builder 💟

Twee redenen om dit nu te doen. Eén: prospects gaan vragen stellen zodra je een 3-weg gaat doen of een Mini-ELEVA opent. Je moet kunnen uitleggen hoe het werkt. Twee: jouw eigen Builder-pad wordt nu zichtbaar als dashboard-tegel, en je gaat er expliciet aan werken vanaf nu.

HET VERDIENMODEL, IN HOOFDLIJNEN

Geen Lifeplus-handleiding uit het hoofd leren. Wel drie elementen begrijpen:

**Rang-ladder.** Lifeplus heeft rangen, van starter tot diamant en hoger. Builder is de eerste rang waar duplicatie begint te werken. De rangen erboven (Sapphire, Ruby, Emerald, Diamond) bouwen op datzelfde principe verder.

**Commissies.** Je verdient op meerdere niveaus: op je eigen klanten (productverkoop), op je team (volume-commissie), en op rangbonussen. Hoe verder je in de ladder, hoe meer lagen.

**Team-volume.** Het volume dat in jouw eerste 3 levels samen wordt besteld. Daar zit Builder ook op: 1500 IP binnen eerste 3 levels. Jouw eigen bestelling telt mee.

De Mentor doet hier een 3-vragen-quiz met je om te checken of de basis klopt.

BUILDER-STATUS, JOUW EERSTE MIJLPAAL

Op je dashboard verschijnt vanaf vandaag een Builder-tegel. Twee voorwaarden zichtbaar:

**Voorwaarde 1: minimaal 3 members met bestelling vanaf 40 IP.** Telt automatisch mee zodra een prospect via jou member wordt en die bestelling plaatst. Halfauto in ELEVA, want we zien de prospect-fase + de bestelling-aanmaak.

**Voorwaarde 2: eerste 3 levels samen >= 1500 IP.** Dit moet je zelf bijwerken vanuit Lifeplus Teams, want ELEVA heeft daar geen rechtstreekse koppeling mee. Wekelijks even je IP-stand invoeren, dan zie je waar je staat.

De Mentor herinnert je wekelijks om je IP-stand bij te werken. Zodra beide voorwaarden ✓ zijn, krijg je een Builder-bevestiging.

WAAROM BUILDER EN NIET HOGER

Builder is precies de drempel waarna jouw werk overdragbaar wordt. Vóór Builder ben jij in je eentje aan het bouwen. Vanaf Builder heb jij minimaal drie members die hetzelfde aan het leren zijn, en jij wordt hun gids. Dat is het moment waarop het kantelpunt valt.

Dezelfde ankerstappen die jou hier brengen, ga jij straks aan jouw eerste members overdragen. Daarom is alles wat jij nu leert, ook een sjabloon voor wat jij straks doorgeeft.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap7-verdienmodel-film",
        label: "Bekijk de verdienmodel-film (~10 min)",
        verplicht: true,
        uitleg: "Rang-ladder, commissies, team-volume in de basis. (TODO: media)",
      },
      {
        id: "core-v9-stap7-quiz",
        label: "Doe de 3-vragen-quiz met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap7-builder-tegel",
        label: "Bekijk jouw Builder-status-tegel op het dashboard",
        verplicht: true,
        actieRoute: "/dashboard",
        uitleg:
          "Twee voorwaarden zichtbaar. Voorwaarde 1 telt half-auto mee. Voorwaarde 2 werk je zelf wekelijks bij vanuit Lifeplus Teams.",
      },
      {
        id: "core-v9-stap7-ip-stand-eerste-invoer",
        label: "Vul je huidige IP-stand in (vanuit Lifeplus Teams)",
        verplicht: true,
        uitleg:
          "Pak je Lifeplus Teams-app erbij. Eerste 3 levels samen, hoeveel IP staat er nu? Vul in op dashboard-tegel.",
      },
      {
        id: "core-v9-stap7-eigen-vraag",
        label: "Stel de Mentor één eigen vraag over iets dat je nog niet duidelijk vond",
        verplicht: false,
        actieRoute: "/coach",
      },
      ...afsluitStappenV9(7),
    ],
    waarInEleva: [
      { actie: "Builder-status op dashboard", route: "/dashboard" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Een doel dat je kunt zien op je dashboard is een doel dat je gaat halen. Builder zichtbaar maken vanaf stap 7 zorgt dat elke ankerstap erna voor jou een betekenis krijgt.",
      bron: "Eric Worre + Lifeplus rang-systeem",
    },
  },
  {
    nummer: 8,
    titel: "💪 3-weg-meesterclass, de 5 stappen verdiept",
    fase: 2,
    faseDoel:
      "De 5 stappen van een 3-weg-gesprek volledig leren. Bezwaren uit stap 5 in zak, verdienmodel uit stap 7 in hoofd, edification-basis uit stap 4. Nu klaar voor diepte.",
    watJeLeert: `Vandaag de 3-weg-meesterclass 💟

In stap 5 heb je de basis gezien: vijf stappen op hoog niveau. Vandaag gaan we per stap dieper. Dit is de meest gebruikte vorm van introductie naar Lifeplus, en de meeste 3-wegs gaan via dit format.

DE VIJF STAPPEN, PER STAP DIEPER

**1. Edification (jij introduceert je sponsor).**

Jouw basis-zin uit stap 4. Tussen 1 en 3 zinnen, niet langer. Drie elementen werken altijd: wie is je sponsor, wat doet 'ie al een tijd, en hoe heeft 'ie jou geholpen.

Wat NIET werkt: alleen "hij is heel goed" zonder waarom. Niet "ze is mijn upline" (te zakelijk). Wel iets persoonlijks dat jou en je sponsor verbindt.

**2. Intro (sponsor stelt zichzelf voor + vraagt iets aan prospect).**

Sponsor neemt het over. Een korte intro (1-2 min) en een of twee vragen aan de prospect om iets over haar of hem te weten. "Wat doe je nu?", "Wat zou je willen veranderen?", "Hoe ken jij [jouw naam]?"

Doel hier is niet info verzamelen, het is de prospect uit de luisterstand halen. Een gesprek waar je beiden in praat, niet een verkooppraatje.

**3. Inhoud (sponsor vertelt het verhaal).**

Hier komt het meeste materiaal. Sponsor vertelt over het werk, de webshop, de producten, en hoe ze ermee bouwt. Niet de hele Lifeplus-handleiding, wel een verhaal dat raakvlakken heeft met wat de prospect zojuist heeft verteld.

Belangrijk: jij doet HIER niets behalve actief luisteren. Geen aanvullingen, geen onderbreking. Je sponsor leidt. Jij leert van het luisteren.

**4. Vraag aan prospect ("wat spreekt je het meest aan?").**

Na het verhaal stelt sponsor één open vraag. "Wat valt je het meest op?" of "Wat spreekt je hier het meeste in aan?" (NIET: "wat vond je ervan?", dat lokt een vrijblijvend "leuk" uit dat je niet verder helpt).

De prospect antwoordt, daar komt vaak het echte aanknopingspunt vandaan.

**5. Vervolgafspraak (concreet, dag en tijd).**

Geen "ik laat van me horen". Wel "wat dacht je van [dag] om [tijd]?". Concreet, in de agenda, weet wat het volgende moment is.

WAT JE VANDAAG DOET

Mentor loopt de 5 stappen door voor één specifieke prospect uit jouw top-20 (of uit je freebie-leads). Niet "in het algemeen", wel "voor deze persoon, wat zou jij in stap 1 zeggen". Dat helpt om het concreet te maken.

Daarna open je de 3-weg-scripts en kies welke variant past. Niet woordelijk overnemen, wel inspiratie voor jouw eigen woorden.

En bevestig met je sponsor wanneer 'ie kan voor jouw eerstvolgende 3-weg deze week (de afspraak uit stap 5 gebruik je hier voor).

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap8-meesterclass-film",
        label: "Bekijk de meesterclass-film over het 3-weg-gesprek (~10 min)",
        verplicht: true,
        uitleg: "TODO: media op /core-v9/stap/8",
      },
      {
        id: "core-v9-stap8-prospect-doorlopen",
        label: "Mentor loopt de 5 stappen door voor één specifieke prospect uit jouw lijst",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap8-3weg-scripts",
        label: "Open de 3-weg-scripts en kies welke variant past",
        verplicht: true,
        actieRoute: "/scripts?cat=uitnodiging",
        actieRouteLabel: "Open 3-weg-scripts →",
      },
      {
        id: "core-v9-stap8-sponsor-bevestigen",
        label: "Bevestig met je sponsor wanneer 'ie kan voor jouw eerstvolgende 3-weg deze week",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      ...afsluitStappenV9(8),
    ],
    waarInEleva: [
      { actie: "3-weg-scripts", route: "/scripts?cat=uitnodiging" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Het verschil tussen iemand die theoretisch een 3-weg snapt en iemand die er staat als prospect kijkt: oefenen met één specifieke persoon in beeld. De Mentor laat je dat oefenen voor het echt is.",
      bron: "Worre + Lifeplus 3-weg-format",
    },
  },
  {
    nummer: 9,
    titel: "🤝 Je volgende 3-weg starten (of inplannen als nog niet gebeurd)",
    fase: 2,
    faseDoel:
      "Een echte 3-weg met een warme prospect, samen met je sponsor. Werkt op iedereen die je via top-20 of via post-sidestep hebt binnengehaald.",
    watJeLeert: `Vandaag een 3-weg in praktijk brengen 💟

Inmiddels heb je veel klaarstaan. Top-20 verzonden, eerste post live, eerste freebie ingezet, bezwaren-skills en 3-weg-meesterclass achter de rug. Vandaag is het moment om een 3-weg te starten als dat er nog niet is, of de volgende in te plannen als je er al een hebt gedaan.

ALS JE NOG GEEN 3-WEG HEBT GEHAD

Soms loopt het pad waardoor je nog niet aan een 3-weg toe bent gekomen. Geen probleem, maar wel het moment om er nu focus op te leggen. Zoek samen met je sponsor één warme prospect uit (uit top-5, of uit de reageerders op je posts, of uit je freebie-leads), en plan een 3-weg in.

ALS JE AL EEN 3-WEG HEBT GEHAD

Dan plan je nu de volgende. Niet als plicht-rondje, wel om het patroon erin te krijgen. De tweede 3-weg voelt vaak heel anders dan de eerste, en je leert er weer wat anders van.

DE 5 STAPPEN DIE JE GEBRUIKT

Direct uit stap 8: edification → intro → inhoud → vraag → vervolgafspraak. Houd ze open op een tabblad als je 'm voor het eerst doet, dat is geen zwaktebod.

VOOR HET GESPREK

- Bevestig dag en tijd met sponsor en prospect een paar uur van tevoren.
- Stuur prospect één korte herinnering ("Heel fijn dat we elkaar straks spreken, tot zo!").
- Open je edification-zin in /mijn-zinnen zodat je 'm helder voor je hebt.
- Check kort de FORM-context die je over deze prospect hebt (Mentor laat zien wat 'ie weet).

TIJDENS HET GESPREK

- Jij doet stap 1 (edification), daarna luistert je sponsor het over.
- Niet onderbreken, niet aanvullen tijdens stap 3.
- Bij stap 5 sluit jij af met de vervolgafspraak.

NA HET GESPREK

Korte reflectie met de Mentor. Wat ging goed? Wat onhandig? Wat heeft prospect gezegd dat je nog niet had voorzien? Dit voedt straks de edification-verdieping in stap 17.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap9-warme-prospect",
        label: "Kies 1 warme prospect voor de 3-weg",
        verplicht: true,
        uitleg:
          "Uit top-5, uit reageerders op je posts, of uit freebie-leads. Eén die warm voelt.",
      },
      {
        id: "core-v9-stap9-uitnodiging-script",
        label: "Stuur stap-1-introductie naar sponsor + prospect volgens script",
        verplicht: true,
        actieRoute: "/scripts?cat=uitnodiging",
      },
      {
        id: "core-v9-stap9-plan-en-doe",
        label: "Plan de 3-weg in + doorloop samen met sponsor de 5 stappen",
        verplicht: true,
      },
      {
        id: "core-v9-stap9-reflectie",
        label: "Korte reflectie met de Mentor: wat ging goed, wat onhandig",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Voedt straks de edification-verdieping in stap 17.",
      },
      ...afsluitStappenV9(9),
    ],
    waarInEleva: [
      { actie: "Uitnodig-scripts", route: "/scripts?cat=uitnodiging" },
      { actie: "Mijn edification-zin", route: "/mijn-zinnen" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Het verschil tussen begrijpen en kunnen zit in één gesprek met een echte prospect. Je sponsor is erbij, je hebt alles voorbereid, en je leert in praktijk waar geen masterclass je op kan voorbereiden.",
      bron: "Worre Go Pro",
    },
  },
  {
    nummer: 10,
    titel: "🎙️ FORM-verdieping voor je top-5",
    fase: 2,
    faseDoel:
      "FORM (Family, Occupation, Recreation, Money) als gespreks-anker. Pas NA de eerste 3-weg-praktijk, want dan weet je voor welke contacten FORM-context echt waardevol is.",
    watJeLeert: `Vandaag FORM, het gespreks-anker 💟

FORM staat voor Family, Occupation, Recreation, Money. Vier onderwerpen die in een persoonlijk gesprek altijd ergens terugkomen, en die je gebruikt om iemand op een natuurlijke manier te leren kennen voordat je iets voorstelt.

GEEN INTERVIEW-CHECKLIST, WEL GESPREKS-ANKER

FORM is niet een formulier waar je doorheen werkt. Wel een set onderwerpen waarvan je weet dat ze in een ontspannen gesprek vanzelf langskomen. Je let er bewust op, je onthoudt wat er gezegd wordt, en je gebruikt het later.

**Family.** Hoe groot is haar of zijn gezin, partner, kinderen, dichtbij familie. Wat is daar belangrijk in.

**Occupation.** Wat doet 'ie voor werk. Hoe ervaart 'ie dat. Tevreden, zoekend, vermoeid, ambitieus?

**Recreation.** Wat doet 'ie buiten werk. Sport, hobby's, vrijwilligerswerk, reizen?

**Money.** Niet "wat verdien je", wel "hoe sta je in je financiële situatie". Krap, comfortabel, op zoek naar meer? Dit komt vaak indirect naar voren in andere onderwerpen.

WAAROM NU PAS, NIET IN STAP 2

In Sprint heeft FORM een eigen dag (dag 13), en dat is met opzet ná de eerste 3-wegs. Want pas dan weet je voor wie FORM-context echt waardevol is. Iemand met wie je nooit een 3-weg gaat doen heeft geen FORM-profiel nodig. Iemand uit je top-5 die je echt warm wil houden, wel.

WAT JE VANDAAG DOET

Mentor licht FORM toe in 2 minuten. Daarna loop je samen door je top-5: wat weet je al per onderwerp, wat ontbreekt? De Mentor noteert dit per prospect in jouw profiel, zodat hij straks bij elke 3-weg-voorbereiding al weet wat je over deze persoon hebt onthouden.

En tot slot: oefen FORM in een aankomende reguliere ontmoeting. Spontaan, geen interview-toon. Iemand uit je top-5 die je toch deze week spreekt? Let bewust op de vier onderwerpen, en update na afloop je notitie.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap10-form-uitleg",
        label: "Mentor licht FORM toe (Family, Occupation, Recreation, Money)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap10-top5-doorlopen",
        label: "Loop met de Mentor de FORM-vragen door voor je top-5",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Wat weet je al, wat ontbreekt. Mentor noteert per prospect in je profiel.",
      },
      {
        id: "core-v9-stap10-praktijk",
        label: "Oefen FORM in een aankomende reguliere ontmoeting (spontaan)",
        verplicht: false,
        uitleg:
          "Iemand uit top-5 die je toch deze week spreekt? Let op de 4 onderwerpen, update notitie achteraf.",
      },
      ...afsluitStappenV9(10),
    ],
    waarInEleva: [
      { actie: "Je top-5 in je namenlijst", route: "/namenlijst" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Het verschil tussen een generieke uitnodiging en een rake uitnodiging zit in wat je echt over iemand weet. FORM is daarvoor het simpelste kader.",
      bron: "Sprint dag 13 + Worre",
    },
  },
  {
    nummer: 11,
    titel: "📊 5 typen prospects + funnel-onderhoud",
    fase: 2,
    faseDoel:
      "Categoriseren van top-20 + freebie-leads in 5 typen, afspreken minimaal 5 nieuwe namen per week. Funnel als ritme.",
    watJeLeert: `Vandaag overzicht maken in je prospects 💟

Inmiddels heb je behoorlijk wat mensen in beeld. Top-20 verstuurd. Eerste post heeft mensen binnengebracht. Freebie zorgt voor instroom. Zonder structuur wordt dat al snel een wirwar.

DE VIJF TYPEN PROSPECTS

Niet iedereen is op hetzelfde punt, en niet iedereen verdient dezelfde aandacht. Vijf typen helpen om je tijd in te delen:

**1. Direct geïnteresseerd.** Stelt vragen, vraagt zelf info, lijkt klaar om mee te kijken. Plan een 3-weg of stuur Mini-ELEVA, niet uitstellen.

**2. Open maar voorzichtig.** Reageert positief maar wil eerst nadenken. Geef ruimte, stuur na 2-3 dagen iets om over na te denken, geen druk.

**3. Nieuwsgierig niet beschikbaar.** Interesse er is, maar timing klopt niet (verhuizing, nieuwe baan, persoonlijke fase). Markeer voor over een maand, contact warm houden zonder pushen.

**4. Vriendelijk niet bezig.** Reageert beleefd maar het is duidelijk niets voor nu. Loslaten, contact warm houden via socials, geen actieve uitnodiging.

**5. Niet voor jou bedoeld.** Reageert niet, of negatief. Loslaten en niet meer actief benaderen. Verdien je tijd niet aan trekken zonder beweging.

De Mentor noteert per type een passende vervolgactie, en koppelt dat aan elke prospect in jouw namenlijst.

FUNNEL ALS RITME

Belangrijk om vroeg in beeld te brengen: jouw lijst is nooit klaar. Elke week komen er namen bij, en je laat actief namen los als ze in type 5 blijven hangen.

Spreek met jezelf af: minimaal 5 nieuwe namen per week. Kan via een gesprek met iemand uit je netwerk, via een nieuwe Story-reactie, via een nieuwe freebie-lead.

VRIJ-EN-OPEN-FREEBIE-LEADS

Check je freebie-opt-in-lijst (zit in dashboard). Wie heeft sinds vorige week een freebie afgemaakt? Markeer ze met het juiste type en bepaal de vervolgactie. Niet allemaal direct contact, wel allemaal in beeld.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap11-categoriseer",
        label: "Categoriseer je top-20 + freebie-leads in 5 typen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "Direct interesse, open maar voorzichtig, nieuwsgierig niet beschikbaar, vriendelijk niet bezig, niet voor jou. Mentor noteert vervolgactie per type.",
      },
      {
        id: "core-v9-stap11-spreek-af",
        label: "Spreek met jezelf af: minimaal 5 nieuwe namen per week",
        verplicht: true,
        uitleg: "Lijst is nooit klaar. Mentor onthoudt deze afspraak en herinnert je.",
      },
      {
        id: "core-v9-stap11-freebie-check",
        label: "Open je freebie-opt-in-lijst en kijk welke nieuwe leads je deze week kreeg",
        verplicht: true,
        actieRoute: "/statistieken",
      },
      ...afsluitStappenV9(11),
    ],
    waarInEleva: [
      { actie: "Naar je namenlijst", route: "/namenlijst" },
      { actie: "Freebie-stats", route: "/statistieken" },
    ],
    waaromWerktDit: {
      tekst:
        "Zonder typering verdwijnt het gemiddelde van je lijst. Met typering verdeel je je aandacht waar 'ie ergens toe leidt. Top-20 wordt zo een werkende lijst, geen plichtmatige verzameling.",
      bron: "Eric Worre, Go Pro",
    },
  },
  {
    nummer: 12,
    titel: "📸 Stories + Reels + Freebie-aankondiging (verdieping van stap 6)",
    fase: 2,
    faseDoel:
      "Dagelijkse Stories oppakken, freebie zichtbaar maken via Stories + Reels. Drie onderwerp-richtingen. Voortbouwen op de social-media-basistraining uit stap 6.",
    watJeLeert: `Vandaag bouw je voort op je social-media-basis 💟

In stap 6 heb je de basis-elementen gezien. Vandaag ga je daar dieper op door, en je maakt je eerste Reel.

DAGELIJKSE STORIES, HET GEMAK-VAN-LICHT-CONTACT

Stories zijn het laagdrempeligste onderdeel van social. Vluchtig, 24 uur zichtbaar, mag onaf, mag rommelig. Maar wel dagelijks, anders raken mensen je kwijt.

Drie onderwerp-richtingen werken altijd:

**Lifestyle.** Hoe je dag eruitziet, een glimp van wat jij doet, iemand uit je gezin (met permissie), je werkplek. Geen mooie plaatjes nodig.

**Waarde.** Een tip, een inzicht, een herkenbaar gevoel. Mag 1 zin zijn met een mooie achtergrond.

**Eigen verhaal.** Iets wat je deze week leert, iets wat je merkt aan jezelf of je werk. Eerlijk en zonder schmink.

Plan een vast moment voor je dagelijkse Story. Ochtend, lunch, of avond, wat past in jouw leven. Niet onderhandelen, gewoon vast inplannen.

JOUW EERSTE REEL

Reels vergen iets meer voorbereiding dan Stories, maar zijn nog steeds doable. Vandaag maak je je eerste, samen met de Mentor.

Mentor levert het script en de structuur:
- Hook (eerste 2 seconden, wat trekt mensen aan)
- Inhoud (15-45 seconden, één punt of één verhaal)
- Call-to-action of zachte uitnodiging (5 seconden)

Jij filmt 'm, monteert 'm, en plaatst 'm. Een Reel hoeft niet perfect, 'ie hoeft eerlijk te zijn.

FREEBIE ZICHTBAAR VIA STORIES

Plaats deze week minimaal één Story die je freebie aankondigt. Met de link erbij (swipe-up of link-in-bio). Mensen die je Stories volgen kijken vaak meer dan je posts, en een Story-link werkt heel direct.

REAGEER BINNEN 1 UUR

Hetzelfde principe als bij posts. Op DM's en sticker-reacties: binnen 1 uur. Mentor staat klaar voor on-the-fly opener-hulp bij DM's.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap12-eerste-story",
        label: "Plaats vandaag minimaal één Story (kies een richting)",
        verplicht: true,
        uitleg: "Lifestyle, waarde, of eigen verhaal.",
      },
      {
        id: "core-v9-stap12-freebie-story",
        label: "Plaats een Story die je freebie aankondigt (met link)",
        verplicht: true,
      },
      {
        id: "core-v9-stap12-vast-moment",
        label: "Plan een vast dagelijks Story-moment in",
        verplicht: true,
        uitleg: "Ochtend, lunch, of avond. Wat past in jouw leven.",
      },
      {
        id: "core-v9-stap12-eerste-reel",
        label: "Maak je eerste Reel met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Mentor levert script + structuur, jij filmt + plaatst.",
      },
      {
        id: "core-v9-stap12-reageer-dms",
        label: "Reageer binnen 1 uur op DM's en sticker-reacties",
        verplicht: true,
      },
      {
        id: "core-v9-stap12-academy",
        label: "Bekijk de Stories-die-werken-module in de Academy",
        verplicht: false,
        actieRoute: "/academy/social-media#module-8",
      },
      ...afsluitStappenV9(12),
    ],
    waarInEleva: [
      { actie: "Stories-die-werken module", route: "/academy/social-media#module-8" },
      { actie: "Freebie-toolkit", route: "/instellingen/freebies" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Stories en Reels zijn niet hetzelfde gereedschap voor hetzelfde doel. Stories houden je in het zicht, Reels bouwen bereik. Dagelijks Story + één Reel per week = goed werkbaar ritme.",
      bron: "Brookes social-media-school",
    },
  },
  {
    nummer: 13,
    titel: "🎯 Niche-aanscherping met de Mentor",
    fase: 2,
    faseDoel:
      "Op basis van wat de Mentor inmiddels over jou weet uit alle gesprekken: aanscherpen waar jouw natuurlijke niche ligt. Voorbereiding op latere uitbreiding (extra freebies, gerichte content).",
    watJeLeert: `Vandaag bouwen we voort op alles wat je tot nu hebt verteld 💟

In de eerste twaalf ankerstappen heb je veel met de Mentor gepraat. Over jezelf, je verhalen, je passies, je producten, je prospects. De Mentor heeft alles onthouden. Vandaag haalt 'ie er een conclusie uit: waar lijkt jouw natuurlijke niche te liggen?

WAAROM NICHE?

Tot nu heb je breed gewerkt. Je hebt iedereen in je top-20 op je lijst, je hebt een algemene freebie, je hebt brede posts. Dat is goed voor de start. Maar voor de volgende fase werkt het beter om iets meer focus te kiezen.

Niet omdat je alleen nog over één onderwerp mag posten. Wel omdat een herkenbaar thema (slaap, energie, hormonen, lifestyle, ondernemen) zorgt dat mensen je gaan herinneren als "die over X".

WAT DE MENTOR HEEFT GEZIEN

Vandaag laat de Mentor je zijn observatie zien. Niet als oordeel, wel als spiegel. Bijvoorbeeld:

> "Ik hoor in je verhalen vaak iets terug over slaap en hoe je dat zelf hebt zien veranderen. Je top-5 zit ook veel in die hoek, en je freebie-keuze leunde er ook tegenaan. Dat zou kunnen wijzen op een natuurlijke niche rond slaap + herstel. Wil je daar bewust meer in gaan staan?"

Of:

> "Ik merk dat je werk-thema vaak terugkomt. Mensen die het druk hebben, ondernemers, mensen die meer energie zoeken voor hun dag. Past dat?"

JE BEPAALT, NIET DE MENTOR

De observatie is een aanbieding, geen oordeel. Je mag tegen-spreken. "Nee, ik denk juist dat ik me meer wil richten op X." Dan past de Mentor zijn beeld aan.

Belangrijk: dit is niet "kies nu één onderwerp en blijf daarbij". Het is "scherp wat jouw vertrekpunt is voor de komende ankerstappen". Je kunt later altijd verschuiven.

VOORBEREIDING OP TWEEDE FREEBIE LATER

Zodra je niche helderder is, kunnen er gerichtere freebies bij. Maar nog niet vandaag, en niet ondoordacht. Je eerste freebie blijft je belangrijkste tool voor nu, juist omdat dezelfde freebie meerdere keren gebruiken meer instroom oplevert dan iedere keer een nieuwe.

OPDRACHT VOOR DEZE WEEK

Plaats deze week 2-3 posts of Stories die expliciet binnen je niche vallen. Test of het voor jou ook in praktijk klopt, of dat het wringt. Reflecteer dat met de Mentor in een volgende sessie.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap13-mentor-spiegel",
        label: "Vraag de Mentor: waar denk je dat mijn natuurlijke niche ligt?",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "Op basis van al je gesprekken tot nu. Mentor geeft observatie, jij bevestigt of stuurt bij.",
      },
      {
        id: "core-v9-stap13-niche-vastleggen",
        label: "Leg je niche-richting vast in je profiel (mag later wijzigen)",
        verplicht: true,
        inlineActie: {
          type: "tekst",
          slug: "niche-richting",
          label: "Mijn niche-richting",
          instructie:
            "Eén zin: waar wil je herkenbaar in zijn? Niet definitief, wel een vertrekpunt voor de komende stappen.",
          placeholder: "Bv. 'Slaap + herstel voor drukke ondernemers' of 'Hormonen rondom 40+'",
          maxTekens: 200,
        },
      },
      {
        id: "core-v9-stap13-niche-posts",
        label: "Plan 2-3 posts of Stories binnen je niche voor deze week",
        verplicht: true,
        uitleg: "Test of het in praktijk klopt. Reflectie volgende sessie.",
      },
      ...afsluitStappenV9(13),
    ],
    waarInEleva: [
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Mijn zinnen", route: "/mijn-zinnen" },
    ],
    waaromWerktDit: {
      tekst:
        "Een goede niche werkt als een magneet voor het juiste publiek. Geen niche werkt als een lege ruimte. Je hoeft het niet voor altijd vast te leggen, wel iets te kiezen om mee te beginnen.",
      bron: "Mark Brookes + Russell Brunson (DotCom Secrets)",
    },
  },
  {
    nummer: 14,
    titel: "👀 Members en netwerkers herkennen + ideale klant",
    fase: 2,
    faseDoel:
      "Onder klanten herkennen wie zelf een gratis webshop zou willen. Ideale-klant-profiel scherper maken op basis van eerste ervaring.",
    watJeLeert: `Vandaag ga je twee dingen scherp krijgen 💟

EÉN, MEMBERS EN NETWERKERS HERKENNEN

Onder de mensen die jouw producten kopen of in je klantomgeving terechtkomen zit een specifieke subgroep: mensen die niet alleen klant willen zijn, maar zelf ook een webshop zouden willen runnen. Dat zijn jouw potentiële members en netwerkers.

Hoe herken je ze? Niet aan een sticker op hun voorhoofd, wel aan een combinatie van signalen:

**Ondernemend.** Ze stellen vragen over hoe de webshop werkt, niet alleen over de producten. Ze vragen door: "en wat verdien je daarmee?", "is dat veel werk?", "kan iedereen dit?"

**Mensen-mens.** Ze houden van contact, hebben veel mensen om zich heen, voelen zich op hun gemak bij andere mensen.

**Doorzettingsvermogen.** Ze blijven aan iets bouwen ook als het traag gaat. Niet "alles ineens", wel "stap voor stap doorgaan".

**Leerbaar.** Ze accepteren dat ze iets nieuws moeten leren en zoeken zelf naar info. Niet "vertel mij alles", wel "ik zoek het zelf uit en kom terug met vragen".

Niet alle vier hoeven gelijk in beeld te komen. Twee is genoeg om iemand op je radar te zetten als potentieel netwerker.

Vandaag markeer je 2-3 klanten in je namenlijst met "netwerker-energie".

TWEE, IDEALE-KLANT-PROFIEL SCHERPER

Met wat je inmiddels weet van je eerste klanten (welke wel goed lopen, welke moeite hebben, welke makkelijk doorvragen) bouw je nu een scherper beeld van jouw ideale klant. Niet "iedereen die wil kopen", wel "voor wie kan ik het meest betekenen".

De Mentor stelt je vragen om dit profiel uit te tekenen:

- Leeftijdsrange
- Levensfase (jong gezin, kinderen het huis uit, eigen leven na carriere)
- Werksituatie
- Wat ze zoeken (energie, slaap, hormonen, lifestyle, ondernemen)
- Wat hen tegenhoudt om in beweging te komen

Niet om mensen buiten te sluiten. Wel om je gerichte communicatie scherper te krijgen.

VOORBEREIDING WEBSHOP-UITNODIGING

Voor 1 klant die je vandaag met "netwerker-energie" markeert, bereid je alvast een webshop-versie van de uitnodiging voor. Niet versturen, wel klaarzetten. Mentor helpt je 'm in jouw stem schrijven.

In stap 15 of 16 stuur je 'm pas. Vandaag is voorbereiding.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap14-netwerker-markeren",
        label: "Markeer in je namenlijst 2-3 klanten met netwerker-energie",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg: "Ondernemend, mensen-mens, doorzettingsvermogen, leerbaar.",
      },
      {
        id: "core-v9-stap14-ideale-klant",
        label: "Praat 5 min met de Mentor: 'voor wie kan ik het meest betekenen?'",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Bouwt profielblok 'ideale klant' in jouw Mentor-profiel.",
      },
      {
        id: "core-v9-stap14-webshop-uitnodiging-voorbereiden",
        label: "Bereid voor 1 klant een webshop-versie van de uitnodiging voor (niet versturen)",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Klaarzetten. Versturen in stap 15 of 16.",
      },
      ...afsluitStappenV9(14),
    ],
    waarInEleva: [
      { actie: "Naar je namenlijst", route: "/namenlijst" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Niet elke klant wil het werk zelf doen. Wie wel, herken je aan een paar signalen. Door die actief te zien, vind je je toekomstige team in je eigen klantenkring in plaats van bij volslagen onbekenden.",
      bron: "Worre + Lifeplus-duplicatie-principe",
    },
  },

  // ---------- BUSINESS-RITME (15-21) ----------
  {
    nummer: 15,
    titel: "👋 Klantcontact + opvolg-routine als ritme",
    fase: 3,
    faseDoel:
      "Follow-up als ritme. Bestaande klanten via hercontact-berichten in beweging houden. Webshop-uitnodiging die je in stap 14 hebt voorbereid: nu versturen of nog wachten?",
    watJeLeert: `Vandaag krijgt opvolgen een vaste plek 💟

Tot nu was opvolgen iets dat je deed wanneer je eraan dacht. Vanaf nu wordt het een ritme. Niet omdat het moet, wel omdat het een van de meest onderschatte succesfactoren in het werk is.

OPVOLG-RITME OP DRIE NIVEAUS

**Niveau 1: prospects met open contact.** Mensen die je iets hebt gestuurd of waarmee een 3-weg is geweest, maar die nog niet hebben besloten. Opvolgen binnen 24-48 uur, daarna nogmaals na 5-7 dagen, en dan eventueel weer na 2-3 weken. Niet pushen, wel laten zien dat je er bent.

**Niveau 2: bestaande klanten.** Mensen die hebben gekocht. Even contact, vragen hoe het ervaren wordt, of er nog vragen zijn. Niet meteen weer iets verkopen, eerst de relatie warm houden. Eén keer per maand is genoeg, vaker bij actief programma.

**Niveau 3: stille klanten.** Mensen die ooit hebben gekocht maar al een tijd niet meer. Soms is het beter om los te laten, soms loont een persoonlijk berichtje. De Mentor helpt je bepalen welke je benadert.

WAT JE VANDAAG DOET

Drie kleine acties:

**1.** Voor 3 prospects in je lijst plan je een opvolg-herinnering deze week. Spreid over de week, niet alle drie op dezelfde dag.

**2.** Stuur 3 bestaande klanten een persoonlijk hercontact-bericht. Geen verkoop-bericht, wel "hoe gaat het sinds je producten?" of "Hé ik dacht aan je, hoe loopt het bij jou?".

**3.** Stel een vast wekelijks follow-up-blok in je agenda in. Bijvoorbeeld dinsdagmiddag een uur, "follow-up tijd". Ritme is het ding, niet de individuele inspanning.

EN DE WEBSHOP-UITNODIGING UIT STAP 14?

Als de klant uit stap 14 nog steeds een goede match voelt, stuur je 'm vandaag. Mentor checkt eerst even of de toon goed staat. Stuur niet als je twijfelt, dan wacht je tot het natuurlijk voelt.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap15-opvolg-herinneringen",
        label: "Plan voor 3 prospects een opvolg-herinnering deze week",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg: "Spreid over de week.",
      },
      {
        id: "core-v9-stap15-hercontact-klanten",
        label: "Stuur 3 bestaande klanten een persoonlijk hercontact-bericht",
        verplicht: true,
        uitleg:
          "Geen verkoop. Wel 'hoe gaat het sinds je producten?' of vergelijkbaar.",
      },
      {
        id: "core-v9-stap15-vast-follow-up-blok",
        label: "Stel een vast wekelijks follow-up-blok in je agenda in",
        verplicht: true,
        uitleg: "Bv. dinsdagmiddag een uur. Ritme is het ding.",
      },
      {
        id: "core-v9-stap15-stille-klanten",
        label: "Check welke klanten stil staan: bericht of laten liggen?",
        verplicht: false,
        actieRoute: "/klant",
      },
      {
        id: "core-v9-stap15-webshop-uitnodiging-versturen",
        label: "Verstuur de webshop-uitnodiging uit stap 14 (alleen als het natuurlijk voelt)",
        verplicht: false,
        actieRoute: "/coach",
        uitleg: "Mentor checkt toon. Niet versturen bij twijfel, wachten tot het klopt.",
      },
      ...afsluitStappenV9(15),
    ],
    waarInEleva: [
      { actie: "Naar je namenlijst", route: "/namenlijst" },
      { actie: "Klantomgeving-overview", route: "/klant" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Het meeste werk lukt niet op het eerste contact. Het lukt op het vijfde, achtste, tiende. Niet door aandringen, wel door zichtbaar te blijven op een manier die respectvol voelt.",
      bron: "Worre + Brookes follow-up-principe",
    },
  },
  {
    nummer: 16,
    titel: "🔁 Tweede 3-weg-iteratie + reflectie op patroon",
    fase: 3,
    faseDoel:
      "Tweede 3-weg, dit keer met meer eigen leiding. Reflectie op wat in twee 3-wegs constant is en wat per prospect verschilt.",
    watJeLeert: `Vandaag een volgende 3-weg, met meer eigen leiding 💟

Inmiddels heb je minstens één 3-weg gehad in stap 9. Vandaag de volgende. Het verschil zit niet in een nieuwe techniek, wel in dat je nu iets meer eigen invloed neemt.

WAT IS ANDERS DAN STAP 9

In stap 9 was je sponsor de hoofdspreker. Nu mag jij iets meer ruimte nemen:

- Edification-zin in stap 1 kun je iets meer variëren op deze specifieke prospect
- Je mag bij stap 3 (inhoud) wat aanvullen vanuit jouw eigen verhaal, niet alleen luisteren
- Je mag aan het einde een eigen vraag stellen aan de prospect, niet alleen sponsor

KIES JE PROSPECT

Tweede warme prospect. Mag uit dezelfde top-5 zijn (iemand anders), mag een nieuwe lead zijn, mag iemand uit de freebie-instroom zijn. Iemand die warm voelt.

PLANNING + UITVOERING

Zelfde format als stap 9: plan met sponsor + prospect, doorloop 5 stappen, korte reflectie achteraf.

REFLECTIE OP PATROON

Het belangrijkste onderdeel van vandaag komt NA het gesprek. Mentor stelt je vragen:

- Wat was in beide 3-wegs hetzelfde?
- Wat was anders, en waardoor kwam dat?
- Welke zin van jouw edification werkte beter (of slechter) dan de eerste keer?
- Welke vraag van de prospect verraste je?

Mentor noteert deze observaties. Ze voeden de edification-verdieping in stap 17.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap16-prospect-kiezen",
        label: "Kies een nieuwe warme prospect voor deze 3-weg",
        verplicht: true,
        uitleg:
          "Uit top-5, freebie-leads, of reageerders op posts. Iemand die warm voelt.",
      },
      {
        id: "core-v9-stap16-plan-en-doe",
        label: "Plan + doorloop de 3-weg met sponsor + prospect",
        verplicht: true,
      },
      {
        id: "core-v9-stap16-reflectie-patroon",
        label: "Reflectie met Mentor: wat zag je in beide 3-wegs hetzelfde? Wat anders?",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Voedt edification-verdieping stap 17.",
      },
      ...afsluitStappenV9(16),
    ],
    waarInEleva: [
      { actie: "Uitnodig-scripts", route: "/scripts?cat=uitnodiging" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Een tweede 3-weg leert je in herhaling kijken waar het constante zit en waar het variabele. Dat onderscheid is wat je straks kunt overdragen aan jouw eigen members.",
      bron: "Reflective practice (Schön) + Worre",
    },
  },
  {
    nummer: 17,
    titel: "✨ Edification-verdieping (de zin die je sponsor laat schitteren)",
    fase: 3,
    faseDoel:
      "Schrijf nu je eigen verfijnde edification-zin op basis van wat je in 2 of meer 3-wegs hebt gemerkt. De basis-versie zat in stap 4, hier wordt het verfijnd.",
    watJeLeert: `Vandaag verfijn je je edification-zin 💟

Je hebt 'm in stap 4 al geschreven, basis-versie. In stap 9 en 16 heb je 'm in praktijk gebruikt. Nu pas weet je in jouw eigen ervaring wat werkt en wat niet. Vandaag bouw je een betere versie.

WAT WERKT IN EDIFICATION

Drie elementen blijken in praktijk vaak het verschil te maken:

**1. Iets concreets.** Geen "ze is heel goed". Wel "ze helpt al X jaar mensen met Y".

**2. Iets persoonlijks.** Hoe heeft 'ie JOU specifiek geholpen. Niet alleen wat 'ie doet, ook wat 'ie heeft betekend voor jouw verhaal.

**3. Kort.** 1-2 zinnen maximaal. Langer wordt een interview op zichzelf, en de prospect moet je sponsor nog ontmoeten.

WAT VAAK ZWAK IS

- "Mijn upline" of "mijn sponsor" als enige beschrijving
- Lijstje van titels of rangen
- Te lang verhaal voordat sponsor zelf praat
- "Hij is fantastisch" zonder uitleg waarom

WAT JE VANDAAG DOET

Mentor heeft observaties uit je 3-wegs onthouden. Hij laat je zien welke zinnen jij hebt gebruikt en hoe prospects reageerden op die intro. Dan bouw je samen één verfijnde versie.

Bewaar in /mijn-zinnen. Vanaf nu gebruik je deze versie standaard, en je past 'm per prospect een beetje aan als dat past.

TEST IN VOLGENDE 3-WEG

In de eerstvolgende 3-weg gebruik je de nieuwe versie. Na afloop check je met de Mentor: voelde het anders? Reageerde sponsor anders? Reageerde prospect anders?

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap17-mentor-observaties",
        label: "Vraag de Mentor: wat heb jij in mijn 3-wegs gezien aan edification?",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap17-verfijnde-zin",
        label: "Schrijf je verfijnde edification-zin",
        verplicht: true,
        inlineActie: {
          type: "tekst",
          slug: "edification-zin-v2",
          label: "Mijn edification-zin (verfijnd)",
          instructie:
            "Verfijning op basis van wat je hebt geleerd. Concreet, persoonlijk, kort.",
          placeholder:
            'Bv. "Ik werk samen met [naam], al X jaar helpt zij mensen met [onderwerp]. Zij heeft mij geholpen om [specifiek voorbeeld]."',
          maxTekens: 400,
        },
      },
      {
        id: "core-v9-stap17-test-volgende-3weg",
        label: "Plan om de nieuwe versie te testen in je volgende 3-weg",
        verplicht: true,
        uitleg: "Mentor reminder na 3-weg om te reflecteren.",
      },
      ...afsluitStappenV9(17),
    ],
    waarInEleva: [
      { actie: "Mijn zinnen", route: "/mijn-zinnen" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Edification is een van die kleine dingen waar het verschil enorm is. Een goede edification-zin opent de deur naar respect, een slechte sluit de deur al voordat je sponsor iets heeft gezegd.",
      bron: "Worre Go Pro hoofdstuk over 3-weg",
    },
  },
  {
    nummer: 18,
    titel: "🌟 Resultaat-post-iteratie (nieuwe invalshoek)",
    fase: 3,
    faseDoel:
      "Voor scenario A: nieuwe iteratie van resultaat-post met andere invalshoek. Voor scenario B: door trigger al 21-dagen-post gedaan, hier reflectie + plan voor tweede iteratie.",
    watJeLeert: `Vandaag een nieuwe resultaat-post 💟

Inmiddels is je eerste resultaat-post (of 21-dagen-post via trigger) achter de rug. Mensen hebben gereageerd, prospects zijn binnen, 3-wegs zijn gedaan. Tijd voor een tweede iteratie.

WAAROM EEN TWEEDE POST

Mensen scrollen door social. Eén post zien is geen garantie dat je in beeld blijft. Een tweede post (1-2 maanden na de eerste) met een andere invalshoek of aanvullend resultaat brengt opnieuw mensen in beweging.

Andere invalshoek-opties:

**Aanvullend resultaat.** Je eerste post ging over X, je hebt inmiddels ook Y gemerkt. Korte update.

**Andere kant van hetzelfde verhaal.** Wat heb je niet vermeld in de eerste post? Een twijfel die je voor het starten had, een onverwacht effect.

**Wat je inmiddels weet over de producten.** Niet claim-claim, wel "wat ik inmiddels heb geleerd over hoe ik dit gebruik".

REFLECTIE OP VORIGE POST

Voor je begint met schrijven, check je de stats:

- Hoeveel reacties had je eerste post?
- Hoeveel daarvan zijn nu prospects? Klanten? Members?
- Wie deed niets en is interessant om opnieuw aan te tikken?

Mentor laat zien wat 'ie weet uit de funnel.

NIEUWE POST SCHRIJVEN

Zelfde format als de eerste: Mentor helpt schrijven, drie iteraties max, upline-check, dan plaatsen. Reactie-script ligt klaar (3-soorten-mensen-DM).

WAT ER OOK IN ZIT VANDAAG

Tijdlijn-moment 3: pas dit toe op minimaal één enthousiaste klant. Tijdlijn-moment 3 is de vraag "gun je anderen ook zo'n resultaat?". Niet direct uitnodiging tot inkomen, wel een opening richting netwerker-energie. Trigger via klantomgeving-popup wanneer klant op dag 21 staat.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap18-stats-check",
        label: "Reflectie op vorige resultaat-post: stats + opbrengst",
        verplicht: true,
        actieRoute: "/statistieken",
        uitleg: "Hoeveel reacties, hoeveel prospects, klanten, members.",
      },
      {
        id: "core-v9-stap18-nieuwe-post",
        label: "Schrijf nieuwe iteratie-post met de Mentor (andere invalshoek)",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: "core-v9-stap18-upline-check",
        label: "Upline-check, dan plaatsen",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: "core-v9-stap18-tijdlijn-moment-3",
        label: "Pas Tijdlijn-moment 3 toe op minstens 1 enthousiaste klant",
        verplicht: true,
        actieRoute: "/klant",
        uitleg: "'Gun je anderen ook zo'n resultaat?' Trigger vanuit klantomgeving-popup.",
      },
      ...afsluitStappenV9(18),
    ],
    waarInEleva: [
      { actie: "Naar statistieken", route: "/statistieken" },
      { actie: "Klantomgeving-overview", route: "/klant" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Eén post is een moment, twee posts is een verhaal. Mensen die de eerste hebben gemist of toen niet open stonden, kunnen op de tweede wel reageren.",
      bron: "Brookes social-media-strategie",
    },
  },
  {
    nummer: 19,
    titel: "🔍 Pipeline-check + closingsvraag (met Mentor-analyse)",
    fase: 3,
    faseDoel:
      "Per fase een check waar je grootste verstopping zit. Mentor maakt automatisch een analyse op basis van je pipeline-cijfers. Plus: stel de moedige closingsvraag aan minstens 1 warme prospect.",
    watJeLeert: `Vandaag check je waar je trechter lekt 💟

In stap 11 heb je je prospects in 5 typen verdeeld. Inmiddels stromen prospects door je pipeline: van top-20 naar in-gesprek, naar uitgenodigd, naar 3-weg, naar member of shopper. Maar ergens zit waarschijnlijk een verstopping. Vandaag zoek je 'm op.

DE PIPELINE-FASEN

In ELEVA staan jouw prospects in een paar fases:

- **Prospect.** In beeld, nog geen actie.
- **In gesprek.** Eerste contact gehad, gesprek loopt.
- **Uitgenodigd.** Concrete uitnodiging verstuurd.
- **One pager.** Materiaal gestuurd, prospect kijkt.
- **Presentatie.** 3-weg of Mini-ELEVA-sessie geweest.
- **Follow-up.** Wacht op beslissing, opvolg-momenten lopen.
- **Member / Shopper.** Heeft besteld.
- **Not yet.** Voor nu geen vervolg.

MENTOR-AUTO-ANALYSE

Net als in Sprint heeft Core nu een knop "Mentor-analyse pipeline". Mentor leest je cijfers, ziet waar de meeste namen vastzitten, en geeft 1-2 concrete vervolgacties.

Voorbeeld-output:

> "Je hebt 12 mensen in 'uitgenodigd' staan en maar 2 in 'one pager'. Daar zit je verstopping. Mogelijk verstuur je uitnodigingen die niet doorvragen naar een vervolg. Ik raad aan: 1) Bekijk je laatste 5 uitnodigingen samen met mij, daar zoeken we het patroon. 2) Stel deze week aan minstens 3 mensen uit 'uitgenodigd' een concrete vervolgvraag, geen open einde."

DE MOEDIGE CLOSINGSVRAAG

Een specifieke vervolgvraag die in deze fase veel verschil maakt: aan minstens één warme prospect (die al wat heeft gezien, met wie je al hebt gepraat), stel je vandaag: "Wat heb je nog nodig om te beslissen?"

Geen druk, wel concreet. Het antwoord vertelt je waar je nog mee kunt helpen, of het brengt het echte bezwaar naar voren waarop je in stap 5 hebt geoefend.

FREEBIE-INSTROOM CHECKEN

Bekijk ook even je freebie-opt-ins + Stories-views: stroomt er nog instroom binnen sinds vorige week? Of is het stil? Dat helpt om te bepalen of je vooral aan de instroom-kant of aan de doorstroom-kant moet werken.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap19-namenlijst-pipeline",
        label: "Open je namenlijst in pijplijn-weergave",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v9-stap19-mentor-auto-analyse",
        label: "Druk op 'Mentor-analyse pipeline' en lees zijn observatie",
        verplicht: true,
        inlineEmbed: "funnel-analyse",
        uitleg: "Mentor leest cijfers, identificeert grootste verstopping, geeft 1-2 concrete acties.",
      },
      {
        id: "core-v9-stap19-bottleneck-actie",
        label: "Voer de actie uit die de Mentor aanwijst voor je bottleneck-fase",
        verplicht: true,
      },
      {
        id: "core-v9-stap19-closing-vraag",
        label: "Stel de closingsvraag aan minstens 1 warme prospect",
        verplicht: true,
        uitleg: "'Wat heb je nog nodig om te beslissen?' Geen druk, wel concreet.",
      },
      {
        id: "core-v9-stap19-freebie-instroom",
        label: "Bekijk geaggregeerde freebie-opt-ins + Stories-views",
        verplicht: false,
        actieRoute: "/statistieken",
      },
      ...afsluitStappenV9(19),
    ],
    waarInEleva: [
      { actie: "Naar je namenlijst", route: "/namenlijst" },
      { actie: "Naar statistieken", route: "/statistieken" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Een pipeline zonder check is een lijst met namen. Een pipeline mét check is een groeimotor. De Mentor leest de cijfers voor je, jij voert de actie uit.",
      bron: "Sprint dag 19 + Worre funnel-principe",
    },
  },
  {
    nummer: 20,
    titel: "🧭 Builder-status-check + duplicatie-pad",
    fase: 3,
    faseDoel:
      "Hoe ver ben je van Builder? Wat ontbreekt nog? En: wie in jouw team is bezig met hetzelfde pad, hoe kun je hen helpen versnellen?",
    watJeLeert: `Vandaag check je waar je staat richting Builder, en kijk je naar duplicatie 💟

WAAR STA JE NU

Open je dashboard. Builder-tegel laat zien:

- Voorwaarde 1, minimaal 3 members met bestelling vanaf 40 IP: [auto-teller op basis van je prospects]
- Voorwaarde 2, eerste 3 levels samen >= 1500 IP: [jouw laatste handmatige update]

Update je IP-stand even als 'ie achterloopt (Lifeplus Teams pakken, kijken naar volume).

WAT KAN JE DEZE WEEK DOEN OM DICHTERBIJ TE KOMEN

Twee mogelijke knelpunten:

**Te weinig members.** Heb je 0-2 members, en zit je vast? Dan ligt focus op het vinden van mensen voor wie het werk past. Stap 14 (netwerker-energie) opnieuw doorlopen voor 2-3 specifieke klanten. Webshop-uitnodiging voorbereiden voor 1-2 van hen.

**Te weinig IP-volume.** Heb je wel members maar geen volume? Dan ligt focus op bestaande klanten activeren. Persoonlijk hercontact naar bestellers, vragen hoe het bevalt, suggesties voor aanvullende producten op basis van hun ervaring.

Mentor helpt je bepalen welke van de twee het meest jouw situatie is, en geeft een concrete actie voor deze week.

DUPLICATIE, WIE IS BEZIG MET HETZELFDE

Identificeer 1-3 mensen in je team die op een vergelijkbaar pad zitten. Members van jou, of zelfs members van jouw members. Hoe zijn ze ermee bezig?

Plan een kleine kennisdeling met je sponsor of upline: wat heeft in jouw eerste 20 stappen het meeste opgeleverd? Welke zinnen werken voor jou? Welke aanpak past in jouw stijl?

Dit wordt straks de input voor wanneer jij JOUW eerste member coacht. Het is geen "ik weet het beter dan zij", wel "dit heb ik geleerd, misschien helpt het jou".

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap20-builder-tegel-check",
        label: "Open je Builder-status-tegel op het dashboard",
        verplicht: true,
        actieRoute: "/dashboard",
        uitleg: "Twee voorwaarden zichtbaar, plus je IP-stand uit Lifeplus Teams.",
      },
      {
        id: "core-v9-stap20-ip-stand-update",
        label: "Update je IP-stand uit Lifeplus Teams (als 'ie achterloopt)",
        verplicht: true,
      },
      {
        id: "core-v9-stap20-knelpunt-bepalen",
        label: "Bepaal met de Mentor waar jouw grootste knelpunt zit",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Te weinig members, of te weinig IP-volume?",
      },
      {
        id: "core-v9-stap20-concrete-actie",
        label: "Concrete actie voor deze week (Mentor stelt voor)",
        verplicht: true,
      },
      {
        id: "core-v9-stap20-team-identificeren",
        label: "Identificeer 1-3 mensen in je team op vergelijkbaar pad",
        verplicht: false,
        actieRoute: "/team",
      },
      {
        id: "core-v9-stap20-kennisdeling",
        label: "Plan een kleine kennisdeling met sponsor/upline (wat werkt voor jou)",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
      },
      ...afsluitStappenV9(20),
    ],
    waarInEleva: [
      { actie: "Builder-tegel op dashboard", route: "/dashboard" },
      { actie: "Jouw team", route: "/team" },
      { actie: "Open de Mentor", route: "/coach" },
    ],
    waaromWerktDit: {
      tekst:
        "Builder bereiken is geen kwestie van harder werken, het is een kwestie van zien waar de hefboom zit. Mentor + jouw eigen reflectie samen brengen die hefboom aan het licht.",
      bron: "Eigen Lifeplus-Builder-pad",
    },
  },
  {
    nummer: 21,
    titel: "🏆 Klantomgeving-review + reflectie + talent + eerste 30-dagen-doel",
    fase: 3,
    faseDoel:
      "Bewuste blik op alle klantomgevingen, voelen dat duplicatie schaalbaar is. Eindreflectie, creator-talent benoemen, eerste 30-dagen-doel inschieten.",
    watJeLeert: `Vandaag de afsluiting van de eerste 21 ankerstappen 💟

Niet "klaar" in de zin van "je hebt het allemaal gedaan". Wel een natuurlijke rustpauze om terug te kijken, talent te benoemen, en een 30-dagen-doel voor de volgende ronde te zetten.

KLANTOMGEVING-REVIEW

Open je klantomgeving-overview. Per klant: welke pulse-momenten zijn geweest, hoe staat 'ie er nu voor. Mentor laat zien wie actief is, wie stil is, en wie misschien interessant is voor de volgende stap.

Markeer 2 klanten waar je gevoel zegt: hier kan een uitnodiging naar Core of webshop passen. Niet alle 5 of 10, twee. Concrete intentie voor de volgende ronde.

EINDREFLECTIE

10 minuten met de Mentor over de eerste 21 stappen. Vier vragen:

- Wat heb je geleerd dat je niet had verwacht?
- Wat verraste je over jezelf, je netwerk, het werk?
- Waar zat de meeste weerstand of moeite?
- Waar ben je trots op?

Mentor noteert dit, en geeft 'm terug als bron voor de volgende ronde.

TALENT BENOEMEN

In de eerste 21 stappen heeft de Mentor je in actie gezien. Hij ziet vier mogelijke talenten:

**Schrijver.** Jij schrijft je posts, je berichten, je hercontact-berichten makkelijk. Mensen reageren op je tekst.

**Spreker.** In 3-wegs of Mini-ELEVA's zit jij comfortabel, jij praat liever dan typt.

**Filmer.** Je Stories en Reels lopen, je hebt visueel oog, je ziet content overal.

**DM-er.** 1-op-1 contact via DM is jouw kracht. Mensen voelen zich gezien.

Niet één is beter dan een ander, en je kunt meerdere talenten hebben. Maar één primair talent helpt je in de volgende ronde te kiezen welk kanaal je extra aanzet.

EERSTE 30-DAGEN-DOEL

Concreet en meetbaar. Voorbeeld:
- "3 nieuwe members met bestelling vanaf 40 IP"
- "500 euro extra inkomen via webshop"
- "5 nieuwe builders in mijn team starten Core"
- "10 nieuwe freebie-leads per week structureel"

Niet 5 doelen, één doel. Mentor helpt het scherp krijgen.

SPONSOR-CALL OM VOORTGANG TE BESPREKEN

Plan een call van 30-45 minuten met je sponsor om de eerste 21 stappen te bespreken. Wat ging goed, waar wil je hulp, wat is je 30-dagen-doel. Sponsor ziet je groeitraject van een afstand en kan reflecteren waar jij dat zelf moeilijk kunt.

EN DE UITBREIDING?

Je krijgt een schets te zien van de Uitbreiding-module die straks naast Core loopt. Niet om vandaag te starten, wel om te weten wat het volgende pad is. Start de Uitbreiding wanneer je merkt dat je warme netwerk uitgemolken raakt en je breder gaat zoeken.

Niet alleen. Bouwen mag leuk zijn 💟`,
    vandaagDoen: [
      {
        id: "core-v9-stap21-klantomgeving-review",
        label: "Open klantomgeving-overview + bekijk per klant",
        verplicht: true,
        actieRoute: "/klant",
      },
      {
        id: "core-v9-stap21-twee-klanten-markeren",
        label: "Markeer 2 klanten waar een Core- of webshop-uitnodiging kan passen",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "core-v9-stap21-eindreflectie",
        label: "Vul de eindreflectie in (10 min met de Mentor)",
        verplicht: true,
        actieRoute: "/coach",
        uitleg:
          "Wat geleerd, wat verraste je, waar weerstand, waar trots op. Mentor noteert.",
      },
      {
        id: "core-v9-stap21-talent",
        label: "Beantwoord de talent-vraag met de Mentor",
        verplicht: true,
        actieRoute: "/coach",
        uitleg: "Schrijver, spreker, filmer, of DM-er? Eén primair talent helpt je kiezen.",
      },
      {
        id: "core-v9-stap21-30-dagen-doel",
        label: "Stel je eerste 30-dagen-doel in",
        verplicht: true,
        inlineActie: {
          type: "tekst",
          slug: "30-dagen-doel",
          label: "Mijn eerste 30-dagen-doel",
          instructie:
            "Concreet en meetbaar. Eén doel, niet vijf.",
          placeholder: "Bv. '3 nieuwe members met bestelling vanaf 40 IP'",
          maxTekens: 200,
        },
      },
      {
        id: "core-v9-stap21-sponsor-call-plannen",
        label: "Plan een call met je sponsor om voortgang te bespreken (~30-45 min)",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: "core-v9-stap21-uitbreiding-schets",
        label: "Bekijk de schets van de Uitbreiding-module (optioneel)",
        verplicht: false,
        uitleg: "Start wanneer warme netwerk uitgemolken raakt. (TODO: media op /core-v9/stap/21)",
      },
      ...afsluitStappenV9(21),
    ],
    waarInEleva: [
      { actie: "Klantomgeving-overview", route: "/klant" },
      { actie: "Naar je namenlijst", route: "/namenlijst" },
      { actie: "Open de Mentor", route: "/coach" },
      { actie: "Mijn zinnen", route: "/mijn-zinnen" },
    ],
    waaromWerktDit: {
      tekst:
        "Eindreflectie is geen zwakte, het is hoe je doorgroeit. Wat je niet benoemt verdwijnt, wat je benoemt onthoud je. 30-dagen-doel pakt door wat je hebt geleerd en zet het op een nieuwe kop.",
      bron: "Eigen reflective-practice + Worre",
    },
  },
];

// Total: 21 ankerstappen
export const CORE_V9_AANTAL_STAPPEN = CORE_V9_STAPPEN.length;

export function coreV9Stap(nummer: number): Dag | undefined {
  return CORE_V9_STAPPEN.find((s) => s.nummer === nummer);
}

