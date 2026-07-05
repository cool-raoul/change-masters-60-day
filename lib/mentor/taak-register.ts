// ============================================================
// Mentor taak-register, de ENE plek waar per taak vastligt:
// welk model, hoeveel ruimte, en welke bewaking erbij hoort.
//
// Waarom: de oude model-router gokte op basis van vraagtype-
// detectie, waardoor een post-verzoek dat als "algemeen" werd
// herkend op het goedkope model landde. Schrijfwerk dat publiek
// gaat (posts, reels, DM's) verdient ALTIJD het sterke model.
//
// Modellen wisselen (bv. later naar een nieuwer of ander model,
// of per taak naar Claude): alleen dit bestand aanpassen.
// ============================================================

export const MODEL_STERK = process.env.MENTOR_MODEL_STERK || "gpt-4o";
export const MODEL_SNEL = process.env.MENTOR_MODEL_SNEL || "gpt-4o-mini";

export type MentorTaak = {
  /** Sluit aan op de bestaande vraagType-waarden + nieuwe schrijftaken. */
  id: string;
  /** Sterk model of snel model. Schrijfwerk dat publiek gaat = altijd sterk. */
  model: string;
  maxTokens: number;
  /**
   * True = dit is schrijfwerk dat (mogelijk) publiek gaat: de stem-DNA-,
   * claim-vrij- en copywriting-modules MOETEN dan in de prompt.
   */
  schrijfwerk: boolean;
  /**
   * True = de Mentor stelt eerst 2-4 gerichte vragen (interview-eerst)
   * voordat hij schrijft, behalve als de details al bekend zijn uit het
   * profiel of het gesprek.
   */
  interviewEerst: boolean;
};

const TAKEN: Record<string, MentorTaak> = {
  // Publieke schrijftaken: sterk model + interview-eerst + volle bewaking.
  post: { id: "post", model: MODEL_STERK, maxTokens: 1600, schrijfwerk: true, interviewEerst: true },
  reel: { id: "reel", model: MODEL_STERK, maxTokens: 1600, schrijfwerk: true, interviewEerst: true },

  // Eén-op-één schrijftaken: sterk model, interview alleen bij te weinig context.
  dm: { id: "dm", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false },
  opener: { id: "opener", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false },
  drieweg: { id: "drieweg", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false },

  // Zwaar redeneerwerk.
  productadvies: { id: "productadvies", model: MODEL_STERK, maxTokens: 2000, schrijfwerk: false, interviewEerst: false },

  // Gespreks-coaching: snel model volstaat, korte antwoorden zijn hier juist goed.
  bezwaar: { id: "bezwaar", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false },
  followup: { id: "followup", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false },
  closing: { id: "closing", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false },
  motivatie: { id: "motivatie", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false },
  accountability: { id: "accountability", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false },
  social: { id: "social", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false },
  algemeen: { id: "algemeen", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false },
};

/** Onbekende taak → veilig default (snel model, geen schrijf-bewaking). */
export function taakVoor(vraagType: string): MentorTaak {
  return TAKEN[vraagType] ?? TAKEN.algemeen;
}

/**
 * Vangnet naast de vraagtype-detectie: als de gebruiker herkenbaar vraagt om
 * het SCHRIJVEN van een post/reel/caption, behandel het als post-taak, ook
 * al viel de detectie ergens anders op. Vereist schrijf-intentie ("schrijf/
 * maak/help/wil een...") naast het post-woord, zodat "iemand reageerde op
 * mijn post" NIET als schrijfverzoek telt.
 *
 * Geef hier de VOLLEDIGE user-tekst van het gesprek aan mee (alle user-
 * berichten samen): het verzoek valt vaak in het eerste bericht, terwijl de
 * beurten daarna alleen interview-antwoorden zijn.
 */
export function isPostVerzoek(tekst: string): boolean {
  const t = String(tekst).toLowerCase();
  const lanceer = /\b(lanceer|launch|pre[\s-]?post|resultaten?[\s-]?post|21[\s-]?dagen[\s-]?post)\b/;
  if (lanceer.test(t)) return true;
  const schrijfIntent =
    /\b(schrijf|schrijven|maak|maken|opstellen|opzetten|help( me| mij)?|wil (een|graag|mijn)|kun je (een|mijn|iets)|kan je (een|mijn|iets))\b/;
  const postWoord =
    /\b(post(je)?s?|caption|onderschrift|story|stories|reel(s)?|contentweek|week(content|planning|posts)|(iets|bericht) voor (op )?(facebook|instagram|linkedin))\b/;
  return schrijfIntent.test(t) && postWoord.test(t);
}
