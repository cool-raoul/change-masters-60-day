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
 * Beschrijving van wat er IN een uur zit, per tempo. Wordt getoond
 * in de tempo-keuze-card en op het dashboard zodat mensen begrijpen
 * waar hun tijd in gaat zitten.
 *
 * Doseringen gebaseerd op een synthese van Eric Worre (Go Pro 7 Skills)
 * en Frazer Brookes (social media zonder spam), aangepast voor de
 * Lifeplus-context.
 */
export type Bouwblok = {
  emoji: string;
  naam: string;
  duur: string;
  beschrijving: string;
};

export function bouwblokkenVoorTempo(uren: CommitmentUren): Bouwblok[] {
  if (uren === 2) {
    return [
      {
        emoji: "🗂️",
        naam: "Pipeline & lijst-check",
        duur: "15 min",
        beschrijving:
          "Wie zit waar in je pipeline, korte notities na gesprekken",
      },
      {
        emoji: "💬",
        naam: "5 echte DM-conversaties",
        duur: "30 min",
        beschrijving:
          "Mix: koudere contacten opwarmen + warme mensen even bij hervatten. 1-op-1, doorvragen, geen broadcasts",
      },
      {
        emoji: "📨",
        naam: "2 directe uitnodigingen",
        duur: "30 min",
        beschrijving:
          "Bij voorkeur warme bekenden waarvan je de WHY al kent. Die hoeven niet eerst opgewarmd, die kun je direct uitnodigen",
      },
      {
        emoji: "🔄",
        naam: "3 follow-ups",
        duur: "30 min",
        beschrijving: "Mensen waar je al een gesprek mee had",
      },
      {
        emoji: "📱",
        naam: "1 story + engagement",
        duur: "15 min",
        beschrijving: "Lifestyle, geen verkoop. Plus 2 echte reacties op anderen",
      },
    ];
  }
  if (uren === 4) {
    return [
      {
        emoji: "🗂️",
        naam: "Pipeline & lijst-check",
        duur: "20 min",
        beschrijving: "Pipeline bijwerken + 3-5 nieuwe namen toevoegen",
      },
      {
        emoji: "💬",
        naam: "10 DM-conversaties",
        duur: "45 min",
        beschrijving:
          "Gelaagd: warme mensen die je al kent (kort, doelgericht), koudere contacten opwarmen, nieuwe verbindingen leggen",
      },
      {
        emoji: "📨",
        naam: "4 directe uitnodigingen",
        duur: "45 min",
        beschrijving:
          "Vooral mensen waarvan je de WHY al kent. Die hoeven niet warm gemaakt, daar mag je direct binnenkomen met de Honest Conversation",
      },
      {
        emoji: "🔄",
        naam: "6 follow-ups",
        duur: "45 min",
        beschrijving: "Timing > frequentie, juiste moment kiezen",
      },
      {
        emoji: "📱",
        naam: "3-3-3 social",
        duur: "30 min",
        beschrijving: "3 stories + 3 echte engagements + 3 DM-vervolgen",
      },
      {
        emoji: "👥",
        naam: "Presentatie/3-weg (3× per week)",
        duur: "30 min gem.",
        beschrijving: "Niet elke dag, maar gemiddeld 3 per week",
      },
      {
        emoji: "🌱",
        naam: "Persoonlijke groei",
        duur: "15 min",
        beschrijving: "Audio (Worre/Brookes) of 5 pagina's lezen",
      },
    ];
  }
  // uren === 6
  return [
    {
      emoji: "🗂️",
      naam: "Pipeline & lijst-werk",
      duur: "30 min",
      beschrijving: "Pipeline + 5+ nieuwe namen + dieper notities",
    },
    {
      emoji: "💬",
      naam: "15+ DM-conversaties",
      duur: "90 min",
      beschrijving:
        "Drie lagen: warme bekenden snel bij praten, koudere terug-verbinden, nieuwe contacten opwarmen via stories/comments",
    },
    {
      emoji: "📨",
      naam: "6 directe uitnodigingen",
      duur: "60 min",
      beschrijving:
        "Warme mensen waar je hun WHY al kent: direct erop. Script-oefenen + sponsor-edificatie voor de moeilijkere",
    },
    {
      emoji: "🔄",
      naam: "8-10 follow-ups",
      duur: "30 min",
      beschrijving: "Strakke opvolg-discipline",
    },
    {
      emoji: "📱",
      naam: "Content + 3-3-3",
      duur: "60 min",
      beschrijving: "1 reel + 3 stories + engagement-block",
    },
    {
      emoji: "👥",
      naam: "Presentaties / 3-weg (5× per week)",
      duur: "60 min gem.",
      beschrijving: "Gemiddeld 1 per dag, vaak meer",
    },
    {
      emoji: "🧑‍🤝‍🧑",
      naam: "Team & coaching",
      duur: "60 min",
      beschrijving: "Sponsor-call + 1-2 partners helpen",
    },
    {
      emoji: "🌱",
      naam: "Persoonlijke groei",
      duur: "30 min",
      beschrijving: "Audio + reading + skill-werk",
    },
  ];
}
