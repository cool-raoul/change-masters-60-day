"use client";

import { useState } from "react";
import { useTaal } from "@/lib/i18n/TaalContext";

interface OnboardingVoortgang {
  stap_1_welkom: boolean;
  stap_2_run: boolean;
  stap_3_namen: boolean;
  stap_4_script: boolean;
  stap_5_doelen: boolean;
}

interface TeamLid {
  id: string;
  full_name: string;
  email: string;
  onboarding_klaar: boolean;
  created_at: string;
  run_startdatum: string | null;
  kinderen: TeamLid[];
  onboarding?: OnboardingVoortgang | null;
}

const STAPPEN = [
  { key: "stap_1_welkom", label: "App geïnstalleerd", icoon: "📱" },
  { key: "stap_2_run",    label: "WHY gemaakt",         icoon: "💛" },
  { key: "stap_3_namen",  label: "Namenlijst",           icoon: "📝" },
  { key: "stap_4_script", label: "Script gelezen",       icoon: "💬" },
  { key: "stap_5_doelen", label: "Doelen ingesteld",     icoon: "🎯" },
];

function LidDetailModal({ lid, level, onSluit }: { lid: TeamLid; level: number; onSluit: () => void }) {
  const totaalOnder = telTotaal(lid.kinderen);
  const joinDatum = new Date(lid.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const voortgang = lid.onboarding;
  const aantalKlaar = STAPPEN.filter((s) => voortgang?.[s.key as keyof OnboardingVoortgang]).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onSluit}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-sm bg-cm-surface border border-cm-border rounded-t-2xl sm:rounded-2xl p-5 space-y-4 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sluitknop */}
        <button
          onClick={onSluit}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cm-surface-2 text-cm-white opacity-60 hover:opacity-100 flex items-center justify-center text-sm"
        >
          ✕
        </button>

        {/* Avatar + naam */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cm-gold/20 border-2 border-cm-gold/40 flex items-center justify-center flex-shrink-0">
            <span className="text-cm-gold text-2xl font-bold">
              {lid.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-cm-white font-bold text-lg leading-tight">{lid.full_name}</p>
            <p className="text-cm-white opacity-50 text-sm mt-0.5 break-all">{lid.email}</p>
          </div>
        </div>

        {/* Basisgegevens */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-cm-surface-2 rounded-xl p-3 text-center">
            <p className="text-cm-gold text-xl font-bold">{lid.kinderen.length}</p>
            <p className="text-cm-white text-xs opacity-60 mt-0.5">Direct team</p>
          </div>
          <div className="bg-cm-surface-2 rounded-xl p-3 text-center">
            <p className="text-cm-white text-xl font-bold">{totaalOnder}</p>
            <p className="text-cm-white text-xs opacity-60 mt-0.5">Totaal team</p>
          </div>
          <div className="bg-cm-surface-2 rounded-xl p-3 text-center col-span-1">
            <p className="text-cm-white text-sm font-semibold">Level {level}</p>
            <p className="text-cm-white text-xs opacity-60 mt-0.5">In jouw structuur</p>
          </div>
          <div className="bg-cm-surface-2 rounded-xl p-3 text-center col-span-1">
            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
              lid.onboarding_klaar
                ? "text-[#4ACB6A]"
                : "text-[#C9A84C]"
            }`}>
              {lid.onboarding_klaar ? "✓ Actief" : "⏳ Bezig"}
            </span>
            <p className="text-cm-white text-xs opacity-60 mt-1">Onboarding</p>
          </div>
        </div>

        {/* Onboarding stappen */}
        <div>
          <p className="text-cm-white text-xs opacity-50 uppercase tracking-wider mb-2">
            Onboarding — {aantalKlaar}/{STAPPEN.length} stappen
          </p>
          <div className="space-y-1.5">
            {STAPPEN.map((s) => {
              const gedaan = voortgang?.[s.key as keyof OnboardingVoortgang];
              return (
                <div key={s.key} className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                  gedaan ? "bg-cm-gold/10 text-cm-gold" : "bg-cm-surface-2 text-cm-white opacity-40"
                }`}>
                  <span>{s.icoon}</span>
                  <span className="flex-1">{s.label}</span>
                  {gedaan ? <span className="text-xs">✅</span> : <span className="text-xs opacity-40">○</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lid geworden */}
        <p className="text-cm-white text-xs opacity-40 text-center">
          Lid geworden op {joinDatum}
        </p>
      </div>
    </div>
  );
}

function TeamLidKaart({ lid, level }: { lid: TeamLid; level: number }) {
  const [open, setOpen] = useState(level < 2);
  const [modalOpen, setModalOpen] = useState(false);
  const { v } = useTaal();
  const heeftKinderen = lid.kinderen.length > 0;
  const totaalOnder = telTotaal(lid.kinderen);

  return (
    <div>
      <div className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-cm-surface-2/50 transition-colors">

        {/* Expand/collapse knop — alleen de pijl */}
        <button
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center"
          onClick={() => heeftKinderen && setOpen(!open)}
          aria-label={open ? "Inklappen" : "Uitklappen"}
        >
          {heeftKinderen ? (
            <span className={`text-cm-gold text-xs transition-transform inline-block ${open ? "rotate-90" : ""}`}>
              ▶
            </span>
          ) : (
            <span className="text-cm-border text-xs">●</span>
          )}
        </button>

        {/* Klikbaar deel → opent modal */}
        <button
          className="flex-1 flex items-center gap-2.5 min-w-0 text-left"
          onClick={() => setModalOpen(true)}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-cm-surface-2 border border-cm-border flex items-center justify-center flex-shrink-0">
            <span className="text-cm-gold text-sm font-semibold">
              {lid.full_name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Naam + email */}
          <div className="flex-1 min-w-0">
            <p className="text-cm-white text-sm font-semibold truncate">
              {lid.full_name}
            </p>
            <p className="text-cm-white text-xs opacity-40 truncate">{lid.email}</p>
          </div>

          {/* Rechts: team badge + status */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {heeftKinderen && (
              <span className="text-cm-white text-xs bg-cm-surface-2 px-1.5 py-0.5 rounded-full">
                {totaalOnder}
              </span>
            )}
            <span className={`text-xs w-2 h-2 rounded-full flex-shrink-0 ${
              lid.onboarding_klaar ? "bg-[#4ACB6A]" : "bg-[#C9A84C]"
            }`} />
          </div>
        </button>
      </div>

      {/* Detail modal */}
      {modalOpen && (
        <LidDetailModal
          lid={lid}
          level={level}
          onSluit={() => setModalOpen(false)}
        />
      )}

      {/* Kinderen */}
      {heeftKinderen && open && (
        <div className="ml-5 pl-3 border-l border-cm-border/40">
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
    <div className="space-y-0.5">
      {leden.map((lid) => (
        <TeamLidKaart key={lid.id} lid={lid} level={1} />
      ))}
    </div>
  );
}
