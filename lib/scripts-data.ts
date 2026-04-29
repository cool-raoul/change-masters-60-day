// Scripts bibliotheek — samengesteld uit de Change Masters PDF's
// uitnodigingen.pdf + bezwaren etc.pdf

export const SCRIPTS_DATA = [
  // =============================================
  // UITNODIGINGEN
  // =============================================
  {
    titel: "60-Dagen Script — Persoonlijk",
    categorie: "uitnodiging" as const,
    pipeline_fase: "lead" as const,
    tags: ["60-dagen", "persoonlijk", "koffie", "zoom"],
    inhoud: `"Hey [naam], ik moest even aan je denken en daarom bel ik je.

Ik ga over twee weken starten met iets waar ik 60 dagen echt vol voor ga.

Een soort sprint, maar dan wel eentje waar ik echt impact mee wil maken.

En toen ik nadacht met wie ik dat zou willen doen… kwam jij in me op.

Ik weet niet of het bij je past.
Ik weet ook niet of je hier überhaupt op zit te wachten.

Maar ik weet wel dat jij iemand bent die dingen voor elkaar krijgt.

Dus voordat ik het straks overal ga delen… wilde ik jou als eerste even meenemen.

Ik wil je gewoon laten zien wat ik ga doen.

En dan mag jij zelf voelen: is dit iets voor mij of niet?

Zullen we even samen zitten? Koffie, lunch of even via Zoom?"`,
  },
  {
    titel: "60-Dagen Script — Direct & Eerlijk",
    categorie: "uitnodiging" as const,
    pipeline_fase: "lead" as const,
    tags: ["60-dagen", "direct", "eerlijk", "warme-prospect"],
    inhoud: `"Oké, ik ga gewoon eerlijk zijn.

Ik heb hier echt zin in.

Ik ga de komende 60 dagen iets neerzetten waar ik vol voor ga.

En toen ik nadacht met wie ik dat zou willen doen…
kwam jij meteen in me op.

Omdat jij niet iemand bent die een beetje aanklooit.
Als jij iets doet, dan doe je het goed.

En ik denk oprecht: als wij dit samen doen… kunnen we echt iets neerzetten.

Niet langzaam. Gewoon tempo maken.

Ik ga je zo alles laten zien, de producten, het plan, hoe het werkt… dat komt allemaal.

Maar eerst wil ik eigenlijk één ding weten:

Stel dat alles klopt, stel dat je voelt: dit past bij mij,
zou je dan zeggen: hier wil ik bij zijn? Of niet?"`,
  },
  {
    titel: "Whisper Campaign — Geheime start",
    categorie: "uitnodiging" as const,
    pipeline_fase: "lead" as const,
    tags: ["whisper", "exclusief", "nieuwsgierigheid"],
    inhoud: `"Niemand weet dit nog.

Maar ik ga over twee weken starten met iets groots.

60 dagen. Vol gas.

En toen ik nadacht met wie ik dat zou willen doen…
kwam jij in me op.

Dus voordat ik het straks overal ga delen,
wilde ik jou dit eerst laten weten.

Want als ik start, ga ik echt all-in
en dan heb ik minder ruimte.

Dus dit is eigenlijk je moment om even mee te kijken aan de voorkant.

Als je voelt: dit zou zomaar eens iets voor mij kunnen zijn —
laten we even zitten. Dan laat ik je zien wat ik ga doen."`,
  },
  {
    titel: "60-Dagen Plan Uitleg",
    categorie: "uitnodiging" as const,
    pipeline_fase: "lead" as const,
    tags: ["plan", "uitleg", "60-dagen", "fasen"],
    inhoud: `Uitleg van de 60-dagenrun die je kunt delen:

"Ik ga iets doen de komende 60 dagen.
Niet een beetje proberen. Echt gaan.

Ik start op 12 april en dan ga ik all-in.

De eerste 20 dagen: bouw ik mijn team
De tweede 20 dagen: ga ik met mijn team hun teams bouwen
De derde 20 dagen: gaan we opschalen en zorgen dat het staat

En ondertussen:
• werken we samen
• hebben we vaste momenten
• supporten we elkaar
• bouwen we iets wat blijft staan

Ik ga hier echt iets neerzetten.

En ik zoek geen massa —
ik zoek een paar mensen die dit met mij willen doen.

Dus stel… alles klopt, stel dat dit voelt als iets voor jou:
ben je dan in, of ben je uit?"`,
  },

  // =============================================
  // BEZWAREN BEHANDELING
  // =============================================
  {
    titel: "Feel Felt Found — Standaard aanpak",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["feel-felt-found", "bezwaar", "techniek"],
    inhoud: `De Feel-Felt-Found methode — gebruik bij elk bezwaar:

FEEL: "Ik snap dat dat zo voelt."
FELT: "Meer mensen voelden dat in het begin ook."
FOUND: "Wat zij uiteindelijk merkten, was dat het veel simpeler en beter te doen was dan ze eerst dachten."

Sluit ALTIJD af met een vraag.

Voorbeeld:
"Ik snap je helemaal. Meer mensen voelden dat in het begin ook. Wat zij uiteindelijk merkten, was dat het niet ging om perfect zijn, maar om een simpel systeem en begeleiding. Waar zit voor jou vooral de twijfel?"`,
  },
  {
    titel: "Bezwaar: Ik heb geen tijd",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["tijd", "bezwaar", "druk"],
    inhoud: `Bezwaar: "Ik heb geen tijd"

Werkbare reactie:
"Snap ik. Juist daarom spreekt dit mensen aan: het is stap voor stap op te bouwen naast wat je al doet. Meer mensen dachten eerst dat het niet in hun agenda paste, maar merkten later dat het juist werkte doordat het flexibel is."

Vraag terug:
"Als het simpel en behapbaar is, zou je er dan wel voor openstaan?"`,
  },
  {
    titel: "Bezwaar: Ik wil erover nadenken",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["nadenken", "twijfel", "bezwaar"],
    inhoud: `Bezwaar: "Ik wil erover nadenken"

Werkbare reactie:
"Helemaal prima. Vaak betekent dit niet dat iemand nee zegt, maar dat iets nog niet helder genoeg voelt."

Vraag terug:
"Waar wil je precies over nadenken: duidelijkheid, vertrouwen of timing?"`,
  },
  {
    titel: "Bezwaar: Ik ben niet van sales",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["sales", "bezwaar", "karakter"],
    inhoud: `Bezwaar: "Ik ben niet van sales"

Werkbare reactie:
"Dat hoeft ook niet. Het draait niet om pushen, maar om delen, laten kijken en goed opvolgen. Veel mensen die hier goed in werden, begonnen juist zonder salesachtergrond."

Vraag terug:
"Zou het beter bij je passen als je het op jouw eigen natuurlijke manier kunt doen?"`,
  },
  {
    titel: "Bezwaar: Ik ken te weinig mensen",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["netwerk", "bezwaar", "beginnen"],
    inhoud: `Bezwaar: "Ik ken te weinig mensen"

Werkbare reactie:
"Dat denken veel mensen in het begin. Het gaat niet om groot starten, maar om goed leren uitnodigen, opvolgen en dupliceren."

Vraag terug:
"Als je daar hulp bij krijgt, maakt dat dan verschil voor je?"`,
  },
  {
    titel: "Bezwaar: Ik heb geen geld / wil geen risico",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["geld", "risico", "bezwaar", "investering"],
    inhoud: `Bezwaar: "Ik heb geen geld" of "Ik wil geen risico"

Werkbare reactie:
"Begrijpelijk. Juist daarom is het belangrijk dat iemand klein, helder en zonder onnodige druk kan starten."

Vraag terug:
"Als het laagdrempelig is en realistisch voelt, wil je het dan serieus bekijken?"`,
  },
  {
    titel: "Bezwaar: Ik wil eerst met mijn partner overleggen",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["partner", "bezwaar", "overleg"],
    inhoud: `Bezwaar: "Ik wil eerst met mijn partner overleggen"

Werkbare reactie:
"Dat is logisch en vaak ook verstandig. Help de ander dan om het helder uit te leggen in plaats van te duwen."

Vraag terug:
"Zal ik je helpen om het zo simpel neer te zetten dat jullie er samen goed naar kunnen kijken?"`,
  },

  // =============================================
  // FOLLOW-UP
  // =============================================
  {
    titel: "Follow-up na video of presentatie",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["follow-up", "na-presentatie", "opening"],
    inhoud: `Na een video of presentatie:

"Hé, ik ben benieuwd: wat sprak je het meeste aan van wat je gezien hebt?"

Sterke openingsvragen voor follow up:
• "Wat sprak je het meeste aan?"
• "Wat bleef het meeste hangen?"
• "Waar werd je nieuwsgierig van?"
• "Waar zit voor jou nog twijfel?"`,
  },
  {
    titel: "Follow-up na twijfel",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["follow-up", "twijfel", "geduld"],
    inhoud: `Na twijfel:

"Helemaal goed dat je er even over wilt nadenken. Wat is voor jou het belangrijkste punt om helder te krijgen?"`,
  },
  {
    titel: "Follow-up na stilte / geen reactie",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["follow-up", "stilte", "no-response"],
    inhoud: `Na stilte of geen reactie:

"Hé, ik wilde even inchecken. Als het niets voor je is, ook helemaal prima, laat het me gewoon even weten."

✓ Dit geeft de ander toestemming om nee te zeggen
✓ Haalt de druk weg
✓ Geeft jou helderheid`,
  },
  {
    titel: "Follow-up na warme reactie",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["follow-up", "warm", "enthousiast"],
    inhoud: `Na een warme reactie:

"Mooi. Waar zie jij voor jezelf het meeste potentieel: product, extra inkomen, vrijheid of allebei?"

Om door te pakken:
"Wil je hier vooral naar kijken als klant, of wil je ook de opbouwkant serieus meenemen?"`,
  },
  {
    titel: "Follow-up basis aanpak",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["follow-up", "basis", "volgorde"],
    inhoud: `De basis volgorde van follow up:

1. CHECK IN — Laat merken dat je opvolgt zoals afgesproken
2. PEIL EERST — Vraag wat iemand het meeste aansprak
3. VERDIEP — Zoek uit waar energie zit en waar twijfel zit
4. LEID DOOR — Breng het gesprek naar de volgende logische stap

Onthoud:
✗ Niet jagen
✗ Niet smeken
✓ Wel richting geven`,
  },

  // =============================================
  // SLUITING (CLOSING)
  // =============================================
  {
    titel: "Closingsvragen — Reeks",
    categorie: "sluiting" as const,
    pipeline_fase: "followup" as const,
    tags: ["closing", "sluiting", "vragen"],
    inhoud: `Sterke closingsvragen per type:

OPENEN: "Wat spreekt je hier het meeste in aan?"
VERDIEPEN: "Zoek je vooral extra inkomen, meer vrijheid of allebei?"
PEILEN: "Hoe serieus zou je hiernaar willen kijken?"
RICHTING GEVEN: "Zie je jezelf hier eerder als klant, of zie je ook de opbouwkant voor jezelf?"
BESLISSING VOORBEREIDEN: "Wat heb je nog nodig om hier een goede beslissing over te nemen?"
START VRAGEN: "Als het klopt en goed voelt, zullen we dan gewoon starten?"`,
  },
  {
    titel: "Doel-Tijd-Termijn Closing — Volledige flow",
    categorie: "sluiting" as const,
    pipeline_fase: "followup" as const,
    tags: ["closing", "doel-tijd-termijn", "flow", "financieel"],
    inhoud: `Doel-Tijd-Termijn Closing — gebruik deze volgorde letterlijk:

1. "Even los van alles wat je gezien hebt: stel dat je hiermee zou starten, hoeveel euro per maand zou je dan willen verdienen zodat het voor jou echt de moeite waard is om hier tijd in te stoppen?"

2. "Helder. En hoeveel uur per week heb je er realistisch gezien voor over om aan dat bedrag te werken?"

3. "En als je kijkt naar dat aantal uur per week, na hoeveel maanden zou voor jou het moment daar moeten zijn dat je dat bedrag ook daadwerkelijk per maand verdient?"

4. "Top. Dus als ik je een realistisch plan kan laten zien waarmee jij binnen die termijn, met die uren per week, naar dat bedrag toe kunt werken, ben je dan bereid om serieus naar dat plan te kijken?"

5. "En als dat plan klopt en goed voelt, zullen we dan gewoon starten?"

WHY: De ander spreekt zelf uit wat hij wil. De motivatie komt van hem, niet van jou.`,
  },
  {
    titel: "Closing — Zachte variant",
    categorie: "sluiting" as const,
    pipeline_fase: "followup" as const,
    tags: ["closing", "zacht", "twijfelaar"],
    inhoud: `Zachtere variant voor twijfelaars:

"Stel dat het realistisch en haalbaar is, en ik kan je laten zien hoe dit er voor jou uit zou kunnen zien, sta je er dan voor open om dat samen te bekijken?"`,
  },
  {
    titel: "Closing — Directe variant voor warme prospects",
    categorie: "sluiting" as const,
    pipeline_fase: "followup" as const,
    tags: ["closing", "direct", "warm", "beslissing"],
    inhoud: `Directere variant voor warme prospects:

"Dus eigenlijk is de echte vraag niet of je iets wilt veranderen, maar of dit het juiste voertuig voor je is. Klopt dat?"

"En als ik je kan laten zien dat dit realistisch is binnen jouw doelen, jouw tijd en jouw termijn, zullen we dan gewoon de eerste stap zetten?"`,
  },
  {
    titel: "Korte gespreksflow — Volgorde",
    categorie: "sluiting" as const,
    pipeline_fase: null,
    tags: ["volgorde", "gesprek", "flow", "compleet"],
    inhoud: `Gebruik deze volgorde in elk gesprek:

1. NODIG UIT — Laat iemand kijken
2. FOLLOW UP — Peil wat het meeste aansprak
3. MAAK TWIJFEL HELDER — Gebruik vragen en Feel-Felt-Found
4. CLOSINGSVRAGEN — Geef richting
5. DOEL-TIJD-TERMIJN — Laat de ander zijn eigen motivatie uitspreken
6. VOLGENDE STAP — Laat een plan zien of zet direct de eerste stap

Onthoud:
✗ Niet meer praten om iemand over te halen
✓ Beter luisteren, beter vragen, beter leiden
→ Vragen. Luisteren. Leiden.`,
  },

  // =============================================
  // EDIFICATION — sponsor laten schitteren in 3-weg
  // =============================================
  {
    titel: "Edification — Formule (Worre)",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "formule", "3-weg", "sponsor", "introductie"],
    inhoud: `DE FORMULE die altijd werkt:

"Ik ga je voorstellen aan [naam], die [autoriteit / track-record], en degene die [persoonlijke link met jou]."

DRIE BOUWSTENEN:
1. WIE — naam + relatie (mijn mentor / sponsor / vriendin / coach)
2. AUTORITEIT — hoe lang in dit vak + concreet getal of resultaat (jaren ervaring, mensen geholpen, eigen transformatie)
3. PERSOONLIJKE LINK — waarom JIJ deze persoon hebt gekozen (wat zij/hij voor jou heeft betekend)

REGEL: max 25 woorden. Geen overdrijving. Geen "de allerbeste" of "wereldberoemd". Gewoon de waarheid, stevig opgeschreven.

WAAROM HET WERKT:
Zonder edification heeft je sponsor géén autoriteit in het 3-weg → gesprek wordt slap.
Mét edification stap jij terug, sponsor klimt naar voren, prospect denkt "deze persoon weet waar het over gaat".
Eén keer goed schrijven = honderd keer sterker presenteren.`,
  },
  {
    titel: "Edification — Sportcoach-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "sportcoach", "energie"],
    inhoud: `"Ik ga je voorstellen aan Mark, die al 12 jaar mensen begeleidt naar meer energie en helderheid — degene die mij heeft laten zien dat dit niet over producten gaat maar over je leven terugpakken."

WAAROM DEZE WERKT:
✓ Concreet getal (12 jaar)
✓ Concreet resultaat-domein (energie + helderheid)
✓ Persoonlijke link in eigen taal ("mijn leven terugpakken")
✓ Onder 25 woorden
✓ Geen hype, wel scherp`,
  },
  {
    titel: "Edification — Mama-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "moeder", "vrouwen", "balans"],
    inhoud: `"Ik ga je voorstellen aan Linda, moeder van 3, die al 8 jaar duizenden vrouwen helpt om hun lichaam en gezin weer in balans te brengen — degene die mij in 6 maanden van uitgeput naar uitgerust kreeg."

WAAROM DEZE WERKT:
✓ Identiteits-anker (moeder van 3) — herkenning bij doelgroep
✓ Concrete schaal (duizenden vrouwen)
✓ Specifiek tijdsbestek voor eigen transformatie (6 maanden)
✓ Krachtig contrast (uitgeput → uitgerust)`,
  },
  {
    titel: "Edification — Ondernemer/business-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "ondernemer", "business"],
    inhoud: `"Ik ga je voorstellen aan Jaap, die al 15 jaar in dit vak zit en vorig jaar 200 mensen direct heeft ondersteund — degene die mij heeft laten zien dat dit serieus business is, geen hobby."

WAAROM DEZE WERKT:
✓ Tijdsdiepte (15 jaar)
✓ Recent + concreet (vorig jaar, 200 mensen)
✓ Reframet wat het IS voor de prospect (business, geen hobby)
✓ Toont de connector als student met groei-mindset`,
  },
  {
    titel: "Edification — Zorgprofessional-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "zorg", "verpleegkundige", "vitaliteit"],
    inhoud: `"Ik ga je voorstellen aan Anouk, jarenlang verpleegkundige geweest, die nu al 6 jaar mensen helpt om hun energie en weerstand op te bouwen — degene die mij liet zien dat preventie veel meer brengt dan symptomen bestrijden."

WAAROM DEZE WERKT:
✓ Eerdere zorg-achtergrond geeft impliciete medische geloofwaardigheid (zonder claim)
✓ Tijdsdiepte (6 jaar in dit vak)
✓ Filosofische framing (preventie > symptomen) past bij gezondheidsprospects
✓ Persoonlijke "ik ben veranderd"-link`,
  },
  {
    titel: "Edification — Veelgemaakte fouten",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "fouten", "do-niet", "checklist"],
    inhoud: `WAT JE NIET MOET DOEN — gegarandeerd zwakke 3-weg:

✗ TE KORT: "Dit is m'n upline." — 0 autoriteit gegeven, sponsor moet vanaf nul beginnen.
✗ IMPROVISEREN: elke keer iets anders zeggen. Sponsor weet niet wanneer 'ie kan starten, jij twijfelt halverwege je zin.
✗ HYPED OVERDRIJVEN: "de allerbeste van Nederland!", "wereldberoemd!" — prospect ruikt de pitch en sluit af.
✗ VERGETEN: gewoon stilletjes je sponsor laten beginnen. Geen edification = geen 3-weg, alleen een gesprek.
✗ OVER JEZELF PRATEN: "ik vind het zo fijn dat ik dit doe..." — focus moet op sponsor liggen, niet op jou.
✗ MEDISCHE/FINANCIËLE CLAIMS: "heeft duizenden mensen genezen" — compliance-risico, ongepast.

CHECK JE EIGEN ZIN:
□ Onder 25 woorden?
□ Concreet getal in autoriteit-deel (jaren / mensen / resultaat)?
□ Persoonlijke link uit JOUW eigen taal?
□ Geen overdrijving — gewoon waar?
□ Kun je het uit je hoofd zeggen, identiek elke keer?`,
  },
];

// SQL voor het seeden van de scripts in Supabase
// Kopieer dit naar SQL Editor in Supabase na het aanmaken van de tabellen
export function generateScriptsSeedSQL(): string {
  const values = SCRIPTS_DATA.map((s, i) => {
    const tags = `'{${s.tags.map((t) => `"${t}"`).join(",")}}'`;
    const fase = s.pipeline_fase ? `'${s.pipeline_fase}'` : "NULL";
    const inhoud = s.inhoud.replace(/'/g, "''");
    const titel = s.titel.replace(/'/g, "''");
    return `('${titel}', '${s.categorie}', ${fase}, '${inhoud}', ${tags}, ${i})`;
  });

  return `INSERT INTO scripts (titel, categorie, pipeline_fase, inhoud, tags, sort_order) VALUES\n${values.join(",\n")};`;
}
