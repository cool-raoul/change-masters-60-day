"use client";

import { useState, ReactNode, Children, isValidElement } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// ModusKiesKnoppen, drie grote keuze-tegels (Sprint / Core / Pro) op
// de /welkom-keuze pagina. Verwacht 6 children met data-slot attributen:
//   data-slot="sprint-titel" / "sprint-uitleg"
//   data-slot="core-titel"   / "core-uitleg"
//   data-slot="pro-titel"    / "pro-uitleg"
//
// Bij klikken: schrijft modus naar profiles + redirect naar de
// passende welkomstpagina. Sprint → /dashboard, Core → /welkom-core,
// Pro → /welkom-pro. De ouder-pagina is een server-component, daarom
// is dit child een client-component.
// ============================================================

type Props = {
  userId: string;
  children: ReactNode;
};

type Modus = "sprint" | "core" | "pro";

export function ModusKiesKnoppen({ userId, children }: Props) {
  const router = useRouter();
  const [bezig, setBezig] = useState<Modus | null>(null);

  // Slot-children scheiden op basis van data-slot attribuut
  const slots: Record<string, ReactNode> = {};
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const slot = (child.props as { "data-slot"?: string })["data-slot"];
      if (slot) slots[slot] = child;
    }
  });

  async function kies(modus: Modus) {
    if (bezig) return;
    setBezig(modus);
    try {
      const supabase = createClient();

      // Per 2026-05-19: zet ook de modus-specifieke startdatum bij
      // eerste activatie. Bij her-activatie (datum bestaat al) niets
      // doen, zodat de banner op /vandaag de oppakken/opnieuw-keuze
      // kan tonen.
      const today = new Date().toISOString().slice(0, 10);
      const updates: Record<string, unknown> = { modus };
      if (modus === "sprint" || modus === "core") {
        const datumVeld =
          modus === "sprint" ? "sprint_startdatum" : "core_startdatum";
        const { data: prof } = await supabase
          .from("profiles")
          .select(datumVeld)
          .eq("id", userId)
          .maybeSingle();
        const bestaat = (prof as Record<string, string | null> | null)?.[
          datumVeld
        ];
        if (!bestaat) {
          updates[datumVeld] = today;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
      if (error) throw error;
      toast.success("Route gekozen, één moment...");
      const redirectMap: Record<Modus, string> = {
        sprint: "/onboarding",
        core: "/onboarding",
        pro: "/welkom-pro",
      };
      router.push(redirectMap[modus]);
      router.refresh();
    } catch (err) {
      console.warn("Modus opslaan mislukt:", err);
      toast.error("Opslaan mislukte, probeer 't opnieuw");
      setBezig(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => kies("sprint")}
        disabled={!!bezig}
        className="card text-left border-cm-border hover:border-cm-gold-dim hover:glow-gold-soft transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-4xl mb-3">🚀</div>
        <h2 className="font-serif-warm text-cm-gold text-xl mb-2 leading-snug">
          {slots["sprint-titel"]}
        </h2>
        <div className="text-cm-white/80 text-sm leading-relaxed mb-4">
          {slots["sprint-uitleg"]}
        </div>
        <span className="text-cm-gold text-sm font-medium group-hover:translate-x-1 inline-block transition-transform">
          {bezig === "sprint" ? "Bezig..." : "Kies deze route →"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => kies("core")}
        disabled={!!bezig}
        className="card text-left border-cm-border hover:border-cm-gold-dim hover:glow-gold-soft transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-4xl mb-3">🚶</div>
        <h2 className="font-serif-warm text-cm-gold text-xl mb-2 leading-snug">
          {slots["core-titel"]}
        </h2>
        <div className="text-cm-white/80 text-sm leading-relaxed mb-4">
          {slots["core-uitleg"]}
        </div>
        <span className="text-cm-gold text-sm font-medium group-hover:translate-x-1 inline-block transition-transform">
          {bezig === "core" ? "Bezig..." : "Kies deze route →"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => kies("pro")}
        disabled={!!bezig}
        className="card text-left border-cm-border hover:border-cm-gold-dim hover:glow-gold-soft transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-4xl mb-3">💼</div>
        <h2 className="font-serif-warm text-cm-gold text-xl mb-2 leading-snug">
          {slots["pro-titel"]}
        </h2>
        <div className="text-cm-white/80 text-sm leading-relaxed mb-4">
          {slots["pro-uitleg"]}
        </div>
        <span className="text-cm-gold text-sm font-medium group-hover:translate-x-1 inline-block transition-transform">
          {bezig === "pro" ? "Bezig..." : "Kies deze route →"}
        </span>
      </button>
    </div>
  );
}
