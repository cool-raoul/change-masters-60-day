// File: lib/freebie-bots/types.ts
//
// Type-definities voor freebie-bots. Cross-bot generieke types en
// bot-specifieke types. Bot-specifieke files staan onder
// `lib/freebie-bots/<slug>/`.
//
// LET OP (2026-05-26): de oude AI-spiegel-bots "tweede-lente" en
// "tweede-wind" zijn vervangen door score-bots ("energie-en-focus" en
// "hormonen-en-overgang"). Oude slugs blijven hier voor backwards-compat
// met legacy DB-rijen (tokens, opt-ins, prospect-tags) maar staan niet
// meer in de registry, dus nieuwe flows kunnen ze niet gebruiken.

export type BotSlug =
  | "energie-en-focus"
  | "hormonen-en-overgang"
  // Legacy, alleen voor lezen van oude data
  | "tweede-lente"
  | "tweede-wind";

/**
 * SpiegelOutput is een gemeenschappelijke vorm voor AI-spiegel-bots.
 * Score-bots gebruiken dit type NIET, die leveren hun eigen score-uitkomst.
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
