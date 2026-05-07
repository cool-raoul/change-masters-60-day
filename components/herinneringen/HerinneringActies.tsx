"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Afvink-knop met bevestiging. Voordat de herinnering definitief als voltooid
// wordt gemarkeerd (en dus uit de lijst verdwijnt) vragen we eerst een Ja/Nee,
// zodat één per ongeluk op het vinkje getikt niet meteen je werk opeet.
//
// SPECIAL voor product_herbestelling-herinneringen:
//   Na afvinken checken we of dit de LAATSTE openstaande herinnering
//   van dat type was voor deze prospect. Zo ja, toont een toast met
//   actie 'Ja, +30 dagen' om maandelijkse opvolging voort te zetten.
//   Klik op de actie -> nieuwe herinnering aangemaakt over 30 dagen.
//   Geen klik -> reeks stopt netjes (gebruiker bepaalt).

export function HerinneringActies({
  herinneringId,
  prospectId = null,
  herinneringType = "custom",
}: {
  herinneringId: string;
  /** Optioneel, alleen relevant voor product-herbestelling-flow. */
  prospectId?: string | null;
  /** Optioneel, default 'custom'. Activeert maandelijkse-opvolging-prompt
   *  als 'product_herbestelling' en geen openstaande meer over zijn. */
  herinneringType?: string;
}) {
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

  /**
   * Na het afvinken van een product_herbestelling-herinnering: check of dit
   * de laatste openstaande was. Zo ja, prompt voor maandelijkse opvolging.
   */
  async function checkLaatsteEnPrompt() {
    if (herinneringType !== "product_herbestelling" || !prospectId) return;

    const { data: nogOpen } = await supabase
      .from("herinneringen")
      .select("id")
      .eq("prospect_id", prospectId)
      .eq("herinnering_type", "product_herbestelling")
      .eq("voltooid", false);

    // Nog open? Dan was deze niet de laatste, geen prompt nodig.
    if (nogOpen && nogOpen.length > 0) return;

    // Pak prospectnaam voor in de tekst.
    const { data: prospect } = await supabase
      .from("prospects")
      .select("volledige_naam")
      .eq("id", prospectId)
      .single();
    const naam =
      (prospect as { volledige_naam?: string } | null)?.volledige_naam ??
      "deze persoon";

    toast.success(`Afgevinkt, dit was de laatste voor ${naam}.`, {
      description:
        "Wil je de maandelijkse productherinneringen voor deze persoon voortzetten? Of nu stoppen?",
      duration: 15000,
      action: {
        label: "Ja, +30 dagen",
        onClick: () => verlengMaandelijks(prospectId, naam),
      },
    });
  }

  async function verlengMaandelijks(pid: string, naam: string) {
    const overEenMaand = new Date();
    overEenMaand.setHours(0, 0, 0, 0);
    overEenMaand.setDate(overEenMaand.getDate() + 30);
    const isoDatum = overEenMaand.toISOString().split("T")[0];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      return;
    }

    const { error } = await supabase.from("herinneringen").insert({
      user_id: user.id,
      prospect_id: pid,
      herinnering_type: "product_herbestelling",
      titel: `Maandelijkse opvolging — ${naam}`,
      beschrijving: "Maandelijkse opvolging voor herhaalbestelling.",
      vervaldatum: isoDatum,
    });

    if (error) {
      toast.error("Aanmaken mislukt: " + error.message);
    } else {
      toast.success(
        `Nieuwe herinnering staat op ${overEenMaand.toLocaleDateString(
          "nl-NL",
          { weekday: "long", day: "numeric", month: "long" },
        )}`,
      );
      router.refresh();
    }
  }

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
      setLaden(false);
      return;
    }

    // Voor product-herbestelling: check of dit de laatste was, zo ja
    // prompt voor maandelijkse voortzetting. De gewone 'Afgevinkt' toast
    // wordt overgeslagen omdat checkLaatsteEnPrompt 'm zelf met meer
    // context al toont.
    if (herinneringType === "product_herbestelling" && prospectId) {
      await checkLaatsteEnPrompt();
    } else {
      toast.success("Afgevinkt!");
    }

    router.refresh();
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
