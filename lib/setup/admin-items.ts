import { ITEM_SLUGS, type ItemSlug } from "@/lib/onboarding/sleutels";

// ============================================================
// Vijf admin-items voor /setup. Eén bron van waarheid: deze lijst
// wordt gerenderd op /setup en gecontroleerd vanuit /vandaag voor
// de SetupPopup. Volgorde is de aanbevolen volgorde voor de member.
// ============================================================

export type AdminItem = {
  slug: ItemSlug;
  emoji: string;
  titel: string;
  uitleg: string;
  // Optionele route. Als gezet, knop "Open uitleg" linkt hierheen.
  // Veel admin-stappen zijn buiten ELEVA (Lifeplus-backoffice), dus
  // dan is route null en geeft de uitleg-tekst zelf de instructie.
  route: string | null;
};

export const ADMIN_ITEMS: AdminItem[] = [
  {
    slug: ITEM_SLUGS.webshopAangemaakt,
    emoji: "🛒",
    titel: "Webshop aanmaken",
    uitleg:
      "Maak je eigen Lifeplus-webshop aan via de officiële backoffice. Vraag je sponsor om de hand-out of korte instructiefilm. Eenmalige stap, hierna is je shop online en kun je hem delen.",
    route: null,
  },
  {
    slug: ITEM_SLUGS.kredietformulierIngevuld,
    emoji: "✅",
    titel: "Kredietformulier invullen",
    uitleg:
      "Zonder dit formulier kunnen je commissies niet worden uitbetaald. Vul 'm in via de Lifeplus-backoffice. Korte stap van een paar minuten.",
    route: null,
  },
  {
    slug: ITEM_SLUGS.teamsAdminIngericht,
    emoji: "📋",
    titel: "Teams-administratie inrichten",
    uitleg:
      "Hier wordt je team-structuur en business-data bijgehouden. Volg de korte instructie uit de team-onboarding van je sponsor.",
    route: null,
  },
  {
    slug: ITEM_SLUGS.bestellinksGekoppeld,
    emoji: "🔗",
    titel: "Bestellinks koppelen",
    uitleg:
      "Plak je eigen Lifeplus-bestellinks per pakket in ELEVA. Hierna gebruikt het systeem ze automatisch in productadvies-flows.",
    route: "/instellingen/bestellinks",
  },
  {
    slug: ITEM_SLUGS.productadviesTestGedaan,
    emoji: "🧪",
    titel: "Productadvies-test zelf doen",
    uitleg:
      "Doe de test één keer zelf, zo weet je wat een prospect ervaart en welk advies eruit kan komen. Drie minuten.",
    route: "/test-pakket-bouwer",
  },
];
