"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// DagEditor — een rij voor één dag op /instellingen/playbook.
// Toont titel + status (override actief / standaard), klap-uit met
// 4 bewerkbare velden + Bewaar/Reset-knoppen.
// ============================================================

type Override = {
  titel: string | null;
  wat_je_leert: string | null;
  fase_doel: string | null;
  waarom_werkt_dit_tekst: string | null;
  waarom_werkt_dit_bron: string | null;
  updated_at?: string;
};

export function DagEditor({
  dag,
  override,
}: {
  dag: Dag;
  override: Override | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [titel, setTitel] = useState(override?.titel ?? "");
  const [watJeLeert, setWatJeLeert] = useState(override?.wat_je_leert ?? "");
  const [faseDoel, setFaseDoel] = useState(override?.fase_doel ?? "");
  const [waaromTekst, setWaaromTekst] = useState(
    override?.waarom_werkt_dit_tekst ?? "",
  );
  const [waaromBron, setWaaromBron] = useState(
    override?.waarom_werkt_dit_bron ?? "",
  );

  const heeftOverride =
    !!override &&
    !!(
      override.titel ||
      override.wat_je_leert ||
      override.fase_doel ||
      override.waarom_werkt_dit_tekst ||
      override.waarom_werkt_dit_bron
    );

  async function bewaar() {
    setBezig(true);
    try {
      const res = await fetch("/api/playbook/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dagNummer: dag.nummer,
          titel,
          watJeLeert,
          faseDoel,
          waaromWerktDitTekst: waaromTekst,
          waaromWerktDitBron: waaromBron,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      if (data.leeg) {
        toast.success(`Dag ${dag.nummer} — terug naar standaard`);
      } else {
        toast.success(`Dag ${dag.nummer} bijgewerkt`);
      }
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function reset() {
    if (
      !confirm(
        `Weet je zeker dat je de aanpassingen voor dag ${dag.nummer} wil terugzetten naar de standaard?`,
      )
    )
      return;
    setBezig(true);
    try {
      const res = await fetch("/api/playbook/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dagNummer: dag.nummer, reset: true }),
      });
      if (!res.ok) {
        toast.error("Reset mislukt");
        return;
      }
      setTitel("");
      setWatJeLeert("");
      setFaseDoel("");
      setWaaromTekst("");
      setWaaromBron("");
      toast.success(`Dag ${dag.nummer} — terug naar standaard`);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  // Toont effectieve titel (met evt. override) in de inklap-header
  const effectieveTitel = (titel.trim() || dag.titel).trim();

  return (
    <div className="card space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Dag {dag.nummer} · Fase {dag.fase}
          </p>
          <h3 className="text-cm-white font-display font-semibold mt-0.5 truncate">
            {effectieveTitel}
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {heeftOverride && (
            <span className="text-xs text-emerald-400 font-medium">
              ● Override actief
            </span>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-cm-gold hover:underline underline-offset-2"
          >
            {open ? "Inklappen" : "Bewerken"}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 pt-2 border-t border-cm-border">
          <Veld
            label="Titel"
            standaard={dag.titel}
            value={titel}
            setValue={setTitel}
          />
          <Veld
            label="Wat je leert (de hele teaching, ondersteunt witregels)"
            standaard={dag.watJeLeert.slice(0, 200) + "…"}
            value={watJeLeert}
            setValue={setWatJeLeert}
            multiline
            rows={14}
          />
          <Veld
            label="Fase-doel"
            standaard={dag.faseDoel}
            value={faseDoel}
            setValue={setFaseDoel}
            multiline
            rows={2}
          />
          <Veld
            label="Waarom dit werkt — tekst (de quote)"
            standaard={dag.waaromWerktDit.tekst}
            value={waaromTekst}
            setValue={setWaaromTekst}
            multiline
            rows={2}
          />
          <Veld
            label="Waarom dit werkt — bron"
            standaard={dag.waaromWerktDit.bron ?? "(geen)"}
            value={waaromBron}
            setValue={setWaaromBron}
          />

          <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-cm-border">
            <button
              onClick={bewaar}
              disabled={bezig}
              className="btn-gold text-sm disabled:opacity-50"
            >
              {bezig ? "Bewaren..." : "Bewaar wijzigingen"}
            </button>
            {heeftOverride && (
              <button
                onClick={reset}
                disabled={bezig}
                className="text-xs text-red-400 hover:text-red-300 underline-offset-2"
              >
                Terug naar standaard
              </button>
            )}
            <span className="text-xs text-cm-white opacity-50 ml-auto">
              Lege velden = standaard tekst.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Veld({
  label,
  standaard,
  value,
  setValue,
  multiline,
  rows = 1,
}: {
  label: string;
  standaard: string;
  value: string;
  setValue: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-cm-white opacity-70 mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="textarea-cm w-full text-sm leading-relaxed"
          rows={rows}
          placeholder="Laat leeg om de standaard te gebruiken"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-cm w-full"
          placeholder="Laat leeg om de standaard te gebruiken"
        />
      )}
      <p className="text-xs text-cm-white opacity-40 mt-1 italic line-clamp-2">
        Standaard: {standaard}
      </p>
    </div>
  );
}
