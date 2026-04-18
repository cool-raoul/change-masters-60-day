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
  onDragOverKaart,
  onDropOpKaart,
  dropIndicator,
  datumLocale,
}: {
  prospect: Prospect;
  onFaseWijzig: (id: string, fase: PipelineFase) => void;
  onVerwijder: (id: string, naam: string) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragOverKaart: (e: React.DragEvent, id: string) => void;
  onDropOpKaart: (e: React.DragEvent, id: string) => void;
  dropIndicator: "boven" | "onder" | null;
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
      onDragOver={(e) => onDragOverKaart(e, prospect.id)}
      onDrop={(e) => onDropOpKaart(e, prospect.id)}
      className={`relative bg-cm-surface border border-cm-border rounded-xl p-3 space-y-2 hover:border-cm-gold-dim transition-all cursor-grab active:cursor-grabbing group select-none ${
        isDragging ? "opacity-40 ring-2 ring-cm-gold" : nietActief ? "opacity-60" : "opacity-100"
      } ${dropIndicator === "boven" ? "border-t-2 border-t-cm-gold" : ""} ${dropIndicator === "onder" ? "border-b-2 border-b-cm-gold" : ""}`}
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
  // Welke kaart is target, en boven/onder = waar komt de gesleepte kaart terecht?
  const [dragOverKaart, setDragOverKaart] = useState<{ id: string; positie: "boven" | "onder" } | null>(null);
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
    setDragOverKaart(null);
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
      setDragOverKaart(null);
    }
  }, []);

  // Drag over een specifieke kaart: bepaal "boven" of "onder" aan de hand van
  // muispositie t.o.v. kaartmidden. Zorgt voor preciese insert-positie.
  const handleDragOverKaart = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIdRef.current === id) {
      // Niet boven zichzelf tonen
      setDragOverKaart(null);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midden = rect.top + rect.height / 2;
    const positie: "boven" | "onder" = e.clientY < midden ? "boven" : "onder";
    setDragOverKaart((prev) =>
      prev?.id === id && prev.positie === positie ? prev : { id, positie }
    );
  }, []);

  const handleDropOpKaart = useCallback((e: React.DragEvent, doelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sleepId = e.dataTransfer.getData("text/plain") || draggedIdRef.current;
    const positie = dragOverKaart?.positie ?? "onder";
    setDragOverKaart(null);
    setDragOverFase(null);
    setDraggingId(null);
    draggedIdRef.current = null;
    if (!sleepId || sleepId === doelId) return;

    const doelProspect = lokaleProspects.find((p) => p.id === doelId);
    if (!doelProspect) return;

    herordenNaarPositie(sleepId, doelProspect.pipeline_fase, doelId, positie);
  }, [dragOverKaart, lokaleProspects]);

  const handleDrop = useCallback((e: React.DragEvent, nieuweFase: PipelineFase) => {
    e.preventDefault();
    e.stopPropagation();
    // Als we op een kaart droppen heeft handleDropOpKaart al gedraaid en de
    // event niet verder bubbled; dit pad is alleen voor lege kolom-dropzone.
    const id = e.dataTransfer.getData("text/plain") || draggedIdRef.current;
    setDragOverFase(null);
    setDragOverKaart(null);
    setDraggingId(null);
    draggedIdRef.current = null;
    if (!id) return;

    const prospect = lokaleProspects.find((p) => p.id === id);
    if (!prospect) return;

    // Leeg kolom → achteraan plaatsen in de nieuwe fase
    herordenNaarPositie(id, nieuweFase, null, "onder");
  }, [lokaleProspects]);

  // Kernfunctie: verplaats prospect naar target fase + positie, herbereken
  // pipeline_volgorde voor de betreffende kolom(men), en sla op.
  async function herordenNaarPositie(
    sleepId: string,
    doelFase: PipelineFase,
    doelId: string | null,
    positie: "boven" | "onder"
  ) {
    const sleep = lokaleProspects.find((p) => p.id === sleepId);
    if (!sleep) return;

    // Huidige kolom-leden (doelfase) gesorteerd op huidige volgorde, zonder
    // de gesleepte zelf (voor het geval 'ie al in die fase zit).
    const doelKolom = lokaleProspects
      .filter((p) => p.pipeline_fase === doelFase && p.id !== sleepId)
      .sort((a, b) => (a.pipeline_volgorde ?? 0) - (b.pipeline_volgorde ?? 0));

    // Insert-index bepalen
    let insertIdx = doelKolom.length; // default: achteraan
    if (doelId) {
      const doelIdx = doelKolom.findIndex((p) => p.id === doelId);
      if (doelIdx !== -1) insertIdx = positie === "boven" ? doelIdx : doelIdx + 1;
    }

    const nieuweKolom = [
      ...doelKolom.slice(0, insertIdx),
      { ...sleep, pipeline_fase: doelFase },
      ...doelKolom.slice(insertIdx),
    ];

    // Lokale state updaten: nieuwe volgorde in doelfase + fase wijzigen bij verplaats
    setLokaleProspects((prev) =>
      prev.map((p) => {
        const idx = nieuweKolom.findIndex((k) => k.id === p.id);
        if (idx === -1) return p;
        return { ...p, pipeline_fase: doelFase, pipeline_volgorde: idx };
      })
    );

    // Database: batch-update alle prospects in de nieuwe kolom met frisse index.
    // We updaten alleen de rijen waarvan de waarde wijzigt om netwerkverkeer te
    // beperken. Voor de gesleepte kaart altijd, want fase kan ook veranderd zijn.
    const updates = nieuweKolom.map((p, idx) => ({
      id: p.id,
      pipeline_volgorde: idx,
      veranderd:
        p.id === sleepId ||
        p.pipeline_volgorde !== idx ||
        p.pipeline_fase !== doelFase,
    }));

    const faseVerandert = sleep.pipeline_fase !== doelFase;
    const rows = updates.filter((u) => u.veranderd);
    let foutGehad = false;
    for (const rij of rows) {
      const patch: Record<string, unknown> = {
        pipeline_volgorde: rij.pipeline_volgorde,
        updated_at: new Date().toISOString(),
      };
      if (rij.id === sleepId && faseVerandert) {
        patch.pipeline_fase = doelFase;
      }
      const { error } = await supabase
        .from("prospects")
        .update(patch)
        .eq("id", rij.id);
      if (error) foutGehad = true;
    }

    if (foutGehad) {
      toast.error(v("actie.fout"));
      setLokaleProspects(lokaleProspects);
      return;
    }
    if (faseVerandert) {
      toast.success(v("stats.opgeslagen") + " ✓");
    }
    router.refresh();
  }

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
                // Member/shopper: actieve eerst, inactieve onderaan alfabetisch.
                // Binnen gelijke actief-status en in alle andere kolommen sorteren
                // we op handmatige pipeline_volgorde (lager = hoger in kolom).
                if (fase === "member" || fase === "shopper") {
                  const aActief = a.actief !== false;
                  const bActief = b.actief !== false;
                  if (aActief !== bActief) return aActief ? -1 : 1;
                  if (!aActief && !bActief) {
                    return a.volledige_naam.localeCompare(b.volledige_naam, "nl");
                  }
                }
                return (a.pipeline_volgorde ?? 0) - (b.pipeline_volgorde ?? 0);
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
                      onDragOverKaart={handleDragOverKaart}
                      onDropOpKaart={handleDropOpKaart}
                      dropIndicator={
                        dragOverKaart?.id === p.id ? dragOverKaart.positie : null
                      }
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
