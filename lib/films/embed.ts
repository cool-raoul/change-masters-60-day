// ============================================================
// Films-CMS — utility helpers
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

  // YouTube: al embed-vorm — laat staan
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

  // Vimeo: al embed-vorm — laat staan
  if (/player\.vimeo\.com\/video\//.test(ruw)) {
    return ruw;
  }

  // Onbekend formaat — return zoals het is, browser kan er soms toch
  // mee omgaan (bv. directe MP4-URL).
  return ruw;
}

/**
 * Detecteert provider — handig voor analytics-config later.
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
 * Beschrijvende metadata voor de admin-UI bij het beheren van slots —
 * zo weet de founder waar elke film terechtkomt in de gebruikersflow.
 */
export const SLUG_BESCHRIJVINGEN: Record<string, { plek: string; suggestieTitel: string }> = {
  [ONBOARDING_FILM_SLUGS.STAP_6_WEBSHOP]: {
    plek: "Playbook dag 2 — Lifeplus webshop aanmaken",
    suggestieTitel: "Lifeplus webshop aanmaken",
  },
  [ONBOARDING_FILM_SLUGS.STAP_8_KREDIETFORMULIER]: {
    plek: "Playbook dag 2 — Kredietformulier invullen",
    suggestieTitel: "Kredietformulier invullen",
  },
  [ONBOARDING_FILM_SLUGS.STAP_7_TEAMS_ADMIN]: {
    plek: "Playbook dag 3 — Teams-administratiesysteem aanmaken",
    suggestieTitel: "Teams-administratiesysteem aanmaken",
  },
  [ONBOARDING_FILM_SLUGS.STAP_9_BESTELLINKS]: {
    plek: "Playbook dag 4 — Bestellinks koppelen aan ELEVA",
    suggestieTitel: "Bestellinks koppelen aan ELEVA",
  },
};
