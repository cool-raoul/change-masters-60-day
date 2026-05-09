"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type UplineLid = {
  id: string;
  naam: string;
  niveau: number;
  isDirect: boolean;
};

// ============================================================
// MiniElevaUitnodigKnop, op de prospect-kaart in /namenlijst/[id].
//
// Maakt via POST /api/mini-eleva/uitnodiging een nieuwe magic-link
// (14 dagen geldig) en toont de deelbare URL aan de member, zodat 'ie
// 'm kan kopieren en doorsturen via WhatsApp/SMS/email.
//
// Vervangt op termijn het klassieke 3-weg-gesprek voor business-prospects.
// Zie docs/superpowers/specs/2026-05-06-mini-eleva-design.md
// ============================================================

type Props = {
  prospectId: string;
  prospectNaam: string;
};

export function MiniElevaUitnodigKnop({ prospectId, prospectNaam }: Props) {
  const [bezig, setBezig] = useState(false);
  const [resultaat, setResultaat] = useState<{
    deelLink: string;
    expiresAt: string;
  } | null>(null);
  const [upline, setUpline] = useState<UplineLid[]>([]);
  const [gekozenSponsorId, setGekozenSponsorId] = useState<string | null>(
    null,
  );

  // Upline-keten ophalen voor sponsor-keuze. Default = niemand erbij;
  // member kan later in de chat zelf alsnog iemand toevoegen via de
  // 'voeg sponsor toe'-knop. Bij maken hoeft de keuze niet vooraf.
  useEffect(() => {
    let levend = true;
    (async () => {
      try {
        const res = await fetch("/api/mini-eleva/upline");
        if (!res.ok) return;
        const data = await res.json();
        if (!levend) return;
        const lijst = (data.upline ?? []) as UplineLid[];
        setUpline(lijst);
        // GEEN auto-selectie: default blijft null = niemand erbij
      } catch {
        // Stilletjes negeren als endpoint nog niet bestaat
      }
    })();
    return () => {
      levend = false;
    };
  }, []);

  async function maakUitnodiging() {
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/uitnodiging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          sponsorUserId: gekozenSponsorId ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Aanmaken mislukt");
        return;
      }
      setResultaat({
        deelLink: data.deelLink,
        expiresAt: data.expires_at,
      });
      toast.success("Mini-ELEVA-uitnodiging aangemaakt");
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function kopieerLink() {
    if (!resultaat) return;
    navigator.clipboard.writeText(resultaat.deelLink);
    toast.success("Link gekopieerd naar klembord");
  }

  function deelViaWhatsApp() {
    if (!resultaat) return;
    const bericht = `Hé ${prospectNaam.split(" ")[0]}! Ik heb een eigen kijk-omgeving voor je klaargezet binnen ELEVA. Daar staan welkomstvideo's van mij, een AI-mentor die 24/7 al je vragen beantwoordt over Lifeplus, en een chat-lijntje met mij + mijn sponsor voor als je iemand wilt spreken. Geen pitch, geen druk, op je eigen tempo. 14 dagen geldig, geen account nodig.\n\n${resultaat.deelLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(bericht)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (resultaat) {
    return (
      <div className="card border-l-4 border-cm-gold/60 space-y-3">
        <div>
          <h3 className="text-cm-gold font-semibold text-sm">
            ✨ Mini-ELEVA aangemaakt voor {prospectNaam.split(" ")[0]}
          </h3>
          <p className="text-cm-white/70 text-xs leading-relaxed mt-1">
            Stuur de link via WhatsApp of kopieer 'm. {prospectNaam.split(" ")[0]}{" "}
            heeft 14 dagen om door de pagina's te kijken. Daarna kun je 'm
            verlengen op deze pagina als nodig, of een nieuwe maken.
          </p>
        </div>
        <div className="bg-cm-surface-2 rounded-lg p-3 break-all text-xs text-cm-white font-mono">
          {resultaat.deelLink}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={deelViaWhatsApp}
            className="btn-gold text-sm"
          >
            💬 Stuur via WhatsApp
          </button>
          <button
            type="button"
            onClick={kopieerLink}
            className="btn-secondary text-sm"
          >
            📋 Kopieer link
          </button>
          <button
            type="button"
            onClick={() => setResultaat(null)}
            className="btn-secondary text-sm"
          >
            Sluit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl">✨</span>
        <div className="flex-1">
          <h3 className="text-cm-white font-semibold text-sm">
            Mini-ELEVA-uitnodiging maken voor{" "}
            {prospectNaam.split(" ")[0]}
          </h3>
          <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
            Geeft {prospectNaam.split(" ")[0]} 14 dagen eigen toegang tot een
            mini-versie van ELEVA. Welkomstvideo's, AI-mentor en chat met jou
            en je sponsor.
          </p>
        </div>
      </div>

      {/* Optionele sponsor-keuze BIJ AANMAKEN. Default = niemand, member
          kan later in de chat zelf via '+ Voeg sponsor toe' alsnog iemand
          toevoegen. Hier alleen voor wie 't direct vooraf wil regelen. */}
      {upline.length > 0 && (
        <details className="bg-cm-surface-2 rounded-lg p-3 text-xs">
          <summary className="cursor-pointer text-cm-white/60 hover:text-cm-white">
            Sponsor direct toevoegen aan dit gesprek?{" "}
            <span className="text-cm-white/40">(optioneel)</span>
          </summary>
          <div className="mt-2 space-y-2">
            <select
              value={gekozenSponsorId ?? ""}
              onChange={(e) => setGekozenSponsorId(e.target.value || null)}
              disabled={bezig}
              className="w-full bg-cm-surface border border-cm-white/10 rounded px-2 py-1.5 text-sm text-cm-white focus:outline-none focus:border-cm-gold/40 disabled:opacity-50"
            >
              <option value="">Niemand erbij, alleen ik</option>
              {upline.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.naam}
                  {u.isDirect ? " (jouw directe sponsor)" : ` — ${u.niveau} niveaus omhoog`}
                </option>
              ))}
            </select>
            <p className="text-cm-white/40 text-[10px] leading-relaxed">
              Je kunt 'm later ook altijd nog toevoegen via de chat zelf.
            </p>
          </div>
        </details>
      )}

      <button
        type="button"
        onClick={maakUitnodiging}
        disabled={bezig}
        className="btn-gold w-full text-sm disabled:opacity-50"
      >
        {bezig ? "Bezig..." : `Maak uitnodiging aan →`}
      </button>
    </div>
  );
}
