// ============================================================
// 5 tempo-brackets voor Core. Minimum-aantallen per onderdeel, member
// mag altijd meer. Geen tijdsprognoses, wel kwalitatieve verwachtingen.
// ============================================================

export type Bracket = "minimaal" | "rustig" | "gestaag" | "serieus" | "doorpakken";

export type BracketDefinitie = {
  bracket: Bracket;
  label: string;
  urenPerWeekRange: string;
  verwachting: string;
  dmoMinimums: {
    contactenPerDag: number;
    socialPostsPerWeek: number;
    freebiesPerWeek: number;
    followUpsPerDag: number;
  };
};

export const BRACKETS: Record<Bracket, BracketDefinitie> = {
  minimaal: {
    bracket: "minimaal",
    label: "Minimaal",
    urenPerWeekRange: "<3u",
    verwachting:
      "Je producten terugverdienen. Inkomsten ongeveer gelijk aan je eigen maandelijkse bestellingen, dus je product wordt voor jou gratis.",
    dmoMinimums: {
      contactenPerDag: 0,
      socialPostsPerWeek: 0,
      freebiesPerWeek: 0,
      followUpsPerDag: 0,
    },
  },
  rustig: {
    bracket: "rustig",
    label: "Rustig",
    urenPerWeekRange: "3-6u",
    verwachting:
      "Eerste klanten in je eigen netwerk opbouwen. Kleine commissies bovenop je eigen bestellingen.",
    dmoMinimums: {
      contactenPerDag: 2,
      socialPostsPerWeek: 2,
      freebiesPerWeek: 1,
      followUpsPerDag: 1,
    },
  },
  gestaag: {
    bracket: "gestaag",
    label: "Gestaag",
    urenPerWeekRange: "6-10u",
    verwachting:
      "Eerste members aanbrengen. Builder-rank wordt realistisch doel.",
    dmoMinimums: {
      contactenPerDag: 3,
      socialPostsPerWeek: 3,
      freebiesPerWeek: 1,
      followUpsPerDag: 2,
    },
  },
  serieus: {
    bracket: "serieus",
    label: "Serieus",
    urenPerWeekRange: "10-16u",
    verwachting:
      "Builder-rank opbouwen en eerste duplicatie starten (een andere Builder helpen worden).",
    dmoMinimums: {
      contactenPerDag: 5,
      socialPostsPerWeek: 5,
      freebiesPerWeek: 2,
      followUpsPerDag: 3,
    },
  },
  doorpakken: {
    bracket: "doorpakken",
    label: "Doorpakken",
    urenPerWeekRange: "16u+",
    verwachting:
      "Meerdere Builders helpen worden. Schaalbaar gelaagd inkomen op gang brengen.",
    dmoMinimums: {
      contactenPerDag: 7,
      socialPostsPerWeek: 7,
      freebiesPerWeek: 3,
      followUpsPerDag: 5,
    },
  },
};
