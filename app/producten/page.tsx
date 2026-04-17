"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LIFEPLUS_PRODUCTEN } from "@/lib/lifeplus/producten";
import { useTaal } from "@/lib/i18n/TaalContext";

const CATEGORIE_VOLGORDE = [
  "Everyday Essentials",
  "Product Packs",
  "Proteins",
  "Sport Nutrition",
  "Superfoods",
  "Food / Snacks",
  "Skin and Body Care",
  "Natural Body Care",
  "Topical",
];

const CATEGORIE_ICOON: Record<string, string> = {
  "Everyday Essentials": "💊",
  "Product Packs": "📦",
  "Proteins": "💪",
  "Sport Nutrition": "🏋️",
  "Superfoods": "🌿",
  "Food / Snacks": "🍫",
  "Skin and Body Care": "✨",
  "Natural Body Care": "🧴",
  "Topical": "🧪",
};

export default function ProductenPagina() {
  const { v } = useTaal();
  const [zoekterm, setZoekterm] = useState("");
  const [opengeklapt, setOpengeklapt] = useState<Record<string, boolean>>({});

  const gefilterd = useMemo(() => {
    const term = zoekterm.trim().toLowerCase();
    if (!term) return LIFEPLUS_PRODUCTEN;
    return LIFEPLUS_PRODUCTEN.filter((p) => {
      if (p.naam.toLowerCase().includes(term)) return true;
      if (p.categorie.toLowerCase().includes(term)) return true;
      return p.aliases?.some((a) => a.toLowerCase().includes(term)) ?? false;
    });
  }, [zoekterm]);

  const perCategorie = useMemo(() => {
    const map: Record<string, typeof LIFEPLUS_PRODUCTEN> = {};
    for (const p of gefilterd) {
      if (!map[p.categorie]) map[p.categorie] = [];
      map[p.categorie].push(p);
    }
    return map;
  }, [gefilterd]);

  const totaalAantal = LIFEPLUS_PRODUCTEN.length;
  const zichtbaarAantal = gefilterd.length;

  function toggle(categorie: string) {
    setOpengeklapt((prev) => ({ ...prev, [categorie]: !prev[categorie] }));
  }

  function klapAllesOpen() {
    const alles: Record<string, boolean> = {};
    for (const cat of CATEGORIE_VOLGORDE) alles[cat] = true;
    setOpengeklapt(alles);
  }

  function klapAllesDicht() {
    setOpengeklapt({});
  }

  const zoekActief = zoekterm.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4"
      >
        {v("algemeen.terug")}
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Lifeplus Productcatalogus
        </h1>
        <p className="text-cm-white mt-1 opacity-70 text-sm">
          {zoekActief
            ? `${zichtbaarAantal} van ${totaalAantal} producten`
            : `${totaalAantal} producten in ${CATEGORIE_VOLGORDE.length} categorieën`}
        </p>
      </div>

      <input
        type="text"
        value={zoekterm}
        onChange={(e) => setZoekterm(e.target.value)}
        placeholder="Zoek op naam, categorie of alias..."
        className="input-cm"
      />

      <div className="flex gap-2 flex-wrap">
        <button onClick={klapAllesOpen} className="text-xs px-3 py-1.5 rounded-lg border border-cm-border text-cm-white opacity-70 hover:opacity-100">
          Alles uitklappen
        </button>
        <button onClick={klapAllesDicht} className="text-xs px-3 py-1.5 rounded-lg border border-cm-border text-cm-white opacity-70 hover:opacity-100">
          Alles dichtklappen
        </button>
      </div>

      <div className="space-y-3">
        {CATEGORIE_VOLGORDE.map((categorie) => {
          const producten = perCategorie[categorie];
          if (!producten || producten.length === 0) return null;

          const open = zoekActief ? true : !!opengeklapt[categorie];

          return (
            <div key={categorie} className="card !p-0 overflow-hidden">
              <button
                onClick={() => !zoekActief && toggle(categorie)}
                disabled={zoekActief}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-cm-surface-2 transition-colors disabled:hover:bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{CATEGORIE_ICOON[categorie] || "•"}</span>
                  <div>
                    <h2 className="text-cm-white font-semibold text-sm">{categorie}</h2>
                    <p className="text-cm-white opacity-50 text-xs">
                      {producten.length} product{producten.length === 1 ? "" : "en"}
                    </p>
                  </div>
                </div>
                {!zoekActief && (
                  <span className={`text-cm-gold transition-transform ${open ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                )}
              </button>

              {open && (
                <div className="border-t border-cm-border divide-y divide-cm-border">
                  {producten.map((p) => (
                    <div key={p.naam} className="px-4 py-3">
                      <div className="text-cm-white text-sm font-medium">{p.naam}</div>
                      {p.aliases && p.aliases.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.aliases.map((a) => (
                            <span
                              key={a}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-cm-surface-2 text-cm-white opacity-60"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {zichtbaarAantal === 0 && (
          <div className="card text-center py-12">
            <p className="text-cm-white opacity-70">Geen producten gevonden voor "{zoekterm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
