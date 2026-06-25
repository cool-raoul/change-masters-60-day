// Eén bron van waarheid voor de context-kleuren (visuele wegwijzing).
//
// Gekozen stijl (Raoul): D + E. Een DIEPE, donkere zweem kleur in de tegel
// (bijna zwart, een hint van de contextkleur) + een groot, heel vaag
// watermerk-icoon in de hoek. Geen balk, geen felle kleuren; de luxe blijft.
//
// Per context: een gedempt label-kleurtje + de "tint" (de from-... klasse van
// de zachte gradient). Kleur omruilen = hier één regel.
//
// Let op: dit bestand staat bewust in components/ (niet lib/), want Tailwind
// scant alleen ./app en ./components voor class-namen.

export type ContextId =
  | "vandaag"
  | "klanten"
  | "leren"
  | "herinneringen"
  | "mentor";

export type ContextKleur = {
  label: string;
  icoon: string;
  /** Diepe/donkere zweem: de from-... klasse van de gradient (naar transparant). */
  tint: string;
  /** Gedempte kleur voor het kleine icoon-label. */
  accent: string;
};

export const CONTEXT_KLEUREN: Record<ContextId, ContextKleur> = {
  vandaag: {
    label: "Vandaag",
    icoon: "🌱",
    tint: "from-emerald-900/40",
    accent: "text-emerald-300/70",
  },
  klanten: {
    label: "Klant",
    icoon: "👥",
    tint: "from-sky-900/45",
    accent: "text-sky-300/70",
  },
  leren: {
    label: "Leren",
    icoon: "📚",
    tint: "from-violet-900/40",
    accent: "text-violet-300/70",
  },
  herinneringen: {
    label: "Herinnering",
    icoon: "🔔",
    tint: "from-rose-900/40",
    accent: "text-rose-300/70",
  },
  mentor: {
    label: "Mentor",
    icoon: "🤖",
    tint: "from-cm-gold/10",
    accent: "text-cm-gold/80",
  },
};
