"use client";

// Keuzescherm voor Mijn programma: welk programma ga je zelf doen?
// Na de keuze wordt de eigen Mentor-omgeving aangemaakt (sponsor =
// begeleider, bouwer-vlag aan) en gaan we er direct heen.

import { useState } from "react";
import { useRouter } from "next/navigation";

const PROGRAMMAS = [
  {
    slug: "darm",
    titel: "🌿 Darmen in Balans",
    tekst: "16 dagen puur eten volgens het rode of blauwe schema.",
  },
  {
    slug: "reset",
    titel: "☀️ Holistic Reset",
    tekst: "De volledige reset in vier fases, van laaddagen tot logisch leven.",
  },
  {
    slug: "producten",
    titel: "🏠 Dagelijkse basis",
    tekst: "De basisproducten (het huis) als dagelijkse routine.",
  },
];

export default function ProgrammaKeuze() {
  const router = useRouter();
  const [bezig, setBezig] = useState<string | null>(null);

  async function kies(slug: string) {
    if (bezig) return;
    setBezig(slug);
    try {
      const res = await fetch("/api/resetcode/mijn-programma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programma: slug }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.token) {
        router.push(`/k/${data.token}`);
        return;
      }
      alert("Aanmaken lukte niet, probeer het zo nog eens.");
    } finally {
      setBezig(null);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 text-cm-white">
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        Mijn programma
      </p>
      <h1 className="font-serif-warm text-3xl mt-2">
        Jouw eigen programma-Mentor
      </h1>
      <p className="mt-3 text-cm-muted text-sm leading-relaxed">
        Doe jij zelf een programma? Dan krijg je hier je eigen persoonlijke
        Mentor-omgeving, net als je klanten: dagelijkse check-ins, alle
        documenten en video&apos;s, en een Mentor die je hele reis onthoudt.
        Je sponsor is jouw begeleider en krijgt de seintjes.
      </p>
      <div className="mt-6 space-y-3">
        {PROGRAMMAS.map((p) => (
          <button
            key={p.slug}
            onClick={() => kies(p.slug)}
            disabled={bezig !== null}
            className="block w-full text-left rounded-2xl border border-cm-border bg-cm-surface px-4 py-3.5 hover:border-cm-gold/50 transition-colors disabled:opacity-50"
          >
            <p className="text-[15px] font-bold">
              {bezig === p.slug ? "Even klaarzetten..." : p.titel}
            </p>
            <p className="text-xs text-cm-muted mt-1">{p.tekst}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
