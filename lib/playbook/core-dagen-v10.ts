// File: lib/playbook/core-dagen-v10.ts
//
// Core 2.0 (V10): 30 dagen, gebouwd rond de lanceerweek.
// Ontwerp: lanceerweek-stappenplan.html (goedgekeurde structuur 2026-07-07)
// + docs/attraction-marketing-vs-eleva.md.
//
// Opbouw:
//   Dag 1-6   Lanceerweek (elke dag één post, de Mentor schrijft mee)
//   Dag 7-8   De oogst (namenlijst uit reacties + FORM in de DM)
//   Dag 9-12  Business-boog (optioneel; doorbouwers standaard)
//   Dag 13-20 Ritme + skills op het gebruiksmoment
//   Dag 21    De 21-dagen-resultatenpost (finale, tweede oogst)
//   Dag 22-30 Verdieping + de verdiende top-20 (dag 28) + maand-afsluiting
//
// De VERHUISDE dagen importeren hun content 1-op-1 uit V9 (één tekstbron,
// zie het verhuisplan in lanceerweek-stappenplan.html). Alleen nummer en
// fase worden geremapt; taak-id's blijven stabiel (voltooiingen blijven
// kloppen). De NIEUWE dagen (lancering, oogst, business-boog, finale) zijn
// bewust dun: mini-les + Mentor-actie + afvinklijst. De post zelf schrijft
// het Mentor-brein per persoon (lib/mentor/*), dus hier staan geen
// post-sjablonen.
//
// Status: PREVIEW naast V9. De live Core blijft op V9 tot Raoul de
// preview goedkeurt; de omschakel-plek is lib/playbook/dagen-voor-modus.ts
// + bereken-dag.ts (zelfde patroon als de V6→V9-switch destijds).

import type { Dag } from "./types";
import { CORE_V9_STAPPEN } from "./core-dagen-v9";

const P = "core-v10-dag";

/** Mentor-link met voorgevulde schrijfopdracht (opent de schrijver-rol). */
function mentorPost(prefill: string): string {
  return `/coach?prefill=${encodeURIComponent(prefill)}&submit=1`;
}

/** Pak een V9-dag en verplaats 'm naar een nieuw dagnummer + fase. */
function verplaats(v9Nummer: number, nieuwNummer: number, fase: 1 | 2 | 3 | 4): Dag {
  const bron = CORE_V9_STAPPEN.find((d) => d.nummer === v9Nummer);
  if (!bron) {
    throw new Error(`core-dagen-v10: V9-dag ${v9Nummer} niet gevonden`);
  }
  return { ...bron, nummer: nieuwNummer, fase };
}

