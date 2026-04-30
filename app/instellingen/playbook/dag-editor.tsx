"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// DagEditor — een rij voor één dag op /instellingen/playbook.
//
// UX-principe: de velden tonen ALTIJD de huidige tekst (override
// als die er is, anders de standaard uit dagen.ts). De founder
// hoeft dus niet eerst de standaard te kopieren — gewoon aanpassen
// wat hij/zij wil aanpassen, of laten staan.
//
// Bij Bewaar: per veld vergelijken we de waarde met de standaard.
//   - Identiek aan standaard → wordt NULL in DB → fallback blijft
//   - Anders → wordt opgeslagen als override
// Zo blijft de override-tabel schoon (alleen écht aangepaste velden).
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

  // Standaardwaardes uit code — fallback als geen override
  const standaardTitel = dag.titel ?? "";
  const standaardWatJeLeert = dag.watJeLeert ?? "";
  const standaardFaseDoel = dag.faseDoel ?? "";
  const standaardWaaromTekst = dag.waaromWerktDit?.tekst ?? "";
  const standaardWaaromBron = dag.waaromWerktDit?.bron ?? "";

  // Velden voorvullen met override-waarde of standaard. De user ziet
  // dus DIRECT de huidige tekst en kan gewoon bewerken.
  const [titel, setTitel] = useState(override?.titel ?? standaardTitel);
  const [watJeLeert, setWatJeLeert] = useState(
    override?.wat_je_leert ?? standaardWatJeLeert,
  );
  const [faseDoel, setFaseDoel] = useState(
    override?.fase_doel ?? standaardFaseDoel,
  );
  const [waaromTekst, setWaaromTekst] = useState(
    override?.waarom_werkt_dit_tekst ?? standaardWaaromTekst,
  );
  const [waaromBron, setWaaromBron] = useState(
    override?.waarom_werkt_dit_bron ?? standaardWaaromBron,
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

  // Per veld: alleen overslaan naar de DB als de waarde echt afwijkt
  // van de standaard. Anders sturen we lege string door → backend
  // slaat NULL op → fallback blijft werken voor members.
  function alleenAlsAfwijkt(
    huidig: string,
    standaard: string,
  ): string {
    return huidig.trim() === standaard.trim() ? "" : huidig;
  }

  async function bewaar() {
    setBezig(true);
    try {
      const res = await fetch("/api/playbook/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dagNummer: dag.nummer,
          titel: alleenAlsAfwijkt(titel, standaardTitel),
          watJeLeert: alleenAlsAfwijkt(watJeLeert, standaardWatJeLeert),
          faseDoel: alleenAlsAfwijkt(faseDoel, standaardFaseDoel),
          waaromWerktDitTekst: alleenAlsAfwijkt(
            waaromTekst,
            standaardWaaromTekst,
          ),
          waaromWerktDitBron: alleenAlsAfwijkt(waaromBron, standaardWaaromBron),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      if (data.leeg) {
        toast.success(`Dag ${dag.nummer} — geen wijzigingen, standaard hersteld`);
      } else {
        toast.success(`Dag ${dag.nummer} bijgewerkt — direct live`);
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
        `Weet je zeker dat je dag ${dag.nummer} terug wil zetten naar de standaard? Je aanpassingen gaan verloren.`,
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
      // Velden terugzetten naar de standaard tekst
      setTitel(standaardTitel);
      setWatJeLeert(standaardWatJeLeert);
      setFaseDoel(standaardFaseDoel);
      setWaaromTekst(standaardWaaromTekst);
      setWaaromBron(standaardWaaromBron);
      toast.success(`Dag ${dag.nummer} — terug naar standaard`);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  // Toon de actuele titel in de inklap-header
  const effectieveTitel = (titel.trim() || standaardTitel).trim();

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
          <Veld label="Titel" value={titel} setValue={setTitel} />
          <Veld
            label="Wat je leert (de volledige teaching — ondersteunt witregels)"
            value={watJeLeert}
            setValue={setWatJeLeert}
            multiline
            rows={20}
          />
          <Veld
            label="Fase-doel"
            value={faseDoel}
            setValue={setFaseDoel}
            multiline
            rows={2}
          />
          <Veld
            label="Waarom dit werkt — quote"
            value={waaromTekst}
            setValue={setWaaromTekst}
            multiline
            rows={2}
          />
          <Veld
            label="Waarom dit werkt — bron (bv. 'Eric Worre, Go Pro')"
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
            <button
              onClick={reset}
              disabled={bezig}
              className="text-xs text-red-400 hover:text-red-300 underline-offset-2"
            >
              Terug naar standaard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Veld({
  label,
  value,
  setValue,
  multiline,
  rows = 1,
}: {
  label: string;
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
          className="textarea-cm w-full text-sm leading-relaxed font-mono"
          rows={rows}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input-cm w-full"
        />
      )}
    </div>
  );
}
