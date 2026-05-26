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

> "Vandaag begin ik aan iets dat ik al een tijd uitstel. Ik ben benieuwd wat ik over 21 dagen ga merken. Spannend!"

> "Ik geef mezelf de komende 21 dagen om iets nieuws te proberen. Ik weet niet helemaal hoe het gaat lopen, maar ik wil het wel een eerlijke kans geven."

> "Drie weken vanaf nu. Eén ding waar ik nieuwsgierig naar ben. Doe me even na en je hoort het resultaat 😉"

Geen claim, geen belofte, wel een opening die mensen aan het denken zet. De Mentor helpt je om een versie te schrijven die past bij JOUW stem.

Niet alleen. Bouwen mag leuk zijn 💟`,

  substeps: [
    {
      id: "core-v9-sideflow-prepost-1-uitleg",
      label: "Mini-uitleg: wat is een pre-post en wat doet 'ie?",
      verplicht: true,
      uitleg:
        "Korte uitleg in het systeem (~2 min, met filmpje). PDF 'Voorbereiding Pre Post Lancering' staat als download. (TODO: media)",
    },
    {
      id: "core-v9-sideflow-prepost-2-filmpjes-zelf",
      label: "Bekijk zelf de prospect-filmpjes die je later wilt versturen",
      verplicht: true,
      uitleg:
        "Zodat je weet wat erin zit als iemand vraagt 'wat ga je doen?' en je 'm wil versturen. (TODO: media-links)",
    },
    {
      id: "core-v9-sideflow-prepost-3-copywriting",
      label: "Schrijf je pre-post met de Mentor (uitlokking: 'wat ga je doen?')",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "2-3 regels, jouw stem, voornemen delen. Doel: mensen laten vragen wat je gaat doen. Mentor levert 3 versies, jij kiest of mengt.",
    },
    {
      id: "core-v9-sideflow-prepost-4-upline-check",
      label: "Upline-check, stuur concept naar sponsor voor akkoord",
      verplicht: true,
      inlineEmbed: "sponsor-melding",
      uitleg: "Wacht op akkoord voor je plaatst.",
    },
    {
      id: "core-v9-sideflow-prepost-5-plaatsen",
      label: "Plaats op Facebook én Instagram",
      verplicht: true,
      uitleg: "Klaar is klaar. Tijd noteren voor follow-up-timer.",
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
        "Zodra een prospect interesse toont: kun je 'm naar Mini-ELEVA sturen (laagdrempelig) of een 3-weg met je sponsor inplannen. Mentor licht beide kort toe. Dit komt later uitgebreider in stap 5.",
    },
    {
      id: "core-v9-sideflow-prepost-8-reageer-routine",
      label: "Binnen 1 uur op iedere reactie reageren (Mentor staat klaar)",
      verplicht: true,
      uitleg:
        "Snelheid is alles. Mentor helpt met opener-zinnen bij DM's waar de gewone tekst niet past.",
    },
    {
      id: "core-v9-sideflow-prepost-9-prospects-toevoegen",
      label: "Geïnteresseerde prospects toevoegen aan je namenlijst + (optioneel) Mini-ELEVA",
      verplicht: true,
      actieRoute: "/namenlijst",
      uitleg:
        "Eén klik vanuit DM-flow voegt 'm toe als prospect. Mini-ELEVA opent een persoonlijke omgeving voor hen.",
    },
    {
      id: "core-v9-sideflow-prepost-10-reflectie",
      label: "Sidestep-opbrengst reflectie + 21-dagen-trigger instellen",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Hoeveel reacties, hoeveel DM's, hoeveel prospects. Plus: instellen wanneer je 21-dagen-resultaat-post-trigger wil ontvangen (default 21 dagen).",
    },
    {
      id: "core-v9-sideflow-prepost-11-afronden",
      label: "Afronden of openliggen?",
      verplicht: true,
      uitleg:
        "'Voltooid' = sidestep sluit, Core schuift door naar stap 2. 'Nog mee bezig' = sidestep blijft openliggen, reminder over X dagen.",
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

In V7 stond hier "kies één of twee belangrijke veranderingen". In V9 doen we het anders: noem ALLE positieve veranderingen die je hebt gemerkt, claim-vrij geformuleerd. Reden: verschillende mensen worden door verschillende dingen geraakt. Iemand met slaapproblemen leest "ik slaap dieper". Iemand met laag-energie leest "ik heb meer pit". Iemand met overgewicht leest "ik voel me lichter".

Door meerdere veranderingen te noemen trigger je meerdere doelgroepen, en lokt je de vraag uit: "Wat is dat dan?" of "Wat heb je gedaan?".

CLAIM-VRIJ FORMULEREN

Niet wat het PRODUCT doet, wel wat JIJ hebt gemerkt. Geen "dit pakt slaap aan" maar "ik slaap dieper". Geen "ondersteunt je energie" maar "ik heb meer energie".

Voorbeeld-richting:

> "21 dagen geleden begon ik aan iets. Vandaag merk ik: ik slaap dieper, ik heb meer pit overdag, ik voel me lichter, mijn vel ziet er rustiger uit, en ik ben minder snel chagrijnig in de avond. Wat heb ik precies gedaan? Reageer en ik vertel het je 💛"

Vijf veranderingen genoemd, geen claim, eind met een uitnodiging om te reageren. De Mentor helpt je dit in JOUW stem te schrijven, met de veranderingen die JIJ specifiek hebt gemerkt.

Niet alleen. Bouwen mag leuk zijn 💟`,

  substeps: [
    {
      id: "core-v9-sideflow-21dagen-1-uitleg",
      label: "Mini-uitleg: wat is een 21-dagen-resultaat-post?",
      verplicht: true,
      uitleg:
        "Korte uitleg in het systeem (~2 min, met filmpje). PDF 'Voorbereiding 21 Dagen Post' staat als download. (TODO: media)",
    },
    {
      id: "core-v9-sideflow-21dagen-2-filmpjes-zelf",
      label: "Bekijk zelf de prospect-filmpjes die je gaat versturen aan info-vragers",
      verplicht: true,
      uitleg:
        "Zodat je weet wat erin zit. Dezelfde filmpjes gebruik je later in pre-post, 21-dagen-post en algemeen prospect-werk. (TODO: media-links)",
    },
    {
      id: "core-v9-sideflow-21dagen-3-veranderingen-inventariseren",
      label: "Inventariseer met de Mentor ALLE positieve veranderingen die je hebt gemerkt",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Niet 1 of 2, maar ALLE. Slaap, energie, vel, stemming, lichaam, focus, opladen, verteren, alles waar je iets in voelt schuiven. Mentor stelt vragen, jij vertelt.",
    },
    {
      id: "core-v9-sideflow-21dagen-4-tekst-schrijven",
      label: "Schrijf je 21-dagen-post met de Mentor (claim-vrij)",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Alle veranderingen erin, jouw stem, webshop-anker. Doel: 'wat heb je gedaan?' uitlokken. Drie iteraties max.",
    },
    {
      id: "core-v9-sideflow-21dagen-5-upline-check",
      label: "Upline-check, stuur concept naar sponsor voor akkoord",
      verplicht: true,
      inlineEmbed: "sponsor-melding",
    },
    {
      id: "core-v9-sideflow-21dagen-6-plaatsen",
      label: "Plaats op Facebook + Instagram",
      verplicht: true,
      uitleg: "Klaar is klaar.",
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
        "Zodra een prospect interesse toont: kun je 'm naar Mini-ELEVA sturen (laagdrempelig) of een 3-weg met je sponsor inplannen. Mentor licht beide kort toe. Verdieping volgt in stap 5.",
    },
    {
      id: "core-v9-sideflow-21dagen-9-reageer-routine",
      label: "Binnen 1 uur op iedere reactie reageren (Mentor staat klaar)",
      verplicht: true,
    },
    {
      id: "core-v9-sideflow-21dagen-10-prospects-toevoegen",
      label: "Geïnteresseerde prospects toevoegen aan namenlijst + Mini-ELEVA",
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "core-v9-sideflow-21dagen-11-reflectie",
      label: "Sidestep-opbrengst reflectie",
      verplicht: true,
      actieRoute: "/coach",
      uitleg:
        "Reacties, DM's, prospects, klanten. Mentor noteert voor latere referentie + om vergelijking te maken bij stap 18 (resultaat-post-iteratie).",
    },
    {
      id: "core-v9-sideflow-21dagen-12-afronden",
      label: "Afronden of openliggen?",
      verplicht: true,
      uitleg:
        "'Voltooid' = sidestep sluit, Core schuift door naar stap 2. 'Nog mee bezig' = sidestep blijft openliggen.",
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
