"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DagelijkseStat } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";
import { format, subDays } from "date-fns";
import { nl, enUS } from "date-fns/locale";
import { Locale } from "date-fns";

interface Props {
  userId: string;
  bestaandeStats: DagelijkseStat | null;
  datum: string;
}

const statVelden = [
  { key: "contacten_gemaakt", labelKey: "stats.contacten", icoon: "💬" },
  { key: "uitnodigingen", labelKey: "stats.uitnodigingen", icoon: "📤" },
  { key: "followups", labelKey: "stats.followups", icoon: "🔄" },
  { key: "presentaties", labelKey: "stats.presentaties", icoon: "🎯" },
  { key: "nieuwe_klanten", labelKey: "stats.nieuwe_klanten", icoon: "✅" },
  { key: "nieuwe_partners", labelKey: "stats.nieuwe_partners", icoon: "🤝" },
] as const;

type StatKey = typeof statVelden[number]["key"];

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS };

function getDagenLijst(vandaag: string): { datum: string; label: string; kort: string }[] {
  const base = new Date(vandaag + "T12:00:00");
  const dagen = [];
  for (let i = 0; i < 8; i++) {
    const d = subDays(base, i);
    const datumStr = format(d, "yyyy-MM-dd");
    dagen.push({
      datum: datumStr,
      label: format(d, "EEE d MMM", { locale: nl }),
      kort: i === 0 ? "Vandaag" : i === 1 ? "Gisteren" : format(d, "EEE d", { locale: nl }),
    });
  }
  return dagen;
}

export function DagStatForm({ userId, bestaandeStats, datum }: Props) {
  const { v, taal } = useTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;

  const dagenLijst = getDagenLijst(datum).map((d, i) => ({
    ...d,
    label: format(new Date(d.datum + "T12:00:00"), "EEE d MMM", { locale: datumLocale }),
    kort: i === 0
      ? v("algemeen.vandaag")
      : i === 1
        ? v("algemeen.gisteren")
        : format(new Date(d.datum + "T12:00:00"), "EEE d", { locale: datumLocale }),
  }));

  const [geselecteerdeDatum, setGeselecteerdeDatum] = useState(datum);
  const [stats, setStats] = useState<Record<StatKey, number>>({
    contacten_gemaakt: bestaandeStats?.contacten_gemaakt || 0,
    uitnodigingen: bestaandeStats?.uitnodigingen || 0,
    followups: bestaandeStats?.followups || 0,
    presentaties: bestaandeStats?.presentaties || 0,
    nieuwe_klanten: bestaandeStats?.nieuwe_klanten || 0,
    nieuwe_partners: bestaandeStats?.nieuwe_partners || 0,
  });
  const [opslaan, setOpslaan] = useState(false);
  const [datumLaden, setDatumLaden] = useState(false);

  const supabase = createClient();

  // Bij datum wissel: stats ophalen voor die dag
  useEffect(() => {
    if (geselecteerdeDatum === datum) {
      // Terug naar vandaag: gebruik de server-side data
      setStats({
        contacten_gemaakt: bestaandeStats?.contacten_gemaakt || 0,
        uitnodigingen: bestaandeStats?.uitnodigingen || 0,
        followups: bestaandeStats?.followups || 0,
        presentaties: bestaandeStats?.presentaties || 0,
        nieuwe_klanten: bestaandeStats?.nieuwe_klanten || 0,
        nieuwe_partners: bestaandeStats?.nieuwe_partners || 0,
      });
      return;
    }

    async function laadStats() {
      setDatumLaden(true);
      const { data } = await supabase
        .from("dagelijkse_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("stat_datum", geselecteerdeDatum)
        .maybeSingle();

      setStats({
        contacten_gemaakt: data?.contacten_gemaakt || 0,
        uitnodigingen: data?.uitnodigingen || 0,
        followups: data?.followups || 0,
        presentaties: data?.presentaties || 0,
        nieuwe_klanten: data?.nieuwe_klanten || 0,
        nieuwe_partners: data?.nieuwe_partners || 0,
      });
      setDatumLaden(false);
    }

    laadStats();
    // bestaandeStats + datum in deps: na router.refresh() (bv. na een
    // voice-save met stats_increment) krijgt dit component nieuwe server-props
    // binnen. Zonder deze deps bleef de local state op de oude waarden staan
    // totdat de gebruiker naar een andere dag en terug switchte.
  }, [geselecteerdeDatum, bestaandeStats, datum]);

  async function updateStat(key: StatKey, delta: number) {
    const nieuweWaarde = Math.max(0, stats[key] + delta);
    const bijgewerkt = { ...stats, [key]: nieuweWaarde };
    setStats(bijgewerkt);
    setOpslaan(true);

    const { error } = await supabase.from("dagelijkse_stats").upsert(
      {
        user_id: userId,
        stat_datum: geselecteerdeDatum,
        ...bijgewerkt,
      },
      { onConflict: "user_id,stat_datum" }
    );

    if (error) {
      toast.error(v("actie.fout"));
    } else {
      setTimeout(() => setOpslaan(false), 1000);
    }
  }

  return (
    <div>
      {/* Datum selector */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {dagenLijst.map((dag) => (
          <button
            key={dag.datum}
            onClick={() => setGeselecteerdeDatum(dag.datum)}
            className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-shrink-0 ${
              geselecteerdeDatum === dag.datum
                ? "bg-cm-gold text-cm-black font-semibold"
                : "bg-cm-surface-2 text-cm-white hover:text-cm-gold border border-cm-border"
            }`}
          >
            {dag.kort}
          </button>
        ))}
      </div>

      {/* Geselecteerde datum label */}
      {geselecteerdeDatum !== datum && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-cm-gold text-xs font-medium">
            📅 {dagenLijst.find(d => d.datum === geselecteerdeDatum)?.label}
          </span>
        </div>
      )}

      {datumLaden ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-200" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statVelden.map(({ key, labelKey, icoon }) => (
            <div key={key} className="bg-cm-surface-2 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cm-white">{icoon} {v(labelKey)}</span>
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
      )}
      {opslaan && (
        <p className="text-cm-white text-xs mt-2 text-right animate-fade-in">
          {v("stats.opgeslagen")} ✓
        </p>
      )}
    </div>
  );
}
