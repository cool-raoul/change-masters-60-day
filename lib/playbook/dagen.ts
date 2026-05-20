// ============================================================
// PLAYBOOK, dag 1 t/m 21 volledig uitgewerkt
// Week 1 (dag 1-7): fundament
// Week 2 (dag 8-14): momentum
// Week 3 (dag 15-21): ritme
// Elke dag: ✅ controllables · 🎯 fase-doel · 📍 waar in ELEVA ·
// 💡 wat je leert · 🌱 waarom dit werkt.
// ============================================================

import { Dag } from "./types";
import { PARTNER_CHECK_UITLEG } from "@/lib/playbook/tempo-aware";

export const DAGEN: Dag[] = [
  // ============================================================
  // WEEK 1, FUNDAMENT (dag 1-7)
  // ============================================================
  {
    nummer: 1,
    titel: "🚀 Welkom! Vandaag leg je je fundament",
    fase: 1,
    vandaagDoen: [
      {
        // Per 2026-05-18: 'dag1-5-namen' is verhuisd naar pre-day-1 stap 3
        // (zelfde voor Sprint en Core). De handmatige 5 spontane namen
        // worden nu vóór dag 1 ingevuld. De telefoonboek-import blijft
        // op dag 1 (eerste echte taak) maar wordt overgeslagen voor wie
        // 'm al via Core had ingevuld.
        id: "dag1-vcard",
        label: "📲 Importeer je telefooncontacten in één klik",
        uitleg:
          "Nu je net 5 mensen bewust hebt opgeschreven, ga je je hele telefoonboek erbij pakken. Open de upload, ELEVA neemt direct alle namen uit je telefoon over en zet ze in je geheugen. Eén klik, en je hebt 100 tot 500 namen in beeld zonder iets te hoeven typen.\n\nDit is geen belkostlijst en geen verkooplijst, het is je netwerk-overzicht. Mensen die in jouw wereld bestaan: familie, oude collega's, sportmaatjes, buren. Filteren komt later, en doe je nooit voor iemand anders.",
        verplicht: true,
        vereistMobiel: true,
        inlineEmbed: "vcard-upload",
      },
      {
        id: "dag1-sponsor",
        label: "Stuur je sponsor een kort bericht: 'Ik ben gestart'",
        uitleg:
          "Geen lang verhaal nodig, gewoon even laten weten dat je vertrokken bent. Vanaf nu kijkt je sponsor in ELEVA vriendelijk mee of je dagelijks je stappen zet. Niet om te beoordelen. Gewoon om je rugdekking te geven.",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: 'dag1-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag1-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
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
      {
        actie: "Je WHY bekijken of bijschaven",
        menupad: "Menu → Mijn WHY",
        route: "/mijn-why",
      },
    ],
    watJeLeert: `Te gek dat je hier bent! 🎉 Je fundament staat. Je WHY, je eerste 5 namen, je tempo, ze zijn al binnen. Vandaag pakken we de telefoonboek-import erbij en stuur je je sponsor een berichtje. Rustige dag, geen drukke dag.

JE NAMENLIJST GROEIT VANDAAG

Eén klik op de telefoonboek-import en je hele lijst is in beeld. Geen verkooplijst, geen belkost-lijst, gewoon je netwerk in overzicht. Mensen die in jouw wereld bestaan: familie, oude collega's, sportmaatjes, buren. Filteren komt later, en doe je nooit voor iemand anders.

EERLIJK OVER VOLUME

Met 20 namen ga je het niet redden. Niet omdat je faalt, maar omdat een gemiddelde prospect 4 tot 6 contactmomenten nodig heeft voor een echte beslissing. Met te weinig namen draai je vast. Daarom voegen we elke dag namen toe.

JE SPONSOR INLICHTEN

Een sponsor is geen baas, het is je rugdekking. Eén kort "ik ben gestart"-berichtje is genoeg. Vanaf nu kijkt 'ie in ELEVA mee en ziet wat er gebeurt. Vele momenten van steun in de komende weken, vanuit één bericht.

JIJ LAAT ZIEN, ZIJ BESLISSEN

Jouw taak is niet overtuigen, niet binnenpraten, niet iemand laten kiezen voor wat jij wilt. Jouw taak is laten zien wat het is. Zij beslissen wat ze ermee doen. Dat maakt je werk lichter en respectvoller.

VEELGEMAAKTE FOUTEN OP DAG 1

✗ Direct mensen DM-en omdat je 'wilt scoren'. Vandaag is fundament, niet acquisitie.
✗ Sponsor niet inlichten. Je rugdekking begint nu.
✗ Te lang piekeren over wie je 'eerst' moet aanspreken. Morgen breiden we je lijst uit.

Overweldigd voelen is normaal. Je leert iets nieuws, je stapt uit comfort. Eerst onhandig, dan vaardig. Niet alleen.

Bouwen mag leuk zijn 💟`,
    waaromWerktDit: {
      tekst:
        "De mensen die op dag 47 nog doorgaan, zijn vaak dezelfden die in week 1 hun netwerk-overzicht rustig hebben gevuld. Zonder mensen op je lijst geen werk, zonder fundament geen gebouw.",
    },
  },

  {
    nummer: 2,
    titel: "👋 Open je hoofd: alle namen op de lijst",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag2-20-namen",
        label: "Voeg 20 namen toe aan je namenlijst",
        uitleg:
          "Vandaag breidt je namenlijst uit naar 20. Je hebt DRIE manieren, kies wat past of mix ze door elkaar:\n\n1️⃣ VANUIT JE TELEFOON-GEHEUGEN (snelst, als je gisteren hebt geüpload)\nOpen Namenlijst → '📚 Mijn ELEVA-geheugen' en activeer er 20 in één klik uit de namen die je telefoon al kent. Snelst, want je hoeft niets te bedenken, je kiest wie je herkent.\n\n2️⃣ ALSNOG JE TELEFOON IMPORTEREN (als je dat gisteren niet hebt gedaan)\nGeen probleem als je gisteren de import overgeslagen hebt. Doe het vandaag alsnog op je telefoon via Namenlijst → 'Importeer contacten'. Daarna kun je vanuit je geheugen 20 namen activeren (zie optie 1).\n\n3️⃣ ZELF TYPEN (altijd mogelijk, ook zonder import)\nVul hieronder direct namen in: familie, oud-collega's, sport, hobby, ouders bij school, buren. Geen filter, alles erop. Werkt prima los van de import, of als aanvulling daarop.\n\n💡 Tip: begin met je telefoonlijst (optie 1 of 2), dan komen er namen voorbij waar je niet aan had gedacht. Daarna eventueel zelf aanvullen met optie 3. Beide tellen mee voor de 20.",
        verplicht: true,
        inlineEmbed: "namen-form",
        inlineEmbedDoel: 20,
      },
      {
        id: "dag2-kennismaak",
        label: "Plan een korte call met je sponsor",
        uitleg:
          "Stuur je sponsor een appje: 'Hé [naam], ik ben begonnen, kunnen we deze week ergens 30 minuten bellen om door m'n eerste stappen te gaan?'. In die call: jouw WHY laten lezen, samen door je eerste 3 uitnodigingen, en samen afspreken wat jullie ritme wordt voor week 1.",
        verplicht: true,
        inlineEmbed: "sponsor-melding",
      },
      {
        // Inhoud van de oude onboarding-stap-4 'scripts' zit nu hier in
        // de uitleg, want de eerste uitnodigingen doe je in deze taak
        // (samen met sponsor of via Mentor), dat is logischer dan ze
        // los te lezen tijdens onboarding.
        id: "dag2-3-invites",
        label: "Stuur je eerste 3 uitnodigingen (samen met sponsor of via Mentor)",
        uitleg:
          "Kies 3 warmere mensen uit je lijst. Stel het bericht samen met je sponsor op tijdens jullie call, of vraag de Mentor: 'Schrijf een uitnodiging voor [naam] die [context]'. Drempel laag houden, gewoon doen, niet perfect. Eerste uitnodigingen voelen altijd onhandig, dat hoort.\n\nHOE KLINKT EEN EERLIJK BERICHT?\n\nEen sterk uitnodigingsbericht is kort, eerlijk en persoonlijk. Geen verkoop-praat vooraf, geen mysterie. Hieronder twee voorbeelden ter inspiratie, niet om letterlijk te kopieren. Sponsor of Mentor maakt er straks een versie van die past bij wie jij gaat appen.\n\n📞 Voorbeeld 1, voor een belletje of voice memo (warme bekende):\n\n'Hey [naam], ik moest even aan je denken en daarom bel ik je. Ik ga binnenkort starten met iets waar ik 60 dagen echt vol voor ga. Geen geheim, ik wil gewoon iets serieus neerzetten. En toen ik nadacht met wie ik dat zou willen doen, kwam jij in me op. Ik weet niet of het bij je past. Maar ik weet wel dat jij iemand bent die dingen voor elkaar krijgt. Dus voordat ik het straks breder ga delen, wilde ik jou als eerste even meenemen. Zullen we even samen zitten? Koffie, lunch of even via Zoom?'\n\n💬 Voorbeeld 2, voor WhatsApp of DM (direct en eerlijk):\n\n'Oke, ik ga gewoon eerlijk zijn. Ik ga de komende 60 dagen iets neerzetten waar ik vol voor ga. En toen ik nadacht met wie ik dat zou willen doen, kwam jij meteen in me op. Omdat jij niet iemand bent die een beetje aanklooit. Als jij iets doet, doe je het goed. Ik ga je alles laten zien, de producten, het plan, hoe het werkt. Maar eerst wil ik eigenlijk 1 ding weten: stel dat alles klopt, dat je voelt dit past bij mij, zou je dan zeggen hier wil ik bij zijn?'\n\nWAT MAAKT DEZE BERICHTEN STERK?\n\n• Ze zeggen eerlijk vooraf wat het is, geen mysterie.\n• Ze edificeren de ander, niet jezelf.\n• Ze laten de keuze nadrukkelijk bij de ander.\n• Ze hebben een duidelijke vervolgvraag.\n\nVOORDAT JE STUURT, CHECK:\n\n• Heb je [naam] vervangen door de echte naam?\n• Past de toon bij hoe jij normaal met deze persoon praat?\n• Heb je het hardop voorgelezen, voelt het natuurlijk?\n• Klaar om rustig op reactie te wachten? Aandringen werkt averechts.\n\nZeggen ze ja? Plan het gesprekje liefst samen met je sponsor in. Zo leer je het sneller dan in je eentje.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag2-3weg-uitleg",
        label: "Begrijp het 3-weg-gesprek-principe",
        uitleg:
          "Een 3-weg-gesprek is een gesprekje met drie mensen: jij, je prospect, en je sponsor (of een ervaren teamlid). Het werkt om drie redenen tegelijk:\n\n• SPONSOR brengt autoriteit (heeft track-record, ervaring, weet de antwoorden op vragen die jij nog niet hebt).\n• JIJ brengt vertrouwen (de prospect kent jou, niet de sponsor).\n• PROSPECT ziet twee mensen die al samenwerken, dat geeft sociaal bewijs: 'blijkbaar werkt dit echt'.\n\nGeen van de drie kan dit alléén. Het is de combinatie. Vandaar 3-weg.\n\nVoorbeeld waarop het werkt: warme prospect heeft een vraag waar jij geen antwoord op hebt. Niet zelf gokken, je opent een groepje met sponsor erbij, sponsor pakt het op. Jij leert mee, prospect krijgt een goed antwoord, vertrouwen blijft.\n\nJe hoeft 'm vandaag nog niet te starten, alleen even snappen dát het bestaat en wanneer 'ie nuttig is. Op dag 4 ga je 'm voor het eerst toepassen.",
        verplicht: true,
      },
      // Per 2026-05-18: 'dag2-webshop' en 'dag2-krediet' zijn verhuisd
      // naar de admin-rail op /setup, samen met teams-admin, bestellinks
      // en productadvies-test. Zo blijven de dag-taken puur over inhoud
      // en groei van het netwerk, en zit alle eenmalige admin gebundeld
      // op één plek met pop-up-herinnering.
      {
        id: 'dag2-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag2-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
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
      `NIVEA is dé regel die de meeste starters vergeten en daardoor 80% van hun beste prospects op voorhand wegfilteren. NIVEA staat voor: Niet Invullen Voor Een Ander.

Wat het concreet betekent: jij weet niet wat er in iemand omgaat. Wat zijn financiële situatie is. Wat zijn relatie doet. Of zijn werk hem nog vult. Of zijn gezondheid 'm uitput. Of die gladde collega thuis stiekem worstelt. Je hebt een momentopname in je hoofd, vaak van jaren geleden, en daarop maak je een oordeel "die zit hier niet op te wachten". Dat is zelden waar.

Bovendien: zelfs als die specifieke persoon écht niet voor zichzelf gaat, kent hij of zij wél iemand die wél past. Iedereen heeft een netwerk van 100+ mensen. Een schoonzus die net moeder is geworden, een oud-collega die ontslag heeft gekregen, een buurman die met pensioen twijfelt. Jij weet dat niet. Je kunt het niet weten. Daarom: alle namen op de lijst. Filteren doe je later, als je échte signalen hebt, niet vooraf in je eigen hoofd.

Drie typische "ik filter al"-fouten en wat de waarheid bleek:
• "Die zwager heeft een goede baan", bleek 6 maanden later open te staan toen er herstructurering kwam.
• "Die moeder bij voetbal is zo druk", werd de eerste die ja zei, want ze zocht juist iets dat naast haar gezin paste.
• "Die oud-collega zie ik nooit meer", bleek een netwerk van 200+ ondernemers te hebben en had de perfecte intro.
Patroon: jouw oordeel zegt meer over jouw beeld dan over hun werkelijkheid.

Hoe je vandaag NIVEA in praktijk brengt:
1. Pak een rustig moment, geen telefoon, geen afleiding.
2. Loop categorieën door: familie, partners van familie, oude vrienden, huidige vrienden, collega's nu, collega's vroeger, sport/hobby, ouders bij school/club, buurt, ondernemers in je netwerk.
3. Per categorie: schrijf élke naam op die in je hoofd opkomt. Geen filter. Voelt het ongemakkelijk? Dat is precies de plek om door te zetten.
4. De spraakfunctie werkt het snelst: "Nieuwe prospect [naam] uit [context]" en je hebt in een korte sessie 20 namen.
5. Stop niet bij 20. Ga door totdat het écht op is, vaak zit je dan op 50 tot 100.

Veelgemaakte fouten, herkenbaar?
✗ "Hij heeft toch geen geld" → vooroordeel, geen feit.
✗ "Die heeft het te druk" → laat hem zelf bepalen of hij tijd heeft.
✗ "Die zou nooit naar mij luisteren" → projectie van eigen onzekerheid.
✗ Wachten met uitnodigen tot je lijst "perfect" is → de lijst is nooit perfect.
✗ Eerst zelf alle bezwaren beantwoorden in je hoofd → dat is hun werk, niet jouw werk.

Vandaag stuur je ook al 3 uitnodigingen, samen met je sponsor in een groepje (3-weg-principe). Sponsor brengt autoriteit, jij koppelt, prospect ziet twee mensen die samenwerken. Dat is de hefboom waarmee je niet alles zelf hoeft te weten of te kunnen. Eerste uitnodigingen voelen onhandig, dat klopt en gaat over. Niet daardoor stoppen, juist daardoor met steun starten.`,
    waaromWerktDit: {
      tekst:
        "De geheugensteunlijst is je voorraadkast. Hoe voller, hoe makkelijker de keuze wat je vanavond kookt. En de eerste invites zijn altijd het zwaarst, gewoon door.",
    },
  },

  {
    nummer: 3,
    titel: "📱 Je socials zijn een goudmijn, 3 namen + 5 invites",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag3-social-3",
        label: "Open Instagram of LinkedIn, zet 3 namen in je lijst",
        uitleg:
          "Scroll 5 minuten. Wie reageert op je posts? Wie stuurt DMs? Wie post dingen over energie, doelen, gezondheid, ondernemen? 3 namen met 1 woord context ('fitness', 'oud-collega').",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag3-invites-5",
        label: "5 uitnodigingen versturen",
        uitleg:
          "Bouw door op gisteren. Vandaag mag je het zelfstandig doen. Loop je vast? Vraag de Mentor: 'Schrijf een uitnodiging voor [naam] die [context]'.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag3-dagelijks-5",
        label: "5 nieuwe namen toevoegen vandaag",
        uitleg:
          "5 nieuwe namen erbij in je lijst. Snelste route: telefoon-import (vCard) als je daar nog onbenutte namen in hebt staan. Anders: zelf typen, of uit socials. Je pipeline blijft elke dag groeien, dat is de basis. Hoe meer namen erin, hoe rustiger je werkt.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag3-eerste-gesprek",
        label: "Start 3 losse chats op socials (geen pitch, gewoon contact)",
        uitleg:
          "Open Instagram of Facebook (of LinkedIn). Pak 3 mensen die je een tijd niet hebt gesproken maar wel volgt of door wie je gevolgd wordt. Per persoon: reageer op hun laatste post of story, of stuur een DM met een gewone vraag ('hé, hoe is het bij jou?'). Niets verkopen, geen uitnodiging. Gewoon even contact, koude mensen warm maken zodat een uitnodiging later natuurlijk voelt.\n\nBelangrijk: je sociale-account moet gekoppeld zijn voor de directe doorklik vanuit ELEVA. Als die nog niet staat, regel het in /instellingen.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag3-sponsor-checkin",
        label: "Korte sponsor-checkin (1 bericht): 'Heb gister 3 invites gestuurd'",
        uitleg:
          "30 seconden. Sponsor weet dat je beweegt, jij voelt de lijn naar boven open. Niets uitgebreids, gewoon even een update.",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: "dag3-teams-admin",
        label: "📋 Teams-administratiesysteem aanmaken",
        uitleg:
          "Lifeplus Partner-aanmelding, eenmalige administratieve registratie. Bekijk de korte film in deze taak voor de exacte stappen.",
        verplicht: true,
        filmSlug: "onboarding-stap-7-teams-admin",
      },
      {
        id: 'dag3-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag3-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Naam handmatig toevoegen",
        menupad: "Menu → Namenlijst → + Nieuwe prospect",
        route: "/namenlijst/nieuw",
      },
      {
        actie: "Nieuwe naam via spraak",
        spraak: "Nieuwe prospect [naam] uit Instagram",
      },
    ],
    watJeLeert: `Instagram, Facebook en LinkedIn geven je geen downloadbare contactenlijst, dat is expres zo. Maar ze geven je iets veel waardevollers: ACTIEVE SIGNALEN. Mensen die jouw content bekijken, reageren, delen, in stories duiken. Dat is gedrag dat zegt: "ik volg je, je content raakt me, je bent op mijn radar." Dát zijn je warme contacten van de toekomst, vaak veel beter geschikt dan oude telefooncontacten waarmee je al jaren geen woord hebt gewisseld.

3 namen per dag uit socials = 21 nieuwe warme prospects per week, bovenop je telefoonlijst. Dat is een serieuze aanvulling op je netwerk-overzicht zonder dat je rond hoeft te bellen.

WAT JE VANDAAG DOET, concrete radar-check:
1. Open Instagram en kijk: wie reageert al een paar weken op jouw verhalen of posts?
2. Wie stuurt je af en toe een DM, ook al is het maar een hartje of een snelle vraag?
3. Wie post zelf dingen over energie, doelen, ondernemen, gezondheid, onderwerpen die raken aan wat jij gaat doen?
4. Wie keek je laatste story tot het einde of klikte op een sticker?
5. LinkedIn: wie heeft recent ge-liked, ge-deeld, of jou direct getagd?

ALLE DRIE de namen krijgen ÉÉN WOORD context op de lijst (bv. "fitness", "oud-collega", "Linkedin-coach"). Niet meer, geen biografie. Het label is genoeg om te onthouden waar je zat toen je 'm noteerde.

VEELGEMAAKTE FOUTEN:
✗ "Ik kén niemand op Instagram" → je hoeft ze niet te kennen, ze hoeven jou alleen al te volgen.
✗ Wachten tot iemand "duidelijk een match" is → je weet de match niet, je weet alleen het signaal.
✗ Direct DM-en als "verkooppraatje" → eerst koppelen, peilen, niet pitchen.
✗ Tegen jezelf zeggen "ze hebben me lang niet meer geliket dus zal niet meer interesseren" → 3 weken stilte ≠ uit-radar, het is gewoon niet hun moment.

NIET GELIJK PITCHEN, wat wel: reageer terug op hun content. Vraag iets. Bouw rapport. Pas DAARNA, in een tweede of derde gesprek, kom je met een uitnodiging (zie dag 4 voor de 4-stappen-formule).`,
    waaromWerktDit: {
      tekst:
        "Social media is geen podium, het is een radar. Je kijkt niet wie er klapt. Je kijkt wie er zwaait.",
    },
  },

  {
    nummer: 4,
    titel: "💬 Vandaag leer je uitnodigen, 4 stappen die werken",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag4-uitnodiging-1-5",
        label: "5 uitnodigingen versturen, structuur toepassen",
        uitleg:
          "Compliment + uitnodigen voor kijkmoment + tijd voorstellen. De 'ik heb haast'-opener is OPTIONEEL, alleen bij business-prospects of zakelijke context. Bij vrienden of familie laat je 'm weg en begin je gewoon warm. Doel: ja tegen het kijkmoment, niet ja tegen jou.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      // dag4-aanpak-kiezen leeft sinds 2026-05-20 in tempo-aware.ts als
      // dagelijkse `aanpakKiezenStap(N)`-helper, op alle dagen 4 t/m 21
      // beschikbaar zodat de check elke dag terugkomt zolang er prospects
      // in 'gekeken' / 'wil meer weten'-fase kunnen zitten. Zie
      // AANPAK_KIEZEN_UITLEG in lib/playbook/tempo-aware.ts.
      {
        id: "dag4-follow-1",
        label: "Minimaal 2 herinneringen sturen aan eerdere prospects",
        uitleg:
          "Aan eerdere prospects waarmee je gesproken hebt of die je hebt uitgenodigd, een korte herinnering sturen. Niet 'follow-up' in de strikte zin (die heeft al info gehad), gewoon even contact. Bijvoorbeeld de persoon uit dag 3 met wie je een losse chat startte. Niet pitchen, gewoon even peilen hoe het is.",
        verplicht: false,
        actieRoute: "/namenlijst",
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
      {
        id: 'dag4-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag4-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
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

DE FORMULE, drie kern-stappen + één optionele opener:

OPTIONEEL (ALLEEN bij business-prospects, ondernemers of duidelijk-zakelijke context):
0) WEES DRUK, "Ik heb weinig tijd, maar..." Eén zinnetje. Signaleert waarde aan je tijd én voorkomt een lang vrijblijvend gesprek. LET OP: dit is niet de standaard-opener. Bij vrienden, familie of mensen waar je een rustige relatie mee hebt past dit niet, dat klinkt geforceerd. Worre's 'wees druk' is bedoeld voor doelgerichte business-uitnodigingen, niet als universele opener.

DE DRIE KERN-STAPPEN:
1) COMPLIMENT of ERKENNING, "Jij bent iemand die dingen voor elkaar krijgt", of "ik moest aan jou denken omdat...". Echt, specifiek, geen smeerolie. Maakt dat je prospect zich GEZIEN voelt. Mensen werken niet voor verkoop-praatjes, ze werken voor erkenning.
2) UITNODIGEN, kies de variant die past bij hoe warm de prospect is:
   • DIRECT (warme prospect, vertrouwen al hoog): "Ik ben gestart met iets nieuws, wil het je laten zien."
   • INDIRECT (mid-warm): "Dit is vast niets voor jou, maar ken jij iemand die extra wil verdienen?"
   • SUPER-INDIRECT (lauw of onbekend): "Ken jij toevallig mensen die openstaan voor bij-inkomen?"
