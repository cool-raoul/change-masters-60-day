// File: lib/playbook/wat-nu-situaties.ts
//
// Data voor de "wat nu?"-knop (gereedschapskist-laag). Gedeeld tussen het
// menu (components/core/WatNuKnop.tsx) en de uitleg-pagina's
// (app/wat-nu/[slug]/page.tsx).
//
// Raoul (2026-05-29): elke situatie verdient een HELE PAGINA uitleg, niet
// een paar zinnen. Het menu is de wegwijzer (kort, via 'hint'), de pagina
// is de plek met volledige uitleg ('uitleg') en daarna pas de knop naar
// de tool.
//
// De uitleg-teksten zijn DRAFT, geschreven in de Be The Change-stem en
// geput uit Raoul/Gaby's eigen materiaal (3-soorten-DM, webshop-
// bouwstenen, ASAP-tekst, hercontact-berichten, trainingsscripts). Raoul
// kan ze woord-voor-woord bijschaven via founder-modus op de pagina.
// ALL-CAPS-regels worden als koppen gerenderd.

export type WatNuSituatie = {
  slug: string;
  emoji: string;
  label: string;
  hint: string;
  uitleg: string;
  actieLabel: string;
  actieRoute: string;
};

export type WatNuGroep = {
  kop: string;
  situaties: WatNuSituatie[];
};

