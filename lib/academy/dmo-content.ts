// ============================================================
// lib/academy/dmo-content.ts
//
// Tweede training in ELEVA Academy: 'Het Dagelijkse Ritme (DMO)'.
//
// 5 modules, 15 lessen, eigen tempo. Voor Sprint-deelnemers
// (prominent vanaf dag 1, want dit verklaart waarom de hogere
// dagdoelen in Bouwen/Doorbreken sneller resultaat geven), Core
// (optioneel), Pro (optioneel).
//
// DMO = Daily Method of Operation. Het concept is universeel in
// netwerk-marketing, niet eigendom van één coach. ELEVA's invulling
// is gekoppeld aan ons tempo-systeem (Fundament 5/2/3, Bouwen
// 10/4/6, Doorbreken 15/6/10) en het 60-daagse Sprint-anker.
//
// CONTENT-NOOT: bewust GEEN externe trainersnamen in de zichtbare
// content. Principes vrij door ELEVA verteld. Latere polish-rondes
// voegen verfijning toe vanuit Raouls eigen vakkennis en live-
// trainingen.
//
// CLAIM-VRIJ: nooit absolute resultaat-tijdslijnen. Wel wel ratio's,
// signaal-snelheid en wiskunde van activiteit. Compliant met
// EFSA-richtlijnen + ACM-claims-regels.
// ============================================================

import type { AcademyTraining, AcademyLes } from "./types";

// ============================================================
// MODULE 1, Het principe, waarom dagelijks groter is dan wekelijks
// ============================================================

const M1: AcademyLes[] = [
  {
    sleutel: "1.1",
    titel: "Wat is een DMO, en wat is het NIET",
    leestijdMinuten: 9,
    inhoud: `DMO staat voor Daily Method of Operation. Vrij vertaald: je dagelijkse ritme. De drie tot vier activiteiten waarvan je weet dat ze, herhaald, resultaat opleveren. Niet je doel. Niet je droom. Je ACTIVITEIT.

Dit klinkt simpel maar het verschil tussen mensen die resultaat boeken en mensen die afhaken zit hier. Niet in hun talent, niet in hun WHY, niet in hun verhaal. In wat ze elke dag DOEN.

**Het verschil tussen DOEL en INPUT**

Een doel is een resultaat dat je wilt. "Ik wil 5 partners deze maand". Een doel ligt buiten jouw controle. Of mensen ja zeggen of nee, of ze net op dat moment klaar zijn, of ze net een rotweek hebben, dat bepaal jij niet.

Een input is iets wat jij DOET, ongeacht uitkomst. "Vandaag open ik 5 nieuwe gesprekken". Een input ligt 100% binnen jouw cirkel. Of de uitkomst tegenvalt of meevalt, het feit dat je het deed staat vast.

Topmensen meten alleen hun input. Beginners meten alleen hun resultaat, raken gefrustreerd, stoppen. De ironie: door alleen op INPUT te focussen krijg je betere RESULTATEN dan wanneer je op resultaten focust. Want zonder input is er geen resultaat mogelijk, en met genoeg input komt resultaat vanzelf langs.

**Een DMO is geen quota**

Een quota voelt als straf als je 'm niet haalt. Een DMO is een afspraak met jezelf, geen rechtbank. Mis je een dag, dan beoordeel je niet of het 'mocht', je kijkt waarom en past je tempo aan zodat het wel kan.

Een DMO is ook geen zelfgemaakte druk. Het is precies het tegenovergestelde. Door een vast ritme te kiezen dat past bij jouw tempo (Fundament, Bouwen of Doorbreken), neem je de stress weg. Je hoeft niet meer dagelijks te beslissen "wat ga ik vandaag doen". Het staat al klaar.

**Tijdens de Sprint is je DMO bovenaan je dag-flow**

De keuze die je in onboarding maakte (Fundament 2 uur, Bouwen 4 uur of Doorbreken 6 uur) is jouw DMO voor deze 60 dagen. ELEVA berekent op basis daarvan elke dag jouw aantal contacten, uitnodigingen en follow-ups. Je hoeft niets te onthouden, je opent /vandaag en het staat er. Dat is de hele kracht: het automatiseren van de denk-laag, zodat jij alleen nog hoeft te DOEN.

**Drie redenen waarom dagelijks groter is dan wekelijks:**

- Dagelijks bouwt aan een GEWOONTE. Wekelijks blijft een actie.
- Dagelijks zorgt dat je pijplijn nooit leegloopt. Wekelijks bouwt en breekt af.
- Dagelijks is mentaal lichter. 5 mensen vandaag voelt minder zwaar dan 35 mensen op zondagavond.`,
    oefening:
      "Open je notitie-app. Schrijf in 1 zin op: 'Mijn DMO is om dagelijks [aantal] gesprekken, [aantal] uitnodigingen en [aantal] follow-ups te doen volgens mijn [tempo].' Vul de aantallen in die ELEVA voor jou heeft berekend in /vandaag.",
  },
  {
    sleutel: "1.2",
    titel: "De wiskunde van het percentage-spel",
    leestijdMinuten: 11,
    inhoud: `Hier wordt het concreet. We gaan rekenen. Niet om je te motiveren met dromen, maar om je te laten zien wat er WISKUNDIG gebeurt als je je tempo verhoogt.

In netwerkmarketing is een veelvoorkomende ratio: van elke 10 tot 20 mensen die je benadert, reageert er gemiddeld 1 met serieuze interesse. Van die 1 met interesse haakt vervolgens een deel weer af, en blijft een kleinere groep over die echt klant of partner wordt.

Dit is een GEMIDDELDE. Bij jouw warmste 10 contacten kan het 1 op 3 zijn. Bij koude prospects op LinkedIn kan het 1 op 50 zijn. Maar op de hele groep heen, over tijd, neutraliseert het zich naar een vrij stabiele ratio.

**Wat betekent dit voor jouw tempo?**

Pak even ELEVA's drie tempo-niveaus erbij:

**Fundament (2u/dag): 5 contacten per dag**

5 contacten x 7 dagen = 35 contacten per week.
Bij een 1-op-15-ratio: ongeveer 2 serieuze interesses per week.
Bij een 1-op-20-ratio: ongeveer 1.5 serieuze interesses per week.

**Bouwen (4u/dag): 10 contacten per dag**

10 contacten x 7 dagen = 70 contacten per week.
Bij dezelfde ratio: 4 tot 5 serieuze interesses per week.

**Doorbreken (6u/dag): 15 contacten per dag**

15 contacten x 7 dagen = 105 contacten per week.
Bij dezelfde ratio: 7 tot 8 serieuze interesses per week.

**Wat dit echt betekent**

Twee dingen vallen op:

1. Het verschil tussen Fundament en Doorbreken is NIET drie keer zoveel activiteit. Het is drie keer zoveel SIGNAAL. Drie keer zo snel weet je of dit voor jou werkt of niet.
2. Op Fundament-tempo duurt het twee weken voordat je voldoende data hebt voor zelf-feedback. Op Doorbreken-tempo is dat een paar dagen.

**Waarom is signaal belangrijk?**

Omdat de eerste weken in netwerk-marketing mentaal het zwaarst zijn. "Werkt dit überhaupt? Doe ik het goed? Reageert er ooit iemand?". Hoe sneller je SIGNAAL krijgt (positief of negatief), hoe sneller je gerichter kunt bijsturen.

Lager tempo betekent niet minder kwaliteit, het betekent gewoon dat je langer in onzekerheid zit voordat je weet of je op de goede weg bent. Voor sommige mensen past dat (rustig, eigen werk, geen tijdsdruk). Voor anderen werkt hoog tempo beter omdat ze sneller bevestiging nodig hebben.

**Een belangrijk inzicht**

Er is geen 'fout' tempo. Er is een tempo dat bij jou past. Maar het is wel eerlijk om te weten: de wiskunde is niet jouw vijand. Hoe meer gesprekken je opent, hoe sneller je leert wat WEL en NIET werkt voor jouw stijl, en hoe sneller je verbetert.

**De Sprint-overweging**

De 60-daagse Sprint is bewust een intensieve periode, geen blijvende leefstijl. Het is een sprint, geen marathon. Het hogere tempo is haalbaar omdat het tijdelijk is. Als je na 60 dagen wilt minderen naar Fundament-tempo, kan dat. Maar tijdens deze run is hogere intensiteit de kortste weg naar zelf-feedback.`,
    oefening:
      "Pak een blaadje of je notitie-app. Schrijf op: bij mijn huidige tempo doe ik [X] gesprekken per week. Bij een 1-op-15-ratio levert dat [Y] serieuze interesses op. Voelt dat tempo voor jou kloppend bij deze Sprint, of wil je een tempo hoger? Geen verkeerd antwoord, maar maak het bewust.",
  },
  {
    sleutel: "1.3",
    titel: "Sprint-versnelling, waarom 60 dagen geen marathon is",
    leestijdMinuten: 10,
    inhoud: `Een marathon en een sprint zijn beide hardlopen, maar het zijn totaal verschillende disciplines. Een marathonloper traint op uithoudingsvermogen, niet op snelheid. Een sprinter traint op explosieve kracht, niet op duur.

De 60-daagse Sprint in ELEVA is bewust ONTWORPEN als sprint, niet als marathon. Dat is de hele reden dat het werkt.

**Waarom een Sprint?**

Drie redenen:

**1. Sprints hebben een einde.**

Een marathon zonder eindpunt is een hel. Niemand houdt het vol om "altijd vol gas" te gaan. Maar 60 dagen vol gas? Dat IS te overzien. Je weet: na deze 60 dagen mag het anders. Mag ik minderen, mag ik consolideren, mag ik kijken wat ik heb gebouwd. Het einde maakt het hoge tempo haalbaar.

**2. Sprints bouwen momentum dat doorrolt.**

In hardlopen heet dit het "trainings-effect". Tijdens een sprint-trainingsblok van 8 weken bouw je niet alleen snelheid, je bouwt ook AEROOBE basis die maanden later nog doorwerkt. Je conditie is verbeterd, je herstel is sneller, je staat fysiek op een hoger niveau.

Bij netwerkmarketing is het identiek. 60 dagen hoog tempo betekent:

- Een pijplijn vol mensen die nu in fase 1-2 zitten en in de weken erna in fase 3-5 doorgroeien
- Een routine die ingesleten is, geen wilskracht meer nodig
- Een aantal eerste resultaten die je geloof in het systeem bevestigen
- Een netwerk dat je ZICHT geeft op wie waarschijnlijk wel of niet werkt voor netwerk-marketing in jouw omgeving

Die 4 dingen werken nog maanden na de Sprint door, ook als je in dag 61-90 zachter doet.

**3. Sprints maken vergelijking eerlijk.**

Mensen die "voorzichtig beginnen" en 1 contact per week leggen, schalen meestal nooit op. Niet omdat ze geen tijd hebben, maar omdat ze nooit een gevoel hebben opgebouwd voor wat werkt. Mensen die in een Sprint zijn gegaan en 60 dagen lang elke dag iets deden, weten precies welke aanpak bij hen past. Daarna kunnen ze veel gerichter kiezen.

**Wat moet je je herinneren?**

De aantallen in jouw dag-flow zijn niet 'het werk van een netwerkmarketeer in algemene zin'. Het zijn de aantallen die passen bij het SPRINT-formaat. Na de 60 dagen kan en mag het anders.

Tijdens deze 60 dagen is hoog tempo een investering in een korte periode, met een effect dat veel langer doorwerkt. Net zoals een sporter weet dat zware trainingsblokken een aantal weken duren en de winst maanden later komt.

**Een waarschuwing**

Dit betekent NIET: ga jezelf voorbij. Dit betekent niet: kies Doorbreken als Fundament past. De grootste fout van Sprint-deelnemers is een tempo kiezen dat NIET bij hun leven past, het na 2 weken niet volhouden, en in mineur stoppen.

Het juiste tempo is het tempo dat je 60 dagen kunt aanhouden. Liever Fundament 60 dagen consistent dan Doorbreken 14 dagen en dan instorten.`,
    oefening:
      "Vraag jezelf eerlijk: kan ik mijn huidige tempo 60 dagen aanhouden? Niet 'wil ik' maar 'kan ik, gezien mijn werk, gezin, energie'. Zo nee: pas je tempo aan via /instellingen voordat je verder gaat. Zo ja: bevestig in een notitie 'ik kies bewust voor [tempo] tijdens deze Sprint'.",
  },
];