3) PLAN, "Wanneer schikt het, vanavond of morgen?" Geef twee tijdsblokken, geen open vraag. Open vragen ("wanneer kan jij?") leiden 80% naar uitstel.

DE KERN, JE TAAK = UITNODIGEN, NIET OVERTUIGEN:
Je wilt niet dat ze "ja" zeggen tegen JOU. Je wilt dat ze "ja" zeggen tegen een KIJKMOMENT. Dat is een veel lagere drempel. Een kijkmoment is geen commitment, geen mening, geen koop. Het is alleen "ik kijk even mee, daarna beslis ik". Dat verkoop je 10× makkelijker dan een product.

DRIE VOORBEELD-UITNODIGINGEN, alle drie in de 4-stappen:

1. WhatsApp aan oud-collega (warm):
"Hé Mark, ik heb het druk en wilde dit even snel sturen. Jij bent iemand die altijd doorpakt en daarom denk ik aan jou. Ik ben net gestart met Project Meer Tijd en Vrijheid, wil je dat ik je kort laat zien wat het inhoudt? Vrijblijvend hoor. Vanavond of morgen aan het eind van de dag?"

2. DM aan iemand die op je posts reageert (mid):
"Hé Linda, snel berichtje tussendoor. Je reageert al een tijdje op wat ik deel, dat waardeer ik. Ik ben gestart met iets dat past bij wat ik aan het opbouwen ben. Wil je dat ik je in een kort moment laat zien hoe het werkt? Geen verplichting, even meekijken. Donderdag of vrijdag?"

