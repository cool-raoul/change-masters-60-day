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
  /** Zelfgeschreven tekstfragmenten (post, lang appje, mailtje). De
      sterkste stem-bron die er is; alleen ECHT eigen tekst, geen AI. */
  eigenPosts?: string[];
  /** Typische uitdrukkingen uit iemands praattaal ("typisch jij"). */
  praattaal?: string[];
  /** Woorden of soort zinnen die deze persoon nooit zou gebruiken. */
  nooitWoorden?: string[];
  /** Schrijfvoorkeuren: emoji's veel/weinig, korte/lange stukken, spreektaal. */
  schrijfVoorkeuren?: string;
  /** Social-situatie: platforms, kijker of plaatser, volgers, durf-niveau. */
  socialSituatie?: string;
  /** Harde grenzen: wat diegene pertinent niet wil (gezicht op camera,
      kinderen in beeld...). De Mentor bewaakt dit in elk advies. */
  grenzen?: string[];
  /** Ritme: hoeveel tijd per dag + voorkeursmoment. */
  ritme?: string;
  /** Wat over ~90 dagen een feestje waard is, in eigen woorden. */
  eersteFeestje?: string;
  /** Vrij blok: alles wat het lid ZELF belangrijk vindt dat de Mentor
      weet. Alleen door het lid bewerkbaar, de Mentor schrijft hier niet. */
  vrijeContext?: string;
  /** Afgeronde kennismakings-rondes (ronde-nummers, 1-6). */
  kennismakingKlaar?: number[];
  /** Welke ankerstappen de Mentor heeft afgevinkt + bron-context (K5). */
  curatorVoorstellen?: {
    ankerstapNummer: number;
    voorgesteldOp: string;
    akkoordOp: string | null;
    redenering: string;
  }[];
};