// ============================================================
// MODULE 2, De 3, nieuwe gesprekken openen
// ============================================================

const M2: AcademyLes[] = [
  {
    sleutel: "2.1",
    titel: "De vier bronnen, in volgorde van warmte",
    leestijdMinuten: 10,
    inhoud: `Elke dag heb je een aantal nieuwe gesprekken te openen (afhankelijk van je tempo). De vraag is: WAAR haal je die mensen vandaan?

Veel beginners maken hier de zelfde fout: ze openen meteen Instagram en gaan op random accounts reageren. Resultaat: veel werk, weinig terugkoppeling, snel ontmoedigd.

Het slimme: werk in een vaste volgorde van WARMTE. Begin bij mensen die al iets met je hebben, eindig pas bij koude prospects. ELEVA biedt je hiervoor vier vlakken naast elkaar bij elke "voeg nieuwe namen toe"-stap:

**1. Eleva-geheugen (warmste bron, ALTIJD eerst)**

Dit is je interne lijst van mensen die je al hebt opgeslagen maar nog niet hebt benaderd over jouw business. Familie, vrienden, oud-collega's, mensen die jij ooit hebt gesproken en bewust hebt gemarkeerd.

Waarom eerst? Omdat deze mensen JOU al kennen. Geen "wie is dit" effect. Een DM van een bekende heeft 3 tot 5 keer hogere antwoord-kans dan eenzelfde DM van iemand uit een ander netwerk.

**2. Facebook-vrienden**

Mensen die al in jouw netwerk staan maar waarbij je een tijd geen contact hebt gehad. Op Facebook kun je vaak vlot scrollen door je lijst, zien wie wat post, en bewust kiezen wie je nu wilt benaderen.

Trigger: iemand die net iets heeft gedeeld dat raakt aan een thema waar JIJ voor staat (energie, druk leven, gezondheid, vrij willen zijn). Dat is je natuurlijke opener.

**3. Instagram-volgers en -volgenden**

Mensen die op JOUW stories reageren met emoji's of korte berichten zijn extra warm. Zij hebben actief contact genomen, ook al was het klein. Open hun profiel, kijk wie ze zijn, denk: zou ik deze persoon willen spreken?

Andere kant: mensen die JIJ volgt. Welke 3 accounts post regelmatig over jouw thema's? Heb je ooit gereageerd? Begin daar.

**4. LinkedIn (zakelijker, andere toon)**

LinkedIn werkt anders. Toon is meer professional, eerste DM moet zakelijker. Mensen die je op LinkedIn benadert hebben vaak een ondernemers- of business-frame. Voor zakelijke uitnodigingen (waar je later het "ik heb weinig tijd"-stukje van de 4-stappen-uitnodiging gebruikt) is dit een goede bron.

**De praktische volgorde voor je dagelijkse contacten**

Stel je doet 10 nieuwe gesprekken per dag (Bouwen-tempo). Dan kan dat er als volgt uitzien:

- 4 uit Eleva-geheugen (oude bekenden je hebt opgeslagen)
- 3 uit Facebook (specifieke posts/stories getriggerd)
- 2 uit Instagram (story-reageerders of mensen je volgt)
- 1 uit LinkedIn (een zakelijke connectie)

Niet rigide. Soms is je Eleva-geheugen even leeg of zit je niet op LinkedIn. Maar de VOLGORDE staat: warm voor koud.

**De grootste fout: te snel naar koud**

Beginners denken: "Ik moet OPSCHALEN, dus ik moet meer NIEUWE mensen bereiken." Maar nieuwe = onbekend = koud = lage response. Je verspilt energie aan mensen die je niet kennen, terwijl je oude lijst onbenut blijft.

Eerst leegtrekken wat warm is. Pas dan koud.`,
    oefening:
      "Open je Eleva-geheugen (namenlijst). Tel: hoeveel mensen staan er nog op met fase 'prospect' (nog niet benaderd)? Dat aantal is je natuurlijke buffer voor de komende dagen. Niet leeg? Top, dan hoef je vandaag niet naar Facebook of Instagram. Wel leeg? Dan weet je waar je heen gaat.",
  },
  {
    sleutel: "2.2",
    titel: "De opener-formule die werkt",
    leestijdMinuten: 9,
    inhoud: `Je weet uit wie je wilt aanspreken (vorige les). Nu de echte vraag: WAT schrijf je?

Een opener is GEEN pitch. Geen "ik heb iets interessants voor je". Geen "mag ik je iets laten zien". Dat type opener voelt voor de ander direct als verkoop, en dat triggert verdediging.

Een goede opener doet drie dingen:

1. Verwijst naar iets SPECIFIEKS over die persoon (niet copy-paste-baar)
2. Stelt een vraag die nieuwsgierigheid wekt, niet oordeel
3. Is kort. Twee tot drie zinnen maximaal.

**Drie types openers die werken**

**Type 1: De herinnerings-opener**

Voor mensen die je kent maar al een tijd niet hebt gesproken.

> "Hé Linda, ik moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?"

Werkt omdat je impliciet zegt: ik herinner me ons gesprek, ik vind je belangrijk genoeg om over na te denken.

**Type 2: De reactie-opener**

Voor mensen waarvan je iets recents hebt gezien (story, post, foto).

> "Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?"

Werkt omdat je laat zien dat je écht kijkt, niet alleen scrolt.

**Type 3: De vraag-opener (rustig variant)**

Voor mensen waar je geen recent ankertje hebt maar wel met wilt heropenen.

> "Hé Anne, hoe lang is het ook alweer geleden dat we elkaar hebben gesproken? Hoe is het bij jou?"

Werkt omdat het eerlijk is. Geen verzonnen reden, gewoon een mens die contact zoekt.

**Wat je NOOIT moet doen**

- Mass-DM met dezelfde tekst (mensen herkennen het direct, vooral als ze elkaar kennen)
- "Hé, hoe gaat het?" zonder enige context (te leeg, mensen voelen je vraag-jij-iets-van-mij-radar)
- Lange openers met je hele levensverhaal (ze lezen het niet)
- Direct over je business beginnen ("ik heb iets nieuws...") in zin 1

**De verleiding van copy-paste**

Als je 10 of 15 mensen per dag opent, voelt copy-paste verleidelijk. "Iedereen krijgt dezelfde opener, ik bespaar tijd." Doe dit NIET. Mensen die elkaar kennen merken het binnen een dag. Je netwerk schiet je af.

Persoonlijk schrijven kost je 30 seconden per DM. Bij 10 DM's is dat 5 minuten extra. Die 5 minuten zijn het waard voor de relatie-bouw die het oplevert.

**Wat je WEL kunt copy-pasten: de structuur**

Niet de woorden, wel het PATROON: "Hé [naam], [specifiek anker]. [Open vraag]?".

Dat is de formule. De woorden vul je per persoon zelf in. Zo houd je het schaalbaar zonder dat het robot-voelt.

**Wat je zegt nadat je 'm hebt gestuurd**

In ELEVA gebruik je de spraakfunctie of de namenlijst om te zeggen: "Ik heb een gesprek gestart met [naam]". Dat zet de fase van 'prospect' naar 'in gesprek' automatisch. Dan loop je je dag-flow verder en weet je later precies wie waar staat in je pijplijn.`,
    oefening:
      "Pak 3 namen uit je Eleva-geheugen die fase 'prospect' hebben. Schrijf voor elke persoon een opener op papier of in je notitie-app, in jouw eigen toon. Geen DM versturen nu, alleen schrijven. Lees ze 5 minuten later terug: voelt het natuurlijk, of klinkt het als een script? Pas aan tot het volkomen jij is.",
  },
  {
    sleutel: "2.3",
    titel: "Wat als ze niet antwoorden, drop-off accepteren",
    leestijdMinuten: 8,
    inhoud: `Hier komt iets dat je moet INSLIKKEN, niet motiverend wegpoetsen: een grote groep mensen antwoordt niet. Niet vandaag, niet morgen, soms helemaal nooit. Dat is normaal. Dat is geen falen.

**De cijfers**

In netwerk-marketing zien we ruwe gemiddelden:

- 30-50% van openers krijgt geen antwoord, ook niet bij goede berichten
- Van de mensen die wel antwoorden, gaat een deel daarna toch dood-stil
- Van de mensen die actief in gesprek blijven, zegt nog steeds een deel uiteindelijk nee

Dit is GEEN reden om te stoppen. Dit is reden om je INPUT-getal te beschermen.

**Waarom antwoorden mensen niet?**

Negen van de tien keer is het NIET omdat ze jou niet mogen. Het is omdat:

- Ze zijn druk, zien je bericht, willen later antwoorden, vergeten het
- Ze weten niet wat ze moeten zeggen op een specifieke vraag
- Ze zien je bericht laat in de avond en het zakt weg in hun feed
- Ze vinden je vraag te open en hebben geen energie om uitgebreid te antwoorden

Geen van deze redenen is over JOU als persoon. Maar ons brein neemt het persoonlijk op. "Hij negeert me." "Ze vindt me vast vervelend." Dat is je gevoel sprekend, niet de feiten.

**Wat je NIET moet doen**

- Een tweede bericht in dezelfde week sturen ("hé, zag je m'n vorige bericht?"). Voelt pushy.
- Personaliseren naar jezelf. "Ze haten me." Zeer onwaarschijnlijk.
- De persoon uit je lijst halen. Misschien antwoorden ze over 6 weken alsnog op iets nieuws.

**Wat je WEL moet doen**

- Vink de persoon af in je lijst als "geprobeerd, geen respons, opnieuw over 4-6 weken".
- Verschuif je energie naar de volgende persoon. Niet vasthouden.
- Onthoud: jouw DMO is INPUT, niet uitkomst. Een nul-respons-dag is geen mislukte dag als je het wel hebt PROBEERD volgens je tempo.

**De heropener (over 4-6 weken)**

Iemand die nu niet antwoordt, kan over 4-6 weken alsnog open staan. Misschien is er iets in hun leven veranderd, misschien zijn ze nu in een ander moment. Een natuurlijke heropener (NIET "had je m'n vorige bericht gezien") werkt prima:

> "Hé Sandra, hoe is het bij jou? Hoorde laatst van [iets concreets uit de wereld] en moest aan je denken."

Geen verwijzing naar je vorige poging. Frisse start. Soms heropent dat wat eerst dichtzat.

**De diepere les**

Niet-antwoorden is data, niet falen. Je leert wie wel reageert en wie niet, wie warm is en wie nu niet, welke toon werkt voor welk type mens. Dat is leerstof. Maar je leert het alleen als je VOLDOENDE input hebt om patronen te zien. Bij 5 berichten per week zie je geen patroon. Bij 50 berichten per week zie je het.

Daarom: focus op input, accepteer drop-off, ga door.`,
    oefening:
      "Open je Eleva-geheugen. Filter op fase 'in gesprek'. Hoeveel mensen daarvan zijn al meer dan 7 dagen stil? Zet die mensen NIET op een tweede poging deze week. Schrijf hun naam in je agenda over 4-6 weken voor een natuurlijke heropener. Energie naar voren.",
  },
];