3. Spraak naar oude vriend (super-indirect):
"Hé broer, snel ding. Even goed te bellen, jij bent toch diegene die altijd weet wie er met wat bezig is? Ik zoek mensen die openstaan voor een gratis webshop met gezondheidsproducten waarmee je een extra inkomen kunt opbouwen. Ken jij toevallig iemand? Bel je woensdagavond?"

VEELGEMAAKTE FOUTEN:
✗ Compliment vergeten → klinkt als pitch.
✗ Geen tijdslimiet ("Ik heb druk") in plaats van "weinig tijd, maar..." → mist de spanning.
✗ Té veel uitleg in de uitnodiging zelf → ze haken af. Uitnodiging is voor het kijkmoment, niet voor de info.
✗ Open afsluiten ("laat me weten of het je interesseert") → 80% uitstel.
✗ Antwoord op bezwaren al vooraf in het bericht stoppen ("ik weet dat je geen tijd hebt maar...") → je legt zelf de twijfel op tafel, doe dat niet.
✗ "Ja zeggen tegen jou" willen forceren in plaats van "ja tegen het kijkmoment". Verschuif de vraag.

Vandaag stap je actief uit je comfortzone, en dat kriebelt, afwijzingsangst, "wat als ze me raar vinden?". Helemaal normaal. Niemand begint vaardig. Een nee is geen oordeel over jou, het is een momentopname over hen. Volgende uitnodiging gewoon doorgaan.

──────────────────────────────────────────

NÁ DE UITNODIGING, TWEE PADEN VOOR ELKE PROSPECT:

Zodra iemand "ja, ik kijk mee" heeft gezegd, kies je per prospect HOE je 'm verder begeleidt. Op de prospect-kaart staat een keuze-blok met deze twee opties:

🤝 3-WEG-GESPREK (klassiek, dag 7 verdiep je dit)
- Jij + sponsor + prospect samen in een WhatsApp-groep of live-call
- Sponsor brengt autoriteit en ervaring, jij bent de verbinder
- Prospect ziet twee mensen die samenwerken, dat geeft vertrouwen
- Snel pad: van "ja kijken" naar beslissing in 1 gesprek
- PAST BIJ: warme prospects, mensen die persoonlijk contact zoeken, kort traject mogelijk

✨ MINI-ELEVA (nieuw, vanaf vandaag beschikbaar)
- Prospect krijgt 14 dagen eigen toegang tot een persoonlijke omgeving
- Daar staan welkomstvideo's, een ELEVA-mentor (AI, 24/7), en een chat met jou en de sponsor
- Prospect kijkt op eigen tempo, jij krijgt push-meldingen bij elke actie
- AVG-veilig: jij ziet WANNEER ze actief zijn en HOEVEEL vragen ze stellen, niet WAT ze vragen aan de mentor (alleen via chat-tegel deelt 'ie expliciet)
- PAST BIJ: nieuwsgierige twijfelaars, prospects met druk leven, mensen die eerst rustig zelf willen kijken

Beide paden hebben hun moment. 3-weg blijft het krachtigste voor wie warm en beschikbaar is. Mini-ELEVA opent een deur voor mensen die anders zouden zeggen "stuur me wat info, ik kijk later" en dan nooit kijken. Met mini-ELEVA hebben ze een veilige plek om wel te kijken, op hun eigen tempo, met menselijk contact bereikbaar.

Op je prospect-kaart kun je de keuze maken via de knop "🧭 Welke aanpak past bij...?". De andere optie blijft beschikbaar als je wisselt.`,
    waaromWerktDit: {
      tekst:
        "Wees zakelijk. Wees professioneel. Wees kort. Dan neem je mensen serieus genoeg om ze de ruimte te geven zélf nee te zeggen.",
    },
  },

  {
    nummer: 5,
    titel: "🛡️ Bezwaren? Geen probleem, Feel-Felt-Found",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag5-invites-5",
        label: "5 uitnodigingen (nieuwe mensen of via follow-up)",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → kies 'Uitnodigen' of laat de Mentor er één voor je schrijven. Mix warm (mensen die je goed kent) met lauw (telefoon-contacten waar je weinig mee praat).",
      },
      {
        id: "dag5-followups-3",
        label: "3 follow-ups op mensen van dag 3-4",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "3 mensen die eerder een invite/info hebben gehad, vandaag een korte check-in. Open Namenlijst → kies prospect → 'Follow-up' of vraag de Mentor: 'Help me met een follow-up voor [naam]'. Niet 'heb je al beslist?' maar 'hoe gaat 't?'.",
      },
      {
        id: "dag5-roleplay",
        label: "Korte roleplay met bezwaren, met sponsor of Mentor",
        uitleg:
          "Waarom oefenen met bezwaren belangrijk is: in een echt gesprek krijg je geen tweede kans om iets te formuleren. Als jij staat te zoeken naar woorden, voelt de prospect onzekerheid en verliest hij vertrouwen. Door vooraf een paar keer te oefenen, weet je in grote lijnen hoe je elk bezwaar kunt aanvliegen, zelfs als je niet de exacte woorden paraat hebt.\n\nVraag je sponsor om 1-2 typische bezwaren te 'spelen' en oefen Feel-Felt-Found. Geen sponsor beschikbaar? Vraag de Mentor: 'Speel een prospect die zegt: ik heb geen tijd', en oefen je antwoord. Daarna een nieuwe ronde met een ander bezwaar. Vier of vijf rondes is genoeg om het ritme te pakken.",
        verplicht: true,
        actieRoute: "/coach",
      },
      {
        id: 'dag5-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag5-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
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
        actie: "Bezwaren-bibliotheek (21 bezwaren met scripts)",
        menupad: "Menu → Scripts → Bezwaren",
        route: "/scripts#bezwaren",
      },
      {
        actie: "Prospect op 'Niet nu' zetten als ze afhouden",
        menupad: "Prospectkaart → Pipeline-fase → Not yet",
        route: "/namenlijst",
      },
      {
        actie: "Audio onderweg met Eric Worre (Academy)",
        menupad: "Menu → Academy → Audio onderweg met Eric Worre",
        route: "/academy/audio-onderweg",
      },
    ],
    watJeLeert: `Feel-Felt-Found is dé universele bezwaar-techniek en werkt op zowat élk bezwaar. Drie psychologische dingen tegelijk: erkennen, normaliseren, herframen. Zonder dat de prospect het gevoel krijgt dat hij wordt 'ompraat'.

Naast Feel-Felt-Found heeft de Mentor de volledige bezwaren-bibliotheek (21 meest voorkomende bezwaren in netwerkmarketing) als kennis. Als jij vastloopt bij een specifiek bezwaar, vraag de Mentor: "geef me alternatieve antwoorden op het bezwaar [bezwaar]". Hij kent meer benaderingen dan alleen Feel-Felt-Found.

DE FORMULE:
• FEEL, "Ik snap dat het zo voelt." Erken het gevoel. NIET het bezwaar weerleggen, alleen valideren dat het bestaat.
• FELT, "Veel mensen voelden dat in het begin ook." Normaliseer. De prospect is niet raar, hij is in goed gezelschap.
• FOUND, "Wat zij merkten was [korte herframing]." Geef de nieuwe lens, in 1 zin, niet als argument maar als observatie.
• AFSLUITEN MET DOORVRAAG, "Maar vertel eens, waar zit het 'm nu écht in?" Dit is de KEY-stap die de meeste mensen vergeten.

DE GOUDEN REGEL, DE EERSTE WEERSTAND IS BIJNA NOOIT DE ECHTE:
"Geen tijd", "ik wil eerst nadenken", "ik ben niet van sales", dat zijn emotionele schilden. Beleefde manieren om afstand te maken. De échte twijfel zit eronder: angst voor afwijzing door familie, slechte ervaring met netwerkmarketing, schaamte voor financiële situatie, niet weten waar te beginnen. Jouw werk = vriendelijk doorvragen tot de échte zorg op tafel komt. Daar pas kun je écht helpen.

DRIE VOORBEELDEN VAN FEEL-FELT-FOUND:

1. Bezwaar: "Ik heb geen tijd."
"Ik snap dat het zo voelt, iedereen die ik ken heeft het al druk genoeg. Veel mensen die nu starten dachten dat ook in het begin. Wat zij merkten is dat het juist flexibel werkt naast wat ze al deden, een paar avonden in de week, soms minder. Maar vertel eens, waar zit het 'm nu écht in? Is het tijd, of speelt er iets anders mee?"

2. Bezwaar: "Ik wil eerst nadenken."
"Helemaal logisch dat je daar even mee wilt zitten. Veel mensen voelden dat in het begin ook. Wat zij merkten is dat 'nadenken' meestal betekent dat één specifiek punt nog onduidelijk is, geen totaal nee. Mag ik je iets vragen: waar wil je precies over nadenken? Is het de tijd, het vertrouwen, of het idee zelf?"

3. Bezwaar: "Ik ben niet van sales."
"Snap ik 100%, ik dacht dat zelf ook. Wat ik (en velen die starten) merkten is dat dit geen sales is in de traditionele zin: geen koud bellen, geen markten afgaan, geen targets. Het is mensen die jij al kent uitnodigen om iets te bekijken. Maar ik ben benieuwd, waar komt dat 'niet van sales'-gevoel bij jou vandaan?"

VEELGEMAAKTE FOUTEN:
✗ Direct argumenteren ("dat klopt niet, want...") → de prospect sluit af.
✗ FEEL overslaan en meteen FOUND → voelt als pitch.
✗ Vergeten af te sluiten met een doorvraag → blijft hangen in de ruimte.
✗ Prospect wegwuiven met "ach, dat lossen we wel op" → hij voelt zich niet gehoord.
✗ Eigen verhaal lang vertellen ("ik dacht dat ook!") → maakt het over jou.
✗ Drammen na een nee → break van vertrouwen, prospect onthoudt het altijd negatief.`,
    waaromWerktDit: {
      tekst:
        "Een bezwaar is geen muur. Het is een vraag die niet weet hoe 'm te stellen.",
    },
  },

  {
    nummer: 6,
    titel: "🔄 De fortuin zit in de follow-up, 24-48u-regel",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag6-invites-5",
        label: "5 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → kies 'Uitnodigen' of laat de Mentor er één voor je schrijven. Mix warm (mensen die je goed kent) met lauw (telefoon-contacten waar je weinig mee praat).",
      },
      {
        id: "dag6-followups-3",
        label: "3 follow-ups (stilgevallen gesprekken weer aanwakkeren)",
        uitleg:
          "Iedereen die je dag 4-5 hebt uitgenodigd of info gestuurd hebt en niet meer gereageerd heeft. Een niet-antwoord is géén nee, meestal gewoon stilte: druk leven, vergeten, of even geen prioriteit.\n\nDE STILGEVALLEN-GESPREKKEN-ZIN (werkt vrijwel altijd):\n\"Hé, ik zag dat je niet meer had gereageerd op mijn laatste berichtje. Is dat omdat je druk was of omdat je geen interesse hebt op dit moment? Allebei prima hoor, ik dacht: ik vraag het even!\"\n\nWaarom dit werkt:\n• Geen verwijt, geen druk: 'allebei prima hoor' geeft de uitweg.\n• Eerlijk antwoord: mensen die druk waren ('sorry, vergeten!') komen terug. Mensen die geen interesse hebben, geven dat aan zonder ongemak.\n• Helderheid voor jou: je weet waar je staat, kunt verder.\n\nGebruik 'm letterlijk of in jouw eigen woorden, beide werkt.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag6-sponsor-tip",
        label: "Vraag sponsor of Mentor: 1 tip op je lastigste follow-up",
        uitleg:
          "Heb je 1 contact waar je niet weet wat je moet sturen? Vraag je sponsor: 'Hoe zou jij dit aanpakken?'. Sponsor even druk? Dan de Mentor: 'Help me met een follow-up voor [naam] die [situatie]'. Je hoeft het niet alleen te bedenken.",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: 'dag6-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag6-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
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
    watJeLeert: `Follow-up is geen optie, het is JE WERK. 80% van alle "ja's" komen pas na de derde tot vijfde aanraking. Wie alleen uitnodigt en dan stopt, verliest de meeste deals voordat het gesprek serieus wordt. De goede netwerker volgt OP en blijft warm, zonder te jagen.

DE 24-48U REGEL:
Stuur 24-48 uur na een uitnodiging je eerste check-in. Niet eerder (dan voelt het opdringerig), niet later (dan is de psychologische ruimte alweer dicht en is je prospect het kwijt). Gemiddeld zijn 5 contactmomenten nodig voor iemand een echte beslissing maakt, dat is geen drammen, dat is gewoon de statistiek van menselijk gedrag.

DE 5-FASEN-FOLLOW-UP:
1) CHECK-IN (24-48u): "Even inchecken, hoe gaat het met je?" GEEN "heb je al nagedacht?". Geen beoordelaar zijn.
2) PEILEN (na 3-5 dagen): "Wat sprak je het meeste aan van wat je gezien hebt?" Open vraag, focus op WAT, niet op JA/NEE.
3) VERDIEPEN (na 7-10 dagen): "Dit wilde ik je ook nog laten zien..." Tweede waardevol punt, een testimonial, een product-review, een nieuw filmpje.
4) UITNODIGING NAAR EVENT/3-WEG (na 10-14 dagen): "Er is binnenkort iets dat past, wil je erbij zijn?" Verlaag de drempel naar een nieuwe exposure.
5) SLUITEN OF NOT-YET (na 14-21 dagen): "Wat is voor jou het belangrijkste punt om helder te krijgen?" Direct, eerlijk, zonder druk.

