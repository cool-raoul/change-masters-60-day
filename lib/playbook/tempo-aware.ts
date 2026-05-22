// ============================================================
// lib/playbook/tempo-aware.ts
//
// Maakt de playbook-dagen reagerend op het gekozen tempo
// (commitment_uren: 2 / 4 / 6). Concept:
//
//   - Dag 1 = NIET tempo-aware (Raoul: 'gaat erom dat mensen
//             gewoon hun eerste stappen hebben gedaan').
//   - Dag 2 = niet tempo-aware in deze ronde (de '20 namen'-stap
//             heeft al de drie opties: geheugen / vcard / handmatig).
//   - Dag 3 = tempo-aware. Standaard-stappen-model: A+B+C+D+E.
//   - Dag 4 = tempo-aware. Standaard-stappen-model + dag-specifieke
//             admin-taken (aanpak-kiezen per prospect, bestellinks
//             koppelen). watJeLeert blijft de uitnodig-les met de
//             4-stappen-structuur die de member vandaag toepast.
//   - Dag 5-21 = nog niet tempo-aware (volgende rondes).
//
// De helper neemt een Dag-object + commitment_uren en retourneert
// een nieuwe Dag waarin de tempo-afhankelijke taken zijn
// vervangen door de juiste varianten. Voor dagen zonder tempo-
// specifieke logica gewoon passthrough.
//
// ARCHITECTUUR: deze functie wordt aangeroepen in app/vandaag/page.tsx
// NA de DAGEN.find() en VOOR de override-passes, zodat:
//   - founder-overrides (playbook_overrides / tekst-overrides) nog
//     steeds bovenop tempo-varianten kunnen worden gelegd
//   - aanpassingen aan de tempo-tabel via berekenDagdoelen() direct
//     doorwerken zonder DB-migratie
// ============================================================

import {
  berekenDagdoelen,
  dagdoelenMinimum,
  type CommitmentUren,
} from "@/lib/dagdoelen";
import type { Dag, ControllableTaak } from "@/lib/playbook/types";

// ============================================================
// Tekst voor de "🤝 Check je partners"-stap die verschijnt zodra
// een member directe downline heeft. De component PartnerCheckEmbed
// rendert zichzelf onzichtbaar als geen partners gevonden — dus de
// stap is altijd veilig toe te voegen aan elke dag.
//
// Geen AI-tussenkomst (Raoul, 2026-05-14): tekst zegt expliciet
// dat sponsor zelf schrijft in eigen woorden.
// ============================================================

export const PARTNER_CHECK_UITLEG = `Sponsor-zijn is een MENSELIJKE rol. Geen scripts, geen AI-zinnen, gewoon jij die contact houdt met de mensen die jij hebt aangemeld. Dit geldt voor zowel NIEUWE partners (vers aangemeld, eerste dagen, eerste week) als BESTAANDE partners (die je al langer in je team hebt, en die ook gewoon dagelijks of wekelijks even contact verdienen als nodig). ELEVA toont je waar aandacht nodig is. Wat je stuurt, kies je zelf, in jouw eigen woorden.

Hieronder zie je je directe partners (en optioneel de 2e laag via uitklap-knop). Per partner: hun dag, hun laatste login, en hoeveel % van hun verplichte taken ze deze week hebben afgevinkt. Een ⚠️-icoon verschijnt bij urgentie (>72u stil OF <30% taken).

WhatsApp-knop opent een LEEG gesprek. Schrijf zelf wat past, een hartelijk "hoe gaat het?", een specifieke vraag over waar ze stuk lopen, of gewoon een complimentje voor doorzettings-vermogen.

Wil je dieper leren hoe je sponsor bent? In de Academy staat de Audio-onderweg-training met Skill #6: "Helping Your New Distributor Get Started Right". Luister 'm in de auto of tijdens een wandeling, niet hier in een snelle-fix.`;

/**
 * Helper die de standaard partner-check-stap genereert voor een
 * specifieke dag. PartnerCheckEmbed rendert zichzelf onzichtbaar
 * als de member geen directe partners heeft, dus we kunnen deze
 * stap veilig aan elke dag toevoegen zonder onderzoek of een
 * member wel of niet sponsor is.
 */
export function partnerCheckStap(dagNummer: number): ControllableTaak {
  return {
    id: `dag${dagNummer}-partner-check`,
    label: "🤝 Check je (nieuwe) partner(s) vandaag",
    uitleg: PARTNER_CHECK_UITLEG,
    verplicht: false,
    inlineEmbed: "partner-check",
  };
}

/**
 * Helper die de momentum-radar-stap genereert. Toont top-5 prospects
 * met meeste momentum vandaag (mix van follow-ups + herinneringen +
 * recente signalen). Auto-filtert items waar member vandaag al actie
 * op heeft ondernomen. Verbergt zichzelf bij 0 open items, dus
 * functioneert als end-of-day check: "Niks vergeten vandaag?".
 *
 * Filosofie: positie tussen sponsor-checkin en partner-check als
 * "afsluit-check". Niet dwingend, wel attentie-trekkend met pulsatie
 * zolang er items zijn.
 */
// ============================================================
// Helper voor de dagelijkse stories-stap. Klikbare actieRoute naar
// de social-media-training in Academy, daar staat module 8 "Stories
// die werken" met de drie onderwerp-richtingen + 5 soorten stories
// die werken + wat absoluut niet in je stories hoort.
// ============================================================
export function storiesStap(dagNummer: number): ControllableTaak {
  return {
    id: `dag${dagNummer}-stories`,
    label: "📱 1 tot 3 stories + reageren op andermans stories",
    uitleg: STORIES_UITLEG,
    verplicht: true,
    // Deeplink rechtstreeks naar module 8 'Stories die werken' in de
    // social-media-training (academy/[slug]/page.tsx zet id='module-N'
    // op elke module-card, scroll-mt-20 voor mooie offset).
    actieRoute: "/academy/social-media#module-8",
    actieRouteLabel: "📖 Bekijk training: Stories die werken (module 8) →",
  };
}

export function momentumRadarStap(dagNummer: number): ControllableTaak {
  // Week 1 (dag 3-7): uitgebreide uitleg + uitleg wat 'momentum' hier
  // betekent. Vanaf week 2 (dag 8+): compactere versie want member
  // kent de term inmiddels.
  const isEersteWeek = dagNummer <= 7;
  const uitleg = isEersteWeek
    ? `Voordat je de dag afsluit, je momentum-acties van vandaag bekijken. 'Momentum' is hier het natuurlijke moment dat een prospect net iets heeft gedaan, zoals de film gekeken, een herinnering aangevraagd, of een vraag gesteld. Op die plekken in je pijplijn ben je het meest welkom om aan te haken, want het is vers in hun hoofd.\n\nWAT IS DE MOMENTUM-RADAR? Een kort overzicht van de top-5 prospects waar NU het meeste momentum zit. Een mix van openstaande follow-ups, herinneringen die vandaag aan de beurt zijn, en mensen die net iets hebben gedaan (film gekeken, test ingevuld, bericht beantwoord).\n\nVANZELF FILTEREN: items waar je vandaag al actie op hebt ondernomen, dus je hebt 'm gebeld, een herinnering afgevinkt, of via de spraakfunctie 'laatste contact' bijgewerkt, vallen vanzelf weg uit deze lijst. Wat overblijft, vraagt nog je aandacht.\n\nWAAROM AAN HET EIND VAN DE DAG? Het is een check zodat je niks vergeet. Eén blik, even reageren waar het natuurlijk past, en je dag is afgerond.\n\nGeen lijst? Top, je hebt je dag stevig afgesloten.`
    : `Eind-van-dag-check op je momentum-radar: de top-5 prospects waar nu het meeste momentum zit (openstaande follow-ups, herinneringen vandaag, recente signalen).\n\nItems waar je vandaag al actie op hebt ondernomen vallen vanzelf weg. Wat overblijft, vraagt nog je aandacht.\n\nGeen lijst? Top, je hebt je dag stevig afgesloten.`;
  return {
    id: `dag${dagNummer}-momentum-radar`,
    label: "🎯 Open momentum-acties van vandaag",
    uitleg,
    verplicht: false,
    inlineEmbed: "momentum-radar",
  };
}

// Aanpak-keuze (3-weg vs Mini-ELEVA) is GEEN aparte taak meer per
// 2026-05-20. De keuze is onderdeel van de follow-up-flow: wanneer
// een prospect heeft gekeken of meer wil weten, opent de member z'n
// kaart in /namenlijst en kiest samen met sponsor. Zie de drie
// FOLLOWUP_UITLEG-teksten hieronder voor de geïntegreerde uitleg
// ("PER PROSPECT KIES JE AANPAK"-blok).

// ============================================================
// Tekst-blok dat we hergebruiken op alle tempo-aware dagen:
// stories-uitleg + follow-up-uitleg. Zo blijft het consistent
// en updaten we het op één plek.
// ============================================================

export const STORIES_UITLEG =`Plaats 1 tot 3 stories uit je dag op Instagram of Facebook (stories, niet feed). Geen verkoop, geen "kom in m'n business". Gewoon laten zien dat je leeft. Mensen worden door wat ze zien aangetrokken, niet door wat ze lezen.\n\nWAT KUN JE LATEN ZIEN? DRIE RICHTINGEN OM UIT TE KIEZEN.\n\n1. LIFESTYLE-MOMENT. Een ontbijt, een wandeling, een training, een blije gedachte, een moment dat je raakte vandaag. Niets over Lifeplus per se, gewoon jouw leven van vandaag. Het simpelste en het meest werkbaar. Doe dit het vaakst.\n\n2. WAARDE-MOMENT. Iets dat je leerde of dat jou helpt. Een citaat dat klopte, een mini-inzicht, een gewoonte die je hebt ingebouwd. Geen lange uitleg, één regel of één visual. Lezers denken "hier heb ik iets aan".\n\n3. EIGEN-VERHAAL-MOMENT. Iets persoonlijks dat raakt aan waarom jij hier in zit. Een why-moment, een herinnering, een voor-en-na-gevoel. Niet vaak (één keer per week of zo), wel diep wanneer je 't deelt. Bouwt vertrouwen omdat mensen jou leren kennen.\n\nDe verdieping op deze drie zit in de academy onder "Stories die werken" / Brookes-formule. Daar staan voorbeelden + opbouw per type. Voor vandaag: kies één van de drie en plaats.\n\nREAGEREN OP STORIES VAN ANDEREN is minstens zo belangrijk als zelf posten. Waarom? Als je reageert op iemands story, land je RECHTSTREEKS in z'n DM. Dat is de plek waar het echte gesprek begint. Eén oprechte 2-3 zinnen-reactie op een story is goud waard.\n\nWAT DOE JE VANDAAG?\n\n1. Plaats 1 tot 3 stories uit je dag (kies een van de drie richtingen hierboven)\n2. Open Instagram of Facebook en geef bij 3 stories van anderen een ECHTE reactie. Geen "👏👏👏" maar 2-3 zinnen die laten zien dat je hun moment hebt gezien.\n3. Wordt het een gesprek? Top. Als dit een NIEUW persoon is (nog niet op je lijst), voeg ze toe en zet ze op fase 'in gesprek' via de spraakfunctie ("Ik heb een gesprek gestart met [naam]").\n\nZo bouw je rustige zichtbaarheid + concrete nieuwe gesprekken zonder iets te pushen.`;

