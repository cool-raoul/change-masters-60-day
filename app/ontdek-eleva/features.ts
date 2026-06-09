// File: app/ontdek-eleva/features.ts
//
// Alle ELEVA-features op de showcase. Volgorde gekozen door Raoul:
// hoofdpaden eerst (Core, Pro, Sprint), dan onboarding (cruciaal),
// dan de ondersteunende lagen. Founder-CMS staat NIET in deze lijst,
// dat is intern werk waar prospects/team niets aan hebben.

export type Feature = {
  sleutel: string;
  emoji: string;
  titel: string;
  pitch: string;
  /** Bullet-lijst zoals Saga: korte vetgedrukte term met uitleg. */
  bullets: { term: string; uitleg: string }[];
  /** Toont 'BINNENKORT'-badge en gestippelde rand. Visie-laag, nog niet live. */
  binnenkort?: boolean;
};

export const FEATURES: Feature[] = [
  {
    sleutel: "core",
    emoji: "🌱",
    titel: "Core, voor wie rustig en bewust wil bouwen",
    pitch:
      "Het meest gekozen pad. 21 dagen waarin je je fundament neerlegt op je eigen tempo, daarna groei je vanuit dat fundament door 🥰",
    bullets: [
      { term: "Dag 1 tot 21", uitleg: "Een helder pad zonder dat het overweldigt. Elke dag een stukje fundament." },
      { term: "Eigen tempo", uitleg: "Niet alles in één keer. Je gaat zo snel als jij wil, en pakt op wat past." },
      { term: "Webshop-business", uitleg: "Een ondernemerschap dat naast je leven past, niet erbovenop." },
    ],
  },
  {
    sleutel: "pro",
    emoji: "💎",
    titel: "Pro, voor professionals met cliënten",
    pitch:
      "Coaches, therapeuten en beauty-pro's met een eigen praktijk. Een eigen route die past bij wat je al doet, zonder dat het voelt als verkopen.",
    bullets: [
      { term: "15-stappen-leerpad", uitleg: "Eigen tempo, eigen ritme, in lijn met je bestaande agenda." },
      { term: "Productadvies-test", uitleg: "Een tool die je aan je cliënten geeft, zij vullen 'm in, jij krijgt het overzicht." },
      { term: "Business-laag eronder", uitleg: "Onder de tool draait een natuurlijke webshop-business, zonder verkoop-druk." },
    ],
  },
  {
    sleutel: "sprint",
    emoji: "🚀",
    titel: "Sprint, voor wie volle bak gaat",
    pitch:
      "Niet voor iedereen, wel voor de doorzetters. 60 dagen waarin je elke dag iets bouwt, samen met je sponsor, naar je eerste team.",
    bullets: [
      { term: "60 dagen, elke dag een anker", uitleg: "Geen 'wat moet ik vandaag doen?' meer. Het playbook leidt je." },
      { term: "Sponsor-checkin", uitleg: "Dagelijks even, wekelijks dieper, plus drie-weg-gesprekken op leerdagen." },
      { term: "Exclusief karakter", uitleg: "Geen massa-instap. Wel voor wie deze intensiteit zoekt en de afspraak met zichzelf maakt." },
    ],
  },
  {
    sleutel: "onboarding",
    emoji: "🚪",
    titel: "Slimme onboarding, stap voor stap, dag voor dag",
    pitch:
      "Je vergeet nooit waar je was. Sprint-bouwer, Core-instromer, Pro-cliënt-coach, iedereen krijgt het juiste pad vanaf dag 1, en wisselen kan altijd 🥰",
    bullets: [
      { term: "Modus-bewust", uitleg: "Jouw pad past bij waarom jij hier bent, niet bij wat het systeem standaard doet." },
      { term: "Cross-modus skip", uitleg: "Wat je in een ander pad al hebt gedaan, vragen we niet opnieuw." },
      { term: "Dag-teller per modus", uitleg: "Je weet altijd waar je staat, ook na een paar dagen niet ingelogd." },
    ],
  },
  {
    sleutel: "dmo",
    emoji: "🎯",
    titel: "DMO, je dagelijkse motor",
    pitch:
      "Daily Method of Operation, de vijf bewegingen die je elke dag herhaalt. Niet meer raden of je vandaag de juiste dingen hebt gedaan. Wel een ritme dat dragend wordt, vanzelf 🥰",
    bullets: [
      { term: "Vijf vaste bewegingen", uitleg: "Lijst-acties, uitnodigingen, follow-ups, eigen ontwikkeling en zichtbaarheid. Klein, herhaalbaar, doenbaar." },
      { term: "DMO is de motor", uitleg: "Niet 'wanneer komt mijn doorbraak?', wel 'heb ik vandaag mijn bewegingen gedaan?'. Resultaten zijn de uitkomst, niet het mikpunt." },
      { term: "End-of-day-check", uitleg: "Een momentum-radar die je aan het einde van je dag laat zien wat je echt hebt geraakt, en wat morgen aandacht vraagt." },
    ],
  },
  {
    sleutel: "mentor",
    emoji: "🤖",
    titel: "ELEVA Mentor, je coach in je broekzak",
    pitch:
      "Een coach die altijd antwoord heeft, in jullie stem, claim-vrij, en up-to-date over alle features. Voor wanneer je vastloopt of een script nodig hebt.",
    bullets: [
      { term: "Script-hulp", uitleg: "Niet meer staren naar een lege WhatsApp, samen je versie schrijven van wat je wilt zeggen." },
      { term: "Bezwaar-coaching", uitleg: "Iemand twijfelt, jij weet niet wat te zeggen, Mentor helpt je rustig het echte gesprek aangaan." },
      { term: "Partner-check", uitleg: "Of een nieuw lid bij je past, of je hem beter naar iemand anders doorverwijst." },
    ],
  },
  {
    sleutel: "namenlijst",
    emoji: "📋",
    titel: "Namenlijst, je hele pijplijn in beeld",
    pitch:
      "Iedereen die je ooit hebt gesproken, op één plek. Met fase, prioriteit, herinneringen en alle context. Pipeline-view of lijst-view, jij kiest.",
    bullets: [
      { term: "Smart pipeline", uitleg: "Drag-and-drop tussen prospect, in gesprek, uitgenodigd, presentatie en klant." },
      { term: "Herinneringen die werken", uitleg: "Een ping als iemand antwoord nodig heeft, of als een follow-up wacht." },
      { term: "Eén oogopslag", uitleg: "Wie heeft 't drukst, wie heeft 't langste niets gehoord, wat is de volgende beste stap." },
    ],
  },
  {
    sleutel: "freebies",
    emoji: "🎁",
    titel: "Freebie-bots met heat-score",
    pitch:
      "Drie score-bots staan klaar: Energie & Focus, Hormonen & Overgang, en de Holistic Reset-check. Jij deelt de link, de bot doet het filter-werk.",
    bullets: [
      { term: "Heat-score per lead", uitleg: "Je ziet meteen wie heet is, lauw, koel of koud. Begin bij de heetsten." },
      { term: "Automatisch in pijplijn", uitleg: "Inzending komt direct in je namenlijst, met push-melding op je telefoon." },
      { term: "Mailserie", uitleg: "5 mails met tips & tricks, die je relatie warm houden, ook als ze niet meteen beslissen." },
    ],
  },
  {
    sleutel: "mini-eleva",
    emoji: "💌",
    titel: "Mini-ELEVA, prospects warm ontvangen",
    pitch:
      "Een persoonlijke link voor je prospect met films, verhalen, FAQ en jouw why. Ze ervaren ELEVA voordat jij iets uitlegt 🥰",
    bullets: [
      { term: "Twee sporen", uitleg: "Product-spoor (gezondheid) of business-spoor (eigen onderneming), jij kiest welke." },
      { term: "Foundervideo's", uitleg: "Films van Raoul of Gaby die het verhaal vertellen, jij hoeft niet alles zelf te zeggen." },
      { term: "Activiteits-tracking", uitleg: "Je ziet wanneer je prospect aan het kijken is, en welke onderdelen ze openen." },
    ],
  },
  {
    sleutel: "film-tracking",
    emoji: "🎥",
    titel: "Real-time film-tracking",
    pitch:
      "Je deelt een film met een prospect, en je weet meteen of ze 'm aanzetten. Geen meer 'heeft ze 'm al gezien?' raden in het wilde weg.",
    bullets: [
      { term: "Live notificatie", uitleg: "Je telefoon trilt zodra iemand de film opent of doorklikt naar een volgende sectie." },
      { term: "Kijk-percentage", uitleg: "Je ziet hoever ze zijn gekomen, en welke stukken ze hebben overgeslagen." },
      { term: "Timing-gevoel", uitleg: "Je weet wanneer het moment rijp is om je vervolg-bericht te sturen, niet té vroeg en niet té laat." },
    ],
  },
  {
    sleutel: "scripts",
    emoji: "✍️",
    titel: "Scripts-bibliotheek, in jullie stem",
    pitch:
      "Aansluiten, uitnodigen, opvolgen, dienstverlening. Voor elke fase de juiste woorden, claim-vrij, in Raoul en Gaby's toon.",
    bullets: [
      { term: "Per fase", uitleg: "Verschillende scripts voor of je nog aan het aansluiten bent of al een gesprek hebt gehad." },
      { term: "Jouw versie", uitleg: "Kopiëren, jouw woorden erin schuiven, versturen. Geen sjabloon-gevoel meer." },
      { term: "Geen verkooppraat", uitleg: "Niemand voelt zich onder druk. Wel een vriendelijke uitnodiging om iets met jou te delen." },
    ],
  },
  {
    sleutel: "academy",
    emoji: "🎓",
    titel: "Academy, leren onderweg",
    pitch:
      "DMO-mindset, spreken-zoals-het-raakt, claim-vrije communicatie. Audio-lessen die je luistert in de auto, op de fiets, of onder de afwas.",
    bullets: [
      { term: "Just-in-time", uitleg: "Geen vooraf-cursus van 4 uur. Wel een 10-minuten-stuk wanneer het past." },
      { term: "Audio-onderweg", uitleg: "Net als een podcast, behalve dat het direct over jouw bouwwerk gaat." },
      { term: "Praktijk-inzichten", uitleg: "Niet abstract, wel direct toepasbaar op je volgende gesprek of post." },
    ],
  },
  {
    sleutel: "voice",
    emoji: "🎙️",
    titel: "Voice, spraak werkt overal",
    pitch:
      "Een microfoon-knop op elke pagina. Vertel ELEVA wat je net hebt gedaan, gehoord of gezien, en je systeem update vanzelf 🥰",
    bullets: [
      { term: "Inspreken tussendoor", uitleg: "Geen tijd om te typen tussen gesprekken, wel even inspreken op de fiets." },
      { term: "Slim begrijpen", uitleg: "Het systeem weet of het een nieuwe naam, een herinnering of een notitie is." },
      { term: "Geen scherm-vermoeidheid", uitleg: "Praten gaat sneller dan typen, en voelt natuurlijker als je net iets hebt meegemaakt." },
    ],
  },
  {
    sleutel: "stats",
    emoji: "📊",
    titel: "Stats & tracking-links",
    pitch:
      "Per freebie je funnel zien: wie tekent in, wie maakt af, wie vraagt contact, wie wordt klant. Plus persoonlijke tracking-URL's om te delen.",
    bullets: [
      { term: "Funnel-overzicht", uitleg: "Vier cijfers die alles zeggen: ingetekend, afgemaakt, contact, klant." },
      { term: "Persoonlijke URL", uitleg: "Jouw eigen deel-link voor podcast, social media of WhatsApp. Iedereen komt in jouw pijplijn." },
      { term: "Klant-percentage", uitleg: "Niet schatten meer hoe goed je doet, wel echte cijfers waar je op kan bijsturen." },
    ],
  },
  {
    sleutel: "push",
    emoji: "🔔",
    titel: "Push-meldingen & herinneringen",
    pitch:
      "Iemand vult een freebie in, je telefoon trilt. Een follow-up wacht, je krijgt een ping. Geen gemiste kansen meer.",
    bullets: [
      { term: "Direct bij actie", uitleg: "Niet pas avonds een mail, wel meteen een melding zodat je kunt reageren." },
      { term: "Slimme timing", uitleg: "Niet midden in de nacht, wel als jij actief bent." },
      { term: "Een tap, en je bent erin", uitleg: "Vanaf de melding direct naar het juiste scherm in ELEVA, geen klik-werk meer." },
    ],
  },
  {
    sleutel: "team",
    emoji: "🌳",
    titel: "TeamBoom, je team in één oogopslag",
    pitch:
      "Wie heeft wie gesponsord, wie zit op welke fase, wie heeft hulp nodig. Een visuele boom met directe acties per teamlid.",
    bullets: [
      { term: "Visueel overzicht", uitleg: "Zien wie wie heeft binnengebracht, zonder lijsten te scrollen." },
      { term: "Status per lid", uitleg: "Op welke fase ze zitten, hoeveel tijd ze nog hebben, en waar ze stil staan." },
      { term: "Eén-klik-hulp", uitleg: "Een teamlid dat vastloopt? Direct vanuit de boom een gesprek inplannen of een script delen." },
    ],
  },
  {
    sleutel: "leiderschap",
    emoji: "👑",
    titel: "Leiderschapsrollen en -ontwikkeling",
    pitch:
      "Voor wanneer je voelt: ik wil mijn team dragen, niet alleen mezelf bouwen. Een eigen-stem-spoor, geen Mentor-copy van je sponsor.",
    bullets: [
      { term: "Train-the-trainer", uitleg: "Leer je eerste teamleden in jouw eigen toon, niet via Mentor-copy." },
      { term: "Leider-cockpit", uitleg: "Team-flow-overzicht naast je eigen dag-flow, één plek voor jouw leiderschap." },
      { term: "Coach-track na 21 dagen", uitleg: "Een vervolg-pad voor wanneer Core af is en je klaar bent om anderen te dragen." },
    ],
    binnenkort: true,
  },
];

