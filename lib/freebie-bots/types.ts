// File: lib/freebie-bots/types.ts
//
// Type-definities voor freebie-bots (Tweede Lente is pilot, daarna
// volgen Slaap-Loep, Energie-Loep, etc.).

export type BotSlug = "tweede-lente";

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
