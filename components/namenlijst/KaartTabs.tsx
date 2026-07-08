"use client";

import { useState, type ReactNode } from "react";

// ============================================================
// Tab-schil van de NIEUWE klantenkaart (preview). Vier lades:
// Nu / Opvolgen / Notities / Gegevens. De inhoud komt als
// ReactNode-props uit de server-pagina, zodat alle bestaande
// componenten (3-weg, Mini-ELEVA, chat, notitieboekje...)
// ongewijzigd blijven werken; dit is alleen de indeling.
// Alle panelen blijven gemount (hidden i.p.v. unmount), zodat
// open chats en formulieren hun staat niet verliezen bij het
// wisselen van tab.
// ============================================================

type Props = {
  nu: ReactNode;
  opvolgen: ReactNode;
  notities: ReactNode;
  gegevens: ReactNode;
  notitiesTeller?: number;
};

const TABS = [
  { key: "nu", emoji: "📍", label: "Nu" },
  { key: "opvolgen", emoji: "💬", label: "Opvolgen" },
  { key: "notities", emoji: "📓", label: "Notities" },
  { key: "gegevens", emoji: "👤", label: "Gegevens" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function KaartTabs({ nu, opvolgen, notities, gegevens, notitiesTeller }: Props) {
  const [actief, setActief] = useState<TabKey>("nu");

  const inhoud: Record<TabKey, ReactNode> = { nu, opvolgen, notities, gegevens };

  return (
    <div>
      <div
        className="flex gap-1 border-b border-cm-border overflow-x-auto mobile-scroll"
        role="tablist"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={actief === t.key}
            onClick={() => setActief(t.key)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              actief === t.key
                ? "text-cm-gold border-cm-gold font-semibold"
                : "text-cm-white/55 border-transparent hover:text-cm-white"
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
            {t.key === "notities" && (notitiesTeller ?? 0) > 0 && (
              <span className="text-[10px] bg-cm-surface-2 border border-cm-border rounded-full px-1.5 py-0.5 leading-none">
                {notitiesTeller}
              </span>
            )}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          hidden={actief !== t.key}
          className="pt-4 space-y-4"
        >
          {inhoud[t.key]}
        </div>
      ))}
    </div>
  );
}