// ============================================================
// Centrale uitleg voor "verstuur X uitnodigingen" stappen.
// Vervangt de oude Eric-Worre-4-stappen-formule (Compliment ->
// Uitnodigen -> Plan -> Haast) door verwijzing naar de NIEUWE
// vier bouwstenen die op dag 4 zijn geleerd (Haakje, Manier-gevonden-
// zin, Hoe-het-werkt, Permissie-vraag) + de 14 webshop-scripts in
// /scripts + de drie hulp-knoppen (voorbeelden, sponsor, Mentor).
// ============================================================
export function uitnodigingenUitleg(
  aantal: number,
  opties?: { compact?: boolean; extraIntro?: string },
): string {
  const prefix = opties?.extraIntro ? `${opties.extraIntro}\n\n` : "";
  if (opties?.compact) {
    return `${prefix}Verstuur ${aantal} uitnodigingen vandaag in jouw stem. Mix warm (bekenden) en lauw (telefoon-contacten of social-vrienden waar je al een tijd niet mee sprak). Niet woordelijk overnemen, wel inspiratie pakken uit /scripts (14 webshop-uitnodigingen) of de Mentor laten meeschrijven.\n\nDe vier bouwstenen die je op dag 4 leerde:\n1. HAAKJE (eigen WHY / prospect-WHY / compliment)\n2. MANIER-GEVONDEN-ZIN (de centrale ELEVA-zin)\n3. HOE-HET-WERKT (drie korte zinnen over de webshop)\n4. PERMISSIE-VRAAG ("Mag ik je kort laten zien hoe het werkt?")\n\nBij een ja, deel de link en vertel de spraakfunctie: "Ik heb [naam] uitgenodigd en de link gestuurd". Hulp nodig? Drie knoppen onder dit vak: voorbeelden, sponsor of Mentor.`;
  }
  return `${prefix}Vandaag verstuur je ${aantal} uitnodigingen aan mensen uit je lijst. Geen vaste formule, wel jouw stem op basis van de vier bouwstenen die je op dag 4 hebt geleerd.\n\nDE VIER BOUWSTENEN VAN EEN STERKE WEBSHOP-UITNODIGING\n\n1. HAAKJE. Persoonlijk en kort, niet generiek. Drie varianten om uit te kiezen:\n   - Eigen WHY ("Ik ben [beroep] en ik wil graag [doel uit eigen WHY]")\n   - Prospect-WHY ("Jij gaf vorige keer aan dat je [hun WHY]")\n   - Compliment ("Wat jij hebt opgebouwd met [hun bedrijf/track-record] vind ik echt sterk")\n\n2. MANIER-GEVONDEN-ZIN. De centrale ELEVA-zin: "Ik heb een manier gevonden om online inkomsten op te bouwen zonder investeringen en zonder risico, via een gratis webshop met holistische wellness-producten."\n\n3. HOE-HET-WERKT. Drie korte zinnetjes (niet meer):\n   - Zelf bestellen wat je toch al gebruikt\n   - Alle logistiek geregeld, geen voorraad of klantenservice\n   - Gratis training en AI-systeem voor support\n\n4. PERMISSIE-VRAAG. "Mag ik je kort laten zien hoe het werkt?" of "Sta je open om te zien hoe?". Vrijblijvend: "Helemaal vrijblijvend, als het niets voor je is is dat ook prima."\n\nWAAR HAAL JE INSPIRATIE? In /scripts staan 14 kant-en-klare webshop-uitnodigingen (eigen WHY / eigen ervaring / prospect-WHY / koud-of-oud-contact / Serious Business Builder). Niet woordelijk overnemen, wel als startpunt om in jouw stem te zetten.\n\nMIX WARM EN LAUW. Pak ${aantal} mensen: een paar warme (bekenden, familie, vrienden) en een paar lauwe (telefoon-contacten of social-vrienden waar je al een tijd niet mee sprak). Verschillende stijlen, verschillende haakjes per type.\n\nBIJ EEN JA, deel de link en vertel de spraakfunctie: "Ik heb [naam] uitgenodigd en de link gestuurd". Daarmee verschuift de prospect naar fase 'uitgenodigd' in je namenlijst.\n\nDRIE KLIKBARE HULP-PADEN ONDER DIT VAK\n\n• VOORBEELDEN BEKIJKEN: opent /scripts in de Uitnodigingen-categorie, met 14 kant-en-klare webshop-uitnodig-scripts.\n\n• MET JE SPONSOR: opent WhatsApp met een vraag aan je sponsor, eerste reactie binnen een paar minuten.\n\n• MET DE MENTOR: opent een nieuw Mentor-gesprek met onderwerp 'uitnodiging'. De Mentor schrijft een uitnodiging op maat in jouw stem voor een specifieke prospect.`;
}

// ============================================================
// Centrale uitleg voor "stuur X mensen een eerste bericht (opener)".
// Een opener is NIET een casual catch-up, en NIET een pitch. Het is
// een natuurlijke, specifieke zin die een gesprek opent. Helper geeft
// member body + concrete voorbeelden + verwijzing naar /scripts
// (waar tag-'opener' scripts staan) + Mentor-knop benadrukt.
// ============================================================
export function eersteBerichtUitleg(
  aantal: number,
  opties?: { compact?: boolean; extraIntro?: string },
): string {
  const prefix = opties?.extraIntro ? `${opties.extraIntro}\n\n` : "";
  if (opties?.compact) {
    return `${prefix}Stuur ${aantal} mensen uit je lijst een persoonlijk eerste bericht. Geen pitch, geen catch-up. Wel een opener: een menselijke specifieke vraag waar je oprecht nieuwsgierig naar bent.\n\nKORTE VOORBEELDEN:\n• "Hé Linda, moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?"\n• "Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?"\n• "Hé Anne, hoe lang is het ook alweer geleden? Hoe is het bij jou?"\n\nMEER OPENERS NODIG? Klik onderin op de knop 'Voorbeeld-openers' om de opener-bibliotheek in /scripts te openen (categorie 'Openers', met varianten per situatie). Niet woordelijk overnemen, wel als startpunt om in jouw stem te zetten.\n\nDe Mentor-knop hieronder helpt je een opener te maken die past bij EEN SPECIFIEKE prospect (de Mentor kent de FORM-context als je die hebt vastgelegd).\n\nNa versturen: spraakfunctie "Ik heb een gesprek gestart met [naam]" → fase 'in gesprek'.`;
  }
  return `${prefix}Pak ${aantal} mensen uit je lijst en stuur ze 1-op-1 een persoonlijk bericht.\n\n📱 HOE JE DIRECT IN WHATSAPP, INSTAGRAM OF FACEBOOK BELANDT\n\nIn je namenlijst staan naast elke prospect kleine icoontjes (WhatsApp, Instagram, Facebook). Eén klik op het juiste icoon en de juiste app opent met die persoon, geen kopiëren-en-plakken, geen zoeken. Vereiste: telefoonnummer of social-handle moet ingevuld zijn op de kaart. Heb je dat niet? Klik op de prospect, vul het in, en daarna verschijnen de icoontjes vanzelf op zowel de lijst als de detail-kaart.\n\nWAT IS EEN OPENER, EN WAT IS HET NIET?\n\nEen opener is NIET:\n• Een pitch ("ik heb iets geweldigs voor je")\n• Een casual koffie-catch-up zonder doel ("hoe is het ouwe?")\n• Een verkapt verkoop-bericht ("ik dacht aan jou ivm m'n nieuwe ding")\n\nEen opener IS:\n• Een menselijke specifieke vraag waar je OPRECHT nieuwsgierig naar bent\n• Een verwijzing naar iets dat ZIJ hebben gedeeld (post, verhaal, gesprek)\n• Een herinnering uit jullie gezamenlijke verleden waarmee je rapport opent\n• Kort en concreet (één tot twee zinnen, niet meer)\n\nDoel: een gesprek openen dat binnen 1 tot 3 berichten leidt tot een uitnodiging voor een kijkmoment, wanneer dat natuurlijk past. Niet weken koffieklokken voordat je 'iets vertelt', want dat voelt voor de prospect als een verborgen agenda.\n\nVOORBEELD-OPENERS PER SITUATIE\n\n1. WARM CONTACT, met gedeelde geschiedenis:\n   "Hé Linda, moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?"\n\n2. OUD CONTACT, langere tijd niet gesproken:\n   "Hé Anne, hoe lang is het ook alweer geleden dat we elkaar hebben gesproken? Hoe is het bij jou?"\n\n3. SOCIAL-STORY-REACTIE, na hun post of story:\n   "Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?"\n\n4. GEDEELDE INTERESSE OF HOBBY:\n   "Hé Marieke, zag je net op het sportveld. Wat goed dat je weer aan het trainen bent! Hoe gaat dat voor je?"\n\n5. WAARDERING UITSPREKEN:\n   "Hé Jeroen, jouw bericht over [onderwerp] bleef me bezighouden. Hoe sta je er nu in?"\n\nDRIE KLIKBARE HULP-PADEN ONDER DIT VAK\n\n• VOORBEELD-OPENERS: opent /scripts in de Openers-categorie, met verschillende templates per situatie (warm netwerk, koud/oud contact, social-story-reactie, lead-magnet-binnenkomer, hobby/gedeelde-interesse). Niet woordelijk overnemen, wel als startpunt om in jouw stem te zetten.\n\n• MET JE SPONSOR: opent WhatsApp met een kant-en-klaar bericht aan je sponsor ("Hoe zou jij deze opener schrijven voor [naam]?"). Eén klik, jij vult de details in.\n\n• MET DE MENTOR: opent een nieuw Mentor-gesprek met onderwerp 'opener'. De Mentor weet dat je een eerste-bericht-opener wilt (geen uitnodiging) en kan er een op maat schrijven voor een specifieke prospect (de Mentor kent de FORM-context als je die hebt vastgelegd op de prospect-kaart).\n\nNa het versturen, vertel het aan de spraakfunctie: "Ik heb een gesprek gestart met [naam]". De prospect schuift dan automatisch van 'prospect' naar 'in gesprek' in je pijplijn.\n\nALS IEMAND WARM TERUGKOMT vandaag, hoef je niet te wachten tot morgen. Reageer kort, peil wat ze nu bezighoudt, en bewaar de uitnodig-stap voor wanneer dat natuurlijk past, maar het móét niet weken wachten.`;
}

