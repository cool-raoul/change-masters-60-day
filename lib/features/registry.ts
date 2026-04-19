/**
 * ELEVA features registry — SINGLE SOURCE OF TRUTH
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
 *   id          — unieke key (stabiel, zelfs als de titel verandert)
 *   emoji       — icoon dat bovenaan groot wordt getoond
 *   titel       — korte kop (5-8 woorden)
 *   lead        — 1 zin die de scene zet
 *   bullets     — 3-5 concrete dingen die je met de feature kan doen
 *   wow         — "waarom dit telt" quote (< 40 woorden, uit-je-stoel-tekst)
 *   route       — optionele link naar de betreffende pagina
 *   premiumOnly — true als de feature alleen voor premium-users is
 *   volgorde    — lager nummer = eerder in de rondleiding
 *   inRondleiding — zet op false om te verbergen in de tour (maar wel
 *                   een geregistreerde feature te blijven voor /functies)
 */

export type Feature = {
  id: string;
  emoji: string;
  titel: string;
  lead: string;
  bullets: string[];
  wow: string;
  route?: string;
  premiumOnly?: boolean;
  volgorde: number;
  inRondleiding?: boolean;
};

export const FEATURES: Feature[] = [
  {
    id: "dashboard",
    emoji: "🏠",
    titel: "Dashboard — jouw command center",
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
    titel: "Namenlijst — je pijplijn als Kanban",
    lead: "Al je prospects visueel, van eerste contact tot member.",
    bullets: [
      "Sleep prospects tussen fases: prospect → uitgenodigd → presentatie → follow-up → shopper → member",
      "Elke kaart toont prioriteit, laatste contact, volgende stap",
      "Klik op een naam voor alle details, notities en contact-historie",
      "Sorteer zelf binnen een fase — belangrijkste bovenaan",
    ],
    wow: "Nooit meer iemand vergeten die aan het rijpen is.",
    route: "/namenlijst",
    volgorde: 20,
    inRondleiding: true,
  },
  {
    id: "spraak-fab",
    emoji: "🎙️",
    titel: "Spraak-knop — DE killer-feature",
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
    titel: "Spraak-commando's — naslagwerk",
    lead: "De volledige lijst met alles wat je kunt inspreken, gesorteerd per categorie.",
    bullets: [
      "Prospects, activiteit, bestellingen, herinneringen, correcties, verwijderen, navigatie, mentor",
      "Voorbeeldzinnen per commando — je hoeft niet letterlijk te kopiëren",
      "Tips per categorie om het snel onder de knie te krijgen",
      "Altijd bereikbaar via Sidebar → 🎙️ Spraak-commando's",
    ],
    wow: "Geen gedoe met onthouden wat ELEVA snapt — één pagina met alles. Zie een commando, spreek het in, klaar.",
    route: "/spraak-commandos",
    volgorde: 35,
    inRondleiding: true,
  },
  {
    id: "coach",
    emoji: "🤖",
    titel: "ELEVA Mentor — 24/7 coach in je broekzak",
    lead: "Een AI-mentor die jouw methodiek kent en altijd tijd heeft.",
    bullets: [
      "Vraag alles: bezwaren pareren, uitnodigings-tekst, 3-wegen gesprek voorbereiden, closing, mindset",
      "Stel je vraag over een specifieke prospect — de mentor kent de context",
      "Premium: productadvies met medische disclaimer, onbeperkte gesprekken, voorrang",
      "Eerdere gesprekken terug te vinden, zodat je nooit iets kwijt bent",
    ],
    wow:
      "\"Maria zegt: ik heb er geen geld voor — wat zeg ik?\" → binnen 3 seconden een antwoord op maat, getraind op jouw aanpak.",
    route: "/coach",
    volgorde: 40,
    inRondleiding: true,
  },
  {
    id: "herinneringen",
    emoji: "🔔",
    titel: "Herinneringen — je brein hoeft niks te onthouden",
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
    id: "premium",
    emoji: "🌟",
    titel: "Premium — €2/mnd, onbeperkt alles",
    lead: "De kracht van ELEVA volledig ontketend voor de prijs van een koffie.",
    bullets: [
      "Onbeperkt chatten met de ELEVA Mentor",
      "Onbeperkte spraak-opnames (geen limieten)",
      "Voorrang bij drukte + early-access nieuwe features",
      "Een deel van je bijdrage gaat naar de Lifeplus Foundation",
      "Betaal met iDEAL, kaart of Apple/Google Pay — maandelijks opzegbaar",
    ],
    wow: "Als je serieus bent met je 60-day run, is €2/mnd het snelste rendement dat je kan boeken.",
    route: "/premium",
    volgorde: 60,
    inRondleiding: true,
  },
];

export function rondleidingFeatures(): Feature[] {
  return FEATURES.filter((f) => f.inRondleiding !== false).sort(
    (a, b) => a.volgorde - b.volgorde
  );
}