// ============================================================
// MODULE 3, De 2, uitnodigingen verzenden
// ============================================================

const M3: AcademyLes[] = [
  {
    sleutel: "3.1",
    titel: "Wanneer wordt een gesprek een uitnodiging",
    leestijdMinuten: 9,
    inhoud: `Je hebt iemand een opener gestuurd. Ze antwoorden. Top. Nu komt de meest gemiste stap in netwerk-marketing: weten wanneer je van GESPREK naar UITNODIGING beweegt.

De fout van 80% van beginners: ze blijven hangen in gesprek. Week na week koffie-klonken zonder ooit te zeggen waar het echt om gaat. Vier weken later vraagt de prospect: "Hé, wat doe je eigenlijk nu?" en dan komt de pitch in een ongemakkelijke flits.

De omgekeerde fout van 10%: ze gooien meteen in zin 2 de pitch eruit. "Hé hoe gaat het, heb je trouwens openstaan voor extra inkomen?" Voelt voor de prospect als hinderlaag.

De gulden middenweg is: open kort, lees wat ze noemen, en BRUG snel.

**De 3 signalen waarop je bruggen kunt**

Tijdens een opener-gesprek noemen mensen vaak iets dat raakt aan jouw aanbod. Let op deze drie signalen:

**Signaal 1: Energie / vermoeidheid**

> "Het is best druk hoor. Ik ben kapot 's avonds."
> "Ik kom 's morgens niet goed op gang."

Brug: "Ik herken dat zo. Mag ik je laten zien wat voor mij echt verschil maakte?"

**Signaal 2: Druk leven / weinig tijd**

> "Ik kom niet meer aan mezelf toe."
> "Tussen werk en de kinderen blijft er niets over."

Brug: "Wat als ik je vertel dat er iets is waar ik mee bezig ben dat juist daar over gaat? Heb je 20 minuten om te kijken?"

**Signaal 3: Geld / bijinkomen / ondernemen**

> "Ik denk eraan om voor mezelf te beginnen."
> "Ik moet eigenlijk iets aan inkomen erbij doen."

Brug: "Daar denk ik laatst veel over na. Mag ik je iets laten zien dat ik aan het doen ben?"

**De stille brug (zonder direct signaal)**

Niet elke prospect noemt iets dat past. Dan is er ook een directe brug:

> "Ik wilde je eigenlijk iets vragen. Heb je openstaan voor iets nieuws op het gebied van [energie / gezondheid / bijinkomen]?"

Geen plichtmatige uitleg eromheen. Gewoon de vraag.

**Hoe SNEL moet je bruggen?**

Niet meteen, niet weken later. De vuistregel: binnen 1 tot 3 berichten na het eerste reactie-bericht. Zodra je voelt dat het natuurlijke gesprek staat (geen geforceerd geklets meer), brug je.

Topcoaches in dit vakgebied zijn er duidelijk over: een goed openergesprek dat na 5 berichten nog geen uitnodiging heeft, is GEEN bouwen-aan-een-relatie. Het is uitstelgedrag van jouw kant. De prospect voelt sneller dan jij dat er iets is dat je nog niet gezegd hebt.

**Wat als ze NEE zeggen op de brug?**

Geen ramp. Korte erkenning, en je rondt het gesprek normaal af.

> "Helemaal goed, niet voor iedereen iets. Top dat we elkaar weer hebben gesproken. Hou je goed!"

Niet pushen, niet ongemakkelijk worden. Vriendelijk afsluiten. Misschien open je over 4-6 weken een nieuwe deur, misschien ook niet. Geen verbrande contacten.

**Het pijplijn-effect**

In je namenlijst beweegt de fase mee: 'prospect' → 'in gesprek' (na je opener) → 'uitgenodigd' (na de brug). Dat zicht is goud waard. Je ziet welke mensen in elke fase staan, welke fase verstopt zit, en je weet waar je morgen je energie moet zetten.`,
    oefening:
      "Pak een gesprek dat momenteel in fase 'in gesprek' staat. Lees terug wat de persoon de afgelopen berichten heeft genoemd. Welk signaal hoor je? Schrijf voor jezelf een mogelijke brug-zin op. Niet versturen, alleen schrijven. Geeft je de spier voor wanneer je 'm wel verstuurt.",
  },
  {
    sleutel: "3.2",
    titel: "De 4-stappen-uitnodiging binnen je DMO",
    leestijdMinuten: 11,
    inhoud: `Op dag 4 van het Sprint-playbook leer je de 4-stappen-uitnodiging als formele les. In deze les zoomen we in op hoe je 'm in je DAGELIJKSE ritme verwerkt.

**Snelle recap van de formule**

De 4-stappen-uitnodiging bestaat uit:

1. **Compliment / erkenning**, "Jij bent iemand die..."
2. **Uitnodiging**, kies de variant die past bij hoe warm de prospect is
3. **Plan**, "Vanavond of morgen?" (twee opties, geen open vraag)
4. **(Optioneel) De haast-opener**, alleen bij zakelijke / business-prospects

De volledige uitleg van elke stap staat in dag 4 in /vandaag. Je kunt dat als referentie terug-openen wanneer je wilt.

**Drie varianten van stap 2 (uitnodiging)**

Hier ligt het echte vakwerk. Welke variant kies je?

**Direct (warme prospect, vertrouwen al hoog)**

> "Ik ben gestart met iets nieuws, wil het je laten zien."

Werkt bij familie, oude vrienden, mensen die jou al jaren vertrouwen. Geen omtrekkende beweging nodig.

**Indirect (midden-warm, ze weten wie je bent maar niet alles)**

> "Dit is vast niets voor jou, maar ken jij iemand die extra wil verdienen?"

Werkt bij oud-collega's, sportmaatjes, kennissen. De "is vast niets voor jou"-opener neemt de druk weg en triggert tegelijk nieuwsgierigheid. 7 van de 10 mensen vraagt "waarom dat?" en jij hebt de deur al open.

**Super-indirect (lauw of onbekend)**

> "Ken jij toevallig mensen die openstaan voor bij-inkomen?"

Werkt bij verre bekenden, mensen waarmee je geen sterke relatie hebt. Helemaal geen "jij" in de vraag, alleen "jouw netwerk". Lage druk, hoge kans op antwoord.

**De juiste variant kiezen is vakwerk**

Vuistregel: schat de warmte van de relatie op 1 tot 10.

- 8 tot 10: direct
- 5 tot 7: indirect
- 1 tot 4: super-indirect

Twijfel je? Kies altijd één variant lager (dus van direct naar indirect, of van indirect naar super-indirect). Beter onderbenutten dan je relatie verbranden.

**De plan-vraag is cruciaal**

> "Wanneer schikt het, vanavond of morgen?"

NIET: "Wanneer schikt het bij jou?" (open vraag)
NIET: "Heb je deze week tijd?" (te vaag)
NIET: "Mag ik je een keer bellen?" (te vrijblijvend)

De plan-vraag met TWEE OPTIES sluit twee dingen tegelijk: ze kunnen makkelijk kiezen, en de keuze gaat over WANNEER, niet OF. Dat verhoogt de ja-rate enorm.

**De DMO-aansluiting**

Je tempo bepaalt hoeveel uitnodigingen je per dag verstuurt:

- Fundament: 2 per dag, 14 per week
- Bouwen: 4 per dag, 28 per week
- Doorbreken: 6 per dag, 42 per week

Het zijn AANGEKONDIGDE aantallen voor de Sprint, niet een rigide vereiste. Sommige dagen heb je 0 uitnodigingen omdat je opener-gesprekken nog niet klaar staan. Andere dagen heb je 8. Het uitnodigings-aantal HEELT zich uit over de week, niet per kalenderdag perfect.

**Belangrijker dan kwantiteit: kwaliteit binnen kwantiteit**

Liever 2 uitnodigingen die echt persoonlijk geschreven zijn met de juiste variant dan 6 generieke "hé, wil je iets zien"-berichten. De juiste variant gebruiken verhoogt je ja-rate, sloppy uitnodigen verlaagt 'm.

**Wat als ze ja zeggen?**

Dat is de volgende les.`,
    oefening:
      "Open een prospect die in fase 'in gesprek' staat en waar je een brug bent gepasseerd. Schat de warmte op 1-10. Kies de variant (direct/indirect/super-indirect). Schrijf de uitnodiging op, inclusief plan-vraag. Niet versturen, alleen schrijven. Lees 'm hardop terug, voelt het natuurlijk?",
  },
  {
    sleutel: "3.3",
    titel: "Strijken-terwijl-warm, wat te doen als ze JA zeggen",
    leestijdMinuten: 9,
    inhoud: `Ze zeggen ja op je uitnodiging. Op het kijkmoment, of op een verkennend gesprek. Geweldig. En nu? Dit is de stap waar 30% van uitnodigingen doodloopt, omdat de uitvoerder NIET strijkt-terwijl-warm.

**Wat betekent strijken-terwijl-warm**

Het oude smederij-spreekwoord: ijzer is alleen vormbaar als het roodgloeiend is. Eenmaal afgekoeld vergt het opnieuw verhitten en dat lukt nooit helemaal weer.

In netwerk-marketing: zodra iemand JA zegt op een kijkmoment, is hun nieuwsgierigheid op piek. Een uur later begint de twijfel ("waar zei ik ja op?"). Een dag later is het al gestold. Een week later is het weg.

Daarom: stuur het kijkmateriaal DIRECT.

**Wat is "het kijkmateriaal"?**

Afhankelijk van wat past:

**Voor warme prospects, persoonlijk gesprek mogelijk:**

3-weg-gesprek inplannen met jouw sponsor. ELEVA biedt dit op de prospect-kaart, knop "3-weg-gesprek". Dat opent een vooringevulde WhatsApp aan je sponsor met de context. Daarna stuur je de prospect een berichtje met datum/tijd.

**Voor twijfelaars / drukke prospects:**

Mini-ELEVA-uitnodiging. Een gepersonaliseerde toegang waarin de prospect 14 dagen kan rondkijken, films kan zien, met de AI-mentor kan chatten en met jou en je sponsor kan praten. Knop "Mini-ELEVA-uitnodiging maken" op de prospect-kaart genereert direct de link.

**Voor mensen die snel/eenvoudig willen:**

De one-pager. Eén pagina met de kern, zonder veel gedoe. ELEVA heeft hier een vooringevulde versie van, knop "One-pager-link" op de kaart.

**De volgorde**

1. Direct na ja: open de prospect-kaart in /namenlijst
2. Kies het pad (3-weg, Mini-ELEVA, one-pager)
3. Stuur het materiaal binnen 30 minuten
4. Update de fase naar 'one-pager', 'presentatie' of 'uitgenodigd'

**Wat je NIET doet**

- "Ik stuur het je morgen op." Morgen is verloren tijd. Doe het nu.
- "Eerst moet ik nog wat dingen uitzoeken." Het materiaal is al klaar in ELEVA. Niet meer nadenken, gewoon versturen.
- Stilte van jouw kant na ja. De prospect denkt: "Hij is niet eens enthousiast over wat hij me wilde laten zien?"

**De "ja maar wanneer dan precies"-trap**

Soms zegt iemand: "Top, stuur maar door, ik kijk wel een keer." Dan zit je in een grijze zone. Zeg dan terug:

> "Top. Dan stuur ik 'm nu door. Mag ik je over 2 dagen kort vragen hoe je het vond?"

Dat zet een AFSPRAAK voor follow-up. Zonder afspraak verdampt 80% van de prospects.

**Update altijd je systeem**

Via de spraakfunctie zeg je: "Ik heb [naam] de Mini-ELEVA-link gestuurd" of "Ik heb [naam] uitgenodigd voor een 3-weg met [sponsor]". Dan staat het in je pijplijn, je vergeet niets, en de follow-up komt op de juiste dag terug bij je in de herinnering.

**Het versnellings-effect tijdens Sprint**

Op Bouwen-tempo doe je ~4 uitnodigingen per dag. Als de helft ja zegt, heb je 2 mensen per dag in fase 'one-pager' of 'presentatie'. Dat zijn 14 per week. Dat is HEEL veel follow-up-werk. Als je hier sloppy bent (vergeet kijkmateriaal, vergeet follow-up-afspraak, niet update in systeem), valt 80% door je vingers.

Daarom is strijken-terwijl-warm geen vrijblijvend advies. Het is de scheiding tussen mensen die converteren en mensen die alleen uitnodigen.`,
    oefening:
      "Open /namenlijst en bekijk je fase 'uitgenodigd'-mensen. Hoeveel van hen hebben binnen 24 uur na hun ja het kijkmateriaal gekregen? Niet om jezelf te oordelen, maar om bewust te worden. Volgende ja die binnenkomt: max 30 min tot kijkmateriaal verstuurd.",
  },
];

