// File: lib/freebie-bots/types.ts
//
// Type-definities voor freebie-bots. Cross-bot generieke types en
// bot-specifieke types. Bot-specifieke files staan onder
// `lib/freebie-bots/<slug>/`.

export type BotSlug = "tweede-lente" | "tweede-wind";

/**
 * SpiegelOutput is een gemeenschappelijke vorm: alle freebie-bots
 * leveren dezelfde structuur op aan de UI. Dat houdt de spiegel-
 * component cross-bot bruikbaar.
 */
export type SpiegelOutput = {
  /** Eén openings-zin van ongeveer 2 regels in ELEVA-team-stem. */
  opening: string;
  /** Eén patroon-paragraaf, 3-4 regels. */
  patroon: string;
  /** Precies drie aanpassingen, elk een korte zin uit de template-whitelist. */
  driAanpassingen: [string, string, string];
  /** Eén afsluitings-zin die overgaat naar het opt-in-blok. */
  afsluiting: string;
};

export type BotMemberContext = {
  memberId: string;
  memberVoornaam: string;
  botSlug: BotSlug;
};

// ============================================================
// TWEEDE LENTE (overgang)
// ============================================================

export type TweedeLenteFase =
  | "pre-overgang"
  | "peri-overgang"
  | "volle-overgang"
  | "post-overgang"
  | "weet-niet";

export type TweedeLenteWatValtOp =
  | "energie-patroon"
  | "slaapritme"
  | "stemming"
  | "warmte-golven"
  | "cyclus-veranderingen"
  | "lichaamsbeleving"
  | "mentaal-helder-zijn";

export type TweedeLenteEetRitme =
  | "regelmatig-bewust"
  | "onregelmatig-gevarieerd"
  | "vaak-snel-tussendoor"
  | "wisselt-per-dag";

export type TweedeLenteBeweging =
  | "stevig"
  | "licht"
  | "wisselend"
  | "weinig";

export type TweedeLenteRust =
  | "goed-zonder-schuldgevoel"
  | "wisselend"
  | "hoofd-staat-aan"
  | "draai-door";

export type TweedeLenteDeel =
  | "partner"
  | "vriendin-of-vrouw"
  | "huisarts-of-professional"
  | "met-niemand-echt";

export type TweedeLenteZoek =
  | "iets-om-mee-te-beginnen"
  | "begrip-niet-de-enige"
  | "rustige-spiegel"
  | "concrete-kennis";

export type TweedeLenteAntwoorden = {
  fase: TweedeLenteFase;
  watValtOp: TweedeLenteWatValtOp[]; // 1-3 keuzes
  eetRitme: TweedeLenteEetRitme;
  beweging: TweedeLenteBeweging;
  rust: TweedeLenteRust;
  deel: TweedeLenteDeel;
  zoek: TweedeLenteZoek;
};

// ============================================================
// TWEEDE WIND (energie en focus)
// ============================================================
// Werknaam, definitieve naam wordt door Raoul bevestigd.

export type TweedeWindEnergie =
  | "stabiel-goed"
  | "ochtend-piek-middag-dip"
  | "doormodderen-tot-avond"
  | "wisselend-onvoorspelbaar"
  | "structureel-laag";

export type TweedeWindFocusBreker =
  | "afleiding-schermen"
  | "te-veel-tegelijk"
  | "stress-zorgen"
  | "slecht-slapen"
  | "geen-duidelijk-doel"
  | "kort-van-geheugen"
  | "moeilijk-beginnen";

export type TweedeWindSlaap =
  | "diep-en-genoeg"
  | "moeite-met-inslapen"
  | "vroeg-wakker"
  | "onrustig-doorslapen"
  | "te-weinig-tijd";

export type TweedeWindEetRitme =
  | "regelmatig-volwaardig"
  | "veel-snelle-suikers"
  | "weinig-eiwit"
  | "skip-ontbijt"
  | "wisselend";

export type TweedeWindBeweging =
  | "dagelijks-iets"
  | "een-paar-keer-per-week"
  | "wisselend"
  | "weinig-tot-niets";

export type TweedeWindHerstel =
  | "echt-uitschakelen"
  | "scherm-tot-bedtijd"
  | "altijd-aan"
  | "geen-tijd-voor-rust";

export type TweedeWindDoel =
  | "meer-energie-de-hele-dag"
  | "scherper-kunnen-werken"
  | "minder-stress"
  | "beter-slapen"
  | "weet-niet-precies";

export type TweedeWindAntwoorden = {
  energie: TweedeWindEnergie;
  focusBrekers: TweedeWindFocusBreker[]; // 1-3 keuzes
  slaap: TweedeWindSlaap;
  eetRitme: TweedeWindEetRitme;
  beweging: TweedeWindBeweging;
  herstel: TweedeWindHerstel;
  doel: TweedeWindDoel;
};
