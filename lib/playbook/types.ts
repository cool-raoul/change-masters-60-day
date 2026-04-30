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
  /**
   * Optioneel: route waarheen klikken op de taak de gebruiker brengt.
   * Bijv. "/mijn-why", "/namenlijst", "/coach". Als gevuld: rij wordt
   * klikbaar in de tile-UI én in de preview.
   */
  actieRoute?: string;
  /**
   * Optioneel: slug naar de films-CMS. Als gezet, rendert de tile-UI
   * een uitklapbare film-embed onder de taak — zodat admin-stappen
   * (webshop, kredietformulier, teams-admin, bestellinks) een
   * uitleg-video kunnen tonen die de founder via /instellingen/films
   * heeft toegevoegd.
   */
  filmSlug?: string;
  /**
   * Als true: deze taak vereist een telefoon om uit te voeren (bijv.
   * telefoon-contacten exporteren). De vandaag-flow toont op desktop
   * een vriendelijke "Open op je telefoon"-waarschuwing met sla-over-knop.
   */
  vereistMobiel?: boolean;
  /**
   * Optie B — INLINE ACTIE: schrijf/voer iets direct in de tile in
   * (geen routenavigatie nodig). De waarde wordt opgeslagen onder een
   * stabiele slug in de `eigen_zinnen`-tabel zodat de member 'm later
   * altijd kan terugvinden via /mijn-zinnen of opnieuw deze dag bezoekt.
   *
   * Bewaren = automatisch deze taak afvinken.
   */
  inlineActie?: {
    /** Type input-veld. Voor nu: tekst. Later: 'lijst' voor namenlijsten etc. */
    type: "tekst";
    /**
     * Stabiele slug waaronder de waarde wordt opgeslagen — wordt ook gebruikt
     * als sleutel in /mijn-zinnen. Bijv. "edification-zin", "30-sec-pitch".
     * NIET hernoemen — de waardes zijn eraan gekoppeld.
     */
    slug: string;
    /** Korte titel zoals getoond op /mijn-zinnen. Bijv. "Mijn edification-zin". */
    label: string;
    /** Uitleg/briefing direct boven het invoerveld. */
    instructie?: string;
    /** Placeholder in het lege veld. */
    placeholder?: string;
    /** Limiet voor lengte (default 500). Boven max kan niet bewaard worden. */
    maxTekens?: number;
    /**
     * Optioneel voorbeeld — wordt onder het veld getoond als hint.
     * Houd dit kort (1-2 zinnen) zodat het niet als kant-en-klare
     * copy-paste fungeert.
     */
    voorbeeld?: string;
  };
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
  /**
   * Optioneel: tekst die alvast in het invoerveld op de bestemming-pagina
   * (bv. ELEVA Mentor) wordt geplakt zodra de member op "Ga →" klikt.
   *
   * Mag een `{slug}`-placeholder bevatten — die wordt vervangen door de
   * waarde uit `eigen_zinnen` voor diezelfde slug. Voorbeeld:
   *   "Check mijn edification-zin: {edification-zin}"
   *
   * Als de slug nog niet ingevuld is, wordt de placeholder vervangen
   * door "[hier je zin]" zodat het invoerveld wel werkbaar is.
   */
  prefillTemplate?: string;
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
  /** Bijv. "Maandag · plannen". */
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
