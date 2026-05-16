"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BRACKETS, type Bracket } from "@/lib/dtt/brackets";
import { bracketVoorUren } from "@/lib/dtt/advies";
import { rankVanafDoel } from "@/lib/dtt/rank-vanaf-doel";

// ============================================================
// DTT-onboarding-embed voor Core dag 1.
// Drie vragen: doel/tijd/termijn. Toont direct bracket + rank-suggestie.
// Bewaart in profiles.core_dtt (JSONB).
// ============================================================

type Props = {
  alVoltooid: boolean;
  opVoltooid: () => void;
};

export function DTTOnboardingEmbed({ alVoltooid, opVoltooid }: Props) {
  const [doel, setDoel] = useState<string>("");
  const [uren, setUren] = useState<string>("");
  const [termijn, setTermijn] = useState<string>("");
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  const router = useRouter();
  const supabase = createClient();

  if (voltooid) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Doel-Tijd-Termijn ingevuld
        </p>
        <p className="text-cm-white opacity-80 text-xs mt-1">
          Aanpassen kan altijd via Instellingen.
        </p>
      </div>
    );
  }

  const urenNum = parseFloat(uren);
  const doelNum = parseFloat(doel);
  const bracket: Bracket = !isNaN(urenNum) ? bracketVoorUren(urenNum) : "rustig";
  const bracketDef = BRACKETS[bracket];
  const rankSug = !isNaN(doelNum) && doelNum > 0 ? rankVanafDoel(doelNum) : null;

  async function opslaan() {
    const dttData = {
      doel_per_maand: parseFloat(doel),
      uren_per_week: parseFloat(uren),
      termijn_maanden: parseFloat(termijn),
    };

    if (
      isNaN(dttData.doel_per_maand) ||
      isNaN(dttData.uren_per_week) ||
      isNaN(dttData.termijn_maanden)
    ) {
      toast.error("Vul alle drie de vragen in");
      return;
    }

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
      .update({ core_dtt: dttData })
      .eq("id", user.id);

    if (error) {
      toast.error("Opslaan mislukt: " + error.message);
      setBezig(false);
      return;
    }

    setVoltooid(true);
    opVoltooid();
    toast.success("Doel-Tijd-Termijn opgeslagen");
    router.refresh();
    setBezig(false);
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-5 py-5 space-y-4">
      <div>
        <h3 className="text-cm-gold font-semibold text-base">
          🎯 Doel-Tijd-Termijn
        </h3>
        <p className="text-cm-white/85 text-sm mt-1">
          Drie korte vragen. Op basis hiervan krijg je dagelijkse aantallen die passen bij jouw situatie.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Doel</strong>: hoeveel extra inkomen per maand wil je realistisch in 12 maanden?
          </label>
          <input
            type="number"
            min="0"
            step="50"
            placeholder="bv. 500"
            value={doel}
            onChange={(e) => setDoel(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">euro per maand</p>
        </div>

        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Tijd</strong>: hoeveel uur per week kan je hieraan investeren?
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="bv. 5"
            value={uren}
            onChange={(e) => setUren(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">uur per week</p>
        </div>

        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Termijn</strong>: in hoeveel maanden moet dit er staan zodat het voor jou de moeite waard is?
          </label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="bv. 12"
            value={termijn}
            onChange={(e) => setTermijn(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">maanden</p>
        </div>
      </div>

      {(urenNum > 0 || doelNum > 0) && (
        <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-3 space-y-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Jouw advies op basis hiervan
          </p>
          {urenNum > 0 && (
            <p className="text-cm-white/85 text-xs">
              Tempo: <strong className="text-cm-white">{bracketDef.label}</strong> ({bracketDef.urenPerWeekRange}/week)
              <br />
              <span className="text-cm-white/60">{bracketDef.verwachting}</span>
            </p>
          )}
          {bracket === "minimaal" && (
            <p className="text-amber-200/80 text-[11px] italic">
              Met minder dan 3u per week kun je je producten terugverdienen, je inkomsten zullen ongeveer gelijk zijn aan wat je zelf bestelt. Een netwerk opbouwen waarmee je serieus inkomen genereert is in dit tempo niet realistisch. Overweeg 4 tot 6 uur per week.
            </p>
          )}
          {rankSug && (
            <p className="text-cm-white/85 text-xs">
              Doel-rank: <strong className="text-cm-white">{rankSug.label}</strong>
              <br />
              <span className="text-cm-white/60">{rankSug.toelichting}</span>
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={opslaan}
        disabled={bezig}
        className="btn-gold w-full py-2.5 text-sm font-semibold"
      >
        {bezig ? "Bezig..." : "✓ DTT vastleggen"}
      </button>
    </div>
  );
}
