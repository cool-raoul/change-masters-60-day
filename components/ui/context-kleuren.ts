// Eén bron van waarheid voor de context-kleuren (visuele wegwijzing).
// Per context: label, icoon en de kleur-classes voor de kopbalk.
//
// Kleur omruilen = hier één regel aanpassen. De banden zijn ingetogen
// jewel-tones (diepe, verfijnde gradients) zodat het luxe blijft, en ze
// werken op zowel de donkere als de lichte kaart-body (die past zich via de
// cm-surface-variabele aan het gekozen thema aan).
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
  /** Kopbalk: achtergrond-gradient + tekstkleur. */
  band: string;
  /** Optioneel gekleurd randje links (voor lichtere accenten). */
  randLinks: string;
};

export const CONTEXT_KLEUREN: Record<ContextId, ContextKleur> = {
  vandaag: {
    label: "Vandaag",
    icoon: "🌱",
    band: "bg-gradient-to-r from-emerald-800 to-emerald-600 text-white",
    randLinks: "border-emerald-500",
  },
  klanten: {
    label: "Klant",
    icoon: "👥",
    band: "bg-gradient-to-r from-sky-800 to-sky-600 text-white",
    randLinks: "border-sky-500",
  },
  leren: {
    label: "Leren",
    icoon: "📚",
    band: "bg-gradient-to-r from-violet-800 to-violet-600 text-white",
    randLinks: "border-violet-500",
  },
  herinneringen: {
    label: "Herinnering",
    icoon: "🔔",
    band: "bg-gradient-to-r from-rose-700 to-rose-500 text-white",
    randLinks: "border-rose-400",
  },
  mentor: {
    label: "Mentor",
    icoon: "🤖",
    band: "bg-gradient-gold text-cm-on-gold",
    randLinks: "border-cm-gold",
  },
};
