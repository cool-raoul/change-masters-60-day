import {
  PRODUCT_KENNIS,
  ETIKET_KENNIS,
  WEBSHOP_KENNIS,
  KWALITEIT_KENNIS,
  BEZWAREN_KENNIS,
  WC_TIPS,
} from "@/lib/resetcode/producten";
import { FASE2_LIJST, DARM_LIJST } from "@/lib/resetcode/lijsten";
import { innameSchemaAlsKennis } from "@/lib/resetcode/inname-schema";
import {
  BEGELEIDER_KENNIS,
  heeftBegeleiderKennisNodig,
} from "./begeleider-kennis";

// ============================================================
// PROGRAMMA-KENNIS VOOR DE MEMBER-MENTOR
//
// Waarom dit bestaat (Raoul, 2 augustus): de Mentor aan de KLANT-kant
// kent de programma's tot in detail (voedingslijsten, innameschema,
// producten, bezwaren). De Mentor aan de MEMBER-kant kende daar niets
// van. Terwijl juist de begeleider de vragen krijgt die de klant niet
// aan zijn eigen Mentor stelt, of waar die niet uitkwam. Dan moet de
// begeleider het antwoord hier kunnen halen.
//
// Eén bron van waarheid: we hergebruiken exact dezelfde bestanden als
// de klant-Mentor. Wijzigt Raoul een voedingslijst, dan verandert die
// aan beide kanten tegelijk.
//
// Selectief laden, want alles bij elkaar is fors (grofweg 8.000 tokens).
// We hangen per onderwerp alleen het relevante blok aan.
// ============================================================

/** Gaat deze vraag over de programma-inhoud? */
export function isProgrammaVraag(vraag: string): boolean {
  return PATRONEN.some((p) => p.regex.test(vraag.toLowerCase()));
}

type Onderwerp =
  | "voeding-reset"
  | "voeding-darm"
  | "inname"
  | "product"
  | "etiket"
  | "kwaliteit"
  | "bezwaar"
  | "webshop"
  | "stoelgang"
  | "klachten";

const PATRONEN: { onderwerp: Onderwerp; regex: RegExp }[] = [
  {
    onderwerp: "voeding-reset",
    regex:
      /\b(fase ?[1-4]|omschakeling|stabilisatie|laaddag|laaddagen|holistic reset|de reset|reset-?programma|correctie-?dag|appeldag)\b/,
  },
  {
    onderwerp: "voeding-darm",
    // \w* achter darm: "darmprogramma" en "darmklachten" moeten ook
    // meetellen, die vielen anders buiten de woordgrens.
    regex: /\b(darm\w*|16 dagen|zestien dagen|nachtschade|boekweit)\b/,
  },
  {
    onderwerp: "inname",
    regex:
      /\b(inname|innemen|schema|hoeveel .{0,15}(per dag|tabletten|capsules)|dosering|nuchter|voor het slapen|wanneer neem)\b/,
  },
  {
    onderwerp: "product",
    regex:
      /\b(msm|biotic ?blast|daily ?biobasics|proanthenols|omegold|cogelin|triple ?prote|vegan prote|calmag|micro-?mins|golden milk|keltisch zeezout|product|supplement|pakket)\b/,
  },
  { onderwerp: "etiket", regex: /\b(etiket|ingredi|verpakking|houdbaar|allergie)\b/ },
  {
    onderwerp: "kwaliteit",
    regex: /\b(kwaliteit|waarom (zo )?duur|kruidvat|drogist|goedkoper|opname|biobeschikbaar)\b/,
  },
  {
    onderwerp: "bezwaar",
    regex: /\b(piramide|mlm|werkt het|geld terug|garantie|te duur|twijfel|is dit wel)\b/,
  },
  { onderwerp: "webshop", regex: /\b(webshop|bestell?en|herstelbestelling|abonnement|autoship)\b/ },
  {
    onderwerp: "stoelgang",
    regex: /\b(stoelgang|obstipatie|verstopping|wc|poep\w*|ontlasting)\b/,
  },
  {
    onderwerp: "klachten",
    // Klachten die klanten in de eerste dagen melden. De begeleider
    // krijgt deze het vaakst, dus die moet hier het echte antwoord
    // kunnen halen (meer water, extra zeezout, MSM mag omhoog) plus de
    // ladder: eerst tips, dan overleg, pas bij aanhouden de huisarts.
    regex:
      /\b(opgeblazen|opgezet|buikpijn|kramp\w*|hoofdpijn|misselijk\w*|moe\b|vermoeid\w*|duizelig|slaap slecht|slecht slapen|uitslag|jeuk|griep\w*|koorts\w*|klacht\w*|voel me (niet |beroerd|slecht))/,
  },
];

function onderwerpenIn(vraag: string): Onderwerp[] {
  const t = vraag.toLowerCase();
  return PATRONEN.filter((p) => p.regex.test(t)).map((p) => p.onderwerp);
}

