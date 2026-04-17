"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";
import { Prospect, PIPELINE_FASEN } from "@/lib/supabase/types";
import { PipelineKanban } from "@/components/namenlijst/PipelineKanban";

interface Props {
  prospects: Prospect[];
}

export function NamenlijstToggle({ prospects }: Props) {
  const [weergave, setWeergave] = useState<"pipeline" | "lijst">("pipeline");
  const [lokaleProspects, setLokaleProspects] = useState(prospects);
  const [bevestigenId, setBevestigenId] = useState<string | null>(null);
  const { v } = useTaal();
  const router = useRouter();
  const supabase = createClient();

  const gesorteerd = [...lokaleProspects].sort((a, b) =>
    a.volledige_naam.localeCompare(b.volledige_naam, "nl")
  );

  async function verwijder(id: string, naam: string) {
    const { error } = await supabase.from("prospects").delete().eq("id", id);
    if (error) {
      toast.error("Verwijderen mislukt");
    } else {
      setLokaleProspects((prev) => prev.filter((p) => p.id !== id));
      setBevestigenId(null);
      toast.success(`${naam} verwijderd`);
      router.refresh();
    }
  }

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
              const bevestigen = bevestigenId === prospect.id;
              return (
                <div
                  key={prospect.id}
                  className="card flex items-center justify-between hover:border-cm-gold-dim transition-colors group"
                >
                  <Link
                    href={`/namenlijst/${prospect.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <span className="text-xl">👤</span>
                    <div className="min-w-0">
                      <p className="text-cm-white font-semibold text-sm group-hover:text-cm-gold transition-colors truncate">
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
                  </Link>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <div className="hidden sm:block text-right">
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
                    {/* Verwijder */}
                    {bevestigen ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => verwijder(prospect.id, prospect.volledige_naam)}
                          className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          Ja
                        </button>
                        <button
                          onClick={() => setBevestigenId(null)}
                          className="text-xs text-cm-white opacity-60 hover:opacity-100 px-1 transition-opacity"
                        >
                          Nee
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setBevestigenId(prospect.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm px-2 transition-opacity"
                        title="Verwijder"
                      >
                        🗑
                      </button>
                    )}
                    <Link href={`/namenlijst/${prospect.id}`} className="text-cm-gold text-sm">→</Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