// Pain-cards bovenaan de pagina, zoals Saga. Herkenning vóór features.
export const PAIN_CARDS = [
  {
    emoji: "😵‍💫",
    titel: "Ik weet niet wat ik vandaag moet doen",
    uitleg:
      "De energie is er, alleen het overzicht niet. Je opent je telefoon en je hebt geen idee waar te beginnen.",
    citaat:
      "Sinds ELEVA hoef ik niet meer te bedenken wat ik moet doen, het pad ligt er. Ik volg gewoon wat er die dag staat 🥰",
  },
  {
    emoji: "😬",
    titel: "Ik durf mensen niet zomaar te benaderen",
    uitleg:
      "Wat moet ik zeggen, en hoe? Hoe vermijd ik dat het voelt als verkopen? Iedere keer als ik een DM begin, blijf ik hangen.",
    citaat:
      "De scripts zijn in jullie taal, niet die verkooppraat van standaard-tools. Ik kopieer, maak het eigen, en stuur. Klaar.",
  },
  {
    emoji: "🌪️",
    titel: "Ik verlies het overzicht over alle contacten",
    uitleg:
      "Vandaag tien gesprekken, gisteren vijf. Wie wachtte op antwoord? Wie vroeg om iets toegestuurd te krijgen? Mijn hoofd kan dit niet meer.",
    citaat:
      "Namenlijst doet het werk voor mij. Push-meldingen, herinneringen, alles staat op het juiste moment klaar.",
  },
];