// ============================================================
// Centrale uitleg voor "voeg X nieuwe namen toe" stappen.
// Wordt op heel veel dagen gebruikt (dag 3+). Helper-functie zodat
// we de uitleg op één plek onderhouden en uitbreiden.
//
// Opties:
//   - compact: korte herhalings-versie voor dag 11+ (member kent de
//     vier bronnen al, alleen reminder + 1-woord-context-regel)
//   - antiUitval: optionele prefix-string (dag 5 + dag 6) die de
//     drop-off-wiskunde normaliseert. Wordt VOOR de uitleg gezet.
// ============================================================
export function namenToevoegenUitleg(
  aantal: number,
  opties?: { compact?: boolean; antiUitval?: string },
): string {
  const prefix = opties?.antiUitval ?? "";
  if (opties?.compact) {
    return `${prefix}Voeg vandaag ${aantal} nieuwe mensen toe aan je netwerk-overzicht. Niet bellen, niet uitnodigen, alleen toevoegen aan je lijst. Het bericht komt in de volgende stap.\n\nZelfde vier bronnen als de dagen ervoor:\n1. Je telefoonlijst (familie, oud-collega's, sportmaatjes, buren)\n2. Je social-media-vrienden (Instagram, Facebook, scroll en kies wie spontaan opvalt)\n3. Mensen die je dagelijks tegenkomt (koffietent, sportschool, vereniging)\n4. Nieuwe verbindingen via hashtags of accounts die je volgt\n\nVoeg ze toe met 1 woord context per persoon ('fitness', 'oud-collega', 'koffietent'). De vier-bouwstenen-strip onder je takenlijst toont elke bron met de juiste ingang, kies wat voor jou nu makkelijkst is.`;
  }
  return `${prefix}Vandaag breid je je netwerk-overzicht uit met ${aantal} nieuwe mensen. Belangrijk: NIET BELLEN, NIET UITNODIGEN, alleen toevoegen aan je lijst. Het bericht komt in de volgende stap.\n\nWAAR HAAL JE ZE VANDAAN, vier bronnen:\n\n1. JE TELEFOONLIJST. Mensen die je al kent maar nog niet hebt benaderd over dit. Familie, oud-collega's, sportmaatjes, buren, oude vrienden die je een tijd niet sprak, ouders bij school.\n\n2. JE SOCIAL-MEDIA-VRIENDEN. Open Instagram of Facebook, scroll door je vrienden, en kies wie er nu spontaan opvalt. Mensen die jou al volgen of die jij volgt, maar waar je al een tijd niet mee hebt gesproken.\n\n3. MENSEN DIE JE DAGELIJKS TEGENKOMT. Bij de koffietent, sportschool, school, werk, vereniging. Iemand met wie je een gewone kleine babbel had en die jij sympathiek vindt.\n\n4. NIEUWE MENSEN VIA SOCIAL. Hashtags die jouw doelgroep gebruikt, mensen in jouw stad, of via accounts waar je zelf volger bent en waar de andere volgers passen bij jouw type contact.\n\nVOEG ZE TOE met 1 woord context per persoon ('fitness', 'oud-collega', 'koffietent'). Niet meer, geen biografie. De context helpt jou later om te kiezen WIE je het eerste benadert.\n\nDe VIER-BOUWSTENEN-STRIP onder je takenlijst toont per bron de juiste ingang (telefoon-import, Instagram, Facebook, of Eleva-geheugen). Kies wat voor jou nu makkelijkst is.`;
}

// Voor dag 3 + dag 4 (start-fase): alleen de openings-zin + luisteren.
// De diepere flow (Feel-Felt-Found vanaf dag 5, follow-up-cadans vanaf
// dag 6, closing-vragen en Doel-Tijd-Termijn vanaf dag 8+) komt
// stap-voor-stap in latere dagen aan bod, niet allemaal tegelijk op
// dag 3 of 4 — dat zou overweldigend zijn voor een member die net
// begint. Onderaan staat WEL al de verwijzing naar sponsor + Mentor,
// zodat een member die direct vastloopt op een specifiek bericht weet
// waar 'ie per direct hulp kan halen.
export const FOLLOWUP_UITLEG_BASIS = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Geen vast getal vandaag, afhankelijk van wie er klaar staat in je pijplijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nVOOR NU FOCUS JE OP ÉÉN DING, de openingszin. De diepere opvolg-technieken (Feel-Felt-Found voor bezwaren, follow-up-cadans, closing-vragen, doel-tijd-termijn) komen verderop in de playbook stap voor stap aan bod (vanaf dag 5). Vandaag oefen je alleen het OPENEN van het gesprek.\n\nDE OPENINGSZIN, twee varianten:\n\n• ALGEMEEN: "Wat spreekt je hier het meeste in aan?"\n  Werkt altijd. Richt de aandacht op wat hen RAAKTE.\n\n• WHY-GERICHT (als je hun WHY al kent): "Zie je hoe dit je kan brengen tot [hun WHY]?"\n  Voorbeelden:\n    - "Zie je hoe dit je kan brengen tot die extra vrije dag die je graag zou willen?"\n    - "Zie je hoe dit je kan brengen tot die vakantiedagen die je extra zou willen?"\n    - "Zie je hoe dit je kan brengen tot meer tijd met je kinderen?"\n  Krachtig als je hun WHY weet.\n\nVermijd "Wat vond je ervan?", dat lokt oordeel uit in plaats van verbinding.\n\nPER PROSPECT KIES JE AANPAK (3-WEG OF MINI-ELEVA)\n\nHeeft iemand gekeken of laten weten "ja, ik wil meer weten"? Open z'n kaart in /namenlijst en kies één van twee paden via het keuzeblok bovenaan. App je sponsor erbij voor het korte overleg: "Hé [sponsornaam], [prospect] is klaar. 3-weg of Mini-ELEVA?"\n\n🤝 3-WEG-GESPREK voor warme prospects die snel willen schakelen, sponsor doet het zwaardere praatwerk, jij brengt vertrouwen.\n\n✨ MINI-ELEVA voor prospects met een druk leven, mensen die eerst zelf willen kijken, of wanneer een 3-weg-planning niet snel lukt en je momentum wilt houden. 14 dagen eigen toegang, AI-mentor, chat met jou en sponsor.\n\nBeide paden volwaardig. Niet zeker? Druk 'Overleg met sponsor' in het keuzeblok. Op dag 9 verdiep je de 3-weg-gesprek-techniek.\n\nLUISTER WAT ZE ZEGGEN. Doorvragen op wat ze NOEMEN. Geen pitch, geen druk om vandaag iets te beslissen. De volgende stappen (validatie, twijfel ombuigen, closen) komen verderop in het playbook (vanaf dag 5).\n\n🆘 KOM JE NU VAST OP EEN SPECIFIEK BERICHT?\n\nWacht niet tot je het zelf moet verzinnen. Je hebt twee snelle hulplijnen, gebruik ze:\n\n• Je sponsor, stuur een korte WhatsApp met de letterlijke tekst die je hebt ontvangen, plus één vraag ("Hoe zou jij hier op reageren?"). Sponsors zijn er precies hiervoor.\n• De Mentor (in het zijmenu), plak het bericht, vraag een reactie-suggestie. De Mentor schrijft op maat in jouw toon en houdt rekening met fase + WHY van de prospect.\n\nDieper-ingaan op berichten komt verderop in het playbook, maar deze vangnetten zijn er nu al.`;

// Voor dag 7+: members hebben Feel-Felt-Found (FFF, op dag 5) EN
// follow-up-cadans + 5-fasen-flow (op dag 6) al geleerd. De tekst
// toont BEIDE technieken compact als referentie (concrete zinnen
// per fase, FFF-structuur) zodat de member ze direct kan toepassen
// zonder eerst terug-bladeren. Daarna een drie-stappen-aanpak
// 'eerst-zelf-dan-check' die voor beide technieken werkt. Doel:
// vakmanschap door eigen denken, niet afhankelijkheid van Mentor.
export const FOLLOWUP_UITLEG_NA_DAG6 = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Geen vast getal vandaag, afhankelijk van wie er klaar staat in je pijplijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nDE OPENINGSZIN, twee varianten:\n\n• ALGEMEEN: "Wat spreekt je hier het meeste in aan?"\n• WHY-GERICHT (als je hun WHY al kent): "Zie je hoe dit je kan brengen tot [hun WHY]?"\n\nVermijd "Wat vond je ervan?", dat lokt oordeel uit in plaats van verbinding.\n\nPER PROSPECT KIES JE AANPAK (3-WEG OF MINI-ELEVA)\n\nHeeft iemand gekeken of laten weten "ja, ik wil meer weten"? Open z'n kaart in /namenlijst en kies één van twee paden via het keuzeblok bovenaan. App je sponsor erbij voor het korte overleg: "Hé [sponsornaam], [prospect] is klaar. 3-weg of Mini-ELEVA?"\n\n🤝 3-WEG-GESPREK voor warme prospects die snel willen schakelen, sponsor doet het zwaardere praatwerk, jij brengt vertrouwen.\n\n✨ MINI-ELEVA voor prospects met een druk leven, mensen die eerst zelf willen kijken, of wanneer een 3-weg-planning niet snel lukt en je momentum wilt houden. 14 dagen eigen toegang, AI-mentor, chat met jou en sponsor.\n\nBeide paden volwaardig. Niet zeker? Druk 'Overleg met sponsor' in het keuzeblok.\n\n💪 VANDAAG GA JE ZELF OEFENEN MET TWEE TECHNIEKEN\n\nDe afgelopen twee dagen heb je twee technieken geleerd. Vandaag pas je ze ZELF toe, dat is de overgang van leren naar kunnen.\n\nDE 5-FASEN-FOLLOW-UP (van dag 6), concrete zinnen per fase:\n\n1. CHECK-IN (24-48u na uitnodiging): "Even inchecken, hoe gaat het met je?"\n2. PEILEN (na 3-5 dagen): "Wat sprak je het meeste aan van wat je gezien hebt?"\n3. VERDIEPEN (na 7-10 dagen): "Dit wilde ik je ook nog laten zien..." + tweede waardevol punt\n4. UITNODIGING NAAR EVENT/3-WEG (na 10-14 dagen): "Er is binnenkort iets dat past, wil je erbij zijn?"\n5. SLUITEN OF NOT-YET (na 14-21 dagen): "Wat is voor jou het belangrijkste punt om helder te krijgen?"\n\nPLUS de stilgevallen-zin als iemand al langer stil is:\n"Hé [naam], ik zag dat je niet meer had gereageerd op mijn laatste berichtje. Is dat omdat je druk was of omdat je geen interesse hebt op dit moment? Allebei prima hoor, ik dacht: ik vraag het even!"\n\nFEEL-FELT-FOUND (FFF, van dag 5), voor wanneer er een bezwaar komt:\n\n• FEEL: "Ik snap dat het zo voelt."\n• FELT: "Veel mensen voelden dat in het begin ook."\n• FOUND: "Wat zij merkten was [korte herframing]."\n• DOORVRAAG: "Maar vertel eens, waar zit het 'm nu écht in?"\n\nDE DRIE-STAPPEN-AANPAK BIJ ELK NIEUW BERICHT\n\n1. EERST ZELF SCHRIJVEN. Open je notitie-app of typ in WhatsApp (concept, niet versturen). Welk fase-zin past bij deze prospect (waar staan ze in de 5 fasen)? Komt er een bezwaar? Schrijf de FFF-reactie in jouw stijl. Geen scripts kopiëren, geen Mentor vragen.\n\n2. CHECK TEGEN WAT JE HEBT GELEERD. Klopt de fase-zin die je koos? Past de FFF-volgorde (feel-felt-found-doorvraag) op het bezwaar? Voelt het natuurlijk of geforceerd?\n\n3. PAS DAN HULP VRAGEN, ALS JE TWIJFELT. Stuur je concept + korte prospect-context naar sponsor of Mentor met de vraag 'Klopt dit volgens jou?'. Niet 'schrijf 'm voor mij', wel 'kijk mee'.\n\nWaarom in deze volgorde? Omdat zelf nadenken een SPIER is die je bouwt door 'm te gebruiken. Hulp meteen vragen is comfort, maar het houdt je beginner. Eerst zelf, dan check, dat is hoe je een professional wordt.\n\nDieper terug-bladeren? Menu → Playbook → Dag 5 (FFF in detail) en Dag 6 (5-fasen-flow in detail).\n\n🆘 KOM JE ECHT VAST?\n\n• Je sponsor, stuur de letterlijke tekst die je hebt ontvangen + jouw concept-reactie + de vraag 'wat zou jij ervan vinden?'\n• De Mentor (in het zijmenu), zelfde aanpak: deel je concept en vraag om feedback. De Mentor is getraind om mee te kijken, niet om voor jou te schrijven.`;

// ============================================================
// Anti-uitval-blokken voor dag 5 en dag 6. Bovenin de uitleg van
// de eerste stap (dag5-namen-toevoegen / dag6-namen-toevoegen)
// staat dit korte blokje dat de wiskunde van drop-off normaliseert.
// Doel: het 'zes-nees-en-stoppen'-uitval-patroon ondervangen.
// ============================================================

