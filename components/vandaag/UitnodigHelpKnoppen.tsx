"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// UitnodigHelpKnoppen, drie laagdrempelige paden voor uitnodig- en
// opener-taken.
//
// Renderd onder de taak-uitleg in vandaag-flow.tsx als de taak
// `uitnodigHelpKnoppen: true` heeft (of automatisch via id-detectie).
//
// Drie knoppen, context-bepaald via `variant` prop:
//   - variant="uitnodiging" (default): naar /scripts?cat=uitnodiging,
//     sponsor-bericht over uitnodigingen, Mentor-onderwerp=uitnodiging
//   - variant="opener": naar /scripts?cat=opener, sponsor-bericht over
//     openers, Mentor-onderwerp=opener
//
// Voor starters in week 1-2 die elke dag opnieuw moeten bedenken hoe
// een uitnodiging of opener eruitziet. Drie paden, altijd zichtbaar.
// ============================================================

export type HelpVariant = "uitnodiging" | "opener";

type SponsorInfo = {
  voornaam: string;
  telefoon: string | null;
};

function bouwWhatsAppLink(
  telefoon: string | null,
  bericht: string,
): string | null {
  if (!telefoon) return null;
  // Schoon telefoonnummer: alleen cijfers, '+' weghalen.
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  // '00xx' = internationaal-prefix, vervang door 'xx' (de landcode).
  if (nummer.startsWith("00")) nummer = nummer.substring(2);
  // Begint met '0' = Nederlandse mobiel, prefix +31.
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}?text=${encodeURIComponent(bericht)}`;
}

export function UitnodigHelpKnoppen({
  variant = "uitnodiging",
}: {
  variant?: HelpVariant;
}) {
  const [sponsor, setSponsor] = useState<SponsorInfo | null>(null);
  const isOpener = variant === "opener";

  useEffect(() => {
    let actief = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("sponsor_id")
          .eq("id", user.id)
          .maybeSingle();
        const sponsorId = (profile as { sponsor_id?: string | null } | null)
          ?.sponsor_id;
        if (!sponsorId) return;
        const { data: sponsorProfile } = await supabase
          .from("profiles")
          .select("full_name, telefoon")
          .eq("id", sponsorId)
          .maybeSingle();
        if (!sponsorProfile || !actief) return;
        const fullName = (sponsorProfile as { full_name?: string }).full_name ?? "";
        const tel = (sponsorProfile as { telefoon?: string | null }).telefoon ?? null;
        setSponsor({
          voornaam: fullName.split(" ")[0] ?? "",
          telefoon: tel,
        });
      } catch {
        // negeer, sponsor-knop wordt dan disabled
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  const sponsorBericht = sponsor
    ? isOpener
      ? `Hoi${sponsor.voornaam ? " " + sponsor.voornaam : ""}! Ik moet vandaag een paar openers (eerste berichten) versturen aan mensen uit mijn lijst. Mag ik je even bellen of appen om er samen één op te stellen voor een specifieke prospect?`
      : `Hoi${sponsor.voornaam ? " " + sponsor.voornaam : ""}! Ik moet vandaag een paar uitnodigingen versturen. Mag ik je even bellen of appen om er samen één op te stellen?`
    : "";
  // Met telefoonnummer: directe wa.me-link met nummer (opent direct
  // het juiste gesprek). Zonder telefoonnummer: wa.me/?text=... opent
  // WhatsApp met contact-picker zodat de member zelf z'n sponsor kiest.
  // In beide gevallen GEEN kopieer-stap meer, gewoon WhatsApp openen.
  const sponsorLink = bouwWhatsAppLink(sponsor?.telefoon ?? null, sponsorBericht)
    ?? `https://wa.me/?text=${encodeURIComponent(sponsorBericht)}`;

  const scriptsLink = isOpener
    ? "/scripts?cat=opener"
    : "/scripts?cat=uitnodiging";
  const mentorLink = isOpener
    ? "/coach?onderwerp=opener&prefill=Help+me+een+opener+schrijven+voor+een+specifieke+prospect"
    : "/coach?onderwerp=uitnodiging&prefill=Help+me+een+uitnodiging+schrijven";
  const titel = isOpener
    ? "✨ Hulp nodig bij je opener?"
    : "✨ Hulp nodig bij je uitnodiging?";
  const voorbeeldenLabel = isOpener ? "Voorbeeld-openers" : "Voorbeelden bekijken";

  return (
    <div className="rounded-lg border border-cm-gold/30 bg-cm-gold/5 px-4 py-3 space-y-3">
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        {titel}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Link
          href={scriptsLink}
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">📝</span>
          <span className="font-semibold">{voorbeeldenLabel}</span>
          <span className="opacity-60 text-[11px]">Snelle inspiratie</span>
        </Link>
        {/* Eén variant: altijd WhatsApp direct openen. Met telefoon →
            direct het juiste gesprek; zonder telefoon → WhatsApp's
            contact-picker met het bericht klaar. Geen kopieer-stap. */}
        <a
          href={sponsorLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">💬</span>
          <span className="font-semibold">Met je sponsor</span>
          <span className="opacity-60 text-[11px]">WhatsApp openen</span>
        </a>
        <Link
          href={mentorLink}
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">🤖</span>
          <span className="font-semibold">Met de Mentor</span>
          <span className="opacity-60 text-[11px]">AI-hulp op maat</span>
        </Link>
      </div>
    </div>
  );
}
