"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DagelijkseStat } from "@/lib/supabase/types";
import { toast } from "sonner";

interface Props {
  userId: string;
  bestaandeStats: DagelijkseStat | null;
  datum: string;
}

const statVelden = [
  { key: "contacten_gemaakt", label: "Contacten", icoon: "💬" },
  { key: "uitnodigingen", label: "Uitnodigingen", icoon: "📤" },
  { key: "followups", label: "Follow-ups", icoon: "🔄" },
  { key: "presentaties", label: "Presentaties", icoon: "🎯" },
  { key: "nieuwe_klanten", label: "Nieuwe klanten", icoon: "✅" },
  { key: "nieuwe_partners", label: "Nieuwe partners", icoon: "🤝" },
] as const;

type StatKey = typeof statVelden[number]["key"];

export function DagStatForm({ userId, bestaandeStats, datum }: Props) {
  const [stats, setStats] = useState<Record<StatKey, number>>({
    contacten_gemaakt: bestaandeStats?.contacten_gemaakt || 0,
    uitnodigingen: bestaandeStats?.uitnodigingen || 0,
    followups: bestaandeStats?.followups || 0,
    presentaties: bestaandeStats?.presentaties || 0,
    nieuwe_klanten: bestaandeStats?.nieuwe_klanten || 0,
    nieuwe_partners: bestaandeStats?.nieuwe_partners || 0,
  });
  const [opslaan, setOpslaan] = useState(false);

  const supabase = createClient();

  async function updateStat(key: StatKey, delta: number) {
    const nieuweWaarde = Math.max(0, stats[key] + delta);
    const bijgewerkt = { ...stats, [key]: nieuweWaarde };
    setStats(bijgewerkt);
    setOpslaan(true);

    const { error } = await supabase.from("dagelijkse_stats").upsert(
      {
        user_id: userId,
        stat_datum: datum,
        ...bijgewerkt,
      },
      { onConflict: "user_id,stat_datum" }
    );

    if (error) {
      toast.error("Kon niet opslaan");
    } else {
      setTimeout(() => setOpslaan(false), 1000);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statVelden.map(({ key, label, icoon }) => (
          <div key={key} className="bg-cm-surface-2 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-cm-white">{icoon} {label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateStat(key, -1)}
                className="w-7 h-7 rounded-lg bg-cm-border text-cm-white hover:text-cm-white hover:bg-cm-surface transition-colors text-sm font-bold"
              >
                −
              </button>
              <span className="text-xl font-bold text-cm-white flex-1 text-center">
                {stats[key]}
              </span>
              <button
                onClick={() => updateStat(key, 1)}
                className="w-7 h-7 rounded-lg bg-cm-gold text-cm-black hover:bg-cm-gold-light transition-colors text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      {opslaan && (
        <p className="text-cm-white text-xs mt-2 text-right animate-fade-in">
          Opgeslagen ✓
        </p>
      )}
    </div>
  );
}
