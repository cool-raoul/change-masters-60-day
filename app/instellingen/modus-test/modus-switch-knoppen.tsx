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
  /** True = mag de volledige (destructieve) reset doen. Founder of
      specifiek test-account. */
  kanVolledigResetten?: boolean;
};

export function ModusSwitchKnoppen({
  userId,
  huidigeModus,
  kanVolledigResetten = false,
}: Props) {
  const router = useRouter();
  const [bezig, setBezig] = useState<string | null>(null);

  async function volledigeReset() {
    if (bezig) return;
    const zeker = window.confirm(
      "VOLLEDIGE RESET\n\nDit wist op dit account ALLES: je voortgang, voltooide dagen, onboarding, je namenlijst met prospects, je eigen zinnen en je WHY. Daarna begin je als een gloednieuwe gebruiker bij de keuzepagina.\n\nDit kan niet ongedaan worden gemaakt. Doorgaan?",
    );
    if (!zeker) return;
    setBezig("Volledige reset");
    try {
      const res = await fetch("/api/test/reset", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const detail =
          data?.mislukt && Object.keys(data.mislukt).length
            ? ` (${Object.keys(data.mislukt).join(", ")})`
            : "";
        toast.error((data?.error || "Reset mislukt") + detail);
        setBezig(null);
        return;
      }
      toast.success("Account gereset. Je begint opnieuw 👋");
      router.push("/welkom-keuze");
      router.refresh();
    } catch (err) {
      console.warn("Volledige reset mislukt:", err);
      toast.error("Reset mislukt, probeer 't opnieuw");
      setBezig(null);
    }
  }

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
    <>
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
          Naar keuzepagina (voortgang blijft)
        </h3>
        <p className="text-cm-white text-xs opacity-80 leading-relaxed">
          Alleen je modus wordt leeggemaakt, je ziet de keuzepagina. Je
          voortgang blijft bewaard.
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

      {kanVolledigResetten && (
        <div className="card border-l-4 border-red-500 mt-4">
          <h3 className="text-red-300 font-display font-bold text-base mb-1 flex items-center gap-2">
            🗑️ Volledige reset (test-account)
          </h3>
          <p className="text-cm-white text-xs opacity-80 leading-relaxed mb-3">
            Wist ALLES op dit account: voortgang, voltooide dagen, onboarding,
            je namenlijst, eigen zinnen en je WHY. Daarna begin je als
            gloednieuwe gebruiker. Alleen voor jouw test-account, gewone
            gebruikers kunnen dit niet.
          </p>
          <button
            type="button"
            onClick={volledigeReset}
            disabled={!!bezig}
            className="px-4 py-2.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {bezig === "Volledige reset"
              ? "Bezig met resetten..."
              : "Wis alles en begin opnieuw"}
          </button>
        </div>
      )}
    </>
  );
}