// Veelgestelde vragen sectie onderaan, Saga-style.
export const FAQ_ITEMS = [
  {
    vraag: "Heb ik technische kennis nodig om met ELEVA te werken?",
    antwoord:
      "Nee, helemaal niet. Het systeem werkt op je telefoon, op je laptop, waar je maar wilt. Eén keer registreren, daarna word je door alle stappen begeleid 🥰",
  },
  {
    vraag: "Hoe snel zie ik resultaten?",
    antwoord:
      "Dat ligt aan jou, eerlijk gezegd. Sommige bouwers hebben binnen 2 weken hun eerste gesprek. Anderen leggen eerst rustig hun fundament en bouwen vanaf maand twee door. Het systeem werkt voor beide aanpakken.",
  },
  {
    vraag: "Wat als ik niet weet wat ik moet zeggen?",
    antwoord:
      "Daar is de scripts-bibliotheek voor, en de ELEVA Mentor. Alles in onze stem, claim-vrij, klaar om te gebruiken. Kopieer, maak het je eigen, en stuur het.",
  },
  {
    vraag: "Moet ik elke dag iets doen?",
    antwoord:
      "Het helpt om elke dag iets klein te doen, alleen het systeem dwingt je nergens toe. Mis je een dag, dan pak je 'm gewoon weer op. De voortgang gaat met je mee.",
  },
  {
    vraag: "Werkt dit ook voor mensen die introvert zijn?",
    antwoord:
      "Zeker. Veel van de mensen die met ons bouwen, zijn juist meer rustig en bedachtzaam. De aanpak is niet pushen, wel uitnodigen. Dat past juist bij introverten.",
  },
  {
    vraag: "Wat als ik vastloop of vragen heb?",
    antwoord:
      "Dan is er je sponsor, ELEVA Mentor en het hele team. Plus je community in de FB-groep met meer dan 20.000 leden. Je staat er nooit alleen voor 🥰",
  },
];
