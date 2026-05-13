// ============================================================
// lib/dagdoelen.ts
//
// Centrale plek voor de mapping van 'commitment_uren' (2|4|6)
// naar concrete dagdoelen (contacten / uitnodigingen / follow-ups /
// stories per dag).
//
// Waarom een aparte helper?
// 1) Eén bron van waarheid. Eerder konden gebruikers via +/- knoppen
//    losse getallen instellen. Dat leidde tot mensen die alles op 1
//    zetten (waardeloos) of op 20 (niet vol te houden). Nu kiezen ze
//    één van drie tempo's met een filosofie erachter, en wij leiden
//    de getallen daaruit af.
// 2) Mapping kan later geupdate zonder DB-migratie. We slaan alleen
//    'commitment_uren' op; de daadwerkelijke getallen worden bij
//    elke render uit deze helper gehaald.
// 3) De ELEVA Mentor en het dashboard delen dezelfde definitie.
//
// Filosofie achter de tempo's (zie ook onboarding-stap-5):
// - 2u "Fundament"  - drukke baan/gezin, consistency over volume
// - 4u "Bouwen"     - serieus ritme, eerste resultaten in week 2-3
// - 6u "Doorbreken" - geen ander werk, full sprint + team-coaching
// ============================================================

export type CommitmentUren = 2 | 4 | 6;

export type Dagdoelen = {
  contacten: number;
  uitnodigingen: number;
  followups: number;
  stories: number;
};

/**
 * Stevige default voor gebruikers die nog niets gekozen hebben.
 * "Bouwen" is de gulden middenweg: niet zo licht dat het niets doet,
 * niet zo zwaar dat het mensen afschrikt voordat ze de keuze gemaakt
 * hebben.
 */
export const STANDAARD_COMMITMENT: CommitmentUren = 4;

/**
 * Bereken de dagdoelen die horen bij een commitment-niveau.
 *
 * @param uren  Het gekozen tempo (2, 4 of 6 uur per dag).
 * @returns Object met aantallen per categorie.
 */
export function berekenDagdoelen(uren: CommitmentUren): Dagdoelen {
  // Tabel-vorm zodat de mapping in één oogopslag te lezen is.
  // Aanpassen? Doe het hier en NERGENS anders.
  const tabel: Record<CommitmentUren, Dagdoelen> = {
    2: { contacten: 5, uitnodigingen: 2, followups: 3, stories: 1 },
    4: { contacten: 10, uitnodigingen: 4, followups: 6, stories: 3 },
    6: { contacten: 15, uitnodigingen: 6, followups: 10, stories: 3 },
  };
  return tabel[uren];
}

/**
 * Display-naam voor een tempo. Gebruikt in UI én in Mentor-prompts.
 */
export function tempoNaam(uren: CommitmentUren): string {
  return { 2: "Fundament", 4: "Bouwen", 6: "Doorbreken" }[uren];
}

/**
 * Helper: parsing van een onbetrouwbare waarde (user_metadata is any).
 * Valt terug op STANDAARD_COMMITMENT als de waarde niet 2/4/6 is.
 */
export function leesCommitmentUren(waarde: unknown): CommitmentUren {
  const n = Number(waarde);
  if (n === 2 || n === 4 || n === 6) return n;
  return STANDAARD_COMMITMENT;
}

/**
 * Beschrijving van wat je per dag concreet doet, per tempo. Wordt getoond
 * in de tempo-keuze-card en (later) op het dashboard zodat mensen begrijpen
 * wat hun dag inhoudt.
 *
 * BEWUSTE KEUZE: GEEN minuten in deze fase van het gebruik. Reden: in de
 * eerste 60 dagen werken mensen op gewoonte en actie, niet op tijdsblokken.
 * "Ik moet 30 min gesprekken voeren" verlamt. "Ik ga 5 echte gesprekken
 * voeren" zet aan. Korte stukjes door de dag heen werkt beter dan één
 * grote sessie. We bouwen ritme via consistente acties, niet via een
 * strakke kalender.
 */
export type Bouwblok = {
  emoji: string;
  naam: string;
  beschrijving: string;
};

