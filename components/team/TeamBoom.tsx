"use client";

import { useState } from "react";

interface TeamLid {
  id: string;
  full_name: string;
  email: string;
  onboarding_klaar: boolean;
  created_at: string;
  kinderen: TeamLid[];
}

function TeamLidKaart({ lid, level }: { lid: TeamLid; level: number }) {
  const [open, setOpen] = useState(level < 2); // Eerste 2 levels standaard open
  const heeftKinderen = lid.kinderen.length > 0;
  const totaalOnder = telTotaal(lid.kinderen);

  return (
    <div>
      <div
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          heeftKinderen ? "cursor-pointer hover:bg-cm-surface-2" : ""
        }`}
        onClick={() => heeftKinderen && setOpen(!open)}
      >
        {/* Inklapknop of lege ruimte */}
        <div className="w-5 flex-shrink-0 text-center">
          {heeftKinderen ? (
            <span className={`text-cm-gold text-xs transition-transform inline-block ${open ? "rotate-90" : ""}`}>
              ▶
            </span>
          ) : (
            <span className="text-cm-border text-xs">●</span>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-cm-surface-2 border border-cm-border flex items-center justify-center flex-shrink-0">
          <span className="text-cm-gold text-sm font-semibold">
            {lid.full_name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-cm-white text-sm font-semibold truncate">
            {lid.full_name}
          </p>
          <p className="text-cm-muted text-xs truncate">{lid.email}</p>
        </div>

        {/* Status en team info */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {heeftKinderen && (
            <span className="text-cm-muted text-xs bg-cm-surface-2 px-2 py-0.5 rounded-full">
              {lid.kinderen.length} direct {totaalOnder > lid.kinderen.length && `(${totaalOnder} totaal)`}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            lid.onboarding_klaar
              ? "bg-[#1A2A1A] text-[#4ACB6A]"
              : "bg-[#2A2A1A] text-[#C9A84C]"
          }`}>
            {lid.onboarding_klaar ? "Actief" : "Bezig"}
          </span>
        </div>
      </div>

      {/* Kinderen */}
      {heeftKinderen && open && (
        <div className="ml-6 pl-4 border-l-2 border-cm-border">
          {lid.kinderen.map((kind) => (
            <TeamLidKaart key={kind.id} lid={kind} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function telTotaal(leden: TeamLid[]): number {
  let totaal = leden.length;
  for (const lid of leden) {
    totaal += telTotaal(lid.kinderen);
  }
  return totaal;
}

export function TeamBoom({ leden }: { leden: TeamLid[] }) {
  return (
    <div className="space-y-1">
      {leden.map((lid) => (
        <TeamLidKaart key={lid.id} lid={lid} level={1} />
      ))}
    </div>
  );
}
