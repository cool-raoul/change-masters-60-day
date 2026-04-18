"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { gebruikSpraak } from "./gebruikSpraak";
import { useTaal } from "@/lib/i18n/TaalContext";

interface Props {
  huidigeWaarde: string;
  onTekst: (tekst: string) => void;
  maxSeconden?: number;
}

export function VoiceInputKnop({ huidigeWaarde, onTekst, maxSeconden = 120 }: Props) {
  const { taal } = useTaal();
  const spraak = gebruikSpraak({ taal, maxSeconden });
  const startWaardeRef = useRef("");
  const [bezig, setBezig] = useState(false);

  async function klik() {
    if (bezig) return;
    if (spraak.actief) {
      setBezig(true);
      const { tekst, fout } = await spraak.stop();
      setBezig(false);
      if (fout) {
        toast.error(fout);
        return;
      }
      if (!tekst) return;
      onTekst((startWaardeRef.current ? startWaardeRef.current + " " : "") + tekst);
    } else {
      startWaardeRef.current = huidigeWaarde;
      spraak.reset();
      setTimeout(() => spraak.start(), 30);
    }
  }

  if (!spraak.ondersteund) return null;

  const aanHet = spraak.actief || bezig;

  return (
    <button
      type="button"
      onClick={klik}
      disabled={bezig}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
        aanHet
          ? "bg-red-600 text-white animate-pulse"
          : "border border-cm-border text-cm-white opacity-70 hover:opacity-100"
      } ${bezig ? "cursor-wait opacity-60" : ""}`}
      title={spraak.actief ? "Stop opname" : bezig ? "Bezig met omzetten..." : "Spreek je bericht in"}
      aria-label="Microfoon"
    >
      {bezig ? "⏳" : "🎙️"}
    </button>
  );
}
