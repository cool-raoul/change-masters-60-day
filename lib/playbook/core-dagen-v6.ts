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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 3,
    titel: "📦 Productkennis-basis",
    fase: 1,
    faseDoel: "Een gevoel hebben van de hoofdcategorieën en de Mentor weet welke producten jij gebruikt.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: gevoel van hoofdcategorieën en de Mentor weet welke producten jij gebruikt.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 4,
    titel: "🎯 De webshop-pivot, vier uitnodig-bouwstenen + jouw zin",
    fase: 1,
    faseDoel: "Begrijpen waarom de webshop het frame is en je eigen versie schrijven.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: webshop als frame, vier bouwstenen leren (haakje, manier-gevonden-zin, hoe-het-werkt, permissie-vraag), eigen versie schrijven.",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 5,
    titel: "💡 Verdienmodel-basis",
    fase: 1,
    faseDoel: "Zelf snappen hoe je geld verdient, zodat je niet onzeker wordt.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: zelf snappen hoe je geld verdient (basic understanding, Eric Worre).",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  // ---------- IN BEWEGING (6-14) ----------
  {
    nummer: 6,
    titel: "📅 Aanloop-stap (per scenario)",
    fase: 2,
    faseDoel: "De eerste social-aanwezigheid neerzetten, afhankelijk van je scenario.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: eerste social-aanwezigheid (pre-post of 21-dagen-resultaat-post afhankelijk van scenario).",
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
    waaromWerktDit: PLACEHOLDER_WAAROM,
  },
  {
    nummer: 7,
    titel: "📱 Brookes 3-stappen + eerste freebie-keuze",
    fase: 2,
    faseDoel: "Eén post leren maken volgens Waarde + Verhaal + Zachte uitnodiging, met je gekozen freebie als waarde-anker.",
    watJeLeert:
      "PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem. Anker: Waarde + Verhaal + Zachte uitnodiging, freebie als waarde-anker.",
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
