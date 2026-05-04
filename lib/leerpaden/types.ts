// ============================================================
// leerpaden/types, gemeenschappelijke type-definities voor de
// stap-voor-stap leerpaden in Core (21 stappen, webshop-strategie)
// en Pro (14 stappen, professional met cliënten).
//
// Sprint heeft een eigen, rijkere structuur in lib/playbook/types.ts.
// Core en Pro gebruiken een eenvoudiger format omdat hun ritme losser
// is (geen sprint-druk, eigen tempo).
// ============================================================

export type LeerpadTaak = {
  id: string;
  label: string;
  /** Optionele uitleg, getoond bij hover of op de stap-detail-pagina. */
  uitleg?: string;
  /** True = moet voltooid worden om naar de volgende stap te kunnen. */
  verplicht?: boolean;
  /** Optioneel: knop naar een interne pagina (bijv. /namenlijst). */
  actieRoute?: string;
};

export type LeerpadStap = {
  nummer: number;
  /** Korte titel (max ~60 tekens) die op de dashboard-tegel verschijnt. */
  titel: string;
  /** Een zin die het doel van deze stap samenvat. */
  doel: string;
  /** Lessen + teaching, langere uitleg op de stap-detail-pagina. */
  watJeLeert: string;
  /** De concrete acties die de gebruiker vandaag doet. */
  vandaagDoen: LeerpadTaak[];
  /** Waar in ELEVA voert de gebruiker dit uit? */
  waarInEleva?: { actie: string; route: string }[];
};

export type Leerpad = {
  /** Identifier, gebruikt voor URL-segmenten en film-slugs. */
  modus: "core" | "pro";
  /** Mens-leesbare naam voor in de UI. */
  naam: string;
  /** Totaal aantal stappen in dit pad. */
  totaal: number;
  /** De stappen, gesorteerd op nummer 1..totaal. */
  stappen: LeerpadStap[];
};
