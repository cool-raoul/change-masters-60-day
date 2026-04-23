"use client";

import { Herinnering } from "@/lib/supabase/types";
import { HerinneringItem } from "@/components/herinneringen/HerinneringItem";
import { useTaal } from "@/lib/i18n/TaalContext";
import { useState } from "react";

interface Props {
  herinneringen: Herinnering[];
}

// Toont openstaande herinneringen die bij deze prospect horen, direct op de
// prospect-detail-kaart. Click op een item vouwt hem uit zodat je de volle
// tekst kan teruglezen en zonodig bewerken (HerinneringItem handelt dat af).
export function HerinneringenOpKaart({ herinneringen }: Props) {
  const { v } = useTaal();
  const [open, setOpen] = useState(true);

  if (!herinneringen || herinneringen.length === 0) return null;

  return (
    <div className="card space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider flex items-center gap-2">
          🔔 {v("herinneringen.titel") || "Herinneringen"}{" "}
          <span className="text-cm-gold">({herinneringen.length})</span>
        </h2>
        <span
          className={`text-cm-gold text-lg transition-transform ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="space-y-2">
          {herinneringen.map((her) => (
            <HerinneringItem
              key={her.id}
              herinnering={her}
              toonProspectLink={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
