"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// OverridesLijst, drie client-components voor /instellingen/tekst-
// overrides (unified founder-aanpassingen pagina):
//
// - OverridesLijst       → tekst_overrides (per namespace gegroepeerd)
// - PlaybookOverridesLijst → playbook_overrides (per Sprint-dag)
// - ScriptOverridesLijst → script_overrides (per script)
//
// Allemaal met "Toon" + "Terug naar standaard" per stuk.
// ============================================================

// ─────────────────────────────────────────────────────────────
// 1. TEKST_OVERRIDES
// ─────────────────────────────────────────────────────────────

export type OverrideRij = {
  namespace: string;
  sleutel: string;
  waarde: string;
  updated_at: string;
};

export function OverridesLijst({
  groepen,
}: {
  groepen: Array<[string, OverrideRij[]]>;
}) {
  const router = useRouter();
  const [openOverride, setOpenOverride] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);

  async function reset(namespace: string, sleutel: string) {
    if (
      !confirm(
        `Aanpassing "${namespace}.${sleutel}" terugzetten naar standaard? De code-tekst wordt weer zichtbaar, jouw aanpassing gaat verloren.`,
      )
    )
      return;
    const key = `${namespace}.${sleutel}`;
    setBezig(key);
    try {
      const r = await fetch("/api/tekst/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, sleutel, reset: true }),
      });
      if (!r.ok) {
        toast.error("Reset mislukt");
        return;
      }
      toast.success("Aanpassing gereset, standaard tekst zichtbaar");
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(null);
    }
  }

  return (
    <div className="space-y-3">
      {groepen.map(([namespace, items]) => (
        <details
          key={namespace}
          open
          className="card border-l-4 border-cm-gold"
        >
          <summary className="cursor-pointer flex items-center justify-between gap-3 list-none">
            <h3 className="text-base font-semibold text-cm-gold">
              {namespace}
            </h3>
            <span className="text-xs text-cm-white opacity-60">
              {items.length} aanpassing{items.length === 1 ? "" : "en"}
            </span>
          </summary>
          <div className="mt-3 space-y-2">
            {items.map((item) => {
              const key = `${item.namespace}.${item.sleutel}`;
              const open = openOverride === key;
              const datumLabel = new Date(item.updated_at).toLocaleDateString(
                "nl-NL",
                { day: "numeric", month: "short", year: "numeric" },
              );
              const firstLine =
                item.waarde.split("\n").find((l) => l.trim().length > 0) ??
                item.waarde;
              return (
                <div
                  key={key}
                  className="rounded-lg border border-cm-border bg-cm-surface p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-cm-white text-sm font-medium break-words">
                        {item.sleutel}
                      </p>
                      <p className="text-cm-white text-xs opacity-60 mt-0.5 line-clamp-1">
                        {firstLine}
                      </p>
                      <p className="text-cm-white text-[10px] opacity-50 mt-1">
                        Aangepast: {datumLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenOverride(open ? null : key)}
                        className="text-xs text-cm-white opacity-70 hover:opacity-100 px-2 py-1"
                      >
                        {open ? "Inklappen" : "Toon"}
                      </button>
                      <button
                        type="button"
                        onClick={() => reset(item.namespace, item.sleutel)}
                        disabled={bezig === key}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 whitespace-nowrap"
                      >
                        {bezig === key
                          ? "Bezig..."
                          : "↺ Terug naar standaard"}
                      </button>
                    </div>
                  </div>
                  {open && (
                    <pre className="text-xs text-cm-white whitespace-pre-wrap break-words bg-cm-surface-2 p-3 rounded border border-cm-border font-sans">
                      {item.waarde}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. PLAYBOOK_OVERRIDES (Sprint-dag-aanpassingen)
// ─────────────────────────────────────────────────────────────

export type PlaybookOverrideRij = {
  dag_nummer: number;
  titel: string | null;
  wat_je_leert: string | null;
  fase_doel: string | null;
  waarom_werkt_dit_tekst: string | null;
  waarom_werkt_dit_bron: string | null;
  updated_at: string;
};

export function PlaybookOverridesLijst({
  rijen,
}: {
  rijen: PlaybookOverrideRij[];
}) {
  const router = useRouter();
  const [openDag, setOpenDag] = useState<number | null>(null);
  const [bezig, setBezig] = useState<number | null>(null);

  async function reset(dagNummer: number) {
    if (
      !confirm(
        `Alle aanpassingen voor Sprint-dag ${dagNummer} terugzetten naar standaard? Alle velden (titel, watJeLeert, faseDoel, etc.) gaan verloren.`,
      )
    )
      return;
    setBezig(dagNummer);
    try {
      const r = await fetch("/api/playbook/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dagNummer, reset: true }),
      });
      if (!r.ok) {
        toast.error("Reset mislukt");
        return;
      }
      toast.success(`Dag ${dagNummer} gereset, code-standaard zichtbaar`);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(null);
    }
  }

  return (
    <div className="space-y-3">
      {rijen.map((r) => {
        const open = openDag === r.dag_nummer;
        const datumLabel = new Date(r.updated_at).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const ingevuld: { label: string; waarde: string }[] = [];
        if (r.titel) ingevuld.push({ label: "Titel", waarde: r.titel });
        if (r.wat_je_leert)
          ingevuld.push({ label: "Wat je leert", waarde: r.wat_je_leert });
        if (r.fase_doel)
          ingevuld.push({ label: "Fase-doel", waarde: r.fase_doel });
        if (r.waarom_werkt_dit_tekst)
          ingevuld.push({
            label: "Waarom werkt dit",
            waarde: r.waarom_werkt_dit_tekst,
          });
        if (r.waarom_werkt_dit_bron)
          ingevuld.push({
            label: "Bron",
            waarde: r.waarom_werkt_dit_bron,
          });

        return (
          <div
            key={r.dag_nummer}
            className="rounded-lg border border-cm-border bg-cm-surface p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-cm-gold text-sm font-semibold">
                  Sprint dag {r.dag_nummer}
                </p>
                <p className="text-cm-white text-xs opacity-70 mt-0.5">
                  {ingevuld.length} veld{ingevuld.length === 1 ? "" : "en"}{" "}
                  aangepast:{" "}
                  {ingevuld.map((v) => v.label).join(", ")}
                </p>
                <p className="text-cm-white text-[10px] opacity-50 mt-1">
                  Aangepast: {datumLabel}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenDag(open ? null : r.dag_nummer)}
                  className="text-xs text-cm-white opacity-70 hover:opacity-100 px-2 py-1"
                >
                  {open ? "Inklappen" : "Toon"}
                </button>
                <button
                  type="button"
                  onClick={() => reset(r.dag_nummer)}
                  disabled={bezig === r.dag_nummer}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 whitespace-nowrap"
                >
                  {bezig === r.dag_nummer ? "Bezig..." : "↺ Reset hele dag"}
                </button>
              </div>
            </div>
            {open && ingevuld.length > 0 && (
              <div className="space-y-2 mt-2">
                {ingevuld.map((v) => (
                  <div
                    key={v.label}
                    className="rounded border border-cm-border bg-cm-surface-2 p-3 space-y-1"
                  >
                    <p className="text-cm-gold text-[10px] font-semibold uppercase tracking-wider">
                      {v.label}
                    </p>
                    <pre className="text-xs text-cm-white whitespace-pre-wrap break-words font-sans">
                      {v.waarde}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. SCRIPT_OVERRIDES (/scripts aanpassingen)
// ─────────────────────────────────────────────────────────────

export type ScriptOverrideRij = {
  script_id: string;
  titel: string | null;
  inhoud: string | null;
  updated_at: string;
};

export function ScriptOverridesLijst({ rijen }: { rijen: ScriptOverrideRij[] }) {
  const router = useRouter();
  const [openScript, setOpenScript] = useState<string | null>(null);
  const [bezig, setBezig] = useState<string | null>(null);

  async function reset(scriptId: string) {
    if (
      !confirm(
        `Aanpassingen voor script "${scriptId}" terugzetten naar standaard?`,
      )
    )
      return;
    setBezig(scriptId);
    try {
      const r = await fetch("/api/scripts/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId, reset: true }),
      });
      if (!r.ok) {
        toast.error("Reset mislukt");
        return;
      }
      toast.success("Script gereset, code-standaard zichtbaar");
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(null);
    }
  }

  return (
    <div className="space-y-3">
      {rijen.map((r) => {
        const open = openScript === r.script_id;
        const datumLabel = new Date(r.updated_at).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const preview =
          r.titel ??
          (r.inhoud
            ? r.inhoud.split("\n").find((l) => l.trim().length > 0) ??
              r.inhoud
            : "(geen titel of inhoud)");
        return (
          <div
            key={r.script_id}
            className="rounded-lg border border-cm-border bg-cm-surface p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-cm-white text-sm font-medium break-words">
                  {r.script_id}
                </p>
                <p className="text-cm-white text-xs opacity-60 mt-0.5 line-clamp-1">
                  {preview}
                </p>
                <p className="text-cm-white text-[10px] opacity-50 mt-1">
                  Aangepast: {datumLabel}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenScript(open ? null : r.script_id)}
                  className="text-xs text-cm-white opacity-70 hover:opacity-100 px-2 py-1"
                >
                  {open ? "Inklappen" : "Toon"}
                </button>
                <button
                  type="button"
                  onClick={() => reset(r.script_id)}
                  disabled={bezig === r.script_id}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 whitespace-nowrap"
                >
                  {bezig === r.script_id
                    ? "Bezig..."
                    : "↺ Terug naar standaard"}
                </button>
              </div>
            </div>
            {open && (
              <div className="space-y-2 mt-2">
                {r.titel && (
                  <div className="rounded border border-cm-border bg-cm-surface-2 p-3 space-y-1">
                    <p className="text-cm-gold text-[10px] font-semibold uppercase tracking-wider">
                      Titel
                    </p>
                    <p className="text-sm text-cm-white">{r.titel}</p>
                  </div>
                )}
                {r.inhoud && (
                  <div className="rounded border border-cm-border bg-cm-surface-2 p-3 space-y-1">
                    <p className="text-cm-gold text-[10px] font-semibold uppercase tracking-wider">
                      Inhoud
                    </p>
                    <pre className="text-xs text-cm-white whitespace-pre-wrap break-words font-sans">
                      {r.inhoud}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