DE TOON, WAT JE WEL EN NIET DOET:
✓ "Even inchecken" → vriendelijk, niet beoordelend
✓ "Wat sprak je aan?" → focus op wat positief is
✓ "Mag ik over 3 maanden nog eens vragen?" → nee = nu, niet voor altijd
✗ "Heb je al nagedacht?" → zet ze in beoordelaar-positie
✗ "Wat vond je ervan?" → vraagt om mening, opent kritiek
✗ "Ben je er nu uit?" → druk, sluit gesprek af
✗ Stilte na 1 keer geen reactie → fataal, je verliest 80%

DRIE VOORBEELDEN, verschillende fasen:

1. CHECK-IN (24u na uitnodiging, geen reactie):
"Hé Mark, even inchecken hoor, hoe gaat het bij jou? Geen druk, ik vroeg me gewoon af of het bericht goed was aangekomen 😊"

2. PEILEN (na de info-link):
"Hé Linda 🥰 wat sprak je het meeste aan van wat je tot nu hebt gezien? Ben benieuwd!"

3. STILLE PROSPECT (gesprek dat is stilgevallen):
"Hé Jaap, ik zag dat je niet meer had gereageerd op mijn laatste berichtje. Is dat omdat je druk was of omdat je geen interesse hebt op dit moment? Allebei prima hoor, ik dacht: ik vraag het even! 🙂"

DE LANGSPEELPLATEN-REGEL:
Een prospect die NU geen ja zegt, kan over 3 maanden alsnog ja zeggen. Of over 1 jaar. Houd ze warm, hou ze vriendelijk, en blijf in hun leven via je gewone content (geen pitches in de DM). Dan ben je top-of-mind als hun situatie verandert. "Niet jagen, niet smeken, wel richting geven", zo noemen topcoaches in netwerk-marketing het.`,
    waaromWerktDit: {
      tekst:
        "Niet jagen, niet smeken, wel richting geven. Gemiddeld 5 exposures, dat is gewoon de statistiek.",
    },
  },

  {
    nummer: 7,
    titel: "🎉 Week 1 zit erop! Tijd voor een rustige reflectie",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag7-review",
        label: "Vul de wekelijkse review in (5 min reflectie)",
        uitleg:
          "Drie vragen: wat ging goed deze week, wat liep niet soepel, waar focus ik volgende week op? Aan het eind kun je kiezen of je de review met je sponsor wilt delen, zodat hij of zij weet hoe je ervoor staat en waar je in kan groeien.",
        verplicht: true,
        actieRoute: "/statistieken",
      },
      {
        id: "dag7-rust-5",
        label: "5 uitnodigingen (iets rustiger, het is review-dag)",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 uitnodigingen vandaag, iets rustiger want het is review-dag. Mix warm + lauw zoals je gewend bent. Open Namenlijst → klik op prospect → 'Uitnodigen'.",
      },
      {
        id: "dag7-followups-3",
        label: "3 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "3 mensen die eerder een invite/info hebben gehad, vandaag een korte check-in. Open Namenlijst → kies prospect → 'Follow-up' of vraag de Mentor: 'Help me met een follow-up voor [naam]'. Niet 'heb je al beslist?' maar 'hoe gaat 't?'.",
      },
      {
        id: "dag7-sponsor-call",
        label: "15 min call met sponsor over week 2",
        uitleg: "Wat werkte? Wat gaan we anders doen? Wat is week 2?",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: 'dag7-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag7-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 1 afgerond. Heb je je 2 one-pager-momenten? Mooi. Zo niet: ze schuiven door. Focus blijft hetzelfde.",
    waarInEleva: [
      {
        actie: "Wekelijkse review",
        menupad: "Menu → Statistieken → Wekelijkse review",
        route: "/statistieken",
      },
      {
        actie: "Week 1 statistieken",
        menupad: "Menu → Statistieken → Week 1",
        route: "/statistieken",
      },
    ],
    watJeLeert: `Een wekelijkse review is geen rapportcijfer, het is een KOMPAS-CHECK. 5 minuten reflectie scheelt je 5 dagen dwaling. Niet voor je sponsor, voor jezelf, om te zien waar je staat versus waar je heen wilt.

DRIE VRAGEN DIE WERKEN (en die ELEVA voor je voorlegt):
1) WAT GING GOED? Eerlijk, klein én groot. "Ik heb 3 invites verstuurd" is een win. "Ik durfde mijn beste vriend uit te nodigen" is óók een win, maar van een andere soort. Beide tellen.
2) WAT LIEP NIET SOEPEL? Geen oordeel, geen "ik ben gewoon niet goed in dit". Wat ging er onhandig? Welke uitnodiging stuurde ik niet uit angst? Welk berichtje liet ik 4× herschrijven voor ik op verzenden klikte? Daar zit volgende week je oefening.
3) WAAR FOCUS IK VOLGENDE WEEK? Eén ding. Niet drie. EÉN ding waar je in groeit. Kan zijn: doorvragen na een nee. Kan zijn: 1 dag dichterbij komen aan je dagelijkse aantallen. Kan zijn: durven 3-weg starten met een lauwe prospect.

DE INHAAL-REGEL, voor als je een dag over hebt geslagen:
• 1 dag stilte = geen drama. Iedereen heeft een dipje. Volgende dag pak je weer op.
• 2 dagen stilte = actie nodig. Niet schamen, niet "ik begin maandag opnieuw", vandaag start je weer, met +50% aantallen om de gemiste dag in te halen.
• Geen schuldgevoel-spiraal. Eén overgeslagen dag = data, geen oordeel.

WAT NIET SOEPEL LIEP = GROEI, GEEN FALEN:
Als je deze week 7 dagen geleden iets compleet nieuws bent gestart, is onhandigheid op dag 1 logisch. En iets meer vlotheid op dag 7. Dát is het volledige plaatje. De mensen die uiteindelijk doorbreken in dit vak zijn niet degenen die in week 1 alles vlekkeloos deden, die bestaan niet, maar degenen die week 2 bleven oefenen op wat in week 1 niet soepel ging.

WAT GA JE VOLGENDE WEEK ZIEN (sneak peek voor dag 8-14):
• Lat omhoog: 10 uitnodigingen per dag in plaats van 5
• 3-weg-gesprekken, je gaat ze ECHT doen, niet alleen kennen
• One-pager versus presentatie, wanneer wat
• Tweede laag aanbieden als de business-laag niet past (een gratis webshop met productgebruik kan ook)
• FORM, hoe je iemand écht leert kennen in een kort gesprek

DEZE REVIEW KAN JE DELEN MET JE SPONSOR (zelfde keuze maak je aan het eind van het invul-formulier). Niet om te beoordelen, om te ondersteunen. Sponsor ziet wat niet soepel ging, kan jou specifiek helpen waar het niet soepel loopt. Niet zwijgen, niet polijsten, eerlijk neerzetten levert je de beste hulp.`,
    waaromWerktDit: {
      tekst:
        "Vergelijk jezelf met gisteren, niet met anderen. De run is jouw verhaal, de review is hoe je het schrijft.",
    },
  },

  // ============================================================
  // WEEK 2, MOMENTUM (dag 8-14)
  // ============================================================
  {
    nummer: 8,
    titel: "🚀 Snelheid wint van perfectie",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag8-invites-10",
        label: "10 uitnodigingen vandaag",
        uitleg:
          "Helft via directe message, helft via scripts uit ELEVA. Mix warm (mensen die je kent) met lauw (mensen uit je telefoonlijst met wie je niet vaak praat).",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag8-followups-5",
        label: "5 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen die eerder gehoord hebben, vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
      },
      {
        id: 'dag8-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag8-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
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
    watJeLeert: `In week 1 leerde je HOE het werkt. In week 2 gaat het om EFFICIËNTIE. Vandaag leer je de belangrijkste verschuiving die de meeste netwerkers missen: snelheid wint van perfectie. Wat je in jouw tempo (Fundament, Bouwen of Doorbreken) per dag uitnodigt is niet veranderd, maar HOE je het verstuurt wel.

DE GOUDEN ANKERZIN

"Perfect is de vijand van verzonden."

Een onhandige uitnodiging die WEG is presteert oneindig veel beter dan de perfecte uitnodiging die nog op je telefoon staat in concept. Vandaag is GEEN redactie-dag, vandaag is doorpakken-dag in jouw eigen tempo.

DE VUISTREGEL, 30 TOT 60 SECONDEN

Max 30 tot 60 seconden bedenktijd per uitnodiging. Daarna druk je op verzenden. Geen herlezen, geen overdenken. Als je 5 minuten staart naar één bericht, kopieer een ELEVA-script en pas alleen de naam aan.

Waarom dit werkt: jouw brein wordt na 60 seconden niet beter in 'm formuleren, het wordt alleen banger om verkeerd over te komen. Dat is geen kwaliteit-redactie, dat is uitstel-gedrag verkleed als zorgvuldigheid.

DE WET VAN GROTE GETALLEN (Nederlandse netwerk-praktijk)

• Van 10 uitnodigingen → 4 tot 6 reacties
• Van 5 reacties → 2 tot 3 kijkmomenten (one-pager of 3-weg)
• Van 3 kijkmomenten → 1 ja, 1 not-yet, 1 nee

Dat is normaal. Niet teleurstellend, niet rooskleurig. Het is gewoon wat het is. Hoe sneller je je dagelijkse uitnodigingen wegstuurt, hoe sneller deze cyclus voor jou begint te tellen.

DE PRAKTIJK, EEN TIMER-UITDAGING

Zet een timer van 10 minuten op je telefoon zodra je aan stap C (uitnodigingen) begint. Kijk hoeveel uitnodigingen je in die 10 min kunt versturen volgens de 4-stappen-formule. Geen herlezen, geen perfectie. Dit traint je in snelheid.

VEELGEMAAKTE FOUTEN

✗ Elke uitnodiging compleet uniek willen schrijven → kost 30 minuten per stuk, je haalt nooit je tempo-doel.
✗ Bang zijn voor 'spam-gevoel' en daarom maar half doen → spam is 100 generieke berichten. Persoonlijke berichten aan mensen die jou kennen is geen spam, ook niet als er 10 of 15 op een dag zijn.
✗ Wachten tot je 'in de stemming' bent → je raakt nooit in stemming. Je doet het en de stemming volgt.
✗ Direct na geen reactie afschrijven → 24-48u wachten, dan follow-uppen (zie dag 6).

MIX WARM EN LAUW

