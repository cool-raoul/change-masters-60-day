"use client";

import { useState } from "react";

// ============================================================
// Uitklapbare seintjes-historie per teamlid op /team: het
// volledige pushbericht altijd terug te lezen (pushes worden
// op de telefoon afgekapt). Komt via een push-klik iemand met
// ?lid=... binnen, dan staat de historie direct open.
// ============================================================

export type TeamSeintje = {
  titel: string;
  detail: string | null;
  created_at: string;
};

export function TeamSeintjesUitklap({
  seintjes,
  standaardOpen,
}: {
  seintjes: TeamSeintje[];
  standaardOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(standaardOpen));
  if (seintjes.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-cm-gold underline underline-offset-2"
      >
        {open ? "Verberg seintjes" : `📥 Seintjes teruglezen (${seintjes.length})`}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5">
          {seintjes.map((s, i) => (
            <div
              key={i}
              className="text-xs rounded-lg bg-cm-black/30 border border-cm-border px-2.5 py-1.5"
            >
              <p className="text-cm-gold font-semibold">
                🔔 {s.titel}{" "}
                <span className="text-cm-white/40 font-normal">
                  ·{" "}
                  {new Date(s.created_at).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  {new Date(s.created_at).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
              {s.detail && (
                <p className="text-cm-white/85 mt-0.5 leading-relaxed">
                  {s.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
