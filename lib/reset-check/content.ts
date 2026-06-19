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
      titel: "Je spijsvertering is lekker rustig",
      tekst: "Wat fijn, op dit thema geven jouw antwoorden weinig signalen 🥰 Je darmen voelen rustig en je stoelgang is gewoon zoals het hoort. Heel veel mensen hebben hier echt wat aandacht voor nodig, jij hebt het al goed staan 👍🏽",
      praktijk: "Vanuit ons werk weten we, als je darmen rustig zijn, dan heb je veel meer ruimte om met andere thema's bezig te zijn. Wat jij hier hebt, dat is best bijzonder. Mooi om te koesteren.",
    },
    midden: {
      titel: "Een paar signaaltjes uit je darmen",
      tekst: "Je darmen geven nu en dan een seintje, dat hoort erbij. Vaak heeft het te maken met wat je eet, hoe snel je eet, en hoeveel rust je tussen je maaltijden hebt. Goed nieuws, dit zijn meestal dingen die je gewoon kunt aanpakken zonder grote omwentelingen.",
      praktijk: "Wij zien zo vaak dat mensen verschil gaan voelen door 2 hele simpele dingetjes: een ontbijt met eiwit (geen brood dus) en minstens 2 uur tussen je avondeten en bedtijd. Dat zijn geen Reset-tips, dat is gewoon hoe je darmen werken 🥰",
    },
    hoog: {
      titel: "Je darmen vragen wat liefde",
      tekst: "Meerdere signalen tegelijk: dat opgeblazen gevoel, onregelmatige stoelgang, ongemak in je buik. Wat wij zo vaak zien, het is een mooie mix van jaren wisselend eten, stress die zijn werk doet, en een darmflora die uit balans is geraakt. Je darmen zijn als een tuin, geef ze de tijd 🥰",
      praktijk: "Heel veel mensen met deze cijfers vertellen ons dat rustigere darmen ook verschil maakten in hun energie en helderheid, alles hangt met elkaar samen. In ons gesprek kijken we samen welke aanpak en samenstelling het beste bij jou past 👍🏽",
    },
  },
  gewicht: {
    laag: {
      titel: "Je zit lekker in je vel qua gewicht",
      tekst: "Geen urgentie hier, wat fijn. De Reset hoeft voor jou geen gewichtsverhaal te zijn. Wat wij vaak zien, mensen die hier comfortabel zitten gebruiken de Reset gewoon als een mooie periodieke herstart van hun systeem 🥰",
      praktijk: "Soms is het ook gewoon een fijn moment om je relatie met voeding even op te frissen, zonder dat het over kilo's gaat. Wat je hebt, wil je houden, en daar mag je af en toe even bewust naar kijken.",
    },
    midden: {
      titel: "Een wens om wat lichter te voelen",
      tekst: "Niet zozeer afvallen, wel dat lichtere gevoel terugkrijgen. Vaak zit het meer in je relatie met voeding dan in een nummer op de weegschaal. Lichter voelen begint bij minder pieken en dalen in je dag 🥰",
      praktijk: "Wij zien zo vaak dat mensen met deze cijfers overschatten hoeveel ze moeten veranderen. 80% van het verschil zit in 3 keuzes per dag, niet meer: ontbijt met eiwit, geen kant-en-klaar troep, en 2 uur niks eten voor je gaat slapen. Klein, herhaalbaar, doenbaar 👍🏽",
    },
    hoog: {
      titel: "Je voelt heel duidelijk: zo wil ik niet blijven",
      tekst: "En je grijpt vaker naar snel of zoet dan je zelf zou willen. Dat heeft niks met wilskracht te maken hoor, echt niet. Suiker-grijpen is meestal een teken dat je lichaam ergens om een snelle boost vraagt, vaak vanwege te weinig slaap of te weinig eiwit eerder op de dag.",
      praktijk: "Wat wij in ons werk geleerd hebben: niet 'minder eten' werkt, wel 'andere keuzes makkelijker maken'. Begin bij je koelkast en je werkplek. Wat je niet ziet, eet je ook niet 🥰 Heel veel mensen die het traject doen vertellen ons dat hun patroon vanzelf gaat verschuiven en dat afvallen daarmee een mooie uitkomst is, geen doel meer.",
    },
  },
  energie: {
    laag: {
      titel: "Je energie zit goed",
      tekst: "Stabiele dag-energie, wat een geluk. Dat zegt iets over hoe je slaap, voeding en beweging op elkaar zijn afgestemd. Mooi fundament 🥰",
      praktijk: "Houd dit stabiel hoor. Veranderingen in je slaapritme of een drukke stress-periode, dat merk je vaak hier het eerst. Wees daar lief voor jezelf in.",
    },
    midden: {
      titel: "Een paar energie-dipjes door je dag",
      tekst: "Niet onhoudbaar, wel merkbaar. Vaak komt het door schommelingen in je bloedsuiker, en dat begint vaak al bij je ontbijt. Een snelle koolhydraat-ontbijt geeft je rond 11u nog een boost, en rond 14u de afhakker.",
      praktijk: "Probeer eens een weekje, vervang je ontbijt door iets met 20-25g eiwit. Twee eieren, een grote kwark met noten, of een goede shake. Heel veel mensen merken dat hun middagdip kleiner wordt 👍🏽",
    },
    hoog: {
      titel: "Je energie is een dagelijks gevecht",
      tekst: "Zware dip, leeg aan het einde van de dag, weinig reserves over. Dat hou je niet vol op koffie alleen. Dit is je lichaam dat zegt: ik geef meer dan ik terugkrijg, en ik heb je nodig 🥰",
      praktijk: "Wat wij vanuit ons werk weten, de 3 grootste energielekken zijn slechte slaap, brood-of-koffie ontbijt, en doorlopende stress zonder rustmomenten. Heel veel mensen die het traject doen vertellen ons dat hun energie stabieler werd, juist door die combinatie van voeding, ritme en herstel. En vaak merken ze daarbij ook dat hun helderheid en scherpte anders gaan voelen.",
    },
  },
  slaap: {
    laag: {
      titel: "Je slaapt heerlijk",
      tekst: "Een goudmijn hebbe je daar 🥰 Goede slaap is echt het fundament onder herstel, je hormoonbalans, en je energie. Mooi om te koesteren.",
      praktijk: "Pas op met de drie grote slaapdieven: alcohol (vooral binnen 3 uur voor je naar bed gaat), schermlicht 's avonds, en laat eten. Wat je hebt, wil je echt bewaken.",
    },
    midden: {
      titel: "Je slaap is wisselend",
      tekst: "Soms goed, soms onrustig of veel te vroeg wakker. Slaap is vaak het eerste wat je merkt als er ergens anders iets schuurt: stress, voeding, of je hormoonbalans. Heel veel vrouwen vanaf 40+ merken juist hier de eerste tekenen van de overgang.",
      praktijk: "Probeer eens een week: laatste maaltijd minimaal 3 uur voor je naar bed gaat, en geen scherm in het laatste uur. Heel simpel, geeft je vaak meteen antwoord op de vraag of dit jouw hefboom is 🥰",
    },
    hoog: {
      titel: "Je slaap heeft echt aandacht nodig",
      tekst: "Slecht inslapen of vaak wakker worden, dat beïnvloedt echt alles wat overdag gebeurt: je energie, je humeur, je keuzes rond voeding. Vaak zit je zenuwstelsel 's avonds nog in vlucht-stand van wat overdag is gebeurd. Je bent hier niet alleen in 🥰",
      praktijk: "Bij hardnekkige slaapproblemen is een gesprek met je arts altijd verstandig. Wat heel veel mensen die het traject doen ons vertellen: rustiger inslapen, en met meer scherpte wakker worden. Niet door iets dat specifiek 'voor slaap' is, gewoon doordat voeding en ritme zich anders zetten.",
    },
  },
  voeding: {
    laag: {
      titel: "Je eet bewust en bent nieuwsgierig",
      tekst: "Een mooi fundament. Je intentie is nog wat zacht, en dat is helemaal oké 🥰 Mensen die al zo eten, gebruiken de Reset vaak om hun eet-patroon nog wat te verfijnen, niet om alles om te gooien.",
      praktijk: "Voor jou is de Reset vooral een soort experiment, kijken wat 65 dagen aandacht aan je voeding je brengt. Geen noodzaak, wel een mooi inzicht in waar je staat.",
    },
    midden: {
      titel: "Bewust, alleen wint de drukte van de dag soms",
      tekst: "Je let erop, alleen die drukke dagen, die winnen het soms. Je voelt zelf ook dat het anders mag. Wij zien dit zo vaak, die combinatie van bewustzijn met de wens om te veranderen, dat is precies het moment waarop de Reset het allermooist aanvaart 🥰",
      praktijk: "Wat wij in ons werk weten: mensen met deze cijfers hebben geen MEER informatie nodig. Ze hebben een anker nodig. Iets wat ze 65 dagen lang vasthoudt, zodat het automatisme zachtjes gaat verschuiven 👍🏽",
    },
    hoog: {
      titel: "Een sterke intentie met veel ruimte voor verandering",
      tekst: "Je eet vaak kant-en-klaar of snel, en je weet zelf heel goed dat het anders mag. Dat is eerlijke bewustwording hoor, geen falen 🥰 En je zegt ook: ik ben er klaar voor. Die combinatie, daar hou ik van. Goud waard.",
      praktijk: "Mensen die hier zo sterk staan, hebben vaak één ding nodig: een structuur waarbij ze niet meer hoeven kiezen. En dat is precies wat de Reset doet. 65 dagen waarin het kader er gewoon is. De eerste 5 dagen voelen vaak van 'oei, het is wel echt', en daarna verrast die rust mensen vaak helemaal 👍🏽",
    },
  },
  hormonen: {
    laag: {
      titel: "Je stemming en hormonale balans zijn lekker rustig",
      tekst: "Op dit thema geef je weinig signalen, wat fijn 🥰 Je stemming is stabiel en je voelt geen sterke schommelingen. Mooi uitgangspunt, want hormonen raken zoveel: je slaap, je energie, je gewicht, je hoofd.",
      praktijk: "Mensen die hier zo stabiel zitten gebruiken de Reset vaak als preventieve check, niet als noodzaak. Wat je hebt, wil je echt houden hoor.",
    },
    midden: {
      titel: "Wat schommelingen die om aandacht vragen",
      tekst: "Je voelt af en toe pieken en dalen in je stemming, je welzijn, of je hormoonbalans. Vaak heeft dat te maken met een combinatie van bloedsuiker, slaap, en de levensfase waarin je zit. Het is iets om serieus te nemen hoor, hormonen sturen meer dan we vaak doorhebben.",
      praktijk: "Vanuit ons werk, vrouwen vertellen ons zo vaak dat ze het verschil voelden zodra hun bloedsuiker stabieler werd. En dan volgde de stemming en slaap vaak vanzelf, zonder dat ze daar specifiek aan werkten 🥰",
    },
    hoog: {
      titel: "Sterke schommelingen die je dag beïnvloeden",
      tekst: "Opvliegers, slaap die onderbroken raakt, stemmingswisselingen, je gewicht dat verschuift. Heel veel vrouwen ervaren deze dingen als 'losse problemen', terwijl het meestal samenhangt met diepe biologische veranderingen die jaren duren. Je bent hier echt niet alleen in 🥰",
      praktijk: "Heel veel vrouwen vertellen ons dat ze pas in onze gesprekken voor het eerst begrepen hoe al deze losse signalen eigenlijk één verhaal zijn. In ons gesprek bespreken we hoe een persoonlijke aanpak hierop kan aansluiten, samen met je arts waar dat nodig is.",
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
