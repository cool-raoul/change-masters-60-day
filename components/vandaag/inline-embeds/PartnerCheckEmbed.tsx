"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PartnerInfo, PartnerOverview } from "@/lib/team/partner-overview";
import { AvatarFoto } from "@/components/ui/AvatarFoto";

// ============================================================
// PartnerCheckEmbed, inline-embed in /vandaag voor sponsor-rol.
//
// Toont directe partners + 2e laag uitklap. Per directe partner:
// naam, tempo, dag, laatste login, % taken deze week. WhatsApp-knop
// opent een LEEG gesprek (geen ?text=...) — sponsor schrijft zelf.
//
// Filosofische basis (Raoul, 2026-05-14): geen AI-tussenkomst in
// team-flow. ELEVA toont waar aandacht nodig is, mens schrijft zelf.
//
// Component rendert NULL als geen directe partners gevonden, zodat
// members zonder downline geen lege stap zien.
// ============================================================

type Props = {
  opVoltooid: () => void;
  alVoltooid: boolean;
};

type TelefoonMap = Record<string, string | null>;

function urgencyKleur(p: PartnerInfo): string {
  if (p.isUrgent) return "border-amber-500/50 bg-amber-900/15";
  return "border-cm-border bg-cm-bg/40";
}

function stil(uren: number | null): string {
  if (uren === null) return "Activiteit niet gedeeld";
  if (uren < 1) return "Nog geen uur geleden ingelogd";
  if (uren < 24) return `${uren}u geleden ingelogd`;
  const dagen = Math.floor(uren / 24);
  return `${dagen} ${dagen === 1 ? "dag" : "dagen"} stil`;
}

function whatsAppLink(telefoon: string | null): string | null {
  if (!telefoon) return null;
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("00")) nummer = nummer.substring(2);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}`;
}

export function PartnerCheckEmbed({ opVoltooid, alVoltooid }: Props) {
  const [overview, setOverview] = useState<PartnerOverview | null>(null);
  const [telefoons, setTelefoons] = useState<TelefoonMap>({});
  const [laden, setLaden] = useState(true);
  const [tweedeLaagOpen, setTweedeLaagOpen] = useState(false);
  const [bevestigd, setBevestigd] = useState(alVoltooid);

  useEffect(() => {
    let actief = true;
    (async () => {
      try {
        const res = await fetch("/api/team/partner-overview");
        if (!actief) return;
        if (!res.ok) {
          setLaden(false);
          return;
        }
        const data = (await res.json()) as PartnerOverview;
        if (!actief) return;
        setOverview(data);

        // Haal telefoonnummers op voor WhatsApp-knoppen.
        // Sponsor mag alleen voor zijn directe partners het telefoonnr
        // zien (RLS op profiles staat dat toe via sponsor_id-koppeling).
        // Voor de 2e laag NIET nodig (geen WhatsApp-knop daar).
        const directeIds = data.directe.map((p) => p.userId);
        if (directeIds.length > 0) {
          const supabase = createClient();
          const { data: telRows } = await supabase
            .from("profiles")
            .select("id, telefoon")
            .in("id", directeIds);
          if (!actief) return;
          const map: TelefoonMap = {};
          for (const r of (telRows as Array<{ id: string; telefoon: string | null }> | null) ?? []) {
            map[r.id] = r.telefoon;
          }
          setTelefoons(map);
        }
      } catch {
        // negeer, render lege staat
      } finally {
        if (actief) setLaden(false);
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  // Geen partners: rendert helemaal niets. Member ziet geen lege stap.
  if (!laden && (!overview || overview.directe.length === 0)) {
    return null;
  }

  if (bevestigd) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-2">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Partner-check vandaag gedaan
        </p>
        <p className="text-cm-white opacity-80 text-xs">
          Top, je hebt je partners vandaag bewust aandacht gegeven.
        </p>
      </div>
    );
  }

  if (laden) {
    return (
      <div className="rounded-lg border-2 border-cm-border bg-cm-surface px-4 py-4">
        <p className="text-cm-white opacity-60 text-sm">Partners ophalen…</p>
      </div>
    );
  }

  const directe = overview?.directe ?? [];
  const tweedeLaag = overview?.tweedeLaag ?? [];

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-3">
      <div className="space-y-1">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          🤝 Jouw partners
        </p>
        <p className="text-cm-white/85 text-xs leading-relaxed">
          Sponsor-zijn is een MENSELIJKE rol. Geen scripts, geen AI-zinnen. ELEVA
          toont je waar aandacht nodig is. Wat je stuurt, kies je zelf, in jouw
          eigen woorden.
        </p>
      </div>

      {/* Directe partners */}
      <div className="space-y-2">
        {directe.map((p) => {
          const waLink = whatsAppLink(telefoons[p.userId] ?? null);
          return (
            <div
              key={p.userId}
              className={`rounded-md border px-3 py-2.5 space-y-1.5 ${urgencyKleur(p)}`}
            >
              <div className="flex items-start gap-3">
                <AvatarFoto naam={p.fullName} fotoUrl={p.fotoUrl} maat="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <p className="text-cm-white font-semibold text-sm">
                      {p.isUrgent && <span className="mr-1">⚠️</span>}
                      {p.fullName}
                      {p.modus && (
                        <span className="text-cm-white/50 text-[11px] font-normal ml-2">
                          · {p.modus === "sprint" ? "Sprint" : p.modus === "core" ? "Core" : "Pro"}
                        </span>
                      )}
                    </p>
                    <span className="text-cm-white/55 text-[11px] tabular-nums">
                      Dag {p.huidigeDag}
                    </span>
                  </div>
                  <p className="text-cm-white/70 text-xs mt-0.5">
                    {stil(p.laatstGezienUren)} · {p.takenVoltooidPct}% taken deze week
                  </p>
                </div>
              </div>
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-block py-1.5 px-3 text-xs font-semibold"
                >
                  💬 Stuur {p.fullName.split(" ")[0]} een bericht
                </a>
              ) : (
                <p className="text-cm-white/40 text-[11px] italic">
                  📞 Telefoonnummer niet bekend
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 2e laag uitklap */}
      {tweedeLaag.length > 0 && (
        <div className="pt-2 border-t border-cm-gold/20">
          <button
            type="button"
            onClick={() => setTweedeLaagOpen((v) => !v)}
            className="text-cm-gold/80 hover:text-cm-gold text-xs font-semibold"
          >
            {tweedeLaagOpen ? "▼" : "▶"} Indirecte downline ({tweedeLaag.length})
          </button>
          {tweedeLaagOpen && (
            <div className="space-y-1.5 mt-2">
              {tweedeLaag.map((p) => (
                <div
                  key={p.userId}
                  className="rounded-md border border-cm-border bg-cm-bg/30 px-3 py-2 flex items-start gap-2"
                >
                  <AvatarFoto naam={p.fullName} fotoUrl={p.fotoUrl} maat="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-cm-white/85 text-xs">
                      {p.isUrgent && <span className="mr-1">⚠️</span>}
                      {p.fullName}{" "}
                      <span className="text-cm-white/45">
                        via {p.viaPartnerNaam ?? "onbekend"} · dag {p.huidigeDag}
                      </span>
                    </p>
                    <p className="text-cm-white/50 text-[11px]">
                      {stil(p.laatstGezienUren)} · {p.takenVoltooidPct}% taken
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Afvink-knop */}
      <button
        type="button"
        onClick={() => {
          setBevestigd(true);
          opVoltooid();
        }}
        className="btn-gold w-full py-2.5 text-sm font-semibold"
      >
        ✓ Partner-check gedaan
      </button>
    </div>
  );
}
