/**
 * ELEVA features registry, SINGLE SOURCE OF TRUTH
 * -------------------------------------------------
 * Dit bestand is de enige plek waar user-facing features worden beschreven.
 * De rondleiding (components/rondleiding/Rondleiding.tsx) leest hieruit.
 * Een toekomstige /functies pagina of sidebar-documentatie kan dit ook
 * gebruiken.
 *
 * BELANGRIJK:
 *   - Als je een nieuwe feature toevoegt aan de app: voeg hier een entry toe.
 *   - Als je een feature verwijdert: haal de entry weg.
 *   - Als je gedrag wijzigt: update de bullets/wow hier ook.
 * Zonder die update loopt de rondleiding uit de pas met wat de app werkelijk
 * kan, en dat is het enige wat dit systeem stuk maakt.
 *
 * Velden:
 *   id, unieke key (stabiel, zelfs als de titel verandert)
 *   emoji, icoon dat bovenaan groot wordt getoond
 *   titel, korte kop (5-8 woorden)
 *   lead, 1 zin die de scene zet
 *   bullets, 3-5 concrete dingen die je met de feature kan doen
 *   wow, "waarom dit telt" quote (< 40 woorden, uit-je-stoel-tekst)
 *   route, optionele link naar de betreffende pagina
 *   premiumOnly, true als de feature alleen voor premium-users is
 *   rollen, welke rollen deze feature mogen zien (default: alle).
 *           Een member hoort niet eens te weten dat een founder-CMS bestaat,
 *           dus filter ALTIJD op rol bij het tonen aan een gebruiker.
 *   volgorde, lager nummer = eerder in de rondleiding
 *   inRondleiding, zet op false om te verbergen in de tour (maar wel
 *                   een geregistreerde feature te blijven voor /functies)
 */

export type Rol = "member" | "leider" | "founder";

export type Feature = {
  id: string;
  emoji: string;
  titel: string;
  lead: string;
  bullets: string[];
  wow: string;
  route?: string;
  premiumOnly?: boolean;
  /** Welke rollen mogen deze feature zien? Default = ['member', 'leider', 'founder']. */
  rollen?: Rol[];
  volgorde: number;
  inRondleiding?: boolean;
};

/** Default-rollen als een feature geen `rollen`-veld heeft: zichtbaar voor iedereen. */
const ALLE_ROLLEN: Rol[] = ["member", "leider", "founder"];

/** Bepaalt of een feature zichtbaar is voor een gegeven rol. */
export function featureZichtbaarVoor(feature: Feature, rol: Rol): boolean {
  const rollen = feature.rollen ?? ALLE_ROLLEN;
  return rollen.includes(rol);
}

