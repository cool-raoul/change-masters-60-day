// File: lib/reset-check/content.ts
//
// Rijke uitkomst-content voor de Reset-check: thema-blokken (laag/midden/hoog
// per thema), praktijk-tips, combinatie-inzichten, en nu/heen-teksten voor
// de kennis-gap sectie.
//
// Claim-vrij volgens docs/claimvrije-communicatie.md: we zeggen nooit wat
// de Reset DOET, wel wat mensen die het traject doen ERVAREN.

import type { ThemaBlokken, Tip, Thema } from "./types";

export const THEMA_BLOKKEN: ThemaBlokken = {
  spijsvertering: {
    laag: {
      titel: "Je spijsvertering lijkt rustig",
      tekst: "Op dit thema geven jouw antwoorden weinig signalen. Je darmen voelen comfortabel en je stoelgang is regelmatig. Een mooi uitgangspunt: een rustige spijsvertering is vaak de basis onder energie, gewicht en zelfs slaap.",
      praktijk: "Vanuit de praktijk zien we dat mensen die hier 'rustig' staan, meer ruimte hebben om met andere thema's te werken. Wat je hebt, wil je houden.",
    },
    midden: {
      titel: "Een paar signalen rond je spijsvertering",
      tekst: "Je darmen geven nu en dan een signaal. Vaak komt dit door de samenstelling van wat je eet en het tempo waarin je het eet. Goed nieuws: dit is meestal goed beïnvloedbaar zonder grote ingrepen.",
      praktijk: "In de praktijk merken mensen vaak verschil binnen 7 tot 10 dagen door 2 simpele aanpassingen: een eiwit-rijk ontbijt (niet brood) en 2 uur eet-pauze voor het slapen. Dat zijn geen Reset-tips, dat is gewoon hoe je darmen werken.",
    },
    hoog: {
      titel: "Je darmen vragen om aandacht",
      tekst: "Meerdere signalen tegelijk: opgeblazen gevoel, onregelmatige stoelgang, ongemak. Wat we in de praktijk vaak zien: een combinatie van jaren wisselend eten, stress, en mogelijk een verstoorde darmflora-balans. De darmen zijn als een tuin, ze hebben tijd nodig om in balans te komen.",
      praktijk: "Mensen met deze cijfers vertellen vaak dat rustigere darmen ook verschil maakten in hun energie en helderheid. In ons gesprek stemmen we af wat voor jou de juiste aanpak en samenstelling zou zijn.",
    },
  },
  gewicht: {
    laag: {
      titel: "Comfortabel met je gewicht",
      tekst: "Geen urgentie hier. De Reset hoeft voor jou geen gewichtsthema te zijn. Soms is het wel een mooi moment om de relatie met voeding te herijken zonder dat het om kilo's draait.",
      praktijk: "Mensen die hier 'comfortabel' staan, gebruiken de Reset vaak als periodieke herstart. Niet als noodzaak, wel als bewuste keuze.",
    },
    midden: {
      titel: "Een wens om lichter te voelen",
      tekst: "Niet om af te vallen, wel om anders te voelen. Vaak zit de verandering meer in je relatie met voeding dan in een cijfer. Lichter voelen begint bij minder pieken en dalen.",
      praktijk: "In de praktijk merken we dat mensen met deze score vaak overschatten hoeveel ze moeten veranderen. 80% van het verschil zit in 3 keuzes per dag: ontbijt met eiwit, geen ultra-bewerkt eten, 2 uur eet-pauze 's avonds. Klein, herhaalbaar.",
    },
    hoog: {
      titel: "Je voelt: zo wil ik niet blijven",
      tekst: "En je grijpt vaker dan je zou willen naar snel of zoet. Dat is geen gebrek aan wilskracht. Vaak is suiker-grijpen een dopamine-kortsluiting: je lichaam vraagt om een snelle pick-me-up omdat er ergens anders een tekort is (vaak slaap of eiwit).",
      praktijk: "Wat we leren in de praktijk: niet 'minder eten' werkt, wel 'andere keuzes makkelijker maken'. Begin bij je koelkast en je werkplek. Wat je niet ziet, eet je niet. Mensen die het traject doen vertellen vaak dat het patroon zich verschuift en dat afvallen voor hen een uitkomst is, niet het doel.",
    },
  },
  energie: {
    laag: {
      titel: "Je energie is op orde",
      tekst: "Stabiele dag-energie. Dat is een mooi fundament en zegt iets over hoe je slaap, voeding en beweging samenwerken.",
      praktijk: "Houd het stabiel. Veranderingen in slaap-ritme of stress-niveau merk je vaak het eerst hier.",
    },
    midden: {
      titel: "Een paar energie-dipjes",
      tekst: "Niet onhoudbaar, wel merkbaar. Vaak zit de oorzaak in bloedsuiker-schommelingen door wat je in de ochtend eet. Een ontbijt met snelle koolhydraten geeft je rond 11u een pump, en rond 14u de dip.",
      praktijk: "Eén week-experiment: vervang je ontbijt door iets met 20-25g eiwit (twee eieren, kwark met noten, of een goede shake). Veel mensen merken al in dag 4-5 dat hun middag-dip kleiner wordt.",
    },
    hoog: {
      titel: "Je energie is een dagelijks gevecht",
      tekst: "Zware dip, leeg eind van de dag, weinig reserves. Dit is geen kwestie van 'meer koffie'. Dit is een lichaam dat structureel meer geeft dan het terug krijgt.",
      praktijk: "Vanuit de praktijk: de 3 grootste energie-lekken zijn slechte slaap, brood-/koffie-ontbijt, en doorlopende stress zonder herstel-momenten. Mensen die het traject doen vertellen vaak dat hun energie stabieler wordt door de combinatie van voeding, ritme en herstel. Velen merken daarbij dat hun scherpte en helderheid ook anders gaan voelen.",
    },
  },
  slaap: {
    laag: {
      titel: "Je slaapt goed",
      tekst: "Een goudmijn. Goede slaap is de basis onder herstel, hormoonbalans en energie.",
      praktijk: "De grootste sluipgevaren voor slaap zijn alcohol (vooral binnen 3 uur voor bed), schermlicht en laat eten. Wat je hebt, wil je bewaken.",
    },
    midden: {
      titel: "Je slaap is wisselend",
      tekst: "Soms goed, soms onrustig of vroeg wakker. Slaap is vaak het eerste signaal van iets dat zich verderop in je systeem afspeelt: stress, voeding, of hormoonbalans. Vrouwen vanaf 40+ merken vaak hier de eerste signalen van overgang.",
      praktijk: "Een specifieke tip uit de praktijk: laatste maaltijd minstens 3 uur voor bed en geen scherm in het laatste uur. Eén week proberen geeft je vaak meteen antwoord of dit jouw hefboom is.",
    },
    hoog: {
      titel: "Je slaap vraagt echt aandacht",
      tekst: "Slecht inslapen of vaak wakker zijn beïnvloedt alles wat overdag gebeurt: je energie, je humeur, je voeding-keuzes. Vaak zit je zenuwstelsel 's avonds nog in vlucht-stand door wat overdag gebeurt.",
      praktijk: "Bij hardnekkige slaapproblemen is een gesprek met je arts altijd verstandig. Wat mensen vaak vertellen die het traject doen: rustiger inslapen vanaf week 2, en met meer scherpte wakker worden. Niet door iets specifiek 'voor slaap', wel doordat voeding en ritme zich anders zetten.",
    },
  },
  voeding: {
    laag: {
      titel: "Je eet bewust en bent nieuwsgierig",
      tekst: "Een goed fundament. Je intentie is nog licht, en dat is prima. Mensen die zo eten, gebruiken de Reset vaak om te verfijnen, niet om om te keren.",
      praktijk: "Voor wie hier zit is de Reset het meest een experiment: kijken wat 65 dagen aandacht aan je voeding voor je ZAL doen. Geen noodzaak, wel inzicht.",
    },
    midden: {
      titel: "Bewust en wat automatisme",
      tekst: "Je let erop, alleen de drukte van de dag wint soms. Je voelt zelf ook dat het anders mag. Die combinatie van bewustzijn met intentie is precies het moment waarop de Reset het meest aanvaart.",
      praktijk: "Vanuit de praktijk: mensen met deze cijfers hebben geen MEER informatie nodig. Ze hebben een ankerpunt nodig. Iets dat ze 65 dagen lang vasthoudt zodat het automatisme verschuift.",
    },
    hoog: {
      titel: "Een sterke intentie en veel ruimte voor verandering",
      tekst: "Je eet vaak kant-en-klaar of snel, terwijl je zelf weet dat het anders mag. Dat is eerlijke bewustwording, geen falen. Je zegt ook: ik ben er klaar voor. Die combinatie is goud waard 🥰",
      praktijk: "Mensen die hier zo sterk staan, hebben vaak één ding nodig: structuur waarbij ze niet meer hoeven kiezen. De Reset is precies dat. 65 dagen waarin het kader gegeven is. De eerste 5 dagen voelen vaak als 'oei, het is wel echt', daarna verrast de rust.",
    },
  },
  hormonen: {
    laag: {
      titel: "Je stemming en hormonale balans lijken rustig",
      tekst: "Op dit thema geef je weinig signalen. Je stemming is stabiel en je voelt geen sterke schommelingen. Mooi uitgangspunt, want hormonen raken alles aan: je slaap, je energie, je gewicht, je hoofd.",
      praktijk: "Mensen die hier zo stabiel zitten gebruiken de Reset vaak als preventieve check, niet als noodzaak. Wat je hebt, wil je houden 🥰",
    },
    midden: {
      titel: "Wat schommelingen die om aandacht vragen",
      tekst: "Je voelt af en toe pieken en dalen in je stemming, je welzijn, of je hormoonbalans. Vaak ligt de oorzaak in een combinatie van bloedsuiker, slaap en de levensfase waarin je zit. Het is iets om serieus te nemen, want hormonen sturen meer dan we soms denken.",
      praktijk: "Vanuit onze praktijk vertellen vrouwen vooral verschil te voelen wanneer hun bloedsuiker stabieler wordt. Het effect op stemming en slaap volgt vaak vanzelf, zonder dat ze er specifiek aan werken.",
    },
    hoog: {
      titel: "Sterke schommelingen die je dag beïnvloeden",
      tekst: "Opvliegers, slaap-onderbrekingen, stemmingswisselingen, gewichtsverschuivingen. Veel vrouwen ervaren deze dingen als 'losse problemen', terwijl ze meestal samenhangen met diepe biologische verschuivingen die jaren duren. Je bent hier niet alleen in 🥰",
      praktijk: "Veel vrouwen vertellen ons dat ze pas in onze gesprekken voor het eerst begrepen hoe deze losse signalen één verhaal zijn. In ons gesprek bespreken we hoe een persoonlijke aanpak hier op kan aansluiten, samen met je arts waar nodig.",
    },
  },
};

