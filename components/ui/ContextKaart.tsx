import type { ReactNode } from "react";
import { CONTEXT_KLEUREN, type ContextId } from "./context-kleuren";

// Wegwijzing-tegel, stijl D+E: een diepe, donkere zweem van de contextkleur
// over de kaart + een groot, heel vaag watermerk-icoon in de hoek. Subtiel,
// luxe, themaonafhankelijk (de body gebruikt cm-surface en past zich aan
// dark/light aan; de zweem is een zachte gradient daarbovenop).

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
    <div
      className={`relative overflow-hidden rounded-xl border border-cm-border bg-cm-surface ${className}`}
    >
      {/* Diepe, donkere zweem kleur (concentratie linksboven, fade naar transparant). */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${k.tint} to-transparent`}
      />
      {/* Groot, heel vaag watermerk-icoon in de hoek. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-5 -right-2 select-none text-[90px] leading-none opacity-[0.05]"
      >
        {k.icoon}
      </div>

      <div className="relative p-4">
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
    </div>
  );
}