export const FEATURES: Feature[] = [
  {
    id: "dashboard",
    emoji: "🏠",
    titel: "Dashboard, jouw command center",
    lead: "Elke dag begint hier. In 30 seconden weet je wat vandaag telt.",
    bullets: [
      "Dag-teller (dag X van 60) en voortgangsbalk",
      "Dagelijkse activiteiten loggen (contacten, uitnodigingen, presentaties)",
      "Snelle pijplijn-blik: hoeveel prospects zitten in welke fase",
      "Openstaande herinneringen en jouw WHY altijd in zicht",
    ],
    wow: "Open 's ochtends ELEVA. Klaar = je weet precies wat vandaag je focus is.",
    route: "/dashboard",
    volgorde: 10,
    inRondleiding: true,
  },
  {
    id: "namenlijst",
    emoji: "👥",
    titel: "Namenlijst, je pipeline visueel in beeld",
    lead: "Al je prospects visueel, van eerste contact tot member.",
    bullets: [
      "Sleep prospects tussen fases: prospect → in gesprek → uitgenodigd → presentatie → follow-up → shopper → member",
      "Elke kaart toont prioriteit, laatste contact, volgende stap",
      "Klik op een naam voor alle details, notities en contact-historie",
      "Sorteer zelf binnen een fase, belangrijkste bovenaan",
    ],
    wow: "Nooit meer iemand vergeten die aan het rijpen is.",
    route: "/namenlijst",
    volgorde: 20,
    inRondleiding: true,
  },
  {
    id: "radar",
    emoji: "🎯",
    titel: "Volgende-beste-actie radar",
    lead:
      "Een dashboard-tegel met je top-3 prospects van vandaag. Niet alfabetisch, niet alle 47.",
    bullets: [
      "ELEVA weegt timing (hoe lang geleden contact) en pipeline-fase",
      "Signalen tellen mee: heeft prospect een film bekeken? Een testlink ingevuld?",
      "Drie namen, drie acties: dag opent zonder 'waar begin ik?'",
      "Schuift mee naarmate de dag voortgaat, bovenaan blijft wat NU rendement geeft",
    ],
    wow: "Verlost je van 'waar begin ik?'. ELEVA bekijkt je hele lijst en zegt: hier ligt vandaag je beste gesprek.",
    route: "/dashboard",
    volgorde: 25,
    inRondleiding: true,
  },
  {
    id: "prospect-films",
    emoji: "📺",
    titel: "Prospect-films sturen + tracken",
    lead:
      "Stuur een film, krijg te horen wanneer 'ie wordt afgekeken. Films werken voor je terwijl je slaapt.",
    bullets: [
      "Op een prospect-kaart: 'Stuur film' → kies → krijg unieke share-link",
      "Realtime kijk-percentage (YouTube + Vimeo)",
      "Bij ~80% gekeken: pipeline schuift naar follow-up + push naar member",
      "De juiste opvolg-tekst staat klaar op de kaart, klaar om te kopiëren",
      "Geen 'heb je 'm bekeken?'-appjes meer",
    ],
    wow:
      "Je telefoon trilt 's avonds: \"Maria heeft 73% van [film] bekeken.\" Pipeline staat al goed, opvolg-tekst klaar. Je hebt nog niets hoeven typen.",
    volgorde: 27,
    inRondleiding: true,
  },
  {
    id: "spraak-fab",
    emoji: "🎙️",
    titel: "Spraak-knop, DE killer-feature",
    lead: "De ronde goudknop rechtsonder. Dit is waar ELEVA magisch wordt.",
    bullets: [
      "Druk in, spreek natuurlijk wat je net hebt gedaan",
      "ELEVA begrijpt wie, wat, wanneer en voert het UIT in de app",
      "22+ commando's: prospects, fases, notities, herinneringen, bestellingen, correcties, navigatie, verwijderen, herstellen",
      "Je kan blijven bijspreken en corrigeren voordat je opslaat",
      "Volledige lijst met voorbeeldzinnen via Sidebar → Spraak-commando's",
    ],
    wow:
      "\"Sprak Maria bij de sportschool, wil zaterdag een presentatie, herinner me donderdag om haar te appen.\" → prospect aangemaakt, fase op 'uitgenodigd', follow-up voor donderdag ingepland, contact gelogd. Zonder één klik. Dit scheelt 20 minuten admin per dag.",
    volgorde: 30,
    inRondleiding: true,
  },
  {
    id: "spraak-commandos",
    emoji: "📖",
    titel: "Spraak-commando's, naslagwerk",
    lead: "De volledige lijst met alles wat je kunt inspreken, gesorteerd per categorie.",
    bullets: [
      "Prospects, activiteit, bestellingen, herinneringen, correcties, verwijderen, navigatie, mentor",
      "Voorbeeldzinnen per commando, je hoeft niet letterlijk te kopiëren",
      "Tips per categorie om het snel onder de knie te krijgen",
      "Altijd bereikbaar via Sidebar → 🎙️ Spraak-commando's",
    ],
    wow: "Geen gedoe met onthouden wat ELEVA snapt, één pagina met alles. Zie een commando, spreek het in, klaar.",
    route: "/spraak-commandos",
    volgorde: 35,
    inRondleiding: true,
  },
  {
    id: "coach",
    emoji: "🤖",
    titel: "ELEVA Mentor, 24/7 mentor in je broekzak",
    lead: "Een AI-mentor die jouw methodiek kent en altijd tijd heeft.",
    bullets: [
      "Vraag alles: bezwaren pareren, uitnodigings-tekst, 3-wegen gesprek voorbereiden, closing, mindset",
      "Stel je vraag over een specifieke prospect, de mentor kent de context",
      "Founders trainen 'm continu met echte WhatsApp-voorbeelden (zie Train-de-Mentor)",
      "Premium: productadvies met medische disclaimer, onbeperkte gesprekken, voorrang",
      "Eerdere gesprekken terug te vinden, zodat je nooit iets kwijt bent",
    ],
    wow:
      "\"Maria zegt: ik heb er geen geld voor, wat zeg ik?\" → binnen 3 seconden een antwoord op maat, getraind op jouw aanpak.",
    route: "/coach",
    volgorde: 40,
    inRondleiding: true,
  },
  {
    id: "voice-uitnodiging",
    emoji: "🎙️",
    titel: "Spraak-naar-uitnodiging",
    lead:
      "Microfoon-knop op de prospect-kaart. Spreek de context, krijg de DM in jouw stijl.",
    bullets: [
      "Spreek context in: 'ken Maria van sportschool, business-getypt, druk leven'",
      "ELEVA bouwt Worre's 4-stappen-uitnodiging in jouw stijl",
      "'Haast'-stap als optionele toevoeging voor business-prospects",
      "Kopieer de DM, plak in WhatsApp, klaar",
      "De drempel naar 'eerste bericht' wordt minimaal",
    ],
    wow:
      "Geen perfectie-val, geen 'wat schrijf ik nou'. Spreken in plaats van staren naar een leeg WhatsApp-vlak.",
    volgorde: 42,
    inRondleiding: true,
  },
  {
    id: "team-presence",
    emoji: "🟢",
    titel: "Online-stip + privacy-toggle",
    lead:
      "Zie wie van je team NU bezig is. En één toggle voor wie liever niet zichtbaar is.",
    bullets: [
      "Groen bolletje op teamleden die binnen 2 minuten activiteit hadden",
      "Sponsor weet wanneer een opmerking direct landt, jij weet wanneer iemand bereikbaar is",
      "Werkt twee kanten op: jouw stip is óók zichtbaar voor je sponsor",
      "Niet prettig? Eén toggle in /instellingen → bolletje uit",
      "Aparte transparantie-pagina: 'Wat ziet mijn sponsor van mij?'",
    ],
    wow:
      "Niemand staat alleen, niemand staat onder een microscoop. Privacy is jouw keuze, niet een vinkje verstopt in een terms-of-service.",
    route: "/instellingen/wat-ziet-mijn-sponsor",
    volgorde: 55,
    inRondleiding: true,
  },
  {
    id: "herinneringen",
    emoji: "🔔",
    titel: "Herinneringen, je brein hoeft niks te onthouden",
    lead: "Alle follow-ups automatisch op de juiste stapel.",
    bullets: [
      "Verlopen (rood), vandaag (goud), komende 7 dagen (blauw), later (grijs)",
      "Voltooi met één klik of schuif naar een nieuwe datum",
      "Verschijnt automatisch wanneer je via spraak zegt \"herinner me...\"",
      "Telling in de topbar rechts, zodat je nooit iets mist",
    ],
    wow: "Jij focust op gesprekken. ELEVA houdt de lijsten bij.",
    route: "/herinneringen",
    volgorde: 50,
    inRondleiding: true,
  },
  {
    id: "acties",
    emoji: "🎯",
    titel: "Volgende acties, je DMO-outbox",
    lead: "Eén pagina. Vandaag + verlopen. Klik op het juiste icoon en doen.",
    bullets: [
      "Alleen wat NU telt, geen \"later\" ruis, geen beheer-modus",
      "Direct-klik iconen: WhatsApp, bellen, e-mail, Instagram, Facebook, zonder prospect-kaart te openen",
      "Volledige herinnerings-tekst al zichtbaar, je ziet meteen waar het over ging",
      "Afvinken met één klik als je hem gedaan hebt",
      "Via spraak: \"Wat moet ik vandaag doen?\" / \"Wie staat op me te wachten?\"",
    ],
    wow: "Van \"ik moet nog iemand appen...\" naar klaar in 2 seconden. Dit is waar de DMO in de praktijk gebeurt.",
    route: "/acties",
    volgorde: 45,
    inRondleiding: true,
  },
  {
    id: "productadvies-vragenlijst",
    emoji: "📋",
    titel: "Productadvies-vragenlijst, voor je prospect",
    lead: "Eén link delen. Prospect doet de vragenlijst. Jij krijgt zijn advies op zijn kaart.",
    bullets: [
      "Stuur per persoon vanaf de prospect-kaart, of deel je hergebruikbare open link op social media",
      "Prospect doet 30 uitspraken (~3 minuten) en krijgt een persoonlijk pakket-advies",
      "Optionele vervolgvragenlijst (15 vragen) bepaalt of een darmprogramma past, basis of plus",
      "Pipeline schuift automatisch door en je krijgt een herinnering om op te volgen",
      "Privacy: alleen de uitkomst belandt op de kaart, geen individuele antwoorden",
    ],
    wow: "Je prospect ontdekt zelf welk pakket bij 'm past, jij hoeft niet te verkopen, alleen samen kijken.",
    volgorde: 35,
    inRondleiding: true,
  },
  {
    id: "premium",
    emoji: "🌟",
    titel: "Premium, €2/mnd, onbeperkt alles",
    lead: "De kracht van ELEVA volledig ontketend voor de prijs van een koffie.",
    bullets: [
      "Onbeperkt chatten met de ELEVA Mentor",
      "Onbeperkte spraak-opnames (geen limieten)",
      "Voorrang bij drukte + early-access nieuwe features",
      "Een deel van je bijdrage gaat naar de Lifeplus Foundation",
      "Betaal met iDEAL, kaart of Apple/Google Pay, maandelijks opzegbaar",
    ],
    wow: "Als je serieus bent met je 60-day run, is €2/mnd het snelste rendement dat je kan boeken.",
    route: "/premium",
    volgorde: 60,
    inRondleiding: true,
  },
  // ============================================================
  // FOUNDER-ONLY features. Members en leiders zien deze NIET, ook niet
  // in de rondleiding of in /over-eleva. Bewust verborgen, want het
  // CMS-werk hoort bij de hoofdbeheerder, niet bij de gewone gebruiker.
  // ============================================================
  {
    id: "founder-films-cms",
    emoji: "🎬",
    titel: "Films-CMS",
    lead:
      "Beheer alle films die in onboarding, dag-tegels en prospect-flow worden gebruikt.",
    bullets: [
      "YouTube of Vimeo URL plakken, embed gebeurt automatisch",
      "Per slot: welkomstfilm, prospect-films, dag-films (1 t/m 21)",
      "Tonen-toggle om een film tijdelijk te verbergen zonder verwijderen",
      "Iedereen ziet ze direct op de juiste plek, geen deploy nodig",
    ],
    wow: "Eén centrale bibliotheek voor het hele systeem. Plakken, opslaan, live.",
    route: "/instellingen/films",
    rollen: ["founder"],
    volgorde: 70,
    inRondleiding: true,
  },
  {
    id: "founder-mentor-trainen",
    emoji: "🧠",
    titel: "Train-de-Mentor",
    lead:
      "Voeg vraag-antwoord-voorbeelden uit echte WhatsApp-gesprekken toe. De Mentor leert direct van jouw aanpak.",
    bullets: [
      "Plak een prospect-vraag en het antwoord dat werkte",
      "Tag op doelgroep (member / prospect / beide)",
      "Mentor gebruikt voorbeelden vanaf direct als context",
      "Zonder developer-loop, zonder herstart, scherper per pilot-week",
    ],
    wow:
      "Members in Maastricht leren van gesprekken die in Dordrecht hebben gewerkt. Het hele systeem leert uit jouw praktijk.",
    route: "/instellingen/mentor-trainen",
    rollen: ["founder"],
    volgorde: 72,
    inRondleiding: true,
  },
  {
    id: "founder-bewerkbaar",
    emoji: "✍️",
    titel: "Founder-bewerkbaar (jij bent de redacteur)",
    lead:
      "Op vrijwel elke tekst in ELEVA staat een ✍️-knop. Klik, pas aan, direct live voor alle members.",
    bullets: [
      "Werkt op alle 21 playbook-dag-teksten",
      "Werkt op alle scripts (uitnodiging, bezwaar, follow-up, sluiting, edification)",
      "Werkt op de kerntitels van alle onboarding-stappen",
      "Wijzigingen zijn meteen live, geen deploy nodig",
    ],
    wow: "Pilot-feedback over woordkeus binnen? Pas aan, klaar. Geen developer-loop.",
    rollen: ["founder"],
    volgorde: 74,
    inRondleiding: true,
  },
  {
    id: "founder-bestellinks",
    emoji: "🛒",
    titel: "Bestellinks per pakket",
    lead:
      "Koppel je Lifeplus-webshop URL aan elk pakket. ELEVA gebruikt die links automatisch in productadvies-flows.",
    bullets: [
      "Per pakket één URL invullen",
      "Members zien jouw eigen verkooplink in alle delen-acties",
      "Eén keer instellen, rest gaat automatisch",
    ],
    wow: "Geen handmatig knip-werk meer met links per advies.",
    route: "/instellingen/bestellinks",
    rollen: ["founder"],
    volgorde: 76,
    inRondleiding: true,
  },
];

/**
 * Geeft alle features in volgorde, gefilterd op rol als opgegeven.
 * Zonder rol = alle features (handig voor /functies admin-overzicht).
 */
export function featuresVoorRol(rol?: Rol): Feature[] {
  return FEATURES.filter((f) => (rol ? featureZichtbaarVoor(f, rol) : true)).sort(
    (a, b) => a.volgorde - b.volgorde,
  );
}

/**
 * Stappen voor de in-app rondleiding, gefilterd op rol als opgegeven.
 * Geen rol = toon alle in-rondleiding features (alleen voor admin/preview).
 */
export function rondleidingFeatures(rol?: Rol): Feature[] {
  return FEATURES.filter(
    (f) =>
      f.inRondleiding !== false && (rol ? featureZichtbaarVoor(f, rol) : true),
  ).sort((a, b) => a.volgorde - b.volgorde);
}
