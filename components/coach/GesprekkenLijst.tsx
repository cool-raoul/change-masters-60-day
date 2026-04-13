"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { nl } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChatBericht } from "@/lib/supabase/types";

interface Gesprek {
  id: string;
  titel: string | null;
  updated_at: string;
  berichten: ChatBericht[];
  prospect?: { volledige_naam: string } | null;
}

const GENERIEKE_TITELS = [
  "algemeen coach gesprek",
  "coach gesprek",
  "gesprek met coach",
  "nieuw gesprek",
];

function isGeneriekeTitel(titel: string | null): boolean {
  if (!titel) return true;
  return GENERIEKE_TITELS.includes(titel.toLowerCase().trim());
}

function getTitel(gesprek: Gesprek): string {
  // Als de opgeslagen titel niet generiek is, gebruik die
  if (gesprek.titel && !isGeneriekeTitel(gesprek.titel)) {
    return gesprek.titel;
  }

  // Anders: pak het eerste gebruikersbericht als titel
  const eersteGebruikersBericht = gesprek.berichten?.find(
    (b) => b.role === "user"
  );
  if (eersteGebruikersBericht?.content) {
    const tekst = eersteGebruikersBericht.content.trim();
    return tekst.length > 45 ? tekst.substring(0, 42) + "..." : tekst;
  }

  // Fallback
  if (gesprek.prospect?.volledige_naam) {
    return `Over ${gesprek.prospect.volledige_naam}`;
  }
  return "Coach gesprek";
}

function getPreview(gesprek: Gesprek): string {
  // Laatste assistentbericht als preview
  const berichten = gesprek.berichten || [];
  const laatste = [...berichten].reverse().find((b) => b.role === "assistant");
  if (laatste?.content) {
    const tekst = laatste.content.replace(/\n/g, " ").trim();
    return tekst.length > 60 ? tekst.substring(0, 57) + "..." : tekst;
  }
  return "";
}

function getTijdLabel(datum: string): string {
  const d = new Date(datum);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Gisteren";
  return format(d, "d MMM", { locale: nl });
}

export function GesprekkenLijst({ gesprekken }: { gesprekken: Gesprek[] }) {
  const [verwijderd, setVerwijderd] = useState<Set<string>>(new Set());
  const [bevestig, setBevestig] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Swipe state
  const swipeStart = useRef<{ x: number; id: string } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<Record<string, number>>({});

  async function verwijder(id: string) {
    const { error } = await supabase.from("ai_gesprekken").delete().eq("id", id);
    if (error) {
      toast.error("Kon gesprek niet verwijderen");
    } else {
      setVerwijderd((prev) => new Set(Array.from(prev).concat(id)));
      setBevestig(null);
      toast.success("Gesprek verwijderd");
      router.refresh();
    }
  }

  function onTouchStart(e: React.TouchEvent, id: string) {
    swipeStart.current = { x: e.touches[0].clientX, id };
  }

  function onTouchMove(e: React.TouchEvent, id: string) {
    if (!swipeStart.current || swipeStart.current.id !== id) return;
    const delta = swipeStart.current.x - e.touches[0].clientX;
    if (delta > 0) {
      setSwipeOffset((prev) => ({ ...prev, [id]: Math.min(delta, 80) }));
    }
  }

  function onTouchEnd(id: string) {
    const offset = swipeOffset[id] || 0;
    if (offset > 50) {
      setBevestig(id);
    }
    setSwipeOffset((prev) => ({ ...prev, [id]: 0 }));
    swipeStart.current = null;
  }

  const zichtbaar = gesprekken.filter((g) => !verwijderd.has(g.id));

  if (zichtbaar.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-4xl mb-3">💬</div>
        <p className="text-cm-white">Nog geen gesprekken. Start een nieuw gesprek met de coach!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {zichtbaar.map((g) => {
        const titel = getTitel(g);
        const preview = getPreview(g);
        const tijdLabel = getTijdLabel(g.updated_at);
        const aantalBerichten = g.berichten?.length || 0;

        return (
          <div key={g.id} className="relative overflow-hidden rounded-xl">
            {/* Verwijder achtergrond (swipe reveal op mobiel) */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 flex items-center justify-center rounded-r-xl">
              <span className="text-white text-xs font-bold">🗑️</span>
            </div>

            {/* Bevestig verwijderen popup */}
            {bevestig === g.id && (
              <div className="absolute inset-0 bg-red-900/95 rounded-xl flex items-center justify-between px-4 z-10">
                <p className="text-white text-sm font-medium">Gesprek verwijderen?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBevestig(null)}
                    className="text-white/70 text-sm px-3 py-1 rounded-lg border border-white/30 hover:bg-white/10"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => verwijder(g.id)}
                    className="bg-red-500 text-white text-sm px-3 py-1 rounded-lg font-bold"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            )}

            {/* Gesprek rij */}
            <div
              className="card hover:border-cm-gold-dim transition-all flex items-center justify-between relative bg-cm-surface gap-3"
              style={{ transform: `translateX(-${swipeOffset[g.id] || 0}px)` }}
              onTouchStart={(e) => onTouchStart(e, g.id)}
              onTouchMove={(e) => onTouchMove(e, g.id)}
              onTouchEnd={() => onTouchEnd(g.id)}
            >
              <Link href={`/coach/${g.id}`} className="flex-1 min-w-0">
                {/* Titel + tijd op één rij */}
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="text-cm-white font-semibold text-sm truncate">
                    {titel}
                  </p>
                  <span className="text-cm-white text-xs opacity-50 whitespace-nowrap flex-shrink-0">
                    {tijdLabel}
                  </span>
                </div>

                {/* Preview of metadata */}
                {preview ? (
                  <p className="text-cm-white text-xs opacity-60 truncate">
                    {g.prospect?.volledige_naam ? `👤 ${g.prospect.volledige_naam} • ` : ""}
                    {preview}
                  </p>
                ) : (
                  <p className="text-cm-white text-xs opacity-40">
                    {g.prospect?.volledige_naam ? `👤 ${g.prospect.volledige_naam} • ` : ""}
                    {aantalBerichten === 0 ? "Nog geen berichten" : `${aantalBerichten} berichten`}
                  </p>
                )}
              </Link>

              {/* Desktop verwijder knop */}
              <button
                onClick={() => setBevestig(g.id)}
                className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm flex-shrink-0"
                title="Verwijderen"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
      <p className="text-cm-white text-xs text-center opacity-40 mt-1">
        📱 Swipe links om te verwijderen
      </p>
    </div>
  );
}
