"use client";

// ============================================================
// Member-kant: Resetcode-klant-links aanmaken, delen en beheren.
// Elke link = één klant met eigen programma, eigen Mentor en
// meereizend geheugen. Delen gaat via kopiëren of WhatsApp.
// ============================================================

import { useEffect, useState } from "react";
import { waLinkNaar } from "@/lib/util/wa-nummer";

type LinkRij = {
  id: string;
  token: string;
  klant_naam: string;
  programma: "darm" | "reset" | "producten";
  station_slug: string | null;
  status: "actief" | "gepauzeerd" | "gesloten";
  laatste_activiteit: string;
  created_at: string;
};

const PROGRAMMA_LABEL: Record<string, string> = {
  darm: "🌿 Darmen in Balans",
  reset: "☀️ Holistic Reset",
  producten: "🏠 Dagelijkse basis",
};

export default function LinksBeheer() {
  const [links, setLinks] = useState<LinkRij[]>([]);
  const [naam, setNaam] = useState("");
  const [programma, setProgramma] = useState("darm");
  const [bezig, setBezig] = useState(false);
  const [gekopieerd, setGekopieerd] = useState<string | null>(null);

  async function laad() {
    const res = await fetch("/api/resetcode/links");
    const data = await res.json().catch(() => null);
    if (data?.ok) setLinks(data.links);
  }
  useEffect(() => {
    laad();
  }, []);

  function urlVoor(token: string) {
    return `${window.location.origin}/k/${token}`;
  }

  async function maakLink() {
    if (!naam.trim() || bezig) return;
    setBezig(true);
    try {
      const res = await fetch("/api/resetcode/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam: naam.trim(), programma }),
      });
      if (res.ok) {
        setNaam("");
        await laad();
      } else {
        alert(await res.text());
      }
    } finally {
      setBezig(false);
    }
  }

  async function zetStatus(id: string, status: string) {
    await fetch("/api/resetcode/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await laad();
  }

  async function kopieer(token: string) {
    try {
      await navigator.clipboard.writeText(urlVoor(token));
      setGekopieerd(token);
      setTimeout(() => setGekopieerd(null), 2000);
    } catch {
      prompt("Kopieer de link:", urlVoor(token));
    }
  }

  return (
    <div>
      {/* Nieuwe link */}
      <div className="card mb-6">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
          ➕ Nieuwe klant-link
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="Naam van je klant"
            className="flex-1 rounded-lg border border-cm-border bg-transparent px-3 py-2.5 text-sm text-cm-white placeholder:text-cm-muted focus:outline-none focus:border-cm-gold/60"
          />
          <select
            value={programma}
            onChange={(e) => setProgramma(e.target.value)}
            className="rounded-lg border border-cm-border bg-cm-black px-3 py-2.5 text-sm text-cm-white focus:outline-none"
          >
            <option value="darm">🌿 Darmen in Balans</option>
            <option value="reset">☀️ Holistic Reset</option>
            <option value="producten">🏠 Dagelijkse basis</option>
          </select>
          <button
            onClick={maakLink}
            disabled={bezig || !naam.trim()}
            className="rounded-lg bg-cm-gold text-cm-bg px-5 py-2.5 text-sm font-bold disabled:opacity-40"
          >
            Maak link
          </button>
        </div>
        <p className="text-cm-muted text-xs mt-2">
          Jij kiest het programma samen met je klant; de link zet de Mentor
          meteen in de juiste stand.
        </p>
      </div>

      {/* Bestaande links */}
      <div className="space-y-2">
        {links.length === 0 && (
          <p className="text-cm-muted text-sm italic">
            Nog geen klant-links. Maak er hierboven een en deel &apos;m via
            WhatsApp.
          </p>
        )}
        {links.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <span className="text-cm-white font-semibold text-base">
                  {l.klant_naam}
                </span>
                <span className="text-cm-muted text-xs ml-2">
                  {PROGRAMMA_LABEL[l.programma]}
                </span>
              </div>
              <span
                className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${
                  l.status === "actief"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : l.status === "gepauzeerd"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-white/10 text-cm-muted"
                }`}
              >
                {l.status}
              </span>
            </div>
            <p className="text-cm-muted text-xs mt-1">
              {l.station_slug
                ? `Bezig · huidige stap: ${l.station_slug}`
                : "Nog niet geopend"}
              {" · laatst actief "}
              {new Date(l.laatste_activiteit).toLocaleDateString("nl-NL")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => kopieer(l.token)}
                className="rounded-full border border-cm-border px-3.5 py-1.5 text-xs font-semibold text-cm-white/80 hover:text-cm-white"
              >
                {gekopieerd === l.token ? "✓ Gekopieerd" : "🔗 Kopieer link"}
              </button>
              <a
                href={waLinkNaar(
                  null,
                  `Hoi ${l.klant_naam.split(" ")[0]}! Hier is jouw persoonlijke omgeving met je eigen Mentor, alles voor jouw programma op één plek: ${typeof window !== "undefined" ? urlVoor(l.token) : ""}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                📱 Deel via WhatsApp
              </a>
              {l.status === "actief" ? (
                <button
                  onClick={() => zetStatus(l.id, "gepauzeerd")}
                  className="rounded-full border border-amber-500/40 px-3.5 py-1.5 text-xs font-semibold text-amber-400"
                >
                  ⏸ Pauzeer
                </button>
              ) : l.status === "gepauzeerd" ? (
                <button
                  onClick={() => zetStatus(l.id, "actief")}
                  className="rounded-full border border-emerald-500/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-400"
                >
                  ▶️ Activeer
                </button>
              ) : null}
              {l.status !== "gesloten" && (
                <button
                  onClick={() => {
                    if (confirm(`Link van ${l.klant_naam} sluiten?`))
                      zetStatus(l.id, "gesloten");
                  }}
                  className="rounded-full border border-rose-500/40 px-3.5 py-1.5 text-xs font-semibold text-rose-400"
                >
                  Sluit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
