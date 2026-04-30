"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// HerinnerLaterKnop — "snooze" voor de daily tasks.
//
// Bij klik:
//   1. Verwijder de localStorage-flag voor vandaag-flow → bij volgend
//      dashboard-bezoek deze dag word je opnieuw naar /vandaag geleid.
//   2. Maak een herinnering aan in de DB ('📋 Pak je daily tasks vandaag
//      op') zodat 'ie ook op /herinneringen + in dagelijkse push komt.
//   3. Toast bevestiging + optioneel doorsturen naar dashboard.
//
// Voor échte timed-push (bv. over 4 uur): aparte geplande-push-feature
// is nodig (parkeerd voor na pilot). Dit lost 80% van het use-case
// (member komt later vandaag terug → krijgt opnieuw de flow).
// ============================================================

type Variant = "primair" | "tekstlink";

type Props = {
  /** Welk dag-nummer hoort hierbij? Voor de localStorage-key. */
  dagNummer: number;
  /** Optionele callback na actie (bv. dashboard-redirect). */
  onKlaar?: () => void;
  /** Visuele variant: 'primair' (knop) of 'tekstlink' (subtiel). */
  variant?: Variant;
  /** Tekst op de knop. */
  label?: string;
};

export function HerinnerLaterKnop({
  dagNummer,
  onKlaar,
  variant = "tekstlink",
  label = "Herinner me later vandaag",
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [bezig, setBezig] = useState(false);

  async function handleKlik() {
    if (bezig) return;
    setBezig(true);
    try {
      // 1. localStorage-flag verwijderen zodat redirect bij volgend
      //    dashboard-bezoek opnieuw triggert.
      try {
        const datum = new Date().toISOString().split("T")[0];
        const k = `eleva-vandaag-flow-dag${dagNummer}-${datum}`;
        window.localStorage.removeItem(k);
      } catch {
        // negeer
      }

      // 2. Herinnering aanmaken zodat 'ie zichtbaar is op /herinneringen
      //    en in de dagelijkse push.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const vandaag = new Date().toISOString().split("T")[0];
        await supabase.from("herinneringen").insert({
          user_id: user.id,
          prospect_id: null,
          titel: `📋 Pak je daily tasks van dag ${dagNummer} op`,
          beschrijving:
            "Open ELEVA om je dagelijkse stappen af te ronden — we hebben je gevraagd om er later vandaag aan herinnerd te worden.",
          vervaldatum: vandaag,
          herinnering_type: "followup",
          voltooid: false,
        });
      }

      toast.success(
        "Top — we tonen je dag-flow weer zodra je terug bent op het dashboard 💪",
      );
      if (onKlaar) {
        onKlaar();
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Iets ging mis — probeer opnieuw");
    } finally {
      setBezig(false);
    }
  }

  if (variant === "primair") {
    return (
      <button
        type="button"
        onClick={handleKlik}
        disabled={bezig}
        className="btn-secondary w-full py-3 text-sm font-semibold disabled:opacity-50"
      >
        {bezig ? "..." : `⏰ ${label}`}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleKlik}
      disabled={bezig}
      className="text-cm-white opacity-60 hover:opacity-100 text-sm underline-offset-2 hover:underline disabled:opacity-30"
    >
      {bezig ? "..." : `⏰ ${label}`}
    </button>
  );
}
