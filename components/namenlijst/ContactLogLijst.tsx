"use client";

import { useState } from "react";
import { format } from "date-fns";
import { nl, enUS } from "date-fns/locale";
import { ContactLog, Prospect } from "@/lib/supabase/types";
import { useTaal } from "@/lib/i18n/TaalContext";
import { Locale } from "date-fns";

const CONTACT_TYPE_ICONEN: Record<string, string> = {
  dm: "💬",
  bel: "📞",
  presentatie: "🎯",
  followup: "🔄",
  notitie: "📝",
};

interface Props {
  contactLogs: ContactLog[];
  prospect: Prospect;
  userId: string;
}

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS };

function LogItem({ log, index, totaal, v, datumLocale }: { log: ContactLog; index: number; totaal: number; v: (key: string) => string; datumLocale: Locale }) {
  const [uitgevouwen, setUitgevouwen] = useState(false);
  const heeftNotes = !!(log.notities && log.notities.trim().length > 0);
  const isLang = heeftNotes && log.notities!.length > 80;

  return (
    <div className="relative pl-6">
      {/* Tijdlijn lijn */}
      {index < totaal - 1 && (
        <div className="absolute left-[9px] top-6 bottom-0 w-px bg-cm-border" />
      )}

      {/* Icoon */}
      <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-cm-surface-2 border border-white/30 flex items-center justify-center text-xs">
        {CONTACT_TYPE_ICONEN[log.contact_type] || "📌"}
      </div>

      <button
        onClick={() => heeftNotes && setUitgevouwen((v) => !v)}
        className={`w-full text-left bg-cm-surface-2 rounded-xl p-3 transition-colors ${
          heeftNotes ? "hover:border hover:border-cm-gold-dim cursor-pointer" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-cm-white text-xs font-semibold">
            {v(`contactlog.${log.contact_type}`) || log.contact_type}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-cm-white text-xs opacity-60">
              {format(new Date(log.created_at), "d MMM yyyy, HH:mm", { locale: datumLocale })}
            </span>
            {heeftNotes && (
              <span className="text-cm-gold text-xs">{uitgevouwen ? "▲" : "▼"}</span>
            )}
          </div>
        </div>

        {/* Preview (eerste regel altijd zichtbaar) */}
        {heeftNotes && (
          <p className={`text-cm-white text-xs leading-relaxed ${
            !uitgevouwen && isLang ? "line-clamp-2" : ""
          }`}>
            {log.notities}
          </p>
        )}

        {!heeftNotes && (
          <p className="text-cm-white text-xs opacity-40 italic">{v("contactlog.geen_notities")}</p>
        )}

        {log.fase_voor && log.fase_na && log.fase_voor !== log.fase_na && (
          <p className="text-cm-gold text-xs mt-1">
            {log.fase_voor} → {log.fase_na}
          </p>
        )}
      </button>
    </div>
  );
}

export function ContactLogLijst({ contactLogs }: Props) {
  const { v, taal } = useTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;
  if (contactLogs.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-cm-white text-sm">
          {v("contactlog.geen_aantekeningen")}
          <br />
          {v("contactlog.gebruik_hint")}
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
        {v("contactlog.titel")} ({contactLogs.length})
      </h2>

      <div className="space-y-3">
        {contactLogs.map((log, i) => (
          <LogItem key={log.id} log={log} index={i} totaal={contactLogs.length} v={v} datumLocale={datumLocale} />
        ))}
      </div>
    </div>
  );
}
