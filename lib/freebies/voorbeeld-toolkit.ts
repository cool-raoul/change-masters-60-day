// File: lib/freebies/voorbeeld-toolkit.ts
//
// Voorbeeld-freebies voor de founder-toolkit. Vijf PLACEHOLDER-templates
// die Raoul en Gaby morgen invullen met claim-vrije content in jullie stem.
// Slugs zijn definitief (worden referentie in DB).

import type { Freebie } from "./types";

/**
 * Vijf voorbeeld-freebies voor pilot. TODO-GABY: vul inhoud_template per
 * freebie aan, en check claim-vrijheid in elke zin (EFSA + ACM-compliant).
 */
export const VOORBEELD_TOOLKIT: Omit<Freebie, "id" | "actief">[] = [
  {
    slug: "energie-21-dagen",
    titel: "21 Dagen Meer Energie",
    ondertitel: "Een dagelijks ritueel dat je weer in beweging brengt",
    vorm: "pdf",
    onderwerp: "energie",
    beschrijving:
      "Een 21-dagen-gids met ochtend-, middag- en avondritueel. PLACEHOLDER. TODO-GABY: schrijf inhoud in ELEVA-stem.",
    inhoudTemplate: "TODO-GABY: PDF-inhoud invullen.",
    duurMinuten: 15,
  },
  {
    slug: "slaap-reset",
    titel: "Slaap-Reset in 5 Avonden",
    ondertitel: "Vijf avonden, vijf zachte veranderingen",
    vorm: "mailreeks",
    onderwerp: "slaap",
    beschrijving:
      "Vijfdaagse mailreeks. Elke avond een korte tip die je voor het slapengaan kunt toepassen. PLACEHOLDER. TODO-GABY: schrijf mailreeks-inhoud.",
    inhoudTemplate: "TODO-GABY: vijf mails invullen.",
    duurMinuten: 5,
  },
  {
    slug: "darm-check",
    titel: "Welke Darm-Type Ben Jij?",
    ondertitel: "Een korte test met een persoonlijk vervolg",
    vorm: "test",
    onderwerp: "darmen",
    beschrijving:
      "Tien vragen over spijsvertering, energie en humeur. Aan het eind een advies welke supplementen-richting bij jouw type past. PLACEHOLDER. TODO-GABY: vragen + scoring + claim-vrije adviezen.",
    inhoudTemplate: "TODO-GABY: tien vragen en scoring-matrix invullen.",
    duurMinuten: 3,
  },
  {
    slug: "sport-piek",
    titel: "Eet voor je Volgende Piek",
    ondertitel: "Wat eet je voor, tijdens en na je training",
    vorm: "gids",
    onderwerp: "sport-prestatie",
    beschrijving:
      "Korte gids voor sporters die meer uit hun training willen halen. PLACEHOLDER. TODO-GABY: schrijf gids in ELEVA-stem.",
    inhoudTemplate: "TODO-GABY: gids-inhoud invullen.",
    duurMinuten: 10,
  },
  {
    slug: "hormonen-cyclus",
    titel: "Werken Met Je Cyclus",
    ondertitel: "Vier weken van je cyclus, vier soorten energie",
    vorm: "pdf",
    onderwerp: "hormonen",
    beschrijving:
      "Een gids over hoe je je dagen en je voeding afstemt op de fase van je cyclus. PLACEHOLDER. TODO-GABY: schrijf in ELEVA-stem, claim-vrij.",
    inhoudTemplate: "TODO-GABY: PDF-inhoud invullen.",
    duurMinuten: 12,
  },
  {
    slug: "tweede-lente",
    titel: "Tweede Lente",
    ondertitel: "Een rustige spiegel voor jouw fase",
    vorm: "test",
    onderwerp: "overgang",
    beschrijving:
      "Vijf-minuten web-bot voor vrouwen in peri-, volle of post-overgang. Zeven vragen + een spiegel + opt-in voor vijf-mail-reeks. Pilot voor freebie-bot-architectuur.",
    inhoudTemplate:
      "Bot-content staat in code (lib/freebie-bots/tweede-lente-vragen.ts en tweede-lente-system-prompt.ts). TODO-GABY: 5 mail-templates aanleveren voor de 5-mail-reeks.",
    duurMinuten: 5,
  },
];
