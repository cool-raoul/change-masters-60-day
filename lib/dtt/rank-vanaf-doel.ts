// ============================================================
// Doel-bedrag (euro per maand) naar rank-richting met minimum-vereisten.
// De vereisten (IP / QGV / members) komen uit
// kennisbank/verdienmodel-commissieplan.md.
//
// De euro-bandbreedtes zijn INDICATIEF, op 29 juli 2026 door Raoul
// bijgesteld. Ze overlappen bewust: wat iemand bij een status verdient
// hangt af van de opbouw van de groep, niet van een vast tarief. Ze
// dienen één doel: een idee geven in welke richting je moet denken.
// Bij overlap kiezen we de laagste status die het bedrag dekt, dat is
// de eerlijkste richting om op te koersen.
//
//   Bronze        300 tot 1200 per maand
//   Silver        500 tot 1500
//   Gold          900 tot 2000
//   Diamond       1200 tot 5000
//   Star-Diamond  vanaf 2000
// ============================================================

export type RankSuggestie = {
  rank: "believer" | "builder" | "bronze" | "silver" | "gold" | "diamond" | "ster-diamond";
  label: string;
  toelichting: string;
  vereisten: {
    eigenIP: number;
    qgv: number;
    members: number;
  };
};

export function rankVanafDoel(doelPerMaand: number): RankSuggestie {
  if (doelPerMaand < 100) {
    return {
      rank: "believer",
      label: "Believer (start-status)",
      toelichting:
        "De eerste status na je aanmelding. Hier verdien je nog niet veel. Je focus ligt op je eigen ervaring opbouwen en je eerste paar mensen helpen.",
      vereisten: { eigenIP: 40, qgv: 500, members: 3 },
    };
  }
  if (doelPerMaand < 300) {
    return {
      rank: "builder",
      label: "Builder",
      toelichting:
        "Vanaf hier kun je iemand anders ook Builder maken. Daar begint het schaalbare deel.",
      vereisten: { eigenIP: 40, qgv: 1500, members: 3 },
    };
  }
  if (doelPerMaand < 500) {
    return {
      rank: "bronze",
      label: "Bronze",
      toelichting:
        "Indicatief zo'n 300 tot 1200 euro per maand. Je eerste serieuze inkomensstroom.",
      vereisten: { eigenIP: 100, qgv: 3000, members: 3 },
    };
  }
  if (doelPerMaand < 900) {
    return {
      rank: "silver",
      label: "Silver",
      toelichting:
        "Indicatief zo'n 500 tot 1500 euro per maand. Een stabiele bij-inkomensstroom.",
      vereisten: { eigenIP: 100, qgv: 6000, members: 6 },
    };
  }
  if (doelPerMaand < 1200) {
    return {
      rank: "gold",
      label: "Gold",
      toelichting:
        "Indicatief zo'n 900 tot 2000 euro per maand. Voor veel mensen komt hier een halve dag minder werken per week in zicht.",
      vereisten: { eigenIP: 150, qgv: 9000, members: 9 },
    };
  }
  if (doelPerMaand < 2000) {
    return {
      rank: "diamond",
      label: "Diamond",
      toelichting:
        "Indicatief zo'n 1200 tot 5000 euro per maand. Daarmee komt een hele dag minder werken per week in zicht, of meer.",
      vereisten: { eigenIP: 150, qgv: 15000, members: 12 },
    };
  }
  return {
    rank: "ster-diamond",
    label: "Star-Diamond (1ster / 2ster / 3ster)",
    toelichting:
      "Indicatief vanaf 2000 euro per maand, en daarboven geen vast plafond. Hiervoor heb je Diamonds in verschillende benen onder je.",
    vereisten: { eigenIP: 150, qgv: 15000, members: 12 },
  };
}
