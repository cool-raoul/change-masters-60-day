"use client";

import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { ContactLog, Prospect } from "@/lib/supabase/types";

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

export function ContactLogLijst({ contactLogs }: Props) {
  if (contactLogs.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-cm-white text-sm">
          Nog geen aantekeningen toegevoegd.
          <br />
          Gebruik &ldquo;Aantekeningen&rdquo; hierboven om te beginnen.
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
        Aantekeningen ({contactLogs.length})
      </h2>

      <div className="space-y-3">
        {contactLogs.map((log, i) => (
          <div key={log.id} className="relative pl-6">
            {/* Tijdlijn lijn */}
            {i < contactLogs.length - 1 && (
              <div className="absolute left-[9px] top-6 bottom-0 w-px bg-cm-border" />
            )}

            {/* Icoon */}
            <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-cm-surface-2 border border-cm-border flex items-center justify-center text-xs">
              {CONTACT_TYPE_ICONEN[log.contact_type] || "📌"}
            </div>

            <div className="bg-cm-surface-2 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-cm-white text-xs font-semibold capitalize">
                  {log.contact_type}
                </span>
                <span className="text-cm-white text-xs opacity-60">
                  {format(new Date(log.created_at), "d MMM yyyy, HH:mm", {
                    locale: nl,
                  })}
                </span>
              </div>

              {log.notities && (
                <p className="text-cm-white text-xs leading-relaxed">{log.notities}</p>
              )}

              {log.fase_voor && log.fase_na && log.fase_voor !== log.fase_na && (
                <p className="text-cm-gold text-xs mt-1">
                  {log.fase_voor} → {log.fase_na}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
