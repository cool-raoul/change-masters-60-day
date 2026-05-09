"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ============================================================
// WisselSponsorKnop, op de prospect-detail-pagina per actieve mini-
// ELEVA-sessie. Member kan hiermee de gekoppelde sponsor wisselen
// in een lopende chat — bijvoorbeeld als de directe sponsor te druk
// is en iemand hoger in de upline beter past.
//
// Toont compact als knop "👤 Wissel sponsor", uitklap → dropdown met
// upline-keten, kies → PATCH /api/mini-eleva/uitnodiging/sponsor.
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
};

export function WisselSponsorKnop({
  invitationId,
  huidigeSponsorId,
  huidigeSponsorNaam,
}: Props) {
  const [open, setOpen] = useState(false);
  const [upline, setUpline] = useState<UplineLid[]>([]);
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

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

  async function kies(nieuweSponsorId: string | null) {
    if (bezig) return;
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/uitnodiging/sponsor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, sponsorUserId: nieuweSponsorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Wisselen mislukt");
        return;
      }
      toast.success(
        nieuweSponsorId
          ? "Sponsor gewisseld"
          : "Sponsor verwijderd uit deze chat",
      );
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-cm-gold/80 hover:text-cm-gold underline"
      >
        👤 {huidigeSponsorNaam
          ? `Wissel sponsor (${huidigeSponsorNaam.split(" ")[0]})`
          : "Voeg upline toe"}
      </button>

      {open && (
        <div className="mt-2 bg-cm-surface rounded-lg p-2 space-y-1.5 border border-cm-white/10">
          <p className="text-cm-white/60 text-[10px] mb-1">
            Kies wie er in deze chat zit:
          </p>
          {upline.length === 0 ? (
            <p className="text-cm-white/40 text-[10px] italic">
              Geen upline gevonden. Als jouw eigen sponsor_id niet is
              ingesteld in je profiel, kun je hier niemand kiezen.
            </p>
          ) : (
            <>
              {upline.map((u) => {
                const isHuidig = u.id === huidigeSponsorId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => !isHuidig && kies(u.id)}
                    disabled={bezig || isHuidig}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs ${
                      isHuidig
                        ? "bg-cm-gold/15 text-cm-gold cursor-default"
                        : "hover:bg-cm-surface-2 text-cm-white"
                    } disabled:opacity-50`}
                  >
                    {isHuidig ? "✓ " : ""}
                    {u.naam}
                    <span className="text-cm-white/40 text-[10px] ml-1">
                      {u.isDirect ? "(directe sponsor)" : `(${u.niveau} niveaus omhoog)`}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => kies(null)}
                disabled={bezig || huidigeSponsorId === null}
                className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-cm-surface-2 text-cm-white/70 disabled:opacity-50"
              >
                {huidigeSponsorId === null ? "✓ " : ""}
                Niemand erbij, alleen ik
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
