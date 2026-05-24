"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STANDAARD_TOOLS = [
  "Productadvies-vragenlijst",
  "One pager",
  "Presentatie",
  "Info link met uitleg",
  "Darmvragenlijst",
  "Zoom / Webinar",
  "3-way call upline",
  "Logisch Leven FB",
  "Video Lifeplus 2 min",
  "Docu 'Van mens tot mens'",
];

// Detecteer items die automatisch via een freebie-flow zijn toegevoegd
// (Freebie-bot tag, vragenlijst-status). Die tonen we apart bovenaan
// als 'Freebies binnengekomen' zodat de member ziet dat de prospect
// daadwerkelijk wat heeft ingevuld, niet alleen een handmatig vinkje.
//
// Sinds 2026-05-25: deze tags zijn READ-ONLY (vergrendeld). Member
// kan ze niet wegvinken, want eenmaal ingezet IS ingezet. Het zou
// raar zijn als de pijplijn-badge verdwijnt na een per-ongeluk klik.
function isFreebieTag(tool: string): boolean {
  return (
    tool.startsWith("Freebie:") ||
    tool === "Vragenlijst ingevuld" ||
    tool === "Tweede Lente bot" // backwards compat
  );
}

// Bouw één samenvattende regel per gevonden freebie:
//   "Freebie: Tweede Lente" + "Vragenlijst ingevuld" → 1 regel met status
// Backwards compat: oude tag 'Tweede Lente bot' wordt ook als compleet
// geteld (was vroeger alleen na voltooien gezet).
type FreebieSamenvatting = {
  naam: string;
  ingevuld: boolean;
};

function combineerFreebieTags(tools: string[]): FreebieSamenvatting[] {
  const namen = new Set<string>();
  for (const t of tools) {
    if (t.startsWith("Freebie:")) {
      namen.add(t.replace(/^Freebie:\s*/, "").trim());
    } else if (t === "Tweede Lente bot") {
      namen.add("Tweede Lente"); // backwards compat
    }
  }
  const ingevuldAlgemeen =
    tools.includes("Vragenlijst ingevuld") ||
    tools.includes("Tweede Lente bot");
  return Array.from(namen).map((naam) => ({
    naam,
    ingevuld: ingevuldAlgemeen,
  }));
}

interface Props {
  prospectId: string;
  ingezet: string[];
}

export function IngezetteTools({ prospectId, ingezet }: Props) {
  const [open, setOpen] = useState(false);
  const [selectie, setSelectie] = useState<string[]>(ingezet || []);
  const [bezig, setBezig] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function toggle(tool: string) {
    const nieuw = selectie.includes(tool)
      ? selectie.filter((t) => t !== tool)
      : [...selectie, tool];
    setSelectie(nieuw);
    setBezig(true);
    const { error } = await supabase
      .from("prospects")
      .update({
        ingezette_tools: nieuw,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prospectId);
    setBezig(false);
    if (error) {
      toast.error("Opslaan mislukt");
      setSelectie(ingezet || []);
    } else {
      router.refresh();
    }
  }

  const aantal = selectie.length;

  // Freebie-items uit de huidige selectie, samengevoegd tot één regel per
  // freebie (de losse tags 'Freebie: X' + 'Vragenlijst ingevuld' worden
  // gecombineerd tot bv. 'Tweede Lente — ingevuld').
  const freebieSamenvattingen = combineerFreebieTags(selectie);

  // Overige items uit selectie die niet in standaard-lijst staan
  // (extra handmatige tools die ooit toegevoegd zijn).
  const extraTools = selectie.filter(
    (t) => !STANDAARD_TOOLS.includes(t) && !isFreebieTag(t),
  );

  return (
    <details
      className="border border-cm-border rounded-lg bg-cm-surface-2"
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-cm-gold">🛠️</span>
          <div>
            <p className="text-sm font-semibold text-cm-white">Ingezette tools</p>
            <p className="text-[11px] text-cm-white opacity-60">
              {aantal === 0
                ? "Vink aan wat je hebt gebruikt"
                : `${aantal} ingezet`}
            </p>
          </div>
        </div>
        <span
          className={`text-cm-gold text-xs transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </summary>
      <div className="border-t border-cm-border p-3 space-y-3">
        {/* Freebies binnengekomen: read-only, één regel per freebie met
            ingevuld/wacht-status. Niet wegvinkbaar, want eenmaal ingezet
            blijft ingezet. */}
        {freebieSamenvattingen.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-rose-400 text-xs">🌷</span>
              <p className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold">
                Freebies ingezet
              </p>
            </div>
            <div className="space-y-1.5">
              {freebieSamenvattingen.map((f) => (
                <div
                  key={f.naam}
                  className="flex items-center gap-2 text-sm rounded px-2 py-1.5 bg-rose-500/10 text-rose-200"
                  title="Automatisch geregistreerd, niet wegvinkbaar"
                >
                  <span className="w-4 h-4 flex items-center justify-center text-rose-300">
                    🔒
                  </span>
                  <span className="flex-1">
                    {f.naam}
                  </span>
                  {f.ingevuld ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600/80 text-white font-semibold">
                      ✓ ingevuld
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/80 text-white font-semibold">
                      ⏳ wacht
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standaard tools, handmatig aan/uit */}
        <div>
          {freebieSamenvattingen.length > 0 && (
            <p className="text-[11px] uppercase tracking-wider text-cm-white opacity-60 font-semibold mb-1.5">
              Handmatig
            </p>
          )}
          <div className="space-y-1.5">
            {STANDAARD_TOOLS.map((tool) => {
              const actief = selectie.includes(tool);
              return (
                <label
                  key={tool}
                  className={`flex items-center gap-2 text-sm cursor-pointer select-none rounded px-2 py-1.5 transition-colors ${
                    actief
                      ? "bg-cm-gold/10 text-cm-gold"
                      : "text-cm-white hover:bg-cm-surface"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={actief}
                    onChange={() => toggle(tool)}
                    disabled={bezig}
                    className="accent-cm-gold w-4 h-4"
                  />
                  {tool}
                </label>
              );
            })}
          </div>
        </div>

        {/* Extra (legacy / aangepaste) tools onderaan */}
        {extraTools.length > 0 && (
          <div className="pt-2 border-t border-cm-border">
            <p className="text-[11px] uppercase tracking-wider text-cm-white opacity-60 font-semibold mb-1.5">
              Eerder aangevinkt
            </p>
            <div className="space-y-1.5">
              {extraTools.map((tool) => (
                <label
                  key={tool}
                  className="flex items-center gap-2 text-sm cursor-pointer select-none rounded px-2 py-1.5 bg-cm-gold/10 text-cm-gold"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggle(tool)}
                    disabled={bezig}
                    className="accent-cm-gold w-4 h-4"
                  />
                  {tool}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
