"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PIPELINE_FASEN } from "@/lib/supabase/types";

// ============================================================
// MentorFunnelAnalyseKnop, inline-embed voor reflectie- en
// pijplijn-check-dagen (dag 7, 14, 19, 21 en later op week-
// overzicht-dagen in dag 22-60).
//
// Werking:
//   1. Haalt automatisch de prospect-cijfers per pijplijn-fase op
//      uit de prospects-tabel voor deze member.
//   2. Toont een overzichtje van de fases met aantallen.
//   3. Bij klik op de hoofd-knop: opent /coach?prefill=... met de
//      cijfers als context, zodat de Mentor direct kan analyseren
//      waar de bottleneck zit en welke dag-les opnieuw te bekijken.
//   4. 'Klaar'-knop vinkt de taak af in vandaag-flow.
//
// Doel: members krijgen automatisch GERICHT advies op basis van hun
// echte cijfers, in plaats van zelf de getallen in te typen in een
// generieke Mentor-prompt.
// ============================================================

type Props = {
  opVoltooid: () => void;
  alVoltooid: boolean;
};

type FaseTelling = {
  fase: string;
  label: string;
  aantal: number;
};

// Volgorde waarin we de fases tonen (= de funnel-volgorde).
const TOON_VOLGORDE = [
  "prospect",
  "in_gesprek",
  "uitgenodigd",
  "one_pager",
  "presentatie",
  "followup",
  "member",
  "shopper",
  "not_yet",
];

function labelVoor(fase: string): string {
  return PIPELINE_FASEN.find((f) => f.fase === fase)?.label ?? fase;
}

export function MentorFunnelAnalyseKnop({ opVoltooid, alVoltooid }: Props) {
  const [tellingen, setTellingen] = useState<FaseTelling[] | null>(null);
  const [laden, setLaden] = useState(true);
  const [bevestigd, setBevestigd] = useState(alVoltooid);

  useEffect(() => {
    let actief = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("prospects")
          .select("pipeline_fase")
          .eq("user_id", user.id);

        if (!actief) return;

        const teller: Record<string, number> = {};
        for (const p of (data as Array<{ pipeline_fase: string }> | null) ?? []) {
          teller[p.pipeline_fase] = (teller[p.pipeline_fase] || 0) + 1;
        }

        const aantallen: FaseTelling[] = TOON_VOLGORDE.filter(
          (fase) => teller[fase] !== undefined && teller[fase] > 0,
        ).map((fase) => ({
          fase,
          label: labelVoor(fase),
          aantal: teller[fase],
        }));

        setTellingen(aantallen);
      } catch {
        // negeer, knop wordt dan zonder cijfers getoond
      } finally {
        if (actief) setLaden(false);
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  if (bevestigd) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-2">
        <p className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
          ✓ Analyse opgepakt
        </p>
        <p className="text-cm-white opacity-80 text-xs">
          Top. Open Mentor opnieuw als je nog dieper wilt — je analyse staat
          in je chat-geschiedenis.
        </p>
      </div>
    );
  }

  if (laden) {
    return (
      <div className="rounded-lg border-2 border-cm-border bg-cm-surface px-4 py-4">
        <p className="text-cm-white opacity-60 text-sm">
          Pijplijn-cijfers ophalen…
        </p>
      </div>
    );
  }

  // Bouw de prefill-prompt op met de cijfers + verzoek voor analyse.
  // De Mentor heeft via z'n systeem-prompt al toegang tot WHY, tempo
  // en welke dag-lessen er zijn — die hoeven we hier niet te herhalen.
  const cijferRegels =
    tellingen && tellingen.length > 0
      ? tellingen.map((t) => `${t.label}: ${t.aantal}`).join(" / ")
      : "Nog geen prospects geregistreerd";

  const prefill =
    `Analyseer mijn pijplijn. Cijfers per fase nu: ${cijferRegels}. ` +
    `Waar lekt mijn funnel het sterkst? Welke dag-les uit het playbook ` +
    `kan ik herzien om die fase aan te pakken? Geef me één concrete ` +
    `oefening voor de komende week om de bottleneck te verkleinen.`;

  const coachUrl = `/coach?onderwerp=funnel-analyse&prefill=${encodeURIComponent(prefill)}`;

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-3">
      <div className="space-y-1">
        <h4 className="text-cm-gold font-semibold text-sm">
          🔍 Laat ELEVA je funnel analyseren
        </h4>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          De Mentor kijkt naar jouw actuele cijfers, zoekt waar mensen vast
          komen te zitten, en geeft een concreet advies welke dag-les je kunt
          herzien en wat je deze week kunt oefenen.
        </p>
      </div>

      {tellingen && tellingen.length > 0 ? (
        <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-2 space-y-1">
          <p className="text-cm-gold text-[11px] font-semibold uppercase tracking-wider">
            Jouw pijplijn op dit moment
          </p>
          <ul className="space-y-0.5">
            {tellingen.map((t) => (
              <li
                key={t.fase}
                className="flex justify-between text-cm-white opacity-90 text-xs"
              >
                <span>{t.label}</span>
                <span className="font-semibold tabular-nums">{t.aantal}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-2">
          <p className="text-cm-white opacity-70 text-xs">
            Nog geen prospects geregistreerd. Geen probleem — de Mentor kan
            ook helpen op basis van je dagelijkse acties.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={coachUrl}
          className="btn-gold flex-1 py-3 text-sm font-semibold text-center inline-block"
        >
          🔍 Open analyse in Mentor
        </a>
        <button
          type="button"
          onClick={() => {
            setBevestigd(true);
            opVoltooid();
          }}
          className="btn-secondary flex-1 py-3 text-sm font-semibold"
        >
          ✓ Klaar
        </button>
      </div>
    </div>
  );
}