Verdeel je uitnodigingen ongeveer half warm (mensen die je goed kent) en half lauw (telefoon-contacten waarmee je 6+ maanden niet hebt gesproken). De warmen geven snelle reacties, de lauwen geven verrassingen, vaak juist daar zitten je beste matches.`,
    waaromWerktDit: {
      tekst: "Snelheid wint. Snel handelen verslaat perfect handelen, altijd.",
    },
  },

  {
    nummer: 9,
    titel: "💪 3-weg-meesterclass: 5 stappen die werken",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag9-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag9-followups-5",
        label: "5 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen die eerder gehoord hebben, vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
      },
      {
        id: 'dag9-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag9-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
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

DE PSYCHOLOGISCHE HEFBOOM, waarom 3-weg werkt:
1) Sponsor brengt AUTORITEIT (langere ervaring, meer mensen geholpen, eigen track-record).
2) Jij brengt VERTROUWEN (de prospect kent jou, niet de sponsor).
3) Prospect ziet TWEE mensen die al samenwerken → "blijkbaar werkt dit echt".
Geen van de drie alléén kan dit. Het is de combinatie.

DE 5 STAPPEN, letterlijk in deze volgorde, ELEVA heeft ze allemaal als script:

STAP 1, AANKONDIGING (jij naar prospect, vóór groepje):
"Hé [naam], ik maak even een groepje aan met mijn mentor [sponsor], want ik kan het zelf nog niet zo goed uitleggen 😄. Zij doet dit al [periode] en kan met je meekijken en je vragen beantwoorden 🥰"
WAAROM: geen verrassing, prospect verwacht het, sponsor mag binnenkomen.

STAP 2, INTRODUCTIE IN HET GROEPJE (jij):
"Hi [prospect]! 😊 Dit is [sponsor], mijn mentor in dit traject. Ze doet dit al [periode] en heeft fantastische resultaten behaald. [Sponsor], dit is [prospect]. Ze is op zoek naar [situatie]. Wil jij haar even verder helpen? 🙏"
WAAROM: edifieert sponsor, geeft prospect-context aan sponsor, vraagt sponsor expliciet om de leiding te nemen.

STAP 3, JIJ STAPT TERUG ⚠️ DEZE STAP IS DE LASTIGSTE:
Zwijg. Niet meepraten. Niet "aanvullen". Sponsor is nu expert, jij bent student. Wachten tot sponsor jou expliciet iets vraagt.
WAAROM: zodra jij blijft praten, ondermijn je de autoriteit van sponsor en wordt het weer een 1-op-1 gesprek.

STAP 4, SPONSOR OPENT (sponsor doet dit, geef 'm dit script vooraf):
"Hé [prospect]! Wat leuk dat [teamlid] ons koppelt 🥰 Ik heb even gelezen wat er speelt, herkenbaar! Vertel eens, hoe lang speelt dit al en wat heb je tot nu toe geprobeerd?"
WAAROM: rapport bouwen vóór pitch, sponsor leert eerst over de prospect.

STAP 5, FOLLOW-UP (jij naar prospect, apart, binnen 24u):
"Hé [naam] 😊 Wat sprak je het meeste aan van wat je tot nu toe gehoord hebt? 🥰"
NOOIT: "Wat vond je ervan?" → vraagt mening, zet prospect als beoordelaar.
WAAROM: focus op WAT positief was, opent de volgende exposure.

EDIFICATION, VANDAAG OPGEFRIST, DAG 18 GAAT JE EIGEN ZIN PERFECTIONEREN:
Voor een sterke 3-weg moet stap 2 ALTIJD een edifying zin bevatten over je sponsor. Op dag 18 schrijf je je eigen vaste edification-zin. Voor nu: gebruik een simpele "die al X jaar mensen helpt met Y, en degene die mij heeft geholpen met Z", zelfs een eerste versie is veel sterker dan geen.

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
    },
  },

  {
    nummer: 10,
    titel: "🤝 Vandaag start je je eerstvolgende 3-weg",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag10-3weg-1",
        label: "Start minstens 1 3-weg gesprek deze week (vandaag of morgen)",
        uitleg:
          "Heb je al 1 op dag 4 gedaan? Top, vandaag een tweede plannen. Nog niet? Start nu. Kies 1 warme prospect, stuur de aankondiging (stap 1 script), maak groepje met sponsor. Volg de 5 stappen.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag10-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag10-followups-5",
        label: "5 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen die eerder gehoord hebben, vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
      },
      {
        id: 'dag10-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag10-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
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

DE KRITIEKE STAP, STAP 3, JIJ STAPT TERUG:
Dit is het stuk waar de meeste netwerkers struikelen. Na je introductie in het groepje (stap 2) moet je STIL ZIJN. Niet meepraten, niet aanvullen, niet "ja precies" sturen. Sponsor is nu expert, jij bent student. Je voelt de drang om te helpen, dat is normaal, maar elke keer dat jij praat, ondermijn je de autoriteit van sponsor.

Vuistregel: schrijf 50% minder berichten in het groepje dan je zin hebt om te schrijven. Vuist regel: alleen reageren als sponsor of prospect JOU expliciet aanspreekt. Anders: emoji's geven mag (👍🥰), tekstantwoorden geven mag NIET.

WAT JE VANDAAG CONCREET DOET:
1. Open je namenlijst en kies 1 warme prospect die nog geen 3-weg heeft gehad.
2. Stuur stap 1 (aankondiging) naar de prospect, uit ELEVA, dus geen typewerk.
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

NA AFLOOP, 5 MIN MET JE SPONSOR DEBRIEFEN:
Wat ging goed? Wat liep niet soepel? Welke prospect-vraag bracht je sponsor in moeilijkheden? Volgende keer doen we wat anders? Dat is hoe je 3-weg-vaardigheid in 5-10 gesprekken naar tweede natuur bouwt.

Doel deze week: minimaal 1 3-weg starten. Heb je 'm op dag 4 al gehad? Top, plan vandaag een tweede. Nog geen? Vandaag is jouw moment.`,
    waaromWerktDit: {
      tekst:
        "Je eerste 3-weg gaat onhandig voelen. Dat hóórt. De vijfde voelt natuurlijk. Alleen door te doen kom je daar.",
    },
  },

  {
    nummer: 11,
    titel: "🎯 One-pager of presentatie? Vandaag leer je kiezen",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag11-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag11-followups-5",
        label: "5 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen die eerder gehoord hebben, vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
      },
      {
        id: 'dag11-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag11-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
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

DE TWEE TOOLS, wanneer wat:

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

DE GOUDEN REGEL, NIEMAND SLAAT EEN STAP OVER:
Verleiding nr 1: een warme oude vriend meteen een hele presentatie geven, "want hij zal het wel snappen". Resultaat? Hij wordt overspoeld, raakt verward, zegt "geef me een paar dagen om na te denken", en je hoort 'm nooit meer.

Verleiding nr 2: aan iemand die al twee weken vol enthousiasme reageert nóg eens "even een one-pager" geven. Resultaat? Frustratie, verlies van momentum.

Wat WEL: pipeline volgen. Iedereen → one-pager → presentatie/3-weg → beslissing. Geen sprongen, geen omleidingen.

CONCREET, HERKENNINGSPATRONEN:
Stuur ONE-PAGER als prospect zegt:
• "Vertel eens wat het is."
• "Wat doe je eigenlijk?"
• "Klinkt interessant, stuur maar door."

Stuur PRESENTATIE / start 3-weg als prospect zegt:
• "Ik wil hier echt meer van weten."
• "Hoe verdien je hier dan aan?"
• "Wat zou ik dan moeten doen?"
• "Past dit bij wat ik nu al doe?"

DE TUSSENSTAP-ZIN, als one-pager bekeken is:
"Top dat je het bekeken hebt 🥰 Wat sprak je het meeste aan?, Daar kan mijn mentor [naam] perfect bij helpen, ze doet dit al [periode] en heeft veel mensen verder geholpen. Zal ik even een groepje aanmaken?"

VEELGEMAAKTE FOUTEN:
✗ Telefoongesprek met "snelle samenvatting" geven → werkt nooit, je verkoopt jezelf in plaats van het systeem.
✗ Te vroeg presentatie aanbieden bij iemand die nog "even kijkt" → opjagen.
✗ Te lang op one-pager-fase blijven hangen → prospect verliest interesse, escalatie nodig.
✗ Pipeline niet bijwerken in ELEVA → je vergeet wie waar zit, mensen vallen door de mand.

KIJK VANDAAG NAAR JE PIPELINE: hoeveel mensen op "Uitgenodigd"? Hoeveel op "One-pager"? Hoeveel op "Presentatie"? Waar zit de bottleneck, daar is je werk.`,
    waaromWerktDit: {
      tekst:
        "De presentatie bereikt alleen zijn volle kracht als het fundament eronder klopt.",
    },
  },

  {
    nummer: 12,
    titel: "🔄 Nee op business? Bied de webshop of producten aan",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag12-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag12-followups-5",
        label: "5 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen die eerder gehoord hebben, vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
      },
      {
        id: "dag12-pivot-1",
        label:
          "Als iemand 'nee' zei op business: probeer een product-pivot vandaag",
        uitleg:
          "Maak via de coach een pivot-bericht: 'Helemaal goed, geen probleem. Ken je iemand die last heeft van X? Of wil je het zelf eens een maand proberen?' Zet ze dan op pipeline-fase Shopper.",
        verplicht: false,
        actieRoute: "/namenlijst",
      },
      {
        id: 'dag12-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag12-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
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
• Lifeplus-producten zijn op zichzelf staande gezondheidsoplossingen, geen "verkooptrucs voor de bonus".
• Een Shopper die de producten 3-6 maanden gebruikt, heeft tijd om resultaten te ervaren ZONDER businessdruk.
• Veel Shoppers worden 6-12 maanden later alsnog member, niet omdat je ze opnieuw "pitch" maar omdat ze van binnenuit hebben gezien dat het werkt, en dan komen ze meestal zelf terug.
• Bonus: Shoppers vertellen vaak vrienden over de producten zonder dat jij iets hoeft te doen → indirecte uitnodigingen.

DE PIVOT-FORMULE, drie stappen, in deze volgorde:

1) ERKEN ZONDER DRUK:
"Helemaal goed dat dit niet bij je past, geen probleem 🥰. Iedereen heeft z'n eigen pad."
GEEN "ja maar..." of "weet je wel zeker...", dat klinkt als drammen.

2) HAAK NAAR GEZONDHEID/ENERGIE:
"Trouwens, want we hadden het er ooit over, hoe gaat het bij jou met [klacht/wens]?"
Of als je de klacht niet kent: "Maar wil ik nog wat anders vragen, hoe gaat het bij je qua [energie / slaap / gezondheid / sport]?"

3) STEL DE PRODUCT-MOGELIJKHEID VOOR:
"Er zijn een paar producten die we gebruiken die hier echt verschil mee maken. Wil je het eens een maand proberen, vrijblijvend, en kijken hoe je je voelt? Geen verplichting."

DRIE VOORBEELDEN, VERSCHILLENDE INVALSHOEKEN. Let op: spreek vanuit je eigen ervaring, niet als productclaim. Dat houdt het integer en juridisch veilig (EU-regelgeving voor voedingsclaims).

1. Energie / slaap (eigen ervaring):
"Helemaal goed dat de business-kant niet past, dat snap ik. Maar ik wilde nog vragen: hoe gaat het bij jou met energie en slaap? Ik gebruik zelf een paar dingen die voor mij echt verschil hebben gemaakt. Wil je dat ik je laat zien wat ik gebruik en hoe ik 't ervaar? Geen druk, gewoon delen."

2. Darmen (eigen ervaring):
"Top dat je eerlijk bent over de business 👍🏽. Andere vraag: vorig jaar zei je iets over darmen die je laten merken, speelt dat nog? Ik volgde zelf een programma waar ik veel baat bij had. Lust je daar wel info over?"

3. Sport / herstel (eigen ervaring):
"Geen probleem dat je nu niet de business-kant ziet 🥰. Je sportte toch nog steeds intensief? Er zijn een paar dingen die ik zelf gebruik die mij echt helpen met herstel. Wil je een keer dat ik je laat zien wat ik gebruik?"

WEBSHOP-LAAG ALS EXTRA OPENING:
Naast de product-pivot kun je ook de webshop-laag noemen. Iemand die wel producten wil maar niet de business-kant, kan zelfs zijn eigen gratis webshop krijgen door zelf te bestellen, zonder zich met opbouwen bezig te houden. Dat is een lichtere instap dan "member worden" en geeft de prospect ruimte:
"Mocht je toch wel productgebruiker willen worden, je kan zelfs een eigen gratis webshop krijgen door je eigen producten te bestellen. Geen verplichting tot meer, gewoon de manier waarop ik m'n eigen spullen ook bestel."

VEELGEMAAKTE FOUTEN:
✗ Direct na "nee op business" pitchen op product → te abrupt, voelt manipulatief.
✗ De pivot vergeten en gewoon afsluiten → je verliest een Shopper-kandidaat.
✗ Druk leggen na de pivot ("wil je 't echt niet proberen?") → break van vertrouwen.
✗ Geen herinnering aanmaken voor +21 dagen → 3 weken later weet je niet meer dat hij Shopper-kandidaat was.
✗ Tegen Shopper de business pas weer aankaarten → laat het BIJ ZICHZELF komen, niet jij weer met de pitch.

WAT JE VANDAAG DOET:
1. Heb je iemand die deze week "nee" zei op business? Stuur een pivot-bericht (Coach helpt).
2. Pas de pipeline-fase aan in ELEVA: Shopper.
3. Maak een herinnering aan voor +21 dagen: "[naam], hoe bevallen de producten?"
4. Stop de business-vraag voor minstens 3 maanden, laat ze het ervaren.

EXTRA WAARDE: zeg nee tegen drammen, ja tegen warmte. Een Shopper die jou over een jaar terugbelt is zilver. Een Shopper die je nu hebt overlast en wegjaagt is verlies.`,
    waaromWerktDit: {
      tekst:
        "Nee nu is geen nee voor altijd. Blijf warm, blijf in hun leven, wees waardevol. Dan ben je de eerste die ze bellen als de situatie verandert.",
    },
  },

  {
    nummer: 13,
    titel: "🎙️ FORM: leer iemand écht kennen in 5 minuten",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag13-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag13-followups-5",
        label: "5 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen die eerder gehoord hebben, vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
      },
      {
        id: "dag13-form-1",
        label: "Gebruik FORM bewust in minstens 1 gesprek vandaag",
        uitleg:
          "Family, Occupation, Recreation, Money. Stel in elk gesprek 1 vraag uit elke categorie en luister naar 'haken' (pijnpunten, wensen).",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag13-koud-warm",
        label: "1 koude prospect warm maken vóór de invite",
        uitleg:
          "Kies iemand uit je telefoonlijst met wie je weinig contact hebt. Eerst even een FORM-vraag (zonder pitch), reageer 1-2 dagen op hun socials, dán pas invite. Vraag de Mentor: 'Help me [naam] warm maken vóór ik 'm uitnodig, context: [situatie]'. De Mentor schrijft een opwarm-tekst die geen pitch is.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: 'dag13-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag13-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
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
    watJeLeert: `FORM is dé manier om in elk gesprek rapport te bouwen zonder dat het een verhoor wordt. Vier categorieën, één voor één gesteld als oprechte interesse, niet als checklist. Brookes-techniek, 60+ jaar bewezen.

FORM = FAMILY · OCCUPATION · RECREATION · MONEY

F, FAMILY: "Wie hoort er bij jou? Hoe gaat het thuis?"
Voorbeelden: "Hoe oud zijn de kinderen nu?", "Hoe gaat het met je partner?", "Heb je nog familie in Nederland?"
WAT JE LUISTERT VOOR: drukke gezinsroutine, zorgen om kinderen, ouders die ouder worden, gezondheidszorgen in familie.

O, OCCUPATION: "Wat doe je nu, en hoe bevalt het?"
Voorbeelden: "Hoe is het werk de laatste tijd?", "Wat zou je veranderen als je kon?", "Heb je nog plezier in wat je doet?"
WAT JE LUISTERT VOOR: vermoeidheid, frustratie, verlangen naar iets anders, financiële druk, geen vrijheid.

R, RECREATION: "Wat doe je graag, waar krijg je energie van?"
Voorbeelden: "Sport je nog?", "Wat doe je in het weekend?", "Wat doe je voor jezelf?"
WAT JE LUISTERT VOOR: gezondheidsambitie, gemis van tijd voor zichzelf, verlangen om weer te beginnen met X.

M, MONEY: "Hoe tevreden ben je met de financiële kant?"
Voorbeelden: "Loopt het financieel zoals je wilt?", "Was er iets dat je extra zou willen kunnen?", "Werkt je salaris/inkomen mee?"
NB: M is gevoelig, alleen na vertrouwen, never als eerste. Soms helemaal overslaan en vervangen door "hoe ziet je toekomst eruit?"
WAT JE LUISTERT VOOR: schulden, geen extra ruimte, kan geen vakantie meer, "als ik meer had..."

DE GOUDEN REGEL, JIJ PRAAT 30%, ZIJ 70%:
Mensen praten graag over zichzelf als ze voelen dat je écht luistert. Stel je vraag, wacht het antwoord af, vraag DOOR ("vertel eens meer..."), maak NOTIE. Pas als je echt rapport hebt en iemand een "haak" laat vallen, mag je een tussenstap richting uitnodiging maken.

DE HAKEN, luister actief naar deze zinnen:
• "Ik zou willen dat..."
• "Ik mis nog..."
• "Als ik meer tijd/geld had..."
• "Het is wel veel hoor..."
• "Ik weet niet of dit nog kan blijven zo..."
• "Ja, weet je, ik ben er klaar mee."
DAAR zit je opening. Niet eerder.

KOUD NAAR WARM, het echte werk in dit vak:
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
    },
  },

  {
    nummer: 14,
    titel: "🏁 Halverwege! Week 2 review, welk patroon zie je?",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag14-review",
        label: "Wekelijkse review invullen",
        verplicht: true,
        actieRoute: "/statistieken",
        uitleg:
          "5 minuten reflectie: wat ging goed, wat liep niet soepel, waar focus ik volgende week op? Open /statistieken voor de review-vragenlijst. Je sponsor krijgt automatisch een korte samenvatting.",
      },
      {
        id: "dag14-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag14-followups-5",
        label: "5 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "5 mensen die eerder gehoord hebben, vandaag check-in. Open Namenlijst → klik op prospect → 'Follow-up'. Houd 't kort en vriendelijk.",
      },
      {
        id: "dag14-pipeline-check",
        label: "Bekijk je hele pipeline: wie zit waar?",
        uitleg:
          "Open namenlijst in pipeline-weergave. Hoeveel in 'Uitgenodigd', 'One-pager', 'Presentatie'? Waar stokt het?",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag14-sponsor-call",
        label: "Sponsor-call 15 min: week 3 voorbereiden",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: 'dag14-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag14-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 2 afgerond. Hoeveel presentatie-momenten staan er in je agenda? Pakken we in week 3 door, follow-up wordt leidend.",
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

DE BOTTLENECK-REGEL, kijk waar de meeste prospects "vastliggen":

Veel op UITGENODIGD (ze reageren niet of zeggen direct nee):
→ Probleem zit in de UITNODIGING zelf. Vandaag 4-stappen herzien (dag 4). Mentor: "schrijf een uitnodiging variant voor [type prospect]", leer 3 verschillende stijlen.

Veel op ONE-PAGER (bekeken, geen reactie meer):
→ Probleem zit in de FOLLOW-UP. Te lang stil, of te direct doorvragen. Vandaag dag 6 reviseren, de 5-fasen follow-up.

Veel op PRESENTATIE / 3-WEG (kijken wel maar nemen geen beslissing):
→ Probleem zit in het CLOSING-werk. Doel-Tijd-Termijn (dag 17) is wat dat oplost.

Stok je nergens en is alles beweging maar geen "ja's"?
→ Volume is OK, conversie is werk. Vraag sponsor om mee te kijken naar 2-3 specifieke gesprekken.

DE 3 GROOTSTE INZICHTEN UIT WEEK 1+2, schrijf op:
1. Welk type prospect reageert het beste? (warm/lauw/koud, leeftijd, geslacht, situatie)
2. Welke openingszin werkt het sterkst voor JOU?
3. Welke fase van je pipeline is het dunst, daar gaat week 3 over.

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
    },
  },

  // ============================================================
  // WEEK 3, RITME (dag 15-21)
  // ============================================================
  {
    nummer: 15,
    titel: "⏱️ Ritme-week: follow-up is nu je hoofdwerk",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag15-followups-10",
        label: "10 follow-ups, het is follow-up-week",
        uitleg:
          "Iedereen die je in week 1-2 hebt uitgenodigd maar nog geen beslissing heeft genomen = follow-up. Niet drammen, wel aanwezig zijn.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: "dag15-invites-10",
        label: "10 nieuwe uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: 'dag15-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag15-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
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
    watJeLeert: `Follow-up is geen aanhangsel van het werk, follow-up IS het werk. 80% van alle "ja's" komen pas op contactmoment 3 t/m 5, niet op het eerste. Vanaf vandaag schuift je gewicht: minder nieuwe uitnodigingen, meer mensen warm houden die al uitgenodigd zijn.

DE STATISTIEK, waarom dit klopt:
• Op contact 1 ("ik heb de info bekeken") nemen weinig mensen al een beslissing.
• Op contact 2-3 (paar dagen later, kort doorgevraagd) zegt ~30% iets concreets.
• Op contact 4-5 (na 1-2 weken) komt de meerderheid van de definitieve "ja" of "nee".
Wie alleen contact 1 heeft, verliest dus 70% van zijn echte beslissingen.

DE GOLD QUESTION, werkt op vrijwel iedereen:
"Hoe kijk je er nu naar, na een paar dagen?"
• Open vraag (geen ja/nee)
• Geen beoordeling ("vond je het goed?" → opent kritiek)
• Geen druk ("heb je al beslist?" → forceer)
• Zacht maar serieus, toont dat je nog meelevend bent zonder te jagen

10 FOLLOW-UPS IN 30 MIN, werkwijze vandaag:
1. Open je Herinneringen-lijst, sorteer op vervaldatum.
2. Per persoon: kijk waar ze in de pipeline staan (Uitgenodigd / One-pager / Presentatie / Shopper / Not-yet).
3. Stuur het juiste fase-bericht (zie dag 6 voor de 5-fasen flow).
4. Niet langer dan 1-2 minuten per persoon, als je niet weet wat te schrijven, vraag de Coach.
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
✓ Vragen wat hem WEL aansprak, dan focus op dat.
✓ Een tussenstap aanbieden: "wil je een keer met mijn mentor in een groepje praten?"
✓ Eerlijk zijn over je eigen positie: "ik weet niet of dit voor jou past, ben benieuwd waar jij staat."

DE LANGSPEELPLATEN-REGEL HERHAALD:
Een nee NU is geen nee voor altijd. Iemand op "Not-yet" zetten is geen verlies. Houd ze warm, blijf zichtbaar in hun leven via gewone content, en ze komen vaak 6-12 maanden later alsnog terug, meestal zelf, met een vraag.`,
    waaromWerktDit: {
      tekst:
        "De fortuin zit in de follow-up. Eerste contact plant het zaadje. Follow-up water geeft.",
    },
  },

  {
    nummer: 16,
    titel: "🎯 5 types prospects, energie waar 't telt",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag16-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag16-followups-10",
        label: "10 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 follow-ups vandaag, het is follow-up-week, hier zit de oogst. Loop je pipeline door (Namenlijst → Pipeline) en stuur per persoon een passend bericht. Mentor helpt: 'Schrijf een follow-up voor [naam] die [status]'.",
      },
      {
        id: "dag16-categoriseer",
        label: "Categoriseer je top-20 prospects in de 5 types",
        uitleg:
          "Actief zoekend, open, productkoper, niet-nu, nooit. Dit bepaalt hoeveel energie je ergens aan besteedt.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: 'dag16-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag16-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
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
    watJeLeert: `Niet elke prospect is gelijk. Wie iedereen op dezelfde manier benadert, raakt uitgeput op de mensen die nooit gaan ja zeggen, en mist de mensen die WEL klaar zijn, omdat hij dezelfde lauwe energie geeft. De 5 types helpen je je energie goed verdelen.

DE 5 TYPES (Worre-classificatie):

1) ACTIEF ZOEKEND, DIRECT PRESENTEREN
Wie: mensen die NU op zoek zijn naar iets nieuws (verloren werk, scheiding, kind geboren, business gestopt, gezondheidsschrik).
Signalen: "Ik zoek al een tijdje naar iets...", "Ik wilde net beginnen met...", "Wat doe jij eigenlijk?"
Aanpak: GEEN tijd verspillen aan rapport-bouwen. Direct presentatie of 3-weg, vandaag liefst. Hun moment is NU.
Energie: HOOG.