// ============================================================
// MODULE 4, De 1, follow-up
// ============================================================

const M4: AcademyLes[] = [
  {
    sleutel: "4.1",
    titel: "De wet van 80%, waarom follow-up je echte fase is",
    leestijdMinuten: 10,
    inhoud: `Hier komt de meest onderschatte statistiek in netwerkmarketing:

**80% van mensen die uiteindelijk JA zeggen, zeggen pas ja na de derde, vierde of vijfde follow-up.**

En:

**80% van netwerkers stopt al na de eerste of tweede follow-up.**

Dat betekent: 20% van de netwerkers haalt 80% van de resultaten. Niet omdat ze beter pitchen of slimmer zijn, maar omdat ze opvolgen.

**Waarom zegt iemand niet meteen ja?**

Niet omdat ze "twijfelen aan jou" of "het niet zien". Vaak gewoon levenslogisch:

- Ze zijn druk. Hebben je film bekeken maar moeten erover nadenken.
- Ze willen het bespreken met partner / vader / vriendin. Dat duurt soms een week.
- Ze hebben net deze week ergens anders ja op gezegd en willen niet te veel tegelijk.
- Ze zijn introverter, hebben tijd nodig om iets goed door te laten zinken.
- Ze hebben twijfel die ze nog niet hardop hebben uitgesproken.

GEEN van deze redenen is "ze willen niet". Het zijn timing-issues, geen overtuiging-issues.

**Wat doet een follow-up?**

Het doet één van vier dingen, afhankelijk van het moment:

1. **Boven-water houden** ("hé, ik wilde even peilen hoe je het vond")
2. **Twijfel ombuigen** ("ik snap dat het overweldigend voelt, kan ik iets verduidelijken?")
3. **Toepasselijkheid versterken** ("ik vroeg me af, hoe denk je over [signaal dat ze noemden]?")
4. **Beslissing faciliteren** ("zou een gesprek met mijn sponsor je helpen om het scherp te krijgen?")

Welke je kiest hangt af van waar de prospect staat. ELEVA toont dat: fase 'one-pager', 'presentatie', 'follow-up' staat in de prospect-kaart.

**De openings-zin van een follow-up**

Op dag 3-4 leer je twee varianten van de open-zin:

> "Wat spreekt je hier het meeste in aan?" (algemeen)
> "Zie je hoe dit je kan brengen tot [hun WHY]?" (WHY-gericht)

Vermijd altijd: "Wat vond je ervan?" Dat lokt OORDEEL uit ("ik vond het wel/niet") in plaats van VERBINDING ("dit raakte me wel/niet"). Een prospect die oordeelt, sluit de deur.

**De cadans van follow-up**

Niet elke dag, maar ook niet pas over een maand. Vuistregel:

- 24-48 uur na kijkmateriaal: eerste follow-up (open-zin)
- 4-7 dagen na de eerste follow-up: tweede contact (peilen waar ze nu staan)
- 2-3 weken na tweede contact: derde aanraking (natuurlijke heropener)

Dat zijn drie follow-ups in 3-4 weken tijd. Niet pushy, wel aanwezig.

**Wat als je het allemaal te veel werk vindt?**

Begrijpelijk. Daarom geeft ELEVA je herinneringen, een filter op 'opvolgen vandaag' in de namenlijst, en de Mentor die je kan helpen een follow-up-bericht te schrijven als je vastloopt.

Je hoeft het NIET in je hoofd te houden. Het systeem doet het voor je. Jij hoeft alleen de berichten te schrijven.

**Het Sprint-effect op follow-up**

Aan het begin van de Sprint heb je weinig follow-ups (omdat je net mensen hebt uitgenodigd). Tegen dag 14-21 begint de follow-up-stapel te groeien. Dat is gezond. Het betekent dat je pijplijn vult.

Daarom is je follow-up-tempo in ELEVA NIET een hard getal maar een richtwaarde. Sommige dagen heb je 1 follow-up, andere dagen 12. Het hangt af van wat in je pijplijn staat.`,
    oefening:
      "Open /namenlijst en filter op fase 'one-pager' of 'presentatie'. Bekijk de datum van laatste contact. Hoeveel mensen zijn al meer dan 48 uur stil sinds kijkmateriaal? Zet voor hen vandaag de eerste follow-up. Open-zin: 'Wat spreekt je hier het meeste in aan?'. Stop daar. Wacht hun antwoord af, niet pitchen.",
  },
  {
    sleutel: "4.2",
    titel: "Het pijplijn-bewustzijn (fases in ELEVA)",
    leestijdMinuten: 9,
    inhoud: `Een gevoel van "ik weet niet meer wie wat heeft" is dodelijk voor follow-up. Op een gegeven moment heb je 30, 50, 80 prospects in verschillende fases en weet je niet meer wie waar staat. Resultaat: paniek, willekeurig opvolgen, vergeten van warme prospects, energie wegslechten op verkeerde mensen.

Daarom heeft ELEVA een pijplijn-fase-systeem. Acht fases die elke prospect doorloopt:

**Fase 1: Prospect**

Naam staat in je lijst, geen contact gehad over jouw business. Doel: opener sturen, fase verschuiven naar 'in gesprek'.

**Fase 2: In gesprek**

Eerste bericht is gestuurd, gesprek loopt. Doel: signaal opvangen, bruggen, fase verschuiven naar 'uitgenodigd' of (als ze nu niet open zijn) terug naar 'prospect' over 4-6 weken.

**Fase 3: Uitgenodigd**

Je hebt de 4-stappen-uitnodiging gedaan. Ze hebben (impliciet of expliciet) ja gezegd op een kijkmoment. Doel: binnen 30 minuten kijkmateriaal sturen en fase verschuiven naar 'one-pager' of 'presentatie'.

**Fase 4: One-pager**

Ze hebben de one-pager gekregen. Wachten op: of ze gekeken hebben en wat ze er van vonden. Doel: follow-up na 24-48 uur, fase verschuiven naar 'presentatie' (als ze meer willen weten) of 'follow-up' (als ze nadenken).

**Fase 5: Presentatie**

Ze hebben een uitgebreidere presentatie, Mini-ELEVA-toegang of 3-weg-gesprek gehad. Doel: follow-up over hun beslissing.

**Fase 6: Follow-up**

Ze hebben gekeken, denken na, hebben vragen of twijfel. Doel: ondersteunen tot ze tot besluit komen.

**Fase 7: Klant / partner / not-yet**

Eindfases.
- Klant = ze hebben een pakket gekocht
- Partner = ze zijn gestart als netwerker
- Not-yet = nu niet, mogelijk later (terug in pool over 3-6 maanden)

**Hoe gebruik je dit in je dagelijkse DMO?**

Drie keer per dag (10:00, 14:00, 19:00 bijvoorbeeld) open je /namenlijst en kijk je in welke fase verstopt zit:

- Veel mensen in 'in gesprek' zonder beweging? Tijd om te bruggen.
- Veel mensen in 'uitgenodigd' zonder kijkmateriaal? Strijken-terwijl-warm faalt.
- Veel mensen in 'one-pager' zonder follow-up? Daar liggen mogelijk 80% van je resultaten.
- Veel mensen in 'follow-up' zonder beslissing? Tijd om de hulp van sponsor of Mentor in te schakelen.

**Filters die werken**

In de namenlijst kun je filteren op fase, op laatste-contact-datum, en op urgentie. Combineer ze:

- "Fase 'one-pager', laatst contact > 24 uur geleden" = directe follow-up nu
- "Fase 'follow-up', laatst contact > 7 dagen geleden" = tweede aanraking met natuurlijke vraag
- "Fase 'in gesprek', laatst contact > 3 dagen geleden" = brug naar uitnodiging

**Voorkom de paniek-modus**

Zonder pijplijn-zicht ga je willekeurig opvolgen of (vaker) je doet er gewoon niets aan en hoopt dat mensen vanzelf terugkomen. Dat doen ze meestal niet. Met pijplijn-zicht weet je: vandaag op deze 5 mensen, niet de hele lijst.

5 minuten pijplijn-check per dag is genoeg. Geen marathon nodig.`,
    oefening:
      "Open /namenlijst. Klik in elke fase tegelijkertijd (filter). Tel: hoeveel mensen staan er in elke fase? Maakt 'in gesprek' >5? Maakt 'one-pager' >3? Dat is je werk-voorraad. Stop met je zorgen maken over je hele lijst, focus op deze fase-totalen.",
  },
  {
    sleutel: "4.3",
    titel: "Reflectie als deel van DMO (5 minuten einde dag)",
    leestijdMinuten: 8,
    inhoud: `De 4e activiteit in je DMO is geen actieve actie. Het is een passieve activiteit, en juist daarom slaan beginners 'm vaak over. Maar topmensen zweren erbij.

**Reflectie aan het eind van je dag**

5 minuten. Niet meer. Genoeg om drie vragen te beantwoorden:

1. Wat ging vandaag goed?
2. Waar liep ik vast?
3. Wat raakte me het sterkst (positief of negatief)?

Niet meer, niet minder. Geen lange essay's, geen zelfevaluatie tot in de gronden.

**Waarom werkt het?**

Drie redenen:

**1. Het sluit de dag mentaal af**

Zonder reflectie blijf je 's avonds nog half "aan" staan. Een prospect-gesprek dat goed liep blijft door je hoofd zoemen. Een ongemakkelijk moment blijft hangen. Reflecteren geeft je hersenen permissie om "klaar" te denken.

**2. Het bouwt zelfkennis op**

Na 30 dagen reflectie zie je patronen. "Mijn beste gesprekken zijn op woensdag-ochtend." "Ik raak gefrustreerd bij type-X prospects." "Mijn opener-toon was de afgelopen week te zakelijk geworden." Die patronen blijven onzichtbaar zonder reflectie.

**3. Het laadt je voor morgen**

Door bewust te erkennen wat goed ging, ga je morgen met meer geloof beginnen. Door te erkennen waar je vastliep, weet je morgen waar de pijn zit en kun je het anders aanpakken (of hulp vragen).

**Hoe doe je het praktisch?**

Drie opties, kies wat past:

**Optie A: Stem-opname (snelste)**

Open je telefoon-recorder of de spraakfunctie van ELEVA. Praat 60-90 seconden in over de drie vragen. Slaat zichzelf op, je kunt 't later teruglezen of niet.

**Optie B: Notitie-app**

Schrijf 3-5 zinnen op, maximum. Niet meer.

**Optie C: Spraakfunctie van ELEVA**

Onderaan de zijbalk staat de spraakfunctie. Zeg: "Reflectie van vandaag: vandaag ging X goed, ik liep vast bij Y, het mooiste was Z." Het wordt vastgelegd in je dagboek.

**Wat NIET te doen tijdens reflectie**

- Jezelf veroordelen ("ik heb niet genoeg gedaan vandaag")
- Pakken aan je inputs voor MORGEN ("morgen ga ik 20 doen om in te halen")
- Met je telefoon in je hand blijven en in WhatsApp belanden
- Het overslaan omdat het "geen actie" is

**De reflectie-kalender**

Naast je dagelijkse reflectie is een wekelijkse reflectie nuttig. Elke zondagavond, of maandagochtend, vragen:

1. Welke patronen zag ik deze week?
2. Welk tempo voelde aan als haalbaar, welk als te zwaar?
3. Wat ga ik volgende week ANDERS doen?

Dit is je interne stuur. Daardoor reageer je op wat je leert in plaats van blind doorgaan met wat misschien niet werkt.

**De Sprint-koppeling**

In een 60-daagse Sprint krijg je veel input snel. Zonder reflectie verdrink je in data zonder lessen te trekken. Met reflectie verbetert je aanpak elke week, en bouw je tegen dag 30 een vakmanschap op dat een marathon-loper in maanden niet bereikt.`,
    oefening:
      "Zet vandaag een herinnering om over 8 uur op (vlak voor je avond-rust). De herinnering zegt: '5 min reflectie. Wat ging goed? Waar liep ik vast? Wat raakte me?'. Doe het, ook als het saai voelt. De winst zit niet in de eerste reflectie, maar in de week erna als je terug kunt lezen.",
  },
];