const ANTI_UITVAL_DAG5 = `ℹ️ EVEN VOOR DE RUST: VEEL MENSEN TWIJFELEN ROND DIT MOMENT\n\nHeb je deze week 5-10 mensen benaderd en weinig terug gekregen? Dat is normaal en wiskundig verwacht. De gemiddelde response-ratio in netwerk-marketing ligt rond 1 op 15-20 contacten. Dat is geen falen, dat is gewoon hoe het werkt.\n\nWat je vandaag aan extra ankerpunten hebt:\n- De Feel-Felt-Found-formule (FFF) die je zo gaat leren, voor bezwaren ombuigen\n- Je sponsor of de Mentor om hulp aan te vragen bij een specifiek bericht\n- De DMO-training in de Academy als je meer wilt begrijpen van de cijfers\n\nVerder met je dag-flow.\n\n──────────────────────────────────────────\n\n`;

const ANTI_UITVAL_DAG6 = `ℹ️ EVEN VOOR DE RUST: VEEL MENSEN ONDERSCHATTEN DE 80%-WAARDE\n\n80% van alle ja's in netwerk-marketing komen na de DERDE of latere follow-up. 80% van netwerkers stopt al na de eerste of tweede follow-up. Daar zit het grote verschil tussen mensen die doorbreken en mensen die afhaken: niet talent, niet pitch-kunst, wel hoe goed je opvolgt.\n\nVandaag leer je dat systematisch. Loopt het ergens vast? Sponsor en Mentor staan klaar (zie 'Vraag 1 tip'-stap). Meer over de wiskunde in de DMO-training les 4.1 in de Academy.\n\nVerder met je dag-flow.\n\n──────────────────────────────────────────\n\n`;

// Uitgebreide follow-up-uitleg voor dag 6, met 24-48u-regel,
// 5-fasen-flow en de stilgevallen-gesprekken-zin. Op dag 3, 4, 5
// en 7 wordt FOLLOWUP_UITLEG_BASIS / NA_DAG6 gebruikt; op dag 6 deze
// diepere variant omdat de hele dag-les daarover gaat.
//
// Onderaan is een drie-stappen-blok toegevoegd dat verwijst naar
// Feel-Felt-Found (FFF, geleerd op dag 5) als enige techniek voor
// zelf-toepassen. De 5-fasen-flow is JUIST vandaag de leerstof,
// dus die toetsen we vandaag nog niet zelf. Dat doen we vanaf dag 7.
const FOLLOWUP_UITLEG_DAG6 = `Mensen die de film, one-pager of presentatie hebben gezien wachten op opvolging. Vandaag is de DAG om hier scherp en systematisch in te zijn. Open je namenlijst en filter op fase 'one-pager', 'presentatie' of 'follow-up'.\n\nDE 24-48U-REGEL\n\nStuur 24-48 uur na een uitnodiging je eerste check-in. Niet eerder (dan voelt het opdringerig), niet later (dan is de psychologische ruimte alweer dicht). Gemiddeld zijn 5 contactmomenten nodig voordat iemand een echte beslissing maakt, dat is geen drammen, dat is gewoon de statistiek van menselijk gedrag.\n\nDE 5-FASEN-FOLLOW-UP\n\n1. CHECK-IN (24-48u): "Even inchecken, hoe gaat het met je?" GEEN "heb je al nagedacht?"\n2. PEILEN (na 3-5 dagen): "Wat sprak je het meeste aan van wat je gezien hebt?" Open vraag op WAT, niet op JA/NEE.\n3. VERDIEPEN (na 7-10 dagen): "Dit wilde ik je ook nog laten zien..." Tweede waardevol punt, een testimonial, een nieuw filmpje.\n4. UITNODIGING NAAR EVENT/3-WEG (na 10-14 dagen): "Er is binnenkort iets dat past, wil je erbij zijn?"\n5. SLUITEN OF NOT-YET (na 14-21 dagen): "Wat is voor jou het belangrijkste punt om helder te krijgen?"\n\nPER PROSPECT KIES JE AANPAK (3-WEG OF MINI-ELEVA)\n\nNa fase 2-3 zit de prospect vaak in 'wil meer weten'-modus. Open z'n kaart in /namenlijst en kies één van twee paden via het keuzeblok bovenaan. App je sponsor erbij voor het korte overleg: "Hé [sponsornaam], [prospect] is klaar. 3-weg of Mini-ELEVA?"\n\n🤝 3-WEG-GESPREK voor warme prospects die snel willen schakelen, sponsor doet het zwaardere praatwerk, jij brengt vertrouwen.\n\n✨ MINI-ELEVA voor prospects met een druk leven, mensen die eerst zelf willen kijken, of wanneer een 3-weg-planning niet snel lukt en je momentum wilt houden. 14 dagen eigen toegang, AI-mentor, chat met jou en sponsor.\n\nBeide paden volwaardig. Niet zeker? Druk 'Overleg met sponsor' in het keuzeblok. Op dag 9 verdiep je de 3-weg-gesprek-techniek.\n\nDE STILGEVALLEN-GESPREKKEN-ZIN\n\nWanneer iemand een paar dagen of weken niet meer reageert, werkt deze zin bijna altijd:\n\n"Hé [naam], ik zag dat je niet meer had gereageerd op mijn laatste berichtje. Is dat omdat je druk was of omdat je geen interesse hebt op dit moment? Allebei prima hoor, ik dacht: ik vraag het even!"\n\nWaarom dit werkt:\n- Geen verwijt, geen druk: 'allebei prima hoor' geeft de uitweg.\n- Eerlijk antwoord: mensen die druk waren ('sorry, vergeten!') komen terug. Mensen die geen interesse hebben, geven dat aan zonder ongemak.\n- Helderheid voor jou: je weet waar je staat, kunt verder.\n\nWAT JE WEL EN NIET DOET\n\n- WEL: "Even inchecken" - vriendelijk, niet beoordelend\n- WEL: "Wat sprak je aan?" - focus op wat positief is\n- NIET: "Heb je al nagedacht?" - zet ze in beoordelaar-positie\n- NIET: "Wat vond je ervan?" - vraagt om oordeel, opent kritiek\n- NIET: stilte na 1 keer geen reactie - fataal, je verliest 80%\n\n💪 KOMT ER EEN BEZWAAR TIJDENS JE FOLLOW-UP? PAS FFF ZELF TOE\n\nGisteren (dag 5) heb je Feel-Felt-Found (FFF) geleerd. Als een prospect vandaag een bezwaar uit ('ik heb geen tijd', 'ik wil eerst nadenken'), pas dan FFF zelf toe, in deze volgorde:\n\n1. EERST ZELF SCHRIJVEN. Open je notitie-app of typ in WhatsApp (concept, niet versturen). Schrijf de FFF-reactie in jouw eigen stijl. Geen scripts kopiëren.\n\n2. CHECK TEGEN FFF. Klopt het patroon? Feel (ik snap dat het zo voelt) → Felt (anderen voelden dat ook) → Found (wat zij merkten was...) → doorvraag-zin.\n\n3. PAS DAN HULP VRAGEN, ALS JE TWIJFELT. Stuur je concept naar sponsor of Mentor met de vraag 'Klopt dit volgens jou?'. Niet 'schrijf 'm voor mij', wel 'kijk mee'. Bezwaren-bibliotheek terug-bladeren? Menu → Playbook → Dag 5.\n\n🆘 KOM JE ECHT VAST OP EEN SPECIFIEK BERICHT?\n\n• Je sponsor - stuur de letterlijke tekst die je hebt ontvangen + jouw eerste concept-reactie + de vraag 'wat zou jij ervan vinden?'\n• De Mentor (in het zijmenu) - zelfde aanpak: deel je concept en vraag om feedback. De Mentor is getraind om mee te kijken, niet om voor jou te schrijven.`;

/**
 * Tempo-specifieke vervangings-data voor dag 3.
 *
 * Dag 3 is CONSOLIDEREND, niet uitnodigend. Reden: dag 4 leert pas
 * de 4-stappen-uitnodiging-structuur. Op dag 3 doe je geen NIEUWE
 * uitnodigingen, je focust op contact leggen (A+B), follow-ups
 * (D, op dag 3 vaak nog 0-2 want op dag 2 heb je samen met je
 * sponsor 3 invites gedaan), stories (E), sponsor-checkin en de
 * eenmalige Teams-administratie.
 */