2) OPEN, INVESTEER TIJD
Wie: mensen die niet actief zoeken maar wél nieuwsgierig zijn als jij iets brengt.
Signalen: vragen door, willen meer weten, blijven in contact zonder dat jij stuwt.
Aanpak: rapport bouwen, FORM-vragen stellen, langzaam exposeren. 3-5 contactmomenten. Ze nemen een echte beslissing als ze klaar zijn.
Energie: HOOG (groei).

3) PRODUCTKOPER, SHOPPER-FLOW
Wie: geen business-interesse, maar wel openstaan voor product-ervaring.
Signalen: "De business is niets voor mij, maar dat product klinkt wel interessant."
Aanpak: pivot naar product (zie dag 12). Zet ze op Shopper, herinnering +21 dagen. Soms worden ze 6-12 maanden later alsnog member.
Energie: GEMIDDELD (lange termijn).

4) NIET-NU, TIMING KLOPT NIET, WARM HOUDEN
Wie: interesse aanwezig, maar leven zit nu in iets anders (verhuizing, ziekte familie, vaste baan-wissel).
Signalen: "Klinkt mooi, maar nu is niet het juiste moment voor mij."
Aanpak: erkennen, GEEN drang, herinnering +3 maanden. Houd warm contact via gewone communicatie (niet pitchen).
Energie: LAAG (onderhoud).

5) NOOIT, ERKEN EN LAAT LOS
Wie: principiële nee. Soms uit ervaring met netwerkmarketing, soms uit waardenkeuze.
Signalen: stevige nee zonder twijfel, soms agressief, soms beleefd-maar-definitief.
Aanpak: ERKEN warm ("ik snap dat 100%"), LAAT LOS, hou de relatie als vriend/familie. Stop met dit als business-prospect te zien. Energie nul, warmte 100%.
Energie: NUL, voor business. WARMTE-RELATIE: 100%.

