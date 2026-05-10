"use client";

import { useEditModus } from "./EditModeContext";

// ============================================================
// EditModeToggle, schakelaar voor founders om alle ✍️-pencil-knoppen
// op de pagina aan/uit te zetten. Renders alleen iets als
// `isFounder`-prop true is — anders return null zodat members 'm
// nooit zien.
// ============================================================

type Props = {
  isFounder: boolean;
};

export function EditModeToggle({ isFounder }: Props) {
  const { editModusAan, setEditModusAan } = useEditModus();

  if (!isFounder) return null;

  return (
    <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/5 px-4 py-2.5 flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold">
        ✍️ Founder
      </span>
      <span className="text-cm-white text-sm flex-1">
        Edit-modus is{" "}
        <strong className={editModusAan ? "text-cm-gold" : "text-cm-white/60"}>
          {editModusAan ? "AAN" : "UIT"}
        </strong>
      </span>
      <button
        type="button"
        onClick={() => setEditModusAan(!editModusAan)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          editModusAan ? "bg-cm-gold" : "bg-cm-surface-2"
        }`}
        aria-label="Edit-modus aan of uit"
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            editModusAan ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
