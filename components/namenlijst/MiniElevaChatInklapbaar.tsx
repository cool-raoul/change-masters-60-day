"use client";

import { useEffect, useState } from "react";
import { MensChatVenster } from "@/components/mini-eleva/MensChatVenster";

// ============================================================
// MiniElevaChatInklapbaar, voor de member-kant op de prospect-detail-
// pagina. Toont alle actieve mini-ELEVA-uitnodigingen voor deze
// prospect met een chat-venster per uitnodiging (inklapbaar).
//
// Chats zijn de mens-tot-mens-laag (drie-persoon: prospect, member,
// sponsor). NIET de AI-mentor — die heeft eigen scope/regels en
// blijft privé voor de prospect (AVG-Keuze A).
// ============================================================

type Uitnodiging = {
  id: string;
  prospectVoornaam: string;
  status: string;
  expires_at: string;
  isVerlopen: boolean;
  sponsorVoornaam: string | null;
  ongelezenAantal: number;
};

type Props = {
  prospectId: string;
  prospectVoornaam: string;
};

export function MiniElevaChatInklapbaar({
  prospectId,
  prospectVoornaam,
}: Props) {
  const [uitnodigingen, setUitnodigingen] = useState<Uitnodiging[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let levend = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/mini-eleva/lijst-voor-prospect?prospectId=${prospectId}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!levend) return;
        setUitnodigingen(data.items ?? []);
      } catch {
        // negeer
      } finally {
        if (levend) setLaden(false);
      }
    })();
    return () => {
      levend = false;
    };
  }, [prospectId]);

  if (laden) {
    return (
      <div className="card border-l-4 border-cm-gold/30">
        <p className="text-cm-white/50 text-xs">Laden...</p>
      </div>
    );
  }

  if (uitnodigingen.length === 0) return null;

  return (
    <div className="card border-l-4 border-cm-gold/30 space-y-3">
      <div>
        <h3 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
          💬 Chat met {prospectVoornaam}
        </h3>
        <p className="text-cm-white/60 text-xs leading-relaxed mt-1">
          Reageer hier op {prospectVoornaam}'s berichten in mini-ELEVA. Tekst
          en spraak werken allebei. {prospectVoornaam} krijgt elke reactie als
          push-melding op haar telefoon.
        </p>
      </div>

      {uitnodigingen.map((u) => {
        const isOpen = open === u.id;
        return (
          <div
            key={u.id}
            className="bg-cm-surface-2 rounded-lg border border-cm-white/10"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : u.id)}
              className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-cm-surface text-left"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                    u.isVerlopen
                      ? "bg-cm-white/10 text-cm-white/50"
                      : "bg-cm-gold/20 text-cm-gold"
                  }`}
                >
                  {u.isVerlopen ? "verlopen" : "actief"}
                </span>
                <span className="text-cm-white text-sm">
                  {isOpen ? "Sluit chat" : "Open chat"}
                </span>
                {u.ongelezenAantal > 0 && (
                  <span className="bg-cm-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {u.ongelezenAantal} nieuw
                  </span>
                )}
              </div>
              <span className="text-cm-gold text-sm">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div className="border-t border-cm-white/10 p-3">
                <MensChatVenster
                  invitationId={u.id}
                  rolLabels={{
                    prospect: prospectVoornaam,
                    member: "Jij",
                    sponsor: u.sponsorVoornaam ?? "Sponsor",
                  }}
                  uitlegregel={`Berichten worden direct als push-melding aan ${prospectVoornaam} en de sponsor gestuurd.`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
