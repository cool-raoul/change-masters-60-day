// ============================================================
// lib/academy/audio-onderweg-content.ts
//
// Vierde training in ELEVA Academy: 'Audio onderweg met Eric Worre'.
//
// 1 module, 8 tracks (intro + 7 skills). Audio-format, niet leestekst.
// Elke 'les' bevat een korte ELEVA-intro (waarom, hoe sluit het aan
// op ELEVA's playbook + DMO-training) plus een Spotify-zoeklink.
//
// ZICHTBAARHEID: voor IEDEREEN (sprint + core + pro). Vooral
// waardevol in week 1 van de Sprint als mensen tegen hun eerste
// nees aanlopen. Raoul: 'dagelijks iets in je oor onderweg' helpt
// tegen uitval-patroon en bouwt vertrouwen dat dit een serieus vak is.
//
// CONTENT-PRINCIPE: dit is de ENIGE plek in ELEVA waar Eric Worre
// BIJ NAME wordt genoemd. Reden: dit IS letterlijk zijn werk (Network
// Marketing Pro / Go Pro), en de luistertijd brengt members in
// contact met zijn stem en verhaal. Op andere plaatsen in de dag-
// flow blijft hij anoniem ('topcoaches').
//
// SOFT-LOCK: de intro-track (sleutel '0.intro') wordt expliciet
// als 'luister deze eerst' aangekondigd in z'n tekst. Geen UI-toggle
// die de overige tracks grijst — komt eventueel in een latere ronde.
// ============================================================

import type { AcademyTraining, AcademyLes } from "./types";

