// ============================================================
// KENNISBANK AI COACH — ELEVA 60-Dagenrun
// SLIM LADEN: alleen relevante secties per vraagtype
// Bronnen: Eric Worre (Go Pro + 90 Day Run) + Fraser Brookes
// ============================================================

export type VraagType = "dm" | "bezwaar" | "followup" | "closing" | "motivatie" | "accountability" | "social" | "drieweg" | "productadvies" | "algemeen";

// Detecteer het type vraag op basis van keywords
export function detecteerVraagType(berichten: { role: string; content: string }[]): VraagType {
  // Pak de laatste user-berichten (max 2)
  const recenteUserBerichten = berichten
    .filter((b) => b.role === "user")
    .slice(-2)
    .map((b) => b.content.toLowerCase())
    .join(" ");

  if (/\b(productadvies|product advies|welk pakket|welke producten|pakket (voor|bij)|lifeplus advies|daily light|proanthenols|omegold|mena plus|key tonic|triple protein|be focused|be recharged|be sustained|golden milk|cacao boost|support tabs|purple flash|green medley|basispakket|afvallen|intermittent fasting|burn.?out|menopauze|hormonen|gewrichten|detox|sappenkuur|darmprogramma|holistic reset)\b/.test(recenteUserBerichten)) return "productadvies";
  if (/\b(3.?weg|drieweg|groepje|aanmaken|sponsor koppel|introduceer|edif|aankondig|presentatie.*groep|groep.*presentatie)\b/.test(recenteUserBerichten)) return "drieweg";
  if (/\b(dm|bericht|schrij|tekst|uitnodig|whatsapp|instagram|sturen)\b/.test(recenteUserBerichten)) return "dm";
  if (/\b(bezwaar|objection|geen tijd|nadenken|niet van sales|ken te weinig|geen geld|partner overleg|twijfel)\b/.test(recenteUserBerichten)) return "bezwaar";
  if (/\b(follow.?up|opvolg|stilte|geen reactie|niet gereageerd|terugkom)\b/.test(recenteUserBerichten)) return "followup";
  if (/\b(clos|afsluit|besliss|doel.?tijd|starten|commitment)\b/.test(recenteUserBerichten)) return "closing";
  if (/\b(motivat|opgev|moeilijk|geen zin|moe|gefrustreerd|why|waarom)\b/.test(recenteUserBerichten)) return "motivatie";
  if (/\b(accountab|resultaat|activiteit|stats|nummers|gedaan|actie)\b/.test(recenteUserBerichten)) return "accountability";
  if (/\b(social|post|story|stories|content|attract|online|tiktok|facebook|linkedin)\b/.test(recenteUserBerichten)) return "social";
  return "algemeen";
}

// Kern die ALTIJD meegestuurd wordt (~800 tokens)
const KERN = `
### KERNMETHODE

WORRE 7 VAARDIGHEDEN (samenvatting):
1. Prospects vinden: geheugensteun-lijst, iedereen opschrijven, nooit vooroordelen
2. Uitnodigen (4 stappen): druk zijn → compliment → uitnodigen (direct/indirect/super-indirect) → plannen
3. Presenteren: jij = boodschapper, tools doen het werk, 3-weg met sponsor
4. Follow-up: 24-48u regel, 5 exposures gemiddeld, nooit jagen
5. Closing: helpen beslissen, Doel-Tijd-Termijn flow
6. Opstarten: eerste 48u cruciaal, samen namenlijst, eerste 3 uitnodigingen
7. Evenementen: derden-validatie

60-DAGENRUN FASEN:
Fase 1 (dag 1-20): 3 namen/dag, 2 uitnodigingen, 1 follow-up. Breed bouwen.
Fase 2 (dag 21-40): eigen acties + team helpen. 3-weg gesprekken. Max 2 niveaus diep.
Fase 3 (dag 41-60): social media attractie, leiderschap, duplicatie borgen.

UNTIL-principe: niet stoppen totdat het lukt.
5 soorten prospects: actief zoekend, open, productkoper, niet-nu, nooit.

BROOKES FORM: F=Family O=Occupation R=Recreation M=Money → luister naar haken.
Loser-to-Legend: jouw reis is je wapen, niet je succes.
Duplicatie: als het niet te dupliceren is, doe het niet.`;

