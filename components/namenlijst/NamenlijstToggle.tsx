"use client";

import { useState } from "react";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";
import { Prospect, PIPELINE_FASEN } from "@/lib/supabase/types";
import { PipelineKanban } from "@/components/namenlijst/PipelineKanban";

interface Props {
  prospects: Prospect[];
}

export function NamenlijstToggle({ prospects }: Props) {
  const [weergave, setWeergave] = useState<"pipeline" | "lijst">("pipeline");
  const { v } = useTaal();

  const gesorteerd = [...prospects].sort((a, b) =>
    a.volledige_naam.localeCompare(b.volledige_naam, "nl")
  );

  return (
    <div className="space-y-4">
      {/* Toggle knoppen + Nieuw toevoegen */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setWeergave("pipeline")}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
            weergave === "pipeline"
              ? "bg-cm-gold text-cm-black font-semibold"
              : "border border-cm-border text-cm-white hover:border-cm-gold-dim"
          }`}
        >
          📋 Pipeline
        </button>
        <button
          onClick={() => setWeergave("lijst")}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
            weergave === "lijst"
              ? "bg-cm-gold text-cm-black font-semibold"
              : "border border-cm-border text-cm-white hover:border-cm-gold-dim"
          }`}
        >
          📝 Lijst
        </button>
        <div className="flex-1" />
        <Link href="/namenlijst/nieuw" className="btn-gold text-sm">
          + {v("namenlijst.nieuw")}
        </Link>
      </div>

      {/* Pipeline weergave */}
      {weergave === "pipeline" && <PipelineKanban prospects={prospects} />}

      {/* Lijst weergave */}
      {weergave === "lijst" && (
        <div className="space-y-2">
          {gesorteerd.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-cm-white">{v("namenlijst.geen_contacten")}</p>
            </div>
          ) : (
            gesorteerd.map((prospect) => {
              const faseInfo = PIPELINE_FASEN.find(
                (f) => f.fase === prospect.pipeline_fase
              );
              return (
                <Link
                  key={prospect.id}
                  href={`/namenlijst/${prospect.id}`}
                  className="card flex items-center justify-between hover:border-cm-gold-dim transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👤</span>
                    <div>
                      <p className="text-cm-white font-semibold text-sm group-hover:text-cm-gold transition-colors">
                        {prospect.volledige_naam}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {faseInfo && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              color: faseInfo.tekstkleur,
                              background: faseInfo.kleur,
                            }}
                          >
                            {faseInfo.label}
                          </span>
                        )}
                        {prospect.prioriteit === "hoog" && (
                          <span className="text-cm-gold text-xs">⭐ {v("namenlijst.hoog")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div className="hidden sm:block">
                      {prospect.telefoon && (
                        <p className="text-cm-white text-xs opacity-60">
                          📞 {prospect.telefoon}
                        </p>
                      )}
                      {prospect.email && (
                        <p className="text-cm-white text-xs opacity-60">
                          ✉️ {prospect.email}
                        </p>
                      )}
                    </div>
                    <span className="text-cm-gold text-sm">→</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