// ============================================================
// MODULE 5, 60 dagen volhouden, Sprint-uithoudingsvermogen
// ============================================================

const M5: AcademyLes[] = [
  {
    sleutel: "5.1",
    titel: "Wat als je geen zin hebt",
    leestijdMinuten: 9,
    inhoud: `Het gaat gebeuren. Misschien dag 9, misschien dag 22, misschien op een grijze dinsdag. Je staat op, opent /vandaag, en denkt: "Vandaag niet. Geen energie."

Hier scheidt de Sprint-deelnemers die hun 60 dagen volmaken van degenen die afhaken. Niet bij de mensen met de mooiste WHY of de meeste talent. Bij de mensen die WETEN wat ze doen op deze dagen.

**Het verschil tussen prestatie-keuze en energie-keuze**

**Prestatie-keuze:** "Ik moet vandaag op mijn topniveau presteren, anders is het een mislukte dag."

Dit is een onhoudbare standaard. Niemand presteert elke dag op topniveau. Zelfs topsporters hebben rustdagen, en die zijn ingebakken in hun trainingsplan. Een netwerker die elke dag prestatie eist van zichzelf, slijt zichzelf op binnen 3 weken.

**Energie-keuze:** "Welk minimum kan ik vandaag, gegeven hoe ik me voel, eerlijk doen?"

Op een gewone dag is dat je volledige tempo. Op een lage-energie-dag is dat misschien de helft. Op een ziek-of-uitgeput-dag is dat een minimum.

Het verschil: prestatie-keuze laat je STOPPEN op slechte dagen. Energie-keuze laat je DOORGAAN op slechte dagen, maar dan met minder druk.

**Het minimum-DMO**

Voor lage-energie-dagen heeft elke tempo-keuze een minimum dat je nog redelijk kunt aanhouden:

- Fundament (5/2/3): minimum is 2 contacten, 1 uitnodiging, 1 follow-up. Halve dag werk, 1 uur.
- Bouwen (10/4/6): minimum is 4 contacten, 2 uitnodigingen, 2 follow-ups.
- Doorbreken (15/6/10): minimum is 6 contacten, 2 uitnodigingen, 3 follow-ups.

Dit is GEEN nieuwe DMO. Dit is een veiligheidsnet voor de dagen dat je voller niet aankan.

**Waarom een minimum belangrijker is dan een maximum**

Want een nul-dag heeft een mentaal effect dat je niet wilt:

- Je hebt 1 dag gemist en denkt dat morgen het automatisch terugkomt. Het komt niet automatisch terug.
- Je verbrekening met je dag-flow betekent dat morgen openen extra zwaar voelt (je moet weer "in"-komen).
- Je nul-dag wordt vaker een twee-dagen-pauze, dan een week, dan stop.

Een halve dag is OMHOOG van een nul-dag. Zelfs als je je tempo niet haalt, het FEIT dat je het hebt aangeraakt houdt je in beweging.

**De 5-minuten-regel**

Voor de écht-geen-zin-dagen: geef jezelf 5 minuten. Open /vandaag, lees wat erop staat, doe 1 ding. Eén opener bericht. Eén follow-up. Eén drie-zinnen-reflectie.

Vaak gebeurt dan dit: na die ene actie krijg je 5 tot 15 minuten "ach-laat-ik-er-toch-mee-bezig-gaan" energie. Niet altijd. Maar vaak genoeg om jezelf van een nul-dag te redden.

**Hulp inschakelen**

Op slechte dagen: stuur je sponsor of de Mentor een bericht.

> "Hé, ik heb vandaag echt geen zin. Wat zou jij doen?"

Dat alleen al doorbreekt de stilte. Sponsors zijn er PRECIES hiervoor. De Mentor in de zijbalk kan ook helpen om in 5 minuten samen 1 follow-up-bericht te schrijven, zodat jij vandaag iets hebt gedaan.

**Onderscheid: rust nemen versus afhaken**

Soms is je geen-zin een echt signaal: je hebt rust nodig. Dat is OK. Een halve dag rust kan beter zijn dan een halve dag gedwongen geploeter. Maar wees eerlijk: is dit echt rust-nodig, of is dit gewoon weerstand tegen de actie?

Vuistregel: als je geen-zin voortkomt uit lichamelijke moeheid of een echte slechte nacht, neem rust. Als het voortkomt uit een vermijdings-gevoel ("ik wil niet die ene moeilijke prospect bellen"), forceer je niet door, maar doe DE ANDERE dingen wel.`,
    oefening:
      "Schrijf voor jezelf jouw minimum-DMO op (zie de getallen in deze les voor jouw tempo). Plak het ergens zichtbaar. Op een dag dat je geen zin hebt, doe je je minimum, niet meer. Geen schuldgevoel. Volgende dag pak je weer je volledige tempo.",
  },
  {
    sleutel: "5.2",
    titel: "Het compounding-effect",
    leestijdMinuten: 10,
    inhoud: `In de financiële wereld noemen ze het compounding. Klein percentage, herhaald, leidt tot exponentiële groei over tijd. 1% per dag verbetering = 37x je startpunt na 365 dagen. Dat is geen toverij, dat is wiskunde.

In een netwerk-marketing-Sprint werkt het identiek. Niet in geld, maar in pijplijn, vaardigheid en netwerk.

**Compounding pijplijn**

Dag 1: je opent 10 gesprekken. 3 antwoorden vandaag, 4 morgen, 1 over 3 dagen, 2 nooit.

Dag 7: je hebt nu 70 gesprekken geopend. 25 in actief gesprek, 8 uitgenodigd, 2 hebben kijkmateriaal gehad.

Dag 14: 140 gesprekken geopend. 35 actief, 18 uitgenodigd, 8 hebben gekeken, 2 in follow-up.

Dag 30: ~300 gesprekken. 50 actief, 40 uitgenodigd, 20 hebben gekeken, 8 in follow-up, eerste 1-2 mensen overwegen ja.

Dag 60: ~600 gesprekken. Volledige pijplijn ontwikkeld op ALLE fases tegelijk. Eerste partners gestart, eerste klanten geplaatst.

Zie de wiskunde: het is niet lineair. De pijplijn vult LANGZAAM aan het begin en accelereert in het tweede deel. Daarom zien Sprint-deelnemers vaak in week 5-8 disproportioneel veel resultaat ten opzichte van week 1-2.

**Compounding vaardigheid**

Eerste 50 openers: stroef, voelen geforceerd, je twijfelt over elke woord-keuze.

50e tot 100e opener: je vindt JOUW toon. Je voelt aan wat werkt en wat niet.

100e tot 200e opener: vakwerk. Je past varianten aan op basis van wie je benadert.

200e+: je kunt op intuïtie schrijven. Iemand komt op je radar, je weet in 30 seconden wat de juiste opener is.

Een Sprint-deelnemer op Bouwen-tempo (10/dag) zit binnen 3 weken op 200+ openers. Dat is vakmanschap dat een gemiddelde netwerker pas na maanden bereikt.

**Compounding netwerk**

Elke prospect die jij benadert, kent gemiddeld 150 tot 200 andere mensen. Sommigen van hen zeggen NEE op jouw aanbod, maar denken dagen of weken later "hé, [jij] is met iets bezig dat misschien voor [Pieter] interessant is" en verwijzen.

Reverse-referrals. Mensen die jij benaderd hebt en die nee zeiden, sturen later anderen jouw kant op. Dat gebeurt niet zichtbaar in je dag-flow, maar het gebeurt onder de oppervlakte.

Bij 600 mensen-benaderd na 60 dagen, met (zeg) 100 ervan die in een goede gespreks-relatie kwamen, zit je netwerk in totaal op tienduizenden mensen die op de hoogte zijn dat JIJ ergens mee bezig bent. Dat is een netwerk-effect waar geen marketing-campagne tegenop kan.

**Het verschil met "voorzichtig beginnen"**

Een netwerker die "voorzichtig begint" met 2 contacten per week en bouwt zo:

Week 1: 2 contacten.
Week 4: 8 contacten.
Week 12: 24 contacten.

Na 12 weken zit zo iemand op 24 contacten. Een Sprint-deelnemer zit op 600.

Het verschil is niet 25 keer zoveel werk. Het is een ANDER systeem, met andere wiskunde.

**Wat je in de eerste 30 dagen NIET moet doen**

Niet meten. Niet "is er al iemand partner". Niet "verdien ik er al iets aan". Dat zijn de verkeerde KPI's voor maand 1.

Wat WEL meten in maand 1:

- Heb ik mijn DMO gevolgd? (input)
- Voelt mijn tempo haalbaar? (duurzaamheid)
- Krijg ik signaal? (worden gesprekken geopend, antwoorden mensen)

**Wat je in de tweede maand WEL gaat zien**

Daar verschijnt het:

- Mensen die op je vroege opener nee zeiden, sturen je iemand
- Eén of twee prospects komen terug uit fase 'follow-up' met "ik heb het besproken met X, ik wil starten"
- Je sponsor merkt op dat jouw lijst sneller groeit dan andere starters
- Je merkt dat je openers makkelijker schrijft dan in week 1

Dit is compounding. Het is geen wonder, het is het natuurlijke gevolg van consistent input.

**Daarom: focus op input in maand 1, vier het signaal in maand 2.**`,
    oefening:
      "Pak een papier of notitie. Reken uit: bij mijn tempo, hoeveel openers zal ik over 30 dagen hebben gestuurd? En over 60 dagen? Schrijf dat aantal op. Niet om druk te voelen, maar om te zien wat je aan het bouwen bent.",
  },
  {
    sleutel: "5.3",
    titel: "Het hellingseffect, wat er gebeurt in dag 30-60",
    leestijdMinuten: 10,
    inhoud: `De Sprint heeft een ritme: dag 1-7 = leerfase, dag 8-21 = ploeg-werk, dag 22-30 = doortrek-fase, dag 30-60 = oogst-fase. Niet als rigide regels, maar als een patroon dat je ziet.

In deze laatste les van de training gaan we in op de oogst-fase: wat gebeurt er als je het 30 dagen hebt volgehouden, en waarom is doorgaan in deel 2 zo belangrijk?

**De rede dat de oogst-fase pas in deel 2 begint**

Drie redenen:

**1. Beslissings-rijping**

Iemand die op dag 12 het kijkmateriaal krijgt, doet niet meteen ja. Tussen kijken en starten zit gemiddeld 14 tot 30 dagen denktijd. Sommige mensen langer. Dat betekent: iemand die jij op dag 12 hebt uitgenodigd, kan op dag 35-45 starten. Dat zijn jouw eerste partners. Maar ze komen pas in deel 2 binnen.

**2. Reverse-referrals stapelen**

Mensen die in week 1-3 nee zeiden op jou hebben dat in hun hoofd verwerkt. In week 5-8 komen sommigen terug met "ik heb me bedacht" of "ik ken iemand voor wie dit perfect is". Dit zie je alleen als je in deel 2 nog actief bent en dus beschikbaar voor die terugkomst.

**3. Je eigen vakmanschap is op piek**

Bij dag 30 schrijf je openers, uitnodigingen en follow-ups op intuïtie. Het kost je geen energie meer. Maar je hebt deze efficiency pas BEREIKT door de eerste 30 dagen. Als je nu stopt, geef je dat vakmanschap weg. Als je doorgaat, gebruik je het.

**Wat zien Sprint-deelnemers in week 5-8**

Patronen die rapporteren:

- Eerste 1-3 partners starten
- Eerste klanten plaatsen orders
- Sponsor merkt op dat hun teampool groeit
- Family / partner / vrienden komen langs met "is het waar dat jij dit doet?"
- Mensen die in week 1 weigerden komen terug

Dit is geen toeval. Dit is wiskundig gevolg van 30+ dagen consistente input.

**Wat als je in deel 2 minder gaat doen**

Iedereen kent het: einde van een sport-trainingsblok, de motivatie zakt, het tempo halveert. Begrijpelijk, want je voelt geen "moeten" meer.

Het effect:

- Pijplijn vult niet meer aan met nieuwe input
- Bestaande prospects in fase 4-5 vallen door je vingers omdat follow-up niet gebeurt
- De compounding-curve breekt af

Topnetwerkers die hun Sprint-tempo in deel 2 vasthouden, zien 2 tot 3 keer meer resultaat dan degenen die in deel 2 halveren.

**Hoe houd je het vol in deel 2?**

Drie hulpmiddelen:

**Hulpmiddel 1: Tijd-zicht**

Je bent al 30 dagen ver. Nog 30 dagen. Niet 60. Mentale herframing, niets meer.

**Hulpmiddel 2: Vroege resultaten vieren**

Elke kleine ja vieren, met je sponsor of partner. Dat reset je dopamine-systeem en houdt de energie hoog. Een sponsor-checkin "ik heb mijn eerste partner!" is dramatisch belangrijker dan je denkt.

**Hulpmiddel 3: Vooruit-blikken**

Op dag 35 schrijf je voor jezelf op: "Wat wil ik op dag 60 hebben?" Niet alleen kwantitatief, ook kwalitatief. Welke gesprekken zijn ik trots op? Welke skill wil ik op dag 60 beheersen?

**De cycle, na de Sprint**

Op dag 61 mag je herzien. Misschien continueer je in een aangepast tempo (van Doorbreken naar Bouwen, van Bouwen naar Fundament). Misschien herstart je een nieuwe Sprint met een verfijnd doel. Misschien neem je 2 weken rust en herstart in september.

ELEVA past zich aan. Het playbook gaat door, je tempo kan veranderen, je pijplijn loopt door. Niets is "vast" na de Sprint, maar het is allemaal makkelijker dan op dag 1 omdat je nu een netwerk en vakmanschap hebt.

**De afsluiter**

Een DMO is geen punishement-systeem. Het is een belofte aan jezelf om input te bewaken, ongeacht wat er om je heen gebeurt. Een Sprint is een afgebakende intensieve periode waarin je die belofte 60 dagen lang houdt.

Wat je over 60 dagen hebt opgebouwd is niet het resultaat van talent, geluk of toeval. Het is het resultaat van 60 keer een dag waarop je iets DEED, in plaats van wachtte tot je zin had.

Veel succes met de rest van je Sprint.`,
    oefening:
      "Schrijf voor jezelf op (in je notitie-app of via spraakfunctie): 'Op dag 60 wil ik [concreet wat je hebt opgebouwd]. Om dat te bereiken houd ik mijn DMO van [tempo] vol. Op moeilijke dagen doe ik mijn minimum, niet nul.' Lees dit terug op dag 30 en dag 50.",
  },
];

