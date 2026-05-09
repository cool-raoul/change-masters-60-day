"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { VoiceOpnameKnop } from "./VoiceOpnameKnop";
import { VoicePlayer } from "./VoicePlayer";

// ============================================================
// MensChatVenster, gedeelde drie-persoonschat-UI.
//
// Eén component voor alle drie de partijen:
//   - Prospect gebruikt 'm via /m/[token]/chat (geef token-prop)
//   - Member gebruikt 'm op prospect-detail-pagina (geef invitationId)
//   - Sponsor gebruikt 'm op /sponsor/mini-eleva/[id] (geef invitationId)
//
// Functies:
//   - Berichten ophalen + tonen (tekst en spraak)
//   - Tekst-bericht versturen
//   - Spraak-bericht opnemen + uploaden + versturen
//   - Eigen rol bepaalt afgevende kleurstelling van bubbel
//
// Pollt elke 8 seconden voor nieuwe berichten. In een latere fase
// kunnen we Supabase realtime gebruiken; voor nu is polling robuust
// genoeg en werkt 'ie ook op de prospect-kant zonder Supabase-auth.
// ============================================================

type Bericht = {
  id: string;
  rol: "prospect" | "member" | "sponsor";
  type: "tekst" | "spraak";
  content: string;
  transcriptie: string | null;
  audio_url: string | null;
  duur_seconden: number | null;
  created_at: string;
};

type Props = {
  /** Voor prospect-pad. Mutually exclusive met invitationId. */
  token?: string;
  /** Voor member/sponsor-pad. Mutually exclusive met token. */
  invitationId?: string;
  /** Toon bovenaan een korte uitleg over wie er meeleest */
  uitlegregel?: string;
  /** Tonen van wie het bericht komt, voor leesbaarheid */
  rolLabels?: Partial<Record<"prospect" | "member" | "sponsor", string>>;
};

const POLL_INTERVAL_MS = 8000;

export function MensChatVenster({
  token,
  invitationId,
  uitlegregel,
  rolLabels,
}: Props) {
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [eigenRol, setEigenRol] = useState<
    "prospect" | "member" | "sponsor" | null
  >(null);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [laden, setLaden] = useState(true);
  const eindRef = useRef<HTMLDivElement>(null);

  const queryString = token
    ? `?token=${encodeURIComponent(token)}`
    : `?invitationId=${encodeURIComponent(invitationId ?? "")}`;

  const haal = useCallback(async () => {
    try {
      const res = await fetch(`/api/mini-eleva/bericht${queryString}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        setBerichten(data.berichten ?? []);
        setEigenRol(data.eigen_rol ?? null);
      }
    } catch {
      // negeer transient errors
    } finally {
      setLaden(false);
    }
  }, [queryString]);

  useEffect(() => {
    haal();
    const t = setInterval(haal, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [haal]);

  useEffect(() => {
    eindRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [berichten.length]);

  async function stuurTekst() {
    const tekst = invoer.trim();
    if (!tekst || bezig) return;
    setBezig(true);
    setInvoer("");
    try {
      const res = await fetch("/api/mini-eleva/bericht", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, invitationId, tekst }),
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
    setBezig(true);
    try {
      const res = await fetch("/api/mini-eleva/bericht", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          invitationId,
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

  return (
    <div className="flex flex-col h-full">
      {uitlegregel && (
        <div className="text-xs text-cm-white/60 leading-relaxed mb-3 bg-cm-surface-2/50 rounded-lg p-2">
          {uitlegregel}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pb-3 min-h-[300px]">
        {laden && (
          <div className="text-cm-white/40 text-xs italic px-1">
            Berichten laden...
          </div>
        )}
        {!laden && berichten.length === 0 && (
          <div className="text-cm-white/50 text-xs italic px-1 text-center py-8">
            Nog geen berichten. Start het gesprek met een eerste bericht.
          </div>
        )}
        {berichten.map((b) => (
          <BerichtBubbel
            key={b.id}
            bericht={b}
            isEigen={b.rol === eigenRol}
            label={rolLabels?.[b.rol]}
            token={token}
            invitationId={invitationId}
            onTranscriptieGeupdate={haal}
          />
        ))}
        <div ref={eindRef} />
      </div>

      <div className="border-t border-cm-white/10 pt-3 flex items-end gap-2">
        <textarea
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={handleKey}
          disabled={bezig}
          placeholder={bezig ? "Bezig..." : "Typ je bericht (Enter = sturen)"}
          rows={2}
          maxLength={4000}
          className="flex-1 bg-cm-surface-2 border border-cm-white/10 rounded-lg px-3 py-2 text-sm text-cm-white placeholder:text-cm-white/30 resize-none focus:outline-none focus:border-cm-gold/40 disabled:opacity-50"
        />
        <VoiceOpnameKnop
          token={token}
          invitationId={invitationId}
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
    </div>
  );
}

function BerichtBubbel({
  bericht,
  isEigen,
  label,
  token,
  invitationId,
  onTranscriptieGeupdate,
}: {
  bericht: Bericht;
  isEigen: boolean;
  label?: string;
  token?: string;
  invitationId?: string;
  onTranscriptieGeupdate?: () => void;
}) {
  const positie = isEigen ? "justify-end" : "justify-start";
  const kleur = isEigen
    ? "bg-cm-gold/15 border-cm-gold/30"
    : "bg-cm-surface-2 border-cm-white/10";
  const rolLabel =
    label ??
    (bericht.rol === "prospect"
      ? "Prospect"
      : bericht.rol === "member"
        ? "Member"
        : "Sponsor");

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
            token={token}
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
