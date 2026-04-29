"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// ZinKaart — één bewerkbare zin op /mijn-zinnen.
// In de inklap-modus: titel + waarde-preview + "← hoort bij dag X" + bewerk.
// Uitgeklapt: textarea + bewaar/annuleer.
// ============================================================

type Props = {
  zin: {
    slug: string;
    label: string;
    waarde: string;
    bron_dag: number | null;
    bron_taak: string | null;
    updated_at: string;
  };
  instructie?: string;
  placeholder?: string;
  maxTekens: number;
  voorbeeld?: string;
};

export function ZinKaart({
  zin,
  instructie,
  placeholder,
  maxTekens,
  voorbeeld,
}: Props) {
  const router = useRouter();
  const [bewerken, setBewerken] = useState(false);
  const [waarde, setWaarde] = useState(zin.waarde);
  const [bezig, setBezig] = useState(false);

  async function bewaar() {
    const t = waarde.trim();
    if (!t) {
      toast.error("Lege zin");
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/playbook/zin-bewaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: zin.slug,
          label: zin.label,
          waarde: t,
          bronDag: zin.bron_dag ?? undefined,
          bronTaak: zin.bron_taak ?? undefined,
          autoVink: false,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      toast.success("Bewaard");
      setBewerken(false);
      router.refresh();
    } catch (e) {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="card space-y-2">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="text-cm-gold font-semibold text-sm">{zin.label}</h3>
        <div className="flex items-center gap-3">
          {zin.bron_dag && (
            <Link
              href={`/playbook?dag=${zin.bron_dag}`}
              className="text-xs text-cm-white opacity-60 hover:opacity-100 hover:text-cm-gold"
            >
              ← Hoort bij dag {zin.bron_dag}
            </Link>
          )}
          {!bewerken && (
            <button
              type="button"
              onClick={() => setBewerken(true)}
              className="text-xs text-cm-gold hover:underline"
            >
              ✏️ Bewerken
            </button>
          )}
        </div>
      </div>

      {bewerken ? (
        <div className="space-y-2">
          {instructie && (
            <p className="text-xs text-cm-white opacity-70 leading-relaxed">
              {instructie}
            </p>
          )}
          <textarea
            value={waarde}
            onChange={(e) => setWaarde(e.target.value)}
            maxLength={maxTekens}
            placeholder={placeholder}
            className="textarea-cm w-full text-sm"
            rows={4}
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-cm-white opacity-50">
              {waarde.length} / {maxTekens}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBewerken(false);
                  setWaarde(zin.waarde);
                }}
                disabled={bezig}
                className="text-xs text-cm-white opacity-70 hover:opacity-100"
              >
                Annuleer
              </button>
              <button
                type="button"
                onClick={bewaar}
                disabled={bezig}
                className="btn-gold text-xs disabled:opacity-50"
              >
                {bezig ? "Bewaren..." : "Bewaar"}
              </button>
            </div>
          </div>
          {voorbeeld && (
            <p className="text-xs text-cm-white opacity-60 italic leading-relaxed border-t border-cm-border pt-2">
              <strong className="not-italic text-cm-gold">Voorbeeld:</strong>{" "}
              {voorbeeld}
            </p>
          )}
        </div>
      ) : (
        <p className="text-cm-white text-sm leading-relaxed whitespace-pre-line">
          {zin.waarde}
        </p>
      )}
    </div>
  );
}