// ============================================================
// EXPORT, alle modules samengevoegd in de training-definitie
// ============================================================

export const DAGELIJKS_RITME_TRAINING: AcademyTraining = {
  slug: "dagelijks-ritme",
  titel: "Het Dagelijkse Ritme (DMO)",
  emoji: "🎯",
  pitch:
    "De wiskunde achter dagelijkse activiteit, en waarom hoger tempo tijdens de Sprint sneller signaal en resultaat geeft. Vijf modules over input, uitnodigen, follow-up en volhouden.",
  zichtbaarVoor: ["sprint-na-21", "core", "pro-optie"],
  doorlooptijdDagen: 15,
  modules: [
    {
      nummer: 1,
      titel: "Het principe",
      emoji: "📐",
      samenvatting:
        "Wat is een DMO, de wiskunde van het percentage-spel, en waarom 60 dagen geen marathon is.",
      lessen: M1,
    },
    {
      nummer: 2,
      titel: "De 3, nieuwe gesprekken",
      emoji: "💬",
      samenvatting:
        "De vier bronnen op volgorde van warmte, de opener-formule, en wat je doet met niet-antwoorden.",
      lessen: M2,
    },
    {
      nummer: 3,
      titel: "De 2, uitnodigingen",
      emoji: "📨",
      samenvatting:
        "Wanneer een gesprek een uitnodiging wordt, welke variant past bij welke warmte, en strijken-terwijl-warm.",
      lessen: M3,
    },
    {
      nummer: 4,
      titel: "De 1, follow-up",
      emoji: "🔄",
      samenvatting:
        "De wet van 80%, het pijplijn-bewustzijn in ELEVA, en waarom 5 min reflectie per dag het verschil maakt.",
      lessen: M4,
    },
    {
      nummer: 5,
      titel: "60 dagen volhouden",
      emoji: "🏃",
      samenvatting:
        "Wat je doet op geen-zin-dagen, het compounding-effect, en waarom dag 30-60 vaak de oogst-fase is.",
      lessen: M5,
    },
  ],
};
