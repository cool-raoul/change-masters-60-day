"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================
// WisselSponsorKnop, in de chat-header zelf op de prospect-detail-
// pagina. Member kan hiermee:
//   - Een sponsor TOEVOEGEN aan een chat zonder sponsor (default na
//     creatie). Eerste keuze altijd de directe sponsor; andere upline-
//     leden zijn pas zichtbaar achter een 'Kies iemand anders'-toggle.
//   - Een huidige sponsor WISSELEN voor een ander upline-lid
//   - De sponsor VERWIJDEREN uit het gesprek
//
// UX-keuze: directe sponsor staat als eerste optie, klik = direct
// toevoegen. Pas als je expliciet 'iemand anders' kiest verschijnt
// de hele upline-keten. Voorkomt dat het standaard-menu drie levels
// upline laat zien als je dat niet hoeft.
// ============================================================

type UplineLid = {
  id: string;
  naam: string;
  niveau: number;
  isDirect: boolean;
};

type Props = {
  invitationId: string;
  huidigeSponsorId: string | null;
  huidigeSponsorNaam: string | null;
  /** Wordt aangeroepen na een succesvolle wijziging zodat de parent
   *  de chat opnieuw kan laden om titel + state te updaten. */
  onGewijzigd?: () => void;
};

export function WisselSponsorKnop({
  invitationId,
  huidigeSponsorId,
  huidigeSponsorNaam,
  onGewijzigd,
}: Props) {
  const [open, setOpen] = useState(false);
  const [andereOpen, setAndereOpen] = useState(false);
  const [upline, setUpline] = useState<UplineLid[]>([]);
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    if (!open) return;
    let levend = true;
    (async () => {
      try {
        const res = await fetch("/api/mini-eleva/upline");
        if (!res.ok) return;
        const data = await res.json();
        if (!levend) return;
        setUpline((data.upline ?? []) as UplineLid[]);
      } catch {
        // negeer
      }
    })();
    return () => {
      levend = false;
    };
  }, [open]);

  const directeSponsor = upline.find((u) => u.isDirect);
  const anderen = upline.filter((u) => !u.isDirect);

  async function kies(nieuweSponsorId: string | null) {
    if (bezig) return;
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/uitnodiging/sponsor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          sponsorUserId: nieuweSponsorId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Wijziging mislukt");
        return;
      }
      toast.success(
        nieuweSponsorId
          ? "Sponsor toegevoegd aan dit gesprek"
          : "Sponsor verwijderd uit dit gesprek",
      );
      setOpen(false);
      setAndereOpen(false);
      onGewijzigd?.();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  // Sluit menu bij klik buiten
  useEffect(() => {
    if (!open) return;
    function buiten(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-wissel-sponsor]")) {
        setOpen(false);
        setAndereOpen(false);
      }
    }
    document.addEventListener("mousedown", buiten);
    return () => document.removeEventListener("mousedown", buiten);
  }, [open]);

  return (
    <div className="relative" data-wissel-sponsor>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-cm-gold/80 hover:text-cm-gold text-xs flex items-center gap-1"
      >
        {huidigeSponsorId
          ? `⚙ Wissel sponsor`
          : "+ Voeg sponsor toe"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-cm-surface border border-cm-white/15 rounded-lg shadow-lg p-2 w-72 space-y-1.5">
          <p className="text-cm-white/60 text-[10px] px-1 mb-1">
            {huidigeSponsorId
              ? `Nu in dit gesprek: ${huidigeSponsorNaam ?? "sponsor"}`
              : "Wie wil je toevoegen aan dit gesprek?"}
          </p>

          {/* Eerste optie: directe sponsor (de gewone keuze) */}
          {directeSponsor && directeSponsor.id !== huidigeSponsorId && (
            <button
              type="button"
              onClick={() => kies(directeSponsor.id)}
              disabled={bezig}
              className="w-full text-left px-2 py-2 rounded text-xs hover:bg-cm-surface-2 text-cm-white disabled:opacity-50"
            >
              <div className="font-semibold text-cm-gold">
                {directeSponsor.naam}
              </div>
              <div className="text-cm-white/50 text-[10px] mt-0.5">
                Jouw directe sponsor
              </div>
            </button>
          )}

          {/* Andere upline-leden: alleen tonen na expliciete keuze */}
          {anderen.length > 0 && (
            <>
              {!andereOpen ? (
                <button
                  type="button"
                  onClick={() => setAndereOpen(true)}
                  className="w-full text-left px-2 py-1.5 rounded text-xs text-cm-white/60 hover:bg-cm-surface-2 hover:text-cm-white border border-cm-white/10"
                >
                  Kies iemand anders uit jouw upline ▾
                </button>
              ) : (
                <div className="space-y-1">
                  <p className="text-cm-white/40 text-[9px] uppercase tracking-wider px-1">
                    Hoger in de upline
                  </p>
                  {anderen.map((u) =>
                    u.id === huidigeSponsorId ? null : (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => kies(u.id)}
                        disabled={bezig}
                        className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-cm-surface-2 text-cm-white disabled:opacity-50"
                      >
                        <div>{u.naam}</div>
                        <div className="text-cm-white/40 text-[10px]">
                          {u.niveau} niveaus omhoog
                        </div>
                      </button>
                    ),
                  )}
                </div>
              )}
            </>
          )}

          {upline.length === 0 && (
            <p className="text-cm-white/40 text-[10px] italic px-1 py-1">
              Geen upline gevonden. Stel je sponsor_id in via je profiel-
              instellingen om iemand te kunnen toevoegen.
            </p>
          )}

          {/* Verwijderen, alleen relevant als 'r een sponsor is */}
          {huidigeSponsorId && (
            <>
              <div className="border-t border-cm-white/10 my-1" />
              <button
                type="button"
                onClick={() => kies(null)}
                disabled={bezig}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-cm-white/60 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
              >
                Verwijder sponsor uit dit gesprek
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
