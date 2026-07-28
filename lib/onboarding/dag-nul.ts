import { ITEM_SLUGS } from "./sleutels";
import type { VoltooiingStatus } from "./voltooiingen";

// ============================================================
// Dag 0 · Jouw voorbereiding — de onboarding- en setup-stappen
// als onderdeel van de dag-flow (feedback Raoul 28 juli: niet
// meer los van dag 1, altijd terug te vinden op /lessen/0).
//
// Eén centrale definitie; de vink-status komt uit de bestaande
// onboarding_voltooiingen (cross-modus), er is GEEN nieuwe
// opslag. Volgorde en inhoud zijn hier in één bestand aan te
// passen zodra Raoul de definitieve dag-indeling vastlegt.
// ============================================================

export type DagNulStap = {
  id: string;
  icoon: string;
  label: string;
  uitleg: string;
  href: string;
  /** Onboarding-slugs die deze stap dekken. */
  slugs: string[];
  /** true = één van de slugs is genoeg (bijv. tempo-keuze per modus). */
  eenVanDe?: boolean;
};

export const DAG_NUL_STAPPEN: DagNulStap[] = [
  {
    id: "app",
    icoon: "📱",
    label: "ELEVA op je beginscherm + meldingen aan",
    uitleg:
      "Zo staat ELEVA altijd tussen je apps en mis je geen enkel seintje.",
    href: "/onboarding",
    slugs: [ITEM_SLUGS.appGeinstalleerd, ITEM_SLUGS.pushAan],
    eenVanDe: true,
  },
  {
    id: "why",
    icoon: "💛",
    label: "Jouw WHY vastleggen",
    uitleg:
      "Waarom doe jij dit? Je WHY is wat je draagt op de dagen dat het even taai is.",
    href: "/mijn-why",
    slugs: [ITEM_SLUGS.why],
  },
  {
    id: "namen",
    icoon: "✍️",
    label: "Je eerste 5 namen op de lijst",
    uitleg: "Vijf mensen die je dit gunt. Meer hoeft nog niet.",
    href: "/namenlijst",
    slugs: [ITEM_SLUGS.eersteVijfNamen],
  },
  {
    id: "tempo",
    icoon: "⚡",
    label: "Je tempo kiezen",
    uitleg:
      "Hoeveel tijd heb je per dag? Daar past ELEVA je aantallen op aan.",
    href: "/onboarding",
    slugs: [ITEM_SLUGS.modusKeuzeTempo, ITEM_SLUGS.modusKeuzeDtt],
    eenVanDe: true,
  },
  {
    id: "webshop",
    icoon: "🛒",
    label: "Je eigen webshop aanmaken",
    uitleg: "Jouw webshop is de plek waar klanten straks bestellen.",
    href: "/setup/webshop-aangemaakt",
    slugs: [ITEM_SLUGS.webshopAangemaakt],
  },
  {
    id: "krediet",
    icoon: "✅",
    label: "Kredietformulier invullen",
    uitleg: "Eenmalig regelen, dan staat je account administratief goed.",
    href: "/setup/kredietformulier-ingevuld",
    slugs: [ITEM_SLUGS.kredietformulierIngevuld],
  },
  {
    id: "teams-admin",
    icoon: "📋",
    label: "Administratiesysteem inrichten",
    uitleg: "Zo houd je vanaf dag één overzicht over je mensen.",
    href: "/setup/teams-admin-ingericht",
    slugs: [ITEM_SLUGS.teamsAdminIngericht],
  },
  {
    id: "bestellinks",
    icoon: "🔗",
    label: "Bestellinks koppelen aan ELEVA",
    uitleg: "Dan kan ELEVA jouw links gebruiken in adviezen en freebies.",
    href: "/setup/bestellinks-gekoppeld",
    slugs: [ITEM_SLUGS.bestellinksGekoppeld],
  },
  {
    id: "productadvies",
    icoon: "🧪",
    label: "De productadvies-test zelf doen",
    uitleg:
      "Ervaar zelf wat je prospects straks ervaren, dan kun je er ook over vertellen.",
    href: "/setup/productadvies-test-gedaan",
    slugs: [ITEM_SLUGS.productadviesTestGedaan],
  },
];

/** Is een dag 0-stap klaar volgens de (cross-modus) voltooiingen-map? */
export function dagNulStapKlaar(
  stap: DagNulStap,
  voltooiingen: Map<string, VoltooiingStatus>,
): boolean {
  const check = (slug: string) => voltooiingen.get(slug)?.voltooid === true;
  return stap.eenVanDe ? stap.slugs.some(check) : stap.slugs.every(check);
}
