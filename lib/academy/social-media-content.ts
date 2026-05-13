// ============================================================
// lib/academy/social-media-content.ts
//
// Eerste training in ELEVA Academy: 'Social Media Strategie',
// gebaseerd op Frazer Brookes-principes, in ELEVA's anti-spam-stem.
//
// 14 modules, 42 lessen, eigen tempo. Voor Core (prominent),
// Sprint-na-dag-21 (prominent) en Pro (optioneel).
//
// Status (2026-05-13):
//   - Alle 14 modules + 42 les-titels: ✓ gedefinieerd
//   - Volledig uitgewerkte lessen (inhoud + oefening): module 1
//   - Rest: placeholder-inhoud, te schrijven in volgende rondes.
//     Verwachte update na 12 dagen wanneer Raoul Frazer Brookes'
//     eigen training heeft afgerond en aanvullende input geeft.
// ============================================================

import type { AcademyTraining, AcademyLes } from "./types";

// ---------- Placeholder-helper voor nog-niet-geschreven lessen ----------
// Voorkomt dat we 42x dezelfde fallback-tekst moeten typen. Lessen die
// volledig uitgewerkt zijn overschrijven dit via een eigen object.
function placeholder(sleutel: string, titel: string): AcademyLes {
  return {
    sleutel,
    titel,
    leestijdMinuten: 10,
    inhoud:
      "Deze les wordt komende weken volledig uitgewerkt. De inhoud is gebaseerd op de principes van Frazer Brookes (Build, Be Recruitable) en wordt aangevuld na input vanuit zijn live-training.\n\nVoor nu kun je vast de andere lessen doorlopen — de volgorde is flexibel binnen elk blok.",
    oefening:
      "Open Instagram of Facebook en kijk: wie volgt jou al een tijdje? Wie reageert wel eens op je stories? Schrijf 3 namen op die opvallen, ook al weet je niet meteen waarom.",
  };
}

// ============================================================
// MODULE 1, lessen volledig uitgewerkt
// ============================================================

