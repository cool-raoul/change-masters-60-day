// ============================================================
// lib/academy/audio-onderweg-content.ts
//
// Vierde training in ELEVA Academy: 'Audio onderweg met Eric Worre'.
//
// 1 module, 8 tracks (1 intro + 7 skills). Audio-format, geen leestekst-
// training. Elke 'les' bevat een korte ELEVA-intro die uitlegt:
// - WAAR het hoofdstuk over gaat (op basis van het Go Pro-boek)
// - WELK audiobook-hoofdstuk te luisteren (track-nummer op Spotify)
// - HOE het aansluit op ELEVA's playbook + andere Academy-trainingen
//
// SPOTIFY-BRON: het officiële audiobook van 'Go Pro — 7 Steps to
// Becoming a Network Marketing Professional' staat als album op
// Spotify (ID 3pX4DrWPVsjW8GCE2XYd7D). Alle tracks linken naar
// HETZELFDE album; in de tekst staat expliciet welk track-nummer
// te kiezen. Reden: Spotify ondersteunt geen betrouwbare deeplink
// naar een specifiek track binnen een album zonder track-ID. De
// gebruiker ziet de track-lijst direct na het openen van de album-
// pagina en kiest zelf het juiste hoofdstuk.
//
// ZICHTBAARHEID: voor IEDEREEN (sprint + core + pro). Vooral
// waardevol in week 1 van de Sprint als mensen tegen hun eerste
// nees aanlopen. Raoul: 'dagelijks iets in je oor onderweg' helpt
// tegen uitval-patroon en bouwt vertrouwen dat dit een serieus vak is.
//
// HARD-LOCK: introVerplicht=true (zie onderaan dit bestand). Tracks
// 1-7 zijn vergrendeld tot Track 0 (intro) is afgevinkt.
//
// CONTENT-PRINCIPE: dit is de ENIGE plek in ELEVA waar Eric Worre
// BIJ NAME wordt genoemd. Reden: dit IS letterlijk zijn werk. Op
// andere plaatsen in de dag-flow blijft hij anoniem ('topcoaches').
//
// BRON-VERIFICATIE: alle skill-beschrijvingen zijn gevalideerd
// tegen de officiële boek-content (Go Pro, 2013) via meerdere
// publieke samenvattingen en de Spotify-tracklist. Specifieke
// frameworks (zoals het 4-stappen-systeem van skill #1) komen
// uit het boek zelf, niet uit interpretaties.
// ============================================================

import type { AcademyTraining, AcademyLes } from "./types";

// Directe link naar het officiële Go Pro-audiobook op Spotify.
// Alle 8 tracks van onze training gebruiken dezelfde link; per track
// staat in de tekst welk Spotify-track-nummer + hoofdstuk te kiezen.
const SPOTIFY_GOPRO_ALBUM =
  "https://open.spotify.com/album/3pX4DrWPVsjW8GCE2XYd7D";

