"use client";

import { useMemo } from "react";
import { DagelijkseStat } from "@/lib/supabase/types";
import { useTaal } from "@/lib/i18n/TaalContext";
import { format, parseISO, differenceInDays } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { Locale } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };
const RUN_START = new Date("2026-04-12");

interface Props {
  alleStats: DagelijkseStat[];
  pipelineCounts: Record<string, number>;
  dag: number;
}

interface DagData {
  datum: string;
  label: string;
  dag: number;
  contacten: number;
  uitnodigingen: number;
  followups: number;
  presentaties: number;
  klanten: number;
  partners: number;
  totaalActies: number;
}

function berekenKPIs(stats: DagelijkseStat[], dag: number, pipelineCounts: Record<string, number>) {
  const totaalContacten = stats.reduce((s, d) => s + d.contacten_gemaakt, 0);
  const totaalUitnodigingen = stats.reduce((s, d) => s + d.uitnodigingen, 0);
  const totaalFollowups = stats.reduce((s, d) => s + d.followups, 0);
  const totaalPresentaties = stats.reduce((s, d) => s + d.presentaties, 0);
  const totaalKlanten = stats.reduce((s, d) => s + d.nieuwe_klanten, 0);
  const totaalPartners = stats.reduce((s, d) => s + d.nieuwe_partners, 0);

  // Actieve dagen = dagen met minstens 1 actie
  const actieveDagen = stats.filter(
    (d) =>
      d.contacten_gemaakt > 0 ||
      d.uitnodigingen > 0 ||
      d.followups > 0 ||
      d.presentaties > 0 ||
      d.nieuwe_klanten > 0 ||
      d.nieuwe_partners > 0
  ).length;

  // Consistentie score (actieve dagen / totaal verstreken dagen)
  const consistentie = dag > 0 ? Math.round((actieveDagen / dag) * 100) : 0;

  // Gemiddelden
  const gemContactenPerDag = actieveDagen > 0 ? (totaalContacten / actieveDagen) : 0;

  // Conversie ratio's
  const conversieUitnodiging = totaalContacten > 0 ? (totaalUitnodigingen / totaalContacten) * 100 : 0;
  const conversiePresentatie = totaalUitnodigingen > 0 ? (totaalPresentaties / totaalUitnodigingen) * 100 : 0;
  const conversieKlantPartner = totaalPresentaties > 0 ? ((totaalKlanten + totaalPartners) / totaalPresentaties) * 100 : 0;

  // Streaks berekenen
  const gesorteerd = [...stats].sort((a, b) => a.stat_datum.localeCompare(b.stat_datum));
  let huidigeStreak = 0;
  let langsteStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < gesorteerd.length; i++) {
    const s = gesorteerd[i];
    const isActief = s.contacten_gemaakt > 0 || s.uitnodigingen > 0 || s.followups > 0 || s.presentaties > 0;
    if (isActief) {
      // Check of het opeenvolgend is
      if (i === 0) {
        tempStreak = 1;
      } else {
        const vorigeDatum = parseISO(gesorteerd[i - 1].stat_datum);
        const huidigeDatum = parseISO(s.stat_datum);
        const verschil = differenceInDays(huidigeDatum, vorigeDatum);
        if (verschil === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      langsteStreak = Math.max(langsteStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Huidige streak = kijk terug vanaf vandaag
  const vandaag = new Date().toISOString().split("T")[0];
  const statsMap = new Map(stats.map((s) => [s.stat_datum, s]));
  for (let d = dag; d >= 1; d--) {
    const datum = new Date(RUN_START);
    datum.setDate(datum.getDate() + d - 1);
    const datumStr = datum.toISOString().split("T")[0];
    const dagStats = statsMap.get(datumStr);
    if (dagStats && (dagStats.contacten_gemaakt > 0 || dagStats.uitnodigingen > 0 || dagStats.followups > 0 || dagStats.presentaties > 0)) {
      huidigeStreak++;
    } else {
      break;
    }
  }

  // Beste dag
  let besteDag = { datum: "", contacten: 0 };
  for (const s of stats) {
    const totaal = s.contacten_gemaakt + s.uitnodigingen + s.followups + s.presentaties;
    if (totaal > besteDag.contacten) {
      besteDag = { datum: s.stat_datum, contacten: totaal };
    }
  }

  // Prognose (extrapolatie naar dag 60)
  const prognoseContacten = dag > 0 ? Math.round((totaalContacten / dag) * 60) : 0;
  const prognoseUitnodigingen = dag > 0 ? Math.round((totaalUitnodigingen / dag) * 60) : 0;
  const prognoseKlanten = dag > 0 ? Math.round((totaalKlanten / dag) * 60) : 0;
  const prognosePartners = dag > 0 ? Math.round((totaalPartners / dag) * 60) : 0;

  return {
    totaalContacten,
    totaalUitnodigingen,
    totaalFollowups,
    totaalPresentaties,
    totaalKlanten,
    totaalPartners,
    actieveDagen,
    consistentie,
    gemContactenPerDag,
    conversieUitnodiging,
    conversiePresentatie,
    conversieKlantPartner,
    huidigeStreak,
    langsteStreak,
    besteDag,
    prognoseContacten,
    prognoseUitnodigingen,
    prognoseKlanten,
    prognosePartners,
  };
}

export function StatsOverzicht({ alleStats, pipelineCounts, dag }: Props) {
  const { v, taal } = useTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;

  const kpis = useMemo(() => berekenKPIs(alleStats, dag, pipelineCounts), [alleStats, dag, pipelineCounts]);

  // Bereid grafiekdata voor
  const dagData: DagData[] = useMemo(() => {
    const data: DagData[] = [];
    const statsMap = new Map(alleStats.map((s) => [s.stat_datum, s]));

    for (let d = 1; d <= dag; d++) {
      const datum = new Date(RUN_START);
      datum.setDate(datum.getDate() + d - 1);
      const datumStr = datum.toISOString().split("T")[0];
      const s = statsMap.get(datumStr);
      data.push({
        datum: datumStr,
        label: format(datum, "d MMM", { locale: datumLocale }),
        dag: d,
        contacten: s?.contacten_gemaakt || 0,
        uitnodigingen: s?.uitnodigingen || 0,
        followups: s?.followups || 0,
        presentaties: s?.presentaties || 0,
        klanten: s?.nieuwe_klanten || 0,
        partners: s?.nieuwe_partners || 0,
        totaalActies: (s?.contacten_gemaakt || 0) + (s?.uitnodigingen || 0) + (s?.followups || 0) + (s?.presentaties || 0),
      });
    }
    return data;
  }, [alleStats, dag, datumLocale]);

  // Cumulatieve data
  const cumulatiefData = useMemo(() => {
    let cumContacten = 0;
    let cumUitnodigingen = 0;
    let cumKlanten = 0;
    let cumPartners = 0;
    return dagData.map((d) => {
      cumContacten += d.contacten;
      cumUitnodigingen += d.uitnodigingen;
      cumKlanten += d.klanten;
      cumPartners += d.partners;
      return {
        ...d,
        cumContacten,
        cumUitnodigingen,
        cumKlanten,
        cumPartners,
      };
    });
  }, [dagData]);

  // Week data
  const weekData = useMemo(() => {
    const weken: { week: string; contacten: number; uitnodigingen: number; followups: number; presentaties: number }[] = [];
    for (let i = 0; i < dagData.length; i += 7) {
      const weekSlice = dagData.slice(i, i + 7);
      const weekNr = Math.floor(i / 7) + 1;
      weken.push({
        week: `W${weekNr}`,
        contacten: weekSlice.reduce((s, d) => s + d.contacten, 0),
        uitnodigingen: weekSlice.reduce((s, d) => s + d.uitnodigingen, 0),
        followups: weekSlice.reduce((s, d) => s + d.followups, 0),
        presentaties: weekSlice.reduce((s, d) => s + d.presentaties, 0),
      });
    }
    return weken;
  }, [dagData]);

  // Pipeline funnel data
  const funnelData = useMemo(() => [
    { name: "Prospect", value: pipelineCounts["prospect"] || 0, fill: "#CCCCCC" },
    { name: "Uitgenodigd", value: pipelineCounts["uitgenodigd"] || 0, fill: "#4A9EDB" },
    { name: "One Pager", value: pipelineCounts["one_pager"] || 0, fill: "#7A6ADB" },
    { name: "Presentatie", value: pipelineCounts["presentatie"] || 0, fill: "#9A6ADB" },
    { name: "Follow-up", value: pipelineCounts["followup"] || 0, fill: "#C9A84C" },
    { name: "Member", value: pipelineCounts["member"] || 0, fill: "#E8C96B" },
    { name: "Shopper", value: pipelineCounts["shopper"] || 0, fill: "#4ACB6A" },
  ], [pipelineCounts]);

  const maxFunnel = Math.max(...funnelData.map((f) => f.value), 1);

  if (alleStats.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-cm-white font-semibold mb-2">{v("stats.geen_data")}</p>
      </div>
    );
  }

  const customTooltipStyle = {
    backgroundColor: "#1A1A1A",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#fff",
    fontSize: "12px",
  };

  return (
    <div className="space-y-6">
      {/* Totalen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <TotaalKaart label={v("stats.totaal_contacten")} waarde={kpis.totaalContacten} icoon="💬" kleur="text-[#4A9EDB]" />
        <TotaalKaart label={v("stats.totaal_uitnodigingen")} waarde={kpis.totaalUitnodigingen} icoon="📤" kleur="text-[#9A6ADB]" />
        <TotaalKaart label={v("stats.totaal_followups")} waarde={kpis.totaalFollowups} icoon="🔄" kleur="text-cm-gold" />
        <TotaalKaart label={v("stats.totaal_presentaties")} waarde={kpis.totaalPresentaties} icoon="🎯" kleur="text-[#E8C96B]" />
        <TotaalKaart label={v("stats.totaal_klanten")} waarde={kpis.totaalKlanten} icoon="✅" kleur="text-[#4ACB6A]" />
        <TotaalKaart label={v("stats.totaal_partners")} waarde={kpis.totaalPartners} icoon="🤝" kleur="text-[#DB6A4A]" />
      </div>

      {/* KPI's */}
      <div className="card">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-4">
          {v("stats.kpi_titel")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPIKaart
            label={v("stats.gem_contacten_dag")}
            waarde={kpis.gemContactenPerDag.toFixed(1)}
            icoon="📈"
          />
          <KPIKaart
            label={v("stats.conversie_uitnodiging")}
            waarde={`${kpis.conversieUitnodiging.toFixed(0)}%`}
            icoon="🎯"
            sublabel={`${kpis.totaalUitnodigingen}/${kpis.totaalContacten}`}
          />
          <KPIKaart
            label={v("stats.conversie_presentatie")}
            waarde={`${kpis.conversiePresentatie.toFixed(0)}%`}
            icoon="📊"
            sublabel={`${kpis.totaalPresentaties}/${kpis.totaalUitnodigingen}`}
          />
          <KPIKaart
            label={v("stats.conversie_klant_partner")}
            waarde={`${kpis.conversieKlantPartner.toFixed(0)}%`}
            icoon="🏆"
            sublabel={`${kpis.totaalKlanten + kpis.totaalPartners}/${kpis.totaalPresentaties}`}
          />
          <KPIKaart
            label={v("stats.actieve_dagen")}
            waarde={`${kpis.actieveDagen}/${dag}`}
            icoon="📅"
          />
          <KPIKaart
            label={v("stats.consistentie")}
            waarde={`${kpis.consistentie}%`}
            icoon="💪"
            kleur={kpis.consistentie >= 80 ? "text-[#4ACB6A]" : kpis.consistentie >= 50 ? "text-cm-gold" : "text-[#DB6A6A]"}
          />
          <KPIKaart
            label={v("stats.streak")}
            waarde={`${kpis.huidigeStreak}`}
            icoon="🔥"
            sublabel={v("stats.dagen")}
          />
          <KPIKaart
            label={v("stats.langste_streak")}
            waarde={`${kpis.langsteStreak}`}
            icoon="⭐"
            sublabel={v("stats.dagen")}
          />
        </div>
      </div>

      {/* Dagelijkse activiteit grafiek */}
      <div className="card">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-4">
          {v("stats.activiteit_grafiek")}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dagData} barGap={0} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fill: "#999", fontSize: 10 }} interval={Math.max(0, Math.floor(dagData.length / 10))} />
              <YAxis tick={{ fill: "#999", fontSize: 10 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="contacten" name={v("stats.contacten")} fill="#4A9EDB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="uitnodigingen" name={v("stats.uitnodigingen")} fill="#9A6ADB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="followups" name={v("stats.followups")} fill="#C9A84C" radius={[2, 2, 0, 0]} />
              <Bar dataKey="presentaties" name={v("stats.presentaties")} fill="#E8C96B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulatieve groei */}
      <div className="card">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-4">
          {v("stats.cumulatief_grafiek")}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulatiefData}>
              <defs>
                <linearGradient id="gradContacten" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A9EDB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4A9EDB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradUitnodigingen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9A6ADB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9A6ADB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fill: "#999", fontSize: 10 }} interval={Math.max(0, Math.floor(dagData.length / 10))} />
              <YAxis tick={{ fill: "#999", fontSize: 10 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="cumContacten" name={v("stats.totaal_contacten")} stroke="#4A9EDB" fill="url(#gradContacten)" />
              <Area type="monotone" dataKey="cumUitnodigingen" name={v("stats.totaal_uitnodigingen")} stroke="#9A6ADB" fill="url(#gradUitnodigingen)" />
              <Line type="monotone" dataKey="cumKlanten" name={v("stats.totaal_klanten")} stroke="#4ACB6A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cumPartners" name={v("stats.totaal_partners")} stroke="#E8C96B" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekoverzicht */}
      {weekData.length > 1 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-4">
            {v("stats.weekoverzicht")}
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" tick={{ fill: "#999", fontSize: 11 }} />
                <YAxis tick={{ fill: "#999", fontSize: 10 }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="contacten" name={v("stats.contacten")} fill="#4A9EDB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="uitnodigingen" name={v("stats.uitnodigingen")} fill="#9A6ADB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="followups" name={v("stats.followups")} fill="#C9A84C" radius={[3, 3, 0, 0]} />
                <Bar dataKey="presentaties" name={v("stats.presentaties")} fill="#E8C96B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pipeline Funnel */}
      <div className="card">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-4">
          {v("stats.pipeline_funnel")}
        </h2>
        <div className="space-y-2">
          {funnelData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-cm-white text-xs w-24 text-right">{item.name}</span>
              <div className="flex-1 h-8 bg-cm-surface-2 rounded-lg overflow-hidden relative">
                <div
                  className="h-full rounded-lg transition-all duration-700"
                  style={{
                    width: `${Math.max(2, (item.value / maxFunnel) * 100)}%`,
                    backgroundColor: item.fill,
                    opacity: 0.8,
                  }}
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-cm-white text-xs font-bold">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prognose */}
      <div className="card border-gold-subtle">
        <h2 className="text-sm font-semibold text-cm-gold uppercase tracking-wider mb-4">
          {v("stats.prognose")}
        </h2>
        <p className="text-cm-white text-xs mb-4 opacity-60">
          {v("stats.huidig_tempo")} — {v("stats.verwacht_einde")}:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PrognoseKaart label={v("stats.totaal_contacten")} huidig={kpis.totaalContacten} verwacht={kpis.prognoseContacten} />
          <PrognoseKaart label={v("stats.totaal_uitnodigingen")} huidig={kpis.totaalUitnodigingen} verwacht={kpis.prognoseUitnodigingen} />
          <PrognoseKaart label={v("stats.totaal_klanten")} huidig={kpis.totaalKlanten} verwacht={kpis.prognoseKlanten} />
          <PrognoseKaart label={v("stats.totaal_partners")} huidig={kpis.totaalPartners} verwacht={kpis.prognosePartners} />
        </div>
      </div>

      {/* Beste dag */}
      {kpis.besteDag.datum && (
        <div className="card bg-gold-subtle border-gold-subtle text-center py-6">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-cm-gold text-xs uppercase tracking-wider mb-1">{v("stats.beste_dag")}</p>
          <p className="text-cm-white text-lg font-bold">
            {format(parseISO(kpis.besteDag.datum), "d MMMM yyyy", { locale: datumLocale })}
          </p>
          <p className="text-cm-gold text-sm">{kpis.besteDag.contacten} {v("stats.contacten").toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}

// Sub-componenten

function TotaalKaart({ label, waarde, icoon, kleur }: { label: string; waarde: number; icoon: string; kleur: string }) {
  return (
    <div className="card text-center py-3">
      <div className="text-lg mb-1">{icoon}</div>
      <div className={`text-2xl font-bold ${kleur}`}>{waarde}</div>
      <div className="text-xs text-cm-white mt-1 opacity-60">{label}</div>
    </div>
  );
}

function KPIKaart({ label, waarde, icoon, sublabel, kleur }: { label: string; waarde: string; icoon: string; sublabel?: string; kleur?: string }) {
  return (
    <div className="bg-cm-surface-2 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icoon}</span>
        <span className="text-xs text-cm-white opacity-60">{label}</span>
      </div>
      <div className={`text-xl font-bold ${kleur || "text-cm-white"}`}>{waarde}</div>
      {sublabel && <div className="text-xs text-cm-white opacity-40 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function PrognoseKaart({ label, huidig, verwacht }: { label: string; huidig: number; verwacht: number }) {
  return (
    <div className="bg-cm-surface-2 rounded-xl p-3 text-center">
      <div className="text-xs text-cm-white opacity-60 mb-1">{label}</div>
      <div className="text-cm-white text-lg font-bold">{huidig}</div>
      <div className="text-cm-gold text-xs mt-1">→ {verwacht}</div>
    </div>
  );
}
