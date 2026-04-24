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
      },
      {
        id: "dag1-why",
        label: "Vul je WHY in met de ELEVA Mentor",
        uitleg:
          "De Mentor stelt je een paar vragen, jij antwoordt (spraak mag). Aan het eind heb je een WHY die je later op moeilijke dagen teruglezen kunt.",
        verplicht: true,
      },
      {
        id: "dag1-vcard",
        label: "Importeer je telefoon-contacten (vCard)",
        uitleg:
          "Exporteer een vCard-bestand uit je Contacten-app en upload 'm in ELEVA. Dubbele contacten worden automatisch overgeslagen. Je lijst staat meteen met 100+ namen.",
        verplicht: true,
      },
      {
        id: "dag1-sponsor",
        label: "Stuur je sponsor een kort bericht: 'Ik ben gestart'",
        uitleg:
          "Geen inhoud nodig — alleen aangeven dat je begonnen bent. Je sponsor ziet in ELEVA vanaf nu mee of je dagelijks je stappen voltooit.",
        verplicht: true,
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
        actie: "vCard importeren",
        menupad: "Menu → Namenlijst → Importeer contacten",
        route: "/namenlijst",
      },
      {
        actie: "Sponsor-contact (ook in FAB onderaan)",
        menupad: "Menu → Team → Mijn sponsor",
        route: "/team",
      },
    ],
    watJeLeert:
      "Dag 1 is geen actie-dag, het is een fundament-dag. Je WHY is niet waar je bent — het is waar je naartoe gaat. Je namenlijst is geen actielijst, het is je voorraadkast: leeg? dan komt er geen gerecht op tafel. Vandaag zet je beide neer zodat je morgen kunt starten zonder 'wat was ook alweer de bedoeling'. De vCard-import neemt je 90% van het handmatige typen uit handen — de rest bouw je de komende weken organisch uit.",
    waaromWerktDit: {
      tekst:
        "De mensen die op dag 47 nog doorgaan, zijn de mensen die op dag 1 hun WHY op papier hadden. Zonder fundament geen gebouw.",
      bron: "Les Brown-principe, vrij vertaald",
    },
  },

  {
    nummer: 2,
    titel: "NIVEA: 20 extra namen, geen filter",
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
          "Korte check-in. Jouw WHY laten lezen, sponsor vertelt wat jullie samen gaan doen fase 1.",
        verplicht: true,
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
    ],
    watJeLeert:
      "NIVEA = Niet Invullen Voor Een Ander. Jij bepaalt niet wie 'iemand voor dit zou zijn'. Niet 'zij heeft vast geen tijd', niet 'hij zit vast niet te wachten'. Iedereen die in je hoofd opkomt komt op de lijst. Filteren is later. Deze fout — op voorhand bepalen wie wel of niet — kost 80% van de starters hun eerste 10 potentiële partners. Iedereen die je kent heeft óf een vriend, óf een broer, óf een collega die wél matcht. Maar alleen als ze op je lijst staan.",
    waaromWerktDit: {
      tekst:
        "De geheugensteunlijst is je voorraadkast. Hoe voller, hoe makkelijker de keuze wat je vanavond kookt.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 3,
    titel: "Social-challenge: 3 namen uit Instagram/FB/LinkedIn",
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
        id: "dag3-dagelijks-5",
        label: "5 namen in totaal vandaag (telefoon + socials + hoofd)",
        verplicht: true,
      },
      {
        id: "dag3-eerste-gesprek",
        label: "Start 1 losse chat met een warme prospect (geen pitch)",
        uitleg:
          "Reageer op hun laatste post of story. Vraag hoe het gaat. Niets verkopen. Nog geen uitnodiging. Gewoon contact.",
        verplicht: false,
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
    watJeLeert:
      "Instagram, Facebook en LinkedIn geven je geen downloadbare contactenlijst — dat is expres zo. Maar ze geven je iets beters: actieve signalen. Mensen die jouw content bekijken, reageren, delen. Die zijn aan het tonen dat ze je volgen. Dát zijn je warme contacten. 3 namen per dag uit socials = 21 namen in week 1, bovenop je vCard. Dat is serieus voorraadkast-volume zonder geforceerd rondbellen.",
    waaromWerktDit: {
      tekst:
        "Social media is geen podium — het is een radar. Je kijkt niet wie er klapt. Je kijkt wie er zwaait.",
      bron: "Fraser Brookes, 3 minutes on social",
    },
  },

  {
    nummer: 4,
    titel: "Je eerste 5 uitnodigingen — 4 stappen",
    fase: 1,
    vandaagDoen: [
      {
        id: "dag4-uitnodiging-1",
        label: "Stuur uitnodiging 1 vandaag",
        verplicht: true,
      },
      {
        id: "dag4-uitnodiging-2",
        label: "Stuur uitnodiging 2",
        verplicht: true,
      },
      {
        id: "dag4-uitnodiging-3",
        label: "Stuur uitnodiging 3",
        verplicht: true,
      },
      {
        id: "dag4-uitnodiging-4",
        label: "Stuur uitnodiging 4",
        verplicht: true,
      },
      {
        id: "dag4-uitnodiging-5",
        label: "Stuur uitnodiging 5",
        verplicht: true,
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
          "Bijvoorbeeld op de persoon uit dag 3 met wie je een losse chat startte. Niet pitchen — peilen.",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Scripts openen",
        menupad: "Namenlijst → klik op prospect → 💬 Scripts sturen",
      },
      {
        actie: "Coach hulp bij persoonlijke DM",
        menupad: "Menu → ELEVA Mentor",
        spraak: "Schrijf een uitnodiging voor [naam] die [context]",
      },
    ],
    watJeLeert:
      "Worre's 4-stappen-uitnodiging: 1) wees druk ('ik heb weinig tijd maar wilde dit even delen'), 2) compliment ('jij bent iemand die dingen voor elkaar krijgt'), 3) uitnodigen (direct / indirect / super-indirect afhankelijk van hoe warm ze zijn), 4) plan ('wanneer schikt het, vanavond of morgen?'). Jouw taak vandaag = uitnodigen, NIET overtuigen. Je wilt niet dat ze 'ja' zeggen tegen jou — je wilt dat ze 'ja' zeggen tegen een kijkmoment. Dat is een veel lagere drempel.",
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
    ],
    faseDoel:
      "Fase 1 (dag 1-7): deze week 2 one-pager-momenten gepland of bekeken krijgen.",
    waarInEleva: [
      {
        actie: "Bezwaar-scripts",
        menupad: "ELEVA Mentor → vraag: 'hoe ga ik om met [bezwaar]'",
      },
      {
        actie: "Prospect op 'Niet nu' zetten als ze afhouden",
        menupad: "Prospectkaart → Pipeline-fase → Not yet",
      },
    ],
    watJeLeert:
      "Feel-Felt-Found werkt op bijna élk bezwaar: 'Ik snap dat het zo voelt (FEEL). Veel mensen hadden dat gevoel in het begin ook (FELT). Wat zij merkten was dat het simpeler was dan gedacht (FOUND).' Sluit dan ALTIJD af met een vraag naar de échte twijfel: 'Maar vertel eens, waar zit het 'm nu écht in?' De meeste eerste bezwaren ('geen tijd', 'niet van sales') zijn emotionele schilden — de echte twijfel zit daaronder. Jouw werk = die eronder vinden, zonder te drammen.",
    waaromWerktDit: {
      tekst:
        "Een bezwaar is niet een muur, het is een vraag die niet weet hoe 'm te stellen.",
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
          "Iedereen die je dag 4-5 hebt uitgenodigd en niet meer gereageerd heeft — vandaag is follow-up-dag. Een niet-antwoord is géén nee, het is meestal gewoon stilte.",
        verplicht: true,
      },
      {
        id: "dag6-social-3",
        label: "3 namen uit socials",
        verplicht: true,
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
        actie: "Follow-up-scripts",
        menupad: "ELEVA Mentor → 'Help me met een follow-up voor [naam]'",
      },
    ],
    watJeLeert:
      "Worre's regel: volg binnen 24-48u na een uitnodiging op. Wacht langer en de psychologische ruimte sluit weer — ze zijn hun interesse alweer vergeten. Gemiddeld zijn 5 contactmomenten nodig voor iemand beslist. Dat is geen drammen — dat is volhouden. Een goede follow-up vraagt NIET 'heb je al nagedacht?' maar 'even inchecken — hoe gaat het met je?'. Warm blijven, menselijk blijven, géén beoordelaar maken van je prospect.",
    waaromWerktDit: {
      tekst:
        "Niet jagen, niet smeken, wel richting geven. Gemiddeld 5 exposures — dat is de statistiek.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 7,
    titel: "Week 1 review — wat ging goed, wat schuurde?",
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
    watJeLeert:
      "Eén dag zonder actie = geen drama. Twee dagen = actie nodig. Een week review is geen rapportcijfer, het is een kompas-check. Wat controllables heb je deze week geraakt? Waar zat weerstand — bij jezelf, of bij je prospects? De review duurt 5 minuten maar scheelt je 5 dagen dwaling. Sponsor leest mee — niet om te beoordelen, om te ondersteunen.",
    waaromWerktDit: {
      tekst:
        "Vergelijk jezelf met gisteren, niet met anderen. De run is jouw verhaal — de review is hoe je het schrijft.",
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
          "Helft via directe message, helft via scripts uit ELEVA. Mix warm (mensen die je kent) met lauw (mensen uit je vCard met wie je niet vaak praat).",
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
        actie: "Scripts in bulk openen per prospect",
        menupad: "Namenlijst → selecteer meerdere prospects → Scripts sturen",
      },
      {
        actie: "Pipeline-view (wie zit waar)",
        menupad: "Namenlijst → Weergave: Pipeline",
      },
    ],
    watJeLeert:
      "In fase 1 leerde je hoe het werkt. In fase 2 gaat het om volume. 10 uitnodigingen per dag voelt veel — maar dat is 10 minuten werk als je scripts hebt en een lijst hebt. Het draait vandaag niet om het perfecte bericht, het draait om doorpakken. Perfect is de vijand van verzonden. Stuur eerder af dan je zin om ze af te sturen.",
    waaromWerktDit: {
      tekst: "Snelheid wint. Snel handelen verslaat perfect handelen, altijd.",
      bron: "Eric Worre",
    },
  },

  {
    nummer: 9,
    titel: "3-weg gesprek: waarom het alles verandert",
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
        id: "dag9-lees-3weg",
        label: "Lees 3-weg-gesprek uitleg in ELEVA",
        uitleg:
          "Open een prospectkaart → klik op '💬 3-weg gesprek scripts'. Lees de 5 stappen. Morgen ga je er 1 doen.",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "3-weg-gesprek openen",
        menupad: "Prospectkaart → 💬 3-weg gesprek scripts",
      },
      {
        actie: "Uitleg vanuit de Mentor",
        menupad: "ELEVA Mentor",
        spraak: "Leg 3-weg gesprek uit voor een prospect",
      },
    ],
    watJeLeert:
      "Een 3-weg-gesprek is geen truc — het is het krachtigste instrument dat je hebt. Jij introduceert je prospect aan je sponsor in een WhatsApp-groepje. Jij edifieert sponsor VOORAF, dan stap je terug. Sponsor = expert, jij = student, prospect ziet twee mensen die al samenwerken. Dat bouwt vertrouwen sneller dan 10 DMs. Bijkomend: het haalt de druk van jou af. Jij hoeft niet alles te weten.",
    waaromWerktDit: {
      tekst:
        "Edificatie is geen overdrijving — het is de waarheid vertellen over waarom de persoon gekwalificeerd is om te helpen.",
      bron: "Eric Worre",
    },
  },

  {
    nummer: 10,
    titel: "Eerste 3-weg gesprek met sponsor",
    fase: 2,
    vandaagDoen: [
      {
        id: "dag10-3weg-1",
        label: "Start minstens 1 3-weg gesprek vandaag",
        uitleg:
          "Kies 1 warme prospect uit je lijst. Stuur eerst de aankondiging (stap 1 script). Maak dan groepje aan met je sponsor. Volg de 5 stappen.",
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
        actie: "3-weg scripts — stap 1 t/m 5",
        menupad: "Prospectkaart → 💬 3-weg gesprek scripts",
      },
      {
        actie: "Sponsor bellen als je vastzit",
        menupad: "Playbook FAB → Bel/app mijn sponsor",
      },
    ],
    watJeLeert:
      "Na de introductie in het groepje: STAP TERUG. Zeg niets meer tenzij sponsor een vraag aan jou stelt. Dit is moeilijker dan het klinkt — je wilt helpen, je wilt invullen. Doe het niet. Sponsor moet als expert zichtbaar blijven, anders verliest het 3-weg zijn kracht. Binnen 24 uur: follow-up apart met prospect — 'Wat sprak je het meeste aan?' NOOIT 'Wat vond je ervan?' (= vraagt naar mening, zet prospect in beoordelaar-rol).",
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
        actie: "Pipeline-weergave namenlijst",
        menupad: "Namenlijst → Weergave: Pipeline",
      },
      {
        actie: "Tussenstap naar presentatie via Mentor",
        menupad: "ELEVA Mentor",
        spraak: "Hoe zet ik [naam] van one-pager naar presentatie?",
      },
    ],
    watJeLeert:
      "One-pager = laagdrempelige eerste blik (5-10 min, PDF of kort filmpje). Presentatie = diepgaand (20-40 min, meer context). Algemene regel: koude/lauwe contacten krijgen EERST een one-pager. Alleen wie daarna nog vraagt 'vertel me meer' gaat naar presentatie. Warmer en met vertrouwen: mag meteen presentatie. Pipeline in ELEVA helpt je dit zien: wie zit nog op 'Uitgenodigd', wie is door naar 'One-pager', wie naar 'Presentatie'? Niemand slaat een stap over.",
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
        actie: "Product-pivot bericht",
        menupad: "ELEVA Mentor",
        spraak: "Geef me een product-pivot bericht voor [naam]",
      },
      {
        actie: "Prospect op Shopper zetten",
        menupad: "Prospectkaart → Pipeline-fase → Shopper",
      },
      {
        actie: "Herinnering over 21 dagen",
        menupad: "Prospectkaart → + Herinnering → +21 dagen",
      },
    ],
    watJeLeert:
      "Een 'nee' op business is geen einde — het is een afslag. Als iemand geen interesse heeft in de kant 'zelf opbouwen' is er nog steeds de kant 'product ervaren'. Veel mensen starten als Shopper en worden 6 maanden later alsnog member omdat ze het werk hebben gezien van binnenuit. Jouw taak: pivot warm, zonder druk. Product-ervaring is laagdrempelig. Noteer ze als Shopper. Herinnering over 21 dagen, dan heropen je de dialoog met nieuwe data ('hoe bevalt het?').",
    waaromWerktDit: {
      tekst:
        "Nee nu is geen nee voor altijd. Blijf warm, blijf in hun leven, wees waardevol — dan ben je de eerste die ze bellen als de situatie verandert.",
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
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 2 (dag 8-14): 3 tot 5 presentatie-momenten in de agenda deze week.",
    waarInEleva: [
      {
        actie: "FORM-uitleg + vragenvoorbeelden",
        menupad: "ELEVA Mentor",
        spraak: "Leg FORM uit en geef voorbeelden",
      },
      {
        actie: "Gesprek-notities vastleggen",
        menupad: "Prospectkaart → Contact toevoegen → Notities",
      },
    ],
    watJeLeert:
      "FORM is Brookes' manier om in elk gesprek rapport te bouwen zonder dat het een verhoor wordt. Family: wie hoort bij jou? Occupation: wat doe je, wat vind je ervan? Recreation: wat doe je graag, waar krijg je energie van? Money: hoe tevreden ben je met je financiële situatie? Jij praat 30%, zij 70%. Luister naar 'haken' — zinnen als 'ik zou willen dat...', 'ik mis nog...', 'als ik meer tijd had...'. Daar zit je opening voor een uitnodiging.",
    waaromWerktDit: {
      tekst:
        "Mensen kopen geen producten of opportunities — ze kopen oplossingen voor wat ze voelen.",
      bron: "Fraser Brookes, 3 minutes on recruiting",
    },
  },

  {
    nummer: 14,
    titel: "Week 2 review — welk patroon zie je?",
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
        label: "Bekijk je hele pipeline — wie zit waar?",
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
      "Fase 2 afgerond. Hoeveel presentatie-momenten staan er in je agenda? Pakken we in fase 3 door — follow-up wordt leidend.",
    waarInEleva: [
      {
        actie: "Wekelijkse review",
        route: "/dashboard",
      },
      {
        actie: "Pipeline-view",
        menupad: "Namenlijst → Weergave: Pipeline",
      },
    ],
    watJeLeert:
      "Na 2 weken zie je patronen: welke berichten werken, welke mensen reageren snel, waar je vastloopt. De pipeline-weergave is je röntgen-foto. Stok je veel op 'Uitgenodigd'? Dan moet de uitnodiging scherper. Stok je op 'One-pager'? Dan moet de opvolging beter. Stok je op 'Presentatie'? Dan is het closing-werk. De bottleneck vertelt je wat je volgende week moet oefenen.",
    waaromWerktDit: {
      tekst:
        "Je bent nooit zo goed of slecht als je denkt — je statistieken zijn eerlijker dan je gevoel.",
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
        label: "10 follow-ups — het is follow-up-week",
        uitleg:
          "Iedereen die je in week 1-2 hebt uitgenodigd maar geen beslissing heeft genomen = follow-up. Niet drammen, wel aanwezig zijn.",
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
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen — member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Follow-up lijst",
        menupad: "Menu → Herinneringen → Alle open",
      },
      {
        actie: "Follow-up-scripts",
        menupad: "ELEVA Mentor",
        spraak: "Schrijf een follow-up voor [naam] die [situatie]",
      },
    ],
    watJeLeert:
      "Follow-up is geen aanhangsel van het werk — follow-up IS het werk. 80% van de beslissingen valt op contact 3-5, niet op contact 1. Vandaag schuift je gewicht naar follow-up toe. 10 volgops per dag voelt veel, maar als je pipeline klopt staan ze allemaal gewoon in je Herinneringen-lijst klaar. Vraag die werkt vrijwel altijd: 'Hoe kijk je er nu naar na een paar dagen?' Open, zacht, zonder beoordeling.",
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
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen — member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Pipeline labels aanpassen per prospect",
        menupad: "Prospectkaart → Pipeline-fase",
      },
      {
        actie: "Uitleg 5 types via Mentor",
        menupad: "ELEVA Mentor",
        spraak: "Leg de 5 types prospects uit",
      },
    ],
    watJeLeert:
      "Worre's 5 types: (1) actief zoekend — direct presenteren, ze zoeken al; (2) open — voelt goed, vraag door, investeer tijd; (3) productkoper — geen business-interesse, wel ervaren; (4) niet-nu — timing klopt niet, blijf warm contact houden; (5) nooit — erken en laat los. De fout die starters maken: type 5 behandelen als type 2. Daar raak je uitgeput. Energie waar 't zin heeft, warme groet waar 't niet landt.",
    waaromWerktDit: {
      tekst:
        "Je gaat nooit iemand overtuigen die niet wil — je gaat mensen vinden die al op zoek zijn.",
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
          "Bij iemand die een presentatie heeft gezien en twijfelt: stel de 5 closing-vragen. Dit is niet drammen — dit is helpen beslissen.",
        verplicht: false,
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen — member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Closing-scripts",
        menupad: "ELEVA Mentor",
        spraak: "Help me met closing voor [naam]",
      },
    ],
    watJeLeert:
      "Doel-Tijd-Termijn in 5 vragen: (1) 'Hoeveel euro per maand zou dit de moeite waard maken?' (2) 'Hoeveel uur per week heb je realistisch?' (3) 'Na hoeveel maanden moet dat bedrag er staan?' (4) 'Als ik laat zien hoe dat realistisch kan — wil je dat serieus bekijken?' (5) 'Als dat klopt en goed voelt — starten we dan?' De kracht: de motivatie komt van HEN, niet van jou. Jij bent geen drammer, je bent de spiegel waar ze zich in zien.",
    waaromWerktDit: {
      tekst:
        "Closing is niet overtuigen, closing is helpen beslissen. Grote verschil.",
      bron: "Eric Worre, Go Pro",
    },
  },

  {
    nummer: 18,
    titel: "Loser-to-Legend: jouw verhaal IS je wapen",
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
        id: "dag18-verhaal",
        label: "Schrijf je eigen Loser-to-Legend verhaal op (3 alinea's)",
        uitleg:
          "Wie was ik? Wat was mijn turning point? Wie ben ik nu? Dit wordt je standaard-antwoord op 'waarom doe jij dit?'",
        verplicht: true,
      },
    ],
    faseDoel:
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen — member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Verhaal laten herschrijven door Mentor",
        menupad: "ELEVA Mentor",
        spraak: "Help me mijn Loser-to-Legend verhaal schrijven",
      },
    ],
    watJeLeert:
      "Brookes' krachtigste inzicht: mensen sluiten niet aan bij succes, ze sluiten aan bij verhalen. Jouw 'ik had het moeilijk met X' is tien keer krachtiger dan 'ik verdien nu Y'. Drie alinea's: wie was ik (pijn, twijfel, situatie), wat was het moment (wanneer besloot ik dat het anders moest), wie ben ik aan het worden (niet eindpunt — reis). Dit verhaal vertel je bij élke DM, elk presentatiemoment, elk 3-weg. Het is je anker.",
    waaromWerktDit: {
      tekst:
        "Mensen kopen geen cijfers, ze kopen verhalen waarin ze zichzelf herkennen.",
      bron: "Fraser Brookes, Loser to Legend",
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
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen — member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Pipeline-weergave + statistieken",
        menupad: "Namenlijst → Pipeline + Menu → Statistieken",
      },
    ],
    watJeLeert:
      "Een goed pipeline-patroon: bovenaan veel, richting onderen steeds minder. Als je 100 uitnodigingen deed, verwacht 30 one-pagers, 15 presentaties, 3-5 beslissingen. Minder? Waar lekt het? Veel 'Uitgenodigd' maar weinig 'One-pager'? Uitnodiging moet scherper — oefen met de Mentor. Veel 'One-pager' maar weinig 'Presentatie'? Je tussenstap hapert. Veel 'Presentatie' maar weinig beslissingen? Je closing is de oefening. Statistieken zijn je leermeester, niet je rechter.",
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
      "Fase 3 (dag 15-21): minimaal 2 beslissingen binnen — member, shopper of not-yet.",
    waarInEleva: [
      {
        actie: "Closing-hulp via Mentor",
        menupad: "ELEVA Mentor",
        spraak: "Hoe vraag ik de beslissing aan [naam]?",
      },
    ],
    watJeLeert:
      "De meeste nieuwe networkers wachten te lang met het vragen naar een beslissing. Ze blijven volgen, blijven delen, blijven hopen. Na 3-5 exposures is het tijd: 'Wat heb je nog nodig om een goede beslissing te kunnen nemen?' Als ze iets noemen — vul in. Als ze niets noemen — 'Dan is er niets meer nodig, wil je er nu een knoop over doorhakken?' Beslissing JA = member/shopper. Beslissing NEE = niet-nu, herinnering 21 dagen. Beide zijn winst.",
    waaromWerktDit: {
      tekst:
        "De enige manier om 'nee' te krijgen is door te vragen. De enige manier om 'ja' te krijgen is door te vragen. Vraag.",
      bron: "Fraser Brookes",
    },
  },

  {
    nummer: 21,
    titel: "Week 3 review — de 21 dagen zijn het begin",
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
        route: "/dashboard",
      },
      {
        actie: "Fase-statistieken + 60-dagen-overzicht",
        menupad: "Menu → Statistieken",
      },
    ],
    watJeLeert:
      "Dag 21 is geen eindstreep — het is je startlijn. Je hebt 21 dagen lang een systeem gebouwd. Vanaf morgen zet je dat systeem in onderhouds-modus: 7 weken lang een vast weekritme. Maandag plannen, dinsdag invites, woensdag 3-weg, donderdag follow-up, vrijdag socials, zaterdag events, zondag review. Je hoeft niets opnieuw te leren — je hoeft het alleen te blijven doen. Dat is waar 80% afhaakt. Doe jij anders.",
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
