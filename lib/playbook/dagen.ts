// ============================================================
// PLAYBOOK — dag 1 t/m 21 volledig uitgewerkt
// Fase 1 (dag 1-7): fundament
// Fase 2 (dag 8-14): momentum
// Fase 3 (dag 15-21): ritme
// Elke dag: ✅ controllables · 🎯 fase-doel · 📍 waar in ELEVA ·
// 💡 wat je leert · 🌱 waarom dit werkt.
// ============================================================

import { Dag } from "./types";

export const DAGEN: Dag[] = [
  // ============================================================
  // FASE 1 — FUNDAMENT (dag 1-7)
  // ============================================================
  {
    nummer: 1,
    titel: "Je fundament: WHY + je namenlijst",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag1-onboarding",
        label: "Voltooi de ELEVA-onboarding als je dat nog niet hebt",
        verplicht: true,
        actieRoute: "/onboarding",
      },
      {
        id: "dag1-why",
        label: "Lees je WHY terug en stem 'm fijn af",
        uitleg:
          "Je hebt 'm in de onboarding al gemaakt — vandaag een rustig moment om hem terug te lezen en te voelen of het nog klopt. Wil je iets bijschaven? Open Mijn WHY en pas 'm aan in gesprek met de Mentor. Op moeilijke dagen lees je 'm hier terug.",
        verplicht: true,
        actieRoute: "/mijn-why",
      },
      {
        id: "dag1-vcard",
        label: "Importeer je telefooncontacten",
        uitleg:
          "Open je Contacten-app op je telefoon en exporteer je contactenlijst (een .vcf-bestand). Upload dat in ELEVA — we filteren dubbelingen automatisch. In één keer staan al je 100+ contacten klaar. Daar bouw je deze week verder op met losse namen uit je hoofd en uit socials.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag1-sponsor",
        label: "Stuur je sponsor een kort bericht: 'Ik ben gestart'",
        uitleg:
          "Geen lang verhaal nodig, gewoon even laten weten dat je vertrokken bent. Vanaf nu kijkt je sponsor in ELEVA vriendelijk mee of je dagelijks je stappen zet. Niet om te beoordelen. Gewoon om je rugdekking te geven.",
        verplicht: true,
        actieRoute: "/team",
      },
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "WHY invullen",
        menupad: "Menu → Mijn WHY → Start WHY-gesprek",
        spraak: "Start mijn WHY",
        route: "/mijn-why",
      },
      {
        actie: "Telefooncontacten importeren",
        menupad: "Menu → Namenlijst → Importeer contacten",
        route: "/namenlijst",
      },
      {
        actie: "Sponsor-contact (ook in FAB onderaan)",
        menupad: "Menu → Team → Mijn sponsor",
        route: "/team",
      },
    ],
    watJeLeert: `Vandaag is GEEN doe-dag, het is een FUNDAMENT-dag. We gaan het rustig opbouwen. Twee dingen die we vandaag echt goed wegzetten: je WHY en je namenlijst. Daar bouw je de komende 60 dagen bovenop.

JE WHY — HET KOMPAS, NIET HET RAPPORT:
Je WHY is geen samenvatting van wie je nu bent. Het is het ANKER van waar je naartoe wilt — en wáárom. Op moeilijke dagen (en die komen) lees je 'm terug en denkt: "oh ja, daarvoor doe ik dit". Zonder WHY ben je een netwerker zonder reden. Met WHY ben je iemand die met richting werkt.

EEN STERKE WHY HERKEN JE AAN:
• Je voelt 'm in je lichaam als je 'm hardop zegt — niet alleen in je hoofd
• Het is concreet ("zodat ik bij mijn kinderen kan zijn als ze thuiskomen") niet vaag ("zodat ik vrijheid heb")
• Het bevat een PIJN (waar je weg van wilt) én een VISION (waar je heen wilt)
• Je kunt 'm in 3 zinnen aan 3 verschillende mensen vertellen en het raakt allemaal

De ELEVA Mentor stelt je een paar zachte vragen, jij antwoordt eerlijk, daarna heb je een WHY die past. Hardop praten in voicememo mag prima.

JE NAMENLIJST — JE VOORRAADKAST:
Hoe voller je voorraadkast, hoe makkelijker je elke dag iets nieuws kunt 'koken'. De import van je telefooncontacten legt direct 100-500 namen voor je neer (we ontdubbelen automatisch). Dat is geen verkooplijst, dat is een uitgangspunt.

EERLIJK OVER VOLUME: dit is een AANTALLEN-VERHAAL. Met 20 namen ga je het niet redden. Niet omdat je faalt, maar omdat een gemiddelde prospect 4-6 contactmomenten nodig heeft voor een echte beslissing. Met te weinig namen draai je vast. Daarom voegen we elke dag namen toe — uit hoofd, uit telefoon, uit socials.

CATEGORIEËN OM TE OVERWEGEN VOOR JE LIJST:
• Familie + partners van familie
• Beste vrienden + hun partners
• Oude vrienden (school, studie, vorige stad)
• Huidige collega's
• Vorige collega's
• Sport / hobby / club
• Ouders bij school of voetbal
• Buurt
• Ondernemers in je netwerk
• Mensen die je via socials volgen
• Vroegere klanten / opdrachtgevers
Niemand filteren — alles op de lijst.

JIJ LAAT ZIEN, ZIJ BESLISSEN — DE GROOTSTE MENTAL SHIFT:
Jouw taak is NIÉT overtuigen, NIÉT mensen "binnenpraten", NIÉT iemand laten kiezen voor wat jij wilt. Jouw taak = laten ZIEN wat het is. Zij beslissen wat ze ermee doen. Dat maakt je werk een flink stuk lichter dan veel mensen denken — en het maakt het ook respectvoller. Niemand voelt zich gemanipuleerd, jij voelt je geen verkoper, en de mensen die wel kiezen doen dat omdat het écht bij ze past.

VEELGEMAAKTE FOUTEN OP DAG 1:
✗ WHY te perfect willen formuleren — eerste versie is goed genoeg, evolueer 'm later.
✗ Namenlijst meteen filteren ("die zou nooit..."): NIVEA komt morgen, voor nu = alles erop.
✗ Direct mensen DM'en omdat je "wilt scoren" — vandaag is fundament, niet acquisitie.
✗ Sponsor niet inlichten — je rugdekking begint nu.

WAT JE TODAY DOET, IN VOLGORDE:
1. Open ELEVA Mentor → klik op "Mijn WHY" → laat de coach je 5 vragen stellen.
2. Voltooi je WHY (10-15 min, hardop praten mag).
3. Open Namenlijst → importeer je telefooncontacten → kijk wat er staat (geen filter, niets weggooien).
4. Stuur je sponsor 1 kort bericht: "Ik ben gestart 🚀". Geen lang verhaal nodig.
5. Klaar voor vandaag. Morgen begint het werk pas echt.

OVERWELDIGD VOELEN IS NORMAAL: je leert iets nieuws, je stapt uit comfort. Eerst onhandig, dan vaardig — geldt voor iedereen hetzelfde. Sponsor staat naast je, ELEVA Mentor ook. Niet alleen.`,
    waaromWerktDit: {
      tekst:
        "De mensen die op dag 47 nog doorgaan, zijn vaak dezelfden die op dag 1 hun WHY hebben opgeschreven. Zonder fundament geen gebouw.",
    },
  },

  {
    nummer: 2,
    titel: "NIVEA + eerste 3 invites samen met sponsor",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag2-20-namen",
        label: "Voeg 20 namen toe buiten je telefoon-contacten",
        uitleg:
          "Uit je hoofd, WhatsApp top-chats, oud-collega's, familie, sport, hobby's, ouders van vriendjes, buurt. Spraak-FAB: 'Nieuwe prospect [naam] uit [context]'.",
        verplicht: true,
      },
      {
        id: "dag2-onboarding-module",
        label: "Lees de onboarding-module 'NIVEA'",
        verplicht: true,
      },
      {
        id: "dag2-kennismaak",
        label: "Kennismakings-call of -app met je sponsor (30 min)",
        uitleg:
          "Korte check-in. Jouw WHY laten lezen, sponsor vertelt wat jullie samen gaan doen fase 1. Vraag in deze call meteen om hulp bij je eerste 3 invites vandaag.",
        verplicht: true,
      },
      {
        id: "dag2-3-invites",
        label: "Stuur je eerste 3 uitnodigingen, samen met sponsor of via Mentor",
        uitleg:
          "Kies 3 warmere mensen uit je lijst. Stel ze samen met je sponsor op (in jullie call), of vraag de Mentor: 'Schrijf een uitnodiging voor [naam] die [context]'. Drempel laag houden, gewoon doen, niet perfect.",
        verplicht: true,
      },
      {
        id: "dag2-3weg-uitleg",
        label: "Lees kort: '3-weg-gesprek principe' (3 min)",
        uitleg:
          "Wat is een 3-weg en waarom werkt het? Korte uitleg in ELEVA. Je hoeft 'm nog niet te doen, je hoeft alleen even te weten dát je je contacten kunt koppelen aan je sponsor. Dat is de versneller in week 1.",
        verplicht: true,
      },
      {
        id: "dag2-webshop",
        label: "🛒 Lifeplus webshop aanmaken",
        uitleg:
          "Eenmalige opzet — bekijk de korte film (te vinden in deze taak) en je shop staat. Dit moet eerst gebeuren voordat je je kredietformulier kunt invullen.",
        verplicht: true,
        filmSlug: "onboarding-stap-6-webshop",
      },
      {
        id: "dag2-krediet",
        label: "✅ Kredietformulier invullen (verplicht voor uitbetaling)",
        uitleg:
          "Korte stap van ~5 minuten, NA het aanmaken van je webshop. Zonder dit formulier kan je eerste maand-uitbetaling niet verwerkt worden — doe het direct.",
        verplicht: true,
        filmSlug: "onboarding-stap-8-kredietformulier",
      },
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Nieuwe naam handmatig",
        menupad: "Namenlijst → + Nieuwe prospect",
        spraak: "Nieuwe prospect [naam] uit [context]",
        route: "/namenlijst/nieuw",
      },
      {
        actie: "Sponsor-contact",
        menupad: "Playbook → FAB rechtsonder → Bel/app mijn sponsor",
      },
      {
        actie: "Uitnodiging laten schrijven door Mentor",
        menupad: "ELEVA Mentor",
        spraak: "Schrijf een uitnodiging voor [naam] die [context]",
      },
      {
        actie: "3-weg-principe lezen",
        menupad: "Onboarding → Module '3-weg-gesprek (kort)'",
      },
    ],
    watJeLeert:
      `NIVEA is dé regel die de meeste starters vergeten en daardoor 80% van hun beste prospects op voorhand uit elimineren. NIVEA staat voor: Niet Invullen Voor Een Ander.

Wat het concreet betekent: jij weet NIET wat er in iemand omgaat. Wat zijn financiële situatie is. Wat zijn relatie doet. Of zijn werk hem nog vult. Of zijn gezondheid 'm uitput. Of die gladde collega thuis stiekem worstelt. Je hebt een momentopname in je hoofd — vaak van jaren geleden — en daarop maak je een oordeel "die zit hier niet op te wachten". Dat is zelden waar.

Bovendien: zelfs als die specifieke persoon écht niet voor zichzelf gaat, kent hij/zij wél iemand die wél past. Iedereen heeft een netwerk van 100+ mensen. Een schoonzus die net moeder is geworden, een oud-collega die ontslag heeft gekregen, een buurman die met pensioen twijfelt. Jij weet dat niet. Je kunt het niet weten. Daarom: alle namen op de lijst. Filteren doe je later, als je échte signalen hebt — niet vóóraf in je eigen hoofd.

Drie typische "ik filter al"-fouten en wat de waarheid bleek:
• "Die zwager heeft een goede baan" — bleek 6 maanden later open te staan toen herstructurering doorkwam.
• "Die moeder bij voetbal is zo druk" — werd de eerste die ja zei, want ze zocht juist iets dat naast haar gezin paste.
• "Die oud-collega zie ik nooit meer" — bleek een netwerk van 200+ ondernemers te hebben en had de perfecte intro.
Patroon: jouw oordeel zegt meer over jouw beelden dan over hun werkelijkheid.

Hoe je vandaag NIVEA in praktijk brengt:
1. Pak 30 minuten, geen telefoon, geen afleiding.
2. Loop categorieën door: familie • partners van familie • oude vrienden • huidige vrienden • collega's nu • collega's vroeger • sport/hobby • ouders bij school/club • buurt • ondernemers in je netwerk.
3. Per categorie: schrijf élke naam op die in je hoofd opkomt. Geen filter. Voelt het ongemakkelijk? Dat is precies de plek om door te zetten.
4. Spraak-FAB werkt het snelst: "Nieuwe prospect [naam] uit [context]" en je hebt 20 namen in 10 minuten.
5. Stop niet bij 20. Ga door totdat het écht op is — vaak zit je dan op 50-100.

Veelgemaakte fouten — herkenbaar?
✗ "Hij heeft toch geen geld" → vooroordeel, geen feit.
✗ "Die heeft het te druk" → laat hem zelf bepalen of hij tijd heeft.
✗ "Die zou nooit naar mij luisteren" → projectie van eigen onzekerheid.
✗ Wachten met uitnodigen tot je lijst "perfect" is → de lijst is nooit perfect.
✗ Eerst zelf alle bezwaren beantwoorden in je hoofd → dat is hun werk, niet jouw werk.

Vandaag stuur je ook al 3 uitnodigingen — samen met je sponsor in een groepje (3-weg principe). Sponsor brengt autoriteit, jij koppelt, prospect ziet twee mensen die samenwerken. Dat is de hefboom waarmee je niet alles zelf hoeft te weten of te kunnen. Eerste invites voelen onhandig — dat klopt en gaat over. Niet daardoor stoppen, juist daardoor met steun starten.`,
    waaromWerktDit: {
      tekst:
        "De geheugensteunlijst is je voorraadkast. Hoe voller, hoe makkelijker de keuze wat je vanavond kookt. En de eerste invites zijn altijd het zwaarst, gewoon door.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 3,
    titel: "Social-challenge + 5 invites doorlopen",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag3-social-3",
        label: "Open Instagram of LinkedIn, zet 3 namen in je lijst",
        uitleg:
          "Scroll 5 minuten. Wie reageert op je posts? Wie stuurt DMs? Wie post dingen over energie, doelen, gezondheid, ondernemen? 3 namen met 1 woord context ('fitness', 'oud-collega').",
        verplicht: true,
      },
      {
        id: "dag3-invites-5",
        label: "5 uitnodigingen versturen",
        uitleg:
          "Bouw door op gisteren. Vandaag mag je het zelfstandig doen. Loop je vast? Vraag de Mentor: 'Schrijf een uitnodiging voor [naam] die [context]'.",
        verplicht: true,
      },
      {
        id: "dag3-dagelijks-5",
        label: "5 namen in totaal vandaag (telefoon + socials + hoofd)",
        verplicht: true,
      },
      {
        id: "dag3-eerste-gesprek",
        label: "Start 1 losse chat met een warme prospect (geen pitch)",
        uitleg:
          "Reageer op hun laatste post of story. Vraag hoe het gaat. Niets verkopen. Nog geen uitnodiging. Gewoon even contact, koude mensen warm maken vóór de invite later komt.",
        verplicht: false,
      },
      {
        id: "dag3-sponsor-checkin",
        label: "Korte sponsor-checkin (1 bericht): 'Heb gister 3 invites gestuurd'",
        uitleg:
          "30 seconden. Sponsor weet dat je beweegt, jij voelt de lijn naar boven open. Niets uitgebreids, gewoon even een update.",
        verplicht: false,
      },
      {
        id: "dag3-teams-admin",
        label: "📋 Teams-administratiesysteem aanmaken",
        uitleg:
          "Lifeplus Partner-aanmelding — eenmalige administratieve registratie. Bekijk de korte film in deze taak voor de exacte stappen.",
        verplicht: true,
        filmSlug: "onboarding-stap-7-teams-admin",
      },
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Dagelijkse social-challenge",
        menupad: "Dashboard → widget '3 namen uit socials'",
        route: "/dashboard",
      },
      {
        actie: "Nieuwe naam via spraak",
        spraak: "Nieuwe prospect [naam] uit Instagram",
      },
    ],
    watJeLeert: `Instagram, Facebook en LinkedIn geven je geen downloadbare contactenlijst — dat is expres zo. Maar ze geven je iets veel waardevollers: ACTIEVE SIGNALEN. Mensen die jouw content bekijken, reageren, delen, in stories duiken. Dat is gedrag dat zegt: "ik volg je, je content raakt me, je bent op mijn radar." Dát zijn je warme contacten van de toekomst — vaak veel beter geschikt dan oude telefooncontacten waarmee je al jaren geen woord hebt gewisseld.

3 namen per dag uit socials = 21 nieuwe warme prospects per week, bovenop je telefoonlijst. Dat is serieus voorraadkast-volume zonder dat je rond hoeft te bellen.

WAT JE VANDAAG DOET — concrete radar-check:
1. Open Instagram en kijk: wie reageert al een paar weken op jouw verhalen of posts?
2. Wie stuurt je af en toe een DM, ook al is het maar een hartje of een snelle vraag?
3. Wie post zelf dingen over energie, doelen, ondernemen, gezondheid — onderwerpen die raken aan wat jij gaat doen?
4. Wie keek je laatste story tot het einde of klikte op een sticker?
5. LinkedIn: wie heeft recent ge-liked, ge-deeld, of jou direct getagd?

ALLE DRIE de namen krijgen ÉÉN WOORD context op de lijst (bv. "fitness", "oud-collega", "Linkedin-coach"). Niet meer, geen biografie. Het label is genoeg om te onthouden waar je zat toen je 'm noteerde.

VEELGEMAAKTE FOUTEN:
✗ "Ik kén niemand op Instagram" → je hoeft ze niet te kennen, ze hoeven jou alleen al te volgen.
✗ Wachten tot iemand "duidelijk een match" is → je weet de match niet, je weet alleen het signaal.
✗ Direct DM-en als "verkooppraatje" → eerst koppelen, peilen, niet pitchen.
✗ Tegen jezelf zeggen "ze hebben me lang niet meer geliket dus zal niet meer interesseren" → 3 weken stilte ≠ uit-radar, het is gewoon niet hun moment.

NIET GELIJK PITCHEN — wat wel: reageer terug op hun content. Vraag iets. Bouw rapport. Pas DAARNA, in een tweede of derde gesprek, kom je met een uitnodiging (zie dag 4 voor de 4-stappen-formule).`,
    waaromWerktDit: {
      tekst:
        "Social media is geen podium, het is een radar. Je kijkt niet wie er klapt. Je kijkt wie er zwaait.",
      bron: "Fraser Brookes, 3 minutes on social",
    },
  },

  {
    nummer: 4,
    titel: "De 4-stappen-uitnodiging + (optioneel) eerste 3-weg met sponsor",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag4-uitnodiging-1-5",
        label: "5 uitnodigingen versturen, 4-stappen toepassen",
        uitleg:
          "1) wees druk, 2) compliment, 3) uitnodig, 4) plan. Houd het kort. Doel = ja tegen het kijkmoment, niet ja tegen jou.",
        verplicht: true,
      },
      {
        id: "dag4-3weg-optioneel",
        label: "Optioneel: 1 3-weg-gesprek met sponsor starten",
        uitleg:
          "Heb je al iemand die warm is uit dag 2-3? Koppel die aan je sponsor in een WhatsApp-groepje. Sponsor = expert, jij = student. Dit oefen je nu, niet over een week.",
        verplicht: false,
      },
      {
        id: "dag4-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag4-follow-1",
        label: "2 follow-ups op eerdere contacten",
        uitleg:
          "Bijvoorbeeld op de persoon uit dag 3 met wie je een losse chat startte. Niet pitchen, gewoon even peilen.",
        verplicht: false,
      },
      {
        id: "dag4-bestellinks",
        label: "🔗 Bestellinks koppelen aan ELEVA",
        uitleg:
          "Plak per pakket je Lifeplus webshop-URL in ELEVA. Daarna gebruikt ELEVA die links automatisch in productadvies-flows. Vraag je sponsor om mee te kijken voor de juiste shop-product-pagina's per pakket.",
        verplicht: false,
        actieRoute: "/instellingen/bestellinks",
        filmSlug: "onboarding-stap-9-bestellinks",
      },
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Scripts openen",
        menupad: "Menu → Scripts → Uitnodigingen",
        route: "/scripts",
      },
      {
        actie: "Coach helpt met een persoonlijke uitnodiging",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Schrijf een uitnodiging voor [naam] die [context]",
        route: "/coach",
        prefillTemplate: "Schrijf een uitnodiging voor: [naam], context: [bv. oud-collega, druk gezin, ondernemer], variant: indirect.",
      },
      {
        actie: "Open prospect-kaart om te DM-en",
        menupad: "Menu → Namenlijst → klik op prospect",
        route: "/namenlijst",
      },
    ],
    watJeLeert: `De 4-stappen-uitnodiging (Worre) is dé reden dat netwerkers met dezelfde lijst totaal verschillende resultaten boeken. Het is een vaste opbouw waarbij elk onderdeel een specifieke psychologische functie heeft.

DE FORMULE — vier stappen, in deze volgorde:
1) WEES DRUK — "Ik heb weinig tijd, maar..." Eén zinnetje, geen breedvoerig verhaal. Hierdoor signaleer je waarde aan je tijd én voorkom je een lang vrijblijvend gesprek waarin de spanning eruit lekt.
2) COMPLIMENT — "Jij bent iemand die dingen voor elkaar krijgt." Echt, specifiek, geen smeerolie. Maakt dat je prospect zich GEZIEN voelt. Mensen werken niet voor verkoop-praatjes, ze werken voor erkenning.
3) UITNODIGEN — kies de variant die past bij hoe warm de prospect is:
   • DIRECT (warme prospect, vertrouwen al hoog): "Ik ben gestart met iets nieuws, wil het je laten zien."
   • INDIRECT (mid-warm): "Dit is vast niets voor jou, maar ken jij iemand die extra wil verdienen?"
   • SUPER-INDIRECT (lauw of onbekend): "Ken jij toevallig mensen die openstaan voor bij-inkomen?"
4) PLAN — "Wanneer schikt het, vanavond of morgen?" Geef twee tijdsblokken, geen open vraag. Open vragen ("wanneer kan jij?") leiden 80% naar uitstel.

DE KERN — JE TAAK = UITNODIGEN, NIET OVERTUIGEN:
Je wilt niet dat ze "ja" zeggen tegen JOU. Je wilt dat ze "ja" zeggen tegen een KIJKMOMENT. Dat is een veel lagere drempel. Een kijkmoment is geen commitment, geen mening, geen koop. Het is alleen "ik kijk even mee, daarna beslis ik". Dat verkoop je 10× makkelijker dan een product.

DRIE VOORBEELD-UITNODIGINGEN, alle drie in de 4-stappen:

1. WhatsApp aan oud-collega (warm):
"Hé Mark, ik heb het druk en wilde dit even snel sturen. Jij bent iemand die altijd doorpakt en daarom denk ik aan jou. Ik ben net gestart met iets waar ik 60 dagen vol voor ga — wil je dat ik je kort laat zien wat het inhoudt? Vrijblijvend hoor. Vanavond of morgen aan het eind van de dag?"

2. DM aan iemand die op je posts reageert (mid):
"Hé Linda, snel berichtje tussendoor. Je reageert al een tijdje op wat ik deel, dat waardeer ik. Ik ben gestart met iets dat past bij wat ik aan het opbouwen ben — wil je dat ik je in 1 minuut laat zien hoe het werkt? Geen verplichting, even meekijken. Donderdag of vrijdag?"

3. Spraak naar oude vriend (super-indirect):
"Hé broer, snel ding. Even goed te bellen — ben jij niet diegene die altijd weet wie er met wat bezig is? Ik zoek mensen die openstaan voor extra inkomen naast hun werk. Ken jij toevallig iemand? Bel je woensdagavond?"

VEELGEMAAKTE FOUTEN:
✗ Compliment vergeten → klinkt als pitch.
✗ Geen tijdslimiet ("Ik heb druk") in plaats van "weinig tijd, maar..." → mist de spanning.
✗ Té veel uitleg in de uitnodiging zelf → ze haken af. Uitnodiging is voor het kijkmoment, niet voor de info.
✗ Open afsluiten ("laat me weten of het je interesseert") → 80% uitstel.
✗ Antwoord op bezwaren al vooraf in het bericht stoppen ("ik weet dat je geen tijd hebt maar...") → je legt zelf de twijfel op tafel, doe dat niet.
✗ "Ja zeggen tegen jou" willen forceren in plaats van "ja tegen het kijkmoment". Verschuif de vraag.

Vandaag stap je actief uit je comfortzone, en dat kriebelt — afwijzingsangst, "wat als ze me raar vinden?". Helemaal normaal. Niemand begint vaardig. Een nee is geen oordeel over jou, het is een momentopname over hen. Volgende uitnodiging gewoon doorgaan.`,
    waaromWerktDit: {
      tekst:
        "Wees zakelijk. Wees professioneel. Wees kort. Dan neem je mensen serieus genoeg om ze de ruimte te geven zélf nee te zeggen.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 5,
    titel: "Feel-Felt-Found: als ze aarzelen",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag5-invites-5",
        label: "5 uitnodigingen (nieuwe mensen of via follow-up)",
        verplicht: true,
      },
      {
        id: "dag5-followups-3",
        label: "3 follow-ups op mensen van dag 3-4",
        verplicht: true,
      },
      {
        id: "dag5-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag5-onboarding-bezwaar",
        label: "Lees de onboarding-module 'Bezwaren behandelen'",
        verplicht: true,
      },
      {
        id: "dag5-roleplay",
        label: "5 min roleplay bezwaren, met sponsor of Mentor",
        uitleg:
          "Vraag je sponsor om 1-2 typische bezwaren te 'spelen' en oefen Feel-Felt-Found. Geen sponsor beschikbaar? Mentor: 'Speel een prospect die zegt: ik heb geen tijd', en dan oefen je met Feel-Felt-Found.",
        verplicht: false,
      },
      {
        id: "dag5-eric-worre-start",
        label: "🎧 Start met Eric Worre's Seven Skills (15 min Spotify)",
        uitleg:
          "Vanaf vandaag dagelijks ~15 minuten luisteren — in de auto, tijdens werk of een wandeling. Voor je mindset én om dit vak goed te leren. Eric Worre is wereldwijd de meest gerespecteerde trainer in network marketing. Niet één keer doorkijken, herhalend aanhoren — wat hij vertelt landt na de 4e of 5e keer pas écht.",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Coach helpt bij een specifiek bezwaar",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Hoe ga ik om met het bezwaar [bezwaar]",
        route: "/coach",
        prefillTemplate:
          "Help me met het bezwaar: [bv. 'ik heb geen tijd' / 'ik wil eerst nadenken' / 'ik ken te weinig mensen']. Geef me een Feel-Felt-Found-respons en de doorvraag-zin.",
      },
      {
        actie: "Bezwaar-scripts in Scripts",
        menupad: "Menu → Scripts → Bezwaren",
        route: "/scripts",
      },
      {
        actie: "Prospect op 'Niet nu' zetten als ze afhouden",
        menupad: "Prospectkaart → Pipeline-fase → Not yet",
        route: "/namenlijst",
      },
      {
        actie: "Eric Worre Seven Skills (Spotify)",
        menupad: "https://open.spotify.com/album/3pX4DrWPVsjW8GCE2XYd7D",
      },
    ],
    watJeLeert: `Feel-Felt-Found is dé universele bezwaar-techniek. Werkt op zowat élk bezwaar omdat het drie psychologische dingen tegelijk doet: erkennen, normaliseren, herframen. Zonder dat de prospect het gevoel krijgt dat hij wordt 'ompraat'.

DE FORMULE:
• FEEL — "Ik snap dat het zo voelt." Erken het gevoel. NIET het bezwaar weerleggen, alleen valideren dat het bestaat.
• FELT — "Veel mensen voelden dat in het begin ook." Normaliseer. De prospect is niet raar, hij is in goed gezelschap.
• FOUND — "Wat zij merkten was [korte herframing]." Geef de nieuwe lens, in 1 zin, niet als argument maar als observatie.
• AFSLUITEN MET DOORVRAAG — "Maar vertel eens, waar zit het 'm nu écht in?" Dit is de KEY-stap die de meeste mensen vergeten.

DE GOUDEN REGEL — DE EERSTE WEERSTAND IS BIJNA NOOIT DE ECHTE:
"Geen tijd", "ik wil eerst nadenken", "ik ben niet van sales" — dat zijn emotionele schilden. Beleefde manieren om afstand te maken. De échte twijfel zit eronder: angst voor afwijzing door familie, slechte ervaring met netwerkmarketing, schaamte voor financiële situatie, niet weten waar te beginnen. Jouw werk = vriendelijk doorvragen tot de échte zorg op tafel komt. Daar pas kun je écht helpen.

DRIE VOORBEELDEN VAN FEEL-FELT-FOUND:

1. Bezwaar: "Ik heb geen tijd."
"Ik snap dat het zo voelt — iedereen die ik ken heeft het al druk genoeg. Veel mensen die nu starten dachten dat ook in het begin. Wat zij merkten is dat het juist flexibel werkt naast wat ze al deden — een paar avonden in de week, soms minder. Maar vertel eens, waar zit het 'm nu écht in? Is het tijd, of speelt er iets anders mee?"

2. Bezwaar: "Ik wil eerst nadenken."
"Helemaal logisch dat je daar even mee wilt zitten. Veel mensen voelden dat in het begin ook. Wat zij merkten is dat 'nadenken' meestal betekent dat één specifiek punt nog onduidelijk is — geen totaal nee. Mag ik je iets vragen: waar wil je precies over nadenken? Is het de tijd, het vertrouwen, of het idee zelf?"

3. Bezwaar: "Ik ben niet van sales."
"Snap ik 100% — ik dacht dat zelf ook. Wat ik (en velen die starten) merkten is dat dit geen sales is in de traditionele zin: geen koud bellen, geen markten afgaan, geen targets. Het is mensen die jij al kent uitnodigen om iets te bekijken. Maar ik ben benieuwd, waar komt dat 'niet van sales'-gevoel bij jou vandaan?"

VEELGEMAAKTE FOUTEN:
✗ Direct argumenteren ("dat klopt niet, want...") → de prospect sluit af.
✗ FEEL overslaan en meteen FOUND → voelt als pitch.
✗ Vergeten af te sluiten met een doorvraag → blijft hangen in de ruimte.
✗ Prospect wegwuiven met "ach, dat lossen we wel op" → hij voelt zich niet gehoord.
✗ Eigen verhaal lang vertellen ("ik dacht dat ook!") → maakt het over jou.
✗ Drammen na een nee → break van vertrouwen, prospect onthoudt het altijd negatief.

EXTRA — VANDAAG START JE MINDSET-ROUTINE:
15 minuten per dag Eric Worre in je oren — auto, wandeling, koffie. Wat hij vertelt over WHY, vision en leiderschap is brandstof onder je dagelijkse acties. Niet één keer doorluisteren, herhalend aanhoren tot het in je systeem zit.`,
    waaromWerktDit: {
      tekst:
        "Een bezwaar is geen muur. Het is een vraag die niet weet hoe 'm te stellen.",
      bron: "Fraser Brookes",
    },
  },

  {
    nummer: 6,
    titel: "Follow-up: de 24-48u regel",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag6-invites-5",
        label: "5 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag6-followups-3",
        label: "3 follow-ups (eerste aanknopingspunt!)",
        uitleg:
          "Iedereen die je dag 4-5 hebt uitgenodigd en niet meer gereageerd heeft? Vandaag is follow-up-dag. Een niet-antwoord is géén nee, het is meestal gewoon stilte.",
        verplicht: true,
      },
      {
        id: "dag6-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag6-sponsor-tip",
        label: "Vraag sponsor of Mentor: 1 tip op je lastigste follow-up",
        uitleg:
          "Heb je 1 contact waar je niet weet wat je moet sturen? Vraag je sponsor: 'Hoe zou jij dit aanpakken?'. Sponsor even druk? Dan de Mentor: 'Help me met een follow-up voor [naam] die [situatie]'. Je hoeft het niet alleen te bedenken.",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Follow-up herinneringen",
        menupad: "Menu → Herinneringen → Vandaag",
        route: "/herinneringen",
      },
      {
        actie: "Coach helpt met een specifieke follow-up",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Help me met een follow-up voor [naam] die [situatie]",
        route: "/coach",
        prefillTemplate:
          "Help me met een follow-up voor: [naam], status: [bv. heeft al de info gekregen / heeft nog niet gereageerd op uitnodiging / zat in het 3-weg gisteren]. Schrijf een korte, warme follow-up.",
      },
      {
        actie: "Follow-up scripts",
        menupad: "Menu → Scripts → Follow-up",
        route: "/scripts",
      },
    ],
    watJeLeert: `Follow-up is geen optie, het is JE WERK. 80% van alle "ja's" komen pas na de derde tot vijfde aanraking. Wie alleen uitnodigt en dan stopt, verliest de meeste deals voordat het gesprek serieus wordt. De goede netwerker volgt OP en blijft warm — zonder te jagen.

DE 24-48U REGEL:
Stuur 24-48 uur na een uitnodiging je eerste check-in. Niet eerder (dan voelt het opdringerig), niet later (dan is de psychologische ruimte alweer dicht en is je prospect het kwijt). Gemiddeld zijn 5 contactmomenten nodig voor iemand een echte beslissing maakt — dat is geen drammen, dat is gewoon de statistiek van menselijk gedrag.

DE 5-FASEN-FOLLOW-UP:
1) CHECK-IN (24-48u): "Even inchecken — hoe gaat het met je?" GEEN "heb je al nagedacht?". Geen beoordelaar zijn.
2) PEILEN (na 3-5 dagen): "Wat sprak je het meeste aan van wat je gezien hebt?" Open vraag, focus op WAT, niet op JA/NEE.
3) VERDIEPEN (na 7-10 dagen): "Dit wilde ik je ook nog laten zien..." Tweede waardevol punt — een testimonial, een product-review, een nieuw filmpje.
4) UITNODIGING NAAR EVENT/3-WEG (na 10-14 dagen): "Er is binnenkort iets dat past, wil je erbij zijn?" Verlaag de drempel naar een nieuwe exposure.
5) SLUITEN OF NOT-YET (na 14-21 dagen): "Wat is voor jou het belangrijkste punt om helder te krijgen?" Direct, eerlijk, zonder druk.

DE TOON — WAT JE WEL EN NIET DOET:
✓ "Even inchecken" → vriendelijk, niet beoordelend
✓ "Wat sprak je aan?" → focus op wat positief is
✓ "Mag ik over 3 maanden nog eens vragen?" → nee = nu, niet voor altijd
✗ "Heb je al nagedacht?" → zet ze in beoordelaar-positie
✗ "Wat vond je ervan?" → vraagt om mening, opent kritiek
✗ "Ben je er nu uit?" → druk, sluit gesprek af
✗ Stilte na 1 keer geen reactie → fataal, je verliest 80%

DRIE VOORBEELDEN — verschillende fasen:

1. CHECK-IN (24u na uitnodiging, geen reactie):
"Hé Mark, even inchecken hoor — hoe gaat het bij jou? Geen druk, ik vroeg me gewoon af of het bericht goed was aangekomen 😊"

2. PEILEN (na de info-link):
"Hé Linda 🥰 wat sprak je het meeste aan van wat je tot nu hebt gezien? Ben benieuwd!"

3. STILLE PROSPECT (5-10 dagen geen reactie):
"Hé Jaap, geen reactie ontvangen — kan zijn dat het er niet bij past en dat is helemaal goed. Mag ik over een paar maanden nog eens vragen, voor het geval dingen veranderen? 👍🏽"

DE LANGSPEELPLATEN-REGEL:
Een prospect die NU geen ja zegt, kan over 3 maanden alsnog ja zeggen. Of over 1 jaar. Houd ze warm, hou ze vriendelijk, en blijf in hun leven via je gewone content (geen pitches in de DM). Dan ben je top-of-mind als hun situatie verandert. "Niet jagen, niet smeken, wel richting geven" — Worre.`,
    waaromWerktDit: {
      tekst:
        "Niet jagen, niet smeken, wel richting geven. Gemiddeld 5 exposures, dat is gewoon de statistiek.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 7,
    titel: "Week 1 review: wat ging goed, wat schuurde?",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag7-review",
        label: "Vul de wekelijkse review in (5 min reflectie)",
        uitleg:
          "3 vragen: wat ging goed deze week? wat schuurde? waar focus ik volgende week? Je sponsor krijgt automatisch een samenvatting.",
        verplicht: true,
      },
      {
        id: "dag7-rust-5",
        label: "5 uitnodigingen (iets rustiger, het is review-dag)",
        verplicht: true,
      },
      {
        id: "dag7-followups-3",
        label: "3 follow-ups",
        verplicht: true,
      },
      {
        id: "dag7-sponsor-call",
        label: "15 min call met sponsor over week 2",
        uitleg: "Wat werkte? Wat gaan we anders doen? Wat is fase 2?",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 1 afgerond. Heb je je 2 one-pager-momenten? Mooi. Zo niet: ze schuiven door. Focus blijft hetzelfde.",
    waarInEleva: [
      {
        actie: "Wekelijkse review",
        menupad: "Dashboard → widget 'Wekelijkse review'",
        route: "/dashboard",
      },
      {
        actie: "Fase 1 statistieken",
        menupad: "Menu → Statistieken → Fase 1",
      },
    ],
    watJeLeert: `Een wekelijkse review is geen rapportcijfer, het is een KOMPAS-CHECK. 5 minuten reflectie scheelt je 5 dagen dwaling. Niet voor je sponsor, voor jezelf — om te zien waar je staat versus waar je heen wilt.

DRIE VRAGEN DIE WERKEN (en die ELEVA voor je voorlegt):
1) WAT GING GOED? Eerlijk, klein én groot. "Ik heb 3 invites verstuurd" is een win. "Ik durfde mijn beste vriend uit te nodigen" is óók een win, maar van een andere soort. Beide tellen.
2) WAT SCHUURDE? Geen oordeel, geen "ik ben gewoon niet goed in dit". Wat IS er onhandig gegaan? Welke uitnodiging stuurde ik niet uit angst? Welk berichtje liet ik 4× herschrijven voor ik op verzenden klikte? Dáár zit volgende week je oefening.
3) WAAR FOCUS IK VOLGENDE WEEK? Eén ding. Niet drie. EÉN ding waar je in groeit. Kan zijn: doorvragen na een nee. Kan zijn: 1 dag dichterbij komen aan je dagelijkse aantallen. Kan zijn: durven 3-weg starten met een lauwe prospect.

DE INHAAL-REGEL — voor als je een dag over hebt geslagen:
• 1 dag stilte = geen drama. Iedereen heeft een dipje. Volgende dag pak je weer op.
• 2 dagen stilte = actie nodig. Niet schamen, niet "ik begin maandag opnieuw" — vandaag start je weer, met +50% aantallen om de gemiste dag in te halen.
• Geen schuldgevoel-spiraal. Eén overgeslagen dag = data, geen oordeel.

WAT SCHUURDE = GROEI, GEEN FALEN:
Als je deze week 7 dagen geleden iets compleet nieuws bent gestart, is onhandigheid op dag 1 logisch. En iets meer vlotheid op dag 7. Dát is het volledige plaatje. De mensen die uiteindelijk doorbreken in dit vak zijn niet degenen die in week 1 alles vlekkeloos deden — die bestaan niet — maar degenen die week 2 bleven oefenen op wat in week 1 schuurde.

WAT GA JE VOLGENDE WEEK ZIEN (sneak peek voor dag 8-14):
• Lat omhoog: 10 invites per dag i.p.v. 5
• 3-weg gesprekken — je gaat ze ECHT doen, niet alleen kennen
• One-pager versus presentatie — wanneer wat
• Product-pivot bij business-afwijzing
• FORM — hoe je iemand écht leert kennen in 5 minuten

DEZE REVIEW WORDT GEDEELD MET JE SPONSOR — niet om te beoordelen, om te ondersteunen. Sponsor ziet wat schuurde, kan jou specifiek helpen waar het schuurt. Niet zwijgen, niet polijsten — eerlijk neerzetten levert je de beste hulp.`,
    waaromWerktDit: {
      tekst:
        "Vergelijk jezelf met gisteren, niet met anderen. De run is jouw verhaal, de review is hoe je het schrijft.",
      bron: "Eric Worre + Brookes, samen",
    },
  },

  // ============================================================
  // FASE 2 — MOMENTUM (dag 8-14)
  // ============================================================
  {
    nummer: 8,
    titel: "Momentum: lat omhoog naar 10 uitnodigingen",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag8-invites-10",
        label: "10 uitnodigingen vandaag",
        uitleg:
          "Helft via directe message, helft via scripts uit ELEVA. Mix warm (mensen die je kent) met lauw (mensen uit je telefoonlijst met wie je niet vaak praat).",
        verplicht: true,
      },
      {
        id: "dag8-followups-5",
        label: "5 follow-ups",
        verplicht: true,
      },
      {
        id: "dag8-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "Pipeline-view (wie zit waar)",
        menupad: "Menu → Namenlijst → Weergave: Pipeline",
        route: "/namenlijst",
      },
      {
        actie: "Scripts om snel berichten te grijpen",
        menupad: "Menu → Scripts → Uitnodigingen",
        route: "/scripts",
      },
      {
        actie: "Coach helpt bij volume zonder spam-gevoel",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
        prefillTemplate:
          "Help me 10 uitnodigingen versturen vandaag zonder dat het als spam voelt. Ik heb [aantal] warme + [aantal] lauwe prospects op mijn lijst.",
      },
    ],
    watJeLeert: `In fase 1 leerde je HOE het werkt. In fase 2 gaat het om VOLUME. 10 uitnodigingen per dag voelt veel — maar het is 10-15 minuten werk zodra je scripts paraat hebt en je lijst goed gevuld is. Het draait vandaag niet om het perfecte bericht, het draait om DOORPAKKEN.

WAAROM 10 EN NIET 5 — DE WET VAN GROTE GETALLEN:
Met 5 uitnodigingen per dag krijg je gemiddeld 1 ja/nee/misschien per week. Met 10 verdubbelt dat, maar belangrijker: je krijgt sneller patronen. Welke openingszin werkt bij wie? Welke variant uit de 4-stappen-uitnodiging slaat aan? Dat leer je niet uit 5 berichten, dat leer je uit 50.

NL-NETWERK-WERKELIJKHEID — gemiddelden:
• Van 10 uitnodigingen → 4-6 reacties
• Van 5 reacties → 2-3 kijkmomenten (info / 3-weg)
• Van 3 kijkmomenten → 1 ja-zegger of 1 shopper of 1 not-yet
Dat is normaal. Niet teleurstellend, niet rooskleurig. Dat is gewoon wat fase 2 doet als je consistent blijft.

DE PERFECTIE-VAL:
"Perfect is de vijand van verzonden." Stuur EERDER af dan je zin hebt om ze af te sturen. Een onhandige uitnodiging die WEG is presteert oneindig veel beter dan de perfecte die nog op je telefoon staat in concept. Per uitnodiging max 30-60 seconden bedenktijd, dan op verzenden. Als je 5 minuten staart naar één bericht: kopieer een ELEVA-script en pas alleen de naam aan.

CONCRETE WERKWIJZE — 10 invites in 15 minuten:
1. Open je namenlijst, filter op "lead" of "uitgenodigd nog niet gepeild".
2. Pak 10 namen tegelijk in beeld.
3. Per naam: 1 zinnetje persoonlijke openingsregel (waar ken je hem/haar van), dan het script erachter geplakt.
4. Verzonden = afvinken in ELEVA, prospect schuift automatisch in pipeline naar 'uitgenodigd'.
5. STOP MET HERLEZEN. Vandaag is geen redactie-dag, vandaag is volume-dag.

VEELGEMAAKTE FOUTEN:
✗ Elke uitnodiging compleet uniek willen schrijven → kost 30 minuten per stuk, je haalt nooit 10.
✗ Bang zijn voor "spam-gevoel" en daarom maar 3 sturen → spam = 100 generieke. 10 persoonlijke aan mensen die jou kennen = geen spam.
✗ Wachten tot je "in de stemming" bent → je raakt nooit in stemming, je doet het en de stemming volgt.
✗ Direct na geen reactie afschrijven → 24-48u wachten, dan follow-uppen (zie dag 6).

MIX WARM EN LAUW: 5 mensen die je goed kent + 5 met wie je 6+ maanden niet gesproken hebt. De warmen geven snelle reacties (positief én negatief), de lauwen geven verrassingen — vaak juist daar zitten je beste matches.`,
    waaromWerktDit: {
      tekst: "Snelheid wint. Snel handelen verslaat perfect handelen, altijd.",
      bron: "Eric Worre",
    },
  },

  {
    nummer: 9,
    titel: "3-weg verdieping: edification + de 5 stappen",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag9-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag9-followups-5",
        label: "5 follow-ups",
        verplicht: true,
      },
      {
        id: "dag9-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag9-3weg-verdieping",
        label: "Lees 3-weg verdieping: 5 stappen + edification-zinnen",
        uitleg:
          "Het principe ken je al sinds dag 2. Vandaag de scripts: hoe kondig je je sponsor aan, hoe edifieer je 'm vooraf, wat doe je als prospect een vraag stelt aan jou ipv aan sponsor? Open een prospectkaart → '💬 3-weg gesprek scripts'.",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "3-weg-scripts per prospect (alle 5 stappen voorgevuld)",
        menupad: "Menu → Namenlijst → klik prospect → 💬 3-weg gesprek scripts",
        route: "/namenlijst",
      },
      {
        actie: "Coach legt 3-weg uit voor jouw situatie",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Leg 3-weg gesprek uit voor [naam prospect]",
        route: "/coach",
        prefillTemplate:
          "Leg me het 3-weg gesprek uit voor mijn situatie: ik ga [naam prospect] introduceren aan mijn sponsor [naam sponsor]. Welke 5 stappen volg ik? Wat moet ik vooral NIET doen?",
      },
      {
        actie: "Edification-zin checken (dag 18)",
        menupad: "Menu → Mijn zinnen → Edification-zin",
        route: "/mijn-zinnen",
      },
    ],
    watJeLeert: `Een 3-weg gesprek is geen truc, het is het krachtigste instrument dat je hebt in dit vak. Het verkort het pad van "iemand twijfelt" naar "iemand beslist" met factor 3 tot 5, simpelweg door autoriteit en sociaal bewijs in 1 gesprek samen te brengen.

DE PSYCHOLOGISCHE HEFBOOM — waarom 3-weg werkt:
1) Sponsor brengt AUTORITEIT (langere ervaring, meer mensen geholpen, eigen track-record).
2) Jij brengt VERTROUWEN (de prospect kent jou, niet de sponsor).
3) Prospect ziet TWEE mensen die al samenwerken → "blijkbaar werkt dit echt".
Geen van de drie alléén kan dit. Het is de combinatie.

DE 5 STAPPEN — letterlijk in deze volgorde, ELEVA heeft ze allemaal als script:

STAP 1 — AANKONDIGING (jij naar prospect, vóór groepje):
"Hé [naam], ik maak even een groepje aan met mijn mentor [sponsor], want ik kan het zelf nog niet zo goed uitleggen 😄. Zij doet dit al [periode] en kan met je meekijken en je vragen beantwoorden 🥰"
WAAROM: geen verrassing, prospect verwacht het, sponsor mag binnenkomen.

STAP 2 — INTRODUCTIE IN HET GROEPJE (jij):
"Hi [prospect]! 😊 Dit is [sponsor] — mijn mentor in dit traject. Ze doet dit al [periode] en heeft fantastische resultaten behaald. [Sponsor], dit is [prospect]. Ze is op zoek naar [situatie]. Wil jij haar even verder helpen? 🙏"
WAAROM: edifieert sponsor, geeft prospect-context aan sponsor, vraagt sponsor expliciet om de leiding te nemen.

STAP 3 — JIJ STAPT TERUG ⚠️ DEZE STAP IS DE LASTIGSTE:
Zwijg. Niet meepraten. Niet "aanvullen". Sponsor is nu expert, jij bent student. Wachten tot sponsor jou expliciet iets vraagt.
WAAROM: zodra jij blijft praten, ondermijn je de autoriteit van sponsor en wordt het weer een 1-op-1 gesprek.

STAP 4 — SPONSOR OPENT (sponsor doet dit, geef 'm dit script vooraf):
"Hé [prospect]! Wat leuk dat [teamlid] ons koppelt 🥰 Ik heb even gelezen wat er speelt — herkenbaar! Vertel eens, hoe lang speelt dit al en wat heb je tot nu toe geprobeerd?"
WAAROM: rapport bouwen vóór pitch, sponsor leert eerst over de prospect.

STAP 5 — FOLLOW-UP (jij naar prospect, apart, binnen 24u):
"Hé [naam] 😊 Wat sprak je het meeste aan van wat je tot nu toe gehoord hebt? 🥰"
NOOIT: "Wat vond je ervan?" → vraagt mening, zet prospect als beoordelaar.
WAAROM: focus op WAT positief was, opent de volgende exposure.

EDIFICATION — VANDAAG OPGEFRIST, DAG 18 GAAT JE EIGEN ZIN PERFECTIONEREN:
Voor een sterke 3-weg moet stap 2 ALTIJD een edifying zin bevatten over je sponsor. Op dag 18 schrijf je je eigen vaste edification-zin. Voor nu: gebruik een simpele "die al X jaar mensen helpt met Y, en degene die mij heeft geholpen met Z" — zelfs een eerste versie is veel sterker dan geen.

VEELGEMAAKTE FOUTEN:
✗ Geen aankondiging vooraf → prospect schrikt van groep met onbekende.
✗ Prospect en sponsor er gewoon in zetten zonder edification → sponsor moet bij nul beginnen.
✗ JIJ blijft meepraten na introductie → sponsor verliest autoriteit.
✗ Direct pitchen door sponsor → prospect voelt verkoop, haakt af.
✗ Geen follow-up na het groepje → 24u later momentum verloren.
✗ "Wat vond je ervan?" als follow-up → opent kritiek in plaats van interesse.

VANDAAG: lees de scripts in een prospect-kaart door, zodat je voor je eerstvolgende 3-weg precies weet wat je in welke stap stuurt. Geen improvisatie nodig.`,
    waaromWerktDit: {
      tekst:
        "Edificatie is geen overdrijving. Het is de waarheid vertellen over waarom de persoon gekwalificeerd is om te helpen.",
      bron: "Eric Worre",
    },
  },

  {
    nummer: 10,
    titel: "3-weg in de praktijk: minstens 1 deze week",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag10-3weg-1",
        label: "Start minstens 1 3-weg gesprek deze week (vandaag of morgen)",
        uitleg:
          "Heb je al 1 op dag 4 gedaan? Top, vandaag een tweede plannen. Nog niet? Start nu. Kies 1 warme prospect, stuur de aankondiging (stap 1 script), maak groepje met sponsor. Volg de 5 stappen.",
        verplicht: true,
      },
      {
        id: "dag10-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag10-followups-5",
        label: "5 follow-ups",
        verplicht: true,
      },
      {
        id: "dag10-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "3-weg scripts (alle 5 stappen klaar voor verzending)",
        menupad: "Menu → Namenlijst → klik prospect → 💬 3-weg gesprek scripts",
        route: "/namenlijst",
      },
      {
        actie: "Coach helpt bij een specifieke 3-weg-situatie",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
        prefillTemplate:
          "Help me met mijn 3-weg gesprek vandaag. Prospect: [naam], situatie: [wat speelt er]. Sponsor: [naam]. Welke variant van stap 2-introductie past en wat moet ik vooral NIET zelf doen?",
      },
      {
        actie: "Sponsor bellen als je vastzit",
        menupad: "Playbook FAB → Bel/app mijn sponsor",
        route: "/team",
      },
    ],
    watJeLeert: `Vandaag is GEEN theorie-dag, vandaag is een DOEN-dag. Gisteren leerde je de 5 stappen, vandaag start je je eerstvolgende 3-weg in de praktijk. De eerste 3-weg gaat onhandig voelen. Dat hóórt. De vijfde voelt natuurlijk. Alleen door te doen kom je daar.

DE KRITIEKE STAP — STAP 3, JIJ STAPT TERUG:
Dit is het stuk waar de meeste netwerkers struikelen. Na je introductie in het groepje (stap 2) moet je STIL ZIJN. Niet meepraten, niet aanvullen, niet "ja precies" sturen. Sponsor is nu expert, jij bent student. Je voelt de drang om te helpen, dat is normaal — maar elke keer dat jij praat, ondermijn je de autoriteit van sponsor.

Vuistregel: schrijf 50% minder berichten in het groepje dan je zin hebt om te schrijven. Vuist regel: alleen reageren als sponsor of prospect JOU expliciet aanspreekt. Anders: emoji's geven mag (👍🥰), tekstantwoorden geven mag NIET.

WAT JE VANDAAG CONCREET DOET:
1. Open je namenlijst en kies 1 warme prospect die nog geen 3-weg heeft gehad.
2. Stuur stap 1 (aankondiging) naar de prospect — uit ELEVA, dus geen typewerk.
3. Stuur sponsor het stap-2-introductie-script vooraf zodat hij/zij weet wat eraan komt.
4. Maak het WhatsApp-groepje aan, vier seconden later stuur je stap 2.
5. ZWIJG. Sponsor neemt over.
6. Binnen 24u: stap 5 (follow-up apart, niet in het groepje).

VEELGEMAAKTE FOUTEN OP DE EERSTE PAAR 3-WEGS:
✗ Aankondiging vergeten → groepje voelt als overval.
✗ Edification weglaten in stap 2 → sponsor moet zelf autoriteit opbouwen, kost tijd en effect.
✗ Tijdens stap 3 toch meepraten ("ja Sara, dat is wat ik ook ervaarde!") → sponsor wordt naar achter geduwd.
✗ Direct na stap 4 al verwachten dat prospect "ja" zegt → 3-weg is een EXPOSURE, niet een sluitmoment.
✗ Geen stap 5 (24u follow-up apart) → momentum verdwijnt, prospect blijft hangen.

NA AFLOOP — 5 MIN MET JE SPONSOR DEBRIEFEN:
Wat ging goed? Wat schuurde? Welke vraag van prospect zat sponsor mee? Volgende keer doen we wat anders? Dat is hoe je 3-weg-vaardigheid in 5-10 gesprekken naar tweede natuur bouwt.

Doel deze week: minimaal 1 3-weg starten. Heb je 'm op dag 4 al gehad? Top, plan vandaag een tweede. Nog geen? Vandaag is jouw moment.`,
    waaromWerktDit: {
      tekst:
        "Je eerste 3-weg gaat onhandig voelen. Dat hóórt. De vijfde voelt natuurlijk. Alleen door te doen kom je daar.",
      bron: "Fraser Brookes",
    },
  },

  {
    nummer: 11,
    titel: "One-pager vs presentatie: wat bied je wanneer aan?",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag11-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag11-followups-5",
        label: "5 follow-ups",
        verplicht: true,
      },
      {
        id: "dag11-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag11-lees-flow",
        label: "Lees module 'Pipeline-flow' in onboarding",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "Pipeline-weergave: zie wie waar zit",
        menupad: "Menu → Namenlijst → Weergave: Pipeline",
        route: "/namenlijst",
      },
      {
        actie: "Coach helpt met de overgang naar presentatie",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Hoe zet ik [naam] van one-pager naar presentatie?",
        route: "/coach",
        prefillTemplate:
          "Hoe zet ik [naam] van one-pager naar presentatie? Achtergrond: [bv. heeft de PDF bekeken, vroeg specifieke vraag over X]. Geef me een korte tussenstap-tekst.",
      },
    ],
    watJeLeert: `Niet iedere prospect krijgt dezelfde info. Een one-pager geef je aan iemand die nog koud-tot-lauw is. Een presentatie aan iemand die al opgewarmd is. Verkeerde volgorde = 80% afhakers, simpelweg omdat je te veel verlangt voor het vertrouwen er is.

DE TWEE TOOLS — wanneer wat:

ONE-PAGER (laagdrempelig, 5-10 min):
• Korte PDF, 1-2 minuten filmpje, of een snelle infographic
• Geef je bij: koud / lauw, kennis-niveau onbekend, weinig tijd voor je gesprek
• Doel: prospect zegt "interessant, vertel me meer" of "nee, niet voor mij"
• Laagdrempelig: geen agenda nodig, geen grote tijdscommitment
• Voor 80% van je eerste exposures genoeg

PRESENTATIE (diepgaand, 20-40 min):
• Volledige uitleg: business + producten + verdienmodel + community + verhaal sponsor
• Geef je aan: warme prospects, mensen die ja zeiden op een one-pager, of mensen waarmee je een 3-weg al hebt gehad
• Doel: prospect kan een echte beslissing nemen (member / shopper / not-yet)
• Vereist commitment: tijd vrijmaken, sponsor erbij, gesprek aangaan
• Voor 20% van je prospects, maar daar gebeurt 80% van de echte beweging

DE GOUDEN REGEL — NIEMAND SLAAT EEN STAP OVER:
Verleiding nr 1: een warme oude vriend meteen een hele presentatie geven, "want hij zal het wel snappen". Resultaat? Hij wordt overspoeld, raakt verward, zegt "geef me een paar dagen om na te denken" — en je hoort 'm nooit meer.

Verleiding nr 2: aan iemand die al twee weken vol enthousiasme reageert nóg eens "even een one-pager" geven. Resultaat? Frustratie, verlies van momentum.

Wat WEL: pipeline volgen. Iedereen → one-pager → presentatie/3-weg → beslissing. Geen sprongen, geen omleidingen.

CONCREET — HERKENNINGSPATRONEN:
Stuur ONE-PAGER als prospect zegt:
• "Vertel eens wat het is."
• "Wat doe je eigenlijk?"
• "Klinkt interessant, stuur maar door."

Stuur PRESENTATIE / start 3-weg als prospect zegt:
• "Ik wil hier echt meer van weten."
• "Hoe verdien je hier dan aan?"
• "Wat zou ik dan moeten doen?"
• "Past dit bij wat ik nu al doe?"

DE TUSSENSTAP-ZIN — als one-pager bekeken is:
"Top dat je het bekeken hebt 🥰 Wat sprak je het meeste aan? — Daar kan mijn mentor [naam] perfect bij helpen, ze doet dit al [periode] en heeft veel mensen verder geholpen. Zal ik even een groepje aanmaken?"

VEELGEMAAKTE FOUTEN:
✗ Telefoongesprek met "snelle samenvatting" geven → werkt nooit, je verkoopt jezelf in plaats van het systeem.
✗ Te vroeg presentatie aanbieden bij iemand die nog "even kijkt" → opjagen.
✗ Te lang op one-pager-fase blijven hangen → prospect verliest interesse, escalatie nodig.
✗ Pipeline niet bijwerken in ELEVA → je vergeet wie waar zit, mensen vallen door de mand.

KIJK VANDAAG NAAR JE PIPELINE: hoeveel mensen op "Uitgenodigd"? Hoeveel op "One-pager"? Hoeveel op "Presentatie"? Waar zit de bottleneck — daar is je werk.`,
    waaromWerktDit: {
      tekst:
        "De presentatie bereikt alleen zijn volle kracht als het fundament eronder klopt.",
      bron: "Eric Worre, principe van progressie",
    },
  },

  {
    nummer: 12,
    titel: "Nee tegen business? Dan de product-pivot",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag12-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag12-followups-5",
        label: "5 follow-ups",
        verplicht: true,
      },
      {
        id: "dag12-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag12-pivot-1",
        label:
          "Als iemand 'nee' zei op business: probeer een product-pivot vandaag",
        uitleg:
          "Maak via de coach een pivot-bericht: 'Helemaal goed, geen probleem. Ken je iemand die last heeft van X? Of wil je het zelf eens een maand proberen?' Zet ze dan op pipeline-fase Shopper.",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "Coach schrijft een product-pivot bericht",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Geef me een product-pivot bericht voor [naam]",
        route: "/coach",
        prefillTemplate:
          "Geef me een product-pivot bericht voor [naam]. Achtergrond: [klacht/wens van prospect, bv. moeheid / darmen / overgang / stress / sport]. Hij/zij zei nee op de business-kant. Schrijf een korte, warme pivot zonder druk.",
      },
      {
        actie: "Prospect op 'Shopper' zetten in pipeline",
        menupad: "Menu → Namenlijst → prospect → Pipeline-fase → Shopper",
        route: "/namenlijst",
      },
      {
        actie: "Herinnering over 21 dagen aanmaken",
        menupad: "Prospectkaart → + Herinnering → +21 dagen",
        route: "/herinneringen",
      },
    ],
    watJeLeert: `Een "nee" op de business-kant is geen einde. Het is een AFSLAG. De prospect zegt niet "ik wil niets met jou", hij/zij zegt "het opbouwen-deel past nu niet bij mij". Dat is een ander gesprek. En vaak is er nog steeds een opening: de PRODUCT-kant.

WAAROM PRODUCT-PIVOT WERKT:
• Lifeplus-producten zijn op zichzelf staande gezondheidsoplossingen — geen "verkooptrucs voor de bonus".
• Een Shopper die de producten 3-6 maanden gebruikt, heeft tijd om resultaten te ervaren ZONDER businessdruk.
• Veel Shoppers worden 6-12 maanden later alsnog member, niet omdat je ze opnieuw "pitch" maar omdat ze van binnenuit hebben gezien dat het werkt — en dan komen ze meestal zelf terug.
• Bonus: Shoppers vertellen vaak vrienden over de producten zonder dat jij iets hoeft te doen → indirecte uitnodigingen.

DE PIVOT-FORMULE — drie stappen, in deze volgorde:

1) ERKEN ZONDER DRUK:
"Helemaal goed dat dit niet bij je past, geen probleem 🥰. Iedereen heeft z'n eigen pad."
GEEN "ja maar..." of "weet je wel zeker..." — dat klinkt als drammen.

2) HAAK NAAR GEZONDHEID/ENERGIE:
"Trouwens, want we hadden het er ooit over — hoe gaat het bij jou met [klacht/wens]?"
Of als je de klacht niet kent: "Maar wil ik nog wat anders vragen — hoe gaat het bij je qua [energie / slaap / gezondheid / sport]?"

3) STEL DE PRODUCT-MOGELIJKHEID VOOR:
"Er zijn een paar producten die we gebruiken die hier echt verschil mee maken. Wil je het eens een maand proberen, vrijblijvend, en kijken hoe je je voelt? Geen verplichting."

DRIE VOORBEELDEN — VERSCHILLENDE KLACHTEN:

1. Energie / slaap:
"Helemaal goed dat de business-kant niet past, dat snap ik. Maar ik wilde nog vragen: hoe gaat het bij jou met energie en slaap? We hebben hier een product (Daily BioBasics + OmeGold) waar mensen super tevreden over zijn. Wil je het 'n maand proberen? Geen druk, gewoon ervaren."

2. Darmen:
"Top dat je eerlijk bent over de business 👍🏽. Andere vraag: vorig jaar zei je iets over darmen die je laten merken — speelt dat nog? Er is een 'Darmen in Balans'-pakket dat veel mensen hier echt heeft geholpen. Lust je daar wel info over?"

3. Sport / herstel:
"Geen probleem dat je nu niet de business-kant ziet 🥰. Je sportte toch nog steeds intensief? Er zijn een paar producten (Be Refueled, MSM Plus) die ik zelf gebruik en die echt verschil maken in herstel. Wil je een keer info?"

VEELGEMAAKTE FOUTEN:
✗ Direct na "nee op business" pitchen op product → te abrupt, voelt manipulatief.
✗ De pivot vergeten en gewoon afsluiten → je verliest een Shopper-kandidaat.
✗ Druk leggen na de pivot ("wil je 't echt niet proberen?") → break van vertrouwen.
✗ Geen herinnering aanmaken voor +21 dagen → 3 weken later weet je niet meer dat hij Shopper-kandidaat was.
✗ Tegen Shopper de business pas weer aankaarten → laat het BIJ ZICHZELF komen, niet jij weer met de pitch.

WAT JE VANDAAG DOET:
1. Heb je iemand die deze week "nee" zei op business? Stuur een pivot-bericht (Coach helpt).
2. Pas de pipeline-fase aan in ELEVA: Shopper.
3. Maak een herinnering aan voor +21 dagen: "[naam] — hoe bevallen de producten?"
4. Stop de business-vraag voor minstens 3 maanden — laat ze het ervaren.

EXTRA WAARDE: zeg nee tegen drammen, ja tegen warmte. Een Shopper die jou over een jaar terugbelt is zilver. Een Shopper die je nu hebt overlast en wegjaagt is verlies.`,
    waaromWerktDit: {
      tekst:
        "Nee nu is geen nee voor altijd. Blijf warm, blijf in hun leven, wees waardevol. Dan ben je de eerste die ze bellen als de situatie verandert.",
      bron: "Worre + Brookes, samen",
    },
  },

  {
    nummer: 13,
    titel: "FORM: hoe leer je iemand écht kennen in 5 minuten?",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag13-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag13-followups-5",
        label: "5 follow-ups",
        verplicht: true,
      },
      {
        id: "dag13-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag13-form-1",
        label: "Gebruik FORM bewust in minstens 1 gesprek vandaag",
        uitleg:
          "Family, Occupation, Recreation, Money. Stel in elk gesprek 1 vraag uit elke categorie en luister naar 'haken' (pijnpunten, wensen).",
        verplicht: true,
      },
      {
        id: "dag13-koud-warm",
        label: "1 koude prospect warm maken vóór de invite",
        uitleg:
          "Kies iemand uit je telefoonlijst met wie je weinig contact hebt. Eerst even een FORM-vraag (zonder pitch), reageer 1-2 dagen op hun socials, dán pas invite. Vraag de Mentor: 'Help me [naam] warm maken vóór ik 'm uitnodig, context: [situatie]'. De Mentor schrijft een opwarm-tekst die geen pitch is.",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "Coach helpt met FORM-vragen voor jouw situatie",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Leg FORM uit en geef voorbeelden",
        route: "/coach",
        prefillTemplate:
          "Geef me 3 FORM-vragen die ik kan stellen aan [naam], context: [bv. oud-collega, druk gezin, ondernemer]. Welke 'haken' moet ik daarbij in zijn antwoord proberen op te pikken?",
      },
      {
        actie: "Koude prospect warm maken (Mentor)",
        menupad: "Menu → ELEVA Mentor",
        spraak:
          "Help me [naam] warm maken vóór ik 'm uitnodig, context: [situatie]",
        route: "/coach",
        prefillTemplate:
          "Help me [naam] warm maken vóór ik 'm uitnodig. Context: [situatie / hoe ken je hem-haar / wanneer laatst contact]. Schrijf een opwarm-bericht zonder pitch.",
      },
      {
        actie: "Gesprek-notities vastleggen",
        menupad: "Prospectkaart → Contact toevoegen → Notities",
        route: "/namenlijst",
      },
    ],
    watJeLeert: `FORM is dé manier om in elk gesprek rapport te bouwen zonder dat het een verhoor wordt. Vier categorieën, één voor één gesteld als oprechte interesse — niet als checklist. Brookes-techniek, 60+ jaar bewezen.

FORM = FAMILY · OCCUPATION · RECREATION · MONEY

F — FAMILY: "Wie hoort er bij jou? Hoe gaat het thuis?"
Voorbeelden: "Hoe oud zijn de kinderen nu?", "Hoe gaat het met je partner?", "Heb je nog familie in Nederland?"
WAT JE LUISTERT VOOR: drukke gezinsroutine, zorgen om kinderen, ouders die ouder worden, gezondheidszorgen in familie.

O — OCCUPATION: "Wat doe je nu, en hoe bevalt het?"
Voorbeelden: "Hoe is het werk de laatste tijd?", "Wat zou je veranderen als je kon?", "Heb je nog plezier in wat je doet?"
WAT JE LUISTERT VOOR: vermoeidheid, frustratie, verlangen naar iets anders, financiële druk, geen vrijheid.

R — RECREATION: "Wat doe je graag, waar krijg je energie van?"
Voorbeelden: "Sport je nog?", "Wat doe je in het weekend?", "Wat doe je voor jezelf?"
WAT JE LUISTERT VOOR: gezondheidsambitie, gemis van tijd voor zichzelf, verlangen om weer te beginnen met X.

M — MONEY: "Hoe tevreden ben je met de financiële kant?"
Voorbeelden: "Loopt het financieel zoals je wilt?", "Was er iets dat je extra zou willen kunnen?", "Werkt je salaris/inkomen mee?"
NB: M is gevoelig — alleen na vertrouwen, never als eerste. Soms helemaal overslaan en vervangen door "hoe ziet je toekomst eruit?"
WAT JE LUISTERT VOOR: schulden, geen extra ruimte, kan geen vakantie meer, "als ik meer had..."

DE GOUDEN REGEL — JIJ PRAAT 30%, ZIJ 70%:
Mensen praten graag over zichzelf als ze voelen dat je écht luistert. Stel je vraag, wacht het antwoord af, vraag DOOR ("vertel eens meer..."), maak NOTIE. Pas als je echt rapport hebt en iemand een "haak" laat vallen, mag je een tussenstap richting uitnodiging maken.

DE HAKEN — luister actief naar deze zinnen:
• "Ik zou willen dat..."
• "Ik mis nog..."
• "Als ik meer tijd/geld had..."
• "Het is wel veel hoor..."
• "Ik weet niet of dit nog kan blijven zo..."
• "Ja, weet je, ik ben er klaar mee."
DAAR zit je opening. Niet eerder.

KOUD NAAR WARM — het echte werk in dit vak:
Niet iedereen op je lijst is direct warm genoeg voor een uitnodiging. Koude contacten warm je eerst op:
1. Reageer 2-3 keer waardevol op hun socials (oprechte reactie, geen "leuk!" maar iets persoonlijks).
2. Stuur een DM met een FORM-vraag, GEEN pitch. "Wat ben je tegenwoordig allemaal aan het doen?"
3. Wees 1-2 weken zichtbaar in hun leven (likes, reacties, een chat over iets niet-business).
4. PAS DAN de uitnodiging, met de 4-stappen-formule (dag 4).

VEELGEMAAKTE FOUTEN:
✗ FORM-vragen stellen om bij M (Money) uit te komen → voelt geforceerd, prospect ruikt het.
✗ Te snel bij Money beginnen → ongemak, vertrouwen weg.
✗ Niet luisteren naar de antwoorden, alleen wachten tot je je vraag kan stellen → geen rapport.
✗ Direct na een "haak" doorpitchen → laat een 30-60 sec stilte vallen, dan zacht doorvragen.
✗ Geen notities maken in ELEVA na het gesprek → 2 weken later weet je niet meer wat hij/zij zei.

VANDAAG: kies 1 specifieke prospect, plan een 5-min check-in (DM of telefoon) en pas FORM bewust toe. Schrijf na afloop 3 dingen op in de notities. Daar bouw je later mee.`,
    waaromWerktDit: {
      tekst:
        "Mensen kopen geen producten of opportunities. Ze kopen oplossingen voor wat ze voelen.",
      bron: "Fraser Brookes, 3 minutes on recruiting",
    },
  },

  {
    nummer: 14,
    titel: "Week 2 review: welk patroon zie je?",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag14-review",
        label: "Wekelijkse review invullen",
        verplicht: true,
      },
      {
        id: "dag14-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag14-followups-5",
        label: "5 follow-ups",
        verplicht: true,
      },
      {
        id: "dag14-pipeline-check",
        label: "Bekijk je hele pipeline: wie zit waar?",
        uitleg:
          "Open namenlijst in pipeline-weergave. Hoeveel in 'Uitgenodigd', 'One-pager', 'Presentatie'? Waar stokt het?",
        verplicht: true,
      },
      {
        id: "dag14-sponsor-call",
        label: "Sponsor-call 15 min: fase 3 voorbereiden",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 2 afgerond. Hoeveel presentatie-momenten staan er in je agenda? Pakken we in fase 3 door, follow-up wordt leidend.",
    waarInEleva: [
      {
        actie: "Wekelijkse review",
        menupad: "Dashboard → widget 'Wekelijkse review'",
        route: "/dashboard",
      },
      {
        actie: "Pipeline-view: zie waar je bottleneck zit",
        menupad: "Menu → Namenlijst → Weergave: Pipeline",
        route: "/namenlijst",
      },
      {
        actie: "Coach helpt patronen herkennen",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
        prefillTemplate:
          "Ik zit in de week 2 review van mijn 60-dagen run. Mijn pipeline: [aantal in uitgenodigd / one-pager / presentatie / shopper / member]. Waar zit mijn bottleneck en wat moet ik volgende week oefenen?",
      },
    ],
    watJeLeert: `Na 2 weken zie je PATRONEN. Niet alleen "deed ik m'n aantallen?", maar: welke berichten kregen reactie? welke mensen klikten af? waar liep ik vast? De pipeline-weergave is je röntgen-foto: hij toont waar prospects stoppen.

DE BOTTLENECK-REGEL — kijk waar de meeste prospects "vastliggen":

Veel op UITGENODIGD (ze reageren niet of zeggen direct nee):
→ Probleem zit in de UITNODIGING zelf. Vandaag 4-stappen herzien (dag 4). Mentor: "schrijf een uitnodiging variant voor [type prospect]" — leer 3 verschillende stijlen.

Veel op ONE-PAGER (bekeken, geen reactie meer):
→ Probleem zit in de FOLLOW-UP. Te lang stil, of te direct doorvragen. Vandaag dag 6 reviseren — de 5-fasen follow-up.

Veel op PRESENTATIE / 3-WEG (kijken wel maar nemen geen beslissing):
→ Probleem zit in het CLOSING-werk. Doel-Tijd-Termijn (dag 17) is wat dat oplost.

Stok je nergens en is alles beweging maar geen "ja's"?
→ Volume is OK, conversie is werk. Vraag sponsor om mee te kijken naar 2-3 specifieke gesprekken.

DE 3 GROOTSTE INZICHTEN UIT WEEK 1+2 — schrijf op:
1. Welk type prospect reageert het beste? (warm/lauw/koud, leeftijd, geslacht, situatie)
2. Welke openingszin werkt het sterkst voor JOU?
3. Welke fase van je pipeline is het dunst — daar gaat fase 3 over.

WAT GA JE VOLGENDE WEEK ZIEN (sneak peek voor dag 15-21):
• Follow-up wordt je hoofdwerk (dag 15)
• De 5 types prospects herkennen (dag 16)
• Closing met Doel-Tijd-Termijn (dag 17)
• Edification perfectioneren (dag 18)
• Pipeline-review + beslissingen vragen (dag 19-20)

VAN HIER UIT IS HET KILOMETER-WERK. Geen nieuwe technieken meer, alleen oefenen wat je hebt geleerd in echte gesprekken.`,
    waaromWerktDit: {
      tekst:
        "Je bent nooit zo goed of slecht als je denkt. Je statistieken zijn eerlijker dan je gevoel.",
      bron: "Eric Worre, Go Pro",
    },
  },

  // ============================================================
  // FASE 3 — RITME (dag 15-21)
  // ============================================================
  {
    nummer: 15,
    titel: "Ritme: follow-up wordt je werk",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag15-followups-10",
        label: "10 follow-ups, het is follow-up-week",
        uitleg:
          "Iedereen die je in week 1-2 hebt uitgenodigd maar nog geen beslissing heeft genomen = follow-up. Niet drammen, wel aanwezig zijn.",
        verplicht: true,
      },
      {
        id: "dag15-invites-10",
        label: "10 nieuwe uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag15-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Follow-up lijst (alle open herinneringen)",
        menupad: "Menu → Herinneringen → Alle open",
        route: "/herinneringen",
      },
      {
        actie: "Coach schrijft een follow-up voor jou",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Schrijf een follow-up voor [naam] die [situatie]",
        route: "/coach",
        prefillTemplate:
          "Schrijf een follow-up voor [naam] die [situatie, bv. 5 dagen geleden de info heeft gekregen / 3-weg gehad maar geen reactie / aarzelt op tijd]. Houd het kort en warm, geen druk.",
      },
      {
        actie: "Follow-up-scripts",
        menupad: "Menu → Scripts → Follow-up",
        route: "/scripts",
      },
    ],
    watJeLeert: `Follow-up is geen aanhangsel van het werk, follow-up IS het werk. 80% van alle "ja's" komen pas op contactmoment 3 t/m 5 — niet op het eerste. Vanaf vandaag schuift je gewicht: minder nieuwe uitnodigingen, meer mensen warm houden die al uitgenodigd zijn.

DE STATISTIEK — waarom dit klopt:
• Op contact 1 ("ik heb de info bekeken") nemen weinig mensen al een beslissing.
• Op contact 2-3 (paar dagen later, kort doorgevraagd) zegt ~30% iets concreets.
• Op contact 4-5 (na 1-2 weken) komt de meerderheid van de definitieve "ja" of "nee".
Wie alleen contact 1 heeft, verliest dus 70% van zijn echte beslissingen.

DE GOLD QUESTION — werkt op vrijwel iedereen:
"Hoe kijk je er nu naar, na een paar dagen?"
• Open vraag (geen ja/nee)
• Geen beoordeling ("vond je het goed?" → opent kritiek)
• Geen druk ("heb je al beslist?" → forceer)
• Zacht maar serieus — toont dat je nog meelevend bent zonder te jagen

10 FOLLOW-UPS IN 30 MIN — werkwijze vandaag:
1. Open je Herinneringen-lijst, sorteer op vervaldatum.
2. Per persoon: kijk waar ze in de pipeline staan (Uitgenodigd / One-pager / Presentatie / Shopper / Not-yet).
3. Stuur het juiste fase-bericht (zie dag 6 voor de 5-fasen flow).
4. Niet langer dan 1-2 minuten per persoon — als je niet weet wat te schrijven, vraag de Coach.
5. Update herinnering: nieuwe vervaldatum (3-7 dagen verder) of vink af.

WAT NIET WERKT:
✗ "Heb je al nagedacht?" → te direct, prospect voelt zich beoordeeld.
✗ "Wat vond je ervan?" → vraagt mening, opent kritiek.
✗ Na 1 keer geen reactie afschrijven → 80% komt pas later.
✗ 10 follow-ups in dezelfde toon → varieer per fase, niet 10x dezelfde standaardzin.
✗ Drammen na een nee → break van vertrouwen, zelfs als beleefd geformuleerd.

WAT WEL WERKT:
✓ Verschillende exposures: testimonial sturen, een nieuwe video, een persoonlijk verhaal.
✓ Korte momenten: "even een berichtje, ik dacht aan je."
✓ Vragen wat hem WEL aansprak — dan focus op dat.
✓ Een tussenstap aanbieden: "wil je een keer met mijn mentor in een groepje praten?"
✓ Eerlijk zijn over je eigen positie: "ik weet niet of dit voor jou past, ben benieuwd waar jij staat."

DE LANGSPEELPLATEN-REGEL HERHAALD:
Een nee NU is geen nee voor altijd. Iemand op "Not-yet" zetten is geen verlies. Houd ze warm, blijf zichtbaar in hun leven via gewone content, en ze komen vaak 6-12 maanden later alsnog terug — meestal zelf, met een vraag.`,
    waaromWerktDit: {
      tekst:
        "De fortuin zit in de follow-up. Eerste contact plant het zaadje. Follow-up water geeft.",
      bron: "Jim Rohn, vrij vertaald",
    },
  },

  {
    nummer: 16,
    titel: "De 5 types prospects: snap wie je voor je hebt",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag16-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag16-followups-10",
        label: "10 follow-ups",
        verplicht: true,
      },
      {
        id: "dag16-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag16-categoriseer",
        label: "Categoriseer je top-20 prospects in de 5 types",
        uitleg:
          "Actief zoekend, open, productkoper, niet-nu, nooit. Dit bepaalt hoeveel energie je ergens aan besteedt.",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Pipeline labels aanpassen per prospect",
        menupad: "Menu → Namenlijst → prospect → Pipeline-fase",
        route: "/namenlijst",
      },
      {
        actie: "Coach helpt bij type-bepaling van een specifieke prospect",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Welk type prospect is [naam]?",
        route: "/coach",
        prefillTemplate:
          "Welk type prospect is [naam]? Wat ik weet: [hun reactie tot nu toe / interesse-signalen / bezwaren]. Welke van de 5 types past en hoe pak ik dat aan?",
      },
    ],
    watJeLeert: `Niet elke prospect is gelijk. Wie iedereen op dezelfde manier benadert, raakt uitgeput op de mensen die nooit gaan ja zeggen, en mist de mensen die WEL klaar zijn — omdat hij dezelfde lauwe energie geeft. De 5 types helpen je je energie goed verdelen.

DE 5 TYPES (Worre-classificatie):

1) ACTIEF ZOEKEND — DIRECT PRESENTEREN
Wie: mensen die NU op zoek zijn naar iets nieuws (verloren werk, scheiding, kind geboren, business gestopt, gezondheidsschrik).
Signalen: "Ik zoek al een tijdje naar iets...", "Ik wilde net beginnen met...", "Wat doe jij eigenlijk?"
Aanpak: GEEN tijd verspillen aan rapport-bouwen. Direct presentatie of 3-weg, vandaag liefst. Hun moment is NU.
Energie: HOOG.

2) OPEN — INVESTEER TIJD
Wie: mensen die niet actief zoeken maar wél nieuwsgierig zijn als jij iets brengt.
Signalen: vragen door, willen meer weten, blijven in contact zonder dat jij stuwt.
Aanpak: rapport bouwen, FORM-vragen stellen, langzaam exposeren. 3-5 contactmomenten. Ze nemen een echte beslissing als ze klaar zijn.
Energie: HOOG (groei).

3) PRODUCTKOPER — SHOPPER-FLOW
Wie: geen business-interesse, maar wel openstaan voor product-ervaring.
Signalen: "De business is niets voor mij, maar dat product klinkt wel interessant."
Aanpak: pivot naar product (zie dag 12). Zet ze op Shopper, herinnering +21 dagen. Soms worden ze 6-12 maanden later alsnog member.
Energie: GEMIDDELD (lange termijn).

4) NIET-NU — TIMING KLOPT NIET, WARM HOUDEN
Wie: interesse aanwezig, maar leven zit nu in iets anders (verhuizing, ziekte familie, vaste baan-wissel).
Signalen: "Klinkt mooi, maar nu is niet het juiste moment voor mij."
Aanpak: erkennen, GEEN drang, herinnering +3 maanden. Houd warm contact via gewone communicatie (niet pitchen).
Energie: LAAG (onderhoud).

5) NOOIT — ERKEN EN LAAT LOS
Wie: principiële nee. Soms uit ervaring met netwerkmarketing, soms uit waardenkeuze.
Signalen: stevige nee zonder twijfel, soms agressief, soms beleefd-maar-definitief.
Aanpak: ERKEN warm ("ik snap dat 100%"), LAAT LOS, hou de relatie als vriend/familie. Stop met dit als business-prospect te zien. Energie nul, warmte 100%.
Energie: NUL — voor business. WARMTE-RELATIE: 100%.

DE GROOTSTE FOUT — TYPE 5 BEHANDELEN ALS TYPE 2:
Veel starters blijven hopen op die ene oude vriend die "echt ooit ja gaat zeggen". Hij is type 5. Die uren die je in hem stopt, gaan ten koste van je écht-actief-zoekende prospects. Erken het. Hou hem als persoon. Stop hem als prospect.

ANDERE GROTE FOUT — TYPE 1 BEHANDELEN ALS TYPE 4:
"Ach, hij heeft het druk, ik laat 'm even." Hij is ACTIEF ZOEKEND. Hij gaat starten — bij iemand. Als jij wacht, is dat iemand anders. Reageer SNEL op type 1.

VANDAAG — categoriseer je top-20:
1. Open je namenlijst, pak je top-20 actieve prospects.
2. Per persoon: welk type? Voel het, pas evt. de pipeline-fase aan.
3. Energie-budget volgende week: 70% naar type 1+2, 20% naar type 3, 10% naar type 4. Type 5 = warmte-onderhoud, geen tijd.
4. Onthoud: types kunnen verschuiven. Type 4 kan over 3 maanden type 1 worden — daarom warm houden, niet afschrijven.`,
    waaromWerktDit: {
      tekst:
        "Je gaat nooit iemand overtuigen die niet wil. Je gaat mensen vinden die al op zoek zijn.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 17,
    titel: "Closing: Doel-Tijd-Termijn",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag17-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag17-followups-10",
        label: "10 follow-ups",
        verplicht: true,
      },
      {
        id: "dag17-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag17-closing",
        label: "Pas Doel-Tijd-Termijn toe bij minstens 1 warme prospect",
        uitleg:
          "Bij iemand die een presentatie heeft gezien en twijfelt: stel de 5 closing-vragen. Dit is niet drammen, dit is helpen beslissen.",
        verplicht: false,
      },
      {
        id: "dag17-eigen-closing-zin",
        label: "Schrijf jouw eigen openings-closing-zin",
        uitleg:
          "Eén vaste zin waarmee jij Doel-Tijd-Termijn introduceert in een gesprek. Permanent terug te vinden op /mijn-zinnen.",
        verplicht: false,
        inlineActie: {
          type: "tekst",
          slug: "closing-openingszin",
          label: "Mijn closing-openingszin",
          instructie:
            "Een natuurlijke aanloop naar de 5 closing-vragen. Niet pushy, wel duidelijk. Stel het zo voor als 'helpen beslissen'.",
          placeholder:
            "Bv. Mag ik je een paar korte vragen stellen om te kijken of dit voor jou realistisch is?",
          maxTekens: 280,
          voorbeeld:
            "Mag ik je 5 korte vragen stellen om te kijken of dit voor jou realistisch is qua tijd en doelen? Geen druk — gewoon eerlijk samen kijken.",
        },
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Coach helpt met closing voor specifieke prospect",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Help me met closing voor [naam]",
        route: "/coach",
        prefillTemplate:
          "Help me met closing voor [naam]. Wat ik weet: [hun doel / hun bezwaren / fase in pipeline]. Begeleid me door Doel-Tijd-Termijn — wat zeg ik woord voor woord?",
      },
      {
        actie: "Closing-scripts",
        menupad: "Menu → Scripts → Sluiting",
        route: "/scripts",
      },
      {
        actie: "Mijn opgeslagen closing-zin",
        menupad: "Menu → Mijn zinnen",
        route: "/mijn-zinnen",
      },
    ],
    watJeLeert: `Closing is GEEN overtuigen. Closing is HELPEN BESLISSEN. Een prospect heeft vaak alle info al, maar zit vast in twijfel. Goede closing tilt 'm uit de twijfel zonder druk — door zijn eigen motivatie te laten uitspreken in plaats van die van jou.

DE METHODE — DOEL-TIJD-TERMIJN, 5 VRAGEN IN DEZE VOLGORDE:

VRAAG 1 — DOEL:
"Hoeveel euro per maand extra zou dit de moeite waard maken voor jou?"
Hier komen ze met een bedrag — 500, 1000, 2500. Dat is HUN motivatie, niet de jouwe.
Niet: "Wat zou je willen verdienen?" → te abstract, krijg je vaak "weet ik niet".

VRAAG 2 — TIJD:
"Hoeveel uur per week heb je daar realistisch voor?"
Realistisch is hier het sleutelwoord. Niet "ideaal". Iemand met 3 kinderen en een baan kan niet 20u inzetten — dat moet hij/zij zelf benoemen.

VRAAG 3 — TERMIJN:
"Na hoeveel maanden moet dat bedrag er staan?"
Dit creëert urgentie en realisme tegelijk. 3 maanden is meestal te kort, 24 maanden te lang. Reactie van prospect zelf vertelt je waar 'ie zit.

VRAAG 4 — VERBINDING:
"Als ik je kan laten zien dat dat realistisch is binnen die uren en termijn, wil je dat dan serieus bekijken?"
Met deze vraag commiteer je hem aan een vervolgstap, NIET aan een aankoop. "Serieus bekijken" is laagdrempelig.

VRAAG 5 — START:
"Als dat klopt en goed voelt, starten we dan gewoon?"
"Gewoon" is hier cruciaal. Het maakt het beginnen kleiner dan het in zijn hoofd voelt.

DE KRACHT — MOTIVATIE KOMT VAN HEN, NIET VAN JOU:
Je bent geen drammer, je bent een SPIEGEL. Hun antwoorden op vraag 1-3 zijn een blauwdruk van wat ZIJ willen. Bij vraag 4-5 hoef je niet te overtuigen — je toont alleen een pad terug naar wat ze net zelf zeiden te willen.

DRIE VOORBEELDEN — VERSCHILLENDE PROSPECTS:

1. Drukke moeder die uitgeput werk heeft:
"Mag ik je 5 korte vragen stellen? — Hoeveel extra per maand zou dit voor jou de moeite waard maken? — Hoeveel uur naast je werk en gezin heb je realistisch? — Na hoeveel maanden moet dit er financieel staan zodat het voelt dat het werkt? — Als ik je een plan kan laten zien dat past binnen jouw 5 uur per week en jouw 12-maanden-horizon, wil je daar serieus naar kijken? — Als dat klopt en goed voelt: starten we dan?"

2. Ondernemer die naar diversificatie zoekt:
"Mag ik kort een paar vragen stellen om te kijken of dit past? — Wat zou een nieuw inkomstenpad jou per maand moeten opleveren om het de moeite waard te maken? — Hoeveel uur kun je daar realistisch insteken naast wat je nu doet? — In hoeveel maanden moet dat staan? — Als ik je iets concreets kan laten zien dat past binnen die uren en termijn, wil je dat doornemen? — En als dat klopt: starten we?"

3. Lauwe prospect die nog niets heeft beslist:
"Voor we verder gaan: mag ik 5 vragen stellen om dit goed in jouw situatie te plaatsen? Geen druk — gewoon kijken of het past. — Welk maandbedrag zou dit de moeite waard maken? — Hoeveel uur is realistisch? — Welke termijn? — Als wat ik laat zien past binnen die drie, wil je het serieus bekijken? — Als het goed voelt: starten?"

VEELGEMAAKTE FOUTEN:
✗ Direct vraag 4-5 stellen zonder eerst 1-3 → er is geen motivatie van hen om naar terug te grijpen.
✗ Eigen mening insteken bij vraag 2-3 ("dat is misschien wat te weinig...") → ze haken af, het wordt jouw advies in plaats van hun keus.
✗ De volgorde omgooien → werkt niet, de psychologie zit in deze opbouw.
✗ Bij vraag 5 hangen op "starten?" zonder te wachten op antwoord → laat de stilte vallen, dat is goud.
✗ Direct na een aarzeling weer doorpitchen → vraag liever: "wat is het belangrijkste punt om helder te krijgen?"

VANDAAG: probeer Doel-Tijd-Termijn vandaag of morgen bij minstens 1 warme prospect die al een presentatie heeft gehad. Schrijf je eigen vaste openingszin op (inline-actie), bewaar 'm permanent in /mijn-zinnen.`,
    waaromWerktDit: {
      tekst:
        "Closing is niet overtuigen, closing is helpen beslissen. Grote verschil.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 18,
    titel: "Edification: de zin die je sponsor laat schitteren",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag18-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag18-followups-10",
        label: "10 follow-ups",
        verplicht: true,
      },
      {
        id: "dag18-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag18-edification-zin",
        label: "Schrijf jouw eigen edification-zin (5 min)",
        uitleg:
          "Eén vaste zin van max 25 woorden waarmee je je sponsor introduceert in elk 3-weg of bij elke presentatie. Schrijf 'm hieronder direct in — bewaard onder /mijn-zinnen zodat je hem altijd snel kan oppakken.",
        verplicht: true,
        inlineActie: {
          type: "tekst",
          slug: "edification-zin",
          label: "Mijn edification-zin",
          instructie:
            "Volg de formule: 1) wie introduceer je, 2) wat is hun track-record / autoriteit, 3) waarom heb JIJ ze gekozen. Max 25 woorden. Geen overdrijving — gewoon de waarheid, sterk gebracht.",
          placeholder:
            "Bv. Ik ga je voorstellen aan...",
          maxTekens: 280,
          voorbeeld:
            "Ik ga je voorstellen aan Mark, die al 12 jaar mensen helpt om hun energie en ondernemerschap weer terug te vinden — degene die mij heeft laten zien hoe dit echt werkt.",
        },
      },
      {
        id: "dag18-edification-toepassen",
        label: "Pas je edification-zin minstens 1× toe deze week",
        uitleg:
          "Bij je eerstvolgende 3-weg of presentatie: gebruik de zin letterlijk vóór je sponsor introduceert. Niet improviseren, gewoon zeggen.",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Edification-zin laten checken door ELEVA Mentor",
        menupad: "Menu → ELEVA Mentor",
        spraak:
          "Check mijn edification-zin voor sponsor [naam]: ...",
        route: "/coach",
        // Prefill plakt de zin direct in het mentor-invoerveld. Als de
        // member 'm al heeft opgeslagen op /mijn-zinnen, wordt {edification-zin}
        // vervangen door die exacte tekst — anders door "[hier je zin]".
        prefillTemplate:
          "Check mijn edification-zin: {edification-zin}",
      },
      {
        actie: "Voorbeeld-edifications in Scripts",
        menupad: "Menu → Scripts → Edification",
        route: "/scripts",
      },
      {
        actie: "Eerder geschreven zinnen terugvinden",
        menupad: "Menu → Mijn zinnen",
        route: "/mijn-zinnen",
      },
    ],
    watJeLeert: `Edification is dé reden dat een 3-weg überhaupt werkt. Zonder edification is het gewoon nog een gesprek waar drie mensen praten — mét edification verandert het in een setting waar de prospect denkt: "wow, deze persoon die ik nu hoor, weet écht waar het over gaat".

Wat is het concreet? Edification is in 1-2 zinnen vóórdat je sponsor begint te praten:
1) wie het is,
2) wat zijn/haar track-record is (hoe lang, hoeveel mensen geholpen, welke achtergrond),
3) waarom JIJ deze persoon hebt gekozen om je verder te helpen.

Het is GEEN overdrijving. Het is GEEN reclame. Het is de waarheid vertellen — alleen wel scherp opgeschreven, niet gemompeld. De meeste netwerkers laten dit moment slap voorbijgaan ("dit is m'n upline, vertel jij even") en daar verlies je 80% van het effect.

De formule die altijd werkt:
"Ik ga je voorstellen aan [naam], die [autoriteit / track-record], en degene die [persoonlijke link met jou]."

Drie voorbeelden van hetzelfde, op verschillende sponsors:
• Sportcoach-sponsor: "Ik ga je voorstellen aan Mark, die al 12 jaar mensen begeleidt naar meer energie en helderheid — degene die mij heeft laten zien dat dit niet over producten gaat maar over je leven terugpakken."
• Mama-sponsor: "Ik ga je voorstellen aan Linda, moeder van 3, die al 8 jaar duizenden vrouwen helpt om hun lichaam en gezin weer in balans te brengen — degene die mij in 6 maanden van uitgeput naar uitgerust kreeg."
• Ondernemer-sponsor: "Ik ga je voorstellen aan Jaap, die al 15 jaar in dit vak zit en vorig jaar 200 mensen direct heeft ondersteund — degene die mij heeft laten zien dat dit serieus business is, geen hobby."

Veelgemaakte fouten:
✗ Te kort: "dit is m'n upline" — je hebt zojuist 0 autoriteit gegeven.
✗ Improviseren: elke keer iets anders zeggen — sponsor weet niet wanneer 'ie kan starten.
✗ Hyped overdrijven: "de allerbeste van Nederland!" — prospect ruikt de pitch en sluit af.
✗ Vergeten: gewoon stilletjes je sponsor laten beginnen — geen edification, geen 3-weg.

Wat je vandaag doet: 5 minuten investeren in JOUW vaste zin. Schrijf 'm op, bewaar 'm in /mijn-zinnen, en gebruik 'm letterlijk in de komende 30 3-wegs. Eén keer goed schrijven = honderd keer sterker presenteren.`,
    waaromWerktDit: {
      tekst:
        "Edification is wat een 3-weg een 3-weg maakt. Zonder dat is het gewoon nog een gesprek.",
      bron: "Eric Worre + Fraser Brookes",
    },
  },

  {
    nummer: 19,
    titel: "Pipeline-review: waar lekt je funnel?",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag19-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag19-followups-10",
        label: "10 follow-ups",
        verplicht: true,
      },
      {
        id: "dag19-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag19-pipeline",
        label: "Pipeline-review: tel per fase + zoek de bottleneck",
        uitleg:
          "Uitgenodigd: X / One-pager: Y / Presentatie: Z / Beslist: W. Waar is de grootste drop-off? Dat is je oefenpunt voor de laatste 40 dagen.",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Pipeline-weergave: zie waar prospects vastlopen",
        menupad: "Menu → Namenlijst → Weergave: Pipeline",
        route: "/namenlijst",
      },
      {
        actie: "Statistieken: 21-dagen-overzicht",
        menupad: "Menu → Statistieken",
        route: "/statistieken",
      },
      {
        actie: "Coach helpt analyseren waar je lek zit",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
        prefillTemplate:
          "Help me mijn pipeline analyseren. Aantallen: Uitgenodigd: [X] / One-pager: [Y] / Presentatie: [Z] / Beslist: [W]. Waar lekt mijn funnel en wat moet ik komende 40 dagen oefenen?",
      },
    ],
    watJeLeert: `Een goede pipeline lijkt op een trechter: bovenaan veel mensen, naar onderen toe steeds minder. Daar is niets mis mee — dat is het natuurlijke patroon. Wat WEL zegt waar je werk zit: WAAR is de grootste drop-off?

VERWACHTE GEZONDE TRECHTER (na 21 dagen):
• 100 uitnodigingen → 50-70 reacties (50-70%)
• 50-70 reacties → 25-35 one-pager-bekijkers (50%)
• 25-35 one-pager → 10-15 presentaties of 3-wegs (40%)
• 10-15 presentaties → 3-5 beslissingen (30%)
• 3-5 beslissingen = members + shoppers + not-yets

Zit jij ergens veel onder die conversie? Daar is je werk.

DE 4 BOTTLENECKS — herken je patroon:

BOTTLENECK 1 — VEEL "UITGENODIGD", WEINIG REACTIE
Symptoom: 60+% reageert niet op je uitnodiging.
Oorzaak: uitnodiging is niet warm/persoonlijk genoeg, of voelt als pitch.
Oefening: dag 4 herzien. 4-stappen-formule. Mentor: "schrijf 3 varianten van mijn standaard-uitnodiging."
40-dagen-fix: 1 week alleen op uitnodigingen oefenen, mix variant 1/2/3.

BOTTLENECK 2 — VEEL "ONE-PAGER", WEINIG PRESENTATIE
Symptoom: prospects bekijken de info maar haken daarna af.
Oorzaak: follow-up is te direct of mist focus op WAT ze raakte.
Oefening: dag 6 + dag 15 herzien. 5-fasen follow-up + Gold Question.
40-dagen-fix: tussenstap "wil je eens met mijn mentor in een groepje?" inzetten.

BOTTLENECK 3 — VEEL "PRESENTATIE", WEINIG BESLISSING
Symptoom: ze kijken de hele presentatie/3-weg, maar nemen geen beslissing.
Oorzaak: closing is niet gevraagd, je blijft hangen in "exposure".
Oefening: dag 17 (Doel-Tijd-Termijn) + dag 20 (vraag de beslissing).
40-dagen-fix: bij elke 3-weg standaard binnen 24-48u Doel-Tijd-Termijn proberen.

BOTTLENECK 4 — TE WEINIG VOLUME ALTIJD
Symptoom: trechter is in proportie OK, maar absolute aantallen te laag.
Oorzaak: je doet niet je dagelijkse aantallen.
Oefening: stap 1 = volume opvoeren. Geen techniek-fix.
40-dagen-fix: 10-10-3 ritme borgen, voor 40 dagen non-stop.

WAT JE VANDAAG DOET:
1. Open Statistieken in ELEVA, schrijf je 4 fase-aantallen op.
2. Identificeer je bottleneck (waar valt je conversie het sterkst weg?).
3. Vraag de Coach om analyse + concrete oefening voor de komende 40 dagen.
4. Schrijf op: 1 specifieke oefening voor 40-dagen-blok.

EERLIJKHEID — DIT IS HET LEER-MOMENT VAN DE 21 DAGEN:
Statistieken zijn je leermeester, niet je rechter. Slechte cijfers betekenen niet "ik ben slecht". Ze betekenen "hier zit nog werk." Iemand die zijn cijfers eerlijk leest, fixt zijn bottleneck binnen 2-3 weken. Iemand die ze ontwijkt, blijft 6 maanden in dezelfde drop-off zitten. Eerlijke pipeline = snelle groei.`,
    waaromWerktDit: {
      tekst:
        "Wat je meet, verbetert. Wat je niet meet, blijft een gevoel.",
      bron: "Peter Drucker, vrij vertaald",
    },
  },

  {
    nummer: 20,
    titel: "Afsluiten: vraag de beslissing",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag20-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
      },
      {
        id: "dag20-followups-10",
        label: "10 follow-ups",
        verplicht: true,
      },
      {
        id: "dag20-social-3",
        label: "3 namen uit socials",
        verplicht: true,
      },
      {
        id: "dag20-vraag-1",
        label: "Vraag minstens 1 warme prospect: 'Wat heb je nog nodig om te beslissen?'",
        uitleg:
          "Directe, zachte variant. Niet 'wat vind je?' maar 'wat heb je nog nodig?'. Dit opent de echte twijfel of brengt ze naar beslissing.",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Coach helpt jou de beslissing vragen",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Hoe vraag ik de beslissing aan [naam]?",
        route: "/coach",
        prefillTemplate:
          "Hoe vraag ik de beslissing aan [naam]? Wat ik weet: [aantal exposures gehad / hun positie / specifieke twijfel]. Begeleid me woord voor woord.",
      },
      {
        actie: "Closing-scripts",
        menupad: "Menu → Scripts → Sluiting",
        route: "/scripts",
      },
      {
        actie: "Pipeline updaten na beslissing",
        menupad: "Menu → Namenlijst → prospect → Pipeline-fase",
        route: "/namenlijst",
      },
    ],
    watJeLeert: `De grootste fout van starters is NIET vragen naar de beslissing. Ze blijven volgen, blijven delen, blijven hopen — soms maandenlang. Het resultaat: prospect raakt overspoeld of vergeet, jij raakt uitgeput, en niemand wordt iets wijzer. Na 3-5 exposures is het tijd om DUIDELIJKHEID te krijgen.

WAAROM "VRAGEN" GEEN DRAMMEN IS:
Drammen = blijven pushen ondanks duidelijk nee.
Vragen om beslissing = de prospect helpen de twijfel om te zetten in iets concreets.
Een prospect die nog hangt heeft last van twijfel — niet van enthousiasme. Door te vragen geef je 'm een uitweg uit zijn twijfel: ja, nee, of "ik heb nog X nodig". Alle drie zijn winst — alleen blijven hangen niet.

DE 3 GOEDE VRAAG-VARIANTEN:

1. ZACHTE VARIANT — VEEL TWIJFEL ZICHTBAAR:
"Wat heb je nog nodig om een goede beslissing te kunnen nemen?"
Open vraag, geen druk. Prospect noemt zelf wat onduidelijk is. Jij vult specifiek in. Als hij niks noemt: "Dan is er niets meer nodig — wil je er nu een knoop over doorhakken?"

2. DIRECTE VARIANT — JE VOELT DAT HIJ ER KLAAR VOOR IS:
"De echte vraag is niet of je iets wilt veranderen, maar of dit het juiste voertuig is. Klopt dat?"
Reframt de keuze van "doe ik dit?" naar "is dit MIJN pad?". Prospect voelt het verschil.

3. PRAGMATISCHE VARIANT — IEMAND DIE GEWOON BESLUITELIG WIL ZIJN:
"Op basis van wat je hebt gezien: zie je jezelf als klant, als opbouwer, of nog niet?"
Drie opties, eerlijk gepresenteerd. Prospect kan niet meer ontwijken. Klant = Shopper. Opbouwer = Member. "Nog niet" = Not-yet, herinnering +3 maanden.

WAT JE NA EEN BESLISSING DOET:

JA OP MEMBER → enrollment-flow:
Sponsor erbij in groepje, regel webshop-aanmelding samen, eerste week begeleiden. Niet weglopen na "ja", dat is wanneer ze het meest steun nodig hebben.

JA OP SHOPPER → product-flow:
Pipeline-fase Shopper, herinnering +21 dagen "hoe bevallen de producten?", géén business-vraag voor 3 maanden. Laat ze ervaren.

NEE / NIET-NU → not-yet-flow:
Erkennen, géén drammen. "Helemaal goed, dat past nu niet. Mag ik over 3 maanden nog eens vragen voor het geval dingen veranderen?" Pipeline-fase Not-yet, herinnering +90 dagen. Houd warm contact als persoon.

VEELGEMAAKTE FOUTEN:
✗ Te lang wachten met vragen → uithollen van moment, prospect raakt afgeleid.
✗ "Wat denk je?" als closing-vraag → te open, prospect ontwijkt.
✗ Direct na nee de business heropenen → break van vertrouwen.
✗ Bij ja vergeten dat de begeleiding NU start → nieuwe member voelt zich alleen, haakt af.
✗ Nooit beslissing vragen — eindeloos volgen → 6 maanden vertraging zonder progressie.

VANDAAG: kies 1 prospect die meer dan 3 exposures heeft gehad zonder beslissing. Vraag VANDAAG of MORGEN voor de beslissing met variant 1 of 3. Whatever de uitkomst — werk de pipeline in ELEVA bij. Beslissing krijgen is winst, ongeacht de richting.`,
    waaromWerktDit: {
      tekst:
        "De enige manier om 'nee' te krijgen is door te vragen. De enige manier om 'ja' te krijgen is door te vragen. Vraag.",
      bron: "Fraser Brookes",
    },
  },

  {
    nummer: 21,
    titel: "Week 3 review: de 21 dagen zijn het begin",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag21-review-3",
        label: "Week 3 review invullen",
        verplicht: true,
      },
      {
        id: "dag21-review-21",
        label: "Reflectie: hoe voelt de eerste 21 dagen?",
        uitleg:
          "Wat leerde je over jezelf? Waar groeide je? Wat was moeilijker dan gedacht? Wat bleek makkelijker? Deze reflectie gaat naar je sponsor.",
        verplicht: true,
      },
      {
        id: "dag21-doel-40",
        label: "Stel 1 doel voor de volgende 40 dagen",
        uitleg:
          "Geen vaag doel. Iets concreets. 'Ik wil 5 members meer' of 'Ik wil consistent 10-10-3 blijven draaien'.",
        verplicht: true,
      },
      {
        id: "dag21-sponsor-call",
        label: "40-min call met sponsor: fase 3 naar fase-uitgebreid",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 3 afgerond. Hoeveel beslissingen zijn binnen? Hoeveel pipeline-momentum ligt er? Dag 22 wordt het consolidatie-ritme.",
    waarInEleva: [
      {
        actie: "Week 3 review",
        menupad: "Dashboard → Wekelijkse review",
        route: "/dashboard",
      },
      {
        actie: "60-dagen-statistieken bekijken",
        menupad: "Menu → Statistieken",
        route: "/statistieken",
      },
      {
        actie: "Coach helpt 40-dagen-doel scherp stellen",
        menupad: "Menu → ELEVA Mentor",
        route: "/coach",
        prefillTemplate:
          "Help me 1 concreet doel formuleren voor de volgende 40 dagen. Wat ik in 21 dagen behaalde: [aantal members / shoppers / not-yets]. Mijn bottleneck: [waar zat de drop-off]. Wat is mijn slimste 40-dagen-doel?",
      },
    ],
    watJeLeert: `Dag 21 is GEEN eindstreep. Het is je STARTLIJN. Je hebt 21 dagen geïnvesteerd in iets nieuws — een vakgebied geleerd, een systeem opgezet, gewoonten ingebouwd, eerste resultaten geboekt. Dat is een fundament. Het echte gebouw zet je in de komende 40 dagen.

WAT JE IN 21 DAGEN HEBT GEDAAN — ERKEN HET:
• Een namenlijst van 100+ mensen aangelegd (was 0)
• Tussen de 100 en 200 uitnodigingen verstuurd
• Bezwaren leren behandelen met Feel-Felt-Found
• 3-weg-gesprekken gestart en gevoerd
• Edification, FORM, Doel-Tijd-Termijn als technieken in je gereedschapskist
• 1-3 beslissingen binnen (member, shopper of not-yet)
Dat is fors meer dan 90% van wie ooit in dit vak begint, in zo'n korte tijd.

WAT NU KOMT — WEEKRITME (DAG 22-60):
Vanaf morgen zet je het systeem in ONDERHOUDS-MODUS. Geen nieuwe technieken meer leren — alleen doen wat je hebt geleerd, dag in dag uit. Vast weekritme:
• MAANDAG — plannen, herinneringen voor de week opnemen, mindset
• DINSDAG — uitnodigen-dag, 10+ invites
• WOENSDAG — 3-weg-dag, minimaal 1 koppelen aan sponsor
• DONDERDAG — follow-up-dag, alle openstaande prospects warm houden
• VRIJDAG — socials-dag, 3 namen erbij, content posten
• ZATERDAG — events / face-to-face / ondernemers-bijeenkomsten / zelf events
• ZONDAG — review + zelfreflectie + sponsor-call

Je hoeft niets nieuws meer te leren. Je hoeft het alleen te BLIJVEN DOEN. Dat is waar 80% afhaakt. De 20% die wel doorgaat — daar zit de werkelijke groei.

WAT JE VANDAAG REFLECTEERT (3 vragen):
1. Wat leerde je over JEZELF in deze 21 dagen? (Niet over het vak, over jou. Wanneer was je sterk? Wanneer was je weak?)
2. Welk patroon zie je in je werk dat je 40 dagen lang wilt versterken?
3. Welk patroon herken je in je werk dat je 40 dagen lang wilt afleren?

DOEL VOOR DE VOLGENDE 40 DAGEN — STEL HET ZO:
• NIET: "ik wil veel members." (te vaag)
• WEL: "ik wil aan eind van dag 60: 5 members + 3 shoppers + minimaal 30 not-yets in m'n pipeline."
• Of: "ik wil consistent 10-10-3 ritme draaien, zonder uitval."
• Of: "ik wil mijn closing-vaardigheid verdubbelen — 1 op 5 i.p.v. 1 op 10 presentaties."
Eén concreet doel. Schrijf het op. Bewaar het. Dag 60 controleer je.

VEELGEMAAKTE FOUTEN VANAF NU:
✗ Stoppen met dagelijkse aantallen omdat "het loopt" → momentum verdwijnt in 2 weken.
✗ Nieuwe technieken willen leren in plaats van bestaande oefenen → je hebt genoeg, ga DOEN.
✗ Je 21-dagen-resultaat onderwaarderen ("ik heb maar 1 member") → 1 = bewezen dat je het kunt.
✗ Stoppen met sponsor-contact omdat je "doorhebt" → sponsor-momentum gebruiken voor 60 dagen.
✗ Je sponsor niet bedanken voor de eerste 21 dagen → korte tekst, scheelt veel.

VANDAAG: vul de week-3-review in. Schrijf de drie reflectie-vragen uit, eerlijk. Stel je 40-dagen-doel concreet. Plan een 30-min-call met sponsor om de overgang naar fase-uitgebreid te markeren. En: GEEF JEZELF EVEN EEN MOMENT VAN TROTS. Dag 21 is een win.`,
    waaromWerktDit: {
      tekst:
        "Je bouwt geen business in 21 dagen. Je bouwt een fundament. Daar bovenop zetten we in 40 dagen de muren.",
      bron: "Lifeplus 60-dagenrun-filosofie",
    },
  },
];

/** Haal dag-data op voor een specifiek dagnummer (1-21). */
export function getDag(dagNummer: number): Dag | null {
  if (dagNummer < 1 || dagNummer > 21) return null;
  return DAGEN[dagNummer - 1] || null;
}

/** Welke dagen vallen in een bepaalde fase? */
export function getDagenInFase(fase: 1 | 2 | 3): Dag[] {
  return DAGEN.filter((d) => d.fase === fase);
}
