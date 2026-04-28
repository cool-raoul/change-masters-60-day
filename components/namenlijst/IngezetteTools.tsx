"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const TOOL_OPTIES = [
  "Productadvies-test",
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
      <div className="border-t border-cm-border p-3 space-y-2">
        {TOOL_OPTIES.map((tool) => {
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
    </details>
  );
}