DE GROOTSTE FOUT, TYPE 5 BEHANDELEN ALS TYPE 2:
Veel starters blijven hopen op die ene oude vriend die "echt ooit ja gaat zeggen". Hij is type 5. Die uren die je in hem stopt, gaan ten koste van je écht-actief-zoekende prospects. Erken het. Hou hem als persoon. Stop hem als prospect.

ANDERE GROTE FOUT, TYPE 1 BEHANDELEN ALS TYPE 4:
"Ach, hij heeft het druk, ik laat 'm even." Hij is ACTIEF ZOEKEND. Hij gaat starten, bij iemand. Als jij wacht, is dat iemand anders. Reageer SNEL op type 1.

VANDAAG, categoriseer je top-20:
1. Open je namenlijst, pak je top-20 actieve prospects.
2. Per persoon: welk type? Voel het, pas evt. de pipeline-fase aan.
3. Energie-budget volgende week: 70% naar type 1+2, 20% naar type 3, 10% naar type 4. Type 5 = warmte-onderhoud, geen tijd.
4. Onthoud: types kunnen verschuiven. Type 4 kan over 3 maanden type 1 worden, daarom warm houden, niet afschrijven.`,
    waaromWerktDit: {
      tekst:
        "Je gaat nooit iemand overtuigen die niet wil. Je gaat mensen vinden die al op zoek zijn.",
    },
  },

  {
    nummer: 17,
    titel: "🎯 Closing met Doel-Tijd-Termijn, helpen beslissen",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag17-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag17-followups-10",
        label: "10 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 follow-ups vandaag, het is follow-up-week, hier zit de oogst. Loop je pipeline door (Namenlijst → Pipeline) en stuur per persoon een passend bericht. Mentor helpt: 'Schrijf een follow-up voor [naam] die [status]'.",
      },
      {
        id: "dag17-closing",
        label: "Pas Doel-Tijd-Termijn toe bij minstens 1 warme prospect",
        uitleg:
          "Bij iemand die een presentatie heeft gezien en twijfelt: stel de 5 closing-vragen. Dit is niet drammen, dit is helpen beslissen.",
        verplicht: false,
        actieRoute: "/namenlijst",
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
            "Mag ik je 5 korte vragen stellen om te kijken of dit voor jou realistisch is qua tijd en doelen? Geen druk, gewoon eerlijk samen kijken.",
        },
      },
      {
        id: 'dag17-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag17-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Coach helpt met closing voor specifieke prospect",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Help me met closing voor [naam]",
        route: "/coach",
        prefillTemplate:
          "Help me met closing voor [naam]. Wat ik weet: [hun doel / hun bezwaren / fase in pipeline]. Begeleid me door Doel-Tijd-Termijn, wat zeg ik woord voor woord?",
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
    watJeLeert: `Closing is GEEN overtuigen. Closing is HELPEN BESLISSEN. Een prospect heeft vaak alle info al, maar zit vast in twijfel. Goede closing tilt 'm uit de twijfel zonder druk, door zijn eigen motivatie te laten uitspreken in plaats van die van jou.

DE METHODE, DOEL-TIJD-TERMIJN, 5 VRAGEN IN DEZE VOLGORDE:

VRAAG 1, DOEL:
"Hoeveel euro per maand extra zou dit de moeite waard maken voor jou?"
Hier komen ze met een bedrag, 500, 1000, 2500. Dat is HUN motivatie, niet de jouwe.
Niet: "Wat zou je willen verdienen?" → te abstract, krijg je vaak "weet ik niet".

VRAAG 2, TIJD:
"Hoeveel uur per week heb je daar realistisch voor?"
Realistisch is hier het sleutelwoord. Niet "ideaal". Iemand met 3 kinderen en een baan kan niet 20u inzetten, dat moet hij/zij zelf benoemen.

VRAAG 3, TERMIJN:
"Na hoeveel maanden moet dat bedrag er staan?"
Dit creëert urgentie en realisme tegelijk. 3 maanden is meestal te kort, 24 maanden te lang. Reactie van prospect zelf vertelt je waar 'ie zit.

VRAAG 4, VERBINDING:
"Als ik je kan laten zien dat dat realistisch is binnen die uren en termijn, wil je dat dan serieus bekijken?"
Met deze vraag commiteer je hem aan een vervolgstap, NIET aan een aankoop. "Serieus bekijken" is laagdrempelig.

VRAAG 5, START:
"Als dat klopt en goed voelt, starten we dan gewoon?"
"Gewoon" is hier cruciaal. Het maakt het beginnen kleiner dan het in zijn hoofd voelt.

DE KRACHT, MOTIVATIE KOMT VAN HEN, NIET VAN JOU:
Je bent geen drammer, je bent een SPIEGEL. Hun antwoorden op vraag 1-3 zijn een blauwdruk van wat ZIJ willen. Bij vraag 4-5 hoef je niet te overtuigen, je toont alleen een pad terug naar wat ze net zelf zeiden te willen.

DRIE VOORBEELDEN, VERSCHILLENDE PROSPECTS:

1. Drukke moeder die uitgeput werk heeft:
"Mag ik je 5 korte vragen stellen?, Hoeveel extra per maand zou dit voor jou de moeite waard maken?, Hoeveel uur naast je werk en gezin heb je realistisch?, Na hoeveel maanden moet dit er financieel staan zodat het voelt dat het werkt?, Als ik je een plan kan laten zien dat past binnen jouw 5 uur per week en jouw 12-maanden-horizon, wil je daar serieus naar kijken?, Als dat klopt en goed voelt: starten we dan?"

2. Ondernemer die naar diversificatie zoekt:
"Mag ik kort een paar vragen stellen om te kijken of dit past?, Wat zou een nieuw inkomstenpad jou per maand moeten opleveren om het de moeite waard te maken?, Hoeveel uur kun je daar realistisch insteken naast wat je nu doet?, In hoeveel maanden moet dat staan?, Als ik je iets concreets kan laten zien dat past binnen die uren en termijn, wil je dat doornemen?, En als dat klopt: starten we?"

