// ============================================================
// Centrale typed sleutels voor onboarding_voltooiingen.item_slug.
// Een wijziging hier raakt alle modi tegelijk.
// ============================================================

export const ITEM_SLUGS = {
  // Pre-day-1 stap 1: welkom + app + push
  appGeinstalleerd: "app-geinstalleerd",
  pushAan: "push-aan",
  // Pre-day-1 stap 2: WHY
  why: "why",
  // Pre-day-1 stap 3: eerste 5 namen
  eersteVijfNamen: "eerste-5-namen",
  vcardImport: "vcard-import-gedaan",
  sponsorEersteBericht: "sponsor-eerste-bericht",
  // Pre-day-1 stap 4: modus-keuze (modus-specifiek)
  modusKeuzeTempo: "modus-keuze-tempo",
  modusKeuzeDtt: "modus-keuze-dtt",
  // Admin-rail
  webshopAangemaakt: "webshop-aangemaakt",
  kredietformulierIngevuld: "kredietformulier-ingevuld",
  teamsAdminIngericht: "teams-admin-ingericht",
  bestellinksGekoppeld: "bestellinks-gekoppeld",
  productadviesTestGedaan: "productadvies-test-gedaan",
} as const;

export type ItemSlug = typeof ITEM_SLUGS[keyof typeof ITEM_SLUGS];
