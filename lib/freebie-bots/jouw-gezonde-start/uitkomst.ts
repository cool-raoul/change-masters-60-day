// Verhalende, gepersonaliseerde uitkomst voor "Jouw gezonde start".
//
// Geen stijve kopjes. Eén warm verhaal dat zich vormt naar hun antwoorden:
//   1. herkenning + voelbare gap (toon op basis van de darm-score)
//   2. verlangen, geweven uit hun gekozen doelen
//   3. wat veel mensen merken (social proof, claimvrij)
//   4. wat een darm-programma / de Reset hierin kan betekenen
//   5. warme, persoonlijke afsluiter
// Alles claimvrij (gevoel, geen belofte; "wat veel mensen merken").

import { berekenDarmUitslag } from "@/lib/zelftest/darm-vragen";
import {
  DOEL_VERLANGEN,
  DOEL_ASPIRATIE,
  afvalVraagtReset,
  type DoelId,
  type AfvalId,
} from "./vragen";

function naarLijst(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " en " + items[items.length - 1];
}

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
}): GezondeStartUitkomst {
  const { darmAntwoorden, doelen, afvalWens, voornaam } = opts;
  const u = berekenDarmUitslag(darmAntwoorden);
  const naam = voornaam.trim();
  const programmaLabel =
    u.bucket === "plus" ? "Darmen in Balans +" : "Darmen in Balans";

  const kop =
    u.bucket === "plus"
      ? "Er valt iets moois te winnen voor je"
      : "Een mooie eerste stap ligt dichtbij";

  const narratief: string[] = [];

  // 1. Herkenning + voelbare gap.
  if (u.bucket === "plus") {
    narratief.push(
      `${naam ? naam + ", w" : "W"}at we vaak zien bij mensen die dit soort antwoorden geven, is dat hun lichaam ze niet altijd meegeeft wat ze nodig hebben. Dat ze zich zwaarder of vermoeider voelen dan ze zouden willen, dat hun energie wegzakt juist op de momenten dat ze 'm hard nodig hebben, en dat er ergens een gevoel speelt: zo wil ik me eigenlijk niet voelen. Grote kans dat je daar iets van jezelf in herkent. En dat knaagt, want diep van binnen weet je dat er meer in zit.`,
    );
  } else {
    narratief.push(
      `${naam ? naam + ", w" : "W"}at we vaak zien bij mensen die dit soort antwoorden geven, is dat hun lichaam af en toe om aandacht vraagt. Dat ze zich niet altijd zo licht en fit voelen als ze zouden willen, en dat ergens het gevoel speelt: zo wil ik me eigenlijk niet voelen. Grote kans dat je daar iets van jezelf in herkent. En dat knaagt soms, want je weet dat er meer in zit.`,
    );
  }

  // 2. Verlangen, geweven uit hun doelen.
  const verlangens = doelen.map((d) => DOEL_VERLANGEN[d]).filter(Boolean);
  if (verlangens.length > 0) {
    narratief.push(
      `En je gaf aan dat je vooral verlangt naar ${naarLijst(verlangens)}. Dat zegt eigenlijk genoeg: je bent toe aan een nieuwe start, eentje die deze keer wél bij je blijft.`,
    );
  }

  // 3. Aspiratie via social proof, gekoppeld aan hun doelen.
  const aspiraties = doelen.map((d) => DOEL_ASPIRATIE[d]).filter(Boolean);
  const aspiratieZin =
    aspiraties.length > 0 ? naarLijst(aspiraties.slice(0, 3)) : "lichter en energieker";
  narratief.push(
    `Het mooie is, daar ben je niet de enige in. Wat veel mensen merken die met een darm-programma of de Reset zijn begonnen, is dat ze zich na verloop van tijd ${aspiratieZin} gaan voelen, en dat ze makkelijker een ritme vasthouden dat bij ze past. Geen wondermiddel, wel een bewuste herstart.`,
  );

  // 4. Programma-rol + Reset-routing.
  const startTekst =
    u.bucket === "plus"
      ? `Aan wat je aangeeft zou ${programmaLabel} een fijne, wat steviger start voor je zijn, om eerst rustig op te ruimen en je lichaam een goede basis te geven.`
      : `Aan wat je aangeeft zou ${programmaLabel} een hele fijne, laagdrempelige eerste stap voor je zijn, een opfrissing om je lichaam een goede basis te geven.`;
  if (afvalVraagtReset(afvalWens)) {
    narratief.push(
      `${startTekst} En omdat je een wat grotere stap rondom je gewicht wilt zetten, is de Reset daarin de weg, dat is het traject dat daar echt op aansluit.`,
    );
  } else {
    narratief.push(
      `${startTekst} Wil je later een grotere stap maken, dan is de Reset daar de weg in.`,
    );
  }

  // 5. Warme, persoonlijke afsluiter.
  narratief.push(
    `En het allerbelangrijkste: er is altijd een route die bij jóu past, ook als die net even anders ligt. Daarom kijk ik het liefst even persoonlijk met je mee, zodat je de stap kunt zetten die echt klopt voor jou.`,
  );

  return {
    kop,
    narratief,
    programmaLabel,
    bucket: u.bucket,
    totaal: u.totaal,
    max: u.max,
  };
}