// Spotify-zoek-URL helper. Onmiddellijk valide URL die opent in een
// zoekresultaat-pagina; de exacte aflevering vindt de gebruiker zelf.
function spotifyZoek(query: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

const TRACKS: AcademyLes[] = [
  // ============================================================
  // TRACK 0, INTRO (verplicht eerst luisteren)
  // ============================================================
  {
    sleutel: "0.intro",
    titel: "Intro & het verhaal achter de Seven Skills",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre network marketing pro introduction"),
    inhoud: `Voor je naar de andere zeven tracks gaat, luister deze ene eerst. Echt.

In de intro vertelt Eric Worre zijn eigen verhaal. Hoe hij in netwerk-marketing terechtkwam, waarom hij in eerste instantie weerstand had, wat hem deed omslaan, en waarom hij uiteindelijk besloot om de zeven kernvaardigheden tot één raamwerk te smeden.

Dat verhaal is geen randzaak. Het is de reden dat de rest pakt. Wanneer je Eric's eigen achtergrond kent, snap je in welke context hij de Seven Skills heeft geformuleerd. Wanneer je dat niet weet, klinken de zeven skills als willekeurige tips. Met de intro erbij worden ze een SYSTEEM.

**Wat je in deze track gaat horen:**

- Hoe Eric begon (en wat hem aanvankelijk tegenhield)
- Waarom 95% van netwerkers afhaakt voor week 8
- Wat de drie ankerpunten zijn die volhouders gebruiken
- Hoe de zeven kernvaardigheden in elkaar grijpen

**Na deze track**

Mag je de overige zeven tracks (1 t/m 7) in jouw eigen volgorde luisteren. Sommige mensen luisteren ze chronologisch, sommige beginnen met de skill die voor hen NU het meest relevant is. Beide werkt.

**Praktisch**

Klik op de 'Beluister op Spotify'-knop hieronder. Je komt op een zoekresultaat-pagina van Eric Worre's Network Marketing Pro-podcast. De intro is meestal aflevering 1 of staat onder 'about the show'. ~15-20 min, perfect voor in de auto of tijdens een wandeling.

Wanneer je 'm hebt gehoord, kom terug en markeer deze track als voltooid.`,
    oefening:
      "Markeer deze track pas voltooid NA dat je 'm hebt geluisterd. Vink af, kies dan zelf welke van de zeven skill-tracks (1-7) als eerste in jouw oor wil. Geen verkeerde keuze.",
  },

  // ============================================================
  // TRACK 1, VINDEN VAN PROSPECTS
  // ============================================================
  {
    sleutel: "1.vinden",
    titel: "Skill 1, Vinden van prospects",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre prospecting network marketing"),
    inhoud: `De eerste vaardigheid is het opbouwen van een grote, levende namenlijst en het continu vinden van nieuwe mensen om mee te praten. Eric noemt dit 'de zuurstof' van je business — zonder constante instroom van nieuwe namen kakt elke pijplijn in.

**Hoe deze track aansluit op ELEVA**

In jouw dagelijkse flow zie je dit terug als stap A van elke dag: 'Voeg N nieuwe namen toe aan je lijst', met de vier bronnen (Eleva-geheugen, Facebook, Instagram, LinkedIn) als praktische ingangen. De DMO-training in de Academy gaat dieper in op de wiskunde hierachter (les 1.2 'De wiskunde van het percentage-spel').

**Wat Eric in deze track behandelt:**

- Hoe je een 'Memory Jogger' gebruikt om je hoofd leeg te trekken
- Waarom de meeste netwerkers veel te snel naar koude prospects schakelen
- Het verschil tussen 'lijst' en 'levende lijst'
- Hoe je dagelijks 2-5 nieuwe namen ontdekt zonder geforceerd te zoeken

**Praktisch**

Klik op de 'Beluister op Spotify'-knop. De aflevering over prospecting is meestal een van de eerste 5-10 afleveringen van Network Marketing Pro. ~15-20 min.

Onthoud, zoals ook in jouw dagelijkse flow staat: warm voor koud. Eleva-geheugen eerst, daarna pas socials.`,
    oefening:
      "Na het luisteren: open je namenlijst en tel hoeveel mensen er nu in fase 'prospect' staan (nog niet benaderd). Vergelijk met een week geleden. Groeit je lijst of stagneert hij? Dat is je belangrijkste indicator.",
  },

  // ============================================================
  // TRACK 2, UITNODIGEN
  // ============================================================
  {
    sleutel: "2.uitnodigen",
    titel: "Skill 2, Uitnodigen voor een kijkmoment",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre inviting network marketing"),
    inhoud: `De tweede vaardigheid is degene waar veel netwerkers het meest mee worstelen: het uitnodigen zelf. Niet omdat de woorden moeilijk zijn, maar omdat de psychologie eronder subtiel is. Wat je vraagt, hoe je vraagt, en wanneer je vraagt bepaalt of mensen ja zeggen op een kijkmoment.

**Hoe deze track aansluit op ELEVA**

Dit is precies wat je op dag 4 hebt geleerd: de 4-stappen-uitnodiging (compliment, uitnodigen, plan, optioneel haast). Vanaf dag 5 is uitnodigen een vast onderdeel van je dagelijkse ritme. Eric gaat in deze track dieper in op de psychologie achter elke stap — waarom een compliment werkt, waarom je 'plan met twee opties' veel beter scoort dan een open vraag, en waarom 'haast' alleen bij business-prospects past.

**Wat Eric in deze track behandelt:**

- Het verschil tussen 'ja zeggen tegen jou' en 'ja zeggen tegen een kijkmoment'
- De drie warmte-niveaus (direct, indirect, super-indirect) per type prospect
- Hoe je je eigen mindset reset bij elke uitnodiging
- Wat je doet wanneer iemand 'nee' zegt op de uitnodiging

**Praktisch**

Klik op de 'Beluister op Spotify'-knop. ~15-20 min.

Na deze track wil je 'm één of twee keer opnieuw beluisteren — het is dichte stof.`,
    oefening:
      "Pak een prospect uit je lijst in fase 'in gesprek'. Schat de warmte op 1-10. Schrijf voor jezelf op welke variant past (direct/indirect/super-indirect). Niet versturen, alleen oefenen. Vergelijk met je gevoel van vóór deze track.",
  },

  // ============================================================
  // TRACK 3, PRESENTEREN
  // ============================================================
  {
    sleutel: "3.presenteren",
    titel: "Skill 3, Presenteren van het verhaal",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre presenting third party tool"),
    inhoud: `De derde vaardigheid is presenteren. In netwerk-marketing betekent dit niet dat JIJ het hele verhaal van A tot Z houdt — dat is een rookie-fout. Goed presenteren betekent dat je een 'derde-partij-tool' inzet (een film, een one-pager, een presentatie van een ervaren upline) en dat JIJ regisseur bent, niet de hoofdrol.

**Hoe deze track aansluit op ELEVA**

In ELEVA zie je dit terug in drie vormen:
- De one-pager (snelste route, goed voor wie weinig tijd heeft)
- De Mini-ELEVA-toegang (14-daagse zelfstandige verkenning)
- Het 3-weg-gesprek (samen met sponsor of ervaren teamlid)

Per prospect kies je in de namenlijst welke aanpak past. Eric legt in deze track uit WAAROM een derde-partij-tool zoveel beter werkt dan jouw eigen verhaal — het heeft te maken met sociale bewijskracht en met 'duplicatie' (kunnen jouw teamleden dit ook doen, of werkt het alleen voor jou?).

**Wat Eric in deze track behandelt:**

- De 'edification'-techniek (waarom je je sponsor MOET introduceren in het 3-weg)
- Hoe je een prospect klaarmaakt vóór ze de tool zien
- Wat je tijdens een presentatie doet en LAAT
- Hoe je voorkomt dat het 'overload' wordt

**Praktisch**

~15-20 min. Klik op 'Beluister op Spotify'.`,
    oefening:
      "Na het luisteren: kijk eens kritisch naar JOUW laatste paar uitnodigingen. Stuurde jij prospects naar een derde-partij-tool (one-pager/film/3-weg/Mini-ELEVA) of probeerde je het zelf uit te leggen? Geen oordeel, alleen patroon-zien.",
  },

  // ============================================================
  // TRACK 4, FOLLOW-UP
  // ============================================================
  {
    sleutel: "4.followup",
    titel: "Skill 4, Follow-up (waar de meeste resultaten liggen)",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre follow up network marketing"),
    inhoud: `De vierde vaardigheid is waar 80% van de echte resultaten worden gemaakt: follow-up. Eric stelt het scherp — 80% van mensen die uiteindelijk ja zeggen, doen dat pas na de derde, vierde of vijfde aanraking. En 80% van netwerkers stopt al na de eerste of tweede. Dat is de scheiding tussen mensen die doorbreken en mensen die afhaken.

**Hoe deze track aansluit op ELEVA**

Op dag 6 leer je de 24-48u-regel + de 5-fasen-flow. De DMO-training in de Academy heeft een hele les over dit onderwerp (les 4.1 'De wet van 80%, waarom follow-up je echte fase is'). Eric's track gaat over de PSYCHOLOGIE eronder: hoe je niet pushy wordt, hoe je tijd-windows aanhoudt, hoe je 'niet-jagen, niet-smeken, wel-richting-geven' in praktijk brengt.

**Wat Eric in deze track behandelt:**

- Het belangrijkste woord in netwerk-marketing: 'commitment'
- Hoe je een opvolg-afspraak maakt VOORDAT de prospect het materiaal heeft gezien
- De vier soorten follow-up (info-, decision-, training-, en team-follow-up)
- Wat je doet als iemand drie keer niet reageert

**Praktisch**

~15-20 min. Veel mensen vinden dit een van de zwaarste tracks omdat 'ie hun eigen vermijdings-gedrag belicht.`,
    oefening:
      "Open je namenlijst en filter op fase 'one-pager' of 'presentatie'. Hoeveel daarvan zijn meer dan 48u stil sinds kijkmateriaal? Plan voor elk van hen vandaag of morgen een eerste check-in.",
  },

  // ============================================================
  // TRACK 5, CLOSING
  // ============================================================
  {
    sleutel: "5.closing",
    titel: "Skill 5, Closing (helpen beslissen)",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre closing network marketing"),
    inhoud: `De vijfde vaardigheid is closing — een vaardigheid die in netwerk-marketing nogal anders werkt dan in traditionele sales. Eric is hier helder: closing in dit vak betekent NIET de prospect onder druk zetten. Het betekent helpen om een beslissing te nemen die ze al hebben gevormd, maar nog niet hardop hebben uitgesproken.

**Hoe deze track aansluit op ELEVA**

In de dag-flow zit closing impliciet verstopt in de uitnodig-formule (de 'plan met twee opties'-stap) en in de follow-up (de 'wat is voor jou het belangrijkste punt om helder te krijgen'-vraag). Eric maakt het hier expliciet als eigen vaardigheid.

**Wat Eric in deze track behandelt:**

- Vier vragen die helpen om een beslissing aan het oppervlak te brengen
- Waarom 'closing-techniek' een verkeerd label is (het is 'helping people decide')
- Hoe je twijfel ombuigt zonder te overtuigen
- Wat je doet bij een definitief 'nee' (en hoe je de relatie behoudt)

**Praktisch**

~15-20 min. Klik op 'Beluister op Spotify'.`,
    oefening:
      "Pak een prospect die in fase 'follow-up' zit en al een paar weken in twijfel hangt. Schrijf voor jezelf de vraag 'Wat is voor jou het belangrijkste punt om helder te krijgen?' in je eigen toon. Niet versturen, alleen voorbereiden.",
  },

  // ============================================================
  // TRACK 6, NIEUWE MENSEN LATEN STARTEN
  // ============================================================
  {
    sleutel: "6.startup",
    titel: "Skill 6, Nieuwe mensen goed laten starten",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre getting new people started"),
    inhoud: `De zesde vaardigheid is iets dat je pas nodig hebt zodra je eerste partners binnenkomen, maar dan is het meteen kritisch: hoe begeleid je iemand de eerste 30 tot 90 dagen, zodat ze NIET afhaken? Eric's getal hier is hard — als je iemand niet goed start, is de kans dat ze binnen 60 dagen stoppen meer dan 80%.

**Hoe deze track aansluit op ELEVA**

Het hele Sprint-playbook is ontworpen om dit op te lossen. Een nieuwe partner krijgt jouw 60-daagse run, met jouw begeleiding en jouw sponsor-checkin als anker. Eric's track verklaart waarom DEZE periode zo cruciaal is en geeft een ander stuk gereedschap: hoe je een 'fast start'-pakket samenstelt, hoe je iemand z'n eerste partners helpt aanmelden, en hoe je voorkomt dat ze 'tegen jou aanleunen' (dependency-trap).

**Wat Eric in deze track behandelt:**

- De drie momenten waarop nieuwe partners het vaakst afhaken
- Hoe je een 'fast start interview' doet binnen 48 uur na aanmelding
- Wat een sponsor WEL en NIET overneemt van een nieuwe partner
- De rol van duplicatie (wat jij doet, moeten zij ook kunnen doen)

**Praktisch**

~15-20 min. Deze track is extra waardevol als je je eerste partner hebt geworven en niet weet hoe te begeleiden.`,
    oefening:
      "Stel je voor dat jij volgende week je eerste partner aanmeldt. Schrijf voor jezelf de drie eerste afspraken op die je met hen zou maken in de eerste 48 uur. Geen scripts, alleen je intentie.",
  },

  // ============================================================
  // TRACK 7, EVENTS PROMOTEN
  // ============================================================
  {
    sleutel: "7.events",
    titel: "Skill 7, Events promoten (de versneller)",
    leestijdMinuten: 3,
    audioZoekLink: spotifyZoek("eric worre promoting events network marketing"),
    inhoud: `De zevende en laatste vaardigheid is events promoten. Eric stelt dit gelijk aan 'het toveren met momentum' — events brengen je team samen, zorgen voor leiderschaps-ontwikkeling, en versnellen het werk dat in alle andere zes vaardigheden gebeurt.

**Hoe deze track aansluit op ELEVA**

In ELEVA zie je dit (nog) niet direct in de dag-flow want events zijn iets dat Lifeplus organiseert (lokaal, regionaal, nationaal). Maar Eric's track helpt om TE BEGRIJPEN waarom events zo cruciaal zijn en hoe je je team gemotiveerd krijgt om ze bij te wonen. Voor pilot-bouwers (Raoul + Gaby + Jaimie + jullie eerste partners) is dit straks relevant zodra de eerste Lifeplus-event in zicht komt.

**Wat Eric in deze track behandelt:**

- Waarom een event 30 minuten team-werk per kwartaal kan vervangen
- Hoe je MENSEN promote, niet de event zelf
- De rol van 'champions' (key-mensen die anderen meenemen)
- Wat een goede event-promotor wel en niet doet

**Praktisch**

~15-20 min. Mooi als laatste in de reeks omdat het de andere zes vaardigheden samenbindt.`,
    oefening:
      "Na het luisteren: noteer voor jezelf welke vaardigheid uit deze zeven JIJ als eerste wilt versterken in de komende 4 weken. Niet alle zeven tegelijk. Eén.",
  },
];

// ============================================================
// EXPORT, de training-definitie
// ============================================================

export const AUDIO_ONDERWEG_TRAINING: AcademyTraining = {
  slug: "audio-onderweg",
  titel: "Audio onderweg met Eric Worre",
  emoji: "🎧",
  pitch:
    "Eric Worre's Seven Skills als luisterlijst voor in de auto, tijdens een wandeling of bij koffie. 15-20 min per dag mindset-voeding die je playbook-werk diepte geeft.",
  zichtbaarVoor: ["sprint-na-21", "core", "pro-optie", "iedereen"],
  doorlooptijdDagen: 14,
  // Hard-lock: tracks 1-7 zijn vergrendeld tot de intro (track 0) is
  // voltooid. Raoul: 'mensen moeten wel eerst hoofdstuk 1 of de intro
  // luisteren, daar vertelt Eric zijn eigen verhaal'.
  introVerplicht: true,
  modules: [
    {
      nummer: 1,
      titel: "De Seven Skills",
      emoji: "🎧",
      samenvatting:
        "Acht audio-tracks. Begin met de intro (luister deze als eerste), daarna vrije volgorde door de zeven kernvaardigheden.",
      lessen: TRACKS,
    },
  ],
};
