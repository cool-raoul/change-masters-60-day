"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// AanpakKeuze, op de prospect-detail-pagina onder de status.
//
// Member kiest hoe hij of zij deze prospect aanpakt:
//   - 3-WEG-GESPREK (klassiek): jij + sponsor + prospect bij elkaar
//   - MINI-ELEVA (zelfstandig): prospect kijkt 14 dagen zelf rond
//
// De keuze wordt opgeslagen op prospects.gekozen_aanpak. Hieronder
// in de UI passen we de prominent getoonde knoppen daarop aan:
//   - 3-weg gekozen → DriewegGesprekInklapbaar staat prominent
//   - mini_eleva   → MiniElevaUitnodigKnop staat prominent
//
// Geen keuze = beide opties zichtbaar (status quo, voor wie 't al
// zo gewend is).
// ============================================================

type Aanpak = "drieweg" | "mini_eleva" | null;

type Props = {
  prospectId: string;
  prospectVoornaam: string;
  huidigeAanpak: Aanpak;
};

export function AanpakKeuze({
  prospectId,
  prospectVoornaam,
  huidigeAanpak,
}: Props) {
  const [aanpak, setAanpak] = useState<Aanpak>(huidigeAanpak);
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  async function kies(nieuw: Aanpak) {
    if (bezig) return;
    setBezig(true);
    const oud = aanpak;
    setAanpak(nieuw); // optimistisch
    try {
      const res = await fetch("/api/prospect/aanpak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, aanpak: nieuw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        setAanpak(oud);
        return;
      }
      const labelMap: Record<string, string> = {
        drieweg: "3-weg-gesprek",
        mini_eleva: "Mini-ELEVA",
      };
      toast.success(
        nieuw
          ? `Aanpak voor ${prospectVoornaam}: ${labelMap[nieuw]}`
          : "Keuze gewist",
      );
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
      setAanpak(oud);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="card border-l-4 border-cm-gold/40 space-y-3">
      <div>
        <h3 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
          🧭 Welke aanpak past bij {prospectVoornaam}?
        </h3>
        <p className="text-cm-white/60 text-xs leading-relaxed mt-1">
          Twee paden, kies wat past. Je kunt later switchen of allebei
          gebruiken.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => kies(aanpak === "drieweg" ? null : "drieweg")}
          disabled={bezig}
          className={`text-left p-3 rounded-lg border transition-colors disabled:opacity-50 ${
            aanpak === "drieweg"
              ? "bg-cm-gold/15 border-cm-gold"
              : "bg-cm-surface-2 border-cm-white/10 hover:border-cm-gold/40"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-xl">🤝</span>
            <div className="flex-1">
              <h4 className="text-cm-white font-semibold text-sm">
                3-weg-gesprek
              </h4>
              <p className="text-cm-white/60 text-xs mt-1 leading-snug">
                Klassiek: jij, je sponsor en de prospect samen in een gesprek.
                Sponsor brengt autoriteit, jij koppelt persoonlijk.
              </p>
              <p className="text-cm-gold/80 text-[10px] mt-2 leading-snug">
                Past bij: warme prospect, kort traject, wil persoonlijk
                contact.
              </p>
            </div>
          </div>
          {aanpak === "drieweg" && (
            <p className="text-cm-gold text-[10px] mt-2 font-semibold uppercase tracking-wider">
              ✓ Gekozen
            </p>
          )}
        </button>

        <button
          type="button"
          onClick={() => kies(aanpak === "mini_eleva" ? null : "mini_eleva")}
          disabled={bezig}
          className={`text-left p-3 rounded-lg border transition-colors disabled:opacity-50 ${
            aanpak === "mini_eleva"
              ? "bg-cm-gold/15 border-cm-gold"
              : "bg-cm-surface-2 border-cm-white/10 hover:border-cm-gold/40"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-xl">✨</span>
            <div className="flex-1">
              <h4 className="text-cm-white font-semibold text-sm">
                Mini-ELEVA
              </h4>
              <p className="text-cm-white/60 text-xs mt-1 leading-snug">
                Geef de prospect 14 dagen eigen toegang. Filmpjes,
                ELEVA-mentor, chat met jou. Onderdompeling op eigen tempo.
              </p>
              <p className="text-cm-gold/80 text-[10px] mt-2 leading-snug">
                Past bij: nieuwsgierige prospect, twijfelaar, druk leven, of
                iemand die eerst rustig wil kijken.
              </p>
            </div>
          </div>
          {aanpak === "mini_eleva" && (
            <p className="text-cm-gold text-[10px] mt-2 font-semibold uppercase tracking-wider">
              ✓ Gekozen
            </p>
          )}
        </button>
      </div>

      {aanpak && (
        <button
          type="button"
          onClick={() => kies(null)}
          disabled={bezig}
          className="text-cm-white/40 hover:text-cm-white/70 text-[11px] underline"
        >
          Keuze wissen
        </button>
      )}
    </div>
  );
}
