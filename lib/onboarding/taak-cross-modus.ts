import { ITEM_SLUGS, type ItemSlug } from "./sleutels";

// ============================================================
// Centrale mapping van taak-id (in dagen.ts / tempo-aware.ts /
// core-stappen.ts) naar de cross-modus voltooi-slug. Deze mapping
// werd eerder dubbel onderhouden in app/vandaag/page.tsx en
// app/vandaag/vandaag-flow.tsx, met als gevolg dat per-modus taken
// stilletjes uit sync raakten (B5 in de fase-3c audit).
//
// Gebruik:
//   import { TAAK_NAAR_CROSS_MODUS_SLUG } from "@/lib/onboarding/taak-cross-modus";
//   const slug = TAAK_NAAR_CROSS_MODUS_SLUG[taakId];
//   if (slug) { ... }
//
// Wijzig je hier? Dan effect direct in zowel /vandaag (server) als
// /vandaag-flow (client). DRY, single source of truth.
// ============================================================

export const TAAK_NAAR_CROSS_MODUS_SLUG: Record<string, ItemSlug> = {
  // Sprint dag 1 (vCard-import + sponsor-eerste-bericht)
  "dag1-vcard": ITEM_SLUGS.vcardImport,
  "dag1-sponsor": ITEM_SLUGS.sponsorEersteBericht,

  // Sprint dag 3 (teams-administratie) en dag 4 (bestellinks).
  // Toegevoegd 2026-05-20 (B2). Iemand die teams-admin of bestellinks
  // al via /setup heeft afgevinkt in een andere modus, ziet de taak
  // niet opnieuw als playbook-stap in Sprint.
  "dag3-teams-admin": ITEM_SLUGS.teamsAdminIngericht,
  "dag4-bestellinks": ITEM_SLUGS.bestellinksGekoppeld,

  // Core dag 1 (vCard + sponsor)
  "core-dag1-vcard-import": ITEM_SLUGS.vcardImport,
  "core-dag1-sponsor-bericht": ITEM_SLUGS.sponsorEersteBericht,

  // Core dag 3 (admin-dag: webshop + krediet + teams) en dag 4 (bestellinks).
  // Toegevoegd 2026-05-20 (B2 + completion). Identiek effect als bij
  // Sprint: cross-modus voltooid is overal voltooid.
  "core3-webshop": ITEM_SLUGS.webshopAangemaakt,
  "core3-krediet": ITEM_SLUGS.kredietformulierIngevuld,
  "core3-teams": ITEM_SLUGS.teamsAdminIngericht,
  "core4-bestellinks": ITEM_SLUGS.bestellinksGekoppeld,
};
