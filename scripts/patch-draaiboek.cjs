// Vervangt per module de "Wat je vertelt"-regel in het rondleiding-draaiboek
// (op het Bureaublad) door de stem-DNA-versie uit de workflow. Lokale file-edit.

const fs = require("fs");

const PAD =
  "C:\\Users\\raoul\\OneDrive\\Bureaublad\\ELEVA-rondleiding-draaiboek.html";

// Stem-DNA-versie (jury-output), met typefoutjes + restjes "niet X maar Y" weg.
const regels = [
  { id: "A1", tekst: "Je gaat ELEVA gebruiken als je telefoon: via een icoontje op je startscherm. Geen app uit de winkel, gewoon een snelkoppeling zodat je je meldingen krijgt. In twee minuten staat 'ie klaar." },
  { id: "A2", tekst: "Je kiest welk pad het beste bij je past: Core als je een webshop wilt bouwen, Sprint als je in 60 dagen resultaat wilt zien, Pro als je al cliënten hebt. Al je tools zijn hetzelfde, alleen de begeleiding verschilt. Je kunt later altijd wisselen." },
  { id: "A3", tekst: "Je eerste vier stappen leggen je fundament. Je maakt je app klaar, je ontdekt waarom je dit echt begonnen bent, je zet vijf namen op je radar en je stelt je doel in. Daarna begint dag een, en daar ben je dan klaar voor." },
  { id: "B1", tekst: "Je dag staat linksboven, je meldingen rechtsboven, alles wat je nodig hebt is een tik weg. Niks hoeft je te zoeken. Overzichtelijk, en gemaakt voor hoe jij werkt." },
  { id: "B2", tekst: "Die 'Wat nu?'-knop helpt je als je ergens vastzit. Je krijgt precies op dat moment de uitleg die je nodig hebt, geen lange training vooraf. Hulp wanneer je 'm echt nodig hebt." },
  { id: "C1", tekst: "Je opent ELEVA en je ziet meteen wat telt vandaag. Je dag, je top-mensen om op te pakken, je openstaande setup-stappen. Geen overload, gewoon het ene wat je nu nodig hebt. Dat is je startplek, elke dag." },
  { id: "C2", tekst: "Per dag krijg je een korte les en een afvinklijst met je stappen. Alles staat al klaar, je hoeft niks te bedenken. Je gaat mee op voortgang, dus heb je het een paar dagen druk gehad, dan sta je morgen nog precies waar je was. Je raakt niks kwijt 🥰" },
  { id: "C3", tekst: "Je WHY is waarom je begonnen bent, je brandstof op de mindere dagen. Mensen haken aan op je persoonlijke verhaal, niet op een product. We werken 'm samen uit, en daarna heb je 'm altijd terug." },
  { id: "D1", tekst: "Een lijst met al jouw mensen, gesorteerd per fase: lead, uitgenodigd, one-pager, presentatie, follow-up of klant. Je ziet in een oogopslag waar je staat en wie je vandaag oppakt. Geen losse spreadsheets meer." },
  { id: "D2", tekst: "Je voegt iemand toe op drie manieren: typ gewoon de naam, importeer uit je contacten, of spreek 'm in. 'Nieuwe prospect Jan van de voetbalclub', en Jan staat erin. Hoe makkelijker, hoe beter." },
  { id: "D3", tekst: "Een persoon, en alles wat je over 'm weet staat hier: welke fase, je nummers, je notities, alles wat je hebt gedeeld. Je werkplek per persoon. Privé, alleen voor jou." },
  { id: "E1", tekst: "Een bibliotheek met kant-en-klare uitnodigingen, follow-ups, antwoorden op bezwaren, sluiters, edification. Voor elk moment een zin die werkt. Jij vult de naam in, klaar. Nooit meer 'wat zeg ik nou?' 🥰" },
  { id: "E2", tekst: "Je eerste bericht schrijven voelt groot. ELEVA maakt 'm minder spannend: jij spreekt de context in, 'ken Maria van de sportschool, twee kinderen, druk leven', en ELEVA maakt er een uitnodiging van in jouw stijl. Kopiëren en versturen, klaar." },
  { id: "E3", tekst: "Die gouden microfoon werkt overal. Je bent bij school, je hebt net een gesprek gehad, je zit in de auto, je zegt gewoon wat je wilt onthouden. Een minuut typen wordt vijf seconden inspreken." },
  { id: "E4", tekst: "Schrijf je bericht nu, stuur 'm straks op het moment dat past. Of toon gewoon een QR-code die de ander scant. ELEVA doet het werk, jij blijft relaxed 🥰" },
  { id: "F1", tekst: "Je persoonlijke Mentor. Hij kent je dag, je WHY, je sponsor, je technieken. Je stelt een vraag en hij helpt: een bericht schrijven, helpen bij bezwaren, roleplay doen, productadvies geven. Dag en nacht, je staat er nooit alleen voor." },
  { id: "F2", tekst: "Je kiest een film, ELEVA geeft je een eigen link. Die plak je in WhatsApp en de film werkt voor je. Je ziet daarna hoeveel je prospect heeft gekeken. Geen 'heb je 'm al gezien?'-appjes meer, de film doet het werk 💪🏽" },
  { id: "F3", tekst: "Een korte, slimme test die je naar je prospect stuurt. Zij vullen 'm in, jij krijgt automatisch een productadvies op maat terug om door te sturen. Het filterwerk doen wij voor je." },
  { id: "F4", tekst: "Een 3-weg-gesprek is vijf stappen: aankondiging, introductie, stap terug, sponsor-opening, follow-up. Het staat hier al voorbereid, met jouw sponsor-naam erin. Niks hoef je zelf te verzinnen." },
  { id: "F5", tekst: "Je geeft je prospect hun eigen mini-omgeving. Daar staat alles klaar: de producten, je verhaal, hoe het business-deel werkt, de veelgestelde vragen. Jij hoeft niet alles zelf uit te leggen, zij ontdekken het zelf." },
  { id: "F6", tekst: "Korte, gratis testjes die je deelt op social of in een gesprek. Iemand vult 'm in, en die persoon komt automatisch als nieuwe lead bij je binnen. Het filterwerk doen wij, jij spreekt mensen die echt openstaan 🥰" },
  { id: "G1", tekst: "Alle gesprekken die je voert en alle 3-weg-groepen waar je sponsor bent, in een lijst. Een telletje zegt wat er ongelezen is. Niks glipt voorbij." },
  { id: "G2", tekst: "Alles wat je hebt ingepland om op te volgen staat hier. Je hebt Jan beloofd om woensdag iets te sturen, je wilt Maria donderdag bellen, het staat klaar en je krijgt op tijd een seintje. Alles op je radar." },
  { id: "G3", tekst: "Je beste zinnen, je edification-stukken, je closing-zin, je WHY-verhaal, alles wat je goed hebt opgeschreven bewaar je hier. Een keer goed opschrijven, daarna vind je 't altijd terug 🥰" },
  { id: "G4", tekst: "Wil je meer leren? Over social media, hoe je het gesprek voert, de diepere stappen, het zit allemaal in ELEVA Academy. Op je eigen moment, los van je dagelijkse stappen." },
  { id: "H1", tekst: "Zodra je mensen onder je hebt, zie je ze hier. Een groene stip betekent dat iemand nu actief is, handig voor een snelle vraag. Je sponsor ziet die stip ook bij jou. Wil je dat niet, dan zet je 'm uit." },
  { id: "H2", tekst: "Op dag 7, 14 en 21 sta je even stil. Vijf minuten nadenken: wat ging goed deze week, waar liep het stroef, waar leg je volgende week je focus. Je sponsor leest mee om je te helpen, gewoon omdat je het samen doet 💪🏽" },
  { id: "H3", tekst: "Je cijfers over de tijd. Hoeveel mensen je hebt benaderd, hoeveel je films keken, hoeveel er klant werden. Dit is je analyse-moment, geen dagelijkse taak. Een keer per week kijken geeft je rust en helderheid." },
  { id: "I1", tekst: "Je naam, je foto, je telefoonnummer. Je nummer is belangrijk, want daardoor openen knoppen direct bij de juiste persoon. Vijf minuten werk, en het scheelt je later veel." },
  { id: "I2", tekst: "Je begint met Core, maar voelt dat Sprint beter past? Of je bent goed onderweg en wilt naar Pro? Je wisselt hier. Je voortgang blijft bewaard, en je kunt altijd terug." },
  { id: "I3", tekst: "Je tempo is persoonlijk. Hoeveel mensen wil je per week benaderen, hoeveel gesprekken pak je op? Dat bepaal je hier, en ELEVA past zich aan jou aan. Schroef gerust op zodra je merkt dat er ruimte is 🥰" },
  { id: "I4", tekst: "Je sponsor ziet bepaalde dingen van je: welke dag je zit, hoe je loopt op je doelen. Andere dingen blijven volledig privé. Jij bepaalt wat je deelt, en je online-stip kun je uitzetten." },
  { id: "I5", tekst: "ELEVA spreekt met jou in de taal die jij het liefst gebruikt. En je kiest een donker of licht thema, net wat fijn voelt. Kleine dingen, en toch voelt het meteen van jou 💪🏽" },
  { id: "I6", tekst: "Premium voegt extra mogelijkheden toe. Laat kort zien wat het brengt, en laat ze zelf kijken of het bij ze past." },
];

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let html = fs.readFileSync(PAD, "utf8");
let gepatcht = 0;
const gemist = [];

for (const { id, tekst } of regels) {
  const low = id.toLowerCase();
  const start = html.indexOf(`id="${low}"`);
  if (start === -1) {
    gemist.push(id);
    continue;
  }
  const volgende = html.indexOf('<div class="module"', start + 1);
  const eind = volgende === -1 ? html.length : volgende;
  const blok = html.slice(start, eind);
  const re = /(Wat je vertelt<\/span><span class="val">)([\s\S]*?)(<\/span>)/;
  if (!re.test(blok)) {
    gemist.push(id + " (geen Wat-je-vertelt-rij)");
    continue;
  }
  const nieuwBlok = blok.replace(re, (_m, p1, _p2, p3) => p1 + esc(tekst) + p3);
  html = html.slice(0, start) + nieuwBlok + html.slice(eind);
  gepatcht++;
}

fs.writeFileSync(PAD, html, "utf8");
console.log(`Gepatcht: ${gepatcht}/${regels.length} modules.`);
if (gemist.length) console.log("Gemist:", gemist.join(", "));
