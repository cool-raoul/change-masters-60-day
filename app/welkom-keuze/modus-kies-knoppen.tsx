"use client";

import { useState, ReactNode, Children, isValidElement } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// ModusKiesKnoppen, twee grote keuze-tegels (Core / Pro) op de
// /welkom-keuze pagina. Verwacht 4 children met data-slot attributen:
//   data-slot="core-titel"
//   data-slot="core-uitleg"
//   data-slot="pro-titel"
//   data-slot="pro-uitleg"
//
// Bij klikken: schrijft modus naar profiles + redirect naar de
// passende welkomstpagina. De ouder-pagina is een server-component,
// daarom is dit child een client-component.
// ============================================================

type Props = {
  userId: string;
  children: ReactNode;
};

export function ModusKiesKnoppen({ userId, children }: Props) {
  const router = useRouter();
  const [bezig, setBezig] = useState<"core" | "pro" | null>(null);

  // Slot-children scheiden op basis van data-slot attribuut
  const slots: Record<string, ReactNode> = {};
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const slot = (child.props as { "data-slot"?: string })["data-slot"];
      if (slot) slots[slot] = child;
    }
  });

  async function kies(modus: "core" | "pro") {
    if (bezig) return;
    setBezig(modus);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ modus })
        .eq("id", userId);
      if (error) throw error;
      toast.success("Route gekozen, één moment...");
      router.push(modus === "core" ? "/welkom-core" : "/welkom-pro");
      router.refresh();
    } catch (err) {
      console.warn("Modus opslaan mislukt:", err);
      toast.error("Opslaan mislukte, probeer 't opnieuw");
      setBezig(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
