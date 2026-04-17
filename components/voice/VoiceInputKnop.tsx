"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!spraak.actief) return;
    const live = (startWaardeRef.current + " " + spraak.transcript + " " + spraak.interim).trim();
    onTekst(live);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spraak.transcript, spraak.interim]);

  function klik() {
    if (spraak.actief) {
      const eind = spraak.stop();
      onTekst((startWaardeRef.current ? startWaardeRef.current + " " : "") + eind);
    } else {
      startWaardeRef.current = huidigeWaarde;
      spraak.reset();
      setTimeout(() => spraak.start(), 30);
    }
  }

  if (!spraak.ondersteund) return null;

  return (
    <button
      type="button"
      onClick={klik}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
        spraak.actief
          ? "bg-red-600 text-white animate-pulse"
          : "border border-cm-border text-cm-white opacity-70 hover:opacity-100"
      }`}
      title={spraak.actief ? "Stop opname" : "Spreek je bericht in"}
      aria-label="Microfoon"
    >
      🎙️
    </button>
  );
}
