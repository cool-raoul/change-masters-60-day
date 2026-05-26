// File: lib/freebie-bots/registry.ts
//
// Centrale registry van alle freebie-bots. API-routes en server-
// components vinden via getBotConfig(slug) de juiste system-prompt,
// bewaker, mail-templates etc.
//
// Toevoegen van een nieuwe bot vraagt drie stappen:
//   1. Maak `lib/freebie-bots/<slug>/` folder met de bekende files
//      (vragen, system-prompt, advies, bewaker, mail-templates, index)
//   2. Voeg een entry toe in BOT_REGISTRY hieronder
//   3. (Optioneel) Voeg de slug toe aan ACTIEVE_BOTS in
//      `/instellingen/mijn-tracking-links` voor zichtbaarheid in UI

import type { SpiegelOutput, BotSlug } from "./types";
import {
  alsGenericTemplate,
  type GenericMailTemplate,
} from "./mail-template-types";

import * as tweedeLente from "./tweede-lente";
import * as tweedeWind from "./tweede-wind";

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

function wrapTemplateVoorDag(
  fn: (dag: number) => { dag: 1 | 2 | 3 | 4 | 5; onderwerp: string; bouwHtml: (input: never) => string } | null,
): (dag: number) => GenericMailTemplate | null {
  return (dag: number) => {
    const t = fn(dag);
    return t ? alsGenericTemplate(t) : null;
  };
}

const BOT_REGISTRY: Record<BotSlug, BotConfig> = {
  "tweede-lente": {
    slug: "tweede-lente",
    titel: "Tweede Lente",
    ondertitel:
      "Persoonlijk overzicht voor wat speelt in en rond de overgang",
    beschrijving:
      "Vijf-minuten persoonlijk overzicht voor vrouwen in peri-, volle- of post-overgang. Zeven vragen, ankers, voedingsstoffen, pakket-richting.",
    triggerVoorbeeld: "TWEEDE-LENTE",
    iconEmoji: "🌷",
    coreOnly: true,
    type: "ai-spiegel",
    bouwSysteemPrompt: tweedeLente.bouwTweedeLenteSysteemPrompt,
    bouwUserBericht: tweedeLente.bouwTweedeLenteUserBericht,
    bewaakSpiegelOutput: tweedeLente.bewaakSpiegelOutput,
    templateVoorDag: wrapTemplateVoorDag(tweedeLente.templateVoorDag),
  },
  "tweede-wind": {
    slug: "tweede-wind",
    titel: "Tweede Wind",
    ondertitel: "Persoonlijk overzicht voor energie en focus",
    beschrijving:
      "Vijf-minuten persoonlijk overzicht voor energie en focus. Zeven vragen, handvatten, voedingsstoffen, pakket-richting. Werknaam (Raoul bevestigt definitieve naam).",
    triggerVoorbeeld: "TWEEDE-WIND",
    iconEmoji: "⚡",
    coreOnly: false,
    type: "ai-spiegel",
    bouwSysteemPrompt: tweedeWind.bouwTweedeWindSysteemPrompt,
    bouwUserBericht: tweedeWind.bouwTweedeWindUserBericht,
    bewaakSpiegelOutput: tweedeWind.bewaakSpiegelOutput,
    templateVoorDag: wrapTemplateVoorDag(tweedeWind.templateVoorDag),
  },
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
    // Geen AI-functies (deterministische score-bot)
    // Geen mail-templates (nog niet, kan later)
  },
};

/**
 * Vind bot-config voor een slug. Returnt null voor onbekende slugs.
 */
export function getBotConfig(slug: string): BotConfig | null {
  return BOT_REGISTRY[slug as BotSlug] ?? null;
}

/**
 * Lijst van alle bot-configs. Volgorde matcht insert-volgorde van het
 * register. Gebruik in UI's die alle bots tonen.
 */
export function alleBots(): BotConfig[] {
  return Object.values(BOT_REGISTRY);
}

/**
 * Lijst van bots die zichtbaar zijn voor deze member, op basis van
 * Core/founder-status. Tweede Wind is voor pilot voor IEDEREEN
 * zichtbaar (geen coreOnly), Tweede Lente alleen voor Core + founder.
 */
export function zichtbareBots(opties: {
  isCore: boolean;
  isFounder: boolean;
}): BotConfig[] {
  return alleBots().filter(
    (b) => !b.coreOnly || opties.isCore || opties.isFounder,
  );
}
