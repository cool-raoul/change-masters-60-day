// Verhalende, gepersonaliseerde uitkomst voor "Jouw gezonde start".
//
// Geen stijve kopjes. Eén warm verhaal dat zich vormt naar hun antwoorden:
//   1. herkenning + voelbare gap (toon op basis van de darm-score)
//   2. verlangen, geweven uit hun gekozen doelen
//   3. wat veel mensen merken (social proof, claimvrij)
//   4. wat een darm-programma / de Reset hierin kan betekenen
//   5. warme, persoonlijke afsluiter
// Alles claimvrij (gevoel, geen belofte; "wat veel mensen merken").
//
// FOUNDER-EDIT: elke zin-bouwsteen is bewerkbaar (voor iedereen) via het
// tekst_overrides-systeem. De function leest `overrides` (sleutel → tekst) en
// gebruikt anders de standaard. Dynamische stukjes blijven via {plekhouders}.
// De lijst GEZONDE_START_UITKOMST_FRAGMENTEN voedt het founder-paneel.

import { berekenDarmUitslag } from "@/lib/zelftest/darm-vragen";
import {
  DOEL_OPTIES,
  DOEL_VERLANGEN,
  DOEL_ASPIRATIE,
  afvalVraagtReset,
  type DoelId,
  type AfvalId,
} from "./vragen";

// ---- Standaard-teksten (de bouwstenen) ----
const KOP_PLUS = "Er valt iets moois te winnen voor je";
const KOP_BASIS = "Een mooie eerste stap ligt dichtbij";
const PARA1_PLUS =
  "{aanhef}wat we vaak zien bij mensen die dit soort antwoorden geven, is dat hun lichaam ze niet altijd meegeeft wat ze nodig hebben. Dat ze zich zwaarder of vermoeider voelen dan ze zouden willen, dat hun energie wegzakt juist op de momenten dat ze 'm hard nodig hebben, en dat er ergens een gevoel speelt: zo wil ik me eigenlijk niet voelen. Grote kans dat je daar iets van jezelf in herkent. En dat knaagt, want diep van binnen weet je dat er meer in zit.";
const PARA1_BASIS =
  "{aanhef}wat we vaak zien bij mensen die dit soort antwoorden geven, is dat hun lichaam af en toe om aandacht vraagt. Dat ze zich niet altijd zo licht en fit voelen als ze zouden willen, en dat ergens het gevoel speelt: zo wil ik me eigenlijk niet voelen. Grote kans dat je daar iets van jezelf in herkent. En dat knaagt soms, want je weet dat er meer in zit.";
const PARA2 =
  "En je gaf aan dat je vooral verlangt naar {verlangen}. Dat zegt eigenlijk genoeg: je bent toe aan een nieuwe start, eentje die deze keer wél bij je blijft.";
const PARA3 =
  "Het mooie is, daar ben je niet de enige in. Wat veel mensen merken die met een darm-programma of de Reset zijn begonnen, is dat ze zich na verloop van tijd {aspiratie} gaan voelen, en dat ze makkelijker een ritme vasthouden dat bij ze past. Geen wondermiddel, wel een bewuste herstart.";
const PARA4_START_PLUS =
  "Aan wat je aangeeft zou {programma} een fijne, wat steviger start voor je zijn, om eerst rustig op te ruimen en je lichaam een goede basis te geven.";
const PARA4_START_BASIS =
  "Aan wat je aangeeft zou {programma} een hele fijne, laagdrempelige eerste stap voor je zijn, een opfrissing om je lichaam een goede basis te geven.";
const PARA4_RESET_JA =
  "En omdat je een wat grotere stap rondom je gewicht wilt zetten, is de Reset daarin de weg, dat is het traject dat daar echt op aansluit.";
const PARA4_RESET_NEE =
  "Wil je later een grotere stap maken, dan is de Reset daar de weg in.";
const PARA5 =
  "En het allerbelangrijkste: er is altijd een route die bij jóu past, ook als die net even anders ligt. Daarom kijk ik het liefst even persoonlijk met je mee, zodat je de stap kunt zetten die echt klopt voor jou.";
const PROGRAMMA_PLUS = "Darmen in Balans +";
const PROGRAMMA_BASIS = "Darmen in Balans";

function naarLijst(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " en " + items[items.length - 1];
}