export const CORE_V10_STAPPEN: Dag[] = [
  // ==========================================================
  // FASE 1 · DAG 1-8 · LANCEERWEEK + OOGST
  // ==========================================================
  {
    nummer: 1,
    titel: "🎨 Dag 1 van je lancering: het aanzetje",
    fase: 1,
    faseDoel: "Deze week lanceer je jezelf bij je warme markt: zes dagen, elke dag één post. Mensen komen naar jou toe.",
    watJeLeert: `Welkom bij je lanceerweek 💟

Deze week doe je iets wat de meeste mensen in dit vak nooit leren: je laat je warme markt naar jóu toe komen. Geen lijstjes bellen, geen ongemakkelijke berichtjes. Jij plaatst zes dagen lang één post, en de reacties die daarop komen worden vanzelf je eerste warme gesprekken.

Vandaag begin je klein en slim: een vraag-post. Eén open vraag in jouw eigen woorden, over iets waar jouw mensen echt antwoord op willen geven. Waarom dit werkt? Elke reactie vertelt het algoritme: laat deze persoon vaker zien. Zo maakt de post van vandaag ruimte voor het verhaal van overmorgen... en dát is de post waar het om draait.

Nog even dit: je hoeft niks te verkopen deze week. Echt niks. Je bent gewoon weer zichtbaar aan het worden bij mensen die je toch al kennen. Voelt dat te doen? 🥰`,
    waaromWerktDit: {
      tekst: "Een teamlid dat exact weet wat het vandaag moet doen, verslaat elke keer een verward teamlid met een betere strategie.",
      bron: "Attraction-marketing-principe",
    },
    vandaagDoen: [
      {
        id: `${P}1-post-schrijven`,
        label: "Schrijf je aanzetje-post met de Mentor",
        uitleg: "De Mentor stelt je eerst een paar korte vragen en schrijft dan jouw vraag-post, in jouw woorden, klaar om te plakken. Gebruik een gekleurd tekstblok, geen foto.",
        verplicht: true,
        actieRoute: mentorPost("Het is dag 1 van mijn lanceerweek. Schrijf mijn aanzetje-post: een vraag-post in mijn niche voor een gekleurd tekstblok. Vraag me eerst wat je nodig hebt."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}1-plaatsen`,
        label: "Plaats de post op Facebook (en als story op Instagram)",
        verplicht: true,
      },
      {
        id: `${P}1-reageren`,
        label: "Reageer op élke reactie met een echt antwoord",
        uitleg: "Eén zin per reactie is genoeg. Wie reageert, verdient een reactie terug. Dit is waar het gesprek begint.",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Je post laten schrijven",
        menupad: "Menu → ELEVA Mentor → Mijn lanceerweek",
        route: "/coach",
      },
    ],
  },
  {
    nummer: 2,
    titel: "💛 Dag 2: je pre-post, open en eerlijk",
    fase: 1,
    faseDoel: "Deze week lanceer je jezelf bij je warme markt: zes dagen, elke dag één post.",
    watJeLeert: `Vandaag vertel je je omgeving waar je mee bezig bent. Open, eerlijk, zonder geheimzinnig gedoe.

Start je net met je eigen 21-dagen-traject? Dan is dit de klassieke pre-post: vandaag begin ik, ik neem jullie mee, duim je mee? Heb je zelf al resultaat, dan wordt het een ik-neem-je-mee-post: een tijdje geleden ben ik iets gaan veranderen, deze week vertel ik erover. En bouw je al langer? Dan deel je waar je nu staat.

Wat je NIET doet: raadseltjes opgeven ("er komt iets aan... blijf kijken!"). Dat voelt als reclame en mensen prikken er zo doorheen. Gewoon eerlijk vertellen wat je doet wint het altijd, en het mooie is: mensen gaan vanzelf meeleven. Publieke steun is precies wat je de komende weken op de been houdt 🥰`,
    waaromWerktDit: {
      tekst: "Je warme markt is niet opgebrand. De oude manier van benaderen is opgebrand.",
      bron: "Attraction-marketing-principe",
    },
    vandaagDoen: [
      {
        id: `${P}2-post-schrijven`,
        label: "Schrijf je pre-post (of ik-neem-je-mee-post) met de Mentor",
        uitleg: "De Mentor vraagt eerst waar jij staat (net gestart, al resultaat, of doorbouwer) en interviewt je kort. Daarna krijg je jouw post, in jouw woorden.",
        verplicht: true,
        actieRoute: mentorPost("Het is dag 2 van mijn lanceerweek. Schrijf mijn pre-post of ik-neem-je-mee-post. Vraag me eerst waar ik sta (net gestart, zelf al resultaat, of al langer aan het bouwen) en interview me daarna."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}2-plaatsen`,
        label: "Plaats de post + bedank je begeleider erin",
        verplicht: true,
      },
      {
        id: `${P}2-reageren`,
        label: "Reageer op de reacties van gisteren en vandaag",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Je post laten schrijven",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
      },
    ],
  },
  {
    nummer: 3,
    titel: "⭐ Dag 3: jouw verhaal (de belangrijkste post van de week)",
    fase: 1,
    faseDoel: "Deze week lanceer je jezelf bij je warme markt: zes dagen, elke dag één post.",
    watJeLeert: `Vandaag komt de post waar deze hele week omheen gebouwd is: jouw verhaal.

Geen productnaam. Geen pitch. Wel het eerlijke verhaal van hoe het was, wat er op het spel stond, en wat er veranderde. En één ding vertel je er wél bij: dat er een concreet programma achter zat. Niet welk, dat vertel je pas in een persoonlijk berichtje. Zo blijft het eerlijk én nieuwsgierig-makend tegelijk.

De post eindigt met een codewoord: "Wil je weten wat ik precies heb aangepast? Reageer met [WOORD]." Wie dat woord typt, geeft jou toestemming om een berichtje te sturen. Dat zijn je eerste warme leads, en ja: hieruit kan je éérste klant al komen. Vandaag.

En schrik niet als dat gebeurt, want je staat er niet alleen voor. In deze weken geldt één simpele regel: wil iemand écht verder, dan speel je dat door naar je sponsor voor een 3-weg-gesprek, of je stuurt een Mini-ELEVA-uitnodiging en laat die omgeving het werk doen. Jij hoeft alleen te verbinden. Zelf leren inschrijven komt later in het pad, precies op het moment dat jij eraan toe bent. Spannend? Logisch. Doen. 💪🏽`,
    waaromWerktDit: {
      tekst: "Mensen nemen nieuwe overtuigingen aan via verhalen. Wie zichzelf in jouw verhaal herkent, is al overtuigd voordat je iets hoeft uit te leggen.",
      bron: "Attraction-marketing-principe",
    },
    vandaagDoen: [
      {
        id: `${P}3-post-schrijven`,
        label: "Schrijf je verhaal-post met de Mentor (met codewoord)",
        uitleg: "De Mentor gebruikt wat hij al van je weet en vraagt alleen wat er nog mist. Je krijgt de post, een beeld-tip én het linkje dat je aan reageerders stuurt.",
        verplicht: true,
        actieRoute: mentorPost("Het is dag 3 van mijn lanceerweek: schrijf mijn verhaal-post met codewoord-oproep. Gebruik wat je al van me weet en vraag alleen wat er nog mist."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}3-plaatsen`,
        label: "Plaats de post met een echte eigen foto",
        uitleg: "De Mentor geeft je de beeld-tip. Geen stockfoto, geen productfoto. Een gewoon, echt moment.",
        verplicht: true,
      },
      {
        id: `${P}3-codewoord`,
        label: "Beantwoord elke codewoord-reactie met een berichtje",
        uitleg: "Kort en warm: bedankt voor je reactie, hier is wat ik doe. De Mentor geeft je het juiste linkje (freebie of webshop) om mee te sturen.",
        verplicht: true,
      },
      {
        id: `${P}3-vangnet`,
        label: "Wil iemand meteen verder? Meld 'm bij je sponsor voor een 3-weg",
        uitleg: "Je hoeft nog niks te kunnen. In deze fase speel je elke serieuze interesse samen met je sponsor: jij verbindt, je sponsor doet het verhaal, jij leert door te kijken. Of stuur een Mini-ELEVA-uitnodiging en laat die omgeving het werk doen.",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
      },
    ],
    waarInEleva: [
      {
        actie: "Reageerders in je namenlijst zetten",
        menupad: "Menu → Namenlijst → Nieuw",
        spraak: "Voeg [naam] toe aan mijn namenlijst, reageerde op mijn lanceerpost",
        route: "/namenlijst",
      },
    ],
  },
  {
    nummer: 4,
    titel: "🙏 Dag 4: dankjewel + je eerste stories",
    fase: 1,
    faseDoel: "Deze week lanceer je jezelf bij je warme markt: zes dagen, elke dag één post.",
    watJeLeert: `Vandaag twee dingen: je bedankt je mensen, en je start met stories.

De dankjewel-post is precies wat het zegt: je benoemt hoe leuk je alle reacties vond. Nul verkoop. Dit soort posts voelen klein, en juist daarom werken ze: je laat zien dat je een mens bent en geen campagne.

En dan stories. Vanaf vandaag zijn stories je dagelijkse ritme: drie tot vijf kleine inkijkjes per dag. Een moment uit je ochtend, iets waar je mee bezig bent, een vraag aan je kijkers. Vijftien minuten per dag, meer is het niet. De feed is voor de grote momenten, stories zijn voor de verbinding. Wie jouw stories kijkt, blijft warm... ook als die persoon nooit op een post reageert 🥰`,
    waaromWerktDit: {
      tekst: "Social media is een koffietentje, geen megafoon. Je wint met gesprekken, niet met bereik.",
      bron: "ELEVA Academy, Social Media-training",
    },
    vandaagDoen: [
      {
        id: `${P}4-post-schrijven`,
        label: "Schrijf je dankjewel-post met de Mentor",
        verplicht: true,
        actieRoute: mentorPost("Het is dag 4 van mijn lanceerweek: schrijf mijn korte dankjewel-post (reacties benoemen, geen pitch)."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}4-stories`,
        label: "Maak je eerste 3 stories (moment, proces, vraag)",
        verplicht: true,
      },
      {
        id: `${P}4-namen`,
        label: "Zet nieuwe reageerders in je namenlijst",
        verplicht: true,
        actieRoute: "/namenlijst",
        actieRouteLabel: "Open je namenlijst →",
      },
    ],
    waarInEleva: [
      {
        actie: "Namen snel toevoegen met je stem",
        spraak: "Voeg Anna toe aan mijn namenlijst, ze reageerde op mijn post over energie",
      },
    ],
  },
  {
    nummer: 5,
    titel: "🎬 Dag 5: zelfde verhaal, ander medium",
    fase: 1,
    faseDoel: "Deze week lanceer je jezelf bij je warme markt: zes dagen, elke dag één post.",
    watJeLeert: `Vandaag vertel je het verhaal van dag 3 nog een keer, in een andere vorm. Een deel van je mensen leest geen lange posts, die kijken.

Durf je live of op camera? Mooi. Maar het hoeft niet: een reel zonder praten werkt bewezen net zo goed. Gewoon beelden uit je dag (je wandeling, je keuken, je werkplek) met korte tekst-overlays eroverheen, en de echte inhoud in de caption. De Mentor maakt je shotlijst: welke 3 tot 5 shots, welke tekst per shot, en de caption met je codewoord.

Extra kans: reels komen ook bij mensen buiten je eigen volgers terecht. Dit is de dag dat je bereik groter wordt dan je vriendenlijst.`,
    waaromWerktDit: {
      tekst: "Ook wie nooit op camera wil, kan viral: eigen beelden plus tekst is genoeg. Het verhaal doet het werk.",
      bron: "Attraction-marketing-principe",
    },
    vandaagDoen: [
      {
        id: `${P}5-reel-schrijven`,
        label: "Laat de Mentor je shotlijst + caption maken",
        verplicht: true,
        actieRoute: mentorPost("Het is dag 5 van mijn lanceerweek: maak mijn reel. Ik wil mijn dag-3-verhaal in reel-vorm: geef me een shotlijst met overlay-teksten en een caption met codewoord."),
        actieRouteLabel: "Maak 'm met de Mentor →",
      },
      {
        id: `${P}5-opnemen`,
        label: "Neem de shots op en plaats de reel",
        uitleg: "Beelden uit je gewone dag zijn genoeg. Tien tot vijftien seconden totaal.",
        verplicht: true,
        vereistMobiel: true,
      },
      {
        id: `${P}5-stories`,
        label: "3 stories + reageren op reacties",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Je reel laten maken",
        menupad: "Menu → ELEVA Mentor → Een reel op maat",
        route: "/coach",
      },
    ],
  },
  {
    nummer: 6,
    titel: "💬 Dag 6: open en eerlijk",
    fase: 1,
    faseDoel: "Deze week lanceer je jezelf bij je warme markt: zes dagen, elke dag één post.",
    watJeLeert: `De laatste post van je lanceerweek is de menselijkste: open en eerlijk over je twijfel.

Wat had je bijna laten stoppen? Welke gedachte hield je tegen voordat je begon? Dat deel je vandaag. Geen drama, gewoon echt. Dit soort posts krijgen vaak de meeste privé-berichtjes van allemaal, juist van de stille meelezers die nooit ergens op reageren. Die voelen: dit gaat over mij.

En daarmee is je lanceerweek rond. Zes posts, geen enkele keer verkocht, en toch is er van alles in beweging gezet. Morgen ga je oogsten: dan kijken we samen wie er warm reageerde en wat je met ze doet. Trots mag, hoor. De meeste mensen in dit vak hebben dit nog nooit gedaan 💟`,
    waaromWerktDit: {
      tekst: "Je verhaal is je krachtigste marketing. Zelfs onvolmaakt gebracht werkt het.",
      bron: "Attraction-marketing-principe",
    },
    vandaagDoen: [
      {
        id: `${P}6-post-schrijven`,
        label: "Schrijf je open-en-eerlijk-post met de Mentor",
        verplicht: true,
        actieRoute: mentorPost("Het is dag 6 van mijn lanceerweek: schrijf mijn open-en-eerlijk-post over mijn twijfel (wat me bijna had laten stoppen). Interview me eerst kort."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}6-plaatsen`,
        label: "Plaatsen + reageren",
        verplicht: true,
      },
      {
        id: `${P}6-stories`,
        label: "3 stories van vandaag",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "Je post laten schrijven",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
      },
    ],
  },
  {
    nummer: 7,
    titel: "🌾 Dag 7: de oogst, je warme namenlijst",
    fase: 1,
    faseDoel: "Je reageerders worden je namenlijst, en je opent je eerste echte gesprekken.",
    watJeLeert: `Vandaag geen post. Vandaag kijk je wat je week heeft opgeleverd, en dat is meer dan je denkt.

Loop met de Mentor door je week: wie reageerde er op je posts? Wie keek elke story? Wie stuurde een berichtje? Elk van die mensen komt in je namenlijst. Dit is hetzelfde namenlijst-moment dat elke netwerker kent, met één groot verschil: jouw lijst bestaat uit mensen die al naar jóu toe kwamen. Geen koude namen, alleen warme.

Daarna een korte blik op het verdienmodel: wat is zo'n warme reactie eigenlijk waard? Kort antwoord: alles. Elke klant en elke bouwer die je ooit krijgt, begint als precies zo'n reactie. Daarom bewaken we ze zo goed 🥰

En voor je warmste naam plan je vandaag meteen de volgende stap, samen: een 3-weg met je sponsor, of een Mini-ELEVA-uitnodiging. Inschrijven doe je in deze fase nooit alleen; dat is geen zwakte, dat is het systeem. Merk trouwens op hoeveel van ELEVA je deze week al gewoon gebruíkt hebt: de Mentor, je namenlijst, de kaarten, je freebies. Leren werken met het systeem doe je hier door te doen, niet door handleidingen te lezen.`,
    waaromWerktDit: {
      tekst: "Meet echte gesprekken, geen likes. Eén warm gesprek is meer waard dan honderd views.",
      bron: "ELEVA Academy, Social Media-training",
    },
    vandaagDoen: [
      {
        id: `${P}7-oogst`,
        label: "Loop je week door met de Mentor: wie was warm?",
        verplicht: true,
        actieRoute: mentorPost("Mijn lanceerweek zit erop. Help me oogsten: ik noem wie er reageerde op mijn posts en stories, en jij helpt me bepalen wie warm is en wat per persoon de beste volgende stap is."),
        actieRouteLabel: "Oogst met de Mentor →",
      },
      {
        id: `${P}7-namen`,
        label: "Zet alle warme reageerders in je namenlijst",
        verplicht: true,
        actieRoute: "/namenlijst",
        actieRouteLabel: "Open je namenlijst →",
      },
      {
        id: `${P}7-drieweg`,
        label: "Plan voor je warmste naam een 3-weg met je sponsor (of stuur een Mini-ELEVA-uitnodiging)",
        uitleg: "Jouw rol is verbinden. Je sponsor praat mee in het gesprek, of Mini-ELEVA neemt je prospect veertien dagen bij de hand. Zo worden inschrijvingen gedaan terwijl jij het vak nog leert.",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: `${P}7-stories`,
        label: "3 stories (je dagelijkse ritme loopt gewoon door)",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Namen inspreken gaat het snelst",
        spraak: "Voeg toe aan mijn namenlijst: Sandra, reageerde op mijn verhaal-post, en Mark, keek al mijn stories",
      },
    ],
  },
  // Dag 8: FORM-verdieping (V9-dag 10), nu op het moment dat de eerste
  // DM-gesprekken uit de lancering komen.
  verplaats(10, 8, 1),

  // ==========================================================
  // FASE 2 · DAG 9-14 · BUSINESS-BOOG + EERSTE SKILLS
  // ==========================================================
  {
    nummer: 9,
    titel: "💡 Dag 9: de business-boog, jouw aanzetje",
    fase: 2,
    faseDoel: "Vier dagen dezelfde boog als week één, nu over het bouwen. Voor wie ook bouwers zoekt; overslaan mag.",
    watJeLeert: `Week één ging over jouw verhaal als mens. Deze vier dagen mogen over het bouwen gaan, en ze zijn optioneel.

Wil je (nu nog) alleen klanten? Prima: sla deze boog over, houd je stories-ritme vast en pak morgen gewoon de volgende les. Wil je wél laten zien dat je iets aan het opbouwen bent, dan begint dat vandaag net als dag 1: met een vraag. Eentje over tijd, werk en vrijheid, in jouw toon. "Als je één dag per week terug kreeg, wat zou je ermee doen?" Zoiets. Mensen antwoorden daar graag op, en jij leert wie er stiekem ruimte zoekt.

Zelfde spelregels als altijd: geen bedragen, geen beloftes, geen gepusht gedoe. Gewoon een eerlijke vraag 💟`,
    waaromWerktDit: {
      tekst: "Je zoekt niemand over te halen. Je zoekt wie al op zoek is.",
      bron: "Eigen principe Team Be The Change",
    },
    vandaagDoen: [
      {
        id: `${P}9-post-schrijven`,
        label: "Schrijf je business-aanzetje met de Mentor (of sla de boog over)",
        verplicht: true,
        actieRoute: mentorPost("Het is dag 9, de business-boog van mijn lancering: schrijf mijn vraag-post over tijd, werk en vrijheid in mijn toon (geen bedragen, geen beloftes)."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}9-stories`,
        label: "3 stories + reageren + DM's beantwoorden",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Je post laten schrijven",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
      },
    ],
  },
  {
    nummer: 10,
    titel: "📖 Dag 10: jouw business-verhaal",
    fase: 2,
    faseDoel: "Vier dagen dezelfde boog als week één, nu over het bouwen.",
    watJeLeert: `Vandaag het verhaal achter je keuze om te bouwen. Waarom ben jij hiernaast iets begonnen?

Zelfde opbouw als je dag-3-post: hoe het was, wat er wrong, wat je besloot. Alleen gaat het nu niet over je lijf of je energie, maar over je tijd, je werk, je dromen. En weer geldt: eerlijk wint. "Ik bouw hier rustig aan een extra inkomstenstroom naast mijn werk, in mijn eigen tempo" is honderd keer sterker dan welke gladde belofte dan ook.

Bouw je al langer? Vertel dan hoe het bouwen jóu veranderde. Dat verhaal heeft nog niemand van je gehoord.`,
    waaromWerktDit: {
      tekst: "Laat vooral zien welke leefstijl je ermee bouwt: jouw why, jouw doelen, jouw dromen. Dat is wat mag én wat werkt.",
      bron: "ELEVA claim-vrije lijn",
    },
    vandaagDoen: [
      {
        id: `${P}10-post-schrijven`,
        label: "Schrijf je business-verhaal met de Mentor (met codewoord)",
        verplicht: true,
        actieRoute: mentorPost("Dag 10, business-boog: schrijf mijn business-verhaal-post (waarom ik hiernaast ben gaan bouwen), met codewoord-oproep. Interview me eerst."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}10-stories`,
        label: "3 stories + codewoord-reacties beantwoorden",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Wat mag je zeggen over inkomen?",
        menupad: "Menu → Academy → Spreken zoals het raakt",
        route: "/academy",
      },
    ],
  },
  {
    nummer: 11,
    titel: "🙏 Dag 11: dankjewel + je freebie-post",
    fase: 2,
    faseDoel: "Vier dagen dezelfde boog als week één, nu over het bouwen.",
    watJeLeert: `Twee kleine dingen vandaag: bedanken, en je eerste post die naar je freebie leidt.

Je freebie (naar buiten toe noemen we 'm gewoon "een korte check") is de zachtste brug die er bestaat: iemand hoeft niks te kopen en niks te beloven, alleen drie minuten iets invullen. En jij krijgt precies te zien wie er warm is en waar diegene mee zit. De post van vandaag maakt mensen nieuwsgierig naar die check, met je codewoord als deurtje.

De Mentor kent jouw freebies en je persoonlijke linkjes al, dus dit schrijft bijna zichzelf 🥰`,
    waaromWerktDit: {
      tekst: "Een freebie geeft eerst, en vraagt pas daarna. Precies de volgorde waarin vertrouwen groeit.",
      bron: "Eigen principe Team Be The Change",
    },
    vandaagDoen: [
      {
        id: `${P}11-post-schrijven`,
        label: "Schrijf je freebie-post met de Mentor",
        verplicht: true,
        actieRoute: mentorPost("Dag 11: schrijf een post die mensen nieuwsgierig maakt naar een van mijn freebies (in de post heet dat een korte check), met codewoord. Vraag me eerst welke freebie en wat mijn eigen ervaring ermee is."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}11-linkjes`,
        label: "Stuur elke codewoord-reageerder jouw check-linkje",
        verplicht: true,
      },
      {
        id: `${P}11-stories`,
        label: "3 stories",
        verplicht: false,
      },
    ],
    waarInEleva: [
      {
        actie: "Je freebies en linkjes bekijken",
        menupad: "Menu → Mijn freebies",
        route: "/instellingen/mijn-freebies",
      },
    ],
  },
  {
    nummer: 12,
    titel: "💬 Dag 12: open en eerlijk over het bouwen",
    fase: 2,
    faseDoel: "Vier dagen dezelfde boog als week één, nu over het bouwen.",
    watJeLeert: `De business-boog sluit af zoals week één afsloot: open en eerlijk.

Welke twijfel had jij voordat je begon met bouwen? "Ben ik daar wel het type voor?" "Wat gaan mensen van me denken?" Deel het, en vertel waarom je toch doorging. Dit is de sterkste bouwers-magneet die er bestaat, want iedereen die stiekem overweegt om ooit iets voor zichzelf te beginnen heeft exact dezelfde twijfels. Jouw eerlijkheid geeft ze toestemming om erover te beginnen.

En daarmee heb je de volledige tien-daagse lancering gedaan. Vanaf morgen: ritme, en de vaardigheden erbij op het moment dat je ze nodig hebt.`,
    waaromWerktDit: {
      tekst: "Kwetsbaarheid is geen zwakte in dit vak. Het is de reden dat mensen jóu kiezen.",
      bron: "Eigen principe Team Be The Change",
    },
    vandaagDoen: [
      {
        id: `${P}12-post-schrijven`,
        label: "Schrijf je open-en-eerlijk-bouwpost met de Mentor",
        verplicht: true,
        actieRoute: mentorPost("Dag 12, de laatste van mijn business-boog: schrijf mijn open-en-eerlijk-post over mijn twijfel rond het bouwen en waarom ik toch doorging. Interview me eerst kort."),
        actieRouteLabel: "Schrijf 'm met de Mentor →",
      },
      {
        id: `${P}12-stories`,
        label: "3 stories + alle open reacties en DM's bijwerken",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Je post laten schrijven",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
      },
    ],
  },
  {
    nummer: 13,
    titel: "🌷 Dag 13: je freebie als volgende stap in gesprekken",
    fase: 2,
    faseDoel: "Vast dagritme: stories + gesprekken, en elke dag één vaardigheid erbij.",
    watJeLeert: `Vanaf vandaag heeft elke dag hetzelfde ritme: eerst je kwartiertje stories, reacties en DM's, daarna één les of actie. Vandaag: wanneer stuur je iemand je freebie, en wanneer pak je door naar je webshop?

De vuistregel is simpel. Twijfelt iemand nog, of ken je het echte verhaal nog niet? Dan is de freebie perfect: drie minuten invullen, jij ziet waar het zit, en het gesprek krijgt vanzelf richting. Is iemand al warm en vraagt die eigenlijk gewoon "wat moet ik hebben?", dan hoeft er geen check meer tussen: dan is je webshop de volgende klik. Bestellen als zelfbediening, zonder gedoe.

ELEVA houdt voor je bij wie de check invulde en wie 'm liet liggen. Warm signaal? Dan zie je dat, en de Mentor denkt per persoon met je mee.`,
    waaromWerktDit: {
      tekst: "Geef eerst, vraag daarna. En als iemand klaar is om te bestellen, maak het dan vooral niet moeilijker dan een linkje.",
      bron: "Eigen principe Team Be The Change",
    },
    vandaagDoen: [
      {
        id: `${P}13-ritme`,
        label: "Je kwartier: 3 stories + reacties + DM's",
        verplicht: true,
      },
      {
        id: `${P}13-freebie-sturen`,
        label: "Stuur minimaal 1 warme naam jouw freebie of webshop-link",
        verplicht: true,
        actieRoute: "/namenlijst",
        actieRouteLabel: "Open je namenlijst →",
      },
    ],
    waarInEleva: [
      {
        actie: "Zien wie je check invulde",
        menupad: "Menu → Namenlijst → open een kaart (check-uitslag staat erop)",
        route: "/namenlijst",
      },
    ],
  },
  // Dag 14: Productkennis-licht (V9-dag 3), nu op het moment dat de eerste
  // productvragen uit de posts binnenkomen. Webshop-route hoort hierbij.
  verplaats(3, 14, 2),

  // ==========================================================
  // FASE 3 · DAG 15-21 · GESPREKKEN + DE FINALE
  // ==========================================================
  verplaats(8, 15, 3),   // 3-weg-meesterclass: de 5 stappen
  verplaats(9, 16, 3),   // Je eerste/volgende 3-weg in de praktijk
  verplaats(11, 17, 3),  // 5 typen prospects + funnel als ritme
  verplaats(5, 18, 3),   // Bezwaren, 3-weg en Mini-ELEVA
  verplaats(13, 19, 3),  // Niche-aanscherping met de Mentor (nu mét reactie-data)
  {
    nummer: 20,
    titel: "🌟 Dag 20: je finale voorbereiden",
    fase: 3,
    faseDoel: "Morgen plaats je je resultatenpost. Vandaag maak je 'm samen met de Mentor alvast af.",
    watJeLeert: `Morgen is de dag waar je 21 dagen naartoe hebt gewerkt: je resultatenpost. Vandaag bereid je 'm voor, zodat je morgen alleen nog hoeft te plaatsen.

Loop met de Mentor je reis door: hoe het was toen je begon (je pre-post weet het nog precies), wat je hebt gedaan, en wat het je heeft gebracht in gevoel en gedrag. Kies ook je beeld: een voor-en-na-gevoel hoeft geen weegschaal te zijn, een foto van jou met een echte lach naast eentje van drie weken terug zegt vaak meer.

En als je programma nog niet af is of je resultaat nog pril voelt: geen stress. De Mentor helpt je een eerlijke versie te maken die klopt bij waar jij nu écht staat. Eerlijk wint, altijd.`,
    waaromWerktDit: {
      tekst: "De resultatenpost is historisch jullie best scorende moment. Voorbereiding maakt 'm alleen maar sterker.",
      bron: "Eigen data Team Be The Change",
    },
    vandaagDoen: [
      {
        id: `${P}20-voorbereiden`,
        label: "Schets je resultatenpost met de Mentor",
        verplicht: true,
        actieRoute: mentorPost("Morgen is dag 21: help me mijn 21-dagen-resultatenpost voorbereiden. Loop mijn reis met me door (interview me) en schrijf de conceptpost, morgen plaats ik 'm."),
        actieRouteLabel: "Bereid 'm voor met de Mentor →",
      },
      {
        id: `${P}20-beeld`,
        label: "Kies je foto('s) voor morgen",
        verplicht: true,
      },
      {
        id: `${P}20-ritme`,
        label: "Je kwartier: stories + reacties + DM's",
        verplicht: true,
      },
    ],
    waarInEleva: [
      {
        actie: "Je post laten schrijven",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
      },
    ],
  },
  {
    nummer: 21,
    titel: "🏆 Dag 21: jouw resultatenpost, de tweede oogst",
    fase: 3,
    faseDoel: "De finale: jouw 21-dagen-verhaal gaat online, en de gesprekken die volgen eindigen in je webshop.",
    watJeLeert: `Vandaag is 'm: de 21-dagen-resultatenpost. Het moment waar jullie team historisch de mooiste reacties op krijgt.

Hoe het was, wat je hebt gedaan, wat het je bracht, wie je dankbaar bent, en het codewoord voor wie wil weten hoe. De post staat al klaar van gisteren; vandaag plaats je 'm en ben je er de rest van de dag gewoon even voor de mensen die reageren. Wie via het codewoord doorvraagt, krijgt jouw eerlijke antwoord én, als het gesprek zover is, je webshop- of check-linkje.

Zelf nog geen eigen resultaat om te delen (jij begon zonder programma, of je bouwt al langer)? Dan is vandaag de dag van een nieuwe invalshoek van jóuw verhaal, of het verhaal van je eerste klant. De Mentor kent je situatie en kiest met je mee. Geniet hiervan. Dit heb jij gedaan 💟`,
    waaromWerktDit: {
      tekst: "Wauw, ik herken mezelf bijna niet meer. Zo voelt de post die je vandaag deelt, en zo voelt 'ie ook voor de lezer die zichzelf erin herkent.",
      bron: "Eigen scroll-stop Team Be The Change",
    },
    vandaagDoen: [
      {
        id: `${P}21-plaatsen`,
        label: "Plaats je resultatenpost",
        verplicht: true,
      },
      {
        id: `${P}21-codewoord`,
        label: "Beantwoord elke codewoord-reactie persoonlijk",
        uitleg: "Warm en eerlijk. Is het gesprek er klaar voor, dan deel je je webshop- of check-linkje.",
        verplicht: true,
      },
      {
        id: `${P}21-namen`,
        label: "Nieuwe reageerders in je namenlijst",
        verplicht: true,
        actieRoute: "/namenlijst",
        actieRouteLabel: "Open je namenlijst →",
      },
    ],
    waarInEleva: [
      {
        actie: "Reageerders vastleggen met je stem",
        spraak: "Voeg [naam] toe, reageerde met het codewoord op mijn resultatenpost",
      },
    ],
  },

  // ==========================================================
  // FASE 4 · DAG 22-30 · VERDIEPING + DE VERDIENDE TOP-20
  // ==========================================================
  verplaats(15, 22, 4),  // Klantcontact + opvolg-routine (incl. webshop-wegwijs)
  verplaats(14, 23, 4),  // Members/netwerkers herkennen + ideale klant
  verplaats(16, 24, 4),  // Tweede 3-weg, met meer eigen leiding
  verplaats(17, 25, 4),  // Edification-verdieping
  verplaats(19, 26, 4),  // Pipeline-check + de moedige vraag
  verplaats(12, 27, 4),  // Stories/Reels-verdieping + weekritme vastzetten
  verplaats(2, 28, 4),   // De top-20, nú verdiend: 1-op-1 met bewijs in de hand
  verplaats(20, 29, 4),  // Builder-status + duplicatie
  verplaats(21, 30, 4),  // Maand-afsluiting: reflectie, talent, doel maand 2
];

/** Handige lookup, zelfde patroon als V9. */
export function vindV10Dag(nummer: number): Dag | undefined {
  return CORE_V10_STAPPEN.find((d) => d.nummer === nummer);
}
