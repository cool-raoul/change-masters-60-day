// ============================================================
// "Wist-je"-momenten: geruststellingen en tips uit het eigen
// programma-materiaal, op de dag waarop ze relevant worden
// (akkoord Raoul 24 juli 2026). Eén per dag, eenmalig, met
// inhaal: wie een dag overslaat krijgt het oudste nog niet
// vertelde moment bij het eerstvolgende bezoek.
//
// Alles komt letterlijk uit het resetboekje, het darmboekje of
// de eigen video's; claim-vrij geformuleerd. {{naam}} wordt
// client-side vervangen door de begeleider-naam.
// ============================================================

export type Wistje = {
  /** Touchpoint-sleutel (eenmaligheid), altijd met prefix "wistje-". */
  sleutel: `wistje-${string}`;
  programma: "darm" | "reset";
  station: string;
  dag: number;
  tekst: string;
};

export const WISTJES: Wistje[] = [
  {
    sleutel: "wistje-f2-onwennig",
    programma: "reset",
    station: "omschakeling",
    dag: 2,
    tekst:
      "Even goed om te weten: de eerste dagen kunnen wat onwennig zijn. Vermoeidheid, wat hoofdpijn, een veranderde stoelgang of cravings kán erbij horen, en het is bij iedereen anders. Wat helpt: extra Keltisch zeezout, extra water drinken, en je mag je MSM Plus verhogen. Merk je iets? Zeg het me gerust, dan kijk ik met je mee. 💚",
  },
  {
    sleutel: "wistje-f2-woosh",
    programma: "reset",
    station: "omschakeling",
    dag: 9,
    tekst:
      "Sta je stil op de weegschaal? Heel normaal, en het heeft zelfs een naam. In week 2 is stilstand of zelfs iets aankomen heel gewoon: je lichaam houdt vocht vast in de lege vetcellen terwijl de verbranding gewoon doorloopt. Na 3 à 4 dagen kan er dan ineens een halve tot ruim een kilo af zijn: de \"woosh\". Bij vrouwen hoort stilstand rond de menstruatie er ook gewoon bij. Pas bij meer dan 4 dagen totale stilstand kijken we samen naar een appeldag. Dus: geen paniek, de aanhouder verliest... kilo's. 😉",
  },
  {
    sleutel: "wistje-f2-rust",
    programma: "reset",
    station: "omschakeling",
    dag: 12,
    tekst:
      "Kleine reminder voor vandaag: stress remt, rust helpt. Je lichaam is hard aan het werk, dus gun jezelf rustmomenten als het daarom vraagt en wees lief voor je lijf. Fijne tip uit je boekje: neem 2 à 3 keer per week een basisch (voeten)bad van 20 minuten met 4 à 5 eetlepels Keltisch zeezout. 💚",
  },
  {
    sleutel: "wistje-f2-aanhouder",
    programma: "reset",
    station: "omschakeling",
    dag: 17,
    tekst:
      "Eerlijk moment: iedereen krijgt ergens een dag waarop het even lastig is. Niks gaat vanzelf, maar de aanhouder wint. En je hoeft het niet alleen te doen: ik ben er dag en nacht, en {{naam}} is dichtbij. Vraag gerust hulp. 💪",
  },
  {
    sleutel: "wistje-f3-anker",
    programma: "reset",
    station: "stabilisatie",
    dag: 3,
    tekst:
      "Goed om te onthouden in deze fase: schommelen rond je ankerpunt is precies de bedoeling. Fase 3 draait niet om verder omlaag, maar om stevig staan: rond een kilo om je eindgewicht van fase 2 bewegen is gewoon goed bezig. 💚",
  },
  {
    sleutel: "wistje-darm-wennen",
    programma: "darm",
    station: "zestien-dagen",
    dag: 2,
    tekst:
      "Even goed om te weten: de eerste dagen kunnen wat onwennig zijn. Wat hoofdpijn, een veranderde stoelgang of cravings kán erbij horen, bij iedereen anders. Wat helpt: extra Keltisch zeezout, extra water drinken, en je mag je MSM Plus verhogen. Merk je iets? Zeg het me gerust, dan kijk ik met je mee. 💚",
  },
];

/**
 * Het oudste nog niet vertelde wist-je-moment waarvan de dag bereikt is
 * (inhaal-principe), of null.
 */
export function bepaalDueWistje(
  programmaSlug: string,
  stationSlug: string | null,
  dagNummer: number | null,
  touchpoints: string[],
): Wistje | null {
  if (!stationSlug || dagNummer == null) return null;
  return (
    WISTJES.filter(
      (w) =>
        w.programma === programmaSlug &&
        w.station === stationSlug &&
        dagNummer >= w.dag &&
        !touchpoints.includes(w.sleutel),
    ).sort((a, b) => a.dag - b.dag)[0] ?? null
  );
}
