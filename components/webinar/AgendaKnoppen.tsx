"use client";

import { googleAgendaUrl, outlookAgendaUrl } from "@/lib/webinar/agenda";

// ============================================================
// "Zet 'm in je agenda" — drie knoppen, want mensen gebruiken van
// alles. Het .ics-bestand (Apple en de rest) heeft een herinnering
// van 30 minuten vooraf ingebakken; Google en Outlook gebruiken de
// standaard-herinnering van de agenda zelf, want via een link kun je
// daar geen alarm meegeven.
// ============================================================

type Props = {
  token: string;
  titel: string;
  startIso: string;
  duurMinuten: number;
  kijkUrl: string;
};

export function AgendaKnoppen({
  token,
  titel,
  startIso,
  duurMinuten,
  kijkUrl,
}: Props) {
  const google = googleAgendaUrl({ titel, startIso, duurMinuten, kijkUrl });
  const outlook = outlookAgendaUrl({ titel, startIso, duurMinuten, kijkUrl });
  const ics = `/api/webinar/agenda/${token}.ics`;

  return (
    <div className="space-y-2">
      <p className="text-cm-white/70 text-xs font-semibold uppercase tracking-wider">
        📅 Zet 'm in je agenda
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <a
          href={google}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary py-2.5 text-center text-xs font-semibold"
        >
          Google Agenda
        </a>
        <a
          href={ics}
          className="btn-secondary py-2.5 text-center text-xs font-semibold"
        >
          Apple Agenda
        </a>
        <a
          href={outlook}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary py-2.5 text-center text-xs font-semibold"
        >
          Outlook
        </a>
      </div>
      <p className="text-cm-white/45 text-xs leading-relaxed">
        Gebruik je een andere agenda? Kies dan Apple Agenda, dat bestand
        openen bijna alle agenda-apps. Je krijgt een herinnering een half uur
        van tevoren.
      </p>
    </div>
  );
}
