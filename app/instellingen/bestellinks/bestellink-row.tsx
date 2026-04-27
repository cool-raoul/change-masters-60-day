"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// BestellinkRow — één rij in de bestellinks-lijst
// Lokale state voor edit/save, server-roundtrip via Supabase RLS.
// ============================================================

export function BestellinkRow({
  pakketKey,
  naam,
  prijs,
  ip,
  huidige,
  isCustom = false,
}: {
  pakketKey: string;
  naam: string;
  prijs: number | null;
  ip: number | null;
  huidige?: { id: string; url: string; label: string } | undefined;
  isCustom?: boolean;
}) {
  const supabase = createClient();
  const [url, setUrl] = useState(huidige?.url ?? "");
  const [bezig, setBezig] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function opslaan() {
    setBezig(true);
    setFout(null);
    setOpgeslagen(false);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setFout("Niet ingelogd");
        setBezig(false);
        return;
      }

      if (huidige) {
        // Update bestaand
        const { error } = await supabase
          .from("member_bestellinks")
          .update({ url: url.trim() })
          .eq("id", huidige.id);
        if (error) throw error;
      } else if (url.trim().length > 0) {
        // Insert nieuw
        const { error } = await supabase.from("member_bestellinks").insert({
          user_id: user.id,
          pakket_key: pakketKey,
          label: naam,
          url: url.trim(),
          is_custom: isCustom,
        });
        if (error) throw error;
      }

      setOpgeslagen(true);
      setTimeout(() => setOpgeslagen(false), 2000);
    } catch (e: any) {
      setFout(e?.message ?? "Opslaan mislukt");
    }
    setBezig(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="font-medium text-gray-900">{naam}</div>
          {(prijs !== null || ip !== null) && (
            <div className="text-xs text-gray-500">
              {prijs !== null && `€${prijs.toFixed(2)}`}
              {prijs !== null && ip !== null && " · "}
              {ip !== null && `${ip} IP`}
            </div>
          )}
        </div>
        {opgeslagen && (
          <span className="text-xs text-emerald-600">✓ Opgeslagen</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://lifeplus.com/.../winkelwagen?..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={opslaan}
          disabled={bezig}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-40"
        >
          {bezig ? "..." : "Opslaan"}
        </button>
      </div>

      {fout && <div className="text-xs text-red-600 mt-2">{fout}</div>}
    </div>
  );
}