// Secties per vraagtype (~300-500 tokens elk)
const SECTIES: Record<string, string> = {
  dm: `
### DM & UITNODIGEN

Worre 4-stappen uitnodiging:
1. Wees druk: "Ik heb weinig tijd maar wilde dit even delen."
2. Compliment: "Jij bent iemand die dingen voor elkaar krijgt."
3. Uitnodigen:
   Direct: "Ik ben gestart met iets nieuws, wil het je laten zien."
   Indirect: "Dit is vast niets voor jou, maar ken jij iemand die extra wil verdienen?"
   Super-indirect: "Ken jij mensen die openstaan voor bij-inkomen?"
4. Plan: "Wanneer schikt het, vanavond of morgen?"
JE TAAK = uitnodigen, NIET overtuigen.

Brookes DM strategie:
1. Reageer oprecht op hun content
2. Bouw rapport (FORM)
3. Zoek opening: "Trouwens, ik doe momenteel iets interessants..."
4. Nodig uit, niet pitchen

I Dare You: "Ik daag je uit 30 dagen mee te doen."
Maak laagdrempelig, creëer exclusiviteit.`,

  bezwaar: `
### BEZWAREN BEHANDELEN

Feel-Felt-Found methode (altijd):
FEEL: "Ik snap dat dat zo voelt."
FELT: "Meer mensen voelden dat in het begin ook."
FOUND: "Wat zij merkten was dat het simpeler was dan gedacht."
Sluit ALTIJD af met een vraag naar de echte twijfel.

Veelvoorkomende bezwaren:
"Geen tijd" → "Juist daarom, het is flexibel naast wat je al doet. Als het behapbaar is, sta je er dan voor open?"
"Wil nadenken" → "Prima. Waar wil je precies over nadenken: duidelijkheid, vertrouwen of timing?"
"Niet van sales" → "Hoeft niet. Het draait om delen en opvolgen. Zou het passen als je het op jouw manier kunt doen?"
"Ken te weinig mensen" → "Dat denken velen. Het gaat om goed leren uitnodigen. Als je daar hulp bij krijgt?"
"Geen geld/risico" → "Begrijpelijk. Als het laagdrempelig en realistisch is, wil je het dan serieus bekijken?"
"Partner overleggen" → "Logisch. Zal ik helpen het simpel neer te zetten zodat jullie er samen naar kunnen kijken?"

PRODUCT PIVOT bij business-afwijzing:
1. Erken zonder druk
2. Vraag naar gezondheid/energie
3. Stel producten voor als oplossing
4. "Probeer een maand, geen verplichtingen"
5. Noteer als Shopper, follow-up na 21 dagen`,

  followup: `
### FOLLOW-UP

Worre 24-48u regel. 5 exposures gemiddeld nodig. Nooit jagen, nooit smeken.

Follow-up reeks:
1. "Heb je de info bekeken?"
2. "Wat vond je ervan? Welke vragen?"
3. "Dit wilde ik je ook nog laten zien..."
4. "Er is binnenkort een event, wil je erbij zijn?"
5. Sluit af of vraag naar echte twijfel

Na video/presentatie: "Wat sprak je het meeste aan?"
Na twijfel: "Wat is het belangrijkste punt om helder te krijgen?"
Na stilte: "Even inchecken. Als het niets is, ook prima, laat het even weten."
Na warmte: "Waar zie je het meeste potentieel: product, inkomen of allebei?"

Basis: CHECK IN → PEIL → VERDIEP → LEID DOOR
Niet jagen, niet smeken, wel richting geven.`,

  closing: `
### CLOSING

Closing = helpen beslissen, niet overtuigen.

Doel-Tijd-Termijn flow (letterlijk gebruiken):
1. "Hoeveel euro/maand zou je willen verdienen zodat het de moeite waard is?"
2. "Hoeveel uur/week heb je er realistisch voor?"
3. "Na hoeveel maanden moet dat bedrag er staan?"
4. "Als ik een realistisch plan kan laten zien daarvoor, wil je dat serieus bekijken?"
5. "Als dat klopt en goed voelt, starten we dan gewoon?"
De motivatie komt van HEN, niet van jou.

Closingsvragen reeks:
OPENEN: "Wat spreekt je hier het meeste aan?"
PEILEN: "Hoe serieus kijk je hiernaar?"
RICHTING: "Zie je jezelf als klant of ook de opbouwkant?"
BESLISSING: "Wat heb je nog nodig voor een goede beslissing?"
START: "Als het klopt, starten we dan?"

Zachte variant: "Stel dat het realistisch is, sta je er dan voor open om het samen te bekijken?"
Directe variant: "De echte vraag is niet of je iets wilt veranderen, maar of dit het juiste voertuig is. Klopt dat?"`,

  motivatie: `
### MOTIVATIE & MINDSET

Brookes Loser-to-Legend: jouw verhaal van twijfel en groei is je krachtigste wapen.
Deel je beginpunt eerlijk → toon turning point → laat verandering zien.

Worre UNTIL: niet stoppen. Niet bij nee, niet bij tegenslag. UNTIL.
"Behandel elke dag als dag 1." Houd urgentie.
"Snelheid wint." Snel handelen slaat perfect handelen.
"De run is jouw verhaal." Consistentie bouwt geloofwaardigheid.
"Vergelijk met gisteren, niet met anderen."

Afwijzing = getal, geen oordeel. "Elke nee = dichter bij ja."
"Nee nu is geen nee voor altijd. Blijf in hun leven."
Zeg: "Geen probleem. Mag ik over 3 maanden nog eens vragen?"

Koppel ALTIJD terug aan persoonlijke WHY.
Enige mislukking = stoppen.`,

  accountability: `
### ACCOUNTABILITY

Dagelijks (5 min): Wat gedaan? Wat morgen? Waar loop ik vast?
Wekelijks: Wat werkte? Wat niet? Wie wacht op follow-up? Focus komende week?

6 KPI's: contacten, uitnodigingen, follow-ups, presentaties, nieuwe partners, nieuwe klanten.
Eén dag nul = geen paniek. Twee dagen nul = actie nodig.
Sponsor vraagt ALTIJD naar activiteit, niet alleen resultaten.

Stel harde vragen. Geen zachte aanpak. Feiten vs excuses.
"Hoeveel mensen heb je deze week daadwerkelijk gesproken?"
"Wat was het plan en wat heb je echt gedaan?"`,

  drieweg: `
### 3-WEG GESPREK (Worre + Brooks + ELEVA stijl)

KERNPRINCIPE: Jij = student, sponsor = expert. Zodra sponsor in het groepje is: stap terug.
Geen toestemming vragen — aankondiging doen. Sponsor edifyen VOOR introductie, niet erna.

FLOW PRODUCT/INTERESSE:
Stap 1 — Aankondiging (jij aan prospect, vóór het groepje):
"Hey [naam]! Ik maak even een groepje aan met [naam sponsor], want ik kan het zelf nog niet zo goed uitleggen 😄 Zij doet dit al [periode] en heeft zelf ook super mooi resultaat behaald — ze kan met je mee kijken en al je vragen beantwoorden 🥰"

Stap 2 — Introductie in het groepje (jij):
"Hi [naam prospect]! 😊 Dit is [naam sponsor] — mijn vriendin en mentor. Ze doet dit al [periode] en heeft zelf fantastische resultaten behaald. Ze helpt mij nu ook en heeft al heel veel mensen begeleid met precies wat jij zoekt 🥰
[naam sponsor], dit is [naam prospect]. Ze is op zoek naar [situatie]. Wil jij haar even verder helpen? 🙏"

Stap 3 — STAP TERUG. Zeg niets meer tenzij sponsor vraagt.

Stap 4 — Sponsor opent:
"Hey [naam]! Wat leuk dat [teamlid] ons aan elkaar koppelt 🥰 Ik heb even gelezen wat er speelt — herkenbaar! Vertel eens, hoe lang speelt dit al bij je en wat heb je al geprobeerd? 😊"

Stap 5 — Follow-up (jij aan prospect, apart, binnen 24u):
"Hey [naam] 😊 Wat sprak je het meeste aan van wat je tot nu toe hebt gezien? 🥰"
OF: "Zie je hoe dit je kan helpen om [hun doel] te creëren? 💛"
NOOIT: "Wat vond je ervan?" — vraagt naar mening, zet prospect als beoordelaar.

FLOW BUSINESS/OPPORTUNITY:
Stap 1 — Aankondiging (jij aan prospect, vóór het groepje):
"Hey [naam]! Ik maak even een groepje aan met [naam sponsor], want ik kan het zelf nog niet zo goed uitleggen 😄 Hij/zij doet dit al [periode] en heeft zelf een mooie business opgebouwd — hij/zij kan met je mee kijken en al je vragen beantwoorden 👍🏽"

Stap 2 — Introductie in het groepje (jij):
"Hi [naam prospect]! 😊 Dit is [naam sponsor] — hij/zij doet dit al [periode] en heeft zelf een mooie business opgebouwd. Hij/zij helpt mij nu ook en heeft al veel mensen begeleid die precies op zoek waren naar wat jij zoekt 💪🏽
[naam sponsor], dit is [naam prospect]. Ze is op zoek naar [situatie]. Wil jij haar even meenemen in hoe dit werkt? 🙏"

Stap 3 — STAP TERUG. Zeg niets meer tenzij sponsor vraagt.

Stap 4 — Sponsor opent:
"Hey [naam]! Leuk dat [teamlid] ons aan elkaar koppelt 😊 Ik vertel je graag meer — maar eerst even kennismaken! Vertel, wat doe je nu en wat zou jij willen veranderen als je helemaal eerlijk bent? 🥰"

Stap 5 — Follow-up (jij aan prospect, apart, binnen 24u):
"Hey [naam] 😊 Wat sprak je het meeste aan van wat je tot nu toe hebt gezien en gehoord? 🥰"
OF: "Zie je hoe dit je kan helpen om [hun doel] te bereiken? 💛"

FOUTEN DIE MENSEN MAKEN:
- Groepje aanmaken zonder aankondiging → voelt als verrassing
- Zelf blijven praten na introductie → ondermijnt autoriteit sponsor
- "Wat vond je ervan?" als follow-up → zet prospect als beoordelaar
- Sponsor pitcht meteen → moet eerst rapport bouwen
- Geen follow-up binnen 24u → momentum verloren

EDITICATIE FORMULE (Worre): Wie ze zijn + Wat ze gedaan hebben + Waarom perfect voor deze persoon`,

  social: `
### SOCIAL MEDIA & ATTRACTIE

Brookes dagelijkse posting formule:
1. WAARDE: tip, inspiratie, les
2. VERHAAL: iets persoonlijks of resultaat
3. ZACHTE UITNODIGING: "DM me als je meer wilt weten"
NOOIT direct pitchen. Eerst nieuwsgierigheid.

3 verhalen vertellen:
Persoonlijk: wie was je → wat veranderde → wie ben je nu?
Product: wat deden de producten voor jou?
Business: waarom dit model, wat heeft het gebracht?

Lifestyle = beste marketing. Laat je leven zien, mensen kopen mensen.
Stories (IG/FB/TikTok) = krachtigste gratis wervingsinstrument.`,
};

// Haal alleen relevante kennisbank-secties op
export function getKennisbankVoorVraag(vraagType: VraagType): string {
  if (vraagType === "algemeen") {
    // Bij algemene vragen: kern + korte samenvatting
    return KERN;
  }

  // Specifieke vraag: kern + relevante sectie
  const sectie = SECTIES[vraagType] || "";
  return KERN + sectie;
}
