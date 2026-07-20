"use client";

// ============================================================
// Member-kant: Resetcode-klant-links aanmaken, delen en beheren.
// Elke link = één klant met eigen programma, eigen Mentor en
// meereizend geheugen. Delen gaat via kopiëren of WhatsApp.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { waLinkNaar } from "@/lib/util/wa-nummer";

type ProspectSuggestie = {
  id: string;
  naam: string;
  telefoon: string | null;
  fase: string | null;
};

type LinkRij = {
  id: string;
  token: string;
  klant_naam: string;
  programma: "darm" | "reset" | "producten";
  station_slug: string | null;
  status: "actief" | "gepauzeerd" | "gesloten";
  laatste_activiteit: string;
  created_at: string;
  laatste_seintje?: {
    titel: string;
    detail: string | null;
    created_at: string;
  } | null;
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
  const [isBouwer, setIsBouwer] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [gekopieerd, setGekopieerd] = useState<string | null>(null);
  // Live-zoeken in de eigen namenlijst: gekozen kaart = automatische
  // koppeling (seintjes en voortgang landen dan op de juiste kaart).
  const [suggesties, setSuggesties] = useState<ProspectSuggestie[]>([]);
  const [gekozenProspect, setGekozenProspect] =
    useState<ProspectSuggestie | null>(null);
  const [toonSuggesties, setToonSuggesties] = useState(false);
  const zoekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function bijNaamWijziging(waarde: string) {
    setNaam(waarde);
    setGekozenProspect(null);
    if (zoekTimer.current) clearTimeout(zoekTimer.current);
    if (!waarde.trim()) {
      setSuggesties([]);
      setToonSuggesties(false);
      return;
    }
    zoekTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/resetcode/prospects?q=${encodeURIComponent(waarde.trim())}`,
        );
        const data = await res.json().catch(() => null);
        if (data?.ok) {
          setSuggesties(data.prospects);
          setToonSuggesties(true);
        }
      } catch {
        /* zoeken mag stil falen */
      }
    }, 250);
  }

  function kiesSuggestie(s: ProspectSuggestie) {
    setNaam(s.naam);
    setGekozenProspect(s);
    setToonSuggesties(false);
  }

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
        body: JSON.stringify({
          naam: naam.trim(),
          programma,
          isBouwer,
          prospectId: gekozenProspect?.id ?? null,
        }),
      });
      if (res.ok) {
        setNaam("");
        setIsBouwer(false);
        setGekozenProspect(null);
        setSuggesties([]);
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
          <div className="relative flex-1">
            <input
              value={naam}
              onChange={(e) => bijNaamWijziging(e.target.value)}
              onFocus={() => suggesties.length > 0 && setToonSuggesties(true)}
              onBlur={() => setTimeout(() => setToonSuggesties(false), 200)}
              placeholder="Naam van je klant (zoekt mee in je namenlijst)"
              className="w-full rounded-lg border border-cm-border bg-transparent px-3 py-2.5 text-sm text-cm-white placeholder:text-cm-muted focus:outline-none focus:border-cm-gold/60"
            />
            {toonSuggesties && suggesties.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-cm-border bg-cm-black shadow-xl overflow-hidden">
                {suggesties.map((s) => (
                  <button
                    key={s.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      kiesSuggestie(s);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-cm-white hover:bg-white/10"
                  >
                    👥 {s.naam}
                    {s.fase && (
                      <span className="text-cm-muted text-xs ml-2">
                        {s.fase}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {gekozenProspect ? (
              <p className="mt-1 text-[11px] text-emerald-400">
                ✓ Gekoppeld aan de kaart van {gekozenProspect.naam} in je
                namenlijst
              </p>
            ) : naam.trim().length > 1 && !toonSuggesties ? (
              <p className="mt-1 text-[11px] text-cm-muted">
                Nieuwe naam (nog niet in je namenlijst)
              </p>
            ) : null}
          </div>
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
        <label className="mt-2.5 flex items-start gap-2 text-xs text-cm-muted cursor-pointer">
          <input
            type="checkbox"
            checked={isBouwer}
            onChange={(e) => setIsBouwer(e.target.checked)}
            className="mt-0.5"
          />
          Bouwt zelf al mee aan de business (de Mentor laat het
          webshop-verhaal dan helemaal weg)
        </label>
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
            {l.laatste_seintje && (
              <p className="text-xs mt-1.5 rounded-lg bg-cm-black/40 border border-cm-border px-2.5 py-1.5">
                <span className="text-cm-gold font-semibold">
                  🔔 {l.laatste_seintje.titel}
                </span>
                {l.laatste_seintje.detail && (
                  <span className="text-cm-muted"> — {l.laatste_seintje.detail}</span>
                )}
              </p>
            )}
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
