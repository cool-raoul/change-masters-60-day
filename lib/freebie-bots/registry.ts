// File: lib/freebie-bots/registry.ts
//
// Centrale registry van alle freebie-bots. API-routes en server-
// components vinden via getBotConfig(slug) de juiste config.
//
// LET OP (2026-05-26): Tweede Lente en Tweede Wind (AI-spiegel-bots) zijn
// vervangen door score-bots Energie & Focus en Hormonen & Overgang. De
// AI-spiegel-typing blijft staan voor het geval een latere bot wel AI
// gebruikt, maar is nu nergens actief.
//
// Toevoegen van een nieuwe bot:
//   1. Maak `lib/freebie-bots/<slug>/` folder met de bot-files
//   2. Voeg een entry toe in BOT_REGISTRY hieronder
//   3. (Optioneel) Voeg de slug toe aan de zichtbare lijst in
//      `/instellingen/mijn-tracking-links`

import type { SpiegelOutput, BotSlug } from "./types";
import type { GenericMailTemplate } from "./mail-template-types";

export type BotConfig = {
  slug: BotSlug;
  titel: string;
  ondertitel: string;
  /** Korte beschrijving voor in /instellingen/mijn-tracking-links. */
  beschrijving: string;
  /** Trigger-woord voor social-posts (ManyChat-handleiding). */
  triggerVoorbeeld: string;
  /** Emoji-icoon voor visuele herkenning. */
  iconEmoji: string;
  /** Toon alleen voor Core-members + founders. */
  coreOnly: boolean;
  /** Bot-type: 'ai-spiegel' gebruikt OpenAI + bewaker. 'score' is
      deterministisch, geen AI. */
  type: "ai-spiegel" | "score";
  /** Alleen voor type='ai-spiegel': system-prompt builders. */
  bouwSysteemPrompt?: () => string;
  bouwUserBericht?: (antwoordRegel: string) => string;
  bewaakSpiegelOutput?: (raw: string) => SpiegelOutput;
  /** Vind een mail-template op dag-nummer (cross-bot generic). Optioneel
      want score-bots hebben (nog) geen mail-sequence. */
  templateVoorDag?: (dag: number) => GenericMailTemplate | null;
};

// Alleen actieve bots staan in de registry. Legacy slugs (tweede-lente,
// tweede-wind) zitten niet in deze map, dus getBotConfig() returnt null
// voor die slugs en de aanroepers vallen op een veilige default terug.
const BOT_REGISTRY: Partial<Record<BotSlug, BotConfig>> = {
  "energie-en-focus": {
    slug: "energie-en-focus",
    titel: "Energie & Focus",
    ondertitel:
      "Score-vragenlijst met uitgebreid leefstijl-advies",
    beschrijving:
      "Tien vragen met punten, persoonlijke score, uitgebreid educatief advies per thema (slaap, energie, focus, leefstijl). Geen AI-spiegel, wel diep leerstuk.",
    triggerVoorbeeld: "ENERGIE",
    iconEmoji: "⚡",
    coreOnly: false,
    type: "score",
  },
  "hormonen-en-overgang": {
    slug: "hormonen-en-overgang",
    titel: "Hormonen & Overgang",
    ondertitel:
      "Score-vragenlijst over hormoon-signalen met uitgebreid leefstijl-advies",
    beschrijving:
      "Tien score-vragen, persoonlijke score per thema (hormoon-signalen, slaap, stemming, lichaam). Uitgebreid educatief advies, brug naar hormoonbalans-pakketten.",
    triggerVoorbeeld: "OVERGANG",
    iconEmoji: "🌸",
    coreOnly: false,
    type: "score",
  },
  "reset-check": {
    slug: "reset-check",
    titel: "Klopt de Reset bij jou?",
    ondertitel:
      "Holistic Reset persoonlijke check, met heat-score per lead en investerings-filter",
    beschrijving:
      "13 score-vragen (waarvan 2 conditional voor vrouwen 35+), profiel-vragen rondom afvallen en investerings-bereidheid, medische zelf-check, en een rijke uitkomst met kennis-gap. Inclusief MediaBlokken voor teaser-video, testimonials en verdiepende film.",
    triggerVoorbeeld: "RESET",
    iconEmoji: "🌿",
    coreOnly: false,
    type: "score",
  },
};

/**
 * Vind bot-config voor een slug. Returnt null voor onbekende of
 * legacy-only slugs.
 */
export function getBotConfig(slug: string): BotConfig | null {
  return BOT_REGISTRY[slug as BotSlug] ?? null;
}

/**
 * Lijst van alle actieve bot-configs. Volgorde matcht insert-volgorde van
 * het register. Gebruik in UI's die alle bots tonen.
 */
export function alleBots(): BotConfig[] {
  return Object.values(BOT_REGISTRY).filter(
    (b): b is BotConfig => b !== undefined,
  );
}

/**
 * Lijst van bots die zichtbaar zijn voor deze member, op basis van
 * Core/founder-status.
 */
export function zichtbareBots(opties: {
  isCore: boolean;
  isFounder: boolean;
}): BotConfig[] {
  return alleBots().filter(
    (b) => !b.coreOnly || opties.isCore || opties.isFounder,
  );
}
