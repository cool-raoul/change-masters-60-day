"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Rij = {
  id: string;
  oorspronkelijke_term: string;
  zoekterm: string;
  basis_advies: string | null;
  aanvullende_producten: string[];
  leefstijl_tip: string | null;
  rauwe_bron_tekst: string | null;
  bron_jaar: number;
  gevalideerd: boolean;
  notitie: string | null;
};

type Filter = "alles" | "ongevalideerd" | "gevalideerd";

export function MentorKennisLijst({ rijen }: { rijen: Rij[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("ongevalideerd");
  const [zoek, setZoek] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);

  const zichtbaar = useMemo(() => {
    return rijen.filter((r) => {
      if (filter === "ongevalideerd" && r.gevalideerd) return false;
      if (filter === "gevalideerd" && !r.gevalideerd) return false;
      if (zoek) {
        const z = zoek.toLowerCase();
        if (
          !r.oorspronkelijke_term.toLowerCase().includes(z) &&
          !r.zoekterm.toLowerCase().includes(z)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [rijen, filter, zoek]);

  async function update(id: string, body: Partial<Rij>) {
    setBezig(id);
    try {
      const res = await fetch(`/api/mentor-kennis/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(null);
    }
  }

  async function verwijder(id: string) {
    if (!confirm("Deze rij verwijderen? Kan niet ongedaan gemaakt worden.")) {
      return;
    }
    setBezig(id);
    try {
      const res = await fetch(`/api/mentor-kennis/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Verwijderen mislukt");
        return;
      }
      toast.success("Verwijderd");
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Filter + zoek */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 flex-wrap">
          {(["ongevalideerd", "gevalideerd", "alles"] as Filter[]).map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  filter === f
                    ? "border-cm-gold bg-cm-gold/15 text-cm-gold font-semibold"
                    : "border-cm-border text-cm-white/70 hover:text-cm-white"
                }`}
              >
                {f === "ongevalideerd"
                  ? "Te valideren"
                  : f === "gevalideerd"
                    ? "Gevalideerd"
                    : "Alles"}
              </button>
            ),
          )}
        </div>
        <input
          type="text"
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
          placeholder="Zoek op term..."
          className="input-cm flex-1 text-sm min-w-[200px]"
        />
      </div>

      <p className="text-cm-white/60 text-xs">
        {zichtbaar.length} {zichtbaar.length === 1 ? "rij" : "rijen"} zichtbaar
      </p>

      {/* Rijen-lijst */}
      <div className="space-y-2">
        {zichtbaar.map((r) => {
          const open = openId === r.id;
          return (
            <div
              key={r.id}
              className={`rounded-lg border ${
                r.gevalideerd
                  ? "border-emerald-500/30 bg-emerald-900/10"
                  : "border-cm-border bg-cm-surface"
              }`}
            >
              {/* Compacte rij-header (klikbaar voor uitklap) */}
              <button
                type="button"
                onClick={() => setOpenId(open ? null : r.id)}
                className="w-full text-left p-3 flex items-start gap-3 hover:bg-cm-surface-2/30 transition-colors"
              >
                <span
                  className={`text-lg flex-shrink-0 ${
                    r.gevalideerd
                      ? "text-emerald-400"
                      : "text-cm-white/40"
                  }`}
                >
                  {r.gevalideerd ? "✓" : "○"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-cm-white font-medium text-sm">
                    {r.oorspronkelijke_term}
                  </p>
                  <p className="text-cm-white/60 text-xs mt-0.5 truncate">
                    {r.basis_advies ?? "(geen basis-advies)"}
                    {r.aanvullende_producten.length > 0 &&
                      ` · ${r.aanvullende_producten.length} aanvullend`}
                  </p>
                </div>
                <span className="text-cm-white/40 text-xs flex-shrink-0">
                  {open ? "▲" : "▼"}
                </span>
              </button>

              {/* Uitgeklapte details + edit */}
              {open && (
                <div className="border-t border-cm-border/50 p-4 space-y-3">
                  <div>
                    <label className="text-cm-white/70 text-[11px] uppercase tracking-wider block mb-1">
                      Zoekterm
                    </label>
                    <input
                      type="text"
                      defaultValue={r.zoekterm}
                      onBlur={(e) => {
                        if (e.target.value !== r.zoekterm)
                          update(r.id, { zoekterm: e.target.value });
                      }}
                      className="input-cm w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-cm-white/70 text-[11px] uppercase tracking-wider block mb-1">
                      Basis-advies
                    </label>
                    <textarea
                      defaultValue={r.basis_advies ?? ""}
                      onBlur={(e) => {
                        if (e.target.value !== (r.basis_advies ?? ""))
                          update(r.id, { basis_advies: e.target.value });
                      }}
                      rows={2}
                      className="textarea-cm w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-cm-white/70 text-[11px] uppercase tracking-wider block mb-1">
                      Aanvullende producten (komma-gescheiden)
                    </label>
                    <textarea
                      defaultValue={r.aanvullende_producten.join(", ")}
                      onBlur={(e) => {
                        const lst = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        if (lst.join(", ") !== r.aanvullende_producten.join(", "))
                          update(r.id, { aanvullende_producten: lst });
                      }}
                      rows={2}
                      className="textarea-cm w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-cm-white/70 text-[11px] uppercase tracking-wider block mb-1">
                      Leefstijl-tip
                    </label>
                    <input
                      type="text"
                      defaultValue={r.leefstijl_tip ?? ""}
                      onBlur={(e) => {
                        if (e.target.value !== (r.leefstijl_tip ?? ""))
                          update(r.id, {
                            leefstijl_tip: e.target.value || null,
                          });
                      }}
                      className="input-cm w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-cm-white/70 text-[11px] uppercase tracking-wider block mb-1">
                      Notitie (alleen voor jou en Gaby)
                    </label>
                    <textarea
                      defaultValue={r.notitie ?? ""}
                      onBlur={(e) => {
                        if (e.target.value !== (r.notitie ?? ""))
                          update(r.id, { notitie: e.target.value || null });
                      }}
                      rows={2}
                      className="textarea-cm w-full text-sm"
                    />
                  </div>
                  {r.rauwe_bron_tekst && (
                    <details className="text-xs text-cm-white/50">
                      <summary className="cursor-pointer hover:text-cm-white/70">
                        Originele 2017-tekst (referentie)
                      </summary>
                      <p className="mt-1 italic leading-relaxed">
                        {r.rauwe_bron_tekst}
                      </p>
                    </details>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-cm-border/50">
                    {!r.gevalideerd ? (
                      <button
                        type="button"
                        disabled={bezig === r.id}
                        onClick={() => update(r.id, { gevalideerd: true })}
                        className="btn-gold text-sm disabled:opacity-50"
                      >
                        ✓ Markeer als gevalideerd
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={bezig === r.id}
                        onClick={() => update(r.id, { gevalideerd: false })}
                        className="btn-secondary text-sm disabled:opacity-50"
                      >
                        ↩ Validatie ongedaan maken
                      </button>
                    )}
                    <span className="flex-1" />
                    <button
                      type="button"
                      disabled={bezig === r.id}
                      onClick={() => verwijder(r.id)}
                      className="text-red-400/70 hover:text-red-400 text-xs disabled:opacity-50"
                    >
                      🗑 Verwijderen
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {zichtbaar.length === 0 && (
        <p className="text-cm-white/50 text-sm text-center py-8 italic">
          Geen rijen die matchen
        </p>
      )}
    </div>
  );
}