3. Lauwe prospect die nog niets heeft beslist:
"Voor we verder gaan: mag ik 5 vragen stellen om dit goed in jouw situatie te plaatsen? Geen druk, gewoon kijken of het past., Welk maandbedrag zou dit de moeite waard maken?, Hoeveel uur is realistisch?, Welke termijn?, Als wat ik laat zien past binnen die drie, wil je het serieus bekijken?, Als het goed voelt: starten?"

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
    },
  },

  {
    nummer: 18,
    titel: "✨ Edification: de zin die je sponsor laat schitteren",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag18-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag18-followups-10",
        label: "10 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 follow-ups vandaag, het is follow-up-week, hier zit de oogst. Loop je pipeline door (Namenlijst → Pipeline) en stuur per persoon een passend bericht. Mentor helpt: 'Schrijf een follow-up voor [naam] die [status]'.",
      },
      {
        id: "dag18-edification-zin",
        label: "Schrijf jouw eigen edification-zin (5 min)",
        uitleg:
          "Eén vaste zin van max 25 woorden waarmee je je sponsor introduceert in elk 3-weg of bij elke presentatie. Schrijf 'm hieronder direct in, bewaard onder /mijn-zinnen zodat je hem altijd snel kan oppakken.",
        verplicht: true,
        inlineActie: {
          type: "tekst",
          slug: "edification-zin",
          label: "Mijn edification-zin",
          instructie:
            "Volg de formule: 1) wie introduceer je, 2) wat is hun track-record / autoriteit, 3) waarom heb JIJ ze gekozen. Max 25 woorden. Geen overdrijving, gewoon de waarheid, sterk gebracht.",
          placeholder:
            "Bv. Ik ga je voorstellen aan...",
          maxTekens: 280,
          voorbeeld:
            "Ik ga je voorstellen aan Mark, die al 12 jaar mensen helpt om hun energie en ondernemerschap weer terug te vinden, degene die mij heeft laten zien hoe dit echt werkt.",
        },
      },
      {
        id: "dag18-edification-toepassen",
        label: "Pas je edification-zin minstens 1× toe deze week",
        uitleg:
          "Bij je eerstvolgende 3-weg of presentatie: gebruik de zin letterlijk vóór je sponsor introduceert. Niet improviseren, gewoon zeggen.",
        verplicht: false,
        actieRoute: "/namenlijst",
      },
      {
        id: 'dag18-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag18-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Edification-zin laten checken door ELEVA Mentor",
        menupad: "Menu → ELEVA Mentor",
        spraak:
          "Check mijn edification-zin voor sponsor [naam]: ...",
        route: "/coach",
        // Prefill plakt de zin direct in het mentor-invoerveld. Als de
        // member 'm al heeft opgeslagen op /mijn-zinnen, wordt {edification-zin}
        // vervangen door die exacte tekst, anders door "[hier je zin]".
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
    watJeLeert: `Op dag 9 leerde je WAT edification is en deed je het waarschijnlijk met een script-versie van ELEVA. Vandaag, na een paar 3-wegs in praktijk, schrijf je je EIGEN permanente edification-zin, eentje die voelt als van jou, die je voortaan automatisch gebruikt bij elk 3-weg en elke presentatie. Een eigen zin is natuurlijker dan een script, en makkelijker te onthouden in het moment.

WAAROM NU EN NIET OP DAG 9?

Op dag 9 wist je nog niet hoe je sponsor "klinkt" in een echt 3-weg met jouw prospects. Na een paar gesprekken (dag 10-17) heb je dat gevoel wel. Vandaag verwerk je dat in een EIGEN zin die past bij hoe jij je sponsor in echt presenteert. Geen herhaling van dag 9, wel een verdieping.

QUICK RECAP UIT DAG 9 (voor wie even wil opfrissen)

Edification is in 1-2 zinnen vóórdat je sponsor begint te praten:
1) wie het is,
2) wat zijn/haar track-record is (hoe lang, hoeveel mensen geholpen, welke achtergrond),
3) waarom JIJ deze persoon hebt gekozen om je verder te helpen.

Het is GEEN overdrijving. Het is GEEN reclame. Het is de waarheid vertellen, alleen wel scherp opgeschreven, niet gemompeld. De meeste netwerkers laten dit moment slap voorbijgaan ("dit is m'n upline, vertel jij even") en daar verlies je 80% van het effect.

De formule die altijd werkt:
"Ik ga je voorstellen aan [naam], die [autoriteit / track-record], en degene die [persoonlijke link met jou]."

Drie voorbeelden van hetzelfde, op verschillende sponsors:
• Sportcoach-sponsor: "Ik ga je voorstellen aan Mark, die al 12 jaar mensen begeleidt naar meer energie en helderheid, degene die mij heeft laten zien dat dit niet over producten gaat maar over je leven terugpakken."
• Mama-sponsor: "Ik ga je voorstellen aan Linda, moeder van 3, die al 8 jaar duizenden vrouwen helpt om hun lichaam en gezin weer in balans te brengen, degene die mij in 6 maanden van uitgeput naar uitgerust kreeg."
• Ondernemer-sponsor: "Ik ga je voorstellen aan Jaap, die al 15 jaar in dit vak zit en vorig jaar 200 mensen direct heeft ondersteund, degene die mij heeft laten zien dat dit serieus business is, geen hobby."

Veelgemaakte fouten:
✗ Te kort: "dit is m'n upline", je hebt zojuist 0 autoriteit gegeven.
✗ Improviseren: elke keer iets anders zeggen, sponsor weet niet wanneer 'ie kan starten.
✗ Hyped overdrijven: "de allerbeste van Nederland!", prospect ruikt de pitch en sluit af.
✗ Vergeten: gewoon stilletjes je sponsor laten beginnen, geen edification, geen 3-weg.

Wat je vandaag doet: 5 minuten investeren in JOUW vaste zin. Schrijf 'm op, bewaar 'm in /mijn-zinnen, en gebruik 'm letterlijk in de komende 30 3-wegs. Eén keer goed schrijven = honderd keer sterker presenteren.`,
    waaromWerktDit: {
      tekst:
        "Edification is wat een 3-weg een 3-weg maakt. Zonder dat is het gewoon nog een gesprek.",
    },
  },

  {
    nummer: 19,
    titel: "🔍 Pipeline-check, waar lekt je trechter?",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag19-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag19-followups-10",
        label: "10 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 follow-ups vandaag, het is follow-up-week, hier zit de oogst. Loop je pipeline door (Namenlijst → Pipeline) en stuur per persoon een passend bericht. Mentor helpt: 'Schrijf een follow-up voor [naam] die [status]'.",
      },
      {
        id: "dag19-pipeline",
        label: "Pipeline-review: tel per fase + zoek de bottleneck",
        uitleg:
          "Uitgenodigd: X / One-pager: Y / Presentatie: Z / Beslist: W. Waar is de grootste drop-off? Dat is je oefenpunt voor de laatste 40 dagen.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: 'dag19-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag19-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
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
    watJeLeert: `Een goede pipeline lijkt op een trechter: bovenaan veel mensen, naar onderen toe steeds minder. Daar is niets mis mee, dat is het natuurlijke patroon. Wat WEL zegt waar je werk zit: WAAR is de grootste drop-off?

VERWACHTE GEZONDE TRECHTER (na 21 dagen):
• 100 uitnodigingen → 50-70 reacties (50-70%)
• 50-70 reacties → 25-35 one-pager-bekijkers (50%)
• 25-35 one-pager → 10-15 presentaties of 3-wegs (40%)
• 10-15 presentaties → 3-5 beslissingen (30%)
• 3-5 beslissingen = members + shoppers + not-yets

Zit jij ergens veel onder die conversie? Daar is je werk.

DE 4 BOTTLENECKS, herken je patroon:

BOTTLENECK 1, VEEL "UITGENODIGD", WEINIG REACTIE
Symptoom: 60+% reageert niet op je uitnodiging.
Oorzaak: uitnodiging is niet warm/persoonlijk genoeg, of voelt als pitch.
Oefening: dag 4 herzien. 4-stappen-formule. Mentor: "schrijf 3 varianten van mijn standaard-uitnodiging."
40-dagen-fix: 1 week alleen op uitnodigingen oefenen, mix variant 1/2/3.

BOTTLENECK 2, VEEL "ONE-PAGER", WEINIG PRESENTATIE
Symptoom: prospects bekijken de info maar haken daarna af.
Oorzaak: follow-up is te direct of mist focus op WAT ze raakte.
Oefening: dag 6 + dag 15 herzien. 5-fasen follow-up + Gold Question.
40-dagen-fix: tussenstap "wil je eens met mijn mentor in een groepje?" inzetten.

BOTTLENECK 3, VEEL "PRESENTATIE", WEINIG BESLISSING
Symptoom: ze kijken de hele presentatie/3-weg, maar nemen geen beslissing.
Oorzaak: closing is niet gevraagd, je blijft hangen in "exposure".
Oefening: dag 17 (Doel-Tijd-Termijn) + dag 20 (vraag de beslissing).
40-dagen-fix: bij elke 3-weg standaard binnen 24-48u Doel-Tijd-Termijn proberen.

BOTTLENECK 4, TE WEINIG VOLUME ALTIJD
Symptoom: trechter is in proportie OK, maar absolute aantallen te laag.
Oorzaak: je doet niet je dagelijkse aantallen.
Oefening: stap 1 = volume opvoeren. Geen techniek-fix.
40-dagen-fix: 10-10-3 ritme borgen, voor 40 dagen non-stop.

WAT JE VANDAAG DOET:
1. Open Statistieken in ELEVA, schrijf je 4 fase-aantallen op.
2. Identificeer je bottleneck (waar valt je conversie het sterkst weg?).
3. Vraag de Coach om analyse + concrete oefening voor de komende 40 dagen.
4. Schrijf op: 1 specifieke oefening voor 40-dagen-blok.

EERLIJKHEID, DIT IS HET LEER-MOMENT VAN DE 21 DAGEN:
Statistieken zijn je leermeester, niet je rechter. Slechte cijfers betekenen niet "ik ben slecht". Ze betekenen "hier zit nog werk." Iemand die zijn cijfers eerlijk leest, fixt zijn bottleneck binnen 2-3 weken. Iemand die ze ontwijkt, blijft 6 maanden in dezelfde drop-off zitten. Eerlijke pipeline = snelle groei.`,
    waaromWerktDit: {
      tekst:
        "Wat je meet, verbetert. Wat je niet meet, blijft een gevoel.",
    },
  },

  {
    nummer: 20,
    titel: "💪 Vraag de beslissing, de moedigste vraag van je vak",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag20-invites-10",
        label: "10 uitnodigingen",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 mensen uit je lijst uitnodigen voor een kijkmoment. Open Namenlijst → klik op een prospect → 'Uitnodigen', of vraag de Mentor: 'Schrijf een uitnodiging voor [naam]'. Mix warm + lauw, halverwege in 5-10 min als je scripts paraat hebt.",
      },
      {
        id: "dag20-followups-10",
        label: "10 follow-ups",
        verplicht: true,
        actieRoute: "/namenlijst",
        uitleg:
          "10 follow-ups vandaag, het is follow-up-week, hier zit de oogst. Loop je pipeline door (Namenlijst → Pipeline) en stuur per persoon een passend bericht. Mentor helpt: 'Schrijf een follow-up voor [naam] die [status]'.",
      },
      {
        id: "dag20-vraag-1",
        label: "Vraag minstens 1 warme prospect: 'Wat heb je nog nodig om te beslissen?'",
        uitleg:
          "Directe, zachte variant. Niet 'wat vind je?' maar 'wat heb je nog nodig?'. Dit opent de echte twijfel of brengt ze naar beslissing.",
        verplicht: true,
        actieRoute: "/namenlijst",
      },
      {
        id: 'dag20-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag20-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 3 (dag 15-21): minimaal 2 beslissingen binnen: member, shopper of not-yet.",
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
    watJeLeert: `De grootste fout van starters is NIET vragen naar de beslissing. Ze blijven volgen, blijven delen, blijven hopen, soms maandenlang. Het resultaat: prospect raakt overspoeld of vergeet, jij raakt uitgeput, en niemand wordt iets wijzer. Na 3-5 exposures is het tijd om DUIDELIJKHEID te krijgen.

WAAROM "VRAGEN" GEEN DRAMMEN IS:
Drammen = blijven pushen ondanks duidelijk nee.
Vragen om beslissing = de prospect helpen de twijfel om te zetten in iets concreets.
Een prospect die nog hangt heeft last van twijfel, niet van enthousiasme. Door te vragen geef je 'm een uitweg uit zijn twijfel: ja, nee, of "ik heb nog X nodig". Alle drie zijn winst, alleen blijven hangen niet.

DE 3 GOEDE VRAAG-VARIANTEN:

1. ZACHTE VARIANT, VEEL TWIJFEL ZICHTBAAR:
"Wat heb je nog nodig om een goede beslissing te kunnen nemen?"
Open vraag, geen druk. Prospect noemt zelf wat onduidelijk is. Jij vult specifiek in. Als hij niks noemt: "Dan is er niets meer nodig, wil je er nu een knoop over doorhakken?"

2. DIRECTE VARIANT, JE VOELT DAT HIJ ER KLAAR VOOR IS:
"De echte vraag is niet of je iets wilt veranderen, maar of dit het juiste voertuig is. Klopt dat?"
Reframt de keuze van "doe ik dit?" naar "is dit MIJN pad?". Prospect voelt het verschil.

3. PRAGMATISCHE VARIANT, IEMAND DIE GEWOON BESLUITELIG WIL ZIJN:
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
✗ Nooit beslissing vragen, eindeloos volgen → 6 maanden vertraging zonder progressie.

VANDAAG: kies 1 prospect die meer dan 3 exposures heeft gehad zonder beslissing. Vraag VANDAAG of MORGEN voor de beslissing met variant 1 of 3. Whatever de uitkomst, werk de pipeline in ELEVA bij. Beslissing krijgen is winst, ongeacht de richting.`,
    waaromWerktDit: {
      tekst:
        "De enige manier om 'nee' te krijgen is door te vragen. De enige manier om 'ja' te krijgen is door te vragen. Vraag.",
    },
  },

  {
    nummer: 21,
    titel: "🏆 21 dagen klaar! Dit is je startlijn, niet de eindstreep",
    fase: 3,
    vandaagDoen: [
      {
        id: "dag21-review-3",
        label: "Week 3 review invullen",
        verplicht: true,
        actieRoute: "/statistieken",
      },
      {
        id: "dag21-review-21",
        label: "Reflectie: hoe voelt de eerste 21 dagen?",
        uitleg:
          "Wat leerde je over jezelf? Waar groeide je? Wat was moeilijker dan gedacht? Wat bleek makkelijker? Deze reflectie gaat naar je sponsor.",
        verplicht: true,
        actieRoute: "/statistieken",
      },
      {
        id: "dag21-doel-40",
        label: "Stel 1 doel voor de volgende 40 dagen",
        uitleg:
          "Geen vaag doel. Iets concreets. 'Ik wil 5 members meer' of 'Ik wil consistent 10-10-3 blijven draaien'.",
        verplicht: true,
        actieRoute: "/mijn-why",
      },
      {
        id: "dag21-sponsor-call",
        label: "40-min call met sponsor: week 3 afsluiten en blok 2 voorbereiden",
        verplicht: false,
        inlineEmbed: "sponsor-melding",
      },
      {
        id: 'dag21-momentum-radar',
        label: '🎯 Open momentum-acties van vandaag',
        uitleg: `Voordat je de dag afsluit: een kort check-overzicht van de prospects waar nu het meeste momentum zit. Items waar je vandaag al actie op hebt ondernomen vallen vanzelf weg.\n\nGeen lijst? Top. Je hebt je dag stevig afgesloten.`,
        verplicht: false,
        inlineEmbed: 'momentum-radar',
      },
      {
        id: 'dag21-partner-check',
        label: '🤝 Check je nieuwe partner(s) vandaag',
        uitleg: PARTNER_CHECK_UITLEG,
        verplicht: false,
        inlineEmbed: 'partner-check',
      },
    ],
    faseDoel:
      "Week 3 afgerond. Hoeveel beslissingen zijn binnen? Hoeveel pipeline-momentum ligt er? Dag 22 wordt het consolidatie-ritme.",
    waarInEleva: [
      {
        actie: "Week 3 review",
        menupad: "Dashboard → Wekelijkse review",
        route: "/dashboard",
      },
      {
        actie: "Statistieken-overzicht bekijken",
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
    watJeLeert: `Dag 21 is GEEN eindstreep. Het is je STARTLIJN. Je hebt 21 dagen geïnvesteerd in iets nieuws, een vakgebied geleerd, een systeem opgezet, gewoonten ingebouwd, eerste resultaten geboekt. Dat is een fundament. Het echte gebouw zet je in de komende 40 dagen.

WAT JE IN 21 DAGEN HEBT GEDAAN, ERKEN HET:
• Een namenlijst van 100+ mensen aangelegd (was 0)
• Tussen de 100 en 200 uitnodigingen verstuurd
• Bezwaren leren behandelen met Feel-Felt-Found
• 3-weg-gesprekken gestart en gevoerd
• Edification, FORM, Doel-Tijd-Termijn als technieken in je gereedschapskist
• 1-3 beslissingen binnen (member, shopper of not-yet)
Dat is fors meer dan 90% van wie ooit in dit vak begint, in zo'n korte tijd.

WAT NU KOMT, WEEKRITME (DAG 22-60):
Vanaf morgen zet je het systeem in ONDERHOUDS-MODUS. Geen nieuwe technieken meer leren, alleen doen wat je hebt geleerd, dag in dag uit. Vast weekritme:
• MAANDAG, plannen, herinneringen voor de week opnemen, mindset
• DINSDAG, uitnodigen-dag, 10+ invites
• WOENSDAG, 3-weg-dag, minimaal 1 koppelen aan sponsor
• DONDERDAG, follow-up-dag, alle openstaande prospects warm houden
• VRIJDAG, socials-dag, 3 namen erbij, content posten
• ZATERDAG, events / face-to-face / ondernemers-bijeenkomsten / zelf events
• ZONDAG, review + zelfreflectie + sponsor-call

Je hoeft niets nieuws meer te leren. Je hoeft het alleen te BLIJVEN DOEN. Dat is waar 80% afhaakt. De 20% die wel doorgaat, daar zit de werkelijke groei.

WAT JE VANDAAG REFLECTEERT (3 vragen):
1. Wat leerde je over JEZELF in deze 21 dagen? (Niet over het vak, over jou. Wanneer was je sterk? Wanneer was je weak?)
2. Welk patroon zie je in je werk dat je 40 dagen lang wilt versterken?
3. Welk patroon herken je in je werk dat je 40 dagen lang wilt afleren?

DOEL VOOR DE VOLGENDE 40 DAGEN, STEL HET ZO:
• NIET: "ik wil veel members." (te vaag)
• WEL: "ik wil aan eind van dag 60: 5 members + 3 shoppers + minimaal 30 not-yets in m'n pipeline."
• Of: "ik wil consistent 10-10-3 ritme draaien, zonder uitval."
• Of: "ik wil mijn closing-vaardigheid verdubbelen, 1 op 5 i.p.v. 1 op 10 presentaties."
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
