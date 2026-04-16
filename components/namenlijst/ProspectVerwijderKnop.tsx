"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  prospectId: string;
  prospectNaam: string;
}

export function ProspectVerwijderKnop({ prospectId, prospectNaam }: Props) {
  const [bevestigen, setBevestigen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function verwijder() {
    setBezig(true);
    const { error } = await supabase
      .from("prospects")
      .delete()
      .eq("id", prospectId);

    if (error) {
      toast.error("Verwijderen mislukt");
      setBezig(false);
      setBevestigen(false);
    } else {
      toast.success(`${prospectNaam} verwijderd`);
      router.push("/namenlijst");
      router.refresh();
    }
  }

  if (bevestigen) {
    return (
      <div className="flex items-center gap-2 bg-red-900/30 border border-red-600/40 rounded-lg px-3 py-1.5">
        <span className="text-red-300 text-xs">Zeker weten?</span>
        <button
          onClick={verwijder}
          disabled={bezig}
          className="text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded transition-colors disabled:opacity-60"
        >
          {bezig ? "..." : "Ja, verwijder"}
        </button>
        <button
          onClick={() => setBevestigen(false)}
          className="text-xs text-cm-white opacity-60 hover:opacity-100 transition-opacity"
        >
          Annuleer
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setBevestigen(true)}
      className="text-sm px-3 py-1.5 rounded-lg border border-red-600/30 text-red-400 hover:bg-red-900/30 transition-colors"
    >
      🗑 Verwijder
    </button>
  );
}
