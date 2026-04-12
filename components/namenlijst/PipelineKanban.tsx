"use client";

import { useState } from "react";
import Link from "next/link";
import { PIPELINE_FASEN, Prospect, PipelineFase } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Props {
  prospects: Prospect[];
}

const FASE_BADGE_STIJL: Record<PipelineFase, string> = {
  lead: "bg-[#3A3A3A] text-[#999]",
  uitgenodigd: "bg-[#1A2A3A] text-[#4A9EDB]",
  presentatie: "bg-[#2A1A3A] text-[#9A6ADB]",
  followup: "bg-[#2A2A1A] text-[#C9A84C]",
  klant: "bg-[#1A2A1A] text-[#4ACB6A]",
  partner: "bg-[#1A2A1A] text-[#E8C96B]",
};

function ProspectKaart({ prospect, onFaseWijzig }: { prospect: Prospect; onFaseWijzig: (id: string, fase: PipelineFase) => void }) {
  const [laden, setLaden] = useState(false);
  const dagSindsContact = prospect.laatste_contact
    ? Math.floor((Date.now() - new Date(prospect.laatste_contact).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-cm-surface border border-cm-border rounded-xl p-3 space-y-2 hover:border-cm-gold-dim transition-colors cursor-pointer group">
      <div className="flex items-start justify-between">
        <Link
          href={`/namenlijst/${prospect.id}`}
          className="font-semibold text-cm-white text-sm hover:text-cm-gold transition-colors flex-1"
        >
          {prospect.volledige_naam}
        </Link>
        {prospect.prioriteit === "hoog" && (
          <span className="text-cm-gold text-xs ml-2">⭐</span>
        )}
      </div>

      {prospect.volgende_actie_notitie && (
        <p className="text-xs text-cm-muted line-clamp-2">
          → {prospect.volgende_actie_notitie}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-cm-muted">
          {dagSindsContact !== null
            ? dagSindsContact === 0
              ? "Vandaag"
              : `${dagSindsContact}d geleden`
            : "Nog geen contact"}
        </span>
        {prospect.volgende_actie_datum && (
          <span className={`text-xs font-medium ${
            new Date(prospect.volgende_actie_datum) <= new Date()
              ? "text-red-400"
              : "text-cm-gold"
          }`}>
            🔔 {format(new Date(prospect.volgende_actie_datum), "d MMM", { locale: nl })}
          </span>
        )}
      </div>

      {/* Fase wijzigen knoppen */}
      <div className="hidden group-hover:flex gap-1 pt-1 border-t border-cm-border flex-wrap">
        {PIPELINE_FASEN.filter((f) => f.fase !== prospect.pipeline_fase).map((f) => (
          <button
            key={f.fase}
            onClick={() => onFaseWijzig(prospect.id, f.fase)}
            disabled={laden}
            className="text-xs px-2 py-0.5 rounded bg-cm-surface-2 text-cm-muted hover:text-cm-white transition-colors"
          >
            → {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PipelineKanban({ prospects }: Props) {
  const [lokaleProspects, setLokaleProspects] = useState(prospects);
  const supabase = createClient();

  async function wijzigFase(id: string, nieuweFase: PipelineFase) {
    // Optimistisch bijwerken
    setLokaleProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pipeline_fase: nieuweFase } : p))
    );

    const { error } = await supabase
      .from("prospects")
      .update({
        pipeline_fase: nieuweFase,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Kon fase niet wijzigen");
      setLokaleProspects(prospects);
    } else {
      toast.success("Fase bijgewerkt");
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {PIPELINE_FASEN.map(({ fase, label }) => {
          const faseProspects = lokaleProspects.filter((p) => p.pipeline_fase === fase);
          return (
            <div key={fase} className="w-64 flex-shrink-0">
              {/* Kolom header */}
              <div className={`rounded-t-xl px-3 py-2 mb-2 flex items-center justify-between`}
                style={{ background: `${FASE_BADGE_STIJL[fase].split(" ")[0].replace("bg-[", "").replace("]", "")}20` }}
              >
                <span className={`text-sm font-semibold ${FASE_BADGE_STIJL[fase].split(" ")[1]}`}>
                  {label}
                </span>
                <span className="bg-cm-surface-2 text-cm-muted text-xs font-medium px-2 py-0.5 rounded-full">
                  {faseProspects.length}
                </span>
              </div>

              {/* Kaarten */}
              <div className="space-y-2 min-h-[200px]">
                {faseProspects.map((p) => (
                  <ProspectKaart key={p.id} prospect={p} onFaseWijzig={wijzigFase} />
                ))}
                {faseProspects.length === 0 && (
                  <div className="border-2 border-dashed border-cm-border rounded-xl p-4 text-center text-cm-muted text-xs">
                    Geen contacten
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
