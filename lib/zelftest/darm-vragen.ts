// ============================================================
// DARMVRAGENLIJST — vervolgvragenlijst om te bepalen of een
// darmprogramma (Darmen in Balans basis vs plus) bij de prospect past.
//
// FLOW:
//   1. Prospect zit op resultaatpagina van de hoofdvragenlijst
//   2. In het zachte darm-blok: "wil je weten of een darmprogramma iets
//      voor jou is? Doe deze korte vervolgvragenlijst (3 minuten)."
//   3. /test/[token]/darm-keuze laadt deze 15 vragen
//   4. Prospect beoordeelt elke vraag op een 4-puntsschaal:
//        Niet (0) / Soms (1) / Regelmatig (2) / Vaak (3)
//   5. Server berekent totaal-score en bucket
//   6. Resultaat: bucket + (indien basis/plus) advies-pakket
//
// CLAIM-VEILIG:
// Vragen vermijden ziekte-namen of medische claims. We vragen alleen
// naar dagelijkse signalen die mensen zelf herkennen ("ik val 's middags
// stil", "mijn huid reageert op stress"). Geen "leaky gut", "ADHD",
// "astma" etc.
//
// PRIVACY:
// Individuele antwoorden worden niet opgeslagen — alleen totaal + bucket.
// ============================================================

export type DarmAntwoord = 0 | 1 | 2 | 3;

export type DarmBucket = "geen" | "basis" | "plus";

export const DARM_SCHAAL_LABELS = {
  0: "Niet",
  1: "Soms",
  2: "Regelmatig",
  3: "Vaak",
} as const;

export interface DarmVraag {
  id: string;
  tekst: string;
}

// 15 vragen over signalen die vaak met darm-/spijsverterings-balans
// samenhangen. Bewust gegroepeerd in drie thema's, maar in de UI tonen
// we ze gemixt (geen kopjes — voorkomt dat mensen op het thema mikken).
export const DARM_VRAGEN: DarmVraag[] = [
  // Spijsvertering & buikgevoel
  { id: "v1", tekst: "Na een maaltijd voel ik me opgeblazen of zwaar." },
  { id: "v2", tekst: "Mijn stoelgang is wisselend of moeilijk regelmatig te krijgen." },
  { id: "v3", tekst: "Ik heb last van gas of een onrustig gevoel in mijn buik." },
  { id: "v4", tekst: "Bepaalde voedingsmiddelen verdraag ik minder goed dan vroeger." },
  { id: "v5", tekst: "Ik heb na het eten regelmatig krampjes of een drukkend gevoel." },

  // Energie & focus
  { id: "v6", tekst: "Ik val 's middags compleet stil, ook na een goede nachtrust." },
  { id: "v7", tekst: "Ik voel me na het eten eerder vermoeider dan energieker." },
  { id: "v8", tekst: "Mijn concentratie zakt sneller dan ik prettig vind." },
  { id: "v9", tekst: "Ik word 's nachts wakker tussen 2 en 4 uur en kom moeilijk weer in slaap." },
  { id: "v10", tekst: "Mijn ochtenden komen moeilijk op gang, ook met voldoende slaap." },

  // Huid, weerstand & stemming
  { id: "v11", tekst: "Mijn huid reageert sterk op stress, voeding of seizoenswisseling." },
  { id: "v12", tekst: "Ik ben sneller verkouden of doe er langer over om te herstellen." },
  { id: "v13", tekst: "Ik heb dagelijkse kleine ongemakken die ik niet goed kan plaatsen." },
  { id: "v14", tekst: "Ik heb meer trek in suiker, brood of snelle koolhydraten dan ik wil." },
  { id: "v15", tekst: "Mijn humeur of stemming wisselt sterker dan ik prettig vind." },
];

export const DARM_MAX_SCORE = DARM_VRAGEN.length * 3; // 45

// ============================================================
// Drempels voor de bucket-bepaling
//
// Bewust ruim genomen zodat mensen die echt iets voelen ook in een
// bucket terechtkomen, terwijl wie nauwelijks iets ervaart in "geen"
// blijft. Aangepast op basis van 15 vragen × 0-3 (max 45).
//
// 0-10  → geen — er zijn weinig signalen die op darm-onbalans wijzen
// 11-22 → basis — Darmen in Balans (16 dagen, lichte opfrissing)
// 23+   → plus — Darmen in Balans + (uitgebreider, langere reset)
// ============================================================

export const DARM_DREMPEL_BASIS = 11;
export const DARM_DREMPEL_PLUS = 23;

export interface DarmUitslag {
  totaal: number;
  max: number;
  bucket: DarmBucket;
  advies_pakket_key: string | null;
  bucket_label: string;
  korte_tekst: string;
}

/**
 * Berekent de bucket op basis van een dictionary van id → antwoord.
 * Antwoorden hoeven niet compleet te zijn — ontbrekende vragen tellen
 * als 0 (Niet). Onbekende antwoord-waardes worden gefilterd.
 */
export function berekenDarmUitslag(
  antwoorden: Record<string, number>,
): DarmUitslag {
  let totaal = 0;
  for (const vraag of DARM_VRAGEN) {
    const a = antwoorden[vraag.id];
    if (a === 0 || a === 1 || a === 2 || a === 3) {
      totaal += a;
    }
  }

  let bucket: DarmBucket;
  let advies_pakket_key: string | null;
  let bucket_label: string;
  let korte_tekst: string;

  if (totaal >= DARM_DREMPEL_PLUS) {
    bucket = "plus";
    advies_pakket_key = "reset-darmen-plus";
    bucket_label = "Darmen in Balans +";
    korte_tekst =
      "Je geeft duidelijk meerdere signalen aan die met darm-onbalans samenhangen. " +
      "Een uitgebreider darmprogramma (Darmen in Balans +) is voor jou waarschijnlijk " +
      "een goede keuze om eerst stevig op te ruimen voordat je met een pakket start.";
  } else if (totaal >= DARM_DREMPEL_BASIS) {
    bucket = "basis";
    advies_pakket_key = "reset-darmen-basis";
    bucket_label = "Darmen in Balans (basis)";
    korte_tekst =
      "Je herkent een aantal signalen die met spijsvertering en darm-balans samenhangen. " +
      "Een 16-daags basis-programma (Darmen in Balans) kan een fijne opfrissing zijn " +
      "voordat je met een pakket start of verder gaat met je dagelijkse aanpak.";
  } else {
    bucket = "geen";
    advies_pakket_key = null;
    bucket_label = "Geen darmprogramma nodig op dit moment";
    korte_tekst =
      "Op basis van je antwoorden lijkt een darmprogramma op dit moment niet direct nodig. " +
      "Je kunt prima starten met het pakket-advies. Mocht je later signalen merken, dan kun " +
      "je deze vragenlijst altijd opnieuw doen.";
  }

  return {
    totaal,
    max: DARM_MAX_SCORE,
    bucket,
    advies_pakket_key,
    bucket_label,
    korte_tekst,
  };
}
