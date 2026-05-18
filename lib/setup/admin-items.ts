import { ITEM_SLUGS, type ItemSlug } from "@/lib/onboarding/sleutels";

// ============================================================
// Vier admin-items voor /setup. Eén bron van waarheid: deze lijst
// wordt gerenderd op /setup en gecontroleerd vanuit /vandaag voor
// de SetupPopup. Volgorde is de aanbevolen volgorde voor de member.
//
// Productadvies-test is per 2026-05-19 uit deze lijst gehaald. Iemand
// die start met Sprint/Core/Pro heeft al een eigen product-keuze.
// ============================================================

export type AdminItem = {
  slug: ItemSlug;
  emoji: string;
  titel: string;
  uitleg: string;
  // Optionele film-slug die op de uitleg-pagina /setup/[slug] gerenderd
  // wordt via FilmInBlok. Null = alleen tekst.
  filmSlug: string | null;
  // Optionele externe of interne route (Lifeplus-backoffice link).
  externeLink: string | null;
};

export const ADMIN_ITEMS: AdminItem[] = [
  {
    slug: ITEM_SLUGS.webshopAangemaakt,
    emoji: "🛒",
    titel: "Webshop aanmaken",
    uitleg:
      "Maak je eigen Lifeplus-webshop aan via de officiële backoffice. Bekijk de instructiefilm hieronder en volg de stappen. Eenmalige stap, hierna is je shop online en kun je hem delen.",
    filmSlug: "onboarding-stap-6-webshop",
    externeLink: null,
  },
  {
    slug: ITEM_SLUGS.kredietformulierIngevuld,
    emoji: "✅",
    titel: "Kredietformulier invullen",
    uitleg:
      "Zonder dit formulier kunnen je commissies niet worden uitbetaald. Vul 'm in via de Lifeplus-backoffice. De korte instructie staat in de film hieronder.",
    filmSlug: "onboarding-stap-8-kredietformulier",
    externeLink: null,
  },
  {
    slug: ITEM_SLUGS.teamsAdminIngericht,
    emoji: "📋",
    titel: "Teams-administratie inrichten",
    uitleg:
      "Hier wordt je team-structuur en business-data bijgehouden. Volg de instructie in de film hieronder voor de exacte stappen.",
    filmSlug: "core-dag3-teams-admin",
    externeLink: null,
  },
  {
    slug: ITEM_SLUGS.bestellinksGekoppeld,
    emoji: "🔗",
    titel: "Bestellinks koppelen",
    uitleg:
      "Plak je eigen Lifeplus-bestellinks per pakket in ELEVA. Hierna gebruikt het systeem ze automatisch in productadvies-flows.",
    filmSlug: null,
    externeLink: "/instellingen/bestellinks",
  },
];