const WERKWIJZE = `
## PROGRAMMA-VRAAG VAN EEN KLANT

${"" /* leeg gehouden voor leesbaarheid van de opbouw hieronder */}
Dit is materiaal uit de programma's zelf. De begeleider krijgt deze vragen van zijn klanten, dus:

1. GEEF HET ECHTE ANTWOORD, uit het materiaal hieronder. Niet "vraag het aan je begeleider", want jij PRAAT met de begeleider.
2. SCHRIJF HET DOOR TE STUREN. Formuleer zo dat de begeleider je antwoord letterlijk kan kopiëren naar zijn klant: in de je-vorm, warm, zonder vakjargon.
3. STAAT HET ER NIET, ZEG DAT. Verzin nooit een regel, een dosering of een product. Zeg dan eerlijk dat het niet in het materiaal staat en dat het beter is om het bij het team na te vragen.
4. GEZONDHEID BLIJFT VOORZICHTIG. Nooit een claim over wat een product doet, nooit een diagnose, nooit medicatie-advies. Bij klachten die aanhouden of bij medicatie: eerst de tips uit het materiaal, dan overleg met de begeleider, en pas als het aanhoudt de huisarts. Bij Crohn, colitis, diverticulitis of diabetes type 1 geef je nooit productadvies.
5. VERSCHIL TUSSEN DE PROGRAMMA'S. De lijsten verschillen echt: banaan mag WEL in Darmen in Balans (biologisch, niet overrijp) maar NIET in reset-fase 2. Tomaat en paprika mogen WEL in reset-fase 2 maar NIET in het darmprogramma (nachtschade). Kijk dus altijd naar het programma waar de klant in zit, en vraag dat als het niet duidelijk is.
`.trim();

/**
 * De programma-kennis die bij deze vraag hoort. Lege string als de
 * vraag er niet over gaat, zodat gewone business-vragen niets extra's
 * meeslepen.
 */
export function bouwProgrammaKennisSectie(vraag: string): string {
  const onderwerpen = onderwerpenIn(vraag);
  const gedragsregels = heeftBegeleiderKennisNodig(vraag);
  // Gezondheidsvragen (aandoening, zwangerschap, medicatie, alarm) hebben
  // de gedragsregels nodig, ook als er geen programma-onderwerp in zit.
  if (onderwerpen.length === 0 && !gedragsregels) return "";

  const blokken: string[] = [WERKWIJZE, BEGELEIDER_KENNIS];
  const heeft = (o: Onderwerp) => onderwerpen.includes(o);

  // Voeding: bij twijfel over welk programma geven we ze allebei, dan
  // kan de Mentor het verschil uitleggen in plaats van gokken.
  if (heeft("voeding-reset")) blokken.push(FASE2_LIJST);
  if (heeft("voeding-darm")) blokken.push(DARM_LIJST);
  if (
    !heeft("voeding-reset") &&
    !heeft("voeding-darm") &&
    (heeft("inname") || heeft("product"))
  ) {
    // Productvraag zonder programma erbij: het verschil tussen de twee
    // lijsten is dan vaak precies wat de begeleider moet weten.
    blokken.push(FASE2_LIJST, DARM_LIJST);
  }

  if (heeft("inname")) blokken.push(innameSchemaAlsKennis());
  if (
    heeft("product") ||
    heeft("inname") ||
    heeft("stoelgang") ||
    heeft("klachten")
  ) {
    blokken.push(PRODUCT_KENNIS);
  }
  if (heeft("klachten")) {
    blokken.push(
      `KLACHTEN IN DE EERSTE DAGEN, hoe de begeleider hiermee omgaat:
Wennen hoort erbij en dat mag je gerust zeggen: hoofdpijn, vermoeidheid, een veranderde stoelgang of een opgeblazen gevoel komen voor terwijl het lichaam omschakelt. Loop eerst deze checks langs voordat je iets anders adviseert: eet de klant genoeg, drinkt hij genoeg water, zit er veel kant-en-klaar in het menu, en gebruikt hij dagelijks extra Keltisch zeezout. MSM Plus mag verhoogd worden bij ongemakken in het begin, tot maximaal 30 tabletten per dag; bij hoofdpijn helpen 10 extra tabletten vaak binnen een paar uur. Biotic Blast mag extra bij een moeizame stoelgang.
De volgorde is: eerst deze tips, dan even samen kijken met jou als begeleider, en pas als het langer aanhoudt of als de klant zich echt niet goed voelt naar de huisarts. Ga nooit tegen een arts in. Bij Crohn, colitis, diverticulitis of diabetes type 1 geef je geen productadvies.`,
    );
  }
  if (heeft("stoelgang")) {
    blokken.push(
      `MOEIZAME STOELGANG, de tips uit het materiaal:\n${WC_TIPS.map((t) => `- ${t}`).join("\n")}`,
    );
  }
  if (heeft("etiket")) blokken.push(ETIKET_KENNIS);
  if (heeft("kwaliteit")) blokken.push(KWALITEIT_KENNIS);
  if (heeft("bezwaar")) blokken.push(BEZWAREN_KENNIS);
  if (heeft("webshop")) blokken.push(WEBSHOP_KENNIS);

  return `\n\n${blokken.join("\n\n")}`;
}