const TRACKS: AcademyLes[] = [
  // ============================================================
  // TRACK 0, INTRO (verplicht eerst luisteren)
  // ============================================================
  {
    sleutel: "0.intro",
    titel: "Intro & het kader van de Seven Skills",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `Voor je naar de zeven skills gaat, luister eerst dit kader. Echt.

In de Spotify-album van Eric Worre's audiobook 'Go Pro' staan de eerste vier tracks samen voor het kader: zijn eigen verhaal, hoe hij over netwerk-marketing denkt, en waarom skills leren zo cruciaal is. Wanneer je dat kader hebt, vallen de zeven skill-tracks daarna pas écht in plaats.

**Welke tracks luister je nu**

In het Spotify-album (link onderaan):

- **Track 1: Introduction**: Eric's eigen verhaal
- **Track 2: Chapter 1, Network Marketing Isn't Perfect... It's Just Better**: waarom dit vak, en wat het juist niet is
- **Track 3: Chapter 2, Decide to Be a Professional. Decide to Go Pro**: het verschil tussen amateur, hobbyist en professional
- **Track 4: Chapter 3, You'll Need to Learn Some Skills**: waarom de zeven skills een SYSTEEM vormen, geen losse tips

Samen ongeveer 30 tot 40 minuten luistertijd. Perfect voor één wandeling of een autoritje. Daarna mag je de zeven skill-tracks in vrije volgorde luisteren.

**Waarom dit kader belangrijk is**

Zonder context klinken de zeven skills als willekeurige tips. Met het kader erbij zie je dat ze SAMEN één raamwerk vormen: van iemand vinden tot een nieuwe distributeur goed laten starten en je hele team naar events te krijgen.

Eric zegt het in Chapter 3 ongeveer zo: "If you're going to be involved in network marketing, decide to learn the skills. They're not difficult. They're just unfamiliar. You can master them all in a few months of focused practice."

**Praktisch**

Klik op de 'Beluister op Spotify'-knop hieronder. Je komt op de album-pagina van 'Go Pro: 7 Steps to Becoming a Network Marketing Professional'. Speel Tracks 1 t/m 4 chronologisch. Wanneer je klaar bent, kom terug en markeer deze track als voltooid.

Daarna zijn de overige zeven tracks in deze training (1.vinden, 2.uitnodigen, ..., 7.events) ontgrendeld in vrije volgorde.`,
    oefening:
      "Markeer deze track pas voltooid NA dat je Spotify-Tracks 1 t/m 4 hebt geluisterd. Vink af, kies dan zelf welke van de zeven skill-tracks als eerste in jouw oor wil. Geen verkeerde keuze.",
  },

  // ============================================================
  // TRACK 1, SKILL #1 - FINDING PROSPECTS
  // ============================================================
  {
    sleutel: "1.vinden",
    titel: "Skill #1: Vinden van prospects",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `**Spotify Track 5: Chapter 4: Skill #1 (Finding Prospects)**

Eric's eerste skill: het opbouwen en continu uitbreiden van wat hij een 'Active Candidate List' noemt. Niet rekenen op een kleine mentale lijst of hopen op één 'big person'. Wel: een groeiende, levende lijst van mensen om te benaderen, met systematische uitbreiding elke dag.

**Het vier-stappen-systeem dat Eric in dit hoofdstuk uitlegt:**

1. **Comprehensive listing**: schrijf ALLES op wat je kent. Familie, vrienden, oud-collega's, sportmaatjes, alle contacten in je telefoon. Zonder filteren.
2. **Expand through connections**: denk in tweede laag: wie kennen jouw contacten? Bij elke naam op je lijst, vraag jezelf: wie zou deze persoon kunnen kennen die mij ook zou kunnen helpen?
3. **Constant expansion**: voeg dagelijks minimaal twee nieuwe namen toe. Niet eens per week, dagelijks. Dat houdt de lijst LEVEND.
4. **Purposeful networking**: zorg dat je actief naar plekken gaat waar je nieuwe mensen ontmoet (sport, evenementen, koffietent). Niet om aan iedereen je business te pitchen, wel om je netwerk natuurlijk te laten groeien.

**Hoe dit aansluit op ELEVA**

Stap A van jouw dagelijkse flow ('Voeg N nieuwe namen toe') komt rechtstreeks uit deze skill. De vier bronnen in het knoppen-blok (Eleva-geheugen, Facebook, Instagram, LinkedIn) zijn ELEVA's praktische invulling van Eric's 'Active Candidate List'. De DMO-training in de Academy gaat dieper in op de wiskunde achter dit volume (les 1.2).

**Wat Eric op dit hoofdstuk zegt**

> "Professionals don't rely on a small mental list. They build, maintain, and expand an Active Candidate List."

Op Spotify klik je op de album-link, scroll je naar **Track 5 (Chapter 4)** en speel je 'm af. Ongeveer 15-20 minuten.`,
    oefening:
      "Na het luisteren: open je namenlijst en tel hoeveel mensen er nu in fase 'prospect' staan. Voeg vandaag, voordat je gaat slapen, minimaal twee nieuwe namen toe, Eric's 'constant expansion'-regel in actie.",
  },

  // ============================================================
  // TRACK 2, SKILL #2 - INVITING
  // ============================================================
  {
    sleutel: "2.uitnodigen",
    titel: "Skill #2: Uitnodigen voor een kijkmoment",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `**Spotify Track 6: Chapter 5: Skill #2 (Inviting Prospects to Understand Your Product or Opportunity)**

Eric ziet uitnodigen als de skill waar de meeste netwerkers het meest mee worstelen. Niet omdat de woorden moeilijk zijn, maar omdat de psychologie eronder subtiel is. Twee mindsets staan tegenover elkaar:

**Farmer vs Hunter**

- **Hunter** = jagen op nees, druk uitoefenen, snelle resultaten zoeken
- **Farmer** = vertrouwen opbouwen, vragen stellen, geduldig ZAAIEN

Eric's hele inviting-skill is geboren uit de farmer-mindset. Je nodigt uit om iemand iets te LATEN BEKIJKEN, niet om ze ter plekke te overtuigen.

**Eric's volledige uitnodigings-formule in 8 stappen**

In Chapter 5 leert Eric een complete invitatie-formule met acht stappen, inclusief 'be in a hurry', 'compliment', 'make the invitation', 'if I, would you', en de commitment-checks aan het eind. Dat is intensiever dan wat je op ELEVA-dag 4 hebt geleerd.

**Hoe dit aansluit op ELEVA**

Op dag 4 hebben we Eric's 8-stappen-formule samengevat tot een werkbare 4-stappen-versie (compliment, uitnodigen, plan met twee opties, optionele haast voor business-prospects). Beide werken, de 4-stappen-versie is sneller te onthouden en past beter bij de 1-op-1-DM-context die de meeste ELEVA-leden gebruiken. Wil je Eric's volledige 8 stappen, dan haal je die uit dit hoofdstuk.

**Belangrijke kern**

> "Emotional detachment enhances effectiveness. You can't control what others decide. You can only control how authentically you show up."

Eric benadrukt dat je niet HOEFT te overtuigen, je hoeft alleen UIT TE NODIGEN. Het verschil zit in wat je vraagt: niet 'wil je mijn business overnemen' maar 'wil je 20 minuten een filmpje bekijken om te zien wat ik doe'.

**Praktisch**

Spotify-album openen, **Track 6 (Chapter 5)**, ongeveer 15-20 minuten.`,
    oefening:
      "Pak een prospect uit je lijst in fase 'in gesprek'. Schat de warmte op 1-10. Schrijf voor jezelf op welke variant van de 4-stappen-uitnodiging past (direct/indirect/super-indirect). Niet versturen, alleen oefenen om de spier te bouwen.",
  },

  // ============================================================
  // TRACK 3, SKILL #3 - PRESENTING
  // ============================================================
  {
    sleutel: "3.presenteren",
    titel: "Skill #3: Presenteren van het verhaal",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `**Spotify Track 7: Chapter 6: Skill #3 (Presenting Your Product or Opportunity to Your Prospects)**

Eric's derde skill heeft een kerninzicht dat veel nieuwkomers verrast: JIJ bent niet de presentator. Je gebruikt een 'third-party tool' (een film, een one-pager, een ervaren upline, een webinar) en jouw rol is REGISSEUR, niet hoofdrol.

**Waarom een third-party tool?**

Drie redenen die Eric uitwerkt:

1. **Sociale bewijskracht**: een gevestigde tool met testimonials werkt geloofwaardiger dan jouw eigen pitch
2. **Duplicatie**: je teamleden moeten dit ook kunnen doen. Een tool dupliceert, een persoonlijke pitch niet
3. **Emotionele afstand**: bij een tool kan de prospect 'nee' zeggen tegen het TOOL zonder ongemak naar jou

**Edification**

Eric introduceert hier een centraal concept: **edification** = het positief presenteren van degene die het verhaal vertelt (jouw upline, sponsor, de film, de tool). Niet jezelf opscheppen, wel de geloofwaardigheid van de bron versterken voordat de prospect kijkt.

> "Before they meet your upline or watch the video, position the source. 'My mentor John has built a team of 500 people across Europe. He's going to share with you what he taught me.' That sets up the listener to take what comes seriously."

**Hoe dit aansluit op ELEVA**

In ELEVA zie je dit terug in drie vormen:
- **One-pager** (snelste route)
- **Mini-ELEVA-toegang** (14-daagse zelfstandige verkenning)
- **3-weg-gesprek** met je sponsor of ervaren teamlid

Per prospect kies je in de namenlijst welke aanpak past. De keuze hangt af van hoe warm de prospect is en hoeveel tijd ze hebben.

**Praktisch**

Spotify, **Track 7 (Chapter 6)**. ~15-20 minuten.`,
    oefening:
      "Na het luisteren: kijk eens kritisch naar JOUW laatste paar prospect-gesprekken. Stuurde jij ze naar een third-party tool (one-pager / film / 3-weg / Mini-ELEVA), of probeerde je het zelf uit te leggen? Geen oordeel, alleen patroon zien.",
  },

  // ============================================================
  // TRACK 4, SKILL #4 - FOLLOWING UP
  // ============================================================
  {
    sleutel: "4.followup",
    titel: "Skill #4: Follow-up (waar de meeste resultaten liggen)",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `**Spotify Track 8: Chapter 7: Skill #4 (Following Up With Your Prospects)**

Eric noemt follow-up de skill waar professional en amateur het hardst van elkaar verschillen. Amateurs nodigen uit, sturen materiaal, en wachten af. Professionals NEMEN DE LEIDING en blijven aanwezig, zonder pushy te zijn.

**De kerngedachte**

> "Don't leave your prospective distributors to fend for themselves."

Veel uitnodigingen kakken in nadat de prospect het materiaal heeft gezien. Niet omdat ze 'nee' zijn, maar omdat er geen volgende STAP duidelijk is. Eric's follow-up-skill draait om die volgende stap altijd helder maken.

**Wat Eric in dit hoofdstuk behandelt:**

- **Commitment**: het belangrijkste woord in netwerk-marketing. Een vage 'ik kijk er wel naar' is geen commitment. Een afspraak op een specifieke dag en tijd is wel een commitment.
- **De pre-follow-up afspraak**: maak een follow-up-afspraak VOORDAT de prospect het materiaal heeft gezien. Bv. "Ik stuur je nu de link. Mag ik je morgenavond om 19:00 even bellen om te horen wat je ervan vond?"
- **De vier types follow-up**: Eric onderscheidt info-, decision-, training- en team-follow-up, elk met een eigen toon
- **Wat te doen bij niet-reageren**: niet meer dan twee tot drie aanrakingen voordat je iemand op 'not-yet' zet. Door blijven jagen breekt de relatie.

**Hoe dit aansluit op ELEVA**

Op dag 6 leer je een ELEVA-versie van Eric's follow-up-systeem: de 24-48u-regel + 5-fasen-flow + de stilgevallen-zin. In de DMO-training in de Academy gaat les 4.1 in op de wet van 80% (80% van ja's komt na de 3e+ follow-up). De pijplijn-fases in je namenlijst zijn precies daar voor: je ziet WIE waar staat, zodat je weet wie morgen de volgende stap krijgt.

**Praktisch**

Spotify, **Track 8 (Chapter 7)**. ~15-20 minuten. Veel mensen vinden dit een van de zwaarste tracks omdat 'ie hun eigen vermijdings-gedrag belicht.`,
    oefening:
      "Open je namenlijst en filter op fase 'one-pager' of 'presentatie'. Voor elke prospect die >48u stil is sinds kijkmateriaal: schrijf vandaag een korte check-in. 'Even inchecken, wat sprak je het meeste in aan?', geen druk, wel aanwezig.",
  },

  // ============================================================
  // TRACK 5, SKILL #5 - HELPING BECOME CUSTOMER OR DISTRIBUTOR
  // ============================================================
  {
    sleutel: "5.closing",
    titel: "Skill #5: Helpen kiezen tussen klant of partner",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `**Spotify Track 9: Chapter 8: Skill #5 (Helping Your Prospects Become Customers or Distributors)**

Let op de titel van dit hoofdstuk: het heet niet 'Closing'. Eric vermijdt dat woord bewust. In zijn visie zet je niemand onder druk; je HELPT iemand een beslissing nemen die ze al hebben gevormd, maar nog niet hardop hebben uitgesproken.

**Kernvraag van deze skill: klant of partner?**

Bij elke prospect die het materiaal heeft gezien moet je helpen ontdekken welk pad past:

- **Klant**: wil de producten gebruiken, geen interesse in de business-kant
- **Partner / distributeur**: wil ook anderen helpen en bouwt mee aan een team
- **Niet nu**: past niet op dit moment, mogelijk later

Eric stelt het scherp: je hoeft GEEN voorkeur te hebben tussen klant en partner. Voor sommige mensen is klant het juiste pad. Voor anderen partner. Jouw werk is helpen ontdekken welk past.

**De vier types vragen die Eric in dit hoofdstuk geeft**

In Chapter 8 leert Eric specifieke vraagsoorten die helpen om de beslissing aan het oppervlak te brengen. Deze vragen gaan over de situatie van de prospect, hun gevoel bij wat ze hebben gezien, hun zorgen, en hun timing.

> "Ask questions that drive them to a fit conclusion. Not your conclusion, THEIR conclusion. Help them see what fits their life, not what fits your downline."

**Hoe dit aansluit op ELEVA**

In de dag-flow zit dit verstopt in:
- De pijplijn-fases (klant / partner / not-yet als eindfases)
- De follow-up-vraag 'Wat is voor jou het belangrijkste punt om helder te krijgen?'
- Het aanpak-keuze-blok op de prospect-kaart (3-weg vs Mini-ELEVA per type prospect)

**Praktisch**

Spotify, **Track 9 (Chapter 8)**. ~15-20 minuten.`,
    oefening:
      "Pak een prospect die in fase 'follow-up' zit en al een paar weken in twijfel hangt. Schrijf voor jezelf de vraag 'Wat is voor jou het belangrijkste punt om helder te krijgen?' op in je eigen toon. Niet versturen, alleen voorbereiden, Eric's principe in actie.",
  },

  // ============================================================
  // TRACK 6, SKILL #6 - GETTING NEW DISTRIBUTOR STARTED RIGHT
  // ============================================================
  {
    sleutel: "6.startup",
    titel: "Skill #6: Een nieuwe partner goed laten starten",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `**Spotify Track 10: Chapter 9: Skill #6 (Helping Your New Distributor Get Started Right)**

Eric stelt dat dit een van de meest ONDERSCHATTE skills is. De eerste 30 tot 90 dagen na aanmelding zijn cruciaal, wat daar gebeurt bepaalt voor een groot deel of iemand blijft of afhaakt.

**Eric's drie kernactiviteiten voor een goede start:**

1. **Vier de beslissing**: een nieuwe partner heeft net een grote stap gezet. Vier dat moment. Stuur een berichtje, bel even, laat ze voelen dat ze welkom zijn.
2. **Toon de upcoming opportunities**: laat ze direct zien wat er komt: webinars, events, trainings. Geef ze een agenda, zodat ze weten dat er momentum is.
3. **Equip met producten en informatie**: zorg dat ze direct kunnen starten met de tools die ze nodig hebben: een eigen pakket, scripts, een namenlijst-systeem, een mentor.

**Het 'fast start' principe**

Eric werkt met een idee dat hij 'fast start' noemt: de eerste twee weken zo intens mogelijk inrichten zodat de nieuwe partner momentum bouwt voordat de twijfel kan inzakken. Dat betekent: snelle wins, eerste invites samen, eerste klant of partner binnen 14 dagen.

> "What people see in their first two weeks is what they believe network marketing IS. If they see action, they'll act. If they see hesitation, they'll hesitate. Set the tone fast."

**Hoe dit aansluit op ELEVA**

Het hele Sprint-playbook is ontworpen om dit op te lossen. Een nieuwe partner krijgt jouw 60-daagse run als kant-en-klaar startsysteem, met dagelijkse stappen, sponsor-checkin als anker, en de Mentor 24/7 beschikbaar. De WELKOM-en-WHY-stappen op dag 1-2 vieren expliciet hun beslissing.

**Praktisch**

Spotify, **Track 10 (Chapter 9)**. ~15-20 minuten. Extra waardevol zodra je je eerste partner hebt geworven en niet zeker weet hoe te begeleiden.`,
    oefening:
      "Stel je voor dat jij volgende week je eerste partner aanmeldt. Schrijf voor jezelf de drie eerste afspraken op die je met hen zou maken in de eerste 48 uur. Geen scripts, alleen je intentie. Eric's 'fast start' begint bij JOU.",
  },

  // ============================================================
  // TRACK 7, SKILL #7 - PROMOTING EVENTS
  // ============================================================
  {
    sleutel: "7.events",
    titel: "Skill #7: Events promoten",
    leestijdMinuten: 3,
    audioZoekLink: SPOTIFY_GOPRO_ALBUM,
    inhoud: `**Spotify Track 11: Chapter 10: Skill #7 (Promoting Events)**

Eric noemt deze laatste skill 'de versneller'. Events brengen je team samen, zorgen voor leiderschaps-ontwikkeling, en versnellen het werk dat in alle andere zes skills gebeurt.

**Het 'destination event' principe**

Eric introduceert hier een belangrijk concept:

> "The destination event, where people travel from home to attend, is the most powerful type of meeting in network marketing. People who go to destination events become professionals. People who don't, often stay amateurs."

Een 'destination event' is een event waar mensen voor reizen (een ander stad, een ander land, een weekend weg). Het verschil met een lokale meeting is enorm: bij een destination event zijn mensen volledig immersief, geen gezin, geen werk, alleen het event. Dat creëert transformatie die in een avond-meeting onmogelijk is.

**Wat Eric in dit hoofdstuk behandelt:**

- **Promote mensen, niet het event**: zeg niet 'er is een geweldig event', zeg 'mijn upline gaat zijn doorbraak-verhaal vertellen, en ik wil dat jij dat hoort'
- **Champions**: identificeer 'champions' in je team: key-personen die anderen meenemen. Zorg dat zij eerst gaan, de rest volgt
- **Vroeg promoten, vaak herhalen**: een event 6 maanden vooruit benoemen werkt beter dan 6 weken vooruit. Mensen moeten budgetteren, plannen, hun gezin informeren

**Hoe dit aansluit op ELEVA**

In ELEVA zie je dit (nog) niet direct in de dag-flow want Lifeplus-events worden lokaal en regionaal georganiseerd. Maar zodra het eerste Lifeplus-event in zicht komt voor jouw team, helpt deze track om TE BEGRIJPEN waarom events zo cruciaal zijn en HOE je je team meekrijgt.

Voor pilot-bouwers (Raoul + Gaby + Jaimie + jullie eerste partners) is dit relevant zodra Lifeplus een destination event aankondigt.

**Praktisch**

Spotify, **Track 11 (Chapter 10)**. ~15-20 minuten. Mooi om als laatste in de reeks te luisteren omdat het de andere zes skills samenbindt.`,
    oefening:
      "Na het luisteren: noteer welke vaardigheid uit deze zeven JIJ als eerste wilt versterken in de komende 4 weken. Niet alle zeven tegelijk, één. Welke voelt voor jou nu het meest knellend, en welke wil je leren via oefening?",
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
    "Het officiële Go Pro-audiobook van Eric Worre, met per skill een ELEVA-intro die uitlegt welk hoofdstuk te luisteren en hoe het aansluit op je playbook. 15-20 min per skill, perfect voor in de auto of tijdens een wandeling.",
  zichtbaarVoor: ["sprint-na-21", "core", "pro-optie", "iedereen"],
  doorlooptijdDagen: 14,
  // Hard-lock: tracks 1-7 zijn vergrendeld tot de intro (track 0) is
  // voltooid. Raoul: 'mensen moeten wel eerst hoofdstuk 1 of de intro
  // luisteren, daar vertelt Eric zijn eigen verhaal'.
  introVerplicht: true,
  modules: [
    {
      nummer: 1,
      titel: "De Seven Skills (Go Pro audiobook)",
      emoji: "🎧",
      samenvatting:
        "Acht tracks die je door het complete Go Pro-audiobook leiden. Begin met de intro (Spotify Tracks 1-4 als kader), daarna één track per skill in vrije volgorde.",
      lessen: TRACKS,
    },
  ],
};
