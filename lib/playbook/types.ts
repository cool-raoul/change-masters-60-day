// ============================================================
// PLAYBOOK — types voor dag-tiles, fasen en weekritme
// De 60-dagenrun heeft:
//  • 3 fasen (fundament / momentum / ritme)
//  • Dag 1-21: individueel uitgewerkt (actie + teaching + waar-in-ELEVA)
//  • Dag 22-60: per weekdag een vast ritme (doorloopt 5-6 weken)
// Elke dag scheidt CONTROLLABLE (zelf doen, checkbox) van
// FASE-DOEL (niet afvinkbaar, schuift door als het niet lukt).
// ============================================================

/**
 * Eén afvinkbare taak voor de member op een specifieke dag.
 * Wordt gepersist in `dag_voltooiingen` table (member → dag → taak).
 * Bij completion triggert de sponsor-notificatie-flow.
 */
export type ControllableTaak = {
  /** Stabiele id voor DB-persistentie. Nooit hernoemen. */
  id: string;
  /** Korte actie-tekst (max ~80 tekens). */
  label: string;
  /** Langere uitleg — alleen zichtbaar in accordion-uitklap. */
  uitleg?: string;
  /** Als true: telt mee voor "dag voltooid"-status. Optionele taken niet. */
  verplicht: boolean;
};

/**
 * Waar in ELEVA vind je deze stap? Eén item per feature-entry.
 */
export type ElevaPad = {
  /** Wat je doet. Bijv. "WHY invullen", "Namenlijst importeren". */
  actie: string;
  /** Menu-pad. Bijv. "Menu → Mijn WHY → Start gesprek". */
  menupad?: string;
  /** Spraak-commando dat hetzelfde doet. Bijv. "Nieuwe prospect Jan uit voetbalclub". */
  spraak?: string;
  /** Naar welke route de member doorverwezen kan worden (voor "open direct"-knop). */
  route?: string;
};

/**
 * Volledige content voor één dag in de 60-dagenrun (dag 1-21).
 */
export type Dag = {
  /** 1 t/m 21. */
  nummer: number;
  /** Korte titel, wordt bovenaan de tile getoond. */
  titel: string;
  /** Welke fase deze dag in valt. */
  fase: 1 | 2 | 3;
  /** Checkbox-rij. Wat doet de member vandaag? */
  vandaagDoen: ControllableTaak[];
  /** Herinnering aan het fase-doel. Niet afvinkbaar. Schuift door als niet gelukt. */
  faseDoel: string;
  /** Waar in ELEVA vind je wat je vandaag nodig hebt? */
  waarInEleva: ElevaPad[];
  /**
   * Teaching-moment. Wat leer je vandaag over het vak?
   * Bijv. NIVEA-regel, Feel-Felt-Found, 3-weg-principe.
   * Max ~3 alinea's.
   */
  watJeLeert: string;
  /**
   * Quote of principe van de dag. Bron erbij (Worre / Brookes / Les Brown / eigen).
   * Houdt de dag emotioneel + filosofisch verankerd.
   */
  waaromWerktDit: {
    tekst: string;
    bron?: string;
  };
};

/**
 * Eén van de drie fasen (1-7 / 8-14 / 15-21).
 * Dag 22-60 valt onder "fase 3 uitgebreid" via weekritme.
 */
export type Fase = {
  nummer: 1 | 2 | 3;
  titel: string;
  /** [startdag, einddag] inclusief. */
  dagen: [number, number];
  /** Korte fase-omschrijving — staat bovenaan fase-overzicht. */
  samenvatting: string;
  /** Controllable-lat voor deze fase. Wat moet je ritme zijn? */
  controllableLat: string[];
  /** Het niet-controleerbare doel waar we op focussen. */
  doel: string;
  /** Wat leer je in deze fase als vakman? */
  kernprincipe: string;
};

/**
 * Eén weekdag in het dag 22-60 ritme.
 * Elke weekdag heeft een vaste focus (maandag planning, dinsdag invites, etc.).
 */
export type Weekdag = {
  /** 0 = zondag, 1 = maandag, ... 6 = zaterdag. */
  dagVanDeWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Bijv. "Maandag — Plannen". */
  titel: string;
  /** Hoofdfocus in één zin. */
  focus: string;
  /** Controllable-rij voor die dag. */
  vandaagDoen: ControllableTaak[];
  /** Waar-in-ELEVA-lijst. */
  waarInEleva: ElevaPad[];
  /** Korte teaching. */
  teaching: string;
};

/**
 * Status van een specifieke dag voor een specifieke member.
 * Opgeslagen in `dag_voltooiingen` table.
 */
export type DagVoltooiing = {
  userId: string;
  /** 1-60 voor run-dagen, of negatief voor pre-run. */
  dagNummer: number;
  /** Welke taken afgevinkt? Array van `ControllableTaak.id`. */
  afgevinkteTaken: string[];
  /** True als alle `verplicht: true`-taken afgevinkt zijn. Triggert sponsor-notificatie. */
  voltooid: boolean;
  /** Tijdstip waarop dag voltooid werd (eerste keer). */
  voltooidOp?: string;
};