function bouwDag3VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag3-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste bericht sturen ---
    {
      id: "dag3-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, {
        extraIntro: "Vandaag oefen je STAP 1, het openen. MORGEN (dag 4) leer je de vier bouwstenen van een sterke webshop-uitnodiging die je per direct mag toepassen op iedereen die vandaag warm reageert.",
      }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: openstaande follow-ups ---
    {
      id: "dag3-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_BASIS,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap D: stories + reageren op anderen ---
    storiesStap(3),

    // --- Teams-administratie (eenmalig, niet tempo-aware) ---
    {
      id: "dag3-teams-admin",
      label: "📋 Teams-administratiesysteem aanmaken",
      uitleg:
        "Lifeplus Partner-aanmelding, eenmalige administratieve registratie. Bekijk de korte film in deze taak voor de exacte stappen.",
      verplicht: true,
      filmSlug: "onboarding-stap-7-teams-admin",
    },

    // --- LAATSTE STAP: sponsor-checkin (afsluiting van de dag) ---
    {
      id: "dag3-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 3 erop zitten. Stuur je sponsor een berichtje met hoe het ging: hoeveel nieuwe namen, hoeveel eerste gesprekken, hoe het voelt. Niets uitgebreids, gewoon even een update om de dag mooi af te sluiten.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(3),
    partnerCheckStap(3),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 4.
 *
 * Dag 4-thema: 'Vandaag leer je uitnodigen, 4 stappen die werken'.
 * De les zelf staat in watJeLeert (in dagen.ts, statisch). Hier
 * de uitvoerings-kant: vandaag pas je actief toe wat je leest.
 *
 * Aanpak-keuze (3-weg vs Mini-ELEVA) is NIET een aparte stap maar
 * onderdeel van follow-up. Reden: je kiest pas welke validatie-vorm
 * past NA dat de prospect heeft gekeken EN op de openings-vraag
 * heeft gereageerd. Dat is fase 'follow-up'. Wel apart noemen in
 * de uitleg van die stap, niet als losse afvink-taak vooraf.
 */
function bouwDag4VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- HOOFDTAAK: webshop-uitnodiging meteen toepassen (vandaag's les) ---
    // Eerste stap zodat de les bovenaan ('Wat je leert') met de vier
    // bouwstenen vers in het hoofd is wanneer de member de uitnodigingen
    // schrijft.
    {
      id: "dag4-uitnodigingen-4stappen",
      label: `📨 Pas de vier bouwstenen toe bij ${dd.uitnodigingen} uitnodigingen`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen, {
        extraIntro: "De LES van vandaag staat hierboven in 'Wat je leert' met voorbeelden in jouw stem. Pak die er bij wanneer je gaat schrijven. Doel: ja op het KIJKMOMENT, niet ja op jou. Als de prospect ja zegt, deel je de link. Vertel het aan de spraakfunctie: \"Ik heb [naam] uitgenodigd en de link gestuurd\".",
      }),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap A: nieuwe namen toevoegen (dagritme) ---
    {
      id: "dag4-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag4-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, {
        extraIntro: "LINK MET DE LES VAN VANDAAG: dit is je OPENER. De webshop-uitnodiging die je hierboven leerde (vier bouwstenen) zet je vandaag niet om in losse berichten over weken uit te smeren, maar om in dezelfde chat-flow door te zetten zodra het natuurlijk past. Topcoaches zijn het er over eens: openen → korte verbinding → uitnodigen, het liefst in dezelfde gespreksbeurt, hooguit binnen een paar berichten.",
      }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Openstaande follow-ups (alleen basis-flow voor nu) ---
    {
      id: "dag4-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_BASIS,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stories + reageren ---
    storiesStap(4),

    // --- Bestellinks koppelen (start van meerdere dagen) ---
    {
      id: "dag4-bestellinks",
      label: "🔗 Bestellinks koppelen, begin vandaag met zoveel mogelijk",
      uitleg:
        "Plak per pakket je Lifeplus-webshop-URL in ELEVA. Daarna gebruikt het systeem die links automatisch in productadvies-flows.\n\nDIT IS HET BEGIN. Doe vandaag zoveel als je kunt, in de dagen hierna voegen we de rest toe. Niet alles vandaag verplicht, beter rustig en kloppend dan haastig en fout.\n\nVraag je sponsor om mee te kijken voor de juiste shop-product-pagina's per pakket.",
      verplicht: false,
      actieRoute: "/instellingen/bestellinks",
      filmSlug: "onboarding-stap-9-bestellinks",
    },

    // --- LAATSTE STAP: sponsor-checkin (afsluiting van de dag) ---
    {
      id: "dag4-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "Je hebt dag 4 erop zitten. Stuur je sponsor in 30 seconden hoe het ging: hoe voelden de vier bouwstenen van de webshop-uitnodiging? Natuurlijk of nog stroef? Eén zin is genoeg.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(4),
    partnerCheckStap(4),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 5.
 *
 * Dag 5-thema: Bezwaren omgaan met Feel-Felt-Found. Vanaf vandaag
 * is uitnodigen ook een dagelijks ritme (niet meer enkel een
 * 'leerdag' zoals dag 4). De FFF-roleplay als specifieke dag-stap.
 * Anti-uitval-blok bovenin om het 'zes-nees-en-stoppen'-patroon
 * te normaliseren met wiskunde-context.
 */
function bouwDag5VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen (met anti-uitval-blok bovenin) ---
    {
      id: "dag5-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten, { antiUitval: ANTI_UITVAL_DAG5 }),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag5-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen (vanaf dag 5 vast onderdeel van het ritme) ---
    {
      id: "dag5-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (scripts + jouw stem)`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen, {
        extraIntro: "Vanaf vandaag is uitnodigen een vast onderdeel van je dagelijkse ritme. Je past de vier bouwstenen toe die je gisteren op dag 4 leerde.",
      }),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    // Dag 5 leert FFF in stap F (na deze stap). Hier gebruiken we de
    // basis-uitleg zonder drie-stappen-frame — FFF is nog niet
    // beschikbaar als techniek om zelf op te toetsen. Dat komt vanaf
    // dag 6 (waar FFF inmiddels van gisteren is).
    {
      id: "dag5-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_BASIS,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    storiesStap(5),

    // --- Stap F: Feel-Felt-Found-roleplay (dag-specifiek) ---
    {
      id: "dag5-fff-roleplay",
      label: "🛡️ Korte Feel-Felt-Found-roleplay (FFF) met sponsor of Mentor",
      uitleg:
        "Waarom oefenen met bezwaren belangrijk is: in een echt gesprek krijg je geen tweede kans om iets te formuleren. Als jij staat te zoeken naar woorden, voelt de prospect onzekerheid en verliest hij vertrouwen. Door vooraf een paar keer te oefenen, weet je in grote lijnen hoe je elk bezwaar kunt aanvliegen, zelfs als je niet de exacte woorden paraat hebt.\n\nVraag je sponsor om 1-2 typische bezwaren te 'spelen' en oefen Feel-Felt-Found (FFF). Geen sponsor beschikbaar? Vraag de Mentor: 'Speel een prospect die zegt: ik heb geen tijd', en oefen je antwoord. Daarna een nieuwe ronde met een ander bezwaar. Vier of vijf rondes is genoeg om het ritme te pakken.",
      verplicht: true,
      actieRoute: "/coach",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag5-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 5 erop zitten. Stuur je sponsor een berichtje met hoe het ging: hoe voelde de Feel-Felt-Found-oefening (FFF)? Liep je vandaag tegen een bezwaar aan dat je hebt omgebogen? Niets uitgebreids, gewoon een update om de dag mooi af te sluiten.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(5),
    partnerCheckStap(5),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 6.
 *
 * Dag 6-thema: Follow-up systematiek (24-48u-regel + 5-fasen-flow +
 * stilgevallen-zin). Uitnodigen blijft vast onderdeel van het ritme.
 * Sponsor-tip als zesde stap, sponsor-checkin als afsluiter.
 * Anti-uitval-blok bovenin focust op de 80%-wet van follow-up.
 */
function bouwDag6VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen (met anti-uitval-blok bovenin) ---
    {
      id: "dag6-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten, { antiUitval: ANTI_UITVAL_DAG6 }),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag6-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, { compact: true }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag6-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (scripts + jouw stem)`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups (UITGEBREIDE uitleg op dag 6) ---
    {
      id: "dag6-openstaande-followups",
      label: "🔄 Follow-ups vandaag (24-48u-regel + 5-fasen-flow)",
      uitleg: FOLLOWUP_UITLEG_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    storiesStap(6),

    // --- Stap F: sponsor-tip (dag-specifiek) ---
    {
      id: "dag6-sponsor-tip",
      label: "💡 Vraag sponsor of Mentor: 1 tip op je lastigste follow-up",
      uitleg:
        "Heb je 1 contact waar je niet weet wat je moet sturen? Vraag je sponsor: 'Hoe zou jij dit aanpakken?'. Sponsor even druk? Dan de Mentor: 'Help me met een follow-up voor [naam] die [situatie]'. Je hoeft het niet alleen te bedenken.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag6-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 6 erop zitten. Stuur je sponsor een berichtje: hoe voelde het om systematisch door je pijplijn te lopen? Werkte de 24-48u-regel? Niets uitgebreids, gewoon even een update om de dag af te sluiten.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(6),
    partnerCheckStap(6),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 7.
 *
 * Dag 7-thema: Week 1-reflectie. Bewust RUSTIGER dan dag 5+6 zodat
 * er ruimte is voor de review en de sponsor-call, maar pijplijn-
 * instroom kakt niet in. Filosofie: minimum-aantallen ipv harde
 * halvering. Label gebruikt 'Minimaal X', uitleg zegt 'meer mag,
 * minder niet'. Sponsor-call (15 min, langer dan checkin) als
 * afsluitende stap.
 */
function bouwDag7VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const min = dagdoelenMinimum(uren);

  return [
    // --- Stap 1: Wekelijkse review (EERST, focus van de dag) ---
    {
      id: "dag7-review",
      label: "📋 Vul de wekelijkse review in (5 min reflectie)",
      uitleg:
        "Drie vragen: wat ging goed deze week, wat liep niet soepel, waar focus ik volgende week op? Aan het eind kun je kiezen of je de review met je sponsor wilt delen, zodat hij of zij weet hoe je ervoor staat en waar je in kan groeien.",
      verplicht: true,
      actieRoute: "/statistieken",
    },

    // --- Stap 1B: Funnel-analyse door ELEVA Mentor ---
    {
      id: "dag7-funnel-analyse",
      label: "🔍 Laat ELEVA je funnel analyseren (eerste keer)",
      uitleg:
        "Het is week 1, je cijfers zijn nog klein, maar dat is precies waarom dit een mooie eerste kennismaking is met de funnel-analyse van ELEVA. De Mentor kijkt naar wie je hebt benaderd, in welke fase ze zitten, en geeft je een eerste indruk waar het focus voor week 2 kan liggen.\n\nKlik op de knop hieronder, dan opent een Mentor-gesprek met jouw cijfers al ingevuld. Geen eigen typewerk nodig. Klein tip: stel daarna nog 1 of 2 vervolgvragen aan de Mentor om dieper te gaan ('wat zou de slimste eerste verbetering zijn?').",
      verplicht: false,
      inlineEmbed: "funnel-analyse",
    },

    // --- Stap 2: namen toevoegen (MINIMAAL) ---
    {
      id: "dag7-namen-toevoegen",
      label: `📲 Voeg minimaal ${min.contacten} namen toe aan je lijst`,
      uitleg: `Vandaag is review-dag, dus rustiger op de input, maar je pijplijn houdt z'n stroom. Minimaal ${min.contacten} nieuwe namen, meer mag altijd. Minder dan ${min.contacten} doe je niet, dat breekt het ritme dat je deze week hebt opgebouwd.\n\n${namenToevoegenUitleg(min.contacten, { compact: true })}`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap 3: eerste berichten (MINIMAAL) ---
    {
      id: "dag7-eerste-berichten",
      label: `💬 Stuur minimaal ${min.contacten} mensen een eerste bericht (opener)`,
      uitleg: `Minimaal ${min.contacten} eerste berichten vandaag, meer mag.\n\n${eersteBerichtUitleg(min.contacten, { compact: true })}`,
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap 4: uitnodigingen (MINIMAAL) ---
    {
      id: "dag7-uitnodigingen",
      label: `📨 Verstuur minimaal ${min.uitnodigingen} uitnodigingen`,
      uitleg: `Minimaal ${min.uitnodigingen} uitnodigingen vandaag, meer mag.\n\n${uitnodigingenUitleg(min.uitnodigingen, { compact: true })}`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap 5: openstaande follow-ups (met volledige drie-stappen-
    // frame omdat member nu FFF + 5-fasen-flow al heeft geleerd) ---
    {
      id: "dag7-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap 6: stories ---
    storiesStap(7),

    // --- LAATSTE STAP: sponsor-call (15 min, langer dan checkin) ---
    {
      id: "dag7-sponsor-call",
      label: "📞 15 min sponsor-call over week 2",
      uitleg:
        "Wat werkte? Wat gaan we anders doen? Wat is het thema van week 2? Deze call is langer dan een dagelijkse checkin, neem 15 minuten samen om week 1 door te lopen en week 2 vorm te geven. Tip: deel je review-formulier vóór de call zodat je sponsor zich kan voorbereiden.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(7),
    partnerCheckStap(7),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 8.
 *
 * Dag 8-thema: Snelheid wint. In jouw eigen tempo (Fundament/Bouwen/
 * Doorbreken) ga je vandaag de perfectie-val omzeilen: max 30-60 sec
 * per uitnodiging, verzonden is altijd beter dan perfect. De F-stap
 * is een korte lees-stap om de mindset binnen te krijgen voordat je
 * de C-stap (uitnodigingen) doet — dus de F-stap staat ZONDER eigen
 * extra uitnodigingen, het is een SKILL-laag bovenop de C-stap.
 */
function bouwDag8VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag8-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag8-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, { compact: true }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag8-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (scripts + jouw stem)`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen, {
        extraIntro: `VANDAAG IS HET SNELHEID-DAG. Bovenaan deze pagina staat onder 'Wat je leert' de mindset die je vandaag toepast: snelheid wint van perfectie. Lees die eerst, dan haal je deze ${dd.uitnodigingen} uitnodigingen in 5 tot 10 minuten. Vuistregel: max 30 tot 60 seconden bedenktijd per uitnodiging, daarna druk je op verzenden, geen herlezen.`,
      }),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups (drie-stappen-frame met FFF + 5-fasen) ---
    {
      id: "dag8-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    storiesStap(8),

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag8-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 8 erop zitten, eerste dag van week 2. Stuur je sponsor een berichtje: hoe voelde de snelheid-modus? Lukte het om de perfectie-val te vermijden? Niets uitgebreids.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(8),
    partnerCheckStap(8),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 9.
 *
 * Dag 9-thema: 3-weg-gesprek meesterclass — 5 stappen + edification.
 * Leerdag (lees-stap F), niet doe-dag. Dag 10 is de doe-dag.
 */
function bouwDag9VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag9-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag9-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, { compact: true }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag9-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (scripts + jouw stem)`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen, { compact: true }),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag9-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    storiesStap(9),

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag9-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Je hebt dag 9 erop zitten, de 3-weg-meesterclass gelezen. Stuur je sponsor een berichtje: ben je klaar om morgen je eerste (of volgende) 3-weg in praktijk te brengen? Vraag of zij of hij beschikbaar is voor het groepje.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(9),
    partnerCheckStap(9),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 10.
 *
 * Dag 10-thema: 3-weg-gesprek in praktijk. Geen theorie-dag, een
 * DOE-dag. De F-stap is concreet: vandaag start je je eerstvolgende
 * 3-weg-gesprek met een warme prospect en je sponsor.
 */
function bouwDag10VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag10-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag10-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, { compact: true }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag10-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (scripts + jouw stem)`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen, { compact: true }),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag10-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    storiesStap(10),

    // --- Stap F: 3-weg-gesprek starten (dag-specifiek, de DOE-stap) ---
    {
      id: "dag10-3weg-doen",
      label: "🤝 Start je eerstvolgende 3-weg-gesprek (vandaag of morgen)",
      uitleg:
        "Vandaag is GEEN theorie-dag, vandaag is een DOE-dag. Gisteren leerde je de 5 stappen, vandaag start je je eerstvolgende 3-weg in de praktijk.\n\nKIES 1 WARME PROSPECT\n\nIemand die nog geen 3-weg heeft gehad, met wie het gesprek warm is, en die heeft gezien wat jij doet (one-pager of film). Geen koude prospect, die werkt nog niet voor een 3-weg.\n\nDE 5 STAPPEN (recap van dag 9, scripts staan in de prospect-kaart):\n\n1. AANKONDIGING: stuur je prospect een bericht: 'Ik maak even een groepje aan met mijn mentor [sponsor], die kan met je meekijken.'\n2. INTRODUCTIE IN HET GROEPJE: edifieer je sponsor + geef prospect-context aan sponsor.\n3. JIJ STAPT TERUG ⚠️: DIT IS DE LASTIGSTE STAP. Zwijg in het groepje. Niet meepraten. Niet aanvullen. Sponsor neemt over.\n4. SPONSOR OPENT: sponsor bouwt rapport met de prospect, luistert eerst.\n5. FOLLOW-UP: JIJ stuurt de prospect apart binnen 24u: 'Wat sprak je het meeste in aan?'.\n\nDE EERSTE 3-WEG VOELT ONHANDIG\n\nDat hóórt. De vijfde voelt natuurlijk. Alleen door te DOEN kom je daar. Achteraf 5 min met je sponsor debriefen: wat ging goed, wat liep niet soepel, welke vraag bracht 'm in moeilijkheden?\n\nGEEN WARME PROSPECT KLAAR? VRAAG SPONSOR\n\nStuur sponsor een bericht: 'Ik wil mijn eerstvolgende 3-weg starten maar weet niet bij wie te beginnen. Mag ik samen met jou kijken in mijn namenlijst?'.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag10-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor een berichtje: hoe voelde je eerste (of volgende) 3-weg vandaag? Wat ging goed, wat liep niet soepel? Vraag of jullie er 5 min over kunnen debriefen.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(10),
    partnerCheckStap(10),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 11.
 *
 * Dag 11-thema: Pipeline-flow + wanneer one-pager versus presentatie.
 * De F-stap is een lees-stap PLUS een pipeline-check in de namenlijst.
 */
function bouwDag11VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    // --- Stap A: nieuwe namen toevoegen ---
    {
      id: "dag11-namen-toevoegen",
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten, { compact: true }),
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap B: eerste berichten ---
    {
      id: "dag11-eerste-berichten",
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, { compact: true }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap C: uitnodigingen ---
    {
      id: "dag11-uitnodigingen",
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (scripts + jouw stem)`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen, { compact: true }),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },

    // --- Stap D: openstaande follow-ups ---
    {
      id: "dag11-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- Stap E: stories ---
    storiesStap(11),

    // --- Stap F: pipeline-check + leerstof (dag-specifiek) ---
    {
      id: "dag11-pipeline-check",
      label: "🎯 Pipeline-check: weet voor elke prospect wat de volgende stap is",
      uitleg:
        "Bovenaan deze pagina onder 'Wat je leert' staat de uitleg over one-pager versus presentatie. Lees die door, daarna doe je deze check.\n\nDE KERN IN ÉÉN ZIN: niemand slaat een stap over. Iedereen doorloopt: prospect → uitnodiging → one-pager of 3-weg → presentatie → beslissing. Geen sprongen, geen omleidingen.\n\nDE CHECK (5 minuten)\n\nOpen je namenlijst, schakel naar pijplijn-weergave. Kijk per fase wat je ziet:\n\n• PROSPECT: nog niet benaderd. Doel: vandaag of morgen een opener sturen.\n• IN GESPREK: eerste bericht is uit, gesprek loopt. Doel: zodra het natuurlijk past, een uitnodiging sturen volgens de vier bouwstenen (zie dag 4).\n• UITGENODIGD: uitnodiging is verstuurd, wachtend op JA. Doel: 24-48u check-in als ze stil zijn.\n• ONE-PAGER: info-pagina is gestuurd, wachtend op reactie. Doel: de tussenstap-zin sturen (staat letterlijk uitgeschreven in 'Wat je leert' bovenaan).\n• PRESENTATIE: diepgaand gesprek of 3-weg gehad. Doel: de 5-fasen-follow-up volgen (zie dag 6).\n• FOLLOW-UP: denkt na, twijfelt. Doel: de openings-zin 'wat spreekt je het meeste in aan?' of FFF bij bezwaren (zie dag 5).\n\nWAAR IS JE VERSTOPPING?\n\nDe fase waar de MEESTE mensen op staan is je verstopping, daar zit je vandaag werk. Per fase een concrete vervolgactie:\n\n• Veel mensen op IN GESPREK? Je hebt veel gesprekken lopen maar nog geen uitnodigingen verstuurd. Vandaag: schrijf voor 2 tot 3 van hen een uitnodiging volgens de vier bouwstenen uit dag 4. Inspiratie in /scripts of via de Mentor.\n• Veel mensen op UITGENODIGD? Ze hebben ja gezegd op een kijkmoment maar nog geen info gekregen. Vandaag: stuur ze de one-pager of plan een 3-weg in.\n• Veel mensen op ONE-PAGER? Ze hebben gekeken maar je hebt nog geen vervolg gestuurd. Vandaag: stuur de tussenstap-zin (zie 'Wat je leert' bovenaan voor de letterlijke tekst).\n• Veel mensen op PRESENTATIE? Goed werk, hier zit veel van de echte beweging. Volg de 5-fasen-follow-up van dag 6.\n• Veel mensen op FOLLOW-UP? Ze denken na. Stuur een natuurlijke heropener of, als ze een bezwaar hebben geuit, pas Feel-Felt-Found (FFF) toe van dag 5.\n\nDe truc is niet om alle fases tegelijk te bedienen, wel om VANDAAG je grootste verstopping te ontstoppen.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },

    // --- LAATSTE STAP: sponsor-checkin ---
    {
      id: "dag11-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor een berichtje: hoe ziet jouw pijplijn eruit na de check? Waar zit je bottleneck? Vraag of zij of hij een tip heeft voor de fase waar de meeste mensen vastzitten.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(11),
    partnerCheckStap(11),
  ];
}

/**
 * Standaard ABC-stappen (namen + eerste berichten + uitnodigingen) plus
 * D follow-ups (NA_DAG6-frame met FFF + 5-fasen) en E stories. Wordt
 * hergebruikt door dag 12+ functies om DRY te blijven. Per dag wordt
 * dit array gecombineerd met dag-specifieke F-stap en sponsor-afsluiter.
 */
export function standaardABCDEstappen(
  dagNummer: number,
  uren: CommitmentUren,
): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    {
      id: `dag${dagNummer}-namen-toevoegen`,
      label: `📲 Voeg ${dd.contacten} nieuwe namen toe aan je lijst`,
      uitleg: namenToevoegenUitleg(dd.contacten, { compact: true }),
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: `dag${dagNummer}-eerste-berichten`,
      label: `💬 Stuur ${dd.contacten} mensen een eerste bericht (opener)`,
      uitleg: eersteBerichtUitleg(dd.contacten, { compact: true }),
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: `dag${dagNummer}-uitnodigingen`,
      label: `📨 Verstuur ${dd.uitnodigingen} uitnodigingen (scripts + jouw stem)`,
      uitleg: uitnodigingenUitleg(dd.uitnodigingen, { compact: true }),
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },
    {
      id: `dag${dagNummer}-openstaande-followups`,
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    storiesStap(dagNummer),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 12.
 * Thema: Nee op business? Bied de webshop of producten aan (pivot).
 */
function bouwDag12VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(12, uren),
    {
      id: "dag12-pivot",
      label: "🔄 Stuur 1 product-pivot-bericht naar iemand die 'nee' zei op business",
      uitleg:
        "Heb je iemand die deze week 'nee' zei op de business-kant? Top moment om vandaag te pivoten naar product. De volledige pivot-formule (3 stappen + 3 voorbeelden) staat bovenaan onder 'Wat je leert'.\n\nDE KORTE VERSIE\n\n1. ERKEN ZONDER DRUK: 'Helemaal goed dat dit niet bij je past, geen probleem.'\n2. HAAK NAAR GEZONDHEID/ENERGIE: 'Trouwens, hoe gaat het bij je met [energie/slaap/sport]?'\n3. STEL PRODUCT-MOGELIJKHEID VOOR: twee varianten\n\n📋 VARIANT A: STUUR DE PRODUCTADVIES-TEST ALS ZACHTE TUSSENSTAP (aanbevolen)\n\nIn plaats van direct te vragen 'wil je een maand proberen?', kun je de productadvies-test van ELEVA als tussenstap inzetten. Open de prospect-kaart in je namenlijst, klik op 'Productadvies-test versturen', de prospect vult een korte vragenlijst in over hun klachten/wensen, en krijgt een gepersonaliseerd advies met welke producten passen.\n\nWaarom dit werkt: de prospect ervaart GERICHTE info in plaats van een algemene pitch. Pas DAARNA komt 'wil je het eens proberen?', gebaseerd op wat ZIJ zelf hebben aangegeven, niet wat jij voorstelt.\n\n💬 VARIANT B: DIRECT VOORSTELLEN\n\nWil je sneller zijn: 'Wil je eens een maand proberen, vrijblijvend?'. Werkt bij prospects die al concreet hebben verteld over een klacht of wens. Sla de test over en stel direct het product voor.\n\nNA HET PIVOT-BERICHT\n\nUpdate de pijplijn-fase in de namenlijst naar 'Shopper'. Maak een herinnering voor +21 dagen: '[naam], hoe bevallen de producten?'. Stop de business-vraag voor minstens 3 maanden, laat ze het ervaren.\n\nGeen pivot-kandidaat vandaag? Sla deze stap over. Geen druk om er één te forceren.",
      verplicht: false,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag12-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Heb je vandaag een pivot gedaan? Of een nee-die-warm-blijft? Stuur je sponsor in één zin hoe het ging.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(12),
    partnerCheckStap(12),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 13.
 * Thema: FORM (Family, Occupation, Recreation, Money) — rapport bouwen.
 */
function bouwDag13VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(13, uren),
    {
      id: "dag13-form-toepassen",
      label: "🎙️ Pas FORM bewust toe in minstens 1 gesprek vandaag",
      uitleg:
        "De volledige FORM-uitleg met voorbeelden per categorie + 'haken' om te luisteren staat bovenaan onder 'Wat je leert'.\n\nDE KORTE VERSIE\n\n• F (Family): wie hoort er bij hen, hoe gaat het thuis?\n• O (Occupation): wat doen ze nu, hoe bevalt het?\n• R (Recreation): waar krijgen ze energie van?\n• M (Money): hoe tevreden zijn ze met de financiële kant? Alleen na vertrouwen, never als eerste.\n\nDE GOUDEN REGEL\n\nJij praat 30%, zij 70%. Stel je vraag, wacht het antwoord af, vraag door ('vertel eens meer...'). Maak na het gesprek korte notitie in de prospect-kaart.\n\nLUISTER NAAR HAKEN: 'ik zou willen dat...', 'ik mis nog...', 'als ik meer tijd/geld had...'. Daar zit je opening voor een uitnodiging, niet eerder.\n\nKIES 1 SPECIFIEKE PROSPECT vandaag, plan een 5-min check-in (DM of telefoon), pas FORM toe. Schrijf 3 dingen op in de prospect-notities.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag13-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Bij welke prospect heb je FORM toegepast? Welke 'haak' heb je opgevangen? Stuur je sponsor één zin.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(13),
    partnerCheckStap(13),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 14.
 * Thema: Halverwege! Week 2 review. Net als dag 7 staat de review EERST,
 * vol tempo voor het werk (week 3 wordt belangrijk, niet rustiger),
 * sponsor-call (15 min) als langere afsluiter.
 */
function bouwDag14VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    {
      id: "dag14-review",
      label: "📋 Vul de week 2-review in (5 min reflectie)",
      uitleg:
        "Drie vragen: wat ging goed deze week, wat liep niet soepel, waar focus ik volgende week op? Open /statistieken voor de review-vragenlijst. Aan het eind kun je 'm met je sponsor delen, dan kan zij of hij zich voorbereiden op jullie call vanavond.\n\nKijk bij de review ook naar PATRONEN, niet alleen 'deed ik m'n aantallen?'. Welke berichten kregen reactie? Welke fase heeft de meeste vastzittende prospects? Daar zit je werk voor week 3.",
      verplicht: true,
      actieRoute: "/statistieken",
    },
    {
      id: "dag14-funnel-analyse",
      label: "🔍 Laat ELEVA je funnel analyseren",
      uitleg:
        "Na twee weken zit er meer in je pijplijn dan op dag 7. Tijd voor een echte analyse. De Mentor kijkt naar jouw cijfers per fase, identificeert waar mensen vastlopen, en geeft concreet advies welke dag-les je kunt herzien om die bottleneck aan te pakken in week 3.",
      verplicht: false,
      inlineEmbed: "funnel-analyse",
    },
    ...standaardABCDEstappen(14, uren),
    {
      id: "dag14-pipeline-check",
      label: "🔍 Bekijk je hele pijplijn: wie zit waar?",
      uitleg:
        "Open je namenlijst in pijplijn-weergave. Tel per fase. Waar stokt het? Dat is het thema voor week 3.\n\nDE KORTE BOTTLENECK-ANALYSE\n\n• Veel op UITGENODIGD zonder antwoord? Uitnodigingen herzien (dag 4).\n• Veel op ONE-PAGER zonder reactie? Follow-up te direct of mist focus op WAT raakte (dag 6).\n• Veel op PRESENTATIE zonder beslissing? Closing-werk komt op dag 17 (Doel-Tijd-Termijn).\n\nDe volledige bottleneck-uitleg met 40-dagen-fix per type staat bovenaan onder 'Wat je leert'.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag14-sponsor-call",
      label: "📞 15 min sponsor-call: week 3 voorbereiden",
      uitleg:
        "Wat werkte deze week? Wat liep niet soepel? Wat is het thema van week 3? Neem 15 minuten samen om week 2 door te lopen en week 3 vorm te geven. Tip: deel je review-formulier vóór de call zodat je sponsor zich kan voorbereiden.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(14),
    partnerCheckStap(14),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 15.
 * Thema: Week 3 begint, follow-up wordt het hoofdwerk. Het week-3-
 * thema staat in watJeLeert; geen aparte F-stap nodig om dat te
 * herhalen. Wel een extra ACTIE-stap die niet dubbelt met stap D
 * (openstaande follow-ups): herinneringen-lijst doorlopen op
 * vervaldatum van vandaag of eerder.
 */
function bouwDag15VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(15, uren),
    {
      id: "dag15-herinneringen-doorlopen",
      label: "🔔 Loop je herinneringen-lijst door (vervaldatum vandaag of eerder)",
      uitleg:
        "Open Menu → Herinneringen → Alle open. Filter op vervaldatum vandaag of eerder. Voor elke openstaande herinnering: doe 'm vandaag of update de vervaldatum.\n\nWaarom apart van stap 4 (openstaande follow-ups)? In stap 4 ga je proactief door je pijplijn voor follow-up-momenten. Hier check je SPECIFIEK welke herinneringen je in eerdere dagen hebt aangemaakt en die nu klaar staan om actie te ondernemen. Vaak zitten daar 'verloren' prospects tussen die je anders zou vergeten.\n\nDe langspeelplaten-regel: een nee NU is geen nee voor altijd. Een herinnering uit dag 5 of dag 10 kan vandaag exact het juiste moment zijn om iemand weer aan te raken.",
      verplicht: true,
      actieRoute: "/herinneringen",
    },
    {
      id: "dag15-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor: 'Week 3 begint, follow-up wordt mijn focus. Hoeveel mensen heb ik nu warm te houden, ongeveer?'. Sponsor helpt je zicht houden.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(15),
    partnerCheckStap(15),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 16.
 * Thema: 5 types prospects — energie waar het telt.
 */
function bouwDag16VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(16, uren),
    {
      id: "dag16-categoriseer",
      label: "🎯 Categoriseer je top-20 actieve prospects in de 5 types",
      uitleg:
        "De volledige 5-types-uitleg met signalen + aanpak per type staat bovenaan onder 'Wat je leert'.\n\nDE KORTE VERSIE\n\n1. ACTIEF ZOEKEND: direct presenteren, hun moment is NU. Energie: HOOG.\n2. OPEN: rapport bouwen, FORM-vragen, langzaam exposeren. Energie: HOOG.\n3. PRODUCTKOPER: pivot naar Shopper (zie dag 12). Energie: GEMIDDELD.\n4. NIET-NU: erkennen, warm houden, herinnering +3 maanden. Energie: LAAG.\n5. NOOIT: erkennen, loslaten als prospect, behouden als persoon. Energie: NUL voor business, 100% warmte als relatie.\n\nDE ÉÉN-WOORD-OEFENING\n\nOpen je namenlijst, pak je top-20 actieve prospects. Per persoon: één type. Pas eventueel de pijplijn-fase of een tag aan.\n\nVOLGENDE WEEK\n\nEnergie-budget: ~70% naar type 1+2, ~20% naar type 3, ~10% naar type 4. Type 5 = warmte-onderhoud, geen werk-tijd. De grootste fout: type 5 behandelen als type 2 (eindeloos hopen op die ene oude vriend).",
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag16-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Hoeveel type 1+2 prospects heb je geïdentificeerd? Dat is je echte werk-voorraad. Stuur je sponsor het aantal.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(16),
    partnerCheckStap(16),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 17.
 * Thema: Closing met Doel-Tijd-Termijn. Inline-actie: schrijf je eigen
 * openings-closing-zin (bewaard onder /mijn-zinnen).
 */
function bouwDag17VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(17, uren),
    {
      id: "dag17-eigen-closing-zin",
      label: "✍️ Schrijf jouw eigen openings-closing-zin (5 min)",
      uitleg:
        "Eén vaste zin waarmee jij Doel-Tijd-Termijn introduceert in een gesprek. Bewaard onder /mijn-zinnen zodat je 'm altijd snel kunt oppakken. De 5 vragen + voorbeelden staan bovenaan onder 'Wat je leert'.",
      verplicht: true,
      inlineActie: {
        type: "tekst",
        slug: "closing-openingszin",
        label: "Mijn closing-openingszin",
        instructie:
          "Een natuurlijke aanloop naar de 5 closing-vragen. Niet pushy, wel duidelijk. Stel het zo voor als 'helpen beslissen'.",
        placeholder:
          "Bv. Mag ik je een paar korte vragen stellen om te kijken of dit voor jou realistisch is?",
        maxTekens: 280,
        voorbeeld:
          "Mag ik je 5 korte vragen stellen om te kijken of dit voor jou realistisch is qua tijd en doelen? Geen druk, gewoon eerlijk samen kijken.",
      },
    },
    {
      id: "dag17-closing-toepassen",
      label: "🎯 Pas Doel-Tijd-Termijn toe bij minstens 1 warme prospect",
      uitleg:
        "Bij iemand die al een presentatie of 3-weg heeft gehad en nog twijfelt: stel de 5 closing-vragen op volgorde. Dit is helpen beslissen, geen drammen.\n\nDE 5 VRAGEN (recap, volledige uitleg + 3 voorbeelden bovenaan)\n\n1. DOEL: 'Hoeveel euro per maand extra zou dit de moeite waard maken?'\n2. TIJD: 'Hoeveel uur per week heb je daar realistisch voor?'\n3. TERMIJN: 'Na hoeveel maanden moet dat bedrag er staan?'\n4. VERBINDING: 'Als ik je kan laten zien dat dat realistisch is, wil je dat dan serieus bekijken?'\n5. START: 'Als dat klopt en goed voelt, starten we dan gewoon?'\n\nLaat de stilte vallen na vraag 5. Dat is goud.",
      verplicht: false,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag17-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Heb je vandaag Doel-Tijd-Termijn toegepast? Bij wie, hoe verliep het? Stuur je sponsor één zin.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(17),
    partnerCheckStap(17),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 18.
 * Thema: Edification — de zin die je sponsor laat schitteren.
 * Inline-actie: schrijf je eigen edification-zin (bewaard onder /mijn-zinnen).
 */
function bouwDag18VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(18, uren),
    {
      id: "dag18-edification-zin",
      label: "✨ Schrijf jouw eigen edification-zin (5 min)",
      uitleg:
        "Eén vaste zin van max 25 woorden waarmee je je sponsor introduceert in elk 3-weg of bij elke presentatie. Bewaard onder /mijn-zinnen, altijd snel terug te vinden.\n\nDE FORMULE (volledig uitleg bovenaan onder 'Wat je leert'):\n1. Wie introduceer je?\n2. Wat is hun track-record of autoriteit?\n3. Waarom heb JIJ ze gekozen?\n\nGeen overdrijving, gewoon de waarheid, sterk gebracht.",
      verplicht: true,
      inlineActie: {
        type: "tekst",
        slug: "edification-zin",
        label: "Mijn edification-zin",
        instructie:
          "Volg de formule: 1) wie introduceer je, 2) wat is hun track-record of autoriteit, 3) waarom heb JIJ ze gekozen. Max 25 woorden. Geen overdrijving, gewoon de waarheid, sterk gebracht.",
        placeholder: "Bv. Ik ga je voorstellen aan...",
        maxTekens: 280,
        voorbeeld:
          "Ik ga je voorstellen aan Mark, die al 12 jaar mensen helpt om hun energie en ondernemerschap weer terug te vinden, degene die mij heeft laten zien hoe dit echt werkt.",
      },
    },
    {
      id: "dag18-edification-toepassen",
      label: "🎯 Pas je edification-zin minstens 1× toe deze week",
      uitleg:
        "Bij je eerstvolgende 3-weg of presentatie: gebruik de zin letterlijk vóór je sponsor introduceert. Niet improviseren, gewoon zeggen. Goede edification verandert een gesprek waar drie mensen praten in een setting waar de prospect denkt: 'wow, deze persoon weet écht waar het over gaat'.",
      verplicht: false,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag18-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor je nieuwe edification-zin: 'Dit is mijn vaste zin waarmee ik je voortaan introduceer, klopt 'm volgens jou?'.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(18),
    partnerCheckStap(18),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 19.
 * Thema: Pipeline-check — waar lekt je trechter? Handmatige pijplijn-
 * doorloop (geen Mentor-funnel-analyse, die komt pas op dag 21 als
 * 21-dagen-oogst en daarna automatisch elke weekstart-dag in 22-60).
 */
function bouwDag19VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(19, uren),
    {
      id: "dag19-pipeline-doorloop",
      label: "🔍 Pipeline-doorloop: tel per fase + identificeer je bottleneck",
      uitleg:
        "Vandaag loop je je hele pijplijn handmatig door. De volledige bottleneck-analyse (4 types lekken + 40-dagen-fix per type) staat bovenaan onder 'Wat je leert'.\n\nWAT JE DOET\n\n1. Open je namenlijst in pijplijn-weergave (of /statistieken).\n2. Schrijf voor jezelf de aantallen op per fase: Uitgenodigd / One-pager / Presentatie / Beslist.\n3. Identificeer je grootste drop-off, welke fase verliest de meeste mensen?\n4. Schrijf op: één specifieke oefening voor de komende 40 dagen om die drop-off te verkleinen.\n\nVERWACHTE GEZONDE TRECHTER (na 21 dagen)\n\nUitnodigingen → 50-70% reageert → 50% bekijkt one-pager → 40% naar presentatie → 30% beslist.\n\nZit jij ergens veel onder? Daar is je werk. De Mentor-analyse-knop staat op dag 21 (overmorgen) en daarna op /statistieken om altijd op te roepen.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag19-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor: 'Mijn bottleneck zit op [fase]. Heb je een tip voor de komende 40 dagen?'. Sponsor heeft vaak waardevolle ervaring per fase.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(19),
    partnerCheckStap(19),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 20.
 * Thema: Vraag de beslissing — de moedigste vraag van het vak.
 */
function bouwDag20VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  return [
    ...standaardABCDEstappen(20, uren),
    {
      id: "dag20-vraag-beslissing",
      label: "💪 Vraag minstens 1 warme prospect: 'Wat heb je nog nodig om te beslissen?'",
      uitleg:
        "De grootste fout van starters is NIET vragen naar de beslissing. Ze blijven volgen, blijven delen, blijven hopen, soms maandenlang. De prospect raakt overspoeld of vergeet, jij raakt uitgeput, en niemand wordt iets wijzer.\n\nDE DRIE GOEDE VRAAG-VARIANTEN (volledig met voorbeelden bovenaan)\n\n1. ZACHTE VARIANT: 'Wat heb je nog nodig om een goede beslissing te kunnen nemen?', open vraag, geen druk.\n2. DIRECTE VARIANT: 'De echte vraag is niet of je iets wilt veranderen, maar of dit het juiste voertuig is. Klopt dat?'\n3. PRAGMATISCHE VARIANT: 'Op basis van wat je hebt gezien: zie je jezelf als klant, als opbouwer, of nog niet?'\n\nWAT JE VANDAAG DOET\n\nKies 1 prospect die meer dan 3 exposures heeft gehad zonder beslissing. Vraag vandaag of morgen met variant 1 of 3.\n\nNA EEN BESLISSING: update direct de pijplijn-fase in de namenlijst. Ja op member → enrollment-flow. Ja op shopper → herinnering +21 dagen, géén business-vraag voor 3 maanden. Nee/niet-nu → erkennen warm, herinnering +90 dagen.\n\nBeslissing krijgen is winst, ongeacht de richting.",
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag20-sponsor-checkin",
      label: "💬 Sluit af met een korte sponsor-checkin",
      uitleg:
        "30 seconden. Bij wie heb je vandaag of morgen voor de beslissing gevraagd? Wat was de reactie? Stuur je sponsor één zin, ongeacht de richting is dit een winst.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(20),
    partnerCheckStap(20),
  ];
}

/**
 * Tempo-specifieke vervangings-data voor dag 21.
 * Thema: 21 dagen klaar! Net als dag 7+14 een review-dag.
 * Minimum-aantallen (zoals dag 7) zodat er ruimte is voor de 21-dagen-
 * reflectie en de 40-min sponsor-call. Niet rustiger op pijplijn,
 * wel rustiger op nieuw werk.
 */
function bouwDag21VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const min = dagdoelenMinimum(uren);

  return [
    {
      id: "dag21-review-3",
      label: "📋 Vul de week 3-review in (5 min)",
      uitleg:
        "Drie vragen: wat ging goed deze week, wat liep niet soepel, waar focus ik volgende week op? Open /statistieken voor de review-vragenlijst.",
      verplicht: true,
      actieRoute: "/statistieken",
    },
    {
      id: "dag21-reflectie-21",
      label: "🪞 Reflectie: hoe voelt de eerste 21 dagen?",
      uitleg:
        "Wat leerde je over jezelf? Waar groeide je? Wat was moeilijker dan gedacht? Wat bleek makkelijker? Deze reflectie gaat naar je sponsor en helpt bij jullie 40-min call straks.\n\nWAT JE IN 21 DAGEN HEBT GEDAAN (erkén het)\n\n• Een namenlijst van 100+ mensen aangelegd (was 0)\n• Tussen de 100 en 200 uitnodigingen verstuurd\n• Bezwaren leren behandelen met Feel-Felt-Found (FFF)\n• 3-weg-gesprekken gestart en gevoerd\n• Edification, FORM, Doel-Tijd-Termijn als technieken in je gereedschapskist\n• 1-3 beslissingen binnen (member, shopper of not-yet)\n\nDit is een fundament. Het echte gebouw zet je in de komende 40 dagen.",
      verplicht: true,
      actieRoute: "/statistieken",
    },
    {
      id: "dag21-funnel-analyse",
      label: "🔍 21-dagen-oogst: laat ELEVA je complete funnel analyseren",
      uitleg:
        "Dit is de derde keer dat je deze analyse doet (na dag 7 en dag 14). Vandaag staan je cijfers het volst, perfect moment om met de Mentor te kijken WAT je in 21 dagen hebt opgebouwd en WAAR je voor de komende 40 dagen op gaat focussen.\n\nDe analyse is ook input voor je 40-dagen-doel (volgende stap) en voor je 40-min sponsor-call straks.",
      verplicht: true,
      inlineEmbed: "funnel-analyse",
    },
    {
      id: "dag21-namen-toevoegen",
      label: `📲 Voeg minimaal ${min.contacten} namen toe aan je lijst`,
      uitleg: `Vandaag is reflectie-dag, dus rustiger op de input, maar je pijplijn houdt z'n stroom. Minimaal ${min.contacten} nieuwe namen, meer mag altijd. Minder dan ${min.contacten} doe je niet, dat breekt het ritme dat je hebt opgebouwd.\n\n${namenToevoegenUitleg(min.contacten, { compact: true })}`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag21-eerste-berichten",
      label: `💬 Stuur minimaal ${min.contacten} mensen een eerste bericht (opener)`,
      uitleg: `Minimaal ${min.contacten} eerste berichten vandaag, meer mag.\n\n${eersteBerichtUitleg(min.contacten, { compact: true })}`,
      uitnodigHelpKnoppen: true,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag21-uitnodigingen",
      label: `📨 Verstuur minimaal ${min.uitnodigingen} uitnodigingen`,
      uitleg: `Minimaal ${min.uitnodigingen} uitnodigingen vandaag, meer mag.\n\n${uitnodigingenUitleg(min.uitnodigingen, { compact: true })}`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },
    {
      id: "dag21-openstaande-followups",
      label: "🔄 Doe je openstaande follow-ups vandaag",
      uitleg: FOLLOWUP_UITLEG_NA_DAG6,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    storiesStap(21),
    {
      id: "dag21-doel-40",
      label: "🎯 Stel 1 concreet doel voor de volgende 40 dagen",
      uitleg:
        "Geen vaag doel. Iets concreets. 'Ik wil 5 members meer' of 'Ik wil consistent 10-10-3 blijven draaien' of 'Ik wil mijn bottleneck-fase met 50% verkleinen'. Vraag de Mentor als je twijfelt: 'Help me 1 concreet doel formuleren voor de volgende 40 dagen op basis van wat ik in 21 dagen heb behaald'.",
      verplicht: true,
      actieRoute: "/mijn-why",
    },
    {
      id: "dag21-sponsor-call",
      label: "📞 40 min sponsor-call: week 3 afsluiten + blok 2 voorbereiden",
      uitleg:
        "Langere call dan een wekelijkse. Neem 40 minuten samen om de hele eerste 21 dagen door te lopen en de volgende 40 te vormgeven. Tip: deel je reflectie + 40-dagen-doel vooraf zodat je sponsor zich kan voorbereiden.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    momentumRadarStap(21),
    partnerCheckStap(21),
  ];
}

/**
 * Past tempo-specifieke vervangingen toe op een dag.
 *
 * Voor dagen met tempo-aware logica (momenteel dag 3 + dag 4):
 * vervangt vandaagDoen. Voor andere dagen passthrough.
 *
 * @param dag             Basis-dag uit DAGEN[].
 * @param commitmentUren  Het tempo dat de user heeft gekozen. Null
 *                        = nog geen keuze gemaakt; in dat geval
 *                        passthrough (geen vervanging).
 */
export function pasTempoToeOpDag(
  dag: Dag,
  commitmentUren: CommitmentUren | null,
): Dag {
  // Geen tempo gekozen of dag is niet tempo-aware -> ongewijzigd terug.
  if (commitmentUren === null) return dag;

  if (dag.nummer === 3) {
    return {
      ...dag,
      vandaagDoen: bouwDag3VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 4) {
    return {
      ...dag,
      vandaagDoen: bouwDag4VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 5) {
    return {
      ...dag,
      vandaagDoen: bouwDag5VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 6) {
    return {
      ...dag,
      vandaagDoen: bouwDag6VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 7) {
    return {
      ...dag,
      vandaagDoen: bouwDag7VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 8) {
    return {
      ...dag,
      vandaagDoen: bouwDag8VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 9) {
    return {
      ...dag,
      vandaagDoen: bouwDag9VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 10) {
    return {
      ...dag,
      vandaagDoen: bouwDag10VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 11) {
    return {
      ...dag,
      vandaagDoen: bouwDag11VandaagDoen(commitmentUren),
    };
  }

  if (dag.nummer === 12) {
    return { ...dag, vandaagDoen: bouwDag12VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 13) {
    return { ...dag, vandaagDoen: bouwDag13VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 14) {
    return { ...dag, vandaagDoen: bouwDag14VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 15) {
    return { ...dag, vandaagDoen: bouwDag15VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 16) {
    return { ...dag, vandaagDoen: bouwDag16VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 17) {
    return { ...dag, vandaagDoen: bouwDag17VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 18) {
    return { ...dag, vandaagDoen: bouwDag18VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 19) {
    return { ...dag, vandaagDoen: bouwDag19VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 20) {
    return { ...dag, vandaagDoen: bouwDag20VandaagDoen(commitmentUren) };
  }
  if (dag.nummer === 21) {
    return { ...dag, vandaagDoen: bouwDag21VandaagDoen(commitmentUren) };
  }

  // Andere dagen: voorlopig nog niet tempo-aware. Hier komen volgende
  // rondes de varianten voor dag 22+ te zien.
  return dag;
}
