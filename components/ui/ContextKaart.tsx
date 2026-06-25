import type { ReactNode } from "react";
import { CONTEXT_KLEUREN, type ContextId } from "./context-kleuren";

// Subtiele, gekleurde tegel als visuele wegwijzing per context. Zelfde stijl
// als de bestaande dashboard-tegel: een zachte gekleurde gradient + zachte
// rand + een klein gekleurd icoon-label bovenin. Geen balk, geen felle kleuren.
// De body-tekst is cm-white en past zich aan het thema (dark/light) aan.

export function ContextKaart({
  context,
  titel,
  rechts,
  children,
  className = "",
}: {
  context: ContextId;
  /** Tekst in het kleine label bovenin. Leeg = standaard-label van de context. */
  titel?: string;
  /** Optioneel rechts op de label-regel (bv. dag-nummer of status). */
  rechts?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const k = CONTEXT_KLEUREN[context];
  return (
    <div className={`rounded-xl px-4 py-4 ${k.tegel} ${className}`}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-sm leading-none">{k.icoon}</span>
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${k.accent}`}
        >
          {titel ?? k.label}
        </span>
        {rechts && (
          <span className="ml-auto text-[11px] text-cm-white/50">{rechts}</span>
        )}
      </div>
      {children}
    </div>
  );
}
