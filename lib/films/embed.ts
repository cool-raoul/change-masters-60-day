// ============================================================
// Films-CMS, utility helpers
//
// Zet "rauwe" YouTube/Vimeo URLs om naar embed-URLs zodat de admin
// gewoon een gewone share-link kan plakken en wij hem normaliseren.
//
// Ondersteund:
//   - YouTube: https://www.youtube.com/watch?v=VIDID
//              https://youtu.be/VIDID
//              https://www.youtube.com/embed/VIDID  (al embed)
//   - Vimeo:   https://vimeo.com/VIDID
//              https://player.vimeo.com/video/VIDID (al embed)
// ============================================================

export type FilmRecord = {
  id: string;
  slug: string;
  titel: string;
  beschrijving: string | null;
  video_url: string | null;
  tonen: boolean;
  duur_seconden: number | null;
  toegevoegd_door: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Normaliseert een ingeplakte YouTube/Vimeo-URL naar een embed-URL.
 * Geeft null terug als het geen herkenbare URL is.
 */
export function normaliseerNaarEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  const ruw = url.trim();
  if (!ruw) return null;

  // YouTube: youtu.be/VIDID
  const youtuBeMatch = ruw.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (youtuBeMatch) {
    return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
  }

  // YouTube: youtube.com/watch?v=VIDID
  const youtubeWatchMatch = ruw.match(/youtube\.com\/watch\?(?:[^&]*&)*v=([a-zA-Z0-9_-]{6,})/);
  if (youtubeWatchMatch) {
    return `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`;
  }

  // YouTube: al embed-vorm, laat staan
  if (/youtube\.com\/embed\//.test(ruw)) {
    return ruw;
  }

  // YouTube shorts: youtube.com/shorts/VIDID
  const shortsMatch = ruw.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Vimeo: vimeo.com/VIDID
  const vimeoMatch = ruw.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Vimeo: al embed-vorm, laat staan
  if (/player\.vimeo\.com\/video\//.test(ruw)) {
    return ruw;
  }

  // Onbekend formaat, return zoals het is, browser kan er soms toch
  // mee omgaan (bv. directe MP4-URL).
  return ruw;
}

/**
 * Detecteert provider, handig voor analytics-config later.
 */
export function detecteerProvider(url: string | null | undefined): "youtube" | "vimeo" | "anders" | null {
  if (!url) return null;
  if (/youtube|youtu\.be/i.test(url)) return "youtube";
  if (/vimeo/i.test(url)) return "vimeo";
  return "anders";
}

/**
 * Vooraf-gedefinieerde slugs voor de admin-stappen in het 21-daagse
 * playbook. We behouden de oude 'onboarding-stap-*' naamgeving zodat
 * eerder geplakte films niet kapotgaan. De stappen zijn verplaatst
 * van de onboarding naar het playbook (dag 2/3/4).
 */
export const ONBOARDING_FILM_SLUGS = {
  STAP_6_WEBSHOP: "onboarding-stap-6-webshop",
  STAP_7_TEAMS_ADMIN: "onboarding-stap-7-teams-admin",
  STAP_8_KREDIETFORMULIER: "onboarding-stap-8-kredietformulier",
  STAP_9_BESTELLINKS: "onboarding-stap-9-bestellinks",
} as const;

/**
 * Slug voor de welkomstfilm. Verschijnt automatisch als pop-up bij
 * eerste bezoek aan /dashboard, en is altijd terug op te roepen via
 * '💡 Welkomstfilm'-knop in de Topbar.
 */
export const WELKOMSTFILM_SLUG = "intro-welkom";

/**
 * Welkomstfilms per modus, getoond bovenaan de welkomstpagina van
 * Pro en Core. Founder kan ze in /instellingen/films vullen, lege
 * URL = geen film boven de pagina (gebruiker ziet alleen de tools).
 */
export const MODUS_WELKOMSTFILM_SLUGS = {
  PRO: "modus-welkom-pro",
  CORE: "modus-welkom-core",
  KEUZE: "modus-welkom-keuze",
} as const;

