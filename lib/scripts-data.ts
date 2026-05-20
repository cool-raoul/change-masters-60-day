// Scripts bibliotheek, samengesteld uit de Change Masters PDF's
// uitnodigingen.pdf + bezwaren etc.pdf

export const SCRIPTS_DATA = [
  // =============================================
  // UITNODIGINGEN
  // =============================================
  {
    titel: "60-Dagen Script, Persoonlijk",
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
    titel: "60-Dagen Script, Direct & Eerlijk",
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
    titel: "Whisper Campaign, Geheime start",
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

Als je voelt: dit zou zomaar eens iets voor mij kunnen zijn.
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

En ik zoek geen massa.
ik zoek een paar mensen die dit met mij willen doen.

Dus stel… alles klopt, stel dat dit voelt als iets voor jou:
ben je dan in, of ben je uit?"`,
  },

  // ─────────────────────────────────────────────
  // GESPREKS-OPENERS voor de in_gesprek-fase. Vier ingangen
  // (warm/koud/social/lead-magnet) plus een bedrijfs-variant van
  // lead-magnet. Voor wanneer je een gesprek opent of warmer maakt
  // zonder al uit te nodigen voor iets specifieks.
  // ─────────────────────────────────────────────
  {
    titel: "Warme start",
    categorie: "uitnodiging" as const,
    pipeline_fase: "in_gesprek" as const,
    tags: ["warm", "opener"],
    inhoud: `Hoi [Voornaam], hoe gaat het met je de laatste tijd? En je [werk/gezin/hobby's], hoe loopt dat? 🙂`,
  },
  {
    titel: "Koude start",
    categorie: "uitnodiging" as const,
    pipeline_fase: "in_gesprek" as const,
    tags: ["koud", "opener", "heractiveren"],
    inhoud: `Hoi [Voornaam], we zijn al een tijdje verbonden maar hebben nog nooit echt gepraat. Dat wilde ik veranderen 🙂 Hoe gaat het met je?`,
  },
  {
    titel: "Via social media",
    categorie: "uitnodiging" as const,
    pipeline_fase: "in_gesprek" as const,
    tags: ["social", "opener", "story-reactie"],
    inhoud: `Hé [Voornaam]! Leuk dat je reageerde op mijn story 😊 Hoe is het met je de laatste tijd?`,
  },
  {
    titel: "Via lead magnet (product-focus)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "in_gesprek" as const,
    tags: ["lead-magnet", "opener", "product"],
    inhoud: `Hoi [Voornaam], leuk dat je [Titel Lead Magnet] hebt gedownload 🙂 Ik heb het gemaakt voor mensen die met [doel of vraag] bezig zijn. Uit nieuwsgierigheid: wat sprak je het meeste aan?`,
  },
  {
    titel: "Via lead magnet (bedrijf-focus)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "in_gesprek" as const,
    tags: ["lead-magnet", "opener", "bedrijf"],
    inhoud: `Hoi [Voornaam], leuk dat je [Titel Lead Magnet] hebt gedownload 🙂 Wat sprak je het meeste aan? Ben je op dit moment bezig met [doel of vraag]?`,
  },

  // ─────────────────────────────────────────────
  // UITNODIGEN, voor de uitgenodigd-fase. Twee stappen per
  // ingang: stap 1 = interesse tonen / gedeeld probleem, stap 2
  // = peilen / interesse checken / voorstel oplossing. Vier
  // ingangen (warm/koud/social/lead-magnet).
  //
  // STIJL-anker: "Helemaal vrijblijvend. Als het niets voor je
  // is, is dat ook prima." (zie memory eleva-stem-uitnodigen).
  // ─────────────────────────────────────────────
  {
    titel: "Uitnodigen, Warm 1 (interesse tonen)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "warm", "stap-1"],
    inhoud: `[Voornaam], je [vaardigheid/talent] is iets waar ik altijd respect voor heb 🙂 Ik ben met iets nieuws bezig en moest aan jou denken. Mag ik er kort iets over vertellen?`,
  },
  {
    titel: "Uitnodigen, Koud 1 (interesse tonen)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "koud", "stap-1"],
    inhoud: `Wauw! Ik ben echt onder de indruk van je inzet voor [doel] [Voornaam]. Dat zegt veel over je ambitie en drive. Wat is op dit moment je grootste uitdaging daarin?`,
  },
  {
    titel: "Uitnodigen, Social 1 (gedeeld probleem)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "social", "stap-1", "gedeeld-probleem"],
    inhoud: `Ik kreeg laatst een vraag van iemand over [onderwerp]. Daar moest ik aan denken bij jouw post. Speelt [doel of vraag] ook bij jou?`,
  },
  {
    titel: "Uitnodigen, Lead magnet 1 (gedeeld probleem)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "lead-magnet", "stap-1", "gedeeld-probleem"],
    inhoud: `Sinds ik [Titel Lead Magnet] heb gedeeld, hoor ik vaak terug dat [doel of thema] herkenbaar is. Werk jij daar ook aan? En wat is je grootste uitdaging op dit moment?`,
  },
  {
    titel: "Uitnodigen, Warm 2 (peilen van interesse)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "warm", "stap-2", "peilen"],
    inhoud: `Fijn dat je dat deelde, [Voornaam]. Ik hoor hoe belangrijk [doel] voor je is. Ik werk zelf met iets dat hier echt bij past. Mag ik je daar kort iets over laten zien? Helemaal vrijblijvend. Als het niets voor je is, is dat ook prima.`,
  },
  {
    titel: "Uitnodigen, Koud 2 (peilen van interesse)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "koud", "stap-2", "peilen"],
    inhoud: `Dat klinkt herkenbaar, [Voornaam]. Ik werk zelf met iets dat hier voor mij goed werkt. Mag ik je daar kort iets over sturen? Helemaal vrijblijvend. Als het niets voor je is, is dat ook prima.`,
  },
  {
    titel: "Uitnodigen, Social 2 (interesse checken)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "social", "stap-2", "interesse-checken"],
    inhoud: `Ik heb hier zelf een weg in gevonden die echt voor me werkt 🙂 Als je nieuwsgierig bent: ik stuur je een kort filmpje of wat info? Beslis je daarna zelf of het bij je past.`,
  },
  {
    titel: "Uitnodigen, Lead magnet 2 (voorstel oplossing)",
    categorie: "uitnodiging" as const,
    pipeline_fase: "uitgenodigd" as const,
    tags: ["uitnodigen", "lead-magnet", "stap-2", "voorstel"],
    inhoud: `Snap ik. Ik heb hier zelf een weg in gevonden die voor mij echt werkt. Als je interesse hebt, mag ik je een korte video of wat info sturen? Kijk daarna zelf of het bij je past.`,
  },

  // =============================================
  // BEZWAREN BEHANDELING
  // =============================================
  {
    titel: "Feel Felt Found, Standaard aanpak",
    categorie: "bezwaar" as const,
    pipeline_fase: null,
    tags: ["feel-felt-found", "bezwaar", "techniek"],
    inhoud: `De Feel-Felt-Found methode, gebruik bij elk bezwaar:

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

  // ─────────────────────────────────────────────
  // OPVOLGEN, ritme van 24u/48u/72u na een gedeelde link of video,
  // plus drie directere ja/of/nee-varianten. Geldt voor de followup-
  // fase wanneer de prospect iets heeft gekregen maar nog niet heeft
  // gereageerd, of wanneer je duidelijkheid wilt.
  //
  // STIJL-anker: "ik denk dat het waardevol voor je kan zijn" mag,
  // dat is een persoonlijke inschatting (zie memory
  // eleva-stem-uitnodigen). NIET "ik weet zeker dat dit je gaat
  // helpen" (claim).
  // ─────────────────────────────────────────────
  {
    titel: "Opvolgen na 24u, deel 1 (niet bekeken)",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "24u", "niet-bekeken"],
    inhoud: `Hoi [Voornaam], ik zag dat je de link die ik eerder stuurde nog niet hebt bekeken. Helemaal oké, ik snap dat je het druk hebt 🙂 Ik denk wel dat het waardevol voor je kan zijn. Was er een reden dat je nog niet hebt gekeken?`,
  },
  {
    titel: "Opvolgen na 24u, deel 2 (gentle nudge)",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "24u", "nudge"],
    inhoud: `Ik denk dat dit je wel kan ondersteunen, [Voornaam]. Neem gerust even een moment om naar de link te kijken als je tijd hebt. Laat het me weten als je hem gezien hebt door een 👍 te sturen, dan kan ik meteen je vragen beantwoorden 🙂`,
  },
  {
    titel: "Opvolgen na 48u, deel 1 (wat sprak je aan)",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "48u", "wat-sprak-aan"],
    inhoud: `Hoi [Voornaam], ik ben benieuwd: wat sprak je het meeste aan in de info die ik stuurde? En denk je dat het past bij wat jij zoekt rond [doel of vraag]?`,
  },
  {
    titel: "Opvolgen na 48u, deel 2 (video bekeken)",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "48u", "video-bekeken"],
    inhoud: `Hoi [Voornaam], heb je de video die ik stuurde inmiddels bekeken? Wat sprak je het meeste aan?`,
  },
  {
    titel: "Opvolgen na 72u (warm check)",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "72u", "warm-check"],
    inhoud: `Hoi [Voornaam], ik weet dat je het druk hebt, maar ik wilde even checken hoe het gaat. Je [doel] is belangrijk, dus als ik je ergens mee kan helpen, laat het me gerust weten 🙂`,
  },
  {
    titel: "Opvolgen, info al bekeken?",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "info-bekeken"],
    inhoud: `Hoi [Voornaam], ik vroeg me af of je de info die ik stuurde al hebt bekeken? Wat sprak je het meeste aan? Laat het me weten 🙂`,
  },
  {
    titel: "Opvolgen na 24u, eerlijke ja-of-nee",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "24u", "eerlijk", "ja-of-nee"],
    inhoud: `Hoi [Voornaam], misschien is het nu geen goed moment, dat begrijp ik. Daarom wil ik gewoon even eerlijk vragen: ben je klaar om je [doel] serieus aan te pakken? Als het antwoord nee is, is dat ook helemaal oké. Laat het me gerust weten.`,
  },
  {
    titel: "Opvolgen na 48u, 3-opties techniek",
    categorie: "followup" as const,
    pipeline_fase: "followup" as const,
    tags: ["opvolgen", "48u", "3-opties"],
    inhoud: `Hoi [Voornaam], ik dacht dat je misschien één van deze drie dingen ervaart:

1. Je bent geïnteresseerd, maar hebt het gewoon druk
2. Je hebt vragen, maar bent er nog niet aan toegekomen
3. Je bent eigenlijk niet zo geïnteresseerd, maar weet niet goed hoe je dat moet zeggen

Zit daar iets tussen? Geen probleem, ik waardeer je eerlijkheid 🙂`,
  },

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

1. CHECK IN, Laat merken dat je opvolgt zoals afgesproken
2. PEIL EERST, Vraag wat iemand het meeste aansprak
3. VERDIEP, Zoek uit waar energie zit en waar twijfel zit
4. LEID DOOR, Breng het gesprek naar de volgende logische stap

Onthoud:
✗ Niet jagen
✗ Niet smeken
✓ Wel richting geven`,
  },

  // =============================================
  // SLUITING (CLOSING)
  // =============================================
  {
    titel: "Closingsvragen, Reeks",
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
    titel: "Doel-Tijd-Termijn Closing, Volledige flow",
    categorie: "sluiting" as const,
    pipeline_fase: "followup" as const,
    tags: ["closing", "doel-tijd-termijn", "flow", "financieel"],
    inhoud: `Doel-Tijd-Termijn Closing, gebruik deze volgorde letterlijk:

1. "Even los van alles wat je gezien hebt: stel dat je hiermee zou starten, hoeveel euro per maand zou je dan willen verdienen zodat het voor jou echt de moeite waard is om hier tijd in te stoppen?"

2. "Helder. En hoeveel uur per week heb je er realistisch gezien voor over om aan dat bedrag te werken?"

3. "En als je kijkt naar dat aantal uur per week, na hoeveel maanden zou voor jou het moment daar moeten zijn dat je dat bedrag ook daadwerkelijk per maand verdient?"

4. "Top. Dus als ik je een realistisch plan kan laten zien waarmee jij binnen die termijn, met die uren per week, naar dat bedrag toe kunt werken, ben je dan bereid om serieus naar dat plan te kijken?"

5. "En als dat plan klopt en goed voelt, zullen we dan gewoon starten?"

WHY: De ander spreekt zelf uit wat hij wil. De motivatie komt van hem, niet van jou.`,
  },
  {
    titel: "Closing, Zachte variant",
    categorie: "sluiting" as const,
    pipeline_fase: "followup" as const,
    tags: ["closing", "zacht", "twijfelaar"],
    inhoud: `Zachtere variant voor twijfelaars:

"Stel dat het realistisch en haalbaar is, en ik kan je laten zien hoe dit er voor jou uit zou kunnen zien, sta je er dan voor open om dat samen te bekijken?"`,
  },
  {
    titel: "Closing, Directe variant voor warme prospects",
    categorie: "sluiting" as const,
    pipeline_fase: "followup" as const,
    tags: ["closing", "direct", "warm", "beslissing"],
    inhoud: `Directere variant voor warme prospects:

"Dus eigenlijk is de echte vraag niet of je iets wilt veranderen, maar of dit het juiste voertuig voor je is. Klopt dat?"

"En als ik je kan laten zien dat dit realistisch is binnen jouw doelen, jouw tijd en jouw termijn, zullen we dan gewoon de eerste stap zetten?"`,
  },
  {
    titel: "Korte gespreksflow, Volgorde",
    categorie: "sluiting" as const,
    pipeline_fase: null,
    tags: ["volgorde", "gesprek", "flow", "compleet"],
    inhoud: `Gebruik deze volgorde in elk gesprek:

1. NODIG UIT, Laat iemand kijken
2. FOLLOW UP, Peil wat het meeste aansprak
3. MAAK TWIJFEL HELDER, Gebruik vragen en Feel-Felt-Found
4. CLOSINGSVRAGEN, Geef richting
5. DOEL-TIJD-TERMIJN, Laat de ander zijn eigen motivatie uitspreken
6. VOLGENDE STAP, Laat een plan zien of zet direct de eerste stap

Onthoud:
✗ Niet meer praten om iemand over te halen
✓ Beter luisteren, beter vragen, beter leiden
→ Vragen. Luisteren. Leiden.`,
  },

  // =============================================
  // EDIFICATION, sponsor laten schitteren in 3-weg
  // =============================================
  {
    titel: "Edification, Formule (Worre)",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "formule", "3-weg", "sponsor", "introductie"],
    inhoud: `DE FORMULE die altijd werkt:

"Ik ga je voorstellen aan [naam], die [autoriteit / track-record], en degene die [persoonlijke link met jou]."

DRIE BOUWSTENEN:
1. WIE, naam + relatie (mijn mentor / sponsor / vriendin / coach)
2. AUTORITEIT, hoe lang in dit vak + concreet getal of resultaat (jaren ervaring, mensen geholpen, eigen transformatie)
3. PERSOONLIJKE LINK, waarom JIJ deze persoon hebt gekozen (wat zij/hij voor jou heeft betekend)

REGEL: max 25 woorden. Geen overdrijving. Geen "de allerbeste" of "wereldberoemd". Gewoon de waarheid, stevig opgeschreven.

WAAROM HET WERKT:
Zonder edification heeft je sponsor géén autoriteit in het 3-weg → gesprek wordt slap.
Mét edification stap jij terug, sponsor klimt naar voren, prospect denkt "deze persoon weet waar het over gaat".
Eén keer goed schrijven = honderd keer sterker presenteren.`,
  },
  {
    titel: "Edification, Sportcoach-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "sportcoach", "energie"],
    inhoud: `"Ik ga je voorstellen aan Mark, die al 12 jaar mensen begeleidt naar meer energie en helderheid, degene die mij heeft laten zien dat dit niet over producten gaat maar over je leven terugpakken."

WAAROM DEZE WERKT:
✓ Concreet getal (12 jaar)
✓ Concreet resultaat-domein (energie + helderheid)
✓ Persoonlijke link in eigen taal ("mijn leven terugpakken")
✓ Onder 25 woorden
✓ Geen hype, wel scherp`,
  },
  {
    titel: "Edification, Mama-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "moeder", "vrouwen", "balans"],
    inhoud: `"Ik ga je voorstellen aan Linda, moeder van 3, die al 8 jaar duizenden vrouwen helpt om hun lichaam en gezin weer in balans te brengen, degene die mij in 6 maanden van uitgeput naar uitgerust kreeg."

WAAROM DEZE WERKT:
✓ Identiteits-anker (moeder van 3), herkenning bij doelgroep
✓ Concrete schaal (duizenden vrouwen)
✓ Specifiek tijdsbestek voor eigen transformatie (6 maanden)
✓ Krachtig contrast (uitgeput → uitgerust)`,
  },
  {
    titel: "Edification, Ondernemer/business-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "ondernemer", "business"],
    inhoud: `"Ik ga je voorstellen aan Jaap, die al 15 jaar in dit vak zit en vorig jaar 200 mensen direct heeft ondersteund, degene die mij heeft laten zien dat dit serieus business is, geen hobby."

WAAROM DEZE WERKT:
✓ Tijdsdiepte (15 jaar)
✓ Recent + concreet (vorig jaar, 200 mensen)
✓ Reframet wat het IS voor de prospect (business, geen hobby)
✓ Toont de connector als student met groei-mindset`,
  },
  {
    titel: "Edification, Zorgprofessional-sponsor",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "voorbeeld", "zorg", "verpleegkundige", "vitaliteit"],
    inhoud: `"Ik ga je voorstellen aan Anouk, jarenlang verpleegkundige geweest, die nu al 6 jaar mensen helpt om hun energie en weerstand op te bouwen, degene die mij liet zien dat preventie veel meer brengt dan symptomen bestrijden."

WAAROM DEZE WERKT:
✓ Eerdere zorg-achtergrond geeft impliciete medische geloofwaardigheid (zonder claim)
✓ Tijdsdiepte (6 jaar in dit vak)
✓ Filosofische framing (preventie > symptomen) past bij gezondheidsprospects
✓ Persoonlijke "ik ben veranderd"-link`,
  },
  {
    titel: "Edification, Veelgemaakte fouten",
    categorie: "edification" as const,
    pipeline_fase: null,
    tags: ["edification", "fouten", "do-niet", "checklist"],
    inhoud: `WAT JE NIET MOET DOEN, gegarandeerd zwakke 3-weg:

✗ TE KORT: "Dit is m'n upline.", 0 autoriteit gegeven, sponsor moet vanaf nul beginnen.
✗ IMPROVISEREN: elke keer iets anders zeggen. Sponsor weet niet wanneer 'ie kan starten, jij twijfelt halverwege je zin.
✗ HYPED OVERDRIJVEN: "de allerbeste van Nederland!", "wereldberoemd!", prospect ruikt de pitch en sluit af.
✗ VERGETEN: gewoon stilletjes je sponsor laten beginnen. Geen edification = geen 3-weg, alleen een gesprek.
✗ OVER JEZELF PRATEN: "ik vind het zo fijn dat ik dit doe...", focus moet op sponsor liggen, niet op jou.
✗ MEDISCHE/FINANCIËLE CLAIMS: "heeft duizenden mensen genezen", compliance-risico, ongepast.

CHECK JE EIGEN ZIN:
□ Onder 25 woorden?
□ Concreet getal in autoriteit-deel (jaren / mensen / resultaat)?
□ Persoonlijke link uit JOUW eigen taal?
□ Geen overdrijving, gewoon waar?
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
