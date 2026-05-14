"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AvatarFoto } from "@/components/ui/AvatarFoto";

// ============================================================
// EerstePartnerVieringTegel, eenmalige speciale tegel op /dashboard.
//
// Verschijnt zodra ?vier=eerste-partner in de URL staat OF wanneer
// de mijlpaal in de afgelopen 24 uur werd geregistreerd. Triggert
// confetti via window.dispatchEvent("eleva-celebrate") zodat de
// bestaande CelebrationLayer 'm oppakt.
//
// Drie concrete acties zonder AI-tussenkomst:
//   1. Open WhatsApp naar eerste partner (LEEG bericht)
//   2. Open WhatsApp naar eigen sponsor (LEEG bericht)
//   3. Open Audio-onderweg-Academy Skill #6
// ============================================================

type Persoon = { fullName: string; telefoon: string | null; fotoUrl: string | null };

type Props = {
  eerstePartner: Persoon | null;
  eigenSponsor: Persoon | null;
  triggerConfetti: boolean;
};

function whatsAppLink(telefoon: string | null): string | null {
  if (!telefoon) return null;
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("00")) nummer = nummer.substring(2);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}`;
}

export function EerstePartnerVieringTegel({
  eerstePartner,
  eigenSponsor,
  triggerConfetti,
}: Props) {
  const [verborgen, setVerborgen] = useState(false);

  useEffect(() => {
    if (triggerConfetti) {
      try {
        window.dispatchEvent(
          new CustomEvent("eleva-celebrate", {
            detail: { variant: "big", thema: "eerste-partner" },
          }),
        );
      } catch {
        // negeer
      }
    }
  }, [triggerConfetti]);

  if (verborgen || !eerstePartner) return null;

  const partnerWa = whatsAppLink(eerstePartner.telefoon);
  const sponsorWa = whatsAppLink(eigenSponsor?.telefoon ?? null);
  const voornaamPartner = eerstePartner.fullName.split(" ")[0];
  const voornaamSponsor = eigenSponsor?.fullName.split(" ")[0] ?? "je sponsor";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cm-gold/20 via-cm-gold/10 to-cm-surface border-2 border-cm-gold/50 px-5 py-5 space-y-4">
      <div className="flex items-start gap-4">
        <AvatarFoto naam={eerstePartner.fullName} fotoUrl={eerstePartner.fotoUrl} maat="lg" />
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-cm-gold text-xs font-bold uppercase tracking-wider">
            🎉 Mijlpaal
          </p>
          <h2 className="text-2xl font-display font-bold text-cm-white">
            Je hebt je eerste partner!
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            <strong className="text-cm-gold">{eerstePartner.fullName}</strong>{" "}
            heeft zich net onder jou aangemeld. Dit is een groot moment. Drie
            dingen om vandaag te doen — geen scripts, gewoon jij in jouw woorden.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Actie 1: bericht naar partner */}
        <div className="rounded-md bg-cm-bg/50 border border-cm-border px-3 py-2.5">
          <p className="text-cm-white text-sm font-semibold mb-1">
            1. Stuur {voornaamPartner} een hartelijk welkom-berichtje
          </p>
          <p className="text-cm-white/60 text-xs mb-2">In jouw eigen woorden</p>
          {partnerWa ? (
            <a
              href={partnerWa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-block py-1.5 px-3 text-xs font-semibold"
            >
              💬 Open WhatsApp →
            </a>
          ) : (
            <p className="text-cm-white/40 text-[11px] italic">
              📞 Telefoonnummer onbekend — neem zelf contact op
            </p>
          )}
        </div>

        {/* Actie 2: bedank eigen sponsor */}
        <div className="rounded-md bg-cm-bg/50 border border-cm-border px-3 py-2.5">
          <p className="text-cm-white text-sm font-semibold mb-1">
            2. Bedank {voornaamSponsor} — die heeft jou hier gebracht
          </p>
          <p className="text-cm-white/60 text-xs mb-2">
            Een korte, eerlijke dank-zin
          </p>
          {sponsorWa ? (
            <a
              href={sponsorWa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-block py-1.5 px-3 text-xs font-semibold"
            >
              💬 Open WhatsApp naar {voornaamSponsor} →
            </a>
          ) : (
            <p className="text-cm-white/40 text-[11px] italic">
              📞 Geen telefoonnummer van sponsor bekend
            </p>
          )}
        </div>

        {/* Actie 3: Audio-onderweg Skill #6 */}
        <div className="rounded-md bg-cm-bg/50 border border-cm-border px-3 py-2.5">
          <p className="text-cm-white text-sm font-semibold mb-1">
            3. Luister deze week Skill #6 uit de Audio-onderweg-training
          </p>
          <p className="text-cm-white/60 text-xs mb-2">
            Eric Worre's &ldquo;Helping Your New Distributor Get Started Right&rdquo;
          </p>
          <Link
            href="/academy/audio-onderweg"
            className="btn-secondary inline-block py-1.5 px-3 text-xs font-semibold"
          >
            🎧 Open Academy →
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setVerborgen(true)}
        className="text-cm-white/50 hover:text-cm-white text-xs underline-offset-2 hover:underline"
      >
        Tegel verbergen (verdwijnt automatisch na 24 uur)
      </button>
    </div>
  );
}
