// ============================================================
// Core leerpad, 21 stappen webshop-strategie
//
// Voor ondernemende mensen die op eigen tempo een eigen Lifeplus-webshop
// willen opzetten en via social media + content + freebies klanten willen
// bereiken. Geen sprint-druk, wel een leerpad dat in eigen tempo te
// volgen is.
//
// Films per stap kunnen worden geplaatst in /instellingen/films met
// slug "core-stap-N" (waarbij N het stap-nummer is, 1 t/m 21).
// ============================================================

import type { Leerpad } from "./types";

export const CORE_LEERPAD: Leerpad = {
  modus: "core",
  naam: "Webshop-strategie",
  totaal: 21,
  stappen: [
    {
      nummer: 1,
      titel: "🚀 Welkom! Vandaag begint je weg naar vrijheid",
      doel: "Helder krijgen waarom jij dit doet en wat de Core-route inhoudt.",
      watJeLeert:
        "ELEVA Core gaat over één ding: je eigen webshop opzetten als basis voor meer tijd en vrijheid. Geen drukke sprint, wel een rustig leerpad dat past in jouw leven. De komende 21 stappen leer je hoe je je webshop opbouwt, hoe je via sociale media en gratis weggevers (freebies) nieuwe klanten bereikt, en hoe je daar een echte business van maakt op jouw eigen tempo.",
      vandaagDoen: [
        {
          id: "core1-why",
          label: "Maak je WHY (waarom doe je dit?) samen met de Mentor",
          uitleg:
            "De ELEVA Mentor stelt je een paar vragen en helpt je formuleren waarom jij hieraan begint. Een sterke WHY trekt je door de momenten waarop het tegenzit.",
          verplicht: true,
          actieRoute: "/mijn-why",
        },
        {
          id: "core1-sponsor",
          label: "Stuur je sponsor een berichtje: 'ik ben gestart'",
          uitleg:
            "Geen lang verhaal nodig, gewoon laten weten dat je begonnen bent. Vanaf nu kijkt je sponsor in ELEVA mee om je te kunnen ondersteunen.",
          verplicht: true,
        },
        {
          id: "core1-mentor",
          label: "Stel je eerste vraag aan de ELEVA Mentor",
          uitleg:
            "Ontdek wat de Mentor allemaal kan. Vraag iets over de producten, over je weg, of waar je benieuwd naar bent.",
          actieRoute: "/coach",
        },
      ],
      waarInEleva: [
        { actie: "Maak je WHY", route: "/mijn-why" },
        { actie: "Open de Mentor", route: "/coach" },
      ],
    },
    {
      nummer: 2,
      titel: "👥 Lijst opbouwen: wie ken jij die hier baat bij heeft?",
      doel: "Een eerste lijst van mensen in je leven die mogelijk geïnteresseerd zijn in producten of in een eigen webshop.",
      watJeLeert:
        "Voordat je je webshop online zet, wil je een gevoel hebben van wie er om je heen staat. Dit is geen verkoop-lijst, dit is een lijst van mensen waarvan je kunt voorstellen dat ze geïnteresseerd zijn in gezondheid, energie, stress-vermindering, of in een nieuwe manier van ondernemen. Familie, vrienden, ouders bij school, sportmaatjes, oude collega's, mensen die je via social volgt. Niet filteren, alles erop. Filteren komt later, en doet jouzelf nooit voor iemand anders.",
      vandaagDoen: [
        {
          id: "core2-namen",
          label: "Voeg minimaal 20 namen toe aan je lijst",
          uitleg:
            "Familie, vrienden, kennissen, collega's, ouders bij school, sportclub, hobby's. Geen filter, ook degenen waarvan je denkt 'die past nooit'. Vaak verrassen ze je.",
          verplicht: true,
          actieRoute: "/namenlijst",
        },
        {
          id: "core2-sponsor-call",
          label: "Plan een kennismakings-call met je sponsor (~30 min)",
          uitleg:
            "In deze call leer je je sponsor kennen, kijk je samen naar je lijst en bespreek je 1 of 2 mensen die je deze week wilt benaderen.",
          verplicht: true,
        },
      ],
      waarInEleva: [{ actie: "Naar je namenlijst", route: "/namenlijst" }],
    },
    {
      nummer: 3,
      titel: "🛒 Je webshop opzetten, de admin-dag",
      doel: "Drie administratieve fundamenten van je Lifeplus-business op één dag rondzetten.",
      watJeLeert:
        "Vandaag zet je de drie fundamenten van je business neer: je eigen webshop, je kredietformulier (zodat je betaald kunt worden), en je teams-administratie. Drie korte taken die je in een ochtend hebt staan, en daarna kun je verder met het echte werk.",
      vandaagDoen: [
        {
          id: "core3-webshop",
          label: "🛒 Lifeplus webshop aanmaken",
          uitleg: "Volg de instructies van je sponsor of de hand-out die je hebt gekregen.",
          verplicht: true,
        },
        {
          id: "core3-krediet",
          label: "✅ Kredietformulier invullen (verplicht voor uitbetaling)",
          uitleg:
            "Zonder dit formulier ontvang je geen commissies. Eenmalige administratieve stap.",
          verplicht: true,
        },
        {
          id: "core3-teams",
          label: "📋 Teams-administratiesysteem aanmaken",
          uitleg:
            "Hier wordt je team-structuur en je business-data bijgehouden vanuit Lifeplus.",
          verplicht: true,
        },
      ],
    },
    {
      nummer: 4,
      titel: "🔗 Bestellinks koppelen + productadvies-test verkennen",
      doel: "Je webshop-links koppelen aan ELEVA en de productadvies-test leren kennen.",
      watJeLeert:
        "ELEVA gebruikt je webshop-links om in productadvies-flows automatisch naar de juiste plek te verwijzen. Plus: vandaag verken je voor het eerst de productadvies-test, jouw belangrijkste tool om mensen op een prettige manier kennis te laten maken met de producten zonder dat het pushy voelt.",
      vandaagDoen: [
        {
          id: "core4-bestellinks",
          label: "🔗 Koppel je webshop-links aan ELEVA",
          uitleg: "Plak per pakket je eigen verkooplink. Eénmalig werk, daarna gebruikt ELEVA ze automatisch.",
          verplicht: true,
          actieRoute: "/instellingen/bestellinks",
        },
        {
          id: "core4-test",
          label: "Doe zelf de productadvies-test (~3 min)",
          uitleg:
            "Door de test zelf te doen, weet je hoe je prospects de test ervaren en welk advies eruit kan komen.",
          actieRoute: "/test-pakket-bouwer",
        },
      ],
    },
    {
      nummer: 5,
      titel: "📦 Productkennis: welke producten verkoop jij?",
      doel: "Een basis-overzicht van de Lifeplus-producten en voor wie ze passen.",
      watJeLeert:
        "Je hoeft niet alles uit je hoofd te kennen, maar wel een gevoel te hebben van de hoofdcategorieën: Daily BioBasics als basis-supplement, OmeGold voor omega-3, Proanthenols voor antioxidanten, en de programma's (Holistic Reset, Darmen in Balans, Stress Less). De ELEVA Mentor kent alle details, jij hoeft alleen te weten dat het bestaat en wanneer je het noemt.",
      vandaagDoen: [
        {
          id: "core5-mentor",
          label: "Vraag de Mentor: welke 5 producten verkoop ik het meest?",
          uitleg: "De Mentor geeft je een korte productenkennis-onderwerping op maat.",
          actieRoute: "/coach",
        },
        {
          id: "core5-eigen",
          label: "Bestel je eigen pakket als je dat nog niet hebt",
          uitleg:
            "Eigen ervaring is je beste verkooppraatje. Begin met de basis (Daily BioBasics) of een programma waar je in geïnteresseerd bent.",
        },
      ],
    },
    {
      nummer: 6,
      titel: "🤝 Hoe deel je je webshop op een natuurlijke manier?",
      doel: "Leren hoe je je webshop kunt noemen in gesprekken zonder dat het verkoop voelt.",
      watJeLeert:
        "Je webshop delen is geen koud verkooppraatje. Het is een natuurlijk antwoord op vragen als 'waar haal jij je supplementen?' of 'wat doe jij voor je darmen?'. Vandaag leer je hoe je je webshop noemt op een ontspannen manier, zodat het past bij wie jij bent.",
      vandaagDoen: [
        {
          id: "core6-natuurlijk",
          label: "Schrijf je 'natuurlijke webshop-introductie' op (3-4 zinnen)",
          uitleg:
            "Voorbeeld: 'Ik ben sinds kort gestart met Lifeplus, hoge kwaliteit supplementen. Heb mijn eigen webshop, kan je rondsturen als je wilt zien wat ze hebben.' De Mentor kan helpen.",
          actieRoute: "/mijn-zinnen",
        },
        {
          id: "core6-delen",
          label: "Deel je webshop met 2 mensen uit je lijst (rustig, geen pitch)",
        },
      ],
    },
    {
      nummer: 7,
      titel: "📱 Brookes 3-stappen-formule voor social posts",
      doel: "Een eenvoudige formule leren om elke dag een social media-post te kunnen plaatsen.",
      watJeLeert:
        "Brookes leerde ons: een goede post bestaat uit drie delen. WAARDE (een tip, een inzicht, een les), VERHAAL (iets persoonlijks of een resultaat), en een ZACHTE UITNODIGING ('DM me als je meer wilt weten'). Niet direct pitchen. Eerst nieuwsgierigheid wekken. Vandaag oefen je deze formule met één post.",
      vandaagDoen: [
        {
          id: "core7-post",
          label: "Schrijf één post volgens de Brookes-formule (Waarde + Verhaal + Uitnodiging)",
          uitleg:
            "Vraag de Mentor om feedback voor je hem post. Niet perfect proberen, gewoon plaatsen.",
        },
      ],
    },
    {
      nummer: 8,
      titel: "✨ Jouw 3 verhalen: persoonlijk, product, business",
      doel: "Drie korte verhalen op papier hebben die je in social en in gesprekken kunt gebruiken.",
      watJeLeert:
        "Een goed verhaal verkoopt beter dan elke pitch. Vandaag schrijf je drie korte verhalen (60-90 sec elk): jouw persoonlijke verhaal (wie was je → wat veranderde → wie ben je nu), je product-verhaal (welke producten doen wat voor jou), en je business-verhaal (waarom doe je dit, niet iets anders). Deze verhalen zijn jouw kapitaal voor de komende maanden.",
      vandaagDoen: [
        {
          id: "core8-persoonlijk",
          label: "Schrijf je persoonlijke verhaal (60 sec gesproken-tijd)",
          actieRoute: "/mijn-zinnen",
        },
        {
          id: "core8-product",
          label: "Schrijf je product-verhaal (60 sec)",
          actieRoute: "/mijn-zinnen",
        },
        {
          id: "core8-business",
          label: "Schrijf je business-verhaal (60 sec)",
          actieRoute: "/mijn-zinnen",
        },
      ],
    },
    {
      nummer: 9,
      titel: "📸 Lifestyle delen + Stories-ritme",
      doel: "Het ritme oppakken om dagelijks iets uit jouw leven te delen via Stories.",
      watJeLeert:
        "Lifestyle is de beste marketing. Mensen kopen mensen, niet producten. Stories (Instagram, Facebook, TikTok) zijn de krachtigste gratis wervingsinstrumenten van dit moment. Vandaag start je een ritme: minimaal één Story per dag uit jouw leven, soms een productmoment, soms gewoon iets persoonlijks.",
      vandaagDoen: [
        {
          id: "core9-story1",
          label: "Plaats vandaag minimaal één Story (lifestyle, niet pitch)",
        },
        {
          id: "core9-ritme",
          label: "Plan een vast moment in je dag voor je dagelijkse Story",
        },
      ],
    },
    {
      nummer: 10,
      titel: "🎬 Reels-strategie + trigger-woorden",
      doel: "Begrijpen hoe Reels werken en hoe trigger-woorden mensen rechtstreeks naar jouw aanbod brengen.",
      watJeLeert:
        "Reels zijn op dit moment de beste manier om nieuwe mensen te bereiken op Instagram. Met trigger-woorden in een reactie (bijv. 'TIPS') stuur je geïnteresseerden automatisch een DM met je freebie. Geen Manychat-omweg, mensen komen direct in je ELEVA-systeem.",
      vandaagDoen: [
        {
          id: "core10-leer",
          label: "Bekijk een Reels-strategie-voorbeeld (komt in deze stap als film)",
        },
        {
          id: "core10-eerste",
          label: "Maak je eerste Reel (60-90 sec) over een hot topic in je niche",
        },
      ],
    },
    {
      nummer: 11,
      titel: "🎁 Freebies inzetten: gratis weggevers met effect",
      doel: "Een freebie kiezen uit ELEVA en delen via een unieke link die direct leads oplevert.",
      watJeLeert:
        "Een freebie is een gratis weggever (een mini-test, korte film, recept-kaart, of zelftest) die jouw prospect helpt en tegelijk hun gegevens in jouw ELEVA-pipeline zet. Founders hebben de freebies al gemaakt, jij hoeft alleen te kiezen welke past bij jouw doelgroep en de unieke share-link te delen.",
      vandaagDoen: [
        {
          id: "core11-kies",
          label: "Kies de freebie die past bij jouw doelgroep",
          uitleg: "Vraag je sponsor of de Mentor welke freebie het beste past.",
        },
        {
          id: "core11-deel",
          label: "Deel je freebie-link op 2 plekken (bijv. Instagram-bio + Story)",
        },
      ],
    },
    {
      nummer: 12,
      titel: "💬 Eerste klanten via warme markt",
      doel: "Drie mensen uit je warme markt benaderen met een klantvriendelijke uitnodiging.",
      watJeLeert:
        "Je warme markt is de eerste plek waar je echt iets kunt doen. Niet pushy uitnodigen voor 'business', wel rustig delen wat je doet en aanbieden om iets te laten zien als ze geïnteresseerd zijn. Vandaag stuur je drie zorgvuldige berichten aan mensen die je kent.",
      vandaagDoen: [
        {
          id: "core12-bericht1",
          label: "Stuur bericht 1 aan iemand uit je warme markt",
          actieRoute: "/scripts",
        },
        {
          id: "core12-bericht2",
          label: "Stuur bericht 2",
        },
        {
          id: "core12-bericht3",
          label: "Stuur bericht 3",
        },
      ],
    },
    {
      nummer: 13,
      titel: "🛡️ Bezwaren behandelen, Feel-Felt-Found",
      doel: "Een eenvoudige techniek leren om bezwaren te beantwoorden zonder in discussie te gaan.",
      watJeLeert:
        "Feel-Felt-Found: 'Ik begrijp dat je dat voelt. Anderen voelden dat ook. Wat ze vonden was...' Deze techniek werkt omdat je niet in discussie gaat, maar erkenning geeft en daarna een andere kant van het verhaal toont. Bezwaren zijn geen afwijzingen, het zijn vragen om geruststelling.",
      vandaagDoen: [
        {
          id: "core13-roleplay",
          label: "Doe 5 minuten roleplay met de Mentor over de 3 grootste bezwaren",
          actieRoute: "/coach",
        },
      ],
    },
    {
      nummer: 14,
      titel: "👋 Klantcontact en opvolging",
      doel: "Een routine bouwen voor het opvolgen van mensen die geïnteresseerd zijn maar nog niet hebben besteld.",
      watJeLeert:
        "80% van de business zit in de follow-up, niet in het eerste gesprek. Mensen hebben gemiddeld 4-6 contactmomenten nodig voordat ze beslissen. Vandaag leer je hoe je ELEVA's herinneringen-systeem gebruikt om niemand kwijt te raken.",
      vandaagDoen: [
        {
          id: "core14-herinnering",
          label: "Plan voor 3 prospects een opvolg-herinnering in",
          actieRoute: "/herinneringen",
        },
      ],
    },
    {
      nummer: 15,
      titel: "🔁 Hercontact en herhaalbestellingen",
      doel: "Een ritme krijgen om bestaande klanten op een prettige manier te benaderen voor hercontact.",
      watJeLeert:
        "Een tevreden klant die geen herhaalbestelling doet is geld dat op tafel ligt. Niet door te pushen, wel door op het juiste moment een persoonlijk berichtje te sturen 'hé hoe gaat het nu?'. ELEVA's namenlijst houdt voor je bij wie je een tijdje niet hebt gesproken.",
      vandaagDoen: [
        {
          id: "core15-check",
          label: "Stuur 3 bestaande klanten een persoonlijk hercontact-bericht",
          actieRoute: "/namenlijst",
        },
      ],
    },
    {
      nummer: 16,
      titel: "🗣️ Productervaring delen via testimonial-content",
      doel: "Een korte video of post maken waarin jij vertelt over je eigen productervaring.",
      watJeLeert:
        "Niets verkoopt zoals een echt verhaal. Vandaag deel je jouw eigen ervaring met een product dat jij gebruikt: wat deed het, wat veranderde, hoe lang heb je het al? Geen medische claims, gewoon eerlijk wat het voor jou betekende.",
      vandaagDoen: [
        {
          id: "core16-testimonial",
          label: "Maak één korte video (60-90 sec) over jouw productervaring",
        },
      ],
    },
    {
      nummer: 17,
      titel: "👀 Webshop-houders herkennen in je klantkring",
      doel: "Een bewustzijn ontwikkelen voor wie van je klanten zelf een webshop zou kunnen openen.",
      watJeLeert:
        "Niet elke klant wil zelf ondernemen, maar onder hen zitten ondernemende types die het wel zouden willen. Vandaag leer je signalen te herkennen: iemand die geïnteresseerd is in hoe jij het doet, iemand die ondernemers-energie heeft, iemand die zegt 'misschien moet ik dit ook eens proberen'.",
      vandaagDoen: [
        {
          id: "core17-lijst",
          label: "Markeer in je namenlijst 2-3 klanten die mogelijk Builder-energie hebben",
          actieRoute: "/namenlijst",
        },
      ],
    },
    {
      nummer: 18,
      titel: "💼 \"Open ook een webshop\"-scripts (duplicatie)",
      doel: "Een eenvoudige manier leren om iemand voor te stellen om zelf een webshop te openen.",
      watJeLeert:
        "Duplicatie is hoe je business groeit zonder dat jij meer uren werkt. Vandaag leer je hoe je een ontspannen voorstel doet aan iemand uit je klantkring: 'Hé, ik zie dat jij hier energie in hebt, heb je er ooit aan gedacht zelf een webshop te openen?' Geen druk, gewoon de optie aanbieden.",
      vandaagDoen: [
        {
          id: "core18-bericht",
          label: "Bereid een script voor voor één klant met Builder-energie",
          actieRoute: "/scripts",
        },
      ],
    },
    {
      nummer: 19,
      titel: "🎯 Closingsvragen, helpen beslissen",
      doel: "De moedigste vraag van het vak leren stellen: 'wat heb je nog nodig om te beslissen?'",
      watJeLeert:
        "Sommige prospects zijn al 6 weken in je pipeline en hebben nog niets besloten. De moedigste vraag in dit vak is 'wat heb je nog nodig om te beslissen?'. Lost vrijwel altijd één van twee dingen op: ofwel je krijgt het laatste bezwaar boven tafel, ofwel de prospect is rijp voor de volgende stap. Geen pushen, wel helpen kiezen.",
      vandaagDoen: [
        {
          id: "core19-vraag",
          label: "Stel deze vraag aan minstens één warme prospect",
        },
      ],
    },
    {
      nummer: 20,
      titel: "📊 5 types prospects + pipeline-onderhoud",
      doel: "Je prospects categoriseren zodat je je tijd investeert waar het rendement zit.",
      watJeLeert:
        "Vijf types prospects: actief zoekend, open, productkoper, niet-nu, en nooit. Niet iedereen verdient evenveel aandacht. Vandaag categoriseer je je top-20 prospects en zet je je tijd in waar het iets oplevert. ELEVA's namenlijst helpt je bij het overzicht.",
      vandaagDoen: [
        {
          id: "core20-cat",
          label: "Categoriseer je top-20 prospects in de 5 types",
          actieRoute: "/namenlijst",
        },
      ],
    },
    {
      nummer: 21,
      titel: "🏆 21 stappen klaar! Dit is je startlijn, niet de eindstreep",
      doel: "Reflecteren op de afgelopen 21 stappen en een doel zetten voor de volgende periode.",
      watJeLeert:
        "Je hebt nu het fundament: een werkende webshop, een eigen ritme van content delen, een lijst klanten in opbouw, en de skills om mensen door je flow te leiden. Dit is geen einde, dit is je startpunt. Vanaf hier wordt je eigen ritme leidend. Reflecteer eerlijk: wat werkte, wat schuurde, wat ga je de volgende periode anders doen?",
      vandaagDoen: [
        {
          id: "core21-reflectie",
          label: "Vul de eindreflectie in (10 min)",
        },
        {
          id: "core21-doel",
          label: "Stel één concreet doel voor de volgende 30 dagen",
        },
        {
          id: "core21-call",
          label: "Plan een call met je sponsor om je voortgang te bespreken",
        },
      ],
    },
  ],
};