export function bouwblokkenVoorTempo(uren: CommitmentUren): Bouwblok[] {
  if (uren === 2) {
    return [
      {
        emoji: "🗂️",
        naam: "Je namenlijst bijhouden",
        beschrijving:
          "Even kijken wie er waar staat (denkt nog na, zegt nee, zegt ja). Korte notities maken van gesprekken die je had.",
      },
      {
        emoji: "💬",
        naam: "5 echte gesprekken voeren",
        beschrijving:
          "Op WhatsApp, Instagram of telefoon. 1-op-1, geen kant-en-klaar bericht naar meerdere mensen. Mix van warme mensen even bijspreken en oudere contacten weer warm maken.",
      },
      {
        emoji: "📨",
        naam: "2 mensen uitnodigen",
        beschrijving:
          "Mensen die je al goed kent en waarvan je weet wat ze belangrijk vinden. Daar mag je direct uitnodigen, geen lange aanloop nodig.",
      },
      {
        emoji: "🔄",
        naam: "3 mensen opvolgen",
        beschrijving:
          "Mensen waar je al iets mee besproken had. Even terugkomen op het gesprek, niet pusherig.",
      },
      {
        emoji: "📱",
        naam: "1 story + reageren op anderen",
        beschrijving:
          "Een momentje uit je leven (geen verkoop). Plus 2 echte reacties geven op stories van anderen, zo blijf je in beeld zonder te spammen.",
      },
    ];
  }
  if (uren === 4) {
    return [
      {
        emoji: "🗂️",
        naam: "Je namenlijst bijhouden",
        beschrijving:
          "Wie staat waar in je lijst, plus elke dag een paar nieuwe namen toevoegen (familie, oude collega's, mensen uit je sport, buren).",
      },
      {
        emoji: "💬",
        naam: "10 echte gesprekken voeren",
        beschrijving:
          "Mix van drie soorten: warme bekenden snel bijpraten, oudere contacten weer warm maken, en nieuwe mensen via socials terug-leren-kennen. Altijd 1-op-1.",
      },
      {
        emoji: "📨",
        naam: "4 mensen uitnodigen",
        beschrijving:
          "Vooral mensen waarvan je hun behoefte al kent. Die hoeven niet warm gemaakt, daar kom je gewoon eerlijk binnen.",
      },
      {
        emoji: "🔄",
        naam: "6 mensen opvolgen",
        beschrijving:
          "De meeste mensen zeggen niet bij het eerste contact ja. Goed opvolgen op het juiste moment is het echte verschil.",
      },
      {
        emoji: "📱",
        naam: "3 stories + reageren op anderen",
        beschrijving:
          "Drie momenten uit je dag delen (leven, niet verkoop). Plus echte reacties geven op stories van anderen. Zo bouw je zichtbaarheid zonder iets te pushen.",
      },
      {
        emoji: "👥",
        naam: "Gesprek met je sponsor erbij",
        beschrijving:
          "Niet elke dag, gemiddeld 3 keer per week: een gesprek met een prospect waarbij je sponsor of een ervaren teamlid meeluistert (3-weg). Daar leer je het snelst.",
      },
      {
        emoji: "🌱",
        naam: "Even bijspijkeren",
        beschrijving:
          "Een paar pagina's lezen of een audio luisteren onderweg. Hoeft niet lang, gewoon dagelijks even.",
      },
    ];
  }
  // uren === 6
  return [
    {
      emoji: "🗂️",
      naam: "Je namenlijst grondig bijhouden",
      beschrijving:
        "Lijst-werk, plus elke dag nieuwe namen toevoegen, plus diepere notities maken (wat zei iemand, wat is hun behoefte).",
    },
    {
      emoji: "💬",
      naam: "15+ echte gesprekken voeren",
      beschrijving:
        "Drie lagen tegelijk: warme bekenden snel bijpraten, oudere contacten weer warm maken, nieuwe contacten via socials/comments leren kennen. Altijd persoonlijk.",
    },
    {
      emoji: "📨",
      naam: "6 mensen uitnodigen",
      beschrijving:
        "Warme mensen met bekende behoefte: direct erop. Iets onzekerder: eerst kort script oefenen of even sponsor inschakelen.",
    },
    {
      emoji: "🔄",
      naam: "8-10 mensen opvolgen",
      beschrijving:
        "Strakke opvolg-discipline. Niet pusherig, wel betrouwbaar, op het beloofde moment terugkomen.",
    },
    {
      emoji: "📱",
      naam: "Content + reageren op anderen",
      beschrijving:
        "Eén iets langere video of post per week, daarnaast dagelijks 3 stories en echte reacties op stories van anderen.",
    },
    {
      emoji: "👥",
      naam: "Gesprekken samen met sponsor (vaker)",
      beschrijving:
        "Gemiddeld 1 per dag een gesprek met sponsor erbij, soms meer als het loopt.",
    },
    {
      emoji: "🧑‍🤝‍🧑",
      naam: "Je eerste partners helpen",
      beschrijving:
        "Zodra je eerste mensen in je team komen: even per dag bij ze checken, vraag beantwoorden, helpen. Sponsor-call voor jezelf erbij.",
    },
    {
      emoji: "🌱",
      naam: "Even bijspijkeren",
      beschrijving:
        "Dagelijks iets lezen of luisteren. Bij dit tempo merk je dat dit het verschil maakt.",
    },
  ];
}
