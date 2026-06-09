// File: app/ontdek-eleva/features.ts
//
// Alle ELEVA-features die op de showcase verschijnen. Volgorde =
// belangrijkheid (Sprint/Core/Pro eerst, dan ondersteunende lagen).
// Founder kan elke titel/pitch/waarom-tekst via EditableTekst aanpassen.

export type Feature = {
  sleutel: string;
  emoji: string;
  titel: string;
  pitch: string;
  waarom: string;
};

export const FEATURES: Feature[] = [
  {
    sleutel: "core",
    emoji: "🌱",
    titel: "Core, 21 dagen fundament leggen",
    pitch:
      "Voor wie rustig wil bouwen vanuit eigen tempo. Dag 1-21 als helder fundament, daarna groei vanaf je eigen ritme. Het meest gekozen pad.",
    waarom:
      "Past bij wie een gestructureerd pad zoekt naar een eigen webshop-business, zonder de hoge intensiteit van een 60-dagen-sprint.",
  },
  {
    sleutel: "pro",
    emoji: "💎",
    titel: "Pro, voor professionals met cliënten",
    pitch:
      "15-stappen-leerpad voor coaches, therapeuten en beauty-pro's. Productadvies-test als tool voor hun cliënten, business-laag eronder.",
    waarom:
      "Een eigen track die past bij hun bestaande praktijk, zonder hen in een verkoop-rol te dwingen.",
  },
  {
    sleutel: "sprint",
    emoji: "🚀",
    titel: "Sprint, 60 dagen tot je eerste team",
    pitch:
      "Een dagelijks playbook van 60 dagen voor wie volle bak wil. Exclusief voor de doorzetters die in 60 dagen hun eerste team neerzetten.",
    waarom:
      "Niet voor iedereen, wel voor wie deze intensiteit zoekt. Elke dag een helder anker, een actie, en een sponsor-checkin.",
  },
  {
    sleutel: "mentor",
    emoji: "🤖",
    titel: "ELEVA Mentor, je AI-coach 24/7",
    pitch:
      "Een coach in je broekzak. Claim-vrij, in jullie stem, met partner-check, Academy-kennis en up-to-date over alle features.",
    waarom:
      "Of het nu een script vragen is, een bezwaar uitwerken, of een DM-twijfel, je krijgt direct advies in jullie taal.",
  },
  {
    sleutel: "namenlijst",
    emoji: "📋",
    titel: "Namenlijst, je hele pijplijn in beeld",
    pitch:
      "Iedereen die je ooit hebt gesproken, met fase, prioriteit, herinneringen en alle context. Pipeline-view of lijst-view.",
    waarom:
      "Nooit meer iemand vergeten, altijd weten welke stap als eerste te doen. Plus push-meldingen bij elke beweging.",
  },
  {
    sleutel: "mini-eleva",
    emoji: "💌",
    titel: "Mini-ELEVA, prospects warm uitnodigen",
    pitch:
      "Stuur een prospect een persoonlijke link met films, verhalen, FAQ en je why. Zij ervaren ELEVA voordat jij iets uitlegt.",
    waarom:
      "Geen meer 'mag ik je iets vertellen?' Wel een ervaring die hen warm maakt zonder dat jij druk hoeft te zetten.",
  },
  {
    sleutel: "freebies",
    emoji: "🎁",
    titel: "Freebie-bots met heat-score",
    pitch:
      "Drie score-bots klaar: Energie & Focus, Hormonen & Overgang, en de Holistic Reset-check. Leads komen automatisch in je pijplijn met heat-score.",
    waarom:
      "Jij deelt 1 link, de bot doet de filter, jij belt alleen de heetste leads. Plus 5-mail-sequence automatisch.",
  },
  {
    sleutel: "scripts",
    emoji: "✍️",
    titel: "Scripts-bibliotheek, in jullie stem",
    pitch:
      "Aansluiten, uitnodigen, opvolgen, dienstverlening, voor elke fase de juiste woorden. Claim-vrij, zonder em-dashes, in Raoul en Gaby's toon.",
    waarom:
      "Niet meer staren naar een lege WhatsApp. Kopiëren, jouw versie maken, versturen.",
  },
  {
    sleutel: "academy",
    emoji: "🎓",
    titel: "Academy, leren onderweg",
    pitch:
      "DMO-mindset, Spreken-zoals-het-raakt, claim-vrije communicatie. Audio-lessen die je kunt luisteren onderweg.",
    waarom:
      "Geen vooraf-cursus, geen overweldigende theorie. Wel just-in-time leren wanneer het past.",
  },
  {
    sleutel: "voice",
    emoji: "🎙️",
    titel: "Voice-everywhere, spraak werkt overal",
    pitch:
      "Een microfoon-knop op elke pagina. Vertel ELEVA wat je net hebt gedaan, gehoord, gezien, en je systeem update vanzelf.",
    waarom:
      "Geen tijd om te typen tussen gesprekken door. Wel even inspreken op de fiets, in de auto, na een call.",
  },
  {
    sleutel: "founder-cms",
    emoji: "✏️",
    titel: "Founder-CMS, alles bewerkbaar",
    pitch:
      "Elke tekst, elke film, elke quote te bewerken door Raoul of Gaby. Geen developer nodig om iets aan te passen, alleen een ✍️-knopje.",
    waarom:
      "Het systeem groeit mee met jullie inzichten. Wat vandaag werkt mag morgen al beter.",
  },
  {
    sleutel: "stats",
    emoji: "📊",
    titel: "Stats & tracking-links",
    pitch:
      "Per freebie zien hoe je funnel loopt: ingetekend, afgemaakt, contact gevraagd, klant geworden. Plus persoonlijke tracking-URL's voor delen.",
    waarom:
      "Niet meer raden wat werkt. Wel zien welke aanpak resultaten geeft, en op data bijsturen.",
  },
  {
    sleutel: "push",
    emoji: "🔔",
    titel: "Push-meldingen & herinneringen",
    pitch:
      "Een lead vult een freebie in, je telefoon trilt. Een follow-up staat te wachten, je krijgt een ping. Geen gemiste kansen meer.",
    waarom:
      "Het systeem werkt voor jou, ook als je het even vergeet. Reageren binnen 5 minuten verdrievoudigt je conversie.",
  },
  {
    sleutel: "team",
    emoji: "🌳",
    titel: "TeamBoom, je team in 1 oogopslag",
    pitch:
      "Wie heeft wie gesponsord, wie zit op welke fase, wie heeft hulp nodig? Visuele boom met directe acties per teamlid.",
    waarom:
      "Leiderschap begint bij overzicht. Plus 1-klik-tools om iemand vooruit te helpen.",
  },
  {
    sleutel: "onboarding",
    emoji: "🚪",
    titel: "Slimme onboarding, modus-bewust",
    pitch:
      "Sprint-bouwer, Core-instromer, Pro-cliënt-coach, elk krijgt het juiste pad vanaf dag 1. Wisselen kan altijd, voortgang gaat mee.",
    waarom:
      "Niemand zit vast in een pad dat niet past. Plus cross-modus skip zodat dingen die je al hebt gedaan niet opnieuw vragen.",
  },
];