/**
 * PROSPECT-FILMS, de set films die een member kan delen met een
 * prospect via een share-link. Founder uploadt ze 1× in
 * /instellingen/films, alle members hergebruiken dezelfde slugs.
 *
 * Per slot (slug) een korte titel + beschrijving + intro-tekst die
 * de prospect ziet bovenaan de share-pagina. De intro-tekst is
 * los configureerbaar zodat dezelfde film voor verschillende doelen
 * gebruikt kan worden met passende leidende tekst.
 */
export const PROSPECT_FILM_SLUGS = {
  INTRODUCTIE: "prospect-1-introductie",
  PRESENTATIE: "prospect-2-presentatie",
  TESTIMONIAL: "prospect-3-testimonial",
  PRODUCT_DEMO: "prospect-4-product-demo",
  TEAM_SUPPORT: "prospect-5-team-en-support",
  EXTRA_6: "prospect-6-extra",
  EXTRA_7: "prospect-7-extra",
  EXTRA_8: "prospect-8-extra",
  EXTRA_9: "prospect-9-extra",
  EXTRA_10: "prospect-10-extra",
} as const;

// Uitbreidbaar: voeg gewoon een nieuwe regel toe aan PROSPECT_FILM_SLUGS
// (bv. EXTRA_11: "prospect-11-extra") plus een matchende entry in
// PROSPECT_FILM_BESCHRIJVINGEN hieronder. De Films-CMS en /prospect-film/
// [token]-pagina pikken het automatisch op zonder verdere code-wijzigingen.

/**
 * Metadata voor prospect-films, gebruikt door de admin-UI én door de
 * /prospect-film/[token]-pagina om de juiste leidende tekst te tonen.
 */
export const PROSPECT_FILM_BESCHRIJVINGEN: Record<
  string,
  {
    suggestieTitel: string;
    voorbeeldIntro: string;
    callToAction: string;
  }
> = {
  [PROSPECT_FILM_SLUGS.INTRODUCTIE]: {
    suggestieTitel: "Wat is dit en waarom kijk je?",
    voorbeeldIntro:
      "Hoi! Hieronder een korte film van 3 minuten die uitlegt wat ik aan het opbouwen ben en waarom ik aan jou denk. Geen druk, kijk even mee.",
    callToAction: "Ik heb 'm bekeken",
  },
  [PROSPECT_FILM_SLUGS.PRESENTATIE]: {
    suggestieTitel: "De volledige presentatie",
    voorbeeldIntro:
      "Dit is de hoofdpresentatie. Pak even rust, een kop koffie, en kijk 'm rustig door. Daarna laat ik je weten of je vragen hebt.",
    callToAction: "Klaar met kijken",
  },
  [PROSPECT_FILM_SLUGS.TESTIMONIAL]: {
    suggestieTitel: "Verhalen van mensen die je vooraf gingen",
    voorbeeldIntro:
      "Dit zijn mensen zoals jij, die 6-12 maanden geleden begonnen. Wat hen aantrok, wat ze leerden, wat het hen heeft opgeleverd.",
    callToAction: "Ik heb 'm bekeken",
  },
  [PROSPECT_FILM_SLUGS.PRODUCT_DEMO]: {
    suggestieTitel: "De producten van Lifeplus",
    voorbeeldIntro:
      "Een korte uitleg over wat we precies aanbieden, waarom de kwaliteit zo goed is, en hoe het past in een gezonde routine.",
    callToAction: "Ik heb 'm gezien",
  },
  [PROSPECT_FILM_SLUGS.TEAM_SUPPORT]: {
    suggestieTitel: "Het team waar je bij terecht zou komen",
    voorbeeldIntro:
      "We bouwen dit samen op. Hier laten we zien hoe ons team werkt, welke begeleiding je krijgt, en met wie je dagelijks contact hebt.",
    callToAction: "Klaar",
  },
  [PROSPECT_FILM_SLUGS.EXTRA_6]: {
    suggestieTitel: "Extra prospect-film 6",
    voorbeeldIntro:
      "Pas de leidende tekst aan op de plek waar je deze film inzet. Founder vult titel + voorbeeldzin in via /instellingen/films.",
    callToAction: "Ik heb 'm bekeken",
  },
  [PROSPECT_FILM_SLUGS.EXTRA_7]: {
    suggestieTitel: "Extra prospect-film 7",
    voorbeeldIntro:
      "Pas de leidende tekst aan op de plek waar je deze film inzet. Founder vult titel + voorbeeldzin in via /instellingen/films.",
    callToAction: "Ik heb 'm bekeken",
  },
  [PROSPECT_FILM_SLUGS.EXTRA_8]: {
    suggestieTitel: "Extra prospect-film 8",
    voorbeeldIntro:
      "Pas de leidende tekst aan op de plek waar je deze film inzet. Founder vult titel + voorbeeldzin in via /instellingen/films.",
    callToAction: "Ik heb 'm bekeken",
  },
  [PROSPECT_FILM_SLUGS.EXTRA_9]: {
    suggestieTitel: "Extra prospect-film 9",
    voorbeeldIntro:
      "Pas de leidende tekst aan op de plek waar je deze film inzet. Founder vult titel + voorbeeldzin in via /instellingen/films.",
    callToAction: "Ik heb 'm bekeken",
  },
  [PROSPECT_FILM_SLUGS.EXTRA_10]: {
    suggestieTitel: "Extra prospect-film 10",
    voorbeeldIntro:
      "Pas de leidende tekst aan op de plek waar je deze film inzet. Founder vult titel + voorbeeldzin in via /instellingen/films.",
    callToAction: "Ik heb 'm bekeken",
  },
};

