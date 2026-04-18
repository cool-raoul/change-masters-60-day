"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Props {
  label?: string;
  className?: string;
}

// Client-component knop die een Stripe Checkout Session start en de gebruiker
// naar de Stripe-hosted betaalpagina redirect.
export function UpgradeKnop({ label = "Upgrade naar Premium →", className }: Props) {
  const [bezig, setBezig] = useState(false);

  async function startCheckout() {
    setBezig(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.fout || "Kon checkout niet starten");
        setBezig(false);
        return;
      }
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.message || "Er ging iets mis");
      setBezig(false);
    }
  }

  return (
    <button
      onClick={startCheckout}
      disabled={bezig}
      className={className ?? "btn-gold w-full py-3 font-bold disabled:opacity-60"}
    >
      {bezig ? "Bezig met doorsturen..." : label}
    </button>
  );
}
