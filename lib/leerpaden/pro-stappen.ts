// ============================================================
// Pro leerpad, 14 stappen voor professionals met cliënten
//
// Voor coaches, diëtisten, fitness-trainers, masseurs etc. die producten
// via een eigen Lifeplus-webshop aan hun cliënten willen aanbieden.
// Korter dan Core (geen social-media-strategie nodig), wel rijke focus
// op cliëntbediening, standaardpakketten en de productadvies-test als
// kerninstrument.
//
// Films per stap kunnen worden geplaatst in /instellingen/films met
// slug "pro-stap-N" (waarbij N het stap-nummer is, 1 t/m 14).
// ============================================================

import type { Leerpad } from "./types";

export const PRO_LEERPAD: Leerpad = {
  modus: "pro",
  naam: "Professional, cliëntbediening",
  totaal: 14,
  stappen: [
    {
      nummer: 1,
      titel: "🚀 Welkom! Vandaag begint je weg als Lifeplus-professional",
      doel: "Helder krijgen wat de Pro-route inhoudt en hoe ELEVA je gaat ondersteunen.",
      watJeLeert:
        "ELEVA Pro is voor jou als coach, diëtist, fitness-trainer of andere professional die hun cliënten wil ondersteunen met hoogwaardige supplementen via een eigen Lifeplus-webshop. Geen sprint-druk, wel een leerpad van 14 stappen waarin je leert hoe je producten op een natuurlijke manier in je praktijk integreert, zonder pushy te zijn.",
      vandaagDoen: [
        {
          id: "pro1-why",
          label: "Maak je WHY samen met de Mentor",
          uitleg:
            "Waarom voeg je producten toe aan je praktijk? Wat wil je betekenen voor je cliënten? De ELEVA Mentor helpt je dit te formuleren.",
          verplicht: true,
          actieRoute: "/mijn-why",
        },
        {
          id: "pro1-sponsor",
          label: "Stuur je sponsor een berichtje: 'ik ben gestart'",
          verplicht: true,
        },
        {
          id: "pro1-mentor",
          label: "Stel je eerste vraag aan de ELEVA Mentor",
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
      titel: "👥 Cliëntenlijst opzetten + sponsor-call",
      doel: "Een eerste lijst van cliënten waar deze producten mogelijk passen + kennismakingscall sponsor.",
      watJeLeert:
        "Voordat je begint met aanbieden, wil je een gevoel hebben van wie van je huidige cliënten passend zou zijn voor welk product. Niet om er meteen iets aan te verkopen, maar om te weten waar je later mee aan de slag kunt. De namenlijst-functie van ELEVA werkt prima als cliëntenlijst.",
      vandaagDoen: [
        {
          id: "pro2-clienten",
          label: "Voeg minimaal 10 cliënten toe aan je lijst",
          uitleg:
            "Cliënten die je regelmatig ziet, met klachten of doelen waar producten kunnen ondersteunen.",
          verplicht: true,
          actieRoute: "/namenlijst",
        },
        {
          id: "pro2-sponsor-call",
          label: "Plan een kennismakings-call met je sponsor (~30 min)",
          uitleg:
            "Je sponsor heeft vaak ervaring in de professional-markt en kan je goed op weg helpen.",
          verplicht: true,
        },
      ],
      waarInEleva: [{ actie: "Naar je cliëntenlijst", route: "/namenlijst" }],
    },
    {
      nummer: 3,
      titel: "🛒 Webshop opzetten, de admin-dag",
      doel: "Drie administratieve fundamenten van je Lifeplus-business op één dag rondzetten.",
      watJeLeert:
        "Vandaag zet je de drie fundamenten neer: je eigen webshop, je kredietformulier (zodat je betaald kunt worden), en je teams-administratie. Eénmalig werk, daarna kun je verder met het echte werk.",
      vandaagDoen: [
        {
          id: "pro3-webshop",
          label: "🛒 Lifeplus webshop aanmaken",
          verplicht: true,
        },
        {
          id: "pro3-krediet",
          label: "✅ Kredietformulier invullen (verplicht voor uitbetaling)",
          verplicht: true,
        },
        {
          id: "pro3-teams",
          label: "📋 Teams-administratiesysteem aanmaken",
          verplicht: true,
        },
      ],
    },
    {
      nummer: 4,
      titel: "🔗 Bestellinks koppelen + productadvies-test verkennen",
      doel: "Je webshop koppelen aan ELEVA en de productadvies-test leren kennen.",
      watJeLeert:
        "ELEVA gebruikt je webshop-links om in productadvies-flows automatisch naar de juiste plek te verwijzen. De productadvies-test wordt jouw belangrijkste tool om cliënten passende producten aan te bevelen, zonder dat je zelf alles uit het hoofd hoeft te kennen.",
      vandaagDoen: [
        {
          id: "pro4-bestellinks",
          label: "🔗 Koppel je webshop-links aan ELEVA",
          verplicht: true,
          actieRoute: "/instellingen/bestellinks",
        },
        {
          id: "pro4-test",
          label: "Doe zelf de productadvies-test (~3 min)",
          uitleg:
            "Door 'm zelf te doen weet je hoe je cliënten 'm ervaren en wat eruit kan komen.",
          actieRoute: "/test-pakket-bouwer",
        },
      ],
    },
    {
      nummer: 5,
      titel: "📦 Productkennis: welke producten verkoop jij?",
      doel: "Een basis-overzicht van de Lifeplus-producten en voor welke cliënten ze passen.",
      watJeLeert:
        "Je hoeft niet alles uit je hoofd te kennen, maar wel een gevoel te hebben van de hoofdcategorieën: Daily BioBasics als fundamentele basis, OmeGold voor omega-3, Proanthenols voor antioxidanten, en de programma's (Holistic Reset, Darmen in Balans, Stress Less). De ELEVA Mentor kent alle details.",
      vandaagDoen: [
        {
          id: "pro5-mentor",
          label: "Vraag de Mentor: welke producten passen bij mijn cliënt-profiel?",
          actieRoute: "/coach",
        },
        {
          id: "pro5-eigen",
          label: "Bestel je eigen pakket als je dat nog niet hebt",
          uitleg: "Eigen ervaring is je beste advies-instrument.",
        },
      ],
    },
    {
      nummer: 6,
      titel: "🎁 Standaardpakketten verkennen",
      doel: "De voorgemaakte pakketten kennen die je cliënten kunt aanbieden.",
      watJeLeert:
        "ELEVA heeft een aantal standaardpakketten die we samen hebben uitgewerkt: Reset, Darmen in Balans, Stress Less, Energy & Focus, etc. Vandaag leer je welke er zijn, voor wie ze passen, en hoe je ze gebruikt in je advies-flow. Later kun je hier eigen pakketten aan toevoegen voor jouw specifieke vakgebied.",
      vandaagDoen: [
        {
          id: "pro6-pakketten",
          label: "Bekijk de standaardpakketten en kies 3 die je vaak zult adviseren",
          actieRoute: "/instellingen/bestellinks",
        },
      ],
    },
    {
      nummer: 7,
      titel: "🎯 Productadvies-test als kerninstrument",
      doel: "Diepgaand leren hoe je de productadvies-test gebruikt voor cliëntbediening.",
      watJeLeert:
        "De productadvies-test is jouw kerninstrument. Je stuurt 'm naar je cliënt, hij of zij doet 'm in 3 minuten, en jij krijgt automatisch een passend pakket-advies dat je nog kunt aanpassen voor jouw specifieke kennis. Vandaag leer je hoe je 'm verstuurt, hoe je het advies aanpast, en hoe je het naar je cliënt doorstuurt.",
      vandaagDoen: [
        {
          id: "pro7-stuur",
          label: "Stuur de test aan één bestaande cliënt",
          actieRoute: "/test-pakket-bouwer",
        },
        {
          id: "pro7-mentor",
          label:
            "Vraag de Mentor: hoe pas ik het advies aan voor een cliënt met klacht X?",
          actieRoute: "/coach",
        },
      ],
    },
    {
      nummer: 8,
      titel: "💬 Eerste 3 cliënten een advies sturen",
      doel: "Drie cliënten een persoonlijk productadvies sturen, gebaseerd op de test.",
      watJeLeert:
        "Vandaag breng je in praktijk wat je gisteren leerde: drie cliënten een productadvies-test sturen of een persoonlijk advies geven gebaseerd op wat je over hen weet. Niet pushy, gewoon helpen. Als ze niet doen, geen probleem. Als ze wel doen, top.",
      vandaagDoen: [
        {
          id: "pro8-clientt1",
          label: "Stuur cliënt 1 een advies of de test",
        },
        {
          id: "pro8-clientt2",
          label: "Stuur cliënt 2 een advies of de test",
        },
        {
          id: "pro8-clientt3",
          label: "Stuur cliënt 3 een advies of de test",
        },
      ],
    },
    {
      nummer: 9,
      titel: "👋 Cliëntcontact en opvolging",
      doel: "Een routine bouwen voor het opvolgen van cliënten die nog niet hebben besteld.",
      watJeLeert:
        "Niet elke cliënt bestelt direct. Vaak hebben ze even tijd nodig om over je advies na te denken. Vandaag leer je hoe je ELEVA's herinneringen-systeem gebruikt om niemand kwijt te raken zonder dat het opdringerig wordt. Een vriendelijk berichtje na een week werkt vaak beter dan tien herinneringen na een dag.",
      vandaagDoen: [
        {
          id: "pro9-herinnering",
          label: "Plan voor 3 cliënten een opvolg-herinnering in",
          actieRoute: "/herinneringen",
        },
      ],
    },
    {
      nummer: 10,
      titel: "🔁 Hercontact en herhaalbestellingen",
      doel: "Een ritme krijgen om bestaande klanten op een prettige manier te benaderen voor hercontact.",
      watJeLeert:
        "Een tevreden cliënt die geen herhaalbestelling doet is geld dat op tafel ligt. Niet door te pushen, wel door op het juiste moment een persoonlijk berichtje te sturen 'hé hoe gaat het met je darmprogramma?'. ELEVA's namenlijst houdt voor je bij wie je een tijdje niet hebt gesproken.",
      vandaagDoen: [
        {
          id: "pro10-check",
          label: "Stuur 3 bestaande klanten een persoonlijk hercontact-bericht",
          actieRoute: "/namenlijst",
        },
      ],
    },
    {
      nummer: 11,
      titel: "🛡️ Bezwaren behandelen, Feel-Felt-Found",
      doel: "Een eenvoudige techniek leren om bezwaren te beantwoorden zonder in discussie te gaan.",
      watJeLeert:
        "Feel-Felt-Found: 'Ik begrijp dat je dat voelt. Anderen voelden dat ook. Wat ze vonden was...' Deze techniek werkt omdat je niet in discussie gaat, maar erkenning geeft en daarna een andere kant van het verhaal toont. Voor professionals werkt dit extra goed omdat je als expert geloofwaardig bent.",
      vandaagDoen: [
        {
          id: "pro11-roleplay",
          label: "Doe 5 minuten roleplay met de Mentor over de 3 grootste bezwaren",
          actieRoute: "/coach",
        },
      ],
    },
    {
      nummer: 12,
      titel: "👀 Andere professionals herkennen in je netwerk",
      doel: "Een bewustzijn ontwikkelen voor andere professionals in jouw kring die hier ook baat bij hebben.",
      watJeLeert:
        "Jij bent niet de enige professional in je netwerk. Andere coaches, diëtisten, masseurs, fitness-trainers in jouw stad of online netwerk zijn allemaal kandidaat-professionals voor een eigen Lifeplus-webshop. Vandaag leer je signalen te herkennen en hoe je ze rustig kunt benaderen.",
      vandaagDoen: [
        {
          id: "pro12-lijst",
          label: "Markeer 3-5 professionals in je netwerk als kandidaat",
          actieRoute: "/namenlijst",
        },
      ],
    },
    {
      nummer: 13,
      titel: "💼 Voorstel doen aan een collega-professional",
      doel: "Een eenvoudige manier leren om aan een andere professional voor te stellen om zelf een webshop te openen.",
      watJeLeert:
        "Duplicatie via professionals is anders dan duplicatie naar gewone klanten. Hier benader je iemand die het vak begrijpt, die zelf cliënten heeft, die het verhaal direct snapt. Geen sales-pitch, maar collegiaal: 'Hé, ik werk sinds een tijdje met Lifeplus voor mijn cliënten en zie veel resultaat. Heb jij ooit overwogen om producten in je praktijk aan te bieden?'",
      vandaagDoen: [
        {
          id: "pro13-bericht",
          label: "Bereid een voorstel-script voor één collega-professional",
          actieRoute: "/scripts",
        },
      ],
    },
    {
      nummer: 14,
      titel: "🏆 14 stappen klaar! Dit is je startlijn, niet de eindstreep",
      doel: "Reflecteren op de afgelopen 14 stappen en een doel zetten voor de volgende periode.",
      watJeLeert:
        "Je hebt nu het fundament: een werkende webshop, ervaring met de productadvies-test, een routine voor cliëntcontact en hercontact, en de eerste cliënten die producten gebruiken. Dit is geen einde, dit is je startpunt. Reflecteer eerlijk: wat werkte, wat liep niet soepel, wat ga je de volgende periode anders doen?",
      vandaagDoen: [
        {
          id: "pro14-reflectie",
          label: "Vul de eindreflectie in (10 min)",
        },
        {
          id: "pro14-doel",
          label: "Stel één concreet doel voor de volgende 30 dagen",
        },
        {
          id: "pro14-call",
          label: "Plan een call met je sponsor om je voortgang te bespreken",
        },
      ],
    },
  ],
};
