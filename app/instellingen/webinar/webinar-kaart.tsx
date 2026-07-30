"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Webinar, Bestellink } from "@/lib/webinar/data";

// ============================================================
// Eén webinar-blok. Voor iedereen: je deel-link, je eigen
// bestellinks en je aanmeldingen. Voor de founder ook de
// instellingen (video, teksten, aan/uit).
// ============================================================

type Props = {
  webinar: Webinar;
  url: string;
  bestellinks: Bestellink[];
  inschrijvingen: {
    id: string;
    naam: string;
    slot_start: string;
    status: string;
  }[];
  isFounder: boolean;
};

export function WebinarKaart({
  webinar,
  url,
  bestellinks,
  inschrijvingen,
  isFounder,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(!webinar.actief && isFounder);
  const [instellingenOpen, setInstellingenOpen] = useState(false);
  const [w, setW] = useState(webinar);
  const [links, setLinks] = useState<
    { id?: string; label: string; url: string }[]
  >(bestellinks.length > 0 ? bestellinks : [{ label: "", url: "" }]);
  const [bezig, setBezig] = useState(false);

  const bericht = `Ik zag een webinar over ${w.titel} en moest aan je denken. Het is een opname van ongeveer ${w.duur_minuten} minuten, dus je kiest zelf wanneer je kijkt. Helemaal vrijblijvend, als het niets voor je is is dat ook prima: ${url}`;

  async function kopieer(tekst: string, wat: string) {
    try {
      await navigator.clipboard.writeText(tekst);
      toast.success(`${wat} gekopieerd`);
    } catch {
      toast.error("Kopiëren lukte niet");
    }
  }

  async function bewaarInstellingen() {
    setBezig(true);
    try {
      const res = await fetch("/api/webinar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...w, actie: "opslaan", id: w.id }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        toast.error(d?.error ?? "Opslaan mislukt");
      } else {
        toast.success("Opgeslagen");
        router.refresh();
      }
    } catch {
      toast.error("Geen verbinding");
    }
    setBezig(false);
  }

  async function bewaarBestellinks() {
    setBezig(true);
    try {
      const res = await fetch("/api/webinar/bestellinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webinarId: w.id,
          links: links.filter((l) => l.label.trim() && l.url.trim()),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        toast.error(d?.error ?? "Opslaan mislukt");
      } else {
        toast.success("Bestellinks opgeslagen");
        router.refresh();
      }
    } catch {
      toast.error("Geen verbinding");
    }
    setBezig(false);
  }

  return (
    <div className="card space-y-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h2 className="text-cm-white font-semibold leading-snug">
            {w.titel}
          </h2>
          <p className="text-cm-white/50 text-xs mt-0.5">
            {w.actief ? "Staat open voor het team" : "Concept, nog niet zichtbaar"}
            {inschrijvingen.length > 0 &&
              ` · ${inschrijvingen.length} aanmelding${inschrijvingen.length === 1 ? "" : "en"}`}
          </p>
        </div>
        <span className="text-cm-gold text-sm whitespace-nowrap">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 pt-1">
          {/* Deel-link */}
          <div className="space-y-2">
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Jouw persoonlijke link
            </p>
            <div className="bg-cm-surface-2 rounded-lg px-3 py-2 break-all text-cm-white text-xs">
              {url}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => kopieer(url, "Link")}
                className="btn-gold px-3 py-2 text-xs font-semibold"
              >
                Kopieer link
              </button>
              <button
                onClick={() => kopieer(bericht, "Uitnodiging")}
                className="btn-secondary px-3 py-2 text-xs font-semibold"
              >
                Kopieer uitnodiging
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(bericht)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-3 py-2 text-xs font-semibold"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Eigen bestellinks */}
          <div className="space-y-2">
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Jouw bestellinks onder dit webinar
            </p>
            <p className="text-cm-white/60 text-xs leading-relaxed">
              Deze verschijnen onder de video, zodat kijkers direct bij jou
              kunnen bestellen. Laat je ze leeg, dan staat er ook niets.
            </p>
            {links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input-cm flex-1 text-sm"
                  placeholder="Naam van het product"
                  value={l.label}
                  onChange={(e) =>
                    setLinks((v) =>
                      v.map((x, j) =>
                        j === i ? { ...x, label: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  className="input-cm flex-1 text-sm"
                  placeholder="https://..."
                  value={l.url}
                  onChange={(e) =>
                    setLinks((v) =>
                      v.map((x, j) =>
                        j === i ? { ...x, url: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  onClick={() =>
                    setLinks((v) =>
                      v.length === 1
                        ? [{ label: "", url: "" }]
                        : v.filter((_, j) => j !== i),
                    )
                  }
                  className="text-cm-white/40 hover:text-red-300 px-1"
                  title="Weghalen"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setLinks((v) => [...v, { label: "", url: "" }])
                }
                className="btn-secondary px-3 py-2 text-xs font-semibold"
              >
                ＋ Nog een link
              </button>
              <button
                onClick={bewaarBestellinks}
                disabled={bezig}
                className="btn-gold px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                Bestellinks opslaan
              </button>
            </div>
          </div>

          {/* Aanmeldingen */}
          <div className="space-y-2">
            <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
              Aanmeldingen
            </p>
            {inschrijvingen.length === 0 ? (
              <p className="text-cm-white/50 text-xs">
                Nog niemand. Deel je link en ze verschijnen hier.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {inschrijvingen.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between gap-3 text-xs border-b border-cm-border pb-1.5"
                  >
                    <div className="min-w-0">
                      <p className="text-cm-white truncate">{i.naam}</p>
                      <p className="text-cm-white/45">
                        {new Intl.DateTimeFormat("nl-NL", {
                          timeZone: "Europe/Amsterdam",
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(i.slot_start))}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full whitespace-nowrap ${
                        i.status === "actie"
                          ? "bg-emerald-900/40 text-emerald-300"
                          : i.status === "gekeken"
                            ? "bg-cm-gold/15 text-cm-gold"
                            : "bg-cm-surface text-cm-white/60"
                      }`}
                    >
                      {i.status === "actie"
                        ? "wil meer weten"
                        : i.status === "gekeken"
                          ? "heeft gekeken"
                          : "aangemeld"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Founder-instellingen */}
          {isFounder && (
            <div className="rounded-lg border border-purple-500/40 bg-purple-950/20 p-3 space-y-3">
              <button
                onClick={() => setInstellingenOpen((v) => !v)}
                className="w-full text-left text-purple-300 text-xs font-semibold uppercase tracking-wider"
              >
                👑 Founder, dit webinar instellen {instellingenOpen ? "▲" : "▼"}
              </button>

              {instellingenOpen && (
                <div className="space-y-3">
                  <Veld
                    label="Titel"
                    waarde={w.titel}
                    zet={(v) => setW({ ...w, titel: v })}
                  />
                  <Veld
                    label="Ondertitel"
                    waarde={w.ondertitel}
                    zet={(v) => setW({ ...w, ondertitel: v })}
                  />
                  <Veld
                    label="Video-URL (Vimeo of YouTube)"
                    waarde={w.video_url ?? ""}
                    zet={(v) => setW({ ...w, video_url: v })}
                    placeholder="https://vimeo.com/..."
                  />
                  <div className="space-y-1">
                    <label className="text-xs text-cm-white/80">
                      Duur in minuten
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      className="input-cm w-full text-sm"
                      value={w.duur_minuten}
                      onChange={(e) =>
                        setW({ ...w, duur_minuten: Number(e.target.value) })
                      }
                    />
                  </div>
                  <VeldGroot
                    label="Intro-tekst op de aanmeldpagina"
                    waarde={w.intro_tekst ?? ""}
                    zet={(v) => setW({ ...w, intro_tekst: v })}
                  />
                  <Veld
                    label="Tekst op de actie-knop"
                    waarde={w.actie_label}
                    zet={(v) => setW({ ...w, actie_label: v })}
                  />
                  <VeldGroot
                    label="Zinnetje boven de actie-knop"
                    waarde={w.actie_uitleg ?? ""}
                    zet={(v) => setW({ ...w, actie_uitleg: v })}
                    rows={3}
                  />
                  <VeldGroot
                    label="Zinnetje boven de bestellinks"
                    waarde={w.bestellink_uitleg ?? ""}
                    zet={(v) => setW({ ...w, bestellink_uitleg: v })}
                    rows={2}
                  />
                  <label className="flex items-center gap-3 text-xs text-cm-white/85">
                    <input
                      type="checkbox"
                      checked={w.actief}
                      onChange={(e) => setW({ ...w, actief: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Vrijgeven aan het team (uit = alleen jij ziet 'm)
                  </label>
                  <button
                    onClick={bewaarInstellingen}
                    disabled={bezig}
                    className="btn-gold w-full py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {bezig ? "Bezig..." : "Opslaan"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Veld({
  label,
  waarde,
  zet,
  placeholder,
}: {
  label: string;
  waarde: string;
  zet: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-cm-white/80">{label}</label>
      <input
        className="input-cm w-full text-sm"
        value={waarde}
        placeholder={placeholder}
        onChange={(e) => zet(e.target.value)}
      />
    </div>
  );
}

function VeldGroot({
  label,
  waarde,
  zet,
  rows = 4,
}: {
  label: string;
  waarde: string;
  zet: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-cm-white/80">{label}</label>
      <textarea
        className="input-cm w-full text-sm"
        rows={rows}
        value={waarde}
        onChange={(e) => zet(e.target.value)}
      />
    </div>
  );
}
