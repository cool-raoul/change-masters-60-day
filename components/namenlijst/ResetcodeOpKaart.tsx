"use client";

// ============================================================
// Resetcode-omgeving op de klantenkaart: zie in één oogopslag
// waar deze klant in het programma zit, deel de persoonlijke
// link (direct naar het WhatsApp-nummer van de kaart) of maak
// er hier eentje aan. Koppelt via prospect_id, dus de link
// hoort echt bij deze kaart.
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { waLinkNaar } from "@/lib/util/wa-nummer";
import { RESET_PROGRAMMAS, stationVoor } from "@/lib/resetcode/programma";

type LinkRij = {
  id: string;
  token: string;
  programma: "darm" | "reset" | "producten";
  station_slug: string | null;
  status: "actief" | "gepauzeerd" | "gesloten";
  laatste_activiteit: string;
};

type SeintjeRij = {
  titel: string;
  detail: string | null;
  created_at: string;
};

export function ResetcodeOpKaart({
  prospectId,
  voornaam,
  telefoon,
  links,
  seintjes = [],
  pipelineFase,
}: {
  prospectId: string;
  voornaam: string;
  telefoon: string | null;
  links: LinkRij[];
  seintjes?: SeintjeRij[];
  pipelineFase?: string | null;
}) {
  const router = useRouter();
  const [programma, setProgramma] = useState("darm");
  const [isBouwer, setIsBouwer] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [gekopieerd, setGekopieerd] = useState<string | null>(null);

  const actieveLinks = links.filter((l) => l.status !== "gesloten");

  function urlVoor(token: string) {
    return `${window.location.origin}/k/${token}`;
  }

  async function maakLink() {
    if (bezig) return;
    setBezig(true);
    try {
      const res = await fetch("/api/resetcode/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, programma, isBouwer }),
      });
      if (!res.ok) alert(await res.text());
      router.refresh();
    } finally {
      setBezig(false);
    }
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
    <div className="card">
      <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
        🌿 Resetcode-omgeving
      </h3>

      {actieveLinks.length === 0 ? (
        <>
          {(pipelineFase === "shopper" || pipelineFase === "member") && (
            <p className="mb-2 rounded-lg border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-xs text-amber-300 leading-relaxed">
              💡 {voornaam} is klant: dit is hét moment voor de persoonlijke
              omgeving met eigen Mentor.
            </p>
          )}
          <p className="text-cm-muted text-xs leading-relaxed mb-3">
            Geef {voornaam} een persoonlijke omgeving met eigen Mentor. Kies
            het programma dat jullie samen hebben afgesproken.
          </p>
          <div className="flex gap-2">
            <select
              value={programma}
              onChange={(e) => setProgramma(e.target.value)}
              className="flex-1 rounded-lg border border-cm-border bg-cm-black px-3 py-2 text-sm text-cm-white focus:outline-none"
            >
              <option value="darm">🌿 Darmen in Balans</option>
              <option value="reset">☀️ Holistic Reset</option>
              <option value="producten">🏠 Dagelijkse basis</option>
            </select>
            <button
              onClick={maakLink}
              disabled={bezig}
              className="rounded-lg bg-cm-gold text-cm-bg px-4 py-2 text-sm font-bold disabled:opacity-40"
            >
              {bezig ? "..." : "Maak link"}
            </button>
          </div>
          <label className="mt-2 flex items-start gap-2 text-xs text-cm-muted cursor-pointer">
            <input
              type="checkbox"
              checked={isBouwer}
              onChange={(e) => setIsBouwer(e.target.checked)}
              className="mt-0.5"
            />
            Bouwt zelf al mee aan de business (de Mentor laat het
            webshop-verhaal dan helemaal weg)
          </label>
        </>
      ) : (
        <div className="space-y-3">
          {actieveLinks.map((l) => {
            const prog = RESET_PROGRAMMAS.find((x) => x.slug === l.programma);
            const st = l.station_slug
              ? stationVoor(l.programma, l.station_slug)
              : null;
            return (
              <div key={l.id}>
                <p className="text-sm text-cm-white font-semibold">
                  {prog?.emoji} {prog?.naam ?? l.programma}
                  {l.status === "gepauzeerd" && (
                    <span className="text-amber-400 text-[11px] font-semibold ml-2">
                      ⏸ gepauzeerd
                    </span>
                  )}
                </p>
                <p className="text-xs text-cm-muted mt-0.5">
                  {st
                    ? `Nu bij: ${st.emoji} ${st.naam} (stap ${st.nummer} van ${prog?.stations.length ?? "?"})`
                    : "Link nog niet geopend"}
                  {" · laatst actief "}
                  {new Date(l.laatste_activiteit).toLocaleDateString("nl-NL")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={waLinkNaar(
                      telefoon,
                      `Hoi ${voornaam}! Hier is jouw persoonlijke omgeving met je eigen Mentor, alles voor jouw programma op één plek: ${typeof window !== "undefined" ? urlVoor(l.token) : ""}`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full px-3.5 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    📱 Stuur naar {voornaam}
                  </a>
                  <button
                    onClick={() => kopieer(l.token)}
                    className="rounded-full border border-cm-border px-3.5 py-1.5 text-xs font-semibold text-cm-white/80 hover:text-cm-white"
                  >
                    {gekopieerd === l.token ? "✓ Gekopieerd" : "🔗 Kopieer"}
                  </button>
                </div>
              </div>
            );
          })}
          {seintjes.length > 0 && (
            <div className="rounded-xl bg-cm-black/40 border border-cm-border px-3 py-2.5">
              <p className="text-[11px] font-bold text-cm-gold mb-1.5">
                🔔 Laatste seintjes
              </p>
              <div className="space-y-1.5">
                {seintjes.map((s, i) => (
                  <div key={i}>
                    <p className="text-xs text-cm-white/90 font-semibold">
                      {s.titel}
                      <span className="text-cm-muted font-normal ml-1.5">
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
                      <p className="text-[11px] text-cm-muted leading-snug">
                        {s.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-[11px] text-cm-muted">
            Het gesprek met de Mentor is privé tussen {voornaam} en de
            Mentor; jij krijgt automatisch een seintje op de momenten die
            ertoe doen. Beheer doe je bij{" "}
            <a href="/resetcode-links" className="text-cm-gold hover:underline">
              Mijn klanten
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
