"use client";

import { useEffect, useState } from "react";
import { waLinkNaar } from "@/lib/util/wa-nummer";

// ============================================================
// Het kijkscherm. Meldt bij openen dat er gekeken wordt (zodat de
// member dat ziet en de "je hebt 'm nog niet gezien"-mail niet
// meer gaat), toont de video en daaronder de actie-knop.
//
// Vóór het gekozen moment tonen we een rustige wachtpagina met een
// "toch nu beginnen"-knop. Tegenhouden zou raar zijn bij een opname.
// ============================================================

type Props = {
  token: string;
  begonnen: boolean;
  embed: string | null;
  duurMinuten: number;
  actieLabel: string;
  actieUitleg: string;
  alGedaan: boolean;
  memberVoornaam: string;
  memberTelefoon: string | null;
};

export function KijkScherm({
  token,
  begonnen,
  embed,
  duurMinuten,
  actieLabel,
  actieUitleg,
  alGedaan,
  memberVoornaam,
  memberTelefoon,
}: Props) {
  const [kijken, setKijken] = useState(begonnen);
  const [actieGedaan, setActieGedaan] = useState(alGedaan);
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    if (!kijken) return;
    fetch("/api/webinar/actie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, soort: "gekeken" }),
    }).catch(() => {});
  }, [kijken, token]);

  async function meldActie() {
    setBezig(true);
    try {
      await fetch("/api/webinar/actie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, soort: "actie" }),
      });
      setActieGedaan(true);
    } catch {
      // Ook zonder verbinding laten we de bevestiging zien; de
      // WhatsApp-knop hieronder werkt sowieso.
      setActieGedaan(true);
    }
    setBezig(false);
  }

  if (!kijken) {
    return (
      <div className="card space-y-4 text-center">
        <p className="text-4xl">⏳</p>
        <h2 className="text-xl font-display font-bold">
          Je moment is nog niet begonnen
        </h2>
        <p className="text-cm-white/80 text-sm leading-relaxed">
          Je krijgt vlak van tevoren een mailtje met deze link erin, dus je
          hoeft niets te onthouden. Wil je toch nu al beginnen? Dat mag gerust,
          het is een opname en hij staat gewoon klaar.
        </p>
        <button
          onClick={() => setKijken(true)}
          className="btn-gold w-full py-3 font-semibold"
        >
          Toch nu beginnen →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {embed ? (
        <div className="rounded-xl overflow-hidden bg-black border border-cm-border">
          <div className="relative aspect-video w-full">
            <iframe
              src={embed}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Masterclass"
            />
          </div>
        </div>
      ) : (
        <div className="card text-center space-y-2">
          <p className="text-3xl">🎬</p>
          <p className="text-cm-white/80 text-sm">
            De video wordt op dit moment klaargezet. Je krijgt bericht zodra
            hij er staat, je hoeft niets te doen.
          </p>
        </div>
      )}

      <p className="text-center text-cm-white/50 text-xs">
        Reken op ongeveer {duurMinuten} minuten. Kijk 'm liefst in één keer.
      </p>

      {actieGedaan ? (
        <div className="card border-2 border-emerald-500/50 text-center space-y-3">
          <p className="text-3xl">💚</p>
          <p className="text-cm-white font-semibold">
            Genoteerd, {memberVoornaam} neemt contact met je op
          </p>
          <p className="text-cm-white/70 text-sm">
            Wil je alvast iets kwijt of heb je een vraag? Stuur gerust een
            berichtje.
          </p>
          {memberTelefoon && (
            <a
              href={waLinkNaar(
                memberTelefoon,
                `Hoi ${memberVoornaam}, ik heb de masterclass gekeken en wil er graag meer over weten.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full py-3 inline-block text-center text-sm font-semibold"
            >
              💬 Stuur {memberVoornaam} een berichtje
            </a>
          )}
        </div>
      ) : (
        <div className="card border-2 border-cm-gold/40 text-center space-y-3">
          <p className="text-cm-white/85 text-sm leading-relaxed">
            {actieUitleg}
          </p>
          <button
            onClick={meldActie}
            disabled={bezig}
            className="btn-gold w-full py-3.5 font-bold disabled:opacity-50"
          >
            {bezig ? "Bezig..." : actieLabel}
          </button>
        </div>
      )}
    </div>
  );
}
