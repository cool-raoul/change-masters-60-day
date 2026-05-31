"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ============================================================
// Pre-post versus 21-dagen-post-vertakking op Core dag 1.
// Bewaart profiles.core_eigen_resultaat (boolean).
//
// Sinds 2026-05-31: na keuze toont 'r een directe link naar de
// bijbehorende sideflow zodat de member 'm meteen kan starten,
// zonder te wachten op de auto-redirect na dag 1 voltooid.
// ============================================================

type Props = {
  alVoltooid: boolean;
  opVoltooid: () => void;
};

export function PrePostKeuzeEmbed({ alVoltooid, opVoltooid }: Props) {
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  const [huidigeKeuze, setHuidigeKeuze] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Bij mount: lees de bestaande keuze zodat we ook in 'voltooid'-state
  // de juiste sideflow-link kunnen tonen.
  useEffect(() => {
    let levend = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("core_eigen_resultaat")
        .eq("id", user.id)
        .maybeSingle();
      if (!levend) return;
      const v = (data as { core_eigen_resultaat?: boolean | null } | null)?.core_eigen_resultaat;
      if (v !== null && v !== undefined) setHuidigeKeuze(v);
    })();
    return () => {
      levend = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (voltooid) {
    const sideflowSlug =
      huidigeKeuze === true
        ? "21-dagen-post"
        : huidigeKeuze === false
          ? "pre-post"
          : null;
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Keuze vastgelegd
        </p>
        {sideflowSlug ? (
          <p className="text-cm-white opacity-80 text-xs mt-1">
            Nadat je dag 1 hebt afgerond verschijnt jouw{" "}
            {sideflowSlug === "21-dagen-post"
              ? "21-dagen-resultaat-post"
              : "pre-post"}
            -flow als keuze-banner op /vandaag, dan kun je rustig kiezen
            wanneer je 'm doet.
          </p>
        ) : (
          <p className="text-cm-white opacity-80 text-xs mt-1">
            Je advies blijft op je dashboard staan. Maak vandaag of
            morgen alsnog je post-keuze als je 'r klaar voor bent.
          </p>
        )}
      </div>
    );
  }

  async function kies(eigenResultaat: boolean) {
    setBezig(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      setBezig(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ core_eigen_resultaat: eigenResultaat })
      .eq("id", user.id);

    if (error) {
      toast.error("Opslaan mislukt");
      setBezig(false);
      return;
    }

    setVoltooid(true);
    setHuidigeKeuze(eigenResultaat);
    opVoltooid();
    toast.success(
      eigenResultaat
        ? "Top, je 21-dagen-resultaat-post-flow staat klaar"
        : "Top, je pre-post-flow staat klaar",
    );
    router.refresh();
    setBezig(false);
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-5 py-5 space-y-4">
      <div>
        <h3 className="text-cm-gold font-semibold text-base">
          📝 Heb je al een product-ervaring?
        </h3>
        <p className="text-cm-white/85 text-sm mt-1">
          Dit bepaalt jouw eerste-post-track op dag 7. Twee paden, beide werken.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => kies(false)}
          disabled={bezig}
          className="rounded-md border border-cm-border bg-cm-bg/60 hover:bg-cm-bg/80 px-4 py-3 text-left transition-colors"
        >
          <p className="text-cm-white font-semibold text-sm mb-1">
            Nog niet
          </p>
          <p className="text-cm-white/65 text-xs leading-relaxed">
            Je gaat een <strong>pre-post</strong> maken: je deelt je voornemen en start je eigen 21-dagen-ervaring met een product.
          </p>
        </button>

        <button
          type="button"
          onClick={() => kies(true)}
          disabled={bezig}
          className="rounded-md border border-cm-border bg-cm-bg/60 hover:bg-cm-bg/80 px-4 py-3 text-left transition-colors"
        >
          <p className="text-cm-white font-semibold text-sm mb-1">
            Ja, ik heb al iets gemerkt
          </p>
          <p className="text-cm-white/65 text-xs leading-relaxed">
            Je gaat een <strong>21-dagen-post</strong> maken: je deelt wat je hebt ervaren, claim-vrij en eerlijk.
          </p>
        </button>
      </div>
    </div>
  );
}
