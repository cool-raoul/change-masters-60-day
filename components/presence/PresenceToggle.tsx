"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// PresenceToggle, opt-out voor de groene 'nu actief'-stip in teamview.
//
// Default AAN voor alle members (team-gevoel: sponsor weet wanneer
// een fijn moment is om te bellen). Member kan 'm hier uitzetten als
// 'ie introvert is, een drukke baan heeft, of niet in de gaten gehouden
// wil voelen worden. Verandering werkt direct: heartbeat schrijft niet
// meer naar last_seen_at en de groene stip verdwijnt overal.
// ============================================================

type Props = {
  initieelAan: boolean;
};

export function PresenceToggle({ initieelAan }: Props) {
  const [aan, setAan] = useState(initieelAan);
  const [bezig, setBezig] = useState(false);

  async function toggle() {
    setBezig(true);
    const nieuw = !aan;
    setAan(nieuw); // optimistic
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAan(!nieuw);
        toast.error("Niet ingelogd");
        return;
      }
      const updates: { presence_zichtbaar: boolean; last_seen_at?: string } = {
        presence_zichtbaar: nieuw,
      };
      // Bij UIT-zetten: last_seen_at op een uur geleden zodat de groene
      // stip direct verdwijnt voor teamleden.
      if (!nieuw) {
        updates.last_seen_at = new Date(
          Date.now() - 60 * 60 * 1000,
        ).toISOString();
      }
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) {
        setAan(!nieuw);
        toast.error("Opslaan mislukt: " + error.message);
        return;
      }
      toast.success(
        nieuw
          ? "🟢 Je bent zichtbaar voor je team als je actief bent"
          : "🔒 Online-status uit, je verdwijnt uit het 'nu actief'-overzicht",
      );
    } catch (e) {
      setAan(!nieuw);
      const msg = e instanceof Error ? e.message : "fout";
      toast.error(`Opslaan mislukt: ${msg}`);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            🟢 Online-status zichtbaar voor team
          </h2>
          <p className="text-cm-white text-sm opacity-70 mt-1.5 leading-relaxed">
            Wanneer aan: je sponsor en jouw downline zien een groene stip
            naast je naam zodra je in ELEVA bezig bent. Bedoeld voor verbinding,
            niet voor controle. Sponsor weet wanneer een fijn moment is om
            even contact te hebben.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={bezig}
          role="switch"
          aria-checked={aan}
          className={`flex-shrink-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
            aan ? "bg-emerald-500" : "bg-cm-surface-2"
          } disabled:opacity-50`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              aan ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className="text-cm-white opacity-50 text-xs leading-relaxed">
        Status wordt alleen gedeeld binnen jouw sponsor-lijn (op- en
        neerwaarts), nooit met de hele organisatie. Je kunt 'm op elk moment
        uitzetten, je verdwijnt direct uit alle overzichten.
      </p>
    </div>
  );
}
