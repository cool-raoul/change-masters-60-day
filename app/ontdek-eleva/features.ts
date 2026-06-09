// File: app/ontdek-eleva/features.ts
//
// Alle ELEVA-features op de showcase. Volgorde gekozen door Raoul:
// hoofdpaden eerst (Core, Pro, Sprint), dan onboarding (cruciaal),
// dan de ondersteunende lagen. Founder-CMS staat NIET in deze lijst,
// dat is intern werk waar prospects/team niets aan hebben.
//
// Teksten: Raoul's eigen overrides als standaard ingehard
// (2026-06-09 batch), plus alle resterende pitches doorgehaald op
// GPT-isms en in stem-DNA herschreven.

export type Feature = {
  sleutel: string;
  emoji: string;
  titel: string;
  pitch: string;
  bullets: { term: string; uitleg: string }[];
  /** Toont 'BINNENKORT'-badge en gestippelde rand. Visie-laag, nog niet live. */
  binnenkort?: boolean;
};

export const FEATURES: Feature[] = [
  {
    sleutel: "core",
    emoji: "🌱",
    titel: "Core, de route voor het bouwen van een team voor maximale schaalbaarheid",
    pitch:
      "Het meest gekozen pad. Dagelijkse stappen waarin je je fundament neerlegt in je eigen gekozen tempo, daarna groei je vanuit dat fundament door 🥰",
    bullets: [
      { term: "Eigen tempo", uitleg: "Niet alles in één keer. Jij bepaalt de snelheid, het systeem past zich aan." },
      { term: "Dagelijkse stappen", uitleg: "Helder pad zonder dat het overweldigt. Elke dag een stukje fundament." },
      { term: "Schaalbaarheid in je DNA", uitleg: "Een team bouwen dat zichzelf draagt, niet één dat aan jou blijft hangen." },
    ],
  },
  {
    sleutel: "pro",
    emoji: "💎",
    titel: "Pro, voor professionals met cliënten",
    pitch:
      "Coaches, (personal) trainers, therapeuten en beauty-pro's, sport-professionals met een eigen praktijk. Een eigen route die eenvoudig te implementeren is bij wat je al doet, zonder dat het voelt als verkopen.",
    bullets: [
      { term: "15-stappen-leerpad", uitleg: "Eigen tempo, eigen ritme, in lijn met je bestaande agenda." },
      { term: "Productadvies-test", uitleg: "Een tool die je aan je cliënten geeft, zij vullen 'm in, jij krijgt het overzicht." },
      { term: "Business-laag eronder", uitleg: "Onder de tool draait een natuurlijke webshop-business, zonder verkoop-druk." },
    ],
  },
  {
    sleutel: "sprint",
    emoji: "🚀",
    titel: "Sprint, voor wie volle bak wil gaan!",
    pitch:
      "Niet voor iedereen, wel voor de go-getters en doorzetters. Je gaat 60 dagen voluit in een versneld tempo dat jij kiest, waarin je elke dag bouwt naar je eerste of volgende GROEP NIEUWE TEAMLEDEN. Je bouwt op deze manier een stevige fundering waar je lange tijd de vruchten van plukt.",
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
      "Je vergeet nooit waar je was. Elke modus krijgt het pad dat erbij past, en wisselen kan altijd. Je voortgang gaat met je mee 🥰",
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
      "Daily Method of Operation. De vaste bewegingen die je elke dag herhaalt. Een ritme dat dragend wordt, vanzelf 🥰",
    bullets: [
      { term: "Vaste bewegingen", uitleg: "Lijst-acties, uitnodigingen, follow-ups, eigen ontwikkeling en zichtbaarheid. Klein, herhaalbaar, doenbaar." },
      { term: "DMO is de motor", uitleg: "Niet wachten op een doorbraak, gewoon vandaag je bewegingen doen. Resultaten zijn de uitkomst, niet het mikpunt." },
      { term: "End-of-day-check", uitleg: "Een momentum-radar die je aan het einde van je dag laat zien wat je echt hebt geraakt." },
    ],
  },
  {
    sleutel: "mentor",
    emoji: "🤖",
    titel: "ELEVA Mentor, je coach in je broekzak",
    pitch:
      "Een coach die altijd antwoord heeft, in onze stem, claim-vrij, en up-to-date over alle features. Of het nu gaat om een gesprek dat je niet weet hoe te starten, een twijfel die je tegenhoudt, een script dat je moet schrijven of een vraag over voeding of een product, Mentor denkt mee 🥰",
    bullets: [
      { term: "Gespreks-coaching", uitleg: "Hoe begin je het gesprek, hoe ga je om met een afwijzing, wat zeg je bij een bezwaar." },
      { term: "Schrijfwerk in jouw stem", uitleg: "Uitnodigingen, opvolg-berichten, voorbereidende mails. Mentor schetst, jij maakt het eigen." },
      { term: "Educatie en claim-vrije content", uitleg: "Over producten, programma's, leefstijl. Altijd EFSA-veilig, ook als je het zelf even niet weet." },
      { term: "Twijfels en weerstand", uitleg: "Als je vastzit in je eigen hoofd, helpt Mentor je rustig terug naar wat je echt wilt." },
      { term: "Dagelijkse vragen", uitleg: "Van DMO-vragen tot strategie. Mentor leest mee met je voortgang en denkt mee waar nodig." },
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
    titel: "Freebies met heat-score",
    pitch:
      "Meerdere freebies staan klaar: Energie & Focus, Hormonen & Overgang, Holistic Reset-check, en er komen er steeds meer bij. Jij deelt de link, de bot doet het filter-werk 🥰",
    bullets: [
      { term: "Heat-score per lead", uitleg: "Je ziet meteen wie heet is, lauw, koel of koud. Begin bij de heetsten." },
      { term: "Automatisch in je pipeline", uitleg: "Inzending komt direct in je namenlijst met de juiste pipeline-fase, en het systeem werkt zelfstandig door naar de volgende stap. Geen handmatig overzetten meer." },
      { term: "Push-melding op je telefoon", uitleg: "Je weet meteen wanneer iemand klaar is voor contact, zonder je in te hoeven loggen." },
      { term: "Mailserie", uitleg: "5 mails met tips & tricks die je relatie warm houden, ook als ze niet meteen beslissen." },
      { term: "Koppeling met ManyChat", uitleg: "Leads die via Instagram of Facebook DM binnenkomen via ManyChat, vallen automatisch in je ELEVA-pipeline. Iedereen komt op één plek samen, ongeacht via welk kanaal ze binnenkomen." },
    ],
  },
  {
    sleutel: "mini-eleva",
    emoji: "💌",
    titel: "Mini-ELEVA, prospects warm ontvangen",
    pitch:
      "Een persoonlijke link voor je prospect met videos, verhalen, FAQ en jouw why. Ze ervaren ELEVA voordat jij iets uitlegt 🥰",
    bullets: [
      { term: "Twee sporen", uitleg: "Product-spoor (gezondheid) of business-spoor (eigen onderneming), jij kiest welke." },
      { term: "Videos", uitleg: "Videos die het verhaal vertellen, jij hoeft niet alles zelf uit te leggen." },
      { term: "Activiteits-tracking", uitleg: "Je ziet wanneer je prospect aan het kijken is, en welke onderdelen ze openen." },
      { term: "Aparte chat-omgeving", uitleg: "Een directe persoonlijke chat met je prospect, zonder dat het tussen je andere berichten verdwijnt." },
      { term: "3-way chat", uitleg: "Je sponsor of upline erbij halen in het gesprek met je prospect, voor extra ondersteuning en kennis op het juiste moment." },
    ],
  },
  {
    sleutel: "film-tracking",
    emoji: "🎥",
    titel: "Real-time film-tracking",
    pitch:
      "Je deelt een film met een prospect en je weet meteen of ze 'm aanzetten. Niet meer raden of die persoon je film al heeft gezien.",
    bullets: [
      { term: "Live notificatie", uitleg: "Je telefoon trilt zodra iemand de film opent of doorklikt naar een volgende sectie." },
      { term: "Kijk-percentage", uitleg: "Je ziet hoever ze zijn gekomen, en welke stukken ze hebben overgeslagen." },
      { term: "Timing-gevoel", uitleg: "Je weet wanneer het moment rijp is om je vervolg-bericht te sturen." },
    ],
  },
  {
    sleutel: "scripts",
    emoji: "✍️",
    titel: "Scripts-bibliotheek",
    pitch:
      "Aansluiten, uitnodigen, opvolgen, dienstverlening. Voor elke fase de juiste woorden, claim-vrij, zoals het in het team geleerd wordt.",
    bullets: [
      { term: "Per fase", uitleg: "Andere scripts voor of je nog aan het aansluiten bent of al een gesprek hebt gehad." },
      { term: "Jouw versie", uitleg: "Kopiëren, jouw woorden erin schuiven, versturen. Geen sjabloon-gevoel meer." },
      { term: "Geen verkooppraat", uitleg: "Niemand voelt zich onder druk, wel een vriendelijke uitnodiging om iets te delen." },
    ],
  },
  {
    sleutel: "social-media",
    emoji: "📱",
    titel: "Social Media-ondersteuning, je eigen stem online",
    pitch:
      "ELEVA Mentor helpt je je eigen niche te bepalen en schrijft samen met jou je posts en reels. In jouw stem, claim-vrij, zonder dat het verkooppraat wordt 🥰",
    bullets: [
      { term: "Niche-bepaling", uitleg: "Samen ontdekken waar jouw verhaal raakt en welke mensen zich aangesproken voelen." },
      { term: "Posts en reels schrijven", uitleg: "Mentor schetst het concept en de structuur, jij geeft het je eigen draai." },
      { term: "Claim-vrij denken", uitleg: "EFSA-richtlijnen automatisch ingebouwd. Niet zeggen wat een product DOET, wel wat het je BRENGT." },
      { term: "Spreken-zoals-het-raakt", uitleg: "Geen verkooppraat, wel content die echt voelt. Mensen scrollen niet door, omdat ze zich herkennen." },
    ],
  },
  {
    sleutel: "academy",
    emoji: "🎓",
    titel: "Academy, leren onderweg",
    pitch:
      "DMO-mindset, spreken-zoals-het-raakt, claim-vrije communicatie. Audio-lessen die je luistert in de auto, op de fiets, of onder de afwas 🥰",
    bullets: [
      { term: "Just-in-time", uitleg: "Geen vooraf-cursus van vier uur, wel een 10-minuten-stuk wanneer het past." },
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
      { term: "Klant-percentage", uitleg: "Geen schatten meer, wel echte cijfers waar je op kan bijsturen." },
    ],
  },
  {
    sleutel: "push",
    emoji: "🔔",
    titel: "Push-meldingen & herinneringen",
    pitch:
      "Op het juiste moment de juiste melding op je telefoon. Of het nu een nieuwe lead is, een prospect die je video opent, een follow-up die wacht of een teamlid dat een mijlpaal bereikt, je weet meteen wat er aandacht vraagt 🥰",
    bullets: [
      { term: "Nieuwe lead binnen", uitleg: "Iemand vult een freebie in, vraagt om contact, of komt via Instagram of Facebook DM binnen via ManyChat." },
      { term: "Prospect kijkt naar je video", uitleg: "Je weet meteen wanneer iemand je film opent of doorklikt naar het volgende hoofdstuk." },
      { term: "Follow-up wacht", uitleg: "Een herinnering die je zelf hebt ingesteld, of die het systeem voor je heeft gepland op het juiste moment." },
      { term: "Team-mijlpaal bereikt", uitleg: "Een teamlid voltooit een belangrijke stap of haalt een doelstelling. Even meefelliciteren of een steuntje in de rug." },
      { term: "Sponsor-checkin", uitleg: "Tijd voor je dagelijkse of wekelijkse afspraak met je sponsor of upline." },
      { term: "Drie-weg gesprek", uitleg: "Wordt jij of jouw upline gevraagd voor een drie-weg gesprek met een prospect? Je krijgt een ping zodat je op tijd kunt aansluiten." },
      { term: "Klant-momenten", uitleg: "Een klant bereikt een mijlpaal in zijn programma of heeft een vraag. Jij kunt op tijd reageren met aandacht." },
      { term: "Slimme timing", uitleg: "Niet midden in de nacht, wel als jij actief bent." },
      { term: "Eén tap, en je bent erin", uitleg: "Vanaf de melding direct naar het juiste scherm in ELEVA, geen klik-werk meer." },
    ],
  },
  {
    sleutel: "team",
    emoji: "🌳",
    titel: "TeamBoom, je team in één oogopslag",
    pitch:
      "Wie heeft wie gesponsord, wie zit op welke fase, wie heeft hulp nodig. Een visuele boom met directe acties per teamlid 🥰",
    bullets: [
      { term: "Visueel overzicht", uitleg: "Zien wie wie heeft binnengebracht, zonder lijsten te scrollen." },
      { term: "Status per lid", uitleg: "Op welke fase ze zitten, hoeveel tijd ze nog hebben, en waar ze stilstaan." },
      { term: "Eén-klik-hulp", uitleg: "Een teamlid dat vastloopt? Direct vanuit de boom een gesprek inplannen of een script delen." },
    ],
  },
  {
    sleutel: "klant-zorg",
    emoji: "💖",
    titel: "Klant-begeleiding, dat zij niet verloren raken",
    pitch:
      "Zodra iemand klant wordt en aan zijn eigen programma begint, krijgt hij ondersteuning. Een eigen klant-Mentor, een helder stappenplan, en aandacht voor wat hem helpt door te gaan 🥰 Want een klant die zich gezien voelt en weet waar hij staat, blijft.",
    bullets: [
      { term: "Eigen klant-Mentor", uitleg: "Klanten krijgen ondersteuning vanuit ELEVA Mentor en jou samen, gericht op hun programma en hun ritme." },
      { term: "Helder stappenplan", uitleg: "Niet verloren raken na de eerste bestelling. Wel een rustig pad door hun programma, met de juiste stap op het juiste moment." },
      { term: "Aandacht voor klantbehoud", uitleg: "Lange-termijn-resultaat is de echte uitkomst. Het systeem helpt jou om klanten betrokken te houden, zonder dat het voelt als pushen." },
      { term: "Samen met jou", uitleg: "ELEVA Mentor doet het denkwerk, jij blijft de menselijke laag eromheen. Klanten weten dat ze niet alleen met een systeem werken, wel met jou." },
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
      { term: "Functies bij team-mijlpalen", uitleg: "Zodra je team een bepaalde grootte bereikt, openen zich nieuwe leider-functies in het systeem die je verder helpen bij het dragen van een groeiende groep." },
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
      "De scripts zijn zoals het in het team geleerd wordt, niet die verkooppraat van standaard-tools. Ik kopieer, maak het eigen, en stuur. Klaar.",
  },
  {
    emoji: "🌪️",
    titel: "Ik verlies het overzicht over alle contacten",
    uitleg:
      "Vandaag tien gesprekken, gisteren vijf. Wie wachtte op antwoord? Wie vroeg om iets toegestuurd te krijgen? Mijn hoofd kan dit niet meer.",
    citaat:
      "Namenlijst doet het werk voor mij. Push-meldingen, herinneringen, alles staat op het juiste moment klaar 🥰",
  },
];

// Veelgestelde vragen sectie onderaan, Saga-style.
export const FAQ_ITEMS = [
  {
    vraag: "Heb ik technische kennis nodig om met ELEVA te werken?",
    antwoord:
      "Nee, helemaal niet. Het systeem werkt op je telefoon, op je laptop, waar je maar wilt. Eén keer registreren, daarna word je door alle stappen begeleid en leer je stap voor stap met het systeem werken. Ook worden er aparte trainingen verzorgd specifiek hoe strategisch hiermee te werken. Er is hier ook plek voor technische vragen te stellen 🥰",
  },
  {
    vraag: "Hoe snel zie ik resultaten?",
    antwoord:
      "Dat ligt aan jou, eerlijk gezegd. Sommige bouwers hebben binnen enkele minuten of uren hun eerste gesprek. Anderen hebben meer tijd nodig om tot hun eerste resultaten te komen. Het systeem werkt voor een ieder die een lange-termijn-visie heeft en bereid is om alle stappen ook echt consistent te doen.",
  },
  {
    vraag: "Wat als ik niet weet wat ik moet zeggen?",
    antwoord:
      "Daar is de scripts-bibliotheek voor, en de ELEVA Mentor. Alles zoals het in het team wordt geleerd, claim-vrij, klaar om te gebruiken. Kopieer, maak het je eigen, en stuur het.",
  },
  {
    vraag: "Moet ik elke dag iets doen?",
    antwoord:
      "Het helpt om elke dag iets kleins te doen, alleen het systeem dwingt je nergens toe. Mis je een dag, dan pak je 'm gewoon weer op. De voortgang gaat met je mee. Het systeem werkt voor een ieder die een lange-termijn-visie heeft en bereid is om alle stappen ook echt consistent te doen.",
  },
  {
    vraag: "Werkt dit ook voor mensen die introvert zijn?",
    antwoord:
      "Zeker. Veel van de mensen die met ons bouwen, zijn juist meer rustig en bedachtzaam. De aanpak is niet pushen, wel uitnodigen. Dat past juist bij introverten. Wel zien we dat introverten door de samenwerking een persoonlijke ontwikkeling doormaken, waardoor ze allerlei makkelijker aanleren.",
  },
  {
    vraag: "Wat als ik vastloop of vragen heb?",
    antwoord:
      "Dan is er je sponsor, ELEVA Mentor en het hele team. Plus je community met vele andere leden die elkaar ondersteunen. Je staat er nooit alleen voor 🥰",
  },
];