function interpoleer(tekst: string, vars: Record<string, string>): string {
  return tekst.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function hoofdletter(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export type UitkomstFragment = {
  key: string;
  label: string;
  standaard: string;
  multiline: boolean;
  hint?: string;
};

// De volledige lijst bewerkbare bouwstenen voor het founder-paneel.
export const GEZONDE_START_UITKOMST_FRAGMENTEN: UitkomstFragment[] = [
  { key: "uitkomst.kop.plus", label: "Titel (meer signalen)", standaard: KOP_PLUS, multiline: false },
  { key: "uitkomst.kop.basis", label: "Titel (minder signalen)", standaard: KOP_BASIS, multiline: false },
  {
    key: "uitkomst.para1.plus",
    label: "1. Herkenning (meer signalen)",
    standaard: PARA1_PLUS,
    multiline: true,
    hint: "{aanhef} = de voornaam met komma (bv. 'Sandy, '). Laat 'm staan waar je de naam wilt.",
  },
  {
    key: "uitkomst.para1.basis",
    label: "1. Herkenning (minder signalen)",
    standaard: PARA1_BASIS,
    multiline: true,
    hint: "{aanhef} = de voornaam met komma.",
  },
  {
    key: "uitkomst.para2",
    label: "2. Verlangen",
    standaard: PARA2,
    multiline: true,
    hint: "{verlangen} = automatisch uit hun gekozen doelen.",
  },
  {
    key: "uitkomst.para3",
    label: "3. Wat veel mensen merken",
    standaard: PARA3,
    multiline: true,
    hint: "{aspiratie} = automatisch uit hun doelen.",
  },
  {
    key: "uitkomst.para4.start.plus",
    label: "4. Programma-zin (meer signalen)",
    standaard: PARA4_START_PLUS,
    multiline: true,
    hint: "{programma} = de programma-naam.",
  },
  {
    key: "uitkomst.para4.start.basis",
    label: "4. Programma-zin (minder signalen)",
    standaard: PARA4_START_BASIS,
    multiline: true,
    hint: "{programma} = de programma-naam.",
  },
  { key: "uitkomst.para4.reset.ja", label: "4b. Reset-zin (grotere afval-wens)", standaard: PARA4_RESET_JA, multiline: true },
  { key: "uitkomst.para4.reset.nee", label: "4b. Reset-zin (kleinere/geen afval-wens)", standaard: PARA4_RESET_NEE, multiline: true },
  { key: "uitkomst.para5", label: "5. Afsluiter", standaard: PARA5, multiline: true },
  { key: "uitkomst.programma.plus", label: "Programma-naam (meer signalen)", standaard: PROGRAMMA_PLUS, multiline: false },
  { key: "uitkomst.programma.basis", label: "Programma-naam (minder signalen)", standaard: PROGRAMMA_BASIS, multiline: false },
  ...DOEL_OPTIES.map((o) => ({
    key: `doel.verlangen.${o.id}`,
    label: `Verlangen-zin — ${o.label}`,
    standaard: DOEL_VERLANGEN[o.id],
    multiline: false,
  })),
  ...DOEL_OPTIES.map((o) => ({
    key: `doel.aspiratie.${o.id}`,
    label: `"Wat mensen merken"-zin — ${o.label}`,
    standaard: DOEL_ASPIRATIE[o.id],
    multiline: false,
  })),
];

export type GezondeStartUitkomst = {
  kop: string;
  narratief: string[];
  programmaLabel: string;
  bucket: "basis" | "plus";
  totaal: number;
  max: number;
};

export function bouwGezondeStartUitkomst(opts: {
  darmAntwoorden: Record<string, number>;
  doelen: DoelId[];
  afvalWens?: AfvalId | null;
  voornaam: string;
  overrides?: Record<string, string>;
}): GezondeStartUitkomst {
  const { darmAntwoorden, doelen, afvalWens, voornaam, overrides = {} } = opts;
  const u = berekenDarmUitslag(darmAntwoorden);
  const naam = voornaam.trim();
  const ov = (key: string, standaard: string) => overrides[key] ?? standaard;
  const aanhef = naam ? `${naam}, ` : "";

  const programmaLabel =
    u.bucket === "plus"
      ? ov("uitkomst.programma.plus", PROGRAMMA_PLUS)
      : ov("uitkomst.programma.basis", PROGRAMMA_BASIS);

  const kop =
    u.bucket === "plus"
      ? ov("uitkomst.kop.plus", KOP_PLUS)
      : ov("uitkomst.kop.basis", KOP_BASIS);

  const narratief: string[] = [];

  // 1. Herkenning + voelbare gap.
  narratief.push(
    hoofdletter(
      interpoleer(
        u.bucket === "plus"
          ? ov("uitkomst.para1.plus", PARA1_PLUS)
          : ov("uitkomst.para1.basis", PARA1_BASIS),
        { aanhef },
      ),
    ),
  );

  // 2. Verlangen, geweven uit hun doelen.
  const verlangens = doelen
    .map((d) => ov(`doel.verlangen.${d}`, DOEL_VERLANGEN[d]))
    .filter(Boolean);
  if (verlangens.length > 0) {
    narratief.push(
      interpoleer(ov("uitkomst.para2", PARA2), {
        verlangen: naarLijst(verlangens),
      }),
    );
  }

  // 3. Aspiratie via social proof, gekoppeld aan hun doelen.
  const aspiraties = doelen
    .map((d) => ov(`doel.aspiratie.${d}`, DOEL_ASPIRATIE[d]))
    .filter(Boolean);
  const aspiratieZin =
    aspiraties.length > 0
      ? naarLijst(aspiraties.slice(0, 3))
      : "lichter en energieker";
  narratief.push(
    interpoleer(ov("uitkomst.para3", PARA3), { aspiratie: aspiratieZin }),
  );

  // 4. Programma-rol + Reset-routing.
  const startTekst = interpoleer(
    u.bucket === "plus"
      ? ov("uitkomst.para4.start.plus", PARA4_START_PLUS)
      : ov("uitkomst.para4.start.basis", PARA4_START_BASIS),
    { programma: programmaLabel },
  );
  const resetZin = afvalVraagtReset(afvalWens)
    ? ov("uitkomst.para4.reset.ja", PARA4_RESET_JA)
    : ov("uitkomst.para4.reset.nee", PARA4_RESET_NEE);
  narratief.push(`${startTekst} ${resetZin}`);

  // 5. Warme, persoonlijke afsluiter.
  narratief.push(ov("uitkomst.para5", PARA5));

  return {
    kop,
    narratief,
    programmaLabel,
    bucket: u.bucket,
    totaal: u.totaal,
    max: u.max,
  };
}
