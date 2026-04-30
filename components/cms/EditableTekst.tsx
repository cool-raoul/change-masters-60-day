"use client";

import { useState } from "react";
import { toast } from "sonner";

// ============================================================
// EditableTekst — herbruikbaar component voor founder-bewerkbare
// teksten in het ELEVA-systeem.
//
// Voor members rendert 'ie gewoon de tekst (met override als die er is,
// anders de standaard). Voor founders verschijnt er een "✍️ Bewerk
// voor iedereen"-knop ernaast die inline-edit aanzet.
//
// Gebruik:
//   <EditableTekst
//     namespace="onboarding"
//     sleutel="stap1.titel"
//     standaard="Welkom bij ELEVA"
//     overrides={overridesMap}   // server-prefetched
//     isFounder={isFounder}
//     as="h2"
//     className="text-2xl font-display font-bold"
//   />
//
// Props:
// - namespace + sleutel = unieke combi om in DB op te slaan
// - standaard = fallback tekst (uit code)
// - overrides = server-prefetched map met huidige overrides
// - isFounder = bepaalt of ✏️-knop verschijnt
// - as = HTML-element waarin de tekst gerenderd wordt
// - multiline = textarea ipv input bij bewerken (voor langere teksten)
// - className = optioneel voor styling
// ============================================================

type AsTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "div"
  | "span"
  | "li";

type Props = {
  namespace: string;
  sleutel: string;
  standaard: string;
  overrides: Record<string, string>;
  isFounder: boolean;
  as?: AsTag;
  className?: string;
  multiline?: boolean;
  rows?: number;
  /** Hint over wat dit veld doet, getoond als label boven het edit-veld */
  hint?: string;
};

export function EditableTekst({
  namespace,
  sleutel,
  standaard,
  overrides,
  isFounder,
  as = "span",
  className = "",
  multiline = false,
  rows = 4,
  hint,
}: Props) {
  const overrideWaarde = overrides[sleutel];
  const [actueleTekst, setActueleTekst] = useState(
    overrideWaarde?.trim() || standaard,
  );
  const [bewerken, setBewerken] = useState(false);
  const [buffer, setBuffer] = useState("");
  const [bezig, setBezig] = useState(false);
  const heeftOverride = !!overrideWaarde?.trim();

  function startBewerken() {
    setBuffer(actueleTekst);
    setBewerken(true);
  }

  async function bewaar() {
    setBezig(true);
    try {
      // Als de buffer identiek is aan de standaard → reset (delete row)
      const isStandaard = buffer.trim() === standaard.trim();
      const res = await fetch("/api/tekst/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace,
          sleutel,
          waarde: isStandaard ? "" : buffer,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      setActueleTekst(buffer.trim() || standaard);
      setBewerken(false);
      toast.success(
        isStandaard
          ? "Terug naar standaard"
          : "✍️ Bewaard — direct zichtbaar voor alle members",
      );
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  async function reset() {
    if (
      !confirm(
        "Terug naar de standaardtekst? Je aanpassingen gaan verloren.",
      )
    )
      return;
    setBezig(true);
    try {
      const res = await fetch("/api/tekst/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, sleutel, reset: true }),
      });
      if (!res.ok) {
        toast.error("Reset mislukt");
        return;
      }
      setActueleTekst(standaard);
      setBewerken(false);
      toast.success("Terug naar standaard");
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  if (bewerken) {
    return (
      <div className="rounded-lg border-2 border-cm-gold/60 bg-cm-gold/[0.04] p-3 space-y-2 my-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold text-cm-black font-bold">
            ✍️ Founder-modus
          </span>
          <span className="text-xs text-cm-white opacity-70">
            Wijziging is direct zichtbaar voor <strong>alle members</strong>
          </span>
        </div>
        {hint && (
          <p className="text-xs text-cm-white opacity-60 italic">{hint}</p>
        )}
        {multiline ? (
          <textarea
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            className="textarea-cm w-full text-sm leading-relaxed"
            rows={rows}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            className="input-cm w-full text-sm"
            autoFocus
          />
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={bewaar}
            disabled={bezig}
            className="btn-gold text-xs disabled:opacity-50"
          >
            {bezig ? "Bewaren..." : "Bewaar voor alle members"}
          </button>
          <button
            type="button"
            onClick={() => setBewerken(false)}
            disabled={bezig}
            className="text-xs text-cm-white opacity-70 hover:opacity-100"
          >
            Annuleer
          </button>
          {heeftOverride && (
            <button
              type="button"
              onClick={reset}
              disabled={bezig}
              className="text-xs text-red-400 hover:text-red-300 underline-offset-2 ml-auto"
            >
              Terug naar standaard
            </button>
          )}
        </div>
      </div>
    );
  }

  // View-mode: rendert het as-element met de tekst + optioneel ✏️
  // De ✏️-knop staat NAAST de tekst zodat het visueel duidelijk is
  // dat dat veld bewerkbaar is.
  const Element = as as keyof JSX.IntrinsicElements;
  return (
    <Element className={className}>
      {actueleTekst}
      {isFounder && (
        <button
          type="button"
          onClick={startBewerken}
          title="Founder-bewerken — wijzigingen gaan LIVE voor alle members"
          className="ml-2 align-middle text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-cm-gold/60 text-cm-gold bg-cm-gold/5 hover:bg-cm-gold/15 hover:border-cm-gold transition-colors font-semibold whitespace-nowrap inline-block"
        >
          ✍️ Bewerk
        </button>
      )}
    </Element>
  );
}

/**
 * Variant voor multi-line tekst-blokken — handig wanneer je een paragraaf
 * wilt bewerken en de ✏️-knop niet inline naast de tekst wil hebben maar
 * eronder. Visueel iets prettiger voor langere blokken.
 */
export function EditableBlok(
  props: Omit<Props, "as" | "multiline"> & { as?: AsTag; rows?: number },
) {
  return <EditableTekst {...props} multiline as={props.as ?? "div"} />;
}
