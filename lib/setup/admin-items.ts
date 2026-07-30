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
      "Maak je eigen webshop aan in de backoffice, dat is de website van het bedrijf waar je je eigen gegevens en je shop beheert. Bekijk de instructiefilm hieronder en volg de stappen. Eenmalige stap, hierna is je shop online en kun je hem delen. Je inloggegevens heb je bij je aanmelding gekregen; kun je ze niet vinden, vraag ze dan even aan je sponsor.",
    filmSlug: "onboarding-stap-6-webshop",
    externeLink: "https://team.lifeplus.com/",
  },
  {
    slug: ITEM_SLUGS.kredietformulierIngevuld,
    emoji: "✅",
    titel: "Kredietformulier invullen",
    uitleg:
      "Zonder dit formulier kan er geen commissie naar je toe. Vul 'm in in de backoffice, de website van het bedrijf waar je je gegevens beheert. De korte instructie staat in de film hieronder.",
    filmSlug: "onboarding-stap-8-kredietformulier",
    externeLink: "https://team.lifeplus.com/",
  },
  {
    slug: ITEM_SLUGS.teamsAdminIngericht,
    emoji: "📋",
    titel: "Je administratiesysteem inrichten",
    uitleg:
      "Hier houd je bij wie er in je team zitten en hoe het loopt (dit heet ook wel je teams-administratie). Volg de instructie in de film hieronder voor de exacte stappen.",
    filmSlug: "core-dag3-teams-admin",
    externeLink: "https://team.lifeplus.com/",
  },
  {
    slug: ITEM_SLUGS.bestellinksGekoppeld,
    emoji: "🔗",
    titel: "Bestellinks koppelen",
    uitleg:
      "Plak je eigen bestellinks per pakket in ELEVA: dat zijn de links naar je eigen webshop met dat pakket er al in. Hierna gebruikt het systeem ze automatisch in je productadviezen, zodat bestellingen bij jou landen.",
    filmSlug: null,
    externeLink: "/instellingen/bestellinks",
  },
];
