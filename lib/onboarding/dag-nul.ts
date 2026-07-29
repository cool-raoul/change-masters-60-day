import { ITEM_SLUGS } from "./sleutels";
import type { VoltooiingStatus } from "./voltooiingen";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// Dag 0 · Jouw voorbereiding — de onboarding- en setup-stappen
// als VOLWAARDIGE dag in de dag-flow (feedback Raoul 28 juli:
// zelfde opbouw als elke andere dag: les + taken + afvinken,
// bereikbaar via /vandaag?dag=0 en de dag-springer).
//
// Herzien 29 juli na Raouls test. Drie principes:
//  1. STARTEN GAAT VOOR. Alleen de vier stappen die je écht nodig
//     hebt om te beginnen zijn verplicht (samen ~10 minuten). De
//     administratie (webshop, krediet, teams-admin, bestellinks)
//     staat eronder als "mag ook later deze week" en blokkeert
//     niets. Wie 'm overslaat, krijgt de rustige setup-pop-up op
//     /vandaag (1× per dag, met "Later vandaag") tot het staat.
//  2. GEEN DUBBELE HOPS. Elke knop gaat naar de plek waar je het
//     werk ECHT doet. Waar een instructiefilm bestaat, speelt die
//     in de stap zelf (filmSlug), zodat je niet eerst naar een
//     uitleg-pagina hoeft die je dan doorstuurt.
//  3. EEN STAP DIE NERGENS HEEN GAAT, BESTAAT NIET. De oude
//     productadvies-taak wees naar /setup/productadvies-test-gedaan,
//     wat een 404 gaf (dat item is 19 mei uit de admin-rail gehaald).
//     Die taak is verwijderd.
//
// De vink-status synct met de bestaande onboarding-administratie
// (onboarding_voltooiingen); afvinken gaat daarna gewoon via
// dag_voltooiingen met dag_nummer 0, zoals elke dag. Andersom zorgt
// TAAK_NAAR_CROSS_MODUS_SLUG ervoor dat afvinken HIER ook de
// admin-rail bijwerkt, zodat de pop-up stopt zodra het gedaan is.
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
  titel: "Jouw voorbereiding: in tien minuten startklaar",
  fase: 1,
  vandaagDoen: [
    // ── Vier stappen die je nodig hebt om te kunnen starten ──
    {
      id: "dag0-app",
      label: "Zet ELEVA op je beginscherm en je meldingen aan",
      uitleg:
        "Zo staat ELEVA tussen je apps en mis je geen seintje van je Mentor of je sponsor. Eén minuutje.",
      verplicht: true,
      actieRoute: "/onboarding?stap=1",
      actieRouteLabel: "Zet mijn meldingen aan →",
    },
    {
      id: "dag0-why",
      label: "Leg jouw WHY vast",
      uitleg:
        "Waarom doe jij dit? Je WHY is wat je draagt op de dagen dat het even taai is. Vijf minuten met de Mentor en hij staat.",
      verplicht: true,
      actieRoute: "/mijn-why",
      actieRouteLabel: "Schrijf mijn WHY →",
    },
    {
      id: "dag0-namen",
      label: "Zet je eerste 5 namen op de lijst",
      uitleg:
        "Vijf mensen die je dit gunt, meer hoeft nog niet. Je kunt ze hier direct invullen, zonder de pagina te verlaten. De rest komt vanzelf in de eerste dagen.",
      verplicht: true,
      inlineEmbed: "namen-form",
      inlineEmbedDoel: 5,
    },
    {
      id: "dag0-tempo",
      label: "Kies je tempo",
      uitleg:
        "Hoeveel tijd heb je per dag? Daar past ELEVA je aantallen en je dag-stappen op aan. Aanpassen kan later altijd.",
      verplicht: true,
      actieRoute: "/onboarding?stap=4",
      actieRouteLabel: "Kies mijn tempo →",
    },

    // ── Administratie: mag ook later deze week, blokkeert niets ──
    {
      id: "dag0-webshop",
      label: "Maak je eigen webshop aan (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag nog niet. Je webshop is de plek waar klanten straks bestellen: eenmalig aanmaken, daarna werkt het vanzelf. De film hieronder laat precies zien hoe. Klaar? Vink 'm hier af.",
      verplicht: false,
      filmSlug: "onboarding-stap-6-webshop",
    },
    {
      id: "dag0-krediet",
      label: "Vul het kredietformulier in (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag nog niet, maar wel voordat er commissies binnenkomen: zonder dit formulier kan er niet uitbetaald worden. De film hieronder loopt het met je door. Klaar? Vink 'm hier af.",
      verplicht: false,
      filmSlug: "onboarding-stap-8-kredietformulier",
    },
    {
      id: "dag0-teams-admin",
      label: "Richt je administratiesysteem in (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag nog niet. Hier houd je straks je team-structuur en je cijfers bij. De film hieronder laat de stappen zien. Klaar? Vink 'm hier af.",
      verplicht: false,
      filmSlug: "core-dag3-teams-admin",
    },
    {
      id: "dag0-bestellinks",
      label: "Koppel je bestellinks aan ELEVA (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag nog niet. Plak je eigen bestellinks per pakket in ELEVA, dan gebruikt het systeem ze automatisch in adviezen en freebies en landen bestellingen bij jou. Opslaan vinkt deze stap meteen voor je af.",
      verplicht: false,
      actieRoute: "/instellingen/bestellinks",
      actieRouteLabel: "Plak mijn bestellinks →",
    },
  ],
  faseDoel:
    "Je kunt starten: je fundament staat, je eerste vijf namen staan, en je weet wat er deze week nog geregeld moet worden.",
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
    {
      actie: "Je bestellinks per pakket",
      menupad: "Instellingen → Bestellinks",
      route: "/instellingen/bestellinks",
    },
  ],
  watJeLeert: `Dit is je dag 0: de dag vóór je eerste echte dag. Vandaag bouw je nog niets aan je business, vandaag zet je klaar wat je nodig hebt.

**Vier dingen zijn nu nodig, samen zo'n tien minuten.** Je meldingen aan, je WHY, je eerste vijf namen en je tempo. Daarmee kun je morgen gewoon beginnen, en weet ELEVA hoe het met je mee moet lopen.

**De administratie mag ook later deze week.** Je webshop, het kredietformulier, je administratiesysteem en je bestellinks: die staan hieronder, maar ze houden je nergens van tegen. Dat is bewust. Wie eerst uren met formulieren bezig moet voordat hij mag starten, is zijn energie kwijt aan het verkeerde. Regel ze op een rustig moment in je eerste dagen; ELEVA herinnert je er zelf één keer per dag aan tot ze staan, en die herinnering kun je altijd wegklikken met "Later vandaag".

Eén ding om te weten: het kredietformulier is de enige die op tijd moet staan, want zonder dat formulier kan er geen commissie naar je toe. Verder bepaal jij het moment.

Alles wat je hier afvinkt, blijft geregeld. En je kunt hier altijd terugkomen: dag 0 blijft gewoon staan, ook als je al onderweg bent.`,
  waaromWerktDit: {
    tekst:
      "Een goede voorbereiding wint niet omdat 'ie perfect is, maar omdat je 'm maar één keer hoeft te doen. En omdat je er niet in blijft hangen.",
    bron: "eigen",
  },
};
