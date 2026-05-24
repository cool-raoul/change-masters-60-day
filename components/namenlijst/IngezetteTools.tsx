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
function isFreebieTag(tool: string): boolean {
  return (
    tool.startsWith("Freebie:") ||
    tool === "Vragenlijst ingevuld" ||
    tool === "Tweede Lente bot" // backwards compat
  );
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

  // Freebie-items uit de huidige selectie (automatisch toegevoegd).
  const freebieItems = selectie.filter(isFreebieTag);

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
        {/* Freebies binnengekomen, automatisch gezet door bot/freebie-flow */}
        {freebieItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-rose-400 text-xs">🌷</span>
              <p className="text-[11px] uppercase tracking-wider text-rose-300 font-semibold">
                Freebies binnengekomen
              </p>
            </div>
            <div className="space-y-1.5">
              {freebieItems.map((tool) => (
                <label
                  key={tool}
                  className="flex items-center gap-2 text-sm cursor-pointer select-none rounded px-2 py-1.5 bg-rose-500/10 text-rose-200"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() => toggle(tool)}
                    disabled={bezig}
                    className="accent-rose-500 w-4 h-4"
                  />
                  {tool}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Standaard tools, handmatig aan/uit */}
        <div>
          {freebieItems.length > 0 && (
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
