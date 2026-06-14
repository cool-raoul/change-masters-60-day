// File: lib/playbook/core-sideflows-v9.ts
//
// Core V9 side-flows: pre-post (scenario B) en 21-dagen-resultaat-post
// (scenario A). Beide flows zijn substep-georiënteerd, met copywriting-
// uitlokking en 3-soorten-mensen-DM-scripts.
//
// Wijzigingen tov V7 op basis van Raoul-feedback (26 mei 2026):
//   - Pre-post: geen "eigen 21-dagen programma starten" meer (al gebeurd)
//   - Pre-post: copywriting moet uitlokken "wat ga je doen?"
//   - Pre-post: DM-script GEZELLIG-variant (niet de BLIJ-variant)
//   - 21-dagen-post: ALLE positieve veranderingen, niet 1-2
//   - Beide: Mini-ELEVA + 3-weg basis HIER al uitleggen (cluster 4-5
//     komt later)
//   - Beide: zelf filmpjes kijken substep

import type { ControllableTaak } from "./types";

export type Sideflow = {
  /** Stabiele slug, gebruikt in DB en routes */
  slug: "pre-post" | "21-dagen-post";
  /** Titel voor de side-flow */
  titel: string;
  /** Korte ondertitel onder de titel */
  ondertitel: string;
  /** Lange uitleg-tekst (paragrafen) */
  intro: string;
  /** Substeps in de flow */
  substeps: ControllableTaak[];
  /** Slot-tekst onder de substeps */
  slotTekst: string;
};

// ============================================================
// DM-SCRIPTS
// ============================================================

/**
 * GEZELLIG-variant. Gebruikt bij PRE-POST. Werkt voor likes + reacties.
 * Past niet om te zeggen "ik heb besloten anderen te helpen" voor de
 * pre-post, want je hebt zelf nog niets gemerkt.
 */
export const DM_SCRIPT_GEZELLIG = `Hey [naam], bedankt voor je reactie / like op mijn post. Ik zoek nog mensen die gezellig met mij willen meedoen. Wellicht wat voor jou, of voor iemand uit jouw omgeving? Dan stuur ik je vrijblijvend wat informatie.`;

/**
 * BLIJ-variant. Gebruikt bij 21-DAGEN-POST. Past omdat je nu wél een
 * resultaat hebt gemerkt en daarmee anderen wil helpen.
 */
export const DM_SCRIPT_BLIJ = `Hey [naam], bedankt voor je reactie / like op mijn post. Ik ben hier zo blij mee dat ik heb besloten om anderen hier ook mee te helpen. Ken jij mensen in jouw omgeving voor wie dit wat zou kunnen zijn? En misschien is het ook wel wat voor jezelf. Ik voorzie jou of die personen graag vrijblijvend van alle informatie.`;

// ============================================================
// PRE-POST SIDE-FLOW (scenario B)
// ============================================================

