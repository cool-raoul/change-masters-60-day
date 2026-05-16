"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ============================================================
// Pre-post versus 21-dagen-post-vertakking op Core dag 1.
// Bewaart profiles.core_eigen_resultaat (boolean).
// ============================================================

type Props = {
  alVoltooid: boolean;
  opVoltooid: () => void;
};

export function PrePostKeuzeEmbed({ alVoltooid, opVoltooid }: Props) {
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  const router = useRouter();
  const supabase = createClient();

  if (voltooid) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Keuze vastgelegd
        </p>
        <p className="text-cm-white opacity-80 text-xs mt-1">
          Vanaf dag 7 zie je de content die hierbij past.
        </p>
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
    opVoltooid();
    toast.success(
      eigenResultaat
        ? "Top, je gaat dag 7 met 21-dagen-post-track beginnen"
        : "Top, je gaat dag 7 met pre-post-track beginnen",
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
