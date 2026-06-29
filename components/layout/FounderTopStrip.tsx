import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { TesterToolbar } from "@/components/tester/TesterToolbar";

// ============================================================
// FounderTopStrip, dunne balk bovenaan elke AppShell-pagina voor
// founders. Combineert:
//   - TesterToolbar (paarse dag-spring + modus-spring)
//   - EditModeToggle (✏️ bewerk-modus aan/uit, per pagina)
//
// Members zien deze strip nooit. Op /vandaag en /onboarding zit
// een eigen toggle in de eigen layout (geen AppShell), maar bij
// alle AppShell-pagina's (dashboard, instellingen, setup, team, ...)
// is dit dé plek waar founder z'n bewerk-knoppen vindt.
// ============================================================

type Props = {
  isFounder: boolean;
  /** Founder OF tester: mag de dag-spring-toolbar gebruiken (edit blijft founder-only). */
  magSpringen?: boolean;
  huidigeDag: number;
};

export function FounderTopStrip({
  isFounder,
  magSpringen = false,
  huidigeDag,
}: Props) {
  if (!isFounder && !magSpringen) return null;
  return (
    <EditModeProvider>
      <div className="bg-purple-950/30 border-b border-purple-700/30 px-2 sm:px-4 py-1 sm:py-2">
        <div className="max-w-screen-xl mx-auto flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-purple-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            {isFounder ? "👑" : "🧪"}
            <span className="hidden sm:inline ml-1">
              {isFounder ? "Founder" : "Test"}
            </span>
          </span>
          <div className="flex-1 min-w-0">
            <TesterToolbar huidigeDag={huidigeDag} />
          </div>
          <EditModeToggle isFounder={isFounder} />
        </div>
      </div>
    </EditModeProvider>
  );
}
