"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  prospectId: string;
  prospectNaam: string;
  actief: boolean;
}

// Actief-toggle — alleen zichtbaar op de klantenkaart van member/shopper.
// Niet-actief zet de prospect onderaan de namenlijst + pipeline-kolom.
export function ActiefToggle({ prospectId, prospectNaam, actief }: Props) {
  const [bezig, setBezig] = useState(false);
  const [huidig, setHuidig] = useState(actief);
  const supabase = createClient();
  const router = useRouter();

  async function toggle() {
    if (bezig) return;
    const nieuweWaarde = !huidig;
    setBezig(true);
    const { error } = await supabase
      .from("prospects")
      .update({ actief: nieuweWaarde, updated_at: new Date().toISOString() })
      .eq("id", prospectId);
    if (error) {
      // Kolom-ontbreekt meest voorkomende oorzaak → wijs direct naar migratie
      const isKolomFout = /column .* does not exist|actief/i.test(error.message);
      toast.error(
        isKolomFout
          ? "Database mist 'actief' kolom — SQL-migratie prospect_actief.sql nog uitvoeren"
          : `Status wijzigen mislukt: ${error.message}`
      );
      console.error("ActiefToggle update fout:", error);
      setBezig(false);
      return;
    }
    setHuidig(nieuweWaarde);
    setBezig(false);
    toast.success(
      nieuweWaarde
        ? `${prospectNaam} weer op actief`
        : `${prospectNaam} op niet-actief — komt onderaan de lijst`
    );
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={bezig}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
        huidig
          ? "border-cm-border text-cm-white/70 hover:border-red-500/50 hover:text-red-400"
          : "border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
      }`}
      title={
        huidig
          ? "Zet op niet-actief (verdwijnt naar onderkant van lijst)"
          : "Zet weer op actief"
      }
    >
      {bezig ? "…" : huidig ? "💤 Niet-actief zetten" : "💤 Niet actief — klik om te heractiveren"}
    </button>
  );
}
