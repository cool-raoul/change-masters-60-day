"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { VoiceOpnameKnop } from "@/components/mini-eleva/VoiceOpnameKnop";
import { VoicePlayer } from "@/components/mini-eleva/VoicePlayer";

// ============================================================
// MiniElevaProspectChat, EEN doorlopende chat-omgeving per prospect.
//
// Vervangt MiniElevaChatInklapbaar dat per uitnodiging een aparte
// chat toonde. Werkt zoals WhatsApp 1-op-1: alle berichten van alle
// uitnodigingen voor deze prospect in chronologische volgorde,
// scrollbaar, met één input-veld onderaan.
//
// Verzendt naar de meest recente actieve uitnodiging. Als er geen
// actieve is wordt 'r een uitleg getoond i.p.v. de input.
// ============================================================

type Bericht = {
  id: string;
  invitation_id: string;
  rol: "prospect" | "member" | "sponsor";
  type: "tekst" | "spraak";
  content: string;
  transcriptie: string | null;
  audio_url: string | null;
  duur_seconden: number | null;
  created_at: string;
};

type Props = {
  prospectId: string;
  prospectVoornaam: string;
  sponsorVoornaam?: string | null;
};

const POLL_INTERVAL_MS = 8000;

export function MiniElevaProspectChat({
  prospectId,
  prospectVoornaam,
  sponsorVoornaam,
}: Props) {
  const searchParams = useSearchParams();
  const startOpen = searchParams.get("chat") === "open";
  const [open, setOpen] = useState(startOpen);
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [actieveInvitationId, setActieveInvitationId] = useState<
    string | null
  >(null);
  const [kanSchrijven, setKanSchrijven] = useState(false);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [laden, setLaden] = useState(true);
  const [aantalUitnodigingen, setAantalUitnodigingen] = useState(0);
  const [ongelezen, setOngelezen] = useState(0);
  const eindRef = useRef<HTMLDivElement>(null);

  const haal = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/mini-eleva/chat-thread?prospectId=${encodeURIComponent(prospectId)}`,
      );
      if (!res.ok) {
        setLaden(false);
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        setLaden(false);
        return;
      }
      const nieuwBerichten = data.berichten ?? [];
      // Niet-eigen berichten die NA de laatst-bekende eigen-bericht zijn
      // gekomen tellen als ongelezen, ruwe heuristiek
      if (!open) {
        const eersteIndexNieuw = berichten.length;
        const nieuw = nieuwBerichten
          .slice(eersteIndexNieuw)
          .filter((b: Bericht) => b.rol !== "member").length;
        if (nieuw > 0) setOngelezen((c) => c + nieuw);
      }
      setBerichten(nieuwBerichten);
      setActieveInvitationId(data.actieveInvitationId);
      setKanSchrijven(data.kanLezenSchrijven);
    } catch {
      // negeer transient errors
    } finally {
      setLaden(false);
    }
  }, [prospectId, berichten.length, open]);

  // Initiële load + polling
  useEffect(() => {
    haal();
    const t = setInterval(haal, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [haal]);

  // Tel hoeveel uitnodigingen er voor deze prospect zijn (voor label)
  useEffect(() => {
    const ids = new Set(berichten.map((b) => b.invitation_id));
    setAantalUitnodigingen(ids.size);
  }, [berichten]);

  // Bij openen: ongelezen reset + scroll naar onderen + leeskenmerk
  // bijwerken zodat de teller op /mijn-chats reset
  useEffect(() => {
    if (open) {
      setOngelezen(0);
      setTimeout(
        () => eindRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
      // Leeskenmerk-update via API (fire-and-forget)
      fetch("/api/mini-eleva/markeer-gelezen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId }),
      }).catch(() => {
        // negeer transient errors
      });
    }
  }, [open, berichten.length, prospectId]);

  async function stuurTekst() {
    const tekst = invoer.trim();
    if (!tekst || bezig || !actieveInvitationId) return;
    setBezig(true);
    setInvoer("");
    try {
      const res = await fetch("/api/mini-eleva/bericht", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: actieveInvitationId, tekst }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Versturen mislukt");
        setInvoer(tekst);
        return;
      }
      await haal();
    } catch {
      toast.error("Verbindingsfout");
      setInvoer(tekst);
    } finally {
      setBezig(false);
    }
  }

  async function stuurSpraak(data: {
    audio_path: string;
    transcriptie: string;
    duur_seconden: number;
  }) {
    if (!actieveInvitationId) return;
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/bericht", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: actieveInvitationId,
          audio_path: data.audio_path,
          transcriptie: data.transcriptie,
          duur_seconden: data.duur_seconden,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Spraakbericht versturen mislukt");
        return;
      }
      await haal();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      stuurTekst();
    }
  }

  if (laden) return null;
  if (berichten.length === 0 && !kanSchrijven) {
    // Geen uitnodigingen + geen berichten = niets om te tonen
    return null;
  }

  return (
    <div id="mini-eleva-chat" className="card border-l-4 border-cm-gold/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
            💬 Chat met {prospectVoornaam}
            {sponsorVoornaam ? ` + ${sponsorVoornaam}` : ""}
          </h3>
          {ongelezen > 0 && !open && (
            <span className="bg-cm-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              {ongelezen} nieuw
            </span>
          )}
          {berichten.length > 0 && !open && ongelezen === 0 && (
            <span className="text-cm-white/40 text-xs">
              {berichten.length} bericht{berichten.length === 1 ? "" : "en"}
            </span>
          )}
        </div>
        <span className="text-cm-gold text-sm">{open ? "−" : "+"}</span>
      </button>

      {!open && !kanSchrijven && berichten.length > 0 && (
        <p className="text-cm-white/40 text-xs mt-1">
          Geen actieve mini-ELEVA. Maak een nieuwe uitnodiging of verleng een
          bestaande om te kunnen reageren.
        </p>
      )}

      {open && (
        <div className="mt-3 space-y-3">
          {!kanSchrijven && (
            <div className="bg-cm-surface-2/60 rounded-lg p-2 text-xs text-cm-white/60">
              Geen actieve mini-ELEVA voor {prospectVoornaam}. De chat is
              read-only — maak een nieuwe uitnodiging of verleng om te kunnen
              reageren.
            </div>
          )}

          <div className="text-[11px] text-cm-white/50">
            {aantalUitnodigingen > 1 ? (
              <>
                Berichten van alle {aantalUitnodigingen} mini-ELEVA-sessies, in
                chronologische volgorde. Reageren gaat naar de huidige actieve
                sessie.
              </>
            ) : (
              <>
                Berichten worden direct als push-melding aan {prospectVoornaam}
                {sponsorVoornaam ? ` en ${sponsorVoornaam}` : ""} gestuurd.
              </>
            )}
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pb-2">
            {berichten.length === 0 && (
              <div className="text-cm-white/50 text-xs italic text-center py-8">
                Nog geen berichten. Stuur een eerste bericht of spraakbericht.
              </div>
            )}
            {berichten.map((b) => (
              <BerichtBubbel
                key={b.id}
                bericht={b}
                isEigen={b.rol === "member"}
                prospectVoornaam={prospectVoornaam}
                sponsorVoornaam={sponsorVoornaam ?? undefined}
                invitationId={b.invitation_id}
                onTranscriptieGeupdate={haal}
              />
            ))}
            <div ref={eindRef} />
          </div>

          {kanSchrijven && actieveInvitationId && (
            <div className="border-t border-cm-white/10 pt-3 flex items-end gap-2">
              <textarea
                value={invoer}
                onChange={(e) => setInvoer(e.target.value)}
                onKeyDown={handleKey}
                disabled={bezig}
                placeholder={
                  bezig ? "Bezig..." : "Typ je bericht (Enter = sturen)"
                }
                rows={2}
                maxLength={4000}
                className="flex-1 bg-cm-surface-2 border border-cm-white/10 rounded-lg px-3 py-2 text-sm text-cm-white placeholder:text-cm-white/30 resize-none focus:outline-none focus:border-cm-gold/40 disabled:opacity-50"
              />
              <VoiceOpnameKnop
                invitationId={actieveInvitationId}
                onUploaded={stuurSpraak}
                disabled={bezig}
              />
              <button
                type="button"
                onClick={stuurTekst}
                disabled={!invoer.trim() || bezig}
                className="btn-gold text-sm whitespace-nowrap disabled:opacity-50"
              >
                Stuur
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BerichtBubbel({
  bericht,
  isEigen,
  prospectVoornaam,
  sponsorVoornaam,
  invitationId,
  onTranscriptieGeupdate,
}: {
  bericht: Bericht;
  isEigen: boolean;
  prospectVoornaam: string;
  sponsorVoornaam?: string;
  invitationId: string;
  onTranscriptieGeupdate?: () => void;
}) {
  const positie = isEigen ? "justify-end" : "justify-start";
  const kleur = isEigen
    ? "bg-cm-gold/15 border-cm-gold/30"
    : "bg-cm-surface-2 border-cm-white/10";
  const rolLabel = isEigen
    ? "Jij"
    : bericht.rol === "prospect"
      ? prospectVoornaam
      : bericht.rol === "sponsor"
        ? (sponsorVoornaam ?? "Sponsor")
        : "Member";

  return (
    <div className={`flex ${positie}`}>
      <div
        className={`border rounded-lg px-3 py-2 max-w-[85%] text-sm text-cm-white space-y-1 ${kleur}`}
      >
        <div className="text-[10px] text-cm-white/50 uppercase tracking-wider">
          {rolLabel}
        </div>
        {bericht.type === "spraak" && bericht.audio_url ? (
          <VoicePlayer
            audioUrl={bericht.audio_url}
            duurSeconden={bericht.duur_seconden}
            transcriptie={bericht.transcriptie}
            berichtId={bericht.id}
            isEigen={isEigen}
            invitationId={invitationId}
            onTranscriptieGeupdate={() => onTranscriptieGeupdate?.()}
          />
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed">
            {bericht.content}
          </div>
        )}
      </div>
    </div>
  );
}
