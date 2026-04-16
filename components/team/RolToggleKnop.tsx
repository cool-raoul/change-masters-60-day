"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  lidId: string;
  lidNaam: string;
  huidigeRol: "leider" | "lid";
}

export function RolToggleKnop({ lidId, lidNaam, huidigeRol }: Props) {
  const [rol, setRol] = useState(huidigeRol);
  const [bevestigen, setBevestigen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const router = useRouter();

  const isLeider = rol === "leider";
  const nieuweRol = isLeider ? "lid" : "leider";

  async function wisselRol() {
    setBezig(true);
    const res = await fetch("/api/admin/rol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: lidId, rol: nieuweRol }),
    });

    if (res.ok) {
      setRol(nieuweRol);
      toast.success(
        nieuweRol === "leider"
          ? `${lidNaam} is nu leider 👑`
          : `${lidNaam} is terug lid`
      );
      setBevestigen(false);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Mislukt");
    }
    setBezig(false);
  }

  if (bevestigen) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-cm-white opacity-60">
          {nieuweRol === "leider" ? `👑 Leider maken?` : `Terugzetten naar lid?`}
        </span>
        <button
          onClick={wisselRol}
          disabled={bezig}
          className="text-xs bg-cm-gold text-cm-black px-2 py-0.5 rounded font-semibold hover:bg-cm-gold-light transition-colors disabled:opacity-60"
        >
          {bezig ? "..." : "Ja"}
        </button>
        <button
          onClick={() => setBevestigen(false)}
          className="text-xs text-cm-white opacity-50 hover:opacity-100 transition-opacity"
        >
          Nee
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setBevestigen(true)}
      title={isLeider ? "Terugzetten naar lid" : "Leider maken"}
      className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${
        isLeider
          ? "bg-cm-gold/20 border-cm-gold/50 text-cm-gold hover:bg-cm-gold/30"
          : "bg-cm-surface border-cm-border text-cm-white opacity-50 hover:opacity-100 hover:border-cm-gold-dim"
      }`}
    >
      {isLeider ? "👑 Leider" : "Lid"}
    </button>
  );
}
