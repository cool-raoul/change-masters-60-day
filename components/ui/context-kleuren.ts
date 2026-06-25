// Eén bron van waarheid voor de context-kleuren (visuele wegwijzing).
//
// Stijl: exact zoals de bestaande dashboard-tegel ("VANDAAG IS DAG 11") —
// een SUBTIELE gekleurde gradient over de tegel + een zachte gekleurde rand +
// een klein gekleurd icoon-label. Geen balk, geen felle kleuren. Per context
// z'n eigen zachte kleur, in dezelfde luxe dark+gold-stijl.
//
// Kleur omruilen = hier één regel. Body-tekst blijft cm-white en past zich aan
// het thema (dark/light) aan; de gradient is themaonafhankelijk en zacht.
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
  /** Subtiele gekleurde gradient + zachte rand (zoals de dashboard-tegel). */
  tegel: string;
  /** Zachte kleur voor het kleine icoon-label bovenin. */
  accent: string;
};

export const CONTEXT_KLEUREN: Record<ContextId, ContextKleur> = {
  vandaag: {
    label: "Vandaag",
    icoon: "🌱",
    tegel:
      "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/40",
    accent: "text-emerald-300",
  },
  klanten: {
    label: "Klant",
    icoon: "👥",
    tegel:
      "bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/40",
    accent: "text-sky-300",
  },
  leren: {
    label: "Leren",
    icoon: "📚",
    tegel:
      "bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/40",
    accent: "text-violet-300",
  },
  herinneringen: {
    label: "Herinnering",
    icoon: "🔔",
    tegel:
      "bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/40",
    accent: "text-rose-300",
  },
  mentor: {
    label: "Mentor",
    icoon: "🤖",
    tegel:
      "bg-gradient-to-br from-cm-gold/20 to-cm-gold/5 border border-cm-gold/40",
    accent: "text-cm-gold",
  },
};