export const TIPS_PER_THEMA: Record<Thema, Tip[]> = {
  spijsvertering: [
    {
      titel: "Eerste hap = bittere groente",
      uitleg: "Rucola, radicchio, witlof, andijvie. De bittere smaak triggert je galblaas-functie wat je vetvertering ondersteunt. Niet een hele schaal, gewoon de eerste paar happen.",
    },
    {
      titel: "Kauw 20 keer per hap",
      uitleg: "Geen grap. Spijsvertering begint in de mond, niet in de maag. Door bewust te kauwen geef je je maag een voorsprong en eet je vaak vanzelf minder.",
    },
  ],
  gewicht: [
    {
      titel: "Eiwit-eerst ontbijt",
      uitleg: "20-25g eiwit binnen 1 uur na opstaan stabiliseert je bloedsuiker voor de hele ochtend. Twee eieren, een grote kwark, of een goede shake. Geen brood eerst.",
    },
    {
      titel: "Stop suiker-aankopen, niet suiker-eten",
      uitleg: "Wilskracht is een eindige bron. Wat je niet in huis hebt, eet je niet. Probeer 14 dagen je koelkast en kasten 'leeg te eten' en sla niets nieuws in.",
    },
  ],
  energie: [
    {
      titel: "Geen koffie binnen 90 min na opstaan",
      uitleg: "Je cortisol-piek is 's ochtends al hoog. Koffie er bovenop geeft een korte pump, maar verstoort je natuurlijke energie-curve. Drink eerst water + ontbijt.",
    },
    {
      titel: "Lunchpauze = échte pauze",
      uitleg: "10 minuten naar buiten, even niet eten + schermen. Veel mensen hebben hun middag-dip niet door 'lage bloedsuiker' maar door 'geen mentale reset gehad'.",
    },
  ],
  slaap: [
    {
      titel: "Laatste maaltijd 3 uur voor bed",
      uitleg: "Verteren kost veel kracht. Als je lichaam 's nachts vertert, kan het niet herstellen. Eerlijk: dit alleen al maakt vaak verschil in een week.",
    },
    {
      titel: "Slaapkamer kouder dan 18 graden",
      uitleg: "Je lichaam moet 's nachts iets afkoelen om diepe slaap te bereiken. Een warme kamer = onrustige slaap. Klein gebaar, vaak groot effect.",
    },
  ],
  voeding: [
    {
      titel: "Vier vragen-test bij elke aankoop",
      uitleg: "Voor je iets in je winkelmandje legt: 1) Zou mijn oma dit herkennen als eten? 2) Hoeveel ingrediënten? 3) Kan ik ze uitspreken? 4) Hoeveel suiker per 100g? Als 2 antwoorden 'nee' zijn, laat je 'm liggen.",
    },
    {
      titel: "Plan 1 verandering per week",
      uitleg: "Niet alles tegelijk. Een week alleen je ontbijt aanpakken. Volgende week je lunch. Daarna je avond. Mensen die alles tegelijk veranderen, houden het 8 dagen vol.",
    },
  ],
  hormonen: [
    {
      titel: "Bloedsuiker stabiel houden = stemming stabiel houden",
      uitleg: "Pieken en dalen in je bloedsuiker triggeren pieken en dalen in je hormonen, en daarmee je stemming. Eiwit en vezels bij elke maaltijd dempen die schommelingen.",
    },
    {
      titel: "Korte krachtoefeningen, 2x per week",
      uitleg: "Vrouwen 35+ profiteren extra van een beetje krachttraining. Het helpt je hormonale balans en behoudt je spiermassa. 20 minuten is genoeg, drempel laag houden.",
    },
  ],
};

