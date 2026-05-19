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
  huidigeDag: number;
};

export function FounderTopStrip({ isFounder, huidigeDag }: Props) {
  if (!isFounder) return null;
  return (
    <EditModeProvider>
      <div className="bg-purple-950/30 border-b border-purple-700/30 px-4 py-2">
        <div className="max-w-screen-xl mx-auto flex items-center gap-3 flex-wrap">
          <span className="text-purple-300 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            👑 Founder
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
