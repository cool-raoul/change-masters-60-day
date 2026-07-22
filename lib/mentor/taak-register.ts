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
  /**
   * Eén-zins-beschrijving voor de receptionist-router (de kleine LLM die
   * elke vraag naar een taak stuurt). Geen beschrijving = de router kan
   * deze taak niet kiezen (bv. kennismaking en post: die hebben hun eigen
   * detectie-vangnet). Nieuwe specialist toevoegen = hier één regel.
   */
  routerBeschrijving?: string;
};

const TAKEN: Record<string, MentorTaak> = {
  // Publieke schrijftaken: sterk model + interview-eerst + volle bewaking.
  // post heeft bewust GEEN routerBeschrijving: het post-vangnet
  // (isPostVerzoek) beslist dat gesprek-breed, betrouwbaarder dan de router.
  post: { id: "post", model: MODEL_STERK, maxTokens: 1600, schrijfwerk: true, interviewEerst: true },
  reel: { id: "reel", model: MODEL_STERK, maxTokens: 1600, schrijfwerk: true, interviewEerst: true,
    routerBeschrijving: "het lid wil een reel, kort filmpje of video-script maken voor social media" },

  // Eén-op-één schrijftaken: sterk model, interview alleen bij te weinig context.
  dm: { id: "dm", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false,
    routerBeschrijving: "het lid wil een persoonlijk bericht (DM, WhatsApp, uitnodiging) schrijven of versturen aan één specifieke persoon" },
  opener: { id: "opener", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false,
    routerBeschrijving: "het lid wil een gesprek beginnen of warm openen met iemand en zoekt een eerste bericht of openingszin" },
  drieweg: { id: "drieweg", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false,
    routerBeschrijving: "het lid wil een 3-weg gesprek of groepje opzetten waarin de sponsor wordt geintroduceerd (edification, aankondiging, introductie)" },

  // Zwaar redeneerwerk.
  productadvies: { id: "productadvies", model: MODEL_STERK, maxTokens: 2000, schrijfwerk: false, interviewEerst: false,
    routerBeschrijving: "de vraag gaat (ook maar deels) over producten, supplementen, pakketten, voeding, gezondheid, klachten, ziektes, aandoeningen, medicijnen of programma's zoals de Holistic Reset of Darmen in Balans" },

  // Kennismakings-rondes: eenmalige gesprekken waarin de Mentor het lid
  // leert kennen (profiel-opbouw + stem-check). Sterk model: de kwaliteit
  // van deze ene ervaring bepaalt hoe goed alles daarna klinkt. Eigen
  // detectie (detecteerKennismakingsRonde), dus geen routerBeschrijving.
  kennismaking: { id: "kennismaking", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: false, interviewEerst: false },

  // Gespreks-coaching: snel model volstaat, korte antwoorden zijn hier juist goed.
  bezwaar: { id: "bezwaar", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false,
    routerBeschrijving: "een prospect heeft een bezwaar of twijfel geuit (geen tijd, geen geld, wil nadenken, niks voor mij) en het lid zoekt hoe daarmee om te gaan" },
  followup: { id: "followup", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false,
    routerBeschrijving: "het lid wil opvolgen na eerder contact: iemand reageert niet meer, heeft een video gekeken, of het is tijd voor een vervolgstap" },
  closing: { id: "closing", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false,
    routerBeschrijving: "een prospect is warm en het lid wil helpen beslissen of afronden (starten, commitment, doel-tijd-termijn)" },
  motivatie: { id: "motivatie", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false,
    routerBeschrijving: "het lid zit er zelf doorheen: geen zin, gefrustreerd, twijfelt aan zichzelf, zoekt motivatie of mindset-hulp" },
  accountability: { id: "accountability", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false,
    routerBeschrijving: "het lid wil vertellen of bespreken wat hij/zij gedaan heeft: acties, aantallen, resultaten, weekplanning" },
  social: { id: "social", model: MODEL_STERK, maxTokens: 1200, schrijfwerk: true, interviewEerst: false,
    routerBeschrijving: "de vraag gaat over social-media-strategie of online zichtbaarheid in het algemeen (wat posten, hoe attractie werkt), zonder concreet schrijfverzoek" },
  algemeen: { id: "algemeen", model: MODEL_SNEL, maxTokens: 800, schrijfwerk: false, interviewEerst: false,
    routerBeschrijving: "alles wat nergens anders past: algemene vragen over de methode, het systeem, of een gewoon gesprek" },
};

/** Onbekende taak → veilig default (snel model, geen schrijf-bewaking). */
export function taakVoor(vraagType: string): MentorTaak {
  return TAKEN[vraagType] ?? TAKEN.algemeen;
}

/**
 * De taken die de receptionist-router mag kiezen: alles met een
 * routerBeschrijving. Nieuwe specialist = één registratie hierboven,
 * de router neemt hem automatisch mee.
 */
export function routerOpties(): { id: string; beschrijving: string }[] {
  return Object.values(TAKEN)
    .filter((t): t is MentorTaak & { routerBeschrijving: string } =>
      Boolean(t.routerBeschrijving),
    )
    .map((t) => ({ id: t.id, beschrijving: t.routerBeschrijving }));
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
