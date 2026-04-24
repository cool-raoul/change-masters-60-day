"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Afvink-knop met bevestiging. Voordat de herinnering definitief als voltooid
// wordt gemarkeerd (en dus uit de lijst verdwijnt) vragen we eerst een Ja/Nee,
// zodat één per ongeluk op het vinkje getikt niet meteen je werk opeet.
export function HerinneringActies({ herinneringId }: { herinneringId: string }) {
  const [laden, setLaden] = useState(false);
  const [voltooid, setVoltooid] = useState(false);
  const [bevestigen, setBevestigen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Als je buiten het groepje klikt, de bevestiging sluiten zonder actie.
  // Voorkomt dat de knoppen eindeloos "open" blijven staan.
  useEffect(() => {
    if (!bevestigen) return;
    function buitenKlik(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setBevestigen(false);
      }
    }
    document.addEventListener("mousedown", buitenKlik);
    return () => document.removeEventListener("mousedown", buitenKlik);
  }, [bevestigen]);

  async function markeerVoltooid() {
    setLaden(true);
    setVoltooid(true);
    setBevestigen(false);
    const { error } = await supabase
      .from("herinneringen")
      .update({ voltooid: true })
      .eq("id", herinneringId);

    if (error) {
      toast.error("Kon herinnering niet markeren");
      setVoltooid(false);
    } else {
      toast.success("Afgevinkt!");
      router.refresh();
    }
    setLaden(false);
  }

  // Eenmaal voltooid: toon vast groen vinkje, geen interactie meer.
  if (voltooid) {
    return (
      <div
        className="w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 bg-green-500 border-green-500 text-white"
        title="Afgevinkt"
      >
        <span className="text-sm font-bold">✓</span>
      </div>
    );
  }

  // Bevestigen-modus: Ja (afvinken) + Nee (terug). Klein en compact zodat het
  // binnen de rij past.
  if (bevestigen) {
    return (
      <div
        ref={wrapperRef}
        className="flex items-center gap-1 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={markeerVoltooid}
          disabled={laden}
          className="text-xs font-semibold bg-green-600 hover:bg-green-500 text-white px-2 py-1.5 rounded transition-colors disabled:opacity-60"
          title="Bevestig afvinken"
        >
          Ja
        </button>
        <button
          onClick={() => setBevestigen(false)}
          disabled={laden}
          className="text-xs font-semibold text-cm-white opacity-70 hover:opacity-100 px-2 py-1.5 transition-opacity"
          title="Annuleer"
        >
          Nee
        </button>
      </div>
    );
  }

  // Normale staat: één vinkje-knop. Klik opent het bevestigings-paar.
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setBevestigen(true);
      }}
      disabled={laden}
      className="w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all border-white/60 bg-white/10 hover:border-green-400 hover:bg-green-400/20 text-white/80 hover:text-green-400"
      title="Afvinken"
    >
      <span className="text-sm font-bold">✓</span>
    </button>
  );
}
