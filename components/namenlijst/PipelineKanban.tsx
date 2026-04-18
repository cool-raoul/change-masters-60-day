"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PIPELINE_FASEN, Prospect, PipelineFase } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { useTaal } from "@/lib/i18n/TaalContext";
import { Locale } from "date-fns";

interface Props {
  prospects: Prospect[];
}

const FASE_KLEUREN: Record<PipelineFase, string> = {
  prospect: "#CCCCCC",
  uitgenodigd: "#4A9EDB",
  one_pager: "#7A6ADB",
  presentatie: "#9A6ADB",
  followup: "#C9A84C",
  not_yet: "#DB6A6A",
  shopper: "#4ACB6A",
  member: "#E8C96B",
};

function ProspectKaart({
  prospect,
  onFaseWijzig,
  onVerwijder,
  isDragging,
  onDragStart,
  onDragEnd,
  datumLocale,
}: {
  prospect: Prospect;
  onFaseWijzig: (id: string, fase: PipelineFase) => void;
  onVerwijder: (id: string, naam: string) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  datumLocale: Locale;
}) {
  const [bevestigen, setBevestigen] = useState(false);
  const dagSindsContact = prospect.laatste_contact
    ? Math.floor((Date.now() - new Date(prospect.laatste_contact).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const nietActief = prospect.actief === false;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, prospect.id)}
      onDragEnd={onDragEnd}
      className={`bg-cm-surface border border-cm-border rounded-xl p-3 space-y-2 hover:border-cm-gold-dim transition-all cursor-grab active:cursor-grabbing group select-none ${
        isDragging ? "opacity-40 ring-2 ring-cm-gold" : nietActief ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <Link
          href={`/namenlijst/${prospect.id}`}
          className="font-semibold text-cm-white text-sm hover:text-cm-gold transition-colors flex-1"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        >
          {prospect.volledige_naam}
        </Link>
        {prospect.prioriteit === "hoog" && (
          <span className="text-cm-gold text-xs ml-2">⭐</span>
        )}
        {nietActief && (
          <span className="text-orange-400 text-xs ml-2" title="Niet-actief">💤</span>
        )}
      </div>

      {prospect.volgende_actie_notitie && (
        <p className="text-xs text-cm-white line-clamp-2">
          {prospect.volgende_actie_notitie}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-cm-white opacity-60">
          {dagSindsContact !== null
            ? dagSindsContact === 0
              ? "✓"
              : `${dagSindsContact}d`
            : "—"}
        </span>
        {prospect.volgende_actie_datum && (
          <span className={`text-xs font-medium ${
            new Date(prospect.volgende_actie_datum) <= new Date()
              ? "text-red-400"
              : "text-cm-gold"
          }`}>
            {format(new Date(prospect.volgende_actie_datum), "d MMM", { locale: datumLocale })}
          </span>
        )}
      </div>

      {/* Fase wijzigen knoppen bij hover */}
      <div className="hidden group-hover:flex gap-1 pt-1 border-t border-cm-border flex-wrap">
        {PIPELINE_FASEN.filter((f) => f.fase !== prospect.pipeline_fase).map((f) => (
          <button
            key={f.fase}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFaseWijzig(prospect.id, f.fase);
            }}
            className="text-xs px-2 py-0.5 rounded bg-cm-surface-2 text-cm-white hover:text-cm-gold transition-colors"
          >
            {f.label}
          </button>
        ))}
        {/* Verwijder knop */}
        {!bevestigen ? (
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBevestigen(true); }}
            className="text-xs px-2 py-0.5 rounded bg-red-900/40 text-red-400 hover:bg-red-900/70 transition-colors ml-auto"
          >
            🗑
          </button>
        ) : (
          <div className="flex items-center gap-1 ml-auto" onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onVerwijder(prospect.id, prospect.volledige_naam); }}
              className="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-500 transition-colors"
            >
              Ja
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBevestigen(false); }}
              className="text-xs px-2 py-0.5 rounded bg-cm-surface-2 text-cm-white hover:text-cm-gold transition-colors"
            >
              Nee
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

export function PipelineKanban({ prospects }: Props) {
  const [lokaleProspects, setLokaleProspects] = useState(prospects);
  const [dragOverFase, setDragOverFase] = useState<PipelineFase | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const { v, taal } = useTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    draggedIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverFase(null);
    draggedIdRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, fase: PipelineFase) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverFase(fase);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Alleen resetten als we echt de kolom verlaten (niet naar een child)
    const related = e.relatedTarget as HTMLElement | null;
    if (!e.currentTarget.contains(related)) {
      setDragOverFase(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, nieuweFase: PipelineFase) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFase(null);

    // Probeer id uit dataTransfer of ref
    const id = e.dataTransfer.getData("text/plain") || draggedIdRef.current;
    if (!id) return;

    const prospect = lokaleProspects.find((p) => p.id === id);
    if (!prospect || prospect.pipeline_fase === nieuweFase) {
      setDraggingId(null);
      draggedIdRef.current = null;
      return;
    }

    wijzigFase(id, nieuweFase);
    setDraggingId(null);
    draggedIdRef.current = null;
  }, [lokaleProspects]);

  async function verwijderProspect(id: string, naam: string) {
    const { error } = await supabase.from("prospects").delete().eq("id", id);
    if (error) {
      toast.error(v("actie.fout"));
    } else {
      setLokaleProspects((prev) => prev.filter((p) => p.id !== id));
      toast.success(`${naam} verwijderd`);
      router.refresh();
    }
  }

  async function wijzigFase(id: string, nieuweFase: PipelineFase) {
    // Optimistisch lokaal bijwerken
    setLokaleProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pipeline_fase: nieuweFase } : p))
    );
    const { error } = await supabase
      .from("prospects")
      .update({ pipeline_fase: nieuweFase, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(v("actie.fout"));
      // Herstel naar origineel bij fout
      setLokaleProspects(lokaleProspects);
    } else {
      toast.success(v("stats.opgeslagen") + " ✓");
      // Ververs server data zodat lijstweergave + detail pagina ook klopt
      router.refresh();
    }
  }

  function scrollLinks() {
    scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  }

  function scrollRechts() {
    scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
  }

  return (
    <div className="space-y-2">
      {/* Scroll pijlen rechtsboven */}
      <div className="flex justify-end gap-2">
        <button
          onClick={scrollLinks}
          className="w-8 h-8 bg-cm-surface border border-cm-border rounded-full flex items-center justify-center text-cm-gold hover:bg-cm-surface-2 transition-colors"
        >
          ←
        </button>
        <button
          onClick={scrollRechts}
          className="w-8 h-8 bg-cm-surface border border-cm-border rounded-full flex items-center justify-center text-cm-gold hover:bg-cm-surface-2 transition-colors"
        >
          →
        </button>
      </div>

      {/* Kanban scroll container */}
      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_FASEN.map(({ fase, label }) => {
            const faseProspects = lokaleProspects
              .filter((p) => p.pipeline_fase === fase)
              .sort((a, b) => {
                // Binnen member/shopper-kolom: actieve eerst, inactieve onderaan alfabetisch.
                // Andere fases: geen extra sortering (volgorde van fetch respecteren).
                if (fase !== "member" && fase !== "shopper") return 0;
                const aActief = a.actief !== false;
                const bActief = b.actief !== false;
                if (aActief !== bActief) return aActief ? -1 : 1;
                if (!aActief && !bActief) {
                  return a.volledige_naam.localeCompare(b.volledige_naam, "nl");
                }
                return 0;
              });
            const isDragOver = dragOverFase === fase;

            return (
              <div
                key={fase}
                className="w-56 flex-shrink-0"
                onDragOver={(e) => handleDragOver(e, fase)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, fase)}
              >
                {/* Kolom header */}
                <div
                  className="rounded-t-xl px-3 py-2 mb-2 flex items-center justify-between transition-colors"
                  style={{
                    background: isDragOver
                      ? `${FASE_KLEUREN[fase]}30`
                      : `${FASE_KLEUREN[fase]}15`,
                    borderBottom: isDragOver ? `2px solid ${FASE_KLEUREN[fase]}` : "2px solid transparent",
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: FASE_KLEUREN[fase] }}>
                    {label}
                  </span>
                  <span className="bg-cm-surface-2 text-cm-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {faseProspects.length}
                  </span>
                </div>

                {/* Kaarten dropzone */}
                <div
                  className={`space-y-2 min-h-[200px] rounded-b-xl p-1 transition-all ${
                    isDragOver ? "ring-2 ring-cm-gold bg-cm-surface-2/20" : ""
                  }`}
                >
                  {faseProspects.map((p) => (
                    <ProspectKaart
                      key={p.id}
                      prospect={p}
                      onFaseWijzig={wijzigFase}
                      onVerwijder={verwijderProspect}
                      isDragging={draggingId === p.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      datumLocale={datumLocale}
                    />
                  ))}
                  {faseProspects.length === 0 && (
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center text-xs transition-colors min-h-[80px] flex items-center justify-center ${
                        isDragOver
                          ? "border-cm-gold text-cm-gold bg-cm-gold/5"
                          : "border-cm-border text-cm-white opacity-40"
                      }`}
                    >
                      {isDragOver ? "↓" : v("namenlijst.leeg")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
