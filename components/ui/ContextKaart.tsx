import type { ReactNode } from "react";
import { CONTEXT_KLEUREN, type ContextId } from "./context-kleuren";

// Kaart met bovenaan een gekleurde kopbalk + icoon + label, als visuele
// wegwijzing per context. De body gebruikt cm-surface en past zich dus aan
// het gekozen thema (donker/licht) aan; de band houdt z'n diepe context-kleur.
// De zachte gold-glow houdt de luxe ELEVA-uitstraling.

export function ContextKaart({
  context,
  titel,
  rechts,
  children,
  className = "",
}: {
  context: ContextId;
  /** Tekst in de kopbalk. Leeg = het standaard-label van de context. */
  titel?: string;
  /** Optioneel rechts in de balk (bv. dag-nummer of status). */
  rechts?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const k = CONTEXT_KLEUREN[context];
  return (
    <div
      className={`overflow-hidden rounded-xl border border-cm-border bg-cm-surface shadow-gold ${className}`}
    >
      <div className={`flex items-center gap-2 px-4 py-2.5 ${k.band}`}>
        <span className="text-base leading-none">{k.icoon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider">
          {titel ?? k.label}
        </span>
        {rechts && (
          <span className="ml-auto text-xs font-medium opacity-90">{rechts}</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
