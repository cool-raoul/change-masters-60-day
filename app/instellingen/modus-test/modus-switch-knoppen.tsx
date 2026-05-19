"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// ModusSwitchKnoppen, vier knoppen om snel van modus te wisselen.
// Alleen renderbaar via de founder-only /instellingen/modus-test pagina.
// ============================================================

type ModusKeuze = "sprint" | "core" | "pro" | null;

type Props = {
  userId: string;
  huidigeModus: string | null;
};

export function ModusSwitchKnoppen({ userId, huidigeModus }: Props) {
  const router = useRouter();
  const [bezig, setBezig] = useState<string | null>(null);

  async function switchNaar(
    nieuweModus: ModusKeuze,
    redirectPad: string,
    label: string,
  ) {
    if (bezig) return;
    setBezig(label);
    try {
      const supabase = createClient();
      // Per 2026-05-19 (fase 3b): startdatum wordt niet meer hier gezet.
      // Stap4ModusKeuze doet dat atomair samen met tempo/DTT-opslag.
      // Founder die naar /vandaag gaat zonder tempo/DTT ziet correct
      // de "vul in"-banner.
      const { error } = await supabase
        .from("profiles")
        .update({ modus: nieuweModus })
        .eq("id", userId);
      if (error) throw error;
      toast.success(`Modus aangepast naar: ${label}`);
      router.push(redirectPad);
      router.refresh();
    } catch (err) {
      console.warn("Modus switchen mislukt:", err);
      toast.error("Switchen mislukt, probeer 't opnieuw");
      setBezig(null);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => switchNaar(null, "/welkom-keuze", "Nieuwe gebruiker")}
        disabled={!!bezig}
        className={`card text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
          huidigeModus === null
            ? "border-cm-gold ring-2 ring-cm-gold/30"
            : "hover:border-cm-gold-dim"
        }`}
      >
        <div className="text-3xl mb-2">👋</div>
        <h3 className="text-cm-gold font-display font-bold text-base mb-1">
          Reset naar nieuwe gebruiker
        </h3>
        <p className="text-cm-white text-xs opacity-80 leading-relaxed">
          Modus wordt leeggemaakt, je ziet de keuzepagina alsof je net inlogt.
        </p>
        <span className="text-cm-gold text-xs mt-2 inline-block">
          {bezig === "Nieuwe gebruiker" ? "Bezig..." : "→ Switch"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => switchNaar("sprint", "/vandaag", "Sprint")}
        disabled={!!bezig}
        className={`card text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
          huidigeModus === "sprint"
            ? "border-cm-gold ring-2 ring-cm-gold/30"
            : "hover:border-cm-gold-dim"
        }`}
      >
        <div className="text-3xl mb-2">🏃</div>
        <h3 className="text-cm-gold font-display font-bold text-base mb-1">
          Word Sprint-gebruiker
        </h3>
        <p className="text-cm-white text-xs opacity-80 leading-relaxed">
          Het 60-day Run dashboard met de 21-daagse playbook-tegel.
        </p>
        <span className="text-cm-gold text-xs mt-2 inline-block">
          {bezig === "Sprint" ? "Bezig..." : "→ Switch"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => switchNaar("core", "/vandaag", "Core")}
        disabled={!!bezig}
        className={`card text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
          huidigeModus === "core"
            ? "border-cm-gold ring-2 ring-cm-gold/30"
            : "hover:border-cm-gold-dim"
        }`}
      >
        <div className="text-3xl mb-2">🚶</div>
        <h3 className="text-cm-gold font-display font-bold text-base mb-1">
          Word Core-gebruiker
        </h3>
        <p className="text-cm-white text-xs opacity-80 leading-relaxed">
          De Core-welkomstpagina (webshop-strategie) met 5 grote tool-knoppen.
        </p>
        <span className="text-cm-gold text-xs mt-2 inline-block">
          {bezig === "Core" ? "Bezig..." : "→ Switch"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => switchNaar("pro", "/welkom-pro", "Pro")}
        disabled={!!bezig}
        className={`card text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
          huidigeModus === "pro"
            ? "border-cm-gold ring-2 ring-cm-gold/30"
            : "hover:border-cm-gold-dim"
        }`}
      >
        <div className="text-3xl mb-2">💼</div>
        <h3 className="text-cm-gold font-display font-bold text-base mb-1">
          Word Pro-gebruiker
        </h3>
        <p className="text-cm-white text-xs opacity-80 leading-relaxed">
          De Pro-welkomstpagina voor professionals met cliënten.
        </p>
        <span className="text-cm-gold text-xs mt-2 inline-block">
          {bezig === "Pro" ? "Bezig..." : "→ Switch"}
        </span>
      </button>
    </div>
  );
}