export const WAT_NU_GROEPEN: WatNuGroep[] = [
  {
    kop: "📣 Er komt iets binnen op je post",
    situaties: [
      {
        slug: "iemand-reageerde",
        emoji: "💬",
        label: "Iemand reageerde",
        hint: "Opener + 3-soorten-mensen-DM",
        actieLabel: "Open de opener-scripts",
        actieRoute: "/scripts?cat=opener",
        uitleg: `Er komt een reactie binnen op je post. Fijn! Dit is precies waar je post voor bedoeld was. En een reactie is geen toeval, iemand voelde iets bij wat je deelde.

REAGEER BINNEN EEN UUR

Het allerbelangrijkste nu: reageer snel. Binnen een uur als het kan. Hoe sneller je reageert, hoe warmer het gesprek nog is. Wacht je een dag, dan is het moment vaak alweer voorbij.

En reageer niet alleen op de mensen die iets schrijven. Ook op de likes. Een like is net zo goed een opening, iemand stak z'n hand op.

DRIE SOORTEN MENSEN

Op je post en je likes zitten grofweg drie soorten mensen. Naar alle drie stuur je een persoonlijk berichtje.

1. Mensen die vragen wat je doet. "Waar ben je mee bezig?" of "Wat is dit precies?". Stuur ze een prospect-filmpje dat past bij wat ze zoeken, en volg daarna op. Bekijk het filmpje zelf eerst even, zodat je weet wat erin zit.

2. Mensen die iets aardigs schrijven. "Wat goed!", "Mooi!", "Herkenbaar". Die hebben nog geen vraag gesteld, maar staan wel open. Naar hen stuur je het DM-script hieronder.

3. Mensen die alleen liken. Geen woorden, wel een duim. Stuur hen hetzelfde DM-script.

HET DM-SCRIPT

Welk berichtje je stuurt, hangt af van wat je hebt gepost.

Heb je een pre-post gedaan, je bent net begonnen en deelde je voornemen? Dan past dit, want je hebt zelf nog geen resultaat:

"Hey [naam], bedankt voor je reactie of like op mijn post. Ik zoek nog mensen die gezellig met mij willen meedoen. Wellicht wat voor jou, of voor iemand uit jouw omgeving? Dan stuur ik je vrijblijvend wat informatie."

Heb je een resultaat-post gedaan, je deelde wat je hebt gemerkt? Dan past dit, want nu mag je zeggen dat je anderen wil helpen:

"Hey [naam], bedankt voor je reactie of like op mijn post. Ik ben hier zo blij mee dat ik heb besloten om anderen hier ook mee te helpen. Ken jij mensen in jouw omgeving voor wie dit wat zou kunnen zijn? En misschien is het ook wel wat voor jezelf. Ik voorzie jou of die personen graag vrijblijvend van alle informatie."

WAT JE NIET DOET

Niet meteen pitchen. Niet "wil je dit kopen". Wel een warme opener die het gesprek opent. Mensen haken niet aan op een product, wel op een persoonlijk gesprek.

Twijfel je over de precieze woorden voor een specifieke persoon? Laat de Mentor het met je meeschrijven, die kent jouw stem.`,
      },
      {
        slug: "iemand-liket",
        emoji: "👍",
        label: "Iemand liket alleen",
        hint: "Like-DM, vrijblijvend en warm",
        actieLabel: "Open de opener-scripts",
        actieRoute: "/scripts?cat=opener",
        uitleg: `Iemand heeft je post geliket, maar niets geschreven. Veel mensen laten zo'n like links liggen. Zonde, want een like is een klein handje dat omhoog gaat. Iemand zag het, en vond het genoeg om iets terug te doen.

WAT EEN LIKE EIGENLIJK ZEGT

Een like betekent meestal: "ik zie je, en ik vind dit interessant genoeg om te reageren". Dat is een opening. Geen grote, wel een echte. En jij mag 'm gewoon oppakken met een vriendelijk, vrijblijvend berichtje.

HET BERICHTJE

Houd het licht. Geen pitch, geen "wil je dit kopen". Wel een warme, nieuwsgierige opener. Bijvoorbeeld:

"Hey [naam], leuk dat je m'n post zag! Ben je zelf ergens mee bezig op dit gebied, of sprak het je gewoon aan?"

Of, als je net een resultaat hebt gedeeld:

"Hey [naam], bedankt voor je like! Ik ben hier zelf zo blij mee dat ik anderen er ook graag mee help. Zou het iets voor jou kunnen zijn, of voor iemand die je kent? Ik stuur je vrijblijvend wat info als je wil."

BINNEN EEN UUR

Net als bij een reactie: hoe sneller, hoe warmer. Een like is vluchtig, dus pak 'm op terwijl het nog vers is.

EN ALS ZE NIET TERUGREAGEREN

Helemaal oké. Niet doordrukken. Je hebt vriendelijk de deur opengezet, de rest is aan hen. Vaak komt er later alsnog iets, juist omdat je het luchtig hield.`,
      },
      {
        slug: "wil-meer-weten",
        emoji: "🔥",
        label: "Iemand wil meer weten",
        hint: "Filmpje delen + Mentor denkt mee",
        actieLabel: "Open de Mentor",
        actieRoute: "/coach",
        uitleg: `Iemand toont echte interesse en wil meer weten. Dit is een mooi moment, en tegelijk een moment om het rustig en eenvoudig te houden. Niet alles tegelijk uitleggen, wel de juiste volgende stap zetten.

EERST LUISTEREN, DAN STUREN

Vraag eerst kort waar de interesse vandaan komt. "Wat sprak je het meest aan?" of "Waar loop je zelf tegenaan?". Zo weet je wat je moet sturen, en voelt de ander zich gezien in plaats van in een trechter geduwd.

STUUR EEN FILMPJE DAT PAST

Je hoeft het niet zelf allemaal uit te leggen. Daar zijn de prospect-filmpjes voor. Kies er een die past bij wat de ander zoekt, slaap, energie, hormonen, of het hele verhaal.

Belangrijk: bekijk het filmpje zelf eerst even, zodat je weet wat erin zit als ze straks iets vragen. Dan sta je nooit met je mond vol tanden.

DAARNA OPVOLGEN

Een filmpje sturen is niet het einde, het is het begin. Spreek meteen een vervolg af. "Kijk 'm rustig, dan bel of app ik je morgen even, oké?". Zo blijft het lopen en zakt het niet weg.

DE MENTOR DENKT MEE

Weet je niet welk filmpje past, of hoe je het vervolg-bericht het beste schrijft? De Mentor kent de filmpjes en kent jouw stem. Vertel 'm wie de persoon is en wat ze zoeken, dan helpt 'ie je kiezen en schrijven.`,
      },
      {
        slug: "reageert-niet-meer",
        emoji: "🌙",
        label: "Iemand reageert niet meer",
        hint: "Warm hercontact-bericht",
        actieLabel: "Open de hercontact-scripts",
        actieRoute: "/scripts?cat=followup",
        uitleg: `Iemand die eerst reageerde, is stil geworden. Dat voelt soms ongemakkelijk, maar het hoort er gewoon bij. Mensen worden afgeleid, hebben het druk, of weten even niet wat ze willen. Het betekent meestal geen nee.

GEEN ZORGEN, GEEN DRUK

Het belangrijkste: maak er geen drama van, en geen verwijt. Eén warm, vrijblijvend berichtje is genoeg. Je laat zien dat je er bent, zonder te duwen.

HET HERCONTACT-BERICHT

Houd het kort en geef ruimte. Bijvoorbeeld:

"Hey [naam], ik zag dat je niet meer gereageerd hebt op m'n laatste berichtje. Ik dacht, ik zoek even contact om te kijken of je het druk had of dat het op dit moment even niks voor je is. Voor mij is het allebei oké hoor."

Merk je het verschil? Je geeft de ander een makkelijke uitweg ("of het is even niks voor je"). Juist dat maakt dat mensen zich vrij voelen om wél te reageren.

FORTUIN IN DE FOLLOW-UP

Het meeste gebeurt niet bij het eerste contact. Het gebeurt bij het tweede, derde, vijfde. Niet door aandringen, wel door zichtbaar te blijven op een manier die respectvol voelt.

EN ALS HET DAN STIL BLIJFT

Dan laat je het even rusten. Zet een herinnering om over een paar weken of een maand nog eens contact te zoeken. "Een keer per drie maanden contact" is ook contact. De relatie blijft, ook al is het nu even niet het moment.`,
      },
    ],
  },
  {
    kop: "💬 Een gesprek of uitnodiging",
    situaties: [
      {
        slug: "wil-uitnodigen",
        emoji: "✉️",
        label: "Ik wil iemand uitnodigen",
        hint: "Uitnodig-scripts + webshop-frame",
        actieLabel: "Open de uitnodig-scripts",
        actieRoute: "/scripts?cat=uitnodiging",
        uitleg: `Je wil iemand uitnodigen. Mooi. En het mooie is: je hoeft niemand iets te verkopen. Je nodigt iemand uit om te kijken. Zij beslissen.

HET WEBSHOP-FRAME

Mensen zijn allergisch voor "wil je iets bij mij kopen". Maar mensen zijn wél nieuwsgierig naar een webshop waar je je producten zonder voorraad of risico kunt aanbevelen, en daar inkomen mee kunt opbouwen. Zelfde aanbod, ander frame. Het ene werkt, het andere niet.

DE VIER BOUWSTENEN

Een goede uitnodiging heeft vier ingrediënten. Niet alle vier even prominent, wel allemaal aanwezig.

1. Het haakje. Een opener die persoonlijk is voor deze prospect. Hun naam, jullie gedeelde geschiedenis, of een hint naar iets wat hen bezighoudt. Geen koud "hoi", wel iets dat alleen voor hen klopt.

2. De manier-gevonden-zin. "Ik heb een manier gevonden om online extra inkomsten op te bouwen zonder investeringen en zonder risico." Geen claim, geen belofte, wel een uitnodiging om te kijken.

3. Hoe het werkt, kort. Een of twee zinnen over de webshop. Geen lange uitleg, wel een beeld dat klopt.

4. De permissie-vraag. Concreet, niet open afsluiten. "Mag ik je kort laten zien hoe het werkt? Helemaal vrijblijvend, als het niets voor je is is dat ook prima."

EEN VOORBEELD

"Hé [naam], moest aan je denken! Ik ben met iets bezig waar ik echt enthousiast over ben, een manier om online extra inkomen op te bouwen zonder voorraad en zonder risico. Mag ik je kort laten zien hoe het werkt? Helemaal vrijblijvend, als het niks voor je is is dat ook helemaal oké."

SNAP JE WAAROM DIT WERKT

Eerst connectie, dan kader, dan een beeld, dan een vraag waar ze gewoon ja of nee op kunnen zeggen. Geen druk, wel duidelijkheid. En weet je niet wat je moet zeggen voor een specifieke persoon? De Mentor schrijft 'm met je mee.`,
      },
      {
        slug: "weet-niet-wat-zeggen",
        emoji: "🤷",
        label: "Ik weet niet wat ik moet zeggen",
        hint: "Mentor schrijft op maat + de magische vraag",
        actieLabel: "Open de Mentor",
        actieRoute: "/coach",
        uitleg: `Je wil iemand benaderen, maar je weet niet hoe je het moet zeggen. Heel normaal. En je hoeft het ook niet alleen te bedenken.

LAAT DE MENTOR MEESCHRIJVEN

Vertel de Mentor wie de persoon is, hoe je ze kent, en wat je wil bereiken. Dan schrijft 'ie een bericht op maat, in jouw stem. Niet een standaard-tekst, wel iets dat klinkt alsof jij het zelf hebt geschreven. Pas het daarna aan naar je eigen woorden.

DE MAGISCHE VRAAG

Er is één vraag-vorm die meer beweging creëert dan welke andere ook. Hij is simpel: "Als ik... zou jij dan?". Dus: ik doe eerst iets, en dan vraag ik jou iets.

Het werkt omdat het wederzijds is. We zijn als mensen zo gebouwd dat als iemand ons eerst iets biedt en daarna een vraag stelt, we daar eerder positief op reageren. Draai je het om ("eerst wil jij, dan zal ik"), dan voel je de weerstand.

VOORBEELDEN

"Als ik je een filmpje stuur dat in vijf minuten laat zien hoe het werkt, zou je daar dan naar willen kijken?"

"Als ik een expert erbij haal die al je vragen kan beantwoorden, zou jij die vragen dan willen stellen?"

"Als ik je een korte vragenlijst stuur waarmee ik kan zien wat bij je past, zou je die dan even invullen?"

Snap je hoe dit werkt? Je kunt het op bijna elk moment in een gesprek toepassen. Het wordt een tweede natuur naarmate je het vaker doet.

GEEN PERFECTE ZIN NODIG

Onthoud: een bericht hoeft niet perfect te zijn. Het hoeft echt te zijn. Liever een eerlijk, een beetje onhandig berichtje dat je verstuurt, dan een perfect bericht dat in je hoofd blijft hangen.`,
      },
      {
        slug: "twijfelt-of-nee",
        emoji: "🤔",
        label: "Iemand twijfelt of zegt nee",
        hint: "Bezwaren, Feel-Felt-Found",
        actieLabel: "Open de bezwaren-scripts",
        actieRoute: "/scripts?cat=bezwaar",
        uitleg: `Iemand twijfelt, of zegt nee. Dat voelt als een afwijzing, maar dat is het meestal niet. Twijfel is bijna altijd een vraag, geen deur die dichtgaat. "Ik heb een vraag, geef me ruimte."

DE VIER STAPPEN

Bij een bezwaar werken deze vier stappen bijna altijd.

1. Erkennen. "Ik snap wat je bedoelt." Niet meteen weerleggen. Eerst even laten landen.

2. Doorvragen. "Wat speelt er nog meer voor jou?" Vaak komt het echte bezwaar pas na het eerste, oppervlakkige.

3. Feel-Felt-Found. "Ik begrijp hoe je je voelt. Anderen voelden zich ook zo. En wat ze ontdekten was..."

4. Concrete vervolgvraag. "Zullen we even samen kijken naar X?" of "Mag ik je iets sturen wat hier specifiek over gaat?"

VEELVOORKOMENDE BEZWAREN

"Geen tijd." Vaak niet echt over tijd, wel over of het de moeite waard is. Vraag door wat ze zou overtuigen dat het de tijd waard is.

"Geen geld." Erken het, en laat zien dat je niets investeert, je koopt alleen iets voor je eigen gezondheid. Geen voorraad, geen risico.

"Lijkt op een piramide." Heel begrijpelijk gevoel, veel mensen hebben dat eerst. Leg rustig uit dat aanbevelingsmarketing een legale, erkende manier van distribueren is, en dat iedereen die start meer kan verdienen dan degene boven 'm. Er is altijd een echt product dat echt mensen helpt.

EEN NEE IS NIET ALTIJD EEN NEE

Soms is het gewoon: niet nu. Blijf de relatie warm houden, ook bij een nee. En zeg tegen jezelf: mijn why is sterker dan jouw nee. Niet om door te drammen, wel om niet uit het veld geslagen te raken.

De bezwaren-scripts geven je de woorden voor de meest voorkomende situaties.`,
      },
      {
        slug: "3-weg-inplannen",
        emoji: "🤝",
        label: "Ik wil een 3-weg inplannen",
        hint: "3-weg-script + sponsor introduceren",
        actieLabel: "Open de 3-weg-scripts",
        actieRoute: "/scripts?cat=uitnodiging",
        uitleg: `Je hebt een warme prospect en je wil een 3-weg inplannen. Goed teken, dat betekent dat er echte interesse is.

WAT IS EEN 3-WEG

Een 3-weg is een gesprek tussen drie mensen: jij, je sponsor of upline, en je prospect. Jij introduceert je sponsor, je sponsor doet de inhoudelijke uitleg, en jij sluit af met een vervolgafspraak. Het mooie: jij hoeft nog niet alles te kunnen, je leunt op de ervaring van je sponsor.

DE VIJF STAPPEN

1. Edification. Jij introduceert je sponsor in één of twee zinnen. Wie is het, wat doet 'ie al een tijd, en hoe heeft 'ie jou geholpen.

2. Intro. Je sponsor stelt zichzelf voor en vraagt iets over de prospect, om het een gesprek te maken in plaats van een praatje.

3. Inhoud. Je sponsor vertelt het verhaal. Jij doet hier niets behalve actief luisteren. Niet onderbreken, niet aanvullen. Jij leert van het luisteren.

4. Vraag aan de prospect. "Wat spreekt je hier het meeste in aan?" Niet "wat vond je ervan", want dat levert een vrijblijvend "leuk" op.

5. Vervolgafspraak. Concreet, dag en tijd. Geen "ik laat van me horen".

HOE JE 'M INPLANT

Stuur eerst je sponsor een berichtje of 'ie kan, met een paar opties. Dan koppel je prospect en sponsor in een gesprek of videocall. Bevestig dag en tijd een paar uur van tevoren bij allebei, en stuur je prospect een korte herinnering: "Fijn dat we elkaar straks spreken, tot zo!".

VOOR HET GESPREK

Open je edification-zin even, zodat je 'm helder voor je hebt. En check kort wat je over deze persoon weet, zodat je sponsor kan aanhaken op wat er echt speelt.

De 3-weg-scripts geven je de woorden voor de uitnodiging en de introductie.`,
      },
    ],
  },
  {
    kop: "🎬 Iets tonen of delen",
    situaties: [
      {
        slug: "filmpje-delen",
        emoji: "🎬",
        label: "Hoe deel ik een filmpje?",
        hint: "Bekijk zelf eerst, dan delen",
        actieLabel: "Open de Mentor",
        actieRoute: "/coach",
        uitleg: `Je wil iemand een filmpje sturen over de producten of het verhaal. Slim, want een filmpje doet het uitlegwerk voor je, en het is voor de ander makkelijk om even te kijken.

BEKIJK 'M ZELF EERST

De belangrijkste regel: bekijk elk filmpje dat je deelt eerst zelf. Klinkt vanzelfsprekend, maar wordt vaak overgeslagen. En dan vraagt iemand je iets over het filmpje en sta je met je mond vol tanden. Weet wat erin zit, hoe lang het duurt, en voor wie het past.

WELK FILMPJE PAST

Kies een filmpje dat aansluit bij wat de ander zoekt. Iemand met slaapproblemen krijgt een ander filmpje dan iemand die meer energie zoekt of de hele opportunity wil zien. Eén raak filmpje werkt beter dan drie algemene.

Weet je niet welk filmpje past? De Mentor kent ze, vertel 'm wie de persoon is en wat ze zoeken.

HOE JE 'M STUURT

Stuur het filmpje niet kaal. Zet er een kort, persoonlijk zinnetje bij. "Hé [naam], ik moest aan je denken, dit filmpje legt precies uit wat ik bedoelde. Vijf minuten, kijk 'm rustig." Zo voelt het als iets persoonlijks, niet als een doorgestuurd bestand.

DAARNA, ALTIJD OPVOLGEN

Een filmpje sturen is het begin, niet het einde. Spreek meteen een vervolg af. "Kijk 'm rustig, dan app ik je morgen even, oké?". Anders blijft het hangen en zakt het weg.`,
      },
      {
        slug: "freebie-delen",
        emoji: "🎁",
        label: "Hoe deel ik een freebie?",
        hint: "Jouw persoonlijke tracking-link",
        actieLabel: "Naar je freebies & links",
        actieRoute: "/instellingen/mijn-tracking-links",
        uitleg: `Een freebie is een laagdrempelige manier om mensen kennis te laten maken. Ze doen een korte vragenlijst of test, krijgen iets waardevols terug, en jij krijgt een nieuwe prospect op je lijst. Win-win.

WAT EEN FREEBIE DOET

De freebie geeft de ander direct iets nuttigs: een persoonlijk overzicht, een score, een advies. Geen verkooppraatje, wel echte waarde. Daardoor voelt het voor de ander veilig om mee te doen, en bouw jij vertrouwen op nog voordat je iets aanbiedt.

JOUW PERSOONLIJKE LINK

Je hebt per freebie een eigen tracking-link. Het belangrijke daaraan: iedereen die via jouw link instapt, komt automatisch als prospect op jouw namenlijst, met de uitkomst erbij. Je hoeft dus niks handmatig bij te houden.

HOE JE 'M DEELT

Drie manieren werken goed:
1. In een persoonlijk DM-bericht naar iemand voor wie het past.
2. In een social-post of Story, met de link in je bio of als swipe-up.
3. Via een trigger-woord (als je ManyChat hebt ingesteld), dan krijgt iedereen die reageert automatisch jouw link.

WAT ER DAARNA GEBEURT

Zodra iemand de freebie afmaakt, zie je het op je prospect-kaart: wat ze hebben ingevuld en wat de uitkomst was. Dat is jouw aanknopingspunt voor een warm, persoonlijk vervolg. Je weet immers al wat er bij ze speelt.

Op je freebies-pagina vind je je links, voorbeeldteksten en de uitleg over ManyChat.`,
      },
      {
        slug: "webshop-delen",
        emoji: "🛍️",
        label: "Hoe deel ik mijn webshop?",
        hint: "Je bestellink + de ASAP-tip",
        actieLabel: "Naar je bestellinks",
        actieRoute: "/instellingen/bestellinks",
        uitleg: `Iemand wil bestellen, of je wil iemand je webshop-link sturen. Dit is het moment waarop interesse omslaat in actie. Maak het ze makkelijk.

JE PERSOONLIJKE BESTELLINK

Je hebt een eigen bestellink, en je kunt zelfs een winkelmandje klaarzetten met precies de producten die je iemand adviseerde. Dan hoeven ze alleen nog af te rekenen.

DE ASAP-TIP

Eén belangrijke tip die je er altijd bij geeft: laat ze ASAP aanvinken bij het afrekenen. ASAP staat voor Automatic Shipment Advantage Program. Bijna al je klanten kiezen hiervoor, omdat je daarmee extra korting krijgt. Je zit nergens aan vast, het is geen contract of abonnement, en je kunt het op elk moment aanpassen, pauzeren of stoppen.

HET BERICHT

Een voorbeeld dat werkt:

"Hi [naam]! Zoals beloofd stuur ik je hier het winkelmandje met de producten die ik je adviseerde. Een belangrijke tip bij het afronden: kies ervoor om ASAP aan te vinken. Bijna al mijn klanten doen dat, omdat je daarmee extra korting krijgt. Je zit nergens aan vast, je kunt het altijd zelf aanpassen of stoppen. Laat je me even weten als je de bestelling hebt geplaatst en of alles goed ging?"

BLIJF BEREIKBAAR

Sluit altijd af met dat ze je een berichtje mogen sturen als ze hulp nodig hebben bij het bestellen. Het laatste zetje is vaak gewoon dat iemand weet dat jij meekijkt.`,
      },
      {
        slug: "welk-advies",
        emoji: "📋",
        label: "Welk advies past bij iemand?",
        hint: "Productadvies-vragenlijst of score-bot",
        actieLabel: "Naar je vragenlijsten",
        actieRoute: "/instellingen/mijn-tracking-links",
        uitleg: `Iemand vraagt wat bij hen past, of je wil weten waar je iemand het beste mee kunt helpen. Je hoeft dat niet uit je hoofd te kunnen. Laat een vragenlijst het werk doen.

LAAT ZE EEN VRAGENLIJST DOEN

Stuur de productadvies-vragenlijst of een van de score-bots (Energie & Focus, Hormonen & Overgang). In een paar minuten beantwoordt iemand een paar vragen, en komt eruit wat bij hen past en wat een logische volgende stap zou zijn.

Het mooie: de ander voelt zich gezien en serieus genomen, want het advies is op hen afgestemd. Geen algemeen verkooppraatje.

WAT JIJ TERUGKRIJGT

Jij krijgt de uitkomst op de prospect-kaart in je namenlijst. Je ziet wat ze hebben ingevuld en welk advies eruit kwam. Dat is goud voor je vervolg: je weet precies waar het over moet gaan.

WELKE KIES JE

Algemeen of nog niet helder wat er speelt? De productadvies-vragenlijst. Iets met energie, focus of slaap? De Energie & Focus-bot. Iets rond hormonen of de overgang? De Hormonen & Overgang-bot.

PERSOONLIJK ADVIES BLIJFT

De vragenlijst geeft een richting, jij geeft de menselijke laag. Bel of app na afloop even na: "Ik zag je uitkomst, mag ik je daar wat over vertellen?". Zo wordt een vragenlijst een gesprek.`,
      },
    ],
  },
  {
    kop: "🛒 Iemand heeft gekocht",
    situaties: [
      {
        slug: "net-besteld",
        emoji: "📦",
        label: "Net besteld, wat nu?",
        hint: "Warm welkom + klantomgeving",
        actieLabel: "Naar je klantomgeving",
        actieRoute: "/klant",
        uitleg: `Iemand heeft net besteld. Gefeliciteerd, dit is een mooi moment! En tegelijk het begin van iets, niet het einde. Hoe je nu start, bepaalt voor een groot deel of iemand een goede ervaring krijgt.

EERST EEN WARM WELKOM

Stuur meteen een persoonlijk berichtje. Geen standaard-tekst, wel oprecht blij. "Wat fijn dat je de stap hebt gezet! Ik help je graag op weg, je staat er niet alleen voor." Dat eerste gevoel telt enorm.

LEG ASAP EVEN UIT

Als ze ASAP hebben aangevinkt, leg dan kort uit wat dat betekent: automatische herhaling met korting, nergens aan vast, altijd zelf aan te passen. Hebben ze het niet aangevinkt, dan kun je het nog als tip meegeven.

DE EERSTE DAGEN

Vertel kort wat ze kunnen verwachten. Wanneer komt het binnen, hoe beginnen ze, en dat resultaten tijd nodig hebben. Tekorten aanvullen duurt al gauw maanden, sommige mensen merken eerder iets dan anderen. Door dat vooraf te zeggen, voorkom je teleurstelling na twee weken.

IN DE KLANTOMGEVING

Zet je nieuwe klant in de klantomgeving. Daar volgen jullie samen de eerste stappen, en krijg jij op de juiste momenten een seintje om even bij te praten. Voeg ze ook toe aan de Facebook-groep met ervaringen, dat geeft ze meteen een warm bad en herkenning.

NIET VERKOPEN, WEL BEGELEIDEN

Vanaf nu ben je geen verkoper meer, je bent een gids. Je helpt iemand een goede ervaring krijgen. Dat is wat van een klant uiteindelijk een ambassadeur maakt.`,
      },
      {
        slug: "klant-opvolgen",
        emoji: "💞",
        label: "Hoe volg ik een klant op?",
        hint: "Klantomgeving-tijdlijn, de juiste momenten",
        actieLabel: "Naar je klantomgeving",
        actieRoute: "/klant",
        uitleg: `Een klant goed opvolgen is misschien wel het belangrijkste, en het meest onderschatte, deel van het werk. Niet om te verkopen, wel om mee te leven. Een klant die zich gezien voelt, blijft, en vertelt het door.

DE TIJDLIJN

In de klantomgeving zie je waar je klant staat op hun tijdlijn. Op de juiste momenten krijg je een seintje om even contact te zoeken. Zo hoef je het niet zelf te onthouden.

DE JUISTE MOMENTEN

Een paar momenten doen er extra toe:
Dag 1 tot 3, is alles goed aangekomen, weten ze hoe te beginnen?
Rond dag 7, hoe gaan de eerste dagen, merken ze al iets?
Rond dag 10, hoe is het tot nu toe, lopen ze ergens tegenaan?
Rond dag 21, wat hebben ze gemerkt? Vaak het moment van de eerste echte resultaten.

WAT JE VRAAGT

Houd het kort en oprecht. Eén vraag is genoeg. "Hoe gaat het sinds je producten?" of "Hé, ik dacht aan je, hoe bevalt het tot nu toe?". Geen vragenlijst, wel echte interesse.

NIET VERKOPEN

Belangrijk: deze contactmomenten zijn niet om iets bij te verkopen. Ze zijn om mee te leven en te helpen. Als er een logische volgende stap is (bijvoorbeeld een vervolgproduct dat echt past), komt dat vanzelf ter sprake omdat de klant erom vraagt, niet omdat jij erop duwt.

ALS IEMAND ERGENS TEGENAAN LOOPT

Weet je het antwoord niet? Geen punt. Vraag het door in je team of aan de Mentor, en kom erop terug. Zo helpen we elkaar, dat is precies hoe het werkt.`,
      },
      {
        slug: "klant-enthousiast",
        emoji: "🌟",
        label: "Klant is enthousiast",
        hint: "Gun je anderen ook zo'n resultaat?",
        actieLabel: "Open de Mentor",
        actieRoute: "/coach",
        uitleg: `Een klant is enthousiast over hun resultaat. Dit is het mooiste moment in het hele vak. En het is ook precies het moment waarop iets nieuws kan ontstaan, als je het zacht en oprecht aanpakt.

HET MOOISTE MOMENT

Iemand die blij is met hun resultaat, vertelt dat graag verder. Niet omdat het moet, wel omdat ze het zelf hebben ervaren. Jouw taak is niet om te pushen, wel om de deur op een kier te zetten.

DE VRAAG

De zachte opening die werkt: "Wat fijn dat je dit zo merkt! Gun je anderen ook zo'n gevoel?". Of: "Ken je mensen die hier ook wat aan zouden hebben?".

Geen pitch, geen "wil je dit ook gaan doen". Wel een uitnodiging om na te denken over wie ze het gunnen. Vaak komt het antwoord dan vanzelf, soms zelfs over henzelf: "eigenlijk zou ik dit ook wel willen doen".

GEEN HAAST

Niet elke enthousiaste klant wil zelf bouwen, en dat hoeft ook niet. Een blije klant is op zichzelf al goud waard, ze blijven en ze vertellen het door. Zie dit moment als zaaien, niet als oogsten.

LAAT DE MENTOR MEEDENKEN

Twijfel je hoe je dit gesprek aangaat zonder dat het pusherig voelt? De Mentor helpt je de juiste woorden vinden, afgestemd op deze specifieke klant en op jouw stem.`,
      },
    ],
  },
  {
    kop: "🌙 Het loopt even niet",
    situaties: [
      {
        slug: "zie-het-niet-zitten",
        emoji: "🫂",
        label: "Ik zie het even niet zitten",
        hint: "Even praten, en je sponsor erbij",
        actieLabel: "Open de Mentor",
        actieRoute: "/coach",
        uitleg: `Je zit even in een dip. Het loopt niet, je twijfelt, of je voelt je alleen. Lees dit even rustig. Want dit hoort erbij, echt waar, en het zegt niets over of je dit kan.

DIT HOORT ERBIJ

Er zullen dagen zijn dat niks meezit, gesprekken niet lopen, mensen afhaken. Dat overkomt iedereen, ook de mensen die nu succesvol zijn. Het verschil zit niet in of je dips hebt, wel in hoe je ermee omgaat.

DE GROOTSTE TEGENSTANDER BEN JE ZELF

De gemeenste stem is vaak je eigen hoofd. "Ik ben niet goed genoeg", "dit is niks voor mij", "ik kan niet praten met mensen". Dat zijn geen feiten, dat zijn gedachten. En gedachten mag je tegenspreken.

Zeg tegen jezelf: mijn why is sterker dan deze dag.

AFWIJZING HOORT BIJ HET VAK

Je wordt betaald op basis van wat je laat zien, niet op basis van wie ja zegt. Laat je vijf mensen iets zien en start er één, dan word je eigenlijk voor vijf betaald, niet voor één. Elke nee bouwt je karakter. Zonder struggle geen groei.

PRAAT EROVER, NIET ALLEEN

Het allerbelangrijkste: doe dit niet alleen. Stuur je sponsor een berichtje, gewoon eerlijk hoe het gaat. Of praat even met de Mentor, dag of nacht. Even hardop zeggen wat er speelt, lucht al op.

EN ZIE JE WHY WEER VOOR JE

Waarom begon je ook alweer? Dat is je brandstof. Pak 'm er even bij. Niet alleen, je hoeft dit echt niet alleen te doen.`,
      },
      {
        slug: "wat-nu-doen",
        emoji: "🧭",
        label: "Wat moet ik nu doen?",
        hint: "Terug naar je huidige stap",
        actieLabel: "Naar je huidige stap",
        actieRoute: "/vandaag",
        uitleg: `Je bent even het overzicht kwijt en weet niet waar je moet beginnen. Heel herkenbaar, zeker als je nieuw bent en er veel op je afkomt. Adem even uit. Het is simpeler dan het voelt.

EEN DING TEGELIJK

Je hoeft niet alles tegelijk te doen. Je hoeft maar één ding te doen: de stap waar je nu staat. Daar staat precies wat vandaag telt, in kleine, behapbare stukjes. Meer hoeft niet.

TERUG NAAR JE STAP

Ga terug naar je huidige stap. Lees de korte kern, doe wat er staat, en vink af. Klaar voor vandaag? Dan ben je klaar. Morgen weer een stukje.

VOEL JE JE OVERWELDIGD

Dat is normaal, en het zakt. Iets nieuws leert iedereen eerst onhandig, dan vloeiend. Wat we in ons team steeds weer zien: de mensen die in het begin even overweldigd zijn, zijn vaak juist degenen die het halen. Omdat ze gewoon één stap per keer bleven zetten.

EN ALS ER IETS SPEELT

Komt er ineens iets tussendoor, iemand reageert, iemand vraagt iets? Dan pak je gewoon de Wat nu?-knop, daar staat per situatie wat je doet. En daarna kom je in één klik terug bij je stap.`,
      },
      {
        slug: "waarom-doe-ik-dit",
        emoji: "❤️",
        label: "Waarom doe ik dit ook alweer",
        hint: "Je WHY terugzien",
        actieLabel: "Naar je WHY",
        actieRoute: "/mijn-why",
        uitleg: `Soms ben je even kwijt waarom je hieraan begon. Dat is precies het moment om je WHY er weer bij te pakken. Want je WHY is je brandstof, juist op de dagen dat het niet vanzelf gaat.

WAT JE WHY IS

Je WHY is de echte reden waarom je dit doet. Niet een mooi verhaal, wel het eerlijke verhaal. Misschien is het vrijheid en ademruimte, tijd voor je kinderen, financiële rust. Misschien is het anderen helpen omdat je zelf hebt gemerkt wat het brengt. Misschien is het gewoon dat gevoel dat er meer in je zit.

WAAROM HET ZO BELANGRIJK IS

Op de goede dagen heb je je WHY niet nodig. Op de mindere dagen wel. Dan is het het verschil tussen doorgaan en stoppen. Mensen zonder helder WHY zoeken steeds andermans motivatie. Met een WHY heb je je eigen kompas.

ZIE 'M WEER VOOR JE

Pak je WHY er even bij en lees 'm rustig. Voel weer waarom je begon. En als je merkt dat je WHY is verschoven sinds de start, helemaal oké, pas 'm aan. Een WHY mag meegroeien met jou.

KLEIN HOUDEN VANDAAG

En dan? Niet meteen weer alles tegelijk. Eén stap. De stap waar je staat. Je WHY is de waarom, de stap is het hoe. Allebei genoeg voor vandaag.`,
      },
    ],
  },
  {
    kop: "👥 Mijn team",
    situaties: [
      {
        slug: "teamlid-vraag",
        emoji: "🙋",
        label: "Mijn teamlid heeft een vraag",
        hint: "Partner-check of 3-weg voor hen",
        actieLabel: "Naar je team",
        actieRoute: "/team",
        uitleg: `Een van je teamleden heeft een vraag of loopt ergens tegenaan. Fijn dat je er voor ze bent, dat is precies wat je tot een goede sponsor maakt. En het mooie: je hoeft niet alles zelf te weten.

RELATIES GAAN VOOR ALLES

Het belangrijkste in je team is niet het product of het plan, het zijn de relaties. Mensen geven er meer om dat jij om hén geeft, dan om de opportunity. Als ze voelen dat je echt interesse hebt, staan ze open voor alles wat je te zeggen hebt.

Dus begin niet met "heb je al gesprekken gedaan?", begin met "hoe gaat het met je?". Echt luisteren, echte interesse.

JIJ HOEFT HET NIET TE WETEN

Heeft je teamlid een vraag waar je het antwoord niet op weet? Geen punt. Je zegt gewoon: "goede vraag, die zoek ik even voor je uit". En dan vraag je het door in je eigen lijn, of aan de Mentor. Zo helpen we elkaar, en zo leer jij het zelf ook.

WANNEER JE SPONSOR ERBIJ HAALT

Soms is een 3-weg de beste hulp: jij plus je sponsor of upline plus je teamlid (of hun prospect). Vooral als je teamlid voor een belangrijk gesprek staat en het nog spannend vindt. Dan staan ze er niet alleen voor, net zoals jij dat niet hoefde.

CHECK WIE AANDACHT NODIG HEEFT

In je team-overzicht zie je wie er stil is of waar het stroef loopt. Een klein berichtje op het juiste moment doet vaak meer dan een hele training. Niet als controle, wel als "ik zie je, ik ben er".`,
      },
      {
        slug: "iemand-gestart",
        emoji: "🎉",
        label: "Iemand is bij mij gestart",
        hint: "Welkom-flow voor je nieuwe member",
        actieLabel: "Naar je team",
        actieRoute: "/team",
        uitleg: `Iemand is bij jou gestart. Gefeliciteerd! Of het nu je eerste is of je tiende, dit is een bijzonder moment, voor hen en voor jou. En de eerste dagen bepalen veel.

DE EERSTE 48 UUR TELLEN

Een nieuwe start is kwetsbaar. Mensen zijn enthousiast maar ook onzeker. Hoe sneller ze een eerste succesje halen en zich welkom voelen, hoe groter de kans dat ze blijven. Dat is het belangrijkste wat je nu kunt doen: ze snel in beweging en in verbinding brengen.

EEN WARM WELKOM

Stuur meteen een persoonlijk berichtje. Oprecht blij dat ze er zijn. Voeg ze toe aan de team-WhatsApp en de Facebook-groep, zodat ze meteen een warm bad voelen en zien dat ze er niet alleen voor staan.

HELP ZE DE EERSTE STAPPEN

Loop samen de allereerste dingen door: hun webshop, hun WHY, en hun eerste post of eerste namen. Niet alles tegelijk, wel genoeg om in beweging te komen. Eén klein resultaat in de eerste dagen doet wonderen voor hun vertrouwen.

DUPLICATIE BEGINT HIER

Alles wat jij in jouw eerste stappen hebt geleerd, geef je nu door. Dat is het mooie van dit vak: jouw pad wordt hun pad. En als jij ze goed begeleidt, doen zij dat straks weer bij hun eigen mensen.

NIET ALS BAAS, WEL ALS GIDS

Je bent geen baas die taken uitdeelt. Je bent een gids die naast iemand loopt. Vraag, luister, vier elke kleine stap mee. Zo bouw je niet alleen een team, maar ook een band.`,
      },
    ],
  },
];

/** Vind een situatie op slug. */
export function vindSituatie(slug: string): WatNuSituatie | undefined {
  for (const groep of WAT_NU_GROEPEN) {
    const gevonden = groep.situaties.find((s) => s.slug === slug);
    if (gevonden) return gevonden;
  }
  return undefined;
}

/** Alle slugs, voor route-generatie. */
export function alleSituatieSlugs(): string[] {
  return WAT_NU_GROEPEN.flatMap((g) => g.situaties.map((s) => s.slug));
}