export const PRE_POST_SIDEFLOW: Sideflow = {
  slug: "pre-post",
  titel: "🌱 Pre-post side-flow",
  ondertitel:
    "Je gaat beginnen, deelt je voornemen, en bouwt aanwezigheid op",
  intro: `Welkom in de pre-post side-flow 💟

Je hebt nog geen eigen resultaat met de producten. Geen probleem: je gaat beginnen, en je gebruikt deze start als startschot om mensen erbij te betrekken. Dat is precies wat een pre-post is.

WAT DEZE FLOW GAAT DOEN

Een pre-post brengt direct misschien nog geen productgebruikers, maar wel veel reacties en likes. Die zijn goud waard, want elke reactie en elke like is een opening naar een gesprek. Het 3-soorten-mensen-DM-script onderaan helpt je om die openingen niet te laten liggen.

DE COPYWRITING-TRUC

Een goede pre-post lokt de vraag uit: "wat ga je doen?". Dat is wat je probeert te triggeren. Je vertelt niet WAT je gaat doen, je vertelt het verlangen of het voornemen, en je laat mensen vragen.

Voorbeeld-richtingen om mee te starten:

"Vandaag begin ik aan iets dat ik al een tijd uitstel. Ik ben benieuwd wat ik over 21 dagen ga merken. Spannend!"

"Ik geef mezelf de komende 21 dagen om iets nieuws te proberen. Ik weet niet helemaal hoe het gaat lopen, maar ik wil het wel een eerlijke kans geven."

"Drie weken vanaf nu. Eén ding waar ik nieuwsgierig naar ben. Doe me even na en je hoort het resultaat 😉"

Geen claim, geen belofte, wel een opening die mensen aan het denken zet. De Mentor helpt je om een versie te schrijven die past bij JOUW stem.

Niet alleen. Bouwen mag leuk zijn 💟`,

  substeps: [
    {
      id: "core-v9-sideflow-prepost-1-uitleg",
      label: "Mini-uitleg: wat is een pre-post en wat doet 'ie?",
      verplicht: true,
      uitleg:
        "Een korte uitleg in twee minuten: wat is een pre-post, wat doet 'ie, en wat ga je ermee bereiken? Eén filmpje van Gaby en Raoul plus een korte begeleidende tekst, zodat je voelt hoe deze flow eruitziet voor je 'm zelf gaat doen. Een pre-post brengt vaak veel reacties en likes binnen, en elke reactie is een opening naar een gesprek. De PDF 'Voorbereiding Pre Post Lancering' staat klaar om te downloaden als je 'm later wil teruglezen. (TODO: media toevoegen)",
    },
    {
      id: "core-v9-sideflow-prepost-2-filmpjes-zelf",
      label: "Bekijk zelf de prospect-filmpjes die je later wilt versturen",
      verplicht: true,
      uitleg:
        "Bekijk zelf de prospect-filmpjes die je straks naar info-vragers wil sturen. Niet om 'm uit je hoofd te leren, wel om te weten wat erin zit, hoe lang 'ie duurt, en in welke situatie 'ie past. Want zodra iemand straks vraagt 'wat ga je doen?', wil je niet een filmpje versturen dat je zelf nog niet hebt gezien. Dezelfde filmpjes gebruik je later ook bij de 21-dagen-resultaat-post-flow en in je algemeen prospect-werk. (TODO: media-links)",
    },
    {
      id: "core-v9-sideflow-prepost-3-copywriting",
      label: "Schrijf je pre-post met de Mentor (jouw eerlijke voornemen)",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Schrijf je pre-post als een kort, eerlijk gevoelsverhaal in jouw stem, volgens de vaste opbouw die we als team gebruiken (staat in de claimvrije-communicatie). Vier delen: 1) een korte emotionele opener die de scroll stopt, 2) hoe je je de laatste tijd voelde, in ik-taal en claim-vrij (bijvoorbeeld 'futloos, niet lekker in mijn vel, energie die vaak wegzakte'), 3) wat je hebt besloten te doen, gewoon open benoemd (de komende 21 dagen bewust aan de slag met je leefstijl: gezonder eten, meer water, beter slapen, meer rustmomenten), en 4) je positieve verwachting, een bedankje aan je mentor en een 'wish me luck'. Je houdt dus niks achter en maakt er geen raadsel van, je deelt je voornemen open en eerlijk. De Mentor bouwt 'm met je op in precies deze structuur, drie rondjes en 'm staat. Claim-vrij: geen ziektes, geen medische woorden, geen 'door dit product', wel gevoel, gedrag en bewustwording.",
    },
    {
      id: "core-v9-sideflow-prepost-4-upline-check",
      label: "Upline-check, stuur concept naar sponsor voor akkoord",
      verplicht: true,
      inlineEmbed: "sponsor-melding",
      uitleg:
        "Stuur je concept naar je sponsor voor een korte akkoord, voordat je 'm plaatst. Niet voor goedkeuring maar voor een tweede paar ogen, soms zie je zelf iets over het hoofd. Wacht op haar akkoord of een dag, en als 'r ondertussen geen reactie is plaats je 'm gewoon. Tik de knop hieronder om je sponsor te bereiken.",
    },
    {
      id: "core-v9-sideflow-prepost-5-plaatsen",
      label: "Plaats op Facebook én Instagram",
      verplicht: true,
      uitleg:
        "Plaats je pre-post op Facebook én Instagram. Klaar is klaar, ga niet meer terugkrabbelen of nog een keer bijschaven. Noteer voor jezelf hoe laat je 'm hebt geplaatst, dan kun je over een paar uur zien wie heeft gereageerd en weet je wanneer je follow-up-timer begint. Vanaf nu blijf je in de buurt om binnen het uur op reacties te kunnen reageren.",
    },
    {
      id: "core-v9-sideflow-prepost-6-dm-script",
      label: "Zet het 3-soorten-mensen-DM-script klaar in je notities",
      verplicht: true,
      uitleg: `Naar IEDEREEN die reageert OF liket stuur je een DM. Drie soorten mensen:

1. VRAGEN WAT JE DOET → Stuur info + een prospect-filmpje. Volg op binnen 24-48u.

2. REAGEERDERS (succes! / mooi! / herkenbaar / leuk) → Stuur deze DM:

"${DM_SCRIPT_GEZELLIG}"

3. LIKERS (alleen een like, geen reactie) → Stuur dezelfde DM als bij reageerders.

Belangrijk: de tekst zegt NIET 'ik heb besloten anderen te helpen', want je hebt het zelf nog niet gedaan. Wel 'ik zoek mensen die gezellig met mij meedoen'. Dat past wel.`,
    },
    {
      id: "core-v9-sideflow-prepost-7-mini-eleva-uitleg",
      label: "Korte uitleg: Mini-ELEVA + 3-weg, zodat je klaarstaat",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Zodra een prospect interesse toont, heb je twee opties: 'm naar Mini-ELEVA sturen (laagdrempelig, ze kunnen zelf kijken en vragen stellen aan de Mentor in jouw stem) of een 3-weg met je sponsor inplannen (persoonlijk gesprek). Welke kies je? Wil iemand graag een gesprek, dan een 3-weg. Wil iemand eerst zelf rondkijken, dan Mini-ELEVA. Twijfel je, begin met Mini-ELEVA, opschalen kan altijd. De Mentor licht beide in een paar minuten met je door, in stap 5 van Core volgt de uitgebreide versie.",
    },
    {
      id: "core-v9-sideflow-prepost-8-reageer-routine",
      label: "Binnen 1 uur op iedere reactie reageren (Mentor staat klaar)",
      verplicht: true,
      uitleg:
        "Reageer binnen een uur op iedere reactie, ook op een kale like. Elke reactie is een opening naar een gesprek, en hoe sneller je reageert hoe makkelijker het loopt. Het 3-soorten-mensen-DM-script van net heb je klaarstaan, gebruik dat als basis. Bij DM's waar het standaard-script niet helemaal past, vraag je de Mentor om een opener-zin op maat, daar staat 'ie voor klaar. Snelheid is alles in deze fase.",
    },
    {
      id: "core-v9-sideflow-prepost-9-prospects-toevoegen",
      label: "Geïnteresseerde prospects toevoegen aan je namenlijst + (optioneel) Mini-ELEVA",
      verplicht: true,
      actieRoute: "/namenlijst",
      uitleg:
        "Geïnteresseerde prospects voeg je met één klik vanuit de DM-flow toe aan je namenlijst, zodat ze niet kwijtraken. Voor wie eerst zelf wil rondkijken open je Mini-ELEVA, dat is een persoonlijke omgeving waar de Mentor in jouw stem hun vragen kan beantwoorden. Beide stappen vandaag nog doen voor iedereen die heeft gereageerd, anders mis je er straks een paar. Eén klik per persoon, ben je in vijf minuten klaar.",
    },
    {
      id: "core-v9-sideflow-prepost-10-reflectie",
      label: "Sidestep-opbrengst reflectie + 21-dagen-trigger instellen",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Korte sidestep-reflectie: hoeveel reacties heb je gehad, hoeveel DM's, hoeveel prospects zijn er bijgekomen? De Mentor noteert het voor je. Stel meteen in wanneer je over een paar weken de 21-dagen-resultaat-post-trigger wil ontvangen, default staat op 21 dagen na vandaag. Zo komt 'ie vanzelf in beeld wanneer je 't nodig hebt, in plaats van dat je 'm zelf moet onthouden.",
    },
    {
      id: "core-v9-sideflow-prepost-11-afronden",
      label: "Afronden of openliggen?",
      verplicht: true,
      uitleg:
        "Twee opties om deze sidestep af te ronden. 'Voltooid' betekent: sidestep sluit, Core schuift door naar ankerstap 2 (top-20 + webshop-pivot). 'Nog mee bezig' betekent: sidestep blijft openliggen, en je krijgt een reminder over een paar dagen om 'm af te ronden. Voel je nog ruimte voor follow-up of verwacht je nog reacties? Hou 'm dan rustig open. Klaar met deze ronde? Voltooid, en door naar het volgende anker.",
    },
  ],

  slotTekst: `Klaar met de pre-post-flow? Goed gedaan 💟

Vanaf hier opent ankerstap 2 (top-20-namenlijst + webshop-pivot). De prospects die je via deze post hebt binnengehaald zitten al in je lijst, samen met de mensen uit je top-20 ga je daar straks mee verder.

En over ongeveer 21 dagen krijg je via trigger een uitnodiging om de 21-dagen-resultaat-post side-flow te starten. Tegen die tijd heb je wél eigen ervaring om over te delen.`,
};