const MODULE_1_LESSEN: AcademyLes[] = [
  {
    sleutel: "1.1",
    titel: "Waarom social media werkt voor jouw business",
    leestijdMinuten: 10,
    inhoud: `Social media is geen verkooppodium. Het is een ontmoetingsplek. Je gaat er niet heen om te roepen wat je verkoopt, je gaat er heen om mensen te leren kennen en zelf gezien te worden voor wie je bent.

Voor netwerk-marketing maakt dat het krachtigste medium ooit. Niet vanwege de cijfers (volgers, likes, views), maar vanwege wat de cijfers wegmoffelen: **echte conversaties met mensen die je anders nooit had ontmoet**.

Frazer Brookes noemt het de "coffee shop conversation" filosofie. Stel je voor dat je elke ochtend naar dezelfde koffietent loopt. Je zit, kijkt om je heen, ziet bekenden, knoopt een praatje aan. Je verkoopt niets. Je toont alleen wie je bent en je vraagt hoe het met de ander gaat. Dat is wat social media zou moeten zijn voor jou.

Het probleem is dat de meeste mensen social media gebruiken als een **megafoon** in plaats van als een **koffietent**. Ze posten "ik zoek 5 mensen die..." of "stuur me een 1 als je geïnteresseerd bent in extra inkomen". Dat is roepen. Mensen voelen het van mijlen ver en negeren het.

**De drie redenen waarom social media voor jou werkt (mits goed gedaan):**

1. **Het is gratis bereik.** Je hoeft geen advertenties te kopen om mensen te leren kennen. Eén comment op de juiste persoon is genoeg.

2. **Het is asynchroon.** Je hoeft niet altijd "aan" te staan. Je legt een story, iemand kijkt 'm 3 uur later, reageert, jij reageert weer terug. Geen agenda-druk.

3. **Het bouwt vertrouwen vanzelf.** Mensen die jou 3 maanden op socials volgen voordat ze met je in gesprek gaan, voelen alsof ze je al kennen. Dat verkort het verkoopwerk-traject enorm, juist omdat je niet hebt verkocht.

**Wat we gaan leren in deze training:**

- Je profiel inrichten zodat het magneten plaatst
- Een dagelijks ritueel om consistent te bouwen zonder vol gevoel
- Nieuwe mensen vinden in je nichelle, niet random
- Stories en posts maken die werken zonder dat je hoeft te pitchen
- Gesprekken in je DM voeren die natuurlijk overgaan naar uitnodigingen

Dat is wat hier komt. 42 lessen, 6 weken, je eigen tempo.`,
    oefening:
      "Open Instagram, Facebook of LinkedIn. Scroll 2 minuten. Tel: hoeveel mensen 'verkopen' op je tijdlijn (kom-koop-mijn-spul stijl), en hoeveel mensen 'delen' (leven, verhalen, momenten)? Welke voelt prettiger? Welke groep wil jij in zitten?",
  },
  {
    sleutel: "1.2",
    titel: "De fout die 95% maakt — broadcast versus conversatie",
    leestijdMinuten: 9,
    inhoud: `Er zijn twee soorten mensen op social media. Broadcasters en conversators.

**Broadcasters** posten, plaatsen, sturen mass-DM's. Zij praten TEGEN mensen. Hun feed is een advertentie-bord. Hun DM is een copy-paste. Hun stories zeggen "kijk eens wat ik aanbied". Ze tellen volgers, likes en impressies. Het voelt actief, maar het levert weinig op.

**Conversators** kijken om zich heen. Zij praten MET mensen. Ze stellen vragen, reageren oprecht op stories van anderen, sturen 1-op-1 berichten die ook echt 1-op-1 zijn. Ze tellen hoeveel echte gesprekken ze hebben gevoerd. Het voelt minder spectaculair, maar het bouwt aan iets dat blijft.

Frazer Brookes is hier scherp over: **95% van de mensen op social media is een broadcaster, en 95% van hen krijgt geen serieuze resultaten**. De 5% die wel resultaten boekt zijn de conversators.

**Waarom werkt broadcast niet meer?**

Algoritmes hebben geleerd om reclame te herkennen, zelfs als je het verbergt achter een lifestyle-foto. Mensen hebben geleerd om scrolling-modus aan te zetten zodra ze "kom-koop-mijn-spul" voelen. Ze swipen erover heen zonder er bewust naar te kijken.

Een DM-gesprek waarin jij oprecht vraagt "hé, ik zag je verhaal over je nieuwe baan, hoe is het bevallen?" wordt gelezen. Een DM die zegt "hé, mag ik je iets unieks laten zien?" wordt genegeerd.

**Hoe word je een conversator?**

Drie kleine verschuivingen die meteen werken:

1. **Voor je iets post: vraag je af wie zou hierop kunnen reageren?** Niet "wie zou dit moeten kopen". Reactie-gericht denken in plaats van conversie-gericht.

2. **Voor je een DM stuurt: heb je in de afgelopen weken écht gereageerd op iets van die persoon?** Zo nee, doe dat eerst.

3. **Voor je een story plaatst: wat zou een vriendin van je vandaag interessant vinden om te zien uit jouw dag?** Niet "wat moet ik nu posten om mensen te triggeren".

Het verschil is subtiel maar enorm. Broadcasters proberen mensen te bereiken. Conversators bouwen aan een netwerk waar mensen jou zelf opzoeken.

**Wat dit voor jouw dagelijkse social-media-tijd betekent:**

Stop met posten in de hoop dat iemand reageert. Begin met **drie minuten oprecht aandacht geven aan stories en posts van anderen**. Daarna mag je zelf iets plaatsen, en dan ga je een paar gesprekken vervolgen in je DM. Dat is je dag op socials, simpeler dan je dacht.`,
    oefening:
      "Pak je telefoon. Open Instagram. Reageer op 3 stories van mensen die je een tijdje niet hebt gesproken. Geen emoji, maar 1 echte zin: 'oh dat ziet er gezellig uit, was je in [plaats]?' of 'goeie keuze, hoe was het?'. Geen verwachting, geen agenda. Kijk wat er gebeurt.",
  },
  {
    sleutel: "1.3",
    titel: "Be a Creator, not a Consumer (de 80/20-regel)",
    leestijdMinuten: 8,
    inhoud: `Hoeveel uur per dag scrol jij op social media? Reken eens eerlijk. 30 minuten? Een uur? Anderhalf?

En hoeveel daarvan ben je **aan het maken** in plaats van **aan het consumeren**?

Voor de meeste mensen is dat 0%. Pure consumptie. Doom-scrolling. Andermans levens kijken zonder iets bij te dragen. Dat voelt alsof je "iets doet op social media", maar je bouwt aan andermans business, niet aan die van jezelf.

Frazer Brookes' regel is glashelder: **80% van je social-media-tijd zou creating moeten zijn, 20% consuming**.

**Wat is creating?**

- Een story plaatsen
- Een comment schrijven onder iemands post
- Een DM sturen of beantwoorden
- Een Reel of post maken
- Een vraag stellen in een story
- Iemand getagd worden in een groepsgesprek en daar bijdragen

**Wat is consuming?**

- Scrollen door je feed zonder te reageren
- Stories kijken zonder erop te reageren
- Iemands profiel bekijken zonder iets te doen
- Reels kijken voor entertainment

Beide hebben hun plek. Consuming geeft je inspiratie, brengt je in contact met content, laat je voelen wat werkt voor anderen. Maar als je 100% consumeert, bouw je niets.

**Hoe pas je dit toe?**

Eenvoudig. Voordat je naar social media gaat, stel jezelf 1 vraag:

> *"Ga ik nu iets MAKEN of iets KIJKEN?"*

Als het maken is, ga je gericht naar binnen. Je opent niet je feed, je opent je DM of je camera. Je doet wat je was van plan, en je sluit de app.

Als het kijken is, geef je jezelf een tijdslimiet. 10 minuten. Daarna sluit je af. Of: voor elke 5 stories die je kijkt, geef je er 1 een echte reactie. Dan wordt het consuming-met-output.

**Het effect na 30 dagen:**

Mensen die deze regel volgen merken na een paar weken iets vreemds: ze besteden MINDER tijd aan social media, maar krijgen ER MEER UIT. Eén comment van vandaag wordt morgen een DM-gesprek. Eén story van gisteren wordt vandaag een vraag. Het bouwt op.

Mensen die blijven scrollen merken niets. Logisch. Ze bouwen niet, dus er gebeurt niets.

**Voor jouw 3-Minutes Method later in deze training:**

Onthoud deze regel. De 3 ochtend-minuten, 3 middag-minuten en 3 avond-minuten zijn allemaal CREATING-minuten. Geen kijken. Maken. Reageren. Sturen. Vragen.

Daarover gaat module 7. Eerst dit principe in je hoofd verankeren.`,
    oefening:
      "Zet vandaag een timer van 10 minuten op je telefoon zodra je social media opent. Wanneer hij afgaat: dwing jezelf om 1 ding te MAKEN voordat je sluit (1 story, 1 reactie, 1 DM). Maakt niet uit wat, als het maar iets is dat de wereld in gaat.",
  },
];

