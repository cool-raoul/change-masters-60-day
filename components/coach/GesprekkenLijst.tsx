"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Gesprek {
  id: string;
  titel: string | null;
  updated_at: string;
  berichten: unknown[];
  prospect?: { volledige_naam: string } | null;
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
      {zichtbaar.map((g) => (
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
            className="card hover:border-cm-gold-dim transition-all flex items-center justify-between relative bg-cm-surface"
            style={{ transform: `translateX(-${swipeOffset[g.id] || 0}px)` }}
            onTouchStart={(e) => onTouchStart(e, g.id)}
            onTouchMove={(e) => onTouchMove(e, g.id)}
            onTouchEnd={() => onTouchEnd(g.id)}
          >
            <Link href={`/coach/${g.id}`} className="flex-1 min-w-0">
              <p className="text-cm-white font-medium text-sm truncate">
                {g.titel || "Gesprek met coach"}
              </p>
              <p className="text-cm-white text-xs mt-0.5 opacity-60">
                {g.prospect?.volledige_naam ? `👤 ${g.prospect.volledige_naam} • ` : ""}
                {g.berichten?.length || 0} berichten •{" "}
                {format(new Date(g.updated_at), "d MMM HH:mm", { locale: nl })}
              </p>
            </Link>
            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              <Link href={`/coach/${g.id}`} className="text-cm-white text-sm">→</Link>
              {/* Desktop verwijder knop */}
              <button
                onClick={() => setBevestig(g.id)}
                className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm"
                title="Verwijderen"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
      <p className="text-cm-white text-xs text-center opacity-40 mt-1">
        📱 Swipe links om te verwijderen
      </p>
    </div>
  );
}
