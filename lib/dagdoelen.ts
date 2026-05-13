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
  // De flow van een member is:
  //   1) Contacten toevoegen aan je namenlijst
  //   2) In gesprek met mensen, gesprekken vervolgen
  //   3) Mensen uitnodigen voor een presentatie of one-pager
  //   4) NA die presentatie: opvolgen met een 3-weg-gesprek
  //   5) Daarnaast: stories delen (geen verkoop), reageren op anderen
  //   6) Mini-ELEVA inzetten als de prospect eerst zelf info wil
  //   7) Persoonlijke ontwikkeling (mindset + skills)
  // Die zeven blokken komen in alle drie de tempo's terug, alleen de
  // doseringen verschillen.
  if (uren === 2) {
    return [
      {
        emoji: "🗂️",
        naam: "Je namenlijst bijhouden",
        beschrijving:
          "Even kijken wie er waar staat (denkt nog na, zegt nee, zegt ja). Korte notities maken na gesprekken.",
      },
      {
        emoji: "💬",
        naam: "5 contacten leggen of vervolgen",
        beschrijving:
          "Op WhatsApp, Instagram of telefoon. 1-op-1, geen kant-en-klaar bericht naar meerdere mensen. Mix van warme mensen even bijpraten en oudere contacten weer warm maken.",
      },
      {
        emoji: "📨",
        naam: "2 mensen uitnodigen voor een presentatie",
        beschrijving:
          "Mensen die je al goed kent en waarvan je weet wat ze belangrijk vinden. Daar mag je direct uitnodigen voor een one-pager-moment of presentatie, geen lange aanloop nodig.",
      },
      {
        emoji: "🔄",
        naam: "3 mensen opvolgen (3-weg)",
        beschrijving:
          "Mensen die al een presentatie of one-pager hebben gezien. Volg ze op met een 3-weg-gesprek samen met je sponsor of ervaren teamlid. Niet pusherig, wel op het juiste moment terugkomen.",
      },
      {
        emoji: "📱",
        naam: "Stories + reageren op anderen",
        beschrijving:
          "1 tot 3 momenten uit je dag delen (van je leven, nog niet proberen te verkopen in je stories). Plus een paar echte reacties geven op stories van anderen, zo blijf je in beeld zonder te spammen.",
      },
      {
        emoji: "🤖",
        naam: "Mini-ELEVA inzetten",
        beschrijving:
          "Voor wie nog niet klaar is voor een direct gesprek: een Mini-ELEVA-link naar ze sturen, dan helpt ELEVA met wat het beste past per persoon. Lage drempel, zonder pushen.",
      },
      {
        emoji: "🌱",
        naam: "Even leren of luisteren",
        beschrijving:
          "Persoonlijke ontwikkeling, ook in 2 uur per dag belangrijk. Een paar pagina's lezen of een audio onderweg. Mindset en skills groeien mee.",
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
        naam: "10 contacten leggen of vervolgen",
        beschrijving:
          "Mix van drie soorten: warme bekenden snel bijpraten, oudere contacten weer warm maken, en nieuwe mensen via socials terug-leren-kennen. Altijd 1-op-1, het gesprek vervolgen waar je vorige keer was gebleven.",
      },
      {
        emoji: "📨",
        naam: "4 mensen uitnodigen voor een presentatie",
        beschrijving:
          "Voor een one-pager-moment of een echte presentatie. Vooral mensen waarvan je de behoefte al kent. Die hoeven niet warm gemaakt, daar kom je gewoon eerlijk binnen.",
      },
      {
        emoji: "🔄",
        naam: "6 mensen opvolgen (3-weg)",
        beschrijving:
          "Na een presentatie of one-pager: opvolgen met een 3-weg-gesprek (jij + prospect + sponsor of ervaren teamlid). De meeste mensen zeggen niet bij het eerste moment ja, dit opvolg-stuk is het echte verschil.",
      },
      {
        emoji: "📱",
        naam: "Stories + reageren op anderen",
        beschrijving:
          "1 tot 3 momenten uit je dag delen (van je leven, nog niet proberen te verkopen in je stories). Plus echte reacties geven op stories van anderen. Zo bouw je zichtbaarheid zonder iets te pushen.",
      },
      {
        emoji: "🤖",
        naam: "Mini-ELEVA inzetten",
        beschrijving:
          "Voor mensen die zelf eerst willen rondkijken: Mini-ELEVA-link sturen, dan helpt ELEVA met wat het beste past per persoon. Werkt als een professionele tussenstap voor het echte gesprek.",
      },
      {
        emoji: "🌱",
        naam: "Even leren of luisteren",
        beschrijving:
          "Persoonlijke ontwikkeling. Een paar pagina's lezen of een audio onderweg. Hoeft niet lang, gewoon dagelijks even iets dat je sterker maakt als persoon en als bouwer.",
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
      naam: "15+ contacten leggen of vervolgen",
      beschrijving:
        "Drie lagen tegelijk: warme bekenden snel bijpraten, oudere contacten weer warm maken, nieuwe contacten via socials of comments leren kennen. Altijd persoonlijk en doorbouwend op vorige gesprekken.",
    },
    {
      emoji: "📨",
      naam: "6 mensen uitnodigen voor een presentatie",
      beschrijving:
        "Voor een one-pager-moment, presentatie of webinar. Warme mensen met bekende behoefte: direct erop. Iets onzekerder: eerst even sponsor inschakelen.",
    },
    {
      emoji: "🔄",
      naam: "8 tot 10 mensen opvolgen (3-weg)",
      beschrijving:
        "Strakke opvolg-discipline na presentaties. 3-weg-gesprekken met je sponsor of ervaren teamlid, op het beloofde moment terugkomen. Niet pusherig, wel betrouwbaar.",
    },
    {
      emoji: "📱",
      naam: "Stories + reageren op anderen",
      beschrijving:
        "1 tot 3 momenten uit je dag delen (van je leven, nog niet proberen te verkopen in je stories). Bij dit tempo daarnaast 1 iets langere post of video per week en dagelijks echte reacties op stories van anderen.",
    },
    {
      emoji: "🤖",
      naam: "Mini-ELEVA inzetten",
      beschrijving:
        "Voor mensen die zelf eerst informatie willen of waarbij een direct gesprek nog te vroeg is: Mini-ELEVA-link sturen, dan helpt ELEVA met wat het beste past per persoon. Schaalbaar zonder dat je elke vraag zelf hoeft te beantwoorden.",
    },
    {
      emoji: "🧑‍🤝‍🧑",
      naam: "Je eerste partners helpen",
      beschrijving:
        "Zodra je eerste mensen in je team komen: dagelijks bij ze checken, vragen beantwoorden, mee in gesprek. Sponsor-call voor jezelf hoort hier ook bij.",
    },
    {
      emoji: "🌱",
      naam: "Even leren of luisteren",
      beschrijving:
        "Persoonlijke ontwikkeling. Bij dit tempo merk je dat dit het verschil maakt: dagelijks iets lezen of luisteren dat je mindset en skills voedt.",
    },
  ];
}
