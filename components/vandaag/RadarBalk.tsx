"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { RadarItem } from "@/lib/radar/volgende-beste-actie";
import { isBovenKennisNiveau, leerDagVoorFase } from "@/lib/radar/kennis-niveau";

// ============================================================
// RadarBalk, klikbare balk bovenaan /vandaag.
//
// Ingeklapt (default): "🎯 N actie-prospects voor je vandaag →"
// met subtiele gouden pulsatie zolang er minstens 1 niet-afgevinkt
// item is. Bij alles-afgevinkt: rustig grijs "✓ Vandaag alle X opgepakt".
//
// Uitgeklapt: lijst met items. Per item naam + redenen + WhatsApp /
// prospect-kaart-knoppen + afvink-knop. Items boven kennis-niveau:
// amber rand + 'leer in dag X' + Mentor-knop.
//
// Afvinken: optimistische UI-update + POST /api/radar/afvinken.
// Bij fout: rollback + toast.
// ============================================================

type Props = {
  items: RadarItem[];
  /** Set met prospect-IDs die VANDAAG al zijn afgevinkt — komen
   *  uit haalRadarAfvinkSets. Server-pre-rendered set. */
  initieelAfgevinkt: string[];
  /** Huidige dag in de 60-dagen-run. Wordt gebruikt voor de
   *  kennis-grens-markering per radar-item. */
  huidigeDag: number;
};

function formatPhone(telefoon: string | null): string | null {
  if (!telefoon) return null;
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("00")) nummer = nummer.substring(2);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}`;
}

export function RadarBalk({ items, initieelAfgevinkt, huidigeDag }: Props) {
  const [open, setOpen] = useState(false);
  const [afgevinkt, setAfgevinkt] = useState<Set<string>>(
    new Set(initieelAfgevinkt),
  );

  if (items.length === 0) return null;

  const openItems = items.filter((i) => !afgevinkt.has(i.prospect.id));
  const allesGedaan = openItems.length === 0;

  async function vinkAf(prospectId: string) {
    // Optimistische update
    setAfgevinkt((prev) => {
      const nieuw = new Set(prev);
      nieuw.add(prospectId);
      return nieuw;
    });

    try {
      const res = await fetch("/api/radar/afvinken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId }),
      });
      if (!res.ok) throw new Error("Afvinken mislukt");
    } catch {
      // Rollback
      setAfgevinkt((prev) => {
        const nieuw = new Set(prev);
        nieuw.delete(prospectId);
        return nieuw;
      });
      toast.error("Afvinken mislukt, probeer opnieuw");
    }
  }

  return (
    <div
      className={`rounded-xl border-2 transition-colors ${
        allesGedaan
          ? "border-cm-border bg-cm-surface/40"
          : "border-cm-gold/50 bg-gradient-to-br from-cm-gold/15 to-cm-gold/5 animate-pulse-soft"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            🎯 Volgende beste acties
          </p>
          <p className={`text-sm font-display font-semibold ${allesGedaan ? "text-cm-white/70" : "text-cm-white"}`}>
            {allesGedaan
              ? `Vandaag alle ${items.length} acties opgepakt`
              : openItems.length === 1
                ? "1 prospect waar je nu het meeste momentum kan oogsten"
                : `${openItems.length} prospects waar je nu het meeste momentum kan oogsten`}
          </p>
          {!allesGedaan && (
            <p className="text-cm-white opacity-60 text-xs">
              Gerangschikt op recente signalen, fase en stilte-tijd. Pak 'r 1, je gaat sneller dan je denkt.
            </p>
          )}
        </div>
        <span className={`text-sm transition-transform mt-1 ${open ? "rotate-90" : ""}`}>
          ▶
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-cm-border/50 pt-3">
          {items.map((item) => {
            const isGedaan = afgevinkt.has(item.prospect.id);
            const fase = item.prospect.pipeline_fase;
            const bovenKennis = isBovenKennisNiveau(fase, huidigeDag);
            const leerDag = leerDagVoorFase(fase);
            const waLink = formatPhone(item.prospect.telefoon);

            return (
              <div
                key={item.prospect.id}
                className={`rounded-lg border px-3 py-2.5 space-y-1.5 ${
                  isGedaan
                    ? "border-cm-border bg-cm-bg/30 opacity-60"
                    : bovenKennis
                      ? "border-amber-500/50 bg-amber-900/15"
                      : "border-cm-border bg-cm-surface"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <p className={`text-sm font-semibold ${isGedaan ? "text-cm-white/60 line-through" : "text-cm-white"}`}>
                    {isGedaan && <span className="mr-1">✓</span>}
                    {item.prospect.volledige_naam}
                  </p>
                  <span className="text-cm-white/50 text-[11px]">
                    {fase.replace("_", " ")}
                  </span>
                </div>

                {item.redenen.length > 0 && (
                  <p className="text-cm-white/70 text-xs leading-tight">
                    {item.redenen.join(" · ")}
                  </p>
                )}

                {bovenKennis && !isGedaan && leerDag !== null && (
                  <p className="text-amber-200/80 text-[11px] italic">
                    Voor deze fase leer je in dag {leerDag} de techniek.
                  </p>
                )}

                {!isGedaan && (
                  <div className="flex gap-2 flex-wrap pt-1">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary inline-block py-1 px-2.5 text-[11px] font-semibold"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/namenlijst/${item.prospect.id}`}
                      className="btn-secondary inline-block py-1 px-2.5 text-[11px] font-semibold"
                    >
                      → Prospect-kaart
                    </Link>
                    {bovenKennis && (
                      <Link
                        href={`/coach?onderwerp=fase-hulp&prefill=${encodeURIComponent(
                          `Help me met ${item.prospect.volledige_naam} (fase ${fase}, ik zit op dag ${huidigeDag}).`,
                        )}`}
                        className="btn-secondary inline-block py-1 px-2.5 text-[11px] font-semibold border-amber-500/50"
                      >
                        🧠 Open Mentor
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => vinkAf(item.prospect.id)}
                      className="btn-gold inline-block py-1 px-2.5 text-[11px] font-semibold ml-auto"
                    >
                      ✓ Vandaag opgepakt
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
