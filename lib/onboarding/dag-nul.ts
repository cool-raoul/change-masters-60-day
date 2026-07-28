import { ITEM_SLUGS } from "./sleutels";
import type { VoltooiingStatus } from "./voltooiingen";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// Dag 0 · Jouw voorbereiding — de onboarding- en setup-stappen
// als VOLWAARDIGE dag in de dag-flow (feedback Raoul 28 juli:
// zelfde opbouw als elke andere dag: les + taken + afvinken,
// bereikbaar via /vandaag?dag=0 en de dag-springer).
//
// De vink-status synct met de bestaande onboarding-administratie
// (onboarding_voltooiingen); afvinken gaat daarna gewoon via
// dag_voltooiingen met dag_nummer 0, zoals elke dag.
// Inhoud en volgorde: hier in één bestand aan te passen.
// ============================================================

/** Welke onboarding-slugs dekken welke dag 0-taak (voor auto-sync). */
export const DAG0_TAAK_SLUGS: Record<
  string,
  { slugs: string[]; eenVanDe?: boolean }
> = {
  "dag0-app": {
    slugs: [ITEM_SLUGS.appGeinstalleerd, ITEM_SLUGS.pushAan],
    eenVanDe: true,
  },
  "dag0-why": { slugs: [ITEM_SLUGS.why] },
  "dag0-namen": { slugs: [ITEM_SLUGS.eersteVijfNamen] },
  "dag0-tempo": {
    slugs: [ITEM_SLUGS.modusKeuzeTempo, ITEM_SLUGS.modusKeuzeDtt],
    eenVanDe: true,
  },
  "dag0-webshop": { slugs: [ITEM_SLUGS.webshopAangemaakt] },
  "dag0-krediet": { slugs: [ITEM_SLUGS.kredietformulierIngevuld] },
  "dag0-teams-admin": { slugs: [ITEM_SLUGS.teamsAdminIngericht] },
  "dag0-bestellinks": { slugs: [ITEM_SLUGS.bestellinksGekoppeld] },
  "dag0-productadvies": { slugs: [ITEM_SLUGS.productadviesTestGedaan] },
};

/** Is een dag 0-taak al gedaan volgens de (cross-modus) onboarding-administratie? */
export function dag0TaakKlaarVolgensOnboarding(
  taakId: string,
  voltooiingen: Map<string, VoltooiingStatus>,
): boolean {
  const def = DAG0_TAAK_SLUGS[taakId];
  if (!def) return false;
  const check = (slug: string) => voltooiingen.get(slug)?.voltooid === true;
  return def.eenVanDe ? def.slugs.some(check) : def.slugs.every(check);
}

/** Dag 0 als volwaardige dag voor de vandaag-flow. */
export const DAG_NUL: Dag = {
  nummer: 0,
  titel: "Jouw voorbereiding: alles klaarzetten voor je start",
  fase: 1,
  vandaagDoen: [
    {
      id: "dag0-app",
      label: "Zet ELEVA op je beginscherm en zet je meldingen aan",
      uitleg:
        "Zo staat ELEVA altijd tussen je apps en mis je geen enkel seintje van je Mentor of je sponsor.",
      verplicht: true,
      actieRoute: "/onboarding",
      actieRouteLabel: "Open de start-stappen →",
    },
    {
      id: "dag0-why",
      label: "Leg jouw WHY vast",
      uitleg:
        "Waarom doe jij dit? Je WHY is wat je draagt op de dagen dat het even taai is. Vijf minuten met de Mentor en hij staat.",
      verplicht: true,
      actieRoute: "/mijn-why",
      actieRouteLabel: "Naar mijn WHY →",
    },
    {
      id: "dag0-namen",
      label: "Zet je eerste 5 namen op de lijst",
      uitleg:
        "Vijf mensen die je dit gunt. Meer hoeft nog niet: de rest komt vanzelf in de eerste dagen.",
      verplicht: true,
      actieRoute: "/namenlijst",
      actieRouteLabel: "Naar mijn namenlijst →",
    },
    {
      id: "dag0-tempo",
      label: "Kies je tempo",
      uitleg:
        "Hoeveel tijd heb je per dag? Daar past ELEVA je aantallen en je dag-stappen op aan.",
      verplicht: true,
      actieRoute: "/onboarding",
      actieRouteLabel: "Open de start-stappen →",
    },
    {
      id: "dag0-webshop",
      label: "Maak je eigen webshop aan",
      uitleg:
        "Jouw webshop is de plek waar klanten straks bestellen. Eenmalig aanmaken, daarna werkt alles vanzelf.",
      verplicht: true,
      actieRoute: "/setup/webshop-aangemaakt",
      actieRouteLabel: "Open de uitleg + film →",
    },
    {
      id: "dag0-krediet",
      label: "Vul het kredietformulier in",
      uitleg: "Eenmalig regelen, dan staat je account administratief goed.",
      verplicht: true,
      actieRoute: "/setup/kredietformulier-ingevuld",
      actieRouteLabel: "Open de uitleg + film →",
    },
    {
      id: "dag0-teams-admin",
      label: "Richt je administratiesysteem in",
      uitleg: "Zo houd je vanaf dag één overzicht over je mensen.",
      verplicht: true,
      actieRoute: "/setup/teams-admin-ingericht",
      actieRouteLabel: "Open de uitleg + film →",
    },
    {
      id: "dag0-bestellinks",
      label: "Koppel je bestellinks aan ELEVA",
      uitleg:
        "Dan kan ELEVA jouw links gebruiken in adviezen en freebies, zodat bestellingen bij jou landen.",
      verplicht: true,
      actieRoute: "/setup/bestellinks-gekoppeld",
      actieRouteLabel: "Open de uitleg + film →",
    },
    {
      id: "dag0-productadvies",
      label: "Doe zelf de productadvies-test",
      uitleg:
        "Ervaar zelf wat je prospects straks ervaren, dan kun je er ook over vertellen.",
      verplicht: false,
      actieRoute: "/setup/productadvies-test-gedaan",
      actieRouteLabel: "Open de uitleg + film →",
    },
  ],
  faseDoel:
    "Alles staat klaar voordat je dag 1 begint: je fundament, je gereedschap en je eerste vijf namen.",
  waarInEleva: [
    {
      actie: "Start-stappen opnieuw doorlopen",
      menupad: "Deze pagina → open een stap",
      route: "/onboarding",
    },
    {
      actie: "Administratieve stappen met uitleg-films",
      menupad: "Instellingen → Administratieve stappen",
      route: "/setup",
    },
  ],
  watJeLeert: `Dit is je dag 0: de dag vóór je eerste echte dag.

Vandaag bouw je nog niks aan je business, vandaag zet je alles klaar. Je WHY, je eerste vijf namen, je webshop, je administratie. Saai werk? Misschien. Maar wie dit nu regelt, hoeft er straks nooit meer over na te denken en kan vanaf dag 1 al zijn aandacht aan mensen geven.

Alles wat je hier afvinkt, blijft geregeld. En je kunt hier altijd terugkomen: dag 0 blijft gewoon staan, ook als je al onderweg bent.`,
  waaromWerktDit: {
    tekst:
      "Een goede voorbereiding wint niet omdat 'ie perfect is, maar omdat je 'm maar één keer hoeft te doen.",
    bron: "eigen",
  },
};