/**
 * Beschrijvende metadata voor de admin-UI bij het beheren van slots.
 * zo weet de founder waar elke film terechtkomt in de gebruikersflow.
 */
export const SLUG_BESCHRIJVINGEN: Record<string, { plek: string; suggestieTitel: string }> = {
  [WELKOMSTFILM_SLUG]: {
    plek: "Welkomstfilm: pop-up bij eerste dashboard-bezoek + Topbar 💡-knop",
    suggestieTitel: "Welkom bij ELEVA",
  },
  [MODUS_WELKOMSTFILM_SLUGS.KEUZE]: {
    plek: "Boven de Core/Pro keuzepagina, kort filmpje dat het verschil uitlegt",
    suggestieTitel: "Welke route past bij jou?",
  },
  [MODUS_WELKOMSTFILM_SLUGS.CORE]: {
    plek: "Boven de Core-welkomstpagina, voor de webshop-strategie instromer",
    suggestieTitel: "Welkom op de webshop-route",
  },
  [MODUS_WELKOMSTFILM_SLUGS.PRO]: {
    plek: "Boven de Pro-welkomstpagina, voor de professional met cliënten",
    suggestieTitel: "Welkom op de professional-route",
  },
  [ONBOARDING_FILM_SLUGS.STAP_6_WEBSHOP]: {
    plek: "Playbook dag 2, Lifeplus webshop aanmaken",
    suggestieTitel: "Lifeplus webshop aanmaken",
  },
  [ONBOARDING_FILM_SLUGS.STAP_8_KREDIETFORMULIER]: {
    plek: "Playbook dag 2, Kredietformulier invullen",
    suggestieTitel: "Kredietformulier invullen",
  },
  [ONBOARDING_FILM_SLUGS.STAP_7_TEAMS_ADMIN]: {
    plek: "Playbook dag 3, Teams-administratiesysteem aanmaken",
    suggestieTitel: "Teams-administratiesysteem aanmaken",
  },
  [ONBOARDING_FILM_SLUGS.STAP_9_BESTELLINKS]: {
    plek: "Playbook dag 4, Bestellinks koppelen aan ELEVA",
    suggestieTitel: "Bestellinks koppelen aan ELEVA",
  },
};
