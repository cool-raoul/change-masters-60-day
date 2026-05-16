// ============================================================
// Doel-bedrag (euro per maand) naar rank-suggestie met minimum-vereisten.
// Officiele cijfers uit kennisbank/verdienmodel-commissieplan.md.
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
      label: "Believer (start-rank)",
      toelichting:
        "Eerste rank na aanmelding. Hier verdien je nog niet veel. Focus op je eigen ervaring opbouwen en je eerste paar mensen helpen.",
      vereisten: { eigenIP: 40, qgv: 500, members: 3 },
    };
  }
  if (doelPerMaand < 300) {
    return {
      rank: "builder",
      label: "Builder (bouwsteen voor duplicatie)",
      toelichting:
        "Vanaf hier kun je iemand anders ook Builder maken. Dit is de sleutel tot een schaalbaar inkomen.",
      vereisten: { eigenIP: 40, qgv: 1500, members: 3 },
    };
  }
  if (doelPerMaand < 600) {
    return {
      rank: "bronze",
      label: "Bronze",
      toelichting:
        "Vanaf 300 tot 600 euro per maand. Eerste serieuze inkomensstroom.",
      vereisten: { eigenIP: 100, qgv: 3000, members: 3 },
    };
  }
  if (doelPerMaand < 900) {
    return {
      rank: "silver",
      label: "Silver",
      toelichting:
        "Vanaf 600 euro per maand. Stabiele bij-inkomensstroom.",
      vereisten: { eigenIP: 100, qgv: 6000, members: 6 },
    };
  }
  if (doelPerMaand < 1200) {
    return {
      rank: "gold",
      label: "Gold",
      toelichting:
        "Vanaf 900 euro per maand. Een halve dag werk minder per week wordt realistisch.",
      vereisten: { eigenIP: 150, qgv: 9000, members: 9 },
    };
  }
  if (doelPerMaand < 2500) {
    return {
      rank: "diamond",
      label: "Diamond",
      toelichting:
        "Vanaf 1200 euro per maand. Naar een dag werk minder per week of meer.",
      vereisten: { eigenIP: 150, qgv: 15000, members: 12 },
    };
  }
  return {
    rank: "ster-diamond",
    label: "Star-Diamond (1ster / 2ster / 3ster)",
    toelichting:
      "Voor doelen vanaf 2500 euro per maand. Vereist Diamonds in verschillende benen onder je.",
    vereisten: { eigenIP: 150, qgv: 15000, members: 12 },
  };
}
