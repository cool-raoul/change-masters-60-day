// File: lib/mentor-profiel/types.ts
//
// Mentor-profiel datamodel voor Core V6. Groeit per ankerstap.
// Opgeslagen als één JSONB-blob in mentor_profielen.data.

/** FORM = Family, Occupation, Recreation, Money. Per top-5-contact. */
export type FormContext = {
  contactNaam: string;
  family?: string;
  occupation?: string;
  recreation?: string;
  money?: string;
};

/** Drie verhalen (persoonlijk / product / business). */
export type DrieVerhalen = {
  persoonlijk?: string;
  product?: string;
  business?: string;
};

export type Talent = "schrijver" | "spreker" | "filmer" | "DM-er";

export type DoelType =
  | "euro-per-maand"
  | "nieuwe-shoppers"
  | "nieuwe-webshophouders"
  | "freebie-leads"
  | "opvolg-gesprekken";

export type EersteDoel = {
  type: DoelType;
  waarde: number;
  termijn_dagen: number;
};

/** Het volledige Mentor-profiel, alle velden optioneel (groeit per stap). */
export type MentorProfiel = {
  why?: string;
  situatie?: string;
  /** Korte lopende samenvatting van waar deze persoon staat in hun reis.
      De Mentor werkt 'm bij, zodat hij kan terugblikken ("ik heb je zien
      groeien") zonder alle eerdere gesprekken in te laden. */
  historieNotitie?: string;
  formContexts?: FormContext[];
  eigenProducten?: string[];
  stemVoorbeelden?: string[];
  drieVerhalen?: DrieVerhalen;
  nicheZaadje?: string;
  passies?: string[];
  idealeKlant?: string;
  talent?: Talent;
  eersteDoel?: EersteDoel;
  /** Welke ankerstappen de Mentor heeft afgevinkt + bron-context (K5). */
  curatorVoorstellen?: {
    ankerstapNummer: number;
    voorgesteldOp: string;
    akkoordOp: string | null;
    redenering: string;
  }[];
};