// ============================================================
// MODULE-DEFINITIES, structuur compleet, content placeholder
// voor module 2-14 totdat ze in volgende rondes worden uitgeschreven.
// ============================================================

export const SOCIAL_MEDIA_TRAINING: AcademyTraining = {
  slug: "social-media",
  titel: "Social Media Strategie",
  emoji: "📱",
  pitch:
    "Bouw een rustige, sterke aanwezigheid op social media. Vind nieuwe mensen zonder spam, voer gesprekken die natuurlijk overgaan naar uitnodigingen.",
  zichtbaarVoor: ["core", "sprint-na-21", "pro-optie"],
  doorlooptijdDagen: 42,
  modules: [
    {
      nummer: 1,
      titel: "Mindset & filosofie",
      emoji: "🧠",
      samenvatting:
        "Waarom social media werkt voor netwerk-bouw, en welke fundamentele fout 95% maakt.",
      lessen: MODULE_1_LESSEN,
    },
    {
      nummer: 2,
      titel: "Je profiel-fundament",
      emoji: "🪞",
      samenvatting:
        "Bio, profielfoto en eerste indruk. De basis voordat je gaat bouwen.",
      lessen: [
        placeholder("2.1", "Wat zegt jouw bio over wie je bent"),
        placeholder("2.2", "Profielfoto en banner als eerste indruk"),
        placeholder("2.3", "De link in je bio: gebruik 'm slim"),
      ],
    },
    {
      nummer: 3,
      titel: "Je positionering",
      emoji: "🎯",
      samenvatting: "Welke 3 thema's claim jij als jouw terrein op socials.",
      lessen: [
        placeholder("3.1", "Je 3 content-pillars vinden"),
        placeholder("3.2", "Niche zonder jezelf op te sluiten"),
        placeholder("3.3", "Je positionering testen en bijschaven"),
      ],
    },
    {
      nummer: 4,
      titel: "Je profiel-look",
      emoji: "🎨",
      samenvatting:
        "Banner, highlights, story-archief en je eerste 9 posts grid.",
      lessen: [
        placeholder("4.1", "Highlights als geheugen van je profiel"),
        placeholder("4.2", "Je eerste 9 posts grid bewust opbouwen"),
        placeholder("4.3", "Visuele consistentie zonder design-stress"),
      ],
    },
    {
      nummer: 5,
      titel: "Waar zit jouw doelgroep",
      emoji: "🔍",
      samenvatting:
        "Hashtags, plaatsen en accounts om gericht nieuwe mensen te ontdekken.",
      lessen: [
        placeholder("5.1", "Hashtags die jouw doelgroep echt gebruikt"),
        placeholder("5.2", "Plaats-tags en lokale community's"),
        placeholder("5.3", "Welke 5 accounts moet je volgen?"),
      ],
    },
    {
      nummer: 6,
      titel: "De NLB-formule",
      emoji: "🤝",
      samenvatting:
        "New, Like, Begin. Het dagelijks ritueel om nieuwe mensen op je radar te krijgen.",
      lessen: [
        placeholder("6.1", "New: gericht connecten zonder random te zijn"),
        placeholder("6.2", "Like: hoe je écht reageert op content"),
        placeholder("6.3", "Begin: de eerste DM die geen verkoop voelt"),
      ],
    },
    {
      nummer: 7,
      titel: "De 3-Minutes Method",
      emoji: "⏱️",
      samenvatting:
        "3 min 's ochtends, 3 's middags, 3 's avonds. Het dagelijks ritueel zonder druk.",
      lessen: [
        placeholder("7.1", "Wat doe je in 3 ochtend-minuten"),
        placeholder("7.2", "De middag- en avond-sessie ingericht"),
        placeholder("7.3", "Wat te doen als je een dag mist"),
      ],
    },
    {
      nummer: 8,
      titel: "Stories die werken",
      emoji: "📸",
      samenvatting:
        "Story-first filosofie en 5 soorten stories die altijd raken.",
      lessen: [
        placeholder("8.1", "Waarom stories meer doen dan feed-posts"),
        placeholder("8.2", "5 soorten stories die werken"),
        placeholder("8.3", "Wat absoluut niet in je stories hoort"),
      ],
    },
    {
      nummer: 9,
      titel: "Reels, feed en positie-content",
      emoji: "🎬",
      samenvatting:
        "De zwaardere content die je positie bouwt, niet voor dagelijks maar 1-2 keer per week.",
      lessen: [
        placeholder("9.1", "Reels die mensen écht aanspreken"),
        placeholder("9.2", "Feed-posts als langduriger anker"),
        placeholder("9.3", "1-2 keer per week, geen dwang"),
      ],
    },
    {
      nummer: 10,
      titel: "Lifestyle-leakage in plaats van pitches",
      emoji: "🌱",
      samenvatting:
        "Laten zien hoe je leeft trekt mensen aan, pitchen jaagt ze weg.",
      lessen: [
        placeholder("10.1", "Wat is lifestyle-leakage precies"),
        placeholder("10.2", "Jouw verhaal vs. een product-verhaal"),
        placeholder("10.3", "80% leven, 20% business, zonder geforceerd"),
      ],
    },
    {
      nummer: 11,
      titel: "Doorvragen + FORM",
      emoji: "💬",
      samenvatting:
        "De FORM-methode (Family, Occupation, Recreation, Message) als gespreks-kompas.",
      lessen: [
        placeholder("11.1", "Open vragen die uitnodigen, gesloten vragen die afsluiten"),
        placeholder("11.2", "De FORM-methode in een DM-gesprek"),
        placeholder("11.3", "Luisteren > vertellen, ook in tekst"),
      ],
    },
    {
      nummer: 12,
      titel: "Van DM naar uitnodiging",
      emoji: "📨",
      samenvatting: "De Honest Conversation script en wanneer iemand er klaar voor is.",
      lessen: [
        placeholder("12.1", "Wanneer is iemand 'klaar' om uitgenodigd te worden"),
        placeholder("12.2", "De Honest Conversation: eerlijk vooraf zeggen wat het is"),
        placeholder("12.3", "Edification: jouw sponsor goed introduceren"),
      ],
    },
    {
      nummer: 13,
      titel: "Bezwaren omgaan zonder pushy te worden",
      emoji: "🛡️",
      samenvatting:
        "Wat zeg je bij 'is dit een pyramid?', 'ik heb geen tijd', 'is het wel veilig?'",
      lessen: [
        placeholder("13.1", "Feel-Felt-Found: erkennen, normaliseren, herframen"),
        placeholder("13.2", "De meest voorkomende bezwaren omarmen"),
        placeholder("13.3", "Wanneer mag je een 'nee' rustig laten staan"),
      ],
    },
    {
      nummer: 14,
      titel: "Daily habits + meten + je 30-dagen-plan",
      emoji: "📊",
      samenvatting:
        "Hoe maak je het tot een gewoonte die 60+ dagen blijft draaien.",
      lessen: [
        placeholder("14.1", "Wat moet je meten, en wat niet"),
        placeholder("14.2", "Wekelijkse review als spiegelpunt"),
        placeholder("14.3", "Jouw eigen 30-dagen-plan opstellen"),
      ],
    },
  ],
};