// ============================================================
// 21-DAGEN-POST SIDE-FLOW (scenario A, of scenario B na trigger)
// ============================================================

export const VEERTIEN_DAGEN_POST_SIDEFLOW: Sideflow = {
  slug: "21-dagen-post",
  titel: "🌟 21-dagen-resultaat-post side-flow",
  ondertitel:
    "Je deelt wat je hebt ervaren, claim-vrij en eerlijk, en brengt mensen in beweging",
  intro: `Welkom in de 21-dagen-resultaat-post side-flow 💟

Je hebt ervaring met de producten. Inmiddels merk je wat er anders is geworden in jouw lichaam, je stemming, je energie, je slaap, je vel. Vandaag deel je dat op een manier die mensen aan het denken zet zonder dat je een belofte doet.

WAT DEZE FLOW GAAT DOEN

Een 21-dagen-post is bewezen sterk. Bij sommige mensen brengt deze post direct nieuwe productgebruikers binnen, soms zelfs meerdere op één dag. Bij anderen vooral een lawine aan reacties, likes, en DM's die je opvolgt.

ALLE POSITIEVE VERANDERINGEN, NIET ÉÉN OF TWEE

Noem alle positieve veranderingen die je hebt gemerkt, claim-vrij geformuleerd. Want verschillende mensen worden door verschillende dingen geraakt. Iemand met slaapproblemen leest "ik slaap dieper". Iemand met laag-energie leest "ik heb meer pit". Iemand met overgewicht leest "ik voel me lichter".

Snap je waarom dat zoveel meer losmaakt? Eén verandering raakt één persoon. Alle veranderingen samen raken iedereen die meeleest, en lokken de vraag uit: "Wat is dat dan?" of "Wat heb je gedaan?".

CLAIM-VRIJ FORMULEREN

Niet wat het PRODUCT doet, wel wat JIJ hebt gemerkt. Geen "dit pakt slaap aan" maar "ik slaap dieper". Geen "ondersteunt je energie" maar "ik heb meer energie".

Voorbeeld-richting:

"21 dagen geleden begon ik aan iets. Vandaag merk ik: ik slaap dieper, ik heb meer pit overdag, ik voel me lichter, mijn vel ziet er rustiger uit, en ik ben minder snel chagrijnig in de avond. Wat heb ik precies gedaan? Reageer en ik vertel het je 💛"

Vijf veranderingen genoemd, geen claim, eind met een uitnodiging om te reageren. De Mentor helpt je dit in JOUW stem te schrijven, met de veranderingen die JIJ specifiek hebt gemerkt.

Niet alleen. Bouwen mag leuk zijn 💟`,

  substeps: [
    {
      id: "core-v9-sideflow-21dagen-1-uitleg",
      label: "Mini-uitleg: wat is een 21-dagen-resultaat-post?",
      verplicht: true,
      uitleg:
        "Een korte uitleg in twee minuten: wat is een 21-dagen-resultaat-post, wat doet 'ie, en wat ga je er straks mee bereiken? Eén filmpje van Gaby en Raoul plus een korte begeleidende tekst, zodat je weet hoe deze flow eruitziet voor je 'm zelf gaat doen. Een 21-dagen-post is bewezen sterk, en brengt vaak direct nieuwe productgebruikers binnen, soms zelfs meerdere op één dag. De PDF 'Voorbereiding 21 Dagen Post' staat klaar om te downloaden als je 'm later wil teruglezen. (TODO: media toevoegen)",
    },
    {
      id: "core-v9-sideflow-21dagen-2-filmpjes-zelf",
      label: "Bekijk zelf de prospect-filmpjes die je gaat versturen aan info-vragers",
      verplicht: true,
      uitleg:
        "Bekijk zelf de prospect-filmpjes die je straks naar info-vragers wil sturen. Niet om 'm uit je hoofd te leren, wel om te weten wat erin zit, hoe lang 'ie duurt, en in welke situatie 'ie past. Want zodra iemand straks vraagt 'wat heb je gedaan?', wil je niet een filmpje versturen dat je zelf nog niet hebt gezien. Dezelfde filmpjes gebruik je later ook bij algemeen prospect-werk en in opvolg-stappen. (TODO: media-links)",
    },
    {
      id: "core-v9-sideflow-21dagen-3-veranderingen-inventariseren",
      label: "Inventariseer met de Mentor ALLE positieve veranderingen die je hebt gemerkt",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Inventariseer met de Mentor ALLE positieve veranderingen die je hebt gemerkt sinds je begon. Niet één of twee, maar alle: slaap, energie, vel, stemming, lichaam, focus, opladen, verteren, je humeur, alles waar je iets in voelt schuiven. De Mentor stelt vragen, jij vertelt rustig. Verschillende mensen worden door verschillende dingen geraakt, en hoe meer veranderingen je noemt hoe meer doelgroepen je triggert. Hou 'm wel claim-vrij, dus niet 'mijn slaap is genezen' maar 'ik slaap dieper'.",
    },
    {
      id: "core-v9-sideflow-21dagen-4-tekst-schrijven",
      label: "Schrijf je 21-dagen-post met de Mentor (claim-vrij)",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Schrijf je 21-dagen-post als een compleet verhaal dat op zichzelf staat, in jouw stem, volgens de vaste team-opbouw (claimvrije-communicatie). Vijf delen: 1) een scroll-stop opener (er staan er tien klaar, bijvoorbeeld 'Wauw, ik herken mezelf bijna niet meer' of 'Mijn kleding zit losser, mijn hoofd zit rustiger'), 2) hoe het vóór de start was, 3) wat je tijdens de drie weken hebt veranderd, 4) wat het je heeft gebracht, met alle veranderingen die je net hebt geïnventariseerd (gevoel, energie, balans, trots, en hoe meer je er noemt hoe meer mensen zich erin herkennen), en 5) een afsluiting met dankbaarheid. Het verhaal vertelt zichzelf, je hoeft het niet als raadsel te brengen, de reacties en DM's vang je daarna op met je 3-soorten-mensen-script. Claim-vrij: niet 'mijn slaap is genezen' maar 'ik slaap dieper', niet 'door dit product' maar vanuit jouw gevoel en keuzes. Drie iteraties met de Mentor en 'm staat.",
    },
    {
      id: "core-v9-sideflow-21dagen-5-upline-check",
      label: "Upline-check, stuur concept naar sponsor voor akkoord",
      verplicht: true,
      inlineEmbed: "sponsor-melding",
      uitleg:
        "Stuur je concept naar je sponsor voor een korte akkoord, voordat je 'm plaatst. Een tweede paar ogen vangt soms wat jij over het hoofd ziet, vooral op claim-vrije formulering. Wacht op haar akkoord of een dag, en zonder reactie plaats je 'm gewoon. Tik de knop hieronder om je sponsor te bereiken.",
    },
    {
      id: "core-v9-sideflow-21dagen-6-plaatsen",
      label: "Plaats op Facebook + Instagram",
      verplicht: true,
      uitleg:
        "Plaats je 21-dagen-post op Facebook én Instagram. Klaar is klaar, ga niet meer terugkrabbelen of nog een keer bijschaven. Noteer voor jezelf hoe laat je 'm hebt geplaatst, dan kun je over een paar uur zien wie heeft gereageerd. Vanaf nu blijf je in de buurt om binnen het uur op reacties te kunnen reageren.",
    },
    {
      id: "core-v9-sideflow-21dagen-7-dm-script",
      label: "Zet het 3-soorten-mensen-DM-script klaar in je notities",
      verplicht: true,
      uitleg: `Naar IEDEREEN die reageert OF liket stuur je een DM. Drie soorten:

1. VRAGEN WAT JE GEDAAN HEBT → Stuur info + prospect-filmpje. Volg op binnen 24-48u.

2. REAGEERDERS (mooi! / wow! / wat goed! / herkenbaar) → Stuur deze DM:

"${DM_SCRIPT_BLIJ}"

3. LIKERS (alleen een like) → Stuur dezelfde DM als bij reageerders.

Hier past 'ik heb besloten anderen hier ook mee te helpen' wel, want je hebt het zelf inmiddels ervaren.`,
    },
    {
      id: "core-v9-sideflow-21dagen-8-mini-eleva-uitleg",
      label: "Korte uitleg: Mini-ELEVA + 3-weg, zodat je klaarstaat",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Zodra een prospect interesse toont, heb je twee opties: 'm naar Mini-ELEVA sturen (laagdrempelig, ze kunnen zelf kijken en vragen stellen aan de Mentor in jouw stem) of een 3-weg met je sponsor inplannen (persoonlijk gesprek). Welke kies je? Wil iemand graag een gesprek, dan een 3-weg. Wil iemand eerst zelf rondkijken, dan Mini-ELEVA. Twijfel je, begin met Mini-ELEVA, opschalen kan altijd. De Mentor licht beide in een paar minuten met je door, in stap 5 van Core volgt de uitgebreide versie.",
    },
    {
      id: "core-v9-sideflow-21dagen-9-reageer-routine",
      label: "Binnen 1 uur op iedere reactie reageren (Mentor staat klaar)",
      verplicht: true,
      uitleg:
        "Reageer binnen een uur op iedere reactie, ook op een kale like. Elke reactie is een opening naar een gesprek, en hoe sneller je reageert hoe makkelijker het loopt. Het 3-soorten-mensen-DM-script van net heb je klaarstaan, gebruik dat als basis. Bij DM's waar het standaard-script niet helemaal past, vraag je de Mentor om een opener-zin op maat. Snelheid is alles in deze fase.",
    },
    {
      id: "core-v9-sideflow-21dagen-10-prospects-toevoegen",
      label: "Geïnteresseerde prospects toevoegen aan namenlijst + Mini-ELEVA",
      verplicht: true,
      actieRoute: "/namenlijst",
      uitleg:
        "Geïnteresseerde prospects voeg je met één klik vanuit de DM-flow toe aan je namenlijst, zodat ze niet kwijtraken. Voor wie eerst zelf wil rondkijken open je Mini-ELEVA, dat is een persoonlijke omgeving waar de Mentor in jouw stem hun vragen kan beantwoorden. Beide stappen vandaag nog doen voor iedereen die heeft gereageerd, eén klik per persoon, ben je in vijf minuten klaar.",
    },
    {
      id: "core-v9-sideflow-21dagen-11-reflectie",
      label: "Sidestep-opbrengst reflectie",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Korte sidestep-reflectie: hoeveel reacties heb je gehad, hoeveel DM's, hoeveel prospects en eerste klanten? De Mentor noteert het voor latere referentie. Daar heb je 't bij ankerstap 18 (resultaat-post-iteratie) hard nodig, want dan vergelijk je deze post met de tweede iteratie die je gaat maken. Niet vergeten kort op te schrijven, dat scheelt straks veel zoekwerk.",
    },
    {
      id: "core-v9-sideflow-21dagen-12-afronden",
      label: "Afronden of openliggen?",
      verplicht: true,
      uitleg:
        "Twee opties om deze sidestep af te ronden. 'Voltooid' betekent: sidestep sluit, Core schuift door naar ankerstap 2 (top-20 + webshop-pivot). 'Nog mee bezig' betekent: sidestep blijft openliggen, en je krijgt een reminder over een paar dagen om 'm af te ronden. Voel je nog ruimte voor follow-up of verwacht je nog reacties? Hou 'm dan rustig open. Klaar met deze ronde? Voltooid, en door naar het volgende anker.",
    },
  ],

  slotTekst: `Klaar met de 21-dagen-post-flow? Wat een mooi moment 💟

Vanaf hier opent ankerstap 2 (top-20-namenlijst + webshop-pivot). De prospects die je via deze post hebt binnengehaald zitten al in je lijst.

In stap 18 maak je een tweede iteratie van deze post, met een andere invalshoek of aanvullende veranderingen.`,
};

// ============================================================
// REGISTRY
// ============================================================

export const CORE_V9_SIDEFLOWS = {
  "pre-post": PRE_POST_SIDEFLOW,
  "21-dagen-post": VEERTIEN_DAGEN_POST_SIDEFLOW,
} as const;

export type CoreV9SideflowSlug = keyof typeof CORE_V9_SIDEFLOWS;

export function getSideflow(slug: CoreV9SideflowSlug): Sideflow {
  return CORE_V9_SIDEFLOWS[slug];
}
