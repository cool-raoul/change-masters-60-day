"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// RouteWisselen, de officiele member-facing route-switch in de
// instellingen (Sprint / Core / Pro). Hoort bij de belofte op
// /welkom-keuze: "je kunt altijd later switchen via je instellingen".
//
// Niet te verwarren met de founder/tester proefaccount-switcher op
// /instellingen/modus-test (die heeft extra test-opties zoals een
// volledige reset en "nieuwe gebruiker").
//
// Wisselen is NIET destructief: alleen profiles.modus verandert. Alle
// voortgang blijft bewaard (die wordt per route apart bijgehouden), en
// je kunt altijd terugwisselen. Naam + uitleg gelijkgetrokken met
// /welkom-keuze zodat het overal hetzelfde heet.
// ============================================================

type Modus = "sprint" | "core" | "pro";

const ROUTES: {
  modus: Modus;
  emoji: string;
  titel: string;
  uitleg: string;
  redirect: string;
}[] = [
  {
    modus: "core",
    emoji: "🚶",
    titel: "Core, webshop-strategie",
    uitleg:
      "Bouw je eigen webshop op je eigen tempo. Via social media, content en gratis weggevers breng je rustig nieuwe klanten binnen.",
    redirect: "/vandaag",
  },
  {
    modus: "sprint",
    emoji: "🚀",
    titel: "Sprint, 60-dagen-bouwer",
    uitleg:
      "Dagelijkse stap-voor-stap structuur met een sprint-team. Ritme en accountability om in 60 dagen samen een fundament te leggen.",
    redirect: "/vandaag",
  },
  {
    modus: "pro",
    emoji: "💼",
    titel: "Pro, professional met cliënten",
    uitleg:
      "Voor professionals die producten via een eigen webshop aan hun cliënten aanbieden. Pakketten samenstellen, met de productadvies-test als kerninstrument.",
    redirect: "/welkom-pro",
  },
];

function modusLabel(m: Modus): string {
  return m === "core" ? "Core" : m === "sprint" ? "Sprint" : "Pro";
}

export function RouteWisselen({
  userId,
  huidigeModus,
}: {
  userId: string;
  huidigeModus: string | null;
}) {
  const router = useRouter();
  const [bezig, setBezig] = useState<Modus | null>(null);

  async function wisselNaar(modus: Modus, redirect: string) {
    if (bezig) return;
    // Al op deze route: gewoon erheen, geen wijziging nodig.
    if (modus === huidigeModus) {
      router.push(redirect);
      return;
    }
    const zeker = window.confirm(
      `Wil je wisselen naar ${modusLabel(modus)}?\n\nJe voortgang blijft bewaard en je kunt altijd weer terugwisselen.`,
    );
    if (!zeker) return;
    setBezig(modus);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ modus })
        .eq("id", userId);
      if (error) throw error;
      toast.success(`Je volgt nu ${modusLabel(modus)}`);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      console.warn("Route wisselen mislukt:", err);
      toast.error("Wisselen mislukt, probeer 't opnieuw");
      setBezig(null);
    }
  }

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
          🧭 Je route
        </h2>
        <p className="text-cm-white/75 text-sm mt-1 leading-relaxed">
          Je kunt altijd van route wisselen. Je voortgang blijft bewaard en je
          kunt later weer terug. Alle tools zijn voor elke route beschikbaar,
          alleen de begeleidende stappen verschillen.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ROUTES.map((r) => {
          const huidig = r.modus === huidigeModus;
          return (
            <button
              key={r.modus}
              type="button"
              onClick={() => wisselNaar(r.modus, r.redirect)}
              disabled={!!bezig}
              className={`card text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed ${
                huidig
                  ? "border-cm-gold ring-2 ring-cm-gold/30"
                  : "hover:border-cm-gold-dim"
              }`}
            >
              <div className="text-3xl mb-2">{r.emoji}</div>
              <h3 className="text-cm-gold font-display font-bold text-sm mb-1">
                {r.titel}
              </h3>
              <p className="text-cm-white text-xs opacity-80 leading-relaxed">
                {r.uitleg}
              </p>
              <span className="text-cm-gold text-xs mt-2 inline-block font-medium">
                {bezig === r.modus
                  ? "Bezig..."
                  : huidig
                    ? "✓ Je huidige route"
                    : "→ Wissel hierheen"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