export const NU_PER_THEMA: Record<Thema, string> = {
  spijsvertering: "een buik die regelmatig opspeelt en je dag stuurt",
  gewicht: "een gewicht waar je niet lekker mee zit",
  energie: "energie-dips waar je doorheen moet vechten",
  slaap: "nachten die niet brengen wat ze zouden moeten",
  voeding: "een eet-patroon dat anders mag maar niet vanzelf verschuift",
  hormonen: "stemmingsschommelingen en hormonen die je dag soms uit balans gooien",
};

export const HEEN_PER_THEMA: Record<Thema, string> = {
  spijsvertering: "een buik die je vergeet, want hij doet gewoon zijn werk",
  gewicht: "kleding die zit zoals je 'm wilt, en een gevoel dat klopt",
  energie: "energie die de hele dag stabiel meekomt, ook 's avonds",
  slaap: "diepe nachten en uitgerust opstaan, zonder de strijd",
  voeding: "vanzelfsprekende keuzes die je niet meer hoeft te bevechten",
  hormonen: "een rustig hoofd en stabiele stemming, ook op zware dagen",
};

export const AFVAL_WENS_TEKST: Record<string, string> = {
  "0-5": "een paar kilo lichter",
  "5-10": "5 tot 10 kilo lichter",
  "10-20": "10 tot 20 kilo lichter",
  "20+": "20 kilo lichter of meer",
};

export const BRUG_TEKST = `Het verschil tussen waar je nu bent en waar je heen wilt, gaat niet over meer tips of meer wilskracht. Dat hebben we allemaal al genoeg geprobeerd. Wat wel werkt, is een gestructureerde aanpak die je lichaam de tijd en ruimte geeft om die overgang te maken, zonder dat je elke dag opnieuw hoeft te beslissen.

Daar hebben wij, als team binnen een Europees bedrijf dat al 35 jaar met deze producten werkt, de Holistic Reset voor. Een traject van 65 dagen, dat we in ons gesprek persoonlijk op jou afstemmen 🥰`;
