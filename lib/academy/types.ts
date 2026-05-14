// ============================================================
// lib/academy/types.ts
//
// Types voor ELEVA Academy, de overkoepelende in-app leeromgeving
// waar meerdere trainingen onder kunnen vallen. Eerste training:
// 'Social Media Strategie' (Frazer Brookes-principes). Latere
// trainingen krijgen elk een eigen slug + content-bestand.
//
// Content staat in code (Git-versioned), voortgang in DB. Zie
// lib/supabase/migrations/social_media_training.sql voor de
// DB-laag.
// ============================================================

/**
 * Eén les binnen een module. Bevat de leerinhoud + een mini-
 * oefening. Volledig in Markdown zodat we 'm in de UI kunnen
 * renderen + de Mentor er bij kan.
 */
export type AcademyLes = {
  /** Bv. "1.2" of "13.3". Stabiel; in DB als les_sleutel. */
  sleutel: string;
  /** Korte titel, max ~70 tekens. */
  titel: string;
  /** 8-12 min leestijd, in Markdown. */
  inhoud: string;
  /**
   * Mini-oefening die de member NA de leerinhoud doet. Concreet,
   * pak-je-telefoon-nu-stijl. Bv. "Open Instagram en schrijf 3
   * mensen op die regelmatig op jouw stories reageren".
   */
  oefening?: string;
  /**
   * Optionele film-slug. Als gezet, rendert de les-pagina de
   * film via FilmInBlok (zelfde slug-systeem als de rest van
   * ELEVA, founder beheert in /instellingen/films).
   */
  filmSlug?: string;
  /**
   * Geschatte leestijd in minuten. Tonen we bovenaan de les
   * zodat de member weet wat 'ie kan verwachten.
   */
  leestijdMinuten?: number;
  /**
   * Optionele audio-zoeklink (Spotify, Apple Podcasts, etc.). Wanneer
   * gezet, rendert de les-pagina een prominent 'Beluister op Spotify'-
   * knop boven het oefening-blok. Gebruikt door de Audio-onderweg-
   * training (Worre's Seven Skills).
   */
  audioZoekLink?: string;
};

/**
 * Eén module binnen een training. Groepeert een handvol lessen
 * rond een thema. Bijvoorbeeld 'Je profiel-fundament' met 3
 * lessen daarbinnen.
 */
export type AcademyModule = {
  /** Bv. 1, 2, 3. Volgorde-bepalend. */
  nummer: number;
  /** Bv. "Mindset & filosofie". */
  titel: string;
  /** Eén-zin samenvatting, getoond op het overzicht. */
  samenvatting: string;
  /** Optionele emoji als visuele anker. */
  emoji?: string;
  /** Lessen in deze module, in volgorde. */
  lessen: AcademyLes[];
};

/**
 * Eén training binnen de Academy. Heeft een eigen slug, naam,
 * doelgroep-info en een lijst modules. Verwijzingen vanuit
 * andere ELEVA-onderdelen (playbook, dashboard-tegels, Mentor)
 * gaan via deze slug.
 */
export type AcademyTraining = {
  /** Stabiele slug, bv. "social-media", "leiderschap". */
  slug: string;
  /** Display-titel, bv. "Social Media Strategie". */
  titel: string;
  /** 1-2 zin samenvatting voor het Academy-overzicht. */
  pitch: string;
  /** Optionele emoji als visuele anker. */
  emoji?: string;
  /**
   * Voor wie is deze training het meest geschikt? Bv.
   * ['core', 'sprint-na-21']. Beïnvloedt dashboard-tegel
   * zichtbaarheid (zie ZichtbaarVoor hieronder).
   */
  zichtbaarVoor: ZichtbaarVoor[];
  /** Geschatte totaal-doorlooptijd in dagen (1 les/dag tempo). */
  doorlooptijdDagen: number;
  /** Modules in deze training, in volgorde. */
  modules: AcademyModule[];
};

/**
 * Wanneer wordt een training prominent aanbevolen voor welke
 * modus / fase?
 *
 * - 'core'         = altijd prominent voor Core-leden
 * - 'sprint-na-21' = voor Sprint-leden ZODRA ze door dag 21 zijn
 * - 'pro-optie'    = voor Pro-leden in menu, niet als push
 * - 'iedereen'     = altijd zichtbaar in Academy-overzicht voor
 *                    elke modus (geldt eigenlijk voor alle
 *                    trainingen, dit is een conditie voor
 *                    DASHBOARD-aanbeveling specifiek)
 */
export type ZichtbaarVoor =
  | "core"
  | "sprint-na-21"
  | "pro-optie"
  | "iedereen";

/**
 * Voortgang van één user, geaggregeerd per training. Wordt
 * berekend uit training_voortgang-rijen door
 * lib/academy/voortgang.ts.
 */
export type AcademyVoortgang = {
  trainingSlug: string;
  voltooideLessleutels: Set<string>;
  voltooidePercent: number;
  totaalLessen: number;
};
