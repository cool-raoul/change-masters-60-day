"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// UitnodigHelpKnoppen, drie laagdrempelige paden voor uitnodig-taken.
//
// Renderd onder de taak-uitleg in vandaag-flow.tsx als de taak
// `uitnodigHelpKnoppen: true` heeft (of automatisch via id-detectie).
//
// Drie knoppen:
//   1. Voorbeelden bekijken (naar /scripts?cat=uitnodiging direct)
//   2. Met je sponsor (opent WhatsApp met bericht aan sponsor)
//   3. Met de Mentor (naar /coach met onderwerp-prefill voor uitnodiging)
//
// Voor starters in week 1-2 die elke dag opnieuw moeten bedenken hoe
// een uitnodiging eruitziet. Drie paden, altijd zichtbaar.
// ============================================================

type SponsorInfo = {
  voornaam: string;
  telefoon: string | null;
};

function bouwWhatsAppLink(
  telefoon: string | null,
  bericht: string,
): string | null {
  if (!telefoon) return null;
  // Schoon telefoonnummer: alleen cijfers, eerste 0 vervangen door 31
  // (Nederlandse default), '+' weghalen.
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}?text=${encodeURIComponent(bericht)}`;
}

export function UitnodigHelpKnoppen() {
  const [sponsor, setSponsor] = useState<SponsorInfo | null>(null);

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
    ? `Hoi${sponsor.voornaam ? " " + sponsor.voornaam : ""}! Ik moet vandaag een paar uitnodigingen versturen. Mag ik je even bellen of appen om er samen één op te stellen?`
    : "";
  const sponsorLink = bouwWhatsAppLink(sponsor?.telefoon ?? null, sponsorBericht);

  return (
    <div className="rounded-lg border border-cm-gold/30 bg-cm-gold/5 px-4 py-3 space-y-3">
      <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
        ✨ Hulp nodig bij je uitnodiging?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Link
          href="/scripts?cat=uitnodiging"
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">📝</span>
          <span className="font-semibold">Voorbeelden bekijken</span>
          <span className="opacity-60 text-[11px]">Snelle inspiratie</span>
        </Link>
        {sponsorLink ? (
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
        ) : (
          <Link
            href="/team"
            className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="font-semibold">Met je sponsor</span>
            <span className="opacity-60 text-[11px]">Sponsor-pagina</span>
          </Link>
        )}
        <Link
          href="/coach?onderwerp=uitnodiging&prefill=Help+me+een+uitnodiging+schrijven"
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
